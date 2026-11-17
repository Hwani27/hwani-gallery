export type WeightBody = {
  id: string;
  name: string;
  ratio: number;
  line: string;
  cloudTop?: boolean;
  color: string;
};

/** Surface gravity relative to Earth. Ratios follow the existing Lumen scale (NASA planetary fact sheet). */
export const WEIGHT_BODIES: readonly WeightBody[] = [
  { id: "moon", name: "달", ratio: 0.166, line: "깡충! 캥거루처럼 높이 뛰어요.", color: "#c5c8ce" },
  { id: "mercury", name: "수성", ratio: 0.378, line: "몸이 가벼워요. 공도 멀리 날아가요.", color: "#b5ada4" },
  { id: "venus", name: "금성", ratio: 0.907, line: "지구랑 거의 비슷해요. 그런데 아주 뜨거워요!", color: "#e0c48a" },
  { id: "mars", name: "화성", ratio: 0.377, line: "농구 골대에 손이 닿을지도 몰라요.", color: "#c15b3c" },
  { id: "jupiter", name: "목성", ratio: 2.36, line: "으쌰! 다리가 무거워요.", cloudTop: true, color: "#d2a679" },
  { id: "saturn", name: "토성", ratio: 0.916, line: "고리는 멋진데, 몸무게는 비슷해요.", cloudTop: true, color: "#e6d3a3" },
  { id: "uranus", name: "천왕성", ratio: 0.889, line: "옆으로 누운 행성에서 살짝 가벼워요.", cloudTop: true, color: "#8fd0cb" },
  { id: "neptune", name: "해왕성", ratio: 1.12, line: "조금 무거워요. 바람은 엄청 세요!", cloudTop: true, color: "#3d6ea5" },
  { id: "pluto", name: "명왕성", ratio: 0.071, line: "깃털처럼 가벼워요. 둥실둥실!", color: "#d9c7b8" },
  { id: "sun", name: "태양", ratio: 27.9, line: "저울 숫자가 약 28배가 돼요. 너무 뜨거워서 갈 수는 없어요.", cloudTop: true, color: "#f0c14a" },
];

export type RaceTarget = {
  id: string;
  name: string;
  seconds: number;
  mean: string;
};

/** Mean one-way light time from the Sun, matching the Lumen race targets. Voyager 1 is about one light-day in November 2026. */
export const RACE_TARGETS: readonly RaceTarget[] = [
  { id: "mercury", name: "수성", seconds: 193, mean: "평균 3분 13초" },
  { id: "venus", name: "금성", seconds: 360, mean: "평균 6분 0초" },
  { id: "earth", name: "지구", seconds: 500, mean: "평균 8분 20초" },
  { id: "mars", name: "화성", seconds: 760, mean: "평균 12분 40초" },
  { id: "jupiter", name: "목성", seconds: 2580, mean: "평균 43분" },
  { id: "saturn", name: "토성", seconds: 4800, mean: "평균 1시간 20분" },
  { id: "uranus", name: "천왕성", seconds: 9600, mean: "평균 2시간 40분" },
  { id: "neptune", name: "해왕성", seconds: 15000, mean: "평균 4시간 10분" },
  { id: "voyager1", name: "보이저 1호", seconds: 86400, mean: "지구에서 빛으로 약 하루" },
];

export const RACE_SPEEDS = [1, 10, 100, 1000, 10000] as const;

export function defaultRaceSpeed(targetId: string): number {
  if (targetId === "voyager1") return 10000;
  if (targetId === "uranus" || targetId === "neptune" || targetId === "jupiter" || targetId === "saturn") return 1000;
  return 100;
}

export type ToyBody = {
  id: string;
  name: string;
  diameterKm: number;
  distanceKm: number;
  from: "sun" | "earth";
  color: string;
};

export const SOCCER_BALL_M = 0.22;
export const EARTH_DIAMETER_KM = 12756;
export const SUN_DIAMETER_KM = 1_391_400;
/** Proxima Centauri distance used by the original size toy. */
export const PROXIMA_KM = 40_174_862_550_000;

export const TOY_BODIES: readonly ToyBody[] = [
  { id: "mercury", name: "수성", diameterKm: 4879, distanceKm: 57_900_000, from: "sun", color: "#b5ada4" },
  { id: "venus", name: "금성", diameterKm: 12104, distanceKm: 108_200_000, from: "sun", color: "#e0c48a" },
  { id: "earth", name: "지구", diameterKm: 12756, distanceKm: 149_600_000, from: "sun", color: "#2f6fad" },
  { id: "moon", name: "달", diameterKm: 3475, distanceKm: 384_400, from: "earth", color: "#c5c8ce" },
  { id: "mars", name: "화성", diameterKm: 6792, distanceKm: 228_000_000, from: "sun", color: "#c15b3c" },
  { id: "jupiter", name: "목성", diameterKm: 142984, distanceKm: 778_500_000, from: "sun", color: "#d2a679" },
  { id: "saturn", name: "토성", diameterKm: 120536, distanceKm: 1_432_000_000, from: "sun", color: "#e6d3a3" },
  { id: "uranus", name: "천왕성", diameterKm: 51118, distanceKm: 2_867_000_000, from: "sun", color: "#8fd0cb" },
  { id: "neptune", name: "해왕성", diameterKm: 49528, distanceKm: 4_515_000_000, from: "sun", color: "#3d6ea5" },
  { id: "pluto", name: "명왕성", diameterKm: 2376, distanceKm: 5_906_400_000, from: "sun", color: "#d9c7b8" },
];

export const BALLS = [
  { name: "탁구공", cm: 4 },
  { name: "테니스공", cm: 6.7 },
  { name: "야구공", cm: 7.3 },
  { name: "축구공", cm: 22 },
] as const;

export function modelMeters(realKm: number): number {
  return (realKm * SOCCER_BALL_M) / EARTH_DIAMETER_KM;
}

export function ballName(cm: number): string | null {
  for (const ball of BALLS) {
    if (Math.abs(Math.log(cm / ball.cm)) < Math.log(1.12)) return ball.name;
  }
  return null;
}
