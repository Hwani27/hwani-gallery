/* ===== 부장님 몰래 딴짓하기 — 복셀 3D 공통 빌더 =====
   Three.js(로컬 r128) 위에서 블록 캐릭터·사무실·미니게임 소품을 만든다.
   외부 CDN·이미지 의존 없음. 모든 텍스처는 canvas로 즉석 생성. */
var VX = (function () {
  'use strict';

  var geoCache = {};
  var matCache = {};

  function boxGeo(w, h, d) {
    var k = w.toFixed(3) + 'x' + h.toFixed(3) + 'x' + d.toFixed(3);
    if (!geoCache[k]) geoCache[k] = new THREE.BoxGeometry(w, h, d);
    return geoCache[k];
  }

  function mat(color, o) {
    o = o || {};
    var rough = o.rough == null ? 0.88 : o.rough;
    var metal = o.metal || 0;
    var em = o.emissive || 0;
    var ei = o.emissiveIntensity == null ? 1 : o.emissiveIntensity;
    var key = [color, rough, metal, em, ei, o.opacity == null ? 1 : o.opacity].join('|');
    if (!matCache[key]) {
      var m = new THREE.MeshStandardMaterial({ color: color, roughness: rough, metalness: metal });
      if (m.color.convertSRGBToLinear) m.color.convertSRGBToLinear();
      if (o.emissive) {
        m.emissive = new THREE.Color(em);
        if (m.emissive.convertSRGBToLinear) m.emissive.convertSRGBToLinear();
        m.emissiveIntensity = ei;
      }
      if (o.opacity != null && o.opacity < 1) { m.transparent = true; m.opacity = o.opacity; }
      matCache[key] = m;
    }
    return matCache[key];
  }

  function box(parent, w, h, d, color, x, y, z, o) {
    o = o || {};
    var material = (color && color.isMaterial) ? color : mat(color, o);
    var m = new THREE.Mesh(boxGeo(w, h, d), material);
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.receive !== false;
    parent.add(m);
    return m;
  }

  // 아래로 매달리는 팔다리 피벗(회전축이 위쪽 관절)
  function limb(parent, w, h, d, color, x, y, z, o) {
    var g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    box(g, w, h, d, color, 0, -h / 2, 0, o);
    return g;
  }

  function pivot(parent, x, y, z) {
    var g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }

  function canvasTex(w, h, draw) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    draw(g, w, h);
    var t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
    g.closePath();
  }

  // 이름표 스프라이트 (항상 앞에 보이게)
  function label(text, color, o) {
    o = o || {};
    var w = 256, h = 72;
    var tex = canvasTex(w, h, function (g) {
      g.clearRect(0, 0, w, h);
      g.fillStyle = o.bg || 'rgba(8,12,20,.86)';
      rr(g, 8, 10, w - 16, h - 20, 18); g.fill();
      g.strokeStyle = color || '#ffd24a'; g.lineWidth = 4; g.stroke();
      g.fillStyle = color || '#ffd24a';
      g.font = '800 34px "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(text, w / 2, h / 2 + 1);
    });
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
    sp.scale.set(o.w || 1.0, (o.w || 1.0) * h / w, 1);
    sp.renderOrder = 30;
    return sp;
  }

  // 말풍선형 경고 스프라이트 (❗)
  function markSprite(kind) {
    var tex = canvasTex(128, 128, function (g) {
      g.clearRect(0, 0, 128, 128);
      g.beginPath(); g.arc(64, 60, 38, 0, Math.PI * 2);
      g.fillStyle = kind === 'q' ? 'rgba(255,210,74,.95)' : 'rgba(255,92,102,.97)';
      g.fill();
      g.lineWidth = 6; g.strokeStyle = 'rgba(10,14,22,.85)'; g.stroke();
      g.fillStyle = '#1a1205';
      g.font = '900 54px system-ui,-apple-system,sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(kind === 'q' ? '?' : '!', 64, 62);
    });
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
    sp.scale.set(0.34, 0.34, 1);
    sp.renderOrder = 31;
    return sp;
  }

  // ===== 복셀 사람 =====
  // o: {suit, shirt, tie, skin, hair, pants, shoe, glasses, bald, cap, belly, scale, badge}
  function humanoid(o) {
    o = o || {};
    var s = o.scale || 1;
    var skin = o.skin == null ? 0xf0c49b : o.skin;
    var hair = o.hair == null ? 0x2a231d : o.hair;
    var suit = o.suit == null ? 0x2a3550 : o.suit;
    var shirt = o.shirt == null ? 0xeef2f8 : o.shirt;
    var tie = o.tie == null ? 0xc23b45 : o.tie;
    var pants = o.pants == null ? suit : o.pants;
    var shoe = o.shoe == null ? 0x191a20 : o.shoe;

    var root = new THREE.Group();
    var model = new THREE.Group();
    model.scale.setScalar(s);
    root.add(model);

    // 다리 (피벗 = 엉덩이)
    var legL = limb(model, 0.2, 0.66, 0.24, pants, -0.13, 0.76, 0);
    var legR = limb(model, 0.2, 0.66, 0.24, pants, 0.13, 0.76, 0);
    box(legL, 0.23, 0.12, 0.34, shoe, 0, -0.72, 0.05);
    box(legR, 0.23, 0.12, 0.34, shoe, 0, -0.72, 0.05);

    // 몸통
    var torso = pivot(model, 0, 0.76, 0);
    box(torso, 0.54, 0.62, 0.32, suit, 0, 0.31, 0);
    if (o.belly) box(torso, 0.44, 0.26, 0.1, suit, 0, 0.16, 0.16, { rough: 0.92 });
    // 셔츠 V + 넥타이
    box(torso, 0.22, 0.36, 0.024, shirt, 0, 0.44, 0.166);
    if (o.tie !== false) {
      box(torso, 0.11, 0.08, 0.03, tie, 0, 0.55, 0.175);
      box(torso, 0.075, 0.3, 0.03, tie, 0, 0.36, 0.178);
    }
    // 재킷 라펠
    box(torso, 0.1, 0.34, 0.03, suit, -0.11, 0.44, 0.168).rotation.z = 0.16;
    box(torso, 0.1, 0.34, 0.03, suit, 0.11, 0.44, 0.168).rotation.z = -0.16;
    // 벨트 + 단추
    box(torso, 0.56, 0.07, 0.34, 0x1f232c, 0, 0.02, 0);
    box(torso, 0.055, 0.055, 0.02, 0xd9c27a, 0, 0.115, 0.17, { metal: 0.6, rough: 0.4 });
    if (o.badge) {
      // 사원증
      box(torso, 0.1, 0.14, 0.02, 0xf2f4f8, 0.18, 0.4, 0.175);
      box(torso, 0.1, 0.03, 0.021, o.badge, 0.18, 0.44, 0.178);
    }

    // 팔 (피벗 = 어깨)
    var armL = pivot(torso, -0.34, 0.54, 0);
    box(armL, 0.15, 0.56, 0.18, suit, 0, -0.27, 0);
    box(armL, 0.16, 0.13, 0.19, skin, 0, -0.6, 0);
    var armR = pivot(torso, 0.34, 0.54, 0);
    box(armR, 0.15, 0.56, 0.18, suit, 0, -0.27, 0);
    box(armR, 0.16, 0.13, 0.19, skin, 0, -0.6, 0);

    // 머리
    var head = pivot(torso, 0, 0.66, 0);
    box(head, 0.46, 0.46, 0.42, skin, 0, 0.23, 0);
    // 눈·눈썹·입
    box(head, 0.06, 0.075, 0.02, 0x24201c, -0.1, 0.26, 0.212, { cast: false });
    box(head, 0.06, 0.075, 0.02, 0x24201c, 0.1, 0.26, 0.212, { cast: false });
    box(head, 0.11, 0.028, 0.02, hair, -0.1, 0.335, 0.212, { cast: false });
    box(head, 0.11, 0.028, 0.02, hair, 0.1, 0.335, 0.212, { cast: false });
    box(head, 0.11, 0.028, 0.02, 0x8d5b4a, 0, 0.12, 0.212, { cast: false });
    // 머리카락
    if (!o.bald) {
      box(head, 0.49, 0.11, 0.45, hair, 0, 0.475, 0);
      box(head, 0.49, 0.24, 0.07, hair, 0, 0.36, -0.2);
      box(head, 0.04, 0.2, 0.42, hair, -0.235, 0.36, 0);
      box(head, 0.04, 0.2, 0.42, hair, 0.235, 0.36, 0);
    } else {
      box(head, 0.42, 0.06, 0.38, hair, 0, 0.455, -0.02);
      box(head, 0.42, 0.18, 0.06, hair, 0, 0.35, -0.2);
    }
    if (o.cap) {
      box(head, 0.5, 0.12, 0.46, o.cap, 0, 0.5, 0);
      box(head, 0.42, 0.05, 0.24, o.cap, 0, 0.45, 0.26);
    }
    if (o.glasses) {
      box(head, 0.15, 0.12, 0.022, 0x232833, -0.105, 0.265, 0.222, { cast: false, rough: 0.4, metal: 0.3 });
      box(head, 0.15, 0.12, 0.022, 0x232833, 0.105, 0.265, 0.222, { cast: false, rough: 0.4, metal: 0.3 });
      box(head, 0.06, 0.025, 0.02, 0x232833, 0, 0.27, 0.222, { cast: false });
      box(head, 0.03, 0.03, 0.19, 0x232833, -0.235, 0.27, 0.13, { cast: false });
      box(head, 0.03, 0.03, 0.19, 0x232833, 0.235, 0.27, 0.13, { cast: false });
    }
    if (o.mustache) box(head, 0.15, 0.035, 0.02, hair, 0, 0.175, 0.214, { cast: false });

    var ud = {
      root: root, model: model, torso: torso, head: head,
      legL: legL, legR: legR, armL: armL, armR: armR, s: s
    };
    root.userData = ud;
    return root;
  }

  // 발 위치(월드) — 그림자/배치용
  function feetOffset(root) {
    var v = new THREE.Vector3();
    root.position.clone(v);
    return v;
  }

  // ===== 큐브 파편 =====
  function Burst(scene) {
    this.scene = scene;
    this.list = [];
    this.pool = [];
  }
  Burst.prototype.spawn = function (x, y, z, color, n, o) {
    o = o || {};
    var size = o.size || 0.09, spd = o.speed || 2.4, life = o.life || 0.7;
    n = Math.min(n || 8, 26);
    for (var i = 0; i < n; i++) {
      var m = this.pool.pop();
      if (!m) {
        m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }));
        m.castShadow = false;
      }
      m.material.color.setHex(color);
      m.scale.setScalar(size * (0.55 + Math.random() * 0.9));
      m.position.set(x, y, z);
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      this.scene.add(m);
      this.list.push({
        m: m, vx: (Math.random() - 0.5) * spd * 2.1, vy: (0.35 + Math.random()) * spd,
        vz: (Math.random() - 0.5) * spd * 2.1, life: life * (0.75 + Math.random() * 0.5),
        age: 0, spin: (Math.random() - 0.5) * 9, base: m.scale.x
      });
    }
  };
  Burst.prototype.update = function (dt) {
    for (var i = this.list.length - 1; i >= 0; i--) {
      var p = this.list[i];
      p.age += dt;
      if (p.age >= p.life) {
        this.scene.remove(p.m);
        this.pool.push(p.m);
        this.list.splice(i, 1);
        continue;
      }
      p.vy -= 8.5 * dt;
      p.m.position.x += p.vx * dt;
      p.m.position.y += p.vy * dt;
      p.m.position.z += p.vz * dt;
      if (p.m.position.y < 0.03) { p.m.position.y = 0.03; p.vy *= -0.32; p.vx *= 0.7; p.vz *= 0.7; }
      p.m.rotation.x += p.spin * dt;
      p.m.rotation.z += p.spin * 0.6 * dt;
      var k = 1 - p.age / p.life;
      p.m.scale.setScalar(p.base * Math.max(0.15, k));
    }
  };

  // 사무실 바닥 타일 텍스처
  function tileTex() {
    return canvasTex(256, 256, function (g, w, h) {
      g.fillStyle = '#39465b'; g.fillRect(0, 0, w, h);
      var n = 4, s = w / n;
      for (var y = 0; y < n; y++) {
        for (var x = 0; x < n; x++) {
          var odd = (x + y) % 2;
          g.fillStyle = odd ? '#334053' : '#3b4960';
          g.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
          g.fillStyle = 'rgba(255,255,255,.03)';
          g.fillRect(x * s + 2, y * s + 2, s - 4, 3);
        }
      }
      g.strokeStyle = 'rgba(10,14,20,.35)'; g.lineWidth = 3;
      for (var i = 0; i <= n; i++) {
        g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke();
        g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke();
      }
    });
  }

  function textTex(text, o) {
    o = o || {};
    var w = o.w || 512, h = o.h || 128;
    return canvasTex(w, h, function (g) {
      if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); }
      if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw || 8; g.strokeRect(4, 4, w - 8, h - 8); }
      g.fillStyle = o.color || '#ffd24a';
      g.font = (o.font || '900 64px') + ' "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(text, w / 2, h / 2 + 2);
    });
  }

  // 5각 별(얇은 돌출)
  function starGeo(r1, r2, depth) {
    var shape = new THREE.Shape();
    for (var i = 0; i < 10; i++) {
      var r = i % 2 ? r2 : r1;
      var a = i / 10 * Math.PI * 2 - Math.PI / 2;
      var x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: depth || 0.08, bevelEnabled: false });
  }

  function flatText(text, o) {
    o = o || {};
    var tex = textTex(text, o);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(o.wu || 1.6, o.hu || 0.4), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    return m;
  }

  function roundRect(g, x, y, w, h, r) { rr(g, x, y, w, h, r); }

  return {
    mat: mat, box: box, limb: limb, pivot: pivot, humanoid: humanoid,
    label: label, mark: markSprite, Burst: Burst, tileTex: tileTex,
    canvasTex: canvasTex, textTex: textTex, flatText: flatText, roundRect: roundRect, starGeo: starGeo
  };
})();
