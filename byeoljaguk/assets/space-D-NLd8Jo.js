import{t as A,a as ba}from"./index-CJX1x6si.js";import{G as ve,M as N,S as oe,a as K,b as me,A as Pe,D as De,V as R,R as et,P as en,B as Vt,C as Pn,c as bn,d as Sn,e as j,f as vt,g as jt,h as $n,i as Xn,j as on,N as Zo,k as Sa,l as Pa,L as Ca,m as za,I as Ot,n as Jo,o as tn,p as Hn,q as ka,O as _n,r as nn,W as Ta,s as Da,t as Aa,u as Ea,T as Ra,v as Wa,w as Ia,x as Na,F as Ln,y as _a,z as La,E as Fn,H as Zt,J as No,K as Fa,Q as Ua,U as Ba,X as Ga,Y as Oa,Z as Va,_ as ja,$ as $a,a0 as _o,a1 as Lo,a2 as Xa,a3 as Ha}from"./three-BLBHJbXV.js";import{af as Fo,ag as Ya,ah as Un,ai as Uo,aj as qa,ak as Ka,al as Jt,C as Za,am as Ja,an as dn,ao as Qa}from"./App-D0gvQZ6B.js";import{C as Bo}from"./sky-D0Kg-wz2.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";import"./audio-Cr9SpYLJ.js";const Go=`
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
`,mn=3,Bn=9;function es(t){const n=new ve;n.visible=!1,n.rotation.z=.1;const o=new N(t(new oe(1,48,32)),t(new K({color:"#000000"})));o.renderOrder=0,n.add(o);const u=t(new me({uniforms:{uTime:{value:0},uCam:{value:new R}},transparent:!0,depthWrite:!1,side:De,blending:Pe,vertexShader:`
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
        ${Go}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${mn.toFixed(1)}) / ${(Bn-mn).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${mn.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),p=new N(t(new et(mn,Bn,256,8)),u);p.rotation.x=-Math.PI/2,p.renderOrder=1,n.add(p);const P=t(new me({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:Pe,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${Go}
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
      `})),a=new N(t(new en(8,8)),P);a.renderOrder=2,n.add(a);const S=[{name:A("궁수자리 A*"),at:new R(0,3.6,0)},{name:A("사건의 지평선"),at:new R(0,-2.9,0)},{name:A("강착 원반"),at:new R(Bn-1.2,0,0)}],I=new R;return{group:n,labels:S,update(h,M){u.uniforms.uTime.value=h,P.uniforms.uTime.value=h,M.getWorldPosition(I),u.uniforms.uCam.value.copy(I),a.lookAt(I)}}}const Qt=Math.PI/180;function st(t,n,o){return new R(Math.cos(n*Qt)*Math.cos(t*Qt),Math.sin(n*Qt),-Math.cos(n*Qt)*Math.sin(t*Qt)).multiplyScalar(o)}function ts(){const n=document.createElement("canvas");n.width=64,n.height=64;const o=n.getContext("2d");if(o){const u=o.createRadialGradient(32,32,0,32,32,32);u.addColorStop(0,"rgba(255,255,255,1)"),u.addColorStop(.25,"rgba(255,255,255,0.75)"),u.addColorStop(1,"rgba(255,255,255,0)"),o.fillStyle=u,o.fillRect(0,0,64,64)}return new Pn(n)}function ns(){const t=[],n=h=>(t.push(h),h),o=n(ts());function u(h,M,C){const g=new bn(n(new Sn({map:o,color:new j(h),transparent:!0,depthWrite:!1,blending:Pe})));return g.scale.setScalar(M),g.position.copy(C),g}function p(h,M,C){const g=new Float32Array(h*3),f=new Float32Array(h*3);for(let i=0;i<h;i+=1){const[D,k]=M(i);g.set([D.x,D.y,D.z],i*3),f.set([k.r,k.g,k.b],i*3)}const z=n(new vt);return z.setAttribute("position",new jt(g,3)),z.setAttribute("color",new jt(f,3)),new $n(z,n(new Xn({size:C,map:o,vertexColors:!0,transparent:!0,depthWrite:!1,blending:Pe,sizeAttenuation:!0})))}let P=7;const a=()=>(P=P*16807%2147483647,(P-1)/2147483646),S={},I={};{const h=new ve,M=2.6,C=[["alphacen",A("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",A("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",A("바너드별"),269.45,4.69,5.96,"#ffb27a",A("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",A("울프 359"),164.12,7.01,7.86,"#ff9a6a",A("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",A("시리우스"),101.29,-16.72,8.6,"#cfe0ff",A("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",A("로스 154"),282.46,-23.84,9.69,"#ffa070",A("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",A("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",A("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",A("백조자리 61"),316.7,38.75,11.4,"#ffc58a",A("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",A("프로키온"),114.83,5.22,11.46,"#fff3d6",A("작은개자리의 밝은 별이에요.")],["epsind",A("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",A("남쪽 하늘의 가까운 별이에요.")],["taucet",A("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",A("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];h.add(u("#ffe39a",3.2,new R));const g=[{id:"sun-star",name:A("태양"),line:A("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new R}];for(const[f,z,i,D,k,V,B]of C){const U=st(i,D,k*M);h.add(u(V,2.4,U)),g.push({id:f,name:z,line:ba("{0} 거리 약 {1}광년.",B,k),position:U})}h.add(p(500,()=>[new R(a()-.5,a()-.5,a()-.5).normalize().multiplyScalar(60+a()*30),new j().setHSL(.1,.3,.5+a()*.4)],.9)),S.stars=h,I.stars=g}{const h=new ve,M=1/40,C=[["pleiades",A("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,A("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",A("베텔게우스"),88.79,7.41,548,"#ffab6e",3,A("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",A("리겔"),78.63,-8.2,860,"#cfe0ff",3,A("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",A("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,A("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",A("데네브"),310.36,45.28,2600,"#e6eeff",3,A("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];h.add(u("#ffe39a",1.6,new R));const g=[{id:"sun-orion",name:A("태양"),line:A("우리은하의 오리온 팔 안쪽에 있어요."),position:new R}];for(const[f,z,i,D,k,V,B,U]of C){const q=st(i,D,k*M);h.add(u(V,B,q)),f==="orionneb"&&h.add(p(260,()=>{const H=Math.pow(a(),.6)*5;return[new R(a()-.5,a()-.5,a()-.5).normalize().multiplyScalar(H).add(q),new j(a()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),g.push({id:f,name:z,line:U,position:q})}h.add(p(1400,()=>{const f=(a()-.5)*120,z=(a()-.5)*22*(.4+a()),i=(a()-.5)*4;return[new R(f,i,z),new j().setHSL(.6+a()*.1,.3,.35+a()*.3)]},.8)),S.orion=h,I.orion=g}{const h=new ve,M=4;h.add(p(9e3,g=>{const f=g%M,z=Math.pow(a(),.55)*25,i=f/M*Math.PI*2+Math.log(1+z)*1.9+(a()-.5)*(.5+4/(z+2)),D=(a()-.5)*(z<4?2.2:.7),k=z<4,V=k?new j("#ffd9a0"):new j().setHSL(.58+a()*.06,.45,.45+a()*.35);return[new R(Math.cos(i)*z,D,Math.sin(i)*z),V.multiplyScalar(k?.8:.6)]},.55)),h.add(u("#fff0c8",7,new R));const C=new R(13,0,0);h.add(u("#ffe39a",1.2,C)),S.galaxy=h,I.galaxy=[{id:"center",name:A("은하 중심(궁수자리 A*)"),line:A("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new R},{id:"sun-gal",name:A("태양은 여기"),line:A("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:C}]}{const h=new ve,M=1/1e5,C=(k,V,B,U,q)=>p(U,H=>{const Z=Math.pow(a(),.6)*V,re=H%2*Math.PI+Math.log(1+Z*3)*2.2+(a()-.5)*.9,te=new R(Math.cos(re)*Z,(a()-.5)*V*.05,Math.sin(re)*Z);te.applyAxisAngle(new R(1,0,0),B);const Y=Z<V*.18;return[te.add(k),new j().setHSL(Y?.1:q,.4,.45+a()*.3).multiplyScalar(Y?.35:.22)]},.4),g=new R;h.add(C(g,2.2,0,1800,.6));const f=st(10.68,41.27,25e5*M);h.add(C(f,4.4,1.2,3200,.1));const z=st(23.46,30.66,273e4*M);h.add(C(z,1.6,.6,900,.62));const i=st(80.89,-69.76,16e4*M);h.add(u("#cfd8ff",1.2,i));const D=st(13.19,-72.83,2e5*M);h.add(u("#cfd8ff",.8,D)),S.group=h,I.group=[{id:"mw",name:A("우리 은하"),line:A("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:g},{id:"andromeda",name:A("안드로메다은하"),line:A("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:f},{id:"triangulum",name:A("삼각형자리은하"),line:A("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:z},{id:"lmc",name:A("대마젤란은하"),line:A("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:i}]}{const h=new ve,M=6,C=(k,V,B)=>new R(k,V,B).multiplyScalar(M),g=C(5.1,.35,1.1),f=C(3.4,.45,.2),z=C(-1.4,-.3,-.5),i=[[C(.2,0,0),900,6.4*M*.5],[f,280,1.5*M*.5],[z,220,1.7*M*.5],[C(-2.2,1.6,2.4),120,1.1*M*.5]],D=i.reduce((k,V)=>k+V[1],0);h.add(p(D+180,k=>{let V=k;for(const[U,q,H]of i){if(V<q)return[new R(a()-.5,(a()-.5)*.5,a()-.5).multiplyScalar(2*H*Math.pow(a(),.5)).add(U),new j("#f3eee6").multiplyScalar(.75)];V-=q}const B=a();return[g.clone().lerp(z,B).add(new R((a()-.5)*.7*M,(a()-.5)*.45*M,(a()-.5)*.7*M)),new j("#e7c48a").multiplyScalar(.8)]},.5)),h.add(new N(n(new oe(.95*M,20,16)),n(new K({color:"#d5e2f5",transparent:!0,opacity:.1,blending:Pe,depthWrite:!1}))).translateX(f.x).translateY(f.y).translateZ(f.z)),h.add(new N(n(new oe(1.05*M,20,16)),n(new K({color:"#e7c48a",transparent:!0,opacity:.09,blending:Pe,depthWrite:!1}))).translateX(z.x).translateY(z.y).translateZ(z.z)),h.add(u("#e4b56a",1.2,g)),S.super=h,I.super=[{id:"localgroup",name:A("우리 은하군"),line:A("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:g},{id:"virgo-sc",name:A("처녀자리 은하단"),line:A("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:f},{id:"attractor-sc",name:A("거대 인력체"),line:A("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:z}]}{const h=new ve,M=1/1e7,C=st(187.7,12.4,54e6*M),g=st(243,-60,2e8*M);h.add(p(5e3,z=>{const i=z%5,k=[C,g,st(30,20,15e7*M),st(160,-30,18e7*M),st(300,40,14e7*M)][i],V=i===1?7:4;return[new R((a()-.5)*2,(a()-.5)*2,(a()-.5)*2).multiplyScalar(V*Math.pow(a(),.4)).add(k),new j().setHSL(.08+a()*.5,.35,.55).multiplyScalar(.8)]},.8)),h.add(u("#ffffff",.8,new R));const f=new N(n(new oe(42,48,32)),n(new K({color:"#ff8a4a",transparent:!0,opacity:.08,side:Vt,depthWrite:!1})));h.add(f),S.cosmos=h,I.cosmos=[{id:"here",name:A("우리 은하"),line:A("여기서는 점 하나예요."),position:new R},{id:"virgo",name:A("처녀자리 은하단"),line:A("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:C},{id:"attractor",name:A("거대 인력체"),line:A("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:g},{id:"cmb",name:A("가장 오래된 빛"),line:A("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new R(0,0,-42)}]}for(const h of Object.values(S))h.visible=!1;return{groups:S,markers:I,dispose:()=>t.forEach(h=>h.dispose())}}const os=`
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
`,as=`
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
`,ss=`
uniform float uTile;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vUv = wp.xz / uTile;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,rs=`
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
`,Oo=`
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
`,Vo=`
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
`,Ut=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Gn=`
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
`,vn=`
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
  float edge = smoothstep(0.0, 0.04, t) * smoothstep(1.0, 0.94, t);
  float alpha = clamp(b, 0.0, 1.0) * edge * uAlpha * grain;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(mix(uA, uB, b), alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,Qe=Math.PI*2,Qo=9,jo=140;function rt(t){return t<0?0:t>1?1:t}function Mn(t,n,o){return t<n?n:t>o?o:t}function xt(t,n,o){const u=rt((o-t)/(n-t));return u*u*(3-2*u)}function kt(t,n,o){let u=Math.imul(t|0,374761393)^Math.imul(n|0,668265263)^Math.imul(o|0,2246822519);return u=Math.imul(u^u>>>13,1274126177),((u^u>>>16)>>>0)/4294967295}function is(t,n,o,u){const p=Math.floor(t),P=Math.floor(n),a=t-p,S=n-P,I=a*a*(3-2*a),h=S*S*(3-2*S),M=Math.max(1,Math.round(o)),C=U=>(U%M+M)%M,g=C(p),f=C(p+1),z=C(P),i=C(P+1),D=kt(g,z,u),k=kt(f,z,u),V=kt(g,i,u),B=kt(f,i,u);return(D+(k-D)*I)*(1-h)+(V+(B-V)*I)*h}function it(t,n,o,u,p){let P=0,a=.5,S=0,I=o;for(let h=0;h<u;h+=1)P+=a*is(t*I,n*I,I,p+h*17),S+=a,a*=.5,I*=2;return P/S}function ea(t){let n=t>>>0||1;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function Xt(t,n){const o=document.createElement("canvas");o.width=t,o.height=n;const u=o.getContext("2d");if(!u)throw new Error("2D canvas is unavailable");return{canvas:o,ctx:u}}const cs={crater:{seed:101,macro:.38,mid:.17,fine:.12,speck:.15,craters:20,stones:90,cracks:0,ripples:0,gloss:.02},rock:{seed:211,macro:.4,mid:.22,fine:.14,speck:.2,craters:5,stones:150,cracks:9,ripples:1,gloss:.05},volcano:{seed:331,macro:.32,mid:.24,fine:.16,speck:.22,craters:4,stones:110,cracks:14,ripples:0,gloss:.08},ice:{seed:401,macro:.26,mid:.2,fine:.2,speck:.16,craters:5,stones:18,cracks:22,ripples:0,gloss:.5},plain:{seed:509,macro:.3,mid:.15,fine:.1,speck:.13,craters:8,stones:70,cracks:3,ripples:.35,gloss:.03},plasma:{seed:601,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0},ring:{seed:701,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0}};function xn(t,n,o,u,p,P,a,S,I=!1){const h=Math.ceil(P),M=Math.round(u),C=Math.round(p);for(let g=-h;g<=h;g+=1)for(let f=-h;f<=h;f+=1){const z=(f*f+g*g)/(P*P);if(z>=1)continue;const i=I?Math.sqrt(1-z):1-z,D=((M+f)%o+o)%o,V=((C+g)%o+o)%o*o+D;t[V]+=a*i,n[V]+=S*i}}function ls(t,n,o,u,p,P,a){const S=.09+a()*.12,I=.05+a()*.06,h=.72+a()*.5,M=a()*Math.PI,C=Math.cos(M),g=Math.sin(M),f=Math.ceil(P*1.4),z=Math.round(u),i=Math.round(p);for(let D=-f;D<=f;D+=1)for(let k=-f;k<=f;k+=1){const V=(k*C+D*g)/P,B=(-k*g+D*C)/(P*h),U=Math.sqrt(V*V+B*B);if(U>1.4)continue;let q=0,H=0;U<1&&(q-=Math.pow(1-U*U,1.25)*S,H-=(1-U)*.05);const Z=Math.exp(-Math.pow((U-1.02)/.2,2))*I;q+=Z,H+=Z*1.1+(U>1&&U<1.35?.02:0);const re=((z+k)%o+o)%o,Y=((i+D)%o+o)%o*o+re;n[Y]+=q,t[Y]+=H}}function On(t,n,o,u,p,P,a,S,I,h){const C=Math.max(2,Math.floor(a/1.1));let g=P,f=u,z=p;for(let i=0;i<C;i+=1){g+=(I()-.5)*.3,f+=Math.cos(g)*1.1,z+=Math.sin(g)*1.1;const D=S*(.6+I()*.8);h?(xn(t,n,o,f,z,D*2.2,.03,.008),xn(t,n,o,f,z,D,-.05,-.03)):xn(t,n,o,f,z,D,-.07,-.03)}}function us(t,n){const o=cs[t],u=ea(o.seed),p=n/Qo,P=new Float32Array(n*n),a=new Float32Array(n*n),S=new Float32Array(n*n),I=7;for(let f=0;f<n;f+=1){const z=f/n;for(let i=0;i<n;i+=1){const D=i/n,k=f*n+i,V=it(D,z,3,4,o.seed),B=it(D,z,11,3,o.seed+13),U=it(D,z,43,2,o.seed+29),q=kt(i,f,o.seed+71)-.5;let H=1+(V-.5)*o.macro+(B-.5)*o.mid+(U-.5)*o.fine+q*o.speck,Z=.5+(V-.5)*.06+(B-.5)*.07+(U-.5)*.08+q*.03,re=o.gloss;if(o.ripples>0){const te=z*I+(V-.5)*.85+(B-.5)*.3,Y=Math.sin(te*Qe);H+=Y*.055*o.ripples,Z+=Y*.018*o.ripples}if(t==="volcano"){const te=1-Math.abs(2*U-1);te>.94?(H+=(te-.94)*2.2,Z-=.02,re+=.1):te<.22&&(H-=(.22-te)*.6)}t==="ice"&&(Math.abs(B-.5)<.012&&(H-=.24,Z-=.035),H=.82+(H-1)*.95+(U-.5)*.12,re=rt(.35+U*.55)),(t==="crater"||t==="ring")&&V<.34&&(H-=(.34-V)*1.1),t==="plain"&&(H+=xt(.55,.78,V)*.18),P[k]=H,a[k]=Z,S[k]=re}}for(let f=0;f<o.craters;f+=1){const z=(.3+Math.pow(u(),1.7)*1.1)*p;ls(P,a,n,u()*n,u()*n,z,u)}for(let f=0;f<o.stones;f+=1){const i=(u()<.18?.14+u()*.3:.03+u()*.09)*p,D=f%3===0?.12:-.08;xn(P,a,n,u()*n,u()*n,Math.max(.8,i),D,.02+i*.0012,!0)}for(let f=0;f<o.cracks;f+=1){const z=u()*n,i=u()*n,D=(.6+u()*3.4)*p;On(P,a,n,z,i,u()*Qe,D,.8+u()*1.4,u,t==="ice")}if(t==="ice"){const f=()=>.5;for(let z=0;z<11;z+=1){const i=u()*Qe,D=n*(.45+u()*.75),k=u()*n,V=u()*n;On(P,a,n,k-Math.cos(i)*D*.5,V-Math.sin(i)*D*.5,i,D,1+u()*1.4,f,!0)}for(let z=0;z<10;z+=1){const i=u()*n,D=u()*n,k=u()*Qe;On(P,a,n,i,D,k,(.4+u()*1.6)*p,.8+u(),u,!0)}}const{canvas:h,ctx:M}=Xt(n,n),C=M.createImageData(n,n),g=C.data;for(let f=0;f<n*n;f+=1)g[f*4]=Math.round(Mn(P[f]*.5,0,1)*255),g[f*4+1]=Math.round(Mn(a[f],0,1)*255),g[f*4+2]=Math.round(Mn(S[f],0,1)*255),g[f*4+3]=255;return M.putImageData(C,0,0),h}function le(t){const n=parseInt(t.replace("#",""),16);return[n>>16&255,n>>8&255,n&255]}function je(t,n,o){return[t[0]+(n[0]-t[0])*o,t[1]+(n[1]-t[1])*o,t[2]+(n[2]-t[2])*o]}function fs(t,n,o){const u=t*n,p=Math.floor(u),P=u-p,a=C=>{const g=(C%2+2)%2===0,f=kt(C,7,o);return g?.56+.4*f:.04+.3*f},S=a(p),I=a(p-1),h=a(p+1),M=.44;return P<M?I+(S-I)*xt(0,1,P/M):P>1-M?S+(h-S)*xt(0,1,(P-(1-M))/M):S}const Yn={jupiter:{bands:16,seed:3301,streaky:.8,polar:null,spots:[{u:.62,v:.66,ru:.085,rv:.05,color:le("#a8492f"),swirl:2},{u:.24,v:.34,ru:.05,rv:.026,color:le("#f6efdd"),swirl:0},{u:.46,v:.4,ru:.035,rv:.02,color:le("#fbf3e1"),swirl:0},{u:.83,v:.44,ru:.03,rv:.018,color:le("#f4ecd9"),swirl:0},{u:.36,v:.74,ru:.06,rv:.03,color:le("#8d4b30"),swirl:0}]},saturn:{bands:20,seed:3307,streaky:.38,polar:le("#c9d4d8"),spots:[{u:.7,v:.3,ru:.04,rv:.02,color:le("#f7edd2"),swirl:0},{u:.3,v:.72,ru:.035,rv:.018,color:le("#e6d3a4"),swirl:0}]},uranus:{bands:7,seed:3313,streaky:.25,polar:le("#e6fbfd"),spots:[{u:.55,v:.36,ru:.06,rv:.03,color:le("#dcf4f6"),swirl:0}]},neptune:{bands:9,seed:3319,streaky:.5,polar:le("#a9c8f2"),spots:[{u:.34,v:.62,ru:.06,rv:.032,color:le("#1f3a72"),swirl:1},{u:.72,v:.46,ru:.05,rv:.012,color:le("#e9f3ff"),swirl:0},{u:.62,v:.36,ru:.035,rv:.009,color:le("#f2f8ff"),swirl:0}]}};function ps(t,n,o,u=2){const p=new Uint8ClampedArray(t.length);for(let P=0;P<u;P+=1){for(let a=0;a<o;a+=1)for(let S=0;S<n;S+=1){const I=(S-1+n)%n*4,h=S*4,M=(S+1)%n*4,C=a*n*4;for(let g=0;g<3;g+=1)p[C+h+g]=(t[C+I+g]+t[C+h+g]*2+t[C+M+g])/4}for(let a=0;a<o;a+=1){const S=(a-1+o)%o*n*4,I=a*n*4,h=(a+1)%o*n*4;for(let M=0;M<n;M+=1){const C=M*4;for(let g=0;g<3;g+=1)t[I+C+g]=(p[S+C+g]+p[I+C+g]*2+p[h+C+g])/4}}}}function ta(t,n,o){const u=Yn[t.id]??Yn.jupiter,p=le(t.ground),P=le(t.ground2),a=le(t.ground3),{canvas:S,ctx:I}=Xt(n,o),h=I.createImageData(n,o),M=h.data,C=u.seed,g=new Float32Array(n*o),f=new Float32Array(n*o);for(let k=0;k<o;k+=1){const V=k/o;for(let B=0;B<n;B+=1){const U=B/n,q=(it(U,V,4,3,C)-.5)*.03+(it(U,V,13,2,C+7)-.5)*.005,H=rt(V+q);let Z=fs(H,u.bands,C);const re=it(U*3,V*9,9,3,C+31)-.5;Z+=re*.13*u.streaky;let te;if(Z<.5?te=je(a,P,rt(Z*2)):te=je(P,p,rt((Z-.5)*2)),u.polar){const Ae=xt(.82,1,Math.abs(V-.5)*2);te=je(te,u.polar,Ae*.45)}for(const Ae of u.spots){const $e=(U-Ae.u)/Ae.ru,Be=(V-Ae.v)/Ae.rv,Xe=$e*$e+Be*Be;if(Xe<2.2){const ct=xt(1.05,.25,Xe),ue=Ae.swirl>0?.82+.18*Math.sin(Math.atan2(Be,$e)*3+Xe*7):1;te=je(te,[Ae.color[0]*ue,Ae.color[1]*ue,Ae.color[2]*ue],ct*.92)}}const Y=(k*n+B)*4;M[Y]=te[0],M[Y+1]=te[1],M[Y+2]=te[2],M[Y+3]=255,g[k*n+B]=rt(.5+re*.85+(Z-.5)*.5),f[k*n+B]=.5+re*.85}}const z=t.sunAz*Math.PI/180,i=Math.sin(z),D=-Math.cos(z);for(let k=0;k<o;k+=1){const V=(k+1)%o,B=(k-1+o)%o;for(let U=0;U<n;U+=1){const q=(U+1)%n,H=(U-1+n)%n,Z=f[k*n+q]-f[k*n+H],re=f[V*n+U]-f[B*n+U],te=Mn(1+(Z*i+re*D)*1.8,.9,1.1),Y=(k*n+U)*4;M[Y]=Math.min(255,M[Y]*te),M[Y+1]=Math.min(255,M[Y+1]*te),M[Y+2]=Math.min(255,M[Y+2]*te),M[Y+3]=Math.round(rt(.74+g[k*n+U]*.4)*255)}}return ps(M,n,o,2),I.putImageData(h,0,0),S}function ds(t,n){if(Yn[t.id])return ta(t,n,n);const{canvas:o,ctx:u}=Xt(n,n),p=u.createImageData(n,n),P=p.data,a=le(t.ground),S=le(t.ground2),I=le(t.ground3);for(let h=0;h<n;h+=1){const M=h/n;for(let C=0;C<n;C+=1){const g=C/n,f=it(g,M,4,4,9021),z=it(g,M,16,3,9027),i=rt(f*.72+z*.4);let D=je(S,a,xt(.25,.72,i));D=je(D,I,xt(.66,.95,i)*.8);const k=(h*n+C)*4;P[k]=D[0],P[k+1]=D[1],P[k+2]=D[2],P[k+3]=255}}return u.putImageData(p,0,0),o}function ms(t,n,o){const{canvas:u,ctx:p}=Xt(n,o),P=ea(t==="moon"?51:t==="pluto"?67:83),a=t==="pluto"?"#cbb6a4":t==="charon"?"#9d9a95":"#9a9691";if(p.fillStyle=a,p.fillRect(0,0,n,o),t==="pluto")p.fillStyle="#f3ece1",p.beginPath(),p.ellipse(n*.56,o*.46,n*.13,o*.16,-.2,0,Qe),p.fill(),p.beginPath(),p.ellipse(n*.72,o*.4,n*.07,o*.12,.35,0,Qe),p.fill(),p.fillStyle="rgba(96,68,54,0.62)",p.beginPath(),p.ellipse(n*.24,o*.6,n*.2,o*.13,.1,0,Qe),p.fill(),p.beginPath(),p.ellipse(n*.2,o*.32,n*.14,o*.1,-.2,0,Qe),p.fill();else if(t==="moon")for(let S=0;S<9;S+=1)p.fillStyle=`rgba(58,56,54,${.5+P()*.3})`,p.beginPath(),p.ellipse(P()*n,(.18+P()*.6)*o,(.04+P()*.07)*n,(.03+P()*.06)*o,P()*3,0,Qe),p.fill();else p.fillStyle="rgba(120,84,70,0.6)",p.beginPath(),p.ellipse(n*.5,o*.06,n*.4,o*.09,0,0,Qe),p.fill();for(let S=0;S<220;S+=1){const I=(2+Math.pow(P(),2.4)*26)*(n/1024),h=P()*n,M=P()*o,C=p.createRadialGradient(h,M,0,h,M,I);C.addColorStop(0,"rgba(38,36,34,0.5)"),C.addColorStop(.72,"rgba(70,66,62,0.28)"),C.addColorStop(.9,"rgba(238,233,224,0.32)"),C.addColorStop(1,"rgba(255,255,255,0)"),p.fillStyle=C,p.beginPath(),p.arc(h,M,I,0,Qe),p.fill()}for(let S=0;S<2600;S+=1){const I=(.6+Math.pow(P(),3)*4)*(n/1024);p.fillStyle=P()<.5?"rgba(255,255,255,0.16)":"rgba(30,28,26,0.16)",p.beginPath(),p.arc(P()*n,P()*o,I,0,Qe),p.fill()}return u}function vs(t,n){const{canvas:o,ctx:u}=Xt(t,n),p=u.createImageData(t,n),P=p.data,a=le("#0f3f74"),S=le("#2f8fb0"),I=le("#3f7a45"),h=le("#9a8a55"),M=le("#f2f7fc");for(let C=0;C<n;C+=1){const g=C/n;for(let f=0;f<t;f+=1){const z=f/t,i=z*3.1,D=g*2.4,k=it(i,D,4,5,4404)+(it(i*3,D*3,12,3,4411)-.5)*.18,V=k>.55;let B;if(V){const re=rt((k-.55)*4.2);B=je(I,h,re*.7),re>.55&&(B=je(B,le("#cfc9bb"),(re-.55)*1.6))}else B=je(a,S,rt((k-.35)*3.2));const U=xt(.86,.98,Math.abs(g-.5)*2);U>0&&(B=je(B,M,U));const q=it(z*2,g*6,12,4,4423),H=xt(.56,.82,q)*.72;H>0&&(B=je(B,le("#fbfdff"),H));const Z=(C*t+f)*4;P[Z]=B[0],P[Z+1]=B[1],P[Z+2]=B[2],P[Z+3]=255}}return u.putImageData(p,0,0),o}function hs(t,n,o,u){if(t==="earth")return vs(o,u);if(t==="moon"||t==="pluto"||t==="charon")return ms(t,o,u);const p=t==="saturn"?{...n,id:"saturn",ground:"#f2e2ba",ground2:"#c6a978",ground3:"#9b7f52"}:{...n,id:"jupiter",ground:"#e9d6b4",ground2:"#b57d50",ground3:"#8b5a38"};return ta(p,o,u)}function gs(t){const{canvas:o,ctx:u}=Xt(t,4),p=u.createImageData(t,4),P=p.data,a=1.11,S=2.36,I=le("#f6efdd"),h=le("#c9b48d"),M=le("#6f6455"),C=[[1.11,1.235,.1,.15],[1.235,1.525,.42,.3],[1.525,1.95,.98,.62],[1.951,2.025,.06,.1],[2.025,2.21,.72,.5],[2.211,2.215,.04,.1],[2.215,2.27,.66,.46],[2.27,2.31,.06,.1],[2.315,2.34,.34,.55]];for(let g=0;g<t;g+=1){const f=g/(t-1),z=a+(S-a)*f;let i=0,D=.5;for(const[q,H,Z,re]of C)if(z>=q&&z<=H){i=Z,D=re,i*=.82+.18*Math.sin((z-q)*820+Math.sin((z-q)*140)*2);break}const k=[1.29,1.44,1.63,1.72,1.88,2.06,2.15,2.24,2.29];for(const q of k)Math.abs(z-q)<.0035&&(i*=.12);i*=.9+.14*kt(Math.floor(z*900),3,9931);const V=kt(Math.floor(g/2),7,9931);let B=je(h,I,D);B=je(B,M,(1-Math.min(1,i))*.35);const U=.82+V*.3;for(let q=0;q<4;q+=1){const H=(q*t+g)*4;P[H]=B[0]*U,P[H+1]=B[1]*U,P[H+2]=B[2]*U,P[H+3]=Math.round(rt(i)*255)}}return u.putImageData(p,0,0),o}const Mt=new Map;function Cn(t,n,o,u,p,P){const a=new Pn(n);for(a.colorSpace=o?on:Zo,a.wrapS=u?Sa:Pa,a.wrapT=a.wrapS,a.anisotropy=p,a.magFilter=Ca,a.minFilter=za,a.generateMipmaps=!0,a.needsUpdate=!0,Mt.set(t,a);Mt.size>P;){const S=Mt.keys().next();if(S.done)break;const I=Mt.get(S.value);Mt.delete(S.value),I?.dispose()}return a}function ys(t,n,o){const u=`ground:${t}:${n?"l":"h"}`,p=Mt.get(u);return p||Cn(u,us(t,n?320:512),!1,!0,o,6)}function ws(t,n,o){const u=`cloud:${t.id}:${n?"l":"h"}`,p=Mt.get(u);return p||Cn(u,ds(t,n?512:1024),!0,!0,o,4)}function $o(t,n,o,u){const P=`body:${t??n.id}:${o?"l":"h"}`,a=Mt.get(P);if(a)return a;const S=o?768:1024;return Cn(P,hs(t,n,S,S/2),!0,!1,u,3)}function Vn(t,n){const o=`ring:${t?"l":"h"}`,u=Mt.get(o);return u||Cn(o,gs(t?1024:2048),!0,!1,n,2)}const $t=Math.PI/180,Bt=1500,hn=2800;function gn(t,n){const o=Math.sin(t*127.1+n*311.7)*43758.5453;return o-Math.floor(o)}function qn(t){return t*t*(3-2*t)}function Ms(t,n){const o=Math.floor(t),u=Math.floor(n),p=t-o,P=n-u,a=gn(o,u),S=gn(o+1,u),I=gn(o,u+1),h=gn(o+1,u+1),M=qn(p),C=qn(P);return(a*(1-M)+S*M)*(1-C)+(I*(1-M)+h*M)*C}function yn(t,n,o=4){let u=0,p=.5,P=1;for(let a=0;a<o;a+=1)u+=p*Ms(t*P,n*P),P*=2.03,p*=.5;return u}function Gt(t){let n=t>>>0||1;return()=>(n=n*1664525+1013904223>>>0,n/4294967296)}function xs(t){let n=2166136261;for(let o=0;o<t.length;o+=1)n=Math.imul(n^t.charCodeAt(o),16777619);return n>>>0}function jn(t,n){const o=t*$t,u=n*$t;return new R(Math.sin(o)*Math.cos(u),Math.sin(u),-Math.cos(o)*Math.cos(u)).normalize()}function bs(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d"),u=o.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);u.addColorStop(0,"rgba(255,255,255,1)"),u.addColorStop(.25,"rgba(255,236,196,0.72)"),u.addColorStop(.6,"rgba(255,190,110,0.18)"),u.addColorStop(1,"rgba(255,170,80,0)"),o.fillStyle=u,o.fillRect(0,0,128,128);const p=new Pn(n);return p.colorSpace=on,p}const Ss=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ps=`
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
`,Cs=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,zs=`
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
`;function ks(t,n={}){const o=!!n.low,u=n.anisotropy??(o?4:8),p=new ve,P=[],a=m=>(P.push(m),m);let S=null;const I=xs(t.id),h=Gt(I),M=a(bs()),C=[],g=[];if(t.terrain==="crater"){for(let m=0;m<(o?16:26);m+=1){const d=h()*Math.PI*2,w=20+Math.sqrt(h())*460,c=16+h()*74;C.push({x:Math.cos(d)*w,z:Math.sin(d)*w,r:c,d:c*(.16+h()*.2)})}for(let m=0;m<(o?26:48);m+=1){const d=h()*Math.PI*2,w=4+Math.pow(h(),.7)*150,c=2.5+Math.pow(h(),1.6)*11;C.push({x:Math.cos(d)*w,z:Math.sin(d)*w,r:c,d:c*(.2+h()*.22)})}}if(t.terrain==="volcano")for(let m=0;m<6;m+=1){const d=h()*Math.PI*2,w=60+h()*380;g.push({x:Math.cos(d)*w,z:Math.sin(d)*w,r:40+h()*90,h:12+h()*34})}if(t.terrain==="rock")for(let m=0;m<5;m+=1){const d=h()*Math.PI*2,w=60+h()*400;g.push({x:Math.cos(d)*w,z:Math.sin(d)*w,r:50+h()*110,h:6+h()*16})}function f(m,d,w,c=4){return(yn(m*w,d*w,c)-.48)*2}function z(m,d){if(t.terrain==="plasma"||t.terrain==="ring")return 0;const w=Math.hypot(m,d);let c=0;if(t.terrain==="crater"){c=f(m+11,d+7,.004,4)*16+f(m+3,d+17,.0012,2)*34+f(m+5,d+23,.026,3)*3;for(const x of C){const G=Math.hypot(m-x.x,d-x.z)/x.r;G<1&&(c-=x.d*Math.pow(1-G*G,1.5)),G<1.3&&(c+=x.d*.28*Math.exp(-Math.pow((G-1.02)/.17,2)))}}else if(t.terrain==="rock"){c=f(m+5,d+2,.0035,4)*40,c+=(1-Math.abs(f(m,d,.011,3)))*12,c+=f(m+21,d+13,.0011,2)*60,c+=f(m+31,d+41,.028,3)*3.4;for(const x of g){const G=Math.hypot(m-x.x,d-x.z)/x.r;G<1&&(c+=x.h*Math.pow(1-G,1.7))}}else if(t.terrain==="volcano"){c=f(m+3,d+8,.005,4)*14+f(m+9,d+1,.0012,2)*22;for(const x of g){const G=Math.hypot(m-x.x,d-x.z)/x.r;G<1&&(c+=x.h*Math.pow(1-G,1.25)),G<.24&&(c-=x.h*.5*(1-G/.24))}}else t.terrain==="ice"?c=f(m+9,d+4,.003,4)*9+f(m,d,.012,2)*2.2+f(m+2,d+8,.035,3)*1.1:c=f(m+7,d+3,.0035,4)*12+f(m,d,.012,2)*2.6+f(m+4,d+2,.03,3)*3;const F=Math.max(0,w-1500)/500;return c-=F*F*5,c+=(yn(m*.09+1,d*.09+6,2)-.5)*(t.terrain==="rock"?1.2:t.terrain==="ice"?.25:.5),c}const i=z(0,0);function D(m,d){return z(m,d)-i}const k=(()=>{if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring")return{x:0,z:0};const m=[];for(let w=0;w<40;w+=1){const c=w/40*Math.PI*2,F=w%5*34,x=Math.cos(c)*F,G=Math.sin(c)*F;let J=0;for(let X=0;X<8;X+=1){const pe=X/8*Math.PI*2;J+=D(x+Math.cos(pe)*120,G+Math.sin(pe)*120)}m.push({x,z:G,score:D(x,G)-J/8})}m.sort((w,c)=>c.score-w.score);const d=m[Math.floor(m.length*.28)];return{x:d.x,z:d.z}})(),V=t.cloudTop!==null?t.cloudTop:D(k.x,k.z),B=1.7,U=jn(t.sunAz,t.sunElev),q=t.sunScale>0?.2667*t.sunScale*$t:0,H=Math.max(0,Math.min(1,t.fogDensity*26)),Z=a(new me({vertexShader:Ss,fragmentShader:Ps,side:Vt,depthWrite:!1,uniforms:{uTop:{value:new j(t.skyTop)},uBottom:{value:new j(t.skyBottom)},uGlow:{value:new j(t.glow)},uSun:{value:new j(t.sunColor)},uSunDir:{value:U.clone()},uSunRadius:{value:q},uSunHaze:{value:H},uGlowGain:{value:t.glowGain}}})),re=new N(a(new oe(hn,32,20)),Z);if(re.frustumCulled=!1,p.add(re),t.stars){const m=o?320:620,d=new Float32Array(m*3),w=Gt(I^2654435769);for(let x=0;x<m;x+=1){const G=w()*Math.PI*2,J=Math.pow(w(),.65)*.98+.02,X=Math.sqrt(1-J*J);d[x*3]=Math.cos(G)*X*(hn-200),d[x*3+1]=J*(hn-200),d[x*3+2]=Math.sin(G)*X*(hn-200)}const c=a(new vt);c.setAttribute("position",new jt(d,3));const F=new $n(c,a(new Xn({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1})));F.frustumCulled=!1,p.add(F)}const te=Math.min(1.5,.45+.9*Math.min(1,Math.max(t.sunScale,.02)*1.5)),Y=t.stars?.4:.46,Ae=(m,d)=>{const c=-(D(m+.9,d)-D(m-.9,d))/1.8,F=-(D(m,d+.9)-D(m,d-.9))/(2*.9),x=1/Math.sqrt(c*c+1+F*F),G=Math.max(0,(c*U.x+U.y+F*U.z)*x);return Y+te*G};let $e=[],Be=null;if(t.terrain==="plasma"){const m=a(new me({vertexShader:Cs,fragmentShader:zs,uniforms:{uTime:{value:0},uA:{value:new j(t.ground)},uB:{value:new j(t.ground2)},uC:{value:new j(t.ground3)}}}));Be=m;const d=new N(a(new en(2400,2400,1,1)),m);d.rotation.x=-Math.PI/2,d.position.y=0,p.add(d)}else if(t.terrain!=="ring")if(t.cloudTop!==null){const m=ws(t,o,u),d=Math.min(1.12,.55+.5*Math.min(1,Math.max(t.sunScale,.02)*2)),w=(G,J)=>a(new me({vertexShader:ss,fragmentShader:rs,uniforms:{uMap:{value:m},uOffset:{value:new nn(0,0)},uTile:{value:G},uDetail:{value:11},uTint:{value:new j().setScalar(J)},uOpacity:{value:1},uFogColor:{value:new j(t.fog)},uFogDensity:{value:t.fogDensity}}})),c=new N(a(new en(5200,5200,1,1)),w(jo,d));c.rotation.x=-Math.PI/2,c.position.y=t.cloudTop,p.add(c),$e=[c.material];const F=w(jo*.42,d*.86);F.uniforms.uOpacity.value=.55,F.transparent=!0,F.depthWrite=!1;const x=new N(a(new en(5200,5200,1,1)),F);x.rotation.x=-Math.PI/2,x.position.y=t.cloudTop-90,p.add(x),$e.push(F)}else{const m=o?96:150,d=a(new en(Bt*2,Bt*2,m,m));d.rotateX(-Math.PI/2);const w=d.attributes.position,c=new Float32Array(w.count*3),F=new j(t.ground),x=new j(t.ground2),G=new j(t.ground3),J=new j;for(let he=0;he<w.count;he+=1){const Ce=w.getX(he)/Bt,Re=w.getZ(he)/Bt,de=Math.sign(Ce)*Math.pow(Math.abs(Ce),1.8)*Bt,be=Math.sign(Re)*Math.pow(Math.abs(Re),1.8)*Bt,Ne=D(de,be);w.setXYZ(he,de,Ne,be);const Ke=yn(de*.02+3,be*.02+9,3);J.copy(F).lerp(x,qn(Math.min(1,Math.max(0,(Ke-.28)/.5)))),Ne<-1.6&&J.lerp(G,Math.min(1,(-Ne-1.6)/7));const xe=yn(de*.0045+17,be*.0045+41,3),We=Math.min(1.9,Ae(de,be))*(.9+(Ke-.5)*.22)*(.84+xe*.34);c[he*3]=J.r*We,c[he*3+1]=J.g*We,c[he*3+2]=J.b*We}d.setAttribute("color",new jt(c,3)),d.computeVertexNormals();const X=ys(t.terrain,o,u),pe=1/(X.image.width||512),Ge=a(new me({vertexShader:os,fragmentShader:as,vertexColors:!0,uniforms:{uMap:{value:X},uTexel:{value:pe},uTile:{value:Qo},uDetail:{value:5.6},uBump:{value:9},uGloss:{value:t.terrain==="ice"?.9:.25},uSunDir:{value:U.clone()},uSunColor:{value:new j(t.sunColor)},uFogColor:{value:new j(t.fog)},uFogDensity:{value:t.fogDensity},uAmbient:{value:Y},uSunPower:{value:te}}})),ht=new N(d,Ge);p.add(ht);const Oe=Gt(I^2135587861),St=[t.ground2,t.ground3,t.ground].map(he=>new j(he).multiplyScalar(Y+te*.75)),qe=(he,Ce,Re,de,be,Ne,Ke)=>{const xe=new Hn(he,a(new K({color:16777215})),Ce),We=new _n;for(let ut=0;ut<Ce;ut+=1){const nt=Oe()*Math.PI*2,_e=Re+Math.sqrt(Oe())*(de-Re),ft=k.x+Math.cos(nt)*_e,gt=k.z+Math.sin(nt)*_e,ke=be+Math.pow(Oe(),2.1)*(Ne-be);We.position.set(ft,D(ft,gt)+ke*Ke,gt),We.scale.set(ke*(.8+Oe()*.7),ke*(.45+Oe()*.5),ke*(.8+Oe()*.7)),We.rotation.set(Oe()*3,Oe()*3,Oe()*3),We.updateMatrix(),xe.setMatrixAt(ut,We.matrix),xe.setColorAt(ut,St[ut%3])}xe.instanceMatrix.needsUpdate=!0,xe.instanceColor&&(xe.instanceColor.needsUpdate=!0),p.add(xe)};if(qe(a(new Ot(1,0)),o?90:170,1.2,60,.02,.22,.35),qe(a(new Ot(1,1)),o?30:54,2,120,.18,1.1,.34),qe(a(new Ot(1,1)),o?10:18,6,190,.6,2.4,.4),t.terrain==="ice"){const he=[],Ce=Gt(I^1542469173),Re=(be,Ne,Ke,xe,We,ut)=>{let nt=be,_e=Ne,ft=Ke;for(let gt=0;gt<xe;gt+=1){const ke=nt+Math.cos(ft)*We,ot=_e+Math.sin(ft)*We;he.push(nt,D(nt,_e)+.06,_e,ke,D(ke,ot)+.06,ot),nt=ke,_e=ot,ft+=(Ce()-.5)*.9,ut>0&&gt===xe>>1&&Ce()<.7&&Re(nt,_e,ft+(Ce()<.5?.9:-.9),Math.max(3,xe>>2),We*.8,ut-1)}};for(let be=0;be<(o?6:10);be+=1)Re((Ce()-.5)*300,(Ce()-.5)*300,Ce()*Math.PI*2,14,14,1);const de=a(new vt);de.setAttribute("position",new jt(new Float32Array(he),3)),p.add(new Jo(de,a(new tn({color:t.ground3,transparent:!0,opacity:.75}))))}}if(t.terrain==="ring"){const m=new ve;m.position.copy(jn(t.companionAz,t.companionElev)).multiplyScalar(2600),m.lookAt(0,0,0);const d=470,w=new N(a(new oe(d,o?64:128,o?44:80)),a(new me({vertexShader:Oo,fragmentShader:Vo,uniforms:{uMap:{value:$o("saturn",t,o,u)},uLimb:{value:.4},uRim:{value:new j("#e8dcbc")}}})));m.add(w);const c=a(new me({vertexShader:Ut,fragmentShader:Gn,transparent:!0,side:De,depthWrite:!1,uniforms:{uProfile:{value:Vn(o,u)},uInner:{value:d*1.11},uOuter:{value:d*2.36},uAlpha:{value:o?.78:.88}}})),F=new N(a(new et(d*1.11,d*2.36,o?128:220,1)),c);F.rotation.x=-Math.PI/2+.38,m.add(F),p.add(m);const x=o?220:420,G=a(new Ot(1,0)),J=a(new K({color:"#dfe8f2"})),X=new Hn(G,J,x);X.instanceMatrix.setUsage(ka);const pe=Gt(I^1374496523),Ge=[],ht=new _n;for(let qe=0;qe<x;qe+=1){const Ce=qe%31===0?.5+pe()*1.3:.05+Math.pow(pe(),2)*.55,Re=14+Math.pow(pe(),.7)*150,de=pe()*Math.PI*2,be=(pe()-.5)*14;Ge.push({r:Re,a:de,y:be,spin:.02+pe()*.08,size:Ce,wob:pe()*Math.PI*2}),ht.position.set(Math.cos(de)*Re,be,Math.sin(de)*Re),ht.rotation.set(pe()*3,pe()*3,pe()*3),ht.scale.setScalar(Ce),ht.updateMatrix(),X.setMatrixAt(qe,ht.matrix);const Ne=.5+pe()*.45;X.setColorAt(qe,new j(Ne,Ne*.98,Ne*1.05))}X.instanceMatrix.needsUpdate=!0,X.instanceColor&&(X.instanceColor.needsUpdate=!0),p.add(X),S={mesh:X,data:Ge};const Oe=a(new me({vertexShader:Ut,fragmentShader:vn,transparent:!0,side:De,depthWrite:!1,uniforms:{uInner:{value:30},uOuter:{value:1400},uBands:{value:420},uA:{value:new j("#cfd8e4")},uB:{value:new j("#9fb0c4")},uAlpha:{value:.26},uGrain:{value:.3}}})),St=new N(a(new et(30,1400,128,1)),Oe);St.rotation.x=-Math.PI/2-.05,St.position.y=-3,p.add(St)}if(t.ring){const m=t.ring==="uranus",d=m?210:170,w=m?520:560,c=m?82*$t:27*$t,F=m?140:54,x=a(m?new me({vertexShader:Ut,fragmentShader:vn,transparent:!0,side:De,depthWrite:!1,uniforms:{uInner:{value:d},uOuter:{value:w},uBands:{value:F},uA:{value:new j("#9fd0d6")},uB:{value:new j("#cdeef2")},uAlpha:{value:.5},uGrain:{value:.4}}}):new me({vertexShader:Ut,fragmentShader:Gn,transparent:!0,side:De,depthWrite:!1,uniforms:{uProfile:{value:Vn(o,u)},uInner:{value:d},uOuter:{value:w},uAlpha:{value:.82}}})),G=new N(a(new et(d,w,o?64:128,1)),x);if(G.rotation.x=-Math.PI/2+c,G.position.y=m?30:90,p.add(G),m){const J=a(new me({vertexShader:Ut,fragmentShader:vn,transparent:!0,side:De,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new j("#dff6f8")},uB:{value:new j("#bfe6ea")},uAlpha:{value:.35},uGrain:{value:.3}}})),X=new N(a(new et(130,175,64,1)),J);X.rotation.x=-Math.PI/2+c,X.position.y=30,p.add(X)}}if(t.companion){const d=Math.max(6,Math.tan(t.companionSize/2*$t)*1500),w=new ve;w.position.copy(jn(t.companionAz,t.companionElev)).multiplyScalar(1500);const c=$o(t.companion,t,o,u),F=new N(a(new oe(d,o?48:72,o?32:48)),a(new me({vertexShader:Oo,fragmentShader:Vo,uniforms:{uMap:{value:c},uLimb:{value:.42},uRim:{value:new j(t.companion==="earth"?"#9fd0ff":"#cfe0f2")}}})));if(F.lookAt(0,0,0),w.add(F),t.companion==="saturn"||t.companion==="jupiter"){const G=t.companion==="saturn",J=a(new me({vertexShader:Ut,fragmentShader:G?Gn:vn,transparent:!0,side:De,depthWrite:!1,uniforms:G?{uProfile:{value:Vn(o,u)},uInner:{value:d*1.12},uOuter:{value:d*2.36},uAlpha:{value:.7}}:{uInner:{value:d*1.3},uOuter:{value:d*1.7},uBands:{value:16},uA:{value:new j("#d9c7a8")},uB:{value:new j("#b09070")},uAlpha:{value:.18},uGrain:{value:.3}}})),X=new N(a(new et(d*(G?1.12:1.3),d*(G?2.36:1.7),64,1)),J);X.rotation.x=-Math.PI/2+.32,w.add(X)}const x=new bn(a(new Sn({map:M,color:new j(t.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:Pe})));x.scale.setScalar(d*4),w.add(x),p.add(w)}const Xe=o?140:t.particles==="haze"?120:300;let ct=null,ue=null;if(t.particles!=="none"){const m=new Float32Array(Xe*3);ue=new Float32Array(Xe*3);const d=Gt(I^625341585);for(let x=0;x<Xe;x+=1){const G=d()*Math.PI*2,J=Math.sqrt(d())*55,X=t.particles;let pe=d()*22;X==="spark"&&(pe=d()*14),X==="haze"&&(pe=2+d()*26),m[x*3]=Math.cos(G)*J,m[x*3+1]=pe,m[x*3+2]=Math.sin(G)*J;const Ge=X==="wind"?42+d()*34:X==="rain"?12+d()*6:X==="spark"?2+d()*4:1.2+d()*2.6;ue[x*3]=X==="wind"?Ge:(d()-.5)*Ge*.5,ue[x*3+1]=X==="rain"?-Ge:X==="spark"?Ge:X==="snow"?-.6-d()*.9:(d()-.5)*.4,ue[x*3+2]=X==="wind"?Ge*.25:(d()-.5)*Ge*.4}ct=a(new vt),ct.setAttribute("position",new jt(m,3));const w=t.particles==="haze"?2.6:t.particles==="dust"?.14:t.particles==="rain"?.09:t.particles==="snow"?.11:.16,c=a(new Xn({color:new j(t.particleColor),size:w,transparent:!0,opacity:t.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:t.particles==="spark"?Pe:void 0})),F=new $n(ct,c);F.frustumCulled=!1,p.add(F)}const He=a(new Ot(.26,0)),Ye=a(new oe(.24,16,12)),Ht=t.cloudTop===null&&t.terrain!=="plasma",tt=[],lt=[],bt=[];function Et(m,d,w,c){const F=new bn(a(new Sn({map:M,color:new j(d),transparent:!0,opacity:.9,depthWrite:!1,blending:Pe})));F.position.copy(m),F.scale.setScalar(w),p.add(F),lt.push({sprite:F,life:c,max:c,grow:w*2.4})}function Tt(m,d){const w=new N(a(new et(.28,.5,24,1)),a(new K({color:new j(d),transparent:!0,opacity:.6,depthWrite:!1,side:De})));w.rotation.x=-Math.PI/2,w.position.copy(m),p.add(w),bt.push({mesh:w,life:.7})}function Rt(m,d){const w=k.x+m,c=k.z+d,F=t.cloudTop!==null?t.cloudTop:D(w,c),x=Ht?new K({color:new j("#c9c2b4").multiplyScalar(Y+te*.8),transparent:!0}):new K({color:new j("#ffb45e"),transparent:!0}),G=new N(Ht?He:Ye,x);G.position.set(w,F+4.2,c),G.scale.setScalar(.9+Math.random()*.35),p.add(G);const J=t.gravityMps2<=.01;if(tt.push({mesh:G,x:w,z:c,y:J?F+.6:F+4.2,vy:J?.12:0,vx:J?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:J?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),tt.length>6){const X=tt.shift();X&&(p.remove(X.mesh),X.mesh.material.dispose())}}function Wt(m,d){const w=new R(m.x,d+.2,m.z);if(t.gravityMps2<=.01){m.outcome="float",m.landed=!0,m.resting=5.5,n.onLand?.({seconds:m.fall,bounces:0,outcome:"float"});return}if(t.terrain==="plasma"){m.outcome="vapor",m.landed=!0,m.resting=.25,Et(w,"#fff2c0",1.2,.6),n.onLand?.({seconds:m.fall,bounces:0,outcome:"vapor"});return}if(t.cloudTop!==null){m.outcome="sink",m.landed=!0,m.resting=1.6,Et(w,"#ffffff",1.6,.7),n.onLand?.({seconds:m.fall,bounces:0,outcome:"sink"});return}if(m.bounces+=1,Tt(w,t.ground2),m.bounces===1&&n.onLand?.({seconds:m.fall,bounces:1,outcome:"bounce"}),m.bounces>=4||Math.abs(m.vy)<1.3){m.landed=!0,m.outcome="bounce",m.resting=1.6,m.vy=0;return}m.vy=Math.abs(m.vy)*.42,m.y=d+.26,m.vx*=.6,m.vz*=.6}const Ee=new _n;function $(m,d){Be&&(Be.uniforms.uTime.value=m);for(let w=0;w<$e.length;w+=1){const c=$e[w].uniforms.uOffset.value;c.x=(c.x+d*(w===0?.006:.012))%1}if(S){const{mesh:w,data:c}=S;for(let F=0;F<c.length;F+=1){const x=c[F];x.a+=x.spin*d*.05,Ee.position.set(Math.cos(x.a)*x.r,x.y+Math.sin(m*.25+x.wob)*.5,Math.sin(x.a)*x.r),Ee.rotation.set(m*.08+x.wob,m*.11+x.a,x.wob),Ee.scale.setScalar(x.size),Ee.updateMatrix(),w.setMatrixAt(F,Ee.matrix)}w.instanceMatrix.needsUpdate=!0}if(ct&&ue){const w=ct.attributes.position,c=w.array;for(let F=0;F<w.count;F+=1){const x=F*3;c[x]+=ue[x]*d,c[x+1]+=ue[x+1]*d,c[x+2]+=ue[x+2]*d,t.particles==="rain"||t.particles==="snow"?c[x+1]<0&&(c[x+1]=22):t.particles==="spark"?c[x+1]>20&&(c[x+1]=0):(c[x+1]<0&&(c[x+1]=24),c[x+1]>26&&(c[x+1]=0)),c[x]>60&&(c[x]=-60),c[x]<-60&&(c[x]=60),c[x+2]>60&&(c[x+2]=-60),c[x+2]<-60&&(c[x+2]=60)}w.needsUpdate=!0}for(let w=tt.length-1;w>=0;w-=1){const c=tt[w],F=t.cloudTop!==null?t.cloudTop:D(c.x,c.z);if(c.landed)c.resting>0?(c.resting-=d,c.outcome==="sink"?(c.y-=d*2.4,c.mesh.scale.multiplyScalar(1-d*.8)):c.outcome==="vapor"?c.mesh.scale.multiplyScalar(1-d*3):c.mesh.scale.multiplyScalar(1-d*.25)):(c.fade-=d*1.4,c.mesh.material.opacity=Math.max(0,c.fade),c.mesh.scale.multiplyScalar(1-d*.9),c.fade<=0&&(p.remove(c.mesh),c.mesh.material.dispose(),tt.splice(w,1)));else{if(c.fall+=d,t.gravityMps2<=.01){c.x+=c.vx*d,c.z+=c.vz*d,c.y+=c.vy*d,c.mesh.rotation.x+=d*.6,c.mesh.rotation.y+=d*.45,c.mesh.position.set(c.x,c.y,c.z),c.fall>.05&&Wt(c,c.y);continue}c.vy-=t.gravityMps2*d,c.y+=c.vy*d,c.x+=c.vx*d,c.z+=c.vz*d,c.mesh.rotation.x+=d*3.2,c.mesh.rotation.z+=d*2.1,c.y-.26<=F&&(c.y=F+.26,Wt(c,F))}c.mesh.position.set(c.x,c.y,c.z)}for(let w=lt.length-1;w>=0;w-=1){const c=lt[w];c.life-=d;const F=1-c.life/c.max;c.sprite.scale.setScalar(c.sprite.scale.x+(c.grow-c.sprite.scale.x)*Math.min(1,d*6)),c.sprite.material.opacity=Math.max(0,.9*(1-F)),c.life<=0&&(p.remove(c.sprite),lt.splice(w,1))}for(let w=bt.length-1;w>=0;w-=1){const c=bt[w];c.life-=d,c.mesh.scale.multiplyScalar(1+d*3.4),c.mesh.material.opacity=Math.max(0,c.life/.7)*.6,c.life<=0&&(p.remove(c.mesh),bt.splice(w,1))}}function an(){for(const m of lt)p.remove(m.sprite);for(const m of bt)p.remove(m.mesh);for(const m of tt)p.remove(m.mesh),m.mesh.material.dispose();P.forEach(m=>m.dispose()),p.clear()}return{group:p,eyeY:V+B,groundY:V,standX:k.x,standZ:k.z,update:$,drop:Rt,dispose:an}}const Xo="textures/",Ue=Math.PI/180;function wn(t,n,o=1){return new R(Math.cos(t*Ue)*Math.cos(n*Ue),Math.sin(t*Ue),-Math.cos(t*Ue)*Math.sin(n*Ue)).multiplyScalar(o)}const fe=2.2,Ts=Date.UTC(2e3,0,1,12),Ho={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},Yo={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function Ds(){if(typeof window>"u")return!0;const t=navigator,n=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,o=t.hardwareConcurrency??8,u=t.deviceMemory??8;return!!(n||o<=4||u<=4)}function As(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d");if(o){const u=o.createRadialGradient(64,64,0,64,64,64);u.addColorStop(0,"rgba(255,238,205,0.85)"),u.addColorStop(.3,"rgba(255,214,150,0.55)"),u.addColorStop(.45,"rgba(255,190,120,0.22)"),u.addColorStop(.7,"rgba(250,170,95,0.07)"),u.addColorStop(1,"rgba(255,160,80,0)"),o.fillStyle=u,o.fillRect(0,0,128,128)}return new Pn(n)}const Es=`
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
}`,Rs=`
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
}`;function Ws(t){return Math.max(.12,.16+.11*Math.log2(t/2e3))}const Is=`
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
}`,Ns=`
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
}`,_s=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Ls=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
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
}`,Fs=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Us=`
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
}`,Bs=`
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
}`,Gs=`
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
}`,Os=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Vs=`
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
}`,js=`
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
}`,$s=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function er(t,n){const o=Ds(),u=o?96:128,p=new Ta({antialias:!0,powerPreference:"default",alpha:!1});p.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),p.outputColorSpace=on,p.toneMapping=Da,p.toneMappingExposure=1.1;const P=Math.min(4,p.capabilities.getMaxAnisotropy()),a=p.domElement;a.style.display="block",a.style.width="100%",a.style.height="100%",a.style.touchAction="none",t.appendChild(a);const S=document.createElement("div");S.className="space-labels",t.appendChild(S);const I=[];let h=0;function M(){const e=performance.now();if(e-h<400)return;h=e,I.length=0;const s=t.getBoundingClientRect();for(const r of[".explore-top",".sheet",".sky-alert"]){const v=document.querySelector(r);if(!v)continue;const b=v.getBoundingClientRect();b.width<2||b.height<2||I.push({x:b.left-s.left,y:b.top-s.top,w:b.width,h:b.height})}}function C(e,s,r,v=22){for(const b of I)if(e<b.x+b.w&&e+r>b.x&&s<b.y+b.h&&s+v>b.y)return!0;return!1}const g=new Aa;g.background=new j("#05070d");const f=new Ea(45,1,.01,2e3),z=[],i=e=>(z.push(e),e),D=new Ra,k=new Wa,V=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),B=new Map,U=new Map,q=[],H=new Set;let Z=!1,re=0;const te=(e,s)=>{const r=U.get(e);if(r){U.delete(e);for(const v of r)v(s)}},Y=(e,s=!0)=>{const r=B.get(e);if(r)return r;re+=1;const v=D.load(Xo+e,()=>{te(e,v),re-=1,re===0&&n.onReady?.()},void 0,()=>{te(e,v),re-=1,re===0&&n.onReady?.()});return v.colorSpace=s?on:Zo,v.anisotropy=o?4:8,B.set(e,v),i(v)},Ae=e=>{B.has(e)||H.has(e)||(H.add(e),k.load(Xo+e,s=>{H.delete(e);const r=new Xa;r.image=s,r.colorSpace=on,r.anisotropy=o?4:8,r.needsUpdate=!0,i(r),B.set(e,r),te(e,r)},void 0,()=>{H.delete(e)}))},$e=()=>{if(!Z){Z=!0;for(const e of q)Ae(e)}},Be=(e,s)=>{if(V.has(e)){s(Y(e));return}const r=B.get(e);if(r){s(r);return}const v=U.get(e)??[];v.push(s),U.set(e,v),q.includes(e)||(q.push(e),Z&&Ae(e))},Xe=new N(i(new oe(900,48,24)),i(new K({map:Y("milkyway.webp"),side:Vt,depthWrite:!1})));Xe.rotation.set(63*Ue,0,0),g.add(Xe),g.add(new Ia(16777215,.14));const ct=new Na(16777215,1.6,0,0);ct.decay=0,g.add(ct);const ue=new ve;g.add(ue);const He=new Map,Ye=new Map,Ht=new Map,tt=[],lt=new Map;let bt=null,Et=null;const Tt=new Map,Rt=new Map,Wt=new Map,Ee=new Map;let $=null,an=0,m=null;const d=[],w=[],c=[],F=[],x=[];let G=Date.now(),J=!0,X=null;function pe(e,s,r,v){const b=Ho[r]??[.7,.7,.7,.06],W=Yo[r],L=new j(s),O=W?.relief??0,l=i(new me({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new nn(W?.texel?.[0]??1/1024,W?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:O*.35},gain:{value:(W?.gain??1.9)*.6},base:{value:new R(L.r,L.g,L.b)},glow:{value:new R(b[0],b[1],b[2])},atmo:{value:Math.min(b[3]*2.2,.85)},ringShadow:{value:v?1:0},ringMap:{value:null},ringInner:{value:v?.inner??1},ringOuter:{value:v?.outer??2},ringCenter:{value:new R},ringNormal:{value:new R(0,1,0)}},vertexShader:Es,fragmentShader:Rs}));return e&&Be(e,y=>{l.uniforms.dayMap.value=y,l.uniforms.useMap.value=1,O>0&&(l.uniforms.bumpMap.value=y,l.uniforms.useBump.value=1)}),v&&Be("saturn-ring.webp",y=>{l.uniforms.ringMap.value=y}),l}function Ge(e,s,r){const v=Yo[r],b=v?.tint??Ho[r]?.slice(0,3);if(!b||o)return;const W=Math.min(v?.inner??.12,.5)*.55,L=Math.min(v?.outer??.05,.2)*.9,O=new R(b[0],b[1],b[2]),l=Math.sqrt(1-1/(1.045*1.045)),y=(T,_,ne,ge)=>new N(i(new oe(s*T,o?24:32,o?16:24)),i(new me({uniforms:{tint:{value:O},power:{value:ne},strength:{value:ge},edge:{value:l}},vertexShader:qo,fragmentShader:Ko,side:_,transparent:!0,blending:Pe,depthWrite:!1})));e.add(y(1.045,Vt,2.7,W),y(1.16,_o,3.4,L))}function ht(e,s){const r=i(new me({uniforms:{poleN:{value:wn(80.7,-72.7,1).normalize()},poleS:{value:wn(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:Fs,fragmentShader:Us,transparent:!0,blending:Pe,depthWrite:!1})),v=new N(i(new oe(s*1.022,o?64:96,o?48:64)),r);v.renderOrder=1,e.add(v),F.push(r)}function Oe(e,s){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([v,b,W,L,O],l)=>{const y=wn(v,b,1).normalize(),T=new R(0,1,0).cross(y).normalize(),_=new R().crossVectors(y,T).normalize(),ne=T.multiplyScalar(Math.cos(O)).addScaledVector(_,Math.sin(O)).normalize(),ge=[];for(let we=0;we<=16;we+=1){const mt=we/16,Fe=(mt-.5)*W,ze=Math.sin(mt*Math.PI)*L;ge.push(new R().copy(y).multiplyScalar(Math.cos(Fe)).addScaledVector(ne,Math.sin(Fe)).normalize().multiplyScalar(s*(.985+ze)))}const ye=i(new me({uniforms:{uTime:{value:0},seed:{value:l*.37+.11}},vertexShader:Bs,fragmentShader:Gs,transparent:!0,blending:Pe,side:De,depthWrite:!1})),Je=new N(i(new Va(new ja(ge),64,s*.022,8,!1)),ye);Je.raycast=()=>{},e.add(Je),x.push(ye)})}function St(e,s,r=""){const v=document.createElement("button");v.type="button",v.className="space-label"+r,v.textContent=s,v.addEventListener("click",()=>n.onPick?.(e)),S.appendChild(v),Ht.set(e,v)}const qe=i(new me({uniforms:{map:{value:Y("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),he=new R,Ce=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],Re=new Map;let de=null;const be={moon:"earth",...Object.fromEntries(Fo.map(e=>[e.id,e.parent]))};function Ne(e,s){const r=be[e];if(de===null||!r)return dn(e,s);const v=dn(r,s),b=dn(e,de),W=dn(r,de);return{x:v.x+b.x-W.x,y:v.y+b.y-W.y,z:v.z+b.z-W.z}}function Ke(e){for(const[s,r]of Ye){if(s==="sun")continue;const v=Ne(s,e);r.position.set(v.x*fe,v.y*fe,v.z*fe)}for(const[s,r]of Tt){const v=Ne(s,e);r.position.set(v.x*fe,v.y*fe,v.z*fe)}if(m){he.copy(m.holder.position);const s=he.length()||1;m.tail.visible=s/fe<8,he.multiplyScalar(1/s),m.tail.quaternion.setFromUnitVectors(new R(0,1,0),he),m.tail.position.copy(he).multiplyScalar(.16*fe)}}const xe=new R(1,0,0),We=i(new me({uniforms:{dayMap:{value:Y("earth-day.webp")},nightMap:{value:Y("earth-night.webp")},normalMap:{value:Y("earth-normal.webp",!1)},specMap:{value:Y("earth-spec.webp",!1)},texel:{value:new nn(1/2048,1/1024)},sunDir:{value:xe}},vertexShader:Is,fragmentShader:Ns}));function ut(e){const s=new ve,r=new N(i(new oe(e,o?96:128,64)),We);r.name="earth",s.add(r);const v=new N(i(new oe(e*1.012,80,48)),i(new $a({map:Y("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));s.add(v),bt=v;const b=new N(i(new oe(e*1.06,64,48)),i(new me({uniforms:{sunDir:{value:xe}},vertexShader:`
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
            }`,side:Vt,transparent:!0,blending:Pe,depthWrite:!1})));s.add(b);const W=new N(i(new oe(e*1.15,o?24:32,o?16:24)),i(new me({uniforms:{tint:{value:new R(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:qo,fragmentShader:Ko,side:_o,transparent:!0,blending:Pe,depthWrite:!1})));return s.add(W),He.set("earth",r),s}function nt(e,s,r){for(const v of Jt(e).sites??[]){const b=new N(i(new oe(r*.018,12,8)),i(new K({color:"#3182f6"})));b.position.copy(wn(v.lat,v.lon,r*1.004)),s.add(b);const W=document.createElement("div");W.className="space-site",W.textContent=v.name,S.appendChild(W),tt.push({mesh:b,site:v,el:W,parent:e})}}let _e=null;for(const e of Ya){if(e.id==="moon")continue;const s=new ve;if(Ye.set(e.id,s),ue.add(s),e.id==="sun"){const r=.26*fe,v=new N(i(new oe(r,o?96:128,o?64:80)),qe);v.name="sun",lt.set("sun",r),s.add(v),Oe(v,r);for(const[W,L,O,l]of[[1.06,2,.95,"#ffbf78"]])s.add(new N(i(new oe(r*W,o?32:48,o?24:32)),i(new me({uniforms:{color:{value:new j(l)},power:{value:L},strength:{value:O}},vertexShader:_s,fragmentShader:Ls,transparent:!0,blending:Pe,depthWrite:!1}))));He.set("sun",v);const b=new bn(i(new Sn({map:i(As()),blending:Pe,transparent:!0,depthWrite:!1,depthTest:!0,color:new j("#ffd9a0")})));b.scale.setScalar(r*3.6),s.add(b),Et=b}else{const r=Un(e.id).radius*fe;lt.set(e.id,r);let v;if(e.id==="earth"){const O=ut(r);O.rotation.z=-e.tilt*Ue,s.add(O),_e=O,v=O.children[0]}else{const O=e.id==="saturn"?{inner:r*1.18,outer:r*2.08}:void 0;v=new N(i(new oe(r,o?96:128,64)),pe(e.texture,e.color,e.id,O)),v.name=e.id,v.rotation.z=-e.tilt*Ue,s.add(v),He.set(e.id,v),Ge(s,r,e.id),e.id==="jupiter"&&ht(v,r)}if(e.axes){const[O,l,y]=e.axes;v.scale.set(1,y/O,l/O)}if(e.ring&&e.axes){const O=e.axes[0]/2,l=r*(e.ring.radius-e.ring.width/2)/O,y=r*(e.ring.radius+e.ring.width/2)/O,T=new N(i(new et(l,Math.max(y,l*1.03),128,1)),i(new K({color:"#8b8580",side:De,transparent:!0,opacity:.75,depthWrite:!1})));T.rotation.x=Math.PI/2,s.add(T)}if(e.id==="saturn"){const O=r*1.18,l=r*2.08,y=new et(O,l,160,1),T=i(new me({uniforms:{ringMap:{value:null},innerRatio:{value:O/l},planetRadius:{value:r},planetCenter:{value:new R}},vertexShader:Os,fragmentShader:Vs,side:De,transparent:!0,depthWrite:!1}));Be("saturn-ring.webp",ne=>{T.uniforms.ringMap.value=ne});const _=new N(i(y),T);_.rotation.x=Math.PI/2,v.add(_),w.push({mesh:_,parent:e.id}),c.push({mesh:v,material:v.material})}e.sites&&nt(e.id,v,r);const b=Uo(e.id,.022),W=i(new vt);W.setAttribute("position",new Ln(b.positions,3)),W.setIndex(b.index),W.scale(fe,fe,fe);const L=new N(W,i(new K({color:Un(e.id).ribbon,transparent:!0,opacity:.5,side:De,depthWrite:!1})));d.push(L),ue.add(L)}St(e.id,e.name,e.id==="sun"?"":" is-planet")}const ft=[];function gt(e,s,r){let v=e==="main"?1234:98765;const b=()=>(v=v*16807%2147483647,(v-1)/2147483646),W=i(new Ot(1,0)),L=new Float32Array(s*4),O=new Float32Array(s*4);for(let T=0;T<s;T+=1){let _;if(e==="main")do _=2.1+b()*1.2;while((Math.abs(_-2.5)<.03||Math.abs(_-2.82)<.03||Math.abs(_-2.95)<.02)&&b()<.85);else _=b()<.18?39.2+(b()-.5)*1.2:42+(b()-.5)*6.5;L[T*4]=_,L[T*4+1]=b()*Math.PI*2,L[T*4+2]=b()*(e==="main"?.18:.12),L[T*4+3]=b()*Math.PI*2,O[T*4]=(b()-.5)*(e==="main"?.32:.5),O[T*4+1]=b()*Math.PI*2;const ne=b()**3;O[T*4+2]=(e==="main"?.0035:.009)*(.7+ne*2.4),O[T*4+3]=b()}W.setAttribute("orbit",new Lo(L,4)),W.setAttribute("shape",new Lo(O,4));const l=i(new me({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new j(r)},uScale:{value:fe}},vertexShader:js,fragmentShader:$s})),y=new Hn(W,l,s);y.frustumCulled=!1,y.raycast=()=>{},ue.add(y),ft.push({mesh:y,material:l})}gt("main",o?1800:4200,"#9c9184"),gt("kuiper",o?1500:3600,"#7f8b9c");for(const e of Fo){const s=new ve,r=new N(i(new oe(e.radius*fe,32,24)),pe(`${e.id}.webp`,e.color,e.id));r.name=e.id,s.add(r),ue.add(s),Tt.set(e.id,s),Rt.set(e.id,r);const v=document.createElement("button");v.type="button",v.className="space-label is-small",v.textContent=e.name,v.addEventListener("click",()=>n.onExtra?.(e.id)),S.appendChild(v),Wt.set(e.id,{el:v,parent:e.parent})}{const e=new ve,s=new N(i(new oe(.045*fe,20,16)),i(new K({color:"#f7fbff"})));s.name="halley",e.add(s);const r=new N(i(new _a(.04*fe,.32*fe,12)),i(new K({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(r),m={holder:e,tail:r},ue.add(e),Tt.set("halley",e),Rt.set("halley",s);const v=Uo("halley",.022),b=i(new vt);b.setAttribute("position",new Ln(v.positions,3)),b.setIndex(v.index),b.scale(fe,fe,fe);const W=new N(b,i(new K({color:Un("halley").ribbon,transparent:!0,opacity:.35,side:De,depthWrite:!1})));d.push(W),ue.add(W);const L=document.createElement("button");L.type="button",L.className="space-label is-small",L.textContent=A("핼리 혜성"),L.addEventListener("click",()=>n.onExtra?.("halley")),S.appendChild(L),Wt.set("halley",{el:L,parent:null})}for(const e of qa){const s=Ka(e),r=s.points.map(ne=>new R(ne.x*fe,ne.y*fe,ne.z*fe)),v=i(new vt().setFromPoints(r)),b=new La(v,i(new tn({color:e.color,transparent:!0,opacity:.95})));b.visible=!1;const W=new ve,L=new N(i(new Fn(.03,.01,.01,20)),i(new K({color:"#d8dde4"})));L.rotation.x=Math.PI/2;const O=new N(i(new oe(.014,12,8)),i(new K({color:"#c9ced6"})));O.position.z=-.02;const l=new N(i(new Fn(.002,.002,.09,6)),i(new K({color:"#aab3c0"})));l.rotation.z=Math.PI/2,l.position.z=-.02;const y=new N(i(new oe(.035,16,12)),i(new K({color:e.color,transparent:!0,opacity:.18,blending:Pe,depthWrite:!1})));W.add(L,O,l,y),W.scale.setScalar(e.frame==="earth"?.8:1.3),W.position.copy(r[r.length-1]),b.add(W),(e.frame==="earth"?Ye.get("earth")??ue:ue).add(b);const _=document.createElement("div");_.className="space-site is-probe",_.textContent=e.name,S.appendChild(_),Ee.set(e.id,{line:b,probe:W,el:_,points:r,times:s.points.map(ne=>ne.t),marks:s.marks,frame:e.frame})}if(Ke(G),_e){const e=.055*fe;lt.set("moon",e);const s=new N(i(new oe(e,u,48)),pe("moon.webp","#b8b8b8","moon"));s.name="moon";const r=new ve;r.add(s),ue.add(r),He.set("moon",s),Ye.set("moon",r),nt("moon",s,e),St("moon",A("달")," is-small"),Ke(G)}const ke=new ve,ot=new ve,sn=new ve;ke.add(ot,sn),ke.visible=!1;let Kn="solar",Pt=!1,zn=0;const ae={moon:new N,moonMat:i(new K({color:"#ffffff"})),shadow:i(new K({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new N,umbra:new N,skyCover:new N,skySun:new ve,skyMoon:new ve,skyMoonMat:i(new K({color:"#ffffff"}))},kn=[],Zn=Y("sun.webp"),Jn=Y("moon.webp"),Qn=new N(i(new oe(.62,32,24)),i(new K({map:Zn})));Qn.position.set(-3.3,0,0);const eo=new N(i(new oe(.4,32,24)),i(new K({map:Y("earth-day.webp")})));eo.position.set(1.85,0,0),ae.moonMat.map=Jn,ae.moon=new N(i(new oe(.14,24,18)),ae.moonMat),ae.cone=new N(i(new Fn(.04,.16,.78,18)),ae.shadow),ae.cone.position.set(1.42,0,0),ae.cone.rotation.z=Math.PI/2,ae.umbra=new N(i(new Zt(.3,28)),i(new K({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),ae.umbra.position.set(2.75,0,.02),ot.add(Qn,eo,ae.moon,ae.cone,ae.umbra);for(const[e,s]of[[A("태양"),new R(-3.3,.85,0)],[A("지구"),new R(1.85,.68,0)]]){const r=document.createElement("div");r.className="space-site",r.textContent=e,S.appendChild(r),kn.push({el:r,at:s,group:ot})}const na=new N(i(new Zt(1.35,48)),i(new K({map:Zn}))),oa=new N(i(new et(1.4,1.7,48)),i(new K({color:"#f0c36a",transparent:!0,opacity:.45,side:De,depthWrite:!1})));ae.skyCover=new N(i(new Zt(1.22,48)),i(new K({color:"#141820"}))),ae.skySun.add(na,oa,ae.skyCover),ae.skyMoonMat.map=Jn;const aa=new N(i(new Zt(.92,48)),ae.skyMoonMat),to=new N(i(new Zt(1.08,48)),i(new K({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));to.position.z=.16,ae.skyMoon.add(aa,to),sn.add(ae.skySun,ae.skyMoon);const Yt=document.createElement("div");Yt.className="space-site is-stage",S.appendChild(Yt),kn.push({el:Yt,at:new R(0,-1.2,0),group:ot}),sn.visible=!1,g.add(ke);const pt=new ve;pt.visible=!1,pt.rotation.z=-Math.PI/2;const no=[],oo=4.6,sa=e=>oo*e/696e3,ao=new N(i(new oe(oo,64,40)),i(new K({map:Y("sun.webp")})));ao.position.set(-3.2,0,0),pt.add(ao);const ra=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let so=2.4;const ro=(e,s)=>{const r=document.createElement("div");r.className="space-site",r.textContent=e,S.appendChild(r),no.push({el:r,at:s,group:pt})};ro(A("태양"),new R(-3.2,4.9,0));for(const[e,s]of ra){const r=sa(s),v=so+r;so=v+r+.72;const b=Jt(e),W=e==="earth"?"earth-day.webp":b.texture,L=i(new K({color:b.color}));W&&Be(W,l=>{L.map=l,L.color.set("#ffffff"),L.needsUpdate=!0});const O=new N(i(new oe(r,32,24)),L);if(O.position.set(v,0,0),b.axes&&O.scale.set(1,b.axes[2]/b.axes[0],b.axes[1]/b.axes[0]),pt.add(O),e==="saturn"){const l=r*1.18,y=r*2.08,T=i(new et(l,y,96,1)),_=T.attributes.position,ne=T.attributes.uv,ge=new R;for(let we=0;we<_.count;we+=1)ge.fromBufferAttribute(_,we),ne.setXY(we,(ge.length()-l)/(y-l),.5);const ye=i(new K({color:"#b9b3ab",transparent:!0,opacity:.9,side:De,depthWrite:!1}));Be("saturn-ring.webp",we=>{ye.map=we,ye.color.set("#ffffff"),ye.needsUpdate=!0});const Je=new N(T,ye);Je.rotation.y=Math.PI/2-.36,O.add(Je)}ro(b.name,new R(v,(e==="saturn"?r*2.08:r)+.12,0))}g.add(pt);const Ze=new ve;Ze.visible=!1;const Tn=[],io=[],ia=new N(i(new oe(.55,48,32)),i(new K({color:"#e0703a"})));Ze.add(ia);for(const[e,s]of[[1.35,.16],[2.1,.05]])Ze.add(new N(i(new oe(.55*e,32,24)),i(new K({color:"#ff6a30",transparent:!0,opacity:s,side:Vt,blending:Pe,depthWrite:!1}))));const co=new N(i(new et(2.6,5.1,96,1)),i(new K({color:"#3fbf7f",transparent:!0,opacity:.12,side:De,depthWrite:!1})));co.rotation.x=Math.PI/2,Ze.add(co),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,s,r,v,b],W)=>{const L=new No(i(new vt().setFromPoints(Array.from({length:128},(y,T)=>new R(Math.cos(T/128*Math.PI*2)*r*100,0,Math.sin(T/128*Math.PI*2)*r*100)))),i(new tn({color:"#8b95a1",transparent:!0,opacity:.35})));Ze.add(L);const O=new N(i(new oe(.16*v,24,16)),pe(void 0,b,"earth"));Ze.add(O);const l=document.createElement("button");l.type="button",l.className="space-label is-small",l.textContent=e,l.addEventListener("click",()=>n.onExtra?.(`trappist-${e}`)),S.appendChild(l),Tn.push({mesh:O,a:r*100,period:s,phase0:W*1.7,el:l})});const ca=new No(i(new vt().setFromPoints(Array.from({length:256},(e,s)=>new R(Math.cos(s/256*Math.PI*2)*38.7,0,Math.sin(s/256*Math.PI*2)*38.7)))),i(new tn({color:"#c5b8a2",transparent:!0,opacity:.5})));Ze.add(ca);for(const[e,s]of[["TRAPPIST-1",new R(0,1.1,0)],[A("생명가능지대(대략)"),new R(3.9,0,0)],[A("비교: 우리 수성의 궤도"),new R(0,0,38.7)]]){const r=document.createElement("div");r.className="space-site",r.textContent=e,S.appendChild(r),io.push({el:r,at:s})}g.add(Ze);const Ct=es(i),la=Ct.labels.map(({name:e,at:s})=>{const r=document.createElement("div");return r.className="space-site",r.textContent=e,S.appendChild(r),{el:r,at:s}});g.add(Ct.group);const Le=ns(),Dn=[];if(Le)for(const[e,s]of Object.entries(Le.groups)){g.add(s);for(const r of Le.markers[e]){const v=document.createElement("button");v.type="button",v.className="space-label",v.textContent=r.name,v.addEventListener("click",()=>{n.onMarker?.(r),ie.target.copy(r.position),ie.radius=Nt[e]*(r.id==="cmb"?1.4:e==="group"?.6:.42)}),S.appendChild(v),Dn.push({level:e,marker:r,el:v})}}const lo=[];if(Le){const s=(W,L)=>new R(Math.cos(L*Ue)*Math.cos(W*Ue),Math.sin(L*Ue),-Math.cos(L*Ue)*Math.sin(W*Ue)).multiplyScalar(140),r=[];for(const W of Object.values(Bo))for(const L of W)for(let O=0;O<L.length-1;O+=1){const l=s(L[O][0],L[O][1]),y=s(L[O+1][0],L[O+1][1]);r.push(l.x,l.y,l.z,y.x,y.y,y.z)}const v=i(new vt);v.setAttribute("position",new Ln(r,3));const b=new Jo(v,i(new tn({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));Le.groups.stars.add(b);for(const W of Za){if(!Bo[W.id])continue;const L=document.createElement("button");L.type="button",L.className="space-label is-const",L.textContent=W.name.replace(/\(.*\)/,"").split(" · ")[0],L.addEventListener("click",()=>n.onConstellation?.(W.id)),S.appendChild(L),lo.push({el:L,at:s(W.center[0],W.center[1])})}}const rn=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let Q="system",It=!1,uo=!1;const Nt={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},_t=new R,se={theta:.6,phi:.95,radius:34},ie={target:new R,radius:se.radius};let Me="system",Te=null,Ve=null,at=null;function cn(e){if((e==="system"||e==="sizes")&&$e(),Q=e,It=!1,ue.visible=e==="system",ke.visible=e==="eclipse",pt.visible=e==="sizes",Ze.visible=e==="exo",Ct.group.visible=e==="blackhole",Le)for(const[s,r]of Object.entries(Le.groups))r.visible=s===e;Me="system",Te=null,Ve=null,at=null,ie.target.set(0,0,0),ie.radius=Nt[e],e!=="system"&&(se.phi=1.1),e==="eclipse"&&(ot.rotation.z=f.aspect<1?-Math.PI/2:0,se.theta=0,se.phi=Pt?Math.PI/2:1.25,ie.target.set(0,0,0),Pt||ie.target.set(-.7,0,0).applyEuler(ot.rotation),ie.radius=Pt?6:f.aspect<1?10:7.5),e==="exo"&&(se.phi=.75),e==="blackhole"&&(se.phi=1.42),e==="sizes"&&(se.theta=0,se.phi=Math.PI/2,ie.target.set(.6,-6.8,0),ie.radius=19)}function fo(e){if(e!=="earth"&&$e(),It=!1,Q!=="system"&&(Q="system",ue.visible=!0,ke.visible=!1,pt.visible=!1,Ze.visible=!1,Ct.group.visible=!1,Le))for(const r of Object.values(Le.groups))r.visible=!1;if(Me=e,Ve=null,at=null,e==="system"){Te=null,ie.target.set(0,0,0),ie.radius=Nt.system;return}Te=Ye.get(e)??null;const s=lt.get(e)??Ws(Jt(e).km);ie.radius=e==="sun"?3.2:e==="jupiter"?3.4*fe:e==="saturn"?2.6*fe:Math.max(s*(Jt(e).ring?6:4.2),.25)}function ua(e){const s=Tt.get(e);s&&(Q!=="system"&&cn("system"),Me="system",Te=s,Ve=null,at=null,ie.radius=e==="halley"?1.6:.6,yt=performance.now())}function fa(e){at=(e?tt.find(r=>r.parent===Me&&r.site.name===e.name):void 0)?.mesh??null,Ve=at?new R:null,yt=performance.now()}let ce=null,zt=0,Lt=-.12,An=0,qt=0,ln=0,po=0;function pa(){if(Xe.visible=!0,ue.visible=Q==="system",ke.visible=Q==="eclipse",pt.visible=Q==="sizes",Ze.visible=Q==="exo",Ct.group.visible=Q==="blackhole",Le)for(const[e,s]of Object.entries(Le.groups))s.visible=e===Q}function mo(e,s){ce&&(g.remove(ce.group),ce.dispose(),ce=null);const r=Qa(e);ce=ks(r,{low:o,anisotropy:P,onLand:v=>n.onSurfaceDrop?.({id:e,seconds:v.seconds,bounces:v.bounces,outcome:v.outcome})}),g.add(ce.group),g.fog=new Ha(new j(r.fog),r.fogDensity),zt=(r.companion?r.companionAz:r.sunAz)*Ue,Lt=-.12,qt=0,ln=Math.max(.6,s),po=r.cloudTop!==null?260:150,yt=performance.now()}function vo(e){if(!ce){if(Xe.visible=!1,ue.visible=!1,ke.visible=!1,pt.visible=!1,Ze.visible=!1,Ct.group.visible=!1,Le)for(const s of Object.values(Le.groups))s.visible=!1;S.style.display="none",$=null,de=null,J=!0,f.fov=62,f.near=.08,f.far=6e3,f.updateProjectionMatrix()}mo(e,1.9)}function da(e){if(!ce){vo(e);return}mo(e,1.1)}function ma(){ce&&(g.remove(ce.group),ce.dispose(),ce=null,g.fog=null,S.style.display="",pa(),f.fov=45,f.near=.01,f.far=2e3,f.updateProjectionMatrix(),_t.copy(ie.target),se.radius=ie.radius,yt=performance.now())}function ho(){if(!ce)return;const e=4.2+Math.random()*1.4,s=(Math.random()-.5)*1.8,r=Math.sin(zt)*e+Math.cos(zt)*s,v=-Math.cos(zt)*e+Math.sin(zt)*s;ce.drop(r,v)}function va(e,s){if(!ce)return;if(ce.update(e,s),qt<ln){qt=Math.min(ln,qt+s);const b=qt/ln,W=1-Math.pow(1-b,3);An=po*(1-W),Lt=-.12-.38*(1-W)}else An=0;const r=ce.eyeY+An;f.position.set(ce.standX,r,ce.standZ);const v=Math.cos(Lt);f.lookAt(ce.standX+Math.sin(zt)*v,r+Math.sin(Lt),ce.standZ-Math.cos(zt)*v),p.render(g,f)}const dt=new Map;let Kt=0,Dt=0,yt=0;const go=new Fa,yo=new nn,wo=e=>{if(ce){a.setPointerCapture(e.pointerId),dt.set(e.pointerId,{x:e.clientX,y:e.clientY}),Dt=0;return}if($e(),a.setPointerCapture(e.pointerId),It=!1,dt.set(e.pointerId,{x:e.clientX,y:e.clientY}),Dt=0,yt=performance.now(),dt.size===2){const[s,r]=[...dt.values()];Kt=Math.hypot(s.x-r.x,s.y-r.y)}},Mo=e=>{const s=dt.get(e.pointerId);if(!s)return;const r=e.clientX-s.x,v=e.clientY-s.y;if(dt.set(e.pointerId,{x:e.clientX,y:e.clientY}),ce){Dt+=Math.abs(r)+Math.abs(v),zt-=r*.004,Lt=Math.min(1.15,Math.max(-1.05,Lt-v*.0035));return}if(yt=performance.now(),dt.size===1)Dt+=Math.abs(r)+Math.abs(v),se.theta-=r*.006,se.phi=Math.min(2.9,Math.max(.2,se.phi-v*.006)),Ve=null,at=null;else if(dt.size===2){const[b,W]=[...dt.values()],L=Math.hypot(b.x-W.x,b.y-W.y);Kt>0&&(ie.radius=bo(ie.radius*(Kt/L))),Kt=L,Dt+=10}},un=e=>{if(dt.delete(e.pointerId),Kt=0,ce){Dt<8&&ho();return}if(Dt<6&&n.onPick){const s=a.getBoundingClientRect();yo.set((e.clientX-s.left)/s.width*2-1,-((e.clientY-s.top)/s.height)*2+1),go.setFromCamera(yo,f);const v=go.intersectObjects([...He.values(),...Rt.values()],!1)[0]?.object.name;v&&He.has(v)?n.onPick(v):v&&Rt.has(v)&&n.onExtra?.(v)}},xo=e=>{ce||(e.preventDefault(),ie.radius=bo(ie.radius*(e.deltaY>0?1.12:.89)))};function bo(e){return Q!=="system"?Math.min(Nt[Q]*2.2,Math.max(Nt[Q]*.15,e)):Math.min(90,Math.max(Me==="system"&&!Te?4:.15,e))}a.addEventListener("pointerdown",wo),a.addEventListener("pointermove",Mo),a.addEventListener("pointerup",un),a.addEventListener("pointercancel",un),a.addEventListener("wheel",xo,{passive:!1});let wt=null,fn=null,En=!matchMedia("(prefers-reduced-motion: reduce)").matches,So=0,Po=0;En&&(wt=new Ua(p),wt.addPass(new Ba(g,f)),fn=new Ga(new nn(256,256),.75,.78,.92),wt.addPass(fn),wt.addPass(new Oa));const ee={w:1,h:1},Co=()=>{ee.w=t.clientWidth||1,ee.h=t.clientHeight||1,p.setSize(ee.w,ee.h,!1),wt?.setSize(ee.w,ee.h),fn?.resolution.set(ee.w/2,ee.h/2),f.aspect=ee.w/ee.h,f.updateProjectionMatrix()};Co();const zo=new ResizeObserver(Co);zo.observe(t);let ko=!0;const To=new IntersectionObserver(e=>{ko=e.some(s=>s.isIntersecting)});To.observe(t);const E=new R,At=new R,Ft=new R,Rn=new R,ha=new R,ga=new R,ya=new R,wa=new R,Do=new R,Ma=new R;let Wn=0,Ao=performance.now(),In=-1e9,Eo=0;const Ro=e=>{Wn=requestAnimationFrame(Ro);const s=Math.min(.1,(e-Ao)/1e3);if(Ao=e,document.hidden||!ko)return;if(ce){va(e/1e3,s);return}if(rn||(qe.uniforms.time.value=e/1e3),!rn){for(const l of F)l.uniforms.time.value=e/1e3;for(const l of x)l.uniforms.uTime.value=e/1e3}e-yt>3e3&&!rn&&!Ve&&!uo&&!It&&Q!=="eclipse"&&Q!=="sizes"&&(se.theta+=s*(Me==="system"?.03:.08)),bt?.rotateY(s*.01);for(const[l,y]of He){if(l==="earth"||l==="moon"||at&&l===Me)continue;const T=Jt(l).spinHours;rn||y.rotateY(s*(l==="sun"?.02:T?.12*(24/T)*.25:.12))}Et&&(Et.visible=f.position.length()>4);for(const l of ft)l.material.uniforms.uDays.value=(G-Ts)/864e5,l.material.uniforms.uTime.value=e/1e3;for(const l of w){const y=He.get(l.parent);y&&l.mesh.material.uniforms.planetCenter.value.copy(y.getWorldPosition(E))}for(const l of c)l.mesh.getWorldPosition(E),l.material.uniforms.ringCenter.value.copy(E),l.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(l.mesh.matrixWorld).normalize();if(J&&e-Eo>1e3&&(Eo=e,G=Date.now(),Ke(G)),$){const l=Ee.get($.id),y=l.points.length,T=l.times[y-1],_=(l.frame==="earth"?6:25)*864e5,ge=l.marks.some(Se=>Se.at!==void 0&&Se.body&&Se.body!=="earth"&&Math.abs($.sim-Se.at)<_)?"slow":$.sim>=$.fastFrom?"fast":"normal",ye=ge==="slow"?Math.min($.base,2*_/3):$.base*(ge==="fast"?$.fast:1);$.sim=Math.min(T,$.sim+ye*Math.min(s,.1)),l.frame==="sun"?de=(de??$.sim)+Math.min(s,.1)*.15*864e5:de=null,$.pace=ge;const Je=($.sim-l.times[0])/(T-l.times[0]||1);let we=0,mt=y-1;for(;mt-we>1;){const Se=we+mt>>1;l.times[Se]<=$.sim?we=Se:mt=Se}const Fe=l.times[mt]-l.times[we],ze=we+(Fe>0?($.sim-l.times[we])/Fe:0),Ie=Math.max(0,Math.min(y-2,Math.floor(ze))),Wo=ze-Ie;l.probe.position.lerpVectors(l.points[Ie],l.points[Ie+1],Wo),an=ze,l.probe.lookAt(l.line.localToWorld(l.points[Math.min(y-1,Ie+2)].clone())),l.line.geometry.setDrawRange(0,Ie+2);const Nn=l.times[Ie]+(l.times[Ie+1]-l.times[Ie])*Wo;J=!1,G=Nn,Ke(Nn);let pn=0;for(let Se=0;Se<l.marks.length;Se+=1){const Io=l.marks[Se],xa=Io.at??l.times[Math.min(y-1,Io.index)];$.sim>=xa-_&&(pn=Se)}if((pn!==$.mark||e-$.lastPing>250||$.sim>=T&&!$.done)&&($.mark=pn,$.lastPing=e,$.sim>=T&&($.done=!0),n.onFlight?.({id:$.id,mark:l.marks[pn],progress:Je,time:Nn,done:$.done,pace:$.pace})),$.done){const Se=l.frame==="earth";$=null,de=null,J=!0,Te=Se?Ye.get("earth")??null:null,Se||ie.target.set(0,0,0),ie.radius=Se?4.2:72,se.phi=Se?.7:.45}}if(Te&&ie.target.copy(Te.getWorldPosition(E)),$){const l=Ee.get($.id);let y=null,T=1/0;for(const ne of l.marks){if(!ne.body||ne.body==="earth"||ne.body==="far")continue;const ge=Math.abs(ne.index-an);ge<14&&ge<T&&(y=ne,T=ge)}const _=y?Ye.get(y.body):void 0;if(_){const ne=_.getWorldPosition(ya).add(l.probe.getWorldPosition(wa)).multiplyScalar(.5);ie.target.copy(ne),ie.radius=l.frame==="earth"?1.6:4.2}else ie.radius=l.frame==="earth"?1.5:2.8}if(_t.lerp(ie.target,1-Math.pow(.002,s)),se.radius+=(ie.radius-se.radius)*(1-Math.pow(.004,s)),Ve&&at){const l=He.get(Me)?.getWorldPosition(Do)??Do.set(0,0,0);Ve.copy(at.getWorldPosition(Ma).sub(l).normalize());const y=Math.atan2(Ve.x,Ve.z),T=Math.acos(Math.max(-1,Math.min(1,Ve.y)));let _=y-se.theta;_=Math.atan2(Math.sin(_),Math.cos(_)),se.theta+=_*(1-Math.pow(.01,s)),se.phi+=(T-se.phi)*(1-Math.pow(.01,s))}if(Q==="blackhole"&&Ct.update(e/1e3,f),Q==="exo"){const l=e/1e3;for(const y of Tn){const T=y.phase0+l/y.period*Math.PI*2;y.mesh.position.set(Math.cos(T)*y.a,0,Math.sin(T)*y.a)}}if(Q==="eclipse"){zn=(zn+s*.18)%1;const l=Math.sin(zn*Math.PI*2),y=Math.abs(l)<.22,T=Math.max(0,1-Math.abs(l)/.9),_=Kn==="lunar";if(ot.visible=!Pt,sn.visible=Pt,ae.skySun.visible=!_,ae.skyMoon.visible=_,Pt)_?(ae.skyMoon.position.set(l*1.7,0,.08),ae.skyMoonMat.color.set("#f2f2f2").lerp(new j("#c47462"),_?T:0)):ae.skyCover.position.set(l*1.7,0,.08);else{ae.moon.position.set(_?2.75:1.05,l*.55,0),ae.cone.visible=!_,ae.umbra.visible=_,ae.shadow.opacity=y?.42:.08,ae.umbra.material.opacity=y?.42:.08,ae.moonMat.color.set("#ffffff").lerp(new j("#c47462"),_?T:0);const ne=y?A("개기"):Math.abs(l)<.6?A("부분"):_?A("반영"):"";Yt.textContent!==ne&&(Yt.textContent=ne)}}if(f.position.set(_t.x+se.radius*Math.sin(se.phi)*Math.sin(se.theta),_t.y+se.radius*Math.cos(se.phi),_t.z+se.radius*Math.sin(se.phi)*Math.cos(se.theta)),f.lookAt(_t),_e&&(_e.getWorldPosition(E),xe.copy(E).multiplyScalar(-1).normalize(),e-In>500&&!($&&Ee.get($.id)?.frame==="sun"))){In=e;const l=Ja(new Date(G)),y=Math.atan2(l.y,l.x),T=Math.atan2(-xe.z,xe.x),_=_e.children[0];_.rotation.y=T-y}wt&&En&&Q!=="blackhole"&&(Q!=="system"||Me==="system"||Me==="sun")&&wt?(wt.render(s),So+=1,Po+=s,So===90&&Po/90>.034&&(En=!1)):p.render(g,f),f.getWorldDirection(At),M();const b=[];for(const l of Ce){const y=Ht.get(l),T=Ye.get(l);if(!y||!T)continue;T.getWorldPosition(E);const _=Ft.copy(E).sub(f.position).dot(At)>0,ne=Me==="system"&&Q==="system"&&(!Te||$!==null),ge=Me==="earth"||Me==="moon"||$!==null&&Ee.get($.id)?.frame==="earth";let ye=_&&(l==="moon"?Q==="system"&&ge:ne||ge&&l==="earth"&&$!==null);E.project(f);const Je=(E.x+1)/2*ee.w;let we=Je;const mt=(1-E.y)/2*ee.h+10;if(ye){let Fe=Re.get(l)??0;Fe||(y.style.display="block",Fe=y.offsetWidth||40,Re.set(l,Fe)),we=Math.min(Math.max(Je,Fe/2+4),Math.max(Fe/2+4,ee.w-Fe/2-4));const ze={x:we-Fe/2,y:mt,w:Fe,h:22};C(ze.x,ze.y,ze.w,ze.h)||b.some(Ie=>ze.x<Ie.x+Ie.w+4&&ze.x+ze.w+4>Ie.x&&ze.y<Ie.y+Ie.h&&ze.y+ze.h>Ie.y)?ye=!1:b.push(ze)}y.style.display=ye?"block":"none",ye&&(y.style.transform=`translate(${we}px, ${mt}px) translate(-50%, 0)`)}const W=Q==="system",L=Me!=="system"&&Me!=="jupiter"&&Me!=="saturn",O=Te!==null&&($===null?Te===Ye.get("earth"):Ee.get($.id)?.frame==="earth");for(const l of d)l.visible=!L&&!O;for(const[l,y]of Wt){const T=Tt.get(l),_=y.parent?Ye.get(y.parent)===Te:Me==="system"&&(!Te||Te===T),ne=Te===T||_;T.getWorldPosition(E);const ge=Ft.copy(E).sub(f.position).dot(At)>0,ye=W&&ge&&ne;E.project(f),y.el.style.display=ye?"block":"none",ye&&(y.el.style.transform=`translate(${(E.x+1)/2*ee.w}px, ${(1-E.y)/2*ee.h+8}px) translate(-50%, 0)`)}for(const[l,y]of Ee){const T=W&&X===l;if(y.line.visible=T,!T){y.el.style.display="none";continue}y.probe.getWorldPosition(E);const _=Ft.copy(E).sub(f.position).dot(At)>0;E.y+=0,E.project(f),y.el.style.display=_?"block":"none",_&&(y.el.style.transform=`translate(${(E.x+1)/2*ee.w}px, ${(1-E.y)/2*ee.h}px) translate(10px, -50%)`)}for(const l of lo){if(Q!=="stars"){l.el.style.display="none";continue}E.copy(l.at);const y=Ft.copy(E).sub(f.position).dot(At)>0;E.project(f);const T=y&&Math.abs(E.x)<1&&Math.abs(E.y)<1;l.el.style.display=T?"block":"none",T&&(l.el.style.transform=`translate(${(E.x+1)/2*ee.w}px, ${(1-E.y)/2*ee.h}px) translate(-50%, -50%)`)}for(const l of Dn){if(!(l.level===Q)){l.el.style.display="none";continue}E.copy(l.marker.position);const T=Ft.copy(E).sub(f.position).dot(At)>0;E.project(f),l.el.style.display=T?"block":"none",T&&(l.el.style.transform=`translate(${(E.x+1)/2*ee.w}px, ${(1-E.y)/2*ee.h+8}px) translate(-50%, 0)`)}for(const l of Tn){if(Q!=="exo"){l.el.style.display="none";continue}l.mesh.getWorldPosition(E);const y=Ft.copy(E).sub(f.position).dot(At)>0;E.project(f),l.el.style.display=y?"block":"none",y&&(l.el.style.transform=`translate(${(E.x+1)/2*ee.w}px, ${(1-E.y)/2*ee.h+8}px) translate(-50%, 0)`)}for(const l of la){if(Q!=="blackhole"){l.el.style.display="none";continue}E.copy(l.at),Ct.group.localToWorld(E),E.project(f);const y=E.z<1&&Math.abs(E.x)<1.05&&Math.abs(E.y)<1.05;l.el.style.display=y?"block":"none",y&&(l.el.style.transform=`translate(${(E.x+1)/2*ee.w}px, ${(1-E.y)/2*ee.h}px) translate(-50%, -100%)`)}for(const l of io){if(Q!=="exo"){l.el.style.display="none";continue}E.copy(l.at).project(f);const y=E.z<1&&Math.abs(E.x)<1.05&&Math.abs(E.y)<1.05;l.el.style.display=y?"block":"none",y&&(l.el.style.transform=`translate(${(E.x+1)/2*ee.w}px, ${(1-E.y)/2*ee.h}px) translate(-50%, -100%)`)}for(const[l,y]of[[kn,Q==="eclipse"&&!Pt],[no,Q==="sizes"]])for(const T of l){if(!y){T.el.style.display="none";continue}E.copy(T.at).applyMatrix4(T.group.matrixWorld).project(f);let _=E.z<1&&Math.abs(E.x)<1.1&&Math.abs(E.y)<1.1;const ne=(E.x+1)/2*ee.w,ge=(1-E.y)/2*ee.h,ye=T.el.offsetWidth||44;_&&C(ne-ye/2,ge-11,ye,22)&&(_=!1),T.el.style.display=_?"block":"none";const Je=T.group.rotation.z!==0;_&&(T.el.style.transform=`translate(${(E.x+1)/2*ee.w}px, ${(1-E.y)/2*ee.h}px) ${Je?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const l of tt){l.mesh.getWorldPosition(E);const y=He.get(l.parent);y?y.getWorldPosition(Rn):Rn.set(0,0,0);let _=ha.copy(E).sub(Rn).normalize().dot(ga.copy(f.position).sub(E).normalize())>.15&&Q==="system"&&Me===l.parent;E.project(f),_&&C((E.x+1)/2*ee.w+8,(1-E.y)/2*ee.h-11,90)&&(_=!1),l.el.style.display=_?"block":"none",_&&(l.el.style.transform=`translate(${(E.x+1)/2*ee.w}px, ${(1-E.y)/2*ee.h}px) translate(8px, -50%)`)}};return Wn=requestAnimationFrame(Ro),re===0&&n.onReady?.(),{focus:fo,setLevel:cn,setPaused:e=>{uo=e},focusMarker:e=>{const s=Dn.find(r=>r.level===Q&&r.marker.id===e);s&&(ie.target.copy(s.marker.position),ie.radius=Nt[Q]*(e==="cmb"?1.4:Q==="group"?.6:.42),yt=performance.now())},showSite:fa,focusExtra:ua,setEclipse:(e,s)=>{Kn=e,Pt=s,cn("eclipse")},setHemisphere:e=>{Me!=="earth"&&fo("earth");const s=xe.clone().multiplyScalar(e==="day"?1:-1);se.theta=Math.atan2(s.x,s.z),se.phi=Math.min(2.6,Math.max(.5,Math.acos(s.y))),Ve=null,at=null,It=!0},enterSurface:vo,setSurfaceWorld:da,exitSurface:ma,dropProbe:ho,setTime:e=>{J=e===null,G=e??Date.now(),Ke(G),In=-1e9},setVoyage:e=>{if(X=e,!e){$&&($=null,J=!0),de=null;for(const y of Ee.values())y.line.geometry.setDrawRange(0,1/0);return}Q!=="system"&&cn("system"),de=null;const s=Ee.get(e);s.line.geometry.setDrawRange(0,2),Me="system",Ve=null,at=null,It=!1,Te=s.probe;const r=s.frame==="earth";ie.radius=r?1.3:2.8,se.phi=r?.75:1;const v=Math.max(...s.marks.filter(y=>y.at!==void 0&&y.body!=="earth").map(y=>y.at),s.times[0]+864e5),b=s.times[0],W=s.times[s.times.length-1],L=(v-b)/(r?20:24),O=s.frame==="earth"?W:v+60*864e5,l=W>O?(W-O)/4/L:1;$={id:e,sim:b,base:L,fastFrom:O,fast:l,mark:-1,done:!1,lastPing:0,pace:"normal"},yt=performance.now()},dispose:()=>{Le?.dispose(),wt?.dispose(),fn?.dispose(),ce&&(g.remove(ce.group),ce.dispose(),ce=null),cancelAnimationFrame(Wn),zo.disconnect(),To.disconnect(),a.removeEventListener("pointerdown",wo),a.removeEventListener("pointermove",Mo),a.removeEventListener("pointerup",un),a.removeEventListener("pointercancel",un),a.removeEventListener("wheel",xo),g.traverse(e=>{const s=e.material;Array.isArray(s)&&s.forEach(r=>r.dispose())}),z.forEach(e=>e.dispose()),p.dispose(),a.remove(),S.remove()}}}export{er as createSpace};
