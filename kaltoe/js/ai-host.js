/* ===== Shared AI worker host — CPU thinking runs off the main thread ===== */
// Builds a Web Worker from a plain function (through a Blob, so it also works when the file is
// opened straight from disk). If Workers are unavailable or fail, the same code runs in-thread.
function makeAIWorker(workerFn){
  let w=null, local=null, inThread=false, seq=0;
  const pending=new Map();                       // id -> {resolve,msg}
  function deliver(d){const p=pending.get(d.id);if(p){pending.delete(d.id);p.resolve(d.result);}}
  function startLocal(){
    inThread=true;
    local={postMessage:(d)=>setTimeout(()=>deliver(d),0)};
    workerFn(local);
    pending.forEach(p=>{p.msg.inThread=true;setTimeout(()=>local.onmessage({data:p.msg}),0);});
  }
  function startWorker(){
    try{
      const url=URL.createObjectURL(new Blob(['('+workerFn.toString()+')(self);'],{type:'text/javascript'}));
      w=new Worker(url);
      w.onmessage=e=>deliver(e.data);
      w.onerror=e=>{try{e.preventDefault();}catch(_){} if(w){w.terminate();w=null;} if(!local)startLocal();};
    }catch(e){ w=null; startLocal(); }
  }
  startWorker();
  return {
    run(type,payload){
      const id=++seq, msg=Object.assign({id,type,inThread},payload);
      return new Promise(resolve=>{
        pending.set(id,{resolve,msg});
        if(w) w.postMessage(msg);
        else { msg.inThread=true; setTimeout(()=>local.onmessage({data:msg}),0); }
      });
    },
    // drop in-flight work (after undo/restart) so a stale search can't delay the next request
    cancel(){ pending.clear(); if(w){ w.terminate(); w=null; startWorker(); } },
    get busy(){ return pending.size>0; },
    get inThread(){ return inThread; }
  };
}

