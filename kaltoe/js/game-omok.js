/* ================= OMOK ================= */
const Omok=(function(){
  const SIZE=15, DIRS=[[0,1],[1,0],[1,1],[1,-1]];
  let board,turn,mode,level,history,over,ready=false;
  let canvas,ctx,cell,pad,dim;
  let stage=0, stageCleared=1, stageBest={}, lastCleared=false;   // arcade progress
  let puzzle=null;   // {board:flat225, limit, onEnd} while solving 오늘의 문제
  const isCPU=()=>mode==='cpu'||mode==='arcade'||mode==='puzzle';
  let endHook=null; const emit=(info)=>{try{endHook&&endHook(Object.assign({mode,level,stage,plies:history.length},info));}catch(e){console.error(e);}};
  function stageLevel(s){return s<=3?1:s<=7?2:3;} // AI depth/strength per stage
  const inB=(r,c)=>r>=0&&r<SIZE&&c>=0&&c<SIZE;
  function empty(){return Array.from({length:SIZE},()=>Array(SIZE).fill(0));}

  function winnerAt(b,r,c){const p=b[r][c];if(!p)return 0;
    for(const[dr,dc]of DIRS){let cnt=1;
      for(let s=1;s<5;s++){const rr=r+dr*s,cc=c+dc*s;if(inB(rr,cc)&&b[rr][cc]===p)cnt++;else break;}
      for(let s=1;s<5;s++){const rr=r-dr*s,cc=c-dc*s;if(inB(rr,cc)&&b[rr][cc]===p)cnt++;else break;}
      if(cnt>=5)return p;} return 0;}

  // ===== Renju forbidden-move rules (black only) =====
  let renjuOn=true; // toggleable
  function countRun(b,r,c,dr,dc,p){let cnt=1;let f=1;while(inB(r+dr*f,c+dc*f)&&b[r+dr*f][c+dc*f]===p){cnt++;f++;}let k=1;while(inB(r-dr*k,c-dc*k)&&b[r-dr*k][c-dc*k]===p){cnt++;k++;}return cnt;}
  function lineStr(b,r,c,dr,dc,me){let s='';for(let k=-4;k<=4;k++){const rr=r+dr*k,cc=c+dc*k;if(!inB(rr,cc))s+='B';else if(b[rr][cc]===me)s+='X';else if(b[rr][cc]===0)s+='.';else s+='B';}return s;}
  function isFourLine(line){for(let i=0;i<=line.length-5;i++){if(i<=4&&i+5>4){const w=line.slice(i,i+5);const x=(w.match(/X/g)||[]).length,dot=(w.match(/\./g)||[]).length;if(x===4&&dot===1)return true;}}return false;}
  function isOpenThreeLine(line){const idx=4;const pats=['.XXX.','.XX.X.','.X.XX.'];for(const pat of pats){let pos=line.indexOf(pat);while(pos!==-1){if(pos<=idx&&pos+pat.length>idx)return true;pos=line.indexOf(pat,pos+1);}}return false;}
  function analyzeBlack(b,r,c){b[r][c]=1;let fours=0,openThrees=0,overline=false,five=false;
    for(const[dr,dc]of DIRS){const line=lineStr(b,r,c,dr,dc,1);const run=countRun(b,r,c,dr,dc,1);
      if(run>=6)overline=true;if(run===5)five=true;if(isFourLine(line))fours++;if(isOpenThreeLine(line))openThrees++;}
    b[r][c]=0;return {fours,openThrees,overline,five};}
  function isForbidden(b,r,c){ // black (1) only
    if(!renjuOn||b[r][c]!==0)return false;
    const a=analyzeBlack(b,r,c);
    if(a.five)return false;            // exact five wins → allowed
    if(a.overline)return 'overline';   // 6목 금지
    if(a.fours>=2)return 'four-four';  // 4-4 금지
    if(a.openThrees>=2)return 'three-three'; // 3-3 금지
    return false;
  }
  function forbiddenPoints(b){ // list all forbidden cells for black
    if(!renjuOn)return [];
    const out=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(b[r][c]===0&&isForbidden(b,r,c))out.push([r,c]);return out;
  }
  function lineScore(b,r,c,p){let total=0;
    for(const[dr,dc]of DIRS){let cnt=1,open=0;
      let s=1;while(inB(r+dr*s,c+dc*s)&&b[r+dr*s][c+dc*s]===p){cnt++;s++;}
      if(inB(r+dr*s,c+dc*s)&&b[r+dr*s][c+dc*s]===0)open++;
      s=1;while(inB(r-dr*s,c-dc*s)&&b[r-dr*s][c-dc*s]===p){cnt++;s++;}
      if(inB(r-dr*s,c-dc*s)&&b[r-dr*s][c-dc*s]===0)open++;
      if(cnt>=5)total+=1000000;
      else if(cnt===4&&open===2)total+=100000;
      else if(cnt===4&&open===1)total+=10000;
      else if(cnt===3&&open===2)total+=5000;
      else if(cnt===3&&open===1)total+=500;
      else if(cnt===2&&open===2)total+=200;
      else if(cnt===2&&open===1)total+=50;
      else total+=cnt*open*5;}
    return total;}
  function candidates(b){const set=new Set(),out=[];let any=false;
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(b[r][c]){any=true;
      for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++){const rr=r+dr,cc=c+dc;
        if(inB(rr,cc)&&b[rr][cc]===0){const k=rr*SIZE+cc;if(!set.has(k)){set.add(k);out.push([rr,cc]);}}}}
    if(!any)return[[7,7]];return out;}
  function aiMove(b,me,lv){const opp=me===1?2:1;const cands=candidates(b);
    let best=cands[0],bestS=-Infinity;
    for(const[r,c]of cands){const off=lineScore(b,r,c,me),def=lineScore(b,r,c,opp);
      let s=off+def*0.9;
      if(lv>=2){b[r][c]=me;let ob=0;for(const[r2,c2]of candidates(b)){const q=lineScore(b,r2,c2,opp);if(q>ob)ob=q;}b[r][c]=0;s-=ob*0.5;}
      s+= lv>=3?Math.random()*10:Math.random()*200*(4-lv);
      if(s>bestS){bestS=s;best=[r,c];}}
    return best;}

  let g3d=null, lastMove=null, hintCell=null, badCell=null;
  // 친구 대국 (moves travel in a link): which colour this device plays and whether it already moved
  let mail=null;            // {color, locked, hook}
  let review=null;          // saved real position while the review shows an earlier one
  function ensure(){ if(ready)return; setupCanvas(); loadProgress(); openSetup(); ready=true; }
  async function loadProgress(){
    const p=await Store.get('omok_progress');
    if(p){stageCleared=p.cleared||1;stageBest=p.best||{};}
  }
  function saveProgress(){ Store.set('omok_progress',{cleared:stageCleared,best:stageBest}); }
  function setupCanvas(){
    g3d=makeBoard3D({
      mountId:'omokMount', cols:SIZE, rows:SIZE, squareStyle:'grid', wood:{base:'#b98540',dark:'rgba(118,68,22,1)',light:'rgba(222,172,96,1)'},inkColor:'#1a120a', boardColor:0x2b2b2e, lineColor:0xc7ccd4,
      frameColor:0x17171a, frameRimColor:0x23262c,
      onRestore:()=>draw(),
      decorate:(grp,toXZ,T)=>{ // star points
        [[3,3],[3,11],[11,3],[11,11],[7,7]].forEach(([r,c])=>{const {x,z}=toXZ(r,c);
          const d=new T.Mesh(new T.CylinderGeometry(0.085,0.085,0.006,24),new T.MeshStandardMaterial({color:0x1a120a,roughness:.4}));
          d.position.set(x,0.064,z);grp.add(d);});
      },
      onPick:(r,c)=>pick(r,c)
    });
    g3d.init();
    draw();
  }
  function pick(r,c){ if(over||!board||review)return; if(isCPU()&&turn===2)return;
    if(mode==='mail'&&(turn!==mail.color||mail.locked)){banner(mail.locked?'친구에게 수를 보내 주세요':'친구 차례예요');setTimeout(()=>{if(!over)hideBanner();},1400);return;}
    if(board[r][c]!==0)return;
    if(turn===1){const fb=isForbidden(board,r,c);if(fb){const nm=fb==='overline'?'장목(6목)':fb==='four-four'?'4-4':'3-3';banner('금수! '+nm+' 자리예요');SFX.check();setTimeout(()=>{if(!over)hideBanner();},1400);return;}}
    place(r,c); }
  function draw(){
    if(!g3d||!g3d.ready()||!board)return;
    const T=g3d.THREE;
    g3d.clearPieces();g3d.clearMarks();
    // stones — cached biconvex stones; only newly placed stones drop in
    g3d.beginPieces();let _o=0;
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(board[r][c]){
      const {x,z}=g3d.toXZ(r,c);const black=board[r][c]===1;
      const stone=_goStone(T,black);stone.position.set(x,g3d.TOPY,z);
      g3d.addPiece(r+','+c+(black?'b':'w'),stone,{order:_o++,color:black?0x2a2a2e:0xeeeae0,ghost:()=>_goStone(T,black)});
    }
    g3d.endPieces({emptyIsCapture:true,soft:true});
    // last move marker (blue pulsing ring)
    if(lastMove){addRing(lastMove[0],lastMove[1],0x3a86ff);}
    // hint marker (green pulsing ring + pillar)
    if(hintCell){addRing(hintCell[0],hintCell[1],0x2fd94a);
      const {x,z}=g3d.toXZ(hintCell[0],hintCell[1]);
      const pil=new T.Mesh(new T.CylinderGeometry(0.05,0.05,1.4,10),new T.MeshBasicMaterial({color:0x2fd94a,transparent:true,opacity:.8}));
      pil.position.set(x,0.8,z);pil.userData.pulse=true;pil.userData.base=0.8;g3d.markGroup.add(pil);}
    if(badCell){const {x,z}=g3d.toXZ(badCell[0],badCell[1]);
      [Math.PI/4,-Math.PI/4].forEach(rot=>{const bar=new T.Mesh(new T.BoxGeometry(0.62,0.04,0.11),new T.MeshBasicMaterial({color:0xe23b3b}));bar.position.set(x,g3d.TOPY+0.24,z);bar.rotation.y=rot;g3d.markGroup.add(bar);});}
    // forbidden points (only when black is to move, human's turn)
    if(renjuOn && turn===1 && !over && !review){
      forbiddenPoints(board).forEach(([r,c])=>{
        const {x,z}=g3d.toXZ(r,c);
        const mkX=(rot)=>{const bar=new T.Mesh(new T.BoxGeometry(0.5,0.03,0.09),new T.MeshBasicMaterial({color:0xe23b3b}));bar.position.set(x,0.14,z);bar.rotation.y=rot;g3d.markGroup.add(bar);};
        mkX(Math.PI/4);mkX(-Math.PI/4);
      });
    }
  }
  function addRing(r,c,color){
    const T=g3d.THREE;const {x,z}=g3d.toXZ(r,c);
    g3d.glowRing(x,z,color,{size:1.45});
    if(board&&board[r][c])g3d.glowRing(x,z,color,{disc:true,size:.34,y:g3d.TOPY+0.205,a:1,k:2.2,pulse:false});
  }
  function startPulse(){/* handled by shared animate loop */}
  function place(r,c){
    history.push({r,c,turn});
    const wasMe = turn;
    board[r][c]=turn;lastMove=[r,c];hintCell=null;
    if(!replaying)SFX.place();
    const w=winnerAt(board,r,c);
    if(!replaying)draw();
    if(w){over=true;endGame(w);return;}
    if(history.length>=SIZE*SIZE){over=true;banner('무승부');SFX.draw();emit({result:'draw'});if(mode==='arcade')setTimeout(showStageEnd,700);return;}
    if(mode==='puzzle'&&wasMe===1&&blackMoves()>=puzzle.limit){over=true;turn=2;status();endPuzzle(false,'수 제한');return;}
    turn=turn===1?2:1;
    if(mode==='mail'&&!replaying){mail.locked=true;status();try{mail.hook&&mail.hook({moves:exportMoves(),over:false});}catch(e){}return;}
    status();
    if(!over&&isCPU()&&turn===2){setTimeout(cpuTurn,mode==='puzzle'?420:250);}
  }
  // CPU strength: search depth, randomness, VCF (forced-four) reading and thinking time
  function aiConfig(){
    if(mode==='puzzle')return {maxDepth:4,noise:0,K:10,vcf:true,ms:700};   // defend as well as possible
    if(mode==='arcade'||level>10){const t=Math.max(1,Math.min(10,level>10?level-10:stage||1));
      return {maxDepth:[0,1,1,1,2,2,2,3,4,6,8][t],noise:[0,6000,3000,1500,800,300,0,0,0,0,0][t],K:8,vcf:t>=7,ms:[0,250,250,250,350,400,500,700,900,1100,1400][t]};}
    return [null,{maxDepth:1,noise:3000,K:8,vcf:false,ms:250},{maxDepth:2,noise:0,K:10,vcf:false,ms:500},{maxDepth:8,noise:0,K:8,vcf:true,ms:1300}][level];
  }
  async function engineMove(col,cfg){
    const bref=board,n0=history.length;
    const res=await OmokAI.run('move',Object.assign({board:[].concat(...board),toPlay:col,renju:renjuOn},cfg));
    if(board!==bref||history.length!==n0||over)return null;              // undone / restarted meanwhile
    if(!res||res.error||res.move<0)return null;
    const r=(res.move/SIZE)|0,c=res.move%SIZE;
    if(board[r][c]||(col===1&&isForbidden(board,r,c)))return null;
    return [r,c];
  }
  async function cpuTurn(){
    if(over||!board||turn!==2)return;
    const n0=history.length,bref=board;
    let m=await engineMove(2,aiConfig());
    if(over||board!==bref||history.length!==n0||turn!==2)return;
    if(!m)m=aiMove(board,2,3);                                            // fallback: quick heuristic
    if(m)place(m[0],m[1]);
  }
  async function hint(){
    if(over||!board)return;
    if(isCPU()&&turn===2)return; // not your turn
    if(mode==='puzzle'){banner('문제에서는 힌트를 쓸 수 없어요');setTimeout(()=>{if(!over)hideBanner();},1400);return;}
    const me=turn,n0=history.length;
    banner('💡 수를 읽는 중…');
    const m=await engineMove(me,{maxDepth:8,noise:0,K:8,vcf:true,ms:900});
    if(over||history.length!==n0){hideBanner();return;}
    if(!m){hideBanner();return;}
    if(m){hintCell=m;draw();startPulse();SFX.select();banner('💡 추천: '+String.fromCharCode(65+m[1])+(SIZE-m[0]));
      setTimeout(()=>{if(!over)hideBanner();},2000);}
  }
  function blackMoves(){let n=0;for(const h of history)if(h.turn===1&&!h.pre)n++;return n;}
  function endPuzzle(solved,why){
    const n=blackMoves();
    if(solved){banner('정답! '+n+'수 만에 이겼어요 🎉');SFX.win();}
    else{banner(why==='수 제한'?puzzle.limit+'수 안에 이기지 못했어요':'백이 이겼어요… 다시 도전!');SFX.lose();}
    const cb=puzzle&&puzzle.onEnd; if(cb)setTimeout(()=>cb({solved,moves:n}),solved?900:700);
  }
  function endGame(w){
    // in cpu/arcade/puzzle the human is black(1); win if human won
    const humanWon = mode==='mail'?(w===mail.color):(w===1);
    if(mode==='puzzle'){status();endPuzzle(humanWon,humanWon?'':'lost');return;}
    if(!(mode==='mail'&&replaying))emit({result:humanWon?'win':'lose',winner:w});
    if(mode==='arcade'){
      lastCleared = humanWon;
      if(humanWon){
        if(stage>=stageCleared)stageCleared=Math.min(10,stage+1);
        const plies=history.length;if(stageBest[stage]===undefined||plies<stageBest[stage])stageBest[stage]=plies;saveProgress();
        banner('스테이지 '+stage+' 클리어! ⭐');SFX.win();
      } else {banner('스테이지 '+stage+' 실패… 다시 도전! ✊');SFX.lose();}
      setTimeout(showStageEnd,700);
    } else {
      banner((w===1?'흑':'백')+' 승리! 🏆');
      if(mode==='cpu'||mode==='mail'){ humanWon?SFX.win():SFX.lose(); } else { SFX.win(); }
      if(mode==='mail'&&!replaying){try{mail.hook&&mail.hook({moves:exportMoves(),over:true,won:humanWon});}catch(e){}}
    }
  }
  function status(){
    let t;
    if(mode==='mail')t = over?'대국 종료':turn===mail.color?(mail.locked?'친구에게 수를 보내 주세요':'내 차례 ('+(mail.color===1?'흑':'백')+')'):'친구 차례 — 수를 기다리는 중';
    else if(mode==='puzzle')t = over?'문제 종료':turn===1?'당신(흑) 차례 · '+(puzzle.limit-blackMoves())+'수 남음':'CPU가 막는 중…';
    else if(mode==='arcade')t = turn===1?'스테이지 '+stage+' · 당신(흑)':'CPU 생각 중…';
    else t = (mode==='cpu')?(turn===1?'당신(흑) 차례':'CPU 생각 중…'):(turn===1?'흑 차례':'백 차례');
    document.getElementById('omokStatus').textContent=t;
  }
  function banner(t){const b=document.getElementById('omokWin');b.textContent=t;b.style.display='block';}
  function hideBanner(){document.getElementById('omokWin').style.display='none';}

  function openSetup(){document.getElementById('omokSetup').classList.remove('hidden');document.getElementById('omokDiff').classList.add('hidden');document.getElementById('omokStages').classList.add('hidden');document.getElementById('omokStageEnd').style.display='none';}
  function chooseCPU(){document.getElementById('omokDiff').classList.remove('hidden');document.getElementById('omokStages').classList.add('hidden');}
  function openStages(){
    document.getElementById('omokDiff').classList.add('hidden');
    document.getElementById('omokStages').classList.remove('hidden');
    document.getElementById('omokProgress').textContent='(최고 '+stageCleared+'단계)';
    const grid=document.getElementById('omokStageGrid');grid.innerHTML='';
    for(let s=1;s<=10;s++){
      const cell2=document.createElement('div');
      cell2.className='scell'+(s<stageCleared?' cleared':'');
      const lv=stageLevel(s);const lvName=lv===1?'초급':lv===2?'중급':'고급';
      const rec=stageBest[s]!==undefined?(stageBest[s]+'수'):lvName;
      cell2.innerHTML=s+'<small>'+rec+'</small>';
      cell2.onclick=()=>startStage(s);
      grid.appendChild(cell2);
    }
  }
  function startStage(s){if(window.StoryGate&&!window.StoryGate(s,()=>startStage(s)))return;stage=s;start('arcade',stageLevel(s));}
  function showStageEnd(){
    const el=document.getElementById('omokStageEnd');el.innerHTML='';
    if(lastCleared && stage<10){const nx=document.createElement('button');nx.textContent='다음 스테이지 ▶';nx.onclick=()=>{el.style.display='none';startStage(stage+1);};el.appendChild(nx);}
    const rp=document.createElement('button');rp.className='ghost';rp.textContent='다시 하기';rp.onclick=()=>{el.style.display='none';startStage(stage);};el.appendChild(rp);
    const mn=document.createElement('button');mn.className='ghost';mn.textContent='스테이지 선택';mn.onclick=()=>{el.style.display='none';openSetup();openStages();};el.appendChild(mn);
    el.style.display='flex';
  }
  function startPuzzle(flat,limit,onEnd){
    if(!g3d)setupCanvas();puzzle={flat:flat.slice(),limit,onEnd};mode='puzzle';level=3;board=empty();history=[];
    flat.forEach((v,i)=>{if(v){board[(i/SIZE)|0][i%SIZE]=v;history.push({r:(i/SIZE)|0,c:i%SIZE,turn:v,pre:true});}});
    turn=1;over=false;lastMove=null;hintCell=null;hideBanner();renjuOn=true;
    const rb=document.getElementById('omokRenjuBtn');if(rb)rb.textContent='금수 ON';
    document.getElementById('omokSetup').classList.add('hidden');document.getElementById('omokStageEnd').style.display='none';
    draw();status();banner('흑으로 '+limit+'수 안에 이기세요');setTimeout(()=>{if(!over&&blackMoves()===0)hideBanner();},2200);
  }
  function start(m,lv){if(!g3d)setupCanvas();mode=m;level=lv||2;board=empty();turn=1;history=[];over=false;lastMove=null;hintCell=null;badCell=null;review=null;hideBanner();puzzle=null;if(m!=='mail')mail=null;
    document.getElementById('omokSetup').classList.add('hidden');document.getElementById('omokStageEnd').style.display='none';draw();status();
    if(m==='cpu'||m==='arcade')try{window.Characters&&Characters.onPlay&&Characters.onPlay();}catch(e){}}
  function restart(){if(!mode){openSetup();return;} if(mode==='mail')return; if(mode==='puzzle')startPuzzle(puzzle.flat,puzzle.limit,puzzle.onEnd); else if(mode==='arcade')startStage(stage); else start(mode,level);}
  function undo(){if(review)return;
    if(mode==='mail'){ // only the move you haven't sent yet can be taken back
      const h=history[history.length-1];
      if(!mail.locked||over||!h||h.turn!==mail.color)return;
      history.pop();board[h.r][h.c]=0;turn=mail.color;mail.locked=false;
      lastMove=history.length?[history[history.length-1].r,history[history.length-1].c]:null;
      try{mail.hook&&mail.hook({moves:exportMoves(),over:false,undo:true});}catch(e){}
      draw();status();return;}
    if(over)hideBanner();document.getElementById('omokStageEnd').style.display='none';if(!history.length)return;over=false;hintCell=null;
    const cpu=isCPU();let h;
    if(history[history.length-1].pre)return;
    do{h=history.pop();board[h.r][h.c]=0;}while(cpu&&h.turn!==1&&history.length&&!history[history.length-1].pre);
    lastMove=history.length?[history[history.length-1].r,history[history.length-1].c]:null;
    turn = isCPU()?1:(history.length%2===0?1:2);
    draw();startPulse();status();}
  let replaying=false;
  function exportMoves(){return history.filter(h=>!h.pre).map(h=>h.r*SIZE+h.c);}
  // open a 친구 대국 from its move list; myColor 1 (흑) or 2 (백)
  function startMail(moves,myColor,hook){
    mail={color:myColor,locked:false,hook};start('mail',2);renjuOn=true;
    replaying=true;
    try{for(const m of moves){if(over)break;const r=(m/SIZE)|0,c=m%SIZE;if(!inB(r,c)||board[r][c])break;place(r,c);}}
    finally{replaying=false;}
    mail.locked=!over&&turn!==myColor;
    draw();status();
    if(over){const w=history.length?board[history[history.length-1].r][history[history.length-1].c]:0;banner((w===1?'흑':'백')+' 승리! 🏆');}
  }
  // ---- 복기: positions for the analyser, and showing an earlier position on the board ----
  function reviewData(){
    const me=mode==='mail'?mail.color:1;const out=[];const b=empty();
    for(const h of history){ if(h.pre){b[h.r][h.c]=h.turn;continue;}
      out.push({board:[].concat(...b),toPlay:h.turn,played:h.r*SIZE+h.c,mine:h.turn===me});b[h.r][h.c]=h.turn;}
    return {game:'omok',me,mode,moves:out};
  }
  function showReview(i,best,played){ // position before move i of reviewData().moves
    if(!review)review={board:board.map(r=>r.slice()),lastMove,hintCell};
    const d=reviewData().moves[i];if(!d)return;
    board=empty();d.board.forEach((v,k)=>{if(v)board[(k/SIZE)|0][k%SIZE]=v;});
    lastMove=null;hintCell=best>=0?[(best/SIZE)|0,best%SIZE]:null;badCell=played>=0?[(played/SIZE)|0,played%SIZE]:null;draw();
  }
  function endReview(){if(!review)return;board=review.board;lastMove=review.lastMove;hintCell=null;badCell=null;review=null;draw();}
  function markHint(m){if(m<0)return;hintCell=[(m/SIZE)|0,m%SIZE];draw();}
  return {markHint,ensure,openSetup,startPuzzle,startMail,exportMoves,reviewData,showReview,endReview,pick,board:()=>board&&board.map(r=>r.slice()),onEnd:(f)=>{endHook=f;},state:()=>({mode,level,stage,over,turn,plies:history?history.length:0,mail:mail&&{color:mail.color,locked:mail.locked}}),chooseCPU,openStages,hint,start,restart,undo,zoom:(d)=>g3d&&g3d.zoom(d*1.2),resetView:()=>{if(g3d){g3d.resetView();const b=document.getElementById("omok2dBtn");if(b)b.textContent="2D 보기";}},toggle2D:()=>{if(!g3d)return;const on=g3d.toggle2D();const b=document.getElementById("omok2dBtn");if(b)b.textContent=on?"3D 보기":"2D 보기";},setActive:(v)=>g3d&&g3d.setActive(v),toggleRenju:()=>{renjuOn=!renjuOn;const b=document.getElementById("omokRenjuBtn");if(b)b.textContent=renjuOn?"금수 ON":"금수 OFF";draw();}};
})();
