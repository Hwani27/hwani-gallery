/* ===== v2 quality manager (⚙️ 화질: 자동/높음/중간/낮음) — rendering resolution/shadows/particles only ===== */
(function(){
  const LEVELS={ultra:{pr:2.25,sh:1.5,p:1.25,name:'울트라',ss:1.5},high:{pr:2,sh:1,p:1,name:'높음'},mid:{pr:1.5,sh:.5,p:.6,name:'중간'},low:{pr:1,sh:.25,p:.35,name:'낮음'}};
  const ORDER=['ultra','high','mid','low'];const MODES=['auto','ultra','high','mid','low'];
  let mode='auto';try{const v=localStorage.getItem('gq_mode');if(MODES.includes(v))mode=v;}catch(e){}
  const PHONE=(function(){try{return matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<820;}catch(e){return false;}})();
  let autoLevel=PHONE?'mid':'high';
  const GQ=window.GQ={ver:1,renderers:[],
    get mode(){return mode;},
    get level(){return mode==='auto'?autoLevel:mode;},
    get cfg(){return LEVELS[GQ.level];},
    get particles(){return LEVELS[GQ.level].p;},
    n(k){return Math.max(1,Math.round(k*LEVELS[GQ.level].p));},
    setMode(m){if(!MODES.includes(m))return;mode=m;try{localStorage.setItem('gq_mode',m);}catch(e){}apply();},
    cycle(){GQ.setMode(MODES[(MODES.indexOf(mode)+1)%MODES.length]);toast();},
    label(){return mode==='auto'?('자동 ('+LEVELS[autoLevel].name+')'):LEVELS[mode].name;},
    fps:0,log:[],phone:PHONE};
  function apply(){
    GQ.ver++;
    GQ.renderers=GQ.renderers.filter(r=>r);
    GQ.renderers.forEach(r=>{try{r.setPixelRatio(r.__gqReq||1);}catch(e){}});
    updUI();
  }
  GQ._apply=apply;
  function applyShadows(sc){
    sc.__gqv=GQ.ver;const f=LEVELS[GQ.level].sh;
    sc.traverse(o=>{if(!o.isLight||!o.shadow||!o.shadow.mapSize)return;
      const ud=o.userData;if(ud.gqBase===undefined)ud.gqBase=o.shadow.mapSize.x;
      const sz=Math.max(256,Math.round(ud.gqBase*f));
      if(o.shadow.mapSize.x!==sz){o.shadow.mapSize.set(sz,sz);if(o.shadow.map){o.shadow.map.dispose();o.shadow.map=null;}}});
  }
  // wrap the renderer constructor (app-side; library untouched) so every renderer follows the quality level
  const Orig=THREE.WebGLRenderer;
  function GQRenderer(p){
    const r=new Orig(p);
    const spr=r.setPixelRatio.bind(r);
    r.setPixelRatio=function(v){r.__gqReq=v;const L=LEVELS[GQ.level],d=window.devicePixelRatio||1;spr(L.ss?Math.min(L.pr,Math.max(v,d*L.ss)):Math.min(v,L.pr,d));};
    const rnd=r.render.bind(r);let cnt=0;
    r.render=function(sc,cam){if(sc&&(sc.__gqv!==GQ.ver||(++cnt%90)===0))applyShadows(sc);return rnd(sc,cam);};
    GQ.renderers.push(r);
    return r;
  }
  GQRenderer.prototype=Orig.prototype;
  try{THREE.WebGLRenderer=GQRenderer;}catch(e){console.warn('GQ: renderer hook unavailable');}
  // ---- auto mode: watch real frame rate while a game is on screen; step down when below target (desktop: 60fps at 높음, phone: 30fps at 중간)
  let last=0,frames=0,t0=0,warm=0,curScreen=null;
  function activeGame(){const a=document.querySelector('.screen.active');return a&&a.id!=='launcher'?a.id:null;}
  function loop(now){
    requestAnimationFrame(loop);
    const g=activeGame();
    if(document.hidden||!g){curScreen=null;last=0;return;}
    if(g!==curScreen){curScreen=g;warm=now+2500;t0=0;frames=0;last=now;return;}
    const dt=now-last;last=now;
    if(dt>1500){warm=now+1000;t0=0;frames=0;return;}   // tab switch / long stall: not a perf signal
    if(now<warm)return;
    if(!t0){t0=now;frames=0;return;}
    frames++;
    const el=now-t0;
    if(el>=3000){
      const fps=frames*1000/el;GQ.fps=Math.round(fps);t0=now;frames=0;
      const thr=autoLevel==='high'?(PHONE?45:50):autoLevel==='mid'?(PHONE?27:36):0;
      if(mode==='auto'&&fps<thr){const i=ORDER.indexOf(autoLevel);
        if(i<ORDER.length-1){autoLevel=ORDER[i+1];GQ.log.push({fps:Math.round(fps),to:autoLevel,game:g});apply();warm=now+1500;toast('성능에 맞춰 화질을 '+LEVELS[autoLevel].name+'(으)로 조정했어요');}}
    }
  }
  requestAnimationFrame(loop);
  // ---- UI: floating ⚙️ pill on every screen (PC + phone)
  let btn,tst,tt;
  function updUI(){if(btn)btn.innerHTML='<span class="gqi">⚙️</span><span class="gql"> 화질: </span><b>'+GQ.label()+'</b>';}
  function toast(msg){if(!tst){tst=document.createElement('div');tst.id='gqToast';document.body.appendChild(tst);}
    tst.textContent=msg||('⚙️ 화질: '+GQ.label());tst.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>tst.classList.remove('on'),1800);}
  function mk(){btn=document.createElement('button');btn.id='gqBtn';btn.type='button';btn.title='화질 설정 (자동/울트라/높음/중간/낮음)';
    btn.addEventListener('click',e=>{e.stopPropagation();GQ.cycle();});document.body.appendChild(btn);updUI();}
  if(document.body)mk();else document.addEventListener('DOMContentLoaded',mk);
})();
