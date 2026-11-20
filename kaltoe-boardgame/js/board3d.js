/* ============ Shared 3D board engine — ONE renderer shared by all instances ============ */
// Single WebGL context for every 3D board (omok, janggi). Only the active instance renders.
// three.min.js is deferred (shared/three-loader.js): it is fetched only when a board is opened.
// Safety net: if that loader is missing (stale bundle / changed script order), inject the same file
// next to this script so the board still comes up instead of failing silently.
window.loadThree = window.loadThree || (function () {
  var P = null;
  return function () {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (P) return P;
    var s = document.currentScript || [].slice.call(document.getElementsByTagName('script')).pop();
    var d = ((s && s.src) || '').replace(/[^/]*$/, '') || 'js/';
    P = new Promise(function (res, rej) {
      var el = document.createElement('script');
      el.src = d + 'three.min.js';
      el.async = true;
      el.onload = function () {
        if (!window.THREE) { P = null; rej(new Error('three.min.js loaded but THREE is missing')); return; }
        try { window.dispatchEvent(new Event('three-ready')); } catch (e) {}
        res(window.THREE);
      };
      el.onerror = function () { P = null; rej(new Error('three.min.js load failed')); };
      document.head.appendChild(el);
    });
    return P;
  };
})();
let _R=null;            // shared renderer
let _activeInst=null;   // currently visible instance
// ---- mobile light defaults -------------------------------------------------
// A phone GPU pays for every texel: the key light's shadow map starts at 1024 (desktop 2048) and
// canvas textures ask for 4x anisotropy (desktop 8x). quality.js still scales these down further.
const _MOBILE_ENV=(function(){try{
  if(window.matchMedia&&matchMedia('(pointer:coarse)').matches)return true;
  const touch=(navigator.maxTouchPoints>0)||('ontouchstart' in window);
  return touch&&Math.min(screen.width||0,screen.height||0)<900;
}catch(e){return false;}})();
const _ANISO=_MOBILE_ENV?4:8;
const _SHADOW_SIZE=_MOBILE_ENV?1024:2048;
// ---- on-demand rendering: the shared loop draws only while the board actually changes ----
let _needRender=0;                                  // frames we still owe after a state change
function _invalidate(n){_needRender=Math.max(_needRender,n||2);}
function _wakeRender(){if(_R&&_R.__wake)_R.__wake();}
// Soft "photo studio" lighting baked into an environment map: gives metal and lacquer real
// reflections (a gradient dome plus a few bright softbox panels, prefiltered with PMREM).
function makeStudioEnv(renderer,o){
  o=o||{};
  const sc=new THREE.Scene();
  const cv=document.createElement('canvas');cv.width=16;cv.height=256;const x=cv.getContext('2d');
  const g=x.createLinearGradient(0,0,0,256);
  g.addColorStop(0,o.top||'#e9eef6');g.addColorStop(0.48,o.mid||'#7d8797');g.addColorStop(0.52,o.mid2||'#4a4440');g.addColorStop(1,o.bottom||'#1c1816');
  x.fillStyle=g;x.fillRect(0,0,16,256);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),side:THREE.BackSide}));
  sc.add(dome);
  const panel=(w,h,px,py,pz,k)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(k,k,k),side:THREE.DoubleSide}));
    m.position.set(px,py,pz);m.lookAt(0,0,0);sc.add(m);};
  panel(34,14,0,42,4,o.key||2.6);          // big overhead softbox
  panel(12,22,-38,14,14,o.side||1.6);      // left strip
  panel(12,22,36,12,-16,o.side2||1.1);     // right strip
  const pm=new THREE.PMREMGenerator(renderer);
  const env=pm.fromScene(sc,0.035).texture;
  pm.dispose();
  return env;
}
function _sharedRenderer(){
  if(_R)return _R;
  _R=new THREE.WebGLRenderer({antialias:true});
  _R.setPixelRatio(Math.min(devicePixelRatio,2));
  _R.shadowMap.enabled=true;_R.shadowMap.type=THREE.PCFSoftShadowMap;
  _R.domElement.style.touchAction='none';
  _R.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();},false);
  _R.domElement.addEventListener('webglcontextrestored',()=>{if(_activeInst&&_activeInst._onRestore)_activeInst._onRestore();},false);
  // ---- controls bound ONCE to the shared canvas; route to the active instance ----
  const el=_R.domElement;
  el.addEventListener('contextmenu',e=>e.preventDefault());
  let down=false,moved=false,lx=0,ly=0,sx=0,sy=0;
  el.addEventListener('pointerdown',e=>{if(!_activeInst)return;down=true;moved=false;lx=sx=e.clientX;ly=sy=e.clientY;el.setPointerCapture&&el.setPointerCapture(e.pointerId);});
  el.addEventListener('pointermove',e=>{if(!_activeInst)return;if(!down){if(_activeInst._hover&&e.pointerType!=='touch')_activeInst._hover(e.clientX,e.clientY);return;}if(Math.hypot(e.clientX-sx,e.clientY-sy)>6)moved=true;
    if(moved)_activeInst._dragRotate(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY;});
  const up=e=>{if(!_activeInst){down=false;return;}if(down&&!moved)_activeInst._pickAt(e.clientX,e.clientY);down=false;};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',()=>down=false);
  el.addEventListener('wheel',e=>{if(!_activeInst)return;e.preventDefault();_activeInst._zoom(e.deltaY*0.01);},{passive:false});
  let pinch=null;
  const tdist=e=>{const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;return Math.hypot(dx,dy);};
  el.addEventListener('touchstart',e=>{if(!_activeInst)return;if(e.touches.length===2){pinch=tdist(e);down=false;}},{passive:true});
  el.addEventListener('touchmove',e=>{if(!_activeInst)return;if(e.touches.length===2&&pinch){const d=tdist(e);_activeInst._zoom((pinch-d)*0.03);pinch=d;}},{passive:true});
  el.addEventListener('touchend',()=>pinch=null);
  // ---- shared render loop (on demand) --------------------------------------
  // The loop itself stays light: it updates the active instance, asks it whether anything is still
  // moving, and skips renderer.render() while the board is at rest. A visible change the instance
  // did not predict shows up in its state signature and still gets one frame.
  let _rafOn=false,_rafId=0,_lastSig=-1,_idleTick=0,_gqVer=-1;
  function _wake(){if(_rafOn)return;_rafOn=true;_lastSig=-1;_rafId=requestAnimationFrame(loop);}
  _R.__wake=_wake;
  function loop(){
    _rafId=0;
    const inst=_activeInst;
    if(!inst){_rafOn=false;return;}                       // 화면을 떠나면 rAF도 쉰다 (activate가 깨운다)
    _rafOn=true;_rafId=requestAnimationFrame(loop);
    const S=(window.BOARD_GFX_STATS=window.BOARD_GFX_STATS||{ticks:0,renders:0,rests:0});S.ticks++;
    inst._tick();
    const pbr=!!inst._pbr;
    if(_R.__pbr!==pbr){_R.__pbr=pbr;_R.outputEncoding=pbr?THREE.sRGBEncoding:THREE.LinearEncoding;
      _R.toneMapping=pbr?THREE.ACESFilmicToneMapping:THREE.NoToneMapping;_R.toneMappingExposure=pbr?(inst._exposure||1):1;}
    if(window.GQ&&GQ.ver!==_gqVer){_gqVer=GQ.ver;_invalidate(2);}     // 화질이 바뀌면 한 번은 반드시 다시 그린다
    const st=inst._frameState?inst._frameState():{live:true};
    let draw=!!st.live||_needRender>0;
    if(!draw&&st.sig!==_lastSig)draw=true;                          // 놓친 변화 → 안전하게 1프레임
    if(!draw&&st.pulse&&(++_idleTick>=6))draw=true;                 // 천천히 깜박이는 표시는 ~10fps로 충분
    if(!draw){S.rests++;return;}
    _lastSig=st.sig;if(_needRender>0)_needRender--;_idleTick=0;S.renders++;
    _R.render(inst.scene,inst.camera);
  }
  _wake();
  return _R;
}

