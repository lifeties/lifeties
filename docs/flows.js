/* LifeTies 데모 — 서비스 흐름 화면
 * 홈(안내장 양식 선택) · 설정 · 청첩장/부고장 만들기(단계별) · 발송 · 문자 수신
 * 청첩장/부고장 안내 · 축의금/조의금 보내기(본인 확인 → 결제창 → 완료) · 행사 메뉴(내역·정산·답례품) */
'use strict';
Object.assign(ICONS, {
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  coffee: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  ribbon: '<path d="M12 11.22C11 9.997 10 9 10 8a2 2 0 0 1 4 0c0 1-.998 2.002-2.01 3.22"/><path d="m12 18 2.57-3.5"/><path d="M6.243 9.016a7 7 0 0 1 11.507-.009"/><path d="M9.35 14.53 12 11.22"/><path d="M9.35 14.53C7.728 12.246 6 10.221 6 7a6 5 0 0 1 12 0c-.005 3.22-1.778 5.235-3.43 7.5l3.557 4.527a1 1 0 0 1-.203 1.43l-1.894 1.36a1 1 0 0 1-1.384-.215L12 18l-2.679 3.593a1 1 0 0 1-1.39.213l-1.865-1.353a1 1 0 0 1-.203-1.422z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c0-1.1.9-2 2-2h2"/><path d="M4 8c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>', 'chevron-l': '<path d="m15 18-6-6 6-6"/>',
  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
});
const SVG_ART = [ // 갤러리용 일러스트(실사 사진 대신 사용)
  `<svg viewBox="0 0 300 380" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="a1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9ECFB"/><stop offset="1" stop-color="#C7CDF5"/></linearGradient></defs><rect width="300" height="380" fill="url(#a1)"/><circle cx="125" cy="140" r="56" fill="none" stroke="#fff" stroke-width="10"/><circle cx="175" cy="140" r="56" fill="none" stroke="#0A0878" stroke-opacity=".55" stroke-width="10"/></svg>`,
  `<svg viewBox="0 0 300 380" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="a2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0A0878"/><stop offset="1" stop-color="#5B74F0"/></linearGradient></defs><rect width="300" height="380" fill="url(#a2)"/>${Array.from({ length: 7 }, (_, i) => `<ellipse cx="150" cy="190" rx="22" ry="70" fill="#fff" fill-opacity=".18" transform="rotate(${i * 26} 150 190)"/>`).join('')}<circle cx="150" cy="190" r="16" fill="#fff" fill-opacity=".8"/></svg>`,
  `<svg viewBox="0 0 300 380" preserveAspectRatio="xMidYMid slice"><rect width="300" height="380" fill="#F4F1EC"/><path d="M0 300 Q75 240 150 280 T300 260 V380 H0Z" fill="#DCE2FB"/><path d="M0 330 Q90 290 170 320 T300 310 V380 H0Z" fill="#A9B2F2"/><circle cx="220" cy="100" r="34" fill="#FFFFFF"/><path d="M90 300 V170 M90 200 q-30-20-34-52 q30 8 34 40 M90 230 q28-24 36-56 q-30 10-36 48" stroke="#0A0878" stroke-opacity=".6" stroke-width="4" fill="none"/></svg>`,
];
const FUNERAL_ART = `<svg viewBox="0 0 300 380" preserveAspectRatio="xMidYMid slice"><rect width="300" height="380" fill="#1E2433"/>${Array.from({ length: 12 }, (_, i) => `<ellipse cx="150" cy="170" rx="18" ry="62" fill="#fff" fill-opacity=".9" transform="rotate(${i * 15} 150 170)"/>`).join('')}<circle cx="150" cy="170" r="20" fill="#E9D8A6"/><path d="M150 232 V340" stroke="#7A8B6E" stroke-width="5"/></svg>`;
const DOW = '일월화수목금토';
function calendar(dateStr) {
  const d = new Date(dateStr), y = d.getFullYear(), m = d.getMonth(), first = new Date(y, m, 1).getDay(), last = new Date(y, m + 1, 0).getDate();
  const dd = daysBetween(today(), d);
  const cells = Array(first).fill('').concat(Array.from({ length: last }, (_, i) => i + 1));
  return `<div class="cal"><div class="cal-h"><b>${y}. ${m + 1}</b><span>${dd > 0 ? `D-${dd}` : dd === 0 ? 'D-DAY' : `${-dd}일 지남`}</span></div>
  <div class="cal-g">${[...DOW].map((w, i) => `<i class="${i === 0 ? 'sun' : ''}">${w}</i>`).join('')}${cells.map((c, i) => `<span class="${c === d.getDate() ? 'on' : ''} ${i % 7 === 0 ? 'sun' : ''}">${c}</span>`).join('')}</div></div>`;
}
function mapCard(v, hall) {
  return `<div class="map"><svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice"><rect width="400" height="200" fill="#EEF1F6"/>
  <path d="M-10 150 C80 120 140 170 230 140 S360 90 410 110 V210 H-10Z" fill="#D7E3F7"/><g stroke="#fff" stroke-width="9" fill="none"><path d="M0 70 H400"/><path d="M120 0 V200"/><path d="M280 0 L250 200"/></g>
  <g stroke="#fff" stroke-width="4" fill="none"><path d="M0 30 H400"/><path d="M0 115 H260"/><path d="M60 0 V200"/><path d="M200 0 V140"/><path d="M340 0 V200"/></g>
  <rect x="142" y="80" width="40" height="26" rx="4" fill="#DCE2FB"/><rect x="214" y="36" width="50" height="24" rx="4" fill="#DCE2FB"/>
  <g transform="translate(200 92)"><circle r="26" fill="#3451E6" fill-opacity=".15"/><path d="M0 -30 C-14 -30 -22 -20 -22 -9 C-22 6 0 22 0 22 C0 22 22 6 22 -9 C22 -20 14 -30 0 -30Z" fill="#0A0878"/><circle cy="-9" r="7" fill="#fff"/></g></svg>
  <div class="map-b"><div><b>${esc(v.name)}</b><span>${esc(v.area)} · ${esc(hall || '')} · ${v.phone}</span></div></div>
  <div class="map-a"><a href="#" data-mock="지도 앱으로 연결됩니다(모의)">${I('navigation', 'sm')}네이버 지도</a><a href="#" data-mock="지도 앱으로 연결됩니다(모의)">${I('navigation', 'sm')}카카오맵</a><a href="#" data-mock="내비게이션으로 연결됩니다(모의)">${I('navigation', 'sm')}티맵</a></div></div>`;
}
const ddayText = e => { const n = daysBetween(today(), e.date); return n > 0 ? `D-${n}` : n === 0 ? '오늘' : '종료'; };
const tabs = (items, cur) => `<div class="tabs">${items.map(([h, l, k]) => `<a class="${k === cur ? 'on' : ''}" href="${h}">${l}</a>`).join('')}</div>`;
const seg = (name, opts, val) => `<div class="seg">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}" ${String(val) === String(v) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
const stepNav = (back, next = '다음') => `<div class="wiz-nav">${back ? `<a class="btn ghost" href="${back}">${I('chevron-l')}이전</a>` : '<span></span>'}<button class="btn">${next}${I('chevron')}</button></div>`;
const host = () => user(S.session.host);

/* ── 혼주·상주 홈: 안내장 양식 선택 ───────────────────────── */
route(/^\/host$/, () => {
  const u = host();
  if (!u) return page('혼주·상주', navs.public('host'), `${stepper(['본인인증', '정산 계좌', '안내장 만들기', '식장 확인'], 0)}
