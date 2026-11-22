# 지금 바로 멸공 — 공동작업 인수인계 (v6, 2026-11-22)

> 이 문서 하나로 다른 에이전트(Cursor · Claude Code · Codex 등)가 `main`에서 바로 이어받을 수 있게 쓴 문서다.
> 코드를 고쳤으면 **같은 커밋에서 이 문서도 같이 갱신**한다.

## 0. 한눈에

| 항목 | 값 |
|---|---|
| 저장소 | https://github.com/Hwani27/hwani-gallery (브랜치 `main`) |
| 라이브 | https://hwani27.github.io/hwani-gallery/baro-baro-myeolgong/ |
| 영어 페이지 | https://hwani27.github.io/hwani-gallery/baro-baro-myeolgong/en.html |
| 갤러리 카드 | `index.html`의 `baro-baro-myeolgong/` 카드 → `thumb.png` |
| 폴더 | `work/hwani-gallery/baro-baro-myeolgong/` (완전 독립 빌드) |
| 현재 버전 | **v6** — 세로 화면 팔·몸통·화각 + 총구 3D 조준 추적 |
| v6 커밋 | `3df8b62` — feat(myeolgong): full 1st-person arms/torso, adaptive portrait FOV, barrel tracks the aim point (v6) |
| 캐시 버스터 | `?v=6` (index.html·en.html 세 줄) |
| 로컬 실행 | `cd work/hwani-gallery && python3 -m http.server 8133` → `http://127.0.0.1:8133/baro-baro-myeolgong/index.html` |

**코드를 고치면 반드시**: `index.html`·`en.html`의 `engine.js?v=`, `gun-sfx.js?v=`, `rail.js?v=` 세 줄을 **한꺼번에** 한 단계 올린다. 안 올리면 아이폰 Safari가 옛 파일을 계속 쓴다(캐시).

## 1. 파일 지도

| 파일 | 역할 | 손댈 때 주의 |
|---|---|---|
| `index.html` | 한국어 페이지: `<canvas id="mgCanvas">` + 타이틀 오버레이(`#mgTitle`) + 스크립트 3줄 + 캐시 버스터 | 캐시 버스터 위치. `en.html`과 같은 구조를 유지 |
| `en.html` | 영어 페이지(문구만 다름) | 위와 동일하게 버전 올릴 것 |
| `engine.js` | 렌더러/씬/카메라(초기 fov 58)/조명/프레임 루프/점수 팝업/사운드 토글/리사이즈/컨텍스트 로스트 처리 | 게임 로직 없음. `RAIL.frame(ctx)`를 매 프레임 호출만 한다 |
| `rail.js` | **게임 전부**: 절차적 텍스처(`ctex`), 코스(`PATH_PTS`), 웨이브(`WAVE_DEFS`), 적 상태머신, 가림막, 아군, 픽업, 보스, HUD(canvas), 결과 화면, 1인칭 뷰모델(권총+팔+조준) | 대부분의 작업이 여기서 일어난다. 4000줄 |
| `gun-sfx.js` | 절차적 총성·재장전·폭발·피격/사망 육성 + 내장 전투 BGM | 샘플 파일 없음. 전부 합성 |
| `three.min.js` | three.js **r128** 원본 그대로 | **수정 금지** |
| `thumb.png` | 갤러리 카드 썸네일 640×360 | 화면 인상이 바뀌면 갱신 |
| `preview/*.png` | 문서용 스크린샷(`standalone-*.png`) | 선택 |
| `HANDOFF.md` | 이 문서 | **갱신 필수** |

## 2. 지금 되는 것 (검증 완료)

- 4웨이브 + 보스 1판 완주 → `작전 성공` 결과 화면 → `다시 하기` 재시작.
- 적: `hidden → peek → fire → duck` 상태머신, 가림막 뒤 은폐 중에는 피격 판정 없음, 피격 시 즉시 엄폐.
- 아군 1명이 카메라 왼쪽을 따라오며 노출된 적에게 예광탄 사격.
- 1인칭 권총 + **양팔·어깨·조끼 뷰모델**, 조준점을 따라 도는 총구.
- HD 절차적 텍스처 35종(바닥·석조 512, 천·위장·금속·가죽 256, 헬멧·폴리머 128), 이방성 8.
- 쓰러짐 4방향(뒤·앞·좌·우), 피격 육성/비명 SFX, 기름통 폭발, 픽업(탄약·보급·목숨).
- PC: 마우스 조준·좌클릭 발사·`R` 재장전 / 모바일: 탭 지점 발사·우하단 `R` 버튼.

