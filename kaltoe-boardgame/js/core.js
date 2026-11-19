/* ===== Shared sound engine (used by all games) ===== */
const SFX=(()=>{
  let ctx=null, on=(()=>{try{return localStorage.getItem('sfx_on')!=='0';}catch(e){return true;}})();
  function ac(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();return ctx;}
  function tone(freq,dur,type="sine",gain=0.2,slideTo){
    if(!on)return;const c=ac();const t=c.currentTime;
    const o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slideTo)o.frequency.exponentialRampToValueAtTime(slideTo,t+dur);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(gain,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+0.02);
  }
  function noise(dur,gain=0.15){
    if(!on)return;const c=ac();const t=c.currentTime;
    const buf=c.createBuffer(1,Math.max(1,c.sampleRate*dur),c.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
    const s=c.createBufferSource();s.buffer=buf;
    const g=c.createGain();g.gain.value=gain;
    const f=c.createBiquadFilter();f.type="highpass";f.frequency.value=1200;
    s.connect(f).connect(g).connect(c.destination);s.start(t);
  }
  return {
    resume(){try{ac().resume();}catch(e){}},
    suspend(){try{if(ctx)ctx.suspend();}catch(e){}},
    toggle(){on=!on;try{localStorage.setItem('sfx_on',on?'1':'0');}catch(e){}return on;},
    isOn(){return on;},
    select(){tone(520,0.06,"triangle",0.12);},
    move(){tone(300,0.09,"sine",0.22,180);noise(0.05,0.08);},
    place(){tone(420,0.05,"sine",0.2,260);noise(0.04,0.09);},   // stone click (omok)
    capture(){noise(0.12,0.22);tone(160,0.14,"square",0.18,90);},
    check(){tone(880,0.12,"sawtooth",0.18);setTimeout(()=>tone(1175,0.14,"sawtooth",0.18),110);},
    // rising triumphant arpeggio
    win(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.24,"triangle",0.2),i*130));},
    // descending sad tones
    lose(){[440,392,330,247].forEach((f,i)=>setTimeout(()=>tone(f,0.3,"sine",0.2,f*0.94),i*180));},
    draw(){tone(392,0.25,"sine",0.18,330);},
    jump(){tone(460,0.07,"square",0.1,780);},
    djump(){tone(640,0.07,"square",0.1,1020);},
    land(){noise(0.05,0.1);tone(130,0.05,"sine",0.08);},
    stomp(){noise(0.08,0.15);tone(250,0.09,"square",0.13,100);},
    hurt(){tone(190,0.11,"sawtooth",0.13,70);noise(0.09,0.12);},
    dash(){noise(0.06,0.09);tone(700,0.06,"square",0.1,1200);},
    coin(){tone(988,0.05,"square",0.1);setTimeout(()=>tone(1480,0.08,"square",0.09),55);},
    step(){noise(0.02,0.035);},
    wave(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.14,"triangle",0.16),i*80));}
  };
})();
window.addEventListener('pointerdown',()=>SFX.resume(),{once:true});
// Toss game checklist: no sound while the app is in the background (call, app switch, ad)
document.addEventListener('visibilitychange',()=>{if(document.hidden)SFX.suspend();else SFX.resume();});

/* ===== 실행 환경 =====
   'toss'  앱인토스 미니앱 (토스 SDK 있음)
   'web'   일반 모바일 웹 / PWA / 구글플레이 TWA 빌드 (토스 SDK 없음)
   빌드가 window.APP_PLATFORM 을 심고, 없으면 토스 브릿지 존재 여부로 판단한다. */
const PLATFORM=(()=>{
  try{ if(window.APP_PLATFORM)return window.APP_PLATFORM; return (window.Toss&&window.Toss.inToss)?'toss':'web'; }catch(e){ return 'web'; }
})();
window.PLATFORM=PLATFORM;
const inToss=()=>{try{return PLATFORM==='toss'&&!!(window.Toss&&window.Toss.inToss);}catch(e){return false;}};
window.inTossApp=inToss;

