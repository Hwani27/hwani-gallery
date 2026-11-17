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

/** "YYYY-MM-DD" 날짜에 하루 단위로 더하거나 뺍니다. */
export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return localDateKey(new Date(y, m - 1, d + delta, 12));
}

/** 1970-01-01 부터 센 날 수(기기 시간대 기준). 오늘의 문제 순서에 씁니다. */
export function dayNumber(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/** 받침에 따라 조사를 고릅니다. pair 는 "은는", "을를", "이가", "과와" 처럼 받침 있을 때를 앞에 씁니다. */
export function josa(word: string, pair: "은는" | "을를" | "이가" | "과와"): string {
  const text = word.trim();
  const last = text.charCodeAt(text.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  const hasFinal = isHangul ? (last - 0xac00) % 28 > 0 : /[0-9]$/.test(text) ? !/[2459]$/.test(text) : false;
  return text + (hasFinal ? pair[0] : pair[1]);
}
