/* ================= JANGGI (Korean Chess) ================= */
const Janggi=(function(){
  const COLS=9,ROWS=10;
  const inB=(r,c)=>r>=0&&r<ROWS&&c>=0&&c<COLS;
  const inPalace=(r,c,side)=>c>=3&&c<=5&&(side==='top'?(r>=0&&r<=2):(r>=7&&r<=9));
  const PAL_TOP=[[0,3],[0,5],[2,3],[2,5],[1,4]];
  const PAL_BOT=[[7,3],[7,5],[9,3],[9,5],[8,4]];
  function palDiag(r,c,rr,cc){const has=(pts,a,b)=>pts.some(([x,y])=>x===a&&y===b);
    for(const pts of[PAL_TOP,PAL_BOT])if(has(pts,r,c)&&has(pts,rr,cc)&&Math.abs(r-rr)===1&&Math.abs(c-cc)===1)return true;return false;}
  // Sides: 'r' = 초(楚) — you, bottom, moves first, blue-green pieces with 卒
  //        'b' = 한(漢) — top, red pieces with 兵   (traditional colours: 초 청색, 한 홍색)
  const NAME={K:{r:'楚',b:'漢'},A:'士',E:'象',H:'馬',R:'車',C:'包',P:{r:'卒',b:'兵'}};
  const HAN={K:'궁',A:'사',E:'상',H:'마',R:'차',C:'포',P:'졸'};
  const VAL={K:10000,R:130,C:70,H:50,E:30,A:30,P:20};

  let board,turn,mode,level,history,over,ready=false,sel=null,legal=[],lastMove=null,hintMove=null;
  let stage=0, stageCleared=1, stageBest={}, lastCleared=false;
  let mlog=[];               // moves as [r,c,rr,cc], parallel to history
  let mail=null, puzzle=null, review=null, badMove=null, replaying=false;
  const vsCPU=()=>mode==='cpu'||mode==='arcade'||mode==='puzzle';
  function stageLevel(s){return s<=3?1:s<=7?2:3;}
  let canvas,ctx,cw,ch,pad,cellW,cellH;

  function fresh(){
    const b=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    const back=['R','E','H','A',null,'A','H','E','R'];
    for(let c=0;c<COLS;c++)if(back[c])b[0][c]={t:back[c],c:'b'};
    b[1][4]={t:'K',c:'b'};b[2][1]={t:'C',c:'b'};b[2][7]={t:'C',c:'b'};
    [0,2,4,6,8].forEach(c=>b[3][c]={t:'P',c:'b'});
    for(let c=0;c<COLS;c++)if(back[c])b[9][c]={t:back[c],c:'r'};
    b[8][4]={t:'K',c:'r'};b[7][1]={t:'C',c:'r'};b[7][7]={t:'C',c:'r'};
    [0,2,4,6,8].forEach(c=>b[6][c]={t:'P',c:'r'});
    return b;
  }
  const clone=b=>b.map(row=>row.map(x=>x?{t:x.t,c:x.c}:null));

  function moves(b,r,c){
    const p=b[r][c];if(!p)return[];const out=[],me=p.c,opp=me==='r'?'b':'r';
    const side=me==='b'?'top':'bottom';
    const land=(rr,cc)=>inB(rr,cc)&&(!b[rr][cc]||b[rr][cc].c===opp);
    const add=(rr,cc)=>{if(land(rr,cc))out.push([rr,cc]);};
    if(p.t==='K'||p.t==='A'){
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{const rr=r+dr,cc=c+dc;if(inPalace(rr,cc,side)&&land(rr,cc))out.push([rr,cc]);});
      [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{const rr=r+dr,cc=c+dc;if(inPalace(rr,cc,side)&&palDiag(r,c,rr,cc)&&land(rr,cc))out.push([rr,cc]);});
    } else if(p.t==='P'){
      const fwd=me==='b'?1:-1;add(r+fwd,c);add(r,c-1);add(r,c+1);
      [[fwd,-1],[fwd,1]].forEach(([dr,dc])=>{const rr=r+dr,cc=c+dc;if(palDiag(r,c,rr,cc)&&land(rr,cc))out.push([rr,cc]);});
    } else if(p.t==='R'){
      for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){let rr=r+dr,cc=c+dc;while(inB(rr,cc)){if(!b[rr][cc])out.push([rr,cc]);else{if(b[rr][cc].c===opp)out.push([rr,cc]);break;}rr+=dr;cc+=dc;}}
      for(const pts of[PAL_TOP,PAL_BOT]){if(pts.some(([x,y])=>x===r&&y===c)){
        [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{let rr=r+dr,cc=c+dc;
          while(pts.some(([x,y])=>x===rr&&y===cc)){if(!b[rr][cc])out.push([rr,cc]);else{if(b[rr][cc].c===opp)out.push([rr,cc]);break;}rr+=dr;cc+=dc;}});}}
    } else if(p.t==='H'){
      // 馬: one step straight (must be empty), then one diagonal step outward → (±2,±1)/(±1,±2)
      const legs=[[-1,0,-2,-1],[-1,0,-2,1],[1,0,2,-1],[1,0,2,1],[0,-1,-1,-2],[0,-1,1,-2],[0,1,-1,2],[0,1,1,2]];
      for(const[br,bc,dr,dc]of legs)if(inB(r+br,c+bc)&&!b[r+br][c+bc])add(r+dr,c+dc);
    } else if(p.t==='E'){
      // 象: one step straight, then two diagonal steps outward (both must be empty) → (±3,±2)/(±2,±3)
      const legs=[[-1,0,-3,-2,-1,-1],[-1,0,-3,2,-1,1],[1,0,3,-2,1,-1],[1,0,3,2,1,1],[0,-1,-2,-3,-1,-1],[0,-1,2,-3,1,-1],[0,1,-2,3,-1,1],[0,1,2,3,1,1]];
      for(const[s1r,s1c,dr,dc,m1r,m1c]of legs){if(!inB(r+s1r,c+s1c)||b[r+s1r][c+s1c])continue;if(!inB(r+s1r+m1r,c+s1c+m1c)||b[r+s1r+m1r][c+s1c+m1c])continue;add(r+dr,c+dc);}
    } else if(p.t==='C'){
      for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){let rr=r+dr,cc=c+dc,screen=false;
        while(inB(rr,cc)){if(!screen){if(b[rr][cc]){if(b[rr][cc].t==='C')break;screen=true;}}
          else{if(!b[rr][cc])out.push([rr,cc]);else{if(b[rr][cc].c===opp&&b[rr][cc].t!=='C')out.push([rr,cc]);break;}}rr+=dr;cc+=dc;}}
      for(const pts of[PAL_TOP,PAL_BOT]){const corners=[pts[0],pts[1],pts[2],pts[3]];
        if(corners.some(([x,y])=>x===r&&y===c)){const mid=pts[4];
          if(b[mid[0]][mid[1]]&&b[mid[0]][mid[1]].t!=='C'){const opp2=corners.find(([x,y])=>x===2*mid[0]-r&&y===2*mid[1]-c);
            if(opp2){const[rr,cc]=opp2;if(!b[rr][cc]||(b[rr][cc].c===opp&&b[rr][cc].t!=='C'))out.push([rr,cc]);}}}}
    }
    return out;
  }
  function findGen(b,col){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=b[r][c];if(p&&p.t==='K'&&p.c===col)return[r,c];}return null;}
  function gensFace(b){const g1=findGen(b,'r'),g2=findGen(b,'b');if(!g1||!g2||g1[1]!==g2[1])return false;
    const c=g1[1],lo=Math.min(g1[0],g2[0]),hi=Math.max(g1[0],g2[0]);for(let r=lo+1;r<hi;r++)if(b[r][c])return false;return true;}
  function attacked(b,r,c,by){for(let i=0;i<ROWS;i++)for(let j=0;j<COLS;j++){const p=b[i][j];if(p&&p.c===by&&moves(b,i,j).some(([mr,mc])=>mr===r&&mc===c))return true;}return false;}
  function inCheck(b,col){const g=findGen(b,col);if(!g)return true;return attacked(b,g[0],g[1],col==='r'?'b':'r');}
  function legalMoves(b,r,c){const p=b[r][c];if(!p)return[];
    return moves(b,r,c).filter(([rr,cc])=>{const nb=clone(b);nb[rr][cc]=nb[r][c];nb[r][c]=null;return !inCheck(nb,p.c)&&!gensFace(nb);});}
  function allMoves(b,col){const res=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=b[r][c];if(p&&p.c===col)legalMoves(b,r,c).forEach(m=>res.push([r,c,m[0],m[1]]));}return res;}

  // AI: minimax with alpha-beta (shallow)
  function evalB(b,me){let s=0;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=b[r][c];if(p)s+=(p.c===me?1:-1)*VAL[p.t];}return s;}
  function apply(b,m){const nb=clone(b);nb[m[2]][m[3]]=nb[m[0]][m[1]];nb[m[0]][m[1]]=null;return nb;}
  let nodes=0;const CAP=40000;
  function search(b,depth,alpha,beta,meColor,maxing){
    if(nodes++>CAP)return evalB(b,meColor);
    if(depth===0)return evalB(b,meColor);
    const col=maxing?meColor:(meColor==='r'?'b':'r');
    const mv=allMoves(b,col);
    if(!mv.length)return maxing?-99999:99999;
    if(maxing){let best=-Infinity;for(const m of mv){best=Math.max(best,search(apply(b,m),depth-1,alpha,beta,meColor,false));alpha=Math.max(alpha,best);if(beta<=alpha)break;}return best;}
    else{let best=Infinity;for(const m of mv){best=Math.min(best,search(apply(b,m),depth-1,alpha,beta,meColor,true));beta=Math.min(beta,best);if(beta<=alpha)break;}return best;}
  }
  function aiMove(b,me,lv){
    const mv=allMoves(b,me);if(!mv.length)return null;
    const depth=lv===1?1:lv===2?2:3;const blunder=lv===1?80:lv===2?25:0;
    mv.sort(()=>Math.random()-0.5);nodes=0;let best=mv[0],bestV=-Infinity;
    for(const m of mv){let v=search(apply(b,m),depth-1,-Infinity,Infinity,me,false);if(blunder)v+=Math.random()*blunder;if(v>bestV){bestV=v;best=m;}}
    return best;
  }

  let g3d=null;
  function ensure(){if(ready)return;setupCanvas();loadProgress();openSetup();ready=true;}
  async function loadProgress(){
    const p=await Store.get('janggi_progress');
    if(p){stageCleared=p.cleared||1;stageBest=p.best||{};}
  }
  function saveProgress(){ Store.set('janggi_progress',{cleared:stageCleared,best:stageBest}); }
  function setupCanvas(){
    g3d=makeBoard3D({
      mountId:'janggiMount', cols:COLS, rows:ROWS, squareStyle:'grid', wood:{base:'#b37a3a',dark:'rgba(112,60,20,1)',light:'rgba(214,160,92,1)'},inkColor:'#2e1d0e', boardColor:0xd9b877,
      onRestore:()=>draw(),
      decorate:(grp,toXZ,T)=>{ // palace diagonals as strips
        const lineMat=new T.MeshStandardMaterial({color:0x2e1d0e,roughness:.4});
        const strip=(a,b)=>{const A=toXZ(a[0],a[1]),B=toXZ(b[0],b[1]);
          const dx=B.x-A.x,dz=B.z-A.z,len=Math.hypot(dx,dz);
          const m=new T.Mesh(new T.BoxGeometry(len,0.006,0.04),lineMat);
          m.position.set((A.x+B.x)/2,0.063,(A.z+B.z)/2);m.rotation.y=-Math.atan2(dz,dx);grp.add(m);};
        const mk=(r0)=>{strip([r0,3],[r0+2,5]);strip([r0,5],[r0+2,3]);};
        mk(0);mk(7);
      },
      onPick:(r,c)=>{ if(over||!board||review)return; if(vsCPU()&&turn==='b')return;
        if(mode==='mail'&&(turn!==mail.color||mail.locked)){banner(mail.locked?'친구에게 수를 보내 주세요':'친구 차례예요');setTimeout(()=>{if(!over)hideBanner();},1400);return;}
        click(r,c); }
    });
    g3d.init();
    draw();
  }
  // cache character textures
  const texCache={};
  function pieceTexture(ch,col){
    const key=ch+col;if(texCache[key])return texCache[key];
    const S=192;const cv=document.createElement('canvas');cv.width=cv.height=S;const cx=cv.getContext('2d');
    const red = col==='b';   // 한 is red
    // wood-like disc face with radial shading
    const g=cx.createRadialGradient(S*0.4,S*0.36,10,S/2,S/2,S*0.5);
    if(red){g.addColorStop(0,'#e6c9a0');g.addColorStop(1,'#c89b6a');}
    else   {g.addColorStop(0,'#e6c9a0');g.addColorStop(1,'#c89b6a');}
    cx.fillStyle=g;cx.beginPath();cx.arc(S/2,S/2,S*0.47,0,7);cx.fill();
    // engraved double ring
    cx.strokeStyle=red?'#8f2418':'#12474e';cx.lineWidth=6;cx.beginPath();cx.arc(S/2,S/2,S*0.44,0,7);cx.stroke();
    cx.lineWidth=2.5;cx.beginPath();cx.arc(S/2,S/2,S*0.38,0,7);cx.stroke();
    // carved character (colored, with light emboss)
    cx.font='bold '+Math.floor(S*0.56)+'px "Malgun Gothic",serif';cx.textAlign='center';cx.textBaseline='middle';
    cx.fillStyle='rgba(255,255,255,.5)';cx.fillText(ch,S/2+1.5,S/2+3.5); // highlight
    cx.fillStyle=red?'#a3271b':'#15525a';cx.fillText(ch,S/2,S/2+1);
    const t=new g3d.THREE.CanvasTexture(cv);texCache[key]=t;return t;
  }
  // octagonal lacquered wood pieces with an engraved, ink-filled character (cached per type)
  const _jg={};let _jWood=null;
  function jFace(ch,col,S){
    const red=col==='b', ink=red?'#a8231a':'#12566a';
    const oct=(g,r)=>{g.beginPath();for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4;const X=S/2+Math.cos(a)*r,Y=S/2+Math.sin(a)*r;k?g.lineTo(X,Y):g.moveTo(X,Y);}g.closePath();};
    const font='900 '+Math.floor(S*0.56)+'px "Malgun Gothic","Noto Serif CJK KR","Noto Sans CJK KR",serif';
    const map=_cvTex(S,S,g=>{
      const gr=g.createRadialGradient(S*.42,S*.38,S*.05,S/2,S/2,S*.6);gr.addColorStop(0,'#e6c896');gr.addColorStop(1,'#c49a5e');g.fillStyle=gr;g.fillRect(0,0,S,S);
      for(let i=0;i<70;i++){g.strokeStyle='rgba(140,90,40,'+_rnd(.04,.14)+')';g.lineWidth=_rnd(.5,2);const y=Math.random()*S;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(S*.3,y+_rnd(-6,6),S*.7,y+_rnd(-6,6),S,y+_rnd(-4,4));g.stroke();}
      g.strokeStyle=ink;g.lineWidth=S*0.03;oct(g,S*0.44);g.stroke();
      g.textAlign='center';g.textBaseline='middle';g.font=font;
      g.fillStyle='rgba(60,30,10,.55)';g.fillText(ch,S/2-2,S/2-1);      // engraved wall (shadow side)
      g.fillStyle='rgba(255,240,210,.6)';g.fillText(ch,S/2+2.5,S/2+4);  // lit wall
      g.fillStyle=ink;g.fillText(ch,S/2,S/2+1.5);
    });
    const bump=_cvTex(S,S,g=>{g.fillStyle='#fff';g.fillRect(0,0,S,S);g.filter='blur(1.5px)';
      g.strokeStyle='#202020';g.lineWidth=S*0.03;oct(g,S*0.44);g.stroke();
      g.textAlign='center';g.textBaseline='middle';g.font=font;g.fillStyle='#000';g.fillText(ch,S/2,S/2+1.5);},false);
    return {map,bump};
  }
  function jPiece(T,p){
    const key=p.t+p.c;
    if(!_jg[key]){
      const big=p.t==='K', small=p.t==='A'||p.t==='P';
      const rad=big?0.5:small?0.38:0.44, bev=0.04, dep=0.13;
      const sh=new T.Shape();
      for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4;const X=Math.cos(a)*(rad-bev),Y=Math.sin(a)*(rad-bev);k?sh.lineTo(X,Y):sh.moveTo(X,Y);}
      const geo=new T.ExtrudeGeometry(sh,{depth:dep,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:3});
      geo.rotateX(-Math.PI/2);geo.translate(0,bev,0);
      if(!_jWood){_jWood=_woodMaps(256,'#d8b27a','rgba(150,96,44,1)','rgba(246,222,176,1)',{lines:90,wavy:3});}
      const team=p.c==='b'?0xb84a32:0x2a6d7d;
      const cap=new T.MeshPhysicalMaterial({color:0xffffff,map:_jWood.map,roughness:.4,clearcoat:.8,clearcoatRoughness:.2,envMapIntensity:.8});
      const side=new T.MeshPhysicalMaterial({color:_lin(team).lerp(new T.Color(0xffffff),0.0),roughness:.32,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1});
      const ch2 = p.t==='K'?NAME.K[p.c] : p.t==='P'?NAME.P[p.c] : NAME[p.t];
      const ft=jFace(ch2,p.c,256);
      const face=new T.MeshPhysicalMaterial({map:ft.map,bumpMap:ft.bump,bumpScale:0.025,roughness:.42,clearcoat:.75,clearcoatRoughness:.18,envMapIntensity:.8});
      const fgeo=new T.CircleGeometry(rad-bev+0.004,8,Math.PI/8);fgeo.rotateX(-Math.PI/2);fgeo.translate(0,dep+2*bev+0.0015,0);
      [cap,side,face].forEach(m=>{m.userData._lin=1;_keep.add(m);});[geo,fgeo,ft.map,ft.bump,_jWood.map].forEach(o=>_keep.add(o));
      _jg[key]={geo,fgeo,mats:[cap,side],face};
    }
    const d=_jg[key];const grp=new T.Group();
    const body=new T.Mesh(d.geo,d.mats);body.castShadow=true;body.receiveShadow=true;grp.add(body);
    const f=new T.Mesh(d.fgeo,d.face);f.receiveShadow=true;grp.add(f);
    return grp;
  }
  function pieceTexture(ch,col){return jFace(ch,col,192).map;}
  function draw(){
    if(!g3d||!g3d.ready()||!board)return;
    const T=g3d.THREE;
    g3d.clearPieces();g3d.clearMarks();
    g3d.beginPieces();let _o=0;
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=board[r][c];if(!p)continue;
      const {x,z}=g3d.toXZ(r,c);
      const grp=jPiece(T,p);
      const lifted=sel&&sel[0]===r&&sel[1]===c;
      grp.position.set(x,g3d.TOPY+(lifted?0.18:0),z);
      if(lifted)grp.rotation.z=0.06;
      const isDest=lastMove&&lastMove[2]===r&&lastMove[3]===c;
      g3d.addPiece(p.t+p.c+'@'+r+','+c,grp,{order:_o++,from:isDest?g3d.toXZ(lastMove[0],lastMove[1]):null,
        color:p.c==='b'?0xc0553a:0x2f7a8a,ghost:()=>jPiece(T,p)});
    }
    g3d.endPieces();
    // last-move squares + arrow
    if(lastMove){markSquare(lastMove[0],lastMove[1],0x3a86ff);markSquare(lastMove[2],lastMove[3],0x3a86ff);arrow3d(lastMove,0x3a86ff);}
    // hint
    if(hintMove){markSquare(hintMove[0],hintMove[1],0x2fd94a);arrow3d(hintMove,0x2fd94a);}
    if(badMove){markSquare(badMove[0],badMove[1],0xe23b3b);arrow3d(badMove,0xe23b3b);}
    // selection + legal dots
    if(sel){markSquare(sel[0],sel[1],0xe6c15c);
      const T2=g3d.THREE;
      legal.forEach(([r,c])=>{const {x,z}=g3d.toXZ(r,c);
        const occ=board[r][c];
        g3d.glowRing(x,z,occ?0xff6a3a:0x5fe07a,occ?{size:1.35,a:.95}:{disc:true,size:.46,a:.85,k:1.4,pulse:false});});}
  }
  function markSquare(r,c,color){
    const T=g3d.THREE;const {x,z}=g3d.toXZ(r,c);
    g3d.glowRing(x,z,color,{size:1.4});
  }
  function arrow3d(m,color){
    const T=g3d.THREE;const a=g3d.toXZ(m[0],m[1]),b=g3d.toXZ(m[2],m[3]);
    const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(len<0.1)return;
    const grp=new T.Group();
    const shaftLen=Math.max(0.05,len-0.4);
    const shaft=new T.Mesh(new T.BoxGeometry(shaftLen,0.05,0.1),new T.MeshBasicMaterial({color,transparent:true,opacity:.9}));
    shaft.position.x=shaftLen/2;grp.add(shaft);
    const head=new T.Mesh(new T.ConeGeometry(0.16,0.36,4),new T.MeshBasicMaterial({color,transparent:true,opacity:.9}));
    head.rotation.z=-Math.PI/2;head.position.x=shaftLen+0.18;grp.add(head);
    grp.position.set(a.x,0.42,a.z);grp.rotation.y=-Math.atan2(dz,dx);grp.children.forEach(ch=>{ch.material.opacity=.6;ch.scale.set(1,.5,.7);});
    grp.userData.pulse=true;grp.userData.base=0.9;
    grp.children.forEach(ch=>{ch.userData.pulse=true;ch.userData.base=0.9;});
    g3d.markGroup.add(grp);
  }
  function startPulse(){/* shared loop */}
  function click(r,c){
    const p=board[r][c];
    if(sel){const mv=legal.find(m=>m[0]===r&&m[1]===c);
      if(mv){doMove(sel[0],sel[1],r,c);return;}}
    if(p&&p.c===turn){sel=[r,c];legal=legalMoves(board,r,c);hintMove=null;SFX.select();draw();}
    else{sel=null;legal=[];draw();}
  }
  // CPU strength: depth cap, randomness (piece values ×10: 卒=200) and thinking time
  function aiConfig(){
    if(mode==='puzzle')return {maxDepth:64,noise:0,ms:900};
    if(mode==='arcade'||level>10){const t=Math.max(1,Math.min(10,level>10?level-10:stage||1));
      const T=[null,[1,400,250],[1,250,250],[2,150,300],[2,80,300],[3,40,400],[3,0,400],[4,0,700],[5,0,1000],[64,0,1400],[64,0,2000]][t];
      return {maxDepth:T[0],noise:T[1],ms:T[2]};}
    return [null,{maxDepth:1,noise:300,ms:300},{maxDepth:3,noise:0,ms:600},{maxDepth:64,noise:0,ms:1500}][level];
  }
  const ENC={K:1,A:2,E:3,H:4,R:5,C:6,P:7};
  async function engineMove(col,cfg){
    const bref=board,n0=history.length,flat=[];
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=board[r][c];flat.push(p?ENC[p.t]|(p.c==='b'?8:0):0);}
    const res=await JanggiAI.run('move',Object.assign({board:flat,side:col==='r'?0:8},cfg));
    if(board!==bref||history.length!==n0||over)return null;
    if(!res||res.error||res.move<0)return null;
    const f=res.move&127,t=res.move>>7,m=[(f/9)|0,f%9,(t/9)|0,t%9];
    if(!legalMoves(board,m[0],m[1]).some(x=>x[0]===m[2]&&x[1]===m[3]))return null;   // safety net
    return m;
  }
  async function cpuTurn(){
    if(over||!board||turn!=='b')return;
    const n0=history.length,bref=board;
    let m=await engineMove('b',aiConfig());
    if(over||board!==bref||history.length!==n0||turn!=='b')return;
    if(!m){const mv=allMoves(board,'b');if(!mv.length)return;m=mv[0];}
    doMove(m[0],m[1],m[2],m[3]);
  }
  async function hint(){
    if(over||!board)return;
    if(vsCPU()&&turn==='b')return;
    if(mode==='puzzle'){banner('문제에서는 힌트를 쓸 수 없어요');setTimeout(()=>{if(!over)hideBanner();},1400);return;}
    const n0=history.length;banner('💡 수를 읽는 중…');
    const m=await engineMove(turn,{maxDepth:64,noise:0,ms:1000});
    if(over||history.length!==n0){hideBanner();return;}
    if(m){hintMove=m;draw();startPulse();SFX.select();
      const p=board[m[0]][m[1]];banner('💡 추천: '+HAN[p.t]+' 이동');
      setTimeout(()=>{if(!over)hideBanner();},2000);}
  }
  function onlyRoyals(b,col){ // true if col has no attacking pieces (only K + advisors)
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=b[r][c];if(p&&p.c===col&&p.t!=='K'&&p.t!=='A')return false;}
    return true;
  }
  function materialDraw(b){ return onlyRoyals(b,'r')&&onlyRoyals(b,'b'); }
  function doMove(r,c,rr,cc){
    history.push(clone(board));mlog.push([r,c,rr,cc]);
    const wasCapture=!!board[rr][cc];
    board[rr][cc]=board[r][c];board[r][c]=null;
    lastMove=[r,c,rr,cc];sel=null;legal=[];hintMove=null;
    if(!replaying){if(wasCapture)SFX.capture();else SFX.move();}
    turn=turn==='r'?'b':'r';if(!replaying){draw();startPulse();}
    // check end
    const mv=allMoves(board,turn);
    if(!mv.length){over=true;endGame(turn);return;}
    if(materialDraw(board)){over=true;banner('빅장 — 무승부');
      if(mode==='puzzle'){endPuzzle(false);return;}
      if(!replaying){emit({result:'draw'});SFX.draw();}
      if(mode==='mail'&&!replaying){try{mail.hook&&mail.hook({moves:exportMoves(),over:true,won:null});}catch(e){}}
      if(mode==='arcade')setTimeout(showStageEnd,700);return;}
    if(mode==='puzzle'&&turn==='b'&&redMoves()>=puzzle.limit){over=true;status('문제 종료');endPuzzle(false,'limit');return;}
    if(mode==='mail'&&!replaying){mail.locked=true;status();try{mail.hook&&mail.hook({moves:exportMoves(),over:false});}catch(e){}return;}
    if(replaying)return;
    if(inCheck(board,turn)){status('장군!');SFX.check();}else status();
    if(!over&&vsCPU()&&turn==='b'){setTimeout(cpuTurn,mode==='puzzle'?450:300);}
  }
  let endHook=null; const emit=(info)=>{try{endHook&&endHook(Object.assign({mode,level,stage,plies:history?history.length:0},info));}catch(e){console.error(e);}};
  function redMoves(){return Math.ceil(mlog.length/2);}   // 초 ('r') moves first
  function endPuzzle(solved,why){
    const n=redMoves();
    if(solved){banner('외통! '+n+'수 만에 잡았어요 🎉');SFX.win();}
    else{banner(why==='limit'?puzzle.limit+'수 안에 외통을 만들지 못했어요':'아쉬워요… 다시 도전!');SFX.lose();}
    const cb=puzzle&&puzzle.onEnd; if(cb)setTimeout(()=>cb({solved,moves:n}),solved?900:700);
  }
  function endGame(loser){
    if(mode==='puzzle'){status('문제 종료');endPuzzle(loser==='b');return;}
    if(mode==='mail'){const won=loser!==mail.color;
      if(!replaying){emit({result:won?'win':'lose'});try{mail.hook&&mail.hook({moves:exportMoves(),over:true,won});}catch(e){}}
      banner((loser==='r'?'한':'초')+' 승리! 🏆');if(!replaying){won?SFX.win():SFX.lose();}return;}
    emit({result:mode==='pvp'?'pvp':(loser==='b'?'win':'lose')});
    // loser = side with no moves. 'r' = 초 (you), 'b' = 한 (CPU)
    const humanWon = (loser==='b'); // 한 can't move → you (초) won
    if(mode==='arcade'){
      lastCleared=humanWon;
      if(humanWon){
        if(stage>=stageCleared)stageCleared=Math.min(10,stage+1);
        const plies=history.length;if(stageBest[stage]===undefined||plies<stageBest[stage])stageBest[stage]=plies;saveProgress();
        banner('스테이지 '+stage+' 클리어! ⭐');SFX.win();
      } else {banner('스테이지 '+stage+' 실패… 다시 도전! ✊');SFX.lose();}
      setTimeout(showStageEnd,700);
    } else {
      banner((loser==='r'?'한(빨강)':'초(파랑)')+' 승리! 🏆');
      if(mode==='cpu'){ humanWon?SFX.win():SFX.lose(); } else { SFX.win(); }
    }
  }
  function status(msg){
    if(msg){document.getElementById('janggiStatus').textContent=msg;return;}
    let t;
    if(mode==='mail')t = over?'대국 종료':turn===mail.color?(mail.locked?'친구에게 수를 보내 주세요':'내 차례 ('+(mail.color==='r'?'초':'한')+')'):'친구 차례 — 수를 기다리는 중';
    else if(mode==='puzzle')t = over?'문제 종료':turn==='r'?'당신(초) 차례 · '+(puzzle.limit-redMoves())+'수 남음':'CPU가 막는 중…';
    else if(mode==='arcade')t = turn==='r'?'스테이지 '+stage+' · 당신(초)':'CPU 생각 중…';
    else t = (mode==='cpu')?(turn==='r'?'당신(초) 차례':'CPU 생각 중…'):(turn==='r'?'초 차례':'한 차례');
    document.getElementById('janggiStatus').textContent=t;
  }
  function banner(t){const b=document.getElementById('janggiWin');b.textContent=t;b.style.display='block';}
  function hideBanner(){document.getElementById('janggiWin').style.display='none';}
  function openSetup(){document.getElementById('janggiSetup').classList.remove('hidden');document.getElementById('janggiDiff').classList.add('hidden');document.getElementById('janggiStages').classList.add('hidden');document.getElementById('janggiStageEnd').style.display='none';}
  function chooseCPU(){document.getElementById('janggiDiff').classList.remove('hidden');document.getElementById('janggiStages').classList.add('hidden');}
  function openStages(){
    document.getElementById('janggiDiff').classList.add('hidden');
    document.getElementById('janggiStages').classList.remove('hidden');
    document.getElementById('janggiProgress').textContent='(최고 '+stageCleared+'단계)';
    const grid=document.getElementById('janggiStageGrid');grid.innerHTML='';
    for(let s=1;s<=10;s++){
      const cell2=document.createElement('div');
      cell2.className='scell'+(s<stageCleared?' cleared':'');
      const lv=stageLevel(s);const lvName=lv===1?'초급':lv===2?'중급':'고급';
      const rec=stageBest[s]!==undefined?(Math.ceil(stageBest[s]/2)+'수'):lvName;
      cell2.innerHTML=s+'<small>'+rec+'</small>';
      cell2.onclick=()=>startStage(s);
      grid.appendChild(cell2);
    }
  }
  function startStage(s){if(window.StoryGate&&!window.StoryGate(s,()=>startStage(s)))return;stage=s;start('arcade',stageLevel(s));}
  function showStageEnd(){
    const el=document.getElementById('janggiStageEnd');el.innerHTML='';
    if(lastCleared && stage<10){const nx=document.createElement('button');nx.textContent='다음 스테이지 ▶';nx.onclick=()=>{el.style.display='none';startStage(stage+1);};el.appendChild(nx);}
    const rp=document.createElement('button');rp.className='ghost';rp.textContent='다시 하기';rp.onclick=()=>{el.style.display='none';startStage(stage);};el.appendChild(rp);
    const mn=document.createElement('button');mn.className='ghost';mn.textContent='스테이지 선택';mn.onclick=()=>{el.style.display='none';openSetup();openStages();};el.appendChild(mn);
    el.style.display='flex';
  }
  function start(m,lv){if(!g3d)setupCanvas();mode=m;level=lv||2;board=fresh();turn='r';history=[];mlog=[];badMove=null;review=null;if(m!=='puzzle')puzzle=null;if(m!=='mail')mail=null;over=false;sel=null;legal=[];lastMove=null;hintMove=null;hideBanner();
    document.getElementById('janggiSetup').classList.add('hidden');document.getElementById('janggiStageEnd').style.display='none';draw();status();
    if(m==='cpu'||m==='arcade')try{window.Characters&&Characters.onPlay&&Characters.onPlay();}catch(e){}}
  function restart(){if(!mode){openSetup();return;} if(mode==='mail')return; if(mode==='puzzle'){startPuzzle(puzzle.code,puzzle.limit,puzzle.onEnd);return;} if(mode==='arcade')startStage(stage); else start(mode,level);}
  function undo(){if(review)return;document.getElementById('janggiStageEnd').style.display='none';if(!history.length)return;
    if(mode==='mail'){if(!mail.locked||over)return;board=history.pop();mlog.pop();turn=mail.color;mail.locked=false;sel=null;legal=[];
      lastMove=mlog.length?mlog[mlog.length-1].slice():null;try{mail.hook&&mail.hook({moves:exportMoves(),over:false,undo:true});}catch(e){}draw();status();return;}
    over=false;hideBanner();hintMove=null;
    const cpu=vsCPU();let idx;
    do{idx=history.length-1;board=history.pop();mlog.pop();}while(cpu&&idx%2===1&&history.length);
    turn = vsCPU()?'r':(turn==='r'?'b':'r');sel=null;legal=[];
    lastMove=null;draw();status();}
  const encM=m=>(m[0]*9+m[1])*90+m[2]*9+m[3], decM=v=>{const f=(v/90)|0,t=v%90;return [(f/9)|0,f%9,(t/9)|0,t%9];};
  function exportMoves(){return mlog.map(encM);}
  function startMail(moves,myColor,hook){
    mail={color:myColor,locked:false,hook};start('mail',2);replaying=true;
    try{for(const v of moves){if(over)break;const m=decM(v);if(!legalMoves(board,m[0],m[1]).some(x=>x[0]===m[2]&&x[1]===m[3]))break;doMove(m[0],m[1],m[2],m[3]);}}
    finally{replaying=false;}
    mail.locked=!over&&turn!==myColor;draw();status();
  }
  const DEC='0KAEHRCP';
  function fromCode(code){ // 90 hex digits: piece | 8 for 한(b)
    const b=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    for(let i=0;i<90;i++){const v=parseInt(code[i],16);if(!v)continue;b[(i/9)|0][i%9]={t:DEC[v&7],c:v&8?'b':'r'};}
    return b;
  }
  function startPuzzle(code,limit,onEnd){
    puzzle={code,limit,onEnd};start('puzzle',3);board=fromCode(code);turn='r';draw();status();
    banner('초(아래)로 '+limit+'수 안에 외통을 만드세요');setTimeout(()=>{if(!over&&!mlog.length)hideBanner();},2400);
  }
  const ENCB=b=>{const flat=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=b[r][c];flat.push(p?ENC[p.t]|(p.c==='b'?8:0):0);}return flat;};
  const toW=m=>(m[0]*9+m[1])|((m[2]*9+m[3])<<7);
  function reviewData(){
    const me=mode==='mail'?mail.color:'r';
    return {game:'janggi',me,mode,moves:mlog.map((m,i)=>{const side=i%2===0?'r':'b';return {board:ENCB(history[i]),side:side==='r'?0:8,played:toW(m),mine:side===me};})};
  }
  function showReview(i,best,played){
    if(!review)review={board,lastMove};
    const h=history[i];if(!h)return;board=clone(h);sel=null;legal=[];lastMove=null;
    const dec=w=>w<0?null:[((w&127)/9)|0,(w&127)%9,((w>>7)/9)|0,(w>>7)%9];
    hintMove=dec(best);badMove=dec(played);draw();
  }
  function endReview(){if(!review)return;board=review.board;lastMove=review.lastMove;hintMove=null;badMove=null;review=null;draw();}
  function markHint(w){if(w<0)return;hintMove=[((w&127)/9)|0,(w&127)%9,((w>>7)/9)|0,(w>>7)%9];draw();}
  return {markHint,startMail,startPuzzle,exportMoves,reviewData,showReview,endReview,
    pick:(r,c)=>{if(over||!board||review)return;if(vsCPU()&&turn==='b')return;if(mode==='mail'&&(turn!==mail.color||mail.locked))return;click(r,c);},
    board:()=>board&&ENCB(board),
    onEnd:(f)=>{endHook=f;},state:()=>({mode,level,stage,over,turn,plies:history?history.length:0,mail:mail&&{color:mail.color,locked:mail.locked}}),ensure,openSetup,chooseCPU,openStages,hint,start,restart,undo,zoom:(d)=>g3d&&g3d.zoom(d*1.2),resetView:()=>{if(g3d){g3d.resetView();const b=document.getElementById("janggi2dBtn");if(b)b.textContent="2D 보기";}},toggle2D:()=>{if(!g3d)return;const on=g3d.toggle2D();const b=document.getElementById("janggi2dBtn");if(b)b.textContent=on?"3D 보기":"2D 보기";},setActive:(v)=>g3d&&g3d.setActive(v)};
})();
