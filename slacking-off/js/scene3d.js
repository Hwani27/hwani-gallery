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
          visible: key !== 'jamsajang', mode: 'far'
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
    var c = this.chars;
    for (var k in c) {
      c[k].mark.visible = false;
      c[k].scan = 0;
      c[k].target = { x: c[k].root.position.x, z: c[k].root.position.z };
      c[k].moveSpeed = 0;
      if (k === 'jambujang') { c[k].root.position.set(-0.25, 0, -6.15); c[k].visible = false; }
      if (k === 'jamsajang') { c[k].root.position.set(1.55, 0, -6.35); c[k].visible = false; }
      if (k === 'jamdaeri') { c[k].root.position.set(2.05, 0, 0.95); c[k].visible = true; }
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

  OfficeScene.prototype.update = function (dt) {
    var self = this;
    this.t += dt;
    // 카메라 줌
    this.zoom += (this.zoomTarget - this.zoom) * Math.min(1, dt * 6);
    this.setCamera(this.zoom);
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
      } else {
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
    this.burst.update(dt);
  };

  OfficeScene.prototype.frame = function (dt) {
    if (!this.ok || this.active === false) return;
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

  /* =========================================================
     모니터 안 3D 미니게임
     ========================================================= */
  function MiniScene(host) {
    this.host = host;
    this.ok = false;
    this.kind = 'jump';
    this.active = true;
    this.t = 0;
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
    this.camera.updateProjectionMatrix();
  };

  MiniScene.prototype.clear = function () {
    while (this.root.children.length) this.root.remove(this.root.children[0]);
    this.parts = {};
    this.state = {};
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
    this.renderer.render(this.scene, this.camera);
  };

  MiniScene.prototype.buildStage = function (kind) {
    this.kind = kind;
    this.clear();
    this.hemi.intensity = (kind === 'shop' || kind === 'chat') ? 0.3 : kind === 'chart' ? 0.22 : kind === 'video' ? 0.26 : 0.3;
    this.dir.intensity = (kind === 'shop' || kind === 'chat') ? 1.0 : kind === 'chart' ? 0.9 : kind === 'video' ? 0.85 : 0.95;
    if (kind === 'jump') this.buildJump();
    else if (kind === 'chart') this.buildChart();
    else if (kind === 'chat') this.buildChat();
    else if (kind === 'video') this.buildVideo();
    else this.buildShop();
  };

  /* ---------- 월요일: 3D 블록 점프 ---------- */
  MiniScene.prototype.buildJump = function () {
    this.scene.background = new THREE.Color(0x1b3557);
    this.scene.fog = new THREE.Fog(0x1b3557, 10, 24);
    this.camera.fov = 46;
    this.camera.position.set(0.25, 2.55, 6.05);
    this.camera.lookAt(-0.1, 1.0, -0.35);
    this.camera.updateProjectionMatrix();
    this.dir.position.set(2.5, 6, 4);

    var R = this.root;
    // 별
    for (var i = 0; i < 22; i++) {
      VX.box(R, 0.09, 0.09, 0.09, 0xfff4c8, -4 + Math.random() * 8, 2.6 + Math.random() * 3.2, -5 - Math.random() * 6, { emissive: 0xfff0b0, emissiveIntensity: 1.4, cast: false });
    }
    // 공중 블록 코스 (잔디 윗면 + 바위 옆면)
    [[-1.75, 0.9, -1.4, 0.9], [-0.15, 1.35, -2.0, 0.75], [1.35, 1.0, -1.5, 0.85]].forEach(function (b) {
      VX.box(R, b[3], 0.3, b[3], 0x8a6540, b[0], b[1], b[2], { tex: 'rock', tr: [0.9, 0.9], tint: 0xa9a59d });
      VX.box(R, b[3], 0.09, b[3], 0x57ad62, b[0], b[1] + 0.19, b[2], { cast: false, tex: 'grass', tr: [0.8, 0.8] });
    });
    // 바닥 플랫폼(흙 블록 5칸 + 잔디 윗면)
    for (var g = 0; g < 5; g++) {
      var x = -1.44 + g * 0.72;
      VX.box(R, 0.72, 0.5, 1.9, 0x7a5636, x, 0.0, 0.1, { tex: 'dirt', tr: [0.7, 1.8] });
      VX.box(R, 0.72, 0.1, 1.9, g % 2 ? 0x4c9e58 : 0x57ad62, x, 0.3, 0.1, { cast: false, tex: 'grass', tr: [0.7, 1.9] });
      VX.box(R, 0.66, 0.06, 0.06, 0x8f6a44, x, 0.17, 1.04, { cast: false });
    }
    // 플랫폼 아래 그늘
    VX.box(R, 3.9, 0.4, 2.1, 0x3d2c1e, 0.1, -0.45, 0.1, { cast: false });
    // 잔디 디테일
    [[-1.5, 0.3], [1.3, 0.35], [0.2, 0.3]].forEach(function (b, i) {
      VX.box(R, 0.1, 0.16, 0.1, 0x3f8f4e, b[0] + 0.12 * i, b[1] + 0.08, 0.72, { cast: false });
    });
    // 구름
    [[-2.6, 3.55, -6.4], [-2.25, 3.7, -6.4], [0.4, 3.8, -6.8], [0.75, 3.65, -6.8]].forEach(function (c) {
      VX.box(R, 0.5, 0.3, 0.4, 0xc9dbf2, c[0], c[1], c[2], { emissive: 0x7f95b8, emissiveIntensity: 0.18, cast: false });
    });

    // 코인·별
    this.coins = [];
    var gold = VX.mat(0xffb200, { metal: 0.25, rough: 0.42, emissive: 0x8a5200, emissiveIntensity: 0.35 });
    var coinGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16);
    var coinInnerGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.065, 12);
    var goldDark = VX.mat(0xd89400, { metal: 0.3, rough: 0.45, emissive: 0x6b4200, emissiveIntensity: 0.35 });
    var spots = [[-1.75, 1.55], [-1.2, 1.3], [-0.7, 1.7], [-0.15, 2.0], [0.4, 1.9], [0.95, 1.55], [1.45, 1.35], [1.85, 1.15]];
    for (var c = 0; c < spots.length; c++) {
      var coin = new THREE.Group();
      var co = new THREE.Mesh(coinGeo, gold); co.rotation.x = Math.PI / 2; co.castShadow = true;
      var ci = new THREE.Mesh(coinInnerGeo, goldDark); ci.rotation.x = Math.PI / 2;
      coin.add(co); coin.add(ci);
      coin.position.set(spots[c][0], spots[c][1], 0.35);
      R.add(coin);
      this.coins.push({ m: coin, x: spots[c][0], y: spots[c][1], taken: false, t: 0 });
    }
    this.stars = [];
    var starArr = this.stars;
    var starMat = VX.mat(0xffd93a, { emissive: 0x8a5a00, emissiveIntensity: 0.45, rough: 0.42, metal: 0.3 });
    var sg = VX.starGeo(0.26, 0.11, 0.09);
    [[-1.3, 2.3], [1.35, 1.8]].forEach(function (p) {
      var st = new THREE.Group();
      var core = new THREE.Mesh(sg, starMat);
      st.add(core);
      st.position.set(p[0], p[1], 0.1);
      st.rotation.z = -0.15;
      R.add(st);
      starArr.push({ m: st, x: p[0], y: p[1], taken: false, t: 0 });
    });

    // 플레이어 (잼인턴)
    this.player = VX.humanoid({ suit: 0x3f6fd8, shirt: 0xdfe9ff, tie: false, cap: 0x2b3a6a, hair: 0x2a231d, scale: 0.66, badge: 0x8fd0ff });
    this.baseY = 0.35;
    this.player.position.set(-0.62, this.baseY, 0.5);
    R.add(this.player);
    this.pud = this.player.userData;
    this.py = 0; this.vy = 0; this.jumpN = 0;
    this.state = { px: -0.62, py: 0, vy: 0, jumps: 0, landed: 0 };

    // 앞쪽 장식 블록
    VX.box(R, 0.34, 0.34, 0.34, 0xffd24a, -2.9, 0.17, 1.1, { emissive: 0x6b4a00, emissiveIntensity: 0.2 });
    VX.box(R, 0.34, 0.34, 0.34, 0x8fd0ff, 2.95, 0.17, 1.2, { emissive: 0x2a5a8a, emissiveIntensity: 0.3 });
  };

  MiniScene.prototype.updateJump = function (dt) {
    var s = this.state, self = this;
    // 물리
    if (s.py > 0 || s.vy > 0) {
      s.vy -= 15.5 * dt;
      s.py += s.vy * dt;
      if (s.py <= 0) {
        s.py = 0; s.vy = 0; s.jumps = 0;
        this.burst.spawn(this.player.position.x, 0.08, 0.12, 0x9fdc9f, 4, { size: 0.06, speed: 1.2, life: 0.35 });
      }
    }
    this.player.position.y = this.baseY + s.py;
    // 팔 들기
    var air = s.py > 0.05;
    this.pud.armL.rotation.z = air ? 0.9 + Math.sin(this.t * 10) * 0.2 : 0;
    this.pud.armR.rotation.z = air ? -0.9 - Math.sin(this.t * 10) * 0.2 : 0;
    this.pud.armL.rotation.x = air ? -0.6 : 0;
    this.pud.armR.rotation.x = air ? -0.6 : 0;
    this.pud.legL.rotation.x = air ? 0.5 : 0;
    this.pud.legR.rotation.x = air ? -0.4 : 0;
    this.pud.head.rotation.z = s.vy > 0 ? 0.08 : 0;

    // 코인 회전 + 획득
    var i;
    for (i = 0; i < this.coins.length; i++) {
      var c = this.coins[i];
      if (c.taken) {
        c.t += dt * 2.2;
        c.m.position.y += dt * 1.6;
        c.m.scale.setScalar(Math.max(0.001, 1 - c.t));
        if (c.t > 1) c.taken = false;
        continue;
      }
      c.m.rotation.y += dt * 2.4;
      c.m.position.y = c.y + Math.sin(this.t * 2 + i) * 0.06;
      var dy = c.y - (this.baseY + 0.95 + s.py);
      var dx = c.x - this.player.position.x;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.55) {
        c.taken = true; c.t = 0;
        this.burst.spawn(c.x, c.y, 0.15, 0xffcf3d, 6, { size: 0.07, speed: 1.8, life: 0.5 });
      }
    }
    for (i = 0; i < this.stars.length; i++) {
      var st = this.stars[i];
      st.m.rotation.y += dt * 1.8;
      st.m.position.y = st.y + Math.sin(this.t * 2.2 + i * 2) * 0.08;
      if (!st.taken) {
        var ddy = st.y - (this.baseY + 0.95 + s.py), ddx = st.x - this.player.position.x;
        if (Math.abs(ddx) < 0.55 && Math.abs(ddy) < 0.6) {
          st.taken = true;
          st.m.visible = false;
          this.burst.spawn(st.x, st.y, 0.1, 0xfff06a, 10, { size: 0.08, speed: 2.4, life: 0.6 });
        }
      }
    }
  };

  MiniScene.prototype.tapJump = function () {
    var s = this.state;
    if (!s) return;
    if (s.py <= 0.001) { s.vy = 6.1; s.jumps = 1; }
    else if (s.jumps < 3) { s.vy = 5.0; s.jumps++; }
    this.burst.spawn(this.player.position.x, s.py + 0.05, 0.12, 0x8fd0ff, 4, { size: 0.05, speed: 1.4, life: 0.35 });
  };

  /* ---------- 수요일: 3D 코인 차트 + 사격 ---------- */
  MiniScene.prototype.buildChart = function () {
    this.scene.background = new THREE.Color(0x122c3f);
    this.scene.fog = new THREE.Fog(0x122c3f, 11, 25);
    this.camera.fov = 40;
    this.camera.position.set(0, 2.0, 6.4);
    this.camera.lookAt(0, 1.35, -0.4);
    this.camera.updateProjectionMatrix();
    this.dir.position.set(2, 6, 4);

    var R = this.root;
    // 바닥 그리드
    VX.box(R, 12, 8, 0.2, 0x0e2434, 0, 2.4, -4.3, { cast: false, tex: 'metal', tm: 'relief', tr: [14, 9] });
    for (var gw = 0; gw < 5; gw++) {
      VX.box(R, 11, 0.02, 0.02, 0x1f6a8a, 0, 0.8 + gw * 0.6, -4.18, { emissive: 0x1f7a9a, emissiveIntensity: 0.3, cast: false });
    }
    VX.box(R, 7.4, 0.1, 6.4, 0x102436, 0, -0.05, -0.6, { cast: false, tex: 'concrete', tr: [3, 2.6] });
    for (var g = 0; g < 9; g++) {
      VX.box(R, 7.2, 0.015, 0.03, 0x1a4a66, 0, 0.005, -2.6 + g * 0.55, { emissive: 0x1f5a7a, emissiveIntensity: 0.25, cast: false });
    }
    for (var gx = 0; gx < 9; gx++) {
      VX.box(R, 0.03, 0.015, 6.2, 0x1a4a66, -3.2 + gx * 0.8, 0.005, -0.6, { emissive: 0x1f5a7a, emissiveIntensity: 0.18, cast: false });
    }
    // 차트 바
    this.bars = [];
    for (var b = 0; b < 12; b++) {
      var h = 0.25 + (b * 0.11) + Math.sin(b * 1.3) * 0.18;
      var col = b < 4 ? 0x12603f : b < 8 ? 0x188a56 : 0x1fa86a;
      var bar = VX.box(R, 0.34, 1, 0.34, col, -2.42 + b * 0.44, h / 2, -1.35, { emissive: 0x0a3324, emissiveIntensity: 0.22, rough: 0.78 });
      bar.scale.y = h;
      this.bars.push({ m: bar, h: h, x: -2.42 + b * 0.44 });
    }
    VX.box(R, 5.8, 0.06, 0.5, 0x1a3a4e, 0, 0.03, -1.35, { cast: false });

    // 코인 타겟
    this.targets = [];
    this.targetGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.09, 16);
    this.targetInnerGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 12);
    this.targetMat = VX.mat(0xffc222, { metal: 0.3, rough: 0.4, emissive: 0x6b4200, emissiveIntensity: 0.4 });
    this.targetInnerMat = VX.mat(0xd88f00, { metal: 0.25, rough: 0.5, emissive: 0x4a2a00, emissiveIntensity: 0.3 });
    for (var t = 0; t < 3; t++) this.spawnTarget(t);

    // 사격 총(화면 오른쪽 아래) + 머즐
    this.shotFrom = new THREE.Vector3(0, 0.35, 3.3);
    this.shots = [];
    this.tracer = VX.box(R, 0.05, 0.05, 1, 0xfff2a0, 0, 0, 0, { emissive: 0xffe27a, emissiveIntensity: 1.2, cast: false });
    this.tracer.visible = false;
    this.tracerT = 0;
    this.state = { hits: 0, targetIdx: 0 };
  };

  MiniScene.prototype.spawnTarget = function (i) {
    var tg = new THREE.Group();
    var tgo = new THREE.Mesh(this.targetGeo, this.targetMat); tgo.rotation.x = Math.PI / 2; tgo.castShadow = true;
    var tgi = new THREE.Mesh(this.targetInnerGeo, this.targetInnerMat); tgi.rotation.x = Math.PI / 2;
    tg.add(tgo); tg.add(tgi);
    tg.castShadow = true;
    var x = -1.6 + Math.random() * 3.2;
    var y = 2.0 + Math.random() * 1.0;
    tg.position.set(x, y, -0.2);
    this.root.add(tg);
    if (!this.targets[i]) {
      this.targets[i] = { m: tg, x: x, y: y, alive: true, t: 0 };
    } else {
      var o = this.targets[i];
      o.m.visible = true; o.alive = true; o.t = 0;
      o.x = x; o.y = y; o.m.position.set(x, y, -0.2); o.m.scale.setScalar(1);
    }
  };

  MiniScene.prototype.updateChart = function (dt) {
    for (var i = 0; i < this.targets.length; i++) {
      var o = this.targets[i];
      if (!o.alive) { o.t += dt; if (o.t > 0.28) this.spawnTarget(i); continue; }
      o.m.rotation.z += dt * 1.6;
      o.m.position.y = o.y + Math.sin(this.t * 2.4 + i) * 0.07;
    }
    for (var b = 0; b < this.bars.length; b++) {
      var bar = this.bars[b];
      var targetH = bar.h;
      var cur = bar.m.scale.y;
      // scale.y 기준으로 높이 관리 (지오메트리 높이 1)
      var want = targetH;
      if (Math.abs(cur - want) > 0.002) {
        var nh = cur + (want - cur) * Math.min(1, dt * 7);
        bar.m.scale.y = nh;
        bar.m.position.y = nh / 2;
      }
    }
    if (this.tracerT > 0) {
      this.tracerT -= dt;
      if (this.tracerT <= 0) { this.tracer.visible = false; }
    }
    // 날아가는 코인탄
    for (var q = this.shots.length - 1; q >= 0; q--) {
      var sh = this.shots[q];
      sh.t += dt * 5.2;
      if (sh.t >= 1) {
        this.root.remove(sh.m);
        this.shots.splice(q, 1);
        continue;
      }
      sh.m.position.lerpVectors(sh.from, sh.to, sh.t);
      sh.m.rotation.x += dt * 16;
      sh.m.rotation.y += dt * 11;
    }
  };

  MiniScene.prototype.tapChart = function () {
    if (!this.ok || !this.targets) return;
    var alive = [];
    for (var i = 0; i < this.targets.length; i++) if (this.targets[i].alive) alive.push({ o: this.targets[i], i: i });
    if (!alive.length) return;
    var pick = alive[Math.floor(Math.random() * alive.length)].o;
    var from = this.shotFrom.clone();
    var to = pick.m.position.clone();
    // 트레이서
    var mid = from.clone().add(to).multiplyScalar(0.5);
    var len = from.distanceTo(to);
    this.tracer.position.copy(mid);
    this.tracer.scale.set(1, 1, len);
    this.tracer.lookAt(to);
    this.tracer.visible = true;
    this.tracerT = 0.09;
    // 코인탄 발사체
    var bullet = new THREE.Group();
    var bo = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12), VX.mat(0xffc222, { metal: 0.3, rough: 0.4, emissive: 0x8a5200, emissiveIntensity: 0.6 }));
    bo.rotation.x = Math.PI / 2;
    bullet.add(bo);
    bullet.position.copy(from);
    this.root.add(bullet);
    this.shots.push({ m: bullet, from: from, to: to, t: 0 });

    pick.alive = false;
    pick.m.visible = false;
    this.burst.spawn(to.x, to.y, to.z, 0xffcf3d, 10, { size: 0.08, speed: 2.6, life: 0.6 });
    // 차트 상승
    var bi = Math.max(0, Math.min(this.bars.length - 1, Math.round((to.x + 2.42) / 0.44)));
    var bar = this.bars[bi];
    bar.h = Math.min(3.2, bar.h + 0.22);
    bar.m.material = VX.mat(0x4fc98a, { emissive: 0x1a6b46, emissiveIntensity: 0.3, rough: 0.6 });
    this.burst.spawn(bar.x, bar.h, -1.35, 0x4fd98b, 4, { size: 0.06, speed: 1.6, life: 0.45 });
  };

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

    this.state = { smashed: 0 };
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
  };

  MiniScene.prototype.tapShop = function () {
    if (this.swing > 0) return;
    this.swing = 0.26;
    this.hitDone = false;
  };

  MiniScene.prototype.doSmash = function () {
    if (!this.stack || !this.stack.length) return;
    var top = this.stack.pop();
    var p = top.position;
    this.root.remove(top);
    this.burst.spawn(p.x, p.y, p.z, 0xffd24a, 12, { size: 0.09, speed: 2.8, life: 0.65 });
    this.burst.spawn(p.x, p.y + 0.2, p.z, 0xff6b8a, 8, { size: 0.07, speed: 2.2, life: 0.55 });
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

  /* ---------- 화요일: 사내 메신저 몰래 톡 (버블 터뜨리기) ---------- */
  var CHAT_LINES = [
    { t: '부장님 커피 타러 갔어 ㅋㅋ', c: 0x3f8ff0 },
    { t: '이거 진짜 웃김', c: 0xd94f8f },
    { t: '점심 뭐 먹지', c: 0x2fae7a },
    { t: '오늘 야근각인가', c: 0xd98a2b },
    { t: '회의 3시래', c: 0x7a63e0 },
    { t: '칼퇴 가능?', c: 0x2fa6c4 },
    { t: '핫딜 떴다 ㄱㄱ', c: 0xe0592f },
    { t: 'ㅋㅋㅋㅋㅋㅋ', c: 0x4f8fe0 },
    { t: '몰래 보고 있음', c: 0x9a68d8 },
    { t: '부장님 돌아옴!!', c: 0xe03c4a }
  ];

  /* 말풍선 한 장 = 캔버스 스프라이트 (테두리 색 + 이름 + 텍스트 + 얼굴) */
  function chatSprite(text, accent, who) {
    var w = 512, h = 132;
    var tex = VX.canvasTex(w, h, function (g) {
      g.clearRect(0, 0, w, h);
      VX.roundRect(g, 8, 10, w - 16, h - 26, 30);
      g.fillStyle = 'rgba(18,26,44,.97)';
      g.fill();
      g.lineWidth = 5;
      g.strokeStyle = '#' + ('000000' + (accent >>> 0).toString(16)).slice(-6);
      g.stroke();
      // 꼬리
      g.beginPath();
      g.moveTo(44, h - 18); g.lineTo(44, h - 2); g.lineTo(80, h - 18);
      g.closePath();
      g.fillStyle = 'rgba(18,26,44,.97)'; g.fill();
      // 프로필 얼굴
      g.beginPath(); g.arc(62, 54, 30, 0, Math.PI * 2);
      g.fillStyle = '#' + ('000000' + (accent >>> 0).toString(16)).slice(-6);
      g.fill();
      g.fillStyle = '#121a2c';
      g.beginPath(); g.arc(52, 50, 4.5, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(72, 50, 4.5, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(62, 62, 11, 0, Math.PI, false);
      g.lineWidth = 4; g.strokeStyle = '#121a2c'; g.stroke();
      // 이름 + 본문
      g.fillStyle = '#' + ('000000' + (accent >>> 0).toString(16)).slice(-6);
      g.font = '800 24px "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
      g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillText(who || '잼대리', 106, 32);
      g.fillStyle = '#f2f6ff';
      g.font = '800 36px "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
      g.fillText(text, 106, 74);
    });
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(1.48, 0.37, 1);
    return sp;
  }

  MiniScene.prototype.buildChat = function () {
    this.scene.background = new THREE.Color(0x161a2c);
    this.scene.fog = new THREE.Fog(0x161a2c, 13, 28);
    this.camera.fov = 44;
    this.camera.position.set(0.05, 2.0, 6.4);
    this.camera.lookAt(0, 1.78, -0.6);
    this.camera.updateProjectionMatrix();
    this.dir.position.set(2, 6, 4);

    var R = this.root;
    // 책상 + 폰 본체
    VX.box(R, 6.4, 0.3, 3.6, 0x1d2130, 0, -0.78, -0.6, { cast: false, tex: 'wood', tr: [4, 2] });
    VX.box(R, 3.1, 4.7, 0.24, 0x0c0f1a, 0, 2.05, -1.75, { rough: 0.6 });
    VX.box(R, 2.84, 4.32, 0.05, 0x1b2338, 0, 2.05, -1.6, { emissive: 0x243a63, emissiveIntensity: 0.35, cast: false });
    VX.box(R, 2.9, 0.1, 0.18, 0x39456a, 0, 4.42, -1.68, { cast: false });

    // 상단 대화방 헤더
    var hd = VX.label('단톡방 · 딴짓', '#8fd0ff', { w: 1.5 });
    hd.position.set(0, 4.2, -1.5);
    R.add(hd);
    // 새 메시지 표시
    var nb = VX.label('새 메시지 3', '#ffd24a', { w: 0.86 });
    nb.position.set(-1.62, 3.66, -1.2);
    R.add(nb);
    this.newBadge = nb;

    // 캐릭터(잼대리) 옆에서 폰 보는 자세
    var me = VX.humanoid({ suit: 0x3f7893, shirt: 0xdff4ff, tie: false, hair: 0x4a3524, scale: 0.62, badge: 0x69d8ff });
    me.position.set(-2.25, 0, -1.0);
    me.rotation.y = 0.55;
    R.add(me);
    this.me = me;
    this.meUd = me.userData;

    // 말풍선 6칸 (채팅 목록처럼 고정 배치)
    this.msgs = [];
    this.msgIdx = 0;
    this.slotY = [3.3, 2.75, 2.2, 1.65, 1.1, 0.55];
    for (var i = 0; i < 6; i++) this.spawnMsg(i);

    // 맨 아래 타이핑 점
    this.typing = new THREE.Group();
    this.typing.position.set(0.42, 0.2, 0.32);
    R.add(this.typing);
    for (var d = 0; d < 3; d++) VX.box(this.typing, 0.09, 0.09, 0.09, 0x8fd0ff, d * 0.16 - 0.16, 0, 0, { emissive: 0x2f6f9a, emissiveIntensity: 0.7, cast: false });

    this.state = { pops: 0 };
  };

  MiniScene.prototype.spawnMsg = function (slot) {
    var line = CHAT_LINES[this.msgIdx++ % CHAT_LINES.length];
    var g = new THREE.Group();
    var sp = chatSprite(line.t, line.c, Math.random() < 0.62 ? '잼대리' : '잼인턴');
    g.add(sp);
    var baseY = this.slotY[slot];
    g.position.set(slot % 2 ? 0.24 : -0.2, baseY, 0.3 + (slot % 3) * 0.03);
    g.scale.setScalar(0.86);
    this.root.add(g);
    var rec = { g: g, sp: sp, slot: slot, c: line.c, baseY: baseY, t: 0, alive: true, wait: 0 };
    if (this.msgs[slot]) { this.root.remove(this.msgs[slot].g); this.msgs[slot] = rec; }
    else this.msgs[slot] = rec;
    return rec;
  };

  MiniScene.prototype.updateChat = function (dt) {
    if (!this.msgs) return;
    for (var i = 0; i < this.msgs.length; i++) {
      var m = this.msgs[i];
      if (!m) continue;
      if (!m.alive) {
        m.wait -= dt;
        if (m.wait <= 0) this.spawnMsg(i);
        continue;
      }
      m.t += dt;
      m.g.position.y = m.baseY + Math.sin(this.t * 1.7 + i * 0.9) * 0.015;
      m.g.scale.setScalar(Math.min(1, 0.86 + m.t * 0.9));
    }
    // 타이핑 점 통통
    for (var d = 0; d < this.typing.children.length; d++) {
      var b = this.typing.children[d];
      b.position.y = Math.sin(this.t * 8 + d * 0.7) * 0.06;
    }
    if (this.newBadge) this.newBadge.visible = Math.sin(this.t * 2.2) > -0.4;
    // 잼대리: 폰 보며 고개 끄덕
    if (this.meUd) {
      this.meUd.head.rotation.x = 0.16 + Math.sin(this.t * 1.6) * 0.05;
      this.meUd.head.rotation.y = Math.sin(this.t * 0.9) * 0.12;
      this.meUd.armR.rotation.x = -1.25 + Math.sin(this.t * 3.4) * 0.1;
      this.meUd.armL.rotation.x = -0.9;
    }
  };

  MiniScene.prototype.tapChat = function () {
    if (!this.msgs) return;
    var idx = -1;
    for (var i = 0; i < this.msgs.length; i++) {
      if (this.msgs[i] && this.msgs[i].alive) { idx = i; break; }
    }
    if (idx < 0) return;
    var m = this.msgs[idx];
    var p = m.g.position;
    this.burst.spawn(p.x, p.y, p.z, m.c, 9, { size: 0.07, speed: 2.2, life: 0.55 });
    this.burst.spawn(p.x, p.y + 0.08, p.z, 0xffffff, 4, { size: 0.05, speed: 1.7, life: 0.45 });
    this.root.remove(m.g);
    m.alive = false;
    m.wait = 0.35;
    this.state.pops++;
  };

  /* ---------- 목요일: 몰래 유튜브·숏폼 (스와이프) ---------- */
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

  function shortSprite(text, accent, kind) {
    var w = 384, h = 128;
    var tex = VX.canvasTex(w, h, function (g) {
      g.clearRect(0, 0, w, h);
      g.fillStyle = 'rgba(8,10,18,.9)';
      VX.roundRect(g, 8, 8, w - 16, h - 16, 18);
      g.fill();
      // 미니 썸네일 그림 (종류별)
      var cx = 52, cy = 64, col = '#' + ('000000' + (accent >>> 0).toString(16)).slice(-6);
      g.fillStyle = col;
      if (kind === 1) { g.beginPath(); g.arc(cx, cy, 24, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(cx - 8, cy - 7, 3, 0, Math.PI * 2); g.fillStyle = '#0b0f18'; g.fill(); }
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
      g.fillText('@jam_official · 조회 ' + (12 + text.length * 7) + '만', 96, 92);
    });
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(1.42, 0.47, 1);
    return sp;
  }

  MiniScene.prototype.buildVideo = function () {
    this.scene.background = new THREE.Color(0x1b1226);
    this.scene.fog = new THREE.Fog(0x1b1226, 14, 30);
    this.camera.fov = 42;
    this.camera.position.set(0, 1.95, 6.9);
    this.camera.lookAt(0, 1.85, -0.8);
    this.camera.updateProjectionMatrix();
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
    VX.box(R, 0.26, 0.26, 0.26, 0x2a1a34, 1.38, 1.45, -1.2, { cast: false });
    VX.box(R, 0.2, 0.2, 0.2, 0xd94f8f, 1.38, 1.45, -1.12, { emissive: 0x8a1f4a, emissiveIntensity: 0.5, cast: false });
    VX.box(R, 0.24, 0.24, 0.24, 0x22283c, 1.38, 0.92, -1.2, { cast: false });
    VX.box(R, 0.24, 0.24, 0.24, 0x22283c, 1.38, 0.44, -1.2, { cast: false });
    // 진행 바
    VX.box(R, 0.9, 0.05, 0.1, 0x3a2a4a, 0, -0.36, -1.2, { cast: false });
    this.vBar = VX.box(R, 0.02, 0.05, 0.11, 0xffd24a, -0.44, -0.36, -1.19, { emissive: 0xd9a000, emissiveIntensity: 0.7, cast: false });

    // 숏폼 카드 2장(보이는 1장 + 아래 대기 1장, 베젤 뒤에서 올라온다)
    this.cards = [];
    this.cardIdx = 0;
    var c0 = this.makeShort(1.95);
    var c1 = this.makeShort(-4.6);
    c1.g.visible = false;
    this.cards.push(c0, c1);
    this.swipe = null;
    this.likeN = 0;
    var like = VX.label('♥ 0', '#ff9bd0', { w: 0.72 });
    like.position.set(1.38, 2.06, -1.1);
    R.add(like);
    this.likeLabel = like;

    this.state = { swipes: 0 };
  };

  MiniScene.prototype.makeShort = function (y) {
    var line = SHORT_LINES[this.cardIdx++ % SHORT_LINES.length];
    var g = new THREE.Group();
    g.position.set(0, y, -1.52);
    // 영상 배경(색 그라데이션 3단) + 테두리
    var base = new THREE.Color(line.c);
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
    if (line.e === 1) {           // 고양이
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
    var cap = shortSprite(line.t, line.c, line.e);
    cap.position.set(0, -1.28, 0.06);
    g.add(cap);
    this.root.add(g);
    return { g: g, targetY: y, c: line.c, cap: line.t, out: false };
  };

  MiniScene.prototype.updateVideo = function (dt) {
    if (!this.cards) return;
    for (var i = 0; i < this.cards.length; i++) {
      var c = this.cards[i];
      if (c.out) {
        c.g.position.y += dt * 9;
        c.g.scale.setScalar(Math.max(0.2, c.g.scale.x - dt * 1.2));
      } else {
        c.g.position.y += (c.targetY - c.g.position.y) * Math.min(1, dt * 10);
        c.g.scale.setScalar(1);
        c.g.visible = c.g.position.y + 1.92 > -0.25;
      }
      if (i === 0 && !c.out) c.g.position.x = Math.sin(this.t * 0.8) * 0.03;
    }
    // 화면 정리
    if (this.cards[0] && this.cards[0].out && this.cards[0].g.position.y > 6.2) {
      var done = this.cards.shift();
      this.root.remove(done.g);
      var nc = this.makeShort(-4.6);
      nc.targetY = -4.6;
      nc.g.visible = false;
      this.cards.push(nc);
      this.swipe = null;
    }
    // 좋아요 라벨 통통
    if (this.likeLabel) this.likeLabel.position.y = 2.06 + Math.sin(this.t * 3) * 0.02;
    if (this.vBar) {
      var p = 0.02 + ((this.state.swipes % 10) / 10) * 0.9;
      this.vBar.scale.x = p / 0.02;
      this.vBar.position.x = -0.44 + p / 2;
    }
  };

  MiniScene.prototype.tapVideo = function () {
    if (!this.cards || this.swipe) return;
    var c = this.cards[0];
    if (!c) return;
    c.out = true;
    this.cards[1] && (this.cards[1].targetY = 1.95);
    this.swipe = { t: 0 };
    this.state.swipes++;
    // 좋아요 하트 버스트
    this.burst.spawn(1.05, 1.3, -1.1, 0xff6fb2, 8, { size: 0.06, speed: 2.2, life: 0.6 });
    this.burst.spawn(0, 0.1, -1.15, c.c, 6, { size: 0.06, speed: 1.8, life: 0.5 });
    this.likeN++;
    if (this.likeLabel) {
      this.likeLabel.material.map.dispose();
      var tex = VX.canvasTex(256, 72, (function (n) {
        return function (g, w, h) {
          g.clearRect(0, 0, w, h);
          VX.roundRect(g, 8, 10, w - 16, h - 20, 18);
          g.fillStyle = 'rgba(30,12,26,.86)'; g.fill();
          g.strokeStyle = '#ff9bd0'; g.lineWidth = 4; g.stroke();
          g.fillStyle = '#ff9bd0';
          g.font = '800 34px system-ui,-apple-system,sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText('♥ ' + n, w / 2, h / 2 + 1);
        };
      })(this.likeN));
      this.likeLabel.material.map = tex;
      this.likeLabel.material.needsUpdate = true;
    }
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
  function tap() {
    if (!mini || !mini.ok) return;
    if (mini.kind === 'jump') mini.tapJump();
    else if (mini.kind === 'chart') mini.tapChart();
    else if (mini.kind === 'chat') mini.tapChat();
    else if (mini.kind === 'video') mini.tapVideo();
    else mini.tapShop();
  }
  function setMiniActive(on) { if (mini && mini.ok) mini.setActive(on); }
  function setActive(on) { if (office && office.ok) office.active = !!on; }
  function snapshot(pose) { return (office && office.ok) ? office.snapshot(pose) : ''; }
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
    office: function () { return office; }, mini: function () { return mini; }
  };
})();