<form class="card mt" data-form="host-login"><div class="card-h">${ibox('smartphone', 'dark')}<div><h2>휴대폰 본인인증</h2><div class="xs muted">정산은 본인인증을 완료한 혼주·상주 본인에게만 지급됩니다.</div></div></div>
<label>성명</label><input name="name" required value="김지은"><label>생년월일</label><input name="birth" required value="19940312"><label>휴대폰 번호</label><input name="phone" required value="010-1234-5678">
<div class="flash info mt">${I('lock')}<div class="small">주민등록번호는 수집하지 않습니다. 다른 데모 계정 — 박민수 19700521 010-2345-6789 · 이선호 19881102 010-3456-7890</div></div>
<label class="check"><input type="checkbox" name="agree" checked required> 개인정보 수집·이용에 동의합니다. (본인인증 결과, 연락처, 정산 계좌, 행사 정보)</label><button class="btn block mt">${I('shield')}본인인증 (모의)</button></form>`, true);
  const evs = S.events.filter(e => e.host === u.id).sort((a, b) => b.id - a.id);
  return page('혼주·상주', navs.host('list'), `<div class="side between"><div><div class="eyebrow">Welcome</div><h1 class="mb0">${esc(u.name)} 님, 안녕하세요</h1><p class="muted">안내장 양식을 선택해 주세요.</p></div><a class="btn ghost sm" href="#/host/settings">${I('settings', 'sm')}설정</a></div>
${u.bank_ok ? '' : `<div class="flash warn">${I('alert')}<div>정산 계좌가 등록되지 않았습니다. <a href="#/host/bank">본인 명의 계좌 인증하기</a></div></div>`}
<div class="tpl">${[['wedding', '청첩장', 'Wedding', 'heart', '#0A0878', '#3451E6', ''], ['funeral', '부고장', 'Obituary', 'flower', '#1E2433', '#3A4255', ''], ['other', '돌잔치 · 칠순', 'Celebration', 'gift', '#5B3E96', '#8A6FD1', ''], ['invite', '초대장', 'Invitation', 'mail', '#9AA1B5', '#C4C9D6', '준비 중']]
    .map(([k, t, en, ic, c1, c2, soon]) => `<a class="tpl-c ${soon ? 'off' : ''}" href="${soon ? '#/host' : '#/host/new/' + k}" style="background:linear-gradient(140deg,${c1},${c2})"><div class="tpl-i">${I(ic, 'lg')}</div><div class="tpl-en">${en}</div><b>${t}</b>${soon ? `<span class="tpl-s">${soon}</span>` : `<span class="tpl-go">만들기 ${I('arrow', 'sm')}</span>`}</a>`).join('')}</div>
<div class="sect">${ibox('calendar', '', true)}<h3>내 행사</h3><span class="eyebrow">${evs.length} Events</span></div>
${evs.map(e => { const t = totals(e); return `<a class="card ev-row" href="#/host/e/${e.id}">${ibox(KIND_IC[e.kind], e.kind === 'funeral' ? '' : 'dark')}
<div class="ev-t"><b>${esc(e.title)}</b><span>${kdate(e.date)} · ${esc(venue(e.venue).name)}</span></div>
<div class="num"><b>${won(t.gross)}</b><span class="xs muted">${t.count}건</span></div><div class="side">${pill(EV_ST[e.status], EV_TONE[e.status])}${pill(SET_ST[e.settle], SET_TONE[e.settle])}</div>${I('chevron', 'sm')}</a>`; }).join('') || `<div class="card muted">아직 만든 안내장이 없습니다. 위에서 양식을 선택해 주세요.</div>`}`);
});
route(/^\/host\/new$/, () => go('#/host'));

/* ── 설정 ─────────────────────────────────────────────────── */
route(/^\/host\/settings$/, (_, P) => {
  const u = host(); if (!u) return go('#/host');
  const n = u.notify || { pay: true, settle: true, promo: false };
  return page('혼주·상주', navs.host('settings'), `<a class="small" href="#/host">${I('arrow-l', 'sm')} 홈</a><h1 class="mt">설정</h1>
