import { useState, useSyncExternalStore } from "react";
import { Screen } from "../components/Screen";
import { allStamps } from "../data/quizzes";
import { rewardedSupported, showRewardedAd } from "../lib/ads";
import { playTap } from "../lib/audio";
import { Missions } from "../components/Missions";
import { Expedition } from "../components/Expedition";
import { leaderboardReady, openLeaderboard } from "../lib/leaderboard";
import { canTakeBonusStar, getProgress, subscribeProgress, takeBonusStar } from "../lib/storage";

export function StampsScreen() {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getProgress);
  const [note, setNote] = useState("");
  const stamps = allStamps();
  const got = new Set(progress.stamps);
  const next = stamps.find((stamp) => !got.has(stamp.id) && !stamp.id.startsWith("bonus"));

  async function bonus() {
    playTap();
    setNote("광고를 준비하고 있어요.");
    const earned = await showRewardedAd("weekly-bonus-star");
    if (earned) {
      takeBonusStar();
      setNote("이번 주 보너스 별을 받았어요.");
    } else {
      setNote("광고를 끝까지 보지 않아서 별은 그대로예요.");
    }
  }

  return (
    <Screen banner="stamps">
      <h1>도장판</h1>
      <p className="lede">
        모은 도장 {stamps.filter((stamp) => got.has(stamp.id)).length} / {stamps.length}. 도장은 이 기기에 남아요.
      </p>
      <section className="card">
        <h2>태양계 원정</h2>
        <Expedition stamps={progress.stamps.length} />
        {leaderboardReady() ? (
          <button type="button" className="btn" onClick={() => openLeaderboard()}>
            토스 순위 보기
          </button>
        ) : null}
      </section>
      {next ? (
        <section className="card">
          <p className="label">다음 도장</p>
          <strong>{next.name}</strong>
          <p className="muted">{next.how}</p>
        </section>
      ) : null}
      <ol className="stamp-grid">
        {stamps.map((stamp) => (
          <li key={stamp.id} className={got.has(stamp.id) ? "is-on" : ""}>
            <span className="stamp-mark" aria-hidden="true">
              {stamp.name.slice(0, 1)}
            </span>
            <span className="stamp-name">{stamp.name}</span>
            <span className="sr-only">{got.has(stamp.id) ? "받음" : `아직, ${stamp.how}`}</span>
          </li>
        ))}
      </ol>

      <section className="card">
        <div className="line">
          <h2>이번 주 미션</h2>
          <span className={progress.week.done ? "tag tag-on" : "tag"}>{progress.week.done ? "모두 했어요" : "월요일에 바뀌어요"}</span>
        </div>
        <Missions />
        <p className="muted">미션을 모두 끝낸 주 {progress.weeksDone}번</p>
      </section>

      <section className="card">
        <div className="line">
          <h2>보너스 별</h2>
          <span className="tag tag-on">{progress.bonusStars}개</span>
        </div>
        <p className="muted">한 주에 하나씩 받을 수 있어요. 다섯 개면 도장을 받아요.</p>
        {canTakeBonusStar(progress) && rewardedSupported() ? (
          <button type="button" className="btn btn-primary" onClick={() => void bonus()}>
            광고 보고 이번 주 보너스 별 받기
          </button>
        ) : !canTakeBonusStar(progress) ? (
          <p className="good">이번 주 보너스 별은 받았어요.</p>
        ) : null}
        {note ? <p className="muted">{note}</p> : null}
      </section>
    </Screen>
  );
}
