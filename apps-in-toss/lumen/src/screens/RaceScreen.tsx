import { useEffect, useRef, useState } from "react";
import { Screen } from "../components/Screen";
import { RACE_SPEEDS, RACE_TARGETS, defaultRaceSpeed } from "../data/planets";
import { playTap, setHumWanted } from "../lib/audio";
import { interstitialDue, preloadInterstitial, showPreparedInterstitial } from "../lib/ads";
import { formatDuration, formatSpeed } from "../lib/format";
import { awardStamp, bumpWeekly } from "../lib/storage";

type Phase = "run" | "result";

export function RaceScreen() {
  const [targetId, setTargetId] = useState("earth");
  const [speed, setSpeed] = useState(defaultRaceSpeed("earth"));
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("run");
  const [adAhead, setAdAhead] = useState(false);
  const [busy, setBusy] = useState(false);
  const secondsRef = useRef(0);
  const alive = useRef(true);

  const target = RACE_TARGETS.find((item) => item.id === targetId) ?? RACE_TARGETS[2];
  const done = seconds >= target.seconds;

  useEffect(() => {
    alive.current = true;
    void preloadInterstitial();
    return () => {
      alive.current = false;
      setHumWanted(false);
    };
  }, []);

  useEffect(() => {
    setHumWanted(running && phase === "run");
    return () => setHumWanted(false);
  }, [running, phase]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      secondsRef.current = Math.min(target.seconds, secondsRef.current + dt * speed);
      setSeconds(secondsRef.current);
      if (secondsRef.current >= target.seconds) {
        setRunning(false);
        awardStamp("light");
        bumpWeekly("race");
        void finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // finish is stable enough for this effect; target and speed restart the race clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, speed, target.seconds]);

  /** 결과를 먼저 보여 주고, 광고는 사용자가 다시 할 때 한 번만 나옵니다. */
  async function finish() {
    setPhase("result");
    const ready = interstitialDue() && (await preloadInterstitial());
    if (alive.current) setAdAhead(ready);
  }

  async function again() {
    playTap();
    if (busy) return;
    if (adAhead) {
      setBusy(true);
      await showPreparedInterstitial("race-result");
      if (!alive.current) return;
      setBusy(false);
      setAdAhead(false);
    }
    reset();
    void preloadInterstitial();
  }

  function reset(nextTarget = targetId, nextSpeed = speed) {
    secondsRef.current = 0;
    setSeconds(0);
    setRunning(false);
    setPhase("run");
    setTargetId(nextTarget);
    setSpeed(nextSpeed);
  }

  const percent = Math.min(100, (seconds / target.seconds) * 100);

  return (
    <Screen>
      <h1>빛이랑 경주</h1>
      <p className="lede">빛은 1초에 약 30만 km를 가요. 태양에서 출발해 볼까요?</p>
      <p className="label">어디까지?</p>
      <div className="chips">
        {RACE_TARGETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={item.id === targetId}
            disabled={phase !== "run"}
            onClick={() => {
              playTap();
              reset(item.id, defaultRaceSpeed(item.id));
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className="label">빠르기</p>
      <div className="chips">
        {RACE_SPEEDS.map((item) => (
          <button
            key={item}
            type="button"
            className="chip"
            aria-pressed={item === speed}
            disabled={phase !== "run"}
            onClick={() => {
              playTap();
              setSpeed(item);
            }}
          >
            {formatSpeed(item)}
          </button>
        ))}
      </div>
      <div className="split">
        <div>
          <p className="label">빛이 달린 시간</p>
          <strong>{formatDuration(seconds)}</strong>
        </div>
        <div>
          <p className="label">{target.name}까지</p>
          <strong>{formatDuration(target.seconds)}</strong>
        </div>
      </div>
      <div className="bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
      {phase === "run" ? (
        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              playTap();
              if (done) reset();
              else setRunning((value) => !value);
            }}
          >
            {running ? "멈춤" : done ? "다시 출발" : seconds > 0 ? "계속" : "출발"}
          </button>
          <button type="button" className="btn" onClick={() => reset()}>
            처음부터
          </button>
        </div>
      ) : null}
      {phase === "result" ? (
        <section className="card">
          <p className="good">
            도착! 빛은 {target.name}까지 {formatDuration(target.seconds)} 걸렸어요. 빛의 친구 도장을 받았어요.
          </p>
          {adAhead ? <p className="label">다시 하면 짧은 광고가 한 번 나와요.</p> : null}
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void again()}>
            다른 곳까지 다시 하기
          </button>
        </section>
      ) : null}
      <p className="muted">
        {target.id === "voyager1"
          ? "보이저 1호는 사람이 만든 것 중 가장 멀리 간 탐사선이에요. 2026년 11월 18일, 지구에서 빛으로 하루 거리에 처음 닿았어요."
          : `태양에서 평균 거리로 잰 시간이에요(${target.mean}). 행성은 태양 둘레를 타원으로 돌아서 거리가 조금씩 바뀌어요.`}
      </p>
      {target.id === "earth" ? <p className="muted">지금 보는 햇빛은 약 8분 20초 전에 태양을 떠난 빛이에요.</p> : null}
    </Screen>
  );
}
