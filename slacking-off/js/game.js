/* ===== 부장님 몰래 딴짓하기 — game.js =====
   흐름: 타이틀 → 스테이지 인트로 → 플레이(딴짓/위장) → 발각·야근·칼퇴 → 다음 날 → 엔딩
   판정: 부장님이 "본다"가 되는 순간 work 상태 + 업무 척도 55% 이상이면 통과, 아니면 즉시 발각. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (a) { return a[(Math.random() * a.length) | 0]; };
  var now = function () { return performance.now() / 1000; };

  /* ③ 오늘의 챌린지: 날짜 시드 난수(BR)는 '상사 순찰·접근·페인트' 패턴에만 쓴다.
     플레이어 입력은 이 난수를 소비하지 않으므로 같은 날 모든 유저가 같은 패턴을 겪는다. */
  function BR() { return S.br ? S.br() : Math.random(); }
  function brnd(a, b) { return a + BR() * (b - a); }

  /* ---------------- stages ---------------- */
  var STAGES = [
    {
      id: 'mon', day: '월요일', name: '잼부장 순찰', tag: '쉬움', pips: 1,
      secs: 48, warn: 1.55, gap: [6.2, 9.2], turnback: 0, double: 0,
      temptation: false, suspicion: false, bosses: ['jambujang'],
      slack: 'jump', file: 'Q4_매출보고서_최종_진짜최종.xlsx', url: 'minigame.co.kr/block',
      desc: '부장님이 복도에서 다가온다. 다가오는 동안 재빨리 「일하는 척!」.',
      rules: ['부장님이 오면 <b>[일하는 척!]을 꾹</b> — 놓으면 바로 딴짓으로 돌아간다.',
        '딴짓 중에 걸리면 <b>즉시 발각</b>. 18:00까지 게이지 <b>100%</b>를 못 채우면 야근.']
    },
    {
      id: 'tue', day: '화요일', name: '잼부장 커피 급복귀', tag: '보통', pips: 2,
      secs: 48, warn: 1.5, gap: [5.2, 7.8], turnback: 0.2, double: 0, coffee: true,
      temptation: false, suspicion: false, bosses: ['jambujang'],
      slack: 'chat', file: '화요일_주간보고_모음_최종.xlsx', url: 'talk.jam.co.kr/딴짓방',
      desc: '단톡방 알림이 쏟아진다. 부장님은 커피 타러 갔다… 생각보다 빨리 돌아온다.',
      rules: ['<b>💬 메신저 버블</b>을 터뜨리면 게이지가 오른다. 버블은 계속 올라온다.',
        '부장님이 <b>커피 타러 간 틈</b>이 기회. 그런데 <b>급복귀</b>하면 경고가 아주 짧다.']
    },
    {
      id: 'wed', day: '수요일', name: '잼대리 유혹 공작', tag: '보통', pips: 2,
      secs: 46, warn: 1.3, gap: [5.4, 8.0], turnback: 0.45, double: 0,
      temptation: true, suspicion: false, bosses: ['jambujang'],
      slack: 'chart', file: '수요일_주간보고_진짜마지막_v7_최종.xlsx', url: 'coinchart.io/BTC',
      desc: '잼대리가 옆에서 치킨을 들이민다. 그리고 부장님이 지나간 척하다 돌아본다.',
      rules: ['<b>🍗 치킨 유혹</b>을 누르면 게이지 <b>+12</b>, 대신 <b>1.5초간 위장 불가</b>.',
        '부장님이 <b>지나간 척 돌아보는 페인트 모션</b> — 경고가 한 번 더 올 수 있다.']
    },
    {
      id: 'thu', day: '목요일', name: '잼사장 뒤에서 접근', tag: '어려움', pips: 3,
      secs: 50, warn: 1.6, gap: [5.6, 8.2], turnback: 0.4, double: 0.15, stealth: 0.42,
      temptation: false, suspicion: false, bosses: ['jambujang', 'jamsajang'],
      slack: 'video', file: '목요일_임원보고_초안_진짜.xlsx', url: 'youtube.com/shorts',
      desc: '숏폼이 자동 재생된다. 그런데 발소리도 없이 등 뒤로 누가 다가온다.',
      rules: ['<b>📱 숏폼 카드</b>를 넘기면 게이지가 오른다. 계속 넘겨야 한다.',
        '<b>뒤에서 소리 없이 접근</b> — 발소리·경고가 <b>한 박자 늦게</b> 뜬다. 늦으면 발각.']
    },
    {
      id: 'fri', day: '금요일', name: '부장님 + 사장님 더블 체크', tag: '어려움', pips: 3,
      secs: 52, warn: 1.05, gap: [4.6, 7.2], turnback: 0.5, double: 0.4,
      temptation: true, suspicion: true, bosses: ['jambujang', 'jamsajang'],
      slack: 'shop', file: '금요일_임원보고_이게진짜최종.xlsx', url: 'hotdeal.shop/타임딜',
      desc: '부장님과 사장님이 번갈아 온다. 경고가 짧고, 일만 하면 의심도가 찬다.',
      rules: ['경고가 <b>1초</b> 남짓. 화면을 보고 <b>먼저</b> 눌러야 한다.',
        '일하는 척만 오래 하면 <b>의심도</b>가 차서 <b>기습 점검</b>이 날아온다.']
    }
  ];

  /* ---------------- state ---------------- */
  var S = {
    mode: 'title',
    stage: 0, cfg: STAGES[0],
    baseScore: 0, score: 0,
    t: 0, left: 0,
    gauge: 0, combo: 0, comboAt: -9, taps: 0, bestCombo: 0,
    holding: false, work: false, acting: 0, locked: 0,
    phase: 'idle', phaseT: 0, warnDur: 0, warnLeft: 0, warnSurprise: false, warnBlind: 0, warnMode: 'walk',
    turnbackUsed: false, checker: 'jambujang', coffeeUsed: false,
    suspicion: 0, checks: 0, passes: 0,
    temptIn: 0, temptShown: false, temptHide: 0,
    chatIn: 9, footAcc: 0, typeAcc: 0, tickAt: 0,
    grace: 0, stageBest: 0, stats: null, rewarded: null,
    lastHint: '', excuse: null, excuseUsed: false,
    /* ② 도발 · ③ 오늘의 챌린지 · ① 성적표 */
    challenge: null, br: null, vsHit: false, dailyRec: null, paused: false,
    warnSeenAt: -9, warnNeedReact: false, events: []
  };
  var E = {};
  var lastTs = 0, rafId = 0;
  var runLog = [];

  /* ---------------- helpers ---------------- */
  function fmtClock(min) {
    var h = Math.floor(min / 60), m = Math.floor(min % 60);
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
  }
  function setText(el, v) { if (el && el.textContent !== v) el.textContent = v; }
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  /* BGM 전환 (sfx.js 의 프로시저럴 루프) */
  function bgmPlay(m) { try { SFX.bgm.start(m); } catch (e) {} }
  function bgmMode(m) { try { SFX.bgm.setMode(m); } catch (e) {} }
  function bgmWork(v) { try { SFX.bgm.setWork(!!v); } catch (e) {} }
  function bgmStop() { try { SFX.bgm.stop(); } catch (e) {} }
  function flash(color, ms) {
    var d = document.createElement('div');
    d.style.cssText = 'position:absolute;inset:0;z-index:70;pointer-events:none;background:' + color + ';opacity:.55;transition:opacity .35s ease;';
    E.app.appendChild(d);
    void d.offsetWidth;
    d.style.opacity = '0';
    setTimeout(function () { d.remove(); }, ms || 380);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    E.app = $('app');
    E.stageChip = $('stageChip');
    E.soundBtn = $('soundBtn');
    E.clock = $('clock');
    E.dayLeft = $('dayLeft');
    E.score = $('score');
    E.coin = $('coin');
    E.dayFill = $('dayFill');
    E.office = $('office');
    E.corridor = $('corridor');
    E.officeDay = $('officeDay');
    E.miniLabel = $('miniLabel');
    E.alert = $('alert');
    E.alertIc = $('alertIc');
    E.alertTx = $('alertTx');
    E.alertFill = $('alertFill');
    E.monitor = $('monitor');
    E.monitorWrap = document.querySelector('.monitor-wrap');
    E.cam = $('cam');
    E.slackView = $('slackView');
    E.excelView = $('excelView');
    E.eatView = $('eatView');
    E.mini = $('mini');
    E.floaters = $('floaters');
    E.hint = $('hint');
    E.gaugeFill = $('gaugeFill');
    E.gaugeVal = $('gaugeVal');
    E.combo = $('combo');
    E.actingRow = $('actingRow');
    E.actingFill = $('actingFill');
    E.actingVal = $('actingVal');
    E.susRow = $('susRow');
    E.susFill = $('susFill');
    E.susVal = $('susVal');
    E.workBtn = $('workBtn');
    E.wbHold = $('wbHold');
    E.toast = $('toast');
    E.overlay = $('overlay');
    E.xlFile = $('xlFile');
    E.winUrl = $('winUrl');
    E.xlSave = $('xlSave');
    E.xlFormula = $('xlFormula');
    E.xlGrid = $('xlGrid');
    E.bubble = $('bubble');

    /* ② 도발 배너 (플레이 상단) */
    E.vsStrip = $('vsStrip');
    E.vsText = $('vsText');
    E.vsProg = $('vsProg');

    /* 바이럴 모듈 훅 */
    if (window.VIRAL) {
      VIRAL.onToast = function (t, ms) { toast(t, ms); };
      VIRAL.onUnlock = function (t) {
        try { SFX.earn(); } catch (err) {}
        unlockBanner(t);
      };
      try {
        var mx = 0;
        if (window.SHOP) { var uu = SHOP.status().up; for (var kk in uu) mx = Math.max(mx, uu[kk]); }
        if (mx >= 3) VIRAL.TITLES.note('maxlv', mx);
      } catch (err) {}
    }

    E.soundBtn.textContent = SFX.isOn() ? '🔊' : '🔇';
    E.soundBtn.setAttribute('aria-pressed', SFX.isOn() ? 'true' : 'false');

    buildExcel();
    bind();
    if (window.Slack3D) Slack3D.init({ officeEl: $('office3d'), miniEl: $('mini3d') });
    showTitle();
    rafId = requestAnimationFrame(loop);
  }

  /* ---------------- input ---------------- */
  function bind() {
    // 첫 제스처에서 오디오 잠금 해제
    var unlock = function () { SFX.unlock(); };
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });

    E.soundBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var on = SFX.toggle();
      E.soundBtn.textContent = on ? '🔊' : '🔇';
      E.soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      toast(on ? '소리 켬' : '소리 끔', 1100);
    });

    E.monitor.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.tempt')) return;
      e.preventDefault();
      var rect = E.monitor.getBoundingClientRect();
      slackTap(e.clientX - rect.left, e.clientY - rect.top, e.clientX, e.clientY);
    });

    E.workBtn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { E.workBtn.setPointerCapture(e.pointerId); } catch (err) {}
      startWork();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) {
      E.workBtn.addEventListener(ev, function () { endWork(); });
    });
    E.workBtn.addEventListener('pointerleave', function () { endWork(); });

    window.addEventListener('pointerup', function () { endWork(); });
    window.addEventListener('pointercancel', function () { endWork(); });

    window.addEventListener('keydown', function (e) {
      if (e.code === 'Space') {
        if (window.SHOP && SHOP.isOpen()) return;
        e.preventDefault();
        if (e.repeat) return;
        if (S.mode === 'playing') startWork();
        else if (S.mode === 'title' || S.mode === 'intro') advance();
      }
    });
    window.addEventListener('keyup', function (e) {
      if (e.code === 'Space') endWork();
    });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  }

  /* ---------------- title / overlays ---------------- */
  function overlay(html) {
    E.overlay.classList.remove('ec');
    E.overlay.innerHTML = html;
    E.overlay.hidden = false;
  }
  function hideOverlay() { E.overlay.hidden = true; E.overlay.innerHTML = ''; E.overlay.classList.remove('ec'); }

  function rankBarHTML() {
    var r = SHOP.rank(), nx = SHOP.nextRank();
    var s = '<span class="rank-badge"><b>' + r.emoji + '</b>' + r.name + '</span>' +
      '<span class="coin-chip">₩ ' + SHOP.balance().toLocaleString('ko-KR') + '</span>';
    if (nx) {
      s += '<span class="rank-next">다음 ' + nx.rank.emoji + ' ' + nx.rank.name +
        (nx.needsClears ? ' · 클리어 ' + nx.needsClears + '판' : '') +
        (nx.needsCoins ? ' · 코인 ' + SHOP.money(nx.needsCoins) : '') + '</span>';
    } else {
      s += '<span class="rank-next">최고 직급 달성 👑</span>';
    }
    return s;
  }

  function showTitle() {
    S.mode = 'title';
    bgmStop();
    if (window.Slack3D) { Slack3D.setActive(true); Slack3D.setMiniActive(true); }
    E.app.classList.remove('tense');
    E.stageChip.textContent = '월요일';
    resetBossVisual();
    S.challenge = null; S.dailyRec = null;
    updateVsStrip();
    var days = '';
    for (var i = 0; i < STAGES.length; i++) {
      days += stageRow(STAGES[i].day, STAGES[i].name, STAGES[i].pips, STAGES[i].tag);
    }
    var vInfo = window.VIRAL ? VIRAL.DAILY.info() : null;
    var virRow = window.VIRAL
      ? '<div class="viral-row">' +
          '<button class="vchip" id="dailyBtn" type="button"><span class="vic">📅</span><span class="vtx">' +
            '<b>오늘의 챌린지</b><small>최고 ' + (vInfo.best || 0).toLocaleString('ko-KR') + '점</small></span></button>' +
          '<button class="vchip" id="titlesBtn" type="button"><span class="vic">🎖️</span><span class="vtx">' +
            '<b>칭호 도감</b><small>' + VIRAL.TITLES.count() + ' / ' + VIRAL.TITLES.list.length + ' 해금</small></span></button>' +
          '<button class="vchip" id="dareBtn" type="button"><span class="vic">🥊</span><span class="vtx">' +
            '<b>친구 도발</b><small>링크 만들기</small></span></button>' +
        '</div>'
      : '';
    overlay(
      '<div class="ov-inner title-inner">' +
        (window.VIRAL ? VIRAL.bannerHTML() : '') +
        '<div class="hero" aria-hidden="true">' +
          '<img class="hero-3d" id="hero3d" alt="잼부장 복셀 캐릭터">' +
          '<span class="hero-chip">🍿 딴짓 92% · 칼퇴까지 12분</span>' +
        '</div>' +
        '<div class="rankbar" id="rankBar">' + rankBarHTML() + '</div>' +
        '<h1 class="ov-title">부장님 몰래<br>딴짓하기</h1>' +
        '<p class="ov-sub">부장님 눈을 피해 <b>딴짓 게이지 100%</b>를 채우고,<br>6시 정각에 사라져라. 월~금 5일 생존기.</p>' +
        '<div class="how">' +
          '<div class="how-i"><b>👆</b><span>모니터 연타<small>딴짓 게이지 UP</small></span></div>' +
          '<div class="how-i"><b>💼</b><span>일하는 척 꾹<small>부장님 눈 피하기</small></span></div>' +
          '<div class="how-i"><b>🛒</b><span>장비·승진<small>코인으로 강해지기</small></span></div>' +
        '</div>' +
        '<div class="ov-stage-list day5">' + days + '</div>' +
        virRow +
        '<div class="cta-row">' +
          '<button class="cta ghost shop-btn" id="shopBtn" type="button">🛒 장비 상점</button>' +
          '<button class="cta" id="startBtn" type="button">출근하기</button>' +
        '</div>' +
        '<p class="ov-tiny">모니터 연타 = 딴짓 · 「일하는 척!」 꾹 = 위장 (Space)</p>' +
      '</div>'
    );
    $('startBtn').addEventListener('click', function () { SFX.click(); startRun(); });
    $('shopBtn').addEventListener('click', function (e) {
      e.preventDefault();
      SFX.click();
      SHOP.onClose = function () { if (S.mode === 'title') showTitle(); };
      SHOP.open(E.overlay, function (r) { if (r && r.ok && r.level >= 3 && window.VIRAL) VIRAL.TITLES.note('maxlv', 3); });
    });
    var dBtn = $('dailyBtn');
    if (dBtn) dBtn.addEventListener('click', function (e) { e.preventDefault(); SFX.click(); showChallenge(); });
    var tBtn = $('titlesBtn');
    if (tBtn) tBtn.addEventListener('click', function (e) { e.preventDefault(); SFX.click(); if (window.VIRAL) VIRAL.openTitles(); });
    var rBtn = $('dareBtn');
    if (rBtn) rBtn.addEventListener('click', function (e) {
      e.preventDefault(); SFX.click();
      var best = window.SHOP ? SHOP.status().best : 0;
      if (window.VIRAL) VIRAL.openDare(best || 300);
    });
    try {
      var shot = Slack3D.snapshot('hero');
      var im = $('hero3d');
      if (shot && im) im.src = shot;
      Slack3D.setActive(false);
    } catch (err) {}
    /* CC0 텍스처가 도착하면 타이틀 히어로도 같은 재질로 한 번 더 찍는다 */
    if (!showTitle._txHook) {
      showTitle._txHook = 1;
      window.addEventListener('txready', function () {
        if (S.mode !== 'title') return;
        var img = $('hero3d');
        if (!img) return;
        try { var s2 = Slack3D.snapshot('hero'); if (s2) img.src = s2; } catch (e) {}
        Slack3D.setActive(false);
      });
    }
  }
  function stageRow(day, name, pips, tag) {
    var p = '';
    for (var i = 0; i < 3; i++) p += '<i class="' + (i < pips ? 'on' : '') + '"></i>';
    return '<div class="ov-stage"><span class="d">' + day + '</span><span class="n">' + name + '</span>' +
      '<span class="p">' + tag + ' ' + p + '</span></div>';
  }

  function startRun() {
    S.challenge = null; S.dailyRec = null; S.vsHit = false;
    S.score = 0;
    runLog = [];
    enterStage(0, 0);
  }

  /* ---------------- ③ 오늘의 챌린지 ---------------- */
  function showChallenge() {
    if (!window.VIRAL) return;
    var info = VIRAL.DAILY.info();
    var cfg = STAGES[info.stage];
    S.mode = 'daily';
    bgmStop();
    resetBossVisual();
    if (window.Slack3D) { Slack3D.setActive(true); Slack3D.setMiniActive(true); }
    overlay(
      '<div class="ov-inner">' +
        '<span class="ov-tag">📅 오늘의 챌린지 · ' + info.date + '</span>' +
        '<h2 class="ov-title sm">같은 부장님,<br>같은 순찰</h2>' +
        '<p class="ov-sub">오늘은 모두 <b>똑같은 상사 패턴</b>으로 겨룹니다.<br>날짜가 같으면 순찰·접근·페인트 모션도 같아요.</p>' +
        '<div class="ov-stage-list">' + stageRow(cfg.day, cfg.name, cfg.pips, cfg.tag) + '</div>' +
        '<div class="daily-box">' +
          '<div class="dbr">오늘의 목표 점수<b>' + info.target.toLocaleString('ko-KR') + '점</b></div>' +
          '<div class="dbr">오늘 내 최고 기록<b>' + (info.best || 0).toLocaleString('ko-KR') + '점</b></div>' +
          '<div class="dbr">공정 모드<b>장비·직급 효과 그대로</b></div>' +
          '<div class="dseed">시드 #' + info.seed + ' · ' + cfg.day + ' · 하루 한 번이 아니라 몇 번이든</div>' +
        '</div>' +
        '<button class="cta" id="dailyGo" type="button">🏁 챌린지 시작</button>' +
        '<button class="cta ghost" id="dailyBack" type="button">돌아가기</button>' +
      '</div>'
    );
    $('dailyGo').addEventListener('click', function () { SFX.click(); startChallenge(); });
    $('dailyBack').addEventListener('click', function () { SFX.click(); showTitle(); });
  }

  function startChallenge(date) {
    if (!window.VIRAL) return;
    var info = VIRAL.DAILY.info(date);
    S.challenge = { date: info.date, stage: info.stage, target: info.target };
    S.dailyRec = null; S.vsHit = false;
    S.score = 0;
    runLog = [];
    enterStage(info.stage, 0);
  }

  function enterStage(i, baseScore) {
    bgmStop();
    S.stage = i;
    S.cfg = STAGES[i];
    S.baseScore = baseScore;
    S.score = baseScore;
    S.mode = 'intro';
    resetStageState();
    E.stageChip.textContent = S.cfg.day;
    if (E.officeDay) E.officeDay.textContent = S.cfg.day;
    prepareStageVisual();
    var cfg = S.cfg;
    var ruleRows = cfg.rules.map(function (r) {
      return '<div class="ov-stage"><span class="n" style="white-space:normal;line-height:1.45">' + r + '</span></div>';
    }).join('');
    overlay(
      '<div class="ov-inner">' +
        '<span class="ov-tag">' + cfg.day + ' · 17:05</span>' +
        '<h2 class="ov-title sm">' + cfg.name + '</h2>' +
        '<p class="ov-sub">' + cfg.desc + '</p>' +
        '<div class="goal-row">' +
          '<span class="goal-chip">🎯 딴짓 100%</span>' +
          '<span class="goal-chip">⏱ ' + cfg.secs + '초</span>' +
          '<span class="goal-chip">' + (cfg.suspicion ? '👁 의심도 주의' : cfg.temptation ? '🍗 유혹 주의' : '👀 순찰 주의') + '</span>' +
        '</div>' +
        '<div class="ov-stage-list">' + ruleRows + '</div>' +
        '<button class="cta" id="goBtn" type="button">출근! </button>' +
        '<p class="ov-tiny">모니터 연타 = 게이지 UP · 「일하는 척!」 꾹 = 위장</p>' +
      '</div>'
    );
    $('goBtn').addEventListener('click', function () { SFX.click(); beginPlay(); });
    syncHUD();
  }

  function beginPlay() {
    hideOverlay();
    S.mode = 'playing';
    S.grace = 0.9;
    lastTs = 0;
    E.app.classList.remove('tense');
    setAlert('calm', S.challenge ? '📅 오늘의 챌린지 · 모두 같은 순찰' : '평온 · 부장님은 자리에…');
    if (S.challenge) E.stageChip.textContent = '📅 챌린지';
    updateVsStrip();
    bgmPlay('calm');
    Slack3D.begin(S.cfg.bosses);
    Slack3D.setStage(S.cfg.slack);
    Slack3D.setMiniActive(true);
    Slack3D.setActive(true);
    setBossPos('far', 0.4);
    Bubble.hide();
    setTimeout(function () {
      if (S.mode !== 'playing') return;
      Bubble.say(S.cfg.bosses[0], 'calm');
    }, 900);
  }

  function advance() {
    if (S.mode === 'title') startRun();
    else if (S.mode === 'intro') beginPlay();
  }

  /* ---------------- stage lifecycle ---------------- */
  function resetStageState() {
    var cfg = S.cfg;
    S.t = 0; S.left = cfg.secs;
    S.gauge = 0; S.combo = 0; S.comboAt = -9; S.taps = 0; S.bestCombo = 0;
    S.holding = false; S.work = false; S.acting = 0; S.locked = 0;
    S.phase = 'idle'; S.phaseT = cfg.gap[1]; S.warnDur = cfg.warn; S.warnLeft = 0;
    S.warnBlind = 0; S.warnSurprise = false; S.warnMode = 'walk'; S.coffeeUsed = false;
    S.turnbackUsed = false; S.checker = cfg.bosses[0];
    S.suspicion = 0; S.checks = 0; S.passes = 0;
    S.temptIn = rnd(7, 10); S.temptShown = false;
    S.chatIn = 9; S.typeAcc = 0; S.tickAt = 0;
    S.grace = 0; S.stageBest = 0;
    S.excuse = null; S.excuseUsed = false; S.rewarded = null;
    S.events = [];
    /* ③ 챌린지는 날짜 시드로 상사 패턴을 고정한다(스테이지 시작마다 같은 시퀀스) */
    S.br = (S.challenge && window.VIRAL) ? VIRAL.DAILY.rng(S.challenge.date) : null;
    S.warnNeedReact = false; S.warnSeenAt = -9;
    if (window.ExcuseChance) ExcuseChance.reset();
    hideTempt();
    setWorkVisual(false, true);
    E.susRow.hidden = !cfg.suspicion;
    E.xlFile.textContent = cfg.file;
    if (E.winUrl) E.winUrl.textContent = cfg.url;
    E.monitor.dataset.mode = 'slack';
    E.cam.classList.remove('on');
    E.actingRow.hidden = true;
    if (E.susFill) E.susFill.style.width = '0%';
  }

  function prepareStageVisual() {
    var kind = S.cfg.slack;
    if (kind === 'jump') buildJump();
    else if (kind === 'chart') buildChart();
    else if (kind === 'chat') buildChat();
    else if (kind === 'video') buildVideo();
    else buildShop();
    E.slackView.hidden = false;
    E.eatView.hidden = true;
    E.excelView.hidden = true;
    E.monitor.dataset.mode = 'slack';
    E.cam.classList.remove('on');
    if (E.officeDay) E.officeDay.textContent = S.cfg.day;
    Slack3D.setStage(kind);
    Slack3D.setMiniActive(true);
  }

  /* ---------------- the loop ---------------- */
  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    if (S.mode === 'playing' && !S.paused) update(dt);
  }

  function update(dt) {
    var cfg = S.cfg;
    S.t += dt;
    S.left -= dt;

    if (S.left <= 0) { S.left = 0; syncHUD(); return timeoutStage(); }

    // 업무 척도
    if (S.holding) S.acting = Math.min(100, S.acting + dt * 340 * (window.SHOP ? SHOP.actingMul() : 1));
    else S.acting = Math.max(0, S.acting - dt * 280);
    if (!S.holding && S.work && S.acting <= 0.5) { S.work = false; setWorkVisual(false); }

    // 먹방 잠금
    if (S.locked > 0) {
      S.locked -= dt;
      if (S.locked <= 0) endLock();
    }

    // 콤보 감쇠
    if (S.combo > 0 && S.t - S.comboAt > 1.35) S.combo = 0;

    // 위장 중엔 게이지가 조금씩 식는다
    if (S.work) S.gauge = Math.max(0, S.gauge - 1.1 * (window.SHOP ? SHOP.decayMul() : 1) * dt);

    // 타자 소리
    if (S.work) {
      S.typeAcc -= dt;
      if (S.typeAcc <= 0) { S.typeAcc = 0.085; SFX.type(); typeStep(); }
    }

    // 의심도 (금요일)
    if (cfg.suspicion) {
      if (S.work) S.suspicion += 8.5 * dt;
      else S.suspicion -= 15 * dt;
      S.suspicion = clamp(S.suspicion, 0, 100);
      if (S.suspicion >= 100) {
        S.suspicion = 34;
        SFX.tick();
        toast('👀 의심도 폭발! 기습 점검!', 1500);
        if (S.phase === 'idle' || S.phase === 'pass') beginWarn(cfg.warn * 0.62, true);
      }
    }

    // 보스 상태 머신
    updateBoss(dt);

    // 유혹
    if (cfg.temptation) updateTemptation(dt);

    // 잡담
    S.chatIn -= dt;
    if (S.chatIn <= 0) {
      S.chatIn = rnd(9, 15);
      if (S.phase === 'idle' && !S.temptShown) {
        if (cfg.temptation && Math.random() < 0.5) Bubble.say('jamdaeri', 'calm');
        else Bubble.say(S.checker, 'calm');
      }
    }

    // 마지막 10초 틱
    if (S.left <= 10 && Math.floor(S.left) !== S.tickAt) {
      S.tickAt = Math.floor(S.left);
      SFX.tick();
    }

    syncHUD();

    /* ② 도발: 목표 점수 첫 돌파 순간 */
    if (window.VIRAL && VIRAL.VS && !S.vsHit && S.score > VIRAL.VS.score) vsBeaten();

    if (S.gauge >= 100) winStage();
  }

  /* ---------------- boss ---------------- */
  function updateBoss(dt) {
    var cfg = S.cfg;
    if (S.grace > 0) { S.grace -= dt; return; }

    if (S.phase === 'idle') {
      S.phaseT -= dt;
      if (S.phaseT <= 0) {
        if (cfg.coffee && !S.coffeeUsed && BR() < 0.55) beginCoffee();
        else if (cfg.stealth && BR() < 0.42) beginWarn(S.warnDur, false, 'stealth');
        else beginWarn(S.warnDur);
      }
    } else if (S.phase === 'coffee') {
      S.phaseT -= dt;
      if (S.phaseT <= 0) beginWarn(Math.max(0.62, cfg.warn * 0.44), true, 'rush');
    } else if (S.phase === 'warn') {
      S.warnLeft -= dt;
      if (S.warnBlind > 0) {
        /* 스텔스: 아직 아무 신호도 없다 */
        S.warnBlind -= dt;
        if (S.warnBlind <= 0) revealStealth();
      } else {
        S.footAcc -= dt;
        if (S.footAcc <= 0) {
          S.footAcc = Math.max(0.13, S.warnLeft * 0.34);
          SFX.foot(S.warnLeft < 0.5);
        }
        if (S.warnMode === 'rush') {
          setAlert('warn', S.warnLeft > 0.32 ? '커피 타러 간 줄 알았는데… 급복귀!!' : '옆문에서 들어왔다! 지금 위장!');
        } else if (S.warnMode === 'stealth') {
          setAlert('warn', S.warnLeft > S.warnDur * 0.3 ? '뒤에서 접근!! 일하는 척!!' : '등 뒤에 서 있다!!');
        } else {
          setAlert('warn', S.warnLeft > S.warnDur * 0.45 ? '쿵쿵쿵… 복도에서 다가오는 중' : '문 앞에서 대기 중! 지금 위장!');
        }
        E.alertFill.style.width = ((1 - S.warnLeft / S.warnDur) * 100).toFixed(1) + '%';
      }
      if (S.warnLeft <= 0) resolveCheck();
    } else if (S.phase === 'pass') {
      S.phaseT -= dt;
      if (S.phaseT <= 0) {
        S.phase = 'idle';
        S.phaseT = (cfg.double && BR() < cfg.double) ? brnd(0.7, 1.1) : brnd(cfg.gap[0], cfg.gap[1]);
        S.turnbackUsed = false;
        setBossPos('far', 0.8);
        bgmMode('calm');
        setAlert('calm', '평온 · 부장님은 자리에…');
        E.cam.classList.remove('on');
        E.monitor.dataset.mode = S.work ? 'work' : 'slack';
      }
    } else if (S.phase === 'feint') {
      S.phaseT -= dt;
      if (S.phaseT <= 0) beginWarn(Math.max(0.55, cfg.warn * 0.55), true);
    }
  }

  function beginWarn(dur, surprise, mode) {
    var cfg = S.cfg;
    mode = mode || (surprise ? 'surprise' : 'walk');
    dur = dur + (window.SHOP ? SHOP.warnBonus() : 0);
    S.phase = 'warn';
    S.warnMode = mode;
    S.warnDur = dur;
    S.warnLeft = dur;
    S.warnSurprise = mode === 'surprise' || mode === 'rush';
    S.footAcc = 0;
    S.warnBlind = 0;
    S.checker = (cfg.bosses.length > 1 && S.checks % 2 === 1) ? cfg.bosses[1] : cfg.bosses[0];
    S.events.push({ t: +S.t.toFixed(2), k: mode, d: +dur.toFixed(2), c: S.checker });
    if (mode === 'stealth') {
      /* 목요일: 발소리·시각 경고가 한 박자 늦게 뜨는 스텔스 접근 */
      S.warnBlind = dur * (cfg.stealth || 0.4);
      setBossPos('sneak', dur);
      E.monitor.dataset.mode = 'slack';
      setAlert('hush', '…등 뒤가 조용하다');
      Bubble.hide();
      return;
    }
    if (mode === 'rush') setBossPos('rush', dur);
    else setBossPos(surprise ? 'peek' : 'warn', surprise ? 0.12 : dur * 0.92);
    S.warnSeenAt = S.t; S.warnNeedReact = !S.work;
    E.cam.classList.add('on');
    E.monitor.dataset.mode = 'watch';
    E.app.classList.add('tense');
    SFX.warn();
    bgmMode('tense');
    setAlert('warn', surprise ? '기습 점검!! 일하는 척!!' : '쿵쿵쿵… 부장님 접근 중!');
    if (surprise) flash('rgba(255,80,90,.35)', 260);
    Bubble.say(S.checker, 'approach', 1600);
  }

  /* 목요일 스텔스: 경고가 늦게 터진다 */
  function revealStealth() {
    S.warnBlind = 0;
    S.warnSeenAt = S.t; S.warnNeedReact = !S.work;
    if (window.Slack3D) Slack3D.reveal();
    E.cam.classList.add('on');
    E.monitor.dataset.mode = 'watch';
    E.app.classList.add('tense');
    SFX.warn();
    bgmMode('tense');
    flash('rgba(255,80,90,.28)', 240);
    setAlert('warn', '뒤에서 접근!! 지금 위장!');
    Bubble.say(S.checker, 'behind', 1600);
  }

  /* 화요일: 커피 타러 갔다가 급복귀 */
  function beginCoffee() {
    var cfg = S.cfg;
    S.phase = 'coffee';
    S.coffeeUsed = true;
    S.phaseT = brnd(2.6, 3.8);
    S.events.push({ t: +S.t.toFixed(2), k: 'coffee', c: S.checker });
    S.warnBlind = 0;
    setBossPos('coffee', 0.9);
    E.monitor.dataset.mode = 'slack';
    E.app.classList.remove('tense');
    bgmMode('calm');
    setAlert('coffee', '☕ 커피 타러 감… 지금이 기회');
    Bubble.say(S.checker, 'coffee', 2200);
  }

  function resolveCheck() {
    if (S.mode !== 'playing') return;
    S.checks++;
    S.warnBlind = 0;
    var safe = S.work && S.acting >= 55;
    S.events.push({ t: +S.t.toFixed(2), k: safe ? 'pass' : 'caught' });
    E.app.classList.remove('tense');

    if (safe) {
      S.passes++;
      S.score += 120;
      setAlert('safe', '통과! 부장님이 고개를 끄덕였다');
      SFX.pass();
      Bubble.say(S.checker, 'pass');
      setBossPos('near', 0.2);
      E.monitor.dataset.mode = 'work';
      var cfg = S.cfg;
      if (!S.turnbackUsed && cfg.turnback && BR() < cfg.turnback) {
        S.turnbackUsed = true;
        S.phase = 'feint';
        S.phaseT = 0.62;
        setBossPos('leave', 0.5);
        Bubble.say(S.checker, 'turn', 2100);
        setTimeout(function () { if (S.mode === 'playing' && S.phase === 'feint') setAlert('calm', '어라… 지나간 줄 알았는데'); }, 300);
      } else {
        S.phase = 'pass';
        S.phaseT = 0.85;
      }
    } else {
      caught();
    }
  }

  function caught() {
    if (S.mode !== 'playing') return;
    /* 스테이지당 1회: 첫 발각은 3초 변명 찬스로 */
    if (window.ExcuseChance && !ExcuseChance.hasUsed()) { startExcuse(); return; }
    S.mode = 'caught';
    S.excuse = { reason: 'used', choice: null, said: '' };
    E.app.classList.remove('tense');
    bgmStop();
    if (window.Slack3D) { Slack3D.caught(); Slack3D.setMiniActive(false); }
    SFX.caught();
    E.monitor.classList.add('shake');
    setTimeout(function () { E.monitor.classList.remove('shake'); }, 400);
    flash('rgba(255,50,60,.5)', 420);
    setBossPos('peek', 0.1);
    setAlert('watch', '발각!! (변명 찬스는 이미 썼다)');
    Bubble.say(S.checker, 'caught', 4000);
    E.cam.classList.add('on');
    S.work = false; S.holding = false;
    S.stats = snapshotStats('caught');
    if (window.VIRAL) VIRAL.TITLES.note('caught');
    setTimeout(showCaughtScreen, 780);
  }

  /* ---------------- 3초 변명 찬스 ---------------- */
  function startExcuse() {
    S.mode = 'excuse';
    S.work = false; S.holding = false;
    E.workBtn.classList.remove('on');
    setWorkVisual(false, true);
    E.app.classList.remove('tense');
    E.monitor.classList.add('shake');
    setTimeout(function () { E.monitor.classList.remove('shake'); }, 400);
    E.monitor.dataset.mode = 'watch';
    E.cam.classList.add('on');
    setAlert('watch', '발각!! 변명할 시간 3초!');
    if (window.Slack3D) { Slack3D.caught(); Slack3D.setMiniActive(false); }
    bgmMode('tense');
    Bubble.say(S.checker, 'caught', 3200);
    var boss = CAST[S.checker] || CAST.jambujang;
    var line = (boss.lines.excuse ? pick(boss.lines.excuse) : boss.lines.caught);
    ExcuseChance.open({
      boss: S.checker,
      kind: S.cfg.slack,
      line: line,
      overlay: E.overlay,
      shot: function () { try { return Slack3D.snapshot(); } catch (e) { return ''; } },
      onPass: onExcusePass,
      onResume: resumeAfterExcuse,
      onFail: onExcuseFail
    });
  }

  function onExcusePass(res) {
    S.score += 50;
    S.excuse = { reason: 'pass', choice: res.choice, said: res.said };
    if (window.VIRAL) VIRAL.TITLES.note('excuse');
    setAlert('safe', '변명 성공! +50점 · 잠깐 무적');
    bgmMode('calm');
    SFX.earn();
    syncHUD();
  }

  function onExcuseFail(res) {
    S.excuse = res;
    S.stats = snapshotStats('caught');
    if (window.VIRAL) VIRAL.TITLES.note('caught');
    bgmStop();
    showCaughtScreen();
  }

  function resumeAfterExcuse() {
    if (S.mode !== 'excuse') return;
    S.mode = 'playing';
    S.grace = 1.5;
    S.phase = 'pass';
    S.phaseT = 1.0;
    S.turnbackUsed = true;
    S.work = false; S.holding = false; S.acting = 0;
    setWorkVisual(false, true);
    E.monitor.dataset.mode = 'slack';
    E.cam.classList.remove('on');
    E.monitor.classList.remove('shake');
    setAlert('calm', '변명 성공 · 다시 딴짓 모드');
    if (window.Slack3D) {
      Slack3D.release();
      Slack3D.setBoss(S.checker, 'far', 0.6);
      Slack3D.setActive(true);
      Slack3D.setMiniActive(true);
    }
    bgmMode('calm');
    S.lastHint = '';
    lastTs = 0;
    syncHUD();
    toast('변명 성공 +50점 · 1.5초 무적', 1500);
  }

  function timeoutStage() {
    S.mode = 'timeout';
    E.app.classList.remove('tense');
    bgmStop();
    SFX.overtime();
    setAlert('calm', '18:00 · 퇴근 시간');
    if (window.Slack3D) Slack3D.setMiniActive(false);
    Bubble.say(S.checker, 'overtime', 4000);
    S.work = false; S.holding = false;
    S.stats = snapshotStats('timeout');
    if (window.VIRAL) VIRAL.TITLES.note('overtime');
    setTimeout(showTimeoutScreen, 700);
  }

  function winStage() {
    if (S.mode !== 'playing') return;
    S.mode = 'clear';
    E.app.classList.remove('tense');
    bgmStop();
    SFX.clear();
    flash('rgba(120,255,190,.35)', 320);
    setAlert('safe', '딴짓 100%! 가방 챙겨!');
    if (window.Slack3D) Slack3D.setMiniActive(false);
    Bubble.say(S.checker, 'clear', 3200);
    S.stats = snapshotStats('clear');
    if (window.VIRAL) { VIRAL.TITLES.note('clear'); VIRAL.TITLES.note('combo', S.bestCombo); }
    S.score += 300 + Math.round(S.left * 8) + S.bestCombo * 10;
    runLog.push({ day: S.cfg.day, score: S.score - S.baseScore, gauge: Math.round(S.gauge), combo: S.bestCombo });
    setTimeout(showClearScreen, 620);
  }

  function snapshotStats(result) {
    return {
      result: result, day: S.cfg.day, stage: S.stage,
      gauge: Math.round(S.gauge), combo: S.bestCombo, score: S.score - S.baseScore,
      left: Math.max(0, Math.ceil(S.left)), checks: S.checks, passes: S.passes,
      suspicion: Math.round(S.suspicion)
    };
  }

  /* ---------------- 승진 진급 · 루팡 코인 ---------------- */
  function award(st, cleared) {
    if (!window.SHOP) return null;
    if (S.rewarded) return S.rewarded;
    S.rewarded = SHOP.earn(SHOP.coinsFor(st, cleared), cleared);
    return S.rewarded;
  }
  function updateCoinHud() {
    if (E.coin && window.SHOP) setText(E.coin, '₩ ' + SHOP.balance().toLocaleString('ko-KR'));
  }
  function rewardRow() {
    var r = S.rewarded;
    if (!r || !window.SHOP) return '';
    var pr = r.promoted
      ? '<span class="promo">🎉 승진! ' + r.promoted.emoji + ' ' + r.promoted.name + '</span>'
      : '';
    return '<div class="reward-row">' + SHOP.rankBadge() +
      '<span class="rw-coins">₩ +' + r.coins.toLocaleString('ko-KR') + '</span>' +
      '<span class="rw-bal">보유 ₩ ' + r.balance.toLocaleString('ko-KR') + '</span></div>' + pr;
  }

  /* ---------------- boss visuals ---------------- */
  function setBossPos(pos, dur) {
    if (window.Slack3D) Slack3D.setBoss(S.checker, pos, dur);
    E.cam.classList.remove('on');
  }
  function resetBossVisual() {
    if (window.Slack3D) Slack3D.release();
    E.cam.classList.remove('on');
  }

  function setAlert(mode, text) {
    E.alert.dataset.mode = mode;
    setText(E.alertTx, text);
    if (mode === 'calm') {
      E.alertIc.textContent = '😴';
      E.alertFill.style.width = '0%';
    } else if (mode === 'warn') {
      E.alertIc.textContent = '⚠️';
    } else if (mode === 'safe') {
      E.alertIc.textContent = '✅';
      E.alertFill.style.width = '100%';
    } else if (mode === 'watch') {
      E.alertIc.textContent = '🚨';
      E.alertFill.style.width = '100%';
    } else if (mode === 'coffee') {
      E.alertIc.textContent = '☕';
      E.alertFill.style.width = '0%';
    } else if (mode === 'hush') {
      E.alertIc.textContent = '🤫';
      E.alertFill.style.width = '0%';
    }
  }

  /* ---------------- slack / work ---------------- */
  function slackTap(x, y, pageX, pageY) {
    if (S.mode !== 'playing') return;
    if (S.work || S.locked > 0) return;
    S.combo++;
    S.comboAt = S.t;
    S.bestCombo = Math.max(S.bestCombo, S.combo);
    var gain = (0.7 + Math.min(S.combo, 15) * 0.055) * (window.SHOP ? SHOP.gainMul() : 1);
    S.gauge = Math.min(100, S.gauge + gain);
    S.score += 8 + Math.min(S.combo, 15) * 2;
    S.taps++;
    SFX.tap(S.combo);
    miniTap();
    if (x != null) floater('+' + gain.toFixed(1), x, y);
    syncHUD();
    if (S.gauge >= 100) winStage();
  }

  function startWork() {
    if (S.mode !== 'playing') return;
    if (S.locked > 0) {
      toast('🍗 먹방 중… 손을 뗄 수 없다!', 1200);
      return;
    }
    if (S.holding) return;
    S.holding = true;
    noteReaction();
    if (!S.work) { S.work = true; setWorkVisual(true); SFX.click(); }
    E.workBtn.classList.add('on');
    E.actingRow.hidden = false;
  }
  function endWork() {
    if (!S.holding) { E.workBtn.classList.remove('on'); return; }
    S.holding = false;
    E.workBtn.classList.remove('on');
    bgmWork(false);
    // 짧은 유예 뒤 위장 해제 (탭 한 번도 살짝 먹히게)
    setTimeout(function () {
      if (!S.holding && S.acting <= 0.5 && S.work) {
        S.work = false;
        setWorkVisual(false);
      }
    }, 60);
  }
  function setWorkVisual(on, silent) {
    bgmWork(on);
    E.excelView.hidden = !on;
    E.slackView.hidden = on;
    E.eatView.hidden = true;
    E.actingRow.hidden = !on;
    E.monitor.dataset.mode = on ? 'work' : (S.locked > 0 ? 'eat' : 'slack');
    if (window.Slack3D) Slack3D.setMiniActive(!on && S.locked <= 0);
    E.app.classList.toggle('working', on);
    if (on) {
      E.xlSave.textContent = '저장 중…';
      E.xlSave.style.color = '#ffd24a';
      E.cam.classList.remove('on');
    } else {
      E.xlSave.textContent = '저장됨';
      E.xlSave.style.color = '#7fe3aa';
      if (!silent) SFX.click();
    }
  }

  /* ---------------- mini games (3D) ---------------- */
  function buildJump() {
    E.miniScore = $('miniScore');
    if (E.miniLabel) E.miniLabel.textContent = '🍪 미니 블록';
    if (E.miniScore) E.miniScore.textContent = '0';
  }
  function buildChart() {
    E.miniScore = $('miniScore');
    if (E.miniLabel) E.miniLabel.textContent = '🪙 코인 차트';
    if (E.miniScore) E.miniScore.textContent = '+0.0%';
  }
  function buildShop() {
    E.miniScore = $('miniScore');
    E.cartTotal = 0;
    if (E.miniLabel) E.miniLabel.textContent = '🛒 핫딜 쇼핑';
    if (E.miniScore) E.miniScore.textContent = '0개';
  }
  function buildChat() {
    E.miniScore = $('miniScore');
    if (E.miniLabel) E.miniLabel.textContent = '💬 사내 메신저';
    if (E.miniScore) E.miniScore.textContent = '0개';
  }
  function buildVideo() {
    E.miniScore = $('miniScore');
    if (E.miniLabel) E.miniLabel.textContent = '📱 몰래 숏폼';
    if (E.miniScore) E.miniScore.textContent = '0편';
  }
  function miniTap() {
    var kind = S.cfg.slack;
    if (kind === 'jump') {
      if (E.miniScore) E.miniScore.textContent = S.taps;
    } else if (kind === 'chart') {
      if (E.miniScore) E.miniScore.textContent = '+' + (S.taps * 2.7).toFixed(1) + '%';
    } else if (kind === 'chat') {
      if (E.miniScore) E.miniScore.textContent = S.taps + '개';
    } else if (kind === 'video') {
      if (E.miniScore) E.miniScore.textContent = S.taps + '편';
    } else {
      var price = 1900 + Math.floor(Math.random() * 12) * 1000;
      E.cartTotal = (E.cartTotal || 0) + price;
      if (E.miniScore) E.miniScore.textContent = S.taps + '개';
      if (E.miniLabel) E.miniLabel.textContent = '🛒 ' + E.cartTotal.toLocaleString('ko-KR') + '원';
    }
    if (window.Slack3D) Slack3D.tap();
  }

  function floater(text, x, y) {
    if (!E.floaters) return;
    var d = document.createElement('span');
    d.className = 'float-num';
    d.textContent = text;
    d.style.left = clamp(x + (Math.random() * 26 - 13), 18, E.monitor.clientWidth - 18) + 'px';
    d.style.top = clamp(y + (Math.random() * 14 - 7), 14, E.monitor.clientHeight - 14) + 'px';
    E.floaters.appendChild(d);
    setTimeout(function () { d.remove(); }, 720);
  }

  /* ---------------- excel ---------------- */
  var XF = [
    '=SUM(B2:B9)/12',
    '=IF(퇴근시간<18:00,"칼퇴","야근")',
    '=VLOOKUP(A3,매출!A:Z,7,0)',
    '=IF(재고<0,"긴급",0)',
    '=SUMIF(부장님, "지나감", 딴짓)',
    '=ROUND(연봉*1.0,0)'
  ];
  var XF_IDX = 0, XF_CHAR = 0, XF_TARGET = XF[0];

  function buildExcel() {
    var head = '<div class="xl-cell hd"></div>';
    for (var c = 0; c < 6; c++) head += '<div class="xl-cell hd">' + String.fromCharCode(65 + c) + '</div>';
    var rows = '';
    var labels = ['매출', '목표', '달성', '재고', '단가', '수량', '비고', '합계', '검토'];
    for (var r = 0; r < 9; r++) {
      rows += '<div class="xl-cell hd">' + (r + 1) + '</div>';
      for (var k = 0; k < 6; k++) {
        var v;
        if (k === 0) v = labels[r];
        else if (k === 5 && r % 3 === 0) v = '진짜최종';
        else v = (Math.floor(Math.random() * 900) + 100).toLocaleString('en-US');
        rows += '<div class="xl-cell' + (k === 0 ? '' : ' num') + '" data-cell="' + r + '-' + k + '">' + v + '</div>';
      }
    }
    E.xlGrid.innerHTML = head + rows;
    E.xlFormula.textContent = XF_TARGET;
    placeCursor(2, 3);
  }
  function placeCursor(r, c) {
    var cells = E.xlGrid.querySelectorAll('.xl-cell');
    for (var i = 0; i < cells.length; i++) cells[i].classList.remove('sel');
    var idx = 7 + r * 7 + c + 1;
    if (cells[idx]) cells[idx].classList.add('sel');
  }
  function typeStep() {
    XF_CHAR++;
    if (XF_CHAR > XF_TARGET.length) {
      XF_CHAR = 0;
      XF_IDX = (XF_IDX + 1) % XF.length;
      XF_TARGET = XF[XF_IDX];
      placeCursor(Math.floor(Math.random() * 9), 1 + Math.floor(Math.random() * 5));
    }
    E.xlFormula.textContent = XF_TARGET.slice(0, XF_CHAR);
  }

  /* ---------------- temptation ---------------- */
  function updateTemptation(dt) {
    if (S.temptShown) {
      S.temptHide -= dt;
      if (S.temptHide <= 0) hideTempt(false);
      return;
    }
    if (S.phase !== 'idle' || S.work || S.locked > 0) return;
    S.temptIn -= dt;
    if (S.temptIn <= 0) showTempt();
  }
  function showTempt() {
    hideTempt(true);
    S.temptShown = true;
    S.temptHide = 2.8;
    SFX.tempt();
    var line = pick(CAST.jamdaeri.lines.tempt);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tempt';
    b.innerHTML = '<span class="t-ic">🍗</span><span class="t-tx"><b>잼대리</b>' + line + '</span><span class="t-bonus">+12</span>';
    b.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      takeTemptation();
    });
    E.monitorWrap.appendChild(b);
    E.temptEl = b;
  }
  function hideTempt(silent) {
    if (E.temptEl) { E.temptEl.remove(); E.temptEl = null; }
    if (S.temptShown && !silent) Bubble.say('jamdaeri', 'temptIgnored', 1800);
    S.temptShown = false;
    S.temptIn = rnd(7.5, 11.5);
  }
  function takeTemptation() {
    if (S.mode !== 'playing') return;
    hideTempt(true);
    S.locked = 1.5;
    S.gauge = Math.min(100, S.gauge + 12);
    S.score += 90;
    S.combo = 0;
    SFX.eat();
    Bubble.say('jamdaeri', 'temptTaken', 2000);
    setWorkVisual(false, true);
    E.slackView.hidden = true;
    E.eatView.hidden = false;
    E.monitor.dataset.mode = 'eat';
    if (window.Slack3D) Slack3D.setMiniActive(false);
    E.actingRow.hidden = true;
    toast('🍗 게이지 +12! 그런데 1.5초간 위장 불가…', 1600);
    if (S.gauge >= 100) winStage();
  }
  function endLock() {
    S.locked = 0;
    E.eatView.hidden = true;
    E.slackView.hidden = false;
    E.monitor.dataset.mode = 'slack';
    if (window.Slack3D) Slack3D.setMiniActive(true);
    SFX.click();
  }

  /* ---------------- HUD ---------------- */
  function syncHUD() {
    var cfg = S.cfg;
    var prog = clamp(1 - S.left / cfg.secs, 0, 1);
    E.dayFill.style.width = (prog * 100).toFixed(2) + '%';
    setText(E.clock, fmtClock(1025 + prog * 55));
    setText(E.dayLeft, '칼퇴까지 ' + Math.ceil(S.left) + '초');
    setText(E.score, S.score.toLocaleString('ko-KR') + '점');
    updateCoinHud();
    E.gaugeFill.style.width = S.gauge.toFixed(1) + '%';
    setText(E.gaugeVal, Math.floor(S.gauge) + '%');
    var hot = S.combo >= 8;
    setText(E.combo, '콤보 ' + S.combo + (hot ? ' 🔥' : ''));
    E.combo.classList.toggle('hot', hot);
    if (S.work || S.acting > 0) {
      E.actingRow.hidden = false;
      E.actingFill.style.width = S.acting.toFixed(0) + '%';
      setText(E.actingVal, Math.round(S.acting) + '%');
      E.wbHold.style.width = S.acting.toFixed(0) + '%';
    } else {
      E.actingRow.hidden = true;
      E.wbHold.style.width = '0%';
    }
    if (cfg.suspicion) {
      E.susRow.hidden = false;
      E.susFill.style.width = S.suspicion.toFixed(0) + '%';
      setText(E.susVal, Math.round(S.suspicion) + '%');
    } else {
      E.susRow.hidden = true;
    }
    updateHint();
    updateVsStrip();
  }

  function updateHint() {
    var h, cls = '';
    if (S.locked > 0) { h = '🍗 먹방 중… 이 1.5초엔 위장도 못 한다!'; cls = 'hot'; }
    else if (S.phase === 'warn' || S.phase === 'feint') {
      if (!S.work) { h = '지금이다! 「일하는 척!」을 꾹 누르세요'; cls = 'hot'; }
      else if (S.acting < 55) { h = '척도가 부족해! 조금만 더 버텨…'; cls = 'hot'; }
      else { h = '좋아, 그대로 버텨… 타자 소리만 들리게'; cls = 'good'; }
    } else if (S.work) { h = '타자 소리로 위장 중 · 손 떼면 바로 딴짓 복귀'; cls = 'good'; }
    else if (S.left <= 10) { h = '칼퇴까지 ' + Math.ceil(S.left) + '초! 게이지를 채워!'; cls = 'hot'; }
    else { h = '모니터를 연타하면 딴짓 게이지가 올라가요'; }
    if (h !== S.lastHint) {
      S.lastHint = h;
      E.hint.textContent = h;
      E.hint.className = 'hint ' + cls;
    }
  }

  var toastT = 0;
  function toast(text, ms) {
    E.toast.textContent = text;
    E.toast.hidden = false;
    E.toast.style.animation = 'none';
    void E.toast.offsetWidth;
    E.toast.style.animation = '';
    clearTimeout(toastT);
    toastT = setTimeout(function () { E.toast.hidden = true; }, ms || 1600);
  }

  /* ---------------- ① 성적표 · ② 도발 · ③ 챌린지 · ④ 칭호 ---------------- */
  function noteReaction() {
    if (!S.warnNeedReact || S.phase !== 'warn') return;
    var dt = S.t - S.warnSeenAt;
    S.warnNeedReact = false;
    if (dt >= 0 && dt <= 0.2 && window.VIRAL) VIRAL.TITLES.note('react', dt);
  }

  function updateVsStrip() {
    if (!E.vsStrip) return;
    if (!window.VIRAL || !VIRAL.VS || S.mode !== 'playing') { E.vsStrip.hidden = true; return; }
    E.vsStrip.hidden = false;
    var t = VIRAL.VS.score;
    var line = '🔥 ' + VIRAL.VS.name + ' 님의 도발 · 목표 ' + t.toLocaleString('ko-KR') + '점';
    if (E.vsText && E.vsText.textContent !== line) E.vsText.textContent = line;
    var prog = S.score.toLocaleString('ko-KR') + ' / ' + t.toLocaleString('ko-KR');
    if (E.vsProg && E.vsProg.textContent !== prog) E.vsProg.textContent = prog;
    E.vsStrip.classList.toggle('hit', S.score > t);
  }

  /* ② 도발 목표 첫 돌파 */
  function vsBeaten() {
    if (!window.VIRAL || !VIRAL.VS) return;
    S.vsHit = true;
    VIRAL.TITLES.note('dare');
    try { SFX.earn(); } catch (e) {}
    flash('rgba(255,210,74,.3)', 300);
    var gap = S.score - VIRAL.VS.score;
    toast('🥊 도발 격파! ' + VIRAL.VS.name + ' 님의 목표를 넘었다 (+' + gap.toLocaleString('ko-KR') + ')', 2600);
    var b = document.createElement('div');
    b.className = 'vs-win';
    b.textContent = '🔥 도발 격파 +' + gap.toLocaleString('ko-KR');
    E.app.appendChild(b);
    setTimeout(function () { b.classList.add('out'); }, 2300);
    setTimeout(function () { if (b.parentNode) b.remove(); }, 2800);
    updateVsStrip();
  }

  function vsResultRow(score) {
    if (!window.VIRAL || !VIRAL.VS) return '';
    var t = VIRAL.VS.score, win = score > t;
    return '<div class="vs-result ' + (win ? 'win' : 'lose') + '">' +
      (win ? '🥊 도발 격파! ' + esc(VIRAL.VS.name) + ' 님의 목표를 +' + (score - t).toLocaleString('ko-KR') + '점으로 넘었다'
        : '🥊 도발 실패 · 목표까지 ' + (t - score).toLocaleString('ko-KR') + '점 남았다') +
      '</div>';
  }

  /* ③ 오늘의 챌린지 결과 기록 */
  function challengeResult(cleared) {
    if (!S.challenge || !window.VIRAL) return '';
    if (!S.dailyRec) {
      S.dailyRec = VIRAL.DAILY.record(S.score, S.challenge.date, S.challenge.stage);
      if (cleared) VIRAL.TITLES.note('challenge');
    }
    var r = S.dailyRec;
    return '<div class="vs-result ' + (cleared ? 'win' : 'lose') + '">' +
      '📅 오늘의 챌린지 · 오늘 최고 ' + r.best.toLocaleString('ko-KR') + '점' +
      (r.isNew ? ' · 🎉 신기록!' : ' · 최고까지 ' + Math.max(0, r.best - S.score).toLocaleString('ko-KR') + '점') +
      '</div>';
  }

  /* 칭호 해금 배지 — 오버레이·모달 위에서도 보이게 */
  function unlockBanner(t) {
    if (!t || !E.app) return;
    var d = document.createElement('div');
    d.className = 'title-unlock';
    d.innerHTML = '<span>🎖️ 칭호 해금</span><b>' + t.icon + ' ' + t.name + '</b>';
    E.app.appendChild(d);
    setTimeout(function () { d.classList.add('out'); }, 2100);
    setTimeout(function () { if (d.parentNode) d.remove(); }, 2600);
  }

  /* ① 성적표 데이터 */
  function cardInfo(kind) {
    var st = S.stats || {};
    var t = (window.VIRAL && VIRAL.TITLES.best()) || null;
    return {
      kind: kind,
      name: window.VIRAL ? VIRAL.myName() : '김인턴',
      rank: window.SHOP ? SHOP.rank().name : '인턴',
      title: t ? t.icon + ' ' + t.name : '아직 없음',
      score: S.score,
      gauge: st.gauge != null ? st.gauge : Math.round(S.gauge),
      combo: st.combo != null ? st.combo : S.bestCombo,
      day: S.cfg.day,
      status: kind === 'clear' ? '칼퇴 성공' : kind === 'timeout' ? '야근' : '발각',
      date: window.VIRAL ? VIRAL.todayLabel() : '',
      serial: String(S.stage + 1).padStart(3, '0'),
      vs: (window.VIRAL && VIRAL.VS) ? {
        win: S.score > VIRAL.VS.score,
        target: VIRAL.VS.score,
        margin: Math.max(0, S.score - VIRAL.VS.score)
      } : null
    };
  }
  function openCard(kind) { if (window.VIRAL) VIRAL.openCard(cardInfo(kind)); }

  /* ---------------- result screens ---------------- */
  function showCaughtScreen() {
    var st = S.stats;
    bgmStop();
    award(st, false);
    var cutShot = '';
    try { cutShot = Slack3D.snapshot(); Slack3D.setActive(false); } catch (err) {}
    var ex = S.excuse;
    var exRow = '';
    if (ex && ex.reason === 'wrong') {
      exRow = '<div class="cut-excuse"><b>선택한 변명</b><q>' + esc(ex.choice) + '</q><small>' + esc(ex.said) + '</small></div>';
    } else if (ex && ex.reason === 'timeout') {
      exRow = '<div class="cut-excuse"><b>변명</b><q>3.0초 동안 아무 말도 못 했다</q><small>' + esc(ex.said) + '</small></div>';
    } else if (ex && ex.reason === 'used') {
      exRow = '<div class="cut-excuse"><b>변명 찬스</b><q>이 판엔 이미 썼다</q><small>같은 변명은 두 번 통하지 않는다</small></div>';
    }
    var head = (ex && ex.reason === 'timeout') ? '김인턴… 3초 다 갔네?'
      : (ex && ex.reason === 'wrong') ? '김인턴… 그게 변명이야?!'
        : '김인턴… 지금 그게 뭐야?!';
    overlay(
      '<div class="ov-inner">' +
        (cutShot ? '<img class="cut-shot" src="' + cutShot + '" alt="발각 순간 3D 컷">' : '<div class="cut-emoji">👨‍💼</div>') +
        '<span class="cut-stamp">발각!</span>' +
        '<h2 class="cut-title">' + head + '</h2>' +
        '<p class="cut-line">' + (st ? '딴짓 ' + st.gauge + '%에서 모니터가 그대로 노출됐다. 부장님 표정이 굳었다.' : '') + '</p>' +
        exRow +
        statsRow(st, '발각') +
        challengeResult(false) +
        vsResultRow(S.score) +
        rewardRow() +
        '<div class="ov-actions">' +
          '<button class="cta ghost report-btn" id="cardBtn" type="button">📸 성적표 공유</button>' +
          '<button class="cta" id="retryBtn" type="button">다시 하기</button>' +
          '<button class="cta ghost" id="homeBtn" type="button">처음으로</button>' +
        '</div>' +
      '</div>'
    );
    $('cardBtn').addEventListener('click', function () { SFX.click(); openCard('caught'); });
    $('retryBtn').addEventListener('click', function () { SFX.click(); enterStage(S.stage, S.baseScore); });
    $('homeBtn').addEventListener('click', function () { SFX.click(); showTitle(); });
  }

  function showTimeoutScreen() {
    var st = S.stats;
    award(st, false);
    if (window.Slack3D) Slack3D.setActive(false);
    overlay(
      '<div class="ov-inner">' +
        '<div class="cut-emoji">🌙</div>' +
        '<span class="cut-stamp yellow">야근 당첨</span>' +
        '<h2 class="cut-title">18:00 · 해도 지고, 퇴근도 지고</h2>' +
        '<p class="cut-line">일하는 척만 하다간 퇴근은 없다. 딴짓은 해야 늘어난다.</p>' +
        statsRow(st, '남은 시간') +
        challengeResult(false) +
        vsResultRow(S.score) +
        rewardRow() +
        '<div class="ov-actions">' +
          '<button class="cta ghost report-btn" id="cardBtn" type="button">📸 성적표 공유</button>' +
          '<button class="cta" id="retryBtn" type="button">다시 하기</button>' +
          '<button class="cta ghost" id="homeBtn" type="button">처음으로</button>' +
        '</div>' +
      '</div>'
    );
    $('cardBtn').addEventListener('click', function () { SFX.click(); openCard('timeout'); });
    $('retryBtn').addEventListener('click', function () { SFX.click(); enterStage(S.stage, S.baseScore); });
    $('homeBtn').addEventListener('click', function () { SFX.click(); showTitle(); });
  }

  function statsRow(st, mode) {
    if (!st) return '';
    if (mode === '발각') {
      return '<div class="cut-stats">' +
        '<div><b>' + st.gauge + '%</b><small>딴짓 게이지</small></div>' +
        '<div><b>' + st.combo + '</b><small>최고 콤보</small></div>' +
        '<div><b>' + st.left + '초</b><small>남은 시간</small></div>' +
      '</div>';
    }
    return '<div class="cut-stats">' +
      '<div><b>' + st.gauge + '%</b><small>딴짓 게이지</small></div>' +
      '<div><b>' + st.checks + '회</b><small>점검 통과</small></div>' +
      '<div><b>' + st.combo + '</b><small>최고 콤보</small></div>' +
    '</div>';
  }

  function showClearScreen() {
    var st = S.stats;
    award(st, true);
    if (window.SHOP) SHOP.noteBest(S.score);
    if (window.Slack3D) { Slack3D.setActive(false); Slack3D.setMiniActive(false); }
    var isDaily = !!S.challenge;
    var next = S.stage + 1;
    var last = next >= STAGES.length;
    var head = last ? '금요일 18:00 · 이번 주도 칼퇴' : S.cfg.day + ' 18:00 · 사무실 탈출';
    var sub = last
      ? '5일 연속 칼퇴 성공. 이제 주말은 내 거다.'
      : '가방은 이미 쌌다. 계단으로 조용히… 내일 또 온다.';
    if (isDaily) {
      head = '오늘의 챌린지 · ' + S.cfg.day + ' 클리어';
      sub = '같은 날 모두가 같은 순찰을 겪었다. 오늘의 기록을 남겨라.';
    }
    overlay(
      '<div class="ov-inner">' +
        '<div class="cut-emoji">🏃‍♂️</div>' +
        '<span class="cut-stamp green">칼퇴 성공</span>' +
        '<h2 class="cut-title">' + head + '</h2>' +
        '<p class="cut-line">' + sub + '</p>' +
        '<div class="cut-stats">' +
          '<div><b>' + Math.round(S.gauge) + '%</b><small>딴짓 게이지</small></div>' +
          '<div><b>' + st.combo + '</b><small>최고 콤보</small></div>' +
          '<div><b>' + st.left + '초</b><small>남은 시간</small></div>' +
        '</div>' +
        challengeResult(true) +
        vsResultRow(S.score) +
        rewardRow() +
        '<div class="ov-actions">' +
          '<button class="cta ghost report-btn" id="cardBtn" type="button">📸 성적표 공유</button>' +
          (isDaily
            ? '<button class="cta" id="dailyAgain" type="button">오늘의 챌린지 다시</button>' +
              '<button class="cta ghost" id="homeBtn" type="button">처음으로</button>'
            : (last
              ? '<button class="cta" id="endBtn" type="button">주말 맞이하기</button>'
              : '<button class="cta" id="nextBtn" type="button">다음 날: ' + STAGES[next].day + ' →</button>') +
              '<button class="cta ghost" id="retryBtn" type="button">이 날 다시 하기</button>') +
        '</div>' +
      '</div>'
    );
    $('cardBtn').addEventListener('click', function () { SFX.click(); openCard('clear'); });
    if (isDaily) {
      $('dailyAgain').addEventListener('click', function () { SFX.click(); startChallenge(); });
      $('homeBtn').addEventListener('click', function () { SFX.click(); showTitle(); });
    } else {
      if (last) $('endBtn').addEventListener('click', function () { SFX.click(); showEnding(); });
      else $('nextBtn').addEventListener('click', function () { SFX.click(); enterStage(next, S.score); });
      $('retryBtn').addEventListener('click', function () { SFX.click(); enterStage(S.stage, S.baseScore); });
    }
  }

  function showEnding() {
    S.mode = 'ending';
    if (window.VIRAL) VIRAL.TITLES.note('ending');
    var total = S.score;
    var rank = total >= 4200 ? 'S' : total >= 3200 ? 'A' : total >= 2200 ? 'B' : 'C';
    var rows = runLog.map(function (r) {
      return '<div class="ov-stage"><span class="d">' + r.day + '</span><span class="n">딴짓 ' + r.gauge + '% · 콤보 ' + r.combo + '</span><span class="p">' + r.score + '점</span></div>';
    }).join('');
    overlay(
      '<div class="ov-inner">' +
        '<div class="cut-emoji">🌇</div>' +
        '<span class="cut-stamp yellow">5일 연속 칼퇴</span>' +
        '<h2 class="cut-title">주말이 왔다.<br>이번 주도 살아남았다.</h2>' +
        '<p class="cut-line">잼부장: “…칼퇴? 나 때는 말이야…”<br>잼인턴: “선배님 진짜 칼퇴했어요?!”</p>' +
        '<div class="ov-stage-list">' + rows + '</div>' +
        '<div class="cut-stats">' +
          '<div><b>' + rank + '</b><small>등급</small></div>' +
          '<div><b>' + total.toLocaleString('ko-KR') + '</b><small>총점</small></div>' +
          '<div><b>' + bestComboRun() + '</b><small>최고 콤보</small></div>' +
        '</div>' +
        '<div class="reward-row">' + SHOP.rankBadge() +
          '<span class="rw-bal">누적 코인 ₩ ' + SHOP.status().totalCoins.toLocaleString('ko-KR') + '</span></div>' +
        '<div class="ov-actions">' +
          '<button class="cta ghost report-btn" id="cardBtn" type="button">📸 성적표 공유</button>' +
          '<button class="cta" id="againBtn" type="button">다시 도전</button>' +
        '</div>' +
      '</div>'
    );
    $('cardBtn').addEventListener('click', function () { SFX.click(); openCard('clear'); });
    $('againBtn').addEventListener('click', function () { SFX.click(); startRun(); });
  }
  function bestComboRun() {
    var b = 0;
    for (var i = 0; i < runLog.length; i++) b = Math.max(b, runLog[i].combo);
    return b;
  }

  /* ---------------- debug / test hook ---------------- */
  window.__SLACK = {
    state: function () {
      return {
        mode: S.mode, stage: S.stage, day: S.cfg.day, gauge: S.gauge, left: S.left,
        combo: S.combo, work: S.work, holding: S.holding, acting: S.acting,
        phase: S.phase, score: S.score, suspicion: S.suspicion, locked: S.locked,
        checks: S.checks, passes: S.passes, taps: S.taps
      };
    },
    tap: function () {
      var r = E.monitor.getBoundingClientRect();
      slackTap(r.width / 2, r.height / 2, r.left + r.width / 2, r.top + r.height / 2);
    },
    hold: startWork,
    release: endWork,
    warn: function (d) { beginWarn(d || 0.9, false); },
    check: function () { if (S.mode === 'playing') resolveCheck(); },
    catch: function () { caught(); },
    excuse: function () { return window.ExcuseChance ? ExcuseChance.status() : null; },
    pickExcuse: function (i) { return window.ExcuseChance ? ExcuseChance.pick(i) : false; },
    audio: function () { return { on: SFX.isOn(), bgm: SFX.bgm.status() }; },
    setGauge: function (v) { S.gauge = clamp(v, 0, 100); syncHUD(); if (S.gauge >= 100) winStage(); },
    stage: function (i) { enterStage(i, 0); },
    start: function () { startRun(); },
    go: beginPlay,
    skipTemptIn: function () { S.temptIn = 0; },
    takeTempt: takeTemptation,
    setLeft: function (v) { S.left = v; syncHUD(); },
    three: function () { return window.Slack3D ? Slack3D.status() : null; },
    /* ② 승진 · 상점 · 새 상사 패턴 */
    shop: function () { return window.SHOP ? SHOP.status() : null; },
    openShop: function () {
      if (!window.SHOP) return false;
      SHOP.onClose = function () { if (S.mode === 'title') showTitle(); };
      SHOP.open(E.overlay);
      return SHOP.isOpen();
    },
    closeShop: function () { if (window.SHOP) SHOP.close(); },
    buy: function (id) { return window.SHOP ? SHOP.buy(id) : null; },
    coins: function (n, cleared) { return window.SHOP ? SHOP.earn(n || 0, !!cleared) : null; },
    shopReset: function () { return window.SHOP ? SHOP.reset() : null; },
    reward: function () { return S.rewarded; },
    claim: function (cleared) { return award(S.stats || snapshotStats('clear'), cleared !== false); },
    coffee: beginCoffee,
    stealth: function (d) { beginWarn(d || 1.6, false, 'stealth'); },
    rush: function (d) { beginWarn(d || 0.7, true, 'rush'); },
    reveal: revealStealth,
    boss: function () {
      return { phase: S.phase, mode: S.warnMode, blind: +S.warnBlind.toFixed(2), dur: +S.warnDur.toFixed(2), left: +S.warnLeft.toFixed(2), checker: S.checker };
    },
    tick: function (dt) {
      if (S.mode === 'playing') update(Math.max(0.001, Math.min(0.5, dt || 0.1)));
      return S.phase;
    },
    /* ① 성적표 · ② 도발 · ③ 오늘의 챌린지 · ④ 칭호 도감 */
    viral: function () {
      return window.VIRAL ? {
        vs: VIRAL.VS, daily: VIRAL.DAILY.info(), titles: VIRAL.TITLES.status(),
        modal: VIRAL.isModalOpen(), name: VIRAL.myName(), cardLen: (VIRAL.lastCard() || '').length
      } : null;
    },
    dailyInfo: function (d) { return window.VIRAL ? VIRAL.DAILY.info(d) : null; },
    daily: showChallenge,
    startDaily: function (d) { startChallenge(d); return S.challenge; },
    events: function () { return S.events.slice(); },
    openTitles: function () { if (window.VIRAL) VIRAL.openTitles(); return window.VIRAL ? VIRAL.TITLES.status() : null; },
    openDare: function (n) { if (window.VIRAL) VIRAL.openDare(n); },
    closeModal: function () { if (window.VIRAL) VIRAL.closeModal(); },
    card: function (kind) { openCard(kind || 'clear'); return window.VIRAL ? (VIRAL.lastCard() || '').length : 0; },
    note: function (ev, v) { return window.VIRAL ? VIRAL.TITLES.note(ev, v) : null; },
    setScore: function (v) { S.score = v; syncHUD(); },
    pause: function () { S.paused = true; },
    resume: function () { S.paused = false; },
    vsBreak: vsBeaten,
    pin: function (id) { return window.VIRAL ? VIRAL.TITLES.pin(id) : false; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
