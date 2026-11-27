"""업무 규칙: 결제 한도, 이상거래 감시, 정산, 취소·반환, 감사 로그, 마스킹.

신청서 12번(이용자 보호)·13번(위험관리) 보완사항을 코드로 옮긴 곳입니다.
"""
import secrets
from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import (AuditLog, BlockedAttempt, Event, Gift, Inquiry, RiskAlert,
                      Settlement, User)
from . import providers
from .settings import get, load_all


class RuleError(Exception):
    """결제·정산이 업무 규칙에 따라 제한될 때. 메시지는 사용자에게 그대로 보여줍니다."""


# ── 공통 ────────────────────────────────────────────────────────────────

def audit(db: Session, actor: str, action: str, target: str = "", detail: str = "") -> None:
    db.add(AuditLog(actor=actor, action=action, target=target, detail=detail))


def mask_name(name: str) -> str:
    if len(name) <= 1:
        return "*"
    if len(name) == 2:
        return name[0] + "*"
    return name[0] + "*" * (len(name) - 2) + name[-1]


def mask_phone(phone: str) -> str:
    p = providers.phone_norm(phone)
    return f"{p[:3]}-****-{p[-4:]}" if len(p) >= 8 else "***"


def mask_account(acc: str | None) -> str:
    if not acc:
        return ""
    d = "".join(ch for ch in acc if ch.isdigit())
    return "*" * max(len(d) - 4, 0) + d[-4:]


def won(n: int | None) -> str:
    return f"{(n or 0):,}원"


def new_code(n: int = 8) -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(alphabet) for _ in range(n))


# ── 행사 ────────────────────────────────────────────────────────────────

def can_open_event(db: Session, user: User) -> None:
    limit = get(db, "limit_host_events_per_year")
    since = datetime.now() - timedelta(days=365)
    n = db.scalar(select(func.count()).select_from(Event).where(
        Event.host_id == user.id, Event.created_at >= since, Event.status != "cancelled"))
    if n >= limit:
        raise RuleError(f"행사 개설은 연 {limit}회로 제한됩니다.")


def settle_available_on(db: Session, ev: Event) -> date:
    return ev.event_date + timedelta(days=get(db, "settlement_hold_days"))


def event_totals(ev: Event) -> dict:
    paid = [g for g in ev.gifts if g.status in ("paid", "settled", "return_requested")]
    gross = sum(g.amount for g in paid)
    tickets = [g for g in paid if g.ticket_code]
    used = [g for g in tickets if g.ticket_used_at]
    return {
        "count": len(paid),
        "gross": gross,
        "tickets": len(tickets),
        "used": len(used),
        "checkin_pct": round(100 * len(used) / len(tickets)) if tickets else None,
        "cancelled": sum(1 for g in ev.gifts if g.status == "cancelled"),
    }


# ── 결제 ────────────────────────────────────────────────────────────────

def check_limits(db: Session, ev: Event, amount: int, installment: int, payer_ci: str,
                 guest_phone: str) -> None:
    s = load_all(db)
    reason = None
    if ev.status != "published":
        reason = "식장 확인이 완료된 행사에서만 결제하실 수 있습니다."
    elif date.today() > ev.event_date + timedelta(days=s["gift_window_days_after"]):
        reason = "결제 가능 기간이 종료되었습니다."
    elif amount < 10_000 or amount % 1_000:
        reason = "결제 금액은 1만 원 이상, 1천 원 단위로 입력해 주세요."
    elif amount > s["limit_per_gift"]:
        reason = f"1회 결제 한도({won(s['limit_per_gift'])})를 초과하여 결제가 제한됩니다."
    elif installment not in (0, 2, 3):
        reason = "할부는 최대 3개월까지 이용하실 수 있습니다."
    elif payer_ci == ev.host.ci:
        reason = "본인이 개설한 행사에는 본인 명의 카드로 결제하실 수 없습니다."
    if not reason:
        ev_total = db.scalar(select(func.coalesce(func.sum(Gift.amount), 0)).where(
            Gift.event_id == ev.id, Gift.status != "cancelled"))
        if ev_total + amount > s["limit_per_event"]:
            reason = f"행사별 수납 한도({won(s['limit_per_event'])})를 초과하여 결제가 제한됩니다."
    if not reason:
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        mtotal = db.scalar(select(func.coalesce(func.sum(Gift.amount), 0)).where(
            Gift.card_owner_ci == payer_ci, Gift.status != "cancelled",
            Gift.created_at >= month_start))
        if mtotal + amount > s["limit_guest_monthly"]:
            reason = f"하객 1인 월 결제 한도({won(s['limit_guest_monthly'])})를 초과하여 결제가 제한됩니다."
    if reason:
        db.add(BlockedAttempt(event_id=ev.id, reason=reason, amount=amount,
                              guest_phone=providers.phone_norm(guest_phone)))
        db.commit()
        raise RuleError(reason)