/* ===== Omok engine (runs inside the worker) — pattern threats + VCF + alpha-beta ===== */
// Self-contained. 15×15, 1 = black (renju-restricted when renju is on), 2 = white.
function OmokWorker(self){
  const N=15,NN=225,B=new Int8Array(NN),DIRS=[[0,1],[1,0],[1,1],[1,-1]];
  let renju=true;
  const inB=(r,c)=>r>=0&&r<N&&c>=0&&c<N;
  // line through p for color me: X me, . empty, B blocked (opponent or edge); center at index h
  function line(p,dr,dc,me,h){const r=(p/N)|0,c=p%N;let s='';
    for(let k=-h;k<=h;k++){const rr=r+dr*k,cc=c+dc*k;
      if(!inB(rr,cc))s+='B';else{const v=k===0?me:B[rr*N+cc];s+=v===me?'X':v===0?'.':'B';}}return s;}
  function runAt(p,dr,dc,me){const r=(p/N)|0,c=p%N;let n=1;
    for(let k=1;inB(r+dr*k,c+dc*k)&&B[(r+dr*k)*N+c+dc*k]===me;k++)n++;
    for(let k=1;inB(r-dr*k,c-dc*k)&&B[(r-dr*k)*N+c-dc*k]===me;k++)n++;return n;}
  // ---- renju forbidden points (same simplified rule set the game uses) ----
  function isFourLine(l){for(let i=0;i<=l.length-5;i++){if(i<=4&&i+5>4){const w=l.slice(i,i+5);
    const x=(w.match(/X/g)||[]).length,d=(w.match(/\./g)||[]).length;if(x===4&&d===1)return true;}}return false;}
  function isOpenThreeLine(l){for(const pat of['.XXX.','.XX.X.','.X.XX.']){let pos=l.indexOf(pat);
    while(pos!==-1){if(pos<=4&&pos+pat.length>4)return true;pos=l.indexOf(pat,pos+1);}}return false;}
  function forbidden(p){if(!renju||B[p])return false;let fours=0,threes=0,over=false,five=false;
    for(const[dr,dc]of DIRS){const l=line(p,dr,dc,1,4),run=runAt(p,dr,dc,1);
      if(run>=6)over=true;if(run===5)five=true;if(isFourLine(l))fours++;if(isOpenThreeLine(l))threes++;}
    if(five)return false;return over||fours>=2||threes>=2;}
  // ---- shape of one direction once a stone of `me` sits on p: 6 five … 1 two ----
  function shape(p,dr,dc,me){
    const run=runAt(p,dr,dc,me);
    if(run===5||(run>5&&!(me===1&&renju)))return 6;
    if(run>5)return 0;
    const l=line(p,dr,dc,me,5),h=5;
    let pos=l.indexOf('.XXXX.');while(pos!==-1){if(pos+1<=h&&h<=pos+4)return 5;pos=l.indexOf('.XXXX.',pos+1);}
    let four=false,three=false,two=false;
    for(let i=h-4;i<=h;i++){const w=l.slice(i,i+5);if(w.indexOf('B')>=0)continue;
      let x=0;for(let k=0;k<5;k++)if(w[k]==='X')x++;
      if(x===4)four=true;else if(x===3)three=true;else if(x===2)two=true;}
    if(four)return 4;
    for(const pat of['..XXX.','.XXX..','.XX.X.','.X.XX.']){let q=l.indexOf(pat);
      while(q!==-1){const a=q+pat.indexOf('X'),b=q+pat.lastIndexOf('X');if(a<=h&&h<=b)return 3;q=l.indexOf(pat,q+1);}}
    return three?2:two?1:0;}
  const FIVE=1e7,WINNING=1e6;
  function pointScore(p,me){
    if(B[p])return -1;if(me===1&&forbidden(p))return -1;
    let o4=0,f4=0,o3=0,t3=0,t2=0;
    for(const[dr,dc]of DIRS){const s=shape(p,dr,dc,me);
      if(s===6)return FIVE;if(s===5)o4++;else if(s===4)f4++;else if(s===3)o3++;else if(s===2)t3++;else if(s===1)t2++;}
    if(o4||f4>=2||(f4&&o3))return WINNING;
    if(o3>=2)return 1e5;
    const r=(p/N)|0,c=p%N;
    return f4*12000+o3*6000+t3*600+t2*120+(14-Math.abs(r-7)-Math.abs(c-7));}
  function cands(col){const out=[],near=new Uint8Array(NN);let any=false;
    for(let p=0;p<NN;p++)if(B[p]){any=true;const r=(p/N)|0,c=p%N;
      for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++){const rr=r+dr,cc=c+dc;if(inB(rr,cc))near[rr*N+cc]=1;}}
    if(!any)return [{p:112,a:1,d:0,pri:1}];
    for(let p=0;p<NN;p++){if(!near[p]||B[p])continue;
      const a=pointScore(p,col);if(a<0)continue;
      const d=Math.max(0,pointScore(p,3-col));
      out.push({p,a,d,pri:a+d*0.9});}
    out.sort((x,y)=>y.pri-x.pri);return out;}
  // ---- VCF: win by consecutive fours (the opponent's every reply is forced) ----
  let vNodes=0;
  function fourCompletion(col){for(let p=0;p<NN;p++)if(!B[p]&&pointScore(p,col)===FIVE)return p;return -1;}
  function vcf(col,depth){
    if(depth<=0||++vNodes>20000)return -1;
    const opp=3-col;
    for(let p=0;p<NN;p++){if(B[p])continue;const sc=pointScore(p,col);
      if(sc===FIVE)return p;}
    if(fourCompletion(opp)>=0)return -1;                  // opponent would win first
    const cs=cands(col);
    for(const c of cs){if(c.a<12000)continue;            // only moves that make a four
      B[c.p]=col;
      const block=fourCompletion(col);
      let ok=false;
      if(block<0){B[c.p]=0;continue;}
      if(opp===1&&forbidden(block))ok=true;              // black can't legally block there
      else{B[block]=opp;
        if(pointScore(block,opp)!==FIVE&&!wouldBeFive(block,opp)){ok=vcf(col,depth-1)>=0;}
        B[block]=0;}
      B[c.p]=0;
      if(ok)return c.p;}
    return -1;}
  function wouldBeFive(p,col){for(const[dr,dc]of DIRS){const n=runAt(p,dr,dc,col);if(n===5||(n>5&&!(col===1&&renju)))return true;}return false;}
  // ---- alpha-beta over the top threat moves ----
  let nodes=0,deadline=0,stop=false,K=8;
  const WIN=1e9;
  function negamax(col,depth,a,b,ply){
    if((++nodes&255)===0&&Date.now()>deadline)stop=true;
    const cs=cands(col);if(!cs.length)return 0;
    if(cs[0].a===FIVE||cs.some(c=>c.a===FIVE))return WIN-ply;
    const threats=cs.filter(c=>c.d===FIVE);
    if(threats.length>=2)return -(WIN-ply-1);
    if(depth<=0||stop){let my=0,op=0;for(const c of cs){if(c.a>my)my=c.a;if(c.d>op)op=c.d;}
      if(my>=WINNING&&!threats.length)return WIN/2-ply;
      return my-op*0.7;}
    const list=threats.length?threats:cs.slice(0,K);
    let best=-WIN*2;
    for(const c of list){B[c.p]=col;const v=-negamax(3-col,depth-1,-b,-a,ply+1);B[c.p]=0;
      if(v>best)best=v;if(v>a)a=v;if(a>=b)break;if(stop)break;}
    return best;}
  function think(d){
    B.set(d.board);renju=d.renju;const col=d.toPlay;nodes=0;vNodes=0;stop=false;K=d.K||8;
    const t0=Date.now();deadline=t0+(d.inThread?Math.min(d.ms,700):d.ms);
    const cs=cands(col);if(!cs.length)return {move:-1};
    const win=cs.find(c=>c.a===FIVE);if(win)return {move:win.p,why:'five'};
    const threats=cs.filter(c=>c.d===FIVE);if(threats.length)return {move:threats[0].p,why:'block'};
    if(d.vcf){const v=vcf(col,12);if(v>=0)return {move:v,why:'vcf'};}
    const wn=cs.find(c=>c.a>=WINNING);if(wn&&d.maxDepth>1)return {move:wn.p,why:'open4'};
    if(d.noise>0){ // weak levels: noisy pick among the strongest-looking points
      let best=cs[0],bv=-1e18;for(const c of cs.slice(0,12)){const v=c.pri+Math.random()*d.noise;if(v>bv){bv=v;best=c;}}
      return {move:best.p,why:'noise'};}
    let order=cs.slice(0,K),best=order[0],depthDone=0;
    for(let depth=1;depth<=d.maxDepth;depth++){
      let a=-WIN*2,cand=order[0],sc=-WIN*2;const vals=new Map();
      for(const c of order){B[c.p]=col;const v=-negamax(3-col,depth-1,-WIN*2,-a,1);B[c.p]=0;if(stop)break;
        vals.set(c,v);if(v>sc){sc=v;cand=c;}if(v>a)a=v;}
      if(stop&&depth>1)break;
      best=cand;depthDone=depth;
      order=order.slice().sort((x,y)=>(vals.get(y)??-WIN*3)-(vals.get(x)??-WIN*3));
      if(sc>=WIN/2)break;
      if(Date.now()-t0>(deadline-t0)*0.45)break;}
    return {move:best.p,depth:depthDone,nodes,why:'search'};}
  self.onmessage=(e)=>{const d=e.data;let result;
    try{result=think(d);}catch(err){result={error:String(err&&err.message||err)};}
    self.postMessage({id:d.id,result});};
}
/* ===== Janggi engine (runs inside the worker) — iterative deepening alpha-beta ===== */
// Self-contained. Squares r*9+c (10 rows × 9 cols). Pieces: 1 K,2 A,3 E,4 H,5 R,6 C,7 P; +8 = 'b' (top side).
// Move rules mirror the game's own moves(): palace diagonals, cannon screens, horse/elephant legs.
function JanggiWorker(self){
  const R=10,C=9,B=new Int8Array(90);let side=0;
  const VAL=[0,0,300,300,500,1300,700,200];
  const inB=(r,c)=>r>=0&&r<R&&c>=0&&c<C;
  const PAL=[[[0,3],[0,5],[2,3],[2,5],[1,4]],[[7,3],[7,5],[9,3],[9,5],[8,4]]];
  const isPal=(pts,r,c)=>pts.some(p=>p[0]===r&&p[1]===c);
  const inPalace=(r,c,top)=>c>=3&&c<=5&&(top?r<=2:r>=7);
  const palDiag=(r,c,rr,cc)=>Math.abs(r-rr)===1&&Math.abs(c-cc)===1&&PAL.some(pts=>isPal(pts,r,c)&&isPal(pts,rr,cc));
  const HLEG=[[-1,0,-2,-1],[-1,0,-2,1],[1,0,2,-1],[1,0,2,1],[0,-1,-1,-2],[0,-1,1,-2],[0,1,-1,2],[0,1,1,2]];
  const ELEG=[[-1,0,-3,-2,-1,-1],[-1,0,-3,2,-1,1],[1,0,3,-2,1,-1],[1,0,3,2,1,1],[0,-1,-2,-3,-1,-1],[0,-1,2,-3,1,-1],[0,1,-2,3,-1,1],[0,1,2,3,1,1]];
  const ORTH=[[1,0],[-1,0],[0,1],[0,-1]],DIAG=[[1,1],[1,-1],[-1,1],[-1,-1]];
  // pseudo-legal destinations for the piece on square s, pushed as s|to<<7
  function pieceMoves(s,out){
    const p=B[s],r=(s/9)|0,c=s%9,me=p&8,t=p&7,top=me===8;
    const land=(rr,cc)=>{if(!inB(rr,cc))return;const q=B[rr*9+cc];if(!q||(q&8)!==me)out.push(s|(rr*9+cc)<<7);};
    if(t===1||t===2){
      for(const[dr,dc]of ORTH){const rr=r+dr,cc=c+dc;if(inPalace(rr,cc,top))land(rr,cc);}
      for(const[dr,dc]of DIAG){const rr=r+dr,cc=c+dc;if(inPalace(rr,cc,top)&&palDiag(r,c,rr,cc))land(rr,cc);}
    } else if(t===7){const f=top?1:-1;land(r+f,c);land(r,c-1);land(r,c+1);
      for(const dc of[-1,1]){const rr=r+f,cc=c+dc;if(inB(rr,cc)&&palDiag(r,c,rr,cc))land(rr,cc);}
    } else if(t===5){
      for(const[dr,dc]of ORTH){let rr=r+dr,cc=c+dc;while(inB(rr,cc)){const q=B[rr*9+cc];if(!q)out.push(s|(rr*9+cc)<<7);else{if((q&8)!==me)out.push(s|(rr*9+cc)<<7);break;}rr+=dr;cc+=dc;}}
      for(const pts of PAL){if(!isPal(pts,r,c))continue;
        for(const[dr,dc]of DIAG){let rr=r+dr,cc=c+dc;while(isPal(pts,rr,cc)){const q=B[rr*9+cc];if(!q)out.push(s|(rr*9+cc)<<7);else{if((q&8)!==me)out.push(s|(rr*9+cc)<<7);break;}rr+=dr;cc+=dc;}}}
    } else if(t===4){for(const[br,bc,dr,dc]of HLEG)if(inB(r+br,c+bc)&&!B[(r+br)*9+c+bc])land(r+dr,c+dc);
    } else if(t===3){for(const[sr,sc,dr,dc,mr,mc]of ELEG){
        if(!inB(r+sr,c+sc)||B[(r+sr)*9+c+sc])continue;if(!inB(r+sr+mr,c+sc+mc)||B[(r+sr+mr)*9+c+sc+mc])continue;land(r+dr,c+dc);}
    } else if(t===6){
      for(const[dr,dc]of ORTH){let rr=r+dr,cc=c+dc,screen=false;
        while(inB(rr,cc)){const q=B[rr*9+cc];
          if(!screen){if(q){if((q&7)===6)break;screen=true;}}
          else{if(!q)out.push(s|(rr*9+cc)<<7);else{if((q&8)!==me&&(q&7)!==6)out.push(s|(rr*9+cc)<<7);break;}}
          rr+=dr;cc+=dc;}}
      for(const pts of PAL){const k=pts.findIndex((p,i)=>i<4&&p[0]===r&&p[1]===c);if(k<0)continue;
        const mid=B[pts[4][0]*9+pts[4][1]];if(!mid||(mid&7)===6)continue;
        const rr=2*pts[4][0]-r,cc=2*pts[4][1]-c,q=B[rr*9+cc];
        if(!q||((q&8)!==me&&(q&7)!==6))out.push(s|(rr*9+cc)<<7);}
    }
  }
  function genAll(col,out){for(let s=0;s<90;s++){const p=B[s];if(p&&(p&8)===col)pieceMoves(s,out);}return out;}
  function kingSq(col){for(let s=0;s<90;s++)if(B[s]===(col|1))return s;return -1;}
  const tmp=[];
  function attacked(sq,by){for(let s=0;s<90;s++){const p=B[s];if(!p||(p&8)!==by)continue;tmp.length=0;pieceMoves(s,tmp);
      for(let i=0;i<tmp.length;i++)if((tmp[i]>>7)===sq)return true;}return false;}
  function facing(){const a=kingSq(0),b=kingSq(8);if(a<0||b<0||a%9!==b%9)return false;
    for(let s=Math.min(a,b)+9;s<Math.max(a,b);s+=9)if(B[s])return false;return true;}
  function illegalFor(col){const k=kingSq(col);return k<0||attacked(k,col^8)||facing();}
  const ST=[];
  function make(m){const f=m&127,t=m>>7;ST.push(B[t]);B[t]=B[f];B[f]=0;side^=8;}
  function unmake(m){const f=m&127,t=m>>7;side^=8;B[f]=B[t];B[t]=ST.pop();}
  function evaluate(){let s=0,n=0;for(let i=0;i<90;i++)if(B[i])n++;
    for(let i=0;i<90;i++){const p=B[i];if(!p)continue;const t=p&7,top=(p&8)===8,r=(i/9)|0,c=i%9;
      let v=VAL[t];
      const adv=top?r:9-r;                               // rows advanced from own back rank
      if(t===7){v+=adv>=5?40+(adv-5)*25:0;if(adv>=7&&c>=3&&c<=5)v+=40;}
      else if(t===6)v+=(n-16)*8;                          // cannons need screens: worth more with a crowded board
      else if(t===4)v+=(n<20?40:0)+(c>=2&&c<=6?15:0);
      else if(t===5)v+=adv>=4?30:0;
      else if(t===2)v+=20;
      s+=top?-v:v;}
    return side===0?s:-s;}
  let nodes=0,deadline=0,stop=false;const KILL=[];
  function order(ms,ply,best){const sc=ms.map(m=>{if(m===best)return 1e9;const cap=B[m>>7];
      if(cap)return 1e6+VAL[cap&7]*10-VAL[B[m&127]&7];
      return (KILL[ply]&&(KILL[ply][0]===m||KILL[ply][1]===m))?5e5:0;});
    const idx=ms.map((_,i)=>i).sort((a,b)=>sc[b]-sc[a]);return idx.map(i=>ms[i]);}
  function quiesce(a,b,ply){
    if((++nodes&1023)===0&&Date.now()>deadline)stop=true;
    const stand=evaluate();if(stand>=b)return stand;if(stand>a)a=stand;if(ply>12)return stand;
    const caps=genAll(side,[]).filter(m=>B[m>>7]);
    for(const m of order(caps,ply,0)){if((B[m>>7]&7)===1)return 90000;   // general can be taken: winning
      make(m);if(illegalFor(side^8)){unmake(m);continue;}
      const v=-quiesce(-b,-a,ply+1);unmake(m);if(stop)return a;if(v>=b)return v;if(v>a)a=v;}
    return a;}
  const MATE=100000;
  function search(d,a,b,ply){
    if((++nodes&1023)===0&&Date.now()>deadline)stop=true;
    if(stop)return 0;
    if(d<=0)return quiesce(a,b,ply);
    const ms=order(genAll(side,[]),ply,0);let legal=0,best=-MATE*2;
    for(const m of ms){make(m);if(illegalFor(side^8)){unmake(m);continue;}legal++;
      const v=-search(d-1,-b,-a,ply+1);unmake(m);if(stop)return 0;
      if(v>best)best=v;
      if(v>a){a=v;if(a>=b){if(!B[m>>7]){KILL[ply]=KILL[ply]||[0,0];if(KILL[ply][0]!==m){KILL[ply][1]=KILL[ply][0];KILL[ply][0]=m;}}break;}}}
    if(!legal)return -MATE+ply;                           // no legal move = loss (game rule)
    return best;}
  function think(d){
    B.set(d.board);side=d.side;ST.length=0;KILL.length=0;nodes=0;stop=false;
    const ms0=[];for(const m of genAll(side,[])){make(m);if(!illegalFor(side^8))ms0.push(m);unmake(m);}
    if(!ms0.length)return {move:-1};
    const t0=Date.now();deadline=t0+(d.inThread?Math.min(d.ms,700):d.ms);
    if(d.noise>0){const sc=[];for(const m of ms0){make(m);sc.push(-search(Math.max(0,d.maxDepth-1),-MATE*2,MATE*2,1)+Math.random()*d.noise);unmake(m);}
      let bi=0;sc.forEach((v,i)=>{if(v>sc[bi])bi=i;});return {move:ms0[bi],depth:d.maxDepth};}
    let ms=order(ms0,0,0),best=ms[0],depthDone=0,bestScore=0;
    for(let depth=1;depth<=d.maxDepth;depth++){
      let a=-MATE*2,cand=ms[0],cs=-MATE*2;
      for(const m of ms){make(m);const v=-search(depth-1,-MATE*2,-a,1);unmake(m);if(stop)break;if(v>cs){cs=v;cand=m;}if(v>a)a=v;}
      if(stop&&depth>1)break;
      best=cand;bestScore=cs;depthDone=depth;ms=order(ms,0,best);
      if(cs>MATE-1000)break;
      if(Date.now()-t0>(deadline-t0)*0.45)break;
    }
    return {move:best,score:bestScore,depth:depthDone,nodes};}
  function legalList(d){B.set(d.board);side=d.side;const out=[];for(const m of genAll(side,[])){make(m);if(!illegalFor(side^8))out.push(m);unmake(m);}return out;}
  self.onmessage=(e)=>{const d=e.data;let result;
    try{result=d.type==='legal'?{moves:legalList(d)}:think(d);}catch(err){result={error:String(err&&err.message||err)};}
    self.postMessage({id:d.id,result});};
}
// one worker per game, created on first use
let _omokAI=null,_janggiAI=null;
const OmokAI={run:(t,p)=>(_omokAI||(_omokAI=makeAIWorker(OmokWorker))).run(t,p)};
const JanggiAI={run:(t,p)=>(_janggiAI||(_janggiAI=makeAIWorker(JanggiWorker))).run(t,p)};
