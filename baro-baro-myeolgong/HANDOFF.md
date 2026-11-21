# 지금 바로 멸공 — 개발 인수인계

## 현재 상태 (2026-11-21)
- 원본 게임: 지금 바로 점프 (3D 블록 플랫포머, three.js, 단일 HTML)
  - 소스: https://github.com/Hwani27/hwani-gallery/tree/main/baro-baro-jump
  - 플레이: https://hwani27.github.io/hwani-gallery/baro-baro-jump/
  - 이 폴더는 수정하지 않는다. 개인정보 페이지도 수정하지 않는다.
- 새 게임: 지금 바로 멸공 (버추어 캅식 레일 슈팅, 원본 엔진을 불러와 사용)
  - 브랜치: `cursor/myeolgong-direction-a813`
  - PR: https://github.com/Hwani27/hwani-gallery/pull/9 (main에 아직 안 합쳐짐)
  - 폴더: `baro-baro-myeolgong/`
    - `index.html` (~2.9KB), `en.html` (~2.7KB): `../baro-baro-jump/`의 HTML을 fetch하고 제목을 바꾼 뒤, `stepPlayer`와 렌더 루프에 훅을 심고 `gun-sfx.js`, `rail.js`를 넣는다.
    - `rail.js` (~32KB): 레일 카메라, 자유 조준, 웨이브, 보스, 픽업, HUD, 결과 화면
    - `gun-sfx.js` (~5.3KB): 절차적 총성 (shot, dry, reload, hit, boom). 원본 음소거를 따른다.
  - 새 코드 합계 약 42KB. 재활용 `baro-baro-jump/` 폴더 약 5.8MB.
  - 레일은 기본으로 켜진다. 끄려면 `?rail=0`. `stay=1`은 필요 없다.
  - 플레이 주소 (Pages는 main만 서빙하므로 **PR #9를 main에 병합한 뒤**에 열린다):
    - https://hwani27.github.io/hwani-gallery/baro-baro-myeolgong/
    - 영어: https://hwani27.github.io/hwani-gallery/baro-baro-myeolgong/en.html

## 결정 사항
- 별도 게임으로 개발하고 원본 `baro-baro-jump/`는 절대 수정하지 않는다.
- 데이터 최대 재활용: 원본 엔진, 바로, 블록 텍스처, 스테이지, 몹, 코인/별점, 효과음. 새 코드는 최소화. 엔진 HTML을 복사하지 않는다.
- 그래픽: 도트 아님. 원본 3D 블록 스타일 유지. 군사 리스킨은 하지 않는다.
- 방식: 버추어 캅식 레일 슈팅. 횡스크롤 런앤건 안은 폐기.
- 순서: 지금 화면(원본 세계) 그대로 게임성 먼저. 멸공 스킨과 입대/북진 스토리는 나중.
- 스토리(나중): 바로가 군입대 → 훈련소 → 서울, DMZ, 개성, 평양. 실존 인물 묘사 없음, 고어 없음.
- Saltline (Copy).html: 라이선스 불명. 총성과 그래픽은 방식만 참고하고 코드를 복사하지 않는다. 임펄스 응답, 블룸, 트라이플래너는 넣지 않았다.
- 전달: 작업이 끝나면 브랜치에 HTML을 푸시하고 Pages 링크를 알린다. 링크가 실제로 열리는 것은 main 병합 후다.

## 조작
- PC: 마우스로 조준점이 따라간다. 좌클릭은 그 위치로 발사. `R` 또는 우클릭은 재장전.
- 모바일: 탭한 지점으로 발사. 오른쪽 아래 `R` 버튼으로 재장전.
- 탄창 20발. 빈 총은 클릭음만 난다.

## 1스테이지에서 실제로 일어나는 일
- 스테이지는 원본 1-1 「성 밖 들판」이다. 카메라는 벽돌 길을 따라 +X로 이동하다 교전에서 멈춘다.
- 적 12마리를 x순으로 3마리씩 4웨이브. 근처에 인질이 있으면 한 명 같이 나온다.
- 역할은 원본 몹 종류 그대로다.
  - 약함 (1발, 조준 1.45초): 그 외
  - 투사 (2발, 2.1초, 쏴 떨어뜨릴 수 있는 탄): pillager, skeleton, creeper
  - 튼튼 (3발, 2.5초): guard, irongolem, charger
  - 인질 (쏘면 -300, 콤보 끊김, 공격 안 함): moosh, snowgolem, axolotl
- 웨이브는 전멸하거나 11초가 지나면 이어진다. 피해 없이 인질도 안 쏘면 +500.
- 조준 경고(노란 숫자)가 0이 되면 플레이어가 다친다. HP 100, 목숨 3.
- 픽업 8개(레일 위에 둔 원본 코인, 1UP 버섯, 탄약 상자)를 쏘면 점수/탄/목숨.
- 4웨이브 다음 `makeBoss()` 보스 (HP 8). 쓰러뜨리면 클리어.
- 별: 1 클리어, 2 픽업 60% 이상, 3 목숨 3 유지. `commitStars66` + `saveSave`.
- 점수: 기본 100, 콤보, 헤드샷 +150, 빠른 처치 +100, 명중률은 결과 화면에 표시.

## 진행 상황 (게임성 1~8)
1. 자유 조준 — 완료. 마우스/터치 위치에서 레이를 쏜다. 얇은 복셀은 110px 안의 가장 가까운 대상에 맞는다.
2. 레일 교전, 조준 경고, HP/목숨 — 완료.
3. 적 다양화(기존 몹) — 완료. 약함/튼튼/투사/인질.
4. 콤보, 헤드샷, 빠른 처치, 명중률, 별점 결과 — 완료.
5. 쏴서 먹는 탄약/목숨/점수 — 완료. 데스크톱 플레이에서 8/8 회수 확인.
6. 1스테이지 보스 — 완료. 원본 `makeBoss`. 쓰러뜨리면 「스테이지 클리어」.
7. HUD 잘림 — 완료. STAGE, CREDIT이 데스크톱과 390×844에서 버튼에 가리지 않는다.
8. 히트 마커, 피격 반짝임, 피격 시 화면 흔들림, 총구 반동/섬광/연기 — 완료.

확인: 데스크톱 1280×720에서 1-1을 클리어(점수 3850, 명중률 100%, 코인 8/8, ★★☆). 모바일 390×844에서 탭 명중과 HUD를 확인. 페이지 에러 없음. `sw.js` 404는 원본 점프의 기존 잡음이다.

스크린샷:
- `baro-baro-myeolgong/preview/b-shootout.png`
- `baro-baro-myeolgong/preview/b-boss.png`
- `baro-baro-myeolgong/preview/b-result.png`
- `baro-baro-myeolgong/preview/b-mobile.png`

## 아직 하지 않은 것
- 군사/록맨 리스킨, 입대 튜토리얼, 서울→DMZ→개성→평양 스토리.
- 수류탄.
- 1-2 이후 스테이지를 각각의 레일 코스로 잇는 일. 지금은 1-1의 적 12마리와 그 끝의 보스만 플레이한다.
- 결과 화면의 「다시 하기」 버튼은 없다. 새로고침하면 다시 시작한다.

## 다른 에이전트용 시작 프롬프트
"Hwani27/hwani-gallery 저장소의 cursor/myeolgong-direction-a813 브랜치(PR #9)에서 baro-baro-myeolgong/ 게임을 이어서 개발해줘. baro-baro-myeolgong/HANDOFF.md의 결정 사항을 지켜라. baro-baro-jump/는 수정하지 말고, 원본 엔진과 에셋을 최대한 재활용해라. 게임성 1~8번은 끝났다. 군사 리스킨과 입대/북진 스토리는 사용자가 명시하기 전에는 시작하지 마라. 레일은 쿼리 없이 기본으로 켜져 있어야 하고, 끝나면 브랜치에 푸시한 뒤 https://hwani27.github.io/hwani-gallery/baro-baro-myeolgong/ 가 main 병합 후에만 열린다는 점을 포함해 바뀐 점과 스크린샷을 보고해라. 라운드가 끝나면 이 HANDOFF.md의 상태, 완료/미완, 링크, 시작 프롬프트를 갱신해라."
