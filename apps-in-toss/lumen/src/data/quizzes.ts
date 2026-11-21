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
      { q: "태양 안에 지구가 몇 개쯤 들어갈까요?", options: ["약 10개", "약 1,000개", "약 130만 개"], answer: 2, why: "태양은 정말 정말 커요." },
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
      { q: "태양계에서 가장 뜨거운 행성은?", options: ["수성", "금성", "목성"], answer: 1, why: "두꺼운 구름이 열을 가둬요. 약 464도예요." },
      { q: "금성에서는 해가 어디서 뜰까요?", options: ["동쪽", "서쪽", "안 떠요"], answer: 1, why: "금성은 거꾸로 돌아서 서쪽에서 떠요." },
      { q: "금성이 제자리에서 한 바퀴 도는 시간은 1년보다 어떤가요?", options: ["길어요", "짧아요", "똑같아요"], answer: 0, why: "한 바퀴 자전하는 데 243일, 1년은 225일이에요." },
    ],
  },
  {
    id: "earth",
    name: "지구",
    badge: "지구 탐험가",
    questions: [
      { q: "지구 겉면은 무엇이 더 많을까요?", options: ["땅", "바다", "똑같아요"], answer: 1, why: "약 70%가 바다예요." },
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
      { q: "달이 지구를 한 바퀴 도는 데 걸리는 시간은?", options: ["약 하루", "약 한 달", "약 1년"], answer: 1, why: "약 27일이에요." },
    ],
  },
  {
    id: "mars",
    name: "화성",
    badge: "화성 탐험가",
    questions: [
      { q: "화성은 왜 붉을까요?", options: ["불이 나서", "흙에 녹슨 쇠가 있어서", "페인트를 칠해서"], answer: 1, why: "녹슨 철 가루 때문에 붉어요." },
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
      { q: "목성의 대적점은 무엇일까요?", options: ["커다란 폭풍", "바다", "구멍"], answer: 0, why: "지구보다 큰 소용돌이 폭풍이에요." },
      { q: "목성의 하루는 몇 시간쯤?", options: ["약 10시간", "약 24시간", "약 100시간"], answer: 0, why: "아주 빨리 돌아요." },
    ],
  },
  {
    id: "saturn",
    name: "토성",
    badge: "토성 탐험가",
    questions: [
      { q: "토성 고리는 무엇으로 되어 있을까요?", options: ["얼음과 돌 조각", "금속 판", "구름"], answer: 0, why: "작은 얼음과 돌이 아주 많이 모였어요." },
      { q: "토성의 가장 큰 달은?", options: ["타이탄", "포보스", "유로파"], answer: 0, why: "타이탄은 두꺼운 대기가 있어요." },
      { q: "토성을 큰 물통에 넣으면?", options: ["가라앉아요", "뜰 만큼 가벼워요", "녹아요"], answer: 1, why: "평균으로 물보다 가벼워요." },
    ],
  },
  {
    id: "uranus",
    name: "천왕성",
    badge: "천왕성 탐험가",
    questions: [
      { q: "천왕성은 어떻게 돌까요?", options: ["옆으로 누워서", "똑바로 서서", "안 돌아요"], answer: 0, why: "거의 98도 누워 있어요." },
      { q: "천왕성은 무슨 색?", options: ["빨강", "청록", "노랑"], answer: 1, why: "메테인 가스 때문에 청록색이에요." },
      { q: "천왕성 가까이 가 본 탐사선은?", options: ["보이저 2호", "아폴로 11호", "허블"], answer: 0, why: "1986년에 지나갔어요." },
    ],
  },
  {
    id: "neptune",
    name: "해왕성",
    badge: "해왕성 탐험가",
    questions: [
      { q: "태양에서 가장 먼 행성은?", options: ["천왕성", "해왕성", "토성"], answer: 1, why: "여덟 행성 중 가장 멀어요." },
      { q: "해왕성의 1년은?", options: ["약 1년", "약 12년", "약 164년"], answer: 2, why: "태양을 한 바퀴 도는 데 아주 오래 걸려요." },
      { q: "해왕성의 바람은?", options: ["태양계에서 가장 빨라요", "바람이 없어요", "산들바람이에요"], answer: 0, why: "엄청 빠른 바람이 불어요." },
    ],
  },
  {
    id: "pluto",
    name: "명왕성",
    badge: "명왕성 탐험가",
    questions: [
      { q: "명왕성은 지금 무엇이라고 부를까요?", options: ["왜소행성", "별", "혜성"], answer: 0, why: "2006년부터 왜소행성이에요." },
      { q: "명왕성에 가 본 탐사선은?", options: ["뉴호라이즌스", "보이저 1호", "아폴로"], answer: 0, why: "2015년에 가까이 지나갔어요." },
      { q: "명왕성의 하트 모양은 무엇일까요?", options: ["얼음 평원", "바다", "숲"], answer: 0, why: "꽁꽁 언 넓은 얼음 들판이에요." },
    ],
  },
];

export const STAMP_EXTRAS = [
  { id: "light", name: "빛의 친구", how: "빛이랑 경주를 끝까지 해요" },
  { id: "iss", name: "우주정거장 관측자", how: "우주정거장을 찾아요" },
  { id: "sky", name: "별자리 탐정", how: "별자리 세 개를 찾아요" },
  { id: "weight", name: "우주 저울", how: "체중계로 몸무게를 재 봐요" },
  { id: "size", name: "꼬마 측량사", how: "크기 장난감을 살펴봐요" },
] as const;

export const BONUS_STAMP = { id: "bonus", name: "보너스 측량", how: "광고를 보고 별까지 비교해요" };

export function allStamps(): { id: string; name: string; how: string }[] {
  return [
    ...QUIZZES.map((quiz) => ({ id: `quiz-${quiz.id}`, name: quiz.badge, how: `${quiz.name} 퀴즈를 모두 맞혀요` })),
    ...STAMP_EXTRAS,
    BONUS_STAMP,
  ];
}

export type FlatQuestion = QuizQuestion & { quizId: string; quizName: string };

export function allQuestions(): FlatQuestion[] {
  return QUIZZES.flatMap((quiz) => quiz.questions.map((question) => ({ ...question, quizId: quiz.id, quizName: quiz.name })));
}

export function dailyQuestion(date: Date): FlatQuestion {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86_400_000);
  const pool = allQuestions();
  return pool[day % pool.length];
}
