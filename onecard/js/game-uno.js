/* ================= 원카드 (잼 오피스) — internal id stays 'uno' ================= */
const Uno=(function(){
  const COLORS=['red','yellow','green','blue'];
  // deeper, less glaring card colors so white symbols stay readable
  // 잼 오피스 원카드: 4 colors = 4 departments, each with its own icon (readable without color)
  const COLOR_HEX={red:0xe0604f,yellow:0xd49a1c,green:0x1f9e8a,blue:0x34519c,wild:0x2b2a33};
  const COLOR_CSS={red:'#e0604f',yellow:'#d49a1c',green:'#1f9e8a',blue:'#34519c'};
  const DEPT={red:'영업팀',yellow:'인사팀',green:'개발팀',blue:'기획팀'};
  const DEPT_IC={red:'📈',yellow:'🤝',green:'💻',blue:'📋'};
  const SPECIAL={skip:{ic:'🏖️',t:'반차'},reverse:{ic:'↩️',t:'반려'},draw2:{ic:'📎',t:'추가 업무'},wild:{ic:'🔀',t:'부서 이동'},wild4:{ic:'🌙',t:'야근 폭탄'}};
  function buildDeck(){
    const deck=[];
    COLORS.forEach(col=>{
      deck.push({color:col,type:'num',value:0});
      for(let v=1;v<=9;v++){deck.push({color:col,type:'num',value:v});deck.push({color:col,type:'num',value:v});}
      ['skip','reverse','draw2'].forEach(t=>{deck.push({color:col,type:t});deck.push({color:col,type:t});});
    });
    for(let i=0;i<4;i++){deck.push({color:'wild',type:'wild'});deck.push({color:'wild',type:'wild4'});}
    if(RULES.bomb)for(let i=0;i<4;i++)deck.push({color:'wild',type:'wild4'});   // 야근 폭탄 데이
    return deck;
  }
  function shuffle(deck){
    const d=deck.slice();
    for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
    return d;
  }
  function canPlay(card,top,activeColor){
    if(card.color==='wild')return true;
    if(card.color===activeColor)return true;
    if(top.type==='num'&&card.type==='num'&&card.value===top.value)return true;
    if(top.type===card.type && top.type!=='num')return true;
    return false;
  }
  function cardLabel(c){
    if(c.type==='num')return String(c.value);
    if(c.type==='skip')return '반차';
    if(c.type==='reverse')return '반려';
    if(c.type==='draw2')return '+2';
    if(c.type==='wild')return '이동';
    if(c.type==='wild4')return '+4';
    return '?';
  }

  // 하우스룰: stack = 추가 업무/야근 폭탄 받아치기, seven = 7 내면 가장 적게 든 사람과 손패 교환, zero = 0 내면 모두 옆으로 넘기기
  const RULES={stack:true,seven:false,zero:false,bomb:false};
  try{Object.assign(RULES,JSON.parse(localStorage.getItem('uno_rules')||'{}'));RULES.bomb=false;}catch(e){}
  let pend=0, pendType=null;     // stacked draw penalty waiting for the next player
  let numPlayers=2;          // includes me (seat 0)
  let hands=[];               // hands[seat] = [cards]
  let drawPile=[], discardPile=[];
  let turn=0, dir=1, activeColor=null, over=false, mode=null;
  let mustCallUno=false, unoCalledBy=new Set();
  let g3d=null, ready=false, view2D=false;

  function ensure(){ if(ready)return; setupScene(); loadProgress(); openSetup(); ready=true; }

  // ---------- 3D scene (implements the shared-renderer instance contract) ----------
  let scene,camera,raycaster,mouse,tableGroup,cardGroup,markGroup;
  const CAMRAD=9.5;
  // NOTE: cam.tgt is created lazily in setupScene() — THREE isn't loaded yet when this
  // module's top-level code runs (Three.js loads in a later <script> tag), so constructing
  // a THREE.Vector3 here would throw "THREE is not defined".
  let cam={theta:0,phi:0.85,rad:CAMRAD,tgt:null};
  const DEF={theta:0,phi:0.85,rad:CAMRAD};
  let smPhi,smTheta;
  let inited=false;

  function setupScene(){
    const mount=document.getElementById('unoMount');
    _sharedRenderer(); // ensure the shared renderer exists (shared with omok/janggi/baduk)
    if(!cam.tgt) cam.tgt=new THREE.Vector3(0,0,0);
    scene=new THREE.Scene();
    const bgcv=document.createElement('canvas');bgcv.width=16;bgcv.height=256;
    const bx=bgcv.getContext('2d');const bg=bx.createLinearGradient(0,0,0,256);
    bg.addColorStop(0,'#1c2230');bg.addColorStop(0.55,'#121620');bg.addColorStop(1,'#07080c');
    bx.fillStyle=bg;bx.fillRect(0,0,16,256);
    scene.background=new THREE.CanvasTexture(bgcv);
    scene.fog=new THREE.Fog(0x0b0d12,16,32);
    scene.environment=makeStudioEnv(_R,{top:'#cfd6e2',mid:'#5d6676',mid2:'#2b2622',bottom:'#100d0b',key:1.8,side:1.1,side2:.8});
    camera=new THREE.PerspectiveCamera(42,(mount.clientWidth||600)/(mount.clientHeight||500),0.1,200);
    scene.add(new THREE.AmbientLight(0xffffff,.22));
    scene.add(new THREE.HemisphereLight(0xdfeaff,0x2a1e14,.35));
    // warm lamp over the table: a soft pool of light that falls off toward the rim
    const lamp=new THREE.SpotLight(0xfff0d8,1.6,40,0.62,0.55,1.2);lamp.position.set(1.5,15,3);lamp.target.position.set(0,0,0);
    lamp.castShadow=true;lamp.shadow.mapSize.set(2048,2048);lamp.shadow.bias=-0.0004;lamp.shadow.radius=4;
    scene.add(lamp);scene.add(lamp.target);
    const fill=new THREE.DirectionalLight(0xcfe0ff,.3);fill.position.set(-6,7,-5);scene.add(fill);
    const pad=new THREE.Mesh(new THREE.CircleGeometry(30,48),new THREE.MeshStandardMaterial({color:0x14110e,roughness:1}));
    pad.rotation.x=-Math.PI/2;pad.position.y=-0.56;pad.receiveShadow=true;scene.add(pad);
    tableGroup=new THREE.Group();scene.add(tableGroup);
    cardGroup=new THREE.Group();scene.add(cardGroup);
    markGroup=new THREE.Group();scene.add(markGroup);
    buildTable();
    raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
    inited=true;
    window.addEventListener('resize',onResize);
  }
  function makeFeltTexture(){
    // one texture over the whole round top (cylinder caps map radially), so the vignette is centered
    const S=1024,cv=document.createElement('canvas');cv.width=cv.height=S;const cx=cv.getContext('2d');
    const g=cx.createRadialGradient(S/2,S/2,40,S/2,S/2,S/2);
    g.addColorStop(0,'#2d4a6b');g.addColorStop(0.6,'#223a56');g.addColorStop(1,'#132236');   // 회의실 테이블 (navy felt)
    cx.fillStyle=g;cx.fillRect(0,0,S,S);
    // woven nap: thousands of tiny light/dark fibres
    for(let i=0;i<26000;i++){const x=Math.random()*S,y=Math.random()*S;
      cx.fillStyle=Math.random()>0.5?'rgba(0,0,0,0.16)':'rgba(160,190,230,0.06)';cx.fillRect(x,y,1.4,1.4);}
    // printed play ring + faint wordmark, like a real game table
    cx.strokeStyle='rgba(230,214,160,0.32)';cx.lineWidth=5;cx.beginPath();cx.arc(S/2,S/2,S*0.215,0,Math.PI*2);cx.stroke();
    cx.lineWidth=2;cx.beginPath();cx.arc(S/2,S/2,S*0.235,0,Math.PI*2);cx.stroke();
    cx.save();cx.translate(S/2,S/2);cx.fillStyle='rgba(230,214,160,0.13)';cx.font='900 64px "Pretendard Variable","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
    cx.textAlign='center';cx.textBaseline='middle';
    ['잼 원카드','잼 원카드','잼 원카드','잼 원카드'].forEach((t,k)=>{cx.save();cx.rotate(k*Math.PI/2);cx.fillText(t,0,-S*0.33);cx.restore();});
    cx.restore();
    const tex=new THREE.CanvasTexture(cv);tex.anisotropy=8;
    return tex;
  }
  function makeRimWoodTexture(){
    const cv=document.createElement('canvas');cv.width=1024;cv.height=64;const cx=cv.getContext('2d');
    cx.fillStyle='#4a2c1a';cx.fillRect(0,0,1024,64);
    for(let i=0;i<220;i++){const x=Math.random()*1024,w=0.6+Math.random()*2.6;
      cx.fillStyle=Math.random()>0.5?'rgba(20,10,4,0.5)':'rgba(140,90,55,0.35)';cx.globalAlpha=0.3+Math.random()*0.5;cx.fillRect(x,0,w,64);}
    cx.globalAlpha=1;
    const tex=new THREE.CanvasTexture(cv);
    tex.wrapS=THREE.RepeatWrapping;tex.repeat.set(8,1);tex.anisotropy=8;
    return tex;
  }
  function buildTable(){
    const felt=new THREE.Mesh(new THREE.CylinderGeometry(6.2,6.2,0.3,96),
      [new THREE.MeshStandardMaterial({color:0x123d26,roughness:1}),
       new THREE.MeshStandardMaterial({map:makeFeltTexture(),roughness:.95,metalness:0,envMapIntensity:.25}),
       new THREE.MeshStandardMaterial({color:0x123d26,roughness:1})]);
    felt.position.y=-0.15;felt.receiveShadow=true;tableGroup.add(felt);
    // padded walnut rail
    const rim=new THREE.Mesh(new THREE.TorusGeometry(6.32,0.3,24,128),
      new THREE.MeshStandardMaterial({map:makeRimWoodTexture(),roughness:.32,metalness:0,envMapIntensity:.9}));
    rim.rotation.x=Math.PI/2;rim.position.y=-0.06;rim.scale.z=0.72;rim.castShadow=true;rim.receiveShadow=true;tableGroup.add(rim);
    // brass bead where the felt meets the rail
    const bead=new THREE.Mesh(new THREE.TorusGeometry(6.02,0.035,10,128),
      new THREE.MeshStandardMaterial({color:0xc9a24e,metalness:1,roughness:.28}));
    bead.rotation.x=Math.PI/2;bead.position.y=0.005;tableGroup.add(bead);
    // pedestal under the table so it doesn't float
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(5.6,5.9,0.5,64),new THREE.MeshStandardMaterial({color:0x22150d,roughness:.6}));
    ped.position.y=-0.55;ped.receiveShadow=true;tableGroup.add(ped);
  }
  // ---------- card rendering ----------
  // Everything here is cached: textures, materials and geometry are created once and reused, so redrawing
  // the table after every move allocates nothing new on the GPU.
  const CARD_W=0.62, CARD_H=0.9, CARD_T=0.03;
  const faceTexCache={}, faceMatCache={};
  let bodyGeo=null, faceGeo=null, bodyMat=null, backTex=null;
  function roundRectPath(cx,x,y,w,h,r){
    cx.beginPath();cx.moveTo(x+r,y);cx.lineTo(x+w-r,y);cx.quadraticCurveTo(x+w,y,x+w,y+r);
    cx.lineTo(x+w,y+h-r);cx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);cx.lineTo(x+r,y+h);
    cx.quadraticCurveTo(x,y+h,x,y+h-r);cx.lineTo(x,y+r);cx.quadraticCurveTo(x,y,x+r,y);cx.closePath();
  }
  function newCardCanvas(){
    // Design space is 512x736; the canvas is 0.75x that (384x552): sharp on phones, ~45% less memory than full size.
    const cv=document.createElement('canvas');cv.width=384;cv.height=552;
    const cx=cv.getContext('2d');cx.scale(0.75,0.75);
    return {cv,cx,W:512,H:736};
  }
  function finishTexture(cv){
    const tex=new THREE.CanvasTexture(cv);
    tex.anisotropy=4;
    return tex;
  }
  const FONT='"Pretendard Variable",Pretendard,"Apple SD Gothic Neo","Noto Sans KR",sans-serif';
  function makeFaceTexture(card){
    const key=card.color+'|'+card.type+'|'+(card.value===undefined?'':card.value);
    if(faceTexCache[key])return faceTexCache[key];
    const {cv,cx,W,H}=newCardCanvas();
    const isWild=card.color==='wild';
    const hex=isWild?'#2b2a33':COLOR_CSS[card.color];
    const sp=SPECIAL[card.type];
    // paper
    cx.fillStyle=isWild?'#2b2a33':'#f7f1e3';roundRectPath(cx,0,0,W,H,40);cx.fill();
    if(!isWild){ cx.strokeStyle='rgba(60,45,20,.18)';cx.lineWidth=6;roundRectPath(cx,10,10,W-20,H-20,32);cx.stroke(); }
    // department band (top) — wild cards get four small department chips instead
    if(isWild){
      ['red','yellow','green','blue'].forEach((c,i)=>{cx.fillStyle=COLOR_CSS[c];roundRectPath(cx,48+i*108,46,92,40,12);cx.fill();});
    } else {
      cx.save();roundRectPath(cx,10,10,W-20,H-20,32);cx.clip();cx.fillStyle=hex;cx.fillRect(10,10,W-20,128);cx.restore();
      cx.fillStyle='#fff';cx.font='800 52px '+FONT;cx.textAlign='left';cx.textBaseline='middle';
      cx.fillText(DEPT_IC[card.color]+' '+DEPT[card.color],44,76);
    }
    cx.textAlign='center';cx.textBaseline='middle';
    if(card.type==='num'){
      cx.fillStyle=hex;cx.font='900 330px '+FONT;cx.fillText(String(card.value),W/2,H/2+50);
      // underline so 6/9 read correctly
      if(card.value===6||card.value===9){cx.fillRect(W/2-70,H/2+210,140,16);}
    } else {
      cx.font='190px '+FONT;cx.fillText(sp.ic,W/2,H/2+10);
      cx.fillStyle=isWild?'#f7f1e3':hex;cx.font='900 '+(sp.t.length>3?74:88)+'px '+FONT;cx.fillText(sp.t,W/2,H/2+180);
      if(card.type==='draw2'||card.type==='wild4'){cx.font='900 96px '+FONT;cx.fillStyle=isWild?'#ffd76a':hex;cx.fillText(card.type==='draw2'?'+2':'+4',W/2,H/2-170);}
    }
    // corner index (bottom-right, rotated) like a real card
    const lab=cardLabel(card);
    cx.save();cx.translate(W-48,H-40);cx.rotate(Math.PI);cx.fillStyle=isWild?'#f7f1e3':hex;cx.font='900 '+(lab.length>1?60:84)+'px '+FONT;cx.textAlign='left';cx.textBaseline='top';cx.fillText(lab,0,0);cx.restore();
    return faceTexCache[key]=finishTexture(cv);
  }
  // Card back: a navy company folder with the 잼 원카드 stamp
  function makeBackTexture(){
    if(backTex)return backTex;
    const {cv,cx,W,H}=newCardCanvas();
    cx.fillStyle='#1d2742';roundRectPath(cx,0,0,W,H,40);cx.fill();
    cx.strokeStyle='rgba(255,215,120,.55)';cx.lineWidth=8;roundRectPath(cx,26,26,W-52,H-52,28);cx.stroke();
    cx.strokeStyle='rgba(255,255,255,.05)';cx.lineWidth=3;for(let y=60;y<H-40;y+=34){cx.beginPath();cx.moveTo(44,y);cx.lineTo(W-44,y);cx.stroke();}
    cx.save();cx.translate(W/2,H/2);cx.rotate(-0.18);
    cx.strokeStyle='#e0604f';cx.lineWidth=12;cx.beginPath();cx.arc(0,0,150,0,Math.PI*2);cx.stroke();
    cx.fillStyle='#e0604f';cx.textAlign='center';cx.textBaseline='middle';
    cx.font='900 120px '+FONT;cx.fillText('잼',0,-28);cx.font='900 54px '+FONT;cx.fillText('원카드',0,62);
    cx.restore();
    return backTex=finishTexture(cv);
  }
  function getCardGeos(){
    if(bodyGeo)return;
    // Card body is a rounded slab whose outline matches the rounded corners painted on the face texture,
    // so no square corners poke out past the artwork.
    const w=CARD_W,h=CARD_H,r=0.0533;
    const s=new THREE.Shape();
    s.moveTo(-w/2+r,-h/2);
    s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
    s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
    s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    bodyGeo=new THREE.ExtrudeGeometry(s,{depth:CARD_T,bevelEnabled:true,bevelThickness:0.002,bevelSize:0.003,bevelSegments:2,curveSegments:8});
    bodyGeo.translate(0,0,-CARD_T/2);
    bodyGeo.rotateX(-Math.PI/2);
    faceGeo=new THREE.PlaneGeometry(w,h);
    faceGeo.rotateX(-Math.PI/2);
    bodyMat=new THREE.MeshStandardMaterial({color:0xf2efe6,roughness:.42,envMapIntensity:.6});
  }
  function getFaceMaterial(card,faceUp){
    const key=faceUp?(card.color+'|'+card.type+'|'+(card.value===undefined?'':card.value)):'back';
    if(faceMatCache[key])return faceMatCache[key];
    const tex=faceUp?makeFaceTexture(card):makeBackTexture();
    // Plain map + a faint flat emissive keeps colors true to the texture instead of washing them out
    // (an emissiveMap re-adds the same texture on top of the base color, which double-brightens it
    // toward white — that's what made the card art look pale and smeared).
    // polygonOffset pushes this face's depth value slightly toward the camera at render time
    // (independent of its actual world position), so it never z-fights with the card body right
    // beneath it, or with a neighboring card's body when several cards sit close together in a stack.
    // Unlit: the card art shows its true colors instead of being washed out by the table lights.
    return faceMatCache[key]=new THREE.MeshBasicMaterial({map:tex,color:0xe2e2e2,
      polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  }
  function cardMesh(card,faceUp){
    getCardGeos();
    const g=new THREE.Group();
    const body=new THREE.Mesh(bodyGeo,bodyMat);body.castShadow=true;body.receiveShadow=true;g.add(body);
    const face=new THREE.Mesh(faceGeo,getFaceMaterial(card,faceUp));
    face.position.y=CARD_T/2+0.006;face.receiveShadow=true;g.add(face);
    return g;
  }
  // seat positions around the table for 2/3/4 players (seat 0 = me, always nearest/front)
  function seatPos(seat,n){
    const radius=4.2;
    const angleFor = { 2:[Math.PI/2, -Math.PI/2],
                        3:[Math.PI/2, Math.PI/2+2*Math.PI/3, Math.PI/2-2*Math.PI/3],
                        4:[Math.PI/2, Math.PI, -Math.PI/2, 0] }[n];
    const a=angleFor[seat];
    return {x:Math.cos(a)*radius, z:-Math.sin(a)*radius, angle:a};
  }
  // deterministic per-index jitter so piles look tossed but never jump around between redraws
  const jit=(k,salt)=>{const x=Math.sin(k*12.9898+salt*78.233)*43758.5453;return x-Math.floor(x)-0.5;};
  const PILE_SCALE=1.35, DISC_X=-0.55, DRAW_X=0.85;
  let lastPlay=null;        // {seat, n, t}: the card that is currently flying to the pile
  const animated=[];        // meshes animating this frame
  function seatOrigin(seat){
    if(seat===0)return {x:0,z:5.6};
    const p=seatPos(seat,numPlayers);return {x:p.x,z:p.z};
  }
  const plateCache={};
  function namePlate(text,active){
    const key=text+'|'+active;
    let tex=plateCache[key];
    if(!tex){
      const cv=document.createElement('canvas');cv.width=512;cv.height=128;const cx=cv.getContext('2d');
      cx.fillStyle=active?'rgba(201,151,0,0.95)':'rgba(10,12,16,0.78)';
      roundRectPath(cx,8,14,496,100,50);cx.fill();
      cx.lineWidth=5;cx.strokeStyle=active?'#fff2b0':'rgba(255,255,255,0.25)';cx.stroke();
      cx.fillStyle=active?'#241a00':'#f3ecdc';cx.font='800 58px "Helvetica Neue",Arial,sans-serif';
      cx.textAlign='center';cx.textBaseline='middle';cx.fillText(text,256,66);
      tex=plateCache[key]=new THREE.CanvasTexture(cv);
    }
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,transparent:true}));
    sp.scale.set(2.6,0.65,1);sp.renderOrder=10;
    return sp;
  }
  function draw(){
    if(!inited||!hands.length)return;
    while(cardGroup.children.length)cardGroup.remove(cardGroup.children[0]);
    while(markGroup.children.length){const o=markGroup.children[0];markGroup.remove(o);if(o.material&&o.material.dispose&&o.isSprite)o.material.dispose();}
    animated.length=0;
    // discard pile: the actual previous cards, face up, each tossed at its own angle
    let topY=0.03;
    if(discardPile.length){
      const n=discardPile.length,under=Math.min(5,n-1);
      for(let k=under;k>=1;k--){
        const idx=n-1-k,card=discardPile[idx];
        const m=cardMesh(card,true);m.scale.setScalar(PILE_SCALE);
        m.position.set(DISC_X+jit(idx,1)*0.35,0.03+(under-k)*0.045,jit(idx,2)*0.3);m.rotation.y=jit(idx,3)*1.4;
        cardGroup.add(m);
      }
      topY=0.03+under*0.045;
      const top=discardPile[n-1],m=cardMesh(top,true);m.scale.setScalar(PILE_SCALE);
      const to={x:DISC_X,y:topY,z:0,ry:jit(n-1,3)*0.5};
      m.position.set(to.x,to.y,to.z);m.rotation.y=to.ry;
      if(lastPlay&&lastPlay.n===n){
        const o=seatOrigin(lastPlay.seat);
        m.userData.anim={from:{x:o.x,y:0.6,z:o.z,ry:to.ry+(lastPlay.seat===0?0:Math.PI)},to,t0:lastPlay.t,dur:420};
        animated.push(m);applyAnim(m,performance.now());
      }
      cardGroup.add(m);
    }
    // draw pile: a proper thick deck
    const deckN=Math.min(14,Math.ceil(drawPile.length/5));
    for(let i=0;i<deckN;i++){
      const m=cardMesh({},false);m.scale.setScalar(PILE_SCALE*0.95);
      m.position.set(DRAW_X+jit(i,5)*0.02,0.03+i*0.035,jit(i,6)*0.02);m.rotation.y=jit(i,7)*0.04;cardGroup.add(m);
    }
    // glowing ring in the current color around the discard pile
    if(activeColor){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(0.78,0.045,12,48),
        new THREE.MeshBasicMaterial({color:COLOR_HEX[activeColor],transparent:true,opacity:.9}));
      ring.rotation.x=-Math.PI/2;ring.position.set(DISC_X,0.02,0);ring.userData.pulse=true;markGroup.add(ring);
      const glow=new THREE.Mesh(new THREE.CircleGeometry(1.05,48),
        new THREE.MeshBasicMaterial({color:COLOR_HEX[activeColor],transparent:true,opacity:.18,depthWrite:false}));
      glow.rotation.x=-Math.PI/2;glow.position.set(DISC_X,0.004,0);markGroup.add(glow);
    }
    renderHand();
    // other players: a fanned hand facing the center, plus a nameplate behind it
    for(let s=1;s<numPlayers;s++){
      const pos=seatPos(s,numPlayers);
      const cnt=hands[s]?hands[s].length:0,shown=Math.min(cnt,10);
      const tx=Math.cos(pos.angle+Math.PI/2),tz=Math.sin(pos.angle+Math.PI/2);   // along the seat
      const ix=-Math.cos(pos.angle),iz=Math.sin(pos.angle);                       // toward the center
      for(let i=0;i<shown;i++){
        const t=i-(shown-1)/2;
        const m=cardMesh({},false);
        m.position.set(pos.x+tx*t*0.24+ix*(-Math.abs(t)*0.035),0.02+i*0.045,pos.z-tz*t*0.24+iz*(-Math.abs(t)*0.035));
        m.rotation.y=pos.angle+Math.PI/2-t*0.09;
        cardGroup.add(m);
      }
      const plate=namePlate(seatName(s)+' · '+cnt+'장',turn===s&&!over);
      plate.position.set(pos.x+ix*1.05,0.7,pos.z+iz*1.05);markGroup.add(plate);   // just inside the fan, readable on phones
    }
  }
  function applyAnim(m,now){
    const a=m.userData.anim;if(!a)return false;
    let k=Math.min(1,(now-a.t0)/a.dur);const e=1-Math.pow(1-k,3);
    m.position.set(a.from.x+(a.to.x-a.from.x)*e,a.from.y+(a.to.y-a.from.y)*e+Math.sin(k*Math.PI)*0.9,a.from.z+(a.to.z-a.from.z)*e);
    m.rotation.y=a.from.ry+(a.to.ry-a.from.ry)*e;
    m.rotation.z=Math.sin(k*Math.PI)*0.25;
    if(k>=1){m.userData.anim=null;m.rotation.z=0;}
    return k<1;
  }
  function animateFrame(){
    const now=performance.now();
    for(let i=animated.length-1;i>=0;i--){if(!applyAnim(animated[i],now))animated.splice(i,1);}
    const pulse=0.65+0.3*Math.sin(now*0.004);
    markGroup.children.forEach(o=>{if(o.userData&&o.userData.pulse&&o.material)o.material.opacity=pulse;});
  }

  // ---------- my hand as large, readable HTML cards (no overlapping) ----------
  function renderHand(){
    const el=document.getElementById('unoHand');if(!el)return;
    const my=hands[0]||[],mine=turn===0&&!over;
    el.innerHTML='';
    my.forEach((card,i)=>{
      const d=document.createElement('button');
      const label=cardLabel(card);
      let cls='uc '+card.color;
      if(mine){const ok=(!drewThisTurn||card===drawnCard)&&isLegal(card,my);cls+=ok?' ok':' no';}
      if(i===hintIdx)cls+=' hint';
      d.className=cls;
      d.setAttribute('aria-label',cardName(card));
      const sp=SPECIAL[card.type];
      d.innerHTML=(card.color==='wild'?'<em class="chips"><i></i><i></i><i></i><i></i></em>':'<em>'+DEPT_IC[card.color]+'</em>')+(sp?'<span class="sym sp"><i>'+sp.ic+'</i>'+(card.type==='draw2'||card.type==='wild4'?'<b>'+label+'</b>':'')+'<small>'+sp.t+'</small></span>':'<span class="sym">'+label+'</span>')+'<small class="br">'+label+'</small>';
      d.onclick=()=>onCardClick(i);
      el.appendChild(d);
    });
    const top=discardPile[discardPile.length-1],info=document.getElementById('unoTop');
    if(info&&top)info.innerHTML='맨 위 <b>'+cardName(top)+'</b> · 지금 부서 <b style="color:'+(COLOR_CSS[activeColor]||'#fff')+';filter:brightness(1.35)">'+DEPT_IC[activeColor]+' '+COLOR_KO[activeColor]+'</b>';
  }
  function onResize(){ if(_activeInst!==api)return; const mount=document.getElementById('unoMount'); const w=mount.clientWidth,h=mount.clientHeight; if(!w||!h)return; camera.aspect=w/h; camera.updateProjectionMatrix(); if(_R)_R.setSize(w,h); }

  // ---------- shared-renderer contract ----------
  function _dragRotate(dxp,dyp){ if(view2D)return; userTilted=true; cam.theta-=dxp*0.008; cam.phi=Math.max(0.2,Math.min(1.3,cam.phi-dyp*0.006)); }
  function _pickAt(clientX,clientY){
    const rect=_R.domElement.getBoundingClientRect();
    mouse.x=((clientX-rect.left)/rect.width)*2-1;mouse.y=-((clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouse,camera);
    const hits=raycaster.intersectObjects(cardGroup.children,true);
    if(!hits.length)return;
    let obj=hits[0].object; while(obj&&obj.userData.handIndex===undefined&&obj.parent)obj=obj.parent;
    if(obj&&obj.userData.handIndex!==undefined) onCardClick(obj.userData.handIndex);
    else onDrawPileClick(hits[0].point);
  }
  function onDrawPileClick(point){
    if(point && point.x>0.2) drawCard();
  }
  let zoomAdj=0, userTilted=false;
  const portrait=()=>(camera&&camera.aspect||1)<0.85;
  // distance at which the whole table (radius ≈ 6.5 incl. rim) fits the screen width and height
  function fitRad(){
    const a=camera.aspect||1,vf=camera.fov*Math.PI/360,hf=Math.atan(Math.tan(vf)*a);
    const R=6.5,dH=R/Math.tan(hf)*1.04,dV=R*(portrait()?0.95:0.8)/Math.tan(vf)/0.62;
    return Math.max(dH,dV);
  }
  function _zoom(d){ const f=fitRad(); zoomAdj=Math.max(-f*0.45,Math.min(10,zoomAdj+d)); }
  function resetView(){ cam.theta=DEF.theta;cam.phi=portrait()?0.5:DEF.phi;zoomAdj=0;userTilted=false; view2D=false; }
  function toggle2D(){ view2D=!view2D; return view2D; }
  function updateCam(){
    const tgtPhi=view2D?0.0001:cam.phi, tgtTheta=view2D?0:cam.theta;
    smPhi=smPhi===undefined?cam.phi:smPhi+(tgtPhi-smPhi)*0.15;
    smTheta=smTheta===undefined?cam.theta:smTheta+(tgtTheta-smTheta)*0.15;
    if(!userTilted&&!view2D)cam.phi=portrait()?0.5:DEF.phi;
    cam.rad=fitRad()+zoomAdj;
    if(scene.fog){scene.fog.near=cam.rad+6;scene.fog.far=cam.rad+40;}
    const phi=smPhi,theta=smTheta;
    const framing=0.35;
    const tz=cam.tgt.z-framing;
    camera.position.set(cam.tgt.x+cam.rad*Math.sin(phi)*Math.sin(theta), cam.tgt.y+cam.rad*Math.cos(phi), tz+cam.rad*Math.sin(phi)*Math.cos(theta));
    camera.up.set(0,1,0);camera.lookAt(cam.tgt.x,cam.tgt.y,tz);
  }
  function _tick(){ updateCam(); animateFrame(); }
  function activate(){
    if(!inited)setupScene();
    _activeInst=api;
    if(_R.domElement.parentNode!==document.getElementById('unoMount'))document.getElementById('unoMount').appendChild(_R.domElement);
    onResize();
    requestAnimationFrame(onResize);
    setTimeout(onResize,120);
  }
  function deactivate(){ if(_activeInst===api)_activeInst=null; }

  // ---------- game logic ----------
  function ensureSize(){} // no grid size for cards
  function nextPlayer(cur){ return ((cur+dir)%numPlayers+numPlayers)%numPlayers; }
  const COLOR_KO={red:'영업팀',yellow:'인사팀',green:'개발팀',blue:'기획팀',wild:'부서 이동'};
  function cardName(c){
    if(c.type==='num')return COLOR_KO[c.color]+' '+c.value;
    const t={skip:'반차',reverse:'반려',draw2:'추가 업무 +2',wild:'부서 이동',wild4:'야근 폭탄 +4'}[c.type];
    return c.color==='wild'?t:COLOR_KO[c.color]+' '+t;
  }

  let level=2, stage=1, stageCleared=1, stageBest={}, lastCleared=false, myTurns=0;
  let gen=0;                       // invalidates pending CPU timers after undo/restart
  let drewThisTurn=false, drawnCard=null, hintIdx=-1;
  let voids=[];                    // colors each seat has shown it lacks (drew instead of following)
  let cpuUncalled=new Set();       // CPUs that forgot to call UNO — catchable until the next player acts
  let snaps=[], actedSinceSnap=false;
  // arcade: players, CPU level, extra starting cards for you
  const UNO_STAGES=[null,
    {p:2,lv:1,extra:0},{p:2,lv:2,extra:0},{p:3,lv:1,extra:0},{p:3,lv:2,extra:0},{p:2,lv:3,extra:0},
    {p:4,lv:2,extra:0},{p:3,lv:3,extra:0},{p:4,lv:3,extra:0},{p:4,lv:3,extra:1},{p:4,lv:3,extra:2}];
  const cpuLevel=()=>mode==='arcade'?UNO_STAGES[stage].lv:level>10?UNO_STAGES[Math.min(10,level-10)].lv:level;
  // host hooks: game end (Meta) and table events (characters)
  let endHook=null, evHook=null;
  const emit=info=>{try{endHook&&endHook(Object.assign({mode:mode==='arcade'?'arcade':'cpu',level,stage,plies:myTurns},info));}catch(e){console.error(e);}};
  const ev=(k,d)=>{try{evHook&&evHook(k,d||{});}catch(e){}};

  // official +4 rule: only when you hold no card of the current color
  function isLegal(card,hand){
    if(pend>0) return pendType==='wild4' ? card.type==='wild4' : (card.type==='draw2'||card.type==='wild4');
    if(!canPlay(card,discardPile[discardPile.length-1],activeColor))return false;
    if(card.type==='wild4'&&hand.some(c=>c!==card&&c.color===activeColor))return false;
    return true;
  }
  const iga=w=>{const c=w.charCodeAt(w.length-1);return w+(c>=0xac00&&c<=0xd7a3&&(c-0xac00)%28>0?'이':'가');};
  let seatNames=null;
  const seatName=s=>s===0?'나':(seatNames&&seatNames[s])||('P'+(s+1));
  function status(msg){
    let t = msg || (turn===0 ? (pend>0?'🔥 +'+pend+' — 받아치거나 [+'+pend+'장 받기]':drewThisTurn?'뽑은 카드를 내거나 [넘기기]를 누르세요':'내 차례') : (seatName(turn)+' 차례'));
    if(!msg&&mode==='arcade')t='S'+stage+' · '+t;
    document.getElementById('unoStatus').textContent=t;
    const seats=document.getElementById('unoSeats');
    if(seats&&hands.length){   // play order (current direction) with card counts
      const order=[];let s=0;for(let i=0;i<numPlayers;i++){order.push(s);s=((s+dir)%numPlayers+numPlayers)%numPlayers;}
      seats.innerHTML=order.map(x=>{const n=hands[x].length,cur=x===turn&&!over;
        return '<span style="'+(cur?'color:var(--gold);':'')+'">'+(cur?'▶ ':'')+seatName(x)+' '+n+'장</span>';}).join('<span style="opacity:.5"> → </span>');
    }
    const db=document.getElementById('unoDrawBtn'); if(db)db.textContent=pend>0&&turn===0?'+'+pend+'장 받기':drewThisTurn?'넘기기':'카드 뽑기';
  }
  function banner(t){const b=document.getElementById('unoWin');b.textContent=t;b.style.display='block';}
  function hideBanner(){document.getElementById('unoWin').style.display='none';}
  function flash(t,ms){banner(t);const g=gen;setTimeout(()=>{if(!over&&g===gen)hideBanner();},ms||1700);}

  function deal(){
    const deck=shuffle(buildDeck());
    hands=Array.from({length:numPlayers},()=>[]);
    let idx=0;
    for(let round=0;round<7;round++)for(let s=0;s<numPlayers;s++){hands[s].push(deck[idx++]);}
    const extra=mode==='arcade'?UNO_STAGES[stage].extra:0;   // rated games (level>10) never add extra cards
    for(let i=0;i<extra;i++)hands[0].push(deck[idx++]);
    drawPile=deck.slice(idx);
    discardPile=[];
    // flip a starting card that isn't a wild4; rejected cards go back under the draw pile
    let first=drawPile.pop();
    const rejected=[];
    while(first.type==='wild4'){ rejected.push(first); first=drawPile.pop(); }
    if(rejected.length) drawPile=rejected.concat(drawPile);
    discardPile.push(first);
    activeColor = first.color==='wild' ? COLORS[Math.floor(Math.random()*4)] : first.color;
    turn=0; dir=1; over=false; mustCallUno=false; pend=0; pendType=null; unoCalledBy=new Set(); cpuUncalled=new Set();
    drewThisTurn=false; drawnCard=null; hintIdx=-1; myTurns=1;
    voids=Array.from({length:numPlayers},()=>new Set());
    snaps=[]; takeSnap();
  }
  function reshuffleIfNeeded(){
    if(drawPile.length===0&&discardPile.length>1){
      const top=discardPile.pop();
      drawPile=shuffle(discardPile);
      discardPile=[top];
    }
  }
  function giveCards(seat,n){
    for(let i=0;i<n;i++){ reshuffleIfNeeded(); if(!drawPile.length)break; hands[seat].push(drawPile.pop()); }
    unoCalledBy.delete(seat); cpuUncalled.delete(seat);
  }
  // a forgotten UNO can only be caught until the next player acts
  function clearUncalledExcept(seat){ [...cpuUncalled].forEach(s=>{ if(s!==seat)cpuUncalled.delete(s); }); }

  // ---------- undo: snapshot at the start of each of your turns ----------
  function takeSnap(){
    snaps.push({hands:hands.map(h=>h.slice()),drawPile:drawPile.slice(),discardPile:discardPile.slice(),
      turn,dir,activeColor,mustCallUno,unoCalledBy:new Set(unoCalledBy),cpuUncalled:new Set(cpuUncalled),
      voids:voids.map(v=>new Set(v)),myTurns,pend,pendType});
    if(snaps.length>40)snaps.shift();
    actedSinceSnap=false;
  }
  function undo(){
    if(!snaps.length)return;
    if(!actedSinceSnap&&turn===0&&!over&&snaps.length>1)snaps.pop();   // nothing done yet this turn → go one turn further back
    const sn=snaps[snaps.length-1];
    gen++; over=false; closeColorPicker(); document.getElementById('unoStageEnd').style.display='none';
    hands=sn.hands.map(h=>h.slice());drawPile=sn.drawPile.slice();discardPile=sn.discardPile.slice();
    turn=sn.turn;dir=sn.dir;activeColor=sn.activeColor;mustCallUno=sn.mustCallUno;unoCalledBy=new Set(sn.unoCalledBy);
    cpuUncalled=new Set(sn.cpuUncalled);voids=sn.voids.map(v=>new Set(v));myTurns=sn.myTurns;pend=sn.pend||0;pendType=sn.pendType||null;
    drewThisTurn=false;drawnCard=null;hintIdx=-1;actedSinceSnap=false;
    draw();status();flash('↩ 이전 내 차례로 되돌렸어요');
  }

  function afterTurnChange(){
    draw();status();
    if(over)return;
    if(turn===0){ takeSnap(); return; }
    const g=gen;
    // give the human a moment to call UNO — or to catch a CPU that forgot
    const wait=((hands[0].length===1&&mustCallUno&&!unoCalledBy.has(0))||cpuUncalled.size)?1600:650;
    setTimeout(()=>{ if(g===gen)cpuTurn(); },wait);
  }
  function drawCard(){ humanDraw(); }   // also used by clicking the draw pile
  function humanDraw(){
    if(over||turn!==0||!hands.length)return;
    if(pend>0){ const n=pend; actedSinceSnap=true; giveCards(0,n); voids[0].clear(); pend=0; pendType=null; SFX.check(); flash('😵 +'+n+'장을 받았어요'); ev('took',{seat:0,n}); advanceTurn(); return; }
    if(drewThisTurn){ advanceTurn(); return; }          // second press = pass
    reshuffleIfNeeded();
    if(!drawPile.length){ flash('더미에 남은 카드가 없어요 — 턴을 넘깁니다'); advanceTurn(); return; }
    actedSinceSnap=true; hintIdx=-1; clearUncalledExcept(0);
    if(!hands[0].some(c=>canPlay(c,discardPile[discardPile.length-1],activeColor)))voids[0].add(activeColor);
    const c=drawPile.pop(); hands[0].push(c); SFX.place();
    unoCalledBy.delete(0); mustCallUno=false;
    if(isLegal(c,hands[0])){ drewThisTurn=true; drawnCard=c; draw(); status(); }
    else { draw(); status('뽑은 '+cardName(c)+'은(는) 낼 수 없어요 — 턴이 넘어갑니다');
      const g=gen; setTimeout(()=>{ if(g===gen&&!over&&turn===0)advanceTurn(); },800); }
  }
  function onCardClick(idx){
    if(over||turn!==0)return;
    const card=hands[0][idx];
    if(drewThisTurn&&card!==drawnCard){ flash('뽑은 카드만 낼 수 있어요 (아니면 [넘기기])'); return; }
    if(!isLegal(card,hands[0])){
      if(card.type==='wild4')flash('야근 폭탄은 지금 부서('+COLOR_KO[activeColor]+') 카드가 손에 없을 때만 낼 수 있어요',2200);
      else flash(pend>0?'받아칠 수 있는 건 📎+2 / 🌙+4 카드뿐이에요':'낼 수 없는 카드예요');
      return;
    }
    hideBanner(); actedSinceSnap=true; clearUncalledExcept(0);
    if(card.color==='wild'){ pendingWildIndex=idx; openColorPicker(); return; }
    playCard(0,idx,null);
  }
  let pendingWildIndex=null;
  function openColorPicker(){
    const el=document.getElementById('unoColorPicker');
    if(el){ el.style.display='flex'; return; }
    const div=document.createElement('div');
    div.id='unoColorPicker';
    div.style.cssText='position:absolute;inset:0;z-index:25;display:flex;flex-wrap:wrap;align-content:center;align-items:center;justify-content:center;gap:12px;padding:20px;background:rgba(0,0,0,.6);';
    const ttl=document.createElement('div');ttl.textContent='🔀 어느 부서로 옮길까요?';ttl.style.cssText='flex-basis:100%;text-align:center;color:#fff;font-weight:900;font-size:17px;margin-bottom:4px';div.appendChild(ttl);
    COLORS.forEach(col=>{
      const b=document.createElement('button');
      b.innerHTML='<i style="font-style:normal;font-size:26px">'+DEPT_IC[col]+'</i><b style="font-size:13px">'+DEPT[col]+'</b>'; b.title=COLOR_KO[col]; b.setAttribute('aria-label',COLOR_KO[col]);
      b.style.cssText='width:76px;height:84px;border-radius:16px;border:3px solid #f7f1e3;cursor:pointer;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-family:inherit;box-shadow:0 8px 20px rgba(0,0,0,.4);background:'+COLOR_CSS[col]+';';
      b.onclick=()=>{ div.style.display='none'; if(pendingWildIndex!==null&&turn===0&&!over)playCard(0,pendingWildIndex,col); pendingWildIndex=null; };
      div.appendChild(b);
    });
    document.getElementById('uno').appendChild(div);
  }
  function closeColorPicker(){ const el=document.getElementById('unoColorPicker'); if(el)el.style.display='none'; pendingWildIndex=null; }
  function playCard(seat,idx,chosenColor){
    const card=hands[seat].splice(idx,1)[0];
    discardPile.push(card);
    lastPlay={seat,n:discardPile.length,t:performance.now()};
    activeColor = card.color==='wild' ? chosenColor : card.color;
    if(card.color!=='wild')voids[seat].delete(card.color);
    hintIdx=-1; drewThisTurn=false; drawnCard=null;
    SFX.move();
    if(hands[seat].length===0){ endRound(seat); return; }
    if(card.type==='num'&&card.value===7&&RULES.seven){
      let tg=-1;for(let k=0;k<numPlayers;k++){if(k!==seat&&(tg<0||hands[k].length<hands[tg].length))tg=k;}
      if(tg>=0){const tmp=hands[seat];hands[seat]=hands[tg];hands[tg]=tmp;voids[seat].clear();voids[tg].clear();unoCalledBy=new Set();cpuUncalled=new Set();mustCallUno=false;
        flash('🔁 '+seatName(seat)+' ↔ '+seatName(tg)+' 손패 교환!',1900);ev('swap',{from:seat,to:tg});}
    } else if(card.type==='num'&&card.value===0&&RULES.zero){
      const nh=new Array(numPlayers);for(let k=0;k<numPlayers;k++)nh[nextPlayer(k)]=hands[k];hands=nh;voids.forEach(v=>v.clear());unoCalledBy=new Set();cpuUncalled=new Set();mustCallUno=false;
      flash('🔄 모두 손패를 '+(dir>0?'다음':'이전')+' 사람에게 넘겨요!',1900);ev('rotate',{});
    }
    if(hands[seat].length===1){
      if(seat===0){ if(!unoCalledBy.has(0))mustCallUno=true; }
      else if(Math.random()<[0,0.35,0.12,0][cpuLevel()]) cpuUncalled.add(seat);   // forgot!
      else { unoCalledBy.add(seat); flash(seatName(seat)+': 원카드!'); ev('onecard',{seat}); }
    }
    applyEffectAndAdvance(card,seat);
  }
  function applyEffectAndAdvance(card,fromSeat){
    if(card.type==='reverse'){
      dir=-dir;
      turn = numPlayers===2 ? fromSeat : nextPlayer(fromSeat);
    } else if(card.type==='skip'){
      ev('attack',{from:fromSeat,to:nextPlayer(fromSeat),n:0});
      turn=nextPlayer(nextPlayer(fromSeat));
    } else if((card.type==='draw2'||card.type==='wild4')&&RULES.stack){
      const victim=nextPlayer(fromSeat), n=card.type==='draw2'?2:4;
      pend+=n; pendType=card.type;
      if(victim===0)flash((card.type==='draw2'?'📎 추가 업무':'🌙 야근 폭탄')+' +'+pend+'! 받아치거나 받기',1800);
      else if(fromSeat===0&&pend>n)flash('🔥 받아쳤어요! +'+pend+' → '+seatName(victim),1600);
      ev('attack',{from:fromSeat,to:victim,n:pend,stack:true});
      turn=victim;
    } else if(card.type==='draw2'||card.type==='wild4'){
      const victim=nextPlayer(fromSeat), n=card.type==='draw2'?2:4;
      giveCards(victim,n); voids[victim].clear();
      if(victim===0)flash((n===2?'📎 추가 업무 +2':'🌙 야근 폭탄 +4')+'! '+n+'장을 받고 턴이 넘어가요');
      ev('attack',{from:fromSeat,to:victim,n});
      turn=nextPlayer(victim);
    } else {
      turn=nextPlayer(fromSeat);
    }
    afterTurnChange();
  }
  function advanceTurn(){ drewThisTurn=false; drawnCard=null; turn=nextPlayer(turn); afterTurnChange(); }

  // ---------- CPU strategy ----------
  // lv1: any legal card · lv2: color planning, save wilds, stop near-winners · lv3: + reads which colors opponents lack
  function chooseCard(seat,lv){
    const hand=hands[seat];
    const legal=[];hand.forEach((c,i)=>{if(isLegal(c,hand))legal.push(i);});
    if(!legal.length)return null;
    if(lv<=1){ const i=legal[Math.floor(Math.random()*legal.length)]; return {idx:i,color:pickColor(seat,i,1)}; }
    const nxt=nextPlayer(seat), nNext=hands[nxt].length;
    const prv=((seat-dir)%numPlayers+numPlayers)%numPlayers;
    let best=legal[0],bs=-1e9;
    for(const i of legal){
      const c=hand[i], rest=hand.filter((_,k)=>k!==i);
      const cnt={red:0,yellow:0,green:0,blue:0};rest.forEach(x=>{if(x.color!=='wild')cnt[x.color]++;});
      let sc;
      if(c.type==='num'){ sc=10+c.value*0.3+cnt[c.color]*1.5;
        if(c.value===7&&RULES.seven&&lv>=2){ let mn=99;for(let k=0;k<numPlayers;k++)if(k!==seat)mn=Math.min(mn,hands[k].length); sc+=mn<rest.length?(rest.length-mn)*4:-12; } }
      else if(c.type==='wild'){ sc=3+(nNext<=2?10:0); }                 // keep wilds for when you're stuck
      else if(c.type==='wild4'){ sc=1+(nNext<=2?32:0); }
      else {
        sc=11+cnt[c.color]*1.5;
        if(numPlayers===2)sc+=6;                                          // skip/reverse/+2 = you move again
        if(nNext<=2)sc+=c.type==='draw2'?30:22;                           // stop the player about to win
        else if(lv>=3&&nNext>=5)sc-=4;                                    // save the weapon for later
        if(c.type==='reverse'&&numPlayers>2&&hands[prv].length<=2&&nNext>2)sc-=18;  // don't hand the turn to a near-winner
      }
      if(lv>=3){ const res=c.color==='wild'?pickColor(seat,i,lv):c.color; if(voids[nxt].has(res))sc+=8; }
      if(rest.length===1&&rest[0].color==='wild')sc+=6;                   // finish on a wild
      if(sc>bs){bs=sc;best=i;}
    }
    return {idx:best,color:pickColor(seat,best,lv)};
  }
  function pickColor(seat,idx,lv){
    const hand=hands[seat];if(hand[idx].color!=='wild')return null;
    if(lv<=1&&Math.random()<0.5)return COLORS[Math.floor(Math.random()*4)];
    const cnt={red:0,yellow:0,green:0,blue:0};
    hand.forEach((c,k)=>{if(k!==idx&&c.color!=='wild')cnt[c.color]+=c.type==='num'?1:1.3;});
    if(lv>=3){const nx=nextPlayer(seat);COLORS.forEach(x=>{if(voids[nx].has(x))cnt[x]+=hands[nx].length<=3?2:0.6;});}
    let bc=COLORS[Math.floor(Math.random()*4)],bv=0;
    COLORS.forEach(x=>{if(cnt[x]>bv){bv=cnt[x];bc=x;}});
    return bc;
  }
  function cpuTurn(){
    if(over||turn===0||!hands.length)return;
    const seat=turn, lv=cpuLevel();
    if(mustCallUno&&!unoCalledBy.has(0)&&hands[0].length===1){   // you forgot to call UNO
      mustCallUno=false;
      if(Math.random()<[0,0.4,0.75,1][lv]){ giveCards(0,2); SFX.check(); flash(seatName(seat)+': "원카드 안 외쳤죠?" — 벌칙 2장!',2200); ev('caughtMe',{seat}); draw(); status(); }
    }
    clearUncalledExcept(seat);
    let ch=chooseCard(seat,lv);
    if(!ch&&pend>0){ const n=pend; giveCards(seat,n); voids[seat].clear(); pend=0; pendType=null; SFX.check(); flash('😵 '+seatName(seat)+' +'+n+'장!',1500); ev('took',{seat,n}); advanceTurn(); return; }
    if(!ch){
      if(!hands[seat].some(c=>canPlay(c,discardPile[discardPile.length-1],activeColor)))voids[seat].add(activeColor);
      reshuffleIfNeeded();
      if(drawPile.length){
        hands[seat].push(drawPile.pop()); SFX.place(); unoCalledBy.delete(seat);
        const k=hands[seat].length-1;
        if(isLegal(hands[seat][k],hands[seat]))ch={idx:k,color:pickColor(seat,k,lv)};
      }
    }
    if(!ch){ advanceTurn(); return; }
    playCard(seat,ch.idx,ch.color);
  }
  function hint(){
    if(over||turn!==0||!hands.length)return;
    let ch;
    if(drewThisTurn){ ch={idx:hands[0].indexOf(drawnCard),color:pickColor(0,hands[0].indexOf(drawnCard),3)}; }
    else ch=chooseCard(0,3);
    SFX.select();
    if(!ch){ hintIdx=-1; draw(); flash(pend>0?'💡 받아칠 카드가 없어요 — [+'+pend+'장 받기]':'💡 낼 카드가 없어요 — 카드를 뽑으세요',2200); return; }
    hintIdx=ch.idx; draw();
    let t='💡 추천: '+cardName(hands[0][ch.idx])+(ch.color?' → '+COLOR_KO[ch.color]+' 지정':'');
    if(hands[0].length===2&&!unoCalledBy.has(0))t+='  ·  내기 전에 원카드!';
    flash(t,2600);
  }
  function endRound(winnerSeat){
    over=true;
    draw();status(winnerSeat===0?'승리!':seatName(winnerSeat)+' 승리');
    emit({result:winnerSeat===0?'win':'lose'});
    if(mode==='arcade'){
      lastCleared=winnerSeat===0;
      if(lastCleared){
        if(stage>=stageCleared)stageCleared=Math.min(10,stage+1);
        const prev=stageBest[stage];if(prev===undefined||myTurns<prev)stageBest[stage]=myTurns;
        saveProgress();banner('스테이지 '+stage+' 클리어! ⭐ ('+myTurns+'턴)');SFX.win();
      } else { banner('스테이지 '+stage+' 실패… '+iga(seatName(winnerSeat))+' 먼저 다 냈어요'); SFX.lose(); }
      setTimeout(showStageEnd,900);
    } else if(winnerSeat===0){ banner('🏆 승리! 카드를 다 냈어요 ('+myTurns+'턴)'); SFX.win(); }
    else { banner(seatName(winnerSeat)+' 승리… 다시 도전해보세요'); SFX.lose(); }
  }
  function callUno(){
    if(over||!hands.length)return;
    const caught=[...cpuUncalled].filter(s=>hands[s]&&hands[s].length===1);
    if(caught.length){
      caught.forEach(s=>{giveCards(s,2);voids[s].clear();}); cpuUncalled.clear(); SFX.capture();
      flash('잡았다! '+iga(caught.map(s=>seatName(s)).join('·'))+' 원카드를 안 외쳤어요 — 벌칙 2장',2200); ev('caught',{seats:caught}); draw(); status(); return;
    }
    const n=hands[0].length;
    if(n===1||(n===2&&turn===0)){ unoCalledBy.add(0); mustCallUno=false; flash('원카드! 선언했어요'); return; }
    flash('원카드는 한 장 남았을 때(또는 두 장에서 내기 직전) 외쳐요');
  }

  // ---------- setup / arcade ----------
  function openSetup(){
    document.getElementById('unoSetup').classList.remove('hidden');
    document.getElementById('unoStageEnd').style.display='none';
    document.getElementById('unoStages').classList.add('hidden');
    document.getElementById('unoQuick').classList.remove('hidden');
    markPlayers(); markLevel();
  }
  function markPlayers(){ document.querySelectorAll('.unosize').forEach(b=>{ const active=(+b.dataset.n===numPlayers); b.style.borderColor=active?'var(--gold)':''; b.style.color=active?'var(--gold)':''; }); }
  function setPlayers(n){ numPlayers=n; markPlayers(); }
  function markLevel(){ document.querySelectorAll('.unolv').forEach(b=>{ const active=(+b.dataset.lv===level); b.style.borderColor=active?'var(--gold)':''; b.style.color=active?'var(--gold)':''; }); }
  function setLevel(l){ level=l; markLevel(); }
  async function loadProgress(){ const p=await Store.get('uno_progress'); if(p){stageCleared=p.cleared||1;stageBest=p.best||{};} }
  function saveProgress(){ Store.set('uno_progress',{cleared:stageCleared,best:stageBest}); }
  function openStages(){
    document.getElementById('unoQuick').classList.add('hidden');
    document.getElementById('unoStages').classList.remove('hidden');
    document.getElementById('unoProgress').textContent='(해제: '+stageCleared+'/10)';
    const grid=document.getElementById('unoStageGrid');grid.innerHTML='';
    for(let i=1;i<=10;i++){const b=document.createElement('button'),locked=i>stageCleared,cfg=UNO_STAGES[i];
      b.className='stagebtn'+(locked?' locked':'');
      b.innerHTML=(stageBest[i]!==undefined?'⭐':'')+'<b>'+i+'</b><small>'+(stageBest[i]!==undefined?stageBest[i]+'턴':cfg.p+'인')+'</small>';
      b.title=cfg.p+'인 · CPU '+['','쉬움','보통','어려움'][cfg.lv]+(cfg.extra?' · 시작 손패 +'+cfg.extra:'');
      b.disabled=locked;b.onclick=()=>startStage(i);grid.appendChild(b);}
  }
  function startStage(s){if(window.StoryGate&&!window.StoryGate(s,()=>startStage(s)))return; stage=s; numPlayers=UNO_STAGES[s].p; start('arcade'); }
  function showStageEnd(){
    const el=document.getElementById('unoStageEnd');el.style.display='flex';el.innerHTML='';
    const mk=(txt,fn,cls)=>{const b=document.createElement('button');b.className='btn'+(cls?' '+cls:'');b.textContent=txt;b.onclick=fn;return b;};
    if(lastCleared&&stage<10)el.appendChild(mk('다음 스테이지 ▶',()=>{el.style.display='none';startStage(stage+1);}));
    el.appendChild(mk('다시 도전',()=>{el.style.display='none';startStage(stage);},'ghost'));
    el.appendChild(mk('스테이지 목록',()=>{el.style.display='none';openSetup();openStages();},'ghost'));
  }
  function start(m,lv){
    mode=m||'quick'; gen++;
    if(mode==='cpu'&&lv>10){ level=lv; numPlayers=UNO_STAGES[Math.min(10,lv-10)].p; }
    else if(mode==='cpu'&&lv){ level=lv; }
    if(mode==='quick'){ mode='cpu'; if(level>10)level=2; }
    document.getElementById('unoSetup').classList.add('hidden');
    document.getElementById('unoStageEnd').style.display='none';
    closeColorPicker(); hideBanner();
    deal();
    if(!inited)setupScene();
    draw();status();
  }
  function restart(){ if(!hands.length||!mode){ openSetup(); return; } if(mode==='arcade')startStage(stage); else start('cpu',level); }

  const api = {
    ensure, openSetup, setPlayers, setLevel, openStages, startStage, start, restart, drawCard:()=>humanDraw(), callUno, hint, undo,
    onEnd:f=>{endHook=f;}, onEvent:f=>{evHook=f;},
    rules:()=>Object.assign({},RULES), setRules:o=>{Object.assign(RULES,o);try{const k=Object.assign({},RULES);delete k.bomb;localStorage.setItem('uno_rules',JSON.stringify(k));}catch(e){}}, setSeatNames:n=>{seatNames=n;Object.keys(plateCache).forEach(k=>delete plateCache[k]);draw();status();},
    state:()=>({mode,level,stage,over,turn,plies:myTurns,players:numPlayers,cards:hands.map(h=>h.length)}),
    zoom:_zoom, toggle2D,
    resetView(){ resetView(); const b=document.getElementById('uno2dBtn'); if(b)b.textContent='2D 보기'; },
    toggle2DBtn(){ const on=toggle2D(); const b=document.getElementById('uno2dBtn'); if(b)b.textContent=on?'3D 보기':'2D 보기'; },
    is2D(){return view2D;}, canRotate(){return !view2D;},
    setActive(v){ v?activate():deactivate(); },
    _tick, _dragRotate, _pickAt, _zoom, _onRestore:()=>draw(),
    get scene(){return scene;}, get camera(){return camera;}
  };
  return api;
})();
function unoRuleBtns(){document.querySelectorAll('.unorule').forEach(b=>{const on=!!Uno.rules()[b.dataset.r];b.classList.toggle('on',on);b.querySelector('i').textContent=on?'ON':'OFF';});}
function unoRule(b){const k=b.dataset.r,r=Uno.rules();Uno.setRules({[k]:!r[k]});unoRuleBtns();}
document.addEventListener('DOMContentLoaded',unoRuleBtns);setTimeout(unoRuleBtns,0);
function unoToggleSnd(){const on=SFX.toggle();const b=document.getElementById('unoSndBtn');if(b)b.textContent=on?'🔊':'🔇';}

