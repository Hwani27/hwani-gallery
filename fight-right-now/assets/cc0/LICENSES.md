# KayKit CC0 캐릭터 (fight-right-now)

`지금 바로 파이트`(`index.html` / `en.html`)의 신규 플레이어블 캐릭터 4명입니다.
네 팩 모두 **CC0 1.0 Universal**이며 저작자 표기는 의무가 아니지만, 원저작자와 출처를 남겨 둡니다.

| 파일 | 게임 캐릭터 | 원작자 / 팩 | 원본 | 라이선스 |
| --- | --- | --- | --- | --- |
| `kaykit-knight.glb` | 카일 / Kyle (기사 · Knight) | Kay Lousberg (KayKit) · **Character Pack: Adventurers** (`Knight`) | https://kaylousberg.itch.io/kaykit-adventurers · https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | CC0 1.0 |
| `kaykit-barbarian.glb` | 보르 / Bor (야만 · Barbarian) | KayKit · **Character Pack: Adventurers** (`Barbarian`) | 위와 같음 | CC0 1.0 |
| `kaykit-rogue.glb` | 린 / Rin (도적 · Rogue) | KayKit · **Character Pack: Adventurers** (`Rogue`) | 위와 같음 | CC0 1.0 |
| `kaykit-mage.glb` | 루미 / Lumi (마법 · Mage) | KayKit · **Character Pack: Adventurers** (`Mage`) | 위와 같음 | CC0 1.0 |

