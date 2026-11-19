/* ===== Baduk engine (runs inside the worker) — Monte-Carlo tree search with RAVE ===== */
// Self-contained: it is serialized with toString(), so it must not use anything from outside.
function BadukWorker(self){
  let N=0,NN=0,NB,DG,EDGE,stA,stB,stk,sa=0,sb=0;
  const LIBS=[0,0,0,0];
  function setup(n){
    if(n===N)return; N=n;NN=n*n;
    NB=new Int16Array(NN*4).fill(-1);DG=new Int16Array(NN*4).fill(-1);EDGE=new Uint8Array(NN);
    for(let p=0;p<NN;p++){const r=(p/N)|0,c=p%N;
      if(r>0)NB[p*4]=p-N; if(r<N-1)NB[p*4+1]=p+N; if(c>0)NB[p*4+2]=p-1; if(c<N-1)NB[p*4+3]=p+1;
      if(r>0&&c>0)DG[p*4]=p-N-1; if(r>0&&c<N-1)DG[p*4+1]=p-N+1;
      if(r<N-1&&c>0)DG[p*4+2]=p+N-1; if(r<N-1&&c<N-1)DG[p*4+3]=p+N+1;
      EDGE[p]=Math.min(r,c,N-1-r,N-1-c);}
    stA=new Int32Array(NN);stB=new Int32Array(NN);stk=new Int16Array(NN);sa=0;sb=0;
  }
  function bump(){ if(++sa>2e9){stA.fill(0);sa=1;} if(++sb>2e9){stB.fill(0);sb=1;} }
  // position = board + list of empty points (for O(1) random sampling)
  function newPos(board,ko){const b=new Int8Array(NN),E=new Int16Array(NN),I=new Int16Array(NN).fill(-1);let n=0;
    for(let p=0;p<NN;p++){b[p]=board[p];if(!b[p]){I[p]=n;E[n++]=p;}} return {b,E,I,n,ko};}
  function makeBuf(){return {b:new Int8Array(NN),E:new Int16Array(NN),I:new Int16Array(NN),n:0,ko:-1};}
  function copyPos(s,d){d.b.set(s.b);d.E.set(s.E);d.I.set(s.I);d.n=s.n;d.ko=s.ko;return d;}
  function eRemove(s,p){const i=s.I[p],last=s.E[--s.n];s.E[i]=last;s.I[last]=i;s.I[p]=-1;}
  function eAdd(s,p){s.I[p]=s.n;s.E[s.n++]=p;}
  // liberties of the group at p, stopping once `max` are found (they land in LIBS)
  function libs(b,p,max){bump();const col=b[p];let sp=0,cnt=0;stk[sp++]=p;stA[p]=sa;
    while(sp){const q=stk[--sp];for(let k=0;k<4;k++){const r=NB[q*4+k];if(r<0)continue;const v=b[r];
      if(v===0){if(stB[r]!==sb){stB[r]=sb;LIBS[cnt++]=r;if(cnt>=max)return cnt;}}
      else if(v===col&&stA[r]!==sa){stA[r]=sa;stk[sp++]=r;}}}
    return cnt;}
  function removeGroup(s,p){const b=s.b,col=b[p];let sp=0,cnt=0;stk[sp++]=p;b[p]=0;
    while(sp){const q=stk[--sp];cnt++;eAdd(s,q);
      for(let k=0;k<4;k++){const r=NB[q*4+k];if(r>=0&&b[r]===col){b[r]=0;stk[sp++]=r;}}}
    return cnt;}
  function play(s,p,col){
    const b=s.b;if(b[p]!==0||p===s.ko)return false;
    const opp=3-col;b[p]=col;let cap=0,capAt=-1;
    for(let k=0;k<4;k++){const q=NB[p*4+k];if(q>=0&&b[q]===opp&&libs(b,q,1)===0){cap+=removeGroup(s,q);capAt=q;}}
    if(cap===0&&libs(b,p,1)===0){b[p]=0;return false;}       // suicide
    eRemove(s,p);s.ko=-1;
    if(cap===1){let alone=true,em=0;for(let k=0;k<4;k++){const q=NB[p*4+k];if(q<0)continue;
      if(b[q]===col)alone=false;else if(b[q]===0)em++;} if(alone&&em===1)s.ko=capAt;}
    return true;}
  function legal(s,p,col){const b=s.b;if(b[p]!==0||p===s.ko)return false;
    for(let k=0;k<4;k++){const q=NB[p*4+k];if(q<0)continue;const v=b[q];if(v===0)return true;
      if(v===col){if(libs(b,q,2)>=2)return true;}else if(libs(b,q,2)===1)return true;}
    return false;}
  // own eye (or nearly): never filled by the playout policy
  function eyeish(b,p,col){for(let k=0;k<4;k++){const q=NB[p*4+k];if(q>=0&&b[q]!==col)return false;}
    let bad=0,off=0;const opp=3-col;for(let k=0;k<4;k++){const q=DG[p*4+k];if(q<0)off++;else if(b[q]===opp)bad++;}
    return off>0?bad===0:bad<=1;}
  // answer the last move: capture a group it left in atari, or rescue my group it put in atari
  function tactical(s,last,col){const b=s.b,opp=3-col;
    for(let k=-1;k<4;k++){const q=k<0?last:NB[last*4+k];if(q<0||b[q]!==opp)continue;
      if(libs(b,q,2)===1){const L=LIBS[0];if(play(s,L,col))return L;}}
    for(let k=0;k<4;k++){const q=NB[last*4+k];if(q<0||b[q]!==col)continue;
      if(libs(b,q,2)===1){const L=LIBS[0];let em=0;for(let j=0;j<4;j++){const r=NB[L*4+j];if(r>=0&&b[r]===0)em++;}
        if(em>=2&&play(s,L,col))return L;}}
    return -1;}
  // would this stone (with its group) be left with a single liberty and capture nothing?
  function selfAtari(b,p,col){let em=0;
    for(let k=0;k<4;k++){const q=NB[p*4+k];if(q>=0&&b[q]===0)em++;}
    if(em>=2)return false;
    const opp=3-col;b[p]=col;let res;
    for(let k=0;k<4;k++){const q=NB[p*4+k];if(q>=0&&b[q]===opp&&libs(b,q,1)===0){b[p]=0;return false;}}
    res=libs(b,p,2)<=1;b[p]=0;return res;}
  function randomMove(s,col){const b=s.b;let n=s.n;
    while(n>0){const i=(Math.random()*n)|0,p=s.E[i];
      if(!eyeish(b,p,col)&&!selfAtari(b,p,col)&&play(s,p,col))return p;
      n--;const q=s.E[n];s.E[i]=q;s.I[q]=i;s.E[n]=p;s.I[p]=n;}
    return -1;}
  function ownerOf(b,p){const v=b[p];if(v)return v;let c=0;
    for(let k=0;k<4;k++){const q=NB[p*4+k];if(q<0)continue;const u=b[q];if(u===0)return 0;if(c===0)c=u;else if(c!==u)return 0;}
    return c;}
  function playout(s,col,komi,amaf,last){
    const maxM=NN*3;let passes=0,m=0;
    while(passes<2&&m<maxM){
      let p=-1;
      if(last>=0&&Math.random()<0.9)p=tactical(s,last,col);
      if(p<0)p=randomMove(s,col);
      if(p<0){passes++;s.ko=-1;last=-1;}
      else{passes=0;last=p;if(amaf&&amaf[p]===0)amaf[p]=col;}
      col=3-col;m++;}
    let sc=-komi;for(let p=0;p<NN;p++){const o=ownerOf(s.b,p);if(o===1)sc++;else if(o===2)sc--;}
    return sc;}
  // virtual [visits, wins] that steer the tree before real statistics exist
  function prior(s,p,col){const b=s.b,opp=3-col;let em=0,capt=false,save=false,ownN=false,ownWeak=true;
    for(let k=0;k<4;k++){const q=NB[p*4+k];if(q<0)continue;const v=b[q];
      if(v===0)em++;else if(v===opp){if(libs(b,q,2)===1)capt=true;}
      else{ownN=true;const l=libs(b,q,3);if(l===1)save=true;if(l>=3)ownWeak=false;}}
    if(capt)return [20,17];
    if(save&&em>=2)return [20,15];
    if(em===0&&ownWeak)return [20,3];            // likely self-atari
    if(em===1&&!ownN)return [14,5];
    const d=EDGE[p];
    if(d===0)return [14,4];                       // first line is rarely right
    if(N>=13&&(d===2||d===3))return [12,7];       // 3rd/4th line on big boards
    return [10,5];}
  function expand(node,s,col){node.ch=[];
    for(let i=0;i<s.n;i++){const p=s.E[i];if(eyeish(s.b,p,col)||!legal(s,p,col))continue;
      const pr=prior(s,p,col);node.ch.push({m:p,c:col,ch:null,n:0,w:0,pn:pr[0],pw:pr[1],rn:0,rw:0});}}
  function select(node){let best=null,bv=-1;const lg=Math.log(node.n+1);
    for(const c of node.ch){const n=c.n+c.pn;let v=(c.w+c.pw)/n;
      if(c.rn>0){const beta=c.rn/(c.rn+n+c.rn*n/2500);v=(1-beta)*v+beta*(c.rw/c.rn);}
      v+=0.25*Math.sqrt(lg/n);
      if(v>bv){bv=v;best=c;}}
    return best;}
  // biggest local fight at the root: capture a group in atari, or save mine from atari.
  // Light playouts under-value these, so strong levels let them override close MCTS calls.
  function urgent(s,col){const b=s.b,opp=3-col,seen=new Uint8Array(NN);let best=-1,bw=0;
    for(let p=0;p<NN;p++){if(!b[p]||seen[p])continue;
      const v=b[p];let sp=0,size=0;stk[sp++]=p;seen[p]=1;
      while(sp){const q=stk[--sp];size++;for(let k=0;k<4;k++){const r=NB[q*4+k];if(r>=0&&b[r]===v&&!seen[r]){seen[r]=1;stk[sp++]=r;}}}
      if(libs(b,p,2)!==1)continue;const L=LIBS[0];let w=0;
      if(v===opp){if(legal(s,L,col))w=size*2+1;}
      else if(legal(s,L,col)){const t=copyPos(s,makeBuf());play(t,L,col);if(libs(t.b,L,3)>=3)w=size*2;}
      if(w>bw){bw=w;best=L;}}
    return [best,bw];}
  function search(d,ms){
    const root0=newPos(d.board,d.ko),s=makeBuf();
    const root={m:-1,c:3-d.toPlay,ch:null,n:0,w:0,pn:0,pw:0,rn:0,rw:0};
    expand(root,root0,d.toPlay);
    if(!root.ch.length)return {move:-1,winrate:0,po:0};
    const amaf=new Int8Array(NN),path=[],thr=N>=13?6:2,t0=Date.now();let po=0;
    while(po<d.maxPO){
      if((po&31)===0&&Date.now()-t0>ms)break;
      copyPos(root0,s);amaf.fill(0);path.length=0;path.push(root);
      let node=root,col=d.toPlay,last=-1;
      while(node.ch&&node.ch.length){
        const c=select(node);
        if(!play(s,c.m,c.c))break;
        if(amaf[c.m]===0)amaf[c.m]=c.c;
        node=c;path.push(c);col=3-c.c;last=c.m;
        if(!node.ch&&node.n>=thr)expand(node,s,col);
      }
      const win=playout(s,col,d.komi,amaf,last)>0?1:2;
      for(const nd of path){nd.n++;if(nd.c===win)nd.w++;
        if(nd.ch)for(const c of nd.ch){if(amaf[c.m]===c.c){c.rn++;if(c.c===win)c.rw++;}}}
      po++;}
    const kids=root.ch.slice().sort((a,b)=>b.n-a.n);
    let pick=kids[0];
    if(d.tactics){const u=urgent(root0,d.toPlay);
      if(u[0]>=0&&u[1]>=3&&u[0]!==pick.m){const k=root.ch.find(c=>c.m===u[0]);
        const wr=c=>c.n>=20?c.w/c.n:null,a=wr(pick),bb=k?wr(k):null;
        if(k&&(a===null||bb===null||a-bb<0.12))pick=k;}}
    if(d.topK>1){const top=kids.slice(0,d.topK).filter(k=>k.n>0);let tot=0;top.forEach(k=>tot+=k.n);
      let r=Math.random()*tot;for(const k of top){r-=k.n;if(r<=0){pick=k;break;}}}
    return {move:pick.m,winrate:kids[0].n?kids[0].w/kids[0].n:0.5,po};}
  function ownership(d,ms){
    const s0=newPos(d.board,-1),s=makeBuf(),own=new Float32Array(NN),t0=Date.now();let po=0;
    while(po<d.maxPO){if((po&15)===0&&Date.now()-t0>ms)break;
      copyPos(s0,s);playout(s,(po&1)?d.toPlay:3-d.toPlay,d.komi,null,-1);
      for(let p=0;p<NN;p++){const o=ownerOf(s.b,p);if(o===1)own[p]++;else if(o===2)own[p]--;}
      po++;}
    if(po)for(let p=0;p<NN;p++)own[p]/=po;
    return {own:Array.from(own),po};}
  self.onmessage=(e)=>{const d=e.data;let result;
    try{setup(d.N);const ms=d.inThread?Math.min(d.ms,600):d.ms;
      result = d.type==='own' ? ownership(d,ms) : search(d,ms);
    }catch(err){result={error:String(err&&err.message||err)};}
    self.postMessage({id:d.id,result});};
}
const BadukAI=makeAIWorker(BadukWorker);

