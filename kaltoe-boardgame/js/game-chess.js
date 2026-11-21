/* ===== Chess engine (runs inside the worker) — iterative deepening alpha-beta ===== */
// Self-contained (serialized with toString). Squares 0..63, row 0 = rank 8 (black's back rank).
// Pieces: 1 P,2 N,3 B,4 R,5 Q,6 K; +8 = black. White pawns move toward row 0.
function ChessWorker(self){
  const B=new Int8Array(64);let side=0,ep=-1,cr=0;           // side 0=white 8=black, castling bits wK1 wQ2 bK4 bQ8
  const VAL=[0,100,320,330,500,900,20000];
  // piece-square tables (white's view, row 0 = rank 8)
  const PST=[null,
   [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
   [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
   [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
   [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
   [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
   [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]];
  const KEND=[-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50];
  const NDIR=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const KDIR=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const BDIR=[[-1,-1],[-1,1],[1,-1],[1,1]],RDIR=[[-1,0],[1,0],[0,-1],[0,1]];
  const on=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
  // move = from | to<<6 | promo<<12 | flag<<16 (flag 1 ep, 2 castle, 4 double)
  function attacked(sq,by){ // is sq attacked by color `by` (0/8)?
    const r=sq>>3,c=sq&7;
    const pr=by===0?r+1:r-1;   // a white pawn attacks from the row below
    for(const dc of[-1,1]){const cc=c+dc;if(on(pr,cc)&&B[pr*8+cc]===(by|1))return true;}
    for(const[dr,dc]of NDIR){const rr=r+dr,cc=c+dc;if(on(rr,cc)&&B[rr*8+cc]===(by|2))return true;}
    for(const[dr,dc]of KDIR){const rr=r+dr,cc=c+dc;if(on(rr,cc)&&B[rr*8+cc]===(by|6))return true;}
    for(const[dr,dc]of BDIR){let rr=r+dr,cc=c+dc;while(on(rr,cc)){const p=B[rr*8+cc];if(p){if(p===(by|3)||p===(by|5))return true;break;}rr+=dr;cc+=dc;}}
    for(const[dr,dc]of RDIR){let rr=r+dr,cc=c+dc;while(on(rr,cc)){const p=B[rr*8+cc];if(p){if(p===(by|4)||p===(by|5))return true;break;}rr+=dr;cc+=dc;}}
    return false;}
  function kingSq(col){for(let i=0;i<64;i++)if(B[i]===(col|6))return i;return -1;}
  function inCheck(col){const k=kingSq(col);return k<0||attacked(k,col^8);}
  function gen(out,capsOnly){
    const me=side,opp=side^8;
    for(let s=0;s<64;s++){const p=B[s];if(!p||(p&8)!==me)continue;const t=p&7,r=s>>3,c=s&7;
      if(t===1){const d=me===0?-1:1,start=me===0?6:1,last=me===0?0:7;const r1=r+d;
        if(on(r1,c)&&!B[r1*8+c]){
          if(r1===last){out.push(s|(r1*8+c)<<6|5<<12);out.push(s|(r1*8+c)<<6|2<<12);}
          else if(!capsOnly){out.push(s|(r1*8+c)<<6);if(r===start&&!B[(r+2*d)*8+c])out.push(s|((r+2*d)*8+c)<<6|4<<16);}}
        for(const dc of[-1,1]){const cc=c+dc;if(!on(r1,cc))continue;const to=r1*8+cc,q=B[to];
          if(q&&(q&8)===opp){if(r1===last){out.push(s|to<<6|5<<12);out.push(s|to<<6|2<<12);}else out.push(s|to<<6);}
          else if(to===ep)out.push(s|to<<6|1<<16);}
      } else if(t===2||t===6){for(const[dr,dc]of(t===2?NDIR:KDIR)){const rr=r+dr,cc=c+dc;if(!on(rr,cc))continue;const q=B[rr*8+cc];
          if(q?(q&8)===opp:!capsOnly)out.push(s|(rr*8+cc)<<6);}
        if(t===6&&!capsOnly){const home=me===0?60:4;
          if(s===home&&!attacked(s,opp)){
            if(cr&(me===0?1:4)&&!B[s+1]&&!B[s+2]&&B[s+3]===(me|4)&&!attacked(s+1,opp)&&!attacked(s+2,opp))out.push(s|(s+2)<<6|2<<16);
            if(cr&(me===0?2:8)&&!B[s-1]&&!B[s-2]&&!B[s-3]&&B[s-4]===(me|4)&&!attacked(s-1,opp)&&!attacked(s-2,opp))out.push(s|(s-2)<<6|2<<16);}}
      } else {const dirs=t===3?BDIR:t===4?RDIR:KDIR;
        for(const[dr,dc]of dirs){let rr=r+dr,cc=c+dc;while(on(rr,cc)){const q=B[rr*8+cc];
          if(q){if((q&8)===opp)out.push(s|(rr*8+cc)<<6);break;} if(!capsOnly)out.push(s|(rr*8+cc)<<6);rr+=dr;cc+=dc;}}}
    }
    return out;}
  const ST=[];
  function make(m){const f=m&63,t=(m>>6)&63,pr=(m>>12)&7,fl=m>>16,p=B[f];
    const u={m,cap:B[t],ep,cr,capSq:t};
    if(fl&1){u.capSq=(side===0?t+8:t-8);u.cap=B[u.capSq];B[u.capSq]=0;}
    B[t]=pr?(side|pr):p;B[f]=0;
    if(fl&2){if(t>f){B[f+1]=B[f+3];B[f+3]=0;}else{B[f-1]=B[f-4];B[f-4]=0;}}
    ep=(fl&4)?(f+t)>>1:-1;
    if((p&7)===6)cr&=side===0?~3:~12;
    if(f===63||t===63)cr&=~1; if(f===56||t===56)cr&=~2; if(f===7||t===7)cr&=~4; if(f===0||t===0)cr&=~8;
    ST.push(u);side^=8;}
  function unmake(){const u=ST.pop();side^=8;const m=u.m,f=m&63,t=(m>>6)&63,pr=(m>>12)&7,fl=m>>16;
    B[f]=pr?(side|1):B[t];B[t]=0;B[u.capSq]=u.cap;
    if(fl&2){if(t>f){B[f+3]=B[f+1];B[f+1]=0;}else{B[f-4]=B[f-1];B[f-1]=0;}}
    ep=u.ep;cr=u.cr;}
  function evaluate(){ // from side-to-move view
    let s=0,mat=0;for(let i=0;i<64;i++){const p=B[i];if(p&&(p&7)!==6&&(p&7)!==1)mat+=VAL[p&7];}
    const endg=mat<=2600;
    for(let i=0;i<64;i++){const p=B[i];if(!p)continue;const t=p&7,white=(p&8)===0,idx=white?i:(i^56);
      const v=VAL[t]+(t===6&&endg?KEND[idx]:PST[t][idx]);s+=white?v:-v;}
    return side===0?s:-s;}
  let nodes=0,deadline=0,stop=false,noQ=false;const KILL=[];const HIST=new Int32Array(64*64);
  function order(ms,ply,best){const sc=ms.map(m=>{if(m===best)return 1e9;const t=(m>>6)&63,cap=B[t];
      let v=0;if(cap)v=1e6+VAL[cap&7]*10-VAL[B[m&63]&7];else if((m>>16)&1)v=1e6+900;
      if((m>>12)&7)v+=8e5;if(!cap&&KILL[ply]&&(KILL[ply][0]===m||KILL[ply][1]===m))v+=5e5;v+=HIST[m&4095];return v;});
    const idx=ms.map((_,i)=>i).sort((a,b)=>sc[b]-sc[a]);return idx.map(i=>ms[i]);}
  function quiesce(a,b,ply){
    if((++nodes&2047)===0&&Date.now()>deadline)stop=true;
    const stand=evaluate();if(stand>=b)return stand;if(stand>a)a=stand;if(ply>30)return stand;
    const ms=order(gen([],true),ply,0);
    for(const m of ms){make(m);if(inCheck(side^8)){unmake();continue;}
      const v=-quiesce(-b,-a,ply+1);unmake();if(stop)return a;
      if(v>=b)return v;if(v>a)a=v;}
    return a;}
  const MATE=100000;
  function search(d,a,b,ply){
    if((++nodes&2047)===0&&Date.now()>deadline)stop=true;
    if(stop)return 0;
    const chk=inCheck(side);if(chk)d++;
    if(d<=0)return noQ?evaluate():quiesce(a,b,ply);
    const ms=order(gen([],false),ply,0);let legal=0,best=-MATE*2;
    for(const m of ms){make(m);if(inCheck(side^8)){unmake();continue;}legal++;
      const v=-search(d-1,-b,-a,ply+1);unmake();if(stop)return 0;
      if(v>best)best=v;
      if(v>a){a=v;if(a>=b){if(!B[(m>>6)&63]){KILL[ply]=KILL[ply]||[0,0];if(KILL[ply][0]!==m){KILL[ply][1]=KILL[ply][0];KILL[ply][0]=m;}HIST[m&4095]+=d*d;}break;}}}
    if(!legal)return chk?-MATE+ply:0;
    return best;}
  function rootMoves(){const out=[];for(const m of gen([],false)){make(m);if(!inCheck(side^8))out.push(m);unmake();}return out;}
  function think(d){
    B.set(d.board);side=d.side;ep=d.ep;cr=d.cr;ST.length=0;KILL.length=0;HIST.fill(0);nodes=0;stop=false;
    const ms0=rootMoves();if(!ms0.length)return {move:-1};
    noQ=!!d.noQ;
    if(d.randomP&&Math.random()<d.randomP)return {move:ms0[(Math.random()*ms0.length)|0],why:'random'};
    const t0=Date.now();deadline=t0+(d.inThread?Math.min(d.ms,700):d.ms);
    let best=ms0[0],bestScore=0,depthDone=0;
    if(d.noise>0){ // weak levels: score every move at a shallow depth, then add noise
      const sc=[];for(const m of ms0){make(m);sc.push(-search(Math.max(0,d.maxDepth-1),-MATE*2,MATE*2,1)+Math.random()*d.noise);unmake();}
      let bi=0;sc.forEach((v,i)=>{if(v>sc[bi])bi=i;});return {move:ms0[bi],score:sc[bi],depth:d.maxDepth};}
    let ms=ms0.slice();
    for(let depth=1;depth<=d.maxDepth;depth++){
      let a=-MATE*2,cand=ms[0],cs=-MATE*2;const scores=new Map();
      for(const m of ms){make(m);const v=-search(depth-1,-MATE*2,-a,1);unmake();if(stop)break;
        scores.set(m,v);if(v>cs){cs=v;cand=m;}if(v>a)a=v;}
      if(stop&&depth>1)break;
      best=cand;bestScore=cs;depthDone=depth;
      ms=order(ms,0,best);
      if(cs>MATE-1000)break;                                 // found a forced mate
      if(Date.now()-t0>(deadline-t0)*0.45)break;             // next iteration would not finish
    }
    return {move:best,score:bestScore,depth:depthDone,nodes};}
  function perft(n){if(!n)return 1;let c=0;for(const m of gen([],false)){make(m);if(!inCheck(side^8))c+=perft(n-1);unmake();}return c;}
  function perftRun(d){B.set(d.board);side=d.side;ep=d.ep;cr=d.cr;ST.length=0;return {n:perft(d.depth)};}
  self.onmessage=(e)=>{const d=e.data;let result;
    try{result=d.type==='perft'?perftRun(d):think(d);}catch(err){result={error:String(err&&err.message||err)};}
    self.postMessage({id:d.id,result});};
}
const ChessAI=makeAIWorker(ChessWorker);

const ChessApp=(function(){
// ---------- Sound engine (Web Audio, no files) ----------
// one shared sound engine for every game (same API, one AudioContext, one on/off switch)
const Sound=SFX;

// ---------- Chess logic ----------
const KOR={
  p:{name:"폰 (Pawn)",ko:"병졸",g:"♟",rule:"앞으로 한 칸(첫 수는 두 칸). 잡을 땐 대각선 앞으로만."},
  r:{name:"룩 (Rook)",ko:"성",g:"♜",rule:"가로·세로로 직선 이동. 말을 뛰어넘지 못해요."},
  n:{name:"나이트 (Knight)",ko:"기사",g:"♞",rule:"L자 이동(2+1칸). 유일하게 다른 말을 뛰어넘어요."},
  b:{name:"비숍 (Bishop)",ko:"주교",g:"♝",rule:"대각선으로 직선 이동. 같은 색 칸에만 머물러요."},
  q:{name:"퀸 (Queen)",ko:"여왕",g:"♛",rule:"가장 강한 말. 모든 방향 직선 이동."},
  k:{name:"킹 (King)",ko:"왕",g:"♚",rule:"모든 방향 한 칸씩. 지켜야 하는 가장 중요한 말."}
};
const VAL={p:100,n:320,b:330,r:500,q:900,k:20000};
const CHESS_PUZZLES = [{"id":1,"level":1,"title":"백랭크 메이트","cat":"메이트 패턴","desc":"룩이 8랭크로 내려가면 폰에 갇힌 흑 킹은 도망갈 곳이 없어요.","goal":"mate","pieces":[[7,0,"r","w"],[7,6,"k","w"],[6,5,"p","w"],[6,6,"p","w"],[6,7,"p","w"],[0,6,"k","b"],[1,5,"p","b"],[1,6,"p","b"],[1,7,"p","b"]],"solution":[[7,0,0,0]]},{"id":2,"level":1,"title":"나이트 포크","cat":"포크","desc":"나이트가 체크를 걸면서 동시에 룩도 노려요. 킹이 피하면 룩을 잡습니다.","goal":"check","pieces":[[3,1,"n","w"],[7,7,"k","w"],[0,4,"k","b"],[0,0,"r","b"],[1,5,"p","b"],[1,6,"p","b"],[1,7,"p","b"]],"solution":[[3,1,1,2]]},{"id":3,"level":2,"title":"절대 핀 활용","cat":"핀","desc":"나이트는 킹에 묶여 있어서 비숍을 잡아도 반격할 수 없어요.","goal":"material","pieces":[[5,5,"n","w"],[7,7,"k","w"],[3,1,"b","w"],[0,4,"k","b"],[2,2,"n","b"],[1,3,"p","b"]],"solution":[[3,1,2,2]]},{"id":4,"level":2,"title":"스큐어","cat":"스큐어","desc":"체크를 피해 킹이 움직이면 뒤에 있던 퀸이 룩에게 잡혀요.","goal":"check","pieces":[[7,7,"r","w"],[7,6,"k","w"],[0,4,"k","b"],[0,0,"q","b"]],"solution":[[7,7,0,7]]},{"id":5,"level":3,"title":"디스커버드 어택","cat":"디스커버드","desc":"비숍이 비켜서면 뒤에 있던 룩의 체크가 드러나고, 비숍은 퀸도 노려요.","goal":"check","pieces":[[7,3,"r","w"],[7,6,"k","w"],[4,3,"b","w"],[0,3,"k","b"],[0,7,"q","b"]],"solution":[[4,3,1,6]]},{"id":6,"level":3,"title":"퀸 더블어택","cat":"더블어택","desc":"퀸이 체크를 걸면서 동시에 룩을 잡아요.","goal":"material","pieces":[[3,7,"q","w"],[7,6,"k","w"],[0,4,"k","b"],[3,4,"r","b"],[1,5,"p","b"],[1,6,"p","b"],[1,7,"p","b"]],"solution":[[3,7,3,4]]},{"id":7,"level":4,"title":"래더 메이트","cat":"메이트 패턴","desc":"두 룩이 사다리처럼 계단식으로 킹을 몰아 외곽으로 체크메이트해요.","goal":"mate","pieces":[[1,3,"r","w"],[7,7,"r","w"],[7,6,"k","w"],[0,0,"k","b"]],"solution":[[7,7,0,7]]},{"id":8,"level":5,"title":"스매더드 메이트","cat":"메이트 패턴","desc":"자기 기물에 둘러싸여 질식한 킹은 나이트 체크를 피할 곳이 없어요.","goal":"mate","pieces":[[7,6,"k","w"],[3,6,"n","w"],[0,7,"k","b"],[0,6,"r","b"],[1,6,"p","b"],[1,7,"p","b"]],"solution":[[3,6,1,5]]},{"id":9,"level":5,"title":"애너스타샤 메이트","cat":"메이트 패턴","desc":"나이트가 g8·g6 도주로를 막고, 룩이 h파일을 따라 외통을 냅니다.","goal":"mate","pieces":[[7,6,"k","w"],[1,4,"n","w"],[5,0,"r","w"],[1,7,"k","b"],[1,6,"p","b"]],"solution":[[5,0,5,7]]},{"id":10,"level":4,"title":"윈드밀 (디스커버드체크)","cat":"디스커버드","desc":"비숍이 옮겨가며 뒤의 룩 체크를 드러내고, 동시에 퀸도 잡아냅니다.","goal":"material","pieces":[[7,0,"k","w"],[7,6,"r","w"],[4,6,"b","w"],[0,6,"k","b"],[1,7,"p","b"],[1,5,"p","b"],[1,3,"q","b"]],"solution":[[4,6,1,3]]},{"id":11,"level":6,"title":"엑스레이 어택","cat":"엑스레이","desc":"앞 룩이 나이트를 잡아도 뒤 룩이 같은 줄에서 지원하고 있어 안전해요.","goal":"material","pieces":[[7,3,"r","w"],[4,3,"r","w"],[7,6,"k","w"],[0,3,"k","b"],[2,3,"n","b"],[0,4,"q","b"]],"solution":[[4,3,2,3]]},{"id":12,"level":7,"title":"데코이 (유인)","cat":"데코이","desc":"룩을 미끼로 희생해 흑 룩을 b7로 유인한 뒤, 나이트가 킹과 룩을 포크로 노려요.","goal":"check","pieces":[[7,1,"r","w"],[4,2,"n","w"],[7,7,"k","w"],[0,4,"k","b"],[0,1,"r","b"],[1,1,"p","b"],[1,5,"p","b"],[1,6,"p","b"],[1,7,"p","b"]],"solution":[[7,1,1,1],[0,1,1,1],[4,2,2,3]]},{"id":13,"level":8,"title":"디플렉션 (전환)","cat":"디플렉션","desc":"룩을 희생해 킹을 f8로 끌어낸 뒤, 나이트가 체크를 걸며 퀸도 노려요.","goal":"check","pieces":[[7,5,"r","w"],[3,7,"q","w"],[7,1,"k","w"],[3,2,"n","w"],[0,6,"k","b"],[0,5,"r","b"],[1,6,"p","b"],[1,7,"p","b"],[0,3,"q","b"]],"solution":[[7,5,0,5],[0,6,0,5],[3,2,2,4]]}];

const startRows=[
  ["r","n","b","q","k","b","n","r"],
  ["p","p","p","p","p","p","p","p"],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ["p","p","p","p","p","p","p","p"],
  ["r","n","b","q","k","b","n","r"]
];
function freshBoard(){
  const b=startRows.map((row,r)=>row.map(t=>t?{t,c:r<2?"b":"w",moved:false}:null));
  b.ep=null; // en-passant target square [r,c] or null
  return b;
}
const inB=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
function clone(b){
  const nb=b.map(row=>row.map(x=>x?{t:x.t,c:x.c,moved:x.moved}:null));
  nb.ep=b.ep?[b.ep[0],b.ep[1]]:null;
  return nb;
}

function pseudoMoves(b,r,c){
  const p=b[r][c];if(!p)return[];
  const out=[],opp=p.c==="w"?"b":"w";
  const add=(rr,cc)=>{if(!inB(rr,cc))return false;const t=b[rr][cc];if(!t){out.push([rr,cc]);return true;}if(t.c===opp)out.push([rr,cc]);return false;};
  const ray=d=>d.forEach(([dr,dc])=>{let rr=r+dr,cc=c+dc;while(add(rr,cc)){rr+=dr;cc+=dc;}});
  if(p.t==="p"){
    const dir=p.c==="w"?-1:1,home=p.c==="w"?6:1;
    if(inB(r+dir,c)&&!b[r+dir][c]){out.push([r+dir,c]);if(r===home&&!b[r+2*dir][c])out.push([r+2*dir,c]);}
    [[dir,-1],[dir,1]].forEach(([dr,dc])=>{const rr=r+dr,cc=c+dc;if(inB(rr,cc)){
      if(b[rr][cc]&&b[rr][cc].c===opp)out.push([rr,cc]);
      else if(b.ep&&b.ep[0]===rr&&b.ep[1]===cc)out.push([rr,cc]); // en passant
    }});
  } else if(p.t==="n"){[[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]].forEach(([dr,dc])=>add(r+dr,c+dc));}
  else if(p.t==="r")ray([[1,0],[-1,0],[0,1],[0,-1]]);
  else if(p.t==="b")ray([[1,1],[1,-1],[-1,1],[-1,-1]]);
  else if(p.t==="q")ray([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
  else if(p.t==="k"){
    [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>add(r+dr,c+dc));
    // castling: king not moved, not in check, path clear & safe, rook not moved
    if(!p.moved && !inCheck(b,p.c)){
      const rank=r;
      // kingside (rook at col 7)
      const rk=b[rank][7];
      if(rk&&rk.t==="r"&&rk.c===p.c&&!rk.moved&&!b[rank][5]&&!b[rank][6]
         && !attacked(b,rank,5,opp) && !attacked(b,rank,6,opp)){out.push([rank,6]);}
      // queenside (rook at col 0)
      const rq=b[rank][0];
      if(rq&&rq.t==="r"&&rq.c===p.c&&!rq.moved&&!b[rank][1]&&!b[rank][2]&&!b[rank][3]
         && !attacked(b,rank,3,opp) && !attacked(b,rank,2,opp)){out.push([rank,2]);}
    }
  }
  return out;
}
// Apply a move to board b (mutating), handling castling, en passant, promotion, flags, ep target.
// Returns {capture:bool, castle:false|'K'|'Q', ep:bool, promo:false|type}
function makeMove(b,r,c,rr,cc,promoType){
  const p=b[r][c];
  let info={capture:!!b[rr][cc],castle:false,ep:false,promo:false};
  const newEp=null;
  // en passant capture: pawn moves diagonally to empty ep square
  if(p.t==="p"&&cc!==c&&!b[rr][cc]&&b.ep&&b.ep[0]===rr&&b.ep[1]===cc){
    b[r][cc]=null; // captured pawn sits on the moving pawn's row, target col
    info.capture=true;info.ep=true;
  }
  // castling: king moves two files
  if(p.t==="k"&&Math.abs(cc-c)===2){
    if(cc===6){const rook=b[r][7];b[r][5]=rook;b[r][7]=null;if(rook)rook.moved=true;info.castle="K";}
    else if(cc===2){const rook=b[r][0];b[r][3]=rook;b[r][0]=null;if(rook)rook.moved=true;info.castle="Q";}
  }
  b[rr][cc]=p;b[r][c]=null;
  if(p)p.moved=true;
  // set new ep target if pawn double-stepped
  b.ep=null;
  if(p.t==="p"&&Math.abs(rr-r)===2){b.ep=[(r+rr)/2,c];}
  // promotion
  if(p.t==="p"&&(rr===0||rr===7)){p.t=promoType||"q";info.promo=p.t;}
  return info;
}
function findKing(b,col){for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(p&&p.t==="k"&&p.c===col)return[r,c];}return null;}
function attacked(b,r,c,by){
  for(let i=0;i<8;i++)for(let j=0;j<8;j++){const p=b[i][j];if(p&&p.c===by){
    // use non-castling attack squares to avoid recursion via king castling check
    if(attackSquares(b,i,j).some(([mr,mc])=>mr===r&&mc===c))return true;}}
  return false;
}
// squares a piece attacks (pawns attack diagonally; king attacks adjacent; no castling) — for check detection
function attackSquares(b,r,c){
  const p=b[r][c];if(!p)return[];
  const out=[];
  const push=(rr,cc)=>{if(inB(rr,cc))out.push([rr,cc]);};
  if(p.t==="p"){const dir=p.c==="w"?-1:1;push(r+dir,c-1);push(r+dir,c+1);return out;}
  if(p.t==="n"){[[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]].forEach(([dr,dc])=>push(r+dr,c+dc));return out;}
  if(p.t==="k"){[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>push(r+dr,c+dc));return out;}
  const opp=p.c==="w"?"b":"w";
  const ray=d=>d.forEach(([dr,dc])=>{let rr=r+dr,cc=c+dc;while(inB(rr,cc)){out.push([rr,cc]);if(b[rr][cc])break;rr+=dr;cc+=dc;}});
  if(p.t==="r")ray([[1,0],[-1,0],[0,1],[0,-1]]);
  else if(p.t==="b")ray([[1,1],[1,-1],[-1,1],[-1,-1]]);
  else if(p.t==="q")ray([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
  return out;
}
function inCheck(b,col){const k=findKing(b,col);if(!k)return false;return attacked(b,k[0],k[1],col==="w"?"b":"w");}
function legalMoves(b,r,c){
  const p=b[r][c];if(!p)return[];
  return pseudoMoves(b,r,c).filter(([rr,cc])=>{
    const nb=clone(b);makeMove(nb,r,c,rr,cc,"q");
    return !inCheck(nb,p.c);
  });
}
function allMoves(b,col){
  const res=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(p&&p.c===col)legalMoves(b,r,c).forEach(m=>res.push([r,c,m[0],m[1]]));}
  return res;
}

// ---------- Game state ----------
let board,turn,sel,legal,mode,difficulty,history,gameOver,promoPending;
let currentStage=0;            // 1..10 when in arcade mode, 0 otherwise
let stageCleared=1;            // highest unlocked stage (session progress)
let moveLog=[];                // algebraic-ish notation strings
let captured={w:[],b:[]};      // pieces captured BY each color
let lastMove=null;             // [r,c,rr,cc] for highlight
let moveNumber=0;              // full/half move counter (plies)
let stageBest={};              // stage -> fewest plies to win
let hintSquares=null;          // [r,c,rr,cc] shown as a hint
let halfmoveClock=0;           // for 50-move rule (plies since pawn move or capture)
let trainPuzzle=null;          // current puzzle object when mode==="training"
let trainStep=0;               // index into trainPuzzle.solution the player must match next
let trainCleared={};           // {puzzleId: true} — completed this session (+ persisted)
// ---- toss-boardgames additions: 오늘의 문제 (mate puzzles), 친구 대국 (moves by link), AI 복기 ----
let puzzle=null, mail=null, review=null, badSquares=null, replaying=false, mlog=[];
let endHook=null; const emit=(info)=>{try{endHook&&endHook(Object.assign({mode,level:difficulty,stage:currentStage,plies:moveNumber},info));}catch(e){console.error(e);}};
const FILES="abcdefgh";
function sqName(r,c){return FILES[c]+(8-r);}
// per-stage CPU strength: search depth + random blunder amount (higher stage = smaller blunder)
// maxDepth: search depth cap · noise: random centipawns added at low stages · ms: thinking time
function stageConfig(s){
  // [depth, noise, ms, random-move chance, look at captures beyond the horizon?]
  const T=[null,[1,450,250,.35,0],[1,350,250,.25,0],[1,250,250,.15,0],[2,160,300,.08,0],[2,90,300,.04,1],
               [2,40,400,0,1],[3,20,500,0,1],[4,0,700,0,1],[5,0,1000,0,1],[64,0,1600,0,1]][s];
  return {maxDepth:T[0],noise:T[1],ms:T[2],randomP:T[3],noQ:!T[4],depth:s<=3?1:s<=6?2:3};
}
function cpuConfig(){
  if(mode==="puzzle")return {maxDepth:64,noise:0,ms:1200};
  if(mode==="arcade")return stageConfig(currentStage);
  if(difficulty>10)return stageConfig(Math.min(10,difficulty-10));
  return [null,{maxDepth:1,noise:400,ms:250,randomP:.3,noQ:true},{maxDepth:2,noise:60,ms:400,randomP:.03,noQ:false},{maxDepth:64,noise:0,ms:1500}][difficulty];
}
// board → engine format (piece codes, castling rights from the moved flags, en-passant square)
function engineInput(b,col){
  const T={p:1,n:2,b:3,r:4,q:5,k:6},arr=new Array(64).fill(0);
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(p)arr[r*8+c]=T[p.t]|(p.c==="b"?8:0);}
  const un=(r,c,co,t)=>{const p=b[r][c];return p&&p.t===t&&p.c===co&&!p.moved;};
  let cr=0;
  if(un(7,4,"w","k")){if(un(7,7,"w","r"))cr|=1;if(un(7,0,"w","r"))cr|=2;}
  if(un(0,4,"b","k")){if(un(0,7,"b","r"))cr|=4;if(un(0,0,"b","r"))cr|=8;}
  return {board:arr,side:col==="w"?0:8,cr,ep:b.ep?b.ep[0]*8+b.ep[1]:-1};
}
function decodeMove(m){const f=m&63,t=(m>>6)&63;return [f>>3,f&7,t>>3,t&7,({2:"n",5:"q"})[(m>>12)&7]||"q"];}
function isLegalMove(col,mv){return allMoves(board,col).some(m=>m[0]===mv[0]&&m[1]===mv[1]&&m[2]===mv[2]&&m[3]===mv[3]);}
function pushHistory(){
  history.push({
    board:clone(board),
    moveLog:moveLog.slice(),
    capW:captured.w.slice(),
    capB:captured.b.slice(),
    lastMove:lastMove?lastMove.slice():null,
    moveNumber, halfmoveClock
  });
}
function restoreHistory(h){
  board=h.board;
  moveLog=h.moveLog;captured={w:h.capW,b:h.capB};
  lastMove=h.lastMove;moveNumber=h.moveNumber;halfmoveClock=h.halfmoveClock;
}
function newGame(){
  mlog=[];badSquares=null;review=null;
  board=freshBoard();turn="w";sel=null;legal=[];history=[];gameOver=false;promoPending=null;
  moveLog=[];captured={w:[],b:[]};lastMove=null;moveNumber=0;hintSquares=null;halfmoveClock=0;
  buildPieces();refreshHighlights();updateHUD();renderSidePanels();
  try{window.Resume&&Resume.touch();}catch(e){}
}
function boardFromPuzzle(puzzle){
  const b=Array.from({length:8},()=>Array(8).fill(null)); b.ep=null;
  puzzle.pieces.forEach(([r,c,t,col])=>{ b[r][c]={t,c:col,moved:true}; });
  return b;
}
function newTrainingGame(puzzle){
  trainPuzzle=puzzle; trainStep=0;
  board=boardFromPuzzle(puzzle); turn="w"; sel=null; legal=[]; history=[]; gameOver=false; promoPending=null;
  moveLog=[]; captured={w:[],b:[]}; lastMove=null; moveNumber=0; hintSquares=null; halfmoveClock=0;
  buildPieces(); refreshHighlights(); updateHUD(); renderSidePanels();
  showMsg("🎓 "+puzzle.title+" — 정답 수를 찾아보세요");
}

// ---------- Three.js scene ----------
const app=document.getElementById("app");
let scene,camera,renderer,raycaster,mouse,boardGroup,pieceGroup,highlightGroup;
let chessActive=true;
let effectGroup;                 // holds transient capture-impact objects (knockback piece, sparks, flash)
let punchT=0;let _chIntroT0=-1e9,_chCelebT0=-1e9,_chShake=0;window._chCelebrate=()=>{_chCelebT0=performance.now();_chShake=0.12;};                     // brief camera zoom-punch timer, decays each frame
const activeAnims=[];             // list of {update(dt), t, dur} — advanced each frame, removed when done
function disposeObj3D(o){
  if(o.geometry&&o.geometry.dispose)o.geometry.dispose();
  if(o.material){const m=o.material;(Array.isArray(m)?m:[m]).forEach(mm=>{if(mm&&mm.map&&mm.map.dispose)mm.map.dispose();if(mm&&mm.dispose)mm.dispose();});}
  if(o.children&&o.children.length)o.children.slice().forEach(disposeObj3D);
}
const SQ=1, N=8, OFF=(N-1)/2;
const pieceMeshes={}; // key "r,c" -> mesh

function initThree(){
  scene=new THREE.Scene();
  // deep vignette backdrop instead of a flat color
  {const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d');
   const g=x.createRadialGradient(256,200,30,256,256,380);g.addColorStop(0,'#4a3f36');g.addColorStop(0.55,'#221b16');g.addColorStop(1,'#080706');
   x.fillStyle=g;x.fillRect(0,0,512,512);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;scene.background=t;}
  scene.fog=new THREE.Fog(0x0b0908,24,46);
  camera=new THREE.PerspectiveCamera(45,app.clientWidth/app.clientHeight,0.1,100);
  renderer=new THREE.WebGLRenderer({antialias:true});
  _chDead=false;
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(app.clientWidth,app.clientHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  // filmic tone mapping + sRGB output: richer contrast, no blown-out whites
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  renderer.physicallyCorrectLights=false;
  scene.environment=makeStudioEnv(renderer);
  app.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();},false);
  renderer.domElement.addEventListener('webglcontextrestored',()=>{try{syncPieces();refreshHighlights();}catch(e){}},false);

  // most light now comes from the studio environment; a warm key casts the shadows
  scene.add(new THREE.HemisphereLight(0xdfe8ff,0x3a2e24,.35));
  const key=new THREE.DirectionalLight(0xfff1de,1.9);key.position.set(6,15,7);key.castShadow=true;
  key.shadow.mapSize.set(_SHADOW_SIZE,_SHADOW_SIZE);key.shadow.camera.left=-7.5;key.shadow.camera.right=7.5;key.shadow.camera.top=7.5;key.shadow.camera.bottom=-7.5;
  key.shadow.bias=-0.0004;key.shadow.normalBias=0.02;key.shadow.radius=4;
  scene.add(key);
  const fill=new THREE.DirectionalLight(0xbcd4ff,.45);fill.position.set(-7,6,-5);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffffff,.55);rim.position.set(0,5,-12);scene.add(rim);

  boardGroup=new THREE.Group();scene.add(boardGroup);
  pieceGroup=new THREE.Group();scene.add(pieceGroup);
  highlightGroup=new THREE.Group();scene.add(highlightGroup);
  effectGroup=new THREE.Group();scene.add(effectGroup);
  buildBoard();
  try{ // v1 table dressing
    const bb=new THREE.Box3().setFromObject(boardGroup);const y0=bb.min.y-0.002;
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,
      map:_cvTex(256,256,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,w*.06,w/2,h/2,w/2);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.4,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,.97)');g.fillStyle=gr;g.fillRect(0,0,w,h);})}));
    pool.rotation.x=-Math.PI/2;pool.position.y=-0.596;pool.renderOrder=1;scene.add(pool);
    key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.camera.updateProjectionMatrix();
  }catch(e){}

  raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
  window.addEventListener("resize",onResize);

  // camera orbit
  camState={theta:DEFAULT_CAM.theta,phi:DEFAULT_CAM.phi,rad:DEFAULT_CAM.rad,target:new THREE.Vector3(0,0,0)};
  setupOrbit();
  chessActive=true;      // 정리(dispose) 뒤 다시 들어와도 루프가 돌도록
  _chNeed=2;_chLastSig=-1;_chIdle=0;_chGQ=-1;
  animate();
}
function toXZ(r,c){return {x:(c-OFF)*SQ, z:(r-OFF)*SQ};}

// polished marble: soft cloudy base + a few wandering veins (each square shows a different patch)
function makeMarbleTexture(base,cloud,vein,size){
  size=size||512;
  const cv=document.createElement('canvas');cv.width=cv.height=size;const cx=cv.getContext('2d');
  cx.fillStyle=base;cx.fillRect(0,0,size,size);
  for(let i=0;i<70;i++){const x=Math.random()*size,y=Math.random()*size,r=20+Math.random()*110;
    const g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,cloud);g.addColorStop(1,'rgba(0,0,0,0)');
    cx.globalAlpha=0.08+Math.random()*0.1;cx.fillStyle=g;cx.fillRect(x-r,y-r,r*2,r*2);}
  cx.globalAlpha=1;
  for(let v=0;v<7;v++){
    let x=Math.random()*size,y=-20;cx.beginPath();cx.moveTo(x,y);
    while(y<size+20){const nx=x+(Math.random()-0.45)*60,ny=y+20+Math.random()*40;cx.quadraticCurveTo(x+(Math.random()-0.5)*40,(y+ny)/2,nx,ny);x=nx;y=ny;}
    cx.strokeStyle=vein;cx.lineWidth=0.6+Math.random()*1.8;cx.globalAlpha=0.25+Math.random()*0.35;
    cx.shadowColor=vein;cx.shadowBlur=4;cx.stroke();}
  cx.globalAlpha=1;cx.shadowBlur=0;
  const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=_ANISO;
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  return tex;
}
function makeWoodTexture(w,h,base,dark,light){
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');
  cx.fillStyle=base;cx.fillRect(0,0,w,h);
  for(let i=0;i<160;i++){const y=Math.random()*h,th=0.5+Math.random()*2.5;
    cx.fillStyle=Math.random()>0.5?dark:light;cx.globalAlpha=0.08+Math.random()*0.22;
    cx.beginPath();cx.moveTo(0,y);
    for(let x=0;x<=w;x+=w/16)cx.lineTo(x,y+Math.sin(x*0.01+i)*3+(Math.random()-0.5)*1.5);
    cx.lineTo(w,y+th);cx.lineTo(0,y+th);cx.fill();}
  cx.globalAlpha=1;
  return cv;
}
function buildBoard(){
  // walnut base slab
  const woodCv=makeWoodTexture(1024,256,'#4a2d1b','#22140b','#7a4c2e');
  const woodTex=new THREE.CanvasTexture(woodCv);woodTex.encoding=THREE.sRGBEncoding;woodTex.anisotropy=_ANISO;
  const woodMat=new THREE.MeshStandardMaterial({map:woodTex,roughness:.45,metalness:0,envMapIntensity:.45});
  const base=new THREE.Mesh(new THREE.BoxGeometry(N+1.3,0.5,N+1.3),woodMat);
  base.position.y=-0.35;base.receiveShadow=true;base.castShadow=true;boardGroup.add(base);
  // frame top: wood + brass inlay + engraved coordinates (a–h, 1–8), drawn on one plane
  const F=N+1.3,S=1024,px=v=>(v+F/2)/F*S;
  const cv=document.createElement('canvas');cv.width=cv.height=S;const cx=cv.getContext('2d');
  cx.drawImage(woodCv,0,0,S,S);
  const gold=cx.createLinearGradient(0,0,S,S);gold.addColorStop(0,'#e9c46a');gold.addColorStop(0.5,'#a8812f');gold.addColorStop(1,'#f2d68a');
  cx.strokeStyle=gold;cx.lineWidth=6;cx.strokeRect(px(-N/2-0.12),px(-N/2-0.12),px(N/2+0.12)-px(-N/2-0.12),px(N/2+0.12)-px(-N/2-0.12));
  cx.lineWidth=2;cx.strokeRect(px(-F/2+0.12),px(-F/2+0.12),px(F/2-0.12)-px(-F/2+0.12),px(F/2-0.12)-px(-F/2+0.12));
  cx.fillStyle=gold;cx.font='700 34px Georgia,"Times New Roman",serif';cx.textAlign='center';cx.textBaseline='middle';
  for(let c=0;c<8;c++){const x=px(c-OFF);cx.fillText('abcdefgh'[c],x,px(N/2+0.33));cx.save();cx.translate(x,px(-N/2-0.33));cx.rotate(Math.PI);cx.fillText('abcdefgh'[c],0,0);cx.restore();}
  for(let r=0;r<8;r++){const y=px(r-OFF);cx.fillText(String(8-r),px(-N/2-0.33),y);cx.save();cx.translate(px(N/2+0.33),y);cx.rotate(Math.PI);cx.fillText(String(8-r),0,0);cx.restore();}
  const topTex=new THREE.CanvasTexture(cv);topTex.encoding=THREE.sRGBEncoding;topTex.anisotropy=_ANISO;
  const top=new THREE.Mesh(new THREE.PlaneGeometry(F,F),new THREE.MeshStandardMaterial({map:topTex,roughness:.4,metalness:.05,envMapIntensity:.5}));
  top.rotation.x=-Math.PI/2;top.position.y=-0.099;top.receiveShadow=true;boardGroup.add(top);
  // table underneath, catching the board's soft shadow
  const tcv=makeWoodTexture(1024,1024,'#1a1310','#0a0705','#2d2119');
  const tt=new THREE.CanvasTexture(tcv);tt.encoding=THREE.sRGBEncoding;tt.wrapS=tt.wrapT=THREE.RepeatWrapping;tt.repeat.set(3,3);
  const table=new THREE.Mesh(new THREE.CircleGeometry(30,64),new THREE.MeshStandardMaterial({map:tt,roughness:.85,envMapIntensity:.12}));
  table.rotation.x=-Math.PI/2;table.position.y=-0.6;table.receiveShadow=true;boardGroup.add(table);
  // polished marble squares
  // square colors and surface come from the chosen board theme (see BOARD_THEMES)
  const [lightTex,darkTex]=boardTextures();
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
    const dark=(r+c)%2===1, t=squareTex(dark?darkTex:lightTex);
    const mat=new THREE.MeshStandardMaterial({color:boardTint(),map:t,roughness:boardTheme.pattern==='solid'?.6:.22,metalness:0,envMapIntensity:boardEnv()});
    const m=new THREE.Mesh(new THREE.BoxGeometry(SQ,0.2,SQ),mat);
    const {x,z}=toXZ(r,c);m.position.set(x,-0.1,z);m.receiveShadow=true;
    m.userData={r,c,base:m.material.color.getHex()};
    boardGroup.add(m);
  }
}

// piece geometry builders
const PIECE_BASE=[[0,0],[0.40,0],[0.415,0.025],[0.41,0.06],[0.37,0.09],[0.375,0.12],[0.33,0.15],[0.29,0.19],[0.25,0.23]];
const PIECE_PROFILE={
  p:[[0.19,0.27],[0.15,0.36],[0.12,0.46],[0.11,0.52],[0.18,0.55],[0.18,0.58],[0.11,0.61],[0,0.61]],
  r:[[0.25,0.28],[0.22,0.38],[0.205,0.62],[0.21,0.76],[0.27,0.80],[0.28,0.92],[0.20,0.92],[0.20,0.86],[0,0.86]],
  b:[[0.19,0.28],[0.14,0.44],[0.11,0.62],[0.10,0.70],[0.19,0.73],[0.19,0.77],[0.11,0.80],[0.14,0.85],[0.19,0.96],[0.185,1.06],[0.14,1.17],[0.07,1.25],[0.02,1.29],[0,1.30]],
  q:[[0.22,0.28],[0.17,0.44],[0.135,0.66],[0.12,0.86],[0.23,0.90],[0.23,0.94],[0.13,0.98],[0.16,1.04],[0.25,1.17],[0.24,1.20],[0.13,1.16],[0,1.16]],
  k:[[0.22,0.28],[0.17,0.46],[0.14,0.70],[0.13,0.90],[0.24,0.95],[0.24,0.99],[0.14,1.03],[0.17,1.09],[0.23,1.22],[0.19,1.27],[0,1.28]],
  n:[[0.25,0.28],[0.24,0.31],[0,0.31]]
};
const _pieceGeoCache={};
function pieceLathe(type){
  if(_pieceGeoCache[type])return _pieceGeoCache[type];
  const pts=PIECE_BASE.concat(PIECE_PROFILE[type]).map(([x,y])=>new THREE.Vector2(x,y));
  const g=new THREE.LatheGeometry(pts,48);g.computeVertexNormals();
  return _pieceGeoCache[type]=g;
}
function knightHeadGeo(){
  if(_pieceGeoCache.nh)return _pieceGeoCache.nh;
  // side profile of a horse head (x = forward, y = up), extruded and beveled
  const P=[[-0.21,0.30],[0.19,0.30],[0.15,0.44],[0.10,0.56],[0.22,0.68],[0.31,0.77],[0.33,0.85],[0.29,0.91],[0.18,0.94],[0.10,1.00],
           [0.06,1.12],[0.01,1.20],[-0.03,1.11],[-0.09,1.07],[-0.16,0.99],[-0.22,0.86],[-0.25,0.68],[-0.24,0.50]];
  const sh=new THREE.Shape();sh.moveTo(P[0][0],P[0][1]);for(let k=1;k<P.length;k++)sh.lineTo(P[k][0],P[k][1]);sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:0.2,bevelEnabled:true,bevelThickness:0.035,bevelSize:0.03,bevelSegments:4,curveSegments:6});
  g.translate(0,0,-0.1);g.rotateY(-Math.PI/2);g.computeVertexNormals();
  return _pieceGeoCache.nh=g;
}
// ---------- piece color themes (player-selectable, saved like other progress) ----------
const PIECE_THEMES=[
  {id:'silver', label:'은색 · 검정',   w:{color:'#e3e7ed',finish:'metal',name:'은색'},  b:{color:'#3a3b40',finish:'lacquer',name:'검은색'}},
  {id:'gold',   label:'금색 · 검정',   w:{color:'#d9b04a',finish:'metal',name:'금색'},  b:{color:'#3a3b40',finish:'lacquer',name:'검은색'}},
  {id:'ivory',  label:'상아 · 흑단',   w:{color:'#efe3c8',finish:'lacquer',name:'상아색'},b:{color:'#2b1a10',finish:'lacquer',name:'흑단색'}},
  {id:'redblue',label:'빨강 · 파랑',   w:{color:'#d0352b',finish:'lacquer',name:'빨강'},  b:{color:'#1f4fb8',finish:'lacquer',name:'파랑'}},
  {id:'jade',   label:'옥 · 자수정',   w:{color:'#62cfa3',finish:'glass',name:'옥색'},   b:{color:'#5a2b8c',finish:'glass',name:'보라'}},
  {id:'goldsil',label:'금색 · 은색',   w:{color:'#dcb24c',finish:'metal',name:'금색'},  b:{color:'#7f8894',finish:'metal',name:'은색'}}
];
let pieceTheme=JSON.parse(JSON.stringify(PIECE_THEMES[0]));
// rough Korean color name for custom picks (used in "○○ 차례" etc.)
function colorNameKo(hex){
  const c=new THREE.Color(hex),hsl={};c.getHSL(hsl);
  if(hsl.l<0.14)return '검은색'; if(hsl.l>0.9)return '흰색'; if(hsl.s<0.12)return hsl.l>0.55?'은색':'회색';
  const h=hsl.h*360;
  return h<15||h>=340?'빨강':h<40?'주황':h<65?'노랑':h<160?'초록':h<195?'청록':h<255?'파랑':h<290?'보라':'분홍';
}
function sideName(c){return pieceTheme[c].name||colorNameKo(pieceTheme[c].color);}
// Korean particle after a name: 이/가, 으로/로
function josa(word,a,b){const ch=word.charCodeAt(word.length-1)-0xAC00;return word+(ch>=0&&ch<11172&&ch%28!==0?a:b);}
function pieceMaterial(col){
  const t=pieceTheme[col],c=new THREE.Color(t.color).convertSRGBToLinear(),hsl={};new THREE.Color(t.color).getHSL(hsl);   // picker colors are sRGB
  if(t.finish==='metal')return new THREE.MeshPhysicalMaterial({color:c,metalness:1,roughness:0.24,clearcoat:0.4,clearcoatRoughness:0.15,envMapIntensity:1.05});
  if(t.finish==='glass')return new THREE.MeshPhysicalMaterial({color:c,metalness:0,roughness:0.06,clearcoat:1,clearcoatRoughness:0.03,envMapIntensity:1.1,transparent:true,opacity:0.86});
  // lacquer: dark colors reflect less so they stay deep instead of turning grey
  return new THREE.MeshPhysicalMaterial({color:c,metalness:0.1,roughness:0.36,clearcoat:0.8,clearcoatRoughness:0.08,envMapIntensity:0.4+hsl.l*0.6});
}
function accentColor(col){return new THREE.Color(pieceTheme[col].color).convertSRGBToLinear().multiplyScalar(0.42);}
function applyPieceTheme(save){
  if(pieceGroup&&board)buildPieces();
  _chInvalidate(2);
  const caps=document.querySelectorAll('#chessMount .cap-label');
  if(caps[0])caps[0].textContent=josa(sideName('w'),'이','가')+' 잡음';
  if(caps[1])caps[1].textContent=josa(sideName('b'),'이','가')+' 잡음';
  const cpuCard=[...document.querySelectorAll('#chessMount .card small')].find(e=>/컴퓨터와 대결/.test(e.textContent));
  if(cpuCard)cpuCard.textContent=josa(sideName('w'),'으로','로')+' 컴퓨터와 대결';
  try{updateHUD();}catch(e){}
  if(save)Store.set('chess_theme',pieceTheme);
  renderThemePanel();
}
function themeBox(){
  let el=document.getElementById('themeBox');if(el)return el;
  el=document.createElement('div');el.id='themeBox';el.className='themebox';
  el.addEventListener('pointerdown',e=>e.stopPropagation());
  document.getElementById('app').appendChild(el);return el;
}
// ---------- board color themes ----------
const BOARD_THEMES=[
  {id:'walnut', label:'크림 · 월넛',     light:'#ece2cc',dark:'#8a6644',pattern:'marble'},
  {id:'tourney',label:'대회용 초록',     light:'#eeeed2',dark:'#769656',pattern:'solid'},
  {id:'wood',   label:'메이플 원목',     light:'#e3c48f',dark:'#8a5530',pattern:'wood'},
  {id:'blue',   label:'블루 그레이',     light:'#e2e8ef',dark:'#5f7891',pattern:'marble'},
  {id:'mono',   label:'흑백 대리석',     light:'#e8e5df',dark:'#45484f',pattern:'marble'},
  {id:'coral',  label:'코랄 · 크림',     light:'#f4e7d7',dark:'#c27a5d',pattern:'solid'}
];
let boardTheme=JSON.parse(JSON.stringify(BOARD_THEMES[0]));
// a hex color nudged lighter (k>0) or darker (k<0), as rgba text for canvas painting
function tone(hex,k,a){const c=new THREE.Color(hex);const f=k>0?(v=>v+(1-v)*k):(v=>v*(1+k));
  return 'rgba('+Math.round(f(c.r)*255)+','+Math.round(f(c.g)*255)+','+Math.round(f(c.b)*255)+','+(a===undefined?1:a)+')';}
function boardTextures(){
  const t=boardTheme;
  const make=(hex)=>{
    if(t.pattern==='marble'){const L=new THREE.Color(hex).getHSL({}).l;return makeMarbleTexture(hex,tone(hex,-0.12),tone(hex,L>0.5?-0.16:0.18));}
    let cv;
    if(t.pattern==='wood')cv=makeWoodTexture(512,512,hex,tone(hex,-0.3),tone(hex,0.18));
    else{cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');x.fillStyle=hex;x.fillRect(0,0,256,256);
      for(let i=0;i<1500;i++){x.fillStyle=Math.random()>0.5?'rgba(0,0,0,0.04)':'rgba(255,255,255,0.05)';x.fillRect(Math.random()*256,Math.random()*256,2,2);}}
    const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=_ANISO;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;return tex;
  };
  return [make(t.light),make(t.dark)];
}
// less studio reflection on flat colors so the chosen hue shows true
// flat colors and wood get a little less light so they don't wash out under the lamp
function boardTint(){return boardTheme.pattern==='solid'?0xb0b0b0:boardTheme.pattern==='wood'?0xdddddd:0xffffff;}
function boardEnv(){return boardTheme.pattern==='solid'?.22:boardTheme.pattern==='wood'?.45:.6;}
// each square shows its own patch of the shared texture
function squareTex(src){const t=src.clone();t.needsUpdate=true;t.repeat.set(0.45,0.45);t.offset.set(Math.random()*0.55,Math.random()*0.55);return t;}
function applyBoardTheme(save){
  _chInvalidate(2);
  if(boardGroup){
    const [lt,dt]=boardTextures();
    boardGroup.children.forEach(m=>{if(!m.userData||m.userData.r===undefined)return;
      const old=m.material.map;m.material.map=squareTex((m.userData.r+m.userData.c)%2?dt:lt);
      m.material.roughness=boardTheme.pattern==='solid'?.6:.22;m.material.envMapIntensity=boardEnv();m.material.color.setHex(boardTint());m.userData.base=boardTint();m.material.needsUpdate=true;if(old)old.dispose();});
    try{refreshHighlights();}catch(e){}
  }
  if(save)Store.set('chess_board',boardTheme);
  renderThemePanel();
}
function renderThemePanel(){
  const el=document.getElementById('themeBox');if(!el||!el.classList.contains('show'))return;
  const sw=c=>'<i style="background:'+c+'"></i>';
  const sq=t=>'<i class="sqi" style="background:linear-gradient(135deg,'+t.light+' 50%,'+t.dark+' 50%)"></i>';
  el.innerHTML='<h3>🎨 색상 바꾸기</h3>'+
    '<div class="tsec">말 색</div><div class="tgrid tpiece">'+PIECE_THEMES.map(t=>
    '<button data-id="'+t.id+'" class="'+(pieceTheme.id===t.id?'on':'')+'">'+sw(t.w.color)+sw(t.b.color)+'<span>'+t.label+'</span></button>').join('')+'</div>'+
    '<div class="tcustom tpiece"><b>말 직접 고르기</b>'+
    ['w','b'].map(c=>'<label>'+(c==='w'?'선공(나)':'후공(상대)')+' <input type="color" data-side="'+c+'" value="'+pieceTheme[c].color+'">'+
      '<select data-fin="'+c+'">'+[['metal','금속'],['lacquer','광택'],['glass','유리']].map(([v,n])=>'<option value="'+v+'"'+(pieceTheme[c].finish===v?' selected':'')+'>'+n+'</option>').join('')+'</select></label>').join('')+'</div>'+
    '<div class="tsec">체스판 색</div><div class="tgrid tboard">'+BOARD_THEMES.map(t=>
    '<button data-id="'+t.id+'" class="'+(boardTheme.id===t.id?'on':'')+'">'+sq(t)+'<span>'+t.label+'</span></button>').join('')+'</div>'+
    '<div class="tcustom tboard"><b>체스판 직접 고르기</b>'+
    '<label>밝은 칸 <input type="color" data-sq="light" value="'+boardTheme.light+'"></label>'+
    '<label>어두운 칸 <input type="color" data-sq="dark" value="'+boardTheme.dark+'"></label>'+
    '<label>표면 <select data-pat="1">'+[['marble','대리석'],['wood','원목'],['solid','단색']].map(([v,n])=>'<option value="'+v+'"'+(boardTheme.pattern===v?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
    '</div><button class="tclose">닫기</button>';
  const copyP=()=>{pieceTheme=JSON.parse(JSON.stringify(pieceTheme));pieceTheme.id='custom';};
  const copyB=()=>{boardTheme=JSON.parse(JSON.stringify(boardTheme));boardTheme.id='custom';};
  el.querySelectorAll('.tgrid.tpiece button').forEach(b=>b.onclick=()=>{pieceTheme=JSON.parse(JSON.stringify(PIECE_THEMES.find(t=>t.id===b.dataset.id)));applyPieceTheme(true);});
  el.querySelectorAll('.tcustom.tpiece input[type=color]').forEach(inp=>{
    inp.oninput=()=>{copyP();pieceTheme[inp.dataset.side].color=inp.value;pieceTheme[inp.dataset.side].name='';if(pieceGroup&&board)buildPieces();};
    inp.onchange=()=>applyPieceTheme(true);});
  el.querySelectorAll('.tcustom.tpiece select').forEach(sel=>sel.onchange=()=>{copyP();pieceTheme[sel.dataset.fin].finish=sel.value;applyPieceTheme(true);});
  el.querySelectorAll('.tgrid.tboard button').forEach(b=>b.onclick=()=>{boardTheme=JSON.parse(JSON.stringify(BOARD_THEMES.find(t=>t.id===b.dataset.id)));applyBoardTheme(true);});
  el.querySelectorAll('.tcustom.tboard input[type=color]').forEach(inp=>inp.onchange=()=>{copyB();boardTheme[inp.dataset.sq]=inp.value;applyBoardTheme(true);});
  el.querySelectorAll('.tcustom.tboard select').forEach(sel=>sel.onchange=()=>{copyB();boardTheme.pattern=sel.value;applyBoardTheme(true);});
  el.querySelector('.tclose').onclick=()=>el.classList.remove('show');
}
document.getElementById('themeBtn').onclick=()=>{const el=themeBox();el.classList.toggle('show');renderThemePanel();};
Store.get('chess_theme').then(t=>{if(t&&t.w&&t.b){pieceTheme=t;applyPieceTheme(false);}}).catch(()=>{});
Store.get('chess_board').then(t=>{if(t&&t.light&&t.dark){boardTheme=t;applyBoardTheme(false);}}).catch(()=>{});
function makePieceMesh(type,col){
  const g=new THREE.Group();
  const white=col==="w", fin=pieceTheme[col].finish;
  const mat=pieceMaterial(col);   // color and finish come from the chosen piece theme
  const add=(geo,y)=>{const m=new THREE.Mesh(geo,mat);m.position.y=y||0;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
  add(pieceLathe(type));
  // felt pad under every piece
  const felt=new THREE.Mesh(new THREE.CylinderGeometry(0.39,0.39,0.012,32),new THREE.MeshStandardMaterial({color:0x1f4d2e,roughness:1}));
  felt.position.y=0.006;g.add(felt);
  if(type==="p"){
    add(new THREE.SphereGeometry(0.165,32,24),0.75);
  } else if(type==="r"){
    for(let i=0;i<6;i++){const a=i*Math.PI/3;const b=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.11,0.1),mat);
      b.position.set(Math.cos(a)*0.225,0.97,Math.sin(a)*0.225);b.rotation.y=-a;b.castShadow=true;g.add(b);}
  } else if(type==="n"){
    const head=add(knightHeadGeo());head.rotation.y=-1.15;   // profile faces the player's view
    // eyes and mane groove in a contrasting finish
    const acc=new THREE.MeshStandardMaterial({color:accentColor(col),roughness:.5,metalness:fin==='metal'?.8:.2});
    [-1,1].forEach(sd=>{const e=new THREE.Mesh(new THREE.SphereGeometry(0.028,12,10),acc);e.position.set(sd*0.13,0.92,0.12);head.add(e);e.position.y-=0;});
  } else if(type==="b"){
    add(new THREE.SphereGeometry(0.05,16,12),1.35);
    const slit=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.42,0.4),
      new THREE.MeshStandardMaterial({color:accentColor(col),roughness:.6,metalness:fin==='metal'?.7:0}));
    slit.position.y=1.12;slit.rotation.z=0.55;g.add(slit);
  } else if(type==="q"){
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const sp=new THREE.Mesh(new THREE.SphereGeometry(0.05,14,10),mat);
      sp.position.set(Math.cos(a)*0.23,1.23,Math.sin(a)*0.23);sp.castShadow=true;g.add(sp);}
    add(new THREE.SphereGeometry(0.085,20,16),1.25);
  } else if(type==="k"){
    add(new THREE.BoxGeometry(0.075,0.3,0.075),1.42);
    add(new THREE.BoxGeometry(0.22,0.075,0.075),1.45);
  }
  g.scale.set(0.92,0.92,0.92);
  return g;
}

