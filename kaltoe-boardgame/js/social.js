/* ===== 친구 대국 + 링크/코드 — no server: the whole move list travels in the link =====
   Code format  "<game>:m.<id>.<size>.<moves>"  (moves base36, joined by "-")  — friend match
                "<game>:c.<day>.<idx>.<sec>.<tries>"                        — puzzle challenge
   A shared Toss link opens the mini-app with ?g=<code>; the same code is also printed in the
   message so it can be pasted in by hand (and so it works outside Toss). */
const Social = (function () {
  const ID = window.GAME_ID, NAME = Meta.NAME;
  const G = { omok: () => Omok, janggi: () => Janggi, baduk: () => Baduk, chess: () => ChessApp, uno: () => Uno }[ID];
  const FIRST = { omok: 1, janggi: 'r', baduk: 1, chess: 'w' }[ID], SECOND = { omok: 2, janggi: 'b', baduk: 2, chess: 'b' }[ID];
  const SIDE = { omok: { 1: '흑', 2: '백' }, janggi: { r: '초', b: '한' }, baduk: { 1: '흑', 2: '백' }, chess: { w: '은색', b: '검은색' } }[ID];
  const handlers = {};
  let matches = {}, cur = null;
  const KEY = ID + '_matches';

  // ---- codes ----
  const enc = a => a.map(v => (v < 0 ? 'p' : v.toString(36))).join('-');
  const dec = s => (s ? s.split('-').map(x => (x === 'p' ? -1 : parseInt(x, 36))) : []);
  function parse(text) {
    const m = String(text || '').match(new RegExp(ID + ':([mcsi]\\.[0-9a-zp.\\-]+)'));
    if (!m) return null;
    const parts = m[1].split('.');
    if (parts[0] === 'm') return { kind: 'm', id: parts[1], size: +parts[2] || 0, moves: dec(parts[3] || '') };
    if (parts[0] === 's') return { kind: 's', id: parts[1] };
    if (parts[0] === 'i') return { kind: 'i', from: parts[1] };
    if (parts[0] === 'c') return { kind: 'c', day: parts[1], idx: +parts[2], sec: +parts[3], tries: +parts[4] || 1 };
    return null;
  }
  const codeOf = s => ID + ':' + s;
  async function send(message, code) {
    const t = window.Toss;
    let text = message + '\n\n토스에서 링크가 안 열리면 ' + NAME + ' 앱의 "코드 입력"에 아래를 붙여넣어 주세요\n' + code;
    if (window.I18N) text = I18N.t(text);   // 영어 모드: 공유 문구도 번역 (한국어 모드에서는 그대로)
    // the share link must be an intoss:// deep link to this mini-app; the query reaches the page as ?g=…
    // 웹/PWA 빌드에서는 같은 페이지의 쿼리 링크를 쓴다 (intoss:// 는 토스 밖에서 열리지 않는다)
    const path = window.PLATFORM === 'toss'
      ? 'intoss://' + (window.APP_NAME || ID) + '?g=' + encodeURIComponent(code)
      : location.origin + location.pathname + '?g=' + encodeURIComponent(code);
    const how = t ? await t.share(text, path) : false;
    if (how === 'clipboard') Meta.toast('복사했어요. 친구에게 붙여넣기 해주세요');
    else if (!how) { try { await navigator.clipboard.writeText(text); Meta.toast('복사했어요. 친구에게 붙여넣기 해주세요'); } catch (e) { codeSheet(text); } }
  }
  function codeSheet(text) { // last resort: show the text to copy by hand
    const box = document.createElement('div');
    box.innerHTML = '<p class="tg-note">아래 내용을 길게 눌러 복사한 뒤 친구에게 보내 주세요.</p><textarea readonly></textarea>';
    box.querySelector('textarea').value = text; Meta.sheet('보낼 내용', box);
  }

  // ---- matches ----
  async function load() { matches = (await Store.get(KEY)) || {}; }
  const save = () => Store.set(KEY, matches);
  const newId = () => Math.random().toString(36).slice(2, 8);
  const myTurn = mt => !mt.over && ((mt.moves.length % 2 === 0) === (mt.color === FIRST));

  function open(mt) {
    cur = mt; Meta.closeSheet(); Meta.closeModal();
    const hook = ev => onMove(mt, ev);
    if (ID === 'baduk') G().startMail(mt.moves, mt.size || 9, mt.color, hook); else G().startMail(mt.moves, mt.color, hook);
    if (mt.over) return;
    if (!myTurn(mt)) setTimeout(() => Meta.toast('친구 차례예요. 친구가 수를 보내면 여기서 이어져요', 2600), 600);
  }
  function msgFor(mt, ev) {
    const n = mt.moves.length;
    if (ev.over) {
      const r = ev.won === true ? '내가 이겼어! 🏆' : ev.won === false ? '네가 이겼어… 축하해 🏳️' : '비겼어 🤝';
      return `♟ ${NAME} 친구 대국 끝 · ${n}수\n${r}\n한 판 더 할래?`;
    }
    return `♟ ${NAME} 친구 대국 · ${n}수째\n내가 뒀어, 이제 네 차례야!`;
  }
  function onMove(mt, ev) {
    mt.moves = ev.moves.slice(); mt.updated = Date.now();
    if (ev.over) { mt.over = true; mt.won = ev.won; }
    matches[mt.id] = mt; save(); Meta.renderHub();
    server(mt, ev);
    if (ev.undo) return;
    if (window.Monetize) Monetize.log(ev.over ? 'mail_over' : 'mail_move', { n: mt.moves.length });
    const code = codeOf(`m.${mt.id}.${mt.size || 0}.${enc(mt.moves)}`);
    const go = () => send(msgFor(mt, ev), code);
    setTimeout(() => Meta.modal(ev.over
      ? { icon: ev.won ? '🏆' : ev.won === false ? '🤝' : '⚖️', kicker: '친구 대국', title: ev.won ? '승리!' : ev.won === false ? '패배' : '무승부', sub: '친구에게 결과를 알려 주세요.', actions: [{ label: '결과 보내기', fn: go }, { label: '닫기' }] }
      : { icon: '📨', kicker: '친구 대국 · ' + mt.moves.length + '수째', title: '친구에게 보내기', sub: '보내야 친구가 다음 수를 둘 수 있어요.\n잘못 뒀다면 보내기 전에 무르기를 누르세요.', actions: [{ label: '친구에게 보내기', fn: go }, { label: '나중에 보내기' }] }), ev.over ? 1600 : 350);
  }
  // ---- optional server (window.TURN_API): store moves + push "내 차례" to the opponent ----
  const API = window.TURN_API || '';
  async function api(body) { if (!API) return null; try { const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return await r.json(); } catch (e) { return null; } }
  let asked = false;
  async function server(mt, ev) {
    if (!API || !window.Toss) return;
    const key = await Toss.anonKey(); if (!key) return;
    if (!asked && !ev.undo) { asked = true; const s = (await Store.get(ID + '_notify')) || {}; if (!s.asked) { Toss.askNotify(window.TURN_AGREEMENT); Store.set(ID + '_notify', { asked: true }); } }
    api({ game: ID, id: mt.id, size: mt.size || 0, moves: mt.moves, color: mt.color === FIRST ? 'first' : 'second', key, over: !!ev.over, undo: !!ev.undo });
  }
  async function fetchMatch(id) {
    const r = await api({ op: 'get', id }); const m = r && r.match;
    if (!m || m.game !== ID) { Meta.toast('대국을 찾지 못했어요'); return; }
    receive({ id: m.id, size: m.size, moves: m.moves });
  }
  async function syncList() {
    if (!API || !window.Toss) return;
    const key = await Toss.anonKey(); if (!key) return;
    const r = await api({ op: 'list', key }); if (!r || !r.matches) return;
    let changed = false;
    for (const m of r.matches) { if (m.game !== ID) continue; const cur = matches[m.id];
      if (!cur || cur.moves.length < m.moves.length) { matches[m.id] = Object.assign(cur || { id: m.id, created: Date.now(), color: m.first ? FIRST : SECOND }, { moves: m.moves, size: m.size, over: m.over, updated: Date.now() }); changed = true; } }
    if (changed) { save(); Meta.renderHub(); }
  }
  function startNew() {
    const size = ID === 'baduk' ? (G().size ? G().size() : 9) : 0;
    const mt = { id: newId(), moves: [], size, color: FIRST, created: Date.now(), updated: Date.now() };
    matches[mt.id] = mt; save(); open(mt);
    Meta.toast('먼저 한 수 두고 친구에게 보내세요 (' + SIDE[FIRST] + ')', 2600);
  }
  function receive(p) {
    let mt = matches[p.id];
    if (!mt) mt = { id: p.id, moves: [], size: p.size, color: p.moves.length % 2 === 0 ? FIRST : SECOND, created: Date.now() };
    const same = mt.moves.length <= p.moves.length && mt.moves.every((v, i) => v === p.moves[i]);
    if (!same && mt.moves.length > p.moves.length) { Meta.toast('이미 더 진행된 대국이에요'); open(mt); return; }
    mt.moves = p.moves.slice(); mt.size = p.size || mt.size; mt.updated = Date.now();
    matches[mt.id] = mt; save(); open(mt);
  }

  function listSheet() {
    const box = document.createElement('div');
    const list = Object.values(matches).sort((a, b) => (myTurn(b) - myTurn(a)) || (b.updated - a.updated)).slice(0, 12);
    if (!list.length) box.innerHTML = '<p class="tg-note">친구와 한 수씩 주고받는 대국이에요. 내가 두고 보내면, 친구가 두고 다시 보내요. 시간 제한이 없어서 틈날 때 한 수씩 두면 돼요.</p>';
    list.forEach(mt => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tg-row';
      const st = mt.over ? (mt.won ? ['승리', 'win'] : mt.won === false ? ['패배', 'lose'] : ['종료', '']) : myTurn(mt) ? ['내 차례', 'go'] : ['기다리는 중', ''];
      const ago = Math.max(1, Math.round((Date.now() - (mt.updated || Date.now())) / 60000));
      b.innerHTML = `<span class="t"><b>${SIDE[mt.color]}으로 두는 대국 · ${mt.moves.length}수</b><small>${ago < 60 ? ago + '분' : ago < 1440 ? Math.round(ago / 60) + '시간' : Math.round(ago / 1440) + '일'} 전${mt.size ? ' · ' + mt.size + '줄' : ''}</small></span><span class="tg-pill ${st[1]}">${st[0]}</span>`;
      b.onclick = () => open(mt); box.appendChild(b);
    });
    const btns = document.createElement('div'); btns.className = 'tg-btns';
    btns.innerHTML = '<button type="button" class="pri">새 대국 시작</button><button type="button">받은 코드 입력</button>';
    btns.children[0].onclick = startNew; btns.children[1].onclick = inputSheet;
    box.appendChild(btns);
    Meta.sheet('친구 대국', box);
  }
  function inputSheet() {
    const box = document.createElement('div');
    box.innerHTML = '<p class="tg-note">친구에게 받은 메시지를 통째로 붙여넣어도 돼요.</p><textarea placeholder="' + ID + ':m.… 또는 ' + ID + ':c.…"></textarea><button type="button" class="tg-btn pri" style="width:100%">열기</button>';
    box.querySelector('button').onclick = () => { if (!handle(box.querySelector('textarea').value)) Meta.toast('코드를 찾지 못했어요'); };
    Meta.sheet('받은 코드 입력', box);
  }
  function handle(text) {
    const p = parse(text); if (!p) return false;
    Meta.closeSheet();
    if (p.kind === 'm' || p.kind === 's') Meta.unlock('friend');
    if (p.kind === 'm') { receive(p); return true; }
    if (p.kind === 's') { fetchMatch(p.id); return true; }
    if (handlers[p.kind]) { handlers[p.kind](p); return true; }
    return false;
  }

  // ---- side names on the HUD during a friend match ----
  window.UIX_SIDE_NAMES = g => {
    if (g !== ID) return null; const s = G().state();
    if (s.mode === 'puzzle') return [['나', SIDE[FIRST]], ['CPU', SIDE[SECOND]]];
    if (s.mode !== 'mail' || !s.mail) return null;
    const me = s.mail.color, mine = c => (c === me ? '나' : '친구');
    return [[mine(FIRST), SIDE[FIRST]], [mine(SECOND), SIDE[SECOND]]];
  };
  // result card: no "다시 하기" rematch semantics for mail — offer a new match instead
  Meta.addResultButton((R, btn, last) => {
    if (!last || last.info.mode !== 'mail' || !cur) return;
    btn('', 'share', '결과 보내기', 'mailres', () => send(msgFor(cur, { over: true, won: cur.won }), codeOf(`m.${cur.id}.${cur.size || 0}.${enc(cur.moves)}`)));
  });

  Meta.addHubPart({
    act: 'friend',
    html: () => {
      const n = Object.values(matches).filter(myTurn).length;
      return `<button type="button" class="tg-friend" data-act="friend"><span class="tg-d-ic">👥</span><span class="tg-d-t"><b>친구 대국</b><small>한 수씩 링크로 주고받기 · 시간 제한 없음</small></span><span class="tg-d-st">${n ? '내 차례 ' + n : '시작'}</span></button>`;
    },
    click: listSheet,
  });
  Meta.addHubPart({ act: 'code', html: () => '', click: inputSheet });

  // incoming link: ?g=<code> (Toss share link) or #g=<code>
  function incoming() {
    try {
      const q = new URLSearchParams(location.search).get('g') || (location.hash.match(/g=([^&]+)/) || [])[1];
      if (q) setTimeout(() => handle(decodeURIComponent(q)), 400);
    } catch (e) {}
  }
  const ready = load().then(() => { Meta.renderHub(); incoming(); syncList(); });
  return { ready, send, parse, codeOf, handle, onCode: (k, f) => { handlers[k] = f; }, inputSheet, listSheet };
})();

window.Social = Social;
