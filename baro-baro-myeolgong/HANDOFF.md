# 지금 바로 멸공 — 개발 인수인계

## 현재 상태 (2026-11-22 · 완전 독립 빌드)
- 플레이: https://hwani27.github.io/hwani-gallery/baro-baro-myeolgong/
- 폴더: `baro-baro-myeolgong/`
  - `index.html` (한국어) · `en.html` (영어) — 캔버스 + 타이틀 오버레이 + 스크립트 4줄
  - `three.min.js` — r128, 원본 `baro-baro-jump/index.html`에 인라인으로 박혀 있던 것을 그대로 발췌(수정 없음)
  - `engine.js` — 렌더러/씬/카메라/조명/프레임 루프/타이틀·사운드 토글/점수 팝업
  - `rail.js` — 광장·병사·소품·4웨이브·보스·HUD·결과 화면 전부
  - `gun-sfx.js` — 절차적 총성·재장전·폭발 + 내장 전투 BGM
- **다른 게임을 부르지 않는다.** `fetch("../baro-baro-jump/index.html")`, `DOMParser`, `document.replaceChild`, 점프 엔진 전역(`L`/`enemies`/`pl`/`makeBoss`/`commitStars66`/`saveSave`/`BGM`/`__BGM572`) 의존이 모두 0이다.
- 원본 `baro-baro-jump/`, `fight-right-now/`, 개인정보 페이지는 이번에도 수정하지 않았다.

## 왜 바꿨나 (2026-11-22 사용자 보고)
여러 기기에서 **한 판 끝나고 나면 검은 화면 + 옛 점프 HUD**(`STAGE 1-1 · 300 · 쉬움 · 달구지/울트라/뻥 · 점프/대시`)가 다시 나왔고, 사용자는 "다른 기기에서도 한판하고 나니까 또 그래 / 자꾸 옛날 미니게임 메뉴 그런거나 점프 게임 옛날 소스 불러오지말고"라고 지시했다. 원인은 이 게임이 점프 HTML을 fetch해서 문자열 치환·재파싱한 뒤 스크립트를 다시 실행하는 구조였던 것 — 오버레이가 풀리면 원본 메뉴가 그대로 드러났다. 그래서 엔진을 통째로 걷어내고 필요한 3D 부품만 발췌해 독립시켰다.

## 이번 라운드에서 한 일
1. **three.min.js 발췌**: `!function(t,e){...}(this,...)` ~ `__esModule` 끝까지 603KB를 그대로 떼어냈다. 원본 파일은 손대지 않았다.
2. **engine.js 신규**: `#mgCanvas`에 `WebGLRenderer({antialias:true})`, `PerspectiveCamera(58, w/h, 0.06, 320)`, 씬, 태양/하늘/앰비언트/림 라이트(그림자 1024, 카메라를 따라 이동), `requestAnimationFrame` 루프, 리사이즈·회전·컨텍스트 로스트 대응.
3. **타이틀 화면**: 『지금 바로 멸공』 / 『Destroy Now』, `▶ 작전 개시 (STAGE 1-1)`, 사운드 토글, `터치/클릭 조준 사격 · R 재장전`. 옛 점프 메뉴·`네모 탈출`·상점/코인/월드맵·이어서 하기는 마크업 자체에 없다.
4. **rail.js에서 스테이지 정의**: 웨이브 4개(x=18/34/50/66, 각 3~4명 + 인질)와 지휘관(x=80)을 `WAVES` 상수로 직접 정의. 엔진의 `enemies` 배열에서 파생하지 않는다.
5. **재시작 수명주기**: `RAIL.begin(ctx)`가 광장·병사·픽업·보스를 전부 지우고 다시 짓는다(`clearStage` → `buildWaves`/`buildBoss`/`buildPickups`/`dressBattlefield`). 결과 화면의 **`[다시 하기]`/`[타이틀]`** 버튼이 각각 `MG.playAgain()`/`MG.toTitle()`을 부른다. 점수·탄약·HP·목숨·콤보·명중·웨이브 인덱스·카메라 위치가 모두 초기화된다.
6. **어색한 숫자 제거**: 병사 위에 뜨던 `0.7`/`1.4` 카운트다운 텍스트를 없애고 **작은 `!` 경고 링**으로 바꿨다(발사 직전에는 붉게 깜박임). 인질에게는 표시하지 않는다.
7. **점수 표기 수정**: 음수 점수가 `000-250`으로 찍히던 것을 `-000250`으로 고쳤다(결과 화면과 HUD 점수도 같은 값으로 맞춘다).
8. **인질 위치**: 인질이 병사 바로 앞에 서서 사격을 가로막던 배치를 옆·뒤로 옮겼다(스쿼드 +3.6~5.1, z=1.02).
9. **타격 먼지**: 명중 시 뜨던 큰 회색 덩어리를 작고 옅은 연기로 바꿔 점점 퍼지며 사라지게 했다.
10. **갤러리 카드**: 설명을 "블록 세상 군사 레일 슈팅…"으로 고치고 `thumb.png`를 새 화면으로 교체.

