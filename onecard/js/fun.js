/* ===== 잼 회사 생활 — fun layer shared by every game =====
   1) 인사 발령 공문: beating 승진 도전 stage N promotes you (인턴 → 사장); a stamped notice you can brag with
   2) 오늘의 특근: one daily challenge per game (a set character + a twist), coins ×3 + a lucky box
   3) 칼퇴 타임: 18:00–19:00 KST every coin you earn is doubled
   4) 리벤지 매치: lose to the same character 3 times in a row and they challenge you (bonus coins)
   5) 명함첩: beat a character for the first time to collect their business card
   Career, nickname, cards and rivalries live in Meta.data.growth, which the combined app shares across games. */
const Fun = (function () {
  const ID = window.GAME_ID;
  const G = { omok: () => Omok, janggi: () => Janggi, baduk: () => Baduk, chess: () => ChessApp, uno: () => Uno }[ID]();
  const T = () => window.Toss || null;
  const log = (n, p) => { const t = T(); if (t) t.log(n, Object.assign({ game: ID }, p || {})); };
  const TITLES = ['인턴', '사원', '주임', '대리', '과장', '차장', '부장', '이사', '상무', '전무', '사장'];
  const S = () => { const d = Meta.data; d.growth = d.growth || {}; const g = d.growth;
    g.career = g.career || 0; g.cards = g.cards || {}; g.rel = g.rel || {}; return g; };
  const kstHour = () => new Date(Date.now() + 9 * 3600e3).getUTCHours();
  // 받침 따라 조사: josa('잼대리','을','를') → '잼대리를'
  const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); const has = c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 > 0; return w + (has ? a : b); };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const strengthOf = info => info.mode === 'arcade' ? Math.max(1, Math.min(10, info.stage || 1))
    : info.level > 10 ? info.level - 10 : ({ 1: 2, 2: 5, 3: 9 })[info.level] || 0;
  const charOf = s => (window.Characters && s) ? Characters.ofStrength(s) : null;

  // ---------- 3) 칼퇴 타임 ----------
  const isKaltoe = () => kstHour() === 18;
  window.COIN_MULT = () => isKaltoe() ? 2 : 1;
  let kaltoeToast = false;

  // ---------- 1) 인사 발령 공문 ----------
  function notice(o) {
    const g = S(); let el = document.getElementById('tgNotice');
    if (!el) { el = document.createElement('div'); el.id = 'tgNotice'; document.body.appendChild(el); }
    const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '. ') + '.';
    const no = 'JAM-' + (Meta.dayNumber() % 10000) + '-' + String(o.rankIdx).padStart(2, '0');
    el.innerHTML = `<div class="tg-ntc"><div class="tg-ntc-paper">
      <div class="tg-ntc-h"><small>보드게임 주식회사</small><b>인 사 발 령</b><span>문서번호 ${no}</span></div>
      <table><tr><th>성명</th><td><input id="tgNick" maxlength="10" value="${esc(g.nick || '')}" placeholder="이름을 적어 주세요"></td></tr>
      <tr><th>발령</th><td><b class="tg-ntc-rank">${o.title}</b> 승진</td></tr>
      <tr><th>사유</th><td>${esc(o.reason)}</td></tr><tr><th>일자</th><td>${today}</td></tr></table>
      <p class="tg-ntc-body">위 사람을 ${o.title}${/[가-힣]/.test(o.title) && (o.title.charCodeAt(o.title.length - 1) - 0xac00) % 28 > 0 && (o.title.charCodeAt(o.title.length - 1) - 0xac00) % 28 !== 8 ? '으로' : '로'} 발령함.<br>앞으로도 칼퇴하며 승승장구하기 바랍니다.</p>
      <div class="tg-ntc-sign">보드게임 주식회사 대표이사 <b>잼사장</b><i class="tg-seal">잼<br>사장</i></div></div>
      <div class="tg-ntc-act"><button type="button" class="pri" data-n="share">📣 자랑하기</button><button type="button" data-n="close">닫기</button></div></div>`;
    el.classList.add('show'); requestAnimationFrame(() => el.classList.add('stamp'));
    if (typeof SFX !== 'undefined' && SFX.levelup) setTimeout(() => SFX.levelup(), 650);
    const t = T(); if (t) t.haptic('success');
    const saveNick = () => { const v = (el.querySelector('#tgNick').value || '').trim(); if (v !== (g.nick || '')) { g.nick = v; Meta.save(); } };
    el.onclick = async e => {
      const n = e.target.dataset && e.target.dataset.n; if (!n) return;
      saveNick();
      if (n === 'share') { log('notice_share', { title: o.title });
        await Meta.share(`📄 [인사 발령] ${g.nick ? g.nick + ' 님, ' : ''}오늘부로 보드게임 주식회사 ${o.title} 됐습니다 😎\n사유: ${o.reason}\n칼퇴 보드게임에서 너도 잼민이부터 시작해 봐 ㅋ`); }
      el.classList.remove('show', 'stamp');
    };
    log('notice_show', { title: o.title });
  }
  function careerTitle() { const g = S(); return g.title || TITLES[g.career] || TITLES[0]; }

  // ---------- 5) 명함첩 ----------
  function cardsSheet() {
    const g = S(), C = (window.Characters && Characters.list) || [];
    const box = document.createElement('div');
    box.innerHTML = `<p class="tg-note">처음 이긴 상대의 명함이 모여요 · ${Object.keys(g.cards).length} / ${C.length}</p><div class="tg-cards">` + C.map(c => {
      const got = g.cards[c.name];
      return `<div class="tg-bc${got ? '' : ' lock'}"><i>${got ? c.ic : '❔'}</i><b>${got ? c.name : '???'}</b><small>${got ? c.tag.replace(/^\d+단계 · /, '') : (c.s[0] + '단계 상대를 이기면')}</small>${got ? `<em>“${esc(c.lose[0])}”</em>` : ''}</div>`;
    }).join('') + '</div>';
    if (window.Story) { const b = document.createElement('button'); b.type = 'button'; b.className = 'tg-row'; b.innerHTML = '<span class="t"><b>📔 회사 생활 앨범</b><small>다시 보는 장면과 엔딩</small></span><span class="tg-pill">열기</span>';
      b.onclick = () => { Meta.closeSheet(); setTimeout(() => Story.album(), 250); }; box.appendChild(b); }
    Meta.sheet('📇 명함첩', box);
  }

  // ---------- 2) 오늘의 특근 ----------
  const TWISTS = [
    { k: 'hint', t: '힌트 금지', d: '💡 힌트 없이 이기기' },
    { k: 'undo', t: '무르기 금지', d: '↩️ 무르기 없이 이기기' },
    { k: 'none', t: '정시 출근', d: '그냥 이기면 끝!' },
  ];
  if (ID === 'uno') TWISTS.push({ k: 'bomb', t: '야근 폭탄 데이', d: '🌙 야근 폭탄이 두 배로 섞여 있어요' });
  function todayOT() {
    const day = Meta.dayNumber(), salt = { omok: 1, janggi: 2, baduk: 3, chess: 4, uno: 5 }[ID] || 0;
    const r = (Meta.data.prog && Meta.data.prog.r) || 1000;
    const base = Math.max(2, Math.min(9, Math.round((r - 650) / 130)));        // around your level
    const s = Math.max(1, Math.min(10, base + ((day * 7 + salt) % 3) - 1 + 1)); // one notch above, ±1
    return { s, tw: TWISTS[(day + salt) % TWISTS.length], ch: charOf(s), day };
  }
  let otRun = null;
  const otDone = () => { const o = S().ot; return o && o.day === Meta.dayNumber() && o.done; };
  function startOT() {
    const o = todayOT(); if (otDone()) { Meta.toast('오늘 특근은 끝냈어요. 내일 또 와요!'); return; }
    otRun = o; log('overtime_start', { s: o.s, tw: o.tw.k });
    if (ID === 'uno') Uno.setRules({ bomb: o.tw.k === 'bomb' });
    G.start('cpu', 10 + o.s);
    setTimeout(() => Meta.toast(`🌙 오늘의 특근 · ${o.tw.t} — ${o.tw.d}`, 2600), 500);
  }
  const guard = (k, msg) => { const f = G[k]; if (typeof f !== 'function') return;
    G[k] = function () { if (otRun && otRun.tw.k === k) { Meta.toast(msg); return; } return f.apply(G, arguments); }; };
  // the twist keys match the game methods they block
  guard('hint', '🚫 오늘 특근은 힌트 금지예요'); guard('undo', '🚫 오늘 특근은 무르기 금지예요');
  const os = G.openSetup; G.openSetup = function () { if (otRun) { otRun = null; if (ID === 'uno') Uno.setRules({ bomb: false }); } return os.apply(G, arguments); };

  // ---------- 4) rivalry / rematch ----------
  let rematchRun = null;
  function startRematch() {
    const rm = S().rematch; if (!rm) return; rematchRun = rm; log('rematch_start', { s: rm.s });
    G.start('cpu', 10 + rm.s);
    setTimeout(() => Meta.toast(`🔥 ${rm.ic} ${rm.name}의 재대결 — 이기면 코인 50`, 2400), 500);
  }

  // ---------- results ----------
  Meta.onEnd(info => {
    const g = S(), s = strengthOf(info), c = charOf(s);
    if (isKaltoe() && !kaltoeToast) { kaltoeToast = true; setTimeout(() => Meta.toast('🏃 칼퇴 타임! 지금 받는 코인은 2배예요', 2600), 2600); }
    if (!c) { otRun = null; rematchRun = null; return; }
    const win = info.result === 'win', lose = info.result === 'lose';
    // 명함
    if (win && !g.cards[c.name]) { g.cards[c.name] = Meta.dayNumber(); setTimeout(() => Meta.toast(`📇 ${c.ic} ${c.name}의 명함을 받았어요 (${Object.keys(g.cards).length}/10)`, 2600), 3400); log('card_get', { name: c.name }); }
    // rivalry
    const r = g.rel[c.name] = g.rel[c.name] || { w: 0, l: 0, ls: 0 };
    if (win) { r.w++; r.ls = 0; } else if (lose) { r.l++; r.ls++; }
    if (lose && r.ls >= 3 && !(g.rematch && g.rematch.name === c.name)) { g.rematch = { name: c.name, ic: c.ic, s, game: ID }; r.ls = 0; log('rematch_offer', { s }); }
    if (rematchRun) { if (win) { Meta.addPoints(50); setTimeout(() => Meta.toast(`🔥 복수 성공! ${c.name}에게 이겼어요 · +50 코인`, 2600), 2000); g.rematch = null; log('rematch_win', { s }); } rematchRun = null; }
    // 특근
    if (otRun) { if (win) { g.ot = { day: Meta.dayNumber(), done: true }; Meta.addPoints(60); if (window.Chest) Chest.grant('overtime');
        setTimeout(() => Meta.toast('🌙 특근 완료! 코인 +60 · 🎁 행운 상자', 2800), 2200); log('overtime_win', { s }); }
      otRun = null; if (ID === 'uno') Uno.setRules({ bomb: false }); }
    // 승진
    if (info.mode === 'arcade' && win) {
      const stg = Math.min(10, info.stage || 0), promoted = stg > g.career;
      const story = g.story || {}, bossFirst = stg === 10 && !(story.boss && story.boss[ID]);
      if (promoted) g.career = stg;
      const title = TITLES[stg];
      const showNotice = k => { if (promoted && k !== 'quit') notice({ title, rankIdx: stg, reason: `${Meta.NAME} 승진 도전에서 ${c.ic} ${josa(c.name, '을', '를')} 꺾은 공로` }); };
      if (promoted || bossFirst) setTimeout(() => { if (window.Story) Story.afterWin(stg, showNotice); else showNotice(); }, 2600);
    }
    Meta.save(); Meta.renderHub();
  });

  // ---------- hub ----------
  Meta.addHubPart({ act: 'kaltoe', top: true, html: () => isKaltoe() ? `<div class="tg-kaltoe">🏃 <b>칼퇴 타임</b> · 19시까지 받는 코인 2배!</div>` : '', click: () => {} });
  Meta.addHubPart({
    act: 'rematch',
    html: () => { const rm = S().rematch; if (!rm || rm.game !== ID) return '';
      return `<button type="button" class="tg-friend tg-rematch" data-act="rematch"><span class="tg-d-ic">${rm.ic}</span><span class="tg-d-t"><b>${josa(rm.name, '이', '가')} 재대결을 신청했어요</b><small>"한 판 더 하시죠?" · 이기면 코인 50</small></span><span class="tg-d-st">수락</span></button>`; },
    click: startRematch,
  });
  Meta.addHubPart({
    act: 'overtime',
    html: () => { const o = todayOT(); if (!o.ch) return ''; const done = otDone();
      return `<button type="button" class="tg-friend tg-ot${done ? ' done' : ''}" data-act="overtime"><span class="tg-d-ic">🌙</span><span class="tg-d-t"><b>오늘의 특근 · ${o.tw.t}</b><small>${done ? '완료! 내일 새 특근이 열려요' : `${o.ch.ic} ${o.ch.name} 상대 · ${o.tw.d} · 코인 +60 · 🎁`}</small></span><span class="tg-d-st">${done ? '✓' : '출근'}</span></button>`; },
    click: startOT,
  });
  Meta.addHubPart({
    act: 'career', top: true,
    html: () => { const g = S(); if (!Meta.isOpen('stats')) return '';
      return `<button type="button" class="tg-idcard" data-act="career"><span class="ph">${['🧑‍🎓', '👨‍💼', '👨‍💼', '🧑‍💻', '🤵', '🧔', '👔', '🕴️', '🎩', '🎩', '👑'][g.career]}</span><span class="t"><small>보드게임 주식회사 사원증</small><b>${esc(g.nick || '이름 미등록')} · ${esc(careerTitle())}</b></span><span class="cd">📇 ${Object.keys(g.cards).length}/10</span></button>`; },
    click: () => cardsSheet(),
  });
  return { notice, cardsSheet, startOT, careerTitle, isKaltoe };
})();
window.Fun = Fun;
