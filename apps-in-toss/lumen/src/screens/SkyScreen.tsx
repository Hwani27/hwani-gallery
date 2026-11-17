import { useEffect, useMemo, useRef, useState } from "react";
import { Screen } from "../components/Screen";
import { COLOR_STARS, CONSTELLATION_LINES, NAMED_STARS } from "../data/sky";
import { CONSTELLATION_META as CONSTELLATIONS, type ConstellationMeta } from "../data/constellations";
import { josa } from "../lib/format";
import { planetPlaces } from "../lib/ephem";
import { starColor } from "../lib/starColor";
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

/** 오늘 0시에서 hour 시간 뒤(소수 가능, 30 = 다음 날 새벽 6시). */
function atHour(hour: number): Date {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return new Date(base.getTime() + hour * 3_600_000);
}

function lstAt(hour: number): number {
  return localSiderealDegrees(atHour(hour), SEOUL.lon);
}

/** 은하 좌표(l, b) → J2000 적경·적위(도). */
function galacticToEquatorial(l: number, b: number): [number, number] {
  const d = Math.PI / 180;
  const raNgp = 192.85948 * d;
  const decNgp = 27.12825 * d;
  const lNcp = 122.93192 * d;
  const lr = l * d;
  const br = b * d;
  const sinDec = Math.sin(decNgp) * Math.sin(br) + Math.cos(decNgp) * Math.cos(br) * Math.cos(lNcp - lr);
  const dec = Math.asin(sinDec);
  const y = Math.cos(br) * Math.sin(lNcp - lr);
  const x = Math.cos(decNgp) * Math.sin(br) - Math.sin(decNgp) * Math.cos(br) * Math.cos(lNcp - lr);
  return [(((raNgp + Math.atan2(y, x)) / d) % 360 + 360) % 360, dec / d];
}

const MILKY_WAY: [number, number][] = Array.from({ length: 121 }, (_, i) => galacticToEquatorial(i * 3, 0));

/** 고른 별자리 쪽으로 시선을 돌립니다. 땅 아래면 남쪽 하늘을 봅니다. */
function viewToward(id: string | null, hour: number): { az: number; alt: number } {
  const body = CONSTELLATIONS.find((item) => item.id === id);
  if (!body) return { az: 180, alt: 48 };
  const sky = altAz(body.center[0], body.center[1], SEOUL.lat, lstAt(hour));
  if (sky.alt <= 0) return { az: 180, alt: 48 };
  return { az: sky.az, alt: Math.min(80, Math.max(8, sky.alt)) };
}

