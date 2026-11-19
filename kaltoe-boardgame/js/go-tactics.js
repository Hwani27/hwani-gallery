/* ===== Go capture reading (따내기 문제) — shared by the puzzle generator (node) and the game =====
   Board: flat array of N*N, 0 empty, 1 black, 2 white. A "target" is any stone of the group to capture.
   capture(b, N, target, attacker, k): can `attacker`, moving first, remove the target group within k of
   its own moves against the best defence? Defender replies are the group's liberties and captures of
   attacking stones next to it — the usual capture-search move set. */
var GoTactics = (function () {
  function nbrs(N, p) { const r = (p / N) | 0, c = p % N, out = []; if (r > 0) out.push(p - N); if (r < N - 1) out.push(p + N); if (c > 0) out.push(p - 1); if (c < N - 1) out.push(p + 1); return out; }
  function group(b, N, p) {
    const col = b[p], seen = new Set([p]), st = [p], stones = [], libs = new Set();
    while (st.length) { const q = st.pop(); stones.push(q); for (const n of nbrs(N, q)) { if (b[n] === 0) libs.add(n); else if (b[n] === col && !seen.has(n)) { seen.add(n); st.push(n); } } }
    return { stones, libs: [...libs] };
  }
  // returns new board or null if illegal (occupied, suicide, ko retake)
  function play(b, N, p, col, ko) {
    if (b[p] !== 0 || p === ko) return null;
    const nb = b.slice(); nb[p] = col; const opp = 3 - col; let cap = [];
    for (const n of nbrs(N, p)) if (nb[n] === opp) { const g = group(nb, N, n); if (!g.libs.length) { for (const s of g.stones) nb[s] = 0; cap = cap.concat(g.stones); } }
    if (!group(nb, N, p).libs.length) return null;
    let nko = -1;
    if (cap.length === 1) { const g = group(nb, N, p); if (g.stones.length === 1 && g.libs.length === 1) nko = cap[0]; }
    nb.ko = nko; nb.cap = cap; return nb;
  }
  let nodes = 0; const LIMIT = 60000;
  function attack(b, N, t, att, k) {
    if (b[t] === 0) return -2;                                // already captured
    if (k <= 0 || ++nodes > LIMIT) return -1;
    const g = group(b, N, t);
    if (g.libs.length > k) return -1;                          // too many liberties to fill in time
    for (const m of g.libs) {
      const nb = play(b, N, m, att, b.ko); if (!nb) continue;
      if (nb[t] === 0) return m;
      if (!defend(nb, N, t, att, k - 1)) return m;
    }
    return -1;
  }
  function defenceMoves(b, N, t, att) {
    const g = group(b, N, t), set = new Set(g.libs);
    // capture an adjacent attacking group that is in atari
    const seen = new Set();
    for (const s of g.stones) for (const n of nbrs(N, s)) if (b[n] === att && !seen.has(n)) {
      const ag = group(b, N, n); ag.stones.forEach(x => seen.add(x));
      if (ag.libs.length === 1) set.add(ag.libs[0]);
    }
    return [...set];
  }
  // true if the defender survives (the attacker can't capture within k more attacker moves)
  function defend(b, N, t, att, k) {
    if (b[t] === 0) return false;
    if (++nodes > LIMIT) return true;
    const g = group(b, N, t);
    if (g.libs.length > k + 1) return true;
    let any = false;
    for (const m of defenceMoves(b, N, t, att)) {
      const nb = play(b, N, m, 3 - att, b.ko); if (!nb) continue; any = true;
      if (nb[t] !== 0 && attack(nb, N, t, att, k) < 0) return true;
    }
    // the defender may also tenuki: if even a free move elsewhere doesn't save it, it's lost
    if (!any) return attack(b, N, t, att, k) < 0;
    return false;
  }
  function capture(b, N, t, att, k) { nodes = 0; const a = b.slice(); a.ko = b.ko === undefined ? -1 : b.ko; const m = attack(a, N, t, att, k); return { move: m, nodes }; }
  // smallest k (1..maxK) that captures, or 0
  function minMoves(b, N, t, att, maxK) { for (let k = 1; k <= maxK; k++) { const r = capture(b, N, t, att, k); if (r.move >= 0 || r.move === -2) return nodes > LIMIT ? 0 : k; if (nodes > LIMIT) return 0; } return 0; }
  // best defensive reply for the game's CPU: refute if possible, otherwise make the attacker work hardest
  function bestDefence(b, N, t, att, k) {
    const a = b.slice(); a.ko = b.ko === undefined ? -1 : b.ko;
    let best = -1, bestNeed = -1;
    for (const m of defenceMoves(a, N, t, att)) {
      const nb = play(a, N, m, 3 - att, a.ko); if (!nb) continue;
      nodes = 0; let need = 0;
      for (let kk = 1; kk <= k + 2; kk++) { nodes = 0; if (attack(nb, N, t, att, kk) >= 0) { need = kk; break; } }
      const score = need === 0 ? 99 : need;
      if (score > bestNeed) { bestNeed = score; best = m; }
    }
    return best;
  }
  return { group, play, capture, minMoves, bestDefence, nbrs };
})();
if (typeof module !== 'undefined') module.exports = GoTactics;
