/**
 * 달 모양 그림. age 는 삭에서 지난 날 수(0~29.53).
 * 북반구에서 보는 모습: 차오를 때는 오른쪽, 기울 때는 왼쪽이 밝아요.
 */
const SYNODIC = 29.530588853;

export function MoonIcon({ age, size = 40, label }: { age: number; size?: number; label?: string }) {
  const r = 18;
  const theta = (2 * Math.PI * (((age % SYNODIC) + SYNODIC) % SYNODIC)) / SYNODIC;
  const waxing = theta <= Math.PI;
  const cos = Math.cos(theta);
  const rx = Math.abs(cos) * r;
  const crescent = cos > 0;
  // 밝은 쪽 테두리(반원) + 명암 경계(타원 반쪽)
  const limbSweep = waxing ? 1 : 0;
  const termSweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
  const lit = `M 20 2 A ${r} ${r} 0 0 ${limbSweep} 20 38 A ${rx.toFixed(2)} ${r} 0 0 ${termSweep} 20 2 Z`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label={label ?? "달 모양"} className="moon-icon">
      <circle cx="20" cy="20" r={r} fill="#333d4b" />
      <path d={lit} fill="#f9f3dc" />
      <circle cx="20" cy="20" r={r} fill="none" stroke="#d1d6db" strokeWidth="1" />
    </svg>
  );
}
