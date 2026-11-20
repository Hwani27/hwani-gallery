import{G as X,V as d,M as w,S as R,a as E,A as oe,B as Je,C as _n,b as Un,c as Fn,d as Z,e as Ne,f as En,P as lo,g as co,W as mo,h as St,i as po,j as uo,k as fo,T as vo,I as ho,l as wo,m as go,n as ce,o as lt,R as He,D as ke,F as Et,p as yo,L as bo,q as ct,r as Pt,s as Ye,t as Pn,u as xo,v as Mo,E as zo,w as So,U as Eo,O as Po,N as ko,x as Co,y as Wo,z as No,H as kn,J as Ro,K as Cn,Q as To,X as Lo}from"./three-DR5XHIPo.js";import{aL as Wn,aM as Ao,aN as kt,aO as Nn,aP as Do,aQ as Io,aR as qe,F as _o,aS as Uo,aT as dt}from"./index-B0_CIUAU.js";import{C as Rn}from"./sky-qQD64V3e.js";const Ke=Math.PI/180;function de(U,g,b){return new d(Math.cos(g*Ke)*Math.cos(U*Ke),Math.sin(g*Ke),-Math.cos(g*Ke)*Math.sin(U*Ke)).multiplyScalar(b)}function Fo(){const g=document.createElement("canvas");g.width=64,g.height=64;const b=g.getContext("2d");if(b){const T=b.createRadialGradient(32,32,0,32,32,32);T.addColorStop(0,"rgba(255,255,255,1)"),T.addColorStop(.25,"rgba(255,255,255,0.75)"),T.addColorStop(1,"rgba(255,255,255,0)"),b.fillStyle=T,b.fillRect(0,0,64,64)}return new _n(g)}function Bo(){const U=[],g=v=>(U.push(v),v),b=g(Fo());function T(v,a,I){const L=new Un(g(new Fn({map:b,color:new Z(v),transparent:!0,depthWrite:!1,blending:oe})));return L.scale.setScalar(a),L.position.copy(I),L}function q(v,a,I){const L=new Float32Array(v*3),_=new Float32Array(v*3);for(let k=0;k<v;k+=1){const[H,A]=a(k);L.set([H.x,H.y,H.z],k*3),_.set([A.r,A.g,A.b],k*3)}const M=g(new Ne);return M.setAttribute("position",new En(L,3)),M.setAttribute("color",new En(_,3)),new lo(M,g(new co({size:I,map:b,vertexColors:!0,transparent:!0,depthWrite:!1,blending:oe,sizeAttenuation:!0})))}let F=7;const f=()=>(F=F*16807%2147483647,(F-1)/2147483646),V={},x={};{const v=new X,a=2.6,I=[["alphacen","센타우루스자리 알파",219.9,-60.83,4.37,"#fff4e0","태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요."],["barnard","바너드별",269.45,4.69,5.96,"#ffb27a","작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요."],["wolf359","울프 359",164.12,7.01,7.86,"#ff9a6a","아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요."],["sirius","시리우스",101.29,-16.72,8.6,"#cfe0ff","밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요."],["ross154","로스 154",282.46,-23.84,9.69,"#ffa070","궁수자리 쪽의 작은 붉은 별이에요."],["epseri","에리다누스자리 엡실론",53.23,-9.46,10.5,"#ffd9a8","행성을 거느린 것으로 여겨지는 가까운 별이에요."],["61cyg","백조자리 61",316.7,38.75,11.4,"#ffc58a","처음으로 거리가 재어진 별이에요(1838년)."],["procyon","프로키온",114.83,5.22,11.46,"#fff3d6","작은개자리의 밝은 별이에요."],["epsind","인디언자리 엡실론",330.84,-56.79,11.87,"#ffcf9a","남쪽 하늘의 가까운 별이에요."],["taucet","고래자리 타우",26.02,-15.94,11.9,"#fff0d0","태양과 닮은 별이라 오래전부터 관심을 받았어요."]];v.add(T("#ffe39a",3.2,new d));const L=[{id:"sun-star",name:"태양",line:"우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요.",position:new d}];for(const[_,M,k,H,A,B,K]of I){const se=de(k,H,A*a);v.add(T(B,2.4,se)),L.push({id:_,name:M,line:`${K} 거리 약 ${A}광년.`,position:se})}v.add(q(500,()=>[new d(f()-.5,f()-.5,f()-.5).normalize().multiplyScalar(60+f()*30),new Z().setHSL(.1,.3,.5+f()*.4)],.9)),V.stars=v,x.stars=L}{const v=new X,a=1/40,I=[["pleiades","플레이아데스(좀생이별)",56.75,24.12,444,"#bcd2ff",3,"약 444광년 떨어진 젊은 별 무리예요."],["betelgeuse","베텔게우스",88.79,7.41,548,"#ffab6e",3,"붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요."],["rigel","리겔",78.63,-8.2,860,"#cfe0ff",3,"푸르고 아주 밝은 초거성이에요. 약 860광년."],["orionneb","오리온 대성운",83.82,-5.39,1344,"#ff9ec4",9,"별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요."],["deneb","데네브",310.36,45.28,2600,"#e6eeff",3,"백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실)."]];v.add(T("#ffe39a",1.6,new d));const L=[{id:"sun-orion",name:"태양",line:"우리은하의 오리온 팔 안쪽에 있어요.",position:new d}];for(const[_,M,k,H,A,B,K,se]of I){const j=de(k,H,A*a);v.add(T(B,K,j)),_==="orionneb"&&v.add(q(260,()=>{const Me=Math.pow(f(),.6)*5;return[new d(f()-.5,f()-.5,f()-.5).normalize().multiplyScalar(Me).add(j),new Z(f()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),L.push({id:_,name:M,line:se,position:j})}v.add(q(1400,()=>{const _=(f()-.5)*120,M=(f()-.5)*22*(.4+f()),k=(f()-.5)*4;return[new d(_,k,M),new Z().setHSL(.6+f()*.1,.3,.35+f()*.3)]},.8)),V.orion=v,x.orion=L}{const v=new X,a=4;v.add(q(9e3,L=>{const _=L%a,M=Math.pow(f(),.55)*25,k=_/a*Math.PI*2+Math.log(1+M)*1.9+(f()-.5)*(.5+4/(M+2)),H=(f()-.5)*(M<4?2.2:.7),A=M<4,B=A?new Z("#ffd9a0"):new Z().setHSL(.58+f()*.06,.45,.45+f()*.35);return[new d(Math.cos(k)*M,H,Math.sin(k)*M),B.multiplyScalar(A?.8:.6)]},.55)),v.add(T("#fff0c8",7,new d));const I=new d(13,0,0);v.add(T("#ffe39a",1.2,I)),V.galaxy=v,x.galaxy=[{id:"center",name:"은하 중심(궁수자리 A*)",line:"태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요.",position:new d},{id:"sun-gal",name:"태양은 여기",line:"중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요.",position:I}]}{const v=new X,a=1/1e5,I=(A,B,K,se,j)=>q(se,Me=>{const me=Math.pow(f(),.6)*B,ze=Me%2*Math.PI+Math.log(1+me*3)*2.2+(f()-.5)*.9,_e=new d(Math.cos(ze)*me,(f()-.5)*B*.05,Math.sin(ze)*me);_e.applyAxisAngle(new d(1,0,0),K);const Ue=me<B*.18;return[_e.add(A),new Z().setHSL(Ue?.1:j,.4,.45+f()*.3).multiplyScalar(Ue?.35:.22)]},.4),L=new d;v.add(I(L,2.2,0,1800,.6));const _=de(10.68,41.27,25e5*a);v.add(I(_,4.4,1.2,3200,.1));const M=de(23.46,30.66,273e4*a);v.add(I(M,1.6,.6,900,.62));const k=de(80.89,-69.76,16e4*a);v.add(T("#cfd8ff",1.2,k));const H=de(13.19,-72.83,2e5*a);v.add(T("#cfd8ff",.8,H)),V.group=v,x.group=[{id:"mw",name:"우리 은하",line:"지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요.",position:L},{id:"andromeda",name:"안드로메다은하",line:"약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요.",position:_},{id:"triangulum",name:"삼각형자리은하",line:"약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요.",position:M},{id:"lmc",name:"대마젤란은하",line:"약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요.",position:k}]}{const v=new X,a=6,I=(A,B,K)=>new d(A,B,K).multiplyScalar(a),L=I(5.1,.35,1.1),_=I(3.4,.45,.2),M=I(-1.4,-.3,-.5),k=[[I(.2,0,0),900,6.4*a*.5],[_,280,1.5*a*.5],[M,220,1.7*a*.5],[I(-2.2,1.6,2.4),120,1.1*a*.5]],H=k.reduce((A,B)=>A+B[1],0);v.add(q(H+180,A=>{let B=A;for(const[se,j,Me]of k){if(B<j)return[new d(f()-.5,(f()-.5)*.5,f()-.5).multiplyScalar(2*Me*Math.pow(f(),.5)).add(se),new Z("#f3eee6").multiplyScalar(.75)];B-=j}const K=f();return[L.clone().lerp(M,K).add(new d((f()-.5)*.7*a,(f()-.5)*.45*a,(f()-.5)*.7*a)),new Z("#e7c48a").multiplyScalar(.8)]},.5)),v.add(new w(g(new R(.95*a,20,16)),g(new E({color:"#d5e2f5",transparent:!0,opacity:.1,blending:oe,depthWrite:!1}))).translateX(_.x).translateY(_.y).translateZ(_.z)),v.add(new w(g(new R(1.05*a,20,16)),g(new E({color:"#e7c48a",transparent:!0,opacity:.09,blending:oe,depthWrite:!1}))).translateX(M.x).translateY(M.y).translateZ(M.z)),v.add(T("#e4b56a",1.2,L)),V.super=v,x.super=[{id:"localgroup",name:"우리 은하군",line:"우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요.",position:L},{id:"virgo-sc",name:"처녀자리 은하단",line:"약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요.",position:_},{id:"attractor-sc",name:"거대 인력체",line:"라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요.",position:M}]}{const v=new X,a=1/1e7,I=de(187.7,12.4,54e6*a),L=de(243,-60,2e8*a);v.add(q(5e3,M=>{const k=M%5,A=[I,L,de(30,20,15e7*a),de(160,-30,18e7*a),de(300,40,14e7*a)][k],B=k===1?7:4;return[new d((f()-.5)*2,(f()-.5)*2,(f()-.5)*2).multiplyScalar(B*Math.pow(f(),.4)).add(A),new Z().setHSL(.08+f()*.5,.35,.55).multiplyScalar(.8)]},.8)),v.add(T("#ffffff",.8,new d));const _=new w(g(new R(42,48,32)),g(new E({color:"#ff8a4a",transparent:!0,opacity:.08,side:Je,depthWrite:!1})));v.add(_),V.cosmos=v,x.cosmos=[{id:"here",name:"우리 은하",line:"여기서는 점 하나예요.",position:new d},{id:"virgo",name:"처녀자리 은하단",line:"약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요.",position:I},{id:"attractor",name:"거대 인력체",line:"약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요.",position:L},{id:"cmb",name:"가장 오래된 빛",line:"우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요.",position:new d(0,0,-42)}]}for(const v of Object.values(V))v.visible=!1;return{groups:V,markers:x,dispose:()=>U.forEach(v=>v.dispose())}}const Tn="textures/",ae=Math.PI/180;function mt(U,g,b=1){return new d(Math.cos(U*ae)*Math.cos(g*ae),Math.sin(U*ae),-Math.cos(U*ae)*Math.sin(g*ae)).multiplyScalar(b)}const N=2.2,Vo=Date.UTC(2e3,0,1,12),Ln={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},An={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function jo(){if(typeof window>"u")return!0;const U=navigator,g=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,b=U.hardwareConcurrency??8,T=U.deviceMemory??8;return!!(g||b<=4||T<=4)}function Oo(){const g=document.createElement("canvas");g.width=128,g.height=128;const b=g.getContext("2d");if(b){const T=b.createRadialGradient(64,64,0,64,64,64);T.addColorStop(0,"rgba(255,238,205,0.85)"),T.addColorStop(.3,"rgba(255,214,150,0.55)"),T.addColorStop(.45,"rgba(255,190,120,0.22)"),T.addColorStop(.7,"rgba(250,170,95,0.07)"),T.addColorStop(1,"rgba(255,160,80,0)"),b.fillStyle=T,b.fillRect(0,0,128,128)}return new _n(g)}const Go=`
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
}`,$o=`
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
}`;function Xo(U){return Math.max(.12,.16+.11*Math.log2(U/2e3))}const Ho=`
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
}`,Yo=`
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
}`,qo=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Ko=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,Dn=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,In=`
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
}`,Jo=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Qo=`
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
}`,Zo=`
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
}`,ea=`
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
}`,ta=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,na=`
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
}`,oa=`
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
}`,aa=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function ca(U,g){const b=jo(),T=b?96:128,q=new mo({antialias:!0,powerPreference:"default",alpha:!1});q.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),q.outputColorSpace=St,q.toneMapping=po,q.toneMappingExposure=1.1;const F=q.domElement;F.style.display="block",F.style.width="100%",F.style.height="100%",F.style.touchAction="none",U.appendChild(F);const f=document.createElement("div");f.className="space-labels",U.appendChild(f);const V=new uo;V.background=new Z("#05070d");const x=new fo(45,1,.01,2e3),v=[],a=e=>(v.push(e),e),I=new vo,L=new ho,_=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),M=new Map,k=new Map,H=[],A=new Set;let B=!1,K=0;const se=(e,n)=>{const o=k.get(e);if(o){k.delete(e);for(const s of o)s(n)}},j=(e,n=!0)=>{const o=M.get(e);if(o)return o;K+=1;const s=I.load(Tn+e,()=>{se(e,s),K-=1,K===0&&g.onReady?.()},void 0,()=>{se(e,s),K-=1,K===0&&g.onReady?.()});return s.colorSpace=n?St:ko,s.anisotropy=b?4:8,M.set(e,s),a(s)},Me=e=>{M.has(e)||A.has(e)||(A.add(e),L.load(Tn+e,n=>{A.delete(e);const o=new Lo;o.image=n,o.colorSpace=St,o.anisotropy=b?4:8,o.needsUpdate=!0,a(o),M.set(e,o),se(e,o)},void 0,()=>{A.delete(e)}))},me=()=>{if(!B){B=!0;for(const e of H)Me(e)}},ze=(e,n)=>{if(_.has(e)){n(j(e));return}const o=M.get(e);if(o){n(o);return}const s=k.get(e)??[];s.push(n),k.set(e,s),H.includes(e)||(H.push(e),B&&Me(e))},_e=new w(a(new R(900,48,24)),a(new E({map:j("milkyway.webp"),side:Je,depthWrite:!1})));_e.rotation.set(63*ae,0,0),V.add(_e),V.add(new wo(16777215,.14));const Ue=new go(16777215,1.6,0,0);Ue.decay=0,V.add(Ue);const re=new X;V.add(re);const pe=new Map,ue=new Map,Ct=new Map,pt=[],Qe=new Map;let Wt=null,ut=null;const Fe=new Map,Ze=new Map,ft=new Map,we=new Map;let y=null,Nt=0,Re=null;const vt=[],Rt=[],Tt=[],Lt=[],At=[];let ge=Date.now(),Be=!0,Dt=null;function et(e,n,o,s){const l=Ln[o]??[.7,.7,.7,.06],c=An[o],m=new Z(n),u=c?.relief??0,t=a(new ce({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new lt(c?.texel?.[0]??1/1024,c?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:u*.35},gain:{value:(c?.gain??1.9)*.6},base:{value:new d(m.r,m.g,m.b)},glow:{value:new d(l[0],l[1],l[2])},atmo:{value:Math.min(l[3]*2.2,.85)},ringShadow:{value:s?1:0},ringMap:{value:null},ringInner:{value:s?.inner??1},ringOuter:{value:s?.outer??2},ringCenter:{value:new d},ringNormal:{value:new d(0,1,0)}},vertexShader:Go,fragmentShader:$o}));return e&&ze(e,r=>{t.uniforms.dayMap.value=r,t.uniforms.useMap.value=1,u>0&&(t.uniforms.bumpMap.value=r,t.uniforms.useBump.value=1)}),s&&ze("saturn-ring.webp",r=>{t.uniforms.ringMap.value=r}),t}function Bn(e,n,o){const s=An[o],l=s?.tint??Ln[o]?.slice(0,3);if(!l||b)return;const c=Math.min(s?.inner??.12,.5)*.55,m=Math.min(s?.outer??.05,.2)*.9,u=new d(l[0],l[1],l[2]),t=Math.sqrt(1-1/(1.045*1.045)),r=(i,h,S,G)=>new w(a(new R(n*i,b?24:32,b?16:24)),a(new ce({uniforms:{tint:{value:u},power:{value:S},strength:{value:G},edge:{value:t}},vertexShader:Dn,fragmentShader:In,side:h,transparent:!0,blending:oe,depthWrite:!1})));e.add(r(1.045,Je,2.7,c),r(1.16,kn,3.4,m))}function Vn(e,n){const o=a(new ce({uniforms:{poleN:{value:mt(80.7,-72.7,1).normalize()},poleS:{value:mt(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:Jo,fragmentShader:Qo,transparent:!0,blending:oe,depthWrite:!1})),s=new w(a(new R(n*1.022,b?64:96,b?48:64)),o);s.renderOrder=1,e.add(s),Lt.push(o)}function jn(e,n){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([s,l,c,m,u],t)=>{const r=mt(s,l,1).normalize(),i=new d(0,1,0).cross(r).normalize(),h=new d().crossVectors(r,i).normalize(),S=i.multiplyScalar(Math.cos(u)).addScaledVector(h,Math.sin(u)).normalize(),G=[];for(let $=0;$<=16;$+=1){const te=$/16,ne=(te-.5)*c,ie=Math.sin(te*Math.PI)*m;G.push(new d().copy(r).multiplyScalar(Math.cos(ne)).addScaledVector(S,Math.sin(ne)).normalize().multiplyScalar(n*(.985+ie)))}const J=a(new ce({uniforms:{uTime:{value:0},seed:{value:t*.37+.11}},vertexShader:Zo,fragmentShader:ea,transparent:!0,blending:oe,side:ke,depthWrite:!1})),he=new w(a(new Co(new Wo(G),64,n*.022,8,!1)),J);he.raycast=()=>{},e.add(he),At.push(J)})}function It(e,n,o=""){const s=document.createElement("button");s.type="button",s.className="space-label"+o,s.textContent=n,s.addEventListener("click",()=>g.onPick?.(e)),f.appendChild(s),Ct.set(e,s)}const _t=a(new ce({uniforms:{map:{value:j("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),Ve=new d,On=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],Ut=new Map;let ye=null;const Gn={moon:"earth",...Object.fromEntries(Wn.map(e=>[e.id,e.parent]))};function Ft(e,n){const o=Gn[e];if(ye===null||!o)return dt(e,n);const s=dt(o,n),l=dt(e,ye),c=dt(o,ye);return{x:s.x+l.x-c.x,y:s.y+l.y-c.y,z:s.z+l.z-c.z}}function je(e){for(const[n,o]of ue){if(n==="sun")continue;const s=Ft(n,e);o.position.set(s.x*N,s.y*N,s.z*N)}for(const[n,o]of Fe){const s=Ft(n,e);o.position.set(s.x*N,s.y*N,s.z*N)}if(Re){Ve.copy(Re.holder.position);const n=Ve.length()||1;Re.tail.visible=n/N<8,Ve.multiplyScalar(1/n),Re.tail.quaternion.setFromUnitVectors(new d(0,1,0),Ve),Re.tail.position.copy(Ve).multiplyScalar(.16*N)}}const Te=new d(1,0,0),$n=a(new ce({uniforms:{dayMap:{value:j("earth-day.webp")},nightMap:{value:j("earth-night.webp")},normalMap:{value:j("earth-normal.webp",!1)},specMap:{value:j("earth-spec.webp",!1)},texel:{value:new lt(1/2048,1/1024)},sunDir:{value:Te}},vertexShader:Ho,fragmentShader:Yo}));function Xn(e){const n=new X,o=new w(a(new R(e,b?96:128,64)),$n);o.name="earth",n.add(o);const s=new w(a(new R(e*1.012,80,48)),a(new No({map:j("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));n.add(s),Wt=s;const l=new w(a(new R(e*1.06,64,48)),a(new ce({uniforms:{sunDir:{value:Te}},vertexShader:`
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
            }`,side:Je,transparent:!0,blending:oe,depthWrite:!1})));n.add(l);const c=new w(a(new R(e*1.15,b?24:32,b?16:24)),a(new ce({uniforms:{tint:{value:new d(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:Dn,fragmentShader:In,side:kn,transparent:!0,blending:oe,depthWrite:!1})));return n.add(c),pe.set("earth",o),n}function Bt(e,n,o){for(const s of qe(e).sites??[]){const l=new w(a(new R(o*.018,12,8)),a(new E({color:"#3182f6"})));l.position.copy(mt(s.lat,s.lon,o*1.004)),n.add(l);const c=document.createElement("div");c.className="space-site",c.textContent=s.name,f.appendChild(c),pt.push({mesh:l,site:s,el:c,parent:e})}}let Oe=null;for(const e of Ao){if(e.id==="moon")continue;const n=new X;if(ue.set(e.id,n),re.add(n),e.id==="sun"){const o=.26*N,s=new w(a(new R(o,b?96:128,b?64:80)),_t);s.name="sun",Qe.set("sun",o),n.add(s),jn(s,o);for(const[c,m,u,t]of[[1.06,2,.95,"#ffbf78"]])n.add(new w(a(new R(o*c,b?32:48,b?24:32)),a(new ce({uniforms:{color:{value:new Z(t)},power:{value:m},strength:{value:u}},vertexShader:qo,fragmentShader:Ko,transparent:!0,blending:oe,depthWrite:!1}))));pe.set("sun",s);const l=new Un(a(new Fn({map:a(Oo()),blending:oe,transparent:!0,depthWrite:!1,depthTest:!0,color:new Z("#ffd9a0")})));l.scale.setScalar(o*3.6),n.add(l),ut=l}else{const o=kt(e.id).radius*N;Qe.set(e.id,o);let s;if(e.id==="earth"){const u=Xn(o);u.rotation.z=-e.tilt*ae,n.add(u),Oe=u,s=u.children[0]}else{const u=e.id==="saturn"?{inner:o*1.18,outer:o*2.08}:void 0;s=new w(a(new R(o,b?96:128,64)),et(e.texture,e.color,e.id,u)),s.name=e.id,s.rotation.z=-e.tilt*ae,n.add(s),pe.set(e.id,s),Bn(n,o,e.id),e.id==="jupiter"&&Vn(s,o)}if(e.axes){const[u,t,r]=e.axes;s.scale.set(1,r/u,t/u)}if(e.ring&&e.axes){const u=e.axes[0]/2,t=o*(e.ring.radius-e.ring.width/2)/u,r=o*(e.ring.radius+e.ring.width/2)/u,i=new w(a(new He(t,Math.max(r,t*1.03),128,1)),a(new E({color:"#8b8580",side:ke,transparent:!0,opacity:.75,depthWrite:!1})));i.rotation.x=Math.PI/2,n.add(i)}if(e.id==="saturn"){const u=o*1.18,t=o*2.08,r=new He(u,t,160,1),i=a(new ce({uniforms:{ringMap:{value:null},innerRatio:{value:u/t},planetRadius:{value:o},planetCenter:{value:new d}},vertexShader:ta,fragmentShader:na,side:ke,transparent:!0,depthWrite:!1}));ze("saturn-ring.webp",S=>{i.uniforms.ringMap.value=S});const h=new w(a(r),i);h.rotation.x=Math.PI/2,s.add(h),Rt.push({mesh:h,parent:e.id}),Tt.push({mesh:s,material:s.material})}e.sites&&Bt(e.id,s,o);const l=Nn(e.id,.022),c=a(new Ne);c.setAttribute("position",new Et(l.positions,3)),c.setIndex(l.index),c.scale(N,N,N);const m=new w(c,a(new E({color:kt(e.id).ribbon,transparent:!0,opacity:.5,side:ke,depthWrite:!1})));vt.push(m),re.add(m)}It(e.id,e.name,e.id==="sun"?"":" is-planet")}const Vt=[];function jt(e,n,o){let s=e==="main"?1234:98765;const l=()=>(s=s*16807%2147483647,(s-1)/2147483646),c=a(new Ro(1,0)),m=new Float32Array(n*4),u=new Float32Array(n*4);for(let i=0;i<n;i+=1){let h;if(e==="main")do h=2.1+l()*1.2;while((Math.abs(h-2.5)<.03||Math.abs(h-2.82)<.03||Math.abs(h-2.95)<.02)&&l()<.85);else h=l()<.18?39.2+(l()-.5)*1.2:42+(l()-.5)*6.5;m[i*4]=h,m[i*4+1]=l()*Math.PI*2,m[i*4+2]=l()*(e==="main"?.18:.12),m[i*4+3]=l()*Math.PI*2,u[i*4]=(l()-.5)*(e==="main"?.32:.5),u[i*4+1]=l()*Math.PI*2;const S=l()**3;u[i*4+2]=(e==="main"?.0035:.009)*(.7+S*2.4),u[i*4+3]=l()}c.setAttribute("orbit",new Cn(m,4)),c.setAttribute("shape",new Cn(u,4));const t=a(new ce({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new Z(o)},uScale:{value:N}},vertexShader:oa,fragmentShader:aa})),r=new To(c,t,n);r.frustumCulled=!1,r.raycast=()=>{},re.add(r),Vt.push({mesh:r,material:t})}jt("main",b?1800:4200,"#9c9184"),jt("kuiper",b?1500:3600,"#7f8b9c");for(const e of Wn){const n=new X,o=new w(a(new R(e.radius*N,32,24)),et(`${e.id}.webp`,e.color,e.id));o.name=e.id,n.add(o),re.add(n),Fe.set(e.id,n),Ze.set(e.id,o);const s=document.createElement("button");s.type="button",s.className="space-label is-small",s.textContent=e.name,s.addEventListener("click",()=>g.onExtra?.(e.id)),f.appendChild(s),ft.set(e.id,{el:s,parent:e.parent})}{const e=new X,n=new w(a(new R(.045*N,20,16)),a(new E({color:"#f7fbff"})));n.name="halley",e.add(n);const o=new w(a(new yo(.04*N,.32*N,12)),a(new E({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(o),Re={holder:e,tail:o},re.add(e),Fe.set("halley",e),Ze.set("halley",n);const s=Nn("halley",.022),l=a(new Ne);l.setAttribute("position",new Et(s.positions,3)),l.setIndex(s.index),l.scale(N,N,N);const c=new w(l,a(new E({color:kt("halley").ribbon,transparent:!0,opacity:.35,side:ke,depthWrite:!1})));vt.push(c),re.add(c);const m=document.createElement("button");m.type="button",m.className="space-label is-small",m.textContent="핼리 혜성",m.addEventListener("click",()=>g.onExtra?.("halley")),f.appendChild(m),ft.set("halley",{el:m,parent:null})}for(const e of Do){const n=Io(e),o=n.points.map(S=>new d(S.x*N,S.y*N,S.z*N)),s=a(new Ne().setFromPoints(o)),l=new bo(s,a(new ct({color:e.color,transparent:!0,opacity:.95})));l.visible=!1;const c=new X,m=new w(a(new Pt(.03,.01,.01,20)),a(new E({color:"#d8dde4"})));m.rotation.x=Math.PI/2;const u=new w(a(new R(.014,12,8)),a(new E({color:"#c9ced6"})));u.position.z=-.02;const t=new w(a(new Pt(.002,.002,.09,6)),a(new E({color:"#aab3c0"})));t.rotation.z=Math.PI/2,t.position.z=-.02;const r=new w(a(new R(.035,16,12)),a(new E({color:e.color,transparent:!0,opacity:.18,blending:oe,depthWrite:!1})));c.add(m,u,t,r),c.scale.setScalar(e.frame==="earth"?.8:1.3),c.position.copy(o[o.length-1]),l.add(c),(e.frame==="earth"?ue.get("earth")??re:re).add(l);const h=document.createElement("div");h.className="space-site is-probe",h.textContent=e.name,f.appendChild(h),we.set(e.id,{line:l,probe:c,el:h,points:o,times:n.points.map(S=>S.t),marks:n.marks,frame:e.frame})}if(je(ge),Oe){const e=.055*N;Qe.set("moon",e);const n=new w(a(new R(e,T,48)),et("moon.webp","#b8b8b8","moon"));n.name="moon";const o=new X;o.add(n),re.add(o),pe.set("moon",n),ue.set("moon",o),Bt("moon",n,e),It("moon","달"," is-small"),je(ge)}const Ge=new X,Le=new X,tt=new X;Ge.add(Le,tt),Ge.visible=!1;let Ot="solar",Se=!1,ht=0;const z={moon:new w,moonMat:a(new E({color:"#ffffff"})),shadow:a(new E({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new w,umbra:new w,skyCover:new w,skySun:new X,skyMoon:new X,skyMoonMat:a(new E({color:"#ffffff"}))},Gt=[],$t=j("sun.webp"),Xt=j("moon.webp"),Ht=new w(a(new R(.62,32,24)),a(new E({map:$t})));Ht.position.set(-3.3,0,0);const Yt=new w(a(new R(.4,32,24)),a(new E({map:j("earth-day.webp")})));Yt.position.set(1.85,0,0),z.moonMat.map=Xt,z.moon=new w(a(new R(.14,24,18)),z.moonMat),z.cone=new w(a(new Pt(.04,.16,.78,18)),z.shadow),z.cone.position.set(1.42,0,0),z.cone.rotation.z=Math.PI/2,z.umbra=new w(a(new Ye(.3,28)),a(new E({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),z.umbra.position.set(2.75,0,.02),Le.add(Ht,Yt,z.moon,z.cone,z.umbra);for(const[e,n]of[["태양",new d(-3.3,.85,0)],["지구",new d(1.85,.68,0)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,f.appendChild(o),Gt.push({el:o,at:n,group:Le})}const Hn=new w(a(new Ye(1.35,48)),a(new E({map:$t}))),Yn=new w(a(new He(1.4,1.7,48)),a(new E({color:"#f0c36a",transparent:!0,opacity:.45,side:ke,depthWrite:!1})));z.skyCover=new w(a(new Ye(1.22,48)),a(new E({color:"#141820"}))),z.skySun.add(Hn,Yn,z.skyCover),z.skyMoonMat.map=Xt;const qn=new w(a(new Ye(.92,48)),z.skyMoonMat),qt=new w(a(new Ye(1.08,48)),a(new E({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));qt.position.z=.16,z.skyMoon.add(qn,qt),tt.add(z.skySun,z.skyMoon),tt.visible=!1,V.add(Ge);const Ee=new X;Ee.visible=!1,Ee.rotation.z=-Math.PI/2;const Kt=[],Jt=4.6,Kn=e=>Jt*e/696e3,Qt=new w(a(new R(Jt,64,40)),a(new E({map:j("sun.webp")})));Qt.position.set(-3.2,0,0),Ee.add(Qt);const Jn=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let Zt=2.4;const en=(e,n)=>{const o=document.createElement("div");o.className="space-site",o.textContent=e,f.appendChild(o),Kt.push({el:o,at:n,group:Ee})};en("태양",new d(-3.2,4.9,0));for(const[e,n]of Jn){const o=Kn(n),s=Zt+o;Zt=s+o+.72;const l=qe(e),c=e==="earth"?"earth-day.webp":l.texture,m=a(new E({color:l.color}));c&&ze(c,t=>{m.map=t,m.color.set("#ffffff"),m.needsUpdate=!0});const u=new w(a(new R(o,32,24)),m);if(u.position.set(s,0,0),l.axes&&u.scale.set(1,l.axes[2]/l.axes[0],l.axes[1]/l.axes[0]),Ee.add(u),e==="saturn"){const t=o*1.18,r=o*2.08,i=a(new He(t,r,96,1)),h=i.attributes.position,S=i.attributes.uv,G=new d;for(let $=0;$<h.count;$+=1)G.fromBufferAttribute(h,$),S.setXY($,(G.length()-t)/(r-t),.5);const J=a(new E({color:"#b9b3ab",transparent:!0,opacity:.9,side:ke,depthWrite:!1}));ze("saturn-ring.webp",$=>{J.map=$,J.color.set("#ffffff"),J.needsUpdate=!0});const he=new w(i,J);he.rotation.y=Math.PI/2-.36,u.add(he)}en(l.name,new d(s,(e==="saturn"?o*2.08:o)+.12,0))}V.add(Ee);const fe=new X;fe.visible=!1;const wt=[],tn=[],Qn=new w(a(new R(.55,48,32)),a(new E({color:"#e0703a"})));fe.add(Qn);for(const[e,n]of[[1.35,.16],[2.1,.05]])fe.add(new w(a(new R(.55*e,32,24)),a(new E({color:"#ff6a30",transparent:!0,opacity:n,side:Je,blending:oe,depthWrite:!1}))));const nn=new w(a(new He(2.6,5.1,96,1)),a(new E({color:"#3fbf7f",transparent:!0,opacity:.12,side:ke,depthWrite:!1})));nn.rotation.x=Math.PI/2,fe.add(nn),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,n,o,s,l],c)=>{const m=new Pn(a(new Ne().setFromPoints(Array.from({length:128},(r,i)=>new d(Math.cos(i/128*Math.PI*2)*o*100,0,Math.sin(i/128*Math.PI*2)*o*100)))),a(new ct({color:"#8b95a1",transparent:!0,opacity:.35})));fe.add(m);const u=new w(a(new R(.16*s,24,16)),et(void 0,l,"earth"));fe.add(u);const t=document.createElement("button");t.type="button",t.className="space-label is-small",t.textContent=e,t.addEventListener("click",()=>g.onExtra?.(`trappist-${e}`)),f.appendChild(t),wt.push({mesh:u,a:o*100,period:n,phase0:c*1.7,el:t})});const Zn=new Pn(a(new Ne().setFromPoints(Array.from({length:256},(e,n)=>new d(Math.cos(n/256*Math.PI*2)*38.7,0,Math.sin(n/256*Math.PI*2)*38.7)))),a(new ct({color:"#c5b8a2",transparent:!0,opacity:.5})));fe.add(Zn);for(const[e,n]of[["TRAPPIST-1",new d(0,1.1,0)],["생명가능지대(대략)",new d(3.9,0,0)],["비교: 우리 수성의 궤도",new d(0,0,38.7)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,f.appendChild(o),tn.push({el:o,at:n})}V.add(fe);const ve=Bo(),gt=[];if(ve)for(const[e,n]of Object.entries(ve.groups)){V.add(n);for(const o of ve.markers[e]){const s=document.createElement("button");s.type="button",s.className="space-label",s.textContent=o.name,s.addEventListener("click",()=>{g.onMarker?.(o),C.target.copy(o.position),C.radius=De[e]*(o.id==="cmb"?1.4:e==="group"?.6:.42)}),f.appendChild(s),gt.push({level:e,marker:o,el:s})}}const on=[];if(ve){const n=(c,m)=>new d(Math.cos(m*ae)*Math.cos(c*ae),Math.sin(m*ae),-Math.cos(m*ae)*Math.sin(c*ae)).multiplyScalar(140),o=[];for(const c of Object.values(Rn))for(const m of c)for(let u=0;u<m.length-1;u+=1){const t=n(m[u][0],m[u][1]),r=n(m[u+1][0],m[u+1][1]);o.push(t.x,t.y,t.z,r.x,r.y,r.z)}const s=a(new Ne);s.setAttribute("position",new Et(o,3));const l=new xo(s,a(new ct({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));ve.groups.stars.add(l);for(const c of _o){if(!Rn[c.id])continue;const m=document.createElement("button");m.type="button",m.className="space-label is-const",m.textContent=c.name.replace(/\(.*\)/,"").split(" · ")[0],m.addEventListener("click",()=>g.onConstellation?.(c.id)),f.appendChild(m),on.push({el:m,at:n(c.center[0],c.center[1])})}}const nt=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let D="system",Ae=!1,an=!1;const De={system:40,super:40,eclipse:7.5,sizes:15,exo:16,stars:46,orion:48,galaxy:44,group:40,cosmos:70},$e=new d,P={theta:.6,phi:.95,radius:34},C={target:new d,radius:P.radius};let O="system",Q=null,ee=null,le=null;function ot(e){if((e==="system"||e==="sizes")&&me(),D=e,Ae=!1,re.visible=e==="system",Ge.visible=e==="eclipse",Ee.visible=e==="sizes",fe.visible=e==="exo",ve)for(const[n,o]of Object.entries(ve.groups))o.visible=n===e;O="system",Q=null,ee=null,le=null,C.target.set(0,0,0),C.radius=De[e],e!=="system"&&(P.phi=1.1),e==="eclipse"&&(Le.rotation.z=x.aspect<1?-Math.PI/2:0,P.theta=0,P.phi=Se?Math.PI/2:1.25,C.target.set(0,0,0),Se||C.target.set(-.7,0,0).applyEuler(Le.rotation),C.radius=Se?6:x.aspect<1?10:7.5),e==="exo"&&(P.phi=.75),e==="sizes"&&(P.theta=0,P.phi=Math.PI/2,C.target.set(.6,-6.8,0),C.radius=19)}function sn(e){if(e!=="earth"&&me(),Ae=!1,D!=="system"&&(D="system",re.visible=!0,Ge.visible=!1,Ee.visible=!1,fe.visible=!1,ve))for(const o of Object.values(ve.groups))o.visible=!1;if(O=e,ee=null,le=null,e==="system"){Q=null,C.target.set(0,0,0),C.radius=De.system;return}Q=ue.get(e)??null;const n=Qe.get(e)??Xo(qe(e).km);C.radius=e==="sun"?3.2:e==="jupiter"?3.4*N:e==="saturn"?2.6*N:Math.max(n*(qe(e).ring?6:4.2),.25)}function eo(e){const n=Fe.get(e);n&&(D!=="system"&&ot("system"),O="system",Q=n,ee=null,le=null,C.radius=e==="halley"?1.6:.6,Ce=performance.now())}function to(e){le=(e?pt.find(o=>o.parent===O&&o.site.name===e.name):void 0)?.mesh??null,ee=le?new d:null,Ce=performance.now()}const be=new Map;let Xe=0,at=0,Ce=0;const rn=new Mo,ln=new lt,cn=e=>{if(me(),F.setPointerCapture(e.pointerId),Ae=!1,be.set(e.pointerId,{x:e.clientX,y:e.clientY}),at=0,Ce=performance.now(),be.size===2){const[n,o]=[...be.values()];Xe=Math.hypot(n.x-o.x,n.y-o.y)}},dn=e=>{const n=be.get(e.pointerId);if(!n)return;const o=e.clientX-n.x,s=e.clientY-n.y;if(be.set(e.pointerId,{x:e.clientX,y:e.clientY}),Ce=performance.now(),be.size===1)at+=Math.abs(o)+Math.abs(s),P.theta-=o*.006,P.phi=Math.min(2.9,Math.max(.2,P.phi-s*.006)),ee=null,le=null;else if(be.size===2){const[l,c]=[...be.values()],m=Math.hypot(l.x-c.x,l.y-c.y);Xe>0&&(C.radius=pn(C.radius*(Xe/m))),Xe=m,at+=10}},st=e=>{if(be.delete(e.pointerId),Xe=0,at<6&&g.onPick){const n=F.getBoundingClientRect();ln.set((e.clientX-n.left)/n.width*2-1,-((e.clientY-n.top)/n.height)*2+1),rn.setFromCamera(ln,x);const s=rn.intersectObjects([...pe.values(),...Ze.values()],!1)[0]?.object.name;s&&pe.has(s)?g.onPick(s):s&&Ze.has(s)&&g.onExtra?.(s)}},mn=e=>{e.preventDefault(),C.radius=pn(C.radius*(e.deltaY>0?1.12:.89))};function pn(e){return D!=="system"?Math.min(De[D]*2.2,Math.max(De[D]*.15,e)):Math.min(90,Math.max(O==="system"&&!Q?4:.15,e))}F.addEventListener("pointerdown",cn),F.addEventListener("pointermove",dn),F.addEventListener("pointerup",st),F.addEventListener("pointercancel",st),F.addEventListener("wheel",mn,{passive:!1});let xe=null,rt=null,yt=!matchMedia("(prefers-reduced-motion: reduce)").matches,un=0,fn=0;yt&&(xe=new zo(q),xe.addPass(new So(V,x)),rt=new Eo(new lt(256,256),.75,.78,.92),xe.addPass(rt),xe.addPass(new Po));const W={w:1,h:1},vn=()=>{W.w=U.clientWidth||1,W.h=U.clientHeight||1,q.setSize(W.w,W.h,!1),xe?.setSize(W.w,W.h),rt?.resolution.set(W.w/2,W.h/2),x.aspect=W.w/W.h,x.updateProjectionMatrix()};vn();const hn=new ResizeObserver(vn);hn.observe(U);let wn=!0;const gn=new IntersectionObserver(e=>{wn=e.some(n=>n.isIntersecting)});gn.observe(U);const p=new d,We=new d,Ie=new d,bt=new d,no=new d,oo=new d,ao=new d,so=new d,yn=new d,ro=new d;let xt=0,bn=performance.now(),Mt=-1e9,xn=0;const Mn=e=>{xt=requestAnimationFrame(Mn);const n=Math.min(.1,(e-bn)/1e3);if(bn=e,document.hidden||!wn)return;if(nt||(_t.uniforms.time.value=e/1e3),!nt){for(const t of Lt)t.uniforms.time.value=e/1e3;for(const t of At)t.uniforms.uTime.value=e/1e3}e-Ce>3e3&&!nt&&!ee&&!an&&!Ae&&D!=="eclipse"&&D!=="sizes"&&(P.theta+=n*(O==="system"?.03:.08)),Wt?.rotateY(n*.01);for(const[t,r]of pe){if(t==="earth"||t==="moon"||le&&t===O)continue;const i=qe(t).spinHours;nt||r.rotateY(n*(t==="sun"?.02:i?.12*(24/i)*.25:.12))}ut&&(ut.visible=x.position.length()>4);for(const t of Vt)t.material.uniforms.uDays.value=(ge-Vo)/864e5,t.material.uniforms.uTime.value=e/1e3;for(const t of Rt){const r=pe.get(t.parent);r&&t.mesh.material.uniforms.planetCenter.value.copy(r.getWorldPosition(p))}for(const t of Tt)t.mesh.getWorldPosition(p),t.material.uniforms.ringCenter.value.copy(p),t.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(t.mesh.matrixWorld).normalize();if(Be&&e-xn>1e3&&(xn=e,ge=Date.now(),je(ge)),y){const t=we.get(y.id),r=t.points.length,i=t.times[r-1],h=(t.frame==="earth"?6:25)*864e5,G=t.marks.some(Y=>Y.at!==void 0&&Y.body&&Y.body!=="earth"&&Math.abs(y.sim-Y.at)<h)?"slow":y.sim>=y.fastFrom?"fast":"normal",J=G==="slow"?Math.min(y.base,2*h/3):y.base*(G==="fast"?y.fast:1);y.sim=Math.min(i,y.sim+J*Math.min(n,.1)),t.frame==="sun"?ye=(ye??y.sim)+Math.min(n,.1)*.15*864e5:ye=null,y.pace=G;const he=(y.sim-t.times[0])/(i-t.times[0]||1);let $=0,te=r-1;for(;te-$>1;){const Y=$+te>>1;t.times[Y]<=y.sim?$=Y:te=Y}const ne=t.times[te]-t.times[$],ie=$+(ne>0?(y.sim-t.times[$])/ne:0),Pe=Math.max(0,Math.min(r-2,Math.floor(ie))),zn=ie-Pe;t.probe.position.lerpVectors(t.points[Pe],t.points[Pe+1],zn),Nt=ie,t.probe.lookAt(t.line.localToWorld(t.points[Math.min(r-1,Pe+2)].clone())),t.line.geometry.setDrawRange(0,Pe+2);const zt=t.times[Pe]+(t.times[Pe+1]-t.times[Pe])*zn;Be=!1,ge=zt,je(zt);let it=0;for(let Y=0;Y<t.marks.length;Y+=1){const Sn=t.marks[Y],io=Sn.at??t.times[Math.min(r-1,Sn.index)];y.sim>=io-h&&(it=Y)}if((it!==y.mark||e-y.lastPing>250||y.sim>=i&&!y.done)&&(y.mark=it,y.lastPing=e,y.sim>=i&&(y.done=!0),g.onFlight?.({id:y.id,mark:t.marks[it],progress:he,time:zt,done:y.done,pace:y.pace})),y.done){const Y=t.frame==="earth";y=null,ye=null,Be=!0,Q=Y?ue.get("earth")??null:null,Y||C.target.set(0,0,0),C.radius=Y?4.2:72,P.phi=Y?.7:.45}}if(Q&&C.target.copy(Q.getWorldPosition(p)),y){const t=we.get(y.id);let r=null,i=1/0;for(const S of t.marks){if(!S.body||S.body==="earth"||S.body==="far")continue;const G=Math.abs(S.index-Nt);G<14&&G<i&&(r=S,i=G)}const h=r?ue.get(r.body):void 0;if(h){const S=h.getWorldPosition(ao).add(t.probe.getWorldPosition(so)).multiplyScalar(.5);C.target.copy(S),C.radius=t.frame==="earth"?1.6:4.2}else C.radius=t.frame==="earth"?1.5:2.8}if($e.lerp(C.target,1-Math.pow(.002,n)),P.radius+=(C.radius-P.radius)*(1-Math.pow(.004,n)),ee&&le){const t=pe.get(O)?.getWorldPosition(yn)??yn.set(0,0,0);ee.copy(le.getWorldPosition(ro).sub(t).normalize());const r=Math.atan2(ee.x,ee.z),i=Math.acos(Math.max(-1,Math.min(1,ee.y)));let h=r-P.theta;h=Math.atan2(Math.sin(h),Math.cos(h)),P.theta+=h*(1-Math.pow(.01,n)),P.phi+=(i-P.phi)*(1-Math.pow(.01,n))}if(D==="exo"){const t=e/1e3;for(const r of wt){const i=r.phase0+t/r.period*Math.PI*2;r.mesh.position.set(Math.cos(i)*r.a,0,Math.sin(i)*r.a)}}if(D==="eclipse"){ht=(ht+n*.18)%1;const t=Math.sin(ht*Math.PI*2),r=Math.abs(t)<.22,i=Ot==="lunar";Le.visible=!Se,tt.visible=Se,z.skySun.visible=!i,z.skyMoon.visible=i,Se?i?(z.skyMoon.position.set(t*1.7,0,.08),z.skyMoonMat.color.set(r?"#c47462":"#f2f2f2")):z.skyCover.position.set(t*1.7,0,.08):(z.moon.position.set(i?2.75:1.05,t*.55,0),z.cone.visible=!i,z.umbra.visible=i,z.shadow.opacity=r?.42:.08,z.umbra.material.opacity=r?.42:.08,z.moonMat.color.set(i&&r?"#c47462":"#ffffff"))}if(x.position.set($e.x+P.radius*Math.sin(P.phi)*Math.sin(P.theta),$e.y+P.radius*Math.cos(P.phi),$e.z+P.radius*Math.sin(P.phi)*Math.cos(P.theta)),x.lookAt($e),Oe&&(Oe.getWorldPosition(p),Te.copy(p).multiplyScalar(-1).normalize(),e-Mt>500&&!(y&&we.get(y.id)?.frame==="sun"))){Mt=e;const t=Uo(new Date(ge)),r=Math.atan2(t.y,t.x),i=Math.atan2(-Te.z,Te.x),h=Oe.children[0];h.rotation.y=i-r}xe&&yt&&(D!=="system"||O==="system"||O==="sun")&&xe?(xe.render(n),un+=1,fn+=n,un===90&&fn/90>.034&&(yt=!1)):q.render(V,x),x.getWorldDirection(We);const l=[];for(const t of On){const r=Ct.get(t),i=ue.get(t);if(!r||!i)continue;i.getWorldPosition(p);const h=Ie.copy(p).sub(x.position).dot(We)>0,S=O==="system"&&D==="system"&&(!Q||y!==null),G=O==="earth"||O==="moon"||y!==null&&we.get(y.id)?.frame==="earth";let J=h&&(t==="moon"?D==="system"&&G:S||G&&t==="earth"&&y!==null);p.project(x);const he=(p.x+1)/2*W.w,$=(1-p.y)/2*W.h+10;if(J){let te=Ut.get(t)??0;te||(r.style.display="block",te=r.offsetWidth||40,Ut.set(t,te));const ne={x:he-te/2,y:$,w:te,h:22};l.some(ie=>ne.x<ie.x+ie.w+4&&ne.x+ne.w+4>ie.x&&ne.y<ie.y+ie.h&&ne.y+ne.h>ie.y)?J=!1:l.push(ne)}r.style.display=J?"block":"none",J&&(r.style.transform=`translate(${he}px, ${$}px) translate(-50%, 0)`)}const c=D==="system",m=O!=="system"&&O!=="jupiter"&&O!=="saturn",u=Q!==null&&(y===null?Q===ue.get("earth"):we.get(y.id)?.frame==="earth");for(const t of vt)t.visible=!m&&!u;for(const[t,r]of ft){const i=Fe.get(t),h=r.parent?ue.get(r.parent)===Q:O==="system"&&(!Q||Q===i),S=Q===i||h;i.getWorldPosition(p);const G=Ie.copy(p).sub(x.position).dot(We)>0,J=c&&G&&S;p.project(x),r.el.style.display=J?"block":"none",J&&(r.el.style.transform=`translate(${(p.x+1)/2*W.w}px, ${(1-p.y)/2*W.h+8}px) translate(-50%, 0)`)}for(const[t,r]of we){const i=c&&Dt===t;if(r.line.visible=i,!i){r.el.style.display="none";continue}r.probe.getWorldPosition(p);const h=Ie.copy(p).sub(x.position).dot(We)>0;p.y+=0,p.project(x),r.el.style.display=h?"block":"none",h&&(r.el.style.transform=`translate(${(p.x+1)/2*W.w}px, ${(1-p.y)/2*W.h}px) translate(10px, -50%)`)}for(const t of on){if(D!=="stars"){t.el.style.display="none";continue}p.copy(t.at);const r=Ie.copy(p).sub(x.position).dot(We)>0;p.project(x);const i=r&&Math.abs(p.x)<1&&Math.abs(p.y)<1;t.el.style.display=i?"block":"none",i&&(t.el.style.transform=`translate(${(p.x+1)/2*W.w}px, ${(1-p.y)/2*W.h}px) translate(-50%, -50%)`)}for(const t of gt){if(!(t.level===D)){t.el.style.display="none";continue}p.copy(t.marker.position);const i=Ie.copy(p).sub(x.position).dot(We)>0;p.project(x),t.el.style.display=i?"block":"none",i&&(t.el.style.transform=`translate(${(p.x+1)/2*W.w}px, ${(1-p.y)/2*W.h+8}px) translate(-50%, 0)`)}for(const t of wt){if(D!=="exo"){t.el.style.display="none";continue}t.mesh.getWorldPosition(p);const r=Ie.copy(p).sub(x.position).dot(We)>0;p.project(x),t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(p.x+1)/2*W.w}px, ${(1-p.y)/2*W.h+8}px) translate(-50%, 0)`)}for(const t of tn){if(D!=="exo"){t.el.style.display="none";continue}p.copy(t.at).project(x);const r=p.z<1&&Math.abs(p.x)<1.05&&Math.abs(p.y)<1.05;t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(p.x+1)/2*W.w}px, ${(1-p.y)/2*W.h}px) translate(-50%, -100%)`)}for(const[t,r]of[[Gt,D==="eclipse"&&!Se],[Kt,D==="sizes"]])for(const i of t){if(!r){i.el.style.display="none";continue}p.copy(i.at).applyMatrix4(i.group.matrixWorld).project(x);const h=p.z<1&&Math.abs(p.x)<1.1&&Math.abs(p.y)<1.1;i.el.style.display=h?"block":"none";const S=i.group.rotation.z!==0;h&&(i.el.style.transform=`translate(${(p.x+1)/2*W.w}px, ${(1-p.y)/2*W.h}px) ${S?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const t of pt){t.mesh.getWorldPosition(p);const r=pe.get(t.parent);r?r.getWorldPosition(bt):bt.set(0,0,0);const h=no.copy(p).sub(bt).normalize().dot(oo.copy(x.position).sub(p).normalize())>.15&&D==="system"&&O===t.parent;p.project(x),t.el.style.display=h?"block":"none",h&&(t.el.style.transform=`translate(${(p.x+1)/2*W.w}px, ${(1-p.y)/2*W.h}px) translate(8px, -50%)`)}};return xt=requestAnimationFrame(Mn),K===0&&g.onReady?.(),{focus:sn,setLevel:ot,setPaused:e=>{an=e},focusMarker:e=>{const n=gt.find(o=>o.level===D&&o.marker.id===e);n&&(C.target.copy(n.marker.position),C.radius=De[D]*(e==="cmb"?1.4:D==="group"?.6:.42),Ce=performance.now())},showSite:to,focusExtra:eo,setEclipse:(e,n)=>{Ot=e,Se=n,ot("eclipse")},setHemisphere:e=>{O!=="earth"&&sn("earth");const n=Te.clone().multiplyScalar(e==="day"?1:-1);P.theta=Math.atan2(n.x,n.z),P.phi=Math.min(2.6,Math.max(.5,Math.acos(n.y))),ee=null,le=null,Ae=!0},setTime:e=>{Be=e===null,ge=e??Date.now(),je(ge),Mt=-1e9},setVoyage:e=>{if(Dt=e,!e){y&&(y=null,Be=!0),ye=null;for(const r of we.values())r.line.geometry.setDrawRange(0,1/0);return}D!=="system"&&ot("system"),ye=null;const n=we.get(e);n.line.geometry.setDrawRange(0,2),O="system",ee=null,le=null,Ae=!1,Q=n.probe;const o=n.frame==="earth";C.radius=o?1.3:2.8,P.phi=o?.75:1;const s=Math.max(...n.marks.filter(r=>r.at!==void 0&&r.body!=="earth").map(r=>r.at),n.times[0]+864e5),l=n.times[0],c=n.times[n.times.length-1],m=(s-l)/(o?20:24),u=n.frame==="earth"?c:s+60*864e5,t=c>u?(c-u)/4/m:1;y={id:e,sim:l,base:m,fastFrom:u,fast:t,mark:-1,done:!1,lastPing:0,pace:"normal"},Ce=performance.now()},dispose:()=>{ve?.dispose(),xe?.dispose(),rt?.dispose(),cancelAnimationFrame(xt),hn.disconnect(),gn.disconnect(),F.removeEventListener("pointerdown",cn),F.removeEventListener("pointermove",dn),F.removeEventListener("pointerup",st),F.removeEventListener("pointercancel",st),F.removeEventListener("wheel",mn),V.traverse(e=>{const n=e.material;Array.isArray(n)&&n.forEach(o=>o.dispose())}),v.forEach(e=>e.dispose()),q.dispose(),F.remove(),f.remove()}}}export{ca as createSpace};
