import{G as $,V as m,M as h,S as D,a as C,A as oe,B as He,C as Sn,b as En,c as Pn,d as K,e as Ce,f as pn,P as Gn,g as $n,W as Hn,h as un,i as Xn,j as Yn,k as qn,T as Kn,l as Jn,m as Zn,n as le,o as tt,R as Ve,D as ze,F as ft,p as Qn,L as eo,q as nt,r as vt,s as Oe,t as fn,u as to,v as no,E as oo,w as ao,U as so,O as ro,N as io,x as lo,y as co,z as mo,H as vn,I as po,J as hn,K as uo}from"./three-CmYxhyL6.js";import{aL as wn,aM as fo,aN as ht,aO as gn,aP as vo,aQ as ho,aR as Ge,F as wo,aS as go,aT as ot}from"./index-PYuIBhYp.js";import{C as yn}from"./sky-qQD64V3e.js";const $e=Math.PI/180;function ce(j,w,b){return new m(Math.cos(w*$e)*Math.cos(j*$e),Math.sin(w*$e),-Math.cos(w*$e)*Math.sin(j*$e)).multiplyScalar(b)}function yo(){const w=document.createElement("canvas");w.width=64,w.height=64;const b=w.getContext("2d");if(b){const I=b.createRadialGradient(32,32,0,32,32,32);I.addColorStop(0,"rgba(255,255,255,1)"),I.addColorStop(.25,"rgba(255,255,255,0.75)"),I.addColorStop(1,"rgba(255,255,255,0)"),b.fillStyle=I,b.fillRect(0,0,64,64)}return new Sn(w)}function xo(){const j=[],w=v=>(j.push(v),v),b=w(yo());function I(v,a,F){const E=new En(w(new Pn({map:b,color:new K(v),transparent:!0,depthWrite:!1,blending:oe})));return E.scale.setScalar(a),E.position.copy(F),E}function X(v,a,F){const E=new Float32Array(v*3),x=new Float32Array(v*3);for(let _=0;_<v;_+=1){const[A,z]=a(_);E.set([A.x,A.y,A.z],_*3),x.set([z.r,z.g,z.b],_*3)}const P=w(new Ce);return P.setAttribute("position",new pn(E,3)),P.setAttribute("color",new pn(x,3)),new Gn(P,w(new $n({size:F,map:b,vertexColors:!0,transparent:!0,depthWrite:!1,blending:oe,sizeAttenuation:!0})))}let B=7;const f=()=>(B=B*16807%2147483647,(B-1)/2147483646),V={},M={};{const v=new $,a=2.6,F=[["alphacen","센타우루스자리 알파",219.9,-60.83,4.37,"#fff4e0","태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요."],["barnard","바너드별",269.45,4.69,5.96,"#ffb27a","작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요."],["wolf359","울프 359",164.12,7.01,7.86,"#ff9a6a","아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요."],["sirius","시리우스",101.29,-16.72,8.6,"#cfe0ff","밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요."],["ross154","로스 154",282.46,-23.84,9.69,"#ffa070","궁수자리 쪽의 작은 붉은 별이에요."],["epseri","에리다누스자리 엡실론",53.23,-9.46,10.5,"#ffd9a8","행성을 거느린 것으로 여겨지는 가까운 별이에요."],["61cyg","백조자리 61",316.7,38.75,11.4,"#ffc58a","처음으로 거리가 재어진 별이에요(1838년)."],["procyon","프로키온",114.83,5.22,11.46,"#fff3d6","작은개자리의 밝은 별이에요."],["epsind","인디언자리 엡실론",330.84,-56.79,11.87,"#ffcf9a","남쪽 하늘의 가까운 별이에요."],["taucet","고래자리 타우",26.02,-15.94,11.9,"#fff0d0","태양과 닮은 별이라 오래전부터 관심을 받았어요."]];v.add(I("#ffe39a",3.2,new m));const E=[{id:"sun-star",name:"태양",line:"우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요.",position:new m}];for(const[x,P,_,A,z,W,J]of F){const se=ce(_,A,z*a);v.add(I(W,2.4,se)),E.push({id:x,name:P,line:`${J} 거리 약 ${z}광년.`,position:se})}v.add(X(500,()=>[new m(f()-.5,f()-.5,f()-.5).normalize().multiplyScalar(60+f()*30),new K().setHSL(.1,.3,.5+f()*.4)],.9)),V.stars=v,M.stars=E}{const v=new $,a=1/40,F=[["pleiades","플레이아데스(좀생이별)",56.75,24.12,444,"#bcd2ff",3,"약 444광년 떨어진 젊은 별 무리예요."],["betelgeuse","베텔게우스",88.79,7.41,548,"#ffab6e",3,"붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요."],["rigel","리겔",78.63,-8.2,860,"#cfe0ff",3,"푸르고 아주 밝은 초거성이에요. 약 860광년."],["orionneb","오리온 대성운",83.82,-5.39,1344,"#ff9ec4",9,"별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요."],["deneb","데네브",310.36,45.28,2600,"#e6eeff",3,"백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실)."]];v.add(I("#ffe39a",1.6,new m));const E=[{id:"sun-orion",name:"태양",line:"우리은하의 오리온 팔 안쪽에 있어요.",position:new m}];for(const[x,P,_,A,z,W,J,se]of F){const Z=ce(_,A,z*a);v.add(I(W,J,Z)),x==="orionneb"&&v.add(X(260,()=>{const ge=Math.pow(f(),.6)*5;return[new m(f()-.5,f()-.5,f()-.5).normalize().multiplyScalar(ge).add(Z),new K(f()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),E.push({id:x,name:P,line:se,position:Z})}v.add(X(1400,()=>{const x=(f()-.5)*120,P=(f()-.5)*22*(.4+f()),_=(f()-.5)*4;return[new m(x,_,P),new K().setHSL(.6+f()*.1,.3,.35+f()*.3)]},.8)),V.orion=v,M.orion=E}{const v=new $,a=4;v.add(X(9e3,E=>{const x=E%a,P=Math.pow(f(),.55)*25,_=x/a*Math.PI*2+Math.log(1+P)*1.9+(f()-.5)*(.5+4/(P+2)),A=(f()-.5)*(P<4?2.2:.7),z=P<4,W=z?new K("#ffd9a0"):new K().setHSL(.58+f()*.06,.45,.45+f()*.35);return[new m(Math.cos(_)*P,A,Math.sin(_)*P),W.multiplyScalar(z?.8:.6)]},.55)),v.add(I("#fff0c8",7,new m));const F=new m(13,0,0);v.add(I("#ffe39a",1.2,F)),V.galaxy=v,M.galaxy=[{id:"center",name:"은하 중심(궁수자리 A*)",line:"태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요.",position:new m},{id:"sun-gal",name:"태양은 여기",line:"중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요.",position:F}]}{const v=new $,a=1/1e5,F=(z,W,J,se,Z)=>X(se,ge=>{const de=Math.pow(f(),.6)*W,ye=ge%2*Math.PI+Math.log(1+de*3)*2.2+(f()-.5)*.9,Se=new m(Math.cos(ye)*de,(f()-.5)*W*.05,Math.sin(ye)*de);Se.applyAxisAngle(new m(1,0,0),J);const We=de<W*.18;return[Se.add(z),new K().setHSL(We?.1:Z,.4,.45+f()*.3).multiplyScalar(We?.35:.22)]},.4),E=new m;v.add(F(E,2.2,0,1800,.6));const x=ce(10.68,41.27,25e5*a);v.add(F(x,4.4,1.2,3200,.1));const P=ce(23.46,30.66,273e4*a);v.add(F(P,1.6,.6,900,.62));const _=ce(80.89,-69.76,16e4*a);v.add(I("#cfd8ff",1.2,_));const A=ce(13.19,-72.83,2e5*a);v.add(I("#cfd8ff",.8,A)),V.group=v,M.group=[{id:"mw",name:"우리 은하",line:"지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요.",position:E},{id:"andromeda",name:"안드로메다은하",line:"약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요.",position:x},{id:"triangulum",name:"삼각형자리은하",line:"약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요.",position:P},{id:"lmc",name:"대마젤란은하",line:"약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요.",position:_}]}{const v=new $,a=6,F=(z,W,J)=>new m(z,W,J).multiplyScalar(a),E=F(5.1,.35,1.1),x=F(3.4,.45,.2),P=F(-1.4,-.3,-.5),_=[[F(.2,0,0),900,6.4*a*.5],[x,280,1.5*a*.5],[P,220,1.7*a*.5],[F(-2.2,1.6,2.4),120,1.1*a*.5]],A=_.reduce((z,W)=>z+W[1],0);v.add(X(A+180,z=>{let W=z;for(const[se,Z,ge]of _){if(W<Z)return[new m(f()-.5,(f()-.5)*.5,f()-.5).multiplyScalar(2*ge*Math.pow(f(),.5)).add(se),new K("#f3eee6").multiplyScalar(.75)];W-=Z}const J=f();return[E.clone().lerp(P,J).add(new m((f()-.5)*.7*a,(f()-.5)*.45*a,(f()-.5)*.7*a)),new K("#e7c48a").multiplyScalar(.8)]},.5)),v.add(new h(w(new D(.95*a,20,16)),w(new C({color:"#d5e2f5",transparent:!0,opacity:.1,blending:oe,depthWrite:!1}))).translateX(x.x).translateY(x.y).translateZ(x.z)),v.add(new h(w(new D(1.05*a,20,16)),w(new C({color:"#e7c48a",transparent:!0,opacity:.09,blending:oe,depthWrite:!1}))).translateX(P.x).translateY(P.y).translateZ(P.z)),v.add(I("#e4b56a",1.2,E)),V.super=v,M.super=[{id:"localgroup",name:"우리 은하군",line:"우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요.",position:E},{id:"virgo-sc",name:"처녀자리 은하단",line:"약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요.",position:x},{id:"attractor-sc",name:"거대 인력체",line:"라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요.",position:P}]}{const v=new $,a=1/1e7,F=ce(187.7,12.4,54e6*a),E=ce(243,-60,2e8*a);v.add(X(5e3,P=>{const _=P%5,z=[F,E,ce(30,20,15e7*a),ce(160,-30,18e7*a),ce(300,40,14e7*a)][_],W=_===1?7:4;return[new m((f()-.5)*2,(f()-.5)*2,(f()-.5)*2).multiplyScalar(W*Math.pow(f(),.4)).add(z),new K().setHSL(.08+f()*.5,.35,.55).multiplyScalar(.8)]},.8)),v.add(I("#ffffff",.8,new m));const x=new h(w(new D(42,48,32)),w(new C({color:"#ff8a4a",transparent:!0,opacity:.08,side:He,depthWrite:!1})));v.add(x),V.cosmos=v,M.cosmos=[{id:"here",name:"우리 은하",line:"여기서는 점 하나예요.",position:new m},{id:"virgo",name:"처녀자리 은하단",line:"약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요.",position:F},{id:"attractor",name:"거대 인력체",line:"약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요.",position:E},{id:"cmb",name:"가장 오래된 빛",line:"우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요.",position:new m(0,0,-42)}]}for(const v of Object.values(V))v.visible=!1;return{groups:V,markers:M,dispose:()=>j.forEach(v=>v.dispose())}}const bo="textures/",ae=Math.PI/180;function at(j,w,b=1){return new m(Math.cos(j*ae)*Math.cos(w*ae),Math.sin(j*ae),-Math.cos(j*ae)*Math.sin(w*ae)).multiplyScalar(b)}const L=2.2,Mo=Date.UTC(2e3,0,1,12),xn={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},bn={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function zo(){if(typeof window>"u")return!0;const j=navigator,w=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,b=j.hardwareConcurrency??8,I=j.deviceMemory??8;return!!(w||b<=4||I<=4)}function So(){const w=document.createElement("canvas");w.width=128,w.height=128;const b=w.getContext("2d");if(b){const I=b.createRadialGradient(64,64,0,64,64,64);I.addColorStop(0,"rgba(255,238,205,0.85)"),I.addColorStop(.3,"rgba(255,214,150,0.55)"),I.addColorStop(.45,"rgba(255,190,120,0.22)"),I.addColorStop(.7,"rgba(250,170,95,0.07)"),I.addColorStop(1,"rgba(255,160,80,0)"),b.fillStyle=I,b.fillRect(0,0,128,128)}return new Sn(w)}const Eo=`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vTangent;
varying vec3 vBitangent;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec3 nrm = normalize(normal);
  vec3 tangent = cross(vec3(0.0, 1.0, 0.0), nrm);
  if (dot(tangent, tangent) < 0.0001) tangent = vec3(1.0, 0.0, 0.0);
  vTangent = normalize(mat3(modelMatrix) * tangent);
  vBitangent = normalize(cross(vNormal, vTangent));
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Po=`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vTangent;
varying vec3 vBitangent;
uniform sampler2D dayMap;
uniform sampler2D bumpMap;
uniform vec2 texel;
uniform float useMap;
uniform float useBump;
uniform float relief;
uniform float gain;
uniform vec3 base;
uniform vec3 glow;
uniform float atmo;
uniform float ringShadow;
uniform sampler2D ringMap;
uniform float ringInner;
uniform float ringOuter;
uniform vec3 ringCenter;
uniform vec3 ringNormal;
void main() {
  vec3 col = useMap > 0.5 ? texture2D(dayMap, vUv).rgb : base;
  vec3 n = normalize(vNormal);
  if (useBump > 0.5) {
    float hC = texture2D(bumpMap, vUv).r;
    float hR = texture2D(bumpMap, vUv + vec2(texel.x, 0.0)).r;
    float hU = texture2D(bumpMap, vUv + vec2(0.0, texel.y)).r;
    n = normalize(n + vTangent * (hC - hR) * relief + vBitangent * (hC - hU) * relief);
  }
  vec3 sunDir = normalize(-vWorld);
  float wrap = clamp(dot(n, sunDir) * 0.72 + 0.28, 0.0, 1.0);
  col *= mix(gain * 0.42, gain, wrap);
  // 토성: 표면에서 해 쪽으로 뻗은 광선이 고리 평면을 지나는 자리에 고리가 있으면 그 고리가
  // 이 점을 가립니다. 고리의 알파·밴드 패턴을 그대로 읽어 표면에 고리 모양 그림자를 드리워요.
  if (ringShadow > 0.5) {
    vec3 toSun = normalize(-vWorld);
    float facing = dot(ringNormal, toSun);
    if (abs(facing) > 1e-4) {
      float t = dot(ringCenter - vWorld, ringNormal) / facing;
      if (t > 0.0) {
        float away = length(vWorld + toSun * t - ringCenter);
        if (away > ringInner && away < ringOuter) {
          float ratio = clamp((away - ringInner) / max(ringOuter - ringInner, 0.001), 0.0, 1.0);
          float band = texture2D(ringMap, vec2(ratio, 0.5)).a;
          col *= mix(1.0, 0.32, clamp(band, 0.0, 1.0) * 0.92);
        }
      }
    }
  }
  float rim = pow(1.0 - clamp(dot(normalize(vNormal), normalize(cameraPosition - vWorld)), 0.0, 1.0), 2.1);
  col += glow * rim * atmo;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function ko(j){return Math.max(.12,.16+.11*Math.log2(j/2e3))}const Co=`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vTangent;
varying vec3 vBitangent;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec3 nrm = normalize(normal);
  vec3 tangent = cross(vec3(0.0, 1.0, 0.0), nrm);
  if (dot(tangent, tangent) < 0.0001) tangent = vec3(1.0, 0.0, 0.0);
  vTangent = normalize(mat3(modelMatrix) * tangent);
  vBitangent = normalize(cross(vNormal, vTangent));
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Wo=`
uniform sampler2D dayMap;
uniform sampler2D nightMap;
uniform sampler2D normalMap;
uniform sampler2D specMap;
uniform vec2 texel;
uniform vec3 sunDir;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vTangent;
varying vec3 vBitangent;
void main() {
  vec3 dayCol = texture2D(dayMap, vUv).rgb;
  vec3 nightCol = texture2D(nightMap, vUv).rgb;
  vec3 tn = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
  vec3 n = normalize(vTangent * tn.x - vBitangent * tn.y + vNormal * tn.z);
  vec3 sunV = normalize(sunDir);
  float d = dot(normalize(vNormal), sunV);
  float wrap = clamp(dot(n, sunV) * 0.72 + 0.28, 0.0, 1.0);
  float k = smoothstep(-0.12, 0.18, d);
  vec3 color = dayCol * mix(0.2, 1.62, wrap);
  // 바다 반사: 좁고 강한 반짝임 + 넓고 옅은 빛
  vec3 viewDir = normalize(cameraPosition - vWorld);
  vec3 smoothN = normalize(vNormal);
  float ocean = texture2D(specMap, vUv).r;
  float sunSide = smoothstep(-0.05, 0.25, dot(smoothN, sunV));
  // 바다가 해 쪽을 향할 때의 옅은 반사. 거울 반사(글린트)는 이 화면 거리에서 바다를
  // 통째로 덮어 버려 넣지 않고, 해 쪽 바다만 살짝 밝히는 정도로 둡니다.
  color += ocean * smoothstep(0.2, 1.0, sunSide) * vec3(0.03, 0.05, 0.08);
  float rim = pow(1.0 - clamp(dot(smoothN, viewDir), 0.0, 1.0), 4.0);
  color += ocean * rim * vec3(0.05, 0.09, 0.16) * wrap;
  // 밤 쪽 도시 불빛: 조금 번지게 두 번 걸음
  vec3 blur = texture2D(nightMap, vUv + vec2(texel.x * 1.5, 0.0)).rgb;
  blur += texture2D(nightMap, vUv - vec2(texel.x * 1.5, 0.0)).rgb;
  blur += texture2D(nightMap, vUv + vec2(0.0, texel.y * 1.5)).rgb;
  blur += texture2D(nightMap, vUv - vec2(0.0, texel.y * 1.5)).rgb;
  blur *= 0.25;
  vec3 lights = pow(nightCol, vec3(1.2)) * vec3(1.15, 0.92, 0.62) * 0.7 + pow(blur, vec3(1.1)) * vec3(1.05, 0.82, 0.55) * 0.8;
  float city = smoothstep(0.62, 0.05, wrap) * (1.0 - k);
  color += lights * city * 8.0;
  gl_FragColor = vec4(mix(nightCol * 0.28 + vec3(0.004, 0.006, 0.012), color, k), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,No=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Ro=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,Mn=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,zn=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 tint;
uniform float power;
uniform float strength;
uniform float edge;
void main() {
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float facing = dot(viewDir, normalize(vNormal));
  float fresnel = gl_FrontFacing ? pow(1.0 - clamp(facing, 0.0, 1.0), power) : pow(clamp(-facing / edge, 0.0, 1.0), 1.4);
  // 밤 쪽은 대기가 거의 보이지 않게(원작은 늘 밝아 흰 띠가 생겼어요)
  float lit = smoothstep(-0.35, 0.35, dot(normalize(vNormal), normalize(-vWorld)));
  gl_FragColor = vec4(mix(tint, vec3(0.92, 0.94, 0.97), fresnel * 0.7), fresnel * strength * (0.12 + 0.88 * lit));
}`,To=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Ao=`
uniform vec3 poleN;
uniform vec3 poleS;
uniform float time;
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// 자기 위도 67° 근처를 도는 타원 띠. 경도 방향 파동과 빛줄기, 느린 물결
float oval(vec3 pole) {
  float mlat = degrees(asin(clamp(dot(vLocal, pole), -1.0, 1.0)));
  vec3 side = normalize(cross(pole, vec3(0.0, 1.0, 0.0)) + vec3(1e-4));
  vec3 side2 = cross(pole, side);
  float mlon = atan(dot(vLocal, side2), dot(vLocal, side));
  float wiggle = noise(vec2(mlon * 3.0, time * 0.35)) * 3.2 - 1.6;
  float band = exp(-pow((mlat - 67.0 - wiggle) / 2.3, 2.0));
  float rays = 0.55 + 0.45 * noise(vec2(mlon * 26.0 + time * 0.8, time * 0.6));
  float pulse = 0.75 + 0.25 * sin(time * 0.9 + mlon * 2.0);
  return band * rays * pulse;
}
void main() {
  float a = oval(poleN) + oval(poleS);
  // 밤 쪽에서 또렷하고, 낮 쪽에서도 가장자리에서는 옅게 남습니다
  float night = smoothstep(0.25, -0.3, dot(normalize(vWorldNormal), normalize(-vWorld)));
  float shown = 0.28 + 0.72 * night;
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float edge = 1.0 - abs(dot(viewDir, normalize(vWorldNormal)));
  float curtain = 0.5 + edge * 1.15;
  vec3 blue = vec3(0.2, 0.55, 1.0);
  vec3 violet = vec3(0.55, 0.28, 0.95);
  vec3 color = mix(blue, violet, smoothstep(0.45, 1.0, edge) * 0.6);
  gl_FragColor = vec4(color * a * shown * curtain * 0.62, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Lo=`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
uniform float uTime;
uniform float seed;
void main() {
  vUv = uv;
  vec3 p = position;
  float lift = 1.0 + 0.06 * sin(uTime * 0.45 + seed * 6.0) * sin(uv.x * 3.1416);
  p *= mix(1.0, lift, sin(uv.x * 3.1416));
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Do=`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
uniform float uTime;
uniform float seed;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  float along = vUv.x;
  float flow = noise(vec2(along * 18.0 - uTime * 0.9 + seed * 9.0, vUv.y * 4.0 + seed));
  float wisps = noise(vec2(along * 46.0 + uTime * 0.5, vUv.y * 9.0 - seed * 3.0));
  float ends = smoothstep(0.0, 0.12, along) * smoothstep(1.0, 0.88, along);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float soft = pow(abs(dot(viewDir, normalize(vNormal))), 0.8);
  float a = (0.35 + 0.65 * flow) * (0.55 + 0.45 * wisps) * ends * soft;
  vec3 color = mix(vec3(0.78, 0.1, 0.02), vec3(1.0, 0.42, 0.14), flow);
  gl_FragColor = vec4(color * a * 1.05, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Io=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,_o=`
varying vec2 vUv;
varying vec3 vWorld;
uniform sampler2D ringMap;
uniform float innerRatio;
uniform float planetRadius;
uniform vec3 planetCenter;
void main() {
  float radial = clamp((length(vUv * 2.0 - 1.0) - innerRatio) / max(1.0 - innerRatio, 0.001), 0.0, 1.0);
  vec4 ring = texture2D(ringMap, vec2(radial, 0.5));
  if (ring.a < 0.04) discard;
  // 태양 쪽에 있는 행성이 고리에 만드는 그림자
  vec3 toSun = normalize(-vWorld);
  vec3 rel = vWorld - planetCenter;
  float along = dot(rel, toSun);
  float across = length(rel - toSun * along);
  float shadow = 1.0 - 0.72 * step(0.0, along) * (1.0 - smoothstep(planetRadius * 0.9, planetRadius * 1.04, across));
  gl_FragColor = vec4(ring.rgb * 2.4 * shadow, ring.a * 0.9);
}`,Uo=`
attribute vec4 orbit;
attribute vec4 shape;
uniform float uDays;
uniform float uTime;
uniform float uScale;
varying float vLight;
varying float vShade;
float shownRadius(float au) {
  if (au < 1.8) return 1.15 + 1.45 * au;
  return 3.76 + 1.55 * log2(au / 1.8);
}
mat3 spin(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat3(
    oc * axis.x * axis.x + c, oc * axis.x * axis.y + axis.z * s, oc * axis.z * axis.x - axis.y * s,
    oc * axis.x * axis.y - axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z + axis.x * s,
    oc * axis.z * axis.x + axis.y * s, oc * axis.y * axis.z - axis.x * s, oc * axis.z * axis.z + c
  );
}
void main() {
  float a = orbit.x;
  float e = orbit.z;
  float periodDays = 365.25 * pow(a, 1.5);
  float theta = orbit.y + 6.2831853 * fract(uDays / periodDays);
  float r = a * (1.0 - e * e) / (1.0 + e * cos(theta - orbit.w));
  vec3 flat3 = vec3(cos(theta), 0.0, sin(theta));
  vec3 axis = vec3(cos(shape.y), 0.0, sin(shape.y));
  vec3 dir = spin(axis, shape.x) * flat3;
  vec3 center = dir * shownRadius(r) * uScale;
  mat3 roll = spin(vec3(0.3, 1.0, 0.2) + shape.w, uTime * (0.4 + shape.w));
  vec3 world = center + roll * position * shape.z * uScale;
  vec3 n = roll * normal;
  vLight = clamp(dot(normalize(n), normalize(-center)), 0.0, 1.0);
  vShade = shape.w;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}`,Fo=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function Go(j,w){const b=zo(),I=b?96:128,X=new Hn({antialias:!0,powerPreference:"default",alpha:!1});X.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),X.outputColorSpace=un,X.toneMapping=Xn,X.toneMappingExposure=1.1;const B=X.domElement;B.style.display="block",B.style.width="100%",B.style.height="100%",B.style.touchAction="none",j.appendChild(B);const f=document.createElement("div");f.className="space-labels",j.appendChild(f);const V=new Yn;V.background=new K("#05070d");const M=new qn(45,1,.01,2e3),v=[],a=e=>(v.push(e),e),F=new Kn;let E=0;const x=(e,n=!0)=>{E+=1;const o=F.load(bo+e,()=>{E-=1,E===0&&w.onReady?.()},void 0,()=>{E-=1,E===0&&w.onReady?.()});return o.colorSpace=n?un:io,o.anisotropy=b?4:8,a(o)},P=new h(a(new D(900,48,24)),a(new C({map:x("milkyway.webp"),side:He,depthWrite:!1})));P.rotation.set(63*ae,0,0),V.add(P),V.add(new Jn(16777215,.14));const _=new Zn(16777215,1.6,0,0);_.decay=0,V.add(_);const A=new $;V.add(A);const z=new Map,W=new Map,J=new Map,se=[],Z=new Map;let ge=null,de=null;const ye=new Map,Se=new Map,We=new Map,ue=new Map;let g=null,wt=0,Ne=null;const st=[],gt=[],yt=[],xt=[],bt=[];let rt=null;const Mt=()=>(rt||(rt=x("saturn-ring.webp")),rt);let fe=Date.now(),De=!0,zt=null;function Xe(e,n,o,s){const l=xn[o]??[.7,.7,.7,.06],c=bn[o],d=new K(n),u=e?x(e):null,t=c?.relief??0;return a(new le({uniforms:{dayMap:{value:u},bumpMap:{value:t>0?u:null},texel:{value:new tt(c?.texel?.[0]??1/1024,c?.texel?.[1]??1/512)},useMap:{value:e?1:0},useBump:{value:t>0?1:0},relief:{value:t*.35},gain:{value:(c?.gain??1.9)*.6},base:{value:new m(d.r,d.g,d.b)},glow:{value:new m(l[0],l[1],l[2])},atmo:{value:Math.min(l[3]*2.2,.85)},ringShadow:{value:s?1:0},ringMap:{value:s?Mt():null},ringInner:{value:s?.inner??1},ringOuter:{value:s?.outer??2},ringCenter:{value:new m},ringNormal:{value:new m(0,1,0)}},vertexShader:Eo,fragmentShader:Po}))}function kn(e,n,o){const s=bn[o],l=s?.tint??xn[o]?.slice(0,3);if(!l||b)return;const c=Math.min(s?.inner??.12,.5)*.55,d=Math.min(s?.outer??.05,.2)*.9,u=new m(l[0],l[1],l[2]),t=Math.sqrt(1-1/(1.045*1.045)),r=(i,y,S,G)=>new h(a(new D(n*i,b?24:32,b?16:24)),a(new le({uniforms:{tint:{value:u},power:{value:S},strength:{value:G},edge:{value:t}},vertexShader:Mn,fragmentShader:zn,side:y,transparent:!0,blending:oe,depthWrite:!1})));e.add(r(1.045,He,2.7,c),r(1.16,vn,3.4,d))}function Cn(e,n){const o=a(new le({uniforms:{poleN:{value:at(80.7,-72.7,1).normalize()},poleS:{value:at(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:To,fragmentShader:Ao,transparent:!0,blending:oe,depthWrite:!1})),s=new h(a(new D(n*1.022,b?64:96,b?48:64)),o);s.renderOrder=1,e.add(s),xt.push(o)}function Wn(e,n){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([s,l,c,d,u],t)=>{const r=at(s,l,1).normalize(),i=new m(0,1,0).cross(r).normalize(),y=new m().crossVectors(r,i).normalize(),S=i.multiplyScalar(Math.cos(u)).addScaledVector(y,Math.sin(u)).normalize(),G=[];for(let ee=0;ee<=16;ee+=1){const te=ee/16,ne=(te-.5)*c,re=Math.sin(te*Math.PI)*d;G.push(new m().copy(r).multiplyScalar(Math.cos(ne)).addScaledVector(S,Math.sin(ne)).normalize().multiplyScalar(n*(.985+re)))}const Y=a(new le({uniforms:{uTime:{value:0},seed:{value:t*.37+.11}},vertexShader:Lo,fragmentShader:Do,transparent:!0,blending:oe,side:ze,depthWrite:!1})),ke=new h(a(new lo(new co(G),64,n*.022,8,!1)),Y);ke.raycast=()=>{},e.add(ke),bt.push(Y)})}function St(e,n,o=""){const s=document.createElement("button");s.type="button",s.className="space-label"+o,s.textContent=n,s.addEventListener("click",()=>w.onPick?.(e)),f.appendChild(s),J.set(e,s)}const Et=a(new le({uniforms:{map:{value:x("sun.webp")},time:{value:0}},vertexShader:`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vUv = uv;
          vec4 world = modelMatrix * vec4(position, 1.0);
          vNormal = normalize(mat3(modelMatrix) * normal);
          vView = normalize(cameraPosition - world.xyz);
          gl_Position = projectionMatrix * viewMatrix * world;
        }`,fragmentShader:`
        uniform sampler2D map;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vView;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }
        void main() {
          vec2 uv = vUv;
          uv.x += 0.004 * sin(uv.y * 40.0 + time * 0.6) + 0.003 * noise(uv * 30.0 + time * 0.15);
          uv.y += 0.003 * cos(uv.x * 36.0 - time * 0.5);
          vec3 col = texture2D(map, uv).rgb;
          float cells = noise(vUv * vec2(220.0, 110.0) + vec2(time * 0.35, -time * 0.2));
          col *= 0.86 + 0.28 * cells;
          float mu = clamp(dot(normalize(vNormal), vView), 0.0, 1.0);
          col *= 0.55 + 0.45 * pow(mu, 0.6);
          col *= 1.1;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`})),Ie=new m,Nn=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],Pt=new Map;let ve=null;const Rn={moon:"earth",...Object.fromEntries(wn.map(e=>[e.id,e.parent]))};function kt(e,n){const o=Rn[e];if(ve===null||!o)return ot(e,n);const s=ot(o,n),l=ot(e,ve),c=ot(o,ve);return{x:s.x+l.x-c.x,y:s.y+l.y-c.y,z:s.z+l.z-c.z}}function _e(e){for(const[n,o]of W){if(n==="sun")continue;const s=kt(n,e);o.position.set(s.x*L,s.y*L,s.z*L)}for(const[n,o]of ye){const s=kt(n,e);o.position.set(s.x*L,s.y*L,s.z*L)}if(Ne){Ie.copy(Ne.holder.position);const n=Ie.length()||1;Ne.tail.visible=n/L<8,Ie.multiplyScalar(1/n),Ne.tail.quaternion.setFromUnitVectors(new m(0,1,0),Ie),Ne.tail.position.copy(Ie).multiplyScalar(.16*L)}}const Re=new m(1,0,0),Tn=a(new le({uniforms:{dayMap:{value:x("earth-day.webp")},nightMap:{value:x("earth-night.webp")},normalMap:{value:x("earth-normal.webp",!1)},specMap:{value:x("earth-spec.webp",!1)},texel:{value:new tt(1/2048,1/1024)},sunDir:{value:Re}},vertexShader:Co,fragmentShader:Wo}));function An(e){const n=new $,o=new h(a(new D(e,b?96:128,64)),Tn);o.name="earth",n.add(o);const s=new h(a(new D(e*1.012,80,48)),a(new mo({map:x("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));n.add(s),ge=s;const l=new h(a(new D(e*1.06,64,48)),a(new le({uniforms:{sunDir:{value:Re}},vertexShader:`
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vec4 world = modelMatrix * vec4(position, 1.0);
              vNormal = normalize(mat3(modelMatrix) * normal);
              vView = normalize(cameraPosition - world.xyz);
              gl_Position = projectionMatrix * viewMatrix * world;
            }`,fragmentShader:`
            uniform vec3 sunDir;
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              float rim = pow(1.0 - abs(dot(normalize(vNormal), vView)), 2.6);
              float lit = smoothstep(-0.25, 0.35, dot(normalize(vNormal), normalize(sunDir)));
              vec3 col = vec3(0.32, 0.6, 1.0) * rim * (0.15 + 1.1 * lit);
              gl_FragColor = vec4(col, rim);
              #include <tonemapping_fragment>
            }`,side:He,transparent:!0,blending:oe,depthWrite:!1})));n.add(l);const c=new h(a(new D(e*1.15,b?24:32,b?16:24)),a(new le({uniforms:{tint:{value:new m(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:Mn,fragmentShader:zn,side:vn,transparent:!0,blending:oe,depthWrite:!1})));return n.add(c),z.set("earth",o),n}function Ct(e,n,o){for(const s of Ge(e).sites??[]){const l=new h(a(new D(o*.018,12,8)),a(new C({color:"#3182f6"})));l.position.copy(at(s.lat,s.lon,o*1.004)),n.add(l);const c=document.createElement("div");c.className="space-site",c.textContent=s.name,f.appendChild(c),se.push({mesh:l,site:s,el:c,parent:e})}}let Ue=null;for(const e of fo){if(e.id==="moon")continue;const n=new $;if(W.set(e.id,n),A.add(n),e.id==="sun"){const o=.26*L,s=new h(a(new D(o,b?96:128,b?64:80)),Et);s.name="sun",Z.set("sun",o),n.add(s),Wn(s,o);for(const[c,d,u,t]of[[1.06,2,.95,"#ffbf78"]])n.add(new h(a(new D(o*c,b?32:48,b?24:32)),a(new le({uniforms:{color:{value:new K(t)},power:{value:d},strength:{value:u}},vertexShader:No,fragmentShader:Ro,transparent:!0,blending:oe,depthWrite:!1}))));z.set("sun",s);const l=new En(a(new Pn({map:a(So()),blending:oe,transparent:!0,depthWrite:!1,depthTest:!0,color:new K("#ffd9a0")})));l.scale.setScalar(o*3.6),n.add(l),de=l}else{const o=ht(e.id).radius*L;Z.set(e.id,o);let s;if(e.id==="earth"){const u=An(o);u.rotation.z=-e.tilt*ae,n.add(u),Ue=u,s=u.children[0]}else{const u=e.id==="saturn"?{inner:o*1.18,outer:o*2.08}:void 0;s=new h(a(new D(o,b?96:128,64)),Xe(e.texture,e.color,e.id,u)),s.name=e.id,s.rotation.z=-e.tilt*ae,n.add(s),z.set(e.id,s),kn(n,o,e.id),e.id==="jupiter"&&Cn(s,o)}if(e.axes){const[u,t,r]=e.axes;s.scale.set(1,r/u,t/u)}if(e.ring&&e.axes){const u=e.axes[0]/2,t=o*(e.ring.radius-e.ring.width/2)/u,r=o*(e.ring.radius+e.ring.width/2)/u,i=new h(a(new Ve(t,Math.max(r,t*1.03),128,1)),a(new C({color:"#8b8580",side:ze,transparent:!0,opacity:.75,depthWrite:!1})));i.rotation.x=Math.PI/2,n.add(i)}if(e.id==="saturn"){const u=o*1.18,t=o*2.08,r=new Ve(u,t,160,1),i=new h(a(r),a(new le({uniforms:{ringMap:{value:Mt()},innerRatio:{value:u/t},planetRadius:{value:o},planetCenter:{value:new m}},vertexShader:Io,fragmentShader:_o,side:ze,transparent:!0,depthWrite:!1})));i.rotation.x=Math.PI/2,s.add(i),gt.push({mesh:i,parent:e.id}),yt.push({mesh:s,material:s.material})}e.sites&&Ct(e.id,s,o);const l=gn(e.id,.022),c=a(new Ce);c.setAttribute("position",new ft(l.positions,3)),c.setIndex(l.index),c.scale(L,L,L);const d=new h(c,a(new C({color:ht(e.id).ribbon,transparent:!0,opacity:.5,side:ze,depthWrite:!1})));st.push(d),A.add(d)}St(e.id,e.name,e.id==="sun"?"":" is-planet")}const Wt=[];function Nt(e,n,o){let s=e==="main"?1234:98765;const l=()=>(s=s*16807%2147483647,(s-1)/2147483646),c=a(new po(1,0)),d=new Float32Array(n*4),u=new Float32Array(n*4);for(let i=0;i<n;i+=1){let y;if(e==="main")do y=2.1+l()*1.2;while((Math.abs(y-2.5)<.03||Math.abs(y-2.82)<.03||Math.abs(y-2.95)<.02)&&l()<.85);else y=l()<.18?39.2+(l()-.5)*1.2:42+(l()-.5)*6.5;d[i*4]=y,d[i*4+1]=l()*Math.PI*2,d[i*4+2]=l()*(e==="main"?.18:.12),d[i*4+3]=l()*Math.PI*2,u[i*4]=(l()-.5)*(e==="main"?.32:.5),u[i*4+1]=l()*Math.PI*2;const S=l()**3;u[i*4+2]=(e==="main"?.0035:.009)*(.7+S*2.4),u[i*4+3]=l()}c.setAttribute("orbit",new hn(d,4)),c.setAttribute("shape",new hn(u,4));const t=a(new le({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new K(o)},uScale:{value:L}},vertexShader:Uo,fragmentShader:Fo})),r=new uo(c,t,n);r.frustumCulled=!1,r.raycast=()=>{},A.add(r),Wt.push({mesh:r,material:t})}Nt("main",b?1800:4200,"#9c9184"),Nt("kuiper",b?1500:3600,"#7f8b9c");for(const e of wn){const n=new $,o=new h(a(new D(e.radius*L,32,24)),Xe(`${e.id}.webp`,e.color,e.id));o.name=e.id,n.add(o),A.add(n),ye.set(e.id,n),Se.set(e.id,o);const s=document.createElement("button");s.type="button",s.className="space-label is-small",s.textContent=e.name,s.addEventListener("click",()=>w.onExtra?.(e.id)),f.appendChild(s),We.set(e.id,{el:s,parent:e.parent})}{const e=new $,n=new h(a(new D(.045*L,20,16)),a(new C({color:"#f7fbff"})));n.name="halley",e.add(n);const o=new h(a(new Qn(.04*L,.32*L,12)),a(new C({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(o),Ne={holder:e,tail:o},A.add(e),ye.set("halley",e),Se.set("halley",n);const s=gn("halley",.022),l=a(new Ce);l.setAttribute("position",new ft(s.positions,3)),l.setIndex(s.index),l.scale(L,L,L);const c=new h(l,a(new C({color:ht("halley").ribbon,transparent:!0,opacity:.35,side:ze,depthWrite:!1})));st.push(c),A.add(c);const d=document.createElement("button");d.type="button",d.className="space-label is-small",d.textContent="핼리 혜성",d.addEventListener("click",()=>w.onExtra?.("halley")),f.appendChild(d),We.set("halley",{el:d,parent:null})}for(const e of vo){const n=ho(e),o=n.points.map(S=>new m(S.x*L,S.y*L,S.z*L)),s=a(new Ce().setFromPoints(o)),l=new eo(s,a(new nt({color:e.color,transparent:!0,opacity:.95})));l.visible=!1;const c=new $,d=new h(a(new vt(.03,.01,.01,20)),a(new C({color:"#d8dde4"})));d.rotation.x=Math.PI/2;const u=new h(a(new D(.014,12,8)),a(new C({color:"#c9ced6"})));u.position.z=-.02;const t=new h(a(new vt(.002,.002,.09,6)),a(new C({color:"#aab3c0"})));t.rotation.z=Math.PI/2,t.position.z=-.02;const r=new h(a(new D(.035,16,12)),a(new C({color:e.color,transparent:!0,opacity:.18,blending:oe,depthWrite:!1})));c.add(d,u,t,r),c.scale.setScalar(e.frame==="earth"?.8:1.3),c.position.copy(o[o.length-1]),l.add(c),(e.frame==="earth"?W.get("earth")??A:A).add(l);const y=document.createElement("div");y.className="space-site is-probe",y.textContent=e.name,f.appendChild(y),ue.set(e.id,{line:l,probe:c,el:y,points:o,times:n.points.map(S=>S.t),marks:n.marks,frame:e.frame})}if(_e(fe),Ue){const e=.055*L;Z.set("moon",e);const n=new h(a(new D(e,I,48)),Xe("moon.webp","#b8b8b8","moon"));n.name="moon";const o=new $;o.add(n),A.add(o),z.set("moon",n),W.set("moon",o),Ct("moon",n,e),St("moon","달"," is-small"),_e(fe)}const Fe=new $,Te=new $,Ye=new $;Fe.add(Te,Ye),Fe.visible=!1;let Rt="solar",xe=!1,it=0;const k={moon:new h,moonMat:a(new C({color:"#ffffff"})),shadow:a(new C({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new h,umbra:new h,skyCover:new h,skySun:new $,skyMoon:new $,skyMoonMat:a(new C({color:"#ffffff"}))},Tt=[],At=x("sun.webp"),Lt=x("moon.webp"),Dt=new h(a(new D(.62,32,24)),a(new C({map:At})));Dt.position.set(-3.3,0,0);const It=new h(a(new D(.4,32,24)),a(new C({map:x("earth-day.webp")})));It.position.set(1.85,0,0),k.moonMat.map=Lt,k.moon=new h(a(new D(.14,24,18)),k.moonMat),k.cone=new h(a(new vt(.04,.16,.78,18)),k.shadow),k.cone.position.set(1.42,0,0),k.cone.rotation.z=Math.PI/2,k.umbra=new h(a(new Oe(.3,28)),a(new C({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),k.umbra.position.set(2.75,0,.02),Te.add(Dt,It,k.moon,k.cone,k.umbra);for(const[e,n]of[["태양",new m(-3.3,.85,0)],["지구",new m(1.85,.68,0)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,f.appendChild(o),Tt.push({el:o,at:n,group:Te})}const Ln=new h(a(new Oe(1.35,48)),a(new C({map:At}))),Dn=new h(a(new Ve(1.4,1.7,48)),a(new C({color:"#f0c36a",transparent:!0,opacity:.45,side:ze,depthWrite:!1})));k.skyCover=new h(a(new Oe(1.22,48)),a(new C({color:"#141820"}))),k.skySun.add(Ln,Dn,k.skyCover),k.skyMoonMat.map=Lt;const In=new h(a(new Oe(.92,48)),k.skyMoonMat),_t=new h(a(new Oe(1.08,48)),a(new C({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));_t.position.z=.16,k.skyMoon.add(In,_t),Ye.add(k.skySun,k.skyMoon),Ye.visible=!1,V.add(Fe);const be=new $;be.visible=!1,be.rotation.z=-Math.PI/2;const Ut=[],Ft=4.6,_n=e=>Ft*e/696e3,jt=new h(a(new D(Ft,64,40)),a(new C({map:x("sun.webp")})));jt.position.set(-3.2,0,0),be.add(jt);const Un=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let Bt=2.4;const Vt=(e,n)=>{const o=document.createElement("div");o.className="space-site",o.textContent=e,f.appendChild(o),Ut.push({el:o,at:n,group:be})};Vt("태양",new m(-3.2,4.9,0));for(const[e,n]of Un){const o=_n(n),s=Bt+o;Bt=s+o+.72;const l=Ge(e),c=e==="earth"?"earth-day.webp":l.texture,d=new h(a(new D(o,32,24)),a(new C(c?{map:x(c)}:{color:l.color})));if(d.position.set(s,0,0),l.axes&&d.scale.set(1,l.axes[2]/l.axes[0],l.axes[1]/l.axes[0]),be.add(d),e==="saturn"){const u=o*1.18,t=o*2.08,r=a(new Ve(u,t,96,1)),i=r.attributes.position,y=r.attributes.uv,S=new m;for(let Y=0;Y<i.count;Y+=1)S.fromBufferAttribute(i,Y),y.setXY(Y,(S.length()-u)/(t-u),.5);const G=new h(r,a(new C({map:x("saturn-ring.webp"),transparent:!0,opacity:.9,side:ze,depthWrite:!1})));G.rotation.y=Math.PI/2-.36,d.add(G)}Vt(l.name,new m(s,(e==="saturn"?o*2.08:o)+.12,0))}V.add(be);const me=new $;me.visible=!1;const lt=[],Ot=[],Fn=new h(a(new D(.55,48,32)),a(new C({color:"#e0703a"})));me.add(Fn);for(const[e,n]of[[1.35,.16],[2.1,.05]])me.add(new h(a(new D(.55*e,32,24)),a(new C({color:"#ff6a30",transparent:!0,opacity:n,side:He,blending:oe,depthWrite:!1}))));const Gt=new h(a(new Ve(2.6,5.1,96,1)),a(new C({color:"#3fbf7f",transparent:!0,opacity:.12,side:ze,depthWrite:!1})));Gt.rotation.x=Math.PI/2,me.add(Gt),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,n,o,s,l],c)=>{const d=new fn(a(new Ce().setFromPoints(Array.from({length:128},(r,i)=>new m(Math.cos(i/128*Math.PI*2)*o*100,0,Math.sin(i/128*Math.PI*2)*o*100)))),a(new nt({color:"#8b95a1",transparent:!0,opacity:.35})));me.add(d);const u=new h(a(new D(.16*s,24,16)),Xe(void 0,l,"earth"));me.add(u);const t=document.createElement("button");t.type="button",t.className="space-label is-small",t.textContent=e,t.addEventListener("click",()=>w.onExtra?.(`trappist-${e}`)),f.appendChild(t),lt.push({mesh:u,a:o*100,period:n,phase0:c*1.7,el:t})});const jn=new fn(a(new Ce().setFromPoints(Array.from({length:256},(e,n)=>new m(Math.cos(n/256*Math.PI*2)*38.7,0,Math.sin(n/256*Math.PI*2)*38.7)))),a(new nt({color:"#c5b8a2",transparent:!0,opacity:.5})));me.add(jn);for(const[e,n]of[["TRAPPIST-1",new m(0,1.1,0)],["생명가능지대(대략)",new m(3.9,0,0)],["비교: 우리 수성의 궤도",new m(0,0,38.7)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,f.appendChild(o),Ot.push({el:o,at:n})}V.add(me);const pe=xo(),ct=[];if(pe)for(const[e,n]of Object.entries(pe.groups)){V.add(n);for(const o of pe.markers[e]){const s=document.createElement("button");s.type="button",s.className="space-label",s.textContent=o.name,s.addEventListener("click",()=>{w.onMarker?.(o),R.target.copy(o.position),R.radius=Le[e]*(o.id==="cmb"?1.4:e==="group"?.6:.42)}),f.appendChild(s),ct.push({level:e,marker:o,el:s})}}const $t=[];if(pe){const n=(c,d)=>new m(Math.cos(d*ae)*Math.cos(c*ae),Math.sin(d*ae),-Math.cos(d*ae)*Math.sin(c*ae)).multiplyScalar(140),o=[];for(const c of Object.values(yn))for(const d of c)for(let u=0;u<d.length-1;u+=1){const t=n(d[u][0],d[u][1]),r=n(d[u+1][0],d[u+1][1]);o.push(t.x,t.y,t.z,r.x,r.y,r.z)}const s=a(new Ce);s.setAttribute("position",new ft(o,3));const l=new to(s,a(new nt({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));pe.groups.stars.add(l);for(const c of wo){if(!yn[c.id])continue;const d=document.createElement("button");d.type="button",d.className="space-label is-const",d.textContent=c.name.replace(/\(.*\)/,"").split(" · ")[0],d.addEventListener("click",()=>w.onConstellation?.(c.id)),f.appendChild(d),$t.push({el:d,at:n(c.center[0],c.center[1])})}}const qe=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let U="system",Ae=!1,Ht=!1;const Le={system:40,super:40,eclipse:7.5,sizes:15,exo:16,stars:46,orion:48,galaxy:44,group:40,cosmos:70},je=new m,N={theta:.6,phi:.95,radius:34},R={target:new m,radius:N.radius};let O="system",q=null,Q=null,ie=null;function Ke(e){if(U=e,Ae=!1,A.visible=e==="system",Fe.visible=e==="eclipse",be.visible=e==="sizes",me.visible=e==="exo",pe)for(const[n,o]of Object.entries(pe.groups))o.visible=n===e;O="system",q=null,Q=null,ie=null,R.target.set(0,0,0),R.radius=Le[e],e!=="system"&&(N.phi=1.1),e==="eclipse"&&(Te.rotation.z=M.aspect<1?-Math.PI/2:0,N.theta=0,N.phi=xe?Math.PI/2:1.25,R.target.set(0,0,0),xe||R.target.set(-.7,0,0).applyEuler(Te.rotation),R.radius=xe?6:M.aspect<1?10:7.5),e==="exo"&&(N.phi=.75),e==="sizes"&&(N.theta=0,N.phi=Math.PI/2,R.target.set(.6,-6.8,0),R.radius=19)}function Xt(e){if(Ae=!1,U!=="system"&&(U="system",A.visible=!0,Fe.visible=!1,be.visible=!1,me.visible=!1,pe))for(const o of Object.values(pe.groups))o.visible=!1;if(O=e,Q=null,ie=null,e==="system"){q=null,R.target.set(0,0,0),R.radius=Le.system;return}q=W.get(e)??null;const n=Z.get(e)??ko(Ge(e).km);R.radius=e==="sun"?3.2:e==="jupiter"?3.4*L:e==="saturn"?2.6*L:Math.max(n*(Ge(e).ring?6:4.2),.25)}function Bn(e){const n=ye.get(e);n&&(U!=="system"&&Ke("system"),O="system",q=n,Q=null,ie=null,R.radius=e==="halley"?1.6:.6,Ee=performance.now())}function Vn(e){ie=(e?se.find(o=>o.parent===O&&o.site.name===e.name):void 0)?.mesh??null,Q=ie?new m:null,Ee=performance.now()}const he=new Map;let Be=0,Je=0,Ee=0;const Yt=new no,qt=new tt,Kt=e=>{if(B.setPointerCapture(e.pointerId),Ae=!1,he.set(e.pointerId,{x:e.clientX,y:e.clientY}),Je=0,Ee=performance.now(),he.size===2){const[n,o]=[...he.values()];Be=Math.hypot(n.x-o.x,n.y-o.y)}},Jt=e=>{const n=he.get(e.pointerId);if(!n)return;const o=e.clientX-n.x,s=e.clientY-n.y;if(he.set(e.pointerId,{x:e.clientX,y:e.clientY}),Ee=performance.now(),he.size===1)Je+=Math.abs(o)+Math.abs(s),N.theta-=o*.006,N.phi=Math.min(2.9,Math.max(.2,N.phi-s*.006)),Q=null,ie=null;else if(he.size===2){const[l,c]=[...he.values()],d=Math.hypot(l.x-c.x,l.y-c.y);Be>0&&(R.radius=Qt(R.radius*(Be/d))),Be=d,Je+=10}},Ze=e=>{if(he.delete(e.pointerId),Be=0,Je<6&&w.onPick){const n=B.getBoundingClientRect();qt.set((e.clientX-n.left)/n.width*2-1,-((e.clientY-n.top)/n.height)*2+1),Yt.setFromCamera(qt,M);const s=Yt.intersectObjects([...z.values(),...Se.values()],!1)[0]?.object.name;s&&z.has(s)?w.onPick(s):s&&Se.has(s)&&w.onExtra?.(s)}},Zt=e=>{e.preventDefault(),R.radius=Qt(R.radius*(e.deltaY>0?1.12:.89))};function Qt(e){return U!=="system"?Math.min(Le[U]*2.2,Math.max(Le[U]*.15,e)):Math.min(90,Math.max(O==="system"&&!q?4:.15,e))}B.addEventListener("pointerdown",Kt),B.addEventListener("pointermove",Jt),B.addEventListener("pointerup",Ze),B.addEventListener("pointercancel",Ze),B.addEventListener("wheel",Zt,{passive:!1});let we=null,Qe=null,dt=!matchMedia("(prefers-reduced-motion: reduce)").matches,en=0,tn=0;dt&&(we=new oo(X),we.addPass(new ao(V,M)),Qe=new so(new tt(256,256),.75,.78,.92),we.addPass(Qe),we.addPass(new ro));const T={w:1,h:1},nn=()=>{T.w=j.clientWidth||1,T.h=j.clientHeight||1,X.setSize(T.w,T.h,!1),we?.setSize(T.w,T.h),Qe?.resolution.set(T.w/2,T.h/2),M.aspect=T.w/T.h,M.updateProjectionMatrix()};nn();const on=new ResizeObserver(nn);on.observe(j);let an=!0;const sn=new IntersectionObserver(e=>{an=e.some(n=>n.isIntersecting)});sn.observe(j);const p=new m,Pe=new m;let mt=0,rn=performance.now(),pt=-1e9,ln=0;const cn=e=>{mt=requestAnimationFrame(cn);const n=Math.min(.1,(e-rn)/1e3);if(rn=e,document.hidden||!an)return;if(qe||(Et.uniforms.time.value=e/1e3),!qe){for(const t of xt)t.uniforms.time.value=e/1e3;for(const t of bt)t.uniforms.uTime.value=e/1e3}e-Ee>3e3&&!qe&&!Q&&!Ht&&!Ae&&U!=="eclipse"&&U!=="sizes"&&(N.theta+=n*(O==="system"?.03:.08)),ge?.rotateY(n*.01);for(const[t,r]of z){if(t==="earth"||t==="moon"||ie&&t===O)continue;const i=Ge(t).spinHours;qe||r.rotateY(n*(t==="sun"?.02:i?.12*(24/i)*.25:.12))}de&&(de.visible=M.position.length()>4);for(const t of Wt)t.material.uniforms.uDays.value=(fe-Mo)/864e5,t.material.uniforms.uTime.value=e/1e3;for(const t of gt){const r=z.get(t.parent);r&&t.mesh.material.uniforms.planetCenter.value.copy(r.getWorldPosition(p))}for(const t of yt)t.mesh.getWorldPosition(p),t.material.uniforms.ringCenter.value.copy(p),t.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(t.mesh.matrixWorld).normalize();if(De&&e-ln>1e3&&(ln=e,fe=Date.now(),_e(fe)),g){const t=ue.get(g.id),r=t.points.length,i=t.times[r-1],y=(t.frame==="earth"?6:25)*864e5,G=t.marks.some(H=>H.at!==void 0&&H.body&&H.body!=="earth"&&Math.abs(g.sim-H.at)<y)?"slow":g.sim>=g.fastFrom?"fast":"normal",Y=G==="slow"?Math.min(g.base,2*y/3):g.base*(G==="fast"?g.fast:1);g.sim=Math.min(i,g.sim+Y*Math.min(n,.1)),t.frame==="sun"?ve=(ve??g.sim)+Math.min(n,.1)*.15*864e5:ve=null,g.pace=G;const ke=(g.sim-t.times[0])/(i-t.times[0]||1);let ee=0,te=r-1;for(;te-ee>1;){const H=ee+te>>1;t.times[H]<=g.sim?ee=H:te=H}const ne=t.times[te]-t.times[ee],re=ee+(ne>0?(g.sim-t.times[ee])/ne:0),Me=Math.max(0,Math.min(r-2,Math.floor(re))),dn=re-Me;t.probe.position.lerpVectors(t.points[Me],t.points[Me+1],dn),wt=re,t.probe.lookAt(t.line.localToWorld(t.points[Math.min(r-1,Me+2)].clone())),t.line.geometry.setDrawRange(0,Me+2);const ut=t.times[Me]+(t.times[Me+1]-t.times[Me])*dn;De=!1,fe=ut,_e(ut);let et=0;for(let H=0;H<t.marks.length;H+=1){const mn=t.marks[H],On=mn.at??t.times[Math.min(r-1,mn.index)];g.sim>=On-y&&(et=H)}if((et!==g.mark||e-g.lastPing>250||g.sim>=i&&!g.done)&&(g.mark=et,g.lastPing=e,g.sim>=i&&(g.done=!0),w.onFlight?.({id:g.id,mark:t.marks[et],progress:ke,time:ut,done:g.done,pace:g.pace})),g.done){const H=t.frame==="earth";g=null,ve=null,De=!0,q=H?W.get("earth")??null:null,H||R.target.set(0,0,0),R.radius=H?4.2:72,N.phi=H?.7:.45}}if(q&&R.target.copy(q.getWorldPosition(p)),g){const t=ue.get(g.id);let r=null,i=1/0;for(const S of t.marks){if(!S.body||S.body==="earth"||S.body==="far")continue;const G=Math.abs(S.index-wt);G<14&&G<i&&(r=S,i=G)}const y=r?W.get(r.body):void 0;if(y){const S=y.getWorldPosition(new m).add(t.probe.getWorldPosition(new m)).multiplyScalar(.5);R.target.copy(S),R.radius=t.frame==="earth"?1.6:4.2}else R.radius=t.frame==="earth"?1.5:2.8}if(je.lerp(R.target,1-Math.pow(.002,n)),N.radius+=(R.radius-N.radius)*(1-Math.pow(.004,n)),Q&&ie){const t=z.get(O)?.getWorldPosition(new m)??new m;Q.copy(ie.getWorldPosition(new m).sub(t).normalize());const r=Math.atan2(Q.x,Q.z),i=Math.acos(Math.max(-1,Math.min(1,Q.y)));let y=r-N.theta;y=Math.atan2(Math.sin(y),Math.cos(y)),N.theta+=y*(1-Math.pow(.01,n)),N.phi+=(i-N.phi)*(1-Math.pow(.01,n))}if(U==="exo"){const t=e/1e3;for(const r of lt){const i=r.phase0+t/r.period*Math.PI*2;r.mesh.position.set(Math.cos(i)*r.a,0,Math.sin(i)*r.a)}}if(U==="eclipse"){it=(it+n*.18)%1;const t=Math.sin(it*Math.PI*2),r=Math.abs(t)<.22,i=Rt==="lunar";Te.visible=!xe,Ye.visible=xe,k.skySun.visible=!i,k.skyMoon.visible=i,xe?i?(k.skyMoon.position.set(t*1.7,0,.08),k.skyMoonMat.color.set(r?"#c47462":"#f2f2f2")):k.skyCover.position.set(t*1.7,0,.08):(k.moon.position.set(i?2.75:1.05,t*.55,0),k.cone.visible=!i,k.umbra.visible=i,k.shadow.opacity=r?.42:.08,k.umbra.material.opacity=r?.42:.08,k.moonMat.color.set(i&&r?"#c47462":"#ffffff"))}if(M.position.set(je.x+N.radius*Math.sin(N.phi)*Math.sin(N.theta),je.y+N.radius*Math.cos(N.phi),je.z+N.radius*Math.sin(N.phi)*Math.cos(N.theta)),M.lookAt(je),Ue&&(Ue.getWorldPosition(p),Re.copy(p).multiplyScalar(-1).normalize(),e-pt>500&&!(g&&ue.get(g.id)?.frame==="sun"))){pt=e;const t=go(new Date(fe)),r=Math.atan2(t.y,t.x),i=Math.atan2(-Re.z,Re.x),y=Ue.children[0];y.rotation.y=i-r}we&&dt&&(U!=="system"||O==="system"||O==="sun")&&we?(we.render(n),en+=1,tn+=n,en===90&&tn/90>.034&&(dt=!1)):X.render(V,M),M.getWorldDirection(Pe);const l=[];for(const t of Nn){const r=J.get(t),i=W.get(t);if(!r||!i)continue;i.getWorldPosition(p);const y=p.clone().sub(M.position).dot(Pe)>0,S=O==="system"&&U==="system"&&(!q||g!==null),G=O==="earth"||O==="moon"||g!==null&&ue.get(g.id)?.frame==="earth";let Y=y&&(t==="moon"?U==="system"&&G:S||G&&t==="earth"&&g!==null);p.project(M);const ke=(p.x+1)/2*T.w,ee=(1-p.y)/2*T.h+10;if(Y){let te=Pt.get(t)??0;te||(r.style.display="block",te=r.offsetWidth||40,Pt.set(t,te));const ne={x:ke-te/2,y:ee,w:te,h:22};l.some(re=>ne.x<re.x+re.w+4&&ne.x+ne.w+4>re.x&&ne.y<re.y+re.h&&ne.y+ne.h>re.y)?Y=!1:l.push(ne)}r.style.display=Y?"block":"none",Y&&(r.style.transform=`translate(${ke}px, ${ee}px) translate(-50%, 0)`)}const c=U==="system",d=O!=="system"&&O!=="jupiter"&&O!=="saturn",u=q!==null&&(g===null?q===W.get("earth"):ue.get(g.id)?.frame==="earth");for(const t of st)t.visible=!d&&!u;for(const[t,r]of We){const i=ye.get(t),y=r.parent?W.get(r.parent)===q:O==="system"&&(!q||q===i),S=q===i||y;i.getWorldPosition(p);const G=p.clone().sub(M.position).dot(Pe)>0,Y=c&&G&&S;p.project(M),r.el.style.display=Y?"block":"none",Y&&(r.el.style.transform=`translate(${(p.x+1)/2*T.w}px, ${(1-p.y)/2*T.h+8}px) translate(-50%, 0)`)}for(const[t,r]of ue){const i=c&&zt===t;if(r.line.visible=i,!i){r.el.style.display="none";continue}r.probe.getWorldPosition(p);const y=p.clone().sub(M.position).dot(Pe)>0;p.y+=0,p.project(M),r.el.style.display=y?"block":"none",y&&(r.el.style.transform=`translate(${(p.x+1)/2*T.w}px, ${(1-p.y)/2*T.h}px) translate(10px, -50%)`)}for(const t of $t){if(U!=="stars"){t.el.style.display="none";continue}p.copy(t.at);const r=p.clone().sub(M.position).dot(Pe)>0;p.project(M);const i=r&&Math.abs(p.x)<1&&Math.abs(p.y)<1;t.el.style.display=i?"block":"none",i&&(t.el.style.transform=`translate(${(p.x+1)/2*T.w}px, ${(1-p.y)/2*T.h}px) translate(-50%, -50%)`)}for(const t of ct){if(!(t.level===U)){t.el.style.display="none";continue}p.copy(t.marker.position);const i=p.clone().sub(M.position).dot(Pe)>0;p.project(M),t.el.style.display=i?"block":"none",i&&(t.el.style.transform=`translate(${(p.x+1)/2*T.w}px, ${(1-p.y)/2*T.h+8}px) translate(-50%, 0)`)}for(const t of lt){if(U!=="exo"){t.el.style.display="none";continue}t.mesh.getWorldPosition(p);const r=p.clone().sub(M.position).dot(Pe)>0;p.project(M),t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(p.x+1)/2*T.w}px, ${(1-p.y)/2*T.h+8}px) translate(-50%, 0)`)}for(const t of Ot){if(U!=="exo"){t.el.style.display="none";continue}p.copy(t.at).project(M);const r=p.z<1&&Math.abs(p.x)<1.05&&Math.abs(p.y)<1.05;t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(p.x+1)/2*T.w}px, ${(1-p.y)/2*T.h}px) translate(-50%, -100%)`)}for(const[t,r]of[[Tt,U==="eclipse"&&!xe],[Ut,U==="sizes"]])for(const i of t){if(!r){i.el.style.display="none";continue}p.copy(i.at).applyMatrix4(i.group.matrixWorld).project(M);const y=p.z<1&&Math.abs(p.x)<1.1&&Math.abs(p.y)<1.1;i.el.style.display=y?"block":"none";const S=i.group.rotation.z!==0;y&&(i.el.style.transform=`translate(${(p.x+1)/2*T.w}px, ${(1-p.y)/2*T.h}px) ${S?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const t of se){t.mesh.getWorldPosition(p);const r=z.get(t.parent),i=r?r.getWorldPosition(new m):new m,S=p.clone().sub(i).normalize().dot(M.position.clone().sub(p).normalize())>.15&&U==="system"&&O===t.parent;p.project(M),t.el.style.display=S?"block":"none",S&&(t.el.style.transform=`translate(${(p.x+1)/2*T.w}px, ${(1-p.y)/2*T.h}px) translate(8px, -50%)`)}};return mt=requestAnimationFrame(cn),E===0&&w.onReady?.(),{focus:Xt,setLevel:Ke,setPaused:e=>{Ht=e},focusMarker:e=>{const n=ct.find(o=>o.level===U&&o.marker.id===e);n&&(R.target.copy(n.marker.position),R.radius=Le[U]*(e==="cmb"?1.4:U==="group"?.6:.42),Ee=performance.now())},showSite:Vn,focusExtra:Bn,setEclipse:(e,n)=>{Rt=e,xe=n,Ke("eclipse")},setHemisphere:e=>{O!=="earth"&&Xt("earth");const n=Re.clone().multiplyScalar(e==="day"?1:-1);N.theta=Math.atan2(n.x,n.z),N.phi=Math.min(2.6,Math.max(.5,Math.acos(n.y))),Q=null,ie=null,Ae=!0},setTime:e=>{De=e===null,fe=e??Date.now(),_e(fe),pt=-1e9},setVoyage:e=>{if(zt=e,!e){g&&(g=null,De=!0),ve=null;for(const r of ue.values())r.line.geometry.setDrawRange(0,1/0);return}U!=="system"&&Ke("system"),ve=null;const n=ue.get(e);n.line.geometry.setDrawRange(0,2),O="system",Q=null,ie=null,Ae=!1,q=n.probe;const o=n.frame==="earth";R.radius=o?1.3:2.8,N.phi=o?.75:1;const s=Math.max(...n.marks.filter(r=>r.at!==void 0&&r.body!=="earth").map(r=>r.at),n.times[0]+864e5),l=n.times[0],c=n.times[n.times.length-1],d=(s-l)/(o?20:24),u=n.frame==="earth"?c:s+60*864e5,t=c>u?(c-u)/4/d:1;g={id:e,sim:l,base:d,fastFrom:u,fast:t,mark:-1,done:!1,lastPing:0,pace:"normal"},Ee=performance.now()},dispose:()=>{pe?.dispose(),we?.dispose(),Qe?.dispose(),cancelAnimationFrame(mt),on.disconnect(),sn.disconnect(),B.removeEventListener("pointerdown",Kt),B.removeEventListener("pointermove",Jt),B.removeEventListener("pointerup",Ze),B.removeEventListener("pointercancel",Ze),B.removeEventListener("wheel",Zt),V.traverse(e=>{const n=e.material;Array.isArray(n)&&n.forEach(o=>o.dispose())}),v.forEach(e=>e.dispose()),X.dispose(),B.remove(),f.remove()}}}export{Go as createSpace};
