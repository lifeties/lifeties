# LifeTies 데모 — 행사 검증형 경조금 신용카드 간편 수납

㈜와이즈앤코 혁신금융서비스 지정 신청서의 서비스 흐름을 그대로 동작하는 화면으로 구현한 데모입니다.
**결제·본인인증·1원 계좌인증·정산 이체·문자 발송은 모두 모의(mock)이며 실제 돈이 오가지 않습니다.**

## 바로 보기 (설치 없이)

**https://lifeties.github.io/lifeties/** — 휴대폰·PC 브라우저에서 바로 열립니다. `docs/` 폴더의 브라우저 전용 버전(`core.js` 업무 규칙·데모 데이터, `ui.js` 화면)으로, 서버 버전과 같은 업무 규칙을 자바스크립트로 옮긴 것입니다. 데이터는 보는 사람의 브라우저에만 저장되며, 첫 화면의 "처음 상태로 되돌리기"로 초기화할 수 있습니다.

## 서버 버전 실행 (Python 3.10 이상)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed                 # 데모 데이터로 DB 초기화
uvicorn app.main:app --reload      # http://localhost:8000
pytest -q                          # 통합 테스트 12개
```

## 데모 계정

| 역할 | 로그인 | 볼 수 있는 것 |
|---|---|---|
| 혼주(신부) | 김지은 · 19940312 · 010-1234-5678 | 지난주 결혼식, 정산 신청 가능 |
| 상주 | 박민수 · 19700521 · 010-2345-6789 | 오늘 장례(정산은 행사일+3일부터) |
| 혼주(신랑) | 이선호 · 19881102 · 010-3456-7890 | 이상거래 경보로 정산 자동 보류 |
| 식장 | 더채플 앳 마포 `1111` · 한빛병원 장례식장 `2222` | 모바일 식권 QR 검표 |
| 운영자 | `admin` / `admin1234` | 식장 확인, 경보 검토, 정산, 민원, 감사 로그, 기준값 |
| 테스트 카드 | 아무 14~16자리 · `4000 0000 0000 0002`는 승인 거절 | |

## 화면 흐름

1. **혼주·상주** `/host` — 휴대폰 본인인증 → 본인 명의 계좌 1원 인증 → 행사 등록(결혼식은 식장 계약서 첨부) → 운영자 식장 확인 후 청첩장·부고 공개 → 결제 현황 → 정산 신청 / 행사 취소 / 반환 동의 / 감사 문자
2. **하객** `/i/{코드}` — 금액·할부(최대 3개월) → 카드결제 → 영수증·모바일 식권 QR → 정산 전 직접 취소 / 정산 후 반환 요청 → 경조금 지급확인서(법인 증빙)
3. **식장** `/venue` — 식권 QR 검표(행사 당일만). 검표 기록이 행사 실재 확인 자료가 됩니다.
4. **운영자** `/admin` — 성과·위험관리·소비자보호 지표, 식장 예약 확인, 이상거래 경보 해제·의심거래 보고, 정산 지급, 민원(15일 기한), 개인정보 원본 열람(사유 기록), 감사 로그, 한도 등 기준값, 보존기간 경과 정보 파기

신청서 항목과 기능의 대응표는 [`docs/application-mapping.md`](docs/application-mapping.md), 화면 캡처는 [`docs/screens/`](docs/screens/)에 있습니다.

## 구조

```
app/
  main.py            FastAPI 앱, 세션
  models.py          User·Venue·Event·Gift·Settlement·RiskAlert·Inquiry·AuditLog·Setting
  services/core.py   한도, 이상거래 규칙, 정산·보류, 취소·반환, 마스킹, 파기
  services/providers.py  결제(PG)·본인인증·1원 인증·이체·문자 mock — 실제 연동 시 이 파일만 교체
  routers/           public(하객) · host · venue · admin
  templates/, static/app.css
tests/test_flow.py   신청서 절차 통합 테스트
docs/                GitHub Pages용 브라우저 전용 데모(index.html, app.js) · 대응표 · 화면 캡처
```

## 실제 연동 시 바꿀 곳

- `services/providers.py`의 `pg_approve`·`pg_cancel`·`pg_payout` → 제휴 PG사 API(정산자금 외부관리 계좌에서 지급)
- `identity_verify` → 휴대폰 본인확인기관, `bank_send_one_won` → 펌뱅킹/오픈뱅킹 1원 인증
- `send_sms` → 알림톡·문자 발송 사업자
- `config.py`의 `SECRET_KEY`, `ADMIN_PASSWORD`는 환경변수로 반드시 교체
