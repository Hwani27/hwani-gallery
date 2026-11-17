#!/usr/bin/env python3
"""앱에 들어가는 글자만 남겨 글꼴을 다시 만듭니다.

원본: IBM Plex Sans KR 1.1.0 (@ibm/plex-sans-kr, SIL OFL 1.1).
OFL 의 예약 글꼴 이름(Plex)을 지키려고, 줄인 글꼴은 이름을 "Lumen Sans" 로 바꿉니다.

  python3 scripts/subset-fonts.py          # src 의 글자를 모아 글꼴을 다시 만듭니다
  python3 scripts/subset-fonts.py --check  # 빠진 글자가 있으면 실패합니다

fonttools 와 brotli 가 필요합니다: pip install fonttools brotli
"""
import pathlib
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "node_modules/@ibm/plex-sans-kr/fonts/complete/woff2/hinted"
OUT = ROOT / "src/assets/fonts"
WEIGHTS = {"400": ("Regular", "IBMPlexSansKR-Regular.woff2"), "500": ("Medium", "IBMPlexSansKR-Medium.woff2")}


def app_text() -> str:
    files = [ROOT / "index.html"]
    for pattern in ("*.ts", "*.tsx", "*.css"):
        files += list((ROOT / "src").rglob(pattern))
    text = "".join(path.read_text(encoding="utf-8") for path in files)
    # 숫자와 기본 문장부호는 계산 결과로 나오므로 항상 넣습니다.
    basics = "".join(chr(code) for code in range(0x20, 0x7F)) + "·…–—‘’“”%°×÷"
    return "".join(sorted({ch for ch in text + basics if ch.isprintable()}))


def check() -> int:
    wanted = {ch for ch in app_text() if ord(ch) > 0x7F}
    missing = {}
    for weight in WEIGHTS:
        cmap = TTFont(OUT / f"lumen-sans-{weight}.woff2").getBestCmap()
        gap = "".join(sorted(ch for ch in wanted if ord(ch) not in cmap and not ch.isspace()))
        if gap:
            missing[weight] = gap
    if missing:
        print("글꼴에 없는 글자:", missing, "→ npm run fonts 로 다시 만드세요.")
        return 1
    print(f"글꼴 확인: {len(wanted)}자 모두 있음")
    return 0


def build() -> None:
    text = app_text()
    for weight, (style, file_name) in WEIGHTS.items():
        options = subset.Options()
        options.flavor = "woff2"
        options.layout_features = ["*"]
        options.name_IDs = ["*"]
        options.name_languages = ["*"]
        font = TTFont(SOURCE / file_name)
        subsetter = subset.Subsetter(options)
        subsetter.populate(text=text)
        subsetter.subset(font)
        names = font["name"]
        for record in list(names.names):
            if record.nameID in (1, 16):
                names.setName("Lumen Sans", record.nameID, record.platformID, record.platEncID, record.langID)
            elif record.nameID == 4:
                names.setName(f"Lumen Sans {style}", 4, record.platformID, record.platEncID, record.langID)
            elif record.nameID == 6:
                names.setName(f"LumenSans-{style}", 6, record.platformID, record.platEncID, record.langID)
        target = OUT / f"lumen-sans-{weight}.woff2"
        font.flavor = "woff2"
        font.save(target)
        print(f"{target.relative_to(ROOT)}: {target.stat().st_size:,} bytes")


if __name__ == "__main__":
    if "--check" in sys.argv:
        sys.exit(check())
    build()
    sys.exit(check())
