/* ===== 칼퇴 보드게임 — story scenes and endings =====
   One story shared by all five games: a scene plays the first time you reach a stage in ANY game.
   - prologue: first time a game opens
   - pre-stage scene: before 승진 도전 stage N (the games call window.StoryGate from startStage)
   - post-win line: after beating stage N for the first time, then the 인사 발령 공문 (fun.js)
   - stage 10 → ending choice (🏢 사장 / 🍗 퇴사); all five games' 잼사장 beaten → 👑 hidden ending
   Seen scenes and endings live in Meta.data.growth.story (shared across the combined app). */
const Story = (function () {
  const ID = window.GAME_ID;
  const ME = { ic: '🧑‍🎓', name: '나' };
  // line: [who, text]  who = character name | '나' | '방송' | '@' (place / narration)
  const S = {
    pro: { place: '보드게임 주식회사 로비 · 오전 8시 59분', bg: 'lobby', lines: [
      ['방송', '오늘도 전 직원 야근입니다. 파이팅!'], ['나', '(출근 첫날부터 야근이라고?)'],
      ['잼부장', '신입? 우리 회사는 승진을 보드게임으로 정해.'], ['잼부장', '칼퇴하고 싶으면… 올라와 봐.']] },
    1: { place: '인턴 자리', bg: 'desk', lines: [['잼민이', '니가 신입임? 나도 인턴임 ㅋ'], ['나', '(초등학생이 왜 회사에…?)'], ['잼민이', '우리 아빠가 사장인데 ㅇㅇ. 나 이기면 인정해 줌']], win: ['잼민이', 'ㅠㅠ 아빠한테 이를 거임!!'] },
    2: { place: '탕비실', bg: 'pantry', lines: [['잼인턴', '동기님도 정규직 전환 노리세요?'], ['잼인턴', '자리는 하나래요… 죄송하지만 제가 가져갈게요!']], win: ['잼인턴', '정규직은 동기님 거예요. 대신 커피는 제가 탈게요 ㅠ'] },
    3: { place: '오후 5시 59분 사무실', bg: 'desk', lines: [['잼사원', '여기서 칼퇴하면 찍혀요. 저도 1년째 못 해봤어요'], ['잼사원', '바꾸고 싶으면 위로 가야 돼요. 사장실까지요'], ['잼사원', '일단 저부터 이겨 보세요. 힘들 걸요?']], win: ['잼사원', '당신이라면… 진짜 칼퇴시켜 줄 수도 있겠다'] },
    4: { place: '모니터 두 대 켜진 자리', bg: 'desk', lines: [['잼대리', '요즘 신입이 실적을 올린다며?'], ['잼대리', '이 회사 일은 내가 다 해. 자리 뺏기면 곤란하지'], ['잼대리', '정리해 드릴게요. 최종_최종으로']], win: ['잼대리', '…이제 내 일 좀 나눠 해주세요. 진심입니다'] },
    5: { place: '회의실 · 화이트보드 가득', bg: 'meeting', lines: [['잼과장', '자, 이 대국에 대한 킥오프 미팅부터 하죠'], ['나', '(벌써 7시인데…)'], ['잼과장', '야근이 왜 있냐고요? 회의가 길어서죠. 🙂']], win: ['잼과장', '…회의를 줄이는 방안에 대해 회의를 해보죠'] },
    6: { place: '옥상 흡연실 옆 벤치', bg: 'roof', lines: [['잼차장', '자네가 요즘 소문난 그 신입이구먼'], ['잼차장', '나도 한때 칼퇴를 꿈꿨지. 20년 전 얘기야'], ['잼차장', '나를 이기면 위로 올라가는 길을 알려주지']], win: ['잼차장', '잼부장을 조심하게. 그 친구가 야근을 만든 장본인이야'] },
    7: { place: '부장실 · 밤 9시', bg: 'night', lines: [['잼부장', '첫날 로비에서 본 신입이군. 여기까지 올 줄은 몰랐어'], ['잼부장', '칼퇴? 우리 때는 말이야, 퇴근이란 단어도 없었어'], ['잼부장', '결과로 증명하게']], win: ['잼부장', '…사실 나도 집에 가고 싶었네. 임원실 엘리베이터는 저쪽이야'] },
    8: { place: '임원 라운지 · 창밖 야경', bg: 'night', lines: [['잼이사', '칼퇴라… 흥미로운 아젠다군'], ['잼이사', '하지만 큰 그림으로 보면, 야근은 성장의 상징이지'], ['나', '(그 큰 그림에 우리 집은 없나요…)']], win: ['잼이사', '자네 같은 인재는 상무가 가만두지 않을 거야. 조심하게'] },
    9: { place: '불 꺼진 복도 · 자정', bg: 'dark', lines: [['잼상무', '…기다렸다'], ['잼상무', '사장을 끌어내리면 이 회사는 내 것. 야근은 두 배로 늘린다'], ['잼상무', '내 편에 서라. 아니면… 여기서 끝이다']], win: ['잼상무', '…강하군. 사장님이 기다리실 거다'] },
    10: { place: '사장실 · 벽에 걸린 사훈 "전 직원 야근"', bg: 'boss', lines: [['잼사장', '여기까지 올라온 건 자네가 처음이군'], ['잼사장', '이 사훈, 내가 쓴 게 아니네. 30년 전 내 상사가 쓴 거지'], ['잼사장', '나도 인턴 땐 칼퇴를 꿈꿨어. 그런데 올라올수록 잊었지'], ['잼사장', '자네가 날 이긴다면… 그 꿈, 자네에게 맡기겠네']], win: ['잼사장', '자, 이 자리는 이제 자네 것일세. 어떻게 하겠나?'] },
    boss: { place: '로비 · 다음 날 오후 5시 59분', bg: 'lobby', ending: '🏢 사장 엔딩 · 오늘부터 6시 퇴근', lines: [
      ['방송', '전 직원, 6시에 퇴근합니다. 이건 사장 명령입니다'], ['@', '사훈 액자가 바뀌었다 — "전 직원 야근" → "전 직원 칼퇴"'],
      ['잼사원', '저… 1년 만에 해 떠 있을 때 퇴근해요 ㅠㅠ'], ['잼차장', '허허, 자네가 해냈구먼'], ['잼민이', '그럼 이제 나 학원 가도 됨?']] },
    quit: { place: '1년 뒤 · 동네 치킨집 「잼닭」', bg: 'chicken', ending: '🍗 퇴사 엔딩 · 치킨집 사장님', lines: [
      ['나', '사장 자리는 괜찮습니다. 저는… 그냥 칼퇴가 하고 싶었어요'], ['@', '1년 뒤, 동네에 치킨집 「잼닭」이 문을 열었다'],
      ['잼차장', '허허, 회사 때려치고 치킨집 하자던 말이 진짜가 됐구먼'], ['@', '가게 문 안내: 영업시간 ~ 저녁 6시 (칼퇴)']] },
    hidden: { place: '꼭대기층 · 아무도 모르던 회장실', bg: 'gold', ending: '👑 히든 엔딩 · 회장님의 호출', lines: [
      ['잼회장', '오목, 장기, 바둑, 체스까지… 자네가 다 이겼다며?'], ['잼민이', '할아버지!! 이 형이 나 맨날 이겨!'],
      ['잼회장', '자네가 이 회사의 진짜 주인일세. 주 4일제, 해 보겠나?'], ['@', '사원증에 「명예 회장」이 새겨졌다']] },
  };
  const WHO = n => n === '나' ? ME : n === '방송' ? { ic: '📢', name: '사내 방송' } : n === '잼회장' ? { ic: '🧓', name: '잼회장' }
    : ((window.Characters && Characters.list.find(c => c.name === n)) || { ic: '💬', name: n });
  const st = () => { const d = Meta.data; d.growth = d.growth || {}; const g = d.growth; g.story = g.story || { seen: {}, end: {}, boss: {} }; return g.story; };
  const log = (n, p) => { const t = window.Toss; if (t) t.log(n, Object.assign({ game: ID }, p || {})); };

  // ---- scene player ----
  function play(key, opts) {
    const sc = S[key]; if (!sc) { opts && opts.done && opts.done(); return; }
    const lines = opts && opts.only ? [opts.only] : sc.lines;
    let el = document.getElementById('tgScene');
    if (!el) { el = document.createElement('div'); el.id = 'tgScene'; document.body.appendChild(el); }
    el.className = 'show bg-' + sc.bg; let i = 0;
    const head = `<div class="sc-top"><span>📍 ${sc.place}</span><button type="button" class="sc-skip">건너뛰기 ⏭</button></div>${sc.ending && !(opts && opts.only) ? `<div class="sc-end">${sc.ending}</div>` : ''}`;
    const draw = () => {
      const [w, t] = lines[i], who = WHO(w), nar = w === '@';
      el.innerHTML = head + (nar ? `<div class="sc-nar">${t}</div>` : `<div class="sc-ch${w === '나' ? ' me' : ''}">${who.ic}</div><div class="sc-bub${w === '나' ? ' me' : ''}"><b>${who.name}</b><p>${t}</p></div>`) +
        `<div class="sc-hint">${i + 1} / ${lines.length} · 화면을 누르면 다음</div>`;
      el.querySelector('.sc-skip').onclick = e => { e.stopPropagation(); log('scene_skip', { key, at: i }); close(); };
    };
    const close = () => { el.className = ''; el.innerHTML = ''; el.onclick = null; opts && opts.done && opts.done(); };
    el.onclick = () => { i++; if (i >= lines.length) close(); else { draw(); if (typeof SFX !== 'undefined' && SFX.tap) SFX.tap(); } };
    draw(); log('scene_show', { key });
  }

  // ---- hooks ----
  window.StoryGate = (s, go) => {
    const g = st(); if (g.seen[s] || !S[s]) return true;
    g.seen[s] = 1; Meta.save(); play(s, { done: go }); return false;
  };
  function choice(done) {
    const box = document.createElement('div');
    box.innerHTML = `<p class="tg-note">👑 잼사장: "자, 이 자리는 이제 자네 것일세. 어떻게 하겠나?"</p>`;
    [['boss', '🏢 사장이 된다', '회사를 바꾸고 전 직원 칼퇴'], ['quit', '🍗 사직서를 낸다', '사장 자리 대신 내 칼퇴']].forEach(([k, t, sub]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tg-row';
      b.innerHTML = `<span class="t"><b>${t}</b><small>${sub}</small></span>`;
      b.onclick = () => { Meta.closeSheet(); log('ending_pick', { k }); setTimeout(() => ending(k, done), 250); };
      box.appendChild(b);
    });
    Meta.sheet('엔딩을 고르세요', box);
  }
  function ending(k, done) {
    const g = st(); const first = !g.end[k]; g.end[k] = Meta.dayNumber(); if (k === 'quit') Meta.data.growth.title = '치킨집 사장';
    if (k === 'boss' && Meta.data.growth.title === '치킨집 사장') Meta.data.growth.title = '';
    Meta.save(); log('ending_show', { k, first });
    play(k, { done: () => { if (first) Meta.toast('📔 엔딩을 회사 생활 앨범에 담았어요 (' + Object.keys(g.end).length + '/3)', 2600); done && done(k); } });
  }
  // called by fun.js after a first stage win (before the 인사 발령 공문)
  function afterWin(s, next) {
    const g = st(); const sc = S[s];
    if (s === 10) {
      // the boss counts as beaten here once an ending is picked (closing the choice lets you pick next time)
      const thenHidden = k => { g.boss[ID] = 1; Meta.save(); const all = ['omok', 'janggi', 'baduk', 'chess'].every(x => g.boss[x]);
        if (all && !g.end.hidden) setTimeout(() => ending('hidden', () => { Meta.data.growth.title = '명예 회장'; Meta.save(); }), 600); next && next(k); };
      if (sc) play(10, { only: sc.win, done: () => choice(thenHidden) }); else choice(thenHidden);
      return;
    }
    if (sc && sc.win) play(s, { only: sc.win, done: () => next && next() }); else next && next();
  }
  // ---- 회사 생활 앨범 ----
  function album() {
    const g = st(); const box = document.createElement('div');
    const row = (k, t, sub, ok) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tg-row' + (ok ? '' : ' lock');
      b.innerHTML = `<span class="t"><b>${ok ? t : '🔒 ' + t}</b><small>${sub}</small></span><span class="tg-pill">${ok ? '보기' : ''}</span>`;
      b.onclick = () => { if (!ok) return; Meta.closeSheet(); setTimeout(() => play(k), 250); }; box.appendChild(b); };
    box.insertAdjacentHTML('beforeend', `<p class="tg-note">엔딩 ${Object.keys(g.end).length} / 3 · 장면은 처음 볼 때 자동으로 담겨요</p>`);
    row('boss', '🏢 사장 엔딩', '잼사장을 이기고 사장이 된다', !!g.end.boss);
    row('quit', '🍗 퇴사 엔딩', '잼사장을 이기고 사직서를 낸다', !!g.end.quit);
    row('hidden', '👑 히든 엔딩', '4개 게임 모두에서 잼사장 격파 (' + ['omok', 'janggi', 'baduk', 'chess'].filter(x => g.boss[x]).length + '/4)', !!g.end.hidden);
    row('pro', '프롤로그 · 첫 출근', '보드게임 주식회사 로비', !!g.seen.pro);
    for (let s = 1; s <= 10; s++) { const c = WHO(S[s].lines.find(l => l[0] !== '나')[0]); row(s, s + '단계 · ' + c.ic + ' ' + c.name, S[s].place, !!g.seen[s]); }
    Meta.sheet('📔 회사 생활 앨범', box);
  }
  // prologue on the first visit
  Meta.init().then(() => { const g = st(); if (!g.seen.pro) { g.seen.pro = 1; Meta.save(); setTimeout(() => play('pro'), 700); } }).catch(() => {});
  return { play, afterWin, album, ending };
})();
window.Story = Story;
