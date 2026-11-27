"""화면 공통: 템플릿, 세션 헬퍼, QR, 서명 토큰."""
import io
from pathlib import Path

import qrcode
import qrcode.image.svg
from fastapi import Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from itsdangerous import BadSignature, URLSafeSerializer

from .config import SECRET_KEY
from .services import core
from .services.settings import LABELS

templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))
templates.env.filters["won"] = core.won
templates.env.filters["mask_name"] = core.mask_name
templates.env.filters["mask_phone"] = core.mask_phone
templates.env.filters["mask_account"] = core.mask_account
templates.env.globals["RULE_NAMES"] = core.RULE_NAMES
templates.env.globals["SETTING_LABELS"] = LABELS

KIND = {"wedding": "결혼식", "funeral": "장례식", "other": "기타 경조사"}
EVENT_STATUS = {"draft": "작성 중", "pending_verify": "식장 확인 중", "published": "공개",
                "rejected": "반려", "cancelled": "취소", "closed": "종료"}
SETTLE_STATUS = {"none": "정산 전", "requested": "정산 대기", "held": "정산 보류", "settled": "정산 완료"}
GIFT_STATUS = {"paid": "결제 완료", "cancelled": "취소", "settled": "정산 완료",
               "return_requested": "반환 요청", "returned": "반환 완료"}
templates.env.globals.update(KIND=KIND, EVENT_STATUS=EVENT_STATUS, SETTLE_STATUS=SETTLE_STATUS,
                             GIFT_STATUS=GIFT_STATUS)

_signer = URLSafeSerializer(SECRET_KEY, salt="gift")


def gift_token(gift_id: int) -> str:
    return _signer.dumps(gift_id)


def gift_from_token(token: str) -> int | None:
    try:
        return int(_signer.loads(token))
    except (BadSignature, ValueError):
        return None


templates.env.globals["gift_token"] = gift_token


def qr_svg(data: str) -> str:
    img = qrcode.make(data, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=2)
    buf = io.BytesIO()
    img.save(buf)
    svg = buf.getvalue().decode()
    return svg[svg.index("<svg"):]


def flash(request: Request, msg: str, kind: str = "ok") -> None:
    request.session["flash"] = [*request.session.get("flash", []), [kind, msg]]


def render(request: Request, name: str, **ctx):
    flashes = request.session.pop("flash", [])
    return templates.TemplateResponse(request, name, {"flashes": flashes, **ctx})


def redirect(url: str) -> RedirectResponse:
    return RedirectResponse(url, status_code=303)
