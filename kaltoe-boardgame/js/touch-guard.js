(function () {
  const TXT = 'input,textarea,select,[contenteditable="true"]';
  const isTxt = t => !!(t && t.closest && t.closest(TXT));
  const CTL = '#baLeft,#baRight,#baDown,#baJump,#baDash,#baTnt,#baUtnt,#baTruck,#baPad';
  const inGame = t => !!(t && t.closest && t.closest('.screen,#baPad,#baHud'));
  const clr = () => { try { const s = window.getSelection && window.getSelection(); if (s && s.rangeCount && !isTxt(document.activeElement)) s.removeAllRanges(); } catch (e) {} };
  let n = 0;
  document.addEventListener('touchstart', e => {
    if (isTxt(e.target)) return;
    if (inGame(e.target)) clr();
    // pointer events already fired, so the hold/jump/dash controls keep working; this only kills iOS selection/callout/zoom
    if (e.target.closest && e.target.closest(CTL) && e.cancelable) { e.preventDefault(); n++; }
  }, { passive: false, capture: true });
  const block = e => { if (!isTxt(e.target) && inGame(e.target)) { e.preventDefault(); clr(); } };
  ['contextmenu', 'selectstart', 'dblclick'].forEach(t => document.addEventListener(t, block, { passive: false, capture: true }));
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  // double-tap zoom guard outside text inputs (iOS ignores user-scalable)
  let lastEnd = 0;
  document.addEventListener('touchend', e => { const now = Date.now(); if (now - lastEnd < 300 && e.cancelable && !isTxt(e.target) && e.target.closest && e.target.closest(CTL)) e.preventDefault(); lastEnd = now; }, { passive: false });
  document.addEventListener('selectionchange', () => { const a = document.activeElement; if (isTxt(a)) return; try { const s = window.getSelection(); if (s && s.rangeCount && !s.isCollapsed && inGame(s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement))) s.removeAllRanges(); } catch (e) {} });
  if (window.__BA_DEBUG) window.__nosel571 = () => n;
})();