function buildPieces(){
  if(!pieceGroup||!board)return;                 // 3D 정리 후(메뉴 화면)에는 만들 것이 없다
  // clear
  while(pieceGroup.children.length){const c0=pieceGroup.children[0];pieceGroup.remove(c0);disposeObj3D(c0);}
  for(const k in pieceMeshes)delete pieceMeshes[k];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const p=board[r][c];if(!p)continue;
    const m=makePieceMesh(p.t,p.c);
    const {x,z}=toXZ(r,c);m.position.set(x,0,z);
    if(p.c==="b")m.rotation.y=Math.PI;
    m.userData={r,c};pieceGroup.add(m);pieceMeshes[r+","+c]=m;
  }
}
function syncPieces(){buildPieces();} // simplest: rebuild
// v1: the piece that just moved lifts, arcs over the board and settles with a squash + dust ring
let _v1LastMove=null,_v1Sel=null;
{const _bp=buildPieces;buildPieces=function(){_bp();try{
  if(lastMove&&lastMove!==_v1LastMove&&activeAnims&&effectGroup){
    const [r0,c0,r1,c1]=lastMove;const m=pieceMeshes[r1+","+c1];
    if(m){const a=toXZ(r0,c0),b=toXZ(r1,c1);const d=Math.hypot(b.x-a.x,b.z-a.z);const H=0.35+Math.min(1.1,d*0.18);
      const sx=m.scale.x,sy=m.scale.y,sz=m.scale.z;let landed=false;
      m.position.set(a.x,0,a.z);
      activeAnims.push({t:0,dur:0.42,update(dt,tt){const p=Math.min(1,tt/this.dur);const e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
        m.position.set(a.x+(b.x-a.x)*e,Math.sin(Math.PI*e)*H,a.z+(b.z-a.z)*e);
        const q=p>.8?Math.sin((p-.8)/.2*Math.PI)*0.16:0;m.scale.set(sx*(1+q*.5),sy*(1-q),sz*(1+q*.5));
        if(!landed&&p>.85){landed=true;
          const fm=new THREE.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false});
          const ring=new THREE.Mesh(new THREE.RingGeometry(0.3,0.42,32),fm);ring.rotation.x=-Math.PI/2;ring.position.set(b.x,0.05,b.z);effectGroup.add(ring);
          activeAnims.push({t:0,dur:0.45,update(dt2,t2){const k=Math.min(1,t2/this.dur);const s2=1+k*1.6;ring.scale.set(s2,s2,s2);fm.opacity=.6*(1-k);
            if(k>=1){effectGroup.remove(ring);disposeObj3D(ring);return true;}return false;}});}
        if(p>=1){m.position.set(b.x,0,b.z);m.scale.set(sx,sy,sz);return true;}return false;}});}
  }}catch(e){}_v1LastMove=lastMove;};}


