/* Procedural gun kit for 지금 바로 쏴!.
   Layers (written from scratch, no sample or third-party audio code):
   a supersonic crack, a low chest thump, a short mid bark, a mechanical
   slide tick, a brass clink, and a concrete-street tail on a reverb send.
   Rides the jump engine's own audio bus so the game's mute switch and
   master volume still apply. */
(function () {
  let ctx = null;
  let bus = null;
  let comp = null;
  let wetGain = null;
  let conv = null;
  let shaper = null;

  function muted() {
    try {
      if (typeof AFX !== "undefined" && AFX.on && !AFX.on()) return true;
    } catch (e) {}
    try {
      if (typeof SFX !== "undefined" && SFX.isOn && !SFX.isOn()) return true;
    } catch (e) {}
    return false;
  }

  function impulse(c, seconds, decay, spread) {
    const n = Math.max(1, Math.floor(c.sampleRate * seconds));
    const buf = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const early = i < c.sampleRate * 0.045 && Math.random() < 0.02 ? 0.7 : 0;
        d[i] = ((Math.random() * 2 - 1) * Math.pow(1 - t, decay) + early) * spread;
      }
    }
    return buf;
  }

  function ac() {
    if (!ctx) {
      let engineCtx = null;
      try {
        if (typeof AFX !== "undefined" && AFX.ac) engineCtx = AFX.ac();
      } catch (e) {}
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = engineCtx || new AC();
      let dest = null;
      try {
        if (typeof AFX !== "undefined" && AFX.sfxBus) dest = AFX.sfxBus();
      } catch (e) {}
      setTimeout(() => loadSamples(ctx), 0);
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 14;
      comp.ratio.value = 6.5;
      comp.attack.value = 0.002;
      comp.release.value = 0.22;
      const out = ctx.createGain();
      out.gain.value = 0.92;
      bus = ctx.createGain();
      bus.gain.value = 1;
      // soft limiter before the game bus
      shaper = ctx.createWaveShaper();
      const curve = new Float32Array(512);
      for (let i = 0; i < 512; i++) {
        const x = (i / 511) * 2 - 1;
        curve[i] = Math.tanh(x * 2.4);
      }
      shaper.curve = curve;
      shaper.oversample = "2x";
      bus.connect(comp);
      comp.connect(shaper);
      shaper.connect(out);
      out.connect(dest || ctx.destination);

      // small concrete-street tail
      conv = ctx.createConvolver();
      try {
        conv.buffer = impulse(ctx, 0.85, 3.4, 0.55);
      } catch (e) {}
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 260;
      wetGain = ctx.createGain();
      wetGain.gain.value = 0.17;
      bus.connect(conv);
      conv.connect(hp);
      hp.connect(wetGain);
      wetGain.connect(comp);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /* (v26) recorded sounds, when there are any: sfx/manifest.json maps a key
     to a file in sfx/ ({"loop_rotor": "heli.ogg", "explosion": ["a.ogg","b.ogg"]}).
     Every key that has a file plays it; every key without one keeps the
     synthesized sound, so the folder can be filled in one file at a time. */
  const SMP = { buf: {}, tried: false };
  function loadSamples(c) {
    if (SMP.tried || typeof fetch === "undefined") return;
    SMP.tried = true;
    fetch("sfx/manifest.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : {})).then((m) => {
      Object.keys(m || {}).forEach((k) => {
        [].concat(m[k]).forEach((f) => {
          fetch("sfx/" + f).then((r) => r.arrayBuffer()).then((b) => new Promise((ok, no) => c.decodeAudioData(b, ok, no))).then((buf) => {
            (SMP.buf[k] = SMP.buf[k] || []).push(buf);
          }).catch(() => {});
        });
      });
    }).catch(() => {});
  }
  function hasSample(k) { return !!(SMP.buf[k] && SMP.buf[k].length); }
  function playSample(k, gain, rate, dest) {
    const L = SMP.buf[k];
    if (!L || !L.length || !ctx) return false;
    const src = ctx.createBufferSource();
    src.buffer = L[(Math.random() * L.length) | 0];
    src.playbackRate.value = rate || 1;
    const g = ctx.createGain(); g.gain.value = gain == null ? 0.8 : gain;
    src.connect(g); g.connect(dest || bus);
    src.start();
    return true;
  }

  function noise(c, seconds) {
    const n = Math.max(1, Math.floor(c.sampleRate * seconds));
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function band(c, t, dur, type, freq, q, gain, attack, decay, dest, q2) {
    const src = c.createBufferSource();
    src.buffer = noise(c, Math.max(dur, 0.02));
    src.playbackRate.value = 0.92 + Math.random() * 0.16;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (q2) f.frequency.exponentialRampToValueAtTime(Math.max(60, q2), t + dur);
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    src.start(t);
    src.stop(t + dur + 0.03);
    return src;
  }

  function thump(c, t, f0, f1, dur, gain, dest, type, bend) {
    const o = c.createOscillator();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(24, f1), t + (bend || dur));
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.02);
    return o;
  }

  function ping(c, t, freq, dur, gain, dest) {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(freq, t);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function shot() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    const v = 0.93 + Math.random() * 0.14;
    // supersonic crack
    band(c, t, 0.05, "highpass", 4200 * v, 0.6, 0.95, 0.0008, 0.022, bus, 2600);
    band(c, t, 0.1, "bandpass", 2600 * v, 0.9, 0.6, 0.001, 0.045, bus);
    // mid bark of the muzzle
    band(c, t + 0.002, 0.14, "bandpass", 1100 * v, 0.7, 0.5, 0.002, 0.07, bus, 700);
    // low chest thump plus a pitched body drop
    thump(c, t, 168 * v, 46, 0.16, 0.85, bus, "sine");
    thump(c, t, 96 * v, 40, 0.22, 0.35, bus, "triangle");
    band(c, t, 0.2, "lowpass", 420 * v, 0.6, 0.34, 0.002, 0.14, bus);
    // slide cycling and a brass casing tick
    band(c, t + 0.028, 0.03, "bandpass", 3300, 3.2, 0.2, 0.001, 0.02, bus);
    ping(c, t + 0.036, 5200 * v, 0.045, 0.05, bus);
    ping(c, t + 0.055, 7400 * v, 0.03, 0.028, bus);
    // concrete street tail
    band(c, t + 0.02, 0.4, "lowpass", 1500, 0.5, 0.22, 0.01, 0.33, bus, 500);
  }

  function dryFire() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    band(c, t, 0.022, "highpass", 4600, 0.8, 0.34, 0.0006, 0.012, bus);
    band(c, t + 0.004, 0.03, "bandpass", 2200, 2.4, 0.2, 0.0008, 0.016, bus);
    ping(c, t, 3100, 0.03, 0.07, bus);
    thump(c, t, 320, 180, 0.03, 0.06, bus);
  }

  /* the pump gun: a deep, wide blast with a long tail, then the pump */
  function shotgun() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    thump(c, t, 120, 46, 0.12, 0.34, bus);
    band(c, t, 0.24, "lowpass", 1800, 0.7, 0.9, 0.001, 0.2, bus);
    band(c, t + 0.005, 0.12, "bandpass", 3200, 0.9, 0.5, 0.001, 0.1, bus);
    band(c, t + 0.34, 0.05, "bandpass", 1700, 2.2, 0.3, 0.001, 0.04, bus);
    band(c, t + 0.44, 0.05, "bandpass", 2300, 2.2, 0.34, 0.001, 0.04, bus);
    ping(c, t + 0.445, 3100, 0.04, 0.06, bus);
  }
  /* the sub-machine gun: a short, tight crack, light enough to stack */
  function smg() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    thump(c, t, 200, 80, 0.04, 0.16, bus);
    band(c, t, 0.06, "bandpass", 2600, 0.9, 0.5, 0.0006, 0.05, bus);
    band(c, t, 0.03, "highpass", 5200, 0.7, 0.24, 0.0005, 0.02, bus);
  }
  /* a pane going: a bright crack, then a shower of little tinkling pings */
  function glass() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    band(c, t, 0.05, "highpass", 3800, 0.7, 0.5, 0.0005, 0.03, bus);
    band(c, t + 0.01, 0.18, "bandpass", 6200, 1.4, 0.22, 0.002, 0.14, bus);
    for (let i = 0; i < 9; i++) {
      ping(c, t + 0.04 + i * 0.035 + Math.random() * 0.03, 3200 + Math.random() * 4200, 0.03 + Math.random() * 0.03, 0.05 + Math.random() * 0.06, bus);
    }
  }
  /* a shop sign torn loose: a metal clank and a clatter */
  function clank() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    ping(c, t, 820, 0.12, 0.22, bus);
    ping(c, t + 0.01, 1330, 0.08, 0.16, bus);
    thump(c, t, 180, 90, 0.08, 0.14, bus, "triangle");
    band(c, t + 0.02, 0.08, "bandpass", 2400, 2.0, 0.2, 0.001, 0.06, bus);
  }

  /* (v26) a motorcycle that sounds like one: not a buzzing saw but a train
     of exhaust pops. A pulse wave (many equal harmonics) at the firing rate,
     a soft clip, a low exhaust resonance and a puff of noise gated by every
     pop; the firing rate is the rev. */
  let pulseWave = null;
  function bikeVoice(c, out, nodes, base) {
    if (!pulseWave) {
      const N = 28, re = new Float32Array(N + 1), im = new Float32Array(N + 1);
      for (let n = 1; n <= N; n++) re[n] = 1 / (1 + n * 0.09) * (n % 2 ? 1 : 0.8);
      pulseWave = c.createPeriodicWave(re, im);
    }
    const st = (o) => { o.start(); nodes.push(o); return o; };
    const fire = c.createOscillator(); fire.setPeriodicWave(pulseWave); fire.frequency.value = base; st(fire);
    const sh = c.createWaveShaper();
    const cv = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; cv[i] = Math.tanh(x * 2.2); } sh.curve = cv;
    const pre = c.createGain(); pre.gain.value = 0.09;
    const body = c.createBiquadFilter(); body.type = "lowpass"; body.frequency.value = 820; body.Q.value = 0.9;
    const pipe = c.createBiquadFilter(); pipe.type = "peaking"; pipe.frequency.value = 150; pipe.Q.value = 1.2; pipe.gain.value = 9;
    const g = c.createGain(); g.gain.value = 0.55;
    fire.connect(pre); pre.connect(sh); sh.connect(body); body.connect(pipe); pipe.connect(g); g.connect(out);
    /* exhaust breath: noise opened by each pop */
    const nz = c.createBufferSource(); nz.buffer = noise(c, 2); nz.loop = true; st(nz);
    const nb = c.createBiquadFilter(); nb.type = "bandpass"; nb.frequency.value = 1300; nb.Q.value = 0.8;
    const gate = c.createGain(); gate.gain.value = 0;
    const pop = c.createOscillator(); pop.type = "square"; pop.frequency.value = base; st(pop);
    const pg = c.createGain(); pg.gain.value = 0.06; pop.connect(pg); pg.connect(gate.gain);
    nz.connect(nb); nb.connect(gate); gate.connect(out);
    /* a rider never holds the throttle dead still */
    const wob = c.createOscillator(); wob.type = "sine"; wob.frequency.value = 2.3; st(wob);
    const wg = c.createGain(); wg.gain.value = base * 0.035; wob.connect(wg); wg.connect(fire.frequency); wg.connect(pop.frequency);
    return { fire, pop };
  }
  function motor() {
    if (muted()) return;
    const c = ac();
    if (playSample("bike_pass", 0.7, 0.95 + Math.random() * 0.1)) return;
    const t = c.currentTime;
    const out = c.createGain(), nodes = [];
    out.connect(bus);
    const v = bikeVoice(c, out, nodes, 30);
    /* blip, first gear, second gear, roll off */
    [v.fire.frequency, v.pop.frequency].forEach((f) => {
      f.setValueAtTime(30, t);
      f.linearRampToValueAtTime(58, t + 0.35);
      f.linearRampToValueAtTime(72, t + 0.9);
      f.linearRampToValueAtTime(52, t + 1.0);
      f.linearRampToValueAtTime(80, t + 1.7);
      f.linearRampToValueAtTime(36, t + 2.3);
    });
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.5, t + 0.1);
    out.gain.setValueAtTime(0.5, t + 1.8);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    nodes.forEach((n) => { try { n.stop(t + 2.5); } catch (e) {} });
  }

  /* (v21) looping engines: rotor thump for helicopters, a diesel growl for
     tanks and APCs, a buzzing two-stroke for bikes, the jeep's own motor.
     The game calls loop(id, kind, gain) every frame for every running
     engine; one not refreshed for 0.4 s fades out by itself. */
  const LOOPS = {};
  let loopTimer = null;
  function makeLoop(c, kind) {
    const out = c.createGain();
    out.gain.value = 0.0001;
    out.connect(bus);
    const nodes = [];
    if (hasSample("loop_" + kind)) {
      const L = SMP.buf["loop_" + kind];
      const src = c.createBufferSource(); src.buffer = L[0]; src.loop = true;
      src.loopStart = 0; src.start(0, Math.random() * L[0].duration); nodes.push(src);
      src.connect(out);
      return { out, nodes, kind, seen: 0, a: null, smp: src };
    }
    const osc = (type, f) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.start(); nodes.push(o); return o; };
    const lp = (f, q) => { const b = c.createBiquadFilter(); b.type = "lowpass"; b.frequency.value = f; b.Q.value = q || 0.8; return b; };
    if (kind === "rotor") {
      /* blade slap: filtered noise chopped by an 11 Hz square, plus a low whine */
      const src = c.createBufferSource(); src.buffer = noise(c, 2); src.loop = true; src.start(); nodes.push(src);
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 380; bp.Q.value = 0.7;
      const chop = c.createGain(); chop.gain.value = 0.5;
      const lfo = osc("square", 11); const lfoG = c.createGain(); lfoG.gain.value = 0.5; lfo.connect(lfoG); lfoG.connect(chop.gain);
      src.connect(bp); bp.connect(chop); chop.connect(out);
      const wh = osc("sawtooth", 62); const wf = lp(240); const wg = c.createGain(); wg.gain.value = 0.35; wh.connect(wf); wf.connect(wg); wg.connect(out);
    } else if (kind === "diesel") {
      const a = osc("sawtooth", 38), b = osc("square", 19.5);
      const f = lp(300, 2.4); const g = c.createGain(); g.gain.value = 0.7;
      const lfo = osc("sine", 7); const lg = c.createGain(); lg.gain.value = 0.25; lfo.connect(lg); lg.connect(g.gain);
      a.connect(f); b.connect(f); f.connect(g); g.connect(out);
      const src = c.createBufferSource(); src.buffer = noise(c, 2); src.loop = true; src.start(); nodes.push(src);
      const nf = lp(180); const ng = c.createGain(); ng.gain.value = 0.35; src.connect(nf); nf.connect(ng); ng.connect(out);
    } else if (kind === "bike") {
      const v = bikeVoice(c, out, nodes, 46);
      return { out, nodes, kind, seen: 0, a: v.fire, b: v.pop, base: 46 };
    } else {
      /* jeep */
      const base = kind === "jeep" ? 52 : 88;
      const a = osc("sawtooth", base), b = osc("square", base / 2);
      const f = lp(kind === "jeep" ? 620 : 1100, 3); const g = c.createGain(); g.gain.value = 0.6;
      const lfo = osc("sine", kind === "jeep" ? 5 : 9); const lg = c.createGain(); lg.gain.value = base * 0.06; lfo.connect(lg); lg.connect(a.frequency);
      a.connect(f); b.connect(f); f.connect(g); g.connect(out);
    }
    return { out, nodes, kind, seen: 0, a: nodes[0] };
  }
  function loopTick() {
    const c = ctx;
    if (!c) return;
    const now = performance.now();
    Object.keys(LOOPS).forEach((id) => {
      const L = LOOPS[id];
      if (now - L.seen > 400) {
        try { L.out.gain.setTargetAtTime(0.0001, c.currentTime, 0.12); } catch (e) {}
        if (now - L.seen > 1500) {
          L.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
          try { L.out.disconnect(); } catch (e) {}
          delete LOOPS[id];
        }
      }
    });
    if (!Object.keys(LOOPS).length) { clearInterval(loopTimer); loopTimer = null; }
  }
  function loop(id, kind, gain, pitch) {
    if (muted()) { stopLoops(); return; }
    let c = null;
    try { c = ac(); } catch (e) { return; }
    let L = LOOPS[id];
    if (!L) { L = LOOPS[id] = makeLoop(c, kind); }
    L.seen = performance.now();
    const gv = Math.max(0.0001, Math.min(0.5, gain || 0));
    try { L.out.gain.setTargetAtTime(gv, c.currentTime, 0.08); } catch (e) {}
    if (pitch && L.smp) { try { L.smp.playbackRate.setTargetAtTime(Math.max(0.5, Math.min(2, pitch)), c.currentTime, 0.1); } catch (e) {} }
    if (pitch && L.a && L.a.frequency && kind !== "rotor") {
      try {
        const f = (L.base || (kind === "jeep" ? 52 : kind === "diesel" ? 38 : 88)) * pitch;
        L.a.frequency.setTargetAtTime(f, c.currentTime, 0.1);
        if (L.b) L.b.frequency.setTargetAtTime(f, c.currentTime, 0.1);
      } catch (e) {}
    }
    if (!loopTimer) loopTimer = setInterval(loopTick, 200);
  }
  function stopLoops() {
    Object.keys(LOOPS).forEach((id) => {
      const L = LOOPS[id];
      L.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
      try { L.out.disconnect(); } catch (e) {}
      delete LOOPS[id];
    });
  }

  function reload() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    // magazine release
    band(c, t, 0.03, "bandpass", 2600, 2.6, 0.24, 0.0008, 0.018, bus);
    ping(c, t + 0.005, 3600, 0.03, 0.05, bus);
    // magazine pulled and seated
    band(c, t + 0.1, 0.06, "bandpass", 1500, 1.2, 0.22, 0.002, 0.04, bus);
    thump(c, t + 0.15, 210, 120, 0.07, 0.16, bus, "triangle");
    band(c, t + 0.152, 0.05, "bandpass", 900, 1.8, 0.28, 0.001, 0.03, bus);
    // slide rack: chk - clack
    band(c, t + 0.26, 0.035, "bandpass", 3400, 2.2, 0.3, 0.0008, 0.022, bus, 2400);
    ping(c, t + 0.262, 2900, 0.04, 0.07, bus);
    band(c, t + 0.33, 0.05, "bandpass", 2100, 2.6, 0.34, 0.0008, 0.03, bus);
    ping(c, t + 0.334, 4300, 0.06, 0.1, bus);
    thump(c, t + 0.336, 260, 140, 0.06, 0.12, bus, "sine");
    // recoil spring ring out
    ping(c, t + 0.37, 1700, 0.12, 0.03, bus);
  }

  /* an enemy rifle from across the street: a sharper, harder crack than the
     player's pistol, with the tail the walls throw back */
  function rifle() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    const v = 0.94 + Math.random() * 0.12;
    band(c, t, 0.045, "highpass", 5200 * v, 0.7, 0.85, 0.0006, 0.02, bus, 3000);
    band(c, t, 0.1, "bandpass", 3000 * v, 0.8, 0.62, 0.001, 0.05, bus);
    band(c, t + 0.002, 0.16, "bandpass", 900 * v, 0.6, 0.42, 0.002, 0.09, bus, 600);
    thump(c, t, 150 * v, 44, 0.18, 0.72, bus, "sine");
    thump(c, t, 84 * v, 36, 0.26, 0.3, bus, "triangle");
    band(c, t + 0.03, 0.5, "lowpass", 1200, 0.5, 0.2, 0.012, 0.42, bus, 420);
    ping(c, t + 0.05, 5600 * v, 0.05, 0.035, bus);
  }

  function hit() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    band(c, t, 0.05, "bandpass", 1800, 1.4, 0.3, 0.0008, 0.03, bus, 900);
    band(c, t, 0.08, "lowpass", 700, 0.9, 0.26, 0.001, 0.05, bus);
    thump(c, t, 520, 150, 0.09, 0.22, bus, "triangle");
    ping(c, t + 0.008, 1200, 0.05, 0.05, bus);
  }

  /* (v69) the sniper: one heavy crack with a long tail down the street, a
     lower boom than the rifle and a rolling echo behind it */
  function snipe() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    const v = 0.96 + Math.random() * 0.08;
    band(c, t, 0.04, "highpass", 6200 * v, 0.9, 0.9, 0.0005, 0.02, bus, 3200);
    band(c, t, 0.12, "bandpass", 2400 * v, 0.9, 0.7, 0.001, 0.07, bus);
    band(c, t + 0.004, 0.22, "bandpass", 760 * v, 0.55, 0.5, 0.002, 0.14, bus, 500);
    thump(c, t, 190 * v, 40, 0.24, 0.92, bus, "sine");
    thump(c, t, 74 * v, 30, 0.34, 0.42, bus, "triangle");
    band(c, t + 0.05, 0.85, "lowpass", 900, 0.4, 0.16, 0.02, 0.7, bus, 320);
    ping(c, t + 0.06, 6400 * v, 0.04, 0.03, bus);
  }

  /* a headshot: a bright, short metallic tink two octaves above the hit
     thud, so a skull hit is heard before it is read on the screen */
  function crit() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    const v = 0.98 + Math.random() * 0.05;
    band(c, t, 0.03, "highpass", 6200 * v, 0.9, 0.42, 0.0006, 0.018, bus);
    ping(c, t, 1760 * v, 0.075, 0.12, bus);
    ping(c, t + 0.045, 2640 * v, 0.11, 0.1, bus);
    ping(c, t + 0.085, 3520 * v, 0.09, 0.055, bus);
    thump(c, t, 640, 240, 0.06, 0.14, bus, "triangle");
  }

  /* ------------------------------------------------------------------
     Voice: hit and death grunts — "윽!" when a soldier is only winged,
     a falling "으악!" when the round puts him down.

     No samples: a sawtooth glottal source with a pitch envelope and a
     slow vibrato feeds three parallel bandpass formant resonators, so the
     vowel itself is synthesised. The death cry starts on a closed 으 and
     glides its formants to an open 악 while the pitch collapses, then the
     breath runs out into a chest rattle.
     (v33) back by request: this synthesized voice, not the recordings.
     ------------------------------------------------------------------ */
  const FORMANTS = {
    eu: [318, 1265, 2390],   // 으 / 윽
    a:  [790, 1215, 2520]    // 아 / 악
  };
  let lastGruntAt = 0;
  let liveGrunt = 0;

  function playHitGrunt(fatal) {
    if (muted()) return false;
    let c = null;
    try { c = ac(); } catch (e) { return false; }
    if (!c) return false;
    const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (nowMs - lastGruntAt < (fatal ? 70 : 45)) return false;
    if (liveGrunt > 4) return false;
    lastGruntAt = nowMs;
    liveGrunt++;

    fatal = !!fatal;
    const t = c.currentTime + 0.02;
    const pv = 0.88 + Math.random() * 0.27;          // 0.88 ~ 1.15
    const dur = fatal ? 0.62 + Math.random() * 0.12 : 0.22 + Math.random() * 0.06;
    const base = (fatal ? 134 : 156) * pv;

    // --- glottal source: pitch jumps on the hit, then collapses
    const glottal = c.createOscillator();
    glottal.type = "sawtooth";
    glottal.frequency.setValueAtTime(base * 1.06, t);
    if (fatal) {
      glottal.frequency.linearRampToValueAtTime(base * 1.26, t + 0.06);
      glottal.frequency.exponentialRampToValueAtTime(base * 0.66, t + dur * 0.72);
      glottal.frequency.exponentialRampToValueAtTime(base * 0.42, t + dur);
    } else {
      glottal.frequency.exponentialRampToValueAtTime(base * 0.72, t + dur);
    }
    // a second source a hair flat thickens it into a human throat
    const glottal2 = c.createOscillator();
    glottal2.type = "sawtooth";
    glottal2.detune.value = -9;
    glottal2.frequency.setValueAtTime(base * 1.06, t);
    if (fatal) {
      glottal2.frequency.linearRampToValueAtTime(base * 1.26, t + 0.06);
      glottal2.frequency.exponentialRampToValueAtTime(base * 0.66, t + dur * 0.72);
      glottal2.frequency.exponentialRampToValueAtTime(base * 0.42, t + dur);
    } else {
      glottal2.frequency.exponentialRampToValueAtTime(base * 0.72, t + dur);
    }
    // voice wobble
    const vib = c.createOscillator();
    vib.frequency.value = 6.2 + Math.random() * 2.8;
    const vibGain = c.createGain();
    vibGain.gain.value = base * (fatal ? 0.05 : 0.032);
    vib.connect(vibGain);
    vibGain.connect(glottal.frequency);

    const src = c.createGain();
    src.gain.value = 0.62;
    glottal.connect(src);
    glottal2.connect(src);

    // --- breath through the open throat
    const breath = c.createBufferSource();
    breath.buffer = noise(c, Math.max(dur, 0.06));
    const bf = c.createBiquadFilter();
    bf.type = "bandpass";
    bf.frequency.setValueAtTime(1500 * pv, t);
    bf.Q.value = 1.1;
    if (fatal) bf.frequency.exponentialRampToValueAtTime(680, t + dur);
    const bg = c.createGain();
    bg.gain.setValueAtTime(0.0001, t);
    bg.gain.exponentialRampToValueAtTime(fatal ? 0.15 : 0.09, t + 0.02);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.82);
    breath.connect(bf);
    bf.connect(bg);
    bg.connect(bus);

    // --- vowel envelope
    const out = c.createGain();
    const lvl = fatal ? 0.46 : 0.3;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(lvl, t + 0.014);
    out.gain.setValueAtTime(lvl, t + Math.max(0.02, dur * 0.55));
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out.connect(bus);

    // --- formants 으 → 악 (the death cry opens into the 악)
    const V1 = FORMANTS.eu.map((f) => f * pv);
    const V2 = FORMANTS.a.map((f) => f * pv);
    for (let i = 0; i < 3; i++) {
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = i === 0 ? 5.5 : 8.5;
      f.frequency.setValueAtTime(V1[i], t);
      if (fatal) f.frequency.exponentialRampToValueAtTime(V2[i], t + 0.16);
      const g = c.createGain();
      g.gain.value = (i === 0 ? 1 : i === 1 ? 0.58 : 0.22) * (fatal ? 1 : 0.92);
      src.connect(f);
      f.connect(g);
      g.connect(out);
    }

    // the catch in the throat that opens the word
    band(c, t, 0.03, "bandpass", 700 * pv, 2.2, fatal ? 0.18 : 0.22, 0.001, 0.02, bus);
    // the rattle at the bottom of the scream
    if (fatal) {
      band(c, t + dur * 0.55, 0.24, "bandpass", 620, 1.4, 0.09, 0.02, 0.2, bus, 380);
      thump(c, t + dur * 0.5, 112 * pv, 60, 0.34, 0.14, bus, "triangle");
    }

    const stopAt = t + dur + 0.08;
    [glottal, glottal2, vib, breath].forEach((n) => {
      try { n.start(t); n.stop(stopAt); } catch (e) {}
    });
    const ms = Math.max(60, (dur + 0.15) * 1000);
    setTimeout(() => { liveGrunt = Math.max(0, liveGrunt - 1); }, ms);
    return true;
  }

  function boom() {
    if (muted()) return;
    const c = ac();
    if (playSample("explosion", 0.95, 0.85 + Math.random() * 0.3)) return;
    const t = c.currentTime;
    // ignition crack
    band(c, t, 0.06, "highpass", 3200, 0.6, 0.8, 0.0008, 0.03, bus);
    band(c, t, 0.2, "bandpass", 1400, 0.7, 0.5, 0.002, 0.1, bus, 600);
    // low body
    thump(c, t, 98, 26, 0.75, 0.95, bus, "sine", 0.5);
    thump(c, t + 0.01, 62, 22, 0.95, 0.5, bus, "triangle");
    band(c, t, 0.7, "lowpass", 380, 0.6, 0.55, 0.004, 0.55, bus, 120);
    // debris crackle
    for (let i = 0; i < 9; i++) {
      const dt = 0.12 + Math.random() * 0.75;
      band(c, t + dt, 0.05, "bandpass", 1800 + Math.random() * 2600, 2.2, 0.04 + Math.random() * 0.09, 0.001, 0.03, bus);
    }
    // heavy room tail
    band(c, t + 0.03, 0.9, "lowpass", 900, 0.5, 0.3, 0.02, 0.8, comp);
  }


  /* ------------------------------------------------------------------
     Built-in rail-combat BGM. Written from scratch with oscillators and
     noise: driving eight-note bass, a tense minor-brass lead, a gallop
     kick pattern and snare backbeat, plus a heavier boss variation.
     ------------------------------------------------------------------ */
  const SEQ = { on: false, boss: false, step: 0, next: 0, timer: null, ctx: null, out: null };
  const ROOTS = [40, 36, 43, 38];           // Em  C  G  D
  const LEAD_A = [64, null, null, 67, null, null, 71, null, 69, null, 67, null, 64, null, 62, null];
  const LEAD_B = [72, null, 71, null, 67, null, 64, null, 66, null, 67, null, 71, null, 74, null];
  const BASS_HIT = [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0];
  const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
  /* (v21) one theme per stage: tempo, four-bar root line, two lead phrases,
     bass rhythm, kick pattern and the lead's timbre. `_` is a rest. */
  const _ = null;
  const SONGS = {
    seoul: { bpm: 138, roots: ROOTS, a: LEAD_A, b: LEAD_B, bass: BASS_HIT, kick: [0, 6, 8, 14], lead: "sawtooth" },
    fall: { bpm: 112, roots: [38, 34, 31, 33], a: [62, _, _, _, 65, _, 64, _, 62, _, _, _, 61, _, _, _], b: [69, _, _, _, 70, _, 69, _, 65, _, 64, _, 61, _, _, _],
      bass: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], kick: [0, 8], lead: "triangle", pad: 1 },
    retreat: { bpm: 132, roots: [45, 41, 48, 43], a: [69, _, 72, _, 71, _, 69, _, 67, _, 69, _, 64, _, _, _], b: [76, _, 74, _, 72, _, 71, _, 72, _, 74, _, 71, _, 67, _],
      bass: [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0], kick: [0, 4, 8, 12], lead: "square" },
    heritage: { bpm: 126, roots: [45, 43, 41, 43], a: [69, _, 72, _, 74, _, _, 76, 74, _, 72, _, 69, _, _, _], b: [76, _, 79, _, 76, _, 74, 72, 74, _, 72, _, 69, _, 67, _],
      bass: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], kick: [0, 7, 10], lead: "triangle", gong: 1 },
    perimeter: { bpm: 146, roots: [36, 32, 39, 34], a: [72, _, 72, 75, _, 72, 70, _, 68, _, 67, _, 68, _, 70, _], b: [79, _, 77, _, 75, _, 74, _, 75, _, 77, _, 79, _, 80, _],
      bass: [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1], kick: [0, 3, 6, 8, 11, 14], lead: "sawtooth" },
    landing: { bpm: 150, roots: [38, 36, 34, 36], a: [74, _, 74, 76, 78, _, 74, _, 81, _, 78, _, 76, _, 74, _], b: [81, _, 79, _, 78, _, 76, _, 78, _, 79, _, 81, _, 86, _],
      bass: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1], kick: [0, 4, 8, 12, 14], lead: "square", snareRoll: 1 },
    dmz: { bpm: 128, roots: [47, 43, 50, 45], a: [71, _, _, 74, _, _, 78, _, 76, _, _, 74, _, _, 71, _], b: [79, _, _, 78, _, _, 74, _, 76, _, _, 78, _, _, 83, _],
      bass: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], kick: [0, 6, 10], lead: "sawtooth" },
    summit: { bpm: 134, roots: [42, 38, 45, 40], a: [66, _, 69, _, 73, _, 71, _, 69, _, 66, _, 64, _, 66, _], b: [78, _, 76, _, 73, _, 71, _, 73, _, 76, _, 78, _, 81, _],
      bass: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1], kick: [0, 6, 8, 14], lead: "square" },
    pyongyang: { bpm: 142, roots: [43, 39, 46, 41], a: [67, _, 70, _, 74, _, 72, 70, 69, _, 67, _, 65, _, 62, _], b: [79, _, 77, _, 75, _, 74, _, 75, _, 74, _, 72, _, 70, _],
      bass: [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0], kick: [0, 3, 8, 11], lead: "sawtooth" },
    paektu: { bpm: 148, roots: [40, 36, 38, 35], a: [64, _, 67, _, 71, _, _, _, 72, _, 71, _, 67, _, 64, _], b: [76, _, _, 79, _, _, 83, _, 81, _, 79, _, 78, _, 76, _],
      bass: [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1], kick: [0, 3, 6, 8, 11, 14], lead: "sawtooth", pad: 1 }
  };

  function musicOk() {
    try { if (typeof BGM !== "undefined" && BGM.isOn && !BGM.isOn()) return false; } catch (e) {}
    try { if (typeof AFX !== "undefined" && AFX.on && !AFX.on()) return false; } catch (e) {}
    return !muted();
  }

  function seqTone(t, midi, dur, type, gain, cut, detune) {
    const c = SEQ.ctx;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(hz(midi), t);
    if (detune) o.detune.setValueAtTime(detune, t);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let tail = o;
    if (cut) {
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(cut, t);
      f.frequency.exponentialRampToValueAtTime(Math.max(180, cut * 0.45), t + dur);
      o.connect(f);
      tail = f;
    }
    tail.connect(g);
    g.connect(SEQ.out);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  function seqNoise(t, dur, type, freq, gain, q) {
    const c = SEQ.ctx;
    const src = c.createBufferSource();
    src.buffer = noise(c, Math.max(dur, 0.02));
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q || 1;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(SEQ.out);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  function seqKick(t, hard) {
    const c = SEQ.ctx;
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(hard ? 150 : 120, t);
    o.frequency.exponentialRampToValueAtTime(42, t + (hard ? 0.2 : 0.14));
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(hard ? 0.62 : 0.46, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (hard ? 0.28 : 0.18));
    o.connect(g);
    g.connect(SEQ.out);
    o.start(t);
    o.stop(t + 0.34);
  }

  function seqSnare(t, gain) {
    seqNoise(t, 0.135, "bandpass", 1900, gain || 0.2, 0.9);
    seqTone(t, 62, 0.09, "triangle", 0.1, 900);
  }

  function scheduleStep(step, t) {
    const bar = Math.floor(step / 16) % 4;
    const s = step % 16;
    const SG = SONGS[SEQ.song] || SONGS.seoul;
    const root = SG.roots[bar];
    // bass: driving eighths with octave pops
    if (SG.bass[s]) {
      const up = s % 8 === 6 ? 12 : 0;
      seqTone(t, root + up, 0.13, "sawtooth", 0.3, 520, -6);
      seqTone(t, root - 12 + up, 0.16, "square", 0.12, 300, 4);
    }
    // lead: two-bar minor phrase, doubled an octave down for body
    const lead = (bar % 2 ? SG.b : SG.a)[s];
    if (lead != null) {
      seqTone(t, lead, SEQ.boss ? 0.19 : (SG.pad ? 0.42 : 0.22), SG.lead || "sawtooth", 0.13, 2600, -4);
      seqTone(t, lead - 12, 0.2, "square", 0.05, 1400, 6);
    }
    // drums
    const kickSteps = SEQ.boss ? [0, 3, 6, 8, 11, 14] : SG.kick;
    if (SG.pad && s === 0) { seqTone(t, root + 12, 1.6, "triangle", 0.06, 900, -7); seqTone(t, root + 19, 1.6, "triangle", 0.04, 900, 7); }
    if (SG.gong && s === 0 && bar % 2 === 0) seqTone(t, root - 12, 2.2, "sine", 0.16, 600, 3);
    if (SG.snareRoll && s >= 12 && bar === 3) seqSnare(t, 0.1);
    if (kickSteps.indexOf(s) >= 0) seqKick(t, SEQ.boss && s === 0);
    if (s === 4 || s === 12) seqSnare(t, 0.22);
    if (SEQ.boss && (s === 15 || s === 7)) seqSnare(t, 0.13);
    if (s % 2 === 0) seqNoise(t, 0.035, "highpass", 7200, 0.05, 0.7);
    if (SEQ.boss && s % 4 === 2) seqNoise(t, 0.03, "highpass", 9000, 0.04, 0.7);
    // boss: low brass stab on the downbeat
    if (SEQ.boss && s === 0) {
      seqTone(t, root - 12, 0.5, "sawtooth", 0.16, 420, -8);
      seqTone(t, root + 6, 0.4, "sawtooth", 0.07, 900, 9);
    }
    // accent crash at the top of each four-bar phrase
    if (s === 0 && bar === 0) seqNoise(t, 0.4, "highpass", 5200, 0.09, 0.6);
  }

  function seqTick() {
    if (!SEQ.on || !SEQ.ctx) return;
    const c = SEQ.ctx;
    if (c.state === "suspended") { c.resume().catch(() => {}); return; }
    const SG = SONGS[SEQ.song] || SONGS.seoul;
    const spb = 60 / (SEQ.boss ? SG.bpm + 14 : SG.bpm) / 4;
    while (SEQ.next < c.currentTime + 0.16) {
      scheduleStep(SEQ.step, SEQ.next);
      SEQ.next += spb;
      SEQ.step = (SEQ.step + 1) % 64;
    }
  }

  function bgm(on, boss) {
    let c = null;
    try { c = ac(); } catch (e) { return; }
    SEQ.boss = !!boss;
    if (!on) {
      SEQ.on = false;
      if (SEQ.timer) { clearInterval(SEQ.timer); SEQ.timer = null; }
      if (SEQ.out) {
        try { SEQ.out.gain.setTargetAtTime(0.0001, c.currentTime, 0.08); } catch (e) {}
      }
      return;
    }
    if (!musicOk()) return;
    if (!SEQ.out) {
      SEQ.out = c.createGain();
      SEQ.out.gain.value = 0.34;
      SEQ.out.connect(c.destination);
    }
    SEQ.ctx = c;
    const t = c.currentTime + 0.08;
    if (!SEQ.on) {
      SEQ.out.gain.cancelScheduledValues(t);
      SEQ.out.gain.setValueAtTime(0.0001, t);
      SEQ.out.gain.exponentialRampToValueAtTime(0.34, t + 0.5);
      SEQ.step = 0;
      SEQ.next = t;
      SEQ.on = true;
    }
    if (!SEQ.timer) SEQ.timer = setInterval(seqTick, 40);
    seqTick();
  }

  if (typeof document !== "undefined") {
    const wake = () => {
      if (SEQ.ctx && SEQ.on && SEQ.ctx.state === "suspended") SEQ.ctx.resume().catch(() => {});
    };
    document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });
    window.addEventListener("focus", wake);
    window.addEventListener("pointerdown", wake, { passive: true });
  }

  const api = {
    bgm,
    shot,
    rifle,
    snipe,
    dry: dryFire,
    glass,
    shotgun,
    smg,
    clank,
    motor,
    loop,
    stopLoops,
    song: (k) => { SEQ.song = k; },
    reload,
    hit,
    crit,
    boom,
    playHitGrunt,
    grunt: playHitGrunt,
    unlock() {
      try {
        ac();
        if (typeof AFX !== "undefined" && AFX.warm) AFX.warm();
      } catch (e) {}
    }
  };
  window.GunSFX = api;
  try {
    if (typeof SFX !== "undefined") {
      SFX.pistol = shot;
      SFX.pistolDry = dryFire;
      SFX.pistolReload = reload;
      SFX.pistolHit = hit;
      SFX.pistolBoom = boom;
      SFX.hitGrunt = playHitGrunt;
    }
  } catch (e) {}
})();
