/* LifeTies 데모 (GitHub Pages용, 브라우저에서만 동작)
 * 서버 버전(app/)과 같은 업무 규칙을 자바스크립트로 옮긴 것입니다.
 * 결제·본인인증·계좌인증·문자는 모두 모의이며 데이터는 이 브라우저에만 저장됩니다. */
'use strict';
const KEY = 'lifeties-demo-v1';
const DAY = 86400000;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = n => (n || 0).toLocaleString('ko-KR') + '원';
const digits = s => String(s || '').replace(/\D/g, '');
const maskName = n => !n ? '' : n.length <= 1 ? '*' : n.length === 2 ? n[0] + '*' : n[0] + '*'.repeat(n.length - 2) + n.at(-1);
const maskPhone = p => { p = digits(p); return p.length >= 8 ? `${p.slice(0, 3)}-****-${p.slice(-4)}` : '***'; };
const maskAcc = a => { a = digits(a); return a ? '*'.repeat(Math.max(a.length - 4, 0)) + a.slice(-4) : ''; };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const ymd = d => { d = new Date(d); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const hm = d => { d = new Date(d); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY);
const code = (n = 8) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
const ci = (name, birth, phone) => 'CI-' + String(name).replace(/\s/g, '') + '-' + digits(birth) + '-' + digits(phone);

const KIND = { wedding: '결혼식', funeral: '장례식', other: '기타 경조사' };
const EV_ST = { pending_verify: '식장 확인 중', published: '공개', rejected: '반려', cancelled: '취소' };
const SET_ST = { none: '정산 전', requested: '정산 대기', held: '정산 보류', settled: '정산 완료' };
const G_ST = { paid: '결제 완료', cancelled: '취소', settled: '정산 완료', return_requested: '반환 요청', returned: '반환 완료' };
const RULES = { device_multi_payer: '같은 기기에서 여러 명의로 결제', repeat_guest: '한 하객의 30일 내 반복 결제', low_checkin: '식권 사용률 저조', new_user_high: '개설 당일 고액 결제', sanction_list: '제재대상자 명단 일치' };
const DEFAULTS = {
  limit_per_gift: [500000, '1건 결제 한도', '원'], limit_per_event: [30000000, '행사당 총액 한도', '원'],
  limit_guest_monthly: [2000000, '하객 1인 월 누적 한도', '원'], limit_host_events_per_year: [3, '혼주(상주) 1인 연간 행사 개설', '회'],
  settlement_hold_days: [3, '정산 대기(행사일 이후)', '일'], fee_rate_bp: [250, '결제수수료(0.01% 단위)', 'bp'],
  rule_device_distinct_payers: [3, '같은 기기 결제자 수 경보', '명'], rule_repeat_guest_events: [4, '30일 내 한 하객 결제 행사 수 경보', '건'],
  rule_high_amount_new_user: [300000, '개설 당일 고액 결제 경보', '원'], rule_min_checkin_ratio_pct: [20, '식권 사용률 하한', '%'],
};

let S; // 전체 상태
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const set = k => S.settings[k];
const nextId = t => (S.seq[t] = (S.seq[t] || 0) + 1);
const ev = id => S.events.find(e => e.id === +id);
const evByCode = c => S.events.find(e => e.code === c);
const user = id => S.users.find(u => u.id === +id);
const venue = id => S.venues.find(v => v.id === +id);
const gifts = e => S.gifts.filter(g => g.event_id === e.id);
const audit = (actor, action, target = '', detail = '') => S.audit.unshift({ at: Date.now(), actor, action, target, detail });
const sms = (phone, body) => S.sms.unshift({ at: Date.now(), phone: digits(phone), body });
let flashes = [];
const flash = (msg, kind = 'ok') => flashes.push([kind, msg]);
class RuleError extends Error {}

/* ── 데모 데이터 ─────────────────────────────────────────── */
function seed() {
  const t = today();
  S = { seq: {}, settings: Object.fromEntries(Object.entries(DEFAULTS).map(([k, v]) => [k, v[0]])), users: [], venues: [], events: [], gifts: [], alerts: [], blocked: [], inquiries: [], settlements: [], audit: [], sms: [], session: {} };
  S.venues = [{ id: 1, name: '더채플 앳 마포', kind: 'wedding', phone: '02-000-1111', staff: '1111' }, { id: 2, name: '한빛병원 장례식장', kind: 'funeral', phone: '02-000-2222', staff: '2222' }];
  const mk = (name, birth, phone, bank = true) => { const u = { id: nextId('u'), name, birth, phone: digits(phone), ci: ci(name, birth, phone) }; if (bank) Object.assign(u, { bank_name: '국민은행', bank_account: '123401234567', bank_ok: Date.now() }); S.users.push(u); return u; };
  const jieun = mk('김지은', '19940312', '01012345678'), minsu = mk('박민수', '19700521', '01023456789'), sunho = mk('이선호', '19881102', '01034567890');
  mk('정하늘', '19960707', '01045678901', false);
  const E = (o) => { const e = Object.assign({ id: nextId('e'), meal: true, settle: 'none', hold: '', hall: '', time: '12:00', message: '', note: '', created: Date.now() }, o); S.events.push(e); return e; };
  const w = E({ code: 'WEDDING1', host: jieun.id, venue: 1, kind: 'wedding', title: '김지은 ♥ 최도윤 결혼합니다', role: '신부', message: '소중한 분들을 모시고 저희 두 사람이 새 출발을 합니다.', date: ymd(addDays(t, -5)), time: '12:30', hall: '3층 그랜드홀', status: 'published', note: '식장 담당자 전화 확인(예약번호 W-2291)', created: addDays(t, -40).getTime() });
  const f = E({ code: 'FUNERAL1', host: minsu.id, venue: 2, kind: 'funeral', title: '故 박정자 님 부고', role: '상주(장남)', message: '삼가 고인의 명복을 빕니다. 발인: 모레 오전 7시', date: ymd(t), time: '09:00', hall: '특실 2호', status: 'published', note: '장례식장 이용 확인', created: addDays(t, -1).getTime() });
  const r = E({ code: 'RISKY001', host: sunho.id, venue: 1, kind: 'wedding', title: '이선호 ♥ 한소라 결혼식', role: '신랑', date: ymd(addDays(t, -4)), time: '11:00', hall: '2층 가든홀', status: 'published', note: '식장 확인', created: addDays(t, -25).getTime() });
  E({ code: 'PENDING1', host: jieun.id, venue: 1, kind: 'other', title: '김지은 님 첫돌 잔치(예시)', role: '부모', date: ymd(addDays(t, 20)), status: 'pending_verify', meal: false, contract: '계약서_예시.pdf' });
  const G = (e, name, phone, amount, rel, at, used, device = '', msg = '') => { const g = { id: nextId('g'), event_id: e.id, name, phone: digits(phone), rel, msg, amount, inst: 0, brand: '국내카드', last4: digits(phone).slice(-4), payer: ci(name, '19900101', phone), device, tid: 'T' + code(12), ticket: e.meal ? code(10) : null, used: used ? new Date(e.date + 'T12:00').getTime() : null, status: 'paid', at }; S.gifts.push(g); return g; };
  const guests = [['이민준', '01011112222', 100000, '대학 동기'], ['박서연', '01022223333', 50000, '회사 동료'], ['최현우', '01033334444', 200000, '친척'], ['정다은', '01044445555', 100000, '친구'], ['강도현', '01055556666', 50000, '회사 동료'], ['윤하린', '01066667777', 300000, '친척'], ['조은우', '01077778888', 100000, '친구']];
  guests.forEach(([n, p, a, rel], i) => G(w, n, p, a, rel, addDays(t, -6).getTime() + i * 3600e3, i < 6, '', i % 2 ? '' : '결혼 축하해!'));
  guests.slice(0, 4).forEach(([n, p, a], i) => G(f, n, p, a > 60000 ? a / 2 : a, '지인', Date.now() - (3 + i) * 3600e3, false));
  for (let i = 0; i < 6; i++) { const g = G(r, `하객${i + 1}`, `0109000000${i}`, 300000, '지인', addDays(t, -5).getTime() + i * 180e3, false, 'DEVICE-X'); if (i >= 2) rulesForGift(r, g); }
  save();
}

/* ── 업무 규칙 (서버 버전 services/core.py 와 동일) ─────────── */
function totals(e) {
  const p = gifts(e).filter(g => ['paid', 'settled', 'return_requested'].includes(g.status));
  const tk = p.filter(g => g.ticket), used = tk.filter(g => g.used);
  return { count: p.length, gross: p.reduce((s, g) => s + g.amount, 0), tickets: tk.length, used: used.length, pct: tk.length ? Math.round(100 * used.length / tk.length) : null };
}
const settleOn = e => addDays(e.date, set('settlement_hold_days'));
const openAlerts = e => S.alerts.filter(a => a.event_id === e.id && a.status === 'open');
function alert(e, rule, sev, detail, g) {
  if (openAlerts(e).some(a => a.rule === rule)) return;
  S.alerts.unshift({ id: nextId('a'), event_id: e.id, gift_id: g?.id, rule, sev, detail, status: 'open', at: Date.now() });
  audit('system', 'risk.alert', 'event:' + e.code, rule + ': ' + detail);
}
function rulesForGift(e, g) {
  if (g.device) { const n = new Set(S.gifts.filter(x => x.device === g.device && x.status !== 'cancelled').map(x => x.payer)).size; if (n >= set('rule_device_distinct_payers')) alert(e, 'device_multi_payer', 'high', `같은 기기에서 ${n}명 명의로 결제`, g); }
  const n2 = new Set(S.gifts.filter(x => x.payer === g.payer && x.at > Date.now() - 30 * DAY && x.status !== 'cancelled').map(x => x.event_id)).size;
  if (n2 >= set('rule_repeat_guest_events')) alert(e, 'repeat_guest', 'medium', `${maskName(g.name)} 님이 30일 내 ${n2}개 행사에 결제`, g);
  if (ymd(g.at) === ymd(e.created) && g.amount >= set('rule_high_amount_new_user')) alert(e, 'new_user_high', 'medium', `행사 개설 당일 ${won(g.amount)} 결제`, g);
  if (g.name.replace(/\s/g, '') === '홍길동테스트') alert(e, 'sanction_list', 'high', '제재대상자 명단과 이름 일치', g);
}
function rulesForEvent(e) {
  const t = totals(e);
  if (e.meal && t.tickets >= 5 && t.pct !== null && t.pct < set('rule_min_checkin_ratio_pct')) alert(e, 'low_checkin', 'high', `식권 사용률 ${t.pct}% (기준 ${set('rule_min_checkin_ratio_pct')}%)`);
}
function pay(e, f) {
  const amount = +f.amount, inst = +f.inst, payer = ci(f.name, f.birth, f.phone);
  let reason = null;
  if (e.status !== 'published') reason = '공개된 행사가 아닙니다.';
  else if (!(amount >= 10000) || amount % 1000) reason = '금액은 1만 원 이상, 1천 원 단위로 입력해 주세요.';
  else if (amount > set('limit_per_gift')) reason = `1건 결제 한도(${won(set('limit_per_gift'))})를 넘었습니다.`;
  else if (![0, 2, 3].includes(inst)) reason = '할부는 최대 3개월까지 가능합니다.';
  else if (payer === user(e.host).ci) reason = '본인 행사에는 본인 카드로 결제할 수 없습니다.';
  else if (gifts(e).filter(g => g.status !== 'cancelled').reduce((s, g) => s + g.amount, 0) + amount > set('limit_per_event')) reason = `행사당 총액 한도(${won(set('limit_per_event'))})를 넘었습니다.`;
  else { const m = new Date(); m.setDate(1); m.setHours(0, 0, 0, 0); const mt = S.gifts.filter(g => g.payer === payer && g.status !== 'cancelled' && g.at >= m.getTime()).reduce((s, g) => s + g.amount, 0); if (mt + amount > set('limit_guest_monthly')) reason = `하객 1인 월 누적 한도(${won(set('limit_guest_monthly'))})를 넘었습니다.`; }
  if (reason) { S.blocked.unshift({ event_id: e.id, reason, amount, at: Date.now() }); save(); throw new RuleError(reason); }
  const card = digits(f.card);
  if (card.length < 14 || card.length > 16) throw new RuleError('카드번호를 확인해 주세요.');
  if (card === '4000000000000002') throw new RuleError('카드사 승인 거절(테스트 카드)');
  if (digits(f.exp).length !== 4) throw new RuleError('유효기간(MM/YY)을 확인해 주세요.');
  const g = { id: nextId('g'), event_id: e.id, name: f.name.trim(), phone: digits(f.phone), rel: f.rel, msg: (f.msg || '').slice(0, 300), amount, inst, brand: { 4: 'VISA', 5: 'Mastercard', 9: '국내전용' }[card[0]] || '국내카드', last4: card.slice(-4), payer, device: f.device, tid: 'T' + code(12), ticket: e.meal ? code(10) : null, used: null, status: 'paid', at: Date.now(), corp: f.corp ? f.corp_name : '' };
  S.gifts.push(g);
  rulesForGift(e, g);
  sms(g.phone, `[LifeTies] ${e.title}에 ${won(amount)} 결제가 완료되었습니다. 정산 전까지 언제든 취소할 수 있습니다.`);
  audit('guest', 'gift.paid', 'gift:' + g.id, `event=${e.code} amount=${amount}`);
  save(); return g;
}
function cancelGift(g, actor, why) {
  const e = ev(g.event_id);
  if (g.status !== 'paid' || e.settle === 'settled') throw new RuleError('정산 전 결제만 취소할 수 있습니다. 정산 후에는 반환 요청을 이용해 주세요.');
  g.status = 'cancelled'; g.cancelled = Date.now();
  sms(g.phone, `[LifeTies] ${e.title} 결제 ${won(g.amount)}이 취소되었습니다. (${why})`);
  audit(actor, 'gift.cancelled', 'gift:' + g.id, why);
}
function cancelEvent(e, actor, why) {
  if (e.settle === 'settled') throw new RuleError('이미 정산된 행사는 취소할 수 없습니다.');
  let n = 0; gifts(e).forEach(g => { if (g.status === 'paid') { cancelGift(g, actor, '행사 취소: ' + why); n++; } });
  e.status = 'cancelled'; audit(actor, 'event.cancelled', 'event:' + e.code, `${why} / 자동취소 ${n}건`); save(); return n;
}
function requestSettle(e) {
  const u = user(e.host);
  if (e.status !== 'published') throw new RuleError('공개된 행사만 정산할 수 있습니다.');
  if (!u.bank_ok) throw new RuleError('정산 계좌(본인 명의) 인증을 먼저 완료해 주세요.');
  if (today() < settleOn(e)) throw new RuleError(`정산은 ${ymd(settleOn(e))}부터 신청할 수 있습니다(행사 전 인출 불가).`);
  rulesForEvent(e);
  if (openAlerts(e).length) { e.settle = 'held'; e.hold = '이상거래 경보 검토 중: ' + openAlerts(e).map(a => RULES[a.rule]).join(', '); audit('host:' + u.id, 'settlement.held', 'event:' + e.code, e.hold); save(); return 'held'; }
  e.settle = 'requested'; audit('host:' + u.id, 'settlement.requested', 'event:' + e.code); save(); return 'requested';
}
function executeSettle(e) {
  if (e.settle !== 'requested' || openAlerts(e).length) throw new RuleError('정산 대기 상태가 아니거나 열린 경보가 있습니다.');
  const u = user(e.host), gs = gifts(e).filter(g => g.status === 'paid'), gross = gs.reduce((s, g) => s + g.amount, 0), fee = Math.floor(gross * set('fee_rate_bp') / 10000);
  const st = { event_id: e.id, gross, fee, net: gross - fee, bank: u.bank_name, acc: maskAcc(u.bank_account), payout: 'P' + code(12), at: Date.now() };
  S.settlements.push(st); gs.forEach(g => g.status = 'settled'); e.settle = 'settled';
  sms(u.phone, `[LifeTies] ${e.title} 정산 ${won(st.net)}이 ${u.bank_name} ${maskAcc(u.bank_account)} 계좌로 입금되었습니다.`);
  audit('admin', 'settlement.paid', 'event:' + e.code, `gross=${gross} fee=${fee} net=${st.net}`); save(); return st;
}
function reviewAlert(a, decision, note) {
  a.status = decision; a.note = note; a.reviewed = Date.now();
  const e = ev(a.event_id);
  audit('admin', 'risk.' + decision, 'alert:' + a.id, note);
  if (decision === 'reported') { e.settle = 'held'; e.hold = '의심거래 보고(제휴사 보고책임자 → FIU) 진행 중'; }
  else if (e.settle === 'held' && !openAlerts(e).length) { e.settle = 'requested'; e.hold = ''; }
  save();
}

/* ── 화면 ──────────────────────────────────────────────────── */
const pill = (txt, k = '') => `<span class="pill ${k}">${esc(txt)}</span>`;
const nav = {
  public: `<a href="#/host">혼주·상주</a><a href="#/venue">식장</a><a href="#/admin">운영자</a><a href="#/support">고객센터</a>`,
  host: `<a href="#/host">내 행사</a><a href="#/host/bank">정산 계좌</a><a href="#/" data-logout="host">로그아웃</a>`,
  admin: a => [['', '대시보드'], ['/events', '행사'], ['/alerts', '이상거래'], ['/inquiries', '민원'], ['/audit', '감사 로그'], ['/settings', '기준값']].map(([p, l]) => `<a class="${a === p ? 'on' : ''}" href="#/admin${p}">${l}</a>`).join('') + `<a href="#/" data-logout="admin">로그아웃</a>`,
};
function page(area, navHtml, body, narrow = false) {
  return `<header class="top"><div class="in"><a class="brand" href="#/">LifeTies<small>${area}</small></a><nav class="nav">${navHtml}</nav></div></header>
  <main class="wrap ${narrow ? 'narrow' : ''}">${flashes.map(([k, m]) => `<div class="flash ${k}">${esc(m)}</div>`).join('')}${body}</main>`;
}
const routes = [];
const route = (re, fn) => routes.push([re, fn]);

route(/^\/?$/, () => page('경조금 간편 수납', nav.public, `
<div class="card tint"><div class="eyebrow">Demo</div><h1>행사 검증형 경조금 신용카드 간편 수납</h1>
<p>하객은 모바일 청첩장·부고에서 신용카드로 축의금·조의금을 보내고, 혼주(상주)는 행사 확인 후 본인 명의 계좌로 정산받습니다. ㈜와이즈앤코 혁신금융서비스 지정 신청서의 절차를 그대로 눌러 볼 수 있습니다.</p></div>
<div class="grid g3">
<div class="card"><h3>① 하객</h3><p class="small muted">청첩장·부고 → 금액·할부(최대 3개월) → 카드결제 → 영수증·모바일 식권 QR → 정산 전 취소 · 정산 후 반환 요청 · 지급확인서</p><a class="btn sm" href="#/i/WEDDING1">결혼식 청첩장</a> <a class="btn sm ghost" href="#/i/FUNERAL1">부고</a></div>
<div class="card"><h3>② 혼주·상주</h3><p class="small muted">본인인증 → 정산계좌 1원 인증 → 행사 등록 → 결제 현황 → 정산 신청 · 행사 취소 · 반환 동의 · 감사 문자</p><a class="btn sm" href="#/host">혼주로 들어가기</a></div>
<div class="card"><h3>③ 식장 · 운영자</h3><p class="small muted">식장: 식권 QR 검표 · 운영자: 식장 예약 확인, 이상거래 경보 검토, 정산 보류·지급, 민원, 감사 로그, 한도 설정</p><a class="btn sm ghost" href="#/venue">식장</a> <a class="btn sm ghost" href="#/admin">운영자</a></div></div>
<div class="card"><h2>둘러보기 순서(5분)</h2><ol class="steps">
<li><a href="#/i/WEDDING1">결혼식 청첩장</a>에서 10만원을 결제해 보세요(카드번호는 아무 16자리). 영수증과 모바일 식권이 나옵니다.</li>
<li>같은 화면에서 60만원을 결제해 보면 <b>1건 한도</b>에 막힙니다.</li>
<li><a href="#/host">혼주(김지은)</a>로 들어가 지난주 결혼식의 <b>정산 신청</b>을 누릅니다.</li>
<li><a href="#/admin">운영자</a>에서 정산을 지급하고, 이선호 님 행사의 <b>이상거래 경보</b>(같은 기기 여러 명의)를 검토합니다.</li>
<li><a href="#/venue">식장</a>에서 부고 하객의 식권 번호로 검표해 봅니다.</li></ol></div>
<div class="card"><h2>데모 계정</h2><table>
<tr><th>역할</th><th>로그인</th><th>비고</th></tr>
<tr><td>혼주(신부)</td><td>김지은 · 19940312 · 010-1234-5678</td><td>지난주 결혼식, 정산 신청 가능</td></tr>
<tr><td>상주</td><td>박민수 · 19700521 · 010-2345-6789</td><td>오늘 장례(정산은 행사일+3일부터)</td></tr>
<tr><td>혼주(신랑)</td><td>이선호 · 19881102 · 010-3456-7890</td><td>이상거래 경보 → 정산 자동 보류</td></tr>
<tr><td>식장</td><td>더채플 앳 마포 1111 · 한빛병원 장례식장 2222</td><td>식권 검표</td></tr>
<tr><td>운영자</td><td>admin / admin1234</td><td></td></tr>
<tr><td>테스트 카드</td><td>아무 16자리 · 4000 0000 0000 0002는 승인 거절</td><td>유효기간 아무 MM/YY</td></tr></table>
<p class="small muted" style="margin-top:12px">데이터는 이 브라우저에만 저장됩니다. <a href="#/reset">처음 상태로 되돌리기</a></p></div>`));

route(/^\/reset$/, () => { seed(); flash('데모 데이터를 처음 상태로 되돌렸습니다.'); return go('#/'); });

/* 하객 */
route(/^\/i\/(\w+)$/, ([c]) => {
  const e = evByCode(c);
  if (!e || !['published', 'cancelled'].includes(e.status)) return page('경조금 간편 수납', nav.public, `<div class="card"><h2>페이지를 찾을 수 없습니다</h2><p class="muted">아직 식장 확인 중이거나 주소가 잘못되었습니다.</p></div>`, true);
  const v = venue(e.venue), word = e.kind === 'wedding' ? '축의금' : e.kind === 'funeral' ? '조의금' : '경조금';
  return page('경조금 간편 수납', nav.public, `
<div class="inv"><div class="hero ${e.kind === 'funeral' ? 'funeral' : ''}"><div class="eyebrow" style="color:#C7CDF5">${KIND[e.kind]}</div><h1>${esc(e.title)}</h1>
<p>${e.date.replace(/-/g, '.')} ${e.time}</p><p>${esc(v.name)} ${esc(e.hall)}</p></div>
<div style="padding:22px">${e.message ? `<p style="white-space:pre-line">${esc(e.message)}</p>` : ''}<p class="small">${pill('✓ 식장 확인 완료', 'ok')} <span class="muted">와이즈앤코가 ${esc(v.name)}에 예약을 확인했습니다.</span></p></div></div>
${e.status === 'cancelled' ? `<div class="flash err" style="margin-top:18px">취소된 행사입니다. 결제하신 금액은 모두 자동 취소되었습니다.</div>` : `
<form class="card" data-form="pay" data-code="${e.code}" style="margin-top:18px"><h2>${word} 보내기</h2>
<p class="small muted">신용카드로 결제하면 행사 확인 후 ${esc(e.role)} 본인 명의 계좌로 정산됩니다. 연락처·계좌는 서로에게 공개되지 않습니다.</p>
<label>금액</label><input name="amount" type="number" min="10000" step="1000" required placeholder="예: 100000">
<div class="amounts">${[50000, 100000, 200000, 300000].map(a => `<button type="button" data-amount="${a}">${a / 10000}만원</button>`).join('')}</div>
<p class="small muted">1건 최대 ${won(set('limit_per_gift'))} · 하객 1인 월 ${won(set('limit_guest_monthly'))}</p>
<div class="row"><div><label>보내는 분</label><input name="name" required></div><div><label>관계</label><input name="rel" placeholder="예: 대학 동기"></div></div>
<div class="row"><div><label>생년월일(8자리)</label><input name="birth" required pattern="\\d{8}" placeholder="19900101"></div><div><label>휴대폰</label><input name="phone" required placeholder="010-0000-0000"></div></div>
<label>전하는 말(선택)</label><textarea name="msg" maxlength="300"></textarea>
<h3 style="margin-top:20px">카드 정보 ${pill('모의 결제')}</h3>
<label>카드번호</label><input name="card" required inputmode="numeric" placeholder="아무 16자리 숫자">
<div class="row"><div><label>유효기간</label><input name="exp" required placeholder="MM/YY"></div><div><label>할부</label><select name="inst"><option value="0">일시불</option><option value="2">2개월</option><option value="3">3개월</option></select></div></div>
<label class="check"><input type="checkbox" name="corp"> 법인카드(지급확인서 발급)</label><input name="corp_name" placeholder="법인명(법인카드일 때)">
<div class="card tint small" style="margin:16px 0 0;padding:14px"><b>취소·환불 안내</b><br>· 정산 전(행사일 + ${set('settlement_hold_days')}일)까지는 영수증 화면에서 바로 취소할 수 있습니다.<br>· 행사가 취소되면 결제는 자동 취소됩니다.<br>· 정산 후에는 반환 요청을 접수해 ${esc(e.role)} 동의를 거쳐 처리합니다.</div>
<label class="check"><input type="checkbox" name="agree" required> 이용약관, 개인정보 수집·이용, 취소·환불 안내에 동의합니다.</label>
<button class="btn block" style="margin-top:12px">결제하기</button></form>`}`, true);
});
route(/^\/g\/(\d+)$/, ([id]) => {
  const g = S.gifts.find(x => x.id === +id); if (!g) return go('#/');
  const e = ev(g.event_id), v = venue(e.venue), k = ['cancelled', 'returned'].includes(g.status) ? 'err' : g.status === 'return_requested' ? 'warn' : 'ok';
  return page('경조금 간편 수납', nav.public, `
<div class="card"><div class="side"><h2 style="margin:0">결제 영수증</h2>${pill(G_ST[g.status], k)}</div>
<dl class="kv" style="margin-top:14px"><dt>행사</dt><dd>${esc(e.title)}</dd><dt>일시</dt><dd>${e.date} ${e.time} · ${esc(v.name)}</dd>
<dt>보내는 분</dt><dd>${esc(g.name)}${g.rel ? ` (${esc(g.rel)})` : ''}</dd><dt>금액</dt><dd><b>${won(g.amount)}</b> · ${g.inst ? g.inst + '개월 할부' : '일시불'}</dd>
<dt>카드</dt><dd>${g.brand} ****${g.last4}</dd><dt>승인번호</dt><dd class="mono">${g.tid}</dd><dt>결제일시</dt><dd>${ymd(g.at)} ${hm(g.at)}</dd></dl></div>
${g.ticket && g.status !== 'cancelled' ? `<div class="card"><div class="ticket"><div class="eyebrow">Mobile Meal Ticket</div><h3>모바일 식권</h3><div id="qr" data-qr="LIFETIES-TICKET:${g.ticket}"></div>
<div class="mono" style="font-size:18px;letter-spacing:.15em">${g.ticket}</div><p class="small muted">${g.used ? pill('사용 완료 ' + hm(g.used), 'ok') : '식장 입구에서 QR을 보여 주세요. 행사 당일에만 사용할 수 있습니다.'}</p></div></div>` : ''}
<div class="card">${g.status === 'paid' ? `<h3>결제 취소</h3><p class="small muted">정산 전이라 바로 취소할 수 있습니다.</p><button class="btn danger" data-act="cancel-gift" data-id="${g.id}">결제 취소</button>`
      : g.status === 'settled' ? `<h3>반환 요청</h3><p class="small muted">이미 정산되었습니다. 반환 요청을 남기면 ${esc(e.role)} 동의 후 처리되며, 결과는 문자로 알려 드립니다.</p><form data-form="return" data-id="${g.id}"><textarea name="body" required placeholder="반환 사유"></textarea><button class="btn ghost" style="margin-top:8px">반환 요청</button></form>`
      : g.status === 'return_requested' ? `<p>반환 요청을 접수했습니다. ${esc(e.role)} 동의를 기다리고 있습니다.</p>` : ''}
${g.status !== 'cancelled' ? `<p style="margin-top:14px"><a href="#/g/${g.id}/cert">경조금 지급확인서 보기 →</a></p>` : ''}</div>
<p class="small muted"><a href="#/i/${e.code}">← 청첩장으로 돌아가기</a></p>`, true);
});
route(/^\/g\/(\d+)\/cert$/, ([id]) => {
  const g = S.gifts.find(x => x.id === +id), e = ev(g.event_id);
  return page('경조금 간편 수납', nav.public, `<div class="cert"><div style="text-align:center"><div class="eyebrow">Certificate</div><h1>경조금 지급확인서</h1><p class="muted small">발급번호 LT-${String(g.id).padStart(6, '0')}-${g.tid.slice(-6)}</p></div>
<dl class="kv" style="margin:28px 0;grid-template-columns:140px 1fr">${g.corp ? `<dt>지급 법인</dt><dd>${esc(g.corp)}</dd>` : ''}<dt>지급인</dt><dd>${esc(g.name)}</dd><dt>경조사 구분</dt><dd>${KIND[e.kind]}</dd><dt>행사</dt><dd>${esc(e.title)}</dd>
<dt>행사일·장소</dt><dd>${e.date} · ${esc(venue(e.venue).name)}</dd><dt>수령인</dt><dd>${maskName(user(e.host).name)} (${esc(e.role)})</dd><dt>지급액</dt><dd><b>${won(g.amount)}</b></dd><dt>결제수단</dt><dd>신용카드 ${g.brand} ****${g.last4} (승인 ${g.tid})</dd><dt>결제일</dt><dd>${ymd(g.at)}</dd></dl>
<p class="small muted">위 금액을 경조금으로 지급하였음을 확인합니다. 행사 실재는 제휴 식장 예약 확인으로 검증되었습니다.</p><p style="text-align:right;margin-top:30px">${ymd(new Date())}<br><b>㈜와이즈앤코</b> (LifeTies)</p>
<button class="btn ghost noprint" onclick="print()">인쇄 / PDF 저장</button> <a class="btn ghost noprint" href="#/g/${g.id}">영수증으로</a></div>`);
});
route(/^\/support$/, () => page('고객센터', nav.public, `<form class="card" data-form="support"><h2>고객센터 문의</h2><p class="small muted">접수 후 15일 이내에 문자로 답변드립니다. 결제 취소는 영수증 화면에서 직접 할 수 있습니다.</p>
<div class="row"><div><label>이름</label><input name="name" required></div><div><label>휴대폰</label><input name="phone" required></div></div>
<label>구분</label><select name="kind"><option value="general">일반 문의</option><option value="complaint">민원·불만</option></select><label>내용</label><textarea name="body" required></textarea><button class="btn" style="margin-top:12px">문의 접수</button></form>`, true));

/* 혼주·상주 */
const me = () => user(S.session.host);
route(/^\/host$/, () => {
  const u = me();
  if (!u) return page('혼주·상주', nav.public, `<form class="card" data-form="host-login"><div class="eyebrow">Step 1</div><h2>휴대폰 본인인증</h2>
<p class="small muted">행사를 여는 혼주·상주 본인만 정산받을 수 있도록 본인인증을 합니다. 주민등록번호는 받지 않습니다.</p>
<label>이름</label><input name="name" required value="김지은"><label>생년월일 8자리</label><input name="birth" required value="19940312"><label>휴대폰</label><input name="phone" required value="010-1234-5678">
<p class="small muted">다른 데모 계정: 박민수 19700521 010-2345-6789 / 이선호 19881102 010-3456-7890</p>
<label class="check"><input type="checkbox" name="agree" checked required> 개인정보 수집·이용 동의(본인인증 결과, 연락처, 정산 계좌, 행사 정보)</label><button class="btn block" style="margin-top:14px">인증하고 시작(모의)</button></form>`, true);
  const evs = S.events.filter(e => e.host === u.id).sort((a, b) => b.id - a.id);
  return page('혼주·상주', nav.host, `<div class="side" style="justify-content:space-between"><h1>${esc(u.name)} 님의 행사</h1><a class="btn" href="#/host/new">+ 행사 등록</a></div>
${u.bank_ok ? `<p class="small muted">정산 계좌: ${u.bank_name} ${maskAcc(u.bank_account)} (본인 명의 확인)</p>` : `<div class="flash warn">정산 계좌가 아직 없습니다. <a href="#/host/bank">본인 명의 계좌 1원 인증 →</a></div>`}
<div class="card"><table><tr><th>행사</th><th>일자</th><th>상태</th><th class="num">결제</th><th class="num">금액</th><th>정산</th></tr>
${evs.map(e => { const t = totals(e); return `<tr><td><a href="#/host/e/${e.id}">${esc(e.title)}</a><div class="small muted">${KIND[e.kind]} · ${esc(venue(e.venue).name)}</div></td><td>${e.date}</td><td>${pill(EV_ST[e.status], e.status === 'published' ? 'ok' : ['cancelled', 'rejected'].includes(e.status) ? 'err' : 'warn')}</td><td class="num">${t.count}건</td><td class="num">${won(t.gross)}</td><td>${pill(SET_ST[e.settle], e.settle === 'settled' ? 'ok' : e.settle === 'held' ? 'err' : '')}</td></tr>`; }).join('') || `<tr><td colspan="6" class="muted">아직 등록한 행사가 없습니다.</td></tr>`}</table></div>`);
});
route(/^\/host\/bank$/, () => {
  const u = me(); if (!u) return go('#/host');
  return page('혼주·상주', nav.host, `<form class="card" data-form="bank"><div class="eyebrow">Step 2</div><h2>정산 계좌 등록</h2><p class="small muted">정산은 본인 명의 계좌로만 합니다(가상계좌 미사용). 1원을 보내 예금주를 확인합니다.</p>
<label>은행</label><select name="bank">${['국민은행', '신한은행', '우리은행', '하나은행', '농협은행', '카카오뱅크', '토스뱅크'].map(b => `<option ${u.bank_name === b ? 'selected' : ''}>${b}</option>`).join('')}</select>
<label>계좌번호</label><input name="acc" required value="${esc(u.bank_account || '')}"><label>예금주</label><input name="holder" required value="${esc(u.name)}"><button class="btn block" style="margin-top:14px">1원 보내기(모의)</button></form>
${S.session.bank ? `<form class="card" data-form="bank-verify"><h3>입금자명 숫자 4자리</h3><input name="code" required maxlength="4" inputmode="numeric"><button class="btn block" style="margin-top:10px">확인</button></form>` : ''}`, true);
});
route(/^\/host\/new$/, () => {
  if (!me()) return go('#/host');
  return page('혼주·상주', nav.host, `<form class="card" data-form="new-event"><div class="eyebrow">Step 3</div><h2>행사 등록</h2>
<label>구분</label><select name="kind"><option value="wedding">결혼식</option><option value="funeral">장례식</option><option value="other">기타 경조사</option></select>
<label>제목</label><input name="title" required placeholder="예: 김지은 ♥ 최도윤 결혼합니다"><div class="row"><div><label>나의 역할</label><input name="role" required placeholder="신부 / 혼주 / 상주"></div><div><label>시간</label><input name="time" value="12:00"></div></div>
<label>행사일</label><input type="date" name="date" required min="${ymd(today())}"><label>제휴 식장</label><select name="venue">${S.venues.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('')}</select>
<label>홀·호실</label><input name="hall"><label>안내 문구</label><textarea name="message"></textarea>
<label>식장 계약서(결혼식 필수)</label><input type="file" name="contract" accept=".jpg,.jpeg,.png,.pdf">
<label class="check"><input type="checkbox" name="meal" checked> 결제한 하객에게 모바일 식권(QR) 발급</label>
<div class="card tint small" style="margin:14px 0 0;padding:14px">등록 후 와이즈앤코가 식장에 예약 여부를 확인한 뒤 청첩장(부고)이 공개됩니다. 장례는 계약서 대신 제휴 장례식장 이용 확인으로 진행합니다. 행사 개설은 1년에 ${set('limit_host_events_per_year')}회까지 가능합니다.</div>
<button class="btn block" style="margin-top:14px">등록하고 식장 확인 요청</button></form>`, true);
});
route(/^\/host\/e\/(\d+)$/, ([id]) => {
  const u = me(), e = ev(id); if (!u || !e || e.host !== u.id) return go('#/host');
  const t = totals(e), on = settleOn(e), base = location.href.split('#')[0];
  const rets = S.inquiries.filter(q => q.event_id === e.id && q.kind === 'return_request');
  const st = S.settlements.find(s => s.event_id === e.id);
  return page('혼주·상주', nav.host, `<div class="side" style="justify-content:space-between"><div><div class="eyebrow">${KIND[e.kind]}</div><h1>${esc(e.title)}</h1><p class="muted">${e.date} ${e.time} · ${esc(venue(e.venue).name)} ${esc(e.hall)}</p></div>
<div>${pill(EV_ST[e.status], e.status === 'published' ? 'ok' : 'warn')} ${pill(SET_ST[e.settle], e.settle === 'held' ? 'err' : e.settle === 'settled' ? 'ok' : '')}</div></div>
${e.status === 'pending_verify' ? `<div class="flash warn">식장 예약을 확인하고 있습니다. 확인이 끝나면 문자로 알려 드리고 청첩장이 공개됩니다. (데모: 운영자 화면에서 확인 처리)</div>` : ''}
${e.status === 'rejected' ? `<div class="flash err">식장 확인 반려: ${esc(e.note)}</div>` : ''}
${e.status === 'published' ? `<div class="card tint"><b>공유 주소</b> <a class="mono" href="#/i/${e.code}">${esc(base)}#/i/${e.code}</a><div class="small muted">식장 확인: ${esc(e.note)}</div></div>` : ''}
<div class="grid g4"><div class="kpi"><span>결제</span><b>${t.count}건</b></div><div class="kpi"><span>총액</span><b>${won(t.gross)}</b></div><div class="kpi"><span>예상 수수료(${(set('fee_rate_bp') / 100).toFixed(1)}%)</span><b>${won(Math.floor(t.gross * set('fee_rate_bp') / 10000))}</b></div><div class="kpi"><span>식권 사용</span><b>${t.used}/${t.tickets}</b></div></div>
<div class="card" style="margin-top:18px"><h2>정산</h2>${e.settle === 'settled' ? `<p>정산이 끝났습니다. ${won(st.net)} → ${st.bank} ${st.acc}</p>`
      : e.settle === 'held' ? `<div class="flash warn">정산 보류: ${esc(e.hold)}</div><p class="small muted">담당자 검토 후 보류가 풀리면 자동으로 정산 대기 상태가 됩니다.</p>`
        : e.settle === 'requested' ? `<p>정산 대기 중입니다. 운영 확인 후 본인 명의 계좌로 입금됩니다.</p>`
          : `<p class="small muted">정산은 행사일로부터 ${set('settlement_hold_days')}일 후(${ymd(on)})부터 신청할 수 있습니다. 행사 전 인출은 할 수 없습니다.</p><button class="btn" data-act="settle" data-id="${e.id}" ${today() < on || e.status !== 'published' ? 'disabled style="opacity:.5"' : ''}>정산 신청</button>`}</div>
<div class="card"><h2>받은 마음 <span class="muted small">${t.count}건</span></h2><table><tr><th>이름</th><th>관계</th><th class="num">금액</th><th>메시지</th><th>상태</th><th>식권</th></tr>
${gifts(e).map(g => `<tr><td>${esc(g.name)}</td><td>${esc(g.rel)}</td><td class="num">${won(g.amount)}</td><td class="small">${esc(g.msg)}</td><td>${pill(G_ST[g.status], g.status === 'cancelled' ? 'err' : '')}</td><td>${g.used ? '✓' : ''}</td></tr>`).join('') || `<tr><td colspan="6" class="muted">아직 결제가 없습니다.</td></tr>`}</table><p class="small muted">하객 연락처와 카드 정보는 보이지 않습니다.</p></div>
${rets.length ? `<div class="card"><h2>반환 요청</h2>${rets.map(q => `<div style="border-bottom:1px solid var(--line);padding:10px 0"><b>${esc(q.name)}</b> · ${esc(q.body)} ${q.status === 'host_pending' ? `<div class="side" style="margin-top:8px"><button class="btn sm" data-act="return-yes" data-id="${q.id}">반환 동의</button><button class="btn sm ghost" data-act="return-no" data-id="${q.id}">동의 안 함</button></div>` : `<div class="small muted">${esc(q.answer)}</div>`}</div>`).join('')}</div>` : ''}
<div class="grid g2"><form class="card" data-form="thanks" data-id="${e.id}"><h3>감사 문자 보내기</h3><textarea name="body" required>보내주신 마음 감사히 받았습니다. 늘 건강하시고 행복하세요.</textarea><button class="btn ghost" style="margin-top:8px">아직 안 보낸 분께 발송(모의)</button></form>
${['published', 'pending_verify'].includes(e.status) && e.settle !== 'settled' ? `<form class="card" data-form="cancel-event" data-id="${e.id}" data-actor="host"><h3>행사 취소·연기</h3><p class="small muted">취소하면 정산 전 결제 전액이 자동 취소되고 하객에게 문자로 안내됩니다.</p><input name="reason" required placeholder="사유"><button class="btn danger" style="margin-top:8px">행사 취소</button></form>` : ''}</div>`);
});

/* 식장 */
route(/^\/venue$/, () => {
  const v = venue(S.session.venue);
  if (!v) return page('제휴 식장', nav.public, `<form class="card" data-form="venue-login"><h2>식장 검표 로그인</h2><label>식장</label><select name="venue">${S.venues.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select><label>식장 코드</label><input name="staff" required placeholder="데모: 1111 / 2222"><button class="btn block" style="margin-top:14px">로그인</button></form>`, true);
  const evs = S.events.filter(e => e.venue === v.id && e.status === 'published');
  const sample = S.gifts.find(g => evs.some(e => e.id === g.event_id && e.date === ymd(today())) && g.ticket && !g.used && g.status === 'paid');
  return page('제휴 식장', `<a class="on" href="#/venue">검표</a><a href="#/" data-logout="venue">로그아웃</a>`, `<h1>${esc(v.name)}</h1><div class="grid g2">
<form class="card" data-form="scan"><div class="eyebrow">Check-in</div><h2>모바일 식권 확인</h2><p class="small muted">하객의 QR을 스캐너로 읽거나 식권 번호 10자리를 입력합니다. 검표 기록은 행사가 실제로 열렸다는 확인 자료로 쓰입니다.</p>
<input name="code" required placeholder="식권 번호" class="mono" style="font-size:20px;letter-spacing:.1em"><button class="btn block" style="margin-top:10px">확인</button>
${sample ? `<p class="small muted" style="margin-top:10px">데모용 오늘 식권 번호: <a href="#" data-fill="${sample.ticket}" class="mono">${sample.ticket}</a></p>` : ''}</form>
<div class="card"><h2>공개된 행사</h2><table><tr><th>행사</th><th>일자</th><th class="num">식권 사용</th></tr>${evs.map(e => { const t = totals(e); return `<tr><td>${esc(e.title)}<div class="small muted">${esc(e.hall)} ${e.time}</div></td><td>${e.date}${e.date === ymd(today()) ? ' ' + pill('오늘', 'blue') : ''}</td><td class="num">${t.used}/${t.tickets}</td></tr>`; }).join('')}</table></div></div>`);
});

/* 운영자 */
const adminPage = (active, body) => S.session.admin ? page('운영자', nav.admin(active), body) : page('운영자', nav.public, `<form class="card" data-form="admin-login"><h2>운영자 로그인</h2><label>아이디</label><input name="uid" value="admin"><label>비밀번호</label><input name="pw" type="password" value="admin1234"><button class="btn block" style="margin-top:14px">로그인</button></form>`, true);
route(/^\/admin$/, () => {
  const live = S.gifts.filter(g => g.status !== 'cancelled'), tk = live.filter(g => g.ticket), al = S.alerts, inq = S.inquiries, done = inq.filter(q => q.resolved);
  const K = (l, v) => `<div class="kpi"><span>${l}</span><b>${v}</b></div>`;
  const queue = S.events.filter(e => e.status === 'pending_verify'), oa = al.filter(a => a.status === 'open'), toPay = S.events.filter(e => e.settle === 'requested'), held = S.events.filter(e => e.settle === 'held');
  return adminPage('', `<h1>운영 현황</h1>
<div class="eyebrow" style="margin:14px 0 8px">성과 지표</div><div class="grid g4">${K('가입 혼주·상주', S.users.length + '명')}${K('공개 행사 / 전체', `${S.events.filter(e => e.status === 'published').length} / ${S.events.length}`)}${K('결제 건수', live.length + '건')}${K('결제 금액', won(live.reduce((s, g) => s + g.amount, 0)))}</div>
<div class="eyebrow" style="margin:18px 0 8px">위험관리 지표</div><div class="grid g4">${K('이상거래 경보(미처리)', `${al.length} (${oa.length})`)}${K('보류 행사 · 해제율', `${new Set(al.map(a => a.event_id)).size} · ${al.length ? Math.round(100 * al.filter(a => a.status === 'cleared').length / al.length) : 0}%`)}${K('의심거래 보고 요청', al.filter(a => a.status === 'reported').length + '건')}${K('한도 등 결제 차단', S.blocked.length + '건')}</div>
<div class="eyebrow" style="margin:18px 0 8px">소비자보호 지표</div><div class="grid g4">${K('식권 사용률', (tk.length ? Math.round(100 * tk.filter(g => g.used).length / tk.length) : 0) + '%')}${K('결제 취소율', (S.gifts.length ? (100 * (S.gifts.length - live.length) / S.gifts.length).toFixed(1) : 0) + '%')}${K('민원(미처리)', `${inq.length} (${inq.length - done.length})`)}${K('평균 처리 기간', (done.length ? (done.reduce((s, q) => s + (q.resolved - q.at), 0) / DAY / done.length).toFixed(1) : 0) + '일')}</div>
<div class="grid g2" style="margin-top:18px">
<div class="card"><h2>식장 확인 대기 ${pill(queue.length, 'warn')}</h2>${queue.map(e => `<p><a href="#/admin/e/${e.id}">${esc(e.title)}</a> <span class="small muted">${esc(venue(e.venue).name)} · ${e.date}</span></p>`).join('') || '<p class="muted">없음</p>'}</div>
<div class="card"><h2>미처리 경보 ${pill(oa.length, 'err')}</h2>${oa.slice(0, 6).map(a => `<p>${pill(RULES[a.rule], a.sev === 'high' ? 'err' : 'warn')} <a href="#/admin/e/${a.event_id}">${esc(ev(a.event_id).title)}</a></p>`).join('') || '<p class="muted">없음</p>'}<a href="#/admin/alerts">경보 검토 →</a></div>
<div class="card"><h2>정산 대기</h2>${toPay.map(e => `<p><a href="#/admin/e/${e.id}">${esc(e.title)}</a></p>`).join('') || '<p class="muted">없음</p>'}</div>
<div class="card"><h2>정산 보류</h2>${held.map(e => `<p><a href="#/admin/e/${e.id}">${esc(e.title)}</a><br><span class="small muted">${esc(e.hold)}</span></p>`).join('') || '<p class="muted">없음</p>'}</div></div>`);
});
route(/^\/admin\/events$/, () => adminPage('/events', `<h1>행사</h1><div class="card"><table><tr><th>코드</th><th>행사</th><th>혼주·상주</th><th>일자</th><th>상태</th><th class="num">결제</th><th>정산</th></tr>
${S.events.slice().reverse().map(e => `<tr><td class="mono">${e.code}</td><td><a href="#/admin/e/${e.id}">${esc(e.title)}</a></td><td>${maskName(user(e.host).name)}</td><td>${e.date}</td><td>${pill(EV_ST[e.status])}</td><td class="num">${won(totals(e).gross)}</td><td>${pill(SET_ST[e.settle], e.settle === 'held' ? 'err' : '')}</td></tr>`).join('')}</table></div>`));
route(/^\/admin\/e\/(\d+)$/, ([id]) => {
  const e = ev(id), u = user(e.host), v = venue(e.venue), t = totals(e), R = S.session.reveal === e.id, st = S.settlements.find(s => s.event_id === e.id);
  const bl = S.blocked.filter(b => b.event_id === e.id), als = S.alerts.filter(a => a.event_id === e.id);
  return adminPage('/events', `<div class="eyebrow">${KIND[e.kind]} · ${e.code}</div><h1>${esc(e.title)}</h1><div class="grid g2"><div class="card"><dl class="kv">
<dt>혼주·상주</dt><dd>${R ? esc(u.name) : maskName(u.name)} (${esc(e.role)}) · ${R ? u.phone : maskPhone(u.phone)}</dd><dt>식장</dt><dd>${esc(v.name)} ${esc(e.hall)} · ${v.phone}</dd><dt>일시</dt><dd>${e.date} ${e.time}</dd>
<dt>계약서</dt><dd>${e.contract ? esc(e.contract) : '<span class="muted">없음</span>'}</dd><dt>상태</dt><dd>${EV_ST[e.status]} · ${SET_ST[e.settle]}</dd><dt>식장 확인</dt><dd>${esc(e.note || '-')}</dd>
<dt>정산 계좌</dt><dd>${u.bank_name || '-'} ${R ? (u.bank_account || '') : maskAcc(u.bank_account)}</dd><dt>정산 가능일</dt><dd>${ymd(settleOn(e))}</dd></dl>
${R ? '<p class="small muted">원본 열람 중 · 감사 로그에 기록됨</p>' : `<form data-form="reveal" data-id="${e.id}" class="side" style="margin-top:12px"><input name="reason" required minlength="4" placeholder="개인정보 원본 열람 사유(감사 로그 기록)" style="flex:1"><button class="btn sm ghost">원본 열람</button></form>`}</div><div>
${e.status === 'pending_verify' ? `<form class="card tint" data-form="verify" data-id="${e.id}"><h3>식장 예약 확인</h3><p class="small">${esc(v.name)}(${v.phone})에 예약 여부를 확인한 뒤 처리하세요.</p><input name="note" placeholder="확인 내용(예: 담당자 통화, 예약번호)"><div class="side" style="margin-top:8px"><button class="btn sm" name="d" value="approve">확인 완료 · 공개</button><button class="btn sm danger" name="d" value="reject">반려</button></div></form>` : ''}
${e.settle === 'requested' ? `<div class="card tint"><h3>정산 실행</h3><p class="small">제휴 PG사 정산자금(외부관리)에서 혼주 본인 명의 계좌로 지급합니다.</p><button class="btn" data-act="pay-out" data-id="${e.id}">정산 지급(모의)</button></div>` : ''}
${st ? `<div class="card"><h3>정산 내역</h3><dl class="kv"><dt>총액</dt><dd>${won(st.gross)}</dd><dt>수수료</dt><dd>${won(st.fee)}</dd><dt>지급액</dt><dd><b>${won(st.net)}</b></dd><dt>계좌</dt><dd>${st.bank} ${st.acc}</dd><dt>지급번호</dt><dd class="mono">${st.payout}</dd></dl></div>` : ''}
${e.settle === 'held' ? `<div class="flash warn">정산 보류: ${esc(e.hold)}</div>` : ''}
<div class="grid g2"><div class="kpi"><span>결제</span><b>${t.count}건 · ${won(t.gross)}</b></div><div class="kpi"><span>식권 사용률</span><b>${t.pct ?? '-'}%</b></div></div></div></div>
<div class="card"><h2>경보</h2><table><tr><th>규칙</th><th>내용</th><th>상태</th><th>처리</th></tr>${als.map(a => `<tr><td>${pill(RULES[a.rule], a.sev === 'high' ? 'err' : 'warn')}</td><td>${esc(a.detail)}</td><td>${a.status}</td><td class="small">${esc(a.note || '')}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">없음</td></tr>'}</table></div>
<div class="card"><h2>결제</h2><table><tr><th>#</th><th>하객</th><th>연락처</th><th class="num">금액</th><th>할부</th><th>카드</th><th>기기</th><th>상태</th><th>식권</th></tr>
${gifts(e).map(g => `<tr><td>${g.id}</td><td>${R ? esc(g.name) : maskName(g.name)}</td><td>${R ? g.phone : maskPhone(g.phone)}</td><td class="num">${won(g.amount)}</td><td>${g.inst || '일시불'}</td><td>****${g.last4}</td><td class="mono small">${esc((g.device || '').slice(0, 10))}</td><td>${G_ST[g.status]}</td><td>${g.used ? '✓' : ''}</td></tr>`).join('')}</table></div>
${bl.length ? `<div class="card"><h2>차단된 결제 시도</h2><table>${bl.map(b => `<tr><td>${ymd(b.at)} ${hm(b.at)}</td><td class="num">${won(b.amount)}</td><td>${esc(b.reason)}</td></tr>`).join('')}</table></div>` : ''}
${['published', 'pending_verify'].includes(e.status) && e.settle !== 'settled' ? `<form class="card" data-form="cancel-event" data-id="${e.id}" data-actor="admin"><h3>직권 취소</h3><div class="side"><input name="reason" required placeholder="사유(예: 식장 예약 허위 확인)" style="flex:1"><button class="btn sm danger">행사 취소</button></div></form>` : ''}`);
});
route(/^\/admin\/alerts$/, () => adminPage('/alerts', `<h1>이상거래 경보</h1><p class="small muted">경보가 열린 행사는 정산이 자동 보류됩니다. 검토 후 해제하거나, 의심거래로 판단되면 제휴사 보고책임자에게 FIU 보고를 요청합니다.</p>
${S.alerts.map(a => `<div class="card"><div class="side" style="justify-content:space-between"><div>${pill(RULES[a.rule], a.sev === 'high' ? 'err' : 'warn')} <a href="#/admin/e/${a.event_id}"><b>${esc(ev(a.event_id).title)}</b></a> <span class="small muted">${ymd(a.at)} ${hm(a.at)}</span><p style="margin:6px 0 0">${esc(a.detail)}</p></div>${pill({ open: '미처리', cleared: '해제', reported: '보고' }[a.status], a.status === 'open' ? 'warn' : '')}</div>
${a.status === 'open' ? `<form data-form="review" data-id="${a.id}" class="side" style="margin-top:12px"><input name="note" required placeholder="검토 내용(예: 가족이 한 기기로 대신 결제, 통화 확인)" style="flex:1"><button class="btn sm" name="d" value="cleared">문제 없음 · 해제</button><button class="btn sm danger" name="d" value="reported">의심거래 보고</button></form>` : `<p class="small muted" style="margin:8px 0 0">${esc(a.note)}</p>`}</div>`).join('') || '<div class="card muted">경보가 없습니다.</div>'}`));
route(/^\/admin\/inquiries$/, () => adminPage('/inquiries', `<h1>민원·문의</h1><p class="small muted">접수 후 15일 이내 처리. 반환 요청은 혼주(상주) 동의 절차로 처리됩니다.</p>
${S.inquiries.map(q => { const due = q.at + 15 * DAY, late = Date.now() > due; return `<div class="card"><div class="side" style="justify-content:space-between"><div>${pill({ general: '일반', complaint: '민원', return_request: '반환 요청' }[q.kind], 'blue')} <b>${maskName(q.name)}</b> <span class="small muted">${ymd(q.at)} · 기한 ${ymd(due)}</span></div>${pill(q.resolved ? '처리 완료' : late ? '기한 초과' : '처리 중', q.resolved ? 'ok' : late ? 'err' : 'warn')}</div><p>${esc(q.body)}</p>
${q.answer ? `<p class="small muted">답변: ${esc(q.answer)}</p>` : q.kind !== 'return_request' ? `<form data-form="answer" data-id="${q.id}" class="side"><input name="answer" required placeholder="답변" style="flex:1"><button class="btn sm">답변 발송</button></form>` : '<p class="small muted">혼주(상주) 동의 대기</p>'}</div>`; }).join('') || '<div class="card muted">접수된 문의가 없습니다. <a href="#/support">고객센터</a>에서 문의를 남겨 보세요.</div>'}`));
route(/^\/admin\/audit$/, () => adminPage('/audit', `<h1>감사 로그</h1><p class="small muted">식장 확인, 개인정보 원본 열람, 경보 처리, 정산, 설정 변경을 모두 기록합니다(5년 보관).</p>
<div class="card"><table><tr><th>일시</th><th>처리자</th><th>작업</th><th>대상</th><th>내용</th></tr>${S.audit.slice(0, 200).map(l => `<tr><td class="small">${ymd(l.at).slice(5)} ${hm(l.at)}</td><td>${esc(l.actor)}</td><td class="mono small">${l.action}</td><td class="mono small">${esc(l.target)}</td><td class="small">${esc(l.detail)}</td></tr>`).join('')}</table></div>
<div class="card"><h2>문자 발송 기록(모의)</h2><table>${S.sms.slice(0, 50).map(n => `<tr><td class="small">${ymd(n.at).slice(5)} ${hm(n.at)}</td><td>${maskPhone(n.phone)}</td><td class="small">${esc(n.body)}</td></tr>`).join('')}</table></div>`));
route(/^\/admin\/settings$/, () => adminPage('/settings', `<h1>위험관리 기준값</h1><p class="small muted">신청서의 [ ] 숫자에 해당합니다. 금융위 협의·제휴사 기준으로 확정하면 여기서 바꿉니다. 변경 내역은 감사 로그에 남습니다.</p>
<form class="card" data-form="settings"><table><tr><th>항목</th><th>현재 값</th><th>기본값</th></tr>${Object.entries(DEFAULTS).map(([k, [d, l, unit]]) => `<tr><td>${l}</td><td><div class="side"><input name="${k}" type="number" value="${set(k)}" style="max-width:160px"> <span class="small muted">${unit}</span></div></td><td class="small muted">${d.toLocaleString()}</td></tr>`).join('')}</table><button class="btn" style="margin-top:12px">저장</button></form>`));

/* ── 이벤트 처리 ─────────────────────────────────────────────── */
function go(h) { if (location.hash === h) render(); else location.hash = h; return ''; }
const forms = {
  pay(f, el) { const e = evByCode(el.dataset.code); if (!f.agree) throw new RuleError('이용약관과 취소·환불 안내에 동의해 주세요.'); let dev = localStorage.getItem('lt_dev'); if (!dev) localStorage.setItem('lt_dev', dev = 'D' + code(10)); const g = pay(e, { ...f, device: dev }); go('#/g/' + g.id); },
  return(f, el) { const g = S.gifts.find(x => x.id === +el.dataset.id), e = ev(g.event_id); if (g.status !== 'settled') throw new RuleError('정산 전 결제는 바로 취소할 수 있습니다.'); S.inquiries.unshift({ id: nextId('q'), kind: 'return_request', event_id: e.id, gift_id: g.id, name: g.name, phone: g.phone, body: f.body, status: 'host_pending', at: Date.now() }); g.status = 'return_requested'; sms(user(e.host).phone, `[LifeTies] ${maskName(g.name)} 님이 ${won(g.amount)} 반환을 요청했습니다.`); audit('guest', 'return.requested', 'gift:' + g.id); save(); flash('반환 요청을 접수했습니다. 혼주(상주) 동의 후 결과를 문자로 알려 드립니다.'); render(); },
  support(f) { S.inquiries.unshift({ id: nextId('q'), kind: f.kind, name: f.name, phone: digits(f.phone), body: f.body, status: 'received', at: Date.now() }); audit('guest', 'inquiry.created', '', f.kind); save(); flash('문의를 접수했습니다. 15일 이내에 문자로 답변드립니다.'); render(); },
  'host-login'(f) { if (digits(f.birth).length !== 8) throw new RuleError('생년월일 8자리를 입력해 주세요.'); const c = ci(f.name, f.birth, f.phone); let u = S.users.find(x => x.ci === c); if (!u) { u = { id: nextId('u'), name: f.name.trim(), birth: f.birth, phone: digits(f.phone), ci: c }; S.users.push(u); audit('system', 'host.joined', '', maskName(u.name)); } S.session.host = u.id; save(); render(); },
  bank(f) { const u = me(); if (f.holder.replace(/\s/g, '') !== u.name.replace(/\s/g, '')) throw new RuleError('본인 명의 계좌만 등록할 수 있습니다(예금주와 본인인증 이름 불일치).'); const c = String(Math.floor(Math.random() * 10000)).padStart(4, '0'); S.session.bank = { ...f, code: c }; save(); flash(`1원을 보냈습니다. 입금자명의 숫자 4자리를 입력해 주세요. (데모 코드: ${c})`); render(); },
  'bank-verify'(f) { const u = me(), p = S.session.bank; if (!p || f.code.trim() !== p.code) throw new RuleError('인증 코드가 맞지 않습니다.'); Object.assign(u, { bank_name: p.bank, bank_account: digits(p.acc), bank_ok: Date.now() }); delete S.session.bank; audit('host:' + u.id, 'bank.verified', '', maskAcc(u.bank_account)); save(); flash('정산 계좌 인증을 마쳤습니다.'); go('#/host'); },
  'new-event'(f, el) {
    const u = me(); const n = S.events.filter(e => e.host === u.id && e.created > Date.now() - 365 * DAY && e.status !== 'cancelled').length;
    if (n >= set('limit_host_events_per_year')) throw new RuleError(`행사 개설은 1년에 ${set('limit_host_events_per_year')}회까지 가능합니다.`);
    const file = el.querySelector('[name=contract]').files[0];
    if (f.kind === 'wedding' && !file) throw new RuleError('결혼식은 식장 계약서를 첨부해 주세요.');
    const e = { id: nextId('e'), code: code(8), host: u.id, venue: +f.venue, kind: f.kind, title: f.title, role: f.role, date: f.date, time: f.time, hall: f.hall, message: f.message, meal: !!f.meal, contract: file?.name, status: 'pending_verify', settle: 'none', hold: '', note: '', created: Date.now() };
    S.events.push(e); audit('host:' + u.id, 'event.created', 'event:' + e.code, f.kind); save(); flash('행사를 등록했습니다. 식장 예약 확인이 끝나면 청첩장(부고)이 공개됩니다.'); go('#/host/e/' + e.id);
  },
  thanks(f, el) { const e = ev(el.dataset.id); let n = 0; gifts(e).forEach(g => { if (['paid', 'settled'].includes(g.status) && !g.thanks) { sms(g.phone, `[LifeTies] ${e.title}: ${f.body}`); g.thanks = Date.now(); n++; } }); audit('host:' + e.host, 'thanks.sent', 'event:' + e.code, n + '건'); save(); flash(`감사 문자를 ${n}명에게 보냈습니다.`); render(); },
  'cancel-event'(f, el) { if (!confirm('행사를 취소하면 정산 전 결제가 모두 자동 취소됩니다. 진행할까요?')) return; const n = cancelEvent(ev(el.dataset.id), el.dataset.actor === 'admin' ? 'admin' : 'host', f.reason); flash(`행사를 취소했습니다. 결제 ${n}건을 자동 취소하고 하객에게 문자로 알렸습니다.`); render(); },
  'venue-login'(f) { const v = venue(f.venue); if (!v || v.staff !== f.staff) throw new RuleError('식장 코드가 맞지 않습니다.'); S.session.venue = v.id; save(); render(); },
  scan(f) {
    const v = venue(S.session.venue), c = f.code.trim().toUpperCase().replace('LIFETIES-TICKET:', ''), g = S.gifts.find(x => x.ticket === c), e = g && ev(g.event_id);
    if (!g || e.venue !== v.id) flash('이 식장의 식권이 아닙니다.', 'err');
    else if (['cancelled', 'returned'].includes(g.status)) flash('취소된 결제의 식권입니다.', 'err');
    else if (g.used) flash(`이미 사용한 식권입니다(${hm(g.used)}).`, 'warn');
    else if (e.date !== ymd(today())) flash(`행사일(${e.date})이 아닙니다.`, 'err');
    else { g.used = Date.now(); audit('venue:' + v.id, 'ticket.used', 'gift:' + g.id); save(); flash(`확인: ${e.title} · ${maskName(g.name)} 님`); }
    render();
  },
  'admin-login'(f) { if (f.uid !== 'admin' || f.pw !== 'admin1234') throw new RuleError('아이디 또는 비밀번호가 맞지 않습니다.'); S.session.admin = true; audit('admin', 'admin.login'); save(); render(); },
  reveal(f, el) { S.session.reveal = +el.dataset.id; audit('admin', 'pii.revealed', 'event:' + el.dataset.id, f.reason); save(); render(); },
  verify(f, el, btn) { const e = ev(el.dataset.id); if (btn === 'approve') { e.status = 'published'; e.note = f.note || '식장 예약 확인 완료'; sms(user(e.host).phone, `[LifeTies] ${e.title} 식장 확인이 끝나 청첩장(부고)이 공개되었습니다.`); } else { e.status = 'rejected'; e.note = f.note || '식장 예약을 확인할 수 없음'; } audit('admin', 'event.' + btn, 'event:' + e.code, e.note); save(); flash('처리했습니다.'); render(); },
  review(f, el, btn) { reviewAlert(S.alerts.find(a => a.id === +el.dataset.id), btn, f.note); flash(btn === 'cleared' ? '경보를 해제했습니다.' : '의심거래로 판단해 제휴사 보고책임자에게 FIU 보고를 요청했습니다.'); render(); },
  answer(f, el) { const q = S.inquiries.find(x => x.id === +el.dataset.id); Object.assign(q, { answer: f.answer, status: 'resolved', resolved: Date.now() }); sms(q.phone, '[LifeTies] 문의 답변: ' + f.answer); audit('admin', 'inquiry.answered', 'inquiry:' + q.id); save(); flash('답변을 보냈습니다.'); render(); },
  settings(f) { const ch = []; for (const k in DEFAULTS) { const v = +f[k]; if (Number.isFinite(v) && v !== set(k)) { ch.push(`${k}: ${set(k)}→${v}`); S.settings[k] = v; } } if (ch.length) audit('admin', 'settings.changed', '', ch.join('; ')); save(); flash(ch.length ? `${ch.length}개 기준값을 바꿨습니다.` : '바뀐 값이 없습니다.'); render(); },
};
const acts = {
  'cancel-gift'(id) { if (!confirm('결제를 취소할까요?')) return; cancelGift(S.gifts.find(g => g.id === +id), 'guest', '하객 직접 취소'); save(); flash('결제를 취소했습니다. 카드사 승인 취소는 영업일 기준 3~5일 걸릴 수 있습니다.'); },
  settle(id) { const r = requestSettle(ev(id)); flash(r === 'requested' ? '정산을 신청했습니다. 확인 후 본인 명의 계좌로 입금됩니다.' : '이상거래 점검이 필요해 정산이 보류되었습니다. 담당자 검토 후 안내드립니다.', r === 'requested' ? 'ok' : 'warn'); },
  'pay-out'(id) { const st = executeSettle(ev(id)); flash(`정산 ${won(st.net)}을 지급했습니다(지급번호 ${st.payout}).`); },
  'return-yes'(id) { answerReturn(id, true); }, 'return-no'(id) { answerReturn(id, false); },
};
function answerReturn(id, agree) {
  const q = S.inquiries.find(x => x.id === +id), g = S.gifts.find(x => x.id === q.gift_id);
  g.status = agree ? 'returned' : 'settled'; q.status = agree ? 'resolved' : 'rejected'; q.resolved = Date.now();
  q.answer = agree ? '혼주(상주) 동의로 반환 처리했습니다.' : '혼주(상주)가 반환에 동의하지 않았습니다. 이견이 있으면 고객센터로 문의해 주세요.';
  sms(g.phone, '[LifeTies] 반환 요청 결과: ' + q.answer); audit('host', 'return.answered', 'gift:' + g.id, agree ? 'agree' : 'reject'); save(); flash('반환 요청에 답했습니다.');
}
document.addEventListener('submit', ev_ => {
  const el = ev_.target, name = el.dataset.form; if (!forms[name]) return;
  ev_.preventDefault();
  const f = Object.fromEntries(new FormData(el)); el.querySelectorAll('input[type=checkbox]').forEach(c => f[c.name] = c.checked);
  try { forms[name](f, el, ev_.submitter?.value); } catch (err) { if (!(err instanceof RuleError)) console.error(err); flash(err.message, 'err'); render(); }
});
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'), amt = e.target.closest('[data-amount]'), lo = e.target.closest('[data-logout]'), fill = e.target.closest('[data-fill]');
  if (amt) { amt.closest('form').amount.value = amt.dataset.amount; }
  if (fill) { e.preventDefault(); fill.closest('form').code.value = fill.dataset.fill; }
  if (lo) { delete S.session[lo.dataset.logout]; delete S.session.reveal; save(); }
  if (a) { try { acts[a.dataset.act](a.dataset.id); save(); } catch (err) { flash(err.message, 'err'); } render(); }
});
function render() {
  const path = location.hash.replace(/^#/, '') || '/';
  if (!path.startsWith('/admin/e/')) delete S.session.reveal;
  let html = null;
  for (const [re, fn] of routes) { const m = path.match(re); if (m) { html = fn(m.slice(1)); break; } }
  if (html === '') return;
  flashes = [];
  $('#app').innerHTML = (html ?? page('경조금 간편 수납', nav.public, '<div class="card"><h2>페이지를 찾을 수 없습니다</h2><a href="#/">처음으로</a></div>'));
  const q = $('#qr'); if (q && window.qrcode) { const qr = qrcode(0, 'M'); qr.addData(q.dataset.qr); qr.make(); q.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true }); }
  window.scrollTo(0, 0);
}
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || !S.events) seed();
S.session ||= {};
window.addEventListener('hashchange', render);
render();
