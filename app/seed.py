"""데모 데이터. `python -m app.seed` 로 DB를 비우고 다시 채웁니다.

- 혼주 김지은(결혼식, 지난주 → 정산 가능), 상주 박민수(장례, 오늘), 경보가 걸린 행사 1건
- 식장 2곳(코드: 1111, 2222), 관리자 admin / admin1234
"""
from datetime import date, datetime, timedelta

from .db import Base, SessionLocal, engine
from .models import Event, Gift, User, Venue
from .services import core, providers


def make_user(db, name, birth, phone, bank=True):
    u = User(name=name, birth=birth, phone=phone, ci=providers.identity_verify(name, birth, phone))
    if bank:
        u.bank_name, u.bank_account, u.bank_holder = "국민은행", "123401234567", name
        u.bank_verified_at = datetime.now()
    db.add(u)
    db.flush()
    return u


def gift(db, ev, name, phone, amount, rel="친구", when=None, used=False, device="", msg=""):
    g = Gift(event_id=ev.id, guest_name=name, guest_phone=phone, relation=rel, message=msg,
             amount=amount, installment_months=0, card_brand="국내카드",
             card_last4=phone[-4:], card_owner_ci=providers.identity_verify(name, "19900101", phone),
             device_id=device, pg_tid="T" + core.new_code(12),
             ticket_code=core.new_code(10) if ev.meal_tickets else None)
    if when:
        g.created_at = when
    if used:
        g.ticket_used_at = datetime.combine(ev.event_date, datetime.min.time()) + timedelta(hours=12)
    db.add(g)
    db.flush()
    return g


def run():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    v1 = Venue(name="더채플 앳 마포", kind="wedding", address="서울 마포구 양화로 00",
               phone="02-000-1111", staff_code="1111")
    v2 = Venue(name="한빛병원 장례식장", kind="funeral", address="서울 서대문구 00로 00",
               phone="02-000-2222", staff_code="2222")
    db.add_all([v1, v2])
    db.flush()

    jieun = make_user(db, "김지은", "19940312", "01012345678")
    minsu = make_user(db, "박민수", "19700521", "01023456789")
    sunho = make_user(db, "이선호", "19881102", "01034567890")
    make_user(db, "정하늘", "19960707", "01045678901", bank=False)

    today = date.today()
    w = Event(code="WEDDING1", host_id=jieun.id, venue_id=v1.id, kind="wedding",
              title="김지은 ♥ 최도윤 결혼합니다", host_role="신부",
              message="소중한 분들을 모시고 저희 두 사람이 새 출발을 합니다.",
              event_date=today - timedelta(days=5), event_time="12:30", hall="3층 그랜드홀",
              contract_file=None, status="published", verified_at=datetime.now() - timedelta(days=30),
              verified_by="admin", verify_note="식장 담당자 전화 확인(예약번호 W-2291)",
              created_at=datetime.now() - timedelta(days=40))
    f = Event(code="FUNERAL1", host_id=minsu.id, venue_id=v2.id, kind="funeral",
              title="故 박정자 님 부고", host_role="상주(장남)",
              message="삼가 고인의 명복을 빕니다. 발인: 모레 오전 7시",
              event_date=today, event_time="09:00", hall="특실 2호", status="published",
              verified_at=datetime.now() - timedelta(hours=20), verified_by="admin",
              verify_note="장례식장 이용 확인", meal_tickets=True,
              created_at=datetime.now() - timedelta(days=1))
    r = Event(code="RISKY001", host_id=sunho.id, venue_id=v1.id, kind="wedding",
              title="이선호 ♥ 한소라 결혼식", host_role="신랑", event_date=today - timedelta(days=4),
              event_time="11:00", hall="2층 가든홀", status="published",
              verified_at=datetime.now() - timedelta(days=20), verified_by="admin",
              verify_note="식장 확인", created_at=datetime.now() - timedelta(days=25))
    p = Event(code="PENDING1", host_id=jieun.id, venue_id=v1.id, kind="other",
              title="김지은 님 첫돌 잔치(예시)", host_role="부모", event_date=today + timedelta(days=20),
              status="pending_verify", meal_tickets=False)
    db.add_all([w, f, r, p])
    db.flush()

    guests = [("이민준", "01011112222", 100000, "대학 동기"), ("박서연", "01022223333", 50000, "회사 동료"),
              ("최현우", "01033334444", 200000, "친척"), ("정다은", "01044445555", 100000, "친구"),
              ("강도현", "01055556666", 50000, "회사 동료"), ("윤하린", "01066667777", 300000, "친척"),
              ("조은우", "01077778888", 100000, "친구")]
    for i, (n, ph, a, rel) in enumerate(guests):
        gift(db, w, n, ph, a, rel, when=datetime.now() - timedelta(days=6, hours=i), used=i < 6,
             msg="결혼 축하해!" if i % 2 == 0 else "")
    for i, (n, ph, a, rel) in enumerate(guests[:4]):
        gift(db, f, n, ph, a // 2 if a > 60000 else a, "지인", when=datetime.now() - timedelta(hours=3 + i))
    # 경보 사례: 같은 기기 여러 명의 결제, 식권 사용률 저조
    for i in range(6):
        g = gift(db, r, f"하객{i + 1}", f"0109000000{i}", 300000, "지인",
                 when=datetime.now() - timedelta(days=5, minutes=i * 3), device="DEVICE-X")
        if i >= 2:
            core.run_rules_for_gift(db, r, g)
    db.commit()
    print("seeded")


if __name__ == "__main__":
    run()
