/* 지금 바로 멸공 — standalone engine.
   Owns the WebGL renderer, scene, camera, lights, the score popups and the
   frame loop that drives rail.js. It loads nothing else: no other game's
   HTML, globals, menus or save data. */
(function () {
  const T = window.THREE;
  const canvas = document.getElementById("mgCanvas");
  const errEl = document.getElementById("mgErr");
  const titleEl = document.getElementById("mgTitle");
  const startBtn = document.getElementById("mgStart");
  const sndBtn = document.getElementById("mgSound");
  const ko = (document.documentElement.lang || "ko").toLowerCase().indexOf("ko") === 0;
  const TXT = ko
    ? { sndOn: "소리 켬", sndOff: "소리 끔", err: "이 기기에서는 3D 화면을 열 수 없습니다. 페이지를 새로고침하거나 다른 브라우저로 열어 주세요." }
    : { sndOn: "Sound on", sndOff: "Sound off", err: "This device cannot open the 3D view. Reload the page or try another browser." };

  function fail(msg) {
    if (errEl) { errEl.hidden = false; errEl.textContent = msg || TXT.err; }
  }

  if (!T) { fail(); return; }
  if (!canvas) { fail(); return; }

  /* ---- sound switch (read by gun-sfx.js through SFX.isOn) ---- */
  let soundOn = true;
  try { soundOn = localStorage.getItem("myeolgong_sound") !== "0"; } catch (e) {}
  window.__mgSound = soundOn;
  window.SFX = window.SFX || {};
  window.SFX.isOn = function () { return window.__mgSound !== false; };
  const state = { mode: "title" };

  function paintSound() {
    if (!sndBtn) return;
    const on = window.__mgSound !== false;
    const label = sndBtn.querySelector(".tSoundTxt");
    if (label) label.textContent = on ? TXT.sndOn : TXT.sndOff;
    else sndBtn.textContent = on ? TXT.sndOn : TXT.sndOff;
    sndBtn.classList.toggle("off", !on);
    sndBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  paintSound();

  /* ---- graphics switch: auto -> high -> low (post.js) ---- */
  const gfxBtn = document.getElementById("mgGfx");
  const GFX = ko ? { auto: "그래픽 자동", high: "그래픽 높음", low: "그래픽 낮음" }
                 : { auto: "Graphics: auto", high: "Graphics: high", low: "Graphics: low" };
  function paintGfx() {
    if (!gfxBtn) return;
    if (!window.MGPost) { gfxBtn.hidden = true; return; }
    const p = window.MGPost.pref;
    const t = gfxBtn.querySelector(".tGfxTxt") || gfxBtn;
    t.textContent = GFX[p] + (p === "auto" ? " · " + (window.MGPost.quality === "high" ? (ko ? "높음" : "high") : (ko ? "낮음" : "low")) : "");
  }
  if (gfxBtn && window.MGPost) {
    window.MGPost.onChange(paintGfx);
    gfxBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const order = ["auto", "high", "low"];
      window.MGPost.setQuality(order[(order.indexOf(window.MGPost.pref) + 1) % 3]);
      paintGfx();
    });
  }
  paintGfx();
  if (sndBtn) {
    sndBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.__mgSound = !window.__mgSound;
      try { localStorage.setItem("myeolgong_sound", window.__mgSound ? "1" : "0"); } catch (err) {}
      paintSound();
      try {
        if (!window.__mgSound) { window.GunSFX && window.GunSFX.bgm(false); }
        else if (state === "play" && window.GunSFX) { window.GunSFX.unlock(); window.GunSFX.bgm(true, false); }
      } catch (err) {}
    });
  }

  /* ---- renderer / scene / camera ---- */
  let renderer = null;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    fail();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  if (T.sRGBEncoding) renderer.outputEncoding = T.sRGBEncoding;
  /* filmic tone mapping: the sky keeps its colour instead of clipping to white
     and the shadows under the barriers, cars and men go deep without the
     asphalt turning to soup */
  if (T.ACESFilmicToneMapping !== undefined) renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor(0x8ec7ee, 1);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(58, 1, 0.06, 320);
  camera.rotation.order = "YXZ";
  camera.position.set(8, 1.7, 4.1);
  camera.lookAt(15, 1.35, 1.1);
  scene.add(camera);

  const hemi = new T.HemisphereLight(0xdcefff, 0x7d7154, 0.62);
  const amb = new T.AmbientLight(0xb9d2e8, 0.16);
  const key = new T.DirectionalLight(0xfff2d0, 2.05);
  key.position.set(32, 22, 14);
  key.castShadow = true;
  /* 2048 keeps a barrier's edge and a man's helmet crisp on the road; the
     frustum is pulled in tight around the fight so the pixels are not spent on
     the far city */
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 190;
  key.shadow.camera.left = -46;
  key.shadow.camera.right = 46;
  key.shadow.camera.top = 52;
  key.shadow.camera.bottom = -40;
  key.shadow.bias = -0.0004;
  if ("normalBias" in key.shadow) key.shadow.normalBias = 0.03;
  /* the frustum numbers above only take effect through a fresh projection */
  key.shadow.camera.updateProjectionMatrix();
  /* where the sun sits relative to the player: low enough to throw long
     shadows down the street, high enough to light a man's face */
  const SUN = [32, 22, 14];
  const moon = new T.DirectionalLight(0xa8c4e6, 0.14);
  moon.position.set(-18, 22, -20);
  const rim = new T.DirectionalLight(0xffc79a, 0.5);
  rim.position.set(-8, 10, -26);
  scene.add(hemi, amb, key, key.target, moon, rim);

  const player = new T.Object3D();
  player.visible = false;
  scene.add(player);

  /* ---- the small slice of context rail.js needs ---- */
  const L = { W: 172, items: [], coins: [], firebars: [], def: { id: "1-1" } };
  const G = { score: 0 };
  const LT = { hemi, amb, key, moon, rim };

  function popScore(n, at) {
    const el = document.createElement("div");
    el.className = "mgPop" + (n < 0 ? " bad" : "");
    el.textContent = (n > 0 ? "+" : "") + n;
    document.body.appendChild(el);
    let sx = innerWidth * 0.55, sy = innerHeight * 0.42;
    if (at && typeof at.x === "number" && typeof at.y === "number") {
      sx = at.x; sy = at.y;
    } else {
      const v = new T.Vector3(0, 1.6, -8);
      v.project(camera);
      sx = (v.x * 0.5 + 0.5) * innerWidth;
      sy = (-v.y * 0.5 + 0.5) * innerHeight;
    }
    el.style.left = Math.max(24, Math.min(innerWidth - 24, sx)) + "px";
    el.style.top = Math.max(40, Math.min(innerHeight - 60, sy)) + "px";
    setTimeout(() => { el.remove(); }, 820);
  }

  const ctx = {
    scene: scene,
    camera: camera,
    renderer: renderer,
    L: L,
    G: G,
    LT: LT,
    player: player,
    pl: { inv: 0 },
    enemies: [],
    snd: function (name) {
      try { if (name === "hurt" && window.GunSFX) window.GunSFX.hit(); } catch (e) {}
    },
    addScore: function (n, x) {
      G.score = Math.max(0, G.score + (Math.round(n) || 0)); /* penalties floor at 0 */
      popScore(n | 0, x);
    },
    setState: function () {},
    hitFlash: function () {}
  };
  window.__railCtx = ctx;

  /* ---- frame loop ---- */
  function tick() {
    requestAnimationFrame(tick);
    if (state.mode === "play" && window.RAIL && window.RAIL.active) {
      try { window.RAIL.frame(ctx); } catch (err) { if (!window.__frameErr) window.__frameErr = String(err && err.stack || err); }
      /* a low winter sun from the right-front: long building shadows rake
         across the road instead of a flat noon wash */
      const sun = window.__mgSun || SUN;
      key.position.set(camera.position.x + sun[0], sun[1], camera.position.z + sun[2]);
      key.target.position.set(camera.position.x, 0, camera.position.z + 10);
      key.target.updateMatrixWorld();
      rim.position.set(camera.position.x - 6, 10, camera.position.z - 26);
    }
    const nowT = performance.now();
    if (window.MGPost) {
      if (state.mode === "play") window.MGPost.sample(nowT - (tick._t || nowT));
      window.MGPost.render(renderer, scene, camera);
    } else renderer.render(scene, camera);
    tick._t = nowT;
  }

  function resize() {
    const w = Math.max(1, window.innerWidth || 1);
    const h = Math.max(1, window.innerHeight || 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    if (window.MGPost) window.MGPost.resize(renderer);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 150));
  if (window.ResizeObserver) {
    try { new ResizeObserver(resize).observe(document.documentElement); } catch (e) {}
  }
  resize();

  /* keep a driver hiccup from turning into a dead black screen */
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    if (canvas.__lostT) clearTimeout(canvas.__lostT);
    canvas.__lostT = setTimeout(() => {
      if (!renderer.getContext().isContextLost()) return;
      fail(ko ? "그래픽 드라이버가 화면을 놓아 버렸습니다. 페이지를 새로고침하면 작전을 다시 시작할 수 있습니다."
              : "The graphics driver dropped the view. Reload the page to start the mission again.");
    }, 1500);
  }, false);
  canvas.addEventListener("webglcontextrestored", () => {
    if (canvas.__lostT) clearTimeout(canvas.__lostT);
    if (errEl) errEl.hidden = true;
    resize();
  }, false);

  /* ---- title → mission → result ---- */
  function unlock() {
    try { window.GunSFX && window.GunSFX.unlock(); } catch (e) {}
  }

  function play(stageId) {
    unlock();
    if (titleEl) titleEl.classList.remove("show");
    document.documentElement.classList.add("mg-playing");
    state.mode = "play";
    let ok = false;
    try { ok = !!(window.RAIL && window.RAIL.begin(ctx, stageId || 1)); } catch (err) { window.__beginErr = String(err && err.stack || err); }
    if (!ok) {
      state.mode = "title";
      if (titleEl) titleEl.classList.add("show");
      fail();
    }
  }

  function toTitle() {
    state.mode = "title";
    try { window.RAIL && window.RAIL.pause(); } catch (e) {}
    document.documentElement.classList.remove("mg-playing");
    if (titleEl) titleEl.classList.add("show");
    if (titleEl) titleEl.scrollTop = 0;
  }

  window.MG = {
    get state() { return state.mode; },
    ctx: ctx,
    play: play,
    playStage: play,
    playAgain: function () { play(window.RAIL && window.RAIL.stage ? window.RAIL.stage : 1); },
    toTitle: toTitle
  };

  if (startBtn) {
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      play(1);
    });
  }
  const start4 = document.getElementById("mgStart4");
  if (start4) {
    start4.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      play(4);
    });
  }
  const start3 = document.getElementById("mgStart3");
  if (start3) {
    start3.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      play(3);
    });
  }
  const start2 = document.getElementById("mgStart2");
  if (start2) {
    start2.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      play(2);
    });
  }

  document.addEventListener("gesturestart", (e) => e.preventDefault());

  /* first paint of the empty stage so the canvas is never a black hole */
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
})();
