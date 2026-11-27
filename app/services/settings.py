"""위험관리 기준값. DB 값이 우선, 없으면 config.DEFAULT_SETTINGS."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import DEFAULT_SETTINGS
from ..db import SessionLocal

_cache: dict[str, int] = {}

LABELS = {
    "limit_per_gift": ("1건 결제 한도", "원"),
    "limit_per_event": ("행사당 총액 한도", "원"),
    "limit_guest_monthly": ("하객 1인 월 누적 한도", "원"),
    "limit_host_events_per_year": ("혼주(상주) 1인 연간 행사 개설", "회"),
    "settlement_hold_days": ("정산 대기(행사일 이후)", "일"),
    "gift_window_days_after": ("행사 후 결제 허용 기간", "일"),
    "fee_rate_bp": ("결제수수료(0.01% 단위)", "bp"),
    "rule_device_distinct_payers": ("같은 기기 결제자 수 경보", "명"),
    "rule_repeat_guest_events": ("30일 내 한 하객 결제 행사 수 경보", "건"),
    "rule_high_amount_new_user": ("가입 당일 고액 결제 경보", "원"),
    "rule_burst_share_pct": ("1시간 내 결제 집중 경보", "%"),
    "rule_min_checkin_ratio_pct": ("식권 사용률 하한", "%"),
    "retention_days_after_close": ("거래기록 보존기간", "일"),
}


def load_all(db: Session) -> dict[str, int]:
    from ..models import Setting
    values = dict(DEFAULT_SETTINGS)
    for s in db.scalars(select(Setting)):
        values[s.key] = s.value
    _cache.clear()
    _cache.update(values)
    return values


def get(db: Session, key: str) -> int:
    return load_all(db)[key]


def get_setting_cached(key: str) -> int:
    if not _cache:
        with SessionLocal() as db:
            load_all(db)
    return _cache[key]


def set_value(db: Session, key: str, value: int) -> None:
    from ..models import Setting
    if key not in DEFAULT_SETTINGS:
        raise KeyError(key)
    row = db.scalar(select(Setting).where(Setting.key == key))
    if row:
        row.value = value
    else:
        db.add(Setting(key=key, value=value))
    db.flush()
    load_all(db)
