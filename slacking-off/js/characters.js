/* ===== 잼 회사 캐릭터 — kaltoe-boardgame/js/characters.js 의 인물·말투를 이 게임용으로 각색 =====
   잼부장(순찰) · 잼사장(최종 보스) · 잼대리(딴짓 유혹) · 잼인턴(동기).
   각 상황(kind)마다 대사 풀을 두고, 같은 대사가 연속으로 나오지 않게 뽑는다. */
var CAST = {
  jambujang: {
    name: '잼부장', emoji: '👨‍💼', color: '#ffd24a',
    lines: {
      calm: ['흠… 보고서는 언제쯤 올라오나', '오늘도 야근각인가…', '커피 한 잔 하고 와야겠군', '자리 비우면 안 되네', '이 시간에 누가 남아 있나'],
      approach: ['어? 아직 안 가고 뭐 하지', '김인턴 자리인가…', '잠깐만 좀 보자', '뭐 하나 열심히 하는데?'],
      pass: ['음, 열심히 하는군', '역시 신입은 다르네', '계속 그렇게 해', '좋아, 그 자세야'],
      turn: ['어? 뭐야, 아직 안 갔네?', '잠깐, 방금 화면 뭐였지', '히히, 한 번 더 보자'],
      caught: '김인턴… 지금 그게 뭐야?!',
      excuse: ['변명해 봐. 3초 준다.', '자, 3초. 시작.', '말해 봐. 그게 뭐야.'],
      overtime: '이 시간까지 뭐 하고 있었나? 야근 특근 잡아.',
      clear: '…칼퇴? 나 때는 말이야…',
      suspicion: '계속 타이핑만 하네… 수상한데?',
      coffee: ['커피 한 잔 하고 올까…', '잠깐 탕비실 좀 다녀오지', '담배… 아니 커피다'],
      behind: ['…뭐 하고 있나', '뒤에서 한참 봤네', '김인턴, 등 뒤가 편한가?']
    }
  },
  jamsajang: {
    name: '잼사장', emoji: '🕴️', color: '#9a8bff',
    lines: {
      calm: ['이 회사의 주인은 나야', '큰 그림을 봐야지', '사장은 기다려 주지 않네'],
      approach: ['여기서 뭐 하나…', '직원 복지 좀 보러 왔네', '내 눈은 못 속이네'],
      pass: ['…성실하군. 좋아.', '사장은 괜히 사장이 아니야', '계속 일하게'],
      turn: ['어? 방금 뭘 봤지?', '사장의 눈은 두 개일세'],
      caught: '여기서 딴짓을 하나… 결재는 어디 있나?',
      excuse: ['3초 드리지. 변명해 보게.', '사장 앞에서 변명해 보나.', '자네, 3초 드리겠네.'],
      overtime: '야근은 성장의 상징이지. 자네 오늘 성장했네.',
      clear: '…이 정도면 사장 자리를 줘도 되겠군',
      suspicion: '일만 하면 의심스럽지. 뭐 숨기나?',
      coffee: ['잠깐 커피 좀 마시고 오지', '탕비실 다녀오겠네', '사장도 커피는 마셔야지'],
      behind: ['…뒤에서 보니 잘 보이는군', '사장은 소리 없이 온다네', '등 뒤에 사장이 있네']
    }
  },
  jamdaeri: {
    name: '잼대리', emoji: '🧑‍💻', color: '#69d8ff',
    lines: {
      tempt: ['부장님 화장실 갔어 ㅋㅋ 지금이 기회야', '이거 눌러봐, 개웃김 ㅋㅋ', '핫딜 떴어! 이거 진짜 싸', '부장님 오늘 조기 퇴근한대 (아마도)'],
      temptTaken: ['ㅋㅋㅋㅋ 봐라, 딴짓하는 거', '그거 눌렀으면 이제 끝 ㅋ', '맛있게 먹어~'],
      temptIgnored: ['어? 참네 ㅋㅋ', '진짜 프로구나…', '눈 질끈 감았네'],
      warn: ['어? 발소리 나는데', '부장님 돌아오는 듯?!', '야야, 뭐 좀 와'],
      calm: ['이거 진짜 웃긴데…', '점심 뭐 먹지', '오늘 금요일이야?', '(몰래 채용공고 보는 중)'],
      chat: ['ㅋㅋㅋ 이거 봐', '부장님 커피 타러 감! 지금이야', '점심 뭐 먹지', '오늘 칼퇴 가능?'],
      shortform: ['이거 3초만 보려다…', '다음 영상이 안 멈춘다', '이거 웃긴데 ㅋㅋ']
    }
  },
  jamintern: {
    name: '잼인턴', emoji: '🧑‍🎓', color: '#ffb3c8',
    lines: {
      calm: ['선배님도 야근이에요?', '저는 첫 회사라서요…', '6시에 진짜 갈 수 있는 거예요?'],
      caught: '선배님… 그거 딴짓이죠?',
      clear: '우와, 진짜 칼퇴했어요?!'
    }
  }
};

var Bubble = (function () {
  'use strict';
  var el = null, whoEl = null, txEl = null, hideT = 0, last = '';
  var CALM_AT = 0;

  function init() {
    el = document.getElementById('bubble');
    whoEl = document.getElementById('bubWho');
    txEl = document.getElementById('bubText');
  }
  function pick(arr) {
    if (!arr || !arr.length) return '';
    var l = arr[(Math.random() * arr.length) | 0], n = 0;
    while (l === last && arr.length > 1 && n++ < 6) l = arr[(Math.random() * arr.length) | 0];
    last = l;
    return l;
  }
  function say(key, kind, holdMs) {
    var c = CAST[key]; if (!c) return '';
    var pool = c.lines[kind]; if (!pool) return '';
    var line = Array.isArray(pool) ? pick(pool) : pool;
    show(c.name, line, c.color, holdMs);
    return line;
  }
  function show(name, text, color, holdMs) {
    if (!el) init();
    if (!el) return;
    whoEl.textContent = name;
    whoEl.style.color = color || '#ffd24a';
    txEl.textContent = text;
    el.hidden = false;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    clearTimeout(hideT);
    hideT = setTimeout(hide, holdMs || 2600);
  }
  function hide() { if (el) el.hidden = true; }
  function restartCalm() { CALM_AT = 0; }

  return { say: say, show: show, hide: hide, cast: CAST };
})();
