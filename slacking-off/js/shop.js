/* ===== 부장님 몰래 딴짓하기 — ② 직급 승진 & 사무실 장비 상점 =====
   판이 끝날 때마다 점수에 비례한 '월급 루팡 코인(₩)'을 받고,
   누적 클리어·누적 코인으로 인턴 → 사원 → 대리 → 과장 → 차장 → 부장으로 승진한다.
   코인으로 사무실 장비를 사면 게임 수치(게이지·척도·경고·감소)에 바로 반영된다.
   진행 상황은 localStorage 에 저장한다. */
var SHOP = (function () {
  'use strict';

  var KEY = 'slackOff.progress.v1';
  var MAXLV = 3;

  var RANKS = [
    { id: 'intern', name: '인턴', emoji: '🐣', clears: 0, coins: 0 },
    { id: 'staff', name: '사원', emoji: '🧑‍💼', clears: 1, coins: 80 },
    { id: 'daeri', name: '대리', emoji: '🧑‍💻', clears: 4, coins: 320 },
    { id: 'gwajang', name: '과장', emoji: '👔', clears: 8, coins: 760 },
    { id: 'chajang', name: '차장', emoji: '🎩', clears: 12, coins: 1300 },
    { id: 'bujang', name: '부장', emoji: '👑', clears: 17, coins: 1900 }
  ];

  var ITEMS = [
    { id: 'kbd', icon: '⌨️', name: '기계식 키보드', desc: '위장 업무 척도 상승 +15%',
      costs: [120, 300, 560], hint: '타자 소리로 위장 게이지가 더 빨리 찬다' },
    { id: 'monitor', icon: '🖥️', name: '듀얼 모니터', desc: '딴짓 게이지 상승량 +20%',
      costs: [150, 340, 620], hint: '한 번 터치에 딴짓 게이지가 더 오른다' },
    { id: 'glasses', icon: '🕶️', name: '눈치 안경', desc: '상사 접근 경고 여유 +0.18초',
      costs: [110, 260, 480], hint: '경고 시간이 길어져 위장할 틈이 생긴다' },
    { id: 'mug', icon: '☕', name: '아메리카노 텀블러', desc: '위장 중 게이지 감소 -40%',
      costs: [90, 220, 420], hint: '일하는 척하는 동안 게이지가 덜 식는다' }
  ];

  var D = { coins: 0, totalCoins: 0, clears: 0, plays: 0, best: 0, up: {} };

  function fresh() {
    var o = { coins: 0, totalCoins: 0, clears: 0, plays: 0, best: 0, up: {} };
    for (var i = 0; i < ITEMS.length; i++) o.up[ITEMS[i].id] = 0;
    return o;
  }

  function num(v, d) {
    v = Number(v);
    return isFinite(v) && v >= 0 ? Math.floor(v) : d;
  }

  function load() {
    var o = fresh();
    try {
      var raw = window.localStorage ? window.localStorage.getItem(KEY) : null;
      if (raw) {
        var p = JSON.parse(raw) || {};
        o.coins = num(p.coins, 0);
        o.totalCoins = Math.max(num(p.totalCoins, 0), o.coins);
        o.clears = num(p.clears, 0);
        o.plays = num(p.plays, 0);
        o.best = num(p.best, 0);
        if (p.up) {
          for (var i = 0; i < ITEMS.length; i++) {
            var k = ITEMS[i].id;
            o.up[k] = Math.min(MAXLV, num(p.up[k], 0));
          }
        }
      }
    } catch (e) {}
    return o;
  }

  function save() {
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, JSON.stringify(D));
    } catch (e) {}
  }

  D = load();

  function lv(id) { return D.up[id] || 0; }

  function rankIdx(clears, coins) {
    clears = clears == null ? D.clears : clears;
    coins = coins == null ? D.totalCoins : coins;
    var idx = 0;
    for (var i = 0; i < RANKS.length; i++) {
      if (clears >= RANKS[i].clears && coins >= RANKS[i].coins) idx = i;
    }
    return idx;
  }

  function rank(i) {
    var r = RANKS[i == null ? rankIdx() : i] || RANKS[0];
    return { idx: RANKS.indexOf(r), id: r.id, name: r.name, emoji: r.emoji };
  }

  function nextRank() {
    var i = rankIdx();
    if (i >= RANKS.length - 1) return null;
    var n = RANKS[i + 1];
    return {
      rank: { idx: i + 1, id: n.id, name: n.name, emoji: n.emoji },
      needsClears: Math.max(0, n.clears - D.clears),
      needsCoins: Math.max(0, n.coins - D.totalCoins),
      clears: n.clears, coins: n.coins
    };
  }

  /* ---------- 코인 획득 · 승진 ---------- */
  function coinsFor(st, cleared) {
    var s = Math.max(0, (st && st.score) || 0);
    var base = Math.round(s / 60);
    return Math.min(220, base + (cleared ? 45 : 10));
  }

  function earn(amount, cleared) {
    var before = rankIdx();
    amount = Math.max(0, Math.round(amount || 0));
    D.coins += amount;
    D.totalCoins += amount;
    D.plays += 1;
    if (cleared) D.clears += 1;
    var after = rankIdx();
    save();
    var promoted = after > before ? rank(after) : null;
    return {
      coins: amount, balance: D.coins, totalCoins: D.totalCoins,
      clears: D.clears, rank: rank(after), promoted: promoted
    };
  }

  function noteBest(score) {
    if (score > D.best) { D.best = score; save(); }
  }

  /* ---------- 장비 ---------- */
  function item(id) {
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
    return null;
  }

  function cost(id) {
    var it = item(id);
    if (!it) return null;
    var l = lv(id);
    return l >= MAXLV ? null : it.costs[l];
  }

  function buy(id) {
    var c = cost(id);
    if (c == null) return { ok: false, reason: 'max', level: lv(id) };
    if (D.coins < c) return { ok: false, reason: 'poor', need: c - D.coins, cost: c };
    D.coins -= c;
    D.up[id] = lv(id) + 1;
    save();
    return { ok: true, id: id, level: D.up[id], cost: c, balance: D.coins };
  }

  /* 게임 수치에 곱해지는 보정값 */
  function gainMul() { return 1 + 0.2 * lv('monitor'); }
  function actingMul() { return 1 + 0.15 * lv('kbd'); }
  function warnBonus() { return 0.18 * lv('glasses'); }
  function decayMul() { return Math.max(0.15, 1 - 0.4 * lv('mug')); }

  /* ---------- 상점 모달 ---------- */
  var host = null, closer = null;

  function money(n) { return '₩ ' + Math.round(n || 0).toLocaleString('ko-KR'); }

  function rankBadge() {
    var r = rank();
    return '<span class="rank-badge"><b>' + r.emoji + '</b>' + r.name + '</span>';
  }

  function body() {
    var r = rank(), nx = nextRank();
    var rows = '';
    for (var i = 0; i < ITEMS.length; i++) {
      var it = ITEMS[i], l = lv(it.id), c = cost(it.id);
      var pips = '';
      for (var k = 0; k < MAXLV; k++) pips += '<i class="' + (k < l ? 'on' : '') + '"></i>';
      var btn;
      if (c == null) btn = '<span class="shop-max">MAX</span>';
      else {
        var poor = D.coins < c;
        btn = '<button class="shop-buy' + (poor ? ' poor' : '') + '" type="button" data-buy="' + it.id + '"' +
          (poor ? ' aria-disabled="true"' : '') + '>' + money(c) + '</button>';
      }
      rows += '<div class="shop-row" data-item="' + it.id + '">' +
        '<span class="shop-ic">' + it.icon + '</span>' +
        '<span class="shop-tx"><b>' + it.name + '</b><small>' + it.desc + '</small>' +
        '<span class="shop-pips">' + pips + '<em>Lv.' + l + '</em></span></span>' +
        btn + '</div>';
    }
    var nxt = nx
      ? '다음 승진 <b>' + nx.rank.emoji + ' ' + nx.rank.name + '</b> · 클리어 ' +
        (nx.needsClears ? nx.needsClears + '판' : '✓') + ' · 코인 ' + (nx.needsCoins ? money(nx.needsCoins) : '✓')
      : '최고 직급 <b>👑 부장</b> 달성!';
    return '<div class="shop-wrap">' +
      '<div class="shop-top">' +
        '<span class="shop-title">🛒 사무실 장비 상점</span>' +
        '<span class="shop-wallet">' + money(D.coins) + '</span>' +
      '</div>' +
      '<div class="shop-rank">' + rankBadge() + '<span class="shop-nxt">' + nxt + '</span></div>' +
      '<div class="shop-list">' + rows + '</div>' +
      '<p class="shop-note">장비는 사는 즉시 이번 판부터 적용되고, 자동 저장된다.</p>' +
      '<button class="cta ghost shop-close" id="shopClose" type="button">닫기</button>' +
    '</div>';
  }

  function wire() {
    if (!host) return;
    var close = host.querySelector('#shopClose');
    if (close) close.addEventListener('click', function (e) {
      e.preventDefault();
      var back = SHOP.onClose;
      closeShop();
      if (back) back();
    });
    var buys = host.querySelectorAll('[data-buy]');
    for (var i = 0; i < buys.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          var r = buy(btn.getAttribute('data-buy'));
          if (r.ok && window.SFX) { try { SFX.earn(); } catch (err) {} }
          else if (window.SFX) { try { SFX.tick(); } catch (err) {} }
          render();
          if (SHOP.onChange) SHOP.onChange(r);
        });
      })(buys[i]);
    }
  }

  function render() {
    if (!host) return;
    host.classList.add('shop');
    host.innerHTML = body();
    host.hidden = false;
    wire();
  }

  function openShop(el, onChange) {
    host = el;
    SHOP.onChange = onChange || null;
    render();
    return status();
  }

  function closeShop() {
    if (!host) return;
    host.classList.remove('shop');
    host.innerHTML = '';
    host.hidden = true;
    host = null;
  }

  function isOpen() { return !!host; }

  /* ---------- 저장 초기화 (테스트·되돌리기) ---------- */
  function reset() {
    D = fresh();
    save();
    if (host) render();
    return status();
  }

  function status() {
    var nx = nextRank();
    return {
      coins: D.coins, totalCoins: D.totalCoins, clears: D.clears, plays: D.plays, best: D.best,
      rank: rank(), next: nx ? nx.rank : null,
      needs: nx ? { clears: nx.needsClears, coins: nx.needsCoins } : null,
      up: { kbd: lv('kbd'), monitor: lv('monitor'), glasses: lv('glasses'), mug: lv('mug') },
      muls: { gain: +gainMul().toFixed(3), acting: +actingMul().toFixed(3), warn: +warnBonus().toFixed(3), decay: +decayMul().toFixed(3) },
      open: isOpen(), key: KEY
    };
  }

  return {
    RANKS: RANKS, ITEMS: ITEMS, MAXLV: MAXLV,
    coinsFor: coinsFor, earn: earn, noteBest: noteBest, buy: buy, cost: cost, item: item,
    rank: rank, nextRank: nextRank, balance: function () { return D.coins; },
    gainMul: gainMul, actingMul: actingMul, warnBonus: warnBonus, decayMul: decayMul,
    open: openShop, close: closeShop, isOpen: isOpen, render: render, reset: reset,
    money: money, rankBadge: rankBadge, status: status
  };
})();
