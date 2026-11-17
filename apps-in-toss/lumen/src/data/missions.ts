/** 주간 미션. 월요일에 바뀌고, 한 주에 세 가지가 나옵니다. */
export type MissionKind = "visit" | "daily" | "quiz" | "sky" | "race" | "review";
export type Mission = { kind: MissionKind; title: string; target: number };

export const MISSION_POOL: readonly Mission[] = [
  { kind: "visit", title: "이번 주 5일 들어오기", target: 5 },
  { kind: "daily", title: "오늘의 문제 3번 맞히기", target: 3 },
  { kind: "quiz", title: "퀴즈 2세트 끝까지 풀기", target: 2 },
  { kind: "sky", title: "서울 밤하늘에서 별자리 3개 찾기", target: 3 },
  { kind: "race", title: "빛이랑 경주 한 번 끝내기", target: 1 },
  { kind: "review", title: "틀린 문제 3개 다시 맞히기", target: 3 },
];

/** weekId 는 그 주 월요일의 "YYYY-MM-DD". */
export function weekMissions(weekId: string): Mission[] {
  const [y, m, d] = weekId.split("-").map(Number);
  const n = Math.floor(Date.UTC(y, m - 1, d) / (7 * 86_400_000));
  const size = MISSION_POOL.length;
  return [n % size, (n + 2) % size, (n + 4) % size].map((index) => MISSION_POOL[index]);
}
