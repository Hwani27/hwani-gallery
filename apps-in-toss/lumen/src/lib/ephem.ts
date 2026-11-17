/**
 * 행성 위치와 하늘 이벤트를 인터넷 없이 계산합니다.
 *
 * 행성: JPL "Approximate Positions of the Planets"(E. M. Standish) 표 1의 케플러 요소, 1800~2050년용.
 *   이 앱이 쓰는 범위에서 오차는 수 분각 이내라, 맨눈으로 찾는 데 충분합니다.
 * 삭·망: J. Meeus, Astronomical Algorithms 49장의 주요 보정항. 실제 시각과 수 분 안쪽으로 맞습니다.
 * 결과 좌표는 J2000 적경·적위(도)라 별 좌표와 같은 기준입니다.
 */

type Elements = readonly [a: number, e: number, i: number, L: number, peri: number, node: number];
type Body = { id: string; name: string; base: Elements; rate: Elements };

const BODIES: readonly Body[] = [
  { id: "mercury", name: "수성", base: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593], rate: [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081] },
  { id: "venus", name: "금성", base: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255], rate: [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418] },
  { id: "earth", name: "지구", base: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0], rate: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0] },
  { id: "mars", name: "화성", base: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891], rate: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343] },
  { id: "jupiter", name: "목성", base: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], rate: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106] },
  { id: "saturn", name: "토성", base: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], rate: [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794] },
];

export const NAKED_EYE_PLANETS = BODIES.filter((body) => body.id !== "earth").map(({ id, name }) => ({ id, name }));

const RAD = Math.PI / 180;
const OBLIQUITY = 23.43928 * RAD;

type Vec = [number, number, number];

function julianDay(at: Date): number {
  return at.getTime() / 86_400_000 + 2440587.5;
}

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** 태양 중심 황도 좌표(AU). */
function heliocentric(body: Body, T: number): Vec {
  const [a, e, i, L, peri, node] = body.base.map((value, index) => value + body.rate[index] * T);
  const omega = peri - node;
  let M = norm360(L - peri);
  if (M > 180) M -= 360;
  const Mr = M * RAD;
  let E = Mr + e * Math.sin(Mr);
  for (let step = 0; step < 8; step += 1) {
    E -= (E - e * Math.sin(E) - Mr) / (1 - e * Math.cos(E));
  }
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const co = Math.cos(omega * RAD);
  const so = Math.sin(omega * RAD);
  const cn = Math.cos(node * RAD);
  const sn = Math.sin(node * RAD);
  const ci = Math.cos(i * RAD);
  const si = Math.sin(i * RAD);
  return [
    (co * cn - so * sn * ci) * xp + (-so * cn - co * sn * ci) * yp,
    (co * sn + so * cn * ci) * xp + (-so * sn + co * cn * ci) * yp,
    so * si * xp + co * si * yp,
  ];
}

function toEquatorial([x, y, z]: Vec): { ra: number; dec: number; lon: number; dist: number } {
  const dist = Math.hypot(x, y, z);
  const lon = norm360(Math.atan2(y, x) / RAD);
  const ye = y * Math.cos(OBLIQUITY) - z * Math.sin(OBLIQUITY);
  const ze = y * Math.sin(OBLIQUITY) + z * Math.cos(OBLIQUITY);
  return { ra: norm360(Math.atan2(ye, x) / RAD), dec: Math.asin(ze / dist) / RAD, lon, dist };
}

export type PlanetPlace = { id: string; name: string; ra: number; dec: number; lon: number; dist: number; elongation: number; fromSun: number };

/** 지구에서 본 행성과 태양의 위치. elongation 은 태양에서 떨어진 각도(동쪽 +, 서쪽 -). */
export function planetPlaces(at: Date): { sun: { ra: number; dec: number; lon: number }; planets: PlanetPlace[] } {
  const T = (julianDay(at) - 2451545) / 36525;
  const earth = heliocentric(BODIES[2], T);
  const sun = toEquatorial([-earth[0], -earth[1], -earth[2]]);
  const sunVec: Vec = [-earth[0], -earth[1], -earth[2]];
  const planets = BODIES.filter((body) => body.id !== "earth").map((body) => {
    const p = heliocentric(body, T);
    const geo: Vec = [p[0] - earth[0], p[1] - earth[1], p[2] - earth[2]];
    const place = toEquatorial(geo);
    const cos = (geo[0] * sunVec[0] + geo[1] * sunVec[1] + geo[2] * sunVec[2]) / (Math.hypot(...geo) * Math.hypot(...sunVec));
    const angle = Math.acos(Math.max(-1, Math.min(1, cos))) / RAD;
    let dl = place.lon - sun.lon;
    if (dl > 180) dl -= 360;
    if (dl < -180) dl += 360;
    return { id: body.id, name: body.name, ...place, elongation: dl >= 0 ? angle : -angle, fromSun: dl };
  });
  return { sun, planets };
}

/* ---------- 삭과 망 ---------- */

