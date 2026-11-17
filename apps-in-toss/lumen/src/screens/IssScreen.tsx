import { useEffect, useMemo, useState } from "react";
import { Screen } from "../components/Screen";
import { playTap } from "../lib/audio";
import { compass } from "../lib/format";
import { SEOUL, issFix, lookAngles, upcomingPasses, type Pass } from "../lib/iss";
import { awardStamp } from "../lib/storage";

function whenLabel(time: number): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(time);
}

function PassRow({ pass }: { pass: Pass }) {
  const minutes = Math.max(1, Math.round((pass.end - pass.start) / 60_000));
  const from = compass(pass.fromAz);
  const to = compass(pass.toAz);
  return (
    <li>
      <div className="line">
        <strong>{whenLabel(pass.start)}</strong>
        <span className={pass.visible ? "tag tag-on" : "tag"}>{pass.visible ? "눈으로 보여요" : "안 보여요"}</span>
      </div>
      <p className="muted">
        {from === to ? `${from} 하늘에서` : `${from}에서 ${to}으로`} {minutes}분 · 가장 높이 {Math.round(pass.maxElevation)}도
        {pass.visible ? "" : ". 하늘이 밝거나, 정거장이 그림자 속이에요."}
      </p>
    </li>
  );
}

export function IssScreen({ onMenu }: { onMenu: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const [noted, setNoted] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const fix = useMemo(() => issFix(new Date(now)), [now]);
  const look = useMemo(() => lookAngles(SEOUL.lat, SEOUL.lon, fix.ecef), [fix]);
  const passes = useMemo(() => upcomingPasses(new Date(now)).slice(0, 6), [Math.floor(now / 60_000)]);

  const latName = fix.lat >= 0 ? "북위" : "남위";
  const lonName = fix.lon >= 0 ? "동경" : "서경";

  return (
    <Screen onMenu={onMenu}>
      <h1>우주정거장</h1>
      <p className="lede">국제우주정거장은 사람이 사는 우주 집이에요. 약 90분마다 지구를 한 바퀴 돌아요.</p>
      <p className="muted">앱에 넣어 둔 원 궤도 모형이에요. 인터넷 없이 대략의 위치를 보여 주고, 실제 위치와 조금 다를 수 있어요.</p>
      <section className="card">
        <p className="label">지금 여기쯤</p>
        <strong>
          {latName} {Math.abs(fix.lat).toFixed(0)}도 · {lonName} {Math.abs(fix.lon).toFixed(0)}도
        </strong>
        <p>
          높이 {Math.round(fix.altKm)}km · 빠르기 초속 {fix.speedKmS.toFixed(1)}km
        </p>
        <p className="muted">
          서울에서 보면 높이 {Math.round(look.elev)}도, {compass(look.az)} 방향이에요.
          {look.elev > 10 ? " 지금 하늘 위에 있어요." : " 지금은 지평선 아래예요."}
        </p>
      </section>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          playTap();
          awardStamp("iss");
          setNoted(true);
        }}
      >
        이 위치를 기록해요
      </button>
      {noted ? <p className="good">우주정거장 관측자 도장을 받았어요.</p> : null}
      <h2>서울에서 볼 수 있는 때</h2>
      <p className="muted">앞으로 3일, 한국 시간. 해가 진 뒤나 뜨기 전, 아주 밝은 별처럼 천천히 움직여요. 반짝이지 않아요.</p>
      {passes.length === 0 ? (
        <p>이 기간에는 서울 하늘 위로 지나가지 않아요.</p>
      ) : (
        <ul className="list plain">
          {passes.map((pass) => (
            <PassRow key={pass.start} pass={pass} />
          ))}
        </ul>
      )}
    </Screen>
  );
}
