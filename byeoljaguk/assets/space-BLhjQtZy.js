import{t as c,a as xo}from"./index-MDkznCWj.js";import{G as $,M as y,S as L,a as W,b as le,A as te,D as Ce,V as m,R as Be,P as bo,B as tt,C as Hn,c as Yn,d as qn,e as q,f as Re,g as Ln,h as Mo,i as zo,W as So,j as Tt,k as Po,l as Co,m as ko,T as Eo,I as Wo,n as No,o as To,p as pt,F as Rt,q as Ro,L as Do,r as ut,s as Dt,t as Ze,u as An,v as Lo,w as Ao,E as Io,x as _o,U as Uo,O as Fo,N as Bo,y as jo,z as Vo,H as Oo,J as In,K as Go,Q as _n,X as $o,Y as Xo}from"./three-DoRBX46D.js";import{af as Un,ag as Ho,ah as Lt,ai as Fn,aj as Yo,ak as qo,al as Qe,C as Ko,am as Jo,an as ft}from"./App-BhQ69dAz.js";import{C as Bn}from"./sky-DFh9wqZE.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";import"./audio-DbVsuU6C.js";const jn=`
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  vec2 rot(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
  vec3 diskColor(float t) {
    vec3 hot = vec3(1.0, 0.96, 0.88);
    vec3 mid = vec3(1.0, 0.62, 0.26);
    vec3 cool = vec3(0.78, 0.2, 0.08);
    vec3 c = mix(hot, mid, smoothstep(0.0, 0.3, t));
    return mix(c, cool, smoothstep(0.3, 1.0, t));
  }
`,vt=3,At=9;function Zo(k){const x=new $;x.visible=!1,x.rotation.z=.1;const M=new y(k(new L(1,48,32)),k(new W({color:"#000000"})));M.renderOrder=0,x.add(M);const N=k(new le({uniforms:{uTime:{value:0},uCam:{value:new m}},transparent:!0,depthWrite:!1,side:Ce,blending:te,vertexShader:`
        varying vec2 vP;
        varying vec3 vW;
        varying vec3 vTan;
        void main() {
          vP = position.xy;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          vTan = normalize((modelMatrix * vec4(-position.y, position.x, 0.0, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform vec3 uCam;
        varying vec2 vP;
        varying vec3 vW;
        varying vec3 vTan;
        ${jn}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${vt.toFixed(1)}) / ${(At-vt).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${vt.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),V=new y(k(new Be(vt,At,256,8)),N);V.rotation.x=-Math.PI/2,V.renderOrder=1,x.add(V);const I=k(new le({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:te,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${jn}
        void main() {
          float r = length(vP);
          float a = atan(vP.y, vP.x);
          // Photon ring near 1.5 Rs.
          float ring = exp(-pow((r - 1.52) / 0.035, 2.0)) * 0.85;
          // Lensed far side of the disk: arcs above and below the shadow.
          float band = smoothstep(1.55, 1.75, r) * (1.0 - smoothstep(2.3, 3.4, r));
          float arc = pow(abs(sin(a)), 1.6);
          vec2 p = rot(vP, uTime * 0.6) * 2.2;
          float n = 0.55 + 0.6 * noise(p + vec2(r * 3.0));
          float t = clamp((r - 1.6) / 1.8, 0.0, 1.0);
          vec3 col = diskColor(t) * band * arc * n * 0.7 + vec3(1.0, 0.85, 0.65) * ring;
          gl_FragColor = vec4(col, 1.0);
        }
      `})),v=new y(k(new bo(8,8)),I);v.renderOrder=2,x.add(v);const ne=[{name:c("궁수자리 A*"),at:new m(0,3.6,0)},{name:c("사건의 지평선"),at:new m(0,-2.9,0)},{name:c("강착 원반"),at:new m(At-1.2,0,0)}],oe=new m;return{group:x,labels:ne,update(g,z){N.uniforms.uTime.value=g,I.uniforms.uTime.value=g,z.getWorldPosition(oe),N.uniforms.uCam.value.copy(oe),v.lookAt(oe)}}}const et=Math.PI/180;function fe(k,x,M){return new m(Math.cos(x*et)*Math.cos(k*et),Math.sin(x*et),-Math.cos(x*et)*Math.sin(k*et)).multiplyScalar(M)}function Qo(){const x=document.createElement("canvas");x.width=64,x.height=64;const M=x.getContext("2d");if(M){const N=M.createRadialGradient(32,32,0,32,32,32);N.addColorStop(0,"rgba(255,255,255,1)"),N.addColorStop(.25,"rgba(255,255,255,0.75)"),N.addColorStop(1,"rgba(255,255,255,0)"),M.fillStyle=N,M.fillRect(0,0,64,64)}return new Hn(x)}function ea(){const k=[],x=g=>(k.push(g),g),M=x(Qo());function N(g,z,S){const w=new Yn(x(new qn({map:M,color:new q(g),transparent:!0,depthWrite:!1,blending:te})));return w.scale.setScalar(z),w.position.copy(S),w}function V(g,z,S){const w=new Float32Array(g*3),_=new Float32Array(g*3);for(let U=0;U<g;U+=1){const[K,B]=z(U);w.set([K.x,K.y,K.z],U*3),_.set([B.r,B.g,B.b],U*3)}const a=x(new Re);return a.setAttribute("position",new Ln(w,3)),a.setAttribute("color",new Ln(_,3)),new Mo(a,x(new zo({size:S,map:M,vertexColors:!0,transparent:!0,depthWrite:!1,blending:te,sizeAttenuation:!0})))}let I=7;const v=()=>(I=I*16807%2147483647,(I-1)/2147483646),ne={},oe={};{const g=new $,z=2.6,S=[["alphacen",c("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",c("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",c("바너드별"),269.45,4.69,5.96,"#ffb27a",c("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",c("울프 359"),164.12,7.01,7.86,"#ff9a6a",c("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",c("시리우스"),101.29,-16.72,8.6,"#cfe0ff",c("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",c("로스 154"),282.46,-23.84,9.69,"#ffa070",c("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",c("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",c("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",c("백조자리 61"),316.7,38.75,11.4,"#ffc58a",c("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",c("프로키온"),114.83,5.22,11.46,"#fff3d6",c("작은개자리의 밝은 별이에요.")],["epsind",c("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",c("남쪽 하늘의 가까운 별이에요.")],["taucet",c("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",c("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];g.add(N("#ffe39a",3.2,new m));const w=[{id:"sun-star",name:c("태양"),line:c("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new m}];for(const[_,a,U,K,B,F,Z]of S){const de=fe(U,K,B*z);g.add(N(F,2.4,de)),w.push({id:_,name:a,line:xo("{0} 거리 약 {1}광년.",Z,B),position:de})}g.add(V(500,()=>[new m(v()-.5,v()-.5,v()-.5).normalize().multiplyScalar(60+v()*30),new q().setHSL(.1,.3,.5+v()*.4)],.9)),ne.stars=g,oe.stars=w}{const g=new $,z=1/40,S=[["pleiades",c("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,c("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",c("베텔게우스"),88.79,7.41,548,"#ffab6e",3,c("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",c("리겔"),78.63,-8.2,860,"#cfe0ff",3,c("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",c("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,c("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",c("데네브"),310.36,45.28,2600,"#e6eeff",3,c("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];g.add(N("#ffe39a",1.6,new m));const w=[{id:"sun-orion",name:c("태양"),line:c("우리은하의 오리온 팔 안쪽에 있어요."),position:new m}];for(const[_,a,U,K,B,F,Z,de]of S){const se=fe(U,K,B*z);g.add(N(F,Z,se)),_==="orionneb"&&g.add(V(260,()=>{const xe=Math.pow(v(),.6)*5;return[new m(v()-.5,v()-.5,v()-.5).normalize().multiplyScalar(xe).add(se),new q(v()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),w.push({id:_,name:a,line:de,position:se})}g.add(V(1400,()=>{const _=(v()-.5)*120,a=(v()-.5)*22*(.4+v()),U=(v()-.5)*4;return[new m(_,U,a),new q().setHSL(.6+v()*.1,.3,.35+v()*.3)]},.8)),ne.orion=g,oe.orion=w}{const g=new $,z=4;g.add(V(9e3,w=>{const _=w%z,a=Math.pow(v(),.55)*25,U=_/z*Math.PI*2+Math.log(1+a)*1.9+(v()-.5)*(.5+4/(a+2)),K=(v()-.5)*(a<4?2.2:.7),B=a<4,F=B?new q("#ffd9a0"):new q().setHSL(.58+v()*.06,.45,.45+v()*.35);return[new m(Math.cos(U)*a,K,Math.sin(U)*a),F.multiplyScalar(B?.8:.6)]},.55)),g.add(N("#fff0c8",7,new m));const S=new m(13,0,0);g.add(N("#ffe39a",1.2,S)),ne.galaxy=g,oe.galaxy=[{id:"center",name:c("은하 중심(궁수자리 A*)"),line:c("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new m},{id:"sun-gal",name:c("태양은 여기"),line:c("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:S}]}{const g=new $,z=1/1e5,S=(B,F,Z,de,se)=>V(de,xe=>{const re=Math.pow(v(),.6)*F,De=xe%2*Math.PI+Math.log(1+re*3)*2.2+(v()-.5)*.9,Q=new m(Math.cos(De)*re,(v()-.5)*F*.05,Math.sin(De)*re);Q.applyAxisAngle(new m(1,0,0),Z);const je=re<F*.18;return[Q.add(B),new q().setHSL(je?.1:se,.4,.45+v()*.3).multiplyScalar(je?.35:.22)]},.4),w=new m;g.add(S(w,2.2,0,1800,.6));const _=fe(10.68,41.27,25e5*z);g.add(S(_,4.4,1.2,3200,.1));const a=fe(23.46,30.66,273e4*z);g.add(S(a,1.6,.6,900,.62));const U=fe(80.89,-69.76,16e4*z);g.add(N("#cfd8ff",1.2,U));const K=fe(13.19,-72.83,2e5*z);g.add(N("#cfd8ff",.8,K)),ne.group=g,oe.group=[{id:"mw",name:c("우리 은하"),line:c("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:w},{id:"andromeda",name:c("안드로메다은하"),line:c("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:_},{id:"triangulum",name:c("삼각형자리은하"),line:c("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:a},{id:"lmc",name:c("대마젤란은하"),line:c("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:U}]}{const g=new $,z=6,S=(B,F,Z)=>new m(B,F,Z).multiplyScalar(z),w=S(5.1,.35,1.1),_=S(3.4,.45,.2),a=S(-1.4,-.3,-.5),U=[[S(.2,0,0),900,6.4*z*.5],[_,280,1.5*z*.5],[a,220,1.7*z*.5],[S(-2.2,1.6,2.4),120,1.1*z*.5]],K=U.reduce((B,F)=>B+F[1],0);g.add(V(K+180,B=>{let F=B;for(const[de,se,xe]of U){if(F<se)return[new m(v()-.5,(v()-.5)*.5,v()-.5).multiplyScalar(2*xe*Math.pow(v(),.5)).add(de),new q("#f3eee6").multiplyScalar(.75)];F-=se}const Z=v();return[w.clone().lerp(a,Z).add(new m((v()-.5)*.7*z,(v()-.5)*.45*z,(v()-.5)*.7*z)),new q("#e7c48a").multiplyScalar(.8)]},.5)),g.add(new y(x(new L(.95*z,20,16)),x(new W({color:"#d5e2f5",transparent:!0,opacity:.1,blending:te,depthWrite:!1}))).translateX(_.x).translateY(_.y).translateZ(_.z)),g.add(new y(x(new L(1.05*z,20,16)),x(new W({color:"#e7c48a",transparent:!0,opacity:.09,blending:te,depthWrite:!1}))).translateX(a.x).translateY(a.y).translateZ(a.z)),g.add(N("#e4b56a",1.2,w)),ne.super=g,oe.super=[{id:"localgroup",name:c("우리 은하군"),line:c("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:w},{id:"virgo-sc",name:c("처녀자리 은하단"),line:c("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:_},{id:"attractor-sc",name:c("거대 인력체"),line:c("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:a}]}{const g=new $,z=1/1e7,S=fe(187.7,12.4,54e6*z),w=fe(243,-60,2e8*z);g.add(V(5e3,a=>{const U=a%5,B=[S,w,fe(30,20,15e7*z),fe(160,-30,18e7*z),fe(300,40,14e7*z)][U],F=U===1?7:4;return[new m((v()-.5)*2,(v()-.5)*2,(v()-.5)*2).multiplyScalar(F*Math.pow(v(),.4)).add(B),new q().setHSL(.08+v()*.5,.35,.55).multiplyScalar(.8)]},.8)),g.add(N("#ffffff",.8,new m));const _=new y(x(new L(42,48,32)),x(new W({color:"#ff8a4a",transparent:!0,opacity:.08,side:tt,depthWrite:!1})));g.add(_),ne.cosmos=g,oe.cosmos=[{id:"here",name:c("우리 은하"),line:c("여기서는 점 하나예요."),position:new m},{id:"virgo",name:c("처녀자리 은하단"),line:c("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:S},{id:"attractor",name:c("거대 인력체"),line:c("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:w},{id:"cmb",name:c("가장 오래된 빛"),line:c("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new m(0,0,-42)}]}for(const g of Object.values(ne))g.visible=!1;return{groups:ne,markers:oe,dispose:()=>k.forEach(g=>g.dispose())}}const Vn="textures/",ce=Math.PI/180;function ht(k,x,M=1){return new m(Math.cos(k*ce)*Math.cos(x*ce),Math.sin(k*ce),-Math.cos(k*ce)*Math.sin(x*ce)).multiplyScalar(M)}const A=2.2,ta=Date.UTC(2e3,0,1,12),On={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},Gn={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function na(){if(typeof window>"u")return!0;const k=navigator,x=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,M=k.hardwareConcurrency??8,N=k.deviceMemory??8;return!!(x||M<=4||N<=4)}function oa(){const x=document.createElement("canvas");x.width=128,x.height=128;const M=x.getContext("2d");if(M){const N=M.createRadialGradient(64,64,0,64,64,64);N.addColorStop(0,"rgba(255,238,205,0.85)"),N.addColorStop(.3,"rgba(255,214,150,0.55)"),N.addColorStop(.45,"rgba(255,190,120,0.22)"),N.addColorStop(.7,"rgba(250,170,95,0.07)"),N.addColorStop(1,"rgba(255,160,80,0)"),M.fillStyle=N,M.fillRect(0,0,128,128)}return new Hn(x)}const aa=`
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
}`,sa=`
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
}`;function ra(k){return Math.max(.12,.16+.11*Math.log2(k/2e3))}const ia=`
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
}`,la=`
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
}`,ca=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,da=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,$n=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Xn=`
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
}`,ma=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,pa=`
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
}`,ua=`
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
}`,fa=`
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
}`,va=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,ha=`
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
}`,wa=`
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
}`,ga=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function ka(k,x){const M=na(),N=M?96:128,V=new So({antialias:!0,powerPreference:"default",alpha:!1});V.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),V.outputColorSpace=Tt,V.toneMapping=Po,V.toneMappingExposure=1.1;const I=V.domElement;I.style.display="block",I.style.width="100%",I.style.height="100%",I.style.touchAction="none",k.appendChild(I);const v=document.createElement("div");v.className="space-labels",k.appendChild(v);const ne=[];let oe=0;function g(){const e=performance.now();if(e-oe<400)return;oe=e,ne.length=0;const n=k.getBoundingClientRect();for(const o of[".explore-top",".sheet",".sky-alert"]){const s=document.querySelector(o);if(!s)continue;const i=s.getBoundingClientRect();i.width<2||i.height<2||ne.push({x:i.left-n.left,y:i.top-n.top,w:i.width,h:i.height})}}function z(e,n,o,s=22){for(const i of ne)if(e<i.x+i.w&&e+o>i.x&&n<i.y+i.h&&n+s>i.y)return!0;return!1}const S=new Co;S.background=new q("#05070d");const w=new ko(45,1,.01,2e3),_=[],a=e=>(_.push(e),e),U=new Eo,K=new Wo,B=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),F=new Map,Z=new Map,de=[],se=new Set;let xe=!1,re=0;const De=(e,n)=>{const o=Z.get(e);if(o){Z.delete(e);for(const s of o)s(n)}},Q=(e,n=!0)=>{const o=F.get(e);if(o)return o;re+=1;const s=U.load(Vn+e,()=>{De(e,s),re-=1,re===0&&x.onReady?.()},void 0,()=>{De(e,s),re-=1,re===0&&x.onReady?.()});return s.colorSpace=n?Tt:Bo,s.anisotropy=M?4:8,F.set(e,s),a(s)},je=e=>{F.has(e)||se.has(e)||(se.add(e),K.load(Vn+e,n=>{se.delete(e);const o=new Xo;o.image=n,o.colorSpace=Tt,o.anisotropy=M?4:8,o.needsUpdate=!0,a(o),F.set(e,o),De(e,o)},void 0,()=>{se.delete(e)}))},wt=()=>{if(!xe){xe=!0;for(const e of de)je(e)}},Ve=(e,n)=>{if(B.has(e)){n(Q(e));return}const o=F.get(e);if(o){n(o);return}const s=Z.get(e)??[];s.push(n),Z.set(e,s),de.includes(e)||(de.push(e),xe&&je(e))},It=new y(a(new L(900,48,24)),a(new W({map:Q("milkyway.webp"),side:tt,depthWrite:!1})));It.rotation.set(63*ce,0,0),S.add(It),S.add(new No(16777215,.14));const _t=new To(16777215,1.6,0,0);_t.decay=0,S.add(_t);const me=new $;S.add(me);const ve=new Map,he=new Map,Ut=new Map,gt=[],nt=new Map;let Ft=null,yt=null;const Oe=new Map,ot=new Map,xt=new Map,be=new Map;let b=null,Bt=0,Le=null;const bt=[],jt=[],Vt=[],Ot=[],Gt=[];let Me=Date.now(),Ge=!0,$t=null;function at(e,n,o,s){const i=On[o]??[.7,.7,.7,.06],p=Gn[o],f=new q(n),h=p?.relief??0,t=a(new le({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new pt(p?.texel?.[0]??1/1024,p?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:h*.35},gain:{value:(p?.gain??1.9)*.6},base:{value:new m(f.r,f.g,f.b)},glow:{value:new m(i[0],i[1],i[2])},atmo:{value:Math.min(i[3]*2.2,.85)},ringShadow:{value:s?1:0},ringMap:{value:null},ringInner:{value:s?.inner??1},ringOuter:{value:s?.outer??2},ringCenter:{value:new m},ringNormal:{value:new m(0,1,0)}},vertexShader:aa,fragmentShader:sa}));return e&&Ve(e,r=>{t.uniforms.dayMap.value=r,t.uniforms.useMap.value=1,h>0&&(t.uniforms.bumpMap.value=r,t.uniforms.useBump.value=1)}),s&&Ve("saturn-ring.webp",r=>{t.uniforms.ringMap.value=r}),t}function Kn(e,n,o){const s=Gn[o],i=s?.tint??On[o]?.slice(0,3);if(!i||M)return;const p=Math.min(s?.inner??.12,.5)*.55,f=Math.min(s?.outer??.05,.2)*.9,h=new m(i[0],i[1],i[2]),t=Math.sqrt(1-1/(1.045*1.045)),r=(l,u,C,j)=>new y(a(new L(n*l,M?24:32,M?16:24)),a(new le({uniforms:{tint:{value:h},power:{value:C},strength:{value:j},edge:{value:t}},vertexShader:$n,fragmentShader:Xn,side:u,transparent:!0,blending:te,depthWrite:!1})));e.add(r(1.045,tt,2.7,p),r(1.16,In,3.4,f))}function Jn(e,n){const o=a(new le({uniforms:{poleN:{value:ht(80.7,-72.7,1).normalize()},poleS:{value:ht(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:ma,fragmentShader:pa,transparent:!0,blending:te,depthWrite:!1})),s=new y(a(new L(n*1.022,M?64:96,M?48:64)),o);s.renderOrder=1,e.add(s),Ot.push(o)}function Zn(e,n){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([s,i,p,f,h],t)=>{const r=ht(s,i,1).normalize(),l=new m(0,1,0).cross(r).normalize(),u=new m().crossVectors(r,l).normalize(),C=l.multiplyScalar(Math.cos(h)).addScaledVector(u,Math.sin(h)).normalize(),j=[];for(let G=0;G<=16;G+=1){const ye=G/16,ae=(ye-.5)*p,Y=Math.sin(ye*Math.PI)*f;j.push(new m().copy(r).multiplyScalar(Math.cos(ae)).addScaledVector(C,Math.sin(ae)).normalize().multiplyScalar(n*(.985+Y)))}const O=a(new le({uniforms:{uTime:{value:0},seed:{value:t*.37+.11}},vertexShader:ua,fragmentShader:fa,transparent:!0,blending:te,side:Ce,depthWrite:!1})),pe=new y(a(new jo(new Vo(j),64,n*.022,8,!1)),O);pe.raycast=()=>{},e.add(pe),Gt.push(O)})}function Xt(e,n,o=""){const s=document.createElement("button");s.type="button",s.className="space-label"+o,s.textContent=n,s.addEventListener("click",()=>x.onPick?.(e)),v.appendChild(s),Ut.set(e,s)}const Ht=a(new le({uniforms:{map:{value:Q("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),$e=new m,Qn=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],Yt=new Map;let ze=null;const eo={moon:"earth",...Object.fromEntries(Un.map(e=>[e.id,e.parent]))};function qt(e,n){const o=eo[e];if(ze===null||!o)return ft(e,n);const s=ft(o,n),i=ft(e,ze),p=ft(o,ze);return{x:s.x+i.x-p.x,y:s.y+i.y-p.y,z:s.z+i.z-p.z}}function Xe(e){for(const[n,o]of he){if(n==="sun")continue;const s=qt(n,e);o.position.set(s.x*A,s.y*A,s.z*A)}for(const[n,o]of Oe){const s=qt(n,e);o.position.set(s.x*A,s.y*A,s.z*A)}if(Le){$e.copy(Le.holder.position);const n=$e.length()||1;Le.tail.visible=n/A<8,$e.multiplyScalar(1/n),Le.tail.quaternion.setFromUnitVectors(new m(0,1,0),$e),Le.tail.position.copy($e).multiplyScalar(.16*A)}}const Ae=new m(1,0,0),to=a(new le({uniforms:{dayMap:{value:Q("earth-day.webp")},nightMap:{value:Q("earth-night.webp")},normalMap:{value:Q("earth-normal.webp",!1)},specMap:{value:Q("earth-spec.webp",!1)},texel:{value:new pt(1/2048,1/1024)},sunDir:{value:Ae}},vertexShader:ia,fragmentShader:la}));function no(e){const n=new $,o=new y(a(new L(e,M?96:128,64)),to);o.name="earth",n.add(o);const s=new y(a(new L(e*1.012,80,48)),a(new Oo({map:Q("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));n.add(s),Ft=s;const i=new y(a(new L(e*1.06,64,48)),a(new le({uniforms:{sunDir:{value:Ae}},vertexShader:`
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
            }`,side:tt,transparent:!0,blending:te,depthWrite:!1})));n.add(i);const p=new y(a(new L(e*1.15,M?24:32,M?16:24)),a(new le({uniforms:{tint:{value:new m(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:$n,fragmentShader:Xn,side:In,transparent:!0,blending:te,depthWrite:!1})));return n.add(p),ve.set("earth",o),n}function Kt(e,n,o){for(const s of Qe(e).sites??[]){const i=new y(a(new L(o*.018,12,8)),a(new W({color:"#3182f6"})));i.position.copy(ht(s.lat,s.lon,o*1.004)),n.add(i);const p=document.createElement("div");p.className="space-site",p.textContent=s.name,v.appendChild(p),gt.push({mesh:i,site:s,el:p,parent:e})}}let He=null;for(const e of Ho){if(e.id==="moon")continue;const n=new $;if(he.set(e.id,n),me.add(n),e.id==="sun"){const o=.26*A,s=new y(a(new L(o,M?96:128,M?64:80)),Ht);s.name="sun",nt.set("sun",o),n.add(s),Zn(s,o);for(const[p,f,h,t]of[[1.06,2,.95,"#ffbf78"]])n.add(new y(a(new L(o*p,M?32:48,M?24:32)),a(new le({uniforms:{color:{value:new q(t)},power:{value:f},strength:{value:h}},vertexShader:ca,fragmentShader:da,transparent:!0,blending:te,depthWrite:!1}))));ve.set("sun",s);const i=new Yn(a(new qn({map:a(oa()),blending:te,transparent:!0,depthWrite:!1,depthTest:!0,color:new q("#ffd9a0")})));i.scale.setScalar(o*3.6),n.add(i),yt=i}else{const o=Lt(e.id).radius*A;nt.set(e.id,o);let s;if(e.id==="earth"){const h=no(o);h.rotation.z=-e.tilt*ce,n.add(h),He=h,s=h.children[0]}else{const h=e.id==="saturn"?{inner:o*1.18,outer:o*2.08}:void 0;s=new y(a(new L(o,M?96:128,64)),at(e.texture,e.color,e.id,h)),s.name=e.id,s.rotation.z=-e.tilt*ce,n.add(s),ve.set(e.id,s),Kn(n,o,e.id),e.id==="jupiter"&&Jn(s,o)}if(e.axes){const[h,t,r]=e.axes;s.scale.set(1,r/h,t/h)}if(e.ring&&e.axes){const h=e.axes[0]/2,t=o*(e.ring.radius-e.ring.width/2)/h,r=o*(e.ring.radius+e.ring.width/2)/h,l=new y(a(new Be(t,Math.max(r,t*1.03),128,1)),a(new W({color:"#8b8580",side:Ce,transparent:!0,opacity:.75,depthWrite:!1})));l.rotation.x=Math.PI/2,n.add(l)}if(e.id==="saturn"){const h=o*1.18,t=o*2.08,r=new Be(h,t,160,1),l=a(new le({uniforms:{ringMap:{value:null},innerRatio:{value:h/t},planetRadius:{value:o},planetCenter:{value:new m}},vertexShader:va,fragmentShader:ha,side:Ce,transparent:!0,depthWrite:!1}));Ve("saturn-ring.webp",C=>{l.uniforms.ringMap.value=C});const u=new y(a(r),l);u.rotation.x=Math.PI/2,s.add(u),jt.push({mesh:u,parent:e.id}),Vt.push({mesh:s,material:s.material})}e.sites&&Kt(e.id,s,o);const i=Fn(e.id,.022),p=a(new Re);p.setAttribute("position",new Rt(i.positions,3)),p.setIndex(i.index),p.scale(A,A,A);const f=new y(p,a(new W({color:Lt(e.id).ribbon,transparent:!0,opacity:.5,side:Ce,depthWrite:!1})));bt.push(f),me.add(f)}Xt(e.id,e.name,e.id==="sun"?"":" is-planet")}const Jt=[];function Zt(e,n,o){let s=e==="main"?1234:98765;const i=()=>(s=s*16807%2147483647,(s-1)/2147483646),p=a(new Go(1,0)),f=new Float32Array(n*4),h=new Float32Array(n*4);for(let l=0;l<n;l+=1){let u;if(e==="main")do u=2.1+i()*1.2;while((Math.abs(u-2.5)<.03||Math.abs(u-2.82)<.03||Math.abs(u-2.95)<.02)&&i()<.85);else u=i()<.18?39.2+(i()-.5)*1.2:42+(i()-.5)*6.5;f[l*4]=u,f[l*4+1]=i()*Math.PI*2,f[l*4+2]=i()*(e==="main"?.18:.12),f[l*4+3]=i()*Math.PI*2,h[l*4]=(i()-.5)*(e==="main"?.32:.5),h[l*4+1]=i()*Math.PI*2;const C=i()**3;h[l*4+2]=(e==="main"?.0035:.009)*(.7+C*2.4),h[l*4+3]=i()}p.setAttribute("orbit",new _n(f,4)),p.setAttribute("shape",new _n(h,4));const t=a(new le({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new q(o)},uScale:{value:A}},vertexShader:wa,fragmentShader:ga})),r=new $o(p,t,n);r.frustumCulled=!1,r.raycast=()=>{},me.add(r),Jt.push({mesh:r,material:t})}Zt("main",M?1800:4200,"#9c9184"),Zt("kuiper",M?1500:3600,"#7f8b9c");for(const e of Un){const n=new $,o=new y(a(new L(e.radius*A,32,24)),at(`${e.id}.webp`,e.color,e.id));o.name=e.id,n.add(o),me.add(n),Oe.set(e.id,n),ot.set(e.id,o);const s=document.createElement("button");s.type="button",s.className="space-label is-small",s.textContent=e.name,s.addEventListener("click",()=>x.onExtra?.(e.id)),v.appendChild(s),xt.set(e.id,{el:s,parent:e.parent})}{const e=new $,n=new y(a(new L(.045*A,20,16)),a(new W({color:"#f7fbff"})));n.name="halley",e.add(n);const o=new y(a(new Ro(.04*A,.32*A,12)),a(new W({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(o),Le={holder:e,tail:o},me.add(e),Oe.set("halley",e),ot.set("halley",n);const s=Fn("halley",.022),i=a(new Re);i.setAttribute("position",new Rt(s.positions,3)),i.setIndex(s.index),i.scale(A,A,A);const p=new y(i,a(new W({color:Lt("halley").ribbon,transparent:!0,opacity:.35,side:Ce,depthWrite:!1})));bt.push(p),me.add(p);const f=document.createElement("button");f.type="button",f.className="space-label is-small",f.textContent=c("핼리 혜성"),f.addEventListener("click",()=>x.onExtra?.("halley")),v.appendChild(f),xt.set("halley",{el:f,parent:null})}for(const e of Yo){const n=qo(e),o=n.points.map(C=>new m(C.x*A,C.y*A,C.z*A)),s=a(new Re().setFromPoints(o)),i=new Do(s,a(new ut({color:e.color,transparent:!0,opacity:.95})));i.visible=!1;const p=new $,f=new y(a(new Dt(.03,.01,.01,20)),a(new W({color:"#d8dde4"})));f.rotation.x=Math.PI/2;const h=new y(a(new L(.014,12,8)),a(new W({color:"#c9ced6"})));h.position.z=-.02;const t=new y(a(new Dt(.002,.002,.09,6)),a(new W({color:"#aab3c0"})));t.rotation.z=Math.PI/2,t.position.z=-.02;const r=new y(a(new L(.035,16,12)),a(new W({color:e.color,transparent:!0,opacity:.18,blending:te,depthWrite:!1})));p.add(f,h,t,r),p.scale.setScalar(e.frame==="earth"?.8:1.3),p.position.copy(o[o.length-1]),i.add(p),(e.frame==="earth"?he.get("earth")??me:me).add(i);const u=document.createElement("div");u.className="space-site is-probe",u.textContent=e.name,v.appendChild(u),be.set(e.id,{line:i,probe:p,el:u,points:o,times:n.points.map(C=>C.t),marks:n.marks,frame:e.frame})}if(Xe(Me),He){const e=.055*A;nt.set("moon",e);const n=new y(a(new L(e,N,48)),at("moon.webp","#b8b8b8","moon"));n.name="moon";const o=new $;o.add(n),me.add(o),ve.set("moon",n),he.set("moon",o),Kt("moon",n,e),Xt("moon",c("달")," is-small"),Xe(Me)}const Ye=new $,We=new $,st=new $;Ye.add(We,st),Ye.visible=!1;let Qt="solar",ke=!1,Mt=0;const E={moon:new y,moonMat:a(new W({color:"#ffffff"})),shadow:a(new W({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new y,umbra:new y,skyCover:new y,skySun:new $,skyMoon:new $,skyMoonMat:a(new W({color:"#ffffff"}))},zt=[],en=Q("sun.webp"),tn=Q("moon.webp"),nn=new y(a(new L(.62,32,24)),a(new W({map:en})));nn.position.set(-3.3,0,0);const on=new y(a(new L(.4,32,24)),a(new W({map:Q("earth-day.webp")})));on.position.set(1.85,0,0),E.moonMat.map=tn,E.moon=new y(a(new L(.14,24,18)),E.moonMat),E.cone=new y(a(new Dt(.04,.16,.78,18)),E.shadow),E.cone.position.set(1.42,0,0),E.cone.rotation.z=Math.PI/2,E.umbra=new y(a(new Ze(.3,28)),a(new W({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),E.umbra.position.set(2.75,0,.02),We.add(nn,on,E.moon,E.cone,E.umbra);for(const[e,n]of[[c("태양"),new m(-3.3,.85,0)],[c("지구"),new m(1.85,.68,0)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,v.appendChild(o),zt.push({el:o,at:n,group:We})}const oo=new y(a(new Ze(1.35,48)),a(new W({map:en}))),ao=new y(a(new Be(1.4,1.7,48)),a(new W({color:"#f0c36a",transparent:!0,opacity:.45,side:Ce,depthWrite:!1})));E.skyCover=new y(a(new Ze(1.22,48)),a(new W({color:"#141820"}))),E.skySun.add(oo,ao,E.skyCover),E.skyMoonMat.map=tn;const so=new y(a(new Ze(.92,48)),E.skyMoonMat),an=new y(a(new Ze(1.08,48)),a(new W({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));an.position.z=.16,E.skyMoon.add(so,an),st.add(E.skySun,E.skyMoon);const qe=document.createElement("div");qe.className="space-site is-stage",v.appendChild(qe),zt.push({el:qe,at:new m(0,-1.2,0),group:We}),st.visible=!1,S.add(Ye);const Ee=new $;Ee.visible=!1,Ee.rotation.z=-Math.PI/2;const sn=[],rn=4.6,ro=e=>rn*e/696e3,ln=new y(a(new L(rn,64,40)),a(new W({map:Q("sun.webp")})));ln.position.set(-3.2,0,0),Ee.add(ln);const io=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let cn=2.4;const dn=(e,n)=>{const o=document.createElement("div");o.className="space-site",o.textContent=e,v.appendChild(o),sn.push({el:o,at:n,group:Ee})};dn(c("태양"),new m(-3.2,4.9,0));for(const[e,n]of io){const o=ro(n),s=cn+o;cn=s+o+.72;const i=Qe(e),p=e==="earth"?"earth-day.webp":i.texture,f=a(new W({color:i.color}));p&&Ve(p,t=>{f.map=t,f.color.set("#ffffff"),f.needsUpdate=!0});const h=new y(a(new L(o,32,24)),f);if(h.position.set(s,0,0),i.axes&&h.scale.set(1,i.axes[2]/i.axes[0],i.axes[1]/i.axes[0]),Ee.add(h),e==="saturn"){const t=o*1.18,r=o*2.08,l=a(new Be(t,r,96,1)),u=l.attributes.position,C=l.attributes.uv,j=new m;for(let G=0;G<u.count;G+=1)j.fromBufferAttribute(u,G),C.setXY(G,(j.length()-t)/(r-t),.5);const O=a(new W({color:"#b9b3ab",transparent:!0,opacity:.9,side:Ce,depthWrite:!1}));Ve("saturn-ring.webp",G=>{O.map=G,O.color.set("#ffffff"),O.needsUpdate=!0});const pe=new y(l,O);pe.rotation.y=Math.PI/2-.36,h.add(pe)}dn(i.name,new m(s,(e==="saturn"?o*2.08:o)+.12,0))}S.add(Ee);const we=new $;we.visible=!1;const St=[],mn=[],lo=new y(a(new L(.55,48,32)),a(new W({color:"#e0703a"})));we.add(lo);for(const[e,n]of[[1.35,.16],[2.1,.05]])we.add(new y(a(new L(.55*e,32,24)),a(new W({color:"#ff6a30",transparent:!0,opacity:n,side:tt,blending:te,depthWrite:!1}))));const pn=new y(a(new Be(2.6,5.1,96,1)),a(new W({color:"#3fbf7f",transparent:!0,opacity:.12,side:Ce,depthWrite:!1})));pn.rotation.x=Math.PI/2,we.add(pn),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,n,o,s,i],p)=>{const f=new An(a(new Re().setFromPoints(Array.from({length:128},(r,l)=>new m(Math.cos(l/128*Math.PI*2)*o*100,0,Math.sin(l/128*Math.PI*2)*o*100)))),a(new ut({color:"#8b95a1",transparent:!0,opacity:.35})));we.add(f);const h=new y(a(new L(.16*s,24,16)),at(void 0,i,"earth"));we.add(h);const t=document.createElement("button");t.type="button",t.className="space-label is-small",t.textContent=e,t.addEventListener("click",()=>x.onExtra?.(`trappist-${e}`)),v.appendChild(t),St.push({mesh:h,a:o*100,period:n,phase0:p*1.7,el:t})});const co=new An(a(new Re().setFromPoints(Array.from({length:256},(e,n)=>new m(Math.cos(n/256*Math.PI*2)*38.7,0,Math.sin(n/256*Math.PI*2)*38.7)))),a(new ut({color:"#c5b8a2",transparent:!0,opacity:.5})));we.add(co);for(const[e,n]of[["TRAPPIST-1",new m(0,1.1,0)],[c("생명가능지대(대략)"),new m(3.9,0,0)],[c("비교: 우리 수성의 궤도"),new m(0,0,38.7)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,v.appendChild(o),mn.push({el:o,at:n})}S.add(we);const Ie=Zo(a),mo=Ie.labels.map(({name:e,at:n})=>{const o=document.createElement("div");return o.className="space-site",o.textContent=e,v.appendChild(o),{el:o,at:n}});S.add(Ie.group);const ge=ea(),Pt=[];if(ge)for(const[e,n]of Object.entries(ge.groups)){S.add(n);for(const o of ge.markers[e]){const s=document.createElement("button");s.type="button",s.className="space-label",s.textContent=o.name,s.addEventListener("click",()=>{x.onMarker?.(o),D.target.copy(o.position),D.radius=Ue[e]*(o.id==="cmb"?1.4:e==="group"?.6:.42)}),v.appendChild(s),Pt.push({level:e,marker:o,el:s})}}const un=[];if(ge){const n=(p,f)=>new m(Math.cos(f*ce)*Math.cos(p*ce),Math.sin(f*ce),-Math.cos(f*ce)*Math.sin(p*ce)).multiplyScalar(140),o=[];for(const p of Object.values(Bn))for(const f of p)for(let h=0;h<f.length-1;h+=1){const t=n(f[h][0],f[h][1]),r=n(f[h+1][0],f[h+1][1]);o.push(t.x,t.y,t.z,r.x,r.y,r.z)}const s=a(new Re);s.setAttribute("position",new Rt(o,3));const i=new Lo(s,a(new ut({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));ge.groups.stars.add(i);for(const p of Ko){if(!Bn[p.id])continue;const f=document.createElement("button");f.type="button",f.className="space-label is-const",f.textContent=p.name.replace(/\(.*\)/,"").split(" · ")[0],f.addEventListener("click",()=>x.onConstellation?.(p.id)),v.appendChild(f),un.push({el:f,at:n(p.center[0],p.center[1])})}}const rt=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let R="system",_e=!1,fn=!1;const Ue={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},Ke=new m,T={theta:.6,phi:.95,radius:34},D={target:new m,radius:T.radius};let X="system",J=null,ie=null,ue=null;function it(e){if((e==="system"||e==="sizes")&&wt(),R=e,_e=!1,me.visible=e==="system",Ye.visible=e==="eclipse",Ee.visible=e==="sizes",we.visible=e==="exo",Ie.group.visible=e==="blackhole",ge)for(const[n,o]of Object.entries(ge.groups))o.visible=n===e;X="system",J=null,ie=null,ue=null,D.target.set(0,0,0),D.radius=Ue[e],e!=="system"&&(T.phi=1.1),e==="eclipse"&&(We.rotation.z=w.aspect<1?-Math.PI/2:0,T.theta=0,T.phi=ke?Math.PI/2:1.25,D.target.set(0,0,0),ke||D.target.set(-.7,0,0).applyEuler(We.rotation),D.radius=ke?6:w.aspect<1?10:7.5),e==="exo"&&(T.phi=.75),e==="blackhole"&&(T.phi=1.42),e==="sizes"&&(T.theta=0,T.phi=Math.PI/2,D.target.set(.6,-6.8,0),D.radius=19)}function vn(e){if(e!=="earth"&&wt(),_e=!1,R!=="system"&&(R="system",me.visible=!0,Ye.visible=!1,Ee.visible=!1,we.visible=!1,Ie.group.visible=!1,ge))for(const o of Object.values(ge.groups))o.visible=!1;if(X=e,ie=null,ue=null,e==="system"){J=null,D.target.set(0,0,0),D.radius=Ue.system;return}J=he.get(e)??null;const n=nt.get(e)??ra(Qe(e).km);D.radius=e==="sun"?3.2:e==="jupiter"?3.4*A:e==="saturn"?2.6*A:Math.max(n*(Qe(e).ring?6:4.2),.25)}function po(e){const n=Oe.get(e);n&&(R!=="system"&&it("system"),X="system",J=n,ie=null,ue=null,D.radius=e==="halley"?1.6:.6,Ne=performance.now())}function uo(e){ue=(e?gt.find(o=>o.parent===X&&o.site.name===e.name):void 0)?.mesh??null,ie=ue?new m:null,Ne=performance.now()}const Se=new Map;let Je=0,lt=0,Ne=0;const hn=new Ao,wn=new pt,gn=e=>{if(wt(),I.setPointerCapture(e.pointerId),_e=!1,Se.set(e.pointerId,{x:e.clientX,y:e.clientY}),lt=0,Ne=performance.now(),Se.size===2){const[n,o]=[...Se.values()];Je=Math.hypot(n.x-o.x,n.y-o.y)}},yn=e=>{const n=Se.get(e.pointerId);if(!n)return;const o=e.clientX-n.x,s=e.clientY-n.y;if(Se.set(e.pointerId,{x:e.clientX,y:e.clientY}),Ne=performance.now(),Se.size===1)lt+=Math.abs(o)+Math.abs(s),T.theta-=o*.006,T.phi=Math.min(2.9,Math.max(.2,T.phi-s*.006)),ie=null,ue=null;else if(Se.size===2){const[i,p]=[...Se.values()],f=Math.hypot(i.x-p.x,i.y-p.y);Je>0&&(D.radius=bn(D.radius*(Je/f))),Je=f,lt+=10}},ct=e=>{if(Se.delete(e.pointerId),Je=0,lt<6&&x.onPick){const n=I.getBoundingClientRect();wn.set((e.clientX-n.left)/n.width*2-1,-((e.clientY-n.top)/n.height)*2+1),hn.setFromCamera(wn,w);const s=hn.intersectObjects([...ve.values(),...ot.values()],!1)[0]?.object.name;s&&ve.has(s)?x.onPick(s):s&&ot.has(s)&&x.onExtra?.(s)}},xn=e=>{e.preventDefault(),D.radius=bn(D.radius*(e.deltaY>0?1.12:.89))};function bn(e){return R!=="system"?Math.min(Ue[R]*2.2,Math.max(Ue[R]*.15,e)):Math.min(90,Math.max(X==="system"&&!J?4:.15,e))}I.addEventListener("pointerdown",gn),I.addEventListener("pointermove",yn),I.addEventListener("pointerup",ct),I.addEventListener("pointercancel",ct),I.addEventListener("wheel",xn,{passive:!1});let Pe=null,dt=null,Ct=!matchMedia("(prefers-reduced-motion: reduce)").matches,Mn=0,zn=0;Ct&&(Pe=new Io(V),Pe.addPass(new _o(S,w)),dt=new Uo(new pt(256,256),.75,.78,.92),Pe.addPass(dt),Pe.addPass(new Fo));const P={w:1,h:1},Sn=()=>{P.w=k.clientWidth||1,P.h=k.clientHeight||1,V.setSize(P.w,P.h,!1),Pe?.setSize(P.w,P.h),dt?.resolution.set(P.w/2,P.h/2),w.aspect=P.w/P.h,w.updateProjectionMatrix()};Sn();const Pn=new ResizeObserver(Sn);Pn.observe(k);let Cn=!0;const kn=new IntersectionObserver(e=>{Cn=e.some(n=>n.isIntersecting)});kn.observe(k);const d=new m,Te=new m,Fe=new m,kt=new m,fo=new m,vo=new m,ho=new m,wo=new m,En=new m,go=new m;let Et=0,Wn=performance.now(),Wt=-1e9,Nn=0;const Tn=e=>{Et=requestAnimationFrame(Tn);const n=Math.min(.1,(e-Wn)/1e3);if(Wn=e,document.hidden||!Cn)return;if(rt||(Ht.uniforms.time.value=e/1e3),!rt){for(const t of Ot)t.uniforms.time.value=e/1e3;for(const t of Gt)t.uniforms.uTime.value=e/1e3}e-Ne>3e3&&!rt&&!ie&&!fn&&!_e&&R!=="eclipse"&&R!=="sizes"&&(T.theta+=n*(X==="system"?.03:.08)),Ft?.rotateY(n*.01);for(const[t,r]of ve){if(t==="earth"||t==="moon"||ue&&t===X)continue;const l=Qe(t).spinHours;rt||r.rotateY(n*(t==="sun"?.02:l?.12*(24/l)*.25:.12))}yt&&(yt.visible=w.position.length()>4);for(const t of Jt)t.material.uniforms.uDays.value=(Me-ta)/864e5,t.material.uniforms.uTime.value=e/1e3;for(const t of jt){const r=ve.get(t.parent);r&&t.mesh.material.uniforms.planetCenter.value.copy(r.getWorldPosition(d))}for(const t of Vt)t.mesh.getWorldPosition(d),t.material.uniforms.ringCenter.value.copy(d),t.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(t.mesh.matrixWorld).normalize();if(Ge&&e-Nn>1e3&&(Nn=e,Me=Date.now(),Xe(Me)),b){const t=be.get(b.id),r=t.points.length,l=t.times[r-1],u=(t.frame==="earth"?6:25)*864e5,j=t.marks.some(H=>H.at!==void 0&&H.body&&H.body!=="earth"&&Math.abs(b.sim-H.at)<u)?"slow":b.sim>=b.fastFrom?"fast":"normal",O=j==="slow"?Math.min(b.base,2*u/3):b.base*(j==="fast"?b.fast:1);b.sim=Math.min(l,b.sim+O*Math.min(n,.1)),t.frame==="sun"?ze=(ze??b.sim)+Math.min(n,.1)*.15*864e5:ze=null,b.pace=j;const pe=(b.sim-t.times[0])/(l-t.times[0]||1);let G=0,ye=r-1;for(;ye-G>1;){const H=G+ye>>1;t.times[H]<=b.sim?G=H:ye=H}const ae=t.times[ye]-t.times[G],Y=G+(ae>0?(b.sim-t.times[G])/ae:0),ee=Math.max(0,Math.min(r-2,Math.floor(Y))),Rn=Y-ee;t.probe.position.lerpVectors(t.points[ee],t.points[ee+1],Rn),Bt=Y,t.probe.lookAt(t.line.localToWorld(t.points[Math.min(r-1,ee+2)].clone())),t.line.geometry.setDrawRange(0,ee+2);const Nt=t.times[ee]+(t.times[ee+1]-t.times[ee])*Rn;Ge=!1,Me=Nt,Xe(Nt);let mt=0;for(let H=0;H<t.marks.length;H+=1){const Dn=t.marks[H],yo=Dn.at??t.times[Math.min(r-1,Dn.index)];b.sim>=yo-u&&(mt=H)}if((mt!==b.mark||e-b.lastPing>250||b.sim>=l&&!b.done)&&(b.mark=mt,b.lastPing=e,b.sim>=l&&(b.done=!0),x.onFlight?.({id:b.id,mark:t.marks[mt],progress:pe,time:Nt,done:b.done,pace:b.pace})),b.done){const H=t.frame==="earth";b=null,ze=null,Ge=!0,J=H?he.get("earth")??null:null,H||D.target.set(0,0,0),D.radius=H?4.2:72,T.phi=H?.7:.45}}if(J&&D.target.copy(J.getWorldPosition(d)),b){const t=be.get(b.id);let r=null,l=1/0;for(const C of t.marks){if(!C.body||C.body==="earth"||C.body==="far")continue;const j=Math.abs(C.index-Bt);j<14&&j<l&&(r=C,l=j)}const u=r?he.get(r.body):void 0;if(u){const C=u.getWorldPosition(ho).add(t.probe.getWorldPosition(wo)).multiplyScalar(.5);D.target.copy(C),D.radius=t.frame==="earth"?1.6:4.2}else D.radius=t.frame==="earth"?1.5:2.8}if(Ke.lerp(D.target,1-Math.pow(.002,n)),T.radius+=(D.radius-T.radius)*(1-Math.pow(.004,n)),ie&&ue){const t=ve.get(X)?.getWorldPosition(En)??En.set(0,0,0);ie.copy(ue.getWorldPosition(go).sub(t).normalize());const r=Math.atan2(ie.x,ie.z),l=Math.acos(Math.max(-1,Math.min(1,ie.y)));let u=r-T.theta;u=Math.atan2(Math.sin(u),Math.cos(u)),T.theta+=u*(1-Math.pow(.01,n)),T.phi+=(l-T.phi)*(1-Math.pow(.01,n))}if(R==="blackhole"&&Ie.update(e/1e3,w),R==="exo"){const t=e/1e3;for(const r of St){const l=r.phase0+t/r.period*Math.PI*2;r.mesh.position.set(Math.cos(l)*r.a,0,Math.sin(l)*r.a)}}if(R==="eclipse"){Mt=(Mt+n*.18)%1;const t=Math.sin(Mt*Math.PI*2),r=Math.abs(t)<.22,l=Math.max(0,1-Math.abs(t)/.9),u=Qt==="lunar";if(We.visible=!ke,st.visible=ke,E.skySun.visible=!u,E.skyMoon.visible=u,ke)u?(E.skyMoon.position.set(t*1.7,0,.08),E.skyMoonMat.color.set("#f2f2f2").lerp(new q("#c47462"),u?l:0)):E.skyCover.position.set(t*1.7,0,.08);else{E.moon.position.set(u?2.75:1.05,t*.55,0),E.cone.visible=!u,E.umbra.visible=u,E.shadow.opacity=r?.42:.08,E.umbra.material.opacity=r?.42:.08,E.moonMat.color.set("#ffffff").lerp(new q("#c47462"),u?l:0);const C=r?c("개기"):Math.abs(t)<.6?c("부분"):u?c("반영"):"";qe.textContent!==C&&(qe.textContent=C)}}if(w.position.set(Ke.x+T.radius*Math.sin(T.phi)*Math.sin(T.theta),Ke.y+T.radius*Math.cos(T.phi),Ke.z+T.radius*Math.sin(T.phi)*Math.cos(T.theta)),w.lookAt(Ke),He&&(He.getWorldPosition(d),Ae.copy(d).multiplyScalar(-1).normalize(),e-Wt>500&&!(b&&be.get(b.id)?.frame==="sun"))){Wt=e;const t=Jo(new Date(Me)),r=Math.atan2(t.y,t.x),l=Math.atan2(-Ae.z,Ae.x),u=He.children[0];u.rotation.y=l-r}Pe&&Ct&&R!=="blackhole"&&(R!=="system"||X==="system"||X==="sun")&&Pe?(Pe.render(n),Mn+=1,zn+=n,Mn===90&&zn/90>.034&&(Ct=!1)):V.render(S,w),w.getWorldDirection(Te),g();const i=[];for(const t of Qn){const r=Ut.get(t),l=he.get(t);if(!r||!l)continue;l.getWorldPosition(d);const u=Fe.copy(d).sub(w.position).dot(Te)>0,C=X==="system"&&R==="system"&&(!J||b!==null),j=X==="earth"||X==="moon"||b!==null&&be.get(b.id)?.frame==="earth";let O=u&&(t==="moon"?R==="system"&&j:C||j&&t==="earth"&&b!==null);d.project(w);const pe=(d.x+1)/2*P.w;let G=pe;const ye=(1-d.y)/2*P.h+10;if(O){let ae=Yt.get(t)??0;ae||(r.style.display="block",ae=r.offsetWidth||40,Yt.set(t,ae)),G=Math.min(Math.max(pe,ae/2+4),Math.max(ae/2+4,P.w-ae/2-4));const Y={x:G-ae/2,y:ye,w:ae,h:22};z(Y.x,Y.y,Y.w,Y.h)||i.some(ee=>Y.x<ee.x+ee.w+4&&Y.x+Y.w+4>ee.x&&Y.y<ee.y+ee.h&&Y.y+Y.h>ee.y)?O=!1:i.push(Y)}r.style.display=O?"block":"none",O&&(r.style.transform=`translate(${G}px, ${ye}px) translate(-50%, 0)`)}const p=R==="system",f=X!=="system"&&X!=="jupiter"&&X!=="saturn",h=J!==null&&(b===null?J===he.get("earth"):be.get(b.id)?.frame==="earth");for(const t of bt)t.visible=!f&&!h;for(const[t,r]of xt){const l=Oe.get(t),u=r.parent?he.get(r.parent)===J:X==="system"&&(!J||J===l),C=J===l||u;l.getWorldPosition(d);const j=Fe.copy(d).sub(w.position).dot(Te)>0,O=p&&j&&C;d.project(w),r.el.style.display=O?"block":"none",O&&(r.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h+8}px) translate(-50%, 0)`)}for(const[t,r]of be){const l=p&&$t===t;if(r.line.visible=l,!l){r.el.style.display="none";continue}r.probe.getWorldPosition(d);const u=Fe.copy(d).sub(w.position).dot(Te)>0;d.y+=0,d.project(w),r.el.style.display=u?"block":"none",u&&(r.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(10px, -50%)`)}for(const t of un){if(R!=="stars"){t.el.style.display="none";continue}d.copy(t.at);const r=Fe.copy(d).sub(w.position).dot(Te)>0;d.project(w);const l=r&&Math.abs(d.x)<1&&Math.abs(d.y)<1;t.el.style.display=l?"block":"none",l&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(-50%, -50%)`)}for(const t of Pt){if(!(t.level===R)){t.el.style.display="none";continue}d.copy(t.marker.position);const l=Fe.copy(d).sub(w.position).dot(Te)>0;d.project(w),t.el.style.display=l?"block":"none",l&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h+8}px) translate(-50%, 0)`)}for(const t of St){if(R!=="exo"){t.el.style.display="none";continue}t.mesh.getWorldPosition(d);const r=Fe.copy(d).sub(w.position).dot(Te)>0;d.project(w),t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h+8}px) translate(-50%, 0)`)}for(const t of mo){if(R!=="blackhole"){t.el.style.display="none";continue}d.copy(t.at),Ie.group.localToWorld(d),d.project(w);const r=d.z<1&&Math.abs(d.x)<1.05&&Math.abs(d.y)<1.05;t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(-50%, -100%)`)}for(const t of mn){if(R!=="exo"){t.el.style.display="none";continue}d.copy(t.at).project(w);const r=d.z<1&&Math.abs(d.x)<1.05&&Math.abs(d.y)<1.05;t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(-50%, -100%)`)}for(const[t,r]of[[zt,R==="eclipse"&&!ke],[sn,R==="sizes"]])for(const l of t){if(!r){l.el.style.display="none";continue}d.copy(l.at).applyMatrix4(l.group.matrixWorld).project(w);let u=d.z<1&&Math.abs(d.x)<1.1&&Math.abs(d.y)<1.1;const C=(d.x+1)/2*P.w,j=(1-d.y)/2*P.h,O=l.el.offsetWidth||44;u&&z(C-O/2,j-11,O,22)&&(u=!1),l.el.style.display=u?"block":"none";const pe=l.group.rotation.z!==0;u&&(l.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) ${pe?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const t of gt){t.mesh.getWorldPosition(d);const r=ve.get(t.parent);r?r.getWorldPosition(kt):kt.set(0,0,0);let u=fo.copy(d).sub(kt).normalize().dot(vo.copy(w.position).sub(d).normalize())>.15&&R==="system"&&X===t.parent;d.project(w),u&&z((d.x+1)/2*P.w+8,(1-d.y)/2*P.h-11,90)&&(u=!1),t.el.style.display=u?"block":"none",u&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(8px, -50%)`)}};return Et=requestAnimationFrame(Tn),re===0&&x.onReady?.(),{focus:vn,setLevel:it,setPaused:e=>{fn=e},focusMarker:e=>{const n=Pt.find(o=>o.level===R&&o.marker.id===e);n&&(D.target.copy(n.marker.position),D.radius=Ue[R]*(e==="cmb"?1.4:R==="group"?.6:.42),Ne=performance.now())},showSite:uo,focusExtra:po,setEclipse:(e,n)=>{Qt=e,ke=n,it("eclipse")},setHemisphere:e=>{X!=="earth"&&vn("earth");const n=Ae.clone().multiplyScalar(e==="day"?1:-1);T.theta=Math.atan2(n.x,n.z),T.phi=Math.min(2.6,Math.max(.5,Math.acos(n.y))),ie=null,ue=null,_e=!0},setTime:e=>{Ge=e===null,Me=e??Date.now(),Xe(Me),Wt=-1e9},setVoyage:e=>{if($t=e,!e){b&&(b=null,Ge=!0),ze=null;for(const r of be.values())r.line.geometry.setDrawRange(0,1/0);return}R!=="system"&&it("system"),ze=null;const n=be.get(e);n.line.geometry.setDrawRange(0,2),X="system",ie=null,ue=null,_e=!1,J=n.probe;const o=n.frame==="earth";D.radius=o?1.3:2.8,T.phi=o?.75:1;const s=Math.max(...n.marks.filter(r=>r.at!==void 0&&r.body!=="earth").map(r=>r.at),n.times[0]+864e5),i=n.times[0],p=n.times[n.times.length-1],f=(s-i)/(o?20:24),h=n.frame==="earth"?p:s+60*864e5,t=p>h?(p-h)/4/f:1;b={id:e,sim:i,base:f,fastFrom:h,fast:t,mark:-1,done:!1,lastPing:0,pace:"normal"},Ne=performance.now()},dispose:()=>{ge?.dispose(),Pe?.dispose(),dt?.dispose(),cancelAnimationFrame(Et),Pn.disconnect(),kn.disconnect(),I.removeEventListener("pointerdown",gn),I.removeEventListener("pointermove",yn),I.removeEventListener("pointerup",ct),I.removeEventListener("pointercancel",ct),I.removeEventListener("wheel",xn),S.traverse(e=>{const n=e.material;Array.isArray(n)&&n.forEach(o=>o.dispose())}),_.forEach(e=>e.dispose()),V.dispose(),I.remove(),v.remove()}}}export{ka as createSpace};
