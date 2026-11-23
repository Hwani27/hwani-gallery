# CC0 3D 캐릭터 시범 도입 (fight-right-now)

`지금 바로 파이트`(`index.html` / `en.html`)에 Three.js `GLTFLoader` + `AnimationMixer`로 붙인
CC0(퍼블릭 도메인) 3D 캐릭터 3종입니다. 세 팩 모두 **CC0 1.0 Universal**이며 저작자 표기는
의무가 아니지만, 원저작자와 출처를 남겨 둡니다.

| 파일 | 원작자 / 팩 | 원본 | 라이선스 |
| --- | --- | --- | --- |
| `kenney-hero.glb` (바로) | Kenney · **Blocky Characters 2.0** (`character-a`) | https://kenney.nl/assets/blocky-characters · https://opengameart.org/content/blocky-characters | CC0 1.0 |
| `kaykit-knight.glb` (그림자 기사) | Kay Lousberg (KayKit) · **Character Pack: Adventurers** (`Knight`) | https://kaylousberg.itch.io/kaykit-adventurers · https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | CC0 1.0 |
| `quaternius-warrior.glb` (따또) | Quaternius · **RPG Character Pack** (`Warrior`) | https://quaternius.com/packs/rpgcharacters.html | CC0 1.0 |

원본 라이선스 전문은 각 팩 배포물의 `License.txt`(Kenney) / `LICENSE.txt`(KayKit) /
Quaternius 팩 폴더의 `License.txt`에 있으며, 내용은 모두 CC0 1.0
(https://creativecommons.org/publicdomain/zero/1.0/)입니다.

## 가공 내용

`tools/glb-opt.py`로 웹 배포용으로만 손봤습니다(모델·리깅·모션 원본은 그대로).

- 원본 3.5MB(KayKit 76개 클립) / 3.0MB(Quaternius `.gltf`) / 113KB(Kenney) →
  **66KB / 1.03MB / 1.11MB**
- 이 게임이 쓰는 상태(idle, walk/run, jump, attack, hit, down, get up, win, lose)에 필요한
  클립만 남기고 나머지 클립을 제거했습니다. 각 파일에 남은 클립 목록은 아래와 같습니다.
- 텍스처는 1024² → 256²(Kenney·Quaternius) / 512²(KayKit)로 줄이고 PNG로 다시 인코딩해
  `.glb` 안에 임베드했습니다(외부 텍스처 파일 없음 → 단일 파일, CORS 안전).
- `KHR_materials_unlit`을 제거해 씬 라이트와 그림자, 피격 시 emissive 플래시가 적용되도록
  일반 PBR 머티리얼로 바꿨습니다. 무의미한 `KHR_texture_transform`(texCoord 0)도 제거.
- KayKit Knight에서 쓰지 않는 무기/방패 메시(1H_Sword_Offhand, 2H_Sword, 방패 4종)를 제거.

남은 클립:

- `kenney-hero.glb`: idle, walk, sprint, die, attack-melee-right, attack-melee-left, attack-kick-right
- `kaykit-knight.glb`: Idle, Walking_A, Running_A, Jump_Start, Jump_Idle, Jump_Land,
  1H_Melee_Attack_Slice_Horizontal, 1H_Melee_Attack_Stab, Hit_A, Hit_B, Death_A, Lie_Down,
  Lie_StandUp, Cheer, Blocking, Dodge_Forward
- `quaternius-warrior.glb`: Idle, Walk, Run, Punch, Sword_Attack, Sword_Attack2, RecieveHit,
  Death, Roll, PickUp, Idle_Weapon

## 재생성 방법

```sh
# Kenney (zip 안의 character-a + Textures/texture-a.png를 같은 폴더에 풀어 둔 뒤)
python3 tools/glb-opt.py --in kenney_a/character-a.glb --out kenney-hero.glb \
  --keep idle,walk,sprint,die,attack-melee-right,attack-melee-left,attack-kick-right \
  --tex-max 256 --strip-unlit --strip-tex-transform

# KayKit
python3 tools/glb-opt.py --in Knight.glb --out kaykit-knight.glb \
  --keep Idle,Walking_A,Running_A,Jump_Start,Jump_Idle,Jump_Land,1H_Melee_Attack_Slice_Horizontal,1H_Melee_Attack_Stab,Hit_A,Hit_B,Death_A,Lie_Down,Lie_StandUp,Cheer,Blocking,Dodge_Forward \
  --drop-node 1H_Sword_Offhand --drop-node Badge_Shield --drop-node Rectangle_Shield \
  --drop-node Round_Shield --drop-node Spike_Shield --drop-node 2H_Sword \
  --tex-max 512 --strip-unlit

# Quaternius
python3 tools/glb-opt.py --in Warrior.gltf --out quaternius-warrior.glb \
  --keep Idle,Walk,Run,Punch,Sword_Attack,Sword_Attack2,RecieveHit,Death,Roll,PickUp,Idle_Weapon \
  --tex-max 256 --strip-unlit
```

`lib/GLTFLoader.js`는 이 페이지에 인라인된 Three.js **r128**에 맞춘 동일 버전
(`three@0.128.0/examples/js/loaders/GLTFLoader.js`, MIT)입니다.
