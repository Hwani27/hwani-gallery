/* App shell for a single-game Toss mini-app build.
   The original page had a launcher with every game; here the game opens straight away and
   "← 메뉴" returns to the game's own mode screen instead of the (removed) launcher. */
(function () {
  const id = window.GAME_ID;
  const G = { omok: () => Omok, janggi: () => Janggi, baduk: () => Baduk, chess: () => ChessApp, uno: () => Uno }[id];
  window.backToLauncher = function () {
    try { const g = G();
      const su = document.getElementById(id === 'chess' ? 'setup' : id + 'Setup');
      if (window.APP_MODE && su && !su.classList.contains('hidden') && getComputedStyle(su).display !== 'none') { location.href = '../index.html'; return; }
      if (g && g.openSetup) g.openSetup(); else { const mb = document.getElementById('menuBtn'); if (mb) mb.click(); } } catch (e) {}
  };
  function boot() {
    try { openGame(id); } catch (e) { console.error('[shell] boot failed', e); }
    document.documentElement.classList.add('app-ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
