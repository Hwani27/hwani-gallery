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
      id: 'wed', day: '수요일', name: '잼대리 유혹 공작', tag: '보통', pips: 2,
      secs: 46, warn: 1.3, gap: [5.4, 8.0], turnback: 0.45, double: 0,
      temptation: true, suspicion: false, bosses: ['jambujang'],
      slack: 'chart', file: '수요일_주간보고_진짜마지막_v7_최종.xlsx', url: 'coinchart.io/BTC',
      desc: '잼대리가 옆에서 치킨을 들이민다. 그리고 부장님이 지나간 척하다 돌아본다.',
      rules: ['<b>🍗 치킨 유혹</b>을 누르면 게이지 <b>+12</b>, 대신 <b>1.5초간 위장 불가</b>.',
        '부장님이 <b>지나간 척 돌아보는 페인트 모션</b> — 경고가 한 번 더 올 수 있다.']
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
    phase: 'idle', phaseT: 0, warnDur: 0, warnLeft: 0, warnSurprise: false,
    turnbackUsed: false, checker: 'jambujang',
    suspicion: 0, checks: 0, passes: 0,
    temptIn: 0, temptShown: false, temptHide: 0,
    chatIn: 9, footAcc: 0, typeAcc: 0, tickAt: 0,
    grace: 0, stageBest: 0, stats: null,
    lastHint: ''
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
    E.overlay.innerHTML = html;
    E.overlay.hidden = false;
  }
  function hideOverlay() { E.overlay.hidden = true; E.overlay.innerHTML = ''; }

  function showTitle() {
    S.mode = 'title';
    if (window.Slack3D) { Slack3D.setActive(true); Slack3D.setMiniActive(true); }
    E.app.classList.remove('tense');
    E.stageChip.textContent = '월요일';
    resetBossVisual();
    overlay(
      '<div class="ov-inner">' +
        '<div class="hero" aria-hidden="true">' +
          '<img class="hero-3d" id="hero3d" alt="잼부장 복셀 캐릭터">' +
          '<span class="hero-chip">🍿 딴짓 92% · 칼퇴까지 12분</span>' +
        '</div>' +
        '<span class="ov-tag">🕵️ 18:00 칼퇴 생존기</span>' +
        '<h1 class="ov-title">부장님 몰래<br>딴짓하기</h1>' +
        '<p class="ov-sub">부장님 눈을 피해 <b>딴짓 게이지 100%</b>를 채우고,<br>6시 정각에 사라져라. 회사 3일 생존기.</p>' +
        '<div class="how">' +
          '<div class="how-i"><b>👆</b><span>모니터 연타<small>딴짓 게이지 UP</small></span></div>' +
          '<div class="how-i"><b>💼</b><span>일하는 척 꾹<small>부장님 눈 피하기</small></span></div>' +
          '<div class="how-i"><b>🏃</b><span>18:00 칼퇴<small>100%면 탈출</small></span></div>' +
        '</div>' +
        '<div class="ov-stage-list">' +
          stageRow('월요일', '잼부장 순찰', 1, '쉬움') +
          stageRow('수요일', '잼대리 유혹 + 페인트 모션', 2, '보통') +
          stageRow('금요일', '부장님 + 사장님 더블 체크', 3, '어려움') +
        '</div>' +
        '<button class="cta" id="startBtn" type="button">출근하기</button>' +
        '<p class="ov-tiny">모니터 연타 = 딴짓 · 「일하는 척!」 꾹 = 위장 (Space)</p>' +
      '</div>'
    );
    $('startBtn').addEventListener('click', function () { SFX.click(); startRun(); });
    try {
      var shot = Slack3D.snapshot('hero');
      var im = $('hero3d');
      if (shot && im) im.src = shot;
      Slack3D.setActive(false);
    } catch (err) {}
  }
  function stageRow(day, name, pips, tag) {
    var p = '';
    for (var i = 0; i < 3; i++) p += '<i class="' + (i < pips ? 'on' : '') + '"></i>';
    return '<div class="ov-stage"><span class="d">' + day + '</span><span class="n">' + name + '</span>' +
      '<span class="p">' + tag + ' ' + p + '</span></div>';
  }

  function startRun() {
    S.score = 0;
    runLog = [];
    enterStage(0, 0);
  }

  function enterStage(i, baseScore) {
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
    setAlert('calm', '평온 · 부장님은 자리에…');
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
    S.turnbackUsed = false; S.checker = cfg.bosses[0];
    S.suspicion = 0; S.checks = 0; S.passes = 0;
    S.temptIn = rnd(7, 10); S.temptShown = false;
    S.chatIn = 9; S.typeAcc = 0; S.tickAt = 0;
    S.grace = 0; S.stageBest = 0;
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
    if (S.mode === 'playing') update(dt);
  }

  function update(dt) {
    var cfg = S.cfg;
    S.t += dt;
    S.left -= dt;

    if (S.left <= 0) { S.left = 0; syncHUD(); return timeoutStage(); }

    // 업무 척도
    if (S.holding) S.acting = Math.min(100, S.acting + dt * 340);
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
    if (S.work) S.gauge = Math.max(0, S.gauge - 1.1 * dt);

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

    if (S.gauge >= 100) winStage();
  }

  /* ---------------- boss ---------------- */
  function updateBoss(dt) {
    var cfg = S.cfg;
    if (S.grace > 0) { S.grace -= dt; return; }

    if (S.phase === 'idle') {
      S.phaseT -= dt;
      if (S.phaseT <= 0) beginWarn(S.warnDur);
    } else if (S.phase === 'warn') {
      S.warnLeft -= dt;
      S.footAcc -= dt;
      if (S.footAcc <= 0) {
        S.footAcc = Math.max(0.13, S.warnLeft * 0.34);
        SFX.foot(S.warnLeft < 0.5);
      }
      if (!S.warnSurprise) {
        setAlert('warn', S.warnLeft > S.warnDur * 0.45 ? '쿵쿵쿵… 복도에서 다가오는 중' : '문 앞에서 대기 중! 지금 위장!');
      } else {
        setAlert('warn', '기습 점검!! 일하는 척!!');
      }
      E.alertFill.style.width = ((1 - S.warnLeft / S.warnDur) * 100).toFixed(1) + '%';
      if (S.warnLeft <= 0) resolveCheck();
    } else if (S.phase === 'pass') {
      S.phaseT -= dt;
      if (S.phaseT <= 0) {
        S.phase = 'idle';
        S.phaseT = (cfg.double && Math.random() < cfg.double) ? rnd(0.7, 1.1) : rnd(cfg.gap[0], cfg.gap[1]);
        S.turnbackUsed = false;
        setBossPos('far', 0.8);
        setAlert('calm', '평온 · 부장님은 자리에…');
        E.cam.classList.remove('on');
        E.monitor.dataset.mode = S.work ? 'work' : 'slack';
      }
    } else if (S.phase === 'feint') {
      S.phaseT -= dt;
      if (S.phaseT <= 0) beginWarn(Math.max(0.55, cfg.warn * 0.55), true);
    }
  }

  function beginWarn(dur, surprise) {
    var cfg = S.cfg;
    S.phase = 'warn';
    S.warnDur = dur;
    S.warnLeft = dur;
    S.warnSurprise = !!surprise;
    S.footAcc = 0;
    S.checker = (cfg.bosses.length > 1 && S.checks % 2 === 1) ? cfg.bosses[1] : cfg.bosses[0];
    setBossPos(surprise ? 'peek' : 'warn', surprise ? 0.12 : dur * 0.92);
    E.cam.classList.add('on');
    E.monitor.dataset.mode = 'watch';
    E.app.classList.add('tense');
    SFX.warn();
    setAlert('warn', surprise ? '기습 점검!! 일하는 척!!' : '쿵쿵쿵… 부장님 접근 중!');
    if (surprise) flash('rgba(255,80,90,.35)', 260);
    Bubble.say(S.checker, 'approach', 1600);
  }

  function resolveCheck() {
    if (S.mode !== 'playing') return;
    S.checks++;
    var safe = S.work && S.acting >= 55;
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
      if (!S.turnbackUsed && cfg.turnback && Math.random() < cfg.turnback) {
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
    S.mode = 'caught';
    E.app.classList.remove('tense');
    if (window.Slack3D) { Slack3D.caught(); Slack3D.setMiniActive(false); }
    SFX.caught();
    E.monitor.classList.add('shake');
    setTimeout(function () { E.monitor.classList.remove('shake'); }, 400);
    flash('rgba(255,50,60,.5)', 420);
    setBossPos('peek', 0.1);
    setAlert('watch', '발각!!');
    Bubble.say(S.checker, 'caught', 4000);
    E.cam.classList.add('on');
    S.work = false; S.holding = false;
    S.stats = snapshotStats('caught');
    setTimeout(showCaughtScreen, 780);
  }

  function timeoutStage() {
    S.mode = 'timeout';
    E.app.classList.remove('tense');
    SFX.overtime();
    setAlert('calm', '18:00 · 퇴근 시간');
    if (window.Slack3D) Slack3D.setMiniActive(false);
    Bubble.say(S.checker, 'overtime', 4000);
    S.work = false; S.holding = false;
    S.stats = snapshotStats('timeout');
    setTimeout(showTimeoutScreen, 700);
  }

  function winStage() {
    if (S.mode !== 'playing') return;
    S.mode = 'clear';
    E.app.classList.remove('tense');
    SFX.clear();
    flash('rgba(120,255,190,.35)', 320);
    setAlert('safe', '딴짓 100%! 가방 챙겨!');
    if (window.Slack3D) Slack3D.setMiniActive(false);
    Bubble.say(S.checker, 'clear', 3200);
    S.stats = snapshotStats('clear');
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
    }
  }

  /* ---------------- slack / work ---------------- */
  function slackTap(x, y, pageX, pageY) {
    if (S.mode !== 'playing') return;
    if (S.work || S.locked > 0) return;
    S.combo++;
    S.comboAt = S.t;
    S.bestCombo = Math.max(S.bestCombo, S.combo);
    var gain = 0.7 + Math.min(S.combo, 15) * 0.055;
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
    if (!S.work) { S.work = true; setWorkVisual(true); SFX.click(); }
    E.workBtn.classList.add('on');
    E.actingRow.hidden = false;
  }
  function endWork() {
    if (!S.holding) { E.workBtn.classList.remove('on'); return; }
    S.holding = false;
    E.workBtn.classList.remove('on');
    // 짧은 유예 뒤 위장 해제 (탭 한 번도 살짝 먹히게)
    setTimeout(function () {
      if (!S.holding && S.acting <= 0.5 && S.work) {
        S.work = false;
        setWorkVisual(false);
      }
    }, 60);
  }
  function setWorkVisual(on, silent) {
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
  function miniTap() {
    var kind = S.cfg.slack;
    if (kind === 'jump') {
      if (E.miniScore) E.miniScore.textContent = S.taps;
    } else if (kind === 'chart') {
      if (E.miniScore) E.miniScore.textContent = '+' + (S.taps * 2.7).toFixed(1) + '%';
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

  /* ---------------- result screens ---------------- */
  function showCaughtScreen() {
    var st = S.stats;
    var cutShot = '';
    try { cutShot = Slack3D.snapshot(); Slack3D.setActive(false); } catch (err) {}
    overlay(
      '<div class="ov-inner">' +
        (cutShot ? '<img class="cut-shot" src="' + cutShot + '" alt="발각 순간 3D 컷">' : '<div class="cut-emoji">👨‍💼</div>') +
        '<span class="cut-stamp">발각!</span>' +
        '<h2 class="cut-title">김인턴… <em>지금 그게 뭐야?!</em></h2>' +
        '<p class="cut-line">' + (st ? '딴짓 ' + st.gauge + '%에서 모니터가 그대로 노출됐다. 부장님 표정이 굳었다.' : '') + '</p>' +
        statsRow(st, '발각') +
        '<div class="ov-actions">' +
          '<button class="cta" id="retryBtn" type="button">다시 하기</button>' +
          '<button class="cta ghost" id="homeBtn" type="button">처음으로</button>' +
        '</div>' +
      '</div>'
    );
    $('retryBtn').addEventListener('click', function () { SFX.click(); enterStage(S.stage, S.baseScore); });
    $('homeBtn').addEventListener('click', function () { SFX.click(); showTitle(); });
  }

  function showTimeoutScreen() {
    var st = S.stats;
    if (window.Slack3D) Slack3D.setActive(false);
    overlay(
      '<div class="ov-inner">' +
        '<div class="cut-emoji">🌙</div>' +
        '<span class="cut-stamp yellow">야근 당첨</span>' +
        '<h2 class="cut-title">18:00 · 해도 지고, 퇴근도 지고</h2>' +
        '<p class="cut-line">일하는 척만 하다간 퇴근은 없다. 딴짓은 해야 늘어난다.</p>' +
        statsRow(st, '남은 시간') +
        '<div class="ov-actions">' +
          '<button class="cta" id="retryBtn" type="button">다시 하기</button>' +
          '<button class="cta ghost" id="homeBtn" type="button">처음으로</button>' +
        '</div>' +
      '</div>'
    );
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
    if (window.Slack3D) { Slack3D.setActive(false); Slack3D.setMiniActive(false); }
    var next = S.stage + 1;
    var last = next >= STAGES.length;
    var head = last ? '금요일 18:00 · 이번 주도 칼퇴' : S.cfg.day + ' 18:00 · 사무실 탈출';
    var sub = last
      ? '3일 연속 칼퇴 성공. 이제 주말은 내 거다.'
      : '가방은 이미 쌌다. 계단으로 조용히… 내일 또 온다.';
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
        '<div class="ov-actions">' +
          (last
            ? '<button class="cta" id="endBtn" type="button">주말 맞이하기</button>'
            : '<button class="cta" id="nextBtn" type="button">다음 날: ' + STAGES[next].day + ' →</button>') +
          '<button class="cta ghost" id="retryBtn" type="button">이 날 다시 하기</button>' +
        '</div>' +
      '</div>'
    );
    if (last) $('endBtn').addEventListener('click', function () { SFX.click(); showEnding(); });
    else $('nextBtn').addEventListener('click', function () { SFX.click(); enterStage(next, S.score); });
    $('retryBtn').addEventListener('click', function () { SFX.click(); enterStage(S.stage, S.baseScore); });
  }

  function showEnding() {
    S.mode = 'ending';
    var total = S.score;
    var rank = total >= 4200 ? 'S' : total >= 3200 ? 'A' : total >= 2200 ? 'B' : 'C';
    var rows = runLog.map(function (r) {
      return '<div class="ov-stage"><span class="d">' + r.day + '</span><span class="n">딴짓 ' + r.gauge + '% · 콤보 ' + r.combo + '</span><span class="p">' + r.score + '점</span></div>';
    }).join('');
    overlay(
      '<div class="ov-inner">' +
        '<div class="cut-emoji">🌇</div>' +
        '<span class="cut-stamp yellow">3일 연속 칼퇴</span>' +
        '<h2 class="cut-title">주말이 왔다.<br>이번 주도 살아남았다.</h2>' +
        '<p class="cut-line">잼부장: “…칼퇴? 나 때는 말이야…”<br>잼인턴: “선배님 진짜 칼퇴했어요?!”</p>' +
        '<div class="ov-stage-list">' + rows + '</div>' +
        '<div class="cut-stats">' +
          '<div><b>' + rank + '</b><small>등급</small></div>' +
          '<div><b>' + total.toLocaleString('ko-KR') + '</b><small>총점</small></div>' +
          '<div><b>' + bestComboRun() + '</b><small>최고 콤보</small></div>' +
        '</div>' +
        '<div class="ov-actions">' +
          '<button class="cta" id="againBtn" type="button">다시 도전</button>' +
        '</div>' +
      '</div>'
    );
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
    setGauge: function (v) { S.gauge = clamp(v, 0, 100); syncHUD(); if (S.gauge >= 100) winStage(); },
    stage: function (i) { enterStage(i, 0); },
    start: function () { startRun(); },
    go: beginPlay,
    skipTemptIn: function () { S.temptIn = 0; },
    takeTempt: takeTemptation,
    setLeft: function (v) { S.left = v; syncHUD(); },
    three: function () { return window.Slack3D ? Slack3D.status() : null; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
