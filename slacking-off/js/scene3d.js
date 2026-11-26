/* ===== 부장님 몰래 딴짓하기 — 3D 복셀 씬 =====
   OfficeScene : 상단 사무실 복도(잼부장·잼사장·잼대리 걷기/감시/발각 연출)
   MiniScene   : 중앙 모니터 안 3D 딴짓 창(점프 / 코인 차트 사격 / 핫딜 박스 격파)
   Slack3D     : 두 씬을 하나의 rAF 루프로 돌리는 컨트롤러 */
var Slack3D = (function () {
  'use strict';

  var office = null, mini = null, rafId = 0, lastTs = 0, started = false;

  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    if (document.hidden) return;
    if (office && office.frame) office.frame(dt);
    if (mini && mini.frame) mini.frame(dt);
  }

  /* =========================================================
     사무실 씬
     ========================================================= */
  function OfficeScene(host) {
    this.host = host;
    this.ok = false;
    this.t = 0;
    this.stage = 'mon';
    this.checker = 'jambujang';
    this.mode = 'idle';
    this.zoom = 0; this.zoomTarget = 0;
    this.shake = 0;
    this.burst = null;
    var self = this;
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    } catch (e) {
      try { this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true }); } catch (e2) { return; }
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    if (THREE.sRGBEncoding) this.renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping) { this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.04; }
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'gl-canvas';
    host.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0f18, 8, 20); this.scene.fog.color.convertSRGBToLinear();
    this.camera = new THREE.PerspectiveCamera(41, 2.4, 0.1, 60);
    this.cameraBase = { x: 0.18, y: 2.02, z: 4.7, ly: 1.04, fov: 41 };
    this.camera.position.set(this.cameraBase.x, this.cameraBase.y, this.cameraBase.z);
    this.camera.lookAt(new THREE.Vector3(0, this.cameraBase.ly, -1.6));

    this.build();
    this.burst = new VX.Burst(this.scene);
    this.chars = {};
    this.makeChars();

    this.ok = true;
    this.resize();
    this._resize = function () { self.resize(); };
    window.addEventListener('resize', this._resize);
    window.addEventListener('orientationchange', this._resize);
    if (window.ResizeObserver) {
      try { this._ro = new ResizeObserver(this._resize); this._ro.observe(host); } catch (e) {}
    }
  }

  OfficeScene.prototype.resize = function () {
    if (!this.ok || !this.host) return;
    var w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  OfficeScene.prototype.build = function () {
    var S = this.scene;
    var floorTex = VX.tileTex();
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(4.2, 8);
    var floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.96 });
    /* CC0 타일 사진이 도착하면 바닥만 갈아 끼운다 (색은 사무실 야간 톤으로) */
    if (window.TX) TX.want(floorMat, 'tile', [4.2, 8], 'both', 0xaebdd8);
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 15.4), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -1.4);
    floor.receiveShadow = true;
    S.add(floor);

    // 복도 카펫
    VX.box(S, 1.55, 0.012, 8.6, 0x243a5c, 0.05, 0.012, -2.7, { cast: false, receive: true, tex: 'carpet', tr: [1.6, 8] });
    VX.box(S, 1.62, 0.006, 0.08, 0x3c5a86, 0.05, 0.022, 1.55, { cast: false });
    VX.box(S, 1.62, 0.006, 0.08, 0x3c5a86, 0.05, 0.022, -6.9, { cast: false });
    // 벽 포스터
    VX.box(S, 0.05, 0.78, 0.62, 0xdfe7f4, -3.55, 1.72, -2.6, { cast: false });
    VX.box(S, 0.02, 0.62, 0.46, 0x1f4f7a, -3.5, 1.72, -2.6, { emissive: 0x153a5a, emissiveIntensity: 0.25, cast: false });
    var ceil = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 15.4), VX.mat(0x141b26, { rough: 1, tex: 'concrete', tm: 'relief', tr: [5, 9] }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, 3.05, -1.4);
    S.add(ceil);

    // 벽
    VX.box(S, 7.6, 3.05, 0.24, 0x252f3f, 0, 1.52, -7.2, { tex: 'plaster', tr: [3.4, 1.4] });
    VX.box(S, 0.24, 3.05, 15.4, 0x232d3c, -3.7, 1.52, -1.4, { tex: 'plaster', tr: [7, 1.4] });
    VX.box(S, 0.24, 3.05, 15.4, 0x232d3c, 3.7, 1.52, -1.4, { tex: 'plaster', tr: [7, 1.4] });
    VX.box(S, 7.6, 0.14, 0.1, 0x475570, 0, 0.08, -7.06);
    // 벽 하단 몰딩
    VX.box(S, 0.06, 1.0, 15.2, 0x323d4f, -3.56, 0.5, -1.4, { cast: false });
    VX.box(S, 0.06, 1.0, 15.2, 0x323d4f, 3.56, 0.5, -1.4, { cast: false });

    // 부장실 문
    VX.box(S, 1.62, 2.3, 0.16, 0x4d5d78, -1.35, 1.15, -7.06, { tex: 'wood', tm: 'relief', tr: [1.4, 2] });
    VX.box(S, 1.3, 2.08, 0.1, 0x36445b, -1.35, 1.04, -7.0, { tex: 'wood', tm: 'relief', tr: [1.2, 1.8] });
    VX.box(S, 0.98, 0.7, 0.04, 0x7fb6d6, -1.35, 1.62, -6.94, { rough: 0.25, metal: 0.2 });
    VX.box(S, 0.06, 0.9, 0.03, 0x2b374a, -1.35, 0.62, -6.94);
    VX.box(S, 0.1, 0.1, 0.16, 0xd7a93f, -1.95, 1.0, -6.9, { metal: 0.7, rough: 0.3 });
    var doorSign = VX.flatText('부장실', { w: 512, h: 128, color: '#ffe6a6', bg: 'rgba(16,22,32,.9)', stroke: 'rgba(255,210,74,.7)', lw: 6, wu: 0.86, hu: 0.22 });
    doorSign.position.set(-2.55, 2.08, -7.06);
    S.add(doorSign);

    // 벽시계
    var clockTex = VX.canvasTex(192, 192, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      g.beginPath(); g.arc(96, 96, 82, 0, Math.PI * 2); g.fillStyle = '#e9eef8'; g.fill();
      g.lineWidth = 8; g.strokeStyle = '#2a3342'; g.stroke();
      for (var i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2;
        g.beginPath(); g.moveTo(96 + Math.cos(a) * 62, 96 + Math.sin(a) * 62);
        g.lineTo(96 + Math.cos(a) * 72, 96 + Math.sin(a) * 72);
        g.lineWidth = 6; g.strokeStyle = '#3b4758'; g.stroke();
      }
      g.strokeStyle = '#1f2733'; g.lineWidth = 9; g.lineCap = 'round';
      g.beginPath(); g.moveTo(96, 96); g.lineTo(96 + Math.cos(-2.4) * 42, 96 + Math.sin(-2.4) * 42); g.stroke();
      g.lineWidth = 6;
      g.beginPath(); g.moveTo(96, 96); g.lineTo(96 + Math.cos(0.9) * 58, 96 + Math.sin(0.9) * 58); g.stroke();
      g.beginPath(); g.arc(96, 96, 7, 0, Math.PI * 2); g.fillStyle = '#c23b45'; g.fill();
    });
    var clock = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: clockTex, transparent: true }));
    clock.position.set(0.45, 2.3, -7.05);
    S.add(clock);

    var sign = VX.flatText('야근 금지', { w: 512, h: 160, color: '#ffe27a', bg: 'rgba(18,24,34,.92)', stroke: 'rgba(255,210,74,.55)', lw: 6, wu: 1.24, hu: 0.38 });
    sign.position.set(2.05, 2.16, -7.05);
    S.add(sign);

    // 형광등
    this.lamps = [];
    for (var zi = 0; zi < 3; zi++) {
      var z = 1.2 - zi * 3.2;
      VX.box(S, 1.8, 0.09, 0.3, 0xfff2c4, 0, 3.0, z, { emissive: 0xfff0c0, emissiveIntensity: 1.5, cast: false });
      var pl = new THREE.PointLight(0xffe7b8, 0.5, 9, 2);
      pl.position.set(0, 2.85, z);
      S.add(pl);
      this.lamps.push(pl);
    }
    // 문 앞 조명
    var doorLight = new THREE.PointLight(0xffd9a0, 0.45, 6, 2);
    doorLight.position.set(-1.3, 2.1, -6.4);
    S.add(doorLight);

    // 파티션(앞쪽 큐비클)
    var partMat = 0x3f4c60;
    [-1, 1].forEach(function (sx) {
      var x = sx * 2.6;
      VX.box(S, 2.1, 0.82, 0.1, partMat, x, 0.42, 1.9, { tex: 'concrete', tr: [2, 0.8] });
      VX.box(S, 2.16, 0.06, 0.16, 0x4c5a70, x, 0.86, 1.9);
      VX.box(S, 1.8, 0.4, 0.03, 0x333f51, x, 0.46, 1.845, { cast: false });
      VX.box(S, 0.18, 0.18, 0.02, 0xffe27a, x - 0.5, 0.64, 1.84, { cast: false });
      VX.box(S, 0.16, 0.16, 0.02, 0x9ee0ff, x + 0.62, 0.68, 1.84, { cast: false });
    });

    // 중간 복도변 파티션(깊이감)
    [-1, 1].forEach(function (sx) {
      var x = sx * 2.75;
      VX.box(S, 1.5, 0.78, 0.09, 0x3a4659, x, 0.4, -3.4, { tex: 'concrete', tr: [1.6, 0.8] });
      VX.box(S, 1.56, 0.06, 0.14, 0x4b5870, x, 0.82, -3.4);
      VX.box(S, 1.2, 0.36, 0.02, 0x2f3a4b, x, 0.44, -3.455, { cast: false });
      VX.box(S, 0.34, 0.26, 0.2, 0x1d2430, x, 0.96, -3.45);
      VX.box(S, 0.3, 0.22, 0.02, 0x5f9bc4, x, 0.96, -3.335, { emissive: 0x2f6f9a, emissiveIntensity: 0.5, cast: false });
    });

    // 사이드 큐비클 책상 + 모니터
    [-1, 1].forEach(function (sx) {
      var dx = sx * 2.85;
      VX.box(S, 1.0, 0.07, 1.3, 0x7a5b3e, dx, 0.72, -0.4, { tex: 'wood', tr: [1, 1.3] });
      VX.box(S, 0.06, 0.72, 0.06, 0x4f3d29, dx - 0.42, 0.36, -0.9);
      VX.box(S, 0.06, 0.72, 0.06, 0x4f3d29, dx + 0.42, 0.36, -0.9);
      VX.box(S, 0.06, 0.72, 0.06, 0x4f3d29, dx - 0.42, 0.36, 0.1);
      VX.box(S, 0.06, 0.72, 0.06, 0x4f3d29, dx + 0.42, 0.36, 0.1);
      // 모니터 (복도 쪽을 바라봄)
      VX.box(S, 0.06, 0.42, 0.06, 0x1d2430, dx - sx * 0.2, 0.94, -0.15);
      VX.box(S, 0.08, 0.4, 0.62, 0x1d2430, dx - sx * 0.22, 1.17, -0.15);
      VX.box(S, 0.02, 0.34, 0.56, 0x67b6e6, dx - sx * 0.27, 1.17, -0.15, { emissive: 0x2f6f9a, emissiveIntensity: 0.55, cast: false });
      // 의자
      VX.box(S, 0.42, 0.09, 0.42, 0x2b3444, dx + sx * 0.1, 0.5, 0.55);
      VX.box(S, 0.08, 0.5, 0.08, 0x39465c, dx + sx * 0.28, 0.55, 0.75);
      VX.box(S, 0.44, 0.5, 0.09, 0x39465c, dx + sx * 0.1, 0.86, 0.78);
      VX.box(S, 0.34, 0.34, 0.34, 0xcfd8e6, dx - sx * 0.1, 0.85, 0.18);
      VX.box(S, 0.3, 0.34, 0.26, 0x3a4a5e, dx + sx * 0.2, 0.83, -0.6);
    });
    // 복도 쪽 서류 캐비닛
    VX.box(S, 0.6, 1.15, 0.9, 0x59677e, 3.15, 0.58, -2.2, { tex: 'metal', tm: 'relief', tr: [0.6, 1.1] });
    VX.box(S, 0.62, 0.05, 0.92, 0x7b8ba6, 3.15, 0.63, -2.2, { cast: false });
    VX.box(S, 0.62, 0.05, 0.92, 0x7b8ba6, 3.15, 0.95, -2.2, { cast: false });

    // 화분
    var plant = new THREE.Group();
    plant.position.set(2.85, 0, -6.35);
    S.add(plant);
    VX.box(plant, 0.44, 0.44, 0.44, 0x9a6644, 0, 0.22, 0);
    VX.box(plant, 0.48, 0.07, 0.48, 0x7a4f36, 0, 0.45, 0);
    VX.box(plant, 0.12, 0.7, 0.12, 0x4a6b3a, 0, 0.8, 0);
    var leaf = [[0, 1.25, 0.34, 0.42], [-0.24, 1.05, 0.3, 0.4], [0.24, 1.08, 0.32, 0.4], [0, 1.5, 0.3, 0.36]];
    leaf.forEach(function (L) {
      VX.box(plant, 0.4, 0.14, 0.3, 0x3f8f4e, L[0], L[1], 0).rotation.z = L[2];
    });
    VX.box(plant, 0.26, 0.24, 0.26, 0x4ea35c, 0.3, 1.28, 0.05).rotation.z = -0.5;
    VX.box(plant, 0.26, 0.24, 0.26, 0x4ea35c, -0.32, 1.3, 0.05).rotation.z = 0.5;

    // 정수기 · 프린터
    VX.box(S, 0.6, 0.95, 0.55, 0xdfe6f2, -3.05, 0.47, -4.4);
    VX.box(S, 0.34, 0.5, 0.34, 0x7fb6e6, -3.05, 1.17, -4.4, { rough: 0.3 });
    VX.box(S, 0.14, 0.1, 0.1, 0x2a6fa8, -3.05, 0.78, -4.12);
    VX.box(S, 0.95, 0.62, 0.66, 0xb8c2d2, 2.95, 0.31, -3.6);
    VX.box(S, 0.7, 0.08, 0.4, 0x8b96a8, 2.95, 0.66, -3.45);
    VX.box(S, 0.5, 0.04, 0.34, 0xffffff, 2.95, 0.72, -3.42, { cast: false });

    // 조명
    var hemi = new THREE.HemisphereLight(0x9fb8e0, 0x241f1a, 0.5);
    S.add(hemi);
    S.add(new THREE.AmbientLight(0x7f8fb0, 0.22));
    var dir = new THREE.DirectionalLight(0xfff1d2, 0.82);
    dir.position.set(2.6, 6.2, 3.2);
    dir.castShadow = true;
    dir.shadow.mapSize.set(512, 512);
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 18;
    dir.shadow.camera.left = -5;
    dir.shadow.camera.right = 5;
    dir.shadow.camera.top = 6;
    dir.shadow.camera.bottom = -3;
    dir.shadow.bias = -0.0012;
    dir.shadow.normalBias = 0.03;
    S.add(dir);
    S.add(dir.target);
    dir.target.position.set(0, 1, -2);
  };

  OfficeScene.prototype.makeChars = function () {
    var S = this.scene;
    var defs = {
      jambujang: {
        name: '잼부장', color: '#ffd24a',
        look: { suit: 0x2b3650, tie: 0xc23b45, hair: 0x241f1a, glasses: true, belly: true, badge: 0xffd24a, scale: 1.0 },
        start: { x: -0.25, z: -6.15 }
      },
      jamsajang: {
        name: '잼사장', color: '#bda8ff',
        look: { suit: 0x3b3160, tie: 0xd7a93f, hair: 0xa9aebb, bald: true, badge: 0xbda8ff, scale: 1.04 },
        start: { x: 1.55, z: -6.35 }
      },
      jamdaeri: {
        name: '잼대리', color: '#69d8ff',
        look: { suit: 0x3f7893, shirt: 0xdff4ff, tie: false, hair: 0x4a3524, badge: 0x69d8ff, scale: 0.94 },
        start: { x: 2.05, z: 0.95 }
      },
      /* 엔딩 컷신용 주인공(잼인턴) — 평소엔 숨겨 두고 칼퇴 연출에서만 걷는다 */
      jamintern: {
        name: '잼인턴', color: '#ffb3c8',
        look: { suit: 0x3f6fd8, shirt: 0xdfe9ff, tie: false, hair: 0x2a231d, badge: 0x8fd0ff, scale: 0.98 },
        start: { x: 2.35, z: 1.5 }
      }
    };
    for (var k in defs) {
      (function (key, d) {
        var root = VX.humanoid(d.look);
        root.position.set(d.start.x, 0, d.start.z);
        root.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
        S.add(root);
        var lb = VX.label(d.name, d.color, { w: 0.92 });
        lb.position.set(0, 2.42, 0);
        root.add(lb);
        var mk = VX.mark('!');
        mk.position.set(0.34, 2.12, 0);
        mk.visible = false;
        root.add(mk);
        var ch = {
          key: key, name: d.name, color: d.color, root: root, ud: root.userData,
          label: lb, mark: mk, walk: 0, moving: false, speed: 0, scan: 0,
          target: { x: d.start.x, z: d.start.z }, facing: 0, faceT: 0,
          visible: key !== 'jamsajang' && key !== 'jamintern', mode: 'far'
        };
        // 잼대리 치킨(수요일)
        if (key === 'jamdaeri') {
          var chk = new THREE.Group();
          var drum = VX.box(chk, 0.16, 0.2, 0.16, 0xa8622c, 0, 0, 0);
          VX.box(chk, 0.05, 0.14, 0.05, 0xf2ead2, 0, -0.14, 0);
          drum.castShadow = false;
          chk.position.set(0.1, -0.66, 0.02);
          ch.ud.armR.add(chk);
          chk.visible = false;
          ch.chicken = chk;
          lb.position.set(0, 2.3, 0);
        }
        ch.root.visible = ch.visible;
        this.chars[key] = ch;
      }).call(this, k, defs[k]);
    }
  };

  OfficeScene.prototype.setStage = function (kind) {
    this.stage = kind;
    if (this.chars.jamdaeri && this.chars.jamdaeri.chicken) this.chars.jamdaeri.chicken.visible = (kind === 'chart');
  };

  OfficeScene.prototype.reset = function () {
    this.zoom = 0; this.zoomTarget = 0; this.shake = 0;
    this.mode = 'idle';
    this.cineKind = null; this.cineT = 0;
    var c = this.chars;
    for (var k in c) {
      c[k].mark.visible = false;
      c[k].scan = 0;
      c[k].target = { x: c[k].root.position.x, z: c[k].root.position.z };
      c[k].moveSpeed = 0;
      if (k === 'jambujang') { c[k].root.position.set(-0.25, 0, -6.15); c[k].visible = false; }
      if (k === 'jamsajang') { c[k].root.position.set(1.55, 0, -6.35); c[k].visible = false; }
      if (k === 'jamdaeri') { c[k].root.position.set(2.05, 0, 0.95); c[k].visible = true; }
      if (k === 'jamintern') { c[k].root.position.set(2.35, 0, 1.5); c[k].visible = false; }
      c[k].root.visible = c[k].visible;
      c[k].root.rotation.y = 0;
      c[k].ud.head.rotation.set(0, 0, 0);
      c[k].ud.torso.rotation.set(0, 0, 0);
    }
    this.setCamera(0);
  };

  OfficeScene.prototype.begin = function (bosses) {
    this.reset();
    this.mode = 'play';
    this.bosses = bosses || ['jambujang'];
    var b = this.chars[this.checker];
    if (b) { b.visible = true; b.root.visible = true; b.root.position.set(-0.25, 0, -6.15); }
    if (this.bosses.length > 1) {
      var s = this.chars.jamsajang;
      s.visible = true; s.root.visible = true;
      s.root.position.set(1.55, 0, -6.35);
    }
    this.setBoss(this.checker, 'far', 0.4);
  };

  OfficeScene.prototype.setBoss = function (who, pos, dur) {
    if (!this.ok) return;
    this.checker = who;
    var b = this.chars[who];
    if (!b) return;
    b.visible = true;
    b.root.visible = true;
    b.mark.visible = (pos === 'warn' || pos === 'peek' || pos === 'rush');
    b.scan = (pos === 'warn') ? 1 : 0;
    var other = this.chars[who === 'jambujang' ? 'jamsajang' : 'jambujang'];
    if (other && this.bosses && this.bosses.length > 1 && other !== b) {
      other.visible = true;
      other.root.visible = true;
      other.mark.visible = false;
      other.target = { x: other.key === 'jamsajang' ? 1.55 : -0.25, z: -6.35 };
      other.moveSpeed = 1.6;
      other.mode = 'far';
    } else if (other) {
      other.root.visible = false;
    }
    var tg, speed;
    if (pos === 'far') {
      tg = { x: who === 'jamsajang' ? 1.55 : -0.25, z: -6.15 };
      speed = 3.2; b.scan = 0;
    } else if (pos === 'warn') {
      tg = { x: -0.42, z: -0.92 };
      speed = 6.0;
      dur = dur || 1.2;
      // 경고 시간 안에 문 앞까지 도착하도록 속도 조정
      var d0 = Math.abs(tg.z - b.root.position.z) + Math.abs(tg.x - b.root.position.x);
      speed = Math.max(3.6, d0 / Math.max(0.5, dur * 0.82));
    } else if (pos === 'peek') {
      tg = { x: -0.2, z: 0.18 };
      speed = 5.2;
    } else if (pos === 'near') {
      tg = { x: -0.72, z: -1.5 };
      speed = 3.4;
    } else if (pos === 'leave') {
      tg = { x: -2.9, z: -3.2 };
      speed = 3.2;
    } else if (pos === 'rush') {
      // 커피 타러 간 줄 알았는데… 옆문에서 급복귀
      b.root.position.set(3.1, 0, -1.5);
      tg = { x: -0.34, z: -0.95 };
      speed = 7.6;
      b.scan = 1;
    } else if (pos === 'coffee') {
      tg = { x: -3.0, z: -3.4 };
      speed = 3.0;
      b.scan = 0;
    } else if (pos === 'sneak') {
      // 뒤에서 소리 없이 접근 — 경고 표시는 reveal() 전까지 숨김
      b.root.position.set(-2.95, 0, 0.62);
      tg = { x: 0.14, z: 1.2 };
      var dd = Math.abs(tg.z - b.root.position.z) + Math.abs(tg.x - b.root.position.x);
      speed = Math.max(1.6, dd / Math.max(0.6, (dur || 1.4) * 0.88));
      b.mark.visible = false;
      b.scan = 0;
    } else {
      b.root.visible = false;
      return;
    }
    b.target = tg;
    b.moveSpeed = speed;
    b.mode = pos;
  };

  OfficeScene.prototype.reveal = function () {
    var b = this.chars[this.checker];
    if (!b) return;
    b.mark.visible = true;
    b.scan = 1;
    this.shake = 0.24;
  };

  OfficeScene.prototype.beginCaught = function () {
    this.mode = 'caught';
    this.zoomTarget = 1;
    this.shake = 0.32;
    var b = this.chars[this.checker];
    if (b) {
      b.mark.visible = true;
      b.target = { x: 0.1, z: 0.75 };
      b.moveSpeed = 9;
      b.mode = 'caught';
      b.scan = 0;
    }
    this.burst.spawn(-0.2, 1.5, 0.8, 0xff5c66, 8, { size: 0.07, speed: 2.6 });
  };

  OfficeScene.prototype.setCamera = function (k) {
    var b = this.cameraBase;
    this.camera.fov = b.fov - 12 * k;
    this.camera.position.set(b.x - 0.1 * k, b.y - 0.3 * k, b.z - 0.85 * k);
    var ly = b.ly + 0.34 * k;
    this.camera.lookAt(new THREE.Vector3(0.05 * k, ly, -1.1));
    this.camera.updateProjectionMatrix();
  };

  /* =========================================================
     컷신 카메라 — 스테이지 인트로(3 앵글 컷) / 엔딩(회전·줌아웃)
     실제 OfficeScene 캔버스 위에서 실시간으로 돌린다.
     ========================================================= */
  OfficeScene.prototype.showChar = function (k, v) {
    var c = this.chars[k];
    if (!c) return null;
    c.visible = !!v;
    c.root.visible = !!v;
    return c;
  };

  function cLerp(a, b, k) { return a + (b - a) * k; }
  function cEase(k) { return k * k * (3 - 2 * k); }

  function shot(p0, p1, l0, l1, f0, f1) {
    return { p0: p0, p1: p1, l0: l0, l1: l1, f0: f0, f1: f1 };
  }

  /* 인트로 3앵글: ① 사무실 전체 와이드 → ② 복도 끝 부장님 줌인 → ③ 책상 오버더숄더 */
  var CINE_INTRO = [
    shot([-2.45, 2.7, 7.15], [-1.7, 2.42, 6.1], [-0.1, 1.12, -1.5], [-0.3, 1.2, -2.7], 49, 43),
    shot([1.25, 2.2, 4.5], [0.52, 1.74, 2.8], [-0.35, 1.3, -3.4], [-0.45, 1.36, -2.05], 43, 31),
    shot([-2.0, 1.62, 5.35], [-1.85, 1.55, 5.1], [2.55, 1.02, -0.25], [2.45, 1.0, -0.4], 44, 41)
  ];
  /* 엔딩 3앵글: ① 부장님 로우앵글 → ② 잼인턴 퇴근 트래킹 → ③ 회전·줌아웃 와이드 */
  var CINE_END = [
    shot([0.45, 1.4, 1.75], [0.2, 1.45, 1.15], [-0.85, 1.5, -2.2], [-0.8, 1.45, -2.05], 48, 42),
    shot([3.25, 1.9, 5.45], [3.05, 1.82, 5.1], [-1.15, 1.02, -2.1], [-1.05, 1.0, -2.35], 42, 38),
    shot([3.3, 2.5, 5.7], [2.3, 3.4, 5.3], [-1.0, 0.95, -2.0], [-0.8, 0.9, -2.35], 44, 54)
  ];

  OfficeScene.prototype.setCine = function (kind, dur) {
    if (!this.ok) return;
    this.cineKind = kind;
    this.cineT = 0;
    this.cineStartT = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    this.cineDur = dur || (kind === 'end' ? 4.9 : 4.3);
    this.cineShots = (kind === 'end') ? CINE_END : CINE_INTRO;
    this.zoom = 0; this.zoomTarget = 0; this.shake = 0;
    this.cineHold = null;
    this._cineStop = 0;
    this.confettiT = 0;
    var c = this.chars, two = !!(this.bosses && this.bosses.length > 1);
    for (var lk in c) { if (c[lk].label) c[lk].label.visible = false; }
    try { if (this.renderer) this.renderer.toneMappingExposure = 1.16; } catch (e) {}
    if (kind === 'intro') {
      /* 사무실 전체가 살아 움직인다: 부장님 복도 진입, 대리는 지나가고, 인턴은 타자 중 */
      this.showChar('jambujang', true);
      this.showChar('jamdaeri', true);
      this.showChar('jamsajang', two);
      this.showChar('jamintern', true);
      if (c.jambujang) {
        c.jambujang.root.position.set(-0.32, 0, -5.9);
        c.jambujang.root.rotation.y = 0;
        c.jambujang.target = { x: -0.5, z: -1.35 };
        c.jambujang.moveSpeed = 2.1;
        c.jambujang.mode = 'cine';
        c.jambujang.scan = 0;
        c.jambujang.mark.visible = false;
      }
      if (c.jamsajang) {
        c.jamsajang.root.position.set(1.75, 0, -5.5);
        c.jamsajang.target = { x: 1.5, z: -1.7 };
        c.jamsajang.moveSpeed = 1.8;
        c.jamsajang.mode = 'cine';
        c.jamsajang.mark.visible = false;
      }
      if (c.jamdaeri) {
        c.jamdaeri.root.position.set(2.5, 0, 0.4);
        c.jamdaeri.target = { x: 1.05, z: -1.1 };
        c.jamdaeri.moveSpeed = 1.3;
        c.jamdaeri.mode = 'cine';
        if (c.jamdaeri.mark) c.jamdaeri.mark.visible = false;
      }
      if (c.jamintern) {
        c.jamintern.root.position.set(2.18, 0, 0.22);
        c.jamintern.root.rotation.y = -0.5;
        c.jamintern.target = { x: 2.18, z: 0.22 };
        c.jamintern.moveSpeed = 0;
        c.jamintern.mode = 'type';
      }
      return;
    }
    if (kind === 'end') {
      /* 금요일·토요일 퇴근 — 카메라 회전·줌아웃 + 잼인턴이 복도를 걸어 나간다 */
      this.showChar('jambujang', true);
      this.showChar('jamsajang', true);
      this.showChar('jamdaeri', true);
      var me = this.showChar('jamintern', true);
      if (c.jambujang) {
        c.jambujang.root.position.set(-1.78, 0, -2.3);
        c.jambujang.root.rotation.y = 0;
        c.jambujang.target = { x: -1.78, z: -2.3 };
        c.jambujang.moveSpeed = 0;
        c.jambujang.mode = 'cine';
        c.jambujang.scan = 0;
        c.jambujang.mark.visible = false;
      }
      if (c.jamsajang) {
        c.jamsajang.root.position.set(1.62, 0, -3.1);
        c.jamsajang.root.rotation.y = 0;
        c.jamsajang.target = { x: 1.62, z: -3.1 };
        c.jamsajang.moveSpeed = 0;
        c.jamsajang.mode = 'cine';
        if (c.jamsajang.mark) c.jamsajang.mark.visible = false;
      }
      if (c.jamdaeri) {
        c.jamdaeri.root.position.set(2.62, 0, -0.55);
        c.jamdaeri.root.rotation.y = 0;
        c.jamdaeri.target = { x: 2.62, z: -0.55 };
        c.jamdaeri.moveSpeed = 0;
        c.jamdaeri.mode = 'cine';
      }
      if (me) {
        me.root.position.set(2.3, 0, 1.9);
        me.root.rotation.y = Math.PI;
        me.target = { x: -0.6, z: -1.2 };
        me.moveSpeed = 1.9;
        me.mode = 'go';
        me.scan = 0;
      }
    }
  };

  OfficeScene.prototype.clearCine = function () {
    this.cineKind = null; this.cineT = 0; this.cineHold = null;
    this.zoom = 0; this._cineStop = 0;
    var c = this.chars;
    if (c.jamintern) { c.jamintern.visible = false; c.jamintern.root.visible = false; }
    for (var i = 0; i < (this.lamps || []).length; i++) {
      var L = this.lamps[i];
      L.intensity = 0.5;
      if (L.color) L.color.setHex(0xffe7b8);
    }
    for (var lk2 in c) { if (c[lk2].label) c[lk2].label.visible = true; }
    try { if (this.renderer) this.renderer.toneMappingExposure = 1.04; } catch (e) {}
    this.setCamera(0);
  };

  /* 두 번째 상사(잼사장) 합동 감시 표시 */
  OfficeScene.prototype.markSecond = function (who, on) {
    if (!this.ok) return;
    var b = this.chars[who];
    if (!b) return;
    b.visible = true;
    b.root.visible = true;
    b.mark.visible = !!on;
    if (on) {
      b.scan = 1;
      b.mode = 'warn';
      b.target = { x: 1.42, z: -1.15 };
      b.moveSpeed = 3.4;
    }
  };

  OfficeScene.prototype.cineCamera = function (k) {
    k = Math.max(0, Math.min(1, k));
    var shots = this.cineShots;
    if (!shots || !shots.length) return;
    var n = shots.length;
    var idx = Math.min(n - 1, Math.floor(k * n));
    var s = shots[idx];
    var local = Math.max(0, Math.min(1, k * n - idx));
    var e = cEase(local);
    if (s.orbit) {
      /* 마지막 앵글: 살짝 회전하며 줌아웃 + 상승 */
      var a = s.a0 + (s.a1 - s.a0) * e;
      var r = s.r0 + (s.r1 - s.r0) * e;
      var c0 = s.center;
      var px = c0[0] + Math.sin(a) * r;
      var pz = c0[2] + Math.cos(a) * r;
      this.camera.fov = s.f0 + (s.f1 - s.f0) * e;
      this.camera.position.set(px, s.y0 + (s.y1 - s.y0) * e, pz);
      this.camera.lookAt(new THREE.Vector3(c0[0], c0[1] + 0.12 * e, c0[2]));
      this.camera.updateProjectionMatrix();
      return;
    }
    var px2 = cLerp(s.p0[0], s.p1[0], e) + Math.sin(this.t * 2.1) * 0.007;
    var py2 = cLerp(s.p0[1], s.p1[1], e) + Math.cos(this.t * 1.7) * 0.005;
    var pz2 = cLerp(s.p0[2], s.p1[2], e);
    this.camera.fov = cLerp(s.f0, s.f1, e);
    this.camera.position.set(px2, py2, pz2);
    this.camera.lookAt(new THREE.Vector3(
      cLerp(s.l0[0], s.l1[0], e),
      cLerp(s.l0[1], s.l1[1], e),
      cLerp(s.l0[2], s.l1[2], e)
    ));
    this.camera.updateProjectionMatrix();
  };

  /* 3D 캐릭터 머리 위 좌표 → 화면 비율(0~1). HUD 대사 말풍선을 붙인다. */
  OfficeScene.prototype.anchor = function (who) {
    var c = this.chars[who];
    if (!this.ok || !c || !c.root.visible) return { on: false, x: 0.5, y: 0.45 };
    var v = new THREE.Vector3();
    c.root.getWorldPosition(v);
    v.y += 2.62;
    v.project(this.camera);
    if (v.z > 1) return { on: false, x: 0.5, y: 0.45 };
    return { on: true, x: Math.max(0.14, Math.min(0.86, (v.x + 1) / 2)), y: Math.max(0.2, Math.min(0.8, (1 - v.y) / 2)) };
  };

  OfficeScene.prototype.update = function (dt) {
    var self = this;
    this.t += dt;
    // 카메라 줌
    this.zoom += (this.zoomTarget - this.zoom) * Math.min(1, dt * 6);
    this.setCamera(this.zoom);
    if (this.cineKind) {
      if (this.cineHold != null) {
        this.cineT = this.cineHold * this.cineDur;
      } else {
        /* 실제 시각 기준으로 진행 — 프레임이 느려도 컷신 길이가 늘어지지 않는다 */
        var pnow = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
        this.cineT = Math.min(this.cineDur, Math.max(0, pnow - (this.cineStartT || pnow)));
      }
      this.cineCamera(this.cineDur > 0 ? this.cineT / this.cineDur : 1);
    }
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 1.4);
      var s = this.shake * 0.11;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
    }

    for (var k in this.chars) {
      var c = this.chars[k];
      if (!c.root.visible) continue;
      var dx = c.target.x - c.root.position.x;
      var dz = c.target.z - c.root.position.z;
      var d = Math.sqrt(dx * dx + dz * dz);
      var moving = d > 0.05;
      if (moving) {
        var sp = c.moveSpeed || 2.4;
        var step = Math.min(d, sp * dt);
        c.root.position.x += dx / d * step;
        c.root.position.z += dz / d * step;
        c.walk += dt * (5.2 + sp * 1.5);
        // 진행 방향으로 몸 돌리기 (카메라 쪽 = 0)
        var want = dz < -0.02 ? Math.PI : (Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? Math.PI / 2 : -Math.PI / 2) : 0);
        var diff = ((want - c.root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        c.root.rotation.y += diff * Math.min(1, dt * 9);
      } else if (c.mode !== 'go') {
        c.root.rotation.y += (0 - c.root.rotation.y) * Math.min(1, dt * 5);
      }
      c.moving = moving;

      var swing = moving ? Math.sin(c.walk) * 0.72 : Math.sin(this.t * 2.1 + (k === 'jamsajang' ? 2 : 0)) * 0.05;
      c.ud.legL.rotation.x = swing;
      c.ud.legR.rotation.x = -swing;
      c.ud.armL.rotation.x = moving ? -swing * 0.85 : Math.sin(this.t * 1.7) * 0.05;
      c.ud.armR.rotation.x = moving ? swing * 0.85 : -Math.sin(this.t * 1.5) * 0.05;
      c.ud.armL.rotation.z = 0.03;
      c.ud.armR.rotation.z = -0.03;
      c.ud.model.position.y = moving ? Math.abs(Math.sin(c.walk)) * 0.035 : 0;

      // 감시: 문 앞 정지 후 좌우로 고개
      if (c.scan && !moving) {
        c.ud.head.rotation.y = Math.sin(this.t * 3.4) * 0.62;
        c.ud.head.rotation.x = 0.06;
        c.ud.torso.rotation.x = 0.04;
        c.ud.armL.rotation.x = Math.sin(this.t * 2.2) * 0.12;
        c.ud.armR.rotation.x = -Math.sin(this.t * 2.2) * 0.12;
      } else if (c.mode === 'peek' && !moving) {
        c.ud.torso.rotation.x = 0.28;
        c.ud.head.rotation.x = -0.1;
        c.ud.head.rotation.y = Math.sin(this.t * 5) * 0.18;
        c.ud.torso.position.y = 0.76 + Math.sin(this.t * 4) * 0.012;
      } else if (c.mode === 'caught' && !moving) {
        c.ud.torso.rotation.x = -0.06;
        c.ud.head.rotation.z = Math.sin(this.t * 16) * 0.1;
        c.ud.head.rotation.x = -0.12;
        c.ud.armL.rotation.x = -0.9 + Math.sin(this.t * 12) * 0.18;
        c.ud.armR.rotation.x = -0.9 + Math.cos(this.t * 12) * 0.18;
        c.ud.armL.rotation.z = -1.25 - Math.sin(this.t * 10) * 0.1;
        c.ud.armR.rotation.z = 1.25 + Math.sin(this.t * 10) * 0.1;
        c.ud.model.position.y = Math.abs(Math.sin(this.t * 8)) * 0.06;
      } else if (c.mode === 'leave' && moving) {
        // 지나가는 척하다가 뒤돌아보기
        c.ud.head.rotation.y = Math.sin(this.t * 3.2) * 1.1;
        c.ud.head.rotation.z = 0.06;
      } else if (c.mode === 'type' && !moving) {
        /* 인트로: 책상에서 타자 치는 주인공 */
        c.ud.head.rotation.x = 0.24;
        c.ud.head.rotation.y = Math.sin(this.t * 0.8) * 0.1;
        c.ud.armL.rotation.x = -0.88 + Math.sin(this.t * 9) * 0.13;
        c.ud.armR.rotation.x = -0.88 + Math.cos(this.t * 9.6) * 0.13;
        c.ud.armL.rotation.z = 0.2; c.ud.armR.rotation.z = -0.2;
        c.ud.legL.rotation.x = -0.55; c.ud.legR.rotation.x = -0.55;
        c.ud.model.position.y = -0.17;
      } else {
        c.ud.head.rotation.y += (0 - c.ud.head.rotation.y) * Math.min(1, dt * 5);
        c.ud.head.rotation.x += (0 - c.ud.head.rotation.x) * Math.min(1, dt * 5);
        c.ud.head.rotation.z += (0 - c.ud.head.rotation.z) * Math.min(1, dt * 5);
        c.ud.torso.rotation.x += (0 - c.ud.torso.rotation.x) * Math.min(1, dt * 5);
        c.ud.torso.position.y = 0.76;
      }

      // 잼대리: 수요일엔 치킨 흔들기
      if (k === 'jamdaeri') {
        c.ud.armR.rotation.x = -1.25 + Math.sin(this.t * 3.1) * 0.18;
        c.ud.armR.rotation.z = 0.32;
        c.ud.armL.rotation.x = -0.35 + Math.sin(this.t * 2.6 + 1) * 0.12;
        c.ud.head.rotation.y = Math.sin(this.t * 1.3) * 0.28;
        c.ud.legL.rotation.x = 0; c.ud.legR.rotation.x = 0;
        c.ud.model.position.y = Math.sin(this.t * 2.4) * 0.02;
        if (c.chicken) {
          c.chicken.visible = (this.stage === 'chart');
          c.chicken.rotation.z = Math.sin(this.t * 5) * 0.4;
        }
      }
      // 경고 마크 통통
      if (c.mark.visible) {
        c.mark.position.y = 2.12 + Math.sin(this.t * 8) * 0.05;
      }
    }

    /* ---- 컷신 연출: 고개 돌리기 · 조명 변화 · 파티클 ---- */
    if (this.cineKind) {
      var p = Math.min(1, this.cineT / Math.max(0.001, this.cineDur));
      var bj = this.chars.jambujang;
      if (this.cineKind === 'intro') {
        if (bj && bj.root.visible) {
          if (p >= 0.28 && !this._cineStop) {
            this._cineStop = 1;
            bj.target = { x: bj.root.position.x, z: bj.root.position.z };
            bj.moveSpeed = 0;
          }
          if (p > 0.58 && this._cineStop === 1) {
            this._cineStop = 2;
            bj.target = { x: -0.5, z: -1.35 };
            bj.moveSpeed = 1.55;
          }
          if (p >= 0.28 && p <= 0.6) {
            bj.ud.head.rotation.y = Math.sin(this.t * 2.6) * 0.72;
            bj.ud.head.rotation.x = 0.06;
          }
        }
        var jd = this.chars.jamdaeri;
        if (jd && jd.root.visible && p > 0.3) jd.ud.head.rotation.y = Math.sin(this.t * 1.5) * 0.5;
      } else if (this.cineKind === 'end') {
        /* 퇴근 연출: 형광등이 밝아지고 따뜻해지며, 파티클이 터진다 */
        for (var li = 0; li < (this.lamps || []).length; li++) {
          var L = this.lamps[li];
          L.intensity = 0.5 + p * 0.85;
          if (L.color) L.color.setHSL(0.105, 0.62, 0.58 + p * 0.1);
        }
        this.confettiT = (this.confettiT || 0) - dt;
        if (this.confettiT <= 0) {
          this.confettiT = 0.16;
          var me2 = this.chars.jamintern;
          if (me2 && me2.root.visible) {
            var cols2 = [0xffd24a, 0xff6b8a, 0x8fd0ff, 0x8bf0b8];
            this.burst.spawn(me2.root.position.x, 1.5 + Math.random() * 0.95, me2.root.position.z, cols2[(Math.random() * cols2.length) | 0], 7, { size: 0.075, speed: 1.9, life: 0.95 });
          }
        }
        if (bj && bj.root.visible) bj.ud.head.rotation.y = Math.sin(this.t * 1.2) * 0.35;
      }
    }
    this.burst.update(dt);
  };

  OfficeScene.prototype.frame = function (dt) {
    if (!this.ok || this.active === false) return;
    this.frames = (this.frames || 0) + 1;
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  };

  OfficeScene.prototype.snapshot = function (pose) {
    if (!this.ok) return '';
    try {
      if (pose === 'hero') {
        var b = this.chars.jambujang;
        b.visible = true; b.root.visible = true;
        b.root.position.set(-0.42, 0, -0.92);
        b.root.rotation.y = 0;
        b.mark.visible = true;
        b.scan = 1;
        this.zoom = 0.22; this.setCamera(0.22);
        this.frame(0.016);
        this.renderer.render(this.scene, this.camera);
        var url = this.canvas.toDataURL('image/png');
        b.visible = false; b.root.visible = false; b.mark.visible = false;
        this.zoom = 0; this.setCamera(0);
        return url;
      }
      this.renderer.render(this.scene, this.camera);
      return this.canvas.toDataURL('image/png');
    } catch (e) { return ''; }
  };

  OfficeScene.prototype.setActive = function (on) { this.active = !!on; };

  /* 컷신 정지화면(고해상도) — 인트로·엔딩 오버레이 배경으로 쓴다 */
  OfficeScene.prototype.cineShot = function (kind) {
    if (!this.ok) return '';
    try {
      var portrait = (window.innerHeight || 0) >= (window.innerWidth || 0);
      var cw = portrait ? 780 : 980, ch = portrait ? 975 : 552;
      this.renderer.setSize(cw, ch, false);
      this.camera.aspect = cw / ch;
      this.camera.updateProjectionMatrix();
      if (kind === 'intro') {
        this.setCine('intro', 2);
        this.cineT = 1.0;
        this.cineCamera(0.52);
      } else if (kind === 'boss') {
        this.setCine('end', 2);
        if (this.chars.jambujang) { this.chars.jambujang.mark.visible = true; this.chars.jambujang.scan = 1; }
        if (this.chars.jamsajang) { this.chars.jamsajang.mark.visible = true; this.chars.jamsajang.scan = 1; }
        this.cineT = 0.9;
        this.cineCamera(0.16);
      } else {
        this.setCine('end', 2);
        var me = this.chars.jamintern;
        if (me) {
          me.root.position.set(0.55, 0, 2.35);
          me.root.rotation.y = 0;
          me.target = { x: 0.55, z: 2.35 };
          me.mode = 'go';
          me.ud.legL.rotation.x = 0.5;
          me.ud.legR.rotation.x = -0.4;
          me.ud.armL.rotation.x = -0.35;
          me.ud.armR.rotation.x = 0.35;
          me.ud.model.position.y = 0.03;
        }
        this.cineT = 2;
        this.cineCamera(1);
      }
      this.renderer.render(this.scene, this.camera);
      var url = this.canvas.toDataURL('image/png');
      this.resize();
      this.camera.aspect = (this.host.clientWidth || 1) / (this.host.clientHeight || 1);
      this.camera.updateProjectionMatrix();
      return url;
    } catch (e) {
      try { this.resize(); } catch (e2) {}
      return '';
    }
  };

  /* =========================================================
     모니터 안 3D 미니게임
     ========================================================= */
  function MiniScene(host) {
    this.host = host;
    this.ok = false;
    this.kind = 'jump';
    this.active = true;
    this.t = 0;
    this.ev = [];
    this.intensity = 0.45;
    this.shake = 0;
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (e) { try { this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false }); } catch (e2) { return; } }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    if (THREE.sRGBEncoding) this.renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping) { this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.02; }
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'gl-canvas';
    host.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.burst = new VX.Burst(this.scene);

    this.hemi = new THREE.HemisphereLight(0xcfe4ff, 0x2a2a30, 0.28);
    this.scene.add(this.hemi);
    var dir = new THREE.DirectionalLight(0xfff3dd, 0.95);
    dir.position.set(3, 6, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.set(512, 512);
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 20;
    dir.shadow.camera.left = -5;
    dir.shadow.camera.right = 5;
    dir.shadow.camera.top = 5;
    dir.shadow.camera.bottom = -3;
    dir.shadow.bias = -0.0015;
    this.scene.add(dir);
    this.dir = dir;

    this.ok = true;
    this.buildStage('jump');
    this.resize();
    var self = this;
    this._resize = function () { self.resize(); };
    window.addEventListener('resize', this._resize);
    window.addEventListener('orientationchange', this._resize);
    if (window.ResizeObserver) {
      try { this._ro = new ResizeObserver(this._resize); this._ro.observe(host); } catch (e) {}
    }
  }

  MiniScene.prototype.resize = function () {
    if (!this.ok) return;
    var w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    if (this.kind === 'chart') this.camera.fov = this.chartFov();
    this.camera.updateProjectionMatrix();
  };

  MiniScene.prototype.clear = function () {
    while (this.root.children.length) this.root.remove(this.root.children[0]);
    this.parts = {};
    this.state = {};
  };

  /* 미니게임 → 게임 로직 이벤트 큐 */
  MiniScene.prototype.emit = function (e) {
    if (!e) return;
    if (this.ev.length > 60) this.ev.shift();
    this.ev.push(e);
  };
  MiniScene.prototype.poll = function () {
    var e = this.ev;
    this.ev = [];
    return e;
  }; 

  MiniScene.prototype.setActive = function (on) { this.active = !!on; };

  MiniScene.prototype.frame = function (dt) {
    if (!this.ok || !this.active) return;
    this.t += dt;
    if (this.kind === 'jump') this.updateJump(dt);
    else if (this.kind === 'chart') this.updateChart(dt);
    else if (this.kind === 'chat') this.updateChat(dt);
    else if (this.kind === 'video') this.updateVideo(dt);
    else this.updateShop(dt);
    this.burst.update(dt);
    var bx = this.camera.position.x, by = this.camera.position.y;
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 1.7);
      this.camera.position.x = bx + (Math.random() - 0.5) * this.shake * 0.34;
      this.camera.position.y = by + (Math.random() - 0.5) * this.shake * 0.26;
    }
    this.renderer.render(this.scene, this.camera);
    this.camera.position.x = bx;
    this.camera.position.y = by;
  };

  MiniScene.prototype.buildStage = function (kind) {
    this.kind = kind;
    this.clear();
    this.ev = [];
    this.shake = 0;
    this.anim = null;
    this.hemi.intensity = (kind === 'shop' || kind === 'chat') ? 0.3 : kind === 'chart' ? 0.22 : kind === 'video' ? 0.26 : 0.3;
    this.dir.intensity = (kind === 'shop' || kind === 'chat') ? 1.0 : kind === 'chart' ? 0.9 : kind === 'video' ? 0.85 : 0.95;
    if (kind === 'jump') this.buildJump();
    else if (kind === 'chart') this.buildChart();
    else if (kind === 'chat') this.buildChat();
    else if (kind === 'video') this.buildVideo();
    else this.buildShop();
  };

  /* ---------- 월요일: 서류·커피 장애물 타이밍 점프 (러너) ---------- */
  var JUMP_X = -0.62, JUMP_Z = 0.55;
  MiniScene.prototype.buildJump = function () {
    this.scene.background = new THREE.Color(0x1b3557);
    this.scene.fog = new THREE.Fog(0x1b3557, 10, 24);
    this.camera.fov = 46;
    this.camera.position.set(0.25, 2.55, 6.05);
    this.camera.lookAt(-0.1, 1.0, -0.35);
    this.camera.updateProjectionMatrix();
    this.camX = 0.25; this.camY = 2.55; this.camZ = 6.05;
    this.dir.position.set(2.5, 6, 4);

    var R = this.root;
    // 별
    for (var i = 0; i < 22; i++) {
      VX.box(R, 0.09, 0.09, 0.09, 0xfff4c8, -4 + Math.random() * 8, 2.6 + Math.random() * 3.2, -5 - Math.random() * 6, { emissive: 0xfff0b0, emissiveIntensity: 1.4, cast: false });
    }
    // 바닥 플랫폼(흙 블록 5칸 + 잔디 윗면)
    for (var g = 0; g < 5; g++) {
      var x = -1.44 + g * 0.72;
      VX.box(R, 0.72, 0.5, 6.6, 0x7a5636, x, 0.0, -1.1, { tex: 'dirt', tr: [0.7, 3.2] });
      VX.box(R, 0.72, 0.1, 6.6, g % 2 ? 0x4c9e58 : 0x57ad62, x, 0.3, -1.1, { cast: false, tex: 'grass', tr: [0.7, 3.2] });
    }
    VX.box(R, 3.9, 0.4, 6.8, 0x3d2c1e, 0.1, -0.45, -1.1, { cast: false });
    // 달리는 느낌: 바닥 줄무늬가 카메라 쪽으로 흐른다
    this.stripes = [];
    for (var s = 0; s < 11; s++) {
      var st = VX.box(R, 3.44, 0.012, 0.1, 0x9fd0f2, 0.06, 0.362, 2.2 - s * 0.78, { cast: false, emissive: 0x2f6f9a, emissiveIntensity: 0.32 });
      this.stripes.push(st);
    }
    // 구름
    [[-2.6, 3.55, -6.4], [-2.25, 3.7, -6.4], [0.4, 3.8, -6.8], [0.75, 3.65, -6.8]].forEach(function (c) {
      VX.box(R, 0.5, 0.3, 0.4, 0xc9dbf2, c[0], c[1], c[2], { emissive: 0x7f95b8, emissiveIntensity: 0.18, cast: false });
    });

    // 플레이어 (잼인턴)
    this.player = VX.humanoid({ suit: 0x3f6fd8, shirt: 0xdfe9ff, tie: false, cap: 0x2b3a6a, hair: 0x2a231d, scale: 0.66, badge: 0x8fd0ff });
    this.baseY = 0.35;
    this.player.position.set(JUMP_X, this.baseY, JUMP_Z);
    this.player.rotation.y = Math.PI;
    R.add(this.player);
    this.pud = this.player.userData;
    this.state = { px: JUMP_X, py: 0, vy: 0, jumps: 0, landed: 0 };

    // 장애물·코인
    this.obs = [];
    this.coinMat = VX.mat(0xffb200, { metal: 0.25, rough: 0.42, emissive: 0x8a5200, emissiveIntensity: 0.42 });
    this.coinGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.06, 16);
    this.spawnT = 1.05;
    this.speed = 2.55 + (this.intensity || 0.4) * 0.9;
    this.runPhase = 0;
    this.hitFlash = 0;
    this.addObstacle();

    // 코스 안내 표지
    var guide = VX.label('⬆ 점프로 넘어!', '#9fe0ff', { w: 1.5 });
    guide.position.set(1.55, 3.05, -5.2);
    R.add(guide);
  };

  MiniScene.prototype.addObstacle = function () {
    var R = this.root;
    var g = new THREE.Group();
    g.position.set(JUMP_X, this.baseY, -4.9);
    var kind = Math.random() < 0.58 ? 'paper' : 'coffee';
    if (kind === 'paper') {
      for (var i = 0; i < 3; i++) VX.box(g, 0.62, 0.15, 0.52, 0xeef1f7, 0, 0.075 + i * 0.16, 0, { rough: 0.92 });
      VX.box(g, 0.64, 0.028, 0.54, 0x9fb0c8, 0, 0.152, 0, { cast: false });
      VX.box(g, 0.64, 0.028, 0.54, 0x9fb0c8, 0, 0.312, 0, { cast: false });
      VX.box(g, 0.22, 0.05, 0.02, 0x4a76a8, 0, 0.238, 0.272, { cast: false });
    } else {
      VX.box(g, 0.34, 0.4, 0.34, 0xf7f9fe, 0, 0.2, 0, { rough: 0.8 });
      VX.box(g, 0.36, 0.07, 0.36, 0x6d4a2f, 0, 0.43, 0, { rough: 0.7 });
      VX.box(g, 0.06, 0.2, 0.06, 0x6d4a2f, 0.17, 0.3, 0, { cast: false });
      VX.box(g, 0.14, 0.06, 0.02, 0x3f8ff0, 0, 0.24, 0.176, { cast: false });
    }
    var coin = new THREE.Group();
    var co = new THREE.Mesh(this.coinGeo, this.coinMat);
    co.rotation.x = Math.PI / 2;
    coin.add(co);
    coin.position.set(0, 1.62, 0);
    g.add(coin);
    R.add(g);
    this.obs.push({ g: g, coin: coin, kind: kind, z: -4.9, done: false, taken: false, t: 0, wob: 0, spin: Math.random() * 3 });
  };

  MiniScene.prototype.updateJump = function (dt) {
    var s = this.state;
    if (!s) return;
    // 물리
    if (s.py > 0 || s.vy > 0) {
      s.vy -= 15.5 * dt;
      s.py += s.vy * dt;
      if (s.py <= 0) {
        s.py = 0; s.vy = 0; s.jumps = 0;
        this.burst.spawn(this.player.position.x, 0.08, JUMP_Z - 0.3, 0x9fdc9f, 4, { size: 0.06, speed: 1.2, life: 0.35 });
      }
    }
    this.player.position.y = this.baseY + s.py;
    var air = s.py > 0.05;
    this.runPhase += dt * (air ? 5.5 : 15);
    // 달리기 / 점프 자세
    if (air) {
      this.pud.armL.rotation.z = 0.95 + Math.sin(this.t * 10) * 0.18;
      this.pud.armR.rotation.z = -0.95 - Math.sin(this.t * 10) * 0.18;
      this.pud.armL.rotation.x = -0.65;
      this.pud.armR.rotation.x = -0.65;
      this.pud.legL.rotation.x = 0.62;
      this.pud.legR.rotation.x = -0.5;
      this.pud.head.rotation.z = s.vy > 0 ? 0.08 : 0;
    } else {
      var sw = Math.sin(this.runPhase);
      this.pud.legL.rotation.x = sw * 0.85;
      this.pud.legR.rotation.x = -sw * 0.85;
      this.pud.armL.rotation.x = -sw * 0.7;
      this.pud.armR.rotation.x = sw * 0.7;
      this.pud.armL.rotation.z = 0.12;
      this.pud.armR.rotation.z = -0.12;
      this.pud.head.rotation.z = 0;
      this.pud.model.position.y = Math.abs(Math.cos(this.runPhase)) * 0.03;
    }

    // 바닥 줄무늬 스크롤
    for (var i = 0; i < this.stripes.length; i++) {
      var st = this.stripes[i];
      st.position.z += this.speed * dt;
      if (st.position.z > 2.4) st.position.z -= 8.6;
    }

    // 장애물 생성
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.addObstacle();
      var base = 1.72 - (this.intensity || 0) * 0.55;
      this.spawnT = Math.max(0.95, base) + Math.random() * 0.34;
    }

    // 장애물 이동·판정
    for (var k = this.obs.length - 1; k >= 0; k--) {
      var o = this.obs[k];
      o.z += this.speed * dt;
      o.g.position.z = o.z;
      if (!o.done) {
        o.t += dt;
        o.coin.rotation.y += dt * 3.2;
        o.coin.position.y = 1.62 + Math.sin(this.t * 3 + o.spin) * 0.05;
        if (o.z >= JUMP_Z - 0.12) {
          o.done = true;
          if (s.py >= 0.5) {
            var perfect = s.py >= 0.95;
            o.taken = true;
            this.burst.spawn(JUMP_X, 1.95, JUMP_Z, 0xffcf3d, perfect ? 14 : 8, { size: perfect ? 0.09 : 0.07, speed: perfect ? 2.8 : 2.1, life: 0.55 });
            if (perfect) this.burst.spawn(JUMP_X, 1.25, JUMP_Z, 0x8fd0ff, 8, { size: 0.05, speed: 1.8, life: 0.45 });
            this.emit({ k: perfect ? 'jumpPerfect' : 'jumpClear' });
          } else {
            o.wob = 1;
            this.hitFlash = 0.45;
            this.shake = 0.34;
            this.burst.spawn(JUMP_X, 0.75, JUMP_Z, 0xff5c66, 12, { size: 0.08, speed: 2.6, life: 0.5 });
            this.emit({ k: 'jumpHit' });
          }
        }
      }
      if (o.taken) {
        o.coin.position.y += dt * 2.4;
        o.coin.scale.setScalar(Math.max(0.001, o.coin.scale.x - dt * 2.6));
      }
      if (o.wob > 0) {
        o.wob -= dt * 1.7;
        o.g.rotation.z = Math.sin(this.t * 24) * 0.22 * Math.max(0, o.wob);
        o.g.rotation.x = -0.55 * Math.max(0, o.wob);
      }
      if (o.z > 2.7) {
        this.root.remove(o.g);
        this.obs.splice(k, 1);
      }
    }
    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
      if (this.hitFlash <= 0 && this.scene.background) this.scene.background.setHex(0x1b3557);
      else if (this.scene.background) this.scene.background.setHex(0x3a1b2a);
    }
  };

  MiniScene.prototype.tapJump = function () {
    var s = this.state;
    if (!s) return { act: 'none' };
    /* 착지 전 연속 광클 불가 — 땅에 있을 때만 점프 */
    if (s.py > 0.001) return { act: 'air' };
    s.vy = 6.35; s.jumps = 1;
    this.burst.spawn(this.player.position.x, 0.1, JUMP_Z - 0.2, 0x8fd0ff, 5, { size: 0.05, speed: 1.5, life: 0.35 });
    return { act: 'jump', py: s.py };
  };

  MiniScene.prototype.jumpState = function () {
    if (this.kind !== 'jump' || !this.state) return null;
    var next = null, best = 99;
    for (var i = 0; i < this.obs.length; i++) {
      var o = this.obs[i];
      if (o.done) continue;
      var d = JUMP_Z - o.z;
      if (d > 0 && d < best) { best = d; next = o; }
    }
    return {
      py: this.state.py, air: this.state.py > 0.001,
      next: next ? { z: next.z, dist: best, kind: next.kind } : null,
      obstacles: this.obs.length, speed: this.speed
    };
  };

  /* ---------- 수요일: 3D 코인 단타 (실시간 캔들 차트 · 매수 → 고점 매도) ---------- */
  var P_LO = 0.955, P_HI = 1.045, Y_LO = 0.3, Y_HI = 2.8;
  /* 가격 → 화면 y. 표시 창(this.win)은 매 프레임 데이터에 맞춰 부드럽게 줌한다. */
  MiniScene.prototype.pY = function (p) {
    var w = this.win || { lo: 0.99, hi: 1.01 };
    var k = (p - w.lo) / Math.max(1e-6, w.hi - w.lo);
    return Y_LO + Math.max(0, Math.min(1, k)) * (Y_HI - Y_LO);
  };

  MiniScene.prototype.chartFov = function () {
    var a = this.camera.aspect || 1;
    return a > 1.65 ? 26 : a > 1.3 ? 29 : a > 1.02 ? 34 : 40;
  };

  MiniScene.prototype.buildChart = function () {
    this.scene.background = new THREE.Color(0x081a26);
    this.scene.fog = new THREE.Fog(0x081a26, 13, 28);
    this.camera.fov = this.chartFov();
    this.camera.position.set(0, 1.55, 5.12);
    this.camera.lookAt(0, 1.4, -1.25);
    this.camera.updateProjectionMatrix();
    this.dir.position.set(2.5, 6, 4.5);

    var R = this.root;
    // 차트 배경판 + 가로 가격 그리드
    VX.box(R, 9.2, 5.8, 0.2, 0x061520, 0, 1.9, -3.5, { cast: false, tex: 'metal', tm: 'relief', tr: [7, 4] });
    for (var gw = 0; gw < 6; gw++) {
      VX.box(R, 7.4, 0.014, 0.02, 0x1b5f7e, 0, 0.3 + gw * 0.5, -3.36, { emissive: 0x1f7a9a, emissiveIntensity: 0.3, cast: false });
    }
    VX.box(R, 7.4, 0.12, 1.5, 0x0a2130, 0, -0.02, -1.6, { cast: false, tex: 'concrete', tr: [3, 1] });
    VX.box(R, 7.2, 0.03, 0.06, 0xffd24a, 0, 0.09, -2.86, { cast: false, emissive: 0xd9a000, emissiveIntensity: 0.7 });
    var tick = VX.flatText('BTC/KRW · 1분봉', {
      w: 512, h: 96, wu: 1.5, hu: 0.28, color: '#ffe08a',
      bg: 'rgba(8,14,22,.82)', stroke: 'rgba(255,210,74,.45)', lw: 6
    });
    tick.position.set(-1.62, 2.98, -3.15);
    R.add(tick);

    /* 캔들 — 빨강(상승)/파랑(하락) 두 재질을 갈아 끼운다 */
    this.cUp = VX.mat(0xff5c66, { rough: 0.5, emissive: 0x8a1220, emissiveIntensity: 0.45 });
    this.cDown = VX.mat(0x3f8ff0, { rough: 0.5, emissive: 0x123a7a, emissiveIntensity: 0.4 });
    this.candles = [];
    for (var b = 0; b < 12; b++) {
      var x = -1.815 + b * 0.33;
      var body = VX.box(R, 0.3, 1, 0.24, this.cUp, x, 1, -1.35, { cast: false });
      var wick = VX.box(R, 0.055, 1, 0.055, this.cUp, x, 1, -1.35, { cast: false, emissive: 0x3a0a12, emissiveIntensity: 0.2 });
      body.receiveShadow = false;
      this.candles.push({ m: body, w: wick, x: x });
    }
    VX.box(R, 6.0, 0.06, 0.42, 0x16465e, 0, 0.03, -1.35, { cast: false });

    /* 익절 존 — 목표 매도 구간 */
    this.tpZone = VX.box(R, 4.6, 1, 0.1, 0xff5c66, 0, 1.6, -2.9, { cast: false, opacity: 0.14, emissive: 0xff2a3a, emissiveIntensity: 0.5 });
    this.tpZone.receiveShadow = false;
    this.tpEdge = VX.box(R, 4.6, 0.04, 0.12, 0xff7a86, 0, 2.3, -2.88, { cast: false, emissive: 0xff5c66, emissiveIntensity: 0.9 });
    this.tpLabel = VX.label('🎯 익절 존', '#ff9aa2', { w: 1.05 });
    this.tpLabel.position.set(-1.55, 2.3, -2.7);
    R.add(this.tpLabel);

    /* 현재가 라인 + 코인 마커 + 매수 기준선 */
    this.priceLine = VX.box(R, 4.6, 0.022, 0.34, 0xfff2a0, 0, 1.4, -1.05, { cast: false, opacity: 0.6, emissive: 0xffd24a, emissiveIntensity: 0.9 });
    this.priceLine.receiveShadow = false;
    var coin = new THREE.Group();
    var co = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 18), VX.mat(0xffc222, { metal: 0.3, rough: 0.38, emissive: 0x6b4200, emissiveIntensity: 0.45 }));
    co.rotation.x = Math.PI / 2;
    coin.add(co);
    coin.position.set(1.86, 1.4, -1.15);
    R.add(coin);
    this.coinMark = coin;
    this.entryLine = VX.box(R, 4.6, 0.02, 0.26, 0xffd24a, 0, 1.2, -1.4, { cast: false, opacity: 0.55, emissive: 0xffd24a, emissiveIntensity: 0.7 });
    this.entryLine.receiveShadow = false;
    this.entryLine.visible = false;

    this.coin = {
      price: 1.0, entry: 0, pos: false, hold: 0, v: 0,
      hist: [], sampleT: 0.55, spikeIn: 2.6, spikeT: 0,
      last: null, peak: 1.0
    };
    var seedP = 1.0;
    for (var i0 = 0; i0 < 12; i0++) {
      var o0 = seedP;
      seedP = 1.0 + Math.sin(i0 * 0.62) * 0.0035 + Math.cos(i0 * 1.7) * 0.0016 + (Math.random() - 0.5) * 0.0012;
      this.coin.hist.push({ o: o0, c: seedP });
    }
    this.win = { lo: 0.994, hi: 1.006 };
    this.frozen = false;
    this.state = { buys: 0, sells: 0, tpHits: 0 };
  };

  MiniScene.prototype.updateChart = function (dt) {
    var c = this.coin;
    if (!c) return;
    if (!this.frozen) {
      /* 가격 모델: 평균 회귀 + 랜덤 변동 + 주기적 급등(빨간 불기둥) */
      c.spikeIn -= dt;
      if (c.spikeT > 0) {
        c.spikeT -= dt;
        /* 급등: 목표 고점(현재가 +1.2~2.4%)까지 밀어 올린다 → 익절 존에 닿는다 */
        c.v += (0.8 + Math.random() * 0.55) * dt;
        if (c.spikePeak) c.v += Math.max(0, c.spikePeak - c.price) * 6.0 * dt;
      } else if (c.spikeIn <= 0) {
        c.spikeT = 0.7 + Math.random() * 0.45;
        c.spikeIn = 1.4 + Math.random() * 1.2;
        c.spikePeak = c.price * (1.012 + Math.random() * 0.012);
      }
      c.v += (Math.random() - 0.5) * 0.7 * dt;
      c.v += (1.0 - c.price) * 3.0 * dt;
      c.v *= Math.max(0, 1 - 2.2 * dt);
      c.price += c.v * dt;
      if (c.spikeT <= 0) {
        /* 급등이 아닐 땐 기준가 근처에서만 논다 → 매수 타이밍을 읽기 쉽게 */
        if (c.price > 1.021) { c.price = 1.021; c.v = Math.min(c.v, 0); }
        if (c.price < 0.984) { c.price = 0.984; c.v = Math.max(c.v, 0); }
      }
      if (c.price > P_HI - 0.003) { c.price = P_HI - 0.003; c.v = Math.min(c.v, 0); }
      if (c.price < P_LO + 0.003) { c.price = P_LO + 0.003; c.v = Math.max(c.v, 0); }
      if (c.pos) {
        c.hold += dt;
        if (c.price > c.peak) c.peak = c.price;
      }
      c.sampleT -= dt;
      if (c.sampleT <= 0) {
        c.sampleT = 0.55;
        var prev = c.hist.length ? c.hist[c.hist.length - 1].c : c.price;
        c.hist.push({ o: prev, c: c.price });
        while (c.hist.length > 12) c.hist.shift();
      }
    }

    /* 표시 창: 캔들이 화면을 채우도록 부드럽게 줌 (익절 존은 최대한만 포함) */
    var mn = c.price, mx = c.price;
    var startI = Math.max(0, c.hist.length - 8);
    for (var q0 = startI; q0 < c.hist.length; q0++) {
      var h0 = c.hist[q0];
      if (h0.o < mn) mn = h0.o;
      if (h0.c < mn) mn = h0.c;
      if (h0.o > mx) mx = h0.o;
      if (h0.c > mx) mx = h0.c;
    }
    var dataSpan = Math.max(0.024, mx - mn);
    if (c.pos) {
      if (c.entry < mn) mn = c.entry;
      var cap = mn + Math.max(dataSpan * 2.2, 0.0052);
      mx = Math.min(Math.max(mx, c.entry * 1.032), cap);
    }
    var span = Math.max(0.020, mx - mn);
    var mid = (mn + mx) / 2;
    if (c.pos) mid = (mid + c.entry * 1.012) / 2;
    var pad = span * 0.08;
    var kz = Math.min(1, dt * 3.0);
    this.win.lo += ((mid - span / 2 - pad) - this.win.lo) * kz;
    this.win.hi += ((mid + span / 2 + pad) - this.win.hi) * kz;

    /* 캔들 그리기 (최신 봉이 오른쪽) */
    var n = c.hist.length;
    for (var i = 0; i < this.candles.length; i++) {
      var cd = this.candles[i], hi = i - (12 - n);
      if (hi < 0) { cd.m.visible = false; cd.w.visible = false; continue; }
      var s = c.hist[hi];
      var yo = this.pY(s.o), yc = this.pY(s.c), top = Math.max(yo, yc), bot = Math.min(yo, yc);
      var h = Math.max(0.07, top - bot);
      var up = s.c >= s.o;
      cd.m.visible = true; cd.w.visible = true;
      cd.m.material = up ? this.cUp : this.cDown;
      cd.w.material = cd.m.material;
      cd.m.scale.y = h;
      cd.m.position.y = (top + bot) / 2;
      var wh = Math.max(h + 0.06, 0.14);
      cd.w.scale.y = wh;
      cd.w.position.y = (top + bot) / 2;
    }

    /* 현재가 라인 · 코인 마커 */
    var py = this.pY(c.price);
    if (this.priceLine) this.priceLine.position.y += (py - this.priceLine.position.y) * Math.min(1, dt * 14);
    if (this.coinMark) {
      this.coinMark.position.y += (py - this.coinMark.position.y) * Math.min(1, dt * 14);
      this.coinMark.rotation.z += dt * (this.frozen ? 0.4 : 1.6);
    }

    /* 익절 존 · 매수 기준선 */
    var zLoY, zHiY;
    if (c.pos) {
      zLoY = this.pY(c.entry * 1.006); zHiY = this.pY(c.entry * 1.016);
      if (zLoY > zHiY) { var tt = zLoY; zLoY = zHiY; zHiY = tt; }
      if (zHiY - zLoY < 0.12) zHiY = zLoY + 0.12;
      this.entryLine.visible = true;
      this.entryLine.position.y = this.pY(c.entry);
    } else {
      zHiY = Y_HI; zLoY = Y_HI - 0.3;
      this.entryLine.visible = false;
    }
    if (this.tpZone) {
      this.tpZone.position.y = (zLoY + zHiY) / 2;
      this.tpZone.scale.y = Math.max(0.05, zHiY - zLoY);
      this.tpEdge.position.y = zHiY;
      this.tpLabel.position.y = zHiY;
      var hot = c.pos && c.price >= c.entry * 1.006;
      if (this.tpZone.material && this.tpZone.material.emissiveIntensity != null) {
        this.tpZone.material.emissiveIntensity = hot ? 1.35 : 0.6;
        this.tpZone.material.opacity = hot ? 0.2 : 0.1;
      }
    }
    this.state.price = c.price;
  };

  MiniScene.prototype.coinTap = function () {
    var c = this.coin;
    if (!c || !this.ok) return { act: 'none' };
    var res;
    if (!c.pos) {
      c.pos = true; c.entry = c.price; c.hold = 0; c.peak = c.price;
      this.burst.spawn(1.86, this.pY(c.price), -1.2, 0xffd24a, 9, { size: 0.06, speed: 2.0, life: 0.5 });
      this.state.buys++;
      res = { act: 'buy', price: c.price, entry: c.entry, ret: 0 };
    } else {
      var ret = c.price / c.entry - 1;
      var q = ret >= 0.006 ? 'tp' : ret >= 0.002 ? 'up' : ret > -0.002 ? 'flat' : 'loss';
      if (c.hold < 0.6) q = 'fast';
      var gained = c.price - c.entry;
      c.pos = false;
      var pyy = this.pY(c.price);
      this.burst.spawn(1.86, pyy, -1.2, q === 'loss' ? 0x3f8ff0 : q === 'tp' ? 0xff3d55 : 0xff9b3d,
        q === 'tp' ? 20 : 10, { size: q === 'tp' ? 0.1 : 0.07, speed: q === 'tp' ? 3.4 : 2.2, life: 0.6 });
      if (q === 'tp') this.burst.spawn(0, pyy, -0.8, 0xffd24a, 16, { size: 0.08, speed: 3.0, life: 0.7 });
      this.state.sells++;
      if (q === 'tp') this.state.tpHits++;
      res = { act: 'sell', price: c.price, entry: c.entry, ret: ret, quality: q, hold: c.hold, gained: gained };
    }
    c.last = res;
    return res;
  };

  MiniScene.prototype.coinState = function () {
    var c = this.coin;
    if (!c) return null;
    return {
      price: c.price, entry: c.pos ? c.entry : 0, pos: c.pos, hold: c.hold,
      ret: c.pos ? c.price / c.entry - 1 : 0, frozen: !!this.frozen,
      last: c.last, buys: (this.state && this.state.buys) || 0,
      sells: (this.state && this.state.sells) || 0, tpHits: (this.state && this.state.tpHits) || 0
    };
  };

  /* 테스트·검증용: 가격/포지션을 직접 세팅 */
  MiniScene.prototype.coinDebug = function (o) {
    var c = this.coin;
    if (!c) return null;
    o = o || {};
    if (o.price != null) { c.price = o.price; c.v = 0; }
    if (o.pos != null) {
      c.pos = !!o.pos;
      if (c.pos && !c.entry) { c.entry = c.price; c.hold = 0.9; }
    }
    if (o.entry != null) c.entry = o.entry;
    if (o.hold != null) c.hold = o.hold;
    if (o.freeze != null) this.frozen = !!o.freeze;
    return this.coinState();
  };

  MiniScene.prototype.tapChart = function () { return this.coinTap(); };
  MiniScene.prototype.setFrozen = function (v) { this.frozen = !!v; };

  /* ---------- 금요일: 3D 핫딜 박스 격파 ---------- */
  MiniScene.prototype.buildShop = function () {
    this.scene.background = new THREE.Color(0x281a42);
    this.scene.fog = new THREE.Fog(0x281a42, 11, 26);
    this.camera.fov = 40;
    this.camera.position.set(0, 2.05, 6.0);
    this.camera.lookAt(0, 1.15, -0.4);
    this.camera.updateProjectionMatrix();
    this.dir.position.set(2, 6, 4);

    var R = this.root;
    // 카운터
    VX.box(R, 5.4, 0.5, 1.9, 0x5a4230, 0, -0.25, -0.7, { tex: 'wood', tr: [4, 1.4] });
    VX.box(R, 5.5, 0.08, 2.0, 0x7a5a3e, 0, 0.02, -0.7, { tex: 'wood', tr: [4, 1.5] });
    // 뒷 진열대 + 매장 벽
    VX.box(R, 12, 8, 0.2, 0x1e1334, 0, 2.4, -3.6, { cast: false, tex: 'plaster', tr: [5, 3.2] });
    VX.box(R, 2.6, 0.1, 0.5, 0xffd8a8, -1.4, 3.15, -3.3, { emissive: 0xffc890, emissiveIntensity: 0.8, cast: false });
    VX.box(R, 2.6, 0.1, 0.5, 0xffd8a8, 1.4, 3.15, -3.3, { emissive: 0xffc890, emissiveIntensity: 0.8, cast: false });
    VX.box(R, 5.2, 2.2, 0.24, 0x3a2a4a, 0, 1.1, -3.0);
    var cols = [0xd92340, 0x1a86bf, 0xd9a000, 0x1f9a63, 0x6544cc, 0xd9661a];
    for (var s = 0; s < 3; s++) {
      for (var q = 0; q < 9; q++) {
        VX.box(R, 0.34, 0.34, 0.22, cols[(s * 3 + q) % cols.length], -2.2 + q * 0.55, 0.55 + s * 0.62, -2.86, { emissive: cols[(s * 3 + q) % cols.length], emissiveIntensity: 0.12 });
      }
    }
    VX.box(R, 5.2, 0.06, 0.3, 0x886a9a, 0, 0.24, -2.86);
    var saleSign = VX.label('🔥 타임딜 오늘만!', '#ff9b3d', { w: 1.7 });
    saleSign.position.set(0, 2.35, -2.84);
    R.add(saleSign);

    // 박스 더미
    this.stack = [];
    var boxCols = [0xd92340, 0x1a86bf, 0xd9a000, 0x1f9a63, 0x6544cc, 0xd9661a];
    var layout = [
      [0, 0.3, 0], [-0.62, 0.3, 0], [0.62, 0.3, 0], [-0.31, 0.87, 0], [0.31, 0.87, 0], [0, 1.44, 0]
    ];
    for (var i = 0; i < layout.length; i++) {
      var gb = new THREE.Group();
      gb.position.set(layout[i][0], layout[i][1], layout[i][2]);
      VX.box(gb, 0.58, 0.54, 0.58, boxCols[i % boxCols.length], 0, 0, 0, { rough: 0.7, tex: 'wood', tm: 'relief', tr: [0.6, 0.6] });
      VX.box(gb, 0.6, 0.06, 0.1, 0xfff3d0, 0, 0.02, 0, { cast: false });
      VX.box(gb, 0.1, 0.58, 0.6, 0xfff3d0, 0, 0, 0, { cast: false });
      R.add(gb);
      this.stack.push(gb);
    }
    // 가격표
    var tag = VX.label('₩ 9,900', '#ffd24a', { w: 0.72 });
    tag.position.set(0.95, 1.85, 0.15);
    R.add(tag);

    // 망치
    var hammer = new THREE.Group();
    hammer.position.set(1.72, 1.95, 0.5);
    hammer.rotation.z = -0.5;
    R.add(hammer);
    VX.box(hammer, 0.12, 0.92, 0.12, 0x8a6a48, 0, -0.46, 0);
    VX.box(hammer, 0.46, 0.26, 0.26, 0xb8c2d2, 0, -0.98, 0, { metal: 0.5, rough: 0.4, tex: 'metal', tm: 'relief', tr: [0.5, 0.4] });
    VX.box(hammer, 0.14, 0.1, 0.3, 0x6d7688, 0.28, -0.98, 0);
    this.hammer = hammer;
    this.swing = 0; this.smashT = 0;

    // 쇼핑 카트
    var cart = new THREE.Group();
    cart.position.set(-1.95, 0.42, 0.85);
    R.add(cart);
    VX.box(cart, 0.62, 0.36, 0.44, 0x9fb0c8, 0, 0.15, 0, { metal: 0.35, rough: 0.4, tex: 'metal', tm: 'relief', tr: [0.6, 0.4] });
    VX.box(cart, 0.5, 0.06, 0.34, 0x6d7688, 0, 0.34, 0);
    VX.box(cart, 0.05, 0.5, 0.05, 0x6d7688, -0.3, -0.12, 0.16);
    VX.box(cart, 0.05, 0.5, 0.05, 0x6d7688, 0.3, -0.12, 0.16);
    this.cart = cart;

    this.state = { smashed: 0, perfect: 0, good: 0, miss: 0 };
    this.pendingQ = 'good';
    // 타이밍 미터용 골드 조명
    var glow = new THREE.PointLight(0xffd24a, 0.55, 5, 2);
    glow.position.set(0, 1.5, 1.6);
    R.add(glow);
    this.glow = glow;
  };

  MiniScene.prototype.updateShop = function (dt) {
    if (!this.stack) return;
    // 망치 스윙
    if (this.swing > 0) {
      this.swing -= dt;
      var k = 1 - Math.max(0, this.swing) / 0.26;
      this.hammer.rotation.z = -0.5 - Math.sin(k * Math.PI) * 2.0;
      if (!this.hitDone && k > 0.45) { this.hitDone = true; this.doSmash(); }
    } else {
      this.hammer.rotation.z += (-0.5 - this.hammer.rotation.z) * Math.min(1, dt * 7);
      this.hitDone = false;
    }
    if (this.dropBox && this.dropBox.userData.drop != null) {
      var dropper = this.dropBox;
      dropper.position.y = Math.max(dropper.userData.ty, dropper.position.y - dt * 6.5);
      if (dropper.position.y <= dropper.userData.ty) dropper.position.y = dropper.userData.ty;
    }
    // 가격표 통통
    this.cart.position.y = 0.42 + Math.sin(this.t * 2.2) * 0.02;
    if (this.glow) this.glow.intensity += (0.55 - this.glow.intensity) * Math.min(1, dt * 3);
  };

  MiniScene.prototype.tapShop = function () {
    return this.smash('good');
  };

  /* 게임 로직이 계산한 판정(perfect/good/miss)을 받아 타격 연출만 담당 */
  MiniScene.prototype.smash = function (q) {
    if (!this.stack) return null;
    if (this.swing > 0) return null;
    this.pendingQ = q === 'perfect' ? 'perfect' : q === 'miss' ? 'miss' : 'good';
    this.swing = 0.26;
    this.hitDone = false;
    return { q: this.pendingQ };
  };

  MiniScene.prototype.doSmash = function () {
    if (!this.stack || !this.stack.length) return;
    var q = this.pendingQ || 'good';
    var top = this.stack.pop();
    var p = top.position;
    this.root.remove(top);
    if (q === 'perfect') {
      this.burst.spawn(p.x, p.y, p.z, 0xffd24a, 22, { size: 0.1, speed: 3.4, life: 0.75 });
      this.burst.spawn(p.x, p.y + 0.25, p.z, 0xff5c66, 14, { size: 0.08, speed: 2.8, life: 0.6 });
      this.burst.spawn(p.x, p.y - 0.2, p.z, 0x8fd0ff, 10, { size: 0.06, speed: 2.4, life: 0.5 });
      this.shake = 0.42;
      this.state.perfect++;
      if (this.glow) this.glow.intensity = 1.5;
    } else if (q === 'good') {
      this.burst.spawn(p.x, p.y, p.z, 0xffd24a, 12, { size: 0.09, speed: 2.8, life: 0.65 });
      this.state.good++;
    } else {
      this.burst.spawn(p.x, p.y, p.z, 0x7f8a9a, 6, { size: 0.06, speed: 1.7, life: 0.45 });
      this.shake = 0.12;
      this.state.miss++;
    }
    this.state.smashed++;
    // 새 박스 낙하
    var cols = [0xd92340, 0x1a86bf, 0xd9a000, 0x1f9a63, 0x6544cc, 0xd9661a];
    var gb = new THREE.Group();
    gb.position.set(p.x, 2.6, p.z);
    gb.userData.ty = p.y;
    gb.userData.drop = 1;
    VX.box(gb, 0.58, 0.54, 0.58, cols[Math.floor(Math.random() * cols.length)], 0, 0, 0, { rough: 0.7 });
    VX.box(gb, 0.6, 0.06, 0.1, 0xfff3d0, 0, 0.02, 0, { cast: false });
    VX.box(gb, 0.1, 0.58, 0.6, 0xfff3d0, 0, 0, 0, { cast: false });
    this.root.add(gb);
    this.stack.push(gb);
    this.dropBox = gb;
    // 가격표 위치 갱신
    this.cart.children[0] && (this.cart.children[0].rotation.y = Math.sin(this.t) * 0.1);
  };

  /* ---------- 화요일: 골라치는 사내 메신저 (친구 톡 vs 부장님 지시) ---------- */
  var CHAT_CARDS = [
    { k: 'good', who: '잼대리', t: '점심 뭐 먹지?', c: 0x2fae7a },
    { k: 'good', who: '잼대리', t: 'ㅋㅋㅋ 이 짤 봐', c: 0x3f8ff0 },
    { k: 'good', who: '잼인턴', t: '칼퇴 가능?', c: 0x2fa6c4 },
    { k: 'good', who: '잼대리', t: '부장님 커피 갔대', c: 0x2fae7a },
    { k: 'good', who: '잼대리', t: '핫딜 떴다 ㄱㄱ', c: 0x3f8ff0 },
    { k: 'good', who: '잼대리', t: '이거 웃겨 죽음', c: 0x2fae7a },
    { k: 'bad', who: '잼부장', t: '보고서 오늘까지', c: 0xe03c4a },
    { k: 'bad', who: '잼부장', t: '야근 준비해라', c: 0xe03c4a },
    { k: 'bad', who: '잼부장', t: '회의 6시 소집', c: 0xd9384a },
    { k: 'bad', who: '잼사장', t: '주말 출근 가능?', c: 0xe0592f }
  ];

  /* 메시지 카드 한 장 = 캔버스 스프라이트 (테두리 색 + 종류 배지 + 이름 + 본문) */
  function chatSprite(text, accent, who, bad) {
    var w = 512, h = 150;
    var hex = '#' + ('000000' + (accent >>> 0).toString(16)).slice(-6);
    var tex = VX.canvasTex(w, h, function (g) {
      g.clearRect(0, 0, w, h);
      VX.roundRect(g, 6, 6, w - 12, h - 12, 26);
      g.fillStyle = bad ? 'rgba(46,14,22,.97)' : 'rgba(14,28,30,.97)';
      g.fill();
      g.lineWidth = 5;
      g.strokeStyle = hex;
      g.stroke();
      // 왼쪽 프로필 원
      g.beginPath(); g.arc(56, 62, 27, 0, Math.PI * 2);
      g.fillStyle = hex; g.fill();
      g.fillStyle = 'rgba(12,18,28,.92)';
      g.beginPath(); g.arc(47, 58, 4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(65, 58, 4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(56, 66, 9, 0, Math.PI, false);
      g.lineWidth = 3.5; g.strokeStyle = 'rgba(12,18,28,.92)'; g.stroke();
      // 이름 + 종류 배지
      g.fillStyle = hex;
      g.font = '900 22px "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
      g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillText(who, 94, 40);
      var badge = bad ? '📌 업무 지시' : '💬 답장 OK';
      g.font = '900 18px "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
      var bw = g.measureText(badge).width + 20;
      VX.roundRect(g, w - 16 - bw, 26, bw, 28, 14);
      g.fillStyle = bad ? 'rgba(224,60,74,.22)' : 'rgba(47,174,122,.2)';
      g.fill();
      g.strokeStyle = hex; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = hex;
      g.fillText(badge, w - 6 - bw, 40);
      // 본문
      g.fillStyle = '#f4f8ff';
      g.font = '900 34px "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
      g.fillText(text, 94, 98);
    });
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(2.06, 0.6, 1);
    return sp;
  }

  MiniScene.prototype.buildChat = function () {
    this.scene.background = new THREE.Color(0x121a2a);
    this.scene.fog = new THREE.Fog(0x121a2a, 13, 28);
    this.camera.fov = 44;
    this.camera.position.set(0.05, 2.05, 6.4);
    this.camera.lookAt(0, 2.0, -0.6);
    this.camera.updateProjectionMatrix();
    this.camX = 0.05; this.camY = 2.05; this.camZ = 6.4;
    this.dir.position.set(2, 6, 4);

    var R = this.root;
    // 책상 + 폰 본체
    VX.box(R, 6.4, 0.3, 3.6, 0x1d2130, 0, -0.78, -0.6, { cast: false, tex: 'wood', tr: [4, 2] });
    VX.box(R, 3.2, 4.8, 0.24, 0x0c0f1a, 0, 2.05, -1.75, { rough: 0.6 });
    VX.box(R, 3.0, 4.6, 0.05, 0x16243c, 0, 2.05, -1.6, { emissive: 0x1d3a63, emissiveIntensity: 0.34, cast: false });
    VX.box(R, 3.0, 0.1, 0.18, 0x39456a, 0, 4.48, -1.68, { cast: false });

    // 상단 대화방 헤더
    var hd = VX.label('단톡방 · 딴짓', '#8fd0ff', { w: 1.5 });
    hd.position.set(-0.5, 4.24, -1.5);
    R.add(hd);
    var nb = VX.label('새 메시지 3', '#ffd24a', { w: 0.86 });
    nb.position.set(1.02, 4.24, -1.5);
    R.add(nb);
    this.newBadge = nb;

    // 캐릭터(잼대리) 옆에서 폰 보는 자세
    var me = VX.humanoid({ suit: 0x3f7893, shirt: 0xdff4ff, tie: false, hair: 0x4a3524, scale: 0.62, badge: 0x69d8ff });
    me.position.set(-2.35, 0, -1.0);
    me.rotation.y = 0.55;
    R.add(me);
    this.me = me;
    this.meUd = me.userData;

    // 카드 3칸 (위에서 아래로 흐르는 대화 목록)
    this.cards = [];
    this.slotY = [3.05, 1.92, 0.79];
    this.cardN = 0;
    this.badInRow = 0;
    for (var i = 0; i < 3; i++) this.spawnCard(i);

    // 타이핑 점
    this.typing = new THREE.Group();
    this.typing.position.set(0.42, 0.32, 0.32);
    R.add(this.typing);
    for (var d = 0; d < 3; d++) VX.box(this.typing, 0.09, 0.09, 0.09, 0x8fd0ff, d * 0.16 - 0.16, 0, 0, { emissive: 0x2f6f9a, emissiveIntensity: 0.7, cast: false });

    this.state = { pops: 0, bad: 0, miss: 0 };
  };

  MiniScene.prototype.nextChatCard = function () {
    /* 빨강(업무 지시)·초록(친구 톡)이 번갈아 나오게 — 연속 빨강은 최대 1장 */
    var badChance = 0.34 + (this.intensity || 0) * 0.14;
    var wantBad = this.badInRow < 1 && Math.random() < badChance;
    var pool = [];
    for (var i = 0; i < CHAT_CARDS.length; i++) {
      if ((CHAT_CARDS[i].k === 'bad') === wantBad) pool.push(CHAT_CARDS[i]);
    }
    if (!this.deck) { this.deck = { good: [], bad: [] }; }
    var key = wantBad ? 'bad' : 'good';
    if (!this.deck[key] || !this.deck[key].length) {
      this.deck[key] = pool.slice();
      for (var d = this.deck[key].length - 1; d > 0; d--) {
        var j = (Math.random() * (d + 1)) | 0, t = this.deck[key][d];
        this.deck[key][d] = this.deck[key][j]; this.deck[key][j] = t;
      }
    }
    var card = this.deck[key].pop() || pool[0] || CHAT_CARDS[0];
    var guard = 0;
    while (guard++ < 6 && this.cards && this.cards.some(function (c) { return c && c.alive && c.text === card.t; })) {
      card = this.deck[key].length ? this.deck[key].pop() : pool[(Math.random() * pool.length) | 0];
    }
    this.badInRow = card.k === 'bad' ? this.badInRow + 1 : 0;
    return card;
  };

  MiniScene.prototype.spawnCard = function (slot) {
    var card = this.nextChatCard();
    var g = new THREE.Group();
    var sp = chatSprite(card.t, card.c, card.who, card.k === 'bad');
    g.add(sp);
    g.position.set(0, this.slotY[slot], 0.34);
    g.scale.setScalar(0.9);
    this.root.add(g);
    var rec = {
      g: g, sp: sp, slot: slot, baseY: this.slotY[slot], type: card.k,
      who: card.who, text: card.t, t: 0, alive: true, wait: 0, nx: 0.5, ny: 0.5
    };
    this.cards[slot] = rec;
    this.cardN++;
    return rec;
  };

  MiniScene.prototype.updateChat = function (dt) {
    if (!this.cards) return;
    var v = new THREE.Vector3();
    for (var i = 0; i < this.cards.length; i++) {
      var m = this.cards[i];
      if (!m) continue;
      if (!m.alive) {
        m.wait -= dt;
        if (m.wait <= 0) this.spawnCard(i);
        continue;
      }
      m.t += dt;
      m.g.position.y = m.baseY + Math.sin(this.t * 1.6 + i * 0.9) * 0.012;
      m.g.scale.setScalar(Math.min(1, 0.9 + m.t * 1.6));
      // 화면 좌표(0~1)를 매 프레임 갱신 → 탭 히트 테스트에 쓴다
      v.set(m.g.position.x, m.g.position.y, m.g.position.z);
      v.project(this.camera);
      m.nx = (v.x + 1) / 2;
      m.ny = (1 - v.y) / 2;
      if (m.t > 4.6) {
        this.root.remove(m.g);
        m.alive = false;
        m.wait = 0.95;
        if (m.type === 'good') { this.state.miss++; this.emit({ k: 'chatMiss' }); }
        else { this.emit({ k: 'chatDodge' }); }
      }
    }
    for (var d = 0; d < this.typing.children.length; d++) {
      var b = this.typing.children[d];
      b.position.y = Math.sin(this.t * 8 + d * 0.7) * 0.06;
    }
    if (this.newBadge) this.newBadge.visible = Math.sin(this.t * 2.2) > -0.4;
    if (this.meUd) {
      this.meUd.head.rotation.x = 0.16 + Math.sin(this.t * 1.6) * 0.05;
      this.meUd.head.rotation.y = Math.sin(this.t * 0.9) * 0.12;
      this.meUd.armR.rotation.x = -1.25 + Math.sin(this.t * 3.4) * 0.1;
      this.meUd.armL.rotation.x = -0.9;
    }
  };

  /* 탭 위치(0~1)로 카드를 골라 답장 */
  MiniScene.prototype.tapChatAt = function (nx, ny) {
    if (!this.cards) return { act: 'none' };
    var hit = -1, best = 9;
    for (var i = 0; i < this.cards.length; i++) {
      var m = this.cards[i];
      if (!m || !m.alive) continue;
      var dx = Math.abs(nx - m.nx), dy = Math.abs(ny - m.ny);
      if (dx < 0.44 && dy < 0.115) {
        var d = dx + dy;
        if (d < best) { best = d; hit = i; }
      }
    }
    if (hit < 0) return { act: 'none', cards: this.cards.length };
    var c = this.cards[hit];
    var p = c.g.position;
    if (c.type === 'good') {
      this.burst.spawn(p.x, p.y, p.z, 0x2fae7a, 12, { size: 0.07, speed: 2.4, life: 0.55 });
      this.burst.spawn(p.x, p.y + 0.1, p.z, 0xffffff, 5, { size: 0.05, speed: 1.8, life: 0.4 });
      this.state.pops++;
      this.emit({ k: 'chatGood', text: c.text });
    } else {
      this.burst.spawn(p.x, p.y, p.z, 0xff3d55, 16, { size: 0.09, speed: 3.0, life: 0.6 });
      this.shake = 0.32;
      this.state.bad++;
      this.emit({ k: 'chatBad', text: c.text, who: c.who });
    }
    this.root.remove(c.g);
    c.alive = false;
    c.wait = 0.95;
    this.badInRow = c.type === 'bad' ? 1 : 0;
    return { act: c.type, text: c.text, who: c.who, slot: hit };
  };

  MiniScene.prototype.chatState = function () {
    if (!this.cards) return null;
    var out = [];
    for (var i = 0; i < this.cards.length; i++) {
      var m = this.cards[i];
      if (m && m.alive) out.push({ type: m.type, text: m.text, ny: +m.ny.toFixed(3), nx: +m.nx.toFixed(3), t: +m.t.toFixed(2) });
    }
    return { cards: out, pops: this.state.pops, bad: this.state.bad, miss: this.state.miss };
  };

  /* ---------- 목요일: 몰래 숏폼 — ⬆ 다음 / ➡ 좋아요 / ⬅ 광고 스킵 ---------- */
  var SHORT_LINES = [
    { t: '고양이 3초 요리', c: 0xe0592f, e: 1 },
    { t: '신입 브이로그', c: 0x3f8ff0, e: 2 },
    { t: '직장인 밈 모음', c: 0x7a63e0, e: 3 },
    { t: '칼퇴 노하우', c: 0x2fae7a, e: 4 },
    { t: '급식 리뷰', c: 0xd98a2b, e: 5 },
    { t: '몰래 보는 중', c: 0xd94f8f, e: 2 },
    { t: '월요일 공감', c: 0x2fa6c4, e: 1 },
    { t: '퇴근길 ASMR', c: 0x9a68d8, e: 6 }
  ];
  var SHORT_ADS = [
    { t: '신제품 15초 광고', c: 0xd9a000, e: 7 },
    { t: '다이어트 보조제', c: 0xc98a2a, e: 7 },
    { t: '보험료 비교 광고', c: 0xb8862a, e: 7 }
  ];
  var MISSION_UI = {
    up: { ic: '▲', label: '다음 영상', hint: '위로 스와이프' },
    right: { ic: '♥', label: '좋아요', hint: '오른쪽 스와이프' },
    left: { ic: '↥', label: '광고 스킵', hint: '왼쪽 스와이프' }
  };

  function shortSprite(text, accent, kind) {
    var ad = kind === 7;
    var w = 384, h = 128;
    var tex = VX.canvasTex(w, h, function (g) {
      g.clearRect(0, 0, w, h);
      g.fillStyle = ad ? 'rgba(38,28,8,.94)' : 'rgba(8,10,18,.9)';
      VX.roundRect(g, 8, 8, w - 16, h - 16, 18);
      g.fill();
      if (ad) { g.strokeStyle = '#ffd24a'; g.lineWidth = 4; g.stroke(); }
      var cx = 52, cy = 64, col = '#' + ('000000' + (accent >>> 0).toString(16)).slice(-6);
      g.fillStyle = col;
      if (ad) {
        g.fillRect(cx - 26, cy - 20, 52, 40);
        g.fillStyle = '#2a1f08';
        g.font = '900 26px system-ui,-apple-system,sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('AD', cx, cy);
      } else if (kind === 1) { g.beginPath(); g.arc(cx, cy, 24, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(cx - 8, cy - 7, 3, 0, Math.PI * 2); g.fillStyle = '#0b0f18'; g.fill(); }
      else if (kind === 2) { g.fillRect(cx - 22, cy - 24, 44, 48); g.fillStyle = '#0b0f18'; g.fillRect(cx - 10, cy - 8, 20, 4); }
      else if (kind === 3) { g.beginPath(); g.moveTo(cx - 24, cy + 20); g.lineTo(cx - 8, cy - 22); g.lineTo(cx + 10, cy + 10); g.lineTo(cx + 24, cy - 12); g.lineTo(cx + 24, cy + 20); g.closePath(); g.fill(); }
      else if (kind === 4) { g.fillRect(cx - 24, cy - 6, 48, 12); g.fillRect(cx - 6, cy - 24, 12, 48); }
      else if (kind === 5) { g.beginPath(); g.arc(cx, cy + 6, 18, 0, Math.PI); g.fill(); g.fillRect(cx - 22, cy - 14, 44, 8); }
      else { g.beginPath(); g.moveTo(cx - 12, cy - 20); g.lineTo(cx + 22, cy); g.lineTo(cx - 12, cy + 20); g.closePath(); g.fill(); }
      g.fillStyle = '#f2f6ff';
      g.textAlign = 'left'; g.textBaseline = 'middle';
      g.font = '900 34px "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
      g.fillText(text, 96, 56);
      g.fillStyle = 'rgba(200,215,240,.75)';
      g.font = '800 22px "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
      g.fillText(ad ? '광고 · 건너뛰기 가능' : '@jam_official · 조회 ' + (12 + text.length * 7) + '만', 96, 92);
    });
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(1.42, 0.47, 1);
    return sp;
  }

  MiniScene.prototype.buildVideo = function () {
    this.scene.background = new THREE.Color(0x1b1226);
    this.scene.fog = new THREE.Fog(0x1b1226, 14, 30);
    this.camera.fov = 41;
    this.camera.position.set(0, 1.95, 6.05);
    this.camera.lookAt(0, 1.9, -0.8);
    this.camera.updateProjectionMatrix();
    this.camX = 0; this.camY = 1.95; this.camZ = 6.9;
    this.dir.position.set(2, 6, 4);

    var R = this.root;
    // 세로 폰: 뒤판 + 화면 + 앞쪽 베젤(카드가 화면 밖으로 나가면 베젤이 가린다)
    VX.box(R, 2.4, 4.3, 0.22, 0x0b0c14, 0, 1.95, -1.66, { rough: 0.55 });
    VX.box(R, 2.06, 3.96, 0.05, 0x120d1c, 0, 1.95, -1.60, { cast: false });
    VX.box(R, 0.2, 4.3, 0.17, 0x0b0c14, -1.1, 1.95, -1.36, { cast: false });
    VX.box(R, 0.2, 4.3, 0.17, 0x0b0c14, 1.1, 1.95, -1.36, { cast: false });
    VX.box(R, 2.4, 0.22, 0.17, 0x0b0c14, 0, 4.0, -1.36, { cast: false });
    VX.box(R, 2.4, 0.22, 0.17, 0x0b0c14, 0, -0.1, -1.36, { cast: false });
    VX.box(R, 0.3, 0.05, 0.08, 0x39456a, 0, 4.0, -1.28, { cast: false });
    // 오른쪽 좋아요·댓글 기둥
    VX.box(R, 0.26, 0.26, 0.26, 0x2a1a34, 1.26, 1.45, -1.2, { cast: false });
    VX.box(R, 0.2, 0.2, 0.2, 0xd94f8f, 1.26, 1.45, -1.12, { emissive: 0x8a1f4a, emissiveIntensity: 0.5, cast: false });
    VX.box(R, 0.24, 0.24, 0.24, 0x22283c, 1.26, 0.92, -1.2, { cast: false });
    VX.box(R, 0.24, 0.24, 0.24, 0x22283c, 1.26, 0.44, -1.2, { cast: false });
    // 진행 바
    VX.box(R, 0.9, 0.05, 0.1, 0x3a2a4a, 0, -0.36, -1.2, { cast: false });
    this.vBar = VX.box(R, 0.02, 0.05, 0.11, 0xffd24a, -0.44, -0.36, -1.19, { emissive: 0xd9a000, emissiveIntensity: 0.7, cast: false });

    // 숏폼 카드 2장(보이는 1장 + 아래 대기 1장, 베젤 뒤에서 올라온다)
    this.cards = [];
    this.cardIdx = 0;
    this.mIdx = 0;
    this.anim = null;
    this.lastMission = '';
    var c0 = this.makeShort(1.95);
    var c1 = this.makeShort(-4.6);
    c1.g.visible = false;
    this.cards.push(c0, c1);
    this.likeN = 0;
    var like = VX.label('♥ 0', '#ff9bd0', { w: 0.72 });
    like.position.set(1.26, 2.02, -1.1);
    R.add(like);
    this.likeLabel = like;

    this.missionTag = null;

    this.state = { swipes: 0, right: 0, left: 0 };
  };

  MiniScene.prototype.nextMission = function () {
    /* 미션 순환: 위주 + 좋아요/광고 섞기 (연속 광고 금지) */
    var roll = Math.random();
    var m = roll < 0.52 ? 'up' : roll < 0.78 ? 'right' : 'left';
    if (m === 'left' && this.lastMission === 'left') m = 'up';
    if (m === 'right' && this.lastMission === 'right') m = 'up';
    this.lastMission = m;
    return m;
  };

  MiniScene.prototype.makeShort = function (y) {
    var mission = this.nextMission();
    var ad = mission === 'left';
    var pool = ad ? SHORT_ADS : SHORT_LINES;
    var line = pool[this.cardIdx++ % pool.length];
    var g = new THREE.Group();
    g.position.set(0, y, -1.52);
    // 영상 배경(색 그라데이션 3단) + 테두리
    var base = new THREE.Color(ad ? 0x3a2a08 : line.c);
    for (var b = 0; b < 3; b++) {
      var col = base.clone().offsetHSL(b * 0.02, 0, 0.18 - b * 0.15).getHex();
      VX.box(g, 1.9, 1.26, 0.05, col, 0, 1.26 - b * 1.26, 0, { emissive: col, emissiveIntensity: 0.12, cast: false });
    }
    VX.box(g, 1.94, 3.82, 0.03, 0x101018, 0, 0, -0.04, { cast: false });
    // 종류별 복셀 소품
    var prop = new THREE.Group();
    prop.position.set(0, 0.35, 0.08);
    g.add(prop);
    var white = 0xf4f7ff, dark = 0x14161f;
    if (ad) {                     // 광고: 상자 + AD
      VX.box(prop, 0.66, 0.66, 0.2, 0xd9a000, 0, 0, 0, { cast: false, emissive: 0x6b4a00, emissiveIntensity: 0.25 });
      VX.box(prop, 0.5, 0.14, 0.22, 0x2a1f08, 0, 0, 0.02, { cast: false });
      VX.box(prop, 0.14, 0.5, 0.22, 0x2a1f08, 0, 0, 0.02, { cast: false });
    } else if (line.e === 1) {    // 고양이
      VX.box(prop, 0.62, 0.5, 0.16, white, 0, 0, 0, { cast: false });
      VX.box(prop, 0.12, 0.18, 0.06, white, -0.2, 0.3, 0, { cast: false });
      VX.box(prop, 0.12, 0.18, 0.06, white, 0.2, 0.3, 0, { cast: false });
      VX.box(prop, 0.07, 0.07, 0.04, dark, -0.15, 0.06, 0.09, { cast: false });
      VX.box(prop, 0.07, 0.07, 0.04, dark, 0.15, 0.06, 0.09, { cast: false });
      VX.box(prop, 0.07, 0.05, 0.04, 0xe08a9a, 0, -0.03, 0.09, { cast: false });
    } else if (line.e === 2) {    // 사람
      VX.box(prop, 0.3, 0.3, 0.16, 0xf0c49b, 0, 0.22, 0, { cast: false });
      VX.box(prop, 0.46, 0.44, 0.16, 0x2b3650, 0, -0.16, 0, { cast: false });
      VX.box(prop, 0.1, 0.18, 0.04, 0xf4f7ff, 0, 0.02, 0.09, { cast: false });
    } else if (line.e === 3) {    // 밈(지그재그)
      for (var i = 0; i < 4; i++) VX.box(prop, 0.16, 0.16, 0.12, i % 2 ? 0xffd24a : 0xff6b8a, -0.3 + i * 0.2, i % 2 ? 0.1 : -0.1, 0, { cast: false });
    } else if (line.e === 4) {    // 플러스(노하우)
      VX.box(prop, 0.5, 0.14, 0.14, 0x8bf0b8, 0, 0, 0, { cast: false });
      VX.box(prop, 0.14, 0.5, 0.14, 0x8bf0b8, 0, 0, 0, { cast: false });
    } else if (line.e === 5) {    // 그릇(급식)
      VX.box(prop, 0.56, 0.14, 0.18, 0xf4f7ff, 0, -0.06, 0, { cast: false });
      VX.box(prop, 0.36, 0.16, 0.1, 0xd98a2b, 0, 0.1, 0, { cast: false });
    } else {                       // 재생(삼각형)
      VX.box(prop, 0.16, 0.16, 0.12, 0xf4f7ff, -0.08, 0, 0, { cast: false });
      VX.box(prop, 0.16, 0.16, 0.12, 0xf4f7ff, 0.1, 0.08, 0, { cast: false });
      VX.box(prop, 0.16, 0.16, 0.12, 0xf4f7ff, 0.1, -0.08, 0, { cast: false });
    }
    // 자막·채널
    var cap = shortSprite(line.t, line.c, ad ? 7 : line.e);
    cap.position.set(0, -1.28, 0.06);
    g.add(cap);
    // 미션 배지 (카드 위쪽, 방향 아이콘)
    var badgeTex = VX.canvasTex(256, 84, (function (ms) {
      return function (gg, w, h) {
        gg.clearRect(0, 0, w, h);
        VX.roundRect(gg, 4, 4, w - 8, h - 8, 22);
        var col = ms === 'right' ? 'rgba(64,16,40,.92)' : ms === 'left' ? 'rgba(52,38,8,.92)' : 'rgba(10,32,48,.92)';
        var line2 = ms === 'right' ? '#ff9bd0' : ms === 'left' ? '#ffd24a' : '#8fd0ff';
        gg.fillStyle = col; gg.fill();
        gg.strokeStyle = line2; gg.lineWidth = 4; gg.stroke();
        gg.fillStyle = line2;
        gg.font = '900 40px "Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif';
        gg.textAlign = 'center'; gg.textBaseline = 'middle';
        var txt = ms === 'up' ? '▲ NEXT' : ms === 'right' ? '♥ 좋아요' : '⏭ AD SKIP';
        gg.fillText(txt, w / 2, h / 2 + 2);
      };
    })(mission));
    var badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex, transparent: true, depthWrite: false }));
    badge.scale.set(1.34, 0.44, 1);
    badge.position.set(0, 1.62, 0.12);
    g.add(badge);
    this.root.add(g);
    return { g: g, targetY: y, c: line.c, cap: line.t, out: false, outDir: '', mission: mission, ad: ad, badge: badge };
  };

  MiniScene.prototype.updateVideo = function (dt) {
    if (!this.cards) return;
    for (var i = 0; i < this.cards.length; i++) {
      var c = this.cards[i];
      if (c.out) {
        if (c.outDir === 'up') {
          c.g.position.y += dt * 10;
          c.g.scale.setScalar(Math.max(0.2, c.g.scale.x - dt * 2.2));
        } else if (c.outDir === 'right') {
          c.g.position.x += dt * 5.0;
          c.g.position.y += dt * 0.9;
          c.g.rotation.z -= dt * 2.2;
        } else {
          c.g.position.x -= dt * 5.0;
          c.g.position.y += dt * 0.6;
          c.g.rotation.z += dt * 2.2;
        }
      } else {
        c.g.position.y += (c.targetY - c.g.position.y) * Math.min(1, dt * 10);
        c.g.scale.setScalar(1);
        c.g.visible = c.g.position.y + 1.92 > -0.25;
      }
      if (i === 0 && !c.out) c.g.position.x = Math.sin(this.t * 0.8) * 0.03;
    }
    // 화면 정리
    if (this.cards[0] && this.cards[0].out) {
      var d0 = this.cards[0];
      var far = d0.outDir === 'up' ? d0.g.position.y > 6.2
        : Math.abs(d0.g.position.x) > 3.6;
      if (far) {
        var done = this.cards.shift();
        this.root.remove(done.g);
        var nc = this.makeShort(-4.6);
        nc.targetY = -4.6;
        nc.g.visible = false;
        this.cards.push(nc);
        this.anim = null;
      }
    }
    // 좋아요 라벨 통통
    if (this.likeLabel) this.likeLabel.position.y = 2.02 + Math.sin(this.t * 3) * 0.02;
    if (this.vBar) {
      var p = 0.02 + ((this.state.swipes % 10) / 10) * 0.9;
      this.vBar.scale.x = p / 0.02;
      this.vBar.position.x = -0.44 + p / 2;
    }
  };

  /* 방향 스와이프 — 맞으면 카드가 그 방향으로 날아가고, 틀리면 흔들린다 */
  MiniScene.prototype.swipeDir = function (dir) {
    if (!this.cards) return { ok: false, busy: true };
    if (this.anim) return { ok: false, busy: true };
    var c = this.cards[0];
    if (!c) return { ok: false, busy: true };
    if (dir !== c.mission) {
      this.shake = 0.2;
      this.nudgeDir = dir;
      this.nudgeT = 0.32;
      this.burst.spawn(0, 1.4, -1.2, 0xff7a86, 5, { size: 0.05, speed: 1.4, life: 0.35 });
      return { ok: false, dir: dir, want: c.mission };
    }
    c.out = true;
    c.outDir = dir;
    this.anim = { t: 0 };
    if (this.cards[1]) this.cards[1].targetY = 1.95;
    this.state.swipes++;
    if (dir === 'right') {
      this.likeN++;
      this.state.right++;
      this.burst.spawn(1.05, 1.3, -1.1, 0xff6fb2, 12, { size: 0.07, speed: 2.6, life: 0.6 });
      if (this.likeLabel) {
        this.likeLabel.material.map.dispose();
        var n = this.likeN;
        this.likeLabel.material.map = VX.canvasTex(256, 72, function (g, w, h) {
          g.clearRect(0, 0, w, h);
          VX.roundRect(g, 8, 10, w - 16, h - 20, 18);
          g.fillStyle = 'rgba(30,12,26,.86)'; g.fill();
          g.strokeStyle = '#ff9bd0'; g.lineWidth = 4; g.stroke();
          g.fillStyle = '#ff9bd0';
          g.font = '800 34px system-ui,-apple-system,sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText('♥ ' + n, w / 2, h / 2 + 1);
        });
        this.likeLabel.material.needsUpdate = true;
      }
    } else if (dir === 'left') {
      this.state.left++;
      this.burst.spawn(-0.4, 1.2, -1.1, 0xffd24a, 10, { size: 0.06, speed: 2.2, life: 0.55 });
    } else {
      this.burst.spawn(0, 0.1, -1.15, c.c, 8, { size: 0.06, speed: 2.0, life: 0.5 });
    }
    var next = this.cards[1] ? this.cards[1].mission : '';
    return { ok: true, dir: dir, mission: c.mission, next: next, ad: c.ad };
  };

  MiniScene.prototype.mission = function () {
    if (!this.cards || !this.cards[0]) return { dir: 'up', ad: false };
    var c = this.cards[0];
    return { dir: c.mission, ad: !!c.ad, title: c.cap, ui: MISSION_UI[c.mission] };
  };

  MiniScene.prototype.videoState = function () {
    if (!this.cards) return null;
    return { mission: this.mission(), swipes: this.state.swipes, right: this.state.right, left: this.state.left, like: this.likeN };
  };

  /* =========================================================
     컨트롤러
     ========================================================= */
  function init(opts) {
    try {
      if (opts.officeEl) office = new OfficeScene(opts.officeEl);
      if (opts.miniEl) mini = new MiniScene(opts.miniEl);
    } catch (e) {
      if (window.console && console.warn) console.warn('[3D]', e && e.message);
    }
    if (!started) { started = true; rafId = requestAnimationFrame(loop); }
    return { office: !!(office && office.ok), mini: !!(mini && mini.ok) };
  }

  function setBoss(who, pos, dur) { if (office && office.ok) office.setBoss(who, pos, dur); }
  function begin(bosses) { if (office && office.ok) office.begin(bosses); }
  function setStage(kind) {
    if (office && office.ok) office.setStage(kind);
    if (mini && mini.ok) mini.buildStage(kind);
  }
  function caught() { if (office && office.ok) office.beginCaught(); }
  function reveal() { if (office && office.ok) office.reveal(); }
  function release() { if (office && office.ok) office.reset(); }
  function tap(nx, ny) {
    if (!mini || !mini.ok) return;
    if (mini.kind === 'jump') mini.tapJump();
    else if (mini.kind === 'chart') mini.tapChart();
    else if (mini.kind === 'chat') mini.tapChatAt(nx == null ? 0.5 : nx, ny == null ? 0.5 : ny);
    else if (mini.kind === 'video') return;
    else mini.smash('good');
  }
  function swipe(dir) {
    if (!mini || !mini.ok) return { ok: false, busy: true };
    if (mini.kind === 'video') return mini.swipeDir(dir || 'up');
    tap();
    return { ok: false, busy: true };
  }
  function coinTap() { return (mini && mini.ok && mini.kind === 'chart') ? mini.coinTap() : { act: 'none' }; }
  function coinState() { return (mini && mini.ok && mini.kind === 'chart') ? mini.coinState() : null; }
  function coinDebug(o) { return (mini && mini.ok) ? mini.coinDebug(o) : null; }
  function setFrozen(v) { if (mini && mini.ok) mini.setFrozen(v); }
  function cine(kind, dur) { if (office && office.ok) office.setCine(kind, dur); }
  function cineOff() { if (office && office.ok) office.clearCine(); }
  function cineShot(kind) { return (office && office.ok) ? office.cineShot(kind) : ''; }
  function secondMark(who, on) { if (office && office.ok) office.markSecond(who, on); }
  function setMiniActive(on) { if (mini && mini.ok) mini.setActive(on); }
  function setActive(on) { if (office && office.ok) office.active = !!on; }
  function snapshot(pose) { return (office && office.ok) ? office.snapshot(pose) : ''; }
  /* 컷신: 사무실 캔버스를 전체 화면 레이어로 옮겨 실시간 3D로 돌린다 */
  var officeHome = null;
  function cineMount(el) {
    if (!office || !office.ok || !el || !office.canvas) return false;
    if (!officeHome) officeHome = office.host;
    try {
      el.appendChild(office.canvas);
      office.host = el;
      office.resize();
      return true;
    } catch (e) { return false; }
  }
  function cineUnmount() {
    if (!office || !office.ok || !office.canvas) return false;
    var h = officeHome || (typeof document !== 'undefined' ? document.getElementById('office3d') : null);
    if (!h) return false;
    try {
      h.appendChild(office.canvas);
      office.host = h;
      office.resize();
      return true;
    } catch (e) { return false; }
  }
  function anchor(who) { return (office && office.ok) ? office.anchor(who) : { on: false, x: 0.5, y: 0.45 }; }
  function cineResize() { if (office && office.ok) office.resize(); }
  function cineFreeze(k) {
    if (!office || !office.ok || !office.cineKind) return false;
    office.cineHold = Math.max(0, Math.min(1, Number(k) || 0));
    office.cineT = office.cineHold * office.cineDur;
    office.cineCamera(office.cineHold);
    return true;
  }

  function cineProgress() {
    if (!office || !office.ok || !office.cineKind) return 1;
    return Math.max(0, Math.min(1, office.cineT / Math.max(0.001, office.cineDur)));
  }
  function pollEvents() { return (mini && mini.ok) ? mini.poll() : []; }
  function setIntensity(v) { if (mini && mini.ok) mini.intensity = Math.max(0, Math.min(1, Number(v) || 0)); }
  function tapJump() { return (mini && mini.ok && mini.kind === 'jump') ? mini.tapJump() : { act: 'none' }; }
  function tapChat(nx, ny) { return (mini && mini.ok && mini.kind === 'chat') ? mini.tapChatAt(nx, ny) : { act: 'none' }; }
  function smash(q) { return (mini && mini.ok && mini.kind === 'shop') ? mini.smash(q) : null; }
  function swipeDir(dir) { return (mini && mini.ok && mini.kind === 'video') ? mini.swipeDir(dir) : { ok: false, busy: true }; }
  function mission() { return (mini && mini.ok && mini.kind === 'video') ? mini.mission() : null; }
  function jumpState() { return (mini && mini.ok) ? mini.jumpState() : null; }
  function chatState() { return (mini && mini.ok) ? mini.chatState() : null; }
  function videoState() { return (mini && mini.ok) ? mini.videoState() : null; }
  function status() {
    return {
      office: !!(office && office.ok), mini: !!(mini && mini.ok),
      kind: mini ? mini.kind : '', active: mini ? mini.active : false,
      boss: office ? office.checker : '', mode: office ? office.mode : ''
    };
  }

  return {
    init: init, setBoss: setBoss, begin: begin, setStage: setStage, caught: caught, reveal: reveal,
    release: release, tap: tap, setMiniActive: setMiniActive, setActive: setActive, snapshot: snapshot,
    status: status,
    swipe: swipe, coinTap: coinTap, coinState: coinState, coinDebug: coinDebug, setFrozen: setFrozen,
    cine: cine, cineOff: cineOff, cineShot: cineShot, secondMark: secondMark,
    cineMount: cineMount, cineUnmount: cineUnmount, anchor: anchor, cineResize: cineResize, cineProgress: cineProgress, cineFreeze: cineFreeze,
    pollEvents: pollEvents, setIntensity: setIntensity,
    tapJump: tapJump, tapChat: tapChat, smash: smash, swipeDir: swipeDir, mission: mission,
    jumpState: jumpState, chatState: chatState, videoState: videoState,
    office: function () { return office; }, mini: function () { return mini; }
  };
})();
