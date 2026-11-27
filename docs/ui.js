/* LifeTies 데모 — 화면 */
'use strict';
/* ── 아이콘 (Lucide, ISC License) ─────────────────────────── */
const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  bank: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>', rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  flower: '<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/><path d="M12 7.5V9"/><path d="M7.5 12H9"/><path d="M16.5 12H15"/><path d="M12 16.5V15"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', 'arrow-l': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>', 'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>', ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  pause: '<circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/>',
  sparkle: '<path d="M9.94 14.06 2 22"/><path d="m18 2 4 4"/><path d="M12 2v2"/><path d="M20 12h2"/><path d="m17 7 3-3"/><path d="M12 12 9 21l-2-6-6-2 9-3Z"/>',
  map: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
};
const I = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const KIND_IC = { wedding: 'heart', funeral: 'flower', other: 'gift' };
const pill = (t, k = '') => `<span class="pill ${k}">${esc(t)}</span>`;
const ibox = (n, k = '', sm = false) => `<div class="ibox ${k} ${sm ? 'sm' : ''}">${I(n)}</div>`;
const kpi = (ic, l, v, s = '', k = '') => `<div class="kpi">${ibox(ic, k)}<div><div class="l">${l}</div><div class="v">${v}</div>${s ? `<div class="s">${s}</div>` : ''}</div></div>`;
const avatar = n => `<div class="avatar">${esc((n || '?')[0])}</div>`;
const meter = (pct, k = '') => `<div class="meter ${k}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;
function donut(pct, label = '', color = '#3451E6') {
  const r = 46, c = 2 * Math.PI * r, p = pct == null ? 0 : pct;
  return `<svg class="donut" viewBox="0 0 116 116"><circle cx="58" cy="58" r="${r}" fill="none" stroke="#EEF1F6" stroke-width="12"/>
  <circle cx="58" cy="58" r="${r}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c * p / 100} ${c}" transform="rotate(-90 58 58)"/>
  <text x="58" y="58" text-anchor="middle" font-size="22" font-weight="700" fill="#0F1530">${pct == null ? '-' : pct + '%'}</text><text x="58" y="76" text-anchor="middle" font-size="11" fill="#6B7287">${label}</text></svg>`;
}
function stepper(items, cur, bad = -1) {
  return `<div class="stepper">${items.map((t, i) => `<div class="s ${i < cur ? 'done' : ''} ${i === cur ? 'cur' : ''} ${i === bad ? 'bad' : ''}"><div class="c">${i === bad ? I('x') : i < cur ? I('check') : i + 1}</div>${t}</div>`).join('')}</div>`;
}
function bars(rows, max) {
  max = max || Math.max(1, ...rows.map(r => r[1]));
  return `<div class="bars">${rows.map(([l, v, sub]) => `<div class="row"><span>${l}</span><div class="bar"><i style="width:${100 * v / max}%"></i></div><b class="num">${sub ?? v}</b></div>`).join('')}</div>`;
}
function columnChart(series, h = 210) {
  const max = Math.max(1, ...series.map(s => s.v)), w = 100 / series.length;
  return `<svg viewBox="0 0 600 ${h + 34}" width="100%" style="display:block"><defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3451E6"/><stop offset="1" stop-color="#0A0878"/></linearGradient></defs>
  ${[0, .5, 1].map(t => `<line x1="0" x2="600" y1="${8 + h * (1 - t)}" y2="${8 + h * (1 - t)}" stroke="#EEF1F6"/>`).join('')}
  ${series.map((s, i) => { const bh = Math.max(s.v ? 3 : 0, h * s.v / max), x = i * 6 * w + 6 * w * .2, bw = 6 * w * .6; return `<rect x="${x}" y="${8 + h - bh}" width="${bw}" height="${bh}" rx="4" fill="url(#cg)" opacity="${s.hi ? 1 : .85}"><title>${s.l}: ${won(s.v)}</title></rect><text x="${x + bw / 2}" y="${h + 28}" text-anchor="middle" font-size="11" fill="#6B7287">${s.l}</text>`; }).join('')}</svg>`;
}
function settleTimeline(e) {
  // 구간별 고정 배치: 행사 등록 0% · 행사일 60% · 정산 가능 100%, 오늘은 구간 안에서 비례 위치
  const start = new Date(e.created), evd = new Date(e.date), so = settleOn(e), now = new Date();
  const seg = (d, a, b, pa, pb) => pa + (pb - pa) * Math.max(0, Math.min(1, (d - a) / Math.max(1, b - a)));
  const pos = d => d <= evd ? seg(d, start, evd, 0, 60) : seg(d, evd, so, 60, 100);
  const p = pos(now);
  return `<div class="tl"><div class="fill" style="width:${p}%"></div>
  <div class="mk" style="left:0%"></div><div class="lb t l" style="left:0%">행사 등록</div><div class="lb b l" style="left:0%">${md(start)}</div>
  <div class="mk" style="left:60%"></div><div class="lb t" style="left:60%">행사일</div><div class="lb b" style="left:60%">${md(evd)}</div>
  <div class="mk" style="left:100%"></div><div class="lb t r" style="left:100%">정산 가능</div><div class="lb b r" style="left:100%">${md(so)}</div>
  ${now < so ? `<div class="mk now" style="left:${p}%" title="오늘"></div>` : ''}</div>`;
}
let flashes = [];
const flash = (msg, kind = 'ok') => flashes.push([kind, msg]);
const FL_IC = { ok: 'check-circle', err: 'x-circle', warn: 'alert', info: 'shield' };

/* ── 레이아웃 ─────────────────────────────────────────────── */
const N = (h, ic, t, on) => `<a class="${on ? 'on' : ''}" href="${h}">${I(ic)}${t}</a>`;
const navs = {
  public: a => N('#/host', 'user', '혼주·상주', a === 'host') + N('#/venue', 'scan', '제휴 식장', a === 'venue') + N('#/admin', 'chart', '운영 관리', a === 'admin') + N('#/support', 'help', '고객센터', a === 'support'),
  host: a => N('#/host', 'list', '내 행사', a === 'list') + N('#/host/new', 'plus', '행사 등록', a === 'new') + N('#/host/bank', 'bank', '정산 계좌', a === 'bank') + `<a href="#/" data-logout="host">${I('logout')}로그아웃</a>`,
  admin: a => [['', 'chart', '대시보드'], ['/events', 'calendar', '행사'], ['/alerts', 'shield', '이상거래'], ['/inquiries', 'inbox', '민원'], ['/audit', 'file', '감사 로그'], ['/settings', 'sliders', '기준값']]
    .map(([p, ic, l]) => N('#/admin' + p, ic, l, a === p)).join('') + `<a href="#/" data-logout="admin">${I('logout')}로그아웃</a>`,
};
function page(area, navHtml, body, narrow = false) {
  return `<header class="top"><div class="in"><a class="brand" href="#/"><span class="wm">LifeTies</span><small>${area}</small></a><nav class="nav">${navHtml}</nav></div></header>
  <main class="wrap ${narrow ? 'narrow' : ''}">${flashes.map(([k, m]) => `<div class="flash ${k}">${I(FL_IC[k] || 'check-circle')}<div>${esc(m)}</div></div>`).join('')}${body}</main>`;
}
const routes = [];
const route = (re, fn) => routes.push([re, fn]);
function go(h) { if (location.hash === h) render(); else location.hash = h; return ''; }

/* ── 홈 ───────────────────────────────────────────────────── */
route(/^\/?$/, () => {
  const live = S.gifts.filter(g => g.status !== 'cancelled'), vol = live.reduce((s, g) => s + g.amount, 0);
  const tour = [['heart', '청첩장에서 축의금 결제', '카드 결제 후 영수증과 모바일 식권이 발급됩니다.', '#/i/WEDDING1'],
    ['ban', '한도 초과 결제 시도', '60만 원을 입력하면 1회 결제 한도에 따라 결제가 제한됩니다.', '#/i/WEDDING1'],
    ['wallet', '혼주 정산 신청', '김지은 님으로 로그인하여 지난 결혼식의 정산을 신청합니다.', '#/host'],
    ['shield', '이상거래 검토', '운영 관리에서 동일 기기 다중 명의 결제 경보를 검토합니다.', '#/admin/alerts'],
    ['qr', '식장 식권 확인', '제휴 장례식장에서 오늘 발급된 식권을 확인합니다.', '#/venue']];
  return page('경조금 간편 수납', navs.public(''), `
<section class="hero"><div class="eyebrow">Innovative Financial Service · Demo</div>
<h1>행사 검증형 경조금<br>신용카드 간편 수납</h1>
<p>제휴 식장에서 행사 실재를 확인한 경조사에 한해 신용카드로 축의금·조의금을 전달하고, 행사 종료 후 혼주·상주 본인 명의 계좌로 정산합니다.</p>
<div class="side mt"><a class="btn light" href="#/i/WEDDING1">${I('heart')}청첩장 체험하기</a><a class="btn outline-w" href="#/admin">${I('chart')}운영 대시보드</a></div>
<div class="flow" style="margin-top:34px">${[['building', '행사 등록', '혼주·상주 본인인증 후 식장 계약서 제출'], ['shield', '식장 확인', '와이즈앤코가 제휴 식장에 예약 확인'], ['credit-card', '카드 결제', '하객이 한도 내에서 신용카드 결제'], ['qr', '식권 확인', '식장에서 모바일 식권으로 행사 실재 확인'], ['bank', '본인 계좌 정산', `행사일 ${set('settlement_hold_days')}일 후 본인 명의 계좌로 지급`]]
    .map(([ic, b, s], i) => `<div class="st"><div class="dot">${I(ic)}</div><div class="n">STEP ${i + 1}</div><b>${b}</b><span>${s}</span></div>`).join('')}</div></section>

<div class="sect">${ibox('shield', '', true)}<h3>이용자 보호 장치</h3><span class="eyebrow">Safeguards</span></div>
<div class="grid g4">
${kpi('credit-card', '1회 결제 한도', man(set('limit_per_gift')), `할부 최대 3개월 · 월 ${man(set('limit_guest_monthly'))}`)}
${kpi('building', '행사 실재 확인', '식장 확인 + 식권', '확인 전에는 청첩장 비공개')}
${kpi('clock', '정산 유예', `행사일 + ${set('settlement_hold_days')}일`, '행사 전 인출 불가')}
${kpi('bank', '정산 계좌', '본인 명의 한정', '1원 인증 · 가상계좌 미사용')}</div>

