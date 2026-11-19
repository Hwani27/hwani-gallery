import{G as O,V as p,M as h,S as U,a as C,A as ae,B as $e,C as gn,b as yn,c as bn,d as q,e as Ee,f as sn,P as In,g as _n,W as Un,h as rn,i as Fn,j as Bn,k as jn,T as Vn,l as Gn,m as On,n as we,o as et,R as je,D as Pe,F as pt,p as $n,L as Hn,q as tt,r as ut,s as Ve,t as ln,u as Xn,v as Yn,E as qn,w as Kn,U as Zn,O as Jn,N as Qn,x as eo,y as cn,I as to,z as dn,H as no}from"./three-C248K78x.js";import{aL as mn,aM as oo,aN as ft,aO as pn,aP as ao,aQ as so,aR as Ge,F as ro,aS as io,aT as nt}from"./index-XWD7bcdE.js";import{C as un}from"./sky-qQD64V3e.js";const Oe=Math.PI/180;function oe(B,w,M){return new p(Math.cos(w*Oe)*Math.cos(B*Oe),Math.sin(w*Oe),-Math.cos(w*Oe)*Math.sin(B*Oe)).multiplyScalar(M)}function lo(){const w=document.createElement("canvas");w.width=64,w.height=64;const M=w.getContext("2d");if(M){const D=M.createRadialGradient(32,32,0,32,32,32);D.addColorStop(0,"rgba(255,255,255,1)"),D.addColorStop(.25,"rgba(255,255,255,0.75)"),D.addColorStop(1,"rgba(255,255,255,0)"),M.fillStyle=D,M.fillRect(0,0,64,64)}return new gn(w)}function co(){const B=[],w=v=>(B.push(v),v),M=w(lo());function D(v,o,F){const S=new yn(w(new bn({map:M,color:new q(v),transparent:!0,depthWrite:!1,blending:ae})));return S.scale.setScalar(o),S.position.copy(F),S}function H(v,o,F){const S=new Float32Array(v*3),b=new Float32Array(v*3);for(let I=0;I<v;I+=1){const[A,z]=o(I);S.set([A.x,A.y,A.z],I*3),b.set([z.r,z.g,z.b],I*3)}const k=w(new Ee);return k.setAttribute("position",new sn(S,3)),k.setAttribute("color",new sn(b,3)),new In(k,w(new _n({size:F,map:M,vertexColors:!0,transparent:!0,depthWrite:!1,blending:ae,sizeAttenuation:!0})))}let j=7;const u=()=>(j=j*16807%2147483647,(j-1)/2147483646),V={},x={};{const v=new O,o=2.6,F=[["alphacen","센타우루스자리 알파",219.9,-60.83,4.37,"#fff4e0","태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요."],["barnard","바너드별",269.45,4.69,5.96,"#ffb27a","작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요."],["wolf359","울프 359",164.12,7.01,7.86,"#ff9a6a","아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요."],["sirius","시리우스",101.29,-16.72,8.6,"#cfe0ff","밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요."],["ross154","로스 154",282.46,-23.84,9.69,"#ffa070","궁수자리 쪽의 작은 붉은 별이에요."],["epseri","에리다누스자리 엡실론",53.23,-9.46,10.5,"#ffd9a8","행성을 거느린 것으로 여겨지는 가까운 별이에요."],["61cyg","백조자리 61",316.7,38.75,11.4,"#ffc58a","처음으로 거리가 재어진 별이에요(1838년)."],["procyon","프로키온",114.83,5.22,11.46,"#fff3d6","작은개자리의 밝은 별이에요."],["epsind","인디언자리 엡실론",330.84,-56.79,11.87,"#ffcf9a","남쪽 하늘의 가까운 별이에요."],["taucet","고래자리 타우",26.02,-15.94,11.9,"#fff0d0","태양과 닮은 별이라 오래전부터 관심을 받았어요."]];v.add(D("#ffe39a",3.2,new p));const S=[{id:"sun-star",name:"태양",line:"우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요.",position:new p}];for(const[b,k,I,A,z,W,Z]of F){const te=oe(I,A,z*o);v.add(D(W,2.4,te)),S.push({id:b,name:k,line:`${Z} 거리 약 ${z}광년.`,position:te})}v.add(H(500,()=>[new p(u()-.5,u()-.5,u()-.5).normalize().multiplyScalar(60+u()*30),new q().setHSL(.1,.3,.5+u()*.4)],.9)),V.stars=v,x.stars=S}{const v=new O,o=1/40,F=[["pleiades","플레이아데스(좀생이별)",56.75,24.12,444,"#bcd2ff",3,"약 444광년 떨어진 젊은 별 무리예요."],["betelgeuse","베텔게우스",88.79,7.41,548,"#ffab6e",3,"붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요."],["rigel","리겔",78.63,-8.2,860,"#cfe0ff",3,"푸르고 아주 밝은 초거성이에요. 약 860광년."],["orionneb","오리온 대성운",83.82,-5.39,1344,"#ff9ec4",9,"별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요."],["deneb","데네브",310.36,45.28,2600,"#e6eeff",3,"백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실)."]];v.add(D("#ffe39a",1.6,new p));const S=[{id:"sun-orion",name:"태양",line:"우리은하의 오리온 팔 안쪽에 있어요.",position:new p}];for(const[b,k,I,A,z,W,Z,te]of F){const J=oe(I,A,z*o);v.add(D(W,Z,J)),b==="orionneb"&&v.add(H(260,()=>{const ge=Math.pow(u(),.6)*5;return[new p(u()-.5,u()-.5,u()-.5).normalize().multiplyScalar(ge).add(J),new q(u()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),S.push({id:b,name:k,line:te,position:J})}v.add(H(1400,()=>{const b=(u()-.5)*120,k=(u()-.5)*22*(.4+u()),I=(u()-.5)*4;return[new p(b,I,k),new q().setHSL(.6+u()*.1,.3,.35+u()*.3)]},.8)),V.orion=v,x.orion=S}{const v=new O,o=4;v.add(H(9e3,S=>{const b=S%o,k=Math.pow(u(),.55)*25,I=b/o*Math.PI*2+Math.log(1+k)*1.9+(u()-.5)*(.5+4/(k+2)),A=(u()-.5)*(k<4?2.2:.7),z=k<4,W=z?new q("#ffd9a0"):new q().setHSL(.58+u()*.06,.45,.45+u()*.35);return[new p(Math.cos(I)*k,A,Math.sin(I)*k),W.multiplyScalar(z?.8:.6)]},.55)),v.add(D("#fff0c8",7,new p));const F=new p(13,0,0);v.add(D("#ffe39a",1.2,F)),V.galaxy=v,x.galaxy=[{id:"center",name:"은하 중심(궁수자리 A*)",line:"태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요.",position:new p},{id:"sun-gal",name:"태양은 여기",line:"중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요.",position:F}]}{const v=new O,o=1/1e5,F=(z,W,Z,te,J)=>H(te,ge=>{const se=Math.pow(u(),.6)*W,ye=ge%2*Math.PI+Math.log(1+se*3)*2.2+(u()-.5)*.9,ze=new p(Math.cos(ye)*se,(u()-.5)*W*.05,Math.sin(ye)*se);ze.applyAxisAngle(new p(1,0,0),Z);const Ce=se<W*.18;return[ze.add(z),new q().setHSL(Ce?.1:J,.4,.45+u()*.3).multiplyScalar(Ce?.35:.22)]},.4),S=new p;v.add(F(S,2.2,0,1800,.6));const b=oe(10.68,41.27,25e5*o);v.add(F(b,4.4,1.2,3200,.1));const k=oe(23.46,30.66,273e4*o);v.add(F(k,1.6,.6,900,.62));const I=oe(80.89,-69.76,16e4*o);v.add(D("#cfd8ff",1.2,I));const A=oe(13.19,-72.83,2e5*o);v.add(D("#cfd8ff",.8,A)),V.group=v,x.group=[{id:"mw",name:"우리 은하",line:"지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요.",position:S},{id:"andromeda",name:"안드로메다은하",line:"약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요.",position:b},{id:"triangulum",name:"삼각형자리은하",line:"약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요.",position:k},{id:"lmc",name:"대마젤란은하",line:"약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요.",position:I}]}{const v=new O,o=6,F=(z,W,Z)=>new p(z,W,Z).multiplyScalar(o),S=F(5.1,.35,1.1),b=F(3.4,.45,.2),k=F(-1.4,-.3,-.5),I=[[F(.2,0,0),900,6.4*o*.5],[b,280,1.5*o*.5],[k,220,1.7*o*.5],[F(-2.2,1.6,2.4),120,1.1*o*.5]],A=I.reduce((z,W)=>z+W[1],0);v.add(H(A+180,z=>{let W=z;for(const[te,J,ge]of I){if(W<J)return[new p(u()-.5,(u()-.5)*.5,u()-.5).multiplyScalar(2*ge*Math.pow(u(),.5)).add(te),new q("#f3eee6").multiplyScalar(.75)];W-=J}const Z=u();return[S.clone().lerp(k,Z).add(new p((u()-.5)*.7*o,(u()-.5)*.45*o,(u()-.5)*.7*o)),new q("#e7c48a").multiplyScalar(.8)]},.5)),v.add(new h(w(new U(.95*o,20,16)),w(new C({color:"#d5e2f5",transparent:!0,opacity:.1,blending:ae,depthWrite:!1}))).translateX(b.x).translateY(b.y).translateZ(b.z)),v.add(new h(w(new U(1.05*o,20,16)),w(new C({color:"#e7c48a",transparent:!0,opacity:.09,blending:ae,depthWrite:!1}))).translateX(k.x).translateY(k.y).translateZ(k.z)),v.add(D("#e4b56a",1.2,S)),V.super=v,x.super=[{id:"localgroup",name:"우리 은하군",line:"우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요.",position:S},{id:"virgo-sc",name:"처녀자리 은하단",line:"약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요.",position:b},{id:"attractor-sc",name:"거대 인력체",line:"라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요.",position:k}]}{const v=new O,o=1/1e7,F=oe(187.7,12.4,54e6*o),S=oe(243,-60,2e8*o);v.add(H(5e3,k=>{const I=k%5,z=[F,S,oe(30,20,15e7*o),oe(160,-30,18e7*o),oe(300,40,14e7*o)][I],W=I===1?7:4;return[new p((u()-.5)*2,(u()-.5)*2,(u()-.5)*2).multiplyScalar(W*Math.pow(u(),.4)).add(z),new q().setHSL(.08+u()*.5,.35,.55).multiplyScalar(.8)]},.8)),v.add(D("#ffffff",.8,new p));const b=new h(w(new U(42,48,32)),w(new C({color:"#ff8a4a",transparent:!0,opacity:.08,side:$e,depthWrite:!1})));v.add(b),V.cosmos=v,x.cosmos=[{id:"here",name:"우리 은하",line:"여기서는 점 하나예요.",position:new p},{id:"virgo",name:"처녀자리 은하단",line:"약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요.",position:F},{id:"attractor",name:"거대 인력체",line:"약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요.",position:S},{id:"cmb",name:"가장 오래된 빛",line:"우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요.",position:new p(0,0,-42)}]}for(const v of Object.values(V))v.visible=!1;return{groups:V,markers:x,dispose:()=>B.forEach(v=>v.dispose())}}const mo="textures/",ee=Math.PI/180;function po(B,w,M=1){return new p(Math.cos(B*ee)*Math.cos(w*ee),Math.sin(B*ee),-Math.cos(B*ee)*Math.sin(w*ee)).multiplyScalar(M)}const T=2.2,uo=Date.UTC(2e3,0,1,12),fn={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},vn={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function fo(){if(typeof window>"u")return!0;const B=navigator,w=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,M=B.hardwareConcurrency??8,D=B.deviceMemory??8;return!!(w||M<=4||D<=4)}function vo(){const w=document.createElement("canvas");w.width=128,w.height=128;const M=w.getContext("2d");if(M){const D=M.createRadialGradient(64,64,0,64,64,64);D.addColorStop(0,"rgba(255,238,205,0.85)"),D.addColorStop(.3,"rgba(255,214,150,0.55)"),D.addColorStop(.45,"rgba(255,190,120,0.22)"),D.addColorStop(.7,"rgba(250,170,95,0.07)"),D.addColorStop(1,"rgba(255,160,80,0)"),M.fillStyle=D,M.fillRect(0,0,128,128)}return new gn(w)}const ho=`
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
}`,wo=`
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
  float rim = pow(1.0 - clamp(dot(normalize(vNormal), normalize(cameraPosition - vWorld)), 0.0, 1.0), 2.1);
  col += glow * rim * atmo;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function go(B){return Math.max(.12,.16+.11*Math.log2(B/2e3))}const yo=`
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
}`,bo=`
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
}`,xo=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Mo=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,hn=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,wn=`
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
}`,zo=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,So=`
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
}`,ko=`
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
}`,Po=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function No(B,w){const M=fo(),D=M?96:128,H=new Un({antialias:!0,powerPreference:"default",alpha:!1});H.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),H.outputColorSpace=rn,H.toneMapping=Fn,H.toneMappingExposure=1.1;const j=H.domElement;j.style.display="block",j.style.width="100%",j.style.height="100%",j.style.touchAction="none",B.appendChild(j);const u=document.createElement("div");u.className="space-labels",B.appendChild(u);const V=new Bn;V.background=new q("#05070d");const x=new jn(45,1,.01,2e3),v=[],o=e=>(v.push(e),e),F=new Vn;let S=0;const b=(e,t=!0)=>{S+=1;const a=F.load(mo+e,()=>{S-=1,S===0&&w.onReady?.()},void 0,()=>{S-=1,S===0&&w.onReady?.()});return a.colorSpace=t?rn:Qn,a.anisotropy=M?4:8,o(a)},k=new h(o(new U(900,48,24)),o(new C({map:b("milkyway.webp"),side:$e,depthWrite:!1})));k.rotation.set(63*ee,0,0),V.add(k),V.add(new Gn(16777215,.14));const I=new On(16777215,1.6,0,0);I.decay=0,V.add(I);const A=new O;V.add(A);const z=new Map,W=new Map,Z=new Map,te=[],J=new Map;let ge=null,se=null;const ye=new Map,ze=new Map,Ce=new Map,me=new Map;let g=null,vt=0,We=null;const ot=[],ht=[];let pe=Date.now(),Te=!0,wt=null;function He(e,t,a){const s=fn[a]??[.7,.7,.7,.06],l=vn[a],c=new q(t),d=e?b(e):null,f=l?.relief??0;return o(new we({uniforms:{dayMap:{value:d},bumpMap:{value:f>0?d:null},texel:{value:new et(l?.texel?.[0]??1/1024,l?.texel?.[1]??1/512)},useMap:{value:e?1:0},useBump:{value:f>0?1:0},relief:{value:f*.35},gain:{value:(l?.gain??1.9)*.6},base:{value:new p(c.r,c.g,c.b)},glow:{value:new p(s[0],s[1],s[2])},atmo:{value:Math.min(s[3]*2.2,.85)}},vertexShader:ho,fragmentShader:wo}))}function xn(e,t,a){const s=vn[a],l=s?.tint??fn[a]?.slice(0,3);if(!l||M)return;const c=Math.min(s?.inner??.12,.5)*.55,d=Math.min(s?.outer??.05,.2)*.9,f=new p(l[0],l[1],l[2]),n=Math.sqrt(1-1/(1.045*1.045)),r=(i,y,E,X)=>new h(o(new U(t*i,M?24:32,M?16:24)),o(new we({uniforms:{tint:{value:f},power:{value:E},strength:{value:X},edge:{value:n}},vertexShader:hn,fragmentShader:wn,side:y,transparent:!0,blending:ae,depthWrite:!1})));e.add(r(1.045,$e,2.7,c),r(1.16,cn,3.4,d))}function gt(e,t,a=""){const s=document.createElement("button");s.type="button",s.className="space-label"+a,s.textContent=t,s.addEventListener("click",()=>w.onPick?.(e)),u.appendChild(s),Z.set(e,s)}const yt=o(new we({uniforms:{map:{value:b("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),De=new p,Mn=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],bt=new Map;let ue=null;const zn={moon:"earth",...Object.fromEntries(mn.map(e=>[e.id,e.parent]))};function xt(e,t){const a=zn[e];if(ue===null||!a)return nt(e,t);const s=nt(a,t),l=nt(e,ue),c=nt(a,ue);return{x:s.x+l.x-c.x,y:s.y+l.y-c.y,z:s.z+l.z-c.z}}function Ie(e){for(const[t,a]of W){if(t==="sun")continue;const s=xt(t,e);a.position.set(s.x*T,s.y*T,s.z*T)}for(const[t,a]of ye){const s=xt(t,e);a.position.set(s.x*T,s.y*T,s.z*T)}if(We){De.copy(We.holder.position);const t=De.length()||1;We.tail.visible=t/T<8,De.multiplyScalar(1/t),We.tail.quaternion.setFromUnitVectors(new p(0,1,0),De),We.tail.position.copy(De).multiplyScalar(.16*T)}}const Re=new p(1,0,0),Sn=o(new we({uniforms:{dayMap:{value:b("earth-day.webp")},nightMap:{value:b("earth-night.webp")},normalMap:{value:b("earth-normal.webp",!1)},specMap:{value:b("earth-spec.webp",!1)},texel:{value:new et(1/2048,1/1024)},sunDir:{value:Re}},vertexShader:yo,fragmentShader:bo}));function kn(e){const t=new O,a=new h(o(new U(e,M?96:128,64)),Sn);a.name="earth",t.add(a);const s=new h(o(new U(e*1.012,80,48)),o(new eo({map:b("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));t.add(s),ge=s;const l=new h(o(new U(e*1.06,64,48)),o(new we({uniforms:{sunDir:{value:Re}},vertexShader:`
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
            }`,side:$e,transparent:!0,blending:ae,depthWrite:!1})));t.add(l);const c=new h(o(new U(e*1.15,M?24:32,M?16:24)),o(new we({uniforms:{tint:{value:new p(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:hn,fragmentShader:wn,side:cn,transparent:!0,blending:ae,depthWrite:!1})));return t.add(c),z.set("earth",a),t}function Mt(e,t,a){for(const s of Ge(e).sites??[]){const l=new h(o(new U(a*.018,12,8)),o(new C({color:"#3182f6"})));l.position.copy(po(s.lat,s.lon,a*1.004)),t.add(l);const c=document.createElement("div");c.className="space-site",c.textContent=s.name,u.appendChild(c),te.push({mesh:l,site:s,el:c,parent:e})}}let _e=null;for(const e of oo){if(e.id==="moon")continue;const t=new O;if(W.set(e.id,t),A.add(t),e.id==="sun"){const a=.26*T,s=new h(o(new U(a,M?96:128,M?64:80)),yt);s.name="sun",J.set("sun",a),t.add(s);for(const[c,d,f,n]of[[1.06,2,.95,"#ffbf78"]])t.add(new h(o(new U(a*c,M?32:48,M?24:32)),o(new we({uniforms:{color:{value:new q(n)},power:{value:d},strength:{value:f}},vertexShader:xo,fragmentShader:Mo,transparent:!0,blending:ae,depthWrite:!1}))));z.set("sun",s);const l=new yn(o(new bn({map:o(vo()),blending:ae,transparent:!0,depthWrite:!1,depthTest:!0,color:new q("#ffd9a0")})));l.scale.setScalar(a*3.6),t.add(l),se=l}else{const a=ft(e.id).radius*T;J.set(e.id,a);let s;if(e.id==="earth"){const f=kn(a);f.rotation.z=-e.tilt*ee,t.add(f),_e=f,s=f.children[0]}else s=new h(o(new U(a,M?96:128,64)),He(e.texture,e.color,e.id)),s.name=e.id,s.rotation.z=-e.tilt*ee,t.add(s),z.set(e.id,s),xn(t,a,e.id);if(e.axes){const[f,n,r]=e.axes;s.scale.set(1,r/f,n/f)}if(e.ring&&e.axes){const f=e.axes[0]/2,n=a*(e.ring.radius-e.ring.width/2)/f,r=a*(e.ring.radius+e.ring.width/2)/f,i=new h(o(new je(n,Math.max(r,n*1.03),128,1)),o(new C({color:"#8b8580",side:Pe,transparent:!0,opacity:.75,depthWrite:!1})));i.rotation.x=Math.PI/2,t.add(i)}if(e.id==="saturn"){const f=a*1.18,n=a*2.08,r=new je(f,n,160,1),i=new h(o(r),o(new we({uniforms:{ringMap:{value:b("saturn-ring.webp")},innerRatio:{value:f/n},planetRadius:{value:a},planetCenter:{value:new p}},vertexShader:zo,fragmentShader:So,side:Pe,transparent:!0,depthWrite:!1})));i.rotation.x=Math.PI/2,s.add(i),ht.push({mesh:i,parent:e.id})}e.sites&&Mt(e.id,s,a);const l=pn(e.id,.022),c=o(new Ee);c.setAttribute("position",new pt(l.positions,3)),c.setIndex(l.index),c.scale(T,T,T);const d=new h(c,o(new C({color:ft(e.id).ribbon,transparent:!0,opacity:.5,side:Pe,depthWrite:!1})));ot.push(d),A.add(d)}gt(e.id,e.name,e.id==="sun"?"":" is-planet")}const zt=[];function St(e,t,a){let s=e==="main"?1234:98765;const l=()=>(s=s*16807%2147483647,(s-1)/2147483646),c=o(new to(1,0)),d=new Float32Array(t*4),f=new Float32Array(t*4);for(let i=0;i<t;i+=1){let y;if(e==="main")do y=2.1+l()*1.2;while((Math.abs(y-2.5)<.03||Math.abs(y-2.82)<.03||Math.abs(y-2.95)<.02)&&l()<.85);else y=l()<.18?39.2+(l()-.5)*1.2:42+(l()-.5)*6.5;d[i*4]=y,d[i*4+1]=l()*Math.PI*2,d[i*4+2]=l()*(e==="main"?.18:.12),d[i*4+3]=l()*Math.PI*2,f[i*4]=(l()-.5)*(e==="main"?.32:.5),f[i*4+1]=l()*Math.PI*2;const E=l()**3;f[i*4+2]=(e==="main"?.0035:.009)*(.7+E*2.4),f[i*4+3]=l()}c.setAttribute("orbit",new dn(d,4)),c.setAttribute("shape",new dn(f,4));const n=o(new we({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new q(a)},uScale:{value:T}},vertexShader:ko,fragmentShader:Po})),r=new no(c,n,t);r.frustumCulled=!1,r.raycast=()=>{},A.add(r),zt.push({mesh:r,material:n})}St("main",M?1800:4200,"#9c9184"),St("kuiper",M?1500:3600,"#7f8b9c");for(const e of mn){const t=new O,a=new h(o(new U(e.radius*T,32,24)),He(`${e.id}.webp`,e.color,e.id));a.name=e.id,t.add(a),A.add(t),ye.set(e.id,t),ze.set(e.id,a);const s=document.createElement("button");s.type="button",s.className="space-label is-small",s.textContent=e.name,s.addEventListener("click",()=>w.onExtra?.(e.id)),u.appendChild(s),Ce.set(e.id,{el:s,parent:e.parent})}{const e=new O,t=new h(o(new U(.045*T,20,16)),o(new C({color:"#f7fbff"})));t.name="halley",e.add(t);const a=new h(o(new $n(.04*T,.32*T,12)),o(new C({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(a),We={holder:e,tail:a},A.add(e),ye.set("halley",e),ze.set("halley",t);const s=pn("halley",.022),l=o(new Ee);l.setAttribute("position",new pt(s.positions,3)),l.setIndex(s.index),l.scale(T,T,T);const c=new h(l,o(new C({color:ft("halley").ribbon,transparent:!0,opacity:.35,side:Pe,depthWrite:!1})));ot.push(c),A.add(c);const d=document.createElement("button");d.type="button",d.className="space-label is-small",d.textContent="핼리 혜성",d.addEventListener("click",()=>w.onExtra?.("halley")),u.appendChild(d),Ce.set("halley",{el:d,parent:null})}for(const e of ao){const t=so(e),a=t.points.map(E=>new p(E.x*T,E.y*T,E.z*T)),s=o(new Ee().setFromPoints(a)),l=new Hn(s,o(new tt({color:e.color,transparent:!0,opacity:.95})));l.visible=!1;const c=new O,d=new h(o(new ut(.03,.01,.01,20)),o(new C({color:"#d8dde4"})));d.rotation.x=Math.PI/2;const f=new h(o(new U(.014,12,8)),o(new C({color:"#c9ced6"})));f.position.z=-.02;const n=new h(o(new ut(.002,.002,.09,6)),o(new C({color:"#aab3c0"})));n.rotation.z=Math.PI/2,n.position.z=-.02;const r=new h(o(new U(.035,16,12)),o(new C({color:e.color,transparent:!0,opacity:.18,blending:ae,depthWrite:!1})));c.add(d,f,n,r),c.scale.setScalar(e.frame==="earth"?.8:1.3),c.position.copy(a[a.length-1]),l.add(c),(e.frame==="earth"?W.get("earth")??A:A).add(l);const y=document.createElement("div");y.className="space-site is-probe",y.textContent=e.name,u.appendChild(y),me.set(e.id,{line:l,probe:c,el:y,points:a,times:t.points.map(E=>E.t),marks:t.marks,frame:e.frame})}if(Ie(pe),_e){const e=.055*T;J.set("moon",e);const t=new h(o(new U(e,D,48)),He("moon.webp","#b8b8b8","moon"));t.name="moon";const a=new O;a.add(t),A.add(a),z.set("moon",t),W.set("moon",a),Mt("moon",t,e),gt("moon","달"," is-small"),Ie(pe)}const Ue=new O,Ne=new O,Xe=new O;Ue.add(Ne,Xe),Ue.visible=!1;let kt="solar",be=!1,at=0;const P={moon:new h,moonMat:o(new C({color:"#ffffff"})),shadow:o(new C({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new h,umbra:new h,skyCover:new h,skySun:new O,skyMoon:new O,skyMoonMat:o(new C({color:"#ffffff"}))},Pt=[],Et=b("sun.webp"),Ct=b("moon.webp"),Wt=new h(o(new U(.62,32,24)),o(new C({map:Et})));Wt.position.set(-3.3,0,0);const Rt=new h(o(new U(.4,32,24)),o(new C({map:b("earth-day.webp")})));Rt.position.set(1.85,0,0),P.moonMat.map=Ct,P.moon=new h(o(new U(.14,24,18)),P.moonMat),P.cone=new h(o(new ut(.04,.16,.78,18)),P.shadow),P.cone.position.set(1.42,0,0),P.cone.rotation.z=Math.PI/2,P.umbra=new h(o(new Ve(.3,28)),o(new C({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),P.umbra.position.set(2.75,0,.02),Ne.add(Wt,Rt,P.moon,P.cone,P.umbra);for(const[e,t]of[["태양",new p(-3.3,.85,0)],["지구",new p(1.85,.68,0)]]){const a=document.createElement("div");a.className="space-site",a.textContent=e,u.appendChild(a),Pt.push({el:a,at:t,group:Ne})}const Pn=new h(o(new Ve(1.35,48)),o(new C({map:Et}))),En=new h(o(new je(1.4,1.7,48)),o(new C({color:"#f0c36a",transparent:!0,opacity:.45,side:Pe,depthWrite:!1})));P.skyCover=new h(o(new Ve(1.22,48)),o(new C({color:"#141820"}))),P.skySun.add(Pn,En,P.skyCover),P.skyMoonMat.map=Ct;const Cn=new h(o(new Ve(.92,48)),P.skyMoonMat),Nt=new h(o(new Ve(1.08,48)),o(new C({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));Nt.position.z=.16,P.skyMoon.add(Cn,Nt),Xe.add(P.skySun,P.skyMoon),Xe.visible=!1,V.add(Ue);const xe=new O;xe.visible=!1,xe.rotation.z=-Math.PI/2;const Lt=[],At=4.6,Wn=e=>At*e/696e3,Tt=new h(o(new U(At,64,40)),o(new C({map:b("sun.webp")})));Tt.position.set(-3.2,0,0),xe.add(Tt);const Rn=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let Dt=2.4;const It=(e,t)=>{const a=document.createElement("div");a.className="space-site",a.textContent=e,u.appendChild(a),Lt.push({el:a,at:t,group:xe})};It("태양",new p(-3.2,4.9,0));for(const[e,t]of Rn){const a=Wn(t),s=Dt+a;Dt=s+a+.72;const l=Ge(e),c=e==="earth"?"earth-day.webp":l.texture,d=new h(o(new U(a,32,24)),o(new C(c?{map:b(c)}:{color:l.color})));if(d.position.set(s,0,0),l.axes&&d.scale.set(1,l.axes[2]/l.axes[0],l.axes[1]/l.axes[0]),xe.add(d),e==="saturn"){const f=a*1.18,n=a*2.08,r=o(new je(f,n,96,1)),i=r.attributes.position,y=r.attributes.uv,E=new p;for(let K=0;K<i.count;K+=1)E.fromBufferAttribute(i,K),y.setXY(K,(E.length()-f)/(n-f),.5);const X=new h(r,o(new C({map:b("saturn-ring.webp"),transparent:!0,opacity:.9,side:Pe,depthWrite:!1})));X.rotation.y=Math.PI/2-.36,d.add(X)}It(l.name,new p(s,(e==="saturn"?a*2.08:a)+.12,0))}V.add(xe);const re=new O;re.visible=!1;const st=[],_t=[],Nn=new h(o(new U(.55,48,32)),o(new C({color:"#e0703a"})));re.add(Nn);for(const[e,t]of[[1.35,.16],[2.1,.05]])re.add(new h(o(new U(.55*e,32,24)),o(new C({color:"#ff6a30",transparent:!0,opacity:t,side:$e,blending:ae,depthWrite:!1}))));const Ut=new h(o(new je(2.6,5.1,96,1)),o(new C({color:"#3fbf7f",transparent:!0,opacity:.12,side:Pe,depthWrite:!1})));Ut.rotation.x=Math.PI/2,re.add(Ut),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,t,a,s,l],c)=>{const d=new ln(o(new Ee().setFromPoints(Array.from({length:128},(r,i)=>new p(Math.cos(i/128*Math.PI*2)*a*100,0,Math.sin(i/128*Math.PI*2)*a*100)))),o(new tt({color:"#8b95a1",transparent:!0,opacity:.35})));re.add(d);const f=new h(o(new U(.16*s,24,16)),He(void 0,l,"earth"));re.add(f);const n=document.createElement("button");n.type="button",n.className="space-label is-small",n.textContent=e,n.addEventListener("click",()=>w.onExtra?.(`trappist-${e}`)),u.appendChild(n),st.push({mesh:f,a:a*100,period:t,phase0:c*1.7,el:n})});const Ln=new ln(o(new Ee().setFromPoints(Array.from({length:256},(e,t)=>new p(Math.cos(t/256*Math.PI*2)*38.7,0,Math.sin(t/256*Math.PI*2)*38.7)))),o(new tt({color:"#c5b8a2",transparent:!0,opacity:.5})));re.add(Ln);for(const[e,t]of[["TRAPPIST-1",new p(0,1.1,0)],["생명가능지대(대략)",new p(3.9,0,0)],["비교: 우리 수성의 궤도",new p(0,0,38.7)]]){const a=document.createElement("div");a.className="space-site",a.textContent=e,u.appendChild(a),_t.push({el:a,at:t})}V.add(re);const ie=co(),rt=[];if(ie)for(const[e,t]of Object.entries(ie.groups)){V.add(t);for(const a of ie.markers[e]){const s=document.createElement("button");s.type="button",s.className="space-label",s.textContent=a.name,s.addEventListener("click",()=>{w.onMarker?.(a),N.target.copy(a.position),N.radius=Ae[e]*(a.id==="cmb"?1.4:e==="group"?.6:.42)}),u.appendChild(s),rt.push({level:e,marker:a,el:s})}}const Ft=[];if(ie){const t=(c,d)=>new p(Math.cos(d*ee)*Math.cos(c*ee),Math.sin(d*ee),-Math.cos(d*ee)*Math.sin(c*ee)).multiplyScalar(140),a=[];for(const c of Object.values(un))for(const d of c)for(let f=0;f<d.length-1;f+=1){const n=t(d[f][0],d[f][1]),r=t(d[f+1][0],d[f+1][1]);a.push(n.x,n.y,n.z,r.x,r.y,r.z)}const s=o(new Ee);s.setAttribute("position",new pt(a,3));const l=new Xn(s,o(new tt({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));ie.groups.stars.add(l);for(const c of ro){if(!un[c.id])continue;const d=document.createElement("button");d.type="button",d.className="space-label is-const",d.textContent=c.name.replace(/\(.*\)/,"").split(" · ")[0],d.addEventListener("click",()=>w.onConstellation?.(c.id)),u.appendChild(d),Ft.push({el:d,at:t(c.center[0],c.center[1])})}}const it=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let _="system",Le=!1,Bt=!1;const Ae={system:40,super:40,eclipse:7.5,sizes:15,exo:16,stars:46,orion:48,galaxy:44,group:40,cosmos:70},Fe=new p,R={theta:.6,phi:.95,radius:34},N={target:new p,radius:R.radius};let G="system",Y=null,Q=null,ne=null;function Ye(e){if(_=e,Le=!1,A.visible=e==="system",Ue.visible=e==="eclipse",xe.visible=e==="sizes",re.visible=e==="exo",ie)for(const[t,a]of Object.entries(ie.groups))a.visible=t===e;G="system",Y=null,Q=null,ne=null,N.target.set(0,0,0),N.radius=Ae[e],e!=="system"&&(R.phi=1.1),e==="eclipse"&&(Ne.rotation.z=x.aspect<1?-Math.PI/2:0,R.theta=0,R.phi=be?Math.PI/2:1.25,N.target.set(0,0,0),be||N.target.set(-.7,0,0).applyEuler(Ne.rotation),N.radius=be?6:x.aspect<1?10:7.5),e==="exo"&&(R.phi=.75),e==="sizes"&&(R.theta=0,R.phi=Math.PI/2,N.target.set(.6,-6.8,0),N.radius=19)}function jt(e){if(Le=!1,_!=="system"&&(_="system",A.visible=!0,Ue.visible=!1,xe.visible=!1,re.visible=!1,ie))for(const a of Object.values(ie.groups))a.visible=!1;if(G=e,Q=null,ne=null,e==="system"){Y=null,N.target.set(0,0,0),N.radius=Ae.system;return}Y=W.get(e)??null;const t=J.get(e)??go(Ge(e).km);N.radius=e==="sun"?3.2:e==="jupiter"?3.4*T:e==="saturn"?2.6*T:Math.max(t*(Ge(e).ring?6:4.2),.25)}function An(e){const t=ye.get(e);t&&(_!=="system"&&Ye("system"),G="system",Y=t,Q=null,ne=null,N.radius=e==="halley"?1.6:.6,Se=performance.now())}function Tn(e){ne=(e?te.find(a=>a.parent===G&&a.site.name===e.name):void 0)?.mesh??null,Q=ne?new p:null,Se=performance.now()}const fe=new Map;let Be=0,qe=0,Se=0;const Vt=new Yn,Gt=new et,Ot=e=>{if(j.setPointerCapture(e.pointerId),Le=!1,fe.set(e.pointerId,{x:e.clientX,y:e.clientY}),qe=0,Se=performance.now(),fe.size===2){const[t,a]=[...fe.values()];Be=Math.hypot(t.x-a.x,t.y-a.y)}},$t=e=>{const t=fe.get(e.pointerId);if(!t)return;const a=e.clientX-t.x,s=e.clientY-t.y;if(fe.set(e.pointerId,{x:e.clientX,y:e.clientY}),Se=performance.now(),fe.size===1)qe+=Math.abs(a)+Math.abs(s),R.theta-=a*.006,R.phi=Math.min(2.9,Math.max(.2,R.phi-s*.006)),Q=null,ne=null;else if(fe.size===2){const[l,c]=[...fe.values()],d=Math.hypot(l.x-c.x,l.y-c.y);Be>0&&(N.radius=Xt(N.radius*(Be/d))),Be=d,qe+=10}},Ke=e=>{if(fe.delete(e.pointerId),Be=0,qe<6&&w.onPick){const t=j.getBoundingClientRect();Gt.set((e.clientX-t.left)/t.width*2-1,-((e.clientY-t.top)/t.height)*2+1),Vt.setFromCamera(Gt,x);const s=Vt.intersectObjects([...z.values(),...ze.values()],!1)[0]?.object.name;s&&z.has(s)?w.onPick(s):s&&ze.has(s)&&w.onExtra?.(s)}},Ht=e=>{e.preventDefault(),N.radius=Xt(N.radius*(e.deltaY>0?1.12:.89))};function Xt(e){return _!=="system"?Math.min(Ae[_]*2.2,Math.max(Ae[_]*.15,e)):Math.min(90,Math.max(G==="system"&&!Y?4:.15,e))}j.addEventListener("pointerdown",Ot),j.addEventListener("pointermove",$t),j.addEventListener("pointerup",Ke),j.addEventListener("pointercancel",Ke),j.addEventListener("wheel",Ht,{passive:!1});let ve=null,Ze=null,lt=!matchMedia("(prefers-reduced-motion: reduce)").matches,Yt=0,qt=0;lt&&(ve=new qn(H),ve.addPass(new Kn(V,x)),Ze=new Zn(new et(256,256),.75,.78,.92),ve.addPass(Ze),ve.addPass(new Jn));const L={w:1,h:1},Kt=()=>{L.w=B.clientWidth||1,L.h=B.clientHeight||1,H.setSize(L.w,L.h,!1),ve?.setSize(L.w,L.h),Ze?.resolution.set(L.w/2,L.h/2),x.aspect=L.w/L.h,x.updateProjectionMatrix()};Kt();const Zt=new ResizeObserver(Kt);Zt.observe(B);let Jt=!0;const Qt=new IntersectionObserver(e=>{Jt=e.some(t=>t.isIntersecting)});Qt.observe(B);const m=new p,ke=new p;let ct=0,en=performance.now(),dt=-1e9,tn=0;const nn=e=>{ct=requestAnimationFrame(nn);const t=Math.min(.1,(e-en)/1e3);if(en=e,document.hidden||!Jt)return;it||(yt.uniforms.time.value=e/1e3),e-Se>3e3&&!it&&!Q&&!Bt&&!Le&&_!=="eclipse"&&_!=="sizes"&&(R.theta+=t*(G==="system"?.03:.08)),ge?.rotateY(t*.01);for(const[n,r]of z){if(n==="earth"||n==="moon"||ne&&n===G)continue;const i=Ge(n).spinHours;it||r.rotateY(t*(n==="sun"?.02:i?.12*(24/i)*.25:.12))}se&&(se.visible=x.position.length()>4);for(const n of zt)n.material.uniforms.uDays.value=(pe-uo)/864e5,n.material.uniforms.uTime.value=e/1e3;for(const n of ht){const r=z.get(n.parent);r&&n.mesh.material.uniforms.planetCenter.value.copy(r.getWorldPosition(m))}if(Te&&e-tn>1e3&&(tn=e,pe=Date.now(),Ie(pe)),g){const n=me.get(g.id),r=n.points.length,i=n.times[r-1],y=(n.frame==="earth"?6:25)*864e5,X=n.marks.some($=>$.at!==void 0&&$.body&&$.body!=="earth"&&Math.abs(g.sim-$.at)<y)?"slow":g.sim>=g.fastFrom?"fast":"normal",K=X==="slow"?Math.min(g.base,2*y/3):g.base*(X==="fast"?g.fast:1);g.sim=Math.min(i,g.sim+K*Math.min(t,.1)),n.frame==="sun"?ue=(ue??g.sim)+Math.min(t,.1)*.15*864e5:ue=null,g.pace=X;const Je=(g.sim-n.times[0])/(i-n.times[0]||1);let he=0,le=r-1;for(;le-he>1;){const $=he+le>>1;n.times[$]<=g.sim?he=$:le=$}const ce=n.times[le]-n.times[he],de=he+(ce>0?(g.sim-n.times[he])/ce:0),Me=Math.max(0,Math.min(r-2,Math.floor(de))),on=de-Me;n.probe.position.lerpVectors(n.points[Me],n.points[Me+1],on),vt=de,n.probe.lookAt(n.line.localToWorld(n.points[Math.min(r-1,Me+2)].clone())),n.line.geometry.setDrawRange(0,Me+2);const mt=n.times[Me]+(n.times[Me+1]-n.times[Me])*on;Te=!1,pe=mt,Ie(mt);let Qe=0;for(let $=0;$<n.marks.length;$+=1){const an=n.marks[$],Dn=an.at??n.times[Math.min(r-1,an.index)];g.sim>=Dn-y&&(Qe=$)}if((Qe!==g.mark||e-g.lastPing>250||g.sim>=i&&!g.done)&&(g.mark=Qe,g.lastPing=e,g.sim>=i&&(g.done=!0),w.onFlight?.({id:g.id,mark:n.marks[Qe],progress:Je,time:mt,done:g.done,pace:g.pace})),g.done){const $=n.frame==="earth";g=null,ue=null,Te=!0,Y=$?W.get("earth")??null:null,$||N.target.set(0,0,0),N.radius=$?4.2:72,R.phi=$?.7:.45}}if(Y&&N.target.copy(Y.getWorldPosition(m)),g){const n=me.get(g.id);let r=null,i=1/0;for(const E of n.marks){if(!E.body||E.body==="earth"||E.body==="far")continue;const X=Math.abs(E.index-vt);X<14&&X<i&&(r=E,i=X)}const y=r?W.get(r.body):void 0;if(y){const E=y.getWorldPosition(new p).add(n.probe.getWorldPosition(new p)).multiplyScalar(.5);N.target.copy(E),N.radius=n.frame==="earth"?1.6:4.2}else N.radius=n.frame==="earth"?1.5:2.8}if(Fe.lerp(N.target,1-Math.pow(.002,t)),R.radius+=(N.radius-R.radius)*(1-Math.pow(.004,t)),Q&&ne){const n=z.get(G)?.getWorldPosition(new p)??new p;Q.copy(ne.getWorldPosition(new p).sub(n).normalize());const r=Math.atan2(Q.x,Q.z),i=Math.acos(Math.max(-1,Math.min(1,Q.y)));let y=r-R.theta;y=Math.atan2(Math.sin(y),Math.cos(y)),R.theta+=y*(1-Math.pow(.01,t)),R.phi+=(i-R.phi)*(1-Math.pow(.01,t))}if(_==="exo"){const n=e/1e3;for(const r of st){const i=r.phase0+n/r.period*Math.PI*2;r.mesh.position.set(Math.cos(i)*r.a,0,Math.sin(i)*r.a)}}if(_==="eclipse"){at=(at+t*.18)%1;const n=Math.sin(at*Math.PI*2),r=Math.abs(n)<.22,i=kt==="lunar";Ne.visible=!be,Xe.visible=be,P.skySun.visible=!i,P.skyMoon.visible=i,be?i?(P.skyMoon.position.set(n*1.7,0,.08),P.skyMoonMat.color.set(r?"#c47462":"#f2f2f2")):P.skyCover.position.set(n*1.7,0,.08):(P.moon.position.set(i?2.75:1.05,n*.55,0),P.cone.visible=!i,P.umbra.visible=i,P.shadow.opacity=r?.42:.08,P.umbra.material.opacity=r?.42:.08,P.moonMat.color.set(i&&r?"#c47462":"#ffffff"))}if(x.position.set(Fe.x+R.radius*Math.sin(R.phi)*Math.sin(R.theta),Fe.y+R.radius*Math.cos(R.phi),Fe.z+R.radius*Math.sin(R.phi)*Math.cos(R.theta)),x.lookAt(Fe),_e&&(_e.getWorldPosition(m),Re.copy(m).multiplyScalar(-1).normalize(),e-dt>500&&!(g&&me.get(g.id)?.frame==="sun"))){dt=e;const n=io(new Date(pe)),r=Math.atan2(n.y,n.x),i=Math.atan2(-Re.z,Re.x),y=_e.children[0];y.rotation.y=i-r}ve&&lt&&(_!=="system"||G==="system"||G==="sun")&&ve?(ve.render(t),Yt+=1,qt+=t,Yt===90&&qt/90>.034&&(lt=!1)):H.render(V,x),x.getWorldDirection(ke);const l=[];for(const n of Mn){const r=Z.get(n),i=W.get(n);if(!r||!i)continue;i.getWorldPosition(m);const y=m.clone().sub(x.position).dot(ke)>0,E=G==="system"&&_==="system"&&(!Y||g!==null),X=G==="earth"||G==="moon"||g!==null&&me.get(g.id)?.frame==="earth";let K=y&&(n==="moon"?_==="system"&&X:E||X&&n==="earth"&&g!==null);m.project(x);const Je=(m.x+1)/2*L.w,he=(1-m.y)/2*L.h+10;if(K){let le=bt.get(n)??0;le||(r.style.display="block",le=r.offsetWidth||40,bt.set(n,le));const ce={x:Je-le/2,y:he,w:le,h:22};l.some(de=>ce.x<de.x+de.w+4&&ce.x+ce.w+4>de.x&&ce.y<de.y+de.h&&ce.y+ce.h>de.y)?K=!1:l.push(ce)}r.style.display=K?"block":"none",K&&(r.style.transform=`translate(${Je}px, ${he}px) translate(-50%, 0)`)}const c=_==="system",d=G!=="system"&&G!=="jupiter"&&G!=="saturn",f=Y!==null&&(g===null?Y===W.get("earth"):me.get(g.id)?.frame==="earth");for(const n of ot)n.visible=!d&&!f;for(const[n,r]of Ce){const i=ye.get(n),y=r.parent?W.get(r.parent)===Y:G==="system"&&(!Y||Y===i),E=Y===i||y;i.getWorldPosition(m);const X=m.clone().sub(x.position).dot(ke)>0,K=c&&X&&E;m.project(x),r.el.style.display=K?"block":"none",K&&(r.el.style.transform=`translate(${(m.x+1)/2*L.w}px, ${(1-m.y)/2*L.h+8}px) translate(-50%, 0)`)}for(const[n,r]of me){const i=c&&wt===n;if(r.line.visible=i,!i){r.el.style.display="none";continue}r.probe.getWorldPosition(m);const y=m.clone().sub(x.position).dot(ke)>0;m.y+=0,m.project(x),r.el.style.display=y?"block":"none",y&&(r.el.style.transform=`translate(${(m.x+1)/2*L.w}px, ${(1-m.y)/2*L.h}px) translate(10px, -50%)`)}for(const n of Ft){if(_!=="stars"){n.el.style.display="none";continue}m.copy(n.at);const r=m.clone().sub(x.position).dot(ke)>0;m.project(x);const i=r&&Math.abs(m.x)<1&&Math.abs(m.y)<1;n.el.style.display=i?"block":"none",i&&(n.el.style.transform=`translate(${(m.x+1)/2*L.w}px, ${(1-m.y)/2*L.h}px) translate(-50%, -50%)`)}for(const n of rt){if(!(n.level===_)){n.el.style.display="none";continue}m.copy(n.marker.position);const i=m.clone().sub(x.position).dot(ke)>0;m.project(x),n.el.style.display=i?"block":"none",i&&(n.el.style.transform=`translate(${(m.x+1)/2*L.w}px, ${(1-m.y)/2*L.h+8}px) translate(-50%, 0)`)}for(const n of st){if(_!=="exo"){n.el.style.display="none";continue}n.mesh.getWorldPosition(m);const r=m.clone().sub(x.position).dot(ke)>0;m.project(x),n.el.style.display=r?"block":"none",r&&(n.el.style.transform=`translate(${(m.x+1)/2*L.w}px, ${(1-m.y)/2*L.h+8}px) translate(-50%, 0)`)}for(const n of _t){if(_!=="exo"){n.el.style.display="none";continue}m.copy(n.at).project(x);const r=m.z<1&&Math.abs(m.x)<1.05&&Math.abs(m.y)<1.05;n.el.style.display=r?"block":"none",r&&(n.el.style.transform=`translate(${(m.x+1)/2*L.w}px, ${(1-m.y)/2*L.h}px) translate(-50%, -100%)`)}for(const[n,r]of[[Pt,_==="eclipse"&&!be],[Lt,_==="sizes"]])for(const i of n){if(!r){i.el.style.display="none";continue}m.copy(i.at).applyMatrix4(i.group.matrixWorld).project(x);const y=m.z<1&&Math.abs(m.x)<1.1&&Math.abs(m.y)<1.1;i.el.style.display=y?"block":"none";const E=i.group.rotation.z!==0;y&&(i.el.style.transform=`translate(${(m.x+1)/2*L.w}px, ${(1-m.y)/2*L.h}px) ${E?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const n of te){n.mesh.getWorldPosition(m);const r=z.get(n.parent),i=r?r.getWorldPosition(new p):new p,E=m.clone().sub(i).normalize().dot(x.position.clone().sub(m).normalize())>.15&&_==="system"&&G===n.parent;m.project(x),n.el.style.display=E?"block":"none",E&&(n.el.style.transform=`translate(${(m.x+1)/2*L.w}px, ${(1-m.y)/2*L.h}px) translate(8px, -50%)`)}};return ct=requestAnimationFrame(nn),S===0&&w.onReady?.(),{focus:jt,setLevel:Ye,setPaused:e=>{Bt=e},focusMarker:e=>{const t=rt.find(a=>a.level===_&&a.marker.id===e);t&&(N.target.copy(t.marker.position),N.radius=Ae[_]*(e==="cmb"?1.4:_==="group"?.6:.42),Se=performance.now())},showSite:Tn,focusExtra:An,setEclipse:(e,t)=>{kt=e,be=t,Ye("eclipse")},setHemisphere:e=>{G!=="earth"&&jt("earth");const t=Re.clone().multiplyScalar(e==="day"?1:-1);R.theta=Math.atan2(t.x,t.z),R.phi=Math.min(2.6,Math.max(.5,Math.acos(t.y))),Q=null,ne=null,Le=!0},setTime:e=>{Te=e===null,pe=e??Date.now(),Ie(pe),dt=-1e9},setVoyage:e=>{if(wt=e,!e){g&&(g=null,Te=!0),ue=null;for(const r of me.values())r.line.geometry.setDrawRange(0,1/0);return}_!=="system"&&Ye("system"),ue=null;const t=me.get(e);t.line.geometry.setDrawRange(0,2),G="system",Q=null,ne=null,Le=!1,Y=t.probe;const a=t.frame==="earth";N.radius=a?1.3:2.8,R.phi=a?.75:1;const s=Math.max(...t.marks.filter(r=>r.at!==void 0&&r.body!=="earth").map(r=>r.at),t.times[0]+864e5),l=t.times[0],c=t.times[t.times.length-1],d=(s-l)/(a?20:24),f=t.frame==="earth"?c:s+60*864e5,n=c>f?(c-f)/4/d:1;g={id:e,sim:l,base:d,fastFrom:f,fast:n,mark:-1,done:!1,lastPing:0,pace:"normal"},Se=performance.now()},dispose:()=>{ie?.dispose(),ve?.dispose(),Ze?.dispose(),cancelAnimationFrame(ct),Zt.disconnect(),Qt.disconnect(),j.removeEventListener("pointerdown",Ot),j.removeEventListener("pointermove",$t),j.removeEventListener("pointerup",Ke),j.removeEventListener("pointercancel",Ke),j.removeEventListener("wheel",Ht),V.traverse(e=>{const t=e.material;Array.isArray(t)&&t.forEach(a=>a.dispose())}),v.forEach(e=>e.dispose()),H.dispose(),j.remove(),u.remove()}}}export{No as createSpace};