/* ================= BADUK (Go) — 9/13/19 ================= */
const Baduk=(function(){
  let N=9;                       // board size (mutable)
  const inB=(r,c)=>r>=0&&r<N&&c>=0&&c<N;
  const NB=[[1,0],[-1,0],[0,1],[0,-1]];
  const emptyB=()=>Array.from({length:N},()=>Array(N).fill(0));
  const clone=b=>b.map(r=>r.slice());
  const KOMI=6.5;
  const LETTERS='ABCDEFGHJKLMNOPQRST';   // Go convention skips "I"
  function starPoints(){
    if(N===9)return [[2,2],[2,6],[6,2],[6,6],[4,4]];
    if(N===13)return [[3,3],[3,9],[9,3],[9,9],[6,6]];
    return [[3,3],[3,9],[3,15],[9,3],[9,9],[9,15],[15,3],[15,9],[15,15]];
  }

  let board,turn,mode,level,history,over,ready=false;
  let koPoint=null, passes=0, captures={1:0,2:0}, lastMove=null;
  let g3d=null, hintMove=null, curSize=9, deadMarks=null;
  let token=0, hintBusy=false;          // token invalidates async CPU/hint results after undo/restart
  let stage=1, stageCleared=1, stageBest={}, lastCleared=false;
  let mlog=[];                 // moves (r*N+c, -1 = pass), parallel to history
  let mail=null, puzzle=null, review=null, badMove=null, replaying=false;

  function group(b,r,c){const col=b[r][c];const stones=[],libs=new Set(),seen=new Set();const st=[[r,c]];seen.add(r*N+c);
    while(st.length){const [y,x]=st.pop();stones.push([y,x]);for(const[dy,dx]of NB){const ny=y+dy,nx=x+dx;if(!inB(ny,nx))continue;
      if(b[ny][nx]===0)libs.add(ny*N+nx);else if(b[ny][nx]===col&&!seen.has(ny*N+nx)){seen.add(ny*N+nx);st.push([ny,nx]);}}}
    return {stones,libs:libs.size};}
  function tryPlay(b,r,c,col,ko){
    if(!inB(r,c)||b[r][c]!==0)return {ok:false};
    if(ko&&ko[0]===r&&ko[1]===c)return {ok:false,reason:'ko'};
    const nb=clone(b);nb[r][c]=col;const opp=col===1?2:1;let cap=[];
    for(const[dy,dx]of NB){const ny=r+dy,nx=c+dx;if(inB(ny,nx)&&nb[ny][nx]===opp){const g=group(nb,ny,nx);if(g.libs===0){g.stones.forEach(([y,x])=>{nb[y][x]=0;cap.push([y,x]);});}}}
    const self=group(nb,r,c);if(self.libs===0&&cap.length===0)return {ok:false,reason:'suicide'};
    let newKo=null;if(cap.length===1){const g2=group(nb,r,c);if(g2.stones.length===1&&g2.libs===1)newKo=cap[0];}
    return {ok:true,board:nb,captures:cap,ko:newKo};
  }
  // area scoring (stones + surrounded empty points)
  function scoreBoard(b,komi){
    if(komi===undefined)komi=KOMI;
    let black=0,white=0;const seen=new Set();
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){
      if(b[r][c]===1)black++;else if(b[r][c]===2)white++;
      else if(!seen.has(r*N+c)){const st=[[r,c]],region=[];const borders=new Set();seen.add(r*N+c);
        while(st.length){const[y,x]=st.pop();region.push([y,x]);for(const[dy,dx]of NB){const ny=y+dy,nx=x+dx;if(!inB(ny,nx))continue;
          if(b[ny][nx]===0){if(!seen.has(ny*N+nx)){seen.add(ny*N+nx);st.push([ny,nx]);}}else borders.add(b[ny][nx]);}}
        if(borders.size===1){const col=[...borders][0];if(col===1)black+=region.length;else white+=region.length;}}
    }
    return {black,white:white+komi};
  }
  const flat=()=>[].concat(...board);
  const koIdx=()=>koPoint?koPoint[0]*N+koPoint[1]:-1;
  const coord=(r,c)=>LETTERS[c]+(N-r);
  const vsCPU=()=>mode==='cpu'||mode==='arcade';

  // CPU strength: thinking time (ms) and how loosely it picks among its best candidates
  function cpuParams(){
    const mult=N===9?1:N===13?1.15:1.2;
    if(mode==='arcade'||level>10){const s=Math.max(1,Math.min(10,level>10?level-10:stage));
      const t=[120,200,320,480,680,950,1250,1650,2150,2800][s-1];
      return {ms:Math.round(t*mult),topK:s<=2?4:s<=4?2:1,tactics:s>=4};
    }
    return {ms:Math.round([0,350,1100,2600][level]*mult),topK:level===1?4:1,tactics:level>=2};
  }
  // dead-stone judgement: stones the playouts almost always lose are removed before counting
  async function judgeDead(){
    const res=await BadukAI.run('own',{N,board:flat(),toPlay:turn,komi:curKomi(),
      ms:N===9?500:N===13?800:1100,maxPO:N===9?1500:1000});
    const clean=clone(board);let dB=0,dW=0;const marks=[];
    if(res&&res.own){
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){const v=board[r][c];if(!v)continue;const o=res.own[r*N+c];
        if(v===1&&o<-0.4){clean[r][c]=0;dB++;marks.push([r,c]);}
        else if(v===2&&o>0.4){clean[r][c]=0;dW++;marks.push([r,c]);}}
    }
    return {clean,dB,dW,marks,own:res&&res.own};
  }
  // count stones (dead ones removed) + empty points the playouts clearly award to one side
  function scoreJudged(j,komi){
    if(!j.own)return scoreBoard(j.clean,komi);
    // settled points (|o|≈1) count whole; contested ones count by likelihood; true dame for nobody
    let black=0,white=0;
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){const v=j.clean[r][c];
      if(v===1)black++;else if(v===2)white++;
      else{const o=j.own[r*N+c];if(Math.abs(o)>=0.3){black+=(1+o)/2;white+=(1-o)/2;}}}
    return {black:Math.round(black),white:Math.round(white)+komi};
  }

  function ensure(){if(ready)return;setupCanvas();loadProgress();openSetup();ready=true;}
  function setupCanvas(){
    if(g3d&&g3d.dispose)g3d.dispose();   // free old GPU resources before rebuilding
    curSize=N;
    g3d=makeBoard3D({
      mountId:'badukMount', cols:N, rows:N, squareStyle:'grid', wood:{base:'#b98540',dark:'rgba(118,68,22,1)',light:'rgba(222,172,96,1)'},inkColor:'#1a120a', boardColor:0x2b2b2e, lineColor:0xc7ccd4,
      frameColor:0x17171a, frameRimColor:0x23262c,
      onRestore:()=>draw(),
      decorate:(grp,toXZ,T)=>{
        starPoints().forEach(([r,c])=>{const {x,z}=toXZ(r,c);
          const d=new T.Mesh(new T.CylinderGeometry(0.085,0.085,0.006,24),new T.MeshStandardMaterial({color:0x1a120a,roughness:.4}));
          d.position.set(x,0.064,z);grp.add(d);});
      },
      onPick:(r,c)=>{ if(over||!board||review)return; if(vsCPU()&&turn===2)return;
        if(mode==='mail'&&(turn!==mail.color||mail.locked)){flash(mail.locked?'친구에게 수를 보내 주세요':'친구 차례예요');return;}
        if(mode==='puzzle'&&turn!==1)return;
        humanPlay(r,c); }
    });
    g3d.init();g3d.setActive(true);draw();
    const h=document.querySelector('#baduk .hudtop h1');if(h)h.textContent='바둑 ('+N+'×'+N+')';
  }
  function ensureSize(){ if(!g3d||curSize!==N){ setupCanvas(); } }
  function ring(T,r,c,color){const {x,z}=g3d.toXZ(r,c);
    g3d.glowRing(x,z,color,{size:1.45});
    if(board&&board[r][c])g3d.glowRing(x,z,color,{disc:true,size:.34,y:g3d.TOPY+0.205,a:1,k:2.2,pulse:false});}
  function draw(){
    if(!g3d||!g3d.ready()||!board)return;
    const T=g3d.THREE;g3d.clearPieces();g3d.clearMarks();
    g3d.beginPieces();let _o=0;
    for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(board[r][c]){
      const {x,z}=g3d.toXZ(r,c);const black=board[r][c]===1;
      const stone=_goStone(T,black);stone.position.set(x,g3d.TOPY,z);
      g3d.addPiece(r+','+c+(black?'b':'w'),stone,{order:_o++,color:black?0x2a2a2e:0xeeeae0,ghost:()=>_goStone(T,black)});
    }
    g3d.endPieces({emptyIsCapture:true,soft:true});
    if(lastMove)ring(T,lastMove[0],lastMove[1],0x3a86ff);
    if(hintMove)ring(T,hintMove.r,hintMove.c,0x2fd94a);
    if(badMove)ring(T,badMove.r,badMove.c,0xe23b3b);
    if(puzzle&&board[(puzzle.t/N)|0][puzzle.t%N]===2){const t=puzzle.t;const g=group(board,(t/N)|0,t%N);
      g.stones.forEach(([y,x])=>ring(T,y,x,0xff2d2d));}
    if(deadMarks)deadMarks.forEach(([r,c])=>{const {x,z}=g3d.toXZ(r,c);   // red X on stones judged dead
      [Math.PI/4,-Math.PI/4].forEach(rot=>{const bar=new T.Mesh(new T.BoxGeometry(0.6,0.03,0.09),new T.MeshBasicMaterial({color:0xe23b3b}));
        bar.position.set(x,0.42,z);bar.rotation.y=rot;g3d.markGroup.add(bar);});});
  }
  function humanPlay(r,c){
    const res=tryPlay(board,r,c,turn,koPoint);
    if(!res.ok){ if(res.reason==='ko')flash('패(ko) — 다른 곳에 한 수 둔 뒤에 되따낼 수 있어요'); else if(res.reason==='suicide')flash('자충수(활로 0)는 둘 수 없어요'); else flash('둘 수 없는 자리예요'); return; }
    commit(res,r,c);
    if(mode==='puzzle'){afterPuzzleMove();return;}
    if(mode==='mail'&&!replaying){mail.locked=true;status();try{mail.hook&&mail.hook({moves:exportMoves(),over:false});}catch(e){}return;}
    if(!over&&vsCPU()&&turn===2)setTimeout(cpuTurn,250);
  }
  function snap(){return {board:clone(board),ko:koPoint,passes,capB:captures[1],capW:captures[2],turn,last:lastMove};}
  function commit(res,r,c){
    history.push(snap());mlog.push(r*N+c);
    board=res.board;captures[turn]+=res.captures.length;koPoint=res.ko;passes=0;lastMove=[r,c];hintMove=null;
    if(!replaying){SFX.place();if(res.captures.length)SFX.capture();}
    turn=turn===1?2:1;if(!replaying){draw();status();}
  }
  async function cpuTurn(){
    if(over||!board||turn!==2)return;
    const tk=token, p=cpuParams();
    status();
    const res=await BadukAI.run('move',{N,board:flat(),toPlay:2,ko:koIdx(),komi:curKomi(),ms:p.ms,maxPO:300000,topK:p.topK,tactics:p.tactics});
    if(tk!==token||over||!board||turn!==2)return;      // undone / restarted while thinking
    if(!res||res.error||res.move<0){doPass(true);return;}
    // the opponent passed: end the game only once the board has taken shape and the result
    // is decided either way (an opening pass is answered with a move, not an instant game over)
    const stones=board.reduce((a,row)=>a+row.filter(v=>v).length,0);
    if(passes===1&&stones>=N*N*0.3&&(res.winrate>0.6||res.winrate<0.12)){doPass(true);return;}
    const r=(res.move/N)|0,c=res.move%N;
    const tr=tryPlay(board,r,c,2,koPoint);
    if(!tr.ok){doPass(true);return;}
    commit(tr,r,c);
  }
  function doPass(auto){
    history.push(snap());mlog.push(-1);
    passes++;koPoint=null;lastMove=null;hintMove=null;
    if(passes>=2){finishByScore();return;}
    turn=turn===1?2:1;
    if(replaying)return;
    if(mode==='mail'&&!auto){mail.locked=true;draw();status();try{mail.hook&&mail.hook({moves:exportMoves(),over:false});}catch(e){}return;}
    draw();status(auto?'CPU 착수 포기 — 당신도 포기하면 계가합니다':(turn===1?'상대 착수 포기 — 흑 차례':'상대 착수 포기 — 백 차례'));
    if(!over&&vsCPU()&&turn===2)setTimeout(cpuTurn,250);
  }
  function pass(){ if(over||!board||review)return; if(vsCPU()&&turn===2)return; if(mode==='puzzle')return; if(mode==='mail'&&(turn!==mail.color||mail.locked))return; doPass(false); }
  async function hint(){
    if(over||!board||hintBusy)return;
    if(vsCPU()&&turn===2)return;
    if(mode==='puzzle'){flash('문제에서는 힌트를 쓸 수 없어요');return;}
    hintBusy=true;const tk=token,mv=history.length;
    banner('💡 수를 읽는 중…');
    const res=await BadukAI.run('move',{N,board:flat(),toPlay:turn,ko:koIdx(),komi:curKomi(),ms:N===9?900:1300,maxPO:300000,topK:1,tactics:true});
    hintBusy=false;
    if(tk!==token||over||history.length!==mv){if(!over)hideBanner();return;}
    if(!res||res.error||res.move<0){flash('💡 둘 만한 곳이 없어요 — 착수 포기를 고려해 보세요');return;}
    const r=(res.move/N)|0,c=res.move%N;
    hintMove={r,c};draw();SFX.select();
    banner('💡 추천: '+coord(r,c)+'  ·  예상 승률 '+Math.round(res.winrate*100)+'%');
    setTimeout(()=>{if(!over&&history.length===mv)hideBanner();},2400);
  }

  // komi (given to white) grows with the arcade stage
  function curKomi(){ if(mode!=='arcade')return KOMI; return stage<=3?0.5:stage<=6?3.5:KOMI; }
  let endHook=null; const emit=(info)=>{try{endHook&&endHook(Object.assign({mode,level,stage,plies:history?history.length:0},info));}catch(e){console.error(e);}};
  async function finishByScore(){
    over=true;const tk=token;
    status('계가 중 — 사석을 판정하고 있어요…');banner('⏳ 사석 판정 중…');
    const j=await judgeDead();
    if(tk!==token)return;
    deadMarks=j.marks;draw();
    const s=scoreJudged(j,curKomi());
    const bWin=s.black>s.white;
    const dead=(j.dB||j.dW)?' (사석 흑'+j.dB+'·백'+j.dW+' 제거)':'';
    const msg='계가 — 흑 '+s.black+' : 백 '+s.white.toFixed(1)+dead+' → '+(bWin?'흑':'백')+' 승';
    status(msg);
    const myWin=mode==='mail'?(bWin===(mail.color===1)):bWin;
    if(!(mode==='mail'&&replaying))emit({result:mode==='pvp'?'pvp':(myWin?'win':'lose'),margin:+(s.black-s.white).toFixed(1)});
    if(mode==='mail'&&!replaying){try{mail.hook&&mail.hook({moves:exportMoves(),over:true,won:myWin});}catch(e){}}
    if(mode==='arcade'){
      lastCleared=bWin;
      if(bWin){ if(stage>=stageCleared)stageCleared=Math.min(10,stage+1);
        const prev=stageBest[stage];if(prev===undefined||(s.black-s.white)>prev)stageBest[stage]=+(s.black-s.white).toFixed(1);
        saveProgress();banner('스테이지 '+stage+' 클리어! ⭐  '+msg);SFX.win();
      } else {banner('스테이지 '+stage+' 실패… '+msg);SFX.lose();}
      setTimeout(showStageEnd,900);
    } else {
      banner(msg);
      if(mode==='cpu'||mode==='mail'){ myWin?SFX.win():SFX.lose(); } else SFX.win();
    }
  }
  async function scoreNow(){
    if(!board||over)return;const tk=token,mv=history.length;
    banner('⏳ 형세 판단 중…');
    const j=await judgeDead();
    if(tk!==token||history.length!==mv)return;
    const s=scoreJudged(j,curKomi()),d=s.black-s.white;
    flash('형세(추정) — 흑 '+s.black+' : 백 '+s.white.toFixed(1)+' → '+(d>0?'흑':'백')+' '+Math.abs(d).toFixed(1)+'집 우세');
  }
  function status(msg){
    if(msg){document.getElementById('badukStatus').textContent=msg;return;}
    let t = mode==='mail'?(over?'대국 종료':turn===mail.color?(mail.locked?'친구에게 수를 보내 주세요':'내 차례 ('+(mail.color===1?'흑':'백')+')'):'친구 차례 — 수를 기다리는 중')
      : mode==='puzzle'?(over?'문제 종료':turn===1?'당신(흑) 차례 · '+(puzzle.limit-blackMoves())+'수 남음':'CPU가 막는 중…')
      : vsCPU()?(turn===1?'당신(흑) 차례':'CPU 생각 중…'):(turn===1?'흑 차례':'백 차례');
    if(mode==='arcade')t='S'+stage+' · '+t;
    t+='  ·  따냄 흑'+captures[1]+' 백'+captures[2];
    document.getElementById('badukStatus').textContent=t;
  }
  function banner(t){const b=document.getElementById('badukWin');b.textContent=t;b.style.display='block';}
  function hideBanner(){document.getElementById('badukWin').style.display='none';}
  function flash(t){banner(t);setTimeout(()=>{if(!over)hideBanner();},1800);}
  function hideAllPanels(){['badukDiff','badukStages'].forEach(id=>document.getElementById(id).classList.add('hidden'));}
  function openSetup(){document.getElementById('badukSetup').classList.remove('hidden');document.getElementById('badukStageEnd').style.display='none';hideAllPanels();markSize();}
  function chooseCPU(){hideAllPanels();document.getElementById('badukDiff').classList.remove('hidden');}
  function markSize(){document.querySelectorAll('.bdsize').forEach(b=>{b.style.borderColor = (+b.dataset.n===N)?'var(--gold)':'';b.style.color=(+b.dataset.n===N)?'var(--gold)':'';});}
  function setSize(n){ N=n; markSize(); if(g3d){ token++; board=null; setupCanvas(); } }
  async function loadProgress(){ const p=await Store.get('baduk_progress'); if(p){stageCleared=p.cleared||1;stageBest=p.best||{};} }
  function saveProgress(){ Store.set('baduk_progress',{cleared:stageCleared,best:stageBest}); }
  function openStages(){hideAllPanels();document.getElementById('badukStages').classList.remove('hidden');
    document.getElementById('badukProgress').textContent='(해제: '+stageCleared+'/10)';
    const grid=document.getElementById('badukStageGrid');grid.innerHTML='';
    for(let i=1;i<=10;i++){const b=document.createElement('button');
      const locked=i>stageCleared;b.className='stagebtn'+(locked?' locked':'');
      b.innerHTML=(stageBest[i]!==undefined?'⭐':'')+'<b>'+i+'</b>'+(stageBest[i]!==undefined?'<small>+'+stageBest[i]+'</small>':'');
      b.disabled=locked;b.onclick=()=>startStage(i);grid.appendChild(b);}
  }
  function startStage(s){if(window.StoryGate&&!window.StoryGate(s,()=>startStage(s)))return;stage=s;N=9;markSize();start('arcade',Math.min(3,1+Math.floor((s-1)/3)));}
  function showStageEnd(){
    const el=document.getElementById('badukStageEnd');el.style.display='flex';el.innerHTML='';
    const mk=(txt,fn,cls)=>{const b=document.createElement('button');b.className='btn'+(cls?' '+cls:'');b.textContent=txt;b.onclick=fn;return b;};
    if(lastCleared&&stage<10)el.appendChild(mk('다음 스테이지 ▶',()=>{el.style.display='none';startStage(stage+1);}));
    el.appendChild(mk('다시 도전',()=>{el.style.display='none';startStage(stage);},'ghost'));
    el.appendChild(mk('스테이지 목록',()=>{el.style.display='none';openSetup();openStages();},'ghost'));
  }
  function cancelThinking(){ token++; hintBusy=false; if(BadukAI.busy)BadukAI.cancel(); }
  function start(m,lv){cancelThinking();ensureSize();mode=m;level=lv||2;board=emptyB();turn=1;history=[];mlog=[];badMove=null;review=null;if(m!=='puzzle')puzzle=null;if(m!=='mail')mail=null;over=false;koPoint=null;passes=0;captures={1:0,2:0};lastMove=null;hintMove=null;deadMarks=null;hideBanner();
    document.getElementById('badukSetup').classList.add('hidden');document.getElementById('badukStageEnd').style.display='none';draw();status();
    if(m==='cpu'||m==='arcade')try{window.Characters&&Characters.onPlay&&Characters.onPlay();}catch(e){}}
  function restart(){if(!mode){openSetup();return;} if(mode==='mail')return; if(mode==='puzzle'){startPuzzle(puzzle.pz,puzzle.onEnd);return;} if(mode==='arcade')startStage(stage); else start(mode,level);}
  function undo(){
    document.getElementById('badukStageEnd').style.display='none';
    if(!history||!history.length||review)return;
    if(mode==='mail'){if(!mail.locked||over)return;const h=history.pop();mlog.pop();
      board=h.board;koPoint=h.ko;passes=h.passes;captures={1:h.capB,2:h.capW};turn=h.turn;lastMove=h.last;mail.locked=false;
      try{mail.hook&&mail.hook({moves:exportMoves(),over:false,undo:true});}catch(e){}draw();status();return;}
    cancelThinking();over=false;hideBanner();deadMarks=null;
    let h=history.pop();mlog.pop();
    // against the CPU, always return to one of your own (black) turns
    if(vsCPU()||mode==='puzzle')while(h.turn!==1&&history.length){h=history.pop();mlog.pop();}
    board=h.board;koPoint=h.ko;passes=h.passes;captures={1:h.capB,2:h.capW};turn=h.turn;lastMove=h.last;hintMove=null;
    draw();status();
    if(vsCPU()&&turn===2)setTimeout(cpuTurn,250);
  }
  function exportMoves(){return mlog.slice();}
  function startMail(moves,size,myColor,hook){
    if(size&&size!==N)setSize(size);
    mail={color:myColor,locked:false,hook};start('mail',2);replaying=true;
    try{for(const m of moves){if(over)break;
      if(m<0){doPass(false);continue;}
      const r=(m/N)|0,c=m%N,res=tryPlay(board,r,c,turn,koPoint);if(!res.ok)break;commit(res,r,c);}}
    finally{replaying=false;}
    mail.locked=!over&&turn!==myColor;draw();status();
  }
  // ---- 따내기 문제: black captures the marked white group within `limit` black moves ----
  function blackMoves(){let n=0;for(let i=0;i<mlog.length;i++)if(history[i].turn===1&&mlog[i]>=0)n++;return n;}
  function startPuzzle(pz,onEnd){
    if(N!==pz.N)setSize(pz.N);
    puzzle={pz,t:pz.t,limit:pz.moves,onEnd};start('puzzle',3);
    board=emptyB();for(let i=0;i<N*N;i++)board[(i/N)|0][i%N]=+pz.b[i];
    turn=1;draw();status();banner('빨간 테두리 백돌을 '+pz.moves+'수 안에 잡으세요');setTimeout(()=>{if(!over&&!mlog.length)hideBanner();},2400);
  }
  function targetAlive(){return board[(puzzle.t/N)|0][puzzle.t%N]===2;}
  function endPuzzle(solved){
    over=true;status();const n=blackMoves();
    if(solved){banner('잡았어요! '+n+'수 🎉');SFX.win();}else{banner(puzzle.limit+'수 안에 잡지 못했어요');SFX.lose();}
    const cb=puzzle.onEnd;if(cb)setTimeout(()=>cb({solved,moves:n}),solved?900:700);
  }
  function afterPuzzleMove(){
    if(!targetAlive()){endPuzzle(true);return;}
    if(blackMoves()>=puzzle.limit){endPuzzle(false);return;}
    status();const tk=token;
    setTimeout(()=>{ if(tk!==token||over||mode!=='puzzle')return;
      const fb=flat();fb.ko=koIdx();
      const m=GoTactics.bestDefence(fb,N,puzzle.t,1,puzzle.limit-blackMoves());
      const r=(m/N)|0,c=m%N,res=m>=0?tryPlay(board,r,c,2,koPoint):{ok:false};
      if(res.ok)commit(res,r,c);else{history.push(snap());mlog.push(-1);turn=1;draw();}
      status();
    },450);
  }
  function reviewData(){
    const me=mode==='mail'?mail.color:1;
    return {game:'baduk',me,mode,N,komi:curKomi(),moves:mlog.map((m,i)=>{const h=history[i];return {board:[].concat(...h.board),ko:h.ko?h.ko[0]*N+h.ko[1]:-1,toPlay:h.turn,played:m,mine:h.turn===me};})};
  }
  function showReview(i,best,played){
    if(!review)review={board,lastMove,deadMarks};
    const h=history[i];if(!h)return;board=clone(h.board);lastMove=null;deadMarks=null;
    hintMove=best>=0?{r:(best/N)|0,c:best%N}:null;badMove=played>=0?{r:(played/N)|0,c:played%N}:null;draw();
  }
  function endReview(){if(!review)return;board=review.board;lastMove=review.lastMove;deadMarks=review.deadMarks;hintMove=null;badMove=null;review=null;draw();}
  function markHint(m){if(m<0)return;hintMove={r:(m/N)|0,c:m%N};draw();}
  return {markHint,startMail,startPuzzle,exportMoves,reviewData,showReview,endReview,size:()=>N,
    pick:(r,c)=>{if(over||!board||review)return;if(vsCPU()&&turn===2)return;if(mode==='mail'&&(turn!==mail.color||mail.locked))return;if(mode==='puzzle'&&turn!==1)return;humanPlay(r,c);},
    board:()=>board&&flat(),
    onEnd:(f)=>{endHook=f;},state:()=>({mode,level,stage,over,turn,plies:history?history.length:0,mail:mail&&{color:mail.color,locked:mail.locked},target:puzzle?puzzle.t:-1}),ensure,openSetup,chooseCPU,openStages,setSize,start,restart,undo,pass,scoreNow,hint,
    zoom:(d)=>g3d&&g3d.zoom(d*1.2),
    resetView:()=>{if(g3d){g3d.resetView();const b=document.getElementById('baduk2dBtn');if(b)b.textContent='2D 보기';}},
    toggle2D:()=>{if(!g3d)return;const on=g3d.toggle2D();const b=document.getElementById('baduk2dBtn');if(b)b.textContent=on?'3D 보기':'2D 보기';},
    setActive:(v)=>g3d&&g3d.setActive(v)};
})();
function badukToggleSnd(){const on=SFX.toggle();const b=document.getElementById('badukSndBtn');if(b)b.textContent=on?'🔊':'🔇';}

