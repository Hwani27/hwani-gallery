/* ===== 부장님 몰래 딴짓하기 — Web Audio 효과음 + 프로시저럴 BGM =====
   샘플 파일 없이 오실레이터·노이즈만으로 만든다. 첫 사용자 제스처에서 unlock().
   타자 소리 / 딴짓 콤보음 / 발소리 경고 / 발각 / 칼퇴 클리어 / 야근. 음소거는 localStorage 에 남는다.
   BGM: 평온(105BPM 오피스 칩튠) ↔ 긴장(148BPM 저음 맥박·하이햇) 실시간 전환, 위장 중엔 로패스로 볼륨다운. */
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
    BGM.resume();
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

  /* =========================================================
     프로시저럴 BGM — 16분음표 스텝 시퀀서
     calm: 105BPM / tense: 148BPM. 4마디(64스텝) 루프.
     ========================================================= */
  var BGM = (function () {
    var BPM = { calm: 105, tense: 148 };
    var mode = 'off';            // off | calm | tense
    var work = false;            // 위장 중 볼륨 다운 + 로패스
    var step = 0, nextT = 0, timer = null;
    var running = false, wanted = false;
    var bus = null, lp = null, hatBuf = null, notes = 0;

    var CALM = {
      chords: [[57, 60, 64, 67], [53, 57, 60, 65], [48, 52, 55, 59], [55, 59, 62, 67]],
      roots: [45, 41, 48, 43],
      pluck: [69, 72, 76, 79, 76, 72, 74, 67]
    };
    var TENSE = {
      stabs: [[57, 58, 63], [56, 57, 62], [55, 56, 61], [57, 58, 64]],
      bassOff: [0, 0, 7, 0, 0, 10, 7, 5]
    };

    function midi(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    function ensure() {
      var c = ac(); if (!c || !master) return false;
      if (!bus) {
        bus = c.createGain(); bus.gain.value = 0.0001;
        lp = c.createBiquadFilter(); lp.type = 'lowpass';
        lp.frequency.value = 9000; lp.Q.value = 0.4;
        bus.connect(lp); lp.connect(master);
      }
      return true;
    }

    function fade(g, f, tc) {
      if (!bus) return;
      var t = ctx.currentTime;
      bus.gain.cancelScheduledValues(t);
      bus.gain.setTargetAtTime(Math.max(0.0001, g), t, tc || 0.15);
      lp.frequency.cancelScheduledValues(t);
      lp.frequency.setTargetAtTime(f, t, (tc || 0.15) * 1.4);
    }

    function osc(f, at, dur, type, gain, slide) {
      var c = ctx;
      notes++;
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(Math.max(20, f), at);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(18, slide), at + dur);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0004, gain), at + Math.min(0.05, dur * 0.35));
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(bus);
      o.start(at); o.stop(at + dur + 0.04);
      o.onended = function () { try { o.disconnect(); g.disconnect(); } catch (e) {} };
    }

    function pad(f, at, dur, gain) {
      osc(f, at, dur, 'triangle', gain, f * 1.0015);
      osc(f * 0.997, at, dur, 'sine', gain * 0.72);
    }

    function hat(at, gain, dur, hp) {
      var c = ctx;
      notes++;
      if (!hatBuf) {
        var len = Math.floor(c.sampleRate * 0.4);
        hatBuf = c.createBuffer(1, len, c.sampleRate);
        var d = hatBuf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
      var s = c.createBufferSource(); s.buffer = hatBuf;
      var f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 6000;
      var g = c.createGain(); g.gain.value = gain;
      s.connect(f); f.connect(g); g.connect(bus);
      s.start(at, 0, dur); s.stop(at + dur + 0.02);
      s.onended = function () { try { s.disconnect(); f.disconnect(); g.disconnect(); } catch (e) {} };
    }

    /* 평온: 나른한 7th 패드 + 콧노래 멜로디 + 가벼운 리듬 */
    function calmStep(bar, k, at, sd) {
      var ch = CALM.chords[bar], root = CALM.roots[bar];
      if (k === 0) {
        for (var i = 0; i < ch.length; i++) pad(midi(ch[i]), at, sd * 15.2, 0.014);
        osc(midi(root - 12), at, sd * 3.0, 'sine', 0.045);
      }
      if (k === 0 || k === 6 || k === 9) osc(midi(root), at, Math.min(0.3, sd * 2.2), 'triangle', 0.05, midi(root) * 0.99);
      if (k === 8) osc(midi(root - 12), at, 0.18, 'sine', 0.045);
      if (k === 0 || k === 10) osc(118, at, 0.13, 'sine', 0.05, 46);
      if (k % 2 === 1) hat(at, 0.007, 0.035, 7000);
      if (k === 4 || k === 12) hat(at, 0.012, 0.06, 3200);
      var pi = [0, 3, 6, 9, 12, 14].indexOf(k);
      if (pi >= 0) {
        var n = CALM.pluck[(bar * 3 + pi) % CALM.pluck.length];
        osc(midi(n), at, 0.16, 'triangle', 0.024, midi(n));
        osc(midi(n), at + sd * 1.5, 0.09, 'sine', 0.01);
      }
    }

    /* 긴장: 저음 맥박 + 8분 하이햇 + 단2도 스탭 + 상승 틱 */
    function tenseStep(bar, k, at, sd) {
      var st = TENSE.stabs[bar];
      if (k % 4 === 0) {
        osc(64, at, 0.17, 'sine', 0.095, 38);
        osc(58, at + 0.085, 0.12, 'sine', 0.055, 34);
      }
      if (k % 2 === 0) hat(at, 0.009, 0.03, 8200);
      if (k % 4 === 2) hat(at, 0.013, 0.05, 5200);
      if (k % 2 === 0) {
        var bf = midi(33 + TENSE.bassOff[(k / 2) | 0]);
        osc(bf, at, 0.085, 'sawtooth', 0.028, bf);
      }
      if (k === 2 || k === 10) {
        for (var i = 0; i < st.length; i++) osc(midi(st[i]), at, 0.11, 'sawtooth', 0.014, midi(st[i]) * 0.994);
      }
      if (k === 0) osc(midi(84), at, 0.05, 'square', 0.01);
      if (k === 13) osc(midi(72), at, sd * 3, 'sawtooth', 0.011, midi(84));
    }

    function schedule(s, at, sd) {
      var bar = (s / 16) | 0, k = s % 16;
      if (mode === 'tense') tenseStep(bar, k, at, sd);
      else calmStep(bar, k, at, sd);
    }

    function tick() {
      var c = ctx;
      if (!c || !running || !on) return;
      var now = c.currentTime;
      if (nextT < now) nextT = now + 0.02;
      var sd = 60 / (BPM[mode] || 105) / 4;
      var guard = 0;
      while (nextT < now + 0.25 && guard++ < 40) {
        schedule(step, nextT, sd);
        step = (step + 1) % 64;
        nextT += sd;
      }
    }

    function start(m) {
      wanted = true;
      if (!on) { if (m) mode = m; return; }
      var c = ac();
      if (!c || !ensure()) return;
      if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
      if (!m) m = (mode === 'off' ? 'calm' : mode);
      var changed = (mode !== m);
      mode = m;
      if (!running) { running = true; step = 0; nextT = c.currentTime + 0.08; }
      else if (changed) nextT = Math.max(nextT, c.currentTime + 0.05);
      fade(work ? 0.24 : 0.5, work ? 680 : 9000, 0.25);
      if (!timer) timer = setInterval(tick, 60);
    }

    function setMode(m) {
      if (!m) return;
      if (m === mode && running) return;
      mode = m;
      if (!running) { if (wanted) start(m); return; }
      if (ctx) nextT = Math.max(nextT, ctx.currentTime + 0.05);
    }

    function setWork(v) {
      v = !!v;
      if (work === v) return;
      work = v;
      if (running) fade(v ? 0.24 : 0.5, v ? 680 : 9000, 0.16);
    }

    function stop() {
      wanted = false; running = false; work = false;
      if (timer) { clearInterval(timer); timer = null; }
      if (bus) fade(0.0001, 9000, 0.1);
      mode = 'off'; step = 0;
    }

    function pause() {
      running = false;
      if (timer) { clearInterval(timer); timer = null; }
      if (bus) fade(0.0001, 9000, 0.06);
    }

    function resume() {
      if (!wanted || !on) return;
      start(mode === 'off' ? 'calm' : mode);
    }

    function status() {
      return {
        mode: mode, running: running, work: work, wanted: wanted,
        bpm: BPM[mode] || 0, muted: !on, ctx: ctx ? ctx.state : 'none',
        gain: bus ? +bus.gain.value.toFixed(3) : 0,
        lp: lp ? Math.round(lp.frequency.value) : 0,
        notes: notes
      };
    }

    return {
      start: start, setMode: setMode, setWork: setWork, stop: stop,
      pause: pause, resume: resume, status: status
    };
  })();

  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) BGM.pause();
      else if (on) BGM.resume();
    });
  }

  return {
    isOn: function () { return on; },
    setOn: function (v) {
      on = !!v;
      try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
      if (!on) BGM.pause();
      else { unlock(); BGM.resume(); this.click(); }
      return on;
    },
    toggle: function () { return this.setOn(!on); },
    unlock: unlock,
    bgm: BGM,

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
    earn: function () { tone(760, 0.08, 'triangle', 0.05); tone(1140, 0.1, 'triangle', 0.045, 1140, 0.06); },

    /* ---- 숏폼 위로 스와이프 / 코인 단타 ---- */
    swipe: function () {
      noise(0.14, 0.055, 700, 3800);
      tone(340, 0.1, 'triangle', 0.045, 620);
    },
    coinBuy: function () {
      tone(520, 0.07, 'square', 0.05, 700);
      tone(780, 0.09, 'triangle', 0.04, 900, 0.05);
    },
    coinWin: function () {
      tone(880, 0.09, 'square', 0.07, 1180);
      tone(1320, 0.12, 'triangle', 0.06, 1560, 0.06);
      tone(1760, 0.14, 'triangle', 0.05, 1980, 0.13);
      noise(0.2, 0.06, 2200);
    },
    coinLoss: function () {
      tone(300, 0.16, 'sawtooth', 0.055, 170);
      noise(0.16, 0.05, 150, 900);
    },
    story: function () {
      tone(392, 0.5, 'sine', 0.05, 392);
      tone(523, 0.42, 'triangle', 0.032, 523, 0.06);
      noise(0.3, 0.02, 200, 1400);
    },
    ending: function () {
      [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.7, 'triangle', 0.075, f * 1.002, i * 0.11); });
      tone(131, 1.1, 'sine', 0.09, 98);
      noise(0.5, 0.03, 2600);
    },

    /* ---- 3초 변명 찬스 ---- */
    // 발동: 낮은 충격 + 경보 사이렌
    excuseOpen: function () {
      tone(90, 0.22, 'sine', 0.16, 44);
      noise(0.16, 0.1, 160);
      tone(760, 0.12, 'square', 0.055, 640, 0.04);
      tone(920, 0.12, 'square', 0.05, 780, 0.19);
      tone(1080, 0.13, 'square', 0.05, 900, 0.34);
    },
    // 카운트 틱: n 이 줄수록 음이 올라간다 (6 → 1)
    excuseTick: function (n) {
      var k = Math.max(1, Math.min(6, n || 6));
      tone(560 + (6 - k) * 130, 0.04, 'square', 0.045);
      noise(0.02, 0.02, 3000);
    },
    // 성공: 안도하는 내려가는 숨소리 + 부드러운 코드
    excuseSigh: function () {
      noise(0.34, 0.05, 500, 2200);
      tone(560, 0.4, 'sine', 0.075, 300);
      tone(840, 0.24, 'triangle', 0.035, 520, 0.02);
      [523, 659, 784].forEach(function (f, i) { tone(f, 0.26, 'sine', 0.035, f, 0.06 + i * 0.05); });
    },
    // 실패: 땡! 하는 버저
    excuseBuzz: function () {
      tone(170, 0.52, 'sawtooth', 0.11, 72);
      tone(118, 0.46, 'square', 0.06, 52, 0.05);
      noise(0.34, 0.1, 180);
      tone(1400, 0.07, 'square', 0.035, 900, 0.5);
    }
  };
})();
