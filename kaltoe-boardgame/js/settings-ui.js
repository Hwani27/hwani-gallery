/* ===== 설정 · 안내 (홈·모드·게임 화면 공통) =====
   앱인토스 심사 요건(B3 확률 공개 · B4 고객문의/약관 · B1 종료 확인)을 한 곳에서 처리한다.
   - 사운드 · 진동 토글 (진동은 Haptics 하나로 Toss.haptic 과 navigator.vibrate 를 함께 끈다)
   - 행운 상자 확률 안내
   - 고객문의 · 이용약관 · 개인정보처리방침
   - 초기 화면 뒤로가기 → "게임을 종료할까요?" 확인 모달
   토스 SDK가 없는 웹/PWA 빌드에서도 그대로 동작하도록 자체 CSS와 DOM만 쓴다. */
(function () {
  'use strict';
  if (window.SettingsUI) return;

  var CONTACT = 'papalog27@gmail.com';
  var VERSION = '1.1.0';
  // 홈 화면에는 core.js 가 없을 수 있으니 빌드가 심은 APP_PLATFORM 을 먼저 본다
  var PLATFORM = window.APP_PLATFORM || window.PLATFORM || (window.Toss && window.Toss.inToss ? 'toss' : 'web');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  // 홈 화면에는 chest.js 가 없으므로 같은 표를 기본값으로 들고 있다 (core.js CHEST_TABLE 과 같은 값)
  var DEFAULT_TABLE = [
    { w: 46, rar: '일반', pts: 10 }, { w: 24, rar: '일반', pts: 20 },
    { w: 14, rar: '희귀', hint: 2, pts: 15 }, { w: 9, rar: '희귀', pts: 50 },
    { w: 5, rar: '영웅', hint: 5, pts: 60 }, { w: 2, rar: '전설', pts: 200, hint: 10 }
  ];
  var oddsRows = function () {
    var table = window.CHEST_TABLE || DEFAULT_TABLE;
    var total = table.reduce(function (a, t) { return a + t.w; }, 0) || 100;
    return table.map(function (t) {
      var prize = [t.pts ? '+' + t.pts + ' 코인' : '', t.hint ? '오늘 힌트 +' + t.hint : ''].filter(Boolean).join(' · ');
      return { rar: t.rar, pct: Math.round(t.w / total * 1000) / 10, prize: prize };
    });
  };

  /* ---------------- style (한 번만 주입) ---------------- */
  function style() {
    if ($('#suStyle')) return;
    var st = el('style'); st.id = 'suStyle';
    st.textContent = [
      '.su-layer{position:fixed;inset:0;z-index:9600;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .22s;font-family:"Pretendard Variable",Pretendard,"Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif}',
      '.su-layer.show{opacity:1;pointer-events:auto}',
      '.su-layer.mid{align-items:center;padding:20px}',
      '.su-box{width:min(460px,100%);max-height:86vh;overflow:auto;border-radius:24px 24px 0 0;background:linear-gradient(180deg,#241d14,#17120c);border:1px solid rgba(255,226,170,.16);color:#f6eedb;padding:10px 16px calc(16px + var(--sab,env(safe-area-inset-bottom,0px)));box-shadow:0 -12px 40px rgba(0,0,0,.55);transform:translateY(20px);transition:transform .22s}',
      '.su-layer.show .su-box{transform:none}',
      '.su-layer.mid .su-box{border-radius:24px;transform:scale(.96)}',
      '.su-layer.mid.show .su-box{transform:none}',
      '.su-grab{width:44px;height:4px;border-radius:99px;background:rgba(255,255,255,.22);margin:4px auto 10px}',
      '.su-h{display:flex;align-items:center;gap:8px;margin:2px 4px 12px;font-size:19px;font-weight:900}',
      '.su-sec{margin:14px 4px 8px;font-size:11.5px;letter-spacing:.12em;color:#b9ab8d;font-weight:800}',
      '.su-row{display:flex;align-items:center;gap:12px;width:100%;padding:12px;margin-bottom:8px;border-radius:15px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);color:inherit;font-family:inherit;text-align:left;cursor:pointer}',
      '.su-row .t{flex:1;min-width:0}',
      '.su-row b{display:block;font-size:14.5px;font-weight:900}',
      '.su-row small{display:block;margin-top:2px;font-size:12px;color:#b9ab8d;line-height:1.4}',
      '.su-row .ic{font-size:19px;width:26px;text-align:center;flex:0 0 26px}',
      '.su-row .go{font-size:16px;color:#b9ab8d}',
      '.su-sw{position:relative;flex:0 0 50px;width:50px;height:30px;border-radius:99px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.12);cursor:pointer;padding:0}',
      '.su-sw.on{background:linear-gradient(180deg,#ffe39a,#d6a440);border-color:transparent}',
      '.su-sw i{position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.35);transition:left .16s}',
      '.su-sw.on i{left:22px}',
      '.su-sw:disabled{opacity:.45}',
      '.su-close{display:block;width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid rgba(255,226,170,.18);background:transparent;color:inherit;font-family:inherit;font-weight:800;font-size:14px;cursor:pointer}',
      '.su-note{margin:8px 4px 0;font-size:11.5px;line-height:1.5;color:#8c8069}',
      '.su-acts{display:grid;gap:8px;margin-top:14px}',
      '.su-acts button{min-height:48px;border-radius:15px;border:1px solid rgba(255,226,170,.18);background:rgba(255,255,255,.05);color:inherit;font-family:inherit;font-weight:900;font-size:15px;cursor:pointer}',
      '.su-acts button.pri{border:0;min-height:54px;font-size:16px;background:linear-gradient(180deg,#ffe39a,#d6a440);color:#2a1d08}',
      '.su-chips{display:flex;flex-direction:column;gap:6px;margin:10px 0 4px}',
      '.su-chips span{display:flex;justify-content:space-between;gap:10px;padding:9px 11px;border-radius:11px;background:rgba(255,255,255,.05);font-size:13px;font-weight:700}',
      '.su-chips span i{font-style:normal;color:#f0cf7a;font-weight:900;white-space:nowrap}',
      '.su-body{font-size:13.5px;line-height:1.65;color:#e6dcc8;max-height:52vh;overflow:auto;padding:2px 2px 4px}',
      '.su-body h4{margin:14px 0 4px;font-size:13.5px;color:#f0cf7a}',
      '.su-body p{margin:0 0 6px}',
      '.su-body ol{margin:4px 0 8px;padding-left:18px}',
      '.su-body li{margin-bottom:4px}',
      '.su-toast{position:fixed;left:50%;bottom:calc(26px + var(--sab,env(safe-area-inset-bottom,0px)));transform:translate(-50%,10px);z-index:9700;max-width:86vw;padding:10px 16px;border-radius:14px;background:rgba(20,16,12,.95);border:1px solid rgba(255,226,170,.25);color:#f6eedb;font-size:13px;font-weight:700;opacity:0;pointer-events:none;transition:.2s;font-family:"Pretendard Variable",Pretendard,"Apple SD Gothic Neo",system-ui,sans-serif}',
      '.su-toast.show{opacity:1;transform:translate(-50%,0)}',
      '.su-gear{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:12px;z-index:21;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:19px;border:1px solid rgba(255,226,170,.22);background:rgba(20,16,12,.72);color:#f0cf7a;cursor:pointer;font-family:inherit}',
      '.hh .su-gear{position:absolute;top:0;right:0;background:rgba(255,255,255,.06)}',
      '.hh{position:relative}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------------- toast ---------------- */
  var toastT = 0;
  function toast(msg) {
    style();
    var t = $('#suToast');
    if (!t) { t = el('div', 'su-toast'); t.id = 'suToast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------------- settings state ---------------- */
  function soundOn() {
    try { if (window.SFX && SFX.isOn) return !!SFX.isOn(); var v = localStorage.getItem('sfx_on'); return v !== '0'; } catch (e) { return true; }
  }
  function setSound(on) {
    try {
      if (window.SFX && SFX.isOn) { if (SFX.isOn() !== on) SFX.toggle(); if (on && SFX.select) SFX.select(); }
      else localStorage.setItem('sfx_on', on ? '1' : '0');
    } catch (e) {}
    // 화면에 있는 사운드 버튼 라벨도 같이 맞춘다
    $$('[id$="SndBtn"],#soundToggle').forEach(function (b) { b.textContent = on ? '🔊' : '🔇'; });
  }
  var vibSupported = function () { try { return window.Haptics ? Haptics.supported() : (typeof navigator.vibrate === 'function'); } catch (e) { return false; } };
  var vibOn = function () { try { return window.Haptics ? Haptics.on() : localStorage.getItem('uix_vib') !== 'false'; } catch (e) { return true; } };
  var setVib = function (v) { try { if (window.Haptics) Haptics.set(v); else localStorage.setItem('uix_vib', JSON.stringify(!!v)); } catch (e) {} };

  /* ---------------- generic modal ---------------- */
  function modal(o) {
    style();
    var layer = $('#suModal');
    if (!layer) { layer = el('div', 'su-layer mid'); layer.id = 'suModal'; document.body.appendChild(layer); }
    var box = el('div', 'su-box');
    box.innerHTML = '<div class="su-h"><span>' + (o.icon || '⚙️') + '</span><span></span></div>' +
      '<div class="su-body"></div><div class="su-chips"></div><div class="su-acts"></div>';
    box.querySelector('.su-h span:last-child').textContent = o.title || '';
    var body = box.querySelector('.su-body');
    if (o.html) body.innerHTML = o.html; else if (o.sub) body.innerHTML = '<p>' + o.sub + '</p>'; else body.style.display = 'none';
    var chips = box.querySelector('.su-chips');
    (o.chips || []).forEach(function (c) {
      var s = el('span');
      s.innerHTML = '<b></b><i></i>';
      s.querySelector('b').textContent = c.label; s.querySelector('i').textContent = c.value;
      chips.appendChild(s);
    });
    if (!(o.chips || []).length) chips.style.display = 'none';
    var acts = box.querySelector('.su-acts');
    (o.actions || [{ label: '확인' }]).forEach(function (a, i) {
      var list = o.actions || [];
      var b = el('button', (a.pri || list.length === 1) ? 'pri' : '', a.label);
      b.type = 'button';
      b.onclick = function () { closeModal(); if (a.fn) a.fn(); };
      acts.appendChild(b);
    });
    layer.innerHTML = ''; layer.appendChild(box);
    requestAnimationFrame(function () { layer.classList.add('show'); });
    return layer;
  }
  function closeModal() { var m = $('#suModal'); if (m) m.classList.remove('show'); }
  var modalOpen = function () { var m = $('#suModal'); return !!(m && m.classList.contains('show')); };

  /* ---------------- sheet ---------------- */
  var sheet = null, sheetBuilt = false;
  function buildSheet() {
    if (sheetBuilt) return sheet;
    style();
    sheet = el('div', 'su-layer'); sheet.id = 'suSheet';
    sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });
    document.body.appendChild(sheet);
    sheetBuilt = true;
    return sheet;
  }
  function switchRow(icon, title, sub, get, set, disabled) {
    var r = el('div', 'su-row');
    r.innerHTML = '<span class="ic"></span><span class="t"><b></b><small></small></span>';
    r.querySelector('.ic').textContent = icon;
    r.querySelector('b').textContent = title; r.querySelector('small').textContent = sub;
    var sw = el('button', 'su-sw' + (get() ? ' on' : ''));
    sw.type = 'button'; sw.setAttribute('role', 'switch'); sw.setAttribute('aria-label', title);
    sw.setAttribute('aria-checked', get() ? 'true' : 'false');
    if (disabled) sw.disabled = true;
    sw.innerHTML = '<i></i>';
    sw.onclick = function () { set(!get()); sw.classList.toggle('on', !!get()); sw.setAttribute('aria-checked', get() ? 'true' : 'false'); };
    r.appendChild(sw);
    return r;
  }
  function linkRow(icon, title, sub, fn) {
    var r = el('button', 'su-row'); r.type = 'button';
    r.innerHTML = '<span class="ic"></span><span class="t"><b></b><small></small></span><span class="go">›</span>';
    r.querySelector('.ic').textContent = icon;
    r.querySelector('b').textContent = title; r.querySelector('small').textContent = sub;
    r.onclick = fn;
    return r;
  }
  function render() {
    var s = buildSheet();
    var box = el('div', 'su-box');
    box.innerHTML = '<div class="su-grab"></div><div class="su-h"><span>⚙️</span><span>설정</span></div>';
    box.appendChild(switchRow('🔊', '효과음', '착수·승리·버튼 소리', soundOn, setSound));
    box.appendChild(switchRow('📳', '진동', vibSupported() ? '착수·체크·승리 시 햅틱' : '이 기기는 진동을 지원하지 않아요', vibOn, setVib, !vibSupported()));
    if (window.I18N) box.appendChild(linkRow('🌐', '언어 · Language', langLabel(), function () { langModal(); }));
    box.appendChild(linkRow('🎁', '행운 상자 확률', '어떤 보상이 몇 %로 나오는지', function () { oddsModal(); }));
    var sec = el('div', 'su-sec', '안내 · 문의'); box.appendChild(sec);
    box.appendChild(linkRow('✉️', '고객문의', CONTACT, function () { contactModal(); }));
    box.appendChild(linkRow('📄', '이용약관', '게임 이용 조건', function () { policyModal('terms'); }));
    box.appendChild(linkRow('🔒', '개인정보처리방침', '어떤 정보를 어디에 저장하는지', function () { policyModal('privacy'); }));
    var note = el('p', 'su-note');
    note.textContent = '칼퇴 보드게임 v' + VERSION + ' · ' + (PLATFORM === 'toss' ? '앱인토스 미니앱' : '웹(PWA) 빌드') + ' · 하루에 모을 수 있는 행운 상자는 최대 5개예요.';
    box.appendChild(note);
    var c = el('button', 'su-close', '닫기'); c.type = 'button'; c.onclick = close; box.appendChild(c);
    s.innerHTML = ''; s.appendChild(box);
    requestAnimationFrame(function () { s.classList.add('show'); });
  }
  function open() { render(); }
  function close() { if (sheet) sheet.classList.remove('show'); }
  function isOpen() {
    var s = $('#suSheet'); if (s && s.classList.contains('show')) return true;
    return modalOpen();
  }

  /* ---------------- language (i18n.js) ---------------- */
  function langLabel() {
    var I = window.I18N, name = I.lang === 'en' ? 'English' : '한국어';
    return I.mode === 'auto' ? '기기 언어 따르기 · ' + name : name;
  }
  function langModal() {
    var I = window.I18N;
    var mark = function (m) { return I.mode === m ? ' ✓' : ''; };
    modal({
      icon: '🌐', title: '언어 · Language',
      actions: [
        { label: '한국어' + mark('ko'), pri: I.mode === 'ko', fn: function () { I.set('ko'); } },
        { label: 'English' + mark('en'), pri: I.mode === 'en', fn: function () { I.set('en'); } },
        { label: '기기 언어 따르기' + mark('auto'), pri: I.mode === 'auto', fn: function () { I.set('auto'); } }
      ]
    });
  }

  /* ---------------- odds ---------------- */
  function oddsModal() {
    var rows = oddsRows();
    modal({
      icon: '🎁', title: '행운 상자 확률',
      html: '<p>상자를 하나 열 때 아래 확률로 결과가 정해져요. 가중치 합이 100이라 표의 숫자가 곧 확률(%)이에요.</p>',
      chips: rows.map(function (r) { return { label: r.rar + ' · ' + r.prize, value: r.pct + '%' }; }),
      actions: [{ label: '확인' }]
    });
  }

  /* ---------------- contact / policy ---------------- */
  function contactModal() {
    modal({
      icon: '✉️', title: '고객문의',
      html: '<p>게임을 하다가 생긴 문제, 오류 제보, 건의는 아래 메일로 보내 주세요. 보통 2영업일 안에 답장드려요.</p>' +
        '<p><b>' + CONTACT + '</b></p><p>메일 앱이 열리지 않으면 주소를 복사해 보내 주세요.</p>',
      actions: [
        { label: '메일 쓰기', pri: true, fn: function () { try { location.href = 'mailto:' + CONTACT + '?subject=' + encodeURIComponent('[칼퇴 보드게임] 문의'); } catch (e) {} } },
        { label: '주소 복사', fn: function () { copy(CONTACT); } },
        { label: '닫기' }
      ]
    });
  }
  function copy(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { toast('복사했어요'); }, function () { toast(text); }); return; }
    } catch (e) {}
    toast(text);
  }
  var POLICY = {
    terms: {
      title: '이용약관',
      html: '<p>시행일 2026년 11월 20일 · 제공자 김정환</p>' +
        '<h4>1. 서비스</h4><p>칼퇴 보드게임(이하 "게임")은 오목·장기·바둑·체스 등 보드게임을 앱인토스 미니앱과 구글플레이 앱으로 무료 제공합니다.</p>' +
        '<h4>2. 게임 재화</h4><ol><li>코인·레이팅·출석 기록은 게임 안에서만 쓰는 재화이며 현금으로 환전하거나 다른 사람에게 양도할 수 없습니다.</li><li>광고 시청 보상은 광고를 끝까지 본 경우에만 지급됩니다.</li></ol>' +
        '<h4>3. 이용자의 의무</h4><p>비정상적인 방법으로 기록을 조작하거나 다른 이용자의 이용을 방해하는 행위는 제한될 수 있습니다.</p>' +
        '<h4>4. 서비스 변경·중단</h4><p>점검, 정책 변경, 플랫폼 사정으로 서비스 내용이 바뀌거나 중단될 수 있으며, 중요한 변경은 앱 안에서 알립니다.</p>' +
        '<h4>5. 문의</h4><p>' + CONTACT + '</p>'
    },
    privacy: {
      title: '개인정보처리방침',
      html: '<p>시행일 2026년 11월 20일 · 제공자 김정환</p>' +
        '<h4>1. 수집하는 정보</h4><p>게임은 회원가입·로그인 없이 이용할 수 있으며, 이름·전화번호·이메일 같은 개인정보를 직접 수집하지 않습니다.</p>' +
        '<h4>2. 기기에 저장되는 정보</h4><p>코인·레이팅·출석·이어두기 기록·설정값은 기기 저장소에만 저장됩니다(앱인토스 빌드에서는 토스가 제공하는 앱 저장소, 구글플레이·웹 빌드에서는 브라우저 저장소). 개발자 서버로 전송하지 않습니다.</p>' +
        '<h4>3. 광고</h4><p>앱인토스 빌드의 광고는 토스 인앱광고로 제공되며, 광고 처리에 필요한 정보는 토스(비바리퍼블리카)의 정책을 따릅니다. 구글플레이·웹 빌드에는 광고가 없습니다.</p>' +
        '<h4>4. 친구 대국 링크</h4><p>친구에게 보내는 링크에는 대국 수순과 임의로 만든 초대 코드만 담기고, 이름·연락처 등 개인을 알아볼 수 있는 정보는 포함되지 않습니다.</p>' +
        '<h4>5. 보관·삭제</h4><p>저장 정보는 앱을 삭제하거나 앱 안에서 초기화하면 함께 지워집니다. 삭제 요청과 문의는 아래 메일로 받습니다.</p>' +
        '<h4>6. 문의</h4><p>' + CONTACT + '</p>'
    }
  };
  function policyModal(kind) {
    var p = POLICY[kind] || POLICY.terms;
    modal({
      icon: kind === 'privacy' ? '🔒' : '📄', title: p.title, html: p.html,
      actions: [{ label: '닫기' }]
    });
  }

  /* ---------------- exit confirmation (B1) ---------------- */
  function exitNow() {
    try { if (window.Resume && Resume.touch) Resume.touch(); } catch (e) {}
    try { if (window.Meta && Meta.save) Meta.save(); } catch (e) {}
    setTimeout(function () {
      try { if (window.PLATFORM !== 'toss' && window.close) window.close(); } catch (e) {}
      try { history.back(); } catch (e) {}
    }, 50);
  }
  function confirmExit() {
    modal({
      icon: '👋', title: '게임을 종료할까요?',
      html: '<p>지금 나가도 진행 중인 대국은 홈 화면의 <b>이어서 두기</b>로 다시 이어서 둘 수 있어요.</p>',
      actions: [
        { label: '계속 하기', pri: true },
        { label: '종료하기', fn: exitNow }
      ]
    });
  }

  /* ---------------- gear entry points ---------------- */
  function gearButton(cls) {
    var b = el('button', 'su-gear ' + (cls || ''), '⚙️');
    b.type = 'button'; b.setAttribute('aria-label', '설정'); b.title = '설정';
    b.onclick = function (e) { if (e) { e.preventDefault(); e.stopPropagation(); } open(); };
    return b;
  }
  function mount() {
    style();
    var hh = $('.hh');
    if (hh && !$('.su-gear', hh)) hh.appendChild(gearButton('su-gear-home'));
    $$('.setupmodal, #setup').forEach(function (m) {
      if (!$('.su-gear', m)) m.appendChild(gearButton('su-gear-setup'));
    });
  }
  function boot() {
    mount();
    setTimeout(mount, 700);          // 늦게 그려지는 모드 화면 대비
    // 홈 화면(합본)은 meta.js 가 없으니 여기서 뒤로가기를 잡는다 (B1)
    try {
      var t = window.Toss;
      if (t && t.onBack && !window.Meta) {
        t.onBack(function () {
          if (isOpen()) { close(); closeModal(); return true; }
          confirmExit(); return true;
        });
      }
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.SettingsUI = { open: open, close: close, isOpen: isOpen, confirmExit: confirmExit, oddsModal: oddsModal, policy: policyModal, contact: contactModal, toast: toast, mount: mount, odds: oddsRows, CONTACT: CONTACT };
})();
