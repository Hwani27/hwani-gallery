/* ===== CPU 캐릭터 — every CPU strength is a character who talks during the game =====
   Intro card at the start, short speech bubbles on captures / checks / long thinks, a last word
   on the result card. Reactions are driven by the game's own sound events (SFX.*), so no game
   code needs to know about them. */
const Characters = (function () {
  const ID = window.GAME_ID;
  const G = { omok: () => Omok, janggi: () => Janggi, baduk: () => Baduk, chess: () => ChessApp, uno: () => Uno }[ID]();
  const HUMAN = { omok: 1, janggi: 'r', baduk: 1, chess: 'w', uno: 0 }[ID];
  // 10 CPU 단계 = 10 캐릭터 (잼민이 → 잼사장): 한 단계 이길 때마다 한 직급씩 올라가는 회사 도장깨기
  // 10 CPU 단계 = 10 캐릭터 (잼민이 → 잼사장). {chk} = 장군 / 체크 / 사목 / 단수
  const C = [
    { s: [1], ic: '🧒', name: '잼민이', tag: '1단계 · 방금 룰 배운 초딩',
      start: ["ㅎㅇ 저 이거 개잘함 ㅋ", "지면 엄마한테 이를 거임", "님 몇 살임? 저는 초3", "이거 이기면 피시방 감", "저 유튜브로 공부함 ㅋㅋ"], hurt: ["아 반칙 아님?", "방금 거 취소요 취소", "헐 그게 됨?", "아 손가락 미끄러짐", "님 핵 씀? 신고함"], hit: ["ㅋㅋㅋ 개꿀", "이거 실화냐 ㅋㅋ", "ㄹㅇ 개이득", "잡았다 요놈", "님 방금 그거 실수죠? ㅋㅋ"], check: ["{chk}! 이거 맞죠? ㅋㅋ", "{chk}~ 쫄았죠?", "어? 이거 이긴 거 아님?"], think: ["잠만요 잠만요", "어디 두지 ㅠ", "엄마가 숙제하래요 빨리 둘게요", "(코 판다)", "아 배고프다"], wait: ["님 자요?", "빨리요 빨리!!", "저 학원 가야 돼요", "ㅋㅋ 쫄았음?", "렉 걸림?"], late: ["이 판 언제 끝남?", "아 손 아파", "저 이제 밥 먹으러 가야 됨"], win: ["내가 이김 ㅋㅋ 개쩔지?", "님 저한테 진 거 단톡방에 올림 ㅋ", "ㅋㅋ 초딩한테 짐"], lose: ["아 렉 걸렸음", "한 판만 더 해요 진짜로", "방금 거 연습판임", "형 진짜 잘하네요… 근데 다음엔 제가 이김"] },
    { s: [2], ic: '🧑‍🎓', name: '잼인턴', tag: '2단계 · 열정만 만렙 인턴',
      start: ["열심히 배우겠습니다!", "정규직 전환 걸린 판입니다…", "선배님, 잘 부탁드립니다!", "오늘 첫 대국입니다! 떨리네요", "메모장 켜놓고 두겠습니다"], hurt: ["앗 제가 실수를…", "메모해 두겠습니다!", "이건 교육 때 안 배운 건데요…", "죄송합니다! 다시 하겠습니다", "ㅠㅠ 법인카드 잃어버린 기분이에요"], hit: ["오 이거 맞나요?", "배운 대로 했습니다!", "혹시… 제가 잘한 건가요?", "선배님 이거 보셨어요?!"], check: ["{chk}… 보고 드려도 될까요?", "저 {chk} 처음 불러봐요!"], think: ["선배님이라면 어디 두실까…", "매뉴얼 찾아보는 중입니다", "(열심히 필기 중)", "잠시만요, 팀장님께 여쭤볼게요"], wait: ["천천히 하셔도 됩니다! (긴장)", "혹시 커피 타 올까요?", "기다리는 것도 배움이죠!"], late: ["오늘 야근 각이네요 ㅎㅎ", "이 판 끝나면 보고서 써야 해요"], win: ["이거 평가에 들어가나요?!", "정규직 전환 가능할까요…?", "운이 좋았습니다!"], lose: ["많이 배웠습니다!", "오늘 일지에 적겠습니다", "역시 선배님…", "내일은 더 성장한 모습 보여드릴게요!", "정규직 전환… 안 되겠죠? 이직해야 되나…"] },
    { s: [3], ic: '👨‍💼', name: '잼사원', tag: '3단계 · 칼퇴가 목표인 신입',
      start: ["6시 전에 끝내시죠", "빨리 두시면 감사하겠습니다", "점심 먹고 바로 하는 거라 졸리네요", "오늘 금요일인 거 아시죠?"], hurt: ["아 야근각…", "오늘 퇴근은 글렀네요", "월급 루팡 들켰다…", "아 그건 좀…", "이직해야 되나…"], hit: ["오 이건 실적이다", "득템했습니다", "칼퇴 한 걸음 가까이", "이건 연말 평가에 쓸게요"], check: ["이번 건 마감 들어갑니다", "{chk}! 퇴근 준비하시죠"], think: ["(시계를 본다)", "어… 잠시만요", "(몰래 쇼핑몰 장바구니 확인 중)", "메신저 답장 좀 하고요"], wait: ["퇴근 시간 다가옵니다…", "혹시 회의 들어가셨어요?", "저 6시 땡 하면 일어납니다"], late: ["5시 59분입니다", "아 칼퇴 망했다", "이직해야 되나…"], win: ["칼퇴 확정 ㅎㅎ", "오늘 저녁은 치킨이다", "수고하셨습니다~ 먼저 들어가볼게요"], lose: ["수고하셨습니다… 저는 야근하러", "내일 다시 붙어요", "월요병 도졌네요", "이건 회사 탓입니다", "회사 때려칠까…", "사직서 양식 어디 있더라"] },
    { s: [4], ic: '🧑‍💻', name: '잼대리', tag: '4단계 · 일 다 하는 실세',
      start: ["이 판은 제가 처리하죠", "실무는 제가 제일 잘 압니다", "과장님 대신 나왔습니다", "후딱 끝내고 일하러 가야 돼서요"], hurt: ["아 이건 위에서 내려온 수라…", "흠, 예상 못 했네요", "이건 제 KPI에 없던 건데", "요청사항이 바뀌었네요", "회사 때려칠까…"], hit: ["이런 건 대리가 잡아야죠", "정리했습니다", "이건 이미 처리된 건입니다", "버전 관리 잘하셔야죠"], check: ["이거 오늘까지입니다", "{chk}. 회신 부탁드립니다"], think: ["엑셀 돌려보는 중…", "피벗 테이블 만드는 중", "(단축키 연타)", "메일 세 통 동시에 쓰는 중"], wait: ["결재 올려놨는데 확인 부탁드려요", "ASAP 부탁드립니다", "혹시 제 메일 보셨나요?", "(몰래 채용공고 보는 중)"], late: ["이 판 최종_최종_진짜최종이네요", "오늘 회의 몇 개였더라…"], win: ["역시 일은 대리가 하는 거죠", "처리 완료했습니다", "다음 건 주세요"], lose: ["과장님한테는 비밀로 해주세요", "인정합니다", "제 연봉 협상 때 이 얘기는 빼주세요", "이직해야 되나… (잡플래닛 켬)"] },
    { s: [5], ic: '🤵', name: '잼과장', tag: '5단계 · 회의를 사랑하는 중간관리자',
      start: ["자, 이 판 킥오프 하죠", "방향성부터 맞추고 갑시다", "어젠다 공유드릴게요", "오늘 회의는 짧게… 한 두 시간?"], hurt: ["이건 리스크로 관리했어야 했는데", "음… 피드백 반영하죠", "이 부분은 다음 회의에서 논의하죠", "얼라인이 안 됐네요"], hit: ["이게 바로 시너지죠", "성과 났네요", "레버리지 효과죠", "윈윈… 아니 저만 윈이네요"], check: ["액션 아이템 드립니다", "{chk}. 데드라인 지켜주세요"], think: ["잠깐 회의 좀 하고 올게요", "브레인스토밍 중입니다", "화이트보드가 필요하네요", "인사이트를 뽑아보죠"], wait: ["의견 주시면 취합하겠습니다", "혹시 다른 의견 있으신 분?", "미팅 연장할까요?"], late: ["이 회의… 아니 이 판 길어지네요", "다음 주에 후속 미팅 잡죠", "회사 때려칠까… 아니 애들 학원비가…"], win: ["보고서에 잘 쓰겠습니다", "KPI 달성!", "오늘 회의 생산적이었네요"], lose: ["다음 분기엔 다를 겁니다", "회고 미팅 잡죠", "개선 방안 수립하겠습니다", "이직해야 되나… 아니 대출이…"] },
    { s: [6], ic: '🧔', name: '잼차장', tag: '6단계 · 노련한 숨은 고수',
      start: ["나 때는 말이야, 이렇게 안 뒀어", "젊은 친구, 한 수 보지", "요즘 애들은 판을 너무 빨리 둬", "허허, 오랜만에 몸 좀 풀까"], hurt: ["허, 요즘 애들 무섭네", "라떼는 이 수 없었는데", "어허… 눈이 침침해서", "자네 어디서 배웠나?"], hit: ["경험은 못 이겨", "그건 20년 전에 다 해봤지", "허허, 공짜는 사양 안 하지", "기본이 안 됐구먼"], check: ["슬슬 마무리하지", "{chk}이야, 허허"], think: ["커피 한 잔 하고…", "(믹스커피를 젓는다)", "흐음… 옛날 생각나네", "이 판 보니 IMF 때 생각나는구먼"], wait: ["천천히 해, 인생은 길어", "나는 시간 많아", "고민은 길게, 착수는 짧게"], late: ["이 정도면 명승부구먼", "퇴근하고 한 잔 할까?"], win: ["아직 녹슬지 않았어", "연습 더 하고 오게", "허허, 아직은 내가 위구먼"], lose: ["허허, 세대교체인가", "자네 우리 팀 올래?", "오늘 회식은 내가 쏘지", "회사 때려칠까… 치킨집 할까…"] },
    { s: [7], ic: '👔', name: '잼부장', tag: '7단계 · 팀을 이끄는 승부사',
      start: ["결과로 증명하게", "우리 팀은 지는 법이 없어", "자, 실력 좀 보자고", "이 판 끝나고 보고하게"], hurt: ["이건 보고 못 받은 수인데", "누가 이 수를 허락했나", "흠… 다들 긴장해", "이 정도는 예상 범위야"], hit: ["이게 바로 리더십이지", "판을 읽어야 해", "숫자로 말하게", "그래서 결론이 뭔가?"], check: ["결재 들어간다", "{chk}! 다들 집중해"], think: ["전략을 다시 짜보지", "(넥타이를 고쳐 맨다)", "팀장들 다 불러와", "큰 그림을 그려보지"], wait: ["자네 결정이 늦군", "회의는 결론부터 말하게", "시간이 돈이야"], late: ["이 판 결과 오늘 중으로 보고하게", "다들 고생이 많아"], win: ["회식은 내가 쏘지 (이겼으니까)", "실적 마감 완료", "다음 분기도 이렇게만 하자고"], lose: ["자네, 다음 인사 때 보세", "훌륭하군. 인정하지", "이 친구 승진 대상자 명단에 올려"] },
    { s: [8], ic: '🕴️', name: '잼이사', tag: '8단계 · 큰 그림을 보는 임원',
      start: ["큰 그림을 보게", "이 판, 중장기 전략으로 가지", "골프 치러 가기 전에 한 판", "비서실에 30분만 비워두라고 했네"], hurt: ["단기 손실은 괜찮아", "흥미로운 접근이군", "시장 상황이 안 좋군", "이건 외부 변수야"], hit: ["포트폴리오 재편이지", "이게 경영이야", "M&A 성공이군", "구조조정은 아프지만 필요해"], check: ["이사회 안건으로 올리지", "{chk}. 주주들이 기뻐하겠군"], think: ["(창밖을 보며 생각한다)", "5년 뒤를 보고 있네", "(만년필을 돌린다)", "글로벌 트렌드를 고려하면…"], wait: ["결정은 신중하게, 하지만 너무 길면 기회를 놓치지", "자네의 비전이 궁금하군"], late: ["이건 장기전이군", "분기 실적 발표 전엔 끝내지"], win: ["임원은 아무나 하는 게 아니야", "전략의 승리야", "자네도 언젠간 이 자리에 오겠지"], lose: ["자네 같은 인재가 필요해", "이번 분기는 자네 승리군", "스카우트 제의를 해도 되겠나?"] },
    { s: [9], ic: '🎩', name: '잼상무', tag: '9단계 · 냉철한 승부의 신',
      start: ["…시작하지", "실수는 한 번이면 충분해", "여기까지 온 건 칭찬하지", "사장님 전에 나를 넘어야 해"], hurt: ["…계산 밖이군", "좋은 수다", "…흥미롭군", "처음으로 긴장되는군"], hit: ["빈틈.", "그 자리는 내 거다", "보였어.", "그 수는 이미 읽었다"], check: ["끝이 보이나?", "{chk}."], think: ["…", "(말없이 판을 본다)", "(안경을 고쳐 쓴다)", "스무 수 앞까지 봤다"], wait: ["…", "망설임은 약점이다"], late: ["오래 버티는군", "이 판, 기억해 두지"], win: ["더 올라오게", "아직 사장실은 멀었어", "다음엔 실수하지 말게"], lose: ["…강하군. 사장님이 기다리실 거야", "이름을 기억해 두지", "문은 열려 있다. 올라가게"] },
    { s: [10], ic: '👑', name: '잼사장', tag: '10단계 · 회사의 최종 보스',
      start: ["여기까지 올라온 건 자네가 처음이군", "사장실에 온 걸 환영하네", "잼민이 시절부터 지켜봤네", "이 회사를 원하나? 가져가 보게"], hurt: ["크윽… 제법이군!", "이 회사 30년 만에 처음이야", "내 자리가 흔들리는군…", "허… 이사회가 소란스러워지겠어"], hit: ["사장은 괜히 사장이 아니야", "아직 멀었네", "이 회사는 내가 세웠네", "그 수로는 결재 못 받아"], check: ["이 회사의 주인은 나야!", "{chk}! 사장의 한 수일세"], think: ["천 개의 수가 보이는군…", "(회장님께 전화를 건다)", "30년 경영 노하우를 쓰지", "흠, 재밌어지는군"], wait: ["사장은 기다려 주지 않네", "시장은 냉정하네"], late: ["이 판, 사내 전설로 남겠군", "창업 이래 최고의 승부야"], win: ["다시 잼민이부터 올라오게 ㅎㅎ", "사장 자리는 쉽게 안 줘", "내일 아침 9시까지 다시 오게"], lose: ["자네가… 오늘부터 잼사장일세!", "회사를 맡기겠네. 축하하네!", "명예의 전당에 자네 이름을 새기지"] },
  ];
  const ofStrength = s => C.find(c => c.s.includes(s)) || C[4];
  const CHK = { janggi: '장군', chess: '체크', omok: '사목', baduk: '단수', uno: '원카드' }[ID] || '장군';
  let prevLine = '';
  const pickLine = a => { let l, n = 0; do { l = a[(Math.random() * a.length) | 0]; } while (l === prevLine && a.length > 1 && ++n < 6); prevLine = l; return l.replace(/\{chk\}/g, CHK); };
  function strengthNow() {
    const st = G.state(); if (!(st.mode === 'cpu' || st.mode === 'arcade')) return 0;
    if (st.mode === 'arcade') return Math.max(1, Math.min(10, st.stage || 1));
    return st.level > 10 ? st.level - 10 : ({ 1: 2, 2: 5, 3: 9 })[st.level] || 5;
  }
  let cur = null, bubble = null, hideT = 0, lastAt = 0, moves = 0, introAt = 0, introKey = '';
  function say(kind, force) {
    if (!cur || (!force && Date.now() - lastAt < 4500)) return;
    const lines = cur[kind]; if (!lines) return;
    lastAt = Date.now();
    if (!bubble) { bubble = document.createElement('div'); bubble.className = 'tg-bubble'; document.body.appendChild(bubble); }
    bubble.innerHTML = `<span class="ic">${cur.ic}</span><span class="tx"><b>${cur.name}</b></span>`;
    const tx = document.createElement('span'); tx.textContent = pickLine(lines); bubble.querySelector('.tx').appendChild(tx);
    bubble.classList.remove('show'); void bubble.offsetWidth; bubble.classList.add('show');
    clearTimeout(hideT); hideT = setTimeout(() => bubble.classList.remove('show'), 2600);
  }
  function intro() {
    const s = strengthNow(); if (!s) { cur = null; return; }
    const st = G.state(); const key = (st.mode || '') + ':' + s;
    if (key === introKey && Date.now() - introAt < 1200) return;   // start() and the export wrapper both call this
    introAt = Date.now(); introKey = key;
    cur = ofStrength(s); moves = 0;
    Meta.toast(`${cur.ic} 오늘의 상대 · ${cur.name} (${st.mode === 'arcade' ? '승진 ' + s + '단계' : 'CPU ' + s + '단계'})`, 2200);
    setTimeout(() => say('start', true), 900);
  }
  // 승진 도전 calls the game's own start/startStage, not the exported wrapper, so games call this when a CPU or stage game actually begins.
  function onPlay() { setTimeout(intro, 400); }
  // game starts: anything that (re)starts a CPU game
  ['start', 'restart', 'startStage'].forEach(k => {
    const o = G[k]; if (typeof o !== 'function') return;
    G[k] = function () { const r = o.apply(G, arguments); setTimeout(intro, 350); return r; };
  });
  // reactions from sound events
  const wrapS = (k, fn) => { const o = SFX[k]; if (typeof o !== 'function') return; SFX[k] = function () { try { fn(); } catch (e) {} return o.apply(SFX, arguments); }; };
  const actorIsHuman = () => { const st = G.state(); return st.turn === HUMAN; };   // sounds fire before the turn passes
  wrapS('capture', () => { if (!cur) return; say(actorIsHuman() ? 'hurt' : 'hit'); });
  wrapS('check', () => { if (!cur) return; if (!actorIsHuman()) say('check'); });
  let waitT = 0;
  const chatter = () => {
    if (!cur) return; moves++;
    const cpu = !actorIsHuman(); clearTimeout(waitT);
    if (moves === 40 || moves === 80) { setTimeout(() => say('late', true), 600); return; }
    if (moves > 4 && Math.random() < 0.14 && cpu) say('think');
    // CPU just moved → if the player thinks for long, the character pokes them (once per wait)
    if (cpu) waitT = setTimeout(() => { const st = G.state(); if (cur && !st.over && st.turn === HUMAN) say('wait'); }, 16000 + Math.random() * 8000);
  };
  wrapS('place', chatter); wrapS('move', chatter);
  Meta.onEnd(info => {
    clearTimeout(waitT);
    if (!cur || !(info.mode === 'cpu' || info.mode === 'arcade')) { cur = null; return; }
    const c = cur, line = pickLine(info.result === 'win' ? c.lose : info.result === 'lose' ? c.win : c.start);
    lastLine = c.ic + ' “' + line + '”'; say(info.result === 'win' ? 'lose' : 'win', true);
    if (info.mode === 'arcade' && info.result === 'win') {
      const n = C.indexOf(c), nx = C[n + 1];
      setTimeout(() => Meta.toast(nx ? `🎉 ${c.name} 격파! 다음 상대는 ${nx.ic} ${nx.name}` : '👑 잼사장 격파! 이제 이 회사는 당신 겁니다', 3200), 1400);
    }
  });
  let lastLine = '';
  Meta.addResultStat(r => { if (!(r.info.mode === 'cpu' || r.info.mode === 'arcade') || !lastLine) return null; const l = lastLine; lastLine = ''; return l; });
  // 원카드: every CPU seat is a 잼 character (main opponent = this strength, others one or two ranks below)
  if (ID === 'uno' && G.onEvent) {
    const seatChars = () => { const s = strengthNow(), st = G.state(), n = st.players || 2; const out = [null];
      for (let k = 1; k < n; k++) out.push(ofStrength(Math.max(1, s - (k - 1) * 2))); return out; };
    let seats = [];
    const os2 = G.start; G.start = function () { const r = os2.apply(G, arguments); seats = seatChars(); G.setSeatNames(seats.map(c => c && c.name)); return r; };
    const ss2 = G.startStage; if (ss2) G.startStage = function () { const r = ss2.apply(G, arguments); seats = seatChars(); G.setSeatNames(seats.map(c => c && c.name)); return r; };
    const sayAs = (seat, kind) => { const c = seats[seat]; if (!c) return; const keep = cur; cur = c; say(kind); cur = keep; };
    G.onEvent((k, d) => {
      if (!cur) return;
      if (k === 'attack') { if (d.from === 0 && d.to) sayAs(d.to, 'hurt'); else if (d.to === 0 && d.from) sayAs(d.from, 'hit'); }
      else if (k === 'onecard') sayAs(d.seat, 'check');
      else if (k === 'caught') sayAs(d.seats[0], 'hurt');
      else if (k === 'caughtMe') sayAs(d.seat, 'hit');
      else if (k === 'took') { if (d.seat) sayAs(d.seat, 'hurt'); else say('hit'); }
      else if (k === 'swap') { if (d.from === 0 && d.to) sayAs(d.to, 'hurt'); else if (d.to === 0 && d.from) sayAs(d.from, 'hit'); }
    });
  }
  // hide when leaving the board
  const os = G.openSetup; G.openSetup = function () { cur = null; clearTimeout(waitT); if (bubble) bubble.classList.remove('show'); return os.apply(G, arguments); };
  // stage grids (단계 대결): each cell shows its 잼 character instead of a bare number
  function decorate(cell) {
    if (cell.dataset.tgCh) return;
    const bn = cell.querySelector('b'); const n = parseInt((bn || cell).textContent.replace(/[^0-9]/g, ''), 10); if (!(n >= 1 && n <= 10)) return;
    const c = ofStrength(n); cell.dataset.tgCh = '1'; cell.classList.add('tg-ch');
    const sm = cell.querySelector('small'); const rec = sm ? sm.outerHTML : '';
    const star = /⭐/.test(cell.textContent) && !cell.classList.contains('scell') ? '<em>⭐</em>' : '';
    cell.innerHTML = `${star}<i>${c.ic}</i><b>${c.name}</b>${rec}`; cell.title = c.tag;
  }
  const scan = root => (root.querySelectorAll ? root.querySelectorAll('.scell,.stage-cell,.stagebtn') : []).forEach(decorate);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType !== 1) return; if (n.matches && n.matches('.scell,.stage-cell,.stagebtn')) decorate(n); else scan(n); })))
    .observe(document.body, { childList: true, subtree: true });
  scan(document);
  // 스테이지 카드 = 잼민이부터 잼사장까지 승진 도전
  document.querySelectorAll('.card h3, .mcard h3, [class*=card] h3').forEach(h => {
    if (!['스테이지', '스테이지 모드', '아케이드'].includes(h.textContent.trim())) return; h.textContent = '승진 도전';
    const sm = h.parentNode.querySelector('small'); if (sm) sm.textContent = '잼민이부터 잼사장까지';
  });
  return { list: C, ofStrength, strength: strengthNow, current: () => cur, onPlay };
})();

window.Characters = Characters;
