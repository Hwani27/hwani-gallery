/* ===== 부장님 몰래 딴짓하기 — 🚨 3초 변명 찬스 =====
   발각 순간, 게임오버 대신 3.0초 안에 변명을 고르는 구간.
   딴짓 모드(월 점프 / 화 메신저 / 수 차트 / 목 숏폼 / 금 쇼핑) × 상사(잼부장 / 잼사장)마다
   밈 변명 세트를 두고, 매번 정답 1 + 웃긴 오답 2 를 섞어서 낸다. 스테이지당 1회. */
var EXCUSES = {
  jump: {
    jambujang: [
      { ok: '업무용 점프 시뮬레이션입니다', wrong: ['몸풀기 운동 중이었습니다', '모니터가 절로 떴습니다'], reaction: '점프로 재고 확인한다고? 뭐, 요즘은 그렇다더라' },
      { ok: '공정 개선 테스트 중입니다', wrong: ['점프는 업무의 기본입니다', '마우스가 미끄러졌습니다'], reaction: '테스트면 봐주지. 보고서에 올려' },
      { ok: '재고 확인용 동작 검증입니다', wrong: ['부장님 따라 하는 중입니다', '이거 게임 아닙니다(아님)'], reaction: '동작 검증? 신입이 열정이 넘치네' }
    ],
    jamsajang: [
      { ok: '직원 건강 증진 프로그램입니다', wrong: ['점프로 결재 결심 중입니다', '화면이 제 발로 움직였습니다'], reaction: '건강? 회사 이미지에 좋군. 계속하게' },
      { ok: '신사업 아이디어 검증 중입니다', wrong: ['사장님 닮아서 뜁니다', '회의 준비 운동입니다'], reaction: '몸으로 검증? 열정은 인정하지' },
      { ok: '생산성 게임화 리서치입니다', wrong: ['경쟁사 벤치마킹입니다(게임)', '알 바 없어서 뛰었습니다'], reaction: '게임화? 요즘 유행이지. 보고하게' }
    ]
  },
  chart: {
    jambujang: [
      { ok: '코인 시세 리스크 모니터링입니다', wrong: ['코인으로 월급 굴리는 중입니다', '차트가 저를 부릅니다'], reaction: '리스크? 우리 코인은 안 샀는데…' },
      { ok: '매출 추이 예측 중입니다', wrong: ['코인 차트 감상 중입니다', '손가락이 자동으로 쐈습니다'], reaction: '예측? 내 보고서에 있던 건데' },
      { ok: '환율 연동 자산 점검입니다', wrong: ['차트로 사주 봤습니다', '그래프 색이 예뻐서요'], reaction: '환율? 그건 내 관심사지' }
    ],
    jamsajang: [
      { ok: '실적 그래프를 눈으로 검증 중입니다', wrong: ['코인 수익금 계산 중입니다', '차트가 춤춰서요'], reaction: '눈으로 검증? 참 신기하군' },
      { ok: '투자 심리 지표 확인입니다', wrong: ['사주로 이번 달 봤습니다', '그래프 구경 중입니다'], reaction: '의사결정 참고? 내일 보고하게' },
      { ok: '환율 리스크 실시간 점검입니다', wrong: ['코인 탈출 타이밍입니다', '차트 게임입니다(아님)'], reaction: '환율은 내 관심사지. 계속 보게' }
    ]
  },
  chat: {
    jambujang: [
      { ok: '거래처 카톡 회신 중입니다', wrong: ['전 친구한테 차단당해습니다', '메신저가 저를 이겼습니다'], reaction: '거래처? 그럼 나한테도 보여 봐' },
      { ok: '사내 공지 전달 중입니다', wrong: ['단톡방이 너무 시끄러워서요', '제 손가락이 자동으로 눌렀습니다'], reaction: '공지? 그건 총무 업무인데…' },
      { ok: '부서 일정 조율 메시지입니다', wrong: ['읽음 표시가 무서워서요', '이모지가 너무 귀여워서요'], reaction: '일정? 그건 내가 잡는 건데' }
    ],
    jamsajang: [
      { ok: '임원 보고 일정을 조율 중입니다', wrong: ['사장님 카톡 기다리는 중입니다', '톡이 저를 부릅니다'], reaction: '일정? 그건 비서가 하지' },
      { ok: '거래처 응대 기록 정리 중입니다', wrong: ['단톡방 구경 중입니다', '알림이 100개라서요'], reaction: '기록? 성실하군. 계속하게' },
      { ok: '메신저로 보고를 독려 중입니다', wrong: ['칼퇴 얘기 중입니다', '제가 채팅방 주인입니다'], reaction: '독려? 그건 내 말이지' }
    ]
  },
  video: {
    jambujang: [
      { ok: '경쟁사 숏폼 마케팅 리서치입니다', wrong: ['고양이가 너무 귀여워서요', '알고리즘이 저를 붙잡았습니다'], reaction: '리서치? 그럼 보고서로 내놔' },
      { ok: '제품 사용 영상 검수 중입니다', wrong: ['3초만 보려다 30분…', '다음 영상이 안 넘어갑니다'], reaction: '검수? 참 열정적이군' },
      { ok: '유튜브 광고 단가 확인 중입니다', wrong: ['회사 계정으로 구독 중입니다', '쇼츠가 업무를 방해합니다'], reaction: '단가? 그건 마케팅팀 아님?' }
    ],
    jamsajang: [
      { ok: '시장 트렌드 숏폼 분석 중입니다', wrong: ['사장님 영상 찾는 중입니다', '숏폼은 인생의 낙입니다'], reaction: '분석? 사장도 배워야겠군' },
      { ok: '브랜드 바이럴 영상 점검입니다', wrong: ['고양이 영상만 봤습니다', '제 손가락이 넘겼습니다'], reaction: '점검? 그 정도면 됐네' },
      { ok: '임원 홍보 영상 소재 수집입니다', wrong: ['웃긴 영상 저장 중입니다', '알고리즘이 저를 붙잡았습니다'], reaction: '소재? 그건 내가 고르지' }
    ]
  },
  shop: {
    jambujang: [
      { ok: '부서 비품 최저가 비교 중입니다', wrong: ['제 생일 선물 고르는 중입니다', '장바구니가 절로 채워집니다'], reaction: '비품? 총무 담당인데… 싸면 좋지' },
      { ok: '회식 장소 견적 내는 중입니다', wrong: ['핫딜 구경만 했습니다(3개 담음)', '쇼핑은 업무의 연장입니다'], reaction: '회식? 중요한 업무지. 몇 명 기준인가' },
      { ok: '거래처 선물 견적 맞추는 중입니다', wrong: ['제 지갑이 열렸습니다', '할인율이 너무 예뻐서요'], reaction: '거래처 선물? 그건 내 결재인데' }
    ],
    jamsajang: [
      { ok: '연말 거래처 선물 리서치입니다', wrong: ['사장님 선물 고르는 중입니다', '핫딜은 인생의 낭만입니다'], reaction: '선물? 아끼는 모습 보기 좋군' },
      { ok: '사무용품 단가 비교로 원가 절감 중입니다', wrong: ['제 쇼핑몰 적립금 확인입니다', '장바구니 정리 중입니다'], reaction: '원가 절감? 그 정신이면 충분해' },
      { ok: '임원 다과 견적 확인 중입니다', wrong: ['충동구매 참는 연습입니다', '세일이 업무를 방해합니다'], reaction: '다과? 내 취향을 물어봐야지' }
    ]
  }
};

