"""운영자 화면: 지표, 식장 확인, 이상거래 경보 검토, 정산 실행, 민원, 감사 로그, 기준값 설정."""
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..config import ADMIN_ID, ADMIN_PASSWORD, DEFAULT_SETTINGS, UPLOAD_DIR
from ..db import get_db
from ..models import (AuditLog, BlockedAttempt, Event, Gift, Inquiry, Notification,
                      RiskAlert, Settlement, User)
from ..services import core
from ..services.settings import load_all, set_value
from ..web import flash, redirect, render

router = APIRouter(prefix="/admin")


def admin(request: Request) -> str | None:
    return request.session.get("admin")


@router.get("/login", response_class=HTMLResponse)
def login_form(request: Request):
    return render(request, "admin/login.html")


@router.post("/login")
def login(request: Request, db: Session = Depends(get_db), uid: str = Form(...),
          pw: str = Form(...)):
    if uid != ADMIN_ID or pw != ADMIN_PASSWORD:
        core.audit(db, uid, "admin.login_failed")
        db.commit()
        flash(request, "아이디 또는 비밀번호가 일치하지 않습니다.", "err")
        return redirect("/admin/login")
    request.session["admin"] = uid
    core.audit(db, uid, "admin.login")
    db.commit()
    return redirect("/admin")


@router.get("/logout")
def logout(request: Request):
    request.session.pop("admin", None)
    return redirect("/")


