import { useEffect, useState } from "react";
import { Screen } from "../components/Screen";
import { CITY_HALL, nearestPlace } from "../data/places";
import { BALLS, EARTH_DIAMETER_KM, PROXIMA_KM, SOCCER_BALL_M, SUN_DIAMETER_KM, TOY_BODIES, ballName, modelMeters } from "../data/planets";
import { playTap } from "../lib/audio";
import { rewardedSupported, showRewardedAd } from "../lib/ads";
import { formatLength } from "../lib/format";
import { awardStamp, getProgress, unlockBonusComparison } from "../lib/storage";

export function SizeScreen() {
  const [bonus, setBonus] = useState(() => getProgress().bonusComparison);
  const [note, setNote] = useState("");
  useEffect(() => {
    awardStamp("size");
  }, []);

  const earthCm = SOCCER_BALL_M * 100;
  const sunM = modelMeters(SUN_DIAMETER_KM);
  const moonM = modelMeters(TOY_BODIES.find((body) => body.id === "moon")?.distanceKm ?? 0);
  const proximaKm = modelMeters(PROXIMA_KM) / 1000;

  async function watchAd() {
    playTap();
    setNote("광고를 준비하고 있어요.");
    const earned = await showRewardedAd();
    if (earned) {
      unlockBonusComparison();
      awardStamp("bonus");
      setBonus(true);
      setNote("보너스 비교를 열었어요.");
      return;
    }
    setNote("광고를 끝까지 보지 않아서, 비교는 그대로예요.");
  }

  return (
    <Screen>
      <h1>크기 장난감</h1>
      <p className="lede">
        지구를 축구공({earthCm.toFixed(0)}cm)으로 줄여 볼까요? 태양은 서울시청 앞에 둬요. 태양 공은 지름이 {formatLength(sunM)}나 돼요.
      </p>
      <p>달은 지구 공에서 {formatLength(moonM)} 떨어진 곳에 있어요.</p>
      <ul className="list">
        {TOY_BODIES.map((body) => {
          const diameterM = modelMeters(body.diameterKm);
          const distanceM = modelMeters(body.distanceKm);
          const cm = diameterM * 100;
          const named = ballName(cm);
          const near = nearestPlace(distanceM / 1000);
          return (
            <li key={body.id}>
              <span className="swatch" style={{ background: body.color }} />
              <div>
                <strong>{body.name}</strong>
                <p>
                  지름 {formatLength(diameterM)}
                  {named ? ` · ${named}만 해요` : ""}
                </p>
                <p className="muted">
                  {body.from === "earth" ? "지구에서 " : "시청에서 "}
                  {formatLength(distanceM)}
                  {" · "}
                  {near.close ? `${near.place.name}쯤이에요` : `${near.place.name}(${near.km.toFixed(1)}km)와 가장 가까워요`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <ToyMap />
      <p className="muted">점은 서울의 장소, 동그라미는 행성이 놓이는 거리예요. 거리는 로그 눈금이라 멀수록 촘촘해요. 축구공 크기의 지구를 기준으로 한 거리예요.</p>
      <p className="muted">공 크기: {BALLS.map((ball) => `${ball.name} ${ball.cm}cm`).join(", ")}</p>
      {bonus ? (
        <section className="card">
          <h2>가장 가까운 다른 별</h2>
          <p>
            프록시마 센타우리는 이 크기로도 {Math.round(proximaKm).toLocaleString("ko-KR")}km 떨어져 있어요. 진짜 지구를{" "}
            {Math.floor(proximaKm / 40075)}바퀴 넘게 도는 거리예요.
          </p>
        </section>
      ) : rewardedSupported() ? (
        <button type="button" className="btn btn-primary" onClick={() => void watchAd()}>
          광고 보고 가장 가까운 별까지 비교하기
        </button>
      ) : null}
      {note ? <p className="muted">{note}</p> : null}
      <p className="muted">기준점: {CITY_HALL.name}. 지구 지름 {EARTH_DIAMETER_KM.toLocaleString("ko-KR")}km.</p>
    </Screen>
  );
}

function ToyMap() {
  const size = 280;
  const center = size / 2;
  const suns = TOY_BODIES.filter((body) => body.from === "sun");
  const rings = suns.map((body, index) => {
    const km = modelMeters(body.distanceKm) / 1000;
    const radius = 18 + ((Math.log10(Math.max(0.2, km)) - Math.log10(0.2)) / (Math.log10(800) - Math.log10(0.2))) * 110;
    const angle = ((-150 + index * 47) * Math.PI) / 180;
    return { body, radius, x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
  });
  return (
    <svg className="toy-map" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="서울시청에 태양을 두었을 때 행성이 놓이는 거리">
      {rings.map((ring) => (
        <g key={ring.body.id}>
          <circle cx={center} cy={center} r={ring.radius} className="ring" />
          <text x={ring.x} y={ring.y} textAnchor="middle" dominantBaseline="middle">
            {ring.body.name}
          </text>
        </g>
      ))}
      <circle cx={center} cy={center} r={4} className="sun-dot" />
    </svg>
  );
}
