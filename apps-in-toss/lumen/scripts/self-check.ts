import { altAz, localSiderealDegrees, sunAltitude } from "../src/lib/astro.ts";
import { SEOUL, issFix, lookAngles, upcomingPasses } from "../src/lib/iss.ts";
import { modelMeters, WEIGHT_BODIES } from "../src/data/planets.ts";
import { formatDuration, formatLength } from "../src/lib/format.ts";

const polaris = altAz(37.954, 89.264, SEOUL.lat, localSiderealDegrees(new Date("2026-11-17T12:00:00+09:00"), SEOUL.lon));
if (Math.abs(polaris.alt - SEOUL.lat) > 1.2) {
  throw new Error(`Polaris altitude ${polaris.alt} is far from latitude ${SEOUL.lat}`);
}

const noon = sunAltitude(new Date("2026-06-21T12:30:00+09:00"), SEOUL.lat, SEOUL.lon);
const night = sunAltitude(new Date("2026-11-17T21:00:00+09:00"), SEOUL.lat, SEOUL.lon);
if (noon < 40) throw new Error(`June noon sun too low: ${noon}`);
if (night > -10) throw new Error(`November 21:00 sun not down: ${night}`);

const a = issFix(new Date("2026-11-17T00:00:00Z"));
const b = issFix(new Date("2026-11-17T01:32:48Z"));
if (Math.abs(a.lat) > 52 || Math.abs(b.lat) > 52) throw new Error("ISS latitude out of range");
const lonDelta = Math.abs((((b.lon - a.lon) % 360) + 540) % 360 - 180);
if (lonDelta < 10) throw new Error(`ISS ground track barely moved: ${a.lon} -> ${b.lon}`);

const moon = WEIGHT_BODIES.find((body) => body.id === "moon");
if (!moon || Math.abs(moon.ratio * 30 - 4.98) > 0.05) throw new Error("moon weight");
if (formatDuration(500) !== "8분 20초") throw new Error(formatDuration(500));
const moonMeters = modelMeters(384400);
if (Math.abs(moonMeters - 6.63) > 0.05) throw new Error(`moon model ${moonMeters}`);
if (formatLength(moonMeters) !== "6.6m") throw new Error(formatLength(moonMeters));

const passes = upcomingPasses(new Date("2026-11-17T00:00:00+09:00"), 1);
if (passes.length < 5) throw new Error(`expected several ISS passes, got ${passes.length}`);
const overhead = lookAngles(SEOUL.lat, SEOUL.lon, a.ecef);
if (overhead.elev > 90 || overhead.elev < -90) throw new Error("bad elevation");

console.log(JSON.stringify({
  polarisAlt: Number(polaris.alt.toFixed(2)),
  noon: Number(noon.toFixed(1)),
  night: Number(night.toFixed(1)),
  iss: { lat: Number(a.lat.toFixed(1)), lon: Number(a.lon.toFixed(1)), laterLon: Number(b.lon.toFixed(1)) },
  passes: passes.length,
  moonMeters: Number(moonMeters.toFixed(2)),
}, null, 2));
