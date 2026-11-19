/* ===== Meta layer — what makes people come back: points, CPU win streaks, daily challenge,
   Toss leaderboard, sharing, interstitial ads between games, Toss back button.
   Game-agnostic: each game passes its object (Omok / Janggi / Baduk) to Meta.init(). ===== */
const Meta = (function () {
  const ID = window.GAME_ID;
  const NAME = { omok: '오목', janggi: '장기', baduk: '바둑', chess: '체스', uno: '원카드' }[ID] || ID;
  const setupEl = () => document.getElementById(ID === 'chess' ? 'setup' : ID + 'Setup');
  const isHidden = el => !el || el.classList.contains('hidden') || el.style.display === 'none';
  const LV0 = { 1: '쉬움', 2: '보통', 3: '어려움' };
  const LV = new Proxy(LV0, { get: (o, k) => (+k > 10 ? 'CPU ' + (k - 10) + '단계' : o[k]) });
  const KEY = 'meta';
  let G = null, d = null, daily = null; const endListeners = [], hubParts = [], resultBtns = [], resultStatFns = [];
  const T = () => window.Toss || null;

  const blank = () => ({ points: 0, finished: 0, sinceAd: 0, cpu: { streak: {}, best: {}, wins: {} }, stageFirst: {}, daily: { last: '', streak: 0, best: 0, total: 0 }, practice: { idx: 0, solved: 0 } });
  async function load() { const v = await Store.get(ID + '_' + KEY); d = Object.assign(blank(), v || {}); d.cpu = Object.assign(blank().cpu, d.cpu || {}); d.daily = Object.assign(blank().daily, d.daily || {}); d.practice = Object.assign(blank().practice, d.practice || {}); await loadWallet(); }
  // 합본 앱(APP_MODE): 코인·출석·초대는 모든 게임이 같은 지갑을 쓴다; 게임별 레이팅은 홈 화면과 종합 순위표용
  const APP = !!window.APP_MODE; let wallet = null;
  async function loadWallet() { if (!APP) return; wallet = (await Store.get('app_wallet')) || { points: 0, growth: null, games: {} };
    d.points = wallet.points || 0; if (wallet.growth) d.growth = wallet.growth; }
  function saveWallet() { if (!APP || !wallet) return; wallet.points = d.points; wallet.growth = d.growth || wallet.growth; wallet.last = ID;
    const pr = d.prog; wallet.games = wallet.games || {};
    if (pr) wallet.games[ID] = { r: pr.r, best: pr.best, games: pr.games, rank: window.Progress && Progress.rankOf ? Progress.rankOf(pr.r).name : '' };
    Store.set('app_wallet', wallet); }
  // 종합 점수 = 플레이한 게임들의 레이팅 합 (여러 게임을 할수록 올라간다)
  function totalScore() { if (!APP || !wallet) return null; saveWallet(); return Object.values(wallet.games || {}).filter(g => g.games > 0).reduce((a, g) => a + g.r, 0); }
  const save = () => { Store.set(ID + '_' + KEY, d); saveWallet(); };

  // ---- dates in Korea time (the daily puzzle flips at midnight KST for everyone) ----
  function kstKey(offsetDays) { const t = new Date(Date.now() + 9 * 3600e3 + (offsetDays || 0) * 864e5); return t.toISOString().slice(0, 10); }
  function dayNumber() { return Math.floor((Date.now() + 9 * 3600e3) / 864e5); }

  // ---- points / leaderboard ----
  function addPoints(n) { if (!n) return; if (n > 0 && typeof window.COIN_MULT === 'function') n = Math.round(n * (window.COIN_MULT() || 1)); d.points += n; save(); const t = T(); if (t && !window.Progress) t.submitScore(d.points); }
  // 🪙 코인: the points balance is a currency spent on hints, themes, continues
  function spend(n, what) {
    if (d.points < n) { toast('🪙 코인이 부족해요 (보유 ' + d.points.toLocaleString() + ')'); return false; }
    d.points -= n; save(); renderHub(); if (typeof SFX !== 'undefined' && SFX.pop) SFX.pop();
    const t = T(); if (t) t.log('coin_spend', { game: ID, what: what || '', n }); return true;
  }

  // ---- toast ----
  let toastEl = null, toastT = 0;
  function toast(msg, ms) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'tg-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), ms || 2200);
  }

  // ---- 단계별 메뉴 열기: 처음엔 '바로 한 판'과 '오늘의 문제'만, 판을 둘수록 하나씩 열린다 ----
  const UNLOCK = [   // [필요 횟수(대국+문제), 열리는 것들, 이름]
    [1, ['attend', 'stats', 'chest'], '출석 체크 · 코인'],
    [2, ['card:arcade', 'overtime'], '승진 도전 · 오늘의 특근'],
    [3, ['rush', 'card:pvp'], ID === 'uno' ? '인원·난이도 설정' : '퍼즐 러시'],
    [5, ['friend', 'invite'], ID === 'uno' ? '친구 초대' : '친구 대국'],
    [7, ['other'], '다른 게임'],
  ].filter(u => !(window.APP_MODE && u[1][0] === 'other'));
  const GATED = {}; UNLOCK.forEach(([n, acts]) => acts.forEach(a => { GATED[a] = n; }));
  const progressN = () => (d.finished || 0) + (d.daily.total || 0) + (d.practice.solved || 0);
  const isOpen = a => !(a in GATED) || progressN() >= GATED[a] || !!(d.unlocked && d.unlocked[a]);
  function unlock(a) { d.unlocked = d.unlocked || {}; if (!d.unlocked[a]) { d.unlocked[a] = 1; save(); renderHub(); } }
  let fresh = {};
  function checkUnlocks(before) {
    const now = progressN(); const got = UNLOCK.filter(([n]) => before < n && now >= n);
    if (!got.length) return;
    got.forEach(([, acts]) => acts.forEach(a => { fresh[a] = 1; }));
    setTimeout(() => { toast('🔓 새 메뉴가 열렸어요 · ' + got.map(g => g[2]).join(', '), 3200); if (typeof SFX !== 'undefined' && SFX.levelup) SFX.levelup(); }, 1600);
  }
  function nextLock() { const n = progressN(); return UNLOCK.find(([k]) => n < k); }
  const MODE_CARDS = { arcade: ['승진 도전', '스테이지', '스테이지 모드', '아케이드'], pvp: ['사람 vs 사람'] };
  function gateModeCards(setup) {
    setup.querySelectorAll('[data-unlock]').forEach(e => { e.style.display = isOpen(e.dataset.unlock) ? '' : 'none'; });
    setup.querySelectorAll('h3').forEach(h => {
      const t = h.textContent.trim(); const k = Object.keys(MODE_CARDS).find(k => MODE_CARDS[k].includes(t)); if (!k) return;
      const card = h.closest('.card, .mcard, [class*=card]') || h.parentNode;
      card.style.display = isOpen('card:' + k) ? '' : 'none';
      card.classList.toggle('tg-new', !!fresh['card:' + k]);
    });
  }

  // ---- results from the game (called by the game's onEnd hook) ----
  let lastResult = null;
  function onGameEnd(info) {
    const pBefore = progressN(); d.finished++; d.sinceAd++;
    let gained = 0, extra = [];
    if (info.mode === 'cpu') {
      const lv = info.level, s = d.cpu.streak;
      if (info.result === 'win') {
        s[lv] = (s[lv] || 0) + 1; d.cpu.wins[lv] = (d.cpu.wins[lv] || 0) + 1;
        if (s[lv] > (d.cpu.best[lv] || 0)) { d.cpu.best[lv] = s[lv]; if (s[lv] >= 2) extra.push('최고 기록'); }
        gained = (lv > 10 ? Math.max(1, Math.round((lv - 10) * 0.9)) : ({ 1: 1, 2: 3, 3: 8 }[lv] || 1)) + Math.floor(s[lv] / 3);
      } else if (info.result === 'lose') s[lv] = 0;
    } else if (info.mode === 'arcade' && info.result === 'win' && !d.stageFirst[info.stage]) {
      d.stageFirst[info.stage] = 1; gained = 2 * info.stage;
    }
    checkUnlocks(pBefore);
    lastResult = { info, gained, extra };
    save(); addPoints(gained); renderHub();
    endListeners.forEach(f => { try { f(info); } catch (e) { console.error(e); } });
    if (window.Haptics) Haptics.fire(info.result === 'win' ? 'success' : 'basicMedium');
    else { const t = T(); if (t) t.haptic(info.result === 'win' ? 'success' : 'basicMedium'); }
    if (window.Resume) { try { Resume.clear(); } catch (e) {} }   // 끝난 대국은 이어두지 않는다
  }
  // chips on the result card
  function resultStats(g, kind) {
    const r = lastResult; if (!r) return [];
    const out = [];
    if (r.info.mode === 'cpu') { const s = d.cpu.streak[r.info.level] || 0; if (s >= 1) out.push('🔥 ' + LV[r.info.level] + ' ' + s + '연승' + (r.extra.length ? ' · 최고!' : '')); }
    if (r.gained) out.push('+' + r.gained + ' 코인');
    resultStatFns.forEach(f => { try { const x = f(r); if (x) out.push(x); } catch (e) {} });
    return out;
  }
  function resultButtons(R, btn) {
    resultBtns.forEach(f => { try { f(R, btn, lastResult); } catch (e) { console.error(e); } });
    const r = lastResult; if (!r || r.info.result !== 'win' || r.info.mode === 'mail') return;
    const s = r.info.mode === 'cpu' ? (d.cpu.streak[r.info.level] || 0) : 0;
    const msg = r.info.mode === 'cpu'
      ? `${NAME} CPU(${LV[r.info.level]})를 ${s > 1 ? s + '연승으로 ' : ''}이겼어요! 나랑 한 판 할래요?`
      : r.info.mode === 'arcade' ? `${NAME} 스테이지 ${r.info.stage} 클리어! 너도 깰 수 있어?` : `${NAME} 한 판 이겼어요!`;
    btn('', 'share', '자랑하기', 'share', () => share(msg));
  }

  async function share(msg) {
    const t = T();
    const path = window.PLATFORM === 'toss' ? 'intoss://' + (window.APP_NAME || ID) : location.href;
    const how = t ? await t.share(msg, path) : false;
    if (how === 'clipboard') toast('복사했어요. 친구에게 붙여넣기 해보세요');
  }

  // ---- interstitial between games (never mid-game, never on the first games) ----
  const AD_EVERY = 3;
  function wrapStart(name) {
    const orig = G[name]; if (typeof orig !== 'function') return;
    G[name] = function () {
      const args = arguments, t = T();
      if (t && d && d.sinceAd >= AD_EVERY && d.finished >= AD_EVERY && !(window.Monetize && Monetize.noAds())) {
        d.sinceAd = 0; save();
        return t.showAd().then(() => orig.apply(G, args));
      }
      return orig.apply(G, args);
    };
  }

  // ---- hub on the mode screen: daily card + stats ----
  function setDaily(cfg) { daily = cfg; renderHub(); }
  function dailyState() {
    const today = kstKey(0), yest = kstKey(-1), x = d.daily;
    const live = x.last === today || x.last === yest ? x.streak : 0;
    return { today, solvedToday: x.last === today, streak: live, best: x.best, total: x.total };
  }
  function markDailySolved(extraPoints) {
    const st = dailyState(); if (st.solvedToday) return { first: false, streak: st.streak };
    const pBefore = progressN();
    const x = d.daily; x.streak = st.streak + 1; x.last = st.today; x.total++; if (x.streak > x.best) x.best = x.streak;
    save(); addPoints((extraPoints || 10) + Math.min(x.streak, 7)); checkUnlocks(pBefore); renderHub();
    return { first: true, streak: x.streak };
  }

  let hub = null;
  function renderHub() {
    if (!d) return;
    const setup = setupEl(); if (!setup) return;
    if (!hub) {
      hub = document.createElement('div'); hub.className = 'tg-hub';
      const modes = setup.querySelector('.modes,#modeCards'); modes.parentNode.insertBefore(hub, modes);
    }
    const st = dailyState();
    const bestStreak = Math.max(0, ...Object.values(d.cpu.best).map(Number));
    let h = '';
    const part = p => { if (!isOpen(p.act)) return ''; let x = ''; try { x = p.html(); } catch (e) {} return fresh[p.act] && x ? x.replace(/class="/, 'class="tg-new ') : x; };
    hubParts.filter(p => p.top).forEach(p => { h += part(p); });
    if (daily) {
      h += `<button type="button" class="tg-daily${st.solvedToday ? ' done' : ''}" data-act="daily">
        <span class="tg-d-ic">${st.solvedToday ? '✓' : (daily.icon || '🧩')}</span>
        <span class="tg-d-t"><b>${daily.title || '오늘의 문제'}</b><small>${st.solvedToday ? (daily.doneSub || '오늘 완료') : daily.sub()}</small></span>
        <span class="tg-d-st">${st.streak ? '🔥 ' + st.streak + '일' : '시작'}</span></button>`;
    }
    hubParts.filter(p => !p.top).forEach(p => { h += part(p); });
    const nl = nextLock(); if (nl) h += `<div class="tg-lock">🔒 <b>${nl[2]}</b> · ${nl[0] - progressN()}판 더 두면 열려요</div>`;
    if (isOpen('stats')) h += `<div class="tg-stats"><button type="button" class="tg-coin" data-act="coins">🪙 <b>${d.points.toLocaleString()}</b> 코인</button>${bestStreak ? `<span>🔥 최고 ${bestStreak}연승</span>` : ''}<button type="button" data-act="rank">🏆 순위</button><button type="button" data-act="code">⌨️ 코드 입력</button></div>`;
    hub.innerHTML = h; gateModeCards(setup);
    hub.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
      const a = b.dataset.act; if (fresh[a]) { delete fresh[a]; }
      hubParts.forEach(p => { if (p.act === a) p.click(b); });
      if (a === 'daily' && daily) daily.open(st.solvedToday);
      if (a === 'rank') { const t = T(); if (t) t.openLeaderboard().then(ok => { if (!ok) toast('순위는 토스 앱에서 볼 수 있어요'); }); }
    });
  }

  // ---- generic modal (puzzle results etc.) ----
  function modal({ icon, kicker, title, sub, chips, actions }) {
    let m = document.getElementById('tgModal');
    if (!m) { m = document.createElement('div'); m.id = 'tgModal'; m.className = 'tg-modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="tg-card"><div class="tg-emb">${icon}</div><div class="tg-k">${kicker || ''}</div><div class="tg-t"></div><div class="tg-s"></div>
      <div class="tg-chips">${(chips || []).map(c => `<span>${c}</span>`).join('')}</div><div class="tg-acts"></div></div>`;
    m.querySelector('.tg-t').textContent = title; m.querySelector('.tg-s').textContent = sub || '';
    const A = m.querySelector('.tg-acts');
    (actions || []).forEach((a, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = i === 0 ? 'pri' : ''; b.textContent = a.label; b.onclick = () => { closeModal(); a.fn && a.fn(); }; A.appendChild(b); });
    requestAnimationFrame(() => m.classList.add('show')); if (typeof SFX !== 'undefined' && SFX.pop) SFX.pop();
  }
  function closeModal() { const m = document.getElementById('tgModal'); if (m) m.classList.remove('show'); }
  const modalOpen = () => { const m = document.getElementById('tgModal'); return !!(m && m.classList.contains('show')); };

  // ---- bottom sheet with arbitrary content ----
  function sheet(title, body) {
    let m = document.getElementById('tgSheet');
    if (!m) { m = document.createElement('div'); m.id = 'tgSheet'; m.className = 'tg-sheet'; m.onclick = e => { if (e.target === m) closeSheet(); }; document.body.appendChild(m); }
    m.innerHTML = '<div class="tg-sheet-box"><div class="tg-grab"></div><h3></h3><div class="tg-sheet-body"></div><button type="button" class="tg-sheet-close">닫기</button></div>';
    m.querySelector('h3').textContent = title; m.querySelector('.tg-sheet-body').appendChild(body);
    m.querySelector('.tg-sheet-close').onclick = closeSheet;
    requestAnimationFrame(() => m.classList.add('show'));
    return m;
  }
  function closeSheet() { const m = document.getElementById('tgSheet'); if (m) m.classList.remove('show'); }
  const sheetOpen = () => { const m = document.getElementById('tgSheet'); return !!(m && m.classList.contains('show')); };
  const backHandlers = [];

  // ---- Toss back button: modal → result card → mode screen → (initial screen) 종료 확인 → leave the app ----
  function onBack() {
    for (const f of backHandlers) { try { if (f()) return true; } catch (e) {} }
    // 스토리 장면이 떠 있으면 먼저 닫는다 (장면 z-index 가 모달보다 높아 뒤로가기 확인창을 가리기 때문)
    const scene = document.getElementById('tgScene');
    if (scene && scene.classList.contains('show')) { scene.classList.remove('show'); scene.innerHTML = ''; return true; }
    if (modalOpen()) { closeModal(); return true; }
    if (window.SettingsUI && SettingsUI.isOpen && SettingsUI.isOpen()) { SettingsUI.close(); return true; }
    if (sheetOpen()) { closeSheet(); return true; }
    if (document.body.classList.contains('uix-res-on') && window.UIX && UIX.closeResult) { UIX.closeResult(true); return true; }
    if (isHidden(setupEl())) { G.openSetup(); return true; }
    if (APP) { goHome(); return true; }
    // B1: 초기 화면에서는 바로 끄지 않고 "게임을 종료할까요?" 확인 모달을 먼저 띄운다 (앱인토스 심사 요건)
    if (window.SettingsUI && SettingsUI.confirmExit) { SettingsUI.confirmExit(); return true; }
    return false;
  }

  window.__tgSimEnd = info => onGameEnd(info);   // test hook (smoke tests)
  function goHome() { location.href = '../index.html'; }
  let initP = null;
  function init(game) { if (!initP) initP = doInit(game); return initP; }
  async function doInit(game) {
    G = game; await load();
    if (G.onEnd) G.onEnd(onGameEnd);
    // B6: 전면 광고는 '새 대국 시작'에만 붙인다 — '다시 하기'(restart)는 방금 끝난 판을 다시 두는 것이라 광고를 끼우지 않는다
    ['start', 'startStage', 'startPuzzle'].forEach(wrapStart);
    window.UIX_RESULT_STATS = resultStats; window.UIX_RESULT_BUTTONS = resultButtons;
    const t = T(); if (t) { t.setAdGroup(window.AD_GROUP_ID || null); t.onBack(onBack); t.userKey(); }
    renderHub();
  }
  return { init, setDaily, onEnd: f => endListeners.push(f), addHubPart: p => { hubParts.push(p); renderHub(); }, addResultButton: f => resultBtns.push(f), addResultStat: f => resultStatFns.push(f), onBack: f => backHandlers.push(f), sheet, closeSheet, NAME, ID, dailyState, markDailySolved, addPoints, spend, unlock, isOpen, checkUnlocks, progressN: () => progressN(), toast, modal, closeModal, goHome, totalScore, APP, share, dayNumber, kstKey, get data() { return d; }, renderHub, save: () => save() };
})();

window.Meta = Meta;
