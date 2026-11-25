/* ===== 부장님 몰래 딴짓하기 — Web Audio 효과음 (프로시저럴) =====
   샘플 파일 없이 오실레이터·노이즈만으로 만든다. 첫 사용자 제스처에서 unlock().
   타자 소리 / 딴짓 콤보음 / 발소리 경고 / 발각 / 칼퇴 클리어 / 야근. 음소거는 localStorage 에 남는다. */
var SFX = (function () {
  'use strict';
  var KEY = 'slk_sound_on';
  var on = true;
  try { var v = localStorage.getItem(KEY); if (v === '0') on = false; } catch (e) {}
  var ctx = null, master = null;

  function ac() {
    if (ctx) return ctx;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { ctx = new C(); } catch (e) { return null; }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3;
    comp.attack.value = 0.003; comp.release.value = 0.18;
    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(comp); comp.connect(ctx.destination);
    return ctx;
  }
  function unlock() {
    var c = ac(); if (!c) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
  }
  function ok() { return on && typeof ctx !== 'undefined'; }

  function tone(freq, dur, type, gain, slideTo, delay) {
    if (!on) return;
    var c = ac(); if (!c) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain || 0.15), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, gain, hp, lp, delay) {
    if (!on) return;
    var c = ac(); if (!c) return;
    var t = c.currentTime + (delay || 0);
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = c.createBufferSource(); s.buffer = buf;
    var g = c.createGain(); g.gain.value = gain == null ? 0.12 : gain;
    var f1 = c.createBiquadFilter();
    if (hp) { f1.type = 'highpass'; f1.frequency.value = hp; } else { f1.type = 'lowpass'; f1.frequency.value = lp || 3000; }
    s.connect(f1); f1.connect(g); g.connect(master);
    s.start(t);
  }

  return {
    isOn: function () { return on; },
    setOn: function (v) { on = !!v; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} if (on) { unlock(); this.click(); } return on; },
    toggle: function () { return this.setOn(!on); },
    unlock: unlock,

    // 딴짓 콤보: 콤보가 올라갈수록 음이 올라간다
    tap: function (combo) {
      var n = Math.min(combo || 0, 16);
      var f = 420 + n * 34;
      tone(f, 0.07, 'square', 0.055, f * 1.35);
      noise(0.03, 0.035, 2600);
    },
    // 타자: 짧은 고역 노이즈 + 살짝 튀는 클릭
    type: function () {
      noise(0.028, 0.05 + Math.random() * 0.02, 1800);
      tone(240 + Math.random() * 140, 0.02, 'square', 0.018);
    },
    // 발소리: 낮은 쿵 + 바닥 잡음
    foot: function (near) {
      tone(96 - (near ? 12 : 0), 0.13, 'sine', near ? 0.16 : 0.09, 52);
      noise(0.07, near ? 0.05 : 0.03, 120, 900);
    },
    warn: function () {
      tone(660, 0.09, 'sawtooth', 0.05, 520);
      tone(880, 0.11, 'sawtooth', 0.045, 700, 0.1);
    },
    pass: function () {
      noise(0.18, 0.06, 900, 2600);
      tone(420, 0.16, 'sine', 0.06, 300);
    },
    caught: function () {
      tone(400, 0.55, 'sawtooth', 0.12, 70);
      noise(0.3, 0.16, 200);
      tone(180, 0.4, 'square', 0.07, 60, 0.05);
    },
    clear: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.22, 'triangle', 0.09, f * 1.01, i * 0.1); });
      noise(0.2, 0.04, 2200);
    },
    overtime: function () {
      [392, 330, 262].forEach(function (f, i) { tone(f, 0.4, 'sine', 0.09, f * 0.94, i * 0.22); });
      noise(0.5, 0.03, 60, 400);
    },
    tempt: function () {
      tone(880, 0.1, 'triangle', 0.06);
      tone(1180, 0.14, 'triangle', 0.055, 1180, 0.09);
    },
    eat: function () {
      tone(300, 0.08, 'square', 0.06, 200);
      tone(240, 0.1, 'square', 0.05, 160, 0.09);
      noise(0.12, 0.05, 400);
    },
    click: function () { tone(520, 0.045, 'triangle', 0.06); },
    tick: function () { tone(1200, 0.03, 'square', 0.03); },
    earn: function () { tone(760, 0.08, 'triangle', 0.05); tone(1140, 0.1, 'triangle', 0.045, 1140, 0.06); }
  };
})();
