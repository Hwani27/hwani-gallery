export type Place = { name: string; lat: number; lon: number };

export const CITY_HALL: Place = { name: "서울시청", lat: 37.5663, lon: 126.9779 };

export const PLACES: readonly Place[] = [
  { name: "덕수궁", lat: 37.5658, lon: 126.9751 },
  { name: "명동성당", lat: 37.5633, lon: 126.9873 },
  { name: "광화문", lat: 37.5759, lon: 126.9768 },
  { name: "서울역", lat: 37.5547, lon: 126.9707 },
  { name: "경복궁", lat: 37.5796, lon: 126.977 },
  { name: "N서울타워", lat: 37.5512, lon: 126.9882 },
  { name: "동대문디자인플라자", lat: 37.5665, lon: 127.0092 },
  { name: "용산역", lat: 37.5298, lon: 126.9648 },
  { name: "서울숲", lat: 37.5444, lon: 127.0374 },
  { name: "여의도 63빌딩", lat: 37.5198, lon: 126.9403 },
  { name: "코엑스", lat: 37.5116, lon: 127.0595 },
  { name: "롯데월드타워", lat: 37.5126, lon: 127.1025 },
  { name: "김포공항", lat: 37.5586, lon: 126.7944 },
  { name: "인천시청", lat: 37.4563, lon: 126.7052 },
  { name: "수원 화성", lat: 37.2871, lon: 127.0118 },
  { name: "인천국제공항", lat: 37.4602, lon: 126.4407 },
  { name: "춘천역", lat: 37.8847, lon: 127.7169 },
  { name: "천안역", lat: 36.8095, lon: 127.1462 },
  { name: "충주시청", lat: 36.991, lon: 127.9259 },
  { name: "대전역", lat: 36.3324, lon: 127.4344 },
  { name: "강릉역", lat: 37.7643, lon: 128.8994 },
];

export function distanceKm(a: Place, b: Place): number {
  const n = Math.PI / 180;
  const dLat = (b.lat - a.lat) * n;
  const dLon = (b.lon - a.lon) * n;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * n) * Math.cos(b.lat * n) * Math.sin(dLon / 2) ** 2;
  return 12742.0176 * Math.asin(Math.sqrt(h));
}

export function nearestPlace(modelKm: number): { place: Place; km: number; close: boolean } {
  let place = PLACES[0];
  let km = distanceKm(CITY_HALL, place);
  let best = Number.POSITIVE_INFINITY;
  for (const candidate of PLACES) {
    const away = distanceKm(CITY_HALL, candidate);
    const score = Math.abs(Math.log(away / Math.max(modelKm, 1e-6)));
    if (score < best) {
      best = score;
      place = candidate;
      km = away;
    }
  }
  return { place, km, close: best < Math.log(1.35) };
}