/* ===== Haptics — 진동 하나로 모은 스위치 (Toss.haptic · navigator.vibrate) =====
   설정에서 끄면 두 경로 모두 실제로 멈춘다. 키는 UIX 설정과 같은 'uix_vib'. */
const Haptics=(()=>{
  const KEY='uix_vib';
  const read=()=>{try{const v=localStorage.getItem(KEY);return v==null?true:JSON.parse(v)!==false;}catch(e){return true;}};
  let on=read();
  const nativeVib=()=>typeof navigator!=='undefined'&&typeof navigator.vibrate==='function';
  const tossHaptic=()=>{try{return !!(window.Toss&&window.Toss.inToss&&typeof window.Toss.haptic==='function');}catch(e){return false;}};
  const supported=()=>tossHaptic()||nativeVib();
  const isOn=()=>on;
  function set(v){on=!!v;try{localStorage.setItem(KEY,JSON.stringify(on));}catch(e){} if(on)fire('basicWeak');return on;}
  // type: Toss haptic type / pattern: navigator.vibrate pattern
  function fire(type,pattern){
    if(!on)return false;
    if(tossHaptic()){try{window.Toss.haptic(type||'basicWeak');return true;}catch(e){}}
    if(nativeVib()){try{navigator.vibrate(pattern||(type==='success'?[12,40,12]:type==='basicMedium'?18:10));return true;}catch(e){}}
    return false;
  }
  return {isOn,set,fire,supported,on:()=>on};
})();
window.Haptics=Haptics;

/* ===== 행운 상자 확률표 — 상자를 여는 곳(chest.js)과 확률 안내 화면이 같은 표를 쓴다 =====
   가중치 합 100 = 퍼센트. 확률형 아이템 확률 공개(앱인토스 심사 요건)용 단일 출처. */
window.CHEST_TABLE=[
  {w:46,rar:'일반',cls:'n',pts:10},
  {w:24,rar:'일반',cls:'n',pts:20},
  {w:14,rar:'희귀',cls:'r',hint:2,pts:15},
  {w:9, rar:'희귀',cls:'r',pts:50},
  {w:5, rar:'영웅',cls:'e',hint:5,pts:60},
  {w:2, rar:'전설',cls:'l',pts:200,hint:10},
];
function omokToggleSnd(){const on=SFX.toggle();const b=document.getElementById('omokSndBtn');if(b)b.textContent=on?'🔊':'🔇';}
function janggiToggleSnd(){const on=SFX.toggle();const b=document.getElementById('janggiSndBtn');if(b)b.textContent=on?'🔊':'🔇';}

