import { useState, useSyncExternalStore } from "react";
import { Screen } from "../components/Screen";
import { PLANET_CARDS } from "../data/planetCards";
import { QUIZZES } from "../data/quizzes";
import { playTap } from "../lib/audio";
import { getProgress, subscribeProgress } from "../lib/storage";
import type { ScreenId } from "../screenIds";

export function CardsScreen({ open }: { open: (screen: ScreenId, focus?: string) => void }) {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getProgress);
  const [openId, setOpenId] = useState<string | null>(null);
  const unlocked = PLANET_CARDS.filter((card) => progress.stamps.includes(`quiz-${card.id}`)).length;

  return (
    <Screen banner="cards">
      <h1>행성 카드</h1>
      <p className="lede">
        퀴즈를 모두 맞혀 도장을 받으면 카드가 열려요. 모은 카드 {unlocked} / {PLANET_CARDS.length}
      </p>
      <ul className="card-grid">
        {PLANET_CARDS.map((card) => {
          const got = progress.stamps.includes(`quiz-${card.id}`);
          const quiz = QUIZZES.find((item) => item.id === card.id);
          const expanded = openId === card.id;
          return (
            <li key={card.id} className={got ? "planet-card is-on" : "planet-card"}>
              <button
                type="button"
                className="planet-card-head"
                aria-expanded={expanded}
                onClick={() => {
                  playTap();
                  setOpenId(expanded ? null : card.id);
                }}
              >
                <span className="planet-dot" style={{ background: got ? card.color : "#e5e8eb" }} />
                <strong>{card.name}</strong>
              </button>
              {expanded ? (
                got ? (
                  <dl className="planet-facts">
                    <dt>지름</dt>
                    <dd>{card.diameter}</dd>
                    <dt>온도</dt>
                    <dd>{card.temp}</dd>
                    <dt>하루</dt>
                    <dd>{card.day}</dd>
                    <dt>1년</dt>
                    <dd>{card.year}</dd>
                    <dt>위성</dt>
                    <dd>{card.moons}</dd>
                    <dd className="planet-fact">{card.fact}</dd>
                  </dl>
                ) : (
                  <div className="planet-facts">
                    <p className="muted">{quiz ? `${quiz.name} 퀴즈를 모두 맞히면 열려요.` : "퀴즈를 맞히면 열려요."}</p>
                    <button type="button" className="btn btn-quiet" onClick={() => open("quiz")}>
                      퀴즈 풀러 가기
                    </button>
                  </div>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="muted">위성 수는 2026년 10월 NASA 목록 기준이에요. 새 위성이 발견되면 늘어나요.</p>
    </Screen>
  );
}