def pay_gift(db: Session, ev: Event, *, guest_name: str, guest_phone: str, guest_birth: str,
             relation: str, message: str, amount: int, installment: int, card_number: str,
             expiry: str, is_corporate: bool = False, corp_name: str = "",
             device_id: str = "") -> Gift:
    payer_ci = providers.identity_verify(guest_name, guest_birth, guest_phone)
    check_limits(db, ev, amount, installment, payer_ci, guest_phone)
    res = providers.pg_approve(card_number, expiry, guest_name, guest_birth, guest_phone,
                               amount, installment)
    if not res.ok:
        raise RuleError(res.message)
    g = Gift(event_id=ev.id, guest_name=guest_name.strip(),
             guest_phone=providers.phone_norm(guest_phone), relation=relation,
             message=message.strip()[:300], amount=amount, installment_months=installment,
             card_brand=res.brand, card_last4=res.last4, card_owner_ci=res.owner_ci,
             is_corporate=is_corporate, corp_name=corp_name.strip(), device_id=device_id,
             pg_tid=res.tid)
    if ev.meal_tickets:
        g.ticket_code = new_code(10)
    db.add(g)
    db.flush()
    run_rules_for_gift(db, ev, g)
    providers.send_sms(db, g.guest_phone,
                       f"[LifeTies] {ev.title}에 {won(amount)} 결제가 완료되었습니다. "
                       f"정산 전까지 언제든 취소할 수 있습니다.")
    audit(db, "guest", "gift.paid", f"gift:{g.id}", f"event={ev.code} amount={amount}")
    db.commit()
    return g


def cancel_gift(db: Session, g: Gift, actor: str, reason: str) -> None:
    if g.status != "paid":
        raise RuleError("정산 전 결제만 취소하실 수 있습니다. 정산 후에는 반환 요청을 이용해 주세요.")
    if g.event.settlement_status == "settled":
        raise RuleError("정산이 완료된 행사입니다.")
    providers.pg_cancel(g.pg_tid, g.amount)
    g.status = "cancelled"
    g.cancelled_at = datetime.now()
    providers.send_sms(db, g.guest_phone,
                       f"[LifeTies] {g.event.title} 결제 {won(g.amount)}이 취소되었습니다. ({reason})")
    audit(db, actor, "gift.cancelled", f"gift:{g.id}", reason)


def cancel_event(db: Session, ev: Event, actor: str, reason: str) -> int:
    """행사 취소: 정산 전 결제 전액 자동 취소 + 하객 문자 안내."""
    if ev.settlement_status == "settled":
        raise RuleError("정산이 완료된 행사는 취소하실 수 없습니다. 고객센터로 문의해 주세요.")
    n = 0
    for g in ev.gifts:
        if g.status == "paid":
            cancel_gift(db, g, actor, f"행사 취소: {reason}")
            n += 1
    ev.status = "cancelled"
    ev.cancelled_at = datetime.now()
    audit(db, actor, "event.cancelled", f"event:{ev.code}", f"{reason} / 자동취소 {n}건")
    db.commit()
    return n


# ── 이상거래 감시 ───────────────────────────────────────────────────────

RULE_NAMES = {
    "device_multi_payer": "같은 기기에서 여러 명의로 결제",
    "repeat_guest": "한 하객의 30일 내 반복 결제",
    "host_repeat_events": "혼주의 단기간 반복 행사 개설",
    "burst": "짧은 시간 결제 집중",
    "new_user_high": "가입 당일 고액 결제",
    "low_checkin": "식권 사용률 저조",
    "sanction_list": "제재대상자 명단 일치",
}

SANCTION_NAMES = {"홍길동테스트"}  # 데모용 제재대상자 명단


def _alert(db: Session, ev: Event, rule: str, severity: str, detail: str,
           gift: Gift | None = None) -> RiskAlert | None:
    exists = db.scalar(select(RiskAlert).where(
        RiskAlert.event_id == ev.id, RiskAlert.rule == rule, RiskAlert.status == "open"))
    if exists:
        return None
    a = RiskAlert(event_id=ev.id, gift_id=gift.id if gift else None, rule=rule,
                  severity=severity, detail=detail)
    db.add(a)
    audit(db, "system", "risk.alert", f"event:{ev.code}", f"{rule}: {detail}")
    return a