<div class="sect">${ibox('users', '', true)}<h3>역할별 체험</h3><span class="eyebrow">Roles</span></div>
<div class="grid g4">
${[['heart', '하객', '청첩장·부고에서 결제, 영수증·식권, 취소와 반환 요청', [['#/i/WEDDING1', '결혼식'], ['#/i/FUNERAL1', '부고'], ['#/i/SEVENTY1', '칠순']]],
    ['user', '혼주·상주', '행사 등록, 결제 현황, 정산 신청, 반환 동의, 감사 메시지', [['#/host', '시작하기']]],
    ['scan', '제휴 식장', '모바일 식권 확인으로 행사 실재 기록', [['#/venue', '식권 확인']]],
    ['chart', '운영 관리', '식장 확인, 이상거래 검토, 정산 지급, 민원, 감사 로그', [['#/admin', '대시보드']]]]
    .map(([ic, t, s, links]) => `<div class="card mb0">${ibox(ic)}<h3 style="margin-top:14px">${t}</h3><p class="small muted">${s}</p><div class="side">${links.map(([h, l], i) => `<a class="btn sm ${i ? 'ghost' : ''}" href="${h}">${l}</a>`).join('')}</div></div>`).join('')}</div>

<div class="grid g2 mt">
<div class="card"><div class="card-h">${ibox('sparkle', '', true)}<h3>5분 둘러보기</h3></div>
${tour.map(([ic, t, s, h], i) => `<a href="${h}" class="who" style="padding:10px 0;border-top:${i ? '1px solid var(--line2)' : '0'};text-decoration:none">${ibox(ic, i === 0 ? 'dark' : '', true)}<div style="flex:1"><b>${i + 1}. ${t}</b><span>${s}</span></div>${I('arrow', 'sm')}</a>`).join('')}</div>
<div class="card"><div class="card-h">${ibox('lock', '', true)}<h3>데모 계정</h3></div>
<table><tbody>
<tr><td>${pill('혼주', 'blue')}</td><td><b>김지은</b> · 19940312 · 010-1234-5678</td></tr>
<tr><td>${pill('상주', 'blue')}</td><td><b>박민수</b> · 19700521 · 010-2345-6789</td></tr>
<tr><td>${pill('혼주', 'blue')}</td><td><b>이선호</b> · 19881102 · 010-3456-7890 <span class="xs muted">경보 사례</span></td></tr>
<tr><td>${pill('식장', 'nodot')}</td><td>한빛병원 장례식장 <b>2222</b> · 그랜드 하모니홀 <b>1111</b></td></tr>
<tr><td>${pill('운영', 'nodot')}</td><td><b>admin</b> / admin1234</td></tr>
<tr><td>${pill('카드', 'nodot')}</td><td>임의의 16자리 · <span class="code">4000 0000 0000 0002</span> 승인 거절</td></tr></tbody></table>
<div class="side between mt"><span class="xs muted">행사 ${S.events.length}건 · 결제 ${live.length}건 · ${won(vol)}</span><a class="btn sm ghost" href="#/reset">${I('rotate', 'sm')}초기 상태로 되돌리기</a></div></div></div>`);
});
route(/^\/reset$/, () => { seed(); flash('데모 데이터를 초기 상태로 되돌렸습니다.'); return go('#/'); });

/* ── 하객 ─────────────────────────────────────────────────── */
route(/^\/i\/(\w+)$/, ([c]) => {
  const e = evByCode(c);
  if (!e || !['published', 'cancelled'].includes(e.status)) return page('경조금 간편 수납', navs.public(''), `<div class="card" style="text-align:center;padding:40px">${ibox('lock')}<h2 style="margin-top:14px">공개되지 않은 행사입니다</h2><p class="muted">식장 확인이 진행 중이거나 주소가 올바르지 않습니다.</p><a class="btn ghost" href="#/">처음으로</a></div>`, true);
  const v = venue(e.venue), t = totals(e), word = GIFT_WORD[e.kind];
  return page('경조금 간편 수납', navs.public(''), `
<div class="inv"><div class="cover ${e.kind === 'funeral' ? 'funeral' : ''}"><div class="emb">${I(KIND_IC[e.kind], 'lg')}</div><div class="eyebrow">${KIND[e.kind]}</div><h1>${esc(e.title)}</h1>
<span class="chip">${I('shield')}식장 확인 완료</span></div>
<div class="meta"><div>${I('calendar')}<span>${kdate(e.date)}<br><b>${e.time}</b></span></div><div>${I('map')}<span>${esc(v.name)}<br><b>${esc(e.hall)}</b></span></div></div>
${e.message ? `<div class="msg">${esc(e.message)}</div>` : ''}
<div class="badges"><span class="chip l">${I('lock')}연락처·계좌 비공개</span><span class="chip l">${I('rotate')}정산 전 취소 가능</span><span class="chip l">${I('bank')}본인 명의 계좌 정산</span></div></div>
${e.status === 'cancelled' ? `<div class="flash err mt">${I('x-circle')}<div>취소된 행사입니다. 결제하신 금액은 전액 자동 취소되었습니다.</div></div>` : `
<form class="card mt" data-form="pay" data-code="${e.code}"><div class="card-h">${ibox('credit-card', 'dark')}<div><h2>${word} 보내기</h2><div class="xs muted">${t.count}명이 마음을 전했습니다</div></div></div>
<label>결제 금액</label><input class="amount-in" name="amount" type="number" min="10000" step="1000" required placeholder="0">
<div class="amounts">${(e.kind === 'funeral' ? [30000, 50000, 100000, 200000] : [50000, 100000, 200000, 300000]).map(a => `<button type="button" data-amount="${a}">${man(a)}</button>`).join('')}</div>
<div class="limits"><div><small>1회 한도</small><b>${man(set('limit_per_gift'))}</b></div><div><small>월 한도</small><b>${man(set('limit_guest_monthly'))}</b></div><div><small>할부</small><b>최대 3개월</b></div></div>
<div class="row2"><div><label>보내는 분</label><input name="name" required placeholder="성명"></div><div><label>관계</label><input name="rel" placeholder="예: 대학 동기"></div></div>
<div class="row2"><div><label>생년월일</label><input name="birth" required pattern="\\d{8}" placeholder="YYYYMMDD" inputmode="numeric"></div><div><label>휴대폰 번호</label><input name="phone" required placeholder="010-0000-0000" inputmode="tel"></div></div>
<label>전하실 말씀 <span class="muted" style="font-weight:400">(선택)</span></label><textarea name="msg" maxlength="300" placeholder="${e.kind === 'funeral' ? '삼가 고인의 명복을 빕니다.' : '결혼을 진심으로 축하드립니다.'}"></textarea>
<div class="sect" style="margin:22px 0 4px">${ibox('credit-card', '', true)}<h3>카드 정보</h3>${pill('모의 결제', 'nodot')}</div>
<label>카드번호</label><input name="card" required inputmode="numeric" placeholder="0000 0000 0000 0000">
<div class="row2"><div><label>유효기간</label><input name="exp" required placeholder="MM/YY"></div><div><label>할부</label><select name="inst"><option value="0">일시불</option><option value="2">2개월</option><option value="3">3개월</option></select></div></div>
<label class="check" style="margin-top:14px"><input type="checkbox" name="corp" data-toggle="corpbox"> 법인카드 결제 (경조금 지급확인서 발급)</label>
<div id="corpbox" style="display:none"><input name="corp_name" placeholder="법인명"></div>
<div class="policy"><div>${I('rotate')}<b>정산 전</b>즉시 취소</div><div>${I('x-circle')}<b>행사 취소 시</b>전액 자동 취소</div><div>${I('send')}<b>정산 후</b>반환 요청</div></div>
<label class="check" style="margin-top:16px"><input type="checkbox" name="agree" required> 이용약관, 개인정보 수집·이용 및 취소·환불 정책에 동의합니다.</label>
<button class="btn block mt">${I('lock')}결제하기</button></form>`}`, true);
});
route(/^\/g\/(\d+)$/, ([id]) => {
  const g = gift(id); if (!g) return go('#/');
  const e = ev(g.event_id), v = venue(e.venue), word = GIFT_WORD[e.kind];
  const idx = g.status === 'cancelled' ? 1 : ['returned'].includes(g.status) ? 4 : g.status === 'settled' || g.status === 'return_requested' ? 4 : today() >= new Date(e.date) ? 2 : 1;
  return page('경조금 간편 수납', navs.public(''), `
