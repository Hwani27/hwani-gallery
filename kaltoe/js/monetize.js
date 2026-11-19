/* ===== 수익화 레이어 =====
   - 힌트 하루 3개 · AI 복기 하루 2번 무료 → 더 쓰려면 보상형 광고(또는 광고 제거 구매)
   - 광고 제거(1회 결제): 전면·배너 없음 + 힌트·복기 무제한
   - 배너: 모드 화면이 열려 있는 동안만, 토스가 배너를 지원할 때만
   - 이벤트 로그, 좋은 순간의 리뷰 요청, 다른 게임 교차 홍보
   Config comes from the build → window.REWARD_AD_GROUP_ID / BANNER_AD_GROUP_ID / NOADS_SKU. */
const Monetize = (function () {
  // Phase 1 is ads only. Flip this to true to show 광고 제거 purchase UI again (needs NOADS_SKU).
  const ENABLE_IAP = false;
  const ID = window.GAME_ID, T = () => window.Toss || null;
  const G = { omok: () => Omok, janggi: () => Janggi, baduk: () => Baduk, chess: () => ChessApp, uno: () => Uno }[ID]();
  const SKU = (ENABLE_IAP && window.NOADS_SKU) || '', REWARD_ID = window.REWARD_AD_GROUP_ID || '';
  { const t = T(); if (REWARD_ID && t && t.setRewardedGroup) t.setRewardedGroup(REWARD_ID); }
  const FREE = { hint: 3, review: 2 }, BONUS = { hint: 3, review: 1 }, LABEL = { hint: '힌트', review: 'AI 복기' };
  const COST = { hint: 30, review: 50 };   // 🪙 per use once the free ones are gone
  const OTHER = [['omok', '⚫', '오목'], ['janggi', '將', '장기'], ['baduk', '◍', '바둑'], ['chess', '♛', '체스']].filter(g => g[0] !== ID);
  let m = null;
  const today = () => Meta.kstKey(0);
  function state() {
    const d = Meta.data; if (!d) return null;
    if (!d.money) d.money = { noAds: false, day: '', used: {}, bonus: {}, reviewAskedAt: 0, wins: 0 };
    m = d.money; if (m.day !== today()) { m.day = today(); m.used = {}; m.bonus = {}; }
    return m;
  }
  const noAds = () => !!(state() && state().noAds);
  const left = k => { const s = state(); return noAds() ? Infinity : FREE[k] + (s.bonus[k] || 0) - (s.used[k] || 0); };
  const log = (n, p) => { const t = T(); if (t) t.log(n, Object.assign({ game: ID }, p || {})); };

  // rewarded ad → true when earned. Before the ad group is set up in the console, grant for free.
  async function reward(what) {
    const t = T(); if (!t) return true;
    if (!REWARD_ID && t.inToss) return true;
    const r = await t.showRewarded();
    log('reward_ad', { what, earned: !!r });
    if (!r) Meta.toast('광고를 끝까지 보면 받을 수 있어요'); else if (SFX.reward) setTimeout(() => SFX.reward(), 300);
    return !!r;
  }
  // gate a limited feature; resolves true when it may run now (and consumes one)
  async function gate(k) {
    const s = state(); if (!s) return true;
    if (k === 'hint' && Meta.data.finished < 1) return true;          // first game: unlimited hints
    if (left(k) > 0) { s.used[k] = (s.used[k] || 0) + 1; Meta.save(); return true; }
    return new Promise(resolve => {
      const acts = [{ label: '🎬 광고 보고 ' + LABEL[k] + ' ' + BONUS[k] + '개 더 받기', fn: async () => { if (await reward(k)) { s.bonus[k] = (s.bonus[k] || 0) + BONUS[k]; s.used[k] = (s.used[k] || 0) + 1; Meta.save(); resolve(true); } else resolve(false); } }];
      acts.unshift({ label: '🪙 ' + COST[k] + '코인으로 ' + LABEL[k] + ' 1번 (보유 ' + Meta.data.points.toLocaleString() + ')', fn: () => { if (Meta.spend(COST[k], k)) { s.used[k] = (s.used[k] || 0) + 1; Meta.save(); resolve(true); } else resolve(false); } });
      if (ENABLE_IAP && SKU) acts.push({ label: '✨ 광고 제거하고 무제한으로', fn: () => { shop(); resolve(false); } });
      acts.push({ label: '닫기', fn: () => resolve(false) });
      Meta.modal({ icon: k === 'hint' ? '💡' : '🔍', kicker: '오늘 무료 ' + LABEL[k] + ' ' + FREE[k] + '개를 다 썼어요', title: LABEL[k] + ' 더 쓰기', sub: '내일 다시 ' + FREE[k] + '개가 채워져요.', actions: acts });
    });
  }

  // ---- 광고 제거 ----
  let refreshBanner = () => {};
  async function grantNoAds() { const s = state(); s.noAds = true; Meta.save(); Meta.renderHub(); refreshBanner(); log('purchase', { sku: SKU }); }
  function shop() {
    if (!ENABLE_IAP || !SKU) return;
    if (noAds()) { Meta.toast('이미 광고 없이 쓰고 있어요 ✨'); return; }
    Meta.modal({
      icon: '✨', kicker: Meta.NAME + ' 프리미엄', title: '광고 제거', sub: '한 번 구매로 계속 적용돼요.\n· 게임 사이 광고 없음\n· 모드 화면 배너 없음\n· 힌트·AI 복기 무제한',
      actions: [{ label: '토스로 결제하기', fn: async () => {
        const t = T(); const r = t ? await t.buy(SKU, grantNoAds) : 'unsupported';
        if (r === 'ok') Meta.toast('감사합니다! 광고가 사라졌어요 ✨'); else if (r === 'unsupported') Meta.toast('토스 앱에서 구매할 수 있어요'); else Meta.toast('결제가 완료되지 않았어요');
      } }, { label: '닫기' }],
    });
  }

  // ---- 리뷰 요청: 기분 좋은 순간에만, 30일에 한 번 ----
  function maybeAskReview(reason) {
    const s = state(); if (!s || Date.now() - (s.reviewAskedAt || 0) < 30 * 864e5) return;
    s.reviewAskedAt = Date.now(); Meta.save(); log('review_ask', { reason });
    setTimeout(() => { const t = T(); if (t) t.askReview(); }, 1800);
  }

  // ---- 다른 게임 (교차 홍보) ----
  function openOther(id) {
    log('cross_promo', { to: id });
    const t = T(); if (t && t.open('intoss://' + id)) return;
    location.href = '../' + id + '/index.html';          // test site: sibling folders
  }

  function wrapHint() {
    const orig = G.hint; if (typeof orig !== 'function') return;
    G.hint = async function () {
      const st = G.state(); if (st.mode === 'puzzle' || st.over) return orig.apply(G, arguments);
      if (!(await gate('hint'))) return;
      log('hint', { mode: st.mode }); if (SFX.hint) SFX.hint(); return orig.apply(G, arguments);
    };
  }

  Meta.addHubPart({
    act: 'other',
    html: () => window.APP_MODE ? (ENABLE_IAP && SKU && !noAds() ? '<div class="tg-other"><button type="button" class="ad" data-act="shop">✨ 광고 제거</button></div>' : '') : `<div class="tg-other"><span>다른 게임</span>${OTHER.map(g => `<button type="button" data-act="other" data-g="${g[0]}"><i>${g[1]}</i>${g[2]}</button>`).join('')}${ENABLE_IAP && SKU && !noAds() ? '<button type="button" class="ad" data-act="shop">✨ 광고 제거</button>' : ''}</div>`,
    click: b => openOther(b.dataset.g),
  });
  Meta.addHubPart({ act: 'shop', html: () => '', click: shop });
  Meta.onEnd(info => {
    log('game_end', { mode: info.mode, level: info.level || 0, result: info.result, plies: info.plies || 0 });
    const s = state(); if (!s) return;
    if (info.result === 'win' && (info.mode === 'cpu' || info.mode === 'arcade')) { s.wins = (s.wins || 0) + 1; Meta.save(); if (s.wins === 3 || s.wins === 15) maybeAskReview('wins'); }
  });

  // ---- 🪙 코인 쓰는 곳 ----
  function coinSheet() {
    const s = state(); const box = document.createElement('div');
    const row = (ic, t, sub, price, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tg-row';
      b.innerHTML = `<span class="tg-sw tg-ic">${ic}</span><span class="t"><b>${t}</b><small>${sub}</small></span><span class="tg-pill">${price}</span>`; b.onclick = fn; box.appendChild(b); };
    box.insertAdjacentHTML('beforeend', `<p class="tg-note">보유 🪙 <b>${Meta.data.points.toLocaleString()}</b> 코인 · 출석, 승리, 오늘의 문제, 퍼즐 러시, 행운 상자로 모여요</p>`);
    row('💡', '힌트 3개', '오늘 남은 무료 힌트 ' + Math.max(0, left('hint')) + '개', '🪙 80', () => { if (Meta.spend(80, 'hint_pack')) { s.bonus.hint = (s.bonus.hint || 0) + 3; Meta.save(); Meta.toast('💡 오늘 힌트 +3'); Meta.closeSheet(); } });
    row('🔍', 'AI 복기 1번', '오늘 남은 무료 복기 ' + Math.max(0, left('review')) + '번', '🪙 ' + COST.review, () => { if (Meta.spend(COST.review, 'review_pack')) { s.bonus.review = (s.bonus.review || 0) + 1; Meta.save(); Meta.toast('🔍 오늘 AI 복기 +1'); Meta.closeSheet(); } });
    if (ID !== 'chess' && ID !== 'uno' && window.Progress && Progress.themeSheet) row('🎨', '판·돌 테마', '황금 카야 · 흑단 · 비취 · 왕실', '보기', () => { Meta.closeSheet(); setTimeout(Progress.themeSheet, 250); });
    row('⚡', '퍼즐 러시 이어하기', '목숨이 다 떨어졌을 때 ❤️ +1', '🪙 50', () => Meta.toast('퍼즐 러시가 끝나는 화면에서 쓸 수 있어요'));
    Meta.sheet('🪙 코인 쓰기', box);
  }
  Meta.addHubPart({ act: 'coins', html: () => '', click: coinSheet });

  // One banner at the bottom of the mode screen. Torn down while a game is open so it never covers the board.
  function mountHubBanner() {
    const id = window.BANNER_AD_GROUP_ID || '';
    const t = T();
    if (!id || !t || !t.inToss || !t.syncBanner) return null;
    const setup = document.getElementById(ID === 'chess' ? 'setup' : ID + 'Setup');
    if (!setup) return null;
    let slot = document.getElementById('tgBanner');
    if (!slot) {
      slot = document.createElement('div');
      slot.id = 'tgBanner';
      slot.className = 'tg-banner';
      setup.appendChild(slot);
    }
    const apply = () => {
      const hidden = setup.classList.contains('hidden') || setup.style.display === 'none';
      t.syncBanner(id, slot, !hidden && !noAds());
    };
    apply();
    if (!slot.dataset.watch) {
      slot.dataset.watch = '1';
      new MutationObserver(apply).observe(setup, { attributes: true, attributeFilter: ['class', 'style'] });
    }
    return apply;
  }
  window.MonetizeGate = gate;
  const ready = Meta.init(G).then(async () => {
    state(); wrapHint();
    const t = T(); if (!t) return;
    if (t.setRewardedGroup) t.setRewardedGroup(REWARD_ID || null);
    if (ENABLE_IAP && SKU) {
      await t.restorePending({ [SKU]: grantNoAds });
      const own = await t.owned(SKU); if (own === true && !noAds()) grantNoAds(); if (own === false && noAds()) { state().noAds = false; Meta.save(); }
    }
    refreshBanner = mountHubBanner() || (() => {});
    refreshBanner();
    Meta.renderHub();
  });
  return { COST, coinSheet, ready, gate, reward, noAds, shop, maybeAskReview, log, left };
})();

window.Monetize = Monetize;