<form data-form="settings-host"><div class="card"><div class="card-h">${ibox('user', '', true)}<h3>내 정보</h3><span class="sp">${pill('본인인증 완료', 'ok')}</span></div>
<div class="row2"><div><label>성명</label><input value="${esc(u.name)}" disabled></div><div><label>휴대폰 번호</label><input value="${fmtPhone(u.phone)}" disabled></div></div>
<label>이메일</label><input name="email" type="email" value="${esc(u.email || '')}" placeholder="example@email.com"><p class="xs muted" style="margin-top:6px">성명과 휴대폰 번호는 본인인증 정보로, 재인증을 통해서만 변경하실 수 있습니다.</p></div>
<div class="card"><div class="card-h">${ibox('bank', '', true)}<h3>정산 계좌</h3><span class="sp">${u.bank_ok ? pill('본인 명의 확인', 'ok') : pill('미등록', 'warn')}</span></div>
<div class="side between"><div><b style="color:var(--ink);font-size:16px">${u.bank_ok ? `${u.bank_name} ${maskAcc(u.bank_account)}` : '등록된 계좌가 없습니다'}</b><div class="xs muted">정산금은 본인 명의 계좌로만 지급됩니다.</div></div><a class="btn sm ghost" href="#/host/bank">${u.bank_ok ? '계좌 변경' : '계좌 등록'}</a></div></div>
<div class="card"><div class="card-h">${ibox('key', '', true)}<h3>간편 비밀번호</h3><span class="sp xs muted">결제·정산 확인 시 사용</span></div>
<details class="pin" ${P.get('pin') ? 'open' : ''}><summary><span>●●●●●●</span><span class="small" style="color:var(--blue);font-weight:600">비밀번호 변경</span></summary>
<input name="pin_now" type="password" inputmode="numeric" maxlength="6" placeholder="현재 비밀번호 6자리 (데모: 000000)"><input name="pin_new" type="password" inputmode="numeric" maxlength="6" placeholder="새 비밀번호 6자리"><input name="pin_new2" type="password" inputmode="numeric" maxlength="6" placeholder="새 비밀번호 확인"><a class="xs" href="#" data-mock="본인인증 후 비밀번호를 재설정합니다(모의)">비밀번호를 잊으셨나요?</a></details></div>
<div class="card"><div class="card-h">${ibox('bell', '', true)}<h3>알림 설정</h3></div>
${[['pay', '결제 알림', '하객 결제·취소 시 알림'], ['settle', '정산 알림', '정산 신청·지급·보류 시 알림'], ['promo', '이벤트·혜택 알림', '선택 동의']].map(([k, l, d]) => `<label class="toggle"><span><b>${l}</b><small>${d}</small></span><input type="checkbox" name="n_${k}" ${n[k] ? 'checked' : ''}><i></i></label>`).join('')}</div>
<button class="btn block">${I('check')}설정 저장</button></form>`, true);
});

/* ── 안내장 만들기(단계별) ──────────────────────────────── */
const WIZ = {
  wedding: { t: '청첩장 만들기', steps: ['신랑·신부', '혼주 정보', '예식 일시·장소', '사진·인사말', '계약서·식권', '답례품'] },
  funeral: { t: '부고장 만들기', steps: ['고인 정보', '상주 정보', '빈소·발인·장지', '알림 메시지'] },
  other: { t: '돌잔치·칠순 안내장 만들기', steps: ['행사 정보', '일시·장소', '인사말', '답례품'] },
};
const GREET = { wedding: '서로 다른 길을 걸어온 두 사람이\n이제 같은 길을 함께 걸어가려 합니다.\n귀한 걸음으로 축복해 주시면 감사하겠습니다.', other: '소중한 분들을 모시고 감사의 자리를 마련했습니다.\n함께해 주시면 큰 기쁨이 되겠습니다.' };
route(/^\/host\/new\/(wedding|funeral|other)$/, ([k], P) => {
  const u = host(); if (!u) return go('#/host');
  const W = WIZ[k], n = Math.max(1, Math.min(W.steps.length, +P.get('step') || 1));
  if (!S.session.wiz || S.session.wiz.kind !== k || P.get('new')) { S.session.wiz = { kind: k }; save(); }
  const d = S.session.wiz, v = x => esc(d[x] ?? ''), back = n > 1 ? qp('#/host/new/' + k, { step: n - 1 }) : '#/host';
  const venues = S.venues.filter(x => k === 'funeral' ? x.kind === 'funeral' : x.kind === 'wedding');
  let body = '';
  if (k === 'wedding') body = [
    `<div class="row2"><div><label>신랑 성명</label><input name="groom" required value="${v('groom')}" placeholder="최도윤"></div><div><label>신랑 연락처</label><input name="groom_phone" value="${v('groom_phone')}" placeholder="010-0000-0000"></div></div>
     <div class="row2"><div><label>신부 성명</label><input name="bride" required value="${v('bride')}" placeholder="김지은"></div><div><label>신부 연락처</label><input name="bride_phone" value="${v('bride_phone')}" placeholder="010-0000-0000"></div></div>
     <label>신청인 구분</label>${seg('role', [['신랑', '신랑'], ['신부', '신부'], ['혼주(신랑측)', '신랑측 혼주'], ['혼주(신부측)', '신부측 혼주']], d.role || '신부')}`,
    `<div class="sub">${I('user', 'sm')}신랑측 혼주</div><div class="row2"><div><label>아버지</label><input name="gf" value="${v('gf')}" placeholder="성명"></div><div><label>어머니</label><input name="gm" value="${v('gm')}" placeholder="성명"></div></div>
     <div class="sub mt">${I('user', 'sm')}신부측 혼주</div><div class="row2"><div><label>아버지</label><input name="bf" value="${v('bf')}" placeholder="성명"></div><div><label>어머니</label><input name="bm" value="${v('bm')}" placeholder="성명"></div></div>
     <p class="xs muted mt">입력하신 혼주 성함은 청첩장 인사말 아래에 표시됩니다. 고인이 되신 경우 성함 앞에 故를 붙여 주세요.</p>`,
    `<div class="row2"><div><label>예식일</label><input type="date" name="date" required value="${v('date')}" min="${ymd(today())}"></div><div><label>예식 시각</label><input type="time" name="time" value="${d.time || '12:30'}"></div></div>
     <label>제휴 예식장</label><select name="venue">${venues.map(x => `<option value="${x.id}" ${+d.venue === x.id ? 'selected' : ''}>${esc(x.name)} · ${x.area}</option>`).join('')}</select><label>예식 홀</label><input name="hall" value="${v('hall')}" placeholder="예: 3층 그랜드홀">
     <div class="flash info mt mb0">${I('shield')}<div class="small">와이즈앤코가 예식장에 예약 여부를 직접 확인한 뒤 청첩장이 공개됩니다.</div></div>`,
    `<label>사진 <span class="muted" style="font-weight:400">(최대 10장)</span></label><div class="up-grid">${SVG_ART.map(a => `<div class="up">${a}</div>`).join('')}<label class="up add"><input type="file" accept="image/*" multiple name="photos" hidden>${I('plus')}<span>사진 추가</span></label></div>
     <label>인사말</label><textarea name="greeting" rows="5">${esc(d.greeting ?? GREET.wedding)}</textarea>`,
    `<label>식장 계약서 <span class="muted" style="font-weight:400">(필수 · JPG, PNG, PDF)</span></label><label class="drop"><input type="file" name="contract" accept=".jpg,.jpeg,.png,.pdf" hidden>${I('file', 'lg')}<b>${d.contract ? esc(d.contract) : '계약서 파일 선택'}</b><span>예약자 성명·예식 일시·홀이 보이도록 첨부해 주세요</span></label>
     <label class="toggle mt"><span><b>모바일 식권 발급</b><small>결제한 하객에게 QR 식권을 발급하고, 식장에서 사용 여부로 행사 실재를 확인합니다</small></span><input type="checkbox" name="meal" ${d.meal === false ? '' : 'checked'}><i></i></label>`,
    favorPicker(d)];
  if (k === 'funeral') body = [
    `<div class="row2"><div><label>고인 성함</label><input name="dname" required value="${v('dname')}" placeholder="박정자"></div><div><label>향년</label><input name="age" type="number" value="${v('age')}" placeholder="84"></div></div>
     <div class="row2"><div><label>별세일</label><input type="date" name="died" required value="${d.died || ymd(today())}"></div><div><label>종교</label><select name="religion">${['무교', '불교', '기독교', '천주교'].map(r => `<option ${d.religion === r ? 'selected' : ''}>${r}</option>`).join('')}</select></div></div>`,
    `<div class="mourners">${(d.mourners || [['장남', u.name], ['', ''], ['', ''], ['', '']]).map(([r, nm], i) => `<div class="row2"><div><label>${i ? '' : '관계'}</label><input name="mr_${i}" value="${esc(r)}" placeholder="장남·장녀·자부 등"></div><div><label>${i ? '' : '성명'}</label><input name="mn_${i}" value="${esc(nm)}" placeholder="성명"></div></div>`).join('')}</div>
     <p class="xs muted mt">상주 대표(신청인)는 본인인증을 완료한 ${esc(u.name)} 님입니다. 조의금은 상주 대표 본인 명의 계좌로 정산됩니다.</p>`,
    `<label>장례식장</label><select name="venue">${venues.map(x => `<option value="${x.id}" ${+d.venue === x.id ? 'selected' : ''}>${esc(x.name)} · ${x.area}</option>`).join('')}</select><label>빈소</label><input name="hall" value="${v('hall')}" placeholder="예: 특실 2호">
     <div class="row2"><div><label>발인일</label><input type="date" name="balin_d" value="${d.balin_d || ymd(addDays(today(), 2))}"></div><div><label>발인 시각</label><input type="time" name="balin_t" value="${d.balin_t || '07:00'}"></div></div><label>장지</label><input name="burial" value="${v('burial')}" placeholder="예: 경기 파주시 용미리 추모공원">`,
    `<label>알림 메시지</label><textarea name="greeting" rows="6">${esc(d.greeting ?? '삼가 고인의 명복을 빕니다.\n생전에 베풀어 주신 후의에 깊이 감사드리며, 부족하나마 알려드립니다.')}</textarea>
     <label class="toggle mt"><span><b>모바일 식권 발급</b><small>조문객 식사 확인 및 행사 실재 확인에 활용됩니다</small></span><input type="checkbox" name="meal" ${d.meal === false ? '' : 'checked'}><i></i></label>
     <div class="flash info mt mb0">${I('shield')}<div class="small">장례는 계약서 대신 제휴 장례식장의 이용 확인으로 진행되며, 확인 즉시 부고장이 공개됩니다.</div></div>`];
  if (k === 'other') body = [
    `<label>행사명</label><input name="title" required value="${v('title')}" placeholder="예: 강명숙 님 칠순 잔치"><label>신청인 구분</label>${seg('role', [['본인', '본인'], ['자녀', '자녀'], ['부모', '부모']], d.role || '본인')}`,
    `<div class="row2"><div><label>행사일</label><input type="date" name="date" required value="${v('date')}" min="${ymd(today())}"></div><div><label>시각</label><input type="time" name="time" value="${d.time || '18:00'}"></div></div><label>제휴 연회장</label><select name="venue">${venues.map(x => `<option value="${x.id}" ${+d.venue === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><label>연회장</label><input name="hall" value="${v('hall')}"><label>예약 확인서</label><label class="drop"><input type="file" name="contract" hidden>${I('file', 'lg')}<b>${d.contract ? esc(d.contract) : '예약 확인서 선택'}</b><span>JPG, PNG, PDF</span></label>`,
    `<label>인사말</label><textarea name="greeting" rows="5">${esc(d.greeting ?? GREET.other)}</textarea>`,
    favorPicker(d)];
  const last = n === W.steps.length;
  return page('혼주·상주', navs.host('new'), `<div class="wiz"><div class="side between"><div><div class="eyebrow">Step ${String(n).padStart(2, '0')} / ${String(W.steps.length).padStart(2, '0')}</div><h1 class="mb0">${W.t}</h1></div>${ibox(KIND_IC[k], 'dark')}</div>
<div class="bar"><i style="width:${100 * n / W.steps.length}%"></i></div><div class="bar-l">${W.steps.map((s, i) => `<span class="${i + 1 === n ? 'on' : i + 1 < n ? 'done' : ''}">${s}</span>`).join('')}</div>
<form class="card" data-form="wiz" data-kind="${k}" data-step="${n}"><h2>${W.steps[n - 1]}</h2>${body[n - 1]}${stepNav(back, last ? (k === 'funeral' ? '부고장 등록' : '등록 및 식장 확인 요청') : '다음')}</form></div>`, true);
});
function favorPicker(d) {
  const sel = d.favors || [];
  return `<p class="small muted">하객이 결제할 때 선택할 수 있는 답례품을 지정합니다. 선택 사항이며, 비용은 정산 시 차감됩니다.</p>
  <div class="fav-grid">${Object.entries(FAVORS).map(([k, f]) => `<label class="fav"><input type="checkbox" name="fav_${k}" ${sel.includes(k) ? 'checked' : ''}><div class="fav-i" style="color:${f.tone}">${I(f.ic, 'lg')}</div><b>${f.name}</b><span>${won(f.price)}</span><i class="fav-c">${I('check', 'sm')}</i></label>`).join('')}</div>
  <p class="xs muted mt">답례품 없이 진행하시려면 선택하지 않고 등록하시면 됩니다.</p>`;
}