def run_rules_for_gift(db: Session, ev: Event, g: Gift) -> None:
    s = load_all(db)
    if g.device_id:
        payers = db.scalar(select(func.count(func.distinct(Gift.card_owner_ci))).where(
            Gift.device_id == g.device_id, Gift.status != "cancelled"))
        if payers >= s["rule_device_distinct_payers"]:
            _alert(db, ev, "device_multi_payer", "high",
                   f"같은 기기에서 {payers}명 명의로 결제", g)
    since = datetime.now() - timedelta(days=30)
    n_events = db.scalar(select(func.count(func.distinct(Gift.event_id))).where(
        Gift.card_owner_ci == g.card_owner_ci, Gift.created_at >= since,
        Gift.status != "cancelled"))
    if n_events >= s["rule_repeat_guest_events"]:
        _alert(db, ev, "repeat_guest", "medium",
               f"{mask_name(g.guest_name)} 님이 30일 내 {n_events}개 행사에 결제", g)
    if g.created_at.date() == ev.created_at.date() and g.amount >= s["rule_high_amount_new_user"]:
        _alert(db, ev, "new_user_high", "medium",
               f"행사 개설 당일 {won(g.amount)} 고액 결제", g)
    if g.guest_name.replace(" ", "") in SANCTION_NAMES:
        _alert(db, ev, "sanction_list", "high", "제재대상자 명단과 이름 일치", g)
    # 결제 집중: 최근 1시간 결제액이 행사 총액의 N% 이상 (5건 이상일 때)
    gifts = [x for x in ev.gifts if x.status != "cancelled"]
    if len(gifts) >= 5:
        total = sum(x.amount for x in gifts)
        hour = datetime.now() - timedelta(hours=1)
        recent = sum(x.amount for x in gifts if x.created_at >= hour)
        if total and 100 * recent / total >= s["rule_burst_share_pct"] and \
                datetime.now().date() != ev.event_date:
            _alert(db, ev, "burst", "medium",
                   f"최근 1시간 결제가 총액의 {round(100 * recent / total)}%")


def run_rules_for_event(db: Session, ev: Event) -> None:
    """정산 신청 시점에 다시 점검: 혼주 반복 개설, 식권 사용률."""
    s = load_all(db)
    since = datetime.now() - timedelta(days=180)
    n = db.scalar(select(func.count()).select_from(Event).where(
        Event.host_id == ev.host_id, Event.created_at >= since, Event.status != "cancelled"))
    if n >= 3:
        _alert(db, ev, "host_repeat_events", "medium", f"6개월 내 행사 {n}건 개설")
    t = event_totals(ev)
    if ev.meal_tickets and t["tickets"] >= 5 and t["checkin_pct"] is not None \
            and t["checkin_pct"] < s["rule_min_checkin_ratio_pct"]:
        _alert(db, ev, "low_checkin", "high",
               f"식권 사용률 {t['checkin_pct']}% (기준 {s['rule_min_checkin_ratio_pct']}%)")


def open_alerts(ev: Event) -> list[RiskAlert]:
    return [a for a in ev.alerts if a.status == "open"]


def review_alert(db: Session, a: RiskAlert, reviewer: str, decision: str, note: str) -> None:
    if decision not in ("cleared", "reported"):
        raise RuleError("잘못된 처리 구분")
    a.status = decision
    a.reviewer = reviewer
    a.review_note = note
    a.reviewed_at = datetime.now()
    audit(db, reviewer, f"risk.{decision}", f"alert:{a.id}", note)
    ev = a.event
    if decision == "reported":
        ev.settlement_status = "held"
        ev.hold_reason = "의심거래 보고(제휴사 보고책임자 → FIU) 진행 중"
    elif ev.settlement_status == "held" and not open_alerts(ev):
        ev.settlement_status = "requested"
        ev.hold_reason = ""
    db.commit()


# ── 정산 ────────────────────────────────────────────────────────────────

