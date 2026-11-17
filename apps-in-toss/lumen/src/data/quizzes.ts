import { dayNumber } from "../lib/format";

export type QuizQuestion = {
  q: string;
  options: readonly string[];
  answer: number;
  why: string;
};

export type QuizSet = {
  id: string;
  name: string;
  badge: string;
  questions: readonly QuizQuestion[];
};

export const QUIZZES: readonly QuizSet[] = [
  {
    id: "sun",
    name: "태양",
    badge: "태양 탐험가",
    questions: [
      { q: "태양은 무엇일까요?", options: ["별", "행성", "달"], answer: 0, why: "태양은 스스로 빛나는 별이에요." },
      { q: "태양 빛이 지구에 오려면 얼마나 걸릴까요?", options: ["약 1초", "약 8분", "약 하루"], answer: 1, why: "평균 8분 20초쯤 걸려요." },
      { q: "태양 안에 지구가 몇 개쯤 들어갈까요?", options: ["약 10개", "약 1,000개", "약 130만 개"], answer: 2, why: "지구가 약 130만 개 들어갈 만큼 커요." },
    ],
  },
  {
    id: "mercury",
    name: "수성",
    badge: "수성 탐험가",
    questions: [
      { q: "태양에 가장 가까운 행성은?", options: ["수성", "금성", "화성"], answer: 0, why: "수성이 제일 안쪽에 있어요." },
      { q: "수성의 1년은 며칠쯤일까요?", options: ["약 88일", "약 365일", "약 10년"], answer: 0, why: "태양을 빨리 돌아서 1년이 짧아요." },
      { q: "수성에는 달이 몇 개 있을까요?", options: ["0개", "1개", "2개"], answer: 0, why: "수성은 달이 없어요." },
    ],
  },
  {
    id: "venus",
    name: "금성",
    badge: "금성 탐험가",
    questions: [
      { q: "태양계에서 가장 뜨거운 행성은?", options: ["수성", "금성", "목성"], answer: 1, why: "두꺼운 이산화탄소 대기가 열을 가둬서 평균 약 464도예요." },
      { q: "금성에서는 해가 어디서 뜰까요?", options: ["동쪽", "서쪽", "안 떠요"], answer: 1, why: "금성은 거꾸로 돌아서 서쪽에서 떠요." },
      { q: "금성이 제자리에서 한 바퀴 도는 시간은 1년보다 어떤가요?", options: ["길어요", "짧아요", "똑같아요"], answer: 0, why: "한 바퀴 자전하는 데 243일, 1년은 225일이에요." },
    ],
  },
  {
    id: "earth",
    name: "지구",
    badge: "지구 탐험가",
    questions: [
      { q: "지구 겉면은 무엇이 더 많을까요?", options: ["땅", "바다", "똑같아요"], answer: 1, why: "약 71%가 물로 덮여 있고, 그 물은 대부분 바다예요." },
      { q: "지구의 달은 몇 개?", options: ["1개", "2개", "없어요"], answer: 0, why: "우리 달 하나예요." },
      { q: "지구가 태양을 한 바퀴 도는 데 걸리는 시간은?", options: ["하루", "한 달", "1년"], answer: 2, why: "약 365일, 그게 1년이에요." },
    ],
  },
  {
    id: "moon",
    name: "달",
    badge: "달 탐험가",
    questions: [
      { q: "사람이 처음 달에 간 해는?", options: ["1969년", "1999년", "2020년"], answer: 0, why: "아폴로 11호가 1969년에 갔어요." },
      { q: "달에서 내 몸무게는?", options: ["더 무거워요", "약 6분의 1", "똑같아요"], answer: 1, why: "달은 끌어당기는 힘이 약해요." },
      { q: "달이 지구를 한 바퀴 도는 데 걸리는 시간은?", options: ["약 하루", "약 한 달", "약 1년"], answer: 1, why: "약 27.3일에 한 바퀴 돌아요. 보름달에서 다음 보름달까지는 약 29.5일이에요." },
    ],
  },
  {
    id: "mars",
    name: "화성",
    badge: "화성 탐험가",
    questions: [
      { q: "화성은 왜 붉을까요?", options: ["불이 나서", "흙에 녹슨 쇠가 있어서", "페인트를 칠해서"], answer: 1, why: "흙과 먼지에 녹슨 철(산화철)이 많아서 붉어요." },
      { q: "화성의 달은 몇 개?", options: ["0개", "2개", "10개"], answer: 1, why: "포보스와 데이모스예요." },
      { q: "태양계에서 가장 큰 화산이 있는 곳은?", options: ["지구", "화성", "달"], answer: 1, why: "화성의 올림푸스 화산이에요." },
    ],
  },
  {
    id: "jupiter",
    name: "목성",
    badge: "목성 탐험가",
    questions: [
      { q: "태양계에서 가장 큰 행성은?", options: ["토성", "목성", "지구"], answer: 1, why: "목성이 제일 커요." },
      { q: "목성의 대적점은 무엇일까요?", options: ["커다란 폭풍", "바다", "구멍"], answer: 0, why: "지구가 쏙 들어갈 만큼 큰 소용돌이 폭풍이에요." },
      { q: "목성의 하루는 몇 시간쯤?", options: ["약 10시간", "약 24시간", "약 100시간"], answer: 0, why: "약 10시간에 한 바퀴, 태양계에서 가장 빨리 돌아요." },
    ],
  },
  {
    id: "saturn",
    name: "토성",
    badge: "토성 탐험가",
    questions: [
      { q: "토성 고리는 무엇으로 되어 있을까요?", options: ["얼음과 돌 조각", "금속 판", "구름"], answer: 0, why: "작은 얼음과 돌이 아주 많이 모였어요." },
      { q: "토성의 가장 큰 달은?", options: ["타이탄", "포보스", "유로파"], answer: 0, why: "타이탄은 수성보다 크고, 두꺼운 대기가 있어요." },
      { q: "토성을 큰 물통에 넣으면?", options: ["가라앉아요", "뜰 만큼 가벼워요", "녹아요"], answer: 1, why: "토성의 평균 밀도는 물보다 작아요. 그만큼 큰 물통은 없지만요." },
    ],
  },
  {
    id: "uranus",
    name: "천왕성",
    badge: "천왕성 탐험가",
    questions: [
      { q: "천왕성은 어떻게 돌까요?", options: ["옆으로 누워서", "똑바로 서서", "안 돌아요"], answer: 0, why: "거의 98도 누워 있어요." },
      { q: "천왕성은 무슨 색?", options: ["빨강", "청록", "노랑"], answer: 1, why: "대기 속 메테인이 붉은빛을 흡수해서 청록색으로 보여요." },
      { q: "천왕성 가까이 가 본 탐사선은?", options: ["보이저 2호", "아폴로 11호", "허블"], answer: 0, why: "1986년에 지나갔고, 지금까지 유일하게 가까이 간 탐사선이에요." },
    ],
  },
  {
    id: "neptune",
    name: "해왕성",
    badge: "해왕성 탐험가",
    questions: [
      { q: "태양에서 가장 먼 행성은?", options: ["천왕성", "해왕성", "토성"], answer: 1, why: "여덟 행성 중 가장 멀어요." },
      { q: "해왕성의 1년은?", options: ["약 1년", "약 12년", "약 165년"], answer: 2, why: "태양을 한 바퀴 도는 데 약 165년이 걸려요." },
      { q: "해왕성의 바람은?", options: ["태양계에서 가장 빨라요", "바람이 없어요", "산들바람이에요"], answer: 0, why: "시속 2,000km가 넘는 바람이 불어요. 지구에서 가장 센 바람보다 다섯 배쯤 빨라요." },
    ],
  },
  {
    id: "pluto",
    name: "명왕성",
    badge: "명왕성 탐험가",
    questions: [
      { q: "명왕성은 지금 무엇이라고 부를까요?", options: ["왜소행성", "별", "혜성"], answer: 0, why: "2006년부터 왜소행성이에요." },
      { q: "명왕성에 가 본 탐사선은?", options: ["뉴호라이즌스", "보이저 1호", "아폴로"], answer: 0, why: "2015년에 가까이 지나갔어요." },
      { q: "명왕성의 하트 모양은 무엇일까요?", options: ["얼음 평원", "바다", "숲"], answer: 0, why: "질소가 꽁꽁 언 넓은 얼음 들판이에요." },
    ],
  },
  {
    id: "stars",
    name: "별자리",
    badge: "별자리 탐험가",
    questions: [
      { q: "북극성을 찾을 때 길잡이가 되는 별들은?", options: ["오리온자리 허리띠", "북두칠성", "전갈자리 꼬리"], answer: 1, why: "국자 끝 두 별 사이를 다섯 번쯤 이어 가면 북극성이 나와요." },
      { q: "밤하늘에서 가장 밝은 별은?", options: ["북극성", "베가", "시리우스"], answer: 2, why: "큰개자리 시리우스예요. 북극성은 생각보다 밝지 않아요." },
      { q: "견우와 직녀 이야기에서 직녀별은 어느 별자리에 있을까요?", options: ["거문고자리", "독수리자리", "사자자리"], answer: 0, why: "거문고자리 베가가 직녀, 독수리자리 알타이르가 견우예요." },
      { q: "허리띠 별 세 개가 나란한 겨울 별자리는?", options: ["카시오페이아자리", "오리온자리", "백조자리"], answer: 1, why: "오리온자리 가운데 세 별이 사냥꾼의 허리띠예요." },
      { q: "서울에서 북극성은 땅에서 얼마나 높이 보일까요?", options: ["약 10도", "약 37도", "약 90도"], answer: 1, why: "북극성 높이는 그곳의 위도와 거의 같아요. 서울은 북위 약 37.5도예요." },
    ],
  },
  {
    id: "light",
    name: "빛과 거리",
    badge: "빛의 탐험가",
    questions: [
      { q: "빛은 1초에 얼마나 갈까요?", options: ["약 300km", "약 3만 km", "약 30만 km"], answer: 2, why: "1초에 지구를 일곱 바퀴 반 도는 거리예요." },
      { q: "달에서 출발한 빛이 지구에 닿는 시간은?", options: ["약 1.3초", "약 8분", "약 1시간"], answer: 0, why: "달은 약 38만 km 떨어져 있어서 1초 조금 넘게 걸려요." },
      { q: "1광년은 무엇일까요?", options: ["1년이라는 시간", "빛이 1년 동안 가는 거리", "별의 밝기"], answer: 1, why: "시간이 아니라 거리예요. 약 9조 4,600억 km예요." },
      { q: "사람이 만든 것 중 지구에서 가장 멀리 간 것은?", options: ["국제우주정거장", "허블 우주망원경", "보이저 1호"], answer: 2, why: "2026년 11월 18일, 지구에서 빛으로 하루 거리에 처음 닿았어요." },
      { q: "국제우주정거장은 지구를 한 바퀴 도는 데 얼마나 걸릴까요?", options: ["약 90분", "약 하루", "약 한 달"], answer: 0, why: "하루에 지구를 약 16바퀴 돌아요." },
    ],
  },
];
export const STAMP_EXTRAS = [
  { id: "light", name: "빛의 친구", how: "빛이랑 경주를 끝까지 해요" },
  { id: "iss", name: "우주정거장 관측자", how: "우주정거장을 찾아요" },
  { id: "sky", name: "별자리 탐정", how: "별자리 세 개를 찾아요" },
  { id: "weight", name: "우주 저울", how: "체중계로 몸무게를 재 봐요" },
  { id: "size", name: "꼬마 측량사", how: "크기 장난감을 살펴봐요" },
  { id: "streak-3", name: "사흘 연속", how: "사흘 연속 들어와요" },
  { id: "streak-7", name: "일주일 연속", how: "7일 연속 들어와요" },
  { id: "streak-30", name: "한 달 연속", how: "30일 연속 들어와요" },
  { id: "daily-10", name: "오늘의 문제 열 번", how: "오늘의 문제를 10번 맞혀요" },
  { id: "weekly-1", name: "첫 주간 미션", how: "한 주의 미션 세 가지를 모두 해요" },
  { id: "weekly-4", name: "주간 미션 네 번", how: "주간 미션을 네 주 모두 해요" },
] as const;