## 3. 이번 라운드 (v6) — 세로 화면 팔·몸통·화각 + 총구 조준

사용자가 아이폰 세로 화면(390×844) 스크린샷에서 지적한 것들: 손목 커프가 허공에 뜸, 좌우 적이 잘림, 총구가 조준 방향을 안 따라감.

### 3-1. 1인칭 팔·몸통 전체 (`makePistol()`)
- 예전 뷰모델은 손 아래 위장 소매 블록 4개가 전부였다. 세로 화면은 손 아래로 0.3 m 넘게 보여서 커프가 화면 가운데에 떠 있었다.
- 이제 `손목 → 소매 커프 → 팔뚝 → 팔꿈치 → 위팔 → 어깨(견갑) → 멜빵/조끼 → 몸통`이 끊기지 않는 사슬로 이어지고, 마지막 마디는 화면 아래·옆 **밖으로** 빠져나간다.
- 소매는 상자 대신 **육각기둥**(`CylinderGeometry`, 6·8각). 위에서 내려다볼 때 널빤지가 아니라 천으로 감싼 팔처럼 보인다. 위장 텍스처는 마디 길이에 맞춰 반복을 계산해 늘어나지 않는다(`cloth()`).
- **두 그룹 분리**: `aim`(권총·양손·양 팔뚝·팔꿈치) 은 **오른팔 팔꿈치 축**으로 돌고, `body`(위팔·어깨·조끼·몸통) 는 몸통에 붙어 있다. 조준으로 팔이 크게 돌아도 오른 어깨는 팔꿈치가 축이라 벌어지지 않고, 왼쪽 위팔은 매 프레임 `어깨 → (움직인) 팔꿈치`로 다시 맞춘다(길이만 살짝 늘어남).
- 검증용 표식: 마지막 마디 메시에 `userData.armEnd = 1`.

### 3-2. 세로 화면 가로 화각 유지 (`viewFov()`)
- `camera.fov`는 **세로** 각도다. 세로 화면에서 58~60°를 그대로 쓰면 가로 화각이 **29.9°**까지 줄어 좌우 적이 화면 밖으로 밀린다.
- 세로(`aspect < 1`)에서는 `vfov = 2·atan(tan(76°/2) / aspect)` 로 가로 76°를 유지하려 하고 **52~82°로 클램프**. 390×844 → `vfov 82°` → 가로 **43.8°**(+47%).
- `aspect`가 1에 가까워지면 58°로 부드럽게 수렴(회전 시 튐 없음). 가로(`aspect >= 1`)는 기존 58° 그대로.
- 적 좌우 배치 한계(`halfTan()`)도 같은 함수를 쓰므로 화각을 바꾸면 적 배치 폭도 같이 바뀐다.

### 3-3. 뷰모델 위치·크기 (프레임 루프)
- 세로에서는 리그를 `0.13·(1-aspect)` 만큼 아래로 내리고, `1 + 0.8·(1-aspect)` 만큼 키운다(390×844: scale 0.154 → **0.22**, y −0.303). 가로는 기존 값 그대로.

### 3-4. 총구가 조준점을 따라감
- `fire()`가 쓰는 것과 **같은 조준 레이**로 목표점을 잡는다: 레이 위에 노출된 적이 있으면 그 가슴(2.5~34 m), 없으면 레이 26 m 지점.
- 발사해서 명중하면 그 **실제 명중 좌표**(`hit.at`)를 140 ms 동안 목표로 삼아 총구가 그 점으로 스냅한다.
- 총구는 팔꿈치 축보다 0.77 위에 떠 있으므로, 목표 방향을 **총구 위치에서 다시 계산하는 2회 반복**으로 풀어 총열 선이 목표를 실제로 지나가게 한다.
- 각도는 `yaw ±0.52 rad(±30°)`, `pitch −0.30~+0.42 rad` 로 클램프(어깨가 따라갈 수 있는 범위). 12/s 슬레프로 부드럽게 추종, 발사 순간만 즉시 스냅. 반동은 조준 회전 위에 x축으로 더한다.
- 실측: 조준점을 화면 왼쪽 끝(6%, 42%)으로 옮기면 `yaw 0.352 rad`, **총열 방향과 총구→목표 방향의 오차 0.55°**(26 m에서 0.25 m). 가운데 0.84°, 오른쪽 0.59°.

