/* fight-right-now · BF_CC0
 * CC0 3D character pilot: loads three CC0 glTF characters (Kenney, KayKit,
 * Quaternius), attaches them to the matching ROSTER fighters, and drives their
 * animation clips from the existing fighter state machine.
 * Every caller must treat a missing/failed load as "use the procedural voxel
 * model" - this module never throws into the game loop.
 * Licences: see assets/cc0/LICENSES.md (all three packs are CC0 1.0).
 */
(function () {
  if (window.BF_CC0) return;

  // ROSTER id -> asset key
  var ROSTER_MAP = {
    steve: 'kenney-hero',       // 바로 (주인공)
    wskel: 'kaykit-knight',     // 그림자 기사 (검사)
    grak: 'quaternius-warrior'  // 따또 (족장)
  };

  var FILES = {
    'kenney-hero': 'assets/cc0/kenney-hero.glb',
    'kaykit-knight': 'assets/cc0/kaykit-knight.glb',
    'quaternius-warrior': 'assets/cc0/quaternius-warrior.glb'
  };

  // role -> clip name in that file (empty = the model has no clip for it)
  var ROLES = {
    'kenney-hero': {
      idle: 'idle', walk: 'walk', run: 'sprint',
      jumpStart: '', jumpAir: '', jumpLand: '',
      guard: 'idle', hit: 'idle', knockdown: 'die', getup: '', cheer: '',
      defeat: 'die', dodge: '', atk: 'attack-melee-right', atkAlt: 'attack-melee-left'
    },
    'kaykit-knight': {
      idle: 'Idle', walk: 'Walking_A', run: 'Running_A',
      jumpStart: 'Jump_Start', jumpAir: 'Jump_Idle', jumpLand: 'Jump_Land',
      guard: 'Blocking', hit: 'Hit_A', knockdown: 'Lie_Down', getup: 'Lie_StandUp',
      cheer: 'Cheer', defeat: 'Death_A', dodge: 'Dodge_Forward',
      atk: '1H_Melee_Attack_Slice_Horizontal', atkAlt: '1H_Melee_Attack_Stab'
    },
    'quaternius-warrior': {
      idle: 'Idle', walk: 'Walk', run: 'Run',
      jumpStart: '', jumpAir: '', jumpLand: '',
      guard: 'Idle_Weapon', hit: 'RecieveHit', knockdown: 'Death', getup: '',
      cheer: '', defeat: 'Death', dodge: 'Roll',
      atk: 'Sword_Attack', atkAlt: 'Sword_Attack2'
    }
  };

  // fighter state -> role, plus whether that role loops
  var STATE_ROLE = {
    idle: ['idle', 1], walk: ['walk', 1], dash: ['run', 1],
    jsq: ['jumpStart', 0], air: ['jumpAir', 1], land: ['jumpLand', 0],
    guard: ['guard', 1], gstun: ['hit', 0], dodge: ['dodge', 0],
    hurt: ['hit', 0], tumble: ['hit', 0], down: ['knockdown', 0],
    getup: ['getup', 0], win: ['cheer', 0], lose: ['defeat', 0],
    grabbed: ['hit', 0], atk: ['atk', 0]
  };
  var LOOP_ROLES = { idle: 1, walk: 1, run: 1, guard: 1, jumpAir: 1 };

  var T = {};          // asset key -> {scene, animations, clips:{name:clip}, h}
  var LIVE = [];       // last built CC0 views (debug/inspection only)
  var readyCount = 0;
  var failed = {};
  var notified = false;

  function keyFor(id) { return ROSTER_MAP[id] || null; }
  function isReady(key) { return !!(key && T[key]); }

  function cloneSkinned(source) {
    var THREE = window.THREE;
    var clone = source.clone(true);
    var src = [], dst = [];
    source.traverse(function (o) { src.push(o); });
    clone.traverse(function (o) { dst.push(o); });
    var map = new Map();
    for (var i = 0; i < src.length; i++) map.set(src[i], dst[i]);
    clone.traverse(function (o) {
      if (!o.isSkinnedMesh || !o.skeleton) return;
      var s = src[dst.indexOf(o)];
      if (!s || !s.skeleton) return;
      var bones = s.skeleton.bones.map(function (b) { return map.get(b) || b; });
      var inv = s.skeleton.boneInverses.map(function (m) { return m.clone(); });
      o.bind(new THREE.Skeleton(bones, inv), o.bindMatrix.clone());
    });
    return clone;
  }

  function measure(root) {
    var THREE = window.THREE;
    root.updateMatrixWorld(true);
    var bb = new THREE.Box3().setFromObject(root);
    var s = bb.getSize(new THREE.Vector3());
    return { h: Math.max(0.2, s.y), minY: bb.min.y };
  }

  function prepareMaterials(root) {
    var mats = [];
    root.traverse(function (o) {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      if (o.isSkinnedMesh) o.frustumCulled = false;
      var m = o.material;
      if (Array.isArray(m)) {
        o.material = m.map(function (x) { return cloneMat(x, mats); });
      } else if (m) {
        o.material = cloneMat(m, mats);
      }
    });
    return mats;
  }

  function cloneMat(m, out) {
    var c = m.clone();
    c.transparent = false;
    c.opacity = 1;
    c.depthWrite = true;
    if (c.map) {
      c.map.anisotropy = 4;
      c.map.minFilter = window.THREE.LinearMipmapLinearFilter;
    }
    c.userData = c.userData || {};
    c.userData.e0 = c.emissive ? c.emissive.clone() : null;
    c.userData.ei0 = c.emissiveIntensity || 0;
    out.push(c);
    return c;
  }

  function load(key) {
    var THREE = window.THREE;
    if (!THREE || !THREE.GLTFLoader) { failed[key] = 'no loader'; return; }
    try {
      var loader = new THREE.GLTFLoader();
      loader.load(FILES[key], function (gltf) {
        try {
          var root = gltf.scene;
          var idleName = ROLES[key].idle;
          var clips = {};
          gltf.animations.forEach(function (a) { clips[a.name] = a; });
          if (idleName && clips[idleName]) {
            var mx = new THREE.AnimationMixer(root);
            var act = mx.clipAction(clips[idleName]);
            act.play();
            mx.update(0.2);
          }
          var m = measure(root);
          T[key] = { scene: root, animations: gltf.animations, clips: clips, h: m.h };
          readyCount++;
          onReady();
        } catch (e) {
          failed[key] = String(e && e.message || e);
        }
      }, undefined, function (err) {
        failed[key] = String(err && err.message || err);
        if (window.console) console.warn('BF_CC0 load failed', key, failed[key]);
      });
    } catch (e) {
      failed[key] = String(e && e.message || e);
    }
  }

  function onReady() {
    if (notified) return;
    var keys = Object.keys(FILES);
    if (readyCount < keys.length && Object.keys(failed).length === 0) return;
    notified = true;
    // portraits were drawn before the models arrived: redraw once they are in
    var BF = window.BlockFighter;
    if (!BF || !BF.UI || !BF.UI.portraits) return;
    try {
      if (!BF.UI._por) return;
      BF.UI._por = null;
      BF.UI.por = {};
      BF.UI.portraits();
      if (BF.UI.fillPortraits) BF.UI.fillPortraits();
    } catch (e) { /* portraits are cosmetic */ }
  }

  // Called from buildFighterModel(): returns a fighter-model bundle or null.
  function build(def) {
    var THREE = window.THREE;
    var key = keyFor(def.id);
    if (!key || !T[key]) return null;
    var t = T[key];
    var root = cloneSkinned(t.scene);
    var mats = prepareMaterials(root);
    var bb = measure(root);
    var s = def.H / bb.h;
    root.scale.multiplyScalar(s);
    root.position.y = -bb.minY * s;
    var mixer = new THREE.AnimationMixer(root);
    var view = {
      defId: def.id,
      obj: root,
      rig: {},
      rest: { tents: [] },
      mats: mats,
      cc0: { key: key, mixer: mixer, clips: t.clips, roles: ROLES[key], action: null, name: '', t: 0, st: '', fr: -1, atk: 0 }
    };
    playRole(view, 'idle', 0);
    LIVE.push(view);
    if (LIVE.length > 24) LIVE.shift();
    return view;
  }

  function actionFor(v, name) {
    var c = v.cc0;
    var clip = c.clips[name];
    if (!clip) return null;
    if (!c.actions) c.actions = {};
    var a = c.actions[name];
    if (!a) {
      a = c.mixer.clipAction(clip);
      c.actions[name] = a;
    }
    return a;
  }

  function playRole(v, roleName, fade, oneShotTimeScale) {
    var c = v.cc0;
    if (!c) return;
    var name = c.roles[roleName] || c.roles.idle;
    if (!name) return;
    var a = actionFor(v, name);
    if (!a) return;
    var loop = !!LOOP_ROLES[roleName];
    if (c.action === a && c.name === name && loop) {
      if (oneShotTimeScale) a.timeScale = oneShotTimeScale;
      return;
    }
    var prev = c.action;
    a.reset();
    a.enabled = true;
    a.setEffectiveWeight(1);
    a.setLoop(loop ? window.THREE.LoopRepeat : window.THREE.LoopOnce, loop ? Infinity : 1);
    a.clampWhenFinished = !loop;
    a.timeScale = oneShotTimeScale || 1;
    if (loop && prev && prev !== a) {
      // keep the phase when swapping walk <-> run so the feet keep their beat
      var ph = prev.time / Math.max(0.01, prev.getClip().duration);
      a.time = (ph % 1) * a.getClip().duration;
    }
    if (prev && prev !== a && fade > 0) a.crossFadeFrom(prev, fade, false);
    a.play();
    c.action = a;
    c.name = name;
  }

  // Called every rendered frame from syncViews() with the live fighter.
  function sync(v, F, t) {
    var c = v.cc0;
    if (!c) {
      // late arrival: swap the voxel model for the CC0 one in place
      var key = keyFor(F.def.id);
      if (!key || !T[key] || v.ccAttachTried) return;
      var bundle = build(F.def);
      if (!bundle) return;
      v.ccAttachTried = 1;
      try {
        if (v.obj && v.obj.parent) v.obj.parent.remove(v.obj);
        v.ball.add(bundle.obj);
        v.obj = bundle.obj;
        v.mats = bundle.mats;
        v.rig = {};
        v.rest = { tents: [] };
        v.cc0 = bundle.cc0;
        v.curlable = false;
        c = v.cc0;
      } catch (e) { return; }
      if (!c) return;
    }
    var now = (window.performance ? performance.now() : Date.now()) / 1000;
    var dt = c.t ? Math.min(0.1, Math.max(0, now - c.t)) : 0;
    c.t = now;

    var map = STATE_ROLE[F.st] || STATE_ROLE.idle;
    var roleName = map[0];
    var restart = (F.st !== c.st);
    if (F.st === 'atk' && F.fr < c.fr) restart = true;
    c.st = F.st;
    c.fr = F.fr;
    if (restart) {
      var ts = 1;
      if (F.st === 'atk' && F.mv) {
        var total = (F.mv.s || 0) + (F.mv.a || 0) + (F.mv.r || 0);
        var role = (F.atkN || 0);
        var nm = (role % 2) ? (c.roles.atkAlt || c.roles.atk) : c.roles.atk;
        var clip = c.clips[nm];
        if (clip && total > 0) ts = Math.min(2.2, Math.max(0.7, clip.duration / (total / 60)));
      }
      playOneShot(v, roleName, F, ts);
    }
    if (c.mixer) c.mixer.update(dt);
  }

  function playOneShot(v, roleName, F, ts) {
    var c = v.cc0;
    var name = c.roles[roleName] || '';
    if (roleName === 'atk' && F && (F.atkN | 0) % 2 && c.roles.atkAlt) name = c.roles.atkAlt;
    if (!name || !c.clips[name]) {
      // no clip for this state: fall back to idle but keep the body lean/scale
      playRole(v, 'idle', 0.08, 0);
      return;
    }
    var a = actionFor(v, name);
    if (!a) return;
    var loop = !!LOOP_ROLES[roleName];
    var prev = c.action;
    a.reset();
    a.enabled = true;
    a.setEffectiveWeight(1);
    a.setLoop(loop ? window.THREE.LoopRepeat : window.THREE.LoopOnce, loop ? Infinity : 1);
    a.clampWhenFinished = !loop;
    a.timeScale = ts || 1;
    var fade = (roleName === 'hit' || roleName === 'atk') ? 0.06 : 0.12;
    if (prev && prev !== a) a.crossFadeFrom(prev, fade, false);
    a.play();
    c.action = a;
    c.name = name;
  }

  function status() {
    var out = { loaded: Object.keys(T), failed: failed, map: ROSTER_MAP, assets: {} };
    Object.keys(T).forEach(function (k) {
      out.assets[k] = { height: +T[k].h.toFixed(3), clips: Object.keys(T[k].clips) };
    });
    return out;
  }

  window.BF_CC0 = {
    keyFor: keyFor,
    isReady: isReady,
    build: build,
    sync: sync,
    status: status,
    debug: function () {
      return LIVE.map(function (v) {
        var c = v.cc0 || {};
        return {
          id: v.defId, clip: c.name, st: c.st, fr: c.fr,
          t: c.action ? +c.action.time.toFixed(2) : null,
          running: c.action ? c.action.isRunning() : null,
          visible: !!(v.root && v.root.visible),
          y: v.root ? +v.root.position.y.toFixed(2) : null
        };
      });
    },
    tpl: T,
    files: FILES,
    roles: ROLES
  };

  Object.keys(FILES).forEach(load);
})();
