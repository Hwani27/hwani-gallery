import * as THREE from "three";

type LonLat = readonly [number, number];

const LAND: LonLat[][] = [
  [
    [-10, 35], [-5, 36], [10, 37], [11, 33], [20, 32], [25, 32], [32, 31], [35, 31], [34, 28], [43, 12], [51, 12], [43, -2], [40, -15], [35, -20], [32, -26], [28, -33], [20, -35], [18, -32], [14, -22], [12, -18], [13, -8], [9, 4], [8, 13], [-5, 5], [-10, 6], [-16, 12], [-17, 21], [-16, 28], [-10, 32],
  ],
  [
    [-9, 42], [-8, 37], [-1, 36], [3, 36], [10, 44], [16, 41], [19, 40], [28, 41], [29, 45], [22, 55], [12, 55], [5, 52], [-2, 48], [-9, 43],
  ],
  [
    [28, 41], [36, 36], [44, 40], [48, 42], [52, 42], [60, 38], [68, 25], [72, 25], [78, 10], [80, 15], [88, 22], [92, 22], [98, 16], [104, 2], [109, -1], [104, 12], [108, 21], [120, 22], [122, 30], [129, 35], [132, 43], [141, 45], [142, 40], [128, 33], [122, 31], [120, 37], [112, 42], [104, 50], [88, 48], [70, 55], [60, 60], [40, 68], [30, 70], [44, 60], [40, 50], [28, 45],
  ],
  [
    [113, -22], [128, -14], [138, -14], [146, -18], [153, -25], [150, -35], [138, -35], [128, -32], [115, -34], [114, -26],
  ],
  [
    [-168, 66], [-158, 71], [-140, 70], [-130, 70], [-105, 68], [-88, 64], [-70, 60], [-64, 58], [-56, 52], [-64, 46], [-70, 42], [-80, 25], [-97, 26], [-106, 22], [-105, 30], [-114, 32], [-125, 48], [-125, 40], [-124, 49], [-140, 60], [-166, 66],
  ],
  [
    [-80, 8], [-77, 7], [-67, 10], [-62, 8], [-50, 0], [-35, -5], [-35, -15], [-40, -22], [-48, -28], [-62, -40], [-68, -52], [-75, -52], [-72, -40], [-70, -18], [-78, -5], [-80, 0],
  ],
  [
    [-45, 72], [-40, 76], [-20, 74], [-20, 70], [-44, 60], [-50, 66],
  ],
];

function project(lon: number, lat: number, width: number, height: number): [number, number] {
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}

function fillRings(ctx: CanvasRenderingContext2D, color: string, width: number, height: number) {
  ctx.fillStyle = color;
  for (const ring of LAND) {
    ctx.beginPath();
    ring.forEach(([lon, lat], index) => {
      const [x, y] = project(lon, lat, width, height);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  }
}

function canvas(width: number, height: number): HTMLCanvasElement {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  return element;
}

export function makeEarthTextures(): { day: THREE.CanvasTexture; night: THREE.CanvasTexture } {
  const width = 1024;
  const height = 512;
  const day = canvas(width, height);
  const dayCtx = day.getContext("2d");
  if (!dayCtx) throw new Error("canvas");
  dayCtx.fillStyle = "#1d4e89";
  dayCtx.fillRect(0, 0, width, height);
  fillRings(dayCtx, "#3e6b4f", width, height);
  dayCtx.fillStyle = "#d8e2ea";
  dayCtx.beginPath();
  dayCtx.ellipse(width * 0.5, 28, 150, 18, 0, 0, Math.PI * 2);
  dayCtx.ellipse(width * 0.5, height - 24, 170, 16, 0, 0, Math.PI * 2);
  dayCtx.fill();

  const night = canvas(width, height);
  const nightCtx = night.getContext("2d");
  if (!nightCtx) throw new Error("canvas");
  nightCtx.fillStyle = "#05070d";
  nightCtx.fillRect(0, 0, width, height);
  fillRings(nightCtx, "#10151f", width, height);
  const cities: LonLat[] = [
    [127, 37.5],
    [139.7, 35.7],
    [116.4, 39.9],
    [103.8, 1.3],
    [151.2, -33.9],
    [-74, 40.7],
    [-118.2, 34],
    [-87.6, 41.9],
    [-46.6, -23.5],
    [-0.1, 51.5],
    [2.3, 48.9],
    [37.6, 55.8],
    [28.9, 41],
    [31.2, 30],
    [18.4, -33.9],
    [36.8, -1.3],
    [72.8, 19],
    [77.2, 28.6],
    [121, 14.6],
    [-99.1, 19.4],
  ];
  nightCtx.fillStyle = "#ffe7a3";
  for (const [lon, lat] of cities) {
    const [x, y] = project(lon, lat, width, height);
    nightCtx.beginPath();
    nightCtx.arc(x, y, 3.5, 0, Math.PI * 2);
    nightCtx.fill();
  }

  const dayTex = new THREE.CanvasTexture(day);
  const nightTex = new THREE.CanvasTexture(night);
  for (const tex of [dayTex, nightTex]) {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
  }
  return { day: dayTex, night: nightTex };
}

export function makeSunTexture(): THREE.CanvasTexture {
  const size = 256;
  const element = canvas(size, size);
  const ctx = element.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#f0b429";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 180; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 4 + Math.random() * 14;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 236, 180, 0.45)" : "rgba(196, 92, 28, 0.28)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(element);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
