/* Procedural pistol kit for 지금 바로 멸공.
   Layering idea (not the source): a dry crack, a body band, a low thump,
   a later mechanical tick, and a short outdoor tail on a separate bus.
   Plays only when the jumper's SFX switch is on. */
(function () {
  let ctx = null;
  let master = null;
  let tailIn = null;
  function muted() {
    try {
      if (typeof SFX !== "undefined" && SFX.isOn && !SFX.isOn()) return true;
    } catch (e) {}
    return false;
  }

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = 0.038;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1600;
      const fb = ctx.createGain();
      fb.gain.value = 0.32;
      const send = ctx.createGain();
      send.gain.value = 0.45;
      delay.connect(lp);
      lp.connect(fb);
      fb.connect(delay);
      fb.connect(send);
      send.connect(master);
      master.connect(ctx.destination);
      tailIn = delay;
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

  function clip(c) {
    const sh = c.createWaveShaper();
    const curve = new Float32Array(64);
    for (let i = 0; i < 64; i++) {
      const x = (i / 63) * 2 - 1;
      curve[i] = Math.tanh(x * 1.6);
    }
    sh.curve = curve;
    return sh;
  }

  function band(c, t, dur, type, freq, q, gain, attack, decay, dest) {
    const src = c.createBufferSource();
    src.buffer = noise(c, dur);
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    src.start(t);
    src.stop(t + dur + 0.02);
    return src;
  }

  function thump(c, t, f0, f1, dur, gain, dest) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
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
    const vary = 0.94 + Math.random() * 0.1;
    const dry = c.createGain();
    dry.gain.value = 0.9;
    const sh = clip(c);
    dry.connect(sh);
    sh.connect(master);
    const tail = c.createGain();
    tail.gain.value = 0.22;
    tail.connect(tailIn);
    band(c, t, 0.05, "highpass", 3200 * vary, 0.7, 0.55, 0.001, 0.02, dry);
    band(c, t, 0.12, "bandpass", 1400 * vary, 0.8, 0.42, 0.002, 0.05, dry);
    band(c, t, 0.2, "lowpass", 480 * vary, 0.7, 0.2, 0.003, 0.09, dry);
    thump(c, t, 160 * vary, 48, 0.07, 0.35, dry);
    band(c, t + 0.016, 0.04, "bandpass", 2400 * vary, 2.2, 0.12, 0.001, 0.02, dry);
    band(c, t, 0.28, "lowpass", 900, 0.6, 0.18, 0.01, 0.2, tail);
  }

  function dryFire() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    band(c, t, 0.03, "highpass", 2800, 0.8, 0.22, 0.001, 0.012, master);
    thump(c, t, 2100, 900, 0.02, 0.08, master);
  }

  function reload() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    band(c, t, 0.05, "bandpass", 1800, 1.2, 0.2, 0.001, 0.03, master);
    band(c, t + 0.09, 0.06, "bandpass", 900, 1.4, 0.24, 0.002, 0.04, master);
    thump(c, t + 0.16, 1400, 700, 0.05, 0.1, master);
    band(c, t + 0.17, 0.04, "highpass", 3600, 0.7, 0.16, 0.001, 0.018, master);
  }

  function hit() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    band(c, t, 0.06, "bandpass", 2200, 1.5, 0.28, 0.001, 0.03, master);
    thump(c, t, 640, 220, 0.05, 0.12, master);
  }

  function boom() {
    if (muted()) return;
    const c = ac();
    const t = c.currentTime;
    const g = c.createGain();
    g.gain.value = 0.8;
    g.connect(master);
    band(c, t, 0.08, "highpass", 1800, 0.7, 0.4, 0.001, 0.03, g);
    thump(c, t, 90, 36, 0.35, 0.5, g);
    band(c, t, 0.45, "lowpass", 500, 0.5, 0.35, 0.01, 0.32, g);
    const tail = c.createGain();
    tail.gain.value = 0.4;
    tail.connect(tailIn);
    band(c, t, 0.5, "lowpass", 700, 0.5, 0.3, 0.02, 0.4, tail);
  }

  const api = {
    shot, dry: dryFire, reload, hit, boom,
    unlock() { try { ac(); } catch (e) {} }
  };
  window.GunSFX = api;
  try {
    if (typeof SFX !== "undefined") {
      SFX.pistol = shot;
      SFX.pistolDry = dryFire;
      SFX.pistolReload = reload;
      SFX.pistolHit = hit;
      SFX.pistolBoom = boom;
    }
  } catch (e) {}
})();
