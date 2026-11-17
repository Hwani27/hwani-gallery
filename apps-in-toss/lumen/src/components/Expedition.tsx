/** 태양계 원정 지도. 모은 도장 수만큼 수성에서 보이저 1호까지 나아갑니다. */
export const WAYPOINTS: readonly { name: string; need: number; line: string }[] = [
  { name: "수성", need: 0, line: "태양에 가장 가까운 행성에서 출발해요." },
  { name: "금성", need: 2, line: "구름에 덮인 가장 뜨거운 행성이에요." },
  { name: "지구", need: 4, line: "우리 집 지구를 지나요." },
  { name: "화성", need: 7, line: "붉은 행성에 닿았어요." },
  { name: "목성", need: 10, line: "가장 큰 행성의 대적점을 지나요." },
  { name: "토성", need: 14, line: "얼음 고리 곁을 날아요." },
  { name: "천왕성", need: 18, line: "옆으로 누운 행성이에요." },
  { name: "해왕성", need: 22, line: "가장 먼 행성, 바람이 거세요." },
  { name: "보이저 1호", need: 27, line: "사람이 만든 가장 먼 탐사선과 만났어요." },
];

export function expeditionStep(stamps: number): number {
  let step = 0;
  WAYPOINTS.forEach((point, i) => {
    if (stamps >= point.need) step = i;
  });
  return step;
}

export function expeditionLine(stamps: number): string {
  const step = expeditionStep(stamps);
  const next = WAYPOINTS[step + 1];
  if (!next) return "보이저 1호까지 원정을 마쳤어요.";
  return `지금 ${WAYPOINTS[step].name} · 도장 ${next.need - stamps}개 더 모으면 ${next.name}`;
}

export function Expedition({ stamps }: { stamps: number }) {
  const step = expeditionStep(stamps);
  const width = 320;
  const gap = (width - 32) / (WAYPOINTS.length - 1);
  return (
    <div className="expedition">
      <svg viewBox={`0 0 ${width} 72`} role="img" aria-label={`태양계 원정 지도, 지금 ${WAYPOINTS[step].name}`}>
        <line x1="16" y1="24" x2={width - 16} y2="24" stroke="#e5e8eb" strokeWidth="4" strokeLinecap="round" />
        <line x1="16" y1="24" x2={16 + step * gap} y2="24" stroke="#3182f6" strokeWidth="4" strokeLinecap="round" />
        {WAYPOINTS.map((point, i) => (
          <g key={point.name}>
            <circle cx={16 + i * gap} cy="24" r={i === step ? 8 : 5} fill={i <= step ? "#3182f6" : "#fff"} stroke={i <= step ? "#3182f6" : "#d1d6db"} strokeWidth="2" />
            <text x={16 + i * gap} y={i % 2 === 0 ? 52 : 66} textAnchor="middle" className={i === step ? "is-now" : undefined}>
              {point.name === "보이저 1호" ? "보이저" : point.name}
            </text>
          </g>
        ))}
      </svg>
      <p className="muted">
        {WAYPOINTS[step].line} {expeditionLine(stamps)}
      </p>
    </div>
  );
}
