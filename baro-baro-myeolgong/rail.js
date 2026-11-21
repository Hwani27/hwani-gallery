/* Virtua Cop-style rail view inside the real 지금 바로 점프 world.
   The stage, Baro mesh, mob builders, materials, lights, score and SFX
   all come from BlockAction. This file only drives the camera, the
   viewmodel pistol, and the arcade HUD. */
(function () {
  const T = window.THREE;
  if (!T) return;
  const armed = !/[?&]rail=0(?:&|$)/.test(location.search);
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
      html.rail-on #baHud,html.rail-on #baPad,html.rail-on #baPadX,html.rail-on #baBoss,
      html.rail-on #baMsg,html.rail-on #baDlg,html.rail-on #baCoach,html.rail-on #baSkip,
      html.rail-on #baLB,html.rail-on #lang7,html.rail-on #gqBtn,html.rail-on #gqToast,
      html.rail-on #view7Btn,html.rail-on #view7Pop,html.rail-on #baRotate{display:none!important}
      #railHud{position:fixed;inset:0;z-index:40;pointer-events:none;image-rendering:pixelated}
      #railHud canvas{width:100%;height:100%;image-rendering:pixelated}
      #railX{position:fixed;left:50%;top:46%;width:46px;height:46px;transform:translate(-50%,-50%);z-index:41;pointer-events:none}
      #railReload{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));z-index:42;min-width:72px;min-height:64px;border-radius:16px;border:3px solid #111;background:#1a2430;color:#fff;font:900 16px sans-serif;pointer-events:auto}
      #railResult{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(4,8,16,.72);color:#fff;font-family:Pretendard,system-ui,sans-serif;text-align:center;padding:24px}
      #railResult.show{display:flex}
      #railResult .card{width:min(440px,100%);background:#121820;border:3px solid #f4e7b0;border-radius:18px;padding:22px}
      #railResult h2{margin:0 0 8px;font-size:28px}
      #railResult p{margin:6px 0;font-size:16px}
      #railResult .stars{font-size:32px;letter-spacing:6px;color:#ffd54a}
      .railAim{position:fixed;z-index:39;pointer-events:none;transform:translate(-50%,-120%);font:900 18px ui-monospace,monospace;color:#ffe14a;text-shadow:0 2px 0 #000}
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
    const score = String(hud._score || 0).padStart(7, "0");
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
    rifle.position.set(0.16, 0.72, 0.36);
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
  function dressBattlefield(ctx) {
    makeSol();
    const S = ctx.scene;
    const L = ctx.L || {};
    const W = L.W || 200;
    const x0 = -18;
    const x1 = Math.min(W + 8, 172);
    const len = x1 - x0;
    const mid = (x0 + x1) / 2;

    // bright day sky, haze and sun
    const sky = makeSkyDome();
    sky.position.set(mid, 0, 2);
    sky.geometry.dispose();
    sky.geometry = new T.SphereGeometry(52, 24, 16);
    S.add(sky);
    S.background = new T.Color(0x8ec7ee).convertSRGBToLinear();
    S.fog = new T.Fog(0xbcd9ee, 95, 260);
    if (S.fog.color && S.fog.color.convertSRGBToLinear) S.fog.color.convertSRGBToLinear();
    if (ctx.LT) {
      const LT = ctx.LT;
      if (LT.hemi) { LT.hemi.intensity = 0.52; LT.hemi.color.setHex(0xdcefff); LT.hemi.groundColor && LT.hemi.groundColor.setHex(0x7d7154); }
      if (LT.amb) { LT.amb.intensity = 0.24; LT.amb.color && LT.amb.color.setHex(0xb9d2e8); }
      if (LT.key) { LT.key.intensity = 1.05; LT.key.color.setHex(0xfff0c8); }
      if (LT.moon) { LT.moon.intensity = 0.1; LT.moon.color && LT.moon.color.setHex(0xa8c4e6); }
      if (LT.rim) { LT.rim.intensity = 0.34; LT.rim.color && LT.rim.color.setHex(0xffc79a); }
    }
    if (ctx.renderer) ctx.renderer.toneMappingExposure = 0.96;
    // the jump engine ships a night sky sphere inside our daylight dome
    const oldSky = [];
    S.traverse((o) => {
      if (o.isMesh && o.geometry && o.geometry.type === "SphereGeometry" && o.geometry.parameters && o.geometry.parameters.radius < 100) oldSky.push(o);
    });
    oldSky.forEach((o) => { o.visible = false; });

    // wide paved plaza the squad fights across
    const stex = MT.street.clone();
    stex.needsUpdate = true;
    stex.repeat.set(len / 3.2, 12);
    const street = new T.Mesh(new T.PlaneGeometry(len, 21.0), new T.MeshLambertMaterial({ map: stex }));
    street.rotation.x = -Math.PI / 2;
    street.position.set(mid, 0.3, 11.4);
    street.receiveShadow = true;
    S.add(street);

    // left city wall that the banners hang on
    const wallH = 4.4;
    const wtex = MT.stone.clone();
    wtex.needsUpdate = true;
    wtex.repeat.set(len / 2.6, 2.4);
    const wall = new T.Mesh(new T.BoxGeometry(len, wallH, 1.4), new T.MeshLambertMaterial({ map: wtex }));
    wall.position.set(mid, 0.3 + wallH / 2, 0.38);
    wall.castShadow = true;
    wall.receiveShadow = true;
    S.add(wall);
    const capMat = new T.MeshLambertMaterial({ map: MT.stone });
    const capW = 1.0, capH = 0.55, capD = 1.3;
    const capGeo = new T.BoxGeometry(capW, capH, capD);
    const caps = new T.InstancedMesh(capGeo, capMat, Math.ceil(len / 1.45) + 2);
    const mtx = new T.Matrix4();
    let ci = 0;
    for (let x = x0; x < x1 + capW; x += 1.45) {
      mtx.makeTranslation(x, 0.3 + wallH + capH / 2, 0.38);
      caps.setMatrixAt(ci++, mtx);
    }
    caps.count = ci;
    caps.castShadow = true;
    caps.receiveShadow = true;
    S.add(caps);
    for (let x = x0 + 6; x < x1; x += 11) {
      const b = bmesh(1.4, wallH + 0.7, 1.6, capMat);
      b.position.set(x, 0.3 + (wallH + 0.7) / 2, 0.6);
      S.add(b);
    }

    // plinth, loopholes and gateways so the wall is not one flat slab
    const plinth = new T.Mesh(new T.BoxGeometry(len, 0.7, 0.24), capMat);
    plinth.position.set(mid, 0.65, 1.1);
    S.add(plinth);
    const darkHole = new T.MeshLambertMaterial({ color: 0x1a1a1c });
    darkHole.color.convertSRGBToLinear();
    for (let x = x0 + 3; x < x1; x += 5.5) {
      const h = bmesh(0.28, 0.85, 0.16, darkHole);
      h.position.set(x, 2.3, 1.09);
      S.add(h);
    }
    for (let x = x0 + 18; x < x1; x += 44) {
      const g1 = bmesh(2.4, 2.9, 0.2, darkHole);
      g1.position.set(x, 1.85, 1.08);
      S.add(g1);
      const arch = bmesh(2.9, 0.3, 0.5, capMat);
      arch.position.set(x, 3.35, 1.15);
      S.add(arch);
    }
    for (let x = x0 + 10; x < x1; x += 33) {
      const tw = bmesh(3.0, wallH + 2.2, 2.2, capMat);
      tw.position.set(x, 0.3 + (wallH + 2.2) / 2, 0.5);
      S.add(tw);
      for (let i = -1; i <= 1; i++) {
        const c = bmesh(0.8, 0.6, 2.3, capMat);
        c.position.set(x + i * 1.05, 0.3 + wallH + 2.5, 0.5);
        S.add(c);
      }
    }

    // right side of the street: curb, sidewalk and a city row so the view
    // never drops off into empty sky beside the camera
    const sideMat = new T.MeshLambertMaterial({ map: MT.stone });
    const sidewalk = new T.Mesh(new T.BoxGeometry(len, 0.14, 8.0), sideMat);
    sidewalk.position.set(mid, 0.37, 17.1);
    sidewalk.receiveShadow = true;
    S.add(sidewalk);
    const curb = new T.Mesh(new T.BoxGeometry(len, 0.22, 0.34), capMat);
    curb.position.set(mid, 0.4, 13.2);
    curb.receiveShadow = true;
    S.add(curb);

    // the opposite fortress wall, carrying the other flag
    const rwall = new T.Mesh(new T.BoxGeometry(len, wallH, 1.4), new T.MeshLambertMaterial({ map: wtex }));
    rwall.position.set(mid, 0.3 + wallH / 2, 14.0);
    rwall.receiveShadow = true;
    S.add(rwall);
    const rcaps = new T.InstancedMesh(capGeo, capMat, Math.ceil(len / 1.45) + 2);
    let ri = 0;
    for (let x = x0; x < x1 + capW; x += 1.45) {
      mtx.makeTranslation(x, 0.3 + wallH + capH / 2, 14.0);
      rcaps.setMatrixAt(ri++, mtx);
    }
    rcaps.count = ri;
    rcaps.receiveShadow = true;
    S.add(rcaps);
    const rflags = [];
    let rk = 0;
    for (let x = 8; x < x1; x += 12.5) {
      const f = makeFlag(rk++ % 3 ? "kp" : "kr", x, 2.6, 13.28, 2.2, 1.45);
      S.add(f);
      rflags.push(f);
    }

    // city blocks behind the right wall
    const rightRow = new T.Group();
    S.add(rightRow);
    for (let x = x0 + 3; x < x1; x += 12.5) {
      const h = 5.4 + ((Math.abs(x) * 13) % 7) * 0.9;
      const bm = ((x | 0) % 3 === 0) ? sideMat : capMat;
      const b = bmesh(8.6, h, 6.0, bm);
      b.position.set(x, 0.3 + h / 2, 18.6);
      rightRow.add(b);
      for (let i = -1; i <= 1; i++) {
        const c = bmesh(1.3, 0.7, 6.1, bm);
        c.position.set(x + i * 2.7, 0.3 + h + 0.35, 18.6);
        rightRow.add(c);
      }
      for (let wy = 0; wy < 2; wy++) {
        for (let wx = -1; wx <= 1; wx++) {
          const wd = bmesh(0.52, 0.78, 0.16, darkHole);
          wd.position.set(x + wx * 2.5, 5.6 + wy * 1.5, 15.57);
          rightRow.add(wd);
        }
      }
    }
    for (let x = x0 + 9; x < x1; x += 16) {
      const tree = new T.Group();
      part(tree, 0.34, 1.9, 0.34, 0, 0.95, 0, SOL.woodDark);
      const leaf = new T.Mesh(new T.BoxGeometry(1.7, 1.2, 1.7), SOL.grass);
      leaf.position.y = 2.3;
      leaf.castShadow = true;
      tree.add(leaf);
      const leaf2 = new T.Mesh(new T.BoxGeometry(1.1, 0.9, 1.1), SOL.grass);
      leaf2.position.set(0.2, 3.05, -0.15);
      tree.add(leaf2);
      const leaf3 = new T.Mesh(new T.BoxGeometry(0.8, 0.5, 0.8), new T.MeshLambertMaterial({ color: 0x8fae56 }));
      leaf3.position.set(0.1, 3.5, -0.1);
      tree.add(leaf3);
      tree.position.set(x, 0.4, 15.6);
      S.add(tree);
    }
    for (let x = x0 + 20; x < x1; x += 38) S.add(makeTower(x, 12.2, 4.6));
    for (let x = x0 + 7; x < x1; x += 21) {
      S.add(makeCrate(x, 6.6, 0.72));
      if (Math.abs(x) % 2 === 0) S.add(makeSandbags(x + 1.2, 7.4, 1.6, 2));
    }
    for (let x = 88; x < x1 + 10; x += 6.5) {
      const h = 4.4 + ((x * 7) % 5) * 1.2;
      const b2 = bmesh(5.4, h, 3.0, (x | 0) % 2 ? capMat : sideMat);
      b2.position.set(x, 0.3 + h / 2, 16.4);
      S.add(b2);
      for (let wy = 0; wy < 2; wy++) {
        const w1 = bmesh(0.5, 0.7, 0.12, darkHole);
        w1.position.set(x - 1.4 + wy * 2.6, 5.2 + wy * 1.2, 14.88);
        S.add(w1);
      }
    }

    // banners on the wall, alternating colours
    const flags = [];
    let fk = 0;
    for (let x = 2; x < x1; x += 12.5) {
      const f = makeFlag(fk++ % 2 ? "kp" : "kr", x, 2.6, 1.1, 2.2, 1.45);
      S.add(f);
      flags.push(f);
    }

    // watchtowers and the far bridge behind the wall
    for (let x = 12; x < x1; x += 27) S.add(makeTower(x, -3.4, 6.0));
    S.add(makeBridge(34, -9.5));
    S.add(makeBridge(96, -10.5));
    // far end of the plaza: a city gate that closes the horizon
    if (waves && waves.length) {
      const gx = waves[waves.length - 1].x + 32;
      const gw = bmesh(2.4, 6.0, 21.0, new T.MeshLambertMaterial({ map: wtex }));
      gw.position.set(gx, 0.3 + 3.0, 11.4);
      S.add(gw);
      const arch = bmesh(2.7, 3.6, 3.6, darkHole);
      arch.position.set(gx - 1.3, 2.1, 9.2);
      S.add(arch);
      [4.6, 16.2].forEach((gz) => {
        const tw = bmesh(4.2, 8.6, 4.2, capMat);
        tw.position.set(gx - 0.4, 0.3 + 4.3, gz);
        S.add(tw);
        for (let i = -1; i <= 1; i++) {
          const c = bmesh(1.1, 0.7, 4.3, capMat);
          c.position.set(gx - 0.4, 0.3 + 8.95, gz + i * 1.2);
          S.add(c);
        }
      });
      for (let i = 0; i < 5; i++) {
        const c = bmesh(2.5, 0.7, 1.2, capMat);
        c.position.set(gx, 6.65, 5.6 + i * 2.9);
        S.add(c);
      }
      const gflag = makeFlag("kr", gx - 1.4, 5.2, 6.6, 2.2, 1.45);
      S.add(gflag);
      const gflag2 = makeFlag("kp", gx - 1.4, 5.2, 14.6, 2.2, 1.45);
      S.add(gflag2);
    }
    if (waves && waves.length > 2) S.add(makeOverpass(waves[2].x + 2.5));
    if (waves && waves.length > 3) S.add(makeOverpass(waves[3].x + 4));

    // enemy-side cover, crates and the parked truck
    const props = new T.Group();
    S.add(props);
    const barrels = [];
    const bx = [];
    (waves || []).forEach((w, i) => {
      const px = w.x;
      props.add(makeSandbags(px + 0.6, 2.72, 2.6, 2));
      props.add(makeSandbags(px + 4.0, 2.86, 1.4, 2));
      props.add(makeBarrier(px + 2.4, 2.4));
      props.add(makeRubble(px - 0.8, 1.35, 5));
      props.add(makeRubble(px + 6.9, 1.2, 4));
      // open plaza to the right of the lane
      props.add(makeSandbags(px + 4.4, 7.9, 3.0, 2));
      props.add(makeCrate(px + 8.6, 6.4, 0.8));
      props.add(makeCrate(px + 9.3, 6.6, 0.56, 1.1));
      props.add(makeRubble(px + 7.4, 9.4, 6));
      const pb = makeBarrel(px + 9.6, 8.8, 0.3);
      S.add(pb);
      barrels.push({ mesh: pb, x: px + 9.6, z: 8.8, y: 0.3, dead: false });
      props.add(makeCrate(px + 5.2, 2.46, 0.78));
      props.add(makeCrate(px + 5.75, 2.5, 0.56, 1.08));
      if (i % 2 === 0) props.add(makeCrate(px + 3.0, 2.62, 0.66));
      bx.push(px + 2.9, px + 6.5);
    });
    props.add(makeTruck(24, 6.1));
    props.add(makeTruck(86, 5.4));
    props.add(makeTruck(52, 8.6));
    bx.push(12.5, 28.5, 46.5, 62.5, 88.5);
    bx.forEach((x, i) => {
      const z = i % 2 ? 2.02 : 2.18;
      const b = makeBarrel(x, z, 0.3);
      S.add(b);
      barrels.push({ mesh: b, x, z, y: 0.3, dead: false });
    });

    // blocky clouds
    const clouds = [];
    for (let i = 0; i < 7; i++) {
      const c = makeCloud(26 + i * 17 + Math.random() * 6, 8.5 + Math.random() * 4, 2.5 + (i % 3) * 3.2 + Math.random() * 2, 2.6 + Math.random() * 1.6);
      S.add(c);
      clouds.push(c);
    }

    // our kneeling rifleman on the near left cover
    const ally = makeAlly();
    ally.position.set(8, 0.3, 1.25);
    S.add(ally);

    dress = { sky, flags, clouds, barrels, ally, street, wall, mid, len, x0, x1 };
    return dress;
  }

  function roleOf(kind) {
    if (kind === "moosh" || kind === "snowgolem" || kind === "axolotl") return "hostage";
    if (kind === "pillager" || kind === "skeleton" || kind === "creeper") return "throw";
    if (kind === "guard" || kind === "irongolem" || kind === "charger" || kind === "boss") return "tough";
    return "weak";
  }
  function roleHp(role) { return role === "tough" ? 3 : role === "throw" ? 2 : role === "boss" ? 8 : 1; }
  function roleAim(role) { return role === "weak" ? 1.45 : role === "throw" ? 2.1 : role === "tough" ? 2.5 : role === "boss" ? 2.2 : 99; }

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
    // right hand
    add(0.13, 0.12, 0.135, 0.012, -0.215, 0.055, skin);
    add(0.128, 0.032, 0.032, 0.008, -0.172, -0.028, skin);
    add(0.128, 0.032, 0.032, 0.008, -0.208, -0.028, skin);
    add(0.128, 0.032, 0.032, 0.008, -0.244, -0.028, skin);
    add(0.034, 0.085, 0.1, -0.062, -0.195, 0.03, skin);
    // left hand supporting
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
    const halo = add(0.3, 0.3, 0.03, 0, 0.062, -0.41, new T.MeshBasicMaterial({ color: 0xffc14a, transparent: true, opacity: 0.85, depthWrite: false }));
    halo.visible = false;
    const flashLight = new T.PointLight(0xffc878, 0, 6, 2);
    flashLight.position.set(0, 0.06, -0.42);
    g.add(flashLight);
    g.position.set(-0.005, -0.2, -0.56);
    g.rotation.set(-0.44, 0.46, 0.04);
    g.scale.setScalar(0.56);
    camera.add(g);
    return { g, flash: f, halo, light: flashLight };
  }

  function roleTag(el, text) {
    const d = document.createElement("div");
    d.className = "railAim";
    d.textContent = text;
    document.body.appendChild(d);
    el._tag = d;
    return d;
  }

  function boot(ctx) {
    booted = true;
    t0 = performance.now();
    document.documentElement.classList.add("rail-on");
    css();
    SCENE = ctx.scene;
    ctx.scene.add(ctx.camera);
    const rig = makePistol(ctx.camera);
    pistol = rig.g;
    pistolBase = { z: rig.g.position.z, y: rig.g.position.y };
    flash = rig.flash;
    flashHalo = rig.halo;
    flashLight = rig.light;
    const btn = document.createElement("button");
    btn.id = "railReload";
    btn.type = "button";
    btn.textContent = "R";
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); window.RAIL.reload(); });
    document.body.appendChild(btn);
    const hostiles = (ctx.enemies || []).filter((e) => e && e.mesh && e.alive !== false && roleOf(e.kind) !== "hostage");
    const civs = (ctx.enemies || []).filter((e) => e && e.mesh && roleOf(e.kind) === "hostage");
    hostiles.sort((a, b) => a.x - b.x);
    const use = hostiles.slice(0, 12);
    for (let i = 0; i < use.length; i += 3) {
      const group = use.slice(i, i + 3);
      const near = civs.filter((c) => Math.abs(c.x - group[0].x) < 8).slice(0, 1);
      waves.push({ x: group[0].x, members: group.concat(near), t: 0 });
    }
    (ctx.enemies || []).forEach((e) => { if (e.mesh) e.mesh.visible = false; });
    // the stage's floating ? blocks and gold coins do not belong on a battlefield
    try {
      (ctx.L.items || []).forEach((it) => { if (it && it.mesh) it.mesh.visible = false; });
      (ctx.L.coins || []).forEach((c) => { if (c && c.mesh) c.mesh.visible = false; });
      (ctx.L.firebars || []).forEach((f) => { if (f && f.mesh) f.mesh.visible = false; });
    } catch (e) {}
    try {
      const mesh = ctx.makeBoss ? ctx.makeBoss() : new T.Group();
      mesh.visible = false;
      ctx.scene.add(mesh);
      const fb = makeSoldier("boss");
      fb.visible = false;
      ctx.scene.add(fb);
      bossPost = { e: { kind: "boss", mesh, alive: true, hp: 8, h: 2.4, hw: 0.8, active: false }, mesh: fb, x: (use.length ? use[use.length - 1].x : 20) + 14, z: 2.2, y: 0.3, role: "boss", aim: 0, aimMax: 2.2, popped: false };
    } catch (err) { window.__bossErr = String(err && err.message || err); }
    const lane = [];
    waves.forEach((w, i) => {
      lane.push({ x: w.x + 0.9, y: 1.28, z: 2.72, kind: "ammo" });
      lane.push({ x: w.x + 5.3, y: 1.3, z: 2.46, kind: i === 1 ? "life" : i === 2 ? "ammo" : "supply" });
    });
    lane.forEach((spot) => {
      let mesh = null;
      try { mesh = makePickup(spot.kind); } catch (err) { window.__pickupErr = String(err && err.message || err); }
      if (!mesh) mesh = new T.Mesh(new T.BoxGeometry(0.5, 0.4, 0.4), new T.MeshLambertMaterial({ color: 0x6b7a45 }));
      mesh.position.set(spot.x, spot.y, spot.z);
      if (!mesh.parent) ctx.scene.add(mesh);
      pickups.push({ mesh, kind: spot.kind, taken: false });
    });
    if (!window.__railKeys) {
      window.__railKeys = 1;
      const aimAt = (e) => {
        if (!e) return;
        pointerFrom(e);
      };
      addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") aimAt(e); });
      const shootAt = (e) => {
        if (ended) return;
        if (e.target && e.target.id === "railReload") return;
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
    ctx.camera.near = 0.06;
    ctx.camera.fov = 58;
    ctx.camera.far = 320;
    ctx.camera.updateProjectionMatrix();
    if (ctx.pl) ctx.pl.inv = 99999;
    try { dressBattlefield(ctx); } catch (err) { window.__dressErr = String(err && err.stack || err); }
    // the cheerful field theme is wrong for a firefight: hand the score to
    // our own procedural combat track
    try { if (typeof BGM !== "undefined" && BGM.stop) BGM.stop(0.25); } catch (e) {}
    try { if (window.__BGM572 && window.__BGM572.current) window.__BGM572.update("pause", true); } catch (e) {}
    try { window.GunSFX && window.GunSFX.bgm(true, false); } catch (e) {}
    window.__railPhase = phase;
  }

  function pointerFrom(e) {
    const x = e.clientX, y = e.clientY;
    aimN.x = (x / innerWidth) * 2 - 1;
    aimN.y = -(y / innerHeight) * 2 + 1;
    const xh = document.getElementById("railX");
    if (xh) { xh.style.left = x + "px"; xh.style.top = y + "px"; }
  }

  function pop(p) {
    p.popped = true;
    if (p.mesh) p.mesh.visible = true;
    p.z0 = 6.2;
    p.z = p.role === "hostage" ? 1.55 : (p.i % 3 === 0 ? 1.55 : p.i % 3 === 1 ? 2.15 : 1.3);
    p.aim = p.aimMax;
      if (!p.e._tag && p.role !== "hostage") roleTag(p.e, "");
  }

  function startWave(w) {
    phase = "fight";
    wave = w;
    waveT = 11;
    waveClean = true;
    camX = Math.max(camX, w.x - 6);
    w.members.forEach((e, i) => {
      const role = roleOf(e.kind);
      const post = { e, x: camX + 5.2 + (i % 3) * 1.7, y: 0.3, z: 2.2, i, role, aimMax: roleAim(role), aim: roleAim(role), popped: false, nextThrow: 0.6, bob: Math.random() * 6 };
      e.hp = roleHp(role);
      e.alive = true;
      let sm = null;
      try { sm = makeSoldier(role); } catch (err) { window.__soldierErr = String(err && err.message || err); }
      if (sm && SCENE) {
        sm.position.set(post.x, post.y, post.z);
        sm.visible = false;
        SCENE.add(sm);
        post.mesh = sm;
      }
      posts.push(post);
      pop(post);
    });
    window.__railPhase = "fight";
  }

  function livingHostiles() {
    return posts.filter((p) => p.e.alive !== false && p.role !== "hostage" && p.popped);
  }

  function endWave(ctx) {
    if (waveClean) addPts(ctx, 500);
    posts.forEach((p) => {
      if (p.e.mesh) p.e.mesh.visible = false;
      if (p.mesh) { p.mesh.visible = false; p.mesh.parent && p.mesh.parent.remove(p.mesh); }
      if (p.e._tag) { p.e._tag.remove(); p.e._tag = null; }
    });
    posts.length = 0;
    shots3.forEach((s) => s.mesh && s.mesh.parent && s.mesh.parent.remove(s.mesh));
    shots3 = [];
    wave = null;
    waveI++;
    phase = waveI < waves.length ? "move" : "toBoss";
    window.__railPhase = phase;
  }

  function addPts(ctx, n) {
    if (ctx.addScore) ctx.addScore(n, camX, 2);
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
    try { window.GunSFX && window.GunSFX.bgm(false); } catch (e) {}
    phase = "result";
    window.__railPhase = "result";
    const acc = shotsFired ? shotsHit / shotsFired : 0;
    const got = pickups.filter((p) => p.taken).length;
    const tot = pickups.length;
    const s1 = !!cleared;
    const s2 = tot === 0 || got / tot >= 0.6;
    const s3 = lives >= 3;
    const mask = (s1 ? 1 : 0) | (s2 ? 2 : 0) | (s3 ? 4 : 0);
    const id = (ctx.L && ctx.L.def && ctx.L.def.id) || "1-1";
    try { if (cleared && ctx.commitStars66) ctx.commitStars66(id, mask); if (ctx.saveSave) ctx.saveSave(); } catch (e) {}
    const stars = "★".repeat([s1, s2, s3].filter(Boolean).length) + "☆".repeat(3 - [s1, s2, s3].filter(Boolean).length);
    const ko = (document.documentElement.lang || "").startsWith("ko");
    const box = document.createElement("div");
    box.id = "railResult";
    box.className = "show";
    box.innerHTML = "<div class=card><h2>" + (cleared ? (ko ? "스테이지 클리어" : "STAGE CLEAR") : (ko ? "실패" : "FAILED")) + "</h2><div class=stars>" + stars + "</div><p>" + (ko ? "점수" : "SCORE") + " " + ((ctx.G && ctx.G.score) || 0) + "</p><p>" + (ko ? "명중률" : "ACCURACY") + " " + Math.round(acc * 100) + "%</p><p>" + (ko ? "코인" : "COINS") + " " + got + "/" + tot + "</p><p>COMBO " + bestCombo + "</p></div>";
    document.body.appendChild(box);
  }

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
    // dust puff so the hit reads against the stone wall
    for (let i = 0; i < (big ? 4 : 2); i++) {
      const p = new T.Mesh(new T.SphereGeometry(0.09 + Math.random() * 0.08, 5, 4), new T.MeshBasicMaterial({ color: 0xd8cfbc, transparent: true, opacity: 0.5, depthWrite: false }));
      p.position.set(x + (Math.random() - 0.5) * 0.2, y + (Math.random() - 0.5) * 0.2, z + 0.1);
      p.userData.v = new T.Vector3((Math.random() - 0.5) * 0.7, 0.4 + Math.random() * 0.5, 0.3);
      p.userData.life = 0.45 + Math.random() * 0.3;
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
    if (smokes.length > 8) return;
    const m = new T.Mesh(new T.SphereGeometry(0.04, 6, 5), new T.MeshBasicMaterial({ color: 0xd8d2c4, transparent: true, opacity: 0.35, depthWrite: false }));
    m.position.set((Math.random() - 0.5) * 0.04, 0.02, -0.48);
    m.userData.life = 0.4;
    m.userData.v = new T.Vector3((Math.random() - 0.5) * 0.05, 0.08, -0.02);
    camera.add(m);
    smokes.push(m);
  }

  function throwShot(ctx, p) {
    let mesh = null;
    try { mesh = ctx.makeArrow && ctx.makeArrow(); } catch (e) {}
    if (!mesh) mesh = new T.Mesh(new T.BoxGeometry(0.18, 0.18, 0.18), new T.MeshLambertMaterial({ color: 0xc4552a }));
    mesh.position.set(p.x, p.y + 1, p.z);
    ctx.scene.add(mesh);
    shots3.push({ mesh, x: p.x, y: p.y + 1, z: p.z });
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
    p.dying = 1.05;
    p.e.x = p.x;
    p.e.y = p.y;
    let scored = false;
    try { if (ctx.killFlip) { ctx.killFlip(p.e, pts); scored = true; } } catch (e) {}
    if (!scored) addPts(ctx, pts);
    if (p.e._tag) { p.e._tag.remove(); p.e._tag = null; }
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
      if (p.e.hp <= 0) {
        const head = true;
        killPost(ctx, p, 200 + (head ? 150 : 0));
      }
    };
    posts.forEach((p) => { if (Math.abs(p.x - px) < 6.5 && Math.abs(p.z - pz) < 3.2) hurt(p); });
    if (bossPost && bossPost.popped && Math.abs(bossPost.x - px) < 6.5) hurt(bossPost);
    if (dress) {
      dress.barrels.forEach((o) => {
        if (!o.dead && o !== b && Math.hypot(o.x - px, o.z - pz) < 4.6) {
          setTimeout(() => boomBarrel(ctx, o), 170);
        }
      });
    }
  }

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
    const ray = new T.Raycaster();
    ray.setFromCamera(new T.Vector2(aimN.x, aimN.y), ctx.camera);
    ray.far = 28;
    let hit = null;
    const owned = [];
    const addOwned = (mesh, extra, sort) => { if (mesh) owned.push({ mesh, extra, sort }); };
    posts.forEach((p) => { if (p.e.alive !== false && p.popped && p.mesh) addOwned(p.mesh, p, "foe"); });
    if (bossPost && bossPost.popped && bossPost.e.alive !== false && bossPost.mesh) addOwned(bossPost.mesh, bossPost, "foe");
    shots3.forEach((s) => addOwned(s.mesh, s, "shot"));
    pickups.forEach((p) => { if (!p.taken) addOwned(p.mesh, p, p.kind); });
    if (dress) dress.barrels.forEach((b) => { if (!b.dead) addOwned(b.mesh, b, "barrel"); });
    const found = ray.intersectObjects(owned.map((o) => o.mesh), true);
    if (found.length) {
      let node = found[0].object;
      let owner = null;
      while (node && !owner) {
        owner = owned.find((o) => o.mesh === node);
        node = node.parent;
      }
      if (owner) {
        const box = new T.Box3().setFromObject(owner.mesh);
        hit = { at: found[0].point, box, extra: owner.extra, sort: owner.sort };
      }
    }
    const cx = (aimN.x * 0.5 + 0.5) * innerWidth;
    const cy = (-aimN.y * 0.5 + 0.5) * innerHeight;
    mark(cx, cy);
    if (!hit) {
      let bestPx = 9999;
      const near = [];
      posts.forEach((p) => { if (p.popped && p.e.alive !== false && p.mesh) near.push({ mesh: p.mesh, extra: p, sort: "foe", lift: 0.8 }); });
      if (bossPost && bossPost.popped && bossPost.e.alive !== false && bossPost.mesh) near.push({ mesh: bossPost.mesh, extra: bossPost, sort: "foe", lift: 0.8 });
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
      if (bestPx > 110) hit = null;
    }
    if (!hit) { combo = 0; return; }
    shotsHit++;
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
    const head = hit.at.y > hit.box.min.y + h * 0.72;
    const quick = p.aim > p.aimMax * 0.45;
    if (p.role === "hostage") {
      hostageHits++;
      waveClean = false;
      combo = 0;
      addPts(ctx, -300);
      p.e.alive = false;
      p.dying = 0.7;
      if (p.e._tag) { p.e._tag.remove(); p.e._tag = null; }
      gun("dry");
      return;
    }
    try { ctx.hitFlash && ctx.hitFlash(p.e); } catch (e) {}
    burst(ctx.scene, hit.at.x, hit.at.y, hit.at.z, (p.e.hp || 1) <= 1);
    p.hitFlash = 0.09;
    p.knock = 0.16;
    p.e.hp = (p.e.hp || 1) - 1;
    if (p.e.hp > 0) { gun("hit"); return; }
    let pts = 100 + ((combo + 1) > 1 ? (combo + 1) * 40 : 0);
    if (head) pts += 150;
    if (quick) pts += 100;
    killPost(ctx, p, pts);
    gun(p.role === "boss" ? "boom" : "hit");
    if (p.role === "boss") finish(ctx, true);
  }

  function frame(ctx) {
    if (!armed || !ctx || !ctx.scene || !ctx.camera || !ctx.L) return;
    if (!booted) boot(ctx);
    const nowMs = performance.now();
    let dt = Math.min(0.05, (nowMs - (frame._t || nowMs)) / 1000) || 0.016;
    if (hitStop > 0) { hitStop = Math.max(0, hitStop - dt); dt *= 0.16; }
    frame._t = nowMs;
    const t = (nowMs - t0) / 1000;
    clock = Math.max(0, 90 - t);
    if (!ended && phase === "move") {
      camX += dt * 16;
      const nxt = waves[waveI];
      if (nxt && camX > nxt.x - 7) startWave(nxt);
      else if (!nxt && bossPost) phase = "toBoss";
    }
    if (!ended && phase === "toBoss") {
      camX += dt * 16;
      if (bossPost && camX > bossPost.x - 8) {
        phase = "boss";
        bossPost.x = camX + 6.5;
        bossPost.z = 2.0;
        bossPost.y = 0.3;
        bossPost.popped = true;
        bossPost.e.mesh.position.set(bossPost.x, bossPost.y, bossPost.z);
        if (bossPost.mesh) {
          bossPost.mesh.visible = true;
          bossPost.mesh.position.set(bossPost.x, bossPost.y, bossPost.z);
        }
        bossPost.aim = bossPost.aimMax;
        if (!bossPost.e._tag) roleTag(bossPost.e, "");
        window.__railPhase = "boss";
      }
    }
    if (!ended && (phase === "fight" || phase === "boss")) {
      waveT -= dt;
      const list = phase === "boss" ? [bossPost] : posts;
      list.forEach((p) => {
        if (!p || p.e.alive === false) return;
        p.e.mesh.position.set(p.x, p.y, p.z);
        p.e.mesh.rotation.y = -Math.PI / 2;
        p.e.active = false;
        const m = p.mesh;
        if (m) {
          m.position.set(p.x, p.y, p.z);
          m.rotation.y = Math.atan2(camX + 1.4 - p.x, 4.2 - p.z) * 0.6;
          const u = m.userData;
          if (p.knock > 0) p.knock = Math.max(0, p.knock - dt * 1.6);
          m.rotation.z = (p.knock || 0) * 0.9;
          p.bob = (p.bob || 0) + dt * 2.4;
          if (u.body) {
            u.body.position.y = Math.sin(p.bob) * 0.02;
            u.body.rotation.z = Math.sin(p.bob * 0.63) * 0.022;
          }
          const aimK = Math.max(0, Math.min(1, 1 - p.aim / (p.aimMax || 2)));
          if (u.rifle) u.rifle.rotation.x = -0.18 - aimK * 0.5;
          if (u.nade) u.nade.position.y = 0.62 + aimK * 0.12;
          if (p.role === "hostage") {
            const wv = Math.sin(p.bob * 1.7) * 0.12;
            if (u.body) u.body.rotation.z = wv;
          }
        }
        if (p.role === "hostage") return;
        p.aim -= dt;
        if (p.e._tag) {
          const v = new T.Vector3(p.x, p.y + (p.e.h || 1.4), p.z);
          v.project(ctx.camera);
          p.e._tag.style.left = ((v.x * 0.5 + 0.5) * innerWidth) + "px";
          p.e._tag.style.top = ((-v.y * 0.5 + 0.5) * innerHeight) + "px";
          p.e._tag.textContent = Math.max(0, p.aim).toFixed(1);
          p.e._tag.style.color = p.aim < 0.6 ? "#ff5a4a" : "#ffe14a";
        }
        if (p.role === "throw") {
          p.nextThrow -= dt;
          if (p.nextThrow <= 0) { p.nextThrow = 1.3; throwShot(ctx, p); }
        }
        if (p.aim <= 0) { hurtPlayer(ctx, p.role === "boss" ? 25 : 18); p.aim = p.aimMax; }
      });
      shots3.forEach((s) => {
        s.x -= dt * 6;
        s.mesh.position.set(s.x, s.y, s.z);
      });
      shots3 = shots3.filter((s) => {
        if (s.x < camX + 0.8) { hurtPlayer(ctx, 12); s.mesh.parent && s.mesh.parent.remove(s.mesh); return false; }
        return true;
      });
      const left = phase === "boss" ? (bossPost.e.alive !== false) : livingHostiles().length;
      if (phase === "fight" && (left === 0 || waveT <= 0)) endWave(ctx);
    }
    let sx = 0, sy = 0;
    if (shake > 0) { sx = (Math.random() - 0.5) * shake; sy = (Math.random() - 0.5) * shake * 0.6; shake *= 0.86; }
    ctx.camera.position.set(camX + sx, 1.7 + sy, 4.1);
    ctx.camera.lookAt(camX + 7, 1.35, 1.1);
    ctx.camera.near = 0.06;
    ctx.camera.fov = 58;
    ctx.camera.updateProjectionMatrix();
    if (ctx.player) ctx.player.visible = false;
    if (dress) {
      if (dress.sky) { dress.sky.position.x = camX + 4; dress.sky.position.z = 2; }
      if (dress.ally) {
        dress.ally.position.set(camX + 2.4, 0.3, 1.25);
        dress.ally.rotation.y = -0.16 + Math.sin(nowMs / 1100) * 0.02;
        const u = dress.ally.userData;
        if (u.armL) u.armL.rotation.x = -1.25 + Math.sin(nowMs / 800) * 0.05;
      }
      dress.flags.forEach((f) => {
        if (f.userData.cloth) f.userData.cloth.rotation.y = Math.sin(nowMs / 540 + f.userData.ph) * 0.09;
      });
      dress.clouds.forEach((c) => {
        c.position.x += dt * 0.35;
        if (c.position.x > camX + 90) c.position.x -= 170;
      });
      dress.barrels.forEach((b) => {
        if (!b.dead && b.mesh) b.mesh.rotation.y = Math.sin(nowMs / 900 + b.x) * 0.03;
      });
    }
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
    if (ctx.pl) ctx.pl.inv = 99999;
    ctx.setState && ctx.setState("play");
    const since = performance.now() - lastShot;
    const kick = Math.max(0, recoil);
    recoil = Math.max(0, recoil - 0.08);
    if (reloadK > 0) reloadK = Math.max(0, reloadK - dt / 0.44);
    if (pistol && pistolBase) {
      const vk = innerWidth < 620 ? 0.38 : innerWidth < 900 ? 0.47 : 0.56;
      if (Math.abs(pistol.scale.x - vk) > 0.01) pistol.scale.setScalar(vk);
      const dip = reloadK > 0 ? Math.sin(Math.PI * (1 - reloadK)) : 0;
      const swayX = aimN.x * 0.016 + Math.sin(nowMs / 740) * 0.003;
      const swayY = aimN.y * 0.01 + Math.cos(nowMs / 960) * 0.003;
      pistol.position.x = -0.005 + swayX;
      pistol.position.z = pistolBase.z + kick * 0.05 + dip * 0.03;
      pistol.position.y = pistolBase.y - kick * 0.02 - dip * 0.1 + swayY;
      pistol.rotation.x = -0.44 + kick * 0.22 + dip * 0.55;
      pistol.rotation.z = dip * 0.3;
      pistol.rotation.y = 0.46 + aimN.x * 0.06 + dip * 0.12;
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
      s.material.opacity = Math.max(0, s.userData.life);
      if (s.userData.life <= 0) { s.parent && s.parent.remove(s); smokes.splice(i, 1); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.userData.life -= dt;
      s.position.addScaledVector(s.userData.v, dt);
      s.userData.v.y -= 6 * dt;
      if (s.userData.life <= 0) { ctx.scene.remove(s); sparks.splice(i, 1); }
    }
    ["baHud","baPad","baPadX","baDlg","baBoss","baCoach","baMsg","baSkip","baLB"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.setProperty("display", "none", "important");
    });
    if (nowMs - (frame._stripT || 0) > 900) {
      frame._stripT = nowMs;
      // the stage keeps respawning its floating coins and ? blocks; keep the
      // battlefield clear of them (they are only props in this mode)
      try {
        (ctx.L.coins || []).forEach((c) => { if (c && c.mesh) c.mesh.visible = false; });
        (ctx.L.items || []).forEach((it) => { if (it && it.mesh) it.mesh.visible = false; });
        if (ctx.W3 && ctx.W3.group) {
          ctx.W3.group.children.forEach((o) => {
            if (!o.isMesh) return;
            if (o.position.y > 4.6 && Math.abs(o.position.z) < 2.6) o.visible = false;
          });
        }
      } catch (e) {}
    }
    if (nowMs - (frame._bgmT || 0) > 1600) {
      frame._bgmT = nowMs;
      try { if (typeof BGM !== "undefined" && BGM.on && BGM.stop) BGM.stop(0.2); } catch (e) {}
      try {
        const SB = window.__BGM572;
        if (SB && SB.current) SB.update("pause", true);
      } catch (e) {}
      try { if (!ended && window.GunSFX && window.GunSFX.bgm) window.GunSFX.bgm(true, phase === "boss"); } catch (e) {}
    }
    if (combo > 0 && performance.now() / 1000 - (window.__comboAt || 0) > 2.2) combo = 0;
    ensureHud((ctx.G && ctx.G.score) || 0);
    if (!window.__railIdle && t > 0.4) window.__railIdle = 1;
    window.__railPhase = phase;
    window.__railDbg = { phase, posts: posts.length, waveI, waves: waves.length, boss: !!bossPost, bullets, shotsFired, shotsHit, hp, lives, pickups: pickups.length, got: pickups.filter((p) => p.taken).length };
    ctx.camera.updateMatrixWorld(true);
    const spot = posts.find((p) => p.popped && p.e.alive !== false && p.role !== "hostage") || (bossPost && bossPost.popped && bossPost.e.alive !== false ? bossPost : null);
    if (spot && spot.e.mesh) {
      const v = new T.Vector3();
      spot.e.mesh.updateWorldMatrix(true, true);
      spot.e.mesh.getWorldPosition(v);
      v.y += 0.9;
      v.project(ctx.camera);
      window.__aimSpot = { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
    } else window.__aimSpot = null;
    window.__pickupSpot = null;
    let bestItem = 9999;
    pickups.forEach((item) => {
      if (item.taken || !item.mesh || item.mesh.visible === false) return;
      const v = new T.Vector3();
      item.mesh.updateWorldMatrix(true, true);
      item.mesh.getWorldPosition(v);
      if (v.x < camX + 0.8) return;
      const pjt = v.clone().project(ctx.camera);
      if (pjt.z < 0 || pjt.z > 1 || Math.abs(pjt.x) > 0.92 || Math.abs(pjt.y) > 0.92) return;
      const x = (pjt.x * 0.5 + 0.5) * innerWidth;
      const y = (-pjt.y * 0.5 + 0.5) * innerHeight;
      const d = Math.hypot(pjt.x, pjt.y);
      if (d < bestItem) { bestItem = d; window.__pickupSpot = { x, y, kind: item.kind }; }
    });
  }

  window.RAIL = {
    hold: armed,
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
      if (!booted || reloading || bullets >= 20 || ended) return;
      reloading = true;
      reloadK = 1;
      gun("reload");
      setTimeout(() => { bullets = 20; reloading = false; }, 420);
    }
  };
})();