function animatePlace(mesh){
  if(!mesh) return;
  mesh.scale.set(0.2,0.2,0.2);
  const start = performance.now();
  function step(now){
    const t = Math.min(1, (now - start) / 220);
    const s = 0.2 + 0.8 * (1 - Math.pow(1-t, 3));
    mesh.scale.set(s,s,s);
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---- v1 graphics helpers (visual only) ---- */
const _keep=new WeakSet();                       // shared geometries/materials that clearPieces must not dispose
function _lin(h){return new THREE.Color(h).convertSRGBToLinear();}
function _cvTex(w,h,draw,srgb){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);if(srgb!==false)t.encoding=THREE.sRGBEncoding;t.anisotropy=_ANISO;return t;}
function _rnd(a,b){return a+Math.random()*(b-a);}
// fine straight-grain (masame) wood: colour map + matching bump map
function _woodMaps(size,base,dark,light,o){
  o=o||{};const lines=[];const n=o.lines||260;
  for(let i=0;i<n;i++)lines.push({y:Math.random()*size,w:_rnd(.4,o.wide?3.2:2),a:_rnd(.05,.22),dark:Math.random()<.62,f:_rnd(.002,.012),p:Math.random()*9,amp:_rnd(1,o.wavy||5)});
  const knots=[];for(let i=0;i<(o.knots||0);i++)knots.push([Math.random()*size,Math.random()*size,_rnd(8,26)]);
  const paint=(g,bump)=>{
    if(bump){g.fillStyle='#808080';g.fillRect(0,0,size,size);}
    else{const bg=g.createLinearGradient(0,0,0,size);bg.addColorStop(0,base);bg.addColorStop(.5,light);bg.addColorStop(1,base);g.fillStyle=bg;g.fillRect(0,0,size,size);}
    // broad figure bands
    for(let i=0;i<14;i++){const y=Math.random()*size,h=_rnd(10,50);const gr=g.createLinearGradient(0,y-h,0,y+h);
      gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,bump?'rgba(0,0,0,.08)':(Math.random()<.5?dark:light));gr.addColorStop(1,'rgba(0,0,0,0)');
      g.globalAlpha=bump?1:_rnd(.12,.3);g.fillStyle=gr;g.fillRect(0,y-h,size,h*2);}
    g.globalAlpha=1;
    lines.forEach(L=>{g.strokeStyle=bump?(L.dark?'rgba(0,0,0,'+(L.a*1.6)+')':'rgba(255,255,255,'+(L.a)+')'):(L.dark?dark:light);
      g.globalAlpha=bump?1:L.a;g.lineWidth=L.w;g.beginPath();
      for(let x=0;x<=size;x+=8){const yy=L.y+Math.sin(x*L.f+L.p)*L.amp;x?g.lineTo(x,yy):g.moveTo(x,yy);}g.stroke();});
    g.globalAlpha=1;
    knots.forEach(([kx,ky,kr])=>{for(let k=6;k>0;k--){g.strokeStyle=bump?'rgba(0,0,0,.25)':dark;g.globalAlpha=bump?1:.18;g.lineWidth=1.4;
      g.beginPath();g.ellipse(kx,ky,kr*k/6*2.2,kr*k/6*.6,0,0,7);g.stroke();}});
    g.globalAlpha=1;
    if(!bump){for(let i=0;i<1600;i++){g.fillStyle=Math.random()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)';g.fillRect(Math.random()*size,Math.random()*size,_rnd(1,6),1);}}
  };
  const map=_cvTex(size,size,g=>paint(g,false));const bump=_cvTex(size,size,g=>paint(g,true),false);
  map.wrapS=map.wrapT=bump.wrapS=bump.wrapT=THREE.RepeatWrapping;
  return {map,bump};
}
function _ringTex(){ if(_ringTex.t)return _ringTex.t;
  return _ringTex.t=_cvTex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.58,'rgba(255,255,255,0.05)');gr.addColorStop(.74,'rgba(255,255,255,1)');
    gr.addColorStop(.8,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});}