/* ================= 바둑 튜토리얼 ================= */
const BadukTutorial=(function(){
  // tiny board diagram: B/W stones, x = point to note, o = liberty, . = empty
  function mini(rows){
    let h='<div class="bdmini" style="grid-template-columns:repeat('+rows[0].length+',26px)">';
    rows.join('').split('').forEach(ch=>{
      const inner=ch==='B'?'<i class="bs"></i>':ch==='W'?'<i class="ws"></i>':ch==='x'?'<b class="bx">✕</b>':ch==='o'?'<i class="bo"></i>':'';
      h+='<span>'+inner+'</span>';});
    return h+'</div>';
  }
  const steps=[
    { title:'바둑이란?', visual: mini(['.....','.B.W.','..B..','.W...','.....']),
      body:'흑과 백이 번갈아 <b>선이 만나는 점(교차점)</b>에 돌을 하나씩 놓아요. 끝났을 때 <b>더 넓은 영역</b>을 차지한 쪽이 이깁니다. 흑이 먼저 둬요.' },
    { title:'활로 (숨구멍)', visual: mini(['.....','..o..','.oBo.','..o..','.....']),
      body:'돌과 바로 맞닿은 빈 점이 <b>활로</b>예요. 같은 색 돌이 가로·세로로 이어지면 한 덩어리가 되어 활로를 함께 써요.' },
    { title:'따내기', visual: mini(['.....','..B..','.BWx.','..B..','.....']),
      body:'상대 돌의 활로를 <b>모두 막으면</b> 그 돌을 판에서 들어내요. ✕ 자리에 흑을 두면 백 한 점을 따냅니다. 활로가 하나만 남은 상태를 <b>단수</b>라고 해요.' },
    { title:'자충수 금지', visual: mini(['.....','..W..','.WxW.','..W..','.....']),
      body:'놓자마자 내 돌의 활로가 0이 되는 자리(✕)에는 둘 수 없어요. 단, 그 수로 <b>상대 돌을 따낼 수 있다면</b> 둘 수 있어요.' },
    { title:'패 (ko)', visual: mini(['.BW.','BWxW','.BW.']),
      body:'✕에 흑을 두면 백 한 점을 따내요. 이때 백이 <b>바로 되따내는 것</b>은 금지예요. 다른 곳에 한 수를 둔 뒤에야 되따낼 수 있어요. 같은 모양이 끝없이 반복되는 걸 막는 규칙이에요.' },
    { title:'집과 계가', visual: mini(['BBB..','B..B.','B..B.','.BB..','.....']),
      body:'이 게임은 <b>중국식 계가</b>를 써요. 내 돌의 수 + 내 돌로만 둘러싸인 빈 점이 내 점수예요. 나중에 두는 백에게는 <b>덤 6.5집</b>을 더해 줍니다.' },
    { title:'사석 판정', visual: mini(['BBBB.','BWxB.','BBBB.','.....','.....']),
      body:'양쪽이 연속으로 <b>착수 포기</b>하면 대국이 끝나요. 살 수 없는 돌(사석)은 CPU가 수천 번 끝까지 둬 보는 시뮬레이션으로 판정해 ✕ 표시 후 빼고 계산해요.' },
    { title:'힌트와 형세', visual: '<div style="font-size:40px">💡</div>',
      body:'<b>💡 힌트</b>를 누르면 CPU가 읽은 추천 수와 예상 승률을 보여줘요. <b>집 계산</b>은 지금 형세를 추정해 줍니다. 처음이라면 9×9 판에서 시작해 보세요!' },
  ];
  let idx=0, openedFromSetup=false;
  function render(){
    const s=steps[idx];
    document.getElementById('badukTutProgress').textContent=(idx+1)+' / '+steps.length;
    document.getElementById('badukTutTitle').textContent=s.title;
    document.getElementById('badukTutVisual').innerHTML=s.visual;
    document.getElementById('badukTutBody').innerHTML=s.body;
    document.getElementById('badukTutPrev').style.visibility = idx===0 ? 'hidden' : 'visible';
    document.getElementById('badukTutNext').textContent = idx===steps.length-1 ? '완료' : '다음 →';
  }
  function open(){
    idx=0;
    const setupEl=document.getElementById('badukSetup');
    openedFromSetup = !setupEl.classList.contains('hidden');
    setupEl.classList.add('hidden');
    document.getElementById('badukTutorial').classList.add('show');
    render();
  }
  function close(){
    document.getElementById('badukTutorial').classList.remove('show');
    if(openedFromSetup) document.getElementById('badukSetup').classList.remove('hidden');
  }
  function next(){ if(idx>=steps.length-1){ close(); return; } idx++; render(); }
  function prev(){ if(idx>0){ idx--; render(); } }
  return { open, close, next, prev };
})();
