/* ===== 🎁 행운 상자 — earned by winning, solving today's puzzle, good 퍼즐 러시 runs =====
   Up to 5 earned per day; a rewarded ad opens one more after each opening.
   Rewards: points, today's extra hints, and rare jackpots — with a rarity reveal. */
const Chest = (function () {
  const T = () => window.Toss || null;
  const DAILY_MAX = 5;
  const TABLE = [
    { w: 46, rar: '일반', cls: 'n', pts: 10 }, { w: 24, rar: '일반', cls: 'n', pts: 20 },
    { w: 14, rar: '희귀', cls: 'r', hint: 2, pts: 15 }, { w: 9, rar: '희귀', cls: 'r', pts: 50 },
    { w: 5, rar: '영웅', cls: 'e', hint: 5, pts: 60 }, { w: 2, rar: '전설', cls: 'l', pts: 200, hint: 10 },
  ];
  const st = () => { const d = Meta.data; if (!d.chest) d.chest = { pending: 0, day: '', earned: 0, opened: 0 }; const c = d.chest; if (c.day !== Meta.kstKey(0)) { c.day = Meta.kstKey(0); c.earned = 0; } return c; };
  const pending = () => (Meta.data ? st().pending : 0);
  function grant(reason) {
    const c = st(); if (c.earned >= DAILY_MAX) return false;
    c.earned++; c.pending++; Meta.save(); Meta.renderHub();
    if (window.Monetize) Monetize.log('chest_grant', { reason });
    return true;
  }
  function roll() { let x = Math.random() * TABLE.reduce((a, t) => a + t.w, 0); for (const t of TABLE) { x -= t.w; if (x <= 0) return t; } return TABLE[0]; }
  function apply(r) {
    if (r.pts) Meta.addPoints(r.pts);
    if (r.hint && window.Monetize) { const m = Meta.data.money; if (m) { m.bonus = m.bonus || {}; m.bonus.hint = (m.bonus.hint || 0) + r.hint; Meta.save(); } }
  }
  function open(free) {
    const c = st();
    if (!free && c.pending <= 0) { Meta.toast('열 상자가 없어요. 이기거나 문제를 풀면 받아요'); return; }
    if (!free) c.pending--;
    c.opened++; Meta.save();
    let m = document.getElementById('tgChest');
    if (!m) { m = document.createElement('div'); m.id = 'tgChest'; m.className = 'tg-modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="tg-card tg-chestcard"><div class="tg-k">행운 상자</div><button type="button" class="tg-box">🎁</button><div class="tg-s">상자를 눌러서 열어 보세요</div><div class="tg-acts"></div></div>`;
    requestAnimationFrame(() => m.classList.add('show'));
    const box = m.querySelector('.tg-box');
    box.onclick = () => {
      if (box.dataset.done) return; box.dataset.done = '1'; box.classList.add('open');
      const r = roll(); apply(r);
      if (window.Monetize) Monetize.log('chest_open', { rar: r.rar, ad: !!free });
      setTimeout(() => {
        const card = m.querySelector('.tg-chestcard'); card.classList.add('rar-' + r.cls);
        const lines = [r.pts ? '+' + r.pts + ' 코인' : '', r.hint ? '오늘 힌트 +' + r.hint : ''].filter(Boolean).join(' · ');
        card.querySelector('.tg-s').innerHTML = `<span class="tg-rar ${r.cls}">${r.rar}</span><b class="tg-prize">${lines}</b>`;
        box.textContent = { n: '✨', r: '💎', e: '🔮', l: '👑' }[r.cls];
        if (typeof SFX !== 'undefined') { (r.cls === 'n' ? SFX.reward : r.cls === 'l' ? SFX.levelup : SFX.achieve)(); }
        if ((r.cls === 'e' || r.cls === 'l') && window.Progress && Progress.confetti) Progress.confetti();
        const t = T(); if (t) t.haptic(r.cls === 'n' ? 'basicMedium' : 'success');
        const A = card.querySelector('.tg-acts'); const add = (label, fn, pri) => { const b = document.createElement('button'); b.type = 'button'; b.className = pri ? 'pri' : ''; b.textContent = label; b.onclick = fn; A.appendChild(b); };
        if (st().pending > 0) add('🎁 다음 상자 열기 (' + st().pending + ')', () => open(), true);
        else if (window.Monetize && !free) add('🎬 광고 보고 상자 하나 더', async () => { if (await Monetize.reward('chest')) open(true); }, true);
        add('확인', () => { m.classList.remove('show'); Meta.renderHub(); });
      }, 650);
    };
  }
  // where chests come from
  Meta.onEnd(info => { if (info.result === 'win' && (info.mode === 'cpu' || info.mode === 'arcade' || info.mode === 'mail')) grant('win'); });
  Meta.addResultButton((R, btn, last) => { if (pending() > 0) btn('', 'trophy', '상자 열기 (' + pending() + ')', 'chest', () => { if (window.UIX && UIX.closeResult) UIX.closeResult(false); open(); }); });
  Meta.addHubPart({ act: 'chest', top: true, html: () => (pending() > 0 ? `<button type="button" class="tg-chestbar" data-act="chest"><span>🎁</span><b>행운 상자 ${pending()}개</b><small>눌러서 열기</small></button>` : ''), click: () => open() });
  return { grant, open, pending };
})();

window.Chest = Chest;
