# 효과음 폴더 (sfx/)

이 폴더에 녹음된 효과음 파일을 넣고 `manifest.json`에 등록하면 게임이 그 소리를 씁니다.
등록하지 않은 소리는 지금처럼 코드로 합성한 소리가 그대로 나오므로, 하나씩 채워 넣어도 됩니다.

## 지금 들어 있는 파일 (2026-11-23, 전부 CC0)

여섯 개 키를 채웠습니다.

| 키 | 파일 | 길이 | 쓰는 곳 |
|---|---|---|---|
| `loop_rotor` | `loop_rotor.ogg` | 2.3 s 루프 | 헬기 엔진 |
| `loop_bike` | `loop_bike.ogg` | 4.0 s 루프 | 적 오토바이 엔진 |
| `loop_diesel` | `loop_diesel.ogg` | 4.5 s 루프 | 전차·장갑차 엔진 |
| `loop_jeep` | `loop_jeep.ogg` | 0.5 s 루프 | 추격전 지프·보트 |
| `bike_pass` | `bike_pass.mp3` | 2.8 s | 오토바이 돌진 시작 |
| `explosion` | `boom_1.mp3`, `boom_2.mp3`, `boom_3.mp3` | 1.0 / 4.0 / 1.3 s | 폭발 (무작위) |

### 사람 목소리(`scream`, `hurt`)는 뺐습니다

한때 적 사망 비명(`scream_1~3.mp3`)과 피격 신음(`hurt_1~5.mp3`) 녹음을 넣었지만,
"비명소리는 괴성 고성 빼고 낮은 음만", 이어서 "신음 포함 너무 시끄럽고 듣기싫다"는 피드백에 따라
**파일과 `manifest.json` 키를 모두 삭제**했습니다. 사람 목소리는 음을 낮춰도 거슬려서,
지금은 피격·사망 모두 `gun-sfx.js`의 합성음으로 짧고 둔탁한 저역 타격음(퍽)만 냅니다.
사망일 때만 반 박자 뒤에 쓰러지는 낮은 소리가 한 번 더 얹히고, 전체 볼륨은 총성의 3분의 1 아래로 잡았습니다.
다시 목소리를 넣지 않으려고 로더에서도 `scream`/`hurt` 키를 재생하지 않습니다.

### 포맷을 나눈 이유

- **루프 4개는 `.ogg`(Opus, 64 kbps 모노, 48 kHz)** — 이어 붙이는 지점이 샘플 단위로 이어져
  엔진 소리가 끊기지 않습니다. Chrome·Firefox·Android WebView·Safari 18.4 이상(iOS 18.4 이상)에서 재생됩니다.
  Ogg를 못 읽는 옛 브라우저에서는 그 키만 합성음으로 돌아갑니다(로더가 이미 그렇게 동작합니다).
- **한 번만 나는 소리 4종은 `.mp3`(128 kbps 모노, 44.1 kHz)** — 모든 브라우저에서 확실히 재생되고,
  루프가 아니라 이음매 문제도 없습니다.

### 손본 것

- 전부 30~70 Hz 하이패스로 초저역을 덜어 폰 스피커에서 쓸데없이 헤드룸을 먹지 않게 했습니다.
- 루프는 원본에서 파형이 맞는 구간을 잘라, 마지막 샘플에서 첫 샘플로 넘어갈 때
  파형이 그대로 이어지도록 크로스페이드했습니다. 끝과 처음에는 1.5 ms 페이드를 하나씩 넣었는데,
  브라우저가 디코딩한 버퍼를 재생 속도(48k/44.1k)에 맞춰 리샘플링할 때 마지막 몇 샘플이
  약간 흔들려서, 그 부분을 0에 가깝게 둬 딱딱 끊기는 소리가 나지 않게 하기 위해서입니다
  (들리는 이음매 없음, 44.1 kHz 컨텍스트에서 실측 −33 dBFS 이하).
- 라우드니스는 루프 RMS −14 dBFS, 폭발 −19.5 dBFS 로 맞췄고
  피크는 −1.5 dBFS 아래로 제한했습니다(게임 쪽 버스 컴프레서·리미터 앞).
- 앞뒤 무음은 잘라냈고, 끝에는 30~40 ms 페이드아웃을 넣어 딱 끊기는 소리를 없앴습니다.

## manifest.json 예시

```json
{
  "loop_rotor": "heli_loop.ogg",
  "loop_bike": "motorbike_loop.ogg",
  "loop_diesel": "tank_loop.ogg",
  "loop_jeep": "jeep_loop.ogg",
  "bike_pass": "motorbike_pass.ogg",
  "explosion": ["boom1.ogg", "boom2.ogg"]
}
```

| 키 | 쓰이는 곳 | 형태 |
|---|---|---|
| `loop_rotor` | 헬기 엔진 (반복) | 끊김 없이 반복되는 루프 |
| `loop_bike` | 적 오토바이 엔진 (반복, 속도에 따라 재생 속도 변함) | 루프 |
| `loop_diesel` | 전차·장갑차·트럭 엔진 | 루프 |
| `loop_jeep` | 추격전 지프·보트 | 루프 |
| `bike_pass` | 오토바이 돌진 시작 | 2~3초 한 번 |
| `explosion` | 폭발 (여러 개면 무작위) | 한 번 |

파일은 `.ogg` 또는 `.mp3`, 44.1kHz, 짧고 앞뒤 무음이 없는 것이 좋습니다.

## 라이선스

상업 출시(구글 플레이·스팀)용이므로 **CC0(퍼블릭 도메인)** 파일을 권장합니다.
CC-BY는 크레딧 표기를 하면 쓸 수 있고, CC-BY-NC(비상업)·CC-BY-SA(동일조건)는 피하세요.
사용한 파일의 출처·작가·라이선스는 아래 표에 적어 두세요.

| 파일 | 출처 URL | 작가 | 라이선스 |
|---|---|---|---|
| `loop_rotor.ogg` | https://freesound.org/people/qubodup/sounds/854493/ | qubodup | CC0 |
| `loop_bike.ogg` | https://freesound.org/people/brucehep/sounds/724080/ | brucehep | CC0 |
| `loop_diesel.ogg` | https://freesound.org/people/qubodup/sounds/187676/ | qubodup | CC0 |
| `loop_jeep.ogg` | https://opengameart.org/content/racing-car-engine-sound-loops | domasx2 | CC0 |
| `bike_pass.mp3` | https://freesound.org/people/AdrianoAnjos/sounds/442529/ | AdrianoAnjos | CC0 |
| `boom_1.mp3` | https://opengameart.org/content/explosion-0 | tinyworlds | CC0 |
| `boom_2.mp3` | https://opengameart.org/content/chunky-explosion | joth | CC0 |
| `boom_3.mp3` | https://opengameart.org/content/mechanical-explosion | spring-spring | CC0 |

- OpenGameArt 파일은 원본 파일을 그대로 받았습니다.
- Freesound 파일은 페이지의 공개 HQ 미리듣기(mp3)를 받아 편집했습니다. 원본 내려받기는 로그인이
  필요하지만, 소리 자체가 CC0라서 가공·상업적 사용·재배포에 제약이 없습니다.
- CC0라서 표기 의무는 없지만, 위 표는 나중에 확인할 수 있게 남겨 둡니다.
