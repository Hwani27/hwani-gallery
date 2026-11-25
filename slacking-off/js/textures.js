/* ===== 부장님 몰래 딴짓하기 — CC0 실사 텍스처 로더 =====
   Poly Haven(CC0) 1K 원본을 512px WebP(diffuse/normal/roughness)로 줄여
   textures/ 에 함께 넣었다. 첫 프레임은 지금까지의 단색·캔버스 재질 그대로
   그리고, 파일이 도착하는 순간 map / normalMap / roughnessMap 만 갈아 끼운다.
   로드가 늦거나 실패하면 원래 재질이 그대로 남으므로 화면이 비거나 깨지지 않는다.
   ?notex 로 접속하면 비교용으로 기존 재질만 본다. */
var TX = (function () {
  'use strict';

  /* ns: 노멀 강도, rmin: roughnessMap을 곱한 뒤 보장할 최소 거칠기 */
  var SETS = {
    tile:     { dir: 'interior_tiles',                d: 1, n: 1, r: 1, ns: 0.55, rmin: 0.78 },
    carpet:   { dir: 'dirty_carpet',            d: 1, n: 1, r: 1, ns: 0.75, rmin: 0.82 },
    wood:     { dir: 'kitchen_wood',            d: 1, n: 1, r: 1, ns: 0.42, rmin: 0.52 },
    plaster:  { dir: 'painted_plaster_wall',    d: 1, n: 1, r: 1, ns: 0.32, rmin: 0.72 },
    concrete: { dir: 'concrete_floor_worn_001', d: 1, n: 1, r: 1, ns: 0.45, rmin: 0.78 },
    grass:    { dir: 'aerial_grass_rock',       d: 1, n: 1, r: 1, ns: 0.6,  rmin: 0.72 },
    dirt:     { dir: 'stony_dirt_path',         d: 1, n: 1, r: 1, ns: 0.7,  rmin: 0.82 },
    rock:     { dir: 'rock_surface',            d: 1, n: 1, r: 1, ns: 0.7,  rmin: 0.72 },
    metal:    { dir: 'metal_plate',             d: 1, n: 1, r: 1, ns: 0.4,  rmin: 0.42 }
  };

  var st = { ready: {}, cache: {}, queue: [], started: 0, applied: 0, loaded: 0, miss: '' };
  var off = /[?&]notex\b/.test(String((window.location && location.search) || ''));
  var MAXA = 4;
  window.__tx = st;

  function srgb(t) { if (THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding; return t; }
  function linear(t) { if (THREE.LinearEncoding !== undefined) t.encoding = THREE.LinearEncoding; return t; }

  /* 캔버스/이미지의 평균색(0..1, sRGB) — 사진을 원래 색조에 맞추는 데 쓴다 */
  function meanOf(src) {
    try {
      var c = document.createElement('canvas');
      c.width = c.height = 16;
      var g = c.getContext('2d');
      g.drawImage(src, 0, 0, 16, 16);
      var d = g.getImageData(0, 0, 16, 16).data, r = 0, gg = 0, b = 0;
      for (var i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
      var n = d.length / 4;
      return [r / n / 255, gg / n / 255, b / n / 255];
    } catch (e) { return null; }
  }

  function load() {
    if (st.started) return;
    st.started = 1;
    if (off || !THREE || !THREE.TextureLoader) return;
    var loader = new THREE.TextureLoader();
    if (loader.setCrossOrigin) loader.setCrossOrigin('anonymous');
    Object.keys(SETS).forEach(function (name) {
      var S = SETS[name], got = {};
      ['d', 'n', 'r'].forEach(function (kind) {
        if (!S[kind]) return;
        loader.load('textures/' + S.dir + '_' + kind + '.webp', function (t) {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.minFilter = THREE.LinearMipMapLinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.generateMipmaps = true;
          t.anisotropy = MAXA;
          t.needsUpdate = true;
          if (kind === 'd') { srgb(t); if (t.image) S.dMean = meanOf(t.image); }
          else linear(t);
          got[kind] = t;
          if (got.n) {
            if (!st.ready[name]) st.loaded++;
            st.ready[name] = got;
            applyQueue();
            if (st.loaded >= Object.keys(SETS).length) {
              try { window.dispatchEvent(new Event('txready')); } catch (e) {}
            }
          }
        }, undefined, function () { st.miss += name + ':' + kind + ';'; });
      });
    });
  }

  /* 한 재질이 원하는 (세트, 반복)당 텍스처 하나 — 반복은 0.25 타일 단위로
     양자화해 여러 상자가 같은 이미지를 공유한다 */
  function texFor(set, kind, rx, ry) {
    var S = st.ready[set];
    if (!S || !S[kind]) return null;
    var qx = Math.max(0.25, Math.round((rx || 1) * 4) / 4);
    var qy = Math.max(0.25, Math.round((ry || 1) * 4) / 4);
    var k = set + '|' + kind + '|' + qx + '|' + qy;
    if (st.cache[k]) return st.cache[k];
    var t = S[kind].clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(qx, qy);
    t.anisotropy = MAXA;
    t.needsUpdate = true;
    st.cache[k] = t;
    return t;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function applyOne(m) {
    var w = m.userData && m.userData.__tx;
    if (!w || m.userData.__txDone) return 0;
    var S = SETS[w.set];
    if (!S || !st.ready[w.set]) return 0;
    var tr = w.tr || [1, 1];
    var wantD = w.mode !== 'relief' && !!S.d;
    var diffuse = wantD ? texFor(w.set, 'd', tr[0], tr[1]) : null;
    var nrm = texFor(w.set, 'n', tr[0], tr[1]);
    var rgh = texFor(w.set, 'r', tr[0], tr[1]);
    if (!diffuse && !nrm) return 0;
    if (diffuse) {
      /* 사진 평균색으로 나눠 원래 색의 밝기·색조를 유지한다 (야간 사무실 무드 보존).
         tint가 있으면 그 색을 그대로 쓴다(캔버스 텍스처라 재질색이 흰색인 면). */
      var c;
      if (w.tint) {
        c = new THREE.Color(w.tint);
        if (c.convertSRGBToLinear) c.convertSRGBToLinear();
      } else {
        c = (m.userData.__txBase || (m.userData.__txBase = m.color.clone())).clone();
        if (c.convertLinearToSRGB) c.convertLinearToSRGB();
        var pm = S.dMean;
        if (pm) {
          var f = function (b, p) { return p > 0.02 ? clamp(b / p, 0.3, 2.4) : 1; };
          c.setRGB(f(c.r, pm[0]), f(c.g, pm[1]), f(c.b, pm[2]));
        }
        if (c.convertSRGBToLinear) c.convertSRGBToLinear();
      }
      m.color.copy(c);
      m.map = diffuse;
    }
    if (nrm) { m.normalMap = nrm; m.normalScale = new THREE.Vector2(S.ns, S.ns); }
    if (rgh) {
      m.roughnessMap = rgh;
      m.roughness = clamp(m.roughness == null ? 0.9 : m.roughness, S.rmin || 0.6, 1);
    }
    m.needsUpdate = true;
    /* 색 사진이 아직 안 왔으면 노멀만 입혀 두고, 도착하면 다시 적용한다 */
    m.userData.__txDone = (wantD && !diffuse) ? 0 : 1;
    st.applied++;
    return 1;
  }

  function applyQueue() {
    var q = st.queue, n = 0;
    for (var i = 0; i < q.length; i++) { try { n += applyOne(q[i]); } catch (e) {} }
    return n;
  }

  /* mode: 'both'(기본, 색까지 사진) | 'relief'(노멀·거칠기만 — 색이 의미 있는 면) */
  function want(mat, set, tr, mode, tint) {
    if (!mat || !SETS[set] || off) return mat;
    if (!mat.userData) mat.userData = {};
    mat.userData.__tx = { set: set, tr: tr || [1, 1], mode: mode || 'both', tint: tint || 0 };
    mat.userData.__txDone = 0;
    st.queue.push(mat);
    if (!st.started) load();
    applyOne(mat);
    return mat;
  }

  function stats() {
    return {
      notex: !!off, loaded: Object.keys(st.ready), applied: st.applied,
      cache: Object.keys(st.cache).length, miss: st.miss, started: st.started
    };
  }

  return { want: want, stats: stats, applyQueue: applyQueue, sets: SETS };
})();
