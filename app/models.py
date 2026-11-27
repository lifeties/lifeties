"""데이터 모델.

신청서의 서비스 흐름을 그대로 옮겼습니다.
혼주(상주) 본인인증 → 행사 등록·식장 확인 → 청첩장/부고 공개 → 하객 카드결제(모의)
→ 모바일 식권 QR → 행사일 + N일 후 본인 명의 계좌로 정산.
"""
from datetime import date, datetime

from sqlalchemy import (Boolean, Date, DateTime, ForeignKey, Integer, String,
                        Text, UniqueConstraint)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def now() -> datetime:
    return datetime.now()


class User(Base):
    """혼주·상주(행사 개설자). 하객은 회원가입 없이 결제할 수 있습니다."""
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    phone: Mapped[str] = mapped_column(String(20), unique=True)
    birth: Mapped[str] = mapped_column(String(8))  # YYYYMMDD (주민등록번호 미수집)
    ci: Mapped[str] = mapped_column(String(64), unique=True)  # 본인인증 연계정보(mock)
    bank_name: Mapped[str | None] = mapped_column(String(30))
    bank_account: Mapped[str | None] = mapped_column(String(40))
    bank_holder: Mapped[str | None] = mapped_column(String(50))
    bank_verified_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    events: Mapped[list["Event"]] = relationship(back_populates="host")


class Venue(Base):
    """제휴 예식장·장례식장. 식장 확인과 식권 QR 검표를 맡습니다."""
    __tablename__ = "venues"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    kind: Mapped[str] = mapped_column(String(10))  # wedding | funeral
    address: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(20))
    staff_code: Mapped[str] = mapped_column(String(20))  # 데모용 검표 로그인 코드


class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(12), unique=True)  # 청첩장 URL 코드
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    venue_id: Mapped[int | None] = mapped_column(ForeignKey("venues.id"))
    kind: Mapped[str] = mapped_column(String(10))  # wedding | funeral | other
    title: Mapped[str] = mapped_column(String(120))
    host_role: Mapped[str] = mapped_column(String(20))  # 혼주, 신랑, 신부, 상주 …
    message: Mapped[str] = mapped_column(Text, default="")
    event_date: Mapped[date] = mapped_column(Date)
    event_time: Mapped[str] = mapped_column(String(5), default="12:00")
    hall: Mapped[str] = mapped_column(String(60), default="")
    contract_file: Mapped[str | None] = mapped_column(String(200))
    meal_tickets: Mapped[bool] = mapped_column(Boolean, default=True)
    # draft → pending_verify → published → (cancelled) → closed
    status: Mapped[str] = mapped_column(String(20), default="draft")
    verify_note: Mapped[str] = mapped_column(Text, default="")
    verified_at: Mapped[datetime | None] = mapped_column(DateTime)
    verified_by: Mapped[str | None] = mapped_column(String(50))
    # none → requested → held → settled
    settlement_status: Mapped[str] = mapped_column(String(20), default="none")
    hold_reason: Mapped[str] = mapped_column(Text, default="")
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    host: Mapped[User] = relationship(back_populates="events")
    venue: Mapped[Venue | None] = relationship()
    gifts: Mapped[list["Gift"]] = relationship(back_populates="event", order_by="Gift.id")
    alerts: Mapped[list["RiskAlert"]] = relationship(back_populates="event")


