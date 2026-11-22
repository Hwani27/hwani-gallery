import{t as c,a as yo}from"./index-2zEEHiFt.js";import{G as $,M as y,S as A,a as E,b as le,A as te,D as Ce,V as m,R as Be,P as xo,B as et,C as Xn,c as Hn,d as Yn,e as ee,f as Te,g as Ln,h as bo,i as Mo,W as zo,j as Wt,k as So,l as Po,m as Co,T as ko,I as Eo,n as Wo,o as No,p as mt,F as Nt,q as To,L as Ro,r as pt,s as Tt,t as Je,u as An,v as Lo,w as Ao,E as Do,x as Io,U as _o,O as Uo,N as Fo,y as Bo,z as jo,H as Vo,J as Dn,K as Oo,Q as In,X as Go,Y as $o}from"./three-DoRBX46D.js";import{af as _n,ag as Xo,ah as Rt,ai as Un,aj as Ho,ak as Yo,al as Ze,C as qo,am as Ko,an as ut}from"./App-C2ALAlfN.js";import{C as Fn}from"./sky-BzEpatju.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";import"./audio-GfXGpHcZ.js";const Bn=`
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
`,ft=3,Lt=9;function Jo(C){const x=new $;x.visible=!1,x.rotation.z=.1;const M=new y(C(new A(1,48,32)),C(new E({color:"#000000"})));M.renderOrder=0,x.add(M);const W=C(new le({uniforms:{uTime:{value:0},uCam:{value:new m}},transparent:!0,depthWrite:!1,side:Ce,blending:te,vertexShader:`
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
        ${Bn}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${ft.toFixed(1)}) / ${(Lt-ft).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${ft.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),V=new y(C(new Be(ft,Lt,256,8)),W);V.rotation.x=-Math.PI/2,V.renderOrder=1,x.add(V);const I=C(new le({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:te,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${Bn}
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
      `})),f=new y(C(new xo(8,8)),I);f.renderOrder=2,x.add(f);const ne=[{name:c("궁수자리 A*"),at:new m(0,3.6,0)},{name:c("사건의 지평선"),at:new m(0,-2.9,0)},{name:c("강착 원반"),at:new m(Lt-1.2,0,0)}],oe=new m;return{group:x,labels:ne,update(g,z){W.uniforms.uTime.value=g,I.uniforms.uTime.value=g,z.getWorldPosition(oe),W.uniforms.uCam.value.copy(oe),f.lookAt(oe)}}}const Qe=Math.PI/180;function fe(C,x,M){return new m(Math.cos(x*Qe)*Math.cos(C*Qe),Math.sin(x*Qe),-Math.cos(x*Qe)*Math.sin(C*Qe)).multiplyScalar(M)}function Zo(){const x=document.createElement("canvas");x.width=64,x.height=64;const M=x.getContext("2d");if(M){const W=M.createRadialGradient(32,32,0,32,32,32);W.addColorStop(0,"rgba(255,255,255,1)"),W.addColorStop(.25,"rgba(255,255,255,0.75)"),W.addColorStop(1,"rgba(255,255,255,0)"),M.fillStyle=W,M.fillRect(0,0,64,64)}return new Xn(x)}function Qo(){const C=[],x=g=>(C.push(g),g),M=x(Zo());function W(g,z,S){const h=new Hn(x(new Yn({map:M,color:new ee(g),transparent:!0,depthWrite:!1,blending:te})));return h.scale.setScalar(z),h.position.copy(S),h}function V(g,z,S){const h=new Float32Array(g*3),_=new Float32Array(g*3);for(let U=0;U<g;U+=1){const[q,B]=z(U);h.set([q.x,q.y,q.z],U*3),_.set([B.r,B.g,B.b],U*3)}const a=x(new Te);return a.setAttribute("position",new Ln(h,3)),a.setAttribute("color",new Ln(_,3)),new bo(a,x(new Mo({size:S,map:M,vertexColors:!0,transparent:!0,depthWrite:!1,blending:te,sizeAttenuation:!0})))}let I=7;const f=()=>(I=I*16807%2147483647,(I-1)/2147483646),ne={},oe={};{const g=new $,z=2.6,S=[["alphacen",c("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",c("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",c("바너드별"),269.45,4.69,5.96,"#ffb27a",c("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",c("울프 359"),164.12,7.01,7.86,"#ff9a6a",c("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",c("시리우스"),101.29,-16.72,8.6,"#cfe0ff",c("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",c("로스 154"),282.46,-23.84,9.69,"#ffa070",c("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",c("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",c("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",c("백조자리 61"),316.7,38.75,11.4,"#ffc58a",c("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",c("프로키온"),114.83,5.22,11.46,"#fff3d6",c("작은개자리의 밝은 별이에요.")],["epsind",c("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",c("남쪽 하늘의 가까운 별이에요.")],["taucet",c("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",c("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];g.add(W("#ffe39a",3.2,new m));const h=[{id:"sun-star",name:c("태양"),line:c("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new m}];for(const[_,a,U,q,B,F,J]of S){const de=fe(U,q,B*z);g.add(W(F,2.4,de)),h.push({id:_,name:a,line:yo("{0} 거리 약 {1}광년.",J,B),position:de})}g.add(V(500,()=>[new m(f()-.5,f()-.5,f()-.5).normalize().multiplyScalar(60+f()*30),new ee().setHSL(.1,.3,.5+f()*.4)],.9)),ne.stars=g,oe.stars=h}{const g=new $,z=1/40,S=[["pleiades",c("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,c("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",c("베텔게우스"),88.79,7.41,548,"#ffab6e",3,c("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",c("리겔"),78.63,-8.2,860,"#cfe0ff",3,c("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",c("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,c("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",c("데네브"),310.36,45.28,2600,"#e6eeff",3,c("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];g.add(W("#ffe39a",1.6,new m));const h=[{id:"sun-orion",name:c("태양"),line:c("우리은하의 오리온 팔 안쪽에 있어요."),position:new m}];for(const[_,a,U,q,B,F,J,de]of S){const se=fe(U,q,B*z);g.add(W(F,J,se)),_==="orionneb"&&g.add(V(260,()=>{const xe=Math.pow(f(),.6)*5;return[new m(f()-.5,f()-.5,f()-.5).normalize().multiplyScalar(xe).add(se),new ee(f()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),h.push({id:_,name:a,line:de,position:se})}g.add(V(1400,()=>{const _=(f()-.5)*120,a=(f()-.5)*22*(.4+f()),U=(f()-.5)*4;return[new m(_,U,a),new ee().setHSL(.6+f()*.1,.3,.35+f()*.3)]},.8)),ne.orion=g,oe.orion=h}{const g=new $,z=4;g.add(V(9e3,h=>{const _=h%z,a=Math.pow(f(),.55)*25,U=_/z*Math.PI*2+Math.log(1+a)*1.9+(f()-.5)*(.5+4/(a+2)),q=(f()-.5)*(a<4?2.2:.7),B=a<4,F=B?new ee("#ffd9a0"):new ee().setHSL(.58+f()*.06,.45,.45+f()*.35);return[new m(Math.cos(U)*a,q,Math.sin(U)*a),F.multiplyScalar(B?.8:.6)]},.55)),g.add(W("#fff0c8",7,new m));const S=new m(13,0,0);g.add(W("#ffe39a",1.2,S)),ne.galaxy=g,oe.galaxy=[{id:"center",name:c("은하 중심(궁수자리 A*)"),line:c("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new m},{id:"sun-gal",name:c("태양은 여기"),line:c("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:S}]}{const g=new $,z=1/1e5,S=(B,F,J,de,se)=>V(de,xe=>{const re=Math.pow(f(),.6)*F,Re=xe%2*Math.PI+Math.log(1+re*3)*2.2+(f()-.5)*.9,Z=new m(Math.cos(Re)*re,(f()-.5)*F*.05,Math.sin(Re)*re);Z.applyAxisAngle(new m(1,0,0),J);const je=re<F*.18;return[Z.add(B),new ee().setHSL(je?.1:se,.4,.45+f()*.3).multiplyScalar(je?.35:.22)]},.4),h=new m;g.add(S(h,2.2,0,1800,.6));const _=fe(10.68,41.27,25e5*z);g.add(S(_,4.4,1.2,3200,.1));const a=fe(23.46,30.66,273e4*z);g.add(S(a,1.6,.6,900,.62));const U=fe(80.89,-69.76,16e4*z);g.add(W("#cfd8ff",1.2,U));const q=fe(13.19,-72.83,2e5*z);g.add(W("#cfd8ff",.8,q)),ne.group=g,oe.group=[{id:"mw",name:c("우리 은하"),line:c("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:h},{id:"andromeda",name:c("안드로메다은하"),line:c("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:_},{id:"triangulum",name:c("삼각형자리은하"),line:c("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:a},{id:"lmc",name:c("대마젤란은하"),line:c("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:U}]}{const g=new $,z=6,S=(B,F,J)=>new m(B,F,J).multiplyScalar(z),h=S(5.1,.35,1.1),_=S(3.4,.45,.2),a=S(-1.4,-.3,-.5),U=[[S(.2,0,0),900,6.4*z*.5],[_,280,1.5*z*.5],[a,220,1.7*z*.5],[S(-2.2,1.6,2.4),120,1.1*z*.5]],q=U.reduce((B,F)=>B+F[1],0);g.add(V(q+180,B=>{let F=B;for(const[de,se,xe]of U){if(F<se)return[new m(f()-.5,(f()-.5)*.5,f()-.5).multiplyScalar(2*xe*Math.pow(f(),.5)).add(de),new ee("#f3eee6").multiplyScalar(.75)];F-=se}const J=f();return[h.clone().lerp(a,J).add(new m((f()-.5)*.7*z,(f()-.5)*.45*z,(f()-.5)*.7*z)),new ee("#e7c48a").multiplyScalar(.8)]},.5)),g.add(new y(x(new A(.95*z,20,16)),x(new E({color:"#d5e2f5",transparent:!0,opacity:.1,blending:te,depthWrite:!1}))).translateX(_.x).translateY(_.y).translateZ(_.z)),g.add(new y(x(new A(1.05*z,20,16)),x(new E({color:"#e7c48a",transparent:!0,opacity:.09,blending:te,depthWrite:!1}))).translateX(a.x).translateY(a.y).translateZ(a.z)),g.add(W("#e4b56a",1.2,h)),ne.super=g,oe.super=[{id:"localgroup",name:c("우리 은하군"),line:c("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:h},{id:"virgo-sc",name:c("처녀자리 은하단"),line:c("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:_},{id:"attractor-sc",name:c("거대 인력체"),line:c("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:a}]}{const g=new $,z=1/1e7,S=fe(187.7,12.4,54e6*z),h=fe(243,-60,2e8*z);g.add(V(5e3,a=>{const U=a%5,B=[S,h,fe(30,20,15e7*z),fe(160,-30,18e7*z),fe(300,40,14e7*z)][U],F=U===1?7:4;return[new m((f()-.5)*2,(f()-.5)*2,(f()-.5)*2).multiplyScalar(F*Math.pow(f(),.4)).add(B),new ee().setHSL(.08+f()*.5,.35,.55).multiplyScalar(.8)]},.8)),g.add(W("#ffffff",.8,new m));const _=new y(x(new A(42,48,32)),x(new E({color:"#ff8a4a",transparent:!0,opacity:.08,side:et,depthWrite:!1})));g.add(_),ne.cosmos=g,oe.cosmos=[{id:"here",name:c("우리 은하"),line:c("여기서는 점 하나예요."),position:new m},{id:"virgo",name:c("처녀자리 은하단"),line:c("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:S},{id:"attractor",name:c("거대 인력체"),line:c("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:h},{id:"cmb",name:c("가장 오래된 빛"),line:c("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new m(0,0,-42)}]}for(const g of Object.values(ne))g.visible=!1;return{groups:ne,markers:oe,dispose:()=>C.forEach(g=>g.dispose())}}const jn="textures/",ce=Math.PI/180;function vt(C,x,M=1){return new m(Math.cos(C*ce)*Math.cos(x*ce),Math.sin(C*ce),-Math.cos(C*ce)*Math.sin(x*ce)).multiplyScalar(M)}const D=2.2,ea=Date.UTC(2e3,0,1,12),Vn={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},On={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function ta(){if(typeof window>"u")return!0;const C=navigator,x=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,M=C.hardwareConcurrency??8,W=C.deviceMemory??8;return!!(x||M<=4||W<=4)}function na(){const x=document.createElement("canvas");x.width=128,x.height=128;const M=x.getContext("2d");if(M){const W=M.createRadialGradient(64,64,0,64,64,64);W.addColorStop(0,"rgba(255,238,205,0.85)"),W.addColorStop(.3,"rgba(255,214,150,0.55)"),W.addColorStop(.45,"rgba(255,190,120,0.22)"),W.addColorStop(.7,"rgba(250,170,95,0.07)"),W.addColorStop(1,"rgba(255,160,80,0)"),M.fillStyle=W,M.fillRect(0,0,128,128)}return new Xn(x)}const oa=`
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
}`,aa=`
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
}`;function sa(C){return Math.max(.12,.16+.11*Math.log2(C/2e3))}const ra=`
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
}`,ia=`
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
}`,la=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,ca=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,Gn=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,$n=`
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
}`,da=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,ma=`
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
}`,pa=`
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
}`,ua=`
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
}`,fa=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,va=`
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
}`,ha=`
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
}`,wa=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function Ca(C,x){const M=ta(),W=M?96:128,V=new zo({antialias:!0,powerPreference:"default",alpha:!1});V.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),V.outputColorSpace=Wt,V.toneMapping=So,V.toneMappingExposure=1.1;const I=V.domElement;I.style.display="block",I.style.width="100%",I.style.height="100%",I.style.touchAction="none",C.appendChild(I);const f=document.createElement("div");f.className="space-labels",C.appendChild(f);const ne=[];let oe=0;function g(){const e=performance.now();if(e-oe<400)return;oe=e,ne.length=0;const n=C.getBoundingClientRect();for(const o of[".explore-top",".sheet",".sky-alert"]){const s=document.querySelector(o);if(!s)continue;const i=s.getBoundingClientRect();i.width<2||i.height<2||ne.push({x:i.left-n.left,y:i.top-n.top,w:i.width,h:i.height})}}function z(e,n,o,s=22){for(const i of ne)if(e<i.x+i.w&&e+o>i.x&&n<i.y+i.h&&n+s>i.y)return!0;return!1}const S=new Po;S.background=new ee("#05070d");const h=new Co(45,1,.01,2e3),_=[],a=e=>(_.push(e),e),U=new ko,q=new Eo,B=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),F=new Map,J=new Map,de=[],se=new Set;let xe=!1,re=0;const Re=(e,n)=>{const o=J.get(e);if(o){J.delete(e);for(const s of o)s(n)}},Z=(e,n=!0)=>{const o=F.get(e);if(o)return o;re+=1;const s=U.load(jn+e,()=>{Re(e,s),re-=1,re===0&&x.onReady?.()},void 0,()=>{Re(e,s),re-=1,re===0&&x.onReady?.()});return s.colorSpace=n?Wt:Fo,s.anisotropy=M?4:8,F.set(e,s),a(s)},je=e=>{F.has(e)||se.has(e)||(se.add(e),q.load(jn+e,n=>{se.delete(e);const o=new $o;o.image=n,o.colorSpace=Wt,o.anisotropy=M?4:8,o.needsUpdate=!0,a(o),F.set(e,o),Re(e,o)},void 0,()=>{se.delete(e)}))},ht=()=>{if(!xe){xe=!0;for(const e of de)je(e)}},Ve=(e,n)=>{if(B.has(e)){n(Z(e));return}const o=F.get(e);if(o){n(o);return}const s=J.get(e)??[];s.push(n),J.set(e,s),de.includes(e)||(de.push(e),xe&&je(e))},At=new y(a(new A(900,48,24)),a(new E({map:Z("milkyway.webp"),side:et,depthWrite:!1})));At.rotation.set(63*ce,0,0),S.add(At),S.add(new Wo(16777215,.14));const Dt=new No(16777215,1.6,0,0);Dt.decay=0,S.add(Dt);const me=new $;S.add(me);const ve=new Map,he=new Map,It=new Map,wt=[],tt=new Map;let _t=null,gt=null;const Oe=new Map,nt=new Map,yt=new Map,be=new Map;let b=null,Ut=0,Le=null;const xt=[],Ft=[],Bt=[],jt=[],Vt=[];let Me=Date.now(),Ge=!0,Ot=null;function ot(e,n,o,s){const i=Vn[o]??[.7,.7,.7,.06],p=On[o],u=new ee(n),v=p?.relief??0,t=a(new le({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new mt(p?.texel?.[0]??1/1024,p?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:v*.35},gain:{value:(p?.gain??1.9)*.6},base:{value:new m(u.r,u.g,u.b)},glow:{value:new m(i[0],i[1],i[2])},atmo:{value:Math.min(i[3]*2.2,.85)},ringShadow:{value:s?1:0},ringMap:{value:null},ringInner:{value:s?.inner??1},ringOuter:{value:s?.outer??2},ringCenter:{value:new m},ringNormal:{value:new m(0,1,0)}},vertexShader:oa,fragmentShader:aa}));return e&&Ve(e,r=>{t.uniforms.dayMap.value=r,t.uniforms.useMap.value=1,v>0&&(t.uniforms.bumpMap.value=r,t.uniforms.useBump.value=1)}),s&&Ve("saturn-ring.webp",r=>{t.uniforms.ringMap.value=r}),t}function qn(e,n,o){const s=On[o],i=s?.tint??Vn[o]?.slice(0,3);if(!i||M)return;const p=Math.min(s?.inner??.12,.5)*.55,u=Math.min(s?.outer??.05,.2)*.9,v=new m(i[0],i[1],i[2]),t=Math.sqrt(1-1/(1.045*1.045)),r=(l,w,T,j)=>new y(a(new A(n*l,M?24:32,M?16:24)),a(new le({uniforms:{tint:{value:v},power:{value:T},strength:{value:j},edge:{value:t}},vertexShader:Gn,fragmentShader:$n,side:w,transparent:!0,blending:te,depthWrite:!1})));e.add(r(1.045,et,2.7,p),r(1.16,Dn,3.4,u))}function Kn(e,n){const o=a(new le({uniforms:{poleN:{value:vt(80.7,-72.7,1).normalize()},poleS:{value:vt(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:da,fragmentShader:ma,transparent:!0,blending:te,depthWrite:!1})),s=new y(a(new A(n*1.022,M?64:96,M?48:64)),o);s.renderOrder=1,e.add(s),jt.push(o)}function Jn(e,n){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([s,i,p,u,v],t)=>{const r=vt(s,i,1).normalize(),l=new m(0,1,0).cross(r).normalize(),w=new m().crossVectors(r,l).normalize(),T=l.multiplyScalar(Math.cos(v)).addScaledVector(w,Math.sin(v)).normalize(),j=[];for(let G=0;G<=16;G+=1){const ye=G/16,ae=(ye-.5)*p,Y=Math.sin(ye*Math.PI)*u;j.push(new m().copy(r).multiplyScalar(Math.cos(ae)).addScaledVector(T,Math.sin(ae)).normalize().multiplyScalar(n*(.985+Y)))}const O=a(new le({uniforms:{uTime:{value:0},seed:{value:t*.37+.11}},vertexShader:pa,fragmentShader:ua,transparent:!0,blending:te,side:Ce,depthWrite:!1})),pe=new y(a(new Bo(new jo(j),64,n*.022,8,!1)),O);pe.raycast=()=>{},e.add(pe),Vt.push(O)})}function Gt(e,n,o=""){const s=document.createElement("button");s.type="button",s.className="space-label"+o,s.textContent=n,s.addEventListener("click",()=>x.onPick?.(e)),f.appendChild(s),It.set(e,s)}const $t=a(new le({uniforms:{map:{value:Z("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),$e=new m,Zn=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],Xt=new Map;let ze=null;const Qn={moon:"earth",...Object.fromEntries(_n.map(e=>[e.id,e.parent]))};function Ht(e,n){const o=Qn[e];if(ze===null||!o)return ut(e,n);const s=ut(o,n),i=ut(e,ze),p=ut(o,ze);return{x:s.x+i.x-p.x,y:s.y+i.y-p.y,z:s.z+i.z-p.z}}function Xe(e){for(const[n,o]of he){if(n==="sun")continue;const s=Ht(n,e);o.position.set(s.x*D,s.y*D,s.z*D)}for(const[n,o]of Oe){const s=Ht(n,e);o.position.set(s.x*D,s.y*D,s.z*D)}if(Le){$e.copy(Le.holder.position);const n=$e.length()||1;Le.tail.visible=n/D<8,$e.multiplyScalar(1/n),Le.tail.quaternion.setFromUnitVectors(new m(0,1,0),$e),Le.tail.position.copy($e).multiplyScalar(.16*D)}}const Ae=new m(1,0,0),eo=a(new le({uniforms:{dayMap:{value:Z("earth-day.webp")},nightMap:{value:Z("earth-night.webp")},normalMap:{value:Z("earth-normal.webp",!1)},specMap:{value:Z("earth-spec.webp",!1)},texel:{value:new mt(1/2048,1/1024)},sunDir:{value:Ae}},vertexShader:ra,fragmentShader:ia}));function to(e){const n=new $,o=new y(a(new A(e,M?96:128,64)),eo);o.name="earth",n.add(o);const s=new y(a(new A(e*1.012,80,48)),a(new Vo({map:Z("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));n.add(s),_t=s;const i=new y(a(new A(e*1.06,64,48)),a(new le({uniforms:{sunDir:{value:Ae}},vertexShader:`
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
            }`,side:et,transparent:!0,blending:te,depthWrite:!1})));n.add(i);const p=new y(a(new A(e*1.15,M?24:32,M?16:24)),a(new le({uniforms:{tint:{value:new m(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:Gn,fragmentShader:$n,side:Dn,transparent:!0,blending:te,depthWrite:!1})));return n.add(p),ve.set("earth",o),n}function Yt(e,n,o){for(const s of Ze(e).sites??[]){const i=new y(a(new A(o*.018,12,8)),a(new E({color:"#3182f6"})));i.position.copy(vt(s.lat,s.lon,o*1.004)),n.add(i);const p=document.createElement("div");p.className="space-site",p.textContent=s.name,f.appendChild(p),wt.push({mesh:i,site:s,el:p,parent:e})}}let He=null;for(const e of Xo){if(e.id==="moon")continue;const n=new $;if(he.set(e.id,n),me.add(n),e.id==="sun"){const o=.26*D,s=new y(a(new A(o,M?96:128,M?64:80)),$t);s.name="sun",tt.set("sun",o),n.add(s),Jn(s,o);for(const[p,u,v,t]of[[1.06,2,.95,"#ffbf78"]])n.add(new y(a(new A(o*p,M?32:48,M?24:32)),a(new le({uniforms:{color:{value:new ee(t)},power:{value:u},strength:{value:v}},vertexShader:la,fragmentShader:ca,transparent:!0,blending:te,depthWrite:!1}))));ve.set("sun",s);const i=new Hn(a(new Yn({map:a(na()),blending:te,transparent:!0,depthWrite:!1,depthTest:!0,color:new ee("#ffd9a0")})));i.scale.setScalar(o*3.6),n.add(i),gt=i}else{const o=Rt(e.id).radius*D;tt.set(e.id,o);let s;if(e.id==="earth"){const v=to(o);v.rotation.z=-e.tilt*ce,n.add(v),He=v,s=v.children[0]}else{const v=e.id==="saturn"?{inner:o*1.18,outer:o*2.08}:void 0;s=new y(a(new A(o,M?96:128,64)),ot(e.texture,e.color,e.id,v)),s.name=e.id,s.rotation.z=-e.tilt*ce,n.add(s),ve.set(e.id,s),qn(n,o,e.id),e.id==="jupiter"&&Kn(s,o)}if(e.axes){const[v,t,r]=e.axes;s.scale.set(1,r/v,t/v)}if(e.ring&&e.axes){const v=e.axes[0]/2,t=o*(e.ring.radius-e.ring.width/2)/v,r=o*(e.ring.radius+e.ring.width/2)/v,l=new y(a(new Be(t,Math.max(r,t*1.03),128,1)),a(new E({color:"#8b8580",side:Ce,transparent:!0,opacity:.75,depthWrite:!1})));l.rotation.x=Math.PI/2,n.add(l)}if(e.id==="saturn"){const v=o*1.18,t=o*2.08,r=new Be(v,t,160,1),l=a(new le({uniforms:{ringMap:{value:null},innerRatio:{value:v/t},planetRadius:{value:o},planetCenter:{value:new m}},vertexShader:fa,fragmentShader:va,side:Ce,transparent:!0,depthWrite:!1}));Ve("saturn-ring.webp",T=>{l.uniforms.ringMap.value=T});const w=new y(a(r),l);w.rotation.x=Math.PI/2,s.add(w),Ft.push({mesh:w,parent:e.id}),Bt.push({mesh:s,material:s.material})}e.sites&&Yt(e.id,s,o);const i=Un(e.id,.022),p=a(new Te);p.setAttribute("position",new Nt(i.positions,3)),p.setIndex(i.index),p.scale(D,D,D);const u=new y(p,a(new E({color:Rt(e.id).ribbon,transparent:!0,opacity:.5,side:Ce,depthWrite:!1})));xt.push(u),me.add(u)}Gt(e.id,e.name,e.id==="sun"?"":" is-planet")}const qt=[];function Kt(e,n,o){let s=e==="main"?1234:98765;const i=()=>(s=s*16807%2147483647,(s-1)/2147483646),p=a(new Oo(1,0)),u=new Float32Array(n*4),v=new Float32Array(n*4);for(let l=0;l<n;l+=1){let w;if(e==="main")do w=2.1+i()*1.2;while((Math.abs(w-2.5)<.03||Math.abs(w-2.82)<.03||Math.abs(w-2.95)<.02)&&i()<.85);else w=i()<.18?39.2+(i()-.5)*1.2:42+(i()-.5)*6.5;u[l*4]=w,u[l*4+1]=i()*Math.PI*2,u[l*4+2]=i()*(e==="main"?.18:.12),u[l*4+3]=i()*Math.PI*2,v[l*4]=(i()-.5)*(e==="main"?.32:.5),v[l*4+1]=i()*Math.PI*2;const T=i()**3;v[l*4+2]=(e==="main"?.0035:.009)*(.7+T*2.4),v[l*4+3]=i()}p.setAttribute("orbit",new In(u,4)),p.setAttribute("shape",new In(v,4));const t=a(new le({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new ee(o)},uScale:{value:D}},vertexShader:ha,fragmentShader:wa})),r=new Go(p,t,n);r.frustumCulled=!1,r.raycast=()=>{},me.add(r),qt.push({mesh:r,material:t})}Kt("main",M?1800:4200,"#9c9184"),Kt("kuiper",M?1500:3600,"#7f8b9c");for(const e of _n){const n=new $,o=new y(a(new A(e.radius*D,32,24)),ot(`${e.id}.webp`,e.color,e.id));o.name=e.id,n.add(o),me.add(n),Oe.set(e.id,n),nt.set(e.id,o);const s=document.createElement("button");s.type="button",s.className="space-label is-small",s.textContent=e.name,s.addEventListener("click",()=>x.onExtra?.(e.id)),f.appendChild(s),yt.set(e.id,{el:s,parent:e.parent})}{const e=new $,n=new y(a(new A(.045*D,20,16)),a(new E({color:"#f7fbff"})));n.name="halley",e.add(n);const o=new y(a(new To(.04*D,.32*D,12)),a(new E({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(o),Le={holder:e,tail:o},me.add(e),Oe.set("halley",e),nt.set("halley",n);const s=Un("halley",.022),i=a(new Te);i.setAttribute("position",new Nt(s.positions,3)),i.setIndex(s.index),i.scale(D,D,D);const p=new y(i,a(new E({color:Rt("halley").ribbon,transparent:!0,opacity:.35,side:Ce,depthWrite:!1})));xt.push(p),me.add(p);const u=document.createElement("button");u.type="button",u.className="space-label is-small",u.textContent=c("핼리 혜성"),u.addEventListener("click",()=>x.onExtra?.("halley")),f.appendChild(u),yt.set("halley",{el:u,parent:null})}for(const e of Ho){const n=Yo(e),o=n.points.map(T=>new m(T.x*D,T.y*D,T.z*D)),s=a(new Te().setFromPoints(o)),i=new Ro(s,a(new pt({color:e.color,transparent:!0,opacity:.95})));i.visible=!1;const p=new $,u=new y(a(new Tt(.03,.01,.01,20)),a(new E({color:"#d8dde4"})));u.rotation.x=Math.PI/2;const v=new y(a(new A(.014,12,8)),a(new E({color:"#c9ced6"})));v.position.z=-.02;const t=new y(a(new Tt(.002,.002,.09,6)),a(new E({color:"#aab3c0"})));t.rotation.z=Math.PI/2,t.position.z=-.02;const r=new y(a(new A(.035,16,12)),a(new E({color:e.color,transparent:!0,opacity:.18,blending:te,depthWrite:!1})));p.add(u,v,t,r),p.scale.setScalar(e.frame==="earth"?.8:1.3),p.position.copy(o[o.length-1]),i.add(p),(e.frame==="earth"?he.get("earth")??me:me).add(i);const w=document.createElement("div");w.className="space-site is-probe",w.textContent=e.name,f.appendChild(w),be.set(e.id,{line:i,probe:p,el:w,points:o,times:n.points.map(T=>T.t),marks:n.marks,frame:e.frame})}if(Xe(Me),He){const e=.055*D;tt.set("moon",e);const n=new y(a(new A(e,W,48)),ot("moon.webp","#b8b8b8","moon"));n.name="moon";const o=new $;o.add(n),me.add(o),ve.set("moon",n),he.set("moon",o),Yt("moon",n,e),Gt("moon",c("달")," is-small"),Xe(Me)}const Ye=new $,De=new $,at=new $;Ye.add(De,at),Ye.visible=!1;let Jt="solar",ke=!1,bt=0;const k={moon:new y,moonMat:a(new E({color:"#ffffff"})),shadow:a(new E({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new y,umbra:new y,skyCover:new y,skySun:new $,skyMoon:new $,skyMoonMat:a(new E({color:"#ffffff"}))},Zt=[],Qt=Z("sun.webp"),en=Z("moon.webp"),tn=new y(a(new A(.62,32,24)),a(new E({map:Qt})));tn.position.set(-3.3,0,0);const nn=new y(a(new A(.4,32,24)),a(new E({map:Z("earth-day.webp")})));nn.position.set(1.85,0,0),k.moonMat.map=en,k.moon=new y(a(new A(.14,24,18)),k.moonMat),k.cone=new y(a(new Tt(.04,.16,.78,18)),k.shadow),k.cone.position.set(1.42,0,0),k.cone.rotation.z=Math.PI/2,k.umbra=new y(a(new Je(.3,28)),a(new E({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),k.umbra.position.set(2.75,0,.02),De.add(tn,nn,k.moon,k.cone,k.umbra);for(const[e,n]of[[c("태양"),new m(-3.3,.85,0)],[c("지구"),new m(1.85,.68,0)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,f.appendChild(o),Zt.push({el:o,at:n,group:De})}const no=new y(a(new Je(1.35,48)),a(new E({map:Qt}))),oo=new y(a(new Be(1.4,1.7,48)),a(new E({color:"#f0c36a",transparent:!0,opacity:.45,side:Ce,depthWrite:!1})));k.skyCover=new y(a(new Je(1.22,48)),a(new E({color:"#141820"}))),k.skySun.add(no,oo,k.skyCover),k.skyMoonMat.map=en;const ao=new y(a(new Je(.92,48)),k.skyMoonMat),on=new y(a(new Je(1.08,48)),a(new E({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));on.position.z=.16,k.skyMoon.add(ao,on),at.add(k.skySun,k.skyMoon),at.visible=!1,S.add(Ye);const Ee=new $;Ee.visible=!1,Ee.rotation.z=-Math.PI/2;const an=[],sn=4.6,so=e=>sn*e/696e3,rn=new y(a(new A(sn,64,40)),a(new E({map:Z("sun.webp")})));rn.position.set(-3.2,0,0),Ee.add(rn);const ro=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let ln=2.4;const cn=(e,n)=>{const o=document.createElement("div");o.className="space-site",o.textContent=e,f.appendChild(o),an.push({el:o,at:n,group:Ee})};cn(c("태양"),new m(-3.2,4.9,0));for(const[e,n]of ro){const o=so(n),s=ln+o;ln=s+o+.72;const i=Ze(e),p=e==="earth"?"earth-day.webp":i.texture,u=a(new E({color:i.color}));p&&Ve(p,t=>{u.map=t,u.color.set("#ffffff"),u.needsUpdate=!0});const v=new y(a(new A(o,32,24)),u);if(v.position.set(s,0,0),i.axes&&v.scale.set(1,i.axes[2]/i.axes[0],i.axes[1]/i.axes[0]),Ee.add(v),e==="saturn"){const t=o*1.18,r=o*2.08,l=a(new Be(t,r,96,1)),w=l.attributes.position,T=l.attributes.uv,j=new m;for(let G=0;G<w.count;G+=1)j.fromBufferAttribute(w,G),T.setXY(G,(j.length()-t)/(r-t),.5);const O=a(new E({color:"#b9b3ab",transparent:!0,opacity:.9,side:Ce,depthWrite:!1}));Ve("saturn-ring.webp",G=>{O.map=G,O.color.set("#ffffff"),O.needsUpdate=!0});const pe=new y(l,O);pe.rotation.y=Math.PI/2-.36,v.add(pe)}cn(i.name,new m(s,(e==="saturn"?o*2.08:o)+.12,0))}S.add(Ee);const we=new $;we.visible=!1;const Mt=[],dn=[],io=new y(a(new A(.55,48,32)),a(new E({color:"#e0703a"})));we.add(io);for(const[e,n]of[[1.35,.16],[2.1,.05]])we.add(new y(a(new A(.55*e,32,24)),a(new E({color:"#ff6a30",transparent:!0,opacity:n,side:et,blending:te,depthWrite:!1}))));const mn=new y(a(new Be(2.6,5.1,96,1)),a(new E({color:"#3fbf7f",transparent:!0,opacity:.12,side:Ce,depthWrite:!1})));mn.rotation.x=Math.PI/2,we.add(mn),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,n,o,s,i],p)=>{const u=new An(a(new Te().setFromPoints(Array.from({length:128},(r,l)=>new m(Math.cos(l/128*Math.PI*2)*o*100,0,Math.sin(l/128*Math.PI*2)*o*100)))),a(new pt({color:"#8b95a1",transparent:!0,opacity:.35})));we.add(u);const v=new y(a(new A(.16*s,24,16)),ot(void 0,i,"earth"));we.add(v);const t=document.createElement("button");t.type="button",t.className="space-label is-small",t.textContent=e,t.addEventListener("click",()=>x.onExtra?.(`trappist-${e}`)),f.appendChild(t),Mt.push({mesh:v,a:o*100,period:n,phase0:p*1.7,el:t})});const lo=new An(a(new Te().setFromPoints(Array.from({length:256},(e,n)=>new m(Math.cos(n/256*Math.PI*2)*38.7,0,Math.sin(n/256*Math.PI*2)*38.7)))),a(new pt({color:"#c5b8a2",transparent:!0,opacity:.5})));we.add(lo);for(const[e,n]of[["TRAPPIST-1",new m(0,1.1,0)],[c("생명가능지대(대략)"),new m(3.9,0,0)],[c("비교: 우리 수성의 궤도"),new m(0,0,38.7)]]){const o=document.createElement("div");o.className="space-site",o.textContent=e,f.appendChild(o),dn.push({el:o,at:n})}S.add(we);const Ie=Jo(a),co=Ie.labels.map(({name:e,at:n})=>{const o=document.createElement("div");return o.className="space-site",o.textContent=e,f.appendChild(o),{el:o,at:n}});S.add(Ie.group);const ge=Qo(),zt=[];if(ge)for(const[e,n]of Object.entries(ge.groups)){S.add(n);for(const o of ge.markers[e]){const s=document.createElement("button");s.type="button",s.className="space-label",s.textContent=o.name,s.addEventListener("click",()=>{x.onMarker?.(o),L.target.copy(o.position),L.radius=Ue[e]*(o.id==="cmb"?1.4:e==="group"?.6:.42)}),f.appendChild(s),zt.push({level:e,marker:o,el:s})}}const pn=[];if(ge){const n=(p,u)=>new m(Math.cos(u*ce)*Math.cos(p*ce),Math.sin(u*ce),-Math.cos(u*ce)*Math.sin(p*ce)).multiplyScalar(140),o=[];for(const p of Object.values(Fn))for(const u of p)for(let v=0;v<u.length-1;v+=1){const t=n(u[v][0],u[v][1]),r=n(u[v+1][0],u[v+1][1]);o.push(t.x,t.y,t.z,r.x,r.y,r.z)}const s=a(new Te);s.setAttribute("position",new Nt(o,3));const i=new Lo(s,a(new pt({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));ge.groups.stars.add(i);for(const p of qo){if(!Fn[p.id])continue;const u=document.createElement("button");u.type="button",u.className="space-label is-const",u.textContent=p.name.replace(/\(.*\)/,"").split(" · ")[0],u.addEventListener("click",()=>x.onConstellation?.(p.id)),f.appendChild(u),pn.push({el:u,at:n(p.center[0],p.center[1])})}}const st=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let R="system",_e=!1,un=!1;const Ue={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},qe=new m,N={theta:.6,phi:.95,radius:34},L={target:new m,radius:N.radius};let X="system",K=null,ie=null,ue=null;function rt(e){if((e==="system"||e==="sizes")&&ht(),R=e,_e=!1,me.visible=e==="system",Ye.visible=e==="eclipse",Ee.visible=e==="sizes",we.visible=e==="exo",Ie.group.visible=e==="blackhole",ge)for(const[n,o]of Object.entries(ge.groups))o.visible=n===e;X="system",K=null,ie=null,ue=null,L.target.set(0,0,0),L.radius=Ue[e],e!=="system"&&(N.phi=1.1),e==="eclipse"&&(De.rotation.z=h.aspect<1?-Math.PI/2:0,N.theta=0,N.phi=ke?Math.PI/2:1.25,L.target.set(0,0,0),ke||L.target.set(-.7,0,0).applyEuler(De.rotation),L.radius=ke?6:h.aspect<1?10:7.5),e==="exo"&&(N.phi=.75),e==="blackhole"&&(N.phi=1.42),e==="sizes"&&(N.theta=0,N.phi=Math.PI/2,L.target.set(.6,-6.8,0),L.radius=19)}function fn(e){if(e!=="earth"&&ht(),_e=!1,R!=="system"&&(R="system",me.visible=!0,Ye.visible=!1,Ee.visible=!1,we.visible=!1,Ie.group.visible=!1,ge))for(const o of Object.values(ge.groups))o.visible=!1;if(X=e,ie=null,ue=null,e==="system"){K=null,L.target.set(0,0,0),L.radius=Ue.system;return}K=he.get(e)??null;const n=tt.get(e)??sa(Ze(e).km);L.radius=e==="sun"?3.2:e==="jupiter"?3.4*D:e==="saturn"?2.6*D:Math.max(n*(Ze(e).ring?6:4.2),.25)}function mo(e){const n=Oe.get(e);n&&(R!=="system"&&rt("system"),X="system",K=n,ie=null,ue=null,L.radius=e==="halley"?1.6:.6,We=performance.now())}function po(e){ue=(e?wt.find(o=>o.parent===X&&o.site.name===e.name):void 0)?.mesh??null,ie=ue?new m:null,We=performance.now()}const Se=new Map;let Ke=0,it=0,We=0;const vn=new Ao,hn=new mt,wn=e=>{if(ht(),I.setPointerCapture(e.pointerId),_e=!1,Se.set(e.pointerId,{x:e.clientX,y:e.clientY}),it=0,We=performance.now(),Se.size===2){const[n,o]=[...Se.values()];Ke=Math.hypot(n.x-o.x,n.y-o.y)}},gn=e=>{const n=Se.get(e.pointerId);if(!n)return;const o=e.clientX-n.x,s=e.clientY-n.y;if(Se.set(e.pointerId,{x:e.clientX,y:e.clientY}),We=performance.now(),Se.size===1)it+=Math.abs(o)+Math.abs(s),N.theta-=o*.006,N.phi=Math.min(2.9,Math.max(.2,N.phi-s*.006)),ie=null,ue=null;else if(Se.size===2){const[i,p]=[...Se.values()],u=Math.hypot(i.x-p.x,i.y-p.y);Ke>0&&(L.radius=xn(L.radius*(Ke/u))),Ke=u,it+=10}},lt=e=>{if(Se.delete(e.pointerId),Ke=0,it<6&&x.onPick){const n=I.getBoundingClientRect();hn.set((e.clientX-n.left)/n.width*2-1,-((e.clientY-n.top)/n.height)*2+1),vn.setFromCamera(hn,h);const s=vn.intersectObjects([...ve.values(),...nt.values()],!1)[0]?.object.name;s&&ve.has(s)?x.onPick(s):s&&nt.has(s)&&x.onExtra?.(s)}},yn=e=>{e.preventDefault(),L.radius=xn(L.radius*(e.deltaY>0?1.12:.89))};function xn(e){return R!=="system"?Math.min(Ue[R]*2.2,Math.max(Ue[R]*.15,e)):Math.min(90,Math.max(X==="system"&&!K?4:.15,e))}I.addEventListener("pointerdown",wn),I.addEventListener("pointermove",gn),I.addEventListener("pointerup",lt),I.addEventListener("pointercancel",lt),I.addEventListener("wheel",yn,{passive:!1});let Pe=null,ct=null,St=!matchMedia("(prefers-reduced-motion: reduce)").matches,bn=0,Mn=0;St&&(Pe=new Do(V),Pe.addPass(new Io(S,h)),ct=new _o(new mt(256,256),.75,.78,.92),Pe.addPass(ct),Pe.addPass(new Uo));const P={w:1,h:1},zn=()=>{P.w=C.clientWidth||1,P.h=C.clientHeight||1,V.setSize(P.w,P.h,!1),Pe?.setSize(P.w,P.h),ct?.resolution.set(P.w/2,P.h/2),h.aspect=P.w/P.h,h.updateProjectionMatrix()};zn();const Sn=new ResizeObserver(zn);Sn.observe(C);let Pn=!0;const Cn=new IntersectionObserver(e=>{Pn=e.some(n=>n.isIntersecting)});Cn.observe(C);const d=new m,Ne=new m,Fe=new m,Pt=new m,uo=new m,fo=new m,vo=new m,ho=new m,kn=new m,wo=new m;let Ct=0,En=performance.now(),kt=-1e9,Wn=0;const Nn=e=>{Ct=requestAnimationFrame(Nn);const n=Math.min(.1,(e-En)/1e3);if(En=e,document.hidden||!Pn)return;if(st||($t.uniforms.time.value=e/1e3),!st){for(const t of jt)t.uniforms.time.value=e/1e3;for(const t of Vt)t.uniforms.uTime.value=e/1e3}e-We>3e3&&!st&&!ie&&!un&&!_e&&R!=="eclipse"&&R!=="sizes"&&(N.theta+=n*(X==="system"?.03:.08)),_t?.rotateY(n*.01);for(const[t,r]of ve){if(t==="earth"||t==="moon"||ue&&t===X)continue;const l=Ze(t).spinHours;st||r.rotateY(n*(t==="sun"?.02:l?.12*(24/l)*.25:.12))}gt&&(gt.visible=h.position.length()>4);for(const t of qt)t.material.uniforms.uDays.value=(Me-ea)/864e5,t.material.uniforms.uTime.value=e/1e3;for(const t of Ft){const r=ve.get(t.parent);r&&t.mesh.material.uniforms.planetCenter.value.copy(r.getWorldPosition(d))}for(const t of Bt)t.mesh.getWorldPosition(d),t.material.uniforms.ringCenter.value.copy(d),t.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(t.mesh.matrixWorld).normalize();if(Ge&&e-Wn>1e3&&(Wn=e,Me=Date.now(),Xe(Me)),b){const t=be.get(b.id),r=t.points.length,l=t.times[r-1],w=(t.frame==="earth"?6:25)*864e5,j=t.marks.some(H=>H.at!==void 0&&H.body&&H.body!=="earth"&&Math.abs(b.sim-H.at)<w)?"slow":b.sim>=b.fastFrom?"fast":"normal",O=j==="slow"?Math.min(b.base,2*w/3):b.base*(j==="fast"?b.fast:1);b.sim=Math.min(l,b.sim+O*Math.min(n,.1)),t.frame==="sun"?ze=(ze??b.sim)+Math.min(n,.1)*.15*864e5:ze=null,b.pace=j;const pe=(b.sim-t.times[0])/(l-t.times[0]||1);let G=0,ye=r-1;for(;ye-G>1;){const H=G+ye>>1;t.times[H]<=b.sim?G=H:ye=H}const ae=t.times[ye]-t.times[G],Y=G+(ae>0?(b.sim-t.times[G])/ae:0),Q=Math.max(0,Math.min(r-2,Math.floor(Y))),Tn=Y-Q;t.probe.position.lerpVectors(t.points[Q],t.points[Q+1],Tn),Ut=Y,t.probe.lookAt(t.line.localToWorld(t.points[Math.min(r-1,Q+2)].clone())),t.line.geometry.setDrawRange(0,Q+2);const Et=t.times[Q]+(t.times[Q+1]-t.times[Q])*Tn;Ge=!1,Me=Et,Xe(Et);let dt=0;for(let H=0;H<t.marks.length;H+=1){const Rn=t.marks[H],go=Rn.at??t.times[Math.min(r-1,Rn.index)];b.sim>=go-w&&(dt=H)}if((dt!==b.mark||e-b.lastPing>250||b.sim>=l&&!b.done)&&(b.mark=dt,b.lastPing=e,b.sim>=l&&(b.done=!0),x.onFlight?.({id:b.id,mark:t.marks[dt],progress:pe,time:Et,done:b.done,pace:b.pace})),b.done){const H=t.frame==="earth";b=null,ze=null,Ge=!0,K=H?he.get("earth")??null:null,H||L.target.set(0,0,0),L.radius=H?4.2:72,N.phi=H?.7:.45}}if(K&&L.target.copy(K.getWorldPosition(d)),b){const t=be.get(b.id);let r=null,l=1/0;for(const T of t.marks){if(!T.body||T.body==="earth"||T.body==="far")continue;const j=Math.abs(T.index-Ut);j<14&&j<l&&(r=T,l=j)}const w=r?he.get(r.body):void 0;if(w){const T=w.getWorldPosition(vo).add(t.probe.getWorldPosition(ho)).multiplyScalar(.5);L.target.copy(T),L.radius=t.frame==="earth"?1.6:4.2}else L.radius=t.frame==="earth"?1.5:2.8}if(qe.lerp(L.target,1-Math.pow(.002,n)),N.radius+=(L.radius-N.radius)*(1-Math.pow(.004,n)),ie&&ue){const t=ve.get(X)?.getWorldPosition(kn)??kn.set(0,0,0);ie.copy(ue.getWorldPosition(wo).sub(t).normalize());const r=Math.atan2(ie.x,ie.z),l=Math.acos(Math.max(-1,Math.min(1,ie.y)));let w=r-N.theta;w=Math.atan2(Math.sin(w),Math.cos(w)),N.theta+=w*(1-Math.pow(.01,n)),N.phi+=(l-N.phi)*(1-Math.pow(.01,n))}if(R==="blackhole"&&Ie.update(e/1e3,h),R==="exo"){const t=e/1e3;for(const r of Mt){const l=r.phase0+t/r.period*Math.PI*2;r.mesh.position.set(Math.cos(l)*r.a,0,Math.sin(l)*r.a)}}if(R==="eclipse"){bt=(bt+n*.18)%1;const t=Math.sin(bt*Math.PI*2),r=Math.abs(t)<.22,l=Jt==="lunar";De.visible=!ke,at.visible=ke,k.skySun.visible=!l,k.skyMoon.visible=l,ke?l?(k.skyMoon.position.set(t*1.7,0,.08),k.skyMoonMat.color.set(r?"#c47462":"#f2f2f2")):k.skyCover.position.set(t*1.7,0,.08):(k.moon.position.set(l?2.75:1.05,t*.55,0),k.cone.visible=!l,k.umbra.visible=l,k.shadow.opacity=r?.42:.08,k.umbra.material.opacity=r?.42:.08,k.moonMat.color.set(l&&r?"#c47462":"#ffffff"))}if(h.position.set(qe.x+N.radius*Math.sin(N.phi)*Math.sin(N.theta),qe.y+N.radius*Math.cos(N.phi),qe.z+N.radius*Math.sin(N.phi)*Math.cos(N.theta)),h.lookAt(qe),He&&(He.getWorldPosition(d),Ae.copy(d).multiplyScalar(-1).normalize(),e-kt>500&&!(b&&be.get(b.id)?.frame==="sun"))){kt=e;const t=Ko(new Date(Me)),r=Math.atan2(t.y,t.x),l=Math.atan2(-Ae.z,Ae.x),w=He.children[0];w.rotation.y=l-r}Pe&&St&&R!=="blackhole"&&(R!=="system"||X==="system"||X==="sun")&&Pe?(Pe.render(n),bn+=1,Mn+=n,bn===90&&Mn/90>.034&&(St=!1)):V.render(S,h),h.getWorldDirection(Ne),g();const i=[];for(const t of Zn){const r=It.get(t),l=he.get(t);if(!r||!l)continue;l.getWorldPosition(d);const w=Fe.copy(d).sub(h.position).dot(Ne)>0,T=X==="system"&&R==="system"&&(!K||b!==null),j=X==="earth"||X==="moon"||b!==null&&be.get(b.id)?.frame==="earth";let O=w&&(t==="moon"?R==="system"&&j:T||j&&t==="earth"&&b!==null);d.project(h);const pe=(d.x+1)/2*P.w;let G=pe;const ye=(1-d.y)/2*P.h+10;if(O){let ae=Xt.get(t)??0;ae||(r.style.display="block",ae=r.offsetWidth||40,Xt.set(t,ae)),G=Math.min(Math.max(pe,ae/2+4),Math.max(ae/2+4,P.w-ae/2-4));const Y={x:G-ae/2,y:ye,w:ae,h:22};z(Y.x,Y.y,Y.w,Y.h)||i.some(Q=>Y.x<Q.x+Q.w+4&&Y.x+Y.w+4>Q.x&&Y.y<Q.y+Q.h&&Y.y+Y.h>Q.y)?O=!1:i.push(Y)}r.style.display=O?"block":"none",O&&(r.style.transform=`translate(${G}px, ${ye}px) translate(-50%, 0)`)}const p=R==="system",u=X!=="system"&&X!=="jupiter"&&X!=="saturn",v=K!==null&&(b===null?K===he.get("earth"):be.get(b.id)?.frame==="earth");for(const t of xt)t.visible=!u&&!v;for(const[t,r]of yt){const l=Oe.get(t),w=r.parent?he.get(r.parent)===K:X==="system"&&(!K||K===l),T=K===l||w;l.getWorldPosition(d);const j=Fe.copy(d).sub(h.position).dot(Ne)>0,O=p&&j&&T;d.project(h),r.el.style.display=O?"block":"none",O&&(r.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h+8}px) translate(-50%, 0)`)}for(const[t,r]of be){const l=p&&Ot===t;if(r.line.visible=l,!l){r.el.style.display="none";continue}r.probe.getWorldPosition(d);const w=Fe.copy(d).sub(h.position).dot(Ne)>0;d.y+=0,d.project(h),r.el.style.display=w?"block":"none",w&&(r.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(10px, -50%)`)}for(const t of pn){if(R!=="stars"){t.el.style.display="none";continue}d.copy(t.at);const r=Fe.copy(d).sub(h.position).dot(Ne)>0;d.project(h);const l=r&&Math.abs(d.x)<1&&Math.abs(d.y)<1;t.el.style.display=l?"block":"none",l&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(-50%, -50%)`)}for(const t of zt){if(!(t.level===R)){t.el.style.display="none";continue}d.copy(t.marker.position);const l=Fe.copy(d).sub(h.position).dot(Ne)>0;d.project(h),t.el.style.display=l?"block":"none",l&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h+8}px) translate(-50%, 0)`)}for(const t of Mt){if(R!=="exo"){t.el.style.display="none";continue}t.mesh.getWorldPosition(d);const r=Fe.copy(d).sub(h.position).dot(Ne)>0;d.project(h),t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h+8}px) translate(-50%, 0)`)}for(const t of co){if(R!=="blackhole"){t.el.style.display="none";continue}d.copy(t.at),Ie.group.localToWorld(d),d.project(h);const r=d.z<1&&Math.abs(d.x)<1.05&&Math.abs(d.y)<1.05;t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(-50%, -100%)`)}for(const t of dn){if(R!=="exo"){t.el.style.display="none";continue}d.copy(t.at).project(h);const r=d.z<1&&Math.abs(d.x)<1.05&&Math.abs(d.y)<1.05;t.el.style.display=r?"block":"none",r&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(-50%, -100%)`)}for(const[t,r]of[[Zt,R==="eclipse"&&!ke],[an,R==="sizes"]])for(const l of t){if(!r){l.el.style.display="none";continue}d.copy(l.at).applyMatrix4(l.group.matrixWorld).project(h);let w=d.z<1&&Math.abs(d.x)<1.1&&Math.abs(d.y)<1.1;const T=(d.x+1)/2*P.w,j=(1-d.y)/2*P.h,O=l.el.offsetWidth||44;w&&z(T-O/2,j-11,O,22)&&(w=!1),l.el.style.display=w?"block":"none";const pe=l.group.rotation.z!==0;w&&(l.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) ${pe?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const t of wt){t.mesh.getWorldPosition(d);const r=ve.get(t.parent);r?r.getWorldPosition(Pt):Pt.set(0,0,0);let w=uo.copy(d).sub(Pt).normalize().dot(fo.copy(h.position).sub(d).normalize())>.15&&R==="system"&&X===t.parent;d.project(h),w&&z((d.x+1)/2*P.w+8,(1-d.y)/2*P.h-11,90)&&(w=!1),t.el.style.display=w?"block":"none",w&&(t.el.style.transform=`translate(${(d.x+1)/2*P.w}px, ${(1-d.y)/2*P.h}px) translate(8px, -50%)`)}};return Ct=requestAnimationFrame(Nn),re===0&&x.onReady?.(),{focus:fn,setLevel:rt,setPaused:e=>{un=e},focusMarker:e=>{const n=zt.find(o=>o.level===R&&o.marker.id===e);n&&(L.target.copy(n.marker.position),L.radius=Ue[R]*(e==="cmb"?1.4:R==="group"?.6:.42),We=performance.now())},showSite:po,focusExtra:mo,setEclipse:(e,n)=>{Jt=e,ke=n,rt("eclipse")},setHemisphere:e=>{X!=="earth"&&fn("earth");const n=Ae.clone().multiplyScalar(e==="day"?1:-1);N.theta=Math.atan2(n.x,n.z),N.phi=Math.min(2.6,Math.max(.5,Math.acos(n.y))),ie=null,ue=null,_e=!0},setTime:e=>{Ge=e===null,Me=e??Date.now(),Xe(Me),kt=-1e9},setVoyage:e=>{if(Ot=e,!e){b&&(b=null,Ge=!0),ze=null;for(const r of be.values())r.line.geometry.setDrawRange(0,1/0);return}R!=="system"&&rt("system"),ze=null;const n=be.get(e);n.line.geometry.setDrawRange(0,2),X="system",ie=null,ue=null,_e=!1,K=n.probe;const o=n.frame==="earth";L.radius=o?1.3:2.8,N.phi=o?.75:1;const s=Math.max(...n.marks.filter(r=>r.at!==void 0&&r.body!=="earth").map(r=>r.at),n.times[0]+864e5),i=n.times[0],p=n.times[n.times.length-1],u=(s-i)/(o?20:24),v=n.frame==="earth"?p:s+60*864e5,t=p>v?(p-v)/4/u:1;b={id:e,sim:i,base:u,fastFrom:v,fast:t,mark:-1,done:!1,lastPing:0,pace:"normal"},We=performance.now()},dispose:()=>{ge?.dispose(),Pe?.dispose(),ct?.dispose(),cancelAnimationFrame(Ct),Sn.disconnect(),Cn.disconnect(),I.removeEventListener("pointerdown",wn),I.removeEventListener("pointermove",gn),I.removeEventListener("pointerup",lt),I.removeEventListener("pointercancel",lt),I.removeEventListener("wheel",yn),S.traverse(e=>{const n=e.material;Array.isArray(n)&&n.forEach(o=>o.dispose())}),_.forEach(e=>e.dispose()),V.dispose(),I.remove(),f.remove()}}}export{Ca as createSpace};
