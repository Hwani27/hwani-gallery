import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { Screen } from "../components/Screen";
import { playTap } from "../lib/audio";
import { haptic } from "../lib/haptic";
import { getProgress, recordOrder, subscribeProgress } from "../lib/storage";

type Planet = { id: string; name: string; au: number; km: number; color: string };

/** 태양에서 평균 거리(AU)와 지름(km). NASA Planetary Fact Sheet. */
const PLANETS: readonly Planet[] = [
  { id: "mercury", name: "수성", au: 0.39, km: 4879, color: "#b5ada4" },
  { id: "venus", name: "금성", au: 0.72, km: 12104, color: "#e0c48a" },
  { id: "earth", name: "지구", au: 1, km: 12756, color: "#2f6fad" },
  { id: "mars", name: "화성", au: 1.52, km: 6792, color: "#c15b3c" },
  { id: "jupiter", name: "목성", au: 5.2, km: 142984, color: "#d2a679" },
  { id: "saturn", name: "토성", au: 9.57, km: 120536, color: "#e6d3a3" },
  { id: "uranus", name: "천왕성", au: 19.17, km: 51118, color: "#8fd0cb" },
  { id: "neptune", name: "해왕성", au: 30.18, km: 49528, color: "#3d6ea5" },
];

const MODES = {
  distance: { label: "태양에서 가까운 순", answer: [...PLANETS].sort((a, b) => a.au - b.au).map((p) => p.id), detail: (p: Planet) => `태양에서 ${p.au}AU` },
  size: { label: "큰 순서", answer: [...PLANETS].sort((a, b) => b.km - a.km).map((p) => p.id), detail: (p: Planet) => `지름 ${p.km.toLocaleString("ko-KR")}km` },
} as const;

type Mode = keyof typeof MODES;

function shuffled(answer: readonly string[]): string[] {
  const items = [...answer];
  do {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  } while (items.every((id, i) => id === answer[i]));
  return items;
}

export function OrderScreen() {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getProgress);
  const [mode, setMode] = useState<Mode>("distance");
  const [order, setOrder] = useState(() => shuffled(MODES.distance.answer));
  const [dragging, setDragging] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean[] | null>(null);
  const [result, setResult] = useState<{ seconds: number; best: boolean } | null>(null);
  const [tries, setTries] = useState(0);
  const startedAt = useRef<number>(performance.now());
  const listRef = useRef<HTMLOListElement>(null);

  function reset(next: Mode) {
    setMode(next);
    setOrder(shuffled(MODES[next].answer));
    setChecked(null);
    setResult(null);
    setTries(0);
    startedAt.current = performance.now();
  }

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  function onDown(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (result) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(id);
    setChecked(null);
    haptic("tickWeak");
  }

  function onMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragging || !listRef.current) return;
    const rows = [...listRef.current.querySelectorAll<HTMLElement>("[data-id]")];
    const target = rows.find((row) => {
      const rect = row.getBoundingClientRect();
      return event.clientY >= rect.top && event.clientY <= rect.bottom;
    });
    const overId = target?.dataset.id;
    if (!overId || overId === dragging) return;
    setOrder((items) => {
      const from = items.indexOf(dragging);
      const to = items.indexOf(overId);
      const next = [...items];
      next.splice(from, 1);
      next.splice(to, 0, dragging);
      return next;
    });
  }

  function move(id: string, delta: number) {
    playTap();
    setChecked(null);
    setOrder((items) => {
      const from = items.indexOf(id);
      const to = Math.max(0, Math.min(items.length - 1, from + delta));
      const next = [...items];
      next.splice(from, 1);
      next.splice(to, 0, id);
      return next;
    });
  }

  function check() {
    playTap();
    const answer = MODES[mode].answer;
    const marks = order.map((id, i) => id === answer[i]);
    setChecked(marks);
    setTries((value) => value + 1);
    if (marks.every(Boolean)) {
      haptic("success");
      const seconds = Math.max(1, Math.round((performance.now() - startedAt.current) / 1000));
      setResult({ seconds, best: recordOrder(mode, seconds) });
    } else {
      haptic("error");
    }
  }

  const best = progress.orderBest[mode];

  return (
    <Screen>
      <h1>행성 줄 세우기</h1>
      <p className="lede">행성을 끌어서 순서대로 놓아 보세요. 빨리 맞힐수록 기록이 좋아요.</p>
      <div className="chips">
        {(Object.keys(MODES) as Mode[]).map((key) => (
          <button key={key} type="button" className="chip" aria-pressed={key === mode} onClick={() => reset(key)}>
            {MODES[key].label}
          </button>
        ))}
      </div>
      <p className="label">
        {MODES[mode].label} · 위가 1등{best !== undefined ? ` · 내 최고 기록 ${best}초` : ""}
      </p>
      <ol className="order-list" ref={listRef}>
        {order.map((id, i) => {
          const planet = PLANETS.find((item) => item.id === id) ?? PLANETS[0];
          const mark = checked?.[i];
          return (
            <li key={id} data-id={id} className={`${dragging === id ? "is-drag" : ""} ${mark === true ? "is-right" : mark === false ? "is-wrong" : ""}`}>
              <button
                type="button"
                className="order-handle"
                aria-label={`${planet.name}, ${i + 1}번째. 끌어서 옮기기`}
                onPointerDown={(event) => onDown(event, id)}
                onPointerMove={onMove}
                onPointerUp={() => setDragging(null)}
                onPointerCancel={() => setDragging(null)}
              >
                <span className="order-rank">{i + 1}</span>
                <span className="swatch" style={{ background: planet.color }} />
                <strong>{planet.name}</strong>
                {result ? <span className="muted">{MODES[mode].detail(planet)}</span> : null}
              </button>
              {!result ? (
                <span className="order-moves">
                  <button type="button" className="chip" aria-label={`${planet.name} 위로`} onClick={() => move(id, -1)}>
                    위
                  </button>
                  <button type="button" className="chip" aria-label={`${planet.name} 아래로`} onClick={() => move(id, 1)}>
                    아래
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {result ? (
        <section className="card">
          <p className="good">
            모두 맞혔어요! {result.seconds}초, {tries}번 만에 맞혔어요.{result.best ? " 새 최고 기록이에요." : ""}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => reset(mode === "distance" ? "size" : "distance")}>
            {mode === "distance" ? "크기 순으로 해 보기" : "거리 순으로 해 보기"}
          </button>
        </section>
      ) : (
        <>
          {checked ? <p className="muted">파란 줄은 맞은 자리, 회색 줄은 다시 옮겨 볼 자리예요.</p> : null}
          <button type="button" className="btn btn-primary" onClick={check}>
            이 순서로 확인
          </button>
        </>
      )}
    </Screen>
  );
}