def request_settlement(db: Session, ev: Event) -> str:
    host = ev.host
    if ev.status != "published":
        raise RuleError("공개된 행사만 정산을 신청하실 수 있습니다.")
    if not host.bank_verified_at:
        raise RuleError("본인 명의 정산 계좌 인증을 먼저 완료해 주세요.")
    avail = settle_available_on(db, ev)
    if date.today() < avail:
        raise RuleError(f"정산은 {avail:%Y-%m-%d}부터 신청하실 수 있습니다. (행사 전 인출 불가)")
    if ev.settlement_status == "settled":
        raise RuleError("정산이 이미 완료되었습니다.")
    run_rules_for_event(db, ev)
    db.flush()
    db.refresh(ev)
    if open_alerts(ev):
        ev.settlement_status = "held"
        ev.hold_reason = "이상거래 경보 검토 중: " + ", ".join(
            RULE_NAMES.get(a.rule, a.rule) for a in open_alerts(ev))
        audit(db, f"host:{host.id}", "settlement.held", f"event:{ev.code}", ev.hold_reason)
        db.commit()
        return "held"
    ev.settlement_status = "requested"
    audit(db, f"host:{host.id}", "settlement.requested", f"event:{ev.code}")
    db.commit()
    return "requested"


def execute_settlement(db: Session, ev: Event, actor: str) -> Settlement:
    if ev.settlement_status != "requested":
        raise RuleError("정산 대기 상태가 아닙니다.")
    if open_alerts(ev):
        raise RuleError("검토 중인 경보가 있어 지급할 수 없습니다.")
    host = ev.host
    gifts = [g for g in ev.gifts if g.status == "paid"]
    gross = sum(g.amount for g in gifts)
    rate = get(db, "fee_rate_bp")
    fee = gross * rate // 10000
    net = gross - fee
    payout = providers.pg_payout(host.bank_name, host.bank_account, host.bank_holder, net)
    st = Settlement(event_id=ev.id, gross=gross, fee=fee, net=net, bank_name=host.bank_name,
                    bank_account_masked=mask_account(host.bank_account), pg_payout_id=payout)
    db.add(st)
    for g in gifts:
        g.status = "settled"
    ev.settlement_status = "settled"
    providers.send_sms(db, host.phone,
                       f"[LifeTies] {ev.title} 정산 {won(net)}이 {host.bank_name} "
                       f"{mask_account(host.bank_account)} 계좌로 입금되었습니다.")
    audit(db, actor, "settlement.paid", f"event:{ev.code}",
          f"gross={gross} fee={fee} net={net} payout={payout}")
    db.commit()
    return st


# ── 정산 후 반환 요청 ───────────────────────────────────────────────────

def request_return(db: Session, g: Gift, body: str) -> Inquiry:
    if g.status != "settled":
        raise RuleError("정산 전 결제는 반환 요청 없이 즉시 취소하실 수 있습니다.")
    q = Inquiry(kind="return_request", event_id=g.event_id, gift_id=g.id, name=g.guest_name,
                phone=g.guest_phone, body=body, status="host_pending")
    g.status = "return_requested"
    db.add(q)
    providers.send_sms(db, g.event.host.phone,
                       f"[LifeTies] {mask_name(g.guest_name)} 님이 {won(g.amount)} 반환을 요청했습니다. "
                       f"앱에서 동의 여부를 선택해 주세요.")
    audit(db, "guest", "return.requested", f"gift:{g.id}")
    db.commit()
    return q


def answer_return(db: Session, q: Inquiry, agree: bool, actor: str) -> None:
    g = db.get(Gift, q.gift_id)
    if agree:
        g.status = "returned"
        q.status = "resolved"
        q.answer = "혼주(상주) 동의로 반환 처리했습니다(혼주 계좌에서 하객 결제 카드로 환급)."
    else:
        g.status = "settled"
        q.status = "rejected"
        q.answer = "혼주(상주)가 반환에 동의하지 않았습니다. 이견이 있으면 고객센터로 문의해 주세요."
    q.resolved_at = datetime.now()
    providers.send_sms(db, g.guest_phone, f"[LifeTies] 반환 요청 결과: {q.answer}")
    audit(db, actor, "return.answered", f"gift:{g.id}", "agree" if agree else "reject")
    db.commit()


# ── 개인정보 파기 ───────────────────────────────────────────────────────

def purge_expired(db: Session, actor: str) -> int:
    """보존기간이 지난 종료 행사의 하객 개인정보를 비식별 처리."""
    days = get(db, "retention_days_after_close")
    cutoff = date.today() - timedelta(days=days)
    n = 0
    for g in db.scalars(select(Gift).join(Event).where(Event.event_date < cutoff)):
        if g.guest_name != "(파기)":
            g.guest_name, g.guest_phone, g.message, g.corp_name = "(파기)", "", "", ""
            n += 1
    audit(db, actor, "privacy.purge", "", f"기준일 {cutoff} / {n}건 비식별")
    db.commit()
    return n