function _discTex(){ if(_discTex.t)return _discTex.t;
  return _discTex.t=_cvTex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,.75)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});}
function _vignetteBg(c0,c1){return _cvTex(512,512,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h*.42,w*.05,w/2,h/2,w*.75);
  gr.addColorStop(0,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(0,0,w,h);});}

function makeBoard3D(opts){
  const mount=document.getElementById(opts.mountId);
  const COLS=opts.cols, ROWS=opts.rows;
  const OFFC=(COLS-1)/2, OFFR=(ROWS-1)/2;
  let scene,camera,raycaster,mouse,boardGroup,pieceGroup,markGroup,fxGroup,hoverMesh;
  const FOV=42;
  const BOARD_SPAN=Math.max(COLS,ROWS)+1.2;
  // slightly wider framing than v0 so the whole board + a sliver of table reads as one composition
  const CAMRAD=((BOARD_SPAN*0.5)/Math.tan((FOV*Math.PI/180)/2)*0.62 + Math.max(COLS,ROWS)*0.18)*1.42;
  let cam={theta:0,phi:0.9,rad:CAMRAD,tgt:new THREE.Vector3(0,0,0)};
  const DEF={theta:0,phi:0.9,rad:CAMRAD};
  let pickPlane, inited=false;
  const TOPY=0.06;                                  // playing surface height
  const anims=[], parts=[];
  let introT0=0, celebT0=-1e9, shakeAmp=0;
  let prevPieces=new Map(), curPieces=null, drawCount=0;

  function toXZ(r,c){return {x:(c-OFFC), z:(r-OFFR)};}
  function disposeObj(o){
    if(o.geometry&&o.geometry.dispose&&!_keep.has(o.geometry))o.geometry.dispose();
    if(o.material){const m=o.material;(Array.isArray(m)?m:[m]).forEach(mm=>{if(!mm||_keep.has(mm))return;if(mm.map&&mm.map.dispose&&!_keep.has(mm.map))mm.map.dispose();if(mm.dispose)mm.dispose();});}
    if(o.children&&o.children.length)o.children.slice().forEach(disposeObj);
  }
  function disposeChildren(grp){while(grp.children.length){const c=grp.children[0];grp.remove(c);disposeObj(c);}}
  function init(){
    if(inited)return;inited=true;
    _sharedRenderer();
    scene=new THREE.Scene();
    scene.background=_vignetteBg('#3b2f25','#0a0807');
    const span=Math.max(COLS,ROWS);
    scene.fog=new THREE.Fog(_lin(0x0c0a08), span*1.9, span*4.2);
    scene.environment=makeStudioEnv(_R,{top:'#5e554b',mid:'#2e2823',mid2:'#171310',bottom:'#070605',key:1.7,side:.9,side2:.6});
    const w=mount.clientWidth||600,h=mount.clientHeight||500;
    camera=new THREE.PerspectiveCamera(42,w/h,0.1,200);
    // lighting: warm key (shadows), cool fill, cool rim from behind, soft sky/ground bounce
    scene.add(new THREE.HemisphereLight(0xfff0dc,0x2a1d14,0.25));
    const key=new THREE.DirectionalLight(0xffe0bc,1.45);key.position.set(5.5,15,7);key.castShadow=true;
    key.shadow.mapSize.set(_SHADOW_SIZE,_SHADOW_SIZE);     // 모바일: 1024로 시작 (quality.js가 더 낮춘다)
    const sh=span*0.5+1.2;key.shadow.camera.left=-sh;key.shadow.camera.right=sh;key.shadow.camera.top=sh;key.shadow.camera.bottom=-sh;
    key.shadow.camera.near=2;key.shadow.camera.far=40;key.shadow.bias=-0.0004;key.shadow.normalBias=0.015;key.shadow.radius=4;
    scene.add(key);
    const fill=new THREE.DirectionalLight(0x9db8ff,.55);fill.position.set(-8,6,-4);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xcfe0ff,.85);rim.position.set(-2,5,-12);scene.add(rim);
    // table: walnut with a soft light pool baked in (fades to black at the edges)
    const T=span*4.2;
    const tw=_woodMaps(1024,'#3a2416','rgba(20,10,4,1)','rgba(120,78,44,1)',{lines:340,wavy:9,knots:2,wide:true});
    tw.map.repeat.set(3,3);tw.bump.repeat.set(3,3);
    const table=new THREE.Mesh(new THREE.PlaneGeometry(T,T),new THREE.MeshStandardMaterial({color:0xffffff,map:tw.map,bumpMap:tw.bump,bumpScale:0.02,roughness:.55,metalness:0,envMapIntensity:.5}));
    table.material.userData._lin=1;
    table.rotation.x=-Math.PI/2;table.position.y=-0.6;table.receiveShadow=true;scene.add(table);
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(T,T),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,
      map:_cvTex(256,256,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,w*.08,w/2,h/2,w/2);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.55,'rgba(0,0,0,.35)');gr.addColorStop(1,'rgba(0,0,0,.96)');g.fillStyle=gr;g.fillRect(0,0,w,h);})}));
    pool.material.userData._lin=1;pool.rotation.x=-Math.PI/2;pool.position.y=-0.595;scene.add(pool);
    // contact occlusion under the board
    const ao=new THREE.Mesh(new THREE.PlaneGeometry(COLS+3.4,ROWS+3.4),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,color:0x000000,
      map:_cvTex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,w*.25,w/2,h/2,w*.5);gr.addColorStop(0,'rgba(255,255,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);},false)}));
    ao.material.userData._lin=1;ao.rotation.x=-Math.PI/2;ao.position.y=-0.59;scene.add(ao);
    boardGroup=new THREE.Group();scene.add(boardGroup);
    pieceGroup=new THREE.Group();scene.add(pieceGroup);
    markGroup=new THREE.Group();scene.add(markGroup);
    fxGroup=new THREE.Group();scene.add(fxGroup);
    buildBoard();
    hoverMesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:_discTex(),color:_lin(0xfff2cf),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
    hoverMesh.material.userData._lin=1;hoverMesh.rotation.x=-Math.PI/2;hoverMesh.position.y=TOPY+0.012;hoverMesh.scale.set(.9,.9,.9);scene.add(hoverMesh);
    raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
    pickPlane=new THREE.Mesh(new THREE.PlaneGeometry(COLS*3,ROWS*3),new THREE.MeshBasicMaterial({visible:false}));
    pickPlane.rotation.x=-Math.PI/2;scene.add(pickPlane);
    window.addEventListener('resize',onResize);
  }
  function makeGrainTexture(baseHex,vein1,vein2,size=512){   // kept for API compatibility
    return _woodMaps(size,baseHex,vein1,vein2).map;
  }
  function roundedRect(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  function buildBoard(){
    const baseW=COLS+1.0, baseH=ROWS+1.0;
    const TH=window.BOARD_THEME||null;   // unlockable themes (progress.js)
    const pal=(TH&&TH.wood)||opts.wood||{base:'#c99a52',dark:'rgba(120,70,20,1)',light:'rgba(246,214,150,1)'};
    const wm=_woodMaps(1024,pal.base,pal.dark,pal.light,{lines:300,wavy:2.2});
    // one solid, bevelled slab (like a real goban / janggi-pan): top face UVs map straight onto the wood
    const depth=0.62, bev=0.05;
    const geo=new THREE.ExtrudeGeometry(roundedRect(baseW-bev*2,baseH-bev*2,0.12),{depth:depth-bev*2,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:3,curveSegments:6});
    geo.rotateX(-Math.PI/2);geo.translate(0,TOPY-depth+bev,0);
    wm.map.repeat.set(1/baseW,1/baseH);wm.bump.repeat.set(1/baseW,1/baseH);wm.map.offset.set(.5,.5);wm.bump.offset.set(.5,.5);
    const slabMat=new THREE.MeshPhysicalMaterial({color:0xffffff,map:wm.map,bumpMap:wm.bump,bumpScale:0.006,roughness:.42,metalness:0,clearcoat:.2,clearcoatRoughness:.45,envMapIntensity:.6});
    slabMat.userData._lin=1;
    const slab=new THREE.Mesh(geo,slabMat);slab.castShadow=true;slab.receiveShadow=true;boardGroup.add(slab);
    // dark lacquered skirt + feet so the board reads as a heavy object
    const skirt=new THREE.Mesh(new THREE.BoxGeometry(baseW-0.3,0.08,baseH-0.3),new THREE.MeshStandardMaterial({color:_lin(0x1c120b),roughness:.6}));
    skirt.material.userData._lin=1;skirt.position.y=TOPY-depth-0.02;boardGroup.add(skirt);
    if(opts.squareStyle==='checker'){
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
        if((r+c)%2){const {x,z}=toXZ(r,c);
          const sq=new THREE.Mesh(new THREE.BoxGeometry(1,0.02,1),new THREE.MeshStandardMaterial({color:0x9a6a3a,roughness:.7}));
          sq.position.set(x,0.07,z);sq.receiveShadow=true;boardGroup.add(sq);}}
    } else {
      // ink grid painted on a decal (crisp at any zoom, slightly glossy like real lacquered ink)
      const PX=Math.min(110,Math.floor(2048/Math.max(COLS,ROWS)));
      const W=(COLS-1)+0.6, H=(ROWS-1)+0.6;
      const ink=opts.inkColor||'#1b130b';
      const grid=_cvTex(Math.ceil(W*PX),Math.ceil(H*PX),(g,w,h)=>{
        g.clearRect(0,0,w,h);g.strokeStyle=ink;g.lineCap='square';
        const o=0.3*PX;g.lineWidth=Math.max(2,PX*0.035);
        for(let r=0;r<ROWS;r++){g.beginPath();g.moveTo(o,o+r*PX);g.lineTo(o+(COLS-1)*PX,o+r*PX);g.stroke();}
        for(let c=0;c<COLS;c++){g.beginPath();g.moveTo(o+c*PX,o);g.lineTo(o+c*PX,o+(ROWS-1)*PX);g.stroke();}
        g.lineWidth=Math.max(3,PX*0.06);g.strokeRect(o,o,(COLS-1)*PX,(ROWS-1)*PX);
      });
      const dec=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshStandardMaterial({map:grid,transparent:true,roughness:.35,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false}));
      dec.material.userData._lin=1;dec.rotation.x=-Math.PI/2;dec.position.y=TOPY+0.002;dec.receiveShadow=true;boardGroup.add(dec);
    }
    if(opts.decorate)opts.decorate(boardGroup, toXZ, THREE);
  }
  function onResize(){if(_activeInst!==api||!_R)return;const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();_R.setSize(w,h);_invalidate(2);}

  function _dragRotate(dxp,dyp){ if(view2D)return; cam.theta-=dxp*0.008; cam.phi=Math.max(0.25,Math.min(1.4,cam.phi-dyp*0.006)); _invalidate(2); }
  function _pickAt(clientX,clientY){ pick(clientX,clientY); }
  function cellAt(clientX,clientY){
    const rect=_R.domElement.getBoundingClientRect();
    mouse.x=((clientX-rect.left)/rect.width)*2-1;mouse.y=-((clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouse,camera);
    const hit=raycaster.intersectObject(pickPlane);
    if(!hit.length)return null;
    const p=hit[0].point;
    const c=Math.round(p.x+OFFC), r=Math.round(p.z+OFFR);
    return (r>=0&&r<ROWS&&c>=0&&c<COLS)?[r,c]:null;
  }
  function pick(clientX,clientY){const rc=cellAt(clientX,clientY);if(rc)opts.onPick(rc[0],rc[1]);}
  function _hover(clientX,clientY){ if(!hoverMesh)return;const rc=cellAt(clientX,clientY);
    if(!rc){hoverMesh.userData.on=0;_invalidate(2);return;}const {x,z}=toXZ(rc[0],rc[1]);hoverMesh.position.x=x;hoverMesh.position.z=z;hoverMesh.userData.on=1;_invalidate(2);}
  function zoom(d){cam.rad=Math.max(CAMRAD*0.55,Math.min(CAMRAD*2.0,cam.rad+d));}
  function resetView(){cam.theta=DEF.theta;cam.phi=DEF.phi;cam.rad=DEF.rad;view2D=false;}
  let view2D=false, smPhi, smTheta;
  function toggle2D(){view2D=!view2D;return view2D;}
  const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
  let smRad;
  function updateCam(now){
    const tgtPhi = view2D?0.0001:cam.phi, tgtTheta = view2D?0:cam.theta;
    smPhi = smPhi===undefined?cam.phi:smPhi+(tgtPhi-smPhi)*0.15;
    smTheta = smTheta===undefined?cam.theta:smTheta+(tgtTheta-smTheta)*0.15;
    const _asp=camera.aspect, _fit=_asp>=1.25?1:Math.min(2.3,Math.pow(1.25/_asp,0.8));
    let phi=Math.max(0.0001,smPhi-(_fit-1)*0.16), theta=smTheta, rad=cam.rad*_fit;
    if(scene.fog&&scene.fog.__fit!==_fit){scene.fog.__fit=_fit;const _sp=Math.max(COLS,ROWS);scene.fog.near=_sp*1.9*_fit;scene.fog.far=_sp*4.2*_fit;}
    // cinematic intro sweep: swing in from a low, wide angle
    const k=ease((now-introT0)/1700);
    if(k<1&&!view2D){theta+=(1-k)*1.25;phi=Math.min(1.38,phi+(1-k)*0.4);rad*=1+(1-k)*0.45;}
    // celebration: slow orbit
    const ct=(now-celebT0)/1000;
    if(ct>=0&&ct<6&&!view2D){const a=Math.sin(Math.min(1,ct/1.2)*Math.PI/2)*(ct>4.8?Math.max(0,(6-ct)/1.2):1);theta+=a*Math.sin(ct*0.55)*0.5;rad*=1-a*0.08;}
    // 2D: fit the whole board under the HUD (top ~20% of the screen)
    const _H2=(ROWS+1.6)/0.8, _need=Math.max(_H2,(COLS+1.6)/Math.max(.3,camera.aspect))/2/Math.tan(FOV*Math.PI/360);
    const _tr=view2D?_need*(cam.rad/CAMRAD):rad; smRad=smRad===undefined?_tr:smRad+(_tr-smRad)*0.15; if(view2D)rad=smRad; else if(Math.abs(smRad-rad)>0.01){rad=smRad;}
    const framing = (view2D? _H2*0.1 : ROWS*0.06);
    let tx=cam.tgt.x, ty=cam.tgt.y, tz=cam.tgt.z-framing;
    if(shakeAmp>0.0005){tx+=(Math.random()-.5)*shakeAmp;ty+=(Math.random()-.5)*shakeAmp*.6;tz+=(Math.random()-.5)*shakeAmp;shakeAmp*=0.86;}
    camera.position.set(tx+rad*Math.sin(phi)*Math.sin(theta),ty+rad*Math.cos(phi),tz+rad*Math.sin(phi)*Math.cos(theta));
    camera.up.set(0,1,0);camera.lookAt(tx,ty,tz);
  }
  // linearise legacy sRGB-authored colours once per material (game code authors colours as sRGB hex)
  function linearize(root){root.traverse(o=>{const m=o.material;if(!m)return;(Array.isArray(m)?m:[m]).forEach(mm=>{
    if(mm.userData._lin)return;mm.userData._lin=1;
    if(mm.color)mm.color.convertSRGBToLinear();if(mm.emissive)mm.emissive.convertSRGBToLinear();
    if(mm.map&&mm.map.encoding!==THREE.sRGBEncoding){mm.map.encoding=THREE.sRGBEncoding;mm.map.needsUpdate=true;mm.needsUpdate=true;}
    if(mm.isMeshBasicMaterial)mm.toneMapped=false;});});}
  // ---------- juice: animations & particles ----------
  function tickAnims(now){
    for(let i=anims.length-1;i>=0;i--){const a=anims[i];const o=a.obj;const t=(now-a.t0)/a.dur;
      if(t<0){o.visible=false;continue;}o.visible=true;
      if(t>=1){o.position.set(a.x,a.y,a.z);o.scale.set(1,1,1);anims.splice(i,1);if(a.done)a.done();continue;}
      if(a.type==='arc'){const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;      // easeInOutQuad
        o.position.set(a.fx+(a.x-a.fx)*e,a.y+Math.sin(Math.PI*e)*a.h,a.fz+(a.z-a.fz)*e);
        const sq=t>.82?Math.sin((t-.82)/.18*Math.PI)*0.18:0;o.scale.set(1+sq*.6,1-sq,1+sq*.6);
        if(!a.hit&&t>.86){a.hit=1;if(a.land)a.land();}
      } else { // drop with bounce + squash
        const fall=.62;
        if(t<fall){const e=t/fall;o.position.set(a.x,a.y+(1-e*e)*a.h,a.z);o.scale.set(.96,1.06,.96);}
        else{if(!a.hit){a.hit=1;if(a.land)a.land();}const u=(t-fall)/(1-fall);
          const b=Math.abs(Math.sin(u*Math.PI*1.6))*Math.pow(1-u,2)*0.14;const sq=Math.sin(Math.min(1,u*3)*Math.PI)*0.2*(1-u);
          o.position.set(a.x,a.y+b,a.z);o.scale.set(1+sq*.55,1-sq,1+sq*.55);}
      }
    }
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];const t=(now-p.t0)/p.dur;
      if(t>=1){fxGroup.remove(p.m);if(p.m.material&&!_keep.has(p.m.material))p.m.material.dispose();parts.splice(i,1);continue;}
      if(p.type==='ring'){const s=p.s0+(p.s1-p.s0)*ease(t);p.m.scale.set(s,s,s);p.m.material.opacity=p.a*(1-t);}
      else{p.vy-=0.0009*16;p.m.position.x+=p.vx;p.m.position.y=Math.max(TOPY+0.01,p.m.position.y+p.vy);p.m.position.z+=p.vz;
        p.m.rotation.x+=p.rx;p.m.rotation.z+=p.rz;if(p.m.position.y<=TOPY+0.011){p.vx*=.8;p.vz*=.8;p.vy*=-0.3;}
        p.m.material.opacity=Math.min(1,(1-t)*1.6);if(p.ghost){const s=1+t*.5;p.m.scale.set(s,1-t*.9,s);}}
    }
  }
  let _shardGeo=null,_dustGeo=null;
  function ringFx(x,z,color,s0,s1,dur,a){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:_ringTex(),color:_lin(color),transparent:true,opacity:a,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
    m.material.userData._lin=1;m.rotation.x=-Math.PI/2;m.position.set(x,TOPY+0.015,z);fxGroup.add(m);parts.push({m,type:'ring',t0:performance.now(),dur,s0,s1,a});}
  function dust(x,z,color){
    ringFx(x,z,color||0xfff1d6,0.5,1.7,520,0.55);
    if(!_dustGeo){_dustGeo=new THREE.IcosahedronGeometry(0.03,0);_keep.add(_dustGeo);}
    for(let i=0,_n=window.GQ?GQ.n(7):7;i<_n;i++){const a=Math.random()*Math.PI*2;
      const m=new THREE.Mesh(_dustGeo,new THREE.MeshBasicMaterial({color:_lin(0xf6e7cc),transparent:true,opacity:.8,depthWrite:false,toneMapped:false}));
      m.material.userData._lin=1;m.position.set(x+Math.cos(a)*.35,TOPY+0.04,z+Math.sin(a)*.35);fxGroup.add(m);
      parts.push({m,t0:performance.now(),dur:600,vx:Math.cos(a)*.012,vy:.012,vz:Math.sin(a)*.012,rx:.1,rz:.1});}
  }
  function shatter(x,z,color,ghostObj,soft){
    if(!_shardGeo){_shardGeo=new THREE.TetrahedronGeometry(0.07,0);_keep.add(_shardGeo);}
    const now=performance.now();
    if(!_dustGeo){_dustGeo=new THREE.IcosahedronGeometry(0.03,0);_keep.add(_dustGeo);}
    if(!soft)for(let i=0,_n=window.GQ?GQ.n(16):16;i<_n;i++){const a=Math.random()*Math.PI*2,sp=_rnd(.02,.05);
      const m=new THREE.Mesh(_shardGeo,new THREE.MeshStandardMaterial({color:_lin(color),roughness:.4,metalness:.1,transparent:true}));
      m.material.userData._lin=1;m.castShadow=true;m.position.set(x,TOPY+0.2,z);const s=_rnd(.6,1.4);m.scale.set(s,s,s);fxGroup.add(m);
      parts.push({m,t0:now,dur:_rnd(800,1200),vx:Math.cos(a)*sp,vy:_rnd(.03,.07),vz:Math.sin(a)*sp,rx:_rnd(-.3,.3),rz:_rnd(-.3,.3)});}
    ringFx(x,z,soft?0xdfe8ff:0xffc070,0.4,soft?1.6:2.4,600,soft?.5:.9);
    if(!soft)for(let i=0,_n=window.GQ?GQ.n(10):10;i<_n;i++){const a=Math.random()*Math.PI*2;   // sparks
      const m=new THREE.Mesh(_dustGeo,new THREE.MeshBasicMaterial({color:_lin(0xffd38a).multiplyScalar(2),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
      m.material.userData._lin=1;m.position.set(x,TOPY+0.25,z);fxGroup.add(m);
      parts.push({m,t0:now,dur:500,vx:Math.cos(a)*.05,vy:_rnd(.03,.08),vz:Math.sin(a)*.05,rx:0,rz:0});}
    if(ghostObj){const gw=new THREE.Group();gw.add(ghostObj);ghostObj.position.set(0,0,0);ghostObj=gw;ghostObj.traverse(o=>{if(o.material){const mm=(Array.isArray(o.material)?o.material:[o.material]).map(q=>{const c=q.clone();c.transparent=true;c.depthWrite=false;c.userData._lin=1;return c;});o.material=Array.isArray(o.material)?mm:mm[0];}});
      ghostObj.position.set(x,TOPY,z);fxGroup.add(ghostObj);
      const p={m:ghostObj,t0:now,dur:520,vx:0,vy:.02,vz:0,rx:0,rz:0,ghost:1};
      p.m.material={opacity:1,dispose(){} };parts.push(p);
      // fade every sub-material together
      const subs=[];ghostObj.traverse(o=>{if(o.material&&o.material.isMaterial)subs.push(o.material);});
      const t0=now;(function fade(){const t=(performance.now()-t0)/520;subs.forEach(s=>s.opacity=Math.max(0,1-t));if(t<1)requestAnimationFrame(fade);else subs.forEach(s=>s.dispose());})();
    }
    shake(soft?0.03:0.16);
  }
  function shake(a){shakeAmp=Math.max(shakeAmp,a);_invalidate(2);}
  // ---------- piece bookkeeping: animate only what actually changed between draws ----------
  function beginPieces(){curPieces=new Map();}
  function addPiece(key,obj,o){
    o=o||{};pieceGroup.add(obj);_invalidate(2);
    const rec={x:obj.position.x,y:obj.position.y,z:obj.position.z,color:o.color,mk:o.ghost};
    curPieces.set(key,rec);
    const live=anims.find(a=>a.key===key);
    if(live){live.obj=obj;obj.visible=false;return;}
    if(prevPieces.has(key)||o.static)return;
    const now=performance.now();
    const first=prevPieces.size===0&&drawCount===0;
    const land=()=>{dust(rec.x,rec.z,o.dustColor);if(o.onLand)o.onLand();};
    if(o.from){anims.push({key,obj,type:'arc',t0:now,dur:430,fx:o.from.x,fz:o.from.z,x:rec.x,y:rec.y,z:rec.z,h:0.9,land});}
    else{const delay=first?Math.min(900,(o.order||0)*22):0;
      anims.push({key,obj,type:'drop',t0:now+delay,dur:first?520:440,x:rec.x,y:rec.y,z:rec.z,h:first?2.2:1.3,land:first?null:land});}
    obj.visible=false;
  }
  function endPieces(o){
    o=o||{};_invalidate(2);
    if(drawCount>0){
      const occupied=new Set();curPieces.forEach(v=>occupied.add(Math.round(v.x)+','+Math.round(v.z)));
      prevPieces.forEach((v,k)=>{if(curPieces.has(k))return;const cell=Math.round(v.x)+','+Math.round(v.z);
        const captured=occupied.has(cell)?true:!!o.emptyIsCapture;
        if(captured&&!o.noFx)shatter(v.x,v.z,v.color||0x888888,v.mk?v.mk():null,o.soft);});
    }
    prevPieces=curPieces;curPieces=null;drawCount++;
  }
  function glowRing(x,z,color,o){o=o||{};_invalidate(2);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:o.disc?_discTex():_ringTex(),color:_lin(color).multiplyScalar(o.k||1.0),transparent:true,opacity:o.a||.75,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
    m.material.userData._lin=1;m.rotation.x=-Math.PI/2;const s=o.size||1.25;m.scale.set(s,s,s);m.position.set(x,o.y!==undefined?o.y:TOPY+0.02,z);
    m.renderOrder=2;m.userData.pulse=o.pulse!==false;m.userData.base=o.a||.9;markGroup.add(m);return m;}
  let pulseT=0;
  function _tick(){
    const now=performance.now();
    updateCam(now);
    pulseT=0.45+0.4*(0.5+0.5*Math.sin(now*0.004));
    markGroup.children.forEach(o=>{if(o.userData.pulse){if(o.material)o.material.opacity=(o.userData.base||0.8)*pulseT;}});
    if(hoverMesh){const tgt=hoverMesh.userData.on&&!view2D?0.22:hoverMesh.userData.on?0.16:0;hoverMesh.material.opacity+=(tgt-hoverMesh.material.opacity)*0.2;}
    tickAnims(now);
    linearize(boardGroup);linearize(pieceGroup);linearize(markGroup);
  }
  // ---------- on-demand rendering support ----------
  // live : 착수 애니메이션·파티클·인트로·흔들림처럼 매 프레임 바뀌는 것이 있다
  // pulse: 천천히 깜박이는 하이라이트만 남았다 → 낮은 주기로만 그린다
  // sig  : 픽셀이 바뀔 수 있는 상태(위치·크기·보임·투명도)를 요약한 해시
  function _hasPulse(){
    for(let i=0;i<markGroup.children.length;i++){const o=markGroup.children[i];if(o.userData&&o.userData.pulse)return true;}
    return false;
  }
  function _stateSig(){
    let h=2166136261;
    const add=v=>{h^=(Math.round(v*1000)|0);h=Math.imul(h,16777619);};
    if(camera){const cp=camera.position;add(cp.x);add(cp.y);add(cp.z);}
    const groups=[boardGroup,pieceGroup,markGroup,fxGroup];
    for(let gi=0;gi<groups.length;gi++){const g=groups[gi];if(!g)continue;add(g.children.length);
      for(let i=0;i<g.children.length;i++){const o=g.children[i];
        add(o.position.x);add(o.position.y);add(o.position.z);add(o.scale.x);add(o.scale.y);add(o.visible?1:0);
        const m=o.material;
        if(m&&!Array.isArray(m)&&!(o.userData&&o.userData.pulse))add(m.opacity===undefined?1:m.opacity);}}
    if(hoverMesh&&hoverMesh.material)add(hoverMesh.material.opacity);
    return h>>>0;
  }
  function _frameState(){
    const now=performance.now();
    if(anims.length||parts.length)return{live:true};
    if(shakeAmp>0.0005)return{live:true};
    if(now-introT0<1750)return{live:true};
    if(now-celebT0<6100)return{live:true};
    return{live:false,pulse:_hasPulse(),sig:_stateSig()};
  }
  function activate(){
    init();
    if(_activeInst!==api)introT0=performance.now();
    _activeInst=api;
    if(_R.domElement.parentNode!==mount)mount.appendChild(_R.domElement);
    onResize();
    requestAnimationFrame(onResize);
    setTimeout(onResize,120);
    _invalidate(2);_wakeRender();
  }
  function deactivate(){ if(_activeInst===api)_activeInst=null; }

  const api={
    init, activate, deactivate, toXZ, _pbr:true, _exposure:0.9,
    _tick, _frameState, _dragRotate, _pickAt, _hover, _zoom:zoom, _onRestore:()=>{_invalidate(2);if(opts.onRestore)opts.onRestore();},
    get scene(){return scene;},
    get camera(){return camera;},
    get pieceGroup(){return pieceGroup;},
    get markGroup(){return markGroup;},
    get THREE(){return THREE;},
    zoom:(d)=>{zoom(d);_invalidate(2);}, resetView:()=>{resetView();_invalidate(2);}, toggle2D:()=>{toggle2D();_invalidate(2);},
    is2D(){return view2D;},
    canRotate(){return !view2D;},
    setActive(v){ v?activate():deactivate(); },
    invalidate(n){_invalidate(n);},
    clearPieces(){disposeChildren(pieceGroup);_invalidate(2);},
    clearMarks(){disposeChildren(markGroup);_invalidate(2);},
    dispose(){ if(_activeInst===api)_activeInst=null; if(scene){disposeChildren(pieceGroup);disposeChildren(markGroup);disposeChildren(boardGroup);} _invalidate(2);},
    ready(){return inited;},
    // v1 visual helpers
    TOPY, beginPieces, addPiece, endPieces, glowRing, dust, shatter, shake,
    intro(){introT0=performance.now();_invalidate(2);}, celebrate(){celebT0=performance.now();_invalidate(2);}
  };
  return api;
}
/* cached, shared go/omok stones: biconvex slate & clamshell */
function _goStone(T,black){
  if(!_goStone.geo){
    const R=0.455,H=0.2,pts=[],N=28;
    for(let i=0;i<=N;i++){const t=i/N*Math.PI;const s=Math.sin(t),c=Math.cos(t);
      const r=(i===0||i===N)?0:R*Math.pow(s,0.42);
      const y=H/2-H/2*Math.sign(c)*Math.pow(Math.abs(c),0.9);pts.push(new T.Vector2(r,y));}
    const geo=new T.LatheGeometry(pts,40);_keep.add(geo);_goStone.geo=geo;
    const shell=_cvTex(256,256,(g,w,h)=>{g.fillStyle='#f6f2ea';g.fillRect(0,0,w,h);
      for(let y=0;y<h;y+=2+Math.random()*4){g.fillStyle='rgba(190,180,160,'+_rnd(.05,.22)+')';g.fillRect(0,y,w,_rnd(.6,1.6));}});
    const ST=(window.BOARD_THEME&&window.BOARD_THEME.stones)||{};
    const bm=new T.MeshPhysicalMaterial({color:_lin(ST.black||0x16171a),roughness:ST.bRough??.36,metalness:ST.bMetal||0,clearcoat:.4,clearcoatRoughness:.35,envMapIntensity:1.0});
    const wm=new T.MeshPhysicalMaterial({color:ST.white||0xffffff,map:shell,roughness:.2,metalness:0,clearcoat:.9,clearcoatRoughness:.1,envMapIntensity:.9});
    bm.userData._lin=wm.userData._lin=1;[bm,wm,shell].forEach(o=>_keep.add(o));_goStone.b=bm;_goStone.w=wm;
  }
  const m=new T.Mesh(_goStone.geo,black?_goStone.b:_goStone.w);m.castShadow=true;m.receiveShadow=true;
  m.rotation.y=Math.random()*6.28;return m;
}
