/* ===== i18n — 한국어 / English =====
   - 기본 언어: 설정에서 고른 값(localStorage 'app_lang') → 없으면 기기 언어(navigator.language)가 ko 이면 한국어, 아니면 영어.
   - 한국어 모드에서는 아무것도 하지 않는다 (사전도 불러오지 않음) → 토스·광고·게임 로직에 영향 없음.
   - 영어 모드에서는 i18n-en.js 사전을 동기로 불러와, 화면에 그려지는 텍스트(텍스트 노드·placeholder·title·aria-label)를
     MutationObserver 로 바꿔 끼운다. 게임 코드가 쓰는 한국어 문자열 값(저장값·비교값)은 그대로라 로직이 깨지지 않는다.
   - JS에서 직접 쓰는 문자열(공유 문구·alert·캔버스)은 I18N.t(문자열)로 번역한다.
   - 각 페이지 <head> 맨 앞에서 불러야 한다 (tools/build-app.mjs 가 넣는다). */
(function () {
  'use strict';
  if (window.I18N) return;
  var KEY = 'app_lang';
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var deviceLang = function () {
    var l = (navigator.languages && navigator.languages[0]) || navigator.language || 'ko';
    return /^ko\b/i.test(l) ? 'ko' : 'en';
  };
  var lang = (saved === 'ko' || saved === 'en') ? saved : deviceLang();
  try { var q = /[?&]lang=(ko|en)\b/.exec(location.search); if (q) lang = q[1]; } catch (e) {}

  var HANGUL = /[가-힣ㄱ-ㆎ]/;
  var I = window.I18N = {
    lang: lang,
    mode: (saved === 'ko' || saved === 'en') ? saved : 'auto',   // 설정 화면 표시용
    device: deviceLang(),
    t: function (s) { return s; },
    miss: [],
    set: function (m) {                                          // 'ko' | 'en' | 'auto'
      try { if (m === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, m); } catch (e) {}
      var next = m === 'auto' ? deviceLang() : m;
      if (next !== I.lang) {
        try { var u = new URL(location.href); u.searchParams.delete('lang'); location.replace(u.toString()); } catch (e) { location.reload(); }
      }
      I.mode = m;
    }
  };
  try { document.documentElement.lang = lang; } catch (e) {}
  if (lang !== 'en') return;

  /* ---------- 영어 모드 ---------- */
  var cur = document.currentScript;
  var dictSrc = cur && cur.src ? cur.src.replace(/i18n\.js(\?[^#]*)?$/, 'i18n-en.js') : 'js/i18n-en.js';

  var EX = {}, TPL = [], RE = [], FRAG = null, SGL = null, cache = new Map();
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  // 숫자 + 단위 (사전·패턴을 다 거친 뒤 남은 조각)
  var UNITS = [
    [/(\d+)\s*수째/g, 'move $1'], [/(\d+)\s*판/g, '$1 games'], [/(\d+)\s*연승/g, '$1-win streak'],
    [/(\d+)\s*분 전/g, '$1m ago'], [/(\d+)\s*시간 전/g, '$1h ago'], [/(\d+)\s*일 전/g, '$1d ago'],
    [/(\d+)\s*일차/g, 'Day $1'], [/(\d+)\s*일 연속/g, '$1-day streak'], [/(\d+)\s*단계/g, 'Lv.$1'],
    [/(\d+)\s*번째/g, '#$1'], [/(\d+)\s*장/g, '$1 cards'], [/(\d+)\s*개/g, '×$1'], [/(\d+)\s*초/g, '$1s'],
    [/(\d+)\s*분/g, '$1m'], [/(\d+)\s*시간/g, '$1h'], [/(\d+)\s*일/g, '$1 days'], [/(\d+)\s*급/g, '$1 kyu'],
    [/(\d+)\s*단/g, '$1 dan'], [/(\d+)\s*집/g, '$1 pts'], [/(\d+)\s*명/g, '$1 people'], [/(\d+)\s*번/g, '$1×'],
    [/(\d+)\s*수/g, '$1 moves'], [/(\d+)\s*턴/g, '$1 turns'], [/(\d+)\s*인/g, '$1P'], [/(\d+)\s*줄/g, '$1×$1'],
    [/(\d+)\s*원/g, '₩$1'], [/(\d+)\s*점/g, '$1 pts'], [/(\d+)\s*층/g, 'floor $1'], [/(\d+)\s*년/g, '$1 yrs']
  ];
  // 영어 단어 뒤에 남은 조사 정리 (예: "Jam Kid을" → "Jam Kid")
  var PARTICLE = /([A-Za-z0-9)\]%!?.'"’🏆⭐])\s?(으로|에게|로|을|를|이|가|은|는|와|과|의|에|도|님|이에요|예요|이야|야)(?=[\s.,!?·:)\]~…]|$)/g;

  function build() {
    var D = window.I18N_EN || {};
    var dict = D.dict || {};
    var keys = [];
    var SGL_SKIP = { '수': 1, '턴': 1, '분': 1, '줄': 1, '일': 1, '개': 1, '번': 1, '급': 1, '단': 1, '승': 1, '총': 1 };
    var sgl = [];
    for (var k in dict) {
      if (!Object.prototype.hasOwnProperty.call(dict, k)) continue;
      if (/\{\w+\}/.test(k)) {
        var names = [];
        var src = '^' + esc(k).replace(/\\\{(\w+)\\\}/g, function (_, n) { names.push(n); return '([\\s\\S]+?)'; }) + '$';
        TPL.push({ re: new RegExp(src), names: names, en: dict[k], lit: k.replace(/\{\w+\}/g, '').length });
      } else { EX[k] = dict[k]; if (k.length >= 2) keys.push(k); else if (dict[k] && !SGL_SKIP[k]) sgl.push(k); }
    }
    // 한 글자 키(백·한·흑·초·차·포 …)는 낱말 안에서 우연히 만날 수 있어 낱말 단위로만 바꾼다.
    // 숫자 뒤 단위(수·턴·분·줄 …)는 아래 UNITS 가 처리하므로 한 글자 치환에서는 뺀다.
    if (sgl.length) SGL = new RegExp('(^|[^\uAC00-\uD7A3])(' + sgl.map(esc).join('|') + ')(?=[^\uAC00-\uD7A3]|$)', 'g');
    // 더 구체적인(고정 글자가 많은) 템플릿을 먼저 맞춘다
    TPL.sort(function (a, b) { return b.lit - a.lit; });
    (D.re || []).forEach(function (r) { RE.push([new RegExp(r[0], 'g'), r[1]]); });
    keys.sort(function (a, b) { return b.length - a.length; });
    if (keys.length) FRAG = new RegExp(keys.map(esc).join('|'), 'g');
  }

  function core(c) {
    if (Object.prototype.hasOwnProperty.call(EX, c)) return EX[c];
    if (c.indexOf('\n') >= 0) return c.split('\n').map(tr).join('\n');
    for (var i = 0; i < TPL.length; i++) {
      var m = TPL[i].re.exec(c);
      if (m) {
        var o = TPL[i].en, nm = TPL[i].names;
        for (var j = 0; j < nm.length; j++) o = o.split('{' + nm[j] + '}').join(tr(m[j + 1]));
        return o;
      }
    }
    var out = c;
    for (var r = 0; r < RE.length; r++) out = out.replace(RE[r][0], RE[r][1]);
    if (!HANGUL.test(out)) return out;
    if (Object.prototype.hasOwnProperty.call(EX, out.trim())) return EX[out.trim()];
    if (FRAG) out = out.replace(FRAG, function (k) { return EX[k]; });
    if (!HANGUL.test(out)) return out;
    for (var u = 0; u < UNITS.length; u++) out = out.replace(UNITS[u][0], UNITS[u][1]);
    out = out.replace(PARTICLE, '$1');
    if (SGL) out = out.replace(SGL, function (m, pre, k) { return /[0-9]/.test(pre) ? m : pre + EX[k]; });   // "백 · 보통" → "White · Normal"
    return out;
  }
  function tr(s) {
    if (s == null) return s;
    s = String(s);
    if (!HANGUL.test(s)) return s;
    var hit = cache.get(s);
    if (hit !== undefined) return hit;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    var r = m[1] + core(m[2]) + m[3];
    if (HANGUL.test(r) && I.miss.length < 200 && I.miss.indexOf(s) < 0) I.miss.push(s);   // 사전에 없는 문구 (개발용: I18N.miss)
    if (cache.size > 4000) cache.clear();
    cache.set(s, r);
    return r;
  }

  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  function text(n) {
    var v = n.nodeValue;
    if (!v || !HANGUL.test(v)) return;
    var p = n.parentNode;
    if (p && SKIP[p.nodeName]) return;
    var t = tr(v);
    if (t !== v) n.nodeValue = t;
  }
  function attrs(e) {
    for (var i = 0; i < ATTRS.length; i++) {
      var v = e.getAttribute(ATTRS[i]);
      if (v && HANGUL.test(v)) { var t = tr(v); if (t !== v) e.setAttribute(ATTRS[i], t); }
    }
    if (e.nodeName === 'INPUT' && /^(button|submit)$/i.test(e.type) && HANGUL.test(e.value)) e.value = tr(e.value);
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) return text(root);
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) { if (SKIP[root.nodeName]) return; attrs(root); }
    var w = document.createTreeWalker(root, 5 /* SHOW_ELEMENT | SHOW_TEXT */, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) text(n);
      else if (!SKIP[n.nodeName]) attrs(n);
    }
  }

  I._init = function () {
    if (I.ready) return;
    build();
    I.ready = true;
    I.t = tr;
    walk(document.documentElement);
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r.type === 'characterData') text(r.target);
        else if (r.type === 'attributes') attrs(r.target);
        else for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
      }
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    document.addEventListener('DOMContentLoaded', function () { walk(document.body); });
    var A = window.alert, C = window.confirm, P = window.prompt;
    window.alert = function (m) { return A.call(window, tr(m)); };
    window.confirm = function (m) { return C.call(window, tr(m)); };
    window.prompt = function (m, d) { return P.call(window, tr(m), d); };
  };
  document.write('<script src="' + dictSrc + '"><\/script><script>window.I18N&&I18N._init&&I18N._init()<\/script>');
})();