원본 라이선스 전문은 팩 배포물의 `LICENSE.txt`에 있으며 CC0 1.0
(https://creativecommons.org/publicdomain/zero/1.0/)입니다.

> Adventurers 팩의 무료(CC0) 저장소에는 Knight · Barbarian · Rogue · Rogue_Hooded · Mage
> 5개 모델이 들어 있고, **Ranger는 유료 EXTRA 티어**에만 있습니다. 그래서 4번째 슬롯은
> Ranger 대신 Barbarian을 사용했습니다.

## 가공 내용

`tools/glb-opt.py`로 웹 배포용으로만 손봤습니다(모델·리깅·모션 원본은 그대로).

- 원본 각 3.6MB(76개 클립, 1024² 아틀라스) → **1.28~1.37MB**
- 이 게임이 쓰는 상태(대기, 걷기/뒷걸음, 달리기, 점프 시작/체공/착지, 회피 전·후,
  방어/방어 피격, 피격 A/B, 쓰러짐/기상, 승리, 사망, 근접 콤보 3~4종, 원거리/마법 시전,
  슈퍼, 던지기)에 필요한 클립만 남겼습니다. 파일별 클립 목록은 아래와 같습니다.
- 텍스처는 1024² → 256²로 줄이고 PNG로 다시 인코딩해 `.glb` 안에 임베드했습니다
  (외부 텍스처 파일 없음 → 단일 파일, CORS 안전).
- `KHR_materials_unlit`을 제거해 씬 라이트·그림자·피격 emissive 플래시가 적용되도록
  일반 PBR 머티리얼로 바꿨습니다. 무의미한 `KHR_texture_transform`(texCoord 0)도 제거.
- 캐릭터당 무기 하나(기사 1H_Sword, 야만 1H_Axe, 도적 단검 2자루, 마법사 2H_Staff)만
  남기고 쓰지 않는 무기/방패/책/도구 메시를 지웠습니다.

남은 클립:

- `kaykit-knight.glb` (23): Idle, Walking_A, Walking_Backwards, Running_A, Jump_Start,
  Jump_Idle, Jump_Land, Dodge_Forward, Dodge_Backward, Blocking, Block_Hit, Hit_A, Hit_B,
  Death_A, Lie_Down, Lie_StandUp, Cheer, 1H_Melee_Attack_Slice_Horizontal, 1H_Melee_Attack_Chop,
  1H_Melee_Attack_Slice_Diagonal, 1H_Melee_Attack_Stab, 2H_Melee_Attack_Spin, 1H_Ranged_Shoot
- `kaykit-barbarian.glb` (24): 위 공통 + 1H_Melee_Attack_Chop, 1H_Melee_Attack_Slice_Diagonal,
  1H_Melee_Attack_Slice_Horizontal, 1H_Melee_Attack_Stab, 2H_Melee_Attack_Chop,
  2H_Melee_Attack_Spin, Throw (1H_Ranged_Shoot 없음)
- `kaykit-rogue.glb` (23): 위 공통 + Dualwield_Melee_Attack_Chop, Dualwield_Melee_Attack_Slice,
  Dualwield_Melee_Attack_Stab, 1H_Melee_Attack_Stab, Throw, 1H_Ranged_Shoot
- `kaykit-mage.glb` (24): 위 공통 + 1H_Melee_Attack_Stab, 1H_Melee_Attack_Chop,
  1H_Melee_Attack_Slice_Diagonal, Spellcast_Shoot, Spellcasting, Spellcast_Raise, Spellcast_Long

## 재생성 방법

```sh
CORE="Idle,Walking_A,Walking_Backwards,Running_A,Jump_Start,Jump_Idle,Jump_Land,Dodge_Forward,Dodge_Backward,Blocking,Block_Hit,Hit_A,Hit_B,Death_A,Lie_Down,Lie_StandUp,Cheer"

python3 tools/glb-opt.py --in Knight.glb --out kaykit-knight.glb \
  --keep "$CORE,1H_Melee_Attack_Slice_Horizontal,1H_Melee_Attack_Chop,1H_Melee_Attack_Slice_Diagonal,1H_Melee_Attack_Stab,2H_Melee_Attack_Spin,1H_Ranged_Shoot" \
  --drop-node 1H_Sword_Offhand --drop-node Badge_Shield --drop-node Rectangle_Shield \
  --drop-node Round_Shield --drop-node Spike_Shield --drop-node 2H_Sword \
  --tex-max 256 --strip-unlit --strip-tex-transform

python3 tools/glb-opt.py --in Barbarian.glb --out kaykit-barbarian.glb \
  --keep "$CORE,1H_Melee_Attack_Chop,1H_Melee_Attack_Slice_Diagonal,1H_Melee_Attack_Slice_Horizontal,1H_Melee_Attack_Stab,2H_Melee_Attack_Chop,2H_Melee_Attack_Spin,Throw" \
  --drop-node 1H_Axe_Offhand --drop-node Barbarian_Round_Shield --drop-node 2H_Axe --drop-node Mug \
  --tex-max 256 --strip-unlit --strip-tex-transform

python3 tools/glb-opt.py --in Rogue.glb --out kaykit-rogue.glb \
  --keep "$CORE,Dualwield_Melee_Attack_Chop,Dualwield_Melee_Attack_Slice,Dualwield_Melee_Attack_Stab,1H_Melee_Attack_Stab,Throw,1H_Ranged_Shoot" \
  --drop-node 1H_Crossbow --drop-node 2H_Crossbow --drop-node Throwable \
  --tex-max 256 --strip-unlit --strip-tex-transform

python3 tools/glb-opt.py --in Mage.glb --out kaykit-mage.glb \
  --keep "$CORE,1H_Melee_Attack_Stab,1H_Melee_Attack_Chop,1H_Melee_Attack_Slice_Diagonal,Spellcast_Shoot,Spellcasting,Spellcast_Raise,Spellcast_Long" \
  --drop-node Spellbook --drop-node Spellbook_open --drop-node 1H_Wand \
  --tex-max 256 --strip-unlit --strip-tex-transform
```

`lib/GLTFLoader.js`는 이 페이지에 인라인된 Three.js **r128**에 맞춘 동일 버전
(`three@0.128.0/examples/js/loaders/GLTFLoader.js`, MIT)입니다.
