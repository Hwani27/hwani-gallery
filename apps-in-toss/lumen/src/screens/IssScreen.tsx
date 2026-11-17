import { useEffect, useMemo, useState } from "react";
import { Screen } from "../components/Screen";
import { playTap } from "../lib/audio";
import { issFix } from "../lib/iss";
import { awardStamp } from "../lib/storage";

export function IssScreen() {
  const [now, setNow] = useState(() => Date.now());
  const [noted, setNoted] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const fix = useMemo(() => issFix(new Date(now)), [now]);

  const latName = fix.lat >= 0 ? "북위" : "남위";
  const lonName = fix.lon >= 0 ? "동경" : "서경";

  return (
    <Screen>
      <h1>우주정거장</h1>
      <p className="lede">국제우주정거장은 사람이 사는 우주 집이에요. 약 400km 높이에서 90분쯤마다 지구를 한 바퀴, 하루에 약 16바퀴 돌아요.</p>
      <p className="muted">인터넷 없이 앱 안에서 계산하는 원 궤도 모형이에요. 실제 정거장 위치가 아니라, 어떻게 움직이는지 보여 주는 그림이에요.</p>
      <section className="card">
        <p className="label">모형 속 정거장</p>
        <strong>
          {latName} {Math.abs(fix.lat).toFixed(0)}도 · {lonName} {Math.abs(fix.lon).toFixed(0)}도
        </strong>
        <p>
          높이 {Math.round(fix.altKm)}km · 빠르기 초속 {fix.speedKmS.toFixed(1)}km
        </p>
        <p className="muted">초속 약 7.7km, 서울에서 부산까지 1분도 안 걸리는 빠르기예요.</p>
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
        관측 기록 남기기
      </button>
      {noted ? <p className="good">우주정거장 관측자 도장을 받았어요.</p> : null}
      <h2>서울에서 보려면</h2>
      <ul className="list plain">
        <li>
          <strong>해가 진 뒤나 뜨기 전</strong>
          <p className="muted">하늘은 어둡고 정거장에는 햇빛이 닿을 때, 아주 밝은 별처럼 보여요.</p>
        </li>
        <li>
          <strong>천천히, 깜빡이지 않고</strong>
          <p className="muted">몇 분 동안 하늘을 가로질러요. 비행기와 달리 불빛이 깜빡이지 않아요.</p>
        </li>
        <li>
          <strong>정확한 시각은 그때그때 달라요</strong>
          <p className="muted">궤도가 조금씩 바뀌어서, 지나가는 시각은 날마다 새로 계산해야 해요.</p>
        </li>
      </ul>
    </Screen>
  );
}
