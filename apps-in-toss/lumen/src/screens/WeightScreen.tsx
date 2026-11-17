import { useState } from "react";
import { Screen } from "../components/Screen";
import { WEIGHT_BODIES } from "../data/planets";
import { playTap } from "../lib/audio";
import { formatKg } from "../lib/format";
import { awardStamp, setWeightKg } from "../lib/storage";

export function WeightScreen({ initial }: { initial: string }) {
  const [raw, setRaw] = useState(initial);
  const [weighed, setWeighed] = useState(false);
  const kg = Math.max(0, Math.min(500, Number(raw.replace(",", ".")) || 0));

  return (
    <Screen>
      <h1>행성 체중계</h1>
      <p className="lede">저울 숫자예요. 몸은 그대로인데 끌어당기는 힘이 달라서 숫자가 바뀌어요. 자료는 NASA 행성 자료표예요.</p>
      <label className="field">
        <span>지구에서 내 몸무게</span>
        <span className="input-wrap">
          <input
            inputMode="decimal"
            aria-label="지구에서 몸무게, 킬로그램"
            value={raw}
            onChange={(event) => {
              setWeighed(false);
              setRaw(event.target.value.replace(/[^0-9.,]/g, "").slice(0, 5));
            }}
          />
          kg
        </span>
      </label>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          playTap();
          setWeightKg(raw);
          setWeighed(true);
          if (kg > 0) awardStamp("weight");
        }}
      >
        이 몸무게로 재기
      </button>
      {weighed ? <p className="good">우주 저울 도장을 확인했어요.</p> : null}
      <ul className="list">
        {WEIGHT_BODIES.map((body) => (
          <li key={body.id}>
            <span className="swatch" style={{ background: body.color }} />
            <div>
              <strong>
                {body.name} {formatKg(kg * body.ratio)}
              </strong>
              <p>{body.line}</p>
              {body.cloudTop ? <p className="muted">딛을 땅이 없어서 구름 꼭대기 높이로 재요.</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
