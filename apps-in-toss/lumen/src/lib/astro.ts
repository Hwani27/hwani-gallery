const DEG = Math.PI / 180;

export function julianDate(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5;
}

/** Greenwich mean sidereal time in degrees. */
export function gmstDegrees(date: Date): number {
  const d = julianDate(date) - 2_451_545.0;
  const gmst = 280.46061837 + 360.98564736629 * d;
  return ((gmst % 360) + 360) % 360;
}

export function localSiderealDegrees(date: Date, longitudeEast: number): number {
  return (gmstDegrees(date) + longitudeEast + 360) % 360;
}

export function altAz(raDeg: number, decDeg: number, latDeg: number, lstDeg: number): { alt: number; az: number } {
  const ha = ((((lstDeg - raDeg) % 360) + 540) % 360) - 180;
  const haR = ha * DEG;
  const dec = decDeg * DEG;
  const lat = latDeg * DEG;
  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(haR);
  const alt = Math.asin(Math.min(1, Math.max(-1, sinAlt)));
  const cosAlt = Math.cos(alt) || 1e-6;
  const sinAz = (-Math.cos(dec) * Math.sin(haR)) / cosAlt;
  const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (cosAlt * Math.cos(lat));
  const az = (Math.atan2(sinAz, cosAz) / DEG + 360) % 360;
  return { alt: alt / DEG, az };
}

export type SunPosition = { ra: number; dec: number; alt: number };

export function sunEquatorial(date: Date): { ra: number; dec: number } {
  const d = julianDate(date) - 2_451_545.0;
  const g = (357.529 + 0.98560028 * d) * DEG;
  const q = (280.459 + 0.98564736 * d) * DEG;
  const L = q + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const e = (23.439 - 0.00000036 * d) * DEG;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / DEG;
  const dec = Math.asin(Math.sin(e) * Math.sin(L)) / DEG;
  return { ra: (ra + 360) % 360, dec };
}

export function sunAltitude(date: Date, latDeg: number, lonDeg: number): number {
  const sun = sunEquatorial(date);
  const lst = localSiderealDegrees(date, lonDeg);
  return altAz(sun.ra, sun.dec, latDeg, lst).alt;
}

/** Unit vector from Earth toward the Sun, in ECEF kilometers. */
export function sunEcefUnit(date: Date): { x: number; y: number; z: number } {
  const sun = sunEquatorial(date);
  const ra = sun.ra * DEG;
  const dec = sun.dec * DEG;
  const x = Math.cos(dec) * Math.cos(ra);
  const y = Math.cos(dec) * Math.sin(ra);
  const z = Math.sin(dec);
  const theta = gmstDegrees(date) * DEG;
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  return { x: x * ct + y * st, y: -x * st + y * ct, z };
}