// ---------- capture impact effect (fighting-game style hit) ----------
function cameraPunch(dur){ punchT=Math.max(punchT,dur); }
function triggerCaptureImpact(fr,fc,tr,tc,capType,capCol){
  if(!effectGroup)return;
  _chShake=Math.max(_chShake,0.16);
  const from=toXZ(fr,fc), to=toXZ(tr,tc);
  const dx=to.x-from.x, dz=to.z-from.z;
  const dist=Math.hypot(dx,dz)||1;
  const dirX=dx/dist, dirZ=dz/dist; // attack direction, used to knock the captured piece further outward

  // 1) knockback: a temporary copy of the captured piece flies off, spins, and fades
  const ghost=makePieceMesh(capType,capCol);
  if(capCol==="b")ghost.rotation.y=Math.PI;
  ghost.position.set(to.x,0,to.z);
  ghost.traverse(o=>{ if(o.material){ o.material=o.material.clone(); o.material.transparent=true; } });
  effectGroup.add(ghost);
  const knockDist=1.6+Math.random()*0.5, knockAng=Math.atan2(dirZ,dirX)+(Math.random()*0.6-0.3);
  const kx=Math.cos(knockAng)*knockDist, kz=Math.sin(knockAng)*knockDist;
  const spinAxis=Math.random()>0.5?1:-1;
  const startPos=ghost.position.clone();
  activeAnims.push({t:0,dur:0.62,update(dt,tt){
    const p=Math.min(1,tt/this.dur);
    const arc=Math.sin(p*Math.PI)*1.1; // rise then fall
    ghost.position.set(startPos.x+kx*p, arc, startPos.z+kz*p);
    ghost.rotation.z=spinAxis*p*4.2;
    ghost.rotation.x=spinAxis*p*2.1;
    ghost.traverse(o=>{if(o.material)o.material.opacity=Math.max(0,1-p*1.15);});
    if(p>=1){effectGroup.remove(ghost);disposeObj3D(ghost);return true;}
    return false;
  }});

  // 2) impact flash: an expanding, fading ring right at the capture square
  const flashMat=new THREE.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:0.95,side:THREE.DoubleSide});
  const flash=new THREE.Mesh(new THREE.RingGeometry(0.05,0.14,28),flashMat);
  flash.rotation.x=-Math.PI/2;flash.position.set(to.x,0.06,to.z);effectGroup.add(flash);
  activeAnims.push({t:0,dur:0.32,update(dt,tt){
    const p=Math.min(1,tt/this.dur);
    const s=1+p*7;flash.scale.set(s,s,s);
    flashMat.opacity=0.95*(1-p);
    if(p>=1){effectGroup.remove(flash);disposeObj3D(flash);return true;}
    return false;
  }});

  // 3) debris shards: small angular fragments in the attacker's color, scattering outward
  const shardCol=capCol==="w"?0xd8dde2:0x3a322a;
  for(let i=0;i<7;i++){
    const shard=new THREE.Mesh(new THREE.TetrahedronGeometry(0.05+Math.random()*0.04),
      new THREE.MeshStandardMaterial({color:shardCol,roughness:.5,transparent:true}));
    shard.position.set(to.x,0.15,to.z);effectGroup.add(shard);
    const ang=Math.random()*Math.PI*2, spd=0.9+Math.random()*1.0;
    const sx=Math.cos(ang)*spd, sz=Math.sin(ang)*spd, sy=1.6+Math.random()*1.0;
    const rot=(Math.random()*2-1)*8;
    activeAnims.push({t:0,dur:0.5+Math.random()*0.2,update(dt,tt){
      const p=Math.min(1,tt/this.dur);
      shard.position.set(to.x+sx*p, 0.15+sy*p-4.2*p*p, to.z+sz*p);
      shard.rotation.x=rot*p;shard.rotation.y=rot*p*0.7;
      shard.material.opacity=Math.max(0,1-p);
      if(p>=1||shard.position.y<-0.3){effectGroup.remove(shard);disposeObj3D(shard);return true;}
      return false;
    }});
  }

  // 4) a tiny camera punch-in for extra weight
  cameraPunch(0.22);
  Sound.capture&&Sound.capture();
}
function updateEffects(dt){
  if(!activeAnims.length && punchT<=0)return;
  for(let i=activeAnims.length-1;i>=0;i--){
    const a=activeAnims[i];a.t+=dt;
    if(a.update(dt,a.t))activeAnims.splice(i,1);
  }
  if(punchT>0)punchT=Math.max(0,punchT-dt);
}