<div class="card"><div class="receipt-head"><div class="side" style="justify-content:center;margin-bottom:6px">${pill(G_ST[g.status], G_TONE[g.status])}</div>
<div class="xs muted">${esc(e.title)}</div><div class="amt">${won(g.amount)}</div><div class="small muted">${g.inst ? g.inst + '개월 할부' : '일시불'} · ${g.brand} ****${g.last4}</div></div>
${g.status === 'cancelled' ? stepper(['결제', '취소 완료', '행사', '정산'], 2, 1) : stepper(['결제 완료', '행사 진행', '정산 대기', '정산 완료'], idx)}
<dl class="kv mt"><dt>보내는 분</dt><dd>${esc(g.name)}${g.rel ? ` · ${esc(g.rel)}` : ''}</dd>${g.corp ? `<dt>법인</dt><dd>${esc(g.corp)}</dd>` : ''}<dt>행사 일시</dt><dd>${kdate(e.date)} ${e.time}</dd><dt>장소</dt><dd>${esc(v.name)} ${esc(e.hall)}</dd>
<dt>승인번호</dt><dd class="code">${g.tid}</dd><dt>결제 일시</dt><dd>${ymd(g.at)} ${hm(g.at)}</dd></dl></div>
${g.ticket && !['cancelled', 'returned'].includes(g.status) ? `<div class="ticket" style="margin-bottom:18px"><div class="th">${I('qr')}<b>모바일 식권</b><small>${esc(v.name)}</small></div>
<div class="tb"><div id="qr" data-qr="LIFETIES-TICKET:${g.ticket}"></div><div class="code" style="font-size:19px;margin-top:12px">${g.ticket}</div>
<div class="mt">${g.used ? pill('사용 완료 · ' + hm(g.used), 'ok') : `<span class="small muted">행사 당일 식장 입구에서 제시해 주세요.</span>`}</div></div><div class="perf"></div>
<div class="tb small muted" style="padding:14px">식권 사용 기록은 행사 실재 확인 자료로 활용됩니다.</div></div>` : ''}
<div class="card">${g.status === 'paid' ? `<div class="card-h">${ibox('rotate', '', true)}<h3>결제 취소</h3></div><p class="small muted">정산 전이므로 즉시 취소하실 수 있습니다. 카드사 승인 취소에는 영업일 기준 3~5일이 소요될 수 있습니다.</p><button class="btn danger" data-act="cancel-gift" data-id="${g.id}">${I('x')}결제 취소</button>`
      : g.status === 'settled' ? `<div class="card-h">${ibox('send', '', true)}<h3>반환 요청</h3></div><p class="small muted">정산이 완료된 결제입니다. 반환 요청을 접수하시면 ${esc(e.role)}의 동의를 거쳐 처리되며, 결과는 문자로 안내드립니다.</p><form data-form="return" data-id="${g.id}"><textarea name="body" required placeholder="반환 요청 사유를 입력해 주세요."></textarea><button class="btn ghost mt">${I('send')}반환 요청</button></form>`
        : g.status === 'return_requested' ? `<div class="flash warn mb0">${I('clock')}<div>반환 요청이 접수되었습니다. ${esc(e.role)}의 동의를 기다리고 있습니다.</div></div>`
          : g.status === 'returned' ? `<div class="flash info mb0">${I('check-circle')}<div>반환이 완료되었습니다.</div></div>` : `<div class="flash err mb0">${I('x-circle')}<div>취소된 결제입니다.</div></div>`}
${g.status !== 'cancelled' ? `<a class="btn ghost mt" href="#/g/${g.id}/cert">${I('file')}경조금 지급확인서</a>` : ''}</div>
<a class="small" href="#/i/${e.code}">${I('arrow-l', 'sm')} ${word === '조의금' ? '부고' : '청첩장'}으로 돌아가기</a>`, true);
});
route(/^\/g\/(\d+)\/cert$/, ([id]) => {
  const g = gift(id), e = ev(g.event_id);
  return page('경조금 간편 수납', navs.public(''), `<div class="cert"><div class="side between"><div><div class="eyebrow">Certificate of Payment</div><h1 style="margin-top:6px">경조금 지급확인서</h1><p class="xs muted">발급번호 LT-${String(g.id).padStart(6, '0')}-${g.tid.slice(-6)}</p></div><div class="seal">와이즈<br>앤코<br>확인</div></div>
<dl class="kv" style="margin:30px 0;grid-template-columns:130px 1fr;gap:12px 16px">${g.corp ? `<dt>지급 법인</dt><dd>${esc(g.corp)}</dd>` : ''}<dt>지급인</dt><dd>${esc(g.name)}</dd><dt>경조사 구분</dt><dd>${KIND[e.kind]}</dd><dt>행사명</dt><dd>${esc(e.title)}</dd>
<dt>행사 일시·장소</dt><dd>${kdate(e.date)} · ${esc(venue(e.venue).name)}</dd><dt>수령인</dt><dd>${maskName(user(e.host).name)} (${esc(e.role)})</dd><dt>지급 금액</dt><dd style="font-size:20px;font-weight:700">${won(g.amount)}</dd>
<dt>결제 수단</dt><dd>신용카드 ${g.brand} ****${g.last4} (승인번호 ${g.tid})</dd><dt>결제일</dt><dd>${ymd(g.at)}</dd><dt>처리 상태</dt><dd>${G_ST[g.status]}</dd></dl>
<p class="small muted">상기 금액이 경조금으로 지급되었음을 확인합니다. 본 행사의 실재 여부는 제휴 식장의 예약 확인을 통해 검증되었습니다.</p>
<p style="text-align:right;margin-top:34px">${kdate(new Date())}<br><b style="font-size:16px">주식회사 와이즈앤코</b><br><span class="xs muted">LifeTies 경조금 간편 수납 서비스</span></p>
<div class="side noprint mt"><button class="btn ghost" onclick="print()">${I('printer')}인쇄 · PDF 저장</button><a class="btn ghost" href="#/g/${g.id}">${I('receipt')}영수증</a></div></div>`);
});
route(/^\/support$/, () => page('고객센터', navs.public('support'), `<div class="grid g3" style="margin-bottom:18px">${kpi('clock', '처리 기한', '접수 후 15일', '문자로 결과 안내')}${kpi('rotate', '결제 취소', '영수증 화면', '정산 전 즉시 처리')}${kpi('send', '반환 요청', '혼주 동의 절차', '정산 완료 결제')}</div>
<form class="card" data-form="support"><div class="card-h">${ibox('help', 'dark')}<div><h2>문의 접수</h2><div class="xs muted">접수하신 내용은 담당자가 확인 후 답변드립니다.</div></div></div>
<div class="row2"><div><label>성명</label><input name="name" required></div><div><label>휴대폰 번호</label><input name="phone" required></div></div>
<label>문의 유형</label><select name="kind"><option value="general">일반 문의</option><option value="complaint">불편 신고·민원</option></select><label>문의 내용</label><textarea name="body" required></textarea><button class="btn mt">${I('send')}문의 접수</button></form>`));

/* ── 혼주·상주 ────────────────────────────────────────────── */
const me = () => user(S.session.host);
route(/^\/host$/, () => {
  const u = me();
  if (!u) return page('혼주·상주', navs.public('host'), `${stepper(['본인인증', '정산 계좌', '행사 등록', '식장 확인'], 0)}
<form class="card mt" data-form="host-login"><div class="card-h">${ibox('smartphone', 'dark')}<div><h2>휴대폰 본인인증</h2><div class="xs muted">정산은 본인인증을 완료한 혼주·상주 본인에게만 지급됩니다.</div></div></div>
<label>성명</label><input name="name" required value="김지은"><label>생년월일</label><input name="birth" required value="19940312"><label>휴대폰 번호</label><input name="phone" required value="010-1234-5678">
<div class="flash info mt">${I('lock')}<div class="small">주민등록번호는 수집하지 않습니다. 다른 데모 계정 — 박민수 19700521 010-2345-6789 · 이선호 19881102 010-3456-7890</div></div>
<label class="check"><input type="checkbox" name="agree" checked required> 개인정보 수집·이용에 동의합니다. (본인인증 결과, 연락처, 정산 계좌, 행사 정보)</label><button class="btn block mt">${I('shield')}본인인증 (모의)</button></form>`, true);
  const evs = S.events.filter(e => e.host === u.id).sort((a, b) => b.id - a.id), all = evs.map(totals);
  return page('혼주·상주', navs.host('list'), `<div class="side between"><div><div class="eyebrow">My Events</div><h1>${esc(u.name)} 님의 행사</h1></div><a class="btn" href="#/host/new">${I('plus')}행사 등록</a></div>
${u.bank_ok ? '' : `<div class="flash warn">${I('alert')}<div>정산 계좌가 등록되지 않았습니다. <a href="#/host/bank">본인 명의 계좌 인증하기</a></div></div>`}
<div class="grid g3" style="margin:18px 0">${kpi('calendar', '등록 행사', evs.length + '건')}${kpi('heart', '받은 마음', all.reduce((s, t) => s + t.count, 0) + '건')}${kpi('wallet', '누적 수납액', won(all.reduce((s, t) => s + t.gross, 0)))}</div>
${u.bank_ok ? `<div class="card tint side">${ibox('bank', '', true)}<div style="flex:1"><b>${u.bank_name} ${maskAcc(u.bank_account)}</b><div class="xs muted">본인 명의 확인 완료 · ${ymd(u.bank_ok)}</div></div>${pill('인증 완료', 'ok')}</div>` : ''}
${evs.map(e => { const t = totals(e); return `<a class="card side" href="#/host/e/${e.id}" style="display:flex;text-decoration:none;color:inherit">${ibox(KIND_IC[e.kind], e.kind === 'funeral' ? '' : 'dark')}
<div style="flex:1;min-width:200px"><b style="color:var(--ink);font-size:16px">${esc(e.title)}</b><div class="small muted">${kdate(e.date)} · ${esc(venue(e.venue).name)}</div></div>
<div class="num"><b style="color:var(--ink);font-size:17px">${won(t.gross)}</b><div class="xs muted">${t.count}건</div></div><div class="side">${pill(EV_ST[e.status], EV_TONE[e.status])}${pill(SET_ST[e.settle], SET_TONE[e.settle])}</div>${I('arrow', 'sm')}</a>`; }).join('') || `<div class="card muted">등록된 행사가 없습니다.</div>`}`);
});
route(/^\/host\/bank$/, () => {
  const u = me(); if (!u) return go('#/host');
  const p = S.session.bank;
  return page('혼주·상주', navs.host('bank'), `${stepper(['계좌 입력', '1원 송금', '예금주 확인'], p ? 1 : u.bank_ok ? 3 : 0)}
<form class="card mt" data-form="bank"><div class="card-h">${ibox('bank', 'dark')}<div><h2>정산 계좌 등록</h2><div class="xs muted">정산금은 본인 명의 계좌로만 지급되며, 가상계좌는 사용하지 않습니다.</div></div></div>
<label>은행</label><select name="bank">${['국민은행', '신한은행', '우리은행', '하나은행', '농협은행', '기업은행', '카카오뱅크', '토스뱅크'].map(b => `<option ${u.bank_name === b ? 'selected' : ''}>${b}</option>`).join('')}</select>
<label>계좌번호</label><input name="acc" required value="${esc(u.bank_account || '')}" inputmode="numeric"><label>예금주</label><input name="holder" required value="${esc(u.name)}">
<button class="btn block mt">${I('send')}1원 송금 요청 (모의)</button></form>
${p ? `<form class="card" data-form="bank-verify"><div class="card-h">${ibox('check-circle', 'pos')}<h3>입금자명 확인</h3></div><p class="small muted">입금자명에 표시된 숫자 4자리를 입력해 주세요.</p><input name="code" required maxlength="4" inputmode="numeric" class="amount-in" style="text-align:center;letter-spacing:.4em"><button class="btn block mt">확인</button></form>` : ''}`, true);
});
route(/^\/host\/new$/, () => {
  if (!me()) return go('#/host');
  return page('혼주·상주', navs.host('new'), `${stepper(['행사 정보', '식장 확인 요청', '식장 확인', '청첩장 공개'], 0)}
