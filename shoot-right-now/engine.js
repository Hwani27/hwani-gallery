/* 지금 바로 쏴! — standalone engine.
   Owns the WebGL renderer, scene, camera, lights, the score popups and the
   frame loop that drives rail.js. It loads nothing else: no other game's
   HTML, globals, menus or save data. */
(function () {
  const T = window.THREE;
  const canvas = document.getElementById("mgCanvas");
  const errEl = document.getElementById("mgErr");
  const titleEl = document.getElementById("mgTitle");
  let sndBtn = document.getElementById("mgSound");
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
  let gfxBtn = document.getElementById("mgGfx");
  const GFX = ko ? { auto: "그래픽 자동", high: "그래픽 높음", low: "그래픽 낮음" }
                 : { auto: "Graphics: auto", high: "Graphics: high", low: "Graphics: low" };
  function paintGfx() {
    if (!gfxBtn) return;
    if (!window.MGPost) { gfxBtn.hidden = true; return; }
    const p = window.MGPost.pref;
    const t = gfxBtn.querySelector(".tGfxTxt") || gfxBtn;
    t.textContent = GFX[p] + (p === "auto" ? " · " + (window.MGPost.quality === "high" ? (ko ? "높음" : "high") : (ko ? "낮음" : "low")) : "");
    gfxBtn.title = t.textContent;
    gfxBtn.setAttribute("aria-label", t.textContent);
    gfxBtn.classList.toggle("off", p === "low");
  }
  if (window.MGPost) window.MGPost.onChange(paintGfx);
  function bindMenu() {
  sndBtn = document.getElementById("mgSound");
  gfxBtn = document.getElementById("mgGfx");
  if (gfxBtn && window.MGPost) {
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
  paintSound();
  paintGfx();
  }
  bindMenu();
  /* profile.js re-makes the title menu after every mission */
  window.MGMenuBind = bindMenu;

  /* ---- (v67) what the device can afford ----------------------------------
     A phone at devicePixelRatio 3 draws a 1170x2532 buffer, then runs the
     post pass, the AO and the bloom over it: four times the pixels of a laptop
     for a screen the size of a hand, and that is where the frame drop comes
     from. A touch or narrow screen is capped lower, and if the frame budget is
     missed again and again the cap itself is eased down (never below 1:1). */
  const MOBILE = (function () {
    try {
      const touch = (navigator.maxTouchPoints || 0) > 1;
      const narrow = (window.innerWidth || 9999) <= 900;
      return touch || narrow;
    } catch (e) { return false; }
  })();
  const PR_CAP = MOBILE ? 1.4 : 1.75;
  let prScale = 1;
  function pixelRatio() {
    const base = Math.min(window.devicePixelRatio || 1, PR_CAP);
    return Math.max(1, Math.round(base * prScale * 100) / 100);
  }

  /* ---- renderer / scene / camera ---- */
  let renderer = null;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    fail();
    return;
  }
  renderer.setPixelRatio(pixelRatio());
  if (T.sRGBEncoding) renderer.outputEncoding = T.sRGBEncoding;
  /* filmic tone mapping: the sky keeps its colour instead of clipping to white
     and the shadows under the barriers, cars and men go deep without the
     asphalt turning to soup */
  if (T.ACESFilmicToneMapping !== undefined) renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor(0x8ec7ee, 1);

  /* ---- (v46) shadow budget ------------------------------------------------
     One sun, three sizes. What costs on a phone is the shadow pass: the map
     left/right/top/bottom box is how much of the city is drawn twice, and the
     map resolution is how sharp the barrier edge and a helmet come out. The
     box is boxed in tight around the fight instead of the whole boulevard, so
     1024 still reads. The level follows the graphics switch (post.js) and the
     device: a phone that had to drop the post pass gets PCF instead of
     PCFSoft and the tightest box. `?shadow=high|mid|low` forces one. */
  /* (v67) `mid` is now 1024 with the cheap PCF filter: PCFSoft takes four
     taps per shadowed fragment, which a phone pays for on every lit pixel of
     the street. Only a desktop `high` keeps the soft filter. */
  const SHADOWS = {
    high: { map: 2048, soft: true, span: [46, 52, -40], far: 190, bias: -0.0004, normalBias: 0.03 },
    mid: { map: 1024, soft: false, span: [30, 36, -28], far: 150, bias: -0.0005, normalBias: 0.04 },
    low: { map: 1024, soft: false, span: [22, 28, -22], far: 120, bias: -0.0007, normalBias: 0.05 }
  };
  let shadowLevel = null;
  function pickShadow() {
    let forced = null;
    try { forced = new URLSearchParams(location.search).get("shadow"); } catch (e) {}
    if (forced && SHADOWS[forced]) return forced;
    if (window.MGPost && window.MGPost.quality === "low") return "low";
    const cores = navigator.hardwareConcurrency || 4;
    /* (v67) a phone never takes the desktop tier: 2048 PCFSoft is the single
       most expensive thing in the frame there. 1024 + PCF reads the same at
       arm's length and costs a quarter of the bandwidth. */
    if (MOBILE) return cores <= 4 ? "low" : "mid";
    if (cores >= 8) return "high";
    return "mid";
  }
  function applyShadow(level) {
    const t = SHADOWS[level] || SHADOWS.high;
    if (shadowLevel === level) return;
    shadowLevel = level;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = t.soft ? T.PCFSoftShadowMap : T.PCFShadowMap;
    key.shadow.mapSize.set(t.map, t.map);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = t.far;
    key.shadow.camera.left = -t.span[0];
    key.shadow.camera.right = t.span[0];
    key.shadow.camera.top = t.span[1];
    key.shadow.camera.bottom = t.span[2];
    key.shadow.bias = t.bias;
    if ("normalBias" in key.shadow) key.shadow.normalBias = t.normalBias;
    key.shadow.camera.updateProjectionMatrix();
    /* a new mapSize only takes effect once the old depth target is dropped */
    if (key.shadow.map) { key.shadow.map.dispose(); key.shadow.map = null; }
    renderer.shadowMap.needsUpdate = true;
    window.__shadowInfo = { level: level, map: t.map, type: t.soft ? "PCFSoftShadowMap" : "PCFShadowMap", span: t.span.slice(), far: t.far };
  }

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
  /* the numbers below are the `high` tier; applyShadow() sets the rest */
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
  applyShadow(pickShadow());
  if (window.MGPost) window.MGPost.onChange(() => applyShadow(pickShadow()));
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
  window.__shadowInfo = window.__shadowInfo || null;
  window.__setShadow = applyShadow;
  window.__pickShadow = pickShadow;
  window.__perfInfo = function () {
    return { mobile: MOBILE, cap: PR_CAP, scale: prScale, pr: renderer.getPixelRatio(),
             auto: window.__prAuto || "", shadow: window.__shadowInfo };
  };

  /* ---- frame loop ---- */
  function tick() {
    requestAnimationFrame(tick);
    if (state.mode === "play" && window.RAIL && window.RAIL.active) {
      try { window.RAIL.frame(ctx); } catch (err) { if (!window.__frameErr) window.__frameErr = String(err && err.stack || err); }
      /* a low winter sun from the right-front: long building shadows rake
         across the road instead of a flat noon wash */
      const sun = window.__mgSun || SUN;
      key.position.set(camera.position.x + sun[0], sun[1], camera.position.z + sun[2]);
      { const L = Math.hypot(sun[0], sun[1], sun[2]) || 1; window.__mgSunDir = { x: sun[0] / L, y: sun[1] / L, z: sun[2] / L }; }
      key.target.position.set(camera.position.x, 0, camera.position.z + 10);
      key.target.updateMatrixWorld();
      rim.position.set(camera.position.x - 6, 10, camera.position.z - 26);
    }
    const nowT = performance.now();
    if (window.MGPost) {
      if (state.mode === "play") window.MGPost.sample(nowT - (tick._t || nowT));
      window.MGPost.render(renderer, scene, camera);
    } else renderer.render(scene, camera);
    /* (v67) adaptive resolution: a phone that keeps missing the budget gives
       up screen resolution before it gives up the game. 1.4 -> 1.2 -> 1.0 of
       the CSS pixel grid, and back up when the frame is comfortable again. */
    if (MOBILE && state.mode === "play") {
      const dt = nowT - (tick._pt || nowT);
      tick._pt = nowT;
      if (dt > 0 && dt < 250) {
        arAcc += dt; arN++;
        if (arN >= 60) {
          const avg = arAcc / arN;
          arAcc = 0; arN = 0;
          let to = prScale;
          if (avg > 25 && prScale > 0.6) to = Math.max(0.6, prScale - 0.2);
          else if (avg < 13 && prScale < 1) to = Math.min(1, prScale + 0.1);
          if (to !== prScale) {
            prScale = to;
            resize();
            window.__prAuto = pixelRatio().toFixed(2) + "@" + avg.toFixed(1);
          }
        }
      }
    }
    tick._t = nowT;
  }
  let arAcc = 0, arN = 0;

  function resize() {
    const w = Math.max(1, window.innerWidth || 1);
    const h = Math.max(1, window.innerHeight || 1);
    renderer.setPixelRatio(pixelRatio());
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
    try { window.MGMenu && window.MGMenu.refresh(); } catch (e) {}
    if (titleEl) titleEl.classList.add("show");
    if (titleEl) titleEl.scrollTop = 0;
  }

  /* a still of the battlefield for the result card: render now and copy the
     frame out before the browser clears the drawing buffer */
  function snap(maxW) {
    try {
      if (window.MGPost) window.MGPost.render(renderer, scene, camera); else renderer.render(scene, camera);
      const w = Math.min(maxW || 1080, canvas.width), h = Math.round(canvas.height * (w / canvas.width));
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(canvas, 0, 0, w, h);
      return c;
    } catch (e) { return null; }
  }

  window.MG = {
    get state() { return state.mode; },
    ctx: ctx,
    play: play,
    playStage: play,
    playAgain: function () { play(window.RAIL && window.RAIL.stage ? window.RAIL.stage : 1); },
    toTitle: toTitle,
    snap: snap
  };

  document.addEventListener("gesturestart", (e) => e.preventDefault());

  /* first paint of the empty stage so the canvas is never a black hole */
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
})();