// Build a flat arrow on the board from (r,c) to (rr,cc). color hex, y height.
function makeArrow(r,c,rr,cc,color,y){
  const grp=new THREE.Group();
  const a=toXZ(r,c), b=toXZ(rr,cc);
  const dx=b.x-a.x, dz=b.z-a.z;
  const len=Math.hypot(dx,dz);
  const headLen=0.32, shaftLen=Math.max(0.02,len-headLen), hw=0.065;
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.9,side:THREE.DoubleSide,depthWrite:false});
  // Geometry built in the XZ plane, pointing along +X, starting at origin.
  // shaft as two triangles (a thin quad)
  const sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.Float32BufferAttribute([
    0,0,-hw,  shaftLen,0,-hw,  shaftLen,0,hw,
    0,0,-hw,  shaftLen,0,hw,   0,0,hw
  ],3));
  grp.add(new THREE.Mesh(sg,mat));
  // arrowhead triangle
  const hg=new THREE.BufferGeometry();
  hg.setAttribute('position',new THREE.Float32BufferAttribute([
    shaftLen,0,-0.2,  shaftLen+headLen,0,0,  shaftLen,0,0.2
  ],3));
  grp.add(new THREE.Mesh(hg,mat));
  grp.position.set(a.x,y,a.z);
  grp.rotation.y=-Math.atan2(dz,dx); // aim in board plane (rotate about world up)
  grp.userData.pulse=true;grp.userData.baseOpacity=0.9;
  return grp;
}
// glowing disc marker on a square
function makeGlow(r,c,color){
  const {x,z}=toXZ(r,c);
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.34,0.46,28),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.7,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.position.set(x,0.015,z);
  ring.userData.pulse=true;ring.userData.baseOpacity=0.7;
  return ring;
}

