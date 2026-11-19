/* ===== 성장·랭크 — 레이팅(급/단), 추천 상대, 업적, 주간 미션, 첫 5분, 테마 해금 =====
   Rating is Elo against the CPU: each CPU strength 1..10 has a rating, "추천 상대" picks the strength
   that matches yours, so every game is close. Ranks are 급/단 (체스는 리그 이름). The Toss
   leaderboard gets the rating. Board/stone themes unlock as you climb. */
const Progress = (function () {
  const ID = window.GAME_ID;
  const G = { omok: () => Omok, janggi: () => Janggi, baduk: () => Baduk, chess: () => ChessApp, uno: () => Uno }[ID]();
  const T = () => window.Toss || null;
  const START = 1000;
  const oppRating = s => 650 + s * 130;                                   // CPU strength 1..10 → 780..1950
  const LV_S = { 1: 2, 2: 5, 3: 9 };                                       // 쉬움/보통/어려움 ≈ strength
  const strengthFor = r => Math.max(1, Math.min(10, Math.round((r - 650) / 130)));

  // ---- ranks ----
  function rankOf(r) {
    if (ID === 'chess' || ID === 'uno') {
      const L = ID === 'uno'   // 원카드: 회사 직급
        ? [['인턴', 0], ['사원', 900], ['주임', 1000], ['대리', 1100], ['과장', 1250], ['차장', 1400], ['부장', 1550], ['이사', 1700], ['상무', 1850], ['사장', 2000]]
        : [['브론즈', 0], ['실버', 1000], ['골드', 1200], ['플래티넘', 1400], ['다이아', 1600], ['마스터', 1800], ['그랜드마스터', 2000]];
      let i = 0; while (i + 1 < L.length && r >= L[i + 1][1]) i++;
      const lo = L[i][1], hi = i + 1 < L.length ? L[i + 1][1] : lo + 200;
      return { name: L[i][0], lo, hi, idx: i, dan: i >= (ID === 'uno' ? 5 : 3) };
    }
    if (r < 800) return { name: '입문', lo: 0, hi: 800, idx: 0, dan: false };
    if (r < 1400) { const k = Math.max(1, 18 - Math.floor((r - 800) / (600 / 18))); const lo = 800 + (18 - k) * 600 / 18; return { name: k + '급', lo, hi: lo + 600 / 18, idx: 19 - k, dan: false }; }
    const dn = Math.min(9, 1 + Math.floor((r - 1400) / 70)); const lo = 1400 + (dn - 1) * 70;
    return { name: dn + '단', lo, hi: dn === 9 ? lo + 200 : lo + 70, idx: 19 + dn, dan: true };
  }

  // ---- themes (unlocked by rank) ----
  const THEMES = [
    { id: 'classic', name: '비자나무', need: 0, wood: null, stones: null },
    { id: 'kaya', name: '황금 카야', need: 1100, price: 300, wood: { base: '#d9ab5c', dark: 'rgba(140,90,30,1)', light: 'rgba(250,224,160,1)' }, stones: null },
    { id: 'ebony', name: '흑단', need: 1400, price: 600, wood: { base: '#5a3a24', dark: 'rgba(30,16,8,1)', light: 'rgba(140,96,60,1)' }, stones: { black: 0x0d0e10, white: 0xfffaf0 } },
    { id: 'jade', name: '비취', need: 1600, price: 1000, wood: { base: '#c99a52', dark: 'rgba(120,70,20,1)', light: 'rgba(246,214,150,1)' }, stones: { black: 0x123527, bRough: .25, white: 0xdff5e6 } },
    { id: 'royal', name: '왕실', need: 1800, price: 2000, wood: { base: '#7a1f1f', dark: 'rgba(50,8,8,1)', light: 'rgba(190,90,70,1)' }, stones: { black: 0x1a1a1a, bMetal: .2, white: 0xfff2c4 } },
  ];
  const THEME_KEY = ID + '_theme';
  try { const th = THEMES.find(t => t.id === localStorage.getItem(THEME_KEY)); if (th && th.id !== 'classic') window.BOARD_THEME = { wood: th.wood, stones: th.stones }; } catch (e) {}
  const owned = () => (Meta.data.themes = Meta.data.themes || {});
  const unlocked = th => (p().best || START) >= th.need || !!owned()[th.id];

  // ---- state ----
  const p = () => { const d = Meta.data; if (!d.prog) d.prog = { r: START, best: START, games: 0, ach: {}, week: '', wk: {}, onboarded: false, history: [] }; return d.prog; };
  const weekKey = () => { const n = Meta.dayNumber() + 3; return String(Math.floor(n / 7)); };   // weeks start Monday (KST)
  const wk = () => { const s = p(); if (s.week !== weekKey()) { s.week = weekKey(); s.wk = {}; } return s.wk; };

  // ---- achievements ----
  const ACH = [
    ['first_win', '첫 승리', 'CPU를 처음 이겼어요', 10], ['streak3', '3연승', 'CPU를 3번 연속 이겼어요', 15], ['streak10', '10연승', '10번 연속 승리', 60],
    ['beat_hard', '고수 격파', '어려움 CPU를 이겼어요', 40], ['daily7', '일주일 개근', '오늘의 문제 7일 연속', 40], ['daily30', '한 달 개근', '오늘의 문제 30일 연속', 150],
    ['puzzles50', '문제 해결사', '문제 50개 풀이', 60], ['friend_win', '우정의 승부', '친구 대국에서 승리', 20], ['review5', '복기하는 습관', 'AI 복기 5번', 15],
    ['dan', ID === 'chess' ? '플래티넘 진입' : '입단', ID === 'chess' ? '플래티넘 리그 도달' : '첫 단 달성', 80], ['games100', '백전노장', '100판 완주', 60],
  ];
  function award(id) {
    const s = p(); if (s.ach[id]) return;
    const a = ACH.find(x => x[0] === id); if (!a) return;
    s.ach[id] = Date.now(); Meta.save(); Meta.addPoints(a[3]);
    if (window.Monetize) Monetize.log('achievement', { id });
    setTimeout(() => { Meta.toast('🏅 업적 달성 · ' + a[1] + ' (+' + a[3] + ' 코인)', 2800); if (SFX.achieve) SFX.achieve(); const t = T(); if (t) t.haptic('success'); }, 1400);
  }

  // ---- weekly missions ----
  const MISSIONS = [['play', '이번 주 10판 두기', 10, 30], ['puzzle', '문제 5개 풀기', 5, 30], ['win', '추천 상대·보통 이상 3번 이기기', 3, 40]];
  function bump(key, n) {
    const w = wk(); const m = MISSIONS.find(x => x[0] === key); if (!m) return;
    const before = w[key] || 0; w[key] = before + (n || 1); Meta.save();
    if (before < m[2] && w[key] >= m[2]) { Meta.addPoints(m[3]); setTimeout(() => { Meta.toast('🎯 주간 미션 완료 · ' + m[1] + ' (+' + m[3] + ' 코인)', 2800); if (SFX.achieve) SFX.achieve(); }, 2200); }
  }

  // ---- rating update ----
  function onEnd(info) {
    const s = p();
    if (info.mode === 'mail') { if (info.result === 'win') award('friend_win'); bump('play'); s.games++; Meta.save(); return; }
    if (!(info.mode === 'cpu' || info.mode === 'arcade')) return;
    const strength = info.mode === 'arcade' ? info.stage : info.level > 10 ? info.level - 10 : LV_S[info.level] || 5;
    const opp = oppRating(strength), score = info.result === 'win' ? 1 : info.result === 'draw' ? .5 : 0;
    const K = s.games < 15 ? 40 : s.games < 50 ? 24 : 16;
    const exp = 1 / (1 + Math.pow(10, (opp - s.r) / 400));
    const before = s.r, rb = rankOf(before);
    s.r = Math.max(100, Math.round(s.r + K * (score - exp)));
    s.games++; s.best = Math.max(s.best, s.r);
    s.history = (s.history || []).concat([[Date.now(), s.r]]).slice(-60);
    lastDelta = s.r - before; Meta.save();
    const t = T(); if (t) { const tot = Meta.APP ? Meta.totalScore() : null; t.submitScore(tot != null ? tot : s.r); }
    bump('play'); if (score === 1 && strength >= 5) bump('win');
    if (score === 1) award('first_win');
    if (score === 1 && strength >= 9) award('beat_hard');
    const st = Math.max(0, ...Object.values(Meta.data.cpu.streak || {}).map(Number)); if (st >= 3) award('streak3'); if (st >= 10) award('streak10');
    if (s.games >= 100) award('games100');
    const ra = rankOf(s.r);
    if (ra.dan) award('dan');
    if (ra.idx > rb.idx) setTimeout(() => celebrate(ra, before), 3600);
    Meta.renderHub();
  }
  let lastDelta = 0;

  // ---- UI ----
  function celebrate(ra, before) {
    confetti(); if (SFX.levelup) SFX.levelup();
    const newly = THEMES.filter(th => th.need > (before || 0) && th.need <= p().r && !th.premium);
    Meta.modal({ icon: ra.dan ? '🥋' : '⬆️', kicker: '승급!', title: ra.name, sub: '레이팅 ' + p().r + (newly.length ? '\n새 테마가 열렸어요: ' + newly.map(t => t.name).join(', ') : ''),
      actions: [{ label: '친구에게 자랑하기', fn: () => Meta.share(`${Meta.NAME} ${ra.name} 달성! 🎉 (레이팅 ${p().r}) 나랑 한 판 할래?`) }, newly.length ? { label: '테마 바꾸기', fn: themeSheet } : { label: '확인' }] });
  }
  function confetti() {
    const c = document.createElement('canvas'); c.className = 'tg-confetti'; document.body.appendChild(c);
    const W = c.width = innerWidth * 2, H = c.height = innerHeight * 2, g = c.getContext('2d');
    const P = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .45, vx: (Math.random() - .5) * 26, vy: -Math.random() * 34 - 10, r: 6 + Math.random() * 8, a: Math.random() * 6, c: ['#ffe39a', '#f0cf7a', '#8ff0a4', '#9cc5ff', '#ff9a9a', '#fff'][(Math.random() * 6) | 0] }));
    const t0 = performance.now();
    (function f(t) { const k = (t - t0) / 1000; g.clearRect(0, 0, W, H);
      P.forEach(q => { q.vy += 1.1; q.x += q.vx; q.y += q.vy; q.a += .2; g.save(); g.translate(q.x, q.y); g.rotate(q.a); g.globalAlpha = Math.max(0, 1 - k / 2.6); g.fillStyle = q.c; g.fillRect(-q.r / 2, -q.r / 4, q.r, q.r / 2); g.restore(); });
      if (k < 2.6) requestAnimationFrame(f); else c.remove(); })(t0);
  }
  function playRated() {
    const s = strengthFor(p().r);
    if (ID === 'chess') G.start('cpu', 10 + s); else G.start('cpu', 10 + s);
    if (window.Monetize) Monetize.log('rated_start', { strength: s, rating: p().r });
  }
  function achSheet() {
    const box = document.createElement('div'); const s = p();
    box.innerHTML = `<p class="tg-note">${Object.keys(s.ach).length} / ${ACH.length} 달성</p>`;
    ACH.forEach(a => { const done = !!s.ach[a[0]]; const row = document.createElement('div'); row.className = 'tg-row' + (done ? '' : ' dim');
      row.innerHTML = `<span class="t"><b>${done ? '🏅' : '🔒'} ${a[1]}</b><small>${a[2]}</small></span><span class="tg-pill ${done ? 'win' : ''}">+${a[3]}</span>`; box.appendChild(row); });
    const h = document.createElement('p'); h.className = 'tg-note'; h.style.marginTop = '14px'; h.innerHTML = '<b>이번 주 미션</b>'; box.appendChild(h);
    const w = wk(); MISSIONS.forEach(m => { const v = Math.min(m[2], w[m[0]] || 0); const row = document.createElement('div'); row.className = 'tg-row';
      row.innerHTML = `<span class="t"><b>${v >= m[2] ? '✅' : '🎯'} ${m[1]}</b><small>${v} / ${m[2]}</small><span class="tg-prog"><i style="width:${Math.round(v / m[2] * 100)}%"></i></span></span><span class="tg-pill ${v >= m[2] ? 'win' : ''}">+${m[3]}</span>`; box.appendChild(row); });
    Meta.sheet('업적·주간 미션', box);
  }
  function themeSheet() {
    if (ID === 'chess') { const b = document.getElementById('themeBtn') || document.querySelector('[data-act-theme]'); Meta.closeModal(); if (b) { b.click(); return; } Meta.toast('게임 화면의 더보기에서 테마를 바꿀 수 있어요'); return; }
    const box = document.createElement('div'); let cur = 'classic'; try { cur = localStorage.getItem(THEME_KEY) || 'classic'; } catch (e) {}
    THEMES.forEach(th => { const ok = unlocked(th); const b = document.createElement('button'); b.type = 'button'; b.className = 'tg-row' + (ok ? '' : ' dim');
      const sw = th.wood ? th.wood.base : '#b98540', st = th.stones || {};
      const hex = v => '#' + (v || 0).toString(16).padStart(6, '0');
      b.innerHTML = `<span class="tg-sw" style="background:${sw}"><i style="background:${st.black ? hex(st.black) : '#16171a'}"></i><i style="background:${st.white ? hex(st.white) : '#f6f2ea'}"></i></span><span class="t"><b>${th.name}</b><small>${ok ? (cur === th.id ? '사용 중' : '눌러서 적용') : '🪙 ' + th.price.toLocaleString() + '코인 또는 ' + rankOf(th.need).name + ' 달성'}</small></span><span class="tg-pill ${cur === th.id ? 'go' : ''}">${ok ? (cur === th.id ? '✓' : '적용') : '🪙 ' + th.price}</span>`;
      b.onclick = () => { if (!ok) { if (Meta.spend(th.price, 'theme_' + th.id)) { owned()[th.id] = 1; Meta.save(); Meta.toast('🎨 ' + th.name + ' 테마를 열었어요!'); Meta.closeSheet(); setTimeout(themeSheet, 250); } return; }
        try { localStorage.setItem(THEME_KEY, th.id); } catch (e) {} if (window.Monetize) Monetize.log('theme', { id: th.id }); location.reload(); };
      box.appendChild(b); });
    Meta.sheet('보드·돌 테마', box);
  }

  // ---- first 5 minutes ----
  const RULES = {
    omok: ['가로·세로·대각선으로 내 돌 5개를 먼저 이으면 이겨요', '흑은 3-3, 4-4, 6목 자리에 둘 수 없어요 (금수)', '막히면 💡힌트 — 첫 판은 무제한이에요'],
    janggi: ['상대 궁(漢)을 외통으로 잡으면 이겨요', '말을 누르면 갈 수 있는 자리가 표시돼요', '처음이면 "장기 배우기"로 말 움직임부터 익혀요'],
    baduk: ['돌로 집(빈 땅)을 더 많이 둘러싸면 이겨요', '숨 쉴 곳(활로)이 모두 막힌 돌은 따내져요', '처음엔 9줄 바둑판으로 시작해요'],
    chess: ['상대 킹을 체크메이트하면 이겨요', '말을 누르면 갈 수 있는 칸이 표시돼요', '막히면 💡힌트 — 첫 판은 무제한이에요'],
    uno: ['같은 부서(색)나 같은 숫자 카드를 내요', '손패를 먼저 다 내면 이겨요 — 한 장 남으면 [원카드!]', '🏖️반차 ↩️반려 📎+2 🌙+4 특수 카드로 상대를 괴롭혀요'],
  }[ID] || [];
  function onboarding() {
    const s = p(); if (s.onboarded || Meta.data.finished > 0) return;
    s.onboarded = true; Meta.save();
    const acts = [{ label: '바로 한 판 (쉬운 상대)', fn: () => { G.start('cpu', 11); setTimeout(() => Meta.toast('💡 막히면 힌트를 눌러 보세요 — 첫 판은 무제한', 3200), 1200); } }];
    if (ID === 'uno') acts.push({ label: '규칙 배우기', fn: () => { try { UnoTutorial.open(); } catch (e) {} } });
    if (ID === 'janggi') acts.push({ label: '장기 배우기', fn: () => { try { JanggiTutorial.open(); } catch (e) { Meta.toast('설정의 "장기 배우기"를 눌러 보세요'); } } });
    if (ID === 'chess') acts.push({ label: '트레이닝으로 배우기', fn: () => { const c = document.querySelector('#modeCards [data-mode="training"]'); if (c) c.click(); } });
    acts.push({ label: '둘러볼게요' });
    setTimeout(() => Meta.modal({ icon: { omok: '⚫', janggi: '將', baduk: '◍', chess: '♛', uno: '🃏' }[ID], kicker: '환영해요!', title: Meta.NAME + ' 시작하기', sub: RULES.map(x => '· ' + x).join('\n'), actions: acts }), 700);
  }

  // ---- hub card ----
  Meta.addHubPart({
    act: 'rated', top: true,
    html: () => {
      const s = p(), rk = rankOf(s.r), pct = Math.max(4, Math.min(100, Math.round((s.r - rk.lo) / (rk.hi - rk.lo) * 100)));
      const d = lastDelta ? ` <em class="${lastDelta > 0 ? 'up' : 'dn'}">(${lastDelta > 0 ? '+' : ''}${lastDelta})</em>` : '';
      return `<div class="tg-rank"><div class="tg-rank-top"><span class="tg-badge">${ID === 'uno' ? '💼' : rk.dan ? '🥋' : '🎓'}</span><span class="t"><b>${rk.name}</b><small>레이팅 ${s.r}${d} · ${s.games}판</small></span>
        <button type="button" data-act="ach">🏅 ${Object.keys(s.ach).length}</button>${ID === 'uno' ? '' : '<button type="button" data-act="theme">🎨</button>'}</div>
        <span class="tg-prog"><i style="width:${pct}%"></i></span>
        <button type="button" class="tg-btn pri tg-rated" data-act="rated">⚔️ 실력에 맞는 상대와 한 판</button></div>`;
    },
    click: playRated,
  });
  Meta.addHubPart({ act: 'ach', html: () => '', click: achSheet });
  Meta.addHubPart({ act: 'theme', html: () => '', click: themeSheet });
  Meta.onEnd(onEnd);

  // HUD names for the rated CPU ("CPU 6단계")
  const prevNames = window.UIX_SIDE_NAMES;
  window.UIX_SIDE_NAMES = g => {
    const r = prevNames && prevNames(g); if (r) return r;
    if (g !== ID) return null; const st = G.state(); if (st.mode !== 'cpu' || !(st.level > 10)) return null;
    const S = { omok: ['흑', '백'], janggi: ['초', '한'], baduk: ['흑', '백'], chess: ['은색', '검은색'] }[ID];
    return [['나', S[0]], ['CPU ' + (st.level - 10) + '단계', S[1]]];
  };
  const ready = Meta.init(G).then(() => { p(); Meta.renderHub(); onboarding(); });
  return { ready, rankOf, rating: () => p().r, award, bump, themeSheet, achSheet, confetti };
})();

window.Progress = Progress;
