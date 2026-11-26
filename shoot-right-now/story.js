/* 지금 바로 쏴! — stage-opening story scenes (v50).
   Played once per stage before the camera intro (tap to advance, skip at the
   top right). rail.js reads window.MGStory; edit the lines here.
   who: a key of CAST. `en` is the English line for en.html. */
(function () {
  const CAST = {
    me:   { ko: "나",     en: "ME",       player: true,                                         col: "#c9b871" },
    kang: { ko: "강 중위", en: "LT. KANG",  art: { role: "ally", skin: "rok", acc: "rank" },        col: "#9fc46a" },
    park: { ko: "박 병장", en: "SGT. PARK", art: { role: "ally", uni: "u-army", acc: "goggles" },   col: "#d9a05a" },
    kim:  { ko: "김 일병", en: "PVT. KIM",  art: { role: "ally", uni: "u-army", acc: "glasses" },   col: "#7fb6e0" },
    hq:   { ko: "본부",    en: "HQ",        radio: true,                                           col: "#7fd08a" },
    cha:  { ko: "적 지휘관 차 대좌", en: "COL. CHA (ENEMY)", art: { role: "boss", skin: "cmd" }, enemy: true, col: "#e0574a" },
    civ:  { ko: "시민",    en: "CIVILIAN",  art: { role: "hostage", skin: "civ2" },                col: "#d8d4cc" },
    civ2: { ko: "시민",    en: "CIVILIAN",  art: { role: "hostage", skin: "civ3" },                col: "#d8d4cc" },
    narr: { ko: "",      en: "",          narr: true,                                           col: "#e8dcb8" }
  };
  const L = (who, ko, en) => ({ who: who, ko: ko, en: en });
  const EPS = {
    6: { ep: 1, ko: "서울 함락", en: "THE FALL OF SEOUL", when: "20XX년 6월 · 새벽 · 서울", whenEn: "JUNE 20XX · DAWN · SEOUL", lines: [
      L("hq", "전 부대에 알린다. 적이 휴전선 전역에서 기습 남침했다!", "All units, the enemy has crossed the border along the whole front!"),
      L("kim", "소, 소대장님… 이거 훈련 아니죠? 하늘이 온통 빨갛습니다.", "L-Lieutenant… this isn't a drill, is it? The whole sky is red."),
      L("kang", "훈련 아니다. 김 일병, 숨 크게 쉬고 총 꽉 잡아.", "It's not. Breathe, Kim. Hold that rifle tight."),
      L("cha", "서울 시민 여러분, 저항은 무의미하다. 해가 지기 전에 이 도시는 우리 것이 된다.", "People of Seoul, resistance is pointless. By sunset this city is ours."),
      L("park", "말 많은 놈이네. 소대장님, 명령만 주십쇼.", "Chatty one, isn't he. Your orders, sir."),
      L("kang", "시민들이 한강을 건널 시간을 번다. 우리가 마지막 벽이다.", "We buy the people time to cross the Han. We are the last wall."),
      L("me", "…알겠습니다. 끝까지 버티겠습니다.", "…Understood. We'll hold as long as it takes."),
      L("kang", "좋아. 전원, 사격 준비!", "Good. Everyone — weapons ready!")
    ] },
    7: { ep: 2, ko: "대전", en: "DAEJEON", when: "서울 함락 사흘 뒤 · 대전역", whenEn: "THREE DAYS LATER · DAEJEON STATION", lines: [
      L("kim", "서울을… 정말 내준 겁니까?", "Did we really… give up Seoul?"),
      L("park", "내준 게 아니라 잠깐 맡겨둔 거다. 이자까지 쳐서 돌려받을 거야.", "We didn't give it up. We lent it. We'll take it back with interest."),
      L("kang", "피난 열차가 아직 대전역에 있다. 열차가 떠날 때까지 적을 묶어둔다.", "The refugee train is still at the station. We pin the enemy here until it leaves."),
      L("civ", "군인 아저씨들, 우리 애가 아직 역 안에 있어요!", "Please — my child is still inside the station!"),
      L("kang", "걱정 마십시오. 한 사람도 두고 가지 않습니다.", "Don't worry. We're not leaving anyone behind."),
      L("hq", "적 선두 엑스포로 진입. 지연전 개시하라.", "Enemy column entering Expo-ro. Begin the delaying action.")
    ] },
    8: { ep: 3, ko: "대구", en: "DAEGU", when: "낙동강 방어선 · 대구", whenEn: "THE NAKDONG LINE · DAEGU", lines: [
      L("hq", "낙동강이 마지막 자연 방어선이다. 대구가 뚫리면 부산까지 막을 곳이 없다.", "The Nakdong is the last natural line. If Daegu falls, nothing stops them before Busan."),
      L("park", "옛날에도 여기서 버텼다더라. 우리 할아버지 얘기다.", "They held here once before, you know. My grandfather did."),
      L("kim", "병장님 할아버님도 군인이셨습니까?", "Your grandfather was a soldier too, Sergeant?"),
      L("park", "그래. 그 양반이 지킨 강이다. 손자가 내줄 순 없지.", "He was. He held this river. His grandson's not giving it away."),
      L("kang", "적 헬기가 고가도로를 넘어올 거다. 하늘 잘 봐.", "Their gunships will come in over the flyover. Watch the sky."),
      L("me", "고가도로 쪽은 제가 맡겠습니다.", "I'll take the flyover.")
    ] },
    9: { ep: 4, ko: "광주", en: "GWANGJU", when: "적의 우회 · 광주 금남로", whenEn: "THE FLANKING MOVE · GEUMNAM-RO", lines: [
      L("hq", "적 1개 대대가 호남으로 우회했다. 광주 시내 진입 중!", "An enemy battalion swung west around the line. It's entering Gwangju!"),
      L("kang", "방어선을 옆으로 돌아왔다… 머리 쓰는 놈이 있군.", "They went around us… someone over there can think."),
      L("cha", "남쪽 군대는 정면만 보더군. 등 뒤가 텅 비었어.", "The southern army only ever looks ahead. Its back was wide open."),
      L("civ2", "광장 쪽에 아직 사람들이 남아 있어요!", "There are still people down by the square!"),
      L("kang", "금남로를 따라 밀고 들어간다. 시민 오사 절대 금지다.", "We push up Geumnam-ro. Not one civilian gets hit. Not one."),
      L("kim", "…이번엔 제가 앞장서겠습니다.", "…I'll take point this time."),
      L("park", "허, 우리 막내 많이 컸네.", "Well. Look who grew up.")
    ] },
    10: { ep: 5, ko: "경주", en: "GYEONGJU", when: "동부 전선 · 천년고도 경주", whenEn: "THE EASTERN FRONT · GYEONGJU", lines: [
      L("hq", "적이 동해안을 따라 경주까지 내려왔다.", "The enemy has come down the east coast as far as Gyeongju."),
      L("kim", "수학여행 때 여기 와봤는데… 첨성대 앞에서 사진도 찍었습니다.", "I came here on a school trip… I've got a photo in front of the observatory."),
      L("park", "그럼 이번엔 지켜낸 기념으로 한 장 더 찍자.", "Then let's take another one — the day we saved it."),
      L("cha", "천 년 된 돌탑이라… 포탄 한 발이면 끝이다.", "A thousand-year-old pagoda… one shell and it's gravel."),
      L("kang", "천 년을 버틴 탑이다. 하루쯤 더 못 버티겠나. 탑 근처 사격은 신중히.", "It's stood a thousand years. It can stand one more day. Careful with your fire near it."),
      L("me", "알겠습니다.", "Copy.")
    ] },
    11: { ep: 8, ko: "부산", en: "BUSAN", when: "최후 방어선 · 부산", whenEn: "THE LAST PERIMETER · BUSAN", lines: [
      L("hq", "전 부대, 부산 외곽 최후 방어선으로 집결하라.", "All units, fall back to the final perimeter outside Busan."),
      L("kim", "이제 바다 말고는 물러날 데가 없네요.", "There's nowhere left to go but the sea."),
      L("kang", "그래서 여기서 끝낸다. 물러서는 건 오늘까지다.", "Which is why it ends here. Today is the last day we retreat."),
      L("kang", "그리고… 본부에서 반격 작전이 내려왔다. 목표는 인천.", "And… HQ has sent down a counter-offensive. The target is Incheon."),
      L("park", "인천? 하하, 드디어 우리 차례군.", "Incheon? Ha. Finally, our turn."),
      L("hq", "작전 개시까지 부산을 지켜라. 반드시.", "Hold Busan until the operation begins. Whatever it takes.")
    ] },
    21: { ep: 6, ko: "강릉", en: "GANGNEUNG", when: "동해안 남하 · 강릉 해변", whenEn: "THE SOUTHWARD PUSH · GANGNEUNG BEACH", lines: [
      L("hq", "동해안을 따라 내려오는 적을 강릉 해변에서 막아라. 항구가 넘어가면 남쪽이 무너진다.", "Hold the east coast at Gangneung beach. If the harbour falls, the south falls with it."),
      L("cha", "솔숲 사이로 적 오토바이가 보인다. 바다 쪽으로 몰아낸다.", "Enemy bikes between the pines. Drive them toward the sea."),
      L("park", "방파제 뒤에 피난민이 있다. 먼저 빼낸다.", "Civilians behind the breakwater. We pull them out first."),
      L("kim", "바닷바람이 짠데도… 이 항구는 지켜야 해요.", "The sea wind is salty… but this harbour has to hold.")
    ] },
    17: { ep: 7, ko: "울산 · 포항", en: "ULSAN & POHANG", when: "동해안 남하 · 울산 제철소 앞", whenEn: "THE SOUTHWARD PUSH · OUTSIDE THE ULSAN MILL", lines: [
      L("hq", "동해안을 남하하는 적을 울산·포항 공업지대에서 막아라. 제철소를 넘겨주지 마라.", "Hold the Ulsan and Pohang industrial belt against the southward push. Do not give up the mills."),
      L("kim", "용광로 불빛이… 밤인데도 하늘이 훤하네요.", "The furnaces… at night and the sky is still bright."),
      L("park", "조선소 크레인 밑으로 붙는다. 컨테이너 사이는 한 명씩 간다.", "We hug the shipyard cranes. Through the containers, one at a time."),
      L("kang", "저 불빛이 적의 공장이다. 끄고 간다.", "That glow is their factory. We put it out.")
    ] },
    12: { ep: 9, ko: "인천 상륙작전", en: "THE INCHEON LANDING", when: "20XX년 9월 15일 · 인천 앞바다", whenEn: "SEPTEMBER 15, 20XX · OFF INCHEON", lines: [
      L("hq", "상륙작전 개시. 전 상륙정, 해안으로!", "The landing has begun. All craft, make for the beach!"),
      L("kim", "우욱… 병장님, 배멀미가…", "Urgh… Sergeant, I'm going to be sick…"),
      L("park", "참아라. 해안에 내리면 멀미할 틈도 없다.", "Hold it in. Once we hit the beach you won't have time to be sick."),
      L("kang", "석 달을 밀렸다. 이제 우리가 밀고 올라간다.", "Three months of being pushed back. Now we push."),
      L("cha", "인천에 상륙이라고? …누가 그런 미친 짓을!", "A landing at Incheon? …Who would be mad enough!"),
      L("kang", "램프 내린다! 전원 돌격!", "Ramp going down! Everyone, go!")
    ] },
    14: { ep: 10, ko: "한강 도하", en: "CROSSING THE HAN", when: "상륙 일주일 뒤 · 한강 남단", whenEn: "A WEEK AFTER THE LANDING · SOUTH BANK OF THE HAN", lines: [
      L("hq", "한강 다리는 전부 끊겼다. 고무보트로 도하해 북단 교두보를 확보하라.", "Every bridge over the Han is down. Cross in rubber boats and take the north bank."),
      L("kim", "저… 수영 못 하는데요.", "Um… I can't swim."),
      L("park", "구명조끼 꽉 매. 엔진 소리 크다, 고개 숙이고 있어. 빠지면 내가 건진다.", "Strap that life vest tight. The engine is loud — keep your head down. If you go in, I'll fish you out."),
      L("cha", "한강을 헤엄쳐 오겠다고? 강물이 너희 무덤이 될 거다.", "You'd swim the Han? The river will be your grave."),
      L("kang", "서울이 바로 저기다. 약속 지키러 가자. 다리 위 사수부터 정리한다.", "Seoul is right there. Let's go keep that promise. Clear the gunners on the bridges first."),
      L("me", "엔진 최대로! 엄호는 제가 맡겠습니다.", "Full throttle! I've got the covering fire.")
    ] },
    1: { ep: 11, ko: "서울 수복", en: "RETAKE SEOUL", when: "상륙 열흘 뒤 · 서울", whenEn: "TEN DAYS AFTER THE LANDING · SEOUL", lines: [
      L("kim", "서울이다… 진짜 돌아왔어요.", "It's Seoul… we really came back."),
      L("park", "이자까지 받아낼 차례다, 막내.", "Time to collect the interest, kid."),
      L("hq", "숭례문 일대에 적 지휘부가 버티고 있다.", "Enemy command is dug in around Sungnyemun."),
      L("kang", "약속했지. 반드시 돌아온다고. 숭례문에 우리 깃발을 다시 건다.", "I promised we'd come back. Our flag goes up over Sungnyemun again."),
      L("civ", "국군이다! 국군이 돌아왔다!", "It's our army! They've come back!"),
      L("me", "모두 엎드리세요! 저희가 끝내겠습니다.", "Everyone get down! We'll finish this.")
    ] },
    18: { ep: 12, ko: "의정부·동두천", en: "UIJEONGBU & DONGDUCHEON", when: "서울 수복 직후 · 북쪽 산악 도로", whenEn: "RIGHT AFTER SEOUL · THE NORTHERN MOUNTAIN ROAD", lines: [
      L("hq", "서울을 되찾았다. 이제 북쪽 산악 도로로 올라가 적의 퇴로를 끊는다.", "Seoul is ours again. Now we take the northern mountain road and cut the enemy's way out."),
      L("kim", "산길이 끝이 없어요… 고개마다 적이 보입니다.", "The mountain road never ends… there's an enemy on every ridge."),
      L("park", "고개 위는 우리가 먼저 본다. 차는 골짜기에 세우고 걸어 올라간다.", "We see the ridge first. Park the trucks in the gully and climb on foot."),
      L("cha", "동두천까지만 가면 된다… 거기서 우리는 끝을 본다.", "Just make it to Dongducheon… and we end this there."),
      L("kang", "주민 대피로를 열어 둬라. 그 길이 우리 길이다.", "Keep the evacuation road open. That road is our road."),
      L("me", "알겠습니다. 고개 하나씩 넘어가겠습니다.", "Understood. We take the ridges one at a time.")
    ] },
    16: { ep: 13, ko: "수원 화성", en: "SUWON HWASEONG", when: "서울 수복 이틀 뒤 · 수원 북쪽 성곽길", whenEn: "TWO DAYS AFTER SEOUL · OUTSIDE SUWON'S NORTH WALL", lines: [
      L("hq", "낙동강을 돌파한 아군 주력이 오산까지 올라왔다. 수원에서 손을 맞잡는다.", "Our main force broke out of the Nakdong and has reached Osan. We link up at Suwon."),
      L("kang", "문제는 화성이다. 차 대좌 잔존 병력이 성벽을 끼고 버티고 있다.", "The problem is the fortress. Cha's rearguard is holding the walls."),
      L("kim", "수원 화성… 수학여행 때 성곽길 걸었던 데예요. 장안문 옆에 공심돈도 있고요.", "Hwaseong… I walked the wall on a school trip. There's a gun tower by Janganmun."),
      L("park", "그럼 길 안내는 네가 해라. 여장 틈으로 머리 내미는 놈부터 잡는다.", "Then you're our guide. We take whoever sticks his head between the crenels."),
      L("cha", "이 성은 이백 년을 버텼다. 너희 따위가 넘을 성벽이 아니다.", "These walls have stood two hundred years. They won't fall to the likes of you."),
      L("kang", "문화재다. 포격은 없다. 지프로 성곽을 따라 달려 장안문으로 들어간다.", "It's a national treasure. No artillery. We run the jeeps along the wall and go in through Janganmun."),
      L("me", "팔달문에서 남쪽 아군과 만나겠습니다. 출발하죠!", "We'll meet the southern force at Paldalmun. Let's go!")
    ] },
    22: { ep: 14, ko: "철원 평야", en: "CHEORWON PLAIN", when: "DMZ 남쪽 · 논과 철책", whenEn: "SOUTH OF THE DMZ · PADDIES AND WIRE", lines: [
      L("hq", "철원 평야는 넓고 열려 있다. 초소의 시야를 의식하며 북으로 간다.", "The Cheorwon plain is wide and open. Move north, mindful of the watchtowers."),
      L("park", "논두렁 사이로 차가 빠진다. 철책선을 따라 걷는다.", "The trucks sink in the paddy banks. We walk along the wire."),
      L("kim", "저기 초소에 불빛이 보여요. 저쪽도 우리를 보고 있어요.", "There's a light in that watchtower. They can see us too."),
      L("kang", "철책 너머가 바로 북이다. 여기서 끝을 본다.", "Past the wire is the north. We finish it here."),
      L("me", "알겠습니다. 초소부터 하나씩 정리하겠습니다.", "Understood. We clear the towers one by one.")
    ] },
    2: { ep: 15, ko: "DMZ · 판문점", en: "DMZ & PANMUNJOM", when: "북진 · 비무장지대", whenEn: "THE ADVANCE NORTH · THE DMZ", lines: [
      L("hq", "남방한계선 돌파를 허가한다. 판문점을 확보하라.", "You're cleared to cross the southern boundary. Secure Panmunjom."),
      L("park", "GOP 근무할 때 저 철책을 매일 봤지. 넘어갈 날이 올 줄은 몰랐다.", "I stared at that fence every day on guard duty. Never thought I'd cross it."),
      L("kim", "지뢰 지대는… 괜찮은 겁니까?", "The minefields… are we okay?"),
      L("kang", "공병이 길을 냈다. 길 밖으로 한 발짝도 벗어나지 마.", "The engineers cleared a lane. Don't step one foot outside it."),
      L("cha", "여기서부턴 우리 땅이다. 한 걸음마다 피를 흘리게 될 거다.", "From here on it's our ground. Every step will cost you."),
      L("park", "말은 끝까지 많네.", "Still talking, that one.")
    ] },
    3: { ep: 16, ko: "평화의 집", en: "PEACE HOUSE", when: "판문점 · 군사분계선", whenEn: "PANMUNJOM · THE LINE", lines: [
      L("hq", "평화의 집 일대에 적 특수부대가 침투했다.", "Enemy special forces have moved into the Peace House grounds."),
      L("kim", "이름이 평화의 집인데… 여기서 싸워야 하네요.", "It's called the Peace House… and we have to fight in it."),
      L("kang", "그러니 빨리 끝내자. 이름값 하게 돌려놓자고.", "Then let's be quick about it, and give it back its name."),
      L("park", "도보다리 건너면 판문각이다. 엄폐 잘 해.", "Across the footbridge is Panmungak. Stay in cover."),
      L("me", "선두는 제가 서겠습니다.", "I'll lead.")
    ] },
    13: { ep: 17, ko: "개성공단", en: "KAESONG", when: "북진 · 개성공업지구 상공", whenEn: "THE ADVANCE · OVER KAESONG", lines: [
      L("hq", "개성공업지구를 탈환한다. 정문 앞까지 헬기로 강습 진입하라.", "We retake the Kaesong complex. Air assault to the main gate."),
      L("kim", "여기… 남북이 같이 일하던 곳이죠? 뉴스에서 봤어요.", "This is… where North and South used to work together, right? I saw it on the news."),
      L("park", "그래. 공장은 멀쩡하다더라. 사람만 바뀌었지.", "That's the one. They say the factories are fine. Only the people changed."),
      L("cha", "개성은 평양으로 가는 문이다. 이 문은 열리지 않는다.", "Kaesong is the door to Pyongyang. That door stays shut."),
      L("kang", "문이면 열면 되지. 공장 건물은 최대한 살린다, 노동자 오사 금지.", "Then we open it. Spare the factories where we can — and no one shoots a worker."),
      L("park", "착륙 지점까지 지상 사격이 셀 거다. 도어건은 내가 맡는다.", "Ground fire will be heavy all the way in. I'll take the door gun."),
      L("me", "착륙하면 제가 먼저 내리겠습니다.", "When we touch down, I'm first out.")
    ] },
    20: { ep: 18, ko: "남포 서해갑문", en: "NAMPO SEA LOCK", when: "평양 직전 · 서해안 갑문 둑길", whenEn: "JUST SHORT OF PYONGYANG · THE SEA-LOCK DIKE", lines: [
      L("hq", "평양이 가깝다. 남포 서해갑문을 넘어야 평양 서쪽 길이 열린다.", "Pyongyang is close. Cross the Nampo sea lock and the western road to the city opens."),
      L("park", "갑문 문짝이 저렇게 클 줄 몰랐습니다. 우리 키의 열 배는 되겠네.", "I didn't know the gates were this big. Ten times our height."),
      L("kang", "문짝 밑으로 기어가진 않는다. 둑길 위로 간다. 난간 뒤를 믿어라.", "We don't crawl under the gates. We take the dike road. Trust the railings."),
      L("kim", "바닷바람이 차갑네요… 평양 쪽 하늘이 조금 붉어 보여요.", "The sea wind is cold… and the sky over Pyongyang looks a little red."),
      L("me", "저 불빛이 마지막 경계선입니다. 제가 먼저 갑니다.", "That light is the last checkpoint. I'll go first.")
    ] },
    4: { ep: 19, ko: "평양 진입", en: "INTO PYONGYANG", when: "북진 · 눈보라 속 평양", whenEn: "THE ADVANCE · PYONGYANG IN THE SNOW", lines: [
      L("hq", "평양 외곽 돌파. 마지막 시가전이다.", "We're through the outskirts. This is the last street fight."),
      L("kim", "눈이… 손가락이 얼 것 같습니다.", "This snow… I can't feel my fingers."),
      L("park", "총은 품에 안고 다녀. 얼면 안 나간다.", "Keep your rifle under your coat. A frozen gun won't fire."),
      L("cha", "평양은 무너지지 않는다! 광장에서 기다리겠다.", "Pyongyang does not fall! I'll be waiting in the square."),
      L("kang", "기다려 준다니 고맙군. 늦지 않게 가 주자.", "Kind of him to wait. Let's not be late.")
    ] },
    15: { ep: 20, ko: "흥남", en: "HEUNGNAM", when: "평양 함락 이틀 뒤 · 동해안 흥남선", whenEn: "TWO DAYS AFTER PYONGYANG · THE EAST-COAST LINE", lines: [
      L("hq", "차 대좌의 잔존 병력이 열차로 흥남을 거쳐 북쪽으로 빠진다. 옆 선로로 따라붙어라.", "Cha's remnants are pulling north by train through Heungnam. Run them down on the next track."),
      L("kim", "기차로 기차를 쫓는 거예요? 진짜요?", "We're chasing a train… with a train? Seriously?"),
      L("park", "평판차 위에 모래주머니 쌓아놨다. 화차 문 열리면 그게 사격 신호야.", "Sandbags are stacked on the flatcar. When their box-car doors slide open, that's your cue."),
      L("cha", "흥남은 우리가 지킨다. 너희가 닿을 즈음엔 부두는 텅 비어 있을 거다.", "Heungnam is ours. By the time you get there, the docks will be empty."),
      L("kang", "부두에 아직 피난민이 남아 있다는 첩보다. 그들부터 지킨다.", "Word is there are still refugees down at the docks. They come first."),
      L("me", "옆 선로는 제가 맡겠습니다. 끝까지 따라붙죠.", "I'll take the next track. We stay on them all the way.")
    ] },
    19: { ep: 21, ko: "원산 낙하", en: "THE WONSAN DROP", when: "동해안 북진 · 원산 상공", whenEn: "THE NORTHERN PUSH · OVER WONSAN", lines: [
      L("hq", "원산 해변에 낙하하라. 항구를 확보해 북진로를 연다.", "Drop onto the Wonsan beach. Take the harbour and open the road north."),
      L("park", "바다가 가까워진다. 낙하산 줄을 잡아라.", "The sea is coming up. Hold the lines."),
      L("kang", "해송 숲 뒤로 붙는다. 명사십리는 우리가 먼저 밟는다.", "We go to ground behind the pine wood. Myeongsa-sim is ours first."),
      L("kim", "저 해변 리조트에 아직 사람이 있어요…", "There are still people in that beach resort…")
    ] },
    23: { ep: 22, ko: "신의주", en: "SINUIJU", when: "압록강 철교 앞 · 신의주", whenEn: "BEFORE THE YALU BRIDGE · SINUIJU", lines: [
      L("hq", "신의주다. 압록강 철교를 건너면 북쪽 마지막 길이 열린다. 다리를 확보하라.", "Sinuiju. Cross the Yalu rail bridge and the last road north opens. Take the bridge."),
      L("kang", "다리 위는 적의 저격 자리다. 강변 건물 사이로 붙어 간다.", "The bridge is a sniper nest. We move along the riverside buildings."),
      L("park", "철교 아래 강변 도로에 장갑차가 두 대 있다.", "Two armoured vehicles on the riverside road under the bridge."),
      L("kim", "강 건너 하늘이 벌써 차갑네요… 백두산 쪽인가 봐요.", "The sky across the river is already cold… that must be the Paektu side."),
      L("cha", "다리만 넘으면 백두산이다. 한 발씩 간다.", "Cross the bridge and it's Paektu. One step at a time.")
    ] },
    5: { ep: 23, ko: "압록강 · 백두산", en: "YALU & PAEKTU", when: "마지막 작전 · 국경 도로", whenEn: "THE LAST OPERATION · THE BORDER ROAD", lines: [
      L("hq", "흥남 확보. 적 지휘관 차 대좌가 국경 방면으로 도주 중.", "Heungnam is ours. Colonel Cha is running for the border."),
      L("kang", "여기서 놓치면 다시 시작이다. 끝까지 쫓는다.", "If he gets away, this starts all over again. We run him down."),
      L("kim", "운전은 제가 하겠습니다! …면허는 2종 보통이지만요.", "I'll drive! …I've only got a car licence, though."),
      L("park", "하하, 지프는 1종이다, 막내. 그래도 밟아!", "Ha! That's a truck licence job, kid. Floor it anyway!"),
      L("cha", "따라올 테면 따라와라. 백두산에서 끝을 보자.", "Follow me if you dare. We finish this at Paektu."),
      L("me", "…끝을 보러 가겠습니다.", "…Then let's finish it."),
      L("kang", "전원 탑승! 출발!", "Everyone in! Go!")
    ] }
  };
  /* (v63) endings: a short one after every mission, a chapter ending after
     the last mission of chapters 1 and 2, and the grand ending after the
     last mission of all. `narr` is narration (no portrait). */
  const ENDS = {
    6: { ko: "철수", en: "WITHDRAWAL", when: "서울 · 한강 남단", whenEn: "SEOUL · SOUTH OF THE HAN", lines: [
      L("narr", "마지막 피난 행렬이 한강을 건넜다. 다리 뒤로 서울이 타오르고 있었다.", "The last column of refugees crossed the Han. Behind the bridge, Seoul was burning."),
      L("kim", "다 건넜어요… 우리가 버틴 덕분에요.", "They all made it across… because we held."),
      L("kang", "고개 들어, 김 일병. 우린 진 게 아니다. 시간을 산 거다.", "Chin up, Kim. We didn't lose. We bought time."),
      L("park", "이자 붙여서 받으러 올 거다. 꼭.", "And we'll be back to collect. With interest.")
    ] },
    7: { ko: "대전 지연전", en: "THE DELAY AT DAEJEON", when: "대전역 · 해 질 녘", whenEn: "DAEJEON STATION · SUNSET", lines: [
      L("hq", "지연 성공. 후방 방어선 구축까지 하루를 벌었다.", "Delay successful. You bought the rear line a full day."),
      L("kim", "하루요? 그거 하나 벌려고…", "A day? All that, for one day…"),
      L("kang", "전쟁에서 하루는 도시 하나다. 잘했다.", "In a war, a day is a city. Well done.")
    ] },
    8: { ko: "낙동강", en: "THE NAKDONG", when: "대구 · 방어선", whenEn: "DAEGU · THE LINE", lines: [
      L("park", "여기서는 한 발짝도 안 물러났다. 처음으로.", "We didn't give an inch here. First time."),
      L("civ", "군인 아저씨들, 주먹밥이라도 드세요.", "Soldiers, please — have some rice balls."),
      L("kim", "…엄마가 해주던 맛이에요.", "…Tastes like my mum's."),
      L("kang", "먹어 둬. 내일도 버텨야 한다.", "Eat up. We hold again tomorrow.")
    ] },
    9: { ko: "빛고을", en: "CITY OF LIGHT", when: "광주 · 금남로", whenEn: "GWANGJU · GEUMNAM-RO", lines: [
      L("hq", "광주 방면 우회 부대 격퇴. 호남선 보급로가 살았다.", "The flanking force is broken. The southwest supply line lives."),
      L("park", "비 맞으며 싸운 보람이 있네.", "Worth fighting soaked to the skin."),
      L("me", "시민들이 창문에서 손을 흔들고 있습니다.", "People are waving from the windows.")
    ] },
    10: { ko: "천년의 탑", en: "THE THOUSAND-YEAR TOWER", when: "경주 · 대릉원", whenEn: "GYEONGJU · THE TOMBS", lines: [
      L("kim", "탑, 멀쩡해요! 첨성대도요!", "The pagoda's fine! The observatory too!"),
      L("kang", "천 년을 버틴 걸 우리 때 무너뜨릴 순 없지.", "It stood a thousand years. It wasn't falling on our watch."),
      L("park", "다음은 부산이다. 마지막 선이야.", "Busan's next. The last line.")
    ] },
    11: { ko: "최후 방어선", en: "THE LAST PERIMETER", when: "부산 · 새벽", whenEn: "BUSAN · DAWN", lines: [
      L("narr", "밤새 이어진 공세가 멎었다. 수평선 위로 해가 떠올랐다.", "The night-long assault fell quiet. The sun rose over the sea."),
      L("hq", "부산 방어선 유지. 전 부대, 잘 버텼다.", "The Busan perimeter holds. All units — you held."),
      L("kim", "살았어요… 우리 살아 있어요.", "We're alive… we're actually alive.")
    ] },
    21: { ko: "솔숲의 바람", en: "THE PINE WIND", when: "강릉 · 해변 솔숲", whenEn: "GANGNEUNG · THE PINE GROVE", lines: [
      L("narr", "해송 사이로 바닷바람이 불었다. 항구의 불빛이 하나씩 켜졌다.", "The sea wind came through the pines. The harbour lights came on one by one."),
      L("kim", "피난민 배가 무사히 떠났어요.", "The refugee boats left safely.")
    ] },
    17: { ko: "쇳물", en: "MOLTEN STEEL", when: "울산 · 제철소", whenEn: "ULSAN · THE STEEL MILL", lines: [
      L("narr", "불이 꺼진 제철소 위로 새벽 기적이 울렸다.", "Over the dark steelworks, a dawn whistle sounded."),
      L("kang", "이 쇳물은 이제 우리 편이다. 다음은 부산이다.", "This steel is ours now. Busan is next.")
    ] },
    12: { ko: "상륙 성공", en: "ASHORE", when: "인천 · 월미도", whenEn: "INCHEON · WOLMIDO", lines: [
      L("park", "봐라, 막내. 이게 반격이라는 거다.", "Look at that, kid. That's what a counterstrike looks like."),
      L("kim", "바다가 온통 우리 배예요!", "The sea's full of our ships!"),
      L("kang", "이제 서울로 간다. 돌아가겠다는 약속, 지킬 때다.", "Now we go to Seoul. Time to keep that promise.")
    ] },
    14: { ko: "북단 호안", en: "THE NORTH BANK", when: "한강 · 용산", whenEn: "THE HAN · YONGSAN", lines: [
      L("kim", "다리 없이 건넜어요… 엔진 소리 아직도 귀에서 울려요.", "We crossed without a bridge… my ears are still ringing from the engine."),
      L("park", "서울역이 코앞이다. 숨 돌려.", "Seoul Station's right there. Catch your breath."),
      L("kang", "내일 아침, 숭례문이다.", "Tomorrow morning — Sungnyemun.")
    ] },
    1: { ko: "깃발", en: "THE FLAG", when: "서울 · 숭례문", whenEn: "SEOUL · SUNGNYEMUN", lines: [
      L("narr", "숭례문 위로 태극기가 다시 올랐다.", "The Taegukgi rose over Sungnyemun once more."),
      L("civ", "돌아왔어… 정말 돌아왔어!", "They're back… they really came back!"),
      L("kang", "약속 지켰다. 이제 남쪽 아군과 손잡으러 간다.", "Promise kept. Now we go to meet the southern force.")
    ] },
    18: { ko: "고개 너머", en: "OVER THE RIDGE", when: "동두천 · 산악 도로 끝", whenEn: "DONGDUCHEON · THE END OF THE MOUNTAIN ROAD", lines: [
      L("narr", "산 능선 위로 아침 안개가 걷혔다. 동두천 읍내가 눈 아래 보였다.", "Morning mist lifted off the ridges. The town of Dongducheon lay below."),
      L("kim", "길이 뚫렸어요. 피난민 차들이 내려갑니다.", "The road's open. The refugee cars are coming down."),
      L("kang", "좋다. 이 길은 다시는 적의 퇴로가 되지 않는다.", "Good. This road won't be the enemy's way out again.")
    ] },
    16: { ko: "팔달문의 악수", en: "HANDSHAKE AT PALDALMUN", when: "수원 · 팔달문", whenEn: "SUWON · PALDALMUN", lines: [
      L("hq", "남쪽 주력과 연결 확인. 포위망이 닫혔다.", "Link-up confirmed with the southern force. The ring is closed."),
      L("kim", "저기 우리 군이에요! 낙동강에서 온!", "That's our army over there! All the way from the Nakdong!"),
      L("park", "부산에서 같이 버티던 얼굴들이네.", "Faces from the Busan line.")
    ] },
    22: { ko: "철책 뒤의 들", en: "THE PLAIN BEHIND THE WIRE", when: "철원 · 평야 끝", whenEn: "CHEORWON · THE EDGE OF THE PLAIN", lines: [
      L("narr", "들판 너머로 해가 떠올랐다. 철책 이쪽에서 본 북녘은 조용했다.", "The sun came up over the plain. From this side of the wire, the north was quiet."),
      L("kang", "좋다. 다음은 판문점이다.", "Good. Next is Panmunjom.")
    ] },
    2: { ko: "철책 너머", en: "PAST THE WIRE", when: "판문점 · JSA", whenEn: "PANMUNJOM · JSA", lines: [
      L("park", "넘었다. 진짜로 넘었어.", "We're across. We really crossed it."),
      L("kim", "발밑 조심… 공병이 낸 길만 밟을게요.", "Watching my step… only the engineers' lane."),
      L("kang", "판문점 확보. 다음은 평화의 집이다.", "Panmunjom is ours. The Peace House next.")
    ] },
    3: { ko: "이름값", en: "LIVING UP TO THE NAME", when: "판문점 · 도보다리", whenEn: "PANMUNJOM · THE FOOTBRIDGE", lines: [
      L("kim", "이제 다시 평화의 집이네요.", "It's the Peace House again now."),
      L("kang", "언젠가 여기서 다시 악수하는 날이 오겠지.", "One day there'll be handshakes here again."),
      L("hq", "개성 방면으로 진격하라.", "Advance on Kaesong.")
    ] },
    13: { ko: "정문", en: "THE MAIN GATE", when: "개성공업지구", whenEn: "KAESONG INDUSTRIAL ZONE", lines: [
      L("park", "공장은 거의 멀쩡하다. 다행이야.", "Factories are mostly intact. Good."),
      L("civ", "…남쪽 사람들이 다시 왔네요.", "…The southerners have come back."),
      L("kang", "평양으로 간다. 문은 열렸다.", "On to Pyongyang. The door's open.")
    ] },
    20: { ko: "갑문 개방", en: "THE LOCK OPENS", when: "남포 · 서해갑문", whenEn: "NAMPO · THE SEA LOCK", lines: [
      L("narr", "둑길 끝 갑문의 수문이 천천히 열렸다. 서해의 물이 다시 제 길을 찾았다.", "At the end of the dike the lock gates swung open. The West Sea found its way again."),
      L("hq", "남포 확보. 평양 진입 준비하라.", "Nampo secured. Prepare to enter Pyongyang.")
    ] },
    4: { ko: "눈 내린 광장", en: "THE SQUARE IN THE SNOW", when: "평양 · 광장", whenEn: "PYONGYANG · THE SQUARE", lines: [
      L("hq", "평양 광장 확보. 그러나 차 대좌는 탈출했다.", "The square is ours. But Colonel Cha got out."),
      L("park", "기다린다더니 도망치냐.", "Said he'd wait. Then ran."),
      L("kang", "동해안 철길이다. 놓치지 않는다.", "He's on the east-coast line. We don't lose him.")
    ] },
    15: { ko: "흥남 부두", en: "THE HEUNGNAM DOCKS", when: "흥남항", whenEn: "HEUNGNAM PORT", lines: [
      L("narr", "부두에 남아 있던 피난민들이 배에 올랐다.", "The refugees left on the docks were taken aboard."),
      L("civ2", "고맙습니다… 이 은혜 잊지 않겠습니다.", "Thank you… we will never forget this."),
      L("kim", "이번엔 우리가 지켰어요. 서울 때랑은 반대로요.", "This time we were the ones who got them out. The other way round from Seoul."),
      L("kang", "마지막이다. 압록강으로.", "One last push. To the Yalu.")
    ] },
    19: { ko: "해송 숲", en: "THE PINE WOOD", when: "원산 · 명사십리", whenEn: "WONSAN · MYEONGSA-SIM", lines: [
      L("narr", "낙하산이 걷힌 해변 위로 아침 바람이 불었다.", "Over the beach, with the canopies folded, the morning wind came in."),
      L("kang", "항구는 넘어갔다. 다음은 북쪽 길이다.", "The harbour is ours. Next is the northern road.")
    ] },
    23: { ko: "국경의 아침", en: "MORNING AT THE BORDER", when: "신의주 · 철교 남단", whenEn: "SINUIJU · THE SOUTH END OF THE BRIDGE", lines: [
      L("narr", "철교 위로 안개가 걷혔다. 강 건너 백두산 능선이 보였다.", "The mist lifted off the rail bridge. Across the river, the Paektu ridge came into view."),
      L("hq", "신의주 확보. 마지막 목표는 백두산 천지다.", "Sinuiju secured. The last objective is Cheonji on Paektu.")
    ] },
    5: { ko: "천지", en: "CHEONJI", when: "백두산 · 천지", whenEn: "PAEKTU · THE CRATER LAKE", lines: [
      L("cha", "…이렇게 끝나는군.", "…So this is how it ends."),
      L("kang", "끝난 건 전쟁이다. 당신은 법정에서 마저 대답해.", "What's ended is the war. You'll answer the rest in a courtroom."),
      L("park", "후, 백두산 꼭대기에서 숨 좀 쉬어 보네.", "Phew. Finally get to breathe on top of Paektu.")
    ] }
  };
  const CHAPTERS = {
    1: { after: 11, ko: "CHAPTER 1 · 남침", en: "CHAPTER 1 · INVASION", title: "버틴 자들", titleEn: "THOSE WHO HELD", lines: [
      L("narr", "서울에서 부산까지, 석 달. 지도 위의 선은 매일 남쪽으로 밀려났다.", "Seoul to Busan in three months. Every day the line on the map moved south."),
      L("narr", "그러나 낙동강에서, 그리고 부산 앞바다에서 선은 더 이상 움직이지 않았다.", "But at the Nakdong, and at the sea off Busan, the line stopped moving."),
      L("kim", "소대장님, 우리… 이제 반격하는 거죠?", "Lieutenant… we're hitting back now, right?"),
      L("kang", "그래. 이제부터 지도 위의 선은 북쪽으로 간다.", "We are. From now on that line moves north."),
      L("hq", "작전명 크로마이트. 인천으로 간다.", "Operation Chromite. We go to Incheon.")
    ] },
    2: { after: 22, ko: "CHAPTER 2 · 반격", en: "CHAPTER 2 · COUNTERSTRIKE", title: "돌아온 사람들", titleEn: "THE ONES WHO CAME BACK", lines: [
      L("narr", "인천에서 한강으로, 서울에서 수원으로. 남과 북에서 온 두 군대가 팔달문에서 만났다.", "Incheon to the Han, Seoul to Suwon. Two armies, one from the south and one from the sea, met at Paldalmun."),
      L("park", "부산에서 헤어질 때, 다시 볼 줄 몰랐다.", "When we split up at Busan, I never thought we'd see them again."),
      L("kim", "다들 살아 있어요. 다들…", "Everyone's alive. Everyone…"),
      L("cha", "아직 끝나지 않았다. 휴전선 너머에서 기다리겠다.", "It isn't over. I'll be waiting past the line."),
      L("kang", "38선이다. 이번엔 우리가 넘는다.", "The 38th parallel. This time we're the ones who cross.")
    ] },
    3: { after: 5, final: true, ko: "FINAL · 북진", en: "FINAL · NORTHWARD", title: "다시, 봄", titleEn: "SPRING, AGAIN", lines: [
      L("narr", "천지 위로 아침 해가 떠올랐다. 국경의 포성이 멎었다.", "The morning sun rose over Cheonji. The guns at the border fell silent."),
      L("hq", "전 부대에 알린다. 적 총사령부 항복. 작전을 종료한다. …수고했다.", "All units: enemy high command has surrendered. Operations are over. …Well done."),
      L("kim", "끝났어요…? 정말요? 그럼 저 집에 가도 돼요?", "It's over…? Really? Can I… can I go home?"),
      L("park", "가라, 막내. 어머니 주먹밥 먹으러. 대신 나도 데려가.", "Go, kid. Go eat your mum's rice balls. Take me with you, though."),
      L("kang", "서울에서 시작해 백두산까지. 한 명도 빠짐없이 여기 서 있다.", "From Seoul all the way to Paektu. And every one of us is standing here."),
      L("kang", "고맙다. 네가 있어서 끝까지 왔다.", "Thank you. We made it this far because you were with us."),
      L("me", "…다 같이 돌아가죠. 집으로.", "…Let's all go back. Home."),
      L("narr", "그해 봄, 서울의 벚꽃은 유난히 일찍 피었다.", "That spring, the cherry blossoms in Seoul came out early.")
    ] }
  };
  window.MGStory = { cast: CAST, eps: EPS, ends: ENDS, chapters: CHAPTERS };
})();
