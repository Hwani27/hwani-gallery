/* Virtua Cop-style rail view inside the real 지금 바로 점프 world.
   The stage, Baro mesh, mob builders, materials, lights, score and SFX
   all come from BlockAction. This file only drives the camera, the
   viewmodel pistol, and the arcade HUD. */
(function () {
  const T = window.THREE;
  if (!T) return;
  const armed = !/[?&]rail=0(?:&|$)/.test(location.search);
  const posts = [];
  let booted = false;
  let t0 = 0;
  let pistol = null;
  let flash = null;
  let flashHalo = null;
  let recoil = 0;
  let pistolBase = null;
  let smokes = [];
  let sparks = [];
  let reloading = false;
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
    const sc = Math.max(1, Math.min(2, w / 520));
    const score = String(hud._score || 0).padStart(7, "0");
    blit(g, "SCORE", m, m, sc, "#3ec0ff", "#062033");
    blit(g, score, m, m + 8 * sc + 4, sc, "#f4fbff", "#062033");
    const time = String(Math.max(0, Math.ceil(clock))).padStart(2, "0");
    const tw = textW(time, sc * 2);
    blit(g, "TIME", (w - textW("TIME", sc)) / 2, m, sc, "#ffe14a", "#2a2204");
    blit(g, time, (w - tw) / 2, m + 10 * sc, sc * 2, "#ffe14a", "#1a1402");
    const stage = "STAGE 1-1";
    blit(g, stage, w - m - textW(stage, sc), m, sc, "#f7f7f7", "#111");
    blit(g, "HP " + hp, m, h - m - 28 * sc, sc, "#ff8a7a", "#2a0c0c");
    blit(g, "X" + lives, m + textW("HP 100 ", sc), h - m - 28 * sc, sc, "#fff", "#111");
    blit(g, "BULLET", m, h - m - 12 * sc, sc, "#3ec0ff", "#062033");
    blit(g, String(bullets).padStart(2, "0"), m + textW("BULLET ", sc), h - m - 12 * sc, sc, "#fff", "#062033");
    const cred = "CREDIT 0";
    const edge = m + 96;
    blit(g, cred, w - edge - textW(cred, sc), h - m - 12 * sc, sc, "#f7f7f7", "#111");
    if (combo > 1) blit(g, "COMBO " + combo, m, m + 28 * sc, sc, "#ffe14a", "#2a2204");
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

  function roleOf(kind) {
    if (kind === "moosh" || kind === "snowgolem" || kind === "axolotl") return "hostage";
    if (kind === "pillager" || kind === "skeleton" || kind === "creeper") return "throw";
    if (kind === "guard" || kind === "irongolem" || kind === "charger" || kind === "boss") return "tough";
    return "weak";
  }
  function roleHp(role) { return role === "tough" ? 3 : role === "throw" ? 2 : role === "boss" ? 8 : 1; }
  function roleAim(role) { return role === "weak" ? 1.45 : role === "throw" ? 2.1 : role === "tough" ? 2.5 : role === "boss" ? 2.2 : 99; }

  function makePistol(camera) {
    const g = new T.Group();
    const metal = new T.MeshLambertMaterial({ color: 0x2a2e30 });
    const dark = new T.MeshLambertMaterial({ color: 0x141618 });
    const skin = new T.MeshLambertMaterial({ color: 0xf0c09a });
    const add = (w, h, d, x, y, z, mat) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      g.add(m);
      return m;
    };
    add(0.07, 0.08, 0.28, 0, 0.04, -0.16, metal);
    add(0.045, 0.045, 0.16, 0, 0.055, -0.36, dark);
    add(0.05, 0.16, 0.07, 0, -0.08, -0.02, dark);
    add(0.09, 0.05, 0.1, 0, -0.02, 0.02, skin);
    add(0.035, 0.04, 0.08, 0.05, -0.01, -0.02, skin);
    const f = add(0.08, 0.08, 0.1, 0, 0.07, -0.5, new T.MeshBasicMaterial({ color: 0xfff2a0 }));
    f.visible = false;
    const halo = add(0.22, 0.22, 0.04, 0, 0.07, -0.46, new T.MeshBasicMaterial({ color: 0xffc14a, transparent: true, opacity: 0.85, depthWrite: false }));
    halo.visible = false;
    g.position.set(0.02, -0.34, -0.42);
    g.scale.setScalar(1.35);
    camera.add(g);
    return { g, flash: f, halo };
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
    const rig = makePistol(ctx.camera);
    pistol = rig.g;
    pistolBase = { z: rig.g.position.z, y: rig.g.position.y };
    flash = rig.flash;
    flashHalo = rig.halo;
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
    try {
      if (ctx.makeBoss) {
        const mesh = ctx.makeBoss();
        mesh.visible = false;
        ctx.scene.add(mesh);
        bossPost = { e: { kind: "boss", mesh, alive: true, hp: 8, h: 2.2, hw: 0.8, active: false }, x: (use.length ? use[use.length - 1].x : 20) + 14, z: 2.2, y: 0.4, role: "boss", aim: 0, aimMax: 2.2, popped: false };
      }
    } catch (err) { window.__bossErr = String(err && err.message || err); }
    const lane = [];
    waves.forEach((w, i) => {
      lane.push({ x: w.x + 2.2, y: 1.7, z: 1.15, kind: "coin" });
      lane.push({ x: w.x + 5.6, y: 2.35, z: 1.0, kind: i === 1 ? "life" : i === 2 ? "ammo" : "coin" });
    });
    const spare = (ctx.L.coins || []).filter((c) => c && c.mesh);
    lane.forEach((spot) => {
      let mesh = null;
      let coin = { taken: false };
      try {
        if (spot.kind === "coin" && spare.length) {
          coin = spare.shift();
          mesh = coin.mesh;
        } else if (spot.kind === "coin" && ctx.makeCoin) mesh = ctx.makeCoin();
        else if (spot.kind === "life" && ctx.makeMushroom) mesh = ctx.makeMushroom(true);
      } catch (err) { mesh = null; }
      if (!mesh) {
        const mat = spot.kind === "life"
          ? new T.MeshLambertMaterial({ color: 0x3ecf6e })
          : new T.MeshLambertMaterial({ color: 0xc4552a });
        mesh = new T.Mesh(new T.BoxGeometry(0.62, 0.62, 0.62), mat);
      }
      mesh.position.set(spot.x, spot.y, spot.z);
      if (!mesh.parent) ctx.scene.add(mesh);
      pickups.push({ mesh, coin, kind: spot.kind, taken: false });
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
    ctx.camera.updateProjectionMatrix();
    if (ctx.pl) ctx.pl.inv = 99999;
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
    p.e.mesh.visible = true;
    p.z0 = 6.2;
    p.z = p.role === "hostage" ? 1.15 : (p.i % 3 === 0 ? 1.15 : p.i % 3 === 1 ? 1.9 : 0.7);
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
      const post = { e, x: camX + 5.2 + (i % 3) * 1.7, y: 0.35, z: 2.2, i, role, aimMax: roleAim(role), aim: roleAim(role), popped: false, nextThrow: 0.6 };
      e.hp = roleHp(role);
      e.alive = true;
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
    phase = "result";
    window.__railPhase = "result";
    const acc = shotsFired ? shotsHit / shotsFired : 0;
    const got = pickups.filter((p) => p.taken || (p.coin && p.coin.taken)).length;
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

  function burst(scene, x, y, z) {
    for (let i = 0; i < 6; i++) {
      const m = new T.Mesh(new T.BoxGeometry(0.08, 0.08, 0.08), new T.MeshBasicMaterial({ color: i % 2 ? 0xfff2a8 : 0xffb020 }));
      m.position.set(x, y, z);
      m.userData.v = new T.Vector3((Math.random() - 0.5) * 3, Math.random() * 2.5, (Math.random() - 0.5) * 3);
      m.userData.life = 0.3;
      scene.add(m);
      sparks.push(m);
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
    posts.forEach((p) => { if (p.e.alive !== false && p.popped) addOwned(p.e.mesh, p, "foe"); });
    if (bossPost && bossPost.popped && bossPost.e.alive !== false) addOwned(bossPost.e.mesh, bossPost, "foe");
    shots3.forEach((s) => addOwned(s.mesh, s, "shot"));
    pickups.forEach((p) => { if (!p.taken && !(p.coin && p.coin.taken)) addOwned(p.mesh, p, p.kind); });
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
      posts.forEach((p) => { if (p.popped && p.e.alive !== false && p.e.mesh) near.push({ mesh: p.e.mesh, extra: p, sort: "foe", lift: 0.8 }); });
      if (bossPost && bossPost.popped && bossPost.e.alive !== false && bossPost.e.mesh) near.push({ mesh: bossPost.e.mesh, extra: bossPost, sort: "foe", lift: 0.8 });
      pickups.forEach((p) => { if (!p.taken && !(p.coin && p.coin.taken) && p.mesh) near.push({ mesh: p.mesh, extra: p, sort: p.kind, lift: 0 }); });
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
    if (hit.sort === "shot") {
      hit.extra.mesh.parent && hit.extra.mesh.parent.remove(hit.extra.mesh);
      shots3 = shots3.filter((s) => s !== hit.extra);
      addPts(ctx, 50);
      gun("hit");
      return;
    }
    if (hit.sort === "coin" || hit.sort === "life" || hit.sort === "ammo") {
      const item = hit.extra;
      item.taken = true;
      if (item.coin) item.coin.taken = true;
      if (item.mesh) item.mesh.visible = false;
      if (hit.sort === "life") { lives = Math.min(5, lives + 1); addPts(ctx, 300); }
      else if (hit.sort === "ammo") { bullets = Math.min(30, bullets + 10); addPts(ctx, 50); }
      else {
        if (ctx.G) ctx.G.coins = (ctx.G.coins || 0) + 1;
        addPts(ctx, 100);
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
      p.e.mesh.visible = false;
      gun("dry");
      return;
    }
    try { ctx.hitFlash && ctx.hitFlash(p.e); } catch (e) {}
    burst(ctx.scene, hit.at.x, hit.at.y, hit.at.z);
    p.e.hp = (p.e.hp || 1) - 1;
    if (p.e.hp > 0) { gun("hit"); return; }
    combo++;
    bestCombo = Math.max(bestCombo, combo);
    window.__comboAt = performance.now() / 1000;
    let pts = 100 + (combo > 1 ? combo * 40 : 0);
    if (head) pts += 150;
    if (quick) pts += 100;
    p.e.x = p.x;
    p.e.y = p.y;
    let scored = false;
    try { if (ctx.killFlip) { ctx.killFlip(p.e, pts); scored = true; } } catch (e) {}
    if (!scored) addPts(ctx, pts);
    gun(p.role === "boss" ? "boom" : "hit");
    p.e.alive = false;
    if (p.e.mesh) p.e.mesh.visible = false;
    if (p.role === "boss") finish(ctx, true);
  }

  function frame(ctx) {
    if (!armed || !ctx || !ctx.scene || !ctx.camera || !ctx.L) return;
    if (!booted) boot(ctx);
    const nowMs = performance.now();
    const dt = Math.min(0.05, (nowMs - (frame._t || nowMs)) / 1000) || 0.016;
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
        bossPost.z = 1.2;
        bossPost.y = 0.35;
        bossPost.popped = true;
        bossPost.e.mesh.visible = true;
        bossPost.e.mesh.position.set(bossPost.x, bossPost.y, bossPost.z);
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
    if (ctx.player) {
      ctx.player.visible = true;
      ctx.player.position.set(camX + 1.8, 0.2, 2.5);
      ctx.player.rotation.set(0, 0.7, 0);
    }
    if (ctx.pl) ctx.pl.inv = 99999;
    ctx.setState && ctx.setState("play");
    const since = performance.now() - lastShot;
    const kick = Math.max(0, recoil);
    recoil = Math.max(0, recoil - 0.08);
    if (pistol && pistolBase) {
      pistol.position.z = pistolBase.z + kick * 0.07;
      pistol.position.y = pistolBase.y - kick * 0.02;
      pistol.rotation.x = kick * 0.18;
    }
    if (flash) { flash.visible = since < 70; flash.scale.setScalar(1 + (1 - Math.min(1, since / 70)) * 1.4); }
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
      if (item.taken || (item.coin && item.coin.taken) || !item.mesh || item.mesh.visible === false) return;
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
      gun("reload");
      setTimeout(() => { bullets = 20; reloading = false; }, 420);
    }
  };
})();
