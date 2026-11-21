export function formatKg(kg: number): string {
  if (!Number.isFinite(kg) || kg <= 0) return "0kg";
  if (kg < 10) return `${kg.toFixed(1)}kg`;
  return `${Math.round(kg).toLocaleString("ko-KR")}kg`;
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}시간 ${minutes}분 ${secs}초`;
  if (minutes > 0) return `${minutes}분 ${secs}초`;
  return `${secs}초`;
}

/** Length in meters, using the same steps as the original size toy. */
export function formatLength(meters: number): string {
  if (meters < 0.01) return `${(meters * 1000).toFixed(1)}mm`;
  if (meters < 1) return `${(meters * 100).toFixed(meters < 0.1 ? 1 : 0)}cm`;
  if (meters < 1000) return `${meters < 10 ? meters.toFixed(1) : Math.round(meters)}m`;
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km).toLocaleString("ko-KR")}km`;
}

export function formatSpeed(multiplier: number): string {
  if (multiplier === 1) return "진짜 빠르기";
  return `${multiplier.toLocaleString("ko-KR")}배`;
}

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function compass(azimuth: number): string {
  const names = ["북쪽", "북동쪽", "동쪽", "남동쪽", "남쪽", "남서쪽", "서쪽", "북서쪽"];
  return names[Math.round(azimuth / 45) % 8];
}