export const BONUS_STAMP = { id: "bonus", name: "보너스 측량", how: "크기 장난감에서 광고를 보고 별까지 비교해요" };
export const BONUS_STAR_STAMP = { id: "bonus-5", name: "보너스 별 다섯 개", how: "도장판에서 광고를 보고 보너스 별을 다섯 번 받아요" };

export function allStamps(): { id: string; name: string; how: string }[] {
  return [
    ...QUIZZES.map((quiz) => ({ id: `quiz-${quiz.id}`, name: quiz.badge, how: `${quiz.name} 퀴즈를 모두 맞혀요` })),
    ...STAMP_EXTRAS,
    BONUS_STAMP,
    BONUS_STAR_STAMP,
  ];
}

export type FlatQuestion = QuizQuestion & { quizId: string; quizName: string; key: string };

export function allQuestions(): FlatQuestion[] {
  return QUIZZES.flatMap((quiz) =>
    quiz.questions.map((question, index) => ({ ...question, quizId: quiz.id, quizName: quiz.name, key: `${quiz.id}:${index}` })),
  );
}

/** 틀린 문제 중 최근 것부터 최대 count 개. */
export function reviewQuestions(keys: readonly string[], count = 5): FlatQuestion[] {
  const pool = new Map(allQuestions().map((question) => [question.key, question]));
  return [...keys].reverse().map((key) => pool.get(key)).filter((item): item is FlatQuestion => Boolean(item)).slice(0, count);
}

/** 날마다 다른 문제. 연속된 날에 같은 행성 문제가 이어지지 않게 17칸씩 건너뜁니다. */
export function dailyQuestion(date: Date): FlatQuestion {
  const pool = allQuestions();
  const index = (((dayNumber(date) * 17) % pool.length) + pool.length) % pool.length;
  return pool[index];
}
