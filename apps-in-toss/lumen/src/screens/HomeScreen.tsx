import { useEffect, useState, useSyncExternalStore } from "react";
import { CONSTELLATION_META as CONSTELLATIONS } from "../data/constellations";
import { allStamps, dailyQuestion } from "../data/quizzes";
import { altAz, localSiderealDegrees } from "../lib/astro";
import { SEOUL } from "../lib/iss";
import { getProgress, openDailyHint, recordVisit, setDailyPick, setSoundOn, streakOf, subscribeProgress } from "../lib/storage";
import { rewardedSupported, showRewardedAd } from "../lib/ads";
import { addDays, josa, localDateKey } from "../lib/format";
import { moonPhase } from "../lib/moon";
import { playTap } from "../lib/audio";
import { BannerSlot } from "../components/BannerSlot";
import type { ScreenId } from "../screenIds";

function tonight() {
  const at = new Date();
  at.setHours(21, 0, 0, 0);
  const lst = localSiderealDegrees(at, SEOUL.lon);
  let best = CONSTELLATIONS[0];
  let bestAlt = -90;
  for (const constellation of CONSTELLATIONS) {
    const { alt } = altAz(constellation.center[0], constellation.center[1], SEOUL.lat, lst);
    if (alt > bestAlt) {
      best = constellation;
      bestAlt = alt;
    }
  }
  return { constellation: best, alt: bestAlt };
}

export function HomeScreen({ open }: { open: (screen: ScreenId, focus?: string) => void }) {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getProgress);
  const [hintNote, setHintNote] = useState("");
  useEffect(() => {
    recordVisit();
    // 자정을 넘겨 다시 앱으로 돌아왔을 때도 새 날로 셉니다.
    const onVisible = () => {
      if (!document.hidden) recordVisit();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const today = localDateKey();
  const sky = tonight();
  const moon = moonPhase(new Date(new Date().setHours(21, 0, 0, 0)));
  const question = dailyQuestion(new Date());
  const stamps = allStamps();
  const picked = progress.dailyPick;
  const streak = streakOf(progress.visits, today);
  const week = Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
  const nextGoal = streak < 3 ? 3 : streak < 7 ? 7 : streak < 30 ? 30 : 0;
  const hinted = progress.dailyHintDate === today;
  const hiddenOption = hinted ? question.options.findIndex((_, index) => index !== question.answer) : -1;

  async function askHint() {
    playTap();
    setHintNote("광고를 준비하고 있어요.");
    const earned = await showRewardedAd();
    if (earned) {
      openDailyHint();
      setHintNote("틀린 답 하나를 지웠어요.");
    } else {
      setHintNote("광고를 끝까지 보지 않아서 힌트는 그대로예요.");
    }
  }

  return (
    <div className="screen">
      <div className="screen-body">
        <p className="kicker">루멘</p>
        <h1>빛이 머무는 곳을 스쳐 갑니다</h1>
        <p className="lede">지구에서 우주까지, 짧게 둘러보는 놀이예요. 도장과 퀴즈는 이 기기에 저장돼요.</p>

        <section className="card">
          <div className="line">
            <h2>연속 방문</h2>
            <span className="tag tag-on">{streak}일째</span>
          </div>
          <ol className="week" aria-label="최근 7일 방문">
            {week.map((day) => (
              <li key={day} className={progress.visits.includes(day) ? "is-on" : ""}>
                <span>{Number(day.slice(8))}</span>
              </li>
            ))}
          </ol>
          <p className="muted">
            {nextGoal > 0
              ? `${nextGoal}일 연속으로 들어오면 도장을 받아요. ${nextGoal - streak}일 남았어요.`
              : "한 달 연속 도장까지 모두 받았어요."}
          </p>
        </section>

        <section className="card">
          <h2>오늘의 하늘</h2>
          <p>
            오늘 밤 9시 서울에서 가장 높이 뜨는 별자리는 <strong>{sky.constellation.name}</strong>
            {sky.alt > 10 ? (josa(sky.constellation.name, "이가").endsWith("이") ? "이에요." : "예요.") : "인데, 낮게 걸려 있어요."}
          </p>
          <p className="muted">{sky.constellation.find}</p>
          <p>
            오늘 밤 달은 <strong>{moon.name}</strong>, 밝은 부분이 약 {Math.round(moon.lit * 100)}%예요.
          </p>
          <p className="muted">{moon.line}</p>
          <button type="button" className="btn btn-primary" onClick={() => open("sky", sky.constellation.id)}>
            오늘 하늘 보기
          </button>
        </section>

        <section className="card">
          <h2>오늘의 문제</h2>
          <p>{question.q}</p>
          {picked === null ? (
            <div className="stack">
              {question.options.map((option, index) =>
                index === hiddenOption ? null : (
                  <button
                    key={option}
                    type="button"
                    className="btn"
                    onClick={() => {
                      playTap();
                      setDailyPick(index, index === question.answer);
                    }}
                  >
                    {option}
                  </button>
                ),
              )}
              {!hinted && rewardedSupported() ? (
                <button type="button" className="btn btn-quiet" onClick={() => void askHint()}>
                  광고 보고 힌트 받기
                </button>
              ) : null}
              {hintNote ? <p className="muted">{hintNote}</p> : null}
            </div>
          ) : (
            <p className={picked === question.answer ? "good" : "muted"}>
              {picked === question.answer ? "맞았어요." : `아쉬워요. 답은 ${josa(question.options[question.answer], "이가")} 맞아요.`} {question.why} 내일 다른 문제가 나와요.
            </p>
          )}
          <p className="label">오늘의 문제를 맞힌 날 {progress.dailyCorrect}일 · 10일이면 도장</p>
        </section>

        <ul className="menu">
          {(
            [
              ["journey", "지구에서 우주로", "행성을 돌려 봐요"],
              ["weight", "행성 체중계", "다른 별에서 내 몸무게는?"],
              ["race", "빛이랑 경주", "빛은 얼마나 빠를까?"],
              ["iss", "우주정거장", "지금 어디 있을까?"],
              ["sky", "서울 밤하늘", "별자리를 찾아요"],
              ["quiz", "퀴즈와 도장", "다녀온 곳 퀴즈"],
              ["size", "크기 장난감", "지구가 축구공이라면"],
            ] as const
          ).map(([id, title, line]) => (
            <li key={id}>
              <button type="button" className="menu-item" onClick={() => open(id)}>
                <strong>{title}</strong>
                <span>{line}</span>
              </button>
            </li>
          ))}
        </ul>

        <section className="card row-card">
          <div>
            <h2>소리</h2>
            <p className="muted">버튼을 누를 때, 경주할 때 작은 소리가 나요. 앱을 내리면 멈춰요.</p>
          </div>
          <button
            type="button"
            className="btn"
            aria-pressed={progress.soundOn}
            onClick={() => {
              setSoundOn(!progress.soundOn);
              playTap();
            }}
          >
            {progress.soundOn ? "켜짐" : "꺼짐"}
          </button>
        </section>

        <p className="muted">
          도장 {progress.stamps.length} / {stamps.length}
        </p>
      </div>
      <BannerSlot />
    </div>
  );
}