function refreshHighlights(){
  if(!highlightGroup||!boardGroup)return;        // 3D 정리 후(메뉴 화면)에는 그릴 보드가 없다
  _chInvalidate(2);
  while(highlightGroup.children.length){const c0=highlightGroup.children[0];highlightGroup.remove(c0);disposeObj3D(c0);}
  // reset square colors
  boardGroup.children.forEach(m=>{if(m.userData&&m.userData.base!==undefined)m.material.color.setHex(m.userData.base);});
  // last move: tint both squares + soft markers + an arrow trail
  if(lastMove){
    [[lastMove[0],lastMove[1]],[lastMove[2],lastMove[3]]].forEach(([r,c])=>{
      const sq=squareMesh(r,c);if(sq)sq.material.color.setHex(0x5f7bbf);
    });
    highlightGroup.add(makeGlow(lastMove[0],lastMove[1],0x9db8ff));
    highlightGroup.add(makeGlow(lastMove[2],lastMove[3],0x9db8ff));
    highlightGroup.add(makeArrow(lastMove[0],lastMove[1],lastMove[2],lastMove[3],0x7f9bff,0.05));
  }
  // hint: bright green arrow drawn directly on the board
  if(hintSquares){
    highlightGroup.add(makeGlow(hintSquares[0],hintSquares[1],0x6cf07a));
    highlightGroup.add(makeArrow(hintSquares[0],hintSquares[1],hintSquares[2],hintSquares[3],0x39d94f,0.08));
  }
  if(badSquares){
    highlightGroup.add(makeGlow(badSquares[0],badSquares[1],0xff6a5a));
    highlightGroup.add(makeArrow(badSquares[0],badSquares[1],badSquares[2],badSquares[3],0xe23b3b,0.07));
  }
  if(sel){
    const sq=squareMesh(sel[0],sel[1]);if(sq)sq.material.color.setHex(0xe6c15c);
    legal.forEach(([r,c])=>{
      const cap=board[r][c];
      const {x,z}=toXZ(r,c);
      // vivid markers that ignore tone mapping, with a white outline so they read on any square
      const ring=new THREE.Mesh(
        cap?new THREE.TorusGeometry(0.36,0.07,12,32):new THREE.CircleGeometry(0.17,24),
        new THREE.MeshBasicMaterial({color:cap?0xff3b2f:0x18b84a,toneMapped:false})
      );
      ring.position.set(x,0.025,z);ring.rotation.x=-Math.PI/2;
      highlightGroup.add(ring);
      const edge=new THREE.Mesh(
        cap?new THREE.TorusGeometry(0.36,0.1,12,32):new THREE.CircleGeometry(0.215,24),
        new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false,transparent:true,opacity:.85})
      );
      edge.position.set(x,0.02,z);edge.rotation.x=-Math.PI/2;
      highlightGroup.add(edge);
    });
  }
  if(!gameOver&&inCheck(board,turn)){
    const k=findKing(board,turn);if(k){const sq=squareMesh(k[0],k[1]);if(sq)sq.material.color.setHex(0xb5423a);}
  }
}
function squareMesh(r,c){return boardGroup.children.find(m=>m.userData&&m.userData.r===r&&m.userData.c===c);}