### 3-5. v6 검증 (headless Chromium + swiftshader)
| 시나리오 | 결과 |
|---|---|
| 1280×720 1판 완주 | `작전 성공` ★★★, 콘솔·페이지 오류 **0**, `__railErrs` 0, 텍스처 35종 |
| 390×844 1판 완주 | `작전 성공` ★★★, 오류 0, HUD 잘림 없음 |
| en.html 1280×720 1판 완주 | `MISSION CLEAR` ★★★, 오류 0 |
| 팔 끝단 화면 노출 | 390×844·360×800·320×1000·1280×720 모두 `R-arm-end`·`L-arm-end` `on:false` |
| 세로 화각 | 82°(가로 43.8°) / 가로 58°(가로 89.4°) |
| 총구 조준 오차 | 왼쪽 0.55° · 가운데 0.84° · 오른쪽 0.59° |
| 적 노출 | 세로 웨이브1 6명 전원 화면 안(`ndc x −0.72…0.71`) |

스크린샷: `downloads/myeolgong_v6_portrait.png`(390×844), `downloads/myeolgong_v6_landscape.png`(1280×720).
조준 확인용: `devtools/v6pl-left.png`·`v6pl-right.png`(세로), `v6ls-left.png`(가로).

## 4. 직전 라운드 (v5) — HD 텍스처 · 쓰러짐 다양화 · 육성

### 4-1. 고해상도 절차적 텍스처 (`rail.js`)
- 해상도: 바닥·석조·콘크리트·목재·조약돌 `512×512`(이전 128~256), 천(burlap/weave)·위장복·기름통·금속·가죽 `256`, 얼굴 `256`, 헬멧 `128`.
- 권총 그립 `32→256`: 다이아몬드 체커링·마모·사출 자국·나사 구멍. 그립 박스가 0.10×0.24 m로 세로 2.4배 늘어나므로 `repeat(1, 2.2)`.
- 브러시드 스틸 신규(`metalTex`), 폴리머 프레임 `polymerTex`, 부츠·벨트 `leatherTex`.
- 벽 타일: `tiledMat(mat, w, h)`로 한 타일 = 2.4 m 기준 반복(안 하면 돌줄이 세로 줄무늬로 늘어난다).
- 이방성: `MAXANISO = min(8, GPU)`를 `begin()`에서 잡고 `applyAniso()`가 캐시 텍스처까지 다시 스탬프.
- 첫 `begin()`에서 34종 생성 **108 ms**(이후 캐시).

### 4-2. 쓰러지는 방향 다양화 (`killPost()` + 프레임 루프 `---- dying ----`)
- 적마다 `back/fwd/left/right` 무작위 — 뒤·앞은 `rotation.x`, 좌·우는 `rotation.z`. 보스는 항상 뒤로.
- 킬마다 `spin`(±0.62 rad)·`lean`·`side`가 달라 같은 방향도 자세가 겹치지 않는다.
- 총구 반대 방향으로 0.28~0.70 m 밀리며, 42% 구간에서 빠르게 넘어지고 나머지에서 가라앉는다. 침하는 0.1 m 이하.

### 4-3. 피격·사망 육성 (`gun-sfx.js` `playHitGrunt(fatal)`)
- 샘플 없이 포먼트 합성(톱니 글로털 + 피치 엔벨로프 + 비브라토 + 3밴드 포먼트 + 숨소리).
- 비치명 `"윽!"` 0.22~0.28초, 피치 0.88~1.15배 / 치명 `"으악!"` 0.62~0.74초, 피치가 1.26→0.42배.
- 45/70 ms 쿨다운, 동시 4개 제한. `window.__grunts` / `__gruntsFatal`로 검증.

## 5. 그 이전 (v4 이하 요약)
- **v4**: 1인칭 권총 정조준, 카메라 정면 + 좌/중/우 적 배치, 적이 플레이어를 바라봄, 은폐→피킹→사격→엄폐 상태머신, 꺾이는 비선형 레일(`PATH_PTS` 스플라인), 아군 합류 사격, 성문 아치·골목 차양·발코니 등 배경 보강, 점수 팝업을 화면 좌표로.
- **v3**: 군사 리스킨(블록 병사·가림막·기름통), HUD·결과 화면.
- **v2**: 레일 슈터 골격(`baro-baro-jump` 엔진 위에 얹었다가 이후 완전 분리).
- **v1**: `baro-baro-jump` HTML을 fetch/DOMParser로 재파싱해 쓰던 시절 → **지금은 금지된 구조**. 독립 빌드로 되돌리지 말 것.

