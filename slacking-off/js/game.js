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
      story: [{ who: 'jambujang', line: '월요일 17:05. 첫 출근 첫날부터 복도에서 발소리가 들린다…' },
              { who: 'jamintern', line: '선배님, 저 오늘 6시에 진짜 갈 수 있는 거예요?' }],
      rules: ['부장님이 오면 <b>[일하는 척!]을 꾹</b> — 놓으면 바로 딴짓으로 돌아간다.',
        '딴짓 중에 걸리면 <b>즉시 발각</b>. 18:00까지 게이지 <b>100%</b>를 못 채우면 야근.']
    },
    {
      id: 'tue', day: '화요일', name: '잼부장 커피 급복귀', tag: '보통', pips: 2,
      secs: 48, warn: 1.5, gap: [5.2, 7.8], turnback: 0.2, double: 0, coffee: true,
      temptation: false, suspicion: false, bosses: ['jambujang'],
      slack: 'chat', file: '화요일_주간보고_모음_최종.xlsx', url: 'talk.jam.co.kr/딴짓방',
      desc: '단톡방 알림이 쏟아진다. 부장님은 커피 타러 갔다… 생각보다 빨리 돌아온다.',
      story: [{ who: 'jamdaeri', line: '단톡방 터졌어 ㅋㅋ 부장님 커피 타러 감! 지금이야' },
              { who: 'jambujang', line: '…잠깐 탕비실 다녀오지.' }],
      rules: ['<b>💬 메신저 버블</b>을 터뜨리면 게이지가 오른다. 버블은 계속 올라온다.',
        '부장님이 <b>커피 타러 간 틈</b>이 기회. 그런데 <b>급복귀</b>하면 경고가 아주 짧다.']
    },
    {
      id: 'wed', day: '수요일', name: '잼대리 유혹 공작', tag: '보통', pips: 2,
      secs: 46, warn: 1.3, gap: [5.4, 8.0], turnback: 0.45, double: 0,
      temptation: true, suspicion: false, bosses: ['jambujang'],
      slack: 'chart', file: '수요일_주간보고_진짜마지막_v7_최종.xlsx', url: 'coinchart.io/BTC',
      desc: '잼대리가 옆에서 차트를 켜 준다. 그리고 부장님이 지나간 척하다 돌아본다.',
      story: [{ who: 'jamdaeri', line: '코인 지금 급등 중인데? 한 번만 단타 쳐 봐 👀' },
              { who: 'jambujang', line: '흠… 누가 주식을 하나…' }],
      rules: ['① 탭 = <b>매수(진입)</b> → 가격이 <b>익절 존</b>까지 급등했을 때 ② 다시 탭 = <b>고점 매도(익절)</b>.',
        '익절 존 매도는 게이지·콤보 <b>대폭 상승</b>. 저점 매도·손절도 소폭은 오른다. 위장 중엔 차트가 <b>정지</b>.']
    },
    {
      id: 'thu', day: '목요일', name: '잼사장 뒤에서 접근', tag: '어려움', pips: 3,
      secs: 50, warn: 1.6, gap: [5.6, 8.2], turnback: 0.4, double: 0.15, stealth: 0.42,
      temptation: false, suspicion: false, bosses: ['jambujang', 'jamsajang'],
      slack: 'video', file: '목요일_임원보고_초안_진짜.xlsx', url: 'youtube.com/shorts',
      desc: '숏폼이 자동 재생된다. 그런데 발소리도 없이 등 뒤로 누가 다가온다.',
      story: [{ who: 'jamdaeri', line: '이거 3초만 보려다… 다음 영상이 안 멈춰 ㅋㅋ' },
              { who: 'jamsajang', line: '뒤에서 한참 봤네. …뭐 하고 있나.' }],
      rules: ['화면을 <b>위로 스와이프</b>(데스크톱은 <b>↑ / W</b>)해서 숏폼을 계속 넘긴다.',
        '<b>뒤에서 소리 없이 접근</b> — 발소리·경고가 <b>한 박자 늦게</b> 뜬다. 늦으면 발각.']
    },
    {
      id: 'fri', day: '금요일', name: '부장님 + 사장님 더블 체크', tag: '어려움', pips: 3,
      secs: 52, warn: 1.05, gap: [4.6, 7.2], turnback: 0.5, double: 0.4,
      temptation: true, suspicion: true, bosses: ['jambujang', 'jamsajang'],
      slack: 'shop', file: '금요일_임원보고_이게진짜최종.xlsx', url: 'hotdeal.shop/타임딜',
      desc: '부장님과 사장님이 번갈아 온다. 경고가 짧고, 일만 하면 의심도가 찬다.',
      story: [{ who: 'jambujang', line: '금요일 17:05. 이번 주도 여기서 끝내야지.' },
              { who: 'jamsajang', line: '사장도 오늘은 늦게 들어간다네. 큰 그림을 봐야지.' }],
      rules: ['경고가 <b>1초</b> 남짓. 화면을 보고 <b>먼저</b> 눌러야 한다.',
        '일하는 척만 오래 하면 <b>의심도</b>가 차서 <b>기습 점검</b>이 날아온다.']
    },
    {
      id: 'sat', day: '토요일', name: '주말근무 (특근)', tag: '특근', pips: 3,
      secs: 56, warn: 0.95, gap: [4.2, 6.6], turnback: 0.55, double: 0.62, coop: true,
      temptation: false, suspicion: true, coinMul: 2, bosses: ['jambujang', 'jamsajang'],
      slack: 'sat', file: '토요일_특근보고_이게진짜최종.xlsx', url: 'weekend.shop/타임딜',
      desc: '토요일에 출근했는데 부장님도 사장님도 나오셨다! 두 사람이 번갈아, 때로는 같이 들이닥친다.',
      story: [{ who: 'jambujang', line: '토요일 특근인데 부장님이랑 사장님까지 출근하셨다...' },
              { who: 'jamsajang', line: '"주말에도 회사는 돌아가야지." …감시가 두 겹이다.' }],
      rules: ['잼부장·잼사장이 <b>교차·합동</b>으로 감시한다. 경고가 짧고 <b>의심도</b>까지 찬다.',
        '딴짓은 <b>10초마다 교체</b>(주말 올스타전). 클리어하면 <b>루팡 코인 2배</b>!']
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
    warnSeenAt: -9, warnNeedReact: false, events: [],
    /* 컷신·주말 올스타전·메뉴 */
    cutSeen: {}, cutSkip: null, cutTimer: 0, curMini: 'jump', satGameIn: 10, quitOpen: false
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
    E.menuBtn = $('menuBtn');
    E.coinHud = $('coinHud');
    E.chPrice = $('chPrice');
    E.chRet = $('chRet');
    E.chTip = $('chTip');

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

    /* 🏠 플레이 중이든 결과 화면이든 언제든 메뉴로 */
    if (E.menuBtn) E.menuBtn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      SFX.click();
      requestMenu();
    });

    var sw = { on: false, x0: 0, y0: 0, t0: 0, hintAt: -9 };
    E.monitor.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.tempt')) return;
      e.preventDefault();
      if (S.mode === 'playing' && isSwipeStage()) {
        sw.on = true; sw.x0 = e.clientX; sw.y0 = e.clientY; sw.t0 = Date.now();
        try { E.monitor.setPointerCapture(e.pointerId); } catch (err) {}
        return;
      }
      var rect = E.monitor.getBoundingClientRect();
      slackTap(e.clientX - rect.left, e.clientY - rect.top, e.clientX, e.clientY);
    });
    /* 목요일 숏폼: 위로 끌어 넘기기 (연속 스와이프 허용) */
    E.monitor.addEventListener('pointermove', function (e) {
      if (!sw.on || S.mode !== 'playing' || !isSwipeStage()) return;
      if (sw.y0 - e.clientY >= 44) {
        sw.y0 = e.clientY; sw.x0 = e.clientX;
        slackSwipe();
      }
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      E.monitor.addEventListener(ev, function (e) {
        if (!sw.on) return;
        sw.on = false;
        if (S.mode !== 'playing' || !isSwipeStage()) return;
        var dy = Math.abs(sw.y0 - (e.clientY || sw.y0));
        if (dy < 18 && now() - sw.hintAt > 2.4) {
          sw.hintAt = now();
          toast('☝️ 화면을 위로 스와이프! (데스크톱 ↑ / W)', 1600);
        }
      });
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
      if (window.SHOP && SHOP.isOpen()) return;
      if (window.VIRAL && VIRAL.isModalOpen()) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (e.repeat) return;
        if (S.mode === 'playing') startWork();
        else if (S.mode === 'title' || S.mode === 'intro') advance();
        else if (S.mode === 'cut' && S.cutSkip) S.cutSkip();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (S.mode !== 'playing' || !isSwipeStage()) return;
        e.preventDefault();
        if (e.repeat) return;
        slackSwipe();
      } else if (e.code === 'Escape') {
        if (S.mode === 'playing' || S.mode === 'intro' || S.mode === 'cut') requestMenu();
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

  /* ---------------- 🏠 메뉴(타이틀) 복귀 ---------------- */
  function requestMenu() {
    if (S.mode === 'title') return;
    if (S.mode === 'playing' && !S.quitOpen) { showQuitConfirm(); return; }
    hardExit();
  }

  function showQuitConfirm() {
    S.paused = true;
    S.quitOpen = true;
    try { bgmMode('calm'); } catch (e) {}
    overlay(
      '<div class="ov-inner">' +
        '<span class="ov-tag">잠깐 멈춤</span>' +
        '<h2 class="ov-title sm">메뉴로 나갈까요?</h2>' +
        '<p class="ov-sub">이번 판 기록은 저장되지 않아요.<br>타이머·BGM·3D 연출은 바로 정지됩니다.</p>' +
        '<div class="ov-actions">' +
          '<button class="cta" id="stayBtn" type="button">계속하기</button>' +
          '<button class="cta ghost" id="quitBtn" type="button">🏠 메뉴로 나가기</button>' +
        '</div>' +
      '</div>'
    );
    $('stayBtn').addEventListener('click', function () {
      SFX.click();
      S.quitOpen = false;
      S.paused = false;
      hideOverlay();
      lastTs = 0;
      syncHUD();
    });
    $('quitBtn').addEventListener('click', function () { SFX.click(); S.quitOpen = false; hardExit(); });
  }

  /* 타이머·BGM·미니게임 3D·모달을 모두 정리하고 타이틀へ */
  function hardExit() {
    clearCutTimer();
    S.quitOpen = false;
    S.paused = false;
    S.holding = false;
    S.work = false;
    S.locked = 0;
    S.combo = 0;
    S.phase = 'idle';
    try { endWork(); } catch (e) {}
    bgmStop();
    try { if (window.ExcuseChance && ExcuseChance.isOpen()) ExcuseChance.reset(); } catch (e) {}
    try { hideTempt(true); } catch (e) {}
    try { if (window.VIRAL && VIRAL.isModalOpen()) VIRAL.closeModal(); } catch (e) {}
    try { if (window.SHOP && SHOP.isOpen()) SHOP.close(); } catch (e) {}
    E.overlay.classList.remove('cine-ov', 'ec');
    E.monitor.classList.remove('shake');
    E.monitor.dataset.mode = 'slack';
    E.cam.classList.remove('on');
    E.app.classList.remove('tense');
    if (E.toast) E.toast.hidden = true;
    if (window.Slack3D) {
      try {
        Slack3D.setFrozen(false);
        Slack3D.setMiniActive(false);
        Slack3D.cineOff();
        Slack3D.release();
      } catch (e) {}
    }
    showTitle();
  }

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
    S.paused = false;
    bgmStop();
    if (window.Slack3D) { Slack3D.setActive(true); Slack3D.setMiniActive(true); Slack3D.cineOff(); Slack3D.setFrozen(false); }
    E.app.classList.remove('tense');
    E.stageChip.textContent = '월요일';
    if (E.menuBtn) E.menuBtn.hidden = true;
    if (E.coinHud) E.coinHud.hidden = true;
    resetBossVisual();
    S.challenge = null; S.dailyRec = null;
    updateVsStrip();
    var days = '';
    for (var i = 0; i < STAGES.length; i++) {
      days += stageRow(STAGES[i].day, STAGES[i].name, STAGES[i].pips, STAGES[i].tag, i);
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
        '<p class="ov-sub">부장님 눈을 피해 <b>딴짓 게이지 100%</b>를 채우고,<br>6시 정각에 사라져라. 주말 특근까지 6일 생존기.</p>' +
        '<div class="how">' +
          '<div class="how-i"><b>👆</b><span>모니터 연타<small>딴짓 게이지 UP</small></span></div>' +
          '<div class="how-i"><b>💼</b><span>일하는 척 꾹<small>부장님 눈 피하기</small></span></div>' +
          '<div class="how-i"><b>🛒</b><span>장비·승진<small>코인으로 강해지기</small></span></div>' +
        '</div>' +
        '<div class="ov-stage-list day5 day6">' + days + '</div>' +
        virRow +
        '<div class="cta-row">' +
          '<button class="cta ghost shop-btn" id="shopBtn" type="button">🛒 장비 상점</button>' +
          '<button class="cta" id="startBtn" type="button">출근하기</button>' +
        '</div>' +
        '<p class="ov-tiny">모니터 연타 = 딴짓 · 「일하는 척!」 꾹 = 위장 (Space)</p>' +
      '</div>'
    );
    $('startBtn').addEventListener('click', function () { SFX.click(); startRun(); });
    var rowBtns = E.overlay.querySelectorAll('[data-stage]');
    for (var ri = 0; ri < rowBtns.length; ri++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          SFX.click();
          var si = parseInt(btn.getAttribute('data-stage'), 10) || 0;
          S.challenge = null; S.dailyRec = null; S.vsHit = false; S.score = 0;
          runLog = [];
          enterStage(si, 0);
        });
      })(rowBtns[ri]);
    }
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
      Slack3D.setMiniActive(false);
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
  function stageRow(day, name, pips, tag, idx) {
    var p = '';
    for (var i = 0; i < 3; i++) p += '<i class="' + (i < pips ? 'on' : '') + '"></i>';
    var inner = '<span class="d">' + day + '</span><span class="n">' + name + '</span>' +
      '<span class="p">' + tag + ' ' + p + '</span>';
    if (idx == null) return '<div class="ov-stage">' + inner + '</div>';
    var sat = idx === STAGES.length - 1;
    return '<button type="button" class="ov-stage has-go' + (sat ? ' sat' : '') + '" data-stage="' + idx + '">' +
      inner + '</button>';
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
    syncHUD();
    /* 스토리 인트로 컷(스테이지당 1회) → 규칙 카드 → 출근! */
    if (!S.cutSeen[i]) showIntroCut(showStageRules);
    else showStageRules();
  }

  function showStageRules() {
    var cfg = S.cfg;
    S.mode = 'intro';
    var ruleRows = cfg.rules.map(function (r) {
      return '<div class="ov-stage"><span class="n" style="white-space:normal;line-height:1.45">' + r + '</span></div>';
    }).join('');
    var tip = cfg.slack === 'chart' ? '탭 = 매수 → 익절 존에서 다시 탭 = 매도 · 「일하는 척!」 꾹 = 위장'
      : cfg.slack === 'video' ? '↑로 스와이프 = 숏폼 넘기기 · 「일하는 척!」 꾹 = 위장'
        : cfg.slack === 'sat' ? '탭 = 딴짓(10초마다 교체) · 「일하는 척!」 꾹 = 위장'
          : '모니터 연타 = 게이지 UP · 「일하는 척!」 꾹 = 위장';
    overlay(
      '<div class="ov-inner">' +
        '<span class="ov-tag">' + cfg.day + ' · 17:05</span>' +
        '<h2 class="ov-title sm">' + cfg.name + '</h2>' +
        '<p class="ov-sub">' + cfg.desc + '</p>' +
        '<div class="goal-row">' +
          '<span class="goal-chip">🎯 딴짓 100%</span>' +
          '<span class="goal-chip">⏱ ' + cfg.secs + '초</span>' +
          '<span class="goal-chip">' + (cfg.coinMul ? '💰 클리어 코인 ×' + cfg.coinMul : cfg.suspicion ? '👁 의심도 주의' : cfg.temptation ? '🍗 유혹 주의' : '👀 순찰 주의') + '</span>' +
        '</div>' +
        '<div class="ov-stage-list">' + ruleRows + '</div>' +
        '<button class="cta" id="goBtn" type="button">출근! </button>' +
        '<button class="cta ghost" id="backMenuBtn" type="button">🏠 메뉴로 돌아가기</button>' +
        '<p class="ov-tiny">' + tip + '</p>' +
      '</div>'
    );
    $('goBtn').addEventListener('click', function () { SFX.click(); beginPlay(); });
    $('backMenuBtn').addEventListener('click', function () { SFX.click(); hardExit(); });
    syncHUD();
  }

  /* ---------------- 스토리 인트로 컷 (건너뛰기 가능) ---------------- */
  function clearCutTimer() {
    if (S.cutTimer) {
      if (S.cutTimer.length) {
        for (var i = 0; i < S.cutTimer.length; i++) clearTimeout(S.cutTimer[i]);
      } else clearTimeout(S.cutTimer);
      S.cutTimer = 0;
    }
    S.cutSkip = null;
  }

  function showIntroCut(done) {
    var cfg = S.cfg;
    var lines = (cfg.story && cfg.story.length) ? cfg.story : [{ who: cfg.bosses[0], line: cfg.desc }];
    S.mode = 'cut';
    S.cutSeen[S.stage] = true;
    bgmStop();
    var shot = '';
    try {
      Slack3D.begin(cfg.bosses);
      Slack3D.setStage(cfg.slack === 'sat' ? S.curMini : cfg.slack);
      Slack3D.setActive(true);
      Slack3D.setMiniActive(true);
      shot = Slack3D.cineShot('intro');
      Slack3D.cine('intro', 1.9);
    } catch (err) {}
    try { SFX.story(); } catch (err) {}
    var first = lines[0];
    var who = CAST[first.who] || CAST.jambujang;
    overlay(
      '<div class="cine" id="cineWrap">' +
        (shot ? '<img class="cine-img" src="' + shot + '" alt="스토리 인트로 3D 컷">' : '<div class="cine-ph">🎬</div>') +
        '<div class="cine-vig"></div>' +
        '<span class="cine-day">' + cfg.day + ' · 17:05</span>' +
        '<div class="cine-cap" id="cineCap"><b id="cineWho" style="color:' + who.color + '">' + who.name + '</b>' +
          '<p id="cineLine">' + esc(first.line) + '</p></div>' +
        '<button class="cine-skip" id="cineSkip" type="button">건너뛰기 ›</button>' +
      '</div>'
    );
    E.overlay.classList.add('cine-ov');
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      clearCutTimer();
      E.overlay.classList.remove('cine-ov');
      done();
    }
    S.cutSkip = finish;
    var capEl = $('cineLine'), whoEl = $('cineWho');
    var timers = [];
    if (lines.length > 1) {
      timers.push(setTimeout(function () {
        if (finished) return;
        var nx = lines[1], nw = CAST[nx.who] || CAST.jambujang;
        if (whoEl) { whoEl.textContent = nw.name; whoEl.style.color = nw.color; }
        if (capEl) capEl.textContent = nx.line;
        var cap = $('cineCap');
        if (cap) { cap.style.animation = 'none'; void cap.offsetWidth; cap.style.animation = ''; }
      }, 950));
    }
    timers.push(setTimeout(finish, 2080));
    S.cutTimer = timers;
    var skip = $('cineSkip');
    if (skip) skip.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); finish(); });
    var wrap = $('cineWrap');
    if (wrap) wrap.addEventListener('click', function () { finish(); });
  }

  function beginPlay() {
    clearCutTimer();
    hideOverlay();
    E.overlay.classList.remove('cine-ov');
    S.mode = 'playing';
    S.paused = false;
    S.grace = 0.9;
    lastTs = 0;
    if (E.menuBtn) E.menuBtn.hidden = false;
    E.app.classList.remove('tense');
    setAlert('calm', S.challenge ? '📅 오늘의 챌린지 · 모두 같은 순찰' : '평온 · 부장님은 자리에…');
    if (S.challenge) E.stageChip.textContent = '📅 챌린지';
    updateVsStrip();
    bgmPlay('calm');
    Slack3D.begin(S.cfg.bosses);
    Slack3D.setStage(S.cfg.slack === 'sat' ? S.curMini : S.cfg.slack);
    Slack3D.setFrozen(false);
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
    S.curMini = cfg.slack === 'sat' ? SAT_GAMES[0] : cfg.slack;
    S.satGameIn = 9.5;
    if (window.Slack3D) { Slack3D.setFrozen(false); }
    if (E.menuBtn) E.menuBtn.hidden = false;
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

  var SAT_GAMES = ['jump', 'shop', 'chat'];
  var MINI_LABEL = { jump: '🍪 미니 블록', chart: '🪙 코인 단타', chat: '💬 사내 메신저', video: '📱 몰래 숏폼', shop: '🛒 핫딜 쇼핑' };

  function prepareStageVisual() {
    var kind = S.cfg.slack === 'sat' ? S.curMini : S.cfg.slack;
    if (kind === 'jump') buildJump();
    else if (kind === 'chart') buildChart();
    else if (kind === 'chat') buildChat();
    else if (kind === 'video') buildVideo();
    else buildShop();
    if (E.miniLabel) E.miniLabel.textContent = MINI_LABEL[kind] || kind;
    E.slackView.hidden = false;
    E.eatView.hidden = true;
    E.excelView.hidden = true;
    E.monitor.dataset.mode = 'slack';
    E.cam.classList.remove('on');
    if (E.coinHud) E.coinHud.hidden = kind !== 'chart';
    if (E.officeDay) E.officeDay.textContent = S.cfg.day;
    Slack3D.setStage(kind);
    Slack3D.setMiniActive(true);
  }

  /* 토요일: 10초마다 딴짓 교체(주말 올스타전) */
  function cycleSatGame() {
    var i = SAT_GAMES.indexOf(S.curMini);
    S.curMini = SAT_GAMES[(i + 1) % SAT_GAMES.length];
    if (E.miniLabel) E.miniLabel.textContent = MINI_LABEL[S.curMini];
    Slack3D.setStage(S.curMini);
    Slack3D.setMiniActive(true);
    if (E.coinHud) E.coinHud.hidden = true;
    try { SFX.earn(); } catch (e) {}
    toast('🎲 주말 올스타전 · ' + MINI_LABEL[S.curMini], 1500);
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

    // 콤보 감쇠 (코인 단타는 매도 간격이 길어 여유를 둔다)
    if (S.combo > 0 && S.t - S.comboAt > (S.cfg.slack === 'chart' ? 4.6 : 1.35)) S.combo = 0;

    // 토요일 주말 올스타전: 시간이 지나면 딴짓이 바뀐다
    if (S.cfg.slack === 'sat') {
      S.satGameIn -= dt;
      if (S.satGameIn <= 0) {
        S.satGameIn = 9.5;
        if (S.phase === 'idle') cycleSatGame();
      }
    }

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
    /* 토요일: 잼부장·잼사장 합동 감시 — 두 사람이 동시에 문 앞에 */
    if (cfg.coop && window.Slack3D && BR() < 0.5) {
      var other = cfg.bosses[0] === S.checker ? cfg.bosses[1] : cfg.bosses[0];
      if (other) {
        try { Slack3D.secondMark(other, true); } catch (e) {}
        toast('😱 부장님과 사장님이 함께 온다!', 1400);
      }
    }
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
    if (window.Slack3D) { Slack3D.setFrozen(false); Slack3D.caught(); Slack3D.setMiniActive(false); }
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
    if (window.Slack3D) { Slack3D.setMiniActive(false); Slack3D.setFrozen(false); }
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
    if (window.Slack3D) { Slack3D.setMiniActive(false); Slack3D.setFrozen(false); }
    Bubble.say(S.checker, 'clear', 3200);
    S.stats = snapshotStats('clear');
    if (window.VIRAL) {
      VIRAL.TITLES.note('clear');
      VIRAL.TITLES.note('combo', S.bestCombo);
      if (S.cfg.id === 'sat') VIRAL.TITLES.note('weekend');
    }
    if (S.cfg.id === 'sat') toast('💰 주말 특근 클리어 · 루팡 코인 2배!', 2400);
    S.score += 300 + Math.round(S.left * 8) + S.bestCombo * 10;
    runLog.push({ id: S.cfg.id, day: S.cfg.day, score: S.score - S.baseScore, gauge: Math.round(S.gauge), combo: S.bestCombo });
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
    var base = SHOP.coinsFor(st, cleared);
    var mul = (S.cfg && S.cfg.coinMul) || 1;
    S.rewarded = SHOP.earn(base * mul, cleared);
    S.rewarded.base = base;
    S.rewarded.mul = mul;
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
      (r.mul > 1 ? '<span class="rw-mul">주말 특근 ×' + r.mul + '</span>' : '') +
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
  function floatText(t, rx, ry) {
    if (!E.monitor) return;
    floater(t, E.monitor.clientWidth * rx, E.monitor.clientHeight * ry);
  }
  function coinWon(p) {
    return '₩ ' + Math.round(62480000 * p).toLocaleString('ko-KR');
  }

  function basicTap() {
    S.combo++;
    S.comboAt = S.t;
    S.bestCombo = Math.max(S.bestCombo, S.combo);
    var gain = (0.7 + Math.min(S.combo, 15) * 0.055) * (window.SHOP ? SHOP.gainMul() : 1);
    S.gauge = Math.min(100, S.gauge + gain);
    S.score += 8 + Math.min(S.combo, 15) * 2;
    S.taps++;
    SFX.tap(S.combo);
    miniTap();
    floatText('+' + gain.toFixed(1), 0.5, 0.42);
    syncHUD();
    if (S.gauge >= 100) winStage();
  }

  function slackTap(x, y, pageX, pageY) {
    if (S.mode !== 'playing') return;
    if (S.work || S.locked > 0) return;
    if (S.curMini === 'chart') { coinTapAction(); return; }
    basicTap();
  }

  /* ---------------- 수요일: 코인 단타 (탭 1번 = 매수, 고점 탭 = 매도) ---------------- */
  function coinTapAction() {
    var r = null;
    try { r = Slack3D.coinTap(); } catch (e) {}
    if (!r || r.act === 'none') { basicTap(); return; }
    if (r.act === 'buy') {
      S.taps++;
      try { SFX.coinBuy(); } catch (e) {}
      floatText('매수 ' + coinWon(r.entry), 0.5, 0.34);
      toast('🟢 매수 진입 · 급등하면 다시 탭 = 고점 매도', 1400);
      syncHUD();
      return;
    }
    var ret = r.ret || 0;
    var q = r.quality;
    var gain, add;
    if (q === 'tp') { gain = 7.4 + Math.min(4, Math.max(0, ret * 100)) * 0.9; add = 140; }
    else if (q === 'up') { gain = 3.4; add = 70; }
    else if (q === 'flat') { gain = 1.5; add = 20; }
    else if (q === 'fast') { gain = 0.6; add = 8; }
    else { gain = 1.0; add = 10; }
    gain *= (window.SHOP ? SHOP.gainMul() : 1);
    if (q === 'tp' || q === 'up') {
      S.combo++;
      S.comboAt = S.t;
      S.bestCombo = Math.max(S.bestCombo, S.combo);
    } else if (q === 'loss' || q === 'fast') S.combo = 0;
    else S.comboAt = S.t;
    S.gauge = Math.min(100, S.gauge + gain);
    S.score += add + Math.min(S.combo, 15) * 4;
    S.taps++;
    var pct = (ret >= 0 ? '+' : '') + (ret * 100).toFixed(2) + '%';
    if (q === 'tp') {
      try { SFX.coinWin(); } catch (e) {}
      flash('rgba(255,90,110,.28)', 240);
      floatText('익절 ' + pct + ' 🎯', 0.5, 0.34);
      toast('🎯 고점 매도! ' + pct + ' · 콤보 ' + S.combo + ' · 게이지 +' + gain.toFixed(1), 1600);
    } else if (q === 'up') {
      try { SFX.earn(); } catch (e) {}
      floatText('매도 ' + pct, 0.5, 0.34);
    } else if (q === 'flat') {
      try { SFX.click(); } catch (e) {}
      floatText('매도 ' + pct, 0.5, 0.34);
    } else if (q === 'fast') {
      try { SFX.tick(); } catch (e) {}
      toast('너무 성급한 매도! 조끔 더 버텨 봐', 1300);
    } else {
      try { SFX.coinLoss(); } catch (e) {}
      floatText('손절 ' + pct, 0.5, 0.34);
      toast('📉 손절 ' + pct + ' — 다음 급등을 노려', 1500);
    }
    syncHUD();
    if (S.gauge >= 100) winStage();
  }

  /* ---------------- 목요일: 숏폼 위로 스와이프 ---------------- */
  function isSwipeStage() {
    return S.mode === 'playing' && S.curMini === 'video';
  }
  function cfgSat() {
    return !!(S.cfg && S.cfg.slack === 'sat');
  }

  function slackSwipe() {
    if (S.mode !== 'playing') return;
    if (S.work || S.locked > 0) return;
    if (S.curMini !== 'video') { basicTap(); return; }
    S.combo++;
    S.comboAt = S.t;
    S.bestCombo = Math.max(S.bestCombo, S.combo);
    var gain = (2.15 + Math.min(S.combo, 15) * 0.1) * (window.SHOP ? SHOP.gainMul() : 1);
    S.gauge = Math.min(100, S.gauge + gain);
    S.score += 14 + Math.min(S.combo, 15) * 3;
    S.taps++;
    try { SFX.swipe(); } catch (e) {}
    try { Slack3D.swipe(); } catch (e) {}
    if (E.miniScore) E.miniScore.textContent = S.taps + '편';
    floatText('+' + gain.toFixed(1), 0.5, 0.3);
    if (S.combo >= 8) toast('⚡ 콤보 ' + S.combo + ' · 손가락이 미끌린다', 900);
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
    if (window.Slack3D) { try { Slack3D.setFrozen(!!on); } catch (e) {} }
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
    var kind = S.curMini;
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
    syncCoinHud();
  }

  /* 수요일 코인 단타 HUD (가격·수익률·포지션) */
  function syncCoinHud() {
    var on = S.mode === 'playing' && S.curMini === 'chart';
    if (E.coinHud) {
      E.coinHud.hidden = !on;
      if (on && E.monitor) {
        var wide = (E.monitor.clientWidth / Math.max(1, E.monitor.clientHeight)) > 1.55;
        E.coinHud.classList.toggle('wide', wide);
      }
    }
    if (!on) return;
    var st = null;
    try { st = Slack3D.coinState(); } catch (e) {}
    if (!st) return;
    if (E.chPrice) E.chPrice.textContent = coinWon(st.price);
    var pct = st.pos ? (st.price / st.entry - 1) * 100 : 0;
    var hide = !!S.work;
    if (E.chRet) {
      E.chRet.textContent = hide ? '⏸ 위장'
        : st.pos ? (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%' : '관망';
      E.chRet.className = 'ch-ret' + (st.pos && !hide ? (pct >= 1.2 ? ' tp' : pct >= 0 ? ' win' : ' lose') : '');
    }
    if (E.chTip) {
      E.chTip.textContent = hide ? '⏸ 위장 중 · 차트/포지션 정지'
        : st.pos ? (pct >= 1.2 ? '🎯 익절 존! 지금 다시 탭 = 매도' : '고점(익절 존)에서 다시 탭 = 매도')
          : '탭 = 매수(진입) · 빨간 불기둥을 보고 타이밍';
    }
    if (E.miniScore) E.miniScore.textContent = st.pos ? '보유' : '관망';
  }

  function updateHint() {
    var h, cls = '';
    if (S.locked > 0) { h = '🍗 먹방 중… 이 1.5초엔 위장도 못 한다!'; cls = 'hot'; }
    else if (S.phase === 'warn' || S.phase === 'feint') {
      if (!S.work) { h = '지금이다! 「일하는 척!」을 꾹 누르세요'; cls = 'hot'; }
      else if (S.acting < 55) { h = '척도가 부족해! 조금만 더 버텨…'; cls = 'hot'; }
      else { h = '좋아, 그대로 버텨… 타자 소리만 들리게'; cls = 'good'; }
    } else if (S.work) { h = '타자 소리로 위장 중 · 손 떼면 바로 딴짓 복귀'; cls = 'good'; }
    else if (S.curMini === 'chart') { h = '탭 = 매수 · 익절 존(빨간 구역)에서 다시 탭 = 매도'; cls = 'hot'; }
    else if (S.curMini === 'video') { h = '↙ 화면을 위로 스와이프 = 다음 숏폼 (↑ / W)'; cls = 'hot'; }
    else if (cfgSat()) { h = '주말 올스타전 · 탭으로 딴짓 (10초마다 교체)'; }
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
    var weekend = !!(S.cfg && S.cfg.id === 'sat');
    var status = kind === 'clear' ? (weekend ? '주말근무 칼퇴' : '칼퇴 성공')
      : kind === 'timeout' ? (weekend ? '주말근무 야근' : '야근')
        : (weekend ? '주말근무 발각' : '발각');
    return {
      kind: kind,
      name: window.VIRAL ? VIRAL.myName() : '김인턴',
      rank: window.SHOP ? SHOP.rank().name : '인턴',
      title: t ? t.icon + ' ' + t.name : '아직 없음',
      score: S.score,
      gauge: st.gauge != null ? st.gauge : Math.round(S.gauge),
      combo: st.combo != null ? st.combo : S.bestCombo,
      day: S.cfg.day,
      status: status,
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
    S.mode = 'caught';
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
          '<button class="cta ghost" id="homeBtn" type="button">🏠 메뉴로 돌아가기</button>' +
        '</div>' +
      '</div>'
    );
    $('cardBtn').addEventListener('click', function () { SFX.click(); openCard('caught'); });
    $('retryBtn').addEventListener('click', function () { SFX.click(); enterStage(S.stage, S.baseScore); });
    $('homeBtn').addEventListener('click', function () { SFX.click(); hardExit(); });
  }

  function showTimeoutScreen() {
    var st = S.stats;
    award(st, false);
    if (window.Slack3D) Slack3D.setActive(false);
    var weekend = !!(S.cfg && S.cfg.id === 'sat');
    overlay(
      '<div class="ov-inner">' +
        '<div class="cut-emoji">🌙</div>' +
        '<span class="cut-stamp yellow">야근 당첨</span>' +
        '<h2 class="cut-title">' + (weekend ? '토요일 특근 · 해도 지고, 퇴근도 지고' : '18:00 · 해도 지고, 퇴근도 지고') + '</h2>' +
        '<p class="cut-line">일하는 척만 하다간 퇴근은 없다. 딴짓은 해야 늘어난다.</p>' +
        statsRow(st, '남은 시간') +
        challengeResult(false) +
        vsResultRow(S.score) +
        rewardRow() +
        '<div class="ov-actions">' +
          '<button class="cta ghost report-btn" id="cardBtn" type="button">📸 성적표 공유</button>' +
          '<button class="cta" id="retryBtn" type="button">다시 하기</button>' +
          '<button class="cta ghost" id="homeBtn" type="button">🏠 메뉴로 돌아가기</button>' +
        '</div>' +
      '</div>'
    );
    $('cardBtn').addEventListener('click', function () { SFX.click(); openCard('timeout'); });
    $('retryBtn').addEventListener('click', function () { SFX.click(); enterStage(S.stage, S.baseScore); });
    $('homeBtn').addEventListener('click', function () { SFX.click(); hardExit(); });
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
    var weekend = !!(S.cfg && S.cfg.id === 'sat');
    var head = weekend ? '토요일 18:00 · 주말근무 클리어'
      : last ? '18:00 · 사무실 탈출' : S.cfg.day + ' 18:00 · 사무실 탈출';
    var sub = weekend ? '토요일 특근까지 버텼다. 내일은 진짜 주말이다.'
      : '가방은 이미 쌌다. 계단으로 조용히… 내일 또 온다.';
    if (isDaily) {
      head = '오늘의 챌린지 · ' + S.cfg.day + ' 클리어';
      sub = '같은 날 모두가 같은 순찰을 겪었다. 오늘의 기록을 남겨라.';
    }
    var acts = '<button class="cta ghost report-btn" id="cardBtn" type="button">📸 성적표 공유</button>';
    if (isDaily) {
      acts += '<button class="cta" id="dailyAgain" type="button">오늘의 챌린지 다시</button>' +
        '<button class="cta ghost" id="homeBtn" type="button">🏠 메뉴로 돌아가기</button>';
    } else if (weekend) {
      acts += '<button class="cta" id="endBtn" type="button">🏆 주말 엔딩 보기</button>' +
        '<button class="cta ghost" id="retryBtn" type="button">이 날 다시 하기</button>' +
        '<button class="cta ghost" id="homeBtn" type="button">🏠 메뉴로 돌아가기</button>';
    } else if (last) {
      acts += '<button class="cta" id="endBtn" type="button">🌇 주간 엔딩 보기</button>' +
        '<button class="cta ghost" id="retryBtn" type="button">이 날 다시 하기</button>' +
        '<button class="cta ghost" id="homeBtn" type="button">🏠 메뉴로 돌아가기</button>';
    } else {
      acts += '<button class="cta" id="nextBtn" type="button">다음 날: ' + STAGES[next].day + (STAGES[next].id === 'sat' ? ' 주말근무' : '') + ' →</button>' +
        (S.cfg.id === 'fri' ? '<button class="cta ghost" id="endBtn" type="button">🌇 주간 엔딩 보기</button>' : '') +
        '<button class="cta ghost" id="retryBtn" type="button">이 날 다시 하기</button>' +
        '<button class="cta ghost" id="homeBtn" type="button">🏠 메뉴로 돌아가기</button>';
    }
    overlay(
      '<div class="ov-inner">' +
        '<div class="cut-emoji">' + (weekend ? '🌞' : '🏃‍♂️') + '</div>' +
        '<span class="cut-stamp green">' + (weekend ? '주말 탈출' : '칼퇴 성공') + '</span>' +
        '<h2 class="cut-title">' + head + '</h2>' +
        '<p class="cut-line">' + sub + '</p>' +
        '<div class="cut-stats">' +
          '<div><b>' + Math.round(S.gauge) + '%</b><small>딴짓 게이지</small></div>' +
          '<div><b>' + st.combo + '</b><small>최고 콤보</small></div>' +
          '<div><b>' + st.left + '초</b><small>남은 시간</small></div>' +
        '</div>' +
        (weekend ? '<div class="sat-bonus">💰 주말 특근 보너스 · 루팡 코인 <b>2배</b></div>' : '') +
        challengeResult(true) +
        vsResultRow(S.score) +
        rewardRow() +
        '<div class="ov-actions">' + acts + '</div>' +
      '</div>'
    );
    $('cardBtn').addEventListener('click', function () { SFX.click(); openCard('clear'); });
    if (isDaily) {
      $('dailyAgain').addEventListener('click', function () { SFX.click(); startChallenge(); });
      $('homeBtn').addEventListener('click', function () { SFX.click(); hardExit(); });
    } else {
      if (weekend || last) $('endBtn').addEventListener('click', function () { SFX.click(); showEnding(weekend ? 'weekend' : 'week'); });
      if (!weekend && !last) {
        $('nextBtn').addEventListener('click', function () { SFX.click(); enterStage(next, S.score); });
        var fx = $('endBtn');
        if (fx) fx.addEventListener('click', function () { SFX.click(); showEnding('week'); });
      }
      $('retryBtn').addEventListener('click', function () { SFX.click(); beforeRetry(); enterStage(S.stage, S.baseScore); });
      $('homeBtn').addEventListener('click', function () { SFX.click(); hardExit(); });
    }
  }

  function beforeRetry() {
    if (window.Slack3D) { Slack3D.setFrozen(false); }
    S.rewarded = null;
  }

  /* ---------------- 진짜 엔딩 컷신 (3D 카메라 줌아웃·회전 + 잼인턴 퇴근) ---------------- */
  function showEnding(kind) {
    kind = kind || ((S.cfg && S.cfg.id === 'sat') ? 'weekend' : 'week');
    S.mode = 'cut';
    bgmStop();
    if (window.VIRAL) VIRAL.TITLES.note(kind === 'weekend' ? 'weekend' : 'ending');
    var shots = [];
    try {
      Slack3D.begin(['jambujang', 'jamsajang']);
      Slack3D.setActive(true);
      Slack3D.setMiniActive(false);
      shots.push({
        img: Slack3D.cineShot('boss'), who: '잼부장', color: '#ffd24a',
        line: kind === 'weekend' ? '“…토요일까지 버텼다고?”' : '“…진짜 6시에 가는 사람이 있네.”'
      });
      shots.push({
        img: Slack3D.cineShot('end'), who: '잼인턴', color: '#ffb3c8',
        line: kind === 'weekend' ? '주말 특근까지 살아남았어요! 이제 진짜 퇴근!'
          : '선배님, 진짜 6시에 퇴근했어요?!'
      });
      Slack3D.cine('end', 2.6);
    } catch (e) {}
    try { SFX.ending(); } catch (e) {}
    if (!shots.length) { showEndingScreen(kind); return; }
    var s0 = shots[0];
    overlay(
      '<div class="cine" id="cineWrap">' +
        (s0.img ? '<img class="cine-img" id="cineImg" src="' + s0.img + '" alt="엔딩 3D 컷">' : '<div class="cine-ph">🌇</div>') +
        '<div class="cine-vig"></div>' +
        '<span class="cine-day">엔딩 · ' + (kind === 'weekend' ? '주말근무까지 완주' : '주간 완주') + '</span>' +
        '<div class="cine-cap" id="cineCap"><b id="cineWho" style="color:' + s0.color + '">' + s0.who + '</b>' +
          '<p id="cineLine">' + esc(s0.line) + '</p></div>' +
        '<button class="cine-skip" id="cineSkip" type="button">건너뛰기 ›</button>' +
      '</div>'
    );
    E.overlay.classList.add('cine-ov');
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      clearCutTimer();
      E.overlay.classList.remove('cine-ov');
      showEndingScreen(kind);
    }
    S.cutSkip = finish;
    var timers = [];
    timers.push(setTimeout(function () {
      if (finished) return;
      var s1 = shots[1] || shots[0];
      var img = $('cineImg');
      if (img && s1.img) img.src = s1.img;
      var w = $('cineWho'), l = $('cineLine');
      if (w) { w.textContent = s1.who; w.style.color = s1.color; }
      if (l) l.textContent = s1.line;
      var cap = $('cineCap');
      if (cap) { cap.style.animation = 'none'; void cap.offsetWidth; cap.style.animation = ''; }
    }, 1250));
    timers.push(setTimeout(finish, 2550));
    S.cutTimer = timers;
    var skip = $('cineSkip');
    if (skip) skip.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); finish(); });
    var wrap = $('cineWrap');
    if (wrap) wrap.addEventListener('click', function () { finish(); });
  }

  function endingRows() {
    /* 같은 요일을 다시 해도 한 줄로만 남긴다 */
    var seen = {}, list = [];
    for (var i = 0; i < runLog.length; i++) {
      var r = runLog[i], k = r.id || r.day;
      if (seen[k] != null) { list[seen[k]] = r; continue; }
      seen[k] = list.length;
      list.push(r);
    }
    return list;
  }
  function endingRowHTML() {
    return endingRows().map(function (r) {
      return '<div class="ov-stage"><span class="d">' + r.day + '</span><span class="n">딴짓 ' + r.gauge + '% · 콤보 ' + r.combo + '</span><span class="p">' + r.score + '점</span></div>';
    }).join('');
  }

  function showEndingScreen(kind) {
    S.mode = 'ending';
    var weekend = kind === 'weekend';
    var rowsData = endingRows();
    var days = rowsData.length || (weekend ? 6 : 5);
    var total = S.score;
    var avg = total / Math.max(1, days);
    var rank = avg >= 840 ? 'S' : avg >= 640 ? 'A' : avg >= 440 ? 'B' : 'C';
    var coins = window.SHOP ? SHOP.status().totalCoins : 0;
    overlay(
      '<div class="ov-inner ending">' +
        '<div class="cut-emoji">' + (weekend ? '🌞🏆' : '🌇') + '</div>' +
        '<span class="cut-stamp yellow">' + (weekend ? '6일 특근 생존' : '5일 연속 칼퇴') + '</span>' +
        '<h2 class="cut-title">' + (weekend ? '토요일 특근까지 끝냈다.<br>이제 진짜 주말이다.' : '주말이 왔다.<br>이번 주도 살아남았다.') + '</h2>' +
        '<p class="cut-line">' + (weekend
          ? '잼부장: “주말에도 회사는 돌아가야지…”<br>잼인턴: “선배님, 주말엔 진짜 쉬어요!”'
          : '잼부장: “…칼퇴? 나 때는 말이야…”<br>잼인턴: “선배님 진짜 칼퇴했어요?!”') + '</p>' +
        '<div class="ov-stage-list">' + endingRowHTML() + '</div>' +
        '<div class="cut-stats">' +
          '<div><b>' + rank + '</b><small>등급</small></div>' +
          '<div><b>' + total.toLocaleString('ko-KR') + '</b><small>총점</small></div>' +
          '<div><b>' + bestComboRun() + '</b><small>최고 콤보</small></div>' +
        '</div>' +
        '<div class="ending-sum">' +
          '<div><b>' + (window.SHOP ? SHOP.rank().emoji + ' ' + SHOP.rank().name : '인턴') + '</b><small>최종 직급</small></div>' +
          '<div><b>₩ ' + coins.toLocaleString('ko-KR') + '</b><small>총 루팡 코인</small></div>' +
          '<div><b>' + days + '일</b><small>생존 기록</small></div>' +
        '</div>' +
        '<div class="ov-actions">' +
          '<button class="cta ghost report-btn" id="cardBtn" type="button">📸 성적표 공유</button>' +
          '<button class="cta ghost" id="homeBtn" type="button">🏠 메뉴로 돌아가기</button>' +
          '<button class="cta" id="againBtn" type="button">다시 도전</button>' +
        '</div>' +
      '</div>'
    );
    $('cardBtn').addEventListener('click', function () { SFX.click(); openCard('clear'); });
    $('homeBtn').addEventListener('click', function () { SFX.click(); hardExit(); });
    $('againBtn').addEventListener('click', function () { SFX.click(); startRun(); });
  }
  function bestComboRun() {
    var b = 0;
    for (var i = 0; i < runLog.length; i++) b = Math.max(b, runLog[i].combo);
    return b;
  }

  /* ---------------- debug / test hook ---------------- */
  if (/[?&]debug=1(&|$)/.test(location.search)) window.__SLACK = {
    state: function () {
      return {
        mode: S.mode, stage: S.stage, day: S.cfg.day, gauge: S.gauge, left: S.left,
        combo: S.combo, work: S.work, holding: S.holding, acting: S.acting,
        phase: S.phase, score: S.score, suspicion: S.suspicion, locked: S.locked,
        checks: S.checks, passes: S.passes, taps: S.taps,
        curMini: S.curMini, paused: S.paused, quit: !!S.quitOpen, sat: S.satGameIn, t: +S.t.toFixed(2)
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
    grace: function (v) { S.grace = Math.max(0, Number(v) || 0); return S.grace; },
    win: function () { if (S.mode === 'playing') winStage(); },
    stage: function (i) { enterStage(i, 0); },
    stageById: function (id) {
      for (var i = 0; i < STAGES.length; i++) if (STAGES[i].id === id) return i;
      return -1;
    },
    stages: function () { return STAGES.map(function (s) { return { id: s.id, day: s.day, name: s.name, secs: s.secs }; }); },
    /* 컷신·메뉴·스와이프·코인 */
    cut: function () { return { mode: S.mode, seen: Object.keys(S.cutSeen), open: !!S.cutSkip }; },
    skipCut: function () { if (S.cutSkip) S.cutSkip(); },
    resetCuts: function () { S.cutSeen = {}; return true; },
    menu: function () { requestMenu(); },
    menuForce: function () { hardExit(); },
    quitOpen: function () { return !!S.quitOpen; },
    swipe: slackSwipe,
    coinTap: coinTapAction,
    coin: function () { return Slack3D.coinState(); },
    coinDebug: function (o) { return Slack3D.coinDebug(o); },
    coinHud: function () {
      return {
        hidden: E.coinHud ? E.coinHud.hidden : null,
        price: E.chPrice ? E.chPrice.textContent : '',
        ret: E.chRet ? E.chRet.textContent : '',
        tip: E.chTip ? E.chTip.textContent : ''
      };
    },
    mini: function () { return { cur: S.curMini, label: E.miniLabel ? E.miniLabel.textContent : '' }; },
    satNext: cycleSatGame,
    endings: function (kind) { showEnding(kind); },
    endingScreen: function (kind) { showEndingScreen(kind || 'week'); },
    cine: function (kind) { return (window.Slack3D) ? Slack3D.cineShot(kind) : ''; },
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
