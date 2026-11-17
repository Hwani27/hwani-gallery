import { gmstDegrees, sunAltitude, sunEcefUnit } from "./astro";

export const SEOUL = { name: "서울시청", lat: 37.5663, lon: 126.9779 };

const EARTH_RADIUS_KM = 6371;
const ISS_RADIUS_KM = 6771;
const INC = (51.64 * Math.PI) / 180;
const PERIOD_SEC = 92.68 * 60;
/** Reference epoch for the bundled circular orbit. Not a live TLE. */
const EPOCH_MS = Date.UTC(2026, 10, 17, 0, 0, 0);
const RAAN0 = (210 * Math.PI) / 180;
const U0 = 0.4;

export type Ecef = { x: number; y: number; z: number };

export type IssFix = {
  lat: number;
  lon: number;
  altKm: number;
  speedKmS: number;
  ecef: Ecef;
};

export function issFix(at: Date): IssFix {
  const dt = (at.getTime() - EPOCH_MS) / 1000;
  const u = U0 + ((2 * Math.PI) / PERIOD_SEC) * dt;
  const r = ISS_RADIUS_KM;
  const cu = Math.cos(u);
  const su = Math.sin(u);
  const cO = Math.cos(RAAN0);
  const sO = Math.sin(RAAN0);
  const ci = Math.cos(INC);
  const si = Math.sin(INC);
  const x = r * (cO * cu - sO * su * ci);
  const y = r * (sO * cu + cO * su * ci);
  const z = r * (su * si);
  const theta = (gmstDegrees(at) * Math.PI) / 180;
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const xe = x * ct + y * st;
  const ye = -x * st + y * ct;
  const ze = z;
  return {
    lat: (Math.atan2(ze, Math.hypot(xe, ye)) * 180) / Math.PI,
    lon: (Math.atan2(ye, xe) * 180) / Math.PI,
    altKm: r - EARTH_RADIUS_KM,
    speedKmS: (2 * Math.PI * r) / PERIOD_SEC,
    ecef: { x: xe, y: ye, z: ze },
  };
}

export function lookAngles(latDeg: number, lonDeg: number, sat: Ecef): { elev: number; az: number; rangeKm: number } {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const r = EARTH_RADIUS_KM;
  const ox = r * Math.cos(lat) * Math.cos(lon);
  const oy = r * Math.cos(lat) * Math.sin(lon);
  const oz = r * Math.sin(lat);
  const dx = sat.x - ox;
  const dy = sat.y - oy;
  const dz = sat.z - oz;
  const range = Math.hypot(dx, dy, dz) || 1;
  const elev = Math.asin((dx * ox + dy * oy + dz * oz) / (range * r));
  const eastx = -Math.sin(lon);
  const easty = Math.cos(lon);
  const northx = -Math.sin(lat) * Math.cos(lon);
  const northy = -Math.sin(lat) * Math.sin(lon);
  const northz = Math.cos(lat);
  const east = dx * eastx + dy * easty;
  const north = dx * northx + dy * northy + dz * northz;
  const az = (Math.atan2(east, north) * 180) / Math.PI;
  return { elev: (elev * 180) / Math.PI, az: (az + 360) % 360, rangeKm: range };
}

function inSunlight(sat: Ecef, sun: Ecef): boolean {
  const along = sat.x * sun.x + sat.y * sun.y + sat.z * sun.z;
  if (along > 0) return true;
  const r2 = sat.x * sat.x + sat.y * sat.y + sat.z * sat.z;
  const radial = Math.sqrt(Math.max(0, r2 - along * along));
  return radial > EARTH_RADIUS_KM;
}

export type Pass = {
  start: number;
  end: number;
  maxElevation: number;
  fromAz: number;
  toAz: number;
  visible: boolean;
};

export function upcomingPasses(from: Date, days = 3): Pass[] {
  const step = 30_000;
  const end = from.getTime() + days * 86_400_000;
  const passes: Pass[] = [];
  let current: Pass | null = null;
  for (let t = from.getTime(); t <= end; t += step) {
    const when = new Date(t);
    const fix = issFix(when);
    const look = lookAngles(SEOUL.lat, SEOUL.lon, fix.ecef);
    if (look.elev > 0) {
      const sunUp = sunAltitude(when, SEOUL.lat, SEOUL.lon);
      const lit = inSunlight(fix.ecef, sunEcefUnit(when));
      const visible = look.elev >= 10 && sunUp < -6 && lit;
      if (!current) {
        current = { start: t, end: t, maxElevation: look.elev, fromAz: look.az, toAz: look.az, visible };
      } else {
        current.end = t;
        current.toAz = look.az;
        if (look.elev > current.maxElevation) current.maxElevation = look.elev;
        current.visible = current.visible || visible;
      }
    } else if (current) {
      passes.push(current);
      current = null;
    }
  }
  if (current) passes.push(current);
  return passes;
}