class Gift(Base):
    """하객의 축의금·조의금 결제 1건."""
    __tablename__ = "gifts"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    guest_name: Mapped[str] = mapped_column(String(50))
    guest_phone: Mapped[str] = mapped_column(String(20))
    relation: Mapped[str] = mapped_column(String(30), default="")
    message: Mapped[str] = mapped_column(Text, default="")
    amount: Mapped[int] = mapped_column(Integer)
    installment_months: Mapped[int] = mapped_column(Integer, default=0)
    card_brand: Mapped[str] = mapped_column(String(20))
    card_last4: Mapped[str] = mapped_column(String(4))
    card_owner_ci: Mapped[str] = mapped_column(String(64))  # 카드 명의자 식별(mock)
    is_corporate: Mapped[bool] = mapped_column(Boolean, default=False)
    corp_name: Mapped[str] = mapped_column(String(80), default="")
    device_id: Mapped[str] = mapped_column(String(64), default="")
    pg_tid: Mapped[str] = mapped_column(String(40))
    # paid → cancelled | settled → (return_requested → returned)
    status: Mapped[str] = mapped_column(String(20), default="paid")
    ticket_code: Mapped[str | None] = mapped_column(String(16), unique=True)
    ticket_used_at: Mapped[datetime | None] = mapped_column(DateTime)
    thanks_sent_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime)

    event: Mapped[Event] = relationship(back_populates="gifts")

    @property
    def fee(self) -> int:
        from .services.settings import get_setting_cached
        return self.amount * get_setting_cached("fee_rate_bp") // 10000


class Settlement(Base):
    __tablename__ = "settlements"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), unique=True)
    gross: Mapped[int] = mapped_column(Integer)
    fee: Mapped[int] = mapped_column(Integer)
    net: Mapped[int] = mapped_column(Integer)
    bank_name: Mapped[str] = mapped_column(String(30))
    bank_account_masked: Mapped[str] = mapped_column(String(40))
    pg_payout_id: Mapped[str] = mapped_column(String(40))
    paid_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    event: Mapped[Event] = relationship()


class RiskAlert(Base):
    """이상거래 감시 경보. 경보가 열려 있으면 해당 행사 정산은 자동 보류됩니다."""
    __tablename__ = "risk_alerts"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    gift_id: Mapped[int | None] = mapped_column(ForeignKey("gifts.id"))
    rule: Mapped[str] = mapped_column(String(40))
    severity: Mapped[str] = mapped_column(String(10))  # high | medium
    detail: Mapped[str] = mapped_column(Text)
    # open → cleared | reported(FIU 보고 요청)
    status: Mapped[str] = mapped_column(String(20), default="open")
    reviewer: Mapped[str | None] = mapped_column(String(50))
    review_note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime)

    event: Mapped[Event] = relationship(back_populates="alerts")


class BlockedAttempt(Base):
    """한도 초과·본인 행사 결제 등으로 차단된 결제 시도."""
    __tablename__ = "blocked_attempts"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"))
    reason: Mapped[str] = mapped_column(String(200))
    amount: Mapped[int] = mapped_column(Integer)
    guest_phone: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class Inquiry(Base):
    """민원·문의. 접수 후 15일 이내 처리(설정 가능)."""
    __tablename__ = "inquiries"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(20))  # general | return_request | complaint
    event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id"))
    gift_id: Mapped[int | None] = mapped_column(ForeignKey("gifts.id"))
    name: Mapped[str] = mapped_column(String(50))
    phone: Mapped[str] = mapped_column(String(20))
    body: Mapped[str] = mapped_column(Text)
    # received → host_pending(반환 동의 대기) → resolved | rejected
    status: Mapped[str] = mapped_column(String(20), default="received")
    answer: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime)


class AuditLog(Base):
    """감사 로그. 개인정보 원본 열람, 경보 처리, 정산, 설정 변경을 모두 남깁니다."""
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    actor: Mapped[str] = mapped_column(String(50))
    action: Mapped[str] = mapped_column(String(60))
    target: Mapped[str] = mapped_column(String(80), default="")
    detail: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class Setting(Base):
    __tablename__ = "settings"
    __table_args__ = (UniqueConstraint("key"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(60))
    value: Mapped[int] = mapped_column(Integer)


class Notification(Base):
    """문자·알림톡 발송 기록(데모에서는 실제 발송 없이 기록만)."""
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    phone: Mapped[str] = mapped_column(String(20))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
