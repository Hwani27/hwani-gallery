/* Rough direction studies for 지금 바로 멸공.
   A = side-scrolling run-and-gun. B = on-rails light-gun.
   Block meshes in the same THREE build the jumper already loads. */
(function () {
  const T = window.THREE;
  if (!T) return;
  const U = 0.24;
  let started = false;

  function canvasTex(draw, w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c);
    t.magFilter = T.NearestFilter;
    t.minFilter = T.NearestFilter;
    t.generateMipmaps = false;
    if (T.sRGBEncoding) t.encoding = T.sRGBEncoding;
    return t;
  }

  const camoMap = canvasTex((g, w, h) => {
    const cols = ["#6d7c49", "#556338", "#8a9462", "#3e4c2c", "#647448", "#4a5834"];
    const n = 8;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = cols[(x * 3 + y * 5 + (x * y % 3)) % cols.length];
      g.fillRect(x * w / n, y * h / n, w / n + 1, h / n + 1);
    }
  }, 32, 32);

  const stoneMap = canvasTex((g, w, h) => {
    g.fillStyle = "#8b8882";
    g.fillRect(0, 0, w, h);
    const cols = ["#9a968f", "#7a7670", "#a8a39b", "#6e6a64", "#b3aea4"];
    for (let i = 0; i < 28; i++) {
      g.fillStyle = cols[i % cols.length];
      g.fillRect((i * 37) % w, (i * 19) % h, 10 + (i % 5) * 4, 8 + (i % 3) * 3);
    }
    g.strokeStyle = "rgba(40,36,30,.35)";
    g.lineWidth = 2;
    for (let y = 0; y < h; y += 16) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
  }, 64, 64);

  const stripeMap = canvasTex((g, w, h) => {
    for (let x = 0; x < w; x += 8) {
      g.fillStyle = (x / 8) % 2 ? "#f2c21a" : "#1a1a1a";
      g.fillRect(x, 0, 8, h);
    }
  }, 64, 16);

  function flagROK() {
    return canvasTex((g, w, h) => {
      g.fillStyle = "#f4f1ea";
      g.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, r = h * 0.28;
      g.beginPath();
      g.arc(cx, cy, r, Math.PI * 0.15, Math.PI * 1.15);
      g.fillStyle = "#c60c30";
      g.fill();
      g.beginPath();
      g.arc(cx, cy, r, Math.PI * 1.15, Math.PI * 2.15);
      g.fillStyle = "#003478";
      g.fill();
      g.beginPath();
      g.arc(cx - r * 0.45, cy - r * 0.12, r * 0.48, 0, Math.PI * 2);
      g.fillStyle = "#c60c30";
      g.fill();
      g.beginPath();
      g.arc(cx + r * 0.45, cy + r * 0.12, r * 0.48, 0, Math.PI * 2);
      g.fillStyle = "#003478";
      g.fill();
      g.fillStyle = "#111";
      function bars(x, y, rot, broken) {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        for (let i = 0; i < 3; i++) {
          const yy = (i - 1) * 7;
          if (broken[i]) {
            g.fillRect(-16, yy, 12, 4);
            g.fillRect(4, yy, 12, 4);
          } else g.fillRect(-16, yy, 32, 4);
        }
        g.restore();
      }
      bars(w * 0.2, h * 0.22, -0.6, [0, 1, 0]);
      bars(w * 0.8, h * 0.22, 0.6, [1, 0, 1]);
      bars(w * 0.2, h * 0.78, 0.6, [1, 1, 0]);
      bars(w * 0.8, h * 0.78, -0.6, [0, 1, 1]);
    }, 180, 120);
  }

  function flagNK() {
    return canvasTex((g, w, h) => {
      g.fillStyle = "#d21026";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#fff";
      g.fillRect(0, h * 0.16, w, h * 0.06);
      g.fillRect(0, h * 0.78, w, h * 0.06);
      g.fillStyle = "#024b9b";
      g.fillRect(0, h * 0.22, w, h * 0.12);
      g.fillRect(0, h * 0.66, w, h * 0.12);
      g.beginPath();
      g.arc(w * 0.38, h * 0.5, h * 0.2, 0, Math.PI * 2);
      g.fillStyle = "#fff";
      g.fill();
      g.save();
      g.translate(w * 0.38, h * 0.5);
      g.fillStyle = "#d21026";
      g.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        const b = a + Math.PI / 5;
        g.lineTo(Math.cos(a) * h * 0.16, Math.sin(a) * h * 0.16);
        g.lineTo(Math.cos(b) * h * 0.07, Math.sin(b) * h * 0.07);
      }
      g.closePath();
      g.fill();
      g.restore();
    }, 180, 120);
  }

  const MAT = {
    camo: new T.MeshLambertMaterial({ map: camoMap }),
    skin: new T.MeshLambertMaterial({ color: 0xf0c09a }),
    skin2: new T.MeshLambertMaterial({ color: 0xe6b48a }),
    cloth: new T.MeshLambertMaterial({ color: 0x3d6a32 }),
    clothD: new T.MeshLambertMaterial({ color: 0x2c4e24 }),
    boot: new T.MeshLambertMaterial({ color: 0x2a241c }),
    gun: new T.MeshLambertMaterial({ color: 0x2c3130 }),
    gunD: new T.MeshLambertMaterial({ color: 0x1a1e1d }),
    eye: new T.MeshLambertMaterial({ color: 0x1b1b1b }),
    stone: new T.MeshLambertMaterial({ map: stoneMap }),
    stoneD: new T.MeshLambertMaterial({ color: 0x6a6560 }),
    sand: new T.MeshLambertMaterial({ color: 0xc6b48a }),
    crate: new T.MeshLambertMaterial({ color: 0x8d6236 }),
    barrel: new T.MeshBasicMaterial({ color: 0xff2d2d }),
    barrelD: new T.MeshBasicMaterial({ color: 0xffffff }),
    leaf: new T.MeshLambertMaterial({ color: 0x3f7a34 }),
    leafD: new T.MeshLambertMaterial({ color: 0x2d5a28 }),
    dirt: new T.MeshLambertMaterial({ color: 0x7a6848 }),
    grass: new T.MeshLambertMaterial({ color: 0x6a8a3e }),
    olive: new T.MeshLambertMaterial({ color: 0x59683a }),
    oliveD: new T.MeshLambertMaterial({ color: 0x3e4a28 }),
    metal: new T.MeshLambertMaterial({ color: 0x8d9498 }),
    stripe: new T.MeshLambertMaterial({ map: stripeMap }),
    wood: new T.MeshLambertMaterial({ color: 0x6e4e30 }),
    glass: new T.MeshLambertMaterial({ color: 0x9ec4d4 }),
    road: new T.MeshLambertMaterial({ color: 0x8a8680 }),
    flash: new T.MeshBasicMaterial({ color: 0xffe14a }),
    tracer: new T.MeshBasicMaterial({ color: 0xffd23a }),
    star: new T.MeshBasicMaterial({
      map: canvasTex((g, w, h) => {
        g.clearRect(0, 0, w, h);
        g.fillStyle = "#e10600";
        g.beginPath();
        g.translate(w / 2, h / 2);
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
          const b = a + Math.PI / 5;
          g.lineTo(Math.cos(a) * w * 0.46, Math.sin(a) * w * 0.46);
          g.lineTo(Math.cos(b) * w * 0.2, Math.sin(b) * w * 0.2);
        }
        g.closePath();
        g.fill();
      }, 64, 64),
      transparent: true
    })
  };
  const roTex = flagROK();
  const nkTex = flagNK();
  MAT.roFlag = new T.MeshBasicMaterial({ map: roTex, side: T.DoubleSide });
  MAT.nkFlag = new T.MeshBasicMaterial({ map: nkTex, side: T.DoubleSide });

  function box(parent, sx, sy, sz, x, y, z, mat) {
    const m = new T.Mesh(new T.BoxGeometry(sx, sy, sz), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function banner(parent, x, y, z, mat, rw, rh) {
    const m = new T.Mesh(new T.PlaneGeometry(rw || 1.7, rh || 1.15), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }

  function soldier(kind) {
    const root = new T.Group();
    const nk = kind === "nk";
    const cloth = nk ? MAT.cloth : MAT.camo;
    const clothD = nk ? MAT.clothD : MAT.camo;
    const skin = nk ? MAT.skin2 : MAT.skin;
    const g = new T.Group();
    root.add(g);
    box(g, 0.46, 0.62, 0.34, -0.16, 0.52, 0.12, cloth);
    box(g, 0.46, 0.62, 0.34, 0.16, 0.52, -0.1, cloth);
    box(g, 0.28, 0.18, 0.36, -0.16, 0.12, 0.16, MAT.boot);
    box(g, 0.28, 0.18, 0.36, 0.16, 0.12, -0.14, MAT.boot);
    box(g, 0.78, 0.78, 0.46, 0, 1.18, 0, cloth);
    box(g, 0.82, 0.16, 0.48, 0, 0.84, 0, clothD);
    box(g, 0.22, 0.55, 0.26, -0.5, 1.22, 0.05, cloth);
    const armR = new T.Group();
    armR.position.set(0.5, 1.28, 0.08);
    g.add(armR);
    box(armR, 0.22, 0.55, 0.26, 0, -0.16, 0.28, cloth);
    const head = box(g, 0.62, 0.58, 0.58, 0, 1.82, 0, skin);
    box(g, 0.1, 0.1, 0.06, -0.14, 1.84, 0.3, MAT.eye);
    box(g, 0.1, 0.1, 0.06, 0.14, 1.84, 0.3, MAT.eye);
    box(g, 0.16, 0.05, 0.04, 0, 1.66, 0.3, new T.MeshLambertMaterial({ color: nk ? 0xc4886a : 0xd09070 }));
    if (nk) {
      box(g, 0.7, 0.22, 0.66, 0, 2.12, 0, clothD);
      box(g, 0.72, 0.12, 0.28, 0, 2.02, 0.22, cloth);
      const star = new T.Mesh(new T.PlaneGeometry(0.26, 0.26), MAT.star);
      star.position.set(0, 2.16, 0.34);
      g.add(star);
    } else {
      box(g, 0.72, 0.28, 0.7, 0, 2.12, -0.02, cloth);
      box(g, 0.4, 0.1, 0.28, 0, 1.98, 0.32, clothD);
      const patch = new T.Mesh(new T.PlaneGeometry(0.2, 0.14), MAT.roFlag);
      patch.position.set(-0.34, 1.28, 0.24);
      g.add(patch);
    }
    const gun = new T.Group();
    gun.position.set(0.15, 1.12, 0.35);
    g.add(gun);
    box(gun, 0.12, 0.14, 0.7, 0, 0, 0.15, MAT.gun);
    box(gun, 0.08, 0.08, 0.55, 0, 0.02, 0.7, MAT.gunD);
    box(gun, 0.1, 0.22, 0.12, 0, -0.12, 0.05, MAT.gun);
    box(gun, 0.14, 0.12, 0.22, 0, 0.02, -0.22, nk ? MAT.wood : MAT.gunD);
    const muzzle = new T.Object3D();
    muzzle.position.set(0, 0.02, 1.02);
    gun.add(muzzle);
    const flash = box(gun, 0.22, 0.22, 0.22, 0, 0.02, 1.12, MAT.flash);
    flash.castShadow = false;
    root.userData.flash = flash;
    root.userData.muzzle = muzzle;
    root.userData.head = head;
    return root;
  }

  function lights(scene, sky, ground) {
    scene.background = new T.Color(sky);
    scene.fog = new T.Fog(sky, 18, 48);
    const hemi = new T.HemisphereLight(0xfff4e2, ground, 0.85);
    scene.add(hemi);
    const sun = new T.DirectionalLight(0xfff6e4, 1.15);
    sun.position.set(-8, 16, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -14;
    scene.add(sun);
  }

  function ruin(parent, x, y, z, w, h, d) {
    box(parent, w, h, d, x, y + h / 2, z, MAT.stone);
    if (h > 2) {
      box(parent, 0.45, 0.55, 0.08, x - w * 0.22, y + h * 0.62, z + d / 2 + 0.01, MAT.stoneD);
      box(parent, 0.4, 0.7, 0.08, x + w * 0.18, y + h * 0.45, z + d / 2 + 0.01, MAT.glass);
    }
  }

  function tree(parent, x, y, z, s) {
    box(parent, 0.28 * s, 0.9 * s, 0.28 * s, x, y + 0.45 * s, z, MAT.wood);
    box(parent, 1.1 * s, 0.7 * s, 1.1 * s, x, y + 1.15 * s, z, MAT.leaf);
    box(parent, 0.7 * s, 0.5 * s, 0.7 * s, x + 0.15 * s, y + 1.6 * s, z, MAT.leafD);
  }

  function barrel(parent, x, y, z) {
    box(parent, 0.46, 0.62, 0.46, x, y + 0.31, z, MAT.barrel);
    box(parent, 0.5, 0.08, 0.5, x, y + 0.5, z, MAT.barrelD);
    box(parent, 0.5, 0.08, 0.5, x, y + 0.16, z, MAT.metal);
  }

  function crate(parent, x, y, z, s) {
    box(parent, s, s, s, x, y + s / 2, z, MAT.crate);
    box(parent, s * 1.02, 0.06, 0.06, x, y + s * 0.5, z + s / 2, MAT.wood);
  }

  function sandbags(parent, x, y, z, n) {
    for (let i = 0; i < n; i++) {
      box(parent, 0.55, 0.28, 0.38, x + i * 0.48, y + 0.14, z + (i % 2) * 0.05, MAT.sand);
    }
  }

  function tank(parent, x, y, z) {
    const g = new T.Group();
    g.position.set(x, y, z);
    parent.add(g);
    box(g, 1.5, 0.38, 2.3, 0, 0.32, 0, MAT.oliveD);
    box(g, 1.15, 0.28, 1.7, 0, 0.58, -0.05, MAT.olive);
    box(g, 0.7, 0.42, 0.85, 0, 0.9, -0.1, MAT.olive);
    box(g, 0.16, 0.16, 1.35, 0, 0.95, 0.7, MAT.oliveD);
    g.scale.setScalar(1.35);
    box(g, 0.28, 0.42, 0.45, -0.78, 0.28, 0.7, MAT.gunD);
    box(g, 0.28, 0.42, 0.45, 0.78, 0.28, 0.7, MAT.gunD);
    box(g, 0.28, 0.42, 0.45, -0.78, 0.28, -0.7, MAT.gunD);
    box(g, 0.28, 0.42, 0.45, 0.78, 0.28, -0.7, MAT.gunD);
  }

  function truck(parent, x, y, z) {
    const g = new T.Group();
    g.position.set(x, y, z);
    parent.add(g);
    box(g, 1.35, 0.7, 2.6, 0, 0.7, 0, MAT.olive);
    box(g, 1.25, 0.55, 0.9, 0, 1.15, 0.85, MAT.oliveD);
    box(g, 0.7, 0.32, 0.08, 0, 1.15, 1.32, MAT.glass);
    g.scale.setScalar(1.45);
    box(g, 0.28, 0.42, 0.28, -0.48, 0.28, 0.85, MAT.gunD);
    box(g, 0.28, 0.42, 0.28, 0.48, 0.28, 0.85, MAT.gunD);
    box(g, 0.28, 0.42, 0.28, -0.48, 0.28, -0.85, MAT.gunD);
    box(g, 0.28, 0.42, 0.28, 0.48, 0.28, -0.85, MAT.gunD);
  }

  const tracers = [];
  let flashT = 0;

  function spawnTracer(muzzle, dir) {
    const p = new T.Vector3();
    muzzle.getWorldPosition(p);
    const m = new T.Mesh(new T.BoxGeometry(0.16, 0.08, 0.7), MAT.tracer);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), dir.clone().normalize());
    m.position.copy(p);
    m.castShadow = false;
    muzzle.parent && m.lookAt ? null : null;
    const obj = { m, p: p.clone(), v: dir.clone().multiplyScalar(9.5), life: 0.55 };
    tracers.push(obj);
    return m;
  }

  function hudShell() {
    const el = document.createElement("div");
    el.id = "mgHud";
    document.body.appendChild(el);
    const st = document.createElement("style");
    st.textContent = `
      #mgHud{position:fixed;inset:0;z-index:60;pointer-events:none;font-family:Pretendard,Impact,"Trebuchet MS",sans-serif;color:#fff}
      html.mgdir #lang7{display:none !important}
      #mgHud .pix{font-weight:900;letter-spacing:.04em;text-shadow:2px 2px 0 #111,-1px 0 0 #111,0 2px 0 #111}
      #mgA .panel{position:absolute;top:16px;width:250px;padding:8px 10px 10px;border-radius:10px;background:rgba(8,14,22,.72);box-shadow:0 6px 0 rgba(0,0,0,.35)}
      #mgA .panel.p{left:16px;border:4px solid #2f6fe0}
      #mgA .panel.e{right:16px;border:4px solid #d02020}
      #mgA .panel .top{display:flex;align-items:center;gap:8px}
      #mgA .panel canvas.flag{width:54px;height:36px;border:2px solid #111;background:#fff}
      #mgA .panel .nm{font-size:22px}
      #mgA .hp{display:flex;gap:3px;margin:6px 0}
      #mgA .hp i{flex:1;height:14px;background:#163018;box-shadow:inset 0 0 0 2px #0c0c0c}
      #mgA .panel.p .hp i.on{background:linear-gradient(#b6ff6a,#3ec04a)}
      #mgA .panel.e .hp i.on{background:linear-gradient(#ff8a7a,#e02323)}
      #mgA .who{display:flex;align-items:center;gap:8px}
      #mgA .who canvas{width:46px;height:46px;background:#d8c4a4;border:3px solid #111;image-rendering:pixelated}
      #mgA .who b{font-size:28px}
      #mgA .stage{position:absolute;top:18px;left:50%;transform:translateX(-50%);text-align:center}
      #mgA .stage .k{font-size:22px}
      #mgA .stage .sub{font-size:13px;opacity:.85;margin-top:2px}
      #mgA .stage .time{font-size:40px;line-height:1}
      #mgA .nade{position:absolute;left:18px;bottom:18px;display:flex;align-items:center;gap:8px;background:rgba(10,16,24,.72);border:4px solid #31485c;border-radius:12px;padding:6px 12px 6px 8px}
      #mgA .nade canvas{width:42px;height:42px}
      #mgA .nade b{font-size:28px}
      #mgB .score{position:absolute;top:18px;left:22px;font-size:28px;color:#dce7ff;line-height:1}
      #mgB .score small{display:block;font-size:16px;letter-spacing:.18em}
      #mgB .time{position:absolute;top:12px;left:50%;transform:translateX(-50%);text-align:center;color:#ffe14a;font-size:64px;line-height:.85}
      #mgB .time small{display:block;font-size:18px;letter-spacing:.2em;color:#fff}
      #mgB .stage{position:absolute;top:18px;right:22px;text-align:right;font-size:28px}
      #mgB .xhair{position:absolute;left:50%;top:46%;width:54px;height:54px;transform:translate(-50%,-50%)}
      #mgB .xhair i{position:absolute;background:#ff2a2a;box-shadow:0 0 0 2px rgba(0,0,0,.65)}
      #mgB .xhair i:nth-child(1){left:24px;top:0;width:6px;height:16px}
      #mgB .xhair i:nth-child(2){left:24px;bottom:0;width:6px;height:16px}
      #mgB .xhair i:nth-child(3){top:24px;left:0;height:6px;width:16px}
      #mgB .xhair i:nth-child(4){top:24px;right:0;height:6px;width:16px}
      #mgB .xhair b{position:absolute;inset:16px;border:4px solid #ff2a2a;border-radius:50%;box-shadow:0 0 0 2px rgba(0,0,0,.55)}
      #mgB .ammo{position:absolute;left:20px;bottom:18px}
      #mgB .bul{display:flex;gap:6px;margin-bottom:4px}
      #mgB .bul i{width:14px;height:32px;border-radius:6px 6px 3px 3px;background:linear-gradient(#ffe28a,#e0a020 40%,#8a5a12);box-shadow:inset 0 6px 0 #fff1b0,0 2px 0 #111}
      #mgB .ammo .lab{font-size:22px;color:#dce7ff}
      #mgB .ammo .lab b{font-size:36px;color:#fff}
      #mgB .credit{position:absolute;right:22px;bottom:22px;font-size:22px;color:#dce7ff;text-align:right}
      #mgB .credit b{font-size:32px;color:#fff}
    `;
    document.head.appendChild(st);
    return el;
  }

  function paintPortrait(cv, nk) {
    const g = cv.getContext("2d");
    const w = cv.width, h = cv.height;
    g.imageSmoothingEnabled = false;
    g.fillStyle = nk ? "#3d6a32" : "#6d7c49";
    g.fillRect(0, 0, w, h);
    g.fillStyle = nk ? "#e6b48a" : "#f0c09a";
    g.fillRect(8, 16, w - 16, h - 22);
    g.fillStyle = "#1b1b1b";
    g.fillRect(16, 28, 10, 10);
    g.fillRect(w - 26, 28, 10, 10);
    if (nk) {
      g.fillStyle = "#e10600";
      g.fillRect(w / 2 - 6, 6, 12, 12);
    }
  }

  function paintGrenade(cv) {
    const g = cv.getContext("2d");
    g.clearRect(0, 0, cv.width, cv.height);
    g.fillStyle = "#6d7568";
    g.beginPath();
    g.ellipse(21, 26, 12, 14, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#3a4038";
    g.fillRect(16, 8, 10, 8);
    g.strokeStyle = "#d7c07a";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(24, 10, 7, Math.PI, 0);
    g.stroke();
  }

  function mountRenderer(root) {
    const renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    if (T.PCFSoftShadowMap) renderer.shadowMap.type = T.PCFSoftShadowMap;
    if (T.sRGBEncoding) renderer.outputEncoding = T.sRGBEncoding;
    if (T.ACESFilmicToneMapping) {
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
    }
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    root.appendChild(renderer.domElement);
    addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    return renderer;
  }

  function buildA(scene) {
    lights(scene, 0x8ecff2, 0xc4b496);
    scene.fog = new T.Fog(0xb7def4, 26, 58);
    box(scene, 28, 0.4, 16, 0, -0.2, -2, MAT.dirt);
    box(scene, 6, 0.25, 5, 0.15, 0.02, -2.4, MAT.grass);
    ruin(scene, -4.8, 0, -4.6, 2.8, 3.8, 1.1);
    ruin(scene, 4.6, 0, -4.8, 3.1, 3.4, 1.1);
    ruin(scene, 0.1, 0, -6.2, 1.15, 6.2, 1.15);
    box(scene, 0.28, 0.7, 0.28, 0.1, 6.5, -6.2, MAT.barrel);
    banner(scene, -4.85, 3.05, -3.95, MAT.roFlag, 1.45, 1.0);
    banner(scene, 4.7, 2.7, -4.15, MAT.nkFlag, 1.35, 0.92);
    tree(scene, -6.4, 0, -3.6, 1.15);
    tree(scene, 6.3, 0, -3.8, 1.05);
    tank(scene, 0.15, 0, -1.55);
    box(scene, 4.6, 1.25, 1.8, -3.55, 0.62, 0.85, MAT.stone);
    box(scene, 4.4, 1.05, 1.7, 3.15, 0.52, 0.8, MAT.stone);
    sandbags(scene, 1.35, 1.05, 1.15, 3);
    box(scene, 0.12, 1.9, 0.12, 3.55, 2.0, 1.05, MAT.stripe);
    box(scene, 0.12, 1.9, 0.12, 5.05, 2.0, 1.05, MAT.stripe);
    box(scene, 1.7, 0.14, 0.7, 4.3, 2.85, 1.1, MAT.stripe);
    barrel(scene, -1.35, 1.25, 1.35);
    barrel(scene, 5.35, 1.05, 1.25);
    crate(scene, -5.15, 1.25, 1.3, 0.5);
    crate(scene, 1.7, 1.05, 1.45, 0.42);
    for (let i = 0; i < 5; i++) {
      const c = new T.Mesh(new T.BoxGeometry(1.8, 0.4, 0.6), new T.MeshLambertMaterial({ color: 0xffffff }));
      c.position.set(-6 + i * 3.1, 6.2 + (i % 2) * 0.35, -9);
      scene.add(c);
    }
    const baro = soldier("rok");
    baro.position.set(-3.7, 1.25, 1.55);
    baro.rotation.y = Math.PI / 2;
    baro.scale.setScalar(1.05);
    scene.add(baro);
    const e1 = soldier("nk");
    e1.position.set(2.15, 1.32, 1.35);
    e1.rotation.y = -Math.PI / 2;
    e1.scale.setScalar(1.0);
    scene.add(e1);
    const e2 = soldier("nk");
    e2.position.set(4.15, 2.85, 1.7);
    e2.rotation.y = -Math.PI / 2;
    e2.scale.setScalar(0.92);
    scene.add(e2);
    return { baro, enemies: [e1, e2] };
  }

  function buildB(scene) {
    lights(scene, 0x8ec8ee, 0xb7aa90);
    scene.fog = new T.Fog(0xc5d7e4, 10, 34);
    box(scene, 9, 0.2, 28, 0, -0.1, -6, MAT.road);
    box(scene, 3.2, 0.08, 22, 0, 0.02, -6, MAT.dirt);
    ruin(scene, -3.6, 0, -2, 2.4, 4.8, 6);
    ruin(scene, 3.7, 0, -1.5, 2.5, 5.2, 7);
    ruin(scene, -3.3, 0, -8, 2.2, 3.6, 3);
    ruin(scene, 3.5, 0, -8.5, 2.3, 4.2, 3.2);
    box(scene, 2.4, 0.45, 0.4, 0, 3.4, -11, MAT.stone);
    box(scene, 0.28, 2.2, 0.28, -1.1, 1.1, -11, MAT.stoneD);
    box(scene, 0.28, 2.2, 0.28, 1.1, 1.1, -11, MAT.stoneD);
    banner(scene, -2.35, 3.3, 0.95, MAT.roFlag, 1.3, 0.9);
    banner(scene, 2.45, 3.5, 1.6, MAT.nkFlag, 1.25, 0.86);
    tree(scene, -1.5, 0, -6.5, 1.1);
    tree(scene, 1.8, 0, -7.2, 0.9);
    truck(scene, -0.55, 0, -4.15);
    sandbags(scene, -1.7, 0, -0.55, 3);
    box(scene, 1.35, 0.7, 0.4, 1.65, 0.35, -1.15, MAT.stone);
    crate(scene, 0.55, 0, -0.35, 0.5);
    crate(scene, -0.15, 0, 0.45, 0.42);
    barrel(scene, 1.05, 0, 0.15);
    barrel(scene, -0.85, 0, 0.7);
    const baro = soldier("rok");
    baro.position.set(-1.55, 0, -0.85);
    baro.rotation.y = 0.55;
    baro.scale.setScalar(0.92);
    scene.add(baro);
    const foe = soldier("nk");
    foe.position.set(0.15, 0, -2.35);
    foe.rotation.y = 0.05;
    foe.scale.setScalar(1.05);
    scene.add(foe);
    const foe2 = soldier("nk");
    foe2.position.set(1.55, 0.7, -1.25);
    foe2.rotation.y = -0.4;
    foe2.scale.setScalar(0.95);
    scene.add(foe2);
    return { baro, foe, foe2 };
  }

  function pistol(camera) {
    const g = new T.Group();
    box(g, 0.07, 0.09, 0.34, 0, 0.06, -0.22, MAT.gunD);
    box(g, 0.09, 0.11, 0.22, 0, 0.02, -0.02, MAT.gun);
    box(g, 0.05, 0.05, 0.16, 0, 0.07, -0.42, MAT.gun);
    box(g, 0.07, 0.18, 0.08, 0, -0.1, 0.02, MAT.gun);
    box(g, 0.12, 0.08, 0.12, 0, -0.02, 0.06, MAT.skin);
    const flash = box(g, 0.08, 0.08, 0.08, 0, 0.07, -0.54, MAT.flash);
    g.position.set(0.0, -0.5, -0.78);
    g.scale.setScalar(1.15);
    camera.add(g);
    return { g, flash };
  }

  function showA(root) {
    const hud = document.createElement("div");
    hud.id = "mgA";
    hud.innerHTML = `
      <div class="panel p pix">
        <div class="top"><canvas class="flag" id="mgF1" width="90" height="60"></canvas><div class="nm">KOREA</div></div>
        <div class="hp">${"<i class=on></i>".repeat(10)}</div>
        <div class="who"><canvas id="mgP1" width="64" height="64"></canvas><b>× 03</b></div>
      </div>
      <div class="stage pix"><div class="k">STAGE 1-1</div><div class="sub">TIME</div><div class="time" id="mgTime">097</div></div>
      <div class="panel e pix">
        <div class="top"><canvas class="flag" id="mgF2" width="90" height="60"></canvas><div class="nm">N. KOREA</div></div>
        <div class="hp">${"<i class=on></i>".repeat(8)}${"<i></i>".repeat(2)}</div>
        <div class="who"><canvas id="mgP2" width="64" height="64"></canvas><b>× 03</b></div>
      </div>
      <div class="nade pix"><canvas id="mgGn" width="64" height="64"></canvas><b>× 3</b></div>`;
    root.appendChild(hud);
    const c1 = hud.querySelector("#mgF1").getContext("2d");
    c1.drawImage(roTex.image, 0, 0, 90, 60);
    const c2 = hud.querySelector("#mgF2").getContext("2d");
    c2.drawImage(nkTex.image, 0, 0, 90, 60);
    paintPortrait(hud.querySelector("#mgP1"), false);
    paintPortrait(hud.querySelector("#mgP2"), true);
    paintGrenade(hud.querySelector("#mgGn"));
  }

  function showB(root) {
    const hud = document.createElement("div");
    hud.id = "mgB";
    hud.innerHTML = `
      <div class="score pix"><small>SCORE</small>0004200</div>
      <div class="time pix"><small>TIME</small><span id="mgTimeB">32</span></div>
      <div class="stage pix">STAGE 1-1</div>
      <div class="xhair" id="mgX"><i></i><i></i><i></i><i></i><b></b></div>
      <div class="ammo pix"><div class="bul"><i></i><i></i><i></i><i></i></div><div class="lab">BULLET <b id="mgBul">20</b></div></div>
      <div class="credit pix">CREDIT<br><b>0</b></div>`;
    root.appendChild(hud);
  }

  function loopA(renderer, scene, camera, cast) {
    const clock = new T.Clock();
    let acc = 0;
    let time = 97;
    function frame() {
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, clock.getDelta());
      acc += dt;
      flashT += dt;
      const pulse = (Math.sin(flashT * 18) > 0.2);
      [cast.baro].concat(cast.enemies).forEach((s, i) => {
        const f = s.userData.flash;
        if (f) f.visible = ((flashT + i * 0.07) % 0.28) < 0.08;
      });
      scene.updateMatrixWorld(true);
      if (acc > 0.16) {
        acc = 0;
        const shoot = (who) => {
          const dir = new T.Vector3();
          who.userData.muzzle.getWorldDirection(dir);
          scene.add(spawnTracer(who.userData.muzzle, dir));
        };
        shoot(cast.baro);
        cast.enemies.forEach(shoot);
      }
      for (let i = tracers.length - 1; i >= 0; i--) {
        const t = tracers[i];
        t.life -= dt;
        t.m.position.addScaledVector(t.v, dt);
        if (t.life <= 0) {
          scene.remove(t.m);
          tracers.splice(i, 1);
        }
      }
      cast.baro.position.y = 1.35 + Math.sin(flashT * 8) * 0.04;
      time = Math.max(0, 97 - flashT);
      const lab = document.getElementById("mgTime");
      if (lab) lab.textContent = String(Math.ceil(time)).padStart(3, "0");
      renderer.render(scene, camera);
      if (!window.__shotReady && flashT > 0.45 && tracers.length > 2) window.__shotReady = "a";
    }
    frame();
  }

  function loopB(renderer, scene, camera, cast, gun) {
    const clock = new T.Clock();
    const aim = new T.Vector3();
    let fired = false;
    const xhair = document.getElementById("mgX");
    renderer.domElement.style.pointerEvents = "auto";
    renderer.domElement.addEventListener("pointermove", (e) => {
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      if (xhair) xhair.style.transform = `translate(calc(-50% + ${nx * 28}px), calc(-50% + ${ny * 18}px))`;
      aim.set(nx, -ny, 0.5);
    });
    function shoot() {
      fired = true;
      gun.flash.visible = true;
      const spark = new T.Mesh(new T.BoxGeometry(0.35, 0.35, 0.35), MAT.flash);
      cast.foe.localToWorld(spark.position.set(0, 1.35, 0.4));
      scene.add(spark);
      const bul = document.getElementById("mgBul");
      if (bul) bul.textContent = "19";
      window.__shotReady = "b";
    }
    renderer.domElement.addEventListener("pointerdown", shoot);
    gun.flash.visible = false;
    function frame() {
      requestAnimationFrame(frame);
      const t = clock.elapsedTime;
      const dt = Math.min(0.05, clock.getDelta());
      camera.position.z = 3.35 - Math.min(0.25, t * 0.05);
      camera.position.y = 1.62 + Math.sin(t * 2.2) * 0.01;
      camera.lookAt(0.05, 1.2, -8);
      if (!fired && t > 0.55) shoot();
      const lab = document.getElementById("mgTimeB");
      if (lab) lab.textContent = String(Math.max(0, 32 - Math.floor(t)));
      renderer.render(scene, camera);
    }
    frame();
  }

  function start(mode) {
    if (started) return;
    if (mode !== "a" && mode !== "b") return;
    started = true;
    document.documentElement.classList.add("mgdir");
    window.__shotReady = "";
    const splash = document.getElementById("mob620Splash");
    if (splash) splash.classList.add("out");
    const launcher = document.getElementById("launcher");
    if (launcher) launcher.style.display = "none";
    document.body.style.overflow = "hidden";
    const root = document.createElement("div");
    root.id = "mgStage";
    root.style.cssText = "position:fixed;inset:0;z-index:30;background:#87c8ea";
    document.body.appendChild(root);
    hudShell();
    const renderer = mountRenderer(root);
    const scene = new T.Scene();
    if (mode === "a") {
      const camera = new T.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 80);
      camera.position.set(0.15, 3.15, 11.4);
      camera.lookAt(0.2, 2.35, 0);
      addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
      const cast = buildA(scene);
      showA(root);
      loopA(renderer, scene, camera, cast);
    } else {
      const camera = new T.PerspectiveCamera(68, innerWidth / innerHeight, 0.08, 80);
      camera.position.set(0, 1.58, 2.55);
      scene.add(camera);
      const cast = buildB(scene);
      const gun = pistol(camera);
      showB(root);
      loopB(renderer, scene, camera, cast, gun);
    }
    addEventListener("keydown", (e) => {
      if (e.key === "Escape") location.href = "?title=1&stay=1";
    });
  }

  window.MGDIR = { start };
  function kick() {
    const m = /[?&]dir=(a|b)(?:&|$)/.exec(location.search);
    if (m) start(m[1]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kick);
  else kick();
})();