/** k 가 정수면 삭, .5 면 망. 결과는 UTC 밀리초(역학시와의 1분 남짓 차이는 무시). */
function phaseTime(k: number): number {
  const full = k % 1 !== 0;
  const T = k / 1236.85;
  const jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T;
  const E = 1 - 0.002516 * T;
  const M = (2.5534 + 29.1053567 * k) * RAD;
  const Mp = (201.5643 + 385.81693528 * k) * RAD;
  const F = (160.7108 + 390.67050284 * k) * RAD;
  const O = (124.7746 - 1.56375588 * k) * RAD;
  const c = full
    ? -0.40614 * Math.sin(Mp) + 0.17302 * E * Math.sin(M) + 0.01614 * Math.sin(2 * Mp) + 0.01043 * Math.sin(2 * F) +
      0.00734 * E * Math.sin(Mp - M) - 0.00515 * E * Math.sin(Mp + M) + 0.00209 * E * E * Math.sin(2 * M) -
      0.00111 * Math.sin(Mp - 2 * F) - 0.00057 * Math.sin(Mp + 2 * F) + 0.00056 * E * Math.sin(2 * Mp + M) -
      0.00042 * Math.sin(3 * Mp) + 0.00042 * E * Math.sin(M + 2 * F) + 0.00038 * E * Math.sin(M - 2 * F) -
      0.00024 * E * Math.sin(2 * Mp - M) - 0.00017 * Math.sin(O)
    : -0.4072 * Math.sin(Mp) + 0.17241 * E * Math.sin(M) + 0.01608 * Math.sin(2 * Mp) + 0.01039 * Math.sin(2 * F) +
      0.00739 * E * Math.sin(Mp - M) - 0.00514 * E * Math.sin(Mp + M) + 0.00208 * E * E * Math.sin(2 * M) -
      0.00111 * Math.sin(Mp - 2 * F) - 0.00057 * Math.sin(Mp + 2 * F) + 0.00056 * E * Math.sin(2 * Mp + M) -
      0.00042 * Math.sin(3 * Mp) + 0.00042 * E * Math.sin(M + 2 * F) + 0.00038 * E * Math.sin(M - 2 * F) -
      0.00024 * E * Math.sin(2 * Mp - M) - 0.00017 * Math.sin(O);
  return (jde + c - 2440587.5) * 86_400_000;
}

export function moonPhasesBetween(from: Date, to: Date): { kind: "new" | "full"; at: number }[] {
  const k0 = Math.floor((julianDay(from) - 2451550.09766) / 29.530588861) - 1;
  const out: { kind: "new" | "full"; at: number }[] = [];
  for (let k = k0; ; k += 0.5) {
    const at = phaseTime(k);
    if (at > to.getTime()) break;
    if (at >= from.getTime()) out.push({ kind: k % 1 === 0 ? "new" : "full", at });
  }
  return out;
}

/* ---------- 행성 이벤트 ---------- */

export type PlanetEvent = { kind: "opposition" | "east" | "west"; id: string; name: string; at: number; angle: number };

/** 하루 간격으로 훑어 충(화성·목성·토성)과 최대 이각(수성·금성)을 찾습니다. */
export function planetEventsBetween(from: Date, to: Date): PlanetEvent[] {
  const DAY = 86_400_000;
  const start = from.getTime() - 2 * DAY;
  const samples: PlanetPlace[][] = [];
  const times: number[] = [];
  for (let t = start; t <= to.getTime() + 2 * DAY; t += DAY) {
    times.push(t);
    samples.push(planetPlaces(new Date(t)).planets);
  }
  const events: PlanetEvent[] = [];
  /** 세 점에 포물선을 맞춰 꼭짓점 시각을 구합니다. */
  const peak = (d: number, a: number, b: number, c: number) => {
    const den = a - 2 * b + c;
    const shift = den === 0 ? 0 : Math.max(-0.5, Math.min(0.5, (0.5 * (a - c)) / den));
    return times[d] + shift * DAY;
  };
  for (let p = 0; p < NAKED_EYE_PLANETS.length; p += 1) {
    const { id, name } = NAKED_EYE_PLANETS[p];
    const inner = id === "mercury" || id === "venus";
    for (let d = 1; d < samples.length - 1; d += 1) {
      const [a, b, c] = [samples[d - 1][p].elongation, samples[d][p].elongation, samples[d + 1][p].elongation];
      if (times[d] < from.getTime() || times[d] > to.getTime()) continue;
      if (inner) {
        if (b > 0 && b > a && b >= c) events.push({ kind: "east", id, name, at: peak(d, a, b, c), angle: b });
        if (b < 0 && b < a && b <= c) events.push({ kind: "west", id, name, at: peak(d, a, b, c), angle: -b });
      } else {
        // 충: 황경 차이가 180도를 지나는 날
        const [fa, fb, fc] = [samples[d - 1][p].fromSun, samples[d][p].fromSun, samples[d + 1][p].fromSun].map(Math.abs);
        if (fb > 170 && fb >= fa && fb > fc) events.push({ kind: "opposition", id, name, at: peak(d, fa, fb, fc), angle: fb });
      }
    }
  }
  return events;
}
