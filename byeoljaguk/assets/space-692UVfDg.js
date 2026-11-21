import{a as c,t as fo}from"./index-Bj4U6N3U.js";import{G as $,V as p,M as y,S as T,a as P,A as se,B as Qe,C as jn,b as On,c as Gn,d as ee,e as Re,f as Nn,P as vo,g as ho,W as wo,h as Ct,i as go,j as yo,k as xo,T as bo,I as Mo,l as zo,m as So,n as pe,o as dt,R as qe,D as Pe,F as Pt,p as Eo,L as ko,q as mt,r as Wt,s as Ke,t as Rn,u as Co,v as Po,E as Wo,w as No,U as Ro,O as To,N as Ao,x as Lo,y as Do,z as Io,H as Tn,J as _o,K as An,Q as Uo,X as Bo}from"./three-DR5XHIPo.js";import{af as Ln,ag as Fo,ah as Nt,ai as Dn,aj as Vo,ak as jo,al as Je,C as Oo,am as Go,an as pt}from"./App-Crb2lhu4.js";import{C as In}from"./sky-BbdSAoy2.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";import"./audio-BPJdcmVW.js";const Ze=Math.PI/180;function ue(_,x,M){return new p(Math.cos(x*Ze)*Math.cos(_*Ze),Math.sin(x*Ze),-Math.cos(x*Ze)*Math.sin(_*Ze)).multiplyScalar(M)}function $o(){const x=document.createElement("canvas");x.width=64,x.height=64;const M=x.getContext("2d");if(M){const A=M.createRadialGradient(32,32,0,32,32,32);A.addColorStop(0,"rgba(255,255,255,1)"),A.addColorStop(.25,"rgba(255,255,255,0.75)"),A.addColorStop(1,"rgba(255,255,255,0)"),M.fillStyle=A,M.fillRect(0,0,64,64)}return new jn(x)}function Xo(){const _=[],x=g=>(_.push(g),g),M=x($o());function A(g,z,S){const w=new On(x(new Gn({map:M,color:new ee(g),transparent:!0,depthWrite:!1,blending:se})));return w.scale.setScalar(z),w.position.copy(S),w}function H(g,z,S){const w=new Float32Array(g*3),D=new Float32Array(g*3);for(let I=0;I<g;I+=1){const[q,B]=z(I);w.set([q.x,q.y,q.z],I*3),D.set([B.r,B.g,B.b],I*3)}const a=x(new Re);return a.setAttribute("position",new Nn(w,3)),a.setAttribute("color",new Nn(D,3)),new vo(a,x(new ho({size:S,map:M,vertexColors:!0,transparent:!0,depthWrite:!1,blending:se,sizeAttenuation:!0})))}let F=7;const v=()=>(F=F*16807%2147483647,(F-1)/2147483646),ie={},fe={};{const g=new $,z=2.6,S=[["alphacen",c("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",c("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",c("바너드별"),269.45,4.69,5.96,"#ffb27a",c("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",c("울프 359"),164.12,7.01,7.86,"#ff9a6a",c("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",c("시리우스"),101.29,-16.72,8.6,"#cfe0ff",c("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",c("로스 154"),282.46,-23.84,9.69,"#ffa070",c("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",c("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",c("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",c("백조자리 61"),316.7,38.75,11.4,"#ffc58a",c("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",c("프로키온"),114.83,5.22,11.46,"#fff3d6",c("작은개자리의 밝은 별이에요.")],["epsind",c("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",c("남쪽 하늘의 가까운 별이에요.")],["taucet",c("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",c("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];g.add(A("#ffe39a",3.2,new p));const w=[{id:"sun-star",name:c("태양"),line:c("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new p}];for(const[D,a,I,q,B,U,J]of S){const le=ue(I,q,B*z);g.add(A(U,2.4,le)),w.push({id:D,name:a,line:fo("{0} 거리 약 {1}광년.",J,B),position:le})}g.add(H(500,()=>[new p(v()-.5,v()-.5,v()-.5).normalize().multiplyScalar(60+v()*30),new ee().setHSL(.1,.3,.5+v()*.4)],.9)),ie.stars=g,fe.stars=w}{const g=new $,z=1/40,S=[["pleiades",c("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,c("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",c("베텔게우스"),88.79,7.41,548,"#ffab6e",3,c("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",c("리겔"),78.63,-8.2,860,"#cfe0ff",3,c("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",c("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,c("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",c("데네브"),310.36,45.28,2600,"#e6eeff",3,c("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];g.add(A("#ffe39a",1.6,new p));const w=[{id:"sun-orion",name:c("태양"),line:c("우리은하의 오리온 팔 안쪽에 있어요."),position:new p}];for(const[D,a,I,q,B,U,J,le]of S){const ne=ue(I,q,B*z);g.add(A(U,J,ne)),D==="orionneb"&&g.add(H(260,()=>{const xe=Math.pow(v(),.6)*5;return[new p(v()-.5,v()-.5,v()-.5).normalize().multiplyScalar(xe).add(ne),new ee(v()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),w.push({id:D,name:a,line:le,position:ne})}g.add(H(1400,()=>{const D=(v()-.5)*120,a=(v()-.5)*22*(.4+v()),I=(v()-.5)*4;return[new p(D,I,a),new ee().setHSL(.6+v()*.1,.3,.35+v()*.3)]},.8)),ie.orion=g,fe.orion=w}{const g=new $,z=4;g.add(H(9e3,w=>{const D=w%z,a=Math.pow(v(),.55)*25,I=D/z*Math.PI*2+Math.log(1+a)*1.9+(v()-.5)*(.5+4/(a+2)),q=(v()-.5)*(a<4?2.2:.7),B=a<4,U=B?new ee("#ffd9a0"):new ee().setHSL(.58+v()*.06,.45,.45+v()*.35);return[new p(Math.cos(I)*a,q,Math.sin(I)*a),U.multiplyScalar(B?.8:.6)]},.55)),g.add(A("#fff0c8",7,new p));const S=new p(13,0,0);g.add(A("#ffe39a",1.2,S)),ie.galaxy=g,fe.galaxy=[{id:"center",name:c("은하 중심(궁수자리 A*)"),line:c("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new p},{id:"sun-gal",name:c("태양은 여기"),line:c("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:S}]}{const g=new $,z=1/1e5,S=(B,U,J,le,ne)=>H(le,xe=>{const oe=Math.pow(v(),.6)*U,Te=xe%2*Math.PI+Math.log(1+oe*3)*2.2+(v()-.5)*.9,Z=new p(Math.cos(Te)*oe,(v()-.5)*U*.05,Math.sin(Te)*oe);Z.applyAxisAngle(new p(1,0,0),J);const Be=oe<U*.18;return[Z.add(B),new ee().setHSL(Be?.1:ne,.4,.45+v()*.3).multiplyScalar(Be?.35:.22)]},.4),w=new p;g.add(S(w,2.2,0,1800,.6));const D=ue(10.68,41.27,25e5*z);g.add(S(D,4.4,1.2,3200,.1));const a=ue(23.46,30.66,273e4*z);g.add(S(a,1.6,.6,900,.62));const I=ue(80.89,-69.76,16e4*z);g.add(A("#cfd8ff",1.2,I));const q=ue(13.19,-72.83,2e5*z);g.add(A("#cfd8ff",.8,q)),ie.group=g,fe.group=[{id:"mw",name:c("우리 은하"),line:c("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:w},{id:"andromeda",name:c("안드로메다은하"),line:c("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:D},{id:"triangulum",name:c("삼각형자리은하"),line:c("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:a},{id:"lmc",name:c("대마젤란은하"),line:c("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:I}]}{const g=new $,z=6,S=(B,U,J)=>new p(B,U,J).multiplyScalar(z),w=S(5.1,.35,1.1),D=S(3.4,.45,.2),a=S(-1.4,-.3,-.5),I=[[S(.2,0,0),900,6.4*z*.5],[D,280,1.5*z*.5],[a,220,1.7*z*.5],[S(-2.2,1.6,2.4),120,1.1*z*.5]],q=I.reduce((B,U)=>B+U[1],0);g.add(H(q+180,B=>{let U=B;for(const[le,ne,xe]of I){if(U<ne)return[new p(v()-.5,(v()-.5)*.5,v()-.5).multiplyScalar(2*xe*Math.pow(v(),.5)).add(le),new ee("#f3eee6").multiplyScalar(.75)];U-=ne}const J=v();return[w.clone().lerp(a,J).add(new p((v()-.5)*.7*z,(v()-.5)*.45*z,(v()-.5)*.7*z)),new ee("#e7c48a").multiplyScalar(.8)]},.5)),g.add(new y(x(new T(.95*z,20,16)),x(new P({color:"#d5e2f5",transparent:!0,opacity:.1,blending:se,depthWrite:!1}))).translateX(D.x).translateY(D.y).translateZ(D.z)),g.add(new y(x(new T(1.05*z,20,16)),x(new P({color:"#e7c48a",transparent:!0,opacity:.09,blending:se,depthWrite:!1}))).translateX(a.x).translateY(a.y).translateZ(a.z)),g.add(A("#e4b56a",1.2,w)),ie.super=g,fe.super=[{id:"localgroup",name:c("우리 은하군"),line:c("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:w},{id:"virgo-sc",name:c("처녀자리 은하단"),line:c("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:D},{id:"attractor-sc",name:c("거대 인력체"),line:c("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:a}]}{const g=new $,z=1/1e7,S=ue(187.7,12.4,54e6*z),w=ue(243,-60,2e8*z);g.add(H(5e3,a=>{const I=a%5,B=[S,w,ue(30,20,15e7*z),ue(160,-30,18e7*z),ue(300,40,14e7*z)][I],U=I===1?7:4;return[new p((v()-.5)*2,(v()-.5)*2,(v()-.5)*2).multiplyScalar(U*Math.pow(v(),.4)).add(B),new ee().setHSL(.08+v()*.5,.35,.55).multiplyScalar(.8)]},.8)),g.add(A("#ffffff",.8,new p));const D=new y(x(new T(42,48,32)),x(new P({color:"#ff8a4a",transparent:!0,opacity:.08,side:Qe,depthWrite:!1})));g.add(D),ie.cosmos=g,fe.cosmos=[{id:"here",name:c("우리 은하"),line:c("여기서는 점 하나예요."),position:new p},{id:"virgo",name:c("처녀자리 은하단"),line:c("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:S},{id:"attractor",name:c("거대 인력체"),line:c("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:w},{id:"cmb",name:c("가장 오래된 빛"),line:c("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new p(0,0,-42)}]}for(const g of Object.values(ie))g.visible=!1;return{groups:ie,markers:fe,dispose:()=>_.forEach(g=>g.dispose())}}const _n="textures/",re=Math.PI/180;function ut(_,x,M=1){return new p(Math.cos(_*re)*Math.cos(x*re),Math.sin(_*re),-Math.cos(_*re)*Math.sin(x*re)).multiplyScalar(M)}const R=2.2,Ho=Date.UTC(2e3,0,1,12),Un={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},Bn={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function Yo(){if(typeof window>"u")return!0;const _=navigator,x=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,M=_.hardwareConcurrency??8,A=_.deviceMemory??8;return!!(x||M<=4||A<=4)}function qo(){const x=document.createElement("canvas");x.width=128,x.height=128;const M=x.getContext("2d");if(M){const A=M.createRadialGradient(64,64,0,64,64,64);A.addColorStop(0,"rgba(255,238,205,0.85)"),A.addColorStop(.3,"rgba(255,214,150,0.55)"),A.addColorStop(.45,"rgba(255,190,120,0.22)"),A.addColorStop(.7,"rgba(250,170,95,0.07)"),A.addColorStop(1,"rgba(255,160,80,0)"),M.fillStyle=A,M.fillRect(0,0,128,128)}return new jn(x)}const Ko=`
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
}`,Jo=`
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
}`;function Zo(_){return Math.max(.12,.16+.11*Math.log2(_/2e3))}const Qo=`
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
}`,ea=`
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
}`,ta=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,na=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,Fn=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Vn=`
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
}`,oa=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,aa=`
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
}`,sa=`
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
}`,ra=`
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
}`,ia=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,la=`
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
}`,ca=`
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
}`,da=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function ya(_,x){const M=Yo(),A=M?96:128,H=new wo({antialias:!0,powerPreference:"default",alpha:!1});H.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),H.outputColorSpace=Ct,H.toneMapping=go,H.toneMappingExposure=1.1;const F=H.domElement;F.style.display="block",F.style.width="100%",F.style.height="100%",F.style.touchAction="none",_.appendChild(F);const v=document.createElement("div");v.className="space-labels",_.appendChild(v);const ie=[];let fe=0;function g(){const e=performance.now();if(e-fe<400)return;fe=e,ie.length=0;const t=_.getBoundingClientRect();for(const o of[".explore-top",".sheet",".sky-alert"]){const s=document.querySelector(o);if(!s)continue;const i=s.getBoundingClientRect();i.width<2||i.height<2||ie.push({x:i.left-t.left,y:i.top-t.top,w:i.width,h:i.height})}}function z(e,t,o,s=22){for(const i of ie)if(e<i.x+i.w&&e+o>i.x&&t<i.y+i.h&&t+s>i.y)return!0;return!1}const S=new yo;S.background=new ee("#05070d");const w=new xo(45,1,.01,2e3),D=[],a=e=>(D.push(e),e),I=new bo,q=new Mo,B=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),U=new Map,J=new Map,le=[],ne=new Set;let xe=!1,oe=0;const Te=(e,t)=>{const o=J.get(e);if(o){J.delete(e);for(const s of o)s(t)}},Z=(e,t=!0)=>{const o=U.get(e);if(o)return o;oe+=1;const s=I.load(_n+e,()=>{Te(e,s),oe-=1,oe===0&&x.onReady?.()},void 0,()=>{Te(e,s),oe-=1,oe===0&&x.onReady?.()});return s.colorSpace=t?Ct:Ao,s.anisotropy=M?4:8,U.set(e,s),a(s)},Be=e=>{U.has(e)||ne.has(e)||(ne.add(e),q.load(_n+e,t=>{ne.delete(e);const o=new Bo;o.image=t,o.colorSpace=Ct,o.anisotropy=M?4:8,o.needsUpdate=!0,a(o),U.set(e,o),Te(e,o)},void 0,()=>{ne.delete(e)}))},ft=()=>{if(!xe){xe=!0;for(const e of le)Be(e)}},Fe=(e,t)=>{if(B.has(e)){t(Z(e));return}const o=U.get(e);if(o){t(o);return}const s=J.get(e)??[];s.push(t),J.set(e,s),le.includes(e)||(le.push(e),xe&&Be(e))},Rt=new y(a(new T(900,48,24)),a(new P({map:Z("milkyway.webp"),side:Qe,depthWrite:!1})));Rt.rotation.set(63*re,0,0),S.add(Rt),S.add(new zo(16777215,.14));const Tt=new So(16777215,1.6,0,0);Tt.decay=0,S.add(Tt);const ce=new $;S.add(ce);const ve=new Map,he=new Map,At=new Map,vt=[],et=new Map;let Lt=null,ht=null;const Ve=new Map,tt=new Map,wt=new Map,be=new Map;let b=null,Dt=0,Ae=null;const gt=[],It=[],_t=[],Ut=[],Bt=[];let Me=Date.now(),je=!0,Ft=null;function nt(e,t,o,s){const i=Un[o]??[.7,.7,.7,.06],d=Bn[o],u=new ee(t),f=d?.relief??0,n=a(new pe({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new dt(d?.texel?.[0]??1/1024,d?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:f*.35},gain:{value:(d?.gain??1.9)*.6},base:{value:new p(u.r,u.g,u.b)},glow:{value:new p(i[0],i[1],i[2])},atmo:{value:Math.min(i[3]*2.2,.85)},ringShadow:{value:s?1:0},ringMap:{value:null},ringInner:{value:s?.inner??1},ringOuter:{value:s?.outer??2},ringCenter:{value:new p},ringNormal:{value:new p(0,1,0)}},vertexShader:Ko,fragmentShader:Jo}));return e&&Fe(e,r=>{n.uniforms.dayMap.value=r,n.uniforms.useMap.value=1,f>0&&(n.uniforms.bumpMap.value=r,n.uniforms.useBump.value=1)}),s&&Fe("saturn-ring.webp",r=>{n.uniforms.ringMap.value=r}),n}function $n(e,t,o){const s=Bn[o],i=s?.tint??Un[o]?.slice(0,3);if(!i||M)return;const d=Math.min(s?.inner??.12,.5)*.55,u=Math.min(s?.outer??.05,.2)*.9,f=new p(i[0],i[1],i[2]),n=Math.sqrt(1-1/(1.045*1.045)),r=(l,h,C,V)=>new y(a(new T(t*l,M?24:32,M?16:24)),a(new pe({uniforms:{tint:{value:f},power:{value:C},strength:{value:V},edge:{value:n}},vertexShader:Fn,fragmentShader:Vn,side:h,transparent:!0,blending:se,depthWrite:!1})));e.add(r(1.045,Qe,2.7,d),r(1.16,Tn,3.4,u))}function Xn(e,t){const o=a(new pe({uniforms:{poleN:{value:ut(80.7,-72.7,1).normalize()},poleS:{value:ut(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:oa,fragmentShader:aa,transparent:!0,blending:se,depthWrite:!1})),s=new y(a(new T(t*1.022,M?64:96,M?48:64)),o);s.renderOrder=1,e.add(s),Ut.push(o)}function Hn(e,t){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([s,i,d,u,f],n)=>{const r=ut(s,i,1).normalize(),l=new p(0,1,0).cross(r).normalize(),h=new p().crossVectors(r,l).normalize(),C=l.multiplyScalar(Math.cos(f)).addScaledVector(h,Math.sin(f)).normalize(),V=[];for(let O=0;O<=16;O+=1){const ye=O/16,te=(ye-.5)*d,Y=Math.sin(ye*Math.PI)*u;V.push(new p().copy(r).multiplyScalar(Math.cos(te)).addScaledVector(C,Math.sin(te)).normalize().multiplyScalar(t*(.985+Y)))}const j=a(new pe({uniforms:{uTime:{value:0},seed:{value:n*.37+.11}},vertexShader:sa,fragmentShader:ra,transparent:!0,blending:se,side:Pe,depthWrite:!1})),de=new y(a(new Lo(new Do(V),64,t*.022,8,!1)),j);de.raycast=()=>{},e.add(de),Bt.push(j)})}function Vt(e,t,o=""){const s=document.createElement("button");s.type="button",s.className="space-label"+o,s.textContent=t,s.addEventListener("click",()=>x.onPick?.(e)),v.appendChild(s),At.set(e,s)}const jt=a(new pe({uniforms:{map:{value:Z("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),Oe=new p,Yn=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],Ot=new Map;let ze=null;const qn={moon:"earth",...Object.fromEntries(Ln.map(e=>[e.id,e.parent]))};function Gt(e,t){const o=qn[e];if(ze===null||!o)return pt(e,t);const s=pt(o,t),i=pt(e,ze),d=pt(o,ze);return{x:s.x+i.x-d.x,y:s.y+i.y-d.y,z:s.z+i.z-d.z}}function Ge(e){for(const[t,o]of he){if(t==="sun")continue;const s=Gt(t,e);o.position.set(s.x*R,s.y*R,s.z*R)}for(const[t,o]of Ve){const s=Gt(t,e);o.position.set(s.x*R,s.y*R,s.z*R)}if(Ae){Oe.copy(Ae.holder.position);const t=Oe.length()||1;Ae.tail.visible=t/R<8,Oe.multiplyScalar(1/t),Ae.tail.quaternion.setFromUnitVectors(new p(0,1,0),Oe),Ae.tail.position.copy(Oe).multiplyScalar(.16*R)}}const Le=new p(1,0,0),Kn=a(new pe({uniforms:{dayMap:{value:Z("earth-day.webp")},nightMap:{value:Z("earth-night.webp")},normalMap:{value:Z("earth-normal.webp",!1)},specMap:{value:Z("earth-spec.webp",!1)},texel:{value:new dt(1/2048,1/1024)},sunDir:{value:Le}},vertexShader:Qo,fragmentShader:ea}));function Jn(e){const t=new $,o=new y(a(new T(e,M?96:128,64)),Kn);o.name="earth",t.add(o);const s=new y(a(new T(e*1.012,80,48)),a(new Io({map:Z("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));t.add(s),Lt=s;const i=new y(a(new T(e*1.06,64,48)),a(new pe({uniforms:{sunDir:{value:Le}},vertexShader:`
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
            }`,side:Qe,transparent:!0,blending:se,depthWrite:!1})));t.add(i);const d=new y(a(new T(e*1.15,M?24:32,M?16:24)),a(new pe({uniforms:{tint:{value:new p(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:Fn,fragmentShader:Vn,side:Tn,transparent:!0,blending:se,depthWrite:!1})));return t.add(d),ve.set("earth",o),t}function $t(e,t,o){for(const s of Je(e).sites??[]){const i=new y(a(new T(o*.018,12,8)),a(new P({color:"#3182f6"})));i.position.copy(ut(s.lat,s.lon,o*1.004)),t.add(i);const d=document.createElement("div");d.className="space-site",d.textContent=s.name,v.appendChild(d),vt.push({mesh:i,site:s,el:d,parent:e})}}let $e=null;for(const e of Fo){if(e.id==="moon")continue;const t=new $;if(he.set(e.id,t),ce.add(t),e.id==="sun"){const o=.26*R,s=new y(a(new T(o,M?96:128,M?64:80)),jt);s.name="sun",et.set("sun",o),t.add(s),Hn(s,o);for(const[d,u,f,n]of[[1.06,2,.95,"#ffbf78"]])t.add(new y(a(new T(o*d,M?32:48,M?24:32)),a(new pe({uniforms:{color:{value:new ee(n)},power:{value:u},strength:{value:f}},vertexShader:ta,fragmentShader:na,transparent:!0,blending:se,depthWrite:!1}))));ve.set("sun",s);const i=new On(a(new Gn({map:a(qo()),blending:se,transparent:!0,depthWrite:!1,depthTest:!0,color:new ee("#ffd9a0")})));i.scale.setScalar(o*3.6),t.add(i),ht=i}else{const o=Nt(e.id).radius*R;et.set(e.id,o);let s;if(e.id==="earth"){const f=Jn(o);f.rotation.z=-e.tilt*re,t.add(f),$e=f,s=f.children[0]}else{const f=e.id==="saturn"?{inner:o*1.18,outer:o*2.08}:void 0;s=new y(a(new T(o,M?96:128,64)),nt(e.texture,e.color,e.id,f)),s.name=e.id,s.rotation.z=-e.tilt*re,t.add(s),ve.set(e.id,s),$n(t,o,e.id),e.id==="jupiter"&&Xn(s,o)}if(e.axes){const[f,n,r]=e.axes;s.scale.set(1,r/f,n/f)}if(e.ring&&e.axes){const f=e.axes[0]/2,n=o*(e.ring.radius-e.ring.width/2)/f,r=o*(e.ring.radius+e.ring.width/2)/f,l=new y(a(new qe(n,Math.max(r,n*1.03),128,1)),a(new P({color:"#8b8580",side:Pe,transparent:!0,opacity:.75,depthWrite:!1})));l.rotation.x=Math.PI/2,t.add(l)}if(e.id==="saturn"){const f=o*1.18,n=o*2.08,r=new qe(f,n,160,1),l=a(new pe({uniforms:{ringMap:{value:null},innerRatio:{value:f/n},planetRadius:{value:o},planetCenter:{value:new p}},vertexShader:ia,fragmentShader:la,side:Pe,transparent:!0,depthWrite:!1}));Fe("saturn-ring.webp",C=>{l.uniforms.ringMap.value=C});const h=new y(a(r),l);h.rotation.x=Math.PI/2,s.add(h),It.push({mesh:h,parent:e.id}),_t.push({mesh:s,material:s.material})}e.sites&&$t(e.id,s,o);const i=Dn(e.id,.022),d=a(new Re);d.setAttribute("position",new Pt(i.positions,3)),d.setIndex(i.index),d.scale(R,R,R);const u=new y(d,a(new P({color:Nt(e.id).ribbon,transparent:!0,opacity:.5,side:Pe,depthWrite:!1})));gt.push(u),ce.add(u)}Vt(e.id,e.name,e.id==="sun"?"":" is-planet")}const Xt=[];function Ht(e,t,o){let s=e==="main"?1234:98765;const i=()=>(s=s*16807%2147483647,(s-1)/2147483646),d=a(new _o(1,0)),u=new Float32Array(t*4),f=new Float32Array(t*4);for(let l=0;l<t;l+=1){let h;if(e==="main")do h=2.1+i()*1.2;while((Math.abs(h-2.5)<.03||Math.abs(h-2.82)<.03||Math.abs(h-2.95)<.02)&&i()<.85);else h=i()<.18?39.2+(i()-.5)*1.2:42+(i()-.5)*6.5;u[l*4]=h,u[l*4+1]=i()*Math.PI*2,u[l*4+2]=i()*(e==="main"?.18:.12),u[l*4+3]=i()*Math.PI*2,f[l*4]=(i()-.5)*(e==="main"?.32:.5),f[l*4+1]=i()*Math.PI*2;const C=i()**3;f[l*4+2]=(e==="main"?.0035:.009)*(.7+C*2.4),f[l*4+3]=i()}d.setAttribute("orbit",new An(u,4)),d.setAttribute("shape",new An(f,4));const n=a(new pe({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new ee(o)},uScale:{value:R}},vertexShader:ca,fragmentShader:da})),r=new Uo(d,n,t);r.frustumCulled=!1,r.raycast=()=>{},ce.add(r),Xt.push({mesh:r,material:n})}Ht("main",M?1800:4200,"#9c9184"),Ht("kuiper",M?1500:3600,"#7f8b9c");for(const e of Ln){const t=new $,o=new y(a(new T(e.radius*R,32,24)),nt(`${e.id}.webp`,e.color,e.id));o.name=e.id,t.add(o),ce.add(t),Ve.set(e.id,t),tt.set(e.id,o);const s=document.createElement("button");s.type="button",s.className="space-label is-small",s.textContent=e.name,s.addEventListener("click",()=>x.onExtra?.(e.id)),v.appendChild(s),wt.set(e.id,{el:s,parent:e.parent})}{const e=new $,t=new y(a(new T(.045*R,20,16)),a(new P({color:"#f7fbff"})));t.name="halley",e.add(t);const o=new y(a(new Eo(.04*R,.32*R,12)),a(new P({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(o),Ae={holder:e,tail:o},ce.add(e),Ve.set("halley",e),tt.set("halley",t);const s=Dn("halley",.022),i=a(new Re);i.setAttribute("position",new Pt(s.positions,3)),i.setIndex(s.index),i.scale(R,R,R);const d=new y(i,a(new P({color:Nt("halley").ribbon,transparent:!0,opacity:.35,side:Pe,depthWrite:!1})));gt.push(d),ce.add(d);const u=document.createElement("button");u.type="button",u.className="space-label is-small",u.textContent=c("핼리 혜성"),u.addEventListener("click",()=>x.onExtra?.("halley")),v.appendChild(u),wt.set("halley",{el:u,parent:null})}for(const e of Vo){const t=jo(e),o=t.points.map(C=>new p(C.x*R,C.y*R,C.z*R)),s=a(new Re().setFromPoints(o)),i=new ko(s,a(new mt({color:e.color,transparent:!0,opacity:.95})));i.visible=!1;const d=new $,u=new y(a(new Wt(.03,.01,.01,20)),a(new P({color:"#d8dde4"})));u.rotation.x=Math.PI/2;const f=new y(a(new T(.014,12,8)),a(new P({color:"#c9ced6"})));f.position.z=-.02;const n=new y(a(new Wt(.002,.002,.09,6)),a(new P({color:"#aab3c0"})));n.rotation.z=Math.PI/2,n.position.z=-.02;const r=new y(a(new T(.035,16,12)),a(new P({color:e.color,transparent:!0,opacity:.18,blending:se,depthWrite:!1})));d.add(u,f,n,r),d.scale.setScalar(e.frame==="earth"?.8:1.3),d.position.copy(o[o.length-1]),i.add(d),(e.frame==="earth"?he.get("earth")??ce:ce).add(i);const h=document.createElement("div");h.className="space-site is-probe",h.textContent=e.name,v.appendChild(h),be.set(e.id,{line:i,probe:d,el:h,points:o,times:t.points.map(C=>C.t),marks:t.marks,frame:e.frame})}if(Ge(Me),$e){const e=.055*R;et.set("moon",e);const t=new y(a(new T(e,A,48)),nt("moon.webp","#b8b8b8","moon"));t.name="moon";const o=new $;o.add(t),ce.add(o),ve.set("moon",t),he.set("moon",o),$t("moon",t,e),Vt("moon",c("달")," is-small"),Ge(Me)}const Xe=new $,De=new $,ot=new $;Xe.add(De,ot),Xe.visible=!1;let Yt="solar",ke=!1,yt=0;const k={moon:new y,moonMat:a(new P({color:"#ffffff"})),shadow:a(new P({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new y,umbra:new y,skyCover:new y,skySun:new $,skyMoon:new $,skyMoonMat:a(new P({color:"#ffffff"}))},qt=[],Kt=Z("sun.webp"),Jt=Z("moon.webp"),Zt=new y(a(new T(.62,32,24)),a(new P({map:Kt})));Zt.position.set(-3.3,0,0);const Qt=new y(a(new T(.4,32,24)),a(new P({map:Z("earth-day.webp")})));Qt.position.set(1.85,0,0),k.moonMat.map=Jt,k.moon=new y(a(new T(.14,24,18)),k.moonMat),k.cone=new y(a(new Wt(.04,.16,.78,18)),k.shadow),k.cone.position.set(1.42,0,0),k.cone.rotation.z=Math.PI/2,k.umbra=new y(a(new Ke(.3,28)),a(new P({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),k.umbra.position.set(2.75,0,.02),De.add(Zt,Qt,k.moon,k.cone,k.umbra);for(const[e,t]of[[c("태양"),new p(-3.3,.85,0)],[c("지구"),new p(1.85,.68,0)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,v.appendChild(o),qt.push({el:o,at:t,group:De})}const Zn=new y(a(new Ke(1.35,48)),a(new P({map:Kt}))),Qn=new y(a(new qe(1.4,1.7,48)),a(new P({color:"#f0c36a",transparent:!0,opacity:.45,side:Pe,depthWrite:!1})));k.skyCover=new y(a(new Ke(1.22,48)),a(new P({color:"#141820"}))),k.skySun.add(Zn,Qn,k.skyCover),k.skyMoonMat.map=Jt;const eo=new y(a(new Ke(.92,48)),k.skyMoonMat),en=new y(a(new Ke(1.08,48)),a(new P({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));en.position.z=.16,k.skyMoon.add(eo,en),ot.add(k.skySun,k.skyMoon),ot.visible=!1,S.add(Xe);const Ce=new $;Ce.visible=!1,Ce.rotation.z=-Math.PI/2;const tn=[],nn=4.6,to=e=>nn*e/696e3,on=new y(a(new T(nn,64,40)),a(new P({map:Z("sun.webp")})));on.position.set(-3.2,0,0),Ce.add(on);const no=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let an=2.4;const sn=(e,t)=>{const o=document.createElement("div");o.className="space-site",o.textContent=e,v.appendChild(o),tn.push({el:o,at:t,group:Ce})};sn(c("태양"),new p(-3.2,4.9,0));for(const[e,t]of no){const o=to(t),s=an+o;an=s+o+.72;const i=Je(e),d=e==="earth"?"earth-day.webp":i.texture,u=a(new P({color:i.color}));d&&Fe(d,n=>{u.map=n,u.color.set("#ffffff"),u.needsUpdate=!0});const f=new y(a(new T(o,32,24)),u);if(f.position.set(s,0,0),i.axes&&f.scale.set(1,i.axes[2]/i.axes[0],i.axes[1]/i.axes[0]),Ce.add(f),e==="saturn"){const n=o*1.18,r=o*2.08,l=a(new qe(n,r,96,1)),h=l.attributes.position,C=l.attributes.uv,V=new p;for(let O=0;O<h.count;O+=1)V.fromBufferAttribute(h,O),C.setXY(O,(V.length()-n)/(r-n),.5);const j=a(new P({color:"#b9b3ab",transparent:!0,opacity:.9,side:Pe,depthWrite:!1}));Fe("saturn-ring.webp",O=>{j.map=O,j.color.set("#ffffff"),j.needsUpdate=!0});const de=new y(l,j);de.rotation.y=Math.PI/2-.36,f.add(de)}sn(i.name,new p(s,(e==="saturn"?o*2.08:o)+.12,0))}S.add(Ce);const we=new $;we.visible=!1;const xt=[],rn=[],oo=new y(a(new T(.55,48,32)),a(new P({color:"#e0703a"})));we.add(oo);for(const[e,t]of[[1.35,.16],[2.1,.05]])we.add(new y(a(new T(.55*e,32,24)),a(new P({color:"#ff6a30",transparent:!0,opacity:t,side:Qe,blending:se,depthWrite:!1}))));const ln=new y(a(new qe(2.6,5.1,96,1)),a(new P({color:"#3fbf7f",transparent:!0,opacity:.12,side:Pe,depthWrite:!1})));ln.rotation.x=Math.PI/2,we.add(ln),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,t,o,s,i],d)=>{const u=new Rn(a(new Re().setFromPoints(Array.from({length:128},(r,l)=>new p(Math.cos(l/128*Math.PI*2)*o*100,0,Math.sin(l/128*Math.PI*2)*o*100)))),a(new mt({color:"#8b95a1",transparent:!0,opacity:.35})));we.add(u);const f=new y(a(new T(.16*s,24,16)),nt(void 0,i,"earth"));we.add(f);const n=document.createElement("button");n.type="button",n.className="space-label is-small",n.textContent=e,n.addEventListener("click",()=>x.onExtra?.(`trappist-${e}`)),v.appendChild(n),xt.push({mesh:f,a:o*100,period:t,phase0:d*1.7,el:n})});const ao=new Rn(a(new Re().setFromPoints(Array.from({length:256},(e,t)=>new p(Math.cos(t/256*Math.PI*2)*38.7,0,Math.sin(t/256*Math.PI*2)*38.7)))),a(new mt({color:"#c5b8a2",transparent:!0,opacity:.5})));we.add(ao);for(const[e,t]of[["TRAPPIST-1",new p(0,1.1,0)],[c("생명가능지대(대략)"),new p(3.9,0,0)],[c("비교: 우리 수성의 궤도"),new p(0,0,38.7)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,v.appendChild(o),rn.push({el:o,at:t})}S.add(we);const ge=Xo(),bt=[];if(ge)for(const[e,t]of Object.entries(ge.groups)){S.add(t);for(const o of ge.markers[e]){const s=document.createElement("button");s.type="button",s.className="space-label",s.textContent=o.name,s.addEventListener("click",()=>{x.onMarker?.(o),N.target.copy(o.position),N.radius=_e[e]*(o.id==="cmb"?1.4:e==="group"?.6:.42)}),v.appendChild(s),bt.push({level:e,marker:o,el:s})}}const cn=[];if(ge){const t=(d,u)=>new p(Math.cos(u*re)*Math.cos(d*re),Math.sin(u*re),-Math.cos(u*re)*Math.sin(d*re)).multiplyScalar(140),o=[];for(const d of Object.values(In))for(const u of d)for(let f=0;f<u.length-1;f+=1){const n=t(u[f][0],u[f][1]),r=t(u[f+1][0],u[f+1][1]);o.push(n.x,n.y,n.z,r.x,r.y,r.z)}const s=a(new Re);s.setAttribute("position",new Pt(o,3));const i=new Co(s,a(new mt({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));ge.groups.stars.add(i);for(const d of Oo){if(!In[d.id])continue;const u=document.createElement("button");u.type="button",u.className="space-label is-const",u.textContent=d.name.replace(/\(.*\)/,"").split(" · ")[0],u.addEventListener("click",()=>x.onConstellation?.(d.id)),v.appendChild(u),cn.push({el:u,at:t(d.center[0],d.center[1])})}}const at=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let L="system",Ie=!1,dn=!1;const _e={system:40,super:40,eclipse:7.5,sizes:15,exo:16,stars:46,orion:48,galaxy:44,group:40,cosmos:70},He=new p,W={theta:.6,phi:.95,radius:34},N={target:new p,radius:W.radius};let G="system",K=null,ae=null,me=null;function st(e){if((e==="system"||e==="sizes")&&ft(),L=e,Ie=!1,ce.visible=e==="system",Xe.visible=e==="eclipse",Ce.visible=e==="sizes",we.visible=e==="exo",ge)for(const[t,o]of Object.entries(ge.groups))o.visible=t===e;G="system",K=null,ae=null,me=null,N.target.set(0,0,0),N.radius=_e[e],e!=="system"&&(W.phi=1.1),e==="eclipse"&&(De.rotation.z=w.aspect<1?-Math.PI/2:0,W.theta=0,W.phi=ke?Math.PI/2:1.25,N.target.set(0,0,0),ke||N.target.set(-.7,0,0).applyEuler(De.rotation),N.radius=ke?6:w.aspect<1?10:7.5),e==="exo"&&(W.phi=.75),e==="sizes"&&(W.theta=0,W.phi=Math.PI/2,N.target.set(.6,-6.8,0),N.radius=19)}function mn(e){if(e!=="earth"&&ft(),Ie=!1,L!=="system"&&(L="system",ce.visible=!0,Xe.visible=!1,Ce.visible=!1,we.visible=!1,ge))for(const o of Object.values(ge.groups))o.visible=!1;if(G=e,ae=null,me=null,e==="system"){K=null,N.target.set(0,0,0),N.radius=_e.system;return}K=he.get(e)??null;const t=et.get(e)??Zo(Je(e).km);N.radius=e==="sun"?3.2:e==="jupiter"?3.4*R:e==="saturn"?2.6*R:Math.max(t*(Je(e).ring?6:4.2),.25)}function so(e){const t=Ve.get(e);t&&(L!=="system"&&st("system"),G="system",K=t,ae=null,me=null,N.radius=e==="halley"?1.6:.6,We=performance.now())}function ro(e){me=(e?vt.find(o=>o.parent===G&&o.site.name===e.name):void 0)?.mesh??null,ae=me?new p:null,We=performance.now()}const Se=new Map;let Ye=0,rt=0,We=0;const pn=new Po,un=new dt,fn=e=>{if(ft(),F.setPointerCapture(e.pointerId),Ie=!1,Se.set(e.pointerId,{x:e.clientX,y:e.clientY}),rt=0,We=performance.now(),Se.size===2){const[t,o]=[...Se.values()];Ye=Math.hypot(t.x-o.x,t.y-o.y)}},vn=e=>{const t=Se.get(e.pointerId);if(!t)return;const o=e.clientX-t.x,s=e.clientY-t.y;if(Se.set(e.pointerId,{x:e.clientX,y:e.clientY}),We=performance.now(),Se.size===1)rt+=Math.abs(o)+Math.abs(s),W.theta-=o*.006,W.phi=Math.min(2.9,Math.max(.2,W.phi-s*.006)),ae=null,me=null;else if(Se.size===2){const[i,d]=[...Se.values()],u=Math.hypot(i.x-d.x,i.y-d.y);Ye>0&&(N.radius=wn(N.radius*(Ye/u))),Ye=u,rt+=10}},it=e=>{if(Se.delete(e.pointerId),Ye=0,rt<6&&x.onPick){const t=F.getBoundingClientRect();un.set((e.clientX-t.left)/t.width*2-1,-((e.clientY-t.top)/t.height)*2+1),pn.setFromCamera(un,w);const s=pn.intersectObjects([...ve.values(),...tt.values()],!1)[0]?.object.name;s&&ve.has(s)?x.onPick(s):s&&tt.has(s)&&x.onExtra?.(s)}},hn=e=>{e.preventDefault(),N.radius=wn(N.radius*(e.deltaY>0?1.12:.89))};function wn(e){return L!=="system"?Math.min(_e[L]*2.2,Math.max(_e[L]*.15,e)):Math.min(90,Math.max(G==="system"&&!K?4:.15,e))}F.addEventListener("pointerdown",fn),F.addEventListener("pointermove",vn),F.addEventListener("pointerup",it),F.addEventListener("pointercancel",it),F.addEventListener("wheel",hn,{passive:!1});let Ee=null,lt=null,Mt=!matchMedia("(prefers-reduced-motion: reduce)").matches,gn=0,yn=0;Mt&&(Ee=new Wo(H),Ee.addPass(new No(S,w)),lt=new Ro(new dt(256,256),.75,.78,.92),Ee.addPass(lt),Ee.addPass(new To));const E={w:1,h:1},xn=()=>{E.w=_.clientWidth||1,E.h=_.clientHeight||1,H.setSize(E.w,E.h,!1),Ee?.setSize(E.w,E.h),lt?.resolution.set(E.w/2,E.h/2),w.aspect=E.w/E.h,w.updateProjectionMatrix()};xn();const bn=new ResizeObserver(xn);bn.observe(_);let Mn=!0;const zn=new IntersectionObserver(e=>{Mn=e.some(t=>t.isIntersecting)});zn.observe(_);const m=new p,Ne=new p,Ue=new p,zt=new p,io=new p,lo=new p,co=new p,mo=new p,Sn=new p,po=new p;let St=0,En=performance.now(),Et=-1e9,kn=0;const Cn=e=>{St=requestAnimationFrame(Cn);const t=Math.min(.1,(e-En)/1e3);if(En=e,document.hidden||!Mn)return;if(at||(jt.uniforms.time.value=e/1e3),!at){for(const n of Ut)n.uniforms.time.value=e/1e3;for(const n of Bt)n.uniforms.uTime.value=e/1e3}e-We>3e3&&!at&&!ae&&!dn&&!Ie&&L!=="eclipse"&&L!=="sizes"&&(W.theta+=t*(G==="system"?.03:.08)),Lt?.rotateY(t*.01);for(const[n,r]of ve){if(n==="earth"||n==="moon"||me&&n===G)continue;const l=Je(n).spinHours;at||r.rotateY(t*(n==="sun"?.02:l?.12*(24/l)*.25:.12))}ht&&(ht.visible=w.position.length()>4);for(const n of Xt)n.material.uniforms.uDays.value=(Me-Ho)/864e5,n.material.uniforms.uTime.value=e/1e3;for(const n of It){const r=ve.get(n.parent);r&&n.mesh.material.uniforms.planetCenter.value.copy(r.getWorldPosition(m))}for(const n of _t)n.mesh.getWorldPosition(m),n.material.uniforms.ringCenter.value.copy(m),n.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(n.mesh.matrixWorld).normalize();if(je&&e-kn>1e3&&(kn=e,Me=Date.now(),Ge(Me)),b){const n=be.get(b.id),r=n.points.length,l=n.times[r-1],h=(n.frame==="earth"?6:25)*864e5,V=n.marks.some(X=>X.at!==void 0&&X.body&&X.body!=="earth"&&Math.abs(b.sim-X.at)<h)?"slow":b.sim>=b.fastFrom?"fast":"normal",j=V==="slow"?Math.min(b.base,2*h/3):b.base*(V==="fast"?b.fast:1);b.sim=Math.min(l,b.sim+j*Math.min(t,.1)),n.frame==="sun"?ze=(ze??b.sim)+Math.min(t,.1)*.15*864e5:ze=null,b.pace=V;const de=(b.sim-n.times[0])/(l-n.times[0]||1);let O=0,ye=r-1;for(;ye-O>1;){const X=O+ye>>1;n.times[X]<=b.sim?O=X:ye=X}const te=n.times[ye]-n.times[O],Y=O+(te>0?(b.sim-n.times[O])/te:0),Q=Math.max(0,Math.min(r-2,Math.floor(Y))),Pn=Y-Q;n.probe.position.lerpVectors(n.points[Q],n.points[Q+1],Pn),Dt=Y,n.probe.lookAt(n.line.localToWorld(n.points[Math.min(r-1,Q+2)].clone())),n.line.geometry.setDrawRange(0,Q+2);const kt=n.times[Q]+(n.times[Q+1]-n.times[Q])*Pn;je=!1,Me=kt,Ge(kt);let ct=0;for(let X=0;X<n.marks.length;X+=1){const Wn=n.marks[X],uo=Wn.at??n.times[Math.min(r-1,Wn.index)];b.sim>=uo-h&&(ct=X)}if((ct!==b.mark||e-b.lastPing>250||b.sim>=l&&!b.done)&&(b.mark=ct,b.lastPing=e,b.sim>=l&&(b.done=!0),x.onFlight?.({id:b.id,mark:n.marks[ct],progress:de,time:kt,done:b.done,pace:b.pace})),b.done){const X=n.frame==="earth";b=null,ze=null,je=!0,K=X?he.get("earth")??null:null,X||N.target.set(0,0,0),N.radius=X?4.2:72,W.phi=X?.7:.45}}if(K&&N.target.copy(K.getWorldPosition(m)),b){const n=be.get(b.id);let r=null,l=1/0;for(const C of n.marks){if(!C.body||C.body==="earth"||C.body==="far")continue;const V=Math.abs(C.index-Dt);V<14&&V<l&&(r=C,l=V)}const h=r?he.get(r.body):void 0;if(h){const C=h.getWorldPosition(co).add(n.probe.getWorldPosition(mo)).multiplyScalar(.5);N.target.copy(C),N.radius=n.frame==="earth"?1.6:4.2}else N.radius=n.frame==="earth"?1.5:2.8}if(He.lerp(N.target,1-Math.pow(.002,t)),W.radius+=(N.radius-W.radius)*(1-Math.pow(.004,t)),ae&&me){const n=ve.get(G)?.getWorldPosition(Sn)??Sn.set(0,0,0);ae.copy(me.getWorldPosition(po).sub(n).normalize());const r=Math.atan2(ae.x,ae.z),l=Math.acos(Math.max(-1,Math.min(1,ae.y)));let h=r-W.theta;h=Math.atan2(Math.sin(h),Math.cos(h)),W.theta+=h*(1-Math.pow(.01,t)),W.phi+=(l-W.phi)*(1-Math.pow(.01,t))}if(L==="exo"){const n=e/1e3;for(const r of xt){const l=r.phase0+n/r.period*Math.PI*2;r.mesh.position.set(Math.cos(l)*r.a,0,Math.sin(l)*r.a)}}if(L==="eclipse"){yt=(yt+t*.18)%1;const n=Math.sin(yt*Math.PI*2),r=Math.abs(n)<.22,l=Yt==="lunar";De.visible=!ke,ot.visible=ke,k.skySun.visible=!l,k.skyMoon.visible=l,ke?l?(k.skyMoon.position.set(n*1.7,0,.08),k.skyMoonMat.color.set(r?"#c47462":"#f2f2f2")):k.skyCover.position.set(n*1.7,0,.08):(k.moon.position.set(l?2.75:1.05,n*.55,0),k.cone.visible=!l,k.umbra.visible=l,k.shadow.opacity=r?.42:.08,k.umbra.material.opacity=r?.42:.08,k.moonMat.color.set(l&&r?"#c47462":"#ffffff"))}if(w.position.set(He.x+W.radius*Math.sin(W.phi)*Math.sin(W.theta),He.y+W.radius*Math.cos(W.phi),He.z+W.radius*Math.sin(W.phi)*Math.cos(W.theta)),w.lookAt(He),$e&&($e.getWorldPosition(m),Le.copy(m).multiplyScalar(-1).normalize(),e-Et>500&&!(b&&be.get(b.id)?.frame==="sun"))){Et=e;const n=Go(new Date(Me)),r=Math.atan2(n.y,n.x),l=Math.atan2(-Le.z,Le.x),h=$e.children[0];h.rotation.y=l-r}Ee&&Mt&&(L!=="system"||G==="system"||G==="sun")&&Ee?(Ee.render(t),gn+=1,yn+=t,gn===90&&yn/90>.034&&(Mt=!1)):H.render(S,w),w.getWorldDirection(Ne),g();const i=[];for(const n of Yn){const r=At.get(n),l=he.get(n);if(!r||!l)continue;l.getWorldPosition(m);const h=Ue.copy(m).sub(w.position).dot(Ne)>0,C=G==="system"&&L==="system"&&(!K||b!==null),V=G==="earth"||G==="moon"||b!==null&&be.get(b.id)?.frame==="earth";let j=h&&(n==="moon"?L==="system"&&V:C||V&&n==="earth"&&b!==null);m.project(w);const de=(m.x+1)/2*E.w;let O=de;const ye=(1-m.y)/2*E.h+10;if(j){let te=Ot.get(n)??0;te||(r.style.display="block",te=r.offsetWidth||40,Ot.set(n,te)),O=Math.min(Math.max(de,te/2+4),Math.max(te/2+4,E.w-te/2-4));const Y={x:O-te/2,y:ye,w:te,h:22};z(Y.x,Y.y,Y.w,Y.h)||i.some(Q=>Y.x<Q.x+Q.w+4&&Y.x+Y.w+4>Q.x&&Y.y<Q.y+Q.h&&Y.y+Y.h>Q.y)?j=!1:i.push(Y)}r.style.display=j?"block":"none",j&&(r.style.transform=`translate(${O}px, ${ye}px) translate(-50%, 0)`)}const d=L==="system",u=G!=="system"&&G!=="jupiter"&&G!=="saturn",f=K!==null&&(b===null?K===he.get("earth"):be.get(b.id)?.frame==="earth");for(const n of gt)n.visible=!u&&!f;for(const[n,r]of wt){const l=Ve.get(n),h=r.parent?he.get(r.parent)===K:G==="system"&&(!K||K===l),C=K===l||h;l.getWorldPosition(m);const V=Ue.copy(m).sub(w.position).dot(Ne)>0,j=d&&V&&C;m.project(w),r.el.style.display=j?"block":"none",j&&(r.el.style.transform=`translate(${(m.x+1)/2*E.w}px, ${(1-m.y)/2*E.h+8}px) translate(-50%, 0)`)}for(const[n,r]of be){const l=d&&Ft===n;if(r.line.visible=l,!l){r.el.style.display="none";continue}r.probe.getWorldPosition(m);const h=Ue.copy(m).sub(w.position).dot(Ne)>0;m.y+=0,m.project(w),r.el.style.display=h?"block":"none",h&&(r.el.style.transform=`translate(${(m.x+1)/2*E.w}px, ${(1-m.y)/2*E.h}px) translate(10px, -50%)`)}for(const n of cn){if(L!=="stars"){n.el.style.display="none";continue}m.copy(n.at);const r=Ue.copy(m).sub(w.position).dot(Ne)>0;m.project(w);const l=r&&Math.abs(m.x)<1&&Math.abs(m.y)<1;n.el.style.display=l?"block":"none",l&&(n.el.style.transform=`translate(${(m.x+1)/2*E.w}px, ${(1-m.y)/2*E.h}px) translate(-50%, -50%)`)}for(const n of bt){if(!(n.level===L)){n.el.style.display="none";continue}m.copy(n.marker.position);const l=Ue.copy(m).sub(w.position).dot(Ne)>0;m.project(w),n.el.style.display=l?"block":"none",l&&(n.el.style.transform=`translate(${(m.x+1)/2*E.w}px, ${(1-m.y)/2*E.h+8}px) translate(-50%, 0)`)}for(const n of xt){if(L!=="exo"){n.el.style.display="none";continue}n.mesh.getWorldPosition(m);const r=Ue.copy(m).sub(w.position).dot(Ne)>0;m.project(w),n.el.style.display=r?"block":"none",r&&(n.el.style.transform=`translate(${(m.x+1)/2*E.w}px, ${(1-m.y)/2*E.h+8}px) translate(-50%, 0)`)}for(const n of rn){if(L!=="exo"){n.el.style.display="none";continue}m.copy(n.at).project(w);const r=m.z<1&&Math.abs(m.x)<1.05&&Math.abs(m.y)<1.05;n.el.style.display=r?"block":"none",r&&(n.el.style.transform=`translate(${(m.x+1)/2*E.w}px, ${(1-m.y)/2*E.h}px) translate(-50%, -100%)`)}for(const[n,r]of[[qt,L==="eclipse"&&!ke],[tn,L==="sizes"]])for(const l of n){if(!r){l.el.style.display="none";continue}m.copy(l.at).applyMatrix4(l.group.matrixWorld).project(w);let h=m.z<1&&Math.abs(m.x)<1.1&&Math.abs(m.y)<1.1;const C=(m.x+1)/2*E.w,V=(1-m.y)/2*E.h,j=l.el.offsetWidth||44;h&&z(C-j/2,V-11,j,22)&&(h=!1),l.el.style.display=h?"block":"none";const de=l.group.rotation.z!==0;h&&(l.el.style.transform=`translate(${(m.x+1)/2*E.w}px, ${(1-m.y)/2*E.h}px) ${de?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const n of vt){n.mesh.getWorldPosition(m);const r=ve.get(n.parent);r?r.getWorldPosition(zt):zt.set(0,0,0);let h=io.copy(m).sub(zt).normalize().dot(lo.copy(w.position).sub(m).normalize())>.15&&L==="system"&&G===n.parent;m.project(w),h&&z((m.x+1)/2*E.w+8,(1-m.y)/2*E.h-11,90)&&(h=!1),n.el.style.display=h?"block":"none",h&&(n.el.style.transform=`translate(${(m.x+1)/2*E.w}px, ${(1-m.y)/2*E.h}px) translate(8px, -50%)`)}};return St=requestAnimationFrame(Cn),oe===0&&x.onReady?.(),{focus:mn,setLevel:st,setPaused:e=>{dn=e},focusMarker:e=>{const t=bt.find(o=>o.level===L&&o.marker.id===e);t&&(N.target.copy(t.marker.position),N.radius=_e[L]*(e==="cmb"?1.4:L==="group"?.6:.42),We=performance.now())},showSite:ro,focusExtra:so,setEclipse:(e,t)=>{Yt=e,ke=t,st("eclipse")},setHemisphere:e=>{G!=="earth"&&mn("earth");const t=Le.clone().multiplyScalar(e==="day"?1:-1);W.theta=Math.atan2(t.x,t.z),W.phi=Math.min(2.6,Math.max(.5,Math.acos(t.y))),ae=null,me=null,Ie=!0},setTime:e=>{je=e===null,Me=e??Date.now(),Ge(Me),Et=-1e9},setVoyage:e=>{if(Ft=e,!e){b&&(b=null,je=!0),ze=null;for(const r of be.values())r.line.geometry.setDrawRange(0,1/0);return}L!=="system"&&st("system"),ze=null;const t=be.get(e);t.line.geometry.setDrawRange(0,2),G="system",ae=null,me=null,Ie=!1,K=t.probe;const o=t.frame==="earth";N.radius=o?1.3:2.8,W.phi=o?.75:1;const s=Math.max(...t.marks.filter(r=>r.at!==void 0&&r.body!=="earth").map(r=>r.at),t.times[0]+864e5),i=t.times[0],d=t.times[t.times.length-1],u=(s-i)/(o?20:24),f=t.frame==="earth"?d:s+60*864e5,n=d>f?(d-f)/4/u:1;b={id:e,sim:i,base:u,fastFrom:f,fast:n,mark:-1,done:!1,lastPing:0,pace:"normal"},We=performance.now()},dispose:()=>{ge?.dispose(),Ee?.dispose(),lt?.dispose(),cancelAnimationFrame(St),bn.disconnect(),zn.disconnect(),F.removeEventListener("pointerdown",fn),F.removeEventListener("pointermove",vn),F.removeEventListener("pointerup",it),F.removeEventListener("pointercancel",it),F.removeEventListener("wheel",hn),S.traverse(e=>{const t=e.material;Array.isArray(t)&&t.forEach(o=>o.dispose())}),D.forEach(e=>e.dispose()),H.dispose(),F.remove(),v.remove()}}}export{ya as createSpace};
