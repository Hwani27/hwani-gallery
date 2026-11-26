/* ===== 부장님 몰래 딴짓하기 — viral.js =====
   ① 사원증 / 시말서 성적표 이미지 한 장 공유 (Canvas PNG)
   ② 친구 도발 링크 (?vs=닉네임&score=점수)
   ③ 오늘의 '같은 부장님' 일일 챌린지 (날짜 시드 · Mulberry32)
   ④ 웃긴 칭호 도감 (localStorage 영속화)
   game.js 는 이 모듈의 훅만 호출한다. */
var VIRAL = (function () {
  'use strict';

  var BASE = 'https://hwani27.github.io/hwani-gallery/slacking-off/';
  var K_NAME = 'slackOff.playerName.v1';
  var K_TITLE = 'slackOff.titles.v1';
  var K_DAILY = 'slackOff.daily.v1';

  /* ---------------- storage ---------------- */
  function lsGet(k) { try { return window.localStorage ? window.localStorage.getItem(k) : null; } catch (e) { return null; } }
  function lsSet(k, v) { try { if (window.localStorage) window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function jget(k, dflt) {
    var raw = lsGet(k);
    if (!raw) return dflt;
    try { var o = JSON.parse(raw); return o && typeof o === 'object' ? o : dflt; } catch (e) { return dflt; }
  }
  function jset(k, v) { return lsSet(k, JSON.stringify(v)); }

  /* ---------------- small utils ---------------- */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  function dateStr(d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function dateLabel(d) { d = d || new Date(); return dateStr(d) + ' (' + DOW[d.getDay()] + ')'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function cleanName(s, max) {
    var v = String(s == null ? '' : s).replace(/[<>&"'`\\]/g, '').replace(/\s+/g, ' ').trim();
    return v.slice(0, max || 12);
  }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }

  /* ---------------- ③ 결정적 난수 (Mulberry32) ---------------- */
  function hashStr(s) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function rngFor(seed) { return mulberry32(hashStr(String(seed))); }

  /* =====================================================================
     ③ 오늘의 챌린지 — 날짜 시드
     ===================================================================== */
  var WEEKEND_STAGE = 4; /* 토·일은 금요일(더블 체크) 스테이지를 오늘의 챌린지로 */
  var DAY_STAGE = [WEEKEND_STAGE, 0, 1, 2, 3, 4, WEEKEND_STAGE]; /* 일 월 화 수 목 금 토 */

  function stageFor(date) {
    var d = new Date((date || dateStr()) + 'T12:00:00');
    return DAY_STAGE[d.getDay()];
  }
  function targetFor(date) {
    var r = rngFor((date || dateStr()) + ':target');
    return 1200 + Math.floor(r() * 6) * 100;
  }
  function dailyBest(date) {
    var db = jget(K_DAILY, { days: {} });
    var d = db.days && db.days[date || dateStr()];
    return d && d.best ? d.best : 0;
  }
  function dailyRecord(score, date, stage) {
    date = date || dateStr();
    var db = jget(K_DAILY, { days: {} });
    if (!db.days || typeof db.days !== 'object') db.days = {};
    var cur = db.days[date] || { best: 0, plays: 0, stage: stage };
    var before = cur.best || 0;
    cur.plays = (cur.plays || 0) + 1;
    cur.stage = stage == null ? cur.stage : stage;
    if (score > before) cur.best = Math.round(score);
    cur.last = Math.round(score);
    db.days[date] = cur;
    /* 최근 14일만 남긴다 */
    var keys = Object.keys(db.days).sort();
    while (keys.length > 14) { delete db.days[keys.shift()]; }
    jset(K_DAILY, db);
    return { best: cur.best, last: cur.last, plays: cur.plays, isNew: score > before };
  }
  function dailyInfo(date) {
    date = date || dateStr();
    return {
      date: date, label: dateLabel(new Date(date + 'T12:00:00')),
      seed: hashStr(date),
      stage: stageFor(date), target: targetFor(date), best: dailyBest(date)
    };
  }

  /* =====================================================================
     ② 친구 도발 링크
     ===================================================================== */
  var STAGE_NAMES = ['월요일 · 잼부장 순찰', '화요일 · 잼부장 커피 급복귀', '수요일 · 잼대리 유혹 공작',
    '목요일 · 잼사장 뒤에서 접근', '금요일 · 부장님 + 사장님 더블 체크', '토요일 · 주말근무 (특근)'];

  function parseVS(search) {
    try {
      var q = new URLSearchParams(search == null ? window.location.search : search);
      var n = cleanName(q.get('vs') || '', 12);
      if (!n) return null;
      var s = parseInt(q.get('score'), 10);
      if (!isFinite(s) || s <= 0) s = 300;
      return { name: n, score: Math.min(99999, s) };
    } catch (e) { return null; }
  }
  var VS = parseVS();

  function dareLink(name, score) {
    return BASE + '?vs=' + encodeURIComponent(cleanName(name, 12) || '정환대리') + '&score=' + Math.max(1, Math.round(num(score, 300)));
  }
  function vsText() {
    return VS ? '🔥 ' + VS.name + ' 님의 도발 · 목표 ' + VS.score.toLocaleString('ko-KR') + '점' : '';
  }

  /* 이름 (성적표·도발 링크 공통) */
  function myName() { var n = cleanName(lsGet(K_NAME) || '', 12); return n || '김인턴'; }
  function setMyName(n) { var v = cleanName(n, 12); lsSet(K_NAME, v); return v || '김인턴'; }

  /* =====================================================================
     ④ 칭호 도감
     ===================================================================== */
  var TITLES = [
    { id: 'rookie', icon: '🥷', name: '신입 루팡', how: '처음으로 칼퇴 성공', goal: 1, of: 'clears' },
    { id: 'quick', icon: '⚡', name: '0.1초 컷 눈치왕', how: '경고가 뜨고 0.2초 안에 「일하는 척!」', goal: 1, of: 'quick' },
    { id: 'excuse', icon: '🗣️', name: '임기응변 마스터', how: '3초 변명으로 위기를 3번 넘긴다', goal: 3, of: 'excuse' },
    { id: 'apology', icon: '📄', name: '시말서 콜렉터', how: '부장님께 다섯 번 들킨다', goal: 5, of: 'caught' },
    { id: 'combo', icon: '🔥', name: '콤보 장인', how: '한 판에 콤보 30을 쌓는다', goal: 30, of: 'combo' },
    { id: 'dare', icon: '🥊', name: '도발 격파자', how: '친구의 도발 목표 점수를 넘어선다', goal: 1, of: 'dares' },
    { id: 'daily', icon: '📅', name: '일일 챌린저', how: '오늘의 챌린지를 한 번 완주한다', goal: 1, of: 'challenge' },
    { id: 'overtime', icon: '🌙', name: '야근 성수기', how: '야근을 세 번 겪는다', goal: 3, of: 'overtime' },
    { id: 'maxed', icon: '🛠️', name: '장비 수집가', how: '사무실 장비 하나를 Lv.3까지 올린다', goal: 3, of: 'maxlv' },
    { id: 'legend', icon: '🏆', name: '칼퇴의 전설', how: '월~금 5일 연속 칼퇴로 주말을 맞는다', goal: 1, of: 'ending' },
    { id: 'weekend', icon: '🌞', name: '주말 특근 생존자', how: '토요일 주말근무(특근)를 칼퇴로 끝낸다', goal: 1, of: 'weekend' }
  ];
  var T_BY_ID = {};
  for (var ti = 0; ti < TITLES.length; ti++) T_BY_ID[TITLES[ti].id] = TITLES[ti];

  function freshTitles() {
    return {
      v: 1, unlocked: {}, pin: null,
      stats: { clears: 0, caught: 0, overtime: 0, excuse: 0, combo: 0, challenge: 0, dares: 0, maxlv: 0, ending: 0, weekend: 0, bestReact: 99 }
    };
  }
  function loadTitles() {
    var o = freshTitles();
    var p = jget(K_TITLE, null);
    if (p) {
      if (p.unlocked && typeof p.unlocked === 'object') o.unlocked = p.unlocked;
      if (typeof p.pin === 'string' && T_BY_ID[p.pin]) o.pin = p.pin;
      if (p.stats && typeof p.stats === 'object') {
        for (var k in o.stats) if (k in p.stats) o.stats[k] = num(p.stats[k], o.stats[k]);
      }
    }
    return o;
  }
  var TD = loadTitles();
  function saveTitles() { jset(K_TITLE, TD); }

  var onUnlock = null, onToast = null;

  function unlock(id, silent) {
    if (!T_BY_ID[id] || TD.unlocked[id]) return null;
    TD.unlocked[id] = Date.now();
    if (!TD.pin) TD.pin = id;
    saveTitles();
    var t = T_BY_ID[id];
    if (!silent && onToast) { try { onToast('🎖️ 칭호 해금 · ' + t.icon + ' ' + t.name, 2200); } catch (e) {} }
    if (!silent && onUnlock) { try { onUnlock(t); } catch (e) {} }
    return t;
  }
  function val(of) {
    if (of === 'quick') return TD.stats.bestReact <= 0.2 ? 1 : 0;
    return num(TD.stats[of], 0);
  }
  function checkAll() {
    var out = [];
    for (var i = 0; i < TITLES.length; i++) {
      var t = TITLES[i];
      if (TD.unlocked[t.id]) continue;
      var v = val(t.of);
      if (t.of === 'quick' ? v >= 1 : v >= t.goal) { var r = unlock(t.id); if (r) out.push(r); }
    }
    return out;
  }
  /* game.js 이벤트 훅 */
  function note(ev, v) {
    var s = TD.stats, changed = false;
    if (ev === 'clear') { s.clears += 1; changed = true; }
    else if (ev === 'caught') { s.caught += 1; changed = true; }
    else if (ev === 'overtime') { s.overtime += 1; changed = true; }
    else if (ev === 'excuse') { s.excuse += 1; changed = true; }
    else if (ev === 'combo') { if (num(v, 0) > s.combo) { s.combo = Math.round(v); changed = true; } }
    else if (ev === 'challenge') { s.challenge = Math.max(1, s.challenge); changed = true; }
    else if (ev === 'ending') { s.ending = 1; changed = true; }
    else if (ev === 'weekend') { s.weekend = 1; changed = true; }
    else if (ev === 'dare') { s.dares += 1; changed = true; }
    else if (ev === 'maxlv') { s.maxlv = Math.max(s.maxlv, num(v, 0)); changed = true; }
    else if (ev === 'react') {
      var r = num(v, 9);
      if (r < s.bestReact) { s.bestReact = +r.toFixed(3); changed = true; }
    }
    if (!changed) return [];
    saveTitles();
    return checkAll();
  }
  function bestTitle() {
    if (TD.pin && TD.unlocked[TD.pin]) return T_BY_ID[TD.pin];
    var ids = Object.keys(TD.unlocked);
    if (!ids.length) return null;
    ids.sort(function (a, b) { return TD.unlocked[a] - TD.unlocked[b]; });
    return T_BY_ID[ids[ids.length - 1]] || null;
  }
  function titleCount() { return Object.keys(TD.unlocked).length; }
  function pinTitle(id) {
    if (!TD.unlocked[id]) return false;
    TD.pin = id; saveTitles(); return true;
  }

  /* =====================================================================
     모달 셸
     ===================================================================== */
  var root = null, kind = null, closer = null;

  function modalHost() {
    if (root && root.parentNode) return root;
    root = document.createElement('div');
    root.className = 'vmodal';
    root.id = 'vmodal';
    root.hidden = true;
    root.addEventListener('click', function (e) {
      if (e.target === root) closeModal();
    });
    (document.getElementById('app') || document.body).appendChild(root);
    return root;
  }
  function openModal(html, k) {
    var h = modalHost();
    /* 모달 뒤에 남은 해금/격파 배지가 비쳐 보이지 않게 정리 */
    var olds = document.querySelectorAll('.title-unlock, .vs-win');
    for (var oi = 0; oi < olds.length; oi++) olds[oi].remove();
    kind = k || null;
    h.innerHTML = html;
    h.hidden = false;
    void h.offsetWidth;
    h.classList.add('on');
    var x = h.querySelector('.vm-x');
    if (x) x.addEventListener('click', function (e) { e.preventDefault(); closeModal(); });
    return h;
  }
  function closeModal() {
    if (!root) return;
    root.classList.remove('on');
    root.hidden = true;
    root.innerHTML = '';
    if (closer) { var c = closer; closer = null; c(); }
  }
  function isOpen() { return !!root && !root.hidden; }
  function msg(host, text, ok) {
    var m = host && host.querySelector('.vm-msg');
    if (!m) return;
    m.textContent = text;
    m.className = 'vm-msg on' + (ok === false ? ' bad' : '');
    clearTimeout(msg._t);
    msg._t = setTimeout(function () { m.className = 'vm-msg'; }, 2400);
  }

  /* ---------------- 클립보드 ---------------- */
  function legacyCopy(t) {
    try {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, t.length);
      var ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }
  function copyText(t) {
    return new Promise(function (res) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { res(true); }, function () { res(legacyCopy(t)); });
      } else res(legacyCopy(t));
    });
  }

  /* ---------------- 저장 / 공유 ---------------- */
  function download(dataUrl, filename) {
    try {
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { a.remove(); }, 120);
      return true;
    } catch (e) { return false; }
  }
  function shareImage(dataUrl, filename, text) {
    if (!navigator.share || typeof File !== 'function') return Promise.resolve('unsupported');
    return fetch(dataUrl).then(function (r) { return r.blob(); }).then(function (blob) {
      var f = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare && !navigator.canShare({ files: [f] })) return 'unsupported';
      return navigator.share({ files: [f], title: '잼타워 성적표', text: text || '' }).then(
        function () { return 'shared'; },
        function (e) { return e && e.name === 'AbortError' ? 'aborted' : 'failed'; }
      );
    }).catch(function () { return 'failed'; });
  }

  /* =====================================================================
     ① 성적표 PNG 카드
     ===================================================================== */
  var CW = 1080, CH = 1350;
  var FONT = '"Noto Sans CJK KR","Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif';

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function spaced(ctx, text, x, y, sp, align) {
    var chars = String(text).split('');
    var total = 0, i;
    for (i = 0; i < chars.length; i++) total += ctx.measureText(chars[i]).width + sp;
    total -= sp;
    var cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    var prev = ctx.textAlign;
    ctx.textAlign = 'left';
    for (i = 0; i < chars.length; i++) {
      ctx.fillText(chars[i], cx, y);
      cx += ctx.measureText(chars[i]).width + sp;
    }
    ctx.textAlign = prev;
    return total;
  }
  function clip(ctx, text, maxW) {
    var t = String(text == null ? '' : text);
    if (ctx.measureText(t).width <= maxW) return t;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t + '…';
  }
  function wrap(ctx, text, maxW, maxLines) {
    var words = String(text).split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var t = cur ? cur + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = words[i]; }
      else cur = t;
    }
    if (cur) lines.push(cur);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = clip(ctx, lines[maxLines - 1] + '…', maxW);
    }
    return lines;
  }
  /* 픽셀 사원증 사진 */
  function drawAvatar(ctx, x, y, w, h, mood) {
    ctx.save();
    rr(ctx, x, y, w, h, 14); ctx.clip();
    var bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, mood === 'sad' ? '#2b2530' : '#22354f');
    bg.addColorStop(1, mood === 'sad' ? '#171319' : '#14202f');
    ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
    /* 배경 격자 */
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 2;
    for (var gx = 0; gx < w; gx += 24) { ctx.beginPath(); ctx.moveTo(x + gx, y); ctx.lineTo(x + gx, y + h); ctx.stroke(); }
    var px = x + w * 0.5, base = y + h * 0.94;
    var u = w / 12; /* 픽셀 단위 */
    var ink = '#101418';
    /* 어깨(정장) */
    ctx.fillStyle = mood === 'sad' ? '#3a3340' : '#2b3f5c';
    ctx.fillRect(px - u * 3.4, base - u * 4.2, u * 6.8, u * 4.2);
    /* 셔츠 */
    ctx.fillStyle = '#e8eef7';
    ctx.fillRect(px - u * 1.1, base - u * 4.2, u * 2.2, u * 3.0);
    /* 넥타이 */
    ctx.fillStyle = mood === 'sad' ? '#8c4a4a' : '#c9452f';
    ctx.beginPath();
    ctx.moveTo(px - u * 0.55, base - u * 4.1);
    ctx.lineTo(px + u * 0.55, base - u * 4.1);
    ctx.lineTo(px + u * 0.32, base - u * 1.3);
    ctx.lineTo(px - u * 0.32, base - u * 1.3);
    ctx.closePath(); ctx.fill();
    /* 목 */
    ctx.fillStyle = '#e7bd94';
    ctx.fillRect(px - u * 0.75, base - u * 5.0, u * 1.5, u * 1.1);
    /* 얼굴 */
    ctx.fillStyle = '#f2cda6';
    ctx.fillRect(px - u * 2.4, base - u * 8.4, u * 4.8, u * 3.7);
    /* 머리 */
    ctx.fillStyle = '#1d1f25';
    ctx.fillRect(px - u * 2.6, base - u * 9.1, u * 5.2, u * 1.3);
    ctx.fillRect(px - u * 2.6, base - u * 8.4, u * 0.55, u * 1.1);
    ctx.fillRect(px + u * 2.05, base - u * 8.4, u * 0.55, u * 1.1);
    /* 눈 / 안경 */
    if (mood === 'sad') {
      ctx.fillStyle = ink;
      ctx.fillRect(px - u * 1.5, base - u * 6.9, u * 0.9, u * 0.35);
      ctx.fillRect(px + u * 0.6, base - u * 6.9, u * 0.9, u * 0.35);
      ctx.strokeStyle = '#6d7c92'; ctx.lineWidth = u * 0.22;
      ctx.beginPath(); ctx.moveTo(px - u * 1.6, base - u * 7.1); ctx.lineTo(px + u * 1.6, base - u * 7.1); ctx.stroke();
    } else {
      ctx.fillStyle = ink;
      ctx.fillRect(px - u * 1.7, base - u * 7.1, u * 1.15, u * 1.0);
      ctx.fillRect(px + u * 0.55, base - u * 7.1, u * 1.15, u * 1.0);
      ctx.strokeStyle = '#0f1720'; ctx.lineWidth = u * 0.18;
      ctx.beginPath(); ctx.moveTo(px - u * 0.5, base - u * 6.6); ctx.lineTo(px + u * 0.5, base - u * 6.6); ctx.stroke();
    }
    /* 입 */
    ctx.fillStyle = '#8d4a3d';
    if (mood === 'sad') ctx.fillRect(px - u * 0.5, base - u * 5.7, u * 1.0, u * 0.25);
    else ctx.fillRect(px - u * 0.7, base - u * 5.9, u * 1.4, u * 0.3);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 3;
    rr(ctx, x, y, w, h, 14); ctx.stroke();
  }

  function drawCert(ctx, info) {
    var W = CW, H = CH;
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#0a0f18'); g.addColorStop(.55, '#111a28'); g.addColorStop(1, '#0a0f18');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* 격자 */
    ctx.strokeStyle = 'rgba(255,255,255,.028)'; ctx.lineWidth = 1;
    for (var x = 0; x < W; x += 54) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = 0; y < H; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    /* 골드 글로우 */
    var rg = ctx.createRadialGradient(W * .5, 120, 40, W * .5, 120, 780);
    rg.addColorStop(0, 'rgba(255,210,74,.16)'); rg.addColorStop(1, 'rgba(255,210,74,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, 900);
    /* 테두리 */
    ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 6;
    rr(ctx, 44, 44, W - 88, H - 88, 36); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,210,74,.3)'; ctx.lineWidth = 2;
    rr(ctx, 62, 62, W - 124, H - 124, 26); ctx.stroke();

    ctx.textBaseline = 'alphabetic';
    /* 상단 메타 */
    ctx.fillStyle = 'rgba(255,224,138,.85)';
    ctx.font = '800 24px ' + FONT;
    spaced(ctx, 'JAM TOWER · 잼타워 3층', W / 2, 132, 5, 'center');
    ctx.fillStyle = '#7f90a8'; ctx.font = '700 24px ' + FONT;
    ctx.textAlign = 'left'; ctx.fillText(info.date, 92, 196);
    ctx.textAlign = 'right'; ctx.fillText('NO. ' + (info.serial || '001'), W - 92, 196);
    ctx.textAlign = 'left';

    /* 제목 */
    var tg = ctx.createLinearGradient(0, 250, 0, 380);
    tg.addColorStop(0, '#fff8d9'); tg.addColorStop(.5, '#ffd24a'); tg.addColorStop(1, '#ff9b3d');
    ctx.fillStyle = tg; ctx.font = '900 104px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('칼퇴 인증서', W / 2, 352);
    ctx.fillStyle = '#8b97a9'; ctx.font = '800 22px ' + FONT;
    spaced(ctx, 'CERTIFICATE OF EARLY LEAVE', W / 2, 396, 6, 'center');

    /* 사원증 패널 */
    ctx.fillStyle = 'rgba(20,28,42,.92)'; ctx.strokeStyle = 'rgba(255,210,74,.32)'; ctx.lineWidth = 3;
    rr(ctx, 84, 440, W - 168, 442, 26); ctx.fill(); ctx.stroke();
    drawAvatar(ctx, 116, 470, 216, 286, info.kind === 'clear' ? 'ok' : 'sad');
    ctx.fillStyle = '#7f90a8'; ctx.font = '700 20px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('증명사진', 224, 790);
    ctx.textAlign = 'left';

    var fx = 372, fw = W - fx - 108;
    var rows = [
      ['성명', info.name],
      ['직급', info.rank],
      ['클리어', info.day + ' · ' + info.status],
      ['대표 칭호', info.title]
    ];
    for (var i = 0; i < rows.length; i++) {
      var ry = 496 + i * 96;
      ctx.fillStyle = '#7f90a8'; ctx.font = '800 20px ' + FONT;
      ctx.fillText(rows[i][0], fx, ry);
      ctx.fillStyle = i === 3 ? '#ffd24a' : '#eef3fa';
      ctx.font = (i === 3 ? '900 34px ' : '900 40px ') + FONT;
      ctx.fillText(clip(ctx, rows[i][1], fw), fx, ry + 46);
      if (i < rows.length - 1) {
        ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(fx, ry + 70); ctx.lineTo(W - 108, ry + 70); ctx.stroke();
      }
    }

    /* 점수 밴드 */
    ctx.fillStyle = 'rgba(255,210,74,.08)'; ctx.strokeStyle = 'rgba(255,210,74,.35)'; ctx.lineWidth = 3;
    rr(ctx, 84, 912, W - 168, 196, 24); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd24a'; ctx.font = '900 96px ' + FONT; ctx.textAlign = 'left';
    ctx.fillText(String(info.score.toLocaleString('ko-KR')), 124, 1056);
    var sw = ctx.measureText(String(info.score.toLocaleString('ko-KR'))).width;
    ctx.fillStyle = '#c8d4e6'; ctx.font = '900 34px ' + FONT;
    ctx.fillText('점', 124 + sw + 12, 1052);
    ctx.fillStyle = '#8b97a9'; ctx.font = '800 22px ' + FONT;
    ctx.fillText('오늘의 딴짓 점수', 126, 952);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#6fe0a0'; ctx.font = '900 30px ' + FONT;
    ctx.fillText('18:00 정시 퇴근', W - 124, 966);
    ctx.fillStyle = '#9fb0c6'; ctx.font = '700 22px ' + FONT;
    ctx.fillText('딴짓 게이지 ' + info.gauge + '% · 콤보 ' + info.combo, W - 124, 1022);
    if (info.vs) {
      ctx.fillStyle = info.vs.win ? '#ffd24a' : '#ff9aa1';
      ctx.font = '900 26px ' + FONT;
      ctx.fillText(info.vs.win ? '🥊 도발 격파 +' + info.vs.margin : '🥊 도발 목표 ' + info.vs.target + '점', W - 124, 1070);
    }
    ctx.textAlign = 'left';

    /* 도장 */
    ctx.save();
    ctx.translate(W - 196, 852); ctx.rotate(-0.2);
    ctx.strokeStyle = 'rgba(255,92,102,.9)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(0, 0, 74, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 62, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,92,102,.95)'; ctx.font = '900 40px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('칼퇴', 0, 14);
    ctx.restore();
    ctx.textAlign = 'left';

    /* 푸터 */
    ctx.fillStyle = '#eef3fa'; ctx.font = '900 34px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('부장님 몰래 딴짓하기', W / 2, 1176);
    ctx.fillStyle = '#7f90a8'; ctx.font = '700 24px ' + FONT;
    ctx.fillText('hwani27.github.io/hwani-gallery/slacking-off/', W / 2, 1222);
    ctx.fillStyle = '#5f6d82'; ctx.font = '700 20px ' + FONT;
    ctx.fillText('월~토 6일 생존기 · 18:00 칼퇴 · 지금 도전해 보세요', W / 2, 1260);
    ctx.textAlign = 'left';
  }

  function drawApology(ctx, info) {
    var W = CW, H = CH;
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#f5eedd'); g.addColorStop(1, '#e9dfc9');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* 종이 결 */
    ctx.strokeStyle = 'rgba(120,100,70,.08)'; ctx.lineWidth = 1;
    for (var y = 0; y < H; y += 8) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(150,120,80,.3)'; ctx.lineWidth = 4;
    ctx.strokeRect(46, 46, W - 92, H - 92);
    ctx.strokeStyle = 'rgba(150,120,80,.18)'; ctx.lineWidth = 2;
    ctx.strokeRect(62, 62, W - 124, H - 124);

    var ink = '#241f18', sub = '#6b5c47', red = '#c8322a';
    ctx.textAlign = 'center';
    ctx.fillStyle = ink; ctx.font = '900 96px ' + FONT;
    ctx.fillText('시 말 서', W / 2, 208);
    ctx.fillStyle = sub; ctx.font = '800 22px ' + FONT;
    spaced(ctx, 'JAM TOWER · 잼타워 인사팀', W / 2, 254, 5, 'center');
    ctx.textAlign = 'left';

    /* 결재란 */
    var bx = W - 250, by = 120;
    ctx.strokeStyle = 'rgba(60,48,32,.6)'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, 150, 150);
    ctx.beginPath(); ctx.moveTo(bx, by + 44); ctx.lineTo(bx + 150, by + 44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 50, by + 44); ctx.lineTo(bx + 50, by + 150); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 100, by + 44); ctx.lineTo(bx + 100, by + 150); ctx.stroke();
    ctx.fillStyle = sub; ctx.font = '700 18px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('결 재', bx + 75, by + 30);
    ctx.font = '700 15px ' + FONT;
    ctx.fillText('부장', bx + 25, by + 68); ctx.fillText('차장', bx + 75, by + 68); ctx.fillText('과장', bx + 125, by + 68);
    ctx.textAlign = 'left';

    /* 표 */
    var tx = 92, tw = W - 184, ty = 300, rh = 76;
    ctx.strokeStyle = 'rgba(60,48,32,.55)'; ctx.lineWidth = 2;
    var rows = [['소 속', '영업기획팀'], ['직 급', info.rank], ['성 명', info.name], ['칭 호', info.title]];
    for (var i = 0; i < rows.length; i++) {
      var ry = ty + i * rh;
      ctx.strokeRect(tx, ry, tw, rh);
      ctx.beginPath(); ctx.moveTo(tx + 190, ry); ctx.lineTo(tx + 190, ry + rh); ctx.stroke();
      ctx.fillStyle = sub; ctx.font = '800 24px ' + FONT; ctx.textAlign = 'center';
      ctx.fillText(rows[i][0], tx + 95, ry + 50);
      ctx.fillStyle = i === 3 ? '#8a6a1f' : ink; ctx.font = (i === 3 ? '800 28px ' : '900 30px ') + FONT; ctx.textAlign = 'left';
      ctx.fillText(clip(ctx, rows[i][1], tw - 230), tx + 216, ry + 51);
    }
    /* 사유 (넓은 칸) */
    var ry2 = ty + rows.length * rh, rh2 = 234;
    ctx.strokeRect(tx, ry2, tw, rh2);
    ctx.beginPath(); ctx.moveTo(tx + 190, ry2); ctx.lineTo(tx + 190, ry2 + 62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ry2 + 62); ctx.lineTo(tx + tw, ry2 + 62); ctx.stroke();
    ctx.fillStyle = sub; ctx.font = '800 24px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('사 유', tx + 95, ry2 + 42);
    ctx.textAlign = 'left';
    ctx.fillStyle = ink; ctx.font = '800 27px ' + FONT;
    var reason = info.kind === 'timeout'
      ? '업무 시간 중 딴짓 게이지 ' + info.gauge + '%를 채우지 못하고 18:00를 넘겨 야근하였습니다.'
      : '업무 시간 중 딴짓 게이지 ' + info.gauge + '% 상태에서 모니터를 부장님께 그대로 노출하였습니다.';
    var lines = wrap(ctx, reason, tw - 40, 3);
    for (var li = 0; li < lines.length; li++) ctx.fillText(lines[li], tx + 22, ry2 + 112 + li * 46);

    /* 점수 줄 */
    var ry3 = ry2 + rh2, rh3 = 92;
    ctx.strokeRect(tx, ry3, tw, rh3);
    ctx.beginPath(); ctx.moveTo(tx + 190, ry3); ctx.lineTo(tx + 190, ry3 + rh3); ctx.stroke();
    ctx.fillStyle = sub; ctx.font = '800 24px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('점 수', tx + 95, ry3 + 58);
    ctx.textAlign = 'left';
    ctx.fillStyle = red; ctx.font = '900 40px ' + FONT;
    ctx.fillText(info.score.toLocaleString('ko-KR') + '점', tx + 216, ry3 + 62);
    ctx.fillStyle = sub; ctx.font = '700 23px ' + FONT;
    ctx.textAlign = 'right';
    ctx.fillText(info.day + ' · ' + info.status, tx + tw - 26, ry3 + 60);
    ctx.textAlign = 'left';

    /* 서명 */
    ctx.fillStyle = ink; ctx.font = '800 28px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('위와 같이 사실대로 보고합니다.', W / 2, 1050);
    ctx.fillStyle = sub; ctx.font = '700 24px ' + FONT;
    ctx.fillText(info.date, W / 2, 1104);
    ctx.textAlign = 'left';
    ctx.fillStyle = ink; ctx.font = '900 27px ' + FONT;
    ctx.textAlign = 'right';
    ctx.fillText('작성자  ' + info.name + '  (인)', W - 120, 1164);
    ctx.textAlign = 'left';

    /* 도장 */
    ctx.save();
    ctx.translate(W - 150, 1016); ctx.rotate(-0.18);
    ctx.strokeStyle = 'rgba(200,50,42,.85)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(200,50,42,.9)'; ctx.font = '900 34px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText(info.kind === 'timeout' ? '야근' : '발각', 0, 12);
    ctx.restore();
    ctx.textAlign = 'left';

    /* 푸터 */
    ctx.fillStyle = '#7b6a52'; ctx.font = '700 22px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('부장님 몰래 딴짓하기 · hwani27.github.io/hwani-gallery/slacking-off/', W / 2, 1252);
    ctx.textAlign = 'left';
  }

  function renderCard(info) {
    var c = document.createElement('canvas');
    c.width = CW; c.height = CH;
    var ctx = c.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'alphabetic';
    if (info.kind === 'clear') drawCert(ctx, info); else drawApology(ctx, info);
    try { return c.toDataURL('image/png'); } catch (e) { return ''; }
  }

  var lastCard = '';
  function cardFileName(info) {
    return '잼타워_' + (info.kind === 'clear' ? '칼퇴인증서' : '시말서') + '_' + (info.date || dateStr()).replace(/[^0-9]/g, '') + '.png';
  }

  function openCard(info) {
    info = info || {};
    info.name = info.name || myName();
    info.rank = info.rank || '인턴';
    info.title = info.title || '아직 없음';
    info.score = Math.round(num(info.score, 0));
    info.gauge = Math.round(num(info.gauge, 0));
    info.combo = Math.round(num(info.combo, 0));
    info.day = info.day || '월요일';
    info.status = info.status || '칼퇴 성공';
    info.date = info.date || dateLabel();
    if (info.kind !== 'clear') info.kind = info.kind === 'timeout' ? 'timeout' : 'caught';
    lastCard = renderCard(info);
    var host = openModal(
      '<div class="vm-sheet vm-card">' +
        '<div class="vm-head"><b>📸 ' + (info.kind === 'clear' ? '칼퇴 인증서' : '시말서') + '</b>' +
          '<button class="vm-x" type="button" aria-label="닫기">✕</button></div>' +
        '<div class="vm-shot"><img alt="성적표 이미지" src="' + lastCard + '"></div>' +
        '<label class="vm-field"><span>내 이름</span><input id="vmName" type="text" maxlength="12" value="' + esc(myName()) + '" autocomplete="off"></label>' +
        '<div class="vm-btns">' +
          '<button class="vm-btn" id="vmSave" type="button">💾 이미지 저장</button>' +
          '<button class="vm-btn" id="vmShare" type="button">📤 공유</button>' +
        '</div>' +
        '<button class="vm-btn wide" id="vmDare" type="button">🥊 이 점수로 도발 링크 복사</button>' +
        '<p class="vm-msg"></p>' +
      '</div>', 'card');

    host.querySelector('#vmName').addEventListener('input', function () {
      var n = setMyName(this.value);
      info.name = n;
      lastCard = renderCard(info);
      var img = host.querySelector('.vm-shot img');
      if (img) img.src = lastCard;
    });
    host.querySelector('#vmSave').addEventListener('click', function () {
      var ok = download(lastCard, cardFileName(info));
      msg(host, ok ? '이미지를 저장했어요 · ' + cardFileName(info) : '이 브라우저에서는 저장이 막혔어요. 이미지를 길게 눌러 저장하세요.', ok);
    });
    host.querySelector('#vmShare').addEventListener('click', function () {
      shareImage(lastCard, cardFileName(info), info.name + '님의 ' + (info.kind === 'clear' ? '칼퇴 인증서' : '시말서') + ' · 부장님 몰래 딴짓하기').then(function (r) {
        if (r === 'shared') msg(host, '공유 창을 열었어요', true);
        else if (r === 'aborted') msg(host, '공유를 취소했어요', false);
        else {
          download(lastCard, cardFileName(info));
          msg(host, '이 브라우저는 이미지 공유를 지원하지 않아 저장했어요. 사진첩에서 공유해 주세요.', true);
        }
      });
    });
    host.querySelector('#vmDare').addEventListener('click', function () {
      var link = dareLink(myName(), info.score);
      copyText(link).then(function (ok) {
        msg(host, ok ? '도발 링크를 복사했어요 · ' + link : '복사가 막혔어요 · ' + link, ok);
      });
    });
    return lastCard;
  }

  /* =====================================================================
     칭호 도감 모달
     ===================================================================== */
  function titleRows() {
    var out = '';
    for (var i = 0; i < TITLES.length; i++) {
      var t = TITLES[i], got = !!TD.unlocked[t.id];
      var v = val(t.of);
      var prog = t.of === 'quick' ? (TD.stats.bestReact <= 2 ? TD.stats.bestReact.toFixed(2) + '초' : '—')
        : Math.min(v, t.goal) + '/' + t.goal;
      out += '<button class="tt-row' + (got ? ' on' : '') + (TD.pin === t.id ? ' pin' : '') + '" type="button"' +
        (got ? ' data-pin="' + t.id + '"' : ' disabled aria-disabled="true"') + '>' +
        '<span class="tt-ic">' + (got ? t.icon : '🔒') + '</span>' +
        '<span class="tt-tx"><b>' + (got ? t.name : '???') + '</b><small>' + t.how + '</small></span>' +
        '<span class="tt-st">' + (TD.pin === t.id ? '대표' : got ? '해금' : prog) + '</span>' +
        '</button>';
    }
    return out;
  }
  function openTitles() {
    var host = openModal(
      '<div class="vm-sheet vm-titles">' +
        '<div class="vm-head"><b>🎖️ 칭호 도감</b><span class="vm-count">' + titleCount() + ' / ' + TITLES.length + '</span>' +
          '<button class="vm-x" type="button" aria-label="닫기">✕</button></div>' +
        '<p class="vm-note">조건을 달성하면 자동으로 해금되고, 누르면 <b>대표 칭호</b>로 성적표에 찍혀요.</p>' +
        '<div class="tt-list">' + titleRows() + '</div>' +
        '<p class="vm-msg"></p>' +
      '</div>', 'titles');
    host.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-pin]');
      if (!b) return;
      var id = b.getAttribute('data-pin');
      if (pinTitle(id)) {
        var list = host.querySelector('.tt-list');
        if (list) list.innerHTML = titleRows();
        var c = host.querySelector('.vm-count');
        if (c) c.textContent = titleCount() + ' / ' + TITLES.length;
        msg(host, '대표 칭호 · ' + T_BY_ID[id].icon + ' ' + T_BY_ID[id].name, true);
      }
    });
    return host;
  }

  /* =====================================================================
     도발 링크 모달
     ===================================================================== */
  function openDare(defaultScore) {
    var score = Math.max(1, Math.round(num(defaultScore, 300)));
    var host = openModal(
      '<div class="vm-sheet vm-dare">' +
        '<div class="vm-head"><b>🥊 친구 도발 링크</b><button class="vm-x" type="button" aria-label="닫기">✕</button></div>' +
        '<p class="vm-note">링크를 받은 친구는 <b>도발 배너</b>와 함께 같은 판을 뜁니다. 목표 점수를 넘기면 도발 격파!</p>' +
        '<label class="vm-field"><span>내 이름 / 직급</span><input id="dvName" type="text" maxlength="12" value="' + esc(myName()) + '" autocomplete="off"></label>' +
        '<label class="vm-field"><span>목표 점수</span><input id="dvScore" type="number" inputmode="numeric" min="1" max="99999" value="' + score + '"></label>' +
        '<div class="dv-preview" id="dvPreview"></div>' +
        '<button class="vm-btn wide" id="dvCopy" type="button">🔗 도발 링크 복사</button>' +
        '<p class="vm-msg"></p>' +
      '</div>', 'dare');
    var nEl = host.querySelector('#dvName'), sEl = host.querySelector('#dvScore'), pv = host.querySelector('#dvPreview');
    function sync() {
      setMyName(nEl.value);
      pv.textContent = dareLink(nEl.value, sEl.value);
    }
    nEl.addEventListener('input', sync);
    sEl.addEventListener('input', sync);
    sync();
    host.querySelector('#dvCopy').addEventListener('click', function () {
      var link = dareLink(nEl.value, sEl.value);
      copyText(link).then(function (ok) {
        msg(host, ok ? '도발 링크를 복사했어요! 친구에게 붙여넣으세요.' : '복사가 막혔어요 · 링크를 길게 눌러 직접 복사하세요.', ok);
      });
    });
    return host;
  }

  /* ---------------- 도발 배너 HTML ---------------- */
  function bannerHTML() {
    if (!VS) return '';
    return '<div class="vs-banner"><b>🔥 ' + esc(VS.name) + ' 님의 도발</b>' +
      '<span>· 목표 ' + VS.score.toLocaleString('ko-KR') + '점</span></div>';
  }

  return {
    BASE: BASE,
    VS: VS, vsText: vsText, bannerHTML: bannerHTML, dareLink: dareLink, parseVS: parseVS,
    todayStr: dateStr, todayLabel: dateLabel,
    myName: myName, setMyName: setMyName,
    DAILY: {
      info: dailyInfo, stageFor: stageFor, targetFor: targetFor, best: dailyBest,
      record: dailyRecord, rngFor: rngFor, rng: function (d) { return rngFor(d || dateStr()); }
    },
    TITLES: {
      list: TITLES, all: function () { return TITLES; },
      note: note, unlock: unlock, best: bestTitle, count: titleCount, pin: pinTitle,
      status: function () { return { count: titleCount(), pin: TD.pin, stats: TD.stats, unlocked: Object.keys(TD.unlocked) }; },
      reset: function () { TD = freshTitles(); saveTitles(); return this.status(); }
    },
    set onUnlock(fn) { onUnlock = fn; },
    set onToast(fn) { onToast = fn; },
    openCard: openCard, openTitles: openTitles, openDare: openDare,
    closeModal: closeModal, isModalOpen: isOpen,
    copyText: copyText, renderCard: renderCard,
    lastCard: function () { return lastCard; }
  };
})();
