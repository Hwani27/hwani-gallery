# 부장님 몰래 딴짓하기 · Slacking Off 3D

18:00 칼퇴까지 부장님 눈을 피해 **딴짓 게이지 100%**를 채우는 3일 생존 눈치 게임.
2026-11 3D 복셀 업그레이드: 상단 사무실과 중앙 '딴짓 창'이 모두 Three.js 복셀 3D로 렌더링된다.

## 플레이
- 모니터(중앙 3D 미니게임)를 연타 → 딴짓 게이지 UP. 화면마다 다른 3D 딴짓:
  - 월요일: 복셀 잼인턴이 점프하며 코인·별 획득
  - 수요일: 코인 차트에 코인탄을 사격해 바를 올리기
  - 금요일: 핫딜 선물 박스를 망치로 격파
- `[일하는 척!]`을 꾹(PC는 Space) → `Q4_매출보고서_최종_진짜최종.xlsx`로 위장, 업무 척도 게이지 상승
- 부장님 감시(경고) 중 위장+척도 55%↑ = 통과 / 딴짓 중 = 발각 / 18:00까지 100% 미달 = 야근

## 3D 구성 (`js/`)
- `three.min.js` — 로컬 Three.js r128 (외부 CDN 없음)
- `textures.js` — Poly Haven CC0 실사 텍스처(512px WebP) 비동기 로더·적용기
- `voxel.js` — 복셀 박스·사람(머리/눈/안경/정장·넥타이/팔다리 피벗)·이름표·파편 빌더
- `scene3d.js` — `OfficeScene`(사무실·잼부장/잼사장/잼대리 걷기·감시·발각 줌인) + `MiniScene`(3D 미니게임) + `Slack3D` 루프
- `game.js` — 기존 게임 로직 유지, 시각 연출만 3D 씬에 위임

## CC0 실사 텍스처 (`textures/`)
Poly Haven CC0 텍스처 9세트를 512px WebP(diffuse/normal/roughness)로 경량화해(합계 약 680KB) 넣었다.
첫 프레임은 기존 단색·캔버스 재질 그대로 그리고, 파일이 도착하는 순간 `map`/`normalMap`/`roughnessMap`만 갈아 끼운다.

| 위치 | 텍스처 |
| --- | --- |
| 사무실 바닥 타일 | `interior_tiles` |
| 복도 카펫 | `dirty_carpet` |
| 책상 상판 | `kitchen_wood` |
| 벽면 | `painted_plaster_wall` |
| 파티션·차트 바닥·천장 | `concrete_floor_worn_001` |
| 점프 발판 잔디 / 흙 / 공중 블록 바위 | `aerial_grass_rock` / `stony_dirt_path` / `rock_surface` |
| 차트 배경·캐비닛·망치·카트 | `metal_plate` |

- 사진 디퓨즈는 원래 재질색의 평균 밝기·색조로 나눠 입혀 야간 사무실 무드를 유지하고, 글자·색이 의미를 갖는 면(초록 캔들 차트 바, 선물 박스, 사무실 문)은 노멀·거칠기만 보강한다.
- 로드 실패·지연 시에는 기존 재질이 그대로 남는다(폴백). `?notex`로 비교 모드. 출처는 `textures/CREDITS.md`.

## 최적화
- 두 렌더러 모두 `setPixelRatio(min(devicePixelRatio, 1.4))`, `PCFShadowMap`
- 위장(엑셀) 중에는 미니 3D 캔버스 렌더링 정지, 결과 화면에서는 두 씬 모두 정지
- 390×844 한 화면(`scrollHeight == 844`) 유지

## 테스트 훅
`window.__SLACK` — state/tap/hold/release/warn/check/setGauge/stage/start/go/skipTemptIn/takeTempt/setLeft/three