// ---------- interaction ----------
function vsCPU(){return mode==="cpu"||mode==="arcade"||mode==="puzzle";}
function pickAt(clientX,clientY){
  if(gameOver||promoPending)return;
  if(mode==="training"&&turn!=="w")return; // black's replies are scripted, not clickable
  if(vsCPU()&&turn==="b")return; // CPU's turn
  if(review)return;
  if(mode==="mail"&&(turn!==mail.color||mail.locked)){showMsg(mail.locked?"친구에게 수를 보내 주세요":"친구 차례예요");setTimeout(()=>{if(!gameOver)hideMsg();},1400);return;}
  const rect=renderer.domElement.getBoundingClientRect();
  mouse.x=((clientX-rect.left)/rect.width)*2-1;
  mouse.y=-((clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const hits=raycaster.intersectObjects([...pieceGroup.children,...boardGroup.children],true);
  if(!hits.length)return;
  // scan hits nearest-first; skip non-interactive board dressing (base slab, trim frame)
  // that has no r/c so a click never gets silently swallowed by decorative geometry.
  for(const hit of hits){
    let obj=hit.object;
    while(obj&&obj.userData&&obj.userData.r===undefined&&obj.parent)obj=obj.parent;
    const ud=obj&&obj.userData;
    if(ud&&ud.r!==undefined){ handleSquare(ud.r,ud.c); return; }
  }
}
function handleSquare(r,c){
  const p=board[r][c];
  if(sel){
    if(legal.some(m=>m[0]===r&&m[1]===c)){
      if(mode==="training"){ trainAttempt(sel[0],sel[1],r,c); return; }
      doMove(sel[0],sel[1],r,c);return;
    }
  }
  if(p){
    showInfo(p);
    if(p.c===turn){sel=[r,c];legal=legalMoves(board,r,c);Sound.select();hintSquares=null;}
    else{sel=[r,c];legal=[];}
    refreshHighlights();
  } else {sel=null;legal=[];refreshHighlights();}
}
function showInfo(p){
  document.getElementById("pName").textContent=KOR[p.t].name+" · "+KOR[p.t].ko;
  document.getElementById("pGlyph").textContent=KOR[p.t].g;
  document.getElementById("pRule").textContent=KOR[p.t].rule;
}

function doMove(r,c,rr,cc,promoChoice){
  const p=board[r][c];
  hintSquares=null;
  // if promotion needed and no choice yet, and it's a human deciding → prompt
  const isPromo = p.t==="p"&&(rr===0||rr===7);
  if(isPromo && !promoChoice && (!vsCPU()||p.c==="w")){
    promoPending={r,c,rr,cc,col:p.c};
    openPromo(p.c);
    sel=null;legal=[];refreshHighlights();return;
  }
  const targetPiece = board[rr][cc]; // piece being captured (null for ep/non-capture)
  pushHistory();mlog.push((r*8+c)|((rr*8+cc)<<6)|((isPromo?({n:2,q:5,r:4,b:3})[promoChoice||"q"]:0)<<12));
  const info=makeMove(board,r,c,rr,cc,promoChoice||"q");
  // track captured piece (identify what was on target, or ep pawn)
  if(info.capture){
    const capType = info.ep ? "p" : (targetPiece?targetPiece.t:"p");
    const capCol = targetPiece?targetPiece.c:(p.c==="w"?"b":"w");
    captured[p.c].push(capType);
    // en passant captures a pawn sitting beside the mover (same row as origin, same file as destination),
    // not on the destination square itself — use that square for the knockback visual.
    const capSqR = info.ep ? r : rr, capSqC = cc;
    if(!replaying)triggerCaptureImpact(r,c,capSqR,capSqC,capType,capCol);
  } else {
    if(!replaying)Sound.move();
  }
  lastMove=[r,c,rr,cc];
  if(p.t==="p"||info.capture)halfmoveClock=0;else halfmoveClock++;
  // notation
  moveLog.push(notation(p,r,c,rr,cc,info));
  moveNumber++;
  finishMove();
}
function notation(p,r,c,rr,cc,info){
  if(info.castle==="K")return "O-O";
  if(info.castle==="Q")return "O-O-O";
  const pieceLetter = p.t==="p" ? "" : p.t.toUpperCase();
  const cap = info.capture ? "x" : "";
  const from = p.t==="p"&&info.capture ? FILES[c] : "";
  let s = pieceLetter + from + cap + sqName(rr,cc);
  if(info.promo)s += "="+info.promo.toUpperCase();
  return s;
}
function finishMove(){
  sel=null;legal=[];turn=turn==="w"?"b":"w";
  if(replaying){checkEnd();return;}
  syncPieces();refreshHighlights();updateHUD();renderSidePanels();checkEnd();
  try{window.Resume&&Resume.touch();}catch(e){}
  if(!gameOver&&mode==="puzzle"&&turn==="b"&&whiteMoves()>=puzzle.limit){gameOver=true;endPuzzle(false,"limit");return;}
  if(!gameOver&&mode==="mail"){mail.locked=true;updateHUD();try{mail.hook&&mail.hook({moves:mlog.slice(),over:false});}catch(e){}return;}
  if(!gameOver&&vsCPU()&&turn==="b"){setTimeout(cpuMove,mode==="puzzle"?500:420);}
}
function whiteMoves(){return Math.ceil(mlog.length/2);}
function endPuzzle(solved,why){
  const n=whiteMoves();
  if(solved){showMsg("체크메이트! "+n+"수 만에 잡았어요 🎉");Sound.win();}
  else{showMsg(why==="limit"?puzzle.limit+"수 안에 메이트하지 못했어요":"아쉬워요… 다시 도전!");Sound.lose();}
  const cb=puzzle&&puzzle.onEnd;if(cb)setTimeout(()=>cb({solved,moves:n}),solved?900:700);
}
function mailOver(result){ // result: true win / false loss / null draw (for this device's colour)
  if(mode!=="mail"||replaying)return;
  emit({result:result===true?"win":result===false?"lose":"draw"});
  try{mail.hook&&mail.hook({moves:mlog.slice(),over:true,won:result});}catch(e){}
}
// ---------- Training mode: validate each human move against the scripted solution ----------
function trainAttempt(r,c,rr,cc){
  const expected=trainPuzzle.solution[trainStep];
  const isCorrect = expected[0]===r&&expected[1]===c&&expected[2]===rr&&expected[3]===cc;
  if(!isCorrect){
    sel=null;legal=[];refreshHighlights();
    showMsg("❌ 다른 수를 찾아보세요");
    Sound.capture ? Sound.move() : null;
    setTimeout(()=>{ if(mode==="training"&&!gameOver) showMsg("🎓 "+trainPuzzle.title+" — 정답 수를 찾아보세요"); },1200);
    return;
  }
  // correct: play it for real
  const p=board[r][c];
  const targetPiece=board[rr][cc];
  pushHistory();
  const info=makeMove(board,r,c,rr,cc,"q");
  if(info.capture){
    const capType=info.ep?"p":(targetPiece?targetPiece.t:"p");
    const capCol=targetPiece?targetPiece.c:(p.c==="w"?"b":"w");
    captured[p.c].push(capType);
    const capSqR=info.ep?r:rr, capSqC=cc;
    if(!replaying)triggerCaptureImpact(r,c,capSqR,capSqC,capType,capCol);
  } else {
    if(!replaying)Sound.move();
  }
  lastMove=[r,c,rr,cc];
  moveLog.push(notation(p,r,c,rr,cc,info));
  sel=null;legal=[];turn="b";
  trainStep++;
  syncPieces();refreshHighlights();updateHUD();renderSidePanels();

  const solutionDone = trainStep>=trainPuzzle.solution.length;
  if(solutionDone){
    trainFinish(true);
    return;
  }
  // more moves remain — auto-play black's scripted reply, then hand back to the player
  showMsg("✅ 좋은 수예요! 상대의 응수를 확인하세요…");
  setTimeout(()=>{
    if(mode!=="training")return; // player may have left
    const bm=trainPuzzle.solution[trainStep];
    const bp=board[bm[0]][bm[1]];
    if(!bp){trainFinish(false);return;} // safety guard, shouldn't happen with verified puzzles
    const bTarget=board[bm[2]][bm[3]];
    pushHistory();
    const binfo=makeMove(board,bm[0],bm[1],bm[2],bm[3],"q");
    if(binfo.capture){
      const capType=binfo.ep?"p":(bTarget?bTarget.t:"p");
      const capCol=bTarget?bTarget.c:(bp.c==="w"?"b":"w");
      captured[bp.c].push(capType);
      const capSqR=binfo.ep?bm[0]:bm[2], capSqC=bm[3];
      triggerCaptureImpact(bm[0],bm[1],capSqR,capSqC,capType,capCol);
    } else {
      Sound.move();
    }
    lastMove=bm;
    moveLog.push(notation(bp,bm[0],bm[1],bm[2],bm[3],binfo));
    turn="w";
    trainStep++;
    syncPieces();refreshHighlights();updateHUD();renderSidePanels();
    if(trainStep>=trainPuzzle.solution.length){
      // the scripted sequence is complete purely from black's reply (shouldn't normally happen, but guard anyway)
      trainFinish(true);
    } else {
      showMsg("🎓 "+trainPuzzle.title+" — 다음 수를 찾아보세요");
    }
  },650);
}
function trainFinish(success){
  gameOver=true;
  if(success){
    trainCleared[trainPuzzle.id]=true;
    saveTrainingProgress();
    showMsg("🏆 클리어! "+trainPuzzle.desc);
    Sound.win();
  } else {
    showMsg("😅 아쉬워요 — 다시 시도해보세요");
    Sound.draw();
  }
  setTimeout(showTrainEndButtons,700);
}
function showTrainEndButtons(){
  const el=document.getElementById("stageEnd");
  el.innerHTML=""; el.style.display="flex";
  const mk=(txt,fn,cls)=>{const b=document.createElement("button");b.className="btn"+(cls?" "+cls:"");b.textContent=txt;b.onclick=fn;return b;};
  const idx=CHESS_PUZZLES.findIndex(p=>p.id===trainPuzzle.id);
  if(idx>=0&&idx<CHESS_PUZZLES.length-1){
    el.appendChild(mk("다음 트레이닝 ▶",()=>{el.style.display="none";startTrainingPuzzle(CHESS_PUZZLES[idx+1].id);}));
  }
  el.appendChild(mk("다시 도전",()=>{el.style.display="none";startTrainingPuzzle(trainPuzzle.id);},"ghost"));
  el.appendChild(mk("트레이닝 목록",()=>{el.style.display="none";openTrainingSelect();},"ghost"));
}
async function loadTrainingProgress(){
  const p=await Store.get("chess_training_progress");
  if(p)trainCleared=p;
}
function saveTrainingProgress(){ Store.set("chess_training_progress",trainCleared); }
function startTrainingPuzzle(id){
  const puzzle=CHESS_PUZZLES.find(p=>p.id===id);
  if(!puzzle)return;
  whenScene(function(){
  document.getElementById("setup").style.display="none";
  document.getElementById("stageEnd").style.display="none";
  mode="training";
  Sound.resume();
  newTrainingGame(puzzle);});
}
function openTrainingSelect(){
  document.getElementById("setup").style.display="flex";
  document.getElementById("stageEnd").style.display="none";
  document.getElementById("modeCards").style.display="none";
  document.getElementById("diffBox").classList.remove("show");
  document.getElementById("stageBox").classList.remove("show");
  document.getElementById("trainBox").classList.add("show");
  const doneCount=Object.keys(trainCleared).length;
  document.getElementById("trainProgress").textContent="("+doneCount+"/"+CHESS_PUZZLES.length+" 완료)";
  const grid=document.getElementById("trainGrid");grid.innerHTML="";
  CHESS_PUZZLES.forEach(p=>{
    const cell=document.createElement("div");
    const done=!!trainCleared[p.id];
    cell.className="train-cell"+(done?" done":"");
    cell.innerHTML="<div class='tlv'>Lv."+p.level+"</div><div class='ttitle'>"+p.title+"</div><div class='tcat'>"+p.cat+"</div>";
    cell.onclick=()=>startTrainingPuzzle(p.id);
    grid.appendChild(cell);
  });
}
// same position (pieces + side to move) seen how many times? history alternates sides
function posKey(b){let k="";for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];k+=p?(p.c+p.t):"..";}return k;}
function repetitionCount(){const cur=posKey(board);let n=1;
  for(let i=history.length-2;i>=0;i-=2){if(posKey(history[i].board)===cur)n++;}
  return n;}
function insufficientMaterial(b){
  const pieces=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(p&&p.t!=="k")pieces.push(p.t);}
  if(pieces.length===0)return true;                       // K vs K
  if(pieces.length===1&&(pieces[0]==="b"||pieces[0]==="n"))return true; // K+minor vs K
  if(pieces.length===2&&pieces.every(t=>t==="b"))return true;          // K+B vs K+B (same/any bishops)
  return false;
}
function checkEnd(){
  const mv=allMoves(board,turn);
  const check=inCheck(board,turn);
  if(mv.length===0){
    gameOver=true;
    if(check){
      if(moveLog.length)moveLog[moveLog.length-1]+="#";
      const silverWon = (turn==="b"); // side to move can't move → lost
      const winner=sideName(silverWon?"w":"b");
      if(mode==="puzzle"){endPuzzle(silverWon);renderSidePanels();return;}
      if(mode==="mail"){showMsg("체크메이트! "+winner+" 승리 🏆");if(!replaying){(turn!==mail.color)?Sound.win():Sound.lose();}mailOver(turn!==mail.color);renderSidePanels();return;}
      if(mode!=="training")emit({result:mode==="pvp"?"pvp":(silverWon?"win":"lose")});
      if(mode==="arcade"){
        if(silverWon)onStageClear();
        else {showMsg("스테이지 "+currentStage+" 실패… 다시 도전! ✊");Sound.lose();setTimeout(showStageEndButtons,900);}
      } else {
        showMsg("체크메이트! "+winner+" 승리 🏆");
        if(mode==="cpu"){ silverWon?Sound.win():Sound.lose(); } else { Sound.win(); }
      }
    } else {
      showMsg("스테일메이트 — 무승부");
      if(mode==="puzzle"){endPuzzle(false);return;}
      if(mode==="mail"){mailOver(null);}else if(mode!=="training")emit({result:"draw"});
      if(!replaying)Sound.draw();
      if(mode==="arcade")setTimeout(showStageEndButtons,900);
    }
    renderSidePanels();return;
  }
  // draw conditions
  if(insufficientMaterial(board)){gameOver=true;showMsg("기물 부족 — 무승부");if(mode==="puzzle"){endPuzzle(false);return;}if(mode==="mail")mailOver(null);else if(mode!=="training")emit({result:"draw"});if(!replaying)Sound.draw();if(mode==="arcade")setTimeout(showStageEndButtons,900);return;}
  if(repetitionCount()>=3){gameOver=true;showMsg("동형 3회 반복 — 무승부");if(mode==="puzzle"){endPuzzle(false);return;}if(mode==="mail")mailOver(null);else if(mode!=="training")emit({result:"draw"});if(!replaying)Sound.draw();if(mode==="arcade")setTimeout(showStageEndButtons,900);return;}
  if(halfmoveClock>=100){gameOver=true;showMsg("50수 규칙 — 무승부");if(mode==="puzzle"){endPuzzle(false);return;}if(mode==="mail")mailOver(null);else if(mode!=="training")emit({result:"draw"});if(!replaying)Sound.draw();if(mode==="arcade")setTimeout(showStageEndButtons,900);return;}
  if(check){
    if(moveLog.length)moveLog[moveLog.length-1]+="+";
    if(!replaying){showMsg("체크!");Sound.check();setTimeout(()=>{if(!gameOver)hideMsg();},1400);}
    renderSidePanels();
  }
}
function onStageClear(){
  Sound.win();
  if(currentStage>=stageCleared) stageCleared=Math.min(10,currentStage+1);
  // record best (fewest plies)
  const prev=stageBest[currentStage];
  if(prev===undefined||moveNumber<prev)stageBest[currentStage]=moveNumber;
  saveChessProgress();
  if(currentStage===10){
    showMsg("🏆 스테이지 10 클리어! 모든 단계 완료!");
  } else {
    showMsg("스테이지 "+currentStage+" 클리어! ⭐ 다음 단계 해제됨");
  }
  setTimeout(showStageEndButtons,900);
}
function saveChessProgress(){ Store.set('chess_progress',{cleared:stageCleared,best:stageBest}); }
async function loadChessProgress(){
  const p=await Store.get('chess_progress');
  if(p){stageCleared=p.cleared||1;stageBest=p.best||{};}
}
function showStageEndButtons(){
  const el=document.getElementById("stageEnd");
  el.innerHTML="";
  if(currentStage<10){
    const nx=document.createElement("button");nx.className="btn";nx.textContent="다음 스테이지 ▶";
    nx.onclick=()=>{el.style.display="none";startStage(currentStage+1);};
    el.appendChild(nx);
  }
  const rp=document.createElement("button");rp.className="btn ghost";rp.textContent="다시 하기";
  rp.onclick=()=>{el.style.display="none";startStage(currentStage);};
  el.appendChild(rp);
  const mn=document.createElement("button");mn.className="btn ghost";mn.textContent="스테이지 선택";
  mn.onclick=()=>{el.style.display="none";openArcadeSelect();};
  el.appendChild(mn);
  el.style.display="flex";
}

// ---------- CPU (minimax) ----------
function evaluate(b){
  let s=0;
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(p){s+=(p.c==="b"?1:-1)*VAL[p.t];
    // small center bonus
    const center=3.5;s+=(p.c==="b"?1:-1)*(3-(Math.abs(r-center)+Math.abs(c-center)));}}
  return s;
}
function applyMove(b,m){
  const nb=clone(b);const [r,c,rr,cc]=m;
  makeMove(nb,r,c,rr,cc,"q");
  return nb;
}
// Fast pseudo-legal move list (no per-move legality clone) — used only inside search for speed.
function pseudoAll(b,col){
  const res=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(p&&p.c===col)pseudoMoves(b,r,c).forEach(m=>res.push([r,c,m[0],m[1]]));}
  return res;
}
let nodeCount=0;
const NODE_CAP=45000; // safety net so the tab can never hard-freeze
function minimax(b,depth,alpha,beta,maxing){
  if(nodeCount++ > NODE_CAP) return evaluate(b);
  if(depth===0)return evaluate(b);
  const col=maxing?"b":"w";
  const moves=pseudoAll(b,col);
  let any=false, best=maxing?-Infinity:Infinity;
  for(const m of moves){
    const nb=applyMove(b,m);
    // if this move captures the enemy king, it's terminal & winning for the mover
    const capturedKing = b[m[2]][m[3]] && b[m[2]][m[3]].t==="k";
    let v;
    if(capturedKing) v = maxing ? 99999 : -99999;
    else v = minimax(nb,depth-1,alpha,beta,!maxing);
    any=true;
    if(maxing){best=Math.max(best,v);alpha=Math.max(alpha,v);}
    else{best=Math.min(best,v);beta=Math.min(beta,v);}
    if(beta<=alpha)break;
  }
  if(!any) return 0; // no pseudo-moves (extremely rare) → neutral
  return best;
}
async function cpuMove(){
  if(gameOver||!board||turn!=="b"||!vsCPU())return; // guard: state may have changed during delay
  const moves=allMoves(board,"b");
  if(!moves.length){checkEnd();return;}
  const bref=board, n0=moveNumber;
  const res=await ChessAI.run("move",Object.assign(engineInput(board,"b"),cpuConfig()));
  if(board!==bref||moveNumber!==n0||gameOver||turn!=="b"||!vsCPU())return;   // undone / restarted meanwhile
  let best=(res&&!res.error&&res.move>=0)?decodeMove(res.move):null;
  if(!best||!isLegalMove("b",best))best=moves[0].concat(["q"]);   // safety net: never play an illegal move
  const [r,c,rr,cc,promo]=best;const p=board[r][c];
  const targetPiece=board[rr][cc];
  pushHistory();mlog.push((r*8+c)|((rr*8+cc)<<6)|((p.t==="p"&&(rr===0||rr===7)?({n:2,q:5,r:4,b:3})[promo||"q"]:0)<<12));
  const info=makeMove(board,r,c,rr,cc,promo);
  if(info.capture){
    const capType=info.ep?"p":(targetPiece?targetPiece.t:"p");
    captured["b"].push(capType);
    const capSqR=info.ep?r:rr, capSqC=cc;
    triggerCaptureImpact(r,c,capSqR,capSqC,capType,"w");
  } else Sound.move();
  lastMove=[r,c,rr,cc];
  if(p.t==="p"||info.capture)halfmoveClock=0;else halfmoveClock++;
  moveLog.push(notation(p,r,c,rr,cc,info));
  moveNumber++;
  finishMove();
}

