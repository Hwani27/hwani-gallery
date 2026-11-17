import { addDays, localDateKey } from "./format";

export type Progress = {
  stamps: string[];
  weightKg: string;
  foundConstellations: string[];
  bonusComparison: boolean;
  soundOn: boolean;
  dailyDate: string;
  dailyPick: number | null;
  /** 오늘의 문제에서 광고를 보고 힌트를 연 날. */
  dailyHintDate: string;
  /** 앱을 연 날(YYYY-MM-DD). 최근 기록만 남깁니다. */
  visits: string[];
  /** 오늘의 문제를 맞힌 날 수. */
  dailyCorrect: number;
};

const KEY = "lumen.apps-in-toss.v1";
const KEEP_VISITS = 120;

const EMPTY: Progress = {
  stamps: [],
  weightKg: "30",
  foundConstellations: [],
  bonusComparison: false,
  soundOn: false,
  dailyDate: "",
  dailyPick: null,
  dailyHintDate: "",
  visits: [],
  dailyCorrect: 0,
};

let state: Progress = read();
const listeners = new Set<() => void>();

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

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
      stamps: strings(parsed.stamps),
      foundConstellations: strings(parsed.foundConstellations),
      visits: strings(parsed.visits).slice(-KEEP_VISITS),
      dailyCorrect: typeof parsed.dailyCorrect === "number" ? parsed.dailyCorrect : 0,
      dailyHintDate: typeof parsed.dailyHintDate === "string" ? parsed.dailyHintDate : "",
      dailyDate: today,
      dailyPick: sameDay && typeof parsed.dailyPick === "number" ? parsed.dailyPick : null,
    };
  } catch {
    return fresh();
  }
}

function fresh(): Progress {
  return { ...EMPTY, stamps: [], foundConstellations: [], visits: [], dailyDate: localDateKey() };
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

/** 오늘의 문제 답을 기록합니다. 하루에 한 번만 셉니다. */
export function setDailyPick(picked: number, correct: boolean) {
  const current = getProgress();
  if (current.dailyPick !== null) return;
  const dailyCorrect = current.dailyCorrect + (correct ? 1 : 0);
  write({ ...current, dailyDate: localDateKey(), dailyPick: picked, dailyCorrect });
  if (dailyCorrect >= 10) awardStamp("daily-10");
}

export function openDailyHint() {
  write({ ...getProgress(), dailyHintDate: localDateKey() });
}

/** 오늘 방문을 남기고, 연속 방문 도장을 확인합니다. */
export function recordVisit(): void {
  const current = getProgress();
  const today = localDateKey();
  if (current.visits.includes(today)) return;
  const visits = [...current.visits, today].sort().slice(-KEEP_VISITS);
  write({ ...current, visits });
  const run = streakOf(visits, today);
  if (run >= 3) awardStamp("streak-3");
  if (run >= 7) awardStamp("streak-7");
  if (run >= 30) awardStamp("streak-30");
}

/** today 까지 하루도 빠지지 않고 들어온 날 수. */
export function streakOf(visits: readonly string[], today = localDateKey()): number {
  const days = new Set(visits);
  let run = 0;
  let cursor = today;
  while (days.has(cursor)) {
    run += 1;
    cursor = addDays(cursor, -1);
  }
  return run;
}
