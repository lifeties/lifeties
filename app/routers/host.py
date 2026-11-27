"""혼주·상주 화면: 본인인증, 정산계좌 1원 인증, 행사 등록, 결제 현황, 정산 신청, 행사 취소, 반환 동의."""
from datetime import date, datetime

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, UPLOAD_DIR
from ..db import get_db
from ..models import Event, Gift, Inquiry, User, Venue
from ..services import core, providers
from ..services.settings import load_all
from ..web import flash, redirect, render

router = APIRouter(prefix="/host")


def current(request: Request, db: Session) -> User | None:
    uid = request.session.get("host_id")
    return db.get(User, uid) if uid else None


@router.get("/login", response_class=HTMLResponse)
def login_form(request: Request):
    return render(request, "host/login.html")


@router.post("/login")
def login(request: Request, db: Session = Depends(get_db), name: str = Form(...),
          birth: str = Form(...), phone: str = Form(...), agree: bool = Form(False)):
    if not agree:
        flash(request, "개인정보 수집·이용에 동의해 주세요.", "err")
        return redirect("/host/login")
    if len(birth) != 8 or not birth.isdigit():
        flash(request, "생년월일 8자리(YYYYMMDD)를 입력해 주세요.", "err")
        return redirect("/host/login")
    ci = providers.identity_verify(name, birth, phone)
    u = db.scalar(select(User).where(User.ci == ci))
    if not u:
        u = User(name=name.strip(), birth=birth, phone=providers.phone_norm(phone), ci=ci)
        db.add(u)
        core.audit(db, "system", "host.joined", "", core.mask_name(name))
        db.commit()
    request.session["host_id"] = u.id
    return redirect("/host")


@router.get("/logout")
def logout(request: Request):
    request.session.pop("host_id", None)
    return redirect("/")


@router.get("", response_class=HTMLResponse)
def dashboard(request: Request, db: Session = Depends(get_db)):
    u = current(request, db)
    if not u:
        return redirect("/host/login")
    events = db.scalars(select(Event).where(Event.host_id == u.id).order_by(Event.id.desc())).all()
    return render(request, "host/dashboard.html", u=u, events=events, totals=core.event_totals)


@router.get("/bank", response_class=HTMLResponse)
def bank_form(request: Request, db: Session = Depends(get_db)):
    u = current(request, db)
    if not u:
        return redirect("/host/login")
    return render(request, "host/bank.html", u=u, pending=request.session.get("bank_pending"))


@router.post("/bank")
def bank_start(request: Request, db: Session = Depends(get_db), bank_name: str = Form(...),
               bank_account: str = Form(...), bank_holder: str = Form(...)):
    u = current(request, db)
    if not providers.bank_holder_matches(bank_holder, u.name):
        flash(request, "예금주가 본인인증 성명과 일치하지 않습니다. 본인 명의 계좌만 등록하실 수 있습니다.", "err")
        return redirect("/host/bank")
    code = providers.bank_send_one_won(bank_name, bank_account)
    request.session["bank_pending"] = {"bank_name": bank_name, "bank_account": bank_account,
                                       "bank_holder": bank_holder, "code": code}
    flash(request, f"1원을 송금했습니다. 입금자명의 숫자 4자리를 입력해 주세요. (데모 인증번호 {code})")
    return redirect("/host/bank")


@router.post("/bank/verify")
def bank_verify(request: Request, db: Session = Depends(get_db), code: str = Form(...)):
    u = current(request, db)
    p = request.session.get("bank_pending")
    if not p or code.strip() != p["code"]:
        flash(request, "인증번호가 일치하지 않습니다.", "err")
        return redirect("/host/bank")
    u.bank_name, u.bank_account, u.bank_holder = p["bank_name"], p["bank_account"], p["bank_holder"]
    u.bank_verified_at = datetime.now()
    request.session.pop("bank_pending")
    core.audit(db, f"host:{u.id}", "bank.verified", "", core.mask_account(u.bank_account))
    db.commit()
    flash(request, "정산 계좌 인증이 완료되었습니다.")
    return redirect("/host")


@router.get("/events/new", response_class=HTMLResponse)
def new_event_form(request: Request, db: Session = Depends(get_db)):
    u = current(request, db)
    if not u:
        return redirect("/host/login")
    venues = db.scalars(select(Venue).order_by(Venue.kind, Venue.name)).all()
    return render(request, "host/event_new.html", u=u, venues=venues, today=date.today())