/* ── 발송 · 문자 수신 ─────────────────────────────────────── */
const smsText = e => e.kind === 'funeral'
  ? `[부고] 故 ${e.deceased?.name || e.title.replace(/故|님 부고/g, '').trim()} 님께서 ${e.deceased ? md(e.deceased.died) : ''} 별세하셨기에 삼가 알려드립니다.\n빈소: ${venue(e.venue).name} ${e.hall}\n발인: ${e.balin ? md(e.balin) + ' ' + e.balin.slice(11) : '-'}\n▶ 부고 보기`
  : `[${e.kind === 'wedding' ? '청첩장' : '초대장'}] ${e.title}\n${kdate(e.date)} ${e.time}\n${venue(e.venue).name} ${e.hall}\n▶ ${e.kind === 'wedding' ? '모바일 청첩장' : '초대장'} 보기`;
const shareUrl = e => (/^(localhost|127\.)/.test(location.hostname) ? 'https://lifeties.github.io/lifeties/' : location.href.split('#')[0]) + '#/i/' + e.code;
route(/^\/host\/e\/(\d+)\/send$/, ([id]) => {
  const u = host(), e = ev(id); if (!u || !e || e.host !== u.id) return go('#/host');
  const ok = e.status === 'published', word = e.kind === 'funeral' ? '부고장' : e.kind === 'wedding' ? '청첩장' : '초대장';
  return page('혼주·상주', navs.host('list'), `${evHead(e)}${evTabs(e, 'send')}
${stepper(['안내장 등록', '식장 확인', '발송 준비', '발송 완료'], ok ? (e.sent ? 4 : 2) : 1)}
${ok ? '' : `<div class="flash warn mt">${I('clock')}<div>식장 확인이 완료되면 발송하실 수 있습니다. 확인 결과는 문자로 안내드립니다. <span class="xs">(데모: 운영 관리 → 행사에서 확인 처리)</span></div></div>`}
<div class="grid g2 mt"><div class="card"><div class="card-h">${ibox('message', 'dark', true)}<h3>알림 메시지 미리보기</h3></div>
<div class="bubble-wrap"><div class="bubble">${esc(smsText(e)).replace(/\n/g, '<br>')}<div class="lp">${e.kind === 'funeral' ? FUNERAL_ART : SVG_ART[1]}<div><b>${esc(e.title)}</b><span>lifeties.github.io</span></div></div></div></div>
<a class="small" href="#/m/${e.code}">${I('smartphone', 'sm')} 받는 분 화면 미리보기 ${I('chevron', 'sm')}</a></div>
<div class="card"><div class="card-h">${ibox('send', '', true)}<h3>${word} 발송</h3></div>
<p class="small muted">연락처 앱에서 받는 분을 선택해 발송합니다. 발송 이력은 정산·민원 처리 시 참고 자료로 보관됩니다.</p>
<div class="send-btns"><button class="btn block" data-act="send-sms" data-id="${e.id}" ${ok ? '' : 'disabled'}>${I('message')}문자로 보내기</button>
<button class="btn block kakao" data-act="send-kakao" data-id="${e.id}" ${ok ? '' : 'disabled'}>${I('message')}카카오톡으로 보내기</button>
<button class="btn block ghost" data-act="copy-link" data-id="${e.id}" ${ok ? '' : 'disabled'}>${I('copy')}링크 복사</button></div>
<div class="kv mt"><dt>공유 주소</dt><dd class="small" style="word-break:break-all">${ok ? `<a href="#/i/${e.code}">${esc(shareUrl(e))}</a>` : '식장 확인 후 생성'}</dd><dt>발송 횟수</dt><dd>${e.sent || 0}회</dd></div></div></div>`);
});
route(/^\/m\/(\w+)$/, ([c]) => {
  const e = evByCode(c); if (!e) return go('#/');
  const sender = user(e.host);
  return `<div class="phone-page"><div class="msg-top"><a href="javascript:history.back()">${I('chevron-l')}</a><div class="msg-av">${esc(sender.name[0])}</div><div><b>${esc(sender.name)}</b><span>${fmtPhone(sender.phone)}</span></div></div>
<div class="msg-body"><div class="msg-day">오늘 ${hm(Date.now())}</div><div class="bubble in">${esc(smsText(e)).replace(/\n/g, '<br>')}<br><a href="#/i/${e.code}">${esc(shareUrl(e))}</a>
<a class="lp" href="#/i/${e.code}">${e.kind === 'funeral' ? FUNERAL_ART : SVG_ART[1]}<div><b>${esc(e.title)}</b><span>LifeTies · ${e.kind === 'funeral' ? '모바일 부고장' : '모바일 청첩장'}</span></div></a></div>
<div class="msg-note">${I('shield', 'sm')} LifeTies 안내장은 식장 확인을 마친 행사만 발송됩니다</div></div>
<div class="msg-in"><span>문자 메시지</span>${I('send', 'sm')}</div></div>`;
});

/* ── 청첩장·부고장 안내 ──────────────────────────────────── */
route(/^\/i\/(\w+)$/, ([c]) => {
  const e = evByCode(c);
  if (!e || !['published', 'cancelled'].includes(e.status)) return page('경조금 간편 수납', navs.public(''), `<div class="card" style="text-align:center;padding:40px">${ibox('lock')}<h2 style="margin-top:14px">공개되지 않은 행사입니다</h2><p class="muted">식장 확인이 진행 중이거나 주소가 올바르지 않습니다.</p><a class="btn ghost" href="#/">처음으로</a></div>`, true);
  const v = venue(e.venue), t = totals(e), word = GIFT_WORD[e.kind], F = e.kind === 'funeral';
  const cta = e.status === 'cancelled' ? `<div class="flash err">${I('x-circle')}<div>취소된 행사입니다. 결제하신 금액은 전액 자동 취소되었습니다.</div></div>`
    : `<div class="cta"><div><b>${word} 보내기</b><span>${t.count}명이 마음을 전했습니다</span></div><a class="btn" href="#/i/${e.code}/pay">${I('credit-card')}${word} 보내기</a></div>`;
  const trust = `<div class="badges"><span class="chip l">${I('shield')}식장 확인 완료</span><span class="chip l">${I('lock')}연락처·계좌 비공개</span><span class="chip l">${I('rotate')}정산 전 취소 가능</span></div>`;
  if (F) {
    const dz = e.deceased || {}, ms = e.mourners || [[e.role, user(e.host).name]];
    return page('경조금 간편 수납', navs.public(''), `<div class="obit"><div class="obit-c"><div class="obit-r">${I('ribbon', 'lg')}</div><div class="obit-h">訃告</div>
<p>故 <b>${esc(dz.name || '')}</b> 님께서 ${dz.died ? kdate(dz.died) : ''}<br>별세하셨기에 삼가 알려드립니다.</p>${dz.age ? `<span class="chip">향년 ${dz.age}세${dz.religion && dz.religion !== '무교' ? ' · ' + dz.religion : ''}</span>` : ''}</div>
${e.message ? `<div class="msg">${esc(e.message)}</div>` : ''}
<div class="obit-s"><h4>상주</h4><table><tbody>${ms.map(([r, n]) => `<tr><td class="muted">${esc(r)}</td><td><b>${esc(n)}</b></td></tr>`).join('')}</tbody></table></div>
<div class="obit-s"><h4>장례 일정</h4><dl class="kv"><dt>${I('building', 'sm')} 빈소</dt><dd>${esc(v.name)} ${esc(e.hall)}</dd><dt>${I('calendar', 'sm')} 발인</dt><dd>${e.balin ? kdate(e.balin) + ' ' + e.balin.slice(11) : '-'}</dd><dt>${I('map', 'sm')} 장지</dt><dd>${esc(e.burial || '-')}</dd></dl></div>
<div class="obit-s"><h4>오시는 길</h4>${mapCard(v, e.hall)}</div>${trust}</div>${cta}`, true);
  }
  const p = e.parents || {};
  return page('경조금 간편 수납', navs.public(''), `<div class="inv2">
<div class="inv2-c">${SVG_ART[0]}<div class="inv2-o"><div class="eyebrow">${e.kind === 'wedding' ? 'Wedding Invitation' : 'Invitation'}</div>
<h1>${e.groom ? `${esc(e.groom.slice(1))} <span>&amp;</span> ${esc(e.bride.slice(1))}` : esc(e.title)}</h1><p>${kdate(e.date)} ${e.time}<br>${esc(v.name)} ${esc(e.hall)}</p></div></div>
${e.message ? `<div class="msg c">${esc(e.message)}</div>` : ''}
${e.groom ? `<div class="parents"><div><span>${esc(p.gf || '')} · ${esc(p.gm || '')}</span>의 아들 <b>${esc(e.groom)}</b></div><div><span>${esc(p.bf || '')} · ${esc(p.bm || '')}</span>의 딸 <b>${esc(e.bride)}</b></div></div>` : ''}
<div class="sec"><h4>Gallery</h4><div class="gal">${SVG_ART.map(a => `<div>${a}</div>`).join('')}</div></div>
<div class="sec"><h4>Date</h4>${calendar(e.date)}<p class="c small muted">${kdate(e.date)} ${e.time}</p></div>
<div class="sec"><h4>Location</h4>${mapCard(v, e.hall)}</div>${trust}</div>${cta}`, true);
});

