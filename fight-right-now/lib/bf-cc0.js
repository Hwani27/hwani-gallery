/* fight-right-now · BF_CC0
 * KayKit CC0 fighters: loads four KayKit "Character Pack: Adventurers" glTF
 * characters (Knight / Barbarian / Rogue / Mage) as their own playable roster
 * entries and drives their animation clips from the existing fighter state
 * machine (idle, walk/back, run, jump start/air/land, dodge, block, block-hit,
 * hit, knockdown, get-up, combo chain, ranged/skill cast, super, win, death).
 * The 17 original voxel characters are untouched: nothing here maps to them,
 * and every caller treats a missing/failed load as "use the def's voxel model".
 * Never throws into the game loop.
 * Licences: see assets/cc0/LICENSES.md (KayKit is CC0 1.0).
 */
(function () {
  if (window.BF_CC0) return;

  // ROSTER id -> asset key (only the KayKit newcomers)
  var ROSTER_MAP = {
    kk_knight: 'kaykit-knight',   // 기사
    kk_barb: 'kaykit-barbarian',  // 야만전사
    kk_rogue: 'kaykit-rogue',     // 도적
    kk_mage: 'kaykit-mage'        // 마법사
  };

  var FILES = {
    'kaykit-knight': 'assets/cc0/kaykit-knight.glb',
    'kaykit-barbarian': 'assets/cc0/kaykit-barbarian.glb',
    'kaykit-rogue': 'assets/cc0/kaykit-rogue.glb',
    'kaykit-mage': 'assets/cc0/kaykit-mage.glb'
  };

  // Clips shared by every Adventurers character (same 76-clip skeleton).
  var BASE = {
    idle: 'Idle', walk: 'Walking_A', back: 'Walking_Backwards', run: 'Running_A',
    jumpStart: 'Jump_Start', jumpAir: 'Jump_Idle', jumpLand: 'Jump_Land',
    guard: 'Blocking', guardHit: 'Block_Hit',
    hit: 'Hit_A', hitB: 'Hit_B',
    knockdown: 'Lie_Down', getup: 'Lie_StandUp',
    cheer: 'Cheer', defeat: 'Death_A',
    dodgeF: 'Dodge_Forward', dodgeB: 'Dodge_Backward'
  };

  // Per-character fighting flavour: combo chain, ranged cast, throw, super.
  var SETS = {
    'kaykit-knight': {
      atk: ['1H_Melee_Attack_Slice_Horizontal', '1H_Melee_Attack_Chop',
        '1H_Melee_Attack_Slice_Diagonal', '1H_Melee_Attack_Stab'],
      cast: '1H_Ranged_Shoot', throw: '1H_Melee_Attack_Stab',
      super: '2H_Melee_Attack_Spin'
    },
    'kaykit-barbarian': {
      atk: ['1H_Melee_Attack_Chop', '1H_Melee_Attack_Slice_Diagonal',
        '1H_Melee_Attack_Slice_Horizontal', '2H_Melee_Attack_Chop'],
      cast: 'Throw', throw: 'Throw', super: '2H_Melee_Attack_Spin'
    },
    'kaykit-rogue': {
      atk: ['Dualwield_Melee_Attack_Slice', 'Dualwield_Melee_Attack_Chop',
        'Dualwield_Melee_Attack_Stab', '1H_Melee_Attack_Stab'],
      cast: 'Throw', throw: 'Throw', super: 'Dualwield_Melee_Attack_Slice'
    },
    'kaykit-mage': {
      atk: ['1H_Melee_Attack_Stab', '1H_Melee_Attack_Chop',
        '1H_Melee_Attack_Stab', '1H_Melee_Attack_Slice_Diagonal'],
      cast: 'Spellcast_Shoot', throw: '1H_Melee_Attack_Stab',
      super: 'Spellcast_Raise'
    }
  };

  var ROLES = {};
  Object.keys(SETS).forEach(function (k) {
    var r = {};
    for (var n in BASE) r[n] = BASE[n];
    for (var m in SETS[k]) r[m] = SETS[k][m];
    ROLES[k] = r;
  });

  // Move key -> slot in the character's combo chain (-2 = throw clip)
  var ATK_IDX = {
    j1: 0, j2: 1, j3: 2, j4: 3,
    fs: 1, us: 3, ds: 0, na: 0, fa: 1, ua: 3, da: 2,
    upS: 3, dnS: 1, rs: 0, thr: -2, grab: -2
  };

  var LOOP_ROLES = { idle: 1, walk: 1, back: 1, run: 1, guard: 1, jumpAir: 1 };

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
    if (readyCount + Object.keys(failed).length < keys.length) return;
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
      cc0: { key: key, mixer: mixer, clips: t.clips, set: ROLES[key], action: null, name: '', t: 0, st: '', fr: -1, dash: 0 }
    };
    playRole(view, 'idle', 0);
    LIVE.push(view);
    if (LIVE.length > 32) LIVE.shift();
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

  // Which clip plays for the fighter's current state/move.
  function roleFor(F, v) {
    var st = F.st;
    if (st === 'atk') {
      var mv = F.mv || {};
      if (mv.super) return 'super';
      if (mv.proj) return 'cast';
      var idx = ATK_IDX[mv.key];
      if (idx === -2) return 'throw';
      return 'atk';
    }
    if (st === 'walk') {
      // walking away from the opponent: use the back-pedal cycle
      if (F.vx && F.face && F.vx * F.face < -0.02) return 'back';
      return 'walk';
    }
    if (st === 'dash') return 'run';
    if (st === 'jsq') return 'jumpStart';
    if (st === 'air') return 'jumpAir';
    if (st === 'land') return 'jumpLand';
    if (st === 'guard') return 'guard';
    if (st === 'gstun') return 'guardHit';
    if (st === 'dodge') {
      var dir = F.dodgeDir || F.face || 1;
      return (F.face && dir !== F.face) ? 'dodgeB' : 'dodgeF';
    }
    if (st === 'hurt') return 'hit';
    if (st === 'tumble') return 'hitB';
    if (st === 'down') return 'knockdown';
    if (st === 'getup') return 'getup';
    if (st === 'win') return 'cheer';
    if (st === 'lose') return 'defeat';
    if (st === 'grabbed') return 'hit';
    return 'idle';
  }

  function clipFor(v, role, F) {
    var set = v.cc0.set;
    if (role === 'atk') {
      var mv = (F && F.mv) || {};
      var seq = set.atk || [set.idle];
      var i = ATK_IDX[mv.key];
      if (i === undefined || i < 0) i = 0;
      return seq[i % seq.length];
    }
    if (role === 'super') return set.super || set.atk[0];
    if (role === 'cast') return set.cast || set.atk[0];
    if (role === 'throw') return set.throw || set.atk[0];
    return set[role] || '';
  }

  function playRole(v, roleName, fade, oneShotTimeScale) {
    var c = v.cc0;
    if (!c) return;
    var name = clipFor(v, roleName);
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

    var roleName = roleFor(F, v);
    var restart = (F.st !== c.st);
    if (F.st === 'atk' && F.fr < c.fr) restart = true;
    c.st = F.st;
    c.fr = F.fr;
    if (restart) {
      var ts = 1;
      if (F.st === 'atk' && F.mv) {
        var total = (F.mv.s || 0) + (F.mv.a || 0) + (F.mv.r || 0);
        var nm = clipFor(v, roleName, F);
        var clip = c.clips[nm];
        if (clip && total > 0) ts = Math.min(2.2, Math.max(0.7, clip.duration / (total / 60)));
      }
      playOneShot(v, roleName, F, ts);
    }
    if (c.mixer) c.mixer.update(dt);
  }

  function playOneShot(v, roleName, F, ts) {
    var c = v.cc0;
    var name = clipFor(v, roleName, F);
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
    var fade = (roleName === 'hit' || roleName === 'hitB' || roleName === 'atk' ||
      roleName === 'cast' || roleName === 'throw') ? 0.06 : 0.12;
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
