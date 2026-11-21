import { getProgress, subscribeProgress } from "./storage";

let context: AudioContext | null = null;
let hum: OscillatorNode | null = null;
let humGain: GainNode | null = null;
let wantHum = false;
let hidden = false;
let started = false;

function audioContext(): AudioContext | null {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  context ??= new Ctx();
  return context;
}

function stopHum() {
  hum?.stop();
  hum?.disconnect();
  humGain?.disconnect();
  hum = null;
  humGain = null;
}

function sync() {
  const allowed = getProgress().soundOn && !hidden && wantHum;
  if (!allowed) {
    stopHum();
    if (hidden && context && context.state === "running") void context.suspend().catch(() => {});
    return;
  }
  const ctx = audioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  if (hum) return;
  const gain = ctx.createGain();
  gain.gain.value = 0.03;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 220;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  hum = osc;
  humGain = gain;
}

export function initAudio() {
  if (started || typeof window === "undefined") return;
  started = true;
  hidden = document.hidden;
  document.addEventListener("visibilitychange", () => {
    hidden = document.hidden;
    sync();
  });
  window.addEventListener("pagehide", () => {
    hidden = true;
    sync();
  });
  subscribeProgress(sync);
}

export function setHumWanted(wanted: boolean) {
  wantHum = wanted;
  sync();
}

export function playTap() {
  if (!getProgress().soundOn || hidden) return;
  const ctx = audioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 660;
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}
