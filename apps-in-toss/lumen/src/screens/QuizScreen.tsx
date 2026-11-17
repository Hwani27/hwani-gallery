import { useEffect, useRef, useState } from "react";
import { Screen } from "../components/Screen";
import { QUIZZES, allStamps, type QuizSet } from "../data/quizzes";
import { playTap } from "../lib/audio";
import { preloadInterstitial, showPreparedInterstitial } from "../lib/ads";
import { awardStamp, getProgress, subscribeProgress } from "../lib/storage";
import { useSyncExternalStore } from "react";

type Phase = "list" | "ask" | "notice" | "result";

export function QuizScreen({ onMenu }: { onMenu: () => void }) {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getProgress);
  const [quiz, setQuiz] = useState<QuizSet | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<Phase>("list");
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  function openQuiz(next: QuizSet) {
    playTap();
    setQuiz(next);
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setPhase("ask");
    void preloadInterstitial();
  }

  async function finish(score: number) {
    if (quiz && score === quiz.questions.length) awardStamp(`quiz-${quiz.id}`);
    const ready = await preloadInterstitial();
    if (!alive.current) return;
    if (!ready) {
      setPhase("result");
      return;
    }
    setPhase("notice");
    window.setTimeout(() => {
      if (!alive.current) return;
      void showPreparedInterstitial().finally(() => {
        if (alive.current) setPhase("result");
      });
    }, 1400);
  }

  const question = quiz?.questions[index];
  const stamps = allStamps();

  return (
    <Screen onMenu={phase === "list" ? onMenu : undefined} banner={phase === "list"}>
      <h1>퀴즈와 도장</h1>
      {phase === "list" ? (
        <>
          <p className="lede">문제를 모두 맞히면 도장을 받아요. 도장은 이 기기에 남아요.</p>
          <div className="stack">
            {QUIZZES.map((item) => {
              const got = progress.stamps.includes(`quiz-${item.id}`);
              return (
                <button key={item.id} type="button" className="menu-item" onClick={() => openQuiz(item)}>
                  <strong>{item.name}</strong>
                  <span>{got ? "도장 받음" : "퀴즈 풀기"}</span>
                </button>
              );
            })}
          </div>
          <p className="muted">
            내 도장 {progress.stamps.length} / {stamps.length}
          </p>
          <ul className="list plain">
            {stamps.map((stamp) => {
              const got = progress.stamps.includes(stamp.id);
              return (
                <li key={stamp.id}>
                  <strong>{stamp.name}</strong>
                  <p className="muted">{got ? "받았어요" : stamp.how}</p>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      {phase === "notice" ? <p className="card">문제가 끝났어요. 결과를 보기 전에 짧은 광고가 나와요.</p> : null}
      {phase === "ask" && quiz && question ? (
        <section className="card">
          <p className="label">
            {quiz.name} · {index + 1} / {quiz.questions.length}
          </p>
          <h2>{question.q}</h2>
          <div className="stack">
            {question.options.map((option, optionIndex) => (
              <button
                key={option}
                type="button"
                className="btn"
                aria-pressed={picked === optionIndex}
                disabled={picked !== null}
                onClick={() => {
                  playTap();
                  setPicked(optionIndex);
                  if (optionIndex === question.answer) setCorrect((value) => value + 1);
                }}
              >
                {option}
              </button>
            ))}
          </div>
          {picked !== null ? (
            <>
              <p className={picked === question.answer ? "good" : "muted"}>{picked === question.answer ? "맞았어요!" : "아쉬워요!"} {question.why}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  playTap();
                  if (index + 1 >= quiz.questions.length) void finish(correct);
                  else {
                    setIndex((value) => value + 1);
                    setPicked(null);
                  }
                }}
              >
                {index + 1 >= quiz.questions.length ? "결과 보기" : "다음 문제"}
              </button>
            </>
          ) : null}
        </section>
      ) : null}
      {phase === "result" && quiz ? (
        <section className="card">
          <h2>결과</h2>
          <p>
            {quiz.questions.length}문제 중 {correct}개 맞혔어요.
          </p>
          {correct === quiz.questions.length ? (
            <p className="good">모두 정답! 도장을 받았어요.</p>
          ) : (
            <p className="muted">다시 하면 도장을 받을 수 있어요.</p>
          )}
          <button type="button" className="btn btn-primary" onClick={() => openQuiz(quiz)}>
            다시 풀기
          </button>
        </section>
      ) : null}
      {phase !== "list" ? (
        <div className="actions">
          <button type="button" className="btn" onClick={() => setPhase("list")}>
            목록
          </button>
          <button type="button" className="btn" onClick={onMenu}>
            메뉴
          </button>
        </div>
      ) : null}
    </Screen>
  );
}