/* ================= UNO 튜토리얼 ================= */
const UnoTutorial=(function(){
  const HEX={red:'#e0604f',yellow:'#d49a1c',green:'#1f9e8a',blue:'#34519c'};
  const IC={red:'📈',yellow:'🤝',green:'💻',blue:'📋'};
  function card(color,label){
    if(color==='wild')return '<div class="unocard-demo oc wild"><em class="chips"><i></i><i></i><i></i><i></i></em><span>'+label+'</span></div>';
    return '<div class="unocard-demo oc" style="--c:'+HEX[color]+'"><em>'+IC[color]+'</em><span>'+label+'</span></div>';
  }
  const steps=[
    { title:'원카드란?',
      visual: card('red','7')+card('yellow','7')+card('blue','2'),
      body:'손에 든 카드를 <b>먼저 다 내면</b> 이기는 게임이에요. 카드 색은 4개 부서예요: 📈 영업팀 · 🤝 인사팀 · 💻 개발팀 · 📋 기획팀.' },
    { title:'카드 내는 규칙',
      visual: card('red','7')+' → '+card('red','3')+' <span style="opacity:.5">또는</span> '+card('blue','7'),
      body:'바닥 카드와 <b>부서가 같거나</b> <b>숫자가 같으면</b> 낼 수 있어요. 영업팀 7 위에는 영업팀 3도, 기획팀 7도 낼 수 있어요.' },
    { title:'낼 카드가 없다면?',
      visual: card('green','5')+' <span style="font-size:22px">➜</span> 🗂️',
      body:'낼 카드가 없으면 더미에서 한 장 뽑아요. <b>뽑은 카드</b>를 낼 수 있으면 바로 내거나 [넘기기], 못 내면 차례가 넘어가요.' },
    { title:'🏖️ 반차 · ↩️ 반려',
      visual: card('blue','🏖️')+card('yellow','↩️'),
      body:'<b>🏖️ 반차</b>: 다음 사람이 한 번 쉬어요.<br><b>↩️ 반려</b>: 도는 순서가 거꾸로 바뀌어요. (2명일 땐 반차와 같아요)' },
    { title:'📎 추가 업무 +2',
      visual: card('green','+2'),
      body:'다음 사람이 카드를 <b>2장 받고</b> 차례도 넘겨요.' },
    { title:'🔀 부서 이동 · 🌙 야근 폭탄 +4',
      visual: card('wild','🔀')+card('wild','+4'),
      body:'<b>🔀 부서 이동</b>: 언제든 낼 수 있고, 다음 부서를 내가 정해요.<br><b>🌙 야근 폭탄</b>: 부서를 정하고 다음 사람이 <b>4장</b>을 받아요. 단, 지금 부서 카드가 손에 <b>없을 때만</b> 낼 수 있어요.' },
    { title:'"원카드!" 외치기',
      visual: '<div style="font-size:28px;font-weight:900;color:#ffd76a">원카드!</div>',
      body:'카드가 <b>딱 한 장</b> 남으면 [원카드!]를 누르세요. 안 누르면 들켜서 <b>2장 벌칙</b>! 상대가 깜빡하면 내가 눌러서 잡아낼 수 있어요.' },
    { title:'잼민이부터 잼사장까지',
      visual: '<div style="font-size:34px">🧒 → 👑</div>',
      body:'카드를 <b>먼저 다 내면</b> 승리! <b>승진 도전</b>에서 잼민이부터 잼사장까지 차례로 이겨 보세요. 막히면 💡 힌트를 눌러요.' },
  ];
  let idx=0, openedFromSetup=false;
  function render(){
    const s=steps[idx];
    document.getElementById('unoTutProgress').textContent=(idx+1)+' / '+steps.length;
    document.getElementById('unoTutTitle').textContent=s.title;
    document.getElementById('unoTutVisual').innerHTML=s.visual;
    document.getElementById('unoTutBody').innerHTML=s.body;
    document.getElementById('unoTutPrev').style.visibility = idx===0 ? 'hidden' : 'visible';
    document.getElementById('unoTutNext').textContent = idx===steps.length-1 ? '완료' : '다음 →';
  }
  function open(){
    idx=0;
    const setupEl=document.getElementById('unoSetup');
    openedFromSetup = !setupEl.classList.contains('hidden');
    setupEl.classList.add('hidden');
    document.getElementById('unoTutorial').classList.add('show');
    render();
  }
  function close(){
    document.getElementById('unoTutorial').classList.remove('show');
    if(openedFromSetup) document.getElementById('unoSetup').classList.remove('hidden');
  }
  function next(){ if(idx>=steps.length-1){ close(); return; } idx++; render(); }
  function prev(){ if(idx>0){ idx--; render(); } }
  return { open, close, next, prev };
})();
