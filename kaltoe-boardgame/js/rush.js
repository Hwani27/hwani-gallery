/* ===== ⚡ 퍼즐 러시 — 3분 동안, 목숨 3개로, 문제를 최대한 많이 =====
   Problems get harder as the score climbs (쉬움 → 보통 → 어려움 → 최고 난도).
   A run can be continued once with a rewarded ad (+1 목숨). Best score is kept per game. */
const Rush = (function () {
  const ID = window.GAME_ID, K = window.PuzzleKit;
  const G = { omok: () => Omok, janggi: () => Janggi, baduk: () => Baduk, chess: () => ChessApp, uno: () => Uno }[ID]();
  if (!K || !K.P.length) return null;
  const DUR = 180, LIVES = 3;
  let run = null, hud = null, timer = 0;

  const tierFor = s => (s < 3 ? 0 : s < 6 ? 1 : s < 10 ? 2 : 3);
  function pickIdx() {
    for (let t = tierFor(run.score); t >= 0; t--) {
      const L = K.buckets[t].filter(i => !run.used.has(i));
      if (L.length) return L[(Math.random() * L.length) | 0];
    }
    run.used.clear(); return (Math.random() * K.P.length) | 0;
  }
  const best = () => (Meta.data.rush && Meta.data.rush.best) || 0;
  const left = () => Math.max(0, Math.ceil((run.deadline - Date.now()) / 1000));

  function draw() {
    if (!run) return;
    if (!hud) { hud = document.createElement('div'); hud.className = 'tg-rush'; document.body.appendChild(hud); }
    const s = left(), mm = Math.floor(s / 60), ss = String(s % 60).padStart(2, '0');
    hud.innerHTML = `<b>⚡ 퍼즐 러시</b><span class="${s <= 15 ? 'hot' : ''}">⏱ ${mm}:${ss}</span><span>${'❤️'.repeat(run.lives)}${'🤍'.repeat(Math.max(0, LIVES - run.lives))}</span><span class="sc">✔ ${run.score}</span>`;
    hud.style.display = '';
  }
  function start() {
    Meta.closeSheet(); Meta.closeModal();
    run = { score: 0, lives: LIVES, deadline: Date.now() + DUR * 1000, used: new Set(), token: Math.random(), continued: false };
    document.body.classList.add('tg-rushing');
    clearInterval(timer); timer = setInterval(() => { if (!run) return; draw(); if (left() <= 0) finish('time'); }, 250);
    if (window.Monetize) Monetize.log('rush_start', {});
    next();
  }
  function next() {
    if (!run) return;
    const i = pickIdx(); run.used.add(i); const tok = run.token;
    draw();
    K.start(i, r => {
      if (!run || run.token !== tok) return;           // run ended meanwhile
      if (r.solved) { run.score++; flash('+1', 'ok'); }
      else { run.lives--; flash('💔', 'bad'); }
      draw();
      if (run.lives <= 0) { finish('lives'); return; }
      if (left() <= 0) { finish('time'); return; }
      setTimeout(next, 450);
    });
  }
  function flash(t, cls) {
    const f = document.createElement('div'); f.className = 'tg-rush-pop ' + cls; f.textContent = t; document.body.appendChild(f);
    setTimeout(() => f.remove(), 900);
  }
  function stop() { run = null; clearInterval(timer); if (hud) hud.style.display = 'none'; document.body.classList.remove('tg-rushing'); }
  function finish(why) {
    if (!run) return;
    const r = run; stop();
    const d = Meta.data; d.rush = d.rush || { best: 0, runs: 0 }; d.rush.runs++;
    const isBest = r.score > d.rush.best; if (isBest) d.rush.best = r.score;
    Meta.save(); Meta.addPoints(r.score * 2); Meta.renderHub();
    if (window.Monetize) Monetize.log('rush_end', { score: r.score, why });
    if (window.Chest && r.score >= 5) Chest.grant('rush');
    const acts = [];
    if (why === 'lives' && !r.continued && r.deadline - Date.now() > 10000 && window.Monetize) acts.push({ label: '🎬 광고 보고 ❤️ +1 이어하기', fn: async () => {
      if (!(await Monetize.reward('rush_continue'))) return;
      run = Object.assign(r, { lives: 1, continued: true, token: Math.random() }); document.body.classList.add('tg-rushing');
      clearInterval(timer); timer = setInterval(() => { if (!run) return; draw(); if (left() <= 0) finish('time'); }, 250); next();
    } });
    if (why === 'lives' && !r.continued && r.deadline - Date.now() > 10000) acts.push({ label: '🪙 50코인으로 ❤️ +1 이어하기', fn: () => {
      if (!Meta.spend(50, 'rush_continue')) return;
      run = Object.assign(r, { lives: 1, continued: true, token: Math.random() }); document.body.classList.add('tg-rushing');
      clearInterval(timer); timer = setInterval(() => { if (!run) return; draw(); if (left() <= 0) finish('time'); }, 250); next();
    } });
    acts.push({ label: '친구에게 기록 자랑하기', fn: () => Meta.share(`⚡ ${Meta.NAME} 퍼즐 러시 ${r.score}문제! ${isBest ? '(내 최고 기록 🏆)' : ''}\n3분 안에 나보다 많이 풀 수 있어?`) });
    if (window.Chest && Chest.pending() > 0) acts.push({ label: '🎁 상자 열기 (' + Chest.pending() + ')', fn: () => Chest.open() });
    acts.push({ label: '한 번 더', fn: start }, { label: '그만하기', fn: () => G.openSetup() });
    Meta.modal({ icon: isBest ? '🏆' : '⚡', kicker: '퍼즐 러시 · ' + (why === 'time' ? '시간 종료' : '목숨 소진'), title: r.score + '문제', sub: isBest ? '새 최고 기록이에요!' : '최고 기록 ' + d.rush.best + '문제',
      chips: ['+' + r.score * 2 + ' 코인'], actions: acts });
    if (isBest && r.score > 0 && typeof SFX !== 'undefined' && SFX.achieve) SFX.achieve();
  }

  // leaving the board ends the run
  const origSetup = G.openSetup;
  G.openSetup = function () { if (run) stop(); return origSetup.apply(G, arguments); };
  Meta.onBack(() => { if (!run) return false; stop(); G.openSetup(); return true; });
  Meta.addHubPart({
    act: 'rush',
    html: () => `<button type="button" class="tg-friend tg-rushcard" data-act="rush"><span class="tg-d-ic">⚡</span><span class="tg-d-t"><b>퍼즐 러시</b><small>3분 · 목숨 3개 · 점점 어려워져요</small></span><span class="tg-d-st">${best() ? '최고 ' + best() : '도전'}</span></button>`,
    click: start,
  });
  return { start, stop, active: () => !!run };
})();

window.Rush = Rush;
