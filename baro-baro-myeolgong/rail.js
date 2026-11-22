/* 지금 바로 멸공 — standalone Virtua-Cop-style rail shooter.
   Self-contained on purpose: three.min.js supplies the renderer, engine.js
   supplies the scene, camera and frame loop, and everything else (plaza,
   soldiers, props, the four waves and the commander) is built in this file.
   No other game's HTML, globals, menus or save data are loaded. */
(function () {
  const T = window.THREE;
  if (!T) return;
  const armed = true;
  let active = false;
  let staged = false;
  if (!window.__railErrs) {
    window.__railErrs = [];
    addEventListener("error", (e) => {
      try { window.__railErrs.push(String(e.message) + " @" + (e.filename || "") + ":" + e.lineno); } catch (x) {}
    });
  }
  const posts = [];
  let booted = false;
  let t0 = 0;
  let pistol = null;
  let pistolAim = null;
  let pistolBody = null;
  let pistolUpperL = null;
  let pistolPivot = null;
  const tmpV = new T.Vector3();
  const gunQ = new T.Quaternion();
  const gunQd = new T.Quaternion();
  const gunE = new T.Euler(0, 0, 0, "YXZ");
  const aimRay = new T.Raycaster();
  const aimNdc = new T.Vector2();
  const aimPt = new T.Vector3();
  const aimLocal = new T.Vector3();
  const aimSnapPt = new T.Vector3();
  const aimWish = new T.Vector3();
  const tmpT3 = new T.Vector3();
  const tmpT4 = new T.Vector3();
  const UPY_VIEW = new T.Vector3(0, 1, 0);
  let aimSnapAt = -1e9;
  let gunAim = { yaw: 0, pitch: 0 };
  let flash = null;
  let flashHalo = null;
  let flashLight = null;
  let recoil = 0;
  let pistolBase = null;
  let smokes = [];
  let sparks = [];
  let reloading = false;
  let reloadK = 0;
  let puff = null;
  let hud = null;
  let clock = 90;
  let bullets = 20;
  let lastShot = 0;
  let hp = 100;
  let lives = 3;
  let combo = 0;
  let bestCombo = 0;
  let shotsFired = 0;
  let shotsHit = 0;
  let hostageHits = 0;
  let aimN = { x: 0, y: 0.1 };
  let phase = "move";
  let waves = [];
  let waveI = 0;
  let wave = null;
  let waveT = 0;
  let camX = 8;
  let shake = 0;
  let bossPost = null;
  let shots3 = [];
  let pickups = [];
  let ended = false;
  let waveClean = true;
  let SCENE = null;
  let hitStop = 0;
  let flashEl = null;
  let lookSmooth = new T.Vector3();
  let curHold = { x: 0, z: 0 };
  let curLook = { x: 0, y: 1.4, z: 10 };
  let bossSpawned = false;
  let allyT = 0;
  let tracers = [];
  let bossCovers = [];
  let bossStage = null;
  let wallList = [];

  /* impact feedback borrowed from the boxing game's feel: a short
     freeze-frame, a screen flash and a knockback flinch. */
  function flashScreen(a, col) {
    if (!flashEl) {
      flashEl = document.createElement("div");
      flashEl.id = "railFlash";
      flashEl.style.cssText = "position:fixed;inset:0;z-index:44;pointer-events:none;opacity:0";
      document.body.appendChild(flashEl);
    }
    flashEl.style.background = col || "radial-gradient(circle at 50% 55%,rgba(255,250,230,.95),rgba(255,205,130,.5) 55%,rgba(255,150,60,0) 80%)";
    flashEl.style.transition = "none";
    flashEl.style.opacity = String(a);
    void flashEl.offsetWidth;
    flashEl.style.transition = "opacity .42s ease-out";
    flashEl.style.opacity = "0";
  }

  function css() {
    if (document.getElementById("railCss")) return;
    const st = document.createElement("style");
    st.id = "railCss";
    st.textContent = `
      #railHud{position:fixed;inset:0;z-index:40;pointer-events:none;image-rendering:pixelated}
      #railHud canvas{width:100%;height:100%;image-rendering:pixelated}
      #railX{position:fixed;left:50%;top:46%;width:46px;height:46px;transform:translate(-50%,-50%);z-index:41;pointer-events:none}
      #railReload{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));z-index:42;min-width:72px;min-height:64px;border-radius:16px;border:3px solid #111;background:#1a2430;color:#fff;font:900 16px sans-serif;pointer-events:auto}
      #railResult{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(4,8,16,.72);color:#fff;font-family:Pretendard,system-ui,sans-serif;text-align:center;padding:24px}
      #railResult.show{display:flex}
      #railResult .card{width:min(460px,100%);background:#121a16;border:3px solid #d8c98a;border-radius:18px;padding:22px;box-shadow:0 18px 60px rgba(0,0,0,.55)}
      #railResult h2{margin:0 0 8px;font-size:28px;letter-spacing:.02em}
      #railResult p{margin:6px 0;font-size:16px;color:#dfe6d4}
      #railResult .stars{font-size:32px;letter-spacing:6px;color:#ffd54a}
      #railResult .btns{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
      #railResult .btns button{flex:1 1 130px;min-height:52px;border-radius:12px;border:2px solid #6d7a52;background:#222b1c;color:#eef1e6;font:900 16px/1 Pretendard,system-ui,sans-serif;letter-spacing:.02em;cursor:pointer;touch-action:manipulation}
      #railResult .btns button.primary{background:#3d4a22;border-color:#d8c98a;color:#fff}
      #railResult .btns button:active{transform:translateY(1px)}
      /* threat ring: a Virtua-Cop-style countdown drawn around the man, its
         colour and length telling how much time is left before he fires */
      .railThreat{position:fixed;z-index:39;pointer-events:none;transform:translate(-50%,-50%) scale(var(--s,1));opacity:.95;--c:#5fd06a;--p:1}
      .railThreat .ring{position:absolute;inset:0;border-radius:50%;
        background:conic-gradient(var(--c) calc(var(--p,1) * 1turn), rgba(14,18,24,.42) 0);
        -webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px));
        mask:radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px))}
      .railThreat .ticks{position:absolute;inset:-3px;border-radius:50%;
        background:repeating-conic-gradient(from 0deg, var(--c) 0deg 1.5deg, transparent 1.5deg 15deg);
        -webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 13px), #000 calc(100% - 12px));
        mask:radial-gradient(farthest-side, transparent calc(100% - 13px), #000 calc(100% - 12px));
        opacity:.9}
      .railThreat .spin{position:absolute;inset:0;transform:rotate(calc((1 - var(--p,1)) * 320deg))}
      .railThreat .spin i{position:absolute;left:50%;top:-7px;transform:translateX(-50%);width:0;height:0;
        border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:15px solid var(--c);
        filter:drop-shadow(0 1px 3px rgba(0,0,0,.55))}
      .railThreat b{position:absolute;left:50%;top:0;transform:translate(-50%,-108%);min-width:20px;height:20px;padding:0 4px;
        border-radius:10px;border:2px solid rgba(8,10,12,.82);background:var(--c);color:#fff;
        font:900 12px/16px ui-monospace,monospace;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.55)}
      .railThreat.st1{opacity:1}
      .railThreat.st2 .ring{animation:railRingPulse .3s steps(2,end) infinite}
      .railThreat.st2 b{animation:railPulse .3s steps(2,end) infinite}
      @keyframes railRingPulse{0%{opacity:1}50%{opacity:.55}100%{opacity:1}}
      @keyframes railPulse{0%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.22)}100%{transform:translate(-50%,-50%) scale(1)}}
      .mgPop{position:fixed;z-index:42;pointer-events:none;transform:translate(-50%,-50%);font:900 20px/1 ui-monospace,monospace;color:#ffe14a;text-shadow:0 2px 0 #201a00,0 0 8px rgba(255,225,74,.5);animation:mgPopUp .8s ease-out forwards}
      .mgPop.bad{color:#ff7a66;text-shadow:0 2px 0 #2a0000,0 0 8px rgba(255,60,40,.5)}
      @keyframes mgPopUp{0%{opacity:0;transform:translate(-50%,-50%) scale(.7)}18%{opacity:1;transform:translate(-50%,-58%) scale(1.06)}100%{opacity:0;transform:translate(-50%,-118%) scale(1)}}
      .railHit{position:fixed;z-index:43;width:36px;height:36px;margin:-18px 0 0 -18px;pointer-events:none;animation:railHitPop .16s ease-out}
      .railHit b{position:absolute;left:50%;top:50%;width:4px;height:13px;background:#f7f4ea;box-shadow:0 0 4px rgba(0,0,0,.8)}
      .railHit b:nth-child(1){transform:translate(-50%,-50%) rotate(45deg) translateY(-11px)}
      .railHit b:nth-child(2){transform:translate(-50%,-50%) rotate(45deg) translateY(11px)}
      .railHit b:nth-child(3){transform:translate(-50%,-50%) rotate(-45deg) translateY(-11px)}
      .railHit b:nth-child(4){transform:translate(-50%,-50%) rotate(-45deg) translateY(11px)}
      .railHit.head{width:48px;height:48px;margin:-24px 0 0 -24px}
      .railHit.head b{background:#ffd24a;width:6px;height:18px;box-shadow:0 0 10px rgba(255,214,90,.95),0 0 2px #3a2400}
      .railHit.head:before{content:"";position:absolute;inset:4px;border:2px solid rgba(255,210,74,.9);border-radius:50%;box-shadow:0 0 12px rgba(255,210,74,.7);animation:railCritRing .26s ease-out forwards}
      .railHit.head:after{content:"";position:absolute;inset:13px;border:3px solid rgba(255,246,214,.95);border-radius:50%}
      .railHit.kill b{background:#ff6a58;width:5px;height:15px}
      .railHit.head.kill b{background:#ff8a3a}
      #railX.crit i{background:#ffd24a;box-shadow:0 0 8px rgba(255,214,90,.95),0 0 0 2px #3a2400}
      #railX.crit b{border-color:#ffd24a;box-shadow:0 0 12px rgba(255,214,90,.9)}
      #railX.crit{animation:railCritPulse .22s ease-out}
      @keyframes railCritRing{0%{transform:scale(.5);opacity:1}100%{transform:scale(1.5);opacity:0}}
      @keyframes railCritPulse{0%{transform:translate(-50%,-50%) scale(1)}40%{transform:translate(-50%,-50%) scale(1.5)}100%{transform:translate(-50%,-50%) scale(1)}}
      .railHit.block b{background:#d6d2c6;width:3px;height:9px;opacity:.9}
      .railHit.pickup b{background:#7ef0a0}
      .railHit span{position:absolute;left:50%;top:-16px;transform:translateX(-50%);font:900 12px/1 ui-monospace,monospace;letter-spacing:.1em;color:#ffd24a;text-shadow:0 2px 0 #201a00,0 0 6px rgba(255,210,74,.6);white-space:nowrap}
      @keyframes railHitPop{0%{transform:scale(.55);opacity:1}100%{transform:scale(1.12);opacity:.92}}
      #railX i{position:absolute;background:#ff2a2a;box-shadow:0 0 0 2px #1a0505}
      #railX i:nth-child(1){left:20px;top:0;width:6px;height:12px}
      #railX i:nth-child(2){left:20px;bottom:0;width:6px;height:12px}
      #railX i:nth-child(3){top:20px;left:0;width:12px;height:6px}
      #railX i:nth-child(4){top:20px;right:0;width:12px;height:6px}
      #railX b{position:absolute;inset:12px;border:4px solid #ff2a2a;border-radius:50%;box-shadow:0 0 0 2px #1a0505}
    `;
    document.head.appendChild(st);
  }

  const FONT = {};
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((ch, n) => {
    const g = [
      "01110","10001","10011","10101","11001","10001","01110",
      "00100","01100","00100","00100","00100","00100","01110",
      "01110","10001","00001","00010","00100","01000","11111",
      "11110","00001","00001","01110","00001","00001","11110",
      "00010","00110","01010","10010","11111","00010","00010",
      "11111","10000","11110","00001","00001","10001","01110",
      "00110","01000","10000","11110","10001","10001","01110",
      "11111","00001","00010","00100","01000","01000","01000",
      "01110","10001","10001","01110","10001","10001","01110",
      "01110","10001","10001","01111","00001","00010","01100",
      "01110","10001","10001","11111","10001","10001","10001",
      "11110","10001","10001","11110","10001","10001","11110",
      "01111","10000","10000","10000","10000","10000","01111",
      "11110","10001","10001","10001","10001","10001","11110",
      "11111","10000","10000","11110","10000","10000","11111",
      "11111","10000","10000","11110","10000","10000","10000",
      "01110","10000","10000","10011","10001","10001","01110",
      "10001","10001","10001","11111","10001","10001","10001",
      "01110","00100","00100","00100","00100","00100","01110",
      "00111","00010","00010","00010","00010","10010","01100",
      "10001","10010","10100","11000","10100","10010","10001",
      "10000","10000","10000","10000","10000","10000","11111",
      "10001","11011","10101","10101","10001","10001","10001",
      "10001","11001","10101","10011","10001","10001","10001",
      "01110","10001","10001","10001","10001","10001","01110",
      "11110","10001","10001","11110","10000","10000","10000",
      "01110","10001","10001","10001","10101","10010","01101",
      "11110","10001","10001","11110","10100","10010","10001",
      "01111","10000","10000","01110","00001","00001","11110",
      "11111","00100","00100","00100","00100","00100","00100",
      "10001","10001","10001","10001","10001","10001","01110",
      "10001","10001","10001","10001","10001","01010","00100",
      "10001","10001","10001","10101","10101","10101","01010",
      "10001","10001","01010","00100","01010","10001","10001",
      "10001","10001","01010","00100","00100","00100","00100",
      "11111","00001","00010","00100","01000","10000","11111"
    ];
    FONT[ch] = g.slice(n * 7, n * 7 + 7);
  });
  FONT[" "] = ["00000","00000","00000","00000","00000","00000","00000"];
  FONT["-"] = ["00000","00000","00000","11111","00000","00000","00000"];

  function blit(g, text, x, y, scale, color, outline) {
    const s = scale;
    for (let pass = 0; pass < 2; pass++) {
      const col = pass === 0 ? outline : color;
      const ox = pass === 0 ? 1 : 0;
      for (let i = 0; i < text.length; i++) {
        const rows = FONT[text[i]] || FONT[" "];
        if (!rows) continue;
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 5; c++) {
            if (rows[r][c] !== "1") continue;
            g.fillStyle = col;
            g.fillRect(x + i * (7 * s) + c * s + ox, y + r * s + ox, s, s);
          }
        }
      }
    }
  }

  function textW(text, scale) { return text.length * 7 * scale; }

  function bulletIcons(g, x, y, sc) {
    for (let i = 0; i < 3; i++) {
      const bx = x + i * 9 * sc;
      g.fillStyle = "#0a1c26";
      g.fillRect(bx - sc, y - sc, 7 * sc, 15 * sc);
      g.fillStyle = "#e6a92c";
      g.fillRect(bx, y + 3 * sc, 5 * sc, 10 * sc);
      g.fillStyle = "#f9dc86";
      g.fillRect(bx + sc, y + 4 * sc, 1.4 * sc, 8 * sc);
      g.fillStyle = "#b9761c";
      g.fillRect(bx, y + 12 * sc, 5 * sc, 1.2 * sc);
      g.fillStyle = "#f0cf7c";
      g.fillRect(bx + sc, y + sc, 3 * sc, 2 * sc);
      g.fillRect(bx + 2 * sc, y, sc, sc);
    }
  }
  function drawHud() {
    if (!hud) return;
    const c = hud.querySelector("canvas");
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.max(280, innerWidth);
    const h = Math.max(160, innerHeight);
    if (c.width !== Math.floor(w * dpr) || c.height !== Math.floor(h * dpr)) {
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
    }
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const m = Math.max(12, Math.round(w * 0.03));
    const sc = Math.max(1.15, Math.min(2.1, w / 545));
    let scv = Math.round(hud._score || 0);
    const neg = scv < 0;
    if (neg) scv = -scv;
    const score = (neg ? "-" : "") + String(scv).padStart(neg ? 6 : 7, "0");
    blit(g, "SCORE", m, m, sc, "#3ec0ff", "#062033");
    blit(g, score, m, m + 8 * sc + 4, sc, "#f4fbff", "#062033");
    const time = String(Math.max(0, Math.ceil(clock))).padStart(2, "0");
    const tw = textW(time, sc * 2);
    blit(g, "TIME", (w - textW("TIME", sc)) / 2, m, sc, "#ffe14a", "#2a2204");
    blit(g, time, (w - tw) / 2, m + 10 * sc, sc * 2, "#ffe14a", "#1a1402");
    const stage = "STAGE 1-1";
    blit(g, stage, w - m - textW(stage, sc), m, sc, "#f7f7f7", "#111");
    blit(g, "HP " + hp, m, m + 20 * sc, sc, "#ff8a7a", "#2a0c0c");
    blit(g, "X" + lives, m + textW("HP 100 ", sc), m + 20 * sc, sc, "#fff", "#111");
    const by = h - m - 12 * sc;
    blit(g, "BULLET", m, by, sc, "#3ec0ff", "#062033");
    blit(g, String(bullets).padStart(2, "0"), m + textW("BULLET ", sc), by, sc, "#fff", "#062033");
    bulletIcons(g, m, by - 16 * sc, sc);
    const cred = "CREDIT 0";
    const edge = m + 96;
    blit(g, cred, w - edge - textW(cred, sc), h - m - 12 * sc, sc, "#f7f7f7", "#111");
    if (combo > 1) blit(g, "COMBO " + combo, m, m + 32 * sc, sc, "#ffe14a", "#2a2204");
  }

  function ensureHud(score) {
    if (!hud) {
      hud = document.createElement("div");
      hud.id = "railHud";
      hud.innerHTML = "<canvas></canvas>";
      document.body.appendChild(hud);
      const x = document.createElement("div");
      x.id = "railX";
      x.innerHTML = "<i></i><i></i><i></i><i></i><b></b>";
      document.body.appendChild(x);
    }
    hud._score = score | 0;
    drawHud();
  }

  function cloneMat(mat, rx, ry) {
    if (!mat) return new T.MeshLambertMaterial({ color: 0x8d8880 });
    const m = mat.clone();
    if (mat.map) {
      m.map = mat.map.clone();
      m.map.wrapS = m.map.wrapT = T.RepeatWrapping;
      m.map.repeat.set(rx || 1, ry || 1);
      m.map.needsUpdate = true;
    }
    return m;
  }

  function box(scene, w, h, d, x, y, z, mat) {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  /* =========================================================
     Military reskin: canvas textures, battlefield props and
     voxel soldiers. Everything is built out of boxes so it
     keeps the blocky look of the jump engine.
     ========================================================= */
  const MT = {};
  const SOL = {};

  /* Highest anisotropic filtering the GPU allows, capped at 8: floors and
     walls keep their grain at grazing angles instead of smearing to mush. */
  let MAXANISO = 4;

  function ctex(key, w, h, draw, opt) {
    if (MT[key]) return MT[key];
    const t0 = (typeof performance !== "undefined" ? performance.now() : 0);
    const o = opt || {};
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const g = cv.getContext("2d");
    draw(g, w, h);
    const t = new T.CanvasTexture(cv);
    if (T.sRGBEncoding !== undefined) t.encoding = T.sRGBEncoding;
    t.magFilter = T.LinearFilter;
    t.minFilter = T.LinearMipMapLinearFilter;
    t.generateMipmaps = true;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = Math.max(1, Math.min(8, MAXANISO));
    t.needsUpdate = true;
    MT[key] = t;
    try {
      if (!window.__texSizes) window.__texSizes = {};
      window.__texSizes[key] = [w, h, t.anisotropy];
      if (!window.__texCanvases) window.__texCanvases = {};
      window.__texCanvases[key] = cv;
      window.__texMs = +((window.__texMs || 0) + (performance.now() - t0)).toFixed(1);
    } catch (e) {}
    return t;
  }

  /* Textures painted before the renderer exists only see the default limit,
     so once the GPU answer is known every cached texture is re-stamped. */
  function applyAniso() {
    const a = Math.max(1, Math.min(8, MAXANISO));
    Object.keys(MT).forEach((k) => {
      const t = MT[k];
      if (t && t.isTexture) { t.anisotropy = a; t.needsUpdate = true; }
    });
  }

  function rng(seed) {
    let s = seed || 1;
    return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  }

  function hex2rgb(hex) {
    const n = parseInt(String(hex).replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /* multiply (k only) or blend (k toward the given hex) */
  function shade(hex, k, towards) {
    let [r, gg, b] = hex2rgb(hex);
    if (towards) {
      const [tr, tg, tb] = hex2rgb(towards);
      r += (tr - r) * k; gg += (tg - gg) * k; b += (tb - b) * k;
    } else {
      r *= k; gg *= k; b *= k;
    }
    const c = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return "rgb(" + c(r) + "," + c(gg) + "," + c(b) + ")";
  }

  /* rounded rect path that works without ctx.roundRect */
  function rr(g, x, y, w, h, r) {
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath();
    g.moveTo(x + rad, y);
    g.lineTo(x + w - rad, y);
    g.quadraticCurveTo(x + w, y, x + w, y + rad);
    g.lineTo(x + w, y + h - rad);
    g.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    g.lineTo(x + rad, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - rad);
    g.lineTo(x, y + rad);
    g.quadraticCurveTo(x, y, x + rad, y);
    g.closePath();
  }

  /* draw once plus its wrapped copies so anything crossing an edge meets
     itself on the far side (all textures repeat) */
  function wrapDraw(w, h, x, y, r, fn) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const px = x + dx * w, py = y + dy * h;
        if (px + r < 0 || px - r > w || py + r < 0 || py - r > h) continue;
        fn(px, py);
      }
    }
  }

  function speck(g, w, h, cols, seed, n, size) {
    const R = rng(seed);
    const s = size || Math.max(1, w / 256);
    for (let i = 0; i < n; i++) {
      g.globalAlpha = 0.07 + R() * 0.2;
      g.fillStyle = cols[(R() * cols.length) | 0];
      g.fillRect((R() * w) | 0, (R() * h) | 0, s + ((R() * s * 2) | 0), s + ((R() * s) | 0));
    }
    g.globalAlpha = 1;
  }

  /* ---- stone masonry ------------------------------------------------ */

  /* Ashlar courses: even rows of cut blocks with real mortar joints, a
     bevel on every block, per-block tone, chipped corners and grime. */
  function blockTex(key, base, mortar, tint, seed, opt) {
    const o = opt || {};
    const SZ = o.size || 512;
    return ctex(key, SZ, SZ, (g, w, h) => {
      const R = rng(seed);
      const u = w / 256;
      g.fillStyle = mortar;
      g.fillRect(0, 0, w, h);
      // mortar bed grain
      speck(g, w, h, [shade(mortar, 1.25), shade(mortar, 0.72)], seed + 1, 900 * u * u, u);

      const rows = o.rows || 8;
      const rh = h / rows;
      const joint = Math.max(1, 1.4 * u);
      for (let r = 0; r < rows; r++) {
        const y0 = r * rh;
        let x = -R() * 48 * u;
        while (x < w) {
          const pick = R();
          let bw = (pick < 0.45 ? 32 : pick < 0.8 ? 48 : 64) * u;
          if (w - x < 16 * u) bw = w - x + 32 * u;
          const bx = x + joint, bwid = bw - joint * 2, bhei = rh - joint * 2;
          const by = y0 + joint;
          const tone = 0.9 + R() * 0.2;
          const col = shade(base, tone);
          wrapDraw(w, h, bx + bwid / 2, by + bhei / 2, Math.max(bwid, bhei), (px, py) => {
            const x0 = px - bwid / 2, y0b = py - bhei / 2;
            // face
            g.fillStyle = col;
            rr(g, x0, y0b, bwid, bhei, 1.6 * u);
            g.fill();
            // top light + bottom shadow bevel
            g.fillStyle = "rgba(255,252,240,.30)";
            g.fillRect(x0 + 1.2 * u, y0b + 0.9 * u, bwid - 2.4 * u, 1.1 * u);
            g.fillStyle = "rgba(255,252,240,.14)";
            g.fillRect(x0 + 1.2 * u, y0b + 0.9 * u, 1.1 * u, bhei - 2.4 * u);
            g.fillStyle = "rgba(24,20,14,.26)";
            g.fillRect(x0 + 1.2 * u, y0b + bhei - 2 * u, bwid - 2.4 * u, 1.3 * u);
            g.fillStyle = "rgba(24,20,14,.16)";
            g.fillRect(x0 + bwid - 2.3 * u, y0b + 0.9 * u, 1.2 * u, bhei - 2.4 * u);
            // pitted stone face
            const pr = rng((seed + r * 97 + (x | 0)) | 0);
            for (let i = 0; i < 26 * u * u; i++) {
              g.globalAlpha = 0.06 + pr() * 0.16;
              g.fillStyle = pr() < 0.5 ? tint[(pr() * tint.length) | 0] : "#ffffff";
              g.fillRect(x0 + 1.5 * u + pr() * (bwid - 3 * u), y0b + 1.5 * u + pr() * (bhei - 3 * u),
                0.8 * u + pr() * 1.6 * u, 0.8 * u + pr() * 1.4 * u);
            }
            g.globalAlpha = 1;
            // a chipped corner here and there
            if (pr() < 0.3) {
              const cxp = pr() < 0.5 ? x0 + 2 * u : x0 + bwid - 7 * u;
              const cyp = pr() < 0.5 ? y0b + 2 * u : y0b + bhei - 7 * u;
              g.fillStyle = shade(base, 0.68);
              g.beginPath();
              g.moveTo(cxp, cyp);
              g.lineTo(cxp + 5 * u, cyp + 1.4 * u);
              g.lineTo(cxp + 1.4 * u, cyp + 5 * u);
              g.closePath();
              g.fill();
            }
            // block shadow onto the course below
            g.fillStyle = "rgba(20,18,12,.16)";
            g.fillRect(x0 - 0.4 * u, y0b + bhei, bwid + 0.8 * u, 1.4 * u);
          });
          x += bw;
        }
      }

      // grime running down the wall + damp patches along the bottom
      for (let i = 0; i < 9 + 6 * u; i++) {
        const gx = R() * w, gyy = R() * h * 0.5, gh = 40 * u + R() * 130 * u, gw = 3 * u + R() * 9 * u;
        wrapDraw(w, h, gx, gyy + gh / 2, gh, (px, py) => {
          const lg = g.createLinearGradient(px, py - gh / 2, px, py + gh / 2);
          lg.addColorStop(0, "rgba(48,44,34,.16)");
          lg.addColorStop(1, "rgba(48,44,34,0)");
          g.fillStyle = lg;
          g.fillRect(px - gw / 2, py - gh / 2, gw, gh);
        });
      }
      lightenNoise(g, w, h, seed + 5, 0.05);
    });
  }

  /* cast concrete: aggregate, pour lines, form-board seams, hairline cracks */
  function concreteTex(key, base, seed) {
    return ctex(key, 512, 512, (g, w, h) => {
      const R = rng(seed);
      const u = w / 256;
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      // aggregate: few enough stones that the surface still reads as concrete
      for (let i = 0; i < 1500; i++) {
        g.globalAlpha = 0.03 + R() * 0.1;
        g.fillStyle = ["#cfcdc2", "#8e8c82", "#a8a69b", "#e6e4d8", "#6f6d64"][(R() * 5) | 0];
        const s = 0.9 * u + R() * 2.4 * u;
        g.fillRect(R() * w, R() * h, s, s * (0.7 + R() * 0.6));
      }
      g.globalAlpha = 1;
      // faint pore holes
      for (let i = 0; i < 150; i++) {
        const x = R() * w, y = R() * h, r = 0.8 * u + R() * 2 * u;
        g.globalAlpha = 0.12 + R() * 0.16;
        g.fillStyle = "rgba(58,56,50,1)";
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        g.globalAlpha = 0.12;
        g.fillStyle = "rgba(255,255,248,1)";
        g.beginPath(); g.arc(x - r * 0.3, y - r * 0.45, r * 0.6, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
      // form-board seams (vertical panel joints, every quarter of the tile)
      for (let i = 0; i < 4; i++) {
        const x = i * (w / 4);
        g.fillStyle = "rgba(60,58,52,.34)";
        g.fillRect(x, 0, 1.6 * u, h);
        g.fillStyle = "rgba(255,255,246,.22)";
        g.fillRect(x + 1.6 * u, 0, 1.1 * u, h);
      }
      // pour line
      g.fillStyle = "rgba(54,52,46,.3)";
      g.fillRect(0, h * 0.5, w, 1.2 * u);
      // hairline cracks
      for (let c = 0; c < 5 + 4 * u; c++) {
        let x = R() * w, y = R() * h;
        g.strokeStyle = "rgba(46,44,40,.42)";
        g.lineWidth = 0.8 * u;
        g.beginPath();
        g.moveTo(x, y);
        const steps = 8 + ((R() * 10) | 0);
        for (let s = 0; s < steps; s++) {
          x += (R() - 0.5) * 22 * u;
          y += 6 * u + R() * 14 * u;
          g.lineTo(x, y);
        }
        g.stroke();
        g.strokeStyle = "rgba(255,255,250,.2)";
        g.lineWidth = 0.7 * u;
        g.stroke();
      }
      // stains
      for (let i = 0; i < 6; i++) {
        const x = R() * w, y = R() * h, r = 14 * u + R() * 34 * u;
        wrapDraw(w, h, x, y, r, (px, py) => {
          const rg = g.createRadialGradient(px, py, 0, px, py, r);
          rg.addColorStop(0, "rgba(86,82,70,.16)");
          rg.addColorStop(1, "rgba(86,82,70,0)");
          g.fillStyle = rg;
          g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        });
      }
    });
  }

  /* cobblestone paving: laid stones, worn tops, mud in the joints */
  function cobbleTex(key, base, seed) {
    return ctex(key, 512, 512, (g, w, h) => {
      const R = rng(seed);
      const u = w / 256;
      g.fillStyle = "#4e4a41";
      g.fillRect(0, 0, w, h);
      speck(g, w, h, ["#6a6456", "#3c3830"], seed + 2, 1400 * u * u, u);
      const rows = 10, cols = 10;
      const cw = w / cols, ch = h / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const off = (r % 2) * cw * 0.5;
          const cx = c * cw + off;
          const cy = r * ch;
          const bw = cw - 2.4 * u + (R() - 0.5) * 4 * u;
          const bh = ch - 2.4 * u + (R() - 0.5) * 3 * u;
          const tone = 0.8 + R() * 0.36;
          const col = shade(base, tone);
          const midx = cx + (R() - 0.5) * 3 * u, midy = cy + (R() - 0.5) * 2 * u;
          wrapDraw(w, h, midx, midy, Math.max(bw, bh), (px, py) => {
            const x0 = px - bw / 2, y0 = py - bh / 2;
            g.fillStyle = "rgba(18,16,12,.5)";
            rr(g, x0 + 0.8 * u, y0 + 1.6 * u, bw, bh, 4 * u);
            g.fill();
            g.fillStyle = col;
            rr(g, x0, y0, bw, bh, 3.4 * u);
            g.fill();
            // worn shape: lighter crown, darker rim
            const rg = g.createRadialGradient(x0 + bw * 0.42, y0 + bh * 0.36, 0, x0 + bw / 2, y0 + bh / 2, bw * 0.72);
            rg.addColorStop(0, "rgba(255,252,240,.16)");
            rg.addColorStop(0.62, "rgba(255,252,240,0)");
            rg.addColorStop(1, "rgba(30,26,20,.28)");
            g.fillStyle = rg;
            rr(g, x0, y0, bw, bh, 3.4 * u);
            g.fill();
            // speckle grit on the stone
            const pr = rng((seed + r * 31 + c * 17) | 0);
            for (let i = 0; i < 14 * u * u + 6; i++) {
              g.globalAlpha = 0.06 + pr() * 0.14;
              g.fillStyle = pr() < 0.5 ? "#ffffff" : "#3a352c";
              g.fillRect(x0 + 2 * u + pr() * (bw - 4 * u), y0 + 2 * u + pr() * (bh - 4 * u), 1.4 * u, 1.1 * u);
            }
            g.globalAlpha = 1;
          });
        }
      }
      // muddy joints and worn patches
      for (let i = 0; i < 10; i++) {
        const x = R() * w, y = R() * h, r = 10 * u + R() * 26 * u;
        wrapDraw(w, h, x, y, r, (px, py) => {
          const rg = g.createRadialGradient(px, py, 0, px, py, r);
          rg.addColorStop(0, "rgba(74,66,44,.2)");
          rg.addColorStop(1, "rgba(74,66,44,0)");
          g.fillStyle = rg;
          g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        });
      }
      // a hairline crack running through a few stones
      for (let k = 0; k < 2; k++) {
        let x = R() * w, y = R() * h;
        const dir = R() * 6.283;
        let ang = dir;
        const pts = [[x, y]];
        for (let s = 0; s < 9; s++) {
          ang += (R() - 0.5) * 0.5;
          const len = (12 + R() * 26) * u;
          x += Math.cos(ang) * len;
          y += Math.sin(ang) * len;
          pts.push([x, y]);
        }
        g.strokeStyle = "rgba(26,24,20,.32)";
        g.lineWidth = 0.9 * u;
        g.beginPath();
        pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
        g.stroke();
        g.strokeStyle = "rgba(255,250,235,.18)";
        g.lineWidth = 0.6 * u;
        g.beginPath();
        pts.forEach((p, i) => (i ? g.lineTo(p[0] + 1.1 * u, p[1] + 1.1 * u) : g.moveTo(p[0] + 1.1 * u, p[1] + 1.1 * u)));
        g.stroke();
      }
    });
  }

  /* ---- fabric ------------------------------------------------------- */

  /* digital camo: pixel-stepped clusters on a base tone + printed weave */
  function camoTex(key, cols, seed, size) {
    const SZ = size || 256;
    return ctex(key, SZ, SZ, (g, w, h) => {
      const R = rng(seed);
      const cell = Math.max(2, w / 32);
      g.fillStyle = cols[0];
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 44; i++) {
        const bx = R() * w, by = R() * h;
        const nx = 2 + ((R() * 4) | 0), ny = 2 + ((R() * 4) | 0);
        const col = cols[1 + ((R() * (cols.length - 1)) | 0)];
        g.fillStyle = col;
        wrapDraw(w, h, bx, by, nx * cell, (px, py) => {
          for (let iy = 0; iy < ny; iy++) {
            for (let ix = 0; ix < nx; ix++) {
              if ((iy === 0 || iy === ny - 1) && (ix === 0 || ix === nx - 1)) continue;
              if ((iy === 1 || iy === ny - 2) && (ix === 0 || ix === nx - 1) && R() < 0.6) continue;
              g.fillRect(px - (nx * cell) / 2 + ix * cell, py - (ny * cell) / 2 + iy * cell, cell + 0.4, cell + 0.4);
            }
          }
        });
      }
      // printed fabric weave sitting under the pattern
      g.globalAlpha = 0.1;
      g.fillStyle = "#000000";
      for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 0.7);
      g.globalAlpha = 0.08;
      g.fillStyle = "#ffffff";
      for (let x = 0; x < w; x += 2) g.fillRect(x, 0, 0.7, h);
      g.globalAlpha = 1;
      speck(g, w, h, ["#1d2416", "#000000", "#4d5a33"], seed + 3, 500 * (SZ / 128) * (SZ / 128), 0.6 * (SZ / 128));
      // soft folds so the blocks do not read as flat paper
      for (let i = 0; i < 4; i++) {
        const y = R() * h, th = 6 + R() * 16;
        const lg = g.createLinearGradient(0, y - th, 0, y + th);
        lg.addColorStop(0, "rgba(255,255,255,.05)");
        lg.addColorStop(0.5, "rgba(0,0,0,.08)");
        lg.addColorStop(1, "rgba(255,255,255,.03)");
        g.fillStyle = lg;
        g.fillRect(0, y - th, w, th * 2);
      }
    });
  }

  /* burlap: jute weave with fibers, dirt and stitched seams */
  function burlapTex(key, base, seed) {
    return ctex(key, 256, 256, (g, w, h) => {
      const R = rng(seed);
      const u = w / 128;
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      const step = 4 * u;
      for (let y = 0; y < h; y += step) {
        g.globalAlpha = 0.17;
        g.fillStyle = "#6a5836";
        g.fillRect(0, y, w, step * 0.42);
        g.globalAlpha = 0.1;
        g.fillStyle = "#f2e5c2";
        g.fillRect(0, y + step * 0.55, w, step * 0.28);
      }
      for (let x = 0; x < w; x += step) {
        g.globalAlpha = 0.13;
        g.fillStyle = "#5c4a2a";
        g.fillRect(x, 0, step * 0.4, h);
        g.globalAlpha = 0.09;
        g.fillStyle = "#f6ecc9";
        g.fillRect(x + step * 0.58, 0, step * 0.28, h);
      }
      g.globalAlpha = 1;
      // loose jute fibers
      for (let i = 0; i < 190; i++) {
        g.globalAlpha = 0.05 + R() * 0.13;
        g.strokeStyle = R() < 0.5 ? "#57451f" : "#f0e3c0";
        g.lineWidth = 0.8 * u;
        const x = R() * w, y = R() * h, l = (3 + R() * 8) * u, a = (R() - 0.5) * 0.5;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      g.globalAlpha = 1;
      // dust and sand trapped in the weave
      for (let i = 0; i < 8; i++) {
        const x = R() * w, y = R() * h, r = (10 + R() * 22) * u;
        wrapDraw(w, h, x, y, r, (px, py) => {
          const rg = g.createRadialGradient(px, py, 0, px, py, r);
          rg.addColorStop(0, "rgba(86,68,38,.26)");
          rg.addColorStop(1, "rgba(86,68,38,0)");
          g.fillStyle = rg;
          g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        });
      }
      // stitched seam along the top like a filled bag
      g.strokeStyle = "rgba(58,46,26,.6)";
      g.lineWidth = 1.4 * u;
      g.setLineDash([4 * u, 3 * u]);
      g.beginPath(); g.moveTo(0, 6 * u); g.lineTo(w, 6 * u); g.stroke();
      g.setLineDash([]);
    });
  }

  /* neutral weave multiplied by a material colour keeps uniforms from
     reading as flat plastic */
  function weaveTex(key, base, seed, step) {
    return ctex(key, 256, 256, (g, w, h) => {
      const R = rng(seed);
      const u = w / 128;
      const st = (step || 2) * u;
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += st) {
        g.globalAlpha = 0.1;
        g.fillStyle = "#000000";
        g.fillRect(0, y, w, st * 0.45);
        g.globalAlpha = 0.07;
        g.fillStyle = "#ffffff";
        g.fillRect(0, y + st * 0.55, w, st * 0.4);
      }
      for (let x = 0; x < w; x += st) {
        g.globalAlpha = 0.075;
        g.fillStyle = "#000000";
        g.fillRect(x, 0, st * 0.45, h);
        g.globalAlpha = 0.055;
        g.fillStyle = "#ffffff";
        g.fillRect(x + st * 0.55, 0, st * 0.4, h);
      }
      g.globalAlpha = 1;
      // slubs and wear
      for (let i = 0; i < 150; i++) {
        g.globalAlpha = 0.04 + R() * 0.1;
        g.fillStyle = R() < 0.55 ? "#000000" : "#ffffff";
        g.fillRect(R() * w, R() * h, (1 + R() * 5) * u, (0.8 + R() * 2) * u);
      }
      g.globalAlpha = 1;
      for (let i = 0; i < 5; i++) {
        const x = R() * w, y = R() * h, r = (12 + R() * 26) * u;
        wrapDraw(w, h, x, y, r, (px, py) => {
          const rg = g.createRadialGradient(px, py, 0, px, py, r);
          rg.addColorStop(0, "rgba(0,0,0,.09)");
          rg.addColorStop(1, "rgba(0,0,0,0)");
          g.fillStyle = rg;
          g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        });
      }
    });
  }

  /* ---- timber ------------------------------------------------------- */

  function woodTex(key, base, dark, light, seed) {
    return ctex(key, 512, 512, (g, w, h) => {
      const R = rng(seed);
      const u = w / 256;
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      const planks = 4, ph = h / planks;
      for (let p = 0; p < planks; p++) {
        const y0 = p * ph;
        g.fillStyle = shade(base, 0.88 + R() * 0.24);
        g.fillRect(0, y0, w, ph);
        // grain: sine lines that meet themselves at the tile seam
        for (let i = 0; i < 44; i++) {
          const gy = y0 + 3 * u + R() * (ph - 6 * u);
          const freq = 1 + ((R() * 3) | 0);
          const amp = (0.8 + R() * 2.2) * u;
          const phase = R() * 6.28;
          g.globalAlpha = 0.1 + R() * 0.26;
          g.strokeStyle = R() < 0.55 ? dark : light;
          g.lineWidth = (0.6 + R() * 1.2) * u;
          g.beginPath();
          for (let x = 0; x <= w; x += 8 * u) {
            const yy = gy + Math.sin((x / w) * 6.283 * freq + phase) * amp
                       + Math.sin((x / w) * 6.283 * (freq + 3) + phase) * amp * 0.35;
            if (x === 0) g.moveTo(x, yy);
            else g.lineTo(x, yy);
          }
          g.stroke();
        }
        g.globalAlpha = 1;
        // knot
        if (R() < 0.85) {
          const kx = R() * w, ky = y0 + ph * (0.3 + R() * 0.4);
          const kr = (5 + R() * 5) * u;
          wrapDraw(w, h, kx, ky, kr * 2, (px, py) => {
            for (let r = kr; r > 0; r -= kr / 4) {
              g.strokeStyle = "rgba(54,32,12," + (0.12 + 0.08 * r / kr) + ")";
              g.lineWidth = 1 * u;
              g.beginPath();
              g.ellipse(px, py, r * 1.5, r * 0.62, 0.4, 0, 7);
              g.stroke();
            }
            g.fillStyle = "rgba(38,22,8,.55)";
            g.beginPath(); g.ellipse(px, py, kr * 0.4, kr * 0.26, 0.4, 0, 7); g.fill();
          });
        }
        // seam between boards
        g.fillStyle = "rgba(26,16,6,.55)";
        g.fillRect(0, y0, w, 2 * u);
        g.fillStyle = "rgba(255,236,204,.16)";
        g.fillRect(0, y0 + 2 * u, w, 1 * u);
      }
      // nail heads along the seams
      for (let p = 0; p < planks; p++) {
        for (let i = 0; i < 4; i++) {
          const nx = (i + 0.5) * (w / 4) + (R() - 0.5) * 12 * u;
          const ny = p * ph + 2.4 * u;
          g.fillStyle = "rgba(40,40,44,.7)";
          g.beginPath(); g.arc(nx, ny, 1.5 * u, 0, 7); g.fill();
          g.fillStyle = "rgba(230,232,238,.35)";
          g.beginPath(); g.arc(nx - 0.4 * u, ny - 0.4 * u, 0.6 * u, 0, 7); g.fill();
        }
      }
      speck(g, w, h, [dark, light], seed + 9, 900 * (w / 256) * (h / 256), u);
    });
  }

  /* ---- paint, metal, ground ---------------------------------------- */

  function barrelTex(key, seed) {
    return ctex(key, 256, 256, (g, w, h) => {
      const R = rng(seed);
      const u = w / 128;
      g.fillStyle = "#b8302a";
      g.fillRect(0, 0, w, h);
      const lg = g.createLinearGradient(0, 0, w, 0);
      lg.addColorStop(0, "rgba(0,0,0,.28)");
      lg.addColorStop(0.35, "rgba(255,255,255,.14)");
      lg.addColorStop(0.6, "rgba(255,255,255,.05)");
      lg.addColorStop(1, "rgba(0,0,0,.34)");
      g.fillStyle = lg;
      g.fillRect(0, 0, w, h);
      // rolling hoops
      [0.16, 0.5, 0.84].forEach((f) => {
        const y = f * h;
        g.fillStyle = "rgba(72,20,16,.6)";
        g.fillRect(0, y - 4 * u, w, 8 * u);
        g.fillStyle = "rgba(255,220,200,.18)";
        g.fillRect(0, y - 4 * u, w, 1.6 * u);
        g.fillStyle = "rgba(0,0,0,.28)";
        g.fillRect(0, y + 2.4 * u, w, 1.6 * u);
      });
      // rust, dents and scratched paint
      for (let i = 0; i < 26; i++) {
        const x = R() * w, y = R() * h, r = (2 + R() * 9) * u;
        wrapDraw(w, h, x, y, r * 2, (px, py) => {
          const rg = g.createRadialGradient(px, py, 0, px, py, r);
          rg.addColorStop(0, "rgba(120,64,22,.55)");
          rg.addColorStop(0.7, "rgba(88,42,16,.3)");
          rg.addColorStop(1, "rgba(88,42,16,0)");
          g.fillStyle = rg;
          g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        });
      }
      for (let i = 0; i < 16; i++) {
        g.globalAlpha = 0.3 + R() * 0.4;
        g.strokeStyle = R() < 0.5 ? "rgba(240,220,200,.5)" : "rgba(60,16,12,.5)";
        g.lineWidth = 0.8 * u;
        const x = R() * w, y = R() * h;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 20 * u, y + (R() - 0.5) * 6 * u); g.stroke();
      }
      g.globalAlpha = 1;
      speck(g, w, h, ["#e05a4a", "#7a1612"], seed + 4, 420, u);
    });
  }

  /* machined steel: brushed streaks along the slide, polishing bands,
     scratches and pits. Kept near white so it multiplies with the part
     colour instead of replacing it. */
  function metalTex(key, seed, opt) {
    const o = opt || {};
    const SZ = o.size || 256;
    return ctex(key, SZ, SZ, (g, w, h) => {
      const R = rng(seed);
      const u = w / 256;
      g.fillStyle = o.base || "#e6eaee";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600 * u; i++) {
        g.globalAlpha = 0.035 + R() * 0.11;
        g.fillStyle = R() < 0.52 ? "#ffffff" : "#7d8794";
        g.fillRect(R() * w, R() * h, (10 + R() * 90) * u, (0.5 + R() * 1.1) * u);
      }
      g.globalAlpha = 1;
      for (let i = 0; i < 3; i++) {
        const y = R() * h, th = (18 + R() * 44) * u;
        const lg = g.createLinearGradient(0, y - th, 0, y + th);
        lg.addColorStop(0, "rgba(255,255,255,0)");
        lg.addColorStop(0.45, "rgba(255,255,255,.2)");
        lg.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = lg;
        g.fillRect(0, y - th, w, th * 2);
      }
      for (let i = 0; i < 26; i++) {
        g.globalAlpha = 0.09 + R() * 0.2;
        g.strokeStyle = R() < 0.62 ? "#5b6470" : "#ffffff";
        g.lineWidth = (0.5 + R() * 0.9) * u;
        const x = R() * w, y = R() * h, a = (R() - 0.5) * 0.5, l = (6 + R() * 60) * u;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      g.globalAlpha = 1;
      for (let i = 0; i < 30 * u; i++) {
        g.globalAlpha = 0.07 + R() * 0.13;
        g.fillStyle = "#4a525c";
        g.beginPath(); g.arc(R() * w, R() * h, (0.5 + R() * 1.1) * u, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
    });
  }

  /* stippled polymer: moulded grain and mottling that still reads when the
     material colour is almost black */
  function polymerTex(key, seed) {
    return ctex(key, 128, 128, (g, w, h) => {
      const R = rng(seed);
      const u = w / 128;
      g.fillStyle = "#d8d8d8";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 4 * u) {
        for (let x = 0; x < w; x += 4 * u) {
          const v = 0.82 + R() * 0.34;
          const c = Math.max(0, Math.min(255, Math.round(216 * v)));
          g.fillStyle = "rgb(" + c + "," + c + "," + c + ")";
          g.fillRect(x + R() * 1.5 * u, y + R() * 1.5 * u, 2.4 * u, 2.2 * u);
        }
      }
      for (let i = 0; i < 90; i++) {
        g.globalAlpha = 0.05 + R() * 0.12;
        g.fillStyle = R() < 0.5 ? "#ffffff" : "#8a8a8a";
        g.fillRect(R() * w, R() * h, (1 + R() * 6) * u, (0.8 + R() * 2) * u);
      }
      g.globalAlpha = 1;
    });
  }

  /* scuffed leather for boots, straps and holsters */
  function leatherTex(key, base, seed) {
    return ctex(key, 256, 256, (g, w, h) => {
      const R = rng(seed);
      const u = w / 256;
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 420; i++) {
        g.globalAlpha = 0.05 + R() * 0.14;
        g.fillStyle = R() < 0.5 ? "#ffffff" : "#000000";
        const s = (1 + R() * 5) * u;
        g.fillRect(R() * w, R() * h, s, s * (0.5 + R() * 1.2));
      }
      g.globalAlpha = 1;
      // creases across the flex lines
      for (let i = 0; i < 16; i++) {
        g.globalAlpha = 0.1 + R() * 0.16;
        g.strokeStyle = R() < 0.6 ? "#000000" : "#ffffff";
        g.lineWidth = (0.7 + R() * 1.3) * u;
        const y = R() * h;
        g.beginPath();
        for (let x = 0; x <= w; x += 10 * u) {
          const yy = y + Math.sin((x / w) * 6.283 * (1 + ((R() * 2) | 0))) * 3 * u;
          if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
        }
        g.stroke();
      }
      g.globalAlpha = 1;
      // polish patches where it rubs
      for (let i = 0; i < 5; i++) {
        const x = R() * w, y = R() * h, r = (14 + R() * 30) * u;
        wrapDraw(w, h, x, y, r, (px, py) => {
          const rg = g.createRadialGradient(px, py, 0, px, py, r);
          rg.addColorStop(0, "rgba(255,246,226,.16)");
          rg.addColorStop(1, "rgba(255,246,226,0)");
          g.fillStyle = rg;
          g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        });
      }
    });
  }

  /* pistol grip: diamond checkering cut into the side panels, a stippled
     front strap, rubbed-smooth wear and a few moulding marks. */
  function gripTex() {
    return ctex("grip", 256, 256, (g, w, h) => {
      const R = rng(17);
      const u = w / 256;
      g.fillStyle = "#2c343d";
      g.fillRect(0, 0, w, h);
      speck(g, w, h, ["#1a2027", "#3d4752", "#242b33"], 5, 2200, 0.9 * u);
      // diamond checkering lattice
      const step = 14 * u;
      const span = w + h;
      g.lineCap = "butt";
      for (let i = -span; i < span * 2; i += step) {
        g.strokeStyle = "rgba(5,8,11,.92)";
        g.lineWidth = 2.8 * u;
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke();
        g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke();
        // raised ridge catching light on the upper side of each groove
        g.strokeStyle = "rgba(188,208,228,.46)";
        g.lineWidth = 1.3 * u;
        g.beginPath(); g.moveTo(i - 2 * u, 0); g.lineTo(i + h - 2 * u, h); g.stroke();
        g.beginPath(); g.moveTo(i + 2 * u, h); g.lineTo(i + h + 2 * u, 0); g.stroke();
      }
      // stippled front-strap bands
      for (let b = 0; b < 2; b++) {
        const y0 = h * (0.16 + b * 0.52), y1 = y0 + h * 0.2;
        for (let i = 0; i < 900; i++) {
          const x = 6 * u + R() * (w - 12 * u), y = y0 + R() * (y1 - y0);
          g.globalAlpha = 0.3 + R() * 0.5;
          g.fillStyle = R() < 0.5 ? "rgba(8,11,14,.9)" : "rgba(120,140,164,.35)";
          g.beginPath(); g.arc(x, y, (0.6 + R() * 1.1) * u, 0, 7); g.fill();
        }
      }
      g.globalAlpha = 1;
      // rubbed-smooth wear where the hand sits
      for (let i = 0; i < 7; i++) {
        const x = R() * w, y = R() * h, r = (16 + R() * 40) * u;
        wrapDraw(w, h, x, y, r, (px, py) => {
          const rg = g.createRadialGradient(px, py, 0, px, py, r);
          rg.addColorStop(0, "rgba(150,166,184,.16)");
          rg.addColorStop(1, "rgba(150,166,184,0)");
          g.fillStyle = rg;
          g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        });
      }
      // mould seams and a magazine-release notch
      g.strokeStyle = "rgba(0,0,0,.5)";
      g.lineWidth = 1.6 * u;
      g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(w, h * 0.52); g.stroke();
      g.fillStyle = "rgba(8,10,13,.85)";
      g.beginPath(); g.arc(w * 0.5, h * 0.07, 5.5 * u, 0, 7); g.fill();
      g.fillStyle = "rgba(170,186,204,.3)";
      g.beginPath(); g.arc(w * 0.5 - 1.2 * u, h * 0.07 - 1.2 * u, 2.2 * u, 0, 7); g.fill();
    });
  }

  function groundTex(key, seed) {
    return ctex(key, 512, 512, (g, w, h) => {
      const R = rng(seed);
      const u = w / 128;
      g.fillStyle = "#7d7a5e";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900 * 6; i++) {
        g.globalAlpha = 0.08 + R() * 0.22;
        g.fillStyle = ["#6a6748", "#8f8b6a", "#5c5a3f", "#9c9878", "#4e4c34"][(R() * 5) | 0];
        const s = (0.8 + R() * 3) * u;
        g.fillRect(R() * w, R() * h, s, s * (0.6 + R() * 0.9));
      }
      g.globalAlpha = 1;
      // clods and pebbles
      for (let i = 0; i < 26 * 8; i++) {
        const x = R() * w, y = R() * h, r = (1.5 + R() * 4) * u;
        wrapDraw(w, h, x, y, r * 2, (px, py) => {
          g.fillStyle = "rgba(52,50,36,.35)";
          g.beginPath(); g.arc(px + 0.5 * u, py + 0.7 * u, r, 0, 7); g.fill();
          g.fillStyle = shade("#8a8568", 0.82 + R() * 0.4);
          g.beginPath(); g.arc(px, py, r * 0.9, 0, 7); g.fill();
        });
      }
      // scattered dry grass
      for (let i = 0; i < 70 * 6; i++) {
        g.globalAlpha = 0.12 + R() * 0.25;
        g.strokeStyle = R() < 0.5 ? "#6f7b46" : "#8f8a58";
        g.lineWidth = 0.8 * u;
        const x = R() * w, y = R() * h, l = (2 + R() * 5) * u, a = -1.57 + (R() - 0.5) * 1.2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      g.globalAlpha = 1;
    });
  }

  /* ---- Seoul street surfaces --------------------------------------- */

  /* asphalt: coarse aggregate in a dark bitumen base, tar seams sealed over,
     hairline cracks and the pale patches tyres polish into a junction */
  function asphaltTex(key, seed) {
    return ctex(key, 512, 512, (g, w, h) => {
      const R = rng(seed);
      const u = w / 128;
      g.fillStyle = "#4b4e54";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 6800; i++) {
        g.globalAlpha = 0.06 + R() * 0.2;
        g.fillStyle = ["#3b3e44", "#585c63", "#6a6e75", "#31343a", "#7c8188", "#43464c"][(R() * 6) | 0];
        const s = (0.5 + R() * 2.0) * u;
        g.fillRect(R() * w, R() * h, s, s * (0.7 + R() * 0.7));
      }
      g.globalAlpha = 1;
      for (let i = 0; i < 3; i++) {
        g.strokeStyle = "rgba(28,29,33,.5)";
        g.lineWidth = (2.2 + R() * 1.6) * u;
        g.beginPath();
        let x = R() * w, y = 0;
        g.moveTo(x, y);
        while (y < h) { y += 20 * u; x += (R() - 0.5) * 14 * u; g.lineTo(x, y); }
        g.stroke();
      }
      for (let i = 0; i < 26; i++) {
        g.strokeStyle = "rgba(24,25,28," + (0.18 + R() * 0.25).toFixed(2) + ")";
        g.lineWidth = 0.7 * u;
        let x = R() * w, y = R() * h;
        g.beginPath(); g.moveTo(x, y);
        for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 18 * u; y += (R() - 0.3) * 14 * u; g.lineTo(x, y); }
        g.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const x = R() * w, y = R() * h, r = (24 + R() * 40) * u;
        wrapDraw(w, h, x, y, r, (px, py) => {
          const rg = g.createRadialGradient(px, py, 0, px, py, r);
          rg.addColorStop(0, "rgba(150,155,162,.10)");
          rg.addColorStop(1, "rgba(150,155,162,0)");
          g.fillStyle = rg; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        });
      }
    });
  }

  /* sidewalk pavers: four 0.75 m blocks across, staggered joints, chipped
     corners and a bit of chewing gum ground into the surface */
  function paveTex(key, seed) {
    return ctex(key, 512, 512, (g, w, h) => {
      const R = rng(seed);
      const n = 4, s = w / n;
      g.fillStyle = "#7b7b78";
      g.fillRect(0, 0, w, h);
      for (let row = 0; row < n; row++) {
        for (let col = -1; col < n + 1; col++) {
          const off = row % 2 ? s / 2 : 0;
          const x = col * s + off + 3, y = row * s + 3;
          g.fillStyle = shade("#b6b6b1", 0.9 + R() * 0.2);
          g.fillRect(x, y, s - 6, s - 6);
          g.fillStyle = "rgba(255,255,255,.16)";
          g.fillRect(x, y, s - 6, 2);
          g.fillStyle = "rgba(40,40,38,.12)";
          g.fillRect(x, y + s - 8, s - 6, 2);
          for (let k = 0; k < 26; k++) {
            g.globalAlpha = 0.06 + R() * 0.16;
            g.fillStyle = R() < 0.5 ? "#8d8d88" : "#d4d4ce";
            g.fillRect(x + R() * (s - 8), y + R() * (s - 8), 1.5 * (w / 512) * 2, 1.5 * (w / 512) * 2);
          }
          g.globalAlpha = 1;
        }
      }
      for (let i = 0; i < 5; i++) {
        g.fillStyle = "rgba(38,36,32,.5)";
        g.beginPath(); g.arc(R() * w, R() * h, (2 + R() * 3) * (w / 512) * 2, 0, 7); g.fill();
      }
    });
  }

  /* a city facade tile: two floors of glazing over spandrel bands, mullions,
     sills, a few lit rooms and lowered blinds. One tile is 6 m wide and 6.4 m
     tall, so a wall repeats it by its own size. */
  function facadeTex(key, o, seed) {
    const P = o || {};
    const wall = P.wall || "#c2c6cb";
    const glassTop = P.glassTop || "#c2e0f3";
    const glassBot = P.glassBot || "#5b7d97";
    return ctex(key, 384, 384, (g, w, h) => {
      const R = rng(seed || 5);
      g.fillStyle = wall;
      g.fillRect(0, 0, w, h);
      speck(g, w, h, [shade(wall, 0.93), shade(wall, 1.05), shade(wall, 0.86)], (seed || 5) + 2, 380, 2);
      const bays = 3, floors = 2;
      const bw = w / bays, fh = h / floors;
      for (let f = 0; f < floors; f++) {
        const y0 = f * fh;
        g.fillStyle = shade(wall, 0.9);
        g.fillRect(0, y0 + fh - fh * 0.2, w, fh * 0.2);
        g.fillStyle = "rgba(255,255,255,.25)";
        g.fillRect(0, y0 + fh - fh * 0.2, w, 2);
        for (let b = 0; b < bays; b++) {
          const x0 = b * bw;
          const gx = x0 + bw * 0.1, gy = y0 + fh * 0.1;
          const gw = bw * 0.8, gh = fh * 0.62;
          g.fillStyle = shade(wall, 0.62);
          g.fillRect(gx - 4, gy - 4, gw + 8, gh + 8);
          const lit = R() < 0.09;
          const blinds = !lit && R() < 0.24;
          if (lit) {
            g.fillStyle = "#f6e8bd";
          } else {
            const lg = g.createLinearGradient(gx, gy, gx + gw * 0.4, gy + gh);
            lg.addColorStop(0, glassTop);
            lg.addColorStop(0.55, shade(glassTop, 0.86));
            lg.addColorStop(1, glassBot);
            g.fillStyle = lg;
          }
          g.fillRect(gx, gy, gw, gh);
          if (!lit) {
            g.globalAlpha = 0.5;
            g.fillStyle = "#f2fbff";
            g.beginPath();
            g.moveTo(gx, gy + gh * 0.06);
            g.lineTo(gx + gw * 0.44, gy);
            g.lineTo(gx + gw * 0.66, gy);
            g.lineTo(gx, gy + gh * 0.4);
            g.closePath();
            g.fill();
            g.globalAlpha = 1;
            /* a hint of the room behind: ceiling strip and a desk line */
            g.fillStyle = "rgba(30,38,46,.22)";
            g.fillRect(gx, gy, gw, gh * 0.08);
          }
          if (blinds) {
            g.fillStyle = "rgba(238,232,212,.82)";
            g.fillRect(gx, gy + gh * 0.12, gw, gh * 0.56);
            g.fillStyle = "rgba(150,144,126,.5)";
            for (let s2 = 0; s2 < 6; s2++) g.fillRect(gx, gy + gh * 0.12 + s2 * gh * 0.093, gw, 1.6);
          }
          g.fillStyle = shade(wall, 0.55);
          g.fillRect(gx + gw * 0.49, gy, 2.4, gh);
          g.fillStyle = "rgba(255,255,255,.4)";
          g.fillRect(gx - 4, gy + gh + 3, gw + 8, 2.5);
        }
      }
      /* pilasters and the shadow under the parapet */
      g.fillStyle = shade(wall, 0.82);
      for (let b = 0; b <= bays; b++) g.fillRect(b * bw - 2.5, 0, 5, h);
      g.fillStyle = "rgba(20,24,28,.18)";
      g.fillRect(0, 0, w, 6);
      g.fillStyle = "rgba(255,255,255,.12)";
      g.fillRect(0, h - 4, w, 4);
    });
  }

  /* shopfront glazing: dark interior, warm strip lights, poster tape */
  function shopTex(key, seed) {
    return ctex(key, 256, 256, (g, w, h) => {
      const R = rng(seed || 3);
      const lg = g.createLinearGradient(0, 0, 0, h);
      lg.addColorStop(0, "#33424c");
      lg.addColorStop(0.55, "#55676f");
      lg.addColorStop(1, "#78888e");
      g.fillStyle = lg;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 5; i++) {
        g.fillStyle = "rgba(255,238,190,.55)";
        g.fillRect(10 + i * 48, 8, 30, 4);
      }
      for (let i = 0; i < 12; i++) {
        g.globalAlpha = 0.15 + R() * 0.25;
        g.fillStyle = ["#c9b487", "#7fa2b8", "#b06f5e", "#8ca87a"][(R() * 4) | 0];
        g.fillRect(R() * w, h * 0.45 + R() * h * 0.4, 14 + R() * 24, 10 + R() * 18);
      }
      g.globalAlpha = 1;
      g.fillStyle = "rgba(255,255,255,.18)";
      g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.55, 0); g.lineTo(w * 0.75, 0); g.lineTo(0, h * 0.6); g.closePath(); g.fill();
      /* mullions */
      g.fillStyle = "#20272c";
      for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 5, h);
      g.fillRect(0, 0, w, 5);
      g.fillRect(0, h - 6, w, 6);
    });
  }

  /* Korean army digital pixel camouflage: 8 px blocks of olive, sand and
     charcoal over a khaki ground, with a printed-cloth weave underneath */
  function digiCamoTex(key, seed) {
    return ctex(key, 128, 128, (g, w, h) => {
      const R = rng(seed || 5);
      const cols = ["#6e7358", "#565b42", "#82866a", "#3f4331", "#94896b", "#4b4f39"];
      g.fillStyle = cols[0];
      g.fillRect(0, 0, w, h);
      const cell = 4;
      for (let i = 0; i < 260; i++) {
        const n = 1 + ((R() * 3) | 0);
        const m = 1 + ((R() * 3) | 0);
        const x = ((R() * (w / cell)) | 0) * cell;
        const y = ((R() * (h / cell)) | 0) * cell;
        const col = cols[1 + ((R() * (cols.length - 1)) | 0)];
        g.fillStyle = col;
        for (let iy = 0; iy < m; iy++) {
          for (let ix = 0; ix < n; ix++) {
            if (R() < 0.18) continue;
            g.fillRect((x + ix * cell) % w, (y + iy * cell) % h, cell, cell);
          }
        }
      }
      g.globalAlpha = 0.09;
      g.fillStyle = "#000";
      for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 0.6);
      g.globalAlpha = 1;
      for (let i = 0; i < 3; i++) {
        const y = R() * h, th = 5 + R() * 10;
        const lg = g.createLinearGradient(0, y - th, 0, y + th);
        lg.addColorStop(0, "rgba(255,255,255,.05)");
        lg.addColorStop(0.5, "rgba(0,0,0,.09)");
        lg.addColorStop(1, "rgba(255,255,255,.03)");
        g.fillStyle = lg;
        g.fillRect(0, y - th, w, th * 2);
      }
    });
  }

  /* Korean roof tiles: dark ridged eave courses seen from below */
  function roofTileTex(key) {
    return ctex(key, 256, 256, (g, w, h) => {
      g.fillStyle = "#54595f";
      g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 16) {
        const lg = g.createLinearGradient(x, 0, x + 16, 0);
        lg.addColorStop(0, "#3d4249");
        lg.addColorStop(0.45, "#6d747c");
        lg.addColorStop(0.6, "#7c848c");
        lg.addColorStop(1, "#34383e");
        g.fillStyle = lg;
        g.fillRect(x, 0, 15, h);
        g.fillStyle = "rgba(255,255,255,.08)";
        g.fillRect(x + 7, 0, 1.4, h);
      }
      for (let y = 0; y < h; y += 42) {
        g.fillStyle = "rgba(0,0,0,.28)";
        g.fillRect(0, y, w, 3);
      }
    });
  }

  /* painted signboard with Korean lettering (system Korean font, whatever the
     device has: Malgun Gothic, Apple SD Gothic Neo or Noto) */
  function signTex(key, text, bg, fg, sub) {
    return ctex(key, 320, 88, (g, w, h) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(0,0,0,.35)";
      g.lineWidth = 4;
      g.strokeRect(2, 2, w - 4, h - 4);
      g.fillStyle = "rgba(255,255,255,.14)";
      g.fillRect(0, 0, w, h * 0.32);
      g.fillStyle = fg;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = '900 ' + (sub ? 40 : 50) + 'px "Noto Sans CJK KR","Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo","Nanum Gothic",sans-serif';
      g.fillText(text, w / 2, sub ? h * 0.42 : h * 0.52);
      if (sub) {
        g.font = '700 18px "Noto Sans CJK KR","Malgun Gothic",sans-serif';
        g.globalAlpha = 0.8;
        g.fillText(sub, w / 2, h * 0.78);
        g.globalAlpha = 1;
      }
      lightenNoise(g, w, h, 3, 0.03);
    });
  }

  /* green Korean expressway / city direction plate */
  function roadSignTex(key, ko, en, arrow) {
    return ctex(key, 384, 192, (g, w, h) => {
      g.fillStyle = "#1b6b46";
      rr(g, 4, 4, w - 8, h - 8, 14);
      g.fill();
      g.strokeStyle = "#f4f7f2";
      g.lineWidth = 6;
      rr(g, 12, 12, w - 24, h - 24, 10);
      g.stroke();
      g.fillStyle = "#ffffff";
      g.textAlign = "left";
      g.textBaseline = "middle";
      g.font = '900 62px "Noto Sans CJK KR","Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
      g.fillText(ko, 30, h * 0.42);
      g.font = '700 30px "Noto Sans CJK KR","Malgun Gothic",sans-serif';
      g.fillText(en, 32, h * 0.76);
      /* arrow: straight up or a 45° turn */
      g.save();
      g.translate(w - 74, h * 0.5);
      if (arrow === "right") g.rotate(Math.PI / 4);
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.moveTo(0, -46); g.lineTo(26, -8); g.lineTo(10, -8); g.lineTo(10, 44); g.lineTo(-10, 44);
      g.lineTo(-10, -8); g.lineTo(-26, -8); g.closePath();
      g.fill();
      g.restore();
    });
  }

  /* the LED billboard on the corner tower */
  function ledTex(key) {
    return ctex(key, 512, 256, (g, w, h) => {
      const lg = g.createLinearGradient(0, 0, w, h);
      lg.addColorStop(0, "#2a1b4d");
      lg.addColorStop(0.35, "#6b2a7a");
      lg.addColorStop(0.7, "#b6396d");
      lg.addColorStop(1, "#e2643f");
      g.fillStyle = lg;
      g.fillRect(0, 0, w, h);
      /* a crowd silhouette along the bottom */
      g.fillStyle = "rgba(24,12,32,.62)";
      for (let i = 0; i < 26; i++) {
        const x = (i / 26) * w + ((i * 37) % 9);
        const hh = 22 + ((i * 53) % 30);
        g.fillRect(x, h - hh, 20, hh);
        g.beginPath(); g.arc(x + 10, h - hh, 9, 0, 7); g.fill();
      }
      /* the slogan */
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = '900 74px "Noto Sans CJK KR","Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
      g.fillStyle = "rgba(255,255,255,.25)";
      g.fillText("대한민국", w / 2 + 3, h * 0.33 + 3);
      g.fillText("힘내라!", w / 2 + 3, h * 0.62 + 3);
      g.fillStyle = "#ffffff";
      g.fillText("대한민국", w / 2, h * 0.33);
      g.fillText("힘내라!", w / 2, h * 0.62);
      /* LED pixel grid */
      g.fillStyle = "rgba(0,0,0,.22)";
      for (let x = 0; x < w; x += 4) g.fillRect(x, 0, 1, h);
      for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
      g.fillStyle = "rgba(255,255,255,.05)";
      g.fillRect(0, 0, w, 6);
    });
  }

  /* white paint markings laid over the asphalt (transparent outside them) */
  function laneTex(key, kind) {
    return ctex(key, 64, 256, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = "rgba(238,238,232,.92)";
      if (kind === "dash") {
        g.fillRect(w * 0.36, 0, w * 0.28, h * 0.42);
      } else if (kind === "edge") {
        g.fillRect(w * 0.12, 0, w * 0.16, h);
        g.fillRect(w * 0.72, 0, w * 0.16, h);
      } else if (kind === "cross") {
        for (let i = 0; i < 6; i++) g.fillRect(0, i * (h / 6) + 2, w, h / 12);
      } else if (kind === "stop") {
        g.fillRect(0, h * 0.34, w, h * 0.3);
      }
      /* worn paint */
      const R = rng(9);
      g.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 90; i++) {
        g.globalAlpha = 0.15 + R() * 0.5;
        g.fillRect(R() * w, R() * h, 1 + R() * 4, 1 + R() * 6);
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
    });
  }

  /* slight per-pixel luminance noise so large flat areas breathe */
  function lightenNoise(g, w, h, seed, alpha) {
    const R = rng(seed);
    const img = g.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (R() - 0.5) * 255 * (alpha || 0.06);
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    g.putImageData(img, 0, 0);
  }

  /* ---- flags and insignia ------------------------------------------ */

  function starPath(g, cx, cy, r) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr2 = i % 2 ? r * 0.382 : r;
      const x = cx + Math.cos(a) * rr2;
      const y = cy + Math.sin(a) * rr2;
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    }
    g.closePath();
  }

  function clothFlag(g, w, h) {
    // printed flag cloth: faint weave + fold shading, kept subtle
    g.globalAlpha = 0.06;
    g.fillStyle = "#000000";
    for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 0.8);
    g.globalAlpha = 0.05;
    g.fillStyle = "#ffffff";
    for (let x = 0; x < w; x += 2) g.fillRect(x, 0, 0.8, h);
    g.globalAlpha = 1;
    const lg = g.createLinearGradient(0, 0, w, 0);
    lg.addColorStop(0, "rgba(0,0,0,.10)");
    lg.addColorStop(0.28, "rgba(255,255,255,.10)");
    lg.addColorStop(0.62, "rgba(0,0,0,.07)");
    lg.addColorStop(1, "rgba(255,255,255,.06)");
    g.fillStyle = lg;
    g.fillRect(0, 0, w, h);
  }

  /* The flag of the Republic of Korea, drawn to the official construction
     (대한민국국기법 시행령 제6조): a 3:2 white cloth; the taegeuk's diameter is
     half the height, and its two small semicircles split the circle along the
     upper-left → lower-right diagonal (the left one below that line, the right
     one above it) so the red sits over the S and the blue under it; the four
     trigrams 건 곤 감 리 sit on the diagonals, r/2 clear of the taegeuk, their
     bars square to the diagonal, each bar r long and the stack 2r/3 deep. */
  function flagKR() {
    return ctex("flagKR", 384, 256, (g, w, h) => {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const r = h / 4;                        // taegeuk radius (diameter = h/2)
      const th = Math.atan2(h, w);            // upper-left → lower-right diagonal

      /* ---- taegeuk: blue disc, then the red over the S-curve ---- */
      g.save();
      g.translate(cx, cy);
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.fillStyle = "#0047a0";
      g.fill();
      g.rotate(th);
      g.beginPath();
      g.moveTo(-r, 0);
      g.arc(0, 0, r, Math.PI, Math.PI * 2, false);     // the half above the line
      g.arc(r / 2, 0, r / 2, 0, Math.PI, true);        // right half: bulges up
      g.arc(-r / 2, 0, r / 2, 0, Math.PI, false);      // left half: bulges down
      g.closePath();
      g.fillStyle = "#cd2e3a";
      g.fill();
      g.restore();

      /* ---- four trigrams ---- */
      const triH = (2 * r) / 3;               // depth of the stack
      const barLen = r;                       // length of one bar
      const hyo = triH / 4;                   // thickness of a bar
      const gap = triH / 8;                   // between bars, and the split gap
      const triD = r + r / 2 + triH / 2;      // centre, r/2 clear of the disc
      const TRI = { geon: [0, 0, 0], gon: [1, 1, 1], gam: [1, 0, 1], ri: [0, 1, 0] };
      const put = (kind, ang) => {            // ang: outward direction
        g.save();
        g.translate(cx + Math.cos(ang) * triD, cy + Math.sin(ang) * triD);
        g.rotate(ang - Math.PI / 2);          // bars square to the diagonal
        g.fillStyle = "#000000";
        const bars = TRI[kind];
        for (let i = 0; i < 3; i++) {
          const y = -triH / 2 + hyo / 2 + i * (hyo + gap);
          if (bars[i]) {
            g.fillRect(-barLen / 2, y - hyo / 2, barLen / 2 - gap / 2, hyo);
            g.fillRect(gap / 2, y - hyo / 2, barLen / 2 - gap / 2, hyo);
          } else {
            g.fillRect(-barLen / 2, y - hyo / 2, barLen, hyo);
          }
        }
        g.restore();
      };
      put("geon", th + Math.PI);              // upper left  ☰
      put("gon", th);                         // lower right ☷
      put("gam", -th);                        // upper right ☵
      put("ri", Math.PI - th);                // lower left  ☲

      clothFlag(g, w, h);
      g.strokeStyle = "rgba(120,110,90,.3)";
      g.lineWidth = 1;
      g.strokeRect(0.5, 0.5, w - 1, h - 1);
    });
  }

  function flagKP() {
    return ctex("flagKP", 256, 176, (g, w, h) => {
      g.fillStyle = "#0b4ea2";
      g.fillRect(0, 0, w, h);
      const bandTop = h * 0.19, bandH = h * 0.62;
      g.fillStyle = "#ffffff";
      g.fillRect(0, bandTop - h * 0.045, w, h * 0.045);
      g.fillRect(0, bandTop + bandH, w, h * 0.045);
      g.fillStyle = "#c8102e";
      g.fillRect(0, bandTop, w, bandH);
      // emblem
      const cx = w * 0.33, cy = h * 0.5, r = h * 0.19;
      g.fillStyle = "#ffffff";
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#c8102e";
      starPath(g, cx, cy, r * 0.82);
      g.fill();
      // a hint of the emblem shadow
      g.strokeStyle = "rgba(0,0,0,.1)";
      g.lineWidth = 1;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
      clothFlag(g, w, h);
      g.strokeStyle = "rgba(0,0,0,.22)";
      g.lineWidth = 1.5;
      g.strokeRect(0.5, 0.5, w - 1, h - 1);
    });
  }

  /* ---- faces ------------------------------------------------------- */

  /* Painted at 256x256 in a 64-unit coordinate space: the same read as the
     old 64px heads, but with real lids, iris gradients, lip and pore detail
     so a soldier's face holds up when the camera pushes in. */
  function paintFace(g, w, h, o) {
    const S = w / 64;
    g.save();
    g.scale(S, S);
    const W = 64, H = 64;

    // skin base
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, o.top || "#f0c49c");
    gr.addColorStop(0.55, o.mid || "#dda87e");
    gr.addColorStop(1, o.bot || "#b8825a");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);

    const R = rng(o.seed || 7);
    // pores and freckles
    for (let i = 0; i < 260; i++) {
      g.globalAlpha = 0.04 + R() * 0.08;
      g.fillStyle = R() < 0.55 ? "#ffffff" : "#8a5a3a";
      g.fillRect(R() * W, R() * H, 0.3, 0.3);
    }
    g.globalAlpha = 1;

    // temple / side shading and jaw darkening
    const tm = g.createLinearGradient(0, 0, W, 0);
    tm.addColorStop(0, "rgba(96,60,36,.26)");
    tm.addColorStop(0.16, "rgba(96,60,36,0)");
    tm.addColorStop(0.84, "rgba(96,60,36,0)");
    tm.addColorStop(1, "rgba(96,60,36,.26)");
    g.fillStyle = tm;
    g.fillRect(0, 0, W, H);
    const jaw = g.createLinearGradient(0, H - 12, 0, H);
    jaw.addColorStop(0, "rgba(110,64,38,0)");
    jaw.addColorStop(1, "rgba(110,64,38,.34)");
    g.fillStyle = jaw;
    g.fillRect(0, H - 12, W, 12);

    // hair line with individual strands
    g.fillStyle = o.hair || "#241a12";
    g.fillRect(0, 0, W, 6);
    g.beginPath();
    g.moveTo(0, 6);
    for (let x = 0; x <= W; x += 2) g.lineTo(x, 5.4 + Math.sin(x * 0.8) * 0.5 + R() * 0.7);
    g.lineTo(W, 0); g.lineTo(0, 0);
    g.closePath();
    g.fill();
    for (let i = 0; i < 90; i++) {
      g.globalAlpha = 0.18 + R() * 0.4;
      g.strokeStyle = R() < 0.5 ? "#161009" : "#4a3524";
      g.lineWidth = 0.3;
      const x = R() * W;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (R() - 0.5) * 1.2, 5.4 + R() * 1.8); g.stroke();
    }
    g.globalAlpha = 1;
    // sideburns
    g.fillStyle = o.hair || "#241a12";
    g.fillRect(0, 0, 4.6, 16.5);
    g.fillRect(W - 4.6, 0, 4.6, 16.5);
    g.globalAlpha = 0.55;
    for (let i = 0; i < 26; i++) {
      g.fillStyle = "#150f09";
      const yy = 12 + R() * 6;
      g.fillRect(R() < 0.5 ? R() * 2 : W - 2 - R() * 2, yy, 0.5, 1.6);
    }
    g.globalAlpha = 1;

    // brows
    const brow = (cx, dir) => {
      g.fillStyle = o.brow || "#2b1d12";
      const tilt = o.angry ? -1.5 : o.worried ? 1.6 : 0;
      const y0 = o.worried ? 15.2 : 14.8;
      for (let i = 0; i < 3; i++) {
        const gx = cx - 8 + i * 0.4;
        g.save();
        g.beginPath();
        g.moveTo(cx - 8, y0 + 2.2 * i + (dir > 0 ? tilt * 0.35 : -tilt * 0.35));
        g.lineTo(cx + 8, y0 + 1.6 * i - (dir > 0 ? tilt * 0.35 : -tilt * 0.35));
        g.lineWidth = 1.15;
        g.strokeStyle = o.brow || "#2b1d12";
        g.globalAlpha = 0.9 - i * 0.18;
        g.stroke();
        g.restore();
      }
      g.globalAlpha = 1;
      // brow hairs
      for (let i = 0; i < 16; i++) {
        g.globalAlpha = 0.35 + R() * 0.4;
        g.strokeStyle = o.brow || "#2b1d12";
        g.lineWidth = 0.28;
        const x = cx - 7 + R() * 14;
        const y = y0 + R() * 3;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.1, y - 0.9); g.stroke();
      }
      g.globalAlpha = 1;
    };
    brow(19, -1);
    brow(45, 1);

    // eyes
    [18, 42].forEach((cx) => {
      // socket shadow
      const sg = g.createRadialGradient(cx, 28.6, 0.4, cx, 28.8, 9.2);
      sg.addColorStop(0, "rgba(88,56,36,.26)");
      sg.addColorStop(0.62, "rgba(88,56,36,.1)");
      sg.addColorStop(1, "rgba(88,56,36,0)");
      g.fillStyle = sg;
      g.beginPath(); g.ellipse(cx, 28.6, 8.4, 6.2, 0, 0, 7); g.fill();
      // sclera
      g.fillStyle = "#f8f3e8";
      g.beginPath(); g.ellipse(cx, 28.4, 6.3, 4, 0, 0, Math.PI * 2); g.fill();
      // upper lid shadow across the eye
      g.fillStyle = "rgba(56,34,20,.42)";
      g.beginPath(); g.ellipse(cx, 26.6, 6.3, 2.2, 0, 0, Math.PI * 2); g.fill();
      // iris
      const ig = g.createRadialGradient(cx - 0.5, 28.1, 0.3, cx, 28.5, 3.2);
      ig.addColorStop(0, o.irisLight || "#8a5c34");
      ig.addColorStop(0.62, "#4a2c18");
      ig.addColorStop(1, o.iris || "#241408");
      g.fillStyle = ig;
      g.beginPath(); g.arc(cx, 28.5, 3, 0, Math.PI * 2); g.fill();
      // iris fibers
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        g.globalAlpha = 0.16;
        g.strokeStyle = "#c09060";
        g.lineWidth = 0.18;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * 1.0, 28.5 + Math.sin(a) * 1.0);
        g.lineTo(cx + Math.cos(a) * 2.6, 28.5 + Math.sin(a) * 2.4);
        g.stroke();
      }
      g.globalAlpha = 1;
      // pupil
      g.fillStyle = "#0a0705";
      g.beginPath(); g.arc(cx, 28.5, 1.45, 0, Math.PI * 2); g.fill();
      // catches
      g.fillStyle = "#ffffff";
      g.beginPath(); g.arc(cx - 0.95, 27.4, 0.82, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.6;
      g.beginPath(); g.arc(cx + 1.15, 29.5, 0.4, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
      // lid lines
      g.strokeStyle = "rgba(44,26,15,.78)";
      g.lineWidth = 0.62;
      g.beginPath();
      g.moveTo(cx - 6.5, 28.4);
      g.quadraticCurveTo(cx, 24.7, cx + 6.5, 28.2);
      g.stroke();
      g.strokeStyle = "rgba(120,78,54,.55)";
      g.lineWidth = 0.45;
      g.beginPath();
      g.moveTo(cx - 5.6, 30.4);
      g.quadraticCurveTo(cx, 32.1, cx + 5.6, 30.2);
      g.stroke();
      if (o.tired) {
        g.strokeStyle = "rgba(116,74,56,.5)";
        g.lineWidth = 0.4;
        g.beginPath(); g.moveTo(cx - 5.4, 31.7); g.quadraticCurveTo(cx, 32.9, cx + 5.2, 31.5); g.stroke();
        g.globalAlpha = 0.35;
        g.strokeStyle = "#7a5040";
        g.beginPath(); g.moveTo(cx - 6.4, 24.6); g.lineTo(cx + 6.4, 24.2); g.stroke();
        g.globalAlpha = 1;
      }
      // crow's feet
      g.strokeStyle = "rgba(120,78,52,.28)";
      g.lineWidth = 0.3;
      g.beginPath(); g.moveTo(cx + 7.2, 28.2); g.lineTo(cx + 9, 27.4); g.stroke();
      g.beginPath(); g.moveTo(cx + 7.2, 29.4); g.lineTo(cx + 9, 29.6); g.stroke();
    });

    // nose
    g.fillStyle = "rgba(255,238,214,.4)";
    g.beginPath(); g.ellipse(32.2, 34.6, 1.35, 4.6, 0, 0, 7); g.fill();
    g.fillStyle = "rgba(150,94,62,.22)";
    g.beginPath(); g.ellipse(28.4, 36, 1.9, 5, 0, 0, 7); g.fill();
    g.fillStyle = "rgba(255,232,206,.26)";
    g.beginPath(); g.ellipse(35.1, 35.6, 1.2, 4, 0, 0, 7); g.fill();
    g.fillStyle = "rgba(96,54,34,.62)";
    g.beginPath(); g.ellipse(29.2, 42.5, 0.95, 0.72, -0.2, 0, 7); g.fill();
    g.beginPath(); g.ellipse(34.8, 42.5, 0.95, 0.72, 0.2, 0, 7); g.fill();
    g.fillStyle = "rgba(126,74,46,.4)";
    g.beginPath(); g.ellipse(32, 43.6, 3.7, 1.2, 0, 0, 7); g.fill();
    g.fillStyle = "rgba(255,236,212,.22)";
    g.beginPath(); g.ellipse(32, 42.1, 3.2, 0.75, 0, 0, 7); g.fill();

    // mouth
    const mCol = o.mouth || "#6d3a2a";
    if (o.worried) {
      // open, gasping mouth
      g.fillStyle = "#3a1a12";
      g.beginPath(); g.ellipse(32, 51.4, 5.6, 3.6, 0, 0, 7); g.fill();
      g.fillStyle = "#e8dcc8";
      g.fillRect(27.4, 48.9, 9.2, 1.1);
      g.fillStyle = "#8d3a2c";
      g.beginPath(); g.ellipse(32, 53.8, 3.4, 1.5, 0, 0, 7); g.fill();
      g.strokeStyle = "rgba(50,24,16,.8)";
      g.lineWidth = 0.5;
      g.beginPath(); g.ellipse(32, 51.4, 5.6, 3.6, 0, 0, 7); g.stroke();
    } else if (o.smile) {
      g.strokeStyle = mCol;
      g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(25.4, 50.4);
      g.quadraticCurveTo(32, 54.6, 38.6, 50.2);
      g.stroke();
      g.fillStyle = "rgba(255,230,210,.3)";
      g.fillRect(28, 51.8, 8, 0.8);
    } else if (o.angry) {
      g.strokeStyle = mCol;
      g.lineWidth = 1.15;
      g.beginPath();
      g.moveTo(25.2, 51.8);
      g.quadraticCurveTo(32, 49.6, 38.8, 51.6);
      g.stroke();
      // teeth gritted line
      g.strokeStyle = "rgba(240,230,214,.28)";
      g.lineWidth = 0.5;
      g.beginPath(); g.moveTo(26, 51.2); g.lineTo(38, 51.1); g.stroke();
    } else {
      g.strokeStyle = mCol;
      g.lineWidth = 0.85;
      g.beginPath();
      g.moveTo(25.6, 50.6);
      g.quadraticCurveTo(32, 51.6, 38.4, 50.5);
      g.stroke();
      g.fillStyle = "rgba(255,226,204,.26)";
      g.beginPath(); g.ellipse(32, 52.1, 4.6, 0.9, 0, 0, 7); g.fill();
    }
    // mouth corners
    g.fillStyle = "rgba(90,46,32,.4)";
    g.beginPath(); g.arc(25.2, 50.2, 0.5, 0, 7); g.fill();
    g.beginPath(); g.arc(38.8, 50.1, 0.5, 0, 7); g.fill();

    if (o.moustache) {
      g.fillStyle = o.hair || "#241a12";
      g.beginPath();
      g.moveTo(24, 47.4);
      g.quadraticCurveTo(32, 45.6, 40, 47.4);
      g.quadraticCurveTo(32, 49.2, 24, 47.4);
      g.closePath();
      g.fill();
    }
    if (o.beard) {
      // beard shaped along the jaw, denser at the chin
      for (let i = 0; i < 900; i++) {
        const a = R() * Math.PI * 2, rad = R() * 15;
        const x = 32 + Math.cos(a) * rad * 1.15;
        const y = 50 + Math.sin(a) * rad * 0.62;
        if (y < 45 || y > 63 || x < 12 || x > 52) continue;
        g.globalAlpha = 0.3 + R() * 0.45;
        g.fillStyle = R() < 0.75 ? "rgba(32,23,16,1)" : "rgba(96,72,48,1)";
        g.fillRect(x, y, 0.5, 0.5);
      }
      g.globalAlpha = 1;
    } else if (o.stubble) {
      for (let i = 0; i < 520; i++) {
        const a = R() * Math.PI * 2, rad = R() * 16;
        const x = 32 + Math.cos(a) * rad * 1.1;
        const y = 52 + Math.sin(a) * rad * 0.55;
        if (y < 45 || y > 63 || x < 12 || x > 52) continue;
        g.globalAlpha = 0.16 + R() * 0.3;
        g.fillStyle = "rgba(36,27,20,1)";
        g.fillRect(x, y, 0.42, 0.42);
      }
      g.globalAlpha = 1;
    }
    if (o.scar) {
      g.strokeStyle = "rgba(158,74,62,.6)";
      g.lineWidth = 0.75;
      g.beginPath(); g.moveTo(49.4, 19.6); g.lineTo(50.2, 28.6); g.stroke();
      g.strokeStyle = "rgba(255,235,225,.4)";
      g.lineWidth = 0.35;
      g.beginPath(); g.moveTo(48.8, 19.8); g.lineTo(49.6, 28.4); g.stroke();
      for (let i = 0; i < 4; i++) {
        g.strokeStyle = "rgba(150,66,56,.45)";
        g.lineWidth = 0.3;
        const y = 21 + i * 2;
        g.beginPath(); g.moveTo(49.6, y + 0.5); g.lineTo(51.4, y); g.stroke();
      }
    }
    if (o.headband) {
      g.fillStyle = o.headband;
      g.fillRect(0, 8, W, 5.2);
      g.fillStyle = "rgba(255,255,255,.24)";
      g.fillRect(0, 8, W, 0.9);
      g.fillStyle = "rgba(0,0,0,.22)";
      g.fillRect(0, 12.4, W, 0.9);
    }
    // cheeks
    g.fillStyle = "rgba(214,112,96,.16)";
    g.beginPath();
    g.ellipse(11, 43, 6.6, 4, 0, 0, 7);
    g.ellipse(53, 43, 6.6, 4, 0, 0, 7);
    g.fill();
    // chin highlight
    g.fillStyle = "rgba(255,238,216,.14)";
    g.beginPath(); g.ellipse(32, 58.4, 6.4, 2.6, 0, 0, 7); g.fill();
    // heavier jaw shade for the boss and the tough
    if (o.brow) {
      g.fillStyle = "rgba(120,74,48,.12)";
      g.fillRect(0, H - 4, W, 4);
    }
    g.restore();
  }

  function faceMat(key, o) {
    if (!SOL.faces) SOL.faces = {};
    if (SOL.faces[key]) return SOL.faces[key];
    const t = ctex("face" + key, 256, 256, (g, w, h) => paintFace(g, w, h, o));
    SOL.faces[key] = new T.MeshLambertMaterial({ map: t });
    return SOL.faces[key];
  }

  function headFor(kind) {
    const P = {
      ally: { seed: 11, smile: 1, top: "#f2c69e", mid: "#dea87c", bot: "#b8825a" },
      grunt: { seed: 21, stubble: 1, top: "#eec098", mid: "#d9a276", bot: "#b27c55" },
      thrower: { seed: 33, headband: "#b83a2e", angry: 1, stubble: 1 },
      tough: { seed: 45, angry: 1, beard: 1, scar: 1, top: "#e2b48c", mid: "#c99268", bot: "#a06a44" },
      boss: { seed: 57, angry: 1, moustache: 1, scar: 1, tired: 1, top: "#d9a87f", mid: "#bf8a62", bot: "#96633f" },
      hostage: { seed: 63, worried: 1, top: "#f4cba6", mid: "#e2ae86", bot: "#bf8a63" }
    };
    return faceMat(kind, P[kind] || P.grunt);
  }

  function makeSol() {
    if (SOL.ready) return;
    SOL.ready = 1;
    const L = (tex, opt) => new T.MeshLambertMaterial(Object.assign({ map: tex }, opt || {}));
    SOL.stone = L(blockTex("stone", "#bdb6a6", "#5e584c", ["#d6cfbe", "#a9a190", "#948c7c"], 5));
    SOL.stoneDark = L(blockTex("stoneD", "#9a958a", "#46423a", ["#b3aea2", "#807a70", "#6c665c"], 9));
    SOL.concrete = L(concreteTex("conc", "#b9b7ad", 13));
    SOL.sand = L(burlapTex("sand", "#a08a5e", 21));
    SOL.wood = L(woodTex("wood", "#8a6034", "#4e3413", "#c79a58", 4));
    SOL.woodDark = L(woodTex("woodD", "#6f4b23", "#38230d", "#a3763c", 8));
    SOL.camo = L(camoTex("camo", ["#5c6b3c", "#47542e", "#6f7d4a", "#3b4527", "#7d7048"], 31));
    SOL.camoDark = L(camoTex("camoD", ["#424d2c", "#333d22", "#4f5a36", "#2a321c", "#5c5334"], 37));
    SOL.camoBoss = L(camoTex("camoBoss", ["#4a4a30", "#33331f", "#5c5c3c", "#262616"], 41));
    const weave = weaveTex("weave", "#d2d2d2", 3);
    const weaveFine = weaveTex("weaveF", "#cfcfcf", 7, 1.5);
    SOL.steel = L(metalTex("steel", 12), { color: 0x7c848e });
    SOL.helm = L(camoTex("helm", ["#4d5a33", "#3a4526", "#5c6b40", "#2f3820"], 43, 128));
    SOL.belt = L(leatherTex("belt", "#3a3226", 77), { color: 0x8d8578 });
    SOL.boot = L(leatherTex("boot", "#2b2319", 4));
    SOL.skin = L(null, { color: 0xe8b48c });
    SOL.black = L(polymerTex("poly", 6), { color: 0x1e1e21 });
    SOL.gunmetal = L(metalTex("gunmetal", 18, { base: "#dfe3e7" }), { color: 0x3d4246 });
    SOL.red = L(null, { color: 0xc0281f });
    SOL.gold = L(null, { color: 0xd8a83c });
    SOL.white = L(weaveFine, { color: 0xf3efe2 });
    SOL.civil = L(weave, { color: 0xece4d0 });
    SOL.civilPant = L(weaveFine, { color: 0x3d4a63 });
    SOL.hair = L(null, { color: 0x241a12 });
    SOL.olive = L(weave, { color: 0x5c6438 });
    SOL.oliveDark = L(weave, { color: 0x434a26 });
    SOL.tire = L(null, { color: 0x22242a });
    SOL.barrel = L(barrelTex("barrel", 77));
    SOL.star = new T.MeshBasicMaterial({
      map: ctex("star", 128, 128, (g, w, h) => {
        g.clearRect(0, 0, w, h);
        g.fillStyle = "#f7f5ec";
        starPath(g, 64, 64, 58);
        g.fill();
        g.strokeStyle = "rgba(120,110,80,.35)";
        g.lineWidth = 2;
        g.stroke();
      }),
      transparent: true
    });
    SOL.flagKR = L(flagKR(), { side: T.FrontSide });
    SOL.flagKP = L(flagKP(), { side: T.FrontSide });
    SOL.street = L(cobbleTex("street", "#9b9587", 91));
    SOL.grass = L(null, { color: 0x6d8a3f });
    SOL.tan = L(camoTex("tan", ["#ddcda8", "#cdbb94", "#e8dcc0", "#b9a681", "#f0e6cc"], 71));
    SOL.tanDark = L(camoTex("tanD", ["#8e8062", "#7a6d52", "#9d8f6e", "#6b5f47"], 73));
    SOL.vest = L(weave, { color: 0x2b3036 });
    SOL.enemyCloth = L(weave, { color: 0x5c6b39 });
    SOL.enemyDark = L(weave, { color: 0x49562c });
    SOL.enemyBelt = L(weaveFine, { color: 0x6d4a28 });
    SOL.enemyCap = L(weave, { color: 0x53612f });
    SOL.helmAlly = L(null, { color: 0x4b5145 });
    SOL.plate = L(weave, { color: 0x333829 });
    SOL.strap = L(weaveFine, { color: 0x2b2c27 });
    SOL.rubber = L(null, { color: 0x1b1c1a });
    SOL.lens = new T.MeshLambertMaterial({ color: 0x24343c, emissive: 0x0a1216 });
    SOL.bandW = L(weaveFine, { color: 0xe8e6dc });
    SOL.bandB = L(weaveFine, { color: 0x22407c });
    /* ---- Seoul set materials ---- */
    SOL.asphalt = L(asphaltTex("asphalt", 13));
    SOL.pave = L(paveTex("pave", 21));
    SOL.facA = L(facadeTex("facA", { wall: "#cbd0d5", glassTop: "#bfe0f5", glassBot: "#5b7d97" }, 5));
    SOL.facB = L(facadeTex("facB", { wall: "#d7d1c3", glassTop: "#d4e8f0", glassBot: "#6c8a94" }, 7));
    SOL.facC = L(facadeTex("facC", { wall: "#8f979e", glassTop: "#a6cbe2", glassBot: "#3f5a6b" }, 9));
    SOL.shopGlass = L(shopTex("shopGlass", 3));
    SOL.shopFascia = L(null, { color: 0x24282d });
    SOL.awnA = L(weave, { color: 0x2f6f4e });
    SOL.awnB = L(weave, { color: 0xb8342c });
    SOL.doorDark = L(null, { color: 0x15181b });
    SOL.curb = L(null, { color: 0x9a9a94 });
    SOL.roofDeck = L(concreteTex("roofDeck", "#a9a9a2", 27));
    SOL.concLight = L(concreteTex("concLight", "#c6c6be", 29));
    SOL.archLit = L(concreteTex("archLit", "#d9cfba", 31), { emissive: 0x4a4030 });
    SOL.tankBlue = L(null, { color: 0x6f8fa4 });
    SOL.acUnit = L(null, { color: 0xc9cbc6 });
    SOL.metalDark = L(null, { color: 0x3a3e44 });
    SOL.poleGray = L(null, { color: 0x8e949a });
    SOL.ledFrame = L(null, { color: 0x1b1d21 });
    SOL.ledScreen = new T.MeshBasicMaterial({ map: ledTex("led") });
    SOL.gateStone = L(blockTex("gateStone", "#cdc7b8", "#7a7466", ["#e2dccd", "#b8b1a2", "#a29b8d"], 61, { size: 512 }));
    SOL.woodRed = L(woodTex("woodRed", "#a45332", "#6d2a17", "#cf8557", 12));
    SOL.dancheongG = L(null, { color: 0x2f6b4f });
    SOL.dancheongR = L(null, { color: 0xb23a2c });
    SOL.roofTile = L(roofTileTex("roofTile"), { emissive: 0x1b1f24 });
    SOL.roofRidge = L(null, { color: 0x8a9099 });
    SOL.rafter = L(woodTex("rafter", "#6b4b2c", "#432c15", "#8f6b45", 23));
    SOL.gateSign = new T.MeshBasicMaterial({
      map: ctex("gateSign", 320, 104, (g, w, h) => {
        g.fillStyle = "#1b2230";
        g.fillRect(0, 0, w, h);
        g.strokeStyle = "#c8a94a";
        g.lineWidth = 7;
        g.strokeRect(8, 8, w - 16, h - 16);
        g.fillStyle = "#f2e6c2";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = '900 62px "Noto Sans CJK KR","Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
        g.fillText("서울", w / 2, h / 2 + 2);
      })
    });
    SOL.concPole = L(concreteTex("concPole", "#a9a9a3", 33));
    SOL.coneOrange = L(null, { color: 0xe2622a });
    SOL.paintWhite = L(null, { color: 0xeeece2 });
    SOL.paintYellow = L(null, { color: 0xd3ad30 });
    SOL.hydrant = L(null, { color: 0xc03a2c });
    SOL.scaffPlank = L(woodTex("plank", "#9a7440", "#6a4a22", "#c49a60", 19));
    SOL.scaffPole = L(null, { color: 0x7d838a });
    SOL.scaffNet = new T.MeshLambertMaterial({ color: 0x2f7a45, transparent: true, opacity: 0.55, side: T.DoubleSide });
    SOL.planter = L(null, { color: 0x8d8b84 });
    SOL.soil = L(null, { color: 0x3a2f22 });
    SOL.hedge = L(null, { color: 0x4c7a3a });
    SOL.policeWhite = L(null, { color: 0xf1f4f6 });
    SOL.policeBlue = L(null, { color: 0x20438f });
    SOL.policeText = new T.MeshBasicMaterial({ map: signTex("policeText", "POLICE", "#ffffff", "#1b3f8f") });
    SOL.carGlass = new T.MeshLambertMaterial({ color: 0x2a3b47, emissive: 0x0a1216 });
    SOL.hubCap = L(null, { color: 0xb9bdc2 });
    SOL.lampRed = new T.MeshBasicMaterial({ color: 0xd52a20 });
    SOL.lampBlue = new T.MeshBasicMaterial({ color: 0x2a6df0 });
    SOL.lampWarm = new T.MeshBasicMaterial({ color: 0xffe6a8 });
    SOL.drumOrange = L(null, { color: 0xe4692a });
    SOL.drumDark = L(null, { color: 0x9c3f16 });
    SOL.busGreen = L(null, { color: 0x2f8f5b });
    SOL.busDark = L(null, { color: 0x1c5f3c });
    SOL.busRoute = new T.MeshBasicMaterial({ map: signTex("busRoute", "143", "#1c5f3c", "#ffffff") });
    SOL.busBoard = new T.MeshBasicMaterial({ map: signTex("busBoard", "143  서울역", "#101314", "#e8e2c8") });
    SOL.armyOlive = L(weave, { color: 0x4d5a34 });
    SOL.armyDark = L(weave, { color: 0x3a4426 });
    SOL.truckWhite = L(null, { color: 0xe9ecee });
    SOL.truckBlue = L(null, { color: 0x3f6f9e });
    SOL.barrier = L(concreteTex("barrierConc", "#cfcdc4", 41));
    SOL.concBlock = L(concreteTex("concBlock", "#bab8ae", 43));
    SOL.siteWall = L(null, { color: 0xc2c6c4 });
    SOL.siteWallCap = L(null, { color: 0x7d838a });
    SOL.workSign = new T.MeshBasicMaterial({ map: signTex("workSign", "공사중", "#f2c230", "#1a1a1a") });
    SOL.strapY = L(null, { color: 0xd8c23a });
    SOL.barricadePanel = new T.MeshLambertMaterial({
      map: ctex("barPanel", 192, 48, (g, w, h) => {
        g.fillStyle = "#e8e6df";
        g.fillRect(0, 0, w, h);
        g.fillStyle = "#d33a2c";
        for (let x = -h; x < w; x += 36) {
          g.beginPath();
          g.moveTo(x, h); g.lineTo(x + h, 0); g.lineTo(x + h + 18, 0); g.lineTo(x + 18, h);
          g.closePath(); g.fill();
        }
        g.fillStyle = "rgba(0,0,0,.18)";
        g.fillRect(0, h - 4, w, 4);
      })
    });
    SOL.towerWhite = L(null, { color: 0xe8ecef });
    SOL.towerGlass = L(null, { color: 0x5d7f97 });
    SOL.mountain = L(null, { color: 0x4f6e4a });
    SOL.rubbleChunk = L(concreteTex("rubble", "#b8b6ad", 47));
    SOL.digi = L(digiCamoTex("digi", 5));
    SOL.digiDark = L(digiCamoTex("digiD", 9));
    SOL.helmDigi = L(digiCamoTex("helmDigi", 13));
    SOL.digiVest = L(weave, { color: 0x3f4a35 });
    SOL.flagPatch = L(flagKR(), { side: T.FrontSide });
    SOL.glint = new T.MeshBasicMaterial({
      map: ctex("glint", 64, 64, (g, w, h) => {
        g.clearRect(0, 0, w, h);
        const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        rg.addColorStop(0, "rgba(255,255,255,1)");
        rg.addColorStop(0.25, "rgba(255,120,90,.95)");
        rg.addColorStop(0.6, "rgba(255,40,20,.35)");
        rg.addColorStop(1, "rgba(255,20,0,0)");
        g.fillStyle = rg;
        g.fillRect(0, 0, w, h);
      }),
      transparent: true,
      blending: T.AdditiveBlending,
      depthWrite: false
    });
    Object.keys(SOL).forEach((k) => {
      const m = SOL[k];
      if (m && m.isMaterial && m.color && m.color.convertSRGBToLinear) m.color.convertSRGBToLinear();
    });
  }

  function bmesh(w, h, d, mat) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  function part(parent, w, h, d, x, y, z, mat) {
    const m = bmesh(w, h, d, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }

  /* the rifle: receiver, rail, handguard, barrel and brake, gas tube, pistol
     grip, magazine, buffer tube, stock and optic. Returns a group whose
     userData.muzzle marks the barrel tip for muzzle flashes and tracers. */
  function makeRifle() {
    makeSol();
    const g = new T.Group();
    const d = (w, h, dd, x, y, z, m) => {
      const b = new T.Mesh(new T.BoxGeometry(w, h, dd), m);
      b.position.set(x, y, z);
      g.add(b);
      return b;
    };
    d(0.085, 0.10, 0.50, 0, 0, 0, SOL.gunmetal);                 // receiver
    d(0.075, 0.055, 0.10, 0, 0.035, 0.20, SOL.gunmetal);         // rear rail
    d(0.075, 0.08, 0.26, 0, 0.005, -0.33, SOL.black);            // handguard
    d(0.10, 0.045, 0.10, 0, 0.025, -0.24, SOL.gunmetal);         // front rail
    d(0.032, 0.032, 0.26, 0, 0.02, -0.55, SOL.gunmetal);         // barrel
    d(0.052, 0.052, 0.075, 0, 0.02, -0.69, SOL.black);           // muzzle brake
    d(0.028, 0.028, 0.16, 0, 0.058, -0.30, SOL.black);           // gas tube
    d(0.065, 0.075, 0.09, 0, -0.135, 0.075, SOL.black);          // pistol grip
    d(0.072, 0.20, 0.085, 0, -0.145, -0.075, SOL.black);         // magazine
    d(0.07, 0.07, 0.09, 0, -0.245, -0.10, SOL.black);
    d(0.06, 0.06, 0.14, 0, -0.005, 0.28, SOL.gunmetal);          // buffer tube
    d(0.075, 0.125, 0.26, 0, -0.03, 0.44, SOL.black);            // stock
    d(0.08, 0.16, 0.03, 0, -0.03, 0.565, SOL.rubber);            // butt pad
    d(0.055, 0.035, 0.14, 0, 0.075, 0.05, SOL.black);            // optic base
    d(0.07, 0.07, 0.11, 0, 0.115, 0.05, SOL.black);              // optic body
    d(0.05, 0.05, 0.02, 0, 0.115, 0.11, SOL.lens);               // optic lens
    d(0.03, 0.06, 0.03, 0, 0.075, -0.44, SOL.black);             // front sight
    const muzzle = new T.Object3D();
    muzzle.position.set(0, 0.02, -0.75);
    g.add(muzzle);
    g.userData.muzzle = muzzle;
    return g;
  }

  /* one block-built soldier. The legs hang from hip joints and the arms from
     shoulder joints so he can walk and shoulder his rifle; on top of the block
     body sit a plate carrier with magazine pouches, a helmet with goggles, chin
     strap and an NVG mount, shoulder/knee/elbow pads, gloves and boots, and a
     rifle with a real receiver, handguard, stock, magazine and optic. Every
     piece is still a box (art rule); the small detail boxes skip the shadow
     pass so the cost stays close to the old model. */
  function makeSoldier(role) {
    makeSol();
    const g = new T.Group();
    const body = new T.Group();
    g.add(body);
    const civ = role === "hostage";
    const tough = role === "tough";
    const boss = role === "boss";
    const uniform = civ ? SOL.civil : boss ? SOL.camoBoss : tough ? SOL.camoDark : SOL.enemyCloth;
    const pants = civ ? SOL.civilPant : SOL.enemyDark;
    const padMat = civ ? SOL.belt : tough ? SOL.steel : SOL.plate;
    /* detail pieces: same box, but no shadow pass and no receiving */
    const D = (parent, w, h, d, x, y, z, mat) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      parent.add(m);
      return m;
    };

    /* ---- legs: a hip group, with the shin and boot hanging under it ---- */
    const HIP = 0.68;
    const mkLeg = (sx) => {
      const hip = new T.Group();
      hip.position.set(sx * 0.135, HIP, 0);
      part(hip, 0.215, 0.34, 0.24, 0, -0.17, 0, pants);
      if (!civ) D(hip, 0.185, 0.13, 0.08, 0, -0.235, 0.125, SOL.rubber);      // knee pad
      if (!civ) D(hip, 0.085, 0.14, 0.055, sx * 0.115, -0.15, 0.085, SOL.oliveDark); // thigh pocket
      const shin = new T.Group();
      shin.position.set(0, -0.34, 0);
      hip.add(shin);
      part(shin, 0.19, 0.23, 0.21, 0, -0.115, 0, pants);
      part(shin, 0.22, 0.12, 0.30, 0, -0.28, 0.035, civ ? SOL.black : SOL.boot);
      D(shin, 0.23, 0.035, 0.32, 0, -0.335, 0.035, SOL.black);               // sole
      D(shin, 0.21, 0.05, 0.06, 0, -0.245, 0.19, SOL.black);                 // toe cap
      body.add(hip);
      return { hip, shin };
    };
    const legL = mkLeg(-1), legR = mkLeg(1);

    /* ---- pelvis, belt and torso ---- */
    part(body, 0.42, 0.15, 0.30, 0, 0.745, 0, pants);
    part(body, 0.455, 0.075, 0.325, 0, 0.80, 0, civ ? SOL.belt : SOL.enemyBelt);
    D(body, 0.085, 0.06, 0.03, 0, 0.80, 0.17, SOL.steel);                    // buckle
    part(body, 0.54, 0.43, 0.34, 0, 1.02, 0, uniform);
    D(body, 0.30, 0.07, 0.03, 0, 1.19, 0.175, SOL.strap);                    // collar seam
    if (!civ) {
      D(body, 0.40, 0.29, 0.07, 0, 1.05, 0.185, padMat);                     // front plate
      D(body, 0.40, 0.28, 0.06, 0, 1.05, -0.185, padMat);                    // back plate
      D(body, 0.05, 0.25, 0.28, -0.265, 1.06, 0, padMat);                    // cummerbund
      D(body, 0.05, 0.25, 0.28, 0.265, 1.06, 0, padMat);
      D(body, 0.095, 0.085, 0.30, -0.15, 1.235, 0.02, SOL.strap);            // shoulder straps
      D(body, 0.095, 0.085, 0.30, 0.15, 1.235, 0.02, SOL.strap);
      [-0.12, 0, 0.12].forEach((px) => D(body, 0.095, 0.125, 0.06, px, 0.965, 0.20, SOL.enemyDark)); // mag pouches
      D(body, 0.09, 0.15, 0.05, 0.235, 1.15, 0.175, SOL.oliveDark);          // radio
      D(body, 0.035, 0.10, 0.035, 0.30, 1.19, 0.14, SOL.black);              // antenna
      D(body, 0.13, 0.16, 0.09, -0.265, 0.90, -0.055, SOL.oliveDark);        // canteen
      D(body, 0.07, 0.10, 0.07, 0.215, 0.90, 0.135, SOL.oliveDark);          // grenade
      D(body, 0.075, 0.05, 0.02, 0.125, 1.16, 0.222, SOL.red);               // rank patch
      D(body, 0.16, 0.10, 0.25, -0.305, 1.185, 0, padMat);                   // shoulder pads
      D(body, 0.16, 0.10, 0.25, 0.305, 1.185, 0, padMat);
    } else {
      D(body, 0.44, 0.10, 0.30, 0, 0.815, 0.01, SOL.belt);                   // shirt hem
    }

    /* ---- head on its own joint so it can tilt while aiming ---- */
    const headG = new T.Group();
    headG.position.set(0, 1.26, 0);
    body.add(headG);
    D(body, 0.15, 0.09, 0.15, 0, 1.245, 0, SOL.skin);                        // neck
    const faceKey = civ ? "hostage" : boss ? "boss" : tough ? "tough" : role === "throw" ? "thrower" : "grunt";
    /* +x -x +y -y +z(face) -z: hair on top and on the back of the head, so he
       is not a bald block when he turns away */
    const head = new T.Mesh(new T.BoxGeometry(0.42, 0.42, 0.42), [SOL.skin, SOL.skin, SOL.hair, SOL.skin, headFor(faceKey), SOL.hair]);
    head.position.set(0, 0.21, 0);
    head.castShadow = true;
    head.receiveShadow = true;
    headG.add(head);
    D(headG, 0.05, 0.11, 0.10, -0.225, 0.20, 0.01, SOL.skin);                // ears
    D(headG, 0.05, 0.11, 0.10, 0.225, 0.20, 0.01, SOL.skin);
    if (civ) {
      D(headG, 0.45, 0.12, 0.45, 0, 0.44, 0, SOL.hair);                      // hair
      D(headG, 0.46, 0.06, 0.20, 0, 0.40, 0.21, SOL.hair);
    } else if (boss) {
      D(headG, 0.50, 0.11, 0.36, 0, 0.44, -0.02, SOL.black);                 // peaked cap
      D(headG, 0.52, 0.06, 0.52, 0, 0.39, 0.015, SOL.black);
      D(headG, 0.56, 0.05, 0.22, 0, 0.385, 0.26, SOL.black);                 // visor
      D(headG, 0.14, 0.11, 0.03, 0, 0.46, 0.29, SOL.red);                    // star
      D(headG, 0.20, 0.06, 0.04, -0.26, 0.36, 0, SOL.gold);                  // cap badges
      D(headG, 0.20, 0.06, 0.04, 0.26, 0.36, 0, SOL.gold);
    } else {
      const helmMat = tough ? SOL.steel : SOL.helm;
      D(headG, 0.51, 0.055, 0.545, 0, 0.365, 0, helmMat);                    // helmet rim
      D(headG, 0.47, 0.135, 0.50, 0, 0.425, -0.005, helmMat);                // crown
      D(headG, 0.34, 0.06, 0.36, 0, 0.475, -0.01, helmMat);                  // top ridge
      D(headG, 0.52, 0.045, 0.13, 0, 0.372, 0.255, helmMat);                 // front brim
      D(headG, 0.13, 0.09, 0.05, 0, 0.47, 0.245, SOL.black);                 // NVG mount
      D(headG, 0.075, 0.035, 0.04, 0, 0.505, 0.265, SOL.rubber);
      D(headG, 0.135, 0.05, 0.03, -0.115, 0.475, 0.235, SOL.oliveDark);      // helmet band
      D(headG, 0.135, 0.05, 0.03, 0.115, 0.475, 0.235, SOL.oliveDark);
      D(headG, 0.09, 0.19, 0.03, -0.185, 0.10, 0.145, SOL.strap);            // chin strap
      D(headG, 0.09, 0.19, 0.03, 0.185, 0.10, 0.145, SOL.strap);
      if (tough) D(headG, 0.16, 0.16, 0.035, 0, 0.475, 0.28, SOL.gold);      // unit plate
      else D(headG, 0.105, 0.095, 0.03, 0, 0.455, 0.265, SOL.red);           // cap star
      D(headG, 0.505, 0.06, 0.515, 0, 0.352, 0, SOL.strap);                  // goggle strap
      D(headG, 0.135, 0.085, 0.045, -0.10, 0.345, 0.245, SOL.lens);          // goggles, up on the rim
      D(headG, 0.135, 0.085, 0.045, 0.10, 0.345, 0.245, SOL.lens);
      D(headG, 0.05, 0.045, 0.04, 0, 0.345, 0.25, SOL.rubber);
    }

    /* ---- arms on shoulder joints ---- */
    const mkArm = (sx) => {
      const arm = new T.Group();
      arm.position.set(sx * 0.335, 1.155, 0);
      part(arm, 0.165, 0.28, 0.19, 0, -0.145, 0, uniform);
      D(arm, 0.115, 0.065, 0.115, 0, -0.272, 0.055, SOL.rubber);             // elbow pad
      part(arm, 0.15, 0.24, 0.17, 0, -0.42, 0.02, civ ? SOL.skin : uniform);
      D(arm, 0.16, 0.11, 0.18, 0, -0.565, 0.03, civ ? SOL.skin : SOL.black); // glove
      body.add(arm);
      return arm;
    };
    const armL = mkArm(-1);
    const armR = mkArm(1);
    if (civ) {
      armL.rotation.z = 2.5;
      armR.rotation.z = -2.5;
    }

    /* ---- rifle, barrel forward: the model faces +z, and the rifle is built
       with its barrel down -z, so the group is turned a half turn ---- */
    if (!civ) {
      const rifle = makeRifle();
      rifle.position.set(-0.02, 0.99, 0.30);
      rifle.rotation.set(0.16, Math.PI, -0.42);
      body.add(rifle);
      g.userData.rifle = rifle;
      g.userData.muzzle = rifle.userData.muzzle;
      // port arms: support hand under the handguard, trigger hand on the grip
      armL.rotation.set(-1.05, 0, 0.42);
      armR.rotation.set(-0.72, 0, -0.20);
    }

    if (role === "throw") {
      part(body, 0.30, 0.34, 0.16, 0, 0.96, -0.25, SOL.camoDark);            // rucksack
      D(body, 0.28, 0.12, 0.03, 0, 1.02, -0.335, SOL.strap);
      const nade = new T.Group();
      D(nade, 0.10, 0.13, 0.10, 0, 0, 0, SOL.oliveDark);
      D(nade, 0.05, 0.05, 0.10, 0, 0.075, 0, SOL.steel);
      nade.position.set(0.30, 0.60, 0.14);
      body.add(nade);
      g.userData.nade = nade;
      armR.rotation.x = -1.5;
      armR.rotation.z = -0.25;
    }
    if (boss) {
      const cape = new T.Mesh(new T.PlaneGeometry(0.72, 0.95), new T.MeshLambertMaterial({ color: 0x8e1f1a, side: T.DoubleSide }));
      cape.position.set(0, 0.95, -0.27);
      cape.rotation.x = 0.08;
      body.add(cape);
      D(body, 0.60, 0.09, 0.36, 0, 1.22, 0, SOL.red);
      D(body, 0.17, 0.055, 0.38, -0.25, 1.24, 0, SOL.gold);
      D(body, 0.17, 0.055, 0.38, 0.25, 1.24, 0, SOL.gold);
    }
    if (boss || tough) g.scale.setScalar(1.5);
    else g.scale.setScalar(1.28);
    g.userData.body = body;
    g.userData.headG = headG;
    g.userData.armL = armL;
    g.userData.armR = armR;
    g.userData.legL = legL.hip;
    g.userData.legR = legR.hip;
    g.userData.shinL = legL.shin;
    g.userData.shinR = legR.shin;
    g.userData.role = role;
    return g;
  }
  function makePickup(kind) {
    makeSol();
    const g = new T.Group();
    if (kind === "life") {
      part(g, 0.58, 0.42, 0.42, 0, 0, 0, SOL.white);
      part(g, 0.1, 0.3, 0.02, 0, 0, 0.22, SOL.red);
      part(g, 0.3, 0.1, 0.02, 0, 0, 0.22, SOL.red);
      part(g, 0.12, 0.05, 0.1, 0, 0.235, 0, SOL.belt);
      part(g, 0.6, 0.04, 0.44, 0, -0.22, 0, SOL.stoneDark);
    } else if (kind === "ammo") {
      part(g, 0.56, 0.38, 0.36, 0, 0, 0, SOL.oliveDark);
      part(g, 0.58, 0.07, 0.38, 0, 0.19, 0, SOL.olive);
      part(g, 0.22, 0.09, 0.02, 0, 0.05, 0.19, SOL.gold);
      part(g, 0.06, 0.16, 0.02, -0.2, 0.02, 0.19, SOL.olive);
      part(g, 0.06, 0.16, 0.02, 0.2, 0.02, 0.19, SOL.olive);
      part(g, 0.12, 0.05, 0.08, 0, 0.24, 0, SOL.stoneDark);
    } else {
      part(g, 0.52, 0.46, 0.46, 0, 0, 0, SOL.wood);
      part(g, 0.54, 0.11, 0.48, 0, 0.11, 0, SOL.camoDark);
      part(g, 0.54, 0.11, 0.48, 0, -0.12, 0, SOL.camoDark);
      part(g, 0.16, 0.06, 0.02, 0, 0.2, 0.24, SOL.gold);
    }
    g.userData.h = 0.5;
    return g;
  }

  /* the ally: a standing rifleman who walks with the camera, so he needs real
     hip and shoulder joints. Tan uniform, plate carrier, helmet with an ally
     patch, a white/blue armband, and the same detailed rifle the enemy carries. */
  function makeAlly() {
    makeSol();
    const g = new T.Group();
    const b = new T.Group();
    g.add(b);
    const D = (parent, w, h, d, x, y, z, mat) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      parent.add(m);
      return m;
    };

    /* legs */
    const HIP = 0.68;
    const mkLeg = (sx) => {
      const hip = new T.Group();
      hip.position.set(sx * 0.135, HIP, 0);
      part(hip, 0.215, 0.34, 0.24, 0, -0.17, 0, SOL.digiDark);
      D(hip, 0.185, 0.13, 0.08, 0, -0.235, 0.125, SOL.rubber);         // knee pad
      D(hip, 0.085, 0.14, 0.055, sx * 0.115, -0.15, 0.085, SOL.digiDark);
      const shin = new T.Group();
      shin.position.set(0, -0.34, 0);
      hip.add(shin);
      part(shin, 0.19, 0.23, 0.21, 0, -0.115, 0, SOL.digiDark);
      part(shin, 0.22, 0.12, 0.30, 0, -0.28, 0.035, SOL.boot);
      D(shin, 0.23, 0.035, 0.32, 0, -0.335, 0.035, SOL.black);
      b.add(hip);
      return { hip, shin };
    };
    const legL = mkLeg(-1), legR = mkLeg(1);

    /* torso, carrier, belt */
    part(b, 0.42, 0.15, 0.30, 0, 0.745, 0, SOL.digiDark);
    part(b, 0.455, 0.075, 0.325, 0, 0.80, 0, SOL.belt);
    D(b, 0.085, 0.06, 0.03, 0, 0.80, 0.17, SOL.steel);
    part(b, 0.54, 0.43, 0.34, 0, 1.02, 0, SOL.digi);
    D(b, 0.42, 0.30, 0.075, 0, 1.05, 0.185, SOL.digiVest);                // front plate
    D(b, 0.42, 0.29, 0.06, 0, 1.05, -0.185, SOL.digiVest);                // back plate
    D(b, 0.05, 0.26, 0.29, -0.265, 1.06, 0, SOL.digiVest);
    D(b, 0.05, 0.26, 0.29, 0.265, 1.06, 0, SOL.digiVest);
    D(b, 0.095, 0.085, 0.30, -0.15, 1.235, 0.02, SOL.digiVest);
    D(b, 0.095, 0.085, 0.30, 0.15, 1.235, 0.02, SOL.digiVest);
    [-0.12, 0, 0.12].forEach((px) => D(b, 0.095, 0.125, 0.06, px, 0.965, 0.20, SOL.digiVest)); // pouches
    D(b, 0.10, 0.06, 0.03, -0.10, 1.16, 0.228, SOL.bandW);            // name tape
    D(b, 0.10, 0.03, 0.032, -0.10, 1.16, 0.229, SOL.bandB);
    D(b, 0.13, 0.16, 0.09, -0.265, 0.90, -0.055, SOL.olive);
    D(b, 0.07, 0.10, 0.07, 0.215, 0.90, 0.135, SOL.oliveDark);
    D(b, 0.16, 0.10, 0.25, -0.305, 1.185, 0, SOL.digi);
    D(b, 0.16, 0.10, 0.25, 0.305, 1.185, 0, SOL.digi);

    /* head + helmet */
    const headG = new T.Group();
    headG.position.set(0, 1.26, 0);
    b.add(headG);
    D(b, 0.15, 0.09, 0.15, 0, 1.245, 0, SOL.skin);
    const head = new T.Mesh(new T.BoxGeometry(0.42, 0.42, 0.42), [SOL.skin, SOL.skin, SOL.hair, SOL.skin, headFor("ally"), SOL.hair]);
    head.position.set(0, 0.21, 0);
    head.castShadow = true;
    head.receiveShadow = true;
    headG.add(head);
    D(headG, 0.05, 0.11, 0.10, -0.225, 0.20, 0.01, SOL.skin);
    D(headG, 0.05, 0.11, 0.10, 0.225, 0.20, 0.01, SOL.skin);
    D(headG, 0.51, 0.055, 0.545, 0, 0.365, 0, SOL.helmDigi);
    D(headG, 0.47, 0.135, 0.50, 0, 0.425, -0.005, SOL.helmDigi);
    D(headG, 0.34, 0.06, 0.36, 0, 0.475, -0.01, SOL.helmDigi);
    D(headG, 0.52, 0.045, 0.13, 0, 0.372, 0.255, SOL.helmDigi);
    const hp = new T.Mesh(new T.PlaneGeometry(0.17, 0.113), SOL.flagPatch);
    hp.position.set(0, 0.435, 0.262);
    headG.add(hp);
    D(headG, 0.20, 0.05, 0.03, 0, 0.478, 0.243, SOL.digiDark);        // helmet band
    D(headG, 0.505, 0.055, 0.515, 0, 0.352, 0, SOL.strap);            // goggle strap
    D(headG, 0.135, 0.085, 0.045, -0.10, 0.345, 0.245, SOL.lens);
    D(headG, 0.135, 0.085, 0.045, 0.10, 0.345, 0.245, SOL.lens);
    D(headG, 0.05, 0.045, 0.04, 0, 0.345, 0.25, SOL.rubber);
    D(headG, 0.09, 0.19, 0.03, -0.185, 0.10, 0.145, SOL.strap);
    D(headG, 0.09, 0.19, 0.03, 0.185, 0.10, 0.145, SOL.strap);

    /* arms with the white/blue armband on the left one */
    const mkArm = (sx) => {
      const arm = new T.Group();
      arm.position.set(sx * 0.335, 1.155, 0);
      part(arm, 0.165, 0.28, 0.19, 0, -0.145, 0, SOL.digi);
      D(arm, 0.115, 0.065, 0.115, 0, -0.272, 0.055, SOL.rubber);
      part(arm, 0.15, 0.24, 0.17, 0, -0.42, 0.02, SOL.digi);
      D(arm, 0.16, 0.11, 0.18, 0, -0.565, 0.03, SOL.black);
      b.add(arm);
      return arm;
    };
    const armL = mkArm(-1), armR = mkArm(1);
    D(armL, 0.185, 0.075, 0.20, 0, -0.10, 0, SOL.bandW);
    D(armL, 0.19, 0.04, 0.205, 0, -0.145, 0, SOL.bandB);
    /* 태극기 shoulder patch, the way the ROK Army wears it */
    const patchL = new T.Mesh(new T.PlaneGeometry(0.115, 0.077), SOL.flagPatch);
    patchL.position.set(-0.086, -0.15, 0.012);
    patchL.rotation.y = -Math.PI / 2;
    armL.add(patchL);
    const patchR = new T.Mesh(new T.PlaneGeometry(0.13, 0.087), SOL.flagPatch);
    patchR.position.set(0.086, -0.15, 0.012);
    patchR.rotation.y = Math.PI / 2;
    armR.add(patchR);

    /* the rifle rides in both hands, pointing the way he faces (+z) */
    const rifle = makeRifle();
    rifle.position.set(0.02, 1.00, 0.16);
    rifle.rotation.set(-0.05, Math.PI, 0);
    b.add(rifle);
    armR.rotation.set(-1.05, 0, -0.26);
    armL.rotation.set(-1.20, 0, 0.40);

    g.userData.body = b;
    g.userData.headG = headG;
    g.userData.armL = armL;
    g.userData.armR = armR;
    g.userData.legL = legL.hip;
    g.userData.legR = legR.hip;
    g.userData.shinL = legL.shin;
    g.userData.shinR = legR.shin;
    g.userData.rifle = rifle;
    g.userData.muzzle = rifle.userData.muzzle;
    g.userData.phase = 0;
    g.userData.aimK = 0;
    g.scale.setScalar(1.06);
    return g;
  }

  /* a Seoul roadworks drum: orange plastic, two reflective bands. It still
     goes up when a round finds it. */
  function makeBarrel(x, z, y) {
    makeSol();
    const g = new T.Group();
    const c = new T.Mesh(new T.CylinderGeometry(0.33, 0.36, 0.92, 12, 1), SOL.drumOrange);
    c.position.y = 0.46;
    c.castShadow = true;
    c.receiveShadow = true;
    g.add(c);
    [0.28, 0.66].forEach((yy) => {
      const r = new T.Mesh(new T.CylinderGeometry(0.345, 0.352, 0.13, 12, 1), SOL.paintWhite);
      r.position.y = yy;
      g.add(r);
    });
    [-0.04, 0.92].forEach((yy) => {
      const lip = new T.Mesh(new T.CylinderGeometry(0.37, 0.37, 0.07, 12), SOL.drumDark);
      lip.position.y = yy;
      g.add(lip);
    });
    const top = new T.Mesh(new T.CylinderGeometry(0.29, 0.31, 0.05, 12), SOL.drumDark);
    top.position.y = 0.95;
    g.add(top);
    const warn = new T.Mesh(new T.PlaneGeometry(0.42, 0.24), SOL.workSign);
    warn.position.set(0, 0.47, 0.365);
    g.add(warn);
    g.position.set(x, y === undefined ? 0.3 : y, z);
    g.userData.h = 1.0;
    return g;
  }

  function makeCloud(x, y, z, s) {
    makeSol();
    const g = new T.Group();
    const mat = new T.MeshLambertMaterial({ color: 0xffffff, emissive: 0x9fc4e0, emissiveIntensity: 0.35 });
    const n = 3;
    for (let i = 0; i < n; i++) {
      const w = s * (0.8 + Math.random() * 0.9);
      part(g, w, s * (0.35 + Math.random() * 0.25), s * 0.7, (i - n / 2) * s * 0.7, Math.random() * s * 0.2, (Math.random() - 0.5) * s * 0.3, mat);
    }
    g.position.set(x, y, z);
    return g;
  }

  function makeSkyDome() {
    const t = ctex("sky", 256, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "#2f7ecd");
      gr.addColorStop(0.35, "#5aa5e2");
      gr.addColorStop(0.62, "#9ccdf1");
      gr.addColorStop(0.8, "#cfe8fa");
      gr.addColorStop(1, "#eef7fd");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      const R = rng(19);
      for (let c = 0; c < 9; c++) {
        const cx = R() * w, cy = h * (0.2 + R() * 0.44), ss = 5 + R() * 9;
        g.fillStyle = "rgba(255,255,255,.92)";
        for (let i = 0; i < 6; i++) {
          const bw = ss * (1 + R() * 1.8), bh = ss * (0.5 + R() * 0.5);
          g.fillRect(cx + (R() - 0.5) * ss * 3.4, cy + (R() - 0.5) * ss * 0.9, bw, bh);
        }
        g.fillStyle = "rgba(206,226,242,.85)";
        g.fillRect(cx - ss * 1.4, cy + ss * 0.8, ss * 3.4, ss * 0.32);
      }
    });
    const m = new T.Mesh(
      new T.SphereGeometry(150, 24, 16),
      new T.MeshBasicMaterial({ map: t, side: T.BackSide, depthWrite: false, fog: false })
    );
    m.renderOrder = -100;
    return m;
  }

  /* Two cloth faces back to back, each single-sided: whichever way the camera
     stands, the flag reads the right way round. A turned plane is a rotation,
     not a mirror, so 건 stays top-left and 곤 bottom-right on both faces. */
  function makeFlag(kind, x, y, z, w, h) {
    makeSol();
    const g = new T.Group();
    const pole = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, h + 0.6, 6), SOL.poleGray);
    pole.position.set(-w / 2 - 0.06, 0.1, 0);
    pole.castShadow = true;
    g.add(pole);
    const mat = kind === "kp" ? SOL.flagKP : SOL.flagKR;
    const cloth = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    cloth.position.set(0, 0, 0.012);
    g.add(cloth);
    const cloth2 = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    cloth2.position.set(0, 0, -0.012);
    cloth2.rotation.y = Math.PI;
    g.add(cloth2);
    g.position.set(x, y, z);
    g.userData.cloth = cloth;
    g.userData.cloth2 = cloth2;
    g.userData.ph = Math.random() * 6;
    return g;
  }

  function makeOverpass(x) {
    makeSol();
    const g = new T.Group();
    part(g, 1.1, 0.32, 2.9, 0, 3.35, 0, SOL.stone);
    part(g, 1.3, 0.16, 3.05, 0, 3.56, 0, SOL.stoneDark);
    for (let i = -1; i <= 1; i++) part(g, 0.55, 0.55, 0.55, 0, 3.85, i * 1.0, SOL.stone);
    part(g, 0.9, 0.35, 0.5, 0, 3.0, -1.35, SOL.stoneDark);
    const rope = new T.Mesh(new T.BoxGeometry(0.06, 0.06, 2.4), SOL.woodDark);
    rope.position.set(0.45, 3.15, 0.1);
    g.add(rope);
    g.position.set(x, 0.3, 1.9);
    return g;
  }

  function makeRubble(x, z, n) {
    makeSol();
    const g = new T.Group();
    for (let i = 0; i < n; i++) {
      const s = 0.16 + Math.random() * 0.26;
      const m = part(g, s, s * 0.8, s, (Math.random() - 0.5) * 1.6, s * 0.4, (Math.random() - 0.5) * 0.5, SOL.stoneDark);
      m.rotation.set(Math.random() * 0.4, Math.random() * 3, Math.random() * 0.4);
    }
    g.position.set(x, 0.3, z);
    return g;
  }

  function makeBridge(x, z) {
    makeSol();
    const g = new T.Group();
    const span = 13;
    part(g, span, 0.5, 3.2, 0, 3.0, 0, SOL.stone);
    part(g, span + 1, 0.28, 3.5, 0, 3.3, 0, SOL.stoneDark);
    for (let i = -5; i <= 5; i++) {
      part(g, 0.42, 0.42, 3.3, i * 1.2, 3.75 + (Math.abs(i) < 3 ? 0.18 : 0), 0, SOL.stone);
    }
    [-4.6, 4.6].forEach((px) => {
      part(g, 1.1, 3.0, 2.3, px, 1.5, 0, SOL.stone);
      part(g, 1.4, 0.3, 2.6, px, 3.05, 0, SOL.stoneDark);
    });
    g.position.set(x, 0.3, z);
    return g;
  }

  /* ---------------- Seoul set dressing ---------------- */

  /* per-face material with its own repeat: brick, glass and pavement tiles
     must not stretch into streaks on a wall much larger than one tile */
  const REPMAT = {};
  function repMat(mat, rx, ry) {
    if (!mat || !mat.map) return mat;
    const a = Math.max(1, Math.round(rx)), b = Math.max(1, Math.round(ry));
    const k = mat.uuid + "|" + a + "x" + b;
    if (REPMAT[k]) return REPMAT[k];
    const m = cloneMat(mat, a, b);
    m.color.copy(mat.color);
    REPMAT[k] = m;
    return m;
  }

  /* a Seoul city block: glazed facade, a shop band at street level with
     Korean signs and an awning, a parapet and a roof full of water tanks,
     air handlers and aerials. `side` names the face that meets the street. */
  const SIGN_LIST = [
    ["서울상회", "#f4f4ee", "#1d1d1d", "GENERAL STORE"],
    ["김밥천국", "#f6e05e", "#231f20", "KIMBAP"],
    ["24시 편의점", "#2a7f4f", "#ffffff", "24H MART"],
    ["치킨 · 호프", "#c8392f", "#ffe9b0", "CHICKEN"],
    ["부동산", "#1f4f8f", "#ffffff", "REALTY"],
    ["약국", "#ffffff", "#1f7a3f", "PHARMACY"],
    ["분식", "#f08a24", "#ffffff", "SNACKS"],
    ["노래방", "#5b2a8f", "#ffd9f0", "NORAE"]
  ];

  function signMat(i) {
    const s = SIGN_LIST[i % SIGN_LIST.length];
    const key = "sign" + (i % SIGN_LIST.length);
    if (!SOL[key]) SOL[key] = new T.MeshLambertMaterial({ map: signTex(key, s[0], s[1], s[2], s[3]) });
    return SOL[key];
  }

  /* shop band + signage + awning on one face of a block. (ax, az) is the
     outward normal of that face in metres. */
  function streetFront(S, opt) {
    const o = opt || {};
    const len = o.len, k = o.k || 0;
    const ax = o.ax || 0, az = o.az || 1;
    const x = o.x, y = o.y, z = o.z;
    const rotY = Math.atan2(ax, az);
    const g = new T.Group();
    /* glazed shopfront */
    const glass = new T.Mesh(new T.PlaneGeometry(len, 3.0), repMat(SOL.shopGlass, len / 4, 1));
    glass.position.set(0, 1.5, 0.02);
    g.add(glass);
    /* fascia band with two signs over it */
    const fascia = new T.Mesh(new T.BoxGeometry(len, 0.9, 0.16), SOL.shopFascia);
    fascia.position.set(0, 3.5, 0.1);
    g.add(fascia);
    const n = len > 9 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const w = Math.min(3.4, (len - 1.4) / n - 0.4);
      const sm = new T.Mesh(new T.PlaneGeometry(w, w * 0.275), signMat(k + i));
      sm.position.set((i - (n - 1) / 2) * (w + 0.5), 3.5, 0.2);
      g.add(sm);
    }
    /* awning over the glass */
    const aw = new T.Mesh(new T.BoxGeometry(len - 0.6, 0.1, 1.15), k % 2 ? SOL.awnA : SOL.awnB);
    aw.position.set(0, 3.02, 0.62);
    aw.rotation.x = 0.13;
    aw.castShadow = true;
    g.add(aw);
    const lip = new T.Mesh(new T.BoxGeometry(len - 0.6, 0.24, 0.06), k % 2 ? SOL.awnB : SOL.awnA);
    lip.position.set(0, 2.9, 1.16);
    g.add(lip);
    /* door recess with a step */
    const door = new T.Mesh(new T.BoxGeometry(1.55, 2.3, 0.14), SOL.shopGlass);
    door.position.set(len * 0.22, 1.15, 0.05);
    g.add(door);
    const frame = new T.Mesh(new T.BoxGeometry(1.75, 0.12, 0.2), SOL.metalDark);
    frame.position.set(len * 0.22, 2.34, 0.08);
    g.add(frame);
    const jamb = new T.Mesh(new T.BoxGeometry(0.08, 2.3, 0.16), SOL.metalDark);
    jamb.position.set(len * 0.22, 1.15, 0.08);
    g.add(jamb);
    const warm = new T.Mesh(new T.PlaneGeometry(1.3, 0.16), SOL.lampWarm);
    warm.position.set(len * 0.22, 2.28, 0.13);
    g.add(warm);
    const step = new T.Mesh(new T.BoxGeometry(1.9, 0.16, 0.6), SOL.curb);
    step.position.set(len * 0.22, 0.08, 0.35);
    g.add(step);
    /* an air conditioner and a small wall sign up on the first floor */
    const ac = new T.Mesh(new T.BoxGeometry(0.9, 0.62, 0.5), SOL.acUnit);
    ac.position.set(-len * 0.3, 4.6, 0.28);
    ac.castShadow = true;
    g.add(ac);
    const vsign = new T.Mesh(new T.PlaneGeometry(0.62, 1.9), signMat(k + 2));
    vsign.position.set(len * 0.42, 5.2, 0.2);
    g.add(vsign);
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    S.add(g);
    return g;
  }

  /* one city block. Faces: the `side` face carries the shop band. */
  function makeBlock(S, x0, x1, z0, z1, h, opt) {
    makeSol();
    const o = opt || {};
    const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0);
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const mat = o.mat || SOL.facA;
    const body = new T.Mesh(new T.BoxGeometry(w, h, d), repMat(mat, Math.max(w, d) / 6, h / 6.4));
    body.position.set(cx, 0.3 + h / 2, cz);
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.wall = 1;
    S.add(body);
    /* roof deck, parapet and the clutter of a Seoul rooftop */
    const roof = new T.Mesh(new T.BoxGeometry(w + 0.3, 0.35, d + 0.3), SOL.roofDeck);
    roof.position.set(cx, 0.3 + h + 0.1, cz);
    roof.receiveShadow = true;
    S.add(roof);
    const par = new T.Mesh(new T.BoxGeometry(w + 0.5, 0.55, d + 0.5), SOL.concLight);
    par.position.set(cx, 0.3 + h + 0.5, cz);
    S.add(par);
    const R = rng(((x0 * 31 + z0 * 17) | 0) + 7);
    const top = 0.3 + h + 0.78;
    const tank = new T.Mesh(new T.CylinderGeometry(1.05, 1.05, 1.7, 10), SOL.tankBlue);
    tank.position.set(cx - w * 0.22 + R() * 1.4, top + 0.85, cz - d * 0.18 + R() * 1.2);
    tank.castShadow = true;
    S.add(tank);
    for (let i = 0; i < 2; i++) {
      const ac = new T.Mesh(new T.BoxGeometry(1.1 + R() * 0.6, 0.7, 0.9 + R() * 0.4), SOL.acUnit);
      ac.position.set(cx + (R() - 0.5) * w * 0.6, top + 0.35, cz + (R() - 0.5) * d * 0.6);
      ac.castShadow = true;
      S.add(ac);
    }
    const mast = new T.Mesh(new T.CylinderGeometry(0.05, 0.07, 3.2, 5), SOL.metalDark);
    mast.position.set(cx + w * 0.3, top + 1.6, cz + d * 0.28);
    S.add(mast);
    /* the shop band, on the face that meets the street */
    if (o.shop) {
      const side = o.shop;
      const y = 0.3;
      if (side === "e") streetFront(S, { x: x1 + 0.04, y, z: cz, len: d - 0.6, ax: 1, az: 0, k: o.k || 0 });
      else if (side === "w") streetFront(S, { x: x0 - 0.04, y, z: cz, len: d - 0.6, ax: -1, az: 0, k: o.k || 0 });
      else if (side === "s") streetFront(S, { x: cx, y, z: z0 - 0.04, len: w - 0.6, ax: 0, az: -1, k: o.k || 0 });
      else streetFront(S, { x: cx, y, z: z1 + 0.04, len: w - 0.6, ax: 0, az: 1, k: o.k || 0 });
    }
    return body;
  }

  /* ---- landmarks ---- */

  /* A flag hung on two sides so it reads the right way round from either
     face: a plane turned over is a rotation, not a mirror, so the trigrams
     stay where the law puts them. */
  function makeFlagPlane(S, kind, x, y, z, w, h, rotY, pole) {
    const g = new T.Group();
    const mat = kind === "kp" ? SOL.flagKP : SOL.flagKR;
    const front = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    g.add(front);
    const back = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    back.rotation.y = Math.PI;
    back.position.z = -0.012;
    g.add(back);
    if (pole) {
      const p = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, h + 1.4, 6), SOL.poleGray);
      p.position.set(-w / 2 - 0.1, 0.2, -0.02);
      p.castShadow = true;
      g.add(p);
      const cap = new T.Mesh(new T.SphereGeometry(0.11, 7, 6), SOL.gold);
      cap.position.set(-w / 2 - 0.1, h / 2 + 0.9, -0.02);
      g.add(cap);
    }
    g.position.set(x, y, z);
    g.rotation.y = rotY || 0;
    g.userData.cloth = front;
    g.userData.cloth2 = back;
    g.userData.ph = Math.random() * 6;
    S.add(g);
    return g;
  }

  /* green direction gantry over the road: 서울역 straight on, 남산 to the right */
  function makeRoadSign(S, x, z, rotY) {
    const g = new T.Group();
    const post = new T.Mesh(new T.CylinderGeometry(0.12, 0.15, 6.2, 8), SOL.poleGray);
    post.position.set(-2.4, 3.1, 0);
    post.castShadow = true;
    g.add(post);
    const arm = new T.Mesh(new T.BoxGeometry(5.0, 0.16, 0.16), SOL.poleGray);
    arm.position.set(0, 5.5, 0);
    g.add(arm);
    const a = new T.Mesh(new T.PlaneGeometry(2.2, 1.1), new T.MeshLambertMaterial({ map: roadSignTex("signSeoul", "서울역", "Seoul Station", "up") }));
    a.position.set(-0.95, 4.75, 0.02);
    g.add(a);
    const b = new T.Mesh(new T.PlaneGeometry(2.2, 1.1), new T.MeshLambertMaterial({ map: roadSignTex("signNamsan", "남산", "Namsan", "right") }));
    b.position.set(1.45, 4.75, 0.02);
    g.add(b);
    const backA = new T.Mesh(new T.BoxGeometry(4.6, 1.2, 0.08), SOL.metalDark);
    backA.position.set(0.25, 4.75, -0.06);
    g.add(backA);
    g.position.set(x, 0.3, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }

  /* the corner LED screen */
  function makeBillboard(S, x, y, z, w, h, rotY) {
    const g = new T.Group();
    const frame = new T.Mesh(new T.BoxGeometry(w + 0.6, h + 0.6, 0.4), SOL.ledFrame);
    frame.position.set(0, 0, 0);
    g.add(frame);
    const led = new T.Mesh(new T.PlaneGeometry(w, h), SOL.ledScreen);
    led.position.set(0, 0, 0.22);
    g.add(led);
    const bar = new T.Mesh(new T.BoxGeometry(w + 2.2, 0.18, 0.3), SOL.metalDark);
    bar.position.set(0, -h / 2 - 0.4, -0.1);
    g.add(bar);
    g.position.set(x, y, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }

  /* a Korean gate: stone base with a lit passage, a timber pavilion above,
     tiled hip roofs and dancheong colour bands. No black hole: the passage
     has a floor, lamps and a sunlit wall at the far end. */
  function makeKoreanGate(S, cx, cz, opt) {
    makeSol();
    const o = opt || {};
    const W = o.w || 17.6, D = o.d || 5.4, BASE = o.h || 5.6;
    const g = new T.Group();
    const OPEN = o.open || 5.2;
    const stone = (w, h) => repMat(SOL.gateStone, w / 4.8, h / 4.8);
    const HALF = OPEN / 2;
    const piers = [[-W / 2, -HALF], [HALF, W / 2]];
    piers.forEach(([a, b]) => {
      const w = b - a;
      const p = new T.Mesh(new T.BoxGeometry(w, BASE, D), stone(w, BASE));
      p.position.set(cx + (a + b) / 2, 0.3 + BASE / 2, cz);
      p.castShadow = true;
      p.receiveShadow = true;
      p.userData.wall = 1;
      S.add(p);
      /* sloped stone footing */
      const foot = new T.Mesh(new T.BoxGeometry(w + 0.5, 0.7, D + 0.7), stone(w + 0.5, 0.7));
      foot.position.set(cx + (a + b) / 2, 0.65, cz);
      S.add(foot);
    });
    /* lintel band over the opening */
    const top = new T.Mesh(new T.BoxGeometry(OPEN + 0.6, BASE - OPEN * 0.72, D), stone(OPEN, BASE - OPEN * 0.72));
    top.position.set(cx, 0.3 + OPEN * 0.72 + (BASE - OPEN * 0.72) / 2, cz);
    top.userData.wall = 1;
    S.add(top);
    /* the passage: stone floor, three warm lamps, a sunlit back wall */
    const pass = new T.Group();
    const floor = new T.Mesh(new T.BoxGeometry(OPEN - 0.2, 0.1, D + 5.2), SOL.concLight);
    floor.position.set(0, 0.06, 1.8);
    pass.add(floor);
    const back = new T.Mesh(new T.BoxGeometry(OPEN - 0.2, BASE - 0.4, 0.2), SOL.concLight);
    back.position.set(0, (BASE - 0.4) / 2, D + 4.2);
    pass.add(back);
    for (let i = -1; i <= 1; i++) {
      const lamp = new T.Mesh(new T.SphereGeometry(0.13, 7, 6), SOL.lampWarm);
      lamp.position.set(i * 1.3, BASE - 0.9, D * 0.5);
      pass.add(lamp);
    }
    const ceil = new T.Mesh(new T.BoxGeometry(OPEN - 0.2, 0.16, D + 5.2), SOL.concLight);
    ceil.position.set(0, BASE - 0.35, 1.8);
    pass.add(ceil);
    pass.position.set(cx, 0.3, cz);
    S.add(pass);
    /* timber pavilion */
    const py = 0.3 + BASE;
    const PW = W * 0.72, PD = D * 0.86;
    const slab = new T.Mesh(new T.BoxGeometry(PW + 0.8, 0.4, PD + 0.6), SOL.woodDark);
    slab.position.set(cx, py + 0.2, cz);
    S.add(slab);
    for (let i = -2; i <= 2; i++) {
      [-1, 1].forEach((sz) => {
        const col = new T.Mesh(new T.BoxGeometry(0.42, 2.9, 0.42), SOL.woodRed);
        col.position.set(cx + (i * PW) / 5, py + 1.85, cz + (sz * PD) / 2);
        col.castShadow = true;
        S.add(col);
      });
    }
    /* dancheong beams: green under red under green */
    [[SOL.dancheongG, 0.44], [SOL.dancheongR, 0.28], [SOL.dancheongG, 0.2]].forEach(([m, hh], i) => {
      const beam = new T.Mesh(new T.BoxGeometry(PW + 1.0, hh, PD + 0.9), m);
      beam.position.set(cx, py + 3.35 + i * 0.36, cz);
      S.add(beam);
    });
    /* two tiled hip roofs, each a slab with a frustum on top */
    const roof = (w, d, yy, hi) => {
      /* exposed rafter soffit under a wide tiled eave */
      const soffit = new T.Mesh(new T.BoxGeometry(w * 0.96, 0.24, d * 0.96), SOL.rafter);
      soffit.position.set(cx, yy - 0.16, cz);
      S.add(soffit);
      const eave = new T.Mesh(new T.BoxGeometry(w, 0.3, d), SOL.roofTile);
      eave.position.set(cx, yy, cz);
      eave.castShadow = true;
      S.add(eave);
      const frust = new T.Mesh(new T.CylinderGeometry(w * 0.13, w * 0.52, hi, 4, 1), SOL.roofTile);
      frust.rotation.y = Math.PI / 4;
      frust.scale.z = (d / w) * 1.06;
      frust.position.set(cx, yy + hi / 2 + 0.12, cz);
      frust.castShadow = true;
      S.add(frust);
      const ridge = new T.Mesh(new T.BoxGeometry(w * 0.34, 0.22, 0.34), SOL.roofRidge);
      ridge.position.set(cx, yy + hi + 0.18, cz);
      S.add(ridge);
      [-1, 1].forEach((sx) => {
        const cap = new T.Mesh(new T.BoxGeometry(w * 0.045, 0.5, 0.4), SOL.roofRidge);
        cap.position.set(cx + (sx * w) * 0.17, yy + hi + 0.22, cz);
        S.add(cap);
      });
      /* upturned eave tips at the four corners */
      [-1, 1].forEach((sx) => {
        [-1, 1].forEach((sz) => {
          const tip = new T.Mesh(new T.BoxGeometry(w * 0.2, 0.2, d * 0.28), SOL.roofTile);
          tip.position.set(cx + (sx * w) / 2.08, yy + 0.2, cz + (sz * d) / 2.3);
          tip.rotation.z = -sx * 0.2;
          tip.rotation.x = sz * 0.12;
          S.add(tip);
        });
      });
    };
    roof(W * 1.04, D * 1.34, py + 1.15, 2.6);
    roof(W * 0.9, D * 1.18, py + 4.15, 2.2);
    /* a hanging signboard under the upper eave */
    const plate = new T.Mesh(new T.PlaneGeometry(1.5, 0.49), SOL.gateSign);
    plate.position.set(cx, py + 2.75, cz + D * 0.46);
    S.add(plate);
    const f1 = makeFlagPlane(S, "kr", cx - W * 0.36, py + 5.4, cz - 0.2, 1.9, 1.3, Math.PI);
    const f2 = makeFlagPlane(S, "kr", cx + W * 0.36, py + 5.4, cz - 0.2, 1.9, 1.3, Math.PI);
    g.userData.flags = [f1, f2];
    return [f1, f2];
  }

  /* the far silhouette down the boulevard: Sungnyemun on its stone base */
  function makeSungnyemunFar(S, cx, cz, s) {
    makeSol();
    const W = 26 * s, D = 9 * s, BASE = 8.4 * s;
    const g = new T.Group();
    const stone = repMat(SOL.gateStone, W / 6, BASE / 6);
    const base = new T.Mesh(new T.BoxGeometry(W, BASE, D), stone);
    base.position.set(cx, BASE / 2, cz);
    S.add(base);
    const OPEN = 6.4 * s, HALF = OPEN / 2;
    [[-W / 2, -HALF], [HALF, W / 2]].forEach(([a, b]) => {
      const w = b - a;
      const p = new T.Mesh(new T.BoxGeometry(w, BASE * 0.62, D), stone);
      p.position.set(cx + (a + b) / 2, BASE * 0.31, cz);
      S.add(p);
    });
    const tunnel = new T.Mesh(new T.BoxGeometry(OPEN, BASE * 0.55, D * 0.9), SOL.archLit);
    tunnel.position.set(cx, BASE * 0.3, cz);
    S.add(tunnel);
    const py = BASE;
    const pav = new T.Mesh(new T.BoxGeometry(W * 0.62, 3.4 * s, D * 0.74), SOL.woodRed);
    pav.position.set(cx, py + 1.7 * s, cz);
    S.add(pav);
    for (let i = 0; i < 2; i++) {
      const w = W * (1.06 - i * 0.14), d = D * (1.32 - i * 0.1);
      const eave = new T.Mesh(new T.BoxGeometry(w, 0.4 * s, d), SOL.roofTile);
      eave.position.set(cx, py + (3.2 + i * 3.0) * s, cz);
      S.add(eave);
      const frust = new T.Mesh(new T.CylinderGeometry(w * 0.2, w * 0.62, 2.2 * s, 4, 1), SOL.roofTile);
      frust.rotation.y = Math.PI / 4;
      frust.scale.z = d / w;
      frust.position.set(cx, py + (4.3 + i * 3.0) * s, cz);
      S.add(frust);
    }
    return g;
  }

  /* Namsan: the ridge, the tower and its aerial farm, far up the valley */
  function makeNamsan(S, cx, cz) {
    makeSol();
    const R = rng(404);
    const tones = [0x5c7a55, 0x4c6a48, 0x6b8a60, 0x40593d];
    /* one ridge behind the gate, flanked by the shoulders of the mountain */
    const ridge = [
      [0, 14, 96], [-34, 4, 84], [34, 2, 80], [-64, 18, 66], [66, 16, 62],
      [-96, 30, 54], [98, 34, 50], [-20, 46, 70], [24, 48, 66]
    ];
    ridge.forEach(([dx, dz, hh], i) => {
      const m = new T.Mesh(new T.ConeGeometry(hh * 1.25, hh, 7, 1), new T.MeshLambertMaterial({ color: tones[i % tones.length] }));
      m.position.set(cx + dx, hh / 2 - 12, cz + dz);
      m.rotation.y = i * 0.6;
      S.add(m);
    });
    const peak = 62;
    const g = new T.Group();
    const base = new T.Mesh(new T.CylinderGeometry(3.4, 5.4, 10, 10), SOL.towerWhite);
    base.position.y = 5;
    g.add(base);
    const shaft = new T.Mesh(new T.CylinderGeometry(1.5, 2.2, 40, 10), SOL.towerWhite);
    shaft.position.y = 30;
    g.add(shaft);
    const deck = new T.Mesh(new T.CylinderGeometry(3.5, 3.0, 3.2, 12), SOL.towerWhite);
    deck.position.y = 52;
    g.add(deck);
    const deck2 = new T.Mesh(new T.CylinderGeometry(2.8, 2.8, 1.8, 12), SOL.towerGlass);
    deck2.position.y = 56.5;
    g.add(deck2);
    const upper = new T.Mesh(new T.CylinderGeometry(0.9, 1.5, 9, 10), SOL.towerWhite);
    upper.position.y = 62;
    g.add(upper);
    const mast = new T.Mesh(new T.CylinderGeometry(0.16, 0.36, 16, 6), SOL.metalDark);
    mast.position.y = 74;
    g.add(mast);
    for (let i = 0; i < 3; i++) {
      const arm = new T.Mesh(new T.BoxGeometry(2.2, 0.12, 0.12), SOL.metalDark);
      arm.position.y = 66 + i * 3;
      arm.rotation.y = i * 0.7;
      g.add(arm);
    }
    const lamp = new T.Mesh(new T.SphereGeometry(0.4, 6, 5), SOL.lampRed);
    lamp.position.y = 82;
    g.add(lamp);
    g.position.set(cx, peak, cz);
    S.add(g);
    return g;
  }

  /* ---- street furniture and vehicles ---- */

  function makeStreetLamp(S, x, z, rotY) {
    const g = new T.Group();
    const post = new T.Mesh(new T.CylinderGeometry(0.09, 0.13, 6.4, 7), SOL.poleGray);
    post.position.y = 3.2;
    post.castShadow = true;
    g.add(post);
    const arm = new T.Mesh(new T.BoxGeometry(1.8, 0.1, 0.1), SOL.poleGray);
    arm.position.set(0.85, 6.3, 0);
    g.add(arm);
    const head = new T.Mesh(new T.BoxGeometry(0.9, 0.16, 0.34), SOL.metalDark);
    head.position.set(1.65, 6.2, 0);
    g.add(head);
    g.position.set(x, 0.3, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }

  function makeTrafficLight(S, x, z, rotY) {
    const g = new T.Group();
    const post = new T.Mesh(new T.CylinderGeometry(0.1, 0.14, 5.6, 7), SOL.poleGray);
    post.position.y = 2.8;
    g.add(post);
    const arm = new T.Mesh(new T.BoxGeometry(2.6, 0.12, 0.12), SOL.poleGray);
    arm.position.set(1.3, 5.4, 0);
    g.add(arm);
    const box = new T.Mesh(new T.BoxGeometry(0.9, 0.34, 0.3), SOL.ledFrame);
    box.position.set(2.4, 5.15, 0);
    g.add(box);
    [[0xff3b30, -0.28], [0xffcc00, 0], [0x2fd36b, 0.28]].forEach(([c, dx], i) => {
      const l = new T.Mesh(new T.CircleGeometry(0.1, 10), new T.MeshBasicMaterial({ color: i === 2 ? c : 0x2a2a2a }));
      l.position.set(2.4 + dx, 5.15, 0.17);
      g.add(l);
    });
    g.position.set(x, 0.3, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }

  function makeUtilityPole(S, x, z) {
    const g = new T.Group();
    const p = new T.Mesh(new T.CylinderGeometry(0.12, 0.2, 8.4, 7), SOL.concPole);
    p.position.y = 4.2;
    p.castShadow = true;
    g.add(p);
    for (let i = 0; i < 2; i++) {
      const arm = new T.Mesh(new T.BoxGeometry(2.0, 0.1, 0.1), SOL.woodDark);
      arm.position.set(0, 7.2 - i * 0.7, 0);
      g.add(arm);
    }
    const tx = new T.Mesh(new T.BoxGeometry(0.7, 0.9, 0.6), SOL.metalDark);
    tx.position.set(0.1, 6.0, 0.1);
    g.add(tx);
    g.position.set(x, 0.3, z);
    S.add(g);
    return g;
  }

  function makeCone(S, x, z) {
    const g = new T.Group();
    const c = new T.Mesh(new T.ConeGeometry(0.26, 0.75, 8), SOL.coneOrange);
    c.position.y = 0.38;
    c.castShadow = true;
    g.add(c);
    const band = new T.Mesh(new T.CylinderGeometry(0.17, 0.2, 0.12, 8), SOL.paintWhite);
    band.position.y = 0.44;
    g.add(band);
    const base = new T.Mesh(new T.BoxGeometry(0.5, 0.06, 0.5), SOL.coneOrange);
    base.position.y = 0.03;
    g.add(base);
    g.position.set(x, 0.3, z);
    S.add(g);
    return g;
  }

  function makeHydrant(S, x, z) {
    const g = new T.Group();
    const b = new T.Mesh(new T.CylinderGeometry(0.17, 0.2, 0.7, 8), SOL.hydrant);
    b.position.y = 0.35;
    g.add(b);
    const cap = new T.Mesh(new T.SphereGeometry(0.19, 8, 6), SOL.hydrant);
    cap.position.y = 0.72;
    g.add(cap);
    [-1, 1].forEach((s) => {
      const n = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.16, 6), SOL.hydrant);
      n.rotation.z = Math.PI / 2;
      n.position.set(s * 0.2, 0.5, 0);
      g.add(n);
    });
    g.position.set(x, 0.3, z);
    S.add(g);
    return g;
  }

  /* a street scaffold: a plank deck on steel poles with a toe board, the
     platform the alley's elevated rifleman stands on */
  function makeScaffold(S, x0, x1, zWall, zEdge, y) {
    makeSol();
    const w = Math.abs(x1 - x0), d = Math.abs(zEdge - zWall);
    const cx = (x0 + x1) / 2, cz = (zWall + zEdge) / 2;
    const deck = new T.Mesh(new T.BoxGeometry(w, 0.16, d), SOL.scaffPlank);
    deck.position.set(cx, y, cz);
    deck.castShadow = true;
    deck.receiveShadow = true;
    S.add(deck);
    const toe = new T.Mesh(new T.BoxGeometry(w, 0.95, 0.12), SOL.siteWall);
    toe.position.set(cx, y + 0.55, zEdge);
    toe.userData.wall = 1;
    S.add(toe);
    const rail = new T.Mesh(new T.BoxGeometry(w, 0.07, 0.07), SOL.scaffPole);
    rail.position.set(cx, y + 1.05, zEdge);
    S.add(rail);
    for (let x = x0 + 0.6; x <= x1 - 0.4; x += 2.0) {
      [zWall + 0.2, zEdge - 0.2].forEach((pz) => {
        const pole = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, y, 6), SOL.scaffPole);
        pole.position.set(x, y / 2, pz);
        S.add(pole);
      });
      const brace = new T.Mesh(new T.BoxGeometry(0.05, 0.05, d * 1.1), SOL.scaffPole);
      brace.position.set(x, y - 0.35, cz);
      S.add(brace);
    }
    const mesh = new T.Mesh(new T.PlaneGeometry(w, y - 0.3), SOL.scaffNet);
    mesh.position.set(cx, y / 2, zEdge + 0.02);
    S.add(mesh);
    return deck;
  }

  function makePlanter(S, x, z, w) {
    const g = new T.Group();
    const L = w || 1.6;
    const box = new T.Mesh(new T.BoxGeometry(L, 0.55, 0.8), SOL.planter);
    box.position.y = 0.28;
    box.castShadow = true;
    g.add(box);
    const soil = new T.Mesh(new T.BoxGeometry(L - 0.2, 0.08, 0.62), SOL.soil);
    soil.position.y = 0.58;
    g.add(soil);
    const R = rng(((x * 13 + z * 7) | 0) + 3);
    for (let i = 0; i < 3; i++) {
      const bush = new T.Mesh(new T.BoxGeometry(0.5 + R() * 0.3, 0.42 + R() * 0.3, 0.5), SOL.hedge);
      bush.position.set((i - 1) * (L / 3.4), 0.8, (R() - 0.5) * 0.2);
      g.add(bush);
    }
    g.position.set(x, 0.3, z);
    S.add(g);
    return g;
  }

  function makePoliceCar(S, x, z, rotY) {
    makeSol();
    const g = new T.Group();
    const body = new T.Mesh(new T.BoxGeometry(1.92, 0.62, 4.5), SOL.policeWhite);
    body.position.y = 0.84;
    body.castShadow = true;
    body.userData.wall = 1;
    g.add(body);
    const skirt = new T.Mesh(new T.BoxGeometry(1.96, 0.3, 4.4), SOL.policeWhite);
    skirt.position.y = 0.5;
    g.add(skirt);
    const cabin = new T.Mesh(new T.BoxGeometry(1.8, 0.62, 2.3), SOL.policeWhite);
    cabin.position.set(0, 1.42, -0.1);
    cabin.castShadow = true;
    cabin.userData.wall = 1;
    g.add(cabin);
    const hood = new T.Mesh(new T.BoxGeometry(1.86, 0.16, 1.2), SOL.policeWhite);
    hood.position.set(0, 1.16, 1.55);
    g.add(hood);
    const windshield = new T.Mesh(new T.BoxGeometry(1.7, 0.5, 0.1), SOL.carGlass);
    windshield.position.set(0, 1.44, 1.06);
    windshield.rotation.x = 0.34;
    g.add(windshield);
    const rear = new T.Mesh(new T.BoxGeometry(1.7, 0.46, 0.1), SOL.carGlass);
    rear.position.set(0, 1.44, -1.26);
    rear.rotation.x = -0.3;
    g.add(rear);
    [-1, 1].forEach((s) => {
      const win = new T.Mesh(new T.BoxGeometry(0.04, 0.42, 2.0), SOL.carGlass);
      win.position.set(s * 0.91, 1.44, -0.1);
      g.add(win);
      const stripe = new T.Mesh(new T.BoxGeometry(0.03, 0.2, 4.3), SOL.policeBlue);
      stripe.position.set(s * 0.97, 0.86, 0);
      g.add(stripe);
      const txt = new T.Mesh(new T.PlaneGeometry(1.2, 0.3), SOL.policeText);
      txt.position.set(s * 0.995, 0.62, 0.2);
      txt.rotation.y = s * Math.PI / 2;
      g.add(txt);
    });
    const bar = new T.Mesh(new T.BoxGeometry(0.96, 0.14, 0.3), SOL.metalDark);
    bar.position.set(0, 1.78, -0.1);
    g.add(bar);
    [-1, 1].forEach((s, i) => {
      const l = new T.Mesh(new T.BoxGeometry(0.42, 0.16, 0.28), i ? SOL.lampBlue : SOL.lampRed);
      l.position.set(s * 0.24, 1.88, -0.1);
      g.add(l);
    });
    [-1.45, 1.45].forEach((wz) => {
      [-1, 1].forEach((sx) => {
        const w = new T.Mesh(new T.CylinderGeometry(0.36, 0.36, 0.24, 10), SOL.tire);
        w.rotation.z = Math.PI / 2;
        w.position.set(sx * 0.88, 0.36, wz);
        w.castShadow = true;
        g.add(w);
        const hub = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.26, 8), SOL.hubCap);
        hub.rotation.z = Math.PI / 2;
        hub.position.set(sx * 0.9, 0.36, wz);
        g.add(hub);
      });
    });
    [-0.65, 0.65].forEach((sx) => {
      const hl = new T.Mesh(new T.BoxGeometry(0.42, 0.16, 0.06), SOL.lampWarm);
      hl.position.set(sx, 0.92, 2.26);
      g.add(hl);
      const tl = new T.Mesh(new T.BoxGeometry(0.4, 0.16, 0.06), SOL.lampRed);
      tl.position.set(sx, 0.92, -2.26);
      g.add(tl);
    });
    g.position.set(x, 0.3, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }

  function makeCityBus(S, x, z, rotY, route) {
    makeSol();
    const g = new T.Group();
    const L = 10.6, W = 2.5, H = 2.9;
    const body = new T.Mesh(new T.BoxGeometry(W, H, L), SOL.busGreen);
    body.position.y = 1.05 + H / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.wall = 1;
    g.add(body);
    const skirt = new T.Mesh(new T.BoxGeometry(W + 0.02, 0.55, L - 0.1), SOL.busDark);
    skirt.position.y = 0.92;
    g.add(skirt);
    /* window band down both sides */
    [-1, 1].forEach((s) => {
      const win = new T.Mesh(new T.BoxGeometry(0.04, 1.05, L - 1.6), SOL.carGlass);
      win.position.set(s * (W / 2 + 0.01), 2.85, -0.2);
      g.add(win);
      for (let i = 0; i < 6; i++) {
        const mull = new T.Mesh(new T.BoxGeometry(0.06, 1.05, 0.09), SOL.busDark);
        mull.position.set(s * (W / 2 + 0.03), 2.85, -4.2 + i * 1.55);
        g.add(mull);
      }
      const band = new T.Mesh(new T.BoxGeometry(0.03, 0.12, L - 1.0), SOL.paintWhite);
      band.position.set(s * (W / 2 + 0.02), 2.16, 0);
      g.add(band);
      const num = new T.Mesh(new T.PlaneGeometry(0.9, 0.3), SOL.busRoute);
      num.position.set(s * (W / 2 + 0.03), 3.55, 3.4);
      num.rotation.y = s * Math.PI / 2;
      g.add(num);
    });
    /* front: windscreen, destination board, lights */
    const front = new T.Mesh(new T.BoxGeometry(W - 0.14, 1.25, 0.06), SOL.carGlass);
    front.position.set(0, 2.86, L / 2 + 0.01);
    g.add(front);
    const board = new T.Mesh(new T.PlaneGeometry(1.7, 0.34), SOL.busBoard);
    board.position.set(0, 3.72, L / 2 + 0.04);
    g.add(board);
    const bumper = new T.Mesh(new T.BoxGeometry(W, 0.34, 0.2), SOL.metalDark);
    bumper.position.set(0, 0.88, L / 2 + 0.04);
    g.add(bumper);
    [-0.8, 0.8].forEach((sx) => {
      const hl = new T.Mesh(new T.BoxGeometry(0.34, 0.22, 0.06), SOL.lampWarm);
      hl.position.set(sx, 1.24, L / 2 + 0.05);
      g.add(hl);
      const tl = new T.Mesh(new T.BoxGeometry(0.3, 0.5, 0.06), SOL.lampRed);
      tl.position.set(sx, 1.35, -L / 2 - 0.05);
      g.add(tl);
    });
    /* the rear destination window and engine grille */
    const rear = new T.Mesh(new T.BoxGeometry(W - 0.2, 0.9, 0.06), SOL.carGlass);
    rear.position.set(0, 3.0, -L / 2 - 0.01);
    g.add(rear);
    const grille = new T.Mesh(new T.BoxGeometry(W - 0.5, 0.6, 0.08), SOL.metalDark);
    grille.position.set(0, 1.5, -L / 2 - 0.02);
    g.add(grille);
    /* door on the near side */
    [-1, 1].forEach((s, i) => {
      const door = new T.Mesh(new T.BoxGeometry(0.06, 2.05, 1.1), SOL.carGlass);
      door.position.set(s * (W / 2 + 0.02), 1.88, i ? 0.9 : 2.9);
      g.add(door);
    });
    [-3.4, 2.9].forEach((wz) => {
      [-1, 1].forEach((sx) => {
        const w = new T.Mesh(new T.CylinderGeometry(0.52, 0.52, 0.36, 12), SOL.tire);
        w.rotation.z = Math.PI / 2;
        w.position.set(sx * (W / 2 - 0.12), 0.52, wz);
        w.castShadow = true;
        g.add(w);
        const hub = new T.Mesh(new T.CylinderGeometry(0.24, 0.24, 0.38, 8), SOL.hubCap);
        hub.rotation.z = Math.PI / 2;
        hub.position.set(sx * (W / 2 - 0.1), 0.52, wz);
        g.add(hub);
      });
    });
    g.position.set(x, 0.3, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }

  /* ---- cover props in Seoul materials: concrete, not sandbags ---- */

  function makeJersey(x, z, len) {
    makeSol();
    const g = new T.Group();
    const L = Math.max(1.2, len || 2.2);
    part(g, L, 0.34, 0.7, 0, 0.17, 0, SOL.barrier);
    part(g, L, 0.4, 0.5, 0, 0.54, 0, SOL.barrier);
    part(g, L, 0.24, 0.32, 0, 0.86, 0, SOL.barrier);
    [-1, 1].forEach((s) => {
      const cap = new T.Mesh(new T.BoxGeometry(0.16, 0.5, 0.42), SOL.barrier);
      cap.position.set((s * L) / 2, 0.6, 0);
      g.add(cap);
    });
    for (let i = -1; i <= 1; i++) {
      const refl = new T.Mesh(new T.BoxGeometry(0.22, 0.12, 0.34), i === 0 ? SOL.paintWhite : SOL.lampRed);
      refl.position.set(i * (L / 3.4), 0.9, 0);
      g.add(refl);
    }
    g.position.set(x, 0, z);
    return g;
  }

  function makeSiteWall(x, z, len, h) {
    makeSol();
    const g = new T.Group();
    const L = Math.max(1.6, len || 2.4), H = h || 1.45;
    const wall = new T.Mesh(new T.BoxGeometry(L, H, 0.28), SOL.siteWall);
    wall.position.y = H / 2;
    wall.castShadow = true;
    g.add(wall);
    const cap = new T.Mesh(new T.BoxGeometry(L + 0.1, 0.1, 0.34), SOL.siteWallCap);
    cap.position.y = H + 0.05;
    g.add(cap);
    [-1, 1].forEach((s) => {
      const foot = new T.Mesh(new T.BoxGeometry(0.26, 0.2, 0.62), SOL.metalDark);
      foot.position.set((s * L) / 2, 0.1, 0);
      g.add(foot);
    });
    const plate = new T.Mesh(new T.PlaneGeometry(Math.min(2.2, L * 0.8), Math.min(0.7, H * 0.5)), SOL.workSign);
    plate.position.set(0, H * 0.55, 0.16);
    g.add(plate);
    g.position.set(x, 0, z);
    return g;
  }

  function makeConcreteStack(x, z, len) {
    makeSol();
    const g = new T.Group();
    const L = Math.max(1.0, len || 1.1);
    part(g, L, 0.34, 0.68, 0, 0.17, 0, SOL.barrier);
    part(g, L, 0.4, 0.5, 0, 0.54, 0, SOL.barrier);
    part(g, L * 0.94, 0.36, 0.52, 0.04, 0.92, 0, SOL.barrier);
    part(g, L * 0.8, 0.34, 0.48, -0.06, 1.27, 0, SOL.concBlock);
    const strap = new T.Mesh(new T.BoxGeometry(L * 0.86, 0.06, 0.56), SOL.strapY);
    strap.position.set(-0.04, 1.1, 0);
    g.add(strap);
    g.position.set(x, 0, z);
    return g;
  }

  function makeBarricade(x, z, len) {
    makeSol();
    const g = new T.Group();
    const L = Math.max(1.2, len || 1.9);
    [-1, 1].forEach((s) => {
      const leg = new T.Mesh(new T.BoxGeometry(0.1, 1.0, 0.7), SOL.metalDark);
      leg.position.set((s * L) / 2.2, 0.5, 0);
      g.add(leg);
      const foot = new T.Mesh(new T.BoxGeometry(0.14, 0.08, 0.9), SOL.metalDark);
      foot.position.set((s * L) / 2.2, 0.04, 0);
      g.add(foot);
    });
    const panel = new T.Mesh(new T.BoxGeometry(L, 0.42, 0.08), SOL.barricadePanel);
    panel.position.y = 0.82;
    g.add(panel);
    const rail = new T.Mesh(new T.BoxGeometry(L, 0.09, 0.09), SOL.metalDark);
    rail.position.y = 0.38;
    g.add(rail);
    g.position.set(x, 0, z);
    return g;
  }

  /* an open-bed army truck: cab, canvas tilt over the cab only, and a cargo
     bed low enough that the rifleman standing in it can be seen and shot
     from the chest up. The whole thing is a wall, so rounds stop on it. */
  function makeArmyTruck(S, x, z, rotY) {
    makeSol();
    const g = new T.Group();
    const olive = SOL.armyOlive, dark = SOL.armyDark;
    const cab = new T.Mesh(new T.BoxGeometry(2.3, 1.5, 2.0), olive);
    cab.position.set(0, 1.35, 1.9);
    cab.castShadow = true;
    cab.userData.wall = 1;
    g.add(cab);
    const roof = new T.Mesh(new T.BoxGeometry(2.36, 0.14, 2.1), dark);
    roof.position.set(0, 2.14, 1.88);
    g.add(roof);
    const glass = new T.Mesh(new T.BoxGeometry(2.1, 0.6, 0.08), SOL.carGlass);
    glass.position.set(0, 1.62, 2.92);
    glass.rotation.x = 0.14;
    g.add(glass);
    [-1, 1].forEach((sx) => {
      const side = new T.Mesh(new T.BoxGeometry(0.06, 0.55, 1.5), SOL.carGlass);
      side.position.set(sx * 1.14, 1.6, 1.95);
      g.add(side);
    });
    /* cargo bed: floor at 1.28, side boards up to 1.62 */
    const bed = new T.Mesh(new T.BoxGeometry(2.3, 0.18, 3.6), dark);
    bed.position.set(0, 1.19, -1.0);
    bed.userData.wall = 1;
    g.add(bed);
    [-1, 1].forEach((sx) => {
      const board = new T.Mesh(new T.BoxGeometry(0.14, 0.42, 3.6), olive);
      board.position.set(sx * 1.08, 1.5, -1.0);
      board.userData.wall = 1;
      g.add(board);
      for (let i = -1; i <= 1; i++) {
        const rib = new T.Mesh(new T.BoxGeometry(0.16, 0.44, 0.1), dark);
        rib.position.set(sx * 1.09, 1.5, -1.0 + i * 1.2);
        g.add(rib);
      }
    });
    const tail = new T.Mesh(new T.BoxGeometry(2.3, 0.42, 0.12), olive);
    tail.position.set(0, 1.5, -2.79);
    tail.userData.wall = 1;
    g.add(tail);
    const chassis = new T.Mesh(new T.BoxGeometry(2.1, 0.32, 5.4), SOL.metalDark);
    chassis.position.set(0, 1.0, 0);
    g.add(chassis);
    [[-1.9, 0.52], [1.7, 0.52], [1.7, -0.52], [-1.9, -0.52]].forEach(([wz, sx]) => {
      const w = new T.Mesh(new T.CylinderGeometry(0.52, 0.52, 0.32, 10), SOL.tire);
      w.rotation.z = Math.PI / 2;
      w.position.set(sx, 0.52, wz);
      w.castShadow = true;
      g.add(w);
    });
    const cage = new T.Mesh(new T.BoxGeometry(2.2, 0.5, 1.1), dark);
    cage.position.set(0, 1.72, 0.95);
    g.add(cage);
    [-0.7, 0.7].forEach((sx) => {
      const hl = new T.Mesh(new T.BoxGeometry(0.34, 0.24, 0.06), SOL.lampWarm);
      hl.position.set(sx, 1.1, 2.96);
      g.add(hl);
    });
    g.position.set(x, 0.3, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }

  /* a small delivery truck, the kind parked all over Seoul. Its bed sits at
     the height the elevated posts have always stood at. */
  function makePorterTruck(S, x, z, rotY) {
    makeSol();
    const g = new T.Group();
    const cab = new T.Mesh(new T.BoxGeometry(1.9, 1.15, 1.9), SOL.truckWhite);
    cab.position.set(0, 1.0, 1.35);
    cab.castShadow = true;
    cab.userData.wall = 1;
    g.add(cab);
    const glass = new T.Mesh(new T.BoxGeometry(1.78, 0.5, 0.08), SOL.carGlass);
    glass.position.set(0, 1.3, 2.3);
    glass.rotation.x = 0.16;
    g.add(glass);
    const bed = new T.Mesh(new T.BoxGeometry(2.0, 0.22, 3.2), SOL.truckBlue);
    bed.position.set(0, 1.22, -0.95);
    g.add(bed);
    [-1, 1].forEach((s) => {
      const side = new T.Mesh(new T.BoxGeometry(0.12, 0.5, 3.2), SOL.truckBlue);
      side.position.set(s * 0.95, 1.55, -0.95);
      side.userData.wall = 1;
      g.add(side);
    });
    const tail = new T.Mesh(new T.BoxGeometry(2.0, 0.5, 0.12), SOL.truckBlue);
    tail.position.set(0, 1.55, -2.55);
    g.add(tail);
    const chassis = new T.Mesh(new T.BoxGeometry(1.9, 0.3, 4.4), SOL.metalDark);
    chassis.position.set(0, 0.72, 0);
    g.add(chassis);
    [-1.3, 1.35].forEach((wz) => {
      [-1, 1].forEach((sx) => {
        const w = new T.Mesh(new T.CylinderGeometry(0.38, 0.38, 0.26, 10), SOL.tire);
        w.rotation.z = Math.PI / 2;
        w.position.set(sx * 0.9, 0.38, wz);
        g.add(w);
      });
    });
    g.position.set(x, 0.3, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }


  let dress = null;


  /* ============================================================
     STAGE — a street plaza, a right turn into a narrow alley, a left
     turn into the fortress courtyard and the gate beyond it. The camera
     rides a spline, stops square in front of each combat zone, and the
     whole course is rebuilt from scratch on 작전 개시 / 다시 하기.
     ============================================================ */

  const ROLE = { weak: 1, throw: 1, tough: 1, hostage: 1, boss: 1 };
  function roleOf(kind) { return ROLE[kind] ? kind : "weak"; }
  function roleHp(role) { return role === "tough" ? 3 : role === "throw" ? 2 : role === "boss" ? 8 : 1; }
  function roleAim(role) { return role === "weak" ? 1.95 : role === "throw" ? 2.25 : role === "tough" ? 2.65 : role === "boss" ? 1.85 : 99; }
  function roleScale(role) { return role === "tough" || role === "boss" ? 1.5 : 1.28; }

  const CLOCK0 = 200;
  const CAM_Y = 1.68;
  const GATE_Z = 60.2;
  const YARD_MID = -39;

  /* camera rail: platform -> corner -> alley -> corner -> courtyard -> gate */
  const PATH_PTS = [
    [0, -10], [0, -4], [0, 2], [0, 8], [0, 14], [0, 17.4],
    [-1.4, 20.4], [-4.8, 23.0], [-10.2, 24.0], [-17, 24.0], [-24, 24.1],
    [-29.2, 25.3], [-33.4, 27.4], [-37.2, 30.8], [-39, 35.0], [-39, 42], [-39, 47]
  ];

  /* wave layout. lat = metres to the side, dep = metres down the zone's
     own forward axis, elev = platform height for elevated posts. */
  const WAVE_DEFS = [
    {
      id: 1, name: "plaza", hold: [0, 5.6], yaw: 0, look: [0, 1.45, 16.5], time: 26,
      picks: [[-5.0, 7.2, "ammo"], [5.2, 8.0, "supply"]],
      members: [
        { role: "weak", lat: -9.4, dep: 9.8, cover: "sandbag" },
        { role: "tough", lat: -5.2, dep: 12.2, cover: "barrier" },
        { role: "weak", lat: -0.6, dep: 10.6, cover: "crate" },
        { role: "throw", lat: 3.4, dep: 13.4, cover: "crate",
          run: { from: [3.0, 26.2], dur: 4.2, delay: 1.8 } },
        { role: "weak", lat: 8.2, dep: 10.3, elev: 1.05, cover: "truckbed",
          car: { path: [[0.6, 44], [0.9, 31], [2.6, 26.2], [7.0, 23.6]], speed: 5.4, delay: 0.4 } },
        { role: "hostage", lat: 5.4, dep: 15.2 }
      ]
    },
    {
      id: 2, name: "alley", hold: [-13.6, 24.0], yaw: -Math.PI / 2, look: [-22, 1.5, 24.0], time: 26,
      picks: [[-2.1, 5.6, "ammo"], [2.1, 6.4, "life"]],
      members: [
        { role: "weak", lat: -2.55, dep: 5.6, cover: "door" },
        { role: "weak", lat: 2.55, dep: 8.2, cover: "door" },
        { role: "throw", lat: -0.6, dep: 11.0, cover: "crates" },
        { role: "tough", lat: 2.5, dep: 13.0, cover: "door" },
        { role: "weak", lat: -2.4, dep: 9.4, elev: 3.05, cover: "rail" },
        { role: "hostage", lat: 1.4, dep: 15.0 }
      ]
    },
    {
      id: 3, name: "yard", hold: [-38.4, 31.2], yaw: 0, look: [YARD_MID, 1.5, 41.5], time: 28,
      picks: [[-5.0, 8.0, "ammo"], [5.0, 8.8, "ammo"]],
      members: [
        { role: "tough", lat: -7.2, dep: 9.0, cover: "sandbag" },
        { role: "weak", lat: -3.6, dep: 12.4, cover: "barrier" },
        { role: "throw", lat: 0.4, dep: 8.4, cover: "bunker" },
        { role: "weak", lat: 4.2, dep: 12.0, cover: "sandbag" },
        { role: "tough", lat: 7.0, dep: 9.6, cover: "crate" },
        { role: "weak", lat: -5.0, dep: 11.5, elev: 1.05, cover: "truckbed" },
        { role: "hostage", lat: 2.4, dep: 15.0 }
      ]
    },
    {
      id: 4, name: "gate", hold: [YARD_MID, 45.5], yaw: 0, look: [YARD_MID, 3.6, 55.5], time: 30,
      picks: [[-4.2, 5.4, "supply"], [4.4, 5.8, "life"]],
      members: [
        { role: "tough", lat: -7.4, dep: 4.6, cover: "barrier" },
        { role: "throw", lat: -3.0, dep: 6.6, cover: "crate" },
        { role: "weak", lat: 2.6, dep: 4.4, cover: "sandbag" },
        { role: "tough", lat: 7.0, dep: 6.4, cover: "barrier" }
      ]
    }
  ];

  const BOSS_DEF = {
    hold: [YARD_MID, 45.5], look: [YARD_MID, 1.7, 55.0],
    spots: [[-4.2, 10.4], [0, 9.6], [4.2, 10.4]]
  };

  /* ---------------- rail helpers ---------------- */
  let curve = null;
  let pathLen = 1;
  let pathU = 0;
  let bossHold = { x: YARD_MID, z: BOSS_DEF.hold[1] };
  let bossU = 0;

  function buildRail() {
    if (curve) return;
    const pts = PATH_PTS.map(([x, z]) => new T.Vector3(x, CAM_Y, z));
    curve = new T.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
    pathLen = Math.max(1, curve.getLength());
  }

  function uNear(x, z) {
    let bu = 0, bd = 1e9;
    for (let i = 0; i <= 260; i++) {
      const u = i / 260;
      const p = curve.getPointAt(u);
      const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
      if (d < bd) { bd = d; bu = u; }
    }
    return bu;
  }

  function pathAt(u) { return curve.getPointAt(Math.max(0, Math.min(1, u))); }

  /* camera.fov is the VERTICAL angle. A fixed ~58° on a portrait phone
     (aspect ~0.46) squeezes the horizontal cone down to ~30°, so the left and
     right enemies drop out of frame. On portrait screens hold the horizontal
     cone instead: vfov = 2·atan(tan(hfov/2) / aspect), clamped to 52..82 so a
     tall phone never turns into a fisheye. Landscape (aspect >= 1) keeps the
     old 58° and a nearly square window eases out of it instead of snapping. */
  const FOV_LAND = 58, FOV_MIN = 52, FOV_MAX = 82, FOV_KEEP_H = 76;
  function viewFov() {
    const asp = innerWidth / Math.max(1, innerHeight);
    if (asp >= 1) return FOV_LAND;
    const want = (2 * Math.atan(Math.tan((FOV_KEEP_H * Math.PI) / 360) / Math.max(0.2, asp)) * 180) / Math.PI;
    const v = Math.max(FOV_MIN, Math.min(FOV_MAX, want));
    const k = Math.min(1, (1 - asp) / 0.16);
    return FOV_LAND + (v - FOV_LAND) * k;
  }
  function halfTan() {
    const asp = innerWidth / Math.max(1, innerHeight);
    return Math.tan((viewFov() * Math.PI) / 360) * asp;
  }

  function waveXY(w, lat, dep) {
    const s = Math.sin(w.yaw), c = Math.cos(w.yaw);
    const lim = dep * (w.halfTan || halfTan()) * 0.72;
    const l = Math.max(-lim, Math.min(lim, lat));
    return { x: w.hold.x + s * dep + c * l, z: w.hold.z + c * dep - s * l };
  }

  /* ---------------- first person pistol ---------------- */
  function makePistol(camera) {
    makeSol();
    const g = new T.Group();
    /* two children: `aim` is everything from the shooting elbow out (gun,
       both hands, both forearms) and it turns around that elbow to aim;
       `body` is the upper arms, shoulders and vest, which stay on the torso.
       Split this way the barrel can swing with the aim without ever opening a
       gap at the shoulder or dragging the whole body across the screen. */
    const aim = new T.Group();
    const body = new T.Group();
    g.add(aim);
    g.add(body);
    const mk = (hex) => { const m = new T.MeshLambertMaterial({ color: hex }); m.color.convertSRGBToLinear(); return m; };
    // brushed steel body parts share one map so the grain lines up
    const smetal = metalTex("pistolSteel", 23);
    const mpoly = polymerTex("pistolPoly", 29);
    const mm = (hex, tex, rx, ry) => {
      const m = new T.MeshLambertMaterial({ color: hex, map: tex || null });
      if (tex) {
        const t = tex.clone();
        t.wrapS = t.wrapT = T.RepeatWrapping;
        t.repeat.set(rx || 1, ry || 1);
        t.anisotropy = Math.max(1, Math.min(8, MAXANISO));
        t.needsUpdate = true;
        m.map = t;
      }
      m.color.convertSRGBToLinear();
      return m;
    };
    const slide = mm(0x49525f, smetal, 1, 1.6);
    const slideDark = mm(0x333a45, smetal, 1, 1.6);
    const slideTop = mm(0x59636f, smetal, 1, 1.6);
    const poly = mm(0x22262c, mpoly, 2, 2);
    const bore = mk(0x07090b);
    const steel = mm(0x7f8792, smetal, 1, 1);
    const skin = mk(0xc08a5e);
    const gripMat = new T.MeshLambertMaterial({
      color: 0xffffff,
      map: (() => {
        const t = gripTex();
        const c2 = t.clone();
        // the grip box is 0.10 m wide by 0.24 m tall, so the tile is stretched
        // 2.4x vertically; repeating it keeps the checkering square
        c2.wrapS = c2.wrapT = T.RepeatWrapping;
        c2.repeat.set(1, 2.2);
        c2.anisotropy = Math.max(1, Math.min(8, MAXANISO));
        c2.needsUpdate = true;
        return c2;
      })()
    });
    gripMat.color.convertSRGBToLinear();
    const add = (w, h, d, x, y, z, mat) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      aim.add(m);
      return m;
    };

    // ---- polymer frame ----
    add(0.1, 0.075, 0.34, 0, -0.04, -0.14, poly);
    add(0.086, 0.05, 0.16, 0, -0.075, -0.29, poly);
    for (let i = 0; i < 3; i++) add(0.09, 0.012, 0.018, 0, -0.099, -0.24 - i * 0.04, slideDark);
    add(0.024, 0.024, 0.115, 0, -0.118, -0.1, poly);
    add(0.024, 0.02, 0.03, 0, -0.102, -0.155, poly);
    add(0.018, 0.055, 0.02, 0, -0.082, -0.072, steel);
    add(0.1, 0.24, 0.13, 0, -0.2, 0.02, gripMat);
    add(0.02, 0.24, 0.022, 0, -0.2, 0.088, poly);
    add(0.112, 0.03, 0.14, 0, -0.322, 0.02, slideDark);
    add(0.016, 0.03, 0.06, -0.056, 0.012, -0.02, steel);
    add(0.014, 0.022, 0.05, 0.055, 0.005, 0.0, steel);

    // ---- slide: two tones, bevel, serrations, ejection port ----
    add(0.11, 0.085, 0.4, 0, 0.062, -0.16, slide);
    add(0.086, 0.02, 0.38, 0, 0.109, -0.16, slideTop);
    add(0.112, 0.036, 0.4, 0, 0.012, -0.16, slideDark);
    for (let i = 0; i < 6; i++) {
      add(0.115, 0.062, 0.01, 0, 0.062, -0.02 - i * 0.022, slideDark);
      add(0.115, 0.062, 0.01, 0, 0.062, -0.29 - i * 0.022, slideDark);
    }
    add(0.019, 0.046, 0.105, 0.057, 0.075, -0.11, bore);
    add(0.008, 0.056, 0.125, 0.066, 0.075, -0.11, slideTop);
    add(0.012, 0.05, 0.02, -0.057, 0.07, -0.06, slideDark);
    add(0.03, 0.042, 0.03, 0, 0.105, 0.012, slideDark);
    // rear U-notch sight with white dots
    add(0.032, 0.036, 0.03, -0.034, 0.128, -0.335, slideDark);
    add(0.032, 0.036, 0.03, 0.034, 0.128, -0.335, slideDark);
    add(0.012, 0.012, 0.006, -0.034, 0.132, -0.318, mk(0xf2f6f2));
    add(0.012, 0.012, 0.006, 0.034, 0.132, -0.318, mk(0xf2f6f2));
    // front blade with a green dot
    add(0.024, 0.038, 0.028, 0, 0.132, -0.34, slideDark);
    add(0.014, 0.014, 0.006, 0, 0.136, -0.324, mk(0x9ad24a));
    // muzzle and bore
    add(0.062, 0.058, 0.03, 0, 0.062, -0.372, slideDark);
    add(0.028, 0.028, 0.02, 0, 0.062, -0.386, bore);

    // ---- two hands on the grip ----
    add(0.13, 0.12, 0.135, 0.012, -0.215, 0.055, skin);
    add(0.128, 0.032, 0.032, 0.008, -0.172, -0.028, skin);
    add(0.128, 0.032, 0.032, 0.008, -0.208, -0.028, skin);
    add(0.128, 0.032, 0.032, 0.008, -0.244, -0.028, skin);
    add(0.034, 0.085, 0.1, -0.062, -0.195, 0.03, skin);
    add(0.12, 0.1, 0.12, -0.085, -0.25, 0.03, skin);
    add(0.05, 0.05, 0.11, -0.03, -0.262, -0.015, skin);
    add(0.05, 0.05, 0.1, 0.01, -0.268, -0.01, skin);
    add(0.04, 0.07, 0.09, -0.115, -0.215, 0.02, skin);
    /* ---- arms: wrist → forearm → elbow → upper arm → shoulder ----
       The pistol hangs ~0.66 m in front of the eye and the whole rig is scaled
       to the viewport, so a portrait phone sees a long way below the grip. The
       sleeves are a jointed chain that runs out through the bottom and side
       edges of the frustum, so no cuff end can hang in the middle of the
       picture at any aspect ratio.
       Everything below the elbow (`aim`) turns with the pistol so the barrel
       really points where the player shoots. The upper arms, deltoids and vest
       (`body`) stay on the torso, and the right elbow is that turn's pivot, so
       the shooting shoulder can never come apart. */
    const camMap = camoTex("camo", ["#5c6b3c", "#47542e", "#6f7d4a", "#3b4527", "#7d7048"], 31);
    const camDark = camoTex("camoD", ["#424d2c", "#333d22", "#4f5a36", "#2a321c", "#5c5334"], 37);
    /* one cloth material per piece, with the tile repeated by real size so the
       camouflage blobs stay square along a long sleeve instead of streaking */
    const cloth = (tex, len, w, tint) => {
      const t = tex.clone();
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(Math.max(1, Math.round(w / 0.2)), Math.max(1, Math.round(len / 0.2)));
      t.anisotropy = Math.max(1, Math.min(8, MAXANISO));
      t.needsUpdate = true;
      const m = new T.MeshLambertMaterial({ color: tint || 0xffffff, map: t });
      m.color.convertSRGBToLinear();
      return m;
    };
    const strap = mm(0x4e4e48, mpoly, 1, 1);
    const UPY = new T.Vector3(0, 1, 0);
    /* sleeves are hexagonal prisms: a box read as a flat plank from above, a
       6-sided prism keeps the blocky look but rolls off like cloth on an arm */
    const seg = (host, a, b, rA, rB, tex, name, tint, sides) => {
      const A = new T.Vector3(a[0], a[1], a[2]);
      const B = new T.Vector3(b[0], b[1], b[2]);
      const len = Math.max(0.02, A.distanceTo(B));
      const m = new T.Mesh(new T.CylinderGeometry(rB, rA, len, sides || 6, 1),
                           cloth(tex, len, (rA + rB) * 2.2, tint));
      m.position.copy(A).add(B).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(UPY, B.clone().sub(A).normalize());
      if (name) { m.name = name; m.userData.armEnd = 1; }
      host.add(m);
      return m;
    };
    const pad = (host, x, y, z, w, h, d, mat) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      host.add(m);
      return m;
    };

    // right arm — the shooting hand; the elbow is the aim pivot
    add(0.126, 0.105, 0.15, 0.015, -0.29, 0.11, skin);                     // wrist
    seg(aim, [0.018, -0.3, 0.155], [0.03, -0.34, 0.215], 0.092, 0.1, camDark, null, 0xcfcfcf, 8);  // sleeve mouth
    seg(aim, [0.02, -0.345, 0.225], [0.132, -0.695, 0.405], 0.088, 0.105, camMap, null, 0xd2d2d2); // forearm
    seg(aim, [0.126, -0.68, 0.395], [0.142, -0.73, 0.425], 0.107, 0.115, camDark, null, 0xd0d0d0, 8); // elbow cuff

    // left arm — the support hand
    add(0.132, 0.105, 0.15, -0.1, -0.29, 0.07, skin);
    seg(aim, [-0.142, -0.3, 0.12], [-0.155, -0.34, 0.175], 0.092, 0.1, camDark, null, 0xcfcfcf, 8);
    seg(aim, [-0.158, -0.345, 0.185], [-0.362, -0.695, 0.398], 0.088, 0.105, camMap, null, 0xd2d2d2);
    seg(aim, [-0.356, -0.68, 0.388], [-0.372, -0.73, 0.418], 0.107, 0.115, camDark, null, 0xd0d0d0, 8);

    // upper arms stay on the torso; the right elbow is the pivot, so the right
    // one is fixed and only the left one has to be re-fitted each frame
    seg(body, [0.148, -0.72, 0.418], [0.30, -1.06, 0.78], 0.115, 0.138, camDark, null, 0xd8d8d8);
    pad(body, 0.325, -1.10, 0.82, 0.34, 0.32, 0.34, cloth(camDark, 0.34, 0.34));   // right deltoid
    const upperL = seg(body, [-0.372, -0.72, 0.412], [-0.575, -1.10, 0.78], 0.115, 0.138, camDark, null, 0xd8d8d8);
    upperL.userData.len = upperL.geometry.parameters.height;
    pad(body, -0.60, -1.13, 0.82, 0.33, 0.31, 0.33, cloth(camDark, 0.33, 0.33));   // left deltoid

    // shoulder yoke / vest top between the arms, so the two sleeves belong
    // to one body instead of floating up out of the dark
    pad(body, 0.0, -1.2, 0.9, 1.0, 0.28, 0.36, strap);
    pad(body, 0.0, -1.48, 0.88, 1.15, 0.36, 0.42, cloth(camDark, 0.4, 1.1));
    pad(body, -0.2, -1.66, 0.84, 0.3, 0.26, 0.3, strap);                   // chest pouches
    pad(body, 0.16, -1.64, 0.84, 0.26, 0.22, 0.26, strap);
    pad(body, 0.0, -1.95, 0.82, 1.32, 0.6, 0.46, cloth(camDark, 0.4, 1.3));
    seg(body, [0.34, -1.14, 0.84], [0.5, -1.88, 1.0], 0.158, 0.172, camDark, "R-arm-end", 0xc8c8c8);
    seg(body, [-0.62, -1.17, 0.84], [-0.84, -1.92, 0.98], 0.158, 0.172, camDark, "L-arm-end", 0xc8c8c8);

    const f = add(0.085, 0.085, 0.12, 0, 0.062, -0.44, new T.MeshBasicMaterial({ color: 0xfff3b0 }));
    f.visible = false;
    const halo = add(0.1, 0.1, 0.02, 0, 0.062, -0.42, new T.MeshBasicMaterial({ color: 0xffc14a, transparent: true, opacity: 0.8, depthWrite: false }));
    halo.visible = false;
    const flashLight = new T.PointLight(0xffc878, 0, 6, 2);
    flashLight.position.set(0, 0.06, -0.42);
    aim.add(flashLight);

    /* the barrel runs down -Z; `aim` is turned every frame so that axis goes
       through whatever the crosshair (or the last shot) is on. `g` only
       carries the position and the viewport scale. */
    g.position.set(0.2, -0.235, -0.66);
    g.rotation.set(0, 0, 0);
    g.scale.setScalar(0.4);
    aim.rotation.order = "YXZ";
    aim.rotation.set(0, 0, 0);
    camera.add(g);
    return { g, aim, body, upperL, flash: f, halo, light: flashLight };
  }

  function roleTag(el) {
    const d = document.createElement("div");
    d.className = "railThreat st0";
    d.innerHTML = '<div class="ring"></div><div class="ticks"></div><div class="spin"><i></i></div><b>!</b>';
    document.body.appendChild(d);
    el._tag = d;
    el._tagStage = -1;
    el._tagP = -1;
    el._tagDia = 0;
    return d;
  }

  /* ---------------- course dressing ---------------- */

  function darkMat(col) {
    const m = new T.MeshLambertMaterial({ color: col === undefined ? 0x14161a : col });
    m.color.convertSRGBToLinear();
    return m;
  }

  /* one stone/concrete tile covers about 2.4 m. A wall mesh whose box is
     much larger than that has to repeat the map, otherwise the tile is
     stretched into vertical streaks that read as planks instead of stone. */
  const TILED = {};
  function tiledMat(mat, w, h, tile) {
    if (!mat || !mat.map) return mat;
    const T2 = tile || 2.4;
    const rx = Math.max(1, Math.round(Math.max(1, w) / T2));
    const ry = Math.max(1, Math.round(Math.max(1, h) / T2));
    if (rx === 1 && ry === 1) return mat;
    // walls that share a repeat share one material (and one GPU texture)
    const k = (mat.uuid || "m") + "|" + rx + "x" + ry;
    if (TILED[k]) return TILED[k];
    const m = cloneMat(mat, rx, ry);
    m.color.copy(mat.color);
    TILED[k] = m;
    return m;
  }

  function blockAt(S, x0, x1, z0, z1, h, mat, y0) {
    const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0);
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), tiledMat(mat, Math.max(w, d), h));
    m.position.set((x0 + x1) / 2, (y0 === undefined ? 0.3 : y0) + h / 2, (z0 + z1) / 2);
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.wall = 1;
    S.add(m);
    return m;
  }

  function winRun(S, axis, fixed, a0, a1, y0, top, seed) {
    const mat = darkMat(0x14161a);
    const R = rng(seed || 5);
    for (let a = a0 + 1.5; a <= a1 - 1.2; a += 2.9) {
      for (let yy = y0; yy <= top; yy += 2.6) {
        if (R() < 0.16) continue;
        const wm = new T.Mesh(
          new T.BoxGeometry(axis === "x" ? 0.18 : 1.2, 1.1, axis === "x" ? 1.2 : 0.18),
          mat
        );
        if (axis === "x") wm.position.set(fixed, yy, a);
        else wm.position.set(a, yy, fixed);
        S.add(wm);
      }
    }
  }

  function roofCap(S, x0, x1, z0, z1, h) {
    const w = Math.abs(x1 - x0) + 0.5, d = Math.abs(z1 - z0) + 0.5;
    const m = new T.Mesh(new T.BoxGeometry(w, 0.42, d), SOL.stoneDark);
    m.position.set((x0 + x1) / 2, 0.3 + h + 0.21, (z0 + z1) / 2);
    m.castShadow = true;
    S.add(m);
    const r = rng((x0 * 13 + z0 * 7) | 0);
    for (let i = 0; i < 3; i++) {
      const b = new T.Mesh(new T.BoxGeometry(1.0 + r() * 1.4, 0.7 + r() * 0.8, 0.9 + r()), SOL.concrete);
      b.position.set(x0 + 2 + r() * Math.max(1, w - 4), 0.3 + h + 0.7, z0 + 2 + r() * Math.max(1, d - 4));
      b.castShadow = true;
      S.add(b);
    }
  }

  function doorway(S, x, z, rot, w, h) {
    const g = new T.Group();
    const rec = new T.Mesh(new T.BoxGeometry(w, h, 0.24), darkMat(0x0d1013));
    rec.position.y = h / 2;
    g.add(rec);
    const frame = new T.Mesh(new T.BoxGeometry(w + 0.34, 0.2, 0.34), SOL.stoneDark);
    frame.position.y = h + 0.06;
    g.add(frame);
    const step = new T.Mesh(new T.BoxGeometry(w + 0.5, 0.16, 0.55), SOL.concrete);
    step.position.set(0, 0.06, 0.2);
    g.add(step);
    g.position.set(x, 0.3, z);
    g.rotation.y = rot || 0;
    S.add(g);
    return g;
  }

  function balcony(S, x0, x1, zEdge, zWall, y) {
    const g = new T.Group();
    const d = Math.abs(zWall - zEdge);
    const floor = new T.Mesh(new T.BoxGeometry(Math.abs(x1 - x0), 0.22, d), SOL.concrete);
    floor.position.set((x0 + x1) / 2, y, (zEdge + zWall) / 2);
    floor.castShadow = true;
    floor.receiveShadow = true;
    S.add(floor);
    // parapet facing the alley
    const par = new T.Mesh(new T.BoxGeometry(Math.abs(x1 - x0), 0.95, 0.26), SOL.stone);
    par.position.set((x0 + x1) / 2, y + 0.475, zEdge);
    par.castShadow = true;
    par.userData.wall = 1;
    S.add(par);
    for (let x = x0 + 0.8; x < x1; x += 2.2) {
      const b = new T.Mesh(new T.BoxGeometry(0.3, 0.4, 0.34), SOL.stoneDark);
      b.position.set(x, y - 0.25, zEdge + 0.02);
      S.add(b);
    }
    return g;
  }

  function dressBattlefield(ctx) {
    makeSol();
    const S = new T.Group();
    S.name = "battlefield";
    ctx.scene.add(S);

    /* a bright Seoul morning: high blue sky, thin haze over the far end of
       the boulevard and warm sun from the south-west */
    const sky = makeSkyDome();
    sky.geometry.dispose();
    sky.geometry = new T.SphereGeometry(300, 24, 16);
    sky.position.set(0, 0, 10);
    S.add(sky);
    ctx.scene.background = new T.Color(0x9ed2f5).convertSRGBToLinear();
    ctx.scene.fog = new T.Fog(0xd3e4f2, 120, 420);
    if (ctx.scene.fog.color && ctx.scene.fog.color.convertSRGBToLinear) ctx.scene.fog.color.convertSRGBToLinear();
    if (ctx.LT) {
      const LT = ctx.LT;
      if (LT.hemi) { LT.hemi.intensity = 0.55; LT.hemi.color.setHex(0xdcefff); LT.hemi.groundColor && LT.hemi.groundColor.setHex(0x8a8578); }
      if (LT.amb) { LT.amb.intensity = 0.22; LT.amb.color && LT.amb.color.setHex(0xbfd6ea); }
      if (LT.key) { LT.key.intensity = 1.08; LT.key.color.setHex(0xfff6e0); }
      if (LT.moon) { LT.moon.intensity = 0.08; LT.moon.color && LT.moon.color.setHex(0xa8c4e6); }
      if (LT.rim) { LT.rim.intensity = 0.3; LT.rim.color && LT.rim.color.setHex(0xffd2a8); }
    }
    if (ctx.renderer) ctx.renderer.toneMappingExposure = 1.0;
    try {
      const caps = ctx.renderer && ctx.renderer.capabilities;
      if (caps && caps.getMaxAnisotropy) MAXANISO = Math.min(8, caps.getMaxAnisotropy() || 4);
      applyAniso();
    } catch (e) {}

    /* ---- ground: asphalt everywhere, so no hole can ever show ---- */
    const tex = asphaltTex("asphaltG", 17);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(36, 36);
    const ground = new T.Mesh(new T.PlaneGeometry(300, 300), new T.MeshLambertMaterial({ map: tex }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(-18, 0.24, 30);
    ground.receiveShadow = true;
    S.add(ground);

    /* sidewalks: 10 cm of raised pavers with a granite curb, along every
       frontage. They are only paint and kerb, so nothing to shoot through. */
    const walk = (x0, x1, z0, z1) => {
      const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0);
      const m = new T.Mesh(new T.BoxGeometry(w, 0.1, d), repMat(SOL.pave, w / 3.2, d / 3.2));
      m.position.set((x0 + x1) / 2, 0.35, (z0 + z1) / 2);
      m.receiveShadow = true;
      S.add(m);
      return m;
    };
    const curb = (x0, x1, z0, z1) => {
      const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0);
      const m = new T.Mesh(new T.BoxGeometry(w, 0.13, d), SOL.curb);
      m.position.set((x0 + x1) / 2, 0.37, (z0 + z1) / 2);
      S.add(m);
    };
    /* the boulevard's two sidewalks, then the alley's, then the yard's */
    walk(-13.6, -9.7, -22, 20.4);
    walk(9.7, 13.6, -22, 22);
    curb(-9.7, -9.45, -22, 20.4);
    curb(9.45, 9.7, -22, 22);
    walk(-30, -13, 20.4, 21.3);
    walk(-30, -13, 26.7, 27.6);
    curb(-30, -13, 21.3, 21.55);
    curb(-30, -13, 26.45, 26.7);
    walk(-46.6, -30, 30.6, 32.2);
    walk(-48, -46.6, 32.2, 18);
    walk(-48, -46.6, 32.2, 58);
    walk(-46.6, -30, 56.6, 58);
    walk(-30, -46.6, 32.2, 33.4);

    /* ---- road paint ---- */
    const paintBar = (x, z, w, d, mat) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, d), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.312, z);
      S.add(m);
      return m;
    };
    /* double yellow centre line, white lane dashes out at ±4.8 m */
    paintBar(-0.18, -2.2, 0.13, 38, SOL.paintYellow);
    paintBar(0.18, -2.2, 0.13, 38, SOL.paintYellow);
    [-4.8, 4.8].forEach((lx) => {
      for (let z = -20; z < 15; z += 6) paintBar(lx, z, 0.16, 3.2, SOL.paintWhite);
    });
    /* the crosswalk the player stands on at the start */
    for (let i = 0; i < 9; i++) paintBar(-8 + i * 2.0, 1.6, 0.55, 3.4, SOL.paintWhite);
    paintBar(0, -0.7, 18.8, 0.32, SOL.paintWhite);
    /* crosswalk just before the junction, and a stop line behind it */
    for (let i = 0; i < 9; i++) paintBar(-8 + i * 2.0, 18.0, 0.55, 3.6, SOL.paintWhite);
    paintBar(0, 15.9, 18.8, 0.35, SOL.paintWhite);
    /* crosswalk over the alley mouth */
    for (let i = 0; i < 6; i++) paintBar(-11.2, 21.6 + i * 1.0, 3.4, 0.5, SOL.paintWhite);
    paintBar(-13.9, 24.0, 0.35, 7.2, SOL.paintWhite);
    /* yard markings: a turning circle and bay lines */
    for (let i = 0; i < 4; i++) paintBar(-45.6 + i * 4.6, 34.4, 0.18, 3.4, SOL.paintWhite);

    /* ================= THE BOULEVARD (wave 1) ================= */
    /* west frontage: three buildings, the middle one carrying the flag */
    makeBlock(S, -30, -13, -22, -6, 11.5, { mat: SOL.facC, shop: "e", k: 0 });
    makeBlock(S, -30, -13, -6, 7, 8.6, { mat: SOL.facB, shop: "e", k: 2 });
    makeBlock(S, -30, -13, 7, 20.4, 10.2, { mat: SOL.facA, shop: "e", k: 4 });
    /* the alley face of that last block */
    streetFront(S, { x: -21.5, y: 0.3, z: 20.44, len: 16.4, ax: 0, az: 1, k: 6 });
    /* east frontage: a low block, the tower with the LED screen, another low one */
    makeBlock(S, 13, 24, -22, -7, 9.4, { mat: SOL.facB, shop: "w", k: 1 });
    makeBlock(S, 13, 24, -7, 9, 14.0, { mat: SOL.facC, shop: "w", k: 3 });
    makeBlock(S, 13, 24, 9, 22, 8.2, { mat: SOL.facA, shop: "w", k: 5 });
    /* what closes the street behind the player at the start */
    makeBlock(S, -14, 24, -26, -22, 9.0, { mat: SOL.facB });

    /* north side of the junction: two blocks with a boulevard between them
       that runs away to Sungnyemun */
    makeBlock(S, -13, -5, 27.6, 40, 10.6, { mat: SOL.facB, shop: "s", k: 2 });
    makeBlock(S, 5, 14, 27.6, 40, 8.4, { mat: SOL.facA, shop: "s", k: 7 });

    /* ================= THE ALLEY (wave 2) ================= */
    makeBlock(S, -30, -13, 27.6, 40, 8.8, { mat: SOL.facB, shop: "s", k: 1 });
    /* the scaffold the alley's elevated rifleman stands on */
    makeScaffold(S, -26.4, -19.8, 20.45, 22.15, 3.3);
    makeUtilityPole(S, -15.2, 21.0);
    makeUtilityPole(S, -27.0, 26.9);
    makeCone(S, -16.2, 22.4);
    makeCone(S, -24.4, 26.0);

    /* ================= THE YARD (waves 3-4) ================= */
    makeBlock(S, -30, -16, 40, 58, 9.6, { mat: SOL.facA, shop: "w", k: 3 });
    makeBlock(S, -58, -48, 22, 58, 8.8, { mat: SOL.facC, shop: "e", k: 0 });
    makeBlock(S, -48, -30, 8, 18, 6.4, { mat: SOL.facB, shop: "n", k: 5 });
    makeBlock(S, -48, -41, 18, 33, 7.4, { mat: SOL.facB, shop: "e", k: 6 });
    /* behind the gate, so the sky never shows through the arch either */
    makeBlock(S, -52, -26, 62, 76, 10.5, { mat: SOL.facB });

    /* ================= VISTA: the boulevard to Sungnyemun ================= */
    /* far city blocks line the road; they are only seen down the gap */
    [[7, 20, 41, 62, 12.5, SOL.facC], [-20, -7, 41, 64, 14.5, SOL.facB],
     [7, 22, 68, 86, 13.0, SOL.facB], [-22, -7, 68, 88, 12.0, SOL.facA],
     [10, 26, 94, 112, 16.0, SOL.facC], [-26, -9, 92, 112, 15.0, SOL.facB],
     [12, 30, 118, 136, 14.0, SOL.facA], [-30, -10, 116, 138, 12.0, SOL.facB]
    ].forEach(([x0, x1, z0, z1, h, mat]) => {
      const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0);
      const b = new T.Mesh(new T.BoxGeometry(w, h, d), repMat(mat, Math.max(w, d) / 6, h / 6.4));
      b.position.set((x0 + x1) / 2, 0.3 + h / 2, (z0 + z1) / 2);
      S.add(b);
    });
    /* the boulevard keep going: kerbs and a centre line to the gate */
    walk(5.0, 6.6, 28, 76);
    walk(-6.6, -5.0, 28, 76);
    for (let z = 30; z < 74; z += 7) paintBar(0, z, 0.22, 3.6, SOL.paintWhite);
    makeSungnyemunFar(S, 0, 80, 1.15);
    makeNamsan(S, 14, 176);

    /* ================= LANDMARKS ================= */
    /* the big flag on the west block, hung 6.5 m up and facing the road */
    const bigFlag = makeFlagPlane(S, "kr", 11.9, 5.5, 23.4, 4.6, 3.05, -2.55);
    bigFlag.name = "bigFlag";
    const fpole = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 4.4, 6), SOL.poleGray);
    fpole.position.set(11.9, 7.2, 23.4);
    fpole.rotation.z = Math.PI / 2;
    S.add(fpole);
    const fbase = new T.Mesh(new T.BoxGeometry(0.3, 0.9, 0.3), SOL.metalDark);
    fbase.position.set(13.0, 7.4, 23.4);
    S.add(fbase);
    /* a second, smaller one on the far block, across the junction */
    makeFlagPlane(S, "kr", -12.9, 7.6, 14.0, 4.2, 2.8, Math.PI / 2).name = "towerFlag";

    makeRoadSign(S, 4.6, 20.4, Math.PI).name = "roadSign";
    makeBillboard(S, -9.4, 7.3, 27.45, 7.0, 3.5, Math.PI).name = "billboard";

    /* street furniture along the boulevard */
    makeStreetLamp(S, -12.6, 3.0, 0);
    makeStreetLamp(S, 12.6, -4.0, Math.PI);
    makeStreetLamp(S, -12.6, 16.0, 0);
    makeTrafficLight(S, -10.6, 19.4, Math.PI / 2);
    makeTrafficLight(S, 10.6, 19.4, -Math.PI / 2);
    makePlanter(S, -12.4, 9.0, 1.8);
    makePlanter(S, 12.4, -9.0, 1.8);
    makeHydrant(S, -12.2, 6.2);
    makeCone(S, 3.4, 13.2);
    makeCone(S, -2.6, 11.0);

    /* trees on both sidewalks */
    [[-12.6, -8.0], [-12.6, 13.6], [12.6, 6.2], [12.6, 17.4], [-12.6, 22.4]].forEach(([x, z]) => {
      const tree = new T.Group();
      part(tree, 0.34, 2.4, 0.34, 0, 1.2, 0, SOL.woodDark);
      const leaf = new T.Mesh(new T.BoxGeometry(2.2, 1.5, 2.2), SOL.hedge);
      leaf.position.y = 3.0;
      leaf.castShadow = true;
      tree.add(leaf);
      const leaf2 = new T.Mesh(new T.BoxGeometry(1.5, 1.1, 1.5), SOL.hedge);
      leaf2.position.set(0.2, 3.9, -0.15);
      tree.add(leaf2);
      tree.position.set(x, 0.3, z);
      S.add(tree);
    });

    /* the parked bus and police car that frame the first firefight */
    makeCityBus(S, -11.6, 15.4, Math.PI / 2, "143").name = "bus143";
    makePoliceCar(S, 11.5, 9.4, -Math.PI / 2 + 0.03).name = "policeCar";
    makePoliceCar(S, -33.4, 50.6, Math.PI / 2 + 0.06);

    /* concrete barriers and cones dressing the kerbs */
    S.add(makeJersey(-9.1, 8.2, 2.4));
    S.add(makeJersey(-8.9, 21.0, 2.2));
    S.add(makeBarricade(9.1, 3.0, 2.0));
    S.add(makeSiteWall(-18.4, 21.9, 2.6, 1.45));
    makeCone(S, -9.0, 6.6);

    /* the gate the whole push is aimed at */
    const gateFlags = makeKoreanGate(S, YARD_MID, GATE_Z, { w: 17.6, h: 5.6, open: 5.2, d: 5.4 });

    /* a flagpole in the middle of the yard */
    const pole = new T.Mesh(new T.CylinderGeometry(0.09, 0.12, 9.0, 7), SOL.poleGray);
    pole.position.set(-43.4, 4.8, 36.0);
    pole.castShadow = true;
    S.add(pole);
    makeFlagPlane(S, "kr", -42.4, 8.4, 36.0, 2.4, 1.6, 0.5, false);

    /* the truck wave 1 stands on, and the one in the yard */

    if (waves && waves[2]) {
      const w = waves[2];
      const t = waveXY(w, -5.0, 11.5);
      makePorterTruck(S, t.x, t.z, w.yaw + 0.28);
    }

    /* exploding road drums, in every zone */
    const barrels = [];
    const drum = (x, z) => {
      const b = makeBarrel(x, z, 0.3);
      S.add(b);
      barrels.push({ mesh: b, x, z, y: 0.3, dead: false });
    };
    drum(6.9, 10.4); drum(-7.4, 13.9); drum(-25.8, 21.2);
    drum(-22.4, 26.6); drum(-34.6, 39.4); drum(-43.4, 33.0);
    drum(-32.6, 47.6);

    /* clouds follow the rail */
    const clouds = [];
    for (let i = 0; i < 8; i++) {
      const c = makeCloud(-130 + i * 36 + Math.random() * 10, 54 + Math.random() * 18, 100 + (i % 3) * 36 + Math.random() * 22, 5.5 + Math.random() * 2.4);
      c.scale.y = 0.34;
      S.add(c);
      clouds.push(c);
    }

    /* our rifleman, in Korean digital pixel camouflage */
    const ally = makeAlly();
    ally.position.set(-2.0, 0.3, 5.0);
    ally.rotation.y = 0.4;
    S.add(ally);

    const flags = [];
    S.traverse((o) => { if (o.userData && o.userData.cloth) flags.push(o); });
    gateFlags.forEach((f) => flags.push(f));

    dress = {
      root: S, sky, flags, clouds, barrels, ally,
      truck1: null
    };
    return dress;
  }

  /* ---------------- cover props ---------------- */

  function coverHeight(kind) {
    if (kind === "barrier") return 1.02;
    if (kind === "crate") return 1.30;
    if (kind === "crates") return 1.44;
    if (kind === "bunker") return 1.42;
    if (kind === "door") return 1.62;
    if (kind === "heavy") return 1.46;
    if (kind === "truckbed") return 1.10;
    return 1.10;
  }

  /* Where a post's cover stands. The player looks at a post from the wave's
     hold point, and for a side post that line is up to 60° off the zone's
     forward axis, so a cover placed on the zone axis ended up beside the man
     from where the camera really is - he stood in the open and nothing in
     front of him. So the cover goes on the hold -> man line instead, turned
     to face the camera, and the man peeks out along the camera's right. */
  function coverPlace(w, m, i) {
    const role = roleOf(m.role);
    const p = waveXY(w, m.lat || 0, m.dep || 8);
    const hx = (w.hold && w.hold.x) || 0;
    const hz = (w.hold && w.hold.z) || 0;
    let dx = p.x - hx, dz = p.z - hz;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d; dz /= d;
    const side = i % 2 ? 1 : -1;
    return {
      x: p.x, z: p.z, elev: m.elev || 0,
      cx: p.x - dx * 0.95 - dz * side * 0.14,
      cz: p.z - dz * 0.95 + dx * side * 0.14,
      yaw: Math.atan2(dx, dz),
      cover: m.cover || "sandbag",
      coverSide: side,
      scale: roleScale(role)
    };
  }

  /* builds one cover prop and records its real top and centre, so the man
     behind it can be ducked to exactly that height (a table of nominal
     heights never matched the props: the sandbags stand 0.99 m, the doorway
     1.65 m, and the old numbers let a head and both shoulders stick out) */
  function buildCover(p, w) {
    const cx = p.cx, cz = p.cz;
    const baseY = p.elev || 0.3;
    const wide = Math.min(1.5, (p.scale || 1.28) / 1.28);
    let g = null;
    switch (p.cover) {
      case "sandbag": g = makeJersey(cx, cz, 2.2 * wide); break;
      case "crate": g = makeBarricade(cx, cz, 1.9 * wide); break;
      case "crates": g = makeConcreteStack(cx, cz, 1.15 * wide); break;
      case "barrier": g = makeJersey(cx, cz, 1.7 * wide); break;
      case "bunker": {
        g = new T.Group();
        g.add(makeJersey(0, 0, 3.2 * wide));
        g.add(makeConcreteStack(1.05, 0.18, 1.0 * wide));
        const extra = makeJersey(-1.2, 0.05, 1.2);
        extra.rotation.y = 0.08;
        g.add(extra);
        g.position.set(cx, baseY, cz);
        break;
      }
      case "door": g = makeSiteWall(cx, cz, 2.6 * wide, 1.45); break;
      case "truckbed": g = makeJersey(cx, cz, 1.9 * wide); break;
      case "heavy": {
        g = new T.Group();
        part(g, 2.7, 1.0, 0.56, 0, 0.5, 0, SOL.barrier);
        part(g, 2.8, 0.16, 0.64, 0, 1.06, 0, SOL.siteWallCap);
        [-0.9, 0.9].forEach((px) => {
          const b = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.9, 8), SOL.metalDark);
          b.position.set(px, 0.45, 0.4);
          g.add(b);
        });
        g.position.set(cx, baseY, cz);
        break;
      }
      case "rail": return null;
      default: g = makeJersey(cx, cz, 2.2 * wide); break;
    }
    if (!g) return null;
    g.position.y = baseY;
    g.rotation.y = p.yaw != null ? p.yaw : (w ? w.yaw : 0);
    g.userData.cover = 1;
    (coverTarget || coverRoot).add(g);
    g.updateMatrixWorld(true);
    const bb = new T.Box3().setFromObject(g);
    g.userData.topY = bb.max.y;
    g.userData.centerX = (bb.min.x + bb.max.x) / 2;
    g.userData.centerZ = (bb.min.z + bb.max.z) / 2;
    return g;
  }

  /* every wave's cover is built with the course, before the first frame, so a
     man is never seen standing in an empty street waiting for his sandbags to
     appear when his wave starts */
  function prebuildCovers() {
    coverGroups = [];
    waves.forEach((w) => {
      w.coverGroup = new T.Group();
      w.coverGroup.name = "covers-w" + w.i;
      coverRoot.add(w.coverGroup);
      coverTarget = w.coverGroup;
      w.covers = w.def.members.map((m, i) => {
        if (roleOf(m.role) === "hostage" || !m.cover || m.car) return null;
        let g = null;
        try { g = buildCover(coverPlace(w, m, i), w); } catch (e) { window.__coverErr = String(e && e.stack || e); }
        return g;
      });
      coverGroups.push({ u: w.u, g: w.coverGroup });
    });
    const bg = new T.Group();
    bg.name = "covers-boss";
    coverRoot.add(bg);
    coverTarget = bg;
    bossCovers = BOSS_DEF.spots.map((s, i) => {
      let g = null;
      try {
        g = buildCover(coverPlace({ yaw: 0, hold: bossHold }, { role: "boss", lat: s[0], dep: s[1], cover: "heavy" }, i), { yaw: 0 });
      } catch (e) {}
      return g;
    });
    coverGroups.push({ u: bossU, g: bg });
    coverTarget = null;
  }

  /* ---------------- waves ---------------- */

  let coverRoot = null;
  let coverTarget = null;
  let coverGroups = [];

  function buildWaves() {
    buildRail();
    waves.length = 0;
    WAVE_DEFS.forEach((def, i) => {
      const u = uNear(def.hold[0], def.hold[1]);
      const p = curve.getPointAt(u);
      waves.push({
        i, def, u, hold: { x: p.x, z: p.z }, yaw: def.yaw, halfTan: halfTan(),
        look: { x: def.look[0], y: def.look[1], z: def.look[2] }
      });
    });
    const bu = uNear(BOSS_DEF.hold[0], BOSS_DEF.hold[1]);
    const bp = curve.getPointAt(bu);
    bossU = bu;
    bossHold = { x: bp.x, z: bp.z };
  }

  function buildBoss(ctx) { /* the commander is spawned by startBoss() */ bossPost = null; }

  function buildPickups(ctx) {
    const lane = [];
    waves.forEach((w, i) => {
      const def = w.def;
      (def.picks || []).forEach(([lat, dep, kind]) => {
        const p = waveXY(w, lat, dep);
        lane.push({ x: p.x, y: 1.3, z: p.z, kind });
      });
    });
    lane.forEach((spot) => {
      let mesh = null;
      try { mesh = makePickup(spot.kind); } catch (err) { window.__pickupErr = String(err && err.message || err); }
      if (!mesh) mesh = new T.Mesh(new T.BoxGeometry(0.5, 0.4, 0.4), new T.MeshLambertMaterial({ color: 0x6b7a45 }));
      mesh.position.set(spot.x, spot.y, spot.z);
      mesh.userData.bob = Math.random() * 6;
      ctx.scene.add(mesh);
      pickups.push({ mesh, kind: spot.kind, taken: false, y: spot.y });
    });
  }

  function disposeGeo(obj) {
    if (!obj) return;
    obj.traverse((o) => {
      if (o.geometry && o.geometry.dispose) { try { o.geometry.dispose(); } catch (e) {} }
    });
  }

  function tagOff(p) {
    if (p.e && p.e._tag) { p.e._tag.remove(); p.e._tag = null; }
    if (p.glint) { p.glint.parent && p.glint.parent.remove(p.glint); p.glint = null; }
  }

  function clearStage(ctx) {
    posts.forEach((p) => {
      if (p.mesh) { p.mesh.parent && p.mesh.parent.remove(p.mesh); disposeGeo(p.mesh); }
      tagOff(p);
    });
    posts.length = 0;
    shots3.forEach((s) => { if (s.mesh && s.mesh.parent) s.mesh.parent.remove(s.mesh); });
    shots3 = [];
    tracers.forEach((s) => { if (s.mesh && s.mesh.parent) s.mesh.parent.remove(s.mesh); });
    tracers = [];
    pickups.forEach((p) => { if (p.mesh) { p.mesh.parent && p.mesh.parent.remove(p.mesh); disposeGeo(p.mesh); } });
    pickups = [];
    if (coverRoot) { coverRoot.parent && coverRoot.parent.remove(coverRoot); disposeGeo(coverRoot); coverRoot = null; }
    if (bossPost) { tagOff(bossPost); bossPost = null; }
    sparks.forEach((s) => s.parent && s.parent.remove(s));
    sparks = [];
    smokes.forEach((s) => s.parent && s.parent.remove(s));
    smokes = [];
    if (dress && dress.root) {
      dress.root.parent && dress.root.parent.remove(dress.root);
      disposeGeo(dress.root);
    }
    dress = null;
    wave = null;
    waveT = 0;
    bossStage = null;
    bossCovers = [];
    coverGroups = [];
    coverTarget = null;
    wallList = [];
    waves.forEach((w) => { w.staged = null; w.covers = null; });
  }

  function showHud(on) {
    if (hud) hud.style.display = on ? "" : "none";
    const xh = document.getElementById("railX");
    if (xh) xh.style.display = on ? "" : "none";
    const rb = document.getElementById("railReload");
    if (rb) rb.style.display = on ? "" : "none";
  }

  function resetNumbers(ctx) {
    clock = CLOCK0; bullets = 20; hp = 100; lives = 3;
    combo = 0; bestCombo = 0; shotsFired = 0; shotsHit = 0; hostageHits = 0;
    lastShot = 0; reloading = false; reloadK = 0; recoil = 0; hitStop = 0; shake = 0;
    pathU = 0; camX = 0; waveI = 0; wave = null; waveT = 0; waveClean = true; ended = false;
    bossSpawned = false;
    window.__allyShots = 0;
    aimN = { x: 0, y: 0.1 };
    if (ctx && ctx.G) ctx.G.score = 0;
    if (hud) hud._score = 0;
  }

  function boot(ctx) {
    booted = true;
    css();
    document.documentElement.classList.add("rail-on");
    if (ctx.scene && ctx.camera && !ctx.camera.parent) ctx.scene.add(ctx.camera);
    const rig = makePistol(ctx.camera);
    pistol = rig.g;
    pistolAim = rig.aim;
    pistolBody = rig.body;
    pistolUpperL = rig.upperL;
    /* the pistol, hands and forearms turn around the right elbow, so the
       shooting shoulder never opens up however far the aim swings */
    pistolPivot = new T.Vector3(0.134, -0.705, 0.41);
    gunQ.set(0, 0, 0, 1);
    pistolBase = { x: rig.g.position.x, y: rig.g.position.y, z: rig.g.position.z };
    flash = rig.flash;
    flashHalo = rig.halo;
    flashLight = rig.light;
    window.__pistol = pistol;
    /* model factory hooks (handy for eyeballing the cast without playing) */
    window.__mk = { soldier: makeSoldier, ally: makeAlly, rifle: makeRifle };
    window.__pistolAim = pistolAim;
    window.__pistolBody = pistolBody;
    const btn = document.createElement("button");
    btn.id = "railReload";
    btn.type = "button";
    btn.textContent = "R";
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); window.RAIL.reload(); });
    document.body.appendChild(btn);
    if (!window.__railKeys) {
      window.__railKeys = 1;
      const aimAt = (e) => { if (e) pointerFrom(e); };
      addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") aimAt(e); });
      const shootAt = (e) => {
        if (!active || ended) return;
        if (e.target && (e.target.id === "railReload" || e.target.closest && e.target.closest("#railResult,#mgTitle"))) return;
        if (e.button === 2) { window.RAIL.reload(); return; }
        if (e.button != null && e.button !== 0) return;
        aimAt(e);
        window.__lastXY = [e.clientX, e.clientY, e.type];
        window.RAIL.fire();
      };
      addEventListener("pointerdown", shootAt);
      addEventListener("mousedown", shootAt);
      addEventListener("contextmenu", (e) => { if (armed) e.preventDefault(); });
      addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable)) return;
        const isR = e.code === "KeyR" || (e.key || "").toLowerCase() === "r" || e.key === "ㄱ"
          || e.code === "Space" || e.key === " " || e.key === "Spacebar";
        if (!isR) return;
        /* hold-R repeats are one reload, and R must not reach the browser's
           own shortcuts (Ctrl+R is filtered above; this keeps the page still) */
        e.preventDefault();
        if (e.repeat) return;
        window.RAIL.reload();
      });
    }
    if (ctx.pl) ctx.pl.inv = 99999;
  }

  function begin(ctx) {
    if (!ctx || !ctx.scene || !ctx.camera) return false;
    // pick the GPU's anisotropic limit before any texture is painted
    try {
      const caps = ctx.renderer && ctx.renderer.capabilities;
      if (caps && caps.getMaxAnisotropy) MAXANISO = Math.min(8, caps.getMaxAnisotropy() || 4);
      applyAniso();
    } catch (e) {}
    if (!booted) boot(ctx);
    SCENE = ctx.scene;
    clearStage(ctx);
    resetNumbers(ctx);
    buildWaves();
    coverRoot = new T.Group();
    coverRoot.name = "covers";
    ctx.scene.add(coverRoot);
    /* every zone's sandbags, crates and doorways are part of the course from
       the start: nothing the enemy hides behind may appear after he does */
    try { prebuildCovers(); } catch (err) { window.__coverErr = String(err && err.stack || err); }
    buildPickups(ctx);
    try { dressBattlefield(ctx); } catch (err) { window.__dressErr = String(err && err.stack || err); }
    /* walls, for stopping bullets */
    wallList = [];
    try {
      if (dress && dress.root) dress.root.traverse((o) => { if (o.isMesh && o.userData && o.userData.wall) wallList.push(o); });
    } catch (e) {}
    try { rebuildWallBoxes(); } catch (err) { window.__wallErr = String(err && err.stack || err); }
    try { stageWave(waves[0]); } catch (err) { window.__stageErr = String(err && err.stack || err); }
    const cam = ctx.camera;
    cam.near = 0.06; cam.fov = viewFov(); cam.far = 320;
    const p0 = pathAt(0);
    cam.position.set(p0.x, CAM_Y, p0.z);
    const a0 = pathAt(7 / pathLen);
    cam.lookAt(a0.x, 1.45, a0.z);
    cam.updateProjectionMatrix();
    lookSmooth.set(a0.x, 1.45, a0.z);
    phase = "move";
    active = true;
    staged = true;
    t0 = performance.now();
    frame._t = 0;
    if (pistol) pistol.visible = true;
    const box = document.getElementById("railResult");
    if (box) box.remove();
    showHud(true);
    ensureHud(0);
    drawHud();
    try { window.GunSFX && window.GunSFX.bgm(true, false); } catch (e) {}
    window.__railPhase = phase;
    return true;
  }

  function pause() {
    active = false;
    showHud(false);
    if (pistol) pistol.visible = false;
    const box = document.getElementById("railResult");
    if (box) box.remove();
    posts.forEach((p) => tagOff(p));
    if (bossPost) tagOff(bossPost);
    try { window.GunSFX && window.GunSFX.bgm(false); } catch (e) {}
  }

  function pointerFrom(e) {
    const x = e.clientX, y = e.clientY;
    aimN.x = (x / innerWidth) * 2 - 1;
    aimN.y = -(y / innerHeight) * 2 + 1;
    const xh = document.getElementById("railX");
    if (xh) { xh.style.left = x + "px"; xh.style.top = y + "px"; }
  }

  /* ---------------- enemy posts ---------------- */

  /* One man at his post. `live` is false while he is only staged: the next
     zone's men are planted as soon as the previous wave is cleared, so they
     are already standing behind sandbags that have been there since the start
     instead of popping into an empty street when the camera arrives. */
  function makePost(w, m, i) {
    const role = roleOf(m.role);
    const p = waveXY(w, m.lat || 0, m.dep || 8);
    const sc = roleScale(role);
    let sx = p.x, sz = p.z;
    if (wallBoxes.length) {
      const free = pushOutOfWalls(sx, sz, 0.4);
      if (free.x !== sx || free.z !== sz) {
        window.__postWallNudge = (window.__postWallNudge || 0) + 1;
        sz = free.z;
        sx = free.x;
      }
    }
    const post = {
      e: { kind: role, mesh: new T.Object3D(), alive: true, hp: roleHp(role), h: 1.4 * sc, _tag: null },
      role, i,
      x: sx, z: sz, y: (m.elev || 0) + 0.3,
      elev: m.elev || 0,
      cover: m.cover || "sandbag",
      coverSide: i % 2 ? 1 : -1,
      peekDir: i % 2 ? 1 : -1,
      scale: sc,
      headTop: 1.67 * sc,
      expose: 0, live: false,
      state: role === "hostage" ? "civ" : "hidden",
      stateT: 0.7 + i * 0.42 + Math.random() * 0.7,
      aimMax: roleAim(role), aim: roleAim(role),
      fireMax: 1.5 + Math.random() * 0.7,
      hideMin: 0.55 + Math.random() * 0.7,
      nextThrow: 0.8,
      bob: Math.random() * 6, breath: Math.random() * 6,
      knock: 0, recoil: 0, armK: 0, shotT: 0, burstN: 0, glint: null,
      hideFrac: 0.4, peekX: 0
    };
    let sm = null;
    try { sm = makeSoldier(role); } catch (err) { window.__soldierErr = String(err && err.message || err); }
    if (sm && SCENE) {
      sm.position.set(post.x, post.y, post.z);
      SCENE.add(sm);
      post.mesh = sm;
      post.body = sm.userData.body || sm;
      sm.updateMatrixWorld(true);
      /* the height of this very model, helmet and all, so ducking behind
         cover can be solved from geometry instead of a guessed table */
      const bb = new T.Box3().setFromObject(sm);
      post.headTop = Math.max(1.1, bb.max.y - post.y);
    } else {
      post.mesh = null;
    }
    posts.push(post);
    if (role === "hostage") {
      post.expose = 1;
    } else {
      post.coverG = w && w.covers ? w.covers[i] : null;
      if (!post.coverG) {
        let g = null;
        try { g = buildCover(coverPlace(w, m, i), w); } catch (e) {}
        post.coverG = g;
      }
      /* if he had to be nudged off a wall, his cover goes with him */
      const ndx = sx - p.x, ndz = sz - p.z;
      if (post.coverG && (ndx || ndz)) {
        post.coverG.position.x += ndx;
        post.coverG.position.z += ndz;
        if (post.coverG.userData.centerX !== undefined) {
          post.coverG.userData.centerX += ndx;
          post.coverG.userData.centerZ += ndz;
        }
      }
      if (post.coverG && post.coverG.userData.topY !== undefined) {
        post.coverTop = post.coverG.userData.topY;
        post.coverCX = post.coverG.userData.centerX;
        post.coverCZ = post.coverG.userData.centerZ;
      } else {
        /* the alley balcony has no prop of its own: its parapet is the cover */
        post.coverTop = post.y + 0.62;
        post.coverCX = post.x;
        post.coverCZ = post.z - 0.95;
      }
      roleTag(post.e);
      if (post.e._tag) post.e._tag.style.display = "none";
    }
    post.coverTopSaved = post.coverTop;
    if (m.car) {
      try {
        const c0 = m.car;
        const truck = makeArmyTruck(SCENE, c0.path[0][0], c0.path[0][1], 0);
        truck.traverse((o) => { if (o.isMesh && o.userData && o.userData.wall) wallList.push(o); });
        post.car = { g: truck, path: c0.path, speed: c0.speed || 5, delay: c0.delay || 0, seg: 0, t: 0, moving: true };
        post.y = 1.38;
        post.coverTop = 1.66;
        post.coverCX = c0.path[0][0];
        post.coverCZ = c0.path[0][1];
        post.x = c0.path[0][0];
        post.z = c0.path[0][1] - 1.0;
        post.mesh.position.set(post.x, post.y, post.z);
      } catch (err) { window.__carErr = String(err && err.stack || err); }
    }
    if (m.run) {
      post.run = { from: m.run.from, dest: [post.x, post.z], dur: m.run.dur || 3.5, delay: m.run.delay || 0 };
      post.runT = -(m.run.delay || 0);
      post.runPhase = 0;
    }
    posePost(post, { x: (w && w.hold && w.hold.x) || 0, y: CAM_Y, z: (w && w.hold && w.hold.z) || 0 }, 0);
    return post;
  }

  /* plant a wave's men without starting their fight */
  function stageWave(w) {
    if (!w || w.staged) return;
    w.staged = w.def.members.map((m, i) => makePost(w, m, i));
  }

  function startWave(w) {
    stageWave(w);
    phase = "fight";
    wave = w;
    waveT = w.def.time || 24;
    waveClean = true;
    curHold = { x: w.hold.x, z: w.hold.z };
    curLook = { x: w.look.x, y: w.look.y, z: w.look.z };
    pathU = w.u;
    w.staged.forEach((p, i) => {
      p.live = true;
      p.state = p.role === "hostage" ? "civ" : "hidden";
      p.stateT = 0.7 + i * 0.42 + Math.random() * 0.7 + i * 0.12;
      p.expose = p.role === "hostage" ? 1 : 0;
      p.aim = p.aimMax;
      p.burstN = 0;
      p.recoil = 0;
    });
    window.__railPhase = "fight";
  }

  /* the commander, staged the same way, behind whichever heavy barrier of the
     yard he starts from */
  function stageBoss() {
    if (bossStage) return bossStage;
    const w = { yaw: 0, hold: bossHold, covers: bossCovers };
    const spot = BOSS_DEF.spots[1];
    const post = makePost(w, { role: "boss", lat: spot[0], dep: spot[1], cover: "heavy" }, 1);
    post.isBoss = true;
    post.state = "hidden";
    post.spotI = 1;
    post.coverG = bossCovers[1];
    if (post.coverG && post.coverG.userData.topY !== undefined) {
      post.coverTop = post.coverG.userData.topY;
      post.coverCX = post.coverG.userData.centerX;
      post.coverCZ = post.coverG.userData.centerZ;
    }
    bossPost = post;
    bossStage = post;
    return post;
  }

  function startBoss(ctx) {
    const post = stageBoss();
    phase = "boss";
    bossSpawned = true;
    waveT = 40;
    waveClean = true;
    curHold = { x: bossHold.x, z: bossHold.z };
    curLook = { x: BOSS_DEF.look[0], y: BOSS_DEF.look[1], z: BOSS_DEF.look[2] };
    pathU = bossU;
    if (post) {
      post.live = true;
      post.state = "hidden";
      post.stateT = 1.2;
      post.expose = 0;
      post.aim = post.aimMax;
    }
    window.__railPhase = "boss";
  }

  function livingHostiles() {
    return posts.filter((p) => p.live !== false && p.e.alive !== false && p.role !== "hostage");
  }

  function exposedHostiles() {
    return posts.filter((p) => p.live !== false && p.e.alive !== false && p.role !== "hostage" && p.expose > 0.45);
  }

  /* everything a bullet can be stopped by between the muzzle and a man: the
     cover props this round, and the walls of the course */
  function occluders() {
    const out = [];
    if (coverRoot) out.push(coverRoot);
    for (let i = 0; i < wallList.length; i++) out.push(wallList[i]);
    return out;
  }

  /* ---- walking colliders: nobody may walk through a wall or a barrier ----
     Every tagged wall mesh plus every cover prop is reduced to a world AABB
     once per stage build. A character is pushed out of any box that stands in
     his way (waist-high or taller), along the shallowest axis, which reads as
     sliding along the wall instead of passing through it. */
  let wallBoxes = [];
  function rebuildWallBoxes() {
    wallBoxes = [];
    const roots = [];
    if (coverRoot) roots.push(coverRoot);
    for (let i = 0; i < wallList.length; i++) roots.push(wallList[i]);
    roots.forEach((root) => {
      try { root.updateMatrixWorld(true); } catch (e) {}
      root.traverse((o) => {
        if (!o.isMesh || !o.geometry) return;
        let bb = null;
        try { bb = new T.Box3().setFromObject(o); } catch (e) { return; }
        if (!isFinite(bb.min.x) || !isFinite(bb.max.x)) return;
        const sx = bb.max.x - bb.min.x, sy = bb.max.y - bb.min.y, sz = bb.max.z - bb.min.z;
        if (sy < 0.45) return;                         // kerbs, paint, road sheets
        if (sx < 0.12 && sz < 0.12) return;            // thin poles, aerials
        if (sx > 60 || sz > 60) return;                // whole-block backdrops
        wallBoxes.push(bb);
      });
    });
    window.__wallBoxes = wallBoxes.length;
  }

  /* push a standing character out of every wall he overlaps */
  function pushOutOfWalls(x, z, r) {
    for (let k = 0; k < 3; k++) {
      let moved = false;
      for (let i = 0; i < wallBoxes.length; i++) {
        const b = wallBoxes[i];
        if (b.max.y < 0.5 || b.min.y > 2.1) continue;
        if (x < b.min.x - r || x > b.max.x + r || z < b.min.z - r || z > b.max.z + r) continue;
        const dxl = x - (b.min.x - r), dxr = (b.max.x + r) - x;
        const dzl = z - (b.min.z - r), dzr = (b.max.z + r) - z;
        const m = Math.min(dxl, dxr, dzl, dzr);
        if (m === dxl) x = b.min.x - r - 0.02;
        else if (m === dxr) x = b.max.x + r + 0.02;
        else if (m === dzl) z = b.min.z - r - 0.02;
        else z = b.max.z + r + 0.02;
        moved = true;
      }
      if (!moved) break;
    }
    return { x, z };
  }

  /* is a point inside any wall box? (verification hook) */
  function insideWall(x, z, r) {
    for (let i = 0; i < wallBoxes.length; i++) {
      const b = wallBoxes[i];
      if (b.max.y < 0.5 || b.min.y > 2.1) continue;
      if (x > b.min.x - r && x < b.max.x + r && z > b.min.z - r && z < b.max.z + r) return true;
    }
    return false;
  }

  /* was this point hidden behind cover or wall from the camera? */
  function blockedFromCamera(pt, cam) {
    const dir = new T.Vector3().subVectors(pt, cam);
    const d = dir.length();
    if (d < 0.05) return false;
    dir.normalize();
    const rc = new T.Raycaster(cam.clone(), dir, 0.05, d - 0.03);
    try { return rc.intersectObjects(occluders(), true).length > 0; } catch (e) { return false; }
  }

  function endWave(ctx) {
    if (waveClean) addPts(ctx, 500);
    posts.forEach((p) => {
      if (p.mesh) { p.mesh.parent && p.mesh.parent.remove(p.mesh); }
      tagOff(p);
    });
    posts.length = 0;
    bossPost = null;
    shots3.forEach((s) => s.mesh && s.mesh.parent && s.mesh.parent.remove(s.mesh));
    shots3 = [];
    tracers.forEach((s) => s.mesh && s.mesh.parent && s.mesh.parent.remove(s.mesh));
    tracers = [];
    /* the covers stay where they are: they are scenery now, and the next
       zone's men already stand behind their own */
    if (bossPost) { bossPost = null; }
    bossStage = null;
    wave = null;
    if (phase === "fight") waveI++;
    phase = waveI < waves.length ? "move" : "toBoss";
    try {
      if (waveI < waves.length) stageWave(waves[waveI]);
      else stageBoss();
    } catch (err) { window.__stageErr = String(err && err.stack || err); }
    window.__railPhase = phase;
  }

  function addPts(ctx, n) {
    if (ctx.addScore) ctx.addScore(n, window.__lastHitPx || null);
    else if (ctx.G) ctx.G.score = (ctx.G.score || 0) + n;
  }

  function hurtPlayer(ctx, dmg) {
    if (ended || window.__railGod) return;
    hp -= dmg;
    shake = 0.7;
    flashScreen(0.6, "radial-gradient(circle at 50% 50%,rgba(255,90,70,.75),rgba(180,20,20,.35) 60%,rgba(120,0,0,0) 85%)");
    waveClean = false;
    combo = 0;
    try { ctx.snd && ctx.snd("hurt"); } catch (e) {}
    if (hp <= 0) {
      lives--;
      hp = 100;
      if (lives <= 0) finish(ctx, false);
    }
  }

  function finish(ctx, cleared) {
    if (ended) return;
    ended = true;
    active = false;
    try { window.GunSFX && window.GunSFX.bgm(false); } catch (e) {}
    phase = "result";
    window.__railPhase = "result";
    const acc = shotsFired ? shotsHit / shotsFired : 0;
    const got = pickups.filter((p) => p.taken).length;
    const tot = pickups.length;
    const s1 = !!cleared;
    const s2 = tot === 0 || got / tot >= 0.6;
    const s3 = lives >= 3;
    const stars = "★".repeat([s1, s2, s3].filter(Boolean).length) + "☆".repeat(3 - [s1, s2, s3].filter(Boolean).length);
    const ko = (document.documentElement.lang || "").startsWith("ko");
    const box = document.createElement("div");
    box.id = "railResult";
    box.className = "show";
    box.innerHTML = "<div class=card><h2>" + (cleared ? (ko ? "작전 성공" : "MISSION CLEAR") : (ko ? "작전 실패" : "MISSION FAILED")) +
      "</h2><div class=stars>" + stars + "</div><p>" + (ko ? "점수" : "SCORE") + " " + (((ctx.G && ctx.G.score) || 0)) +
      "</p><p>" + (ko ? "명중률" : "ACCURACY") + " " + Math.round(acc * 100) + "%</p><p>" + (ko ? "보급" : "SUPPLY") + " " + got + "/" + tot +
      "</p><p>COMBO " + bestCombo + "</p><div class=btns><button class=primary data-act=again>" + (ko ? "다시 하기" : "PLAY AGAIN") +
      "</button><button data-act=title>" + (ko ? "타이틀" : "TITLE") + "</button></div></div>";
    box.addEventListener("click", (e) => {
      const b = e.target && e.target.closest ? e.target.closest("button[data-act]") : null;
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      if (b.getAttribute("data-act") === "again") { try { window.MG && window.MG.playAgain(); } catch (err) {} }
      else { try { window.MG && window.MG.toTitle(); } catch (err) {} }
    });
    document.body.appendChild(box);
    posts.forEach((p) => tagOff(p));
    if (bossPost) tagOff(bossPost);
    if (ctx.G) { ensureHud(ctx.G.score || 0); drawHud(); }
  }

  /* ---------------- effects ---------------- */

  function burst(scene, x, y, z, big) {
    const n = big ? 12 : 8;
    for (let i = 0; i < n; i++) {
      const m = new T.Mesh(new T.BoxGeometry(0.07, 0.07, 0.07), new T.MeshBasicMaterial({ color: i % 3 ? 0xfff2a8 : 0xffa424 }));
      m.position.set(x, y, z);
      m.userData.v = new T.Vector3((Math.random() - 0.5) * 4, Math.random() * 3, (Math.random() - 0.5) * 4);
      m.userData.life = 0.26 + Math.random() * 0.14;
      scene.add(m);
      sparks.push(m);
    }
    for (let i = 0; i < (big ? 4 : 2); i++) {
      const p = new T.Mesh(new T.SphereGeometry(0.05 + Math.random() * 0.045, 6, 5), new T.MeshBasicMaterial({ color: 0xd8cfbc, transparent: true, opacity: 0.26, depthWrite: false }));
      p.position.set(x + (Math.random() - 0.5) * 0.18, y + (Math.random() - 0.5) * 0.18, z + 0.08);
      p.userData.v = new T.Vector3((Math.random() - 0.5) * 0.7, 0.35 + Math.random() * 0.45, 0.25);
      p.userData.life = 0.36 + Math.random() * 0.24;
      p.userData.smoke = 1;
      scene.add(p);
      smokes.push(p);
    }
  }

  /* the crosshair answers every shot: a white × for a body hit, a gold one
     with HEAD over it for a skull hit, red when the man goes down, grey when
     the round stopped in concrete, green for a pickup */
  function hitMark(kind, sx, sy, head, label) {
    const d = document.createElement("div");
    d.className = "railHit " + (kind || "foe") + (head ? " head" : "");
    d.style.left = sx + "px";
    d.style.top = sy + "px";
    for (let i = 0; i < 4; i++) d.appendChild(document.createElement("b"));
    if (label) {
      const sp = document.createElement("span");
      sp.textContent = label;
      d.appendChild(sp);
    }
    document.body.appendChild(d);
    setTimeout(() => d.remove(), head ? 320 : 200);
  }

  function screenOf(pt, cam) {
    const v = pt.clone().project(cam);
    return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, z: v.z };
  }

  /* chips and dust: concrete throws pale grit and a grey puff, flesh throws
     red, so "stopped by the wall" and "hit the man" never read the same */
  function impactBurst(scene, at, kind) {
    const conc = kind === "concrete";
    const skull = kind === "head";
    const chips = conc ? [0xe6e2d6, 0xc4c0b4, 0xf2efe6, 0xa9a597]
      : skull ? [0xffe27a, 0xfff3c4, 0xc0392b, 0xffb347]
      : [0x8e2b24, 0xb03a2c, 0x631a14];
    for (let i = 0; i < (conc ? 8 : skull ? 11 : 5); i++) {
      const sz = 0.045 + Math.random() * 0.055;
      const m = new T.Mesh(new T.BoxGeometry(sz, sz, sz), new T.MeshBasicMaterial({ color: chips[i % chips.length] }));
      m.position.copy(at);
      m.userData.v = new T.Vector3((Math.random() - 0.5) * 4.0, Math.random() * 2.8 + 0.6, (Math.random() - 0.5) * 4.0);
      m.userData.life = 0.3 + Math.random() * 0.22;
      scene.add(m);
      sparks.push(m);
    }
    for (let i = 0; i < (conc ? 3 : 1); i++) {
      const p = new T.Mesh(new T.SphereGeometry(0.09 + Math.random() * 0.08, 6, 5),
        new T.MeshBasicMaterial({ color: conc ? 0xd9d5c9 : 0x6e1a13, transparent: true, opacity: 0.55, depthWrite: false }));
      p.position.copy(at);
      p.userData.v = new T.Vector3((Math.random() - 0.5) * 0.5, 0.45 + Math.random() * 0.4, (Math.random() - 0.5) * 0.5 + 0.5);
      p.userData.life = 0.42 + Math.random() * 0.3;
      p.userData.smoke = 1;
      scene.add(p);
      smokes.push(p);
    }
    const fl = new T.Mesh(new T.SphereGeometry(conc ? 0.1 : skull ? 0.12 : 0.07, 6, 5),
      new T.MeshBasicMaterial({ color: conc ? 0xfff8e6 : skull ? 0xffe08a : 0xffb6a8, transparent: true, opacity: 0.95, depthWrite: false }));
    fl.position.copy(at);
    scene.add(fl);
    tracers.push({ mesh: fl, life: skull ? 0.12 : 0.07, grow: 1 });
  }

  /* the crosshair itself flashes gold for a beat on a skull hit */
  let critT = 0;
  function critCross() {
    const xh = document.getElementById("railX");
    if (!xh) return;
    xh.classList.remove("crit");
    void xh.offsetWidth;
    xh.classList.add("crit");
    clearTimeout(critT);
    critT = setTimeout(() => xh.classList.remove("crit"), 240);
  }

  function gun(name) {
    const g = window.GunSFX;
    if (!g) return;
    try { g.unlock(); g[name] && g[name](); } catch (e) {}
  }

  /* a soldier's voice: a short "윽!" when he is only winged, a long
     falling "으악!" when the round puts him down */
  function grunt(fatal) {
    try {
      const G = window.GunSFX;
      if (G && typeof G.playHitGrunt === "function") G.playHitGrunt(!!fatal);
      window.__grunts = (window.__grunts || 0) + 1;
      if (fatal) window.__gruntsFatal = (window.__gruntsFatal || 0) + 1;
    } catch (e) { window.__gruntErr = String(e && e.stack || e); }
  }

  function spawnSmoke(camera) {
    if (smokes.length > 8 || !pistol) return;
    const m = new T.Mesh(new T.SphereGeometry(0.05, 6, 5), new T.MeshBasicMaterial({ color: 0xd8d2c4, transparent: true, opacity: 0.35, depthWrite: false }));
    m.position.set(0, 0.07, -0.5);
    m.userData.life = 0.4;
    m.userData.v = new T.Vector3((Math.random() - 0.5) * 0.05, 0.08, -0.03);
    pistol.add(m);
    smokes.push(m);
  }

  function throwShot(ctx, p) {
    let mesh = null;
    try { mesh = ctx.makeArrow && ctx.makeArrow(); } catch (e) {}
    if (!mesh) mesh = new T.Mesh(new T.BoxGeometry(0.2, 0.2, 0.2), new T.MeshLambertMaterial({ color: 0xc4552a }));
    mesh.position.set(p.x, p.y + 1, p.z);
    ctx.scene.add(mesh);
    shots3.push({ mesh, x: p.x, y: p.y + 1, z: p.z });
  }

  function allyTracer(ctx, target) {
    const a = dress && dress.ally;
    if (!a || !target) return;
    window.__allyShots = (window.__allyShots || 0) + 1;
    const from = new T.Vector3();
    if (a.userData && a.userData.muzzle) {
      a.userData.muzzle.updateWorldMatrix(true, false);
      a.userData.muzzle.getWorldPosition(from);
    } else {
      a.getWorldPosition(from);
      from.y += 1.2;
    }
    const to = new T.Vector3(target.x, target.y + 1.05, target.z);
    const dir = to.clone().sub(from);
    const len = Math.max(0.4, dir.length());
    const m = new T.Mesh(new T.BoxGeometry(0.045, 0.045, len), new T.MeshBasicMaterial({ color: 0xffe08a }));
    m.position.copy(from).addScaledVector(dir, 0.5);
    m.lookAt(to);
    ctx.scene.add(m);
    tracers.push({ mesh: m, life: 0.09 });
    const fl = new T.Mesh(new T.SphereGeometry(0.09, 6, 5), new T.MeshBasicMaterial({ color: 0xffd070 }));
    fl.position.copy(from);
    ctx.scene.add(fl);
    tracers.push({ mesh: fl, life: 0.06, grow: 1 });
    burst(ctx.scene, to.x, to.y, to.z, false);
    if (a.userData) a.userData.recoil = 1;
    if (Math.random() < 0.3 && !target.isBoss) {
      target.e.hp = (target.e.hp || 1) - 1;
      if (target.e.hp <= 0) killPost(ctx, target, 80);
    }
  }

  function killPost(ctx, p, pts) {
    if (!p || p.e.alive === false) return;
    combo++;
    hitStop = Math.max(hitStop, 0.085);
    if (p.role === "boss") { hitStop = 0.2; flashScreen(0.7); }
    else flashScreen(0.34);
    bestCombo = Math.max(bestCombo, combo);
    window.__comboAt = performance.now() / 1000;
    p.e.alive = false;
    p.state = "dead";
    p.dying = 1.05;
    /* every soldier goes down his own way: tipping back, pitching forward,
       folding left or right, with a knockback away from the muzzle */
    const camP = ctx.camera ? ctx.camera.position : null;
    let kx = 0, kz = 1;
    if (camP) {
      kx = p.x - camP.x; kz = p.z - camP.z;
      const d = Math.hypot(kx, kz) || 1;
      kx /= d; kz /= d;
    }
    const dirs = ["back", "back", "fwd", "left", "right", "right"];
    const dir = p.role === "boss" ? "back" : dirs[(Math.random() * dirs.length) | 0];
    p.dieDur = p.dying;
    p.fall = {
      dir,
      twist: 0,
      spin: (Math.random() * 2 - 1) * (dir === "back" || dir === "fwd" ? 0.4 : 0.62),
      kx, kz,
      push: (0.28 + Math.random() * 0.42) * (p.role === "boss" ? 1.6 : 1),
      side: Math.random() < 0.5 ? -1 : 1,
      lean: (Math.random() * 2 - 1) * 0.2,
      yaw0: (p.mesh && p.mesh.rotation.y) || 0
    };
    grunt(true);
    p.e.x = p.x;
    p.e.y = p.y;
    let scored = false;
    try { if (ctx.killFlip) { ctx.killFlip(p.e, pts); scored = true; } } catch (e) {}
    if (!scored) addPts(ctx, pts);
    tagOff(p);
  }

  function boomBarrel(ctx, b) {
    if (!b || b.dead) return;
    b.dead = true;
    if (b.mesh) b.mesh.visible = false;
    const px = b.x, py = b.y + 0.55, pz = b.z;
    for (let i = 0; i < 18; i++) {
      const m = new T.Mesh(
        new T.BoxGeometry(0.1 + Math.random() * 0.12, 0.1 + Math.random() * 0.12, 0.1 + Math.random() * 0.12),
        new T.MeshBasicMaterial({ color: i % 3 ? 0xff9b1e : 0xfff0a6 })
      );
      m.position.set(px, py, pz);
      m.userData.v = new T.Vector3((Math.random() - 0.5) * 7, 1 + Math.random() * 5, (Math.random() - 0.5) * 7);
      m.userData.life = 0.55 + Math.random() * 0.35;
      m.userData.burn = 1;
      ctx.scene.add(m);
      sparks.push(m);
    }
    for (let i = 0; i < 7; i++) {
      const m = new T.Mesh(
        new T.SphereGeometry(0.16 + Math.random() * 0.18, 6, 5),
        new T.MeshBasicMaterial({ color: 0x3a3630, transparent: true, opacity: 0.55, depthWrite: false })
      );
      m.position.set(px + (Math.random() - 0.5) * 0.5, py + (Math.random() - 0.5) * 0.5, pz + (Math.random() - 0.5) * 0.4);
      m.userData.v = new T.Vector3((Math.random() - 0.5) * 0.8, 0.5 + Math.random() * 0.7, (Math.random() - 0.5) * 0.5);
      m.userData.life = 1.1 + Math.random() * 0.8;
      m.userData.smoke = 1;
      ctx.scene.add(m);
      smokes.push(m);
    }
    shake = 1.4;
    hitStop = Math.max(hitStop, 0.12);
    flashScreen(0.72);
    gun("boom");
    addPts(ctx, 250);
    const hurt = (p) => {
      if (!p || p.e.alive === false || p.role === "hostage") return;
      p.e.hp = (p.e.hp || 1) - 3;
      if (p.e.hp <= 0) killPost(ctx, p, 200 + 150);
    };
    posts.forEach((p) => { if (Math.hypot(p.x - px, p.z - pz) < 6.5) hurt(p); });
    if (dress) {
      dress.barrels.forEach((o) => {
        if (!o.dead && o !== b && Math.hypot(o.x - px, o.z - pz) < 4.6) {
          setTimeout(() => boomBarrel(ctx, o), 170);
        }
      });
    }
  }

  /* ---------------- shooting ---------------- */

  function fire(ctx) {
    if (!ctx || !booted || reloading || ended) return;
    const now = performance.now();
    if (now - lastShot < 130) return;
    if (bullets <= 0) { gun("dry"); lastShot = now; return; }
    lastShot = now;
    bullets--;
    shotsFired++;
    recoil = 1;
    if (flash) { flash.visible = true; flash.scale.setScalar(1); }
    if (flashHalo) { flashHalo.visible = true; flashHalo.scale.setScalar(1); }
    spawnSmoke(ctx.camera);
    gun("shot");
    ctx.camera.updateMatrixWorld(true);
    ctx.scene.updateMatrixWorld(true);
    const ray = new T.Raycaster();
    ray.setFromCamera(new T.Vector2(aimN.x, aimN.y), ctx.camera);
    ray.far = 34;
    const owned = [];
    const addOwned = (mesh, extra, sort) => { if (mesh) owned.push({ mesh, extra, sort }); };
    /* every man who could be on screen, whether he is peeking or ducked; his
       own body and the cover in front of it decide the rest */
    posts.forEach((p) => {
      if (p.live !== false && p.e.alive !== false && p.mesh && p.mesh.visible !== false) addOwned(p.mesh, p, "foe");
    });
    shots3.forEach((s) => addOwned(s.mesh, s, "shot"));
    pickups.forEach((p) => { if (!p.taken) addOwned(p.mesh, p, p.kind); });
    if (dress) dress.barrels.forEach((b) => { if (!b.dead) addOwned(b.mesh, b, "barrel"); });
    /* and the things that stop a round before it gets there */
    occluders().forEach((m) => addOwned(m, null, "block"));
    const found = ray.intersectObjects(owned.map((o) => o.mesh), true);
    const ownerOf = (obj) => {
      let node = obj;
      while (node) {
        const o = owned.find((x) => x.mesh === node);
        if (o) return o;
        node = node.parent;
      }
      return null;
    };
    let hit = null;
    let blocked = null;
    for (let i = 0; i < found.length; i++) {
      const owner = ownerOf(found[i].object);
      if (!owner) continue;
      if (owner.sort === "block") { blocked = found[i]; break; }
      const bb = new T.Box3().setFromObject(owner.mesh);
      hit = { at: found[i].point, box: bb, extra: owner.extra, sort: owner.sort };
      break;
    }
    window.__lastBlocked = blocked ? { x: +blocked.point.x.toFixed(2), y: +blocked.point.y.toFixed(2) } : null;
    const cx = (aimN.x * 0.5 + 0.5) * innerWidth;
    const cy = (-aimN.y * 0.5 + 0.5) * innerHeight;
    if (!hit) {
      let bestPx = 9999;
      const near = [];
      posts.forEach((p) => {
        if (p.live === false || p.e.alive === false || !p.mesh) return;
        if (p.role !== "hostage") {
          /* only the part of him that stands above his cover counts, and only
             if no wall is in the way */
          const top = p.visTop || p.y + p.headTop;
          if (p.coverTop !== undefined && top < p.coverTop - 0.02) return;
        }
        near.push({ mesh: p.mesh, extra: p, sort: "foe", lift: 0.8 });
      });
      pickups.forEach((p) => { if (!p.taken && p.mesh) near.push({ mesh: p.mesh, extra: p, sort: p.kind, lift: 0.3 }); });
      if (dress) dress.barrels.forEach((b) => { if (!b.dead && b.mesh) near.push({ mesh: b.mesh, extra: b, sort: "barrel", lift: 0.55 }); });
      const camP = ctx.camera.position;
      near.forEach((n) => {
        const v = new T.Vector3();
        n.mesh.getWorldPosition(v);
        const at = v.clone();
        at.y += n.lift;
        if (blockedFromCamera(at, camP)) return;
        const pjt = at.clone().project(ctx.camera);
        if (pjt.z > 1) return;
        const x = (pjt.x * 0.5 + 0.5) * innerWidth;
        const y = (-pjt.y * 0.5 + 0.5) * innerHeight;
        const d = Math.hypot(x - cx, y - cy);
        if (d < bestPx) bestPx = d, hit = { at, box: new T.Box3(new T.Vector3(at.x, at.y - 0.4, at.z), new T.Vector3(at.x, at.y + 0.4, at.z)), extra: n.extra, sort: n.sort };
      });
      window.__miss = bestPx;
      if (bestPx > 105) hit = null;
    }
    if (!hit) {
      combo = 0;
      window.__lastShot = { sort: "miss", blocked: !!blocked };
      if (blocked) {
        const sp = screenOf(blocked.point, ctx.camera);
        hitMark("block", sp.x, sp.y);
        impactBurst(ctx.scene, blocked.point, "concrete");
        gun("dry");
      }
      return;
    }
    window.__lastShot = { sort: hit.sort, role: (hit.extra && hit.extra.role) || null };
    // the shot just landed: snap the muzzle onto that exact point for a beat
    aimSnapPt.copy(hit.at);
    aimSnapAt = now;
    shotsHit++;
    window.__lastHitPx = { x: (hit.at.clone().project(ctx.camera).x * 0.5 + 0.5) * innerWidth, y: (-hit.at.clone().project(ctx.camera).y * 0.5 + 0.5) * innerHeight };
    if (hit.sort === "barrel") { hitMark("kill", window.__lastHitPx.x, window.__lastHitPx.y); boomBarrel(ctx, hit.extra); return; }
    if (hit.sort === "shot") {
      hit.extra.mesh.parent && hit.extra.mesh.parent.remove(hit.extra.mesh);
      shots3 = shots3.filter((s) => s !== hit.extra);
      hitMark("pickup", window.__lastHitPx.x, window.__lastHitPx.y);
      impactBurst(ctx.scene, hit.at, "concrete");
      addPts(ctx, 50);
      gun("hit");
      return;
    }
    if (hit.sort === "supply" || hit.sort === "life" || hit.sort === "ammo") {
      const item = hit.extra;
      item.taken = true;
      if (item.mesh) item.mesh.visible = false;
      if (hit.sort === "life") { lives = Math.min(5, lives + 1); addPts(ctx, 300); }
      else if (hit.sort === "ammo") { bullets = Math.min(30, bullets + 10); addPts(ctx, 50); }
      else {
        addPts(ctx, 120);
        bullets = Math.min(30, bullets + 2);
      }
      hitMark("pickup", window.__lastHitPx.x, window.__lastHitPx.y);
      gun("hit");
      return;
    }
    const p = hit.extra;
    const h = hit.box.max.y - hit.box.min.y;
    const head = hit.at.y > hit.box.min.y + h * 0.74;
    const quick = p.aim > p.aimMax * 0.45;
    if (p.role === "hostage") {
      hostageHits++;
      waveClean = false;
      combo = 0;
      addPts(ctx, -300);
      p.e.alive = false;
      p.state = "dead";
      p.dying = 0.7;
      tagOff(p);
      gun("dry");
      return;
    }
    try { ctx.hitFlash && ctx.hitFlash(p.e); } catch (e) {}
    if (head) {
      hitMark("head", window.__lastHitPx.x, window.__lastHitPx.y, true, "HEADSHOT!");
      impactBurst(ctx.scene, hit.at, "head");
      critCross();
      hitStop = Math.max(hitStop, 0.05);
      gun("crit");
      addPts(ctx, 75);
    } else {
      hitMark("foe", window.__lastHitPx.x, window.__lastHitPx.y);
      impactBurst(ctx.scene, hit.at, "flesh");
    }
    p.hitFlash = 0.09;
    p.knock = 0.16;
    /* a skull hit counts for more than a body hit: 2x on infantry and
       heavy troops, 3x on the commander */
    const headDmg = p.role === "boss" ? 3 : 2;
    const dmg = head ? headDmg : 1;
    p.e.hp = (p.e.hp || 1) - dmg;
    if (p.e.hp > 0) {
      // suppressed: he drops back behind cover instead of standing there
      p.state = "duck";
      p.stateT = 0.34;
      p.expose = Math.min(p.expose, 0.85);
      grunt(false);
      gun("hit");
      return;
    }
    hitMark("kill", window.__lastHitPx.x, window.__lastHitPx.y, head, head ? "HEADSHOT!" : null);
    let pts = 100 + ((combo + 1) > 1 ? (combo + 1) * 40 : 0);
    if (head) pts += 250;
    if (quick) pts += 100;
    killPost(ctx, p, pts);
    gun(p.role === "boss" ? "boom" : "hit");
    if (p.role === "boss") finish(ctx, true);
  }

  /* ---------------- per frame ---------------- */

  /* Put the man in the world for this frame: how far down he is behind his own
     cover *as seen from where the camera stands* (the cover's measured top,
     continued along the sight line to him), the sideways peek out of it, the
     crouch, the rifle and arms for the state he is in, and the breathing sway.
     Nothing about being "hidden" is decided by a flag any more: what the eye
     sees is what the shot can reach. */
  function posePost(p, cam, dt) {
    const u = p.mesh.userData;
    const k = dt > 0 ? Math.min(1, dt * 9) : 1;
    const ex = p.expose;

    /* the sight line that just clears his cover: anything above it is visible */
    let hideTop = p.y + p.headTop;
    let dx = p.x - cam.x, dz = p.z - cam.z;
    let dE = Math.hypot(dx, dz) || 1;
    dx /= dE; dz /= dE;
    if (p.coverTop !== undefined) {
      const dC = Math.hypot((p.coverCX || p.x) - cam.x, (p.coverCZ || p.z) - cam.z) || 1;
      const over = Math.max(0, (dE - dC) / dC);
      /* the eye is above the wall, so the line to the man keeps dropping past
         it; he has to be that much lower to stay out of sight */
      hideTop = Math.min(p.coverTop, p.coverTop + (cam.y - p.coverTop) * over);
    }
    const want = Math.max(0.26, Math.min(1, (hideTop - p.y - 0.04) / Math.max(0.6, p.headTop)));
    p.hideFrac += (want - p.hideFrac) * k;

    /* sideways peek along the camera's right, so he steps out of the cover */
    const side = (p.peekDir || 1) * 0.66 * ex;
    const rx = -dz, rz = dx;
    p.mesh.position.set(
      p.x + rx * side - dx * (1 - ex) * 0.12,
      p.y - (1 - ex) * 0.02,
      p.z + rz * side - dz * (1 - ex) * 0.12
    );
    p.mesh.rotation.y = Math.atan2(cam.x - p.mesh.position.x, cam.z - p.mesh.position.z);

    /* crouch: the body compresses from the boots, so he sinks behind the wall
       instead of the wall being drawn over him */
    const sy = p.hideFrac + (1 - p.hideFrac) * ex;
    if (p.body) {
      p.body.scale.y = sy;
      p.body.position.y = Math.sin(p.breath) * 0.008 * ex;
      p.body.rotation.z = (p.knock || 0) * 0.9 + Math.sin(p.bob * 0.63) * 0.022 * ex;
      p.body.rotation.x = (1 - ex) * 0.14 + 0.05 * ex;
    }

    /* rifle up and arms to it as he comes out, back down as he ducks */
    const want3 = p.state === "fire" ? 1 : p.state === "peek" ? 0.72 : 0.1;
    p.armK += (Math.max(want3, ex * 0.92) - p.armK) * k;
    if (p.recoil > 0) p.recoil = Math.max(0, p.recoil - dt * 5.5);
    const ak = p.armK, rc = p.recoil || 0;
    if (u.armR) u.armR.rotation.set(-0.72 - 0.62 * ak + rc * 0.30, 0, -0.20 - 0.10 * ak);
    if (u.armL) u.armL.rotation.set(-1.05 - 0.35 * ak + rc * 0.22, 0, 0.42 - 0.12 * ak);
    if (u.rifle) {
      u.rifle.position.set(-0.02, 0.99 + 0.17 * ak, 0.30 + 0.06 * ak - rc * 0.045);
      u.rifle.rotation.set(0.16 - 0.14 * ak + rc * 0.20, Math.PI, -0.42 + 0.42 * ak);
    }
    if (u.headG) u.headG.rotation.x = 0.09 * ak - (1 - ex) * 0.06 + Math.sin(p.breath * 0.7) * 0.02;
    if (u.legL) u.legL.rotation.x = 0.12 * (1 - ex) + Math.sin(p.bob) * 0.03 * ex;
    if (u.legR) u.legR.rotation.x = -0.16 * (1 - ex) - Math.sin(p.bob) * 0.03 * ex;
    if (u.shinL) u.shinL.rotation.x = 0.22 * (1 - ex);
    if (u.shinR) u.shinR.rotation.x = 0.26 * (1 - ex);
    if (u.nade) u.nade.position.y = 0.60 + ex * 0.12;

    /* keep the visible top around for the tag and for the hit test */
    p.visTop = p.y + p.headTop * sy;
  }

  function stepPost(p, ctx, dt) {
    if (!p.mesh || p.live === false || p.e.alive === false) return;
    const cam = ctx.camera.position;

    if (p.role === "hostage") {
      p.mesh.rotation.y = Math.atan2(cam.x - p.x, cam.z - p.z);
      p.bob += dt * 1.6;
      if (p.body) p.body.rotation.z = Math.sin(p.bob) * 0.05;
      return;
    }

    /* ---- riding: the truck drives its path, the man stays down until it
       has stopped, then the ordinary cover state machine takes over ---- */
    if (p.car) {
      const c = p.car;
      if (c.moving) {
        if (c.delay > 0) c.delay -= dt;
        else {
          const a = c.path[c.seg], b = c.path[c.seg + 1];
          if (b) {
            const dx = b[0] - a[0], dz = b[1] - a[1];
            const len = Math.hypot(dx, dz) || 1;
            c.t += (dt * c.speed) / len;
            const k = Math.min(1, c.t);
            const gx = a[0] + dx * k, gz = a[1] + dz * k;
            c.g.position.set(gx, 0.3, gz);
            c.g.rotation.y = Math.atan2(dx, dz);
            if (k >= 1) { c.seg++; c.t = 0; }
          } else {
            c.moving = false;
            p.state = "hidden";
            p.stateT = 0.45;
            p.expose = 0;
          }
        }
      }
      const gy = c.g.rotation.y;
      p.x = c.g.position.x - Math.sin(gy) * 1.0;
      p.z = c.g.position.z - Math.cos(gy) * 1.0;
      p.y = 1.38;
      p.coverTop = 1.66;
      p.coverCX = p.x;
      p.coverCZ = p.z;
      if (c.moving) { p.expose = 0; posePost(p, cam, dt); return; }
    }

    /* ---- running to a new firing position across the open ---- */
    if (p.run && p.runT < p.run.dur) {
      p.runT += dt;
      if (p.runT >= 0) {
        const kk = Math.min(1, p.runT / p.run.dur);
        const e = kk * kk * (3 - 2 * kk);
        const fx = p.run.dest[0] - p.run.from[0], fz = p.run.dest[1] - p.run.from[1];
        p.x = p.run.from[0] + fx * e;
        p.z = p.run.from[1] + fz * e;
        p.y = 0.3;
        p.expose = 1;
        p.runPhase += dt * 11;
        p.coverTop = undefined;
        posePost(p, cam, dt);
        applyRunGait(p, Math.atan2(fx, fz));
        return;
      }
    } else if (p.run && p.runT < 1e9) {
      /* arrived: take up the cover he ran to */
      if (p.runT < p.run.dur + 0.001) {
        p.runT = p.run.dur + 1;
        p.coverTop = p.coverTopSaved;
        p.state = "hidden";
        p.stateT = 0.4;
        p.expose = 0;
      }
    }

    p.breath += dt * 1.7;
    p.bob += dt * 2.4;

    // cover state machine: hidden -> peek -> fire (burst) -> duck -> hidden
    p.stateT -= dt;
    if (p.state === "hidden") {
      if (p.stateT <= 0) {
        p.state = "peek";
        p.stateT = 0.34;
        if (p.e._tag) p.e._tag.style.display = "";
      }
    } else if (p.state === "peek") {
      p.expose = Math.min(1, p.expose + dt / 0.3);
      if (p.stateT <= 0) {
        p.state = "fire";
        p.stateT = p.fireMax;
        p.aim = p.aimMax;
      }
    } else if (p.state === "fire") {
      p.expose = Math.min(1, p.expose + dt / 0.2);
      p.aim -= dt;
      if (p.burstN > 0) {
        /* the burst he actually fires: flash, tracer, recoil; only the first
           round of it carries the damage, so one attack still costs one hit */
        p.shotT -= dt;
        if (p.shotT <= 0) {
          const first = p.burstN === p.burstMax;
          enemyFire(ctx, p, first ? (p.role === "boss" ? 22 : 15) : 0);
          p.burstN--;
          p.shotT = 0.15;
        }
      } else if (p.aim <= 0) {
        p.burstN = p.burstMax = p.role === "tough" || p.role === "boss" ? 3 : 2;
        p.shotT = 0.03;
      } else if (p.stateT <= 0) {
        p.state = "duck";
        p.stateT = 0.32;
      }
    } else if (p.state === "duck") {
      p.expose = Math.max(0, p.expose - dt / 0.3);
      if (p.stateT <= 0) {
        p.state = "hidden";
        p.stateT = p.hideMin + Math.random() * 1.3;
        if (p.e._tag) p.e._tag.style.display = "none";
        p.peekDir = Math.random() < 0.5 ? -1 : 1;
        // the commander bounds between heavy barriers between peeks
        if (p.isBoss && p.spotI !== undefined) {
          p.spotI = (p.spotI + 1 + ((Math.random() * 2) | 0)) % BOSS_DEF.spots.length;
          const s = BOSS_DEF.spots[p.spotI];
          const np = waveXY({ yaw: 0, hold: bossHold }, s[0], s[1]);
          const fr = wallBoxes.length ? pushOutOfWalls(np.x, np.z, 0.4) : np;
          p.x = fr.x; p.z = fr.z;
          const g = bossCovers[p.spotI];
          if (g && g.userData.topY !== undefined) {
            p.coverG = g;
            p.coverTop = g.userData.topY;
            p.coverCX = g.userData.centerX;
            p.coverCZ = g.userData.centerZ;
          }
        }
      }
    }

    posePost(p, cam, dt);

    const u = p.mesh.userData;
    if (p.knock > 0) p.knock = Math.max(0, p.knock - dt * 1.6);
    if (p.state === "fire" && p.role === "throw") {
      p.nextThrow -= dt;
      if (p.nextThrow <= 0) { p.nextThrow = 1.4; throwShot(ctx, p); }
    }
    /* the glint that runs the last half second before his burst */
    const warm = p.state === "fire" && p.burstN === 0 && p.aim > 0 && p.aim < 0.55;
    if (warm) {
      if (!p.glint) { p.glint = makeGlint(); ctx.scene.add(p.glint); }
      const u2 = p.mesh.userData;
      const from = new T.Vector3(p.mesh.position.x, p.y + 1.2, p.mesh.position.z);
      if (u2 && u2.muzzle) { u2.muzzle.updateWorldMatrix(true, false); u2.muzzle.getWorldPosition(from); }
      const toCam = new T.Vector3(cam.x - from.x, cam.y - from.y, cam.z - from.z);
      const dCam = toCam.length() || 1;
      toCam.multiplyScalar(0.14 / dCam);
      p.glint.position.copy(from).add(toCam);
      p.glint.quaternion.copy(ctx.camera.quaternion);
      const k = 1 - p.aim / 0.55;
      const puls = 0.72 + 0.28 * Math.sin(performance.now() / 48);
      p.glint.visible = true;
      p.glint.scale.setScalar(0.65 + k * 1.15);
      const pm = p.glint.children[0].material;
      pm.opacity = (0.35 + 0.6 * k) * puls;
      const bm = p.glint.children[1].material;
      bm.opacity = 0.18 + 0.42 * k;
    } else if (p.glint && p.glint.visible) {
      p.glint.visible = false;
    }

    if (p.e._tag && p.e._tag.style.display !== "none") {
      /* the ring is drawn round his body, sized by how tall he looks on screen */
      const midY = p.y + p.headTop * 0.5;
      const v = new T.Vector3(p.mesh.position.x, midY, p.mesh.position.z);
      const vt = new T.Vector3(p.mesh.position.x, p.y + p.headTop, p.mesh.position.z);
      v.project(ctx.camera);
      vt.project(ctx.camera);
      const t = p.e._tag;
      const sxp = (v.x * 0.5 + 0.5) * innerWidth;
      const syp = (-v.y * 0.5 + 0.5) * innerHeight;
      const typ = (-vt.y * 0.5 + 0.5) * innerHeight;
      const dia = Math.max(44, Math.min(260, Math.abs(typ - syp) * 1.55));
      t.style.left = sxp + "px";
      t.style.top = syp + "px";
      if (Math.abs(dia - p.e._tagDia) > 3) {
        p.e._tagDia = dia;
        t.style.width = dia + "px";
        t.style.height = dia + "px";
      }
      /* 0 = he is only peeking (green, plenty of time), then amber, then red */
      const firing = p.state === "fire";
      const k = firing ? Math.max(0, Math.min(1, 1 - p.aim / Math.max(0.001, p.aimMax))) : 0;
      const rem = firing ? 1 - k : 1;
      if (Math.abs(rem - p.e._tagP) > 0.015) {
        p.e._tagP = rem;
        t.style.setProperty("--p", rem.toFixed(3));
      }
      const stage = !firing ? 0 : (k < 0.35 ? 0 : k < 0.72 ? 1 : 2);
      if (stage !== p.e._tagStage) {
        p.e._tagStage = stage;
        t.classList.remove("st0", "st1", "st2");
        t.classList.add("st" + stage);
        t.style.setProperty("--c", stage === 0 ? "#5fd06a" : stage === 1 ? "#f2b12c" : "#ff3a22");
      }
      const pulse = stage === 2 ? 0.05 + 0.045 * Math.sin(performance.now() / 60) : 0;
      t.style.setProperty("--s", (1 + pulse).toFixed(3));
    }
  }

  /* a running soldier: strides from the hip, shins folding, arms pumping,
     rifle carried low, and he faces where he is going */
  function applyRunGait(p, faceYaw) {
    const u = p.mesh.userData;
    const ph = p.runPhase;
    const sw = Math.sin(ph), swB = Math.sin(ph + Math.PI);
    if (u.legL) u.legL.rotation.x = sw * 0.8;
    if (u.legR) u.legR.rotation.x = -sw * 0.8;
    if (u.shinL) u.shinL.rotation.x = Math.max(0, -Math.sin(ph - 0.4)) * 1.2;
    if (u.shinR) u.shinR.rotation.x = Math.max(0, -Math.sin(ph + Math.PI - 0.4)) * 1.2;
    if (u.armL) u.armL.rotation.set(-0.4 + swB * 0.8, 0, 0.5);
    if (u.armR) u.armR.rotation.set(-0.5 + sw * 0.75, 0, -0.28);
    if (u.rifle) { u.rifle.position.set(-0.02, 0.95, 0.26); u.rifle.rotation.set(0.55, Math.PI, -0.5); }
    if (u.body) {
      u.body.position.y = Math.abs(Math.sin(ph)) * 0.06;
      u.body.rotation.z = Math.sin(ph) * 0.05;
      u.body.scale.y = 1;
    }
    if (u.headG) u.headG.rotation.x = 0.05;
    p.mesh.rotation.y = faceYaw;
  }

  /* half a second before a burst, a red glint sits on his muzzle with a stub
     of aiming laser: the tell that says "cut him off now" */
  const GLINT_GEO = { p: null, b: null };
  function makeGlint() {
    const g = new T.Group();
    const plane = new T.Mesh(GLINT_GEO.p || (GLINT_GEO.p = new T.PlaneGeometry(0.36, 0.36)), SOL.glint.clone());
    plane.renderOrder = 6;
    g.add(plane);
    const beam = new T.Mesh(GLINT_GEO.b || (GLINT_GEO.b = new T.BoxGeometry(0.024, 0.024, 1.8)), new T.MeshBasicMaterial({ color: 0xff3a20, transparent: true, opacity: 0.5, depthWrite: false }));
    beam.position.set(0, 0, 0.9);
    g.add(beam);
    g.visible = false;
    return g;
  }

  /* an enemy round: muzzle flash at his barrel, a tracer back at the camera,
     a kick of the rifle, and the damage when this round is the one that counts */
  function enemyFire(ctx, p, dmg) {
    const u = p.mesh && p.mesh.userData;
    const from = new T.Vector3(p.mesh.position.x, p.y + 1.2, p.mesh.position.z);
    if (u && u.muzzle) {
      u.muzzle.updateWorldMatrix(true, false);
      u.muzzle.getWorldPosition(from);
    }
    p.recoil = 1;
    muzzleFlash(ctx, from);
    /* the tracer is drawn as a bar, so it has to stop a few metres short of
       the eye: a bar that reaches the camera fills half the screen */
    const cam = ctx.camera.position;
    const toCam = new T.Vector3(cam.x - from.x, cam.y - 0.2 - from.y, cam.z - from.z);
    const dCam = toCam.length() || 1;
    toCam.multiplyScalar(Math.max(0.2, (dCam - 5) / dCam));
    tracerTo(ctx, from, new T.Vector3(from.x + toCam.x, from.y + toCam.y, from.z + toCam.z), 0xffe6a0, 0.05);
    gun("rifle");
    if (dmg) hurtPlayer(ctx, dmg);
  }

  function muzzleFlash(ctx, at) {
    const m = new T.Mesh(new T.SphereGeometry(0.11, 6, 5), new T.MeshBasicMaterial({ color: 0xffd06a, transparent: true, opacity: 0.95, depthWrite: false }));
    m.position.copy(at);
    ctx.scene.add(m);
    tracers.push({ mesh: m, life: 0.07 });
    for (let i = 0; i < 4; i++) {
      const s = new T.Mesh(new T.BoxGeometry(0.05, 0.05, 0.05), new T.MeshBasicMaterial({ color: 0xfff2b0 }));
      s.position.copy(at);
      s.userData.v = new T.Vector3((Math.random() - 0.5) * 2.4, Math.random() * 1.6, (Math.random() - 0.5) * 2.4);
      s.userData.life = 0.16 + Math.random() * 0.1;
      ctx.scene.add(s);
      sparks.push(s);
    }
  }

  function tracerTo(ctx, from, to, color, thick) {
    const dir = to.clone().sub(from);
    const len = Math.max(0.4, dir.length());
    const m = new T.Mesh(new T.BoxGeometry(thick || 0.04, thick || 0.04, len), new T.MeshBasicMaterial({ color: color || 0xffe08a }));
    m.position.copy(from).addScaledVector(dir, 0.5);
    m.lookAt(to);
    ctx.scene.add(m);
    tracers.push({ mesh: m, life: 0.1 });
  }

  function stepAlly(ctx, dt) {
    const a = dress && dress.ally;
    if (!a) return;
    const cam = ctx.camera;
    const right = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    const fwd = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 2).negate();
    /* Anchor him in frame rather than in metres: a portrait phone has a much
       narrower horizontal cone, so a fixed 3.3 m to the side put him across a
       third of the screen. He keeps the lower-left corner on any aspect. */
    const asp = innerWidth / Math.max(1, innerHeight);
    const tanH = Math.tan((viewFov() * Math.PI) / 360) * asp;
    const ndc = asp < 0.9 ? -0.7 : -0.58;
    const dist = asp < 0.9 ? 6.6 : 6.9;
    const lat = ndc * dist * tanH;
    let tx = cam.position.x + fwd.x * dist + right.x * lat;
    let tz = cam.position.z + fwd.z * dist + right.z * lat;
    /* if that anchor lands inside a building, step back toward the road until
       it is free, so he never walks into a shopfront or a barrier */
    if (wallBoxes.length && insideWall(tx, tz, 0.42)) {
      for (let k = 1; k <= 6; k++) {
        const f = 1 - k * 0.14;
        const cx2 = cam.position.x + (tx - cam.position.x) * f;
        const cz2 = cam.position.z + (tz - cam.position.z) * f;
        if (!insideWall(cx2, cz2, 0.42)) { tx = cx2; tz = cz2; break; }
      }
    }
    const px = a.position.x, pz = a.position.z;
    const k = Math.min(1, dt * 4.2);
    a.position.x += (tx - a.position.x) * k;
    a.position.z += (tz - a.position.z) * k;
    if (wallBoxes.length) {
      const free = pushOutOfWalls(a.position.x, a.position.z, 0.42);
      if (free.x !== a.position.x || free.z !== a.position.z) {
        a.position.x = free.x;
        a.position.z = free.z;
        window.__allyWallNudges = (window.__allyWallNudges || 0) + 1;
      }
    }
    a.position.y = 0.3;
    const wantScale = asp < 0.9 ? 0.98 : 1.06;
    if (Math.abs(a.scale.x - wantScale) > 0.01) a.scale.setScalar(wantScale);
    const moved = Math.hypot(a.position.x - px, a.position.z - pz);
    const speed = dt > 0 ? moved / dt : 0;
    const u = a.userData;

    const foes = exposedHostiles();
    let best = null, bd = 1e9;
    foes.forEach((p) => {
      const d = Math.hypot(p.x - a.position.x, p.z - a.position.z);
      if (d < bd) { bd = d; best = p; }
    });
    if (best) {
      a.rotation.y = Math.atan2(best.x - a.position.x, best.z - a.position.z);
    } else if (speed > 0.2) {
      a.rotation.y = Math.atan2(a.position.x - px, a.position.z - pz);
    }

    /* walk cycle driven by the distance actually covered, so his boots never
       slide: strides, counter-swinging arms, a bounce on each footfall, and a
       stop into a firing stance when he has caught up */
    u.phase = (u.phase || 0) + moved * 2.6;
    const gait = Math.max(0, Math.min(1, speed / 3.2));
    u.aimK = (u.aimK || 0) + (((best && gait < 0.35) ? 1 : 0) - (u.aimK || 0)) * Math.min(1, dt * 5);
    const aim = u.aimK || 0;
    const sw = Math.sin(u.phase) * 0.52 * gait;
    const swB = Math.sin(u.phase + Math.PI) * 0.52 * gait;
    if (u.legL) u.legL.rotation.x = sw + 0.16 * aim;
    if (u.legR) u.legR.rotation.x = -sw + 0.10 * aim;
    if (u.shinL) u.shinL.rotation.x = Math.max(0, -Math.sin(u.phase - 0.5)) * 0.95 * gait + 0.30 * aim;
    if (u.shinR) u.shinR.rotation.x = Math.max(0, -Math.sin(u.phase + Math.PI - 0.5)) * 0.95 * gait + 0.24 * aim;
    if (u.armL) u.armL.rotation.set(-0.82 - 0.45 * aim - swB * 0.55, 0, 0.40 - 0.04 * aim);
    if (u.armR) u.armR.rotation.set(-0.58 - 0.55 * aim + swB * 0.50, 0, -0.24 + 0.05 * aim);
    if (u.rifle) {
      u.rifle.position.y = 1.00 + 0.13 * aim;
      u.rifle.rotation.set(-0.05 - 0.06 * aim + (u.recoil || 0) * 0.18, Math.PI, 0);
    }
    if (u.body) {
      u.body.position.y = Math.abs(Math.sin(u.phase)) * 0.05 * gait - 0.05 * aim;
      u.body.rotation.z = Math.sin(u.phase) * 0.035 * gait;
      u.body.rotation.x = 0.04 * gait - 0.03 * aim;
    }
    if (u.headG) u.headG.rotation.y = Math.sin(u.phase * 0.5) * 0.06 * gait;
    u.recoil = Math.max(0, (u.recoil || 0) - dt * 6);
    u.speed = speed;
    u.steps = (u.steps || 0) + Math.abs(moved);
    if (best) {
      allyT -= dt;
      if (allyT <= 0) {
        allyT = 1.15 + Math.random() * 0.8;
        allyTracer(ctx, best);
      }
    }
  }

  function frame(ctx) {
    if (!armed || !active || !ctx || !ctx.scene || !ctx.camera) return;
    const cam = ctx.camera;
    const nowMs = performance.now();
    let dt = Math.min(0.05, (nowMs - (frame._t || nowMs)) / 1000) || 0.016;
    if (hitStop > 0) { hitStop = Math.max(0, hitStop - dt); dt *= 0.16; }
    if (window.__railSpeed) dt *= window.__railSpeed;
    frame._t = nowMs;
    const t = (nowMs - t0) / 1000;
    clock = Math.max(0, CLOCK0 - t);

    // ---- camera rail ----
    let lookGoal = null;
    let arrived = false;
    if (!ended) {
      if (phase === "move" || phase === "toBoss") {
        const goalU = phase === "toBoss" ? bossU : (waves[waveI] ? waves[waveI].u : bossU);
        pathU = Math.min(goalU, pathU + (7.4 * dt) / pathLen);
        const p = pathAt(pathU);
        cam.position.set(p.x, CAM_Y, p.z);
        const ahead = pathAt(pathU + 7 / pathLen);
        const zone = phase === "toBoss" ? { x: BOSS_DEF.look[0], y: BOSS_DEF.look[1], z: BOSS_DEF.look[2] }
                                        : (waves[waveI] ? waves[waveI].look : null);
        const left = (goalU - pathU) * pathLen;
        if (zone && left < 11) {
          const k = Math.max(0, Math.min(1, 1 - left / 11));
          lookGoal = {
            x: ahead.x + (zone.x - ahead.x) * k,
            y: 1.45 + (zone.y - 1.45) * k,
            z: ahead.z + (zone.z - ahead.z) * k
          };
        } else {
          lookGoal = { x: ahead.x, y: 1.45, z: ahead.z };
        }
        arrived = goalU - pathU < 0.0005;
        if (arrived) {
          if (phase === "move") { startWave(waves[waveI]); }
          else if (phase === "toBoss") { startBoss(ctx); }
        }
      } else {
        cam.position.set(curHold.x, CAM_Y, curHold.z);
        lookGoal = { x: curLook.x, y: curLook.y, z: curLook.z };
      }
    } else {
      lookGoal = { x: cam.position.x, y: 1.3, z: cam.position.z + 10 };
    }

    if (lookGoal) {
      const k = 1 - Math.exp(-7 * dt);
      lookSmooth.x += (lookGoal.x - lookSmooth.x) * k;
      lookSmooth.y += (lookGoal.y - lookSmooth.y) * k;
      lookSmooth.z += (lookGoal.z - lookSmooth.z) * k;
    }
    let sx = 0, sy = 0;
    if (shake > 0) {
      sx = (Math.random() - 0.5) * shake * 0.12;
      sy = (Math.random() - 0.5) * shake * 0.08;
      shake *= 0.86;
    }
    const sway = Math.sin(nowMs / 2400) * 0.0016;
    cam.position.x += sx;
    cam.position.y = CAM_Y + sy + Math.sin(nowMs / 1700) * 0.006;
    cam.lookAt(lookSmooth.x, lookSmooth.y + sway, lookSmooth.z);
    cam.near = 0.06;
    cam.fov = viewFov();
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    if (ctx.player) ctx.player.visible = false;

    // ---- enemies ----
    if (phase === "fight" || phase === "boss") {
      waveT -= dt;
      posts.forEach((p) => stepPost(p, ctx, dt));
      stepAlly(ctx, dt);
      shots3.forEach((s) => {
        s.x -= dt * 6;
        s.mesh.position.set(s.x, s.y, s.z);
      });
      shots3 = shots3.filter((s) => {
        if (s.x < cam.position.x + 0.8) { hurtPlayer(ctx, 10); s.mesh.parent && s.mesh.parent.remove(s.mesh); return false; }
        return true;
      });
      const left = livingHostiles().length;
      if (left === 0 || (waveT <= 0 && phase !== "boss")) endWave(ctx);
    } else if (phase === "move" || phase === "toBoss") {
      stepAlly(ctx, dt);
    }

    // ---- dying ----
    posts.forEach((p) => {
      if (!p.mesh || p.e.alive !== false) return;
      if (p.dying > 0) {
        p.dying -= dt;
        const dur = p.dieDur || 1.05;
        const t = Math.max(0, Math.min(1, 1 - p.dying / dur));
        const f = p.fall || (p.fall = { dir: "back", spin: 0, kx: 0, kz: 1, push: 0.4, side: 1, lean: 0, yaw0: p.mesh.rotation.y || 0 });
        // the hit snaps him over, then the body settles into the dirt
        const k = t < 0.42 ? Math.pow(t / 0.42, 0.66) * 0.9 : 0.9 + ((t - 0.42) / 0.58) * 0.1;
        if (f.dir === "back") {
          p.mesh.rotation.x = -k * 1.52;
          p.mesh.rotation.z = f.lean * k + f.side * 0.24 * k;
        } else if (f.dir === "fwd") {
          p.mesh.rotation.x = k * 1.46;
          p.mesh.rotation.z = f.lean * k + f.side * 0.28 * k;
        } else if (f.dir === "left") {
          p.mesh.rotation.z = -k * 1.44 + f.lean * k;
          p.mesh.rotation.x = f.lean * k * 0.7;
        } else {
          p.mesh.rotation.z = k * 1.48 + f.lean * k;
          p.mesh.rotation.x = f.lean * k * 0.7;
        }
        // a quarter turn on the way down, so no two kills read the same
        p.mesh.rotation.y = f.yaw0 + f.spin * t;
        // knockback along the line of fire, plus a shallow sink so the feet
        // pivot does not hang in the air
        p.mesh.position.x = p.x + f.kx * f.push * t;
        p.mesh.position.z = p.z + f.kz * f.push * t;
        p.mesh.position.y = p.y - Math.max(0, k - 0.7) * 0.3;
        if (p.dying <= 0) p.mesh.visible = false;
      }
    });

    // ---- zone cover culling (they exist from the start; only the far ones rest)
    if (coverGroups.length) {
      const uNow = pathU * pathLen;
      coverGroups.forEach((cg) => {
        if (!cg.g) return;
        cg.g.visible = Math.abs(uNow - cg.u * pathLen) < 42;
      });
    }

    // ---- world dressing follow ----
    if (dress) {
      if (dress.sky) { dress.sky.position.set(cam.position.x, 0, cam.position.z + 20); }
      dress.flags.forEach((f) => {
        const wv = Math.sin(nowMs / 540 + f.userData.ph) * 0.09;
        if (f.userData.cloth) f.userData.cloth.rotation.y = wv;
        if (f.userData.cloth2) f.userData.cloth2.rotation.y = Math.PI + wv;
      });
      dress.clouds.forEach((c) => {
        c.position.x += dt * 0.3;
        if (c.position.x > cam.position.x + 90) c.position.x -= 180;
      });
      dress.barrels.forEach((b) => {
        if (!b.dead && b.mesh) b.mesh.rotation.y = Math.sin(nowMs / 900 + b.x) * 0.03;
      });
    }

    // ---- tracers / pickups ----
    for (let i = tracers.length - 1; i >= 0; i--) {
      const tr = tracers[i];
      tr.life -= dt;
      if (tr.grow && tr.mesh.scale) tr.mesh.scale.setScalar(1 + (0.06 - tr.life) * 12);
      if (tr.life <= 0) {
        if (tr.mesh.parent) tr.mesh.parent.remove(tr.mesh);
        if (tr.mesh.geometry) tr.mesh.geometry.dispose();
        if (tr.mesh.material) tr.mesh.material.dispose();
        tracers.splice(i, 1);
      }
    }
    pickups.forEach((item) => {
      if (item.taken || !item.mesh) return;
      item.mesh.rotation.y += dt * 1.1;
      item.mesh.position.y = item.y + Math.sin((nowMs / 700) + (item.y || 0)) * 0.05;
    });

    // ---- viewmodel ----
    const since = performance.now() - lastShot;
    const kick = Math.max(0, recoil);
    recoil = Math.max(0, recoil - 0.08);
    if (reloadK > 0) reloadK = Math.max(0, reloadK - dt / 0.44);
    if (pistol && pistolBase) {
      const asp = innerWidth / Math.max(1, innerHeight);
      const tHalf = Math.tan((cam.fov * Math.PI) / 360) * Math.abs(pistolBase.z);
      const halfW = tHalf * asp;
      /* the wider portrait FOV makes the pistol read small against a tall
         frame, so the rig grows a little there; landscape keeps its old size */
      const tall = Math.max(0, 1 - asp);
      const vk = Math.max(0.14, Math.min(0.4, halfW * 0.58 * (1 + tall * 0.8)));
      if (Math.abs(pistol.scale.x - vk) > 0.005) pistol.scale.setScalar(vk);
      const baseX = Math.min(pistolBase.x, halfW * 0.5);
      /* a tall portrait frame has a lot of empty floor below the hand, so the
         viewmodel drops a little there and the arms leave the frame sooner */
      const drop = Math.max(0, 1 - asp) * 0.13;
      const baseY = pistolBase.y - drop;
      const dip = reloadK > 0 ? Math.sin(Math.PI * (1 - reloadK)) : 0;
      const swayX = aimN.x * 0.006 + Math.sin(nowMs / 740) * 0.0025;
      const swayY = aimN.y * 0.004 + Math.cos(nowMs / 960) * 0.0025;
      pistol.position.x = baseX + swayX;
      pistol.position.z = pistolBase.z + kick * 0.045 + dip * 0.03;
      pistol.position.y = baseY - kick * 0.018 - dip * 0.1 + swayY;

      /* ---- point the barrel at what the shot is on ----
         The aim ray is the one `fire()` uses. If an exposed enemy sits on it,
         aim at that enemy's chest; otherwise at the point 26 m along the ray;
         and for a moment after a shot, right at the point that was hit.
         The muzzle rides above the elbow pivot, so "turn the barrel at the
         target" is solved from the muzzle itself and refined twice; the barrel
         line then really runs through the target, not just near it. */
      aimNdc.set(aimN.x, aimN.y);
      aimRay.setFromCamera(aimNdc, cam);
      let aimD = 26;
      posts.forEach((p) => {
        if (p.live === false || p.e.alive === false || p.expose <= 0.42 || !p.mesh) return;
        tmpV.set(p.mesh.position.x, p.y + 0.95, p.mesh.position.z).sub(aimRay.ray.origin);
        const along = tmpV.dot(aimRay.ray.direction);
        if (along < 2.5 || along > 34) return;
        const perp = tmpV.addScaledVector(aimRay.ray.direction, -along).length();
        if (perp < 0.95 && along < aimD) aimD = along;
      });
      aimPt.copy(aimRay.ray.origin).addScaledVector(aimRay.ray.direction, aimD);
      const snapped = nowMs - aimSnapAt < 140;
      if (snapped) aimPt.copy(aimSnapPt);
      window.__aimTarget = aimPt.clone();
      pistol.updateMatrixWorld(true);
      aimLocal.copy(aimPt);
      pistol.worldToLocal(aimLocal);
      let gyaw = 0, gpit = 0;
      for (let it = 0; it < 2; it++) {
        // muzzle position for the current guess, in rig space
        tmpV.set(0, 0.062, -0.4).sub(pistolPivot).applyQuaternion(gunQd).add(pistolPivot);
        aimWish.copy(aimLocal).sub(tmpV);
        gyaw = Math.atan2(-aimWish.x, -aimWish.z);
        gpit = Math.atan2(aimWish.y, Math.hypot(aimWish.x, aimWish.z));
        gunE.set(gpit, gyaw, 0, "YXZ");
        gunQd.setFromEuler(gunE);
      }
      const yawC = Math.max(-0.52, Math.min(0.52, gyaw));
      const pitC = Math.max(-0.3, Math.min(0.42, gpit));
      gunE.set(pitC, yawC, 0, "YXZ");
      gunQd.setFromEuler(gunE);
      if (snapped) gunQ.copy(gunQd);
      else gunQ.slerp(gunQd, 1 - Math.exp(-12 * dt));
      pistolAim.quaternion.copy(gunQ);
      // kick rides up the barrel, the reload dip drops the muzzle and rolls it
      pistolAim.rotation.x += kick * 0.15 + dip * 0.55;
      pistolAim.rotation.z += dip * 0.3;
      // pivot the turn on the right elbow, so the hand stays in the sleeve
      tmpV.copy(pistolPivot).applyQuaternion(pistolAim.quaternion);
      pistolAim.position.copy(pistolPivot).sub(tmpV);
      // the support elbow swings with it; re-fit its upper arm to the shoulder
      if (pistolUpperL) {
        tmpV.set(-0.366, -0.705, 0.405).sub(pistolPivot).applyQuaternion(pistolAim.quaternion).add(pistolPivot);
        const S = pistolUpperL.userData;
        tmpT3.set(-0.575, -1.1, 0.78);   // the left shoulder stays on the torso waiting here
        const dx = tmpV.x - tmpT3.x, dy = tmpV.y - tmpT3.y, dz = tmpV.z - tmpT3.z;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
        pistolUpperL.position.set((tmpV.x + tmpT3.x) / 2, (tmpV.y + tmpT3.y) / 2, (tmpV.z + tmpT3.z) / 2);
        tmpT4.set(dx / len, dy / len, dz / len);
        pistolUpperL.quaternion.setFromUnitVectors(UPY_VIEW, tmpT4);
        pistolUpperL.scale.set(1, len / (S.len || 1), 1);
      }
      gunAim.yaw = yawC; gunAim.pitch = pitC;
      window.__aimDbg = { gyaw: +gyaw.toFixed(4), gpit: +gpit.toFixed(4), yawC: +yawC.toFixed(4), pitC: +pitC.toFixed(4),
        q: gunQ.toArray().map((v) => +v.toFixed(4)), qd: gunQd.toArray().map((v) => +v.toFixed(4)),
        kick: +kick.toFixed(3), dip: +dip.toFixed(3), aimD: +aimD.toFixed(1) };
    }
    window.__gunAim = gunAim;
    window.__fxCount = () => ({ sparks: sparks.length, smokes: smokes.length, tracers: tracers.length });
    window.__insideWall = insideWall;
    window.__wallStats = () => ({ boxes: wallBoxes.length, allyNudges: window.__allyWallNudges || 0, postNudges: window.__postWallNudge || 0 });
    window.__allyObj = () => dress && dress.ally;
    window.__posts = posts;
    window.__aimN = aimN;
    if (flash) { flash.visible = since < 70; flash.scale.setScalar(1 + (1 - Math.min(1, since / 70)) * 1.4); }
    if (flashLight) flashLight.intensity = since < 95 ? (1 - since / 95) * 2.8 : 0;
    if (flashHalo) {
      flashHalo.visible = since < 90;
      const k = Math.min(1, since / 90);
      flashHalo.scale.setScalar(1 + k * 2.2);
      if (flashHalo.material) flashHalo.material.opacity = 0.8 * (1 - k);
    }
    for (let i = smokes.length - 1; i >= 0; i--) {
      const s = smokes[i];
      s.userData.life -= dt;
      s.position.add(s.userData.v);
      if (s.userData.smoke && s.scale) s.scale.multiplyScalar(1 + dt * 0.85);
      s.material.opacity = Math.max(0, Math.min(0.6, s.userData.life * 0.7));
      if (s.userData.life <= 0) {
        if (s.parent) s.parent.remove(s);
        if (s.geometry) s.geometry.dispose();
        if (s.material) s.material.dispose();
        smokes.splice(i, 1);
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.userData.life -= dt;
      s.position.addScaledVector(s.userData.v, dt);
      s.userData.v.y -= 6 * dt;
      if (s.userData.life <= 0) {
        ctx.scene.remove(s);
        if (s.geometry) s.geometry.dispose();
        if (s.material) s.material.dispose();
        sparks.splice(i, 1);
      }
    }
    if (nowMs - (frame._bgmT || 0) > 1600) {
      frame._bgmT = nowMs;
      try { if (active && !ended && window.GunSFX && window.GunSFX.bgm) window.GunSFX.bgm(true, phase === "boss"); } catch (e) {}
    }
    if (combo > 0 && performance.now() / 1000 - (window.__comboAt || 0) > 2.2) combo = 0;
    ensureHud((ctx.G && ctx.G.score) || 0);
    if (!window.__railIdle && t > 0.4) window.__railIdle = 1;
    window.__railPhase = phase;
    window.__railDbg = {
      phase, waveI, u: +pathU.toFixed(3), cam: [+cam.position.x.toFixed(2), +cam.position.z.toFixed(2)],
      posts: posts.length, alive: posts.filter((p) => p.e.alive !== false).length,
      exposed: posts.filter((p) => p.live !== false && p.e.alive !== false && p.expose > 0.42).length,
      states: posts.filter((p) => p.live !== false).map((p) => p.state).join(","),
      staged: posts.filter((p) => p.live === false).length,
      cover: posts.filter((p) => p.live !== false && p.role !== "hostage")
        .map((p) => (p.coverTop !== undefined ? ((p.visTop || 0) - p.coverTop).toFixed(2) : "?")) .join(","),
      ally: window.__allyShots || 0,
      bullets, shotsFired, shotsHit, hp, lives, waveT: +waveT.toFixed(1),
      pickups: pickups.length, got: pickups.filter((p) => p.taken).length,
      falls: posts.filter((p) => p.fall).map((p) => p.fall.dir).join(","),
      dyingPose: posts.filter((p) => p.mesh && p.e.alive === false && p.dying > 0)
        .map((p) => (p.fall ? p.fall.dir : "?") + "@" + p.mesh.rotation.x.toFixed(2) + "/" + p.mesh.rotation.z.toFixed(2))
        .join("|"),
      grunts: window.__grunts || 0, gruntsFatal: window.__gruntsFatal || 0,
      texes: window.__texSizes ? Object.keys(window.__texSizes).length : 0,
      errs: (window.__railErrs || []).length
    };
    const spot = exposedHostiles()[0] || null;
    if (spot && spot.mesh) {
      const v = new T.Vector3();
      spot.mesh.getWorldPosition(v);
      v.y += 0.9;
      v.project(cam);
      window.__aimSpot = { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
    } else window.__aimSpot = null;
    window.__pickupSpot = null;
    let bestItem = 9999;
    pickups.forEach((item) => {
      if (item.taken || !item.mesh || item.mesh.visible === false) return;
      const v = new T.Vector3();
      item.mesh.getWorldPosition(v);
      const pjt = v.clone().project(cam);
      if (pjt.z < 0 || pjt.z > 1 || Math.abs(pjt.x) > 0.92 || Math.abs(pjt.y) > 0.92) return;
      const x = (pjt.x * 0.5 + 0.5) * innerWidth;
      const y = (-pjt.y * 0.5 + 0.5) * innerHeight;
      const d = Math.hypot(pjt.x, pjt.y);
      if (d < bestItem) { bestItem = d; window.__pickupSpot = { x, y, kind: item.kind }; }
    });
  }

  window.RAIL = {
    get active() { return active; },
    get staged() { return staged; },
    begin,
    pause,
    frame,
    fire: () => {
      try {
        const ctx = window.__railCtx;
        window.__fireStep = ctx ? "ctx" : "noctx";
        if (ctx) fire(ctx);
        window.__fireStep = "ok";
      } catch (err) { window.__fireErr = String(err && err.stack || err); }
    },
    reload: () => {
      if (!booted || !active || reloading || bullets >= 20 || ended) return;
      reloading = true;
      reloadK = 1;
      gun("reload");
      setTimeout(() => { bullets = 20; reloading = false; }, 420);
    }
  };
})();