var EXCUSE_FAIL_LINES = {
  jambujang: {
    wrong: ['그게 변명이야? 시말서 써.', '지금 나한테 장난치는 건가.', '좋아, 그 변명은 인사팀에서 들어보자.'],
    timeout: ['3초 다 갔네. 말문이 막혔나? 시말서 써.', '시간 끌기는 통하지 않네. 앉아.', '침묵이 답인가? 그럼 야근으로 답하지.']
  },
  jamsajang: {
    wrong: ['변명이 아니라 자백이군. 시말서.', '사장 앞에서 그 말을 하는 건가.', '흥미롭군. 야근하면서 다시 생각해 보게.'],
    timeout: ['3초 동안 침묵? 그 침묵이 답이군.', '말이 없으면 시말서로 쓰지.', '사장을 기다리게 한 값은 야근이야.']
  }
};

var ExcuseChance = (function () {
  'use strict';

  var DUR = 3.0;
  var used = false, open = false, phase = 'idle';
  var left = 0, t0 = 0, raf = 0, tickN = 0;
  var opts = [], answer = -1, cur = null, hk = null, lastResult = null, shotSrc = '';

  function now() { return performance.now() / 1000; }
  function rint(n) { return (Math.random() * n) | 0; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function pickLine(boss, reason) {
    var b = EXCUSE_FAIL_LINES[boss] || EXCUSE_FAIL_LINES.jambujang;
    var arr = b[reason] || b.wrong;
    return arr[rint(arr.length)];
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = rint(i + 1), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pool(kind, boss) {
    var k = EXCUSES[kind] || EXCUSES.jump;
    return k[boss] || k.jambujang;
  }

  /* 이번 판의 변명 3개(정답 1 + 오답 2)를 새로 섞는다 */
  function build(kind, boss) {
    var p = pool(kind, boss);
    cur = p[rint(p.length)];
    var list = [{ text: cur.ok, ok: true }];
    for (var i = 0; i < cur.wrong.length; i++) list.push({ text: cur.wrong[i], ok: false });
    shuffle(list);
    opts = list;
    answer = -1;
    for (var j = 0; j < list.length; j++) if (list[j].ok) answer = j;
  }

  function modalHTML(h) {
    var c = (window.CAST && CAST[h.boss]) || {};
    var rows = '';
    for (var i = 0; i < opts.length; i++) {
      rows += '<button class="ec-opt" type="button" data-i="' + i + '">' +
        '<span class="ec-n">' + (i + 1) + '</span><span class="ec-t">' + esc(opts[i].text) + '</span></button>';
    }
    return '<div class="ec-wrap" id="ecWrap">' +
      '<div class="ec-top">' +
        '<span class="ec-badge">🚨 3초 변명 찬스!</span>' +
        '<span class="ec-clock"><b id="ecLeft">3.0</b><small>초</small></span>' +
      '</div>' +
      '<div class="ec-shotbox">' +
        '<img class="ec-shot" id="ecShot" alt="">' +
        '<span class="ec-shot-ph" id="ecShotPh">📸 캡처 중…</span>' +
        '<span class="ec-shot-tag">방금 찍힌 ' + esc(c.name || '부장님') + ' 호통 컷</span>' +
      '</div>' +
      '<div class="ec-said">' +
        '<b id="ecWho" style="color:' + (c.color || '#ffd24a') + '">' + esc(c.name || '부장님') + '</b>' +
        '<p id="ecLine">' + esc(h.line || '변명해 봐. 3초 준다.') + '</p>' +
      '</div>' +
      '<div class="ec-bar"><i id="ecFill"></i></div>' +
      '<div class="ec-opts" id="ecOpts">' + rows + '</div>' +
      '<p class="ec-hint">정답을 고르면 살아납니다 · 3.0초 안에!</p>' +
    '</div>';
  }

  function cutShotHTML(kind) {
    if (!shotSrc) return '<div class="big">' + (kind === 'ok' ? '🤨👌' : '📝😡') + '</div>';
    return '<div class="ec-cutshot ' + kind + '">' +
      '<img src="' + shotSrc + '" alt="">' +
      '<span>📸 현장 컷</span></div>';
  }

  function passHTML(chosen) {
    var c = (window.CAST && CAST[hk.boss]) || {};
    return '<div class="ec-cut">' +
      cutShotHTML('ok') +
      '<span class="ec-stamp ok">변명 성공</span>' +
      '<h3>솔깃한 ' + esc(c.name || '부장님') + '</h3>' +
      '<p class="ec-quote">“' + esc(chosen.text) + '”<small>' + esc(cur.reaction) + '</small></p>' +
      '<span class="ec-reward">+50점 · 1.5초 무적 후 복귀</span>' +
    '</div>';
  }

  function failHTML(chosen, line) {
    var c = (window.CAST && CAST[hk.boss]) || {};
    var q = chosen ? '“' + esc(chosen.text) + '”' : '3.0초 동안… 아무 말도 못 했다';
    return '<div class="ec-cut">' +
      cutShotHTML('no') +
      '<span class="ec-stamp no">시말서 확정</span>' +
      '<h3>' + esc(c.name || '부장님') + '의 표정이 굳었다</h3>' +
      '<p class="ec-quote">' + q + '<small>' + esc(line) + '</small></p>' +
    '</div>';
  }

  function loop() {
    if (!open || phase !== 'choose') return;
    raf = requestAnimationFrame(loop);
    var rem = DUR - (now() - t0);
    if (rem < 0) rem = 0;
    left = rem;
    var fill = document.getElementById('ecFill');
    var cl = document.getElementById('ecLeft');
    if (fill) fill.style.width = (rem / DUR * 100).toFixed(1) + '%';
    if (cl) cl.textContent = rem.toFixed(1);
    var n = Math.ceil(rem * 2);
    if (n !== tickN && rem > 0) { tickN = n; SFX.excuseTick(n); }
    if (rem <= 0) fail('timeout', -1);
  }

  function onKey(e) {
    if (!open || phase !== 'choose') return;
    if (e.code === 'Digit1' || e.code === 'Numpad1') { e.preventDefault(); pick(0); }
    else if (e.code === 'Digit2' || e.code === 'Numpad2') { e.preventDefault(); pick(1); }
    else if (e.code === 'Digit3' || e.code === 'Numpad3') { e.preventDefault(); pick(2); }
  }

  function close() {
    open = false; phase = 'idle';
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (hk && hk.overlay) {
      hk.overlay.hidden = true;
      hk.overlay.innerHTML = '';
      hk.overlay.classList.remove('ec');
    }
    document.removeEventListener('keydown', onKey);
  }

  function success(chosen) {
    lastResult = { reason: 'pass', choice: chosen.text, said: cur.reaction };
    open = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    document.removeEventListener('keydown', onKey);
    SFX.excuseSigh();
    if (hk.overlay) hk.overlay.innerHTML = passHTML(chosen);
    if (hk.onPass) { try { hk.onPass(lastResult); } catch (e) {} }
    setTimeout(function () {
      close();
      if (hk.onResume) { try { hk.onResume(); } catch (e) {} }
    }, 1200);
  }

  function fail(reason, idx) {
    var chosen = idx >= 0 ? opts[idx] : null;
    var line = pickLine(hk.boss, reason);
    lastResult = { reason: reason, choice: chosen ? chosen.text : null, said: line };
    open = false; phase = 'settle';
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    document.removeEventListener('keydown', onKey);
    SFX.excuseBuzz();
    if (hk.overlay) hk.overlay.innerHTML = failHTML(chosen, line);
    setTimeout(function () {
      close();
      if (hk.onFail) { try { hk.onFail(lastResult); } catch (e) {} }
    }, 1250);
  }

  function pick(i) {
    if (!open || phase !== 'choose') return false;
    i = i | 0;
    if (i < 0 || i >= opts.length) return false;
    phase = 'settle';
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    var chosen = opts[i];
    if (chosen.ok) success(chosen); else fail('wrong', i);
    return true;
  }

  function openChance(h) {
    if (open) return false;
    hk = h; used = true; open = true; phase = 'choose'; lastResult = null;
    build(h.kind, h.boss);
    var ov = h.overlay;
    ov.classList.add('ec');
    ov.innerHTML = modalHTML(h);
    ov.hidden = false;
    t0 = now(); left = DUR; tickN = 0;
    SFX.excuseOpen();
    var box = document.getElementById('ecOpts');
    if (box) {
      for (var i = 0; i < opts.length; i++) {
        (function (idx) {
          box.children[idx].addEventListener('pointerdown', function (e) {
            e.preventDefault(); e.stopPropagation(); pick(idx);
          });
        })(i);
      }
    }
    var im = document.getElementById('ecShot');
    var ph = document.getElementById('ecShotPh');
    shotSrc = '';
    if (im) im.addEventListener('load', function () { if (ph) ph.hidden = true; });
    setTimeout(function () {
      if (!im) return;
      var src = '';
      try { src = h.shot ? h.shot() : ''; } catch (e) { src = ''; }
      if (src) { shotSrc = src; im.src = src; }
      else if (ph) ph.textContent = '📸 컷 캡처 실패';
    }, 380);
    raf = requestAnimationFrame(loop);
    document.addEventListener('keydown', onKey);
    return true;
  }

  return {
    DUR: DUR,
    reset: function () {
      used = false; open = false; phase = 'idle'; left = 0;
      opts = []; answer = -1; cur = null; lastResult = null; tickN = 0;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    open: openChance,
    pick: pick,
    hasUsed: function () { return used; },
    isOpen: function () { return open; },
    lastResult: function () { return lastResult; },
    status: function () {
      return {
        used: used, open: open, phase: phase, left: +left.toFixed(2),
        answer: answer, opts: opts.map(function (o) { return o.text; }),
        result: lastResult
      };
    }
  };
})();
