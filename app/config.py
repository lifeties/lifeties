"""환경설정.

운영 환경에서는 반드시 환경변수(.env)로 값을 덮어쓰세요.
한도·보류기간 같은 위험관리 기준은 관리자 화면(설정)에서 바꿀 수 있고,
여기 값은 DB에 설정이 없을 때 쓰는 기본값입니다.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
UPLOAD_DIR = DATA_DIR / "uploads"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'app.db'}")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-me")
ADMIN_ID = os.getenv("ADMIN_ID", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin1234")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# 결제/본인인증/계좌인증 연동 방식. 데모에서는 모두 mock.
PAYMENT_PROVIDER = os.getenv("PAYMENT_PROVIDER", "mock")
IDENTITY_PROVIDER = os.getenv("IDENTITY_PROVIDER", "mock")
BANK_VERIFIER = os.getenv("BANK_VERIFIER", "mock")

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_UPLOAD_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "application/pdf": ".pdf",
}

# 위험관리 기준 기본값 (단위: 원 / 일 / 회). 관리자 화면에서 변경 가능.
# 숫자는 데모용 예시이며, 실제 값은 금융위 협의·제휴사 기준으로 확정해야 합니다.
DEFAULT_SETTINGS = {
    "limit_per_gift": 500_000,          # 1건 한도
    "limit_per_event": 30_000_000,      # 행사별 수납 한도
    "limit_guest_monthly": 2_000_000,   # 하객 1인 월 결제 한도
    "limit_host_events_per_year": 3,    # 혼주(상주) 1인 연간 행사 개설 횟수
    "settlement_hold_days": 3,          # 행사일로부터 정산 가능까지 대기 일수
    "gift_window_days_after": 7,        # 행사일 이후 결제 허용 일수
    "fee_rate_bp": 250,                 # 결제수수료(혼주 부담), 1bp = 0.01%  -> 2.5%
    "rule_device_distinct_payers": 3,   # 같은 기기에서 서로 다른 결제자 수 경보 기준
    "rule_repeat_guest_events": 4,      # 30일 내 한 하객이 결제한 행사 수 경보 기준
    "rule_high_amount_new_user": 300_000,  # 가입 당일 고액 결제 경보 기준
    "rule_burst_share_pct": 60,         # 1시간 내 결제 비중(%) 경보 기준
    "rule_min_checkin_ratio_pct": 20,   # 식권 사용률(%) 하한 (정산 전 점검)
    "retention_days_after_close": 1825, # 거래기록 보존기간(5년) 이후 파기
}

FEATURE_EARLY_WITHDRAWAL = False  # 행사 전 조기인출: 카드깡 위험으로 비활성(신청서 보완사항)