/* ── 축의금·조의금 보내기(단계별) ─────────────────────────── */
route(/^\/i\/(\w+)\/pay$/, ([c], P) => {
  const e = evByCode(c); if (!e || e.status !== 'published') return go('#/i/' + c);
  const hasFav = (e.favors || []).length > 0, word = GIFT_WORD[e.kind];
  const steps = ['본인 확인', '보내는 분', '금액', ...(hasFav ? ['답례품'] : []), '정보 확인'];
  let n = P.get('step') === 'pg' ? 'pg' : Math.max(1, Math.min(steps.length, +P.get('step') || 1));
  if (!S.session.pay || S.session.pay.code !== c) { S.session.pay = { code: c }; save(); }
  const d = S.session.pay, v = x => esc(d[x] ?? '');
  const sIdx = n === 'pg' ? steps.length : n - 1, name = n === 'pg' ? '' : steps[n - 1];
  const back = n === 'pg' ? qp('#/i/' + c + '/pay', { step: steps.length }) : n > 1 ? qp('#/i/' + c + '/pay', { step: n - 1 }) : '#/i/' + c;
  const head = `<div class="pay-h"><a href="${back}">${I('chevron-l')}</a><b>${word} 보내기</b><span class="xs muted">${esc(e.title)}</span></div>${stepper([...steps, '결제'], sIdx)}`;
  if (n === 'pg') {
    return `<div class="pg-wrap"><div class="pg"><div class="pg-top"><b>신용카드 결제</b><span>제휴 PG 결제창 · 모의</span><a href="${back}">${I('x')}</a></div>
<div class="pg-amt"><span>${esc(e.title)} · ${word}</span><b>${won(+d.amount)}</b><small>${+d.inst ? d.inst + '개월 할부' : '일시불'}${d.favor ? ' · 답례품 ' + FAVORS[d.favor].name : ''}</small></div>
<form data-form="pg" data-code="${c}"><div class="pg-cards">${['KB국민', '신한', '삼성', '현대', '롯데', '하나', '우리', 'BC', 'NH농협'].map((k, i) => `<label><input type="radio" name="issuer" value="${k}" ${i === 0 ? 'checked' : ''}><span>${k}</span></label>`).join('')}</div>
<label>카드번호</label><input name="card" required inputmode="numeric" placeholder="임의의 16자리 숫자" value="9410 1234 5678 9012"><div class="row2"><div><label>유효기간</label><input name="exp" required placeholder="MM/YY" value="12/29"></div><div><label>카드 비밀번호 앞 2자리</label><input type="password" maxlength="2" placeholder="●●" value="00"></div></div>
<p class="xs muted mt">결제 정보는 제휴 PG사에서 처리되며 LifeTies는 카드번호를 저장하지 않습니다. 승인 거절 테스트: 4000 0000 0000 0002</p>
<button class="btn block mt">${I('lock')}${won(+d.amount)} 결제 승인 요청</button></form></div></div>`;
  }
  let body = '';
  if (name === '본인 확인') body = `<p class="small muted">결제 한도 관리와 본인 확인을 위해 간편인증을 진행합니다.</p>
    <div class="auth">${[['naver', '네이버', '#03C75A'], ['kakao', '카카오', '#FEE500'], ['pass', 'PASS', '#E4002B']].map(([k, l, col]) => `<label><input type="radio" name="auth" value="${k}" ${(d.auth || 'kakao') === k ? 'checked' : ''}><span><i style="background:${col}"></i>${l} 인증</span></label>`).join('')}</div>
    <label>성명</label><input name="name" required value="${v('name')}" placeholder="성명"><div class="row2"><div><label>생년월일</label><input name="birth" required pattern="\\d{8}" inputmode="numeric" value="${v('birth')}" placeholder="YYYYMMDD"></div><div><label>휴대폰 번호</label><input name="phone" required inputmode="tel" value="${v('phone')}" placeholder="010-0000-0000"></div></div>`;
  if (name === '보내는 분') body = `${e.kind === 'wedding' ? `<label>어느 쪽 하객이신가요?</label>${seg('side', [['groom', `신랑측 · ${esc(e.groom || '')}`], ['bride', `신부측 · ${esc(e.bride || '')}`]], d.side || 'groom')}` : ''}
    <label>관계</label><input name="rel" value="${v('rel')}" placeholder="예: 대학 동기, 회사 동료"><label>전하실 말씀 <span class="muted" style="font-weight:400">(선택)</span></label><textarea name="msg" maxlength="300" placeholder="${e.kind === 'funeral' ? '삼가 고인의 명복을 빕니다.' : '결혼을 진심으로 축하드립니다.'}">${v('msg')}</textarea>
    <label class="toggle mt"><span><b>법인카드로 결제</b><small>경조금 지급확인서를 회계 증빙으로 발급합니다</small></span><input type="checkbox" name="corp" data-toggle="corpbox" ${d.corp ? 'checked' : ''}><i></i></label><div id="corpbox" style="display:${d.corp ? 'block' : 'none'}"><input name="corp_name" value="${v('corp_name')}" placeholder="법인명"></div>`;
  if (name === '금액') body = `<label>결제 금액</label><input class="amount-in" name="amount" type="number" min="10000" step="1000" required value="${v('amount')}" placeholder="0">
    <div class="amounts">${(e.kind === 'funeral' ? [30000, 50000, 100000, 200000] : [50000, 100000, 200000, 300000]).map(a => `<button type="button" data-amount="${a}">${man(a)}</button>`).join('')}</div>
    <div class="limits"><div><small>1회 한도</small><b>${man(set('limit_per_gift'))}</b></div><div><small>월 한도</small><b>${man(set('limit_guest_monthly'))}</b></div><div><small>할부</small><b>최대 3개월</b></div></div>
    <label>결제 방식</label>${seg('inst', [[0, '일시불'], [2, '2개월'], [3, '3개월']], d.inst || 0)}`;
  if (name === '답례품') body = `<p class="small muted">${esc(e.role)}께서 준비하신 답례품입니다. 하나를 선택하시면 행사 후 휴대폰으로 받으실 수 있습니다.</p>
    <div class="fav-list">${[...e.favors.map(k => [k, FAVORS[k]]), ['', { name: '받지 않음', price: 0, ic: 'x', tone: '#6B7287' }]].map(([k, f]) => `<label class="fav-r"><input type="radio" name="favor" value="${k}" ${(d.favor ?? e.favors[0]) === k ? 'checked' : ''}><div class="fav-i" style="color:${f.tone}">${I(f.ic, 'lg')}</div><div><b>${f.name}</b><span>${k ? '답례품 · 혼주 부담' : '답례품 없이 진행'}</span></div><i class="dot"></i></label>`).join('')}</div>`;
  if (name === '정보 확인') body = `<div class="sum"><div class="sum-a"><span>${word}</span><b>${won(+d.amount)}</b><small>${+d.inst ? d.inst + '개월 할부' : '일시불'}</small></div>
    <dl class="kv"><dt>보내는 분</dt><dd>${v('name')}${d.rel ? ' · ' + v('rel') : ''}</dd>${d.side ? `<dt>구분</dt><dd>${SIDE[d.side]}</dd>` : ''}${d.corp ? `<dt>법인</dt><dd>${v('corp_name')}</dd>` : ''}<dt>받는 분</dt><dd>${maskName(user(e.host).name)} (${esc(e.role)})</dd><dt>행사</dt><dd>${kdate(e.date)} · ${esc(venue(e.venue).name)}</dd>${hasFav ? `<dt>답례품</dt><dd>${d.favor ? FAVORS[d.favor].name : '받지 않음'}</dd>` : ''}${d.msg ? `<dt>메시지</dt><dd>${v('msg')}</dd>` : ''}</dl></div>
    <div class="policy"><div>${I('rotate')}<b>정산 전</b>즉시 취소</div><div>${I('x-circle')}<b>행사 취소 시</b>전액 자동 취소</div><div>${I('send')}<b>정산 후</b>반환 요청</div></div>
    <label class="check" style="margin-top:16px"><input type="checkbox" name="agree" required> 이용약관, 개인정보 수집·이용 및 취소·환불 정책에 동의합니다.</label>`;
  const last = n === steps.length;
  return page('경조금 간편 수납', navs.public(''), `${head}<form class="card mt" data-form="pay-step" data-code="${c}" data-step="${n}" data-last="${last ? 1 : ''}"><h2>${name}</h2>${body}${stepNav(n > 1 ? back : '#/i/' + c, last ? '신용카드로 결제' : '다음')}</form>`, true);
});