@router.post("/events/new")
async def new_event(request: Request, db: Session = Depends(get_db), kind: str = Form(...),
                    title: str = Form(...), host_role: str = Form(...), event_date: date = Form(...),
                    event_time: str = Form("12:00"), venue_id: int = Form(...),
                    hall: str = Form(""), message: str = Form(""), meal_tickets: bool = Form(False),
                    contract: UploadFile | None = File(None)):
    u = current(request, db)
    if not u:
        return redirect("/host/login")
    try:
        core.can_open_event(db, u)
    except core.RuleError as e:
        flash(request, str(e), "err")
        return redirect("/host")
    fname = None
    if contract and contract.filename:
        data = await contract.read()
        ext = ALLOWED_UPLOAD_TYPES.get(contract.content_type or "")
        if not ext or len(data) > MAX_UPLOAD_BYTES:
            flash(request, "계약서는 10MB 이하의 JPG, PNG, PDF 파일만 첨부하실 수 있습니다.", "err")
            return redirect("/host/events/new")
        fname = f"contract_{core.new_code(12)}{ext}"
        (UPLOAD_DIR / fname).write_bytes(data)
    if kind == "wedding" and not fname:
        flash(request, "결혼식은 식장 계약서를 첨부해 주세요.", "err")
        return redirect("/host/events/new")
    ev = Event(code=core.new_code(8), host_id=u.id, venue_id=venue_id, kind=kind, title=title,
               host_role=host_role, event_date=event_date, event_time=event_time, hall=hall,
               message=message, meal_tickets=meal_tickets, contract_file=fname,
               status="pending_verify")
    db.add(ev)
    core.audit(db, f"host:{u.id}", "event.created", f"event:{ev.code}", kind)
    db.commit()
    flash(request, "행사가 등록되었습니다. 식장 예약 확인 후 청첩장이 공개됩니다.")
    return redirect(f"/host/events/{ev.id}")


def _own(request: Request, db: Session, eid: int) -> Event | None:
    u = current(request, db)
    ev = db.get(Event, eid)
    return ev if u and ev and ev.host_id == u.id else None


@router.get("/events/{eid}", response_class=HTMLResponse)
def event_detail(eid: int, request: Request, db: Session = Depends(get_db)):
    ev = _own(request, db, eid)
    if not ev:
        return redirect("/host")
    returns = db.scalars(select(Inquiry).where(Inquiry.event_id == ev.id,
                                               Inquiry.kind == "return_request")).all()
    s = load_all(db)
    return render(request, "host/event.html", ev=ev, t=core.event_totals(ev), returns=returns,
                  settle_on=core.settle_available_on(db, ev), today=date.today(), s=s,
                  base=str(request.base_url).rstrip("/"))


@router.post("/events/{eid}/settle")
def settle(eid: int, request: Request, db: Session = Depends(get_db)):
    ev = _own(request, db, eid)
    try:
        r = core.request_settlement(db, ev)
        flash(request, "정산 신청이 접수되었습니다. 운영 확인 후 본인 명의 계좌로 지급됩니다." if r == "requested"
              else "이상거래 점검 대상으로 확인되어 정산이 보류되었습니다. 담당자 검토 후 안내드립니다.",
              "ok" if r == "requested" else "warn")
    except core.RuleError as e:
        flash(request, str(e), "err")
    return redirect(f"/host/events/{eid}")


@router.post("/events/{eid}/cancel")
def cancel_event(eid: int, request: Request, db: Session = Depends(get_db),
                 reason: str = Form(...)):
    ev = _own(request, db, eid)
    try:
        n = core.cancel_event(db, ev, f"host:{ev.host_id}", reason)
        flash(request, f"행사가 취소되었습니다. 결제 {n}건이 자동 취소되었으며 하객에게 안내 문자가 발송되었습니다.")
    except core.RuleError as e:
        flash(request, str(e), "err")
    return redirect(f"/host/events/{eid}")


@router.post("/events/{eid}/thanks")
def thanks(eid: int, request: Request, db: Session = Depends(get_db), body: str = Form(...)):
    ev = _own(request, db, eid)
    n = 0
    for g in ev.gifts:
        if g.status in ("paid", "settled") and not g.thanks_sent_at:
            providers.send_sms(db, g.guest_phone, f"[LifeTies] {ev.title}: {body}")
            g.thanks_sent_at = datetime.now()
            n += 1
    core.audit(db, f"host:{ev.host_id}", "thanks.sent", f"event:{ev.code}", f"{n}건")
    db.commit()
    flash(request, f"감사 메시지를 {n}명에게 발송했습니다.")
    return redirect(f"/host/events/{eid}")


@router.post("/returns/{qid}")
def answer_return(qid: int, request: Request, db: Session = Depends(get_db),
                  agree: str = Form(...)):
    q = db.get(Inquiry, qid)
    ev = _own(request, db, q.event_id) if q else None
    if not ev or q.status != "host_pending":
        return redirect("/host")
    core.answer_return(db, q, agree == "yes", f"host:{ev.host_id}")
    flash(request, "반환 요청을 처리가 완료되었습니다.")
    return redirect(f"/host/events/{ev.id}")
