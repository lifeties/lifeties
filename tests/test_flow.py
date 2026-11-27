"""신청서 핵심 절차 전체를 한 번씩 거치는 통합 테스트."""
import os
import re
import tempfile
from datetime import date, timedelta

os.environ["DATA_DIR"] = tempfile.mkdtemp()

from fastapi.testclient import TestClient  # noqa: E402

from app import seed  # noqa: E402
from app.db import SessionLocal  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Event, Gift, RiskAlert  # noqa: E402

seed.run()
CARD = dict(card_number="9410 1234 5678 9012", expiry="12/29")


def client():
    return TestClient(app)


def host_login(c, name="김지은", birth="19940312", phone="010-1234-5678"):
    return c.post("/host/login", data=dict(name=name, birth=birth, phone=phone, agree="true"))


def pay(c, code, amount=100000, name="테스트하객", phone="01099998888", **kw):
    data = dict(guest_name=name, guest_phone=phone, guest_birth="19900101", amount=amount,
                installment=0, agree="true", device_id=kw.pop("device", "DEV-T"), **CARD)
    data.update(kw)
    return c.post(f"/i/{code}/pay", data=data, follow_redirects=False)


def test_pages_render():
    c = client()
    for url in ["/", "/i/WEDDING1", "/i/FUNERAL1", "/support", "/host/login", "/venue/login",
                "/admin/login", "/healthz"]:
        assert c.get(url).status_code == 200, url


def test_guest_payment_receipt_ticket_cancel():
    c = client()
    r = pay(c, "FUNERAL1", 50000)
    assert r.status_code == 303 and r.headers["location"].startswith("/g/")
    receipt = c.get(r.headers["location"])
    assert "결제 영수증" in receipt.text and "<svg" in receipt.text  # 모바일 식권 QR
    assert "경조금 지급확인서" in c.get(r.headers["location"] + "/certificate").text
    c.post(r.headers["location"] + "/cancel")
    assert "취소" in c.get(r.headers["location"]).text


def test_limits_block():
    c = client()
    for amount, msg in [(600000, "1건 결제 한도"), (5000, "1만 원 이상")]:
        r = pay(c, "WEDDING1", amount)
        assert r.headers["location"].endswith("#gift")
        assert msg in c.get("/i/WEDDING1").text
    r = pay(c, "WEDDING1", 100000, installment=6)
    assert "최대 3개월" in c.get("/i/WEDDING1").text
    # 혼주 본인 카드로 자기 행사 결제 차단
    r = pay(c, "WEDDING1", 100000, name="김지은", phone="010-1234-5678", guest_birth="19940312")
    assert "본인 행사" in c.get("/i/WEDDING1").text
    # 승인 거절 카드
    pay(c, "WEDDING1", 100000, card_number="4000000000000002")
    assert "승인 거절" in c.get("/i/WEDDING1").text


def test_monthly_guest_limit():
    c = client()
    for _ in range(4):
        assert pay(c, "FUNERAL1", 500000, name="월한도", phone="01077770000",
                   device="DEV-M").headers["location"].startswith("/g/")
    r = pay(c, "FUNERAL1", 50000, name="월한도", phone="01077770000", device="DEV-M")
    assert r.headers["location"].endswith("#gift")


def test_unverified_event_not_public():
    assert "찾을 수 없습니다" in client().get("/i/PENDING1").text


def test_host_flow_settlement_and_admin_pay():
    c = client()
    host_login(c)
    ev_id = SessionLocal().query(Event).filter_by(code="WEDDING1").one().id
    assert "받은 마음" in c.get(f"/host/events/{ev_id}").text
    c.post(f"/host/events/{ev_id}/settle")
    with SessionLocal() as db:
        assert db.get(Event, ev_id).settlement_status == "requested"
    a = client()
    a.post("/admin/login", data=dict(uid="admin", pw="admin1234"))
    a.post(f"/admin/events/{ev_id}/settle")
    with SessionLocal() as db:
        ev = db.get(Event, ev_id)
        assert ev.settlement_status == "settled"
        assert all(g.status in ("settled", "cancelled") for g in ev.gifts)
    # 정산 후 취소 불가 → 반환 요청 → 혼주 동의
    with SessionLocal() as db:
        g = db.query(Gift).filter_by(event_id=ev_id, status="settled").first()
    from app.web import gift_token
    t = gift_token(g.id)
    client().post(f"/g/{t}/return", data=dict(body="금액을 잘못 보냈어요"))
    page = c.get(f"/host/events/{ev_id}").text
    qid = re.search(r"/host/returns/(\d+)", page).group(1)
    c.post(f"/host/returns/{qid}", data=dict(agree="yes"))
    with SessionLocal() as db:
        assert db.get(Gift, g.id).status == "returned"


