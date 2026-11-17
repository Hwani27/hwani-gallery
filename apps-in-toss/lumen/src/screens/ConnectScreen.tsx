import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { Screen } from "../components/Screen";
import { CONSTELLATION_META } from "../data/constellations";
import { COLOR_STARS, CONSTELLATION_LINES } from "../data/sky";
import { rewardedSupported, showRewardedAd } from "../lib/ads";
import { playTap } from "../lib/audio";
import { haptic } from "../lib/haptic";
import { starColor } from "../lib/starColor";
import { getProgress, recordConnect, subscribeProgress } from "../lib/storage";
import type { ScreenId } from "../screenIds";

type Vec = [number, number, number];
type Star = { x: number; y: number; r: number; color: string };
type Puzzle = { stars: Star[]; edges: string[] };

const SIZE = 320;
const PAD = 34;
const RAD = Math.PI / 180;

function unit(ra: number, dec: number): Vec {
  return [Math.cos(dec * RAD) * Math.cos(ra * RAD), Math.cos(dec * RAD) * Math.sin(ra * RAD), Math.sin(dec * RAD)];
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

/** 별자리 선에서 별(꼭짓점)과 이어야 할 선을 뽑고, 하늘에서 본 모양 그대로 평면에 펼칩니다. */
function buildPuzzle(id: string): Puzzle {
  const lines = CONSTELLATION_LINES[id] ?? [];
  const index = new Map<string, number>();
  const points: [number, number][] = [];
  const edges = new Set<string>();
  for (const line of lines) {
    let previous = -1;
    for (const [ra, dec] of line) {
      const key = `${ra.toFixed(1)},${dec.toFixed(1)}`;
      let i = index.get(key);
      if (i === undefined) {
        i = points.length;
        index.set(key, i);
        points.push([ra, dec]);
      }
      if (previous >= 0 && previous !== i) edges.add(edgeKey(previous, i));
      previous = i;
    }
  }
  const vectors = points.map(([ra, dec]) => unit(ra, dec));
  const sum = vectors.reduce<Vec>((acc, v) => [acc[0] + v[0], acc[1] + v[1], acc[2] + v[2]], [0, 0, 0]);
  const len = Math.hypot(...sum) || 1;
  const c: Vec = [sum[0] / len, sum[1] / len, sum[2] / len];
  let east: Vec = [-c[1], c[0], 0];
  const el = Math.hypot(...east) || 1;
  east = [east[0] / el, east[1] / el, east[2] / el];
  const north: Vec = [c[1] * east[2] - c[2] * east[1], c[2] * east[0] - c[0] * east[2], c[0] * east[1] - c[1] * east[0]];
  const flat = vectors.map((v) => {
    const depth = v[0] * c[0] + v[1] * c[1] + v[2] * c[2];
    // 하늘을 올려다보면 동쪽이 왼쪽입니다.
    return [-(v[0] * east[0] + v[1] * east[1] + v[2] * east[2]) / depth, (v[0] * north[0] + v[1] * north[1] + v[2] * north[2]) / depth];
  });
  const xs = flat.map((p) => p[0]);
  const ys = flat.map((p) => p[1]);
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1;
  const scale = (SIZE - PAD * 2) / span;
  const midX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const midY = (Math.max(...ys) + Math.min(...ys)) / 2;
  const stars = flat.map(([x, y], i) => {
    const [ra, dec] = points[i];
    let mag = 3.6;
    let bv = 0.6;
    for (const star of COLOR_STARS) {
      if (Math.abs(star[0] - ra) < 0.4 && Math.abs(star[1] - dec) < 0.4) {
        mag = star[2];
        bv = star[3];
        break;
      }
    }
    return { x: SIZE / 2 + (x - midX) * scale, y: SIZE / 2 - (y - midY) * scale, r: Math.max(2.4, 6 - mag), color: starColor(bv) };
  });
  return { stars, edges: [...edges] };
}

export function ConnectScreen({ open }: { open: (screen: ScreenId, focus?: string) => void }) {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getProgress);
  const [id, setId] = useState(() => CONSTELLATION_META.find((item) => progress.connectBest[item.id] === undefined)?.id ?? "Ori");
  const puzzle = useMemo(() => buildPuzzle(id), [id]);
  const meta = CONSTELLATION_META.find((item) => item.id === id) ?? CONSTELLATION_META[0];
  const [done, setDone] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ from: number; x: number; y: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [note, setNote] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [result, setResult] = useState<{ seconds: number; best: boolean } | null>(null);
  const startedAt = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setDone([]);
    setSelected(null);
    setMistakes(0);
    setNote("");
    setHint(null);
    setResult(null);
    startedAt.current = null;
  }, [id]);

  function toSvg(event: { clientX: number; clientY: number }): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * SIZE, y: ((event.clientY - rect.top) / rect.height) * SIZE };
  }

  function starAt(x: number, y: number): number {
    let best = -1;
    let bestDist = 26;
    puzzle.stars.forEach((star, i) => {
      const dist = Math.hypot(star.x - x, star.y - y);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    });
    return best;
  }

  function attempt(a: number, b: number) {
    if (a === b || result) return;
    startedAt.current ??= performance.now();
    const key = edgeKey(a, b);
    if (done.includes(key)) return;
    if (!puzzle.edges.includes(key)) {
      setMistakes((value) => value + 1);
      setNote("그 두 별은 이어지지 않아요.");
      haptic("error");
      return;
    }
    playTap();
    haptic("tickWeak");
    setNote("");
    if (hint === key) setHint(null);
    const next = [...done, key];
    setDone(next);
    if (next.length === puzzle.edges.length) {
      const seconds = Math.max(1, Math.round((performance.now() - (startedAt.current ?? performance.now())) / 1000));
      const best = recordConnect(id, seconds);
      setResult({ seconds, best });
    }
  }

  function onDown(event: ReactPointerEvent<SVGSVGElement>) {
    const point = toSvg(event);
    const i = starAt(point.x, point.y);
    if (i < 0) return;
    startedAt.current ??= performance.now();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ from: i, ...point });
  }

  function onMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!drag) return;
    setDrag({ ...drag, ...toSvg(event) });
  }

  function onUp(event: ReactPointerEvent<SVGSVGElement>) {
    if (!drag) return;
    const point = toSvg(event);
    const target = starAt(point.x, point.y);
    const from = drag.from;
    setDrag(null);
    if (target >= 0 && target !== from) {
      attempt(from, target);
      setSelected(null);
      return;
    }
    // 끌지 않고 눌렀다 떼면 "별 하나 고르고 → 다른 별 누르기"로 잇습니다.
    if (target === from) {
      if (selected === null || selected === from) setSelected(selected === from ? null : from);
      else {
        attempt(selected, from);
        setSelected(null);
      }
    }
  }

  async function askHint() {
    playTap();
    setNote("광고를 준비하고 있어요.");
    const earned = await showRewardedAd("connect-hint");
    if (!earned) {
      setNote("광고를 끝까지 보지 않아서 힌트는 그대로예요.");
      return;
    }
    const missing = puzzle.edges.find((key) => !done.includes(key)) ?? null;
    setHint(missing);
    setNote("점선으로 이을 곳 하나를 알려 드렸어요.");
  }

  const solved = Object.keys(progress.connectBest).length;

  return (
    <Screen>
      <h1>별자리 잇기</h1>
      <p className="lede">
        별을 손가락으로 끌어서 이어 보세요. 별을 하나 누르고 다른 별을 눌러도 이어져요. 별 위치는 실제 하늘 그대로예요.
      </p>
      <div className="line">
        <h2>{meta.name}</h2>
        <span className="tag tag-on">
          {done.length} / {puzzle.edges.length}
        </span>
      </div>
      <svg
        ref={svgRef}
        className="connect-board"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`${meta.name} 별자리 잇기 판`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setDrag(null)}
      >
        <rect width={SIZE} height={SIZE} rx="16" fill="#0b1220" />
        {hint
          ? (() => {
              const [a, b] = hint.split("-").map(Number);
              return <line x1={puzzle.stars[a].x} y1={puzzle.stars[a].y} x2={puzzle.stars[b].x} y2={puzzle.stars[b].y} stroke="#8fb7e6" strokeWidth="2" strokeDasharray="5 5" />;
            })()
          : null}
        {done.map((key) => {
          const [a, b] = key.split("-").map(Number);
          return <line key={key} x1={puzzle.stars[a].x} y1={puzzle.stars[a].y} x2={puzzle.stars[b].x} y2={puzzle.stars[b].y} stroke="#3182f6" strokeWidth="2.5" strokeLinecap="round" />;
        })}
        {drag ? <line x1={puzzle.stars[drag.from].x} y1={puzzle.stars[drag.from].y} x2={drag.x} y2={drag.y} stroke="#8fb7e6" strokeWidth="2" /> : null}
        {puzzle.stars.map((star, i) => (
          <g key={i}>
            {selected === i || drag?.from === i ? <circle cx={star.x} cy={star.y} r={star.r + 7} fill="none" stroke="#8fb7e6" strokeWidth="1.5" /> : null}
            <circle cx={star.x} cy={star.y} r={star.r} fill={star.color} />
          </g>
        ))}
      </svg>
      {note ? <p className="muted" role="status">{note}</p> : null}
      {result ? (
        <section className="card">
          <p className="good">
            {meta.name} 완성! {result.seconds}초 걸렸어요{mistakes > 0 ? `, 틀린 연결 ${mistakes}번` : ""}.
            {result.best ? " 새 최고 기록이에요." : ""}
          </p>
          <p>{meta.story}</p>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => open("sky", id)}>
              하늘에서 찾아보기
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const next = CONSTELLATION_META.find((item) => item.id !== id && getProgress().connectBest[item.id] === undefined);
                setId(next?.id ?? CONSTELLATION_META[(CONSTELLATION_META.indexOf(meta) + 1) % CONSTELLATION_META.length].id);
              }}
            >
              다음 별자리
            </button>
          </div>
        </section>
      ) : (
        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              setDone([]);
              setSelected(null);
              setHint(null);
              setNote("");
              startedAt.current = null;
            }}
          >
            처음부터
          </button>
          {rewardedSupported() && !hint ? (
            <button type="button" className="btn btn-quiet" onClick={() => void askHint()}>
              광고 보고 힌트 받기
            </button>
          ) : null}
        </div>
      )}
      <p className="label">완성한 별자리 {solved} / {CONSTELLATION_META.length}</p>
      <div className="chips">
        {CONSTELLATION_META.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={item.id === id}
            onClick={() => {
              playTap();
              setId(item.id);
            }}
          >
            {item.name}
            {progress.connectBest[item.id] !== undefined ? ` · ${progress.connectBest[item.id]}초` : ""}
          </button>
        ))}
      </div>
    </Screen>
  );
}