/* ================= 장기 튜토리얼 ================= */
const JanggiTutorial=(function(){
  function piece(col,label){ return '<div class="jgpiece-demo '+col+'">'+label+'</div>'; }
  function arrowRow(){ return '<span style="font-size:20px;opacity:.6">→</span>'; }
  const steps=[
    { title:'장기란?',
      visual: piece('b','楚')+arrowRow()+piece('r','漢'),
      body:'두 편이 각자의 <b>궁(왕)</b>을 지키며 상대 궁을 먼저 잡으면 이기는 게임이에요. 나는 <b>초(楚, 파랑)</b>, 상대는 <b>한(漢, 빨강)</b>을 맡아요. 아래쪽이 내 진영이고, 초가 먼저 둬요.' },
    { title:'기물 구성',
      visual: piece('b','車')+piece('b','馬')+piece('b','象')+piece('b','士')+piece('b','包')+piece('b','卒'),
      body:'각 편은 차(車) 2개, 마(馬) 2개, 상(象) 2개, 사(士) 2개, 포(包) 2개, 병/졸 5개, 그리고 궁(왕) 1개로 시작해요.' },
    { title:'궁성 (외통의 핵심)',
      visual: '<div class="jgboard-mini" style="grid-template-columns:repeat(3,1fr)">'
        +'<div class="cell">士</div><div class="cell">將</div><div class="cell">士</div>'
        +'<div class="cell"> </div><div class="cell">궁</div><div class="cell"> </div>'
        +'<div class="cell">卒</div><div class="cell">卒</div><div class="cell">卒</div></div>',
      body:'양쪽 끝의 3×3 칸이 <b>궁성</b>이에요. 궁(왕)과 사(士)는 궁성 밖으로 나갈 수 없고, 궁성 안에서는 대각선으로도 움직일 수 있어요 (궁성에 그어진 대각선 위에서만).' },
    { title:'차 (車) — 가장 강력',
      visual: piece('b','車'),
      body:'가로·세로로 <b>원하는 만큼</b> 움직여요. 체스의 룩과 같아요. 다른 기물을 뛰어넘을 수 없어요.' },
    { title:'포 (包) — 넘어야 움직인다',
      visual: piece('b','包'),
      body:'가로·세로로 움직이되, <b>반드시 다른 기물 하나를 넘어서</b> 이동해야 해요. 포끼리는 서로 넘을 수 없고, 넘는 기물이 없으면 아예 움직일 수 없어요.' },
    { title:'마 (馬) · 상 (象)',
      visual: piece('b','馬')+piece('b','象'),
      body:'<b>마</b>는 체스 나이트처럼 대각선으로 꺾어 움직이지만(1칸+대각선), 앞에 기물이 있으면 다리가 막혀 못 가요.<br><b>상</b>은 마보다 한 칸 더 나가는 대각선 이동이라 다리가 2군데예요.' },
    { title:'사 (士) · 병/졸',
      visual: piece('b','士')+piece('b','卒'),
      body:'<b>사</b>는 궁성 안에서만 한 칸씩(직선·대각선) 움직여 궁을 보좌해요.<br><b>병(한)/졸(초)</b>은 앞으로 한 칸, 또는 좌우로 한 칸 — 뒤로는 못 가요.' },
    { title:'장군 · 외통',
      visual: '<div style="font-size:26px;font-weight:800;color:#e0c020">장군!</div>',
      body:'상대 궁이 잡힐 위협을 받으면 "장군"이에요. 장군을 막을 방법이 전혀 없으면 <b>외통(체크메이트)</b>으로 승리합니다.' },
    { title:'빅장 규칙',
      visual: piece('b','楚')+' ↔ '+piece('r','漢'),
      body:'두 궁이 같은 세로줄에서 사이에 아무것도 없이 마주보면 <b>빅장</b>이에요. 이 상태를 만드는 수는 둘 수 없고, 서로 못 풀면 무승부가 됩니다.' },
    { title:'승리 조건',
      visual: '<div style="font-size:40px">🏆</div>',
      body:'상대 궁을 외통으로 잡으면 승리! 오른쪽 위 💡 힌트 버튼으로 추천 수도 볼 수 있어요. 이제 대국을 시작해 볼까요?' },
  ];
  let idx=0, openedFromSetup=false;
  function render(){
    const s=steps[idx];
    document.getElementById('janggiTutProgress').textContent=(idx+1)+' / '+steps.length;
    document.getElementById('janggiTutTitle').textContent=s.title;
    document.getElementById('janggiTutVisual').innerHTML=s.visual;
    document.getElementById('janggiTutBody').innerHTML=s.body;
    document.getElementById('janggiTutPrev').style.visibility = idx===0 ? 'hidden' : 'visible';
    document.getElementById('janggiTutNext').textContent = idx===steps.length-1 ? '완료' : '다음 →';
  }
  function open(){
    idx=0;
    const setupEl=document.getElementById('janggiSetup');
    openedFromSetup = !setupEl.classList.contains('hidden');
    setupEl.classList.add('hidden');
    document.getElementById('janggiTutorial').classList.add('show');
    render();
  }
  function close(){
    document.getElementById('janggiTutorial').classList.remove('show');
    if(openedFromSetup) document.getElementById('janggiSetup').classList.remove('hidden');
  }
  function next(){ if(idx>=steps.length-1){ close(); return; } idx++; render(); }
  function prev(){ if(idx>0){ idx--; render(); } }
  return { open, close, next, prev };
})();

