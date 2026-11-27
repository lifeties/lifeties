"""외부 연동(결제·본인인증·계좌인증·정산이체·문자)의 모의(mock) 구현.

실제 연동 시 같은 함수 시그니처로 제휴 PG사·본인인증기관·펌뱅킹 API를 붙이면 됩니다.
데모에서는 실제 돈이 오가지 않으며, 카드번호는 저장하지 않고 마지막 4자리만 남깁니다.
"""
import hashlib
import secrets
from dataclasses import dataclass

# ── 본인인증 (휴대폰 본인확인 mock) ──────────────────────────────────────

def identity_verify(name: str, birth: str, phone: str) -> str:
    """본인인증 성공 시 CI(연계정보)를 돌려줍니다. 데모: 이름+생년월일+전화의 해시."""
    raw = f"{name.strip()}|{birth.strip()}|{phone_norm(phone)}"
    return "CI" + hashlib.sha256(raw.encode()).hexdigest()[:40]


def phone_norm(phone: str) -> str:
    return "".join(ch for ch in phone if ch.isdigit())


# ── 1원 계좌인증 (예금주 일치 확인 mock) ────────────────────────────────

def bank_send_one_won(bank: str, account: str) -> str:
    """1원을 보내고 입금자명에 넣은 4자리 코드를 돌려줍니다(데모에서는 화면에 표시)."""
    return f"{secrets.randbelow(10000):04d}"


def bank_holder_matches(holder: str, user_name: str) -> bool:
    return holder.replace(" ", "") == user_name.replace(" ", "")


# ── 카드 결제 (제휴 PG mock) ────────────────────────────────────────────

@dataclass
class PaymentResult:
    ok: bool
    tid: str = ""
    brand: str = ""
    last4: str = ""
    owner_ci: str = ""
    message: str = ""


TEST_DECLINE = "4000000000000002"


def card_brand(number: str) -> str:
    n = number[:1]
    return {"4": "VISA", "5": "Mastercard", "9": "국내전용", "3": "AMEX"}.get(n, "국내카드")


def pg_approve(card_number: str, expiry: str, owner_name: str, owner_birth: str,
               owner_phone: str, amount: int, installment: int) -> PaymentResult:
    digits = "".join(ch for ch in card_number if ch.isdigit())
    if len(digits) < 14 or len(digits) > 16:
        return PaymentResult(False, message="카드번호를 다시 확인해 주세요.")
    if digits == TEST_DECLINE:
        return PaymentResult(False, message="카드사에서 승인이 거절되었습니다. (승인 거절 테스트 카드)")
    if len(expiry.replace("/", "")) != 4:
        return PaymentResult(False, message="유효기간을 MM/YY 형식으로 입력해 주세요.")
    return PaymentResult(
        True,
        tid="T" + secrets.token_hex(8).upper(),
        brand=card_brand(digits),
        last4=digits[-4:],
        owner_ci=identity_verify(owner_name, owner_birth, owner_phone),
    )


def pg_cancel(tid: str, amount: int) -> bool:
    return True


def pg_payout(bank: str, account: str, holder: str, amount: int) -> str:
    """제휴 PG사 정산자금(외부관리)에서 혼주 본인 계좌로 이체(mock)."""
    return "P" + secrets.token_hex(8).upper()


# ── 문자·알림톡 (mock: Notification 테이블에 기록만) ────────────────────

def send_sms(db, phone: str, body: str) -> None:
    from ..models import Notification
    db.add(Notification(phone=phone_norm(phone), body=body))