<form class="card mt" data-form="new-event"><div class="card-h">${ibox('calendar', 'dark')}<h2>행사 등록</h2></div>
<label>행사 구분</label><select name="kind"><option value="wedding">결혼식</option><option value="funeral">장례식</option><option value="other">기타 경조사 (돌잔치·칠순 등)</option></select>
<label>행사명</label><input name="title" required placeholder="예: 김지은 ♥ 최도윤 결혼합니다"><div class="row2"><div><label>신청인 구분</label><input name="role" required placeholder="신부 · 혼주 · 상주"></div><div><label>시작 시각</label><input name="time" type="time" value="12:00"></div></div>
<label>행사일</label><input type="date" name="date" required min="${ymd(today())}"><label>제휴 식장</label><select name="venue">${S.venues.map(v => `<option value="${v.id}">${esc(v.name)} · ${v.kind === 'wedding' ? '예식' : '장례'} · ${v.area}</option>`).join('')}</select>
<label>홀·빈소</label><input name="hall" placeholder="예: 3층 그랜드홀"><label>안내 문구</label><textarea name="message"></textarea>
<label>식장 계약서 <span class="muted" style="font-weight:400">(결혼식 필수 · JPG, PNG, PDF)</span></label><input type="file" name="contract" accept=".jpg,.jpeg,.png,.pdf">
<label class="check" style="margin-top:14px"><input type="checkbox" name="meal" checked> 결제 하객에게 모바일 식권(QR) 발급</label>
<div class="policy"><div>${I('shield')}<b>식장 확인</b>예약 확인 후 공개</div><div>${I('flower')}<b>장례</b>이용 확인으로 대체</div><div>${I('calendar')}<b>개설 한도</b>연 ${set('limit_host_events_per_year')}회</div></div>
<button class="btn block mt">${I('send')}등록 및 식장 확인 요청</button></form>`, true);
});
route(/^\/host\/e\/(\d+)$/, ([id]) => {
  const u = me(), e = ev(id); if (!u || !e || e.host !== u.id) return go('#/host');
  const t = totals(e), on = settleOn(e), base = location.href.split('#')[0], st = S.settlements.find(s => s.event_id === e.id);
  const rets = S.inquiries.filter(q => q.event_id === e.id && q.kind === 'return_request'), gs = gifts(e).slice().sort((a, b) => b.at - a.at);
  const rel = {}; gs.filter(g => g.status !== 'cancelled').forEach(g => rel[g.rel || '기타'] = (rel[g.rel || '기타'] || 0) + g.amount);
  const stage = ['pending_verify', 'rejected'].includes(e.status) ? 1 : e.status === 'cancelled' ? 2 : e.settle === 'settled' ? 5 : ['requested', 'held'].includes(e.settle) ? 4 : today() >= new Date(e.date) ? 3 : 2;
  return page('혼주·상주', navs.host('list'), `<div class="side between"><div class="side">${ibox(KIND_IC[e.kind], 'dark')}<div><div class="eyebrow">${KIND[e.kind]} · ${e.code}</div><h1 class="mb0">${esc(e.title)}</h1><div class="small muted">${kdate(e.date)} ${e.time} · ${esc(venue(e.venue).name)} ${esc(e.hall)}</div></div></div>
<div class="side">${pill(EV_ST[e.status], EV_TONE[e.status])}${pill(SET_ST[e.settle], SET_TONE[e.settle])}</div></div>
<div class="card mt">${stepper(['행사 등록', '식장 확인', '행사 진행', '정산 신청', '정산 완료'], stage, e.status === 'rejected' ? 1 : e.status === 'cancelled' ? 2 : -1)}</div>
${e.status === 'pending_verify' ? `<div class="flash warn">${I('clock')}<div>제휴 식장에 예약 여부를 확인하고 있습니다. 확인이 완료되면 문자로 안내드리며 청첩장이 공개됩니다.</div></div>` : ''}
${e.status === 'rejected' ? `<div class="flash err">${I('x-circle')}<div>식장 확인 결과 반려되었습니다 — ${esc(e.note)}</div></div>` : ''}
${e.status === 'published' ? `<div class="card tint side">${ibox('send', '', true)}<div style="flex:1;min-width:0"><b>공유 주소</b><div class="small" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><a href="#/i/${e.code}">${esc(base)}#/i/${e.code}</a></div></div><a class="btn sm ghost" href="#/i/${e.code}">${I('eye', 'sm')}미리보기</a></div>` : ''}
<div class="grid g4">${kpi('heart', '받은 마음', t.count + '건', t.cancelled ? `취소 ${t.cancelled}건` : '')}${kpi('wallet', '수납 총액', won(t.gross), `평균 ${won(t.avg)}`)}${kpi('receipt', `수수료 (${(set('fee_rate_bp') / 100).toFixed(1)}%)`, won(Math.floor(t.gross * set('fee_rate_bp') / 10000)), '혼주 부담')}${kpi('bank', '예상 정산액', won(t.gross - Math.floor(t.gross * set('fee_rate_bp') / 10000)), '본인 명의 계좌')}</div>
<div class="grid g2 mt"><div class="card"><div class="card-h">${ibox('clock', '', true)}<h3>정산 일정</h3><span class="sp">${pill(SET_ST[e.settle], SET_TONE[e.settle])}</span></div>${settleTimeline(e)}
${e.settle === 'settled' ? `<div class="flash mb0">${I('check-circle')}<div>정산금 <b>${won(st.net)}</b>이 ${st.bank} ${st.acc} 계좌로 지급되었습니다. (${ymd(st.at)})</div></div>`
      : e.settle === 'held' ? `<div class="flash warn mb0">${I('pause')}<div>정산 보류 — ${esc(e.hold)}<br><span class="xs">담당자 검토가 완료되면 정산 대기로 전환됩니다.</span></div></div>`
        : e.settle === 'requested' ? `<div class="flash info mb0">${I('clock')}<div>정산 대기 중입니다. 운영 확인 후 본인 명의 계좌로 지급됩니다.</div></div>`
          : `<div class="side between"><span class="small muted">${today() < on ? `정산 신청 가능일까지 <b>${daysBetween(today(), on)}일</b> 남았습니다.` : '지금 정산을 신청하실 수 있습니다.'}</span><button class="btn" data-act="settle" data-id="${e.id}" ${today() < on || e.status !== 'published' ? 'disabled' : ''}>${I('wallet')}정산 신청</button></div>`}</div>
<div class="card"><div class="card-h">${ibox('qr', '', true)}<h3>식권 사용률 · 관계별 수납</h3></div><div class="side" style="gap:22px">${donut(t.pct, '사용률')}<div style="flex:1">${bars(Object.entries(rel).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => [k, v, man(v)]))}<div class="xs muted">관계별 수납액 상위 4</div></div></div></div></div>
<div class="card"><div class="card-h">${ibox('heart', '', true)}<h3>받은 마음</h3><span class="sp small muted">${t.count}건 · 하객 연락처와 카드 정보는 표시되지 않습니다</span></div>
<div class="tbl"><table><thead><tr><th>보내신 분</th><th class="num">금액</th><th>메시지</th><th>일시</th><th>상태</th><th>식권</th></tr></thead><tbody>
${gs.map(g => `<tr><td><div class="who">${avatar(g.name)}<div><b>${esc(g.name)}</b><span>${esc(g.corp || g.rel)}</span></div></div></td><td class="num"><b>${won(g.amount)}</b>${g.inst ? `<div class="xs muted">${g.inst}개월</div>` : ''}</td><td class="small" style="max-width:240px">${esc(g.msg)}</td><td class="xs muted">${md(g.at)} ${hm(g.at)}</td><td>${pill(G_ST[g.status], G_TONE[g.status])}</td><td>${g.used ? I('check-circle', 'sm') : ''}</td></tr>`).join('') || `<tr><td colspan="6" class="muted">아직 결제 내역이 없습니다.</td></tr>`}</tbody></table></div></div>
${rets.length ? `<div class="card"><div class="card-h">${ibox('send', 'warn', true)}<h3>반환 요청</h3></div>${rets.map(q => { const g = gift(q.gift_id); return `<div class="side" style="border-top:1px solid var(--line2);padding:12px 0"><div class="who" style="flex:1">${avatar(q.name)}<div><b>${esc(q.name)} · ${won(g.amount)}</b><span>${esc(q.body)}</span></div></div>
${q.status === 'host_pending' ? `<button class="btn sm" data-act="return-yes" data-id="${q.id}">${I('check', 'sm')}반환 동의</button><button class="btn sm ghost" data-act="return-no" data-id="${q.id}">동의하지 않음</button>` : pill(q.status === 'resolved' ? '반환 완료' : '미동의', q.status === 'resolved' ? 'ok' : '')}</div>`; }).join('')}</div>` : ''}
<div class="grid g2"><form class="card" data-form="thanks" data-id="${e.id}"><div class="card-h">${ibox('message', '', true)}<h3>감사 메시지 발송</h3></div><textarea name="body" required>보내주신 따뜻한 마음 감사히 받았습니다. 늘 건강하시고 행복하시길 바랍니다.</textarea><button class="btn ghost mt">${I('send')}미발송 하객 ${gs.filter(g => ['paid', 'settled'].includes(g.status) && !g.thanks).length}명에게 발송</button></form>
${['published', 'pending_verify'].includes(e.status) && e.settle !== 'settled' ? `<form class="card" data-form="cancel-event" data-id="${e.id}" data-actor="host"><div class="card-h">${ibox('x-circle', 'err', true)}<h3>행사 취소·연기</h3></div><p class="small muted">행사를 취소하시면 정산 전 결제가 전액 자동 취소되며, 하객에게 문자로 안내됩니다.</p><input name="reason" required placeholder="취소 사유"><button class="btn danger mt">행사 취소</button></form>` : ''}</div>`);
});

/* ── 제휴 식장 ────────────────────────────────────────────── */
route(/^\/venue$/, () => {
  const v = venue(S.session.venue);
  if (!v) return page('제휴 식장', navs.public('venue'), `<form class="card" data-form="venue-login"><div class="card-h">${ibox('scan', 'dark')}<div><h2>식권 확인 로그인</h2><div class="xs muted">제휴 식장 담당자 전용</div></div></div><label>식장</label><select name="venue">${S.venues.map(x => `<option value="${x.id}" ${x.id === 2 ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><label>식장 코드</label><input name="staff" required placeholder="데모: 한빛병원 2222 · 그랜드 하모니홀 1111"><button class="btn block mt">로그인</button></form>`, true);
  const evs = S.events.filter(e => e.venue === v.id && e.status === 'published').sort((a, b) => a.date.localeCompare(b.date));
  const sample = S.gifts.find(g => evs.some(e => e.id === g.event_id && e.date === ymd(today())) && g.ticket && !g.used && g.status === 'paid');
  const last = S.session.scan; delete S.session.scan;
  const todayTk = S.gifts.filter(g => g.used && ymd(g.used) === ymd(today()) && evs.some(e => e.id === g.event_id)).length;
  return page('제휴 식장', `<a class="on" href="#/venue">${I('scan')}식권 확인</a><a href="#/" data-logout="venue">${I('logout')}로그아웃</a>`, `<div class="side between"><div><div class="eyebrow">Partner Venue</div><h1>${esc(v.name)}</h1></div><div class="side">${pill(v.area, 'nodot')}${pill(v.kind === 'wedding' ? '예식장' : '장례식장', 'blue')}</div></div>
<div class="grid g3" style="margin:16px 0">${kpi('calendar', '공개 행사', evs.length + '건')}${kpi('qr', '오늘 확인한 식권', todayTk + '매')}${kpi('shield', '확인 기록 용도', '행사 실재 증빙', '정산 전 점검에 활용')}</div>
<div class="grid g2"><form class="card" data-form="scan"><div class="card-h">${ibox('qr', 'dark')}<div><h2>모바일 식권 확인</h2><div class="xs muted">QR 스캐너로 읽거나 식권 번호 10자리를 입력합니다.</div></div></div>
<input name="code" required placeholder="식권 번호" class="amount-in code" style="text-align:center"><button class="btn block mt">${I('scan')}확인</button>
${sample ? `<p class="xs muted" style="margin-top:10px">데모용 오늘 식권 번호 <a href="#" data-fill="${sample.ticket}" class="code">${sample.ticket}</a></p>` : ''}
${last ? `<div class="scan-res ${last[0]}"><div class="big">${I(last[0] === 'ok' ? 'check-circle' : last[0] === 'warn' ? 'alert' : 'x-circle')}</div><div><b>${esc(last[1])}</b><span class="small">${esc(last[2] || '')}</span></div></div>` : ''}</form>
<div class="card"><div class="card-h">${ibox('calendar', '', true)}<h3>예정·진행 행사</h3></div>${evs.map(e => { const t = totals(e); return `<div style="border-top:1px solid var(--line2);padding:12px 0"><div class="side between"><div><b style="color:var(--ink)">${esc(e.title)}</b><div class="xs muted">${md(e.date)} ${e.time} · ${esc(e.hall)}</div></div>${e.date === ymd(today()) ? pill('오늘', 'blue') : ''}</div>
${t.tickets ? `<div class="side between xs muted" style="margin-top:6px"><span>식권 ${t.used}/${t.tickets}</span><span>${t.pct}%</span></div>${meter(t.pct, t.pct >= 50 ? 'pos' : '')}` : ''}</div>`; }).join('') || '<p class="muted">공개된 행사가 없습니다.</p>'}</div></div>`);
});

