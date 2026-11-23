/* 지금 바로 쏴! (Shoot Right Now) — standalone Virtua-Cop-style rail shooter.
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
  let flashStar = null;
  let flashLight = null;
  let shells = [];
  let recoil = 0;
  let pistolBase = null;
  let smokes = [];
  let sparks = [];
  let reloading = false;
  let reloadK = 0;
  let puff = null;
  let hud = null;
  let clock = 90;
  let bullets = 20, clipMax = 20;
  let lastShot = 0;
  let hp = 100;
  let lives = 3;
  /* (v20) difficulty, practice, rank perks and continues, read from
     MGProfile (profile.js) at the start of every mission */
  let HPMAX = 100, LIVES0 = 3, continues = 0, practice = false, contOpen = false;
  let DIFF = { dmg: 1, aim: 1, lives: 3, boss: 1, xp: 1 }, PERK = { hp: 100, nades: 0, reload: 1, lives: 0 }, diffKey = "normal";
  /* (v26) pistol finishes bought at the supply depot */
  const SKIN_COL = {
    base: [0x4b5563, 0x323945, 0x606b78, 0x22262c], desert: [0xb09a74, 0x8a7656, 0xc4ad86, 0x6e5e44], digital: [0x5a6a4a, 0x3e4a32, 0x6e7e5a, 0x2e3826],
    navy: [0x2e4a72, 0x1e3050, 0x4a6a96, 0x1a2230], chrome: [0xd8dde2, 0xa8b0b8, 0xeef2f6, 0x2a2e34], gold: [0xe0b440, 0xb88a20, 0xf2cc60, 0x2a1e10], dragon: [0x8a1a1a, 0x3a0a0a, 0xc8302a, 0x140808]
  };
  function applySkin(id) {
    const M = window.__pistolMats, c = SKIN_COL[id] || SKIN_COL.base;
    if (!M) return;
    [M.slide, M.slideDark, M.slideTop, M.poly].forEach((m, i) => { m.color.setHex(c[i]).convertSRGBToLinear(); });
  }
  let LOAD = null, armor = 0;
  function readProfile() {
    const P = window.MGProfile;
    try { applySkin((P && P.skin) || "base"); } catch (e) {}
    try { LOAD = P && P.takeLoadout ? P.takeLoadout() : null; } catch (e) { LOAD = null; }
    try {
      DIFF = (P && P.diffDef) || DIFF;
      diffKey = (P && P.diff) || "normal";
      practice = !!(P && P.practice);
      PERK = (P && P.perks()) || PERK;
    } catch (e) {}
    if (window.__railDiff && window.MGProfile && window.MGProfile.DIFFS[window.__railDiff]) { diffKey = window.__railDiff; DIFF = window.MGProfile.DIFFS[diffKey]; }
    HPMAX = PERK.hp || 100;
    LIVES0 = (DIFF.lives || 3) + (PERK.lives || 0);
  }
  let combo = 0;
  let bestCombo = 0;
  /* (v26) tallies for the daily missions */
  const MS = { kills: 0, heads: 0, bikes: 0, nades: 0 };
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
      #railNade,#railReload{position:fixed;bottom:max(14px,env(safe-area-inset-bottom));z-index:42;width:64px;height:64px;padding:0;border-radius:50%;
        display:grid;place-items:center;pointer-events:auto;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
        border:2px solid rgba(255,255,255,.28);box-shadow:0 6px 18px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.22),inset 0 -6px 12px rgba(0,0,0,.35);
        -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:transform .08s ease,filter .15s ease}
      #railReload{right:max(14px,env(safe-area-inset-right));background:radial-gradient(circle at 50% 30%,rgba(70,96,120,.92),rgba(18,26,36,.92))}
      #railNade{right:max(88px,calc(env(safe-area-inset-right) + 88px));background:radial-gradient(circle at 50% 30%,rgba(108,92,46,.92),rgba(34,28,12,.92))}
      #railNade:active,#railReload:active{transform:scale(.93)}
      #railNade svg,#railReload svg{width:36px;height:36px;display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}
      #railNade .cnt{position:absolute;right:-4px;top:-4px;min-width:22px;height:22px;padding:0 5px;border-radius:11px;background:#ffcf4a;color:#1b1406;
        font:900 13px/22px ui-monospace,monospace;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.5);border:2px solid #1b1406}
      #railNade.empty{filter:grayscale(1) brightness(.6)}
      #railNade.empty .cnt{background:#777}
      #railReload.busy svg{animation:railSpin .44s linear infinite}
      #railReload.low{border-color:#ff6a4a;box-shadow:0 0 0 3px rgba(255,90,60,.35),0 6px 18px rgba(0,0,0,.45)}
      @keyframes railSpin{to{transform:rotate(360deg)}}
      #railResult{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(4,8,16,.9);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;font-family:Pretendard,system-ui,sans-serif;text-align:center;padding:24px}
      #railResult.show{display:flex}
      .railEdge{position:fixed;z-index:44;width:36px;height:36px;pointer-events:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6));opacity:.85}
      .railEdge svg{width:100%;height:100%}
      .railEdge.hot{animation:railEdgeHot .45s ease-in-out infinite alternate;opacity:1}
      @keyframes railEdgeHot{to{filter:drop-shadow(0 0 10px rgba(255,60,40,.95))}}
      .railCut{position:fixed;inset:0;z-index:47;pointer-events:none;font-family:Pretendard,system-ui,sans-serif;color:#fff;display:flex;align-items:center;justify-content:center}
      .railCut .lb{position:absolute;left:0;right:0;height:13vh;background:#000;transition:transform .35s ease}
      .railCut .lb.t{top:0;transform:translateY(-100%);animation:railLbT .35s ease forwards}
      .railCut .lb.b{bottom:0;transform:translateY(100%);animation:railLbB .35s ease forwards}
      @keyframes railLbT{to{transform:translateY(0)}}@keyframes railLbB{to{transform:translateY(0)}}
      .railCut.out .lb.t{animation:none;transform:translateY(-100%)}.railCut.out .lb.b{animation:none;transform:translateY(100%)}
      .railCut .cc{text-align:center;padding:14px 40px;background:linear-gradient(90deg,transparent,rgba(120,0,0,.72) 20%,rgba(120,0,0,.72) 80%,transparent);animation:railCutIn .4s ease-out}
      .railCut.out .cc{opacity:0;transition:opacity .4s}
      .railCut .w{margin:0;font:900 13px/1 ui-monospace,monospace;letter-spacing:.6em;color:#ffd24a;animation:railBlink .3s steps(2) infinite}
      @keyframes railBlink{50%{opacity:.25}}
      .railCut h2{margin:8px 0 4px;font-size:clamp(26px,6vw,44px);font-weight:900;letter-spacing:.02em;text-shadow:0 3px 0 rgba(0,0,0,.6)}
      .railCut .s{margin:0;font:800 11px/1 ui-monospace,monospace;letter-spacing:.3em;color:#ffb0a0}
      .railCut.clear .cc{background:linear-gradient(90deg,transparent,rgba(30,60,10,.7) 20%,rgba(30,60,10,.7) 80%,transparent)}
      .railCut.clear h2{color:#ffe14a;font-size:clamp(34px,8vw,60px)}
      @keyframes railCutIn{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}
      #railPhoto{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:55;display:flex;gap:10px;padding:8px;border-radius:16px;background:rgba(0,0,0,.55);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
      #railPhoto button{min-width:96px;min-height:46px;border-radius:12px;border:2px solid #d8c98a;background:#2a3420;color:#fff;font:900 15px/1 Pretendard,system-ui,sans-serif;cursor:pointer}
      #railPhoto p{margin:0 6px;align-self:center;color:#d8d8c8;font-size:12px}
      #railPause{position:fixed;top:max(64px,calc(env(safe-area-inset-top) + 58px));right:max(14px,env(safe-area-inset-right));z-index:42;width:42px;height:42px;padding:9px;border-radius:12px;
        border:1px solid rgba(255,255,255,.3);background:rgba(10,14,10,.55);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);cursor:pointer;touch-action:manipulation}
      #railPause svg{width:100%;height:100%;display:block}
      #railPauseMenu{position:fixed;inset:0;z-index:53;display:flex;align-items:center;justify-content:center;background:rgba(4,8,4,.72);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);
        font-family:Pretendard,system-ui,sans-serif;color:#fff;padding:16px}
      #railPauseMenu .pc{width:min(380px,100%);display:grid;gap:10px;text-align:center}
      #railPauseMenu .k{margin:0;font:800 11px/1 ui-monospace,monospace;letter-spacing:.3em;color:#c9b871}
      #railPauseMenu h2{margin:2px 0 8px;font-size:34px;font-weight:900}
      #railPauseMenu button{min-height:52px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#fff;font:800 16px/1 inherit;cursor:pointer;touch-action:manipulation}
      #railPauseMenu button.primary{background:linear-gradient(180deg,#56682f,#2c3820);border:2px solid #c9b871;font-size:18px}
      #railPauseMenu .row{display:flex;gap:8px}#railPauseMenu .row button{flex:1;min-height:44px;font-size:13px}
      #railPauseMenu .tip{margin:4px 0 0;font:700 12px/1 ui-monospace,monospace;color:#9aa58a}
      #railShield{position:fixed;inset:0;z-index:41;pointer-events:none;box-shadow:inset 0 0 60px 18px rgba(90,190,255,.55);animation:railShield .25s steps(2) infinite}
      @keyframes railShield{50%{opacity:.35}}
      #railCont{position:fixed;inset:0;z-index:52;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(60,0,0,.55),rgba(0,0,0,.82));
        color:#fff;font-family:Pretendard,system-ui,sans-serif;text-align:center;padding:20px}
      #railCont .cc{width:min(420px,100%)}
      #railCont .k{margin:0;font:800 12px/1 ui-monospace,monospace;letter-spacing:.3em;color:#ff8a7a}
      #railCont h2{margin:10px 0 0;font:900 clamp(36px,9vw,56px)/1 ui-monospace,monospace;letter-spacing:.04em;color:#ffe14a;text-shadow:0 4px 0 #3a2a00,0 0 24px rgba(255,200,60,.45)}
      #railCont .num{margin:6px 0;font:900 clamp(70px,20vw,120px)/1 ui-monospace,monospace;color:#fff;text-shadow:0 6px 0 rgba(0,0,0,.5)}
      #railCont .num.tick{animation:railTick .5s ease-out}
      @keyframes railTick{0%{transform:scale(1.35);color:#ff6a4a}100%{transform:scale(1)}}
      #railCont .d{margin:0 0 16px;color:#e8d8d0;font-size:14px}
      #railCont .btns{display:flex;gap:10px}
      #railCont button{flex:1;min-height:56px;border-radius:14px;border:2px solid #7a6a52;background:#2a2218;color:#eee;font:900 17px/1 inherit;cursor:pointer;touch-action:manipulation}
      #railCont button.primary{flex:1.6;background:linear-gradient(180deg,#e8c65a,#b58a22);border-color:#ffe08a;color:#1e1606}
      #railResult .card{width:min(460px,100%);background:#121a16;border:3px solid #d8c98a;border-radius:18px;padding:22px;box-shadow:0 18px 60px rgba(0,0,0,.55)}
      #railResult h2{margin:0 0 8px;font-size:28px;letter-spacing:.02em}
      #railResult p{margin:6px 0;font-size:16px;color:#dfe6d4}
      #railResult .card{max-height:calc(100vh - 32px);overflow:auto}
      #railResult p.meta{font:800 12px/1 ui-monospace,monospace;letter-spacing:.16em;color:#b8c0a6;margin:4px 0 12px}
      #railResult .grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
      #railResult .grid p{margin:0;padding:8px 4px;border-radius:10px;background:rgba(255,255,255,.05)}
      #railResult .grid span{display:block;font:700 10px/1 ui-monospace,monospace;letter-spacing:.08em;color:#9aa58a}
      #railResult .grid b{display:block;margin-top:5px;font-size:17px;color:#fff}
      #railResult .rk{display:flex;align-items:center;gap:12px;margin-top:12px;padding:10px 12px;border-radius:12px;background:rgba(201,184,113,.1);text-align:left}
      #railResult .rt{flex:1;min-width:0}
      #railResult .rt b{font-size:17px}
      #railResult .rt .xp{margin-left:6px;font:900 13px/1 ui-monospace,monospace;color:#9ce05a}
      #railResult .rt small{display:block;margin-top:4px;font-size:11px;color:#a9b098}
      #railResult .bar{height:6px;margin-top:6px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden}
      #railResult .bar i{display:block;height:100%;background:linear-gradient(90deg,#9cc45a,#e8c860);animation:railGrow .9s ease-out}
      @keyframes railGrow{from{width:0}}
      #railResult .up{margin-top:10px;padding:10px;border-radius:12px;background:linear-gradient(90deg,#7a5a12,#d8b04a,#7a5a12);color:#1b1406;font-weight:900;font-size:17px;animation:railUp .6s ease-out}
      #railResult .up small{display:block;margin-top:3px;font-size:12px;font-weight:800}
      @keyframes railUp{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
      #railResult .nb{margin-top:8px;font:900 13px/1 ui-monospace,monospace;letter-spacing:.2em;color:#ffe14a}
      #railResult .btns.share{margin-top:8px}
      #railResult .btns.share button{min-height:44px;background:#1b2430;border-color:#4f6a86;display:flex;align-items:center;justify-content:center;gap:8px;font-size:15px}
      @media (max-height:520px){#railResult{padding:8px}#railResult .card{width:min(700px,100%);padding:10px 14px;display:grid;grid-template-columns:1fr 1fr;gap:0 14px;align-items:start}
        #railResult .card>*{grid-column:1}#railResult .card>.rk,#railResult .card>.up,#railResult .card>.nb,#railResult .card>.btns{grid-column:2}
        #railResult .card>.rk{grid-row:1 / span 2;margin-top:0}
        #railResult h2{font-size:20px;margin:0 0 4px}#railResult .stars{font-size:22px}#railResult p.meta{margin:2px 0 8px}
        #railResult .grid{grid-template-columns:repeat(3,minmax(0,1fr))}#railResult .grid b{font-size:15px}
        #railResult .btns{margin-top:8px}#railResult .btns button{min-height:40px;font-size:14px;flex:1 1 90px}}
      #railResult .stars{font-size:32px;letter-spacing:6px;color:#ffd54a}
      #railResult .btns{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
      #railResult .btns button{flex:1 1 130px;min-height:52px;border-radius:12px;border:2px solid #6d7a52;background:#222b1c;color:#eef1e6;font:900 16px/1 Pretendard,system-ui,sans-serif;letter-spacing:.02em;cursor:pointer;touch-action:manipulation}
      #railResult .btns button.primary{background:#3d4a22;border-color:#d8c98a;color:#fff}
      #railResult .btns button:active{transform:translateY(1px)}
      .railThreat{position:fixed;z-index:39;pointer-events:none;transform:translate(-50%,-50%);width:26px;height:26px;border-radius:50%;opacity:.97}
      .railThreat .rtArc{position:absolute;left:-7px;top:-7px;width:40px;height:40px;border-radius:50%;
        background:conic-gradient(var(--rtc) calc(var(--rtp) * 1%),rgba(8,10,8,.55) 0);
        box-shadow:0 0 10px rgba(0,0,0,.45)}
      .railThreat .rtDot{position:absolute;inset:0;border-radius:50%;display:grid;place-items:center;
        background:radial-gradient(circle at 50% 38%,rgba(48,14,8,.98),rgba(10,6,4,.98));
        border:2px solid var(--rtc);color:#fff;font:900 15px/1 ui-monospace,monospace;
        box-shadow:0 0 9px var(--rtc),inset 0 0 6px rgba(0,0,0,.7)}
      .railThreat.urgent .rtDot{border-color:#ff2a1a;color:#fff;animation:railPulse .42s steps(2,end) infinite}      @keyframes railPulse{0%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.22)}100%{transform:translate(-50%,-50%) scale(1)}}
      #railRadio{position:fixed;left:calc(max(12px,env(safe-area-inset-left)) + 128px);right:calc(max(14px,env(safe-area-inset-right)) + 166px);
        bottom:max(14px,env(safe-area-inset-bottom));transform:translateY(16px);z-index:46;max-width:620px;margin:0 auto;pointer-events:none;opacity:0;transition:opacity .22s ease,transform .22s ease;
        border:2px solid rgba(160,206,120,.55);border-radius:12px;padding:11px 14px 12px;
        background:linear-gradient(180deg,rgba(10,20,12,.9),rgba(6,12,8,.94));
        box-shadow:0 10px 30px rgba(0,0,0,.55),inset 0 0 22px rgba(80,190,90,.12);
        font-family:Pretendard,system-ui,"Malgun Gothic",sans-serif}
      #railRadio.show{opacity:1;transform:translateY(0)}
      #railRadio .rdTop{display:flex;align-items:center;gap:8px;margin:0 0 6px;
        font:900 10px/1 ui-monospace,monospace;letter-spacing:.24em;color:#8fe07a}
      #railRadio .rdTop i{width:7px;height:7px;border-radius:50%;background:#5ce04e;box-shadow:0 0 8px #5ce04e;animation:railBlip 1.1s steps(2,end) infinite}
      @media (max-width:620px){#railRadio{left:10px;right:10px;bottom:auto;top:max(64px,calc(env(safe-area-inset-top) + 56px))}}
      @keyframes railBlip{0%{opacity:.25}50%{opacity:1}100%{opacity:.25}}
      #railRadio p{margin:0;font-size:clamp(13px,3.4vw,15px);line-height:1.42;color:#eef6e2;text-shadow:0 1px 0 rgba(0,0,0,.7)}
      #railRadio .rdBar{margin-top:8px;height:3px;background:rgba(120,180,100,.22);border-radius:2px;overflow:hidden}
      #railRadio .rdBar b{display:block;height:100%;width:0;background:linear-gradient(90deg,#7ce05a,#d8e86a)}
      .mgPop{position:fixed;z-index:42;pointer-events:none;transform:translate(-50%,-50%);font:900 20px/1 ui-monospace,monospace;color:#ffe14a;text-shadow:0 2px 0 #201a00,0 0 8px rgba(255,225,74,.5);animation:mgPopUp .8s ease-out forwards}
      .railYell{position:fixed;z-index:43;pointer-events:none;transform:translate(-50%,-100%);padding:5px 10px;border-radius:12px;background:#fff;color:#c0281c;
        font:900 15px/1 Pretendard,system-ui,sans-serif;white-space:nowrap;box-shadow:0 3px 0 rgba(0,0,0,.35);animation:railYell .9s ease-out forwards}
      .railYell:after{content:"";position:absolute;left:50%;bottom:-6px;margin-left:-6px;border:6px solid transparent;border-top-color:#fff;border-bottom:0}
      @keyframes railYell{0%{opacity:0;transform:translate(-50%,-80%) scale(.5) rotate(-8deg)}18%{opacity:1;transform:translate(-50%,-110%) scale(1.12) rotate(4deg)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-150%) scale(1)}}
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
  FONT["%"] = ["11001","11010","00010","00100","01000","01011","10011"];

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
    /* (v20) the round buttons carry their own state: grenades left, a
       spinning arrow while reloading, a red ring when the clip runs low */
    try {
      const nbE = document.getElementById("railNade");
      if (nbE) { const c = nbE.querySelector(".cnt"); if (c && c.textContent !== String(grenades)) c.textContent = String(grenades); nbE.classList.toggle("empty", !grenades); }
      const rbE = document.getElementById("railReload");
      if (rbE) { rbE.classList.toggle("busy", !!reloading); rbE.classList.toggle("low", weapon === "pistol" && !reloading && bullets <= 5); }
    } catch (e) {}
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
    const score = (neg ? "-" : "") + String(scv).padStart(neg ? 6 : 7, "0"); /* score is floored at 0 in addPts; the sign path is only a guard */
    blit(g, "SCORE", m, m, sc, "#3ec0ff", "#062033");
    blit(g, score, m, m + 8 * sc + 4, sc, "#f4fbff", "#062033");
    const time = String(Math.max(0, Math.ceil(clock))).padStart(2, "0");
    const tw = textW(time, sc * 2);
    blit(g, "TIME", (w - textW("TIME", sc)) / 2, m, sc, "#ffe14a", "#2a2204");
    blit(g, time, (w - tw) / 2, m + 10 * sc, sc * 2, "#ffe14a", "#1a1402");
    const stage = (STAGE && STAGE.label) || "STAGE 1-1";
    blit(g, stage, w - m - textW(stage, sc), m, sc, "#f7f7f7", "#111");
    const zone = (wave && wave.def && wave.def.zone) || "";
    if (zone) blit(g, zone, w - m - textW(zone, sc * 0.8), m + 9 * sc, sc * 0.8, "#d6e8b4", "#141a10");
    /* armoured boss gauge, straight under the clock */
    if (phase === "boss" && bossPost && bossPost.hpMax) {
      const k = Math.max(0, Math.min(1, (bossPost.e.hp || 0) / bossPost.hpMax));
      const bw = Math.min(w * 0.54, 340), bh = 15 * sc;
      const bx = (w - bw) / 2, by = m + 34 * sc;
      g.fillStyle = "rgba(6,10,8,.78)";
      g.fillRect(bx - 3 * sc, by - 3 * sc, bw + 6 * sc, bh + 6 * sc);
      g.fillStyle = "#2a0f0c";
      g.fillRect(bx, by, bw, bh);
      g.fillStyle = k > 0.5 ? "#e8432c" : k > 0.22 ? "#ff8a2a" : "#ffd34a";
      g.fillRect(bx, by, bw * k, bh);
      g.fillStyle = "rgba(255,255,255,.22)";
      g.fillRect(bx, by, bw * k, 3 * sc);
      blit(g, "BOSS", bx, by + bh + 5 * sc, sc * 0.8, "#ffb0a0", "#2a0c0c");
      const pct = Math.round(k * 100) + "%";
      blit(g, pct, bx + bw - textW(pct, sc * 0.8), by + bh + 5 * sc, sc * 0.8, "#ffd6c8", "#2a0c0c");
    }
    blit(g, "HP " + hp, m, m + 20 * sc, sc, "#ff8a7a", "#2a0c0c");
    if (armor > 0) blit(g, "ARMOR " + armor, m, m + 38 * sc, sc * 0.8, "#8ad0ff", "#0a1a2a");
    blit(g, "X" + lives, m + textW("HP " + Math.max(100, HPMAX) + " ", sc), m + 20 * sc, sc, "#fff", "#111");
    const by = h - m - 12 * sc;
    if (weapon === "pistol") {
      blit(g, "BULLET", m, by, sc, "#3ec0ff", "#062033");
      blit(g, String(bullets).padStart(2, "0"), m + textW("BULLET ", sc), by, sc, "#fff", "#062033");
      bulletIcons(g, m, by - 16 * sc, sc);
    } else {
      const lab = WEAPONS[weapon].label;
      blit(g, lab, m, by, sc, "#ffb84a", "#2a1604");
      blit(g, String(Math.max(0, wAmmo)).padStart(2, "0"), m + textW(lab + " ", sc), by, sc, "#fff", "#2a1604");
    }
    blit(g, "GRENADE X" + grenades, m, by - (weapon === "pistol" ? 28 : 12) * sc, sc * 0.8, grenades ? "#ffd36a" : "#7a7060", "#1a1204");
    const cred = practice ? "PRACTICE" : continues ? "CONTINUE " + continues : (DIFF.en || "NORMAL");
    const edge = m + 172;
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
    if (!mat) return new T.MeshStandardMaterial({ color: 0x8d8880, roughness: 0.9 });
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
  /* the 2d canvas each cached texture was painted on, so a height (bump) map
     and a roughness map can be derived from the very same grain */
  const TXCV = {};

  /* Highest anisotropic filtering the GPU allows, capped at 8: floors and
     walls keep their grain at grazing angles instead of smearing to mush. */
  let MAXANISO = 4;

  /* ---- voxel texture pack ----
     Every surface texture is painted at full size as before, then folded down
     to chunky texels (1/8 size, box-averaged), given a per-texel shade jitter
     and a few bright/dark specks the way block-game texture packs are drawn,
     and blown back up with no smoothing. The texture keeps its size and UVs,
     so bump maps made from the same canvas come out blocky too, and the
     sampler uses nearest filtering up close. Lettering, flags, faces, the sky
     and screen effects keep their smooth canvases. */
  const VOXEL_SKIP = /^(paektu|yalu|flag|star|sign|gateSign|policeText|busRoute|busBoard|workSign|barPanel|led|glint|muzzle|sky|env|face|dmzBoard|cclBoard|mineBoard|chainlink|shopGlass|grip|pistol)/;
  const VOXEL_DIV = 8;
  function voxelKey(key) { return !VOXEL_SKIP.test(key) && key.indexOf("@") < 0; }
  function hash2(x, y, s) {
    let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function voxelize(cv, key) {
    const w = cv.width, h = cv.height;
    const sw = Math.max(8, Math.round(w / VOXEL_DIV)), sh = Math.max(8, Math.round(h / VOXEL_DIV));
    /* box-average in two halvings so the small copy is a true mean, not a
       bilinear pick */
    let src = cv, cw = w, ch = h;
    while (cw / 2 >= sw * 1.01 && ch / 2 >= sh * 1.01) {
      const nc = document.createElement("canvas");
      nc.width = Math.max(sw, Math.round(cw / 2)); nc.height = Math.max(sh, Math.round(ch / 2));
      const ng = nc.getContext("2d");
      ng.imageSmoothingEnabled = true;
      ng.drawImage(src, 0, 0, nc.width, nc.height);
      src = nc; cw = nc.width; ch = nc.height;
    }
    const sc = document.createElement("canvas");
    sc.width = sw; sc.height = sh;
    const sg = sc.getContext("2d");
    sg.imageSmoothingEnabled = true;
    sg.drawImage(src, 0, 0, sw, sh);
    const id = sg.getImageData(0, 0, sw, sh), d = id.data;
    let seed = 0;
    for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) | 0;
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const i = (y * sw + x) * 4;
        const r = hash2(x, y, seed);
        /* soft jitter on every texel, a hard speck on a few */
        let k = 1 + (r - 0.5) * 0.16;
        const r2 = hash2(x + 911, y + 377, seed);
        if (r2 > 0.955) k *= 1.16; else if (r2 < 0.045) k *= 0.8;
        d[i] = Math.min(255, d[i] * k);
        d[i + 1] = Math.min(255, d[i + 1] * k);
        d[i + 2] = Math.min(255, d[i + 2] * k);
      }
    }
    sg.putImageData(id, 0, 0);
    /* (v21) keep the block luminances: the relief (normal) map is built from them */
    try {
      const lum = new Float32Array(sw * sh), blu = new Float32Array(sw * sh);
      for (let k = 0; k < sw * sh; k++) { lum[k] = (d[k * 4] * 0.299 + d[k * 4 + 1] * 0.587 + d[k * 4 + 2] * 0.114) / 255; blu[k] = (d[k * 4 + 2] - d[k * 4]) / 255; }
      VOXLUM[key] = { sw: sw, sh: sh, lum: lum, blu: blu };
    } catch (e) {}
    const g = cv.getContext("2d");
    g.save();
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, w, h);
    g.drawImage(sc, 0, 0, w, h);
    g.restore();
  }

  /* (v21) block relief: every voxel texel becomes a little bevelled tile
     whose face leans with the brightness of its neighbours. Built once per
     texture from the voxel luminances and laid on every lit material that
     uses it, so walls, roads, roofs, rock and leaves catch the sun on their
     block edges instead of reading as flat paint. */
  const VOXLUM = {}, NMAP = {};
  function reliefFor(key) {
    if (NMAP[key] !== undefined) return NMAP[key];
    const V = VOXLUM[key];
    if (!V) return (NMAP[key] = null);
    const C = Math.max(4, Math.min(8, Math.floor(1024 / Math.max(V.sw, V.sh))));
    const W = V.sw * C, H = V.sh * C;
    const hgt = new Float32Array(W * H);
    const L = (x, y) => V.lum[((y + V.sh) % V.sh) * V.sw + ((x + V.sw) % V.sw)];
    for (let cy = 0; cy < V.sh; cy++) for (let cx = 0; cx < V.sw; cx++) {
      const l = L(cx, cy);
      const gx = (L(cx + 1, cy) - L(cx - 1, cy)) * 0.5, gy = (L(cx, cy + 1) - L(cx, cy - 1)) * 0.5;
      for (let py = 0; py < C; py++) for (let px = 0; px < C; px++) {
        const ex = Math.min(px + 0.5, C - px - 0.5), ey = Math.min(py + 0.5, C - py - 0.5);
        const e = Math.min(ex, ey);
        const bev = e < 1.2 ? (1.2 - e) * 0.55 : 0;
        const u = (px + 0.5) / C - 0.5, v = (py + 0.5) / C - 0.5;
        hgt[(cy * C + py) * W + cx * C + px] = l * 0.9 - bev - (u * gx + v * gy) * 0.6;
      }
    }
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const im = g.createImageData(W, H), o = im.data;
    const Hh = (x, y) => hgt[((y + H) % H) * W + ((x + W) % W)];
    const str = 2.2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = (Hh(x + 1, y) - Hh(x - 1, y)) * str, dy = (Hh(x, y + 1) - Hh(x, y - 1)) * str;
      let nx = -dx, ny = dy, nz = 1;
      const n = Math.hypot(nx, ny, nz);
      nx /= n; ny /= n; nz /= n;
      const i = (y * W + x) * 4;
      o[i] = (nx * 0.5 + 0.5) * 255; o[i + 1] = (ny * 0.5 + 0.5) * 255; o[i + 2] = (nz * 0.5 + 0.5) * 255; o[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    const t = new T.CanvasTexture(cv);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.magFilter = T.LinearFilter;
    t.minFilter = T.LinearMipMapLinearFilter;
    t.anisotropy = Math.max(1, Math.min(8, MAXANISO));
    t.needsUpdate = true;
    return (NMAP[key] = t);
  }
  /* (v24) a roughness map per texture: on facades the blue-ish texels are
     glass and go glossy; on asphalt and paving a few clusters of cells are
     wet patches; everything else stays matte */
  const RMAP = {};
  function roughFor(key) {
    if (RMAP[key] !== undefined) return RMAP[key];
    const V = VOXLUM[key];
    const facade = /^fac|shop|glass|window/i.test(key), wet = /asph|road|pave|plaza|walk/i.test(key);
    if (!V || !(facade || wet)) return (RMAP[key] = null);
    const cv = document.createElement("canvas");
    cv.width = V.sw; cv.height = V.sh;
    const g = cv.getContext("2d");
    const im = g.createImageData(V.sw, V.sh), o = im.data;
    for (let y = 0; y < V.sh; y++) for (let x = 0; x < V.sw; x++) {
      const k = y * V.sw + x;
      let r = 0.86;
      if (facade && V.blu[k] > 0.07) r = 0.1 + (1 - V.lum[k]) * 0.12;
      if (wet) {
        const n = Math.sin(x * 0.37 + Math.sin(y * 0.21) * 2.1) * Math.sin(y * 0.29 + Math.cos(x * 0.17) * 1.7);
        r = n > 0.82 ? 0.16 : n > 0.7 ? 0.5 : 0.84 + (V.lum[k] - 0.5) * 0.2;
      }
      const v = Math.max(0, Math.min(255, r * 255));
      o[k * 4] = v; o[k * 4 + 1] = v; o[k * 4 + 2] = v; o[k * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    const t = new T.CanvasTexture(cv);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.magFilter = T.NearestFilter;
    t.minFilter = T.LinearMipMapLinearFilter;
    t.needsUpdate = true;
    return (RMAP[key] = { t: t, facade: facade });
  }
  function applyRelief(root) {
    if (window.__noRelief) return 0;
    let n = 0;
    const done = new Set();
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (!m || done.has(m) || !m.isMeshStandardMaterial || !m.map || m.normalMap) return;
        done.add(m);
        const key = m.map.__key || (m.map.image && m.map.image.__key);
        const base = key ? reliefFor(key) : null;
        if (!base) return;
        const nm = base.clone();
        nm.needsUpdate = true;
        nm.repeat.copy(m.map.repeat);
        nm.offset.copy(m.map.offset);
        nm.wrapS = m.map.wrapS; nm.wrapT = m.map.wrapT;
        m.normalMap = nm;
        const k = /rock|cliff|stone|wall|brick|bark|trunk/i.test(key) ? 0.8 : /leaf|grass|tree|pine|hill/i.test(key) ? 0.6 : /road|asph|lane|tar/i.test(key) ? 0.22 : /ground|snow|plaza|pave|trail|dirt|walk|side/i.test(key) ? 0.45 : 0.4;
        m.normalScale = new T.Vector2(k, k);
        const rf = roughFor(key);
        if (rf && !m.roughnessMap) {
          const rm = rf.t.clone(); rm.needsUpdate = true;
          rm.repeat.copy(m.map.repeat); rm.offset.copy(m.map.offset);
          m.roughnessMap = rm;
          m.roughness = 1;
          m.envMapIntensity = Math.max(m.envMapIntensity || 0, rf.facade ? 0.9 : 0.5);
        }
        m.needsUpdate = true;
        n++;
      });
    });
    window.__relief = n;
    return n;
  }

  function ctex(key, w, h, draw, opt) {
    if (MT[key]) return MT[key];
    const t0 = (typeof performance !== "undefined" ? performance.now() : 0);
    const o = opt || {};
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const g = cv.getContext("2d");
    draw(g, w, h);
    const px = !o.smooth && voxelKey(key) && w >= 64 && h >= 64;
    if (px) voxelize(cv, key);
    const t = new T.CanvasTexture(cv);
    if (T.sRGBEncoding !== undefined) t.encoding = T.sRGBEncoding;
    t.magFilter = px ? T.NearestFilter : T.LinearFilter;
    t.minFilter = T.LinearMipMapLinearFilter;
    t.generateMipmaps = true;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = Math.max(1, Math.min(8, MAXANISO));
    t.needsUpdate = true;
    t.__key = key;
    cv.__key = key;
    MT[key] = t;
    TXCV[key] = cv;
    try {
      if (!window.__texSizes) window.__texSizes = {};
      window.__texSizes[key] = [w, h, t.anisotropy];
      if (!window.__texCanvases) window.__texCanvases = {};
      window.__texCanvases[key] = cv;
      window.__texMs = +((window.__texMs || 0) + (performance.now() - t0)).toFixed(1);
      if (!window.__texMsKey) window.__texMsKey = {};
      window.__texMsKey[key] = +((window.__texMsKey[key] || 0) + (performance.now() - t0)).toFixed(1);
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

  /* Per-pixel grain: the finest surface break a canvas can carry. A few
     thousand rectangles read as tiles at 1024, one random step per pixel reads
     as grit. */
  function grain(g, w, h, amount, seed) {
    const R = rng(seed || 7);
    const img = g.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (R() - 0.5) * amount;
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    g.putImageData(img, 0, 0);
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

  /* ---- surface relief ------------------------------------------------
     A height map is what turns a painted canvas into a surface. It is read
     off the colour map's own luminance (mortar is darker than stone, a door's
     joint darker than its panel), box-blurred once so the noise reads as grain
     instead of static, and pushed out by `gain`. Kept at 256 for memory: bump
     only perturbs a normal, it carries no colour worth 4x the pixels. */
  function bumpTex(key, src, opt) {
    const k = key + "@bump";
    if (MT[k]) return MT[k];
    const o = opt || {};
    const S = o.size || 256;
    const cv = document.createElement("canvas");
    cv.width = S;
    cv.height = S;
    const g = cv.getContext("2d");
    g.fillStyle = "#808080";
    g.fillRect(0, 0, S, S);
    if (src) g.drawImage(src, 0, 0, S, S);
    const img = g.getImageData(0, 0, S, S);
    const d = img.data;
    const n = S * S;
    const lum = new Float32Array(n);
    for (let i = 0, p = 0; p < n; p++, i += 4) lum[p] = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    const blur = new Float32Array(n);
    for (let y = 0; y < S; y++) {
      const yr = ((y - 1 + S) % S) * S, y0 = y * S, yl = ((y + 1) % S) * S;
      for (let x = 0; x < S; x++) {
        const xl = (x - 1 + S) % S, xr = (x + 1) % S;
        blur[y0 + x] = (lum[yr + xl] + lum[yr + x] + lum[yr + xr]
                      + lum[y0 + xl] + lum[y0 + x] + lum[y0 + xr]
                      + lum[yl + xl] + lum[yl + x] + lum[yl + xr]) / 9;
      }
    }
    const gain = o.gain === undefined ? 2.2 : o.gain;
    const lift = o.lift || 0;
    for (let p = 0, i = 0; p < n; p++, i += 4) {
      let v = 128 + (blur[p] - 128) * gain + lift;
      if (o.invert) v = 255 - v;
      d[i] = d[i + 1] = d[i + 2] = v < 0 ? 0 : v > 255 ? 255 : v;
      d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = new T.CanvasTexture(cv);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.magFilter = T.LinearFilter;
    t.minFilter = T.LinearMipMapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = Math.max(1, Math.min(8, MAXANISO));
    t.needsUpdate = true;
    MT[k] = t;
    TXCV[k] = cv;
    try {
      if (!window.__texSizes) window.__texSizes = {};
      window.__texSizes[k] = [S, S, t.anisotropy];
    } catch (e) {}
    return t;
  }

  /* A roughness map is where a surface differs in how it takes the sun: glass
     mirror-smooth, its aluminium frame half-way, the spandrel rough. Black is
     mirror, white is matte, exactly as three.js reads it. */
  function roughTex(key, draw, opt) {
    const k = key + "@rough";
    if (MT[k]) return MT[k];
    const o = opt || {};
    const S = o.size || 256;
    const cv = document.createElement("canvas");
    cv.width = S;
    cv.height = S;
    const g = cv.getContext("2d");
    g.fillStyle = o.base || "#d8d8d8";
    g.fillRect(0, 0, S, S);
    draw(g, S, S);
    const t = new T.CanvasTexture(cv);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.magFilter = T.LinearFilter;
    t.minFilter = T.LinearMipMapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = Math.max(1, Math.min(8, MAXANISO));
    t.needsUpdate = true;
    MT[k] = t;
    TXCV[k] = cv;
    return t;
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
            for (let i = 0; i < 16 * u * u; i++) {
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
      // rain runoff down the face: what makes a concrete wall look old
      for (let i = 0; i < 16; i++) {
        const x = R() * w, wd = (2 + R() * 9) * u, y0 = R() * h * 0.45;
        const lg = g.createLinearGradient(0, y0, 0, y0 + h * (0.3 + R() * 0.5));
        lg.addColorStop(0, "rgba(64,60,50,.2)");
        lg.addColorStop(0.7, "rgba(64,60,50,.1)");
        lg.addColorStop(1, "rgba(64,60,50,0)");
        g.fillStyle = lg;
        g.fillRect(x, y0, wd, h * 0.8);
      }
      // and the white lime bloom that follows a wet season
      for (let i = 0; i < 3; i++) {
        const x = R() * w, y = h * (0.55 + R() * 0.4), r = (16 + R() * 40) * u;
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, "rgba(238,236,226,.22)");
        rg.addColorStop(1, "rgba(238,236,226,0)");
        g.fillStyle = rg;
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
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

  /* street-tree foliage: clumps of leaves in three greens over a dark interior,
     so a clipped box of a tree reads as a bush instead of a green cube */
  function folTex(key, seed) {
    return ctex(key, 256, 256, (g, w, h) => {
      const R = rng(seed || 5);
      const u = w / 128;
      g.fillStyle = "#22301b";
      g.fillRect(0, 0, w, h);
      const cols = ["#3f6b2c", "#4f7d33", "#5f8f3d", "#33602a", "#6da046", "#2b4a22"];
      for (let i = 0; i < 1600; i++) {
        const x = R() * w, y = R() * h;
        const r = (1.6 + R() * 3.4) * u;
        g.globalAlpha = 0.5 + R() * 0.5;
        g.fillStyle = cols[(R() * cols.length) | 0];
        wrapDraw(w, h, x, y, r * 2, (px, py) => {
          g.beginPath();
          g.ellipse(px, py, r, r * 0.62, R() * 3, 0, 7);
          g.fill();
        });
      }
      /* the shaded inside of the crown shows through the gaps */
      for (let i = 0; i < 60; i++) {
        const x = R() * w, y = R() * h, r = (3 + R() * 8) * u;
        g.globalAlpha = 0.3;
        g.fillStyle = "#16200f";
        wrapDraw(w, h, x, y, r, (px, py) => { g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); });
      }
      g.globalAlpha = 1;
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

  /* tyre tread: staggered blocks with a groove between them, so a wheel reads
     as rubber and not as a black cylinder */
  function treadTex(key, seed) {
    return ctex(key, 128, 128, (g, w, h) => {
      const R = rng(seed || 3);
      g.fillStyle = "#8a8a8a";
      g.fillRect(0, 0, w, h);
      const cols = 4, rows = 8;
      const cw = w / cols, rh = h / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const off = (r % 2) * cw * 0.5;
          const x = c * cw + off + 2, y = r * rh + 2;
          g.fillStyle = "#b4b4b4";
          g.fillRect(x, y, cw - 5, rh - 5);
          g.fillStyle = "rgba(255,255,255,.25)";
          g.fillRect(x, y, cw - 5, 1.6);
          g.fillStyle = "rgba(0,0,0,.3)";
          g.fillRect(x, y + rh - 6.6, cw - 5, 1.6);
        }
      }
      speck(g, w, h, ["#5f5f5f", "#c8c8c8"], seed + 2, 260, 1.2);
    });
  }

  /* road paint: a laid film of white or yellow that has been driven over —
     fine cracks, gravel showing through and the odd scuff */
  function paintTex(key, base) {
    return ctex(key, 256, 256, (g, w, h) => {
      const R = rng(key.length * 977 + 13);
      const u = w / 128;
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        g.globalAlpha = 0.04 + R() * 0.13;
        g.fillStyle = R() < 0.55 ? shade(base, 0.72) : shade(base, 1.12);
        const s = (0.6 + R() * 2.2) * u;
        g.fillRect(R() * w, R() * h, s, s * (0.6 + R() * 0.8));
      }
      g.globalAlpha = 1;
      for (let i = 0; i < 12; i++) {
        g.strokeStyle = "rgba(40,40,40," + (0.1 + R() * 0.18).toFixed(2) + ")";
        g.lineWidth = 0.8 * u;
        let x = R() * w, y = R() * h;
        g.beginPath(); g.moveTo(x, y);
        for (let k = 0; k < 4; k++) { x += (R() - 0.5) * 22 * u; y += (R() - 0.5) * 22 * u; g.lineTo(x, y); }
        g.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const x = R() * w, y = R() * h, r = (6 + R() * 16) * u;
        wrapDraw(w, h, x, y, r, (px, py) => {
          const rg = g.createRadialGradient(px, py, 0, px, py, r);
          rg.addColorStop(0, "rgba(120,118,110,.22)");
          rg.addColorStop(1, "rgba(120,118,110,0)");
          g.fillStyle = rg; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        });
      }
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
     hairline cracks, the pale tracks tyres polish into a lane and a patch of
     newer tarmac cut into the old. Painted at 1024 because the road fills the
     bottom half of the frame and its grain has to survive the perspective. */
  function asphaltTex(key, seed, size) {
    const SZ = size || 1024;
    return ctex(key, SZ, SZ, (g, w, h) => {
      const R = rng(seed);
      const u = w / 128;
      g.fillStyle = "#3a3a38";
      g.fillRect(0, 0, w, h);
      /* a newer patch of tarmac: same family, a shade darker, straight edges */
      const px0 = w * 0.08, py0 = h * 0.52, pw = w * 0.46, ph = h * 0.3;
      g.fillStyle = "#333330";
      g.fillRect(px0, py0, pw, ph);
      g.strokeStyle = "rgba(22,23,26,.55)";
      g.lineWidth = 2.2 * u;
      g.strokeRect(px0, py0, pw, ph);
      for (let i = 0; i < 900; i++) {
        g.globalAlpha = 0.05 + R() * 0.14;
        g.fillStyle = ["#282b2f", "#3d4045", "#4a4e54", "#222428", "#565a60"][(R() * 5) | 0];
        const s = (0.5 + R() * 1.8) * u;
        g.fillRect(px0 + R() * pw, py0 + R() * ph, s, s * (0.7 + R() * 0.7));
      }
      g.globalAlpha = 1;
      /* aggregate: fine chips of stone in the bitumen, small enough that a
         tile of road never reads as a pattern of squares */
      for (let i = 0; i < 11000; i++) {
        g.globalAlpha = 0.05 + R() * 0.18;
        g.fillStyle = ["#2b2c2c", "#45464a", "#55565a", "#202122", "#6a6b70", "#37383a", "#4d4a44"][(R() * 7) | 0];
        const s = (0.25 + R() * 0.85) * u;
        g.fillRect(R() * w, R() * h, s, s * (0.7 + R() * 0.7));
      }
      g.globalAlpha = 1;
      grain(g, w, h, 26, seed + 11);
      /* the two wheel tracks of a lane, polished lighter by traffic */
      for (let i = 0; i < 2; i++) {
        const cx = w * (0.26 + i * 0.44);
        const lg = g.createLinearGradient(cx - 56 * u, 0, cx + 56 * u, 0);
        lg.addColorStop(0, "rgba(180,186,194,0)");
        lg.addColorStop(0.5, "rgba(180,186,194,.11)");
        lg.addColorStop(1, "rgba(180,186,194,0)");
        g.fillStyle = lg;
        g.fillRect(cx - 56 * u, 0, 112 * u, h);
      }
      /* tar seams run with the road */
      for (let i = 0; i < 3; i++) {
        g.strokeStyle = "rgba(26,27,31,.34)";
        g.lineWidth = (1.1 + R() * 1.1) * u;
        g.beginPath();
        let x = R() * w, y = 0;
        g.moveTo(x, y);
        while (y < h) { y += 20 * u; x += (R() - 0.5) * 14 * u; g.lineTo(x, y); }
        g.stroke();
      }
      /* and hairline cracks, some of them branching */
      for (let i = 0; i < 22; i++) {
        g.strokeStyle = "rgba(22,23,26," + (0.2 + R() * 0.3).toFixed(2) + ")";
        g.lineWidth = 0.7 * u;
        let x = R() * w, y = R() * h;
        g.beginPath(); g.moveTo(x, y);
        const br = R() < 0.4;
        for (let k = 0; k < 6; k++) {
          x += (R() - 0.5) * 20 * u; y += (R() - 0.3) * 15 * u;
          g.lineTo(x, y);
          if (br && k === 3) {
            g.moveTo(x, y);
            g.lineTo(x + (R() - 0.5) * 26 * u, y + R() * 22 * u);
            g.moveTo(x, y);
          }
        }
        g.stroke();
      }
      /* oil stains and the sheen patches */
      for (let i = 0; i < 10; i++) {
        const x = R() * w, y = R() * h, r = (24 + R() * 44) * u;
        wrapDraw(w, h, x, y, r, (qx, qy) => {
          const rg = g.createRadialGradient(qx, qy, 0, qx, qy, r);
          rg.addColorStop(0, i % 3 ? "rgba(158,164,172,.07)" : "rgba(16,16,19,.3)");
          rg.addColorStop(1, "rgba(158,164,172,0)");
          g.fillStyle = rg; g.beginPath(); g.arc(qx, qy, r, 0, 7); g.fill();
        });
      }
    });
  }

  /* sidewalk pavers: four 0.75 m blocks across, staggered joints packed with
     grit and a little moss, chipped corners, rain-dark blotches and chewing gum
     pressed into the face */
  function paveTex(key, seed) {
    return ctex(key, 512, 512, (g, w, h) => {
      const R = rng(seed);
      const n = 4, s = w / n;
      g.fillStyle = "#5d5d59";
      g.fillRect(0, 0, w, h);
      for (let row = 0; row < n; row++) {
        for (let col = -1; col < n + 1; col++) {
          const off = row % 2 ? s / 2 : 0;
          const x = col * s + off + 3.5, y = row * s + 3.5;
          const bw = s - 7, bh = s - 7;
          const tone = 0.88 + R() * 0.22;
          g.fillStyle = shade("#b3b3ad", tone);
          rr(g, x, y, bw, bh, 2.2);
          g.fill();
          /* bevel: light on the top-left edge, shade bottom-right */
          g.fillStyle = "rgba(255,255,255,.22)";
          g.fillRect(x + 1, y + 1, bw - 2, 1.8);
          g.fillRect(x + 1, y + 1, 1.8, bh - 2);
          g.fillStyle = "rgba(30,30,28,.22)";
          g.fillRect(x + 1, y + bh - 2.8, bw - 2, 2);
          g.fillRect(x + bw - 2.8, y + 1, 2, bh - 2);
          /* grit and the aggregate showing through the finish */
          for (let k = 0; k < 40; k++) {
            g.globalAlpha = 0.05 + R() * 0.15;
            g.fillStyle = R() < 0.5 ? "#8d8d88" : "#d4d4ce";
            const gs = 0.8 + R() * 1.6;
            g.fillRect(x + R() * (bw - 4), y + R() * (bh - 4), gs, gs);
          }
          g.globalAlpha = 1;
          /* a chipped corner */
          if (R() < 0.28) {
            const cw = 4 + R() * 7, cx = R() < 0.5 ? x : x + bw - cw, cy = R() < 0.5 ? y : y + bh - cw;
            g.fillStyle = "rgba(70,68,63,.4)";
            g.beginPath();
            g.moveTo(cx, cy + cw); g.lineTo(cx + cw * 0.4, cy + cw * 0.3); g.lineTo(cx + cw, cy);
            g.lineTo(cx + cw, cy + cw); g.closePath(); g.fill();
          }
          /* dirt that gathers along the joints */
          const dj = g.createLinearGradient(x, y, x, y + bh);
          dj.addColorStop(0, "rgba(58,55,48,.16)");
          dj.addColorStop(0.25, "rgba(58,55,48,0)");
          dj.addColorStop(0.8, "rgba(58,55,48,0)");
          dj.addColorStop(1, "rgba(58,55,48,.2)");
          g.fillStyle = dj;
          g.fillRect(x, y, bw, bh);
          /* moss and rain darkening in a few blocks only */
          if (R() < 0.18) {
            const mx = x + R() * bw * 0.6, my = y + R() * bh * 0.6;
            const rg = g.createRadialGradient(mx, my, 0, mx, my, s * 0.4);
            rg.addColorStop(0, "rgba(58,66,44,.2)");
            rg.addColorStop(1, "rgba(58,66,44,0)");
            g.fillStyle = rg;
            g.fillRect(x, y, bw, bh);
          }
        }
      }
      for (let i = 0; i < 7; i++) {
        g.fillStyle = "rgba(34,32,28,.55)";
        g.beginPath(); g.arc(R() * w, R() * h, 1.4 + R() * 2.6, 0, 7); g.fill();
      }
      speck(g, w, h, ["#6f6f69", "#c3c3bc", "#8f8f88"], seed + 5, 520, 1.4);
    });
  }

  /* a city facade tile: two floors of glazing over spandrel bands, mullions,
     sills, a few lit rooms, lowered blinds and a plant or a desk behind the
     glass. One tile is 6 m wide and 6.4 m tall, so a wall repeats it by its own
     size. The tile also carries its own roughness map: the glass is nearly a
     mirror, its frame half-way, the spandrel and the wall matte. */
  function facadeTex(key, o, seed) {
    const P = o || {};
    const wall = P.wall || "#c2c6cb";
    const glassTop = P.glassTop || "#bfe2f8";
    const glassBot = P.glassBot || "#41637d";
    const sd = seed || 5;
    const t = ctex(key, 512, 512, (g, w, h) => {
      const R = rng(sd);
      const u = w / 384;
      g.fillStyle = wall;
      g.fillRect(0, 0, w, h);
      speck(g, w, h, [shade(wall, 0.93), shade(wall, 1.05), shade(wall, 0.86)], sd + 2, 700 * u * u, 2.4 * u);
      const bays = 3, floors = 2;
      const bw = w / bays, fh = h / floors;
      for (let f = 0; f < floors; f++) {
        const y0 = f * fh;
        /* the floor slab: a band of stone under a sharp shadow line */
        g.fillStyle = shade(wall, 0.84);
        g.fillRect(0, y0 + fh - fh * 0.19, w, fh * 0.19);
        g.fillStyle = "rgba(255,255,255,.3)";
        g.fillRect(0, y0 + fh - fh * 0.19, w, 2.2 * u);
        g.fillStyle = "rgba(18,22,26,.3)";
        g.fillRect(0, y0 + fh - fh * 0.19 + 2.2 * u, w, 3 * u);
        for (let b = 0; b < bays; b++) {
          const x0 = b * bw;
          const gx = x0 + bw * 0.085, gy = y0 + fh * 0.085;
          const gw = bw * 0.83, gh = fh * 0.62;
          /* the reveal: dark inset plus a bright lip on the sun side, which is
             what makes a window read as a hole instead of a poster */
          g.fillStyle = "rgba(20,24,28,.5)";
          g.fillRect(gx - 6 * u, gy - 6 * u, gw + 12 * u, gh + 12 * u);
          g.fillStyle = shade(wall, 0.72);
          g.fillRect(gx - 4 * u, gy - 4 * u, gw + 8 * u, gh + 8 * u);
          g.fillStyle = "rgba(255,255,255,.42)";
          g.fillRect(gx - 4 * u, gy - 4 * u, gw + 8 * u, 1.6 * u);
          g.fillRect(gx - 4 * u, gy - 4 * u, 1.6 * u, gh + 8 * u);
          const lit = R() < 0.11;
          const blinds = !lit && R() < 0.3;
          if (lit) {
            /* an office with its lights on: warm ceiling strip, a desk edge */
            const lgw = g.createLinearGradient(gx, gy, gx, gy + gh);
            lgw.addColorStop(0, "#fbf0cf");
            lgw.addColorStop(0.5, "#efdcb0");
            lgw.addColorStop(1, "#c9ae82");
            g.fillStyle = lgw;
            g.fillRect(gx, gy, gw, gh);
            g.fillStyle = "rgba(255,255,255,.85)";
            g.fillRect(gx + gw * 0.08, gy + gh * 0.08, gw * 0.84, gh * 0.06);
            g.fillStyle = "rgba(96,78,54,.35)";
            g.fillRect(gx + gw * 0.12, gy + gh * 0.62, gw * 0.6, gh * 0.07);
            g.fillRect(gx + gw * 0.76, gy + gh * 0.18, gw * 0.1, gh * 0.5);
          } else {
            /* the sky, reflected: bright at the top, the city deep at the base,
               with a slanted band of glare and a darker band of the block
               across the street */
            const lg = g.createLinearGradient(gx, gy, gx + gw * 0.25, gy + gh);
            lg.addColorStop(0, glassTop);
            lg.addColorStop(0.42, shade(glassTop, 0.9));
            lg.addColorStop(0.62, shade(glassBot, 1.55));
            lg.addColorStop(1, glassBot);
            g.fillStyle = lg;
            g.fillRect(gx, gy, gw, gh);
            g.save();
            g.beginPath();
            g.rect(gx, gy, gw, gh);
            g.clip();
            g.globalAlpha = 0.55;
            g.fillStyle = "#eef8ff";
            g.beginPath();
            g.moveTo(gx, gy + gh * 0.1);
            g.lineTo(gx + gw * 0.42, gy);
            g.lineTo(gx + gw * 0.68, gy);
            g.lineTo(gx, gy + gh * 0.46);
            g.closePath();
            g.fill();
            g.globalAlpha = 0.32;
            g.fillStyle = shade(glassBot, 0.7);
            g.fillRect(gx + gw * 0.55, gy, gw * 0.45, gh);
            g.globalAlpha = 0.4;
            g.fillStyle = "#dfeef8";
            g.fillRect(gx, gy + gh * 0.5, gw, 2 * u);
            /* what is behind the glass: a ceiling line, a desk, a plant */
            g.globalAlpha = 0.22;
            g.fillStyle = "#1b232b";
            g.fillRect(gx, gy, gw, gh * 0.07);
            if (R() < 0.5) {
              g.globalAlpha = 0.18;
              g.fillStyle = "#10161b";
              g.fillRect(gx + gw * (0.1 + R() * 0.3), gy + gh * 0.66, gw * 0.42, gh * 0.08);
            }
            if (R() < 0.35) {
              g.globalAlpha = 0.24;
              g.fillStyle = "#2c4a2a";
              g.beginPath();
              g.arc(gx + gw * 0.78, gy + gh * 0.72, gh * 0.1, 0, 7);
              g.fill();
            }
            g.restore();
            g.globalAlpha = 1;
            /* blinds pulled down over the top part */
            if (blinds) {
              const bh2 = gh * (0.35 + R() * 0.4);
              g.fillStyle = "rgba(240,236,220,.9)";
              g.fillRect(gx, gy, gw, bh2);
              g.fillStyle = "rgba(140,136,120,.45)";
              for (let s2 = 1; s2 < 9; s2++) g.fillRect(gx, gy + (bh2 / 9) * s2, gw, 1.5 * u);
              g.fillStyle = "rgba(0,0,0,.16)";
              g.fillRect(gx, gy + bh2 - 3 * u, gw, 3 * u);
              g.fillStyle = "rgba(255,255,255,.35)";
              g.fillRect(gx, gy + bh2 * 0.06, gw, gh * 0.05);
            }
          }
          /* the centre mullion, with a lit edge */
          g.fillStyle = shade(wall, 0.5);
          g.fillRect(gx + gw * 0.485, gy, 2.6 * u, gh);
          g.fillStyle = "rgba(255,255,255,.3)";
          g.fillRect(gx + gw * 0.485, gy, 0.9 * u, gh);
          /* the sill: a bright ledge with a hard shadow under it */
          g.fillStyle = shade(wall, 1.12);
          g.fillRect(gx - 6 * u, gy + gh + 4 * u, gw + 12 * u, 4.5 * u);
          g.fillStyle = "rgba(20,24,28,.32)";
          g.fillRect(gx - 6 * u, gy + gh + 8.5 * u, gw + 12 * u, 3.5 * u);
        }
      }
      /* pilasters between the bays, lit on one side */
      for (let b = 0; b <= bays; b++) {
        const px = b * bw - 3.4 * u;
        g.fillStyle = shade(wall, 0.86);
        g.fillRect(px, 0, 6.8 * u, h);
        g.fillStyle = "rgba(255,255,255,.16)";
        g.fillRect(px, 0, 1.6 * u, h);
        g.fillStyle = "rgba(16,20,24,.14)";
        g.fillRect(px + 5.2 * u, 0, 1.6 * u, h);
      }
      /* the shadow the parapet throws on the top course */
      const par = g.createLinearGradient(0, 0, 0, h * 0.09);
      par.addColorStop(0, "rgba(20,24,28,.34)");
      par.addColorStop(1, "rgba(20,24,28,0)");
      g.fillStyle = par;
      g.fillRect(0, 0, w, h * 0.09);
      g.fillStyle = "rgba(255,255,255,.12)";
      g.fillRect(0, h - 4 * u, w, 4 * u);
    });
    t.__rough = roughTex(key, (g, w, h) => {
      const bays = 3, floors = 2;
      const bw = w / bays, fh = h / floors;
      for (let f = 0; f < floors; f++) {
        const y0 = f * fh;
        for (let b = 0; b < bays; b++) {
          const x0 = b * bw;
          /* glass: near-mirror in the middle, a little rougher at the edges
             where the frame and the dirt are */
          const lg = g.createLinearGradient(x0 + bw * 0.085, y0, x0 + bw * 0.9, y0 + fh * 0.7);
          lg.addColorStop(0, "#2a2a2a");
          lg.addColorStop(1, "#4a4a4a");
          g.fillStyle = lg;
          g.fillRect(x0 + bw * 0.085, y0 + fh * 0.085, bw * 0.83, fh * 0.62);
          g.fillStyle = "#7a7a7a";
          g.fillRect(x0 + bw * 0.485, y0 + fh * 0.085, 2, fh * 0.62);
        }
      }
    }, { size: 128, base: "#dcdcdc" });
    return t;
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
    if (o.dead) {
      /* (v21) the cartoon death face: eyes squeezed into > <, mouth wide
         open on a yell, a bead of sweat flying off */
      g.fillStyle = o.mid || "#dda87e";
      g.fillRect(9, 18.5, 20, 15); g.fillRect(35, 18.5, 20, 15);
      g.fillRect(21, 44, 22, 13);
      g.strokeStyle = "#1e120a"; g.lineWidth = 2.4; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(12.5, 21.5); g.lineTo(24.5, 26.5); g.lineTo(12.5, 31.5); g.stroke();
      g.beginPath(); g.moveTo(51.5, 21.5); g.lineTo(39.5, 26.5); g.lineTo(51.5, 31.5); g.stroke();
      g.fillStyle = "#3a0e0c"; g.beginPath(); g.ellipse(32, 50.6, 6.4, 5.6, 0, 0, 7); g.fill();
      g.fillStyle = "#f4ece0"; g.fillRect(27.4, 45.6, 9.2, 1.8);
      g.fillStyle = "#d8545a"; g.beginPath(); g.ellipse(32, 54, 3.8, 2.1, 0, 0, 7); g.fill();
      g.fillStyle = "rgba(140,200,255,.9)"; g.beginPath(); g.moveTo(56, 8); g.quadraticCurveTo(60, 14, 56, 16); g.quadraticCurveTo(52, 14, 56, 8); g.fill();
      g.fillStyle = "rgba(220,80,70,.22)"; g.beginPath(); g.ellipse(10, 42, 6, 3.6, 0, 0, 7); g.ellipse(54, 42, 6, 3.6, 0, 0, 7); g.fill();
    }
    g.restore();
  }

  function faceMat(key, o) {
    if (!SOL.faces) SOL.faces = {};
    if (SOL.faces[key]) return SOL.faces[key];
    const t = ctex("face" + key, 256, 256, (g, w, h) => paintFace(g, w, h, o));
    SOL.faces[key] = new T.MeshStandardMaterial({ map: t, roughness: 0.68, metalness: 0.0, envMapIntensity: 0.18 });
    return SOL.faces[key];
  }

  function deadFaceFor(kind) {
    headFor(kind);
    const P = HEAD_P[kind] || HEAD_P.grunt;
    return faceMat(kind + "Dead", Object.assign({}, P, { dead: 1 }));
  }
  let HEAD_P = null;
  function headFor(kind) {
    const P = HEAD_P = HEAD_P || {
      ally: { seed: 11, smile: 1, top: "#f2c69e", mid: "#dea87c", bot: "#b8825a" },
      grunt: { seed: 21, stubble: 1, top: "#eec098", mid: "#d9a276", bot: "#b27c55" },
      thrower: { seed: 33, headband: "#b83a2e", angry: 1, stubble: 1 },
      tough: { seed: 45, angry: 1, beard: 1, scar: 1, top: "#e2b48c", mid: "#c99268", bot: "#a06a44" },
      boss: { seed: 57, angry: 1, moustache: 1, scar: 1, tired: 1, top: "#d9a87f", mid: "#bf8a62", bot: "#96633f" },
      hostage: { seed: 63, worried: 1, top: "#f4cba6", mid: "#e2ae86", bot: "#bf8a63" }
    };
    return faceMat(kind, P[kind] || P.grunt);
  }
  /* (v21) a man going down swaps to the yelling face, and a 으악! pops */
  function deathFace(p) {
    const u = p.mesh && p.mesh.userData;
    if (u && u.kSkin && !p.deadFace) {
      p.deadFace = 1;
      try { const dm = kMat(u.kSkin, true); u.kMeshes.forEach((m) => { m.material = dm; }); } catch (e) {}
    }
    if (!u || !u.head || !u.faceKey || p.deadFace) return;
    p.deadFace = 1;
    try {
      const mats = Array.isArray(u.head.material) ? u.head.material.slice() : null;
      if (mats) { mats[4] = deadFaceFor(u.faceKey); u.head.material = mats; }
    } catch (e) {}
    if (!window.__railYell) return;
    try {
      const cam = window.__railCtx && window.__railCtx.camera;
      if (!cam || !u.headG) return;
      const v = new T.Vector3(); u.headG.getWorldPosition(v); v.y += 0.6;
      const pj = v.project(cam);
      if (pj.z > 1 || Math.abs(pj.x) > 1.1 || Math.abs(pj.y) > 1.1) return;
      const d = document.createElement("div");
      d.className = "railYell";
      const ko = (document.documentElement.lang || "").startsWith("ko");
      const L = ko ? ["으악!", "끄악!", "으아악~!", "크억!", "아이고!"] : ["ARGH!", "AAGH!", "UGH!", "NOOO!", "OOF!"];
      d.textContent = L[(Math.random() * L.length) | 0] + " >_<";
      d.style.left = ((pj.x * 0.5 + 0.5) * innerWidth) + "px";
      d.style.top = ((-pj.y * 0.5 + 0.5) * innerHeight) + "px";
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 900);
    } catch (e) {}
  }

  function makeSol() {
    if (SOL.ready) return;
    SOL.ready = 1;
    /* MeshStandard over the old Lambert: with roughness and metalness in the
       shader, sunlight breaks off painted steel, wet glass and worn concrete
       the way it does outside, and the scene environment map gives the curtain
       walls and the pistol something to reflect. Everything a player can walk
       into keeps its silhouette — only the surface changed. */
    const L = (tex, opt) => new T.MeshStandardMaterial(Object.assign({ map: tex, envMapIntensity: 0.18 }, opt || {}));
    /* a height map read off the colour canvas the texture was painted on */
    const BM = (key, gain) => bumpTex(key, TXCV[key], { gain: gain });
    SOL.stone = L(blockTex("stone", "#bdb6a6", "#5e584c", ["#d6cfbe", "#a9a190", "#948c7c"], 5, { size: 384 }),
      { roughness: 0.84, metalness: 0.0, bumpMap: BM("stone", 2.6), bumpScale: 0.045 });
    SOL.stoneDark = L(blockTex("stoneD", "#9a958a", "#46423a", ["#b3aea2", "#807a70", "#6c665c"], 9, { size: 384 }),
      { roughness: 0.86, metalness: 0.0, bumpMap: BM("stoneD", 2.6), bumpScale: 0.045 });
    SOL.concrete = L(concreteTex("conc", "#b9b7ad", 13),
      { roughness: 0.93, metalness: 0.0, bumpMap: BM("conc", 2.0), bumpScale: 0.03 });
    SOL.sand = L(burlapTex("sand", "#a08a5e", 21), { roughness: 0.95, bumpMap: BM("sand", 2.4), bumpScale: 0.035 });
    SOL.wood = L(woodTex("wood", "#8a6034", "#4e3413", "#c79a58", 4),
      { roughness: 0.8, metalness: 0.03, bumpMap: BM("wood", 1.8), bumpScale: 0.02 });
    SOL.woodDark = L(woodTex("woodD", "#6f4b23", "#38230d", "#a3763c", 8),
      { roughness: 0.84, metalness: 0.03, bumpMap: BM("woodD", 1.8), bumpScale: 0.02 });
    SOL.camo = L(camoTex("camo", ["#5c6b3c", "#47542e", "#6f7d4a", "#3b4527", "#7d7048"], 31),
      { roughness: 0.93, bumpMap: BM("camo", 3.0), bumpScale: 0.012 });
    SOL.camoDark = L(camoTex("camoD", ["#424d2c", "#333d22", "#4f5a36", "#2a321c", "#5c5334"], 37),
      { roughness: 0.93, bumpMap: BM("camoD", 3.0), bumpScale: 0.012 });
    SOL.camoBoss = L(camoTex("camoBoss", ["#4a4a30", "#33331f", "#5c5c3c", "#262616"], 41),
      { roughness: 0.9, bumpMap: BM("camoBoss", 3.0), bumpScale: 0.012 });
    const weave = weaveTex("weave", "#d2d2d2", 3);
    const weaveFine = weaveTex("weaveF", "#cfcfcf", 7, 1.5);
    SOL.steel = L(metalTex("steel", 12), { color: 0x7c848e, roughness: 0.34, metalness: 0.88, bumpMap: BM("steel", 2.0), bumpScale: 0.008 });
    SOL.helm = L(camoTex("helm", ["#4d5a33", "#3a4526", "#5c6b40", "#2f3820"], 43, 128),
      { roughness: 0.44, metalness: 0.18, bumpMap: BM("helm", 3.0), bumpScale: 0.02 });
    SOL.belt = L(leatherTex("belt", "#3a3226", 77), { color: 0x8d8578, roughness: 0.56, metalness: 0.06, bumpMap: BM("belt", 2.2), bumpScale: 0.02 });
    SOL.boot = L(leatherTex("boot", "#2b2319", 4), { roughness: 0.7, metalness: 0.04, bumpMap: BM("boot", 2.2), bumpScale: 0.02 });
    SOL.skin = L(null, { color: 0xe8b48c, roughness: 0.72, metalness: 0.0 });
    SOL.black = L(polymerTex("poly", 6), { color: 0x1e1e21, roughness: 0.5, metalness: 0.06, bumpMap: BM("poly", 2.4), bumpScale: 0.012 });
    SOL.gunmetal = L(metalTex("gunmetal", 18, { base: "#dfe3e7" }), { color: 0x3d4246, roughness: 0.3, metalness: 0.9, bumpMap: BM("gunmetal", 2.0), bumpScale: 0.008 });
    SOL.red = L(null, { color: 0xc0281f, roughness: 0.55, metalness: 0.05 });
    SOL.gold = L(null, { color: 0xd8a83c, roughness: 0.32, metalness: 0.85 });
    SOL.white = L(weaveFine, { color: 0xf3efe2, roughness: 0.9 });
    SOL.civil = L(weave, { color: 0xece4d0, roughness: 0.92 });
    SOL.civilPant = L(weaveFine, { color: 0x3d4a63, roughness: 0.92 });
    SOL.hair = L(null, { color: 0x241a12, roughness: 0.86 });
    SOL.olive = L(weave, { color: 0x5c6438, roughness: 0.93 });
    SOL.oliveDark = L(weave, { color: 0x434a26, roughness: 0.93 });
    SOL.tire = L(treadTex("tire", 6), { color: 0x22242a, roughness: 0.95, metalness: 0.02, bumpMap: BM("tire", 3.4), bumpScale: 0.03 });
    SOL.barrel = L(barrelTex("barrel", 77), { roughness: 0.58, metalness: 0.32, bumpMap: BM("barrel", 2.0), bumpScale: 0.012 });
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
    SOL.flagKR = L(flagKR(), { side: T.FrontSide, roughness: 0.88, metalness: 0.0 });
    SOL.flagKP = L(flagKP(), { side: T.FrontSide, roughness: 0.88, metalness: 0.0 });
    SOL.street = L(cobbleTex("street", "#9b9587", 91),
      { roughness: 0.9, metalness: 0.0, bumpMap: BM("street", 2.6), bumpScale: 0.04 });
    SOL.grass = L(null, { color: 0x6d8a3f, roughness: 0.96 });
    SOL.tan = L(camoTex("tan", ["#ddcda8", "#cdbb94", "#e8dcc0", "#b9a681", "#f0e6cc"], 71),
      { roughness: 0.93, bumpMap: BM("tan", 3.0), bumpScale: 0.012 });
    SOL.tanDark = L(camoTex("tanD", ["#8e8062", "#7a6d52", "#9d8f6e", "#6b5f47"], 73),
      { roughness: 0.93, bumpMap: BM("tanD", 3.0), bumpScale: 0.012 });
    SOL.vest = L(weave, { color: 0x2b3036, roughness: 0.9 });
    SOL.enemyCloth = L(weave, { color: 0x5c6b39, roughness: 0.93 });
    SOL.enemyDark = L(weave, { color: 0x49562c, roughness: 0.93 });
    SOL.enemyBelt = L(weaveFine, { color: 0x6d4a28, roughness: 0.88 });
    SOL.enemyCap = L(weave, { color: 0x53612f, roughness: 0.92 });
    SOL.helmAlly = L(null, { color: 0x4b5145, roughness: 0.5, metalness: 0.15 });
    SOL.plate = L(weave, { color: 0x333829, roughness: 0.9 });
    SOL.strap = L(weaveFine, { color: 0x2b2c27, roughness: 0.9 });
    SOL.rubber = L(null, { color: 0x1b1c1a, roughness: 0.95 });
    SOL.lens = L(null, { color: 0x24343c, emissive: 0x0a1216, roughness: 0.12, metalness: 0.45 });
    SOL.bandW = L(weaveFine, { color: 0xe8e6dc, roughness: 0.9 });
    SOL.bandB = L(weaveFine, { color: 0x22407c, roughness: 0.9 });
    /* ---- Seoul set materials ---- */
    SOL.pave = L(paveTex("pave", 21),
      { roughness: 0.86, metalness: 0.0, bumpMap: BM("pave", 2.6), bumpScale: 0.05 });
    SOL.facA = L(facadeTex("facA", { wall: "#c2c8cf", glassTop: "#b6dcf4", glassBot: "#2c445a" }, 5),
      { roughness: 0.55, metalness: 0.22, envMapIntensity: 0.6, bumpMap: BM("facA", 2.0), bumpScale: 0.02 });
    SOL.facB = L(facadeTex("facB", { wall: "#cdc6b7", glassTop: "#cde8f4", glassBot: "#37545f" }, 7),
      { roughness: 0.55, metalness: 0.22, envMapIntensity: 0.6, bumpMap: BM("facB", 2.0), bumpScale: 0.02 });
    SOL.facC = L(facadeTex("facC", { wall: "#848d96", glassTop: "#9cc6de", glassBot: "#22384a" }, 9),
      { roughness: 0.55, metalness: 0.22, envMapIntensity: 0.6, bumpMap: BM("facC", 2.0), bumpScale: 0.02 });
    SOL.facA.roughnessMap = MT["facA@rough"] || null;
    SOL.facB.roughnessMap = MT["facB@rough"] || null;
    SOL.facC.roughnessMap = MT["facC@rough"] || null;
    SOL.shopGlass = L(shopTex("shopGlass", 3), { roughness: 0.22, metalness: 0.4, envMapIntensity: 0.7 });
    SOL.shopFascia = L(null, { color: 0x24282d, roughness: 0.62, metalness: 0.2 });
    SOL.awnA = L(weave, { color: 0x2f6f4e, roughness: 0.78 });
    SOL.awnB = L(weave, { color: 0xb8342c, roughness: 0.78 });
    SOL.doorDark = L(null, { color: 0x15181b, roughness: 0.45, metalness: 0.15 });
    SOL.curb = L(null, { color: 0x9a9a94, roughness: 0.82 });
    SOL.roofDeck = L(concreteTex("roofDeck", "#a9a9a2", 27),
      { roughness: 0.95, bumpMap: BM("roofDeck", 2.0), bumpScale: 0.028 });
    SOL.concLight = L(concreteTex("concLight", "#c6c6be", 29),
      { roughness: 0.92, bumpMap: BM("concLight", 2.0), bumpScale: 0.028 });
    SOL.archLit = L(concreteTex("archLit", "#d9cfba", 31),
      { emissive: 0x4a4030, roughness: 0.9, bumpMap: BM("archLit", 2.0), bumpScale: 0.024 });
    SOL.tankBlue = L(null, { color: 0x6f8fa4, roughness: 0.55, metalness: 0.2 });
    SOL.acUnit = L(null, { color: 0xc9cbc6, roughness: 0.62, metalness: 0.22 });
    SOL.metalDark = L(null, { color: 0x3a3e44, roughness: 0.42, metalness: 0.7 });
    SOL.poleGray = L(null, { color: 0x8e949a, roughness: 0.46, metalness: 0.55 });
    SOL.ledFrame = L(null, { color: 0x1b1d21, roughness: 0.5, metalness: 0.35 });
    SOL.ledScreen = new T.MeshBasicMaterial({ map: ledTex("led") });
    SOL.gateStone = L(blockTex("gateStone", "#cdc7b8", "#7a7466", ["#e2dccd", "#b8b1a2", "#a29b8d"], 61, { size: 512 }),
      { roughness: 0.8, metalness: 0.0, bumpMap: BM("gateStone", 2.8), bumpScale: 0.05 });
    SOL.woodRed = L(woodTex("woodRed", "#a45332", "#6d2a17", "#cf8557", 12),
      { roughness: 0.52, metalness: 0.05, bumpMap: BM("woodRed", 1.8), bumpScale: 0.02 });
    SOL.dancheongG = L(null, { color: 0x2f6b4f, roughness: 0.55, metalness: 0.08 });
    SOL.dancheongR = L(null, { color: 0xb23a2c, roughness: 0.55, metalness: 0.08 });
    SOL.roofTile = L(roofTileTex("roofTile"),
      { emissive: 0x1b1f24, roughness: 0.46, metalness: 0.14, bumpMap: BM("roofTile", 2.4), bumpScale: 0.04 });
    SOL.roofRidge = L(null, { color: 0x8a9099, roughness: 0.4, metalness: 0.6 });
    SOL.rafter = L(woodTex("rafter", "#6b4b2c", "#432c15", "#8f6b45", 23),
      { roughness: 0.82, bumpMap: BM("rafter", 1.8), bumpScale: 0.018 });
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
    SOL.concPole = L(concreteTex("concPole", "#a9a9a3", 33),
      { roughness: 0.9, bumpMap: BM("concPole", 2.0), bumpScale: 0.026 });
    SOL.coneOrange = L(null, { color: 0xe2622a, roughness: 0.52, metalness: 0.04 });
    SOL.paintWhite = L(paintTex("paintW", "#eeece2"), { roughness: 0.62, metalness: 0.02 });
    SOL.paintYellow = L(paintTex("paintY", "#d3ad30"), { roughness: 0.62, metalness: 0.02 });
    SOL.hydrant = L(null, { color: 0xc03a2c, roughness: 0.44, metalness: 0.22 });
    SOL.scaffPlank = L(woodTex("plank", "#9a7440", "#6a4a22", "#c49a60", 19),
      { roughness: 0.82, bumpMap: BM("plank", 1.8), bumpScale: 0.018 });
    SOL.scaffPole = L(null, { color: 0x7d838a, roughness: 0.4, metalness: 0.62 });
    SOL.scaffNet = new T.MeshStandardMaterial({ color: 0x2f7a45, roughness: 0.9, transparent: true, opacity: 0.55, side: T.DoubleSide, envMapIntensity: 0.18 });
    SOL.planter = L(null, { color: 0x8d8b84, roughness: 0.85 });
    SOL.soil = L(null, { color: 0x3a2f22, roughness: 0.98 });
    SOL.hedge = L(folTex("fol", 3), { roughness: 0.9, bumpMap: BM("fol", 3.2), bumpScale: 0.05 });
    SOL.policeWhite = L(null, { color: 0xf1f4f6, roughness: 0.3, metalness: 0.12, envMapIntensity: 0.5 });
    SOL.policeBlue = L(null, { color: 0x20438f, roughness: 0.34, metalness: 0.15 });
    SOL.policeText = new T.MeshBasicMaterial({ map: signTex("policeText", "POLICE", "#ffffff", "#1b3f8f") });
    SOL.carGlass = L(null, { color: 0x22333f, emissive: 0x060c10, roughness: 0.07, metalness: 0.55, envMapIntensity: 0.9 });
    SOL.hubCap = L(null, { color: 0xb9bdc2, roughness: 0.24, metalness: 0.95 });
    SOL.lampRed = new T.MeshBasicMaterial({ color: 0xd52a20 });
    SOL.lampBlue = new T.MeshBasicMaterial({ color: 0x2a6df0 });
    SOL.lampWarm = new T.MeshBasicMaterial({ color: 0xffe6a8 });
    SOL.drumOrange = L(null, { color: 0xe4692a, roughness: 0.58, metalness: 0.28 });
    SOL.drumDark = L(null, { color: 0x9c3f16, roughness: 0.62, metalness: 0.26 });
    SOL.busGreen = L(null, { color: 0x2f8f5b, roughness: 0.32, metalness: 0.18, envMapIntensity: 0.5 });
    SOL.busDark = L(null, { color: 0x1c5f3c, roughness: 0.38, metalness: 0.16 });
    SOL.busRoute = new T.MeshBasicMaterial({ map: signTex("busRoute", "143", "#1c5f3c", "#ffffff") });
    SOL.busBoard = new T.MeshBasicMaterial({ map: signTex("busBoard", "143  서울역", "#101314", "#e8e2c8") });
    SOL.armyOlive = L(weave, { color: 0x4d5a34, roughness: 0.78, metalness: 0.12 });
    SOL.armyDark = L(weave, { color: 0x3a4426, roughness: 0.8, metalness: 0.1 });
    SOL.truckWhite = L(null, { color: 0xe9ecee, roughness: 0.32, metalness: 0.18 });
    SOL.truckBlue = L(null, { color: 0x3f6f9e, roughness: 0.36, metalness: 0.18 });
    SOL.barrier = L(concreteTex("barrierConc", "#cfcdc4", 41),
      { roughness: 0.9, metalness: 0.0, bumpMap: BM("barrierConc", 2.0), bumpScale: 0.032 });
    SOL.concBlock = L(concreteTex("concBlock", "#bab8ae", 43),
      { roughness: 0.91, bumpMap: BM("concBlock", 2.0), bumpScale: 0.03 });
    SOL.siteWall = L(null, { color: 0xc2c6c4, roughness: 0.72, metalness: 0.08 });
    SOL.siteWallCap = L(null, { color: 0x7d838a, roughness: 0.5, metalness: 0.45 });
    SOL.workSign = new T.MeshBasicMaterial({ map: signTex("workSign", "공사중", "#f2c230", "#1a1a1a") });
    SOL.strapY = L(null, { color: 0xd8c23a, roughness: 0.7 });
    SOL.barricadePanel = new T.MeshStandardMaterial({
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
      }),
      roughness: 0.55, metalness: 0.1, envMapIntensity: 0.2
    });
    SOL.towerWhite = L(null, { color: 0xe8ecef, roughness: 0.6, metalness: 0.1 });
    SOL.towerGlass = L(null, { color: 0x5d7f97, roughness: 0.12, metalness: 0.5, envMapIntensity: 0.8 });
    SOL.mountain = L(null, { color: 0x4f6e4a, roughness: 0.98, metalness: 0.0 });
    SOL.rubbleChunk = L(concreteTex("rubble", "#b8b6ad", 47),
      { roughness: 0.93, bumpMap: BM("rubble", 2.0), bumpScale: 0.028 });
    SOL.digi = L(digiCamoTex("digi", 5), { roughness: 0.9, bumpMap: BM("digi", 3.0), bumpScale: 0.01 });
    SOL.digiDark = L(digiCamoTex("digiD", 9), { roughness: 0.9, bumpMap: BM("digiD", 3.0), bumpScale: 0.01 });
    SOL.helmDigi = L(digiCamoTex("helmDigi", 13), { roughness: 0.46, metalness: 0.16, bumpMap: BM("helmDigi", 3.0), bumpScale: 0.018 });
    SOL.digiVest = L(weave, { color: 0x3f4a35, roughness: 0.9 });
    SOL.flagPatch = L(flagKR(), { side: T.FrontSide, roughness: 0.85 });
    SOL.brass = L(null, { color: 0xb8892f, roughness: 0.28, metalness: 0.92 });
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
  /* (v27) people built on Kenney's Blocky Characters (CC0): one shared rig,
     models/characters/character.glb (head, torso, two arms, two legs; no
     skinning, so a clone is cheap), wearing skins painted for this game —
     North Korean infantry, a darker veteran, a modern ROK soldier and four
     Korean civilians, each with a ">_<" twin for the moment he goes down.
     The rig's joints are handed to the old controller under the old names
     (armL/armR/legL/legR/headG/body), so every pose, walk, aim, ride and fall
     keeps working. Until the rig has loaded (or with ?oldchars) the old
     block soldier is built instead. */
  const KCH = { ready: false, src: null, tex: {}, mat: {}, dead: {}, kit: {} };
  const kTex = (k) => {
    if (KCH.tex[k]) return KCH.tex[k];
    const t = new T.TextureLoader().load("models/characters/skins/" + k + ".png?v=42");
    t.flipY = false; t.encoding = T.sRGBEncoding; t.magFilter = T.NearestFilter;
    t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4;
    return (KCH.tex[k] = t);
  };
  const kMat = (k, dead) => {
    const C = dead ? KCH.dead : KCH.mat, key = k + (dead ? "-dead" : "");
    return C[k] || (C[k] = new T.MeshStandardMaterial({ map: kTex(key), roughness: 0.9, metalness: 0 }));
  };
  /* (v32) the rig's own animations, sampled by hand: each clip's rotation
     tracks become interpolants, and a pose is written straight onto the
     joints after the old controller has set them — a whole clip, or only the
     legs or the upper body, blended in by weight. The root's tracks are left
     out (the controller moves and tips the body itself). */
  KCH.A = {};
  window.__KCH = KCH;
  function kPrep(clips) {
    clips.forEach((cl) => {
      const A = { dur: cl.duration || 0.2, q: {} };
      cl.tracks.forEach((tr) => {
        const i = tr.name.lastIndexOf(".");
        const node = tr.name.slice(0, i), prop = tr.name.slice(i + 1);
        if (prop !== "quaternion" || node === "root") return;
        A.q[node] = tr.createInterpolant();
      });
      KCH.A[cl.name] = A;
    });
  }
  const K_LEGS = { "leg-left": 1, "leg-right": 1 };
  const K_ARMS = { "arm-left": 1, "arm-right": 1 };
  const K_UPPER = { "arm-left": 1, "arm-right": 1, torso: 1, head: 1 };
  const K_TOP = { torso: 1, head: 1 };
  const K_BODY = { "arm-left": 1, "arm-right": 1, torso: 1, head: 1, "leg-left": 1, "leg-right": 1 };
  const _kq = new T.Quaternion(), _kv = new T.Vector3();
  function kApply(u, name, t01, parts, w) {
    const A = KCH.A[name];
    if (!A || !u.kN || w <= 0.001) return;
    const tt = (((t01 % 1) + 1) % 1) * A.dur;
    for (const nn in A.q) {
      if (parts && !parts[nn]) continue;
      const node = u.kN[nn];
      if (!node) continue;
      _kq.fromArray(A.q[nn].evaluate(tt));
      if (w >= 0.999) node.quaternion.copy(_kq); else node.quaternion.slerp(_kq, w);
    }
  }
  /* (v34) a civilian with both hands up — "don't shoot": arms high and a
     little apart, shaking, palms toward the guns */
  function kHandsUp(u, t, shake) {
    if (!u.armL || !u.armR) return;
    const w = Math.sin(t * 7.3) * 0.07 * (shake || 1), w2 = Math.sin(t * 6.1 + 1.3) * 0.07 * (shake || 1);
    u.armL.rotation.set(-2.85 + w, 0, -0.45);
    u.armR.rotation.set(-2.85 + w2, 0, 0.45);
    if (u.headG) u.headG.rotation.set(0.12, Math.sin(t * 0.9) * 0.12, 0);
  }
  /* the rifle rides in the trigger hand, barrel along his facing, pitched */
  function kRifle(p, pitch, roll) {
    const u = p.mesh.userData;
    if (!u.rifle || !u.kN || !u.body) return;
    p.mesh.updateMatrixWorld(true);
    _kv.set(-0.2, -0.92, 0.06);
    u.kN["arm-right"].localToWorld(_kv);
    u.body.worldToLocal(_kv);
    const s = u.rifle.scale.x;
    u.rifle.position.set(_kv.x + 0.02 * s, _kv.y + 0.13 * s, _kv.z + 0.12 * s);
    u.rifle.rotation.set(pitch || 0, Math.PI, roll || 0);
  }
  window.__kPose = { pose: (...a) => posePost(...a), hands: (...a) => kHandsUp(...a), kApply: (...a) => kApply(...a), kRifle: (...a) => kRifle(...a), K_BODY, K_ARMS, K_UPPER, K_LEGS, K_TOP };
  const kKit = (hex, r) => KCH.kit[hex] || (KCH.kit[hex] = new T.MeshStandardMaterial({ color: new T.Color(hex).convertSRGBToLinear(), roughness: r == null ? 0.82 : r, metalness: 0.05 }));
  (function loadKCH() {
    if (/[?&]oldchars/.test(location.search)) return;
    try {
      if (!T.GLTFLoader) return;
      new T.GLTFLoader().load("models/characters/character.glb", (g) => { try { kPrep(g.animations || []); } catch (e) { window.__kAnimErr = String(e); } KCH.src = g.scene; KCH.ready = true; }, undefined, () => {});
      ["nk", "nkt", "rok", "civ1", "civ2", "civ3", "civ4", "nko"].forEach((k) => { kMat(k); kMat(k, true); });
    } catch (e) {}
  })();
  /* a Kalashnikov-pattern rifle in blocks: wood stock and handguard, curved
     magazine. Built like makeRifle (barrel down -z, muzzle at the tip). */
  function makeAK() {
    makeSol();
    const g = new T.Group();
    const d = (w, h, dd, x, y, z, m, rx) => { const b = new T.Mesh(new T.BoxGeometry(w, h, dd), m); b.position.set(x, y, z); if (rx) b.rotation.x = rx; g.add(b); return b; };
    const wood = kKit("#7a4a2a", 0.7), steel = kKit("#2b2a28", 0.5);
    d(0.08, 0.10, 0.42, 0, 0, 0.0, steel);                 // receiver
    d(0.075, 0.03, 0.40, 0, 0.06, 0.0, steel);             // dust cover
    d(0.08, 0.085, 0.22, 0, -0.005, -0.32, wood);          // handguard
    d(0.03, 0.03, 0.30, 0, 0.025, -0.55, steel);           // barrel
    d(0.03, 0.03, 0.22, 0, 0.065, -0.36, steel);           // gas tube
    d(0.04, 0.07, 0.03, 0, 0.07, -0.63, steel);            // front sight
    d(0.065, 0.10, 0.08, 0, -0.12, 0.10, wood);            // grip
    d(0.07, 0.12, 0.09, 0, -0.10, -0.08, steel, -0.25);    // magazine, curved in two
    d(0.07, 0.11, 0.09, 0, -0.20, -0.12, steel, -0.6);
    d(0.075, 0.12, 0.30, 0, -0.035, 0.36, wood);           // stock
    const muzzle = new T.Object3D(); muzzle.position.set(0, 0.025, -0.72); g.add(muzzle); g.userData.muzzle = muzzle;
    return g;
  }
  /* (v27) a portrait of the player's soldier for the menu, the depot and the
     result card: one small offscreen renderer, one picture per uniform */
  window.MGAvatar = (function () {
    let R = null, S = null, C = null;
    const cache = {};
    return {
      ready: () => KCH.ready,
      snap(uni, pose) {
        const key = uni + "|" + (pose || "");
        if (cache[key]) return cache[key];
        if (!KCH.ready) return null;
        const tx = kTex(uni);
        if (!tx.image || !tx.image.complete || !tx.image.naturalWidth) return null;
        try {
          if (!R) {
            const cv = document.createElement("canvas"); cv.width = 240; cv.height = 300;
            R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
            R.outputEncoding = T.sRGBEncoding; R.setClearColor(0x000000, 0);
            S = new T.Scene();
            S.add(new T.HemisphereLight(0xe8eeff, 0x5a4a3a, 0.9));
            const d = new T.DirectionalLight(0xfff0dc, 1.2); d.position.set(2, 4, 5); S.add(d);
            C = new T.PerspectiveCamera(24, 240 / 300, 0.1, 50);
          }
          const g = kenneyPerson("ally", { uni: uni });
          if (!g) return null;
          g.rotation.y = -0.35;
          if (pose === "cheer") { g.userData.armL.rotation.set(-2.9, 0, -0.2); g.userData.armR.rotation.set(-0.5, 0, 0.3); if (g.userData.rifle) g.userData.rifle.visible = false; }
          S.add(g);
          C.position.set(0, 1.12, 4.9); C.lookAt(0, 0.93, 0);
          R.render(S, C);
          S.remove(g);
          cache[key] = R.domElement.toDataURL("image/png");
          return cache[key];
        } catch (e) { window.__avatarErr = String(e); return null; }
      }
    };
  })();
  const K_H = { weak: 2.3, throw: 2.3, para: 2.3, tough: 2.74, hostage: 2.27, ally: 1.88, boss: 2.85 };
  /* the player's own uniforms (bought in the depot) and their helmets */
  const UNI_HELM = { "u-army": "#4f5538", "u-marine": "#5a5038", "u-sf": "#1e1f1f", "u-desert": "#a8916a", "u-snow": "#dfe3e5", "u-reserve": "#4e5a34", "u-guard": "#eeebe2" };
  function kenneyPerson(role, opt) {
    if (!KCH.ready) return null;
    makeSol();
    const civ = role === "hostage", tough = role === "tough", ally = role === "ally", boss = role === "boss";
    const uni = opt && opt.uni;
    const skin = uni || (ally ? "rok" : civ ? "civ" + (1 + ((Math.random() * 4) | 0)) : boss ? "nko" : tough ? "nkt" : "nk");
    const g = new T.Group(), body = new T.Group();
    g.add(body);
    const K = KCH.src.clone(true);
    body.add(K);
    const mat = kMat(skin), meshes = [];
    K.traverse((o) => { if (o.isMesh) { o.material = mat; o.castShadow = true; o.receiveShadow = true; meshes.push(o); } });
    const nd = (n) => K.getObjectByName(n);
    const head = nd("head"), torso = nd("torso");
    /* the old controller's "L" limbs hang on the -x side */
    const armL = nd("arm-right"), armR = nd("arm-left"), legL = nd("leg-right"), legR = nd("leg-left");
    const shinL = new T.Group(), shinR = new T.Group();
    shinL.position.y = -0.5; shinR.position.y = -0.5; legL.add(shinL); legR.add(shinR);
    /* head gear, in the head's own units (the head block is 8 wide) */
    const B = (par, w, h, d, x, y, z, m) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); par.add(b); return b; };
    if (skin === "rok" || uni) {
      const hm = kKit(UNI_HELM[skin] || "#4f5538"), dk = kKit(skin === "u-guard" ? "#c9a84a" : "#2c2c26");
      B(head, 9.6, 3.4, 9.8, 0, 9.5, 0, hm); B(head, 8.6, 1.0, 8.8, 0, 11.6, 0, hm); B(head, 10.0, 0.6, 10.2, 0, 7.9, 0, uni ? hm : kKit("#454a31"));
      B(head, 0.5, 1.2, 6.0, 4.95, 9.0, 0, dk); B(head, 0.5, 1.2, 6.0, -4.95, 9.0, 0, dk); B(head, 1.8, 1.4, 0.9, 0, 10.2, 5.0, dk);
      B(head, 0.3, 3.0, 0.3, 4.6, 6.8, 1.6, kKit("#202020")); B(head, 0.3, 3.0, 0.3, -4.6, 6.8, 1.6, kKit("#202020"));
      if (skin !== "u-guard") {
        const vc = { "u-marine": ["#5a5038", "#463e2a"], "u-sf": ["#1f2020", "#151616"], "u-desert": ["#a8916a", "#8a7656"], "u-snow": ["#d8dcde", "#b8bec2"], "u-reserve": ["#4e5a34", "#3e4828"] }[skin] || ["#4c5236", "#3d422b"];
        const vest = kKit(vc[0]), pch = kKit(vc[1]);
        B(torso, 0.86, 0.5, 0.09, 0, 0.88, 0.33, vest); B(torso, 0.86, 0.5, 0.09, 0, 0.88, -0.33, vest);
        for (let k = 0; k < 3; k++) B(torso, 0.2, 0.2, 0.12, -0.24 + k * 0.24, 0.66, 0.42, pch);
      }
    } else if (boss) {
      /* an officer: peaked cap with a red band, gold badge and a black visor */
      const cap = new T.Group(); head.add(cap); g.userData.kCap = cap;
      B(cap, 10.4, 2.2, 10.8, 0, 9.5, -0.2, kKit("#4a4a2e")); B(cap, 9.4, 1.3, 9.6, 0, 8.2, 0, kKit("#a8231c"));
      B(cap, 9.4, 0.4, 3.4, 0, 7.6, 5.4, kKit("#111111", 0.3)); B(cap, 2.2, 1.6, 0.4, 0, 9.6, 5.5, kKit("#e0b440", 0.35));
      B(torso, 0.18, 0.24, 0.14, 0.36, 0.42, 0.2, kKit("#3a2416"));   // holster
    } else if (!civ) {
      const hm = kKit(tough ? "#3f4429" : "#4b5232");
      B(head, 9.2, 3.8, 9.4, 0, 9.7, 0, hm); B(head, 8.0, 1.0, 8.2, 0, 12.0, 0, hm); B(head, 9.8, 0.5, 10.0, 0, 7.7, 0, kKit(tough ? "#363a24" : "#434929"));
      B(head, 0.3, 3.2, 0.3, 4.5, 6.6, 1.0, kKit("#5a3e24")); B(head, 0.3, 3.2, 0.3, -4.5, 6.6, 1.0, kKit("#5a3e24"));
      const pch = kKit("#5a4a2c");
      B(torso, 0.16, 0.42, 0.12, -0.28, 0.8, 0.34, pch); B(torso, 0.16, 0.42, 0.12, 0.28, 0.8, 0.34, pch);
      if (role === "throw") B(torso, 0.5, 0.56, 0.24, 0, 0.78, -0.42, kKit("#4a4a30"));
    }
    /* fit the old height, so hit boxes, cover and aim lines stay true */
    g.updateMatrixWorld(true);
    const bb = new T.Box3().setFromObject(g), h0 = bb.max.y - bb.min.y;
    K.scale.setScalar((K_H[role] || 2.3) / h0);
    K.position.y = -bb.min.y * ((K_H[role] || 2.3) / h0);
    if (civ) {
      armL.rotation.z = -0.25; armR.rotation.z = 0.25;
    } else {
      const rifle = skin === "rok" || uni ? makeRifle() : makeAK();
      const H = K_H[role] || 2.3, hs = H / 2.3;
      rifle.scale.setScalar(1.28 * hs);
      rifle.position.set(-0.03 * hs, 0.55 * H, 0.38 * hs);
      rifle.rotation.set(0.12, Math.PI, -0.32);
      body.add(rifle);
      g.userData.rifle = rifle;
      g.userData.muzzle = rifle.userData.muzzle;
      armL.rotation.set(-1.05, 0, -0.32);
      armR.rotation.set(-0.85, 0, 0.12);
    }
    if (role === "throw") {
      const nade = new T.Group();
      B(nade, 0.1, 0.13, 0.1, 0, 0, 0, SOL.oliveDark);
      B(nade, 0.05, 0.05, 0.1, 0, 0.075, 0, SOL.steel);
      nade.position.set(0.3, 0.62, 0.14);
      body.add(nade);
      g.userData.nade = nade;
    }
    g.userData.body = body;
    g.userData.headG = head;
    g.userData.armL = armL;
    g.userData.armR = armR;
    g.userData.legL = legL;
    g.userData.legR = legR;
    g.userData.shinL = shinL;
    g.userData.shinR = shinR;
    g.userData.role = role;
    g.userData.kSkin = skin;
    g.userData.kMeshes = meshes;
    g.userData.kenney = true;
    g.userData.kHead = head;
    g.userData.kTorso = torso;
    g.userData.kS = K.scale.x;
    g.userData.kN = { "arm-left": armR, "arm-right": armL, "leg-left": legR, "leg-right": legL, torso: torso, head: head };
    if (ally) { g.userData.phase = 0; g.userData.aimK = 0; }
    else if (!civ) enemyRim(g);
    return g;
  }

  function makeSoldier(role) {
    { const kp = kenneyPerson(role); if (kp) return kp; }
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
    g.userData.head = head;
    g.userData.faceKey = faceKey;
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
    if (!civ) enemyRim(g);
    return g;
  }

  /* enemy read: every hostile body part gets a warm fresnel edge so a man in
     camo still separates from sandbags, stone and the far city. One shared set
     of uniforms (no extra draw calls); hostages and the ally keep the plain
     materials, so the colour itself says who not to shoot. */
  const RIM = { col: { value: new T.Color(0xff6a2e) }, k: { value: 0.5 }, pw: { value: 2.8 } };
  const rimCache = new Map();
  function rimMat(m) {
    if (!m || !m.isMeshStandardMaterial) return m;
    let r = rimCache.get(m);
    if (r) return r;
    r = m.clone();
    r.onBeforeCompile = (sh) => {
      sh.uniforms.uRimCol = RIM.col;
      sh.uniforms.uRimK = RIM.k;
      sh.uniforms.uRimPw = RIM.pw;
      sh.fragmentShader = "uniform vec3 uRimCol;uniform float uRimK;uniform float uRimPw;\n" + sh.fragmentShader.replace(
        "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
        "float rimF = pow( 1.0 - clamp( dot( normalize( normal ), normalize( vViewPosition ) ), 0.0, 1.0 ), uRimPw );\n" +
        "outgoingLight += uRimCol * rimF * uRimK;\n" +
        "gl_FragColor = vec4( outgoingLight, diffuseColor.a );");
    };
    r.customProgramCacheKey = () => "enemyRim";
    rimCache.set(m, r);
    return r;
  }
  function enemyRim(g) {
    g.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
      o.material = rimMat(o.material);
    });
  }
  window.__rim = RIM;
  function makePickup(kind) {
    makeSol();
    const g = new T.Group();
    if (kind === "life") {
      part(g, 0.58, 0.42, 0.42, 0, 0, 0, SOL.white);
      part(g, 0.1, 0.3, 0.02, 0, 0, 0.22, SOL.red);
      part(g, 0.3, 0.1, 0.02, 0, 0, 0.22, SOL.red);
      part(g, 0.12, 0.05, 0.1, 0, 0.235, 0, SOL.belt);
      part(g, 0.6, 0.04, 0.44, 0, -0.22, 0, SOL.stoneDark);
    } else if (kind === "smg" || kind === "shotgun" || kind === "grenade") {
      /* a weapon crate: olive case with a yellow stencil band and the gun (or
         two grenades) strapped on top */
      part(g, 0.66, 0.34, 0.42, 0, 0, 0, SOL.oliveDark);
      part(g, 0.68, 0.06, 0.44, 0, 0.12, 0, SOL.gold);
      if (kind === "grenade") {
        part(g, 0.16, 0.22, 0.16, -0.12, 0.3, 0, SOL.olive);
        part(g, 0.16, 0.22, 0.16, 0.12, 0.3, 0, SOL.olive);
        part(g, 0.06, 0.06, 0.06, -0.12, 0.44, 0, SOL.steel);
        part(g, 0.06, 0.06, 0.06, 0.12, 0.44, 0, SOL.steel);
      } else {
        const L = kind === "shotgun" ? 0.78 : 0.56;
        part(g, L, 0.08, 0.08, 0, 0.24, 0, SOL.gunmetal || SOL.steel);
        part(g, 0.08, 0.16, 0.06, kind === "shotgun" ? 0.22 : 0.1, 0.14, 0, kind === "shotgun" ? SOL.wood : SOL.gunmetal || SOL.steel);
        if (kind === "smg") part(g, 0.06, 0.2, 0.05, -0.04, 0.12, 0, SOL.gunmetal || SOL.steel);
      }
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
    { const kp = kenneyPerson("ally"); if (kp) return kp; }
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
    if (!SOL[key]) SOL[key] = new T.MeshStandardMaterial({ map: signTex(key, s[0], s[1], s[2], s[3]), roughness: 0.42, metalness: 0.08, envMapIntensity: 0.2 });
    return SOL[key];
  }

  /* shop band + signage + awning on one face of a block. (ax, az) is the
     outward normal of that face in metres. */
  /* ---- breakable dressing: shop windows and shop signs ----
     A round that reaches a pane before anything else shatters it (glass
     shards, a tinkle, +50); a sign is torn off its fixings and falls to the
     pavement (+100). Counted on the result card as 파괴. */
  let breakables = [];
  const fallers = [];
  let brokenN = 0, brokenPts = 0;
  let SHOPIN = null;
  function shopInsideMat() {
    if (SHOPIN) return SHOPIN;
    const t = ctex("shopInside", 128, 64, (g, w, h) => {
      g.fillStyle = "#2a2622"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#4a4038"; for (let y = 14; y < h; y += 16) g.fillRect(0, y, w, 3);
      const cols = ["#b84a3a", "#e0c060", "#4a7ab8", "#e8e2d4", "#6aa060", "#c87a3a"];
      for (let i = 0; i < 90; i++) { g.fillStyle = cols[i % cols.length]; const y = 4 + ((i * 7) % 4) * 16; g.fillRect((i * 13) % w, y, 4, 9); }
      g.fillStyle = "rgba(255,230,170,.35)"; g.fillRect(0, 0, w, 3);
    });
    t.wrapS = t.wrapT = T.RepeatWrapping;
    SHOPIN = new T.MeshBasicMaterial({ map: t, color: 0xb0a090, polygonOffset: true, polygonOffsetFactor: 3, polygonOffsetUnits: 3 });
    return SHOPIN;
  }
  function breakIt(ctx, b, at) {
    if (!b || b.broken) return;
    b.broken = true;
    brokenN++; brokenPts += b.pts;
    addPts(ctx, b.pts);
    const sp = screenOf(at, ctx.camera);
    hitMark("pickup", sp.x, sp.y, false, (b.kind === "glass" ? "GLASS +" : "SIGN +") + b.pts);
    if (b.kind === "glass") {
      b.mesh.visible = false;
      voxBreak(ctx.scene, at.x, at.y - 0.6, at.z, [0xd8eef8, 0xa9cfe2, 0xffffff, 0x7fa9c0], 18, 0.7);
      gun("glass");
    } else {
      /* tear the sign off into world space and let it fall */
      const m = b.mesh;
      m.updateMatrixWorld(true);
      const wp = new T.Vector3(), wq = new T.Quaternion(), ws = new T.Vector3();
      m.matrixWorld.decompose(wp, wq, ws);
      m.parent && m.parent.remove(m);
      m.position.copy(wp); m.quaternion.copy(wq); m.scale.copy(ws);
      m.material = m.material.clone();
      m.material.side = T.DoubleSide;
      ctx.scene.add(m);
      const n = new T.Vector3(0, 0, 1).applyQuaternion(wq);
      m.userData.v = new T.Vector3(n.x * 1.2, 0.6, n.z * 1.2);
      m.userData.w = new T.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 5);
      m.userData.life = 6;
      fallers.push(m);
      impactBurst(ctx.scene, at, "concrete");
      gun("clank");
    }
    window.__broken = { n: brokenN, pts: brokenPts };
  }
  function stepFallers(dt) {
    for (let i = fallers.length - 1; i >= 0; i--) {
      const m = fallers[i], u = m.userData;
      u.life -= dt;
      if (m.position.y > 0.36) {
        u.v.y -= 9.8 * dt;
        m.position.addScaledVector(u.v, dt);
        m.rotation.x += u.w.x * dt; m.rotation.y += u.w.y * dt; m.rotation.z += u.w.z * dt;
        if (m.position.y <= 0.36) { m.position.y = 0.36; m.rotation.set(-Math.PI / 2, 0, Math.random() * 3); }
      }
      if (u.life <= 0) { m.parent && m.parent.remove(m); fallers.splice(i, 1); }
    }
  }

  function streetFront(S, opt) {
    const o = opt || {};
    const len = o.len, k = o.k || 0;
    /* (v14) `o.az || 1` turned an explicit 0 into 1, so every shop front on an
       east or west face stood at 45° and cut through its own building and the
       street. Only a missing value defaults now. */
    const ax = o.ax != null ? o.ax : 0, az = o.az != null ? o.az : 1;
    const x = o.x, y = o.y, z = o.z;
    const rotY = Math.atan2(ax, az);
    const g = new T.Group();
    /* glazed shopfront */
    /* the shop window is a row of separate panes (each one can be shot out)
       in front of a dim shop interior that shows through the broken ones */
    const inside = new T.Mesh(new T.PlaneGeometry(len, 3.0), shopInsideMat());
    inside.position.set(0, 1.5, -0.018);
    g.add(inside);
    const doorX = len * 0.22;
    const nP = Math.max(2, Math.round(len / 2.3));
    const pw = len / nP;
    for (let i = 0; i < nP; i++) {
      const px = -len / 2 + pw * (i + 0.5);
      if (Math.abs(px - doorX) < pw * 0.5 + 0.7) continue; /* the door has its own glass */
      const pane = new T.Mesh(new T.PlaneGeometry(pw - 0.06, 2.95), repMat(SOL.shopGlass, pw / 4, 1));
      pane.position.set(px, 1.5, 0.03);
      g.add(pane);
      breakables.push({ mesh: pane, kind: "glass", pts: 50, broken: false });
      const mull = new T.Mesh(new T.BoxGeometry(0.07, 3.0, 0.06), SOL.metalDark);
      mull.position.set(-len / 2 + pw * i, 1.5, 0.05);
      g.add(mull);
    }
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
      breakables.push({ mesh: sm, kind: "sign", pts: 100, broken: false });
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
    breakables.push({ mesh: vsign, kind: "sign", pts: 100, broken: false });
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    S.add(g);
    return g;
  }

  /* one city block. Faces: the `side` face carries the shop band. */
  /* (v19) one instanced batch for all the small relief on the buildings,
     filled while a stage dresses and flushed once at the end of it */
  const DET = { b: null, mat: null };
  function detailBatch() {
    if (!DET.mat) DET.mat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.02 });
    if (!DET.b) DET.b = voxBatch();
    return DET.b;
  }
  function flushDetail(S) {
    if (!DET.b) return;
    const tgt = DET.S || S;
    if (tgt && DET.b.n) DET.b.flush(tgt, "relief");
    DET.S = null;
    DET.b = null;
  }
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
    /* (v19) the facade in relief: a floor slab ledge, a sill and a lintel
       per window, laid on the bays of the facade texture so the depth lines
       up with the painted glass */
    if (mat === SOL.facA || mat === SOL.facB || mat === SOL.facC) {
      const DB = detailBatch();
      DET.S = S;
      const ra = Math.max(1, Math.round(Math.max(w, d) / 6)), rb = Math.max(1, Math.round(h / 6.4));
      const fh = h / (rb * 2);
      const tone = mat === SOL.facC ? [0x9aa2aa, 0x7c848c] : mat === SOL.facB ? [0xe2dccd, 0xc4bcaa] : [0xdde2e8, 0xb8bec6];
      const faces = [
        { n: "n", len: w, fx: (u) => x0 + u, fz: () => z1, nx: 0, nz: 1, ry: 0 },
        { n: "s", len: w, fx: (u) => x1 - u, fz: () => z0, nx: 0, nz: -1, ry: 0 },
        { n: "e", len: d, fx: () => x1, fz: (u) => z1 - u, nx: 1, nz: 0, ry: Math.PI / 2 },
        { n: "w", len: d, fx: () => x0, fz: (u) => z0 + u, nx: -1, nz: 0, ry: Math.PI / 2 }
      ];
      faces.forEach((F) => {
        const nb = ra * 3, bw = F.len / nb;
        const floorsN = Math.floor(h / fh + 0.01);
        for (let f = 0; f < floorsN; f++) {
          const yb = 0.3 + f * fh;
          if (o.shop === F.n && yb < 4.3) continue;
          /* slab ledge along the whole face at the floor line */
          if (f > 0) {
            const cu = F.len / 2;
            DB.cube(DET.mat, F.fx(cu) + F.nx * 0.07, yb + fh * 0.1, F.fz(cu) + F.nz * 0.07, F.len + 0.1, 0.14, 0.14, tone[1], F.ry);
          }
          for (let bi = 0; bi < nb; bi++) {
            const u = bw * (bi + 0.5);
            const gw = bw * 0.83 + 0.12;
            const ySill = yb + fh * (1 - 0.085 - 0.62) - 0.05;
            const yLin = yb + fh * (1 - 0.085) + 0.05;
            const px = F.fx(u), pz = F.fz(u);
            DB.cube(DET.mat, px + F.nx * 0.11, ySill, pz + F.nz * 0.11, gw + 0.16, 0.09, 0.22, tone[0], F.ry);
            DB.cube(DET.mat, px + F.nx * 0.05, yLin, pz + F.nz * 0.05, gw + 0.04, 0.12, 0.1, tone[1], F.ry);
          }
        }
        /* a cornice under the parapet */
        const cu = F.len / 2;
        DB.cube(DET.mat, F.fx(cu) + F.nx * 0.12, 0.3 + h - 0.12, F.fz(cu) + F.nz * 0.12, F.len + 0.24, 0.24, 0.24, tone[0], F.ry);
      });
    }
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
    const a = new T.Mesh(new T.PlaneGeometry(2.2, 1.1), new T.MeshStandardMaterial({ map: roadSignTex("signSeoul", "서울역", "Seoul Station", "up"), roughness: 0.4, metalness: 0.12 }));
    a.position.set(-0.95, 4.75, 0.02);
    g.add(a);
    const b = new T.Mesh(new T.PlaneGeometry(2.2, 1.1), new T.MeshStandardMaterial({ map: roadSignTex("signNamsan", "남산", "Namsan", "right"), roughness: 0.4, metalness: 0.12 }));
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
    /* (v16) the passage is a real way through now: no back wall */
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
    /* one hipped roof of grey tile, sitting ON the dancheong beams (the old
       two-roof stack cut through the columns and the tilted frustum faces
       stuck out of each other): rafter soffit, a wide eave with stepped,
       upturned corners, tile courses stepping in to a ridge with end caps */
    const tile = new T.MeshStandardMaterial({ map: SOL.roofTile.map, color: 0x6c727a, roughness: 0.8, metalness: 0.05 });
    const ridgeM = SOL.roofRidge || tile;
    const RB = (w, h, d, x, y, z, m) => { const r = new T.Mesh(new T.BoxGeometry(w, h, d), m); r.position.set(cx + x, y, cz + z); r.castShadow = true; r.receiveShadow = true; S.add(r); return r; };
    const ey = py + 3.35 + 0.72 + 0.12;
    const RW = PW + 3.4, RD = PD + 3.0;
    RB(RW * 0.97, 0.22, RD * 0.97, 0, ey - 0.12, 0, SOL.rafter || tile);
    RB(RW, 0.3, RD, 0, ey + 0.1, 0, tile);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
      RB(1.5, 0.3, 1.5, a * (RW / 2 - 0.6), ey + 0.38, b * (RD / 2 - 0.6), tile);
      RB(0.7, 0.3, 0.7, a * (RW / 2 - 0.25), ey + 0.66, b * (RD / 2 - 0.25), tile);
    });
    const tiers = 4;
    for (let t = 1; t <= tiers; t++) {
      const k = t / (tiers + 1);
      RB(RW * (1 - k * 0.5) - 0.6, 0.42, RD * (1 - k * 0.88), 0, ey + 0.1 + t * 0.42, 0, tile);
    }
    const ry = ey + 0.1 + (tiers + 0.7) * 0.42;
    RB(RW * 0.46, 0.34, 0.5, 0, ry, 0, ridgeM);
    [-1, 1].forEach((sx) => RB(0.42, 0.85, 0.58, sx * RW * 0.23, ry + 0.25, 0, ridgeM));
    /* a hanging signboard under the eave, on the face toward the player */
    const plate = new T.Mesh(new T.PlaneGeometry(1.5, 0.49), SOL.gateSign);
    plate.position.set(cx, py + 2.75, cz - PD / 2 - 0.25);
    plate.rotation.y = Math.PI;
    S.add(plate);
    /* flags on short poles at the front corners of the stone base, clear of the roof */
    const f1 = makeFlagPlane(S, "kr", cx - W * 0.4, py + 1.4, cz - D / 2 - 0.4, 1.9, 1.3, Math.PI);
    const f2 = makeFlagPlane(S, "kr", cx + W * 0.4, py + 1.4, cz - D / 2 - 0.4, 1.9, 1.3, Math.PI);
    g.userData.flags = [f1, f2];
    return [f1, f2];
  }

  /* the far silhouette down the boulevard: Sungnyemun on its stone base */
  /* Sungnyemun: a granite platform pierced by a round-topped arch, a
     two-storey timber pavilion with red columns and dancheong bands, and two
     hipped roofs of grey tile whose eaves sweep up at the corners (stepped,
     block-style). Faces the player down the boulevard. */
  function makeSungnyemunFar(S, cx, cz, s) {
    makeSol();
    const g = new T.Group();
    const W = 30 * s, D = 11 * s, BASE = 8.6 * s, OPEN = 5.2 * s;
    const stone = repMat(SOL.gateStone, W / 5, BASE / 5);
    const dark = new T.MeshBasicMaterial({ color: 0x14110e });
    const tileM = new T.MeshStandardMaterial({ map: SOL.roofTile.map, color: 0x6a7078, roughness: 0.8, metalness: 0.05 });
    const red = SOL.woodRed;
    const dan = new T.MeshStandardMaterial({ color: 0x2f7d6b, roughness: 0.7 });
    const lattice = new T.MeshStandardMaterial({ map: ctex("snmLattice", 64, 64, (gg, w, h) => {
      gg.fillStyle = "#3a2a1c"; gg.fillRect(0, 0, w, h);
      gg.fillStyle = "#c9b48a"; for (let i = 4; i < w; i += 10) { gg.fillRect(i, 0, 3, h); gg.fillRect(0, i, w, 3); }
    }), roughness: 0.85 });
    const B = (w, h, d, x, y, z, m) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
    /* platform with a battered (stepped) foot and the arch */
    B(W + 1.2 * s, 1.0 * s, D + 1.2 * s, 0, 0.5 * s, 0, stone);
    const side = (W - OPEN) / 2;
    B(side, BASE, D, -(OPEN / 2 + side / 2), BASE / 2, 0, stone);
    B(side, BASE, D, (OPEN / 2 + side / 2), BASE / 2, 0, stone);
    B(OPEN, BASE * 0.34, D, 0, BASE * 0.83, 0, stone);
    /* arch: a dark tunnel, its round head stepped in blocks */
    B(OPEN, BASE * 0.66, D * 0.98, 0, BASE * 0.33, 0, dark);
    for (let k = 0; k < 2; k++) {
      const ww = OPEN * (1 - (k + 1) * 0.22);
      B(ww, BASE * 0.06, D * 0.98, 0, BASE * (0.66 + k * 0.06) + BASE * 0.03, 0, dark);
    }
    B(W, 0.35 * s, D, 0, BASE + 0.17 * s, 0, SOL.stoneDark || stone);
    /* parapet crenels */
    for (let x = -W / 2 + 0.8 * s; x < W / 2; x += 2.2 * s) {
      B(1.2 * s, 0.9 * s, 0.6 * s, x, BASE + 0.8 * s, D / 2 - 0.3 * s, stone);
      B(1.2 * s, 0.9 * s, 0.6 * s, x, BASE + 0.8 * s, -D / 2 + 0.3 * s, stone);
    }
    /* storey 1 */
    const y1 = BASE + 0.35 * s;
    const pw = W * 0.66, pd = D * 0.66, ph = 3.2 * s;
    B(pw, 0.3 * s, pd, 0, y1 + 0.15 * s, 0, SOL.stoneDark || stone);
    for (let i = 0; i <= 5; i++) {
      const x = -pw / 2 + 0.3 * s + i * ((pw - 0.6 * s) / 5);
      B(0.5 * s, ph, 0.5 * s, x, y1 + 0.3 * s + ph / 2, pd / 2 - 0.3 * s, red);
      B(0.5 * s, ph, 0.5 * s, x, y1 + 0.3 * s + ph / 2, -pd / 2 + 0.3 * s, red);
    }
    B(pw - 1.2 * s, ph * 0.8, pd - 1.6 * s, 0, y1 + 0.3 * s + ph * 0.42, 0, lattice);
    B(pw + 0.3 * s, 0.6 * s, pd + 0.3 * s, 0, y1 + ph + 0.05 * s, 0, dan);
    const roof = (y, rw, rd, tiers) => {
      /* eave plate with upturned corners, then stepped tile courses to a ridge */
      B(rw, 0.35 * s, rd, 0, y, 0, tileM);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
        B(1.6 * s, 0.35 * s, 1.6 * s, a * (rw / 2 - 0.5 * s), y + 0.45 * s, b * (rd / 2 - 0.5 * s), tileM);
        B(0.8 * s, 0.35 * s, 0.8 * s, a * (rw / 2 - 0.2 * s), y + 0.8 * s, b * (rd / 2 - 0.2 * s), tileM);
      });
      for (let t = 1; t <= tiers; t++) {
        const k = t / (tiers + 1);
        B(rw * (1 - k * 0.55) - 0.6 * s, 0.5 * s, rd * (1 - k * 0.85), 0, y + t * 0.5 * s, 0, tileM);
      }
      const ry = y + (tiers + 0.6) * 0.5 * s;
      B(rw * 0.42, 0.45 * s, 0.6 * s, 0, ry, 0, SOL.stoneDark || tileM);
      B(0.5 * s, 1.0 * s, 0.7 * s, rw * 0.21, ry + 0.3 * s, 0, SOL.stoneDark || tileM);
      B(0.5 * s, 1.0 * s, 0.7 * s, -rw * 0.21, ry + 0.3 * s, 0, SOL.stoneDark || tileM);
      return ry;
    };
    const r1 = roof(y1 + ph + 0.5 * s, pw + 4.2 * s, pd + 4.0 * s, 2);
    /* storey 2 */
    const y2 = r1 + 0.2 * s;
    const pw2 = pw * 0.8, pd2 = pd * 0.72, ph2 = 2.6 * s;
    for (let i = 0; i <= 4; i++) {
      const x = -pw2 / 2 + 0.3 * s + i * ((pw2 - 0.6 * s) / 4);
      B(0.45 * s, ph2, 0.45 * s, x, y2 + ph2 / 2, pd2 / 2 - 0.25 * s, red);
      B(0.45 * s, ph2, 0.45 * s, x, y2 + ph2 / 2, -pd2 / 2 + 0.25 * s, red);
    }
    B(pw2 - 1.0 * s, ph2 * 0.85, pd2 - 1.2 * s, 0, y2 + ph2 * 0.45, 0, lattice);
    B(pw2 + 0.3 * s, 0.5 * s, pd2 + 0.3 * s, 0, y2 + ph2, 0, dan);
    roof(y2 + ph2 + 0.45 * s, pw2 + 4.6 * s, pd2 + 4.4 * s, 4);
    /* the name board under the upper eave */
    {
      const sg = new T.Mesh(new T.PlaneGeometry(1.2 * s, 2.0 * s), new T.MeshBasicMaterial({ map: ctex("snmSign", 96, 160, (gg, w, h) => {
        gg.fillStyle = "#1d2b4a"; gg.fillRect(0, 0, w, h);
        gg.strokeStyle = "#d8b04a"; gg.lineWidth = 6; gg.strokeRect(4, 4, w - 8, h - 8);
        gg.fillStyle = "#f0d27a"; gg.font = "900 40px serif"; gg.textAlign = "center"; gg.textBaseline = "middle";
        ["崇", "禮", "門"].forEach((c, i) => gg.fillText(c, w / 2, 32 + i * 48));
      }, { smooth: true }) }));
      sg.position.set(0, r1 - 0.2 * s, pd / 2 + 0.05 * s);
      g.add(sg);
    }
    g.position.set(cx, 0.3, cz);
    g.rotation.y = Math.PI;
    S.add(g);
    return g;
  }

  /* ---- Stage 2 field props (restored: lost in the PR #12 merge) ---- */

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

  /* (v21) the cargo truck, rebuilt: bonneted cab with grille, windscreen
     frame, doors and mirrors, flared fenders, a slatted wooden bed under a
     canvas tilt on hoops, dual rear wheels with rims, tank and spare. */
  let TRK = null;
  function makeTruck(x, z) {
    makeSol();
    if (!TRK) {
      const lin = (c) => new T.Color(c).convertSRGBToLinear();
      TRK = {
        paint: cmat(0x606c42, 0.78, 0.1), paintD: cmat(0x434c2c, 0.82, 0.08),
        canvas: cmat(0x7a7650, 0.95), wood: cmat(0x7a5e3e, 0.9),
        black: new T.MeshStandardMaterial({ color: lin(0x141516), roughness: 0.7 }),
        glass: new T.MeshStandardMaterial({ color: lin(0x22303a), roughness: 0.08, metalness: 0.6 }),
        rim: new T.MeshStandardMaterial({ color: lin(0x4a4f3a), roughness: 0.6, metalness: 0.4 }),
        lamp: new T.MeshBasicMaterial({ color: 0xfff0c8 })
      };
    }
    const M = TRK;
    const g = new T.Group();
    const B = (w, h, d, px, py, pz, m, rz) => { const o = new T.Mesh(worldUV(new T.BoxGeometry(w, h, d)), m); o.position.set(px, py, pz); if (rz) o.rotation.z = rz; o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
    /* chassis rails and bumper */
    B(3.5, 0.16, 0.18, 0.1, 0.62, -0.42, M.black); B(3.5, 0.16, 0.18, 0.1, 0.62, 0.42, M.black);
    B(0.14, 0.2, 1.7, -1.76, 0.66, 0, M.black);
    /* bonnet, grille, lamps */
    B(0.78, 0.46, 1.26, -1.3, 1.0, 0, M.paint);
    B(0.06, 0.4, 0.9, -1.7, 0.98, 0, M.black);
    for (let k = 0; k < 6; k++) B(0.03, 0.36, 0.04, -1.735, 0.98, -0.37 + k * 0.148, M.paintD);
    [-0.56, 0.56].forEach((sz) => { B(0.05, 0.16, 0.16, -1.72, 1.08, sz, M.lamp); B(0.08, 0.2, 0.2, -1.7, 1.08, sz, M.black); });
    /* fenders */
    [-0.74, 0.74].forEach((sz) => { B(0.86, 0.08, 0.34, -1.25, 0.96, sz, M.paintD); B(0.86, 0.08, 0.36, 0.9, 0.98, sz, M.paintD); });
    /* cab */
    B(0.86, 0.86, 1.5, -0.5, 1.34, 0, M.paint);
    B(0.06, 0.4, 1.3, -0.95, 1.52, 0, M.glass, -0.14);
    [-1, 1].forEach((sd) => {
      B(0.5, 0.32, 0.03, -0.5, 1.55, sd * 0.765, M.glass);
      B(0.02, 0.62, 0.03, -0.18, 1.3, sd * 0.765, M.black);
      B(0.12, 0.03, 0.04, -0.62, 1.22, sd * 0.77, M.black);
      B(0.05, 0.22, 0.1, -0.98, 1.6, sd * 0.86, M.black);
      B(0.03, 0.04, 0.16, -0.95, 1.5, sd * 0.8, M.black);
    });
    B(0.92, 0.08, 1.56, -0.5, 1.8, 0, M.paintD);
    /* bed: floor, slatted sides, tailgate, canvas tilt on hoops */
    B(2.2, 0.12, 1.6, 0.85, 0.96, 0, M.wood);
    [-1, 1].forEach((sd) => { for (let k = 0; k < 3; k++) B(2.2, 0.1, 0.05, 0.85, 1.1 + k * 0.16, sd * 0.78, M.wood); });
    for (let k = 0; k < 3; k++) B(0.05, 0.1, 1.6, 1.94, 1.1 + k * 0.16, 0, M.wood);
    const tilt = new T.Mesh(new T.CylinderGeometry(0.8, 0.8, 2.1, 12, 1, false, 0, Math.PI), M.canvas);
    tilt.rotation.z = Math.PI / 2; tilt.rotation.y = Math.PI / 2;
    tilt.rotation.set(0, 0, Math.PI / 2);
    tilt.position.set(0.85, 1.5, 0);
    tilt.scale.set(1, 1, 0.55);
    g.add(tilt);
    B(2.1, 0.5, 0.04, 0.85, 1.55, 0.79, M.canvas); B(2.1, 0.5, 0.04, 0.85, 1.55, -0.79, M.canvas);
    [0, 0.7, 1.4].forEach((dx) => B(0.05, 0.06, 1.62, 0.15 + dx, 1.95, 0, M.paintD));
    /* fuel tank, spare, star */
    const tank = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.6, 10), M.paintD); tank.rotation.z = Math.PI / 2; tank.position.set(0.1, 0.78, 0.66); g.add(tank);
    /* wheels: singles at the front, duals at the back */
    const wheel = (wx, wz) => {
      const w = new T.Mesh(new T.CylinderGeometry(0.38, 0.38, 0.26, 16), SOL.tire); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.38 + 0.0, wz); w.castShadow = true; g.add(w);
      const r = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.28, 10), M.rim); r.rotation.x = Math.PI / 2; r.position.set(wx, 0.38, wz); g.add(r);
      const hb = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 0.3, 8), M.black); hb.rotation.x = Math.PI / 2; hb.position.set(wx, 0.38, wz); g.add(hb);
    };
    [-0.76, 0.76].forEach((wz) => { wheel(-1.25, wz); wheel(0.55, wz); wheel(1.3, wz); wheel(0.55, wz * 1.28); wheel(1.3, wz * 1.28); });
    const star = new T.Mesh(new T.PlaneGeometry(0.34, 0.34), SOL.star || M.lamp);
    star.position.set(-0.5, 1.3, 0.77); g.add(star);
    const star2 = star.clone(); star2.position.z = -0.77; star2.rotation.y = Math.PI; g.add(star2);
    g.position.set(x, 0.3, z);
    g.rotation.y = -0.08;
    return g;
  }

  /* ================= TIME OF DAY / WEATHER =================
     A stage picks a mood: "day" (clear morning, Stage 1), "dusk" (low
     orange sun in front of the player, violet sky, warm haze; Stage 2) or
     "snow" (overcast white-out with snowfall; ready for a winter stage).
     ?mood=day|dusk|snow in the URL overrides it for previewing. Weather is a
     single Points cloud that follows the camera, so it costs one draw call. */
  const MOODS = {
    overcast: {
      sky: ["#6e7a88", "#8a96a2", "#a4aeb8", "#bcc4cc", "#cdd3d8", "#d8dde0"],
      bg: 0xb8c0c8, fog: 0xbcc4ca, fogNear: 60, fogFar: 300,
      sun: [20, 40, 30], sunDisc: null,
      hemi: [0.7, 0xd4dce4, 0x8a8a80], amb: [0.28, 0xcfd8e0], key: [1.1, 0xe8ecf0], rim: [0.25, 0xc8d0d8], moon: [0.15, 0xb8c4d0],
      exposure: 1.05, cloud: [0xd0d6dc, 0x8a929a, 0.6], wx: null
    },
    morning: {
      sky: ["#4a78b8", "#7aa0cc", "#b8c8dc", "#f0d0c0", "#f8dcc0", "#fff0dc"],
      bg: 0xe8d4c4, fog: 0xead8c8, fogNear: 70, fogFar: 320,
      sun: [30, 10, 80], sunDisc: 0xffe0b0,
      hemi: [0.5, 0xf0dcd0, 0x6a6a58], amb: [0.14, 0xe0c8c0], key: [2.0, 0xffd8b0], rim: [0.6, 0xffc89a], moon: [0.1, 0xa8b0d8],
      exposure: 1.06, cloud: [0xffe0d0, 0xd8a0a0, 0.5], wx: "motes"
    },
    war: {
      sky: ["#2a1a1c", "#4a2420", "#7a3420", "#b8502a", "#d87a3a", "#e8a060"],
      bg: 0x7a4a34, fog: 0x8a5a40, fogNear: 40, fogFar: 260,
      sun: [-20, 8, 70], sunDisc: 0xff8a3a,
      hemi: [0.36, 0xd89070, 0x3a3028], amb: [0.14, 0xc08070], key: [1.7, 0xff9a50], rim: [0.7, 0xff6a30], moon: [0.12, 0x8a7080],
      exposure: 0.98, cloud: [0x5a3a34, 0x2a1c1c, 0.6], wx: "motes"
    },
    dusk: {
      sky: ["#1e2f63", "#4a3f7c", "#a35a7e", "#ef8452", "#ffc073", "#ffe0a8"],
      bg: 0xd98a5c, fog: 0xe39a6c, fogNear: 55, fogFar: 230,
      sun: [-26, 9, 70], sunDisc: 0xffb25a,
      hemi: [0.42, 0xffc9a0, 0x4a5a3a], amb: [0.16, 0xd8a7a0], key: [2.05, 0xffa45c], rim: [0.75, 0xff8a52], moon: [0.18, 0x8a90d8],
      exposure: 1.0, cloud: [0xffc7a6, 0xc0607a, 0.55], wx: "motes"
    },
    snow: {
      sky: ["#8e9aa8", "#aab4bf", "#c4ccd4", "#d8dee4", "#e6eaee", "#eef1f4"],
      bg: 0xd6dce2, fog: 0xdfe4e9, fogNear: 34, fogFar: 240,
      sun: [20, 40, 30], sunDisc: null,
      hemi: [0.8, 0xe6eef6, 0x9aa2a8], amb: [0.34, 0xdbe4ee], key: [0.85, 0xe8eef8], rim: [0.2, 0xd0dcf0], moon: [0.2, 0xc8d4e8],
      exposure: 1.05, cloud: [0xeef1f4, 0xb8c0c8, 0.5], wx: "snow"
    }
  };
  let weather = null;
  function moodOverride() {
    try { const q = new URLSearchParams(location.search).get("mood"); return q && (q === "day" || MOODS[q]) ? q : null; } catch (e) { return null; }
  }
  function applyMood(ctx, S, sky, clouds, name) {
    clearWeather(ctx);
    window.__mood = name;
    if (name === "day" || !MOODS[name]) { window.__mgSun = null; return; }
    const M = MOODS[name];
    const tex = ctex("skyMood-" + name, 256, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h * 0.62);
      M.sky.forEach((c, i) => gr.addColorStop(i / (M.sky.length - 1), c));
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = M.sky[M.sky.length - 1]; g.fillRect(0, h * 0.62, w, h * 0.38);
      /* banded block clouds catching the light */
      const R = rng(57);
      for (let c = 0; c < 10; c++) {
        const cx = R() * w, cy = h * (0.18 + R() * 0.36), ss = 5 + R() * 9;
        g.fillStyle = "rgba(255,210,170,.55)";
        for (let i = 0; i < 5; i++) g.fillRect(cx + (R() - 0.5) * ss * 4, cy + (R() - 0.5) * ss * 0.6, ss * (1.4 + R() * 2), ss * 0.3);
      }
    }, { smooth: true });
    if (sky && sky.material) { sky.material.map = tex; sky.material.needsUpdate = true; }
    ctx.scene.background = new T.Color(M.bg).convertSRGBToLinear();
    ctx.scene.fog = new T.Fog(M.fog, M.fogNear, M.fogFar);
    if (ctx.scene.fog.color.convertSRGBToLinear) ctx.scene.fog.color.convertSRGBToLinear();
    const LT = ctx.LT || {};
    const set = (l, v) => { if (!l || !v) return; l.intensity = v[0]; if (l.color) l.color.setHex(v[1]); if (v[2] != null && l.groundColor) l.groundColor.setHex(v[2]); };
    set(LT.hemi, M.hemi); set(LT.amb, M.amb); set(LT.key, M.key); set(LT.rim, M.rim); set(LT.moon, M.moon);
    if (ctx.renderer) ctx.renderer.toneMappingExposure = M.exposure;
    window.__mgSun = M.sun;
    (clouds || []).forEach((c) => c.traverse((o) => {
      if (o.isMesh && o.material && o.material.emissive) {
        o.material = o.material.clone();
        o.material.color.setHex(M.cloud[0]); o.material.emissive.setHex(M.cloud[1]); o.material.emissiveIntensity = M.cloud[2];
      }
    }));
    if (M.sunDisc) {
      /* a stepped (blocky) sun sitting on the horizon, with a softer halo square */
      const disc = new T.Group();
      const mk = (w, h, col, op) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: col, fog: false, transparent: true, opacity: op, depthWrite: false, toneMapped: false, blending: op < 1 ? T.AdditiveBlending : T.NormalBlending })); m.renderOrder = op < 1 ? -91 : -89; disc.add(m); return m; };
      mk(30, 30, 0xff9a4a, 0.18).position.z = -0.4;
      mk(18, 18, 0xffb866, 0.35).position.z = -0.2;
      mk(12, 9, 0xfff1c8, 1); mk(9, 12, 0xfff1c8, 1);
      disc.position.set(M.sun[0] * 1.6, 52, 175);
      disc.lookAt(0, 4, 20);
      disc.renderOrder = -90;
      disc.userData.noBlock = 1;
      S.add(disc);
    }
    if (M.wx) startWeather(ctx, M.wx);
  }
  function startWeather(ctx, kind) {
    const N = kind === "snow" ? 1600 : 420;
    const BX = 46, BY = 22, BZ = 56;
    const pos = new Float32Array(N * 3);
    const R = rng(kind === "snow" ? 991 : 337);
    for (let i = 0; i < N; i++) { pos[i * 3] = (R() - 0.5) * BX; pos[i * 3 + 1] = R() * BY; pos[i * 3 + 2] = (R() - 0.5) * BZ; }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    const tex = ctex("wx-" + kind, 8, 8, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = kind === "snow" ? "#ffffff" : "#ffe6a8";
      g.fillRect(1, 1, 6, 6);
      g.fillStyle = kind === "snow" ? "rgba(255,255,255,.5)" : "rgba(255,200,120,.5)";
      g.fillRect(0, 2, 8, 4); g.fillRect(2, 0, 4, 8);
    }, { smooth: true });
    tex.magFilter = T.NearestFilter;
    const mat = new T.PointsMaterial({ map: tex, size: kind === "snow" ? 0.09 : 0.06, sizeAttenuation: true, transparent: true, opacity: kind === "snow" ? 0.95 : 0.8, depthWrite: false, fog: true,
      blending: kind === "snow" ? T.NormalBlending : T.AdditiveBlending });
    const pts = new T.Points(geo, mat);
    pts.frustumCulled = false;
    pts.userData.noBlock = 1;
    pts.renderOrder = 5;
    ctx.scene.add(pts);
    const seeds = new Float32Array(N);
    for (let i = 0; i < N; i++) seeds[i] = R() * 6.28;
    weather = { kind, pts, BX, BY, BZ, N, seeds, t: 0 };
    window.__weather = kind;
  }
  function clearWeather(ctx) {
    if (!weather) return;
    weather.pts.parent && weather.pts.parent.remove(weather.pts);
    weather.pts.geometry.dispose();
    weather.pts.material.dispose();
    weather = null;
    window.__weather = null;
  }
  function stepWeather(ctx, dt) {
    if (!weather) return;
    const W = weather, cam = ctx.camera.position;
    W.t += dt;
    const a = W.pts.geometry.attributes.position, p = a.array;
    const fall = W.kind === "snow" ? 1.3 : 0.12;
    const sway = W.kind === "snow" ? 0.45 : 0.25;
    for (let i = 0; i < W.N; i++) {
      const j = i * 3, sd = W.seeds[i];
      p[j] += Math.sin(W.t * 0.7 + sd) * sway * dt;
      p[j + 1] -= fall * dt * (0.7 + (sd % 1) * 0.6);
      if (W.kind !== "snow") p[j + 1] += Math.sin(W.t * 0.5 + sd * 2) * 0.1 * dt;
      p[j + 2] += Math.cos(W.t * 0.6 + sd) * sway * 0.6 * dt;
      if (p[j + 1] < 0.3) p[j + 1] += W.BY;
      if (p[j + 1] > W.BY) p[j + 1] -= W.BY;
    }
    a.needsUpdate = true;
    /* flakes stay put in the world (so walking through them reads as
       motion); any that fall outside the box around the camera wrap to its
       far side */
    for (let i = 0; i < W.N; i++) {
      const j = i * 3;
      const dx = p[j] - cam.x, dz = p[j + 2] - cam.z;
      if (dx < -W.BX / 2) p[j] += W.BX; else if (dx > W.BX / 2) p[j] -= W.BX;
      if (dz < -W.BZ / 2) p[j + 2] += W.BZ; else if (dz > W.BZ / 2) p[j + 2] -= W.BZ;
    }
  }

  /* ================= VOXEL KIT =================
     Cubes are collected per material and turned into one InstancedMesh each,
     with a colour per instance, so a whole forested hill, every street tree
     and the far skyline cost a handful of draw calls. */
  let VOXM = null;
  function voxMats() {
    if (VOXM) return VOXM;
    makeSol();
    const leafTex = ctex("voxLeaf", 128, 128, (g, w, h) => {
      const R = rng(77);
      g.fillStyle = "#4d7f35"; g.fillRect(0, 0, w, h);
      const cols = ["#3d6a2a", "#5a9140", "#6aa44a", "#2f5522", "#78b052", "#456f30"];
      for (let i = 0; i < 900; i++) {
        g.fillStyle = cols[(R() * cols.length) | 0];
        g.fillRect((R() * 16 | 0) * 8, (R() * 16 | 0) * 8, 8, 8);
      }
    });
    const barkTex = ctex("voxBark", 64, 128, (g, w, h) => {
      const R = rng(91);
      g.fillStyle = "#6b4a2b"; g.fillRect(0, 0, w, h);
      const cols = ["#5a3d22", "#7a5634", "#4b321c", "#836040"];
      for (let i = 0; i < 260; i++) { g.fillStyle = cols[(R() * 4) | 0]; g.fillRect((R() * 8 | 0) * 8, (R() * 16 | 0) * 8, 8, 8 + (R() * 2 | 0) * 8); }
    });
    const grassTex = ctex("voxGrass", 128, 128, (g, w, h) => {
      const R = rng(113);
      g.fillStyle = "#5e8f3c"; g.fillRect(0, 0, w, h);
      const cols = ["#4f7f33", "#6c9e45", "#7bab4f", "#557f36", "#86b65a"];
      for (let i = 0; i < 700; i++) { g.fillStyle = cols[(R() * 5) | 0]; g.fillRect((R() * 16 | 0) * 8, (R() * 16 | 0) * 8, 8, 8); }
    });
    const rockTex = ctex("voxRock", 128, 128, (g, w, h) => {
      const R = rng(131);
      g.fillStyle = "#8d8d86"; g.fillRect(0, 0, w, h);
      const cols = ["#7a7a73", "#a2a29a", "#6c6c66", "#b3b3aa", "#868a7e"];
      for (let i = 0; i < 700; i++) { g.fillStyle = cols[(R() * 5) | 0]; g.fillRect((R() * 16 | 0) * 8, (R() * 16 | 0) * 8, 8, 8); }
    });
    [leafTex, barkTex, grassTex, rockTex].forEach((t) => { t.magFilter = T.NearestFilter; });
    VOXM = {
      leaf: new T.MeshStandardMaterial({ map: leafTex, roughness: 0.92, metalness: 0 }),
      bark: new T.MeshStandardMaterial({ map: barkTex, roughness: 0.95, metalness: 0 }),
      grass: new T.MeshStandardMaterial({ map: grassTex, roughness: 0.95, metalness: 0 }),
      rock: new T.MeshStandardMaterial({ map: rockTex, roughness: 0.9, metalness: 0 }),
      plain: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.05 })
    };
    return VOXM;
  }
  function voxBatch() {
    const groups = new Map();
    const col = new T.Color();
    const api = {
      n: 0,
      cube(mat, x, y, z, sx, sy, sz, hex, rotY, opt) {
        let gk = groups.get(mat);
        if (!gk) { gk = { mat: mat, list: [], cast: false, recv: true }; groups.set(mat, gk); }
        gk.list.push([x, y, z, sx, sy, sz, hex == null ? 0xffffff : hex, rotY || 0]);
        if (opt && opt.cast) gk.cast = true;
        api.n++;
      },
      flush(S, name) {
        const box = new T.BoxGeometry(1, 1, 1);
        const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), pos = new T.Vector3(), scl = new T.Vector3();
        const out = [];
        groups.forEach((gk) => {
          const im = new T.InstancedMesh(box, gk.mat, gk.list.length);
          gk.list.forEach((c, i) => {
            pos.set(c[0], c[1], c[2]); scl.set(c[3], c[4], c[5]);
            e.set(0, c[7], 0); q.setFromEuler(e);
            m4.compose(pos, q, scl);
            im.setMatrixAt(i, m4);
            col.setHex(c[6]);
            im.setColorAt(i, col);
          });
          im.instanceMatrix.needsUpdate = true;
          if (im.instanceColor) im.instanceColor.needsUpdate = true;
          im.castShadow = gk.cast;
          im.receiveShadow = gk.recv;
          im.name = (name || "vox") + "-" + (gk.mat.name || "m");
          im.userData.noBlock = 1;
          im.frustumCulled = false;
          S.add(im);
          out.push(im);
        });
        return out;
      }
    };
    return api;
  }
  /* a broadleaf street tree (zelkova / ginkgo look): a trunk with two limbs
     and a crown of 0.5 m cubes, hollow inside, ragged at the edge */
  function voxTree(V, x, y0, z, h, seed, opt) {
    const M = voxMats();
    const R = rng(seed || 1);
    const o = opt || {};
    const tint = o.tint || [0xffffff, 0xe8f2dc, 0xd6e8c6, 0xf4ffe8];
    V.cube(M.bark, x, y0 + h * 0.4, z, 0.36, h * 0.8, 0.36, 0xffffff, 0, { cast: true });
    V.cube(M.bark, x + 0.3, y0 + h * 0.72, z, 0.6, 0.22, 0.22, 0xffffff);
    V.cube(M.bark, x - 0.24, y0 + h * 0.66, z + 0.1, 0.5, 0.2, 0.2, 0xffffff);
    const c = o.cube || 0.5;
    const rx = o.rx || 1.7, ry = o.ry || 1.35;
    const cy = y0 + h * 0.8 + ry * 0.55;
    const n = Math.ceil(rx / c) + 1, ny = Math.ceil(ry / c) + 1;
    for (let i = -n; i <= n; i++) for (let j = -ny; j <= ny; j++) for (let k = -n; k <= n; k++) {
      const dx = i * c, dy = j * c, dz = k * c;
      const d = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) + (dz * dz) / (rx * rx);
      if (d > 1) continue;
      if (d < 0.5) continue; /* hollow */
      if (d > 0.78 && R() < 0.35) continue; /* ragged edge */
      V.cube(M.leaf, x + dx, cy + dy, z + dz, c, c, c, tint[(R() * tint.length) | 0], 0, { cast: true });
    }
  }
  /* a Korean red pine / spruce: a straight trunk and stacked square tiers */
  function voxPine(V, x, y0, z, h, seed) {
    const M = voxMats();
    const R = rng(seed || 3);
    V.cube(M.bark, x, y0 + h * 0.5, z, 0.4, h, 0.4, 0xd9c2a8, 0, { cast: true });
    const tiers = Math.max(3, Math.round(h / 1.6));
    for (let t = 0; t < tiers; t++) {
      const k = t / tiers;
      const r = (1 - k) * h * 0.26 + 0.35;
      const y = y0 + h * 0.3 + t * (h * 0.72 / tiers);
      const tone = [0x9fc28a, 0x8fb57c, 0xb0cf98][(R() * 3) | 0];
      V.cube(M.leaf, x, y, z, r * 2, 0.55, r * 2, tone, R() * 0.4, { cast: true });
      V.cube(M.leaf, x, y + 0.4, z, r * 1.4, 0.45, r * 1.4, tone, R() * 0.4 + 0.7, { cast: true });
    }
    V.cube(M.leaf, x, y0 + h + 0.2, z, 0.45, 0.6, 0.45, 0x9fc28a);
  }
  /* a forested hill as a stepped height field: columns of soil topped by
     grass, and crowns standing on it at random */
  function voxHill(V, cx, cz, w, d, peak, seed, opt) {
    const M = voxMats();
    const R = rng(seed || 9);
    const o = opt || {};
    const cell = o.cell || 4;
    const nx = Math.round(w / cell), nz = Math.round(d / cell);
    const base = o.base == null ? -4 : o.base;
    const hAt = (u, v) => {
      /* a ridge with a main summit and two shoulders, plus wobble */
      const a = Math.exp(-((u - 0.5) ** 2) / 0.07 - ((v - 0.55) ** 2) / 0.1);
      const b = 0.62 * Math.exp(-((u - 0.2) ** 2) / 0.04 - ((v - 0.6) ** 2) / 0.08);
      const c = 0.58 * Math.exp(-((u - 0.8) ** 2) / 0.04 - ((v - 0.6) ** 2) / 0.08);
      const wob = 0.06 * Math.sin(u * 23 + seed) * Math.cos(v * 17);
      return Math.max(0, Math.max(a, b, c) + wob);
    };
    const tops = [];
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
      const u = (i + 0.5) / nx, v = (k + 0.5) / nz;
      const hh = Math.round((hAt(u, v) * peak) / 2) * 2;
      if (hh < 1) continue;
      const x = cx - w / 2 + (i + 0.5) * cell, z = cz - d / 2 + (k + 0.5) * cell;
      const shade = 0.6 + R() * 0.16;
      const g = Math.round(255 * shade);
      V.cube(M.grass, x, base + (hh - base) / 2, z, cell, hh - base, cell, (g << 16) | (Math.min(255, g + 10) << 8) | g);
      tops.push([x, hh, z, u, v]);
    }
    /* crowns: big leafy cubes, denser low on the slopes */
    tops.forEach(([x, hh, z]) => {
      const n = R() < 0.85 ? 1 + (R() * 2 | 0) : 0;
      for (let t = 0; t < n; t++) {
        const s = cell * (0.55 + R() * 0.5);
        const tone = [0x7f9a6c, 0x6b8a5c, 0x8fa978, 0x5f7d52, 0x9bb084][(R() * 5) | 0];
        V.cube(M.leaf, x + (R() - 0.5) * cell * 0.8, hh + s * 0.5 + R() * 0.8, z + (R() - 0.5) * cell * 0.8, s, s * (0.8 + R() * 0.5), s, tone, R() * 1.2);
      }
    });
    return { hAt: (u, v) => hAt(u, v) * peak, tops };
  }
  /* far skyline: tall towers with facade textures, set behind the near blocks */
  function voxSkyline(S, list) {
    makeSol();
    const mats = [SOL.facA, SOL.facB, SOL.facC];
    list.forEach(([x, z, w, d, h, k]) => {
      const mat = repMat(mats[k % 3], Math.max(w, d) / 6, h / 6.4);
      const b = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      b.position.set(x, h / 2 - 0.5, z);
      b.userData.noBlock = 1;
      S.add(b);
      /* a roof crown: plant room and a lit aerial on the taller ones */
      const c = new T.Mesh(new T.BoxGeometry(w * 0.5, 2.2, d * 0.5), SOL.concrete || mat);
      c.position.set(x, h + 0.6, z);
      S.add(c);
    });
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
    /* the mountain is a stepped voxel ridge under a forest of crowns; the
       old cone ridge is kept only far behind it as a hazy second range */
    ridge.forEach(([dx, dz, hh], i) => {
      if (Math.abs(dx) < 70) return;
      const m = new T.Mesh(new T.ConeGeometry(hh * 1.25, hh, 7, 1), new T.MeshLambertMaterial({ color: tones[i % tones.length] }));
      m.position.set(cx + dx, hh / 2 - 12, cz + dz + 40);
      m.rotation.y = i * 0.6;
      S.add(m);
    });
    const V = voxBatch();
    const hill = voxHill(V, cx, cz + 10, 300, 110, 74, 404, { cell: 5, base: -6 });
    V.flush(S, "namsan");
    const peak = Math.round(hill.hAt(0.5, 0.55)) - 1;
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

  /* (v19) a Korean police sedan, rebuilt from a side profile: a beveled
     body extruded from the real silhouette (nose, hood, A/C pillars, trunk),
     glass laid on the greenhouse, wheel arches, five-spoke rims, bumpers,
     grille, lamps, mirrors, door seams and a segmented light bar. */
  let PCAR = null;
  function makePoliceCar(S, x, z, rotY) {
    makeSol();
    if (!PCAR) {
      const sh = new T.Shape();
      const P = [[-2.28, 0.32], [-2.34, 0.6], [-2.24, 0.96], [-1.68, 1.02], [-1.36, 1.06], [-0.76, 1.5], [0.44, 1.52], [1.14, 1.08], [2.02, 0.96], [2.3, 0.82], [2.33, 0.42], [2.22, 0.32]];
      sh.moveTo(P[0][0], P[0][1]);
      P.slice(1).forEach((q) => sh.lineTo(q[0], q[1]));
      sh.lineTo(P[0][0], P[0][1]);
      const geo = new T.ExtrudeGeometry(sh, { depth: 1.78, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2, steps: 1 });
      geo.translate(0, 0, -0.89);
      geo.rotateY(-Math.PI / 2); /* shape x (car length) → world z */
      const win = new T.Shape();
      [[-1.24, 1.1], [-0.74, 1.45], [0.4, 1.47], [1.02, 1.12]].forEach((q, k) => (k ? win.lineTo(q[0], q[1]) : win.moveTo(q[0], q[1])));
      const winGeo = new T.ShapeGeometry(win);
      winGeo.rotateY(-Math.PI / 2);
      PCAR = {
        geo: geo, winGeo: winGeo,
        glass: new T.MeshStandardMaterial({ color: 0x1b2a34, emissive: 0x05090c, roughness: 0.06, metalness: 0.6, envMapIntensity: 1.0, side: T.DoubleSide }),
        black: new T.MeshStandardMaterial({ color: 0x111316, roughness: 0.7, metalness: 0.1 }),
        hole: new T.MeshBasicMaterial({ color: 0x060708 }),
        chrome: new T.MeshStandardMaterial({ color: 0xc4c9cd, roughness: 0.22, metalness: 0.9 }),
        rim: new T.MeshStandardMaterial({ color: 0xaeb4b9, roughness: 0.3, metalness: 0.8 }),
        head: new T.MeshBasicMaterial({ color: 0xfff6dc }),
        amber: new T.MeshBasicMaterial({ color: 0xffa424 })
      };
    }
    const M = PCAR;
    const g = new T.Group();
    const add = (geo, mat, px, py, pz, rx, ry, rz) => { const o = new T.Mesh(geo, mat); o.position.set(px || 0, py || 0, pz || 0); o.rotation.set(rx || 0, ry || 0, rz || 0); g.add(o); return o; };
    const B = (w, h, d, mat, px, py, pz, rx) => add(new T.BoxGeometry(w, h, d), mat, px, py, pz, rx);
    const body = add(M.geo, SOL.policeWhite);
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.wall = 1;
    /* glass: side lights, windshield and back light, with a B pillar */
    [-1, 1].forEach((sd) => {
      add(M.winGeo, M.glass, sd * 0.945, 0, 0);
      B(0.02, 0.4, 0.09, M.black, sd * 0.95, 1.28, -0.08);
    });
    const ws = add(new T.PlaneGeometry(1.66, 0.86), M.glass, 0, 1.31, 0.8, -0.99);
    ws.rotation.x = -0.99;
    const rw = add(new T.PlaneGeometry(1.62, 0.78), M.glass, 0, 1.29, -1.06);
    rw.rotation.x = 0.906;
    /* wheel arches and wheels */
    [-1.42, 1.48].forEach((wz) => {
      [-1, 1].forEach((sx) => {
        add(new T.CylinderGeometry(0.43, 0.43, 0.04, 20), M.hole, sx * 0.93, 0.36, wz, 0, 0, Math.PI / 2);
        const w = add(new T.CylinderGeometry(0.34, 0.34, 0.24, 18), SOL.tire, sx * 0.82, 0.34, wz, 0, 0, Math.PI / 2);
        w.castShadow = true;
        add(new T.CylinderGeometry(0.22, 0.22, 0.02, 16), M.rim, sx * 0.945, 0.34, wz, 0, 0, Math.PI / 2);
        for (let k = 0; k < 5; k++) {
          const sp = B(0.025, 0.2, 0.05, M.rim, sx * 0.955, 0.34, wz);
          sp.rotation.x = (k / 5) * Math.PI * 2;
          sp.translateY(0.08);
        }
        add(new T.CylinderGeometry(0.05, 0.05, 0.03, 8), M.chrome, sx * 0.965, 0.34, wz, 0, 0, Math.PI / 2);
      });
    });
    /* bumpers, grille and lamps */
    B(1.92, 0.24, 0.16, M.black, 0, 0.44, 2.36);
    B(1.92, 0.24, 0.16, M.black, 0, 0.46, -2.37);
    B(0.9, 0.16, 0.04, M.black, 0, 0.72, 2.37);
    for (let k = 0; k < 3; k++) B(0.86, 0.014, 0.02, M.chrome, 0, 0.67 + k * 0.045, 2.39);
    [-1, 1].forEach((sx) => {
      B(0.42, 0.13, 0.04, M.head, sx * 0.64, 0.79, 2.34);
      B(0.14, 0.06, 0.04, M.amber, sx * 0.84, 0.66, 2.33);
      B(0.38, 0.15, 0.04, SOL.lampRed, sx * 0.66, 0.86, -2.33);
      B(0.12, 0.15, 0.04, M.amber, sx * 0.88, 0.86, -2.32);
      /* mirrors, door seams, handles */
      B(0.16, 0.1, 0.2, M.black, sx * 1.0, 1.12, 0.86);
      B(0.012, 0.56, 0.012, M.black, sx * 0.94, 0.78, 0.98);
      B(0.012, 0.6, 0.012, M.black, sx * 0.94, 0.78, -0.08);
      B(0.012, 0.5, 0.012, M.black, sx * 0.94, 0.8, -1.2);
      B(0.02, 0.03, 0.14, M.chrome, sx * 0.945, 0.92, 0.6);
      B(0.02, 0.03, 0.14, M.chrome, sx * 0.945, 0.92, -0.5);
      /* the blue belt and the lettering */
      B(0.02, 0.14, 4.2, SOL.policeBlue, sx * 0.94, 0.7, 0.02);
      const txt = add(new T.PlaneGeometry(1.1, 0.26), SOL.policeText, sx * 0.952, 0.52, -0.1);
      txt.rotation.y = sx * Math.PI / 2;
    });
    /* plates */
    B(0.5, 0.12, 0.02, SOL.policeWhite, 0, 0.44, 2.45);
    B(0.5, 0.12, 0.02, SOL.policeWhite, 0, 0.62, -2.37);
    /* light bar: base, red and blue segments, clear centre */
    B(1.24, 0.08, 0.32, M.black, 0, 1.58, -0.14);
    for (let k = 0; k < 6; k++) {
      const red = k < 3;
      const m = k === 2 || k === 3 ? M.head : red ? SOL.lampRed : SOL.lampBlue;
      B(0.18, 0.12, 0.26, m, -0.5 + k * 0.2, 1.68, -0.14);
    }
    g.position.set(x, 0.3, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }

  /* Seoul city bus (low-floor, 11 m): a painted livery on the body sides,
     a real glazed cabin you can see seats and grab poles through, two plug
     doors, a stepped roof with the AC pod and CNG tanks, the rabbit-ear
     mirrors, wheel arches, hubs with nuts, and the LED route boards. */
  let BUS = null;
  function busMats() {
    if (BUS) return BUS;
    makeSol();
    const sideTex = ctex("busLivery", 1024, 256, (g, w, h) => {
      /* body: Seoul branch-bus green, a lime belt and a white rocker */
      g.fillStyle = "#2f9a55"; g.fillRect(0, 0, w, h);
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "rgba(255,255,255,.10)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,.14)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "#9fd34a"; g.fillRect(0, h * 0.10, w, h * 0.09);
      g.fillStyle = "#f2f5ee"; g.fillRect(0, h * 0.78, w, h * 0.22);
      g.fillStyle = "#1f6e3c"; g.fillRect(0, h * 0.75, w, h * 0.03);
      /* swoosh */
      g.fillStyle = "rgba(255,255,255,.85)";
      g.beginPath(); g.moveTo(w * 0.52, h * 0.78); g.quadraticCurveTo(w * 0.70, h * 0.30, w * 0.98, h * 0.26);
      g.lineTo(w * 0.98, h * 0.36); g.quadraticCurveTo(w * 0.74, h * 0.42, w * 0.60, h * 0.78); g.closePath(); g.fill();
      g.fillStyle = "#ffffff";
      g.font = "900 " + Math.round(h * 0.2) + "px Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
      g.textBaseline = "middle";
      g.fillText("서울버스", w * 0.06, h * 0.45);
      g.font = "700 " + Math.round(h * 0.09) + "px sans-serif";
      g.fillText("SEOUL BUS", w * 0.065, h * 0.62);
      /* panel seams and rivet lines */
      g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2;
      for (let x = 0; x < w; x += w / 9) { g.beginPath(); g.moveTo(x, h * 0.2); g.lineTo(x, h * 0.75); g.stroke(); }
      g.beginPath(); g.moveTo(0, h * 0.2); g.lineTo(w, h * 0.2); g.stroke();
    }, { smooth: true });
    const frontTex = ctex("busFace", 256, 256, (g, w, h) => {
      g.fillStyle = "#2f9a55"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#9fd34a"; g.fillRect(0, h * 0.06, w, h * 0.06);
      g.fillStyle = "#f2f5ee"; g.fillRect(0, h * 0.7, w, h * 0.3);
      g.fillStyle = "#1c2226"; g.fillRect(w * 0.3, h * 0.36, w * 0.4, h * 0.16);
      g.fillStyle = "#c9d0d4"; for (let i = 0; i < 6; i++) g.fillRect(w * 0.32, h * (0.375 + i * 0.022), w * 0.36, h * 0.008);
      g.fillStyle = "#ffffff"; g.font = "900 30px sans-serif"; g.textAlign = "center"; g.fillText("SEOUL", w / 2, h * 0.27);
    }, { smooth: true });
    BUS = {
      side: new T.MeshStandardMaterial({ map: sideTex, roughness: 0.3, metalness: 0.15, envMapIntensity: 0.55 }),
      face: new T.MeshStandardMaterial({ map: frontTex, roughness: 0.3, metalness: 0.15, envMapIntensity: 0.55 }),
      green: new T.MeshStandardMaterial({ color: 0x2f9a55, roughness: 0.32, metalness: 0.15, envMapIntensity: 0.5 }),
      white: new T.MeshStandardMaterial({ color: 0xeef1ea, roughness: 0.35, metalness: 0.1 }),
      roof: new T.MeshStandardMaterial({ color: 0xdfe3df, roughness: 0.5, metalness: 0.2 }),
      black: new T.MeshStandardMaterial({ color: 0x0c0d0f, roughness: 0.75, metalness: 0.1, envMapIntensity: 0.25 }),
      rubber: new T.MeshStandardMaterial({ color: 0x1a1b1d, roughness: 0.9 }),
      glass: new T.MeshStandardMaterial({ color: 0x18313d, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.52, envMapIntensity: 1.1, depthWrite: false }),
      tint: new T.MeshStandardMaterial({ color: 0x0f1a20, roughness: 0.06, metalness: 0.5, envMapIntensity: 1.0 }),
      seat: new T.MeshStandardMaterial({ color: 0x2b4f86, roughness: 0.8 }),
      seatR: new T.MeshStandardMaterial({ color: 0xd8662a, roughness: 0.8 }),
      floor: new T.MeshStandardMaterial({ color: 0x4a4d50, roughness: 0.9 }),
      pole: new T.MeshStandardMaterial({ color: 0xf0c419, roughness: 0.35, metalness: 0.5 }),
      chrome: new T.MeshStandardMaterial({ color: 0xc6cacd, roughness: 0.2, metalness: 0.95 }),
      led: new T.MeshBasicMaterial({ color: 0xffb02e }),
      hole: new T.MeshBasicMaterial({ color: 0x050607 }),
      head: new T.MeshBasicMaterial({ color: 0xfff4d6 }),
      amber: new T.MeshBasicMaterial({ color: 0xffa21f }),
      red: SOL.lampRed,
      tank: new T.MeshStandardMaterial({ color: 0x8c949a, roughness: 0.4, metalness: 0.6 })
    };
    return BUS;
  }

  function makeCityBus(S, x, z, rotY, route) {
    const M = busMats();
    const g = new T.Group();
    const L = 11.0, W = 2.5, HB = 0.34; /* length, width, floor-pan height */
    const add = (w, h, d, px, py, pz, mat, cast) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(px, py, pz);
      if (cast) m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
      return m;
    };
    /* lower body: livery on both sides, solid ends */
    const lowH = 1.25, lowY = HB + 0.22 + lowH / 2;
    const lower = new T.Mesh(new T.BoxGeometry(W, lowH, L), [M.side, M.side, M.green, M.black, M.face, M.green]);
    lower.position.y = lowY;
    lower.castShadow = true; lower.receiveShadow = true;
    lower.userData.wall = 1;
    g.add(lower);
    /* the window storey: corner pillars, glass, pillars between bays */
    const winB = lowY + lowH / 2, winH = 1.12, winY = winB + winH / 2;
    const cab = add(W - 0.12, winH, L - 0.2, 0, winY, 0, M.glass);
    cab.renderOrder = 2;
    [-1, 1].forEach((sx) => {
      for (let i = 0; i <= 7; i++) {
        const pz = -L / 2 + 0.25 + i * ((L - 0.5) / 7);
        add(0.08, winH, i === 0 || i === 7 ? 0.32 : 0.12, sx * (W / 2 - 0.04), winY, pz, M.black);
      }
      add(0.06, 0.1, L - 0.1, sx * (W / 2 - 0.03), winB + 0.04, 0, M.rubber);
      /* route number on the side above the windows */
      const num = new T.Mesh(new T.PlaneGeometry(0.95, 0.3), SOL.busRoute);
      num.position.set(sx * (W / 2 + 0.005), winB + winH + 0.18, sx > 0 ? 3.6 : -3.6);
      num.rotation.y = sx * Math.PI / 2;
      g.add(num);
    });
    /* roof: a top plate, a stepped upper skin, the AC pod and the CNG tank cover */
    const roofY = winB + winH;
    add(W, 0.36, L, 0, roofY + 0.18, 0, M.green, true);
    add(W - 0.3, 0.12, L - 0.4, 0, roofY + 0.42, 0, M.roof, true);
    add(1.7, 0.36, 2.6, 0, roofY + 0.66, -1.4, M.roof, true);
    for (let i = 0; i < 4; i++) add(1.5, 0.03, 0.3, 0, roofY + 0.86, -2.4 + i * 0.66, M.black);
    add(2.0, 0.42, 3.2, 0, roofY + 0.69, 2.6, M.roof, true);
    [-0.5, 0.5].forEach((sx) => {
      const t = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 2.9, 10), M.tank);
      t.rotation.x = Math.PI / 2;
      t.position.set(sx, roofY + 0.95, 2.6);
      g.add(t);
    });
    /* interior through the glass: floor, seat rows, grab poles */
    add(W - 0.2, 0.06, L - 0.6, 0, winB - 0.55, 0, M.floor);
    for (let i = 0; i < 8; i++) {
      const pz = -L / 2 + 1.2 + i * 1.05;
      if (pz > 2.4 && pz < 3.6) continue;
      [-1, 1].forEach((sx) => {
        const mat = (i === 6 && sx < 0) ? M.seatR : M.seat;
        add(0.82, 0.12, 0.48, sx * 0.72, winB - 0.12, pz, mat);
        add(0.82, 0.62, 0.1, sx * 0.72, winB + 0.18, pz - 0.22, mat);
      });
      if (i % 2 === 0) add(0.04, winH + 0.9, 0.04, 0.32, winB + 0.05, pz + 0.4, M.pole);
    }
    add(0.04, 0.04, L - 1, 0.42, roofY - 0.12, 0, M.pole);
    add(0.04, 0.04, L - 1, -0.42, roofY - 0.12, 0, M.pole);
    /* front: a raked windscreen, LED board, grille, lamps, bumper, wipers */
    const fz = L / 2;
    const ws = add(W - 0.16, winH + 0.42, 0.05, 0, winY - 0.18, fz + 0.02, M.tint);
    ws.rotation.x = -0.06;
    add(W, 0.08, 0.1, 0, winB - 0.42, fz + 0.04, M.black);
    const brd = new T.Mesh(new T.PlaneGeometry(1.9, 0.32), SOL.busBoard);
    brd.position.set(0, roofY + 0.12, fz + 0.06);
    g.add(brd);
    add(2.0, 0.38, 0.04, 0, roofY + 0.12, fz + 0.03, M.black);
    [-1, 1].forEach((sx) => {
      add(0.42, 0.2, 0.05, sx * 0.86, HB + 0.66, fz + 0.03, M.head);
      add(0.18, 0.1, 0.05, sx * 1.0, HB + 0.88, fz + 0.03, M.amber);
      add(0.5, 0.06, 0.04, sx * 0.86, HB + 0.53, fz + 0.04, M.chrome);
      /* the rabbit-ear mirror: an arm curling forward, a tall head */
      const arm = add(0.05, 0.05, 0.6, sx * (W / 2 - 0.02), roofY - 0.05, fz + 0.28, M.black);
      arm.rotation.y = sx * 0.3;
      add(0.04, 0.3, 0.04, sx * (W / 2 + 0.06), roofY - 0.25, fz + 0.55, M.black);
      add(0.07, 0.34, 0.2, sx * (W / 2 + 0.08), roofY - 0.56, fz + 0.56, M.black);
      const wiper = add(0.03, 0.85, 0.03, sx * 0.4, winB + 0.36, fz + 0.06, M.black);
      wiper.rotation.z = sx * 0.55;
    });
    add(W + 0.04, 0.32, 0.18, 0, HB + 0.28, fz + 0.06, M.black);
    add(W - 0.6, 0.06, 0.04, 0, HB + 0.42, fz + 0.15, M.chrome);
    /* rear: engine grille, tail-light clusters, rear board */
    const rz = -L / 2;
    add(W - 0.6, 0.55, 0.05, 0, HB + 0.9, rz - 0.02, M.black);
    for (let i = 0; i < 5; i++) add(W - 0.7, 0.03, 0.06, 0, HB + 0.7 + i * 0.1, rz - 0.04, M.chrome);
    [-1, 1].forEach((sx) => {
      add(0.22, 0.62, 0.05, sx * 1.08, HB + 1.05, rz - 0.03, M.red);
      add(0.22, 0.14, 0.05, sx * 1.08, HB + 0.66, rz - 0.03, M.amber);
    });
    add(W + 0.04, 0.3, 0.16, 0, HB + 0.28, rz - 0.06, M.black);
    add(W - 0.24, 0.62, 0.05, 0, winY + 0.1, rz - 0.02, M.tint);
    /* doors: the front door by the driver, the centre door; split glass leaves */
    [[fz - 1.15, 1.05], [0.3, 1.25]].forEach(([dz, dw]) => {
      [-1, 1].forEach((sx) => {
        if (sx < 0) return; /* doors on the kerb side only (+x before rotation) */
        add(0.05, winB + winH - HB - 0.25, dw + 0.08, sx * (W / 2 + 0.01), (HB + 0.22 + winB + winH) / 2, dz, M.black);
        [-1, 1].forEach((h) => {
          add(0.04, winB + winH - HB - 0.5, dw / 2 - 0.08, sx * (W / 2 + 0.03), (HB + 0.32 + winB + winH - 0.1) / 2, dz + h * dw / 4, M.tint);
        });
        add(0.03, 0.04, dw, sx * (W / 2 + 0.05), winB - 0.1, dz, M.chrome);
      });
    });
    /* wheels: dark arches, tyres, steel hubs with a ring of nuts */
    [-3.6, 3.2].forEach((wz) => {
      [-1, 1].forEach((sx) => {
        add(0.02, 0.66, 1.3, sx * (W / 2 + 0.004), HB + 0.55, wz, M.hole);
        const tyre = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.32, 18), SOL.tire);
        tyre.rotation.z = Math.PI / 2;
        tyre.position.set(sx * (W / 2 - 0.14), 0.5, wz);
        tyre.castShadow = true;
        g.add(tyre);
        const hub = new T.Mesh(new T.CylinderGeometry(0.29, 0.29, 0.34, 14), M.chrome);
        hub.rotation.z = Math.PI / 2;
        hub.position.set(sx * (W / 2 - 0.13), 0.5, wz);
        g.add(hub);
        const cap = new T.Mesh(new T.CylinderGeometry(0.1, 0.12, 0.36, 8), M.black);
        cap.rotation.z = Math.PI / 2;
        cap.position.set(sx * (W / 2 - 0.12), 0.5, wz);
        g.add(cap);
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * Math.PI * 2;
          add(0.06, 0.04, 0.04, sx * (W / 2 + 0.05), 0.5 + Math.sin(a) * 0.19, wz + Math.cos(a) * 0.19, M.black);
        }
      });
    });
    /* underbody shadow box so the floor never shows sky under the bus */
    add(W - 0.3, 0.28, L - 0.8, 0, HB + 0.1, 0, M.black);
    g.position.set(x, 0.3, z);
    g.rotation.y = rotY || 0;
    S.add(g);
    return g;
  }

  /* ---- cover props in Seoul materials: concrete, not sandbags ---- */

  /* (v21) a real New Jersey profile, extruded, with chamfered ends, lifting
     slots and a drain notch, over the old stacked-box block */
  const JSH = {};
  function jerseyGeo(L) {
    const k = L.toFixed(2);
    if (JSH[k]) return JSH[k];
    const sh = new T.Shape();
    [[-0.35, 0], [0.35, 0], [0.35, 0.09], [0.24, 0.32], [0.11, 0.98], [-0.11, 0.98], [-0.24, 0.32], [-0.35, 0.09]].forEach((q, i) => (i ? sh.lineTo(q[0], q[1]) : sh.moveTo(q[0], q[1])));
    const geo = new T.ExtrudeGeometry(sh, { depth: L - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 1 });
    geo.translate(0, 0, -(L - 0.06) / 2);
    geo.rotateY(Math.PI / 2);
    /* box-project the uvs so the concrete texture is not smeared */
    const pos = geo.attributes.position, uv = geo.attributes.uv, nrm = geo.attributes.normal;
    for (let i = 0; i < pos.count; i++) {
      const nx = Math.abs(nrm.getX(i)), ny = Math.abs(nrm.getY(i));
      if (nx > 0.6) uv.setXY(i, pos.getZ(i) * 0.8, pos.getY(i) * 0.8);
      else if (ny > 0.6) uv.setXY(i, pos.getX(i) * 0.8, pos.getZ(i) * 0.8);
      else uv.setXY(i, pos.getX(i) * 0.8, pos.getY(i) * 0.8);
    }
    uv.needsUpdate = true;
    return (JSH[k] = geo);
  }
  function makeJersey(x, z, len) {
    makeSol();
    const g = new T.Group();
    const L = Math.max(1.2, len || 2.2);
    const body = new T.Mesh(jerseyGeo(L), SOL.barrier);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    [-1, 1].forEach((s) => { const slot = new T.Mesh(new T.BoxGeometry(0.22, 0.1, 0.72), SOL.metalDark || SOL.black); slot.position.set(s * L * 0.28, 0.05, 0); g.add(slot); });
    const lift = new T.Mesh(new T.BoxGeometry(0.06, 0.08, 0.25), SOL.metalDark || SOL.black); lift.position.set(0, 0.99, 0); g.add(lift);
    for (let i = -1; i <= 1; i++) {
      const refl = new T.Mesh(new T.BoxGeometry(0.2, 0.09, 0.24), i === 0 ? SOL.paintWhite : SOL.lampRed);
      refl.position.set(i * (L / 3.4), 0.97, 0);
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

  const ROLE = { weak: 1, throw: 1, tough: 1, hostage: 1, boss: 1, para: 1 };
  function roleOf(kind) { return ROLE[kind] ? kind : "weak"; }
  function roleHp(role) { return role === "tough" ? 3 : role === "throw" || role === "para" ? 2 : role === "boss" ? Math.round(16 * (DIFF.boss || 1)) : 1; }
  function roleAim(role) { return roleAim0(role) * (DIFF.aim || 1); }
  function roleAim0(role) { return role === "weak" ? 1.95 : role === "throw" ? 2.25 : role === "para" ? 2.35 : role === "tough" ? 2.65 : role === "boss" ? 1.85 : 99; }
  function roleScale(role) { return role === "tough" || role === "boss" ? 1.5 : 1.28; }

  let CLOCK0 = 200;
  const CAM_Y = 1.68;
  const GATE_Z = 60.2;
  const YARD_MID = -39;

  /* camera rail: platform -> corner -> alley -> corner -> courtyard -> gate */
  /* (v16) the rail no longer stops at the yard gate: it goes through the
     gate passage, up a back street, east along the avenue behind the
     boulevard blocks and out onto the Sungnyemun plaza, where the boss waits */
  const PATH1 = [
    [0, -10], [0, -4], [0, 2], [0, 8], [0, 14], [0, 17.4],
    [-1.4, 20.4], [-4.8, 23.0], [-10.2, 24.0], [-17, 24.0], [-24, 24.1],
    [-29.2, 25.3], [-33.4, 27.4], [-37.2, 30.8], [-39, 35.0], [-39, 42], [-39, 47],
    [-39, 52], [-39, 58], [-39, 63], [-39, 65.5], [-37.6, 68.2], [-34, 69.2], [-28, 69.2],
    [-24, 69.2], [-18, 69.2], [-12, 69.0], [-8.4, 67.8], [-5.4, 65.4], [-3.2, 62.8], [-2, 60.5]
  ];

  /* wave layout. lat = metres to the side, dep = metres down the zone's
     own forward axis, elev = platform height for elevated posts. */
  const WAVES1 = [
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
      id: 15, name: "junction", hold: [-4.8, 23.0], yaw: 0, look: [-0.5, 1.6, 34.0], time: 24,
      radio: "교차로 북쪽, 숭례문 대로에 적 분대! 버스 정류장 뒤를 조심하라!",
      picks: [[-2.6, 6.4, "smg"]],
      members: [
        { role: "weak", lat: 1.2, dep: 9.0, cover: "barrier" },
        { role: "weak", lat: 7.2, dep: 10.4, cover: "crate" },
        { role: "throw", lat: 3.8, dep: 12.6, cover: "sandbag" },
        { role: "tough", lat: 9.6, dep: 13.0, cover: "barrier" },
        { role: "weak", lat: -1.6, dep: 13.4, cover: "sandbag", bike: true, run: { from: [-3.0, 52.0], dur: 2.6, delay: 1.2 } }
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
    },
    {
      id: 5, name: "backstreet", hold: [-39, 63], yaw: 0, look: [-38, 1.6, 74.0], time: 26,
      radio: "성문 통과! 뒷골목 광장에 적 매복, 정면과 2층 창가를 확인하라!",
      picks: [[-4.6, 6.0, "grenade"], [4.2, 6.4, "ammo"]],
      members: [
        { role: "weak", lat: -5.0, dep: 8.2, cover: "crate" },
        { role: "tough", lat: 1.6, dep: 9.6, cover: "barrier" },
        { role: "throw", lat: -1.6, dep: 10.8, cover: "sandbag" },
        { role: "weak", lat: 5.6, dep: 8.8, cover: "crates" },
        { role: "hostage", lat: 3.2, dep: 11.2 }
      ]
    },
    {
      id: 6, name: "avenue", hold: [-28, 69.2], yaw: Math.PI / 2, look: [-14, 1.6, 69.6], time: 28,
      radio: "숭례문까지 300미터! 대로변 바리케이드를 돌파하라!",
      picks: [[-2.8, 5.8, "shotgun"], [2.8, 6.4, "life"]],
      members: [
        { role: "weak", lat: -3.2, dep: 8.0, cover: "barrier" },
        { role: "tough", lat: 2.8, dep: 9.4, cover: "sandbag" },
        { role: "weak", lat: -1.0, dep: 12.0, cover: "crate" },
        { role: "throw", lat: 3.4, dep: 13.4, cover: "crates" },
        { role: "weak", lat: -3.6, dep: 14.6, cover: "barrier" },
        { role: "hostage", lat: 0.8, dep: 15.4 },
        { role: "weak", lat: 3.8, dep: 16.6, cover: "crate", bike: true, run: { from: [-3.0, 73.0], dur: 2.8, delay: 2.0 } }
      ]
    },
    {
      id: 7, name: "sungnyemun", hold: [-2, 60.5], yaw: 0, look: [-0.5, 3.0, 74.0], time: 30,
      radio: "숭례문 광장이다! 적 지휘부가 문루 앞에 진을 쳤다, 전원 제압하라!",
      picks: [[-5.6, 5.4, "supply"], [5.8, 5.6, "grenade"]],
      members: [
        { role: "tough", lat: -8.0, dep: 9.4, cover: "barrier" },
        { role: "weak", lat: -3.6, dep: 10.6, cover: "sandbag" },
        { role: "throw", lat: 1.8, dep: 9.8, cover: "crate" },
        { role: "weak", lat: 6.6, dep: 10.4, cover: "sandbag" },
        { role: "tough", lat: 10.6, dep: 9.0, cover: "barrier" },
        { role: "hostage", lat: -0.6, dep: 12.2 }
      ]
    }
  ];

  const BOSS1 = {
    hold: [-2, 60.5], look: [-0.5, 2.2, 72.0],
    spots: [[-4.6, 9.8], [0.6, 9.2], [5.8, 9.8]]
  };

  /* ============================================================
     STAGE 2 — DMZ · 판문점(JSA)
     The rail runs north up an unpaved tactical road between the double
     barbed-wire fences of the DMZ, through the checkpoint gate, and into
     the Panmunjom joint security area: the blue conference halls, the MDL
     concrete line, Panmungak and Freedom House. Air gimmicks (a circling
     helicopter with a door gunner, paratroopers under canopy) carry the
     upper half of the frame; the boss is an armoured vehicle on the plaza.
     ============================================================ */
  /* (v16) the stage starts 34 m further south, at the GOP wire, with two
     more fights on the tactical road before the original first one */
  const PATH2 = [
    [0, -46], [0, -40], [0, -34], [0, -28], [0, -22], [0, -16],
    [0, -12], [0, -6], [0, 0], [0, 6], [0, 12], [0, 18], [0, 22],
    [-2, 27], [-6, 31], [-10.5, 35], [-15, 39], [-17.5, 44], [-18, 49], [-18, 54]
  ];

  const WAVES2 = [
    {
      id: 11, zone: "GOP", hold: [0, -38], yaw: 0, look: [0, 1.6, -26], time: 24,
      radio: "GOP 철책 통문 개방! 전방 경계초소 주변에 적 정찰대!",
      picks: [[-3.6, 6.0, "ammo"], [3.8, 6.6, "smg"]],
      members: [
        { role: "weak", lat: -4.0, dep: 9.2, cover: "sandbag" },
        { role: "weak", lat: 3.6, dep: 10.4, cover: "crate" },
        { role: "throw", lat: 0.4, dep: 12.8, cover: "sandbag" },
        { role: "tough", lat: -1.8, dep: 14.6, cover: "barrier" }
      ]
    },
    {
      id: 12, zone: "DMZ", hold: [0, -22], yaw: 0, look: [0, 2.0, -9], time: 26,
      radio: "지뢰 지대 통로다, 길 밖으로 나가지 마라! 상공에 적 헬기!",
      picks: [[-2.8, 6.0, "grenade"], [3.0, 6.8, "life"]],
      members: [
        { role: "weak", lat: -4.4, dep: 8.6, cover: "barrier" },
        { role: "tough", lat: 4.2, dep: 9.6, cover: "sandbag" },
        { role: "weak", lat: 0.6, dep: 11.4, cover: "crate" },
        { air: "heli", lat: -1.6, dep: 20.0, y: 9.4, orbit: 5.6 }
      ]
    },
    {
      id: 1, zone: "DMZ", hold: [0, 0], yaw: 0, look: [0, 1.7, 13.5], time: 26,
      radio: "남방한계선 철책 돌파! 전방 도로에 적 보병, 교전 개시!",
      picks: [[-4.2, 6.6, "ammo"], [4.6, 7.4, "supply"]],
      members: [
        { role: "weak", lat: -4.3, dep: 9.4, cover: "sandbag" },
        { role: "tough", lat: -0.3, dep: 12.6, cover: "barrier" },
        { role: "weak", lat: 4.4, dep: 10.2, cover: "crate" },
        { role: "throw", lat: 2.4, dep: 13.8, cover: "bunker" },
        { air: "heli", lat: 1.2, dep: 24.0, y: 9.0, orbit: 6.0 }
      ]
    },
    {
      id: 2, zone: "DMZ", hold: [0, 22], yaw: 0, look: [0.4, 2.7, 35], time: 28,
      radio: "적 공수부대가 상공에서 강하 중이다! 낙하산과 사수를 노려라!",
      picks: [[-2.2, 6.2, "ammo"], [2.6, 7.0, "life"]],
      members: [
        { role: "weak", lat: -5.7, dep: 7.8, cover: "sandbag" },
        { role: "tough", lat: 5.3, dep: 8.6, cover: "crate" },
        { air: "para", role: "para", lat: -4.4, dep: 15.0, y: 6.6, land: [-6.4, 11.4] },
        { air: "para", role: "para", lat: 1.2, dep: 16.4, y: 7.4, land: [0.4, 12.6] },
        { air: "para", role: "para", lat: 5.6, dep: 14.8, y: 7.0, land: [5.2, 11.8] },
        { air: "para", role: "para", lat: -1.2, dep: 18.6, y: 7.8, land: [-2.4, 13.6] }
      ]
    },
    {
      id: 3, tag: "jsa1", zone: "JSA", hold: [-15, 39], yaw: -0.32, look: [-18, 1.9, 55], time: 28,
      radio: "판문점 광장 진입! 적 헬기와 공수부대가 상공에 포착됐다! 위쪽 경계!",
      picks: [[-3.0, 5.6, "shotgun"], [3.2, 6.4, "ammo"]],
      members: [
        { role: "weak", lat: -4.6, dep: 7.2, elev: 1.05, cover: "truckbed" },
        { role: "tough", lat: 3.6, dep: 9.2, cover: "barrier" },
        { role: "weak", lat: 0.2, dep: 6.6, cover: "sandbag" },
        { role: "weak", lat: -6.2, dep: 10.6, cover: "crate" },
        { role: "throw", run: true, lat: -6.4, dep: 10.8, route: [[-6.4, 10.8], [6.2, 12.0]], spd: 2.5 }
      ]
    },
    {
      id: 4, tag: "jsa2", zone: "JSA", hold: [-18, 52], yaw: 0, look: [-18, 2.2, 66], time: 30,
      radio: "JSA 중앙이다! 중장갑 차량이 접근한다, 엄폐물 뒤로!",
      picks: [[-4.4, 5.8, "supply"], [4.6, 6.2, "life"]],
      members: [
        { role: "tough", lat: -6.4, dep: 7.4, cover: "heavy" },
        { role: "weak", lat: -2.6, dep: 9.6, cover: "barrier" },
        { role: "throw", lat: 2.8, dep: 8.8, cover: "crate" },
        { role: "weak", lat: 6.2, dep: 7.6, cover: "sandbag" },
        { air: "para", role: "para", lat: -3.0, dep: 14.0, y: 6.4, land: [-6.0, 12.4] },
        { air: "para", role: "para", lat: 4.0, dep: 14.6, y: 6.8, land: [4.4, 12.8] },
        { air: "heli", lat: -2.2, dep: 20.0, y: 9.2, orbit: 5.4 }
      ]
    }
  ];

  /* ============================================================
     STAGE 3 — 판문점 평화의 집 (v17)
     The summit ground south of the line: a forest road to the Peace House,
     its garden, the blue-painted 도보다리 footbridge over the wetland with
     the little deck at its end, then the row of blue conference huts on the
     MDL, between two guard towers, and the plaza and stair of Panmungak.
     Summer sun. Boss: a tank on the Panmungak plaza.
     ============================================================ */
  const PATH_S = [
    [0, -46], [0, -40], [0, -34], [0, -28], [0, -22], [0, -16], [0, -10], [0, -4],
    [0, 2], [0, 8], [0, 14], [0, 20], [0, 25], [1.4, 30], [4.2, 34], [6.6, 38],
    [7.0, 44], [7.0, 50], [7.0, 55], [7.0, 58]
  ];
  const WAVES_S = [
    {
      id: 1, zone: "PEACE", hold: [0, -38], yaw: 0, look: [0, 1.7, -26], time: 26,
      radio: "평화의 집 진입로! 숲길 양쪽에 적 특수부대, 민간 차량 주의!",
      picks: [[-3.6, 6.2, "ammo"], [3.8, 6.8, "shotgun"]],
      members: [
        { role: "weak", lat: -4.4, dep: 9.4, cover: "sandbag" },
        { role: "weak", lat: 4.2, dep: 10.2, cover: "crate" },
        { role: "throw", lat: 0.6, dep: 13.2, cover: "barrier" },
        { role: "hostage", lat: 2.6, dep: 14.4 }
      ]
    },
    {
      id: 2, zone: "PEACE", hold: [0, -22], yaw: 0, look: [3, 2.4, -8], time: 28,
      radio: "평화의 집 앞이다! 현관 기둥과 2층 창가를 확인하라!",
      picks: [[-3.0, 6.0, "grenade"], [3.2, 6.6, "life"]],
      members: [
        { role: "tough", lat: 4.6, dep: 9.6, cover: "heavy" },
        { role: "weak", lat: -3.6, dep: 10.4, cover: "barrier" },
        { role: "weak", lat: 0.8, dep: 12.4, cover: "crate" },
        { role: "throw", lat: 7.4, dep: 12.8, cover: "sandbag" },
        { air: "heli", lat: -2.0, dep: 22.0, y: 9.6, orbit: 5.8 }
      ]
    },
    {
      id: 3, zone: "GARDEN", hold: [0, -6], yaw: 0, look: [0, 1.8, 6], time: 26,
      radio: "기념식수 정원 통과 중! 소나무 뒤 적 저격 위치!",
      picks: [[-3.2, 5.6, "ammo"], [3.4, 6.2, "smg"]],
      members: [
        { role: "weak", lat: -4.4, dep: 6.0, cover: "sandbag" },
        { role: "tough", lat: 4.8, dep: 6.6, cover: "barrier" },
        { role: "weak", lat: 2.4, dep: 7.6, cover: "crate" },
        { role: "hostage", lat: -1.8, dep: 8.2 }
      ]
    },
    {
      id: 4, zone: "BRIDGE", hold: [0, 8], yaw: 0, look: [0, 1.7, 22], time: 28,
      radio: "도보다리다! 다리 끝 쉼터와 습지 건너편에 적!",
      picks: [[-1.0, 5.0, "supply"], [1.0, 9.0, "grenade"]],
      members: [
        { role: "weak", lat: -2.3, dep: 14.4, cover: "crate" },
        { role: "throw", lat: 2.2, dep: 15.6, cover: "sandbag" },
        { role: "weak", lat: -5.6, dep: 13.0, cover: "sandbag" },
        { role: "weak", lat: 5.8, dep: 12.4, cover: "sandbag" },
        { air: "para", role: "para", lat: -3.0, dep: 16.0, y: 7.4, land: [-5.0, 13.6] }
      ]
    },
    {
      id: 5, zone: "MDL", hold: [0, 25], yaw: 0, look: [3, 2.0, 38], time: 28,
      radio: "군사분계선 앞! 회담장 사이로 적 병력 돌입 중!",
      picks: [[-2.8, 5.8, "ammo"], [3.0, 6.4, "life"]],
      members: [
        { role: "tough", lat: -4.6, dep: 9.4, cover: "barrier" },
        { role: "weak", lat: 1.2, dep: 10.6, cover: "sandbag" },
        { role: "weak", lat: 6.6, dep: 9.8, cover: "crate" },
        { role: "throw", lat: -1.6, dep: 12.6, cover: "barrier" }
      ]
    },
    {
      id: 6, zone: "MDL", hold: [6.6, 38], yaw: 0, look: [7, 2.4, 52], time: 30,
      radio: "회담장 통과! 판문각 계단 앞, 감시탑 사수를 먼저!",
      picks: [[-3.0, 5.8, "grenade"], [3.2, 6.4, "shotgun"]],
      members: [
        { role: "weak", lat: -5.6, dep: 9.6, cover: "sandbag" },
        { role: "tough", lat: -0.8, dep: 11.6, cover: "heavy" },
        { role: "weak", lat: 4.2, dep: 10.4, cover: "barrier" },
        { air: "para", role: "para", lat: 2.0, dep: 15.0, y: 8.0, land: [2.4, 12.4] },
        { air: "para", role: "para", lat: -3.0, dep: 15.6, y: 8.4, land: [-3.4, 12.8] }
      ]
    },
    {
      id: 7, zone: "PANMUNGAK", hold: [7, 58], yaw: 0, look: [7, 3.2, 72], time: 32,
      radio: "판문각 광장! 적 주력 집결, 헬기 접근!",
      picks: [[-4.4, 5.8, "supply"], [4.6, 6.2, "grenade"]],
      members: [
        { role: "tough", lat: -6.4, dep: 8.4, cover: "heavy" },
        { role: "weak", lat: -2.0, dep: 10.2, cover: "barrier" },
        { role: "throw", lat: 2.8, dep: 9.6, cover: "crate" },
        { role: "weak", lat: 6.6, dep: 8.6, cover: "sandbag" },
        { air: "heli", lat: 0.8, dep: 22.0, y: 10.4, orbit: 6.0 }
      ]
    }
  ];
  const BOSS_S = {
    hold: [7, 58], look: [7, 2.4, 68],
    spots: [[-5.6, 10.2], [-0.6, 9.4], [4.6, 10.0]]
  };

  /* ============================================================
     STAGE 4 — 평양 진입 (v16; was Stage 3 until v17)
     Winter, snowing. A long straight avenue between grey apartment slabs
     with red banners, a checkpoint, a tram stop, through a great stone arch,
     then out onto a parade square under a monument tower, with a pyramid
     hotel on the skyline. The boss is the armoured vehicle again, backed by
     paratroopers and a helicopter. No real people are depicted.
     ============================================================ */
  const PATH3 = [
    [0, -46], [0, -40], [0, -34], [0, -28], [0, -22], [0, -16], [0, -10], [0, -4],
    [0, 2], [0, 8], [0, 14], [0, 20], [0, 26], [0, 32], [1.6, 38], [5, 43], [10, 47],
    [14, 51.5], [16, 56], [16, 60]
  ];
  const WAVES3 = [
    {
      id: 1, zone: "PY", hold: [0, -38], yaw: 0, look: [0, 1.7, -26], time: 26,
      radio: "평양 외곽 검문소다! 눈보라 속 적 경비병, 전원 제압!",
      picks: [[-3.8, 6.2, "ammo"], [3.8, 6.8, "smg"]],
      members: [
        { role: "weak", lat: -4.6, dep: 9.0, cover: "sandbag" },
        { role: "tough", lat: 0.4, dep: 11.6, cover: "barrier" },
        { role: "weak", lat: 4.8, dep: 9.8, cover: "crate" },
        { role: "throw", lat: -1.8, dep: 13.8, cover: "sandbag" }
      ]
    },
    {
      id: 2, zone: "PY", hold: [0, -22], yaw: 0, look: [0, 2.2, -10], time: 26,
      radio: "아파트 거리! 공수부대가 지붕에서 강하한다, 위를 봐라!",
      picks: [[-3.0, 6.0, "grenade"], [3.2, 6.6, "life"]],
      members: [
        { role: "weak", lat: -5.4, dep: 8.4, cover: "barrier" },
        { role: "tough", lat: 4.8, dep: 9.2, cover: "sandbag" },
        { air: "para", role: "para", lat: -3.6, dep: 14.0, y: 7.4, land: [-4.4, 11.4] },
        { air: "para", role: "para", lat: 2.2, dep: 15.4, y: 8.0, land: [1.8, 12.4] },
        { air: "para", role: "para", lat: 6.0, dep: 13.6, y: 7.0, land: [5.6, 11.0] }
      ]
    },
    {
      id: 3, zone: "PY", hold: [0, -6], yaw: 0, look: [0, 2.6, 6], time: 28,
      radio: "전차 정류장 일대에 적 헬기! 사수를 먼저 떨어뜨려라!",
      picks: [[-3.4, 5.8, "shotgun"], [3.6, 6.4, "ammo"]],
      members: [
        { role: "weak", lat: -6.0, dep: 7.6, cover: "crate" },
        { role: "throw", lat: -1.2, dep: 10.4, cover: "sandbag" },
        { role: "weak", lat: 5.2, dep: 8.6, cover: "barrier" },
        { role: "hostage", lat: 2.0, dep: 11.8 },
        { role: "weak", lat: -4.0, dep: 12.8, cover: "crate", bike: true, run: { from: [3.0, 30.0], dur: 2.8, delay: 1.0 } },
        { air: "heli", lat: 1.0, dep: 20.0, y: 10.0, orbit: 6.0 }
      ]
    },
    {
      id: 4, zone: "ARCH", hold: [0, 10], yaw: 0, look: [0, 3.6, 24], time: 28,
      radio: "개선 아치 앞이다! 아치 기둥 뒤 적 기관총좌, 측면부터!",
      picks: [[-4.4, 5.6, "supply"], [4.4, 6.0, "grenade"]],
      members: [
        { role: "tough", lat: -6.8, dep: 9.4, cover: "heavy" },
        { role: "weak", lat: -2.6, dep: 11.2, cover: "sandbag" },
        { role: "weak", lat: 2.8, dep: 10.6, cover: "sandbag" },
        { role: "tough", lat: 6.8, dep: 9.6, cover: "heavy" },
        { role: "throw", lat: -4.6, dep: 12.6, cover: "barrier" }
      ]
    },
    {
      id: 5, zone: "SQUARE", hold: [0, 32], yaw: 0.45, look: [8, 2.2, 46], time: 28,
      radio: "아치 통과! 광장 입구, 차량 뒤에 적 보병!",
      picks: [[-3.0, 6.0, "ammo"], [3.4, 6.8, "smg"]],
      members: [
        { role: "weak", lat: -4.8, dep: 8.6, elev: 1.05, cover: "truckbed" },
        { role: "tough", lat: 2.2, dep: 10.0, cover: "barrier" },
        { role: "weak", lat: 6.4, dep: 9.0, cover: "crate" },
        { role: "throw", lat: -0.8, dep: 12.4, cover: "sandbag" },
        { role: "hostage", lat: 4.0, dep: 13.0 }
      ]
    },
    {
      id: 6, zone: "SQUARE", hold: [10, 47], yaw: 0.55, look: [17, 2.6, 60], time: 30,
      radio: "광장 상공에 낙하산 다수! 착지 전에 끊어라!",
      picks: [[-3.2, 5.8, "life"], [3.2, 6.2, "shotgun"]],
      members: [
        { role: "weak", lat: -5.0, dep: 8.0, cover: "sandbag" },
        { role: "weak", lat: 4.6, dep: 8.8, cover: "barrier" },
        { air: "para", role: "para", lat: -3.0, dep: 13.6, y: 8.0, land: [-3.6, 11.0] },
        { air: "para", role: "para", lat: 1.4, dep: 15.0, y: 8.6, land: [1.0, 12.0] },
        { air: "para", role: "para", lat: 5.4, dep: 13.0, y: 7.6, land: [5.0, 10.6] },
        { air: "para", role: "para", lat: -0.6, dep: 17.0, y: 9.0, land: [-1.0, 13.4] }
      ]
    },
    {
      id: 7, zone: "SQUARE", hold: [16, 60], yaw: 0, look: [16, 2.4, 74], time: 32,
      radio: "광장 중앙! 기념탑 앞에 적 주력, 헬기 접근 중!",
      picks: [[-4.6, 5.8, "supply"], [4.8, 6.2, "grenade"]],
      members: [
        { role: "tough", lat: -6.6, dep: 8.0, cover: "heavy" },
        { role: "weak", lat: -2.4, dep: 10.4, cover: "barrier" },
        { role: "throw", lat: 2.6, dep: 9.4, cover: "crate" },
        { role: "weak", lat: 6.8, dep: 8.2, cover: "sandbag" },
        { air: "heli", lat: 2.0, dep: 22.0, y: 10.4, orbit: 6.4 }
      ]
    }
  ];
  const BOSS3 = {
    hold: [16, 60], look: [16, 2.4, 70],
    spots: [[-5.6, 10.4], [-0.6, 9.6], [4.6, 10.2]]
  };

  /* ============================================================
     STAGE 5 — 압록강 · 백두산 (v19)
     A riverside forest trail on the Yalu from a boundary stele, motorcycle
     patrols, a steel truss bridge over the gorge, a rocky alpine plateau with
     a watchtower, and the Cheonji viewpoint under the snowcapped crater of
     Paektu. Boss: a tank, with a helicopter overhead.
     ============================================================ */
  const PATH5 = [
    /* (v20) the jeep chase down the border road comes first */
    [0, -152], [0, -144], [0, -136], [0.6, -128], [1.2, -120], [1.0, -112], [0.2, -104], [-0.6, -96], [-0.8, -88], [-0.4, -80],
    [0, -72], [0, -64], [0, -58], [0, -52],
    [0, -46], [0, -40], [0, -34], [0, -28], [0, -22], [0, -16], [0, -10], [0, -4],
    [0, 2], [0, 8], [0, 14], [0, 20], [0, 26], [0, 32], [0, 38], [0.8, 44], [2.4, 50],
    [4, 56], [5, 62], [6, 66], [6, 70]
  ];
  const WAVES5 = [
    {
      id: 1, zone: "YALU", hold: [0, -38], yaw: 0, look: [0, 1.7, -26], time: 26,
      radio: "압록강 국경 초소다! 경계병 제압, 강변 숲길로 진입하라!",
      picks: [[-3.6, 6.2, "ammo"], [3.8, 6.8, "smg"]],
      members: [
        { role: "weak", lat: -4.4, dep: 9.4, cover: "sandbag" },
        { role: "tough", lat: 0.8, dep: 11.8, cover: "barrier" },
        { role: "weak", lat: 4.6, dep: 10.0, cover: "crate" },
        { role: "throw", lat: -1.6, dep: 13.8, cover: "sandbag" }
      ]
    },
    {
      id: 2, zone: "YALU", hold: [0, -22], yaw: 0, look: [0, 1.8, -8], time: 28,
      radio: "오토바이 정찰대 접근! 달려오는 놈부터 떨어뜨려라!",
      picks: [[-3.0, 6.0, "grenade"], [3.2, 6.6, "life"]],
      members: [
        { role: "weak", lat: -5.0, dep: 9.6, cover: "sandbag" },
        { role: "weak", lat: 4.8, dep: 10.4, cover: "barrier" },
        { role: "weak", lat: -2.0, dep: 12.4, cover: "crate", bike: true, run: { from: [-1.0, 12.0], dur: 2.4, delay: 0.6 } },
        { role: "tough", lat: 2.4, dep: 13.2, cover: "sandbag", bike: true, run: { from: [1.6, 14.0], dur: 2.6, delay: 2.4 } }
      ]
    },
    {
      id: 3, zone: "BRIDGE", hold: [0, -6], yaw: 0, look: [0, 2.6, 8], time: 28,
      radio: "철교 입구! 상공에 적 헬기, 교두보 확보!",
      picks: [[-3.4, 5.8, "shotgun"], [3.6, 6.4, "ammo"]],
      members: [
        { role: "weak", lat: -4.6, dep: 8.2, cover: "barrier" },
        { role: "throw", lat: 1.2, dep: 10.2, cover: "sandbag" },
        { role: "weak", lat: 4.4, dep: 8.8, cover: "crate" },
        { air: "heli", lat: 0.6, dep: 22.0, y: 9.8, orbit: 6.0 }
      ]
    },
    {
      id: 4, zone: "BRIDGE", hold: [0, 14], yaw: 0, look: [0, 2.2, 34], time: 30,
      radio: "다리 위다, 엄폐물이 없다! 건너편 교두보를 빨리 쓸어라!",
      picks: [[-1.8, 4.0, "supply"], [1.8, 6.0, "grenade"]],
      members: [
        /* (v21) all on the far bank: nothing may stand off the deck over the
           river, and the truss must not hide anyone */
        { role: "weak", lat: -2.0, dep: 19.5, cover: "sandbag" },
        { role: "weak", lat: 2.1, dep: 20.5, cover: "crate" },
        { role: "tough", lat: 5.4, dep: 25.0, cover: "sandbag" },
        { role: "weak", lat: -5.6, dep: 25.4, cover: "crate", bike: true, run: { from: [-12.0, 50.0], dur: 3.6, delay: 1.2 } }
      ]
    },
    {
      id: 5, zone: "PAEKTU", hold: [0, 38], yaw: 0, look: [2, 2.0, 52], time: 28,
      radio: "고원 입구! 바위 지대 곳곳에 적, 감시탑 사수 주의!",
      picks: [[-3.0, 6.0, "ammo"], [3.4, 6.8, "shotgun"]],
      members: [
        { role: "weak", lat: -5.2, dep: 9.0, cover: "barrier" },
        { role: "tough", lat: 3.8, dep: 10.4, cover: "heavy" },
        { role: "throw", lat: -0.8, dep: 12.4, cover: "sandbag" },
        { role: "weak", lat: 6.4, dep: 12.0, cover: "crate", bike: true, run: { from: [14.0, 58.0], dur: 2.6, delay: 1.0 } }
      ]
    },
    {
      id: 6, zone: "PAEKTU", hold: [4, 56], yaw: 0.1, look: [6, 2.6, 70], time: 30,
      radio: "공수부대 강하! 천지 전망대까지 밀어붙여라!",
      picks: [[-3.2, 5.8, "life"], [3.2, 6.2, "grenade"]],
      members: [
        { role: "weak", lat: -4.8, dep: 8.2, cover: "sandbag" },
        { role: "weak", lat: 4.4, dep: 8.8, cover: "barrier" },
        { air: "para", role: "para", lat: -2.4, dep: 13.6, y: 8.0, land: [-3.0, 11.0] },
        { air: "para", role: "para", lat: 2.0, dep: 15.0, y: 8.6, land: [1.8, 12.0] },
        { air: "para", role: "para", lat: 5.6, dep: 13.0, y: 7.6, land: [5.2, 10.6] }
      ]
    },
    {
      id: 7, zone: "CHEONJI", hold: [6, 70], yaw: 0, look: [6, 3.0, 86], time: 32,
      radio: "천지 전망대! 마지막 적 주력이다, 헬기 접근!",
      picks: [[-4.6, 5.8, "supply"], [4.8, 6.2, "grenade"]],
      members: [
        { role: "tough", lat: -6.4, dep: 8.2, cover: "heavy" },
        { role: "weak", lat: -2.2, dep: 10.2, cover: "barrier" },
        { role: "throw", lat: 2.6, dep: 9.4, cover: "crate" },
        { role: "weak", lat: 6.6, dep: 8.4, cover: "sandbag" },
        { air: "heli", lat: 1.0, dep: 22.0, y: 10.6, orbit: 6.4 }
      ]
    }
  ];
  const BOSS5 = {
    hold: [6, 70], look: [6, 2.4, 82],
    spots: [[-5.6, 11.4], [-0.6, 10.6], [4.6, 11.2]]
  };

  const BOSS2 = {
    hold: [-18, 52], look: [-18, 2.4, 64],
    spots: [[-5.6, 12.6], [-0.6, 11.8], [4.6, 12.4]]
  };

  const CITY_Z0 = -62, CITY_Z1 = 62;
  const cityX = (z) => Math.sin(z / 26) * 1.1;
  /* (v26) a city avenue that turns corners. Everything is still laid out
     along one straight local avenue; past each turn z the rest of it swings
     by the turn angle round the crossing. Leg k = number of turns passed. */
  function cityLeg(turns, z) { let k = 0; (turns || []).forEach((t) => { if (z > t[0]) k++; }); return k; }
  function cityTurnXZ(turns, k, x, z) {
    for (let i = k - 1; i >= 0; i--) {
      const tz = turns[i][0], th = turns[i][1], px = cityX(tz);
      const dx = x - px, dz = z - tz, c = Math.cos(th), sn = Math.sin(th);
      x = px + dx * c + dz * sn;
      z = tz - dx * sn + dz * c;
    }
    return [+x.toFixed(3), +z.toFixed(3)];
  }
  function cityYaw(turns, k) { let a = 0; for (let i = 0; i < k; i++) a += turns[i][1]; return a; }
  function bendCityStage(st) {
    const T_ = st.city && st.city.turns;
    if (!T_ || !T_.length) return;
    st.path = st.path.map(([x, z]) => cityTurnXZ(T_, cityLeg(T_, z), x, z));
    st.waves.forEach((w) => {
      const k = cityLeg(T_, w.hold[1]);
      const f = (x, z) => cityTurnXZ(T_, k, x, z);
      w.hold = f(w.hold[0], w.hold[1]);
      const lk = f(w.look[0], w.look[2]);
      w.look = [lk[0], w.look[1], lk[1]];
      w.yaw = (w.yaw || 0) + cityYaw(T_, k);
      (w.members || []).forEach((m) => {
        if (m.run && m.run.from) m.run = Object.assign({}, m.run, { from: f(m.run.from[0], m.run.from[1]) });
        if (m.car && m.car.path) m.car = Object.assign({}, m.car, { path: m.car.path.map((q) => f(q[0], q[1])) });
      });
    });
    const b = st.boss, k = cityLeg(T_, b.hold[1]);
    const h = cityTurnXZ(T_, k, b.hold[0], b.hold[1]), l = cityTurnXZ(T_, k, b.look[0], b.look[2]);
    st.boss = Object.assign({}, b, { hold: h, look: [l[0], b.look[1], l[1]], yaw: cityYaw(T_, k) });
  }
  const STAGES = {
    /* ---- CHAPTER 1: 남침 — the line falls back south ---- */
    6: {
      id: 6, refugees: true, music: "fall", label: "STAGE 1-1", clock: 360, path: PATH1, boss: BOSS1,
      waves: WAVES1.map((w, i) => Object.assign({}, w, { radio: [
        "새벽 4시, 적의 전면 남침! 서울 도심까지 밀고 들어왔다!",
        "시민 대피가 먼저다! 대로의 적부터 막아라!",
        "골목으로 적이 쏟아진다! 엄폐하며 후퇴로를 지켜라!",
        "적 공수부대 강하! 한강 쪽 퇴로가 위험하다!",
        "불타는 건물 사이로 적 증원! 버텨라!",
        "광장이 함락 직전이다! 마지막 시민들이 빠져나간다!",
        "적 주력 진입! 한강 이남으로 철수 준비!"
      ][i % 7] })),
      dress: "seoulFall", bossKind: "apc", bossTank: true, bossHp: 90,
      introDur: 4.4,
      introCam: [[9.0, 13.5, -28.0, 0, 8.0, 40.0], [0, 1.68, -10.0, 0, 1.55, 3.5]],
      introLines: [
        { t: 0.4, text: "20XX년 6월. 적이 기습 남침했다. 서울이 불타고 있다." },
        { t: 2.3, text: "시민들이 피할 시간을 벌어라. 버틸 수 있는 데까지 버텨라!" }
      ],
      bossRadio: "적 전차가 도심에 진입했다! 포구가 빛나면 포구를, 약점은 앞쪽 흡기구!"
    },
    7: {
      id: 7, refugees: true, music: "retreat", label: "STAGE 1-2", clock: 380, path: cityPath(), boss: cityBoss(),
      waves: genWaves(707, ["DAEJEON STN", "EXPO-RO", "GAPCHEON"], [
        "대전 사수! 지연전으로 시간을 벌어라!", "엑스포로에 적 정찰 오토바이!", "상공에 적 헬기! 다리 쪽 엄폐!",
        "민간인 대피 중, 오사 주의!", "적 증원 접근! 교차로를 지켜라!", "갑천 방면 적 헬기 재접근!", "공수부대 강하! 지휘소를 지켜라!"], { bikes: true, hostage: true }),
      dress: "citygen", bossKind: "man", bossHp: 18,
      city: {
        seed: 7, mood: "morning", tall: 14, tints: [0xdfe8f0, 0xe6e2d8, 0xa8b4c0], sign: [-12.4, -44, "대전광역시", "DAEJEON", Math.PI / 2, "#2f8a4a"],
        cars: [["bus", 7.6, -12, 0, "152"], ["police", -7.4, 26, Math.PI]],
        banners: [[-12.2, 4, "과학도시 대전", "#2a5aa8"], [12.2, 36, "대전 사수", "#a82a2a"]],
        hills: [[0, 170, 240, 50, 30], [-90, 120, 80, 60, 24]],
        landmarks: [["monorail", -8.2, -60, -34], ["fountain", 16, 70, 4.2, true], ["tower", 0, 112, 56, "hanbit"], ["dome", -30, 86, 13], ["pavilion", 30, 84, 9, 5, {}], ["glass", [[-30, 78, 10, 10, 26, 0], [34, 82, 12, 10, 34, 1], [52, 120, 10, 10, 40, 2], [-56, 130, 12, 10, 30, 1]]]]
      },
      introDur: 4.2, introCam: [[7, 14, -84, 0, 10, 20], [0.0, 1.68, -62, 0, 1.55, -48]],
      introLines: [{ t: 0.4, text: "서울 함락. 전선은 대전까지 밀렸다." }, { t: 2.2, text: "대전역 일대에서 적의 남하를 지연시켜라!" }],
      bossRadio: "적 선봉 지휘관 확인! 엄폐물 사이를 옮겨 다닌다, 머리를 노려라!"
    },
    8: {
      id: 8, refugees: true, music: "retreat", label: "STAGE 1-3", clock: 380, path: cityPath(), boss: cityBoss(),
      waves: genWaves(808, ["DONGSEONG-RO", "STADIUM", "PALGONG"], [
        "대구 방어선이다! 한 발짝도 물러서지 마라!", "적 오토바이 돌격조!", "적 헬기가 고가도로 위로 넘어온다!",
        "피난민 사이에 숨은 적, 오사 주의!", "적 박격포 진지 발견!", "적 헬기 재접근! 경기장 쪽!", "적 공수 강하! 마지막 블록을 지켜라!"], { bikes: true, hostage: true }),
      dress: "citygen", bossKind: "apc", bossHp: 70,
      city: {
        seed: 8, mood: "dusk", cherry: true, tints: [0xeadcc8, 0xf0e0c0, 0xc8b8a8], sign: [12.4, -44, "대구광역시", "DAEGU", -Math.PI / 2, "#2f8a4a"],
        cars: [["truck", 7.8, 8, 0.05], ["bus", -7.6, -20, Math.PI, "410"]],
        banners: [[12.2, -6, "대구, 더 큰 미래로", "#c22a6a", 9], [-12.2, 30, "낙동강 방어선", "#a82a2a"]],
        hills: [[0, 175, 260, 60, 34], [70, 140, 80, 60, 22]],
        landmarks: [["market", -11.6, -56, -32, 81], ["market", 11.6, -20, 16, 82], ["tower", 6, 150, 74, "slim"], ["stadium", -56, 100, 24, 16], ["pavilion", 30, 84, 10, 6, { wall: 4 }], ["overpass", 40], ["glass", [[-34, 80, 10, 10, 22, 0], [30, 120, 10, 10, 28, 1]]]]
      },
      introDur: 4.2, introCam: [[-7, 14, -84, 0, 10, 20], [0.0, 1.68, -62, 0, 1.55, -48]],
      introLines: [{ t: 0.4, text: "낙동강 방어선. 대구가 뚫리면 끝이다." }, { t: 2.2, text: "시가지로 침투한 적을 몰아내라!" }],
      bossRadio: "적 장갑차 돌입! 일반 탄은 튕긴다, 앞쪽 흡기구와 수류탄!"
    },
    9: {
      id: 9, refugees: true, music: "retreat", label: "STAGE 1-4", clock: 380, path: cityPath(), boss: cityBoss(),
      waves: genWaves(909, ["GEUMNAM-RO", "PLAZA", "MUDEUNG"], [
        "호남 방면 적 우회 부대! 광주를 지켜라!", "금남로에 적 오토바이!", "적 헬기 출현! 광장 엄폐!",
        "시민 대피 중, 오사 주의!", "적 증원, 기념탑 방향!", "적 헬기 재접근!", "적 공수 강하! 무등산 방면 퇴로 확보!"], { bikes: true, hostage: true }),
      dress: "citygen", bossKind: "heli", bossHp: 40,
      city: {
        seed: 9, mood: "overcast", tall: 8, tints: [0xd8d4cc, 0xe8e0d0, 0xb8b0a4], sign: [-12.4, -44, "광주광역시", "GWANGJU CITY", Math.PI / 2, "#d8302a"],
        cars: [["bus", 7.6, -16, 0, "518"], ["police", -7.4, 20, Math.PI]],
        banners: [[-12.2, 0, "빛고을 광주", "#2a5aa8"], [12.2, 30, "광주 사수", "#a82a2a"]],
        hills: [[0, 190, 280, 70, 46], [-80, 150, 90, 60, 28]],
        landmarks: [["fountain", 0, 74, 6.5], ["twin", 0, 104, 40], ["pavilion", 30, 82, 10, 6, { wall: 3, rail: 1 }], ["tower", -40, 200, 46, "slim"], ["glass", [[-30, 80, 10, 10, 24, 1], [36, 130, 10, 10, 28, 0]]]]
      },
      introDur: 4.2, introCam: [[7, 14, -84, 0, 10, 20], [0.0, 1.68, -62, 0, 1.55, -48]],
      introLines: [{ t: 0.4, text: "적이 호남으로 우회해 광주까지 내려왔다." }, { t: 2.2, text: "금남로를 따라 적을 저지하라!" }],
      bossRadio: "광주 상공에 적 공격헬기! 로켓 충전이 보이면 집중 사격!"
    },
    10: {
      id: 10, refugees: true, music: "heritage", label: "STAGE 1-5", clock: 380, path: cityPath(), boss: cityBoss(),
      waves: genWaves(1010, ["DAEREUNGWON", "CHEOMSEONG", "BULGUKSA"], [
        "천년 고도 경주! 문화재를 지키며 적을 막아라!", "적 오토바이가 돌담길로!", "적 헬기 출현! 석탑 뒤로 엄폐!",
        "관광객 대피 중, 오사 주의!", "적 증원, 첨성대 방향!", "적 헬기 재접근!", "적 공수 강하! 탑 앞 광장을 지켜라!"], { bikes: true, hostage: true }),
      dress: "citygen", bossKind: "man", bossHp: 20,
      city: {
        seed: 10, mood: "day", paved: true, hanok: true, low: true, cherry: true,
        sign: [12.4, -44, "경주", "Gyeongju", -Math.PI / 2, "#8a5a2a"],
        cars: [],
        banners: [[-12.2, -10, "경주", "#2a4aa8", 8], [12.2, 6, "경주", "#c22a2a", 8], [-12.2, 34, "천년고도", "#2a6a3a", 8]],
        hills: [[0, 170, 280, 70, 32], [-80, 120, 80, 60, 26], [80, 120, 80, 60, 24]],
        landmarks: [["tumuli", [[-40, -30, 14], [-52, 6, 18], [44, -10, 16], [56, 30, 20], [-46, 44, 12]]], ["lanterns", -58, 50, 12], ["pagoda", 4, 88, 1.8, 5], ["observatory", 26, 74, 1.2], ["pavilion", -28, 78, 14, 7, {}], ["pagoda", -40, 130, 1.2, 3], ["pavilion", 20, 140, 18, 8, { wall: 2 }]]
      },
      introDur: 4.2, introCam: [[7, 14, -84, 0, 10, 20], [0.0, 1.68, -62, 0, 1.55, -48]],
      introLines: [{ t: 0.4, text: "동부 전선, 적이 경주까지 다가왔다." }, { t: 2.2, text: "천년 고도의 탑과 대를 지켜내라!" }],
      bossRadio: "적 지휘관이 탑 앞 광장에 숨었다! 머리를 노려라!"
    },
    11: {
      id: 11, refugees: true, music: "perimeter", label: "STAGE 1-6", clock: 400, path: cityPath(), boss: cityBoss(),
      waves: genWaves(1111, ["HAEUNDAE", "GWANGALLI", "PERIMETER"], [
        "부산 교두보, 최후 방어선이다! 여기서 물러설 곳은 없다!", "해변 도로로 적 오토바이!", "바다 위로 적 헬기!",
        "피난민 다수, 오사 주의!", "적 증원, 등대 방향!", "적 헬기 재접근!", "적 공수 강하! 이 선을 지켜라, 반격이 온다!"], { bikes: true, hostage: true, paras: true }),
      dress: "citygen", bossKind: "apc", bossTank: true, bossHp: 110,
      city: {
        seed: 11, mood: "day", seaSide: true, tall: 16, tints: [0xf0f0ec, 0xe0e8f0, 0xc0ccd8], sign: [-12.4, -44, "부산", "BUSAN", Math.PI / 2, "#2a5aa8"],
        cars: [["truck", -7.8, -8, Math.PI], ["police", -7.4, 24, Math.PI]],
        banners: [[-12.2, 6, "부산", "#c22a2a", 9], [-12.2, 40, "최후 방어선", "#2a4aa8"]],
        hills: [[-60, 170, 220, 70, 40]],
        landmarks: [["market", -11.6, -56, -32, 83], ["cranes", [[150, -40, 0.3], [168, -10, 0.3], [186, 20, 0.3]]], ["boats", [[34, -40, 0.4, 0x2a5aa8], [48, -10, -0.6, 0xc8382a], [30, 14, 1.2, 0x2a8a5a], [60, 34, 0.2, 0xe8b830]]], ["suspension", 120, 70, -0.25, 40, 260], ["lighthouse", 44, 46, 0xc8302a], ["ship", 70, 20, 0.6, 31, 0.6], ["ship", 140, 160, -0.3, 52, 0.8],
          ["glass", [[-30, 80, 10, 10, 40, 0], [-44, 60, 10, 10, 52, 1], [-32, 110, 12, 12, 60, 2], [-56, 96, 10, 10, 46, 0], [-46, 140, 12, 10, 56, 1]]]]
      },
      introDur: 4.4, introCam: [[20, 16, -84, 0, 8, 30], [0.0, 1.68, -62, 0, 1.55, -48]],
      introLines: [{ t: 0.4, text: "낙동강 최후 방어선, 부산." }, { t: 2.2, text: "반격의 그날까지, 이 해안을 반드시 지켜라!" }],
      bossRadio: "적 주력 전차가 해안도로로! 포구를 막고 흡기구를 노려라!"
    },
    /* ---- CHAPTER 2: 반격 — Incheon, then Seoul again ---- */
    12: {
      id: 12, music: "landing", label: "STAGE 2-1", clock: 420,
      path: cityPath([[0, -152], [0, -144], [0.4, -136], [0.8, -128], [0.6, -120], [0, -112], [-0.6, -104], [-0.6, -96], [0, -88], [0, -80], [0, -74], [0, -68]]),
      boss: cityBoss(), chase: "boat",
      waves: genWaves(1212, ["BEACH", "SONGDO", "CENTRAL PARK"], [
        "상륙 성공! 해안 교두보를 확보하라!", "적 오토바이 반격조!", "적 헬기 출현! 교두보 엄폐!",
        "시민 구출 우선, 오사 주의!", "적 증원, 센트럴파크 방향!", "적 헬기 재접근!", "적 공수 강하! 인천을 되찾아라!"], { bikes: true, hostage: true }),
      dress: "citygen", bossKind: "heli", bossHp: 46,
      city: {
        seed: 12, mood: "day", sea: true, cherry: true, tall: 18, tints: [0xe8f0f8, 0xd8e4ee, 0xb0c4d4], sign: [-12.4, -40, "인천 송도", "Incheon Songdo", Math.PI / 2, "#2a6ab8"],
        cars: [["police", -7.4, 24, Math.PI]],
        banners: [[12.2, -20, "인천상륙작전", "#2a4aa8", 9], [-12.2, 20, "인천", "#c22a2a"]],
        hills: [[-120, 220, 200, 60, 30]],
        landmarks: [["beach", -72, -56], ["hedgehogs", [[-6, -66], [5, -64], [-9, -60], [8, -60], [-4, -61], [11, -67], [-12, -64]]],
          ["fire", -18, 0.4, -58, 1.4], ["fire", 16, 0.4, -54, 1.2],
          ["ship", -46, -150, 0.25, 52, 1.1], ["ship", 56, -178, -0.3, 31, 0.9], ["ship", -90, -210, 0.1, 17, 0.8],
          ["taper", 10, 168, 96], ["sculptureS", 30, 82, 1.5], ["cranes", [[-150, -40, -0.2], [-130, -10, -0.2]]], ["fountain", -16, 74, 4], ["suspension", 0, 230, 0, 44, 300],
          ["glass", [[-30, 80, 10, 10, 46, 0], [34, 100, 12, 10, 60, 1], [-40, 120, 12, 12, 70, 2], [44, 140, 10, 10, 64, 0], [-24, 160, 10, 12, 80, 1], [60, 180, 12, 12, 56, 2], [-60, 170, 10, 10, 50, 0]]]]
      },
      introDur: 5.0, introCam: [[-24, 18, -190, 0, 4, -100], [0, 1.68, -152, 0, 1.55, -138]],
      introLines: [{ t: 0.4, text: "20XX년 9월 15일, 인천 상륙작전 개시!" }, { t: 2.4, text: "상륙정 전진! 해안의 적을 쓸고 인천을 되찾아라!" }],
      bossRadio: "송도 상공에 적 공격헬기! 기체에 집중 사격!"
    },
    1: {
      id: 1, music: "seoul", label: "STAGE 2-2", clock: 360, path: PATH1, waves: WAVES1, boss: BOSS1,
      dress: "city", bossKind: "man",
      introDur: 4.2,
      introCam: [[9.0, 11.5, -26.0, 0, 7.0, 40.0], [0, 1.68, -10.0, 0, 1.55, 3.5]],
      introLines: [
        { t: 0.4, text: "인천 상륙 성공! 전군, 서울로 진격한다." },
        { t: 2.2, text: "서울역 방면으로 진격해 숭례문을 되찾아라. 민간인 오사에 주의!" }
      ],
      bossRadio: "적 지휘관 확인! 엄폐물 사이를 옮겨 다닌다, 머리를 노려라!"
    },
    3: {
      id: 3, music: "summit", label: "STAGE 3-2", clock: 380, path: PATH_S, waves: WAVES_S, boss: BOSS_S,
      dress: "summit", bossKind: "heli", bossHp: 46,
      introDur: 4.0,
      introCam: [[7.0, 10.0, -60.0, 0, 5.0, -10.0], [0, 1.68, -44.0, 0, 1.55, -30.0]],
      introLines: [
        { t: 0.4, text: "여기는 본부. 판문점 평화의 집 일대에 적 특수부대가 침투했다." },
        { t: 2.2, text: "도보다리를 건너 군사분계선을 넘어 판문각을 확보하라!" }
      ],
      bossRadio: "판문각 상공에 적 공격헬기! 기총 소사를 피해 기체를 집중 사격하라!"
    },
    5: {
      id: 5, music: "paektu", label: "STAGE 3-4", clock: 400, path: PATH5, waves: WAVES5, boss: BOSS5,
      dress: "paektu", bossKind: "commander", bossHp: 40, chase: true,
      introDur: 5.2,
      introCam: [[7.0, 9.0, -176.0, 0, 1.0, -128.0], [0, 1.68, -152.0, 0, 1.55, -138.0]],
      introLines: [
        { t: 0.4, text: "여기는 본부. 평양 광장 확보 완료. 마지막 작전이다." },
        { t: 2.2, text: "지프로 국경 도로를 돌파해 압록강, 백두산 천지까지 진격하라!" }
      ],
      bossRadio: "천지 전망대에 적 총사령관 확인! 경호원을 쓰러뜨리고 사령관을 제압하라!"
    },
    4: {
      id: 4, music: "pyongyang", label: "STAGE 3-3", clock: 380, path: PATH3, waves: WAVES3, boss: BOSS3,
      dress: "pyongyang", bossKind: "apc", bossTank: true, bossHp: 110,
      introDur: 4.0,
      introCam: [[-8.0, 9.0, -58.0, 0, 6.0, -6.0], [0, 1.68, -44.0, 0, 1.55, -30.0]],
      introLines: [
        { t: 0.4, text: "여기는 본부. 판문각 확보 완료. 전군 북진한다." },
        { t: 2.2, text: "눈보라를 뚫고 평양 시가로 진입하라. 목표는 중앙 광장!" }
      ],
      bossRadio: "광장에 적 주력 전차! 포구를 막고 앞쪽 흡기구를 노려라!"
    },
    2: {
      id: 2, music: "dmz", label: "STAGE 3-1", clock: 360, path: PATH2, waves: WAVES2, boss: BOSS2,
      dress: "dmz", bossKind: "apc", bossHp: 60,
      bossRadio: "중장갑 차량 확인! 일반 탄은 튕긴다, 앞쪽 흡기구와 수류탄!",
      introDur: 3.8,
      introCam: [[6.8, 6.4, -50.0, 0.5, 8.6, -6.0], [0, 1.68, -44.0, 0, 1.55, -30.0]],
      introLines: [
        { t: 0.45, text: "여기는 본부. 서울 도심 탈환에 성공했다. 수고했다." },
        { t: 2.05, text: "지금 즉시 비무장지대(DMZ) 남방한계선을 돌파해 판문점(JSA)을 확보하라!" }
      ]
    }
  };  /* (v26) the new cities turn corners like real streets: right then left,
     or left then right, at the two side streets (z -26 and 22) */
  (function () {
    const H = Math.PI / 2;
    const TT = { 7: [[-26, H], [22, -H]], 8: [[-26, -H], [22, H]], 9: [[-26, H], [22, -H]], 10: [[-26, -H], [22, H]], 11: [[-26, -H], [22, H]], 12: [[-26, H], [22, -H]] };
    Object.keys(TT).forEach((id) => { const st = STAGES[id]; if (st && st.city) { st.city.turns = TT[id]; bendCityStage(st); } });
  })();

  let STAGE = STAGES[1];
  let stageId = 1;
  let PATH_PTS = STAGE.path;
  let WAVE_DEFS = STAGE.waves;
  let BOSS_DEF = STAGE.boss;

  function setStage(n) {
    stageId = STAGES[n] ? n : 1;
    STAGE = STAGES[stageId];
    PATH_PTS = STAGE.path;
    WAVE_DEFS = STAGE.waves;
    BOSS_DEF = STAGE.boss;
    CLOCK0 = STAGE.clock;
    curve = null;
    waves.length = 0;
    bossPost = null;
    bossStage = null;
    pathU = 0;
    bossU = 0;
  }

  /* ---------------- rail helpers ---------------- */
  let curve = null;
  let pathLen = 1;
  let pathU = 0;
  let bossHold = { x: YARD_MID, z: BOSS_DEF.hold[1] };
  let bossYaw = 0;
  let bossU = 0;

  function buildRail() {
    if (curve) return;
    const pts = PATH_PTS.map(([x, z]) => new T.Vector3(x, CAM_Y, z));
    curve = new T.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
    window.__railCurve = curve;
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

  /* ---- the rail never walks through anything solid ----
     Every solid thing near the rail (wave cover, crates, barriers, parked
     vehicles, tree trunks, wall pieces) is boxed once per stage. While the
     camera moves, the boxes that sit across the next few metres of track push
     it sideways onto the open side; the offset eases in and out, so it reads as
     the player stepping round the obstacle instead of passing through it. */
  let railBlockers = [];
  let steerOff = 0;
  const _bb = new T.Box3(), _sz = new T.Vector3();
  /* small street dressing (cones, hydrants, planters, crates, drums) that a
     wave's cover or a vehicle was later put on top of is hidden, so nothing
     stands inside anything else */
  function declutter() {
    if (!dress || !dress.root) return;
    dress.root.updateMatrixWorld(true);
    if (coverRoot) coverRoot.updateMatrixWorld(true);
    const big = [];
    const box = (o) => new T.Box3().setFromObject(o);
    if (coverRoot) coverRoot.children.forEach((g) => g.children.forEach((c) => big.push(box(c))));
    const smalls = [];
    dress.root.children.forEach((o) => {
      if (o.isInstancedMesh || !o.visible) return;
      const b = box(o);
      if (b.isEmpty()) return;
      const sz = new T.Vector3(); b.getSize(sz);
      /* (v21) site walls and barriers up to 3.2 m long count as props too */
      if (sz.x <= 3.2 && sz.z <= 3.2 && sz.y <= 1.9 && b.max.y < 2.3) smalls.push([o, b]);
      else if (sz.x < 14 && sz.z < 14 && sz.y > 0.8) big.push(b);
    });
    let hidden = 0;
    const isBarrel = (o) => dress.barrels && dress.barrels.some((b) => b.mesh === o);
    smalls.forEach(([o, b]) => {
      const sh = b.clone().expandByScalar(-0.06);
      if (big.some((B) => B.intersectsBox(sh))) {
        if (isBarrel(o)) return;
        o.visible = false;
        hidden++;
      }
    });
    /* (v21) two covers from different zones that ended up through each
       other: the later one gives way (its man still ducks to his own top) */
    if (coverRoot) {
      const seen = [], drop = [];
      coverRoot.children.forEach((wg) => wg.children.forEach((c) => {
        if (!c.visible) return;
        const b = box(c).expandByScalar(-0.08);
        if (b.isEmpty()) return;
        if (seen.some((B) => B.intersectsBox(b))) { drop.push(c); return; }
        seen.push(b);
      }));
      /* removed, not hidden: a hidden prop would still stop bullets */
      drop.forEach((c) => { c.parent && c.parent.remove(c); hidden++; });
    }
    window.__declutter = hidden;
  }
  function buildRailBlockers(ctx) {
    railBlockers = [];
    if (!curve) return;
    const samples = [];
    for (let i = 0; i <= 240; i++) samples.push(curve.getPointAt(i / 240));
    const roots = [];
    if (coverRoot) roots.push(coverRoot);
    if (dress && dress.root) roots.push(dress.root);
    roots.forEach((root) => root.updateMatrixWorld(true));
    roots.forEach((root) => root.traverse((o) => {
      if (!o.isMesh || !o.visible || !o.geometry) return;
      if (o.userData && o.userData.noBlock) return;
      _bb.setFromObject(o);
      _bb.getSize(_sz);
      /* things you would walk into: reaching from below the knee to above it,
         not ground plates, not overhead signs, not whole city blocks */
      if (_bb.min.y > 1.75 || _bb.max.y < 0.45) return;
      if (_sz.x > 40 || _sz.z > 40) return;
      if (_sz.x < 0.05 && _sz.z < 0.05) return;
      let near = false;
      for (let i = 0; i < samples.length; i++) {
        const q = samples[i];
        if (q.x > _bb.min.x - 2.2 && q.x < _bb.max.x + 2.2 && q.z > _bb.min.z - 2.2 && q.z < _bb.max.z + 2.2) { near = true; break; }
      }
      if (!near) return;
      /* keep an oriented test as well: a long diagonal wall or plane has a
         huge axis box but only a thin footprint */
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      const inv = new T.Matrix4().copy(o.matrixWorld).invert();
      const sc = new T.Vector3().setFromMatrixScale(o.matrixWorld);
      railBlockers.push({ minX: _bb.min.x, maxX: _bb.max.x, minZ: _bb.min.z, maxZ: _bb.max.z, o: o,
        inv: inv, lb: o.geometry.boundingBox.clone(), sx: Math.abs(sc.x) || 1, sy: Math.abs(sc.y) || 1, sz: Math.abs(sc.z) || 1 });
    }));
    /* instanced tree trunks are not meshes of their own: box them by hand */
    ((dress && dress.trunks) || []).forEach(([x, z]) => {
      railBlockers.push({ minX: x - 0.22, maxX: x + 0.22, minZ: z - 0.22, maxZ: z + 0.22 });
    });
    window.__railBlockers = railBlockers.length;
    window.__railBlockList = railBlockers;
  }
  /* The side-step profile is planned once per stage over the whole rail:
     sample the track every 0.25 m, mark which sideways offsets (-4..4 m) are
     clear of every blocker, then pick the cheapest smooth line through the
     clear cells (dynamic programming: stay near the centre, change slowly,
     sit exactly on the rail at every hold). The camera just reads it. */
  const STEER_R = 0.62, STEER_STEP = 0.25, STEER_K = 41, STEER_D = 0.1;
  const _lq = new T.Vector3();
  function blockHit(B, qx, qz) {
    if (!B.inv) return true;
    const lb = B.lb;
    for (const y of [0.7, 1.2, 1.6]) {
      _lq.set(qx, y, qz).applyMatrix4(B.inv);
      const rx = STEER_R / B.sx, ry = STEER_R / B.sy, rz = STEER_R / B.sz;
      if (_lq.x > lb.min.x - rx && _lq.x < lb.max.x + rx &&
          _lq.y > lb.min.y - ry && _lq.y < lb.max.y + ry &&
          _lq.z > lb.min.z - rz && _lq.z < lb.max.z + rz) return true;
    }
    return false;
  }
  let steerProf = null;
  function planSteer(holdUs) {
    steerProf = null;
    if (!curve || !railBlockers.length) return;
    const N = Math.max(2, Math.ceil(pathLen / STEER_STEP));
    const mid = (STEER_K - 1) / 2;
    const free = new Uint8Array((N + 1) * STEER_K);
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const p = curve.getPointAt(u), t = curve.getTangentAt(u);
      const tl = Math.hypot(t.x, t.z) || 1, nx = t.z / tl, nz = -t.x / tl;
      for (let k = 0; k < STEER_K; k++) {
        const o = (k - mid) * STEER_D * 2;
        const qx = p.x + nx * o, qz = p.z + nz * o;
        let ok = 1;
        for (let b = 0; b < railBlockers.length; b++) {
          const B = railBlockers[b];
          if (!(qx > B.minX - STEER_R && qx < B.maxX + STEER_R && qz > B.minZ - STEER_R && qz < B.maxZ + STEER_R)) continue;
          if (blockHit(B, qx, qz)) { ok = 0; break; }
        }
        free[i * STEER_K + k] = ok;
      }
    }
    const holdI = new Set((holdUs || []).map((u) => Math.round(Math.max(0, Math.min(1, u)) * N)));
    const INF = 1e9;
    const cost = new Float64Array((N + 1) * STEER_K).fill(INF);
    const from = new Int16Array((N + 1) * STEER_K).fill(-1);
    for (let k = 0; k < STEER_K; k++) {
      if (k === mid) cost[k] = 0;
    }
    for (let i = 1; i <= N; i++) {
      const isHold = holdI.has(i);
      for (let k = 0; k < STEER_K; k++) {
        if (isHold && k !== mid) continue;
        const o = Math.abs(k - mid) * STEER_D * 2;
        const here = (free[i * STEER_K + k] || isHold ? 0 : 400) + o * 0.35;
        let best = INF, arg = -1;
        for (let dk = -1; dk <= 1; dk++) {
          const pk = k + dk;
          if (pk < 0 || pk >= STEER_K) continue;
          const c = cost[(i - 1) * STEER_K + pk] + dk * dk * 0.08;
          if (c < best) { best = c; arg = pk; }
        }
        cost[i * STEER_K + k] = best + here;
        from[i * STEER_K + k] = arg;
      }
    }
    let k = mid, bestC = INF;
    for (let kk = 0; kk < STEER_K; kk++) if (cost[N * STEER_K + kk] < bestC) { bestC = cost[N * STEER_K + kk]; k = kk; }
    const raw = new Float32Array(N + 1);
    let blocked = 0;
    for (let i = N; i >= 0; i--) {
      raw[i] = (k - mid) * STEER_D * 2;
      if (!free[i * STEER_K + k] && !holdI.has(i)) blocked++;
      if (i > 0) k = from[i * STEER_K + k];
      if (k < 0) k = mid;
    }
    /* a light smoothing pass so the step-in reads as an ease, not a zig-zag;
       holds stay pinned to the rail */
    const prof = new Float32Array(N + 1);
    for (let i = 0; i <= N; i++) {
      if (holdI.has(i)) { prof[i] = 0; continue; }
      let a = 0, w = 0;
      for (let j = -4; j <= 4; j++) {
        const q = i + j;
        if (q < 0 || q > N) continue;
        const ww = 5 - Math.abs(j);
        a += raw[q] * ww; w += ww;
      }
      prof[i] = a / w;
    }
    steerProf = { N: N, prof: prof };
    window.__steerFree = () => { const rows = []; for (let i = 0; i <= N; i++) { let r = ""; for (let kk = 0; kk < STEER_K; kk++) r += free[i * STEER_K + kk] ? "." : "#"; const pt = curve.getPointAt(i / N); rows.push(i + " " + pt.x.toFixed(1) + "," + pt.z.toFixed(1) + " " + r + " " + raw[i].toFixed(1) + (holdI.has(i) ? " H" : "")); } return rows.join("\n"); };
    window.__steerPlan = { N: N, blocked: blocked, max: Math.max.apply(null, Array.from(prof).map(Math.abs)) };
  }
  function steerStep(p, tx, tz, dt, u) {
    let target = 0;
    if (steerProf) {
      const f = Math.max(0, Math.min(1, u)) * steerProf.N;
      const i0 = Math.floor(f), i1 = Math.min(steerProf.N, i0 + 1), a = f - i0;
      target = steerProf.prof[i0] * (1 - a) + steerProf.prof[i1] * a;
    }
    steerOff += (target - steerOff) * (1 - Math.exp(-8 * dt));
    window.__steer = +steerOff.toFixed(2);
    return steerOff;
  }

  /* camera.fov is the VERTICAL angle. A fixed ~58° on a portrait phone
     (aspect ~0.46) squeezes the horizontal cone down to ~30°, so the left and
     right enemies drop out of frame. On portrait screens hold the horizontal
     cone instead: vfov = 2·atan(tan(hfov/2) / aspect), clamped to 52..82 so a
     tall phone never turns into a fisheye. Landscape (aspect >= 1) keeps the
     old 58° and a nearly square window eases out of it instead of snapping. */
  /* (v41) a portrait phone gets a wider lens than before (up to 94°), so
     more of the street fits across the narrow screen */
  const FOV_LAND = 58, FOV_MIN = 52, FOV_MAX = 94, FOV_KEEP_H = 80;
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

  /* ---------------- CC0 low-poly models (GLB) ----------------
     Four public-domain models from poly.pizza — Quaternius' tank and guns,
     kazuma's helicopter — now stand in for the hand-built boxes of the boss
     tank, the gunship, the first-person pistol and the SMG pick-up. They are
     texture-free flat-colour meshes, so each one is repainted into the game's
     olive/dark palette as it arrives.
     The box models never go away: they are what the player sees until the
     .glb is in hand, and what stays if it never arrives (file://, a blocked
     request, an old cached page). Nothing here may break the game when the
     loader, the file or the network is missing. */
  const GLB_BASE = "models/";
  const GLB_STATE = {};
  const glbMixers = [];
  window.__glbState = GLB_STATE;
  function glbLoad(name, ok, bad) {
    const L = T && T.GLTFLoader;
    if (!L) { GLB_STATE[name] = "no-loader"; if (bad) bad("no GLTFLoader"); return; }
    let ld = null;
    try { ld = new L(); } catch (e) { GLB_STATE[name] = "no-loader"; if (bad) bad(e); return; }
    GLB_STATE[name] = "loading";
    try {
      ld.load(GLB_BASE + name + ".glb", (gltf) => {
        try {
          ok(gltf);
          if (GLB_STATE[name] !== "fail") GLB_STATE[name] = "ok";
        } catch (e) {
          GLB_STATE[name] = "apply-error";
          window.__glbErr = String(e && e.stack || e);
          if (bad) bad(e);
        }
      }, undefined, (err) => {
        GLB_STATE[name] = "fail";
        window.__glbErr = String(err && err.message || err);
        if (bad) bad(err);
      });
    } catch (e) {
      GLB_STATE[name] = "fail";
      window.__glbErr = String(e && e.stack || e);
      if (bad) bad(e);
    }
  }
  /* repaint a loaded model in the game's palette, give every mesh a shadow,
     and keep one material per original so nothing is cloned per part */
  function glbPaint(root, pal, opt) {
    const O = opt || {};
    const seen = new Map();
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = O.shadow !== false;
      o.receiveShadow = true;
      const one = (m) => {
        if (!m) return m;
        if (seen.has(m)) return seen.get(m);
        const nm = m.clone();
        const col = pal && (pal[m.name] != null ? pal[m.name] : pal["*"]);
        if (col != null) { nm.color = new T.Color(col); nm.color.convertSRGBToLinear(); }
        nm.metalness = O.metal != null ? O.metal : 0.08;
        nm.roughness = O.rough != null ? O.rough : 0.84;
        nm.envMapIntensity = 0.2;
        nm.flatShading = O.flat !== false;
        nm.needsUpdate = true;
        seen.set(m, nm);
        return nm;
      };
      o.material = Array.isArray(o.material) ? o.material.map(one) : one(o.material);
    });
  }
  /* the tank's four clips animate the track links only; Forward is the crawl
     that reads under a boss crossing the square */
  function glbPlay(root, gltf, host, want) {
    if (!gltf || !gltf.animations || !gltf.animations.length) return null;
    let clip = gltf.animations[0];
    if (want) {
      for (let i = 0; i < gltf.animations.length; i++) {
        if (want.test(gltf.animations[i].name || "")) { clip = gltf.animations[i]; break; }
      }
    }
    try {
      const mx = new T.AnimationMixer(root);
      mx.clipAction(clip).play();
      glbMixers.push({ m: mx, host: host });
      return mx;
    } catch (e) { window.__glbErr = String(e && e.stack || e); return null; }
  }
  function glbStep(dt) {
    for (let i = glbMixers.length - 1; i >= 0; i--) {
      const g = glbMixers[i];
      if (!g.host || !g.host.parent) { try { g.m.stopAllAction(); } catch (e) {} glbMixers.splice(i, 1); continue; }
      try { g.m.update(dt); } catch (e) { glbMixers.splice(i, 1); }
    }
  }
  /* the GLB is authored Z-up with the barrel down -X and the hull nose at -X:
     stand it up, turn the nose to +Z, then scale the nose plate to where the
     box tank's glacis was so the glowing intake still sits on the front */
  function glbTankAdd(g, body, boxes, codeTurret) {
    glbLoad("tank_quaternius_cc0", (gltf) => {
      const root = gltf.scene;
      glbPaint(root, {
        Main: 0x4e5a35, Main_Dark: 0x303a24, Main_Light: 0x67734b,
        Main_Details: 0x24271c, Wheels: 0x191c15
      }, { rough: 0.88, metal: 0.06 });
      root.updateMatrixWorld(true);
      const hull = root.getObjectByName("Tank_body");
      const hb = new T.Box3().setFromObject(hull || root);
      const S = 3.5 / Math.max(0.001, -hb.min.x);
      const holder = new T.Group();
      holder.name = "glbTank";
      holder.rotation.y = Math.PI / 2;
      holder.scale.setScalar(S);
      holder.add(root);
      holder.updateMatrixWorld(true);
      const bb = new T.Box3().setFromObject(holder);
      holder.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, 0);
      body.add(holder);
      /* the turret and the gun are separate nodes in this model: hang them on
         one pivot so the boss's recoil still kicks the turret back */
      const tur = root.getObjectByName("Tank_Turret");
      const gun = root.getObjectByName("Tank_Gun");
      g.updateMatrixWorld(true);
      const pivot = new T.Group();
      const tp = new T.Vector3();
      if (tur) tur.getWorldPosition(tp); else tp.set(0, 1.7, 0);
      pivot.position.copy(body.worldToLocal(tp.clone()));
      body.add(pivot);
      g.updateMatrixWorld(true);
      pivot.updateMatrixWorld(true);
      if (tur) pivot.attach(tur);
      if (gun) pivot.attach(gun);
      if (gun) {
        /* the barrel tip, for the charge glow and the muzzle-jam check */
        g.updateMatrixWorld(true);
        const inv = new T.Matrix4().copy(body.matrixWorld).invert();
        const gb = new T.Box3().setFromObject(gun).applyMatrix4(inv);
        const mz = new T.Object3D();
        mz.name = "glbMuzzle";
        mz.position.set((gb.min.x + gb.max.x) / 2 - pivot.position.x,
                        (gb.min.y + gb.max.y) / 2 - pivot.position.y,
                        gb.max.z - pivot.position.z);
        pivot.add(mz);
        g.userData.cannonMuzzle = mz;
      }
      pivot.userData.recoilBaseZ = 0;
      g.userData.turret = pivot;
      g.userData.cannon = pivot;
      boxes.forEach((m) => { if (m && m !== pivot) m.visible = false; });
      if (codeTurret) codeTurret.visible = false;   // its turret, gun and barrel
      enemyRim(holder);
      glbPlay(root, gltf, g, /Forward/i);
    }, () => { /* the box tank simply stays */ });
  }
  /* the helicopter is a single static mesh: the rotor is its own material, so
     it can be lifted onto a pivot and spun. Nose is +Z like the box model. */
  function glbHeliAdd(g, b, boxes, codeRotor, codeTail, gunner, gunGroup) {
    glbLoad("military_helicopter_kazuma_cc0", (gltf) => {
      const root = gltf.scene;
      glbPaint(root, {
        "Material.001": 0x3f4a2d, "Material.003": 0x2c3520,
        "Material.004": 0x9aa79b, "Material.002": 0x1c1f19
      }, { rough: 0.85, metal: 0.06 });
      root.updateMatrixWorld(true);
      const b0 = new T.Box3().setFromObject(root);
      const S = 6.4 / Math.max(0.001, b0.max.z - b0.min.z);
      const holder = new T.Group();
      holder.name = "glbHeli";
      holder.scale.setScalar(S);
      holder.add(root);
      holder.updateMatrixWorld(true);
      const bb = new T.Box3().setFromObject(holder);
      holder.position.set(-(bb.min.x + bb.max.x) / 2, -0.95 - bb.min.y, -(bb.min.z + bb.max.z) / 2);
      b.add(holder);
      /* the blades are the one part with the grey material */
      let blades = null;
      root.traverse((o) => {
        if (blades || !o.isMesh) return;
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        if (m && m.name === "Material.002") blades = o;
      });
      if (blades) {
        g.updateMatrixWorld(true);
        const c = new T.Box3().setFromObject(blades).getCenter(new T.Vector3());
        const pivot = new T.Group();
        pivot.name = "glbRotor";
        pivot.position.copy(b.worldToLocal(c.clone()));
        b.add(pivot);
        g.updateMatrixWorld(true);
        pivot.updateMatrixWorld(true);
        pivot.attach(blades);
        g.userData.rotor = pivot;
      }
      boxes.forEach((m) => { if (m) m.visible = false; });
      if (codeRotor) codeRotor.visible = false;
      if (codeTail) codeTail.visible = false;
      /* the door gunner rides the side the box cabin opened on */
      if (gunner) { gunner.position.set(0.5, -0.5, 0.1); gunner.rotation.y = Math.PI * 0.5; }
      if (gunGroup) gunGroup.position.set(0.72, 0.06, 0.18);
      enemyRim(holder);
    }, () => { /* the box helicopter simply stays */ });
  }
  /* the pistol: repainted to blued steel and polymer, turned to point down
     -Z and fitted to the box pistol's hold, so the hands, the aiming solve and
     the muzzle flash all keep working unchanged */
  function glbPistolAdd(rig, codeGun, host) {
    glbLoad("pistol_quaternius_cc0", (gltf) => {
      const root = gltf.scene;
      glbPaint(root, { Metal: 0x59606a, Black: 0x232629, LightMetal: 0x8b939c }, { metal: 0.72, rough: 0.4 });
      root.updateMatrixWorld(true);
      const bb = new T.Box3().setFromObject(root);
      const S = 0.62 / Math.max(0.001, bb.max.x - bb.min.x);
      const holder = new T.Group();
      holder.name = "glbPistolModel";
      holder.rotation.y = Math.PI / 2;      // the barrel runs down -Z like the box gun
      holder.scale.setScalar(S);
      holder.add(root);
      holder.position.set(0, -0.11, 0.095);
      host.add(holder);
      rig.pistolLoaded = true;
      window.__pistolGlb = holder;
      codeGun.forEach((m) => { m.visible = false; });
      host.visible = weapon === "pistol";
    }, () => { /* the box pistol simply stays */ });
  }
  /* the assault rifle stands in for the SMG pick-up viewmodel */
  function glbRifleAdd(rig, host) {
    glbLoad("assault_rifle_quaternius_cc0", (gltf) => {
      const root = gltf.scene;
      glbPaint(root, { Main: 0x24282c, MainDark: 0x1a1d20, MainLight: 0x353a40 }, { metal: 0.55, rough: 0.5 });
      root.updateMatrixWorld(true);
      const bb = new T.Box3().setFromObject(root);
      const S = 1.12 / Math.max(0.001, bb.max.x - bb.min.x);
      const holder = new T.Group();
      holder.name = "glbRifleModel";
      holder.rotation.y = Math.PI / 2;
      holder.scale.setScalar(S);
      holder.add(root);
      holder.position.set(-0.03, 0.0, -0.1);
      host.add(holder);
      rig.rifleLoaded = true;
      window.__rifleGlb = holder;
      if (rig.smgBoxes) rig.smgBoxes.forEach((m) => { m.visible = false; });
      host.visible = weapon === "smg";
    }, () => { /* the box SMG simply stays */ });
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
    /* The viewmodel fills the lower third of the frame, so its materials are
       the ones a player actually inspects: the slide is blued steel with a
       brushed grain and a hard highlight, the frame is moulded polymer, the
       butt is checkered rubber, and the sights glow. Everything here is a
       Standard material with its own roughness so the sun leaves a hot streak
       along the top of the slide and nothing on the grip. */
    const mk = (hex, opt) => {
      const m = new T.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.72, metalness: 0.0, envMapIntensity: 0.18 }, opt || {}));
      m.color.convertSRGBToLinear();
      return m;
    };
    // brushed steel body parts share one map so the grain lines up
    const smetal = metalTex("pistolSteel", 23);
    const mpoly = polymerTex("pistolPoly", 29);
    const sBump = bumpTex("pistolSteel", TXCV["pistolSteel"], { gain: 1.8 });
    const pBump = bumpTex("pistolPoly", TXCV["pistolPoly"], { gain: 2.6 });
    const mm = (hex, tex, rx, ry, opt) => {
      const m = new T.MeshStandardMaterial(Object.assign({ color: hex, map: tex || null, roughness: 0.3, metalness: 0.9, envMapIntensity: 0.7 }, opt || {}));
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
    const slide = mm(0x4b5563, smetal, 1, 1.6, { roughness: 0.26, metalness: 0.92, bumpMap: sBump, bumpScale: 0.0025 });
    const slideDark = mm(0x323945, smetal, 1, 1.6, { roughness: 0.34, metalness: 0.9, bumpMap: sBump, bumpScale: 0.0025 });
    const slideTop = mm(0x606b78, smetal, 1, 1.6, { roughness: 0.2, metalness: 0.95, bumpMap: sBump, bumpScale: 0.002 });
    const poly = mm(0x22262c, mpoly, 2, 2, { roughness: 0.5, metalness: 0.05, bumpMap: pBump, bumpScale: 0.0035 });
    window.__pistolMats = { slide: slide, slideDark: slideDark, slideTop: slideTop, poly: poly };
    const bore = mk(0x07090b, { roughness: 0.45, metalness: 0.35 });
    const steel = mm(0x828a95, smetal, 1, 1, { roughness: 0.24, metalness: 0.96 });
    const skin = mk(0xc08a5e, { roughness: 0.75 });
    const gripMat = new T.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.62,
      metalness: 0.03,
      envMapIntensity: 0.2,
      bumpMap: bumpTex("grip", TXCV["grip"], { gain: 2.8 }),
      bumpScale: 0.0035,
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
    /* tritium dots: white lamps that keep a little light of their own, so the
       sight still reads when the pistol is in the shade of a building */
    const lamp = (hex) => mk(hex, { emissive: hex, emissiveIntensity: 0.9, roughness: 0.35 });
    add(0.012, 0.012, 0.006, -0.034, 0.132, -0.318, lamp(0xf6faf4));
    add(0.012, 0.012, 0.006, 0.034, 0.132, -0.318, lamp(0xf6faf4));
    // front blade with a green dot
    add(0.024, 0.038, 0.028, 0, 0.132, -0.34, slideDark);
    add(0.014, 0.014, 0.006, 0, 0.136, -0.324, mk(0x9ad24a, { emissive: 0x9ad24a, emissiveIntensity: 1.1, roughness: 0.3 }));
    // muzzle and bore
    add(0.062, 0.058, 0.03, 0, 0.062, -0.372, slideDark);
    add(0.028, 0.028, 0.02, 0, 0.062, -0.386, bore);

    // ---- two hands on the grip ----
    /* (v28) every box from the frame to the muzzle is the fallback: the CC0
       pistol replaces exactly these once it loads, and the hands stay */
    const codeGun = aim.children.slice();
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
    const armMats = [];
    const cloth = (tex, len, w, tint) => {
      const t = tex.clone();
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(Math.max(1, Math.round(w / 0.2)), Math.max(1, Math.round(len / 0.2)));
      t.anisotropy = Math.max(1, Math.min(8, MAXANISO));
      t.needsUpdate = true;
      const m = new T.MeshStandardMaterial({
        color: tint || 0xffffff, map: t, roughness: 0.92, metalness: 0.02, envMapIntensity: 0.18,
        bumpMap: tex.__key ? bumpTex(tex.__key, TXCV[tex.__key], { gain: 3.0 }) : null, bumpScale: 0.004
      });
      m.color.convertSRGBToLinear();
      m.userData.rep = [t.repeat.x, t.repeat.y];
      armMats.push(m);
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
      /* (v36) square sleeves, like the block soldiers' own arms */
      const r = (rA + rB) * 0.92;
      const m = new T.Mesh(new T.BoxGeometry(r, len, r), cloth(tex, len, (rA + rB) * 2.2, tint));
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

    window.__armMats = armMats;
    window.__armSkin = skin;
    const f = add(0.085, 0.085, 0.12, 0, 0.062, -0.44, new T.MeshBasicMaterial({ color: 0xfff3b0 }));
    f.visible = false;
    const halo = add(0.1, 0.1, 0.02, 0, 0.062, -0.42, new T.MeshBasicMaterial({ color: 0xffc14a, transparent: true, opacity: 0.8, depthWrite: false }));
    halo.visible = false;
    /* a four-point star of flame on two crossed cards: the box core alone read
       as a yellow cube, this gives the flash a burning shape */
    const starTex = ctex("muzzleStar", 128, 128, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      const c = 64;
      const rg = g.createRadialGradient(c, c, 0, c, c, 60);
      rg.addColorStop(0, "rgba(255,252,232,1)");
      rg.addColorStop(0.18, "rgba(255,228,150,.95)");
      rg.addColorStop(0.45, "rgba(255,158,60,.55)");
      rg.addColorStop(1, "rgba(255,110,20,0)");
      g.fillStyle = rg;
      g.beginPath(); g.arc(c, c, 60, 0, 7); g.fill();
      g.save();
      g.translate(c, c);
      for (let i = 0; i < 4; i++) {
        g.rotate(Math.PI / 2);
        const lg = g.createLinearGradient(0, 0, 0, -60);
        lg.addColorStop(0, "rgba(255,236,176,.9)");
        lg.addColorStop(1, "rgba(255,140,40,0)");
        g.fillStyle = lg;
        g.beginPath();
        g.moveTo(-7, 0); g.lineTo(0, -60); g.lineTo(7, 0);
        g.closePath(); g.fill();
      }
      g.restore();
    });
    const starMat = new T.MeshBasicMaterial({
      map: starTex, transparent: true, blending: T.AdditiveBlending,
      depthWrite: false, depthTest: false, side: T.DoubleSide, opacity: 0.95
    });
    const star = new T.Group();
    for (let i = 0; i < 2; i++) {
      const card = new T.Mesh(new T.PlaneGeometry(0.72, 0.72), starMat);
      card.rotation.y = i * Math.PI / 2;
      star.add(card);
    }
    star.position.set(0, 0.062, -0.44);
    star.visible = false;
    aim.add(star);
    const flashLight = new T.PointLight(0xffc878, 0, 6, 2);
    flashLight.position.set(0, 0.06, -0.42);
    aim.add(flashLight);

    /* the barrel runs down -Z; `aim` is turned every frame so that axis goes
       through whatever the crosshair (or the last shot) is on. `g` only
       carries the position and the viewport scale. */
    /* (v16) the pick-up weapons are built onto the same `aim` group: the
       pistol pieces are hidden while one of them is in hand */
    const base = aim.children.filter((c) => c !== f && c !== halo && c !== star && c !== flashLight && codeGun.indexOf(c) < 0);
    const wg = (name) => { const gg = new T.Group(); gg.name = name; gg.visible = false; aim.add(gg); return gg; };
    const P = (gg, w, h, d, x, y, z, mat) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); gg.add(m); return m; };
    const blk = mk(0x23272d, { roughness: 0.5, metalness: 0.6 });
    const blk2 = mk(0x3a4048, { roughness: 0.35, metalness: 0.8 });
    const wood = mk(0x7a4a26, { roughness: 0.7, metalness: 0.0 });
    const smgG = wg("wSMG");
    P(smgG, 0.13, 0.13, 0.62, 0, 0.04, -0.22, blk);          /* receiver */
    P(smgG, 0.1, 0.03, 0.5, 0, 0.12, -0.24, blk2);           /* top rail */
    for (let i = 0; i < 6; i++) P(smgG, 0.11, 0.012, 0.03, 0, 0.14, -0.06 - i * 0.07, blk);
    P(smgG, 0.07, 0.07, 0.2, 0, 0.03, -0.62, blk2);           /* barrel shroud */
    P(smgG, 0.045, 0.045, 0.1, 0, 0.03, -0.76, blk);          /* muzzle */
    P(smgG, 0.06, 0.3, 0.08, 0, -0.26, -0.12, blk);           /* long magazine */
    P(smgG, 0.05, 0.14, 0.05, 0, -0.08, -0.46, blk2);         /* fore grip */
    P(smgG, 0.1, 0.24, 0.12, 0, -0.18, 0.04, blk);            /* pistol grip */
    P(smgG, 0.04, 0.04, 0.26, 0, 0.06, 0.2, blk2);            /* folded stock */
    P(smgG, 0.05, 0.05, 0.06, 0, 0.17, -0.32, mk(0x111111, { emissive: 0xff3a2a, emissiveIntensity: 0.8 })); /* red dot */
    const sgG = wg("wShotgun");
    P(sgG, 0.12, 0.12, 0.5, 0, 0.04, -0.12, blk);             /* receiver */
    P(sgG, 0.06, 0.06, 0.9, 0, 0.07, -0.72, blk2);            /* barrel */
    P(sgG, 0.06, 0.06, 0.72, 0, -0.01, -0.62, blk);           /* magazine tube */
    const pump = P(sgG, 0.11, 0.09, 0.3, 0, -0.01, -0.62, wood); /* pump */
    for (let i = 0; i < 5; i++) P(sgG, 0.115, 0.01, 0.02, 0, -0.01, -0.5 - i * 0.05, mk(0x4a2a14, { roughness: 0.8 }));
    P(sgG, 0.1, 0.24, 0.12, 0, -0.18, 0.06, wood);            /* grip */
    P(sgG, 0.1, 0.14, 0.34, 0, -0.08, 0.3, wood);             /* stock */
    P(sgG, 0.03, 0.04, 0.03, 0, 0.12, -1.13, mk(0xd0d0d0, { metalness: 0.9, roughness: 0.3 })); /* bead */
    const weaponRig = { base, smg: smgG, shotgun: sgG, pump, codeGun, smgBoxes: smgG.children.slice(), flashZ: { f: f.position.z, h: halo.position.z, s: star.position.z, l: flashLight.position.z } };
    /* (v28) the CC0 viewmodels live in their own hosts: empty until the .glb
       arrives, so the box models show in the meantime */
    const pistolHost = new T.Group();
    pistolHost.name = "glbPistol";
    pistolHost.visible = false;
    aim.add(pistolHost);
    const rifleHost = new T.Group();
    rifleHost.name = "glbRifle";
    rifleHost.visible = false;
    aim.add(rifleHost);
    weaponRig.pistolHost = pistolHost;
    weaponRig.rifleHost = rifleHost;
    glbPistolAdd(weaponRig, codeGun, pistolHost);
    glbRifleAdd(weaponRig, rifleHost);
    g.position.set(0.2, -0.235, -0.66);
    g.rotation.set(0, 0, 0);
    g.scale.setScalar(0.4);
    aim.rotation.order = "YXZ";
    aim.rotation.set(0, 0, 0);
    camera.add(g);
    return { g, aim, body, upperL, flash: f, halo, star, light: flashLight, weapons: weaponRig };
  }

  function roleTag(el) {
    const d = document.createElement("div");
    d.className = "railThreat";
    d.innerHTML = "<i class='rtArc'></i><b class='rtDot'>!</b>";
    d.style.setProperty("--rtp", "0");
    d.style.setProperty("--rtc", "#3ee06a");    document.body.appendChild(d);
    el._tag = d;
    el._tagStage = -1;
    el._tagP = -1;
    el._tagDia = 0;
    return d;
  }

  /* ---------------- course dressing ---------------- */

  function darkMat(col) {
    const m = new T.MeshStandardMaterial({ color: col === undefined ? 0x14161a : col, roughness: 0.88, metalness: 0.06, envMapIntensity: 0.18 });
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

  /* The scene environment: a painted sky-and-street panorama run through
     PMREM, so every glass pane, hubcap and pistol slide has the same sky and
     city to reflect. One 512x256 equirect and one prefilter pass at boot; no
     cube camera, no per-frame cost. */
  function buildSceneEnv(ctx) {
    if (!ctx || !ctx.renderer || !T.PMREMGenerator) return null;
    if (window.__mgEnv) return window.__mgEnv;
    try {
      const eq = ctex("envEQ", 512, 256, (g, w, h) => {
        const sk = g.createLinearGradient(0, 0, 0, h * 0.52);
        sk.addColorStop(0, "#2b6fc4");
        sk.addColorStop(0.55, "#79b4e4");
        sk.addColorStop(0.86, "#c8e2f4");
        sk.addColorStop(1, "#eaf4fb");
        g.fillStyle = sk;
        g.fillRect(0, 0, w, h * 0.52);
        /* the sun and its flare, up and to the left */
        const sx = w * 0.18, sy = h * 0.16;
        const sun = g.createRadialGradient(sx, sy, 0, sx, sy, h * 0.2);
        sun.addColorStop(0, "rgba(255,252,236,1)");
        sun.addColorStop(0.12, "rgba(255,244,214,.92)");
        sun.addColorStop(0.5, "rgba(255,232,186,.28)");
        sun.addColorStop(1, "rgba(255,232,186,0)");
        g.fillStyle = sun;
        g.fillRect(sx - h * 0.2, sy - h * 0.2, h * 0.4, h * 0.4);
        /* a few soft clouds */
        const R = rng(31);
        for (let c = 0; c < 14; c++) {
          const cx = R() * w, cy = h * (0.08 + R() * 0.3), sc = 6 + R() * 20;
          g.fillStyle = "rgba(255,255,255," + (0.18 + R() * 0.35).toFixed(2) + ")";
          for (let i = 0; i < 5; i++) g.fillRect(cx + (R() - 0.5) * sc * 4, cy + (R() - 0.5) * sc, sc * (1 + R()), sc * 0.45);
        }
        /* the city: a ragged skyline just under the horizon, with the far
           blocks of the boulevard in front of it */
        const R2 = rng(77);
        for (let pass = 0; pass < 2; pass++) {
          const base = h * (pass ? 0.545 : 0.515);
          g.fillStyle = pass ? "rgba(86,104,122,.95)" : "rgba(150,178,200,.9)";
          let x = 0;
          while (x < w) {
            const bw = 8 + R2() * 34, bh = (pass ? 10 : 26) + R2() * (pass ? 16 : 40);
            g.fillRect(x, base - bh, bw, bh);
            if (R2() < 0.35) {
              g.fillStyle = "rgba(255,240,196,.5)";
              for (let ry = 0; ry < bh; ry += 4) g.fillRect(x + 2, base - bh + ry, 2, 1.5);
              g.fillStyle = pass ? "rgba(86,104,122,.95)" : "rgba(150,178,200,.9)";
            }
            x += bw + 1 + R2() * 5;
          }
        }
        /* the street the player stands on, dark and warm from the stone */
        const gr = g.createLinearGradient(0, h * 0.53, 0, h);
        gr.addColorStop(0, "#8b8f95");
        gr.addColorStop(0.35, "#5c6066");
        gr.addColorStop(1, "#3b3e42");
        g.fillStyle = gr;
        g.fillRect(0, h * 0.53, w, h * 0.47);
      });
      eq.mapping = T.EquirectangularReflectionMapping;
      const pm = new T.PMREMGenerator(ctx.renderer);
      const rt = pm.fromEquirectangular(eq);
      pm.dispose();
      window.__mgEnv = rt.texture;
      window.__mgEnvMs = 1;
      return rt.texture;
    } catch (e) {
      window.__mgEnvErr = String(e && e.stack || e);
      return null;
    }
  }

  /* the course dressing belongs to the stage: the city of stage 1, or the
     DMZ wire and the Panmunjom plaza of stage 2 */
  function dressBattlefield(ctx) {
    DET.b = null;
    const out = STAGE && STAGE.dress === "dmz" ? dressStage2(ctx) : STAGE && STAGE.dress === "pyongyang" ? dressStage3(ctx) : STAGE && STAGE.dress === "summit" ? dressSummit(ctx) : STAGE && STAGE.dress === "paektu" ? dressPaektu(ctx)
      : STAGE && STAGE.dress === "citygen" ? dressCity(ctx)
      : STAGE && STAGE.dress === "seoulFall" ? warify(ctx, dressStage1(ctx)) : dressStage1(ctx);
    try { flushDetail(null); } catch (e) { window.__detErr = String(e); }
    try { applyRelief(ctx.scene); } catch (e) { window.__reliefErr = String(e && e.stack || e); }
    return out;
  }

  function dressStage1(ctx) {
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
    ctx.scene.background = new T.Color(0x72b8f0).convertSRGBToLinear();
    /* haze that closes the far end of the boulevard: Sungnyemun and Namsan sit
       in it, so they read as distance instead of painted cardboard */
    ctx.scene.fog = new T.Fog(0xd6e6f2, 130, 460);
    if (ctx.scene.fog.color && ctx.scene.fog.color.convertSRGBToLinear) ctx.scene.fog.color.convertSRGBToLinear();
    buildSceneEnv(ctx);
    if (window.__mgEnv) ctx.scene.environment = window.__mgEnv;
    if (ctx.LT) {
      const LT = ctx.LT;
      /* a hard low-winter sun with a cool sky dome over it, a warm bounce off
         the asphalt from the right, and almost nothing from the north: enough
         contrast for shadows to read as shapes, not as grey smears */
      if (LT.hemi) { LT.hemi.intensity = 0.26; LT.hemi.color.setHex(0xd8e9fb); LT.hemi.groundColor && LT.hemi.groundColor.setHex(0xa89a80); }
      if (LT.amb) { LT.amb.intensity = 0.05; LT.amb.color && LT.amb.color.setHex(0xbfd6ea); }
      if (LT.key) { LT.key.intensity = 2.35; LT.key.color.setHex(0xffeecd); }
      if (LT.moon) { LT.moon.intensity = 0.1; LT.moon.color && LT.moon.color.setHex(0xa8c4e6); }
      if (LT.rim) { LT.rim.intensity = 0.5; LT.rim.color && LT.rim.color.setHex(0xffd7ab); }
    }
    if (ctx.renderer) ctx.renderer.toneMappingExposure = 1.12;
    try {
      const caps = ctx.renderer && ctx.renderer.capabilities;
      if (caps && caps.getMaxAnisotropy) MAXANISO = Math.min(8, caps.getMaxAnisotropy() || 4);
      applyAniso();
    } catch (e) {}

    /* ---- ground: asphalt everywhere, so no hole can ever show ---- */
    const tex = asphaltTex("asphaltG", 17, 768);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(36, 36);
    const ground = new T.Mesh(new T.PlaneGeometry(300, 300), new T.MeshStandardMaterial({
      map: tex, roughness: 0.84, metalness: 0.02, envMapIntensity: 0.1,
      bumpMap: bumpTex("asphaltG", TXCV["asphaltG"], { gain: 2.0 }), bumpScale: 0.055
    }));
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
    makeCone(S, -15.3, 22.6);
    makeCone(S, -24.4, 26.0);

    /* ================= THE YARD (waves 3-4) ================= */
    makeBlock(S, -30, -16, 40, 58, 9.6, { mat: SOL.facA, shop: "w", k: 3 });
    makeBlock(S, -58, -48, 22, 58, 8.8, { mat: SOL.facC, shop: "e", k: 0 });
    makeBlock(S, -48, -30, 8, 18, 6.4, { mat: SOL.facB, shop: "n", k: 5 });
    makeBlock(S, -48, -41, 18, 33, 7.4, { mat: SOL.facB, shop: "e", k: 6 });
    /* behind the gate, so the sky never shows through the arch either */
    /* ================= BEYOND THE GATE (waves 5-7, boss) =================
       a small back-street square north of the gate, then an avenue running
       east behind the boulevard blocks, out onto the Sungnyemun plaza */
    makeBlock(S, -62, -48, 62, 92, 10.4, { mat: SOL.facC, shop: "e", k: 2 });
    makeBlock(S, -46, -28, 75.4, 92, 12.6, { mat: SOL.facA, shop: "s", k: 4 });
    makeBlock(S, -26, -19, 75.4, 92, 10.2, { mat: SOL.facB, shop: "s", k: 6 });
    makeBlock(S, -30, -20.5, 58, 64.6, 8.4, { mat: SOL.facB, shop: "n", k: 3 });
    walk(-46, -19, 74.4, 75.4);
    walk(-30, -7, 64.6, 65.6);
    for (let x = -26; x < -8; x += 6) paintBar(x, 69.2, 3.2, 0.16, SOL.paintWhite);
    for (let i = 0; i < 6; i++) paintBar(-8.2, 64.4 + i * 1.0, 3.4, 0.5, SOL.paintWhite);
    makeStreetLamp(S, -44.8, 73.8, Math.PI);
    makeStreetLamp(S, -21.0, 74.6, Math.PI);
    makeUtilityPole(S, -29.0, 65.0);
    makeHydrant(S, -33.0, 74.6);

    /* ================= VISTA: the boulevard to Sungnyemun ================= */
    /* far city blocks line the road; they are only seen down the gap */
    makeBlock(S, -20, -7, 41, 64.6, 14.5, { mat: SOL.facB, shop: "n", k: 5 });
    [[7, 20, 41, 62, 12.5, SOL.facC],
     [7, 22, 68, 86, 13.0, SOL.facB],
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
    makeNamsan(S, 10, 150);

    /* ================= LANDMARKS ================= */
    /* the big flag on the west block, hung 6.5 m up and facing the road */
    const bigFlag = makeFlagPlane(S, "kr", 11.9, 6.0, 23.4, 4.6, 3.05, -2.55);
    bigFlag.name = "bigFlag";
    const fpole = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 4.4, 6), SOL.poleGray);
    fpole.position.set(11.9, 7.7, 23.4);
    fpole.rotation.z = Math.PI / 2;
    S.add(fpole);
    const fbase = new T.Mesh(new T.BoxGeometry(0.3, 0.9, 0.3), SOL.metalDark);
    fbase.position.set(13.0, 7.9, 23.4);
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
    /* this one stands a little further from the flag and reaches over the
       road instead of across the cloth, so the taegeukgi is never in front
       of a signal head */
    makeTrafficLight(S, 10.6, 17.4, Math.PI);
    makePlanter(S, -12.4, 9.0, 1.8);
    makePlanter(S, 12.4, -9.0, 1.8);
    makeHydrant(S, -12.2, 6.2);
    makeCone(S, 3.4, 13.2);
    makeCone(S, -2.6, 11.0);

    /* trees on both sidewalks */
    const VT = voxBatch();
    const trunks = [];
    [[-12.6, -8.0], [-12.8, -1.2], [12.6, 6.2], [12.6, 17.4], [-12.6, 22.4], [12.6, -14.0], [-12.6, -16.0],
     [6.0, 32.0], [-6.0, 36.0], [6.0, 44.0], [-6.0, 50.0], [6.0, 58.0], [6.0, 70.0], [-23.0, 74.6], [-36.0, 74.6],
     [-46.2, 40.5], [-46.2, 48.5], [-31.4, 34.0]].forEach(([x, z], i) => {
      const h = 3.2 + (i % 3) * 0.5;
      voxTree(VT, x, 0.3, z, h, 31 + i * 7, { rx: 1.6 + (i % 2) * 0.3, ry: 1.25 });
      trunks.push([x, z]);
    });
    VT.flush(S, "streetTrees");
    /* low hedges in the planters and along the yard wall */
    const VH = voxBatch();
    const vm = voxMats();
    for (let i = 0; i < 9; i++) VH.cube(vm.leaf, -46.6, 0.75, 38 + i * 1.4, 0.9, 0.9, 1.3, [0xffffff, 0xdfeecf][i % 2]);
    VH.flush(S, "hedges");
    /* skyline behind Sungnyemun, climbing toward the foot of Namsan */
    const R7 = rng(717);
    const sky1 = [];
    for (let i = 0, tries = 0; sky1.length < 26 && tries < 400; tries++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (16 + R7() * 70), z = 96 + R7() * 56;
      const w = 9 + R7() * 9, d = 9 + R7() * 9, h = 18 + R7() * 34 * (1 - Math.abs(x) / 120);
      /* towers keep a street's width between them instead of growing into each other */
      if (sky1.some(([x2, z2, w2, d2]) => Math.abs(x - x2) < (w + w2) / 2 + 3 && Math.abs(z - z2) < (d + d2) / 2 + 3)) continue;
      sky1.push([x, z, w, d, h, i]);
      i++;
    }
    voxSkyline(S, sky1);

    /* the parked bus and police car that frame the first firefight */
    /* parked along the kerb, nose toward the player (it used to stand across
       the lane with its tail inside the shop front) */
    makeCityBus(S, -10.15, 12.6, Math.PI, "143").name = "bus143";
    makePoliceCar(S, 10.4, 9.4, -Math.PI / 2 + 0.03).name = "policeCar";
    makePoliceCar(S, -45.2, 49.0, 0.04);

    /* concrete barriers and cones dressing the kerbs */
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

    if (waveNamed("yard")) {
      const w = waveNamed("yard");
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

    applyMood(ctx, S, sky, clouds, moodOverride() || "day");
    dress = {
      root: S, sky, flags, clouds, barrels, ally,
      truck1: null, trunks: trunks
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
        g = buildCover(coverPlace({ yaw: bossYaw, hold: bossHold }, { role: "boss", lat: s[0], dep: s[1], cover: "heavy" }, i), { yaw: bossYaw });
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

  function waveNamed(n) { return (waves || []).find((w) => w.def && (w.def.name === n || w.def.tag === n)) || null; }

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
    bossYaw = BOSS_DEF.yaw || 0;
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
    if (chase) chase.fx.forEach((m) => m.parent && m.parent.remove(m));
    chase = null;
    if (jeepRig) jeepRig.visible = false;
    if (boatRig) boatRig.visible = false;
    debris.forEach((m) => m.parent && m.parent.remove(m));
    debris.length = 0;
    WATER.length = 0;
    clearAmbient();
    FXL.forEach((f) => f.m.parent && f.m.parent.remove(f.m)); FXL.length = 0;
    SCORCH.forEach((m) => m.parent && m.parent.remove(m)); SCORCH.length = 0;
    MONU = null;
    shots3.forEach((s) => { if (s.mesh && s.mesh.parent) s.mesh.parent.remove(s.mesh); });
    shots3 = [];
    tracers.forEach((s) => { if (s.mesh && s.mesh.parent) s.mesh.parent.remove(s.mesh); });
    tracers = [];
    pickups.forEach((p) => { if (p.mesh) { p.mesh.parent && p.mesh.parent.remove(p.mesh); disposeGeo(p.mesh); } });
    pickups = [];
    if (coverRoot) { coverRoot.parent && coverRoot.parent.remove(coverRoot); disposeGeo(coverRoot); coverRoot = null; }
    if (bossPost) { tagOff(bossPost); bossPost = null; }
    sparks.forEach((s) => s.parent && s.parent.remove(s));
    clearFx2();
    breakables = [];
    fallers.forEach((m) => m.parent && m.parent.remove(m));
    fallers.length = 0;
    brokenN = 0; brokenPts = 0;
    window.__broken = { n: 0, pts: 0 };
    sparks = [];
    smokes.forEach((s) => s.parent && s.parent.remove(s));
    smokes = [];
    shells.forEach((s) => s.parent && s.parent.remove(s));
    shells = [];
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
    landCovers = [];
    walkBlockers = [];
    if (radioEl) { radioEl.classList.remove("show"); }
    radioHideAt = 0;
    introT = 0;
    introLineI = 0;
    waves.forEach((w) => { w.staged = null; w.covers = null; });
  }

  function showHud(on) {
    if (hud) hud.style.display = on ? "" : "none";
    if (!on) threatEls.forEach((d) => { d.style.display = "none"; });
    const xh = document.getElementById("railX");
    if (xh) xh.style.display = on ? "" : "none";
    const rb = document.getElementById("railReload");
    if (rb) rb.style.display = on ? "" : "none";
    const nb = document.getElementById("railNade");
    if (nb) nb.style.display = on ? "" : "none";
    const pb = document.getElementById("railPause");
    if (pb) pb.style.display = on ? "" : "none";
  }

  /* (v26) pause menu: the button top right (or Esc / P, or the app going to
     the background) freezes the mission; resume, restart, or leave */
  let pauseOpen = false;
  function openPause(ctx) {
    if (pauseOpen || contOpen || ended || finishing || !active || phase === "intro") return;
    pauseOpen = true;
    active = false;
    const pausedAt = performance.now();
    const ko = (document.documentElement.lang || "").startsWith("ko");
    try { window.GunSFX && window.GunSFX.stopLoops && window.GunSFX.stopLoops(); window.GunSFX.bgm(false); } catch (e) {}
    posts.forEach((p) => tagOff(p));
    const box = document.createElement("div");
    box.id = "railPauseMenu";
    const muted = () => { try { return localStorage.getItem("myeolgong_sound") === "0"; } catch (e) { return false; } };
    box.innerHTML = '<div class="pc"><p class="k">' + (STAGE.label || "") + " · " + (STAGE.city ? "" : "") + (ko ? "작전 일시정지" : "PAUSED") + "</p><h2>" + (ko ? "일시정지" : "PAUSED") + "</h2>" +
      '<button class="primary" data-a="resume" type="button">▶ ' + (ko ? "계속하기" : "RESUME") + "</button>" +
      '<button data-a="restart" type="button">↻ ' + (ko ? "처음부터 다시" : "RESTART") + "</button>" +
      '<button data-a="title" type="button">⌂ ' + (ko ? "메뉴로 돌아가기" : "MAIN MENU") + "</button>" +
      '<div class="row"><button data-a="sound" type="button">' + (muted() ? "🔇 " + (ko ? "소리 켜기" : "SOUND ON") : "🔊 " + (ko ? "소리 끄기" : "SOUND OFF")) + "</button>" +
      '<button data-a="gfx" type="button">🖥 ' + (ko ? "그래픽: " : "GFX: ") + ((window.MGPost && window.MGPost.quality) || "auto") + "</button></div>" +
      '<p class="tip">' + (ko ? "점수 " : "SCORE ") + ((ctx.G && ctx.G.score) || 0).toLocaleString() + " · HP " + Math.max(0, hp) + " · " + (ko ? "목숨 " : "LIVES ") + lives + "</p></div>";
    document.body.appendChild(box);
    const resume = () => {
      box.remove();
      pauseOpen = false;
      const now = performance.now();
      t0 += now - pausedAt;
      frame._t = now;
      active = true;
      try { window.GunSFX && window.GunSFX.bgm(true, false); } catch (e) {}
    };
    box.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("button[data-a]");
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const a = b.getAttribute("data-a");
      if (a === "resume") resume();
      else if (a === "restart") { box.remove(); pauseOpen = false; try { window.MG && window.MG.playStage(stageId); } catch (err) {} }
      else if (a === "title") { box.remove(); pauseOpen = false; try { window.MG && window.MG.toTitle(); } catch (err) {} }
      else if (a === "sound") { const sb = document.getElementById("mgSound"); if (sb) sb.click(); setTimeout(() => { b.textContent = muted() ? "🔇 " + (ko ? "소리 켜기" : "SOUND ON") : "🔊 " + (ko ? "소리 끄기" : "SOUND OFF"); try { window.GunSFX && window.GunSFX.bgm(false); } catch (err) {} }, 50); }
      else if (a === "gfx") { const gb = document.getElementById("mgGfx"); if (gb) gb.click(); setTimeout(() => { b.textContent = "🖥 " + (ko ? "그래픽: " : "GFX: ") + ((window.MGPost && window.MGPost.pref) || "auto"); }, 50); }
    });
    box.__resume = resume;
  }

  /* ---- weapons (v16) ----
     pistol: 20 rounds, reloads forever. Pick-ups: SMG (holds the trigger,
     45 rounds), pump shotgun (8 shells, a spread of pellets), grenades
     (G key / the G button: a lobbed blast that clears a cluster). A special
     weapon runs dry back to the pistol; there is no reloading it. */
  const WEAPONS = {
    pistol: { rate: 130, snd: "shot", kick: 1, label: "BULLET" },
    smg: { rate: 82, snd: "smg", kick: 0.55, label: "SMG", ammo: 45 },
    shotgun: { rate: 460, snd: "shotgun", kick: 1.6, label: "SHOTGUN", ammo: 8, pellets: 7, spread: 0.075 }
  };
  let weapon = "pistol", wAmmo = 0, grenades = 2, holding = false;
  let weaponRig = null;
  const nades = [];
  window.__nades = nades;
  function setWeapon(w, ammo) {
    weapon = WEAPONS[w] ? w : "pistol";
    wAmmo = weapon === "pistol" ? 0 : (ammo != null ? ammo : WEAPONS[weapon].ammo);
    if (weaponRig) {
      const pistolOn = weapon === "pistol";
      weaponRig.base.forEach((m) => { m.visible = pistolOn; });
      if (weaponRig.codeGun) weaponRig.codeGun.forEach((m) => { m.visible = pistolOn && !weaponRig.pistolLoaded; });
      if (weaponRig.pistolHost) weaponRig.pistolHost.visible = pistolOn && !!weaponRig.pistolLoaded;
      weaponRig.smg.visible = weapon === "smg" && !weaponRig.rifleLoaded;
      if (weaponRig.rifleHost) weaponRig.rifleHost.visible = weapon === "smg" && !!weaponRig.rifleLoaded;
      weaponRig.shotgun.visible = weapon === "shotgun";
      const dz = weapon === "smg" ? -0.44 : weapon === "shotgun" ? -0.8 : 0;
      if (flash) flash.position.z = weaponRig.flashZ.f + dz;
      if (flashHalo) flashHalo.position.z = weaponRig.flashZ.h + dz;
      if (flashStar) flashStar.position.z = weaponRig.flashZ.s + dz;
      if (flashLight) flashLight.position.z = weaponRig.flashZ.l + dz;
    }
    window.__weapon = { w: weapon, ammo: wAmmo, nades: grenades };
  }

  function resetNumbers(ctx) {
    readProfile();
    armor = 0;
    slowmo = 0; slowK = 1; finishing = false; finishNow = false; invulT = 0; pauseOpen = false;
    { const sh = document.getElementById("railShield"); if (sh) sh.remove(); const pm = document.getElementById("railPauseMenu"); if (pm) pm.remove(); }
    clock = CLOCK0; bullets = 20; hp = HPMAX; lives = LIVES0; continues = 0; contOpen = false;
    grenades = 2 + (PERK.nades || 0); holding = false;
    if (LOAD) {
      grenades += LOAD.nades || 0;
      if (LOAD.vest) armor = 60;
      if (LOAD.life) lives += 1;
      if (LOAD.mag) clipMax = 28;
    } else clipMax = 20;
    bullets = clipMax;
    nades.forEach((n) => n.mesh.parent && n.mesh.parent.remove(n.mesh));
    nades.length = 0;
    setWeapon("pistol");
    if (LOAD && LOAD.start) setWeapon(LOAD.start, LOAD.start === "smg" ? 90 : 16);
    combo = 0; bestCombo = 0; shotsFired = 0; shotsHit = 0; hostageHits = 0;
    MS.kills = 0; MS.heads = 0; MS.bikes = 0; MS.nades = 0;
    lastShot = 0; reloading = false; reloadK = 0; recoil = 0; hitStop = 0; shake = 0;
    pathU = 0; camX = 0; waveI = 0; wave = null; waveT = 0; waveClean = true; ended = false;
    bossSpawned = false;
    window.__allyShots = 0;
    aimN = { x: 0, y: 0.1 };
    if (ctx && ctx.G) ctx.G.score = 0;
    if (hud) hud._score = 0;
  }

  /* (v36) the first-person sleeves and hands wear the player's own uniform:
     a tile cut from the sleeve of that uniform's skin, and the hand colour
     from its hand (bare skin or gloves) */
  const armTexC = {};
  function applyArmUni() {
    const mats = window.__armMats;
    if (!mats || !mats.length) return;
    let uni = "u-army";
    try { uni = (window.MGProfile && window.MGProfile.uni && window.MGProfile.uni()) || "u-army"; } catch (e) {}
    const tx = kTex(uni), img = tx.image;
    if (!img || !img.complete || !img.naturalWidth) {
      if (!applyArmUni._w) { applyArmUni._w = 1; setTimeout(() => { applyArmUni._w = 0; applyArmUni(); }, 400); }
      return;
    }
    let sl = armTexC[uni];
    if (!sl) {
      const k = img.naturalWidth / 1024;
      const cv = document.createElement("canvas"); cv.width = 32; cv.height = 48;
      const g = cv.getContext("2d"); g.imageSmoothingEnabled = false;
      /* the right arm's front face, cuff and hand left out */
      g.drawImage(img, 549 * k, 606 * k, 54 * k, 112 * k, 0, 0, 32, 48);
      const hc = document.createElement("canvas"); hc.width = 4; hc.height = 4;
      const hg = hc.getContext("2d"); hg.drawImage(img, 560 * k, 748 * k, 30 * k, 12 * k, 0, 0, 4, 4);
      const d = hg.getImageData(0, 0, 4, 4).data; let r = 0, gg = 0, b = 0;
      for (let i = 0; i < 64; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
      sl = armTexC[uni] = { cv: cv, hand: new T.Color(r / 16 / 255, gg / 16 / 255, b / 16 / 255).convertSRGBToLinear() };
    }
    mats.forEach((m) => {
      const t = new T.CanvasTexture(sl.cv);
      t.encoding = T.sRGBEncoding; t.magFilter = T.NearestFilter; t.wrapS = t.wrapT = T.RepeatWrapping;
      const rp = m.userData.rep || [1, 1];
      t.repeat.set(Math.max(1, Math.round(rp[0] * 0.5)), Math.max(1, Math.round(rp[1] * 0.5)));
      if (m.map && m.map !== t) m.map.dispose && m.userData.ownMap && m.map.dispose();
      m.map = t; m.userData.ownMap = 1; m.bumpMap = null; m.color.setRGB(1, 1, 1); m.needsUpdate = true;
    });
    if (window.__armSkin) window.__armSkin.color.copy(sl.hand);
  }
  function boot(ctx) {
    booted = true;
    css();
    document.documentElement.classList.add("rail-on");
    if (ctx.scene && ctx.camera && !ctx.camera.parent) ctx.scene.add(ctx.camera);
    const rig = makePistol(ctx.camera);
    try { applyArmUni(); } catch (e) {}
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
    flashStar = rig.star;
    flashLight = rig.light;
    weaponRig = rig.weapons;
    window.__pistol = pistol;
    /* model factory hooks (handy for eyeballing the cast without playing) */
    window.__mk = { soldier: makeSoldier, ally: makeAlly, rifle: makeRifle, commander: () => { const m = makeSoldier("boss"); dressCommander(m); return m; }, heli: makeHeliModel, tank: makeTankModel };
    window.__pistolAim = pistolAim;
    window.__pistolBody = pistolBody;
    const btn = document.createElement("button");
    btn.id = "railReload";
    btn.type = "button";
    btn.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="15" y="12" width="10" height="17" rx="1.6" fill="#e9eef2"/><rect x="15" y="12" width="10" height="3" fill="#9fb0bf"/>' +
      '<path d="M17 18h6M17 21.5h6M17 25h6" stroke="#5f7080" stroke-width="1.4"/><path d="M9.5 20a10.5 10.5 0 0 1 17.6-7.7" stroke="#7fd0ff" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M28.6 8.6l-.6 5.4-5.2-1.2z" fill="#7fd0ff"/><path d="M30.5 20a10.5 10.5 0 0 1-17.6 7.7" stroke="#7fd0ff" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M11.4 31.4l.6-5.4 5.2 1.2z" fill="#7fd0ff"/></svg>';
    btn.setAttribute("aria-label", "reload");
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); window.RAIL.reload(); });
    document.body.appendChild(btn);
    const nb = document.createElement("button");
    nb.id = "railNade";
    nb.type = "button";
    nb.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="19" cy="24.5" rx="9.5" ry="10.5" fill="#6b7a3a"/><path d="M10 21h18M10 26.5h18M15 14.6v19.8M23 14.6v19.8" stroke="#3e4a1c" stroke-width="1.6"/>' +
      '<ellipse cx="16" cy="20" rx="3" ry="4" fill="rgba(255,255,255,.22)"/><rect x="14.5" y="10.5" width="9" height="5" rx="1" fill="#9aa1a6"/><path d="M23.5 11.5l7 5.5-1.4 1.6-6.6-4.6z" fill="#c9ced2"/>' +
      '<circle cx="11.5" cy="10.5" r="3.6" fill="none" stroke="#ffd36a" stroke-width="2"/><path d="M14.6 11.6l1.6 .6" stroke="#ffd36a" stroke-width="2"/></svg><b class="cnt">2</b>';
    nb.setAttribute("aria-label", "grenade");
    nb.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); window.RAIL.grenade(); });
    document.body.appendChild(nb);
    const pbt = document.createElement("button");
    pbt.id = "railPause";
    pbt.type = "button";
    pbt.setAttribute("aria-label", "pause");
    pbt.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.2" fill="#fff"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2" fill="#fff"/></svg>';
    pbt.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); openPause(window.__railCtx); });
    document.body.appendChild(pbt);
    if (!window.__railPauseKeys) {
      window.__railPauseKeys = 1;
      addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "p" || e.key === "P") {
          const m = document.getElementById("railPauseMenu");
          if (m && m.__resume) m.__resume(); else openPause(window.__railCtx);
        }
      });
      document.addEventListener("visibilitychange", () => { if (document.hidden) openPause(window.__railCtx); });
    }
    if (!window.__railKeys) {
      window.__railKeys = 1;
      const aimAt = (e) => { if (e) pointerFrom(e); };
      addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") aimAt(e); });
      const shootAt = (e) => {
        if (!active || ended) return;
        if (pauseOpen) return;
        if (e.target && (e.target.id === "railReload" || e.target.id === "railNade" || e.target.id === "railPause" || e.target.closest && e.target.closest("#railResult,#mgTitle"))) return;
        if (e.button === 2) { window.RAIL.reload(); return; }
        if (e.button != null && e.button !== 0) return;
        aimAt(e);
        window.__lastXY = [e.clientX, e.clientY, e.type];
        window.RAIL.fire();
      };
      addEventListener("pointerdown", (e) => {
        shootAt(e);
        if (e.button == null || e.button === 0) {
          if (!(e.target && e.target.closest && e.target.closest("#railReload,#railNade,#railResult,#mgTitle"))) holding = true;
        }
      });
      addEventListener("mousedown", shootAt);
      const release = () => { holding = false; };
      addEventListener("pointerup", release);
      addEventListener("pointercancel", release);
      addEventListener("blur", release);
      /* a held finger that slides keeps steering the SMG stream */
      addEventListener("pointermove", (e) => { if (holding && e.pointerType !== "mouse") aimAt(e); });
      addEventListener("contextmenu", (e) => { if (armed) e.preventDefault(); });
      addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable)) return;
 if (e.code === "KeyG" || (e.key || "").toLowerCase() === "g" || e.key === "ㅎ") { e.preventDefault(); if (!e.repeat) window.RAIL.grenade(); return; }
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

  function begin(ctx, stageIdIn) {
    TUT.checked = false; TUT.on = false; tutHide();
    threatEls.forEach((d) => { d.style.display = "none"; });
    try { applyArmUni(); } catch (e) {}
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
    setStage(stageIdIn || 1);
    resetNumbers(ctx);
    buildWaves();
    coverRoot = new T.Group();
    coverRoot.name = "covers";
    ctx.scene.add(coverRoot);
    /* every zone's sandbags, crates and doorways are part of the course from
       the start: nothing the enemy hides behind may appear after he does */
    try { prebuildCovers(); } catch (err) { window.__coverErr = String(err && err.stack || err); }
    buildPickups(ctx);
    const td0 = performance.now();
    try { dressBattlefield(ctx); } catch (err) { window.__dressErr = String(err && err.stack || err); }
    window.__dressMs = +(performance.now() - td0).toFixed(0);
    /* walls, for stopping bullets */
    wallList = [];
    try {
      if (dress && dress.root) dress.root.traverse((o) => { if (o.isMesh && o.userData && o.userData.wall) wallList.push(o); });
    } catch (e) {}
    try { rebuildWallBoxes(); } catch (err) { window.__wallErr = String(err && err.stack || err); }
    try { declutter(); } catch (err) { window.__declutterErr = String(err && err.stack || err); }
    try {
      const tb0 = performance.now();
      buildRailBlockers(ctx);
      const tb1 = performance.now();
      planSteer(waves.map((w) => w.u).concat([bossU, 0]));
      window.__steerMs = [+(tb1 - tb0).toFixed(0), +(performance.now() - tb1).toFixed(0)];
    } catch (err) { window.__blockErr = String(err && err.stack || err); }
    steerOff = 0;
    try { stageWave(waves[0]); } catch (err) { window.__stageErr = String(err && err.stack || err); }
    const cam = ctx.camera;
    cam.near = 0.06; cam.fov = viewFov(); cam.far = 320;
    introT = 0;
    introT0 = performance.now();
    introLineI = 0;
    if (STAGE.introCam) {
      /* a short cinematic: the camera drops out of the sky over the wire and
         settles onto the rail while command opens the stage on the radio */
      const a = STAGE.introCam[0];
      cam.position.set(a[0], a[1], a[2]);
      cam.lookAt(a[3], a[4], a[5]);
      cam.updateProjectionMatrix();
      lookSmooth.set(a[3], a[4], a[5]);
      phase = "intro";
      if (radioEl) radioEl.classList.remove("show");
      radioHideAt = 0;
    } else {
      const p0 = pathAt(0);
      cam.position.set(p0.x, CAM_Y, p0.z);
      const a0 = pathAt(7 / pathLen);
      cam.lookAt(a0.x, 1.45, a0.z);
      lookSmooth.set(a0.x, 1.45, a0.z);
      phase = "move";
    }
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
    try { window.GunSFX && window.GunSFX.song && window.GunSFX.song(STAGE.music || "seoul"); } catch (e) {}
    try { window.GunSFX && window.GunSFX.bgm(true, false); } catch (e) {}
    window.__railPhase = phase;
    return true;
  }

  /* (v21) engine noise for everything with a motor, by distance */
  function stepEngines(ctx) {
    const G = window.GunSFX;
    if (!G || !G.loop) return;
    const cam = ctx.camera.position;
    const gainAt = (x, z, near, far, top) => { const d = Math.hypot(x - cam.x, z - cam.z); return d > far ? 0 : top * Math.min(1, Math.max(0.05, 1 - (d - near) / (far - near))); };
    posts.forEach((p, i) => {
      if (!p.mesh || p.e.alive === false && !(p.air === "heli" && p.mesh.visible)) return;
      if (p.air === "heli") {
        const g = gainAt(p.x, p.z, 8, 60, p.isBoss ? 0.34 : 0.24);
        if (g > 0.003) G.loop("h" + (p.uid || (p.uid = Math.random().toString(36).slice(2))), "rotor", g);
      } else if (p.air === "apc" && p.e.alive !== false) {
        const g = gainAt(p.x, p.z, 6, 50, 0.3);
        if (g > 0.003) G.loop("t" + (p.uid || (p.uid = Math.random().toString(36).slice(2))), "diesel", g);
      } else if (p.bikeMesh && p.e.alive !== false && p.bikeMesh.parent === p.mesh && (p.chase || (p.run && p.runT >= 0 && p.runT < p.run.dur))) {
        const g = gainAt(p.x, p.z, 4, 40, 0.2);
        if (g > 0.003) G.loop("b" + (p.uid || (p.uid = Math.random().toString(36).slice(2))), "bike", g, p.chase ? 1.25 : 1.1);
      }
    });
    if (chase) G.loop("jeep", "jeep", chase.boat ? 0.16 : 0.12, (chase.boat ? 0.8 : 1) + Math.sin(chase.t * 0.7) * 0.08);
  }

  function pause() {
    try { window.GunSFX && window.GunSFX.stopLoops && window.GunSFX.stopLoops(); } catch (e) {}
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
    if (m.air === "heli") return makeHeliPost(w, m, i);
    if (m.air === "para") return makeParaPost(w, m, i);
    const p = waveXY(w, m.lat || 0, m.dep || 8);
    const sc = roleScale(role);
    let sx = p.x, sz = p.z;
    if (wallBoxes.length) {
      const hx = w.hold ? w.hold.x : sx, hz = w.hold ? w.hold.z : sz - 1;
      const dl = Math.hypot(sx - hx, sz - hz) || 1;
      const free = pushOutOfWalls(sx, sz, 0.4, { x: (sx - hx) / dl, z: (sz - hz) / dl });
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
    if (m.run && m.route) {
      /* an assault trooper who runs the open ground between two waypoints:
         he has no cover prop of his own, and every step is checked against
         the walls and props so he never runs through a fence */
      post.runner = { route: m.route.map(([la, de]) => waveXY(w, la, de)), i: 1 };
      post.spd = m.spd || 2.5;
      const r0 = waveXY(w, m.route[0][0], m.route[0][1]);
      post.x = r0.x;
      post.z = r0.z;
      post.y = 0.3;
      post.pathI = 0;
      post.wait = 1.0 + Math.random() * 0.8;
      post.state = "run";
    }
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
    } else if (post.runner) {
      post.expose = 1;
      roleTag(post.e);
      if (post.e._tag) post.e._tag.style.display = "none";
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
        let cpath = c0.path;
        try { cpath = clearPath(c0.path, 1.3); } catch (e) {}
        post.car = { g: truck, path: cpath, speed: c0.speed || 5, delay: c0.delay || 0, seg: 0, t: 0, moving: true };
        post.y = 1.38;
        post.coverTop = 1.66;
        post.coverCX = c0.path[0][0];
        post.coverCZ = c0.path[0][1];
        post.x = c0.path[0][0];
        post.z = c0.path[0][1] - 1.0;
        post.mesh.position.set(post.x, post.y, post.z);
      } catch (err) { window.__carErr = String(err && err.stack || err); }
    }
    /* stage 1's charger uses `run: { from, dur }`; stage 2's uses
       `run: true, route: [...]` and is driven by post.runner above */
    if (m.run && m.run.from) {
      post.run = { from: m.run.from, dest: [post.x, post.z], dur: m.run.dur || 3.5, delay: m.run.delay || 0 };
      post.runT = -(m.run.delay || 0);
      post.runPhase = 0;
      if (m.bike && post.mesh) {
        /* he rides in on a motorcycle and gets off at his cover; (v20) slower
           and from nearer the front, so the ride itself is a target */
        post.run.dur = Math.max(3.6, post.run.dur);
        const bk = makeMotorbike();
        bk.scale.setScalar(1 / (post.mesh.scale.x || 1));
        /* (v23) seated: the bike sits on the ground and his hips sit on the
           saddle (saddle top 0.98 above the ground, 0.28 m behind the axle line) */
        const scB = post.mesh.scale.x || 1;
        bk.position.set(0, (0.34 - rideY(post)) / scB, 0.3 / scB);
        post.mesh.add(bk);
        post.bikeMesh = bk;
        post.mesh.position.set(m.run.from[0], post.y, m.run.from[1]);
        post.x = m.run.from[0]; post.z = m.run.from[1];
        post.y = rideY(post);
        post.bikeYaw = Math.atan2(post.run.dest[0] - post.x, post.run.dest[1] - post.z);
      }
    }
    posePost(post, { x: (w && w.hold && w.hold.x) || 0, y: CAM_Y, z: (w && w.hold && w.hold.z) || 0 }, 0);
    if (post.bikeMesh) { applyRidePose(post, post.bikeYaw, 0); post.bikeMesh.userData.stand.visible = false; }
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
    vehB = null;
    w.staged.forEach((p) => {
      if (!p || !p.bikeMesh || !p.run || !p.run.from || p.chase) return;
      const f = clearRunFrom(p.run.from, p.run.dest, 0.55);
      if (f !== p.run.from) {
        p.run.from = f;
        p.x = f[0]; p.z = f[1];
        p.mesh.position.set(p.x, p.y, p.z);
        p.bikeYaw = Math.atan2(p.run.dest[0] - p.x, p.run.dest[1] - p.z);
      }
    });
    w.staged.forEach((p, i) => {
      if (!p) return;
      p.live = true;
      if (p.air === "heli" || p.air === "apc") {
        p.aim = (p.aimMax || 2.4) * (0.55 + Math.random() * 0.45);
        p.burstN = 0;
        p.state = p.air === "heli" ? "hover" : "hidden";
        if (p.e._tag) p.e._tag.style.display = "none";
        return;
      }
      if (p.air === "para") {
        p.state = "drop";
        p.aim = (p.aimMax || 2.4) * (0.7 + Math.random() * 0.5);
        p.burstN = 0;
        return;
      }
      p.state = p.role === "hostage" ? "civ" : (p.runner ? "run" : "hidden");
      p.stateT = 0.7 + i * 0.42 + Math.random() * 0.7 + i * 0.12;
      p.expose = p.role === "hostage" || p.runner ? 1 : 0;
      p.aim = p.aimMax;
      p.burstN = 0;
      p.recoil = 0;
    });
    if (w.def && w.def.radio) radio(w.def.radio, 4600);
    window.__railPhase = "fight";
  }

  /* (v20) the final boss: a fictional supreme commander. A white dress
     uniform, an oversized peaked cap with a gold badge, gold epaulettes,
     rows of medals, a red sash and a gilded rifle — the dictator of every
     cartoon, modelled on nobody. The tactical gear of the officer comes off. */
  function dressCommander(mesh) {
    const u = mesh.userData;
    const body = u.body;
    if (!body) return;
    if (u.kenney) {
      /* (v27) the block-character commander: white dress-uniform skin with
         medals and a red sash, a parade cap, gold epaulettes, a gilded rifle */
      kMat("cmd"); kMat("cmd", true);
      const cm = rimMat(kMat("cmd"));
      u.kMeshes.forEach((m) => { m.material = cm; });
      u.kSkin = "cmd";
      if (u.kCap) u.kCap.visible = false;
      const gold = kKit("#e0b440", 0.3), white = kKit("#f0ece0", 0.55), red = kKit("#a8231c"), blk = kKit("#0c0c0e", 0.25);
      const B = (par, w, h, d, x, y, z, m) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); par.add(b); return b; };
      const hd = u.kHead, to = u.kTorso;
      B(hd, 11.6, 2.6, 11.8, 0, 9.9, -0.3, white); B(hd, 9.6, 1.3, 9.8, 0, 8.3, 0, red);
      B(hd, 10.0, 0.4, 3.6, 0, 7.7, 5.6, blk); B(hd, 9.8, 0.35, 0.4, 0, 8.95, 5.0, gold); B(hd, 3.2, 2.6, 0.45, 0, 10.0, 5.95, gold);
      [-1, 1].forEach((sx) => { B(to, 0.32, 0.08, 0.42, sx * 0.44, 1.23, 0, gold); for (let k = 0; k < 4; k++) B(to, 0.04, 0.12, 0.04, sx * (0.32 + k * 0.07), 1.15, 0.18, gold); });
      if (u.rifle) u.rifle.traverse((o) => { if (o.isMesh) o.material = gold; });
      mesh.scale.multiplyScalar(1.08);
      return;
    }
    const white = new T.MeshStandardMaterial({ color: 0xece6d4, roughness: 0.62, metalness: 0.02 });
    const white2 = new T.MeshStandardMaterial({ color: 0xd9d1bc, roughness: 0.7 });
    const gold = new T.MeshStandardMaterial({ color: 0xe0b440, roughness: 0.28, metalness: 0.85, emissive: 0x2a1c00 });
    const red = new T.MeshStandardMaterial({ color: 0xb8231c, roughness: 0.55 });
    const blackG = new T.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.18, metalness: 0.4 });
    /* soldiers get their own copies of the shared materials (for the hit
       flash), so match a copy to its source by texture and colour */
    const same = (m, src) => !!(m && src) && (m === src || (m.map === src.map && m.color && src.color && m.color.equals(src.color)));
    const isAny = (m, list) => list.some((x) => same(m, x));
    const gear = [SOL.plate, SOL.strap, SOL.oliveDark, SOL.steel, SOL.rubber];
    body.traverse((o) => {
      if (!o.isMesh) return;
      if (o.parent === u.headG) return;
      if (u.rifle && (o === u.rifle || (o.parent && (o.parent === u.rifle || o.parent.parent === u.rifle)))) return;
      if (isAny(o.material, gear)) { o.visible = false; return; }
      if (same(o.material, SOL.enemyDark) && o.parent === body && Math.abs(o.position.z) > 0.18) { o.visible = false; return; }
      if (same(o.material, SOL.black) && o.parent === body && o.position.x > 0.25) { o.visible = false; return; }
      if (isAny(o.material, [SOL.camoBoss, SOL.enemyCloth, SOL.camoDark])) o.material = white;
      else if (same(o.material, SOL.enemyDark)) o.material = white2;
    });
    const add = (parent, w, h, d, x, y, z, m, rz) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (rz) o.rotation.z = rz; parent.add(o); return o; };
    /* the cap: the officer's comes off, a parade cap goes on */
    if (u.headG) {
      u.headG.children.forEach((c) => { if (c.isMesh && c.position.y >= 0.33 && c.material !== SOL.skin && c.material !== SOL.hair) c.visible = false; });
      add(u.headG, 0.6, 0.15, 0.6, 0, 0.5, -0.01, white);
      add(u.headG, 0.5, 0.09, 0.5, 0, 0.4, 0, red);
      add(u.headG, 0.54, 0.04, 0.26, 0, 0.375, 0.27, blackG).rotation.x = 0.12;
      add(u.headG, 0.5, 0.03, 0.03, 0, 0.395, 0.4, gold);
      add(u.headG, 0.18, 0.14, 0.03, 0, 0.5, 0.31, gold);
      add(u.headG, 0.08, 0.07, 0.035, 0, 0.5, 0.325, red);
    }
    /* collar, buttons, sash, epaulettes, medals */
    add(body, 0.32, 0.08, 0.05, 0, 1.2, 0.165, white2);
    [1.14, 1.06, 0.98, 0.9].forEach((y) => add(body, 0.035, 0.035, 0.02, 0.035, y, 0.178, gold));
    add(body, 0.09, 0.62, 0.025, 0.02, 1.0, 0.185, red, 0.62);
    [-1, 1].forEach((sx) => {
      add(body, 0.2, 0.05, 0.26, sx * 0.3, 1.24, 0, gold);
      for (let k = 0; k < 4; k++) add(body, 0.025, 0.07, 0.025, sx * (0.22 + k * 0.05), 1.19, 0.12, gold);
    });
    const medC = [0xe0b440, 0xb8231c, 0x2a5cb8, 0xe0b440, 0x2f8a3a, 0xc0c4c8, 0xe0b440, 0xb8231c, 0xe0b440];
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {
      const m = new T.MeshStandardMaterial({ color: medC[r * 3 + k], roughness: 0.35, metalness: 0.6 });
      add(body, 0.05, 0.045, 0.02, -0.2 + k * 0.06, 1.11 - r * 0.06, 0.178, m);
    }
    add(body, 0.06, 0.06, 0.02, -0.14, 0.93, 0.18, gold);
    if (u.rifle) u.rifle.traverse((o) => { if (o.isMesh) o.material = gold; });
    mesh.scale.multiplyScalar(1.08);
  }

  /* the commander, staged the same way, behind whichever heavy barrier of the
     yard he starts from */
  function stageBoss() {
    if (bossStage) return bossStage;
    if (STAGE.bossKind === "apc") return stageBoss2();
    if (STAGE.bossKind === "heli") return stageBossHeli();
    const w = { yaw: bossYaw, hold: bossHold, covers: bossCovers };
    const spot = BOSS_DEF.spots[1];
    const post = makePost(w, { role: "boss", lat: spot[0], dep: spot[1], cover: "heavy" }, 1);
    post.isBoss = true;
    if (STAGE.bossKind === "commander") {
      try { dressCommander(post.mesh); } catch (err) { window.__cmdErr = String(err && err.stack || err); }
      post.e.hp = Math.round((STAGE.bossHp || 40) * (DIFF.boss || 1));
      post.commander = true;
      post.phaseN = 0;
      post.aimMax *= 0.85;
    }
    /* (v16) every boss carries a gauge, not only the armour */
    post.hpMax = post.e.hp || 1;
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

  /* (v20) the Stage 3 gunship: a heavier airframe that strafes the square,
     lays rocket salvos you can break up by pouring fire into it, and calls
     paratroopers as it weakens */
  function stageBossHeli() {
    const w = { yaw: bossYaw, hold: bossHold };
    const post = makeHeliPost(w, { air: "heli", lat: 0, dep: 24, y: 12, front: 16, sweep: 7.5, flyY: 5.0 }, 0);
    post.isBoss = true;
    post.e.hp = Math.round((STAGE.bossHp || 46) * (DIFF.boss || 1));
    post.hpMax = post.e.hp;
    post.phaseN = 0;
    post.rocketT = 6;
    post.charge = 0;
    post.jam = 0;
    post.mesh.scale.multiplyScalar(1.45);
    post.orbitW = 0.5;
    bossPost = post;
    bossStage = post;
    return post;
  }
  function heliRockets(ctx, p, dt) {
    const u = p.mesh.userData;
    if (p.charge > 0) {
      p.charge -= dt;
      if (!p.pods) {
        p.pods = [-1, 1].map((sx) => {
          const m = new T.Mesh(new T.BoxGeometry(0.5, 0.5, 0.5), new T.MeshBasicMaterial({ color: 0xff4a1a, toneMapped: false, transparent: true, opacity: 0.9 }));
          m.position.set(sx * 1.1, -0.35, 0.6);
          p.mesh.add(m);
          return m;
        });
      }
      const pulse = 0.6 + Math.sin(performance.now() / 60) * 0.4;
      p.pods.forEach((m) => { m.visible = true; m.scale.setScalar(0.6 + (1 - p.charge / 1.8) * 1.2 * pulse); });
      if (p.charge <= 0) {
        p.pods.forEach((m) => (m.visible = false));
        const cam = ctx.camera.position;
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            if (ended) return;
            const from = new T.Vector3(p.x + (i % 2 ? 1.4 : -1.4), p.y - 0.4, p.z);
            const to = new T.Vector3(cam.x + (Math.random() - 0.5) * 3, 0.6 + Math.random(), cam.z + 3 + Math.random() * 2);
            tracerTo(ctx, from, to, 0xffb04a, 0.12);
            boomAt(ctx, to.x, to.y, to.z);
            gun("boom");
          }, i * 110);
        }
        shake = 1.5;
        hurtPlayer(ctx, 24);
        p.rocketT = 8 + Math.random() * 2;
      }
      return;
    }
    p.rocketT -= dt;
    if (p.rocketT <= 0) {
      p.charge = 1.8;
      p.jam = 0;
      if (!p.rocketCalled) { p.rocketCalled = 1; radio("로켓 포드 점화! 기체에 집중 사격하면 발사를 끊을 수 있다!", 3200); }
    }
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
      post.expose = post.air ? 1 : 0;
      if (post.air === "heli") { post.state = "hover"; post.enterT = 0; }
      post.aim = post.aimMax;
      post.burstN = 0;
      post.moveT = post.air === "apc" ? 3.2 : undefined;
    }
    if (STAGE.bossKind === "commander" && post) {
      /* two bodyguards step out in front of him */
      [-2.8, 2.8].forEach((lat, k) => {
        try {
          const g = makePost({ yaw: bossYaw, hold: bossHold }, { role: "tough", lat: lat, dep: 8.6 + k * 0.6 }, 40 + k);
          g.live = true; g.state = "hidden"; g.stateT = 0.5 + k * 0.6; g.guard = true;
        } catch (err) { window.__guardErr = String(err && err.stack || err); }
      });
    }
    try {
      const ko = (document.documentElement.lang || "").startsWith("ko");
      const BN = { man: ["적 지휘관", "ENEMY COMMANDER"], apc: [STAGE.bossTank ? "적 주력 전차" : "적 장갑차", STAGE.bossTank ? "MAIN BATTLE TANK" : "ARMOURED CAR"], heli: ["적 공격헬기", "ATTACK GUNSHIP"], commander: ["총사령관", "SUPREME LEADER"] };
      const bn = BN[STAGE.bossKind] || BN.man;
      cutIn(ko ? bn[0] : bn[1], (STAGE.label || "") + " · BOSS");
    } catch (e) {}
    if (STAGE.bossRadio) radio(STAGE.bossRadio, 4800);
    else if (STAGE.bossKind === "apc") radio("중장갑 차량 확인! 호위 병력 분리, 측면을 노려라!", 4800);
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
  function pushOutOfWalls(x, z, r, dir) {
    /* (v18) a man planted inside his own cover is moved straight BACK, away
       from the player, until he stands behind it; the old shallowest-axis push
       slid him out to the side, so he crouched in plain view ("hiding" next to
       the barrier). Only if backing off fails does the side push apply. */
    if (dir) {
      const hits = (px, pz) => wallBoxes.some((b) => !(b.max.y < 0.5 || b.min.y > 2.1) && px > b.min.x - r && px < b.max.x + r && pz > b.min.z - r && pz < b.max.z + r);
      if (hits(x, z)) {
        for (let k = 1; k <= 30; k++) {
          const px = x + dir.x * k * 0.1, pz = z + dir.z * k * 0.1;
          if (!hits(px, pz)) return { x: px, z: pz };
        }
      }
    }
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
    if (ended || finishing) return;
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
    /* arcade rule: a penalty (hostage hit) can take the score down to 0, never below */
    if (ctx.G && ctx.G.score < 0) ctx.G.score = 0;
  }

  let invulT = 0;
  function hurtPlayer(ctx, dmg) {
    if (ended || contOpen || finishing || pauseOpen || invulT > 0 || window.__railGod) return;
    let dd = Math.max(1, Math.round(dmg * (DIFF.dmg || 1)));
    if (TUT.on && TUT.step <= 2) dd = Math.max(1, Math.round(dd * 0.35));   // softened while learning
    if (armor > 0) { const a = Math.min(armor, Math.ceil(dd * 0.7)); armor -= a; dd -= a; }
    hp -= dd;
    try { window.MGPost && window.MGPost.hurt && window.MGPost.hurt(Math.min(1, 0.35 + dmg / 30)); } catch (e) {}
    shake = 0.7;
    flashScreen(0.6, "radial-gradient(circle at 50% 50%,rgba(255,90,70,.75),rgba(180,20,20,.35) 60%,rgba(120,0,0,0) 85%)");
    waveClean = false;
    combo = 0;
    try { ctx.snd && ctx.snd("hurt"); } catch (e) {}
    if (hp <= 0) {
      lives--;
      hp = HPMAX;
      if (lives <= 0) {
        if (practice) { lives = LIVES0; radio("연습 모드 — 전원 복귀, 계속 진행한다.", 2400); }
        else offerContinue(ctx);
      }
    }
  }

  /* (v20) the jeep chase: Stage 5 opens in the passenger seat of a jeep
     tearing down the border road. Bikers come head-on in pairs, take one
     telegraphed shot as they close and blow past; drop them while they
     ride for the crash and the bonus. */
  let chase = null, jeepRig = null;
  function makeJeepRig() {
    const g = new T.Group();
    const M = (c, r, m) => cmat(c, r, Math.min(0.4, m || 0));
    const olive = M(0x56603a, 0.85), oliveD = M(0x3a4226, 0.9), black = M(0x161616, 0.7), steel = M(0x6a7076, 0.45, 0.5);
    const lamp = new T.MeshBasicMaterial({ color: 0xfff2c8 });
    const B = (w, h, d, x, y, z, m, rx) => { const o = new T.Mesh(worldUV(new T.BoxGeometry(w, h, d)), m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; g.add(o); return o; };
    B(1.9, 0.2, 1.9, -0.45, -1.02, -2.25, olive, 0.04);             /* bonnet */
    for (let k = 0; k < 7; k++) B(0.04, 0.03, 1.6, -1.15 + k * 0.233, -0.91, -2.3, oliveD, 0.04); /* bonnet ribs */
    B(1.96, 0.07, 0.07, -0.45, -0.9, -1.28, steel);                 /* folded screen frame */
    [-1.39, 0.49].forEach((x) => B(0.06, 0.26, 0.06, x, -0.78, -1.28, steel));
    B(1.9, 0.05, 0.05, -0.45, -0.66, -1.28, steel);
    B(0.16, 0.13, 0.08, 0.66, -0.7, -1.32, black);                  /* mirror */
    B(0.04, 0.04, 0.2, 0.6, -0.74, -1.26, black);
    [-1.2, 0.3].forEach((x) => { B(0.2, 0.15, 0.06, x, -0.98, -3.22, lamp); B(0.26, 0.21, 0.05, x, -0.98, -3.2, black); });
    B(0.5, 0.05, 0.02, -0.45, -0.915, -1.55, new T.MeshBasicMaterial({ color: 0xd8d4c6 }));     /* unit number */
    const wheel = new T.Mesh(new T.TorusGeometry(0.2, 0.026, 6, 18), black);
    wheel.position.set(-0.98, -0.78, -0.95); wheel.rotation.x = -0.45; g.add(wheel);
    g.userData.wheel = wheel;
    g.visible = false;
    return g;
  }
  /* (v21) the Incheon landing craft: steel sides, a bow ramp, ribs and a
     bow gun, seen from the troop well */
  let boatRig = null;
  function makeBoatRig() {
    const g = new T.Group();
    const M = (c, r, m) => cmat(c, Math.max(0.3, r), Math.min(0.4, m || 0));
    const hull = M(0x6a7076, 0.6, 0.4), hullD = M(0x4a5056, 0.65, 0.4), deck = M(0x3e4246, 0.8, 0.2), rust = M(0x6a4a36, 0.8);
    const B = (w, h, d, x, y, z, m) => { const o = new T.Mesh(worldUV(new T.BoxGeometry(w, h, d)), m); o.position.set(x, y, z); g.add(o); return o; };
    [-1, 1].forEach((s) => {
      B(0.16, 0.9, 3.4, s * 1.3, -0.92, -1.9, hull);
      B(0.3, 0.08, 3.4, s * 1.24, -0.45, -1.9, hullD);
      for (let k = 0; k < 5; k++) B(0.06, 0.82, 0.08, s * 1.2, -0.95, -0.5 - k * 0.72, hullD);
      B(0.04, 0.12, 0.3, s * 1.18, -0.6, -1.4, rust);
    });
    B(2.6, 1.1, 0.16, 0, -0.82, -3.6, hull);
    B(2.6, 0.08, 0.3, 0, -0.26, -3.55, hullD);
    for (let k = 0; k < 4; k++) B(2.4, 0.05, 0.05, 0, -1.2 + k * 0.25, -3.5, hullD);
    B(2.5, 0.06, 3.4, 0, -1.38, -1.9, deck);
    const gun = new T.Group();
    const gm = M(0x2a2c2e, 0.5, 0.6);
    const b1 = new T.Mesh(new T.BoxGeometry(0.12, 0.12, 0.9), gm); b1.position.set(0, 0, -0.45); gun.add(b1);
    const b2 = new T.Mesh(new T.BoxGeometry(0.2, 0.18, 0.3), gm); gun.add(b2);
    gun.position.set(0.9, -0.12, -3.3); g.add(gun);
    g.visible = false;
    return g;
  }
  function makeEnemyBoat() {
    const g = new T.Group();
    const M = (c, r, m) => cmat(c, Math.max(0.3, r), Math.min(0.4, m || 0));
    const hull = M(0x4e5a44, 0.7, 0.2), dark = M(0x2a302a, 0.7), white = M(0xe8ece8, 0.6);
    const B = (w, h, d, x, y, z, m) => { const o = new T.Mesh(worldUV(new T.BoxGeometry(w, h, d)), m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
    B(1.7, 0.5, 4.2, 0, 0.1, 0, hull);
    B(1.3, 0.3, 1.0, 0, 0.1, 2.3, hull).rotation.x = 0.35;
    B(1.0, 0.6, 1.0, 0, 0.6, -0.8, dark);
    B(0.9, 0.08, 0.9, 0, 0.94, -0.8, white);
    B(1.74, 0.08, 4.24, 0, 0.36, 0, dark);
    g.userData.wake = B(1.9, 0.04, 1.4, 0, -0.1, -2.6, M(0xffffff, 0.3));
    return g;
  }
  function splashAt(ctx, x, z, big) {
    const m = new T.Mesh(new T.CylinderGeometry(0.5, 1.2, 1, 8, 1, true), new T.MeshBasicMaterial({ color: 0xf4f8fc, transparent: true, opacity: 0.85, depthWrite: false }));
    m.position.set(x, 0.5, z);
    m.userData.t = 0; m.userData.h = big ? 9 : 5;
    ctx.scene.add(m);
    chase.fx.push(m);
    if (big) gun("boom");
  }

  function startChase(ctx) {
    const boat = STAGE.chase === "boat";
    if (boat) {
      if (!boatRig) { boatRig = makeBoatRig(); ctx.camera.add(boatRig); }
      boatRig.visible = true;
      if (jeepRig) jeepRig.visible = false;
    } else {
      if (!jeepRig) { jeepRig = makeJeepRig(); ctx.camera.add(jeepRig); }
      jeepRig.visible = true;
      if (boatRig) boatRig.visible = false;
    }
    chase = { t: 0, i: 0, plan: [1.4, 3.0, 5.2, 7.0, 9.2, 11.4, 13.0, 15.2], riders: [], boat: boat, fx: [], sink: [], splashT: 0.6 };
    if (boat) {
      if (dress && dress.ally) dress.ally.visible = false;
      radio("상륙정 전진! 적 경비정이 다가온다, 해안까지 버텨라!", 3400);
      return;
    }
    if (dress && dress.ally) dress.ally.visible = false;
    radio("추격전! 국경 도로 돌파 중 — 정면에서 적 오토바이 부대!", 3400);
    gun("motor");
  }
  function spawnChaser(ctx, lat, k) {
    let ahead = 36;
    if (chase.boat) {
      /* boats stay on the water: never spawn past the shoreline */
      const here = pathAt(pathU);
      ahead = Math.min(36, -74 - here.z);
      if (ahead < 12) return null;
    }
    const u = Math.min(1, pathU + ahead / pathLen);
    const pt = pathAt(u);
    const p = chase.boat
      ? makePost({ yaw: 0, hold: { x: pt.x, z: pt.z - 2 } }, { role: k % 3 === 2 ? "tough" : "weak", lat: 0, dep: 2 }, 70 + k)
      : makePost({ yaw: 0, hold: { x: pt.x, z: pt.z - 2 } }, { role: k % 3 === 2 ? "tough" : "weak", lat: 0, dep: 2, bike: true, run: { from: [pt.x, pt.z], dur: 99, delay: 0 } }, 70 + k);
    if (chase.boat && p.mesh) {
      const bt = makeEnemyBoat();
      const sc = p.mesh.scale.x || 1;
      bt.scale.setScalar(1 / sc);
      bt.position.set(0, -0.42 / sc, 0);
      bt.rotation.y = Math.PI;
      p.mesh.add(bt);
      p.mount = bt;
    }
    p.run = null;
    p.live = true;
    p.state = "chase";
    p.expose = 1;
    p.coverTop = undefined;
    p.chase = { ahead: ahead, lat: lat, ph: Math.random() * 6, speed: 2.2 + Math.random() * 1.6 };
    p.aimMax = 1.6 * (DIFF.aim || 1);
    p.aim = p.aimMax;
    chase.riders.push(p);
    return p;
  }
  function stepChase(ctx, dt) {
    if (!chase) return;
    chase.t += dt;
    if (chase.boat && ctx.camera.position.z > -69) { endChase(ctx); return; }
    while (chase.i < chase.plan.length && chase.t >= chase.plan[chase.i]) {
      const k = chase.i++;
      const side = k % 2 ? 1 : -1;
      spawnChaser(ctx, side * (2.3 + Math.random() * 0.7), k);
      if (k === 2 || k === 5) spawnChaser(ctx, -side * (2.3 + Math.random() * 0.7), k + 10);
      if (k === 0 || k === 4) gun("motor");
    }
    const cam = ctx.camera;
    chase.riders.forEach((p) => {
      if (!p.chase || p.live === false || p.e.alive === false) return;
      const c = p.chase;
      c.ahead -= (c.speed + 6.2) * dt;
      const u = Math.max(0, Math.min(1, pathU + c.ahead / pathLen));
      const pt = pathAt(u);
      const tg = curve.getTangentAt(u);
      const tl = Math.hypot(tg.x, tg.z) || 1, tx = tg.x / tl, tz = tg.z / tl;
      let lat = c.lat * (c.ahead < 9 ? 1 + (9 - Math.max(0, c.ahead)) * 0.05 : 1) + Math.sin(chase.t * 1.8 + c.ph) * 0.5;
      /* (v26) steer round barriers instead of through them: look a few metres
         ahead along his line and slide sideways to the nearest free lane */
      const lm = chase.boat ? 1.6 : 1, rr = chase.boat ? 1.1 : 0.6;
      const free = (L) => { for (const a of [0, 1.5, 3.0]) { const q = pathAt(Math.max(0, Math.min(1, pathU + (c.ahead - a) / pathLen))); if (vehHit(q.x + tz * L * lm, q.z - tx * L * lm, rr)) return false; } return true; };
      let want = 0;
      if (!free(lat + (c.dodge || 0))) {
        for (let o = 0.4; o <= 4; o += 0.4) {
          if (free(lat + o)) { want = o; break; }
          if (free(lat - o)) { want = -o; break; }
        }
      } else want = c.dodge && free(lat) ? 0 : (c.dodge || 0);
      c.dodge = (c.dodge || 0) + (want - (c.dodge || 0)) * Math.min(1, dt * 6);
      lat += c.dodge;
      p.x = pt.x + tz * lat * lm;
      p.z = pt.z - tx * lat * lm;
      p.y = chase.boat ? 0.5 + Math.sin(chase.t * 2.4 + c.ph) * 0.12 : rideY(p);
      const yaw = Math.atan2(-tx, -tz);
      posePost(p, cam.position, dt);
      if (p.mount) { p.mesh.rotation.z = Math.sin(chase.t * 1.9 + c.ph) * 0.06; }
      else applyRidePose(p, yaw, Math.cos(chase.t * 1.8 + c.ph) * 0.14);
      if (p.bikeMesh) {
        (p.bikeMesh.userData.wheels || []).forEach((w) => { w.rotation.x += dt * 26; });
        if (p.bikeMesh.userData.stand) p.bikeMesh.userData.stand.visible = false;
      }
      if (Math.random() < 0.3) smokeAt(ctx, p.x + tx * 1.0, chase.boat ? 0.2 : 0.45, p.z + tz * 1.0, chase.boat ? 0xf2f6fa : 0x9a8c74);
      p.visTop = p.y + 1.6;
      const armed = c.ahead < 27 && c.ahead > 6.5 && p.aim < 90;
      if (armed) {
        p.aim -= dt * seenK(p);
        if (p.aim <= 0) { enemyFire(ctx, p, p.role === "tough" ? 12 : 9); p.aim = 99; }
      }
      placeTag(p, ctx, armed ? Math.max(0, Math.min(1, 1 - p.aim / p.aimMax)) : 0, armed);
      if (c.ahead < -6) {
        /* he got past: gone down the road behind us */
        tagOff(p);
        p.live = false;
        p.e.alive = false;
        p.escaped = true;
        if (p.mesh && p.mesh.parent) p.mesh.parent.remove(p.mesh);
      }
    });
    if (jeepRig && !chase.boat) {
      const t = chase.t;
      jeepRig.position.y = Math.sin(t * 11) * 0.012 + (Math.random() < 0.02 ? -0.03 : 0);
      jeepRig.rotation.z = Math.sin(t * 1.3) * 0.012;
      if (jeepRig.userData.wheel) jeepRig.userData.wheel.rotation.z = Math.sin(t * 0.9) * 0.4;
    }
    if (chase.boat) {
      const t = chase.t;
      if (boatRig) { boatRig.position.y = Math.sin(t * 1.7) * 0.05; boatRig.rotation.z = Math.sin(t * 1.1) * 0.025; boatRig.rotation.x = Math.sin(t * 1.5) * 0.02; }
      /* shell splashes walking across the water around the boat */
      chase.splashT -= dt;
      if (chase.splashT <= 0) {
        chase.splashT = 0.5 + Math.random() * 0.9;
        const u = Math.min(1, pathU + (8 + Math.random() * 26) / pathLen);
        const q = pathAt(u);
        const side = Math.random() < 0.5 ? -1 : 1;
        splashAt(ctx, q.x + side * (3 + Math.random() * 14), q.z, Math.random() < 0.35);
      }
      chase.fx = chase.fx.filter((m) => {
        m.userData.t += dt;
        const k = m.userData.t / 1.4;
        m.scale.set(1 + k * 0.6, m.userData.h * Math.sin(Math.min(1, k) * Math.PI) + 0.1, 1 + k * 0.6);
        m.position.y = m.scale.y / 2;
        m.material.opacity = 0.85 * (1 - k);
        if (k >= 1) { m.parent && m.parent.remove(m); return false; }
        return true;
      });
      chase.sink = chase.sink.filter((m) => { m.position.y -= dt * 0.5; m.rotation.x += dt * 0.25; if (m.position.y < -2.5) { m.parent && m.parent.remove(m); return false; } return true; });
    }
  }
  function endChase(ctx) {
    if (!chase) return;
    chase.riders.forEach((p) => {
      if (p.live === false || p.e.alive === false) return;
      tagOff(p);
      p.live = false;
      p.e.alive = false;
      if (p.mesh && p.mesh.parent) p.mesh.parent.remove(p.mesh);
    });
    const down = chase.riders.filter((p) => p.e.alive === false && !p.escaped && p.mesh && p.mesh.parent).length;
    const wasBoat = chase.boat;
    chase.fx.forEach((m) => m.parent && m.parent.remove(m));
    chase = null;
    if (jeepRig) jeepRig.visible = false;
    if (boatRig) boatRig.visible = false;
    if (dress && dress.ally) dress.ally.visible = true;
    if (wasBoat) radio("램프 개방! 상륙, 상륙! 해안 교두보를 확보하라!", 3200);
    else radio(down >= 6 ? "추격대 전멸! 하차, 압록강 초소로 진입한다!" : "하차! 압록강 국경 초소로 진입한다!", 3000);
  }
  window.__chase = () => (chase ? { t: +chase.t.toFixed(1), riders: chase.riders.length, alive: chase.riders.filter((p) => p.live !== false && p.e.alive !== false).length } : null);

  /* (v20) the brag card: a still of the battlefield with the result laid
     over it, 1080×1350 (fits every feed), shared through the system sheet
     where the browser can hand over files, saved as a PNG otherwise */
  const SHARE_ICO = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  const SAVE_ICO = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  function makeShareCard(I) {
    const W = 1080, H = 1350;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#0b0f08"; g.fillRect(0, 0, W, H);
    if (I.shot) {
      const sh = I.shot, k = Math.max(W / sh.width, 860 / sh.height);
      const dw = sh.width * k, dh = sh.height * k;
      g.drawImage(sh, (W - dw) / 2, 0, dw, dh);
    }
    let gr = g.createLinearGradient(0, 380, 0, 900);
    gr.addColorStop(0, "rgba(11,15,8,0)"); gr.addColorStop(1, "rgba(11,15,8,1)");
    g.fillStyle = gr; g.fillRect(0, 380, W, 520);
    g.fillStyle = "#0b0f08"; g.fillRect(0, 900, W, H - 900);
    /* (v38) your soldier, standing on the card */
    if (I.av && I.av.complete && I.av.naturalWidth) {
      g.save();
      g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 30; g.shadowOffsetY = 12;
      const ah = 520, aw = ah * I.av.naturalWidth / I.av.naturalHeight;
      g.drawImage(I.av, W - aw - 20, 880 - ah, aw, ah);
      g.restore();
    }
    gr = g.createLinearGradient(0, 0, 0, 200);
    gr.addColorStop(0, "rgba(0,0,0,.65)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, W, 200);
    const F = (w, px) => w + " " + px + "px Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif";
    g.textBaseline = "alphabetic";
    g.fillStyle = "#c9b871"; g.font = F(800, 30); g.fillText(I.ko ? "지금 바로 쏴!" : "SHOOT RIGHT NOW", 60, 84);
    g.textAlign = "right"; g.fillStyle = "#fff"; g.font = F(800, 30); g.fillText("STAGE " + I.label.replace("STAGE ", ""), W - 60, 84); g.textAlign = "left";
    g.fillStyle = I.cleared ? "#ffe14a" : "#ff8a7a"; g.font = F(900, 74);
    const head = I.head.length > 18 ? I.head.split(" · ") : [I.head];
    head.forEach((ln, k) => g.fillText(ln, 60, 760 + k * 84 - (head.length - 1) * 84));
    g.fillStyle = "#ffd54a"; g.font = F(900, 64); g.fillText(I.stars, 60, 860);
    const tiles = [[I.ko ? "점수" : "SCORE", I.score.toLocaleString()], [I.ko ? "명중률" : "ACCURACY", I.acc + "%"], ["COMBO", String(I.combo)]];
    tiles.forEach((t, k) => {
      const x = 60 + k * 330, y = 920;
      g.fillStyle = "rgba(255,255,255,.06)"; g.fillRect(x, y, 300, 150);
      g.fillStyle = "#9aa58a"; g.font = F(700, 28); g.fillText(t[0], x + 26, y + 50);
      g.fillStyle = "#fff"; g.font = F(900, 56); g.fillText(t[1], x + 26, y + 120);
    });
    const P = window.MGProfile;
    if (P && I.rec) {
      const r = I.rec.rank1;
      g.fillStyle = "rgba(201,184,113,.12)"; g.fillRect(60, 1100, W - 120, 120);
      g.fillStyle = "#f2ecd0"; g.font = F(900, 46); g.fillText((I.ko ? "계급 " : "RANK ") + P.rankName(r), 90, 1176);
      g.textAlign = "right"; g.fillStyle = "#c9b871"; g.font = F(800, 32);
      g.fillText([I.diff, I.practice ? (I.ko ? "연습" : "PRACTICE") : "", I.rec.rankUp ? (I.ko ? "진급!" : "PROMOTED!") : ""].filter(Boolean).join(" · "), W - 90, 1172);
      g.textAlign = "left";
    }
    g.fillStyle = "#6f7a60"; g.font = F(700, 26);
    g.fillText(location.host + location.pathname.replace(/[^/]*$/, ""), 60, 1300);
    g.textAlign = "right"; g.fillText(new Date().toISOString().slice(0, 10), W - 60, 1300); g.textAlign = "left";
    return c;
  }
  function shareResult(I, act, btn) {
    const ko = I.ko;
    const url = location.href.split("#")[0].split("?")[0];
    const text = (ko ? "지금 바로 쏴! " : "Shoot Right Now ") + I.label + " " + (I.cleared ? (ko ? "클리어! " : "clear! ") : "") + I.stars + " " + I.score.toLocaleString() + (ko ? "점" : " pts") +
      (I.rec && window.MGProfile ? " · " + (ko ? "계급 " : "rank ") + window.MGProfile.rankName(I.rec.rank1) : "") + (ko ? " — 너도 도전해봐!" : " — beat that!");
    const card = makeShareCard(I);
    const done = (msg) => { if (btn) { const o = btn.innerHTML; btn.textContent = msg; setTimeout(() => { btn.innerHTML = o; }, 1800); } };
    const download = (blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "myeolgong-" + I.label.replace(/\W+/g, "") + "-" + I.score + ".png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      done(ko ? "저장했습니다" : "Saved");
    };
    card.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "myeolgong.png", { type: "image/png" });
      if (act === "share" && navigator.share) {
        const data = { title: ko ? "지금 바로 쏴!" : "Shoot Right Now", text: text, url: url };
        const withFile = navigator.canShare && navigator.canShare({ files: [file] }) ? Object.assign({ files: [file] }, data) : data;
        navigator.share(withFile).then(() => done(ko ? "공유 완료" : "Shared")).catch(() => {});
        return;
      }
      if (act === "share") {
        try { navigator.clipboard && navigator.clipboard.writeText(text + " " + url); } catch (e) {}
        download(blob);
        done(ko ? "문구 복사 + 이미지 저장" : "Text copied + image saved");
        return;
      }
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
        /* phones keep pictures through the share sheet ("Save image") */
        navigator.share({ files: [file] }).then(() => done(ko ? "저장 완료" : "Saved")).catch(() => {});
        return;
      }
      download(blob);
    }, "image/png");
  }
  window.__shareCard = (I) => makeShareCard(I);

  /* photo mode: the result card steps aside, drag to look around, save */
  function photoMode(ctx, card) {
    const ko = (document.documentElement.lang || "").startsWith("ko");
    card.style.display = "none";
    const cam = ctx.camera;
    const e0 = new T.Euler().setFromQuaternion(cam.quaternion, "YXZ");
    let yaw = e0.y, pitch = e0.x, drag = null;
    const bar = document.createElement("div");
    bar.id = "railPhoto";
    bar.innerHTML = "<p>" + (ko ? "드래그로 둘러보기" : "Drag to look") + "</p><button data-a=save>" + (ko ? "📸 저장" : "📸 SAVE") + "</button><button data-a=close>" + (ko ? "닫기" : "CLOSE") + "</button>";
    document.body.appendChild(bar);
    const down = (e) => { if (e.target.closest && e.target.closest("#railPhoto")) return; drag = { x: e.clientX, y: e.clientY, yaw: yaw, pitch: pitch }; };
    const move = (e) => {
      if (!drag) return;
      yaw = drag.yaw - (e.clientX - drag.x) * 0.005;
      pitch = Math.max(-0.9, Math.min(0.9, drag.pitch - (e.clientY - drag.y) * 0.005));
      cam.rotation.order = "YXZ"; cam.rotation.set(pitch, yaw, 0); cam.updateMatrixWorld(true);
    };
    const up = () => { drag = null; };
    addEventListener("pointerdown", down); addEventListener("pointermove", move); addEventListener("pointerup", up);
    const close = () => {
      removeEventListener("pointerdown", down); removeEventListener("pointermove", move); removeEventListener("pointerup", up);
      bar.remove(); card.style.display = "";
    };
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-a]");
      if (!b) return;
      e.stopPropagation();
      if (b.getAttribute("data-a") === "close") { close(); return; }
      bar.style.visibility = "hidden";
      const c = window.MG && window.MG.snap ? window.MG.snap(1920) : null;
      bar.style.visibility = "";
      if (!c) return;
      c.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "myeolgong-photo.png", { type: "image/png" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) { navigator.share({ files: [file] }).catch(() => {}); return; }
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "myeolgong-photo.png"; document.body.appendChild(a); a.click(); a.remove();
      }, "image/png");
    });
  }

  /* (v20) arcade continue: the game freezes on a ten-second count; take it
     and a fresh set of lives drops in where you fell, score kept */
  function offerContinue(ctx) {
    if (contOpen || ended) return;
    contOpen = true;
    active = false;
    const pausedAt = performance.now();
    const ko = (document.documentElement.lang || "").startsWith("ko");
    const box = document.createElement("div");
    box.id = "railCont";
    box.innerHTML = '<div class="cc"><p class="k">' + (ko ? "작전 불능" : "MAN DOWN") + '</p><h2>CONTINUE?</h2><div class="num">10</div>' +
      '<p class="d">' + (ko ? "이어하면 점수는 그대로, 별 3개는 놓칩니다" : "Score is kept, the third star is lost") + (continues ? " · " + (ko ? "이어하기 " : "continues ") + continues : "") + "</p>" +
      '<div class="btns"><button class="primary" data-act="cont" type="button">▶ ' + (ko ? "이어하기" : "CONTINUE") + '</button><button data-act="quit" type="button">' + (ko ? "포기" : "GIVE UP") + "</button></div></div>";
    document.body.appendChild(box);
    posts.forEach((p) => tagOff(p));
    if (pistol) pistol.visible = false;
    showHud(false);
    try { window.GunSFX && window.GunSFX.bgm(false); window.GunSFX.stopLoops && window.GunSFX.stopLoops(); } catch (e) {}
    let n = 10;
    const num = box.querySelector(".num");
    const close = () => { clearInterval(iv); box.remove(); contOpen = false; };
    const iv = setInterval(() => {
      n--;
      if (num) { num.textContent = String(Math.max(0, n)); num.classList.remove("tick"); void num.offsetWidth; num.classList.add("tick"); }
      if (n <= 0) { close(); finish(ctx, false); }
    }, 1000);
    box.addEventListener("click", (e) => {
      const b = e.target && e.target.closest ? e.target.closest("button[data-act]") : null;
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      close();
      if (b.getAttribute("data-act") !== "cont") { finish(ctx, false); return; }
      continues++;
      lives = LIVES0;
      hp = HPMAX;
      grenades = Math.max(grenades, 2);
      /* (v26) back in with a full clip and a few seconds of cover */
      bullets = clipMax; reloading = false; reloadK = 0;
      if (weapon !== "pistol" && WEAPONS[weapon] && WEAPONS[weapon].ammo) wAmmo = WEAPONS[weapon].ammo;
      invulT = 4;
      let sh = document.getElementById("railShield");
      if (!sh) { sh = document.createElement("div"); sh.id = "railShield"; document.body.appendChild(sh); }
      const now = performance.now();
      t0 += now - pausedAt;
      frame._t = now;
      active = true;
      if (pistol) pistol.visible = true;
      showHud(true);
      flashScreen(0.5, "radial-gradient(circle,rgba(120,220,255,.55),rgba(40,120,200,0) 70%)");
      radio(ko ? "증원 투입! 작전을 계속한다." : "Reinforcements in! Carry on.", 2600);
      try { window.GunSFX && window.GunSFX.bgm(true, false); } catch (e) {}
    });
  }

  /* (v24) camera direction: a boss cut-in with letterbox and a WARNING
     card, a slow-motion beat before the result card, and a photo mode */
  let slowmo = 0, slowK = 1, finishing = false, finishNow = false;
  function cutIn(title, sub) {
    const ko = (document.documentElement.lang || "").startsWith("ko");
    const box = document.createElement("div");
    box.className = "railCut";
    box.innerHTML = '<i class="lb t"></i><i class="lb b"></i><div class="cc"><p class="w">WARNING</p><h2>' + title + '</h2><p class="s">' + (sub || "") + "</p></div>";
    document.body.appendChild(box);
    slowmo = 1.4; slowK = 0.35;
    try { window.GunSFX && window.GunSFX.boom && window.GunSFX.boom(); } catch (e) {}
    setTimeout(() => box.classList.add("out"), 2100);
    setTimeout(() => box.remove(), 2700);
    void ko;
  }
  function finish(ctx, cleared) {
    if (ended) return;
    if (cleared && !finishing && !finishNow && !window.__railFastEnd) {
      /* the last shot lands in slow motion before the card comes up */
      finishing = true;
      slowmo = 1.6; slowK = 0.25;
      const fl = document.createElement("div");
      fl.className = "railCut clear";
      const ko = (document.documentElement.lang || "").startsWith("ko");
      fl.innerHTML = '<div class="cc"><h2>' + (ko ? "작전 성공" : "MISSION CLEAR") + "</h2></div>";
      document.body.appendChild(fl);
      setTimeout(() => { fl.remove(); finishing = false; finishNow = true; finish(ctx, true); }, 1500);
      return;
    }
    if (finishing) return;
    ended = true;
    try { window.GunSFX && window.GunSFX.stopLoops && window.GunSFX.stopLoops(); } catch (e) {}
    active = false;
    try { window.GunSFX && window.GunSFX.bgm(false); } catch (e) {}
    phase = "result";
    /* the result card owns the screen: no gun, HUD or radio peeking out from behind it */
    if (pistol) pistol.visible = false;
    showHud(false);
    if (radioEl) radioEl.classList.remove("show");
    window.__railPhase = "result";
    const acc = shotsFired ? shotsHit / shotsFired : 0;
    const got = pickups.filter((p) => p.taken).length;
    const tot = pickups.length;
    const s1 = !!cleared;
    const s2 = tot === 0 || got / tot >= 0.6;
    const s3 = continues === 0 && lives >= LIVES0;
    const nStars = s1 ? [s1, s2, s3].filter(Boolean).length : 0;
    const stars = "★".repeat(nStars) + "☆".repeat(3 - nStars);
    const score = (ctx.G && ctx.G.score) || 0;
    /* (v20) rank XP and the stage record, then a still for the share card */
    let rec = null;
    try { rec = window.MGProfile ? window.MGProfile.record({ stage: stageId, cleared: !!cleared, score: score, stars: nStars, diff: diffKey, practice: practice, continues: continues, kills: MS.kills, heads: MS.heads, bikes: MS.bikes, combo: bestCombo, acc: shotsFired ? shotsHit / shotsFired : 0 }) : null; } catch (e) { window.__recErr = String(e); }
    let shot = null;
    try { shot = window.MG && window.MG.snap ? window.MG.snap(1280) : null; } catch (e) {}
    const ko = (document.documentElement.lang || "").startsWith("ko");
    /* (v21) the campaign runs in war order, not in id order */
    const ORD = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5];
    const NM = { 1: ["서울 수복", "RETAKE SEOUL"], 2: ["DMZ·판문점", "DMZ & PANMUNJOM"], 3: ["평화의 집", "PEACE HOUSE"], 4: ["평양 진입", "INTO PYONGYANG"], 5: ["압록강·백두산", "YALU & PAEKTU"],
      6: ["서울 함락", "FALL OF SEOUL"], 7: ["대전", "DAEJEON"], 8: ["대구", "DAEGU"], 9: ["광주", "GWANGJU"], 10: ["경주", "GYEONGJU"], 11: ["부산", "BUSAN"], 12: ["인천 상륙작전", "INCHEON LANDING"] };
    const oi = ORD.indexOf(stageId);
    const nId = oi >= 0 && oi < ORD.length - 1 ? ORD[oi + 1] : 0;
    const nx = cleared && nId ? [nId, "다음 작전 · " + NM[nId][0], "NEXT · " + NM[nId][1]] : null;
    const nextB = nx ? "<button class=primary data-act=next data-stage=" + nx[0] + ">" + (ko ? nx[1] : nx[2]) + "</button>" : "";
    const head = cleared
      ? ({ 6: ko ? "철수 성공 · 시민 대피 완료" : "WITHDRAWAL COMPLETE", 7: ko ? "지연전 성공 · 대전" : "DAEJEON HELD", 8: ko ? "방어 성공 · 대구" : "DAEGU HELD", 9: ko ? "방어 성공 · 광주" : "GWANGJU HELD",
          10: ko ? "방어 성공 · 경주" : "GYEONGJU HELD", 11: ko ? "최후 방어선 사수 · 부산" : "THE PERIMETER HOLDS", 12: ko ? "상륙 성공 · 인천 탈환" : "INCHEON RETAKEN" }[stageId]) || (stageId === 2 ? (ko ? "작전 성공 · JSA 확보" : "MISSION CLEAR · JSA SECURED") : stageId === 3 ? (ko ? "작전 성공 · 판문각 확보" : "MISSION CLEAR · PANMUNGAK SECURED") : stageId === 4 ? (ko ? "작전 성공 · 평양 광장 확보" : "MISSION CLEAR · SQUARE SECURED") : stageId === 5 ? (ko ? "최종 작전 성공 · 총사령관 제압" : "FINAL MISSION · LEADER DOWN")  : (ko ? "서울 수복 · 숭례문 탈환" : "SEOUL RETAKEN"))
      : (ko ? "작전 실패" : "MISSION FAILED");
    const box = document.createElement("div");
    box.id = "railResult";
    box.className = "show";
    const P = window.MGProfile;
    let rankHtml = "";
    if (rec && P) {
      const r1 = rec.rank1;
      const xb = P.xpBar(rec.after);
      rankHtml = '<div class="rk">' + P.insignia(r1, 46) + '<div class="rt"><b>' + P.rankName(r1) + (rec.practice ? "" : ' <span class="xp">+' + rec.xp.toLocaleString() + " XP</span>") + "</b>" +
        '<div class="bar"><i style="width:' + Math.round(xb.k * 100) + '%"></i></div><small>' +
        (rec.practice ? (ko ? "연습 모드 — 경험치·기록 없음" : "Practice — no XP or records") : xb.toNext ? (ko ? "다음 계급까지 " : "Next rank in ") + xb.toNext.toLocaleString() + " XP" : (ko ? "최고 계급" : "Top rank")) +
        "</small></div></div>" +
        (rec.rankUp ? '<div class="up">' + (ko ? "진급! " : "PROMOTED! ") + P.rankName(rec.rank0) + " → <b>" + P.rankName(r1) + "</b>" + (rec.perk && rec.perk.length ? "<small>" + rec.perk.join(" · ") + "</small>" : "") + "</div>" : "") +
        (rec.newBest ? '<div class="nb">' + (ko ? "최고 기록 갱신!" : "NEW BEST!") + "</div>" : "") +
        (!rec.practice && (rec.pts || rec.box) ? '<div class="nb" style="color:#ffd54a">' + (rec.pts ? "+" + rec.pts.toLocaleString() + "P " + (ko ? "보급 포인트" : "supply points") : "") + (rec.box ? " · 🎁 " + (ko ? "행운 상자 획득!" : "Lucky box!") : "") + "</div>" : "") +
        (rec.mis && rec.mis.length ? '<div class="nb" style="color:#9be07a">' + (ko ? "임무 달성: " : "Orders done: ") + rec.mis.join(" · ") + (ko ? " — 메뉴에서 보상 받기" : " — claim in menu") + "</div>" : "");
    }
    const dName = window.MGProfile ? (ko ? DIFF.ko : DIFF.en) : "";
    box.innerHTML = "<div class=card><h2>" + head +
      "</h2><div class=stars>" + stars + "</div><p class=meta>" + (STAGE.label || "1-1") + (dName ? " · " + dName : "") + (practice ? " · " + (ko ? "연습" : "PRACTICE") : "") + (continues ? " · CONTINUE " + continues : "") +
      "</p><div class=grid><p><span>" + (ko ? "점수" : "SCORE") + "</span><b>" + score.toLocaleString() +
      "</b></p><p><span>" + (ko ? "명중률" : "ACCURACY") + "</span><b>" + Math.round(acc * 100) + "%</b></p><p><span>" + (ko ? "보급" : "SUPPLY") + "</span><b>" + got + "/" + tot +
      "</b></p><p><span>" + (ko ? "파괴" : "DESTROYED") + "</span><b>" + brokenN + "</b></p><p><span>COMBO</span><b>" + bestCombo + "</b></p></div>" + rankHtml +
      "<div class=btns>" + nextB + "<button" + (nextB ? "" : " class=primary") + " data-act=again>" + (ko ? "다시 하기" : "PLAY AGAIN") +
      "</button><button data-act=title>" + (ko ? "타이틀" : "TITLE") + "</button></div>" +
      "<div class=\"btns share\"><button data-act=share>" + SHARE_ICO + (ko ? "자랑하기" : "SHARE") + "</button><button data-act=save>" + SAVE_ICO + (ko ? "이미지 저장" : "SAVE IMAGE") + "</button><button data-act=photo>📷 " + (ko ? "포토 모드" : "PHOTO") + "</button></div></div>";
    let avImg = null;
    try {
      const uni0 = (window.MGProfile && window.MGProfile.uni && window.MGProfile.uni()) || "u-army";
      const src0 = window.MGAvatar && window.MGAvatar.snap(uni0, cleared ? "cheer" : "");
      if (src0) { avImg = new Image(); avImg.src = src0; }
    } catch (e) {}
    const shareInfo = { av: avImg, cleared: !!cleared, head: head, stars: stars, nStars: nStars, score: score, acc: Math.round(acc * 100), combo: bestCombo, label: STAGE.label || "1-1", stage: stageId, diff: dName, practice: practice, continues: continues, rec: rec, shot: shot, ko: ko };
    box.addEventListener("click", (e) => {
      const b = e.target && e.target.closest ? e.target.closest("button[data-act]") : null;
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      const act = b.getAttribute("data-act");
      if (act === "again") { try { window.MG && window.MG.playAgain(); } catch (err) {} }
      else if (act === "next") { try { window.MG && window.MG.playStage(+b.getAttribute("data-stage") || 2); } catch (err) {} }
      else if (act === "share" || act === "save") { shareResult(shareInfo, act, b); }
      else if (act === "photo") { photoMode(ctx, box); }
      else { try { window.MG && window.MG.toTitle(); } catch (err) {} }
    });
    document.body.appendChild(box);
    /* (v27) your soldier on the card: cheering on a clear */
    try {
      const uni = (window.MGProfile && window.MGProfile.uni && window.MGProfile.uni()) || "u-army";
      const src = window.MGAvatar && window.MGAvatar.snap(uni, cleared ? "cheer" : "");
      const card = box.querySelector(".card");
      if (src && card) {
        card.style.position = "relative";
        const im = document.createElement("img");
        im.src = src; im.alt = "";
        im.style.cssText = "position:absolute;right:8px;top:8px;width:72px;height:90px;pointer-events:none;filter:drop-shadow(0 6px 10px rgba(0,0,0,.5))";
        card.appendChild(im);
        const h2 = card.querySelector("h2"); if (h2) { h2.style.paddingRight = "64px"; h2.style.paddingLeft = "64px"; }
      }
    } catch (e) {}
    posts.forEach((p) => tagOff(p));
    if (bossPost) tagOff(bossPost);
    if (ctx.G) { ensureHud(ctx.G.score || 0); drawHud(); }
    showHud(false);
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
  /* ---- block-break debris and bullet holes ----
     A man who goes down bursts a spray of little cubes in his uniform and
     skin colours that bounce on the road and shrink away, the way a block
     breaks in a voxel game. Rounds that stop in a wall leave a dark pocked
     square on the surface that stays for the rest of the stage. */
  const chunks = [];
  const holes = [];
  let chunkGeo = null, holeGeo = null, holeMat = null;
  function voxBreak(scene, x, y, z, cols, n, power) {
    if (!chunkGeo) chunkGeo = new T.BoxGeometry(1, 1, 1);
    const k = power || 1;
    for (let i = 0; i < (n || 12); i++) {
      const m = new T.Mesh(chunkGeo, new T.MeshStandardMaterial({ color: cols[i % cols.length], roughness: 0.85 }));
      const sz = 0.07 + Math.random() * 0.09;
      m.scale.setScalar(sz);
      m.position.set(x + (Math.random() - 0.5) * 0.4, y + Math.random() * 0.9, z + (Math.random() - 0.5) * 0.4);
      m.userData.v = new T.Vector3((Math.random() - 0.5) * 3.4 * k, (1.6 + Math.random() * 2.6) * k, (Math.random() - 0.5) * 3.4 * k);
      m.userData.w = new T.Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9);
      m.userData.life = 1.1 + Math.random() * 0.5;
      m.userData.sz = sz;
      m.castShadow = true;
      scene.add(m);
      chunks.push(m);
    }
    while (chunks.length > 160) { const o = chunks.shift(); o.parent && o.parent.remove(o); o.material.dispose(); }
  }
  function stepChunks(dt) {
    for (let i = chunks.length - 1; i >= 0; i--) {
      const m = chunks[i], u = m.userData;
      u.life -= dt;
      u.v.y -= 9.8 * dt;
      m.position.addScaledVector(u.v, dt);
      const floor = 0.3 + u.sz / 2;
      if (m.position.y < floor) { m.position.y = floor; u.v.y *= -0.32; u.v.x *= 0.6; u.v.z *= 0.6; u.w.multiplyScalar(0.6); }
      m.rotation.x += u.w.x * dt; m.rotation.y += u.w.y * dt; m.rotation.z += u.w.z * dt;
      if (u.life < 0.3) m.scale.setScalar(Math.max(0.001, u.sz * (u.life / 0.3)));
      if (u.life <= 0) { m.parent && m.parent.remove(m); m.material.dispose(); chunks.splice(i, 1); }
    }
  }
  const _hn = new T.Vector3(), _nm = new T.Matrix3();
  function bulletHole(scene, hit) {
    if (!hit || !hit.face || !hit.object) return;
    if (!holeGeo) {
      holeGeo = new T.PlaneGeometry(0.12, 0.12);
      holeMat = new T.MeshBasicMaterial({ map: ctex("bulletHole", 16, 16, (g, w, h) => {
        g.clearRect(0, 0, w, h);
        g.fillStyle = "rgba(40,36,32,.55)"; g.fillRect(2, 2, 12, 12);
        g.fillStyle = "rgba(12,10,9,.95)"; g.fillRect(5, 5, 6, 6);
        g.fillStyle = "rgba(230,225,215,.5)"; g.fillRect(3, 2, 3, 2); g.fillRect(11, 11, 2, 3);
      }, { smooth: true }), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
      holeMat.map.magFilter = T.NearestFilter;
    }
    _nm.getNormalMatrix(hit.object.matrixWorld);
    _hn.copy(hit.face.normal).applyMatrix3(_nm).normalize();
    const m = new T.Mesh(holeGeo, holeMat);
    m.position.copy(hit.point).addScaledVector(_hn, 0.012);
    m.lookAt(hit.point.x + _hn.x, hit.point.y + _hn.y, hit.point.z + _hn.z);
    m.rotation.z = Math.random() * 3;
    m.userData.noBlock = 1;
    scene.add(m);
    holes.push(m);
    while (holes.length > 90) { const o = holes.shift(); o.parent && o.parent.remove(o); }
  }
  function clearFx2() {
    chunks.forEach((m) => { m.parent && m.parent.remove(m); m.material.dispose(); });
    chunks.length = 0;
    holes.forEach((m) => m.parent && m.parent.remove(m));
    holes.length = 0;
  }

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

  /* a soldier taking a round: a short dull low thud, and on a kill the body
     dropping a beat later — no voice (the recorded cries were removed) */
  function grunt(fatal) {
    try {
      const G = window.GunSFX;
      if (G && typeof G.playHitGrunt === "function") G.playHitGrunt(!!fatal);
      window.__grunts = (window.__grunts || 0) + 1;
      if (fatal) window.__gruntsFatal = (window.__gruntsFatal || 0) + 1;
    } catch (e) { window.__gruntErr = String(e && e.stack || e); }
  }

  /* a spent case: brass, thrown out of the ejection port, spinning, bouncing
     off the asphalt once and gone. One shared geometry and material, at most a
     dozen in the air, so the effect costs a handful of draw calls. */
  let SHELL_GEO = null;
  function ejectShell(ctx) {
    if (!ctx || !pistol || !SOL.brass) return;
    if (shells.length > 10) return;
    if (!SHELL_GEO) SHELL_GEO = new T.BoxGeometry(0.017, 0.017, 0.04);
    pistol.updateMatrixWorld(true);
    const p = new T.Vector3(0.06, 0.085, -0.11);
    pistol.localToWorld(p);
    const m = new T.Mesh(SHELL_GEO, SOL.brass);
    m.position.copy(p);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    const q = ctx.camera.quaternion;
    const right = new T.Vector3(1, 0, 0).applyQuaternion(q);
    const up = new T.Vector3(0, 1, 0).applyQuaternion(q);
    const fwd = new T.Vector3(0, 0, -1).applyQuaternion(q);
    m.userData.v = right.multiplyScalar(1.5 + Math.random() * 0.8)
      .addScaledVector(up, 1.3 + Math.random() * 0.5)
      .addScaledVector(fwd, 0.3);
    m.userData.spin = new T.Vector3(14 + Math.random() * 10, 12 + Math.random() * 10, 10 + Math.random() * 10);
    m.userData.life = 1.5;
    ctx.scene.add(m);
    shells.push(m);
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
    MS.kills++;
    if (p.bikeMesh) { dropBike(ctx, p, true); p.y = 0.3; addPts(ctx, 200); MS.bikes++; }
    if (p.mount && p.mount.parent) { ctx.scene.attach(p.mount); if (chase) chase.sink.push(p.mount); p.mount = null; addPts(ctx, 200); }
    try {
      const cols = p.role === "boss" ? [0x4a4a30, 0x33331f, 0xe0b48c, 0x2a2a1a] : p.role === "tough" ? [0x424d2c, 0x333d22, 0xe0b48c, 0x1e2416] : [0x5a6a3a, 0x48562e, 0xe8bc94, 0x2c3520];
      voxBreak(ctx.scene, p.x, (p.y || 0.3) + 0.3, p.z, cols, p.role === "boss" ? 26 : 14, p.role === "boss" ? 1.4 : 1);
    } catch (e) {}
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
    deathFace(p);
    p.e.x = p.x;
    p.e.y = p.y;
    let scored = false;
    try { if (ctx.killFlip) { ctx.killFlip(p.e, pts); scored = true; } } catch (e) {}
    if (!scored) addPts(ctx, pts);
    tagOff(p);
    /* (v19) the officer can also fall to a grenade or a barrel: every way
       he dies ends the stage, not only a bullet */
    if (p.role === "boss") { try { finish(ctx, true); } catch (e) { window.__stageErr = String(e); } }
  }

  function boomBarrel(ctx, b) {
    if (!b || b.dead) return;
    b.dead = true;
    if (b.mesh) b.mesh.visible = false;
    const px = b.x, py = b.y + 0.55, pz = b.z;
    try { boomFlash(ctx, px, py, pz, 1.2); boomFx(ctx, px, py, pz); } catch (e) {}
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
      if (p.air === "apc" || p.air === "heli") {
        const bb = new T.Box3().setFromObject(p.mesh);
        const c = new T.Vector3(); bb.getCenter(c);
        airDamage(ctx, p, c, bb, p.air === "apc" ? 9 : 4);
        return;
      }
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

  /* ---- grenades (v16): lobbed from the camera to where the crosshair meets
     the ground (5-22 m), a short fuse after landing, then a barrel-sized
     blast: everyone within 6.5 m takes it, drums chain, panes and signs go */
  let NADEGEO = null, NADEMAT = null;
  function throwGrenade(ctx) {
    if (!ctx || !booted || ended || !active || phase === "intro" || phase === "result") return;
    if (grenades <= 0) { gun("dry"); return; }
    grenades--;
    tutEv("nade");
    const cam = ctx.camera;
    cam.updateMatrixWorld(true);
    const ray = new T.Raycaster();
    ray.setFromCamera(new T.Vector2(aimN.x, aimN.y), cam);
    let tx, tz;
    const d = ray.ray.direction;
    if (d.y < -0.02) {
      const t = (0.3 - ray.ray.origin.y) / d.y;
      tx = ray.ray.origin.x + d.x * t; tz = ray.ray.origin.z + d.z * t;
    } else { tx = cam.position.x + d.x * 18; tz = cam.position.z + d.z * 18; }
    let dx = tx - cam.position.x, dz = tz - cam.position.z, dist = Math.hypot(dx, dz) || 1;
    const want = Math.max(5, Math.min(22, dist));
    tx = cam.position.x + dx / dist * want; tz = cam.position.z + dz / dist * want;
    if (!NADEGEO) { NADEGEO = new T.BoxGeometry(0.16, 0.2, 0.16); NADEMAT = new T.MeshStandardMaterial({ color: 0x3d4a2a, roughness: 0.6, metalness: 0.3 }); }
    const m = new T.Mesh(NADEGEO, NADEMAT);
    const from = new T.Vector3(0.25, -0.2, -0.5).applyMatrix4(cam.matrixWorld);
    m.position.copy(from);
    m.castShadow = true;
    ctx.scene.add(m);
    nades.push({ mesh: m, from: from.clone(), to: new T.Vector3(tx, 0.38, tz), t: 0, dur: 0.55 + want * 0.025, fuse: 0.35, landed: false });
    gun("reload");
    window.__weapon = { w: weapon, ammo: wAmmo, nades: grenades };
  }
  function stepNades(ctx, dt) {
    for (let i = nades.length - 1; i >= 0; i--) {
      const n = nades[i];
      if (!n.landed) {
        n.t += dt;
        const k = Math.min(1, n.t / n.dur);
        n.mesh.position.lerpVectors(n.from, n.to, k);
        n.mesh.position.y += Math.sin(k * Math.PI) * (1.6 + n.dur * 2.2);
        n.mesh.rotation.x += dt * 14; n.mesh.rotation.z += dt * 9;
        if (k >= 1) { n.landed = true; n.mesh.position.copy(n.to); }
      } else {
        n.fuse -= dt;
        if (n.fuse <= 0) {
          const p = n.mesh.position;
          n.mesh.parent && n.mesh.parent.remove(n.mesh);
          nades.splice(i, 1);
          boomBarrel(ctx, { x: p.x, y: 0.0, z: p.z, dead: false, mesh: null });
          voxBreak(ctx.scene, p.x, 0.4, p.z, [0x5a4a36, 0x7a6448, 0x3a3226, 0x8a8a80], 22, 1.5);
          breakables.forEach((b) => {
            if (b.broken || !b.mesh.visible) return;
            const w = new T.Vector3(); b.mesh.getWorldPosition(w);
            if (Math.hypot(w.x - p.x, w.z - p.z) < 5 && w.y < 7) breakIt(ctx, b, w);
          });
          window.__nadeBooms = (window.__nadeBooms || 0) + 1;
        }
      }
    }
  }

  /* ---------------- shooting ---------------- */

  function fire(ctx) {
    if (!ctx || !booted || reloading || ended) return;
    /* the Stage 2 camera intro has no gun in hand: a click there must not spend a round */
    if (phase === "intro") return;
    tutEv("fire");
    const now = performance.now();
    const W = WEAPONS[weapon];
    if (now - lastShot < W.rate) return;
    if (weapon === "pistol") {
      if (bullets <= 0) { gun("dry"); lastShot = now; return; }
      bullets--;
    } else {
      wAmmo--;
    }
    lastShot = now;
    shotsFired++;
    recoil = W.kick;
    if (flash) { flash.visible = true; flash.scale.setScalar(1); }
    if (flashHalo) { flashHalo.visible = true; flashHalo.scale.setScalar(1); }
    if (flashStar) {
      flashStar.visible = true;
      flashStar.scale.setScalar(0.72);
      flashStar.rotation.z = 0;
      if (flashStar.children[0] && flashStar.children[0].material) flashStar.children[0].material.opacity = 0.95;
    }
    spawnSmoke(ctx.camera);
    ejectShell(ctx);
    gun(W.snd);
    if (W.pellets) {
      /* a spread of pellets around the crosshair; each can hit its own man.
         It counts once toward accuracy, and only an all-miss breaks a combo */
      const ax = aimN.x, ay = aimN.y, h0 = shotsHit;
      let any = false;
      for (let i = 0; i < W.pellets; i++) {
        const a = (i / W.pellets) * Math.PI * 2 + Math.random() * 0.6, r = i === 0 ? 0 : W.spread * (0.45 + Math.random() * 0.55);
        aimN = { x: ax + Math.cos(a) * r, y: ay + Math.sin(a) * r * (innerWidth / Math.max(1, innerHeight)) };
        shootRay(ctx, i > 0);
        if (window.__lastShot && window.__lastShot.sort !== "miss") any = true;
      }
      aimN = { x: ax, y: ay };
      shotsHit = h0 + (any ? 1 : 0);
      if (!any) combo = 0;
      shake = Math.max(shake, 0.5);
    } else {
      shootRay(ctx, false);
    }
    if (weapon !== "pistol" && wAmmo <= 0) setWeapon("pistol");
    window.__weapon = { w: weapon, ammo: wAmmo, nades: grenades };
  }

  function shootRay(ctx, quiet) {
    const now = performance.now();
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
    breakables.forEach((b) => { if (!b.broken && b.mesh.visible) addOwned(b.mesh, b, "break"); });
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
    if (hit && hit.sort === "break") {
      window.__lastShot = { sort: "break", kind: hit.extra.kind };
      breakIt(ctx, hit.extra, hit.at);
      return;
    }
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
      if (!quiet) combo = 0;
      window.__lastShot = { sort: "miss", blocked: !!blocked };
      if (blocked && !(quiet && Math.random() < 0.6)) {
        const sp = screenOf(blocked.point, ctx.camera);
        hitMark("block", sp.x, sp.y);
        impactBurst(ctx.scene, blocked.point, "concrete");
        bulletHole(ctx.scene, blocked);
        gun("dry");
      }
      return;
    }
    window.__lastShot = { sort: hit.sort, role: (hit.extra && hit.extra.role) || null };
    /* a canopy above his head takes the round first: the chute tears and he
       drops; the airframe and the armour take their own damage table */
    if (hit.extra && hit.extra.air === "para" && hit.extra.chuteOn && hit.at.y > hit.extra.y + 1.55) {
      window.__lastShot = { sort: "canopy", role: "para" };
      cutChute(ctx, hit.extra);
      return;
    }
    if (hit.extra && (hit.extra.air === "heli" || hit.extra.air === "apc")) {
      airDamage(ctx, hit.extra, hit.at, hit.box);
      return;
    }
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
    if (hit.sort === "smg" || hit.sort === "shotgun" || hit.sort === "grenade") {
      const item = hit.extra;
      item.taken = true;
      if (item.mesh) item.mesh.visible = false;
      if (hit.sort === "grenade") { grenades = Math.min(5, grenades + 2); addPts(ctx, 100); }
      else { setWeapon(hit.sort); addPts(ctx, 150); }
      const lab = hit.sort === "grenade" ? "GRENADE +2" : hit.sort === "smg" ? "SMG!" : "SHOTGUN!";
      hitMark("pickup", window.__lastHitPx.x, window.__lastHitPx.y, false, lab);
      gun("reload");
      window.__weapon = { w: weapon, ammo: wAmmo, nades: grenades };
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
      MS.heads++;
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
    /* head shot pays twice, and three times on the boss */
    const dmg = head ? (p.role === "boss" ? 3 : 2) : 1;
    window.__lastDmg = { role: p.role, head: head, dmg: dmg };    p.e.hp = (p.e.hp || 1) - dmg;
    if (p.commander && p.e.hp > 0) bossPhaseCheck(ctx, p);
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
    if (u.kN) {
      /* (v32) low ready → shouldered, from the rig's own holding poses, with
         a breath in the chest while he waits and the kick of each shot */
      p.kT = (p.kT || Math.random()) + dt * 0.75;
      kApply(u, "idle", p.kT, K_TOP, 1 - ak);
      /* arms in to the body while he is down (nothing reaches through the
         wall), up to low ready as he rises, shouldered when he fires */
      kApply(u, "idle", p.kT, K_ARMS, 1);
      kApply(u, "holding-both", 0, K_ARMS, Math.min(1, Math.max(ak, ex) * 2));
      kApply(u, "holding-both-shoot", 0.4, K_UPPER, ak);
      if (rc) { u.armL.rotateX(rc * 0.35); u.armR.rotateX(rc * 0.3); }
      /* (v38) he kneels behind the wall instead of being squashed: the legs
         fold back under him and the hips drop to the knees; only what the
         kneel cannot hide is taken off by a gentle squash */
      if (p.body && u.kS) {
        const H = K_H[p.role] || 2.3, L = 1.0 * u.kS;
        const need = Math.max(0, 1 - sy);
        const a = Math.min(1.45, need * 3.4);
        const drop = L * (1 - Math.cos(a));
        const sq = Math.max(0.55, Math.min(1, (H * sy) / Math.max(0.5, H - drop)));
        p.body.scale.y = sq;
        p.body.position.y = -drop * sq + Math.sin(p.breath) * 0.008 * ex;
        u.legL.rotation.set(a, 0, -0.08 * (a / 1.45));
        u.legR.rotation.set(a * 0.92, 0, 0.08 * (a / 1.45));
        p.body.rotation.x = (1 - ex) * 0.06 + 0.05 * ex;
      }
      /* (v37) behind cover the rifle hangs muzzle-down along the body (and is
         put away altogether while he is fully down), so no barrel pokes out
         through the front of the wall */
      if (u.rifle) u.rifle.visible = ak > 0.18 || ex > 0.3;
      kRifle(p, -0.04 + (1 - ak) * 1.2 + rc * 0.25, 0);
    }

    /* keep the visible top around for the tag and for the hit test */
    p.visTop = p.y + p.headTop * sy;
  }

  function stepPost(p, ctx, dt) {
    if (!p.mesh) return;
    if (p.air === "heli") { stepHeli(p, ctx, dt); return; }
    if (p.air === "apc") { if (p.e.alive === false) { stepDyingVehicle(p, ctx, dt); return; } stepBoss2(p, ctx, dt); return; }
    if (p.live === false || p.e.alive === false) return;
    if (p.air === "para") { stepPara(p, ctx, dt); return; }
    const cam = ctx.camera.position;

    if (p.role === "hostage") {
      p.mesh.rotation.y = Math.atan2(cam.x - p.x, cam.z - p.z);
      p.bob += dt * 1.6;
      if (p.body) p.body.rotation.z = Math.sin(p.bob) * 0.05;
      if (p.mesh.userData.kN) {
        /* hands up, knees a little bent, trembling */
        kHandsUp(p.mesh.userData, p.bob * 2, 1.2);
        if (p.body) { p.body.rotation.x = 0.08; p.body.position.y = -0.04 + Math.sin(p.bob * 9) * 0.008; }
      }
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
    if (p.run && p.run.from && p.runT < p.run.dur) {
      p.runT += dt;
      if (p.runT < 0 && p.bikeMesh) {
        /* waiting on the bike, engine idling, until his cue */
        p.y = rideY(p); p.expose = 1; p.coverTop = undefined;
        p.bikeYaw = Math.atan2(p.run.dest[0] - p.run.from[0], p.run.dest[1] - p.run.from[1]);
        posePost(p, cam, dt);
        applyRidePose(p, p.bikeYaw, 0);
        p.bikeMesh.userData.stand.visible = false;
        return;
      }
      if (p.runT >= 0) {
        const kk = Math.min(1, p.runT / p.run.dur);
        const e = kk * kk * (3 - 2 * kk);
        const fx = p.run.dest[0] - p.run.from[0], fz = p.run.dest[1] - p.run.from[1];
        if (p.bikeMesh) {
          /* a bike comes in fast and brakes into his spot */
          if (!p.motorOn) {
            p.motorOn = 1;
            gun("motor");
            const sp = screenOf(new T.Vector3(p.x, 1.6, p.z), ctx.camera);
            if (sp && sp.x > 0 && sp.x < innerWidth) hitMark("block", sp.x, sp.y - 30, false, "BIKE!");
            if (!window.__bikeCalled || performance.now() - window.__bikeCalled > 9000) { window.__bikeCalled = performance.now(); radio("적 오토바이 돌진! 타고 있을 때 쏘면 보너스!", 2600); }
          }
          const eb = 1 - Math.pow(1 - kk, 1.8);
          p.x = p.run.from[0] + fx * eb;
          p.z = p.run.from[1] + fz * eb;
          p.y = rideY(p);
          p.expose = 1;
          p.coverTop = undefined;
          p.bikeYaw = Math.atan2(fx, fz);
          posePost(p, cam, dt);
          applyRidePose(p, p.bikeYaw, Math.sin(kk * Math.PI) * 0.12 * (fx > 0 ? -1 : 1));
          const spd = (1 - kk) * 2.2 + 0.2;
          (p.bikeMesh.userData.wheels || []).forEach((w) => { w.rotation.x += dt * 20 * spd; });
          p.bikeMesh.userData.stand.visible = false;
          if (Math.random() < 0.25) smokeAt(ctx, p.x - Math.sin(p.bikeYaw) * 0.9, 0.5, p.z - Math.cos(p.bikeYaw) * 0.9, 0x8a8478);
          return;
        }
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
    } else if (p.run && p.run.from && p.runT < 1e9) {
      /* arrived: take up the cover he ran to */
      if (p.runT < p.run.dur + 0.001) {
        p.runT = p.run.dur + 1;
        if (p.bikeMesh) { dropBike(ctx, p, false); p.y = 0.3; if (p.bikeYaw != null) gun("dry"); }
        p.coverTop = p.coverTopSaved;
        p.state = "hidden";
        p.stateT = 0.4;
        p.expose = 0;
      }
    }

    p.breath += dt * 1.7;
    p.bob += dt * 2.4;

    /* a trooper running the open ground: waypoint to waypoint, stopped at
       walls, firing from a stand between dashes */
    if (p.runner) { stepRunner(p, ctx, dt); return; }

    /* a paratrooper who survived the drop walks to his sandbags and then
       falls into the same cover machine as everyone else */
    if (p.moveTo) {
      const arrived = walkMove(p, dt);
      if (!arrived) {
        p.expose = 1;
        posePost(p, cam, dt);
        walkPose(p, dt);
        placeTag(p, ctx, 1, false);
        return;
      }
      p.state = "peek";
      p.stateT = 0.15;
      p.expose = Math.min(p.expose, 0.3);
    }

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
      p.aim -= dt * seenK(p);
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
          const np = waveXY({ yaw: bossYaw, hold: bossHold }, s[0], s[1]);
          const dl = Math.hypot(np.x - bossHold.x, np.z - bossHold.z) || 1;
          const fr = wallBoxes.length ? pushOutOfWalls(np.x, np.z, 0.4, { x: (np.x - bossHold.x) / dl, z: (np.z - bossHold.z) / dl }) : np;
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

    /* `!` over his head: green as he starts to come out, orange as the aim
       closes, red and pulsing on the last beat, with a ring that runs down */
    const aiming = p.state === "fire" || p.state === "peek";
    const prog = p.state === "fire" ? Math.max(0, Math.min(1, 1 - p.aim / Math.max(0.001, p.aimMax))) : 0;
    placeTag(p, ctx, prog, aiming);
  }

  /* a running soldier: strides from the hip, shins folding, arms pumping,
     rifle carried low, and he faces where he is going */
  /* (v19) a military motorcycle, modelled in parts: spoked wheels with
     tyres and hubs, a double-cradle frame, tank with filler cap, saddle,
     a finned single-cylinder engine with its exhaust run, front fork and
     handlebar with grips and mirrors, a headlamp, mudguards and a rear rack
     with a jerrycan. Built facing +Z, about 2.1 m long. */
  function makeMotorbike() {
    makeSol();
    const g = new T.Group();
    /* (v21) hex colours are sRGB: convert, or every dark paint washes out */
    const lin = (c) => new T.Color(c).convertSRGBToLinear();
    const olive = new T.MeshStandardMaterial({ color: lin(0x4e5a30), roughness: 0.7, metalness: 0.05 });
    const oliveD = new T.MeshStandardMaterial({ color: lin(0x323a1e), roughness: 0.75, metalness: 0.05 });
    const steel = new T.MeshStandardMaterial({ color: lin(0x8a9096), roughness: 0.4, metalness: 0.5 });
    const black = new T.MeshStandardMaterial({ color: lin(0x1c1e20), roughness: 0.7, metalness: 0.2 });
    const tyre = SOL.tire || black;
    const B = (w, h, d, x, y, z, m, rx, ry, rz) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0); o.castShadow = true; g.add(o); return o; };
    const C = (rt, rb, h, x, y, z, m, seg, rx, rz) => { const o = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 12), m); o.position.set(x, y, z); o.rotation.set(rx || 0, 0, rz || 0); o.castShadow = true; g.add(o); return o; };
    const wheel = (z) => {
      const w = new T.Group();
      w.position.set(0, 0.34, z);
      g.add(w);
      const t = new T.Mesh(new T.TorusGeometry(0.28, 0.075, 8, 18), tyre); t.rotation.y = Math.PI / 2; w.add(t);
      const rim = new T.Mesh(new T.TorusGeometry(0.22, 0.018, 6, 18), steel); rim.rotation.y = Math.PI / 2; w.add(rim);
      const hub = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.14, 10), steel); hub.rotation.z = Math.PI / 2; w.add(hub);
      for (let i = 0; i < 12; i++) { const sp = new T.Mesh(new T.BoxGeometry(0.008, 0.42, 0.008), steel); sp.rotation.x = i * Math.PI / 12; w.add(sp); }
      return w;
    };
    const wf = wheel(0.72), wr = wheel(-0.68);
    B(0.06, 0.06, 1.2, 0, 0.62, 0.02, oliveD, 0.28);            /* frame down tube */
    B(0.06, 0.06, 1.1, 0, 0.82, -0.18, oliveD, -0.08);          /* top tube */
    B(0.05, 0.05, 0.7, 0.1, 0.48, -0.42, oliveD, 0.5);          /* swingarm L */
    B(0.05, 0.05, 0.7, -0.1, 0.48, -0.42, oliveD, 0.5);
    B(0.26, 0.2, 0.5, 0, 0.96, 0.22, olive);                    /* tank */
    B(0.2, 0.06, 0.4, 0, 1.07, 0.22, olive);
    C(0.035, 0.035, 0.03, 0, 1.11, 0.28, steel, 10);             /* filler cap */
    B(0.24, 0.08, 0.5, 0, 0.94, -0.28, black);                   /* saddle */
    B(0.2, 0.1, 0.12, 0, 0.98, -0.5, black);
    B(0.24, 0.26, 0.3, 0, 0.5, 0.05, oliveD);                    /* crankcase */
    for (let i = 0; i < 5; i++) B(0.2, 0.025, 0.2, 0, 0.66 + i * 0.045, 0.16, steel); /* cylinder fins */
    B(0.12, 0.08, 0.12, 0, 0.9, 0.16, steel);
    C(0.035, 0.035, 0.9, 0.14, 0.42, -0.32, steel, 8, Math.PI / 2 - 0.12); /* exhaust */
    C(0.055, 0.05, 0.36, 0.15, 0.48, -0.78, steel, 10, Math.PI / 2 - 0.12); /* silencer */
    [-0.07, 0.07].forEach((x) => B(0.035, 0.035, 0.68, x, 0.66, 0.66, steel, -0.42)); /* fork */
    B(0.2, 0.05, 0.08, 0, 1.0, 0.56, oliveD);                    /* yoke */
    B(0.66, 0.03, 0.03, 0, 1.12, 0.5, steel);                    /* handlebar */
    [-1, 1].forEach((sx) => {
      B(0.1, 0.045, 0.045, sx * 0.34, 1.12, 0.5, black);          /* grips */
      B(0.012, 0.18, 0.012, sx * 0.26, 1.21, 0.52, steel);         /* mirror stalks */
      B(0.08, 0.05, 0.02, sx * 0.26, 1.31, 0.53, steel);
    });
    C(0.09, 0.1, 0.1, 0, 0.96, 0.66, black, 12, Math.PI / 2);    /* headlamp */
    const lens = new T.Mesh(new T.CircleGeometry(0.08, 12), new T.MeshBasicMaterial({ color: 0xfff1c8 })); lens.position.set(0, 0.96, 0.715); g.add(lens);
    B(0.16, 0.025, 0.42, 0, 0.66, 0.76, olive, 0.25);            /* front guard */
    B(0.18, 0.025, 0.5, 0, 0.7, -0.7, olive, -0.35);             /* rear guard */
    B(0.26, 0.03, 0.34, 0, 1.0, -0.76, oliveD);                  /* rack */
    B(0.2, 0.28, 0.1, 0, 1.16, -0.82, olive);                    /* jerrycan */
    B(0.08, 0.05, 0.05, 0, 1.33, -0.82, olive);
    B(0.05, 0.28, 0.05, 0.12, 0.2, -0.05, steel, 0, 0, 0.4);     /* side stand */
    const tail = new T.Mesh(new T.BoxGeometry(0.08, 0.04, 0.02), SOL.lampRed); tail.position.set(0, 0.86, -0.95); g.add(tail);
    g.userData.wheels = [wf, wr];
    g.userData.stand = g.children[g.children.length - 2];
    
    return g;
  }
  /* rider on the saddle: knees up, hands on the bars, leaning in */
  /* the rider's feet-origin height that puts his hip joint on the saddle */
  function rideY(p) { const sc = (p.mesh && p.mesh.scale.x) || p.scale || 1.28; return 0.34 + 1.02 - 0.68 * sc; }
  function applyRidePose(p, yaw, lean) {
    const u = p.mesh.userData;
    if (u.legL) { u.legL.rotation.x = -1.45; u.legL.rotation.z = 0.18; }
    if (u.legR) { u.legR.rotation.x = -1.45; u.legR.rotation.z = -0.18; }
    if (u.shinL) u.shinL.rotation.x = 1.55;
    if (u.shinR) u.shinR.rotation.x = 1.55;
    if (u.armL) u.armL.rotation.set(-1.05, 0, 0.22);
    if (u.armR) u.armR.rotation.set(-1.05, 0, -0.22);
    if (u.rifle) { u.rifle.position.set(-0.24, 1.05, -0.1); u.rifle.rotation.set(0.9, Math.PI, 0.3); }
    if (u.body) { u.body.position.y = 0.0; u.body.rotation.x = 0.34; u.body.rotation.z = 0; u.body.scale.y = 1; }
    if (u.headG) u.headG.rotation.x = -0.2;
    if (u.kN) {
      kApply(u, "drive", 0, K_BODY, 1);
      if (u.rifle) { u.rifle.position.set(0, (K_H[p.role] || 2.3) * 0.55, -0.32); u.rifle.rotation.set(0, Math.PI, 0.9); }
    }
    p.mesh.rotation.y = yaw;
    p.mesh.rotation.z = lean || 0;
  }
  const crashed = [];
  function dropBike(ctx, p, crash) {
    const b = p.bikeMesh;
    if (!b || !b.parent) return;
    b.updateMatrixWorld(true);
    const wp = new T.Vector3(), wq = new T.Quaternion(), ws = new T.Vector3();
    b.matrixWorld.decompose(wp, wq, ws);
    b.parent.remove(b);
    b.position.copy(wp); b.quaternion.copy(wq); b.scale.copy(ws);
    ctx.scene.add(b);
    p.bikeMesh = null;
    p.mesh.rotation.z = 0;
    if (crash) {
      const yaw = p.bikeYaw || 0;
      b.userData.v = new T.Vector3(Math.sin(yaw) * 7, 0, Math.cos(yaw) * 7);
      b.userData.spin = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2);
      b.userData.t = 0;
      crashed.push(b);
      gun("clank");
    } else {
      /* parked on its side stand */
      b.rotation.z = 0.18;
      b.position.y = 0.34;
    }
    window.__bikes = (window.__bikes || 0) + 1;
  }
  /* (v20) the square's bronze group can be brought down by a falling
     gunship: every block of it comes loose, tumbles and settles on the
     flagstones */
  let MONU = null;
  const debris = [];
  function shatterMonument(ctx, at) {
    if (!MONU || MONU.broken) return;
    MONU.broken = true;
    const cx = MONU.x, cz = MONU.z;
    const pieces = [];
    MONU.figs.forEach((o) => {
      if (!o.parent) return;
      o.updateMatrixWorld(true);
      if (o.isMesh) pieces.push(o);
      else o.traverse((c) => { if (c.isMesh) pieces.push(c); });
    });
    pieces.forEach((m) => {
      ctx.scene.attach(m);
      const dx = m.position.x - (at ? at.x : cx), dz = m.position.z - (at ? at.z : cz);
      const d = Math.hypot(dx, dz) || 1;
      const pw = 4 + Math.random() * 6;
      m.userData.dv = new T.Vector3((dx / d) * pw + (Math.random() - 0.5) * 3, 3 + Math.random() * 7, (dz / d) * pw + (Math.random() - 0.5) * 3 - 2);
      m.userData.dw = new T.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      const bb = new T.Box3().setFromObject(m);
      m.userData.half = Math.max(0.15, (bb.max.y - bb.min.y) * 0.25);
      m.userData.rest = 0;
      debris.push(m);
    });
    for (let i = 0; i < 6; i++) boomAt(ctx, cx + (Math.random() - 0.5) * 9, MONU.base + Math.random() * 6, cz + (Math.random() - 0.5) * 3);
    for (let i = 0; i < 16; i++) smokeAt(ctx, cx + (Math.random() - 0.5) * 12, MONU.base + Math.random() * 5, cz + (Math.random() - 0.5) * 4, 0x8a8070);
    shake = 2.2;
    hitStop = Math.max(hitStop, 0.25);
    flashScreen(0.8);
    gun("boom");
    setTimeout(() => gun("boom"), 180);
    addPts(ctx, 3000);
    radio("동상이 무너진다! 적 사기 붕괴, 밀어붙여라!", 3400);
    window.__monuDown = (window.__monuDown || 0) + 1;
  }
  function stepDebris(dt) {
    for (let i = debris.length - 1; i >= 0; i--) {
      const m = debris[i], u = m.userData;
      if (u.rest > 2) continue;
      u.dv.y -= 14 * dt;
      m.position.addScaledVector(u.dv, dt);
      m.rotation.x += u.dw.x * dt; m.rotation.y += u.dw.y * dt; m.rotation.z += u.dw.z * dt;
      /* the plinth top is a floor too, for the blocks that drop straight down */
      const onPlinth = MONU && Math.abs(m.position.x - MONU.x) < 6.5 && Math.abs(m.position.z - MONU.z) < 2.7;
      const floor = (onPlinth ? MONU.base : 0.3) + u.half;
      if (m.position.y < floor) {
        m.position.y = floor;
        u.dv.y = -u.dv.y * 0.32;
        u.dv.x *= 0.55; u.dv.z *= 0.55;
        u.dw.multiplyScalar(0.5);
        if (Math.abs(u.dv.y) < 1.2) { u.rest++; u.dv.set(0, 0, 0); u.dw.set(0, 0, 0); }
      }
    }
  }

  function stepCrashed(ctx, dt) {
    for (let i = crashed.length - 1; i >= 0; i--) {
      const b = crashed[i], u = b.userData;
      u.t += dt;
      b.position.addScaledVector(u.v, dt);
      u.v.multiplyScalar(Math.max(0, 1 - dt * 2.2));
      b.rotation.z = Math.min(Math.PI / 2 - 0.1, b.rotation.z + dt * 3.4);
      b.rotation.y += u.spin * dt * (u.v.length() / 7);
      b.position.y = 0.3 + 0.12 * Math.max(0, Math.sin(u.t * 9)) * Math.max(0, 1 - u.t);
      if (u.t < 0.8 && Math.random() < 0.5) burst(ctx.scene, b.position.x, 0.4, b.position.z, false);
      if (u.v.length() < 0.05) crashed.splice(i, 1);
    }
  }

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
    if (u.kN) {
      /* sprint legs and body, rifle held across the chest at port arms */
      kApply(u, "sprint", ph / (Math.PI * 2), K_BODY, 1);
      kApply(u, "holding-both", 0, K_ARMS, 1);
      kRifle(p, 0.55, 0.25);
    }
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
    return g;  }

  /* an enemy round: muzzle flash at his barrel, a tracer back at the camera,
     a kick of the rifle, and the damage when this round is the one that counts */
  /* (v41) fair fire: a man you cannot see does not shoot you. His aim only
     runs down while he is inside the frame (a little margin), and a round
     from outside it does no damage. Off-screen enemies get an arrow at the
     screen edge instead (stepThreatArrows). */
  const _seenV = new T.Vector3();
  function seenK(p) {
    const cam = window.__railCtx && window.__railCtx.camera;
    if (!cam || !p) return 1;
    const x = p.mesh ? p.mesh.position.x : p.x, z = p.mesh ? p.mesh.position.z : p.z;
    _seenV.set(x, (p.y || 0.3) + 1.1, z).project(cam);
    if (_seenV.z > 1) return 0;
    return Math.abs(_seenV.x) <= 0.97 && _seenV.y > -1.05 && _seenV.y < 1.05 ? 1 : 0;
  }
  const threatEls = [];
  window.__seenK = (p) => seenK(p);
  let frameOff = 0;
  function stepThreatArrows(ctx) {
    const cam = ctx.camera;
    const list = [];
    if (!ended && (phase === "fight" || phase === "boss")) {
      posts.forEach((p) => {
        if (!p.mesh || p.live === false || !p.e || p.e.alive === false || p.role === "hostage") return;
        if (p.state === "hidden" && !p.air && !p.runner && !p.bikeMesh) return;
        if (seenK(p)) return;
        const v = new T.Vector3(p.mesh.position.x, (p.y || 0.3) + 1.1, p.mesh.position.z).project(cam);
        let x = v.x, y = v.y;
        if (v.z > 1) { x = -x; y = -y; }
        const m = Math.max(Math.abs(x), Math.abs(y)) || 1;
        list.push({ x: x / m, y: y / m, hot: p.state === "fire" || p.air === "heli" });
      });
    }
    while (threatEls.length < list.length && threatEls.length < 6) {
      const d = document.createElement("div");
      d.className = "railEdge";
      d.innerHTML = '<svg viewBox="0 0 40 40"><path d="M20 4 L36 32 L20 25 L4 32 Z" fill="#ff4a3a" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg>';
      document.body.appendChild(d);
      threatEls.push(d);
    }
    threatEls.forEach((d, i) => {
      const t = list[i];
      if (!t) { d.style.display = "none"; return; }
      const W = innerWidth, H = innerHeight, pad = 34;
      const px = W / 2 + t.x * (W / 2 - pad), py = H / 2 - t.y * (H / 2 - pad);
      const ang = Math.atan2(t.x, t.y);
      d.style.display = "";
      d.style.left = (px - 18) + "px";
      d.style.top = (py - 18) + "px";
      d.style.transform = "rotate(" + ang + "rad)";
      d.classList.toggle("hot", !!t.hot);
    });
  }
  function enemyFire(ctx, p, dmg) {
    if (dmg && !seenK(p)) dmg = 0;
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
    /* (v21) on the Yalu bridge there is no ground beside the deck: he waits
       out the crossing instead of hovering over the river */
    if (STAGE.dress === "paektu" && cam.position.z > 1 && cam.position.z < 37) { a.visible = false; return; }
    if (!chase) a.visible = true;
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
    /* (v14) he used to slide all the way back to the lens when the anchor sat
       in a wall, filling the bottom of the screen with camo. Now: try the
       left anchor pulled in no closer than ~55 %, then the same on the right,
       then a little further down the road; keep the last good spot if none */
    if (wallBoxes.length && insideWall(tx, tz, 0.42)) {
      const cands = [];
      [1, -1].forEach((side) => {
        for (let k = 1; k <= 3; k++) {
          const f = 1 - k * 0.15;
          cands.push([cam.position.x + fwd.x * dist * f + right.x * lat * side * f, cam.position.z + fwd.z * dist * f + right.z * lat * side * f]);
        }
      });
      cands.push([cam.position.x + fwd.x * dist * 1.35 + right.x * lat * 0.6, cam.position.z + fwd.z * dist * 1.35 + right.z * lat * 0.6]);
      let ok = null;
      for (const c of cands) if (!insideWall(c[0], c[1], 0.42)) { ok = c; break; }
      if (ok) { tx = ok[0]; tz = ok[1]; }
      else { tx = a.position.x; tz = a.position.z; }
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
    /* never inside the camera's personal space: push him out to 3 m, and if
       a wall still holds him closer than 2 m, hide him rather than let his
       helmet fill the screen */
    {
      const dx = a.position.x - cam.position.x, dz = a.position.z - cam.position.z;
      const d = Math.hypot(dx, dz);
      const MIN = 3.0;
      if (d < MIN) {
        const ux = d > 0.01 ? dx / d : fwd.x, uz = d > 0.01 ? dz / d : fwd.z;
        const nx = cam.position.x + ux * MIN, nz = cam.position.z + uz * MIN;
        if (!wallBoxes.length || !insideWall(nx, nz, 0.42)) { a.position.x = nx; a.position.z = nz; }
      }
      const d2 = Math.hypot(a.position.x - cam.position.x, a.position.z - cam.position.z);
      const vis = d2 >= 2.0;
      if (a.visible !== vis) a.visible = vis;
      window.__allyDist = +d2.toFixed(2);
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
    if (u.kN) {
      kApply(u, "walk", u.phase / (Math.PI * 2), K_LEGS, Math.min(1, gait * 1.4));
      kApply(u, "holding-both", 0, K_ARMS, 1);
      kApply(u, "holding-both-shoot", 0.4, K_UPPER, aim);
      kRifle({ mesh: a }, -0.04 + 0.45 * (1 - aim) + (u.recoil || 0) * 0.2, 0);
    }
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

  /* (v35) first-run training: six short coach cards over the first real
     mission. Each one waits for the thing it teaches (a shot, a kill, a
     reload, a grenade) or times out, points at the button it is about, and
     enemy fire is softened until the reload lesson is done. Shown once
     (localStorage myeolgong_tut); never in practice. */
  const TUT = { on: false, checked: false, step: 0, t: 0, el: null, arrow: null, ev: {} };
  const TKO = () => (document.documentElement.lang || "ko").startsWith("ko");
  const TUT_STEPS = [
    { id: "shoot", ko: "<b>화면을 탭</b>하면 그곳으로 쏴요", en: "<b>Tap the screen</b> to shoot there", tap: 1, done: (e) => e.fire >= 2 },
    { id: "enemy", ko: "적 머리 위 <b>게이지가 차면</b> 적이 쏴요. 먼저 맞히세요!<br><small>머리를 맞히면 헤드샷 · 점수 2배</small>", en: "When the <b>gauge</b> over an enemy fills, he fires. Hit him first!<br><small>Headshots score double</small>", when: () => posts.some((p) => p.live && p.e && p.e.alive !== false && p.role !== "hostage" && (p.state === "fire" || p.state === "peek")), done: (e, t) => MS.kills >= 1 || t > 9 },
    { id: "reload", ko: "<b>재장전</b> 버튼으로 탄창을 갈아요<br><small>키보드는 R</small>", en: "<b>Reload</b> with this button<br><small>R on a keyboard</small>", el: "railReload", force: 18, when: () => weapon === "pistol" && bullets <= Math.ceil(clipMax * 0.5), done: (e, t) => e.reload >= 1 || t > 10 },
    { id: "nade", ko: "<b>수류탄</b>: 엄폐물 뒤에 숨은 적에게 던져요<br><small>키보드는 G</small>", en: "<b>Grenade</b>: for enemies hiding behind cover<br><small>G on a keyboard</small>", el: "railNade", force: 20, when: () => grenades > 0 && posts.filter((p) => p.live && p.e && p.e.alive !== false && p.role !== "hostage").length >= 2, done: (e, t) => e.nade >= 1 || t > 8 },
    { id: "civ", ko: "<b>손 든 민간인은 쏘지 마세요!</b><br><small>맞히면 −300점</small>", en: "<b>Don't shoot people with their hands up!</b><br><small>−300 points</small>", force: 25, when: () => posts.some((p) => p.live && p.role === "hostage") || (AMB.refs && AMB.refs.length > 0), done: (e, t) => t > 4.5 },
    { id: "end", ko: "훈련 끝! 이제 작전을 완수하세요", en: "Training done — finish the mission!", done: (e, t) => t > 2.6 }
  ];
  function tutStart() {
    TUT.on = false;
    if (practice || window.__noTut) return;
    try { if (localStorage.getItem("myeolgong_tut") === "1") return; } catch (e) {}
    TUT.on = true; TUT.step = 0; TUT.t = 0; TUT.ev = { fire: 0, reload: 0, nade: 0 }; TUT.shown = false;
  }
  function tutEv(k) { if (TUT.on) TUT.ev[k] = (TUT.ev[k] || 0) + 1; }
  function tutHide() {
    if (TUT.el) { TUT.el.remove(); TUT.el = null; }
    if (TUT.arrow) { TUT.arrow.remove(); TUT.arrow = null; }
    if (TUT.tap) { TUT.tap.remove(); TUT.tap = null; }
  }
  function tutShow(S) {
    tutHide();
    if (!document.getElementById("railTutCss")) {
      const st = document.createElement("style"); st.id = "railTutCss";
      st.textContent = "#railTut{position:fixed;left:50%;top:max(76px,calc(env(safe-area-inset-top) + 64px));transform:translateX(-50%);z-index:46;max-width:min(88vw,420px);padding:10px 16px;border-radius:14px;background:rgba(10,16,10,.88);border:2px solid #e8c860;color:#fff;font:700 15px/1.4 Pretendard,system-ui,sans-serif;text-align:center;box-shadow:0 8px 26px rgba(0,0,0,.5);pointer-events:none;animation:railTutIn .25s ease-out}" +
        "#railTut small{font-weight:600;color:#d8d0a8;font-size:12px}#railTut .k{display:block;font:900 10px/1 ui-monospace,monospace;letter-spacing:.18em;color:#e8c860;margin-bottom:5px}" +
        "@keyframes railTutIn{from{transform:translate(-50%,-10px) scale(.96)}}" +
        "#railTutArrow{position:fixed;z-index:46;width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:20px solid #e8c860;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6));pointer-events:none;animation:railTutBob .7s ease-in-out infinite alternate}" +
        "@keyframes railTutBob{to{margin-top:-10px}}" +
        "#railTutTap{position:fixed;left:50%;top:52%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;border:3px solid #fff;z-index:46;pointer-events:none;animation:railTutTap 1.1s ease-out infinite}" +
        "@keyframes railTutTap{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.4);opacity:0}}";
      document.head.appendChild(st);
    }
    const ko = TKO();
    const el = document.createElement("div"); el.id = "railTut";
    el.innerHTML = '<span class="k">' + (ko ? "훈련 " : "TRAINING ") + (TUT.step + 1) + "/" + TUT_STEPS.length + "</span>" + (ko ? S.ko : S.en);
    document.body.appendChild(el); TUT.el = el;
    if (S.tap) { const t = document.createElement("div"); t.id = "railTutTap"; document.body.appendChild(t); TUT.tap = t; }
    if (S.el) {
      const target = document.getElementById(S.el);
      if (target) {
        const r = target.getBoundingClientRect();
        const a = document.createElement("div"); a.id = "railTutArrow";
        a.style.left = (r.left + r.width / 2 - 14) + "px"; a.style.top = (r.top - 30) + "px";
        document.body.appendChild(a); TUT.arrow = a;
      }
    }
  }
  function tutStep(ctx, dt) {
    if (ended || finishing) { tutHide(); TUT.on = false; return; }
    if (pauseOpen || contOpen || phase === "intro") { if (TUT.el) TUT.el.style.opacity = "0"; return; }
    if (TUT.el) TUT.el.style.opacity = "";
    const S = TUT_STEPS[TUT.step];
    if (!S) { tutHide(); TUT.on = false; return; }
    if (!TUT.shown) {
      TUT.wait = (TUT.wait || 0) + dt;
      if (S.when && !S.when() && !(S.force && TUT.wait > S.force)) return;
      TUT.wait = 0;
      TUT.shown = true; TUT.t = 0; TUT.ev0 = Object.assign({}, TUT.ev);
      tutShow(S);
    }
    TUT.t += dt;
    const e = {}; Object.keys(TUT.ev).forEach((k) => { e[k] = TUT.ev[k] - (TUT.ev0[k] || 0); });
    if (S.done(e, TUT.t)) {
      tutHide();
      TUT.step++; TUT.shown = false;
      if (TUT.step >= TUT_STEPS.length) {
        TUT.on = false;
        try { localStorage.setItem("myeolgong_tut", "1"); } catch (err) {}
      }
    }
  }
  window.__tut = TUT;

  function frame(ctx) {
    if (!armed || !active || !ctx || !ctx.scene || !ctx.camera) return;
    const cam = ctx.camera;
    const nowMs = performance.now();
    let dt = Math.min(0.05, (nowMs - (frame._t || nowMs)) / 1000) || 0.016;
    if (hitStop > 0) { hitStop = Math.max(0, hitStop - dt); dt *= 0.16; }
    if (window.__railSpeed) dt *= window.__railSpeed;
    if (slowmo > 0) { slowmo = Math.max(0, slowmo - dt); dt *= slowK; }
    if (invulT > 0) { invulT -= dt; if (invulT <= 0) { const sh = document.getElementById("railShield"); if (sh) sh.remove(); } }
    frame._t = nowMs;
    glbStep(dt);
    if (!TUT.checked) { TUT.checked = true; tutStart(); }
    if (TUT.on) tutStep(ctx, dt);
    const t = (nowMs - t0) / 1000;
    clock = Math.max(0, CLOCK0 - t);

    // ---- camera rail ----
    let lookGoal = null;
    let arrived = false;
    if (!ended) {
      if (phase === "intro") {
        /* 3.8 s of camera intro with the radio open */
        introT = (nowMs - introT0) / 1000;
        const a = STAGE.introCam[0], b = STAGE.introCam[1];
        const k = Math.min(1, introT / (STAGE.introDur || 3.6));
        const e = k * k * (3 - 2 * k);
        cam.position.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e);
        lookGoal = {
          x: a[3] + (b[3] - a[3]) * e,
          y: a[4] + (b[4] - a[4]) * e,
          z: a[5] + (b[5] - a[5]) * e
        };
        (STAGE.introLines || []).forEach((ln, li) => {
          if (li >= introLineI && introT >= ln.t) { radio(ln.text, 4400); introLineI = li + 1; }
        });
        if (introT >= (STAGE.introDur || 3.6)) {
          phase = "move";
          pathU = 0;
          window.__railPhase = "move";
          if (STAGE.chase) startChase(ctx);
        }
      } else if (phase === "move" || phase === "toBoss") {
        const goalU = phase === "toBoss" ? bossU : (waves[waveI] ? waves[waveI].u : bossU);
        pathU = Math.min(goalU, pathU + ((chase ? 6.2 : 7.4) * dt) / pathLen);
        const p = pathAt(pathU);
        const tng = curve.getTangentAt(Math.max(0, Math.min(1, pathU)));
        const tl = Math.hypot(tng.x, tng.z) || 1;
        const tx = tng.x / tl, tz = tng.z / tl;
        const so = steerStep(p, tx, tz, dt, pathU);
        cam.position.set(p.x + tz * so, CAM_Y, p.z - tx * so);
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
          if (phase === "move") { if (chase) endChase(ctx); startWave(waves[waveI]); }
          else if (phase === "toBoss") { startBoss(ctx); }
        }
      } else {
        /* at a hold the side-step relaxes back to the hold point */
        steerOff *= Math.exp(-3.2 * dt);
        const hu = Math.max(0, Math.min(1, pathU));
        const tng = curve ? curve.getTangentAt(hu) : null;
        const tl = tng ? (Math.hypot(tng.x, tng.z) || 1) : 1;
        const tx = tng ? tng.x / tl : 0, tz = tng ? tng.z / tl : 1;
        cam.position.set(curHold.x + tz * steerOff, CAM_Y, curHold.z - tx * steerOff);
        lookGoal = { x: curLook.x, y: curLook.y, z: curLook.z };
        /* (v41) combat framing: when someone who is up and fighting stands
           past the edge of the frame (a narrow portrait screen), the view
           leans toward him, a few metres at most, and eases back after */
        {
          let want = 0;
          if (phase === "fight" || phase === "boss") {
            let hi = -9, lo = 9;
            posts.forEach((p) => {
              if (!p.mesh || p.live === false || !p.e || p.e.alive === false || p.role === "hostage") return;
              if (p.state === "hidden" && !p.air && !p.runner) return;
              _seenV.set(p.mesh.position.x, (p.y || 0.3) + 1.1, p.mesh.position.z).project(cam);
              if (_seenV.z > 1) return;
              hi = Math.max(hi, _seenV.x); lo = Math.min(lo, _seenV.x);
            });
            if (hi > 0.8 && lo > -0.8) want = Math.min(1, hi - 0.8) * 9;
            else if (lo < -0.8 && hi < 0.8) want = -Math.min(1, -0.8 - lo) * 9;
          }
          frameOff += (want - frameOff) * Math.min(1, dt * 1.6);
          if (Math.abs(frameOff) > 0.01) {
            const fx = curLook.x - cam.position.x, fz = curLook.z - cam.position.z, fl = Math.hypot(fx, fz) || 1;
            /* the camera's right, on the ground */
            const rx = -fz / fl, rz = fx / fl;
            lookGoal.x += rx * frameOff; lookGoal.z += rz * frameOff;
          }
        }
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
    if (phase !== "intro") cam.position.y = CAM_Y + sy + Math.sin(nowMs / 1700) * 0.006 + (chase ? Math.sin(nowMs / 90) * 0.012 : 0);
    cam.lookAt(lookSmooth.x, lookSmooth.y + sway, lookSmooth.z);
    cam.near = 0.06;
    cam.fov = viewFov();
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    if (ctx.player) ctx.player.visible = false;
    try { stepThreatArrows(ctx); } catch (e) {}

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
      const falling = posts.some((p) => p.air === "heli" && p.e.alive === false && p.mesh && p.mesh.visible !== false);
      if (!falling && (left === 0 || (waveT <= 0 && phase !== "boss"))) endWave(ctx);
    } else if (phase === "move" || phase === "toBoss") {
      if (chase) stepChase(ctx, dt);
      else stepAlly(ctx, dt);
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
        /* (v32) arms and legs go with the rig's own death */
        if (p.mesh.userData.kN) kApply(p.mesh.userData, "die", Math.min(0.999, t * 1.25), K_BODY, 1);
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
    if (reloadK > 0) reloadK = Math.max(0, reloadK - dt / (0.44 * (PERK.reload || 1)));
    if (pistol && pistolBase) {
      { const want = phase !== "intro" && phase !== "result"; if (pistol.visible !== want) pistol.visible = want; }
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
    window.__fxCount = () => ({ sparks: sparks.length, smokes: smokes.length, tracers: tracers.length, chunks: chunks.length, holes: holes.length });
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
    if (flashStar) {
      const k = Math.min(1, since / 80);
      flashStar.visible = since < 80;
      flashStar.scale.setScalar(0.72 + k * 1.05);
      flashStar.rotation.z = k * 0.7;
      if (flashStar.children[0] && flashStar.children[0].material) {
        flashStar.children[0].material.opacity = 0.95 * (1 - k);
      }
    }
    for (let i = shells.length - 1; i >= 0; i--) {
      const sh = shells[i];
      sh.userData.life -= dt;
      sh.userData.v.y -= 9.4 * dt;
      sh.position.addScaledVector(sh.userData.v, dt);
      sh.rotation.x += sh.userData.spin.x * dt;
      sh.rotation.y += sh.userData.spin.y * dt;
      sh.rotation.z += sh.userData.spin.z * dt;
      const floor = 0.33;
      if (sh.position.y < floor) {
        sh.position.y = floor;
        sh.userData.v.y = Math.abs(sh.userData.v.y) * 0.34;
        sh.userData.v.x *= 0.55;
        sh.userData.v.z *= 0.55;
        sh.userData.spin.multiplyScalar(0.55);
        if (sh.userData.v.y < 0.35) sh.userData.v.y = 0;
      }
      if (sh.userData.life <= 0 || !sh.parent) {
        if (sh.parent) sh.parent.remove(sh);
        shells.splice(i, 1);
      }
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
    stepChunks(dt);
    stepWeather(ctx, dt);
    stepFallers(dt);
    stepCrashed(ctx, dt);
    if (debris.length) stepDebris(dt);
    if (dress && dress.fires && dress.fires.length) stepFires(dt);
    stepBoomLight(dt);
    if (FXL.length) stepFxl(dt);
    if (!ended && phase !== "intro") { try { stepAmbient(ctx, dt); } catch (e) { window.__ambErr = String(e && e.stack || e); } }
    if (WATER.length) stepWater(dt);
    if (dress && dress.anims && dress.anims.length) { dress.animT += dt; dress.anims.forEach((f) => { try { f(dress.animT); } catch (e) {} }); }
    if (!ended) { try { stepEngines(ctx); } catch (e) {} }
    stepNades(ctx, dt);
    /* the SMG keeps firing while the trigger is held */
    if (holding && weapon === "smg" && active && !ended && phase !== "intro") fire(ctx);
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
    radioTick(nowMs);
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
      stage: stageId, stageLabel: STAGE.label,
      air: airReport(ctx),
      radio: window.__radio ? String(window.__radio.text).slice(0, 30) : "",
      chuteCuts: window.__chuteCuts || 0, landed: window.__paraLanded || 0,
      heliDown: window.__heliDown || 0, bossDown: window.__bossDown || 0,
      threat: posts.filter((p) => p.e && p.e._tag && p.e._tag.style.display !== "none")
        .map((p) => (p.role || "?") + ":" + (p.e._tagCol || "?") + ":" + (p.e._tagUrgent ? "U" : "-")).join(","),
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
    window.__pickupPts = pickups.filter((p) => !p.taken && p.mesh).map((p) => {
      const v = new T.Vector3();
      p.mesh.getWorldPosition(v);
      v.project(cam);
      return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
    });
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

  /* ============================================================
     STAGE 2 RUNTIME — radio, threat rings, air units, JSA boss
     ============================================================ */

  let radioEl = null;
  let radioHideAt = 0;
  let radioDur = 4600;
  let introT = 0;
  let introT0 = 0;
  let introLineI = 0;
  let landCovers = [];
  let walkBlockers = [];

  /* one `!` marker: the ring drains as the aim closes and the colour walks
     green -> orange -> red, the same for a man, a canopy or a helicopter */
  function placeTag(p, ctx, prog, on) {
    const d = p.e && p.e._tag;
    if (!d) return;
    if (!on) { if (d.style.display !== "none") d.style.display = "none"; return; }
    const x = p.mesh ? p.mesh.position.x : p.x;
    const z = p.mesh ? p.mesh.position.z : p.z;
    const y = (p.visTop !== undefined ? p.visTop : p.y + 1.7) + 0.5;
    tmpV.set(x, y, z);
    tmpV.project(ctx.camera);
    if (tmpV.z > 1) { d.style.display = "none"; return; }
    d.style.display = "";
    d.style.left = (tmpV.x * 0.5 + 0.5) * innerWidth + "px";
    d.style.top = (-tmpV.y * 0.5 + 0.5) * innerHeight + "px";
    const pr = Math.max(0, Math.min(1, prog || 0));
    d.style.setProperty("--rtp", (pr * 100).toFixed(1));
    const col = pr < 0.45 ? "#3ee06a" : pr < 0.78 ? "#ffb02e" : "#ff2a1a";
    d.style.setProperty("--rtc", col);
    const urgent = pr >= 0.78;
    if (urgent !== p.e._tagUrgent) { p.e._tagUrgent = urgent; d.classList.toggle("urgent", urgent); }
    p.e._tagCol = col;
  }

  function radioNode() {
    if (radioEl) return radioEl;
    radioEl = document.createElement("div");
    radioEl.id = "railRadio";
    radioEl.innerHTML = "<p class='rdTop'><i></i>무전 · COMMAND</p><p class='rdLine'></p><div class='rdBar'><b></b></div>";
    document.body.appendChild(radioEl);
    return radioEl;
  }

  function radio(text, ms) {
    if (!text) return;
    const el = radioNode();
    const line = el.querySelector(".rdLine");
    if (line) line.textContent = text;
    radioEl.classList.add("show");
    radioDur = ms || 4600;
    radioHideAt = performance.now() + radioDur;
    window.__radio = { text: text, at: Math.round(performance.now()), dur: radioDur };
    window.__radioCount = (window.__radioCount || 0) + 1;
  }

  function radioTick(now) {
    if (!radioEl || !radioHideAt) return;
    const left = radioHideAt - now;
    const bar = radioEl.querySelector(".rdBar b");
    if (bar) bar.style.width = Math.max(0, Math.min(100, (left / radioDur) * 100)) + "%";
    if (left <= 0) { radioEl.classList.remove("show"); radioHideAt = 0; }
  }

  /* ---------------- walking on the ground ---------------- */

  /* (v26) what a vehicle may not drive through: every cover, the concrete
     landing barriers and the solid props of the stage. Rebuilt per wave. */
  let vehB = null, vehBKey = null;
  function vehBlockers() {
    const key = wave || 1;
    if (vehB && vehBKey === key) return vehB;
    vehB = [];
    vehBKey = key;
    walkBlockers.forEach((b) => { if (b.max.y > 0.55) vehB.push(b); });
    if (coverRoot) {
      coverRoot.updateMatrixWorld(true);
      coverRoot.traverse((o) => { if (o.userData && o.userData.cover && o.visible && o.parent) { const b = new T.Box3().setFromObject(o); if (!b.isEmpty() && b.max.y > 0.5) vehB.push(b); } });
    }
    landCovers.forEach((c) => { if (c.g && c.g.parent) vehB.push(new T.Box3().setFromObject(c.g)); });
    return vehB;
  }
  function vehHit(x, z, r) {
    const L = vehBlockers();
    for (let i = 0; i < L.length; i++) {
      const b = L[i];
      if (x > b.min.x - r && x < b.max.x + r && z > b.min.z - r && z < b.max.z + r) return b;
    }
    return null;
  }
  /* is the line a→b free for a vehicle of half-width r? The last `skip`
     metres (his own cover at the end) do not count. */
  function segClear(ax, az, bx, bz, r, skip) {
    const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz);
    const n = Math.max(2, Math.ceil(len / 0.35));
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      if ((1 - k) * len < (skip || 0)) break;
      if (vehHit(ax + dx * k, az + dz * k, r)) return false;
    }
    return true;
  }
  /* a bike's run-in: keep his distance, swing the start around his spot
     until the line in is free of every barrier */
  function clearRunFrom(from, dest, r) {
    if (segClear(from[0], from[1], dest[0], dest[1], r, 1.9)) return from;
    const dx = from[0] - dest[0], dz = from[1] - dest[1];
    const d0 = Math.hypot(dx, dz) || 1, a0 = Math.atan2(dx, dz);
    for (const ds of [1, 0.8, 1.2, 0.6]) {
      for (let s = 1; s <= 10; s++) {
        for (const sg of [1, -1]) {
          const a = a0 + sg * s * 0.16, d = d0 * ds;
          const fx = dest[0] + Math.sin(a) * d, fz = dest[1] + Math.cos(a) * d;
          if (vehHit(fx, fz, r + 0.3)) continue;
          if (segClear(fx, fz, dest[0], dest[1], r, 1.9)) return [fx, fz];
        }
      }
    }
    return from;
  }
  /* a truck's route: a blocked leg gets a detour point beside the barrier */
  function clearPath(path, r) {
    const out = [path[0]];
    for (let i = 1; i < path.length; i++) {
      const a = out[out.length - 1], b = path[i];
      const last = i === path.length - 1;
      if (segClear(a[0], a[1], b[0], b[1], r, last ? 2.2 : 0)) { out.push(b); continue; }
      const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz) || 1;
      const nx = dz / len, nz = -dx / len, mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
      let done = false;
      for (let o = 1.2; o <= 7 && !done; o += 0.8) {
        for (const sg of [1, -1]) {
          const w = [mx + nx * o * sg, mz + nz * o * sg];
          if (segClear(a[0], a[1], w[0], w[1], r, 0) && segClear(w[0], w[1], b[0], b[1], r, last ? 2.2 : 0)) { out.push(w, b); done = true; break; }
        }
      }
      if (!done) out.push(b);
    }
    return out;
  }

  function canWalk(x, z) {
    for (let i = 0; i < walkBlockers.length; i++) {
      const b = walkBlockers[i];
      if (b.max.y < 0.75) continue;
      if (x > b.min.x - 0.42 && x < b.max.x + 0.42 && z > b.min.z - 0.42 && z < b.max.z + 0.42) return false;
    }
    return true;
  }

  function walkMove(p, dt) {
    const t = p.moveTo;
    if (!t) { p.moving = false; return true; }
    const dx = t.x - p.x, dz = t.z - p.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.3) { p.moveTo = null; p.moving = false; return true; }
    const sp = t.sp || p.spd || 3.2;
    const step = Math.min(d, sp * dt);
    let nx = p.x + (dx / d) * step, nz = p.z + (dz / d) * step;
    if (!canWalk(nx, nz)) {
      if (canWalk(nx, p.z)) nz = p.z;
      else if (canWalk(p.x, nz)) nx = p.x;
      else { nx = p.x; nz = p.z; }
    }
    const moved = Math.hypot(nx - p.x, nz - p.z);
    p.x = nx;
    p.z = nz;
    p.walk = (p.walk || 0) + moved * 2.8;
    p.moving = moved > 0.0004;
    if (moved < sp * dt * 0.3) p.blockT = (p.blockT || 0) + dt; else p.blockT = 0;
    if (p.blockT > 1.4) { p.moveTo = null; p.blockT = 0; }
    return false;
  }

  function walkPose(p, dt) {
    const u = p.mesh && p.mesh.userData;
    if (!u) return;
    const ph = p.walk || 0;
    const sw = Math.sin(ph) * 0.5;
    if (u.legL) u.legL.rotation.x = sw + 0.1;
    if (u.legR) u.legR.rotation.x = -sw + 0.1;
    if (u.shinL) u.shinL.rotation.x = Math.max(0, -Math.sin(ph - 0.6)) * 0.95;
    if (u.shinR) u.shinR.rotation.x = Math.max(0, -Math.sin(ph + Math.PI - 0.6)) * 0.95;
    if (p.body) {
      p.body.position.y = Math.abs(Math.sin(ph)) * 0.045;
      p.body.rotation.x = 0.06;
    }
    if (u.kN) {
      kApply(u, "walk", ph / (Math.PI * 2), K_LEGS, 1);
      kApply(u, "holding-both", 0, K_ARMS, 1);
      kRifle(p, 0.45, 0.1);
    }
  }

  /* an assault trooper: waypoint to waypoint over open ground, stopping to
     put a two-round burst at the player before he moves again */
  function stepRunner(p, ctx, dt) {
    const cam = ctx.camera.position;
    if (p.moveTo) {
      const arrived = walkMove(p, dt);
      if (arrived) { p.wait = 1.1 + Math.random() * 0.9; p.aim = p.aimMax * 0.75; p.burstN = 0; }
    } else {
      p.wait -= dt;
      p.aim -= dt * seenK(p);
      if (p.burstN > 0) {
        p.shotT -= dt;
        if (p.shotT <= 0) {
          enemyFire(ctx, p, p.burstN === 2 ? 12 : 0);
          p.burstN--;
          p.shotT = 0.16;
        }
      } else if (p.aim <= 0) {
        p.burstMax = 2;
        p.burstN = 2;
        p.shotT = 0.02;
        p.aim = p.aimMax + 0.5;
      }
      if (p.wait <= 0 && p.burstN === 0) {
        p.runner.i = (p.runner.i + 1) % p.runner.route.length;
        const rt = p.runner.route[p.runner.i];
        p.moveTo = { x: rt.x, z: rt.z, sp: p.spd };
      }
    }
    p.expose = 1;
    p.state = p.moveTo ? "run" : "fire";
    p.breath += dt * 1.7;
    posePost(p, cam, dt);
    if (p.moveTo) walkPose(p, dt);
    const prog = p.moveTo ? 0 : Math.max(0, Math.min(1, 1 - p.aim / Math.max(0.001, p.aimMax)));
    placeTag(p, ctx, prog, !p.moveTo);
  }

  /* ---------------- materials for the DMZ / JSA set ---------------- */

  function bumpNoise(key, size, seed, amp) {
    return ctex(key, size, size, (g, w, h) => {
      const R = rng(seed);
      g.fillStyle = "#7f7f7f";
      g.fillRect(0, 0, w, h);
      const n = Math.round((w * h) / 46);
      for (let i = 0; i < n; i++) {
        const v = Math.max(0, Math.min(255, Math.round(128 + (R() - 0.5) * 210 * (amp || 0.6))));
        g.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
        const s = 1 + R() * 3;
        g.fillRect(R() * w, R() * h, s, s);
      }
    });
  }

  function surf(tex, rx, ry, o) {
    const opt = o || {};
    const t = tex.clone();
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = Math.max(1, Math.min(8, MAXANISO));
    t.needsUpdate = true;
    const m = new T.MeshPhongMaterial({ map: t, shininess: opt.shine == null ? 4 : opt.shine, specular: new T.Color(opt.spec == null ? 0x191914 : opt.spec) });
    if (opt.bump) {
      const bt = opt.bump.clone();
      bt.wrapS = bt.wrapT = T.RepeatWrapping;
      bt.repeat.set(rx || 1, ry || 1);
      bt.anisotropy = Math.max(1, Math.min(8, MAXANISO));
      bt.needsUpdate = true;
      m.bumpMap = bt;
      m.bumpScale = opt.bumpScale == null ? 0.1 : opt.bumpScale;
    }
    if (opt.color != null) m.color.setHex(opt.color);
    if (m.color.convertSRGBToLinear) m.color.convertSRGBToLinear();
    return m;
  }

  function soilTex() {
    return ctex("soil2", 512, 512, (g, w, h) => {
      const R = rng(57);
      g.fillStyle = "#8b7550";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4200; i++) {
        const r = R();
        const c = r < 0.4 ? "#7a6544" : r < 0.7 ? "#9c8760" : r < 0.92 ? "#6e5b3d" : "#b6a179";
        g.fillStyle = c;
        const s = 2 + R() * 7;
        g.fillRect(R() * w, R() * h, s, s * (0.5 + R()));
      }
      /* two worn wheel ruts, lighter and packed */
      [0.3, 0.7].forEach((u) => {
        g.fillStyle = "rgba(196,180,146,.42)";
        g.fillRect(u * w - 26, 0, 52, h);
        g.fillStyle = "rgba(120,102,74,.35)";
        g.fillRect(u * w - 34, 0, 9, h);
        g.fillRect(u * w + 25, 0, 9, h);
      });
      for (let i = 0; i < 320; i++) {
        const x = R() * w, y = R() * h, s = 1 + R() * 3;
        g.fillStyle = R() < 0.5 ? "#5f5038" : "#c8bfa8";
        g.fillRect(x, y, s, s);
      }
    });
  }

  function bluePanelTex() {
    return ctex("bluePanel", 256, 256, (g, w, h) => {
      const R = rng(83);
      g.fillStyle = "#3d93c4";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) {
        g.fillStyle = y % 64 ? "#3f97c9" : "#3a8dbd";
        g.fillRect(0, y, w, 30);
        g.fillStyle = "rgba(18,52,72,.55)";
        g.fillRect(0, y + 30, w, 2);
        g.fillStyle = "rgba(255,255,255,.13)";
        g.fillRect(0, y + 1, w, 2);
        for (let x = 6; x < w; x += 16) {
          g.fillStyle = "rgba(20,58,78,.45)";
          g.fillRect(x, y + 4, 2, 2);
        }
      }
      for (let i = 0; i < 900; i++) {
        g.fillStyle = "rgba(255,255,255," + (0.02 + R() * 0.05) + ")";
        g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2);
      }
      for (let i = 0; i < 26; i++) {
        g.fillStyle = "rgba(30,52,60," + (0.05 + R() * 0.08) + ")";
        g.fillRect(R() * w, R() * h * 0.7, 6 + R() * 30, 3 + R() * 10);
      }
    });
  }

  function dancheongTex() {
    /* the painted eave band (단청): green ground, red and blue merlons */
    return ctex("dancheong", 256, 64, (g, w, h) => {
      g.fillStyle = "#1f5b45";
      g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 32) {
        g.fillStyle = "#b8402f";
        g.fillRect(x + 4, 8, 16, h - 16);
        g.fillStyle = "#e0c86a";
        g.fillRect(x + 8, 14, 8, h - 28);
        g.fillStyle = "#2a6f9c";
        g.fillRect(x + 22, 12, 6, h - 24);
      }
      g.fillStyle = "#e8e2cf";
      g.fillRect(0, 0, w, 4);
      g.fillRect(0, h - 4, w, 4);
    });
  }

  function stage2Mats() {
    if (SOL.s2) return;
    SOL.s2 = 1;
    const ph = (o) => { const m = new T.MeshPhongMaterial(o); if (m.color && m.color.convertSRGBToLinear) m.color.convertSRGBToLinear(); return m; };
    SOL.glassP = ph({ color: 0x1b2c37, shininess: 130, specular: new T.Color(0x9dc4d8), emissive: new T.Color(0x0a1418) });
    SOL.lightP = new T.MeshPhongMaterial({ color: 0xfff3c4, emissive: new T.Color(0xffe9a0), emissiveIntensity: 0.9 });
    SOL.blueP = surf(bluePanelTex(), 1, 1, { shine: 26, spec: 0x33454e, bump: bumpNoise("bpBump", 128, 87, 0.5), bumpScale: 0.06 });
    SOL.whiteP = ph({ color: 0xe8e6dc, shininess: 30, specular: new T.Color(0x555048) });
    SOL.stoneP = surf(blockTex("stone2", "#c3bcac", "#5e584c", ["#ddd6c5", "#aca492", "#948c7c"], 15), 2, 2, { shine: 6, spec: 0x22221e, bump: bumpNoise("stBump", 128, 17, 0.7), bumpScale: 0.14 });
    SOL.steelP = ph({ color: 0x8b939c, shininess: 70, specular: new T.Color(0xcfd6dc), bumpMap: bumpNoise("mtBump", 128, 23, 0.5), bumpScale: 0.03 });
    SOL.camoP = ph({ color: 0x4a5730, shininess: 8, specular: new T.Color(0x24261c), map: ctex("helipaint", 128, 128, (g, w, h) => {
      const R = rng(93);
      g.fillStyle = "#4a5730";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) {
        g.fillStyle = i % 3 ? "#3b4626" : "#59683a";
        g.fillRect(R() * w, R() * h, 10 + R() * 22, 8 + R() * 16);
      }
    }) });
    SOL.sandP = ph({ color: 0xcfc19c, shininess: 2, specular: new T.Color(0x1b1810), map: SOL.sand && SOL.sand.map ? SOL.sand.map : null, bumpMap: bumpNoise("sbBump", 128, 29, 0.8), bumpScale: 0.16 });
  }

  /* ---------------- small set pieces ---------------- */

  function boardTex(key, o) {
    return ctex(key, 320, 200, (g, w, h) => {
      g.fillStyle = o.bg || "#6f5735";
      g.fillRect(0, 0, w, h);
      const R = rng(o.seed || 11);
      for (let y = 0; y < h; y += 40) {
        g.fillStyle = y % 80 ? "rgba(0,0,0,.10)" : "rgba(255,255,255,.05)";
        g.fillRect(0, y, w, 2);
      }
      for (let i = 0; i < 260; i++) {
        g.fillStyle = "rgba(60,42,22," + (0.04 + R() * 0.08) + ")";
        g.fillRect(R() * w, R() * h, 2 + R() * 16, 1 + R() * 3);
      }
      g.strokeStyle = o.edge || "#3b2c19";
      g.lineWidth = 12;
      g.strokeRect(6, 6, w - 12, h - 12);
      g.textAlign = "center";
      g.textBaseline = "middle";
      (o.lines || []).forEach((l) => {
        g.fillStyle = l.c || "#f4efe2";
        g.font = (l.b ? "900 " : "700 ") + (l.s || 44) + "px 'Arial Narrow', Arial, 'Malgun Gothic', sans-serif";
        g.fillText(l.t, w / 2, h * l.y);
      });
    });
  }

  function makeSign(x, z, rot, tex, bw, bh, y0, postH) {
    makeSol();
    const g = new T.Group();
    const y = y0 === undefined ? 0.3 : y0;
    const ph = postH || 2.0;
    part(g, 0.16, ph, 0.16, -bw / 2 + 0.14, ph / 2, 0, SOL.woodDark);
    part(g, 0.16, ph, 0.16, bw / 2 - 0.14, ph / 2, 0, SOL.woodDark);
    /* the painted face goes on both sides of the board: the rail approaches
       from the south, and a sign turned away is only a wooden slab */
    const face = new T.MeshPhongMaterial({ map: tex, shininess: 6, specular: 0x22201a });
    const board = new T.Mesh(new T.BoxGeometry(bw, bh, 0.14), [SOL.woodDark, SOL.woodDark, SOL.woodDark, SOL.woodDark, face, face]);
    board.position.set(0, ph - bh / 2 + 0.06, 0);
    board.castShadow = true;
    board.receiveShadow = true;
    g.add(board);
    g.position.set(x, y, z);
    g.rotation.y = rot || 0;
    g.userData.solid = 1;
    g.userData.wall = 1;
    return g;
  }

  function chainTex() {
    return ctex("chainlink", 128, 128, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.strokeStyle = "rgba(196,200,198,.95)";
      g.lineWidth = 3;
      const s = 16;
      for (let i = -h; i < w + h; i += s) {
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + h, h);
        g.stroke();
        g.beginPath();
        g.moveTo(i, h);
        g.lineTo(i + h, 0);
        g.stroke();
      }
      g.strokeStyle = "rgba(120,128,126,.65)";
      g.lineWidth = 1;
      for (let i = -h; i < w + h; i += s) {
        g.beginPath();
        g.moveTo(i + 2, 0);
        g.lineTo(i + h + 2, h);
        g.stroke();
      }
    });
  }

  function makeFence(x, z0, z1, h) {
    makeSol();
    stage2Mats();
    const g = new T.Group();
    const H = h || 2.0;
    const step = 2.8;
    for (let z = z0; z <= z1 + 0.01; z += step) {
      part(g, 0.15, H, 0.15, 0, H / 2, z, SOL.woodDark);
      part(g, 0.26, 0.1, 0.26, 0, H, z, SOL.stoneDark);
    }
    [-0.12, -0.52, -0.92, -1.32].forEach((dy) => {
      const strand = part(g, 0.045, 0.045, z1 - z0, 0, H + dy, (z0 + z1) / 2, SOL.steel);
      strand.castShadow = false;
    });
    /* the woven mesh itself, one alpha-tested plane per run */
    if (!SOL.chain) {
      SOL.chain = new T.MeshPhongMaterial({ map: chainTex(), transparent: true, alphaTest: 0.32, side: T.DoubleSide, shininess: 22, specular: new T.Color(0x8b949a) });
    }
    const net = new T.Mesh(new T.PlaneGeometry(z1 - z0, H * 0.94), SOL.chain);
    net.rotation.y = Math.PI / 2;
    net.position.set(0, H * 0.48, (z0 + z1) / 2);
    const nm = SOL.chain.map.clone();
    nm.wrapS = nm.wrapT = T.RepeatWrapping;
    nm.repeat.set(Math.max(1, (z1 - z0) / 1.6), 1.4);
    nm.needsUpdate = true;
    net.material = SOL.chain.clone();
    net.material.map = nm;
    g.add(net);
    /* three strands of concertina laid along the top */
    for (let z = z0 + 0.8; z < z1; z += 2.1) {
      const a = part(g, 0.95, 0.07, 0.07, 0, H - 0.18, z, SOL.steel);
      a.rotation.y = 0.62;
      const b = part(g, 0.95, 0.07, 0.07, 0, H - 0.18, z, SOL.steel);
      b.rotation.y = -0.62;
      const c = part(g, 0.7, 0.06, 0.06, 0, H - 1.05, z + 0.35, SOL.steel);
      c.rotation.y = 0.9;
      c.rotation.z = 0.42;
    }
    g.position.set(x, 0.3, 0);
    g.userData.solid = 1;
    return g;
  }

  function makeTeeth(x, z, n, along) {
    makeSol();
    const g = new T.Group();
    for (let i = 0; i < n; i++) {
      const px = along ? x + i * 1.5 : x;
      const pz = along ? z : z + i * 1.5;
      part(g, 0.92, 0.5, 0.92, px, 0.25, pz, SOL.concrete);
      const mid = part(g, 0.66, 0.5, 0.66, px, 0.7, pz, SOL.concrete);
      mid.rotation.y = Math.PI / 4;
      const tip = part(g, 0.34, 0.36, 0.34, px, 1.06, pz, SOL.stoneDark);
      tip.rotation.y = Math.PI / 4;
    }
    g.userData.solid = 1;
    return g;
  }

  function makeGP(x, z, h) {
    makeSol();
    const g = new T.Group();
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      part(g, 0.18, h, 0.18, (sx * 1.0), h / 2, (sz * 1.0), SOL.woodDark);
      const br = part(g, 0.1, 1.6, 0.1, sx * 1.0, h * 0.45, sz * 1.0);
      br.rotation.x = sx * sz * 0.35;
    });
    part(g, 2.7, 0.2, 2.7, 0, h, 0, SOL.wood);
    part(g, 2.1, 1.55, 2.1, 0, h + 0.95, 0, SOL.camoDark);
    part(g, 2.32, 0.16, 2.32, 0, h + 1.8, 0, SOL.oliveDark);
    const win = new T.MeshPhongMaterial({ color: 0x101c22, shininess: 90, specular: new T.Color(0x6f97ad) });
    part(g, 1.65, 0.52, 0.1, 0, h + 1.05, 1.06, win);
    part(g, 1.65, 0.52, 0.1, 0, h + 1.05, -1.06, win);
    part(g, 0.1, 0.52, 1.65, 1.06, h + 1.05, 0, win);
    part(g, 0.1, 0.9, 1.3, -1.06, h + 0.55, 0, SOL.black);
    part(g, 0.1, 0.5, 0.1, 0.95, h + 2.1, 0, SOL.black);
    const lamp = part(g, 0.36, 0.3, 0.32, 0.95, h + 2.35, 0.22, SOL.steelP);
    lamp.rotation.x = -0.45;
    part(g, 0.26, 0.24, 0.06, 0.95, h + 2.32, 0.4, SOL.lightP);
    const sb = makeSandbags(0, 1.7, 3.0, 2);
    g.add(sb);
    g.position.set(x, 0.3, z);
    g.userData.solid = 1;
    g.userData.wall = 1;
    return g;
  }

  function makeJeep(x, z, rot) {
    makeSol();
    stage2Mats();
    const g = new T.Group();
    part(g, 2.95, 0.52, 1.55, 0, 0.72, 0, SOL.oliveDark);
    part(g, 1.15, 0.4, 1.42, 0, 1.12, 0.62, SOL.olive);
    part(g, 1.9, 0.14, 1.42, 0, 1.02, -0.32, SOL.oliveDark);
    part(g, 0.1, 0.34, 1.4, 0, 1.32, 0.16, SOL.glassP);
    part(g, 0.08, 0.5, 1.44, 0, 1.28, -0.02, SOL.oliveDark);
    /* seats, dash, roll bar, spare wheel, lights */
    part(g, 0.55, 0.14, 0.6, -0.28, 0.98, 0.24, SOL.black);
    part(g, 0.55, 0.14, 0.6, 0.42, 0.98, 0.24, SOL.black);
    part(g, 1.1, 0.28, 0.3, 0, 1.02, 0.5, SOL.black);
    [-0.14, 0.14].forEach((sx) => part(g, 0.07, 0.62, 0.07, sx, 1.3, -0.55, SOL.steel));
    part(g, 0.3, 0.05, 0.05, 0, 1.58, -0.55, SOL.steel);
    const spare = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.2, 10), SOL.tire);
    spare.rotation.x = Math.PI / 2;
    spare.position.set(0, 0.95, -0.86);
    g.add(spare);
    [-0.62, 0.62].forEach((sx) => {
      part(g, 0.16, 0.16, 0.06, sx, 1.02, 0.79, SOL.lightP);
      part(g, 0.14, 0.12, 0.06, sx * 0.9, 0.86, -0.79, SOL.red);
    });
    part(g, 0.36, 0.6, 1.58, 0, 0.5, 0, SOL.oliveDark);
    [-1.0, 0.95].forEach((wx) => {
      [-0.78, 0.78].forEach((wz) => {
        const w = new T.Mesh(new T.CylinderGeometry(0.38, 0.38, 0.26, 12), SOL.tire);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 0.66, wz);
        w.castShadow = true;
        g.add(w);
        const hub = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.28, 8), SOL.steelP);
        hub.rotation.x = Math.PI / 2;
        hub.position.set(wx, 0.66, wz);
        g.add(hub);
      });
    });
    /* the door star, like the truck in stage 1 */
    const star = new T.Mesh(new T.PlaneGeometry(0.4, 0.4), SOL.star);
    star.position.set(0.62, 0.9, 0.79);
    g.add(star);
    g.position.set(x, 0.3, z);
    g.rotation.y = rot || 0;
    g.userData.solid = 1;
    return g;
  }

  function makeBlueHall(x, z, bw, bd, bh, rot) {
    makeSol();
    stage2Mats();
    const g = new T.Group();
    const wall = new T.Mesh(new T.BoxGeometry(bw, bh, bd), surf(bluePanelTex(), Math.max(1, Math.round(bw / 2.4)), Math.max(1, Math.round(bh / 2.4)), { shine: 30, spec: 0x3a4c58, bump: bumpNoise("bpBump", 128, 87, 0.5), bumpScale: 0.05 }));
    wall.position.y = bh / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.wall = 1;
    g.add(wall);
    /* white fascia, two stepped caps and a shallow gable */
    part(g, bw + 0.4, 0.22, bd + 0.4, 0, bh + 0.1, 0, SOL.whiteP);
    part(g, 0.22, 0.22, bd + 0.5, 0, bh + 0.3, 0, SOL.whiteP);
    part(g, 0.22, 0.22, bd + 0.5, 0, bh + 0.3, 0, SOL.whiteP);
    part(g, bw + 0.34, 0.18, 0.2, 0, bh + 0.3, bd / 2 + 0.1, SOL.whiteP);
    part(g, bw + 0.34, 0.18, 0.2, 0, bh + 0.3, -bd / 2 - 0.1, SOL.whiteP);
    /* glazing band, door and a small step */
    const nw = Math.max(2, Math.round(bw / 1.4));
    for (let i = 0; i < nw; i++) {
      const px = -bw / 2 + (bw / nw) * (i + 0.5);
      part(g, bw / nw - 0.28, 0.72, 0.07, px, bh * 0.62, bd / 2 + 0.02, SOL.glassP);
      part(g, bw / nw - 0.28, 0.06, 0.09, px, bh * 0.62 - 0.4, bd / 2 + 0.03, SOL.whiteP);
    }
    part(g, 0.9, 1.5, 0.1, 0, 0.75, bd / 2 + 0.03, SOL.whiteP);
    part(g, 0.74, 1.34, 0.12, 0, 0.72, bd / 2 + 0.06, SOL.glassP);
    part(g, bw * 0.7, 0.12, 0.5, 0, 0.34, bd / 2 + 0.28, SOL.concrete);
    part(g, bw * 0.5, 0.12, 0.4, 0, 0.22, bd / 2 + 0.55, SOL.concrete);
    /* roof detail: a vent and a small antenna */
    part(g, 0.6, 0.32, 0.6, bw * 0.24, bh + 0.4, -bd * 0.2, SOL.steelP);
    part(g, 0.06, 1.1, 0.06, -bw * 0.3, bh + 0.75, -bd * 0.25, SOL.black);
    g.position.set(x, 0.3, z);
    g.rotation.y = rot || 0;
    g.userData.solid = 1;
    g.userData.wall = 1;
    return g;
  }

  function makePanmungak(x, z) {
    makeSol();
    stage2Mats();
    const g = new T.Group();
    const W = 16, D = 9, H = 8.4;
    const body = part(g, W, H, D, 0, H / 2, 0, SOL.stoneP);
    body.userData.wall = 1;
    body.castShadow = true;
    /* three floors of window bands with columns between them */
    for (let fl = 0; fl < 3; fl++) {
      const y = 1.5 + fl * 2.4;
      part(g, W + 0.2, 0.22, D + 0.2, 0, y + 1.05, 0, SOL.stoneDark);
      for (let i = 0; i < 9; i++) {
        const px = -W / 2 + 1.0 + i * 1.75;
        part(g, 0.95, 1.25, 0.1, px, y + 0.5, D / 2 + 0.04, SOL.glassP);
        part(g, 0.16, 1.55, 0.22, px - 1.0, y + 0.55, D / 2 + 0.06, SOL.stoneDark);
      }
    }
    /* the central raised block and the grand stair */
    const mid = part(g, 6.4, H + 2.6, 2.2, 0, (H + 2.6) / 2, D / 2 - 0.6, SOL.stoneP);
    mid.userData.wall = 1;
    for (let i = 0; i < 6; i++) part(g, 0.85, 1.15, 0.1, -2.4 + i * 0.96, H + 1.1, D / 2 + 0.52, SOL.glassP);
    for (let i = 0; i < 5; i++) part(g, 7.6 - i * 0.9, 0.26, 0.7, 0, 0.12 + i * 0.26, D / 2 + 1.0 + i * 0.55, SOL.concrete);
    /* painted eaves over the central block */
    const eave = new T.Mesh(new T.BoxGeometry(7.2, 0.42, 2.8), new T.MeshPhongMaterial({ map: dancheongTex(), shininess: 12, specular: 0x2a2a22 }));
    eave.position.set(0, H + 2.5, D / 2 - 0.5);
    eave.castShadow = true;
    g.add(eave);
    const roof = part(g, 7.8, 0.3, 3.2, 0, H + 2.75, D / 2 - 0.5, SOL.stoneDark);
    roof.rotation.x = 0.02;
    /* flag mast on the roof */
    part(g, 0.1, 3.2, 0.1, 4.6, H + 1.5, 0, SOL.steelP);
    g.position.set(x, 0.3, z);
    g.userData.solid = 1;
    g.userData.wall = 1;
    return g;
  }

  function makeFreedomHouse(x, z, rot) {
    makeSol();
    stage2Mats();
    const g = new T.Group();
    const W = 9.2, D = 7, H = 6.6;
    const body = part(g, W, H, D, 0, H / 2, 0, SOL.whiteP);
    body.userData.wall = 1;
    body.castShadow = true;
    /* a columned pavilion front */
    for (let i = 0; i < 5; i++) {
      const px = -W / 2 + 1.0 + i * 1.8;
      part(g, 0.42, H * 0.72, 0.42, px, H * 0.36, D / 2 + 0.9, SOL.whiteP);
    }
    part(g, W * 0.92, 0.5, 1.4, 0, H * 0.76, D / 2 + 0.7, SOL.whiteP);
    part(g, W * 0.96, 0.3, 1.6, 0, H * 0.84, D / 2 + 0.7, SOL.stoneDark);
    for (let i = 0; i < 4; i++) {
      const px = -W / 2 + 1.6 + i * 2.0;
      part(g, 1.1, 1.7, 0.12, px, 1.5, D / 2 + 0.04, SOL.glassP);
    }
    part(g, W * 0.8, 0.16, 1.9, 0, 0.16, D / 2 + 1.0, SOL.concrete);
    g.position.set(x, 0.3, z);
    g.rotation.y = rot || 0;
    g.userData.solid = 1;
    g.userData.wall = 1;
    return g;
  }

  function makeRidge(x, z, w, h, d, col, col2) {
    const g = new T.Group();
    const m = new T.MeshPhongMaterial({ color: col, shininess: 1, specular: new T.Color(0x151a16) });
    m.color.convertSRGBToLinear();
    const m2 = new T.MeshPhongMaterial({ color: col2 || col, shininess: 1, specular: new T.Color(0x151a16) });
    m2.color.convertSRGBToLinear();
    part(g, w, h, d, 0, h / 2, 0, m);
    part(g, w * 0.62, h * 0.55, d * 0.8, w * 0.18, h + h * 0.27, 0, m2);
    part(g, w * 0.4, h * 0.4, d * 0.7, -w * 0.22, h + h * 0.2, -d * 0.1, m2);
    /* a treeline of dark boxes along the crest */
    const R = rng(Math.round(w + h));
    for (let i = 0; i < 16; i++) {
      const s = 2 + R() * 4;
      part(g, s, s * 0.8, s, (R() - 0.5) * w * 0.8, h * 0.9 + R() * h * 0.2, (R() - 0.5) * d * 0.5, m2);
    }
    g.position.set(x, 0, z);
    return g;
  }

  function flagUN() {
    return ctex("flagUN", 384, 256, (g, w, h) => {
      g.fillStyle = "#4b92d2";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(255,255,255,.85)";
      g.lineWidth = 5;
      g.strokeRect(7, 7, w - 14, h - 14);
      const cx = w / 2, cy = h / 2, r = 66;
      g.strokeStyle = "#fff";
      g.lineWidth = 7;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
      g.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        const rr = r * (0.28 + i * 0.19);
        g.beginPath();
        g.ellipse(cx, cy, r, rr, 0, 0, Math.PI * 2);
        g.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        g.stroke();
      }
      g.fillStyle = "#e9f2f8";
      g.beginPath();
      g.arc(cx, cy, 8, 0, Math.PI * 2);
      g.fill();
    });
  }

  function makeFlagEx(kind, x, y, z, w, h) {
    makeSol();
    if (!SOL.flagUN) SOL.flagUN = new T.MeshPhongMaterial({ map: flagUN(), side: T.DoubleSide, shininess: 4 });
    const g = new T.Group();
    const poleH = (h || 1.5) + 0.6;
    const pole = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, poleH, 8), SOL.steelP || SOL.woodDark);
    pole.position.set(-w / 2 - 0.06, poleH / 2 - 0.5, 0);
    pole.castShadow = true;
    g.add(pole);
    const mat = kind === "un" ? SOL.flagUN : kind === "kp" ? SOL.flagKP : SOL.flagKR;
    const cloth = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    g.add(cloth);
    g.position.set(x, y, z);
    g.userData.cloth = cloth;
    g.userData.ph = Math.random() * 6;
    return g;
  }

  function landCover(x, z, w) {
    makeSol();
    const g = makeSandbags(0, 0, w || 2.2, 3);
    g.position.set(x, 0.3, z);
    g.rotation.y = (Math.random() - 0.5) * 0.5;
    g.userData.cover = 1;
    g.userData.solid = 1;
    const bb = new T.Box3().setFromObject(g);
    return { g, cx: (bb.min.x + bb.max.x) / 2, cz: (bb.min.z + bb.max.z) / 2, topY: bb.max.y, used: false };
  }

  /* ---------------- the DMZ -> JSA set ---------------- */

  function dressStage2(ctx) {
    makeSol();
    stage2Mats();
    const S = new T.Group();
    S.name = "battlefield2";
    ctx.scene.add(S);

    const sky = makeSkyDome();
    sky.geometry.dispose();
    sky.geometry = new T.SphereGeometry(180, 24, 16);
    sky.position.set(0, 0, 30);
    S.add(sky);
    ctx.scene.background = new T.Color(0x9dbfd6).convertSRGBToLinear();
    ctx.scene.fog = new T.Fog(0xc3d4dc, 80, 230);
    if (ctx.scene.fog.color && ctx.scene.fog.color.convertSRGBToLinear) ctx.scene.fog.color.convertSRGBToLinear();
    if (ctx.LT) {
      const LT = ctx.LT;
      if (LT.hemi) { LT.hemi.intensity = 0.58; LT.hemi.color.setHex(0xd7e8f6); LT.hemi.groundColor && LT.hemi.groundColor.setHex(0x6d6a4c); }
      if (LT.amb) { LT.amb.intensity = 0.26; LT.amb.color && LT.amb.color.setHex(0xb6cbdb); }
      if (LT.key) { LT.key.intensity = 1.02; LT.key.color.setHex(0xfff2d4); }
      if (LT.moon) { LT.moon.intensity = 0.12; }
      if (LT.rim) { LT.rim.intensity = 0.3; LT.rim.color && LT.rim.color.setHex(0xffd0a4); }
    }

    /* ---- ground: dirt everywhere, the tactical road on top ---- */
    /* the open ground is grass now; only the tactical roads stay dirt */
    const gTex = voxMats().grass.map.clone();
    gTex.wrapS = gTex.wrapT = T.RepeatWrapping;
    gTex.repeat.set(110, 110);
    gTex.needsUpdate = true;
    const dirt = new T.MeshStandardMaterial({ map: gTex, color: 0xc4d6a8, roughness: 0.96 });
    const ground = new T.Mesh(new T.PlaneGeometry(300, 300), dirt);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0.24, 34);
    ground.receiveShadow = true;
    S.add(ground);

    const roadMat = surf(soilTex(), 1, 6, { shine: 2, spec: 0x1a160f, bump: bumpNoise("soilB", 256, 61, 0.9), bumpScale: 0.2 });
    const road1 = new T.Mesh(new T.PlaneGeometry(8.6, 86), roadMat);
    roadMat.map && roadMat.map.repeat && roadMat.map.repeat.set(1, 10);
    road1.rotation.x = -Math.PI / 2;
    road1.position.set(0, 0.28, -10);
    road1.receiveShadow = true;
    S.add(road1);
    const road2 = new T.Mesh(new T.PlaneGeometry(9.0, 20), surf(soilTex(), 1, 3, { shine: 2, spec: 0x1a160f, bump: bumpNoise("soilB", 256, 61, 0.9), bumpScale: 0.2 }));
    road2.rotation.x = -Math.PI / 2;
    road2.rotation.z = -0.62;
    road2.position.set(-9.6, 0.281, 32);
    road2.receiveShadow = true;
    S.add(road2);
    /* the JSA concrete apron */
    const conc = surf(concreteTex("conc2", "#b9b7ad", 31), 9, 8, { shine: 10, spec: 0x2a2924, color: 0xd9d5c7, bump: bumpNoise("cnBump", 256, 71, 0.6), bumpScale: 0.1 });
    const plaza = new T.Mesh(new T.PlaneGeometry(46, 42), conc);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(-18, 0.30, 61);
    plaza.receiveShadow = true;
    S.add(plaza);

    /* ---- fences: double barbed line both sides of the road ---- */
    S.add(makeFence(-6.4, -52, 30, 2.05));
    S.add(makeFence(6.4, -52, 30, 2.05));
    S.add(makeFence(-10.8, -52, 34, 1.85));
    S.add(makeFence(10.8, -52, 34, 1.85));
    /* the GOP: a guard post either side of the wire at the new start, and
       mine-field signs down the extended road */
    S.add(makeGP(9.4, -31.0, 6.2));
    S.add(makeGP(-9.6, -18.0, 5.6));

    /* ---- north-bound road signs ---- */
    const dmzTex = boardTex("dmzBoard", {
      bg: "#6f5735", seed: 3,
      lines: [
        { t: "DMZ", s: 62, y: 0.33 },
        { t: "비무장지대", s: 34, y: 0.63 },
        { t: "Demilitarized Zone", s: 20, y: 0.85 }
      ]
    });
    const s1 = makeSign(-4.9, 10.2, 0.12, dmzTex, 3.0, 1.85, 0.3, 2.5);
    S.add(s1);
    const cclTex = boardTex("cclBoard", {
      bg: "#5f5a48", seed: 7,
      lines: [
        { t: "민통선", s: 52, y: 0.34, c: "#f6efd8" },
        { t: "CIVILIAN CONTROL LINE", s: 18, y: 0.64, c: "#e7dfc6" },
        { t: "출입금지", s: 26, y: 0.86, c: "#e8b04a" }
      ]
    });
    S.add(makeSign(5.3, 3.4, -0.16, cclTex, 2.6, 1.5, 0.3, 2.2));
    const mineTex = boardTex("mineBoard", {
      bg: "#c9c3ae", seed: 13, edge: "#8f2a1c",
      lines: [
        { t: "지뢰", s: 58, y: 0.34, c: "#8f2a1c" },
        { t: "MINE", s: 34, y: 0.68, c: "#8f2a1c" }
      ]
    });
    S.add(makeSign(-6.8, 11.2, 0.2, mineTex, 1.5, 1.1, 0.3, 1.5));
    [-44, -33, -24, -15].forEach((z, i) => S.add(makeSign(i % 2 ? 7.6 : -7.6, z, i % 2 ? -0.1 : 0.1, mineTex, 1.1, 0.8, 0.3, 1.2)));

    /* ---- dragon's teeth and bunkers ---- */
    S.add(makeTeeth(-4.9, 16.2, 4, false));
    S.add(makeTeeth(4.9, 16.2, 4, false));
    S.add(makeTeeth(-11.4, 24.0, 3, true));
    S.add(makeGP(8.6, 19.6, 6.6));
    S.add(makeGP(-12.6, 27.4, 5.4));
    S.add(makeSandbags(-5.4, 7.6, 2.6, 3));
    S.add(makeSandbags(5.6, 12.4, 2.2, 3));
    S.add(makeSandbags(-8.4, 18.2, 3.0, 3));
    S.add(makeCrate(8.2, 6.4, 0.85));
    S.add(makeCrate(-8.8, 9.4, 0.7));
    S.add(makeBarrier(7.2, 23.2));
    S.add(makeTruck(9.2, 27.6));
    S.add(makeJeep(-10.6, 14.6, 0.5));
    S.add(makeJeep(5.4, 25.4, -1.2));
    S.add(makeFlagEx("kp", 8.6, 9.4, 19.6, 1.9, 1.3));

    /* the minefield warning posts every few metres along the wire */
    for (let z = -8; z < 28; z += 7.5) {
      S.add(makeSign(-9.9, z, 0.06, mineTex, 1.1, 0.8, 0.3, 1.2));
    }

    /* ---- the checkpoint gate into the JSA ---- */
    part(S, 1.4, 4.2, 1.4, -24.2, 2.4, 43.0, SOL.concrete);
    part(S, 1.4, 4.2, 1.4, -11.4, 2.4, 43.0, SOL.concrete);
    part(S, 13.6, 0.7, 1.0, -17.8, 4.55, 43.0, SOL.concrete);
    const jsaTex = boardTex("jsaBoard", {
      bg: "#243b46", seed: 17, edge: "#d9d3c0",
      lines: [
        { t: "판문점", s: 34, y: 0.34, c: "#f2eeda" },
        { t: "PANMUNJOM  JSA", s: 20, y: 0.62, c: "#cfe0e6" },
        { t: "공동경비구역", s: 20, y: 0.84, c: "#cfe0e6" }
      ]
    });
    const jsaSign = makeSign(-17.8, 43.0, 0, jsaTex, 5.2, 1.5, 3.85, 1.6);
    S.add(jsaSign);

    /* ---- JSA: the MDL line, the blue halls, Panmungak, Freedom House ---- */
    const mdl = part(S, 25.5, 0.24, 0.62, -18, 0.42, 60.0, SOL.concrete);
    mdl.castShadow = false;
    for (let i = 0; i < 25; i++) {
      part(S, 0.5, 0.28, 0.7, -30 + i * 1.0, 0.44, 60.0, i % 2 ? SOL.whiteP : SOL.concrete).castShadow = false;
    }
    S.add(makeBlueHall(-27.4, 68.4, 4.2, 4.8, 2.9, 0));
    S.add(makeBlueHall(-18.2, 68.7, 3.6, 4.4, 2.7, 0.02));
    S.add(makeBlueHall(-8.8, 68.4, 4.2, 4.8, 2.9, -0.02));
    S.add(makePanmungak(-18, 84.5));
    S.add(makeFreedomHouse(-33.0, 53.5, 0.18));
    const krFlag = makeFlagEx("kr", -26.6, 6.2, 50.4, 2.4, 1.6);
    const unFlag = makeFlagEx("un", -9.4, 6.2, 50.4, 2.4, 1.6);
    S.add(krFlag, unFlag);
    /* flag poles */
    part(S, 0.1, 8.4, 0.1, -27.8, 4.2, 50.4, SOL.steelP);
    part(S, 0.1, 8.4, 0.1, -8.2, 4.2, 50.4, SOL.steelP);

    /* plaza furniture: concrete blocks, jeeps, a truck, lamps, a bench row */
    [[-27.6, 57.6], [-9.0, 58.2], [-25.2, 64.4], [-10.8, 65.0]].forEach(([x, z], i) => {
      const b = part(S, 2.0, 0.9, 0.9, x, 0.75, z, SOL.concrete);
      b.userData.wall = 1;
      b.userData.solid = 1;
      b.castShadow = true;
    });
    S.add(makeJeep(-31.0, 65.6, 0.2));
    S.add(makeJeep(-5.2, 65.0, -0.4));
    S.add(makeTruck(-33.6, 66.6));
    S.add(makeTruck(-2.0, 66.8));
    S.add(makeFence(-33.4, 47.0, 61.0, 1.6));
    S.add(makeFence(-2.6, 47.0, 61.0, 1.6));
    for (let i = 0; i < 4; i++) {
      const lx = -31.0 + i * 8.6;
      part(S, 0.16, 4.0, 0.16, lx, 2.0, 60.4, SOL.steelP);
      part(S, 0.5, 0.2, 0.5, lx, 4.0, 60.4, SOL.steelP);
      part(S, 0.34, 0.12, 0.34, lx, 3.9, 60.4, SOL.lightP);
    }
    S.add(makeSandbags(-33.0, 64.0, 3.2, 3));
    S.add(makeCrate(-4.4, 61.2, 0.8));
    S.add(makeBarrier(-34.6, 51.0));

    /* ---- the DMZ has gone back to forest: pines and oaks crowd both
       sides of the wire, rocks and grass between them, forested hills
       behind (voxel kit, a few instanced draw calls) ---- */
    const trunks2 = [];
    {
      const VF = voxBatch();
      const vm = voxMats();
      const RF = rng(2207);
      const pts = [];
      if (curve) for (let i = 0; i <= 120; i++) pts.push(curve.getPointAt(i / 120));
      /* keep the forest out of everything already standing (huts, towers,
         fences, trucks): one box per placed object */
      S.updateMatrixWorld(true);
      const taken = [];
      S.children.forEach((o) => {
        if (o.isInstancedMesh) return;
        const bb = new T.Box3().setFromObject(o);
        if (bb.isEmpty()) return;
        const sz = new T.Vector3(); bb.getSize(sz);
        if (sz.x > 60 || sz.z > 60 || bb.max.y < 0.5) return;
        taken.push(bb);
      });
      const clear = (x, z, r) => {
        for (let i = 0; i < pts.length; i++) { const dx = pts[i].x - x, dz = pts[i].z - z; if (dx * dx + dz * dz < r * r) return false; }
        for (let i = 0; i < taken.length; i++) { const b = taken[i]; if (x > b.min.x - 2.2 && x < b.max.x + 2.2 && z > b.min.z - 2.2 && z < b.max.z + 2.2) return false; }
        return !(Math.abs(x) < 12.5 && z < 36);
      };
      let placed = 0;
      for (let tries = 0; tries < 900 && placed < 150; tries++) {
        const x = (RF() - 0.5) * 120, z = -18 + RF() * 110;
        if (!clear(x, z, 9)) continue;
        const h = 6 + RF() * 6;
        if (RF() < 0.72) voxPine(VF, x, 0.25, z, h, tries + 1);
        else voxTree(VF, x, 0.25, z, h * 0.55, tries + 3, { rx: 2.0 + RF() * 0.8, ry: 1.6, cube: 0.6, tint: [0xc9dcb4, 0xb7cfa0, 0xd8e8c4] });
        trunks2.push([x, z]);
        placed++;
      }
      /* rocks and grass tufts near the wire */
      for (let i = 0; i < 70; i++) {
        const x = (RF() < 0.5 ? -1 : 1) * (12 + RF() * 26), z = -16 + RF() * 60;
        if (!clear(x, z, 4.5)) continue;
        const r = 0.5 + RF() * 1.1;
        VF.cube(vm.rock, x, 0.25 + r * 0.35, z, r * 1.4, r * 0.8, r * 1.1, [0xffffff, 0xe6e6e0, 0xd2d4cc][i % 3], RF() * 3, { cast: true });
        if (RF() < 0.6) VF.cube(vm.rock, x + r * 0.4, 0.25 + r * 0.8, z - r * 0.2, r * 0.7, r * 0.5, r * 0.7, 0xf0f0ea, RF() * 3);
      }
      for (let i = 0; i < 260; i++) {
        const x = (RF() < 0.5 ? -1 : 1) * (7.2 + RF() * 30), z = -16 + RF() * 62;
        if (Math.abs(x) < 7.2) continue;
        const hgt = 0.25 + RF() * 0.35;
        VF.cube(vm.leaf, x, 0.25 + hgt / 2, z, 0.35 + RF() * 0.3, hgt, 0.35 + RF() * 0.3, [0xd5e8b8, 0xbad6a0, 0xe4f0cc][i % 3], RF());
      }
      voxHill(VF, 0, 150, 340, 90, 38, 919, { cell: 5, base: -4 });
      VF.flush(S, "dmzForest");
    }
    /* ---- valley ridges and haze so the horizon never ends in sky ---- */
    S.add(makeRidge(0, 138, 170, 20, 46, 0x5b7560, 0x6a8768));
    S.add(makeRidge(-96, 124, 90, 15, 38, 0x5a7462, 0x6a866c));
    S.add(makeRidge(92, 130, 84, 16, 36, 0x55705a, 0x66825f));
    S.add(makeRidge(52, 108, 42, 10, 28, 0x627e5c, 0x728e6a));
    S.add(makeRidge(-62, 104, 40, 9, 26, 0x5f7b59, 0x6f8b67));
    /* (v14) the old flat green box trees were removed: the voxel forest above
       replaces them and they stood inside the guard post and each other */
    for (let i = 0; i < 40; i++) {
      const R = rng(i * 7 + 19);
      const side = i % 2 ? 1 : -1;
      const gx = side * (4.9 + R() * 3.2);
      const gz = -8 + R() * 40;
      if (gz > 31) continue;
      const tuft = part(S, 0.5 + R() * 0.4, 0.22 + R() * 0.2, 0.5 + R() * 0.3, gx, 0.36, gz, voxMats().leaf);
      tuft.castShadow = false;
    }
    /* wrecked truck and a collapsed wire section on the verge */
    const wreck = makeTruck(-13.4, 20.6);
    wreck.rotation.y = 1.1;
    wreck.rotation.z = 0.16;
    S.add(wreck);

    /* ---- sandbags a paratrooper can land behind ---- */
    landCovers = [];
    [[-7.6, 32.4], [0.6, 33.2], [6.2, 32.8], [-2.4, 34.4], [-24.0, 62.4], [-13.6, 63.0], [-6.8, 62.0], [-19.6, 64.0]].forEach(([x, z]) => {
      const c = landCover(x, z, 2.2);
      S.add(c.g);
      landCovers.push(c);
    });

    /* ---- the truck and jeep the JSA gunners stand on ---- */
    if (waveNamed("jsa1")) {
      const w = waveNamed("jsa1");
      const t = waveXY(w, -4.6, 8.4);
      const tr = makeTruck(t.x, t.z);
      tr.rotation.y = w.yaw + 0.12;
      S.add(tr);
    }
    if (waveNamed("jsa2")) {
      const w = waveNamed("jsa2");
      const j = waveXY(w, 6.2, 8.4);
      const je = makeJeep(j.x, j.z, w.yaw + 0.3);
      S.add(je);
    }

    /* ---- clouds ---- */
    const clouds = [];
    for (let i = 0; i < 9; i++) {
      const c = makeCloud(-70 + i * 17 + Math.random() * 8, 12 + Math.random() * 5, 20 + (i % 3) * 14 + Math.random() * 6, 2.6 + Math.random() * 1.8);
      S.add(c);
      clouds.push(c);
    }

    /* ---- our rifleman, on the near left of the rail ---- */
    const ally = makeAlly();
    ally.position.set(4.6, 0.3, -41.6);
    ally.rotation.y = 0.4;
    S.add(ally);

    const flags = [];
    S.traverse((o) => { if (o.userData && o.userData.cloth) flags.push(o); });

    /* ---- walls for bullets, obstacles for feet ---- */
    walkBlockers = [];
    S.traverse((o) => {
      if (!o.isMesh) return;
      if (o.userData && (o.userData.wall || o.userData.solid)) {
        const bb = new T.Box3().setFromObject(o);
        if (bb.max.y > 0.6) walkBlockers.push(bb);
      }
    });
    if (coverRoot) {
      coverRoot.traverse((o) => {
        if (o.userData && o.userData.cover) {
          walkBlockers.push(new T.Box3().setFromObject(o));
        }
      });
    }
    landCovers.forEach((c) => walkBlockers.push(new T.Box3().setFromObject(c.g)));

    applyMood(ctx, S, sky, clouds, moodOverride() || "dusk");
    dress = {
      root: S, sky, flags, clouds, barrels: [], ally,
      truck1: waveNamed("jsa1") ? waveXY(waveNamed("jsa1"), -4.6, 8.4) : null,
      trunks: trunks2
    };
    window.__stage2 = { landCovers: landCovers.length, walkBlockers: walkBlockers.length };
    return dress;
  }

  /* ---------------- STAGE 5: 압록강 · 백두산 ---------------- */
  function dressPaektu(ctx) {
    makeSol();
    stage2Mats();
    const S = new T.Group();
    S.name = "battlefield5";
    ctx.scene.add(S);
    const sky = makeSkyDome();
    sky.geometry.dispose();
    sky.geometry = new T.SphereGeometry(300, 24, 16);
    sky.position.set(0, 0, 60);
    S.add(sky);
    ctx.scene.background = new T.Color(0x5aa6ec).convertSRGBToLinear();
    ctx.scene.fog = new T.Fog(0xcfe2f2, 140, 520);
    if (ctx.scene.fog.color.convertSRGBToLinear) ctx.scene.fog.color.convertSRGBToLinear();
    try { buildSceneEnv(ctx); if (window.__mgEnv) ctx.scene.environment = window.__mgEnv; } catch (e) {}
    if (ctx.LT) {
      const LT = ctx.LT;
      if (LT.hemi) { LT.hemi.intensity = 0.34; LT.hemi.color.setHex(0xd4e6fa); LT.hemi.groundColor && LT.hemi.groundColor.setHex(0x7a8a6a); }
      if (LT.amb) { LT.amb.intensity = 0.08; }
      if (LT.key) { LT.key.intensity = 2.25; LT.key.color.setHex(0xfff4e0); }
      if (LT.moon) { LT.moon.intensity = 0.1; }
      if (LT.rim) { LT.rim.intensity = 0.4; }
    }
    if (ctx.renderer) ctx.renderer.toneMappingExposure = 1.08;
    const vm = voxMats();
    const R = rng(5555);
    const box = (w, h, d, x, y, z, m, opt) => {
      const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      o.position.set(x, y, z);
      o.castShadow = !(opt && opt.noCast);
      o.receiveShadow = true;
      if (opt && opt.wall) o.userData.wall = 1;
      if (opt && opt.noBlock) o.userData.noBlock = 1;
      if (opt && opt.rx) o.rotation.x = opt.rx;
      if (opt && opt.ry) o.rotation.y = opt.ry;
      if (opt && opt.rz) o.rotation.z = opt.rz;
      S.add(o);
      return o;
    };
    /* ---- ground: two banks either side of the gorge, a trail on each ---- */
    const gT = vm.grass.map.clone(); gT.needsUpdate = true; gT.wrapS = gT.wrapT = T.RepeatWrapping; gT.repeat.set(60, 40);
    const grassM = new T.MeshStandardMaterial({ map: gT, color: 0xc0d6a4, roughness: 0.96 });
    const plane = (w, d, x, z, m, y) => { const o = new T.Mesh(new T.PlaneGeometry(w, d), m); o.rotation.x = -Math.PI / 2; o.position.set(x, y == null ? 0.24 : y, z); o.receiveShadow = true; o.userData.noBlock = 1; S.add(o); return o; };
    plane(400, 260, 0, -122, grassM);
    const gN = new T.MeshStandardMaterial({ map: gT, color: 0xb4c69a, roughness: 0.96 });
    plane(400, 70, 0, 67, gN);
    const trailT = ctex("trailDirt", 128, 128, (g, w, h) => {
      const r = rng(41);
      g.fillStyle = "#8a7558"; g.fillRect(0, 0, w, h);
      const cols = ["#7a6548", "#9a8566", "#6e5a40", "#a8957a", "#857055"];
      for (let i = 0; i < 700; i++) { g.fillStyle = cols[(r() * 5) | 0]; g.fillRect((r() * 16 | 0) * 8, (r() * 16 | 0) * 8, 8, 8); }
    });
    const trM = (rx, ry) => { const t = trailT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); return new T.MeshStandardMaterial({ map: t, roughness: 0.95 }); };
    plane(7, 54, 0, -19, trM(2, 14), 0.26);
    plane(8, 124, 0, -106, trM(2, 32), 0.26);
    plane(9, 64, 3, 66, trM(2, 16), 0.26);
    /* ---- the gorge: rock walls down to the river ---- */
    const VR = voxBatch();
    for (let x = -160; x <= 160; x += 2.4) {
      [[8.2, 1], [31.8, -1]].forEach(([z0, sgn]) => {
        if (Math.abs(x) < 3.6) return;
        for (let k = 0; k < 2; k++) {
          const hh = 2.4 + R() * 0.8;
          VR.cube(vm.rock, x + (R() - 0.5), 0.3 - hh / 2 + k * 0.1, z0 + sgn * (k * 1.6 + R() * 0.6), 2.6, hh, 2.2 + R(), [0xffffff, 0xd8d8d0, 0xc4c6bc][(R() * 3) | 0], R() * 0.3);
        }
      });
    }
    /* boulders on the river and the banks */
    for (let i = 0; i < 70; i++) {
      const x = (R() - 0.5) * 120, z = 10 + R() * 20;
      if (Math.abs(x) < 5) continue;
      const r = 0.6 + R() * 1.6;
      VR.cube(vm.rock, x, -1.6 + r * 0.3, z, r * 1.6, r, r * 1.3, [0xffffff, 0xe4e4dc][i % 2], R() * 3);
    }
    const water = new T.Mesh(new T.PlaneGeometry(400, 26), waterMat(0x2a6a8c, 40, 0.03));
    water.rotation.x = -Math.PI / 2; water.position.set(0, -1.7, 20); water.userData.noBlock = 1;
    S.add(water);
    /* foam streaks */
    for (let i = 0; i < 40; i++) {
      const fm = new T.Mesh(new T.PlaneGeometry(2 + R() * 6, 0.25), new T.MeshBasicMaterial({ color: 0xe8f4fa, transparent: true, opacity: 0.55, depthWrite: false }));
      fm.rotation.x = -Math.PI / 2; fm.position.set((R() - 0.5) * 140, -1.66, 11 + R() * 18); fm.userData.noBlock = 1;
      S.add(fm);
    }
    /* ---- the steel truss bridge ---- */
    {
      const steel = new T.MeshStandardMaterial({ color: 0x3c4148, roughness: 0.55, metalness: 0.7 });
      const steelD = new T.MeshStandardMaterial({ color: 0x2a2e33, roughness: 0.6, metalness: 0.6 });
      const stoneP = repMat(SOL.gateStone, 1, 2);
      box(6.4, 0.5, 30, 0, 0.06, 20, steelD, { noBlock: true });
      box(5.4, 0.06, 30, 0, 0.33, 20, trM(2, 8), { noCast: true, noBlock: true });
      [13.5, 26.5].forEach((z) => { box(4.0, 4.6, 2.6, 0, -2.0, z, stoneP); box(4.4, 0.4, 3.0, 0, 0.1, z, stoneP); });
      [-3.1, 3.1].forEach((x) => {
        box(0.26, 0.3, 30, x, 0.45, 20, steel);                                   /* bottom chord */
        box(0.26, 0.3, 30, x, 5.2, 20, steel);                                    /* top chord */
        for (let z = 5.2; z <= 35; z += 3.6) {
          box(0.22, 4.8, 0.22, x, 2.8, z, steel);                                 /* verticals */
          if (z + 3.6 <= 35.1) {
            const d = box(0.18, 6.0, 0.18, x, 2.8, z + 1.8, steelD);               /* diagonals */
            d.rotation.x = ((Math.round((z - 5.2) / 3.6) % 2) ? 1 : -1) * 0.64;
          }
          for (let r = 0; r < 3; r++) box(0.05, 0.05, 0.05, x + (x > 0 ? -0.14 : 0.14), 0.7 + r * 1.6, z, SOL.steel || steel, { noCast: true });
        }
        box(0.08, 0.08, 30, x * 0.94, 1.25, 20, steelD, { noCast: true });       /* handrail */
      });
      for (let z = 5.2; z <= 35; z += 3.6) box(6.4, 0.22, 0.22, 0, 5.2, z, steel); /* top cross beams */
      for (let z = 7; z <= 33; z += 7.2) { const xb = box(0.16, 0.16, 7.4, 0, 5.3, z, steelD); xb.rotation.y = Math.PI / 2 - 0.85; }
    }
    /* ---- the boundary stele, posts and the Paektu board ---- */
    const stele = (x, z, key, text) => {
      const t = ctex(key, 96, 256, (g, w, h) => {
        g.fillStyle = "#c9c4b6"; g.fillRect(0, 0, w, h);
        const r = rng(17);
        for (let i = 0; i < 160; i++) { g.fillStyle = r() < 0.5 ? "#b8b3a4" : "#d6d1c4"; g.fillRect((r() * 12 | 0) * 8, (r() * 32 | 0) * 8, 8, 8); }
        g.fillStyle = "#3a3630"; g.font = "900 58px 'Malgun Gothic', 'Apple SD Gothic Neo', serif"; g.textAlign = "center";
        [...text].forEach((c, i) => g.fillText(c, w / 2, 70 + i * 70));
      }, { smooth: true });
      const m = new T.MeshStandardMaterial({ map: t, roughness: 0.85 });
      const side = repMat(SOL.gateStone, 1, 2);
      const o = new T.Mesh(new T.BoxGeometry(1.2, 3.4, 0.8), [side, side, side, side, side, m]);
      o.position.set(x, 0.3 + 1.7, z); o.rotation.y = Math.PI; o.castShadow = true; o.userData.wall = 1;
      S.add(o);
      box(1.8, 0.4, 1.4, x, 0.5, z, side);
    };
    stele(-6.0, -30.0, "yaluStele", "압록강");
    const pbTex = boardTex("paektuBoard", { bg: "#6f5735", seed: 9, lines: [{ t: "▲", s: 60, y: 0.3 }, { t: "백두산", s: 56, y: 0.58 }, { t: "(2,744m)", s: 30, y: 0.83 }] });
    S.add(makeSign(-5.6, 62.0, 0.15, pbTex, 3.0, 1.9, 0.3, 2.2));
    S.add(makeSign(6.0, -14.0, -0.1, boardTex("paektuBoard2", { bg: "#6f5735", seed: 5, lines: [{ t: "국경 경비 구역", s: 34, y: 0.4 }, { t: "출입 통제", s: 40, y: 0.7 }] }), 2.6, 1.6, 0.3, 1.8));
    /* ---- a wooden watchtower with a flag on the plateau ---- */
    {
      const wood = SOL.wood || SOL.woodDark;
      const tx = -13.0, tz = 62.0;
      [-1, 1].forEach((a) => [-1, 1].forEach((b) => box(0.32, 7.2, 0.32, tx + a * 1.5, 3.9, tz + b * 1.5, wood, { rz: -a * 0.06, rx: b * 0.06 })));
      for (let y = 1.6; y < 7; y += 2.0) [-1, 1].forEach((b) => { const d = box(0.16, 3.6, 0.16, tx, y + 0.9, tz + b * 1.5, wood); d.rotation.z = 0.9; });
      box(4.2, 0.3, 4.2, tx, 7.5, tz, wood);
      [-1, 1].forEach((a) => { box(4.2, 0.9, 0.12, tx, 8.1, tz + a * 2.0, wood); box(0.12, 0.9, 4.2, tx + a * 2.0, 8.1, tz, wood); });
      [-1, 1].forEach((a) => [-1, 1].forEach((b) => box(0.16, 2.4, 0.16, tx + a * 1.9, 9.0, tz + b * 1.9, wood)));
      const roof = box(5.0, 0.3, 5.0, tx, 10.3, tz, SOL.woodDark || wood);
      const roof2 = box(3.4, 0.6, 3.4, tx, 10.7, tz, SOL.woodDark || wood);
      const pole = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 4.6, 8), SOL.metalDark); pole.position.set(tx + 1.9, 12.4, tz + 1.9); S.add(pole);
      const f = new T.Mesh(new T.PlaneGeometry(2.4, 1.6), SOL.flagKP); f.position.set(tx + 0.7, 13.6, tz + 1.9); f.rotation.y = Math.PI; f.userData.noBlock = 1; S.add(f);
      const f2 = new T.Mesh(new T.PlaneGeometry(2.4, 1.6), SOL.flagKP); f2.position.set(tx + 0.7, 13.6, tz + 1.92); f2.userData.noBlock = 1; S.add(f2);
    }
    /* ---- the crater: Cheonji below the plateau edge, ringed by peaks ---- */
    {
      const cx = 0, cz = 178, lakeR = 66;
      const lake = new T.Mesh(new T.CircleGeometry(lakeR + 6, 40), new T.MeshBasicMaterial({ color: 0x1f5a88, fog: false }));
      lake.rotation.x = -Math.PI / 2; lake.position.set(cx, -1.3, cz); lake.userData.noBlock = 1;
      S.add(lake);
      const VM = voxBatch();
      const cell = 7;
      for (let x = -170; x <= 170; x += cell) for (let z = 90; z <= 330; z += cell) {
        const dx = x - cx, dz = z - cz, r = Math.hypot(dx, dz);
        if (r < lakeR - 2 || r > 150) continue;
        const th = Math.atan2(dx, dz); /* 0 = far side, ±π = near side */
        const near = Math.max(0, Math.cos(th + Math.PI)); /* 1 on the player's side */
        let amp = 58 + 22 * Math.sin(th * 3 + 1.1) + 10 * Math.sin(th * 7 + 0.4);
        amp = amp * Math.pow(1 - near, 1.6);
        const ring = Math.exp(-Math.pow((r - 98) / 36, 2));
        let h = amp * ring + 6 * Math.sin(x * 0.11) * Math.cos(z * 0.09) * ring;
        if (h < 5 && z < 150) continue; /* keep the near rim open so the lake shows */
        const hh = Math.round(h / 3) * 3;
        const base = -2.5;
        if (hh - base < 1) continue;
        const kk = hh / 80;
        const inner = r < lakeR + 16;
        const col = kk > 0.62 ? (R() < 0.2 ? 0xdfe6ec : 0xffffff) : kk > 0.34 ? [0x9a948a, 0x8a847a, 0xa8a296][(R() * 3) | 0] : inner ? [0x7a6a58, 0x6c5e4e, 0x86765f][(R() * 3) | 0] : [0x6a7a50, 0x5c6c46, 0x748656][(R() * 3) | 0];
        const mat = kk > 0.34 || inner ? vm.rock : vm.grass;
        VM.cube(kk > 0.62 ? vm.plain : mat, x, base + (hh - base) / 2, z, cell, hh - base, cell, col);
      }
      /* a cliff of rock down from the plateau edge to the water */
      for (let x = -90; x <= 90; x += 3) VM.cube(vm.rock, x, -1.1, 104 + R() * 2, 3.2, 2.8, 4 + R() * 3, [0xffffff, 0xd6d6ce][(R() * 2) | 0]);
      VM.flush(S, "paektu");
      /* far ranges, hazy */
      const VH = voxBatch();
      voxHill(VH, -170, 120, 160, 120, 46, 61, { cell: 8, base: -4 });
      voxHill(VH, 170, 130, 160, 120, 52, 62, { cell: 8, base: -4 });
      VH.flush(S, "ranges");
    }
    /* ---- forest, rocks and snow on the trail ---- */
    const VT = voxBatch();
    const trunks = [];
    const pts = [];
    if (curve) for (let i = 0; i <= 120; i++) pts.push(curve.getPointAt(i / 120));
    const clear = (x, z, r) => {
      for (let i = 0; i < pts.length; i++) { const dx = pts[i].x - x, dz = pts[i].z - z; if (dx * dx + dz * dz < r * r) return false; }
      if (z > 4 && z < 36) return false;
      if (z > 98) return false;
      if (Math.abs(x + 13) < 5 && Math.abs(z - 62) < 5) return false;
      if (Math.abs(x + 6) < 3 && Math.abs(z + 30) < 3) return false;
      return true;
    };
    let placed = 0;
    for (let tries = 0; tries < 2400 && placed < 300; tries++) {
      const x = (R() - 0.5) * 140, z = -180 + R() * 276;
      if (!clear(x, z, 8.0)) continue;
      const h = (z > 40 ? 4 : 7) + R() * 6;
      if (R() < 0.85) voxPine(VT, x, 0.25, z, h, tries + 9);
      else voxTree(VT, x, 0.25, z, h * 0.55, tries + 3, { rx: 1.8 + R() * 0.6, ry: 1.5, cube: 0.6, tint: [0xd2e4bc, 0xe8f0c8, 0xc8dca8] });
      trunks.push([x, z]);
      placed++;
    }
    VT.flush(S, "paektuForest");
    const VS = voxBatch();
    for (let i = 0; i < 90; i++) {
      const x = (R() - 0.5) * 70, z = 36 + R() * 64;
      if (!clear(x, z, 4.6)) continue;
      const r = 0.7 + R() * 1.6;
      VS.cube(vm.rock, x, 0.25 + r * 0.4, z, r * 1.5, r * 0.9, r * 1.2, [0xffffff, 0xe0e0d8, 0xcfd1c8][i % 3], R() * 3, { cast: true });
      if (R() < 0.5) VS.cube(vm.rock, x + r * 0.5, 0.25 + r * 0.9, z, r * 0.8, r * 0.6, r * 0.8, 0xf0f0ea, R() * 3, { cast: true });
      if (R() < 0.4) VS.cube(vm.plain, x, 0.25 + r * 0.9 + 0.05, z, r * 1.2, 0.12, r * 1.0, 0xf6f9fc, R() * 3);
    }
    for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 80, z = 50 + R() * 48; if (!clear(x, z, 3)) continue; VS.cube(vm.plain, x, 0.27, z, 2 + R() * 4, 0.06, 1.5 + R() * 3, 0xf4f7fa, R()); }
    VS.flush(S, "plateauRocks");
    landCovers = [];
    [[-3.6, 66.4], [1.8, 67.6], [5.6, 66.0], [9.2, 80.0], [3.0, 81.8]].forEach(([x, z]) => { const c = landCover(x, z, 2.2); S.add(c.g); landCovers.push(c); });
    const clouds = [];
    for (let i = 0; i < 9; i++) { const c = makeCloud(-120 + i * 30, 70 + Math.random() * 20, 130 + (i % 3) * 30, 6 + Math.random() * 3); c.scale.y = 0.34; S.add(c); clouds.push(c); }
    const ally = makeAlly();
    ally.position.set(4.6, 0.3, -41.6);
    S.add(ally);
    const flags = [];
    S.traverse((o) => { if (o.userData && o.userData.cloth) flags.push(o); });
    walkBlockers = [];
    S.traverse((o) => {
      if (!o.isMesh) return;
      if (o.userData && (o.userData.wall || o.userData.solid)) { const bb = new T.Box3().setFromObject(o); if (bb.max.y > 0.6) walkBlockers.push(bb); }
    });
    if (coverRoot) coverRoot.traverse((o) => { if (o.userData && o.userData.cover) walkBlockers.push(new T.Box3().setFromObject(o)); });
    landCovers.forEach((c) => walkBlockers.push(new T.Box3().setFromObject(c.g)));
    applyMood(ctx, S, sky, clouds, moodOverride() || "day");
    dress = { root: S, sky, flags, clouds, barrels: [], ally, truck1: null, trunks };
    return dress;
  }

  /* ---------------- STAGE 3: 판문점 평화의 집 (summer) ---------------- */
  function dressSummit(ctx) {
    makeSol();
    stage2Mats();
    const S = new T.Group();
    S.name = "battlefieldS";
    ctx.scene.add(S);
    const sky = makeSkyDome();
    sky.geometry.dispose();
    sky.geometry = new T.SphereGeometry(260, 24, 16);
    sky.position.set(0, 0, 20);
    S.add(sky);
    ctx.scene.background = new T.Color(0x72b8f0).convertSRGBToLinear();
    ctx.scene.fog = new T.Fog(0xd6e6f2, 110, 380);
    if (ctx.scene.fog.color.convertSRGBToLinear) ctx.scene.fog.color.convertSRGBToLinear();
    try { buildSceneEnv(ctx); if (window.__mgEnv) ctx.scene.environment = window.__mgEnv; } catch (e) {}
    if (ctx.LT) {
      const LT = ctx.LT;
      if (LT.hemi) { LT.hemi.intensity = 0.3; LT.hemi.color.setHex(0xd8e9fb); LT.hemi.groundColor && LT.hemi.groundColor.setHex(0x8a9a70); }
      if (LT.amb) { LT.amb.intensity = 0.07; LT.amb.color && LT.amb.color.setHex(0xbfd6ea); }
      if (LT.key) { LT.key.intensity = 2.2; LT.key.color.setHex(0xfff0d6); }
      if (LT.moon) { LT.moon.intensity = 0.1; }
      if (LT.rim) { LT.rim.intensity = 0.45; LT.rim.color && LT.rim.color.setHex(0xffd7ab); }
    }
    if (ctx.renderer) ctx.renderer.toneMappingExposure = 1.1;
    const box = (w, h, d, x, y, z, m, opt) => {
      const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      o.position.set(x, y, z);
      o.castShadow = !(opt && opt.noCast);
      o.receiveShadow = true;
      if (opt && opt.wall) o.userData.wall = 1;
      if (opt && opt.rot) o.rotation.y = opt.rot;
      S.add(o);
      return o;
    };
    const vm = voxMats();
    const R = rng(5150);
    /* ---- ground: grass, a paved approach, the concrete apron of the JSA ---- */
    const gT = vm.grass.map.clone(); gT.needsUpdate = true; gT.wrapS = gT.wrapT = T.RepeatWrapping; gT.repeat.set(90, 90);
    const ground = new T.Mesh(new T.PlaneGeometry(360, 360), new T.MeshStandardMaterial({ map: gT, color: 0xc8dcae, roughness: 0.96 }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0.24, 30); ground.receiveShadow = true;
    S.add(ground);
    const paveT = ctex("summitPave", 128, 128, (g, w, h) => {
      const r = rng(61);
      g.fillStyle = "#c9c2b2"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#aea796"; for (let i = 0; i < w; i += 32) { g.fillRect(i, 0, 3, h); g.fillRect(0, i, w, 3); }
      for (let i = 0; i < 240; i++) { g.fillStyle = r() < 0.5 ? "#d8d2c3" : "#b6af9e"; g.fillRect((r() * 16 | 0) * 8, (r() * 16 | 0) * 8, 8, 8); }
    });
    const paveM = (rx, ry) => { const t = paveT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); return new T.MeshStandardMaterial({ map: t, roughness: 0.85 }); };
    const flat = (w, d, x, z, m, y) => { const o = new T.Mesh(new T.PlaneGeometry(w, d), m); o.rotation.x = -Math.PI / 2; o.position.set(x, y || 0.27, z); o.receiveShadow = true; o.userData.noBlock = 1; S.add(o); return o; };
    flat(9, 52, 0, -30, paveM(3, 16));
    flat(40, 30, 6, 46, paveM(12, 9), 0.272);
    flat(30, 18, 7, 64, paveM(10, 6), 0.274);
    /* ---- 평화의 집: three storeys of pale granite and glass, a deep roof
       slab, an entrance canopy on four columns, flags at the door ---- */
    {
      const cx = 20, cz = -9, W = 26, D = 14;
      const stone = repMat(SOL.gateStone, W / 5, 3);
      const glass = new T.MeshStandardMaterial({ color: 0x23394a, roughness: 0.06, metalness: 0.6, envMapIntensity: 1.0 });
      box(W, 12, D, cx, 0.3 + 6, cz, stone, { wall: true });
      for (let f = 0; f < 3; f++) {
        box(W - 1.6, 2.2, 0.12, cx, 0.3 + 1.8 + f * 4, cz - D / 2 - 0.02, glass);
        for (let i = 0; i <= 8; i++) box(0.5, 2.4, 0.3, cx - W / 2 + 0.8 + i * ((W - 1.6) / 8), 0.3 + 1.8 + f * 4, cz - D / 2 - 0.1, stone);
        box(W + 0.4, 0.3, 0.6, cx, 0.3 + 3.25 + f * 4, cz - D / 2 - 0.2, stone);
      }
      box(W + 3, 0.6, D + 3, cx, 0.3 + 12.3, cz, repMat(SOL.stoneDark || SOL.gateStone, 6, 1));
      box(W - 6, 1.6, D - 5, cx, 0.3 + 13.4, cz, stone);
      /* the entrance */
      box(10, 0.4, 6, cx - 3, 0.3 + 4.6, cz - D / 2 - 3, repMat(SOL.stoneDark || SOL.gateStone, 3, 1));
      [-1, 1].forEach((k) => [-1, 1].forEach((j) => box(0.6, 4.4, 0.6, cx - 3 + k * 4.2, 0.3 + 2.2, cz - D / 2 - 3 + j * 2.4, stone)));
      box(10, 0.3, 5, cx - 3, 0.42, cz - D / 2 - 3, paveM(3, 2), { noCast: true });
      const fk = makeFlagPlane(S, "kr", cx - 9.0, 6.2, cz - D / 2 - 5.5, 2.1, 1.4, Math.PI);
      fk && (fk.name = "peaceFlag");
      /* a parked dark sedan by the door */
      const car = new T.Group();
      part(car, 1.9, 0.6, 4.8, 0, 0.6, 0, new T.MeshStandardMaterial({ color: 0x111317, roughness: 0.25, metalness: 0.6 }));
      part(car, 1.6, 0.5, 2.4, 0, 1.15, -0.2, new T.MeshStandardMaterial({ color: 0x0b0e12, roughness: 0.08, metalness: 0.7 }));
      [-1.6, 1.6].forEach((wz) => [-0.9, 0.9].forEach((wx) => { const w = new T.Mesh(new T.CylinderGeometry(0.36, 0.36, 0.26, 12), SOL.tire); w.rotation.z = Math.PI / 2; w.position.set(wx, 0.36, wz); car.add(w); }));
      car.position.set(7.6, 0.3, -20.5); car.rotation.y = 0.15;
      S.add(car);
    }
    /* ---- the memorial pine and its stone ---- */
    const VT = voxBatch();
    const trunks = [];
    voxPine(VT, -6.2, 0.3, 1.0, 7.4, 77);
    trunks.push([-6.2, 1.0]);
    box(1.6, 0.9, 0.5, -6.2, 0.75, -1.8, repMat(SOL.stoneDark || SOL.gateStone, 1, 1));
    /* ---- the wetland and 도보다리 ---- */
    const water = new T.Mesh(new T.PlaneGeometry(36, 24), new T.MeshStandardMaterial({ color: 0x4f6f68, roughness: 0.15, metalness: 0.35, envMapIntensity: 0.8 }));
    water.rotation.x = -Math.PI / 2; water.position.set(0, 0.262, 14.5); water.userData.noBlock = 1;
    S.add(water);
    const VR = voxBatch();
    for (let i = 0; i < 260; i++) {
      const x = (R() - 0.5) * 34, z = 3 + R() * 23;
      if (Math.abs(x) < 2.2) continue;
      const hh = 0.35 + R() * 0.55;
      VR.cube(vm.leaf, x, 0.26 + hh / 2, z, 0.12 + R() * 0.1, hh, 0.12 + R() * 0.1, [0xd6e8a0, 0xbcd08a, 0xe8f0b4][i % 3], R());
    }
    VR.flush(S, "reeds");
    const bridgeBlue = new T.MeshStandardMaterial({ color: 0x5f95c4, roughness: 0.6 });
    const bridgeDark = new T.MeshStandardMaterial({ color: 0x3f6f9a, roughness: 0.6 });
    const VB = voxBatch();
    for (let z = 2.6; z < 21; z += 0.42) VB.cube(vm.plain, 0, 0.52, z, 2.7, 0.08, 0.36, (z * 10 | 0) % 2 ? 0x5f95c4 : 0x6ba0cc);
    for (let z = 2.6; z <= 21; z += 2.1) [-1.35, 1.35].forEach((x) => { VB.cube(vm.plain, x, 0.85, z, 0.12, 0.7, 0.12, 0x3f6f9a); VB.cube(vm.plain, x, 0.3, z, 0.18, 0.5, 0.18, 0x5a6e78); });
    VB.flush(S, "bridge");
    [-1.35, 1.35].forEach((x) => box(0.08, 0.08, 18.6, x, 1.18, 11.8, bridgeDark, { noCast: true }));
    /* the deck at the end, its two chairs and a table, and the MDL marker */
    box(6.6, 0.12, 5.2, 0, 0.52, 23.4, bridgeBlue).userData.noBlock = 1;
    [-1, 1].forEach((k) => {
      const cx = -2.2 + k * 0.75;
      box(0.62, 0.08, 0.6, cx, 0.98, 23.6, new T.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.6 }));
      box(0.62, 0.6, 0.08, cx, 1.28, 23.92, new T.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.6 }));
      box(0.06, 0.4, 0.06, cx, 0.75, 23.6, SOL.metalDark);
    });
    box(0.5, 0.06, 0.5, -2.2, 1.02, 23.4, new T.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.6 }));
    box(0.12, 1.5, 0.12, 2.9, 1.3, 25.4, new T.MeshStandardMaterial({ color: 0xe0c040, roughness: 0.6 }));
    box(0.8, 0.5, 0.05, 2.9, 2.1, 25.4, new T.MeshStandardMaterial({ map: ctex("mdlMark", 96, 64, (g, w, h) => {
      g.fillStyle = "#f0d040"; g.fillRect(0, 0, w, h); g.fillStyle = "#1b2a5a"; g.font = "900 18px sans-serif"; g.textAlign = "center"; g.fillText("군사분계선", w / 2, 28); g.font = "700 11px sans-serif"; g.fillText("MDL", w / 2, 48);
    }, { smooth: true }), roughness: 0.6 }));
    /* ---- the conference row on the MDL, guard towers, Freedom House,
       Panmungak and its stair ---- */
    S.add(makeBlueHall(-11.2, 47.0, 4.2, 5.4, 3.0, 0));
    S.add(makeBlueHall(-2.6, 47.0, 4.2, 5.4, 3.0, 0));
    S.add(makeBlueHall(16.6, 47.0, 4.2, 5.4, 3.0, 0));
    const grayHut = new T.MeshStandardMaterial({ color: 0xa8acb0, roughness: 0.5, metalness: 0.3 });
    box(4.4, 3.0, 5.4, -19.6, 1.8, 47.0, grayHut, { wall: true });
    box(4.4, 3.0, 5.4, 24.8, 1.8, 47.0, grayHut, { wall: true });
    box(60, 0.12, 0.5, 2, 0.32, 47.0, new T.MeshStandardMaterial({ color: 0xd8d4c8, roughness: 0.8 }), { noCast: true });
    const tower = (x, z, kind) => {
      const cm = repMat(SOL.stoneDark || SOL.gateStone, 1, 2);
      [-1, 1].forEach((a) => [-1, 1].forEach((b) => box(0.5, 6.2, 0.5, x + a * 1.6, 3.4, z + b * 1.6, cm)));
      for (let y = 1.6; y < 6; y += 1.8) { box(3.8, 0.18, 0.18, x, y, z - 1.6, cm, { noCast: true }); box(3.8, 0.18, 0.18, x, y, z + 1.6, cm, { noCast: true }); }
      box(4.4, 0.4, 4.4, x, 6.7, z, cm);
      box(3.4, 2.4, 3.4, x, 8.1, z, repMat(SOL.gateStone, 1, 1), { wall: true });
      box(3.6, 0.9, 0.1, x, 8.3, z - 1.75, new T.MeshStandardMaterial({ color: 0x1f2a32, roughness: 0.1, metalness: 0.5 }));
      box(4.0, 0.3, 4.0, x, 9.45, z, cm);
      [-1, 1].forEach((a) => box(4.4, 0.08, 0.08, x, 7.6, z + a * 2.15, SOL.metalDark, { noCast: true }));
      box(0.3, 0.3, 0.6, x + 1.6, 9.9, z - 1.4, new T.MeshBasicMaterial({ color: 0xfff1c8 }));
      const fm = kind === "kp" ? SOL.flagKP : SOL.flagKR;
      const fl = new T.Mesh(new T.PlaneGeometry(2.7, 1.8), fm);
      fl.position.set(x, 7.0, z - 2.3);
      fl.rotation.y = Math.PI;
      fl.userData.noBlock = 1;
      S.add(fl);
    };
    tower(21.0, 38.0, "kr");
    tower(-15.0, 55.0, "kp");
    const fh = makeFreedomHouse(-26.0, 30.0, 0.2);
    S.add(fh);
    const pg = makePanmungak(7, 78);
    pg.rotation.y = Math.PI;
    S.add(pg);
    /* ---- forest: pines and oaks everywhere the rail and buildings are not ---- */
    S.updateMatrixWorld(true);
    const taken = [];
    S.children.forEach((o) => {
      if (o.isInstancedMesh) return;
      const bb = new T.Box3().setFromObject(o);
      if (bb.isEmpty()) return;
      const sz = new T.Vector3(); bb.getSize(sz);
      if (sz.x > 60 || sz.z > 60 || bb.max.y < 0.6) return;
      taken.push(bb);
    });
    const pts = [];
    if (curve) for (let i = 0; i <= 120; i++) pts.push(curve.getPointAt(i / 120));
    const clear = (x, z, r) => {
      for (let i = 0; i < pts.length; i++) { const dx = pts[i].x - x, dz = pts[i].z - z; if (dx * dx + dz * dz < r * r) return false; }
      for (let i = 0; i < taken.length; i++) { const b = taken[i]; if (x > b.min.x - 2.5 && x < b.max.x + 2.5 && z > b.min.z - 2.5 && z < b.max.z + 2.5) return false; }
      if (z > 1 && z < 27 && Math.abs(x) < 19) return false; /* the wetland */
      if (z > 36 && z < 88 && x > -30 && x < 36) return false; /* the JSA apron */
      return true;
    };
    let placed = 0;
    for (let tries = 0; tries < 1200 && placed < 170; tries++) {
      const x = (R() - 0.5) * 130, z = -70 + R() * 170;
      if (!clear(x, z, 8.5)) continue;
      const h = 6 + R() * 6;
      if (R() < 0.6) voxPine(VT, x, 0.25, z, h, tries + 5);
      else voxTree(VT, x, 0.25, z, h * 0.55, tries + 7, { rx: 2.0 + R() * 0.8, ry: 1.6, cube: 0.6, tint: [0xd2e4bc, 0xbcd6a4, 0xe0eccc] });
      trunks.push([x, z]);
      placed++;
    }
    voxHill(VT, 0, 160, 340, 100, 52, 777, { cell: 5, base: -4 });
    VT.flush(S, "summitForest");
    /* ---- paratrooper sandbags ---- */
    landCovers = [];
    [[-5.0, 21.4], [5.4, 22.0], [2.6, 50.6], [-3.4, 51.0], [9.8, 52.2]].forEach(([x, z]) => {
      const c = landCover(x, z, 2.2); S.add(c.g); landCovers.push(c);
    });
    const clouds = [];
    for (let i = 0; i < 9; i++) {
      const c = makeCloud(-110 + i * 28, 46 + Math.random() * 14, 90 + (i % 3) * 30, 5.5 + Math.random() * 2.4);
      c.scale.y = 0.34; S.add(c); clouds.push(c);
    }
    const ally = makeAlly();
    ally.position.set(4.6, 0.3, -41.6);
    S.add(ally);
    const flags = [];
    S.traverse((o) => { if (o.userData && o.userData.cloth) flags.push(o); });
    walkBlockers = [];
    S.traverse((o) => {
      if (!o.isMesh) return;
      if (o.userData && (o.userData.wall || o.userData.solid)) { const bb = new T.Box3().setFromObject(o); if (bb.max.y > 0.6) walkBlockers.push(bb); }
    });
    if (coverRoot) coverRoot.traverse((o) => { if (o.userData && o.userData.cover) walkBlockers.push(new T.Box3().setFromObject(o)); });
    landCovers.forEach((c) => walkBlockers.push(new T.Box3().setFromObject(c.g)));
    applyMood(ctx, S, sky, clouds, moodOverride() || "day");
    dress = { root: S, sky, flags, clouds, barrels: [], ally, truck1: null, trunks };
    return dress;
  }

  /* ---------------- STAGE 3: 평양 진입 (snow) ---------------- */
  function dressStage3(ctx) {
    makeSol();
    stage2Mats();
    const S = new T.Group();
    S.name = "battlefield3";
    ctx.scene.add(S);
    const sky = makeSkyDome();
    sky.geometry.dispose();
    sky.geometry = new T.SphereGeometry(260, 24, 16);
    sky.position.set(0, 0, 20);
    S.add(sky);
    const R = rng(3303);
    const box = (w, h, d, x, y, z, m, opt) => {
      const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      o.position.set(x, y, z);
      o.castShadow = !(opt && opt.noCast);
      o.receiveShadow = true;
      if (opt && opt.wall) o.userData.wall = 1;
      S.add(o);
      return o;
    };
    /* ---- materials: snow, slush road, paving, grey slab facades ---- */
    const snowTex = ctex("snowGround", 128, 128, (g, w, h) => {
      const r = rng(71);
      g.fillStyle = "#eef2f6"; g.fillRect(0, 0, w, h);
      const cols = ["#ffffff", "#dfe6ee", "#e8eef4", "#cdd6e0", "#f6f9fc"];
      for (let i = 0; i < 700; i++) { g.fillStyle = cols[(r() * 5) | 0]; g.fillRect((r() * 16 | 0) * 8, (r() * 16 | 0) * 8, 8, 8); }
    });
    snowTex.wrapS = snowTex.wrapT = T.RepeatWrapping; snowTex.repeat.set(70, 70);
    const snowM = new T.MeshStandardMaterial({ map: snowTex, roughness: 0.92 });
    const slushTex = ctex("slushRoad2", 128, 128, (g, w, h) => {
      const r = rng(73);
      g.fillStyle = "#4a4e54"; g.fillRect(0, 0, w, h);
      const cols = ["#3c4046", "#50545a", "#5a5e64", "#666b72", "#7d848c", "#454950", "#a9b1b9"];
      for (let i = 0; i < 520; i++) { const c = r() < 0.06 ? 6 : (r() * 6) | 0; g.fillStyle = cols[c]; g.fillRect((r() * 16 | 0) * 8, (r() * 16 | 0) * 8, 8, 8); }
    });
    slushTex.wrapS = slushTex.wrapT = T.RepeatWrapping;
    const pavTex = ctex("pyPave", 128, 128, (g, w, h) => {
      const r = rng(79);
      g.fillStyle = "#b9b4aa"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#9d988e"; for (let i = 0; i < w; i += 32) { g.fillRect(i, 0, 3, h); g.fillRect(0, i, w, 3); }
      for (let i = 0; i < 260; i++) { g.fillStyle = r() < 0.5 ? "#e6eaee" : "#a8a398"; g.fillRect((r() * 16 | 0) * 8, (r() * 16 | 0) * 8, 8, 8); }
    });
    pavTex.wrapS = pavTex.wrapT = T.RepeatWrapping;
    const aptTex = ctex("aptFacade", 256, 256, (g, w, h) => {
      const r = rng(83);
      g.fillStyle = "#b7b1a4"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? "#a9a395" : "#c4beb1"; g.fillRect((r() * 32 | 0) * 8, (r() * 32 | 0) * 8, 8, 8); }
      for (let fy = 0; fy < 4; fy++) for (let fx = 0; fx < 4; fx++) {
        const x = 12 + fx * 62, y = 14 + fy * 62;
        g.fillStyle = "#3f4a52"; g.fillRect(x, y, 38, 30);
        g.fillStyle = r() < 0.3 ? "#e8c77a" : "#5b6c78"; g.fillRect(x + 3, y + 3, 15, 24); g.fillRect(x + 21, y + 3, 14, 24);
        g.fillStyle = "#8f897c"; g.fillRect(x - 6, y + 34, 50, 6);
      }
    });
    const aptM = (w, h) => { const t = aptTex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(Math.max(1, w / 9), Math.max(1, h / 9)); return new T.MeshStandardMaterial({ map: t, roughness: 0.88 }); };
    const stoneM = (w, h) => repMat(SOL.gateStone, Math.max(1, w / 6), Math.max(1, h / 6));
    const capM = new T.MeshStandardMaterial({ color: 0xf4f7fa, roughness: 0.9 });
    const redM = new T.MeshStandardMaterial({ color: 0xb8241c, roughness: 0.75 });
    const goldM = new T.MeshStandardMaterial({ color: 0xe0b040, roughness: 0.4, metalness: 0.6 });
    const glassM = new T.MeshStandardMaterial({ color: 0x5e6f80, roughness: 0.2, metalness: 0.7 });
    const banner = (x, y, z, rotY, w, hh) => {
      const t = ctex("redBanner", 64, 160, (g, W, H) => {
        g.fillStyle = "#b8241c"; g.fillRect(0, 0, W, H);
        g.fillStyle = "#8a1810"; g.fillRect(0, 0, 4, H); g.fillRect(W - 4, 0, 4, H);
        g.fillStyle = "#f0c64a";
        g.beginPath(); const cx = W / 2, cy = 30, R1 = 16, R2 = 7;
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R2 : R1; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
        g.closePath(); g.fill();
        g.fillRect(10, 64, W - 20, 4); g.fillRect(10, 140, W - 20, 4);
      }, { smooth: true });
      const m = new T.Mesh(new T.PlaneGeometry(w, hh), new T.MeshStandardMaterial({ map: t, roughness: 0.8, side: T.DoubleSide }));
      m.position.set(x, y, z); m.rotation.y = rotY;
      m.userData.noBlock = 1;
      S.add(m);
    };
    /* ---- ground ---- */
    const ground = new T.Mesh(new T.PlaneGeometry(400, 400), snowM);
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0.24, 40); ground.receiveShadow = true;
    S.add(ground);
    const roadT = slushTex.clone(); roadT.needsUpdate = true; roadT.wrapS = roadT.wrapT = T.RepeatWrapping; roadT.repeat.set(4, 34);
    const road = new T.Mesh(new T.PlaneGeometry(17, 120), new T.MeshStandardMaterial({ map: roadT, roughness: 0.6, metalness: 0.05 }));
    road.rotation.x = -Math.PI / 2; road.position.set(0, 0.27, -20); road.receiveShadow = true;
    S.add(road);
    const plT = pavTex.clone(); plT.needsUpdate = true; plT.wrapS = plT.wrapT = T.RepeatWrapping; plT.repeat.set(16, 16);
    const plaza = new T.Mesh(new T.PlaneGeometry(70, 66), new T.MeshStandardMaterial({ map: plT, roughness: 0.85 }));
    plaza.rotation.x = -Math.PI / 2; plaza.position.set(12, 0.275, 62); plaza.receiveShadow = true;
    S.add(plaza);
    /* centre line and lane marks under the slush */
    for (let z = -76; z < 36; z += 6) { const m = new T.Mesh(new T.PlaneGeometry(0.2, 3), SOL.paintWhite); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.29, z); S.add(m); }
    /* ---- the avenue: apartment slabs both sides, snow on every roof ---- */
    const trunks = [];
    const slab = (x0, x1, z0, z1, h, k) => {
      const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      box(w, h, d, cx, 0.3 + h / 2, cz, aptM(Math.max(w, d), h), { wall: true });
      box(w + 0.4, 0.5, d + 0.4, cx, 0.3 + h + 0.25, cz, capM);
      box(w * 0.3, 2.2, d * 0.3, cx, 0.3 + h + 1.6, cz, stoneM(4, 2));
      box(w * 0.3 + 0.3, 0.3, d * 0.3 + 0.3, cx, 0.3 + h + 2.85, cz, capM);
      /* a band of snow on every balcony course on the street face */
      const face = x0 > 0 ? x0 - 0.05 : x1 + 0.05;
      for (let y = 4; y < h - 1; y += 3.1) box(0.3, 0.12, d - 0.6, face + (x0 > 0 ? -0.1 : 0.1), 0.3 + y, cz, capM, { noCast: true });
      if (k % 2 === 0) banner(face + (x0 > 0 ? -0.2 : 0.2), 0.3 + h * 0.55, cz, x0 > 0 ? -Math.PI / 2 : Math.PI / 2, 2.4, 7.2);
    };
    [[-80, -60], [-58, -40], [-38, -22], [-20, -6], [-4, 14]].forEach(([z0, z1], i) => {
      slab(13, 27, z0, z1, 20 + (i * 7) % 14, i);
      slab(-27, -13, z0 + 2, z1 + 2, 22 + (i * 5) % 12, i + 1);
    });
    /* sidewalks with a snow kerb */
    box(4, 0.12, 120, -10.6, 0.33, -20, new T.MeshStandardMaterial({ map: plT, roughness: 0.85 }), { noCast: true });
    box(4, 0.12, 120, 10.6, 0.33, -20, new T.MeshStandardMaterial({ map: plT, roughness: 0.85 }), { noCast: true });
    box(0.4, 0.3, 120, -8.6, 0.4, -20, capM, { noCast: true });
    box(0.4, 0.3, 120, 8.6, 0.4, -20, capM, { noCast: true });
    /* ---- a tram stop with its shelter and overhead wire masts ---- */
    box(5.2, 0.12, 2.0, -7.0, 2.9, 2.0, capM);
    box(0.14, 2.6, 0.14, -9.2, 1.6, 1.2, SOL.metalDark); box(0.14, 2.6, 0.14, -4.8, 1.6, 1.2, SOL.metalDark);
    box(4.6, 2.2, 0.06, -7.0, 1.5, 2.9, glassM);
    for (let z = -70; z < 22; z += 12) {
      box(0.22, 8.2, 0.22, -9.4, 4.4, z, SOL.metalDark); box(0.22, 8.2, 0.22, 9.4, 4.4, z, SOL.metalDark);
      box(18.8, 0.08, 0.08, 0, 7.9, z, SOL.metalDark, { noCast: true });
    }
    /* ---- the checkpoint at the edge of the city ---- */
    box(1.2, 1.2, 1.2, -6.4, 0.9, -28.0, stoneM(1, 1), { wall: true });
    box(1.2, 1.2, 1.2, 6.4, 0.9, -28.0, stoneM(1, 1), { wall: true });
    box(2.6, 2.8, 2.4, 7.2, 1.7, -31.0, new T.MeshStandardMaterial({ color: 0x5d6b4a, roughness: 0.8 }), { wall: true });
    box(2.9, 0.3, 2.7, 7.2, 3.25, -31.0, capM);
    /* ---- the great arch ---- */
    {
      const AZ = 25, AW = 30, AH = 22, AD = 6, OW = 10, OH = 13;
      const side = (AW - OW) / 2;
      box(side, AH, AD, -(OW / 2 + side / 2), 0.3 + AH / 2, AZ, stoneM(side, AH), { wall: true });
      box(side, AH, AD, (OW / 2 + side / 2), 0.3 + AH / 2, AZ, stoneM(side, AH), { wall: true });
      box(OW, AH - OH, AD, 0, 0.3 + OH + (AH - OH) / 2, AZ, stoneM(OW, AH - OH), { wall: true });
      for (let k = 0; k < 3; k++) box(OW * (1 - (k + 1) * 0.22), 0.8, AD, 0, 0.3 + OH - 0.4 - k * 0.0 + 0.0 - (k * 0.8), AZ, stoneM(4, 1));
      box(AW + 1.2, 1.2, AD + 1.0, 0, 0.3 + AH + 0.6, AZ, stoneM(AW, 1));
      box(AW + 1.6, 0.4, AD + 1.4, 0, 0.3 + AH + 1.4, AZ, capM);
      box(AW * 0.6, 2.6, AD * 0.7, 0, 0.3 + AH + 2.9, AZ, stoneM(AW, 2));
      box(AW * 0.6 + 0.4, 0.3, AD * 0.7 + 0.4, 0, 0.3 + AH + 4.3, AZ, capM);
      [-1, 1].forEach((sx) => {
        for (let y = 3; y < AH - 2; y += 4) box(0.6, 1.2, AD + 0.3, sx * (OW / 2 + side - 1.2), 0.3 + y, AZ, stoneM(1, 1));
        box(2.4, 0.4, 0.2, sx * (OW / 2 + side / 2), 0.3 + AH * 0.62, AZ - AD / 2 - 0.12, goldM);
      });
      box(6.0, 1.4, 0.2, 0, 0.3 + OH + 2.6, AZ - AD / 2 - 0.12, redM);
    }
    /* ---- the parade square: hall to the north, slabs east and west,
       a monument tower, flag masts, and a pyramid tower on the skyline ---- */
    slab(-34, -16, 36, 66, 24, 0);
    slab(44, 60, 34, 70, 22, 1);
    {
      /* the hall: a long colonnade under a stepped roof */
      const hz = 96;
      box(70, 14, 14, 14, 0.3 + 7, hz, stoneM(70, 14), { wall: true });
      for (let i = 0; i < 14; i++) box(1.1, 12, 1.1, -18 + i * 4.9, 0.3 + 6, hz - 7.6, stoneM(1, 6));
      box(72, 1.2, 17, 14, 0.3 + 14.6, hz - 1, stoneM(70, 1));
      box(74, 0.4, 18, 14, 0.3 + 15.4, hz - 1, capM);
      box(40, 3, 10, 14, 0.3 + 17, hz, stoneM(40, 3));
      box(41, 0.4, 11, 14, 0.3 + 18.7, hz, capM);
    }
    {
      /* (v17) a bronze group monument in front of the hall, socialist-realist
         in feel: a soldier with his rifle raised, a worker with a hammer, a
         farmer with a sheaf, a great flag sweeping behind them. Generic,
         featureless figures on a stepped granite plinth — nobody real. */
      const bronze = new T.MeshStandardMaterial({ color: 0x5e4426, roughness: 0.38, metalness: 0.75, envMapIntensity: 0.9 });
      const bronzeD = new T.MeshStandardMaterial({ color: 0x46321c, roughness: 0.45, metalness: 0.7 });
      const mx = 16, mz = 80, sc = 3.6;
      box(20, 1.2, 9, mx, 0.9, mz, stoneM(20, 1));
      box(16, 1.4, 7, mx, 2.2, mz, stoneM(16, 1));
      box(13, 2.4, 5.4, mx, 4.1, mz, stoneM(13, 2));
      box(13.4, 0.3, 5.8, mx, 5.45, mz, capM);
      box(6.4, 1.0, 0.2, mx, 4.1, mz - 2.82, goldM);
      const base = 5.3;
      const fig = (x, z, rot, pose) => {
        const g = new T.Group();
        const B = (w, h, d, px, py, pz, m, rx, rz) => { const o = new T.Mesh(new T.BoxGeometry(w * sc, h * sc, d * sc), m || bronze); o.position.set(px * sc, py * sc, pz * sc); if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz; o.castShadow = true; g.add(o); return o; };
        B(0.26, 0.9, 0.3, -0.16, 0.45, 0, bronzeD, 0.12);                 /* legs, mid-stride */
        B(0.26, 0.9, 0.3, 0.16, 0.45, -0.05, bronzeD, -0.18);
        B(0.8, 0.5, 0.5, 0, 0.75, 0.02, bronze);                           /* coat skirt */
        B(0.68, 0.75, 0.42, 0, 1.25, 0, bronze);                           /* torso */
        B(0.32, 0.36, 0.34, 0, 1.82, 0, bronze);                           /* head */
        B(0.4, 0.1, 0.42, 0, 2.02, 0.02, bronzeD);                         /* cap brim */
        B(0.34, 0.12, 0.36, 0, 2.09, 0, bronzeD);
        if (pose === "rifle") {
          B(0.18, 0.62, 0.2, 0.42, 1.9, 0, bronze, 0, -0.35);            /* raised right arm */
          B(0.08, 1.2, 0.1, 0.62, 2.5, 0, bronzeD, 0, -0.25);            /* rifle held high */
          B(0.18, 0.6, 0.2, -0.44, 1.2, 0.08, bronze, -0.4, 0.15);
        } else if (pose === "hammer") {
          B(0.18, 0.62, 0.2, -0.44, 1.92, 0, bronze, 0, 0.4);
          B(0.07, 0.8, 0.07, -0.66, 2.42, 0, bronzeD, 0, 0.3);
          B(0.34, 0.18, 0.18, -0.78, 2.8, 0, bronzeD);
          B(0.18, 0.6, 0.2, 0.44, 1.2, 0.08, bronze, -0.3, -0.15);
        } else {
          B(0.18, 0.6, 0.2, 0.44, 1.5, 0.18, bronze, -0.9, -0.1);
          B(0.3, 0.6, 0.3, 0.4, 1.75, 0.42, bronzeD, -0.4, 0);            /* sheaf */
          B(0.18, 0.6, 0.2, -0.44, 1.2, 0.08, bronze, -0.2, 0.15);
        }
        g.position.set(x, base, z);
        g.rotation.y = rot;
        S.add(g);
      };
      MONU = { figs: [], x: mx, z: mz, top: base + 2.2 * sc, base: base, broken: false };
      fig(mx - 3.6, mz + 0.2, Math.PI + 0.25, "hammer");
      fig(mx, mz - 0.4, Math.PI, "rifle");
      fig(mx + 3.6, mz + 0.2, Math.PI - 0.25, "sheaf");
      S.children.slice(-3).forEach((o) => MONU.figs.push(o));
      /* the flag behind them: a pole leaning back and a cloth of stepped blocks */
      const pole = new T.Mesh(new T.CylinderGeometry(0.12, 0.14, 13, 8), bronzeD);
      pole.position.set(mx - 1.0, base + 6.0, mz + 1.6); pole.rotation.z = 0.28; pole.castShadow = true; S.add(pole);
      MONU.figs.push(pole);
      for (let i = 0; i < 6; i++) {
        const c = new T.Mesh(new T.BoxGeometry(1.4, 3.2 - i * 0.18, 0.3), redM);
        MONU.figs.push(c);
        c.position.set(mx - 2.2 + i * 1.3, base + 9.6 - i * 0.35 + Math.sin(i * 1.3) * 0.3, mz + 1.6 + Math.sin(i) * 0.4);
        c.castShadow = true;
        S.add(c);
      }
      [mx - 3.6, mx, mx + 3.6].forEach((x) => box(1.2 * sc * 0.6, 0.12, 0.8, x, base + 2.15 * sc, mz, capM, { noCast: true }));
    }
    {
      /* monument tower: a square shaft on a stepped base, a red beacon on top */
      const tx = 16, tz = 124;
      box(14, 3, 14, tx, 1.8, tz, stoneM(14, 3));
      box(10, 3, 10, tx, 4.8, tz, stoneM(10, 3));
      box(5, 58, 5, tx, 6.3 + 29, tz, stoneM(5, 30));
      box(6.4, 2, 6.4, tx, 6.3 + 58 + 1, tz, goldM);
      const flame = new T.Mesh(new T.BoxGeometry(2.6, 6, 2.6), new T.MeshBasicMaterial({ color: 0xff5a2a, toneMapped: false }));
      flame.position.set(tx, 6.3 + 58 + 5, tz);
      S.add(flame);
      const fl2 = new T.Mesh(new T.BoxGeometry(1.4, 4, 1.4), new T.MeshBasicMaterial({ color: 0xffd060, toneMapped: false }));
      fl2.position.set(tx, 6.3 + 58 + 8, tz);
      S.add(fl2);
    }
    {
      /* pyramid hotel on the skyline, stepped in blocks */
      const px = -70, pz = 210;
      for (let i = 0; i < 16; i++) {
        const w = 44 - i * 2.6;
        box(w, 7, w, px, 3.8 + i * 7, pz, i % 3 === 2 ? glassM : stoneM(w, 7), { noCast: true });
      }
      box(4, 10, 4, px, 3.8 + 16 * 7 + 4, pz, glassM, { noCast: true });
    }
    /* distant blocks so the snow haze always has a skyline in it */
    const R2 = rng(909);
    for (let i = 0; i < 30; i++) {
      const x = (R2() - 0.5) * 260, z = 140 + R2() * 90;
      if (Math.abs(x + 70) < 30 && z > 180) continue;
      const w = 12 + R2() * 14, h = 18 + R2() * 30;
      box(w, h, 12, x, 0.3 + h / 2, z, aptM(w, h), { noCast: true });
      box(w + 0.4, 0.4, 12.4, x, 0.3 + h + 0.2, z, capM, { noCast: true });
    }
    /* flag masts round the square */
    const flags = [];
    [[-4, 52], [28, 52], [-4, 74], [28, 74]].forEach(([x, z]) => {
      const pole = new T.Mesh(new T.CylinderGeometry(0.08, 0.1, 10, 8), SOL.poleGray || SOL.metalDark);
      pole.position.set(x, 5.3, z); pole.castShadow = true; S.add(pole);
      const f = makeFlagEx("kp", x + 1.3, 9.2, z, 2.4, 1.6);
      f.children[0].visible = false;
      S.add(f);
    });
    /* ---- vehicles and snowy pines ---- */
    const tr1 = makeTruck(-5.6, -12.0); tr1.rotation.y = 0.2; S.add(tr1);
    const tr2 = makeTruck(6.8, 40.4); tr2.rotation.y = -0.9; S.add(tr2);
    S.add(makeJeep(-6.2, 18.4, 0.4));
    if (typeof makeArmyTruck === "function") makeArmyTruck(S, 30, 48, -1.2);
    const VT = voxBatch();
    for (let z = -72; z < 20; z += 9) {
      [-11.2, 11.2].forEach((x, k) => {
        voxPine(VT, x, 0.3, z + k * 4.5, 6 + ((z * 7 + k * 3) % 3), 400 + z * 3 + k);
        trunks.push([x, z + k * 4.5]);
      });
    }
    [[-12, 44], [-12, 56], [38, 44], [38, 58], [-14, 80], [40, 80]].forEach(([x, z], i) => { voxPine(VT, x, 0.3, z, 7, 900 + i); trunks.push([x, z]); });
    VT.flush(S, "pyPines");
    /* snow on the pines: a white cap on each tier is cheap with a second batch */
    const VS = voxBatch();
    const vm = voxMats();
    for (let z = -72; z < 20; z += 9) [-11.2, 11.2].forEach((x, k) => { for (let t = 0; t < 3; t++) VS.cube(vm.plain, x, 2.6 + t * 1.9, z + k * 4.5, 2.6 - t * 0.7, 0.18, 2.6 - t * 0.7, 0xf2f6fa, t * 0.4); });
    VS.flush(S, "pySnowCaps");
    /* snow drifts along the walls */
    for (let i = 0; i < 40; i++) {
      const x = (R() < 0.5 ? -1 : 1) * (12.4 + R() * 0.6), z = -76 + R() * 92;
      box(0.9 + R() * 1.4, 0.3 + R() * 0.3, 1.6 + R() * 2, x, 0.35, z, capM, { noCast: true });
    }
    /* ---- paratrooper landing sandbags ---- */
    landCovers = [];
    [[-4.2, -10.2], [2.0, -9.4], [5.8, -11.2], [8.6, 58.2], [13.0, 60.0], [17.0, 57.2], [12.0, 62.6]].forEach(([x, z]) => {
      const c = landCover(x, z, 2.2); S.add(c.g); landCovers.push(c);
    });
    /* clouds */
    const clouds = [];
    for (let i = 0; i < 9; i++) {
      const c = makeCloud(-90 + i * 22, 40 + Math.random() * 12, 60 + (i % 3) * 30, 6 + Math.random() * 3);
      c.scale.y = 0.4;
      S.add(c); clouds.push(c);
    }
    const ally = makeAlly();
    ally.position.set(4.6, 0.3, -41.6);
    S.add(ally);
    S.traverse((o) => { if (o.userData && o.userData.cloth) flags.push(o); });
    walkBlockers = [];
    S.traverse((o) => {
      if (!o.isMesh) return;
      if (o.userData && (o.userData.wall || o.userData.solid)) { const bb = new T.Box3().setFromObject(o); if (bb.max.y > 0.6) walkBlockers.push(bb); }
    });
    if (coverRoot) coverRoot.traverse((o) => { if (o.userData && o.userData.cover) walkBlockers.push(new T.Box3().setFromObject(o)); });
    landCovers.forEach((c) => walkBlockers.push(new T.Box3().setFromObject(c.g)));
    if (ctx.renderer) ctx.renderer.toneMappingExposure = 1.05;
    applyMood(ctx, S, sky, clouds, moodOverride() || "snow");
    dress = { root: S, sky, flags, clouds, barrels: [], ally, truck1: null, trunks };
    return dress;
  }

  /* ================= v21: THE CITY STAGES =================
     The campaign now follows the war: Seoul falls, the line is pushed back
     through Daejeon, Daegu, Gwangju and Gyeongju to the Busan perimeter,
     then the Incheon landing turns it, Seoul is retaken and the advance
     goes north. Every new city is one data block (STAGES[n].city) laid over
     a shared avenue: a 124 m boulevard with shopfront blocks or a seafront
     on either side, street furniture, a city sign, and the landmarks that
     make the place read at a glance. Waves come from one generator, so each
     city plays on the same tested footprint: the street is 20 m wide, the
     rail runs down its middle and every man stands inside the kerbs. */
  function cityPath(pre) {
    const pts = (pre || []).slice();
    for (let z = CITY_Z0; z <= 60; z += 6) pts.push([+cityX(z).toFixed(2), z]);
    return pts;
  }
  function cityBoss() {
    const x = cityX(56);
    return { hold: [+x.toFixed(2), 56], look: [+x.toFixed(2), 2.4, 68], spots: [[-5.6, 11.2], [-0.6, 10.6], [4.6, 11.0]] };
  }
  /* seven zones down the avenue, members from a seeded table so a city
     always plays the same, with bikes, a helicopter and paratroopers in
     their own zones */
  function genWaves(seed, names, radios, opt) {
    const R = rng(seed);
    const o = opt || {};
    const zs = [-50, -34, -18, -2, 14, 30, 44];
    const lats = [-6.6, -4.4, -2.4, 2.4, 4.4, 6.6];
    const covers = ["sandbag", "crate", "barrier", "crates", "sandbag", "bunker", "crate"];
    const picksK = ["ammo", "supply", "grenade", "smg", "shotgun", "ammo", "life"];
    return zs.map((z, i) => {
      const x = +cityX(z).toFixed(2);
      const n = 3 + (i > 2 ? 1 : 0) + (i > 4 ? 1 : 0);
      const used = [];
      const members = [];
      for (let k = 0; k < n; k++) {
        let lat;
        do { lat = lats[(R() * lats.length) | 0]; } while (used.indexOf(lat) >= 0 && used.length < lats.length);
        used.push(lat);
        const role = k === 0 && i > 1 ? "tough" : (k === 1 && i % 2 ? "throw" : "weak");
        members.push({ role: role, lat: lat + (R() - 0.5) * 0.5, dep: 8.2 + R() * 4.2, cover: covers[(i + k) % covers.length] });
      }
      if (o.bikes && (i === 1 || i === 4)) {
        const side = R() < 0.5 ? -1 : 1;
        members.push({ role: "weak", lat: side * 5.6, dep: 11.6, cover: "crate", bike: true, run: { from: [x + side * 3.0, z + 34], dur: 3.8, delay: 1.0 } });
      }
      if (o.hostage && i === 3) members.push({ role: "hostage", lat: 0.8, dep: 10.4 });
      if (o.heli !== false && (i === 2 || i === 5)) members.push({ air: "heli", lat: (R() - 0.5) * 3, dep: 22, y: 9.8, orbit: 6 });
      if (i === 6 || (o.paras && i === 4)) {
        [-3.6, 1.2, 4.8].forEach((pl) => members.push({ air: "para", role: "para", lat: pl, dep: 13 + R() * 2, y: 8 + R(), land: [pl * 0.9, 10.5 + R()] }));
      }
      return {
        id: i + 1, zone: names[Math.min(names.length - 1, (i / 7 * names.length) | 0)], hold: [x, z], yaw: 0,
        look: [x, 1.9 + (i === 2 || i === 5 ? 0.8 : 0), z + 14], time: 26 + i,
        radio: radios[i % radios.length],
        picks: [[-3.2, 5.8, picksK[i % picksK.length]], [3.4, 6.4, picksK[(i + 3) % picksK.length]]],
        members: members
      };
    });
  }

  /* ---- shared materials and little builders for the city landmarks ---- */
  const CM = {};
  /* (v26) the generic block surface for every built-up prop: 8×8 cells of
     slightly varied stone/paint per 1.6 m, mortar lines, chips and stains;
     tinted by the material colour, voxelized and given relief like the rest
     of the world. UVs are scaled to world metres (bx/cyl) so it never
     stretches. */
  function propTex() {
    return ctex("propVox", 128, 128, (g, w, h) => {
      const r = rng(4242);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        const v = 212 + ((r() * 40) | 0) - (r() < 0.08 ? 40 : 0);
        g.fillStyle = "rgb(" + v + "," + v + "," + (v - 4) + ")";
        g.fillRect(x * 16, y * 16, 16, 16);
      }
      g.fillStyle = "rgba(0,0,0,.10)";
      for (let k = 0; k <= 8; k++) { g.fillRect(0, k * 16 - 1, w, 2); g.fillRect(k * 16 + (k % 2 ? 8 : 0) - 1, 0, 2, h); }
      for (let i = 0; i < 26; i++) { g.fillStyle = "rgba(" + (r() < 0.5 ? "60,50,40," : "255,255,255,") + (0.06 + r() * 0.1) + ")"; g.fillRect((r() * 16 | 0) * 8, (r() * 16 | 0) * 8, 8, 8 + (r() < 0.3 ? 16 : 0)); }
    });
  }
  function worldUV(geo, sc) {
    /* box: scale each face's 0..1 uvs by that face's size in metres */
    const p = geo.parameters || {};
    const uv = geo.attributes.uv;
    if (!uv) return geo;
    const k = 1 / (sc || 1.6);
    if (geo.type === "BoxGeometry") {
      const W = p.width || 1, H = p.height || 1, D = p.depth || 1;
      const faces = [[D, H], [D, H], [W, D], [W, D], [W, H], [W, H]];
      const per = uv.count / 6;
      for (let f = 0; f < 6; f++) for (let i = 0; i < per; i++) { const j = f * per + i; uv.setXY(j, uv.getX(j) * faces[f][0] * k, uv.getY(j) * faces[f][1] * k); }
    } else if (geo.type === "CylinderGeometry") {
      const C = Math.PI * ((p.radiusTop || 1) + (p.radiusBottom || 1)), H = p.height || 1;
      for (let j = 0; j < uv.count; j++) uv.setXY(j, uv.getX(j) * C * k, uv.getY(j) * H * k);
    } else {
      for (let j = 0; j < uv.count; j++) uv.setXY(j, uv.getX(j) * 4 * k, uv.getY(j) * 4 * k);
    }
    uv.needsUpdate = true;
    return geo;
  }
  function cmat(c, r, m, o) {
    const k = c + "|" + r + "|" + (m || 0) + "|" + (o ? JSON.stringify(o) : "");
    if (CM[k]) return CM[k];
    const plain = (o && o.plain) || (m || 0) > 0.45 || r < 0.2;
    const p = Object.assign({ color: new T.Color(c).convertSRGBToLinear(), roughness: r, metalness: m || 0 }, o || {});
    delete p.plain;
    if (!plain && !p.map) { const t = propTex().clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; p.map = t; }
    if (p.emissive != null) p.emissive = new T.Color(p.emissive).convertSRGBToLinear();
    return (CM[k] = new T.MeshStandardMaterial(p));
  }
  function bx(S, w, h, d, x, y, z, m, o) {
    const g = new T.Mesh(worldUV(new T.BoxGeometry(w, h, d)), m);
    g.position.set(x, y, z);
    if (o && o.ry) g.rotation.y = o.ry;
    if (o && o.rz) g.rotation.z = o.rz;
    if (o && o.rx) g.rotation.x = o.rx;
    g.castShadow = !(o && o.noCast);
    g.receiveShadow = true;
    g.userData.noBlock = !(o && o.wall);
    if (o && o.wall) g.userData.wall = 1;
    S.add(g);
    return g;
  }
  function cyl(S, rt, rb, h, x, y, z, m, seg, o) {
    const g = new T.Mesh(worldUV(new T.CylinderGeometry(rt, rb, h, seg || 16)), m);
    g.position.set(x, y, z);
    g.castShadow = !(o && o.noCast);
    g.receiveShadow = true;
    g.userData.noBlock = !(o && o.wall);
    if (o && o.wall) g.userData.wall = 1;
    S.add(g);
    return g;
  }
  function vSignTex(key, text, bg, fg) {
    return ctex(key, 96, 320, (g, w, h) => {
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
      const ch = Array.from(text);
      const fs = Math.min(64, (h - 40) / ch.length);
      g.font = "900 " + fs + "px Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
      ch.forEach((c, i) => g.fillText(c, w / 2, 24 + fs * (i + 0.5)));
    }, { smooth: true });
  }
  function lmCitySign(S, x, z, title, sub, ry, accent) {
    const g = new T.Group();
    const stone = cmat(0xb9b3a6, 0.9);
    bx(g, 5.6, 2.4, 0.9, 0, 1.5, 0, stone);
    bx(g, 5.9, 0.3, 1.1, 0, 2.85, 0, cmat(0x9d978a, 0.9));
    bx(g, 6.0, 0.4, 1.2, 0, 0.5, 0, cmat(0x8f897c, 0.9));
    const t = ctex("citySign-" + title, 640, 220, (c, w, h) => {
      c.fillStyle = "#ece6d8"; c.fillRect(0, 0, w, h);
      c.fillStyle = accent || "#2a6a3a"; c.beginPath(); c.arc(100, h / 2, 62, 0, 7); c.fill();
      c.fillStyle = "#ece6d8"; c.beginPath(); c.arc(100, h / 2, 30, 0, 7); c.fill();
      c.fillStyle = "#2a2a2a"; c.textBaseline = "middle";
      c.font = "900 82px Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"; c.fillText(title, 190, h * 0.38);
      c.font = "800 42px Pretendard, system-ui, sans-serif"; c.fillStyle = "#4a4a4a"; c.fillText(sub, 194, h * 0.74);
    }, { smooth: true });
    [1, -1].forEach((s) => {
      const p = new T.Mesh(new T.PlaneGeometry(5.2, 1.8), new T.MeshStandardMaterial({ map: t, roughness: 0.7 }));
      p.position.set(0, 1.55, s * 0.46);
      if (s < 0) p.rotation.y = Math.PI;
      g.add(p);
    });
    g.position.set(x, 0.3, z);
    g.rotation.y = ry || 0;
    g.traverse((o) => { o.userData.noBlock = 1; });
    S.add(g);
    return g;
  }
  function lmBanner(S, x, z, text, bg, h) {
    const H = h || 7;
    cyl(S, 0.08, 0.1, H + 1, x, 0.3 + (H + 1) / 2, z, cmat(0x9aa0a6, 0.4, 0.7), 8);
    const p = new T.Mesh(new T.PlaneGeometry(1.3, H * 0.62), new T.MeshStandardMaterial({ map: vSignTex("vb-" + text + bg, text, bg, "#ffffff"), roughness: 0.8, side: T.DoubleSide }));
    p.position.set(x + 0.72, 0.3 + H * 0.62, z);
    p.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    p.userData.noBlock = 1;
    S.add(p);
  }
  /* a tower on a hill or a plaza: shaft, observation pod, antenna */
  function lmTower(S, x, z, h, style) {
    const white = cmat(0xeceae4, 0.5, 0.1), grey = cmat(0xa8adb2, 0.5, 0.4), glass = cmat(0x5a8ab0, 0.12, 0.6);
    const base = style === "hill" ? 0 : 0.3;
    if (style === "hanbit") {
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        const leg = bx(S, 0.5, h * 0.5, 0.5, x + Math.cos(a) * 2.2, base + h * 0.24, z + Math.sin(a) * 2.2, white);
        leg.rotation.z = Math.cos(a) * 0.08; leg.rotation.x = -Math.sin(a) * 0.08;
      }
      cyl(S, 0.7, 1.2, h * 0.55, x, base + h * 0.5, z, white, 12);
      cyl(S, 3.4, 3.0, 1.6, x, base + h * 0.72, z, glass, 20);
      cyl(S, 3.7, 3.7, 0.35, x, base + h * 0.72 + 0.95, z, white, 20);
      cyl(S, 3.2, 3.2, 0.3, x, base + h * 0.72 - 0.95, z, white, 20);
      cyl(S, 0.18, 0.3, h * 0.35, x, base + h * 0.92, z, grey, 8);
    } else {
      cyl(S, style === "slim" ? 0.8 : 1.1, style === "slim" ? 1.3 : 1.6, h * 0.72, x, base + h * 0.36, z, white, 14);
      cyl(S, 2.8, 2.2, 2.2, x, base + h * 0.76, z, glass, 18);
      cyl(S, 3.0, 3.0, 0.4, x, base + h * 0.76 + 1.3, z, white, 18);
      cyl(S, 2.0, 2.6, 0.6, x, base + h * 0.76 - 1.4, z, white, 18);
      cyl(S, 0.2, 0.35, h * 0.3, x, base + h * 0.95, z, grey, 8);
      for (let k = 0; k < 3; k++) cyl(S, 0.6 - k * 0.15, 0.6 - k * 0.15, 0.25, x, base + h * (0.98 + k * 0.05), z, k % 2 ? white : cmat(0xd8483a, 0.5), 10);
    }
  }
  /* a pavilion (누각): stone plinth or a fortress wall, red columns, a
     painted bracket band and a hipped roof whose corners lift */
  function lmPavilion(S, x, z, w, d, opt) {
    const o = opt || {};
    const stone = cmat(0xb8b0a0, 0.9), red = cmat(0x9a2a20, 0.6), dan = cmat(0x2f7a6e, 0.6), tile = cmat(0x3a3e44, 0.7), white = cmat(0xe8e2d4, 0.8);
    let y0 = 0.3;
    if (o.wall) {
      bx(S, w + 6, o.wall, d + 4, x, 0.3 + o.wall / 2, z, stone, { wall: 1 });
      bx(S, w + 6.4, 0.4, d + 4.4, x, 0.3 + o.wall + 0.2, z, cmat(0x9e9686, 0.9));
      y0 += o.wall + 0.4;
    } else {
      bx(S, w + 1.6, 0.9, d + 1.6, x, 0.75, z, stone);
      y0 += 0.9;
    }
    const cols = Math.max(3, Math.round(w / 2.6));
    for (let i = 0; i < cols; i++) [-1, 1].forEach((s) => cyl(S, 0.22, 0.25, 3.2, x - w / 2 + (i + 0.5) * (w / cols), y0 + 1.6, z + s * d / 2, red, 10));
    bx(S, w + 0.4, 0.5, d + 0.4, x, y0 + 3.4, z, dan);
    bx(S, w + 0.6, 0.18, d + 0.6, x, y0 + 3.15, z, red);
    if (o.rail) for (let i = 0; i < cols * 2; i++) bx(S, 0.08, 0.7, 0.08, x - w / 2 + (i + 0.5) * (w / cols / 2), y0 + 0.35, z + d / 2 + 0.05, red);
    /* roof: three stepped slabs, then the lifted corners */
    bx(S, w + 3.2, 0.35, d + 3.2, x, y0 + 3.85, z, tile);
    bx(S, w + 2.2, 0.55, d + 2.0, x, y0 + 4.25, z, tile);
    bx(S, w + 0.6, 0.6, d * 0.5, x, y0 + 4.8, z, tile);
    bx(S, w + 1.2, 0.22, 0.35, x, y0 + 5.15, z, white);
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
      const c = bx(S, 1.6, 0.3, 0.5, x + sx * (w / 2 + 1.5), y0 + 4.05, z + sz * (d / 2 + 1.5), tile, { ry: sx * sz * 0.78 });
      c.rotation.z = sx * 0.28;
    }));
  }
  /* a granite pagoda: two-step base, five storeys of body and eaves, finial */
  function lmPagoda(S, x, z, s, tiers) {
    const g1 = cmat(0xc8c0ae, 0.92), g2 = cmat(0xb2aa98, 0.92);
    let y = 0.3;
    bx(S, 7 * s, 1.0 * s, 7 * s, x, y + 0.5 * s, z, g2); y += 1.0 * s;
    bx(S, 5.8 * s, 1.4 * s, 5.8 * s, x, y + 0.7 * s, z, g1); y += 1.4 * s;
    bx(S, 6.2 * s, 0.3 * s, 6.2 * s, x, y + 0.15 * s, z, g2); y += 0.3 * s;
    const n = tiers || 5;
    for (let i = 0; i < n; i++) {
      const k = 1 - i * 0.12;
      const bh = (i === 0 ? 2.2 : 1.1) * s;
      bx(S, 3.6 * s * k, bh, 3.6 * s * k, x, y + bh / 2, z, g1); y += bh;
      bx(S, 5.0 * s * k, 0.28 * s, 5.0 * s * k, x, y + 0.14 * s, z, g2); y += 0.28 * s;
      bx(S, 4.4 * s * k, 0.22 * s, 4.4 * s * k, x, y + 0.11 * s, z, g2); y += 0.22 * s;
    }
    cyl(S, 0.25 * s, 0.4 * s, 2.4 * s, x, y + 1.2 * s, z, cmat(0x7a6e58, 0.6, 0.3), 8);
    for (let k = 0; k < 3; k++) cyl(S, 0.6 * s, 0.6 * s, 0.18 * s, x, y + (0.6 + k * 0.6) * s, z, cmat(0x8a7c62, 0.6, 0.3), 10);
  }
  /* 첨성대-like observatory: courses of stone that swell and narrow, a square
     window half-way up, a well-frame on top */
  function lmObservatory(S, x, z, s) {
    const g = cmat(0xc7bba0, 0.95), g2 = cmat(0xa99d84, 0.95);
    bx(S, 6.4 * s, 0.6 * s, 6.4 * s, x, 0.3 + 0.3 * s, z, g2);
    let y = 0.3 + 0.6 * s;
    for (let i = 0; i < 27; i++) {
      const t = i / 26;
      const r = (2.6 - 1.2 * Math.pow(t, 1.6) + 0.3 * Math.sin(t * 3.14)) * s;
      cyl(S, r, r * 1.02, 0.36 * s, x, y + 0.18 * s, z, i % 2 ? g : g2, 14);
      y += 0.36 * s;
    }
    bx(S, 1.0 * s, 1.0 * s, 0.3 * s, x, 0.3 + 5.4 * s, z - 2.1 * s, cmat(0x2a241c, 0.9));
    [-1, 1].forEach((k) => { bx(S, 3.0 * s, 0.4 * s, 0.4 * s, x, y + 0.2 * s, z + k * 1.2 * s, g2); bx(S, 0.4 * s, 0.4 * s, 3.0 * s, x + k * 1.2 * s, y + 0.6 * s, z, g2); });
  }
  function lmDome(S, x, z, r) {
    const glass = new T.MeshStandardMaterial({ color: new T.Color(0xbfd8ea).convertSRGBToLinear(), roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.55 });
    const geo = new T.IcosahedronGeometry(r, 2);
    const m = new T.Mesh(geo, glass);
    m.position.set(x, 0.3, z);
    m.userData.noBlock = 1;
    S.add(m);
    const lines = new T.LineSegments(new T.EdgesGeometry(geo, 1), new T.LineBasicMaterial({ color: 0xe8eef2 }));
    lines.position.copy(m.position);
    S.add(lines);
    cyl(S, r * 1.04, r * 1.04, 1.2, x, 0.9, z, cmat(0xd8d8d2, 0.8), 28);
  }
  function lmStadium(S, x, z, rx, rz) {
    const c = cmat(0xd8d8d2, 0.8), g = cmat(0x6aa0c8, 0.2, 0.5), roof = cmat(0xf2f2ee, 0.5, 0.1);
    const n = 40;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const px = x + Math.cos(a) * rx, pz = z + Math.sin(a) * rz;
      const seg = (2 * Math.PI * Math.sqrt((rx * rx + rz * rz) / 2)) / n + 0.3;
      bx(S, seg, 9, 2.2, px, 4.8, pz, i % 4 ? c : g, { ry: -a + Math.PI / 2 });
      bx(S, seg, 0.4, 6, x + Math.cos(a) * (rx - 2), 9.6, z + Math.sin(a) * (rz - 2), roof, { ry: -a + Math.PI / 2, noCast: true });
    }
  }
  /* a suspension bridge across the water: two towers, deck, main cables,
     hangers; laid out along x */
  function lmSuspBridge(S, x0, x1, z, h) {
    const wh = cmat(0xf0f0ec, 0.5, 0.2), deck = cmat(0x9aa0a4, 0.7);
    const L = x1 - x0, cx = (x0 + x1) / 2;
    bx(S, L, 0.8, 6, cx, 4.2, z, deck);
    bx(S, L, 0.3, 0.2, cx, 5.0, z + 2.9, wh); bx(S, L, 0.3, 0.2, cx, 5.0, z - 2.9, wh);
    const tx = [x0 + L * 0.28, x0 + L * 0.72];
    tx.forEach((t) => {
      [-1, 1].forEach((s) => bx(S, 1.2, h, 1.2, t, h / 2, z + s * 3.2, wh));
      bx(S, 1.4, 1.2, 7.6, t, h * 0.62, z, wh); bx(S, 1.4, 1.2, 7.6, t, h - 1, z, wh);
      for (let k = 0; k < 6; k++) bx(S, 0.3, 0.3, 0.3, t, h - 0.2, z + (k - 2.5) * 1.2, cmat(0xfff2c0, 0.4, 0, { emissive: 0xfff2c0, emissiveIntensity: 0.6 }));
    });
    const cable = (a, b, sag, zz) => {
      const pts = [];
      for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new T.Vector3(a + (b - a) * t, (h - 0.5) - sag * 4 * t * (1 - t), zz)); }
      const line = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0xe8ecef }));
      S.add(line);
      for (let i = 1; i < 24; i += 2) {
        const p = pts[i];
        const hl = new T.Line(new T.BufferGeometry().setFromPoints([p, new T.Vector3(p.x, 4.6, zz)]), new T.LineBasicMaterial({ color: 0xd0d6da }));
        S.add(hl);
      }
    };
    [-3.2, 3.2].forEach((zz) => {
      cable(x0, tx[0], 3, zz);
      cable(tx[0], tx[1], h * 0.55, zz);
      cable(tx[1], x1, 3, zz);
    });
    for (let k = 0; k < 6; k++) [-1, 1].forEach((s) => bx(S, 1.6, 4.2, 1.6, x0 + L * (k + 0.5) / 6, 2.0, z + s * 2, deck));
  }
  function lmLighthouse(S, x, z, col) {
    const c = cmat(col || 0xc8302a, 0.5), w = cmat(0xf2f0ea, 0.6);
    bx(S, 4, 1.4, 4, x, 1.0, z, cmat(0x9a9890, 0.9));
    for (let k = 0; k < 4; k++) cyl(S, 1.1 - k * 0.12, 1.2 - k * 0.12, 1.6, x, 2.5 + k * 1.6, z, k % 2 ? w : c, 14);
    cyl(S, 0.9, 0.9, 1.0, x, 9.1, z, cmat(0xfff6c8, 0.2, 0, { emissive: 0xffe9a0, emissiveIntensity: 0.9 }), 12);
    cyl(S, 0.2, 1.1, 0.8, x, 10.0, z, c, 12);
  }
  /* glass towers with a lit crown */
  function lmGlassTowers(S, list) {
    const mats = [cmat(0x5d8cb4, 0.12, 0.65), cmat(0x7aa6c8, 0.15, 0.6), cmat(0x4a7a9c, 0.1, 0.7)];
    list.forEach(([x, z, w, d, h, k]) => {
      const t = bx(S, w, h, d, x, 0.3 + h / 2, z, mats[(k || 0) % 3]);
      for (let y = 3.2; y < h; y += 3.2) bx(S, w + 0.08, 0.12, d + 0.08, x, 0.3 + y, z, cmat(0xd8e2ea, 0.5, 0.3), { noCast: true });
      bx(S, w * 0.6, 1.6, d * 0.6, x, 0.3 + h + 0.8, z, cmat(0xc8ccd0, 0.6));
      t.userData.noBlock = 1;
    });
  }
  /* a tapering four-sided tower with the top cut on a slant */
  function lmTaperTower(S, x, z, h) {
    const g = new T.CylinderGeometry(3.2, 9.0, h, 4, 1);
    g.rotateY(Math.PI / 4);
    const m = new T.Mesh(g, cmat(0x6f9ac0, 0.08, 0.7));
    m.position.set(x, 0.3 + h / 2, z);
    S.add(m);
    for (let y = 4; y < h; y += 4) {
      const k = 1 - y / h;
      const r = 3.2 + (9.0 - 3.2) * k;
      const ring = new T.Mesh(new T.CylinderGeometry(r * 1.005, r * 1.005, 0.15, 4, 1, true), cmat(0xdfe8ef, 0.5, 0.3));
      ring.rotation.y = Math.PI / 4;
      ring.position.set(x, 0.3 + y, z);
      S.add(ring);
    }
  }
  function lmSculptureS(S, x, z, s) {
    const m = cmat(0xd8d4cc, 0.6, 0.2);
    const t1 = new T.Mesh(new T.TorusGeometry(3 * s, 0.9 * s, 10, 24, Math.PI), m);
    t1.position.set(x, 3 * s + 0.3, z); S.add(t1);
    const t2 = new T.Mesh(new T.TorusGeometry(3 * s, 0.9 * s, 10, 24, Math.PI), m);
    t2.rotation.z = Math.PI; t2.position.set(x + 6 * s, 3 * s + 0.3 + 6 * s * 0, z); t2.position.y = 9 * s + 0.3;
    t2.position.x = x; S.add(t2);
    bx(S, 8 * s, 0.6, 3 * s, x, 0.6, z, cmat(0x9a968c, 0.9));
  }
  /* a tall stone memorial of two leaning pillars joined near the top */
  function lmTwinPillar(S, x, z, h) {
    const st = cmat(0xd6d0c2, 0.9);
    bx(S, 14, 0.8, 14, x, 0.7, z, cmat(0xb6ae9c, 0.9));
    bx(S, 10, 0.8, 10, x, 1.5, z, cmat(0xc4bca8, 0.9));
    [-1, 1].forEach((s) => bx(S, 2.0, h, 2.6, x + s * 1.6, 1.9 + h / 2, z, st, { rz: -s * 0.035 }));
    bx(S, 5.6, 1.2, 2.8, x, 1.9 + h * 0.86, z, st);
    bx(S, 3.4, 0.8, 2.8, x, 1.9 + h * 0.6, z, st);
  }
  function lmHedgehog(S, x, z) {
    const m = cmat(0x5a4a3e, 0.6, 0.5);
    [[0, 0.62], [Math.PI / 2, 0.62], [0, -0.62]].forEach(([ry, rz], i) => {
      const b = bx(S, 0.2, 2.4, 0.2, x, 1.0, z, m, { noCast: false });
      b.rotation.set(i === 2 ? 0.62 : 0, ry, i === 2 ? 0 : rz);
    });
  }
  /* a grey warship: knife bow, superstructure, turrets, mast and a hull number */
  function lmShip(S, x, z, ry, num, sc) {
    const g = new T.Group();
    const s = sc || 1;
    const hull = cmat(0x6c747a, 0.6, 0.3), deck = cmat(0x8a9094, 0.7), dark = cmat(0x3a4044, 0.6);
    const shp = new T.Shape();
    shp.moveTo(0, -22 * s); shp.lineTo(3.4 * s, -10 * s); shp.lineTo(3.6 * s, 14 * s); shp.lineTo(2.6 * s, 20 * s); shp.lineTo(-2.6 * s, 20 * s); shp.lineTo(-3.6 * s, 14 * s); shp.lineTo(-3.4 * s, -10 * s); shp.lineTo(0, -22 * s);
    const hg = new T.ExtrudeGeometry(shp, { depth: 4.2 * s, bevelEnabled: false });
    hg.rotateX(-Math.PI / 2);
    const hm = new T.Mesh(hg, hull); hm.position.y = -1.6 * s; g.add(hm);
    bx(g, 6 * s, 3 * s, 12 * s, 0, 3.6 * s, 4 * s, deck);
    bx(g, 4.6 * s, 2.4 * s, 6 * s, 0, 6.2 * s, 3 * s, deck);
    bx(g, 3 * s, 1.6 * s, 3 * s, 0, 8.2 * s, 2 * s, dark);
    cyl(g, 0.25 * s, 0.35 * s, 9 * s, 0, 11 * s, 2.5 * s, dark, 6);
    bx(g, 4 * s, 0.2 * s, 0.2 * s, 0, 13 * s, 2.5 * s, dark);
    [[-12, 1], [-7, 1.6], [13, 1]].forEach(([tz, ty]) => {
      cyl(g, 1.4 * s, 1.6 * s, 1.0 * s, 0, (2.8 + ty) * s, tz * s, deck, 12);
      bx(g, 0.3 * s, 0.3 * s, 4 * s, 0.4 * s, (3.1 + ty) * s, (tz - 2.4) * s, dark);
      bx(g, 0.3 * s, 0.3 * s, 4 * s, -0.4 * s, (3.1 + ty) * s, (tz - 2.4) * s, dark);
    });
    const nt = ctex("hullNo" + num, 128, 96, (c, w, h) => { c.fillStyle = "#6c747a"; c.fillRect(0, 0, w, h); c.fillStyle = "#f2f2ee"; c.font = "900 70px Pretendard, system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(num), w / 2, h / 2 + 4); }, { smooth: true });
    [-1, 1].forEach((sd) => { const p = new T.Mesh(new T.PlaneGeometry(4 * s, 3 * s), new T.MeshStandardMaterial({ map: nt, roughness: 0.7 })); p.position.set(sd * 3.45 * s, 1.0 * s, -12 * s); p.rotation.y = sd * Math.PI / 2; g.add(p); });
    g.position.set(x, 0, z);
    g.rotation.y = ry || 0;
    g.traverse((o) => { o.userData.noBlock = 1; });
    S.add(g);
    return g;
  }
  /* (v24) water: a tiling wave normal map scrolled in two directions, a
     glossy surface that picks up the sky, and foam that breathes on the
     shoreline */
  let WAVE_N = null;
  const WATER = [];
  function waveNormal() {
    if (WAVE_N) return WAVE_N;
    const N = 256, cv = document.createElement("canvas");
    cv.width = cv.height = N;
    const g = cv.getContext("2d"), im = g.createImageData(N, N), o = im.data;
    const H = (x, y) => {
      const a = (x / N) * Math.PI * 2, b = (y / N) * Math.PI * 2;
      return Math.sin(a * 3 + Math.sin(b * 2) * 0.8) * 0.5 + Math.sin(b * 5 + a * 2) * 0.3 + Math.sin(a * 9 - b * 7) * 0.12 + Math.sin(a * 14 + b * 11) * 0.06;
    };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * 6, dy = (H(x, y + 1) - H(x, y - 1)) * 6;
      const l = Math.hypot(dx, dy, 1), i = (y * N + x) * 4;
      o[i] = (-dx / l * 0.5 + 0.5) * 255; o[i + 1] = (dy / l * 0.5 + 0.5) * 255; o[i + 2] = (1 / l * 0.5 + 0.5) * 255; o[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    const t = new T.CanvasTexture(cv);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.needsUpdate = true;
    return (WAVE_N = t);
  }
  function waterMat(col, rep, speed) {
    const nm = waveNormal().clone();
    nm.needsUpdate = true;
    nm.repeat.set(rep || 20, rep || 20);
    const m = new T.MeshStandardMaterial({ color: new T.Color(col).convertSRGBToLinear(), roughness: 0.16, metalness: 0.05, envMapIntensity: 0.75, normalMap: nm, normalScale: new T.Vector2(0.55, 0.55) });
    WATER.push({ m: m, sp: speed || 0.012 });
    return m;
  }
  function foamStrip(S, x, z, w, d, ry) {
    const t = ctex("foamTex", 256, 64, (g, W, H) => {
      const r = rng(5);
      g.clearRect(0, 0, W, H);
      for (let i = 0; i < 500; i++) { g.fillStyle = "rgba(255,255,255," + (0.3 + r() * 0.6) + ")"; const y = Math.pow(r(), 1.8) * H; g.fillRect((r() * W) | 0, y, 3 + r() * 10, 2 + r() * 3); }
    }, { smooth: true });
    const tm = t.clone(); tm.needsUpdate = true; tm.wrapS = T.RepeatWrapping; tm.repeat.set(Math.max(1, w / 8), 1);
    const m = new T.MeshBasicMaterial({ map: tm, transparent: true, opacity: 0.8, depthWrite: false });
    const p = new T.Mesh(new T.PlaneGeometry(w, d), m);
    p.rotation.x = -Math.PI / 2; p.rotation.z = ry || 0;
    p.position.set(x, 0.06, z);
    p.userData.noBlock = 1;
    S.add(p);
    WATER.push({ foam: m, ph: Math.random() * 6 });
    return p;
  }
  function stepWater(dt) {
    const t = performance.now() / 1000;
    WATER.forEach((w) => {
      if (w.m) { w.m.normalMap.offset.x += dt * w.sp; w.m.normalMap.offset.y += dt * w.sp * 0.6; }
      if (w.foam) { w.foam.opacity = 0.45 + 0.4 * Math.sin(t * 0.9 + w.ph); w.foam.map.offset.x += dt * 0.01; }
    });
  }

  /* ---- v23: signature street elements, one or two per city ---- */
  /* 대전: an elevated maglev guideway over the west lane, with a car on it */
  function lmMonorail(S, x, zA, zB) {
    const c = cmat(0xe4e6e8, 0.6, 0.2), d = cmat(0x8a9096, 0.6, 0.4);
    for (let z = zA; z <= zB; z += 18) { bx(S, 0.9, 7.2, 0.9, -11.6, 3.9, z, c); bx(S, 4.4, 0.7, 1.2, -9.6, 7.6, z, c); }
    bx(S, 1.4, 0.9, zB - zA, x, 8.2, (zA + zB) / 2, c);
    bx(S, 1.6, 0.12, zB - zA, x, 8.7, (zA + zB) / 2, d);
    const car = new T.Group();
    const body = cmat(0xf2f4f6, 0.35, 0.3), band = cmat(0x2a6ab8, 0.4), glass = cmat(0x2a3a48, 0.1, 0.6);
    bx(car, 2.6, 2.4, 22, 0, 0, 0, body); bx(car, 2.62, 0.4, 22.02, 0, -0.5, 0, band);
    bx(car, 2.64, 0.8, 20, 0, 0.4, 0, glass);
    const nose = new T.Mesh(new T.SphereGeometry(1.3, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), body); nose.rotation.x = Math.PI / 2; nose.position.z = 11; car.add(nose);
    car.position.set(x, 10.1, 18);
    car.traverse((o) => { o.userData.noBlock = 1; });
    S.add(car);
    return car;
  }
  /* a fountain: stone basin, water sheet, jets that pulse */
  function lmFountain(S, x, z, r, anims, steam) {
    bx(S, 0.01, 0.01, 0.01, x, 0, z, cmat(0x000000, 1));
    cyl(S, r, r + 0.3, 0.9, x, 0.75, z, cmat(0xc0b8a8, 0.9), 24);
    const water = cyl(S, r - 0.25, r - 0.25, 0.1, x, 1.12, z, waterMat(0x3a86b0, 2, 0.05), 24);
    water.castShadow = false;
    const jm = new T.MeshBasicMaterial({ color: 0xe8f4fc, transparent: true, opacity: 0.75, depthWrite: false });
    const jets = [];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, rr = i === 0 ? 0 : r * 0.55;
      const j = new T.Mesh(new T.CylinderGeometry(0.08, 0.22, 1, 6), jm);
      j.position.set(x + Math.cos(a) * rr, 1.6, z + Math.sin(a) * rr);
      j.userData.noBlock = 1;
      S.add(j); jets.push(j);
    }
    const steamM = steam ? new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false }) : null;
    const puffs = [];
    if (steam) for (let i = 0; i < 6; i++) { const p = new T.Mesh(new T.BoxGeometry(1.2, 1.2, 1.2), steamM); p.userData.noBlock = 1; S.add(p); puffs.push(p); }
    anims.push((t) => {
      jets.forEach((j, i) => { const h = (i === 0 ? 4.5 : 2.2) * (0.75 + 0.25 * Math.sin(t * 2.2 + i)); j.scale.y = h; j.position.y = 1.15 + h / 2; });
      puffs.forEach((p, i) => { const k = ((t * 0.35 + i / puffs.length) % 1); p.position.set(x + Math.sin(i * 2 + t * 0.3) * 0.8, 1.4 + k * 5, z + Math.cos(i) * 0.6); p.scale.setScalar(0.6 + k * 1.6); p.material.opacity = 0.25 * (1 - k); });
    });
  }
  /* market stalls under striped canvas along a kerb */
  function lmMarket(S, x, zA, zB, seed) {
    const R = rng(seed || 3);
    const cols = [0xd8402a, 0x2a6ab8, 0xe8b830, 0x2f8a4a, 0xe86a2a, 0x8a3ab8];
    for (let z = zA; z < zB; z += 3.4) {
      if (R() < 0.18) continue;
      const c = cmat(cols[(R() * cols.length) | 0], 0.85);
      const sd = x > 0 ? -1 : 1;
      bx(S, 2.2, 0.08, 2.8, x + sd * 0.4, 2.5, z, c, { rz: sd * 0.18 });
      [-1, 1].forEach((k) => bx(S, 0.06, 2.4, 0.06, x + sd * 1.3, 1.5, z + k * 1.3, cmat(0x8a8e92, 0.5, 0.6)));
      bx(S, 1.8, 0.8, 2.4, x - sd * 0.1, 0.8, z, cmat(0x8a6a48, 0.9));
      for (let k = 0; k < 6; k++) bx(S, 0.3, 0.22, 0.3, x - sd * 0.1 + (R() - 0.5) * 1.2, 1.32, z + (R() - 0.5) * 1.8, cmat([0xd83a2a, 0xe8c030, 0x6ab84a, 0xe8e0d0, 0xa83a8a][k % 5], 0.8));
    }
  }
  /* 경주: royal tomb mounds, grassy domes with a stone ring */
  function lmTumuli(S, list) {
    const grass = voxMats().grass;
    list.forEach(([x, z, r]) => {
      const m = new T.Mesh(new T.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), grass);
      m.scale.y = 0.55; m.position.set(x, 0.25, z); m.castShadow = true; m.receiveShadow = true; m.userData.noBlock = 1; S.add(m);
      cyl(S, r + 0.2, r + 0.4, 0.5, x, 0.45, z, cmat(0xb8b0a0, 0.95), 28);
    });
  }
  /* stone lanterns down both kerbs */
  function lmLanterns(S, zA, zB, step) {
    const st = cmat(0xbab2a2, 0.95), glow = cmat(0xffe6a0, 0.4, 0, { emissive: 0xffd480, emissiveIntensity: 0.6 });
    for (let z = zA; z < zB; z += step || 10) [-10.6, 10.6].forEach((x) => {
      bx(S, 0.6, 0.3, 0.6, x, 0.5, z, st); bx(S, 0.22, 1.0, 0.22, x, 1.15, z, st);
      bx(S, 0.56, 0.5, 0.56, x, 1.9, z, glow); bx(S, 0.9, 0.18, 0.9, x, 2.25, z, st); bx(S, 0.3, 0.3, 0.3, x, 2.45, z, st);
    });
  }
  /* 부산·인천: port gantry cranes on the far quay */
  function lmCranes(S, list) {
    const red = cmat(0xc8382a, 0.6, 0.3), wh = cmat(0xeceae4, 0.6, 0.3);
    list.forEach(([x, z, ry], i) => {
      const g = new T.Group();
      [-4, 4].forEach((a) => [-6, 6].forEach((b) => { const leg = new T.Mesh(new T.BoxGeometry(0.8, 22, 0.8), i % 2 ? wh : red); leg.position.set(a, 11, b); g.add(leg); }));
      const beam = new T.Mesh(new T.BoxGeometry(1.6, 2, 40), i % 2 ? red : wh); beam.position.set(0, 23, 6); g.add(beam);
      const top = new T.Mesh(new T.BoxGeometry(9, 1.2, 1.2), red); top.position.set(0, 22, -6); g.add(top);
      const top2 = top.clone(); top2.position.z = 6; g.add(top2);
      const cab = new T.Mesh(new T.BoxGeometry(2.4, 1.8, 2.4), wh); cab.position.set(0, 21.2, 14); g.add(cab);
      g.position.set(x, 0, z); g.rotation.y = ry || 0;
      g.traverse((o) => { o.userData.noBlock = 1; o.castShadow = true; });
      S.add(g);
    });
  }
  /* small fishing boats on the swell */
  function lmBoats(S, list, anims) {
    const boats = list.map(([x, z, ry, col], i) => {
      const g = new T.Group();
      const hull = cmat(col || 0x2a5aa8, 0.6), w = cmat(0xf2f0ea, 0.6);
      const h = new T.Mesh(new T.BoxGeometry(2.6, 1.0, 7), hull); h.position.y = 0.3; g.add(h);
      const b2 = new T.Mesh(new T.BoxGeometry(2.0, 0.6, 2.0), hull); b2.position.set(0, 0.4, 3.8); b2.rotation.x = 0.4; g.add(b2);
      const c = new T.Mesh(new T.BoxGeometry(1.8, 1.4, 2.2), w); c.position.set(0, 1.4, -1.2); g.add(c);
      const m = new T.Mesh(new T.BoxGeometry(0.12, 4, 0.12), w); m.position.set(0, 2.6, 1.2); g.add(m);
      g.position.set(x, 0, z); g.rotation.y = ry || 0;
      g.traverse((o) => { o.userData.noBlock = 1; });
      S.add(g);
      return g;
    });
    anims.push((t) => boats.forEach((b, i) => { b.position.y = Math.sin(t * 1.3 + i) * 0.15; b.rotation.z = Math.sin(t * 0.9 + i * 2) * 0.05; }));
  }

  /* fire and smoke for a burning city: flicker cones and a slow column */
  function addFire(S, list, x, y, z, s) {
    const g = new T.Group();
    const f1 = new T.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false });
    const f2 = new T.MeshBasicMaterial({ color: 0xffd060, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false });
    for (let k = 0; k < 4; k++) {
      const c = new T.Mesh(new T.ConeGeometry(0.5 * s, 1.6 * s, 6), k % 2 ? f2 : f1);
      c.position.set((k - 1.5) * 0.45 * s, 0.8 * s, ((k * 7) % 3 - 1) * 0.3 * s);
      g.add(c);
    }
    /* (v38) smoke: small block puffs, each with its own material so it can
       thin out as it climbs — dark and dense at the fire, gone at the top —
       instead of a stack of big grey cubes standing in the sky */
    const smk = [];
    for (let k = 0; k < 8; k++) {
      const sm = new T.MeshBasicMaterial({ color: 0x2a2624, transparent: true, opacity: 0.4, depthWrite: false, fog: true });
      const p = new T.Mesh(new T.BoxGeometry(0.8 * s, 0.8 * s, 0.8 * s), sm);
      p.position.set(0, 2 + k * 1.2 * s, 0);
      p.rotation.set(k * 0.7, k * 1.3, k * 0.4);
      g.add(p); smk.push(p);
    }
    g.position.set(x, y, z);
    g.traverse((o) => { o.userData.noBlock = 1; });
    S.add(g);
    list.push({ g: g, smk: smk, t: Math.random() * 10, s: s });
  }
  function stepFires(dt) {
    if (!dress || !dress.fires) return;
    const cam = window.__railCtx && window.__railCtx.camera;
    if (cam && dress.root) {
      if (!dress.fireLights) {
        dress.fireLights = [0, 1].map(() => { const l = new T.PointLight(0xff7a2a, 0, 18, 1.5); dress.root.add(l); return l; });
      }
      const near = dress.fires.map((f) => ({ f, d: Math.hypot(f.g.position.x - cam.position.x, f.g.position.z - cam.position.z) })).sort((a, b) => a.d - b.d).slice(0, 2);
      dress.fireLights.forEach((l, i) => {
        const n = near[i];
        if (!n) { l.intensity = 0; return; }
        l.position.set(n.f.g.position.x, n.f.g.position.y + 1.5 * n.f.s, n.f.g.position.z);
        l.intensity = (2.4 + Math.sin(n.f.t * 17) * 0.5 + Math.sin(n.f.t * 41) * 0.3) * Math.min(1.5, n.f.s);
      });
    }
    dress.fires.forEach((f) => {
      f.t += dt;
      f.g.children.forEach((c, i) => {
        if (c.geometry.type === "ConeGeometry") { const k = 0.75 + 0.35 * Math.sin(f.t * 13 + i * 2.1) + 0.15 * Math.sin(f.t * 31 + i); c.scale.set(1, k, 1); }
      });
      const H = 9.6 * f.s;
      f.smk.forEach((p, i) => {
        const y = ((f.t * 1.1 + i * 1.2 * f.s) % H);
        const u = y / H;
        p.position.y = 1.4 + y;
        p.position.x = Math.sin(f.t * 0.4 + i * 1.7) * 0.3 * f.s + y * 0.22;
        p.position.z = Math.cos(f.t * 0.33 + i * 2.3) * 0.25 * f.s;
        p.scale.setScalar(0.8 + u * 1.5);
        p.rotation.y += dt * 0.3; p.rotation.x += dt * 0.17;
        p.material.opacity = 0.42 * Math.min(1, u * 6) * (1 - u) * (1 - u);
        p.material.color.setHex(u < 0.25 ? 0x2a2624 : 0x4a4644);
      });
    });
  }

  /* ---- the shared avenue ---- */
  /* (v26) swing the legs of a city round their corners: every prop laid
     past a turn moves into that leg's group (rotated about the crossing);
     whatever then stands in another leg's street is cleared, and where two
     legs' blocks meet the earlier one stays */
  function bendCity(S, TURNS, keep, C, fill) {
    const legs = [S];
    TURNS.forEach(([tz, th], i) => {
      const G = new T.Group();
      G.name = "cityLeg" + (i + 1);
      const px = cityX(tz), c = Math.cos(th), sn = Math.sin(th);
      G.rotation.y = th;
      G.position.set(px - (px * c + tz * sn), 0, tz - (-px * sn + tz * c));
      legs[i].add(G);
      legs.push(G);
    });
    S.children.slice().forEach((o) => {
      if (keep.has(o) || legs.indexOf(o) >= 0 || o.userData.fixedLeg) return;
      let k = o.userData.leg;
      if (k == null) {
        const b = new T.Box3().setFromObject(o);
        if (b.isEmpty()) return;
        k = cityLeg(TURNS, (b.min.z + b.max.z) / 2);
      }
      if (k > 0) legs[k].add(o);
    });
    S.updateMatrixWorld(true);
    const inv = legs.map((g) => new T.Matrix4().copy(g.matrixWorld).invert());
    const v = new T.Vector3();
    const lo = (j) => (j === 0 ? -1e9 : TURNS[j - 1][0]), hi = (j) => (j === TURNS.length ? 1e9 : TURNS[j][0] + 11.8);
    const inCorr = (j, wx, wz) => { v.set(wx, 0, wz).applyMatrix4(inv[j]); return v.z > lo(j) && v.z < hi(j) && Math.abs(v.x - cityX(v.z)) < 11.8; };
    const drop = [], blks = [];
    legs.forEach((g, i) => g.children.slice().forEach((o) => {
      if (legs.indexOf(o) >= 0 || keep.has(o) || o.isInstancedMesh || o.userData.fixedLeg) return;
      const b = new T.Box3().setFromObject(o);
      if (b.isEmpty() || b.max.y < 0.5) return;
      const sx = b.max.x - b.min.x, sz = b.max.z - b.min.z;
      if (sx > 70 || sz > 70) return;
      let hit = false;
      if (!o.userData.keepBend) {
        for (let a = 0; a <= 4 && !hit; a++) for (let c = 0; c <= 4 && !hit; c++) {
          const wx = b.min.x + 0.5 + Math.max(0, sx - 1) * a / 4, wz = b.min.z + 0.5 + Math.max(0, sz - 1) * c / 4;
          for (let j = 0; j < legs.length; j++) if (j !== i && inCorr(j, wx, wz)) { hit = true; break; }
        }
      }
      if (hit) { drop.push(o); return; }
      if (o.userData.blk || o.userData.keepBend) blks.push([o.userData.keepBend ? -1 : i, b.expandByScalar(-0.3), o]);
    }));
    blks.forEach(([i, b, o]) => { const hit = i >= 0 && blks.find(([j, B, O]) => O !== o && j < i && drop.indexOf(O) < 0 && B.intersectsBox(b)); if (hit) drop.push(o); });
    drop.forEach((o) => { if (o.parent) o.parent.remove(o); });
    /* (v38) fill the empty lots: the corners and the land between the legs
       open onto bare ground, so every 13 m cell a little way off the streets
       that nothing stands on gets a building of its own */
    let filled = 0;
    if (fill) {
      S.updateMatrixWorld(true);
      const kept = [];
      legs.forEach((g) => g.children.forEach((o) => {
        if (legs.indexOf(o) >= 0 || keep.has(o)) return;
        const b = new T.Box3().setFromObject(o);
        if (!b.isEmpty() && b.max.y > 1.5 && b.max.x - b.min.x < 80 && b.max.z - b.min.z < 80) kept.push(b);
      }));
      const ZS = -64, ZE = 52;
      const near = (wx, wz) => {
        let m = 1e9, plaza = false;
        for (let j = 0; j < legs.length; j++) {
          v.set(wx, 0, wz).applyMatrix4(inv[j]);
          const a = j === 0 ? ZS : TURNS[j - 1][0], b = j === TURNS.length ? ZE : TURNS[j][0];
          if (j === TURNS.length && v.z > 46 && v.z < 150 && Math.abs(v.x) < 62) plaza = true;
          const zc = Math.max(a, Math.min(b, v.z));
          m = Math.min(m, Math.hypot(v.x - cityX(zc), v.z - zc));
        }
        return plaza ? -1 : m;
      };
      const bb = new T.Box3();
      for (let gx = -130; gx <= 150 && filled < 40; gx += 13) {
        for (let gz = -120; gz <= 150 && filled < 40; gz += 13) {
          if (C.seaSide && gx > 6) continue;
          const d = near(gx, gz);
          if (d < 0 || d < 17 || d > 44) continue;
          bb.min.set(gx - 6, 0, gz - 6); bb.max.set(gx + 6, 30, gz + 6);
          if (kept.some((k) => k.intersectsBox(bb))) continue;
          /* every corner of the lot must be off the streets too */
          if ([[-6, -6], [6, -6], [-6, 6], [6, 6]].some(([ox, oz]) => { const dd = near(gx + ox, gz + oz); return dd >= 0 && dd < 14.5; })) continue;
          const h = 9 + ((gx * 7 + gz * 13) & 15) + (d - 17) * 0.25;
          fill(gx - 5.6, gx + 5.6, gz - 5.6, gz + 5.6, h);
          kept.push(bb.clone());
          filled++;
        }
      }
    }
    window.__bend = { legs: legs.length, dropped: drop.length, filled: filled };
  }

  function dressCity(ctx) {
    makeSol();
    const C = STAGE.city;
    const S = new T.Group();
    S.name = "battlefieldCity";
    ctx.scene.add(S);
    const R = rng(C.seed || 77);
    const TURNS = C.turns || [];
    /* (v26) the seafront only runs along the first leg once the avenue turns */
    const seaHere = (z) => !!C.seaSide && (!TURNS.length || z < TURNS[0][0] - 2);
    const nearTurn = (z, d) => TURNS.some((t) => Math.abs(z - t[0]) < d);
    const legSpans = (a, b) => {
      /* [a,b] cut into one span per leg, leaving each crossing open */
      if (!TURNS.length) return [[a, b]];
      const out = []; let z = a;
      TURNS.forEach((t) => { if (t[0] - 13.9 > z) out.push([z, Math.min(b, t[0] - 13.9)]); z = Math.max(z, t[0] + 13.9); });
      if (b > z) out.push([z, b]);
      return out;
    };
    const sky = makeSkyDome();
    sky.geometry.dispose();
    sky.geometry = new T.SphereGeometry(320, 24, 16);
    sky.position.set(0, 0, 20);
    S.add(sky);
    ctx.scene.background = new T.Color(0x72b8f0).convertSRGBToLinear();
    ctx.scene.fog = new T.Fog(C.fog || 0xd6e6f2, 130, 520);
    if (ctx.scene.fog.color.convertSRGBToLinear) ctx.scene.fog.color.convertSRGBToLinear();
    try { buildSceneEnv(ctx); if (window.__mgEnv) ctx.scene.environment = window.__mgEnv; } catch (e) {}
    if (ctx.LT) {
      const LT = ctx.LT;
      if (LT.hemi) { LT.hemi.intensity = 0.28; LT.hemi.color.setHex(0xd8e9fb); LT.hemi.groundColor && LT.hemi.groundColor.setHex(0xa89a80); }
      if (LT.amb) LT.amb.intensity = 0.06;
      if (LT.key) { LT.key.intensity = 2.3; LT.key.color.setHex(0xffeecd); }
      if (LT.rim) LT.rim.intensity = 0.5;
      if (LT.moon) LT.moon.intensity = 0.1;
    }
    if (ctx.renderer) ctx.renderer.toneMappingExposure = 1.1;
    const z0 = (C.sea ? -70 : CITY_Z0 - 18), z1 = CITY_Z1 + 30;
    /* ground: asphalt, or stone paving for the old capital */
    const gKey = C.paved ? "cityPave" : "asphaltC";
    const gt = C.paved ? paveTex("cityPave", 31) : asphaltTex("asphaltC", 23, 768);
    const gtx = gt.clone(); gtx.needsUpdate = true; gtx.wrapS = gtx.wrapT = T.RepeatWrapping; gtx.repeat.set(C.paved ? 70 : 40, C.paved ? 70 : 40);
    const GS = TURNS.length ? 460 : 320;
    const ground = new T.Mesh(new T.PlaneGeometry(GS, GS), new T.MeshStandardMaterial({ map: gtx, roughness: 0.86, metalness: 0.02, envMapIntensity: 0.1, color: C.paved ? new T.Color(0xd8d0c0).convertSRGBToLinear() : 0xffffff }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(C.seaSide ? -150 : 0, 0.24, C.sea ? 90 : 20);
    if (C.seaSide) { ground.geometry.dispose(); ground.geometry = new T.PlaneGeometry(GS, GS); ground.position.x = -GS / 2 + 12; }
    if (TURNS.length) gtx.repeat.set(GS / 8, GS / 8);
    ground.receiveShadow = true;
    ground.userData.noBlock = 1;
    S.add(ground);
    void gKey;
    /* the water for the seafront cities */
    if (C.seaSide || C.sea) {
      const wt = ctex("seaTex", 256, 256, (g, w, h) => {
        const r = rng(91);
        g.fillStyle = "#2a6c9c"; g.fillRect(0, 0, w, h);
        const cols = ["#2f78aa", "#26628f", "#3a86b8", "#5aa2cc", "#21587f"];
        for (let i = 0; i < 900; i++) { g.fillStyle = cols[(r() * 5) | 0]; g.fillRect((r() * 32 | 0) * 8, (r() * 32 | 0) * 8, 8 + (r() < 0.2 ? 8 : 0), 8); }
      });
      const wtx = wt.clone(); wtx.needsUpdate = true; wtx.wrapS = wtx.wrapT = T.RepeatWrapping; wtx.repeat.set(60, 60);
      void wtx;
      const sea = new T.Mesh(new T.PlaneGeometry(600, 600), waterMat(0x2a5a80, 90, 0.008));
      sea.rotation.x = -Math.PI / 2;
      sea.position.set(C.seaSide ? 300 + 12 : 0, 0.02, C.sea ? -230 - 70 + 300 - 300 : 0);
      if (C.sea) { sea.geometry.dispose(); sea.geometry = new T.PlaneGeometry(600, 300); sea.position.set(0, 0.02, -70 - 150); }
      sea.userData.noBlock = 1;
      S.add(sea);
      dress0.sea = sea;
      if (C.sea) foamStrip(S, 0, -70.5, 260, 3, 0);
      if (C.seaSide) foamStrip(S, 17.4, 0, 3, 200, 0);
    }
    /* everything so far (sky, ground, water) stays put; what follows is laid
       along the avenue and turns its corners with it */
    const keep = new Set(S.children);
    /* road paint and kerbs */
    const paint = (x, z, w, d, m) => { const p = new T.Mesh(new T.PlaneGeometry(w, d), m); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.312, z); p.userData.noBlock = 1; S.add(p); };
    if (!C.paved) {
      for (let z = CITY_Z0 - 10; z < CITY_Z1 + 20; z += 4) { if (nearTurn(z, 12)) continue; const x = cityX(z); paint(x - 0.18, z, 0.13, 4.05, SOL.paintYellow); paint(x + 0.18, z, 0.13, 4.05, SOL.paintYellow); }
      [-5, 5].forEach((lx) => { for (let z = CITY_Z0 - 8; z < CITY_Z1 + 20; z += 7) if (!nearTurn(z, 12)) paint(cityX(z) + lx, z, 0.16, 3.2, SOL.paintWhite); });
      [-26, 22].forEach((cz) => { for (let i = 0; i < 9; i++) paint(-8 + i * 2, cz, 0.55, 3.4, SOL.paintWhite); });
    }
    const walk = (x0, x1, zz0, zz1) => {
      const w = Math.abs(x1 - x0), d = Math.abs(zz1 - zz0);
      const m = new T.Mesh(new T.BoxGeometry(w, 0.12, d), repMat(SOL.pave, w / 3.2, d / 3.2));
      m.position.set((x0 + x1) / 2, 0.36, (zz0 + zz1) / 2); m.receiveShadow = true; m.userData.noBlock = 1; S.add(m);
    };
    const zA = C.sea ? -56 : z0;
    legSpans(zA, 52).forEach(([a, b]) => { walk(-13.8, -10, a, b); if (!seaHere(a)) walk(10, 13.8, a, b); else walk(10, 16, a, TURNS.length ? b : z1); });
    /* ---- the blocks either side, with gaps for side streets ---- */
    /* each city's own facade palette: the shared facades, tinted */
    const facs = [SOL.facA, SOL.facB, SOL.facC].map((m, i) => {
      const t = C.tints && C.tints[i];
      if (!t) return m;
      const c = m.clone(); c.color = new T.Color(t).convertSRGBToLinear(); return c;
    });
    const block = (side, za, zb, back) => { const G = new T.Group(); G.userData.blk = 1; S.add(G); blockIn(G, side, za, zb, back); };
    const blockIn = (S, side, za, zb, back) => {
      const h = (C.low ? 5 : 8) + R() * (C.low ? 3 : (C.tall || 10)) + (zb > 30 ? 4 : 0) + (back ? 6 + R() * 8 : 0);
      const e = back ? 16 : 0;
      const x0 = side < 0 ? -14 - e - 8 - R() * 6 : 14 + e, x1 = side < 0 ? -14 - e : 14 + e + 8 + R() * 6;
      if (C.hanok) {
        /* the old town: tiled-roof houses behind a stone wall */
        const cx = (x0 + x1) / 2, cz = (za + zb) / 2;
        bx(S, Math.abs(x1 - x0), 1.6, zb - za, cx, 1.1, cz, cmat(0xb7ad98, 0.95), { wall: 1 });
        bx(S, Math.abs(x1 - x0) + 0.4, 0.3, zb - za + 0.4, cx, 2.05, cz, cmat(0x3a3e44, 0.7));
        const hw = Math.abs(x1 - x0) - 2;
        bx(S, hw, 3.0, zb - za - 3, cx + side * 0.8, 1.8, cz, cmat(0xe8dfcc, 0.9), { wall: 1 });
        bx(S, hw + 2.2, 0.5, zb - za - 1.2, cx + side * 0.8, 3.5, cz, cmat(0x3a3e44, 0.7));
        bx(S, hw + 0.8, 0.6, (zb - za) * 0.45, cx + side * 0.8, 4.0, cz, cmat(0x30343a, 0.7));
        for (let k = 0; k < 4; k++) cyl(S, 0.14, 0.16, 2.8, cx + side * 0.8 - side * hw / 2, 1.7, za + 2 + k * ((zb - za - 4) / 3), cmat(0x7a3424, 0.7), 8);
        return;
      }
      makeBlock(S, x0, x1, za, zb, h, { mat: facs[(R() * 3) | 0], shop: side < 0 ? "e" : "w", k: (R() * 6) | 0 });
    };
    /* the blocks stop at z 50: the boss fight looks out over an open plaza
       with the city's landmarks behind it */
    const runs = [[zA + 2, -30], [-22, 18], [26, 50]];
    {
      const sS = seaHere(60);
      const pw = sS ? 71 : 110;
      const pz = new T.Mesh(new T.BoxGeometry(pw, 0.1, 90), repMat(SOL.pave, pw / 3.2, 90 / 3.2));
      pz.position.set(sS ? -19.5 : 0, 0.3, 52 + 45); pz.receiveShadow = true; pz.userData.noBlock = 1; S.add(pz);
      for (let i = 0; i < 8; i++) {
        const x = (i % 2 ? 1 : -1) * (14 + (i >> 1) * 7), z = 66 + (i % 3) * 8;
        if (sS && x > 15) continue;
        bx(S, 2.4, 0.7, 2.4, x, 0.65, z, cmat(0xb0aa9c, 0.9));
      }
    }
    const fillRun = (a, b, sides) => {
      let z = a;
      while (z < b - 6) {
        const len = Math.min(b - z, 12 + R() * 8);
        sides.forEach((sd) => { if (sd < 0 || !seaHere(z)) block(sd, z, z + len); });
        z += len + 0.6;
      }
    };
    if (!TURNS.length) runs.forEach(([a, b]) => fillRun(a, b, [-1, 1]));
    else {
      /* (v26) each leg's blocks stop short of the corner on the inside of
         a turn; on the outside the next leg's blocks start back across the
         end of the old street, so every crossing is a T with a wall ahead */
      [-1, 1].forEach((sd) => {
        for (let k = 0; k <= TURNS.length; k++) {
          let a = zA + 2, b = 50;
          if (k > 0) { const t = TURNS[k - 1]; a = t[0] + ((sd > 0) === (t[1] > 0) ? 14 : -13.2); }
          if (k < TURNS.length) { const t = TURNS[k]; b = t[0] + ((sd > 0) === (t[1] > 0) ? -14 : 11.5); }
          fillRun(a, b, [sd]);
          /* a taller row behind, so the corners do not open onto bare ground */
          if (!C.hanok) { let z = a - 8; while (z < b + 6) { const len = 12 + R() * 10; if (sd < 0 || !seaHere(z)) block(sd, z, z + len, true); z += len + 2; } }
        }
      });
    }
    /* the seafront: railing, promenade, benches */
    if (C.seaSide) {
      const zr = TURNS.length ? TURNS[0][0] - 12 : z1;
      bx(S, 0.12, 1.0, zr - zA, 15.8, 0.86, (zA + zr) / 2, cmat(0x8a8e92, 0.5, 0.6));
      for (let z = zA; z < zr; z += 2.4) bx(S, 0.12, 1.0, 0.12, 15.8, 0.86, z, cmat(0x6a6e72, 0.5, 0.6));
      bx(S, 0.6, 3, zr - zA, 16.2, -1.0, (zA + zr) / 2, cmat(0x9a968c, 0.9));
    }
    /* ---- street furniture ---- */
    for (let z = zA + 6; z < z1 - 4; z += 14) {
      if (!nearTurn(z, 14)) makeStreetLamp(S, -10.6, z, Math.PI / 2);
      if (!seaHere(z + 7) && !nearTurn(z + 7, 14)) makeStreetLamp(S, 10.6, z + 7, -Math.PI / 2);
    }
    const VTs = [];
    const trunks = [];
    for (let z = zA + 3; z < z1 - 4; z += 11) {
      [-11.6, 11.6].forEach((x, k) => {
        const zz = z + k * 5.5;
        if (seaHere(zz) && x > 0) return;
        if (Math.abs(zz + 24) < 4 || Math.abs(zz - 24) < 4 || nearTurn(zz, 14)) return;
        const lg = cityLeg(TURNS, zz);
        const VT = VTs[lg] || (VTs[lg] = voxBatch());
        voxTree(VT, x, 0.4, zz, 3.4 + R() * 1.2, 300 + ((zz * 7) | 0) + k, { rx: 1.5, ry: 1.2, cube: 0.5, tint: C.cherry && (k + ((zz / 11) | 0)) % 2 ? [0xf2b8d0, 0xe8a0c0, 0xfad0e0] : [0x8ac06a, 0x74a858, 0x9ccc7a] });
        trunks.push([x, zz]);
      });
    }
    VTs.forEach((VT, lg) => { if (VT) VT.flush(S, "cityTrees" + lg).forEach((m) => { m.userData.leg = lg; }); });
    /* parked vehicles and clutter on the kerb lanes (never in the middle) */
    (C.cars || []).forEach((c) => {
      if (c[0] === "bus") makeCityBus(S, c[1], c[2], c[3] || 0, c[4]);
      else if (c[0] === "police") makePoliceCar(S, c[1], c[2], c[3] || 0);
      else if (c[0] === "truck") { const t = makeTruck(c[1], c[2]); t.rotation.y = c[3] || 0; S.add(t); }
    });
    const barrels = [];
    for (let i = 0; i < 6; i++) {
      const z = -46 + i * 18 + R() * 4, x = (i % 2 ? 1 : -1) * (8.6 + R() * 0.6);
      try { const b = makeBarrel ? makeBarrel(x, z) : null; if (b) { S.add(b); barrels.push({ mesh: b, dead: false, x: x, z: z }); } } catch (e) {}
    }
    /* city sign and banners */
    if (C.sign) lmCitySign(S, C.sign[0], C.sign[1], C.sign[2], C.sign[3], C.sign[4] || 0, C.sign[5]);
    (C.banners || []).forEach((b) => lmBanner(S, b[0], b[1], b[2], b[3], b[4]));
    /* hills behind the city */
    const VH = voxBatch();
    (C.hills || [[0, 240, 260, 60, 30]]).forEach((hh, i) => voxHill(VH, hh[0], Math.max(hh[1], 200), hh[2], hh[3], hh[4] * 0.85, 600 + i, { cube: 3.2 }));
    VH.flush(S, "cityHills").forEach((m) => { m.userData.leg = TURNS.length; });
    /* the landmarks that say where you are */
    const fires = [], anims = [];
    const LMS = [];
    (C.landmarks || []).forEach((L) => {
      const listy = { glass: 1, tumuli: 1, cranes: 1, boats: 1 };
      if (TURNS.length && listy[L[0]] && Array.isArray(L[1]) && L[1].length > 1) L[1].forEach((it) => LMS.push([L[0], [it]]));
      else LMS.push(L);
    });
    const FIXED = { ship: 1, boats: 1, cranes: 1, lighthouse: 1, beach: 1, hedgehogs: 1 };
    LMS.forEach((L) => {
      const G = new T.Group();
      if (FIXED[L[0]] || (L[0] === "suspension" && C.seaSide)) G.userData.fixedLeg = 1;
      S.add(G);
      (function (S) { try {
        const k = L[0];
        if (k === "tower") lmTower(S, L[1], L[2], L[3], L[4]);
        else if (k === "pavilion") lmPavilion(S, L[1], L[2], L[3], L[4], L[5]);
        else if (k === "pagoda") lmPagoda(S, L[1], L[2], L[3], L[4]);
        else if (k === "observatory") lmObservatory(S, L[1], L[2], L[3]);
        else if (k === "dome") lmDome(S, L[1], L[2], L[3]);
        else if (k === "stadium") lmStadium(S, L[1], L[2], L[3], L[4]);
        else if (k === "suspension") { const G = new T.Group(); lmSuspBridge(G, -L[5] / 2, L[5] / 2, 0, L[4]); G.position.set(L[1], 0, L[2]); G.rotation.y = L[3]; G.traverse((o) => { o.userData.noBlock = 1; }); S.add(G); }
        else if (k === "lighthouse") lmLighthouse(S, L[1], L[2], L[3]);
        else if (k === "glass") lmGlassTowers(S, L[1]);
        else if (k === "taper") lmTaperTower(S, L[1], L[2], L[3]);
        else if (k === "sculptureS") lmSculptureS(S, L[1], L[2], L[3]);
        else if (k === "twin") lmTwinPillar(S, L[1], L[2], L[3]);
        else if (k === "ship") lmShip(S, L[1], L[2], L[3], L[4], L[5]);
        else if (k === "hedgehogs") L[1].forEach((p) => lmHedgehog(S, p[0], p[1]));
        else if (k === "fire") addFire(S, fires, L[1], L[2], L[3], L[4] || 1);
        else if (k === "skyline") voxSkyline(S, L[1]);
        else if (k === "monorail") lmMonorail(S, L[1], L[2], L[3]);
        else if (k === "fountain") lmFountain(S, L[1], L[2], L[3], anims, L[4]);
        else if (k === "market") lmMarket(S, L[1], L[2], L[3], L[4]);
        else if (k === "tumuli") lmTumuli(S, L[1]);
        else if (k === "lanterns") lmLanterns(S, L[1], L[2], L[3]);
        else if (k === "cranes") lmCranes(S, L[1]);
        else if (k === "boats") lmBoats(S, L[1], anims);
        else if (k === "overpass") {
          bx(S, 34, 1.0, 6, 0, 7.2, L[1], cmat(0xb4b4ae, 0.85));
          bx(S, 34, 0.9, 0.3, 0, 8.1, L[1] - 2.9, cmat(0x9a9a94, 0.85)); bx(S, 34, 0.9, 0.3, 0, 8.1, L[1] + 2.9, cmat(0x9a9a94, 0.85));
          [-15, 15].forEach((x) => bx(S, 1.6, 7, 4, x, 3.7, L[1], cmat(0xa4a49e, 0.85), { wall: 1 }));
        } else if (k === "beach") {
          const sand = new T.Mesh(new T.PlaneGeometry(240, L[2] - L[1]), new T.MeshStandardMaterial({ color: new T.Color(0xe2cc98).convertSRGBToLinear(), roughness: 0.95 }));
          sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0.2, (L[1] + L[2]) / 2); sand.userData.noBlock = 1; S.add(sand);
        }
      } catch (e) { window.__lmErr = String(e && e.stack || e); }
      })(G);
    });
    if (TURNS.length) {
      bendCity(S, TURNS, keep, C, (x0, x1, z0, z1, h) => {
        const G = new T.Group(); G.userData.keepBend = 1; S.add(G);
        if (C.hanok) {
          /* old town lots get a tiled-roof house behind a stone wall */
          const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
          bx(G, w, 1.6, d, cx, 1.1, cz, cmat(0xb7ad98, 0.95), { wall: 1 });
          bx(G, w + 0.4, 0.3, d + 0.4, cx, 2.05, cz, cmat(0x3a3e44, 0.7));
          bx(G, w - 3, 3.0, d - 3, cx, 1.8, cz, cmat(0xe8dfcc, 0.9), { wall: 1 });
          bx(G, w - 0.8, 0.5, d - 1.2, cx, 3.5, cz, cmat(0x3a3e44, 0.7));
          bx(G, w - 2.2, 0.6, (d - 1.2) * 0.45, cx, 4.0, cz, cmat(0x30343a, 0.7));
          return;
        }
        makeBlock(G, x0, x1, z0, z1, h, { mat: facs[(R() * 3) | 0], k: (R() * 6) | 0 });
      });
      S.updateMatrixWorld(true);
      const wp = new T.Vector3();
      barrels.forEach((b) => { b.mesh.getWorldPosition(wp); b.x = wp.x; b.z = wp.z; });
      trunks.forEach((t) => { const q = cityTurnXZ(TURNS, cityLeg(TURNS, t[1]), t[0], t[1]); t[0] = q[0]; t[1] = q[1]; });
    }
    /* clouds */
    const clouds = [];
    for (let i = 0; i < 9; i++) {
      const c = makeCloud(-100 + i * 25, 42 + Math.random() * 14, 80 + (i % 3) * 40, 6 + Math.random() * 3);
      c.scale.y = 0.4; S.add(c); clouds.push(c);
    }
    const ally = makeAlly();
    ally.position.set(4.6, 0.3, (C.sea ? -50 : CITY_Z0) + 2);
    S.add(ally);
    const flags = [];
    S.traverse((o) => { if (o.userData && o.userData.cloth) flags.push(o); });
    landCovers = [];
    [[-4.6, 62.4], [1.4, 63.6], [5.8, 62.2]].forEach(([x, z]) => { const q = cityTurnXZ(TURNS, cityLeg(TURNS, z), x + cityX(z), z); const c = landCover(q[0], q[1], 2.2); c.g.rotation.y += cityYaw(TURNS, cityLeg(TURNS, z)); S.add(c.g); landCovers.push(c); });
    S.updateMatrixWorld(true);
    walkBlockers = [];
    S.traverse((o) => {
      if (!o.isMesh) return;
      if (o.userData && (o.userData.wall || o.userData.solid)) { const bb = new T.Box3().setFromObject(o); if (bb.max.y > 0.6) walkBlockers.push(bb); }
    });
    if (coverRoot) coverRoot.traverse((o) => { if (o.userData && o.userData.cover) walkBlockers.push(new T.Box3().setFromObject(o)); });
    landCovers.forEach((c) => walkBlockers.push(new T.Box3().setFromObject(c.g)));
    applyMood(ctx, S, sky, clouds, moodOverride() || C.mood || "day");
    dress = { root: S, sky, flags, clouds, barrels: barrels, ally, truck1: null, trunks, fires: fires, anims: anims, animT: 0, sea: dress0.sea };
    dress0.sea = null;
    return dress;
  }
  const dress0 = { sea: null };

  /* Seoul when it falls: the same streets at a burning dusk, smoke columns
     over the blocks, wrecks in the lanes */
  function warify(ctx, D) {
    if (!D || !D.root) return D;
    const S = D.root;
    const fires = [];
    [[-20, 12, -14, 1.6], [18, 10, 4, 1.4], [-22, 9, 30, 1.2], [26, 12, -18, 1.8], [-34, 10, 44, 1.5], [6, 14, 62, 2.2], [-8, 16, 80, 2.4], [30, 11, 40, 1.3]].forEach((f) => addFire(S, fires, f[0], f[1], f[2], f[3]));
    [[-7.6, -12], [7.8, 9], [-8.2, 14]].forEach(([x, z], i) => addFire(S, fires, x, 0.4, z, 0.7 + i * 0.1));
    D.fires = fires;
    try { applyMood(ctx, S, D.sky, D.clouds, "war"); } catch (e) {}
    return D;
  }

  /* ---------------- the helicopter ---------------- */

  function makeHeliModel() {
    makeSol();
    stage2Mats();
    const g = new T.Group();
    const b = new T.Group();
    g.add(b);
    const camo = SOL.camoP;
    /* cabin, nose, engine deck and tail boom */
    part(b, 1.6, 1.35, 3.3, 0, 0, 0, camo);
    part(b, 1.42, 0.5, 1.3, 0, 0.78, -0.1, camo);
    part(b, 1.1, 0.8, 0.9, 0, -0.12, 1.85, camo);
    part(b, 0.86, 0.52, 0.5, 0, 0.3, 1.95, SOL.glassP);
    part(b, 1.34, 0.62, 0.16, 0, 0.34, 1.58, SOL.glassP);
    part(b, 1.34, 0.6, 0.14, 0, 0.3, -1.28, SOL.glassP);
    part(b, 0.46, 0.46, 3.0, 0, 0.44, -2.9, camo);
    part(b, 0.16, 1.2, 0.72, 0, 0.98, -4.0, camo);
    part(b, 1.0, 0.1, 0.5, 0, 0.44, -3.9, camo);
    /* exhausts and engine grille */
    [-0.52, 0.52].forEach((sx) => part(b, 0.24, 0.22, 0.5, sx, 0.72, -0.9, SOL.steelP));
    part(b, 0.9, 0.06, 1.0, 0, 1.03, -0.5, SOL.steelP);
    /* skids */
    [-1, 1].forEach((sx) => {
      part(b, 0.13, 0.11, 2.9, sx * 0.8, -0.98, 0.1, SOL.steelP);
      part(b, 0.1, 0.46, 0.1, sx * 0.8, -0.74, 0.92, SOL.steelP);
      part(b, 0.1, 0.46, 0.1, sx * 0.8, -0.74, -0.72, SOL.steelP);
      part(b, 0.12, 0.1, 0.5, sx * 0.8, -0.92, 1.3, SOL.steelP);
    });
    /* the open side door with the door gunner in it */
    part(b, 0.12, 1.0, 1.25, 0.79, -0.1, 0.3, SOL.black);
    const gunner = makeSoldier("weak");
    gunner.scale.setScalar(0.62);
    gunner.position.set(0.52, -0.62, 0.28);
    gunner.rotation.y = Math.PI * 0.5;
    b.add(gunner);
    part(b, 0.18, 0.18, 0.18, 0.92, 0.05, 0.5, SOL.gunmetal);
    const gun = new T.Group();
    gun.position.set(1.02, 0.02, 0.34);
    b.add(gun);
    part(gun, 0.12, 0.12, 1.0, 0, 0, 0.45, SOL.gunmetal);
    part(gun, 0.18, 0.2, 0.26, 0, 0, 0.05, SOL.black);
    part(gun, 0.08, 0.14, 0.3, 0, -0.2, -0.1, SOL.black);
    const mz = new T.Object3D();
    mz.position.set(0, 0, 1.0);
    gun.add(mz);
    g.userData.muzzle = mz;
    /* main rotor and tail rotor */
    part(b, 0.18, 0.52, 0.18, 0, 1.06, -0.12, SOL.steelP);
    const rotor = new T.Group();
    rotor.position.set(0, 1.34, -0.12);
    b.add(rotor);
    part(rotor, 0.36, 0.16, 0.36, 0, 0, 0, SOL.steelP);
    for (let i = 0; i < 3; i++) {
      const bl = part(rotor, 6.8, 0.07, 0.34, 0, 0, 0, SOL.oliveDark);
      bl.rotation.y = (i * Math.PI) / 1.5;
      bl.castShadow = true;
    }
    const tail = new T.Group();
    tail.position.set(0.18, 0.98, -4.0);
    b.add(tail);
    for (let i = 0; i < 2; i++) {
      const bl = part(tail, 0.06, 1.7, 0.17, 0, 0, 0, SOL.oliveDark);
      bl.rotation.x = (i * Math.PI) / 1;
      bl.rotation.z = 0.2;
    }
    part(tail, 0.14, 0.14, 0.14, 0.12, 0, 0, SOL.steelP);
    /* markings */
    const star = new T.Mesh(new T.PlaneGeometry(0.46, 0.46), SOL.star);
    star.position.set(0.82, 0.18, -0.5);
    star.rotation.y = Math.PI / 2;
    b.add(star);
    g.userData.rotor = rotor;
    /* (v28) the CC0 gunship takes over once loaded; boxes are the fallback */
    glbHeliAdd(g, b, b.children.filter((c) => c && c.isMesh), rotor, tail, gunner, gun);
    g.userData.tail = tail;
    g.userData.gunner = gunner;
    g.userData.body = b;
    enemyRim(g); /* the same warm edge the riflemen carry */
    return g;
  }

  function makeHeliPost(w, m, i) {
    const p0 = waveXY(w, m.lat || 0, m.dep || 18);
    const g = makeHeliModel();
    const hp = 9;
    const post = {
      e: { kind: "heli", mesh: g, alive: true, hp: hp, h: 3, _tag: null },
      role: "heli", air: "heli", i,
      x: p0.x, z: p0.z, y: m.y || 8.6,
      cx: p0.x, cz: p0.z, baseY: m.y || 8.6,
      orbitR: m.orbit || 5.0, orbitT: Math.random() * 6.28, orbitW: m.ow || 0.42,
      hpMax: hp, gunnerAlive: true,
      aim: 2.8 * (DIFF.aim || 1), aimMax: 2.8 * (DIFF.aim || 1), burstN: 0, shotT: 0,
      live: false, state: "hover", expose: 1, smokeT: 0,
      bob: Math.random() * 6, walk: 0, moving: false,
      fallV: 0, spin: 0, dying: 0, visTop: 0
    };
    /* (v20) it no longer circles a spot behind the scenery: it climbs out
       from where it was parked and then strafes across the front of the
       position, swinging side to side between the player and the cover */
    const f0 = waveXY(w, 0, m.front || 12.5), fl = waveXY(w, 1, m.front || 12.5), ff = waveXY(w, 0, (m.front || 12.5) + 1);
    post.front = { x: f0.x, z: f0.z };
    post.lat = { x: fl.x - f0.x, z: fl.z - f0.z };
    post.fwd = { x: ff.x - f0.x, z: ff.z - f0.z };
    post.sweep = m.sweep || 7.0;
    post.enterT = 0;
    post.flyY = m.flyY || (5.6 + Math.random() * 0.8);
    g.position.set(post.x, post.y, post.z);
    if (SCENE) SCENE.add(g);
    post.mesh = g;
    post.body = null;
    post.visTop = post.y + 1.4;
    roleTag(post.e);
    if (post.e._tag) post.e._tag.style.display = "none";
    posts.push(post);
    return post;
  }

  function heliFire(ctx, p) {
    const u = p.mesh && p.mesh.userData;
    const from = new T.Vector3(p.x, p.y, p.z);
    if (u && u.muzzle) {
      u.muzzle.updateWorldMatrix(true, false);
      u.muzzle.getWorldPosition(from);
    }
    muzzleFlash(ctx, from);
    const cam = ctx.camera.position;
    const toCam = new T.Vector3(cam.x - from.x, cam.y - 0.3 - from.y, cam.z - from.z);
    const d = toCam.length() || 1;
    toCam.multiplyScalar(Math.max(0.2, (d - 5) / d));
    tracerTo(ctx, from, new T.Vector3(from.x + toCam.x, from.y + toCam.y, from.z + toCam.z), 0xffe0a0, 0.05);
    gun("rifle");
    hurtPlayer(ctx, 11);
  }

  function stepHeli(p, ctx, dt) {
    const cam = ctx.camera.position;
    const u = p.mesh.userData;
    if (p.e.alive === false) {
      /* shot down: the tail comes round, smoke pours, then it hits the dirt */
      p.fallV -= 9.2 * dt;
      p.y += p.fallV * dt;
      if (MONU && !MONU.broken && p.crashMonu === undefined) {
        p.crashMonu = Math.hypot(p.x - MONU.x, p.z - MONU.z) < 48 && STAGE.dress === "pyongyang";
        if (p.crashMonu) { p.fallV = 1.5; radio("헬기가 동상 쪽으로 추락한다!", 2200); }
      }
      if (p.crashMonu && MONU && !MONU.broken) {
        /* it glides in on a smoking arc and slams into the bronze group */
        const k = Math.min(1, dt * 1.6);
        p.x += (MONU.x - p.x) * k;
        p.z += (MONU.z - 0.6 - p.z) * k;
        p.fallV = Math.max(p.fallV, -7.5);
        if (p.y <= MONU.top && Math.hypot(p.x - MONU.x, p.z - MONU.z) < 3.4) {
          shatterMonument(window.__railCtx || { scene: SCENE }, { x: p.x, z: p.z });
          p.crashMonu = false;
          p.fallV = -2;
        }
      }
      p.spin += dt * 3.4;
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.z = Math.sin(p.spin) * 0.5;
      p.mesh.rotation.y += dt * 1.6;
      if (u.rotor) u.rotor.rotation.y += dt * 5;
      p.smokeT -= dt;
      if (p.smokeT <= 0) {
        p.smokeT = 0.06;
        smokeAt(ctx, p.x + (Math.random() - 0.5), p.y + (Math.random() - 0.5) * 0.6, p.z + (Math.random() - 0.5), 0x2e2b28);
      }
      if (p.y <= 0.9) {
        p.mesh.visible = false;
        p.y = 0.9;
        p.dying = 0;
        for (let i = 0; i < 3; i++) boomAt(ctx, p.x + (Math.random() - 0.5) * 2, 0.9, p.z + (Math.random() - 0.5) * 2);
        shake = 1.6;
        gun("boom");
        if (p.isBoss && !ended) finish(ctx, true);
      }
      return;
    }
    p.orbitT += dt * p.orbitW;
    let ox, oz, oy, lean = 0;
    if (p.front && p.live !== false) {
      /* climb out first (over whatever it was hiding behind), then sweep */
      p.enterT = Math.min(1, (p.enterT || 0) + dt / 2.6);
      const sw = Math.sin(p.orbitT * 1.15) * p.sweep;
      const fw = 1.2 + Math.cos(p.orbitT * 0.83) * 2.4 - (p.isBoss ? Math.max(0, Math.sin(p.orbitT * 0.41)) * 3.5 : 0);
      ox = p.front.x + p.lat.x * sw + p.fwd.x * fw;
      oz = p.front.z + p.lat.z * sw + p.fwd.z * fw;
      oy = p.flyY + Math.sin(p.orbitT * 0.7) * 0.8;
      if (p.enterT < 1) {
        const k = p.enterT * p.enterT * (3 - 2 * p.enterT);
        oy = Math.max(oy, p.baseY + 2.2 * (1 - k));
      }
      lean = -Math.cos(p.orbitT * 1.15) * 0.22;
    } else {
      ox = p.cx + Math.sin(p.orbitT) * p.orbitR;
      oz = p.cz + Math.cos(p.orbitT * 0.8) * p.orbitR * 0.42;
      oy = p.baseY;
    }
    const kk = Math.min(1, dt * (p.enterT < 1 ? 1.1 : 1.6));
    p.x += (ox - p.x) * kk;
    p.z += (oz - p.z) * kk;
    p.bob += dt * 1.3;
    p.yB = (p.yB == null ? p.y : p.yB) + (oy - (p.yB == null ? p.y : p.yB)) * kk;
    p.y = p.yB + Math.sin(p.bob) * 0.3;
    p.mesh.position.set(p.x, p.y, p.z);
    p.mesh.rotation.y = Math.atan2(cam.x - p.x, cam.z - p.z) + 0.28;
    p.mesh.rotation.z = Math.sin(p.bob * 0.7) * 0.05 - 0.04 + lean;
    if (u.rotor) u.rotor.rotation.y += dt * 17;
    if (u.tail) u.tail.rotation.x += dt * 26;
    p.visTop = p.y + 2.3;
    if (p.isBoss && p.live !== false && (p.enterT || 0) >= 1) heliRockets(ctx, p, dt);
    if (p.live !== false) {
      p.aim -= dt * seenK(p);
      if (p.aim <= 0) {
        heliFire(ctx, p);
        p.aim = p.aimMax + Math.random() * 0.9;
      }
      if (p.e.hp <= 3) {
        p.smokeT -= dt;
        if (p.smokeT <= 0) { p.smokeT = 0.16; smokeAt(ctx, p.x + (Math.random() - 0.5), p.y + 0.5, p.z, 0x35322e); }
      }
    }
    const prog = p.gunnerAlive ? Math.max(0, Math.min(1, 1 - p.aim / Math.max(0.001, p.aimMax))) : 0;
    placeTag(p, ctx, prog, p.live !== false && p.gunnerAlive);
  }

  function smokeAt(ctx, x, y, z, col) {
    const m = new T.Mesh(new T.SphereGeometry(0.16 + Math.random() * 0.12, 6, 5), new T.MeshBasicMaterial({ color: col || 0x3a3630, transparent: true, opacity: 0.5, depthWrite: false }));
    m.position.set(x, y, z);
    m.userData.v = new T.Vector3((Math.random() - 0.5) * 0.5, 0.35 + Math.random() * 0.4, (Math.random() - 0.5) * 0.5);
    m.userData.life = 0.9 + Math.random() * 0.7;
    m.userData.smoke = 1;
    ctx.scene.add(m);
    smokes.push(m);
  }

  /* (v24) explosions light the street: one pooled point light that pops
     and dies away, so the count of lights (and the shaders) never changes */
  let boomLight = null, boomK = 0;
  function boomFlash(ctx, x, y, z, k) {
    if (!boomLight) { boomLight = new T.PointLight(0xffa040, 0, 22, 1.6); ctx.scene.add(boomLight); }
    if (boomLight.parent !== ctx.scene) ctx.scene.add(boomLight);
    boomLight.position.set(x, y + 1.2, z);
    boomK = Math.max(boomK, k || 1);
  }
  function stepBoomLight(dt) {
    if (!boomLight) return;
    boomK = Math.max(0, boomK - dt * 3.2);
    boomLight.intensity = boomK * boomK * 9 * (0.85 + Math.random() * 0.3);
  }
  /* (v24) a living backdrop: jet formations crossing the sky, parachutes
     drifting down far off, and (while the line falls back) refugees on the
     pavements heading south */
  const AMB = { t: 0, jetT: 6, chuteT: 3, jets: [], chutes: [], refs: [] };
  function makeJet() {
    const g = new T.Group();
    const M = (c) => new T.MeshStandardMaterial({ color: new T.Color(c).convertSRGBToLinear(), roughness: 0.6, metalness: 0.3 });
    const b = M(0x6a7280), d = M(0x3e444c);
    const B = (w, h, dd, x, y, z, m) => { const o = new T.Mesh(new T.BoxGeometry(w, h, dd), m); o.position.set(x, y, z); g.add(o); };
    B(1.2, 1.2, 9, 0, 0, 0, b); B(0.8, 0.8, 1.6, 0, 0, 5, b); B(0.6, 0.5, 1.4, 0, 0.6, 2.4, M(0x2a3a4a));
    B(9, 0.2, 2.6, 0, 0, -0.6, b); B(3.6, 0.2, 1.4, 0, 0, -4, b); B(0.2, 2, 1.6, 0, 1, -3.8, b);
    B(0.9, 0.9, 0.5, 0, 0, -4.6, d);
    const glow = new T.Mesh(new T.BoxGeometry(0.6, 0.6, 0.3), new T.MeshBasicMaterial({ color: 0xffb060 })); glow.position.z = -4.9; g.add(glow);
    return g;
  }
  function stepAmbient(ctx, dt) {
    const cam = ctx.camera.position;
    AMB.t += dt;
    AMB.jetT -= dt;
    if (AMB.jetT <= 0 && !AMB.jets.length) {
      AMB.jetT = 22 + Math.random() * 14;
      const side = Math.random() < 0.5 ? -1 : 1, y = 55 + Math.random() * 20, z = cam.z + 40 + Math.random() * 60;
      for (let k = 0; k < 3; k++) {
        const j = makeJet();
        j.position.set(cam.x - side * 220 - k * side * 14, y - k * 2, z + (k - 1) * 12);
        j.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        j.rotation.z = -side * 0.15;
        ctx.scene.add(j);
        AMB.jets.push({ m: j, v: side * 95 });
      }
      try { window.GunSFX && window.GunSFX.motor && setTimeout(() => window.GunSFX.boom && 0, 0); } catch (e) {}
    }
    AMB.jets = AMB.jets.filter((j) => {
      j.m.position.x += j.v * dt;
      const dx = j.m.position.x - cam.x;
      try { window.GunSFX && window.GunSFX.loop && window.GunSFX.loop("jet", "diesel", Math.max(0, 0.22 - Math.abs(dx) / 900), 2.6); } catch (e) {}
      if (Math.abs(dx) > 260 && Math.sign(dx) === Math.sign(j.v)) { j.m.parent && j.m.parent.remove(j.m); return false; }
      return true;
    });
    /* parachutes far ahead, in the fighting stages only */
    AMB.chuteT -= dt;
    if (AMB.chuteT <= 0 && AMB.chutes.length < 10 && STAGE.dress !== "dmz") {
      AMB.chuteT = 2 + Math.random() * 4;
      const g = new T.Group();
      const can = new T.Mesh(new T.SphereGeometry(2.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: new T.Color(Math.random() < 0.5 ? 0xe8e4d8 : 0x6a7a4a).convertSRGBToLinear(), roughness: 0.9, side: T.DoubleSide }));
      can.scale.y = 0.6; can.position.y = 4; g.add(can);
      const man = new T.Mesh(new T.BoxGeometry(0.5, 1.4, 0.4), new T.MeshStandardMaterial({ color: 0x3a4430 })); g.add(man);
      g.position.set(cam.x + (Math.random() - 0.5) * 160, 60 + Math.random() * 20, cam.z + 90 + Math.random() * 90);
      ctx.scene.add(g);
      AMB.chutes.push({ m: g, sway: Math.random() * 6 });
    }
    AMB.chutes = AMB.chutes.filter((c) => {
      c.m.position.y -= dt * 3.2; c.sway += dt; c.m.position.x += Math.sin(c.sway * 0.6) * dt * 1.2; c.m.rotation.z = Math.sin(c.sway * 0.8) * 0.12;
      if (c.m.position.y < 8) { c.m.parent && c.m.parent.remove(c.m); return false; }
      return true;
    });
    /* refugees on the pavements in the fall-back stages */
    if (STAGE.refugees && (STAGE.dress === "citygen" || cam.z < 0) && AMB.refs.length < 8 && Math.random() < dt * 0.8) {
      try {
        const m = makeSoldier("hostage");
        const side = Math.random() < 0.5 ? -1 : 1;
        /* (v26) along the street the rail is on now, wherever it points */
        let fx = 0, fz = 1, cx = 0, cz = cam.z;
        if (curve && STAGE.dress === "citygen") {
          const tg = curve.getTangentAt(Math.min(1, pathU + 0.02)); const tl = Math.hypot(tg.x, tg.z) || 1; fx = tg.x / tl; fz = tg.z / tl;
          const ahead = 18 + Math.random() * 30, q = pathAt(Math.min(1, pathU + ahead / pathLen));
          cx = q.x; cz = q.z;
          const lx = fz, lz = -fx, off = side * (11.2 + Math.random() * 1.6);
          m.position.set(cx + lx * off, 0.4, cz + lz * off);
        } else m.position.set(side * (11.2 + Math.random() * 1.6), 0.4, cam.z + 18 + Math.random() * 30);
        m.rotation.y = Math.atan2(-fx, -fz);
        m.userData.fwd = [fx, fz];
        m.traverse((o) => { o.userData.noBlock = 1; });
        ctx.scene.add(m);
        AMB.refs.push({ m: m, ph: Math.random() * 6, spd: 0.9 + Math.random() * 0.4 });
      } catch (e) {}
    }
    AMB.refs = AMB.refs.filter((r) => {
      const fw = r.m.userData.fwd || [0, 1];
      r.m.position.x -= fw[0] * r.spd * dt; r.m.position.z -= fw[1] * r.spd * dt; r.ph += dt * r.spd * 5;
      const u = r.m.userData;
      if (u.legL) u.legL.rotation.x = Math.sin(r.ph) * 0.6;
      if (u.legR) u.legR.rotation.x = -Math.sin(r.ph) * 0.6;
      if (u.armL) u.armL.rotation.x = -Math.sin(r.ph) * 0.4;
      if (u.armR) u.armR.rotation.x = Math.sin(r.ph) * 0.4;
      if (u.body) u.body.position.y = Math.abs(Math.sin(r.ph)) * 0.04;
      if (u.kN) { kApply(u, "walk", r.ph / (Math.PI * 2), K_LEGS, 1); kHandsUp(u, r.ph * 0.7, 0.6); }
      if ((r.m.position.x - cam.x) * fw[0] + (r.m.position.z - cam.z) * fw[1] < -6 || Math.hypot(r.m.position.x - cam.x, r.m.position.z - cam.z) > 90) { r.m.parent && r.m.parent.remove(r.m); return false; }
      return true;
    });
  }
  function clearAmbient() {
    AMB.jets.forEach((j) => j.m.parent && j.m.parent.remove(j.m));
    AMB.chutes.forEach((c) => c.m.parent && c.m.parent.remove(c.m));
    AMB.refs.forEach((r) => r.m.parent && r.m.parent.remove(r.m));
    AMB.jets = []; AMB.chutes = []; AMB.refs = []; AMB.jetT = 6; AMB.chuteT = 3;
  }

  /* (v24) explosion dressing: a ground shockwave ring, a fireball that
     swells and turns to smoke, and a scorch mark that stays */
  const FXL = [], SCORCH = [];
  let scorchTex = null;
  function boomFx(ctx, x, y, z) {
    const gy = 0.33;
    const ring = new T.Mesh(new T.RingGeometry(0.55, 1.0, 40), new T.MeshBasicMaterial({ color: 0xd8c8a8, transparent: true, opacity: 0.85, depthWrite: false, side: T.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x, gy + 0.02, z);
    ctx.scene.add(ring);
    FXL.push({ m: ring, t: 0, dur: 0.55, kind: "ring" });
    /* a cluster of blocks: white-yellow core, orange shell, then soot */
    const ball = new T.Group();
    ball.position.set(x, Math.max(gy + 0.6, y), z);
    for (let i = 0; i < 14; i++) {
      const c = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, depthWrite: false }));
      const a = Math.random() * 6.28, e = Math.random() * 1.2, r = i < 4 ? 0.2 : 0.5 + Math.random() * 0.6;
      c.userData.d = new T.Vector3(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r + 0.2, Math.sin(a) * Math.cos(e) * r);
      c.userData.core = i < 4;
      c.userData.s0 = (i < 4 ? 0.9 : 0.55) + Math.random() * 0.4;
      c.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      ball.add(c);
    }
    ctx.scene.add(ball);
    FXL.push({ m: ball, t: 0, dur: 1.3, kind: "ball" });
    if (!scorchTex) scorchTex = ctex("scorch", 128, 128, (g, w, h) => {
      const gr = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
      gr.addColorStop(0, "rgba(10,8,6,.92)"); gr.addColorStop(0.55, "rgba(20,16,12,.6)"); gr.addColorStop(1, "rgba(20,16,12,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = rng(13);
      for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(0,0,0," + r() * 0.5 + ")"; g.fillRect(w / 2 + (r() - 0.5) * w * 0.9, h / 2 + (r() - 0.5) * h * 0.9, 6, 6); }
    }, { smooth: true });
    if (y < 2.5) {
      const sc = new T.Mesh(new T.PlaneGeometry(3.4, 3.4), new T.MeshBasicMaterial({ map: scorchTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      sc.rotation.x = -Math.PI / 2; sc.rotation.z = Math.random() * 6; sc.position.set(x, gy + 0.03, z);
      ctx.scene.add(sc);
      SCORCH.push(sc);
      if (SCORCH.length > 24) { const o = SCORCH.shift(); o.parent && o.parent.remove(o); }
    }
  }
  function stepFxl(dt) {
    for (let i = FXL.length - 1; i >= 0; i--) {
      const f = FXL[i];
      f.t += dt;
      const k = Math.min(1, f.t / f.dur);
      if (f.kind === "ring") { f.m.scale.setScalar(1 + k * 9); f.m.material.opacity = 0.8 * (1 - k); }
      else if (f.kind === "ball") {
        f.m.position.y += dt * (1.8 - k);
        const grow = 0.6 + Math.sqrt(k) * 3.2;
        f.m.children.forEach((c) => {
          const u = c.userData;
          c.position.copy(u.d).multiplyScalar(grow);
          c.scale.setScalar(u.s0 * (0.7 + Math.sqrt(k) * 1.5));
          /* white-hot -> yellow -> orange -> red -> soot, the core lags */
          const kk = Math.min(1, k * (u.core ? 1.15 : 1.5));
          const col = kk < 0.15 ? [1, 0.97, 0.8] : kk < 0.35 ? [1, 0.75, 0.25] : kk < 0.55 ? [0.95, 0.42, 0.1] : kk < 0.7 ? [0.5, 0.16, 0.06] : [0.12, 0.1, 0.09];
          c.material.color.setRGB(col[0], col[1], col[2]).convertSRGBToLinear();
          c.material.opacity = kk < 0.7 ? 1 : Math.max(0, 1 - (kk - 0.7) / 0.3) * 0.8;
          c.rotation.x += dt * 1.5;
        });
      }
      if (k >= 1) { f.m.parent && f.m.parent.remove(f.m); FXL.splice(i, 1); }
    }
  }
  function boomAt(ctx, x, y, z) {
    boomFlash(ctx, x, y, z, 1);
    try { boomFx(ctx, x, y, z); } catch (e) {}
    for (let i = 0; i < 10; i++) {
      const m = new T.Mesh(new T.BoxGeometry(0.09 + Math.random() * 0.1, 0.09 + Math.random() * 0.1, 0.09 + Math.random() * 0.1), new T.MeshBasicMaterial({ color: i % 3 ? 0xffa12a : 0xfff2b0 }));
      m.position.set(x, y, z);
      m.userData.v = new T.Vector3((Math.random() - 0.5) * 5, 1 + Math.random() * 4, (Math.random() - 0.5) * 5);
      m.userData.life = 0.4 + Math.random() * 0.3;
      m.userData.burn = 1;
      ctx.scene.add(m);
      sparks.push(m);
    }
    for (let i = 0; i < 3; i++) smokeAt(ctx, x + (Math.random() - 0.5), y + 0.2, z + (Math.random() - 0.5), 0x2c2924);
  }

  /* ---------------- paratroopers ---------------- */

  function strut(parent, ax, ay, az, bx, by, bz, mat, thick) {
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    const len = Math.hypot(dx, dy, dz) || 0.01;
    const m = new T.Mesh(new T.BoxGeometry(thick || 0.035, len, thick || 0.035), mat);
    m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx / len, dy / len, dz / len));
    parent.add(m);
    return m;
  }

  function makeParaModel(role) {
    makeSol();
    stage2Mats();
    const g = new T.Group();
    const sm = makeSoldier(role === "para" ? "weak" : role);
    g.add(sm);
    Object.assign(g.userData, sm.userData);
    const chute = new T.Group();
    chute.position.y = 3.15;
    g.add(chute);
    const canopy = new T.MeshPhongMaterial({ color: 0xd8d6bc, shininess: 4, specular: new T.Color(0x2a2a24) });
    const canopy2 = new T.MeshPhongMaterial({ color: 0xb9bd9c, shininess: 4, specular: new T.Color(0x2a2a24) });
    const ring = (r, y, n, s, mat) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const m = part(chute, s, s * 0.42, s, Math.cos(a) * r, y, Math.sin(a) * r, i % 2 ? mat : canopy2);
        m.rotation.y = -a;
        m.rotation.z = 0.12;
      }
    };
    ring(1.62, 0.24, 12, 0.66, canopy);
    ring(1.12, 0.58, 9, 0.58, canopy);
    ring(0.6, 0.84, 6, 0.5, canopy);
    part(chute, 0.52, 0.34, 0.52, 0, 0.98, 0, canopy2);
    /* suspension lines down to the shoulders */
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      strut(chute, Math.cos(a) * 1.5, 0.2, Math.sin(a) * 1.5, Math.cos(a) * 0.26, -1.95, Math.sin(a) * 0.26, SOL.strap, 0.03);
    }
    g.userData.chute = chute;
    return g;
  }

  function makeParaPost(w, m, i) {
    const p0 = waveXY(w, m.lat || 0, m.dep || 16);
    const role = roleOf(m.role || "weak");
    const g = makeParaModel(role);
    const land = m.land ? waveXY(w, m.land[0], m.land[1]) : { x: p0.x, z: p0.z };
    const post = {
      e: { kind: role, mesh: g, alive: true, hp: roleHp(role), h: 1.4, _tag: null },
      role, air: "para", i,
      x: p0.x, z: p0.z, y: m.y || 8.4,
      vy: -(m.vy || 1.15),
      chuteOn: true, torn: 0,
      landX: land.x, landZ: land.z,
      live: false, state: "drop", expose: 1,
      aim: roleAim(role) + 0.8, aimMax: roleAim(role) + 0.8,
      burstN: 0, shotT: 0, burstMax: 2,
      sway0: Math.random() * 6.28,
      bob: Math.random() * 6, breath: Math.random() * 6, walk: 0, moving: false,
      hideFrac: 0.35, hideMin: 0.6 + Math.random() * 0.6, peekDir: i % 2 ? 1 : -1,
      fireMax: 1.5 + Math.random() * 0.6, stateT: 0.4, aimMax0: roleAim(role),
      knock: 0, recoil: 0, armK: 0, visTop: 0, headTop: 1.5, scale: 1.28
    };
    if (SCENE) SCENE.add(g);
    g.position.set(post.x, post.y, post.z);
    post.mesh = g;
    post.body = g.userData.body || null;
    post.visTop = post.y + 2.0;
    roleTag(post.e);
    if (post.e._tag) post.e._tag.style.display = "none";
    posts.push(post);
    return post;
  }

  function cutChute(ctx, p) {
    if (!p.chuteOn) return;
    p.chuteOn = false;
    p.torn = 1;
    p.vy = -1.6;
    if (p.mesh && p.mesh.userData && p.mesh.userData.chute) {
      const ch = p.mesh.userData.chute;
      ch.rotation.z = 0.9;
      ch.scale.set(0.7, 0.5, 0.7);
      ch.visible = false;
    }
    burst(ctx.scene, p.x, p.y + 2.4, p.z, false);
    gun("hit");
    addPts(ctx, 120);
    window.__chuteCuts = (window.__chuteCuts || 0) + 1;
  }

  function landPara(ctx, p) {
    p.chuteOn = false;
    if (p.mesh && p.mesh.userData && p.mesh.userData.chute) p.mesh.userData.chute.visible = false;
    p.y = 0.3;
    p.mesh.position.y = 0.3;
    p.air = null;
    p.state = "peek";
    p.stateT = 0.2;
    p.expose = 1;
    p.aimMax = p.aimMax0 || roleAim(p.role);
    p.aim = p.aimMax;
    /* find the nearest sandbags he can get behind and walk there */
    const cam = ctx.camera.position;
    let best = null, bd = 1e9;
    landCovers.forEach((c) => {
      if (c.used) return;
      const d = Math.hypot(c.cx - p.x, c.cz - p.z);
      if (d < bd) { bd = d; best = c; }
    });
    if (best && bd < 16) {
      best.used = true;
      p.coverRef = best;
      p.coverTop = best.topY;
      p.coverCX = best.cx;
      p.coverCZ = best.cz;
      const dx = best.cx - cam.x, dz = best.cz - cam.z;
      const dd = Math.hypot(dx, dz) || 1;
      p.moveTo = { x: best.cx - (dx / dd) * 0.95, z: best.cz - (dz / dd) * 0.95, sp: 3.4 };
      p.spd = 3.4;
    }
    window.__paraLanded = (window.__paraLanded || 0) + 1;
  }

  function stepPara(p, ctx, dt) {
    const cam = ctx.camera.position;
    if (p.chuteOn) {
      /* under canopy: sink slowly, sway, and keep shooting */
      p.vy = p.torn ? p.vy - 9.4 * dt : p.vy;
      p.y += p.vy * dt;
      const sw = performance.now() / 1300 + p.sway0;
      p.x += Math.cos(sw) * 0.32 * dt;
      p.z += Math.sin(sw * 0.8) * 0.26 * dt;
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.y = Math.atan2(cam.x - p.x, cam.z - p.z);
      const ch = p.mesh.userData.chute;
      if (ch) {
        ch.rotation.y = Math.sin(sw) * 0.1;
        ch.rotation.z = Math.sin(sw * 1.4) * 0.05;
      }
      p.visTop = p.y + 2.2;
      if (p.chuteOn) p.visTop = p.y + 3.55;
      if (p.live !== false) {
        p.aim -= dt * seenK(p);
        if (p.burstN > 0) {
          p.shotT -= dt;
          if (p.shotT <= 0) {
            enemyFire(ctx, p, p.burstN === p.burstMax ? 9 : 0);
            p.burstN--;
            p.shotT = 0.17;
          }
        } else if (p.aim <= 0) {
          p.burstMax = 2;
          p.burstN = 2;
          p.shotT = 0.02;
        }
      }
      if (p.y <= 0.34) {
        if (p.torn) {
          p.e.hp = 0;
          p.air = null;
          killPost(ctx, p, 150);
          return;
        }
        landPara(ctx, p);
        return;
      }
      const prog = Math.max(0, Math.min(1, 1 - p.aim / Math.max(0.001, p.aimMax)));
      placeTag(p, ctx, prog, p.live !== false);
      return;
    }
    /* on the ground he fights like any other man */
  }

  /* ---------------- the armoured boss ---------------- */

  function makeAPCModel() {
    makeSol();
    stage2Mats();
    const g = new T.Group();
    const b = new T.Group();
    g.add(b);
    const hull = SOL.camoP;
    /* sloped hull: a low box with two chamfer boxes front and rear */
    part(b, 3.1, 1.15, 5.4, 0, 0.95, 0, hull);
    const nose = part(b, 3.0, 0.8, 1.1, 0, 0.82, 2.95, hull);
    nose.rotation.x = -0.36;
    part(b, 3.05, 0.72, 0.9, 0, 0.95, -2.9, hull);
    part(b, 2.6, 0.3, 4.6, 0, 1.55, 0, SOL.oliveDark);
    part(b, 0.16, 0.5, 4.2, -1.56, 1.15, 0, SOL.oliveDark);
    part(b, 0.16, 0.5, 4.2, 1.56, 1.15, 0, SOL.oliveDark);
    /* turret with twin barrels */
    const tur = new T.Group();
    tur.position.set(0, 1.75, -0.4);
    b.add(tur);
    part(tur, 1.7, 0.72, 1.7, 0, 0, 0, hull);
    part(tur, 1.2, 0.4, 1.2, 0, 0.5, 0, hull);
    part(tur, 0.5, 0.34, 0.5, 0.34, 0.3, 0.7, SOL.steelP);
    [-0.22, 0.22].forEach((sx) => {
      part(tur, 0.16, 0.16, 1.9, sx, 0.02, 1.5, SOL.gunmetal);
      part(tur, 0.24, 0.24, 0.3, sx, 0.02, 2.5, SOL.black);
    });
    part(tur, 0.34, 0.26, 0.3, -0.44, 0.16, 1.2, SOL.black);
    const mz = new T.Object3D();
    mz.position.set(0, 0.02, 2.7);
    tur.add(mz);
    g.userData.muzzle = mz;
    g.userData.turret = tur;
    /* wheels, hatches, lights, mirrors */
    [-1.9, 0.1, 1.9].forEach((wz) => {
      [-1.62, 1.62].forEach((wx) => {
        const w = new T.Mesh(new T.CylinderGeometry(0.52, 0.52, 0.34, 12), SOL.tire);
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, 0.52, wz);
        w.castShadow = true;
        b.add(w);
        const hub = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.36, 8), SOL.steelP);
        hub.rotation.z = Math.PI / 2;
        hub.position.set(wx, 0.52, wz);
        b.add(hub);
      });
    });
    part(b, 0.7, 0.16, 0.7, -0.8, 1.7, 1.4, SOL.oliveDark);
    [-1, 1].forEach((sx) => {
      part(b, 0.22, 0.22, 0.1, sx * 1.0, 1.15, 2.9, SOL.lightP);
      part(b, 0.16, 0.4, 0.08, sx * 1.2, 1.6, 1.9, SOL.black);
    });
    part(b, 0.06, 0.9, 0.06, 1.4, 2.1, -1.9, SOL.black);
    const star = new T.Mesh(new T.PlaneGeometry(0.62, 0.62), SOL.star);
    star.position.set(1.57, 1.05, 0.2);
    star.rotation.y = Math.PI / 2;
    b.add(star);
    g.userData.body = b;
    enemyRim(g); /* the same warm edge the riflemen carry */
    return g;
  }

  /* (v17) a main battle tank for the later bosses: tracked hull with road
     wheels and side skirts, a cast turret with a long gun and bore evacuator,
     a commander's hatch with a heavy MG. Faces +Z like the armoured car. */
  function makeTankModel() {
    makeSol();
    stage2Mats();
    const g = new T.Group();
    const b = new T.Group();
    g.add(b);
    const hull = SOL.camoP || SOL.oliveDark;
    const dark = SOL.black || SOL.oliveDark;
    part(b, 3.3, 0.9, 6.2, 0, 0.95, 0, hull);
    const glacis = part(b, 3.2, 0.7, 1.3, 0, 1.05, 3.35, hull);
    glacis.rotation.x = -0.6;
    part(b, 3.25, 0.6, 0.6, 0, 1.0, -3.3, hull);
    [-1, 1].forEach((sx) => {
      part(b, 0.62, 0.95, 6.6, sx * 1.62, 0.62, 0, dark);           /* track run */
      for (let i = 0; i < 6; i++) {
        const w = new T.Mesh(new T.CylinderGeometry(0.4, 0.4, 0.3, 12), SOL.tire);
        w.rotation.z = Math.PI / 2;
        w.position.set(sx * 1.66, 0.52, -2.5 + i * 1.0);
        b.add(w);
      }
      part(b, 0.12, 0.55, 6.4, sx * 1.98, 1.05, 0, hull);              /* side skirt */
      for (let i = 0; i < 5; i++) part(b, 0.14, 0.5, 0.06, sx * 2.0, 1.05, -2.4 + i * 1.2, dark);
      part(b, 0.3, 0.24, 0.6, sx * 1.1, 1.45, -2.8, dark);             /* exhaust */
    });
    const turret = new T.Group();
    turret.position.set(0, 1.55, -0.2);
    b.add(turret);
    part(turret, 2.5, 0.75, 3.0, 0, 0.35, 0, hull);
    const tf = part(turret, 2.2, 0.6, 0.9, 0, 0.32, 1.7, hull);
    tf.rotation.x = -0.35;
    part(turret, 2.3, 0.35, 0.6, 0, 0.3, -1.75, dark);                  /* bustle rack */
    const gun = new T.Group();
    gun.position.set(0, 0.42, 1.9);
    turret.add(gun);
    part(gun, 0.42, 0.42, 0.6, 0, 0, 0.2, hull);                         /* mantlet */
    const barrel = new T.Mesh(new T.CylinderGeometry(0.11, 0.13, 4.2, 10), dark);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0, 2.5);
    gun.add(barrel);
    const evac = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.5, 10), dark);
    evac.rotation.x = Math.PI / 2;
    evac.position.set(0, 0, 2.1);
    gun.add(evac);
    const muzzle = new T.Object3D();
    muzzle.position.set(0, 0, 4.65);
    gun.add(muzzle);
    part(turret, 0.7, 0.3, 0.7, -0.6, 0.86, -0.4, dark);                 /* hatch */
    part(turret, 0.08, 0.08, 1.0, -0.6, 1.15, 0.1, dark);                /* hatch MG */
    part(turret, 0.06, 0.7, 0.06, 0.8, 1.05, -1.2, dark);                /* aerial */
    const star = new T.Mesh(new T.PlaneGeometry(0.6, 0.6), SOL.star);
    star.position.set(1.26, 0.38, 0.2);
    star.rotation.y = Math.PI / 2;
    turret.add(star);
    /* (v28) the CC0 tank takes over once it has loaded; these boxes are what
       the boss shows until then, and what stays if the model cannot load */
    glbTankAdd(g, b, b.children.filter((c) => c && c.isMesh), turret);
    g.userData.body = b;
    g.userData.turret = turret;
    g.userData.cannon = gun;
    g.userData.cannonMuzzle = muzzle;
    enemyRim(g);
    return g;
  }
  /* the soft spot every armoured boss carries: a glowing engine vent on the
     rear deck (and on the tank, the commander's hatch) */
  function addWeakPoint(g, x, y, z, w, h) {
    /* a vertical glowing intake on the front of the hull (the vehicle always
       turns its nose to the player, so this is the face he sees) */
    const host = g.userData.body || g;
    const m = new T.Mesh(new T.BoxGeometry(w, h, 0.12), new T.MeshBasicMaterial({ color: 0xff8a1a, toneMapped: false }));
    m.position.set(x, y, z);
    host.add(m);
    for (let i = 0; i < 4; i++) {
      const bar = new T.Mesh(new T.BoxGeometry(w + 0.12, 0.06, 0.08), SOL.black || SOL.oliveDark);
      bar.position.set(x, y - h / 2 + (i + 0.5) * h / 4, z + 0.06);
      host.add(bar);
    }
    g.userData.weak = (g.userData.weak || []).concat([m]);
    return m;
  }

  function stageBoss2() {
    if (bossStage) return bossStage;
    const tank = !!STAGE.bossTank;
    const g = tank ? makeTankModel() : makeAPCModel();
    if (tank) addWeakPoint(g, 0, 0.92, 3.52, 1.3, 0.5);
    else {
      addWeakPoint(g, 0, 1.02, 3.42, 1.2, 0.46);
      /* the armoured car's autocannon, so its gun can be jammed too */
      const b = g.userData.body || g;
      const mount = new T.Group();
      mount.position.set(0.5, 1.95, 1.2);
      b.add(mount);
      const bar = new T.Mesh(new T.CylinderGeometry(0.07, 0.08, 1.8, 8), SOL.black || SOL.oliveDark);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(0, 0, 0.9);
      mount.add(bar);
      const box = new T.Mesh(new T.BoxGeometry(0.5, 0.36, 0.6), SOL.oliveDark);
      mount.add(box);
      const mz = new T.Object3D();
      mz.position.set(0, 0, 1.85);
      mount.add(mz);
      g.userData.cannonMuzzle = mz;
    }
    const spot = BOSS_DEF.spots[1];
    const p0 = waveXY({ yaw: bossYaw, hold: bossHold }, spot[0], spot[1]);
    /* (v17) armour: ordinary hits barely scratch it; the glowing vent, a
       grenade, or jamming the main gun is how it dies */
    const hp = Math.round((STAGE.bossHp || 60) * (DIFF.boss || 1));
    const post = {
      e: { kind: "boss", mesh: g, alive: true, hp: hp, h: 2.8, _tag: null },
      role: "boss", air: "apc", isBoss: true, i: 1,
      x: p0.x, z: p0.z, y: 0.3,
      hpMax: hp, spotI: 1, live: false, state: "hidden", stateT: 1.2,
      aim: 2.4 * (DIFF.aim || 1), aimMax: 2.4 * (DIFF.aim || 1), burstN: 0, shotT: 0, expose: 1,
      jump: null, moveT: 3.2, bob: 0, walk: 0, moving: false,
      knock: 0, recoil: 0, visTop: 0,
      tank: tank, cannonT: 6.5, charge: 0, jam: 0, stun: 0, phaseN: 0
    };
    g.position.set(post.x, 0.3, post.z);
    if (SCENE) SCENE.add(g);
    post.mesh = g;
    post.body = null;
    post.visTop = 2.5;
    roleTag(post.e);
    if (post.e._tag) post.e._tag.style.display = "none";
    posts.push(post);
    bossPost = post;
    bossStage = post;
    return post;
  }

  /* reinforcements at two thirds and one third of the gauge */
  function bossPhaseCheck(ctx, p) {
    const k = p.e.hp / Math.max(1, p.hpMax);
    const want = k < 0.34 ? 2 : k < 0.67 ? 1 : 0;
    while (p.phaseN < want) {
      p.phaseN++;
      const lines = p.commander ? ["총사령관이 친위대를 부른다! 낙하병부터 정리하라!", "총사령관이 궁지에 몰렸다! 마지막 친위대 강하!"]
        : p.air === "heli" ? ["헬기가 공수부대를 떨군다! 낙하병 주의!", "공격헬기가 발악한다! 증원 병력 다수 강하!"]
        : ["적 증원 낙하! 호위병부터 정리하라!", "적 전차가 발악한다! 증원 병력 다수 강하!"];
      radio(lines[p.phaseN === 1 ? 0 : 1], 3600);
      if (p.commander) p.aimMax = Math.max(0.9, p.aimMax * 0.85);
      const n = p.phaseN === 1 ? 2 : 3;
      for (let i = 0; i < n; i++) {
        const lat = (i - (n - 1) / 2) * 4.2 + (Math.random() - 0.5);
        try {
          const q = makeParaPost({ yaw: bossYaw, hold: bossHold }, { air: "para", role: "para", lat: lat, dep: 13 + Math.random() * 2, y: 7.6 + Math.random(), land: [lat * 1.1, 9.6 + Math.random()] }, 90 + i);
          q.live = true; q.state = "drop"; q.burstN = 0; q.aim = (q.aimMax || 2.4) * (0.8 + Math.random() * 0.4);
        } catch (err) { window.__escortErr = String(err && err.stack || err); }
      }
    }
  }
  /* the main gun: every 7-9 s it lays on the player for 1.8 s with a growing
     glow at the muzzle; four rounds into the muzzle (or the vent) jam it,
     otherwise the shell lands for heavy damage */
  function stepCannon(p, ctx, dt) {
    if (p.stun > 0) { p.stun -= dt; return; }
    if (p.charge > 0) {
      p.charge -= dt;
      const mz = p.mesh.userData.cannonMuzzle || p.mesh;
      if (!p.glow) {
        p.glow = new T.Mesh(new T.BoxGeometry(0.5, 0.5, 0.5), new T.MeshBasicMaterial({ color: 0xff3a1a, toneMapped: false, transparent: true, opacity: 0.9 }));
        ctx.scene.add(p.glow);
      }
      mz.getWorldPosition(_mz);
      p.glow.visible = true;
      p.glow.position.copy(_mz);
      const k = 1 - p.charge / 1.8;
      p.glow.scale.setScalar(0.6 + k * 2.4 + Math.sin(k * 40) * 0.2);
      p.glow.rotation.y += dt * 6;
      if (p.charge <= 0) {
        p.glow.visible = false;
        p.jam = 0;
        p.cannonT = 7 + Math.random() * 2;
        p.recoil = 1;
        boomAt(ctx, ctx.camera.position.x + (Math.random() - 0.5) * 3, 0.8, ctx.camera.position.z + 4 + Math.random() * 2);
        flashScreen(0.8);
        shake = 1.8;
        gun("boom");
        hurtPlayer(ctx, 34);
        window.__cannonHits = (window.__cannonHits || 0) + 1;
      }
      return;
    }
    p.cannonT -= dt;
    if (p.cannonT <= 0 && !p.jump) {
      p.charge = 1.8;
      p.jam = 0;
      radio(p.tank ? "적 전차 주포 조준! 포구를 쏴서 막아라!" : "적 장갑차 기관포 조준! 포구를 쏴서 막아라!", 2400);
      gun("dry");
    }
  }

  function stepBoss2(p, ctx, dt) {
    const cam = ctx.camera;
    stepCannon(p, ctx, dt);
    if (p.jump) {
      const j = p.jump;
      const veh = p.air === "apc";
      j.t += dt / (veh ? 1.7 : 0.8);
      const k = veh ? (function (t) { t = Math.min(1, t); return t * t * (3 - 2 * t); })(j.t) : Math.min(1, j.t);
      p.x = j.fx + (j.tx - j.fx) * k;
      p.z = j.fz + (j.tz - j.fz) * k;
      p.y = veh ? 0.3 : 0.3 + Math.sin(Math.PI * k) * 0.95;
      if (veh && Math.random() < 0.4) smokeAt(ctx, p.x, 0.4, p.z, 0x8a7c66);
      if (k >= 1) { p.jump = null; p.y = 0.3; p.moveT = 4.2 + Math.random() * 2.0; }
    } else if (p.moveT > 0) {
      p.moveT -= dt;
      if (p.moveT <= 0 && p.burstN === 0) {
        const NS = BOSS_DEF.spots.length;
        let pick = (p.spotI + 1 + ((Math.random() * 2) | 0)) % NS;
        if (p.air === "apc") {
          /* (v26) a tank drives, it does not hop: only to a spot it can
             reach without going through a barrier */
          for (let t = 0; t < NS; t++) {
            const i = (pick + t) % NS;
            if (i === p.spotI) continue;
            const q = waveXY({ yaw: bossYaw, hold: bossHold }, BOSS_DEF.spots[i][0], BOSS_DEF.spots[i][1]);
            if (segClear(p.x, p.z, q.x, q.z, 1.3, 0)) { pick = i; break; }
            if (t === NS - 1) pick = p.spotI;
          }
        }
        p.spotI = pick;
        const s = BOSS_DEF.spots[p.spotI];
        const np = waveXY({ yaw: bossYaw, hold: bossHold }, s[0], s[1]);
        p.jump = { fx: p.x, fz: p.z, tx: np.x, tz: np.z, t: 0 };
      }
    }
    /* a two-shot threat: the ring runs down, then two heavy rounds */
    p.aim -= dt * seenK(p);
    if (p.burstN > 0) {
      p.shotT -= dt;
      if (p.shotT <= 0) {
        enemyFire(ctx, p, p.burstN === 2 ? 16 : 22);
        p.burstN--;
        p.shotT = 0.5;
      }
    } else if (p.aim <= 0) {
      p.burstN = 2;
      p.burstMax = 2;
      p.shotT = 0.04;
      p.aim = p.aimMax + 0.7;
      if (p.mesh.userData && p.mesh.userData.turret) p.recoil = 1;
    }
    p.mesh.position.set(p.x, p.y, p.z);
    p.mesh.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
    p.mesh.rotation.z = p.jump ? Math.sin(p.jump.t * Math.PI) * 0.05 : 0;
    if (p.recoil > 0) {
      p.recoil = Math.max(0, p.recoil - dt * 3.2);
      const tu = p.mesh.userData && p.mesh.userData.turret;
      if (tu) tu.position.z = (tu.userData.recoilBaseZ != null ? tu.userData.recoilBaseZ : -0.4) - p.recoil * 0.12;
    }
    p.visTop = p.y + 2.2;
    const prog = Math.max(0, Math.min(1, 1 - p.aim / Math.max(0.001, p.aimMax)));
    placeTag(p, ctx, prog, true);
  }

  function stepDyingVehicle(p, ctx, dt) {
    /* the hull drops on its suspension, then a stack of explosions */
    if (p.dying > 0) {
      p.dying -= dt;
      p.mesh.rotation.z = Math.min(0.42, (1 - p.dying / 1.6) * 0.42);
      p.mesh.position.y = 0.3 - (1 - p.dying / 1.6) * 0.12;
      p.smokeT = (p.smokeT || 0) - dt;
      if (p.smokeT <= 0) {
        p.smokeT = 0.12;
        smokeAt(ctx, p.x + (Math.random() - 0.5) * 2, p.y + 1.6, p.z + (Math.random() - 0.5) * 2, 0x2b2823);
      }
      if (p.dying <= 0) for (let i = 0; i < 2; i++) boomAt(ctx, p.x + (Math.random() - 0.5) * 2.4, 1.0, p.z + (Math.random() - 0.5) * 2.4);
    }
  }

  /* a round that lands on something with an engine: the canopy, the airframe,
     the armour. Body hits on a descending man still use the normal path. */
  const _wb = new T.Box3(), _mz = new T.Vector3();
  function airDamage(ctx, p, at, box, force) {
    if (!p || p.e.alive === false) return;
    const h = Math.max(0.6, box.max.y - box.min.y);
    let crit = at.y > box.min.y + h * 0.72;
    let dmg = p.air === "apc" ? (crit ? 3 : 1) : 1;
    if (p.air === "apc") {
      /* armour: 0.5 a round anywhere, 5 on the glowing vent, and while the
         main gun is charging, a round near the muzzle jams it */
      let weak = false;
      ((p.mesh.userData && p.mesh.userData.weak) || []).forEach((w) => {
        _wb.setFromObject(w).expandByScalar(0.35);
        if (_wb.containsPoint(at)) weak = true;
      });
      dmg = weak ? 5 : 0.5;
      if (weapon === "shotgun") dmg *= 0.5;
      crit = weak;
      const sp = screenOf(at, ctx.camera);
      if (p.charge > 0 && p.mesh.userData.cannonMuzzle) {
        p.mesh.userData.cannonMuzzle.getWorldPosition(_mz);
        if (_mz.distanceTo(at) < 1.6 || weak) {
          p.jam += 1;
          hitMark("block", sp.x, sp.y, false, "JAM " + p.jam + "/4");
          if (p.jam >= 4) {
            p.charge = 0; p.jam = 0; p.stun = 2.2; p.cannonT = 8 + Math.random() * 2;
            radio("주포 저지! 지금이다, 엔진 배기구를 노려라!", 3200);
            addPts(ctx, 300);
            burst(ctx.scene, _mz.x, _mz.y, _mz.z, true);
            if (p.glow) p.glow.visible = false;
            gun("boom");
          }
        }
      }
      if (weak) hitMark("kill", sp.x, sp.y, true, "WEAK!");
      else if (!(p.charge > 0)) hitMark("block", sp.x, sp.y, false, "ARMOR");
    }
    if (force != null) dmg = force;
    p.e.hp = (p.e.hp || 1) - dmg;
    p.hitFlash = 0.09;
    burst(ctx.scene, at.x, at.y, at.z, dmg >= 3 || p.e.hp <= 1);
    p.recoil = 1;
    if (p.air === "heli" && p.isBoss && p.charge > 0) {
      p.jam = (p.jam || 0) + 1;
      const sp = screenOf(at, ctx.camera);
      hitMark("block", sp.x, sp.y, false, "BREAK " + p.jam + "/5");
      if (p.jam >= 5) {
        p.charge = 0; p.jam = 0; p.rocketT = 7 + Math.random() * 2;
        if (p.pods) p.pods.forEach((m) => (m.visible = false));
        radio("로켓 발사 저지! 기체가 흔들린다!", 2600);
        addPts(ctx, 300);
      }
    }
    if (p.air === "heli") {
      grunt(false);
      if (p.e.hp <= 3 && p.gunnerAlive) {
        p.gunnerAlive = false;
        if (p.mesh.userData.gunner) p.mesh.userData.gunner.visible = false;
      }
    }
    window.__lastHitAir = { kind: p.air, dmg: dmg, hp: p.e.hp, crit: crit };
    window.__lastDmg = { role: p.role, head: crit, dmg: dmg };
    if ((p.air === "apc" || p.isBoss) && p.e.hp > 0) bossPhaseCheck(ctx, p);
    if (p.e.hp > 0) { gun(dmg >= 3 ? "crit" : "hit"); return; }
    if (p.air === "heli") {
      p.e.alive = false;
      p.fallV = -0.4;
      p.smokeT = 0;
      hitStop = Math.max(hitStop, 0.12);
      flashScreen(0.5);
      shake = 1.3;
      gun("boom");
      addPts(ctx, p.isBoss ? 3000 : 600);
      tagOff(p);
      window.__heliDown = (window.__heliDown || 0) + 1;
      if (p.isBoss) { window.__bossDown = (window.__bossDown || 0) + 1; radio("적 공격헬기 격추!", 2400); }
      return;
    }
    /* the armoured car goes up */
    p.e.alive = false;
    p.dying = 1.6;
    hitStop = Math.max(hitStop, 0.2);
    flashScreen(0.75);
    shake = 1.7;
    gun("boom");
    addPts(ctx, 2500);
    tagOff(p);
    for (let i = 0; i < 3; i++) boomAt(ctx, p.x + (Math.random() - 0.5) * 2.6, p.y + 1.1 + Math.random(), p.z + (Math.random() - 0.5) * 2.6);
    window.__bossDown = (window.__bossDown || 0) + 1;
    finish(ctx, true);
  }

  /* what the air units look like on screen, for the viewport check */
  function airReport(ctx) {
    const cam = ctx.camera;
    return posts.filter((p) => p.air).map((p) => {
      const v = new T.Vector3(p.x, p.y, p.z).project(cam);
      return {
        kind: p.air, hp: p.e.hp, alive: p.e.alive !== false,
        live: p.live !== false, y: +p.y.toFixed(2),
        ndc: [+v.x.toFixed(2), +v.y.toFixed(2)], inView: Math.abs(v.x) < 1 && Math.abs(v.y) < 1 && v.z < 1,
        chute: !!p.chuteOn, aim: +(p.aim || 0).toFixed(2)
      };
    });
  }

  window.RAIL = {
    get active() { return active; },
    get staged() { return staged; },
    get posts() { return posts; },
    get stage() { return stageId; },
    begin: (ctx, n) => begin(ctx, n),
    beginStage: (ctx, n) => begin(ctx, n),
    /* test hooks: what the air units look like on screen, and a way to clear
       the current wave so the later zones can be reached in a headless run */
    air: () => (window.__railCtx ? airReport(window.__railCtx) : []),
    shootAt: (x, y) => {
      const ctx = window.__railCtx;
      if (!ctx) return;
      aimN.x = (x / innerWidth) * 2 - 1;
      aimN.y = -(y / innerHeight) * 2 + 1;
      try { fire(ctx); } catch (err) { window.__fireErr = String(err && err.stack || err); }
    },
    hurt: (n) => { const ctx = window.__railCtx; if (ctx) hurtPlayer(ctx, n || 10); },
    killHeli: () => { const ctx = window.__railCtx; posts.slice().forEach((p) => { if (p.air === "heli" && p.live !== false && p.e.alive !== false) { p.e.hp = 1; airDamage(ctx, p, new T.Vector3(p.x, p.y, p.z), new T.Box3(new T.Vector3(p.x - 1, p.y - 1, p.z - 1), new T.Vector3(p.x + 1, p.y + 1, p.z + 1))); } }); },
    boom: (x, y, z) => { const ctx = window.__railCtx; if (ctx) boomAt(ctx, x, y, z); },
    win: () => { const ctx = window.__railCtx; if (ctx) finish(ctx, true); },
    killWave: () => {
      const ctx = window.__railCtx;
      if (!ctx) return 0;
      let n = 0;
      posts.slice().forEach((p) => {
        if (p.live === false || p.e.alive === false || p.role === "hostage") return;
        n++;
        if (p.air === "heli") { p.e.hp = 1; airDamage(ctx, p, new T.Vector3(p.x, p.y, p.z), new T.Box3(new T.Vector3(p.x - 1, p.y - 1, p.z - 1), new T.Vector3(p.x + 1, p.y + 1, p.z + 1))); }
        else if (p.air === "apc") { p.e.hp = 1; airDamage(ctx, p, new T.Vector3(p.x, p.y + 1.2, p.z), new T.Box3(new T.Vector3(p.x - 1, p.y, p.z - 1), new T.Vector3(p.x + 1, p.y + 2, p.z + 1)), 99); }
        else killPost(ctx, p, 100);
      });
      return n;
    },
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
    grenade: () => { try { throwGrenade(window.__railCtx); } catch (err) { window.__nadeErr = String(err && err.stack || err); } },
    giveWeapon: (w) => { if (w === "grenade") grenades += 2; else setWeapon(w); },
    reload: () => {
      if (!booted || !active || reloading || bullets >= clipMax || ended || weapon !== "pistol") return;
      reloading = true;
      reloadK = 1;
      tutEv("reload");
      gun("reload");
      setTimeout(() => { bullets = clipMax; reloading = false; }, 420);
    }
  };
})();
