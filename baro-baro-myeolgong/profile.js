/* 지금 바로 멸공 — player profile and title menu (v20).
   Owns the save (rank XP, best record per stage, difficulty, mode) and
   builds the title screen: rank badge, campaign button, mode and difficulty
   switches, stage cards. Loaded before engine.js, which binds the sound and
   graphics switches this file creates. rail.js reads MGProfile at the start
   of a mission and reports the result back with MGProfile.record(). */
(function () {
  const ko = (document.documentElement.lang || "ko").toLowerCase().indexOf("ko") === 0;
  const KEY = "myeolgong_profile";

  /* ---- ranks: ROK Army order, enlisted → NCO → officers → generals ---- */
  const RANKS = [
    ["훈련병", "RECRUIT", 0], ["이병", "PRIVATE", 300], ["일병", "PRIVATE 1ST", 800], ["상병", "CORPORAL", 1600],
    ["병장", "SERGEANT", 2800], ["하사", "STAFF SGT", 4500], ["중사", "SGT 1ST CLASS", 6800], ["상사", "MASTER SGT", 9800],
    ["원사", "SGT MAJOR", 13500], ["준위", "WARRANT OFFICER", 18000], ["소위", "2ND LIEUTENANT", 23500], ["중위", "1ST LIEUTENANT", 30000],
    ["대위", "CAPTAIN", 38000], ["소령", "MAJOR", 47000], ["중령", "LT COLONEL", 58000], ["대령", "COLONEL", 71000],
    ["준장", "BRIG GENERAL", 86000], ["소장", "MAJ GENERAL", 104000], ["중장", "LT GENERAL", 125000], ["대장", "GENERAL", 150000]
  ];
  /* what each rank brings into the field */
  const PERKS = [
    [2, { nades: 1 }, "수류탄 +1", "+1 grenade"],
    [4, { hp: 110 }, "최대 체력 110", "Max HP 110"],
    [6, { reload: 0.85 }, "재장전 15% 빠르게", "Reload 15% faster"],
    [8, { lives: 1 }, "목숨 +1", "+1 life"],
    [10, { hp: 125 }, "최대 체력 125", "Max HP 125"],
    [13, { nades: 2 }, "수류탄 +2", "+2 grenades"],
    [16, { lives: 2 }, "목숨 +2", "+2 lives"]
  ];
  const DIFFS = {
    easy: { ko: "훈련", en: "EASY", dmg: 0.6, aim: 1.3, lives: 4, boss: 0.8, xp: 0.7 },
    normal: { ko: "보통", en: "NORMAL", dmg: 1, aim: 1, lives: 3, boss: 1, xp: 1 },
    hard: { ko: "정예", en: "ELITE", dmg: 1.4, aim: 0.78, lives: 2, boss: 1.3, xp: 1.5 }
  };
  /* in war order: the fall and the retreat, the landing, the advance north */
  const STAGES = [
    { id: 6, lab: "1-1", ch: 1, ko: "서울 함락", en: "FALL OF SEOUL", sub: "20XX.6 · SEOUL", subEn: "20XX.6 · SEOUL", boss: "적 전차", bossEn: "TANK", c: "#6a2a1c" },
    { id: 7, lab: "1-2", ch: 1, ko: "대전", en: "DAEJEON", sub: "EXPO · 지연전", subEn: "EXPO · DELAY", boss: "적 지휘관", bossEn: "COMMANDER", c: "#2f5a7a" },
    { id: 8, lab: "1-3", ch: 1, ko: "대구", en: "DAEGU", sub: "낙동강 방어선", subEn: "NAKDONG LINE", boss: "장갑차", bossEn: "APC", c: "#6a3a5a" },
    { id: 9, lab: "1-4", ch: 1, ko: "광주", en: "GWANGJU", sub: "금남로 · 무등산", subEn: "GEUMNAM-RO", boss: "공격헬기", bossEn: "GUNSHIP", c: "#4a5a2a" },
    { id: 10, lab: "1-5", ch: 1, ko: "경주", en: "GYEONGJU", sub: "천년고도 · 석탑", subEn: "OLD CAPITAL", boss: "적 지휘관", bossEn: "COMMANDER", c: "#7a5a2a" },
    { id: 11, lab: "1-6", ch: 1, ko: "부산", en: "BUSAN", sub: "최후 방어선", subEn: "LAST PERIMETER", boss: "주력 전차", bossEn: "MAIN TANK", c: "#2a4a7a" },
    { id: 12, lab: "2-1", ch: 2, ko: "인천 상륙작전", en: "INCHEON LANDING", sub: "20XX.9.15 · 상륙정", subEn: "20XX.9.15 · LANDING", boss: "공격헬기", bossEn: "GUNSHIP", c: "#2a5a8a" },
    { id: 1, lab: "2-2", ch: 2, ko: "서울 수복", en: "RETAKE SEOUL", sub: "숭례문 탈환", subEn: "SUNGNYEMUN", boss: "적 지휘관", bossEn: "COMMANDER", c: "#4c5c2d" },
    { id: 2, lab: "3-1", ch: 3, ko: "DMZ · 판문점", en: "DMZ & PANMUNJOM", sub: "GOP · JSA", subEn: "GOP · JSA", boss: "장갑차", bossEn: "APC", c: "#2f4a56" },
    { id: 3, lab: "3-2", ch: 3, ko: "평화의 집", en: "PEACE HOUSE", sub: "PANMUNJOM · MDL", subEn: "PANMUNJOM · MDL", boss: "공격헬기", bossEn: "GUNSHIP", c: "#3d4f6a" },
    { id: 4, lab: "3-3", ch: 3, ko: "평양 진입", en: "INTO PYONGYANG", sub: "PYONGYANG · SQUARE", subEn: "PYONGYANG · SQUARE", boss: "주력 전차", bossEn: "MAIN TANK", c: "#5a3a34" },
    { id: 5, lab: "3-4", ch: 3, ko: "압록강 · 백두산", en: "YALU & PAEKTU", sub: "CHASE · CHEONJI", subEn: "CHASE · CHEONJI", boss: "총사령관", bossEn: "SUPREME LEADER", c: "#2c4b5e" }
  ];
  const CHAPTERS = { 1: ["CHAPTER 1 · 남침", "CHAPTER 1 · INVASION"], 2: ["CHAPTER 2 · 반격", "CHAPTER 2 · COUNTERSTRIKE"], 3: ["CHAPTER 3 · 북진", "CHAPTER 3 · NORTHWARD"] };


  function blank() { return { xp: 0, best: {}, diff: "normal", mode: "op", plays: 0, clears: 0, pts: 0, inv: {}, skins: ["base"], skin: "base", att: { n: 0, last: "" }, chest: { pending: 0, day: "", earned: 0 }, seen: "", uni: "u-army", unis: ["u-army"] }; }
  let D = blank();
  try { const raw = JSON.parse(localStorage.getItem(KEY) || "null"); if (raw && typeof raw === "object") D = Object.assign(blank(), raw); } catch (e) {}
  if (!DIFFS[D.diff]) D.diff = "normal";
  ["inv", "chest", "att", "unis"].forEach((k) => { if (!D[k]) D[k] = blank()[k]; });
  if (!D.skins) D.skins = ["base"];
  if (D.pts == null) D.pts = 0;

  /* ---- (v26) the supply depot: points, the shop, lucky boxes, attendance ---- */
  const kst = (off) => { const t = new Date(Date.now() + 9 * 3600e3 + (off || 0) * 864e5); return t.toISOString().slice(0, 10); };
  const SHOP = [
    { id: "nades", ko: "수류탄 꾸러미", en: "Grenade pack", d: "다음 작전 수류탄 +2", dEn: "+2 grenades next mission", p: 60, ic: "💣" },
    { id: "mag", ko: "확장 탄창", en: "Extended mag", d: "권총 장탄 20 → 28발", dEn: "Pistol clip 20 → 28", p: 90, ic: "📦" },
    { id: "vest", ko: "방탄조끼", en: "Body armour", d: "받는 피해 70%를 60까지 흡수", dEn: "Soaks 70% of damage, 60 pts", p: 120, ic: "🦺" },
    { id: "life", ko: "구급 상자", en: "Medkit", d: "다음 작전 목숨 +1", dEn: "+1 life next mission", p: 150, ic: "🩹" },
    { id: "smg", ko: "기관단총 출격", en: "Start with SMG", d: "기관단총 90발로 시작", dEn: "Start with a 90-round SMG", p: 160, ic: "🔫" },
    { id: "shotgun", ko: "산탄총 출격", en: "Start with shotgun", d: "산탄총 16발로 시작", dEn: "Start with a 16-shell shotgun", p: 180, ic: "💥" }
  ];
  const SKINS = [
    { id: "base", ko: "기본 강철", en: "Steel", p: 0, st: 0, c: ["#4b5563", "#22262c"] },
    { id: "desert", ko: "사막", en: "Desert", p: 200, st: 0, c: ["#b09a74", "#6e5e44"] },
    { id: "digital", ko: "디지털 위장", en: "Digital camo", p: 320, st: 0, c: ["#5a6a4a", "#2e3826"] },
    { id: "navy", ko: "해병 청색", en: "Marine blue", p: 420, st: 0, c: ["#2e4a72", "#1a2230"] },
    { id: "chrome", ko: "크롬", en: "Chrome", p: 600, st: 0, c: ["#d8dde2", "#2a2e34"] },
    { id: "gold", ko: "황금", en: "Gold", p: 0, st: 15, c: ["#e0b440", "#2a1e10"] },
    { id: "dragon", ko: "붉은 용", en: "Red dragon", p: 0, st: 30, c: ["#c8302a", "#140808"] }
  ];
  /* (v27) uniforms for your soldier: shown in the menu, the depot and on the
     result card. Looks only — no stats. */
  const UNIS = [
    { id: "u-army", ko: "육군 디지털", en: "Army digital", p: 0, st: 0 },
    { id: "u-reserve", ko: "예비군", en: "Reserve", p: 150, st: 0 },
    { id: "u-desert", ko: "사막 위장", en: "Desert", p: 300, st: 0 },
    { id: "u-snow", ko: "설상 위장", en: "Snow", p: 300, st: 0 },
    { id: "u-marine", ko: "해병대", en: "Marines", p: 450, st: 0 },
    { id: "u-sf", ko: "특전사", en: "Special forces", p: 600, st: 0 },
    { id: "u-guard", ko: "의장대", en: "Honor guard", p: 0, st: 20 }
  ];
  /* lucky box odds — the box modal shows this exact table */
  const BOX = [
    { r: 0.6, rar: ["일반", "COMMON"], cls: "c", roll: () => ({ pts: 40 + ((Math.random() * 5) | 0) * 10 }) },
    { r: 0.3, rar: ["희귀", "RARE"], cls: "r", roll: () => { const it = SHOP[(Math.random() * SHOP.length) | 0]; return { item: it.id, n: 1 }; } },
    { r: 0.1, rar: ["전설", "LEGENDARY"], cls: "l", roll: () => { const left = SKINS.filter((k) => k.p > 0 && D.skins.indexOf(k.id) < 0); return left.length ? { skin: left[(Math.random() * left.length) | 0].id } : { pts: 300 }; } }
  ];
  const ATT = [30, 40, 50, 60, 80, 100, 0];
  function starsTotal() { let n = 0; Object.keys(D.best).forEach((k) => { n += (D.best[k] && D.best[k].stars) || 0; }); return n; }
  function addPts(n) { D.pts = Math.max(0, (D.pts || 0) + n); save(); }
  function grantChest(n) { D.chest.pending = (D.chest.pending || 0) + (n || 1); save(); }
  /* consumables owned are packed into the next real (non-practice) mission,
     one of each kind */
  function takeLoadout() {
    if (D.mode === "practice") return null;
    const L = {};
    ["nades", "mag", "vest", "life"].forEach((k) => { if ((D.inv[k] || 0) > 0) { D.inv[k]--; L[k] = k === "nades" ? 2 : 1; } });
    if ((D.inv.shotgun || 0) > 0) { D.inv.shotgun--; L.start = "shotgun"; } else if ((D.inv.smg || 0) > 0) { D.inv.smg--; L.start = "smg"; }
    save();
    return Object.keys(L).length ? L : null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }

  function rankIdx(xp) { let i = 0; while (i + 1 < RANKS.length && xp >= RANKS[i + 1][2]) i++; return i; }
  function perks(xp) {
    const r = rankIdx(xp == null ? D.xp : xp);
    const out = { hp: 100, nades: 0, reload: 1, lives: 0 };
    PERKS.forEach((p) => { if (r >= p[0]) Object.keys(p[1]).forEach((k) => { out[k] = p[1][k]; }); });
    /* (v26) every rank also trims reload time a little: 1.2% a step, 24% at 대장 */
    out.reload = Math.min(out.reload, 1 - Math.min(0.24, r * 0.012));
    return out;
  }
  function nextPerk(r) { return PERKS.find((p) => p[0] > r) || null; }

  /* an insignia drawn in SVG: bars, chevrons, diamonds, blossoms, stars */
  function insignia(i, size) {
    const s = size || 34;
    const gold = "#e8c860", silver = "#d8dde2", dark = "#1c2414";
    let body = "";
    const bar = (y) => '<rect x="7" y="' + y + '" width="26" height="4.2" rx="1" fill="' + silver + '"/>';
    const chev = (y) => '<path d="M6 ' + y + ' L20 ' + (y + 7) + ' L34 ' + y + '" stroke="' + gold + '" stroke-width="3.4" fill="none" stroke-linejoin="round"/>';
    const dia = (x, y, r) => '<path d="M' + x + ' ' + (y - r) + ' L' + (x + r * 0.8) + ' ' + y + ' L' + x + ' ' + (y + r) + ' L' + (x - r * 0.8) + ' ' + y + 'Z" fill="' + silver + '" stroke="#fff" stroke-width=".6"/>';
    const flower = (x, y, r) => { let p = ""; for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; p += '<circle cx="' + (x + Math.cos(a) * r * 0.55).toFixed(1) + '" cy="' + (y + Math.sin(a) * r * 0.55).toFixed(1) + '" r="' + (r * 0.5).toFixed(1) + '" fill="' + gold + '"/>'; } return p + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.32).toFixed(1) + '" fill="#b98a24"/>'; };
    const star = (x, y, r) => { let p = ""; for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2; const rr = k % 2 ? r * 0.45 : r; p += (k ? "L" : "M") + (x + Math.cos(a) * rr).toFixed(1) + " " + (y + Math.sin(a) * rr).toFixed(1); } return '<path d="' + p + 'Z" fill="' + silver + '" stroke="#fff" stroke-width=".5"/>'; };
    const row = (n, f, r) => { let p = ""; const gap = Math.min(10, 30 / n); for (let k = 0; k < n; k++) p += f(20 + (k - (n - 1) / 2) * gap, 20, r); return p; };
    if (i === 0) body = '<circle cx="20" cy="20" r="7" fill="none" stroke="' + silver + '" stroke-width="2.4"/>';
    else if (i <= 4) { const n = i; for (let k = 0; k < n; k++) body += bar(20 - (n * 6) / 2 + k * 6 + 1); }
    else if (i <= 8) { const n = Math.min(3, i - 4); for (let k = 0; k < n; k++) body += chev(10 + k * 6); if (i === 8) body += star(20, 33, 4); }
    else if (i === 9) body = dia(20, 20, 8).replace(silver, gold);
    else if (i <= 12) body = row(i - 9, dia, 6.5);
    else if (i <= 15) body = row(i - 12, flower, 6);
    else body = row(i - 15, star, 5.6);
    return '<svg viewBox="0 0 40 40" width="' + s + '" height="' + s + '" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="8" fill="' + dark + '" stroke="rgba(232,200,96,.55)"/>' + body + "</svg>";
  }

  /* (v26) three daily missions, the same for everyone on a given day (KST),
     drawn from this pool; progress adds up over the day's runs */
  const MIS = [
    { id: "play", n: 2, p: 60, ko: "작전 2회 출격", en: "Fly 2 missions", f: (r) => 1 },
    { id: "clear", n: 1, p: 80, ko: "작전 1회 클리어", en: "Clear a mission", f: (r) => (r.cleared ? 1 : 0) },
    { id: "kills", n: 40, p: 80, ko: "적 40명 처치", en: "Down 40 enemies", f: (r) => r.kills || 0 },
    { id: "heads", n: 15, p: 90, ko: "헤드샷 15회", en: "15 headshots", f: (r) => r.heads || 0 },
    { id: "bikes", n: 3, p: 90, ko: "오토바이 3대 격파", en: "Stop 3 bikes", f: (r) => r.bikes || 0 },
    { id: "star3", n: 1, p: 120, ko: "별 3개로 클리어", en: "Clear with 3 stars", f: (r) => (r.cleared && r.stars >= 3 ? 1 : 0) },
    { id: "combo", n: 12, p: 80, ko: "콤보 12 달성", en: "Reach a 12 combo", best: 1, f: (r) => r.combo || 0 },
    { id: "acc", n: 60, p: 100, ko: "명중률 60% 이상으로 클리어", en: "Clear at 60%+ accuracy", best: 1, f: (r) => (r.cleared ? Math.round((r.acc || 0) * 100) : 0) }
  ];
  function dailyMis() {
    const t = kst();
    if (!D.dm || D.dm.day !== t) {
      /* a seeded shuffle of the pool by date */
      let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
      const ids = MIS.map((m) => m.id);
      for (let i = ids.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); const x = ids[i]; ids[i] = ids[j]; ids[j] = x; }
      D.dm = { day: t, ids: ids.slice(0, 3), prog: {}, got: {}, bonus: 0 };
      save();
    }
    return D.dm;
  }
  function misAdd(r) {
    const dm = dailyMis(), done = [];
    dm.ids.forEach((id) => {
      const m = MIS.find((q) => q.id === id), v = m.f(r), was = dm.prog[id] || 0;
      dm.prog[id] = m.best ? Math.max(was, v) : was + v;
      if (was < m.n && dm.prog[id] >= m.n) done.push(ko ? m.ko : m.en);
    });
    return done;
  }
  function misClaim(id) {
    const dm = dailyMis(), m = MIS.find((q) => q.id === id);
    if (!m || dm.got[id] || (dm.prog[id] || 0) < m.n) return 0;
    dm.got[id] = 1; D.pts = (D.pts || 0) + m.p;
    let box = 0;
    if (!dm.bonus && dm.ids.every((k) => dm.got[k])) { dm.bonus = 1; D.chest.pending = (D.chest.pending || 0) + 1; box = 1; }
    save();
    return { p: m.p, box: box };
  }

  /* a finished mission: XP, records, rank-up */
  function record(r) {
    const df = DIFFS[r.diff || D.diff] || DIFFS.normal;
    const before = D.xp, r0 = rankIdx(before);
    if (r.practice) return { xp: 0, before: before, after: before, rank0: r0, rank1: r0, rankUp: false, newBest: false, practice: true };
    let gain = Math.round((r.score || 0) / 20) + (r.cleared ? 300 + 60 * Math.max(0, STAGES.findIndex((x) => x.id === r.stage)) : 60) + (r.cleared ? (r.stars || 0) * 100 : 0);
    gain = Math.round(gain * df.xp * (r.continues ? 1 / (1 + r.continues) : 1));
    D.xp = before + gain;
    const ptsGain = Math.round(((r.score || 0) / 40 + (r.cleared ? 50 + (r.stars || 0) * 20 : 10)) * df.xp);
    D.pts = (D.pts || 0) + ptsGain;
    /* a three-star clear drops a lucky box, three a day at most */
    let box = 0;
    if (r.cleared && r.stars >= 3) { const c = D.chest; if (c.day !== kst()) { c.day = kst(); c.earned = 0; } if (c.earned < 3) { c.earned++; c.pending = (c.pending || 0) + 1; box = 1; } }
    D.plays = (D.plays || 0) + 1;
    let misDone = [];
    try { misDone = misAdd(r); } catch (e) {}
    let newBest = false;
    if (r.cleared) {
      D.clears = (D.clears || 0) + 1;
      const b = D.best[r.stage] || { score: 0, stars: 0, diff: "" };
      if ((r.score || 0) > b.score) { b.score = r.score || 0; newBest = true; }
      if ((r.stars || 0) > b.stars) b.stars = r.stars || 0;
      const order = ["easy", "normal", "hard"];
      if (order.indexOf(r.diff) > order.indexOf(b.diff)) b.diff = r.diff;
      D.best[r.stage] = b;
    }
    save();
    const r1 = rankIdx(D.xp);
    return { xp: gain, pts: ptsGain, box: box, mis: misDone, before: before, after: D.xp, rank0: r0, rank1: r1, rankUp: r1 > r0, newBest: newBest, perk: r1 > r0 ? PERKS.filter((p) => p[0] > r0 && p[0] <= r1).map((p) => (ko ? p[2] : p[3])) : [] };
  }

  function rankName(i) { return ko ? RANKS[i][0] : RANKS[i][1]; }
  function xpBar(xp) {
    const i = rankIdx(xp);
    const lo = RANKS[i][2], hi = RANKS[i + 1] ? RANKS[i + 1][2] : lo;
    return { i: i, k: hi > lo ? (xp - lo) / (hi - lo) : 1, toNext: hi > lo ? hi - xp : 0 };
  }

  window.MGProfile = {
    RANKS: RANKS, DIFFS: DIFFS, STAGES: STAGES,
    get data() { return D; },
    get xp() { return D.xp; },
    get diff() { return D.diff; },
    get diffDef() { return DIFFS[D.diff] || DIFFS.normal; },
    get practice() { return D.mode === "practice"; },
    rankIdx: rankIdx, rankName: rankName, perks: perks, insignia: insignia, record: record, xpBar: xpBar,
    uni: () => D.uni || "u-army", UNIS: UNIS,
    takeLoadout: takeLoadout, get skin() { return D.skin || "base"; }, get pts() { return D.pts || 0; }, SHOP: SHOP, SKINS: SKINS,
    reset: function () { D = blank(); save(); refresh(); }
  };

  /* ---------------- title menu ---------------- */
  const css = document.createElement("style");
  css.textContent = `
  #mgMenu{position:relative;width:min(560px,100%);margin:auto;text-align:left}
  .mRank{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid rgba(201,184,113,.32);border-radius:14px;
    background:linear-gradient(180deg,rgba(30,38,22,.85),rgba(14,18,10,.85));box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
  .mRank svg{flex:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))}
  .mRank .rk{flex:1;min-width:0}
  .mRank .rk b{display:block;font-size:16px;font-weight:900;color:#f2ecd0;letter-spacing:.01em}
  .mRank .rk small{display:block;margin-top:2px;font:700 10px/1.3 ui-monospace,monospace;letter-spacing:.12em;color:#a9b098;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mXp{height:6px;margin-top:6px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden}
  .mXp i{display:block;height:100%;background:linear-gradient(90deg,#9cc45a,#e8c860);border-radius:4px}
  .mIcons{display:flex;gap:6px}
  .mIco{width:40px;height:40px;border-radius:12px;border:1px solid rgba(201,184,113,.35);background:rgba(255,255,255,.04);color:#d9ddcd;
    display:grid;place-items:center;cursor:pointer;touch-action:manipulation;padding:0}
  .mIco.off{color:#6f7764}
  .mIco.off .w1,.mIco.off .w2{opacity:.12}
  .mHead{text-align:center;margin:22px 0 18px}
  .mHead .tKicker{margin:0 0 12px}
  .mHead .tSub{margin:12px 0 0}
  .mGo{display:flex;align-items:center;gap:14px;width:100%;min-height:72px;padding:12px 18px;border:2px solid var(--khaki);border-radius:16px;
    background:linear-gradient(180deg,#56682f,#2c3820);color:#fff;cursor:pointer;touch-action:manipulation;text-align:left;
    box-shadow:0 14px 30px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.18);font:inherit}
  .mGo:active{transform:translateY(1px)}
  .mGo .pl{flex:none;width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,.28);display:grid;place-items:center}
  .mGo b{display:block;font-size:clamp(18px,5vw,22px);font-weight:900}
  .mGo small{display:block;margin-top:4px;font:700 11px/1 ui-monospace,monospace;letter-spacing:.2em;color:#e2dbb0}
  .mRow{display:flex;gap:8px;margin:12px 0 0}
  .mSeg{flex:1;display:flex;padding:3px;border-radius:12px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08)}
  .mSeg button{flex:1;min-height:38px;border:0;border-radius:9px;background:transparent;color:#a9b098;font:800 13px/1 inherit;cursor:pointer;touch-action:manipulation;letter-spacing:.02em}
  .mSeg button.on{background:linear-gradient(180deg,#e2d08a,#b9a55c);color:#1b1f10;box-shadow:0 2px 8px rgba(0,0,0,.4)}
  .mSeg.mode button.on[data-v=practice]{background:linear-gradient(180deg,#8fd0e8,#4f98b8)}
  .mNote{margin:8px 2px 0;font-size:12px;color:#98a28c;min-height:16px}
  .mList{display:grid;gap:8px;margin:16px 0 0}
  .mList h3{margin:12px 2px 2px;font:800 11px/1 ui-monospace,monospace;letter-spacing:.26em;color:#8f9a7c}
  .mCard{position:relative;display:flex;align-items:center;gap:12px;width:100%;min-height:62px;padding:8px 12px 8px 8px;border-radius:14px;
    border:1px solid rgba(255,255,255,.12);background:linear-gradient(90deg,var(--c) 0,rgba(20,24,16,.92) 62%);color:#eef1e6;cursor:pointer;
    touch-action:manipulation;text-align:left;font:inherit;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,.4)}
  .mCard:active{transform:translateY(1px)}
  .mCard .no{flex:none;width:46px;height:46px;border-radius:11px;background:rgba(0,0,0,.35);display:grid;place-items:center;
    font:900 15px/1 ui-monospace,monospace;color:#f2ecd0;border:1px solid rgba(255,255,255,.14)}
  .mCard .tx{flex:1;min-width:0}
  .mCard .tx b{display:block;font-size:16px;font-weight:900}
  .mCard .tx small{display:block;margin-top:3px;font:700 10px/1.2 ui-monospace,monospace;letter-spacing:.14em;color:#b8c0a6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mCard .rc{flex:none;text-align:right}
  .mCard .rc i{display:block;font-style:normal;font-size:15px;letter-spacing:2px;color:#ffd54a}
  .mCard .rc i.n{color:#5a604e}
  .mCard .rc em{display:block;margin-top:3px;font:700 11px/1 ui-monospace,monospace;font-style:normal;color:#c9cfb8}
  .mCard.clear:after{content:"CLEAR";position:absolute;right:-26px;top:9px;transform:rotate(35deg);background:#c9b871;color:#1b1f10;
    font:900 8px/1 ui-monospace,monospace;letter-spacing:.14em;padding:3px 26px}
  .mCard.clear .rc{margin-right:12px}
  .mFoot{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 14px;margin:18px 0 0;font-size:12px;color:#8a947c}
  .mFoot b{color:#e6e2cf}
  .mEco{display:flex;gap:8px;margin:12px 0 0}
  .mAtt{flex:1.6;display:flex;flex-direction:column;align-items:stretch;gap:6px;white-space:nowrap;padding:8px 10px;border-radius:14px;border:1px solid rgba(255,214,90,.45);background:linear-gradient(180deg,rgba(90,70,20,.75),rgba(40,30,8,.75));color:#fff;cursor:pointer;font:inherit;text-align:left;touch-action:manipulation}
  .mAtt.done{border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.05)}
  .mAtt b{display:block;font-size:14px}.mAtt small{display:block;font-size:11px;color:#e8dcb0;margin-top:2px}
  .mAtt .dots{display:flex;gap:3px;justify-content:space-between}
  .mAtt .dots i{width:18px;height:18px;border-radius:5px;background:rgba(255,255,255,.1);font:900 10px/18px ui-monospace,monospace;text-align:center;font-style:normal;color:#bbb}
  .mAtt .dots i.on{background:#e8c860;color:#1b1406}.mAtt .dots i.now{outline:2px solid #ffe14a;animation:mPulse 1s infinite}
  @keyframes mPulse{50%{transform:scale(1.15)}}
  .mShopBtn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:14px;border:1px solid rgba(140,200,255,.45);background:linear-gradient(180deg,#244a6a,#14283a);color:#fff;cursor:pointer;font:inherit;touch-action:manipulation;position:relative}
  .mShopBtn b{font-size:14px}.mShopBtn small{font:800 11px/1 ui-monospace,monospace;color:#ffd54a}
  .mShopBtn .badge{position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;border-radius:10px;background:#e8402a;color:#fff;font:900 11px/20px ui-monospace,monospace;padding:0 5px}
  .mChest{display:flex;align-items:center;gap:10px;width:100%;margin:8px 0 0;padding:10px 12px;border-radius:14px;border:2px solid #ffd54a;background:linear-gradient(90deg,#6a3a10,#2a1606);color:#fff;font:inherit;cursor:pointer;animation:mPulse 1.4s infinite}
  .mChest b{font-size:15px}.mChest span{font-size:22px}
  .mLoad{margin:6px 2px 0;font-size:11px;color:#a8d8ff}
  .mMe{display:flex;align-items:center;gap:10px;margin:10px 0 0;padding:6px 10px 6px 6px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:radial-gradient(ellipse at 20% 60%,rgba(201,184,113,.18),transparent 60%),rgba(255,255,255,.04)}
  .mMe .av{flex:none;width:64px;height:80px;display:flex;align-items:flex-end;justify-content:center}
  .mMe .av img{width:64px;height:80px}
  .mMe .t{flex:1;min-width:0}.mMe .t b{display:block;font-size:14px}.mMe .t small{display:block;font-size:11px;color:#a9b098;margin-top:2px}
  .mMe button{flex:none;min-height:36px;padding:0 12px;border-radius:10px;border:1px solid rgba(201,184,113,.5);background:rgba(201,184,113,.14);color:#f2ecd0;font:800 12px/1 inherit;cursor:pointer}
  #mgModal .it .av{height:96px;display:flex;justify-content:center}#mgModal .it .av img{height:96px}
  .mMis{margin:8px 0 0;padding:8px 10px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04)}
  .mMis h4{margin:0 0 6px;font-size:12px;letter-spacing:.06em;color:#c9b871;display:flex;justify-content:space-between}
  .mMis h4 small{color:#a9b098;font-weight:600;letter-spacing:0}
  .mMis .m{display:flex;align-items:center;gap:8px;font-size:12px;margin:4px 0}
  .mMis .m span{flex:1;min-width:0}.mMis .m i{display:block;height:4px;border-radius:2px;background:rgba(255,255,255,.1);margin-top:3px;overflow:hidden}
  .mMis .m i b{display:block;height:100%;background:#c9b871}
  .mMis .m button{flex:none;min-width:64px;min-height:28px;border-radius:8px;border:0;background:rgba(255,255,255,.08);color:#999;font:800 11px/1 ui-monospace,monospace}
  .mMis .m button.ok{background:#3d6a2a;color:#fff;cursor:pointer;animation:mPulse 1.2s infinite}.mMis .m button.got{background:transparent;color:#7a8a6a}
  #mgModal{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72);padding:14px;font-family:Pretendard,system-ui,sans-serif;color:#fff}
  #mgModal .mc{width:min(520px,100%);max-height:calc(100vh - 28px);overflow:auto;border-radius:18px;border:1px solid rgba(201,184,113,.4);background:linear-gradient(180deg,#1c2414,#0e120a);padding:16px}
  #mgModal h3{margin:0;font-size:20px}#mgModal .bal{float:right;font:900 15px/1.4 ui-monospace,monospace;color:#ffd54a}
  #mgModal .tabs{display:flex;gap:6px;margin:12px 0}
  #mgModal .tabs button{flex:1;min-height:38px;border-radius:10px;border:0;background:rgba(255,255,255,.07);color:#bbb;font:800 13px/1 inherit;cursor:pointer}
  #mgModal .tabs button.on{background:#c9b871;color:#1b1f10}
  #mgModal .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  #mgModal .it{display:flex;flex-direction:column;gap:4px;padding:10px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);text-align:left;color:#fff;font:inherit;cursor:pointer}
  #mgModal .it .ic{font-size:26px}#mgModal .it b{font-size:14px}#mgModal .it small{font-size:11px;color:#a9b098;min-height:28px}
  #mgModal .it em{font-style:normal;align-self:flex-start;padding:4px 10px;border-radius:999px;background:#3d6a2a;font:800 12px/1.2 ui-monospace,monospace}
  #mgModal .it em.no{background:#5a3030}#mgModal .it em.own{background:#2a4a6a}
  #mgModal .it.on{outline:2px solid #ffd54a}
  #mgModal .sw{display:flex;gap:4px}#mgModal .sw i{width:22px;height:14px;border-radius:3px}
  #mgModal .foot{display:flex;gap:8px;margin-top:12px}#mgModal .foot button{flex:1;min-height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#fff;font:800 14px/1 inherit;cursor:pointer}
  #mgModal .box{display:block;margin:18px auto;font-size:88px;background:none;border:0;cursor:pointer;animation:mShake 1.2s infinite}
  @keyframes mShake{0%,100%{transform:rotate(0)}10%{transform:rotate(-8deg)}20%{transform:rotate(8deg)}30%{transform:rotate(0)}}
  #mgModal .prize{text-align:center;margin:10px 0}#mgModal .prize small{display:block;font-weight:800;letter-spacing:.1em}#mgModal .prize b{display:block;font-size:22px;margin-top:6px}
  #mgModal .prize.c b{color:#e8e8e8}#mgModal .prize.r b{color:#6ac8ff}#mgModal .prize.l b{color:#ffd54a;text-shadow:0 0 14px rgba(255,200,60,.6)}
  #mgModal table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}#mgModal td{padding:6px;border-bottom:1px solid rgba(255,255,255,.08)}
  #mgToast{position:fixed;left:50%;top:max(16px,env(safe-area-inset-top));transform:translateX(-50%);z-index:90;padding:10px 16px;border-radius:12px;background:rgba(20,26,14,.95);border:1px solid #c9b871;color:#fff;font:800 14px/1.3 Pretendard,system-ui,sans-serif;max-width:92vw;text-align:center}
  @media (orientation:landscape) and (max-height:600px){
    #mgMenu{width:min(980px,100%);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:0 22px;align-items:start}
    #mgMenu .mL{grid-column:1}
    #mgMenu .mR{grid-column:2;grid-row:1 / span 2}
    .mHead{margin:12px 0 12px}.mHead h1{font-size:clamp(30px,6vw,46px)}.mHead .tKicker{display:none}
    .mList{margin:0}.mCard{min-height:52px}.mCard .no{width:40px;height:40px;font-size:13px}
    #mgMenu .mR{max-height:calc(100vh - 24px);overflow:auto;padding-right:4px}
    .mFoot{display:none}
  }`;
  document.head.appendChild(css);

  const SVG = {
    play: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l10.5-6.5z" fill="#fff"/></svg>',
    snd: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h3l4-3.6v13.2L7 15H4z" fill="currentColor"/><path class="w1" d="M14.6 8.6a4.6 4.6 0 0 1 0 6.8" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><path class="w2" d="M17.4 6a8.2 8.2 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
    gfx: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 20h8M12 17v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 13l3-3 2.5 2.5L17 8" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  const L = ko
    ? { kicker: "20XX · RAIL SHOOTER", sub: "남침에서 인천 상륙, 그리고 북진까지 — 블록 세상 레일 슈팅", go: "작전 개시", goAll: "전 작전 완료 · 처음부터", mode: { op: "작전", practice: "연습" }, ops: "작전 선택", toNext: "다음 계급까지", max: "최고 계급", next: "다음 보상", none: "기록 없음", best: "최고",
        noteOp: "목숨을 다 잃으면 이어하기(CONTINUE) · 계급 경험치 획득", notePr: "연습 모드: 죽지 않음 · 모든 작전 자유 선택 · 경험치·기록 없음", hint: "<span>탭/클릭 <b>사격</b></span><span><b>R</b> 재장전</span><span><b>G</b> 수류탄</span><span>숫자키 <b>1·2·3</b> 무기</span>" }
    : { kicker: "20XX · RAIL SHOOTER", sub: "A block-world military rail shooter", go: "START MISSION", goAll: "ALL CLEAR · FROM THE TOP", mode: { op: "CAMPAIGN", practice: "PRACTICE" }, ops: "MISSIONS", toNext: "to next rank", max: "Top rank", next: "Next reward", none: "No record", best: "BEST",
        noteOp: "Lose every life and you can CONTINUE · earns rank XP", notePr: "Practice: no deaths · any mission · no XP or records", hint: "<span>Tap/click <b>fire</b></span><span><b>R</b> reload</span><span><b>G</b> grenade</span><span>Keys <b>1·2·3</b> weapons</span>" };

  function nextStage() {
    for (let i = 0; i < STAGES.length; i++) { const id = STAGES[i].id; if (!(D.best[id] && D.best[id].stars > 0)) return id; }
    return 0;
  }

  function toast(t, ms) {
    let el = document.getElementById("mgToast");
    if (!el) { el = document.createElement("div"); el.id = "mgToast"; document.body.appendChild(el); }
    el.textContent = t; el.style.display = "";
    clearTimeout(toast._t); toast._t = setTimeout(() => { el.style.display = "none"; }, ms || 2400);
  }
  function modal(html, bind) {
    const old = document.getElementById("mgModal"); if (old) old.remove();
    const m = document.createElement("div"); m.id = "mgModal";
    m.innerHTML = '<div class="mc">' + html + "</div>";
    m.addEventListener("click", (e) => { if (e.target === m) close(); });
    const close = () => { m.remove(); refresh(); };
    document.body.appendChild(m);
    if (bind) bind(m, close);
    return m;
  }
  const attDone = () => D.att.last === kst();
  function checkIn() {
    if (attDone()) { toast(ko ? "오늘은 출석했어요. 7일째엔 행운 상자 2개!" : "Checked in today. Day 7 brings 2 lucky boxes!"); return; }
    D.att.n = (D.att.n % 7) + 1; D.att.last = kst();
    const day = D.att.n, p = ATT[day - 1];
    if (p) D.pts += p; else D.chest.pending = (D.chest.pending || 0) + 2;
    save();
    toast((ko ? day + "일차 출석! " : "Day " + day + "! ") + (p ? "+" + p + "P" : (ko ? "🎁 행운 상자 2개" : "🎁 2 lucky boxes")), 2800);
    refresh();
  }
  function openBox() {
    const L = (a) => (ko ? a[0] : a[1]);
    modal('<h3>' + (ko ? "🎁 행운 상자" : "🎁 Lucky box") + '</h3><button class="box" type="button">🎁</button><p style="text-align:center;color:#c8c8b8;font-size:13px">' +
      (ko ? "상자를 눌러서 열어 보세요 · 남은 상자 " : "Tap to open · boxes left ") + (D.chest.pending || 0) + '</p><div class="foot"><button data-a="rates" type="button">' + (ko ? "확률 보기" : "Odds") + '</button><button data-a="close" type="button">' + (ko ? "닫기" : "Close") + "</button></div>", (m, close) => {
      const go = () => {
        if ((D.chest.pending || 0) <= 0) { toast(ko ? "열 상자가 없어요" : "No boxes left"); return; }
        D.chest.pending--;
        let x = Math.random(), tier = BOX[0];
        for (const b of BOX) { if (x < b.r) { tier = b; break; } x -= b.r; }
        const r = tier.roll();
        let txt = "";
        if (r.pts) { D.pts += r.pts; txt = "+" + r.pts + "P"; }
        if (r.item) { D.inv[r.item] = (D.inv[r.item] || 0) + r.n; const it = SHOP.find((k) => k.id === r.item); txt = it.ic + " " + (ko ? it.ko : it.en) + " ×" + r.n; }
        if (r.skin) { D.skins.push(r.skin); const k = SKINS.find((q) => q.id === r.skin); txt = "🔫 " + (ko ? "권총 스킨 · " + k.ko : "Pistol finish · " + k.en); }
        save();
        const bx = m.querySelector(".box"); bx.outerHTML = '<div class="prize ' + tier.cls + '"><span style="font-size:64px">✨</span><small>' + L(tier.rar) + "</small><b>" + txt + "</b></div>";
        const p = m.querySelector("p"); p.textContent = (ko ? "남은 상자 " : "Boxes left ") + (D.chest.pending || 0);
        if ((D.chest.pending || 0) > 0) { const nb = document.createElement("button"); nb.className = "box"; nb.textContent = "🎁"; nb.style.fontSize = "48px"; nb.addEventListener("click", () => { m.remove(); openBox(); }); m.querySelector(".mc").insertBefore(nb, p); }
      };
      m.querySelector(".box").addEventListener("click", go);
      m.querySelector('[data-a="close"]').addEventListener("click", close);
      m.querySelector('[data-a="rates"]').addEventListener("click", () => {
        modal("<h3>" + (ko ? "상자 확률" : "Box odds") + "</h3><table>" + BOX.map((b) => "<tr><td><b>" + L(b.rar) + "</b></td><td>" + Math.round(b.r * 100) + "%</td><td>" +
          (b.cls === "c" ? (ko ? "보급 포인트 40~80P" : "40–80 points") : b.cls === "r" ? (ko ? "보급품 1개 (무작위)" : "1 random supply") : (ko ? "미보유 권총 스킨 (모두 보유 시 300P)" : "An unowned pistol finish (300P if none left)")) + "</td></tr>").join("") +
          '</table><p style="font-size:12px;color:#a9b098">' + (ko ? "상자는 출석 7일째(2개), 3일 이상 만에 돌아왔을 때(1개), 별 3개 클리어(하루 3개까지)로 받아요." : "Boxes come from day-7 attendance (2), coming back after 3+ days (1) and 3-star clears (3 a day).") +
          '</p><div class="foot"><button data-a="x" type="button">' + (ko ? "확인" : "OK") + "</button></div>", (m2, c2) => m2.querySelector('[data-a="x"]').addEventListener("click", () => { m2.remove(); openBox(); }));
      });
    });
  }
  /* the soldier portrait is drawn by rail.js once the character rig and the
     uniform have loaded; until then a placeholder, filled in when it lands */
  function avatar(uni, pose) {
    const src = window.MGAvatar && window.MGAvatar.snap(uni, pose);
    if (src) return '<img src="' + src + '" alt="">';
    clearTimeout(avatar._t);
    avatar._t = setTimeout(() => { document.querySelectorAll("[data-av]").forEach((el) => { const s2 = window.MGAvatar && window.MGAvatar.snap(el.getAttribute("data-av"), ""); if (s2) el.innerHTML = '<img src="' + s2 + '" alt="">'; }); if (document.querySelector("[data-av]:empty")) avatar(uni, pose); }, 600);
    return "";
  }
  const uniName = (id) => { const u = UNIS.find((q) => q.id === id) || UNIS[0]; return ko ? u.ko : u.en; };
  function openShop(tab) {
    tab = tab || "sup";
    const stars = starsTotal();
    const items = tab === "uni"
      ? UNIS.map((k) => { const own = D.unis.indexOf(k.id) >= 0; const lock = k.st && stars < k.st; const lab = own ? (D.uni === k.id ? (ko ? "착용 중" : "Wearing") : (ko ? "착용" : "Wear")) : k.st ? "★ " + k.st + (ko ? " (보유 " : " (have ") + stars + ")" : k.p + "P";
          return '<button class="it' + (D.uni === k.id ? " on" : "") + '" type="button" data-uni="' + k.id + '"><span class="av" data-av="' + k.id + '">' + avatar(k.id) + "</span><b>" + (ko ? k.ko : k.en) + "</b><em" + (own ? ' class="own"' : (lock || D.pts < k.p) ? ' class="no"' : "") + ">" + lab + "</em></button>"; }).join("")
      : tab === "sup"
      ? SHOP.map((it) => '<button class="it" type="button" data-buy="' + it.id + '"><span class="ic">' + it.ic + "</span><b>" + (ko ? it.ko : it.en) + "</b><small>" + (ko ? it.d : it.dEn) + "</small><em" + (D.pts < it.p ? ' class="no"' : "") + ">" + it.p + "P · " + (ko ? "보유 " : "own ") + (D.inv[it.id] || 0) + "</em></button>").join("")
      : SKINS.map((k) => { const own = D.skins.indexOf(k.id) >= 0; const lock = k.st && stars < k.st; const lab = own ? (D.skin === k.id ? (ko ? "장착 중" : "Equipped") : (ko ? "장착" : "Equip")) : k.st ? "★ " + k.st + (ko ? " (보유 " : " (have ") + stars + ")" : k.p + "P";
          return '<button class="it' + (D.skin === k.id ? " on" : "") + '" type="button" data-skin="' + k.id + '"><span class="sw"><i style="background:' + k.c[0] + '"></i><i style="background:' + k.c[1] + '"></i></span><b>' + (ko ? k.ko : k.en) + "</b><small>" + (k.st ? (ko ? "별 " + k.st + "개 모으면 해금" : "Unlocks at " + k.st + " stars") : (ko ? "권총 외장" : "Pistol finish")) + "</small><em" + (own ? ' class="own"' : (lock || D.pts < k.p) ? ' class="no"' : "") + ">" + lab + "</em></button>"; }).join("");
    modal('<span class="bal">' + (D.pts || 0).toLocaleString() + "P</span><h3>" + (ko ? "🛒 보급소" : "🛒 Supply depot") + '</h3><div class="tabs"><button data-t="sup" type="button"' + (tab === "sup" ? ' class="on"' : "") + ">" + (ko ? "보급품" : "Supplies") + '</button><button data-t="skin" type="button"' + (tab === "skin" ? ' class="on"' : "") + ">" + (ko ? "권총 스킨" : "Pistol finishes") + '</button><button data-t="uni" type="button"' + (tab === "uni" ? ' class="on"' : "") + ">" + (ko ? "군복" : "Uniforms") + "</button></div>" +
      '<div class="grid">' + items + '</div><p style="font-size:12px;color:#a9b098;margin:10px 2px 0">' + (ko ? "보급품은 다음 작전(연습 제외)에 종류별로 1개씩 자동 투입돼요. 포인트는 작전 점수·클리어·별로 쌓여요." : "Supplies go into your next real mission, one of each kind. Points come from score, clears and stars.") +
      '</p><div class="foot"><button data-a="close" type="button">' + (ko ? "닫기" : "Close") + "</button></div>", (m, close) => {
      m.querySelector('[data-a="close"]').addEventListener("click", close);
      m.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { m.remove(); openShop(b.getAttribute("data-t")); }));
      m.querySelectorAll("[data-buy]").forEach((b) => b.addEventListener("click", () => {
        const it = SHOP.find((k) => k.id === b.getAttribute("data-buy"));
        if (D.pts < it.p) { toast(ko ? "포인트가 부족해요" : "Not enough points"); return; }
        D.pts -= it.p; D.inv[it.id] = (D.inv[it.id] || 0) + 1; save();
        toast((ko ? "구매 완료 · " : "Bought · ") + it.ic + " " + (ko ? it.ko : it.en));
        m.remove(); openShop("sup");
      }));
      m.querySelectorAll("[data-uni]").forEach((b) => b.addEventListener("click", () => {
        const k = UNIS.find((q) => q.id === b.getAttribute("data-uni"));
        if (D.unis.indexOf(k.id) < 0) {
          if (k.st) { if (starsTotal() < k.st) { toast(ko ? "별이 부족해요" : "Not enough stars"); return; } }
          else { if (D.pts < k.p) { toast(ko ? "포인트가 부족해요" : "Not enough points"); return; } D.pts -= k.p; }
          D.unis.push(k.id);
          toast((ko ? "새 군복 · " : "New uniform · ") + (ko ? k.ko : k.en));
        }
        D.uni = k.id; save();
        m.remove(); openShop("uni");
      }));
      m.querySelectorAll("[data-skin]").forEach((b) => b.addEventListener("click", () => {
        const k = SKINS.find((q) => q.id === b.getAttribute("data-skin"));
        const own = D.skins.indexOf(k.id) >= 0;
        if (!own) {
          if (k.st) { if (starsTotal() < k.st) { toast(ko ? "별이 부족해요" : "Not enough stars"); return; } D.skins.push(k.id); }
          else { if (D.pts < k.p) { toast(ko ? "포인트가 부족해요" : "Not enough points"); return; } D.pts -= k.p; D.skins.push(k.id); }
        }
        D.skin = k.id; save();
        m.remove(); openShop("skin");
      }));
    });
  }
  /* the rank card opens what the rank gives you, and what comes next */
  function openPerks() {
    const xb = xpBar(D.xp), pk = perks(D.xp);
    const row = (a, b) => "<tr><td>" + a + "</td><td style='text-align:right'><b>" + b + "</b></td></tr>";
    const rows = RANKS.map((r, i) => {
      const p = PERKS.find((q) => q[0] === i);
      const on = i <= xb.i;
      return '<tr style="opacity:' + (on ? 1 : 0.55) + '"><td>' + insignia(i, 22) + "</td><td>" + rankName(i) + (i === xb.i ? (ko ? " ← 현재" : " ← you") : "") + "</td><td>" + (ko ? "재장전 −" : "Reload −") + Math.round(Math.min(0.24, i * 0.012) * 100) + "%" + (p ? " · <b>" + (ko ? p[2] : p[3]) + "</b>" : "") + "</td></tr>";
    }).join("");
    modal("<h3>" + insignia(xb.i, 28) + " " + rankName(xb.i) + "</h3><table>" +
      row(ko ? "최대 체력" : "Max HP", pk.hp) + row(ko ? "재장전 시간" : "Reload time", Math.round(pk.reload * 100) + "%") +
      row(ko ? "추가 수류탄" : "Extra grenades", "+" + pk.nades) + row(ko ? "추가 목숨" : "Extra lives", "+" + pk.lives) +
      '</table><p style="font-size:12px;color:#a9b098;margin:10px 2px">' + (ko ? "계급이 오를수록 조금씩 강해져요. 대신 정예 난이도는 적이 더 아프게 쏘고 경험치를 1.5배 줘요." : "Each rank makes you a little stronger. Elite difficulty hits harder and pays 1.5× XP.") +
      '</p><table>' + rows + '</table><div class="foot"><button data-a="x" type="button">' + (ko ? "닫기" : "Close") + "</button></div>", (m, close) => m.querySelector('[data-a="x"]').addEventListener("click", close));
  }
  /* a player back after three days or more gets a box */
  (function welcomeBack() {
    const t = kst();
    if (D.seen && D.seen !== t) {
      const away = Math.round((Date.parse(t) - Date.parse(D.seen)) / 864e5);
      if (away >= 3) { D.chest.pending = (D.chest.pending || 0) + 1; setTimeout(() => toast(ko ? "다시 와줘서 반가워요! 🎁 행운 상자 1개 선물" : "Welcome back! 🎁 a lucky box for you", 3200), 900); }
    }
    D.seen = t; save();
  })();

  const wrap = document.querySelector("#mgTitle .tWrap");
  function build() {
    if (!wrap) return;
    wrap.id = "mgMenu";
    const xb = xpBar(D.xp);
    const np = nextPerk(xb.i);
    const ns = nextStage();
    const goStage = ns || STAGES[0].id;
    const st = STAGES.find((x) => x.id === goStage);
    let lastCh = 0;
    const cards = STAGES.map((s) => {
      const head = s.ch !== lastCh ? '<h3>' + CHAPTERS[s.ch][ko ? 0 : 1] + "</h3>" : "";
      lastCh = s.ch;
      const b = D.best[s.id];
      const stars = b ? "★".repeat(b.stars) + "☆".repeat(3 - b.stars) : "☆☆☆";
      return head + '<button class="mCard' + (b && b.stars ? " clear" : "") + '" id="' + (s.id === 1 ? "mgStart" : "mgStart" + s.id) + '" type="button" data-stage="' + s.id + '" style="--c:' + s.c + '">' +
        '<span class="no">' + s.lab + '</span><span class="tx"><b>' + (ko ? s.ko : s.en) + "</b><small>" + (ko ? s.sub : s.subEn) + " · BOSS " + (ko ? s.boss : s.bossEn) + "</small></span>" +
        '<span class="rc"><i' + (b ? "" : ' class="n"') + ">" + stars + "</i><em>" + (b ? L.best + " " + b.score.toLocaleString() : L.none) + "</em></span></button>";
    }).join("");
    wrap.innerHTML =
      '<div class="mL">' +
      '<div class="mRank">' + insignia(xb.i, 44) + '<div class="rk"><b>' + rankName(xb.i) + '</b><small>' +
        (xb.toNext ? L.toNext + " " + xb.toNext.toLocaleString() + " XP" : L.max) + (np ? " · " + L.next + ": " + (ko ? np[2] : np[3]) : "") +
        '</small><div class="mXp"><i style="width:' + Math.round(xb.k * 100) + '%"></i></div></div>' +
        '<div class="mIcons"><button id="mgSound" class="mIco" type="button" aria-label="sound">' + SVG.snd + '<span class="tSoundTxt" hidden></span></button>' +
        '<button id="mgGfx" class="mIco" type="button" aria-label="graphics" title="">' + SVG.gfx + '<span class="tGfxTxt" hidden></span></button></div></div>' +
      '<div class="mHead"><p class="tKicker">' + L.kicker + "</p><h1>" + (ko ? "지금 바로 <em>멸공</em>" : "Destroy <em>Now</em>") + '</h1><p class="tSub">' + L.sub + "</p></div>" +
      '<button class="mGo" id="mgGo" type="button"><span class="pl">' + SVG.play + "</span><span><b>" + (ns ? L.go : L.goAll) + "</b><small>STAGE " + st.lab + " · " + (ko ? st.ko : st.en) + "</small></span></button>" +
      '<div class="mRow"><div class="mSeg mode">' + ["op", "practice"].map((v) => '<button type="button" data-k="mode" data-v="' + v + '"' + (D.mode === v ? ' class="on"' : "") + ">" + L.mode[v] + "</button>").join("") + "</div>" +
      '<div class="mSeg diff">' + Object.keys(DIFFS).map((v) => '<button type="button" data-k="diff" data-v="' + v + '"' + (D.diff === v ? ' class="on"' : "") + ">" + (ko ? DIFFS[v].ko : DIFFS[v].en) + "</button>").join("") + "</div></div>" +
      '<p class="mNote">' + (D.mode === "practice" ? L.notePr : L.noteOp) + "</p>" +
      '<div class="mMe"><span class="av" data-av="' + (D.uni || "u-army") + '">' + avatar(D.uni || "u-army") + '</span><span class="t"><b>' + (ko ? "내 병사" : "My soldier") + "</b><small>" + uniName(D.uni || "u-army") + " · " + D.unis.length + "/" + UNIS.length + (ko ? " 보유" : " owned") + '</small></span><button id="mgUni" type="button">' + (ko ? "군복 변경" : "Uniforms") + "</button></div>" +
      (() => {
        const done = attDone(), n = done ? D.att.n : D.att.n % 7;
        const dots = ATT.map((p, i) => '<i class="' + (i < n ? "on" : "") + (!done && i === n ? " now" : "") + '">' + (i === 6 ? "🎁" : i < n ? "✓" : i + 1) + "</i>").join("");
        const inv = SHOP.filter((it) => (D.inv[it.id] || 0) > 0).map((it) => it.ic + "×" + D.inv[it.id]).join(" ");
        return '<div class="mEco"><button class="mAtt' + (done ? " done" : "") + '" id="mgAtt" type="button"><span><b>' + (done ? (ko ? "출석 완료" : "Checked in") : (ko ? "출석 체크" : "Daily check-in")) + "</b><small>" +
          (done ? (ko ? "내일 또 와요" : "See you tomorrow") : (ko ? (n + 1) + "일차 보상 받기" : "Claim day " + (n + 1))) + '</small></span><span class="dots">' + dots + "</span></button>" +
          '<button class="mShopBtn" id="mgShop" type="button"><b>' + (ko ? "🛒 보급소" : "🛒 Depot") + "</b><small>" + (D.pts || 0).toLocaleString() + "P</small></button></div>" +
          ((D.chest.pending || 0) > 0 ? '<button class="mChest" id="mgChest" type="button"><span>🎁</span><b>' + (ko ? "행운 상자 " + D.chest.pending + "개 · 눌러서 열기" : D.chest.pending + " lucky box(es) · tap to open") + "</b></button>" : "") +
          (inv ? '<p class="mLoad">' + (ko ? "다음 작전 투입 보급품: " : "Packed for next mission: ") + inv + "</p>" : "");
      })() +
      (() => {
        const dm = dailyMis();
        return '<div class="mMis"><h4>' + (ko ? "오늘의 임무" : "TODAY'S ORDERS") + "<small>" + (ko ? "3개 모두 받으면 🎁" : "all 3 → 🎁") + "</small></h4>" + dm.ids.map((id) => {
          const m = MIS.find((q) => q.id === id), v = Math.min(m.n, dm.prog[id] || 0), got = dm.got[id], ok = !got && v >= m.n;
          return '<div class="m"><span>' + (ko ? m.ko : m.en) + ' <small style="color:#a9b098">' + v + "/" + m.n + '</small><i><b style="width:' + Math.round((v / m.n) * 100) + '%"></b></i></span><button type="button" data-mis="' + id + '" class="' + (got ? "got" : ok ? "ok" : "") + '">' + (got ? (ko ? "완료" : "DONE") : "+" + m.p + "P") + "</button></div>";
        }).join("") + "</div>";
      })() +
      "</div>" +
      '<div class="mR"><div class="mList">' + cards + "</div>" +
      '<p class="mFoot">' + L.hint + "</p></div>";
    wrap.querySelectorAll(".mSeg button").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      const k = b.getAttribute("data-k"), v = b.getAttribute("data-v");
      D[k] = v;
      save();
      wrap.querySelectorAll('.mSeg button[data-k="' + k + '"]').forEach((x) => x.classList.toggle("on", x === b));
      const note = wrap.querySelector(".mNote");
      if (note) note.textContent = D.mode === "practice" ? L.notePr : L.noteOp;
    }));
    const go = (n) => { if (window.MG && window.MG.play) window.MG.play(n); };
    wrap.querySelectorAll(".mCard").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); go(+b.getAttribute("data-stage") || 1); }));
    const rk = wrap.querySelector(".mRank"); if (rk) { rk.style.cursor = "pointer"; rk.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openPerks(); }); }
    wrap.querySelectorAll("[data-mis]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const r = misClaim(b.getAttribute("data-mis"));
      if (!r) return;
      toast("+" + r.p + "P" + (r.box ? (ko ? " · 오늘의 임무 완수! 🎁 행운 상자" : " · all orders done! 🎁 box") : ""), 2600);
      refresh();
    }));
    const at = document.getElementById("mgAtt"); if (at) at.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); checkIn(); });
    const un = document.getElementById("mgUni"); if (un) un.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openShop("uni"); });
    const sh = document.getElementById("mgShop"); if (sh) sh.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openShop(); });
    const ch = document.getElementById("mgChest"); if (ch) ch.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openBox(); });
    const g = document.getElementById("mgGo");
    if (g) g.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); go(goStage); });
  }
  function refresh() {
    /* the sound and graphics switches are re-made with the menu: hand them
       back to the engine so their state paints again */
    build();
    if (window.MGMenuBind) window.MGMenuBind();
  }
  build();
  window.MGMenu = { refresh: refresh };
})();