// ---------- promotion UI ----------
function openPromo(col){
  const box=document.getElementById("promoOpts");box.innerHTML="";
  ["q","r","b","n"].forEach(t=>{
    const s=document.createElement("span");s.textContent=KOR[t].g;
    s.style.color=col==="w"?"#dfe3e8":"#c9bb9c";
    s.onclick=()=>{
      document.getElementById("promo").classList.remove("show");
      const pp=promoPending;promoPending=null;
      doMove(pp.r,pp.c,pp.rr,pp.cc,t);
    };
    box.appendChild(s);
  });
  document.getElementById("promo").classList.add("show");
}

// ---------- HUD ----------
function updateHUD(){
  const dot=document.getElementById("turnDot");dot.className="dot "+turn;dot.style.background=pieceTheme[turn].color;
  let label=sideName(turn)+" 차례";
  if(mode==="puzzle")label=gameOver?"문제 종료":turn==="w"?"당신("+sideName("w")+") 차례 · "+(puzzle.limit-whiteMoves())+"수 남음":"CPU가 막는 중…";
  else if(mode==="mail")label=gameOver?"대국 종료":turn===mail.color?(mail.locked?"친구에게 수를 보내 주세요":"내 차례 ("+sideName(mail.color)+")"):"친구 차례 — 수를 기다리는 중";
  else if(vsCPU())label=turn==="w"?"당신("+sideName("w")+") 차례":"CPU 생각 중…";
  document.getElementById("turnText").textContent=label;
  document.querySelector(".hud h1").textContent = mode==="arcade" ? ("스테이지 "+currentStage+" / 10") : mode==="puzzle" ? "메이트 문제" : mode==="mail" ? "친구 대국" : "3D 체스";
}
function showMsg(t){const m=document.getElementById("msg");m.textContent=t;m.style.display="inline-block";}
function hideMsg(){document.getElementById("msg").style.display="none";}

function renderSidePanels(){
  // captured pieces + material score
  const gl=t=>KOR[t].g;
  const sum=arr=>arr.reduce((s,t)=>s+VAL[t],0);
  document.getElementById("capByW").textContent=captured.w.map(gl).join("");
  document.getElementById("capByB").textContent=captured.b.map(gl).join("");
  const diff=(sum(captured.w)-sum(captured.b))/100;
  document.getElementById("scoreW").textContent = diff>0? "+"+diff : "";
  document.getElementById("scoreB").textContent = diff<0? "+"+(-diff) : "";
  // move log in pairs
  const ml=document.getElementById("movelog");ml.innerHTML="";
  for(let i=0;i<moveLog.length;i+=2){
    const num=document.createElement("div");num.className="num";num.textContent=(i/2+1)+".";
    const w=document.createElement("div");w.className="mv";w.textContent=moveLog[i]||"";
    const b=document.createElement("div");b.className="mv";b.textContent=moveLog[i+1]||"";
    ml.appendChild(num);ml.appendChild(w);ml.appendChild(b);
  }
  ml.scrollTop=ml.scrollHeight;
}

// ---------- Hint ----------
async function showHint(){
  if(gameOver||promoPending)return;
  if(mode==="training"){
    if(!trainPuzzle||turn!=="w")return;
    const best=trainPuzzle.solution[trainStep];
    if(!best)return;
    hintSquares=best;
    refreshHighlights();
    const p=board[best[0]][best[1]];
    showMsg("💡 정답: "+KOR[p.t].ko+" "+sqName(best[0],best[1])+"→"+sqName(best[2],best[3]));
    setTimeout(()=>{if(!gameOver&&mode==="training")showMsg("🎓 "+trainPuzzle.title+" — 정답 수를 찾아보세요");},2500);
    return;
  }
  if(vsCPU()&&turn==="b")return;
  if(mode==="puzzle"){showMsg("문제에서는 힌트를 쓸 수 없어요");setTimeout(()=>{if(!gameOver)hideMsg();},1400);return;}
  if(!allMoves(board,turn).length)return;
  const bref=board,n0=moveNumber,side=turn;
  showMsg("💡 수를 읽는 중…");
  const res=await ChessAI.run("move",Object.assign(engineInput(board,turn),{maxDepth:64,noise:0,ms:1000}));
  if(board!==bref||moveNumber!==n0||gameOver||turn!==side)return;
  if(!res||res.error||res.move<0){hideMsg();return;}
  const best=decodeMove(res.move);
  hintSquares=best;
  refreshHighlights();
  const p=board[best[0]][best[1]];
  showMsg("💡 추천: "+KOR[p.t].ko+" "+sqName(best[0],best[1])+"→"+sqName(best[2],best[3]));
  setTimeout(()=>{if(!gameOver)hideMsg();},2500);
}

// ---------- orbit controls ----------
const DEFAULT_CAM={theta:0,phi:0.95,rad:12};
let camState;
function zoomBy(delta){if(!camState)return;camState.rad=Math.max(6,Math.min(22,camState.rad+delta));_chInvalidate(2);}
function resetView(){if(!camState)return;camState.theta=DEFAULT_CAM.theta;camState.phi=DEFAULT_CAM.phi;camState.rad=DEFAULT_CAM.rad;_chInvalidate(2);}

function setupOrbit(){
  const el=renderer.domElement;
  el.style.touchAction="none";
  el.addEventListener("contextmenu",e=>e.preventDefault());

  let down=false,moved=false,lastX=0,lastY=0,startX=0,startY=0;
  const DRAG_THRESH=6; // px before a press counts as a rotate, not a click

  el.addEventListener("pointerdown",e=>{
    down=true;moved=false;
    lastX=startX=e.clientX;lastY=startY=e.clientY;
    el.setPointerCapture&&el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove",e=>{
    if(!down)return;
    if(Math.hypot(e.clientX-startX,e.clientY-startY)>DRAG_THRESH)moved=true;
    if(moved && !view2D){
      camState.theta-=(e.clientX-lastX)*0.008;
      camState.phi=Math.max(0.3,Math.min(1.4,camState.phi-(e.clientY-lastY)*0.006));
    }
    lastX=e.clientX;lastY=e.clientY;
  });
  const up=e=>{
    if(down&&!moved)pickAt(e.clientX,e.clientY); // treat as a click/tap on a piece
    down=false;
  };
  el.addEventListener("pointerup",up);
  el.addEventListener("pointercancel",()=>{down=false;});

  el.addEventListener("wheel",e=>{e.preventDefault();zoomBy(e.deltaY*0.01);},{passive:false});

  // two-finger pinch zoom
  let pinch=null;
  el.addEventListener("touchstart",e=>{if(e.touches.length===2){pinch=dist(e);down=false;}},{passive:true});
  el.addEventListener("touchmove",e=>{if(e.touches.length===2&&pinch){const d=dist(e);zoomBy((pinch-d)*0.03);pinch=d;}},{passive:true});
  el.addEventListener("touchend",()=>pinch=null);
  function dist(e){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;return Math.hypot(dx,dy);}

  document.getElementById("zoomIn").onclick=()=>zoomBy(-1.4);
  document.getElementById("zoomOut").onclick=()=>zoomBy(1.4);
  document.getElementById("resetView").onclick=resetView;
  document.getElementById("viewToggle").onclick=toggleView;
}
let view2D=false;
function updateCam(){
  // in 2D mode glide toward a top-down lock; in 3D follow user's orbit values
  const targetPhi = view2D ? 0.38 : camState.phi;   // "2D": nearly overhead, tilted just enough to show each piece's silhouette
  const targetTheta = view2D ? 0 : camState.theta;
  // smooth transition
  camState._phi = camState._phi===undefined?camState.phi:camState._phi + (targetPhi-camState._phi)*0.15;
  camState._theta = camState._theta===undefined?camState.theta:camState._theta + (targetTheta-camState._theta)*0.15;
  const phi=camState._phi, theta=camState._theta, {rad,target}=camState;
  // capture-impact punch: brief inward zoom that eases back out
  const punchAmt = punchT>0 ? Math.sin((punchT/0.22)*Math.PI)*0.35 : 0;
  // narrow (portrait) screens: pull back until the whole board fits the width
  const hf=Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect);
  const fitScale=Math.max(1,(5.7/Math.tan(hf))/DEFAULT_CAM.rad);
  let effRad = rad*fitScale - punchAmt;
  // v1: cinematic intro sweep + celebration orbit + light shake (view only)
  let ph=phi, th=theta;
  if(camera.aspect<1&&!view2D)ph=Math.max(0.3,ph-0.32*Math.min(1,(1-camera.aspect)/0.5));
  const _now=performance.now();
  const _ik=Math.min(1,Math.max(0,(_now-_chIntroT0)/1800)), _ie=1-Math.pow(1-_ik,3);
  if(_ik<1&&!view2D){th+=(1-_ie)*1.3;ph=Math.min(1.35,ph+(1-_ie)*0.42);effRad*=1+(1-_ie)*0.5;}
  const _ct=(_now-_chCelebT0)/1000;
  if(_ct>=0&&_ct<6&&!view2D){const a=Math.min(1,_ct/1.2)*(_ct>4.8?Math.max(0,(6-_ct)/1.2):1);th+=a*Math.sin(_ct*0.5)*0.55;effRad*=1-a*0.1;}
  let tx=target.x,ty=target.y,tz=target.z;
  if(_chShake>0.0005){tx+=(Math.random()-.5)*_chShake;ty+=(Math.random()-.5)*_chShake*.5;tz+=(Math.random()-.5)*_chShake;_chShake*=0.86;}
  camera.position.set(tx+effRad*Math.sin(ph)*Math.sin(th),ty+effRad*Math.cos(ph),tz+effRad*Math.sin(ph)*Math.cos(th));
  camera.up.set(0,1,0);
  camera.lookAt(tx,ty,tz);
  try{const m=(sel&&board[sel[0]][sel[1]]&&board[sel[0]][sel[1]].c===turn)?pieceMeshes[sel[0]+","+sel[1]]:null;
    if(_v1Sel&&_v1Sel!==m&&_v1Sel.parent)_v1Sel.position.y=0;_v1Sel=m||null;
    if(m)m.position.y=0.16+Math.sin(_now*.006)*.04;}catch(e){}
}
function toggleView(){
  view2D=!view2D;
  document.getElementById("viewToggle").textContent = view2D ? "3D 보기" : "2D 보기";
  _chInvalidate(3);
}
// ---------- on-demand rendering state ----------
let _chRaf=0,_chDead=false,_chNeed=0,_chLastSig=-1,_chIdle=0,_chGQ=-1;
function _chInvalidate(n){_chNeed=Math.max(_chNeed,n||2);}
function chessFrameState(){
  const now=performance.now();
  if(activeAnims.length||punchT>0||_chShake>0.0005)return {live:true};
  if(!scene||!camera)return {live:true};
  if(now-_chIntroT0<1800||now-_chCelebT0<6000)return {live:true};
  if(_v1Sel&&_v1Sel.parent)return {live:true};        // 선택한 말이 떠 있는 동안
  let h=2166136261,pulse=false;
  const add=v=>{h^=(Math.round(v*1000)|0);h=Math.imul(h,16777619);};
  const cp=camera.position;add(cp.x);add(cp.y);add(cp.z);
  const groups=[boardGroup,pieceGroup,highlightGroup,effectGroup];
  for(let gi=0;gi<groups.length;gi++){const g=groups[gi];if(!g)continue;add(g.children.length);
    for(let i=0;i<g.children.length;i++){const o=g.children[i];const pl=!!(o.userData&&o.userData.pulse);if(pl)pulse=true;
      add(o.position.x);add(o.position.y);add(o.position.z);add(o.scale.x);add(o.scale.y);add(o.visible?1:0);
      const m=o.material;if(m&&!Array.isArray(m)&&!pl)add(m.opacity===undefined?1:m.opacity);}}
  return {live:false,pulse,sig:h>>>0};
}
function onResize(){if(!camera||!renderer)return;camera.aspect=app.clientWidth/app.clientHeight;camera.updateProjectionMatrix();renderer.setSize(app.clientWidth,app.clientHeight);_chInvalidate(2);}
// ---------- 화면 밖으로 나갈 때: WebGL 컨텍스트·리소스 정리 ----------
// 세로·기울기·로그 등은 JS에 남아 있으니, 3D만 버리고 다시 들어올 때 새로 만들면 된다.
function _isCachedGeo(g){if(!g)return false;for(const k in _pieceGeoCache){if(_pieceGeoCache[k]===g)return true;}return false;}
function _disposeNode(o){
  try{if(o.geometry&&!_isCachedGeo(o.geometry)&&o.geometry.dispose)o.geometry.dispose();}catch(e){}
  if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];
    ms.forEach(m=>{if(!m)return;
      ['map','bumpMap','normalMap','roughnessMap','metalnessMap','emissiveMap','alphaMap','aoMap'].forEach(k=>{const t=m[k];if(t&&t.dispose){try{t.dispose();}catch(e){}}});
      try{m.dispose();}catch(e){}});}
  if(o.children&&o.children.length)o.children.slice().forEach(_disposeNode);
}
function disposeThree(){
  if(!scene&&!renderer)return;
  _chDead=true;_sleepChess();
  try{window.removeEventListener("resize",onResize);}catch(e){}
  try{if(scene)scene.children.slice().forEach(_disposeNode);}catch(e){console.warn("[chess] dispose scene",e);}
  try{if(scene&&scene.environment&&scene.environment.dispose)scene.environment.dispose();}catch(e){}
  try{if(scene&&scene.background&&scene.background.dispose)scene.background.dispose();}catch(e){}
  try{
    if(renderer){
      if(window.GQ&&GQ.renderers)GQ.renderers=GQ.renderers.filter(r=>r!==renderer);
      renderer.dispose();
      if(renderer.forceContextLoss)renderer.forceContextLoss();
      const el=renderer.domElement;
      if(el&&el.parentNode)el.parentNode.removeChild(el);
    }
  }catch(e){console.warn("[chess] dispose renderer",e);}
  scene=null;camera=null;renderer=null;raycaster=null;mouse=null;
  boardGroup=null;pieceGroup=null;highlightGroup=null;effectGroup=null;
  for(const k in pieceMeshes)delete pieceMeshes[k];
  activeAnims.length=0;
  _v1Sel=null;_v1LastMove=null;punchT=0;_chShake=0;_chIntroT0=-1e9;_chCelebT0=-1e9;
  _chNeed=0;_chLastSig=-1;_chIdle=0;_chGQ=-1;animate._last=0;
  _sceneP=null;                 // 다음 진입에서 buildScene()이 새로 만든다
}
function _wakeChess(){if(_chRaf||_chDead||!renderer||!scene||!chessActive)return;_chRaf=requestAnimationFrame(animate);}
function _sleepChess(){if(_chRaf){cancelAnimationFrame(_chRaf);_chRaf=0;}}
function animate(){
  _chRaf=0;
  if(_chDead||!chessActive||!renderer||!scene)return;   // 화면을 떠났거나 정리됐으면 루프도 끝낸다
  _chRaf=requestAnimationFrame(animate);
  const S=(window.BOARD_GFX_STATS=window.BOARD_GFX_STATS||{ticks:0,renders:0,rests:0});S.ticks++;
  const now=performance.now();
  const dt=Math.min(0.05,(now-(animate._last||now))/1000);animate._last=now;
  updateEffects(dt);
  updateCam();
  // pulse hint/last-move markers
  const t=now*0.004;
  const pulse=0.55+0.35*(0.5+0.5*Math.sin(t));
  if(highlightGroup)highlightGroup.children.forEach(o=>{
    if(o.userData&&o.userData.pulse){
      if(o.material){o.material.opacity=(o.userData.baseOpacity||0.8)*pulse;}
      else if(o.children){o.children.forEach(ch=>{if(ch.material)ch.material.opacity=(o.userData.baseOpacity||0.8)*pulse;});}
    }
  });
  // ---- on demand: 움직이는 것이 있을 때만 그린다 ----
  if(window.GQ&&GQ.ver!==_chGQ){_chGQ=GQ.ver;_chInvalidate(2);}      // 화질 변경은 반드시 한 번 더
  const st=chessFrameState();
  let draw=!!st.live||_chNeed>0;
  if(!draw&&st.sig!==_chLastSig)draw=true;                            // 놓친 변화 → 1프레임
  if(!draw&&st.pulse&&(++_chIdle>=8))draw=true;                       // 느린 펄스 표시는 ~8fps로 충분
  if(!draw){S.rests++;return;}
  _chLastSig=st.sig;if(_chNeed>0)_chNeed--;_chIdle=0;S.renders++;
  renderer.render(scene,camera);
}

