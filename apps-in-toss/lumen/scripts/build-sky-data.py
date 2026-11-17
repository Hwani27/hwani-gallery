#!/usr/bin/env python3
"""d3-celestial 데이터(BSD-3-Clause)에서 별과 별자리 선을 뽑아 src/data/skyStars.ts 를 만듭니다.

  npm pack d3-celestial && tar xzf d3-celestial-*.tgz
  python3 scripts/build-sky-data.py package/data

- 별: 4.5등급까지, [적경, 적위, 등급, B-V 색지수]
- 추가 별자리 12개의 선과 대표 별 이름
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = pathlib.Path(sys.argv[1])
NEW = ["And", "Per", "Aur", "CMi", "Boo", "Vir", "Her", "CrB", "Sgr", "Cep", "Ari", "Dra"]
# 대표 별: Hipparcos 번호 → 한국어 이름
NAMES = {
    24608: ("카펠라", "Aur"), 37279: ("프로키온", "CMi"), 69673: ("아르크투루스", "Boo"),
    65474: ("스피카", "Vir"), 15863: ("미르팍", "Per"), 14576: ("알골", "Per"),
    677: ("알페라츠", "And"), 76267: ("알페카", "CrB"), 9884: ("하말", "Ari"),
    105199: ("알데라민", "Cep"), 90185: ("카우스 아우스트랄리스", "Sgr"), 87833: ("엘타닌", "Dra"),
    68756: ("투반", "Dra"), 80816: ("코르네포로스", "Her"),
}


def ra(lon: float) -> float:
    return round(lon + 360 if lon < 0 else lon, 3)


stars = json.loads((DATA / "stars.6.json").read_text())["features"]
field = []
by_hip = {}
for star in stars:
    lon, lat = star["geometry"]["coordinates"]
    mag = star["properties"]["mag"]
    try:
        bv = round(float(star["properties"]["bv"]), 2)
    except (TypeError, ValueError):
        bv = 0.6
    by_hip[star["id"]] = (ra(lon), round(lat, 3), mag)
    if mag <= 4.5:
        field.append([ra(lon), round(lat, 3), mag, bv])
field.sort(key=lambda s: s[2])

lines = {}
for feature in json.loads((DATA / "constellations.lines.json").read_text())["features"]:
    if feature["id"] in NEW:
        lines[feature["id"]] = [[[ra(lon), round(lat, 3)] for lon, lat in line] for line in feature["geometry"]["coordinates"]]

centers = {}
for feature in json.loads((DATA / "constellations.json").read_text())["features"]:
    if feature["id"] in NEW:
        lon, lat = feature["geometry"]["coordinates"]
        centers[feature["id"]] = [ra(lon), round(lat, 2)]

named = []
for hip, (name, constellation) in NAMES.items():
    if hip not in by_hip:
        raise SystemExit(f"HIP {hip} not found")
    r, d, m = by_hip[hip]
    named.append({"name": name, "ra": r, "dec": d, "mag": m, "c": constellation})

missing = [c for c in NEW if c not in lines]
if missing:
    raise SystemExit(f"missing lines: {missing}")

out = ROOT / "src/data/skyStars.ts"
out.write_text(
    "/* d3-celestial(BSD-3-Clause, Olaf Frohn) 의 Hipparcos 별 자료에서 만든 파일입니다. scripts/build-sky-data.py 로 다시 만듭니다. */\n"
    "/** [적경, 적위, 등급, B-V 색지수]. 4.5등급까지. */\n"
    f"export const COLOR_STARS: readonly (readonly [number, number, number, number])[] = {json.dumps(field, separators=(',', ':'))};\n\n"
    f"export const EXTRA_LINES: Readonly<Record<string, readonly (readonly (readonly [number, number])[])[]>> = {json.dumps(lines, separators=(',', ':'))};\n\n"
    f"export const EXTRA_CENTERS: Readonly<Record<string, readonly [number, number]>> = {json.dumps(centers)};\n\n"
    f"export const EXTRA_NAMED = {json.dumps(named, ensure_ascii=False)} as const;\n",
    encoding="utf-8",
)
print(f"{out.relative_to(ROOT)}: {len(field)} stars, {len(lines)} constellations, {out.stat().st_size:,} bytes")
