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
    civ2: { ko: "시민",    en: "CIVILIAN",  art: { role: "hostage", skin: "civ3" },                col: "#d8d4cc" }
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
    11: { ep: 6, ko: "부산", en: "BUSAN", when: "최후 방어선 · 부산", whenEn: "THE LAST PERIMETER · BUSAN", lines: [
      L("hq", "전 부대, 부산 외곽 최후 방어선으로 집결하라.", "All units, fall back to the final perimeter outside Busan."),
      L("kim", "이제 바다 말고는 물러날 데가 없네요.", "There's nowhere left to go but the sea."),
      L("kang", "그래서 여기서 끝낸다. 물러서는 건 오늘까지다.", "Which is why it ends here. Today is the last day we retreat."),
      L("kang", "그리고… 본부에서 반격 작전이 내려왔다. 목표는 인천.", "And… HQ has sent down a counter-offensive. The target is Incheon."),
      L("park", "인천? 하하, 드디어 우리 차례군.", "Incheon? Ha. Finally, our turn."),
      L("hq", "작전 개시까지 부산을 지켜라. 반드시.", "Hold Busan until the operation begins. Whatever it takes.")
    ] },
    12: { ep: 7, ko: "인천 상륙작전", en: "THE INCHEON LANDING", when: "20XX년 9월 15일 · 인천 앞바다", whenEn: "SEPTEMBER 15, 20XX · OFF INCHEON", lines: [
      L("hq", "상륙작전 개시. 전 상륙정, 해안으로!", "The landing has begun. All craft, make for the beach!"),
      L("kim", "우욱… 병장님, 배멀미가…", "Urgh… Sergeant, I'm going to be sick…"),
      L("park", "참아라. 해안에 내리면 멀미할 틈도 없다.", "Hold it in. Once we hit the beach you won't have time to be sick."),
      L("kang", "석 달을 밀렸다. 이제 우리가 밀고 올라간다.", "Three months of being pushed back. Now we push."),
      L("cha", "인천에 상륙이라고? …누가 그런 미친 짓을!", "A landing at Incheon? …Who would be mad enough!"),
      L("kang", "램프 내린다! 전원 돌격!", "Ramp going down! Everyone, go!")
    ] },
    1: { ep: 8, ko: "서울 수복", en: "RETAKE SEOUL", when: "상륙 열흘 뒤 · 서울", whenEn: "TEN DAYS AFTER THE LANDING · SEOUL", lines: [
      L("kim", "서울이다… 진짜 돌아왔어요.", "It's Seoul… we really came back."),
      L("park", "이자까지 받아낼 차례다, 막내.", "Time to collect the interest, kid."),
      L("hq", "숭례문 일대에 적 지휘부가 버티고 있다.", "Enemy command is dug in around Sungnyemun."),
      L("kang", "약속했지. 반드시 돌아온다고. 숭례문에 우리 깃발을 다시 건다.", "I promised we'd come back. Our flag goes up over Sungnyemun again."),
      L("civ", "국군이다! 국군이 돌아왔다!", "It's our army! They've come back!"),
      L("me", "모두 엎드리세요! 저희가 끝내겠습니다.", "Everyone get down! We'll finish this.")
    ] },
    2: { ep: 9, ko: "DMZ · 판문점", en: "DMZ & PANMUNJOM", when: "북진 · 비무장지대", whenEn: "THE ADVANCE NORTH · THE DMZ", lines: [
      L("hq", "남방한계선 돌파를 허가한다. 판문점을 확보하라.", "You're cleared to cross the southern boundary. Secure Panmunjom."),
      L("park", "GOP 근무할 때 저 철책을 매일 봤지. 넘어갈 날이 올 줄은 몰랐다.", "I stared at that fence every day on guard duty. Never thought I'd cross it."),
      L("kim", "지뢰 지대는… 괜찮은 겁니까?", "The minefields… are we okay?"),
      L("kang", "공병이 길을 냈다. 길 밖으로 한 발짝도 벗어나지 마.", "The engineers cleared a lane. Don't step one foot outside it."),
      L("cha", "여기서부턴 우리 땅이다. 한 걸음마다 피를 흘리게 될 거다.", "From here on it's our ground. Every step will cost you."),
      L("park", "말은 끝까지 많네.", "Still talking, that one.")
    ] },
    3: { ep: 10, ko: "평화의 집", en: "PEACE HOUSE", when: "판문점 · 군사분계선", whenEn: "PANMUNJOM · THE LINE", lines: [
      L("hq", "평화의 집 일대에 적 특수부대가 침투했다.", "Enemy special forces have moved into the Peace House grounds."),
      L("kim", "이름이 평화의 집인데… 여기서 싸워야 하네요.", "It's called the Peace House… and we have to fight in it."),
      L("kang", "그러니 빨리 끝내자. 이름값 하게 돌려놓자고.", "Then let's be quick about it, and give it back its name."),
      L("park", "도보다리 건너면 판문각이다. 엄폐 잘 해.", "Across the footbridge is Panmungak. Stay in cover."),
      L("me", "선두는 제가 서겠습니다.", "I'll lead.")
    ] },
    13: { ep: 11, ko: "개성공단", en: "KAESONG", when: "북진 · 개성공업지구 상공", whenEn: "THE ADVANCE · OVER KAESONG", lines: [
      L("hq", "개성공업지구를 탈환한다. 정문 앞까지 헬기로 강습 진입하라.", "We retake the Kaesong complex. Air assault to the main gate."),
      L("kim", "여기… 남북이 같이 일하던 곳이죠? 뉴스에서 봤어요.", "This is… where North and South used to work together, right? I saw it on the news."),
      L("park", "그래. 공장은 멀쩡하다더라. 사람만 바뀌었지.", "That's the one. They say the factories are fine. Only the people changed."),
      L("cha", "개성은 평양으로 가는 문이다. 이 문은 열리지 않는다.", "Kaesong is the door to Pyongyang. That door stays shut."),
      L("kang", "문이면 열면 되지. 공장 건물은 최대한 살린다, 노동자 오사 금지.", "Then we open it. Spare the factories where we can — and no one shoots a worker."),
      L("park", "착륙 지점까지 지상 사격이 셀 거다. 도어건은 내가 맡는다.", "Ground fire will be heavy all the way in. I'll take the door gun."),
      L("me", "착륙하면 제가 먼저 내리겠습니다.", "When we touch down, I'm first out.")
    ] },
    4: { ep: 12, ko: "평양 진입", en: "INTO PYONGYANG", when: "북진 · 눈보라 속 평양", whenEn: "THE ADVANCE · PYONGYANG IN THE SNOW", lines: [
      L("hq", "평양 외곽 돌파. 마지막 시가전이다.", "We're through the outskirts. This is the last street fight."),
      L("kim", "눈이… 손가락이 얼 것 같습니다.", "This snow… I can't feel my fingers."),
      L("park", "총은 품에 안고 다녀. 얼면 안 나간다.", "Keep your rifle under your coat. A frozen gun won't fire."),
      L("cha", "평양은 무너지지 않는다! 광장에서 기다리겠다.", "Pyongyang does not fall! I'll be waiting in the square."),
      L("kang", "기다려 준다니 고맙군. 늦지 않게 가 주자.", "Kind of him to wait. Let's not be late.")
    ] },
    5: { ep: 13, ko: "압록강 · 백두산", en: "YALU & PAEKTU", when: "마지막 작전 · 국경 도로", whenEn: "THE LAST OPERATION · THE BORDER ROAD", lines: [
      L("hq", "평양 광장 확보. 적 지휘관 차 대좌가 국경 방면으로 도주 중.", "The square is ours. Colonel Cha is running for the border."),
      L("kang", "여기서 놓치면 다시 시작이다. 끝까지 쫓는다.", "If he gets away, this starts all over again. We run him down."),
      L("kim", "운전은 제가 하겠습니다! …면허는 2종 보통이지만요.", "I'll drive! …I've only got a car licence, though."),
      L("park", "하하, 지프는 1종이다, 막내. 그래도 밟아!", "Ha! That's a truck licence job, kid. Floor it anyway!"),
      L("cha", "따라올 테면 따라와라. 백두산에서 끝을 보자.", "Follow me if you dare. We finish this at Paektu."),
      L("me", "…끝을 보러 가겠습니다.", "…Then let's finish it."),
      L("kang", "전원 탑승! 출발!", "Everyone in! Go!")
    ] }
  };
  window.MGStory = { cast: CAST, eps: EPS };
})();