/* ===== Persistent progress store =====
   Toss Storage inside the Toss app (follows the user), localStorage elsewhere, memory as last resort.
   Same API the games already use: await Store.get(key) / Store.set(key, value). */
const Store=(()=>{
  const PREFIX='minigames_v1_';
  const mem={};
  const T=()=>window.Toss&&window.Toss.storage;
  async function get(key){
    try{ const raw=T()?await T().get(PREFIX+key):localStorage.getItem(PREFIX+key); if(raw!=null)return JSON.parse(raw); }catch(e){}
    return key in mem?mem[key]:null;
  }
  async function set(key,val){
    mem[key]=val; const raw=JSON.stringify(val);
    try{ if(T())await T().set(PREFIX+key,raw); else localStorage.setItem(PREFIX+key,raw); }catch(e){}
  }
  const state=window.Toss&&window.Toss.inToss?'toss':'local';
  return {
    get,set,available:true,ready:Promise.resolve(true),
    status:()=>state,onStatus:f=>{f(state);return ()=>{};},
    async watchBoard(){return null;}, async names(){return {};}, myId:()=>null
  };
})();

/* ===== Leaderboard (launcher) ===== */
const Leaderboard=(()=>{
  const ICON={chess:'♛',omok:'⚫',janggi:'將',baduk:'◍',uno:'🃏'};
  let unsub=null,rows=[];
  async function render(){
    const list=document.getElementById('lbList');if(!list)return;
    if(!rows.length){list.innerHTML='<p class="lbempty">아직 기록이 없어요. 아케이드(스테이지) 모드를 클리어하면 여기에 올라가요!</p>';return;}
    const names=await Store.names(rows.map(r=>r.id)),me=Store.myId();
    list.innerHTML='';
    rows.forEach((r,i)=>{
      const row=document.createElement('div');row.className='lbrow'+(r.id===me?' me':'');
      const rank=document.createElement('b');rank.className='lbrank';rank.textContent=i<3?['🥇','🥈','🥉'][i]:String(i+1);
      const nm=document.createElement('span');nm.className='lbname';
      nm.textContent=((names[r.id]&&names[r.id].name)||'플레이어')+(r.id===me?' (나)':'');
      const gs=document.createElement('span');gs.className='lbgames';
      gs.textContent=Object.keys(ICON).map(g=>ICON[g]+((r.games&&r.games[g])||0)).join('  ');
      const tot=document.createElement('b');tot.className='lbtotal';tot.textContent=(r.total||0)+'★';
      row.append(rank,nm,gs,tot);list.appendChild(row);
    });
  }
  async function open(){
    document.getElementById('lbModal').classList.add('show');
    const list=document.getElementById('lbList');list.innerHTML='<p class="lbempty">불러오는 중…</p>';
    if(unsub)return;
    unsub=await Store.watchBoard(r=>{rows=r;render();},()=>{list.innerHTML='<p class="lbempty">순위표를 잠시 불러올 수 없어요.</p>';});
    if(!unsub)list.innerHTML='<p class="lbempty">순위표는 claude.ai에 로그인한 상태에서 게시된 링크로 열었을 때 보여요. 지금은 이 기기에만 기록이 저장돼요.</p>';
  }
  function close(){ document.getElementById('lbModal').classList.remove('show'); if(unsub){unsub();unsub=null;} }
  function showStatus(st){
    const el=document.getElementById('cloudStatus');if(!el)return;
    el.textContent= st==='cloud'?'☁️ 진행 상황이 내 계정에 저장돼요 (기기 간 동기화)'
      : st==='readonly'?'👀 보기 전용 권한 — 기록은 이 기기에만 저장돼요'
      : st==='pending'?'저장소 연결 중…':'💾 진행 상황은 이 기기에만 저장돼요';
  }
  document.addEventListener('DOMContentLoaded',()=>Store.onStatus(showStatus));
  if(document.readyState!=='loading')Store.onStatus(showStatus);
  return {open,close};
})();
