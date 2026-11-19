/* ===== 효과음 팩 — recorded-style samples (tools/gen-sounds.py) replace the synth beeps =====
   Loaded right after core.js so the UI layer (uix.js) wraps these methods as before.
   Each game gets its own material: 돌(오목·바둑) · 나무 말(장기) · 펠트 말(체스).
   Falls back to the original synth sound until a sample is decoded. */
(function () {
  if (typeof SFX === 'undefined') return;
  const ID = window.GAME_ID;
  const MAT = { omok: 'stone', baduk: 'stone', janggi: 'janggi', chess: 'chess' }[ID] || 'stone';
  // every game: the same soft wooden "톡" for moves (louder material samples were too busy)
  const NAMES = ['tok1', 'tok2', 'tok3', 'tok_cap'].concat(['select', 'tap', 'check', 'win', 'lose', 'draw', 'solve', 'levelup', 'achieve', 'reward', 'hint', 'pop']);
  const VARIANTS = ['tok1', 'tok2', 'tok3'];
  const CAPTURE = 'tok_cap';

  let ctx = null, master = null; const buf = {};
  function ac() {
    if (ctx) return ctx;
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    ctx = new C();
    // gentle bus compression so every cue sits at the same loudness on phone speakers
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 3; comp.attack.value = 0.003; comp.release.value = 0.15;
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(comp); comp.connect(ctx.destination);
    return ctx;
  }
  async function load(name) {
    try {
      const r = await fetch((window.APP_MODE ? '../sfx/' : 'sfx/') + name + '.mp3'); const ab = await r.arrayBuffer();
      const c = ac(); if (!c) return;
      buf[name] = await new Promise((res, rej) => c.decodeAudioData(ab, res, rej));
    } catch (e) { /* keep the synth fallback */ }
  }
  NAMES.forEach(load);

  function play(name, opt) {
    if (!SFX.isOn || !SFX.isOn()) return false;
    const c = ac(), b = buf[name]; if (!c || !b) return false;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    const s = c.createBufferSource(); s.buffer = b;
    const o = opt || {};
    if (o.vary) s.playbackRate.value = 1 + (Math.random() - .5) * o.vary;
    if (o.rate) s.playbackRate.value *= o.rate;
    const g = c.createGain(); g.gain.value = (o.gain ?? 1) * (o.vary ? 0.9 + Math.random() * 0.15 : 1);
    s.connect(g); g.connect(master); s.start();
    return true;
  }
  const pick = a => a[(Math.random() * a.length) | 0];
  const haptic = t => { try { window.Toss && Toss.inToss && Toss.haptic(t); } catch (e) {} };

  const orig = Object.assign({}, SFX);
  const wrap = (key, fn) => { SFX[key] = function () { if (!fn.apply(this, arguments)) return orig[key] && orig[key].apply(SFX, arguments); }; };
  wrap('place', () => { haptic('tickWeak'); return play(pick(VARIANTS), { vary: .05 }); });
  wrap('move', () => { haptic('tickWeak'); return play(pick(VARIANTS), { vary: .05 }); });
  wrap('capture', () => { haptic('basicWeak'); return play(CAPTURE, { vary: .04 }); });
  wrap('select', () => play('select', { vary: .08, gain: .8 }));
  wrap('check', () => { haptic('basicMedium'); return play('check'); });
  wrap('win', () => play('win'));
  wrap('lose', () => play('lose'));
  wrap('draw', () => play('draw'));
  // new cues used by the meta layer
  ['tap', 'solve', 'levelup', 'achieve', 'reward', 'hint', 'pop'].forEach(k => { SFX[k] = () => play(k, k === 'tap' ? { vary: .1 } : null); });
  SFX.suspend = function () { try { ctx && ctx.suspend(); } catch (e) {} return orig.suspend && orig.suspend.apply(SFX, arguments); };
  SFX.resume = function () { try { ctx && ctx.state === 'suspended' && ctx.resume(); } catch (e) {} return orig.resume && orig.resume.apply(SFX, arguments); };

  // a soft tick on every meta-layer button (sheets, cards, modals)
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest && e.target.closest('.tg-hub button, .tg-sheet button, .tg-modal button, .tg-rbar button, .tg-row');
    if (b) SFX.tap();
  }, true);
  window.addEventListener('pointerdown', () => { const c = ac(); if (c && c.state === 'suspended') c.resume(); }, { once: true });
})();
