import { useSyncExternalStore } from "react";
import { CONSTELLATIONS } from "../data/sky";
import { allStamps, dailyQuestion } from "../data/quizzes";
import { altAz, localSiderealDegrees } from "../lib/astro";
import { SEOUL } from "../lib/iss";
import { getProgress, setDailyPick, setSoundOn, subscribeProgress } from "../lib/storage";
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
  const sky = tonight();
  const question = dailyQuestion(new Date());
  const stamps = allStamps();
  const picked = progress.dailyPick;

  return (
    <div className="screen">
      <div className="screen-body">
        <p className="kicker">루멘</p>
        <h1>빛이 머무는 곳을 스쳐 갑니다</h1>
        <p className="lede">지구에서 우주까지, 짧게 둘러보는 놀이예요. 도장과 퀴즈는 이 기기에 저장돼요.</p>

        <section className="card">
          <h2>오늘의 하늘</h2>
          <p>
            오늘 밤 9시 서울에서 가장 높이 뜨는 별자리는 <strong>{sky.constellation.name}</strong>
            {sky.alt > 10 ? "이에요." : "인데, 낮게 걸려 있어요."}
          </p>
          <p className="muted">{sky.constellation.look}</p>
          <button type="button" className="btn btn-primary" onClick={() => open("sky", sky.constellation.id)}>
            오늘 하늘 보기
          </button>
        </section>

        <section className="card">
          <h2>오늘의 문제</h2>
          <p>{question.q}</p>
          {picked === null ? (
            <div className="stack">
              {question.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className="btn"
                  onClick={() => {
                    playTap();
                    setDailyPick(index);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <p className={picked === question.answer ? "good" : "muted"}>
              {picked === question.answer ? "맞았어요." : "아쉬워요."} {question.why} 내일 다른 문제가 나와요.
            </p>
          )}
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
