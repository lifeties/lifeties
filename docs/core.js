/* LifeTies 데모 (GitHub Pages) — 상태·업무 규칙·데모 데이터
 * 서버 버전(app/services/core.py)과 같은 규칙을 자바스크립트로 옮긴 것입니다.
 * 결제·본인인증·계좌인증·문자는 모두 모의이며 데이터는 이 브라우저(localStorage)에만 저장됩니다. */
'use strict';
const KEY = 'lifeties-demo-v2';
const DAY = 86400000;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = n => (n || 0).toLocaleString('ko-KR') + '원';
const man = n => n >= 10000 && n % 10000 === 0 ? (n / 10000).toLocaleString('ko-KR') + '만원' : won(n);
const digits = s => String(s || '').replace(/\D/g, '');
const maskName = n => !n ? '' : n.length <= 1 ? '*' : n.length === 2 ? n[0] + '*' : n[0] + '*'.repeat(n.length - 2) + n.at(-1);
const maskPhone = p => { p = digits(p); return p.length >= 8 ? `${p.slice(0, 3)}-****-${p.slice(-4)}` : '***'; };
const fmtPhone = p => { p = digits(p); return p.length === 11 ? `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}` : p; };
const maskAcc = a => { a = digits(a); return a ? '*'.repeat(Math.max(a.length - 4, 0)) + a.slice(-4) : ''; };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const ymd = d => { d = new Date(d); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const kdate = d => { d = new Date(d); return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${'일월화수목금토'[d.getDay()]})`; };
const md = d => { d = new Date(d); return `${d.getMonth() + 1}.${d.getDate()}`; };
const hm = d => { d = new Date(d); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / DAY);
const code = (n = 8) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
const ci = (name, birth, phone) => 'CI-' + String(name).replace(/\s/g, '') + '-' + digits(birth) + '-' + digits(phone);

const KIND = { wedding: '결혼식', funeral: '장례식', other: '기타 경조사' };
const GIFT_WORD = { wedding: '축의금', funeral: '조의금', other: '축하금' };
const EV_ST = { pending_verify: '식장 확인 중', published: '공개', rejected: '반려', cancelled: '취소' };
const EV_TONE = { pending_verify: 'warn', published: 'ok', rejected: 'err', cancelled: 'err' };
const SET_ST = { none: '정산 전', requested: '정산 대기', held: '정산 보류', settled: '정산 완료' };
const SET_TONE = { none: '', requested: 'blue', held: 'err', settled: 'ok' };
const G_ST = { paid: '결제 완료', cancelled: '결제 취소', settled: '정산 완료', return_requested: '반환 요청', returned: '반환 완료' };
const G_TONE = { paid: 'blue', cancelled: 'err', settled: 'ok', return_requested: 'warn', returned: '' };
const RULES = {
  device_multi_payer: '동일 기기 다중 명의 결제', repeat_guest: '단기간 반복 결제', host_repeat_events: '단기간 반복 행사 개설',
  low_checkin: '식권 사용률 저조', new_user_high: '개설 당일 고액 결제', sanction_list: '제재대상자 명단 일치', burst: '단시간 결제 집중',
};
const DEFAULTS = {
  limit_per_gift: [500000, '1회 결제 한도', '원', 'credit-card'], limit_per_event: [30000000, '행사별 수납 한도', '원', 'building'],
  limit_guest_monthly: [2000000, '하객 1인 월 결제 한도', '원', 'user'], limit_host_events_per_year: [3, '혼주·상주 연간 행사 개설', '회', 'calendar'],
  settlement_hold_days: [3, '정산 유예 기간(행사일 기준)', '일', 'clock'], fee_rate_bp: [250, '결제 수수료율', 'bp', 'receipt'],
  rule_device_distinct_payers: [3, '동일 기기 결제자 수 경보 기준', '명', 'smartphone'], rule_repeat_guest_events: [4, '30일 내 동일 하객 결제 행사 수 경보 기준', '건', 'rotate'],
  rule_high_amount_new_user: [300000, '개설 당일 고액 결제 경보 기준', '원', 'alert'], rule_min_checkin_ratio_pct: [20, '식권 사용률 하한', '%', 'qr'],
};

let S;
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const set = k => S.settings[k];
const nextId = t => (S.seq[t] = (S.seq[t] || 0) + 1);
const ev = id => S.events.find(e => e.id === +id);
const evByCode = c => S.events.find(e => e.code === c);
const user = id => S.users.find(u => u.id === +id);
const venue = id => S.venues.find(v => v.id === +id);
const gift = id => S.gifts.find(g => g.id === +id);
const gifts = e => S.gifts.filter(g => g.event_id === e.id);
const audit = (actor, action, target = '', detail = '', at = Date.now()) => S.audit.unshift({ at, actor, action, target, detail });
const sms = (phone, body, at = Date.now()) => S.sms.unshift({ at, phone: digits(phone), body });
class RuleError extends Error {}

/* ── 업무 규칙 ─────────────────────────────────────────────── */
function totals(e) {
  const all = gifts(e), p = all.filter(g => ['paid', 'settled', 'return_requested'].includes(g.status));
  const tk = p.filter(g => g.ticket), used = tk.filter(g => g.used);
  return { count: p.length, gross: p.reduce((s, g) => s + g.amount, 0), tickets: tk.length, used: used.length,
    pct: tk.length ? Math.round(100 * used.length / tk.length) : null, cancelled: all.filter(g => g.status === 'cancelled').length,
    corp: p.filter(g => g.corp).length, avg: p.length ? Math.round(p.reduce((s, g) => s + g.amount, 0) / p.length) : 0 };
}
const settleOn = e => addDays(e.date, set('settlement_hold_days'));
const openAlerts = e => S.alerts.filter(a => a.event_id === e.id && a.status === 'open');
function raise(e, rule, sev, detail, g, at = Date.now()) {
  if (openAlerts(e).some(a => a.rule === rule)) return null;
  const a = { id: nextId('a'), event_id: e.id, gift_id: g?.id, rule, sev, detail, status: 'open', at };
  S.alerts.unshift(a); audit('system', 'risk.alert', 'event:' + e.code, `${RULES[rule]} — ${detail}`, at); return a;
}
function rulesForGift(e, g) {
  if (g.device) { const n = new Set(S.gifts.filter(x => x.device === g.device && x.status !== 'cancelled').map(x => x.payer)).size; if (n >= set('rule_device_distinct_payers')) raise(e, 'device_multi_payer', 'high', `동일 기기에서 ${n}개 명의로 결제`, g, g.at); }
  const n2 = new Set(S.gifts.filter(x => x.payer === g.payer && x.at > g.at - 30 * DAY && x.status !== 'cancelled').map(x => x.event_id)).size;
  if (n2 >= set('rule_repeat_guest_events')) raise(e, 'repeat_guest', 'medium', `${maskName(g.name)} 님, 30일 내 ${n2}개 행사 결제`, g, g.at);
  if (ymd(g.at) === ymd(e.created) && g.amount >= set('rule_high_amount_new_user')) raise(e, 'new_user_high', 'medium', `행사 개설 당일 ${won(g.amount)} 결제`, g, g.at);
  if (g.name.replace(/\s/g, '') === '홍길동테스트') raise(e, 'sanction_list', 'high', '하객 성명이 제재대상자 명단과 일치', g, g.at);
}
function rulesForEvent(e) {
  const t = totals(e);
  if (e.meal && t.tickets >= 5 && t.pct !== null && t.pct < set('rule_min_checkin_ratio_pct')) raise(e, 'low_checkin', 'high', `식권 사용률 ${t.pct}% (기준 ${set('rule_min_checkin_ratio_pct')}%)`);
}
function monthUsed(payer) {
  const m = new Date(); m.setDate(1); m.setHours(0, 0, 0, 0);
  return S.gifts.filter(g => g.payer === payer && g.status !== 'cancelled' && g.at >= m.getTime()).reduce((s, g) => s + g.amount, 0);
}
function pay(e, f) {
  const amount = +f.amount, inst = +f.inst, payer = ci(f.name, f.birth, f.phone);
  let reason = null;
  if (e.status !== 'published') reason = '식장 확인이 완료된 행사에서만 결제하실 수 있습니다.';
  else if (!(amount >= 10000) || amount % 1000) reason = '결제 금액은 1만 원 이상, 1천 원 단위로 입력해 주세요.';
  else if (amount > set('limit_per_gift')) reason = `1회 결제 한도(${won(set('limit_per_gift'))})를 초과하여 결제가 제한됩니다.`;
  else if (![0, 2, 3].includes(inst)) reason = '할부는 최대 3개월까지 이용하실 수 있습니다.';
  else if (payer === user(e.host).ci) reason = '본인이 개설한 행사에는 본인 명의 카드로 결제하실 수 없습니다.';
  else if (gifts(e).filter(g => g.status !== 'cancelled').reduce((s, g) => s + g.amount, 0) + amount > set('limit_per_event')) reason = `행사별 수납 한도(${won(set('limit_per_event'))})를 초과하여 결제가 제한됩니다.`;
  else if (monthUsed(payer) + amount > set('limit_guest_monthly')) reason = `하객 1인 월 결제 한도(${won(set('limit_guest_monthly'))})를 초과하여 결제가 제한됩니다.`;
  if (reason) { S.blocked.unshift({ event_id: e.id, reason, amount, at: Date.now() }); save(); throw new RuleError(reason); }
  const card = digits(f.card);
  if (card.length < 14 || card.length > 16) throw new RuleError('카드번호를 다시 확인해 주세요.');
  if (card === '4000000000000002') throw new RuleError('카드사에서 승인이 거절되었습니다. (승인 거절 테스트 카드)');
  if (digits(f.exp).length !== 4) throw new RuleError('유효기간을 MM/YY 형식으로 입력해 주세요.');
  const g = { id: nextId('g'), event_id: e.id, name: f.name.trim(), phone: digits(f.phone), rel: f.rel, msg: (f.msg || '').slice(0, 300), amount, inst,
    brand: { 4: 'VISA', 5: 'Mastercard', 9: '국내전용' }[card[0]] || '국내카드', last4: card.slice(-4), payer, device: f.device, tid: 'T' + code(12),
    ticket: e.meal ? code(10) : null, used: null, status: 'paid', at: Date.now(), corp: f.corp ? (f.corp_name || '').trim() : '' };
  S.gifts.push(g); rulesForGift(e, g);
  sms(g.phone, `[LifeTies] ${e.title} ${GIFT_WORD[e.kind]} ${won(amount)} 결제가 완료되었습니다. 정산 전까지 영수증 화면에서 취소하실 수 있습니다.`);
  audit('guest', 'gift.paid', 'gift:' + g.id, `event=${e.code} amount=${amount}`); save(); return g;
}
function cancelGift(g, actor, why, at = Date.now()) {
  const e = ev(g.event_id);
  if (g.status !== 'paid' || e.settle === 'settled') throw new RuleError('정산 전 결제만 취소하실 수 있습니다. 정산 후에는 반환 요청을 이용해 주세요.');
  g.status = 'cancelled'; g.cancelled = at;
  sms(g.phone, `[LifeTies] ${e.title} 결제 ${won(g.amount)}이 취소되었습니다. (${why})`, at);
  audit(actor, 'gift.cancelled', 'gift:' + g.id, why, at);
}
function cancelEvent(e, actor, why, at = Date.now()) {
  if (e.settle === 'settled') throw new RuleError('정산이 완료된 행사는 취소하실 수 없습니다. 고객센터로 문의해 주세요.');
  let n = 0; gifts(e).forEach(g => { if (g.status === 'paid') { cancelGift(g, actor, '행사 취소: ' + why, at); n++; } });
  e.status = 'cancelled'; e.cancelled = at; audit(actor, 'event.cancelled', 'event:' + e.code, `${why} · 자동 취소 ${n}건`, at); save(); return n;
}
function requestSettle(e) {
  const u = user(e.host);
  if (e.status !== 'published') throw new RuleError('공개된 행사만 정산을 신청하실 수 있습니다.');
  if (!u.bank_ok) throw new RuleError('본인 명의 정산 계좌 인증을 먼저 완료해 주세요.');
  if (today() < settleOn(e)) throw new RuleError(`정산은 ${kdate(settleOn(e))}부터 신청하실 수 있습니다. (행사 전 인출 불가)`);
  rulesForEvent(e);
  if (openAlerts(e).length) { e.settle = 'held'; e.hold = '이상거래 검토 중: ' + openAlerts(e).map(a => RULES[a.rule]).join(', '); audit('host:' + u.id, 'settlement.held', 'event:' + e.code, e.hold); save(); return 'held'; }
  e.settle = 'requested'; e.requested = Date.now(); audit('host:' + u.id, 'settlement.requested', 'event:' + e.code); save(); return 'requested';
}
function executeSettle(e, at = Date.now()) {
  if (e.settle !== 'requested' || openAlerts(e).length) throw new RuleError('정산 대기 상태가 아니거나 검토 중인 경보가 있어 지급할 수 없습니다.');
  const u = user(e.host), gs = gifts(e).filter(g => g.status === 'paid'), gross = gs.reduce((s, g) => s + g.amount, 0), fee = Math.floor(gross * set('fee_rate_bp') / 10000);
  const st = { event_id: e.id, gross, fee, net: gross - fee, count: gs.length, bank: u.bank_name, acc: maskAcc(u.bank_account), payout: 'P' + code(12), at };
  S.settlements.push(st); gs.forEach(g => g.status = 'settled'); e.settle = 'settled';
  sms(u.phone, `[LifeTies] ${e.title} 정산금 ${won(st.net)}이 ${u.bank_name} ${maskAcc(u.bank_account)} 계좌로 입금되었습니다.`, at);
  audit('admin', 'settlement.paid', 'event:' + e.code, `총액 ${won(gross)} · 수수료 ${won(fee)} · 지급 ${won(st.net)}`, at); save(); return st;
}
function reviewAlert(a, decision, note, at = Date.now()) {
  a.status = decision; a.note = note; a.reviewed = at; a.reviewer = '운영 담당자';
  const e = ev(a.event_id);
  audit('admin', 'risk.' + decision, 'alert:' + a.id, note, at);
  if (decision === 'reported') { e.settle = 'held'; e.hold = '의심거래 보고 진행 중 (제휴사 보고책임자 → 금융정보분석원)'; }
  else if (e.settle === 'held' && !openAlerts(e).length) { e.settle = 'requested'; e.hold = ''; }
  save();
}
function requestReturn(g, body, at = Date.now()) {
  const e = ev(g.event_id);
  if (g.status !== 'settled') throw new RuleError('정산 전 결제는 반환 요청 없이 즉시 취소하실 수 있습니다.');
  const q = { id: nextId('q'), kind: 'return_request', event_id: e.id, gift_id: g.id, name: g.name, phone: g.phone, body, status: 'host_pending', at };
  S.inquiries.unshift(q); g.status = 'return_requested';
  sms(user(e.host).phone, `[LifeTies] ${maskName(g.name)} 님이 ${won(g.amount)} 반환을 요청하셨습니다. 앱에서 동의 여부를 선택해 주세요.`, at);
  audit('guest', 'return.requested', 'gift:' + g.id, '', at); save(); return q;
}
function answerReturn(q, agree, at = Date.now()) {
  const g = gift(q.gift_id);
  g.status = agree ? 'returned' : 'settled'; q.status = agree ? 'resolved' : 'rejected'; q.resolved = at;
  q.answer = agree ? '혼주(상주) 동의에 따라 결제 카드로 반환 처리되었습니다.' : '혼주(상주)께서 반환에 동의하지 않으셨습니다. 이의가 있으시면 고객센터로 문의해 주세요.';
  sms(g.phone, '[LifeTies] 반환 요청 처리 결과: ' + q.answer, at); audit('host', 'return.answered', 'gift:' + g.id, agree ? '동의' : '미동의', at); save();
}

/* ── 데모 데이터 ─────────────────────────────────────────────
 * 행사 12건(정산 완료·대기·보류·반려·취소·확인 대기 포함), 결제 약 200건, 경보·민원·감사 로그 */
function seed() {
  let r = 20261127; const rnd = () => (r = (r * 1103515245 + 12345) % 2147483648) / 2147483648;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const T = today(), now = Date.now();
  S = { seq: {}, settings: Object.fromEntries(Object.entries(DEFAULTS).map(([k, v]) => [k, v[0]])), users: [], venues: [], events: [], gifts: [],
    alerts: [], blocked: [], inquiries: [], settlements: [], audit: [], sms: [], session: {} };
  S.venues = [
    { id: 1, name: '그랜드 하모니홀 마포', kind: 'wedding', area: '서울 마포구', phone: '02-3141-1100', staff: '1111' },
    { id: 2, name: '한빛병원 장례식장', kind: 'funeral', area: '서울 서대문구', phone: '02-2072-2200', staff: '2222' },
    { id: 3, name: '르 블랑 웨딩 강남', kind: 'wedding', area: '서울 강남구', phone: '02-555-3300', staff: '3333' },
    { id: 4, name: '하늘정원 컨벤션', kind: 'wedding', area: '경기 성남시', phone: '031-708-4400', staff: '4444' },
    { id: 5, name: '늘봄 장례문화원', kind: 'funeral', area: '경기 고양시', phone: '031-905-5500', staff: '5555' },
  ];
  const U = (name, birth, phone, bank = '국민은행', at = -60) => { const u = { id: nextId('u'), name, birth, phone: digits(phone), ci: ci(name, birth, phone), joined: addDays(T, at).getTime() };
    if (bank) Object.assign(u, { bank_name: bank, bank_account: '1234' + digits(phone).slice(-8), bank_ok: addDays(T, at).getTime() + 3600e3 }); S.users.push(u); return u; };
  const jieun = U('김지은', '19940312', '01012345678', '국민은행', -45), minsu = U('박민수', '19700521', '01023456789', '신한은행', -2),
    sunho = U('이선호', '19881102', '01034567890', '하나은행', -30), yujin = U('최유진', '19650830', '01056781234', '우리은행', -70),
    doyun = U('한도윤', '19910214', '01067892345', '카카오뱅크', -25), seoyeon = U('문서연', '19780409', '01078903456', '농협은행', -16),
    haneul = U('정하늘', '19960707', '01045678901', null, -3), jaewon = U('윤재원', '19890119', '01089014567', '토스뱅크', -5),
    myungsook = U('강명숙', '19560303', '01090125678', '기업은행', -12), taeho = U('서태호', '19930925', '01011223344', '국민은행', -20),
    gayoung = U('배가영', '19920601', '01022334455', '신한은행', -18);
  const E = (o) => { const e = Object.assign({ id: nextId('e'), meal: true, settle: 'none', hold: '', hall: '', time: '12:00', message: '', note: '', status: 'published' }, o);
    e.date = ymd(addDays(T, o.d)); e.created = addDays(T, o.c).getTime(); delete e.d; delete e.c;
    if (e.status !== 'pending_verify') { e.verified = e.created + 20 * 3600e3; audit('admin', e.status === 'rejected' ? 'event.reject' : 'event.approve', 'event:' + e.code, e.note, e.verified); }
    audit('host:' + e.host, 'event.created', 'event:' + e.code, KIND[e.kind], e.created); S.events.push(e); return e; };
  const ev1 = E({ code: 'WEDDING1', host: jieun.id, venue: 1, kind: 'wedding', title: '김지은 ♥ 최도윤 결혼합니다', role: '신부', message: '서로 다른 길을 걸어온 두 사람이\n이제 같은 길을 함께 걸어가려 합니다.\n귀한 걸음으로 축복해 주시면 감사하겠습니다.', d: -5, c: -40, time: '12:30', hall: '3층 그랜드홀', note: '식장 담당자 유선 확인 · 예약번호 GH-2291', contract: '그랜드하모니_예식계약서.pdf' });
  const ev2 = E({ code: 'FUNERAL1', host: minsu.id, venue: 2, kind: 'funeral', title: '故 박정자 님 부고', role: '상주(장남)', message: '삼가 고인의 명복을 빕니다.\n발인: 모레 오전 7시 · 장지: 경기 파주시 용미리', d: 0, c: -1, time: '09:00', hall: '특실 2호', note: '장례식장 이용 확인(빈소 특실 2호)' });
  const ev3 = E({ code: 'RISKY001', host: sunho.id, venue: 1, kind: 'wedding', title: '이선호 ♥ 한소라 결혼식', role: '신랑', d: -4, c: -25, time: '11:00', hall: '2층 가든홀', note: '식장 유선 확인 · 예약번호 GH-2307', contract: '가든홀_계약서.jpg' });
  const ev4 = E({ code: 'SETTLED1', host: yujin.id, venue: 3, kind: 'wedding', title: '장남 이준서 군 결혼식', role: '혼주(모)', message: '저희 아들 준서가 사랑하는 사람을 만나 새 가정을 이룹니다.', d: -21, c: -60, time: '13:00', hall: '5층 블랑홀', note: '식장 유선 확인 · 예약번호 LB-0815', contract: '르블랑_계약서.pdf' });
  const ev5 = E({ code: 'HELD0001', host: doyun.id, venue: 4, kind: 'wedding', title: '한도윤 ♥ 김나래 결혼합니다', role: '신랑', d: -8, c: -22, time: '14:00', hall: '스카이가든', note: '식장 유선 확인 · 예약번호 SG-1142', contract: '하늘정원_계약서.pdf' });
  const ev6 = E({ code: 'MEMORIAL', host: seoyeon.id, venue: 5, kind: 'funeral', title: '故 문영길 님 부고', role: '상주(장녀)', message: '그동안 베풀어 주신 은혜에 깊이 감사드립니다.', d: -13, c: -14, time: '08:00', hall: '3빈소', note: '장례식장 이용 확인' });
  const ev7 = E({ code: 'UPCOMING', host: haneul.id, venue: 3, kind: 'wedding', title: '정하늘 ♥ 오지훈 결혼합니다', role: '신부', message: '봄날처럼 따뜻한 마음으로 오시는 모든 분을 기다리겠습니다.', d: 12, c: -3, time: '15:30', hall: '4층 크리스탈홀', note: '식장 유선 확인 · 예약번호 LB-0902', contract: '르블랑_정하늘.pdf' });
  const ev8 = E({ code: 'SEVENTY1', host: myungsook.id, venue: 4, kind: 'other', title: '강명숙 님 칠순 잔치', role: '본인', message: '건강하게 칠순을 맞이하게 되어 감사한 마음으로 자리를 마련했습니다.', d: 6, c: -12, time: '18:00', hall: '연회장 B', note: '연회장 예약 확인 · 예약번호 SG-1160', meal: true });
  E({ code: 'PENDING1', host: jieun.id, venue: 1, kind: 'other', title: '김지은 님 첫돌 잔치', role: '부모', d: 24, c: 0, status: 'pending_verify', meal: false, contract: '돌잔치_예약확인서.pdf' });
  E({ code: 'PENDING2', host: jaewon.id, venue: 4, kind: 'wedding', title: '윤재원 ♥ 송하은 결혼식', role: '신랑', d: 45, c: -1, status: 'pending_verify', contract: '하늘정원_윤재원.jpg', hall: '그랜드볼룸' });
  E({ code: 'REJECT01', host: taeho.id, venue: 3, kind: 'wedding', title: '서태호 결혼식', role: '신랑', d: 30, c: -9, status: 'rejected', note: '식장 확인 결과 해당 일자 예약 내역 없음 · 계약서 정보 불일치', contract: '계약서_스캔.jpg' });
  const ev12 = E({ code: 'CANCEL01', host: gayoung.id, venue: 1, kind: 'wedding', title: '배가영 ♥ 류민혁 결혼식', role: '신부', d: 9, c: -18, hall: '3층 그랜드홀', note: '식장 유선 확인 · 예약번호 GH-2340', contract: '그랜드하모니_배가영.pdf' });

  const FN = '김이박최정강조윤장임한오서신권황안송류홍'.split(''), GN = ['민준', '서연', '도현', '지우', '하준', '서윤', '예준', '지민', '시우', '수아', '주원', '하은', '지호', '윤서', '건우', '채원', '현우', '지유', '우진', '다은', '승현', '소율', '정훈', '미경', '영수', '은정', '상철', '혜진', '성민', '경희'];
  const REL = { wedding: ['대학 동기', '회사 동료', '친척', '고등학교 친구', '동호회', '거래처', '이웃', '교회 지인'], funeral: ['회사 동료', '친척', '고인 지인', '대학 동기', '거래처', '이웃'], other: ['친척', '이웃', '교회 지인', '자녀 친구', '동창'] };
  const MSG = { wedding: ['결혼 진심으로 축하해!', '행복하게 잘 살아~', '두 분의 앞날에 축복이 가득하길 바랍니다.', '축하드립니다. 늘 행복하세요.', ''], funeral: ['삼가 고인의 명복을 빕니다.', '깊은 위로를 전합니다.', '마음으로 함께하겠습니다.', ''], other: ['만수무강하세요!', '칠순 진심으로 축하드립니다.', ''] };
  const AMT = { wedding: [50000, 50000, 100000, 100000, 100000, 100000, 150000, 200000, 300000, 500000], funeral: [30000, 50000, 50000, 100000, 100000, 200000], other: [50000, 100000, 100000, 200000] };
  const CORP = ['㈜한결테크', '대한정밀 주식회사', '㈜새솔물산', '미래로 세무법인'];
  const G = (e, at, o = {}) => {
    const name = o.name || pick(FN) + pick(GN), phone = o.phone || '010' + String(Math.floor(rnd() * 1e8)).padStart(8, '0'), corp = o.corp ?? (rnd() < .07 ? pick(CORP) : '');
    const g = { id: nextId('g'), event_id: e.id, name, phone, rel: o.rel || (corp ? '거래처' : pick(REL[e.kind])), msg: o.msg ?? pick(MSG[e.kind]), amount: o.amount || (corp ? 200000 : pick(AMT[e.kind])),
      inst: o.inst ?? (rnd() < .08 ? pick([2, 3]) : 0), brand: pick(['국내카드', '국내카드', 'VISA', 'Mastercard']), last4: phone.slice(-4), payer: o.payer || ci(name, '19800101', phone),
      device: o.device || 'D' + code(8), tid: 'T' + code(12), ticket: e.meal ? code(10) : null, used: null, status: 'paid', at, corp };
    S.gifts.push(g); audit('guest', 'gift.paid', 'gift:' + g.id, `event=${e.code} amount=${g.amount}`, at);
    if (g.amount >= 100000 || rnd() < .3) sms(g.phone, `[LifeTies] ${e.title} ${GIFT_WORD[e.kind]} ${won(g.amount)} 결제가 완료되었습니다.`, at);
    return g;
  };
  const spread = (e, n, fromDays, toDays, usedRatio = 0) => {
    const base = new Date(e.date + 'T' + e.time).getTime(); const out = [];
    for (let i = 0; i < n; i++) { let at = base + (fromDays + (toDays - fromDays) * rnd()) * DAY; const dt = new Date(at); if (dt.getHours() < 8 || dt.getHours() > 22) { dt.setHours(8 + Math.floor(rnd() * 14)); at = dt.getTime(); } const g = G(e, Math.min(at, now - 60e3)); if (rnd() < usedRatio && base < now) g.used = base - 40 * 60e3 + rnd() * 3 * 3600e3; out.push(g); }
    return out;
  };
  // 1) 지난주 결혼식 — 정산 신청 가능
  const g1 = spread(ev1, 34, -14, .15, .86); g1[3].status = 'cancelled'; g1[3].cancelled = g1[3].at + 3 * 3600e3;
  // 2) 오늘 장례 — 결제 진행 중
  spread(ev2, 16, -.9, -.02, .35);
  // 3) 이상거래 사례 — 동일 기기 6개 명의 결제, 식권 사용률 저조
  spread(ev3, 5, -10, -1, .4);
  for (let i = 0; i < 6; i++) { const g = G(ev3, addDays(ev3.date, -5).getTime() + i * 170e3, { name: `${pick(FN)}${pick(GN)}`, amount: 300000, device: 'DEVICE-7F3A', rel: '지인', msg: '' }); if (i >= 2) rulesForGift(ev3, g); }
  // 4) 정산 완료(3주 전 결혼식) — 반환 요청 1건 포함
  const g4 = spread(ev4, 46, -20, .1, .9);
  // 5) 보류 — 제재대상자 일치 → 의심거래 보고
  spread(ev5, 22, -12, .1, .7); const gs5 = G(ev5, addDays(ev5.date, -2).getTime(), { name: '홍길동테스트', amount: 500000, rel: '지인', msg: '' }); rulesForGift(ev5, gs5);
  // 6) 장례(2주 전) — 경보 해제 후 정산 완료
  spread(ev6, 24, -1.5, .5, .75); const g6x = G(ev6, addDays(ev6.date, -1).getTime(), { amount: 300000, rel: '고인 지인' }); ev6.created = g6x.at - 3 * 3600e3; raise(ev6, 'new_user_high', 'medium', `행사 개설 당일 ${won(300000)} 결제`, g6x, g6x.at + 60e3);
  // 7) 다가오는 결혼식 — 사전 결제
  spread(ev7, 11, -3, -.2);
  // 8) 칠순 잔치
  spread(ev8, 9, -10, -.5);
  // 12) 취소된 결혼식 — 결제 자동 취소
  spread(ev12, 7, -15, -6);
  // 한도 초과 등 차단 이력
  [[ev1, 600000, `1회 결제 한도(${won(500000)})를 초과하여 결제가 제한됩니다.`], [ev1, 100000, '본인이 개설한 행사에는 본인 명의 카드로 결제하실 수 없습니다.'],
   [ev4, 1000000, `1회 결제 한도(${won(500000)})를 초과하여 결제가 제한됩니다.`], [ev2, 300000, `하객 1인 월 결제 한도(${won(2000000)})를 초과하여 결제가 제한됩니다.`],
   [ev5, 100000, '할부는 최대 3개월까지 이용하실 수 있습니다.'], [ev7, 5000, '결제 금액은 1만 원 이상, 1천 원 단위로 입력해 주세요.'], [ev3, 500000, `1회 결제 한도(${won(500000)})를 초과하여 결제가 제한됩니다.`]]
    .forEach(([e, amount, reason], i) => S.blocked.unshift({ event_id: e.id, reason, amount, at: now - (i + 1) * 2.3 * DAY }));

  // 정산·경보 처리 흐름 재현
  const at4 = addDays(ev4.date, 3).getTime() + 10 * 3600e3; ev4.settle = 'requested'; audit('host:' + yujin.id, 'settlement.requested', 'event:SETTLED1', '', at4); executeSettle(ev4, at4 + 2 * 3600e3);
  const a6 = openAlerts(ev6)[0]; ev6.settle = 'held'; ev6.hold = '이상거래 검토 중: ' + RULES[a6.rule];
  reviewAlert(a6, 'cleared', '고인 동창회 대표 결제로 확인(유선 통화). 정상 거래로 판단.', addDays(ev6.date, 3).getTime() + 9 * 3600e3);
  executeSettle(ev6, addDays(ev6.date, 3).getTime() + 15 * 3600e3);
  ev5.settle = 'held'; ev5.hold = '이상거래 검토 중: ' + RULES.sanction_list; reviewAlert(openAlerts(ev5)[0], 'reported', '제재대상자 명단 일치. 결제 카드 명의 확인 불가로 제휴사 보고책임자에게 의심거래 보고 요청.', addDays(ev5.date, 3).getTime() + 11 * 3600e3);
  raise(ev1, 'repeat_guest', 'medium', '하객 1명이 30일 내 4개 행사에 결제', g1[8], g1[8].at); reviewAlert(S.alerts[0], 'cleared', '동일 회사 동료 경조사 4건으로 확인. 정상 거래.', g1[8].at + DAY);
  cancelEvent(ev12, 'host:' + gayoung.id, '양가 사정으로 예식 연기', addDays(T, -4).getTime());

  // 반환 요청·민원
  const q1 = requestReturn(g4[5], '금액을 잘못 입력하여 30만 원을 결제했습니다. 10만 원만 보내려고 했습니다.', addDays(T, -6).getTime()); answerReturn(q1, true, addDays(T, -5).getTime());
  requestReturn(g4[12], '같은 분께 중복으로 결제되었습니다. 한 건 반환 부탁드립니다.', addDays(T, -1).getTime());
  const Q = (kind, name, phone, body, d, answer, rd) => { const q = { id: nextId('q'), kind, name, phone: digits(phone), body, status: answer ? 'resolved' : 'received', at: addDays(T, d).getTime() + 10 * 3600e3 };
    if (answer) Object.assign(q, { answer, resolved: addDays(T, rd).getTime() + 15 * 3600e3 }); S.inquiries.unshift(q); return q; };
  Q('general', '이민정', '01055501234', '법인카드로 결제한 경우 지급확인서를 회계 증빙으로 사용할 수 있나요?', -11, '영수증 화면의 "경조금 지급확인서"를 발급받아 사내 증빙으로 사용하실 수 있습니다. 세법상 증빙 인정 여부는 회사 회계 기준을 확인해 주세요.', -10);
  Q('complaint', '오상훈', '01066602345', '식장 입구에서 식권 QR이 인식되지 않아 한참 기다렸습니다.', -17, null);
  Q('general', '정예린', '01077703456', '행사 당일 이후에도 축의금을 보낼 수 있나요?', -3, '행사일 이후 7일까지 결제하실 수 있으며, 정산 신청 이후에는 결제가 마감됩니다.', -2);
  Q('complaint', '김태균', '01088804567', '결제 취소했는데 카드사 문자로는 아직 승인 상태로 나옵니다.', -2, null);
  Q('general', '박소희', '01099905678', '부모님 대신 혼주로 행사를 등록해도 되나요?', 0, null);

  // 운영 이력
  audit('admin', 'admin.login', '', '', addDays(T, -1).getTime() + 9 * 3600e3);
  audit('admin', 'pii.revealed', 'event:SETTLED1', '반환 요청 민원 처리를 위한 하객 연락처 확인', addDays(T, -6).getTime() + 11 * 3600e3);
  audit('admin', 'settings.changed', '', 'rule_min_checkin_ratio_pct: 15→20', addDays(T, -9).getTime() + 16 * 3600e3);
  S.audit.sort((a, b) => b.at - a.at); S.sms.sort((a, b) => b.at - a.at);
  S.seeded = Date.now(); save();
}
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || !S.events) seed();
  S.session ||= {};
}
