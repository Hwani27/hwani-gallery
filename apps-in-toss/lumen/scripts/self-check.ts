import { altAz, localSiderealDegrees, sunAltitude } from "../src/lib/astro.ts";
import { SEOUL, issFix, lookAngles, upcomingPasses } from "../src/lib/iss.ts";
import { modelMeters, WEIGHT_BODIES } from "../src/data/planets.ts";
import { addDays, formatDuration, formatLength, josa } from "../src/lib/format.ts";
import { moonPhase } from "../src/lib/moon.ts";
import { QUIZZES, allQuestions, allStamps, dailyQuestion } from "../src/data/quizzes.ts";
import { CONSTELLATION_META } from "../src/data/constellations.ts";
import { CONSTELLATION_LINES } from "../src/data/sky.ts";
import { streakOf } from "../src/lib/storage.ts";

const polaris = altAz(37.954, 89.264, SEOUL.lat, localSiderealDegrees(new Date("2026-11-17T12:00:00+09:00"), SEOUL.lon));
if (Math.abs(polaris.alt - SEOUL.lat) > 1.2) {
  throw new Error(`Polaris altitude ${polaris.alt} is far from latitude ${SEOUL.lat}`);
}

const noon = sunAltitude(new Date("2026-06-21T12:30:00+09:00"), SEOUL.lat, SEOUL.lon);
const night = sunAltitude(new Date("2026-11-17T21:00:00+09:00"), SEOUL.lat, SEOUL.lon);
if (noon < 40) throw new Error(`June noon sun too low: ${noon}`);
if (night > -10) throw new Error(`November 21:00 sun not down: ${night}`);

const a = issFix(new Date("2026-11-17T00:00:00Z"));
const b = issFix(new Date("2026-11-17T01:32:48Z"));
if (Math.abs(a.lat) > 52 || Math.abs(b.lat) > 52) throw new Error("ISS latitude out of range");
const lonDelta = Math.abs((((b.lon - a.lon) % 360) + 540) % 360 - 180);
if (lonDelta < 10) throw new Error(`ISS ground track barely moved: ${a.lon} -> ${b.lon}`);

const moon = WEIGHT_BODIES.find((body) => body.id === "moon");
if (!moon || Math.abs(moon.ratio * 30 - 4.98) > 0.05) throw new Error("moon weight");
if (formatDuration(500) !== "8분 20초") throw new Error(formatDuration(500));
const moonMeters = modelMeters(384400);
if (Math.abs(moonMeters - 6.63) > 0.05) throw new Error(`moon model ${moonMeters}`);
if (formatLength(moonMeters) !== "6.6m") throw new Error(formatLength(moonMeters));

const passes = upcomingPasses(new Date("2026-11-17T00:00:00+09:00"), 1);
if (passes.length < 5) throw new Error(`expected several ISS passes, got ${passes.length}`);
const overhead = lookAngles(SEOUL.lat, SEOUL.lon, a.ecef);
if (overhead.elev > 90 || overhead.elev < -90) throw new Error("bad elevation");

// 달 모양: 2026-11-24 14:53 UTC, 2026-12-24 01:28 UTC 보름
for (const iso of ["2026-11-24T14:53:00Z", "2026-12-24T01:28:00Z"]) {
  const full = moonPhase(new Date(iso));
  if (Math.abs(full.age - 14.77) > 0.8 || full.name !== "보름달 무렵") throw new Error(`full moon ${iso}: ${full.age} ${full.name}`);
}

// 퀴즈: 답 번호, 보기 중복, 문장 끝
const ids = new Set<string>();
for (const quiz of QUIZZES) {
  if (ids.has(quiz.id)) throw new Error(`duplicate quiz ${quiz.id}`);
  ids.add(quiz.id);
  for (const question of quiz.questions) {
    if (question.answer < 0 || question.answer >= question.options.length) throw new Error(`answer index ${question.q}`);
    if (new Set(question.options).size !== question.options.length) throw new Error(`duplicate options ${question.q}`);
    if (!/[.!?요]$/.test(question.why)) throw new Error(`why ends oddly: ${question.why}`);
  }
}
const stampIds = allStamps().map((stamp) => stamp.id);
if (new Set(stampIds).size !== stampIds.length) throw new Error("duplicate stamp ids");
const pool = allQuestions().length;
const seen = new Set<string>();
for (let day = 0; day < pool; day += 1) seen.add(dailyQuestion(new Date(2026, 10, 18 + day)).q);
if (seen.size !== pool) throw new Error(`daily cycle repeats early: ${seen.size}/${pool}`);

// 별자리 설명과 선
for (const meta of CONSTELLATION_META) {
  if (!CONSTELLATION_LINES[meta.id]?.length) throw new Error(`no lines for ${meta.id}`);
}

// 연속 방문과 조사
if (streakOf(["2026-11-16", "2026-11-17", "2026-11-18"], "2026-11-18") !== 3) throw new Error("streak 3");
if (streakOf(["2026-11-15", "2026-11-17", "2026-11-18"], "2026-11-18") !== 2) throw new Error("streak gap");
if (streakOf(["2026-11-17"], "2026-11-18") !== 0) throw new Error("streak today");
if (addDays("2026-12-31", 1) !== "2027-01-01" || addDays("2027-03-01", -1) !== "2027-02-28") throw new Error("addDays");
if (josa("오리온자리", "을를") !== "오리온자리를" || josa("큰곰자리 · 북두칠성", "은는") !== "큰곰자리 · 북두칠성은") throw new Error("josa");

console.log(JSON.stringify({
  polarisAlt: Number(polaris.alt.toFixed(2)),
  noon: Number(noon.toFixed(1)),
  night: Number(night.toFixed(1)),
  iss: { lat: Number(a.lat.toFixed(1)), lon: Number(a.lon.toFixed(1)), laterLon: Number(b.lon.toFixed(1)) },
  passes: passes.length,
  moonMeters: Number(moonMeters.toFixed(2)),
  moonTonight: moonPhase(new Date("2026-11-18T21:00:00+09:00")).name,
  quizzes: QUIZZES.length,
  questions: pool,
  stamps: stampIds.length,
}, null, 2));