def test_settlement_blocked_before_hold_days():
    c = client()
    host_login(c, "박민수", "19700521", "010-2345-6789")
    ev_id = SessionLocal().query(Event).filter_by(code="FUNERAL1").one().id
    c.post(f"/host/events/{ev_id}/settle")
    with SessionLocal() as db:
        assert db.get(Event, ev_id).settlement_status == "none"


def test_risky_event_held_then_cleared():
    c = client()
    host_login(c, "이선호", "19881102", "010-3456-7890")
    ev_id = SessionLocal().query(Event).filter_by(code="RISKY001").one().id
    c.post(f"/host/events/{ev_id}/settle")
    with SessionLocal() as db:
        ev = db.get(Event, ev_id)
        assert ev.settlement_status == "held"
        rules = {a.rule for a in ev.alerts}
        assert "device_multi_payer" in rules and "low_checkin" in rules
        ids = [a.id for a in ev.alerts if a.status == "open"]
    a = client()
    a.post("/admin/login", data=dict(uid="admin", pw="admin1234"))
    for aid in ids:
        a.post(f"/admin/alerts/{aid}", data=dict(decision="cleared", note="가족 대리결제 확인"))
    with SessionLocal() as db:
        assert db.get(Event, ev_id).settlement_status == "requested"


def test_event_cancel_refunds_all():
    c = client()
    host_login(c, "정하늘", "19960707", "010-4567-8901")
    r = c.post("/host/events/new", data=dict(kind="funeral", title="테스트 부고", host_role="상주",
               event_date=str(date.today() + timedelta(days=1)), venue_id=2), follow_redirects=False)
    ev_id = int(r.headers["location"].rsplit("/", 1)[1])
    a = client()
    a.post("/admin/login", data=dict(uid="admin", pw="admin1234"))
    a.post(f"/admin/events/{ev_id}/verify", data=dict(decision="approve", note="장례식장 확인"))
    with SessionLocal() as db:
        code = db.get(Event, ev_id).code
    for i in range(2):
        pay(client(), code, 30000, name=f"조문{i}", phone=f"0105555000{i}", device=f"D{i}")
    c.post(f"/host/events/{ev_id}/cancel", data=dict(reason="일정 변경"))
    with SessionLocal() as db:
        ev = db.get(Event, ev_id)
        assert ev.status == "cancelled" and all(g.status == "cancelled" for g in ev.gifts)


def test_wedding_requires_contract_and_bank_owner_check():
    c = client()
    host_login(c, "정하늘", "19960707", "010-4567-8901")
    r = c.post("/host/events/new", data=dict(kind="wedding", title="x", host_role="신부",
               event_date=str(date.today() + timedelta(days=30)), venue_id=1), follow_redirects=False)
    assert r.headers["location"] == "/host/events/new"
    r = c.post("/host/bank", data=dict(bank_name="국민은행", bank_account="111", bank_holder="다른사람"))
    assert "본인 명의 계좌만" in r.text


def test_venue_checkin():
    with SessionLocal() as db:
        ev = db.query(Event).filter_by(code="FUNERAL1").one()
        g = next(x for x in ev.gifts if x.status == "paid")
        code = g.ticket_code
    v = client()
    v.post("/venue/login", data=dict(venue_id=2, staff_code="2222"))
    assert "확인:" in v.post("/venue/scan", data=dict(code=code)).text
    assert "이미 사용한" in v.post("/venue/scan", data=dict(code=code)).text


def test_admin_pages_and_pii_reveal_logged():
    a = client()
    a.post("/admin/login", data=dict(uid="admin", pw="admin1234"))
    for url in ["/admin", "/admin/events", "/admin/alerts?status=", "/admin/inquiries",
                "/admin/audit", "/admin/settings", "/admin/events/1"]:
        assert a.get(url).status_code == 200, url
    a.post("/admin/events/1/reveal", data=dict(reason="민원 처리 위해 연락처 확인"))
    assert "pii.revealed" in a.get("/admin/audit").text
    a.post("/admin/settings", data=dict(limit_per_gift="400000"))
    assert "limit_per_gift: 500000→400000" in a.get("/admin/audit").text
    a.post("/admin/settings", data=dict(limit_per_gift="500000"))
