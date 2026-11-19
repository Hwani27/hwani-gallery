/* ===== 웹 / PWA(구글플레이 TWA) 빌드용 Toss 대체 객체 =====
   구글플레이·일반 브라우저 빌드에는 토스 SDK(@apps-in-toss/web-framework)를 넣지 않는다.
   게임 코드는 window.Toss 가 있으면 토스 API를 쓰므로, 여기에 같은 모양의 안전한 대체물을 두어
   저장(localStorage)·공유(Web Share)·진동(navigator.vibrate)만 동작하고
   광고·결제·토스 포인트·intoss:// 딥링크는 전부 하지 않는다. 외부 도메인 요청도 없다. */
(function () {
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  async function share(message, path) {
    var text = message;
    if (path && /^https?:/.test(path)) text = message + '\n' + path;
    if (navigator.share) {
      try { await navigator.share({ text: text }); return 'web'; }
      catch (e) { if (e && e.name === 'AbortError') return false; }
    }
    try { await navigator.clipboard.writeText(text); return 'clipboard'; } catch (e) { return false; }
  }
  window.Toss = {
    env: null, inToss: false,
    storage: null,                                  // Store 는 localStorage 로 떨어진다
    userKey: async function () { return null; },
    submitScore: async function () { return false; },
    openLeaderboard: async function () { return false; },
    share: share,
    haptic: function (type) { try { if (navigator.vibrate) navigator.vibrate(type === 'success' ? [12, 40, 12] : 10); } catch (e) {} },
    setAdGroup: function () {}, showAd: async function () { return false; }, syncBanner: function () {},
    setRewardedGroup: function () {}, showRewarded: async function () { return false; },
    buy: async function () { return 'unsupported'; }, restorePending: async function () { return 0; }, owned: async function () { return null; },
    log: function () {}, promo: async function () { return 'fail'; }, invite: async function () { return null; }, askReview: function () {},
    open: function () { return false; },             // intoss:// 딥링크는 웹에서 열지 않는다
    anonKey: async function () { return null; }, askNotify: async function () { return null; },
    onBack: function () {}
  };
})();