## 검증 (2026-11-22, headless Chromium + swiftshader)
| 시나리오 | 결과 |
|---|---|
| 데스크톱 1280×720, 1판 → 결과 → 다시 하기 → 2판 | 클리어 5,320점/명중 97% → 재시작(점수 0·waveI 0·HP 100·목숨 3·총알 20) → 2판 클리어 4,920점 |
| 모바일 390×844, 1판 → 결과 → 다시 하기 → 2판 | 4,180점 → 재시작 후 6,910점, HUD 잘림 없음 |
| 결과 → [타이틀] → [작전 개시] | 타이틀 표시·HUD 숨김·결과 제거 확인, 재시작 시 점수 0·웨이브 1부터 |
| 가만히 서서 사망까지 | HP 0, 목숨 0 → `작전 실패` 카드 + 두 버튼 정상 |
| en.html | MISSION CLEAR / PLAY AGAIN / TITLE 정상 |
| 콘솔·페이지 오류 | 0건 (모든 시나리오), `__railErrs` 0건 |

스크린샷: `baro-baro-myeolgong/preview/standalone-*.png`(title/play/result/mobile), 전달용 `downloads/myeolgong_standalone_title.png` · `downloads/myeolgong_standalone_play.png`. 이전 훅 방식 빌드의 `preview/b-*.png`는 실제 화면과 달라 삭제했다(깃 기록에는 남아 있음).

## 조작
- PC: 마우스 조준, 좌클릭 발사, `R`/우클릭 재장전.
- 모바일: 탭한 지점으로 발사, 우하단 `R` 버튼 재장전.
- 탄창 20발, 보급 탄약통 +10, 구급상자 목숨 +1.

## 결정 사항
- 별도 게임으로 개발하고 원본 `baro-baro-jump/`, `fight-right-now/`는 절대 수정하지 않는다.
- 엔진 HTML을 복사·재파싱하지 않는다. 필요한 3D 부품은 `three.min.js` + 이 게임 코드로만 구성한다.
- 그래픽: 도트 아님, 원본 3D 블록 스타일 유지. 군사 리스킨은 2026-11-22 사용자 요청.
- `Saltline (Copy).html`: 라이선스 불명. 방식만 참고하고 코드를 복사하지 않는다.
- `fight-right-now`는 읽기만 했다. 히트스톱/화면 플래시/넉백 **기법**만 참고해 새로 작성했다.

## 아직 하지 않은 것
- 1-2 이후 스테이지를 각각의 레일 코스로 잇기(지금은 1-1 한 판 + 보스).
- 입대 튜토리얼, 서울→DMZ→개성→평양 스토리.
- 수류탄.
- 랭킹/기록 저장(이전 빌드의 `saveSave`·별점 저장은 엔진과 함께 걷어냈다. 다시 넣으려면 `localStorage`로 새로 구현).

## 다른 에이전트용 시작 프롬프트
"Hwani27/hwani-gallery의 `baro-baro-myeolgong/`은 이제 완전 독립 빌드다(index.html/en.html + three.min.js + engine.js + gun-sfx.js + rail.js). `baro-baro-jump/`를 fetch하거나 DOMParser로 재파싱하는 구조로 되돌리지 마라. `baro-baro-jump/`, `fight-right-now/`는 수정 금지. 다음은 1-2 이후 레일 코스와 스토리다. 웨이브는 rail.js의 `WAVES` 상수에서 정의하고, 새 스테이지는 `RAIL.begin(ctx)`가 매번 처음부터 다시 짓는 구조를 지켜라. 끝나면 브랜치에 푸시하고 스크린샷과 함께 이 HANDOFF.md를 갱신해라."
