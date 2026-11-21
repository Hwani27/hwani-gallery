/* Virtua Cop-style rail view inside the real 지금 바로 점프 world.
   The stage, Baro mesh, mob builders, materials, lights, score and SFX
   all come from BlockAction. This file only drives the camera, the
   viewmodel pistol, and the arcade HUD. */
(function () {
  const T = window.THREE;
  if (!T) return;
  const armed = /[?&](?:rail=1|dir=b)(?:&|$)/.test(location.search);
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
  let clock = 32;
  let bullets = 20;
  let lastShot = 0;

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

  function drawHud() {
    if (!hud) return;
    const c = hud.querySelector("canvas");
    const w = 320, h = 180;
    if (c.width !== w) { c.width = w; c.height = h; }
    const g = c.getContext("2d");
    g.clearRect(0, 0, w, h);
    blit(g, "SCORE", 8, 8, 2, "#3ec0ff", "#062033");
    blit(g, String(hud._score || 0).padStart(7, "0"), 8, 28, 2, "#f4fbff", "#062033");
    blit(g, "TIME", 132, 6, 2, "#ffe14a", "#2a2204");
    blit(g, String(Math.max(0, Math.ceil(clock))).padStart(2, "0"), 128, 26, 4, "#ffe14a", "#1a1402");
    blit(g, "STAGE 1-1", 214, 12, 2, "#f7f7f7", "#111");
    blit(g, "BULLET", 8, 156, 2, "#3ec0ff", "#062033");
    blit(g, String(bullets).padStart(2, "0"), 100, 152, 2, "#ffffff", "#062033");
    g.fillStyle = "#f0c14a";
    for (let i = 0; i < 4; i++) {
      g.fillRect(8 + i * 8, 132, 5, 12);
      g.fillStyle = "#fff1b8";
      g.fillRect(8 + i * 8, 132, 5, 3);
      g.fillStyle = "#f0c14a";
    }
    blit(g, "CREDIT", 250, 146, 2, "#f7f7f7", "#111");
    blit(g, "0", 292, 146, 3, "#ffffff", "#111");
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

  function dressSoldier(e, ctx) {
    const human = { walker: 1, guard: 1, pillager: 1, skeleton: 1, charger: 1 };
    if (!human[e.kind] && ctx.makePillager) {
      try {
        const m = ctx.makePillager();
        if (e.mesh && e.mesh.parent) e.mesh.parent.remove(e.mesh);
        e.mesh = m;
        e.kind = "pillager";
        e.h = 1.4;
        e.hw = 0.36;
        (ctx.W3 && ctx.W3.group ? ctx.W3.group : ctx.scene).add(m);
      } catch (err) { /* keep original mesh */ }
    }
    if (!e.mesh) return;
    e.mesh.traverse((o) => {
      if (!o.isMesh || !o.material || !o.material.color) return;
      if (o.userData && o.userData._rail) return;
      o.material = o.material.clone();
      o.material.color.setHex(0x3f6a32);
      o.userData._rail = 1;
    });
    const cap = new T.Mesh(new T.BoxGeometry(0.42, 0.16, 0.42), new T.MeshLambertMaterial({ color: 0x2f5a28 }));
    cap.position.set(0, (e.h || 1.2) + 0.12, 0);
    e.mesh.add(cap);
    const star = new T.Mesh(new T.BoxGeometry(0.16, 0.16, 0.04), new T.MeshBasicMaterial({ color: 0xe10600 }));
    star.position.set(0, 0.02, 0.22);
    cap.add(star);
  }

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

  function boot(ctx) {
    booted = true;
    t0 = performance.now();
    document.documentElement.classList.add("rail-on");
    css();
    const scene = ctx.scene;
    scene.background = new T.Color(0x79c6f0);
    scene.fog = new T.Fog(0xb9d7ec, 14, 42);
    if (ctx.LT) {
      if (ctx.LT.moon) {
        ctx.LT.moon.color.setHex(0xffe0b0);
        ctx.LT.moon.intensity = 1.25;
        ctx.LT.moon.position.set(-8, 18, 8);
        ctx.LT.moon.shadow.mapSize.set(1024, 1024);
      }
      if (ctx.LT.key) {
        ctx.LT.key.color.setHex(0xfff1d2);
        ctx.LT.key.intensity = 0.85;
        ctx.LT.key.position.set(6, 10, 4);
      }
      if (ctx.LT.hemi) {
        ctx.LT.hemi.color.setHex(0xcfe8ff);
        ctx.LT.hemi.groundColor.setHex(0x8a7048);
        ctx.LT.hemi.intensity = 0.7;
      }
      if (ctx.LT.amb) ctx.LT.amb.intensity = 0.22;
    }
    scene.traverse((o) => {
      if (o.geometry && o.geometry.type === "SphereGeometry" && o.geometry.parameters && o.geometry.parameters.radius > 20) {
        o.material = new T.MeshBasicMaterial({ color: 0x8ecff5, side: T.BackSide });
      }
    });
    const grass = ctx.M && ctx.M.grass;
    const wood = ctx.M && ctx.M.wood;
    const floorMat = cloneMat(grass, 10, 4);
    box(scene, 56, 0.28, 9, 28, 0.14, 3.6, floorMat);
    let brick = null;
    if (ctx.W3 && ctx.W3.group) {
      ctx.W3.group.traverse((o) => {
        if (!brick && o.isInstancedMesh && o.material) brick = o.material;
      });
    }
    const wallMat = cloneMat(brick || wood, 2, 2);
    for (let i = 0; i < 8; i++) {
      const h = 1.6 + (i % 3) * 0.7;
      box(scene, 1.6, h, 1.1, 8 + i * 3.2, h / 2, 6.4, wallMat);
    }
    if (wood) {
      box(scene, 0.7, 0.7, 0.7, 11.2, 0.5, 2.8, cloneMat(wood, 1, 1));
      box(scene, 0.55, 0.55, 0.55, 13.4, 0.42, 4.4, cloneMat(wood, 1, 1));
    }
    const ally = ctx.player;
    if (ally) {
      ally.visible = true;
      ally.position.set(10.2, 0.28, 2.55);
      ally.rotation.set(0, Math.PI / 2, 0);
      ally.scale.setScalar(1);
    }
    const list = (ctx.enemies || []).filter((e) => e && e.mesh && e.alive !== false);
    list.sort((a, b) => a.x - b.x);
    list.slice(0, 5).forEach((e, i) => {
      dressSoldier(e, ctx);
      const post = {
        e,
        x: 16 + i * 2.4,
        z: i % 2 ? 5.1 : 2.7,
        y: 0.28
      };
      posts.push(post);
      e.mesh.position.set(post.x, post.y, post.z);
      e.mesh.rotation.y = Math.PI;
    });
    try {
      if (ctx.makeCybertruck) {
        const tr = ctx.makeCybertruck();
        tr.position.set(18.5, 0.28, 3.3);
        tr.rotation.y = -Math.PI / 2;
        tr.scale.setScalar(0.72);
        tr.traverse((o) => {
          if (o.isMesh && o.material && o.material.color) {
            o.material = o.material.clone();
            o.material.color.setHex(0x5c6a38);
          }
        });
        scene.add(tr);
      }
    } catch (err) { /* truck is optional */ }
    const rig = makePistol(ctx.camera);
    pistol = rig.g;
    pistolBase = { z: rig.g.position.z, y: rig.g.position.y };
    flash = rig.flash;
    flashHalo = rig.halo;
    if (ctx.renderer) {
      if (T.ACESFilmicToneMapping) ctx.renderer.toneMapping = T.ACESFilmicToneMapping;
      if ("toneMappingExposure" in ctx.renderer) ctx.renderer.toneMappingExposure = 1.12;
    }
    if (!window.__railKeys) {
      window.__railKeys = 1;
      addEventListener("keydown", (e) => {
        if (e.code === "KeyR") window.RAIL.reload();
      });
    }
    const mount = ctx.renderer && ctx.renderer.domElement;
    if (mount && !mount._rail) {
      mount._rail = 1;
      mount.addEventListener("pointerdown", () => window.RAIL.fire(ctx), true);
    }
    ctx.camera.near = 0.06;
    ctx.camera.fov = 60;
    ctx.camera.updateProjectionMatrix();
    if (ctx.pl) ctx.pl.inv = 9999;
  }

  function burst(scene, x, y, z) {
    for (let i = 0; i < 8; i++) {
      const m = new T.Mesh(new T.BoxGeometry(0.08, 0.08, 0.08), new T.MeshBasicMaterial({ color: i % 2 ? 0xfff2a8 : 0xffb020 }));
      m.position.set(x, y, z);
      m.userData.v = new T.Vector3((Math.random() - 0.5) * 3, Math.random() * 2.5, (Math.random() - 0.5) * 3);
      m.userData.life = 0.35;
      scene.add(m);
      sparks.push(m);
    }
  }

  function gun(name) {
    const g = window.GunSFX;
    if (!g) return;
    try { g.unlock(); g[name] && g[name](); } catch (e) {}
  }

  function spawnSmoke(camera) {
    if (smokes.length > 8) return;
    const m = new T.Mesh(
      new T.SphereGeometry(0.04, 6, 5),
      new T.MeshBasicMaterial({ color: 0xd8d2c4, transparent: true, opacity: 0.35, depthWrite: false })
    );
    m.position.set((Math.random() - 0.5) * 0.04, 0.02, -0.48);
    m.userData.life = 0.45;
    m.userData.v = new T.Vector3((Math.random() - 0.5) * 0.05, 0.08 + Math.random() * 0.05, -0.02);
    camera.add(m);
    smokes.push(m);
  }

  function fire(ctx) {
    if (!ctx || !booted || reloading) return;
    const now = performance.now();
    if (now - lastShot < 140) return;
    if (bullets <= 0) { gun("dry"); lastShot = now; return; }
    lastShot = now;
    bullets--;
    recoil = 1;
    if (flash) { flash.visible = true; flash.scale.setScalar(1); }
    if (flashHalo) { flashHalo.visible = true; flashHalo.scale.setScalar(1); }
    spawnSmoke(ctx.camera);
    gun("shot");
    const ray = new T.Raycaster();
    ray.setFromCamera(new T.Vector2(0, 0), ctx.camera);
    ray.far = 24;
    let hit = null;
    let best = 1e9;
    posts.forEach((p) => {
      if (!p.e || p.e.alive === false || !p.e.mesh) return;
      const box = new T.Box3().setFromObject(p.e.mesh);
      const target = ray.ray.intersectBox(box, new T.Vector3());
      if (!target) return;
      const d = target.distanceTo(ray.ray.origin);
      if (d < best) { best = d; hit = { e: p.e, at: target }; }
    });
    if (hit) {
      burst(ctx.scene, hit.at.x, hit.at.y, hit.at.z);
      try { ctx.hitFlash && ctx.hitFlash(hit.e); } catch (e) {}
      const boss = ctx.BOSSK && ctx.BOSSK[hit.e.kind];
      const dying = !boss && (hit.e.hp || 1) <= 1;
      gun(dying ? "boom" : "hit");
      if (boss && ctx.hitBoss) ctx.hitBoss(hit.e, 1);
      else if (!dying) hit.e.hp -= 1;
      else if (ctx.killFlip) {
        ctx.killFlip(hit.e, 200);
        if (ctx.addScore) ctx.addScore(200, hit.e.x, hit.e.y);
      } else hit.e.alive = false;
    }
    window.__railShot = 1;
  }

  function frame(ctx) {
    if (!armed || !ctx || !ctx.scene || !ctx.camera || !ctx.L) return;
    if (!booted) boot(ctx);
    const t = (performance.now() - t0) / 1000;
    clock = Math.max(0, 32 - t);
    const x = 7.4 + Math.min(2.2, t * 0.22);
    ctx.camera.position.set(x, 1.62, 4.05);
    ctx.camera.lookAt(x + 7.2, 1.25, 2.4);
    ctx.camera.near = 0.06;
    ctx.camera.fov = 60;
    ctx.camera.updateProjectionMatrix();
    if (ctx.player) {
      ctx.player.visible = true;
      ctx.player.position.set(x + 2.1, 0.28, 2.35);
      ctx.player.rotation.set(0, 0.9, 0);
    }
    posts.forEach((p) => {
      if (!p.e || !p.e.mesh || p.e.alive === false) return;
      p.e.mesh.position.set(p.x, p.y, p.z);
      p.e.mesh.rotation.y = -Math.PI / 2;
      p.e.x = p.x;
      p.e.y = p.y;
    });
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
    if (flash) {
      flash.visible = since < 70;
      flash.scale.setScalar(1 + (1 - Math.min(1, since / 70)) * 1.4);
    }
    if (flashHalo) {
      flashHalo.visible = since < 90;
      const k = Math.min(1, since / 90);
      flashHalo.scale.setScalar(1 + k * 2.2);
      flashHalo.material.opacity = 0.8 * (1 - k);
    }
    for (let i = smokes.length - 1; i >= 0; i--) {
      const s = smokes[i];
      s.userData.life -= 0.016;
      s.position.add(s.userData.v);
      s.scale.multiplyScalar(1.03);
      s.material.opacity = Math.max(0, s.userData.life);
      if (s.userData.life <= 0) {
        s.parent && s.parent.remove(s);
        smokes.splice(i, 1);
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.userData.life -= 0.016;
      s.position.addScaledVector(s.userData.v, 0.016);
      s.userData.v.y -= 4 * 0.016;
      if (s.userData.life <= 0) {
        ctx.scene.remove(s);
        sparks.splice(i, 1);
      }
    }
    ["baHud","baPad","baPadX","baDlg","baBoss","baCoach","baMsg","baSkip","baLB"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.setProperty("display", "none", "important");
    });
    const score = ctx.G && ctx.G.score || 0;
    ensureHud(score);
    if (!window.__railIdle && t > 0.35) window.__railIdle = 1;
    puff = t;
  }

  window.RAIL = {
    hold: armed,
    frame,
    fire: () => {
      const ctx = window.__railCtx;
      if (ctx) fire(ctx);
    },
    reload: () => {
      if (!booted || reloading || bullets >= 20) return;
      reloading = true;
      gun("reload");
      setTimeout(() => { bullets = 20; reloading = false; }, 420);
    }
  };
})();
