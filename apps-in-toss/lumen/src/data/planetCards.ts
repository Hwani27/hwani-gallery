/**
 * 행성 카드. 숫자는 NASA Planetary Fact Sheet(지름, 평균 온도, 하루·1년 길이) 기준이에요.
 * 위성 수는 NASA/JPL 목록을 2026년 10월에 확인한 값이고, 새로 찾을 때마다 늘어나요.
 * 카드는 같은 이름의 퀴즈를 모두 맞혀 도장을 받으면 열려요.
 */
export type PlanetCard = { id: string; name: string; color: string; diameter: string; temp: string; day: string; year: string; moons: string; fact: string };

export const PLANET_CARDS: readonly PlanetCard[] = [
  { id: "mercury", name: "수성", color: "#b5ada4", diameter: "4,879km", temp: "평균 167°C", day: "낮과 밤 한 번에 약 176일", year: "88일", moons: "없어요", fact: "낮에는 430°C까지 뜨겁고 밤에는 영하 180°C까지 내려가요." },
  { id: "venus", name: "금성", color: "#e0c48a", diameter: "12,104km", temp: "평균 464°C", day: "낮과 밤 한 번에 약 117일", year: "225일", moons: "없어요", fact: "거꾸로 돌아서 해가 서쪽에서 떠요." },
  { id: "earth", name: "지구", color: "#2f6fad", diameter: "12,756km", temp: "평균 15°C", day: "24시간", year: "365일", moons: "1개", fact: "겉면의 약 71%가 물로 덮여 있어요." },
  { id: "moon", name: "달", color: "#c5c8ce", diameter: "3,475km", temp: "낮 약 120°C, 밤 약 -130°C", day: "낮과 밤 한 번에 약 29.5일", year: "지구를 한 바퀴 도는 데 27.3일", moons: "달은 지구의 위성이에요", fact: "늘 같은 면만 지구를 향해요." },
  { id: "mars", name: "화성", color: "#c15b3c", diameter: "6,792km", temp: "평균 -65°C", day: "약 24시간 40분", year: "687일", moons: "2개", fact: "태양계에서 가장 큰 화산 올림푸스 화산이 있어요." },
  { id: "jupiter", name: "목성", color: "#d2a679", diameter: "142,984km", temp: "구름 위 평균 -110°C", day: "약 10시간", year: "약 12년", moons: "115개", fact: "대적점은 지구가 쏙 들어갈 만큼 큰 폭풍이에요." },
  { id: "saturn", name: "토성", color: "#e6d3a3", diameter: "120,536km", temp: "구름 위 평균 -140°C", day: "약 10시간 40분", year: "약 29년", moons: "293개", fact: "위성이 가장 많은 행성이에요." },
  { id: "uranus", name: "천왕성", color: "#8fd0cb", diameter: "51,118km", temp: "구름 위 평균 -195°C", day: "약 17시간", year: "약 84년", moons: "29개", fact: "옆으로 거의 누운 채로 돌아요." },
  { id: "neptune", name: "해왕성", color: "#3d6ea5", diameter: "49,528km", temp: "구름 위 평균 -200°C", day: "약 16시간", year: "약 165년", moons: "16개", fact: "태양계에서 가장 빠른 바람이 불어요." },
  { id: "pluto", name: "명왕성", color: "#d9c7b8", diameter: "2,376km", temp: "평균 -225°C", day: "약 6일 9시간", year: "약 248년", moons: "5개", fact: "2006년부터 왜소행성이에요." },
];
