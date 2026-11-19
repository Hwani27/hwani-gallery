/* ===== 오늘의 문제 (all three games) + 연습 문제 + 친구 도전장 =====
   window.PUZZLES comes from tools/gen-<game>-puzzles.mjs; every puzzle was solved by the engine
   when it was generated, and in play the CPU defends at full strength, so any winning line counts.
   The week has a rhythm: 월·화 쉬움 → 수·목 보통 → 금·토 어려움 → 일요일 가장 어려움. */
(function () {
  const ID = window.GAME_ID, P = window.PUZZLES || [];
  const G = { omok: () => Omok, janggi: () => Janggi, baduk: () => Baduk, chess: () => ChessApp, uno: () => Uno }[ID]();
  const CFG = {
    omok: { title: '오늘의 문제', icon: '🧩', kind: '오목 문제', start: (pz, cb) => G.startPuzzle(pz.b.split('').map(Number), pz.moves, cb),
      goal: n => n + '수 안에 이기기', fail: '모든 수를 4(사)로 두면 백은 막을 수밖에 없어요.',
      tier: m => (m <= 3 ? 0 : m === 4 ? 1 : m === 5 ? 2 : 3) },
    janggi: { title: '오늘의 박보', icon: '將', kind: '박보장기', start: (pz, cb) => G.startPuzzle(pz.b, pz.moves, cb),
      goal: n => n + '수 안에 외통', fail: '장군을 계속 부르며 한의 궁을 몰아붙여 보세요.',
      tier: m => (m <= 1 ? 0 : m === 2 ? 1 : m === 3 ? 2 : 3) },
    baduk: { title: '오늘의 따내기', icon: '◍', kind: '따내기 문제', start: (pz, cb) => G.startPuzzle(pz, cb),
      goal: n => n + '수 안에 잡기', fail: '빨간 테두리 돌이 숨 쉴 곳(활로)을 하나씩 막아 보세요.',
      tier: m => (m <= 2 ? 0 : m === 3 ? 1 : 2) },
    chess: { title: '오늘의 메이트', icon: '♛', kind: '체스 메이트 문제', start: (pz, cb) => G.startPuzzle(pz.b, pz.moves, cb),
      goal: n => n + '수 안에 메이트', fail: '체크를 이어가며 킹이 도망칠 칸을 하나씩 없애 보세요.',
      tier: m => (m <= 1 ? 0 : m === 2 ? 1 : m === 3 ? 2 : 3) },
  }[ID];
  // the engine's first move for the puzzle on the board right now (shown after a rewarded ad)
  const FIRST = {
    omok: async () => (await OmokAI.run('move', { board: [].concat(...Omok.board()), toPlay: 1, renju: true, maxDepth: 0, noise: 0, K: 8, vcf: true, ms: 600 })).move,
    janggi: async () => (await JanggiAI.run('move', { board: Janggi.board(), side: 0, maxDepth: 64, noise: 0, ms: 1500 })).move,
    baduk: async () => { const b = Baduk.board(), t = Baduk.state().target; for (let k = 1; k <= 5; k++) { const r = GoTactics.capture(b, 9, t, 1, k); if (r.move >= 0) return r.move; } return -1; },
    chess: async () => (await ChessAI.run('move', Object.assign(ChessApp.engineState(), { maxDepth: 64, noise: 0, ms: 1500 }))).move,
  }[ID];
  async function hintFirst(i, kind, paid) {
    if (!paid && !(window.Monetize ? await Monetize.reward('puzzle_hint') : true)) return;
    play(i, kind, sess && sess.challenge);
    setTimeout(async () => { const mv = await FIRST(); if (mv >= 0 && G.markHint) { G.markHint(mv); Meta.toast('💡 초록색이 첫 수예요', 2600); } }, 900);
  }
  const TIER = ['쉬움', '보통', '어려움', '최고 난도'];
  if (!P.length) { Meta.init(G); return; }

  const buckets = [[], [], [], []]; P.forEach((p, i) => buckets[Math.min(3, CFG.tier(p.moves))].push(i));
  const pick = (t, k) => { for (let d = 0; d < 4; d++) { const L = buckets[Math.max(0, Math.min(3, t - d))]; if (L.length) return L[k % L.length]; } return k % P.length; };
  function todayIdx() {
    const day = Meta.dayNumber(), wd = (day + 4) % 7, week = Math.floor(day / 7);   // 1970-01-01 was a Thursday
    if (wd === 0) return pick(3, week);
    if (wd <= 2) return pick(0, week * 2 + wd - 1);
    if (wd <= 4) return pick(1, week * 2 + wd - 3);
    return pick(2, week * 2 + wd - 5);
  }
  const level = pz => TIER[Math.min(3, CFG.tier(pz.moves))];
  const dayKey = () => Meta.kstKey(0).replace(/-/g, '');

  // one solving session: timer starts at the first attempt, tries count retries
  let sess = null;
  function play(i, kind, challenge) {
    if (!sess || sess.i !== i || sess.kind !== kind) sess = { i, kind, t0: Date.now(), tries: 0, challenge };
    sess.tries++;
    CFG.start(P[i], r => finish(r, i, kind));
    if (challenge && sess.tries === 1) setTimeout(() => Meta.toast(`친구 기록: ${challenge.sec}초 · ${challenge.tries}번째에 성공`, 3200), 2600);
  }
  function nextPractice() {
    let i = Meta.data.practice.idx % P.length; if (i === todayIdx()) i = (i + 1) % P.length;
    play(i, 'practice');
  }
  function open(solvedToday) { if (!solvedToday) play(todayIdx(), 'daily'); else nextPractice(); }

  function challengeText(sec, tries) {
    return `${CFG.icon} 오늘의 ${CFG.kind} · ${Meta.kstKey(0)}\n${sec}초 만에 풀었어요${tries > 1 ? ' (' + tries + '번째 시도)' : ' (한 번에!)'}\n내 기록을 이겨봐!`;
  }
  function finish(r, i, kind) {
    const pz = P[i];
    if (window.Monetize) Monetize.log(r.solved ? 'puzzle_solve' : 'puzzle_fail', { kind, idx: i, moves: pz.moves });
    if (!r.solved) {
      Meta.modal({
        icon: '🤔', kicker: (kind === 'practice' ? '연습 문제' : CFG.title) + ' · ' + level(pz), title: '아쉬워요', sub: CFG.fail + '\n' + CFG.goal(pz.moves) + '가 목표예요.',
        actions: [{ label: '다시 풀기', fn: () => play(i, kind, sess && sess.challenge) }, { label: '🎬 광고 보고 첫 수 힌트', fn: () => hintFirst(i, kind) }, { label: '🪙 20코인으로 첫 수 힌트', fn: () => { if (Meta.spend(20, 'puzzle_hint')) hintFirst(i, kind, true); } }, { label: '그만하기', fn: () => G.openSetup() }],
      });
      return;
    }
    const sec = Math.max(1, Math.round((Date.now() - sess.t0) / 1000)), tries = sess.tries, ch = sess.challenge;
    sess = null;
    const isToday = i === todayIdx();
    if (kind === 'daily' || (kind === 'challenge' && isToday)) {
      const res = Meta.markDailySolved(10), st = Meta.dailyState();
      if (SFX.solve) setTimeout(() => SFX.solve(), 150);
      if (res.first && window.Chest) Chest.grant('daily');
      if (res.first && window.Progress) { Progress.bump('puzzle'); if (st.streak >= 7) Progress.award('daily7'); if (st.streak >= 30) Progress.award('daily30'); if (st.total + Meta.data.practice.solved >= 50) Progress.award('puzzles50'); }
      if (res.first && (st.streak === 3 || st.streak === 7) && window.Monetize) Monetize.maybeAskReview('streak' + st.streak);
      const D = Meta.data.daily; if (res.first) { D.sec = sec; D.tries = tries; Meta.save(); }
      const code = Social.codeOf(`c.${dayKey()}.${i}.${D.sec || sec}.${D.tries || tries}`);
      const cmp = ch ? (sec < ch.sec ? `친구보다 ${ch.sec - sec}초 빨라요! 🏆` : sec === ch.sec ? '친구와 같은 기록이에요!' : `친구보다 ${sec - ch.sec}초 느려요. 다음엔 이겨봐요`) : '';
      Meta.modal({
        icon: '🎉', kicker: CFG.title + ' · ' + level(pz), title: res.first ? '정답!' : '또 맞혔어요',
        sub: (cmp ? cmp + '\n' : '') + (res.first ? '내일 새 문제가 열려요.' : '오늘 기록은 이미 저장됐어요.'),
        chips: ['⏱ ' + sec + '초', tries > 1 ? tries + '번째 시도' : '한 번에!', '🔥 ' + st.streak + '일 연속', res.first ? '+' + (10 + Math.min(st.streak, 7)) + ' 코인' : ''].filter(Boolean),
        actions: [].concat(window.Chest && Chest.pending() > 0 ? [{ label: '🎁 상자 열기 (' + Chest.pending() + ')', fn: () => Chest.open() }] : [], [{ label: '친구에게 도전장 보내기', fn: () => Social.send(challengeText(D.sec || sec, D.tries || tries), code) }, { label: '연습 문제 더 풀기', fn: nextPractice }, { label: '확인', fn: () => G.openSetup() }]),
      });
    } else if (kind === 'challenge') {
      const cmp = sec < ch.sec ? `친구보다 ${ch.sec - sec}초 빨라요! 🏆` : `친구 기록은 ${ch.sec}초였어요.`;
      Meta.modal({
        icon: '⚔️', kicker: '친구 도전장 · ' + level(pz), title: '정답!', sub: cmp + '\n(지난 문제라 연속 기록에는 들어가지 않아요)', chips: ['⏱ ' + sec + '초'],
        actions: [{ label: '오늘의 문제 풀기', fn: () => open(Meta.dailyState().solvedToday) }, { label: '확인', fn: () => G.openSetup() }],
      });
    } else {
      const pr = Meta.data.practice, pB = Meta.progressN(); pr.idx = i + 1; pr.solved++; Meta.checkUnlocks(pB); Meta.save(); Meta.addPoints(2); Meta.renderHub();
      if (window.Progress) { Progress.bump('puzzle'); if (Meta.dailyState().total + pr.solved >= 50) Progress.award('puzzles50'); }
      Meta.modal({
        icon: '✅', kicker: '연습 문제 · ' + level(pz), title: '정답!', chips: ['⏱ ' + sec + '초', '연습 ' + pr.solved + '문제', '+2 코인'],
        actions: [{ label: '다음 문제', fn: nextPractice }, { label: '그만하기', fn: () => G.openSetup() }],
      });
    }
  }

  // a friend's 도전장: open that puzzle with their record shown
  Social.onCode('c', c => {
    if (!(c.idx >= 0 && c.idx < P.length)) { Meta.toast('이 앱 버전에 없는 문제예요'); return; }
    const today = dayKey() === c.day && c.idx === todayIdx();
    sess = null; play(c.idx, today && !Meta.dailyState().solvedToday ? 'challenge' : 'challenge', { sec: c.sec, tries: c.tries });
  });

  window.UIX_SKIP_RESULT = g => g === ID && G.state().mode === 'puzzle';
  // shared with rush.js (퍼즐 러시)
  window.PuzzleKit = { P, buckets, level, start: (i, cb) => CFG.start(P[i], cb), title: CFG.title, kind: CFG.kind, icon: CFG.icon, goal: CFG.goal };
  Meta.init(G).then(() => Meta.setDaily({
    title: CFG.title, icon: CFG.icon, doneSub: '오늘 완료 · 연습 문제 더 풀기',
    sub: () => { const pz = P[todayIdx()]; return level(pz) + ' · ' + CFG.goal(pz.moves); }, open,
  }));
})();