## 6. 알려진 다듬을 거리 (사용자 제보 포함)

1. **음수 점수 표기** — `drawHud()`의 `score = (neg ? "-" : "") + String(scv).padStart(neg ? 6 : 7, "0")`. `FONT` 맵에는 `-` 글리프가 없어(숫자·A~Z만) 마이너스가 그려지지 않고, 음수일 때 자리수도 6자리로 줄어 숫자가 밀린다. 사용자는 `000-250` 같은 표기를 봤다고 제보. → `FONT`에 `-` 추가 + 음수/양수 자리수 통일(7자리) + 결과 카드 점수 포맷도 함께 확인.
2. **카운트다운에 `0.7` 같은 소수 문자열** — 사용자 제보. `drawHud()`의 `time`은 `Math.ceil(clock)`이라 정수여야 하는데 소수가 보임. `clock`을 반올림 없이 blit하는 다른 경로나 결과 카드/점수 팝업에서 소수가 새는지 확인(검증 전).
3. **보스 메시가 결과 화면 뒤에 남음** — `#railResult`의 배경이 `rgba(4,8,16,.72)` 반투명이라 결과 카드 뒤로 보스/월드가 비친다. 결과 표시 전에 씬 정리 또는 오버레이 불투명도 상향.
4. **스테이지 1-2 이후 없음** — 지금은 1-1 한 판 + 보스. 다음 스테이지는 각자 `PATH_PTS` + `WAVE_DEFS` 묶음으로 추가.
5. **수류탄 없음**, 랭킹/기록 저장 없음(`localStorage` 새로 구현), 입대 튜토리얼·서울→DMZ→개성→평양 스토리 없음.

## 7. 검증하는 법

1. `cd work/hwani-gallery && python3 -m http.server 8133`
2. 헤드리스(Chromium+Playwright 권장, `--use-gl=swiftshader --enable-unsafe-swiftshader --no-sandbox`)로 **390×844(세로)** 와 **1280×720(가로)** 두 번:
   - `#mgStart` 클릭 → `window.__railDbg.phase`가 `fight`가 될 때까지 대기 → 스크린샷.
   - 체크: 콘솔·페이지 오류 0, `window.__railErrs.length === 0`, `__frameErr`/`__beginErr`/`__dressErr` 모두 null.
3. **팔 끝단**: 아래를 콘솔에서 실행해 모두 `false`여야 한다.
   ```js
   (() => { const cam = __railCtx.camera, out = [];
     __pistol.traverse(o => { if (o.isMesh && o.userData.armEnd) {
       const v = new THREE.Vector3(); o.getWorldPosition(v); const r = v.project(cam);
       out.push([o.name, Math.abs(r.x) < 0.99 && Math.abs(r.y) < 0.99 && r.z < 1]); } });
     return out; })()   // [['R-arm-end', false], ['L-arm-end', false]]
   ```
4. **조준**: `pointermove`를 화면 왼쪽 끝으로 보낸 뒤 1.2초 뒤
   ```js
   __gunAim   // {yaw: +0.35, pitch: 0.14}  (왼쪽을 보면 yaw > 0)
   __aimTarget.distanceTo(총구)  // 레이 26 m 지점
   ```
   총열과 `총구→__aimTarget` 방향의 각도 오차가 **1° 이내**면 정상.
5. **화각**: `__railCtx.camera.fov` — 세로 82, 가로 58.

디버그 훅: `__railDbg`(phase/waveI/u/cam/posts/exposed/states/ally/falls/grunts), `__aimSpot`, `__pistol`, `__pistolAim`, `__pistolBody`, `__gunAim`, `__aimTarget`, `__aimN`, `__posts`, `__railSpeed`(시간 배속).

## 8. 협업 규칙

