import { addDays, localDateKey } from "./format";
import { weekMissions, type MissionKind } from "../data/missions";

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
  /** 틀린 문제 키("퀴즈id:번호"). 다시 맞히면 빠집니다. */
  wrong: string[];
  /** 이번 주 미션 기록. */
  week: WeekLog;
  /** 주간 미션을 모두 끝낸 주의 수. */
  weeksDone: number;
  /** 광고 보고 받은 보너스 별. 한 주에 하나. */
  bonusStars: number;
  bonusWeek: string;
  /** 별자리 잇기 최고 기록(초). */
  connectBest: Record<string, number>;
  /** 행성 줄 세우기 최고 기록(초). */
  orderBest: Record<string, number>;
};

export type WeekLog = { id: string; counts: Record<string, number>; done: boolean };

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
  wrong: [],
  week: { id: "", counts: {}, done: false },
  weeksDone: 0,
  bonusStars: 0,
  bonusWeek: "",
  connectBest: {},
  orderBest: {},
};

let state: Progress = read();
const listeners = new Set<() => void>();

function numbers(value: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) if (typeof item === "number" && Number.isFinite(item)) out[key] = item;
  }
  return out;
}

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
      wrong: strings(parsed.wrong).slice(-60),
      week: readWeek(parsed.week),
      weeksDone: typeof parsed.weeksDone === "number" ? parsed.weeksDone : 0,
      bonusStars: typeof parsed.bonusStars === "number" ? parsed.bonusStars : 0,
      bonusWeek: typeof parsed.bonusWeek === "string" ? parsed.bonusWeek : "",
      connectBest: numbers(parsed.connectBest),
      orderBest: numbers(parsed.orderBest),
      dailyHintDate: typeof parsed.dailyHintDate === "string" ? parsed.dailyHintDate : "",
      dailyDate: today,
      dailyPick: sameDay && typeof parsed.dailyPick === "number" ? parsed.dailyPick : null,
    };
  } catch {
    return fresh();
  }
}

function fresh(): Progress {
  return { ...EMPTY, stamps: [], foundConstellations: [], visits: [], wrong: [], connectBest: {}, orderBest: {}, week: newWeek(), dailyDate: localDateKey() };
}

/** 그 주 월요일 날짜. */
export function weekId(day = localDateKey()): string {
  const [y, m, d] = day.split("-").map(Number);
  const weekday = (new Date(y, m - 1, d, 12).getDay() + 6) % 7;
  return addDays(day, -weekday);
}

function newWeek(): WeekLog {
  return { id: weekId(), counts: {}, done: false };
}

function readWeek(value: unknown): WeekLog {
  const week = value as Partial<WeekLog> | undefined;
  if (!week || typeof week.id !== "string" || week.id !== weekId() || typeof week.counts !== "object" || !week.counts) return newWeek();
  const counts: Record<string, number> = {};
  for (const [key, count] of Object.entries(week.counts)) if (typeof count === "number") counts[key] = count;
  return { id: week.id, counts, done: Boolean(week.done) };
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
  if (state.week.id !== weekId(today)) {
    state = { ...state, week: newWeek() };
  }
  return state;
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const stampListeners = new Set<(id: string) => void>();

/** 새 도장을 받을 때 알림을 받습니다(도장 찍는 연출용). */
export function onStampAwarded(listener: (id: string) => void): () => void {
  stampListeners.add(listener);
  return () => stampListeners.delete(listener);
}

export function awardStamp(id: string): boolean {
  const current = getProgress();
  if (current.stamps.includes(id)) return false;
  write({ ...current, stamps: [...current.stamps, id] });
  stampListeners.forEach((listener) => listener(id));
  return true;
}

export function setWeightKg(weightKg: string) {
  write({ ...getProgress(), weightKg });
}

export function findConstellation(id: string): string[] {
  bumpWeekly("sky", id);
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
  if (correct) bumpWeekly("daily");
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
  checkWeek();
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

/* ---------- 틀린 문제 ---------- */

export function markAnswer(key: string, correct: boolean) {
  const current = getProgress();
  const had = current.wrong.includes(key);
  if (correct && had) {
    write({ ...current, wrong: current.wrong.filter((item) => item !== key) });
  } else if (!correct && !had) {
    write({ ...current, wrong: [...current.wrong, key].slice(-60) });
  }
}

/* ---------- 주간 미션 ---------- */

/** 미션 진행을 하나 올립니다. unique 를 주면 그 주에 같은 값은 한 번만 셉니다. */
export function bumpWeekly(kind: MissionKind, unique?: string) {
  const current = getProgress();
  const counts = { ...current.week.counts };
  if (unique) {
    const mark = `${kind}:${unique}`;
    if (counts[mark]) return;
    counts[mark] = 1;
  }
  counts[kind] = (counts[kind] ?? 0) + 1;
  write({ ...current, week: { ...current.week, counts } });
  checkWeek();
}

export function missionProgress(progress: Progress, kind: MissionKind): number {
  if (kind === "visit") return progress.visits.filter((day) => day >= progress.week.id).length;
  return progress.week.counts[kind] ?? 0;
}

function checkWeek() {
  const current = getProgress();
  if (current.week.done) return;
  const all = weekMissions(current.week.id).every((mission) => missionProgress(current, mission.kind) >= mission.target);
  if (!all) return;
  const weeksDone = current.weeksDone + 1;
  write({ ...current, week: { ...current.week, done: true }, weeksDone });
  awardStamp("weekly-1");
  if (weeksDone >= 4) awardStamp("weekly-4");
}

/* ---------- 보너스 별 ---------- */

export function canTakeBonusStar(progress: Progress): boolean {
  return progress.bonusWeek !== progress.week.id;
}

export function takeBonusStar() {
  const current = getProgress();
  if (!canTakeBonusStar(current)) return;
  const bonusStars = current.bonusStars + 1;
  write({ ...current, bonusStars, bonusWeek: current.week.id });
  if (bonusStars >= 5) awardStamp("bonus-5");
}

/* ---------- 놀이 기록 ---------- */

/** 별자리 잇기를 끝냈을 때. 새 최고 기록이면 true. */
export function recordConnect(id: string, seconds: number): boolean {
  const current = getProgress();
  const best = current.connectBest[id];
  const better = best === undefined || seconds < best;
  const connectBest = better ? { ...current.connectBest, [id]: seconds } : current.connectBest;
  write({ ...current, connectBest });
  awardStamp("connect-1");
  if (Object.keys(connectBest).length >= 10) awardStamp("connect-10");
  bumpWeekly("connect", id);
  return better;
}

/** 행성 줄 세우기를 맞혔을 때. 새 최고 기록이면 true. */
export function recordOrder(mode: string, seconds: number): boolean {
  const current = getProgress();
  const best = current.orderBest[mode];
  const better = best === undefined || seconds < best;
  const orderBest = better ? { ...current.orderBest, [mode]: seconds } : current.orderBest;
  write({ ...current, orderBest });
  if (orderBest.distance !== undefined && orderBest.size !== undefined) awardStamp("order-2");
  bumpWeekly("order");
  return better;
}