/* ── 행사 메뉴: 개요 · 내역 · 정산 · 답례품 · 발송 ─────────── */
const evHead = e => `<a class="small" href="#/host">${I('arrow-l', 'sm')} 홈</a><div class="side between mt"><div class="side">${ibox(KIND_IC[e.kind], 'dark')}<div><div class="eyebrow">${KIND[e.kind]} · ${e.code}</div><h1 class="mb0">${esc(e.title)}</h1><div class="small muted">${kdate(e.date)} ${e.time} · ${esc(venue(e.venue).name)} ${esc(e.hall)}</div></div></div><div class="side">${pill(EV_ST[e.status], EV_TONE[e.status])}${pill(SET_ST[e.settle], SET_TONE[e.settle])}</div></div>`;
const evTabs = (e, cur) => tabs([['#/host/e/' + e.id, '개요', 'home'], ['#/host/e/' + e.id + '/gifts', `${GIFT_WORD[e.kind]} 내역`, 'gifts'], ['#/host/e/' + e.id + '/settle', '정산 신청·조회', 'settle'], ['#/host/e/' + e.id + '/favors', '답례품', 'favors'], ['#/host/e/' + e.id + '/send', '발송', 'send']], cur);
const ownEv = id => { const u = host(), e = ev(id); return u && e && e.host === u.id ? e : null; };
route(/^\/host\/e\/(\d+)$/, ([id]) => {
  const e = ownEv(id); if (!e) return go('#/host');
  const t = totals(e), on = settleOn(e), gs = gifts(e).filter(g => g.status !== 'cancelled'), fav = favorCost(gs.filter(g => g.status === 'paid')), fee = Math.floor(t.gross * set('fee_rate_bp') / 10000);
  const stage = ['pending_verify', 'rejected'].includes(e.status) ? 1 : e.status === 'cancelled' ? 2 : e.settle === 'settled' ? 5 : ['requested', 'held'].includes(e.settle) ? 4 : today() >= new Date(e.date) ? 3 : 2;
  const rel = {}; gs.forEach(g => rel[g.rel || '기타'] = (rel[g.rel || '기타'] || 0) + g.amount);
  const rets = S.inquiries.filter(q => q.event_id === e.id && q.kind === 'return_request');
  return page('혼주·상주', navs.host('list'), `${evHead(e)}${evTabs(e, 'home')}
<div class="card">${stepper(['안내장 등록', '식장 확인', '행사 진행', '정산 신청', '정산 완료'], stage, e.status === 'rejected' ? 1 : e.status === 'cancelled' ? 2 : -1)}</div>
${e.status === 'pending_verify' ? `<div class="flash warn">${I('clock')}<div>제휴 식장에 예약 여부를 확인하고 있습니다. 확인이 완료되면 문자로 안내드리며 안내장이 공개됩니다.</div></div>` : ''}
${e.status === 'rejected' ? `<div class="flash err">${I('x-circle')}<div>식장 확인 결과 반려되었습니다 — ${esc(e.note)}</div></div>` : ''}
<div class="grid g4">${kpi('heart', '받은 마음', t.count + '건', t.cancelled ? `취소 ${t.cancelled}건` : '')}${kpi('wallet', '수납 총액', won(t.gross), `평균 ${won(t.avg)}`)}${kpi('receipt', '수수료·답례품', won(fee + fav), `수수료 ${(set('fee_rate_bp') / 100).toFixed(1)}%${fav ? ' · 답례품 ' + won(fav) : ''}`)}${kpi('bank', '예상 정산액', won(t.gross - fee - fav), '본인 명의 계좌')}</div>
<div class="grid g2 mt"><div class="card"><div class="card-h">${ibox('clock', '', true)}<h3>정산 일정</h3><a class="sp small" href="#/host/e/${e.id}/settle">정산 신청·조회 ${I('chevron', 'sm')}</a></div>${settleTimeline(e)}
<p class="small muted mb0">${e.settle === 'settled' ? '정산이 완료되었습니다.' : e.settle === 'held' ? '이상거래 검토로 정산이 보류되었습니다.' : e.settle === 'requested' ? '정산 대기 중입니다.' : today() < on ? `정산 신청 가능일까지 ${daysBetween(today(), on)}일 남았습니다.` : '지금 정산을 신청하실 수 있습니다.'}</p></div>
<div class="card"><div class="card-h">${ibox('qr', '', true)}<h3>식권 사용률 · 관계별 수납</h3></div><div class="side" style="gap:22px">${donut(t.pct, '사용률')}<div style="flex:1">${bars(Object.entries(rel).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => [k, v, man(v)]))}</div></div></div></div>
${rets.length ? `<div class="card"><div class="card-h">${ibox('send', 'warn', true)}<h3>반환 요청</h3></div>${rets.map(q => { const g = gift(q.gift_id); return `<div class="side" style="border-top:1px solid var(--line2);padding:12px 0"><div class="who" style="flex:1">${avatar(q.name)}<div><b>${esc(q.name)} · ${won(g.amount)}</b><span>${esc(q.body)}</span></div></div>
${q.status === 'host_pending' ? `<button class="btn sm" data-act="return-yes" data-id="${q.id}">${I('check', 'sm')}반환 동의</button><button class="btn sm ghost" data-act="return-no" data-id="${q.id}">동의하지 않음</button>` : pill(q.status === 'resolved' ? '반환 완료' : '미동의', q.status === 'resolved' ? 'ok' : '')}</div>`; }).join('')}</div>` : ''}
<div class="grid g2"><form class="card" data-form="thanks" data-id="${e.id}"><div class="card-h">${ibox('message', '', true)}<h3>감사 메시지 발송</h3></div><textarea name="body" required>보내주신 따뜻한 마음 감사히 받았습니다. 늘 건강하시고 행복하시길 바랍니다.</textarea><button class="btn ghost mt">${I('send')}미발송 하객 ${gs.filter(g => ['paid', 'settled'].includes(g.status) && !g.thanks).length}명에게 발송</button></form>
${['published', 'pending_verify'].includes(e.status) && e.settle !== 'settled' ? `<form class="card" data-form="cancel-event" data-id="${e.id}" data-actor="host"><div class="card-h">${ibox('x-circle', 'err', true)}<h3>행사 취소·연기</h3></div><p class="small muted">행사를 취소하시면 정산 전 결제가 전액 자동 취소되며, 하객에게 문자로 안내됩니다.</p><input name="reason" required placeholder="취소 사유"><button class="btn danger mt">행사 취소</button></form>` : ''}</div>`);
});
route(/^\/host\/e\/(\d+)\/gifts$/, ([id], P) => {
  const e = ownEv(id); if (!e) return go('#/host');
  const f = P.get('f') || 'all', all = gifts(e).slice().sort((a, b) => b.at - a.at), live = all.filter(g => g.status !== 'cancelled');
  const list = all.filter(g => f === 'all' || (f === 'cancelled' ? g.status === 'cancelled' : g.side === f));
  const sum = gs => gs.reduce((s, g) => s + g.amount, 0);
  const W = e.kind === 'wedding', groups = W ? [['all', '전체', live], ['groom', '신랑측', live.filter(g => g.side === 'groom')], ['bride', '신부측', live.filter(g => g.side === 'bride')], ['cancelled', '취소', all.filter(g => g.status === 'cancelled')]] : [['all', '전체', live], ['cancelled', '취소', all.filter(g => g.status === 'cancelled')]];
  return page('혼주·상주', navs.host('list'), `${evHead(e)}${evTabs(e, 'gifts')}
<div class="grid ${W ? 'g3' : 'g2'}">${groups.filter(x => x[0] !== 'cancelled').map(([k, l, gs]) => `<a class="kpi ${f === k ? 'sel' : ''}" href="${qp('#/host/e/' + e.id + '/gifts', { f: k })}" style="text-decoration:none">${ibox(k === 'all' ? 'heart' : 'user', k === 'all' ? 'dark' : '')}<div><div class="l">${l}</div><div class="v">${won(sum(gs))}</div><div class="s">${gs.length}건</div></div></a>`).join('')}</div>
<div class="card mt"><div class="side between" style="margin-bottom:12px"><div class="chips">${groups.map(([k, l, gs]) => `<a class="chipf ${f === k ? 'on' : ''}" href="${qp('#/host/e/' + e.id + '/gifts', { f: k })}">${l} <b>${gs.length}</b></a>`).join('')}</div><span class="xs muted">하객 연락처·카드 정보는 표시되지 않습니다</span></div>
<div class="tbl"><table><thead><tr><th>보내신 분</th>${W ? '<th>구분</th>' : ''}<th class="num">금액</th><th>메시지</th><th>일시</th><th>상태</th></tr></thead><tbody>
${list.map(g => `<tr><td><div class="who">${avatar(g.name)}<div><b>${esc(g.name)}</b><span>${esc(g.corp || g.rel)}</span></div></div></td>${W ? `<td>${g.side ? pill(SIDE[g.side], g.side === 'groom' ? 'blue' : 'nodot') : ''}</td>` : ''}<td class="num"><b>${won(g.amount)}</b>${g.inst ? `<div class="xs muted">${g.inst}개월</div>` : ''}</td><td class="small" style="max-width:240px">${esc(g.msg)}</td><td class="xs muted">${md(g.at)} ${hm(g.at)}</td><td>${pill(G_ST[g.status], G_TONE[g.status])}</td></tr>`).join('') || `<tr><td colspan="6" class="muted">해당 내역이 없습니다.</td></tr>`}</tbody></table></div></div>`);
});
route(/^\/host\/e\/(\d+)\/settle$/, ([id]) => {
  const e = ownEv(id); if (!e) return go('#/host');
  const t = totals(e), on = settleOn(e), st = S.settlements.find(s => s.event_id === e.id), u = host();
  const paid = gifts(e).filter(g => g.status === 'paid'), fee = Math.floor(t.gross * set('fee_rate_bp') / 10000), fav = st ? st.favor || 0 : favorCost(paid);
  const byDay = {}; gifts(e).filter(g => g.status !== 'cancelled').forEach(g => { const k = ymd(g.at); (byDay[k] ||= []).push(g); });
  return page('혼주·상주', navs.host('list'), `${evHead(e)}${evTabs(e, 'settle')}
<div class="grid g2"><div class="card"><div class="card-h">${ibox('wallet', 'dark', true)}<h3>정산 예정 금액</h3><span class="sp">${pill(SET_ST[e.settle], SET_TONE[e.settle])}</span></div>
<div class="calc"><div><span>수납 총액 (${t.count}건)</span><b>${won(st ? st.gross : t.gross)}</b></div><div><span>결제 수수료 ${(set('fee_rate_bp') / 100).toFixed(1)}%</span><b>− ${won(st ? st.fee : fee)}</b></div><div><span>답례품 비용</span><b>− ${won(fav)}</b></div><div class="tot"><span>${st ? '지급액' : '예상 지급액'}</span><b>${won(st ? st.net : t.gross - fee - fav)}</b></div></div>
<div class="side between mt"><div class="small"><b>${u.bank_name || '계좌 미등록'}</b> ${maskAcc(u.bank_account)}<div class="xs muted">본인 명의 계좌로만 지급</div></div>
${e.settle === 'none' ? `<button class="btn" data-act="settle" data-id="${e.id}" ${today() < on || e.status !== 'published' ? 'disabled' : ''}>${I('wallet')}정산 신청</button>` : ''}</div>
${e.settle === 'held' ? `<div class="flash warn mt mb0">${I('pause')}<div>정산 보류 — ${esc(e.hold)}</div></div>` : ''}${st ? `<div class="flash mt mb0">${I('check-circle')}<div>${ymd(st.at)} ${hm(st.at)} 지급 완료 · 지급번호 ${st.payout}</div></div>` : ''}</div>
<div class="card"><div class="card-h">${ibox('clock', '', true)}<h3>정산 일정</h3></div>${settleTimeline(e)}
<dl class="kv"><dt>행사일</dt><dd>${kdate(e.date)}</dd><dt>정산 가능일</dt><dd>${kdate(on)} 이후</dd><dt>정산 방식</dt><dd>제휴 PG사 정산자금 → 본인 명의 계좌</dd></dl></div></div>
<div class="card"><div class="card-h">${ibox('list', '', true)}<h3>일자별 수납 내역</h3></div><div class="tbl"><table><thead><tr><th>일자</th><th class="num">건수</th><th class="num">금액</th><th>상태</th></tr></thead><tbody>
${Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0])).map(([k, gs]) => `<tr><td>${kdate(k)}</td><td class="num">${gs.length}건</td><td class="num"><b>${won(gs.reduce((s, g) => s + g.amount, 0))}</b></td><td>${pill(e.settle === 'settled' ? '정산 완료' : e.settle === 'held' ? '보류' : '정산 대기', e.settle === 'settled' ? 'ok' : e.settle === 'held' ? 'err' : 'blue')}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">수납 내역이 없습니다.</td></tr>'}</tbody></table></div></div>`);
});
route(/^\/host\/e\/(\d+)\/favors$/, ([id]) => {
  const e = ownEv(id); if (!e) return go('#/host');
  const gs = gifts(e).filter(g => g.status !== 'cancelled'), opts = e.favors || [];
  return page('혼주·상주', navs.host('list'), `${evHead(e)}${evTabs(e, 'favors')}
${opts.length ? `<div class="grid g${Math.min(4, opts.length + 1)}">${opts.map(k => { const f = FAVORS[k], n = gs.filter(g => g.favor === k).length; return `<div class="kpi"><div class="ibox" style="color:${f.tone}">${I(f.ic)}</div><div><div class="l">${f.name}</div><div class="v">${n}건</div><div class="s">${won(f.price)} · 소계 ${won(n * f.price)}</div></div></div>`; }).join('')}
${kpi('receipt', '답례품 비용 합계', won(favorCost(gs)), '정산 시 차감', 'dark')}</div>
<div class="card mt"><div class="card-h">${ibox('gift', '', true)}<h3>답례품 선택 내역</h3><span class="sp xs muted">행사 종료 후 하객 휴대폰으로 일괄 발송(모의)</span></div><div class="tbl"><table><thead><tr><th>하객</th><th>답례품</th><th class="num">금액</th><th>발송</th></tr></thead><tbody>
${gs.filter(g => g.favor).map(g => `<tr><td><div class="who">${avatar(g.name)}<div><b>${esc(g.name)}</b><span>${esc(g.rel)}</span></div></div></td><td>${FAVORS[g.favor].name}</td><td class="num">${won(FAVORS[g.favor].price)}</td><td>${pill(today() > new Date(e.date) ? '발송 완료' : '행사 후 발송', today() > new Date(e.date) ? 'ok' : 'blue')}</td></tr>`).join('')}</tbody></table></div></div>`
    : `<div class="card" style="text-align:center;padding:40px">${ibox('gift')}<h3 class="mt">답례품을 지정하지 않은 행사입니다</h3><p class="small muted">안내장 만들기 마지막 단계에서 답례품을 지정할 수 있습니다.</p></div>`}`);
});

/* ── 폼 처리 ──────────────────────────────────────────────── */
Object.assign(forms, {
  'settings-host'(f) {
    const u = host();
    if (f.pin_now || f.pin_new) { if ((f.pin_now || '') !== (u.pin || '000000')) throw new RuleError('현재 비밀번호가 일치하지 않습니다.'); if (!/^\d{6}$/.test(f.pin_new || '')) throw new RuleError('새 비밀번호는 숫자 6자리로 입력해 주세요.'); if (f.pin_new !== f.pin_new2) throw new RuleError('새 비밀번호가 서로 일치하지 않습니다.'); u.pin = f.pin_new; audit('host:' + u.id, 'pin.changed'); }
    u.email = f.email; u.notify = { pay: !!f.n_pay, settle: !!f.n_settle, promo: !!f.n_promo }; save(); flash('설정이 저장되었습니다.'); render();
  },
  wiz(f, el) {
    const k = el.dataset.kind, n = +el.dataset.step, W = WIZ[k], d = S.session.wiz;
    el.querySelectorAll('input[type=file]').forEach(x => { if (x.files[0]) d[x.name] = x.name === 'photos' ? x.files.length + '장' : x.files[0].name; });
    Object.entries(f).forEach(([kk, vv]) => { if (!(vv instanceof File)) d[kk] = vv; });
    if (el.querySelector('[name=meal]')) d.meal = !!f.meal;
    if (el.querySelector('[name^=fav_]')) d.favors = Object.keys(FAVORS).filter(x => f['fav_' + x]);
    if (k === 'funeral' && n === 2) d.mourners = [...Array(8).keys()].map(i => [f['mr_' + i], f['mn_' + i]]).filter(([r, nm]) => r && nm);
    if (k === 'wedding' && n === 5 && !d.contract) throw new RuleError('결혼식은 식장 계약서를 첨부해 주세요.');
    save();
    if (n < W.steps.length) return go(qp('#/host/new/' + k, { step: n + 1 }));
    const u = host(), cnt = S.events.filter(e => e.host === u.id && e.created > Date.now() - 365 * DAY && e.status !== 'cancelled').length;
    if (cnt >= set('limit_host_events_per_year')) throw new RuleError(`행사 개설은 연 ${set('limit_host_events_per_year')}회로 제한됩니다.`);
    const e = { id: nextId('e'), code: code(8), host: u.id, venue: +d.venue, kind: k, hall: d.hall || '', message: d.greeting || '', meal: d.meal !== false, contract: d.contract, status: 'pending_verify', settle: 'none', hold: '', note: '', created: Date.now(), favors: d.favors || [] };
    if (k === 'wedding') Object.assign(e, { groom: d.groom, bride: d.bride, parents: { gf: d.gf, gm: d.gm, bf: d.bf, bm: d.bm }, title: `${d.groom} ♥ ${d.bride} 결혼합니다`, role: d.role, date: d.date, time: d.time });
    if (k === 'funeral') Object.assign(e, { title: `故 ${d.dname} 님 부고`, deceased: { name: d.dname, age: +d.age || null, died: d.died, religion: d.religion }, mourners: d.mourners?.length ? d.mourners : [['상주', u.name]], role: `상주(${(d.mourners?.[0]?.[0]) || '대표'})`, date: d.balin_d, time: d.balin_t, balin: d.balin_d + ' ' + d.balin_t, burial: d.burial });
    if (k === 'other') Object.assign(e, { title: d.title, role: d.role, date: d.date, time: d.time });
    S.events.push(e); audit('host:' + u.id, 'event.created', 'event:' + e.code, KIND[k]); delete S.session.wiz; save();
    flash(k === 'funeral' ? '부고장이 등록되었습니다. 장례식장 이용 확인 후 공개됩니다.' : '안내장이 등록되었습니다. 식장 예약 확인 후 공개됩니다.'); go('#/host/e/' + e.id + '/send');
  },
  'pay-step'(f, el) {
    const c = el.dataset.code, n = +el.dataset.step, d = S.session.pay;
    if (f.birth !== undefined && digits(f.birth).length !== 8) throw new RuleError('생년월일 8자리를 입력해 주세요.');
    if (f.amount !== undefined) { const a = +f.amount; if (!(a >= 10000) || a % 1000) throw new RuleError('결제 금액은 1만 원 이상, 1천 원 단위로 입력해 주세요.'); if (a > set('limit_per_gift')) { S.blocked.unshift({ event_id: evByCode(c).id, reason: `1회 결제 한도(${won(set('limit_per_gift'))})를 초과하여 결제가 제한됩니다.`, amount: a, at: Date.now() }); save(); throw new RuleError(`1회 결제 한도(${won(set('limit_per_gift'))})를 초과하여 결제가 제한됩니다.`); } }
    if (el.dataset.last && !f.agree) throw new RuleError('이용약관 및 취소·환불 정책에 동의해 주세요.');
    Object.assign(d, f); if (el.querySelector('[name=corp]')) d.corp = !!f.corp; save();
    go(qp('#/i/' + c + '/pay', { step: el.dataset.last ? 'pg' : n + 1 }));
  },
  pg(f, el) {
    const e = evByCode(el.dataset.code), d = S.session.pay;
    let dev = localStorage.getItem('lt_dev'); if (!dev) localStorage.setItem('lt_dev', dev = 'D' + code(10));
    try { const g = pay(e, { ...d, card: f.card, exp: f.exp, device: dev }); delete S.session.pay; save(); flash('결제가 완료되었습니다. 모바일 식권이 발급되었습니다.'); go('#/g/' + g.id); }
    catch (err) { if (err instanceof RuleError && /한도|본인|할부|금액/.test(err.message)) { flash(err.message, 'err'); return go(qp('#/i/' + e.code + '/pay', { step: 3 })); } throw err; }
  },
});
Object.assign(acts, {
  'send-sms'(id) { const e = ev(id); e.sent = (e.sent || 0) + 1; audit('host:' + e.host, 'invite.sent', 'event:' + e.code, '문자'); flash('문자 앱으로 연결됩니다. (모의) 발송 이력이 기록되었습니다.'); },
  'send-kakao'(id) { const e = ev(id); e.sent = (e.sent || 0) + 1; audit('host:' + e.host, 'invite.sent', 'event:' + e.code, '카카오톡'); flash('카카오톡 공유 화면으로 연결됩니다. (모의) 발송 이력이 기록되었습니다.'); },
  'copy-link'(id) { const e = ev(id); try { navigator.clipboard.writeText(shareUrl(e)); } catch (x) { } flash('공유 주소를 복사했습니다.'); },
});
document.addEventListener('click', e => { const m = e.target.closest('[data-mock]'); if (m) { e.preventDefault(); flash(m.dataset.mock, 'info'); render(); } });
document.addEventListener('change', e => { const up = e.target.closest('.drop input[type=file]'); if (up && up.files[0]) up.closest('.drop').querySelector('b').textContent = up.files[0].name; });

/* 화면 렌더링: 문자 수신 화면은 전체 화면으로 */
const _render = render;
render = function () { _render(); document.body.classList.toggle('bare', /^#\/m\//.test(location.hash)); };
load();
window.addEventListener('hashchange', render);
render();
