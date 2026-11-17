import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Screen } from "../components/Screen";
import { QUIZZES, allStamps, reviewQuestions, type QuizSet } from "../data/quizzes";
import { playTap } from "../lib/audio";
import { interstitialDue, preloadInterstitial, rewardedSupported, showPreparedInterstitial, showRewardedAd } from "../lib/ads";
import { awardStamp, bumpWeekly, getProgress, markAnswer, subscribeProgress } from "../lib/storage";

type Phase = "list" | "ask" | "result";
type QuizHistory = { lumen?: string; quiz?: string };

/**
 * 퀴즈 목록 → 문제 → 결과.
 * 문제를 여는 순간 history 에 한 칸을 쌓아서, 토스 뒤로가기로 목록에 돌아옵니다.
 * 전면 광고는 결과를 먼저 보여 준 뒤, 사용자가 다음으로 넘어갈 때 한 번만 나옵니다.
 */
export function QuizScreen() {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getProgress);
  const [quiz, setQuiz] = useState<QuizSet | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<Phase>("list");
  const [adAhead, setAdAhead] = useState(false);
  const [busy, setBusy] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);
  const [hintAt, setHintAt] = useState<number | null>(null);
  const [hintNote, setHintNote] = useState("");
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const onPop = () => {
      const state = history.state as QuizHistory | null;
      if (state?.lumen === "quiz" && !state.quiz) setPhase("list");
    };
    window.addEventListener("popstate", onPop);
    return () => {
      alive.current = false;
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  function startReview(pushHistory: boolean) {
    const picked = reviewQuestions(getProgress().wrong);
    if (picked.length === 0) return;
    start({ id: "review", name: "틀린 문제", badge: "", questions: picked }, pushHistory, picked.map((question) => question.key));
  }

  function start(next: QuizSet, pushHistory: boolean, questionKeys?: string[]) {
    playTap();
    setKeys(questionKeys ?? next.questions.map((_, i) => `${next.id}:${i}`));
    setHintAt(null);
    setHintNote("");
    if (pushHistory) history.pushState({ lumen: "quiz", quiz: next.id } satisfies QuizHistory, "");
    setQuiz(next);
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setPhase("ask");
    setAdAhead(false);
    void preloadInterstitial();
  }

  async function finish(score: number) {
    if (quiz && quiz.id !== "review") {
      if (score === quiz.questions.length) awardStamp(`quiz-${quiz.id}`);
      bumpWeekly("quiz");
    }
    setPhase("result");
    const ready = interstitialDue() && (await preloadInterstitial());
    if (alive.current) setAdAhead(ready);
  }

  /** 결과를 본 뒤 다음으로 넘어갈 때만 광고를 한 번 보여 줍니다. */
  async function leaveResult(then: () => void) {
    playTap();
    if (busy) return;
    if (adAhead) {
      setBusy(true);
      await showPreparedInterstitial("quiz-result");
      if (!alive.current) return;
      setBusy(false);
      setAdAhead(false);
    }
    then();
  }

  async function askHint() {
    playTap();
    setHintNote("광고를 준비하고 있어요.");
    const earned = await showRewardedAd("quiz-hint");
    if (!alive.current) return;
    if (earned) {
      setHintAt(index);
      setHintNote("틀린 답 하나를 지웠어요.");
    } else {
      setHintNote("광고를 끝까지 보지 않아서 힌트는 그대로예요.");
    }
  }

  const question = quiz?.questions[index];
  const stamps = allStamps();

  return (
    <Screen banner={phase === "list" ? "quiz-list" : false}>
      <h1>퀴즈와 도장</h1>
      {phase === "list" ? (
        <>
          <p className="lede">문제를 모두 맞히면 도장을 받아요. 도장은 이 기기에 남아요.</p>
          <div className="stack">
            {progress.wrong.length > 0 ? (
              <button type="button" className="menu-item" onClick={() => startReview(true)}>
                <strong>틀린 문제 다시 풀기</strong>
                <span>{Math.min(5, progress.wrong.length)}문제 · 다시 맞히면 목록에서 빠져요</span>
              </button>
            ) : null}
            {QUIZZES.map((item) => {
              const got = progress.stamps.includes(`quiz-${item.id}`);
              return (
                <button key={item.id} type="button" className="menu-item" onClick={() => start(item, true)}>
                  <strong>{item.name}</strong>
                  <span>
                    {item.questions.length}문제 · {got ? "도장 받음" : "퀴즈 풀기"}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="muted">
            내 도장 {progress.stamps.length} / {stamps.length} · 첫 화면의 도장판에서 모두 볼 수 있어요.
          </p>
        </>
      ) : null}
      {phase === "ask" && quiz && question ? (
        <section className="card">
          <p className="label">
            {quiz.name} · {index + 1} / {quiz.questions.length}
          </p>
          <h2>{question.q}</h2>
          <div className="stack">
            {question.options.map((option, optionIndex) =>
              hintAt === index && optionIndex === question.options.findIndex((_, i) => i !== question.answer) ? null : (
              <button
                key={option}
                type="button"
                className="btn"
                aria-pressed={picked === optionIndex}
                disabled={picked !== null}
                onClick={() => {
                  playTap();
                  setPicked(optionIndex);
                  const right = optionIndex === question.answer;
                  if (right) setCorrect((value) => value + 1);
                  const key = keys[index];
                  if (key) markAnswer(key, right);
                  if (right && quiz.id === "review") bumpWeekly("review");
                }}
              >
                {option}
              </button>
              ),
            )}
          </div>
          {picked === null && hintAt === null && rewardedSupported() ? (
            <button type="button" className="btn btn-quiet" onClick={() => void askHint()}>
              광고 보고 힌트 받기 (한 퀴즈에 한 번)
            </button>
          ) : null}
          {hintNote ? <p className="muted">{hintNote}</p> : null}
          {picked !== null ? (
            <>
              <p className={picked === question.answer ? "good" : "muted"}>
                {picked === question.answer ? "맞았어요!" : `아쉬워요! 답은 ${question.options[question.answer]}.`} {question.why}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  playTap();
                  if (index + 1 >= quiz.questions.length) void finish(correct);
                  else {
                    setIndex((value) => value + 1);
                    setPicked(null);
                    setHintNote("");
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
          {quiz.id === "review" ? (
            <p className="muted">맞힌 문제는 틀린 문제 목록에서 빠졌어요.</p>
          ) : correct === quiz.questions.length ? (
            <p className="good">모두 정답! {quiz.badge} 도장을 받았어요.</p>
          ) : (
            <p className="muted">모두 맞히면 도장을 받아요. 다시 해 볼까요?</p>
          )}
          {adAhead ? <p className="label">다음 화면으로 넘어갈 때 짧은 광고가 한 번 나와요.</p> : null}
          <div className="actions">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void leaveResult(() => history.back())}>
              다른 퀴즈 보기
            </button>
            <button type="button" className="btn" disabled={busy} onClick={() => void leaveResult(() => (quiz.id === "review" ? startReview(false) : start(quiz, false)))}>
              다시 풀기
            </button>
          </div>
        </section>
      ) : null}
    </Screen>
  );
}
