import { localDateKey } from "./format";

export type Progress = {
  stamps: string[];
  weightKg: string;
  foundConstellations: string[];
  bonusComparison: boolean;
  soundOn: boolean;
  dailyDate: string;
  dailyPick: number | null;
};

const KEY = "lumen.apps-in-toss.v1";

const EMPTY: Progress = {
  stamps: [],
  weightKg: "30",
  foundConstellations: [],
  bonusComparison: false,
  soundOn: false,
  dailyDate: "",
  dailyPick: null,
};

let state: Progress = read();
const listeners = new Set<() => void>();

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const today = localDateKey();
    const sameDay = parsed.dailyDate === today;
    return {
      ...EMPTY,
      ...parsed,
      stamps: Array.isArray(parsed.stamps) ? parsed.stamps.filter((id) => typeof id === "string") : [],
      foundConstellations: Array.isArray(parsed.foundConstellations)
        ? parsed.foundConstellations.filter((id) => typeof id === "string")
        : [],
      dailyDate: today,
      dailyPick: sameDay && typeof parsed.dailyPick === "number" ? parsed.dailyPick : null,
    };
  } catch {
    return fresh();
  }
}

function fresh(): Progress {
  return { ...EMPTY, stamps: [], foundConstellations: [], dailyDate: localDateKey() };
}

function write(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  listeners.forEach((listener) => listener());
}

export function getProgress(): Progress {
  const today = localDateKey();
  if (state.dailyDate !== today) {
    state = { ...state, dailyDate: today, dailyPick: null };
  }
  return state;
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function awardStamp(id: string): boolean {
  const current = getProgress();
  if (current.stamps.includes(id)) return false;
  write({ ...current, stamps: [...current.stamps, id] });
  return true;
}

export function setWeightKg(weightKg: string) {
  write({ ...getProgress(), weightKg });
}

export function findConstellation(id: string): string[] {
  const current = getProgress();
  if (current.foundConstellations.includes(id)) return current.foundConstellations;
  const foundConstellations = [...current.foundConstellations, id];
  write({ ...current, foundConstellations });
  return foundConstellations;
}

export function unlockBonusComparison() {
  write({ ...getProgress(), bonusComparison: true });
}

export function setSoundOn(soundOn: boolean) {
  write({ ...getProgress(), soundOn });
}

export function setDailyPick(picked: number) {
  const today = localDateKey();
  write({ ...getProgress(), dailyDate: today, dailyPick: picked });
}
