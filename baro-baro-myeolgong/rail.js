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
      .railThreat{position:fixed;z-index:39;pointer-events:none;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;border:2px solid #ff6a3c;background:rgba(92,12,4,.85);box-shadow:0 0 9px rgba(255,90,50,.55);color:#fff;font:900 13px/16px ui-monospace,monospace;text-align:center;opacity:.95}
      .railThreat.urgent{border-color:#ff2a1a;background:rgba(150,10,0,.8);color:#fff;box-shadow:0 0 16px rgba(255,40,20,.95);animation:railPulse .42s steps(2,end) infinite}
      @keyframes railPulse{0%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.22)}100%{transform:translate(-50%,-50%) scale(1)}}
      .mgPop{position:fixed;z-index:42;pointer-events:none;transform:translate(-50%,-50%);font:900 20px/1 ui-monospace,monospace;color:#ffe14a;text-shadow:0 2px 0 #201a00,0 0 8px rgba(255,225,74,.5);animation:mgPopUp .8s ease-out forwards}
      .mgPop.bad{color:#ff7a66;text-shadow:0 2px 0 #2a0000,0 0 8px rgba(255,60,40,.5)}
      @keyframes mgPopUp{0%{opacity:0;transform:translate(-50%,-50%) scale(.7)}18%{opacity:1;transform:translate(-50%,-58%) scale(1.06)}100%{opacity:0;transform:translate(-50%,-118%) scale(1)}}
      #railMark{position:fixed;z-index:43;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;border:3px solid #ff3b3b;transform:rotate(45deg)}
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

  function ctex(key, w, h, draw) {
    if (MT[key]) return MT[key];
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const g = cv.getContext("2d");
    draw(g, w, h);
    const t = new T.CanvasTexture(cv);
    if (T.sRGBEncoding !== undefined) t.encoding = T.sRGBEncoding;
    t.magFilter = T.NearestFilter;
    t.minFilter = T.LinearMipMapLinearFilter;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = 4;
    MT[key] = t;
    return t;
  }

  function rng(seed) {
    let s = seed || 1;
    return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  }

  function speck(g, w, h, cols, seed, n) {
    const R = rng(seed);
    for (let i = 0; i < n; i++) {
      g.globalAlpha = 0.1 + R() * 0.22;
      g.fillStyle = cols[(R() * cols.length) | 0];
      g.fillRect((R() * w) | 0, (R() * h) | 0, 1 + ((R() * 3) | 0), 1 + ((R() * 2) | 0));
    }
    g.globalAlpha = 1;
  }

  function blockTex(key, base, mortar, tint, seed) {
    return ctex(key, 64, 64, (g, w, h) => {
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      speck(g, w, h, tint, seed, 1400);
      g.strokeStyle = mortar;
      g.lineWidth = 2;
      for (let y = 0; y <= h; y += 16) {
        g.beginPath();
        g.moveTo(0, y + 0.5);
        g.lineTo(w, y + 0.5);
        g.stroke();
        const off = ((y / 16) | 0) % 2 ? 16 : 0;
        for (let x = off; x <= w; x += 32) {
          g.beginPath();
          g.moveTo(x + 0.5, y);
          g.lineTo(x + 0.5, y + 16);
          g.stroke();
        }
      }
    });
  }

  function camoTex(key, cols, seed) {
    return ctex(key, 32, 32, (g, w, h) => {
      const R = rng(seed);
      g.fillStyle = cols[0];
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) {
        g.fillStyle = cols[1 + ((R() * (cols.length - 1)) | 0)];
        g.fillRect((R() * w) | 0, (R() * h) | 0, 4 + ((R() * 9) | 0), 3 + ((R() * 7) | 0));
      }
      speck(g, w, h, ["#000000", "#ffffff"], seed + 3, 220);
    });
  }

  function starPath(g, cx, cy, r) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.42 : r;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    }
    g.closePath();
  }

  function flagKR() {
    return ctex("flagKR", 96, 64, (g, w, h) => {
      g.fillStyle = "#f6f4ec";
      g.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, r = 13;
      g.fillStyle = "#cd2e3a";
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#0047a0";
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI);
      g.fill();
      g.fillStyle = "#cd2e3a";
      g.beginPath();
      g.arc(cx - r / 2, cy, r / 2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#0047a0";
      g.beginPath();
      g.arc(cx + r / 2, cy, r / 2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#141414";
      const tri = [
        [16, 12, -0.6, 0], [80, 12, 0.6, 0], [16, 52, 0.6, 0], [80, 52, -0.6, 0]
      ];
      tri.forEach(([px, py, rot]) => {
        g.save();
        g.translate(px, py);
        g.rotate(rot);
        for (let i = 0; i < 3; i++) g.fillRect(-7, -6 + i * 5, 14, 2.5);
        g.restore();
      });
      g.strokeStyle = "rgba(120,110,90,.35)";
      g.lineWidth = 2;
      g.strokeRect(1, 1, w - 2, h - 2);
    });
  }

  function flagKP() {
    return ctex("flagKP", 96, 64, (g, w, h) => {
      g.fillStyle = "#0b4ea2";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#ffffff";
      g.fillRect(0, 12, w, 3);
      g.fillRect(0, 49, w, 3);
      g.fillStyle = "#c8102e";
      g.fillRect(0, 15, w, 34);
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(31, 32, 13, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#c8102e";
      starPath(g, 31, 32, 10);
      g.fill();
      g.strokeStyle = "rgba(0,0,0,.25)";
      g.lineWidth = 2;
      g.strokeRect(1, 1, w - 2, h - 2);
    });
  }

  /* Faces in the jump engine's style: sclera + iris + glint, brows,
     nose shadow, mouth line, cheeks and stubble, painted at 64x64 so the
     block head still reads as a character at combat distance. */
  function paintFace(g, w, h, o) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, o.top || "#f0c49c");
    gr.addColorStop(0.55, o.mid || "#dda87e");
    gr.addColorStop(1, o.bot || "#b8825a");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    speck(g, w, h, ["#ffffff", "#8a5a3a"], o.seed || 7, 130);

    // hair line and sideburns
    g.fillStyle = o.hair || "#241a12";
    g.fillRect(0, 0, w, 6);
    g.fillRect(0, 0, 5, 16);
    g.fillRect(w - 5, 0, 5, 16);

    // brows
    g.fillStyle = o.brow || "#2b1d12";
    if (o.angry) {
      g.fillRect(9, 14, 19, 4);
      g.fillRect(8, 18, 8, 3);
      g.fillRect(36, 14, 19, 4);
      g.fillRect(48, 18, 8, 3);
    } else if (o.worried) {
      g.fillRect(11, 15, 16, 3);
      g.fillRect(17, 18, 9, 3);
      g.fillRect(37, 15, 16, 3);
      g.fillRect(38, 18, 9, 3);
    } else {
      g.fillRect(11, 16, 16, 4);
      g.fillRect(37, 16, 16, 4);
    }

    // eyes: sclera, iris, pupil, glint
    [18, 42].forEach((cx, i) => {
      g.fillStyle = "#f6f1e6";
      g.fillRect(cx - 7, 24, 14, 9);
      g.fillStyle = "#8a5c3a";
      g.fillRect(cx - 4, 25, 7, 8);
      g.fillStyle = o.iris || "#2a1a10";
      g.fillRect(cx - 3, 25, 5, 8);
      g.fillStyle = "#0d0a08";
      g.fillRect(cx - 2, 27, 3, 5);
      g.fillStyle = "#ffffff";
      g.fillRect(cx - 2, 26, 2, 2);
      g.fillStyle = "rgba(40,24,14,.55)";
      g.fillRect(cx - 7, 23, 14, 2);
      if (o.tired) {
        g.fillStyle = "rgba(120,80,60,.5)";
        g.fillRect(cx - 7, 32, 14, 2);
      }
    });

    // nose
    g.fillStyle = "rgba(140,88,58,.5)";
    g.fillRect(30, 33, 4, 10);
    g.fillStyle = "rgba(120,70,44,.6)";
    g.fillRect(29, 42, 7, 2);

    // mouth
    g.fillStyle = o.mouth || "#6d3a2a";
    if (o.smile) {
      g.fillRect(25, 50, 15, 2);
      g.fillRect(22, 48, 5, 2);
      g.fillRect(38, 48, 5, 2);
    } else if (o.worried) {
      g.fillRect(27, 50, 11, 6);
      g.fillStyle = "#3a1a12";
      g.fillRect(28, 51, 9, 4);
    } else if (o.angry) {
      g.fillRect(24, 51, 17, 2);
      g.fillRect(25, 49, 4, 2);
      g.fillRect(36, 49, 4, 2);
    } else {
      g.fillRect(25, 50, 15, 2);
    }

    if (o.moustache) {
      g.fillStyle = o.hair || "#241a12";
      g.fillRect(24, 47, 17, 3);
    }
    if (o.beard) {
      g.fillStyle = "rgba(36,26,18,.75)";
      for (let i = 0; i < 60; i++) {
        g.fillRect(12 + Math.random() * 40, 40 + Math.random() * 20, 2, 2);
      }
    } else if (o.stubble) {
      g.fillStyle = "rgba(40,30,22,.35)";
      for (let i = 0; i < 34; i++) {
        g.fillRect(14 + Math.random() * 36, 44 + Math.random() * 16, 1, 1);
      }
    }
    if (o.scar) {
      g.fillStyle = "rgba(150,60,50,.55)";
      g.fillRect(49, 20, 2, 9);
      g.fillRect(51, 28, 2, 4);
    }
    if (o.headband) {
      g.fillStyle = o.headband;
      g.fillRect(0, 8, w, 5);
      g.fillStyle = "rgba(255,255,255,.25)";
      g.fillRect(0, 8, w, 1);
    }
    // cheeks
    g.fillStyle = "rgba(220,120,100,.18)";
    g.beginPath();
    g.ellipse(10, 42, 7, 4, 0, 0, 7);
    g.ellipse(54, 42, 7, 4, 0, 0, 7);
    g.fill();
    // jaw shading
    g.fillStyle = "rgba(120,74,48,.20)";
    g.fillRect(0, h - 5, w, 5);
  }

  function faceMat(key, o) {
    if (!SOL.faces) SOL.faces = {};
    if (SOL.faces[key]) return SOL.faces[key];
    const t = ctex("face" + key, 64, 64, (g, w, h) => paintFace(g, w, h, o));
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
    SOL.stone = L(blockTex("stone", "#bdb6a6", "rgba(72,66,56,.5)", ["#d6cfbe", "#a9a190", "#948c7c"], 5));
    SOL.stoneDark = L(blockTex("stoneD", "#9a958a", "rgba(52,48,42,.6)", ["#b3aea2", "#807a70", "#6c665c"], 9));
    SOL.concrete = L(blockTex("conc", "#b9b7ad", "rgba(90,88,82,.35)", ["#cbc9bf", "#a6a49a", "#94928a"], 13));
    SOL.sand = L(ctex("sand", 32, 32, (g, w, h) => {
      g.fillStyle = "#a08a5e";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 4) {
        g.fillStyle = y % 8 ? "rgba(96,78,44,.5)" : "rgba(238,222,176,.45)";
        g.fillRect(0, y, w, 1);
      }
      speck(g, w, h, ["#8a7448", "#e2d2a4"], 21, 400);
    }));
    SOL.wood = L(ctex("wood", 32, 32, (g, w, h) => {
      g.fillStyle = "#8a6034";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 8) {
        g.fillStyle = "#68451d";
        g.fillRect(0, y + 7, w, 1);
        g.fillStyle = "#a67a3e";
        g.fillRect(0, y + 1, w, 1);
      }
      speck(g, w, h, ["#5e3f1c", "#d8ab63"], 4, 320);
    }));
    SOL.woodDark = L(ctex("woodD", 32, 32, (g, w, h) => {
      g.fillStyle = "#6f4b23";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 8) {
        g.fillStyle = "#4b3016";
        g.fillRect(0, y + 7, w, 1);
      }
      speck(g, w, h, ["#33200c", "#9a7038"], 8, 240);
    }));
    SOL.camo = L(camoTex("camo", ["#5c6b3c", "#47542e", "#6f7d4a", "#3b4527", "#7d7048"], 31));
    SOL.camoDark = L(camoTex("camoD", ["#424d2c", "#333d22", "#4f5a36", "#2a321c", "#5c5334"], 37));
    SOL.camoBoss = L(camoTex("camoBoss", ["#4a4a30", "#33331f", "#5c5c3c", "#262616"], 41));
    SOL.steel = L(null, { color: 0x6a7078 });
    SOL.helm = L(camoTex("helm", ["#4d5a33", "#3a4526", "#5c6b40", "#2f3820"], 43, 24));
    SOL.belt = L(null, { color: 0x2f2a20 });
    SOL.boot = L(null, { color: 0x241d15 });
    SOL.skin = L(null, { color: 0xe8b48c });
    SOL.black = L(null, { color: 0x1b1b1d });
    SOL.gunmetal = L(null, { color: 0x34383a });
    SOL.red = L(null, { color: 0xc0281f });
    SOL.gold = L(null, { color: 0xd8a83c });
    SOL.white = L(null, { color: 0xf3efe2 });
    SOL.civil = L(ctex("civil", 32, 32, (g, w, h) => {
      g.fillStyle = "#ece4d0";
      g.fillRect(0, 0, w, h);
      speck(g, w, h, ["#cfc4a8", "#ffffff"], 61, 260);
    }));
    SOL.civilPant = L(null, { color: 0x3d4a63 });
    SOL.hair = L(null, { color: 0x241a12 });
    SOL.olive = L(null, { color: 0x5c6438 });
    SOL.oliveDark = L(null, { color: 0x434a26 });
    SOL.tire = L(null, { color: 0x22242a });
    SOL.barrel = L(ctex("barrel", 32, 32, (g, w, h) => {
      g.fillStyle = "#b8302a";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#8e1f1a";
      g.fillRect(0, 4, w, 3);
      g.fillRect(0, 24, w, 3);
      speck(g, w, h, ["#e05a4a", "#7a1612"], 77, 260);
    }));
    SOL.star = new T.MeshBasicMaterial({
      map: ctex("star", 64, 64, (g, w, h) => {
        g.clearRect(0, 0, w, h);
        g.fillStyle = "#f7f5ec";
        starPath(g, 32, 32, 28);
        g.fill();
      }),
      transparent: true
    });
    SOL.flagKR = L(flagKR(), { side: T.DoubleSide });
    SOL.flagKP = L(flagKP(), { side: T.DoubleSide });
    SOL.street = L(ctex("street", 64, 64, (g, w, h) => {
      g.fillStyle = "#9b9587";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(70,66,58,.45)";
      g.lineWidth = 1;
      const R = rng(91);
      for (let y = 0; y < h; y += 16) {
        for (let x = (y / 16) % 2 ? 8 : 0; x < w; x += 16) {
          g.fillStyle = ["#b6b0a2", "#9d9789", "#ada695", "#928c7e"][(R() * 4) | 0];
          g.fillRect(x + 1, y + 1, 14, 14);
          g.strokeRect(x + 0.5, y + 0.5, 15, 15);
        }
      }
      speck(g, w, h, ["#6f6a5e", "#cfc9bb"], 55, 900);
      for (let i = 0; i < 8; i++) {
        g.globalAlpha = 0.25;
        g.fillStyle = "#8a7a58";
        g.beginPath();
        g.arc(R() * w, R() * h, 4 + R() * 9, 0, 7);
        g.fill();
      }
      g.globalAlpha = 1;
    }));
    SOL.grass = L(null, { color: 0x6d8a3f });
    SOL.tan = L(camoTex("tan", ["#ddcda8", "#cdbb94", "#e8dcc0", "#b9a681", "#f0e6cc"], 71));
    SOL.tanDark = L(camoTex("tanD", ["#8e8062", "#7a6d52", "#9d8f6e", "#6b5f47"], 73));
    SOL.vest = L(null, { color: 0x2b3036 });
    SOL.enemyCloth = L(null, { color: 0x5c6b39 });
    SOL.enemyDark = L(null, { color: 0x49562c });
    SOL.enemyBelt = L(null, { color: 0x6d4a28 });
    SOL.enemyCap = L(null, { color: 0x53612f });
    SOL.helmAlly = L(null, { color: 0x4b5145 });
    SOL.bandW = L(null, { color: 0xe8e6dc });
    SOL.bandB = L(null, { color: 0x22407c });
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

  function makeSoldier(role) {
    makeSol();
    const g = new T.Group();
    const body = new T.Group();
    g.add(body);
    const civ = role === "hostage";
    const tough = role === "tough";
    const boss = role === "boss";
    const uniform = civ ? SOL.civil : boss ? SOL.camoBoss : tough ? SOL.camoDark : SOL.enemyCloth;
    const pants = civ ? SOL.civilPant : tough || boss ? SOL.enemyDark : SOL.enemyDark;
    // legs and boots
    part(body, 0.21, 0.44, 0.23, -0.13, 0.42, 0, pants);
    part(body, 0.21, 0.44, 0.23, 0.13, 0.42, 0, pants);
    part(body, 0.24, 0.15, 0.32, -0.13, 0.08, 0.03, SOL.boot);
    part(body, 0.24, 0.15, 0.32, 0.13, 0.08, 0.03, SOL.boot);
    // torso
    part(body, 0.56, 0.54, 0.34, 0, 0.92, 0, uniform);
    part(body, 0.58, 0.09, 0.36, 0, 0.68, 0, civ ? SOL.belt : SOL.enemyBelt);
    if (!civ && !boss) part(body, 0.3, 0.16, 0.02, -0.1, 0.98, 0.175, SOL.belt);
    if (tough) {
      part(body, 0.46, 0.34, 0.09, 0, 0.98, 0.2, SOL.steel);
      part(body, 0.12, 0.12, 0.03, 0, 1.02, 0.26, SOL.gold);
    }
    if (boss) {
      part(body, 0.6, 0.1, 0.38, 0, 1.17, 0, SOL.red);
      part(body, 0.16, 0.06, 0.4, -0.24, 1.2, 0, SOL.gold);
      part(body, 0.16, 0.06, 0.4, 0.24, 1.2, 0, SOL.gold);
    }
    // head
    const faceKey = civ ? "hostage" : boss ? "boss" : tough ? "tough" : role === "throw" ? "thrower" : "grunt";
    const head = new T.Mesh(new T.BoxGeometry(0.44, 0.44, 0.44), [SOL.skin, SOL.skin, SOL.hair, SOL.skin, headFor(faceKey), SOL.skin]);
    head.position.set(0, 1.33, 0);
    head.castShadow = true;
    head.receiveShadow = true;
    body.add(head);
    part(body, 0.05, 0.11, 0.1, -0.225, 1.32, 0.01, SOL.skin);
    part(body, 0.05, 0.11, 0.1, 0.225, 1.32, 0.01, SOL.skin);
    if (civ) {
      part(body, 0.46, 0.13, 0.46, 0, 1.57, 0, SOL.hair);
    } else if (boss) {
      part(body, 0.5, 0.12, 0.36, 0, 1.6, -0.02, SOL.black);
      part(body, 0.54, 0.14, 0.52, 0, 1.67, 0.02, SOL.black);
      part(body, 0.56, 0.06, 0.24, 0, 1.62, 0.24, SOL.black);
      part(body, 0.16, 0.13, 0.03, 0, 1.7, 0.3, SOL.red);
    } else {
      part(body, 0.54, 0.18, 0.54, 0, 1.58, 0, tough ? SOL.steel : SOL.enemyCap);
      part(body, 0.56, 0.07, 0.22, 0, 1.51, 0.28, tough ? SOL.steel : SOL.enemyCap);
      part(body, 0.14, 0.14, 0.03, 0, 1.6, 0.28, SOL.red);
    }
    // arms
    const armL = new T.Group();
    const armR = new T.Group();
    armL.position.set(-0.34, 1.12, 0);
    armR.position.set(0.34, 1.12, 0);
    part(armL, 0.17, 0.44, 0.19, 0, -0.2, 0, uniform);
    part(armR, 0.17, 0.44, 0.19, 0, -0.2, 0, uniform);
    part(armL, 0.14, 0.13, 0.16, 0, -0.46, 0, SOL.skin);
    part(armR, 0.14, 0.13, 0.16, 0, -0.46, 0, SOL.skin);
    body.add(armL, armR);
    if (civ) {
      armL.rotation.z = 2.5;
      armR.rotation.z = -2.5;
    } else {
      // rifle held at port arms
      const rifle = new T.Group();
      part(rifle, 0.08, 0.09, 0.86, 0, 0, 0, SOL.gunmetal);
      part(rifle, 0.06, 0.16, 0.12, 0, -0.13, -0.1, SOL.black);
      part(rifle, 0.05, 0.05, 0.3, 0, 0.04, -0.52, SOL.black);
      part(rifle, 0.07, 0.1, 0.2, 0, -0.05, 0.3, SOL.woodDark);
      rifle.position.set(0, 0.86, 0.24);
      rifle.rotation.x = -0.18;
      body.add(rifle);
      armL.rotation.x = -0.55;
      armR.rotation.x = -0.2;
      g.userData.rifle = rifle;
    }
    if (role === "throw") {
      part(body, 0.3, 0.34, 0.16, 0, 0.96, -0.24, SOL.camoDark);
      const nade = new T.Group();
      part(nade, 0.1, 0.14, 0.1, 0, 0, 0, SOL.oliveDark);
      nade.position.set(0.34, 0.62, 0.16);
      body.add(nade);
      g.userData.nade = nade;
      armR.rotation.x = -1.4;
    }
    if (boss) {
      const cape = new T.Mesh(new T.PlaneGeometry(0.72, 0.95), new T.MeshLambertMaterial({ color: 0x8e1f1a, side: T.DoubleSide }));
      cape.position.set(0, 0.95, -0.26);
      cape.rotation.x = 0.08;
      body.add(cape);
      g.scale.setScalar(1.5);
    } else if (tough) {
      g.scale.setScalar(1.5);
    } else if (!boss) {
      g.scale.setScalar(1.28);
    }
    g.userData.body = body;
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

  function makeAlly() {
    makeSol();
    const g = new T.Group();
    const b = new T.Group();
    g.add(b);
    // kneeling right leg, left knee up
    part(b, 0.24, 0.2, 0.62, -0.16, 0.1, -0.05, SOL.tanDark);
    part(b, 0.24, 0.5, 0.26, -0.16, 0.28, 0.28, SOL.tanDark);
    part(b, 0.26, 0.18, 0.5, 0.18, 0.09, 0.02, SOL.tanDark);
    part(b, 0.26, 0.18, 0.44, 0.18, 0.2, 0.3, SOL.boot);
    part(b, 0.56, 0.56, 0.34, 0, 0.68, 0.02, SOL.tan);
    part(b, 0.5, 0.44, 0.1, 0, 0.72, 0.2, SOL.vest);
    part(b, 0.14, 0.12, 0.06, -0.16, 0.78, 0.24, SOL.vest);
    part(b, 0.14, 0.12, 0.06, 0.16, 0.78, 0.24, SOL.vest);
    part(b, 0.58, 0.1, 0.36, 0, 0.44, 0.02, SOL.belt);
    const ahead = new T.Mesh(new T.BoxGeometry(0.44, 0.44, 0.44), [SOL.skin, SOL.skin, SOL.hair, SOL.skin, headFor("ally"), SOL.skin]);
    ahead.position.set(0, 1.14, 0.04);
    ahead.castShadow = true;
    ahead.receiveShadow = true;
    b.add(ahead);
    part(b, 0.05, 0.11, 0.1, -0.225, 1.13, 0.05, SOL.skin);
    part(b, 0.05, 0.11, 0.1, 0.225, 1.13, 0.05, SOL.skin);
    part(b, 0.54, 0.16, 0.56, 0, 1.36, 0.02, SOL.helmAlly);
    part(b, 0.46, 0.1, 0.48, 0, 1.46, 0.02, SOL.helmAlly);
    part(b, 0.34, 0.06, 0.36, 0, 1.52, 0.02, SOL.helmAlly);
    part(b, 0.58, 0.06, 0.6, 0, 1.29, 0.02, SOL.helmAlly);
    part(b, 0.18, 0.12, 0.03, 0, 1.37, 0.3, SOL.white);
    part(b, 0.09, 0.06, 0.04, -0.024, 1.38, 0.315, SOL.red);
    part(b, 0.09, 0.06, 0.04, 0.024, 1.36, 0.315, SOL.bandB);
    // arms forward, rifle along +x
    const armL = new T.Group(), armR = new T.Group();
    armL.position.set(-0.32, 0.92, 0.06);
    armR.position.set(0.32, 0.92, 0.06);
    part(armL, 0.17, 0.5, 0.19, 0, -0.2, 0.16, SOL.tan);
    part(armR, 0.17, 0.5, 0.19, 0, -0.2, 0.16, SOL.tan);
    part(armL, 0.185, 0.09, 0.205, 0, -0.06, 0.16, SOL.bandW);
    part(armL, 0.19, 0.045, 0.21, 0, -0.095, 0.16, SOL.bandB);
    armL.rotation.x = -1.25;
    armR.rotation.x = -1.05;
    b.add(armL, armR);
    const rifle = new T.Group();
    part(rifle, 0.86, 0.1, 0.09, 0, 0, 0, SOL.gunmetal);
    part(rifle, 0.12, 0.15, 0.08, -0.1, -0.12, 0, SOL.black);
    part(rifle, 0.28, 0.05, 0.05, 0.55, 0.02, 0, SOL.black);
    part(rifle, 0.22, 0.1, 0.07, -0.42, -0.03, 0, SOL.woodDark);
    rifle.position.set(0.1, 0.72, 0.46);
    rifle.rotation.y = -Math.PI / 2;
    b.add(rifle);
    b.rotation.y = 0.22;
    g.userData.armL = armL;
    g.userData.armR = armR;
    return g;
  }

  function makeBarrel(x, z, y) {
    makeSol();
    const g = new T.Group();
    const c = new T.Mesh(new T.CylinderGeometry(0.33, 0.33, 0.92, 10, 1), SOL.barrel);
    c.position.y = 0.46;
    c.castShadow = true;
    c.receiveShadow = true;
    g.add(c);
    [0.1, 0.82].forEach((yy) => {
      const r = new T.Mesh(new T.CylinderGeometry(0.355, 0.355, 0.09, 10, 1), SOL.steel);
      r.position.y = yy;
      g.add(r);
    });
    const band = new T.Mesh(new T.CylinderGeometry(0.345, 0.345, 0.06, 10, 1), SOL.stoneDark);
    band.position.y = 0.46;
    g.add(band);
    const top = new T.Mesh(new T.CylinderGeometry(0.31, 0.31, 0.05, 10, 1), SOL.oliveDark);
    top.position.y = 0.94;
    g.add(top);
    const starBg = new T.Mesh(new T.PlaneGeometry(0.46, 0.46), new T.MeshBasicMaterial({ color: 0x63120f }));
    starBg.position.set(0, 0.5, 0.343);
    g.add(starBg);
    const star = new T.Mesh(new T.PlaneGeometry(0.42, 0.42), SOL.star);
    star.position.set(0, 0.5, 0.352);
    g.add(star);
    g.position.set(x, y === undefined ? 0.3 : y, z);
    g.userData.h = 1.0;
    return g;
  }

  function makeCrate(x, z, s, y) {
    makeSol();
    const g = new T.Group();
    part(g, s, s, s, 0, s / 2, 0, SOL.wood);
    part(g, s * 1.02, s * 0.1, s * 1.02, 0, s * 0.1, 0, SOL.woodDark);
    part(g, s * 1.02, s * 0.1, s * 1.02, 0, s * 0.9, 0, SOL.woodDark);
    part(g, s * 0.12, s * 1.02, s * 1.02, -s * 0.42, s * 0.5, 0, SOL.woodDark);
    part(g, s * 0.12, s * 1.02, s * 1.02, s * 0.42, s * 0.5, 0, SOL.woodDark);
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
      part(g, s * 0.1, s * 0.1, s * 0.1, sx * s * 0.46, s * 0.06, sz * s * 0.46, SOL.steel);
      part(g, s * 0.1, s * 0.1, s * 0.1, sx * s * 0.46, s * 0.94, sz * s * 0.46, SOL.steel);
    }));
    g.position.set(x, y === undefined ? 0.3 : y, z);
    g.rotation.y = (Math.random() - 0.5) * 0.5;
    return g;
  }

  function makeSandbags(x, z, w, rows) {
    makeSol();
    const g = new T.Group();
    const bw = 0.52, bh = 0.26, bd = 0.36;
    for (let r = 0; r < rows; r++) {
      const n = Math.max(1, Math.round(w / bw) - (r % 2 ? 1 : 0));
      for (let i = 0; i < n; i++) {
        const m = part(g, bw * 0.94, bh, bd, -w / 2 + bw / 2 + i * bw + (r % 2 ? bw / 2 : 0), bh / 2 + r * bh * 0.94, 0, SOL.sand);
        m.rotation.y = (Math.random() - 0.5) * 0.18;
        m.rotation.z = (Math.random() - 0.5) * 0.06;
      }
    }
    g.position.set(x, 0.3, z);
    return g;
  }

  function makeBarrier(x, z) {
    makeSol();
    const g = new T.Group();
    part(g, 1.7, 0.62, 0.4, 0, 0.31, 0, SOL.concrete);
    part(g, 1.5, 0.16, 0.34, 0, 0.7, 0, SOL.concrete);
    part(g, 0.3, 0.2, 0.42, -0.6, 0.42, 0, SOL.stoneDark);
    g.position.set(x, 0.3, z);
    g.rotation.y = (Math.random() - 0.5) * 0.12;
    return g;
  }

  function makeTruck(x, z) {
    makeSol();
    const g = new T.Group();
    part(g, 3.0, 0.2, 1.5, 0, 0.66, 0, SOL.oliveDark);
    part(g, 1.5, 0.62, 1.4, -1.05, 1.06, 0, SOL.oliveDark);
    part(g, 0.5, 0.5, 1.36, -1.6, 1.1, 0, SOL.olive);
    part(g, 0.12, 0.36, 1.2, -1.86, 1.08, 0, SOL.glass || SOL.oliveDark);
    part(g, 1.7, 0.7, 1.46, 0.75, 1.1, 0, SOL.olive);
    part(g, 1.8, 0.08, 1.5, 0.75, 1.46, 0, SOL.oliveDark);
    [-1.0, 0.4, 1.1].forEach((wx) => {
      [-0.76, 0.76].forEach((wz) => {
        const w = new T.Mesh(new T.CylinderGeometry(0.36, 0.36, 0.24, 10), SOL.tire);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 0.66, wz);
        w.castShadow = true;
        g.add(w);
      });
    });
    g.position.set(x, 0.3, z);
    g.rotation.y = -0.08;
    return g;
  }

  function makeTower(x, z, h) {
    makeSol();
    const g = new T.Group();
    const w = 1.0;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      part(g, 0.14, h, 0.14, (sx * w) / 2, h / 2, (sz * w) / 2, SOL.woodDark);
    });
    part(g, w + 0.5, 0.14, w + 0.5, 0, h, 0, SOL.wood);
    part(g, w + 0.3, 0.5, w + 0.3, 0, h + 0.34, 0, SOL.stoneDark);
    const roof = new T.Mesh(new T.ConeGeometry(1.05, 0.6, 4), SOL.woodDark);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = h + 0.9;
    roof.castShadow = true;
    g.add(roof);
    part(g, 0.08, 0.9, 0.08, 0, h + 0.42, 0.42, SOL.black);
    g.position.set(x, 0.3, z);
    return g;
  }

  function makeCloud(x, y, z, s) {
    makeSol();
    const g = new T.Group();
    const mat = new T.MeshLambertMaterial({ color: 0xffffff, emissive: 0x9fc4e0, emissiveIntensity: 0.35 });
    const n = 4 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const w = s * (0.7 + Math.random() * 0.9);
      part(g, w, s * (0.35 + Math.random() * 0.3), s * 0.7, (i - n / 2) * s * 0.7, Math.random() * s * 0.2, (Math.random() - 0.5) * s * 0.4, mat);
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

  function makeFlag(kind, x, y, z, w, h) {
    makeSol();
    const g = new T.Group();
    const pole = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, h + 0.6, 6), SOL.woodDark);
    pole.position.set(-w / 2 - 0.06, 0.1, 0);
    pole.castShadow = true;
    g.add(pole);
    const cloth = new T.Mesh(new T.PlaneGeometry(w, h), kind === "kp" ? SOL.flagKP : SOL.flagKR);
    cloth.position.set(0, 0, 0.01);
    g.add(cloth);
    g.position.set(x, y, z);
    g.userData.cloth = cloth;
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
  const GATE_Z = 57.6;
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
        { role: "throw", lat: 3.4, dep: 13.4, cover: "crate" },
        { role: "weak", lat: 8.2, dep: 10.3, elev: 1.05, cover: "truckbed" },
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
      id: 4, name: "gate", hold: [YARD_MID, 45.5], yaw: 0, look: [YARD_MID, 1.6, 55.5], time: 30,
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

  function viewFov() {
    const asp = innerWidth / Math.max(1, innerHeight);
    return asp < 0.8 ? 60 : 58;
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
    const mk = (hex) => { const m = new T.MeshLambertMaterial({ color: hex }); m.color.convertSRGBToLinear(); return m; };
    const slide = mk(0x3e4652);
    const slideDark = mk(0x2b313a);
    const slideTop = mk(0x4a5563);
    const poly = mk(0x1a1e24);
    const bore = mk(0x07090b);
    const steel = mk(0x6b747e);
    const skin = mk(0xc08a5e);
    const olive = mk(0x4a5430);
    const gripMat = new T.MeshLambertMaterial({
      color: 0x232a31,
      map: ctex("grip", 32, 32, (gg, w, h) => {
        gg.fillStyle = "#2a323a";
        gg.fillRect(0, 0, w, h);
        for (let y = 1; y < h; y += 3) for (let x = 1; x < w; x += 3) {
          gg.fillStyle = ((x + y) % 6) ? "#1b2127" : "#3a444e";
          gg.fillRect(x, y, 2, 2);
        }
      })
    });
    gripMat.color.convertSRGBToLinear();
    const add = (w, h, d, x, y, z, mat) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      g.add(m);
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
    // camo sleeves running off the bottom of the frame
    add(0.15, 0.16, 0.24, 0.015, -0.29, 0.21, olive);
    add(0.155, 0.12, 0.12, 0.015, -0.35, 0.33, olive);
    add(0.14, 0.15, 0.22, -0.12, -0.32, 0.2, olive);
    add(0.14, 0.11, 0.11, -0.13, -0.37, 0.31, olive);

    const f = add(0.085, 0.085, 0.12, 0, 0.062, -0.44, new T.MeshBasicMaterial({ color: 0xfff3b0 }));
    f.visible = false;
    const halo = add(0.1, 0.1, 0.02, 0, 0.062, -0.42, new T.MeshBasicMaterial({ color: 0xffc14a, transparent: true, opacity: 0.8, depthWrite: false }));
    halo.visible = false;
    const flashLight = new T.PointLight(0xffc878, 0, 6, 2);
    flashLight.position.set(0, 0.06, -0.42);
    g.add(flashLight);

    /* the barrel runs down -Z, so a zeroed rig points dead ahead at the
       reticle. Sitting low-right with a touch of inward yaw/pitch makes
       the muzzle converge on the centre of the screen. */
    g.position.set(0.2, -0.235, -0.66);
    g.rotation.set(0.05, 0.085, 0.012);
    g.scale.setScalar(0.4);
    camera.add(g);
    return { g, flash: f, halo, light: flashLight };
  }

  function roleTag(el) {
    const d = document.createElement("div");
    d.className = "railThreat";
    d.textContent = "!";
    document.body.appendChild(d);
    el._tag = d;
    return d;
  }

  /* ---------------- course dressing ---------------- */

  function darkMat(col) {
    const m = new T.MeshLambertMaterial({ color: col === undefined ? 0x14161a : col });
    m.color.convertSRGBToLinear();
    return m;
  }

  function blockAt(S, x0, x1, z0, z1, h, mat, y0) {
    const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0);
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set((x0 + x1) / 2, (y0 === undefined ? 0.3 : y0) + h / 2, (z0 + z1) / 2);
    m.castShadow = true;
    m.receiveShadow = true;
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
    S.add(par);
    for (let x = x0 + 0.8; x < x1; x += 2.2) {
      const b = new T.Mesh(new T.BoxGeometry(0.3, 0.4, 0.34), SOL.stoneDark);
      b.position.set(x, y - 0.25, zEdge + 0.02);
      S.add(b);
    }
    return g;
  }

  function makeGate(S) {
    const g = new T.Group();
    const stoneMat = new T.MeshLambertMaterial({ map: cloneMat(SOL.stone, 6, 3).map });
    const OPEN = 5.2, HALF = OPEN / 2;
    // two piers and a lintel, so the arch is a real opening you can see through
    [[-8.8, -HALF], [HALF, 8.8]].forEach(([a, b]) => {
      const w = b - a;
      const pier = new T.Mesh(new T.BoxGeometry(w, 9.2, 1.8), stoneMat);
      pier.position.set(YARD_MID + (a + b) / 2, 0.3 + 4.6, GATE_Z);
      pier.castShadow = true;
      pier.receiveShadow = true;
      g.add(pier);
    });
    const top = new T.Mesh(new T.BoxGeometry(OPEN, 3.8, 1.8), stoneMat);
    top.position.set(YARD_MID, 0.3 + 5.4 + 1.9, GATE_Z);
    g.add(top);
    // dark tunnel behind the opening
    const tunnel = new T.Mesh(new T.BoxGeometry(OPEN - 0.3, 5.4, 4.0), darkMat(0x0e1012));
    tunnel.position.set(YARD_MID, 0.3 + 2.7, GATE_Z + 2.1);
    g.add(tunnel);
    const lintel = new T.Mesh(new T.BoxGeometry(OPEN + 1.0, 0.5, 2.1), SOL.stoneDark);
    lintel.position.set(YARD_MID, 0.3 + 5.65, GATE_Z - 0.1);
    g.add(lintel);
    // crenellations along the top
    for (let i = -8; i <= 8; i++) {
      const c = new T.Mesh(new T.BoxGeometry(0.8, 0.8, 2.0), SOL.stoneDark);
      c.position.set(YARD_MID + i * 1.15, 0.3 + 9.6, GATE_Z);
      g.add(c);
    }
    // corner towers
    [-8.6, 8.6].forEach((dx) => {
      const t = new T.Mesh(new T.BoxGeometry(3.2, 11.4, 3.4), stoneMat);
      t.position.set(YARD_MID + dx, 0.3 + 5.7, GATE_Z - 0.2);
      t.castShadow = true;
      g.add(t);
      for (let i = -1; i <= 1; i++) {
        const c = new T.Mesh(new T.BoxGeometry(0.9, 0.7, 3.5), SOL.stoneDark);
        c.position.set(YARD_MID + dx + i * 1.05, 0.3 + 11.6, GATE_Z - 0.2);
        g.add(c);
      }
    });
    const bigStar = new T.Mesh(new T.PlaneGeometry(3.0, 3.0), SOL.star);
    bigStar.position.set(YARD_MID, 0.3 + 7.6, GATE_Z - 0.95);
    g.add(bigStar);
    S.add(g);
    const f1 = makeFlag("kp", YARD_MID - 5.4, 6.6, GATE_Z - 1.2, 2.2, 1.5);
    S.add(f1);
    const f2 = makeFlag("kr", YARD_MID + 3.6, 8.7, GATE_Z - 1.2, 2.2, 1.5);
    S.add(f2);
    return [f1, f2];
  }

  function dressBattlefield(ctx) {
    makeSol();
    const S = new T.Group();
    S.name = "battlefield";
    ctx.scene.add(S);

    // bright day sky, haze and sun
    const sky = makeSkyDome();
    sky.geometry.dispose();
    sky.geometry = new T.SphereGeometry(150, 24, 16);
    sky.position.set(0, 0, 10);
    S.add(sky);
    ctx.scene.background = new T.Color(0x8ec7ee).convertSRGBToLinear();
    ctx.scene.fog = new T.Fog(0xbcd9ee, 95, 235);
    if (ctx.scene.fog.color && ctx.scene.fog.color.convertSRGBToLinear) ctx.scene.fog.color.convertSRGBToLinear();
    if (ctx.LT) {
      const LT = ctx.LT;
      if (LT.hemi) { LT.hemi.intensity = 0.52; LT.hemi.color.setHex(0xdcefff); LT.hemi.groundColor && LT.hemi.groundColor.setHex(0x7d7154); }
      if (LT.amb) { LT.amb.intensity = 0.24; LT.amb.color && LT.amb.color.setHex(0xb9d2e8); }
      if (LT.key) { LT.key.intensity = 1.05; LT.key.color.setHex(0xfff0c8); }
      if (LT.moon) { LT.moon.intensity = 0.1; LT.moon.color && LT.moon.color.setHex(0xa8c4e6); }
      if (LT.rim) { LT.rim.intensity = 0.34; LT.rim.color && LT.rim.color.setHex(0xffc79a); }
    }
    if (ctx.renderer) ctx.renderer.toneMappingExposure = 0.96;

    // ---- ground: one big pad so no hole ever shows ----
    const tex = ctex("dirt", 64, 64, (g, w, h) => {
      g.fillStyle = "#7d7a5e";
      g.fillRect(0, 0, w, h);
      speck(g, w, h, ["#6a6748", "#8f8b6a", "#5c5a3f"], 13, 1400);
    });
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(26, 26);
    const ground = new T.Mesh(new T.PlaneGeometry(260, 260), new T.MeshLambertMaterial({ map: tex }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(-18, 0.24, 22);
    ground.receiveShadow = true;
    S.add(ground);

    const pave = (w, d, x, z, tint, rx, ry) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshLambertMaterial({ map: cloneMat(SOL.street, rx, ry).map, color: tint || 0xffffff }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.3, z);
      m.receiveShadow = true;
      S.add(m);
      return m;
    };
    pave(26.4, 35, 0, 3.2, 0xffffff, 8, 11);
    pave(15.6, 9.0, -5.4, 24.0, 0xf2eee4, 5, 3);
    pave(17.4, 7.4, -21.6, 24, 0xd2d0cc, 5, 2.4);
    pave(18.4, 40.4, YARD_MID, 38, 0xf0eadd, 6, 12);

    // ---- street furniture shared by the zones ----
    const darkHole = darkMat(0x111316);

    // ================= PLAZA =================
    // west block (runs the whole west side and south of the alley)
    blockAt(S, -30, -13, -14, 20.4, 7.6, SOL.stone);
    roofCap(S, -30, -13, -14, 20.4, 7.6);
    winRun(S, "x", -12.94, -12, 18.4, 3.0, 6.6, 11);
    // east block
    blockAt(S, 13, 24, -14, 22, 9.0, SOL.stone);
    roofCap(S, 13, 24, -14, 22, 9.0);
    winRun(S, "x", 12.94, -12, 20.4, 3.0, 8.2, 17);
    // north block: the wall the rail turns around
    blockAt(S, 1.5, 14, 21.5, 33, 6.6, SOL.stoneDark);
    roofCap(S, 1.5, 14, 21.5, 33, 6.6);
    winRun(S, "z", 21.44, 2.4, 13.4, 2.8, 5.8, 23);
    winRun(S, "x", 1.44, 22.2, 32.4, 2.8, 5.8, 29);
    // north-west block closes the corner alcove so the sky never shows through
    blockAt(S, -13, 1.5, 25.6, 40, 7.4, SOL.stone);
    roofCap(S, -13, 1.5, 25.6, 40, 7.4);
    winRun(S, "z", 25.54, -12, 0.4, 3.0, 6.4, 61);
    const cornerBanner = makeFlag("kp", -4.2, 3.1, 25.5, 2.6, 1.7);
    S.add(cornerBanner);
    // south block closes the start
    blockAt(S, -14, 24, -22, -14, 8.4, SOL.stone);
    roofCap(S, -14, 24, -22, -14, 8.4);

    // plaza kerbs and clutter
    blockAt(S, -13, -12.4, -14, 20.4, 0.28, SOL.concrete, 0.3);
    blockAt(S, 12.4, 13, -14, 20.4, 0.28, SOL.concrete, 0.3);
    [15, -3, -9].forEach((z) => {
      S.add(makeFlag(z % 2 ? "kr" : "kp", -12.55, 2.9, z, 2.2, 1.5));
      S.add(makeFlag(z % 2 ? "kp" : "kr", 12.55, 2.9, z + 5, 2.2, 1.5));
    });
    S.add(makeTower(-11.4, 17.2, 5.2));
    S.add(makeTower(11.2, 19.0, 6.0));
    S.add(makeCrate(-11.6, 6.2, 0.8));
    S.add(makeCrate(-10.9, 7.0, 0.62));
    S.add(makeSandbags(-11.5, 12.2, 2.0, 3));
    S.add(makeRubble(-10.4, 4.0, 6));
    S.add(makeRubble(10.8, 9.5, 5));
    S.add(makeCrate(10.8, 3.4, 0.9));
    [[-6, 1], [4, -6], [8, 12]].forEach(([x, z]) => {
      const tree = new T.Group();
      part(tree, 0.34, 2.0, 0.34, 0, 1.0, 0, SOL.woodDark);
      const leaf = new T.Mesh(new T.BoxGeometry(1.9, 1.3, 1.9), SOL.grass);
      leaf.position.y = 2.5;
      leaf.castShadow = true;
      tree.add(leaf);
      tree.position.set(x, 0.3, z);
      S.add(tree);
    });

    // ================= ALLEY =================
    // south side: shopfronts with doorways
    blockAt(S, -30, -13, 8, 20.4, 6.4, SOL.stone);
    roofCap(S, -30, -13, 8, 20.4, 6.4);
    winRun(S, "z", 20.34, -29, -14, 3.4, 5.6, 31);
    doorway(S, -17.2, 20.36, 0, 1.5, 2.3);
    doorway(S, -22.2, 20.36, 0, 1.5, 2.3);
    doorway(S, -27.0, 20.36, 0, 1.4, 2.2);
    // north side
    blockAt(S, -30, -13, 27.6, 40, 6.8, SOL.stoneDark);
    roofCap(S, -30, -13, 27.6, 40, 6.8);
    winRun(S, "z", 27.54, -29, -14, 3.2, 6.0, 37);
    doorway(S, -18.6, 27.58, Math.PI, 1.4, 2.2);
    doorway(S, -24.4, 27.58, Math.PI, 1.4, 2.2);
    // upper walkway with a solid parapet on the south wall
    balcony(S, -27.2, -19.4, 21.95, 20.4, 3.0);
    // awnings and clutter so the alley reads as a street, not a tunnel
    [[-16.4, "s"], [-20.6, "n"], [-25.2, "s"]].forEach(([x, side], i) => {
      const aw = new T.Mesh(new T.BoxGeometry(2.4, 0.14, 1.1), i % 2 ? SOL.enemyCloth : SOL.stoneDark);
      aw.position.set(x, 2.5, side === "s" ? 20.9 : 27.1);
      aw.rotation.x = side === "s" ? -0.16 : 0.16;
      aw.castShadow = true;
      S.add(aw);
    });
    S.add(makeCrate(-15.2, 21.2, 0.75));
    S.add(makeCrate(-14.6, 21.4, 0.55, 1.02));
    S.add(makeCrate(-26.2, 26.6, 0.8));
    S.add(makeSandbags(-19.0, 26.4, 1.8, 2));
    S.add(makeRubble(-16.0, 22.6, 5));
    S.add(makeRubble(-28.2, 25.4, 4));
    S.add(makeBarrel(-28.6, 21.6, 0.3));
    S.add(makeBarrel(-28.6, 22.7, 0.3));
    // hanging banners over the alley
    S.add(makeFlag("kp", -18.2, 4.3, 20.6, 1.8, 1.2));
    S.add(makeFlag("kr", -23.6, 4.3, 27.4, 1.8, 1.2));

    // ================= COURTYARD =================
    blockAt(S, -30, -14, 40, 58, 7.2, SOL.stone);
    roofCap(S, -30, -14, 40, 58, 7.2);
    winRun(S, "x", -30.06, 41, 57, 3.2, 6.4, 43);
    blockAt(S, -58, -48, 12, 58, 8.6, SOL.stoneDark);
    roofCap(S, -58, -48, 12, 58, 8.6);
    winRun(S, "x", -47.94, 14, 57, 3.0, 7.6, 47);
    blockAt(S, -48, -30, 8, 18, 6.2, SOL.stone);
    roofCap(S, -48, -30, 8, 18, 6.2);
    winRun(S, "z", 18.06, -47, -31, 3.0, 5.4, 53);
    // yard perimeter kerb + gate
    const gateFlags = makeGate(S);

    // sandbag bunkers, drums and armour in the yard
    S.add(makeTruck(-45.2, 26.2));
    S.add(makeTruck(-33.0, 53.4));
    S.add(makeSandbags(-45.6, 24.0, 3.2, 3));
    S.add(makeSandbags(-33.2, 21.2, 2.6, 3));
    S.add(makeTower(-46.4, 21.6, 5.4));
    S.add(makeTower(-31.6, 50.8, 6.2));
    S.add(makeBarrier(-44.6, 44.0));
    S.add(makeRubble(-42.0, 27.0, 7));
    S.add(makeRubble(-33.4, 43.0, 6));
    S.add(makeCrate(-46.0, 41.2, 0.9));
    S.add(makeCrate(-45.2, 41.6, 0.62, 1.18));
    const yardFlagA = makeFlag("kp", -30.4, 3.4, 33.4, 2.2, 1.5);
    const yardFlagB = makeFlag("kr", -30.4, 3.4, 46.6, 2.2, 1.5);
    S.add(yardFlagA, yardFlagB);

    // exploding drums in every zone
    const barrels = [];
    const drum = (x, z) => {
      const b = makeBarrel(x, z, 0.3);
      S.add(b);
      barrels.push({ mesh: b, x, z, y: 0.3, dead: false });
    };
    drum(6.9, 10.4); drum(-7.4, 13.9); drum(-25.8, 21.2);
    drum(-22.4, 26.6); drum(-34.6, 39.4); drum(-43.4, 33.0);
    drum(-32.6, 47.6);

    // park the truck that wave 1 uses as elevated cover
    if (waves && waves[0]) {
      const w = waves[0];
      const t = waveXY(w, 8.2, 10.2);
      const truck = makeTruck(t.x, t.z);
      truck.rotation.y = w.yaw + 0.04;
      S.add(truck);
    }
    if (waves && waves[2]) {
      const w = waves[2];
      const t = waveXY(w, -5.0, 11.5);
      const truck = makeTruck(t.x, t.z);
      truck.rotation.y = w.yaw + 0.28;
      S.add(truck);
    }

    // clouds follow the rail
    const clouds = [];
    for (let i = 0; i < 8; i++) {
      const c = makeCloud(-40 + i * 14 + Math.random() * 6, 10.5 + Math.random() * 4, 8 + (i % 3) * 9 + Math.random() * 4, 2.8 + Math.random() * 1.6);
      S.add(c);
      clouds.push(c);
    }

    // our rifleman, kneeling on the near left of the rail
    const ally = makeAlly();
    ally.position.set(-2.0, 0.3, 5.0);
    ally.rotation.y = 0.4;
    S.add(ally);

    const flags = [];
    S.traverse((o) => { if (o.userData && o.userData.cloth) flags.push(o); });
    gateFlags.forEach((f) => flags.push(f));

    dress = {
      root: S, sky, flags, clouds, barrels, ally,
      truck1: waves && waves[0] ? waveXY(waves[0], 8.2, 10.2) : null
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

  function buildCover(p, w) {
    const s = Math.sin(w.yaw), c = Math.cos(w.yaw);
    const rx = c, rz = -s;
    const fx = s, fz = c;
    const side = p.coverSide || 0;
    const cx = p.x - fx * 0.95 + rx * side * 0.18;
    const cz = p.z - fz * 0.95 + rz * side * 0.18;
    const baseY = p.elev || 0.3;
    const wide = Math.min(1.5, (p.scale || 1.28) / 1.28);
    let g = null;
    switch (p.cover) {
      case "sandbag": g = makeSandbags(cx, cz, 2.1 * wide, 4); break;
      case "crate": g = makeCrate(cx, cz, 1.05 * wide); break;
      case "crates": {
        g = new T.Group();
        g.add(makeCrate(0, 0, 1.02, 0.3));
        g.add(makeCrate(0.62, -0.2, 0.78, 0.3));
        const up = makeCrate(-0.1, 0.02, 0.72);
        up.position.y = 1.32;
        g.add(up);
        g.position.set(cx, baseY, cz);
        break;
      }
      case "barrier": g = makeBarrier(cx, cz); break;
      case "bunker": {
        g = new T.Group();
        g.add(makeSandbags(0, 0, 3.2, 4));
        g.add(makeCrate(1.9, 0.4, 0.8, 0.3));
        g.position.set(cx, baseY, cz);
        break;
      }
      case "door": {
        g = new T.Group();
        part(g, 1.05, 1.5, 0.5, 0, 0.75, 0, SOL.concrete);
        part(g, 1.25, 0.18, 0.62, 0, 1.56, 0, SOL.stoneDark);
        part(g, 0.16, 1.3, 0.54, -0.62, 0.65, 0, SOL.stone);
        g.position.set(cx, baseY, cz);
        break;
      }
      case "truckbed": g = makeSandbags(cx, cz, 1.9 * wide, 4); break;
      case "heavy": {
        g = new T.Group();
        part(g, 2.6, 1.15, 0.6, 0, 0.575, 0, SOL.concrete);
        part(g, 2.7, 0.2, 0.72, 0, 1.2, 0, SOL.stoneDark);
        g.add(makeSandbags(0, 0.1, 2.6, 1));
        g.position.set(cx, baseY, cz);
        break;
      }
      case "rail": return null;
      default: g = makeSandbags(cx, cz, 2.0, 3);
    }
    if (!g) return null;
    g.position.y = baseY;
    g.rotation.y = w.yaw;
    g.userData.cover = 1;
    coverRoot.add(g);
    return g;
  }

  /* ---------------- waves ---------------- */

  let coverRoot = null;

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
    pistolBase = { x: rig.g.position.x, y: rig.g.position.y, z: rig.g.position.z };
    flash = rig.flash;
    flashHalo = rig.halo;
    flashLight = rig.light;
    window.__pistol = pistol;
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
        if (e.code === "KeyR" || e.key === "r" || e.key === "R") window.RAIL.reload();
      });
    }
    if (ctx.pl) ctx.pl.inv = 99999;
  }

  function begin(ctx) {
    if (!ctx || !ctx.scene || !ctx.camera) return false;
    if (!booted) boot(ctx);
    SCENE = ctx.scene;
    clearStage(ctx);
    resetNumbers(ctx);
    buildWaves();
    coverRoot = new T.Group();
    coverRoot.name = "covers";
    ctx.scene.add(coverRoot);
    buildPickups(ctx);
    try { dressBattlefield(ctx); } catch (err) { window.__dressErr = String(err && err.stack || err); }
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

  function startWave(w) {
    phase = "fight";
    wave = w;
    waveT = w.def.time || 24;
    waveClean = true;
    curHold = { x: w.hold.x, z: w.hold.z };
    curLook = { x: w.look.x, y: w.look.y, z: w.look.z };
    pathU = w.u;
    const scale0 = w.def.members.length;
    w.def.members.forEach((m, i) => {
      const role = roleOf(m.role);
      const p = waveXY(w, m.lat || 0, m.dep || 8);
      const sc = roleScale(role);
      const post = {
        e: { kind: role, mesh: new T.Object3D(), alive: true, hp: roleHp(role), h: 1.4 * sc, _tag: null },
        role, i,
        x: p.x, z: p.z, y: (m.elev || 0) + 0.3,
        elev: m.elev || 0,
        cover: m.cover || "sandbag",
        coverSide: i % 2 ? 1 : -1,
        peekDir: i % 2 ? 1 : -1,
        scale: sc,
        headTop: 1.67 * sc,
        squashY: 1,
        expose: 0,
        state: role === "hostage" ? "civ" : "hidden",
        stateT: 0.7 + i * 0.42 + Math.random() * 0.7,
        aimMax: roleAim(role),
        aim: roleAim(role),
        fireMax: 1.5 + Math.random() * 0.7,
        hideMin: 0.55 + Math.random() * 0.7,
        nextThrow: 0.8,
        popped: true,
        bob: Math.random() * 6,
        knock: 0
      };
      post.e.hp = roleHp(role);
      post.e.alive = true;
      let sm = null;
      try { sm = makeSoldier(role); } catch (err) { window.__soldierErr = String(err && err.message || err); }
      if (sm && SCENE) {
        sm.position.set(post.x, post.y, post.z);
        sm.visible = true;
        SCENE.add(sm);
        post.mesh = sm;
        post.body = sm.userData.body || sm;
      }
      if (!post.mesh) post.mesh = null;
      posts.push(post);
      if (role === "hostage") post.expose = 1;
      if (role !== "hostage") {
        const nh = coverHeight(post.cover);
        post.squashY = Math.max(0.36, Math.min(0.92, (nh - 0.06) / post.headTop));
        buildCover(post, w);
        roleTag(post.e);
        if (post.e._tag) post.e._tag.style.display = "none";
      }
      // civilians stay put, hands up, facing the player
      if (role === "hostage") post.squashY = 1;
      post.stateT += i * 0.12;
    });
    window.__railPhase = "fight";
  }

  function startBoss(ctx) {
    phase = "boss";
    bossSpawned = true;
    waveT = 40;
    waveClean = true;
    curHold = { x: bossHold.x, z: bossHold.z };
    curLook = { x: BOSS_DEF.look[0], y: BOSS_DEF.look[1], z: BOSS_DEF.look[2] };
    pathU = bossU;
    const w = { yaw: 0, hold: bossHold };
    const spot = BOSS_DEF.spots[1];
    const p = waveXY(w, spot[0], spot[1]);
    const post = {
      e: { kind: "boss", mesh: new T.Object3D(), alive: true, hp: roleHp("boss"), h: 2.1, _tag: null },
      role: "boss", i: 0, isBoss: true,
      x: p.x, z: p.z, y: 0.3, elev: 0,
      cover: "heavy", coverSide: -1, peekDir: 1,
      scale: 1.5, headTop: 2.5, squashY: 0.5, expose: 0,
      state: "hidden", stateT: 1.2,
      aimMax: roleAim("boss"), aim: roleAim("boss"),
      fireMax: 1.7, hideMin: 0.5, nextThrow: 0,
      popped: true, bob: 0, knock: 0, spotI: 1
    };
    let sm = null;
    try { sm = makeSoldier("boss"); } catch (e) {}
    if (sm && SCENE) {
      sm.position.set(post.x, post.y, post.z);
      SCENE.add(sm);
      post.mesh = sm;
      post.body = sm.userData.body || sm;
    }
    posts.push(post);
    bossPost = post;
    buildCover(post, w);
    roleTag(post.e);
    if (post.e._tag) post.e._tag.style.display = "none";
    window.__railPhase = "boss";
  }

  function livingHostiles() {
    return posts.filter((p) => p.e.alive !== false && p.role !== "hostage");
  }

  function exposedHostiles() {
    return posts.filter((p) => p.e.alive !== false && p.role !== "hostage" && p.expose > 0.45);
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
    if (coverRoot) { coverRoot.parent && coverRoot.parent.remove(coverRoot); disposeGeo(coverRoot); }
    coverRoot = new T.Group();
    if (SCENE) SCENE.add(coverRoot);
    wave = null;
    if (phase === "fight") waveI++;
    phase = waveI < waves.length ? "move" : "toBoss";
    window.__railPhase = phase;
  }

  function addPts(ctx, n) {
    if (ctx.addScore) ctx.addScore(n, window.__lastHitPx || null);
    else if (ctx.G) ctx.G.score = (ctx.G.score || 0) + n;
  }

  function hurtPlayer(ctx, dmg) {
    if (ended) return;
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

  function mark(x, y) {
    const d = document.createElement("div");
    d.id = "railMark";
    d.style.left = x + "px";
    d.style.top = y + "px";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 160);
  }

  function gun(name) {
    const g = window.GunSFX;
    if (!g) return;
    try { g.unlock(); g[name] && g[name](); } catch (e) {}
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
    a.getWorldPosition(from);
    from.y += 1.2;
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
    posts.forEach((p) => { if (p.e.alive !== false && p.expose > 0.42 && p.mesh) addOwned(p.mesh, p, "foe"); });
    shots3.forEach((s) => addOwned(s.mesh, s, "shot"));
    pickups.forEach((p) => { if (!p.taken) addOwned(p.mesh, p, p.kind); });
    if (dress) dress.barrels.forEach((b) => { if (!b.dead) addOwned(b.mesh, b, "barrel"); });
    const found = ray.intersectObjects(owned.map((o) => o.mesh), true);
    let hit = null;
    if (found.length) {
      let node = found[0].object;
      let owner = null;
      while (node && !owner) {
        owner = owned.find((o) => o.mesh === node);
        node = node.parent;
      }
      if (owner) {
        const bb = new T.Box3().setFromObject(owner.mesh);
        hit = { at: found[0].point, box: bb, extra: owner.extra, sort: owner.sort };
      }
    }
    const cx = (aimN.x * 0.5 + 0.5) * innerWidth;
    const cy = (-aimN.y * 0.5 + 0.5) * innerHeight;
    mark(cx, cy);
    if (!hit) {
      let bestPx = 9999;
      const near = [];
      posts.forEach((p) => { if (p.e.alive !== false && p.expose > 0.42 && p.mesh) near.push({ mesh: p.mesh, extra: p, sort: "foe", lift: 0.8 }); });
      pickups.forEach((p) => { if (!p.taken && p.mesh) near.push({ mesh: p.mesh, extra: p, sort: p.kind, lift: 0.3 }); });
      if (dress) dress.barrels.forEach((b) => { if (!b.dead && b.mesh) near.push({ mesh: b.mesh, extra: b, sort: "barrel", lift: 0.55 }); });
      near.forEach((n) => {
        const v = new T.Vector3();
        n.mesh.getWorldPosition(v);
        const at = v.clone();
        at.y += n.lift;
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
    if (!hit) { combo = 0; return; }
    shotsHit++;
    window.__lastHitPx = { x: (hit.at.clone().project(ctx.camera).x * 0.5 + 0.5) * innerWidth, y: (-hit.at.clone().project(ctx.camera).y * 0.5 + 0.5) * innerHeight };
    if (hit.sort === "barrel") { boomBarrel(ctx, hit.extra); return; }
    if (hit.sort === "shot") {
      hit.extra.mesh.parent && hit.extra.mesh.parent.remove(hit.extra.mesh);
      shots3 = shots3.filter((s) => s !== hit.extra);
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
    burst(ctx.scene, hit.at.x, hit.at.y, hit.at.z, (p.e.hp || 1) <= 1);
    p.hitFlash = 0.09;
    p.knock = 0.16;
    p.e.hp = (p.e.hp || 1) - 1;
    if (p.e.hp > 0) {
      // suppressed: he drops back behind cover instead of standing there
      p.state = "duck";
      p.stateT = 0.34;
      p.expose = Math.min(p.expose, 0.85);
      gun("hit");
      return;
    }
    let pts = 100 + ((combo + 1) > 1 ? (combo + 1) * 40 : 0);
    if (head) pts += 150;
    if (quick) pts += 100;
    killPost(ctx, p, pts);
    gun(p.role === "boss" ? "boom" : "hit");
    if (p.role === "boss") finish(ctx, true);
  }

  /* ---------------- per frame ---------------- */

  function stepPost(p, ctx, dt) {
    const cam = ctx.camera.position;
    if (!p.mesh) return;
    if (p.e.alive === false) return;

    if (p.role === "hostage") {
      p.mesh.rotation.y = Math.atan2(cam.x - p.x, cam.z - p.z);
      p.bob += dt * 1.6;
      if (p.body) p.body.rotation.z = Math.sin(p.bob) * 0.05;
      return;
    }

    // cover state machine: hidden -> peek -> fire -> duck -> hidden
    p.stateT -= dt;
    if (p.state === "hidden") {
      if (p.stateT <= 0) {
        p.state = "peek";
        p.stateT = 0.3;
        if (p.e._tag) p.e._tag.style.display = "";
      }
    } else if (p.state === "peek") {
      p.expose = Math.min(1, p.expose + dt / 0.28);
      if (p.stateT <= 0) { p.state = "fire"; p.stateT = p.fireMax; }
    } else if (p.state === "fire") {
      p.expose = Math.min(1, p.expose + dt / 0.2);
      p.aim -= dt;
      if (p.aim <= 0) {
        hurtPlayer(ctx, p.role === "boss" ? 22 : 15);
        p.aim = p.aimMax;
        p.state = "duck";
        p.stateT = 0.32;
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
          p.x = np.x; p.z = np.z;
        }
      }
    }

    p.bob += dt * 2.4;
    const ex = p.expose;
    // step sideways out of cover while peeking
    const side = p.peekDir * 0.62 * ex;
    p.mesh.position.set(p.x + side, p.y + (1 - ex) * -0.06, p.z + (1 - ex) * (p.isBoss ? 0.35 : 0.22));
    p.mesh.rotation.y = Math.atan2(cam.x - p.mesh.position.x, cam.z - p.mesh.position.z);
    const bob = Math.sin(p.bob) * 0.015 * ex;
    if (p.body) {
      const sy = 1 - (1 - p.squashY) * (1 - ex);
      p.body.scale.y = sy;
      p.body.position.y = bob;
      p.body.rotation.z = (p.knock || 0) * 0.9 + Math.sin(p.bob * 0.63) * 0.02 * ex;
      p.body.rotation.x = (1 - ex) * 0.16;
    }
    if (p.knock > 0) p.knock = Math.max(0, p.knock - dt * 1.6);
    const u = p.mesh.userData;
    if (u.rifle) u.rifle.rotation.x = -0.18 - ex * 0.5;
    if (u.nade) u.nade.position.y = 0.62 + ex * 0.12;
    if (p.state === "fire" && p.role === "throw") {
      p.nextThrow -= dt;
      if (p.nextThrow <= 0) { p.nextThrow = 1.4; throwShot(ctx, p); }
    }
    if (p.e._tag && p.e._tag.style.display !== "none") {
      const v = new T.Vector3(p.mesh.position.x, p.y + p.headTop * (1 - (1 - p.squashY) * (1 - ex)) + 0.85, p.mesh.position.z);
      v.project(ctx.camera);
      p.e._tag.style.left = ((v.x * 0.5 + 0.5) * innerWidth) + "px";
      p.e._tag.style.top = ((-v.y * 0.5 + 0.5) * innerHeight) + "px";
      const urgent = p.state === "fire" && p.aim < Math.min(0.85, p.aimMax * 0.42);
      if (urgent !== p.e._tagUrgent) {
        p.e._tagUrgent = urgent;
        p.e._tag.classList.toggle("urgent", urgent);
      }
    }
  }

  function stepAlly(ctx, dt) {
    const a = dress && dress.ally;
    if (!a) return;
    const cam = ctx.camera;
    const right = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    const fwd = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 2).negate();
    const tx = cam.position.x - right.x * 2.8 + fwd.x * 4.6;
    const tz = cam.position.z - right.z * 2.8 + fwd.z * 4.6;
    a.position.x += (tx - a.position.x) * Math.min(1, dt * 4);
    a.position.z += (tz - a.position.z) * Math.min(1, dt * 4);
    a.position.y = 0.3;
    const foes = exposedHostiles();
    let best = null, bd = 1e9;
    foes.forEach((p) => {
      const d = Math.hypot(p.x - a.position.x, p.z - a.position.z);
      if (d < bd) { bd = d; best = p; }
    });
    if (best) {
      a.rotation.y = Math.atan2(best.x - a.position.x, best.z - a.position.z);
      if (a.userData.armL) a.userData.armL.rotation.x = -1.4;
      allyT -= dt;
      if (allyT <= 0) { allyT = 1.15 + Math.random() * 0.8; allyTracer(ctx, best); }
    } else if (a.userData.armL) {
      if (a.userData.armL) a.userData.armL.rotation.x = -1.25 + Math.sin(performance.now() / 800) * 0.05;
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
        const k = Math.max(0, Math.min(1, 1.05 - p.dying));
        p.mesh.rotation.z = -k * 1.45;
        p.mesh.position.y = p.y - Math.max(0, k - 0.45) * 1.1;
        if (p.dying <= 0) p.mesh.visible = false;
      }
    });

    // ---- world dressing follow ----
    if (dress) {
      if (dress.sky) { dress.sky.position.set(cam.position.x, 0, cam.position.z + 20); }
      dress.flags.forEach((f) => {
        if (f.userData.cloth) f.userData.cloth.rotation.y = Math.sin(nowMs / 540 + f.userData.ph) * 0.09;
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
      if (tr.life <= 0) { tr.mesh.parent && tr.mesh.parent.remove(tr.mesh); tracers.splice(i, 1); }
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
      const vk = Math.max(0.14, Math.min(0.4, halfW * 0.58));
      if (Math.abs(pistol.scale.x - vk) > 0.005) pistol.scale.setScalar(vk);
      const baseX = Math.min(pistolBase.x, halfW * 0.5);
      const dip = reloadK > 0 ? Math.sin(Math.PI * (1 - reloadK)) : 0;
      const swayX = aimN.x * 0.012 + Math.sin(nowMs / 740) * 0.0025;
      const swayY = aimN.y * 0.008 + Math.cos(nowMs / 960) * 0.0025;
      pistol.position.x = baseX + swayX;
      pistol.position.z = pistolBase.z + kick * 0.045 + dip * 0.03;
      pistol.position.y = pistolBase.y - kick * 0.018 - dip * 0.1 + swayY;
      // muzzle stays on the reticle; the rig only leans a touch toward the aim
      pistol.rotation.x = 0.05 + kick * 0.2 + dip * 0.5 + aimN.y * 0.05;
      pistol.rotation.y = 0.085 - aimN.x * 0.055 + dip * 0.1;
      pistol.rotation.z = 0.012 + dip * 0.3;
    }
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
      if (s.userData.life <= 0) { s.parent && s.parent.remove(s); smokes.splice(i, 1); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.userData.life -= dt;
      s.position.addScaledVector(s.userData.v, dt);
      s.userData.v.y -= 6 * dt;
      if (s.userData.life <= 0) { ctx.scene.remove(s); sparks.splice(i, 1); }
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
      exposed: posts.filter((p) => p.e.alive !== false && p.expose > 0.42).length,
      states: posts.map((p) => p.state).join(","),
      ally: window.__allyShots || 0,
      bullets, shotsFired, shotsHit, hp, lives, waveT: +waveT.toFixed(1),
      pickups: pickups.length, got: pickups.filter((p) => p.taken).length,
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