function hourLabelShort(at: Date): string {
  const h = at.getHours();
  const m = at.getMinutes();
  const part = h < 6 ? "새벽" : h < 18 ? "아침" : h < 21 ? "저녁" : "밤";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${part} ${h12}시${m >= 30 ? " 반" : ""}`;
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
  const [playing, setPlaying] = useState(false);

  const when = atHour(hour);
  const lst = localSiderealDegrees(when, SEOUL.lon);
  viewRef.current = view;
  lstRef.current = lst;
  const selectedBody = CONSTELLATIONS.find((item) => item.id === selected) ?? null;
  const [pixels, setPixels] = useState({ width: 720, height: 520, ratio: 2 });
  const planets = useMemo(() => planetPlaces(when).planets, [lst]);

  // 화면 밀도에 맞춰 캔버스 해상도를 정해서, 고해상도 폰에서도 별이 또렷하게 보이게 합니다.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const ratio = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
      const cssWidth = canvas.clientWidth || 360;
      const width = Math.round(cssWidth * ratio);
      const height = Math.round(((cssWidth * 520) / 720) * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      setPixels((current) => (current.width === width && current.height === height ? current : { width, height, ratio }));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);
  const k = pixels.ratio;

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
    ctx.lineWidth = k;
    ctx.stroke();

    // 은하수: 은하 적도를 따라 넓고 옅은 띠를 세 겹으로 그립니다.
    const bandScale = Math.min(width, height) * 0.46;
    for (const [band, alpha] of [[0.34, 0.016], [0.27, 0.018], [0.2, 0.02], [0.14, 0.022], [0.09, 0.024], [0.05, 0.026]] as const) {
      ctx.strokeStyle = `rgba(200, 214, 255, ${alpha})`;
      ctx.lineWidth = band * bandScale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      let open = false;
      for (const [ra, dec] of MILKY_WAY) {
        const point = project(ra, dec, lst, view.az, view.alt, width, height);
        if (!point || point.alt < -5) {
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

    // 별: 밝을수록 크게, 색지수에 따라 색을 입힙니다. 아주 밝은 별에는 옅은 빛무리를 둡니다.
    for (const [ra, dec, mag, bv] of COLOR_STARS) {
      const point = project(ra, dec, lst, view.az, view.alt, width, height);
      if (!point || point.alt < 0) continue;
      const radius = Math.max(0.55, 2.4 - 0.42 * mag) * k;
      const color = starColor(bv);
      if (mag < 1.2) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (selectedBody) {
      ctx.strokeStyle = "#3182f6";
      ctx.lineWidth = 1.5 * k;
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
    ctx.font = `${12 * k}px "Lumen Sans", sans-serif`;
    for (const star of NAMED_STARS) {
      // 별자리를 고르지 않았으면 아주 밝은 별 이름만 써서 글자가 겹치지 않게 합니다.
      if (selected ? star.c !== selected : star.mag > 1) continue;
      const point = project(star.ra, star.dec, lst, view.az, view.alt, width, height);
      if (!point || point.alt < 0) continue;
      ctx.fillText(star.name, point.x + 6 * k, point.y);
    }

    // 행성: 별보다 조금 크게, 이름과 함께
    for (const planet of planets) {
      const point = project(planet.ra, planet.dec, lst, view.az, view.alt, width, height);
      if (!point || point.alt < 0) continue;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3 * k, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3182f6";
      ctx.font = `500 ${13 * k}px "Lumen Sans", sans-serif`;
      ctx.fillText(planet.name, point.x + 7 * k, point.y - 5 * k);
    }
  }, [hour, lst, selected, selectedBody, view, pixels, k, planets]);

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
      if (!best || best.dist > 22 * (canvas.width / Math.max(1, canvas.clientWidth))) return;
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

  // 저녁 6시부터 새벽 6시까지 10초 동안 돌려 봅니다. 움직임을 줄이는 설정이면 한 시간씩 넘깁니다.
  useEffect(() => {
    if (!playing) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let timer = 0;
    const startHour = hour >= 29.9 ? 18 : hour;
    const started = performance.now();
    const step = (now: number) => {
      const next = Math.min(30, startHour + ((now - started) / 10_000) * 12);
      setHour(next);
      if (next >= 30) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(step);
    };
    if (reduce) {
      timer = window.setInterval(() => {
        setHour((value) => {
          const next = Math.floor(value) + 1;
          if (next >= 30) setPlaying(false);
          return Math.min(30, next);
        });
      }, 700);
    } else {
      frame = requestAnimationFrame(step);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
    // 재생을 시작할 때의 시각에서 출발합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const clock = `${hourLabelShort(when)}`;

  return (
    <Screen>
      <h1>서울 밤하늘</h1>
      <p className="lede">서울시청에서 올려다본 밤하늘이에요. 화면을 끌어서 둘러보고, 별자리를 눌러 보세요.</p>
      <canvas ref={canvasRef} className="sky" width={720} height={520} aria-label="서울 밤하늘" />
      <p className="label">별 색은 실제 별의 색, 점 크기는 밝기예요. 옅은 띠는 은하수, 파란 이름은 행성이에요.</p>
      <label className="field">
        <span>시각 {clock}</span>
        <input
          type="range"
          min={18}
          max={30}
          step={0.25}
          value={hour}
          aria-label="밤 시각, 저녁 6시부터 아침 6시까지"
          onChange={(event) => {
            setPlaying(false);
            setHour(Number(event.target.value));
          }}
        />
      </label>
      <div className="actions">
        <button
          type="button"
          className="btn"
          aria-pressed={playing}
          onClick={() => {
            playTap();
            setPlaying((value) => !value);
          }}
        >
          {playing ? "멈추기" : "저녁부터 새벽까지 돌려 보기"}
        </button>
      </div>
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
