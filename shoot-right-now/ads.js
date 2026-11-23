/* 지금 바로 쏴! (Shoot Right Now) — 보상형 광고 브리지 (MGAds)
   ==================================================================
   rail.js 는 window.MGAds.show('revive'|'supply') 하나만 부르고, 보상은
   Promise<boolean> 이 true 로 끝날 때만 준다. 이 파일이 "어디서 실행 중인지"를
   판단해 알맞은 광고 경로로 넘긴다.

   ■ 경로 (pick() 순서)
   1) 토스 앱인토스 — 토스 안에서 열렸을 때
      · window.Toss.showRewarded()                        (work/toss-boardgames 의
        shared/src/toss-bridge.js 와 같은 규격: true=보상, 'test'=토스 밖 테스트, false=실패)
      · 또는 window.AppsInToss.loadFullScreenAd / showFullScreenAd 를 직접 호출
        (@apps-in-toss/web-framework 를 그대로 노출한 빌드용 — 'userEarnedReward' 이벤트로 판정)
   2) 구글 AdMob WebView 브리지 (구글플레이 안드로이드 빌드의 기본 경로)
      자바스크립트 인터페이스 이름이 빌드마다 달라서 아래 이름을 모두 받는다:
      · window.playAdmobAds / window.PlayAdmobAds   ← play-admob-ads.js 규격
      · window.MGAdsNative / window.AndroidAds / window.AndroidAdMob / window.AdMob
        / window.Android (addJavascriptInterface 이름)
      · 메서드 이름: showRewarded | showRewardedAd | rewarded | show
      · 호출 규약: (placement, callbackName) → 끝나면 window[callbackName](true|false)
        (문자열 'true'/'1' 도 true 로 읽는다. 콜백 이름을 안 받는 구현이면
         window.MGAds.nativeResult(true) 로 결과를 밀어 넣으면 된다)
      · iOS WKWebView: webkit.messageHandlers.mgAds / admobAds
        postMessage({action:'rewarded', placement, callback})
   3) 그 밖(일반 웹·GitHub Pages) — 테스트/미리보기 오버레이 1.5초 카운트다운 후 보상.
      흐름·UI를 실기기 없이 그대로 확인할 수 있다.

   ■ 광고 ID
   · PUBLISHER      pub-6817381579747852   (AdMob 게시자 ID — 네이티브 래퍼가 읽어 간다)
   · REWARDED_UNIT  보상형 광고 단위 ID. 구글플레이 빌드에서 채운다. 비면 래퍼 기본값.
   · tossGroup      토스 보상형 광고 그룹 ID (없으면 'ait-ad-test-rewarded-id')

   ■ 테스트 훅
   · ?ads=off    광고 슬롯을 아예 쓰지 않는다 (버튼도 뜨지 않음)
   · ?ads=test   네이티브가 있어도 미리보기 오버레이로 강제
   · ?ads=native / ?ads=toss  경로 강제
   · window.__adPreviewSec = 0.2   미리보기 길이(초)
   · window.MGAds.state · window.__adShows · window.__adLastResult · window.__adMode
*/
(function () {
  "use strict";
  var PUBLISHER = "pub-6817381579747852";
  var REWARDED_UNIT = "";
  var TOSS_TEST_GROUP = "ait-ad-test-rewarded-id";
  var MAX_WAIT = 90000;

  var q = null;
  try { q = new URLSearchParams(location.search); } catch (e) { q = null; }
  var pref = (q && q.get("ads")) || "auto";            // auto | test | off | toss | native
  var seq = 0;
  var state = { mode: "test", shown: 0, earned: 0, lastPlacement: null, lastResult: null, lastError: null };
  var tossGroupSet = false;

  /* ---------- 1) 토스 ---------- */
  function tossBridge() {
    var T = window.Toss;
    if (!T || !T.inToss || typeof T.showRewarded !== "function") return null;
    return T;
  }
  function tossSdk() {
    var A = window.AppsInToss;
    if (!A) return null;
    var show = A.showFullScreenAd, load = A.loadFullScreenAd;
    if (typeof show !== "function" || typeof load !== "function") return null;
    return A;
  }
  function viaToss(placement) {
    var T = tossBridge();
    if (!T) return viaTossSdk(placement);
    try {
      if (!tossGroupSet && typeof T.setRewardedGroup === "function") {
        tossGroupSet = true;
        T.setRewardedGroup(window.MGAds.tossGroup || TOSS_TEST_GROUP);
      }
      return Promise.resolve(T.showRewarded()).then(function (r) { return r === true || r === "test"; }, function (e) {
        state.lastError = "toss:" + e;
        return false;
      });
    } catch (e) { state.lastError = "toss:" + e; return Promise.resolve(false); }
  }
  /* the framework itself, when a build exposes it directly instead of the
     window.Toss facade: load once, show, and keep only the userEarnedReward */
  function viaTossSdk(placement) {
    var A = tossSdk();
    if (!A) return Promise.resolve(false);
    var group = window.MGAds.tossGroup || TOSS_TEST_GROUP;
    return new Promise(function (resolve) {
      var done = false, earned = false;
      function finish(ok) { if (done) return; done = true; resolve(!!ok); }
      setTimeout(function () { finish(false); }, MAX_WAIT);
      try {
        A.loadFullScreenAd({
          options: { adGroupId: group },
          onEvent: function (e) {
            if (!e) return;
            if (e.type === "loaded") {
              try {
                A.showFullScreenAd({
                  options: { adGroupId: group },
                  onEvent: function (ev) {
                    if (!ev) return;
                    if (ev.type === "userEarnedReward") earned = true;
                    if (ev.type === "dismissed" || ev.type === "failedToShow") finish(earned);
                  },
                  onError: function () { finish(earned); }
                });
              } catch (err) { finish(false); }
            }
            if (e.type === "error") finish(false);
          },
          onError: function () { finish(false); }
        });
      } catch (e) { finish(false); }
    });
  }

  /* ---------- 2) 구글 AdMob 래퍼 ---------- */
  var NATIVE_NAMES = ["playAdmobAds", "PlayAdmobAds", "PlayAdMobAds", "MGAdsNative", "AndroidAds", "AndroidAdMob", "AdMob", "admob", "Android"];
  var NATIVE_METHODS = ["showRewarded", "showRewardedAd", "rewarded", "show"];
  function nativeBridge() {
    for (var i = 0; i < NATIVE_NAMES.length; i++) {
      var api = window[NATIVE_NAMES[i]];
      if (!api) continue;
      for (var j = 0; j < NATIVE_METHODS.length; j++) {
        if (typeof api[NATIVE_METHODS[j]] === "function") return { kind: "js", name: NATIVE_NAMES[i], api: api, fn: api[NATIVE_METHODS[j]] };
      }
    }
    if (window.webkit && window.webkit.messageHandlers) {
      var h = window.webkit.messageHandlers.mgAds || window.webkit.messageHandlers.admobAds || window.webkit.messageHandlers.AdMob;
      if (h && typeof h.postMessage === "function") return { kind: "ios", api: h };
    }
    return null;
  }
  function viaNative(placement) {
    var b = nativeBridge();
    if (!b) return Promise.resolve(false);
    return new Promise(function (resolve) {
      var done = false;
      var cb = "__mgAdDone" + (++seq);
      window.__mgAdCb = cb;
      var tm = setTimeout(function () { finish(false, "timeout"); }, MAX_WAIT);
      function finish(ok, why) {
        if (done) return;
        done = true;
        clearTimeout(tm);
        try { delete window[cb]; } catch (e) { window[cb] = null; }
        if (!ok && why) state.lastError = why;
        resolve(ok === true || ok === "true" || ok === 1 || ok === "1");
      }
      window[cb] = function (ok) { finish(ok); };
      try {
        if (b.kind === "js") b.fn.call(b.api, placement, cb, REWARDED_UNIT || "", PUBLISHER);
        else b.api.postMessage({ action: "rewarded", placement: placement, callback: cb, unit: REWARDED_UNIT, publisher: PUBLISHER });
      } catch (e) { finish(false, "native:" + e); }
    });
  }

  /* ---------- 3) 미리보기(일반 웹) ---------- */
  var adCss = false;
  function previewCss() {
    if (adCss || document.getElementById("mgAdCss")) return;
    adCss = true;
    var st = document.createElement("style");
    st.id = "mgAdCss";
    st.textContent = [
      "#mgAd{position:fixed;inset:0;z-index:66;display:flex;align-items:center;justify-content:center;background:rgba(3,6,3,.86);",
      "color:#fff;font-family:Pretendard,system-ui,-apple-system,sans-serif;padding:22px;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}",
      "#mgAd .box{width:min(360px,100%);text-align:center;background:linear-gradient(180deg,#1b2416,#0e130c);border:2px solid #c9b871;border-radius:18px;",
      "padding:20px 18px 16px;box-shadow:0 18px 44px rgba(0,0,0,.6)}",
      "#mgAd .k{margin:0 0 10px;font:800 10px/1 ui-monospace,monospace;letter-spacing:.34em;color:#c9b871}",
      "#mgAd .film{display:block;font-size:44px;line-height:1;margin:6px 0 8px;animation:mgAdPulse 0.6s ease-in-out infinite alternate}",
      "@keyframes mgAdPulse{to{transform:scale(1.08)}}",
      "#mgAd .n{margin:0;font:900 30px/1 ui-monospace,monospace;color:#ffe14a}",
      "#mgAd .bar{height:6px;margin:14px 0 8px;border-radius:3px;background:rgba(255,255,255,.14);overflow:hidden}",
      "#mgAd .bar i{display:block;height:100%;width:0;background:#ffe14a;transition:width .1s linear}",
      "#mgAd .t{margin:6px 0 14px;font-size:12px;line-height:1.5;color:#a9b39c}",
      "#mgAd button{min-height:44px;width:100%;border-radius:12px;border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.06);",
      "color:#dfe3d6;font:800 14px/1 inherit;cursor:pointer;touch-action:manipulation}"
    ].join("");
    document.head.appendChild(st);
  }
  function preview(placement) {
    previewCss();
    var old = document.getElementById("mgAd");
    if (old) old.remove();
    var sec = Number(window.__adPreviewSec) > 0 ? Number(window.__adPreviewSec) : 1.5;
    var box = document.createElement("div");
    box.id = "mgAd";
    box.setAttribute("data-placement", placement || "rewarded");
    box.innerHTML = '<div class="box"><p class="k">AD PREVIEW · TEST</p><span class="film">🎬</span>' +
      '<p class="n">' + sec.toFixed(1) + '</p><div class="bar"><i></i></div>' +
      '<p class="t">광고 미리보기입니다.<br>AdMob(안드로이드)·토스 광고가 붙으면 그 광고가 나옵니다.</p>' +
      '<button type="button" data-x="skip">건너뛰기</button></div>';
    document.body.appendChild(box);
    return new Promise(function (resolve) {
      var t0 = performance.now(), done = false;
      var bar = box.querySelector(".bar i"), num = box.querySelector(".n");
      function end(ok) {
        if (done) return;
        done = true;
        clearInterval(iv);
        box.remove();
        resolve(!!ok);
      }
      var iv = setInterval(function () {
        var k = Math.min(1, (performance.now() - t0) / (sec * 1000));
        if (bar) bar.style.width = (k * 100).toFixed(0) + "%";
        if (num) num.textContent = Math.max(0, sec * (1 - k)).toFixed(1);
        if (k >= 1) end(true);
      }, 60);
      box.addEventListener("click", function (e) {
        var b = e.target && e.target.closest ? e.target.closest("button[data-x]") : null;
        if (!b) return;
        e.preventDefault();
        e.stopPropagation();
        end(false);
      });
    });
  }

  /* ---------- 공개 ---------- */
  function pick() {
    if (pref === "off") return "off";
    if (pref === "test") return "test";
    if (pref === "toss") return "toss";
    if (pref === "native") return "native";
    if (tossBridge() || tossSdk()) return "toss";
    if (nativeBridge()) return "native";
    return "test";
  }
  function show(placement) {
    placement = placement || "rewarded";
    var mode = pick();
    state.mode = mode;
    state.lastPlacement = placement;
    state.shown++;
    window.__adShows = state.shown;
    var p;
    if (mode === "off") p = Promise.resolve(false);
    else if (mode === "toss") p = viaToss(placement);
    else if (mode === "native") p = viaNative(placement);
    else p = preview(placement);
    return p.then(function (ok) {
      if (ok) state.earned++;
      state.lastResult = !!ok;
      state.mode = mode;
      window.__adLastResult = !!ok;
      window.__adLastPlacement = placement;
      window.__adMode = mode;
      return !!ok;
    });
  }

  window.MGAds = {
    publisher: PUBLISHER,
    rewardedUnit: REWARDED_UNIT,
    tossGroup: "",
    state: state,
    /** which route this page would take right now */
    get mode() { return pick(); },
    available: function () { return pick() !== "off"; },
    show: show,
    /** a native wrapper without a callback name can push the result in here */
    nativeResult: function (ok) {
      var cb = window.__mgAdCb;
      if (cb && typeof window[cb] === "function") window[cb](ok);
    }
  };
  state.mode = pick();
  window.__adMode = state.mode;
})();
