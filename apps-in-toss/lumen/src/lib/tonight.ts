import { altAz, localSiderealDegrees, sunAltitude } from "./astro";
import { NAKED_EYE_PLANETS, moonPhasesBetween, planetEventsBetween, planetPlaces } from "./ephem";
import { compass, josa, localDateKey } from "./format";
import { SEOUL } from "./iss";
import { moonPhase } from "./moon";

export type TonightPlanet = { id: string; name: string; hour: number; when: string; dir: string; alt: number };

/** 저녁 6시부터 새벽 6시까지 한 시간 간격으로 보고, 하늘이 어두울 때 가장 높이 뜨는 시각을 고릅니다. */
export function tonightPlanets(day = new Date()): TonightPlanet[] {
  const best = new Map<string, TonightPlanet>();
  for (let hour = 18; hour <= 30; hour += 1) {
    const at = new Date(day);
    at.setHours(0, 0, 0, 0);
    at.setHours(hour);
    if (sunAltitude(at, SEOUL.lat, SEOUL.lon) > -6) continue;
    const lst = localSiderealDegrees(at, SEOUL.lon);
    for (const planet of planetPlaces(at).planets) {
      const sky = altAz(planet.ra, planet.dec, SEOUL.lat, lst);
      if (sky.alt < 8) continue;
      const current = best.get(planet.id);
      if (!current || sky.alt > current.alt) {
        best.set(planet.id, { id: planet.id, name: planet.name, hour, when: hourLabel(hour), dir: compass(sky.az), alt: sky.alt });
      }
    }
  }
  return NAKED_EYE_PLANETS.map((planet) => best.get(planet.id)).filter((item): item is TonightPlanet => Boolean(item));
}

export function hourLabel(hour: number): string {
  if (hour >= 24) return `새벽 ${hour - 24}시`;
  if (hour <= 20) return `저녁 ${hour - 12}시`;
  return `밤 ${hour - 12}시`;
}

/* ---------- 하늘 달력 ---------- */

export type SkyEvent = { key: string; day: string; title: string; line: string; moon?: number };

/** 매년 같은 무렵 오는 유성우. 극대일은 해마다 하루쯤 달라질 수 있어 "무렵"으로 씁니다. 날짜는 한국 밤 기준. */
const SHOWERS: readonly { month: number; day: number; name: string; line: string }[] = [
  { month: 1, day: 3, name: "사분의자리 유성우", line: "새해 첫 큰 유성우예요. 자정 넘어 북동쪽 하늘을 넓게 봐요." },
  { month: 4, day: 22, name: "거문고자리 유성우", line: "봄의 유성우예요. 밤늦게 베가가 높이 떴을 때 잘 보여요." },
  { month: 8, day: 12, name: "페르세우스자리 유성우", line: "여름의 큰 유성우예요. 자정 넘어 북동쪽 하늘이 좋아요." },
  { month: 10, day: 21, name: "오리온자리 유성우", line: "새벽에 오리온자리가 높이 떴을 때 잘 보여요." },
  { month: 11, day: 17, name: "사자자리 유성우", line: "새벽 동쪽 하늘에서 사자자리 쪽을 봐요." },
  { month: 12, day: 14, name: "쌍둥이자리 유성우", line: "한 해 가장 많이 떨어지는 유성우 가운데 하나예요. 저녁부터 보여요." },
];

function kstKey(ms: number): string {
  return localDateKey(new Date(ms));
}

export function upcomingSkyEvents(from = new Date(), days = 60): SkyEvent[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + days * 86_400_000);
  const events: (SkyEvent & { sort: number })[] = [];

  for (const phase of moonPhasesBetween(start, end)) {
    const day = kstKey(phase.at);
    events.push(
      phase.kind === "full"
        ? { key: `full-${day}`, day, sort: phase.at, moon: 14.77, title: "보름달", line: "해 질 무렵 동쪽에서 떠서 밤새 하늘에 있어요." }
        : { key: `new-${day}`, day, sort: phase.at, moon: 0, title: "삭, 별 보기 좋은 밤", line: "달빛이 없어서 희미한 별까지 잘 보여요." },
    );
  }

  for (const event of planetEventsBetween(start, end)) {
    const day = kstKey(event.at);
    if (event.kind === "opposition") {
      events.push({ key: `opp-${event.id}-${day}`, day, sort: event.at, title: `${josa(event.name, "이가")} 가장 잘 보이는 때`, line: "태양 반대편에 와서, 해가 지면 동쪽에서 떠 밤새 보여요. 이 무렵 가장 밝아요." });
    } else {
      const evening = event.kind === "east";
      events.push({
        key: `elong-${event.id}-${day}`,
        day,
        sort: event.at,
        title: `${josa(event.name, "이가")} ${evening ? "저녁" : "새벽"} 하늘에서 태양과 가장 멀어지는 날`,
        line: `${evening ? "해가 진 뒤 서쪽" : "해 뜨기 전 동쪽"}${event.id === "mercury" ? " 낮은" : ""} 하늘을 봐요. 태양에서 약 ${Math.round(event.angle)}도 떨어져요.`,
      });
    }
  }

  for (let year = start.getFullYear(); year <= end.getFullYear(); year += 1) {
    for (const shower of SHOWERS) {
      const at = new Date(year, shower.month - 1, shower.day, 23);
      if (at < start || at > end) continue;
      const bright = moonPhase(at).lit > 0.6;
      events.push({
        key: `shower-${year}-${shower.month}`,
        day: kstKey(at.getTime()),
        sort: at.getTime(),
        title: `${shower.name} 무렵`,
        line: shower.line + (bright ? " 달빛이 밝아 어두운 별똥별은 덜 보여요." : " 달빛이 약해 보기 좋은 해예요."),
      });
    }
  }

  return events.sort((a, b) => a.sort - b.sort).map(({ key, day, title, line, moon }) => ({ key, day, title, line, moon }));
}

export function dDay(day: string, today = localDateKey()): string {
  const [ay, am, ad] = day.split("-").map(Number);
  const [by, bm, bd] = today.split("-").map(Number);
  const diff = Math.round((Date.UTC(ay, am - 1, ad) - Date.UTC(by, bm - 1, bd)) / 86_400_000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  return `${diff}일 뒤`;
}

export function dayLabel(day: string): string {
  const [, m, d] = day.split("-").map(Number);
  return `${m}월 ${d}일`;
}
