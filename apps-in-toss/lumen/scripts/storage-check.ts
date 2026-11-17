/**
 * 저장 기록 시험: 깨진 저장값, 자정 넘김, 주간 미션, 틀린 문제.
 * Node 에는 localStorage 가 없어서 간단한 가짜를 넣고, 시계도 바꿔 가며 시험합니다.
 */
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, String(value)),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

const RealDate = Date;
let now = new RealDate(2026, 10, 18, 23, 50).getTime();
class FakeDate extends RealDate {
  constructor(...args: unknown[]) {
    if (args.length === 0) super(now);
    else super(...(args as [number]));
  }
  static now() {
    return now;
  }
}
(globalThis as unknown as { Date: DateConstructor }).Date = FakeDate as unknown as DateConstructor;

function fail(message: string): never {
  throw new Error(message);
}

// 1. 깨진 저장값에서도 시작합니다.
store.set("lumen.apps-in-toss.v1", JSON.stringify({ stamps: "oops", visits: [1, "2026-11-17"], dailyPick: "x", week: 3, wrong: null }));
const storage = await import("../src/lib/storage.ts");
let progress = storage.getProgress();
if (progress.stamps.length !== 0) fail("stamps should reset");
if (progress.visits.join() !== "2026-11-17") fail("visits filter");
if (progress.dailyPick !== null) fail("dailyPick reset");
if (progress.week.id !== "2026-11-16") fail(`week id ${progress.week.id}`);

// 2. 방문 기록과 연속 방문
storage.recordVisit();
progress = storage.getProgress();
if (storage.streakOf(progress.visits) !== 2) fail(`streak ${storage.streakOf(progress.visits)}`);

// 3. 자정을 넘기면 오늘의 문제가 새로 열립니다.
storage.setDailyPick(1, true);
if (storage.getProgress().dailyPick !== 1) fail("daily pick saved");
now = new RealDate(2026, 10, 19, 0, 5).getTime();
if (storage.getProgress().dailyPick !== null) fail("daily pick should reset after midnight");
storage.recordVisit();
if (storage.streakOf(storage.getProgress().visits) !== 3) fail("streak after midnight");
if (!storage.getProgress().stamps.includes("streak-3")) fail("streak-3 stamp");

// 4. 틀린 문제는 다시 맞히면 빠집니다.
storage.markAnswer("mars:0", false);
storage.markAnswer("mars:0", false);
if (storage.getProgress().wrong.join() !== "mars:0") fail("wrong once");
storage.markAnswer("mars:0", true);
if (storage.getProgress().wrong.length !== 0) fail("wrong removed");

// 5. 같은 별자리는 한 주에 한 번만 셉니다. 월요일이 되면 새 주가 됩니다.
storage.findConstellation("Ori");
storage.findConstellation("Ori");
if (storage.getProgress().week.counts.sky !== 1) fail("sky unique");
now = new RealDate(2026, 10, 23, 9).getTime();
if (storage.getProgress().week.id !== "2026-11-23" || storage.getProgress().week.counts.sky) fail("new week");

// 6. 보너스 별은 한 주에 하나
storage.takeBonusStar();
storage.takeBonusStar();
if (storage.getProgress().bonusStars !== 1) fail("bonus once a week");

// 7. 저장된 값을 다시 읽어도 같습니다.
const saved = JSON.parse(store.get("lumen.apps-in-toss.v1") ?? "{}");
if (saved.bonusStars !== 1 || !Array.isArray(saved.visits)) fail("persisted");

console.log("storage-check ok");
