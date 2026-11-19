/* ===== 3D 엔진(three.min.js, 약 589KB) 지연 로딩 =====
   예전에는 게임 페이지마다 <script src="…/three.min.js">로 589KB를 먼저 받고 UI를 그렸다.
   이제 3D 보드를 실제로 열 때(모드 선택 → 대국 시작)만 받아 온다.
   사용법:
     window.loadThree().then(() => { …보드 만들기… });
   이미 받았으면 즉시 resolve, 동시에 여러 번 불러도 한 번만 내려받는다. */
(function () {
  var P = null, veil = null, veilT = null;

  // three.min.js는 이 파일과 같은 js 폴더에 있다 (앱: ../js/, 단일 게임: js/)
  function base() {
    var s = document.currentScript;
    if (s && s.src) return s.src.replace(/[^/]*$/, '');
    var l = document.getElementsByTagName('script');
    for (var i = l.length - 1; i >= 0; i--) {
      var src = l[i].src || '';
      if (/\/js\/[^/]+\.js(\?|$)/.test(src)) return src.replace(/[^/]*$/, '');
    }
    return 'js/';
  }

  function showVeil() {
    if (veil || veilT) return;
    veilT = setTimeout(function () {
      veilT = null;
      if (window.THREE) return;
      veil = document.createElement('div');
      veil.id = 'threeVeil';
      veil.setAttribute('role', 'status');
      veil.innerHTML = '<span class="tv-spin"></span><span>3D 보드를 준비하고 있어요…</span>';
      (document.body || document.documentElement).appendChild(veil);
    }, 150);
  }
  function hideVeil() {
    if (veilT) { clearTimeout(veilT); veilT = null; }
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
    veil = null;
  }

  function load() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (P) return P;
    showVeil();
    P = new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = base() + 'three.min.js';
      el.async = true;
      el.onload = function () {
        hideVeil();
        if (!window.THREE) { P = null; reject(new Error('three.min.js loaded but THREE is missing')); return; }
        // 화질(GQ)처럼 three가 있어야 준비되는 모듈이 이 신호를 듣는다
        try { window.dispatchEvent(new Event('three-ready')); } catch (e) {}
        resolve(window.THREE);
      };
      el.onerror = function () { hideVeil(); P = null; reject(new Error('three.min.js load failed')); };
      document.head.appendChild(el);
    });
    return P;
  }

  window.loadThree = load;
  window.threeReady = function () { return !!window.THREE; };
})();
