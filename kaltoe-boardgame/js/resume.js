/* ===== 대국 저장 · 이어하기 =====
   미니앱·웹앱은 자주 나갔다 들어오므로, 진행 중인 대국을 수순(moves)만 남겨 저장한다.
   - 착수할 때마다(game 모듈이 Resume.touch() 호출) + 앱이 가려질 때(visibilitychange/pagehide) 저장
   - 홈 화면과 게임의 모드 화면에 "이어서 두기" 카드
   - 승패·기권·종료 시 스냅샷 정리 (meta.js onGameEnd → Resume.clear)
   복원은 그 게임의 기존 재생 경로(startMail 방식)를 그대로 써서 수순을 다시 둔다 —
   보드 상태를 따로 직렬화하지 않으므로 무르기·기보·복기가 저장 전과 똑같이 동작한다. */
const Resume = (function () {
  const KEY = 'resume_game';
  const MAX_AGE = 7 * 864e5;                 // 일주일 지난 대국은 이어두지 않는다
  const NAMES = { omok: '오목', janggi: '장기', baduk: '바둑', chess: '체스' };
  const MODES = { cpu: 'CPU', arcade: '스테이지', pvp: '2인', training: '트레이닝', puzzle: '문제' };
  const LVS = { 1: '쉬움', 2: '보통', 3: '어려움' };
  let saved = null, resuming = false;

  function api() {
    try {
      switch (window.GAME_ID) {
        case 'omok': return typeof Omok !== 'undefined' ? Omok : null;
        case 'janggi': return typeof Janggi !== 'undefined' ? Janggi : null;
        case 'baduk': return typeof Baduk !== 'undefined' ? Baduk : null;
        case 'chess': return typeof ChessApp !== 'undefined' ? ChessApp : null;
      }
    } catch (e) {}
    return null;
  }

  const fresh = s => !!s && s.v === 1 && !!s.at && (Date.now() - s.at) < MAX_AGE && Array.isArray(s.moves);

  async function touch() {
    if (resuming) return;                              // 복원 재생 중에는 저장본을 지우지 않는다
    const A = api(); if (!A || !A.resumeState || !A.resume) return;
    let s = null;
    try { s = A.resumeState(); } catch (e) { s = null; }
    if (!s || !s.moves || !s.moves.length) { if (saved || (await load())) await clear(); return; }
    s.v = 1; s.at = Date.now();
    saved = s;
    try { await Store.set(KEY, s); } catch (e) {}
  }
  async function load() {
    try { const s = await Store.get(KEY); return fresh(s) ? s : null; } catch (e) { return null; }
  }
  async function clear() { saved = null; try { await Store.set(KEY, null); } catch (e) {} }

  function describe(s) {
    if (!s) return { title: '이어서 두기', sub: '' };
    const mode = s.mode === 'arcade' ? '스테이지 ' + (s.stage || 1) : [MODES[s.mode] || '', LVS[s.level] || ''].filter(Boolean).join(' ');
    const plies = (s.moves || []).length;
    return { title: '이어서 두기 · ' + (NAMES[s.g] || ''), sub: [mode, plies + '수 진행'].filter(Boolean).join(' · ') };
  }

  async function doResume() {
    const s = saved || (await load());
    if (!s || s.g !== window.GAME_ID) { Meta.toast('이어둔 대국이 없어요'); return false; }
    const A = api(); if (!A || !A.resume) return false;
    let ok = false;
    resuming = true;
    try { ok = !!A.resume(s); } catch (e) { console.error('[resume]', e); ok = false; }
    finally { resuming = false; }
    if (ok) { try { Meta.renderHub(); } catch (e) {} }
    else Meta.toast('이어둔 대국을 불러오지 못했어요');
    return ok;
  }

  function cardHTML() {
    if (!saved || saved.g !== window.GAME_ID) return '';
    const d = describe(saved);
    return `<button type="button" class="tg-resumebar" data-act="resume"><span>▶</span><b>${d.title}</b><small>${d.sub}</small></button>`;
  }

  function boot() {
    // 앱이 가려지거나 페이지를 떠날 때 마지막 상태를 남긴다
    document.addEventListener('visibilitychange', function () { if (document.hidden) touch(); });
    window.addEventListener('pagehide', function () { touch(); });

    const ready = (window.Monetize && Monetize.ready) ? Monetize.ready : Promise.resolve();
    ready.then(async function () {
      saved = await load();
      if (saved && saved.g !== window.GAME_ID) saved = null;
      try {
        if (window.Meta && Meta.addHubPart) Meta.addHubPart({ act: 'resume', top: true, html: cardHTML, click: doResume });
        if (window.Meta && Meta.renderHub) Meta.renderHub();
      } catch (e) {}
      if (saved && /[?&]resume=1/.test(location.search)) { try { await doResume(); } catch (e) {} }
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  return { touch, load, clear, doResume, describe, get saved() { return saved; }, get busy() { return resuming; } };
})();
window.Resume = Resume;
