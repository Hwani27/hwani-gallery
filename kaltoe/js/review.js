/* ===== AI 복기 — after a game, the engine looks for the moves that decided it =====
   omok:   missed forced wins (five / VCF) and moves that let the opponent's VCF in
   janggi: score drop between the best move and the move played (mate missed / allowed, material)
   baduk:  win-rate drop by the MCTS engine
   The board then shows the position before each moment: green = better move, red = move played. */
const Review = (function () {
  const ID = window.GAME_ID;
  const G = { omok: () => Omok, janggi: () => Janggi, baduk: () => Baduk, chess: () => ChessApp, uno: () => Uno }[ID]();
  const MAX = 36;                       // analyse at most this many of your most recent moves
  let moments = [], at = 0, bar = null, cancelled = false;

  const sq15 = p => String.fromCharCode(65 + (p % 15)) + (15 - ((p / 15) | 0));
  async function analyseOmok(D, step) {
    const out = [], run = (board, toPlay, cfg) => OmokAI.run('move', Object.assign({ board, toPlay, renju: true, maxDepth: 0, noise: 0, K: 8, vcf: true, ms: 300 }, cfg));
    const mine = D.moves.map((m, i) => [m, i]).filter(([m]) => m.mine).slice(-MAX);
    for (const [m, i] of mine) {
      if (cancelled) return out; step();
      const opp = 3 - m.toPlay, post = m.board.slice(); post[m.played] = m.toPlay;
      if (i === D.moves.length - 1 && D.mode !== 'mail') { /* the last move: if it won, nothing to say */ }
      const r1 = await run(m.board, m.toPlay, {});
      if (r1 && r1.move >= 0 && r1.move !== m.played && (r1.why === 'five' || r1.why === 'vcf')) {
        const ro = await run(post, opp, {});
        if (!(ro && ro.why === 'block')) { out.push({ i, best: r1.move, played: m.played, sev: r1.why === 'five' ? 3 : 2, text: r1.why === 'five' ? `${sq15(r1.move)}에 두면 바로 오목이었어요` : `${sq15(r1.move)}부터 4를 연달아 두면 이기는 자리였어요` }); continue; }
      }
      const ro = await run(post, opp, {});
      if (ro && (ro.why === 'five' || ro.why === 'vcf')) {
        const rb = await run(m.board, m.toPlay, { maxDepth: 2, ms: 400 });
        if (rb && rb.move >= 0 && rb.move !== m.played) {
          const post2 = m.board.slice(); post2[rb.move] = m.toPlay;
          const ro2 = await run(post2, opp, {});
          if (!(ro2 && (ro2.why === 'five' || ro2.why === 'vcf'))) out.push({ i, best: rb.move, played: m.played, sev: 1, text: `이 수 뒤에 상대가 필승 수순을 잡았어요. ${sq15(rb.move)}로 막아야 했어요` });
        }
      }
    }
    return out;
  }
  const MATE = 100000, HAN = { 1: '궁', 2: '사', 3: '상', 4: '마', 5: '차', 6: '포', 7: '졸' };
  const JONG = { 궁: 1, 상: 1, 졸: 1 };             // ends in a consonant → 을/으로
  const eul = w => w + (JONG[w] ? '을' : '를'), ro = w => w + (JONG[w] && w !== '졸' ? '으로' : '로');
  async function analyseJanggi(D, step) {
    const out = [], run = (board, side, cfg) => JanggiAI.run('move', Object.assign({ board, side, maxDepth: 3, noise: 0, ms: 260 }, cfg));
    const mine = D.moves.map((m, i) => [m, i]).filter(([m]) => m.mine).slice(-MAX);
    for (const [m, i] of mine) {
      if (cancelled) return out; step();
      const rb = await run(m.board, m.side, {});
      if (!rb || rb.move < 0 || rb.move === m.played) continue;
      const post = m.board.slice(), f = m.played & 127, t = m.played >> 7; post[t] = post[f]; post[f] = 0;
      const rp = await run(post, m.side ^ 8, { maxDepth: 2, ms: 220 });
      if (!rp) continue;
      const sb = rb.score, sp = rp.move < 0 ? MATE : -rp.score, loss = sb - sp;
      const piece = HAN[m.board[rb.move & 127] & 7] || '기물';
      if (sb > MATE - 1000 && sp < MATE - 1000) out.push({ i, best: rb.move, played: m.played, sev: 3 + loss / 1e6, text: `${ro(piece)} 외통을 만들 수 있었어요` });
      else if (sp < -(MATE - 1000) && sb > -(MATE - 1000)) out.push({ i, best: rb.move, played: m.played, sev: 2.5 + loss / 1e6, text: `이 수 뒤에 외통을 당해요. ${eul(piece)} 움직여 막아야 했어요` });
      else if (loss >= 180) out.push({ i, best: rb.move, played: m.played, sev: 1 + loss / 1e4, text: `${eul(piece)} 움직이는 편이 나았어요 (약 졸 ${Math.max(1, Math.round(loss / 200))}개만큼 손해)` });
    }
    return out;
  }
  const CK = { 1: '폰', 2: '나이트', 3: '비숍', 4: '룩', 5: '퀸', 6: '킹' }, CJ = { 폰: 0, 나이트: 0, 비숍: 0, 룩: 1, 퀸: 0, 킹: 1 };
  async function analyseChess(D, step) {
    const out = [], sqn = p => 'abcdefgh'[p & 7] + (8 - (p >> 3));
    const run = (st, cfg) => ChessAI.run('move', Object.assign({ board: st.board, side: st.side, cr: st.cr, ep: st.ep, maxDepth: 4, noise: 0, ms: 300 }, cfg));
    const mine = D.moves.map((m, i) => [m, i]).filter(([m]) => m.mine).slice(-MAX);
    for (const [m, i] of mine) {
      if (cancelled) return out; step();
      const rb = await run(m, {});
      if (!rb || rb.move < 0 || (rb.move & 4095) === (m.played & 4095)) continue;
      // position after the played move, from the next entry of the review data when there is one
      const nx = D.moves[i + 1];
      let sp;
      if (nx) { const rp = await run(nx, { maxDepth: 3, ms: 260 }); if (!rp) continue; sp = rp.move < 0 ? 0 : -rp.score; }
      else continue;
      const sb = rb.score, loss = sb - sp;
      const pc = CK[m.board[rb.move & 63] & 7] || '기물', eul = w => w + (CJ[w] ? '을' : '를'), ro = w => w + (CJ[w] ? '으로' : '로');
      const mv = sqn(rb.move & 63) + '→' + sqn((rb.move >> 6) & 63);
      if (sb > MATE - 1000 && sp < MATE - 1000) out.push({ i, best: rb.move, played: m.played, sev: 3, text: `${ro(pc)} 메이트할 수 있었어요 (${mv})` });
      else if (sp < -(MATE - 1000) && sb > -(MATE - 1000)) out.push({ i, best: rb.move, played: m.played, sev: 2.5, text: `이 수 뒤에 메이트를 당해요. ${mv}로 막아야 했어요` });
      else if (loss >= 150) out.push({ i, best: rb.move, played: m.played, sev: 1 + loss / 1e4, text: `${eul(pc)} ${mv}로 두는 편이 나았어요 (약 폰 ${Math.max(1, Math.round(loss / 100))}개만큼 손해)` });
    }
    return out;
  }
  async function analyseBaduk(D, step) {
    const out = [], N = D.N, L = 'ABCDEFGHJKLMNOPQRST', sq = p => L[p % N] + (N - ((p / N) | 0));
    const run = (board, toPlay, ko) => BadukAI.run('move', { N, board, toPlay, ko, komi: D.komi, ms: N === 9 ? 260 : 380, maxPO: 300000, topK: 1, tactics: true });
    const mine = D.moves.map((m, i) => [m, i]).filter(([m]) => m.mine && m.played >= 0).slice(-MAX);
    for (const [m, i] of mine) {
      if (cancelled) return out; step();
      const rb = await run(m.board, m.toPlay, m.ko);
      if (!rb || rb.move < 0 || rb.move === m.played) continue;
      const b = m.board.slice(); b.ko = m.ko; const post = GoTactics.play(b, N, m.played, m.toPlay, m.ko);
      if (!post) continue;
      const ra = await run(Array.from(post), 3 - m.toPlay, post.ko);
      if (!ra) continue;
      const before = rb.winrate, after = 1 - ra.winrate, drop = before - after;
      if (drop >= 0.15 && before > 0.2) out.push({ i, best: rb.move, played: m.played, sev: drop, text: `${sq(rb.move)} 자리가 더 좋았어요 · 예상 승률 ${Math.round(before * 100)}% → ${Math.round(after * 100)}%` });
    }
    return out;
  }

  async function run() {
    if (window.MonetizeGate && !(await window.MonetizeGate('review'))) return;
    if (window.Monetize) Monetize.log('review_run', {});
    if (window.Progress && Meta.data) { Meta.data.reviews = (Meta.data.reviews || 0) + 1; Meta.save(); if (Meta.data.reviews >= 5) Progress.award('review5'); }
    const D = G.reviewData(); if (!D || !D.moves.length) { Meta.toast('복기할 수가 없어요'); return; }
    const total = Math.min(MAX, D.moves.filter(m => m.mine).length);
    cancelled = false; let done = 0;
    const box = document.createElement('div');
    box.innerHTML = '<p class="tg-note">AI가 내가 둔 수를 하나씩 다시 읽고 있어요.</p><div class="tg-prog"><i></i></div><p class="tg-note" style="text-align:right"><span>0</span> / ' + total + '</p>';
    const sh = Meta.sheet('AI 복기 중…', box);
    sh.querySelector('.tg-sheet-close').onclick = () => { cancelled = true; Meta.closeSheet(); };
    const step = () => { done++; box.querySelector('i').style.width = Math.round(done / Math.max(1, total) * 100) + '%'; box.querySelector('span').textContent = done; };
    const found = await ({ omok: analyseOmok, janggi: analyseJanggi, baduk: analyseBaduk, chess: analyseChess }[ID])(D, step);
    if (cancelled) return;
    moments = found.sort((a, b) => b.sev - a.sev).slice(0, 3).sort((a, b) => a.i - b.i);
    summary();
  }
  function summary() {
    const box = document.createElement('div');
    if (!moments.length) box.innerHTML = '<p class="tg-note" style="font-size:14px;color:#e6dcc6">결정적인 실수를 찾지 못했어요 👍<br>좋은 대국이었어요.</p>';
    else {
      box.innerHTML = '<p class="tg-note">승부를 가른 순간이에요. 눌러서 보드에서 확인해 보세요.</p>';
      moments.forEach((m, k) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tg-row';
        b.innerHTML = `<span class="t"><b>${m.i + 1}수째</b><small></small></span><span class="tg-pill go">보기</span>`;
        b.querySelector('small').textContent = m.text; b.onclick = () => show(k); box.appendChild(b);
      });
    }
    Meta.sheet('AI 복기', box);
  }
  function show(k) {
    Meta.closeSheet(); Meta.closeModal(); if (window.UIX && UIX.closeResult) UIX.closeResult(false);
    at = k; const m = moments[k]; G.showReview(m.i, m.best, m.played);
    document.body.classList.add('tg-reviewing');
    if (!bar) { bar = document.createElement('div'); bar.className = 'tg-rbar'; document.body.appendChild(bar); }
    bar.innerHTML = `<div class="k">AI 복기 ${k + 1} / ${moments.length} · ${m.i + 1}수째</div><div class="tx"></div><div class="lg">🟢 더 좋았던 수 · 🔴 실제로 둔 수</div><div class="bt"><button type="button">◀ 이전</button><button type="button">다음 ▶</button><button type="button" class="pri">복기 끝</button></div>`;
    bar.querySelector('.tx').textContent = m.text;
    const [p, n, e] = bar.querySelectorAll('button');
    p.disabled = k === 0; n.disabled = k === moments.length - 1;
    p.onclick = () => show(k - 1); n.onclick = () => show(k + 1); e.onclick = end;
    bar.style.display = '';
  }
  function end() { G.endReview(); document.body.classList.remove('tg-reviewing'); if (bar) bar.style.display = 'none'; }
  const reviewing = () => document.body.classList.contains('tg-reviewing');

  Meta.addResultButton((R, btn, last) => {
    if (!last || !['cpu', 'arcade', 'mail'].includes(last.info.mode)) return;
    btn('', 'eye', 'AI 복기', 'review', () => { if (window.UIX && UIX.closeResult) UIX.closeResult(false); run(); });
  });
  Meta.onBack(() => { if (reviewing()) { end(); return true; } return false; });
  return { run, end };
})();

window.Review = Review;
