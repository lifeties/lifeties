"""제휴 식장 화면: 식권 QR 검표. 검표 기록은 행사 실재 확인 자료로 쓰입니다."""
from datetime import date, datetime

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Event, Gift, Venue
from ..services import core
from ..web import flash, redirect, render

router = APIRouter(prefix="/venue")


def current(request: Request, db: Session) -> Venue | None:
    vid = request.session.get("venue_id")
    return db.get(Venue, vid) if vid else None


@router.get("/login", response_class=HTMLResponse)
def login_form(request: Request, db: Session = Depends(get_db)):
    return render(request, "venue/login.html", venues=db.scalars(select(Venue)).all())


@router.post("/login")
def login(request: Request, db: Session = Depends(get_db), venue_id: int = Form(...),
          staff_code: str = Form(...)):
    v = db.get(Venue, venue_id)
    if not v or v.staff_code != staff_code:
        flash(request, "식장 코드가 맞지 않습니다.", "err")
        return redirect("/venue/login")
    request.session["venue_id"] = v.id
    return redirect("/venue")


@router.get("", response_class=HTMLResponse)
def home(request: Request, db: Session = Depends(get_db)):
    v = current(request, db)
    if not v:
        return redirect("/venue/login")
    events = db.scalars(select(Event).where(Event.venue_id == v.id, Event.status == "published")
                        .order_by(Event.event_date)).all()
    return render(request, "venue/home.html", v=v, events=events, totals=core.event_totals,
                  today=date.today(), last=request.session.pop("last_scan", None))


@router.post("/scan")
def scan(request: Request, db: Session = Depends(get_db), code: str = Form(...)):
    v = current(request, db)
    if not v:
        return redirect("/venue/login")
    code = code.strip().upper().replace("LIFETIES-TICKET:", "")
    g = db.scalar(select(Gift).where(Gift.ticket_code == code))
    if not g or g.event.venue_id != v.id:
        result = ("err", "이 식장의 식권이 아닙니다.")
    elif g.status in ("cancelled", "returned"):
        result = ("err", "취소된 결제의 식권입니다.")
    elif g.ticket_used_at:
        result = ("warn", f"이미 사용한 식권입니다({g.ticket_used_at:%H:%M}).")
    elif g.event.event_date != date.today():
        result = ("err", f"행사일({g.event.event_date})이 아닙니다.")
    else:
        g.ticket_used_at = datetime.now()
        core.audit(db, f"venue:{v.id}", "ticket.used", f"gift:{g.id}")
        db.commit()
        result = ("ok", f"확인: {g.event.title} · {core.mask_name(g.guest_name)} 님")
    request.session["last_scan"] = result
    return redirect("/venue")


@router.get("/logout")
def logout(request: Request):
    request.session.pop("venue_id", None)
    return redirect("/")