/* ── 운영 관리 ────────────────────────────────────────────── */
const adminPage = (active, body) => S.session.admin ? page('운영 관리', navs.admin(active), body) : page('운영 관리', navs.public('admin'), `<form class="card" data-form="admin-login"><div class="card-h">${ibox('lock', 'dark')}<div><h2>운영자 로그인</h2><div class="xs muted">모든 접속과 조치는 감사 로그에 기록됩니다.</div></div></div><label>아이디</label><input name="uid" value="admin"><label>비밀번호</label><input name="pw" type="password" value="admin1234"><button class="btn block mt">로그인</button></form>`, true);
route(/^\/admin$/, () => {
  const live = S.gifts.filter(g => g.status !== 'cancelled'), tk = live.filter(g => g.ticket), al = S.alerts, inq = S.inquiries, done = inq.filter(q => q.resolved);
  const vol = live.reduce((s, g) => s + g.amount, 0), paid = S.settlements.reduce((s, x) => s + x.net, 0);
  const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i - 13)).map(d => ({ l: md(d), v: live.filter(g => ymd(g.at) === ymd(d)).reduce((s, g) => s + g.amount, 0), hi: ymd(d) === ymd(today()) }));
  const cnt = f => S.events.filter(f).length;
  const stages = [['pending_verify', '식장 확인 대기', cnt(e => e.status === 'pending_verify'), 'hot', '#/admin/events?s=pending_verify'], ['published', '공개 행사', cnt(e => e.status === 'published' && e.settle === 'none'), '', '#/admin/events?s=published'],
    ['requested', '정산 대기', cnt(e => e.settle === 'requested'), 'hot', '#/admin/events?s=requested'], ['held', '정산 보류', cnt(e => e.settle === 'held'), 'bad', '#/admin/events?s=held'], ['settled', '정산 완료', cnt(e => e.settle === 'settled'), '', '#/admin/events?s=settled']];
  const byRule = Object.entries(RULES).map(([k, l]) => [l, al.filter(a => a.rule === k).length]).filter(r => r[1]);
  const oa = al.filter(a => a.status === 'open');
  return adminPage('', `<div class="side between"><div><div class="eyebrow">Operations</div><h1>운영 현황</h1></div><span class="small muted">${kdate(new Date())} 기준</span></div>
<div class="grid g4" style="margin-top:12px">${kpi('wallet', '누적 결제액', won(vol), `${live.length}건 · 평균 ${won(Math.round(vol / Math.max(1, live.length)))}`, 'dark')}${kpi('bank', '정산 지급액', won(paid), `${S.settlements.length}건 지급 완료`)}${kpi('users', '혼주·상주', S.users.length + '명', `행사 ${S.events.length}건`)}${kpi('building', '제휴 식장', S.venues.length + '곳', '예식 3 · 장례 2')}</div>
<div class="card mt"><div class="card-h">${ibox('list', '', true)}<h3>행사 처리 단계</h3></div><div class="funnel">${stages.map(([, l, v, k, h]) => `<a href="${h}" class="${v && k ? k : ''}"><div class="l">${l}</div><div class="v">${v}</div></a>`).join('')}</div></div>
<div class="grid g2"><div class="card"><div class="card-h">${ibox('chart', '', true)}<h3>최근 14일 결제액</h3><span class="sp xs muted">일별 합계</span></div>${columnChart(days)}</div>
<div class="card"><div class="card-h">${ibox('shield', '', true)}<h3>이상거래 경보 유형</h3><span class="sp">${pill(`미처리 ${oa.length}`, oa.length ? 'err' : 'ok')}</span></div>${bars(byRule)}
<div class="grid g3 mt">${[['해제', al.filter(a => a.status === 'cleared').length, 'pos'], ['보고 요청', al.filter(a => a.status === 'reported').length, 'err'], ['결제 차단', S.blocked.length, 'warn']].map(([l, v, k]) => `<div class="kpi compact"><div><div class="l">${l}</div><div class="v">${v}건</div></div></div>`).join('')}</div></div></div>
<div class="sect">${ibox('heart', '', true)}<h3>소비자보호 지표</h3></div>
<div class="grid g4">${kpi('qr', '식권 사용률', (tk.length ? Math.round(100 * tk.filter(g => g.used).length / tk.length) : 0) + '%', '행사 실재 확인 지표')}${kpi('rotate', '결제 취소율', (S.gifts.length ? (100 * (S.gifts.length - live.length) / S.gifts.length).toFixed(1) : 0) + '%', `${S.gifts.length - live.length}건 취소`)}
${kpi('inbox', '민원 처리', `${done.length}/${inq.length}건`, `미처리 ${inq.length - done.length}건`, inq.length - done.length ? 'warn' : 'pos')}${kpi('clock', '평균 처리 기간', (done.length ? (done.reduce((s, q) => s + (q.resolved - q.at), 0) / DAY / done.length).toFixed(1) : 0) + '일', '기한 15일')}</div>
<div class="grid g2 mt"><div class="card"><div class="card-h">${ibox('alert', 'err', true)}<h3>검토가 필요한 경보</h3><a class="sp small" href="#/admin/alerts">전체 보기</a></div>${oa.map(a => `<a class="who" href="#/admin/e/${a.event_id}" style="padding:10px 0;border-top:1px solid var(--line2);text-decoration:none">${ibox(a.sev === 'high' ? 'alert' : 'shield', a.sev === 'high' ? 'err' : 'warn', true)}<div><b>${RULES[a.rule]}</b><span>${esc(ev(a.event_id).title)} · ${esc(a.detail)}</span></div></a>`).join('') || '<p class="muted small">검토 대기 중인 경보가 없습니다.</p>'}</div>
<div class="card"><div class="card-h">${ibox('building', 'warn', true)}<h3>식장 확인 대기</h3></div>${S.events.filter(e => e.status === 'pending_verify').map(e => `<a class="who" href="#/admin/e/${e.id}" style="padding:10px 0;border-top:1px solid var(--line2);text-decoration:none">${ibox(KIND_IC[e.kind], '', true)}<div><b>${esc(e.title)}</b><span>${esc(venue(e.venue).name)} · ${kdate(e.date)}</span></div></a>`).join('') || '<p class="muted small">대기 중인 행사가 없습니다.</p>'}</div></div>`);
});
route(/^\/admin\/events(?:\?s=(\w+))?$/, ([s]) => {
  const F = { '': '전체', pending_verify: '식장 확인 대기', published: '공개', requested: '정산 대기', held: '정산 보류', settled: '정산 완료', rejected: '반려', cancelled: '취소' };
  const list = S.events.filter(e => !s || e.status === s || e.settle === s).sort((a, b) => b.date.localeCompare(a.date));
  return adminPage('/events', `<div class="eyebrow">Events</div><h1>행사 관리</h1><div class="side" style="margin:12px 0 18px">${Object.entries(F).map(([k, l]) => `<a class="btn sm ${(s || '') === k ? '' : 'ghost'}" href="#/admin/events${k ? '?s=' + k : ''}">${l}</a>`).join('')}</div>
<div class="card"><div class="tbl"><table><thead><tr><th>행사</th><th>신청인</th><th>행사일</th><th>상태</th><th class="num">수납액</th><th>정산</th></tr></thead><tbody>
${list.map(e => { const t = totals(e); return `<tr><td><a class="who" href="#/admin/e/${e.id}" style="text-decoration:none">${ibox(KIND_IC[e.kind], '', true)}<div><b>${esc(e.title)}</b><span>${e.code} · ${esc(venue(e.venue).name)}</span></div></a></td><td>${maskName(user(e.host).name)}<div class="xs muted">${esc(e.role)}</div></td><td>${e.date}</td><td>${pill(EV_ST[e.status], EV_TONE[e.status])}</td><td class="num"><b>${won(t.gross)}</b><div class="xs muted">${t.count}건</div></td><td>${pill(SET_ST[e.settle], SET_TONE[e.settle])}</td></tr>`; }).join('') || '<tr><td colspan="6" class="muted">해당 행사가 없습니다.</td></tr>'}</tbody></table></div></div>`);
});
route(/^\/admin\/e\/(\d+)$/, ([id]) => {
  const e = ev(id), u = user(e.host), v = venue(e.venue), t = totals(e), R = S.session.reveal === e.id, st = S.settlements.find(s => s.event_id === e.id);
  const bl = S.blocked.filter(b => b.event_id === e.id), als = S.alerts.filter(a => a.event_id === e.id);
  return adminPage('/events', `<a class="small" href="#/admin/events">${I('arrow-l', 'sm')} 행사 목록</a>
<div class="side between mt"><div class="side">${ibox(KIND_IC[e.kind], 'dark')}<div><div class="eyebrow">${KIND[e.kind]} · ${e.code}</div><h1 class="mb0">${esc(e.title)}</h1></div></div><div class="side">${pill(EV_ST[e.status], EV_TONE[e.status])}${pill(SET_ST[e.settle], SET_TONE[e.settle])}</div></div>
<div class="grid g4 mt">${kpi('heart', '결제', t.count + '건', t.cancelled ? `취소 ${t.cancelled}건` : '')}${kpi('wallet', '수납 총액', won(t.gross))}${kpi('qr', '식권 사용률', (t.pct ?? '-') + '%', `${t.used}/${t.tickets}매`, t.pct !== null && t.pct < set('rule_min_checkin_ratio_pct') ? 'err' : '')}${kpi('shield', '경보', als.length + '건', `미처리 ${als.filter(a => a.status === 'open').length}건`, als.some(a => a.status === 'open') ? 'err' : '')}</div>
<div class="grid g2 mt"><div class="card"><div class="card-h">${ibox('file', '', true)}<h3>행사 정보</h3><span class="sp">${R ? pill('원본 열람 중', 'warn') : pill('마스킹', 'nodot')}</span></div><dl class="kv">
<dt>신청인</dt><dd>${R ? esc(u.name) : maskName(u.name)} (${esc(e.role)}) · ${R ? fmtPhone(u.phone) : maskPhone(u.phone)}</dd><dt>식장</dt><dd>${esc(v.name)} ${esc(e.hall)}<div class="xs muted">${v.phone}</div></dd><dt>일시</dt><dd>${kdate(e.date)} ${e.time}</dd>
<dt>계약서</dt><dd>${e.contract ? `${I('file', 'sm')} ${esc(e.contract)}` : '<span class="muted">해당 없음</span>'}</dd><dt>식장 확인</dt><dd>${esc(e.note || '-')}</dd>
<dt>정산 계좌</dt><dd>${u.bank_name || '-'} ${R ? (u.bank_account || '') : maskAcc(u.bank_account)}</dd><dt>정산 가능일</dt><dd>${kdate(settleOn(e))}</dd></dl>
${R ? '' : `<form data-form="reveal" data-id="${e.id}" class="side mt"><input name="reason" required minlength="4" placeholder="개인정보 원본 열람 사유 (감사 로그 기록)" style="flex:1"><button class="btn sm ghost">${I('eye', 'sm')}원본 열람</button></form>`}</div>
<div>${e.status === 'pending_verify' ? `<form class="card tint" data-form="verify" data-id="${e.id}"><div class="card-h">${ibox('building', 'warn', true)}<h3>식장 예약 확인</h3></div><p class="small">${esc(v.name)}(${v.phone})에 예약 여부를 확인한 후 처리해 주세요.</p><input name="note" placeholder="확인 내용 (예: 담당자 유선 확인, 예약번호)"><div class="side mt"><button class="btn sm pos" name="d" value="approve">${I('check', 'sm')}확인 완료 · 공개</button><button class="btn sm danger" name="d" value="reject">반려</button></div></form>` : ''}
${e.settle === 'requested' ? `<div class="card tint"><div class="card-h">${ibox('bank', 'pos', true)}<h3>정산 지급</h3></div><p class="small">제휴 PG사 정산자금(외부 관리)에서 신청인 본인 명의 계좌로 지급합니다.</p><div class="side between"><b style="font-size:20px;color:var(--ink)">${won(t.gross - Math.floor(t.gross * set('fee_rate_bp') / 10000))}</b><button class="btn" data-act="pay-out" data-id="${e.id}">${I('send')}정산 지급 (모의)</button></div></div>` : ''}
${st ? `<div class="card"><div class="card-h">${ibox('check-circle', 'pos', true)}<h3>정산 내역</h3><span class="sp xs muted">${ymd(st.at)} ${hm(st.at)}</span></div><dl class="kv"><dt>수납 총액</dt><dd>${won(st.gross)} (${st.count}건)</dd><dt>수수료</dt><dd>${won(st.fee)}</dd><dt>지급액</dt><dd><b style="font-size:18px">${won(st.net)}</b></dd><dt>입금 계좌</dt><dd>${st.bank} ${st.acc}</dd><dt>지급번호</dt><dd class="code">${st.payout}</dd></dl></div>` : ''}
${e.settle === 'held' ? `<div class="flash warn">${I('pause')}<div>정산 보류 — ${esc(e.hold)}</div></div>` : ''}
<div class="card"><div class="card-h">${ibox('clock', '', true)}<h3>정산 일정</h3></div>${settleTimeline(e)}</div></div></div>
${als.length ? `<div class="card"><div class="card-h">${ibox('shield', 'err', true)}<h3>이상거래 경보</h3></div>${als.map(a => `<div class="side" style="border-top:1px solid var(--line2);padding:12px 0">${pill(RULES[a.rule], a.sev === 'high' ? 'err' : 'warn')}<span style="flex:1" class="small">${esc(a.detail)}</span>${pill({ open: '검토 대기', cleared: '정상 해제', reported: '의심거래 보고' }[a.status], a.status === 'open' ? 'warn' : a.status === 'cleared' ? 'ok' : 'err')}${a.note ? `<div class="xs muted" style="width:100%">${esc(a.note)}</div>` : ''}</div>`).join('')}${als.some(a => a.status === 'open') ? `<a class="btn sm mt" href="#/admin/alerts">경보 검토하기</a>` : ''}</div>` : ''}
<div class="card"><div class="card-h">${ibox('list', '', true)}<h3>결제 내역</h3><span class="sp xs muted">${gifts(e).length}건</span></div><div class="tbl"><table><thead><tr><th>#</th><th>하객</th><th>연락처</th><th class="num">금액</th><th>카드</th><th>기기</th><th>상태</th><th>식권</th></tr></thead><tbody>
${gifts(e).map(g => `<tr><td class="xs muted">${g.id}</td><td>${R ? esc(g.name) : maskName(g.name)}${g.corp ? `<div class="xs muted">${esc(g.corp)}</div>` : ''}</td><td class="small">${R ? fmtPhone(g.phone) : maskPhone(g.phone)}</td><td class="num">${won(g.amount)}${g.inst ? `<div class="xs muted">${g.inst}개월</div>` : ''}</td><td class="small">****${g.last4}</td><td class="xs ${g.device === 'DEVICE-7F3A' ? '' : 'muted'}" style="${g.device === 'DEVICE-7F3A' ? 'color:var(--err);font-weight:600' : ''}">${esc((g.device || '').slice(0, 11))}</td><td>${pill(G_ST[g.status], G_TONE[g.status])}</td><td>${g.used ? I('check-circle', 'sm') : ''}</td></tr>`).join('')}</tbody></table></div></div>
${bl.length ? `<div class="card"><div class="card-h">${ibox('ban', 'warn', true)}<h3>제한된 결제 시도</h3></div><table><tbody>${bl.map(b => `<tr><td class="xs muted">${ymd(b.at)} ${hm(b.at)}</td><td class="num">${won(b.amount)}</td><td class="small">${esc(b.reason)}</td></tr>`).join('')}</tbody></table></div>` : ''}
${['published', 'pending_verify'].includes(e.status) && e.settle !== 'settled' ? `<form class="card" data-form="cancel-event" data-id="${e.id}" data-actor="admin"><div class="card-h">${ibox('x-circle', 'err', true)}<h3>직권 취소</h3></div><div class="side"><input name="reason" required placeholder="취소 사유 (예: 식장 예약 허위 확인)" style="flex:1"><button class="btn sm danger">행사 취소</button></div></form>` : ''}`);
});
route(/^\/admin\/alerts$/, () => {
  const groups = [['open', '검토 대기'], ['reported', '의심거래 보고'], ['cleared', '정상 해제']];
  return adminPage('/alerts', `<div class="eyebrow">Risk Monitoring</div><h1>이상거래 감시</h1>
<div class="grid g3" style="margin:14px 0 6px">${kpi('alert', '검토 대기', S.alerts.filter(a => a.status === 'open').length + '건', '정산 자동 보류', 'err')}${kpi('send', '의심거래 보고', S.alerts.filter(a => a.status === 'reported').length + '건', '제휴사 보고책임자 경유')}${kpi('check-circle', '정상 해제', S.alerts.filter(a => a.status === 'cleared').length + '건', '검토 의견 기록', 'pos')}</div>
<div class="flash info">${I('shield')}<div class="small">경보가 발생한 행사는 정산이 자동 보류됩니다. 담당자는 검토 후 정상 해제하거나, 의심거래로 판단되는 경우 제휴사 보고책임자를 통해 금융정보분석원(FIU)에 보고를 요청합니다.</div></div>
${groups.map(([k, l]) => { const list = S.alerts.filter(a => a.status === k); return list.length ? `<div class="sect"><h3>${l}</h3>${pill(list.length + '건', k === 'open' ? 'err' : '')}</div>` + list.map(a => `<div class="card alert-card ${a.sev}"><div class="side between"><div class="side">${ibox(a.sev === 'high' ? 'alert' : 'shield', a.sev === 'high' ? 'err' : 'warn', true)}<div><b style="color:var(--ink)">${RULES[a.rule]}</b> ${pill(a.sev === 'high' ? '고위험' : '주의', a.sev === 'high' ? 'err' : 'warn')}<div class="small muted"><a href="#/admin/e/${a.event_id}">${esc(ev(a.event_id).title)}</a> · ${ymd(a.at)} ${hm(a.at)}</div></div></div></div>
<p class="mt mb0">${esc(a.detail)}</p>${a.status === 'open' ? `<form data-form="review" data-id="${a.id}" class="side mt"><input name="note" required placeholder="검토 의견 (예: 가족 대리 결제 유선 확인)" style="flex:1"><button class="btn sm pos" name="d" value="cleared">${I('check', 'sm')}정상 해제</button><button class="btn sm danger" name="d" value="reported">의심거래 보고</button></form>` : `<div class="flash ${k === 'cleared' ? '' : 'err'} mt mb0" style="padding:10px 14px">${I(k === 'cleared' ? 'check-circle' : 'send')}<div class="small">${esc(a.note)}<div class="xs" style="opacity:.75">${a.reviewer || '운영 담당자'} · ${ymd(a.reviewed)}</div></div></div>`}</div>`).join('') : ''; }).join('')}`);
});
route(/^\/admin\/inquiries$/, () => adminPage('/inquiries', `<div class="eyebrow">Consumer Protection</div><h1>민원·문의</h1>
<div class="grid g4" style="margin:14px 0 18px">${kpi('inbox', '전체', S.inquiries.length + '건')}${kpi('clock', '처리 중', S.inquiries.filter(q => !q.resolved).length + '건', '', 'warn')}${kpi('alert', '기한 초과', S.inquiries.filter(q => !q.resolved && Date.now() > q.at + 15 * DAY).length + '건', '접수 후 15일 경과', 'err')}${kpi('check-circle', '처리 완료', S.inquiries.filter(q => q.resolved).length + '건', '', 'pos')}</div>
${S.inquiries.map(q => { const due = q.at + 15 * DAY, late = !q.resolved && Date.now() > due, el = Math.min(100, 100 * (Date.now() - q.at) / (15 * DAY));
  return `<div class="card"><div class="side between"><div class="side">${avatar(q.name)}<div><b style="color:var(--ink)">${maskName(q.name)}</b> ${pill({ general: '일반 문의', complaint: '민원', return_request: '반환 요청' }[q.kind], 'blue')}<div class="xs muted">접수 ${ymd(q.at)} · 기한 ${ymd(due)}</div></div></div>${pill(q.resolved ? '처리 완료' : late ? '기한 초과' : q.status === 'host_pending' ? '혼주 동의 대기' : '처리 중', q.resolved ? 'ok' : late ? 'err' : 'warn')}</div>
${q.resolved ? '' : `<div class="side between xs muted" style="margin-top:12px"><span>처리 기한 경과</span><span>${Math.round(el)}%</span></div>${meter(el, late ? 'err' : el > 70 ? 'warn' : '')}`}
<p class="mt">${esc(q.body)}</p>${q.answer ? `<div class="flash info mb0">${I('message')}<div class="small">${esc(q.answer)}</div></div>` : q.kind !== 'return_request' ? `<form data-form="answer" data-id="${q.id}" class="side"><input name="answer" required placeholder="답변 내용" style="flex:1"><button class="btn sm">${I('send', 'sm')}답변 발송</button></form>` : '<p class="small muted mb0">혼주(상주)의 동의 여부를 기다리고 있습니다.</p>'}</div>`; }).join('') || '<div class="card muted">접수된 문의가 없습니다.</div>'}`));
route(/^\/admin\/audit$/, () => {
  const label = { 'gift.paid': '결제', 'gift.cancelled': '결제 취소', 'event.created': '행사 등록', 'event.approve': '식장 확인 승인', 'event.reject': '식장 확인 반려', 'event.cancelled': '행사 취소', 'risk.alert': '경보 발생', 'risk.cleared': '경보 해제', 'risk.reported': '의심거래 보고', 'settlement.requested': '정산 신청', 'settlement.held': '정산 보류', 'settlement.paid': '정산 지급', 'pii.revealed': '개인정보 열람', 'settings.changed': '기준값 변경', 'admin.login': '운영자 로그인', 'return.requested': '반환 요청', 'return.answered': '반환 처리', 'inquiry.created': '문의 접수', 'inquiry.answered': '문의 답변', 'host.joined': '회원 가입', 'bank.verified': '계좌 인증', 'thanks.sent': '감사 메시지', 'ticket.used': '식권 확인' };
  const tone = a => a.startsWith('risk') || a === 'pii.revealed' ? 'err' : a.startsWith('settlement') ? 'ok' : a.includes('cancel') ? 'warn' : 'blue';
  const counts = {}; S.audit.forEach(l => counts[l.action] = (counts[l.action] || 0) + 1);
  return adminPage('/audit', `<div class="eyebrow">Audit Trail</div><h1>감사 로그</h1><p class="small muted">식장 확인, 개인정보 원본 열람, 경보 처리, 정산, 기준값 변경 등 모든 조치를 기록하며 5년간 보관합니다.</p>
<div class="grid g4" style="margin:14px 0 18px">${kpi('file', '전체 기록', S.audit.length + '건')}${kpi('eye', '개인정보 열람', (counts['pii.revealed'] || 0) + '건', '사유 기록 필수', 'warn')}${kpi('shield', '경보 처리', ((counts['risk.cleared'] || 0) + (counts['risk.reported'] || 0)) + '건')}${kpi('message', '문자 발송', S.sms.length + '건', '모의 발송')}</div>
<div class="card"><div class="tbl"><table><thead><tr><th>일시</th><th>처리자</th><th>구분</th><th>대상</th><th>내용</th></tr></thead><tbody>${S.audit.slice(0, 150).map(l => `<tr><td class="xs muted" style="white-space:nowrap">${ymd(l.at).slice(5)} ${hm(l.at)}</td><td class="small">${esc(l.actor.replace('host:', '혼주 #').replace('venue:', '식장 #').replace('guest', '하객').replace('system', '시스템').replace('admin', '운영자'))}</td><td>${pill(label[l.action] || l.action, tone(l.action))}</td><td class="xs muted">${esc(l.target)}</td><td class="small">${esc(l.detail)}</td></tr>`).join('')}</tbody></table></div></div>
<div class="card"><div class="card-h">${ibox('message', '', true)}<h3>문자 발송 기록 (모의)</h3></div><div class="tbl"><table><tbody>${S.sms.slice(0, 40).map(n => `<tr><td class="xs muted" style="white-space:nowrap">${ymd(n.at).slice(5)} ${hm(n.at)}</td><td class="small" style="white-space:nowrap">${maskPhone(n.phone)}</td><td class="small">${esc(n.body)}</td></tr>`).join('')}</tbody></table></div></div>`);
});
route(/^\/admin\/settings$/, () => adminPage('/settings', `<div class="eyebrow">Risk Parameters</div><h1>위험관리 기준값</h1><p class="small muted">신청서의 [ ] 표기 수치에 해당하며, 금융위원회 협의 및 제휴사 기준에 따라 확정합니다. 변경 내역은 감사 로그에 기록됩니다.</p>
<form data-form="settings"><div class="grid g2 mt">${Object.entries(DEFAULTS).map(([k, [d, l, unit, ic]]) => `<div class="card mb0"><div class="side">${ibox(ic, '', true)}<b style="flex:1;color:var(--ink)">${l}</b>${set(k) !== d ? pill('변경됨', 'warn') : ''}</div>
<div class="side mt"><input name="${k}" type="number" value="${set(k)}" style="flex:1;font-size:18px;font-weight:700"><span class="small muted" style="width:28px">${unit}</span></div><div class="xs muted" style="margin-top:6px">기본값 ${d.toLocaleString()}${unit === 'bp' ? ` (${d / 100}%)` : unit}</div></div>`).join('')}</div>
<div class="side mt"><button class="btn">${I('check')}저장</button><a class="btn ghost" href="#/reset">${I('rotate')}데모 초기화</a></div></form>`));

