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
  const STAGES = [
    { id: 1, ko: "서울 시가지", en: "SEOUL DOWNTOWN", sub: "SEOUL · 숭례문", subEn: "SEOUL · SUNGNYEMUN", boss: "적 지휘관", bossEn: "COMMANDER", c: "#4c5c2d" },
    { id: 2, ko: "DMZ · 판문점", en: "DMZ & PANMUNJOM", sub: "GOP · JSA", subEn: "GOP · JSA", boss: "장갑차", bossEn: "APC", c: "#2f4a56" },
    { id: 3, ko: "평화의 집", en: "PEACE HOUSE", sub: "PANMUNJOM · MDL", subEn: "PANMUNJOM · MDL", boss: "공격헬기", bossEn: "GUNSHIP", c: "#3d4f6a" },
    { id: 4, ko: "평양 진입", en: "INTO PYONGYANG", sub: "PYONGYANG · SQUARE", subEn: "PYONGYANG · SQUARE", boss: "주력 전차", bossEn: "MAIN TANK", c: "#5a3a34" },
    { id: 5, ko: "압록강 · 백두산", en: "YALU & PAEKTU", sub: "CHASE · CHEONJI", subEn: "CHASE · CHEONJI", boss: "총사령관", bossEn: "SUPREME LEADER", c: "#2c4b5e" }
  ];

  function blank() { return { xp: 0, best: {}, diff: "normal", mode: "op", plays: 0, clears: 0 }; }
  let D = blank();
  try { const raw = JSON.parse(localStorage.getItem(KEY) || "null"); if (raw && typeof raw === "object") D = Object.assign(blank(), raw); } catch (e) {}
  if (!DIFFS[D.diff]) D.diff = "normal";
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }

  function rankIdx(xp) { let i = 0; while (i + 1 < RANKS.length && xp >= RANKS[i + 1][2]) i++; return i; }
  function perks(xp) {
    const r = rankIdx(xp == null ? D.xp : xp);
    const out = { hp: 100, nades: 0, reload: 1, lives: 0 };
    PERKS.forEach((p) => { if (r >= p[0]) Object.keys(p[1]).forEach((k) => { out[k] = p[1][k]; }); });
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

  /* a finished mission: XP, records, rank-up */
  function record(r) {
    const df = DIFFS[r.diff || D.diff] || DIFFS.normal;
    const before = D.xp, r0 = rankIdx(before);
    if (r.practice) return { xp: 0, before: before, after: before, rank0: r0, rank1: r0, rankUp: false, newBest: false, practice: true };
    let gain = Math.round((r.score || 0) / 20) + (r.cleared ? 300 + 80 * r.stage : 60) + (r.cleared ? (r.stars || 0) * 100 : 0);
    gain = Math.round(gain * df.xp * (r.continues ? 1 / (1 + r.continues) : 1));
    D.xp = before + gain;
    D.plays = (D.plays || 0) + 1;
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
    return { xp: gain, before: before, after: D.xp, rank0: r0, rank1: r1, rankUp: r1 > r0, newBest: newBest, perk: r1 > r0 ? PERKS.filter((p) => p[0] > r0 && p[0] <= r1).map((p) => (ko ? p[2] : p[3])) : [] };
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
  .mList h3{margin:4px 2px 2px;font:800 11px/1 ui-monospace,monospace;letter-spacing:.26em;color:#8f9a7c}
  .mCard{position:relative;display:flex;align-items:center;gap:12px;width:100%;min-height:62px;padding:8px 12px 8px 8px;border-radius:14px;
    border:1px solid rgba(255,255,255,.12);background:linear-gradient(90deg,var(--c) 0,rgba(20,24,16,.92) 62%);color:#eef1e6;cursor:pointer;
    touch-action:manipulation;text-align:left;font:inherit;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,.4)}
  .mCard:active{transform:translateY(1px)}
  .mCard .no{flex:none;width:46px;height:46px;border-radius:11px;background:rgba(0,0,0,.35);display:grid;place-items:center;
    font:900 20px/1 ui-monospace,monospace;color:#f2ecd0;border:1px solid rgba(255,255,255,.14)}
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
  @media (orientation:landscape) and (max-height:600px){
    #mgMenu{width:min(980px,100%);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:0 22px;align-items:start}
    #mgMenu .mL{grid-column:1}
    #mgMenu .mR{grid-column:2;grid-row:1 / span 2}
    .mHead{margin:12px 0 12px}.mHead h1{font-size:clamp(30px,6vw,46px)}.mHead .tKicker{display:none}
    .mList{margin:0}.mCard{min-height:52px}.mCard .no{width:40px;height:40px;font-size:17px}
    .mFoot{display:none}
  }`;
  document.head.appendChild(css);

  const SVG = {
    play: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l10.5-6.5z" fill="#fff"/></svg>',
    snd: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h3l4-3.6v13.2L7 15H4z" fill="currentColor"/><path class="w1" d="M14.6 8.6a4.6 4.6 0 0 1 0 6.8" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><path class="w2" d="M17.4 6a8.2 8.2 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
    gfx: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 20h8M12 17v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 13l3-3 2.5 2.5L17 8" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  const L = ko
    ? { kicker: "RAIL SHOOTER", sub: "블록 세상 군사 레일 슈팅 — 바로, 총을 들다", go: "작전 개시", goAll: "전 작전 완료 · 처음부터", mode: { op: "작전", practice: "연습" }, ops: "작전 선택", toNext: "다음 계급까지", max: "최고 계급", next: "다음 보상", none: "기록 없음", best: "최고",
        noteOp: "목숨을 다 잃으면 이어하기(CONTINUE) · 계급 경험치 획득", notePr: "연습 모드: 죽지 않음 · 모든 작전 자유 선택 · 경험치·기록 없음", hint: "<span>탭/클릭 <b>사격</b></span><span><b>R</b> 재장전</span><span><b>G</b> 수류탄</span><span>숫자키 <b>1·2·3</b> 무기</span>" }
    : { kicker: "BLOCK MILITARY RAIL SHOOTER", sub: "A block-world military rail shooter", go: "START MISSION", goAll: "ALL CLEAR · FROM THE TOP", mode: { op: "CAMPAIGN", practice: "PRACTICE" }, ops: "MISSIONS", toNext: "to next rank", max: "Top rank", next: "Next reward", none: "No record", best: "BEST",
        noteOp: "Lose every life and you can CONTINUE · earns rank XP", notePr: "Practice: no deaths · any mission · no XP or records", hint: "<span>Tap/click <b>fire</b></span><span><b>R</b> reload</span><span><b>G</b> grenade</span><span>Keys <b>1·2·3</b> weapons</span>" };

  function nextStage() {
    for (let i = 1; i <= 5; i++) if (!(D.best[i] && D.best[i].stars > 0)) return i;
    return 0;
  }

  const wrap = document.querySelector("#mgTitle .tWrap");
  function build() {
    if (!wrap) return;
    wrap.id = "mgMenu";
    const xb = xpBar(D.xp);
    const np = nextPerk(xb.i);
    const ns = nextStage();
    const goStage = ns || 1;
    const st = STAGES[goStage - 1];
    const cards = STAGES.map((s) => {
      const b = D.best[s.id];
      const stars = b ? "★".repeat(b.stars) + "☆".repeat(3 - b.stars) : "☆☆☆";
      return '<button class="mCard' + (b && b.stars ? " clear" : "") + '" id="' + (s.id === 1 ? "mgStart" : "mgStart" + s.id) + '" type="button" data-stage="' + s.id + '" style="--c:' + s.c + '">' +
        '<span class="no">0' + s.id + '</span><span class="tx"><b>' + (ko ? s.ko : s.en) + "</b><small>" + (ko ? s.sub : s.subEn) + " · BOSS " + (ko ? s.boss : s.bossEn) + "</small></span>" +
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
      '<button class="mGo" id="mgGo" type="button"><span class="pl">' + SVG.play + "</span><span><b>" + (ns ? L.go : L.goAll) + "</b><small>STAGE " + goStage + "-1 · " + (ko ? st.ko : st.en) + "</small></span></button>" +
      '<div class="mRow"><div class="mSeg mode">' + ["op", "practice"].map((v) => '<button type="button" data-k="mode" data-v="' + v + '"' + (D.mode === v ? ' class="on"' : "") + ">" + L.mode[v] + "</button>").join("") + "</div>" +
      '<div class="mSeg diff">' + Object.keys(DIFFS).map((v) => '<button type="button" data-k="diff" data-v="' + v + '"' + (D.diff === v ? ' class="on"' : "") + ">" + (ko ? DIFFS[v].ko : DIFFS[v].en) + "</button>").join("") + "</div></div>" +
      '<p class="mNote">' + (D.mode === "practice" ? L.notePr : L.noteOp) + "</p>" +
      "</div>" +
      '<div class="mR"><div class="mList"><h3>' + L.ops + "</h3>" + cards + "</div>" +
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