def kpis(db: Session) -> dict:
    gifts = db.scalars(select(Gift)).all()
    live = [g for g in gifts if g.status != "cancelled"]
    alerts = db.scalars(select(RiskAlert)).all()
    inq = db.scalars(select(Inquiry)).all()
    done = [q for q in inq if q.resolved_at]
    events = db.scalars(select(Event)).all()
    tickets = [g for g in live if g.ticket_code]
    held_events = {a.event_id for a in alerts}
    cleared = [a for a in alerts if a.status == "cleared"]
    return {
        "hosts": db.scalar(select(func.count()).select_from(User)),
        "events": len(events),
        "published": sum(1 for e in events if e.status == "published"),
        "gifts": len(live),
        "volume": sum(g.amount for g in live),
        "avg": (sum(g.amount for g in live) // len(live)) if live else 0,
        "cancel_rate": round(100 * (len(gifts) - len(live)) / len(gifts), 1) if gifts else 0,
        "alerts": len(alerts),
        "alerts_open": sum(1 for a in alerts if a.status == "open"),
        "held_events": len(held_events),
        "clear_rate": round(100 * len(cleared) / len(alerts)) if alerts else 0,
        "reported": sum(1 for a in alerts if a.status == "reported"),
        "blocked": db.scalar(select(func.count()).select_from(BlockedAttempt)),
        "checkin_pct": round(100 * sum(1 for g in tickets if g.ticket_used_at) / len(tickets)) if tickets else 0,
        "inquiries": len(inq),
        "inq_open": sum(1 for q in inq if not q.resolved_at),
        "avg_days": round(sum((q.resolved_at - q.created_at).total_seconds() for q in done)
                          / 86400 / len(done), 1) if done else 0,
        "settled": db.scalar(select(func.coalesce(func.sum(Settlement.net), 0))),
    }


@router.get("", response_class=HTMLResponse)
def dashboard(request: Request, db: Session = Depends(get_db)):
    if not admin(request):
        return redirect("/admin/login")
    queue = db.scalars(select(Event).where(Event.status == "pending_verify")).all()
    open_alerts = db.scalars(select(RiskAlert).where(RiskAlert.status == "open")
                             .order_by(RiskAlert.id.desc())).all()
    to_pay = db.scalars(select(Event).where(Event.settlement_status == "requested")).all()
    held = db.scalars(select(Event).where(Event.settlement_status == "held")).all()
    return render(request, "admin/dashboard.html", k=kpis(db), queue=queue,
                  open_alerts=open_alerts, to_pay=to_pay, held=held, active="home")


@router.get("/events", response_class=HTMLResponse)
def events(request: Request, db: Session = Depends(get_db), status: str = ""):
    if not admin(request):
        return redirect("/admin/login")
    q = select(Event).order_by(Event.id.desc())
    if status:
        q = q.where(Event.status == status)
    return render(request, "admin/events.html", events=db.scalars(q).all(), status=status,
                  totals=core.event_totals, active="events")


@router.get("/events/{eid}", response_class=HTMLResponse)
def event(eid: int, request: Request, db: Session = Depends(get_db)):
    if not admin(request):
        return redirect("/admin/login")
    ev = db.get(Event, eid)
    reveal = request.session.pop("reveal", None)
    blocked = db.scalars(select(BlockedAttempt).where(BlockedAttempt.event_id == eid)).all()
    st = db.scalar(select(Settlement).where(Settlement.event_id == eid))
    return render(request, "admin/event.html", ev=ev, t=core.event_totals(ev), reveal=reveal,
                  blocked=blocked, st=st, settle_on=core.settle_available_on(db, ev),
                  active="events")


@router.get("/events/{eid}/contract")
def contract(eid: int, request: Request, db: Session = Depends(get_db)):
    ev = db.get(Event, eid)
    if not admin(request) or not ev.contract_file:
        return redirect("/admin/login")
    core.audit(db, admin(request), "contract.viewed", f"event:{ev.code}")
    db.commit()
    return FileResponse(UPLOAD_DIR / ev.contract_file)


@router.post("/events/{eid}/verify")
def verify(eid: int, request: Request, db: Session = Depends(get_db), decision: str = Form(...),
           note: str = Form("")):
    who = admin(request)
    ev = db.get(Event, eid)
    if not who or ev.status != "pending_verify":
        return redirect("/admin")
    if decision == "approve":
        ev.status = "published"
        ev.verified_at, ev.verified_by = datetime.now(), who
        ev.verify_note = note or "식장 예약 확인 완료"
        from ..services.providers import send_sms
        send_sms(db, ev.host.phone, f"[LifeTies] {ev.title} 식장 확인이 끝나 청첩장(부고)이 공개되었습니다.")
    else:
        ev.status = "rejected"
        ev.verify_note = note or "식장 예약을 확인할 수 없음"
    core.audit(db, who, f"event.{decision}", f"event:{ev.code}", ev.verify_note)
    db.commit()
    flash(request, "처리가 완료되었습니다.")
    return redirect(f"/admin/events/{eid}")


@router.post("/events/{eid}/reveal")
def reveal(eid: int, request: Request, db: Session = Depends(get_db), reason: str = Form(...)):
    """개인정보 원본 열람: 사유를 남겨야 하며 감사 로그에 기록됩니다."""
    who = admin(request)
    if not who:
        return redirect("/admin/login")
    if len(reason.strip()) < 4:
        flash(request, "열람 사유를 구체적으로 입력해 주세요.", "err")
        return redirect(f"/admin/events/{eid}")
    request.session["reveal"] = True
    core.audit(db, who, "pii.revealed", f"event:{eid}", reason.strip())
    db.commit()
    return redirect(f"/admin/events/{eid}")


@router.post("/events/{eid}/settle")
def settle(eid: int, request: Request, db: Session = Depends(get_db)):
    who = admin(request)
    ev = db.get(Event, eid)
    try:
        st = core.execute_settlement(db, ev, who)
        flash(request, f"정산금 {core.won(st.net)}을 지급했습니다. (지급번호 {st.pg_payout_id})")
    except core.RuleError as e:
        flash(request, str(e), "err")
    return redirect(f"/admin/events/{eid}")


@router.post("/events/{eid}/cancel")
def cancel(eid: int, request: Request, db: Session = Depends(get_db), reason: str = Form(...)):
    who = admin(request)
    ev = db.get(Event, eid)
    try:
        n = core.cancel_event(db, ev, who, reason)
        flash(request, f"행사를 취소하고 결제 {n}건을 자동 취소했습니다.")
    except core.RuleError as e:
        flash(request, str(e), "err")
    return redirect(f"/admin/events/{eid}")


@router.get("/alerts", response_class=HTMLResponse)
def alerts(request: Request, db: Session = Depends(get_db), status: str = "open"):
    if not admin(request):
        return redirect("/admin/login")
    q = select(RiskAlert).order_by(RiskAlert.id.desc())
    if status:
        q = q.where(RiskAlert.status == status)
    return render(request, "admin/alerts.html", alerts=db.scalars(q).all(), status=status,
                  active="alerts")


@router.post("/alerts/{aid}")
def review(aid: int, request: Request, db: Session = Depends(get_db), decision: str = Form(...),
           note: str = Form(...)):
    who = admin(request)
    a = db.get(RiskAlert, aid)
    try:
        core.review_alert(db, a, who, decision, note)
        flash(request, "경보를 처리가 완료되었습니다." if decision == "cleared"
              else "의심거래로 판단하여 제휴사 보고책임자에게 보고를 요청했습니다.")
    except core.RuleError as e:
        flash(request, str(e), "err")
    return redirect("/admin/alerts")


@router.get("/inquiries", response_class=HTMLResponse)
def inquiries(request: Request, db: Session = Depends(get_db)):
    if not admin(request):
        return redirect("/admin/login")
    rows = db.scalars(select(Inquiry).order_by(Inquiry.id.desc())).all()
    return render(request, "admin/inquiries.html", rows=rows, now=datetime.now(),
                  timedelta=timedelta, active="inquiries")


@router.post("/inquiries/{qid}")
def answer(qid: int, request: Request, db: Session = Depends(get_db), answer: str = Form(...)):
    who = admin(request)
    q = db.get(Inquiry, qid)
    q.answer, q.status, q.resolved_at = answer, "resolved", datetime.now()
    from ..services.providers import send_sms
    send_sms(db, q.phone, f"[LifeTies] 문의 답변: {answer}")
    core.audit(db, who, "inquiry.answered", f"inquiry:{qid}")
    db.commit()
    flash(request, "답변을 발송했습니다.")
    return redirect("/admin/inquiries")


@router.get("/audit", response_class=HTMLResponse)
def audit(request: Request, db: Session = Depends(get_db)):
    if not admin(request):
        return redirect("/admin/login")
    logs = db.scalars(select(AuditLog).order_by(AuditLog.id.desc()).limit(300)).all()
    sms = db.scalars(select(Notification).order_by(Notification.id.desc()).limit(50)).all()
    return render(request, "admin/audit.html", logs=logs, sms=sms, active="audit")


@router.get("/settings", response_class=HTMLResponse)
def settings(request: Request, db: Session = Depends(get_db)):
    if not admin(request):
        return redirect("/admin/login")
    return render(request, "admin/settings.html", s=load_all(db), defaults=DEFAULT_SETTINGS,
                  active="settings")


@router.post("/settings")
async def save_settings(request: Request, db: Session = Depends(get_db)):
    who = admin(request)
    if not who:
        return redirect("/admin/login")
    form = await request.form()
    before = load_all(db)
    changed = []
    for k in DEFAULT_SETTINGS:
        if k in form and str(form[k]).strip():
            v = int(str(form[k]).replace(",", ""))
            if v != before[k]:
                set_value(db, k, v)
                changed.append(f"{k}: {before[k]}→{v}")
    if changed:
        core.audit(db, who, "settings.changed", "", "; ".join(changed))
    db.commit()
    flash(request, f"{len(changed)}건의 기준값이 변경되었습니다." if changed else "변경된 항목이 없습니다.")
    return redirect("/admin/settings")


@router.post("/purge")
def purge(request: Request, db: Session = Depends(get_db)):
    who = admin(request)
    n = core.purge_expired(db, who)
    flash(request, f"보존기간이 경과한 하객 정보 {n}건을 파기(비식별 처리)했습니다.")
    return redirect("/admin/settings")