1. **`baro-baro-jump/` · `fight-right-now/` · `*-privacy/` 는 절대 수정하지 않는다.** 이 게임은 `baro-baro-myeolgong/` 안에서만 산다.
2. **엔진 HTML을 fetch/`DOMParser`로 재파싱하지 않는다.** 필요한 3D 부품은 `three.min.js` + 이 게임 코드로만.
3. `three.min.js`는 r128 원본 그대로 둔다.
4. 그래픽 톤: 도트 아님, 블록(복셀) 3D. 새 소품도 상자·기둥 조합으로.
5. 코드를 고치면 **캐시 버스터 3줄 + 이 HANDOFF.md**를 같은 커밋에서 갱신하고, **390×844·1280×720 둘 다** 검증한다.
6. 커밋 메시지는 기존 스타일: `feat(myeolgong): ...`, `fix(myeolgong): ...`. 큰 변경은 브랜치 + PR(과거 `feat/myeolgong-military-reskin` → PR #10 사례).
7. 화면 인상이 바뀌면 `thumb.png`와 `preview/*.png`도 갱신.
8. `Saltline (Copy).html`은 라이선스 불명 — 방식만 참고하고 코드를 복사하지 않는다.

## 9. 구조 메모 (다음에 손댈 때)

- **텍스처**: `ctex(key, w, h, draw)`가 캐시. 512(바닥·석조·목재·조약돌)·256(천·위장복·금속·가죽·얼굴)·128(헬멧·폴리머). 큰 박스는 `tiledMat()`(타일 1장 = 2.4 m).
- **이방성**: `MAXANISO`는 `begin()`에서 GPU 값(최대 8). 새 텍스처는 반드시 `ctex` 경유.
- **화각**: `viewFov()` 하나만 고치면 된다. 세로에서 가로 76° 유지 → 52~82° 클램프.
- **뷰모델**: `makePistol()`이 `g`(위치·스케일) 아래 `aim`(회전·조준)과 `body`(고정)를 만든다. 총·손 위치를 바꾸면 `pistolPivot`(오른팔 팔꿈치)과 왼팔 재맞춤 좌표(프레임 루프의 `tmpV.set(-0.366,-0.705,0.405)`, `tmpT3.set(-0.575,-1.1,0.78)`)도 같이 고쳐야 한다.
- **조준 목표**: 프레임 루프의 `---- point the barrel ----` 블록.
- **사망 연출**: `killPost()`가 `p.fall = {dir, spin, push, kx/kz, lean, side}`, `---- dying ----` 블록이 소비.
- **육성**: `GunSFX.playHitGrunt(fatal)` 하나만 호출(`grunt(fatal)` 래퍼 경유).
- **웨이브**: `WAVE_DEFS`(hold/yaw/look/time/members/picks). 멤버는 `{role, lat, dep, elev, cover}`, `cover`는 `sandbag|crate|crates|barrier|bunker|door|truckbed|heavy|rail`.
- **경로**: `PATH_PTS`(x,z) 스플라인. 정지점은 각 `hold`에 가장 가까운 경로점으로 스냅.
- **재시작**: `RAIL.begin(ctx)`가 코스·웨이브·픽업·가림막을 지우고 다시 짓는다(`clearStage` → `buildWaves`/`buildPickups`/`dressBattlefield`). 뷰모델은 `boot()`에서 한 번만 만든다.

## 10. 다음 에이전트용 시작 프롬프트

"Hwani27/hwani-gallery의 `baro-baro-myeolgong/`은 완전 독립 빌드다(`index.html`/`en.html` + `three.min.js` + `engine.js` + `gun-sfx.js` + `rail.js`). `baro-baro-jump/`를 fetch하거나 DOMParser로 재파싱하는 구조로 되돌리지 마라. `baro-baro-jump/`, `fight-right-now/`, 개인정보 페이지는 수정 금지. 화각은 `viewFov()`(세로에서 가로 76° 유지, 52~82° 클램프), 뷰모델은 `makePistol()`의 `aim`/`body` 분리 구조이고 총구 조준은 프레임 루프의 `---- point the barrel ----` 블록에서 매 프레임 푼다. 레일은 `PATH_PTS` 스플라인 + `WAVE_DEFS`, 적은 `hidden/peek/fire/duck` 상태머신이며 은폐 중에는 피격 판정이 없다. 고친 뒤에는 캐시 버스터 3줄과 이 `HANDOFF.md`를 같은 커밋에서 갱신하고, 390×844·1280×720 두 화면비에서 오류 0과 팔 끝단 화면 밖(`userData.armEnd`)을 확인해라. 스크린샷과 함께 `main`에 푸시하고 GitHub Pages 반영을 확인해라."
