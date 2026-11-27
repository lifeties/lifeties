"""하객 화면: 모바일 청첩장/부고 → 카드결제(모의) → 영수증·모바일 식권 → 취소·반환 요청."""
from datetime import date

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Event, Gift, Inquiry
from ..services import core
from ..services.settings import load_all
from ..web import flash, gift_from_token, gift_token, qr_svg, redirect, render

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
def home(request: Request, db: Session = Depends(get_db)):
    samples = db.scalars(select(Event).where(Event.status == "published").limit(3)).all()
    return render(request, "home.html", samples=samples)


def _event(db: Session, code: str) -> Event | None:
    return db.scalar(select(Event).where(Event.code == code))


@router.get("/i/{code}", response_class=HTMLResponse)
def invitation(code: str, request: Request, db: Session = Depends(get_db)):
    ev = _event(db, code)
    if not ev or ev.status not in ("published", "cancelled"):
        return render(request, "guest/not_found.html")
    return render(request, "guest/invitation.html", ev=ev, s=load_all(db),
                  today=date.today())


@router.post("/i/{code}/pay")
def pay(code: str, request: Request, db: Session = Depends(get_db),
        guest_name: str = Form(...), guest_phone: str = Form(...), guest_birth: str = Form(...),
        relation: str = Form(""), message: str = Form(""), amount: int = Form(...),
        installment: int = Form(0), card_number: str = Form(...), expiry: str = Form(...),
        is_corporate: bool = Form(False), corp_name: str = Form(""),
        agree: bool = Form(False), device_id: str = Form("")):
    ev = _event(db, code)
    if not ev:
        return redirect("/")
    if not agree:
        flash(request, "이용약관 및 취소·환불 정책에 동의해 주세요.", "err")
        return redirect(f"/i/{code}#gift")
    try:
        g = core.pay_gift(db, ev, guest_name=guest_name, guest_phone=guest_phone,
                          guest_birth=guest_birth, relation=relation, message=message,
                          amount=amount, installment=installment, card_number=card_number,
                          expiry=expiry, is_corporate=is_corporate, corp_name=corp_name,
                          device_id=device_id or request.client.host if request.client else "")
    except core.RuleError as e:
        flash(request, str(e), "err")
        return redirect(f"/i/{code}#gift")
    return redirect(f"/g/{gift_token(g.id)}")


def _gift(db: Session, token: str) -> Gift | None:
    gid = gift_from_token(token)
    return db.get(Gift, gid) if gid else None


@router.get("/g/{token}", response_class=HTMLResponse)
def receipt(token: str, request: Request, db: Session = Depends(get_db)):
    g = _gift(db, token)
    if not g:
        return render(request, "guest/not_found.html")
    qr = qr_svg(f"LIFETIES-TICKET:{g.ticket_code}") if g.ticket_code and g.status != "cancelled" else None
    return render(request, "guest/receipt.html", g=g, ev=g.event, token=token, qr=qr)


@router.post("/g/{token}/cancel")
def cancel(token: str, request: Request, db: Session = Depends(get_db)):
    g = _gift(db, token)
    try:
        core.cancel_gift(db, g, "guest", "하객 직접 취소")
        db.commit()
        flash(request, "결제가 취소되었습니다. 카드사 승인 취소에는 영업일 기준 3~5일이 소요될 수 있습니다.")
    except core.RuleError as e:
        flash(request, str(e), "err")
    return redirect(f"/g/{token}")


@router.post("/g/{token}/return")
def return_request(token: str, request: Request, db: Session = Depends(get_db),
                   body: str = Form(...)):
    g = _gift(db, token)
    try:
        core.request_return(db, g, body)
        flash(request, "반환 요청이 접수되었습니다. 혼주(상주) 동의 후 결과를 문자로 안내드립니다.")
    except core.RuleError as e:
        flash(request, str(e), "err")
    return redirect(f"/g/{token}")


@router.get("/g/{token}/certificate", response_class=HTMLResponse)
def certificate(token: str, request: Request, db: Session = Depends(get_db)):
    """법인 경조금 지급확인서(증빙용)."""
    g = _gift(db, token)
    if not g or g.status == "cancelled":
        return render(request, "guest/not_found.html")
    core.audit(db, "guest", "certificate.issued", f"gift:{g.id}")
    db.commit()
    return render(request, "guest/certificate.html", g=g, ev=g.event, today=date.today())


@router.get("/support", response_class=HTMLResponse)
def support(request: Request):
    return render(request, "guest/support.html")


@router.post("/support")
def support_post(request: Request, db: Session = Depends(get_db), name: str = Form(...),
                 phone: str = Form(...), kind: str = Form("general"), body: str = Form(...)):
    db.add(Inquiry(kind=kind if kind in ("general", "complaint") else "general",
                   name=name, phone=phone, body=body))
    core.audit(db, "guest", "inquiry.created", "", kind)
    db.commit()
    flash(request, "문의가 접수되었습니다. 15일 이내에 문자로 답변드립니다.")
    return redirect("/support")
