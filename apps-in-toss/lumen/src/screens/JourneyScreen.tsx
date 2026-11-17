import { useState } from "react";
import { Screen } from "../components/Screen";
import { EarthScene, type JourneyMode } from "../scene/EarthScene";

const MODES: { id: JourneyMode; label: string }[] = [
  { id: "earth", label: "지구 가까이" },
  { id: "moon", label: "달까지" },
  { id: "system", label: "태양계" },
];

export function JourneyScreen() {
  const [mode, setMode] = useState<JourneyMode>("earth");
  const [night, setNight] = useState(false);
  const [webgl] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  });

  return (
    <Screen>
      <h1>지구에서 우주로</h1>
      <p className="lede">화면을 끌어서 둘러보세요. 지구 그림은 이 앱이 직접 그린 간단한 지도예요.</p>
      <div className="chips">
        {MODES.map((item) => (
          <button key={item.id} type="button" className="chip" aria-pressed={mode === item.id} onClick={() => setMode(item.id)}>
            {item.label}
          </button>
        ))}
        <button type="button" className="chip" aria-pressed={night} onClick={() => setNight((value) => !value)}>
          {night ? "밤" : "낮"}
        </button>
      </div>
      <div className="journey-stage">
        {webgl ? <EarthScene mode={mode} night={night} /> : <p className="boot-fallback">이 기기에서는 3D를 열 수 없어요.</p>}
      </div>
      <p className="muted">
        {mode === "earth"
          ? "바다와 대륙, 밤에는 도시의 불빛이에요."
          : mode === "moon"
            ? "달은 지구에서 약 38만 km 떨어져 있어요."
            : "거리는 한 화면에 넣으려고 로그 눈금으로 줄였어요. 해왕성은 지구보다 30배 멀어요."}
      </p>
    </Screen>
  );
}
