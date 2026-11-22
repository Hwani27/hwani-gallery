# 효과음 폴더 (sfx/)

이 폴더에 녹음된 효과음 파일을 넣고 `manifest.json`에 등록하면 게임이 그 소리를 씁니다.
등록하지 않은 소리는 지금처럼 코드로 합성한 소리가 그대로 나오므로, 하나씩 채워 넣어도 됩니다.

## manifest.json 예시

```json
{
  "loop_rotor": "heli_loop.ogg",
  "loop_bike": "motorbike_loop.ogg",
  "loop_diesel": "tank_loop.ogg",
  "loop_jeep": "jeep_loop.ogg",
  "bike_pass": "motorbike_pass.ogg",
  "explosion": ["boom1.ogg", "boom2.ogg"],
  "scream": ["scream1.ogg", "scream2.ogg", "scream3.ogg"],
  "hurt": ["hurt1.ogg", "hurt2.ogg"]
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
| `scream` | 적 사망 비명 (여러 개면 무작위) | 한 번 |
| `hurt` | 적 피격 신음 | 한 번 |

파일은 `.ogg` 또는 `.mp3`, 44.1kHz, 짧고 앞뒤 무음이 없는 것이 좋습니다.

## 라이선스

상업 출시(구글 플레이·스팀)용이므로 **CC0(퍼블릭 도메인)** 파일을 권장합니다.
CC-BY는 크레딧 표기를 하면 쓸 수 있고, CC-BY-NC(비상업)·CC-BY-SA(동일조건)는 피하세요.
사용한 파일의 출처·작가·라이선스는 아래 표에 적어 두세요.

| 파일 | 출처 URL | 작가 | 라이선스 |
|---|---|---|---|
| | | | |