/* ── 이벤트 처리 ──────────────────────────────────────────── */
const forms = {
  pay(f, el) { const e = evByCode(el.dataset.code); if (!f.agree) throw new RuleError('이용약관 및 취소·환불 정책에 동의해 주세요.'); let dev = localStorage.getItem('lt_dev'); if (!dev) localStorage.setItem('lt_dev', dev = 'D' + code(10)); const g = pay(e, { ...f, device: dev }); flash('결제가 완료되었습니다. 모바일 식권이 발급되었습니다.'); go('#/g/' + g.id); },
  return(f, el) { requestReturn(gift(el.dataset.id), f.body); flash('반환 요청이 접수되었습니다. 혼주(상주) 동의 후 결과를 문자로 안내드립니다.'); render(); },
  support(f) { S.inquiries.unshift({ id: nextId('q'), kind: f.kind, name: f.name, phone: digits(f.phone), body: f.body, status: 'received', at: Date.now() }); audit('guest', 'inquiry.created', '', f.kind); save(); flash('문의가 접수되었습니다. 15일 이내에 문자로 답변드립니다.'); render(); },
  'host-login'(f) { if (digits(f.birth).length !== 8) throw new RuleError('생년월일 8자리를 입력해 주세요.'); const c = ci(f.name, f.birth, f.phone); let u = S.users.find(x => x.ci === c); if (!u) { u = { id: nextId('u'), name: f.name.trim(), birth: f.birth, phone: digits(f.phone), ci: c, joined: Date.now() }; S.users.push(u); audit('system', 'host.joined', '', maskName(u.name)); } S.session.host = u.id; save(); flash(`${u.name} 님, 본인인증이 완료되었습니다.`); render(); },
  bank(f) { const u = me(); if (f.holder.replace(/\s/g, '') !== u.name.replace(/\s/g, '')) throw new RuleError('예금주가 본인인증 성명과 일치하지 않습니다. 본인 명의 계좌만 등록하실 수 있습니다.'); const c = String(Math.floor(Math.random() * 10000)).padStart(4, '0'); S.session.bank = { ...f, code: c }; save(); flash(`1원을 송금했습니다. 입금자명의 숫자 4자리를 입력해 주세요. (데모 인증번호 ${c})`, 'info'); render(); },
  'bank-verify'(f) { const u = me(), p = S.session.bank; if (!p || f.code.trim() !== p.code) throw new RuleError('인증번호가 일치하지 않습니다.'); Object.assign(u, { bank_name: p.bank, bank_account: digits(p.acc), bank_ok: Date.now() }); delete S.session.bank; audit('host:' + u.id, 'bank.verified', '', maskAcc(u.bank_account)); save(); flash('정산 계좌 인증이 완료되었습니다.'); go('#/host'); },
  'new-event'(f, el) {
    const u = me(); const n = S.events.filter(e => e.host === u.id && e.created > Date.now() - 365 * DAY && e.status !== 'cancelled').length;
    if (n >= set('limit_host_events_per_year')) throw new RuleError(`행사 개설은 연 ${set('limit_host_events_per_year')}회로 제한됩니다.`);
    const file = el.querySelector('[name=contract]').files[0];
    if (f.kind === 'wedding' && !file) throw new RuleError('결혼식은 식장 계약서를 첨부해 주세요.');
    const e = { id: nextId('e'), code: code(8), host: u.id, venue: +f.venue, kind: f.kind, title: f.title, role: f.role, date: f.date, time: f.time, hall: f.hall, message: f.message, meal: !!f.meal, contract: file?.name, status: 'pending_verify', settle: 'none', hold: '', note: '', created: Date.now() };
    S.events.push(e); audit('host:' + u.id, 'event.created', 'event:' + e.code, KIND[f.kind]); save(); flash('행사가 등록되었습니다. 식장 예약 확인 후 청첩장이 공개됩니다.'); go('#/host/e/' + e.id);
  },
  thanks(f, el) { const e = ev(el.dataset.id); let n = 0; gifts(e).forEach(g => { if (['paid', 'settled'].includes(g.status) && !g.thanks) { sms(g.phone, `[LifeTies] ${e.title}: ${f.body}`); g.thanks = Date.now(); n++; } }); audit('host:' + e.host, 'thanks.sent', 'event:' + e.code, n + '건'); save(); flash(n ? `감사 메시지를 ${n}명에게 발송했습니다.` : '모든 하객에게 이미 발송되었습니다.', n ? 'ok' : 'info'); render(); },
  'cancel-event'(f, el) { if (!confirm('행사를 취소하면 정산 전 결제가 전액 자동 취소됩니다. 진행하시겠습니까?')) return; const n = cancelEvent(ev(el.dataset.id), el.dataset.actor === 'admin' ? 'admin' : 'host:' + ev(el.dataset.id).host, f.reason); flash(`행사가 취소되었습니다. 결제 ${n}건이 자동 취소되었으며 하객에게 안내 문자가 발송되었습니다.`); render(); },
  'venue-login'(f) { const v = venue(f.venue); if (!v || v.staff !== f.staff) throw new RuleError('식장 코드가 일치하지 않습니다.'); S.session.venue = v.id; save(); render(); },
  scan(f) {
    const v = venue(S.session.venue), c = f.code.trim().toUpperCase().replace('LIFETIES-TICKET:', ''), g = S.gifts.find(x => x.ticket === c), e = g && ev(g.event_id);
    let r;
    if (!g || e.venue !== v.id) r = ['err', '확인할 수 없는 식권입니다', '본 식장에서 발급된 식권이 아닙니다.'];
    else if (['cancelled', 'returned'].includes(g.status)) r = ['err', '사용할 수 없는 식권입니다', '결제가 취소된 식권입니다.'];
    else if (g.used) r = ['warn', '이미 사용된 식권입니다', `${hm(g.used)}에 확인 처리되었습니다.`];
    else if (e.date !== ymd(today())) r = ['err', '행사일이 아닙니다', `행사일: ${kdate(e.date)}`];
    else { g.used = Date.now(); audit('venue:' + v.id, 'ticket.used', 'gift:' + g.id); r = ['ok', '식권이 확인되었습니다', `${e.title} · ${maskName(g.name)} 님`]; }
    S.session.scan = r; save(); render();
  },
  'admin-login'(f) { if (f.uid !== 'admin' || f.pw !== 'admin1234') throw new RuleError('아이디 또는 비밀번호가 일치하지 않습니다.'); S.session.admin = true; audit('admin', 'admin.login'); save(); render(); },
  reveal(f, el) { S.session.reveal = +el.dataset.id; audit('admin', 'pii.revealed', 'event:' + ev(el.dataset.id).code, f.reason); save(); flash('개인정보 원본 열람이 감사 로그에 기록되었습니다.', 'warn'); render(); },
  verify(f, el, btn) { const e = ev(el.dataset.id); if (btn === 'approve') { e.status = 'published'; e.note = f.note || '식장 예약 확인 완료'; e.verified = Date.now(); sms(user(e.host).phone, `[LifeTies] ${e.title} 식장 확인이 완료되어 청첩장이 공개되었습니다.`); } else { e.status = 'rejected'; e.note = f.note || '식장 예약 내역을 확인할 수 없음'; } audit('admin', 'event.' + btn, 'event:' + e.code, e.note); save(); flash(btn === 'approve' ? '식장 확인이 완료되어 행사가 공개되었습니다.' : '행사를 반려했습니다.'); render(); },
  review(f, el, btn) { reviewAlert(S.alerts.find(a => a.id === +el.dataset.id), btn, f.note); flash(btn === 'cleared' ? '경보를 정상 해제했습니다.' : '의심거래로 판단하여 제휴사 보고책임자에게 보고를 요청했습니다.', btn === 'cleared' ? 'ok' : 'warn'); render(); },
  answer(f, el) { const q = S.inquiries.find(x => x.id === +el.dataset.id); Object.assign(q, { answer: f.answer, status: 'resolved', resolved: Date.now() }); sms(q.phone, '[LifeTies] 문의 답변: ' + f.answer); audit('admin', 'inquiry.answered', 'inquiry:' + q.id); save(); flash('답변을 발송했습니다.'); render(); },
  settings(f) { const ch = []; for (const k in DEFAULTS) { const v = +f[k]; if (Number.isFinite(v) && v !== set(k)) { ch.push(`${k}: ${set(k)}→${v}`); S.settings[k] = v; } } if (ch.length) audit('admin', 'settings.changed', '', ch.join('; ')); save(); flash(ch.length ? `기준값 ${ch.length}건이 변경되었습니다.` : '변경된 항목이 없습니다.', ch.length ? 'ok' : 'info'); render(); },
};
const acts = {
  'cancel-gift'(id) { if (!confirm('결제를 취소하시겠습니까?')) return; cancelGift(gift(id), 'guest', '하객 직접 취소'); save(); flash('결제가 취소되었습니다. 카드사 승인 취소에는 영업일 기준 3~5일이 소요될 수 있습니다.'); },
  settle(id) { const r = requestSettle(ev(id)); flash(r === 'requested' ? '정산 신청이 접수되었습니다. 운영 확인 후 본인 명의 계좌로 지급됩니다.' : '이상거래 점검 대상으로 확인되어 정산이 보류되었습니다. 담당자 검토 후 안내드립니다.', r === 'requested' ? 'ok' : 'warn'); },
  'pay-out'(id) { const st = executeSettle(ev(id)); flash(`정산금 ${won(st.net)}을 지급했습니다. (지급번호 ${st.payout})`); },
  'return-yes'(id) { answerReturn(S.inquiries.find(q => q.id === +id), true); flash('반환에 동의하셨습니다. 하객 결제 카드로 반환 처리됩니다.'); },
  'return-no'(id) { answerReturn(S.inquiries.find(q => q.id === +id), false); flash('반환 요청에 동의하지 않음으로 처리했습니다.', 'info'); },
};
document.addEventListener('submit', e => {
  const el = e.target, name = el.dataset.form; if (!forms[name]) return;
  e.preventDefault();
  const f = Object.fromEntries(new FormData(el)); el.querySelectorAll('input[type=checkbox]').forEach(c => f[c.name] = c.checked);
  try { forms[name](f, el, e.submitter?.value); } catch (err) { if (!(err instanceof RuleError)) console.error(err); flash(err.message, 'err'); render(); }
});
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'), amt = e.target.closest('[data-amount]'), lo = e.target.closest('[data-logout]'), fill = e.target.closest('[data-fill]');
  if (amt) amt.closest('form').amount.value = amt.dataset.amount;
  if (fill) { e.preventDefault(); fill.closest('form').code.value = fill.dataset.fill; }
  if (lo) { delete S.session[lo.dataset.logout]; delete S.session.reveal; save(); }
  if (a) { try { acts[a.dataset.act](a.dataset.id); save(); } catch (err) { flash(err.message, 'err'); } render(); }
});
document.addEventListener('change', e => { const t = e.target.closest('[data-toggle]'); if (t) document.getElementById(t.dataset.toggle).style.display = t.checked ? 'block' : 'none'; });
function render() {
  const path = location.hash.replace(/^#/, '') || '/';
  if (!path.startsWith('/admin/e/')) delete S.session.reveal;
  let html = null;
  for (const [re, fn] of routes) { const m = path.match(re); if (m) { html = fn(m.slice(1)); break; } }
  if (html === '') return;
  flashes = [];
  $('#app').innerHTML = html ?? page('경조금 간편 수납', navs.public(''), `<div class="card"><h2>페이지를 찾을 수 없습니다</h2><a href="#/">처음으로</a></div>`);
  const q = $('#qr'); if (q && window.qrcode) { const qr = qrcode(0, 'M'); qr.addData(q.dataset.qr); qr.make(); q.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 0, scalable: true }); }
  window.scrollTo(0, 0);
}
load();
window.addEventListener('hashchange', render);
render();
