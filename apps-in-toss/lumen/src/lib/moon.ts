/**
 * 오늘 밤 달 모양을 계산합니다. 인터넷 없이 평균 삭망월로 셉니다.
 * 기준 삭: 2000-01-06 18:14 UTC. 평균 삭망월 29.530588853일.
 * 평균값이라 실제 삭·망 시각과 반나절쯤 차이 날 수 있어서, 모양 이름은 넓게 나눕니다.
 */
const SYNODIC_DAYS = 29.530588853;
const NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

export type MoonPhase = {
  /** 삭에서 지난 날 수, 0 이상 29.53 미만 */
  age: number;
  /** 밝게 보이는 비율 0~1 */
  lit: number;
  name: string;
  line: string;
};

export function moonPhase(at: Date): MoonPhase {
  const days = (at.getTime() - NEW_MOON_MS) / 86_400_000;
  const age = ((days % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
  const lit = (1 - Math.cos((2 * Math.PI * age) / SYNODIC_DAYS)) / 2;
  if (age < 1.5 || age >= 28.0) {
    return { age, lit, name: "그믐에서 삭 무렵", line: "달이 해와 같은 쪽에 있어서 거의 안 보여요. 별 보기 좋은 밤이에요." };
  }
  if (age < 6.4) return { age, lit, name: "초승달", line: "해가 진 뒤 서쪽 하늘에 가는 달이 잠깐 떠요." };
  if (age < 8.4) return { age, lit, name: "상현달 무렵", line: "저녁에 남쪽 하늘에서 오른쪽이 밝은 반달이 보여요." };
  if (age < 13.8) return { age, lit, name: "차오르는 달", line: "저녁부터 밤까지 점점 커지는 달이 보여요." };
  if (age < 15.8) return { age, lit, name: "보름달 무렵", line: "해가 질 때 동쪽에서 떠서 밤새 하늘에 있어요." };
  if (age < 21.1) return { age, lit, name: "기우는 달", line: "밤늦게 떠서 새벽 하늘에 남아 있어요." };
  if (age < 23.1) return { age, lit, name: "하현달 무렵", line: "자정 무렵 떠서, 새벽에 왼쪽이 밝은 반달이 보여요." };
  return { age, lit, name: "그믐달", line: "새벽 동쪽 하늘에 가는 달이 잠깐 보여요." };
}