// ---------- menu wiring ----------
document.querySelectorAll(".card").forEach(card=>{
  card.onclick=()=>{
    const m=card.dataset.mode;
    if(m==="pvp"){whenScene(()=>{mode="pvp";startGame();});}
    else if(m==="arcade"){openArcadeSelect();}
    else if(m==="training"){openTrainingSelect();}
    else{document.getElementById("modeCards").style.display="none";document.getElementById("diffBox").classList.add("show");}
  };
});
document.querySelectorAll("[data-diff]").forEach(b=>{
  b.onclick=()=>whenScene(()=>{mode="cpu";difficulty=parseInt(b.dataset.diff);startGame();});
});
document.getElementById("backBtn").onclick=()=>{
  document.getElementById("diffBox").classList.remove("show");
  document.getElementById("modeCards").style.display="flex";
};
document.getElementById("stageBack").onclick=()=>{
  document.getElementById("stageBox").classList.remove("show");
  document.getElementById("modeCards").style.display="flex";
};
document.getElementById("trainBack").onclick=()=>{
  document.getElementById("trainBox").classList.remove("show");
  document.getElementById("modeCards").style.display="flex";
};

function openArcadeSelect(){
  document.getElementById("setup").style.display="flex";
  document.getElementById("stageEnd").style.display="none";
  document.getElementById("modeCards").style.display="none";
  document.getElementById("diffBox").classList.remove("show");
  document.getElementById("stageBox").classList.add("show");
  document.getElementById("stageProgress").textContent="(최고 "+stageCleared+"단계)";
  const grid=document.getElementById("stageGrid");grid.innerHTML="";
  for(let s=1;s<=10;s++){
    const cell=document.createElement("div");
    const cleared = s<stageCleared;
    cell.className="stage-cell playable"+(cleared?" cleared":"");
    const cfg=stageConfig(s);
    const lvl = cfg.depth===1?"초급":cfg.depth===2?"중급":"고급";
    const rec = stageBest[s]!==undefined ? ("최고 "+Math.ceil(stageBest[s]/2)+"수") : lvl;
    cell.innerHTML = s+"<small>"+rec+"</small>";
    cell.onclick=()=>{document.getElementById("stageBox").classList.remove("show");startStage(s);};
    grid.appendChild(cell);
  }
  hideMsg();
}
function startStage(s){whenScene(function(){if(window.StoryGate&&!window.StoryGate(s,()=>startStage(s)))return;
  mode="arcade";currentStage=s;
  document.getElementById("setup").style.display="none";
  document.getElementById("stageEnd").style.display="none";
  Sound.resume();
  newGame();
  showMsg("스테이지 "+s+" 시작!");
  setTimeout(()=>{if(!gameOver)hideMsg();},1200);
  try{window.Characters&&Characters.onPlay&&Characters.onPlay();}catch(e){}
});}

document.getElementById("menuBtn").onclick=()=>{
  document.getElementById("setup").style.display="flex";
  document.getElementById("modeCards").style.display="flex";
  document.getElementById("diffBox").classList.remove("show");
  document.getElementById("stageBox").classList.remove("show");
  document.getElementById("stageEnd").style.display="none";
  document.querySelector(".hud h1").textContent="3D 체스";
  hideMsg();
  disposeThree();          // 메뉴로 나가면 WebGL 컨텍스트·보드 리소스를 바로 버린다 (다시 시작하면 새로 만든다)
};
document.getElementById("undoBtn").onclick=()=>{
  document.getElementById("stageEnd").style.display="none";
  if(mode==="training"){ if(trainPuzzle)newTrainingGame(trainPuzzle); return; }
  if(promoPending||!history.length||review)return;
  if(mode==="mail"){if(!mail.locked||gameOver)return;restoreHistory(history.pop());mlog.pop();turn=mail.color;mail.locked=false;sel=null;legal=[];
    try{mail.hook&&mail.hook({moves:mlog.slice(),over:false,undo:true});}catch(e){}
    syncPieces();refreshHighlights();updateHUD();renderSidePanels();hideMsg();return;}
  let h,idx;
  if(vsCPU()){do{idx=history.length-1;h=history.pop();mlog.pop();}while(idx%2===1&&history.length);turn=idx%2===0?"w":"b";}
  else{h=history.pop();mlog.pop();turn=turn==="w"?"b":"w";}
  if(h)restoreHistory(h);
  gameOver=false;sel=null;legal=[];hintSquares=null;
  syncPieces();refreshHighlights();updateHUD();renderSidePanels();hideMsg();
  try{window.Resume&&Resume.touch();}catch(e){}
};
document.getElementById("hintBtn").onclick=()=>ChessApp.hint();

function startGame(){
  _chIntroT0=performance.now();
  document.getElementById("setup").style.display="none";
  Sound.resume();
  newGame();
}

// sound toggle + unlock audio on first interaction
document.getElementById("soundToggle").onclick=()=>{
  const on=Sound.toggle();
  document.getElementById("soundToggle").textContent = on ? "🔊" : "🔇";
};
window.addEventListener("pointerdown",()=>Sound.resume(),{once:true});


let _booted=false;
// ---------- 3D 장상 지연 생성 ----------
// three.min.js(589KB)는 모드 화면에서 받지 않는다. 대극을 시작해 보드가 필요해지는 순간 받아 온다.
let _sceneP=null;
function buildScene(){
  if(scene)return;
  initThree();
  // The screen's display:none→visible toggle can leave clientWidth/clientHeight
  // stale for this synchronous tick; re-measure once layout has settled so the
  // renderer isn't locked to a smaller-than-actual resolution (causes blur/aliasing).
  requestAnimationFrame(onResize);
  setTimeout(onResize,120);
}
function whenScene(fn){
  if(scene){fn();return;}
  if(!_sceneP)_sceneP=window.loadThree().then(()=>{_sceneP=null;buildScene();},
    ()=>{_sceneP=null;showMsg("3D 엔진을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요");});
  _sceneP.then(()=>{try{fn();}catch(e){console.error("[chess]",e);}},()=>{});
}
function boot(){ if(_booted)return; _booted=true; loadChessProgress(); loadTrainingProgress(); }
// 페이지를 떠날 때(뒤로가기·홈으로)도 컨텍스트를 반납한다
window.addEventListener("pagehide",function(){try{disposeThree();}catch(e){}});
function hideSetup(){document.getElementById("setup").style.display="none";document.getElementById("stageEnd").style.display="none";}
function openSetup(){document.getElementById("menuBtn").click();}
function start(m,lv){whenScene(function(){mode=m;if(lv)difficulty=lv;if(m!=="mail")mail=null;if(m!=="puzzle")puzzle=null;startGame();
  if(m==="cpu"||m==="arcade")try{window.Characters&&Characters.onPlay&&Characters.onPlay();}catch(e){}});}
function restart(){whenScene(function(){if(mode==="mail")return;if(mode==="puzzle"){startPuzzle(puzzle.code,puzzle.limit,puzzle.onEnd);return;}if(mode==="arcade"){startStage(currentStage);return;}if(mode==="training"){if(trainPuzzle)newTrainingGame(trainPuzzle);return;}start(mode||"cpu",difficulty||2);});}
const TYPES={1:"p",2:"n",3:"b",4:"r",5:"q",6:"k"};
function startPuzzle(code,limit,onEnd){ // code: 64 hex digits in engine format, white to move, no castling
  whenScene(function(){
  puzzle={code,limit,onEnd};mode="puzzle";mail=null;hideSetup();Sound.resume();newGame();
  const b=Array.from({length:8},()=>Array(8).fill(null));b.ep=null;
  for(let i=0;i<64;i++){const v=parseInt(code[i],16);if(v)b[i>>3][i&7]={t:TYPES[v&7],c:v&8?"b":"w",moved:true};}
  board=b;turn="w";buildPieces();refreshHighlights();updateHUD();renderSidePanels();
  showMsg(josa(sideName("w"),"으로","로")+" "+limit+"수 안에 체크메이트하세요");setTimeout(()=>{if(!gameOver&&!mlog.length)hideMsg();},2600);
  });
}
function startMail(moves,myColor,hook){
  whenScene(function(){
  mail={color:myColor,locked:false,hook};mode="mail";puzzle=null;hideSetup();Sound.resume();newGame();
  replaying=true;
  try{for(const m of moves){if(gameOver)break;const d=decodeMove(m);const p=board[d[0]]&&board[d[0]][d[1]];
    if(!p||!legalMoves(board,d[0],d[1]).some(x=>x[0]===d[2]&&x[1]===d[3]))break;
    const isP=p.t==="p"&&(d[2]===0||d[2]===7);doMove(d[0],d[1],d[2],d[3],isP?(({2:"n",5:"q",4:"r",3:"b"})[(m>>12)&7]||"q"):undefined);}}
  finally{replaying=false;}
  mail.locked=!gameOver&&turn!==myColor;
  syncPieces();refreshHighlights();updateHUD();renderSidePanels();
  });
}
function reviewData(){
  const me=mode==="mail"?mail.color:"w";
  return {game:"chess",me,mode,moves:mlog.map((m,i)=>{const b=history[i].board,side=i%2===0?"w":"b";return Object.assign(engineInput(b,side),{played:m,mine:side===me});})};
}
function showReview(i,best,played){
  if(!review)review={board,lastMove};
  const h=history[i];if(!h)return;board=clone(h.board);lastMove=null;sel=null;legal=[];
  hintSquares=best>=0?decodeMove(best).slice(0,4):null;badSquares=played>=0?decodeMove(played).slice(0,4):null;
  syncPieces();refreshHighlights();
}
function endReview(){if(!review)return;board=review.board;lastMove=review.lastMove;hintSquares=null;badSquares=null;review=null;syncPieces();refreshHighlights();}
/* ---- 대국 저장·이어하기 (수순만 남기고 재생) ---- */
function resumeState(){
  if(!mode||!board||gameOver||review||mode==="puzzle"||mode==="mail"||mode==="training")return null;
  if(!mlog.length)return null;
  return {g:"chess",mode,level:difficulty,stage:currentStage,moves:mlog.slice()};
}
function resume(s){
  if(!s||s.g!=="chess"||!Array.isArray(s.moves))return false;
  if(!scene){whenScene(()=>resume(s));return true;}   // 3D 장상이 아직 없으면 불러온 뒤 이어한다
  start(s.mode,s.level);currentStage=s.stage||0;
  replaying=true;
  try{for(const m of s.moves){if(gameOver)break;const d=decodeMove(m);const p=board[d[0]]&&board[d[0]][d[1]];
    if(!p||!legalMoves(board,d[0],d[1]).some(x=>x[0]===d[2]&&x[1]===d[3]))break;
    const isP=p.t==="p"&&(d[2]===0||d[2]===7);doMove(d[0],d[1],d[2],d[3],isP?(({2:"n",5:"q",4:"r",3:"b"})[(m>>12)&7]||"q"):undefined);}}
  finally{replaying=false;}
  syncPieces();refreshHighlights();updateHUD();renderSidePanels();if(!gameOver)hideMsg();
  if(!gameOver&&vsCPU()&&turn==="b")setTimeout(cpuMove,500);
  try{window.Resume&&Resume.touch();}catch(e){}
  return true;
}
/* ---- 기권(항복) ---- */
function resign(){
  if(!board||gameOver)return;
  if(mode==="puzzle"||mode==="training"){showMsg("문제 풀이 중에는 기권할 수 없어요");setTimeout(()=>{if(!gameOver)hideMsg();},1500);return;}
  if(mode==="mail"){showMsg("친구 대국에서는 기권할 수 없어요");setTimeout(()=>{if(!gameOver)hideMsg();},1500);return;}
  const who=window.Meta&&Meta.NAME?Meta.NAME:"체스";
  if(!window.Meta||!Meta.modal){doResign();return;}
  Meta.modal({icon:"🏳️",kicker:who,title:"기권할까요?",sub:"지금 항복하면 이 판은 패배로 기록되고 대국 기록에 반영돼요.",
    actions:[{label:"계속 두기",fn:()=>{}},{label:"기권하기",fn:doResign}]});
}
function doResign(){
  if(gameOver)return;
  gameOver=true;review=null;promoPending=null;sel=null;legal=[];hintSquares=null;
  document.getElementById("stageEnd").style.display="none";
  showMsg("기권 — 항복했어요");
  try{Sound.lose();}catch(e){}
  emit({result:mode==="pvp"?"pvp":"lose",resign:true});
  if(mode==="arcade")setTimeout(showStageEndButtons,700);
  try{window.Resume&&Resume.clear();}catch(e){}
}
function markHint(m){if(m<0)return;hintSquares=decodeMove(m).slice(0,4);refreshHighlights();}
return { markHint, hint:showHint, boot, setActive:(v)=>{chessActive=!!v;if(v)_wakeChess();else{_sleepChess();disposeThree();}}, dispose:disposeThree, isScene:()=>!!scene,
  openSetup, start, restart, startPuzzle, startMail, reviewData, showReview, endReview, resumeState, resume, resign,
  exportMoves:()=>mlog.slice(), onEnd:(f)=>{endHook=f;},
  state:()=>({mode,level:difficulty,stage:currentStage,over:gameOver,turn,plies:moveNumber,mail:mail&&{color:mail.color,locked:mail.locked},setupOpen:document.getElementById("setup").style.display!=="none"}),
  pick:(r,c)=>{if(gameOver||promoPending||review)return;if(vsCPU()&&turn==="b")return;if(mode==="mail"&&(turn!==mail.color||mail.locked))return;handleSquare(r,c);},
  engineState:()=>engineInput(board,turn) };

})();
