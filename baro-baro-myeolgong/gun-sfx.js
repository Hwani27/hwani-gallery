/* Procedural gun kit for 지금 바로 멸공.
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

  /* ------------------------------------------------------------------
     Voice: hit and death grunts — "윽!" when a soldier is only winged,
     a falling "으악!" when the round puts him down.

     No samples: a sawtooth glottal source with a pitch envelope and a
     slow vibrato feeds three parallel bandpass formant resonators, so the
     vowel itself is synthesised. The death cry starts on a closed 으 and
     glides its formants to an open 악 while the pitch collapses, then the
     breath runs out into a chest rattle.
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
    const root = ROOTS[bar];
    // bass: driving eighths with octave pops
    if (BASS_HIT[s]) {
      const up = s % 8 === 6 ? 12 : 0;
      seqTone(t, root + up, 0.13, "sawtooth", 0.3, 520, -6);
      seqTone(t, root - 12 + up, 0.16, "square", 0.12, 300, 4);
    }
    // lead: two-bar minor phrase, doubled an octave down for body
    const lead = (bar % 2 ? LEAD_B : LEAD_A)[s];
    if (lead != null) {
      seqTone(t, lead, SEQ.boss ? 0.19 : 0.22, "sawtooth", 0.13, 2600, -4);
      seqTone(t, lead - 12, 0.2, "square", 0.05, 1400, 6);
    }
    // drums
    const kickSteps = SEQ.boss ? [0, 3, 6, 8, 11, 14] : [0, 6, 8, 14];
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
    const spb = 60 / (SEQ.boss ? 152 : 138) / 4;
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
    dry: dryFire,
    reload,
    hit,
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
