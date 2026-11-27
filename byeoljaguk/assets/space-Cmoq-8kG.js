import{t as A,a as Ja}from"./index-UfQlUDQ0.js";import{G as ge,M as F,S as ae,a as J,b as he,A as ze,D as _e,V as I,R as ut,P as vn,B as on,C as Ln,c as Nn,d as Fn,e as j,f as St,g as an,h as go,i as yo,j as yn,N as ka,k as Qa,l as es,L as ts,m as ns,I as nn,n as Ca,o as hn,p as wo,q as os,O as io,r as gn,W as as,s as ss,t as rs,u as is,T as cs,v as ls,w as us,x as fs,F as co,y as ps,z as ds,E as lo,H as pn,J as la,K as ms,Q as vs,U as hs,X as gs,Y as ys,Z as ws,_ as Ms,$ as xs,a0 as ua,a1 as fa,a2 as bs,a3 as Ss}from"./three-BLBHJbXV.js";import{af as pa,ag as Ps,ah as uo,ai as da,aj as ks,ak as Cs,al as dn,C as zs,am as Es,an as zn,ao as Ts}from"./App-i_5FHsQJ.js";import{C as ma}from"./sky-BFjPe7Ht.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";import"./audio-D6zWnsfS.js";const va=`
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
`,En=3,fo=9;function Ds(t){const n=new ge;n.visible=!1,n.rotation.z=.1;const o=new F(t(new ae(1,48,32)),t(new J({color:"#000000"})));o.renderOrder=0,n.add(o);const u=t(new he({uniforms:{uTime:{value:0},uCam:{value:new I}},transparent:!0,depthWrite:!1,side:_e,blending:ze,vertexShader:`
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
        ${va}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${En.toFixed(1)}) / ${(fo-En).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${En.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),p=new F(t(new ut(En,fo,256,8)),u);p.rotation.x=-Math.PI/2,p.renderOrder=1,n.add(p);const P=t(new he({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:ze,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${va}
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
      `})),r=new F(t(new vn(8,8)),P);r.renderOrder=2,n.add(r);const S=[{name:A("궁수자리 A*"),at:new I(0,3.6,0)},{name:A("사건의 지평선"),at:new I(0,-2.9,0)},{name:A("강착 원반"),at:new I(fo-1.2,0,0)}],N=new I;return{group:n,labels:S,update(h,x){u.uniforms.uTime.value=h,P.uniforms.uTime.value=h,x.getWorldPosition(N),u.uniforms.uCam.value.copy(N),r.lookAt(N)}}}const mn=Math.PI/180;function vt(t,n,o){return new I(Math.cos(n*mn)*Math.cos(t*mn),Math.sin(n*mn),-Math.cos(n*mn)*Math.sin(t*mn)).multiplyScalar(o)}function As(){const n=document.createElement("canvas");n.width=64,n.height=64;const o=n.getContext("2d");if(o){const u=o.createRadialGradient(32,32,0,32,32,32);u.addColorStop(0,"rgba(255,255,255,1)"),u.addColorStop(.25,"rgba(255,255,255,0.75)"),u.addColorStop(1,"rgba(255,255,255,0)"),o.fillStyle=u,o.fillRect(0,0,64,64)}return new Ln(n)}function Rs(){const t=[],n=h=>(t.push(h),h),o=n(As());function u(h,x,k){const y=new Nn(n(new Fn({map:o,color:new j(h),transparent:!0,depthWrite:!1,blending:ze})));return y.scale.setScalar(x),y.position.copy(k),y}function p(h,x,k){const y=new Float32Array(h*3),f=new Float32Array(h*3);for(let i=0;i<h;i+=1){const[D,T]=x(i);y.set([D.x,D.y,D.z],i*3),f.set([T.r,T.g,T.b],i*3)}const E=n(new St);return E.setAttribute("position",new an(y,3)),E.setAttribute("color",new an(f,3)),new go(E,n(new yo({size:k,map:o,vertexColors:!0,transparent:!0,depthWrite:!1,blending:ze,sizeAttenuation:!0})))}let P=7;const r=()=>(P=P*16807%2147483647,(P-1)/2147483646),S={},N={};{const h=new ge,x=2.6,k=[["alphacen",A("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",A("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",A("바너드별"),269.45,4.69,5.96,"#ffb27a",A("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",A("울프 359"),164.12,7.01,7.86,"#ff9a6a",A("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",A("시리우스"),101.29,-16.72,8.6,"#cfe0ff",A("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",A("로스 154"),282.46,-23.84,9.69,"#ffa070",A("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",A("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",A("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",A("백조자리 61"),316.7,38.75,11.4,"#ffc58a",A("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",A("프로키온"),114.83,5.22,11.46,"#fff3d6",A("작은개자리의 밝은 별이에요.")],["epsind",A("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",A("남쪽 하늘의 가까운 별이에요.")],["taucet",A("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",A("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];h.add(u("#ffe39a",3.2,new I));const y=[{id:"sun-star",name:A("태양"),line:A("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new I}];for(const[f,E,i,D,T,V,G]of k){const O=vt(i,D,T*x);h.add(u(V,2.4,O)),y.push({id:f,name:E,line:Ja("{0} 거리 약 {1}광년.",G,T),position:O})}h.add(p(500,()=>[new I(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(60+r()*30),new j().setHSL(.1,.3,.5+r()*.4)],.9)),S.stars=h,N.stars=y}{const h=new ge,x=1/40,k=[["pleiades",A("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,A("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",A("베텔게우스"),88.79,7.41,548,"#ffab6e",3,A("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",A("리겔"),78.63,-8.2,860,"#cfe0ff",3,A("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",A("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,A("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",A("데네브"),310.36,45.28,2600,"#e6eeff",3,A("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];h.add(u("#ffe39a",1.6,new I));const y=[{id:"sun-orion",name:A("태양"),line:A("우리은하의 오리온 팔 안쪽에 있어요."),position:new I}];for(const[f,E,i,D,T,V,G,O]of k){const H=vt(i,D,T*x);h.add(u(V,G,H)),f==="orionneb"&&h.add(p(260,()=>{const X=Math.pow(r(),.6)*5;return[new I(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(X).add(H),new j(r()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),y.push({id:f,name:E,line:O,position:H})}h.add(p(1400,()=>{const f=(r()-.5)*120,E=(r()-.5)*22*(.4+r()),i=(r()-.5)*4;return[new I(f,i,E),new j().setHSL(.6+r()*.1,.3,.35+r()*.3)]},.8)),S.orion=h,N.orion=y}{const h=new ge,x=4;h.add(p(9e3,y=>{const f=y%x,E=Math.pow(r(),.55)*25,i=f/x*Math.PI*2+Math.log(1+E)*1.9+(r()-.5)*(.5+4/(E+2)),D=(r()-.5)*(E<4?2.2:.7),T=E<4,V=T?new j("#ffd9a0"):new j().setHSL(.58+r()*.06,.45,.45+r()*.35);return[new I(Math.cos(i)*E,D,Math.sin(i)*E),V.multiplyScalar(T?.8:.6)]},.55)),h.add(u("#fff0c8",7,new I));const k=new I(13,0,0);h.add(u("#ffe39a",1.2,k)),S.galaxy=h,N.galaxy=[{id:"center",name:A("은하 중심(궁수자리 A*)"),line:A("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new I},{id:"sun-gal",name:A("태양은 여기"),line:A("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:k}]}{const h=new ge,x=1/1e5,k=(T,V,G,O,H)=>p(O,X=>{const Q=Math.pow(r(),.6)*V,ie=X%2*Math.PI+Math.log(1+Q*3)*2.2+(r()-.5)*.9,oe=new I(Math.cos(ie)*Q,(r()-.5)*V*.05,Math.sin(ie)*Q);oe.applyAxisAngle(new I(1,0,0),G);const Y=Q<V*.18;return[oe.add(T),new j().setHSL(Y?.1:H,.4,.45+r()*.3).multiplyScalar(Y?.35:.22)]},.4),y=new I;h.add(k(y,2.2,0,1800,.6));const f=vt(10.68,41.27,25e5*x);h.add(k(f,4.4,1.2,3200,.1));const E=vt(23.46,30.66,273e4*x);h.add(k(E,1.6,.6,900,.62));const i=vt(80.89,-69.76,16e4*x);h.add(u("#cfd8ff",1.2,i));const D=vt(13.19,-72.83,2e5*x);h.add(u("#cfd8ff",.8,D)),S.group=h,N.group=[{id:"mw",name:A("우리 은하"),line:A("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:y},{id:"andromeda",name:A("안드로메다은하"),line:A("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:f},{id:"triangulum",name:A("삼각형자리은하"),line:A("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:E},{id:"lmc",name:A("대마젤란은하"),line:A("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:i}]}{const h=new ge,x=6,k=(T,V,G)=>new I(T,V,G).multiplyScalar(x),y=k(5.1,.35,1.1),f=k(3.4,.45,.2),E=k(-1.4,-.3,-.5),i=[[k(.2,0,0),900,6.4*x*.5],[f,280,1.5*x*.5],[E,220,1.7*x*.5],[k(-2.2,1.6,2.4),120,1.1*x*.5]],D=i.reduce((T,V)=>T+V[1],0);h.add(p(D+180,T=>{let V=T;for(const[O,H,X]of i){if(V<H)return[new I(r()-.5,(r()-.5)*.5,r()-.5).multiplyScalar(2*X*Math.pow(r(),.5)).add(O),new j("#f3eee6").multiplyScalar(.75)];V-=H}const G=r();return[y.clone().lerp(E,G).add(new I((r()-.5)*.7*x,(r()-.5)*.45*x,(r()-.5)*.7*x)),new j("#e7c48a").multiplyScalar(.8)]},.5)),h.add(new F(n(new ae(.95*x,20,16)),n(new J({color:"#d5e2f5",transparent:!0,opacity:.1,blending:ze,depthWrite:!1}))).translateX(f.x).translateY(f.y).translateZ(f.z)),h.add(new F(n(new ae(1.05*x,20,16)),n(new J({color:"#e7c48a",transparent:!0,opacity:.09,blending:ze,depthWrite:!1}))).translateX(E.x).translateY(E.y).translateZ(E.z)),h.add(u("#e4b56a",1.2,y)),S.super=h,N.super=[{id:"localgroup",name:A("우리 은하군"),line:A("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:y},{id:"virgo-sc",name:A("처녀자리 은하단"),line:A("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:f},{id:"attractor-sc",name:A("거대 인력체"),line:A("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:E}]}{const h=new ge,x=1/1e7,k=vt(187.7,12.4,54e6*x),y=vt(243,-60,2e8*x);h.add(p(5e3,E=>{const i=E%5,T=[k,y,vt(30,20,15e7*x),vt(160,-30,18e7*x),vt(300,40,14e7*x)][i],V=i===1?7:4;return[new I((r()-.5)*2,(r()-.5)*2,(r()-.5)*2).multiplyScalar(V*Math.pow(r(),.4)).add(T),new j().setHSL(.08+r()*.5,.35,.55).multiplyScalar(.8)]},.8)),h.add(u("#ffffff",.8,new I));const f=new F(n(new ae(42,48,32)),n(new J({color:"#ff8a4a",transparent:!0,opacity:.08,side:on,depthWrite:!1})));h.add(f),S.cosmos=h,N.cosmos=[{id:"here",name:A("우리 은하"),line:A("여기서는 점 하나예요."),position:new I},{id:"virgo",name:A("처녀자리 은하단"),line:A("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:k},{id:"attractor",name:A("거대 인력체"),line:A("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:y},{id:"cmb",name:A("가장 오래된 빛"),line:A("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new I(0,0,-42)}]}for(const h of Object.values(S))h.visible=!1;return{groups:S,markers:N,dispose:()=>t.forEach(h=>h.dispose())}}const Is=`
uniform float uTile;
varying vec3 vColor;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vColor = color;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  // 무늬를 화면 좌표가 아니라 땅 좌표(world xz)에 붙이고,
  // 같은 그림이 일정한 간격으로 되풀이되어 보이지 않게 천천히 흔듭니다(정점에서 한 번만 계산).
  vec2 warp = vec2(
    sin(wp.x * 0.19 + wp.z * 0.11) + sin(wp.x * 0.061 - wp.z * 0.043),
    cos(wp.z * 0.17 - wp.x * 0.09) + cos(wp.z * 0.053 + wp.x * 0.037)
  ) * 0.032;
  vUv = wp.xz / uTile + warp;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Ws=`
uniform sampler2D uMap;
uniform float uTexel;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uAmbient;
uniform float uSunPower;
uniform float uDetail;
uniform float uBump;
uniform float uGloss;
varying vec3 vColor;
varying vec2 vUv;
varying vec3 vWorld;

void main() {
  vec4 base = texture2D(uMap, vUv);
  float albedo = base.r * 2.0;
  // 가까운 결: 같은 그림을 촘촘히 한 번 더 읽어 발밑 알갱이와 요철을 살립니다.
  vec2 duv = vUv * uDetail + vec2(0.37, 0.61);
  vec4 fine = texture2D(uMap, duv);
  float grain = 0.86 + (fine.r * 2.0 - 1.0) * 0.34;
  // 높이에서 기울기를 구해 노멀을 흔듭니다(그림자 없이 요철만).
  float h0 = fine.g;
  float hx = texture2D(uMap, duv + vec2(uTexel, 0.0)).g;
  float hy = texture2D(uMap, duv + vec2(0.0, uTexel)).g;
  vec3 n = normalize(vec3(-(hx - h0) * uBump, 1.0, -(hy - h0) * uBump));
  float ndl = max(dot(n, uSunDir), 0.0);
  float flatNdl = max(uSunDir.y, 0.06);
  float shade = clamp((uAmbient + uSunPower * ndl) / (uAmbient + uSunPower * flatNdl), 0.22, 2.6);
  vec3 col = vColor * albedo * grain * shade;
  // 얼음·유리 같은 땅의 반짝임
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 H = normalize(uSunDir + V);
  col += uSunColor * pow(max(dot(n, H), 0.0), 30.0) * uGloss * base.b;
  float dist = length(cameraPosition - vWorld);
  float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));
  col += (fract(sin(dot(vWorld.xz, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.006;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,_s=`
uniform float uTile;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vUv = wp.xz / uTile;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Ns=`
uniform sampler2D uMap;
uniform vec2 uOffset;
uniform float uDetail;
uniform vec3 uTint;
uniform float uOpacity;
uniform vec3 uFogColor;
uniform float uFogDensity;
varying vec2 vUv;
varying vec3 vWorld;

void main() {
  vec2 uv = vUv + uOffset;
  vec4 macro = texture2D(uMap, uv);
  vec4 fine = texture2D(uMap, uv * uDetail + vec2(0.21, 0.53));
  // 굵은 띠와 잔 결을 살짝 섞고, 두 층의 두께 차이로 구름의 그늘을 만듭니다.
  float relief = clamp(0.9 + (macro.a - fine.a) * 0.9, 0.66, 1.2);
  vec3 col = uTint * mix(macro.rgb, fine.rgb, 0.34) * (0.9 + (fine.r - 0.5) * 0.42) * relief;
  float dist = length(cameraPosition - vWorld);
  float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));
  float alpha = uOpacity * clamp(macro.a * 1.1, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,ha=`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,ga=`
uniform sampler2D uMap;
uniform float uLimb;
uniform vec3 uRim;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;

void main() {
  vec3 tex = texture2D(uMap, vUv).rgb;
  float fine = dot(texture2D(uMap, vUv * 5.0 + vec2(0.17, 0.31)).rgb, vec3(0.333));
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float facing = clamp(dot(N, V), 0.0, 1.0);
  float limb = pow(facing, uLimb);
  vec3 col = tex * (0.24 + 0.7 * limb) * (0.95 + (fine - 0.5) * 0.12);
  col += uRim * pow(1.0 - facing, 3.5) * 0.2;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,Qt=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,po=`
uniform sampler2D uProfile;
uniform float uInner;
uniform float uOuter;
uniform float uAlpha;
varying vec3 vPos;
void main() {
  float r = length(vPos.xy);
  float t = (r - uInner) / (uOuter - uInner);
  if (t < 0.0 || t > 1.0) discard;
  vec4 p = texture2D(uProfile, vec2(clamp(t, 0.0, 1.0), 0.5));
  float ang = atan(vPos.y, vPos.x);
  float wave = 0.5 + 0.5 * sin(ang * 23.0 + t * 58.0);
  float alpha = p.a * uAlpha * (0.86 + 0.26 * wave);
  if (alpha < 0.004) discard;
  vec3 col = p.rgb * (0.9 + 0.16 * wave);
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,Tn=`
uniform float uInner;
uniform float uOuter;
uniform float uBands;
uniform vec3 uA;
uniform vec3 uB;
uniform float uAlpha;
uniform float uGrain;
varying vec3 vPos;
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
}
void main() {
  float r = length(vPos.xy);
  float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
  float b = 0.55 + 0.45 * sin(t * uBands + 0.7);
  b *= 0.65 + 0.35 * sin(t * uBands * 0.37 + 1.9);
  b *= 0.9 + 0.12 * sin(t * uBands * 3.1 + 0.4);
  float ang = atan(vPos.y, vPos.x);
  float grain = mix(1.0, 0.72 + 0.56 * hash21(vec2(floor(ang * 90.0), floor(t * uBands * 24.0))), uGrain);
  float edge = smoothstep(0.0, 0.006, t) * smoothstep(1.0, 0.94, t);
  float alpha = clamp(b, 0.0, 1.0) * edge * uAlpha * grain;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(mix(uA, uB, b), alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,lt=Math.PI*2,za=9,ya=140;function ht(t){return t<0?0:t>1?1:t}function Wn(t,n,o){return t<n?n:t>o?o:t}function Tt(t,n,o){const u=ht((o-t)/(n-t));return u*u*(3-2*u)}function Nt(t,n,o){let u=Math.imul(t|0,374761393)^Math.imul(n|0,668265263)^Math.imul(o|0,2246822519);return u=Math.imul(u^u>>>13,1274126177),((u^u>>>16)>>>0)/4294967295}function Fs(t,n,o,u){const p=Math.floor(t),P=Math.floor(n),r=t-p,S=n-P,N=r*r*(3-2*r),h=S*S*(3-2*S),x=Math.max(1,Math.round(o)),k=O=>(O%x+x)%x,y=k(p),f=k(p+1),E=k(P),i=k(P+1),D=Nt(y,E,u),T=Nt(f,E,u),V=Nt(y,i,u),G=Nt(f,i,u);return(D+(T-D)*N)*(1-h)+(V+(G-V)*N)*h}function gt(t,n,o,u,p){let P=0,r=.5,S=0,N=o;for(let h=0;h<u;h+=1)P+=r*Fs(t*N,n*N,N,p+h*17),S+=r,r*=.5,N*=2;return P/S}function Ea(t){let n=t>>>0||1;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function rn(t,n){const o=document.createElement("canvas");o.width=t,o.height=n;const u=o.getContext("2d");if(!u)throw new Error("2D canvas is unavailable");return{canvas:o,ctx:u}}const Ls={crater:{seed:101,macro:.38,mid:.17,fine:.12,speck:.15,craters:20,stones:90,cracks:0,ripples:0,gloss:.02},rock:{seed:211,macro:.4,mid:.22,fine:.14,speck:.2,craters:5,stones:150,cracks:9,ripples:1,gloss:.05},volcano:{seed:331,macro:.32,mid:.24,fine:.16,speck:.22,craters:4,stones:110,cracks:14,ripples:0,gloss:.08},ice:{seed:401,macro:.26,mid:.2,fine:.2,speck:.16,craters:5,stones:18,cracks:22,ripples:0,gloss:.5},plain:{seed:509,macro:.3,mid:.15,fine:.1,speck:.13,craters:8,stones:70,cracks:3,ripples:.35,gloss:.03},plasma:{seed:601,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0},ring:{seed:701,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0}};function _n(t,n,o,u,p,P,r,S,N=!1){const h=Math.ceil(P),x=Math.round(u),k=Math.round(p);for(let y=-h;y<=h;y+=1)for(let f=-h;f<=h;f+=1){const E=(f*f+y*y)/(P*P);if(E>=1)continue;const i=N?Math.sqrt(1-E):1-E,D=((x+f)%o+o)%o,V=((k+y)%o+o)%o*o+D;t[V]+=r*i,n[V]+=S*i}}function Us(t,n,o,u,p,P,r){const S=.09+r()*.12,N=.05+r()*.06,h=.72+r()*.5,x=r()*Math.PI,k=Math.cos(x),y=Math.sin(x),f=Math.ceil(P*1.4),E=Math.round(u),i=Math.round(p);for(let D=-f;D<=f;D+=1)for(let T=-f;T<=f;T+=1){const V=(T*k+D*y)/P,G=(-T*y+D*k)/(P*h),O=Math.sqrt(V*V+G*G);if(O>1.4)continue;let H=0,X=0;O<1&&(H-=Math.pow(1-O*O,1.25)*S,X-=(1-O)*.05);const Q=Math.exp(-Math.pow((O-1.02)/.2,2))*N;H+=Q,X+=Q*1.1+(O>1&&O<1.35?.02:0);const ie=((E+T)%o+o)%o,Y=((i+D)%o+o)%o*o+ie;n[Y]+=H,t[Y]+=X}}function mo(t,n,o,u,p,P,r,S,N,h){const k=Math.max(2,Math.floor(r/1.1));let y=P,f=u,E=p;for(let i=0;i<k;i+=1){y+=(N()-.5)*.3,f+=Math.cos(y)*1.1,E+=Math.sin(y)*1.1;const D=S*(.6+N()*.8);h?(_n(t,n,o,f,E,D*2.2,.03,.008),_n(t,n,o,f,E,D,-.05,-.03)):_n(t,n,o,f,E,D,-.07,-.03)}}function Os(t,n){const o=Ls[t],u=Ea(o.seed),p=n/za,P=new Float32Array(n*n),r=new Float32Array(n*n),S=new Float32Array(n*n),N=7;for(let f=0;f<n;f+=1){const E=f/n;for(let i=0;i<n;i+=1){const D=i/n,T=f*n+i,V=gt(D,E,3,4,o.seed),G=gt(D,E,11,3,o.seed+13),O=gt(D,E,43,2,o.seed+29),H=Nt(i,f,o.seed+71)-.5;let X=1+(V-.5)*o.macro+(G-.5)*o.mid+(O-.5)*o.fine+H*o.speck,Q=.5+(V-.5)*.06+(G-.5)*.07+(O-.5)*.08+H*.03,ie=o.gloss;if(o.ripples>0){const oe=E*N+(V-.5)*.85+(G-.5)*.3,Y=Math.sin(oe*lt);X+=Y*.055*o.ripples,Q+=Y*.018*o.ripples}if(t==="volcano"){const oe=1-Math.abs(2*O-1);oe>.94?(X+=(oe-.94)*2.2,Q-=.02,ie+=.1):oe<.22&&(X-=(.22-oe)*.6)}t==="ice"&&(Math.abs(G-.5)<.012&&(X-=.24,Q-=.035),X=.82+(X-1)*.95+(O-.5)*.12,ie=ht(.35+O*.55)),(t==="crater"||t==="ring")&&V<.34&&(X-=(.34-V)*1.1),t==="plain"&&(X+=Tt(.55,.78,V)*.18),P[T]=X,r[T]=Q,S[T]=ie}}for(let f=0;f<o.craters;f+=1){const E=(.3+Math.pow(u(),1.7)*1.1)*p;Us(P,r,n,u()*n,u()*n,E,u)}for(let f=0;f<o.stones;f+=1){const i=(u()<.18?.14+u()*.3:.03+u()*.09)*p,D=f%3===0?.12:-.08;_n(P,r,n,u()*n,u()*n,Math.max(.8,i),D,.02+i*.0012,!0)}for(let f=0;f<o.cracks;f+=1){const E=u()*n,i=u()*n,D=(.6+u()*3.4)*p;mo(P,r,n,E,i,u()*lt,D,.8+u()*1.4,u,t==="ice")}if(t==="ice"){const f=()=>.5;for(let E=0;E<11;E+=1){const i=u()*lt,D=n*(.45+u()*.75),T=u()*n,V=u()*n;mo(P,r,n,T-Math.cos(i)*D*.5,V-Math.sin(i)*D*.5,i,D,1+u()*1.4,f,!0)}for(let E=0;E<10;E+=1){const i=u()*n,D=u()*n,T=u()*lt;mo(P,r,n,i,D,T,(.4+u()*1.6)*p,.8+u(),u,!0)}}const{canvas:h,ctx:x}=rn(n,n),k=x.createImageData(n,n),y=k.data;for(let f=0;f<n*n;f+=1)y[f*4]=Math.round(Wn(P[f]*.5,0,1)*255),y[f*4+1]=Math.round(Wn(r[f],0,1)*255),y[f*4+2]=Math.round(Wn(S[f],0,1)*255),y[f*4+3]=255;return x.putImageData(k,0,0),h}function le(t){const n=parseInt(t.replace("#",""),16);return[n>>16&255,n>>8&255,n&255]}function et(t,n,o){return[t[0]+(n[0]-t[0])*o,t[1]+(n[1]-t[1])*o,t[2]+(n[2]-t[2])*o]}function Gs(t,n,o){const u=t*n,p=Math.floor(u),P=u-p,r=k=>{const y=(k%2+2)%2===0,f=Nt(k,7,o);return y?.56+.4*f:.04+.3*f},S=r(p),N=r(p-1),h=r(p+1),x=.44;return P<x?N+(S-N)*Tt(0,1,P/x):P>1-x?S+(h-S)*Tt(0,1,(P-(1-x))/x):S}const Mo={jupiter:{bands:16,seed:3301,streaky:.8,polar:null,spots:[{u:.62,v:.66,ru:.085,rv:.05,color:le("#a8492f"),swirl:2},{u:.24,v:.34,ru:.05,rv:.026,color:le("#f6efdd"),swirl:0},{u:.46,v:.4,ru:.035,rv:.02,color:le("#fbf3e1"),swirl:0},{u:.83,v:.44,ru:.03,rv:.018,color:le("#f4ecd9"),swirl:0},{u:.36,v:.74,ru:.06,rv:.03,color:le("#8d4b30"),swirl:0}]},saturn:{bands:20,seed:3307,streaky:.38,polar:le("#c9d4d8"),spots:[{u:.7,v:.3,ru:.04,rv:.02,color:le("#f7edd2"),swirl:0},{u:.3,v:.72,ru:.035,rv:.018,color:le("#e6d3a4"),swirl:0}]},uranus:{bands:7,seed:3313,streaky:.25,polar:le("#e6fbfd"),spots:[{u:.55,v:.36,ru:.06,rv:.03,color:le("#dcf4f6"),swirl:0}]},neptune:{bands:9,seed:3319,streaky:.5,polar:le("#a9c8f2"),spots:[{u:.34,v:.62,ru:.06,rv:.032,color:le("#1f3a72"),swirl:1},{u:.72,v:.46,ru:.05,rv:.012,color:le("#e9f3ff"),swirl:0},{u:.62,v:.36,ru:.035,rv:.009,color:le("#f2f8ff"),swirl:0}]}};function Bs(t,n,o,u=2){const p=new Uint8ClampedArray(t.length);for(let P=0;P<u;P+=1){for(let r=0;r<o;r+=1)for(let S=0;S<n;S+=1){const N=(S-1+n)%n*4,h=S*4,x=(S+1)%n*4,k=r*n*4;for(let y=0;y<3;y+=1)p[k+h+y]=(t[k+N+y]+t[k+h+y]*2+t[k+x+y])/4}for(let r=0;r<o;r+=1){const S=(r-1+o)%o*n*4,N=r*n*4,h=(r+1)%o*n*4;for(let x=0;x<n;x+=1){const k=x*4;for(let y=0;y<3;y+=1)t[N+k+y]=(p[S+k+y]+p[N+k+y]*2+p[h+k+y])/4}}}}function Ta(t,n,o){const u=Mo[t.id]??Mo.jupiter,p=le(t.ground),P=le(t.ground2),r=le(t.ground3),{canvas:S,ctx:N}=rn(n,o),h=N.createImageData(n,o),x=h.data,k=u.seed,y=new Float32Array(n*o),f=new Float32Array(n*o);for(let T=0;T<o;T+=1){const V=T/o;for(let G=0;G<n;G+=1){const O=G/n,H=(gt(O,V,4,3,k)-.5)*.03+(gt(O,V,13,2,k+7)-.5)*.005,X=ht(V+H);let Q=Gs(X,u.bands,k);const ie=gt(O*3,V*9,9,3,k+31)-.5;Q+=ie*.13*u.streaky;let oe;if(Q<.5?oe=et(r,P,ht(Q*2)):oe=et(P,p,ht((Q-.5)*2)),u.polar){const Ne=Tt(.82,1,Math.abs(V-.5)*2);oe=et(oe,u.polar,Ne*.45)}for(const Ne of u.spots){const tt=(O-Ne.u)/Ne.ru,Xe=(V-Ne.v)/Ne.rv,nt=tt*tt+Xe*Xe;if(nt<2.2){const yt=Tt(1.05,.25,nt),pe=Ne.swirl>0?.82+.18*Math.sin(Math.atan2(Xe,tt)*3+nt*7):1;oe=et(oe,[Ne.color[0]*pe,Ne.color[1]*pe,Ne.color[2]*pe],yt*.92)}}const Y=(T*n+G)*4;x[Y]=oe[0],x[Y+1]=oe[1],x[Y+2]=oe[2],x[Y+3]=255,y[T*n+G]=ht(.5+ie*.85+(Q-.5)*.5),f[T*n+G]=.5+ie*.85}}const E=t.sunAz*Math.PI/180,i=Math.sin(E),D=-Math.cos(E);for(let T=0;T<o;T+=1){const V=(T+1)%o,G=(T-1+o)%o;for(let O=0;O<n;O+=1){const H=(O+1)%n,X=(O-1+n)%n,Q=f[T*n+H]-f[T*n+X],ie=f[V*n+O]-f[G*n+O],oe=Wn(1+(Q*i+ie*D)*1.8,.9,1.1),Y=(T*n+O)*4;x[Y]=Math.min(255,x[Y]*oe),x[Y+1]=Math.min(255,x[Y+1]*oe),x[Y+2]=Math.min(255,x[Y+2]*oe),x[Y+3]=Math.round(ht(.74+y[T*n+O]*.4)*255)}}return Bs(x,n,o,2),N.putImageData(h,0,0),S}function Vs(t,n){if(Mo[t.id])return Ta(t,n,n);const{canvas:o,ctx:u}=rn(n,n),p=u.createImageData(n,n),P=p.data,r=le(t.ground),S=le(t.ground2),N=le(t.ground3);for(let h=0;h<n;h+=1){const x=h/n;for(let k=0;k<n;k+=1){const y=k/n,f=gt(y,x,4,4,9021),E=gt(y,x,16,3,9027),i=ht(f*.72+E*.4);let D=et(S,r,Tt(.25,.72,i));D=et(D,N,Tt(.66,.95,i)*.8);const T=(h*n+k)*4;P[T]=D[0],P[T+1]=D[1],P[T+2]=D[2],P[T+3]=255}}return u.putImageData(p,0,0),o}function js(t,n,o){const{canvas:u,ctx:p}=rn(n,o),P=Ea(t==="moon"?51:t==="pluto"?67:83),r=t==="pluto"?"#cbb6a4":t==="charon"?"#9d9a95":"#9a9691";if(p.fillStyle=r,p.fillRect(0,0,n,o),t==="pluto")p.fillStyle="#f3ece1",p.beginPath(),p.ellipse(n*.56,o*.46,n*.13,o*.16,-.2,0,lt),p.fill(),p.beginPath(),p.ellipse(n*.72,o*.4,n*.07,o*.12,.35,0,lt),p.fill(),p.fillStyle="rgba(96,68,54,0.62)",p.beginPath(),p.ellipse(n*.24,o*.6,n*.2,o*.13,.1,0,lt),p.fill(),p.beginPath(),p.ellipse(n*.2,o*.32,n*.14,o*.1,-.2,0,lt),p.fill();else if(t==="moon")for(let S=0;S<9;S+=1)p.fillStyle=`rgba(58,56,54,${.5+P()*.3})`,p.beginPath(),p.ellipse(P()*n,(.18+P()*.6)*o,(.04+P()*.07)*n,(.03+P()*.06)*o,P()*3,0,lt),p.fill();else p.fillStyle="rgba(120,84,70,0.6)",p.beginPath(),p.ellipse(n*.5,o*.06,n*.4,o*.09,0,0,lt),p.fill();for(let S=0;S<220;S+=1){const N=(2+Math.pow(P(),2.4)*26)*(n/1024),h=P()*n,x=P()*o,k=p.createRadialGradient(h,x,0,h,x,N);k.addColorStop(0,"rgba(38,36,34,0.5)"),k.addColorStop(.72,"rgba(70,66,62,0.28)"),k.addColorStop(.9,"rgba(238,233,224,0.32)"),k.addColorStop(1,"rgba(255,255,255,0)"),p.fillStyle=k,p.beginPath(),p.arc(h,x,N,0,lt),p.fill()}for(let S=0;S<2600;S+=1){const N=(.6+Math.pow(P(),3)*4)*(n/1024);p.fillStyle=P()<.5?"rgba(255,255,255,0.16)":"rgba(30,28,26,0.16)",p.beginPath(),p.arc(P()*n,P()*o,N,0,lt),p.fill()}return u}function $s(t,n){const{canvas:o,ctx:u}=rn(t,n),p=u.createImageData(t,n),P=p.data,r=le("#0f3f74"),S=le("#2f8fb0"),N=le("#3f7a45"),h=le("#9a8a55"),x=le("#f2f7fc");for(let k=0;k<n;k+=1){const y=k/n;for(let f=0;f<t;f+=1){const E=f/t,i=E*3.1,D=y*2.4,T=gt(i,D,4,5,4404)+(gt(i*3,D*3,12,3,4411)-.5)*.18,V=T>.55;let G;if(V){const ie=ht((T-.55)*4.2);G=et(N,h,ie*.7),ie>.55&&(G=et(G,le("#cfc9bb"),(ie-.55)*1.6))}else G=et(r,S,ht((T-.35)*3.2));const O=Tt(.86,.98,Math.abs(y-.5)*2);O>0&&(G=et(G,x,O));const H=gt(E*2,y*6,12,4,4423),X=Tt(.56,.82,H)*.72;X>0&&(G=et(G,le("#fbfdff"),X));const Q=(k*t+f)*4;P[Q]=G[0],P[Q+1]=G[1],P[Q+2]=G[2],P[Q+3]=255}}return u.putImageData(p,0,0),o}function Xs(t,n,o,u){if(t==="earth")return $s(o,u);if(t==="moon"||t==="pluto"||t==="charon")return js(t,o,u);const p=t==="saturn"?{...n,id:"saturn",ground:"#f2e2ba",ground2:"#c6a978",ground3:"#9b7f52"}:{...n,id:"jupiter",ground:"#e9d6b4",ground2:"#b57d50",ground3:"#8b5a38"};return Ta(p,o,u)}function Ys(t){const{canvas:o,ctx:u}=rn(t,4),p=u.createImageData(t,4),P=p.data,r=1.11,S=2.36,N=le("#f6efdd"),h=le("#c9b48d"),x=le("#6f6455"),k=[[1.11,1.235,.1,.15],[1.235,1.525,.42,.3],[1.525,1.95,.98,.62],[1.951,2.025,.06,.1],[2.025,2.21,.72,.5],[2.211,2.215,.04,.1],[2.215,2.27,.66,.46],[2.27,2.31,.06,.1],[2.315,2.34,.34,.55]];for(let y=0;y<t;y+=1){const f=y/(t-1),E=r+(S-r)*f;let i=0,D=.5;for(const[H,X,Q,ie]of k)if(E>=H&&E<=X){i=Q,D=ie,i*=.82+.18*Math.sin((E-H)*820+Math.sin((E-H)*140)*2);break}const T=[1.29,1.44,1.63,1.72,1.88,2.06,2.15,2.24,2.29];for(const H of T)Math.abs(E-H)<.0035&&(i*=.12);i*=.9+.14*Nt(Math.floor(E*900),3,9931);const V=Nt(Math.floor(y/2),7,9931);let G=et(h,N,D);G=et(G,x,(1-Math.min(1,i))*.35);const O=.82+V*.3;for(let H=0;H<4;H+=1){const X=(H*t+y)*4;P[X]=G[0]*O,P[X+1]=G[1]*O,P[X+2]=G[2]*O,P[X+3]=Math.round(ht(i)*255)}}return u.putImageData(p,0,0),o}const Et=new Map;function Un(t,n,o,u,p,P){const r=new Ln(n);for(r.colorSpace=o?yn:ka,r.wrapS=u?Qa:es,r.wrapT=r.wrapS,r.anisotropy=p,r.magFilter=ts,r.minFilter=ns,r.generateMipmaps=!0,r.needsUpdate=!0,Et.set(t,r);Et.size>P;){const S=Et.keys().next();if(S.done)break;const N=Et.get(S.value);Et.delete(S.value),N?.dispose()}return r}function Hs(t,n,o){const u=`ground:${t}:${n?"l":"h"}`,p=Et.get(u);return p||Un(u,Os(t,n?320:512),!1,!0,o,6)}function qs(t,n,o){const u=`cloud:${t.id}:${n?"l":"h"}`,p=Et.get(u);return p||Un(u,Vs(t,n?512:1024),!0,!0,o,4)}function wa(t,n,o,u){const P=`body:${t??n.id}:${o?"l":"h"}`,r=Et.get(P);if(r)return r;const S=o?768:1024;return Un(P,Xs(t,n,S,S/2),!0,!1,u,3)}function vo(t,n){const o=`ring:${t?"l":"h"}`,u=Et.get(o);return u||Un(o,Ys(t?1024:2048),!0,!1,n,2)}const sn=Math.PI/180,en=1500,Dn=2800;function An(t,n){const o=Math.sin(t*127.1+n*311.7)*43758.5453;return o-Math.floor(o)}function xo(t){return t*t*(3-2*t)}function Ks(t,n){const o=Math.floor(t),u=Math.floor(n),p=t-o,P=n-u,r=An(o,u),S=An(o+1,u),N=An(o,u+1),h=An(o+1,u+1),x=xo(p),k=xo(P);return(r*(1-x)+S*x)*(1-k)+(N*(1-x)+h*x)*k}function Rn(t,n,o=4){let u=0,p=.5,P=1;for(let r=0;r<o;r+=1)u+=p*Ks(t*P,n*P),P*=2.03,p*=.5;return u}function tn(t){let n=t>>>0||1;return()=>(n=n*1664525+1013904223>>>0,n/4294967296)}function Zs(t){let n=2166136261;for(let o=0;o<t.length;o+=1)n=Math.imul(n^t.charCodeAt(o),16777619);return n>>>0}function ho(t,n){const o=t*sn,u=n*sn;return new I(Math.sin(o)*Math.cos(u),Math.sin(u),-Math.cos(o)*Math.cos(u)).normalize()}function Js(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d"),u=o.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);u.addColorStop(0,"rgba(255,255,255,1)"),u.addColorStop(.25,"rgba(255,236,196,0.72)"),u.addColorStop(.6,"rgba(255,190,110,0.18)"),u.addColorStop(1,"rgba(255,170,80,0)"),o.fillStyle=u,o.fillRect(0,0,128,128);const p=new Ln(n);return p.colorSpace=yn,p}const Qs=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,er=`
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform vec3 uSun;
uniform vec3 uSunDir;
uniform float uSunRadius;
uniform float uSunHaze;
uniform float uGlowGain;
varying vec3 vDir;
float dither(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}
void main() {
  vec3 d = normalize(vDir);
  float up = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(uBottom, uTop, pow(up, 0.45));
  float band = pow(1.0 - clamp(abs(d.y) / 0.2, 0.0, 1.0), 3.0);
  col += uGlow * band * uGlowGain * 0.55;
  if (uSunRadius > 0.0) {
    float ang = acos(clamp(dot(d, uSunDir), -1.0, 1.0));
    float disc = 1.0 - smoothstep(uSunRadius * 0.9, uSunRadius * 1.1, ang);
    float halo = exp(-(ang * ang) / (uSunRadius * uSunRadius * 9.0 + 1e-9));
    col += uSun * disc * mix(6.0, 1.6, uSunHaze);
    col += uSun * halo * mix(0.35, 1.5, uSunHaze);
    col += uGlow * exp(-ang * 4.0) * 0.05;
  }
  col += (dither(d * 431.0) - 0.5) * 0.008;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,tr=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,nr=`
uniform float uTime;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
varying vec3 vPos;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 p = vPos.xz * 0.006;
  float n1 = fbm(p + vec2(uTime * 0.03, uTime * 0.018));
  float n2 = fbm(p * 3.1 - vec2(uTime * 0.05, 0.0));
  vec3 col = mix(uC, uA, smoothstep(0.18, 0.72, n1));
  col = mix(col, uB, smoothstep(0.42, 0.9, n2) * 0.6);
  float far = clamp(length(vPos.xz) / 900.0, 0.0, 1.0);
  col = mix(col, uB, far * 0.35);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;function or(t,n={}){const o=!!n.low,u=n.anisotropy??(o?4:8),p=new ge,P=[],r=m=>(P.push(m),m);let S=null;const N=Zs(t.id),h=tn(N),x=r(Js()),k=[],y=[];if(t.terrain==="crater"){for(let m=0;m<(o?16:26);m+=1){const v=h()*Math.PI*2,M=20+Math.sqrt(h())*460,l=16+h()*74;k.push({x:Math.cos(v)*M,z:Math.sin(v)*M,r:l,d:l*(.16+h()*.2)})}for(let m=0;m<(o?26:48);m+=1){const v=h()*Math.PI*2,M=4+Math.pow(h(),.7)*150,l=2.5+Math.pow(h(),1.6)*11;k.push({x:Math.cos(v)*M,z:Math.sin(v)*M,r:l,d:l*(.2+h()*.22)})}}if(t.terrain==="volcano")for(let m=0;m<6;m+=1){const v=h()*Math.PI*2,M=60+h()*380;y.push({x:Math.cos(v)*M,z:Math.sin(v)*M,r:40+h()*90,h:12+h()*34})}if(t.terrain==="rock")for(let m=0;m<5;m+=1){const v=h()*Math.PI*2,M=60+h()*400;y.push({x:Math.cos(v)*M,z:Math.sin(v)*M,r:50+h()*110,h:6+h()*16})}function f(m,v,M,l=4){return(Rn(m*M,v*M,l)-.48)*2}function E(m,v){if(t.terrain==="plasma"||t.terrain==="ring")return 0;const M=Math.hypot(m,v);let l=0;if(t.terrain==="crater"){l=f(m+11,v+7,.004,4)*16+f(m+3,v+17,.0012,2)*34+f(m+5,v+23,.026,3)*3;for(const b of k){const B=Math.hypot(m-b.x,v-b.z)/b.r;B<1&&(l-=b.d*Math.pow(1-B*B,1.5)),B<1.3&&(l+=b.d*.28*Math.exp(-Math.pow((B-1.02)/.17,2)))}}else if(t.terrain==="rock"){l=f(m+5,v+2,.0035,4)*40,l+=(1-Math.abs(f(m,v,.011,3)))*12,l+=f(m+21,v+13,.0011,2)*60,l+=f(m+31,v+41,.028,3)*3.4;for(const b of y){const B=Math.hypot(m-b.x,v-b.z)/b.r;B<1&&(l+=b.h*Math.pow(1-B,1.7))}}else if(t.terrain==="volcano"){l=f(m+3,v+8,.005,4)*14+f(m+9,v+1,.0012,2)*22;for(const b of y){const B=Math.hypot(m-b.x,v-b.z)/b.r;B<1&&(l+=b.h*Math.pow(1-B,1.25)),B<.24&&(l-=b.h*.5*(1-B/.24))}}else t.terrain==="ice"?l=f(m+9,v+4,.003,4)*9+f(m,v,.012,2)*2.2+f(m+2,v+8,.035,3)*1.1:l=f(m+7,v+3,.0035,4)*12+f(m,v,.012,2)*2.6+f(m+4,v+2,.03,3)*3;const U=Math.max(0,M-1500)/500;return l-=U*U*5,l+=(Rn(m*.09+1,v*.09+6,2)-.5)*(t.terrain==="rock"?1.2:t.terrain==="ice"?.25:.5),l}const i=E(0,0);function D(m,v){return E(m,v)-i}const T=(()=>{if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring")return{x:0,z:0};const m=[];for(let M=0;M<40;M+=1){const l=M/40*Math.PI*2,U=M%5*34,b=Math.cos(l)*U,B=Math.sin(l)*U;let q=0;for(let K=0;K<8;K+=1){const Le=K/8*Math.PI*2;q+=D(b+Math.cos(Le)*120,B+Math.sin(Le)*120)}m.push({x:b,z:B,score:D(b,B)-q/8})}m.sort((M,l)=>l.score-M.score);const v=m[Math.floor(m.length*.28)];return{x:v.x,z:v.z}})(),V=t.cloudTop!==null?t.cloudTop:D(T.x,T.z),G=1.7,O=ho(t.sunAz,t.sunElev),H=t.sunScale>0?.2667*t.sunScale*sn:0,X=Math.max(0,Math.min(1,t.fogDensity*26)),Q=r(new he({vertexShader:Qs,fragmentShader:er,side:on,depthWrite:!1,uniforms:{uTop:{value:new j(t.skyTop)},uBottom:{value:new j(t.skyBottom)},uGlow:{value:new j(t.glow)},uSun:{value:new j(t.sunColor)},uSunDir:{value:O.clone()},uSunRadius:{value:H},uSunHaze:{value:X},uGlowGain:{value:t.glowGain}}})),ie=new F(r(new ae(Dn,32,20)),Q);if(ie.frustumCulled=!1,p.add(ie),t.stars){const m=o?320:620,v=new Float32Array(m*3),M=tn(N^2654435769);for(let b=0;b<m;b+=1){const B=M()*Math.PI*2,q=Math.pow(M(),.65)*.98+.02,K=Math.sqrt(1-q*q);v[b*3]=Math.cos(B)*K*(Dn-200),v[b*3+1]=q*(Dn-200),v[b*3+2]=Math.sin(B)*K*(Dn-200)}const l=r(new St);l.setAttribute("position",new an(v,3));const U=new go(l,r(new yo({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1})));U.frustumCulled=!1,p.add(U)}const oe=Math.min(1.5,.45+.9*Math.min(1,Math.max(t.sunScale,.02)*1.5)),Y=t.stars?.4:.46,Ne=(m,v)=>{const l=-(D(m+.9,v)-D(m-.9,v))/1.8,U=-(D(m,v+.9)-D(m,v-.9))/(2*.9),b=1/Math.sqrt(l*l+1+U*U),B=Math.max(0,(l*O.x+O.y+U*O.z)*b);return Y+oe*B};let tt=[],Xe=null;if(t.terrain==="plasma"){const m=r(new he({vertexShader:tr,fragmentShader:nr,uniforms:{uTime:{value:0},uA:{value:new j(t.ground)},uB:{value:new j(t.ground2)},uC:{value:new j(t.ground3)}}}));Xe=m;const v=new F(r(new vn(2400,2400,1,1)),m);v.rotation.x=-Math.PI/2,v.position.y=0,p.add(v)}else if(t.terrain!=="ring")if(t.cloudTop!==null){const m=qs(t,o,u),v=Math.min(1.12,.55+.5*Math.min(1,Math.max(t.sunScale,.02)*2)),M=(B,q)=>r(new he({vertexShader:_s,fragmentShader:Ns,uniforms:{uMap:{value:m},uOffset:{value:new gn(0,0)},uTile:{value:B},uDetail:{value:11},uTint:{value:new j().setScalar(q)},uOpacity:{value:1},uFogColor:{value:new j(t.fog)},uFogDensity:{value:t.fogDensity}}})),l=new F(r(new vn(5200,5200,1,1)),M(ya,v));l.rotation.x=-Math.PI/2,l.position.y=t.cloudTop,p.add(l),tt=[l.material];const U=M(ya*.42,v*.86);U.uniforms.uOpacity.value=.55,U.transparent=!0,U.depthWrite=!1;const b=new F(r(new vn(5200,5200,1,1)),U);b.rotation.x=-Math.PI/2,b.position.y=t.cloudTop-90,p.add(b),tt.push(U)}else{const m=o?96:150,v=r(new vn(en*2,en*2,m,m));v.rotateX(-Math.PI/2);const M=v.attributes.position,l=new Float32Array(M.count*3),U=new j(t.ground),b=new j(t.ground2),B=new j(t.ground3),q=new j;for(let we=0;we<M.count;we+=1){const Te=M.getX(we)/en,Ue=M.getZ(we)/en,de=Math.sign(Te)*Math.pow(Math.abs(Te),1.8)*en,De=Math.sign(Ue)*Math.pow(Math.abs(Ue),1.8)*en,Ye=D(de,De);M.setXYZ(we,de,Ye,De);const Ae=Rn(de*.02+3,De*.02+9,3);q.copy(U).lerp(b,xo(Math.min(1,Math.max(0,(Ae-.28)/.5)))),Ye<-1.6&&q.lerp(B,Math.min(1,(-Ye-1.6)/7));const Me=Rn(de*.0045+17,De*.0045+41,3),Se=Math.min(1.9,Ne(de,De))*(.9+(Ae-.5)*.22)*(.84+Me*.34);l[we*3]=q.r*Se,l[we*3+1]=q.g*Se,l[we*3+2]=q.b*Se}v.setAttribute("color",new an(l,3)),v.computeVertexNormals();const K=Hs(t.terrain,o,u),Le=1/(K.image.width||512),st=r(new he({vertexShader:Is,fragmentShader:Ws,vertexColors:!0,uniforms:{uMap:{value:K},uTexel:{value:Le},uTile:{value:za},uDetail:{value:5.6},uBump:{value:9},uGloss:{value:t.terrain==="ice"?.9:.25},uSunDir:{value:O.clone()},uSunColor:{value:new j(t.sunColor)},uFogColor:{value:new j(t.fog)},uFogDensity:{value:t.fogDensity},uAmbient:{value:Y},uSunPower:{value:oe}}})),rt=new F(v,st);p.add(rt);const ye=tn(N^2135587861),Lt=[t.ground2,t.ground3,t.ground].map(we=>new j(we).multiplyScalar(Y+oe*.75)),it=(we,Te,Ue,de,De,Ye,Ae)=>{const Me=new wo(we,r(new J({color:16777215})),Te),Se=new io;for(let Ge=0;Ge<Te;Ge+=1){const pt=ye()*Math.PI*2,Be=Ue+Math.sqrt(ye())*(de-Ue),Mt=T.x+Math.cos(pt)*Be,Pt=T.z+Math.sin(pt)*Be,Re=De+Math.pow(ye(),2.1)*(Ye-De);Se.position.set(Mt,D(Mt,Pt)+Re*Ae,Pt),Se.scale.set(Re*(.8+ye()*.7),Re*(.45+ye()*.5),Re*(.8+ye()*.7)),Se.rotation.set(ye()*3,ye()*3,ye()*3),Se.updateMatrix(),Me.setMatrixAt(Ge,Se.matrix),Me.setColorAt(Ge,Lt[Ge%3])}Me.instanceMatrix.needsUpdate=!0,Me.instanceColor&&(Me.instanceColor.needsUpdate=!0),p.add(Me)};if(it(r(new nn(1,0)),o?90:170,1.2,60,.02,.22,.35),it(r(new nn(1,1)),o?30:54,2,120,.18,1.1,.34),it(r(new nn(1,1)),o?10:18,6,190,.6,2.4,.4),t.terrain==="ice"){const we=[],Te=tn(N^1542469173),Ue=(De,Ye,Ae,Me,Se,Ge)=>{let pt=De,Be=Ye,Mt=Ae;for(let Pt=0;Pt<Me;Pt+=1){const Re=pt+Math.cos(Mt)*Se,dt=Be+Math.sin(Mt)*Se;we.push(pt,D(pt,Be)+.06,Be,Re,D(Re,dt)+.06,dt),pt=Re,Be=dt,Mt+=(Te()-.5)*.9,Ge>0&&Pt===Me>>1&&Te()<.7&&Ue(pt,Be,Mt+(Te()<.5?.9:-.9),Math.max(3,Me>>2),Se*.8,Ge-1)}};for(let De=0;De<(o?6:10);De+=1)Ue((Te()-.5)*300,(Te()-.5)*300,Te()*Math.PI*2,14,14,1);const de=r(new St);de.setAttribute("position",new an(new Float32Array(we),3)),p.add(new Ca(de,r(new hn({color:t.ground3,transparent:!0,opacity:.75}))))}}if(t.terrain==="ring"){const m=new ge;m.position.copy(ho(t.companionAz,0)).multiplyScalar(2600);const v=-4.3;m.position.y=v;const M=480,l=M*1.11,U=M*2.36,b=new F(r(new ae(M,o?64:128,o?44:80)),r(new he({vertexShader:ha,fragmentShader:ga,uniforms:{uMap:{value:wa("saturn",t,o,u)},uLimb:{value:.4},uRim:{value:new j("#e8dcbc")}}})));m.add(b);const B=r(new he({vertexShader:Qt,fragmentShader:po,transparent:!0,side:_e,depthWrite:!1,uniforms:{uProfile:{value:vo(o,u)},uInner:{value:l},uOuter:{value:U},uAlpha:{value:o?.78:.88}}})),q=new F(r(new ut(l,U,o?128:220,1)),B);q.rotation.x=-Math.PI/2,q.position.y=v,m.add(q),p.add(m);const K=o?220:420,Le=r(new nn(1,0)),st=r(new J({color:"#dfe8f2"})),rt=new wo(Le,st,K);rt.instanceMatrix.setUsage(os);const ye=tn(N^1374496523),Lt=[],it=new io;for(let de=0;de<K;de+=1){const Ye=de%31===0?.5+ye()*1.3:.05+Math.pow(ye(),2)*.55,Ae=14+Math.pow(ye(),.7)*150,Me=ye()*Math.PI*2,Se=(ye()-.5)*14;Lt.push({r:Ae,a:Me,y:Se,spin:.02+ye()*.08,size:Ye,wob:ye()*Math.PI*2}),it.position.set(Math.cos(Me)*Ae,Se,Math.sin(Me)*Ae),it.rotation.set(ye()*3,ye()*3,ye()*3),it.scale.setScalar(Ye),it.updateMatrix(),rt.setMatrixAt(de,it.matrix);const Ge=.5+ye()*.45;rt.setColorAt(de,new j(Ge,Ge*.98,Ge*1.05))}rt.instanceMatrix.needsUpdate=!0,rt.instanceColor&&(rt.instanceColor.needsUpdate=!0),p.add(rt),S={mesh:rt,data:Lt};const we=r(new he({vertexShader:Qt,fragmentShader:Tn,transparent:!0,side:_e,depthWrite:!1,uniforms:{uInner:{value:.6},uOuter:{value:2600-U-10},uBands:{value:260},uA:{value:new j("#e2eaf4")},uB:{value:new j("#c3cfdd")},uAlpha:{value:.92},uGrain:{value:.26}}})),Te=2600-U-10,Ue=new F(r(new ut(.6,Te,128,1)),we);Ue.rotation.x=-Math.PI/2,Ue.position.y=v,p.add(Ue)}if(t.ring){const m=t.ring==="uranus",v=m?210:170,M=m?520:560,l=m?82*sn:27*sn,U=m?140:54,b=r(m?new he({vertexShader:Qt,fragmentShader:Tn,transparent:!0,side:_e,depthWrite:!1,uniforms:{uInner:{value:v},uOuter:{value:M},uBands:{value:U},uA:{value:new j("#9fd0d6")},uB:{value:new j("#cdeef2")},uAlpha:{value:.5},uGrain:{value:.4}}}):new he({vertexShader:Qt,fragmentShader:po,transparent:!0,side:_e,depthWrite:!1,uniforms:{uProfile:{value:vo(o,u)},uInner:{value:v},uOuter:{value:M},uAlpha:{value:.82}}})),B=new F(r(new ut(v,M,o?64:128,1)),b);if(B.rotation.x=-Math.PI/2+l,B.position.y=m?30:90,p.add(B),m){const q=r(new he({vertexShader:Qt,fragmentShader:Tn,transparent:!0,side:_e,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new j("#dff6f8")},uB:{value:new j("#bfe6ea")},uAlpha:{value:.35},uGrain:{value:.3}}})),K=new F(r(new ut(130,175,64,1)),q);K.rotation.x=-Math.PI/2+l,K.position.y=30,p.add(K)}}if(t.companion&&t.terrain!=="ring"){const v=Math.max(6,Math.tan(t.companionSize/2*sn)*1500),M=new ge;M.position.copy(ho(t.companionAz,t.companionElev)).multiplyScalar(1500);const l=wa(t.companion,t,o,u),U=new F(r(new ae(v,o?48:72,o?32:48)),r(new he({vertexShader:ha,fragmentShader:ga,uniforms:{uMap:{value:l},uLimb:{value:.42},uRim:{value:new j(t.companion==="earth"?"#9fd0ff":"#cfe0f2")}}})));if(U.lookAt(0,0,0),M.add(U),t.companion==="saturn"||t.companion==="jupiter"){const B=t.companion==="saturn",q=r(new he({vertexShader:Qt,fragmentShader:B?po:Tn,transparent:!0,side:_e,depthWrite:!1,uniforms:B?{uProfile:{value:vo(o,u)},uInner:{value:v*1.12},uOuter:{value:v*2.36},uAlpha:{value:.7}}:{uInner:{value:v*1.3},uOuter:{value:v*1.7},uBands:{value:16},uA:{value:new j("#d9c7a8")},uB:{value:new j("#b09070")},uAlpha:{value:.18},uGrain:{value:.3}}})),K=new F(r(new ut(v*(B?1.12:1.3),v*(B?2.36:1.7),64,1)),q);K.rotation.x=-Math.PI/2+.32,M.add(K)}const b=new Nn(r(new Fn({map:x,color:new j(t.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:ze})));b.scale.setScalar(v*4),M.add(b),p.add(M)}const nt=o?140:t.particles==="haze"?120:300;let yt=null,pe=null;if(t.particles!=="none"){const m=new Float32Array(nt*3);pe=new Float32Array(nt*3);const v=tn(N^625341585);for(let b=0;b<nt;b+=1){const B=v()*Math.PI*2,q=Math.sqrt(v())*55,K=t.particles;let Le=v()*22;K==="spark"&&(Le=v()*14),K==="haze"&&(Le=2+v()*26),m[b*3]=Math.cos(B)*q,m[b*3+1]=Le,m[b*3+2]=Math.sin(B)*q;const st=K==="wind"?42+v()*34:K==="rain"?12+v()*6:K==="spark"?2+v()*4:1.2+v()*2.6;pe[b*3]=K==="wind"?st:(v()-.5)*st*.5,pe[b*3+1]=K==="rain"?-st:K==="spark"?st:K==="snow"?-.6-v()*.9:(v()-.5)*.4,pe[b*3+2]=K==="wind"?st*.25:(v()-.5)*st*.4}yt=r(new St),yt.setAttribute("position",new an(m,3));const M=t.particles==="haze"?2.6:t.particles==="dust"?.14:t.particles==="rain"?.09:t.particles==="snow"?.11:.16,l=r(new yo({color:new j(t.particleColor),size:M,transparent:!0,opacity:t.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:t.particles==="spark"?ze:void 0})),U=new go(yt,l);U.frustumCulled=!1,p.add(U)}const ot=r(new nn(.26,0)),at=r(new ae(.24,16,12)),cn=t.cloudTop===null&&t.terrain!=="plasma",ft=[],wt=[],Dt=[];function jt(m,v,M,l){const U=new Nn(r(new Fn({map:x,color:new j(v),transparent:!0,opacity:.9,depthWrite:!1,blending:ze})));U.position.copy(m),U.scale.setScalar(M),p.add(U),wt.push({sprite:U,life:l,max:l,grow:M*2.4})}function Ft(m,v){const M=new F(r(new ut(.28,.5,24,1)),r(new J({color:new j(v),transparent:!0,opacity:.6,depthWrite:!1,side:_e})));M.rotation.x=-Math.PI/2,M.position.copy(m),p.add(M),Dt.push({mesh:M,life:.7})}function $t(m,v){const M=T.x+m,l=T.z+v,U=t.cloudTop!==null?t.cloudTop:D(M,l),b=cn?new J({color:new j("#c9c2b4").multiplyScalar(Y+oe*.8),transparent:!0}):new J({color:new j("#ffb45e"),transparent:!0}),B=new F(cn?ot:at,b);B.position.set(M,U+4.2,l),B.scale.setScalar(.9+Math.random()*.35),p.add(B);const q=t.gravityMps2<=.01;if(ft.push({mesh:B,x:M,z:l,y:q?U+.6:U+4.2,vy:q?.12:0,vx:q?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:q?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),ft.length>6){const K=ft.shift();K&&(p.remove(K.mesh),K.mesh.material.dispose())}}function Xt(m,v){const M=new I(m.x,v+.2,m.z);if(t.gravityMps2<=.01){m.outcome="float",m.landed=!0,m.resting=5.5,n.onLand?.({seconds:m.fall,bounces:0,outcome:"float"});return}if(t.terrain==="plasma"){m.outcome="vapor",m.landed=!0,m.resting=.25,jt(M,"#fff2c0",1.2,.6),n.onLand?.({seconds:m.fall,bounces:0,outcome:"vapor"});return}if(t.cloudTop!==null){m.outcome="sink",m.landed=!0,m.resting=1.6,jt(M,"#ffffff",1.6,.7),n.onLand?.({seconds:m.fall,bounces:0,outcome:"sink"});return}if(m.bounces+=1,Ft(M,t.ground2),m.bounces===1&&n.onLand?.({seconds:m.fall,bounces:1,outcome:"bounce"}),m.bounces>=4||Math.abs(m.vy)<1.3){m.landed=!0,m.outcome="bounce",m.resting=1.6,m.vy=0;return}m.vy=Math.abs(m.vy)*.42,m.y=v+.26,m.vx*=.6,m.vz*=.6}const Fe=new io;function $(m,v){Xe&&(Xe.uniforms.uTime.value=m);for(let M=0;M<tt.length;M+=1){const l=tt[M].uniforms.uOffset.value;l.x=(l.x+v*(M===0?.006:.012))%1}if(S){const{mesh:M,data:l}=S;for(let U=0;U<l.length;U+=1){const b=l[U];b.a+=b.spin*v*.05,Fe.position.set(Math.cos(b.a)*b.r,b.y+Math.sin(m*.25+b.wob)*.5,Math.sin(b.a)*b.r),Fe.rotation.set(m*.08+b.wob,m*.11+b.a,b.wob),Fe.scale.setScalar(b.size),Fe.updateMatrix(),M.setMatrixAt(U,Fe.matrix)}M.instanceMatrix.needsUpdate=!0}if(yt&&pe){const M=yt.attributes.position,l=M.array;for(let U=0;U<M.count;U+=1){const b=U*3;l[b]+=pe[b]*v,l[b+1]+=pe[b+1]*v,l[b+2]+=pe[b+2]*v,t.particles==="rain"||t.particles==="snow"?l[b+1]<0&&(l[b+1]=22):t.particles==="spark"?l[b+1]>20&&(l[b+1]=0):(l[b+1]<0&&(l[b+1]=24),l[b+1]>26&&(l[b+1]=0)),l[b]>60&&(l[b]=-60),l[b]<-60&&(l[b]=60),l[b+2]>60&&(l[b+2]=-60),l[b+2]<-60&&(l[b+2]=60)}M.needsUpdate=!0}for(let M=ft.length-1;M>=0;M-=1){const l=ft[M],U=t.cloudTop!==null?t.cloudTop:D(l.x,l.z);if(l.landed)l.resting>0?(l.resting-=v,l.outcome==="sink"?(l.y-=v*2.4,l.mesh.scale.multiplyScalar(1-v*.8)):l.outcome==="vapor"?l.mesh.scale.multiplyScalar(1-v*3):l.mesh.scale.multiplyScalar(1-v*.25)):(l.fade-=v*1.4,l.mesh.material.opacity=Math.max(0,l.fade),l.mesh.scale.multiplyScalar(1-v*.9),l.fade<=0&&(p.remove(l.mesh),l.mesh.material.dispose(),ft.splice(M,1)));else{if(l.fall+=v,t.gravityMps2<=.01){l.x+=l.vx*v,l.z+=l.vz*v,l.y+=l.vy*v,l.mesh.rotation.x+=v*.6,l.mesh.rotation.y+=v*.45,l.mesh.position.set(l.x,l.y,l.z),l.fall>.05&&Xt(l,l.y);continue}l.vy-=t.gravityMps2*v,l.y+=l.vy*v,l.x+=l.vx*v,l.z+=l.vz*v,l.mesh.rotation.x+=v*3.2,l.mesh.rotation.z+=v*2.1,l.y-.26<=U&&(l.y=U+.26,Xt(l,U))}l.mesh.position.set(l.x,l.y,l.z)}for(let M=wt.length-1;M>=0;M-=1){const l=wt[M];l.life-=v;const U=1-l.life/l.max;l.sprite.scale.setScalar(l.sprite.scale.x+(l.grow-l.sprite.scale.x)*Math.min(1,v*6)),l.sprite.material.opacity=Math.max(0,.9*(1-U)),l.life<=0&&(p.remove(l.sprite),wt.splice(M,1))}for(let M=Dt.length-1;M>=0;M-=1){const l=Dt[M];l.life-=v,l.mesh.scale.multiplyScalar(1+v*3.4),l.mesh.material.opacity=Math.max(0,l.life/.7)*.6,l.life<=0&&(p.remove(l.mesh),Dt.splice(M,1))}}function wn(){for(const m of wt)p.remove(m.sprite);for(const m of Dt)p.remove(m.mesh);for(const m of ft)p.remove(m.mesh),m.mesh.material.dispose();P.forEach(m=>m.dispose()),p.clear()}return{group:p,eyeY:V+G,groundY:V,standX:T.x,standZ:T.z,heightAt:D,walkable:t.cloudTop===null&&t.terrain!=="ring",update:$,drop:$t,dispose:wn}}const Ma="textures/",$e=Math.PI/180;function In(t,n,o=1){return new I(Math.cos(t*$e)*Math.cos(n*$e),Math.sin(t*$e),-Math.cos(t*$e)*Math.sin(n*$e)).multiplyScalar(o)}const me=2.2,ar=Date.UTC(2e3,0,1,12),xa={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},ba={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function sr(){if(typeof window>"u")return!0;const t=navigator,n=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,o=t.hardwareConcurrency??8,u=t.deviceMemory??8;return!!(n||o<=4||u<=4)}function rr(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d");if(o){const u=o.createRadialGradient(64,64,0,64,64,64);u.addColorStop(0,"rgba(255,238,205,0.85)"),u.addColorStop(.3,"rgba(255,214,150,0.55)"),u.addColorStop(.45,"rgba(255,190,120,0.22)"),u.addColorStop(.7,"rgba(250,170,95,0.07)"),u.addColorStop(1,"rgba(255,160,80,0)"),o.fillStyle=u,o.fillRect(0,0,128,128)}return new Ln(n)}const ir=`
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
}`,cr=`
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
}`;function lr(t){return Math.max(.12,.16+.11*Math.log2(t/2e3))}const ur=`
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
}`,fr=`
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
}`,pr=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,dr=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,Sa=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Pa=`
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
}`,mr=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,vr=`
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
}`,hr=`
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
}`,gr=`
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
}`,yr=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,wr=`
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
}`,Mr=`
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
}`,xr=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function Dr(t,n){const o=sr(),u=o?96:128,p=new as({antialias:!0,powerPreference:"default",alpha:!1});p.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),p.outputColorSpace=yn,p.toneMapping=ss,p.toneMappingExposure=1.1;const P=Math.min(4,p.capabilities.getMaxAnisotropy()),r=p.domElement;r.style.display="block",r.style.width="100%",r.style.height="100%",r.style.touchAction="none",t.appendChild(r);const S=document.createElement("div");S.className="space-labels",t.appendChild(S);const N=[];let h=0;function x(){const e=performance.now();if(e-h<400)return;h=e,N.length=0;const s=t.getBoundingClientRect();for(const a of[".explore-top",".sheet",".sky-alert"]){const d=document.querySelector(a);if(!d)continue;const w=d.getBoundingClientRect();w.width<2||w.height<2||N.push({x:w.left-s.left,y:w.top-s.top,w:w.width,h:w.height})}}function k(e,s,a,d=22){for(const w of N)if(e<w.x+w.w&&e+a>w.x&&s<w.y+w.h&&s+d>w.y)return!0;return!1}const y=new rs;y.background=new j("#05070d");const f=new is(45,1,.01,2e3),E=[],i=e=>(E.push(e),e),D=new cs,T=new ls,V=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),G=new Map,O=new Map,H=[],X=new Set;let Q=!1,ie=0;const oe=(e,s)=>{const a=O.get(e);if(a){O.delete(e);for(const d of a)d(s)}},Y=(e,s=!0)=>{const a=G.get(e);if(a)return a;ie+=1;const d=D.load(Ma+e,()=>{oe(e,d),ie-=1,ie===0&&n.onReady?.()},void 0,()=>{oe(e,d),ie-=1,ie===0&&n.onReady?.()});return d.colorSpace=s?yn:ka,d.anisotropy=o?4:8,G.set(e,d),i(d)},Ne=e=>{G.has(e)||X.has(e)||(X.add(e),T.load(Ma+e,s=>{X.delete(e);const a=new bs;a.image=s,a.colorSpace=yn,a.anisotropy=o?4:8,a.needsUpdate=!0,i(a),G.set(e,a),oe(e,a)},void 0,()=>{X.delete(e)}))},tt=()=>{if(!Q){Q=!0;for(const e of H)Ne(e)}},Xe=(e,s)=>{if(V.has(e)){s(Y(e));return}const a=G.get(e);if(a){s(a);return}const d=O.get(e)??[];d.push(s),O.set(e,d),H.includes(e)||(H.push(e),Q&&Ne(e))},nt=new F(i(new ae(900,48,24)),i(new J({map:Y("milkyway.webp"),side:on,depthWrite:!1})));nt.rotation.set(63*$e,0,0),y.add(nt),y.add(new us(16777215,.14));const yt=new fs(16777215,1.6,0,0);yt.decay=0,y.add(yt);const pe=new ge;y.add(pe);const ot=new Map,at=new Map,cn=new Map,ft=[],wt=new Map;let Dt=null,jt=null;const Ft=new Map,$t=new Map,Xt=new Map,Fe=new Map;let $=null,wn=0,m=null;const v=[],M=[],l=[],U=[],b=[];let B=Date.now(),q=!0,K=null;function Le(e,s,a,d){const w=xa[a]??[.7,.7,.7,.06],C=ba[a],_=new j(s),L=C?.relief??0,c=i(new he({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new gn(C?.texel?.[0]??1/1024,C?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:L*.35},gain:{value:(C?.gain??1.9)*.6},base:{value:new I(_.r,_.g,_.b)},glow:{value:new I(w[0],w[1],w[2])},atmo:{value:Math.min(w[3]*2.2,.85)},ringShadow:{value:d?1:0},ringMap:{value:null},ringInner:{value:d?.inner??1},ringOuter:{value:d?.outer??2},ringCenter:{value:new I},ringNormal:{value:new I(0,1,0)}},vertexShader:ir,fragmentShader:cr}));return e&&Xe(e,g=>{c.uniforms.dayMap.value=g,c.uniforms.useMap.value=1,L>0&&(c.uniforms.bumpMap.value=g,c.uniforms.useBump.value=1)}),d&&Xe("saturn-ring.webp",g=>{c.uniforms.ringMap.value=g}),c}function st(e,s,a){const d=ba[a],w=d?.tint??xa[a]?.slice(0,3);if(!w||o)return;const C=Math.min(d?.inner??.12,.5)*.55,_=Math.min(d?.outer??.05,.2)*.9,L=new I(w[0],w[1],w[2]),c=Math.sqrt(1-1/(1.045*1.045)),g=(z,W,Z,fe)=>new F(i(new ae(s*z,o?24:32,o?16:24)),i(new he({uniforms:{tint:{value:L},power:{value:Z},strength:{value:fe},edge:{value:c}},vertexShader:Sa,fragmentShader:Pa,side:W,transparent:!0,blending:ze,depthWrite:!1})));e.add(g(1.045,on,2.7,C),g(1.16,ua,3.4,_))}function rt(e,s){const a=i(new he({uniforms:{poleN:{value:In(80.7,-72.7,1).normalize()},poleS:{value:In(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:mr,fragmentShader:vr,transparent:!0,blending:ze,depthWrite:!1})),d=new F(i(new ae(s*1.022,o?64:96,o?48:64)),a);d.renderOrder=1,e.add(d),U.push(a)}function ye(e,s){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([d,w,C,_,L],c)=>{const g=In(d,w,1).normalize(),z=new I(0,1,0).cross(g).normalize(),W=new I().crossVectors(g,z).normalize(),Z=z.multiplyScalar(Math.cos(L)).addScaledVector(W,Math.sin(L)).normalize(),fe=[];for(let ue=0;ue<=16;ue+=1){const Pe=ue/16,ke=(Pe-.5)*C,Ee=Math.sin(Pe*Math.PI)*_;fe.push(new I().copy(g).multiplyScalar(Math.cos(ke)).addScaledVector(Z,Math.sin(ke)).normalize().multiplyScalar(s*(.985+Ee)))}const ve=i(new he({uniforms:{uTime:{value:0},seed:{value:c*.37+.11}},vertexShader:hr,fragmentShader:gr,transparent:!0,blending:ze,side:_e,depthWrite:!1})),be=new F(i(new ws(new Ms(fe),64,s*.022,8,!1)),ve);be.raycast=()=>{},e.add(be),b.push(ve)})}function Lt(e,s,a=""){const d=document.createElement("button");d.type="button",d.className="space-label"+a,d.textContent=s,d.addEventListener("click",()=>n.onPick?.(e)),S.appendChild(d),cn.set(e,d)}const it=i(new he({uniforms:{map:{value:Y("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),we=new I,Te=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],Ue=new Map;let de=null;const De={moon:"earth",...Object.fromEntries(pa.map(e=>[e.id,e.parent]))};function Ye(e,s){const a=De[e];if(de===null||!a)return zn(e,s);const d=zn(a,s),w=zn(e,de),C=zn(a,de);return{x:d.x+w.x-C.x,y:d.y+w.y-C.y,z:d.z+w.z-C.z}}function Ae(e){for(const[s,a]of at){if(s==="sun")continue;const d=Ye(s,e);a.position.set(d.x*me,d.y*me,d.z*me)}for(const[s,a]of Ft){const d=Ye(s,e);a.position.set(d.x*me,d.y*me,d.z*me)}if(m){we.copy(m.holder.position);const s=we.length()||1;m.tail.visible=s/me<8,we.multiplyScalar(1/s),m.tail.quaternion.setFromUnitVectors(new I(0,1,0),we),m.tail.position.copy(we).multiplyScalar(.16*me)}}const Me=new I(1,0,0),Se=i(new he({uniforms:{dayMap:{value:Y("earth-day.webp")},nightMap:{value:Y("earth-night.webp")},normalMap:{value:Y("earth-normal.webp",!1)},specMap:{value:Y("earth-spec.webp",!1)},texel:{value:new gn(1/2048,1/1024)},sunDir:{value:Me}},vertexShader:ur,fragmentShader:fr}));function Ge(e){const s=new ge,a=new F(i(new ae(e,o?96:128,64)),Se);a.name="earth",s.add(a);const d=new F(i(new ae(e*1.012,80,48)),i(new xs({map:Y("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));s.add(d),Dt=d;const w=new F(i(new ae(e*1.06,64,48)),i(new he({uniforms:{sunDir:{value:Me}},vertexShader:`
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
            }`,side:on,transparent:!0,blending:ze,depthWrite:!1})));s.add(w);const C=new F(i(new ae(e*1.15,o?24:32,o?16:24)),i(new he({uniforms:{tint:{value:new I(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:Sa,fragmentShader:Pa,side:ua,transparent:!0,blending:ze,depthWrite:!1})));return s.add(C),ot.set("earth",a),s}function pt(e,s,a){for(const d of dn(e).sites??[]){const w=new F(i(new ae(a*.018,12,8)),i(new J({color:"#3182f6"})));w.position.copy(In(d.lat,d.lon,a*1.004)),s.add(w);const C=document.createElement("div");C.className="space-site",C.textContent=d.name,S.appendChild(C),ft.push({mesh:w,site:d,el:C,parent:e})}}let Be=null;for(const e of Ps){if(e.id==="moon")continue;const s=new ge;if(at.set(e.id,s),pe.add(s),e.id==="sun"){const a=.26*me,d=new F(i(new ae(a,o?96:128,o?64:80)),it);d.name="sun",wt.set("sun",a),s.add(d),ye(d,a);for(const[C,_,L,c]of[[1.06,2,.95,"#ffbf78"]])s.add(new F(i(new ae(a*C,o?32:48,o?24:32)),i(new he({uniforms:{color:{value:new j(c)},power:{value:_},strength:{value:L}},vertexShader:pr,fragmentShader:dr,transparent:!0,blending:ze,depthWrite:!1}))));ot.set("sun",d);const w=new Nn(i(new Fn({map:i(rr()),blending:ze,transparent:!0,depthWrite:!1,depthTest:!0,color:new j("#ffd9a0")})));w.scale.setScalar(a*3.6),s.add(w),jt=w}else{const a=uo(e.id).radius*me;wt.set(e.id,a);let d;if(e.id==="earth"){const L=Ge(a);L.rotation.z=-e.tilt*$e,s.add(L),Be=L,d=L.children[0]}else{const L=e.id==="saturn"?{inner:a*1.18,outer:a*2.08}:void 0;d=new F(i(new ae(a,o?96:128,64)),Le(e.texture,e.color,e.id,L)),d.name=e.id,d.rotation.z=-e.tilt*$e,s.add(d),ot.set(e.id,d),st(s,a,e.id),e.id==="jupiter"&&rt(d,a)}if(e.axes){const[L,c,g]=e.axes;d.scale.set(1,g/L,c/L)}if(e.ring&&e.axes){const L=e.axes[0]/2,c=a*(e.ring.radius-e.ring.width/2)/L,g=a*(e.ring.radius+e.ring.width/2)/L,z=new F(i(new ut(c,Math.max(g,c*1.03),128,1)),i(new J({color:"#8b8580",side:_e,transparent:!0,opacity:.75,depthWrite:!1})));z.rotation.x=Math.PI/2,s.add(z)}if(e.id==="saturn"){const L=a*1.18,c=a*2.08,g=new ut(L,c,160,1),z=i(new he({uniforms:{ringMap:{value:null},innerRatio:{value:L/c},planetRadius:{value:a},planetCenter:{value:new I}},vertexShader:yr,fragmentShader:wr,side:_e,transparent:!0,depthWrite:!1}));Xe("saturn-ring.webp",Z=>{z.uniforms.ringMap.value=Z});const W=new F(i(g),z);W.rotation.x=Math.PI/2,d.add(W),M.push({mesh:W,parent:e.id}),l.push({mesh:d,material:d.material})}e.sites&&pt(e.id,d,a);const w=da(e.id,.022),C=i(new St);C.setAttribute("position",new co(w.positions,3)),C.setIndex(w.index),C.scale(me,me,me);const _=new F(C,i(new J({color:uo(e.id).ribbon,transparent:!0,opacity:.5,side:_e,depthWrite:!1})));v.push(_),pe.add(_)}Lt(e.id,e.name,e.id==="sun"?"":" is-planet")}const Mt=[];function Pt(e,s,a){let d=e==="main"?1234:98765;const w=()=>(d=d*16807%2147483647,(d-1)/2147483646),C=i(new nn(1,0)),_=new Float32Array(s*4),L=new Float32Array(s*4);for(let z=0;z<s;z+=1){let W;if(e==="main")do W=2.1+w()*1.2;while((Math.abs(W-2.5)<.03||Math.abs(W-2.82)<.03||Math.abs(W-2.95)<.02)&&w()<.85);else W=w()<.18?39.2+(w()-.5)*1.2:42+(w()-.5)*6.5;_[z*4]=W,_[z*4+1]=w()*Math.PI*2,_[z*4+2]=w()*(e==="main"?.18:.12),_[z*4+3]=w()*Math.PI*2,L[z*4]=(w()-.5)*(e==="main"?.32:.5),L[z*4+1]=w()*Math.PI*2;const Z=w()**3;L[z*4+2]=(e==="main"?.0035:.009)*(.7+Z*2.4),L[z*4+3]=w()}C.setAttribute("orbit",new fa(_,4)),C.setAttribute("shape",new fa(L,4));const c=i(new he({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new j(a)},uScale:{value:me}},vertexShader:Mr,fragmentShader:xr})),g=new wo(C,c,s);g.frustumCulled=!1,g.raycast=()=>{},pe.add(g),Mt.push({mesh:g,material:c})}Pt("main",o?1800:4200,"#9c9184"),Pt("kuiper",o?1500:3600,"#7f8b9c");for(const e of pa){const s=new ge,a=new F(i(new ae(e.radius*me,32,24)),Le(`${e.id}.webp`,e.color,e.id));a.name=e.id,s.add(a),pe.add(s),Ft.set(e.id,s),$t.set(e.id,a);const d=document.createElement("button");d.type="button",d.className="space-label is-small",d.textContent=e.name,d.addEventListener("click",()=>n.onExtra?.(e.id)),S.appendChild(d),Xt.set(e.id,{el:d,parent:e.parent})}{const e=new ge,s=new F(i(new ae(.045*me,20,16)),i(new J({color:"#f7fbff"})));s.name="halley",e.add(s);const a=new F(i(new ps(.04*me,.32*me,12)),i(new J({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(a),m={holder:e,tail:a},pe.add(e),Ft.set("halley",e),$t.set("halley",s);const d=da("halley",.022),w=i(new St);w.setAttribute("position",new co(d.positions,3)),w.setIndex(d.index),w.scale(me,me,me);const C=new F(w,i(new J({color:uo("halley").ribbon,transparent:!0,opacity:.35,side:_e,depthWrite:!1})));v.push(C),pe.add(C);const _=document.createElement("button");_.type="button",_.className="space-label is-small",_.textContent=A("핼리 혜성"),_.addEventListener("click",()=>n.onExtra?.("halley")),S.appendChild(_),Xt.set("halley",{el:_,parent:null})}for(const e of ks){const s=Cs(e),a=s.points.map(Z=>new I(Z.x*me,Z.y*me,Z.z*me)),d=i(new St().setFromPoints(a)),w=new ds(d,i(new hn({color:e.color,transparent:!0,opacity:.95})));w.visible=!1;const C=new ge,_=new F(i(new lo(.03,.01,.01,20)),i(new J({color:"#d8dde4"})));_.rotation.x=Math.PI/2;const L=new F(i(new ae(.014,12,8)),i(new J({color:"#c9ced6"})));L.position.z=-.02;const c=new F(i(new lo(.002,.002,.09,6)),i(new J({color:"#aab3c0"})));c.rotation.z=Math.PI/2,c.position.z=-.02;const g=new F(i(new ae(.035,16,12)),i(new J({color:e.color,transparent:!0,opacity:.18,blending:ze,depthWrite:!1})));C.add(_,L,c,g),C.scale.setScalar(e.frame==="earth"?.8:1.3),C.position.copy(a[a.length-1]),w.add(C),(e.frame==="earth"?at.get("earth")??pe:pe).add(w);const W=document.createElement("div");W.className="space-site is-probe",W.textContent=e.name,S.appendChild(W),Fe.set(e.id,{line:w,probe:C,el:W,points:a,times:s.points.map(Z=>Z.t),marks:s.marks,frame:e.frame})}if(Ae(B),Be){const e=.055*me;wt.set("moon",e);const s=new F(i(new ae(e,u,48)),Le("moon.webp","#b8b8b8","moon"));s.name="moon";const a=new ge;a.add(s),pe.add(a),ot.set("moon",s),at.set("moon",a),pt("moon",s,e),Lt("moon",A("달")," is-small"),Ae(B)}const Re=new ge,dt=new ge,Mn=new ge;Re.add(dt,Mn),Re.visible=!1;let bo="solar",At=!1,On=0;const se={moon:new F,moonMat:i(new J({color:"#ffffff"})),shadow:i(new J({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new F,umbra:new F,skyCover:new F,skySun:new ge,skyMoon:new ge,skyMoonMat:i(new J({color:"#ffffff"}))},Gn=[],So=Y("sun.webp"),Po=Y("moon.webp"),ko=new F(i(new ae(.62,32,24)),i(new J({map:So})));ko.position.set(-3.3,0,0);const Co=new F(i(new ae(.4,32,24)),i(new J({map:Y("earth-day.webp")})));Co.position.set(1.85,0,0),se.moonMat.map=Po,se.moon=new F(i(new ae(.14,24,18)),se.moonMat),se.cone=new F(i(new lo(.04,.16,.78,18)),se.shadow),se.cone.position.set(1.42,0,0),se.cone.rotation.z=Math.PI/2,se.umbra=new F(i(new pn(.3,28)),i(new J({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),se.umbra.position.set(2.75,0,.02),dt.add(ko,Co,se.moon,se.cone,se.umbra);for(const[e,s]of[[A("태양"),new I(-3.3,.85,0)],[A("지구"),new I(1.85,.68,0)]]){const a=document.createElement("div");a.className="space-site",a.textContent=e,S.appendChild(a),Gn.push({el:a,at:s,group:dt})}const Da=new F(i(new pn(1.35,48)),i(new J({map:So}))),Aa=new F(i(new ut(1.4,1.7,48)),i(new J({color:"#f0c36a",transparent:!0,opacity:.45,side:_e,depthWrite:!1})));se.skyCover=new F(i(new pn(1.22,48)),i(new J({color:"#141820"}))),se.skySun.add(Da,Aa,se.skyCover),se.skyMoonMat.map=Po;const Ra=new F(i(new pn(.92,48)),se.skyMoonMat),zo=new F(i(new pn(1.08,48)),i(new J({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));zo.position.z=.16,se.skyMoon.add(Ra,zo),Mn.add(se.skySun,se.skyMoon);const ln=document.createElement("div");ln.className="space-site is-stage",S.appendChild(ln),Gn.push({el:ln,at:new I(0,-1.2,0),group:dt}),Mn.visible=!1,y.add(Re);const xt=new ge;xt.visible=!1,xt.rotation.z=-Math.PI/2;const Eo=[],To=4.6,Ia=e=>To*e/696e3,Do=new F(i(new ae(To,64,40)),i(new J({map:Y("sun.webp")})));Do.position.set(-3.2,0,0),xt.add(Do);const Wa=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let Ao=2.4;const Ro=(e,s)=>{const a=document.createElement("div");a.className="space-site",a.textContent=e,S.appendChild(a),Eo.push({el:a,at:s,group:xt})};Ro(A("태양"),new I(-3.2,4.9,0));for(const[e,s]of Wa){const a=Ia(s),d=Ao+a;Ao=d+a+.72;const w=dn(e),C=e==="earth"?"earth-day.webp":w.texture,_=i(new J({color:w.color}));C&&Xe(C,c=>{_.map=c,_.color.set("#ffffff"),_.needsUpdate=!0});const L=new F(i(new ae(a,32,24)),_);if(L.position.set(d,0,0),w.axes&&L.scale.set(1,w.axes[2]/w.axes[0],w.axes[1]/w.axes[0]),xt.add(L),e==="saturn"){const c=a*1.18,g=a*2.08,z=i(new ut(c,g,96,1)),W=z.attributes.position,Z=z.attributes.uv,fe=new I;for(let ue=0;ue<W.count;ue+=1)fe.fromBufferAttribute(W,ue),Z.setXY(ue,(fe.length()-c)/(g-c),.5);const ve=i(new J({color:"#b9b3ab",transparent:!0,opacity:.9,side:_e,depthWrite:!1}));Xe("saturn-ring.webp",ue=>{ve.map=ue,ve.color.set("#ffffff"),ve.needsUpdate=!0});const be=new F(z,ve);be.rotation.y=Math.PI/2-.36,L.add(be)}Ro(w.name,new I(d,(e==="saturn"?a*2.08:a)+.12,0))}y.add(xt);const ct=new ge;ct.visible=!1;const Bn=[],Io=[],_a=new F(i(new ae(.55,48,32)),i(new J({color:"#e0703a"})));ct.add(_a);for(const[e,s]of[[1.35,.16],[2.1,.05]])ct.add(new F(i(new ae(.55*e,32,24)),i(new J({color:"#ff6a30",transparent:!0,opacity:s,side:on,blending:ze,depthWrite:!1}))));const Wo=new F(i(new ut(2.6,5.1,96,1)),i(new J({color:"#3fbf7f",transparent:!0,opacity:.12,side:_e,depthWrite:!1})));Wo.rotation.x=Math.PI/2,ct.add(Wo),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,s,a,d,w],C)=>{const _=new la(i(new St().setFromPoints(Array.from({length:128},(g,z)=>new I(Math.cos(z/128*Math.PI*2)*a*100,0,Math.sin(z/128*Math.PI*2)*a*100)))),i(new hn({color:"#8b95a1",transparent:!0,opacity:.35})));ct.add(_);const L=new F(i(new ae(.16*d,24,16)),Le(void 0,w,"earth"));ct.add(L);const c=document.createElement("button");c.type="button",c.className="space-label is-small",c.textContent=e,c.addEventListener("click",()=>n.onExtra?.(`trappist-${e}`)),S.appendChild(c),Bn.push({mesh:L,a:a*100,period:s,phase0:C*1.7,el:c})});const Na=new la(i(new St().setFromPoints(Array.from({length:256},(e,s)=>new I(Math.cos(s/256*Math.PI*2)*38.7,0,Math.sin(s/256*Math.PI*2)*38.7)))),i(new hn({color:"#c5b8a2",transparent:!0,opacity:.5})));ct.add(Na);for(const[e,s]of[["TRAPPIST-1",new I(0,1.1,0)],[A("생명가능지대(대략)"),new I(3.9,0,0)],[A("비교: 우리 수성의 궤도"),new I(0,0,38.7)]]){const a=document.createElement("div");a.className="space-site",a.textContent=e,S.appendChild(a),Io.push({el:a,at:s})}y.add(ct);const Rt=Ds(i),Fa=Rt.labels.map(({name:e,at:s})=>{const a=document.createElement("div");return a.className="space-site",a.textContent=e,S.appendChild(a),{el:a,at:s}});y.add(Rt.group);const Ve=Rs(),Vn=[];if(Ve)for(const[e,s]of Object.entries(Ve.groups)){y.add(s);for(const a of Ve.markers[e]){const d=document.createElement("button");d.type="button",d.className="space-label",d.textContent=a.name,d.addEventListener("click",()=>{n.onMarker?.(a),ce.target.copy(a.position),ce.radius=Ht[e]*(a.id==="cmb"?1.4:e==="group"?.6:.42)}),S.appendChild(d),Vn.push({level:e,marker:a,el:d})}}const _o=[];if(Ve){const s=(C,_)=>new I(Math.cos(_*$e)*Math.cos(C*$e),Math.sin(_*$e),-Math.cos(_*$e)*Math.sin(C*$e)).multiplyScalar(140),a=[];for(const C of Object.values(ma))for(const _ of C)for(let L=0;L<_.length-1;L+=1){const c=s(_[L][0],_[L][1]),g=s(_[L+1][0],_[L+1][1]);a.push(c.x,c.y,c.z,g.x,g.y,g.z)}const d=i(new St);d.setAttribute("position",new co(a,3));const w=new Ca(d,i(new hn({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));Ve.groups.stars.add(w);for(const C of zs){if(!ma[C.id])continue;const _=document.createElement("button");_.type="button",_.className="space-label is-const",_.textContent=C.name.replace(/\(.*\)/,"").split(" · ")[0],_.addEventListener("click",()=>n.onConstellation?.(C.id)),S.appendChild(_),_o.push({el:_,at:s(C.center[0],C.center[1])})}}const xn=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let ee="system",Yt=!1,No=!1;const Ht={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},qt=new I,re={theta:.6,phi:.95,radius:34},ce={target:new I,radius:re.radius};let xe="system",Ie=null,He=null,mt=null;function bn(e){if((e==="system"||e==="sizes")&&tt(),ee=e,Yt=!1,pe.visible=e==="system",Re.visible=e==="eclipse",xt.visible=e==="sizes",ct.visible=e==="exo",Rt.group.visible=e==="blackhole",Ve)for(const[s,a]of Object.entries(Ve.groups))a.visible=s===e;xe="system",Ie=null,He=null,mt=null,ce.target.set(0,0,0),ce.radius=Ht[e],e!=="system"&&(re.phi=1.1),e==="eclipse"&&(dt.rotation.z=f.aspect<1?-Math.PI/2:0,re.theta=0,re.phi=At?Math.PI/2:1.25,ce.target.set(0,0,0),At||ce.target.set(-.7,0,0).applyEuler(dt.rotation),ce.radius=At?6:f.aspect<1?10:7.5),e==="exo"&&(re.phi=.75),e==="blackhole"&&(re.phi=1.42),e==="sizes"&&(re.theta=0,re.phi=Math.PI/2,ce.target.set(.6,-6.8,0),ce.radius=19)}function Fo(e){if(e!=="earth"&&tt(),Yt=!1,ee!=="system"&&(ee="system",pe.visible=!0,Re.visible=!1,xt.visible=!1,ct.visible=!1,Rt.group.visible=!1,Ve))for(const a of Object.values(Ve.groups))a.visible=!1;if(xe=e,He=null,mt=null,e==="system"){Ie=null,ce.target.set(0,0,0),ce.radius=Ht.system;return}Ie=at.get(e)??null;const s=wt.get(e)??lr(dn(e).km);ce.radius=e==="sun"?3.2:e==="jupiter"?3.4*me:e==="saturn"?2.6*me:Math.max(s*(dn(e).ring?6:4.2),.25)}function La(e){const s=Ft.get(e);s&&(ee!=="system"&&bn("system"),xe="system",Ie=s,He=null,mt=null,ce.radius=e==="halley"?1.6:.6,Ct=performance.now())}function Ua(e){mt=(e?ft.find(a=>a.parent===xe&&a.site.name===e.name):void 0)?.mesh??null,He=mt?new I:null,Ct=performance.now()}let te=null,je=0,It=-.12;const jn=62,Lo=18,Uo=85;let Wt=jn,$n=0,Ut=0,Kt=0,Oo=0;const Xn=3.4,Yn=2.8,Oa=4.6,Zt=620;let qe=0,Ke=0,un=0,Ze=0,Je=0,Qe=0,Ot=0,Gt=!0,Bt=!1,Hn=0,fn=!0,qn=9.81,Kn=0,Zn=0,Jn=-24,Qn=120;const bt=new Set;function Ga(){if(nt.visible=!0,pe.visible=ee==="system",Re.visible=ee==="eclipse",xt.visible=ee==="sizes",ct.visible=ee==="exo",Rt.group.visible=ee==="blackhole",Ve)for(const[e,s]of Object.entries(Ve.groups))s.visible=e===ee}function Go(e,s){te&&(y.remove(te.group),te.dispose(),te=null);const a=Ts(e);te=or(a,{low:o,anisotropy:P,onLand:d=>n.onSurfaceDrop?.({id:e,seconds:d.seconds,bounces:d.bounces,outcome:d.outcome})}),y.add(te.group),y.fog=new Ss(new j(a.fog),a.fogDensity),je=(a.companion?a.companionAz:a.sunAz)*$e,It=-.12,Wt=jn,qe=te.standX,Ke=te.standZ,un=0,Ze=0,Je=0,Qe=0,Ot=0,Gt=!0,Bt=!1,Hn=0,fn=te.walkable,qn=Math.max(0,a.gravityMps2),Kn=0,Zn=0,Jn=a.terrain==="ring"?-24:-1,Qn=a.terrain==="ring"?110:240,Ut=0,Kt=Math.max(.6,s),Oo=a.cloudTop!==null?260:150,Ct=performance.now()}function Bo(e){if(!te){if(nt.visible=!1,pe.visible=!1,Re.visible=!1,xt.visible=!1,ct.visible=!1,Rt.group.visible=!1,Ve)for(const s of Object.values(Ve.groups))s.visible=!1;S.style.display="none",$=null,de=null,q=!0,f.fov=62,f.near=.08,f.far=6e3,f.updateProjectionMatrix()}Go(e,1.9)}function Ba(e){if(!te){Bo(e);return}Go(e,1.1)}function Va(){te&&(y.remove(te.group),te.dispose(),te=null,y.fog=null,S.style.display="",Ga(),f.fov=45,f.near=.01,f.far=2e3,f.updateProjectionMatrix(),qt.copy(ce.target),re.radius=ce.radius,Ct=performance.now())}function eo(){if(!te)return;const e=4.2+Math.random()*1.4,s=(Math.random()-.5)*1.8,a=qe-te.standX+Math.sin(je)*e+Math.cos(je)*s,d=Ke-te.standZ-Math.cos(je)*e+Math.sin(je)*s;te.drop(a,d)}function ja(e){if(!te)return;if(Ut<Kt){Bt=!1;return}const s=(bt.has("w")||bt.has("arrowup")?1:0)-(bt.has("s")||bt.has("arrowdown")?1:0),a=(bt.has("d")||bt.has("arrowright")?1:0)-(bt.has("a")||bt.has("arrowleft")?1:0);let d=Kn+s,w=Zn+a;const C=Math.hypot(d,w);C>1&&(d/=C,w/=C);const _=Math.sin(je),L=-Math.cos(je),c=Math.cos(je),g=Math.sin(je),z=Math.min(1,e*(fn?9:2.4));if(fn){const W=(_*d+c*w)*Xn,Z=(L*d+g*w)*Xn;Je+=(W-Je)*z,Qe+=(Z-Qe)*z,qe+=Je*e,Ke+=Qe*e;const fe=Math.hypot(qe,Ke);if(fe>Zt){const be=qe/fe,ue=Ke/fe;qe=be*Zt,Ke=ue*Zt;const Pe=Je*be+Qe*ue;Pe>0&&(Je-=Pe*be,Qe-=Pe*ue)}const ve=Math.hypot(Je,Qe);Hn+=e*(Gt?.8+ve*1.7:.8),Bt&&Gt&&qn>.01&&(Ze=Oa,Gt=!1),Gt||(Ze-=qn*e,un+=Ze*e,un<=0&&(un=0,Ze=0,Gt=!0))}else{const W=Math.cos(It),Z=(Math.sin(je)*W*d+c*w)*Yn,fe=Math.sin(It)*d*Yn,ve=(-Math.cos(je)*W*d+g*w)*Yn;Je+=(Z-Je)*z,Qe+=(ve-Qe)*z,Ze+=(fe-Ze)*z,Bt&&(Ze+=1.8),qe+=Je*e,Ke+=Qe*e,Ot+=Ze*e;const be=Math.hypot(qe,Ke);if(be>Zt){const ue=qe/be,Pe=Ke/be;qe=ue*Zt,Ke=Pe*Zt;const ke=Je*ue+Qe*Pe;ke>0&&(Je-=ke*ue,Qe-=ke*Pe)}Ot<Jn&&(Ot=Jn,Ze<0&&(Ze=0)),Ot>Qn&&(Ot=Qn,Ze>0&&(Ze=0))}Bt=!1}function $a(e,s){if(!te)return;if(te.update(e,s),Ut<Kt){Ut=Math.min(Kt,Ut+s);const _=Ut/Kt,L=1-Math.pow(1-_,3);$n=Oo*(1-L),It=-.12-.38*(1-L)}else $n=0;ja(s);const a=Math.min(1,Math.hypot(Je,Qe)/Xn),d=fn?Gt?Math.sin(Hn*2)*.035*a:0:Math.sin(e*.5)*.25,w=(fn?te.eyeY+te.heightAt(qe,Ke)+un:te.eyeY+Ot)+$n+d;f.position.set(qe,w,Ke),f.fov!==Wt&&(f.fov=Wt,f.updateProjectionMatrix());const C=Math.cos(It);f.lookAt(qe+Math.sin(je)*C,w+Math.sin(It),Ke-Math.cos(je)*C),p.render(y,f)}const We=new Map,to=new Map;let kt=0,_t=0,Sn=!1,Ct=0;const Vo=new ms,jo=new gn,$o=e=>{if(to.set(e.pointerId,{x:e.clientX,y:e.clientY}),te){if(r.setPointerCapture(e.pointerId),We.set(e.pointerId,{x:e.clientX,y:e.clientY}),We.size>=2){const[s,a]=[...We.values()];kt=Math.hypot(s.x-a.x,s.y-a.y),Sn=!0,_t+=100}else Sn=!1,_t=0;return}if(tt(),r.setPointerCapture(e.pointerId),Yt=!1,We.set(e.pointerId,{x:e.clientX,y:e.clientY}),_t=0,Ct=performance.now(),We.size===2){const[s,a]=[...We.values()];kt=Math.hypot(s.x-a.x,s.y-a.y)}},Xo=e=>{const s=We.get(e.pointerId);if(!s)return;const a=e.clientX-s.x,d=e.clientY-s.y;if(We.set(e.pointerId,{x:e.clientX,y:e.clientY}),te){if(We.size>=2){const[C,_]=[...We.values()],L=Math.hypot(C.x-_.x,C.y-_.y);kt>0&&L>0&&(Wt=Math.min(Uo,Math.max(Lo,Wt*(kt/L)))),kt=L,_t+=Math.abs(a)+Math.abs(d)+10;return}_t+=Math.abs(a)+Math.abs(d);const w=Wt/jn;je-=a*.004*w,It=Math.min(1.15,Math.max(-1.05,It-d*.0035*w));return}if(Ct=performance.now(),We.size===1)_t+=Math.abs(a)+Math.abs(d),re.theta-=a*.006,re.phi=Math.min(2.9,Math.max(.2,re.phi-d*.006)),He=null,mt=null;else if(We.size===2){const[w,C]=[...We.values()],_=Math.hypot(w.x-C.x,w.y-C.y);kt>0&&(ce.radius=Ho(ce.radius*(kt/_))),kt=_,_t+=10}},Pn=e=>{const s=to.get(e.pointerId),a=Sn;if(to.delete(e.pointerId),We.delete(e.pointerId),kt=0,We.size===0&&(Sn=!1),te){(s?Math.hypot(e.clientX-s.x,e.clientY-s.y):1/0)<12&&!a&&We.size===0&&eo();return}if(_t<6&&n.onPick){const d=r.getBoundingClientRect();jo.set((e.clientX-d.left)/d.width*2-1,-((e.clientY-d.top)/d.height)*2+1),Vo.setFromCamera(jo,f);const C=Vo.intersectObjects([...ot.values(),...$t.values()],!1)[0]?.object.name;C&&ot.has(C)?n.onPick(C):C&&$t.has(C)&&n.onExtra?.(C)}},Yo=e=>{if(te){e.preventDefault(),Wt=Math.min(Uo,Math.max(Lo,Wt*(e.deltaY>0?1.1:.9)));return}e.preventDefault(),ce.radius=Ho(ce.radius*(e.deltaY>0?1.12:.89))};function Ho(e){return ee!=="system"?Math.min(Ht[ee]*2.2,Math.max(Ht[ee]*.15,e)):Math.min(90,Math.max(xe==="system"&&!Ie?4:.15,e))}const qo=e=>{if(!te)return;const s=e.target;if(s&&(s.tagName==="INPUT"||s.tagName==="TEXTAREA"||s.isContentEditable))return;const a=e.key.toLowerCase();if(e.code==="KeyE"||e.code==="KeyF"||a==="e"||a==="f"){if(e.repeat||Ut<Kt)return;e.preventDefault(),eo();return}(a===" "||a==="spacebar"||a==="w"||a==="a"||a==="s"||a==="d"||a.startsWith("arrow"))&&(e.preventDefault(),bt.add(a==="spacebar"?" ":a),(a===" "||a==="spacebar")&&(Bt=!0))},Ko=e=>{const s=e.key.toLowerCase();bt.delete(s==="spacebar"?" ":s)};window.addEventListener("keydown",qo),window.addEventListener("keyup",Ko),r.addEventListener("pointerdown",$o),r.addEventListener("pointermove",Xo),r.addEventListener("pointerup",Pn),r.addEventListener("pointercancel",Pn),r.addEventListener("wheel",Yo,{passive:!1});let zt=null,kn=null,no=!matchMedia("(prefers-reduced-motion: reduce)").matches,Zo=0,Jo=0;no&&(zt=new vs(p),zt.addPass(new hs(y,f)),kn=new gs(new gn(256,256),.75,.78,.92),zt.addPass(kn),zt.addPass(new ys));const ne={w:1,h:1},Qo=()=>{ne.w=t.clientWidth||1,ne.h=t.clientHeight||1,p.setSize(ne.w,ne.h,!1),zt?.setSize(ne.w,ne.h),kn?.resolution.set(ne.w/2,ne.h/2),f.aspect=ne.w/ne.h,f.updateProjectionMatrix()};Qo();const ea=new ResizeObserver(Qo);ea.observe(t);let ta=!0;const na=new IntersectionObserver(e=>{ta=e.some(s=>s.isIntersecting)});na.observe(t);const R=new I,Vt=new I,Jt=new I,oo=new I,Xa=new I,Ya=new I,Ha=new I,qa=new I,oa=new I,Ka=new I;let ao=0,aa=performance.now(),so=-1e9,sa=0;const ra=e=>{ao=requestAnimationFrame(ra);const s=Math.min(.1,(e-aa)/1e3);if(aa=e,document.hidden||!ta)return;if(te){$a(e/1e3,s);return}if(xn||(it.uniforms.time.value=e/1e3),!xn){for(const c of U)c.uniforms.time.value=e/1e3;for(const c of b)c.uniforms.uTime.value=e/1e3}e-Ct>3e3&&!xn&&!He&&!No&&!Yt&&ee!=="eclipse"&&ee!=="sizes"&&(re.theta+=s*(xe==="system"?.03:.08)),Dt?.rotateY(s*.01);for(const[c,g]of ot){if(c==="earth"||c==="moon"||mt&&c===xe)continue;const z=dn(c).spinHours;xn||g.rotateY(s*(c==="sun"?.02:z?.12*(24/z)*.25:.12))}jt&&(jt.visible=f.position.length()>4);for(const c of Mt)c.material.uniforms.uDays.value=(B-ar)/864e5,c.material.uniforms.uTime.value=e/1e3;for(const c of M){const g=ot.get(c.parent);g&&c.mesh.material.uniforms.planetCenter.value.copy(g.getWorldPosition(R))}for(const c of l)c.mesh.getWorldPosition(R),c.material.uniforms.ringCenter.value.copy(R),c.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(c.mesh.matrixWorld).normalize();if(q&&e-sa>1e3&&(sa=e,B=Date.now(),Ae(B)),$){const c=Fe.get($.id),g=c.points.length,z=c.times[g-1],W=(c.frame==="earth"?6:25)*864e5,fe=c.marks.some(Ce=>Ce.at!==void 0&&Ce.body&&Ce.body!=="earth"&&Math.abs($.sim-Ce.at)<W)?"slow":$.sim>=$.fastFrom?"fast":"normal",ve=fe==="slow"?Math.min($.base,2*W/3):$.base*(fe==="fast"?$.fast:1);$.sim=Math.min(z,$.sim+ve*Math.min(s,.1)),c.frame==="sun"?de=(de??$.sim)+Math.min(s,.1)*.15*864e5:de=null,$.pace=fe;const be=($.sim-c.times[0])/(z-c.times[0]||1);let ue=0,Pe=g-1;for(;Pe-ue>1;){const Ce=ue+Pe>>1;c.times[Ce]<=$.sim?ue=Ce:Pe=Ce}const ke=c.times[Pe]-c.times[ue],Ee=ue+(ke>0?($.sim-c.times[ue])/ke:0),Oe=Math.max(0,Math.min(g-2,Math.floor(Ee))),ia=Ee-Oe;c.probe.position.lerpVectors(c.points[Oe],c.points[Oe+1],ia),wn=Ee,c.probe.lookAt(c.line.localToWorld(c.points[Math.min(g-1,Oe+2)].clone())),c.line.geometry.setDrawRange(0,Oe+2);const ro=c.times[Oe]+(c.times[Oe+1]-c.times[Oe])*ia;q=!1,B=ro,Ae(ro);let Cn=0;for(let Ce=0;Ce<c.marks.length;Ce+=1){const ca=c.marks[Ce],Za=ca.at??c.times[Math.min(g-1,ca.index)];$.sim>=Za-W&&(Cn=Ce)}if((Cn!==$.mark||e-$.lastPing>250||$.sim>=z&&!$.done)&&($.mark=Cn,$.lastPing=e,$.sim>=z&&($.done=!0),n.onFlight?.({id:$.id,mark:c.marks[Cn],progress:be,time:ro,done:$.done,pace:$.pace})),$.done){const Ce=c.frame==="earth";$=null,de=null,q=!0,Ie=Ce?at.get("earth")??null:null,Ce||ce.target.set(0,0,0),ce.radius=Ce?4.2:72,re.phi=Ce?.7:.45}}if(Ie&&ce.target.copy(Ie.getWorldPosition(R)),$){const c=Fe.get($.id);let g=null,z=1/0;for(const Z of c.marks){if(!Z.body||Z.body==="earth"||Z.body==="far")continue;const fe=Math.abs(Z.index-wn);fe<14&&fe<z&&(g=Z,z=fe)}const W=g?at.get(g.body):void 0;if(W){const Z=W.getWorldPosition(Ha).add(c.probe.getWorldPosition(qa)).multiplyScalar(.5);ce.target.copy(Z),ce.radius=c.frame==="earth"?1.6:4.2}else ce.radius=c.frame==="earth"?1.5:2.8}if(qt.lerp(ce.target,1-Math.pow(.002,s)),re.radius+=(ce.radius-re.radius)*(1-Math.pow(.004,s)),He&&mt){const c=ot.get(xe)?.getWorldPosition(oa)??oa.set(0,0,0);He.copy(mt.getWorldPosition(Ka).sub(c).normalize());const g=Math.atan2(He.x,He.z),z=Math.acos(Math.max(-1,Math.min(1,He.y)));let W=g-re.theta;W=Math.atan2(Math.sin(W),Math.cos(W)),re.theta+=W*(1-Math.pow(.01,s)),re.phi+=(z-re.phi)*(1-Math.pow(.01,s))}if(ee==="blackhole"&&Rt.update(e/1e3,f),ee==="exo"){const c=e/1e3;for(const g of Bn){const z=g.phase0+c/g.period*Math.PI*2;g.mesh.position.set(Math.cos(z)*g.a,0,Math.sin(z)*g.a)}}if(ee==="eclipse"){On=(On+s*.18)%1;const c=Math.sin(On*Math.PI*2),g=Math.abs(c)<.22,z=Math.max(0,1-Math.abs(c)/.9),W=bo==="lunar";if(dt.visible=!At,Mn.visible=At,se.skySun.visible=!W,se.skyMoon.visible=W,At)W?(se.skyMoon.position.set(c*1.7,0,.08),se.skyMoonMat.color.set("#f2f2f2").lerp(new j("#c47462"),W?z:0)):se.skyCover.position.set(c*1.7,0,.08);else{se.moon.position.set(W?2.75:1.05,c*.55,0),se.cone.visible=!W,se.umbra.visible=W,se.shadow.opacity=g?.42:.08,se.umbra.material.opacity=g?.42:.08,se.moonMat.color.set("#ffffff").lerp(new j("#c47462"),W?z:0);const Z=g?A("개기"):Math.abs(c)<.6?A("부분"):W?A("반영"):"";ln.textContent!==Z&&(ln.textContent=Z)}}if(f.position.set(qt.x+re.radius*Math.sin(re.phi)*Math.sin(re.theta),qt.y+re.radius*Math.cos(re.phi),qt.z+re.radius*Math.sin(re.phi)*Math.cos(re.theta)),f.lookAt(qt),Be&&(Be.getWorldPosition(R),Me.copy(R).multiplyScalar(-1).normalize(),e-so>500&&!($&&Fe.get($.id)?.frame==="sun"))){so=e;const c=Es(new Date(B)),g=Math.atan2(c.y,c.x),z=Math.atan2(-Me.z,Me.x),W=Be.children[0];W.rotation.y=z-g}zt&&no&&ee!=="blackhole"&&(ee!=="system"||xe==="system"||xe==="sun")&&zt?(zt.render(s),Zo+=1,Jo+=s,Zo===90&&Jo/90>.034&&(no=!1)):p.render(y,f),f.getWorldDirection(Vt),x();const w=[];for(const c of Te){const g=cn.get(c),z=at.get(c);if(!g||!z)continue;z.getWorldPosition(R);const W=Jt.copy(R).sub(f.position).dot(Vt)>0,Z=xe==="system"&&ee==="system"&&(!Ie||$!==null),fe=xe==="earth"||xe==="moon"||$!==null&&Fe.get($.id)?.frame==="earth";let ve=W&&(c==="moon"?ee==="system"&&fe:Z||fe&&c==="earth"&&$!==null);R.project(f);const be=(R.x+1)/2*ne.w;let ue=be;const Pe=(1-R.y)/2*ne.h+10;if(ve){let ke=Ue.get(c)??0;ke||(g.style.display="block",ke=g.offsetWidth||40,Ue.set(c,ke)),ue=Math.min(Math.max(be,ke/2+4),Math.max(ke/2+4,ne.w-ke/2-4));const Ee={x:ue-ke/2,y:Pe,w:ke,h:22};k(Ee.x,Ee.y,Ee.w,Ee.h)||w.some(Oe=>Ee.x<Oe.x+Oe.w+4&&Ee.x+Ee.w+4>Oe.x&&Ee.y<Oe.y+Oe.h&&Ee.y+Ee.h>Oe.y)?ve=!1:w.push(Ee)}g.style.display=ve?"block":"none",ve&&(g.style.transform=`translate(${ue}px, ${Pe}px) translate(-50%, 0)`)}const C=ee==="system",_=xe!=="system"&&xe!=="jupiter"&&xe!=="saturn",L=Ie!==null&&($===null?Ie===at.get("earth"):Fe.get($.id)?.frame==="earth");for(const c of v)c.visible=!_&&!L;for(const[c,g]of Xt){const z=Ft.get(c),W=g.parent?at.get(g.parent)===Ie:xe==="system"&&(!Ie||Ie===z),Z=Ie===z||W;z.getWorldPosition(R);const fe=Jt.copy(R).sub(f.position).dot(Vt)>0,ve=C&&fe&&Z;R.project(f),g.el.style.display=ve?"block":"none",ve&&(g.el.style.transform=`translate(${(R.x+1)/2*ne.w}px, ${(1-R.y)/2*ne.h+8}px) translate(-50%, 0)`)}for(const[c,g]of Fe){const z=C&&K===c;if(g.line.visible=z,!z){g.el.style.display="none";continue}g.probe.getWorldPosition(R);const W=Jt.copy(R).sub(f.position).dot(Vt)>0;R.y+=0,R.project(f),g.el.style.display=W?"block":"none",W&&(g.el.style.transform=`translate(${(R.x+1)/2*ne.w}px, ${(1-R.y)/2*ne.h}px) translate(10px, -50%)`)}for(const c of _o){if(ee!=="stars"){c.el.style.display="none";continue}R.copy(c.at);const g=Jt.copy(R).sub(f.position).dot(Vt)>0;R.project(f);const z=g&&Math.abs(R.x)<1&&Math.abs(R.y)<1;c.el.style.display=z?"block":"none",z&&(c.el.style.transform=`translate(${(R.x+1)/2*ne.w}px, ${(1-R.y)/2*ne.h}px) translate(-50%, -50%)`)}for(const c of Vn){if(!(c.level===ee)){c.el.style.display="none";continue}R.copy(c.marker.position);const z=Jt.copy(R).sub(f.position).dot(Vt)>0;R.project(f),c.el.style.display=z?"block":"none",z&&(c.el.style.transform=`translate(${(R.x+1)/2*ne.w}px, ${(1-R.y)/2*ne.h+8}px) translate(-50%, 0)`)}for(const c of Bn){if(ee!=="exo"){c.el.style.display="none";continue}c.mesh.getWorldPosition(R);const g=Jt.copy(R).sub(f.position).dot(Vt)>0;R.project(f),c.el.style.display=g?"block":"none",g&&(c.el.style.transform=`translate(${(R.x+1)/2*ne.w}px, ${(1-R.y)/2*ne.h+8}px) translate(-50%, 0)`)}for(const c of Fa){if(ee!=="blackhole"){c.el.style.display="none";continue}R.copy(c.at),Rt.group.localToWorld(R),R.project(f);const g=R.z<1&&Math.abs(R.x)<1.05&&Math.abs(R.y)<1.05;c.el.style.display=g?"block":"none",g&&(c.el.style.transform=`translate(${(R.x+1)/2*ne.w}px, ${(1-R.y)/2*ne.h}px) translate(-50%, -100%)`)}for(const c of Io){if(ee!=="exo"){c.el.style.display="none";continue}R.copy(c.at).project(f);const g=R.z<1&&Math.abs(R.x)<1.05&&Math.abs(R.y)<1.05;c.el.style.display=g?"block":"none",g&&(c.el.style.transform=`translate(${(R.x+1)/2*ne.w}px, ${(1-R.y)/2*ne.h}px) translate(-50%, -100%)`)}for(const[c,g]of[[Gn,ee==="eclipse"&&!At],[Eo,ee==="sizes"]])for(const z of c){if(!g){z.el.style.display="none";continue}R.copy(z.at).applyMatrix4(z.group.matrixWorld).project(f);let W=R.z<1&&Math.abs(R.x)<1.1&&Math.abs(R.y)<1.1;const Z=(R.x+1)/2*ne.w,fe=(1-R.y)/2*ne.h,ve=z.el.offsetWidth||44;W&&k(Z-ve/2,fe-11,ve,22)&&(W=!1),z.el.style.display=W?"block":"none";const be=z.group.rotation.z!==0;W&&(z.el.style.transform=`translate(${(R.x+1)/2*ne.w}px, ${(1-R.y)/2*ne.h}px) ${be?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const c of ft){c.mesh.getWorldPosition(R);const g=ot.get(c.parent);g?g.getWorldPosition(oo):oo.set(0,0,0);let W=Xa.copy(R).sub(oo).normalize().dot(Ya.copy(f.position).sub(R).normalize())>.15&&ee==="system"&&xe===c.parent;R.project(f),W&&k((R.x+1)/2*ne.w+8,(1-R.y)/2*ne.h-11,90)&&(W=!1),c.el.style.display=W?"block":"none",W&&(c.el.style.transform=`translate(${(R.x+1)/2*ne.w}px, ${(1-R.y)/2*ne.h}px) translate(8px, -50%)`)}};return ao=requestAnimationFrame(ra),ie===0&&n.onReady?.(),{focus:Fo,setLevel:bn,setPaused:e=>{No=e},focusMarker:e=>{const s=Vn.find(a=>a.level===ee&&a.marker.id===e);s&&(ce.target.copy(s.marker.position),ce.radius=Ht[ee]*(e==="cmb"?1.4:ee==="group"?.6:.42),Ct=performance.now())},showSite:Ua,focusExtra:La,setEclipse:(e,s)=>{bo=e,At=s,bn("eclipse")},setHemisphere:e=>{xe!=="earth"&&Fo("earth");const s=Me.clone().multiplyScalar(e==="day"?1:-1);re.theta=Math.atan2(s.x,s.z),re.phi=Math.min(2.6,Math.max(.5,Math.acos(s.y))),He=null,mt=null,Yt=!0},enterSurface:Bo,setSurfaceWorld:Ba,exitSurface:Va,setSurfaceMove:(e,s)=>{Kn=Math.min(1,Math.max(-1,e)),Zn=Math.min(1,Math.max(-1,s))},jumpSurface:()=>{Bt=!0},dropProbe:eo,setTime:e=>{q=e===null,B=e??Date.now(),Ae(B),so=-1e9},setVoyage:e=>{if(K=e,!e){$&&($=null,q=!0),de=null;for(const g of Fe.values())g.line.geometry.setDrawRange(0,1/0);return}ee!=="system"&&bn("system"),de=null;const s=Fe.get(e);s.line.geometry.setDrawRange(0,2),xe="system",He=null,mt=null,Yt=!1,Ie=s.probe;const a=s.frame==="earth";ce.radius=a?1.3:2.8,re.phi=a?.75:1;const d=Math.max(...s.marks.filter(g=>g.at!==void 0&&g.body!=="earth").map(g=>g.at),s.times[0]+864e5),w=s.times[0],C=s.times[s.times.length-1],_=(d-w)/(a?20:24),L=s.frame==="earth"?C:d+60*864e5,c=C>L?(C-L)/4/_:1;$={id:e,sim:w,base:_,fastFrom:L,fast:c,mark:-1,done:!1,lastPing:0,pace:"normal"},Ct=performance.now()},dispose:()=>{Ve?.dispose(),zt?.dispose(),kn?.dispose(),te&&(y.remove(te.group),te.dispose(),te=null),cancelAnimationFrame(ao),ea.disconnect(),na.disconnect(),window.removeEventListener("keydown",qo),window.removeEventListener("keyup",Ko),r.removeEventListener("pointerdown",$o),r.removeEventListener("pointermove",Xo),r.removeEventListener("pointerup",Pn),r.removeEventListener("pointercancel",Pn),r.removeEventListener("wheel",Yo),y.traverse(e=>{const s=e.material;Array.isArray(s)&&s.forEach(a=>a.dispose())}),E.forEach(e=>e.dispose()),p.dispose(),r.remove(),S.remove()}}}export{Dr as createSpace};
