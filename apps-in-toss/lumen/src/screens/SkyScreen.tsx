import { useEffect, useRef, useState } from "react";
import { Screen } from "../components/Screen";
import { CONSTELLATION_LINES, FIELD_STARS, NAMED_STARS } from "../data/sky";
import { CONSTELLATION_META as CONSTELLATIONS, type ConstellationMeta } from "../data/constellations";
import { josa } from "../lib/format";
import { altAz, localSiderealDegrees } from "../lib/astro";
import { playTap } from "../lib/audio";
import { SEOUL } from "../lib/iss";
import { awardStamp, findConstellation, getProgress } from "../lib/storage";

type Point = { x: number; y: number; alt: number };

function vec(alt: number, az: number): [number, number, number] {
  const a = (alt * Math.PI) / 180;
  const z = (az * Math.PI) / 180;
  return [Math.cos(a) * Math.sin(z), Math.cos(a) * Math.cos(z), Math.sin(a)];
}

function dot(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function norm(v: [number, number, number]): [number, number, number] {
  const length = Math.hypot(...v) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function project(
  ra: number,
  dec: number,
  lst: number,
  viewAz: number,
  viewAlt: number,
  width: number,
  height: number,
): Point | null {
  const sky = altAz(ra, dec, SEOUL.lat, lst);
  const star = vec(sky.alt, sky.az);
  const forward = vec(viewAlt, viewAz);
  let right = cross(forward, [0, 0, 1]);
  if (Math.hypot(...right) < 0.08) right = [1, 0, 0];
  right = norm(right);
  const up = norm(cross(right, forward));
  const depth = dot(star, forward);
  if (depth < 0.25) return null;
  const scale = Math.min(width, height) * 0.46;
  return {
    x: width / 2 + (dot(star, right) / depth) * scale,
    y: height / 2 - (dot(star, up) / depth) * scale,
    alt: sky.alt,
  };
}

function hour0(): number {
  return 21;
}

function lstAt(hour: number): number {
  const when = new Date();
  when.setHours(0, 0, 0, 0);
  when.setHours(hour);
  return localSiderealDegrees(when, SEOUL.lon);
}

/** 고른 별자리 쪽으로 시선을 돌립니다. 땅 아래면 남쪽 하늘을 봅니다. */
function viewToward(id: string | null, hour: number): { az: number; alt: number } {
  const body = CONSTELLATIONS.find((item) => item.id === id);
  if (!body) return { az: 180, alt: 48 };
  const sky = altAz(body.center[0], body.center[1], SEOUL.lat, lstAt(hour));
  if (sky.alt <= 0) return { az: 180, alt: 48 };
  return { az: sky.az, alt: Math.min(80, Math.max(8, sky.alt)) };
}

export function SkyScreen({ focusId }: { focusId: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef({ az: 180, alt: 48 });
  const lstRef = useRef(0);
  const [hour, setHour] = useState(hour0);
  const [view, setView] = useState(() => viewToward(focusId, hour0()));
  const [selected, setSelected] = useState<string | null>(focusId);
  const [found, setFound] = useState<string[]>(() => getProgress().foundConstellations);
  const [message, setMessage] = useState("");

  const when = new Date();
  when.setHours(0, 0, 0, 0);
  when.setHours(hour);
  const lst = localSiderealDegrees(when, SEOUL.lon);
  viewRef.current = view;
  lstRef.current = lst;
  const selectedBody = CONSTELLATIONS.find((item) => item.id === selected) ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    let drawing = false;
    for (let az = 0; az <= 360; az += 6) {
      const star = vec(0, az);
      const forward = vec(view.alt, view.az);
      let right = cross(forward, [0, 0, 1]);
      if (Math.hypot(...right) < 0.08) right = [1, 0, 0];
      right = norm(right);
      const up = norm(cross(right, forward));
      const depth = dot(star, forward);
      if (depth < 0.2) {
        drawing = false;
        continue;
      }
      const scale = Math.min(width, height) * 0.46;
      const x = width / 2 + (dot(star, right) / depth) * scale;
      const y = height / 2 - (dot(star, up) / depth) * scale;
      if (!drawing) {
        ctx.moveTo(x, y);
        drawing = true;
      } else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#8b95a1";
    ctx.lineWidth = 1;
    ctx.stroke();

    for (const star of FIELD_STARS) {
      const point = project(star[0], star[1], lst, view.az, view.alt, width, height);
      if (!point || point.alt < 0) continue;
      const size = Math.max(1, 3.2 - star[2]);
      ctx.fillStyle = "#f4f7fb";
      ctx.fillRect(point.x, point.y, size, size);
    }

    if (selectedBody) {
      ctx.strokeStyle = "#3182f6";
      ctx.lineWidth = 1.5;
      for (const line of CONSTELLATION_LINES[selectedBody.id] ?? []) {
        ctx.beginPath();
        let open = false;
        for (const [ra, dec] of line) {
          const point = project(ra, dec, lst, view.az, view.alt, width, height);
          if (!point || point.alt < 0) {
            open = false;
            continue;
          }
          if (!open) {
            ctx.moveTo(point.x, point.y);
            open = true;
          } else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }
    }

    ctx.fillStyle = "#8fb7e6";
    ctx.font = "12px sans-serif";
    for (const star of NAMED_STARS) {
      if (selected && star.c !== selected) continue;
      const point = project(star.ra, star.dec, lst, view.az, view.alt, width, height);
      if (!point || point.alt < 0) continue;
      ctx.fillText(star.name, point.x + 6, point.y);
    }
  }, [hour, lst, selected, selectedBody, view]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let drag: { x: number; y: number; az: number; alt: number } | null = null;
    const down = (event: PointerEvent) => {
      const current = viewRef.current;
      drag = { x: event.clientX, y: event.clientY, az: current.az, alt: current.alt };
    };
    const move = (event: PointerEvent) => {
      if (!drag) return;
      setView({
        az: (drag.az - (event.clientX - drag.x) * 0.35 + 360) % 360,
        alt: Math.min(80, Math.max(8, drag.alt + (event.clientY - drag.y) * 0.25)),
      });
    };
    const up = (event: PointerEvent) => {
      if (!drag) return;
      const moved = Math.hypot(event.clientX - drag.x, event.clientY - drag.y);
      drag = null;
      if (moved > 8) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
      let best: { id: string; dist: number; alt: number } | null = null;
      for (const constellation of CONSTELLATIONS) {
        for (const line of CONSTELLATION_LINES[constellation.id] ?? []) {
          for (const [ra, dec] of line) {
            const point = project(ra, dec, lstRef.current, viewRef.current.az, viewRef.current.alt, canvas.width, canvas.height);
            if (!point) continue;
            const dist = Math.hypot(point.x - x, point.y - y);
            if (!best || dist < best.dist) best = { id: constellation.id, dist, alt: point.alt };
          }
        }
      }
      if (!best || best.dist > 36) return;
      choose(best.id, best.alt > 0);
    };
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  function choose(id: string, above: boolean) {
    playTap();
    setSelected(id);
    const body = CONSTELLATIONS.find((item) => item.id === id);
    if (!body) return;
    if (!above) {
      setMessage(`${josa(body.name, "은는")} 이 시각에 땅 아래에 있어요. 시각을 바꿔 보세요.`);
      return;
    }
    const next = findConstellation(id);
    setFound(next);
    setMessage(`${josa(body.name, "을를")} 찾았어요.`);
    if (next.length >= 3) awardStamp("sky");
  }

  const clock = `${when.getHours()}시`;

  return (
    <Screen>
      <h1>서울 밤하늘</h1>
      <p className="lede">서울시청에서 올려다본 밤하늘이에요. 화면을 끌어서 둘러보고, 별자리를 눌러 보세요.</p>
      <canvas ref={canvasRef} className="sky" width={720} height={520} aria-label="서울 밤하늘" />
      <label className="field">
        <span>밤 시각 {clock}</span>
        <input
          type="range"
          min={18}
          max={30}
          value={hour}
          aria-label="밤 시각, 저녁 6시부터 아침 6시까지"
          onChange={(event) => setHour(Number(event.target.value))}
        />
      </label>
      {hour >= 24 && hour < 30 ? <p className="muted">자정을 넘긴 시각이에요.</p> : null}
      {when.getHours() >= 6 && when.getHours() < 18 ? (
        <p className="muted">지금은 낮이라 해 때문에 별이 안 보여요. 그래도 별은 그 자리에 있어요.</p>
      ) : null}
      <p className="label">별자리 고르기 · 찾은 별자리 {found.length}개 (3개면 도장)</p>
      <div className="chips">
        {CONSTELLATIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={item.id === selected}
            onClick={() => {
              const center = altAz(item.center[0], item.center[1], SEOUL.lat, lst);
              if (center.alt > 0) setView(viewToward(item.id, hour));
              choose(item.id, center.alt > 0);
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
      {selectedBody ? <Story body={selectedBody} /> : null}
      {message ? <p>{message}</p> : null}
      {found.length >= 3 ? <p className="good">별자리 탐정 도장을 받았어요.</p> : null}
      <p className="muted">별 위치는 2000년 기준이라, 아주 조금 어긋날 수 있어요.</p>
    </Screen>
  );
}

function Story({ body }: { body: ConstellationMeta }) {
  return (
    <section className="card">
      <h2>{body.name}</h2>
      <p className="muted">{body.season}</p>
      <p>{body.look}</p>
      <p>{body.story}</p>
      <p className="label">찾는 법</p>
      <p>{body.find}</p>
    </section>
  );
}
