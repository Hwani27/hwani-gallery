import{t as b,a as ta}from"./index-QeMqHtIM.js";import{G as ie,M as A,S as q,a as F,b as ge,A as Me,D as Te,V as P,R as Fe,P as Ot,B as kt,C as Et,c as sn,d as rn,e as _,f as Ze,g as At,h as zn,i as Pn,I as an,L as Eo,j as jt,k as Ro,l as na,O as vo,m as vt,n as ln,W as oa,o as aa,p as sa,q as ia,T as ra,r as la,s as ca,t as ua,u as Qt,F as yn,v as fa,w as da,x as Mn,y as _t,z as go,E as pa,H as ma,J as ha,U as va,K as ga,N as wa,Q as ya,X as Ma,Y as xa,Z as wo,_ as yo,$ as ba,a0 as Sa}from"./three-CMFzjOLS.js";import{af as Mo,ag as za,ah as xn,ai as xo,aj as Pa,ak as Ca,al as Lt,C as ka,am as Aa,an as en,ao as Ta}from"./App-B0nm_BYh.js";import{C as bo}from"./sky-DPUOXK7i.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";import"./audio-55-NVKmx.js";const So=`
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
`,tn=3,bn=9;function Ea(a){const y=new ie;y.visible=!1,y.rotation.z=.1;const g=new A(a(new q(1,48,32)),a(new F({color:"#000000"})));g.renderOrder=0,y.add(g);const f=a(new ge({uniforms:{uTime:{value:0},uCam:{value:new P}},transparent:!0,depthWrite:!1,side:Te,blending:Me,vertexShader:`
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
        ${So}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${tn.toFixed(1)}) / ${(bn-tn).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${tn.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),W=new A(a(new Fe(tn,bn,256,8)),f);W.rotation.x=-Math.PI/2,W.renderOrder=1,y.add(W);const s=a(new ge({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:Me,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${So}
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
      `})),d=new A(a(new Ot(8,8)),s);d.renderOrder=2,y.add(d);const L=[{name:b("궁수자리 A*"),at:new P(0,3.6,0)},{name:b("사건의 지평선"),at:new P(0,-2.9,0)},{name:b("강착 원반"),at:new P(bn-1.2,0,0)}],E=new P;return{group:y,labels:L,update(M,C){f.uniforms.uTime.value=M,s.uniforms.uTime.value=M,C.getWorldPosition(E),f.uniforms.uCam.value.copy(E),d.lookAt(E)}}}const Bt=Math.PI/180;function Ve(a,y,g){return new P(Math.cos(y*Bt)*Math.cos(a*Bt),Math.sin(y*Bt),-Math.cos(y*Bt)*Math.sin(a*Bt)).multiplyScalar(g)}function Ra(){const y=document.createElement("canvas");y.width=64,y.height=64;const g=y.getContext("2d");if(g){const f=g.createRadialGradient(32,32,0,32,32,32);f.addColorStop(0,"rgba(255,255,255,1)"),f.addColorStop(.25,"rgba(255,255,255,0.75)"),f.addColorStop(1,"rgba(255,255,255,0)"),g.fillStyle=f,g.fillRect(0,0,64,64)}return new Et(y)}function Wa(){const a=[],y=M=>(a.push(M),M),g=y(Ra());function f(M,C,S){const w=new sn(y(new rn({map:g,color:new _(M),transparent:!0,depthWrite:!1,blending:Me})));return w.scale.setScalar(C),w.position.copy(S),w}function W(M,C,S){const w=new Float32Array(M*3),j=new Float32Array(M*3);for(let G=0;G<M;G+=1){const[ee,ne]=C(G);w.set([ee.x,ee.y,ee.z],G*3),j.set([ne.r,ne.g,ne.b],G*3)}const u=y(new Ze);return u.setAttribute("position",new At(w,3)),u.setAttribute("color",new At(j,3)),new zn(u,y(new Pn({size:S,map:g,vertexColors:!0,transparent:!0,depthWrite:!1,blending:Me,sizeAttenuation:!0})))}let s=7;const d=()=>(s=s*16807%2147483647,(s-1)/2147483646),L={},E={};{const M=new ie,C=2.6,S=[["alphacen",b("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",b("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",b("바너드별"),269.45,4.69,5.96,"#ffb27a",b("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",b("울프 359"),164.12,7.01,7.86,"#ff9a6a",b("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",b("시리우스"),101.29,-16.72,8.6,"#cfe0ff",b("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",b("로스 154"),282.46,-23.84,9.69,"#ffa070",b("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",b("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",b("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",b("백조자리 61"),316.7,38.75,11.4,"#ffc58a",b("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",b("프로키온"),114.83,5.22,11.46,"#fff3d6",b("작은개자리의 밝은 별이에요.")],["epsind",b("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",b("남쪽 하늘의 가까운 별이에요.")],["taucet",b("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",b("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];M.add(f("#ffe39a",3.2,new P));const w=[{id:"sun-star",name:b("태양"),line:b("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new P}];for(const[j,u,G,ee,ne,oe,me]of S){const Ee=Ve(G,ee,ne*C);M.add(f(oe,2.4,Ee)),w.push({id:j,name:u,line:ta("{0} 거리 약 {1}광년.",me,ne),position:Ee})}M.add(W(500,()=>[new P(d()-.5,d()-.5,d()-.5).normalize().multiplyScalar(60+d()*30),new _().setHSL(.1,.3,.5+d()*.4)],.9)),L.stars=M,E.stars=w}{const M=new ie,C=1/40,S=[["pleiades",b("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,b("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",b("베텔게우스"),88.79,7.41,548,"#ffab6e",3,b("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",b("리겔"),78.63,-8.2,860,"#cfe0ff",3,b("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",b("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,b("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",b("데네브"),310.36,45.28,2600,"#e6eeff",3,b("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];M.add(f("#ffe39a",1.6,new P));const w=[{id:"sun-orion",name:b("태양"),line:b("우리은하의 오리온 팔 안쪽에 있어요."),position:new P}];for(const[j,u,G,ee,ne,oe,me,Ee]of S){const Ce=Ve(G,ee,ne*C);M.add(f(oe,me,Ce)),j==="orionneb"&&M.add(W(260,()=>{const Ge=Math.pow(d(),.6)*5;return[new P(d()-.5,d()-.5,d()-.5).normalize().multiplyScalar(Ge).add(Ce),new _(d()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),w.push({id:j,name:u,line:Ee,position:Ce})}M.add(W(1400,()=>{const j=(d()-.5)*120,u=(d()-.5)*22*(.4+d()),G=(d()-.5)*4;return[new P(j,G,u),new _().setHSL(.6+d()*.1,.3,.35+d()*.3)]},.8)),L.orion=M,E.orion=w}{const M=new ie,C=4;M.add(W(9e3,w=>{const j=w%C,u=Math.pow(d(),.55)*25,G=j/C*Math.PI*2+Math.log(1+u)*1.9+(d()-.5)*(.5+4/(u+2)),ee=(d()-.5)*(u<4?2.2:.7),ne=u<4,oe=ne?new _("#ffd9a0"):new _().setHSL(.58+d()*.06,.45,.45+d()*.35);return[new P(Math.cos(G)*u,ee,Math.sin(G)*u),oe.multiplyScalar(ne?.8:.6)]},.55)),M.add(f("#fff0c8",7,new P));const S=new P(13,0,0);M.add(f("#ffe39a",1.2,S)),L.galaxy=M,E.galaxy=[{id:"center",name:b("은하 중심(궁수자리 A*)"),line:b("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new P},{id:"sun-gal",name:b("태양은 여기"),line:b("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:S}]}{const M=new ie,C=1/1e5,S=(ne,oe,me,Ee,Ce)=>W(Ee,Ge=>{const Se=Math.pow(d(),.6)*oe,$e=Ge%2*Math.PI+Math.log(1+Se*3)*2.2+(d()-.5)*.9,we=new P(Math.cos($e)*Se,(d()-.5)*oe*.05,Math.sin($e)*Se);we.applyAxisAngle(new P(1,0,0),me);const ct=Se<oe*.18;return[we.add(ne),new _().setHSL(ct?.1:Ce,.4,.45+d()*.3).multiplyScalar(ct?.35:.22)]},.4),w=new P;M.add(S(w,2.2,0,1800,.6));const j=Ve(10.68,41.27,25e5*C);M.add(S(j,4.4,1.2,3200,.1));const u=Ve(23.46,30.66,273e4*C);M.add(S(u,1.6,.6,900,.62));const G=Ve(80.89,-69.76,16e4*C);M.add(f("#cfd8ff",1.2,G));const ee=Ve(13.19,-72.83,2e5*C);M.add(f("#cfd8ff",.8,ee)),L.group=M,E.group=[{id:"mw",name:b("우리 은하"),line:b("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:w},{id:"andromeda",name:b("안드로메다은하"),line:b("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:j},{id:"triangulum",name:b("삼각형자리은하"),line:b("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:u},{id:"lmc",name:b("대마젤란은하"),line:b("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:G}]}{const M=new ie,C=6,S=(ne,oe,me)=>new P(ne,oe,me).multiplyScalar(C),w=S(5.1,.35,1.1),j=S(3.4,.45,.2),u=S(-1.4,-.3,-.5),G=[[S(.2,0,0),900,6.4*C*.5],[j,280,1.5*C*.5],[u,220,1.7*C*.5],[S(-2.2,1.6,2.4),120,1.1*C*.5]],ee=G.reduce((ne,oe)=>ne+oe[1],0);M.add(W(ee+180,ne=>{let oe=ne;for(const[Ee,Ce,Ge]of G){if(oe<Ce)return[new P(d()-.5,(d()-.5)*.5,d()-.5).multiplyScalar(2*Ge*Math.pow(d(),.5)).add(Ee),new _("#f3eee6").multiplyScalar(.75)];oe-=Ce}const me=d();return[w.clone().lerp(u,me).add(new P((d()-.5)*.7*C,(d()-.5)*.45*C,(d()-.5)*.7*C)),new _("#e7c48a").multiplyScalar(.8)]},.5)),M.add(new A(y(new q(.95*C,20,16)),y(new F({color:"#d5e2f5",transparent:!0,opacity:.1,blending:Me,depthWrite:!1}))).translateX(j.x).translateY(j.y).translateZ(j.z)),M.add(new A(y(new q(1.05*C,20,16)),y(new F({color:"#e7c48a",transparent:!0,opacity:.09,blending:Me,depthWrite:!1}))).translateX(u.x).translateY(u.y).translateZ(u.z)),M.add(f("#e4b56a",1.2,w)),L.super=M,E.super=[{id:"localgroup",name:b("우리 은하군"),line:b("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:w},{id:"virgo-sc",name:b("처녀자리 은하단"),line:b("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:j},{id:"attractor-sc",name:b("거대 인력체"),line:b("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:u}]}{const M=new ie,C=1/1e7,S=Ve(187.7,12.4,54e6*C),w=Ve(243,-60,2e8*C);M.add(W(5e3,u=>{const G=u%5,ne=[S,w,Ve(30,20,15e7*C),Ve(160,-30,18e7*C),Ve(300,40,14e7*C)][G],oe=G===1?7:4;return[new P((d()-.5)*2,(d()-.5)*2,(d()-.5)*2).multiplyScalar(oe*Math.pow(d(),.4)).add(ne),new _().setHSL(.08+d()*.5,.35,.55).multiplyScalar(.8)]},.8)),M.add(f("#ffffff",.8,new P));const j=new A(y(new q(42,48,32)),y(new F({color:"#ff8a4a",transparent:!0,opacity:.08,side:kt,depthWrite:!1})));M.add(j),L.cosmos=M,E.cosmos=[{id:"here",name:b("우리 은하"),line:b("여기서는 점 하나예요."),position:new P},{id:"virgo",name:b("처녀자리 은하단"),line:b("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:S},{id:"attractor",name:b("거대 인력체"),line:b("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:w},{id:"cmb",name:b("가장 오래된 빛"),line:b("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new P(0,0,-42)}]}for(const M of Object.values(L))M.visible=!1;return{groups:L,markers:E,dispose:()=>a.forEach(M=>M.dispose())}}const Tt=Math.PI/180,Ct=1500,nn=2800;function Vt(a,y){const g=Math.sin(a*127.1+y*311.7)*43758.5453;return g-Math.floor(g)}function Cn(a){return a*a*(3-2*a)}function Wo(a,y){const g=Math.floor(a),f=Math.floor(y),W=a-g,s=y-f,d=Vt(g,f),L=Vt(g+1,f),E=Vt(g,f+1),M=Vt(g+1,f+1),C=Cn(W),S=Cn(s);return(d*(1-C)+L*C)*(1-S)+(E*(1-C)+M*C)*S}function Ut(a,y,g=4){let f=0,W=.5,s=1;for(let d=0;d<g;d+=1)f+=W*Wo(a*s,y*s),s*=2.03,W*=.5;return f}function tt(a){let y=a>>>0||1;return()=>(y=y*1664525+1013904223>>>0,y/4294967296)}function kn(a){let y=2166136261;for(let g=0;g<a.length;g+=1)y=Math.imul(y^a.charCodeAt(g),16777619);return y>>>0}function Sn(a,y){const g=a*Tt,f=y*Tt;return new P(Math.sin(g)*Math.cos(f),Math.sin(f),-Math.cos(g)*Math.cos(f)).normalize()}function Ia(){const y=document.createElement("canvas");y.width=128,y.height=128;const g=y.getContext("2d"),f=g.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);f.addColorStop(0,"rgba(255,255,255,1)"),f.addColorStop(.25,"rgba(255,236,196,0.72)"),f.addColorStop(.6,"rgba(255,190,110,0.18)"),f.addColorStop(1,"rgba(255,170,80,0)"),g.fillStyle=f,g.fillRect(0,0,128,128);const W=new Et(y);return W.colorSpace=vt,W}function zo(a,y){const W=document.createElement("canvas");W.width=256,W.height=128;const s=W.getContext("2d"),d=tt(kn(a??y.id));if(a==="earth"){s.fillStyle="#1d4f8a",s.fillRect(0,0,256,128);for(let E=0;E<26;E+=1){const M=d()*256,C=14+d()*100,S=10+d()*26;s.fillStyle=["#3f7f4a","#5c8f4f","#8a7a4a","#2f6a45"][E%4],s.beginPath(),s.ellipse(M,C,S,S*(.5+d()*.5),d()*3,0,Math.PI*2),s.fill()}s.fillStyle="rgba(255,255,255,0.72)";for(let E=0;E<34;E+=1){const M=d()*256,C=d()*128;s.beginPath(),s.ellipse(M,C,12+d()*22,3+d()*5,d()*3,0,Math.PI*2),s.fill()}s.fillStyle="rgba(240,248,255,0.9)",s.fillRect(0,0,256,5),s.fillRect(0,123,256,5)}else if(a==="jupiter"){s.fillStyle="#d2a679",s.fillRect(0,0,256,128);const E=["#e8d3b0","#b07a4e","#f0e2c8","#8a5a3a","#d9b48a","#c98f5e"];for(let M=0;M<16;M+=1){const C=M/16*128;s.fillStyle=E[M%E.length],s.globalAlpha=.65,s.beginPath();for(let S=0;S<=256;S+=8)s.lineTo(S,C+Math.sin(S/256*6.2+M)*2.4);for(let S=256;S>=0;S-=8)s.lineTo(S,C+128/16+Math.sin(S/256*6.2+M)*2.4);s.closePath(),s.fill()}s.globalAlpha=.9,s.fillStyle="#b5563a",s.beginPath(),s.ellipse(256*.62,128*.62,22,9,0,0,Math.PI*2),s.fill(),s.globalAlpha=1}else if(a==="saturn"){s.fillStyle="#d8c194",s.fillRect(0,0,256,128);const E=["#f6e9c8","#b89a6a","#e8d4a6","#96794f","#efdfb8","#c8ab7c"];for(let M=0;M<22;M+=1){s.fillStyle=E[M%E.length],s.globalAlpha=.55+M%3*.12,s.beginPath();for(let C=0;C<=256;C+=8)s.lineTo(C,M/22*128+Math.sin(C/256*5.1+M)*1.6);for(let C=256;C>=0;C-=8)s.lineTo(C,M/22*128+128/22+Math.sin(C/256*5.1+M)*1.6);s.closePath(),s.fill()}s.globalAlpha=.5,s.fillStyle="#8a7350",s.fillRect(0,0,256,8),s.fillRect(0,120,256,8),s.globalAlpha=1}else if(a==="pluto"){s.fillStyle="#d9c7b8",s.fillRect(0,0,256,128);for(let E=0;E<90;E+=1)s.fillStyle=["#b8a190","#efe3d6","#9a8574","#f6efe4"][E%4],s.globalAlpha=.5,s.beginPath(),s.arc(d()*256,d()*128,2+d()*9,0,Math.PI*2),s.fill();s.globalAlpha=1}else if(a==="charon"){s.fillStyle="#a9a6a2",s.fillRect(0,0,256,128);for(let E=0;E<80;E+=1)s.fillStyle=["#c9c6c0","#8a8681","#b9b5ae"][E%3],s.globalAlpha=.5,s.beginPath(),s.arc(d()*256,d()*128,2+d()*8,0,Math.PI*2),s.fill();s.globalAlpha=.7,s.fillStyle="#6e6b67",s.fillRect(0,0,256,12),s.globalAlpha=1}else{s.fillStyle="#c2beb8",s.fillRect(0,0,256,128);for(let E=0;E<70;E+=1)s.fillStyle=["#a8a49e","#d8d4ce","#8b8781"][E%3],s.globalAlpha=.55,s.beginPath(),s.arc(d()*256,d()*128,2+d()*10,0,Math.PI*2),s.fill();s.globalAlpha=1}const L=new Et(W);return L.colorSpace=vt,L}function Na(a){const g=document.createElement("canvas");g.width=512,g.height=512;const f=g.getContext("2d"),W=tt(kn(a.id)),s=[a.ground,a.ground2,a.ground3];f.fillStyle=a.ground2,f.fillRect(0,0,512,512);for(let L=0;L<90;L+=1){const E=W()*512,M=6+W()*42,C=2+W()*9,S=1+Math.floor(W()*3),w=W()*Math.PI*2;f.beginPath();for(let j=0;j<=512;j+=8)f.lineTo(j,E+Math.sin(j/512*Math.PI*2*S+w)*C);for(let j=512;j>=0;j-=8)f.lineTo(j,E+M+Math.sin(j/512*Math.PI*2*S+w)*C);f.closePath(),f.fillStyle=s[L%s.length],f.globalAlpha=.18+W()*.4,f.fill()}for(let L=0;L<40;L+=1)f.fillStyle="#ffffff",f.globalAlpha=.04+W()*.05,f.beginPath(),f.ellipse(W()*512,W()*512,40+W()*90,8+W()*20,0,0,Math.PI*2),f.fill();f.globalAlpha=1;const d=new Et(g);return d.colorSpace=vt,d.wrapS=ln,d.wrapT=ln,d.repeat.set(5,5),d}function Da(a){const g=document.createElement("canvas");g.width=128,g.height=128;const f=g.getContext("2d"),W=f.createImageData(128,128),s=tt(a^19088743);for(let L=0;L<16384;L+=1){const E=L%128,M=L/128|0,C=.72+.34*Vt(E*.35+a*.001,M*.35)+.12*Wo(E*.09,M*.09),S=Math.max(0,Math.min(255,Math.round(C*200)));W.data[L*4]=S,W.data[L*4+1]=S,W.data[L*4+2]=S,W.data[L*4+3]=255}f.putImageData(W,0,0);for(let L=0;L<40;L+=1)f.fillStyle=`rgba(0,0,0,${.04+s()*.08})`,f.beginPath(),f.arc(s()*128,s()*128,2+s()*9,0,Math.PI*2),f.fill();const d=new Et(g);return d.colorSpace=vt,d.wrapS=ln,d.wrapT=ln,d.repeat.set(260,260),d}const _a=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,La=`
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
`,Ba=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ua=`
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
`,Ft=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Gt=`
uniform float uInner;
uniform float uOuter;
uniform float uBands;
uniform vec3 uA;
uniform vec3 uB;
uniform float uAlpha;
varying vec3 vPos;
void main() {
  float r = length(vPos.xy);
  float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
  float b = 0.55 + 0.45 * sin(t * uBands + 0.7);
  b *= 0.65 + 0.35 * sin(t * uBands * 0.37 + 1.9);
  float edge = smoothstep(0.0, 0.05, t) * smoothstep(1.0, 0.92, t);
  float alpha = clamp(b, 0.0, 1.0) * edge * uAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(mix(uA, uB, b), alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;function Fa(a,y={}){const g=!!y.low,f=new ie,W=[],s=r=>(W.push(r),r);let d=null;const L=kn(a.id),E=tt(L),M=s(Ia()),C=[],S=[];if(a.terrain==="crater")for(let r=0;r<(g?16:26);r+=1){const l=E()*Math.PI*2,m=20+Math.sqrt(E())*460,i=16+E()*74;C.push({x:Math.cos(l)*m,z:Math.sin(l)*m,r:i,d:i*(.16+E()*.2)})}if(a.terrain==="volcano")for(let r=0;r<6;r+=1){const l=E()*Math.PI*2,m=60+E()*380;S.push({x:Math.cos(l)*m,z:Math.sin(l)*m,r:40+E()*90,h:12+E()*34})}if(a.terrain==="rock")for(let r=0;r<5;r+=1){const l=E()*Math.PI*2,m=60+E()*400;S.push({x:Math.cos(l)*m,z:Math.sin(l)*m,r:50+E()*110,h:6+E()*16})}function w(r,l,m,i=4){return(Ut(r*m,l*m,i)-.48)*2}function j(r,l){if(a.terrain==="plasma"||a.terrain==="ring")return 0;const m=Math.hypot(r,l);let i=0;if(a.terrain==="crater"){i=w(r+11,l+7,.004,4)*16+w(r+3,l+17,.0012,2)*34+w(r+5,l+23,.026,3)*3;for(const v of C){const N=Math.hypot(r-v.x,l-v.z)/v.r;N<1?i-=v.d*Math.pow(1-N*N,1.5):N<1.2&&(i+=v.d*.16*(1-(N-1)/.2))}}else if(a.terrain==="rock"){i=w(r+5,l+2,.0035,4)*40,i+=(1-Math.abs(w(r,l,.011,3)))*12,i+=w(r+21,l+13,.0011,2)*60,i+=w(r+31,l+41,.028,3)*3.4;for(const v of S){const N=Math.hypot(r-v.x,l-v.z)/v.r;N<1&&(i+=v.h*Math.pow(1-N,1.7))}}else if(a.terrain==="volcano"){i=w(r+3,l+8,.005,4)*14+w(r+9,l+1,.0012,2)*22;for(const v of S){const N=Math.hypot(r-v.x,l-v.z)/v.r;N<1&&(i+=v.h*Math.pow(1-N,1.25)),N<.24&&(i-=v.h*.5*(1-N/.24))}}else a.terrain==="ice"?i=w(r+9,l+4,.003,4)*9+w(r,l,.012,2)*2.2+w(r+2,l+8,.035,3)*1.1:i=w(r+7,l+3,.0035,4)*12+w(r,l,.012,2)*2.6+w(r+4,l+2,.03,3)*3;const I=Math.max(0,m-1500)/500;return i-=I*I*5,i+=(Ut(r*.09+1,l*.09+6,2)-.5)*(a.terrain==="rock"?1.2:a.terrain==="ice"?.25:.5),i}const u=j(0,0);function G(r,l){return j(r,l)-u}const ee=(()=>{if(a.cloudTop!==null||a.terrain==="plasma"||a.terrain==="ring")return{x:0,z:0};const r=[];for(let m=0;m<40;m+=1){const i=m/40*Math.PI*2,I=m%5*34,v=Math.cos(i)*I,N=Math.sin(i)*I;let O=0;for(let U=0;U<8;U+=1){const ze=U/8*Math.PI*2;O+=G(v+Math.cos(ze)*120,N+Math.sin(ze)*120)}r.push({x:v,z:N,score:G(v,N)-O/8})}r.sort((m,i)=>i.score-m.score);const l=r[Math.floor(r.length*.28)];return{x:l.x,z:l.z}})(),ne=a.cloudTop!==null?a.cloudTop:G(ee.x,ee.z),oe=1.7,me=Sn(a.sunAz,a.sunElev),Ee=a.sunScale>0?.2667*a.sunScale*Tt:0,Ce=Math.max(0,Math.min(1,a.fogDensity*26)),Ge=s(new ge({vertexShader:_a,fragmentShader:La,side:kt,depthWrite:!1,uniforms:{uTop:{value:new _(a.skyTop)},uBottom:{value:new _(a.skyBottom)},uGlow:{value:new _(a.glow)},uSun:{value:new _(a.sunColor)},uSunDir:{value:me.clone()},uSunRadius:{value:Ee},uSunHaze:{value:Ce},uGlowGain:{value:a.glowGain}}})),Se=new A(s(new q(nn,32,20)),Ge);if(Se.frustumCulled=!1,f.add(Se),a.stars){const r=g?320:620,l=new Float32Array(r*3),m=tt(L^2654435769);for(let v=0;v<r;v+=1){const N=m()*Math.PI*2,O=Math.pow(m(),.65)*.98+.02,U=Math.sqrt(1-O*O);l[v*3]=Math.cos(N)*U*(nn-200),l[v*3+1]=O*(nn-200),l[v*3+2]=Math.sin(N)*U*(nn-200)}const i=s(new Ze);i.setAttribute("position",new At(l,3));const I=new zn(i,s(new Pn({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1})));I.frustumCulled=!1,f.add(I)}const $e=Math.min(1.5,.45+.9*Math.min(1,Math.max(a.sunScale,.02)*1.5)),we=a.stars?.4:.46,ct=(r,l)=>{const i=-(G(r+.9,l)-G(r-.9,l))/1.8,I=-(G(r,l+.9)-G(r,l-.9))/(2*.9),v=1/Math.sqrt(i*i+1+I*I),N=Math.max(0,(i*me.x+me.y+I*me.z)*v);return we+$e*N};let nt=[],Je=null;if(a.terrain==="plasma"){const r=s(new ge({vertexShader:Ba,fragmentShader:Ua,uniforms:{uTime:{value:0},uA:{value:new _(a.ground)},uB:{value:new _(a.ground2)},uC:{value:new _(a.ground3)}}}));Je=r;const l=new A(s(new Ot(2400,2400,1,1)),r);l.rotation.x=-Math.PI/2,l.position.y=0,f.add(l)}else if(a.terrain!=="ring")if(a.cloudTop!==null){const r=s(Na(a)),l=r.clone();l.needsUpdate=!0,l.repeat.set(9,9),nt=[r,l];const m=Math.min(1.1,.55+.5*Math.min(1,Math.max(a.sunScale,.02)*2)),i=new A(s(new Ot(5200,5200,1,1)),s(new F({map:r,color:new _().setScalar(m),fog:!0})));i.rotation.x=-Math.PI/2,i.position.y=a.cloudTop,f.add(i);const I=new A(s(new Ot(5200,5200,1,1)),s(new F({map:l,color:new _().setScalar(m*.82),transparent:!0,opacity:.75,depthWrite:!1,fog:!0})));I.rotation.x=-Math.PI/2,I.position.y=a.cloudTop-120,f.add(I)}else{const r=g?96:150,l=s(new Ot(Ct*2,Ct*2,r,r));l.rotateX(-Math.PI/2);const m=l.attributes.position,i=new Float32Array(m.count*3),I=new _(a.ground),v=new _(a.ground2),N=new _(a.ground3),O=new _;for(let H=0;H<m.count;H+=1){const he=m.getX(H)/Ct,ce=m.getZ(H)/Ct,le=Math.sign(he)*Math.pow(Math.abs(he),1.8)*Ct,ae=Math.sign(ce)*Math.pow(Math.abs(ce),1.8)*Ct,V=G(le,ae);m.setXYZ(H,le,V,ae);const fe=Ut(le*.02+3,ae*.02+9,3);O.copy(I).lerp(v,Cn(Math.min(1,Math.max(0,(fe-.28)/.5)))),V<-1.6&&O.lerp(N,Math.min(1,(-V-1.6)/7));const ft=.86+Ut(le*.11,ae*.11,3)*.28+Ut(le*.6,ae*.6,2)*.08,Ne=Math.min(1.9,ct(le,ae))*ft;i[H*3]=O.r*Ne,i[H*3+1]=O.g*Ne,i[H*3+2]=O.b*Ne}l.setAttribute("color",new At(i,3)),l.computeVertexNormals();const U=s(Da(L)),ze=new A(l,s(new F({vertexColors:!0,map:U})));f.add(ze);const xe=s(new an(1,0)),Mt=[a.ground2,a.ground3,a.ground].map(H=>s(new F({color:new _(H).multiplyScalar(we+$e*.75)}))),se=tt(L^2135587861);for(let H=0;H<(g?64:110);H+=1){const he=se()*Math.PI*2,ce=2+Math.sqrt(se())*150,le=ee.x+Math.cos(he)*ce,ae=ee.z+Math.sin(he)*ce,V=.12+Math.pow(se(),2.2)*(H%9===0?2.6:.9),fe=new A(xe,Mt[H%3]);fe.position.set(le,G(le,ae)+V*.3,ae),fe.scale.set(V*(.8+se()*.7),V*(.45+se()*.5),V*(.8+se()*.7)),fe.rotation.set(se()*3,se()*3,se()*3),f.add(fe)}for(let H=0;H<(g?12:20);H+=1){const he=se()*Math.PI*2,ce=4+Math.sqrt(se())*34,le=ee.x+Math.cos(he)*ce,ae=ee.z+Math.sin(he)*ce,V=.35+Math.pow(se(),1.6)*1.5,fe=new A(xe,Mt[H%3]);fe.position.set(le,G(le,ae)+V*.42,ae),fe.scale.set(V*(.8+se()*.7),V*(.55+se()*.6),V*(.8+se()*.7)),fe.rotation.set(se()*3,se()*3,se()*3),f.add(fe)}if(a.terrain==="ice"){const H=[],he=tt(L^1542469173);for(let le=0;le<(g?6:10);le+=1){let ae=(he()-.5)*300,V=(he()-.5)*300,fe=he()*Math.PI*2;for(let ft=0;ft<12;ft+=1){const Ne=ae+Math.cos(fe)*14,He=V+Math.sin(fe)*14;H.push(ae,G(ae,V)+.06,V,Ne,G(Ne,He)+.06,He),ae=Ne,V=He,fe+=(he()-.5)*.9}}const ce=s(new Ze);ce.setAttribute("position",new At(new Float32Array(H),3)),f.add(new Eo(ce,s(new jt({color:a.ground3,transparent:!0,opacity:.75}))))}}if(a.terrain==="ring"){const r=new ie;r.position.copy(Sn(a.companionAz,a.companionElev)).multiplyScalar(2600),r.lookAt(0,0,0);const l=470,m=new A(s(new q(l,48,32)),s(new F({map:s(zo("saturn",a))})));r.add(m);const i=[[1.28,1.62,.62,60],[1.66,2.18,.5,80],[2.24,2.43,.34,90],[2.5,2.56,.16,110]];for(const[H,he,ce,le]of i){const ae=s(new ge({vertexShader:Ft,fragmentShader:Gt,transparent:!0,side:Te,depthWrite:!1,uniforms:{uInner:{value:l*H},uOuter:{value:l*he},uBands:{value:le},uA:{value:new _("#f2e6c8")},uB:{value:new _("#bfae8e")},uAlpha:{value:ce}}})),V=new A(s(new Fe(l*H,l*he,g?96:160,1)),ae);V.rotation.x=-Math.PI/2+.36,r.add(V)}f.add(r);const I=g?220:420,v=s(new an(1,0)),N=s(new F({color:"#dfe8f2"})),O=new Ro(v,N,I);O.instanceMatrix.setUsage(na);const U=tt(L^1374496523),ze=[],xe=new vo;for(let H=0;H<I;H+=1){const ce=H%31===0?.5+U()*1.3:.05+Math.pow(U(),2)*.55,le=14+Math.pow(U(),.7)*150,ae=U()*Math.PI*2,V=(U()-.5)*14;ze.push({r:le,a:ae,y:V,spin:.02+U()*.08,size:ce,wob:U()*Math.PI*2}),xe.position.set(Math.cos(ae)*le,V,Math.sin(ae)*le),xe.rotation.set(U()*3,U()*3,U()*3),xe.scale.setScalar(ce),xe.updateMatrix(),O.setMatrixAt(H,xe.matrix);const fe=.5+U()*.45;O.setColorAt(H,new _(fe,fe*.98,fe*1.05))}O.instanceMatrix.needsUpdate=!0,O.instanceColor&&(O.instanceColor.needsUpdate=!0),f.add(O),d={mesh:O,data:ze};const Mt=s(new ge({vertexShader:Ft,fragmentShader:Gt,transparent:!0,side:Te,depthWrite:!1,uniforms:{uInner:{value:30},uOuter:{value:1400},uBands:{value:320},uA:{value:new _("#cfd8e4")},uB:{value:new _("#9fb0c4")},uAlpha:{value:.22}}})),se=new A(s(new Fe(30,1400,128,1)),Mt);se.rotation.x=-Math.PI/2-.05,se.position.y=-3,f.add(se)}if(a.ring){const r=a.ring==="uranus",l=r?210:170,m=r?520:560,i=r?82*Tt:27*Tt,I=r?140:54,v=s(new ge({vertexShader:Ft,fragmentShader:Gt,transparent:!0,side:Te,depthWrite:!1,uniforms:{uInner:{value:l},uOuter:{value:m},uBands:{value:I},uA:{value:new _(r?"#9fd0d6":"#f2e6c8")},uB:{value:new _(r?"#cdeef2":"#c9b58e")},uAlpha:{value:r?.5:.62}}})),N=new A(s(new Fe(l,m,g?64:128,1)),v);if(N.rotation.x=-Math.PI/2+i,N.position.y=r?30:90,f.add(N),r){const O=s(new ge({vertexShader:Ft,fragmentShader:Gt,transparent:!0,side:Te,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new _("#dff6f8")},uB:{value:new _("#bfe6ea")},uAlpha:{value:.35}}})),U=new A(s(new Fe(130,175,64,1)),O);U.rotation.x=-Math.PI/2+i,U.position.y=30,f.add(U)}}if(a.companion){const l=Math.max(6,Math.tan(a.companionSize/2*Tt)*1500),m=new ie;m.position.copy(Sn(a.companionAz,a.companionElev)).multiplyScalar(1500);const i=s(zo(a.companion,a)),I=new A(s(new q(l,40,28)),s(new F({map:i})));if(I.lookAt(0,0,0),m.add(I),a.companion==="saturn"||a.companion==="jupiter"){const N=a.companion==="saturn",O=s(new ge({vertexShader:Ft,fragmentShader:Gt,transparent:!0,side:Te,depthWrite:!1,uniforms:{uInner:{value:l*1.3},uOuter:{value:l*(N?2.4:1.7)},uBands:{value:N?40:16},uA:{value:new _(N?"#efe0bc":"#d9c7a8")},uB:{value:new _(N?"#c2a87e":"#b09070")},uAlpha:{value:N?.55:.18}}})),U=new A(s(new Fe(l*1.3,l*(N?2.4:1.7),64,1)),O);U.rotation.x=-Math.PI/2+.32,m.add(U)}const v=new sn(s(new rn({map:M,color:new _(a.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:Me})));v.scale.setScalar(l*4),m.add(v),f.add(m)}const ot=g?140:a.particles==="haze"?120:300;let at=null,re=null;if(a.particles!=="none"){const r=new Float32Array(ot*3);re=new Float32Array(ot*3);const l=tt(L^625341585);for(let v=0;v<ot;v+=1){const N=l()*Math.PI*2,O=Math.sqrt(l())*55,U=a.particles;let ze=l()*22;U==="spark"&&(ze=l()*14),U==="haze"&&(ze=2+l()*26),r[v*3]=Math.cos(N)*O,r[v*3+1]=ze,r[v*3+2]=Math.sin(N)*O;const xe=U==="wind"?42+l()*34:U==="rain"?12+l()*6:U==="spark"?2+l()*4:1.2+l()*2.6;re[v*3]=U==="wind"?xe:(l()-.5)*xe*.5,re[v*3+1]=U==="rain"?-xe:U==="spark"?xe:U==="snow"?-.6-l()*.9:(l()-.5)*.4,re[v*3+2]=U==="wind"?xe*.25:(l()-.5)*xe*.4}at=s(new Ze),at.setAttribute("position",new At(r,3));const m=a.particles==="haze"?2.6:a.particles==="dust"?.14:a.particles==="rain"?.09:a.particles==="snow"?.11:.16,i=s(new Pn({color:new _(a.particleColor),size:m,transparent:!0,opacity:a.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:a.particles==="spark"?Me:void 0})),I=new zn(at,i);I.frustumCulled=!1,f.add(I)}const _e=s(new an(.26,0)),Le=s(new q(.24,16,12)),Rt=a.cloudTop===null&&a.terrain!=="plasma",Oe=[],Xe=[],st=[];function gt(r,l,m,i){const I=new sn(s(new rn({map:M,color:new _(l),transparent:!0,opacity:.9,depthWrite:!1,blending:Me})));I.position.copy(r),I.scale.setScalar(m),f.add(I),Xe.push({sprite:I,life:i,max:i,grow:m*2.4})}function ut(r,l){const m=new A(s(new Fe(.28,.5,24,1)),s(new F({color:new _(l),transparent:!0,opacity:.6,depthWrite:!1,side:Te})));m.rotation.x=-Math.PI/2,m.position.copy(r),f.add(m),st.push({mesh:m,life:.7})}function wt(r,l){const m=ee.x+r,i=ee.z+l,I=a.cloudTop!==null?a.cloudTop:G(m,i),v=Rt?new F({color:new _("#c9c2b4").multiplyScalar(we+$e*.8),transparent:!0}):new F({color:new _("#ffb45e"),transparent:!0}),N=new A(Rt?_e:Le,v);N.position.set(m,I+4.2,i),N.scale.setScalar(.9+Math.random()*.35),f.add(N);const O=a.gravityMps2<=.01;if(Oe.push({mesh:N,x:m,z:i,y:O?I+.6:I+4.2,vy:O?.12:0,vx:O?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:O?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),Oe.length>6){const U=Oe.shift();U&&(f.remove(U.mesh),U.mesh.material.dispose())}}function yt(r,l){const m=new P(r.x,l+.2,r.z);if(a.gravityMps2<=.01){r.outcome="float",r.landed=!0,r.resting=5.5,y.onLand?.({seconds:r.fall,bounces:0,outcome:"float"});return}if(a.terrain==="plasma"){r.outcome="vapor",r.landed=!0,r.resting=.25,gt(m,"#fff2c0",1.2,.6),y.onLand?.({seconds:r.fall,bounces:0,outcome:"vapor"});return}if(a.cloudTop!==null){r.outcome="sink",r.landed=!0,r.resting=1.6,gt(m,"#ffffff",1.6,.7),y.onLand?.({seconds:r.fall,bounces:0,outcome:"sink"});return}if(r.bounces+=1,ut(m,a.ground2),r.bounces===1&&y.onLand?.({seconds:r.fall,bounces:1,outcome:"bounce"}),r.bounces>=4||Math.abs(r.vy)<1.3){r.landed=!0,r.outcome="bounce",r.resting=1.6,r.vy=0;return}r.vy=Math.abs(r.vy)*.42,r.y=l+.26,r.vx*=.6,r.vz*=.6}const ke=new vo;function B(r,l){Je&&(Je.uniforms.uTime.value=r);for(let m=0;m<nt.length;m+=1)nt[m].offset.x=(nt[m].offset.x+l*(m===0?.006:.012))%1;if(d){const{mesh:m,data:i}=d;for(let I=0;I<i.length;I+=1){const v=i[I];v.a+=v.spin*l*.05,ke.position.set(Math.cos(v.a)*v.r,v.y+Math.sin(r*.25+v.wob)*.5,Math.sin(v.a)*v.r),ke.rotation.set(r*.08+v.wob,r*.11+v.a,v.wob),ke.scale.setScalar(v.size),ke.updateMatrix(),m.setMatrixAt(I,ke.matrix)}m.instanceMatrix.needsUpdate=!0}if(at&&re){const m=at.attributes.position,i=m.array;for(let I=0;I<m.count;I+=1){const v=I*3;i[v]+=re[v]*l,i[v+1]+=re[v+1]*l,i[v+2]+=re[v+2]*l,a.particles==="rain"||a.particles==="snow"?i[v+1]<0&&(i[v+1]=22):a.particles==="spark"?i[v+1]>20&&(i[v+1]=0):(i[v+1]<0&&(i[v+1]=24),i[v+1]>26&&(i[v+1]=0)),i[v]>60&&(i[v]=-60),i[v]<-60&&(i[v]=60),i[v+2]>60&&(i[v+2]=-60),i[v+2]<-60&&(i[v+2]=60)}m.needsUpdate=!0}for(let m=Oe.length-1;m>=0;m-=1){const i=Oe[m],I=a.cloudTop!==null?a.cloudTop:G(i.x,i.z);if(i.landed)i.resting>0?(i.resting-=l,i.outcome==="sink"?(i.y-=l*2.4,i.mesh.scale.multiplyScalar(1-l*.8)):i.outcome==="vapor"?i.mesh.scale.multiplyScalar(1-l*3):i.mesh.scale.multiplyScalar(1-l*.25)):(i.fade-=l*1.4,i.mesh.material.opacity=Math.max(0,i.fade),i.mesh.scale.multiplyScalar(1-l*.9),i.fade<=0&&(f.remove(i.mesh),i.mesh.material.dispose(),Oe.splice(m,1)));else{if(i.fall+=l,a.gravityMps2<=.01){i.x+=i.vx*l,i.z+=i.vz*l,i.y+=i.vy*l,i.mesh.rotation.x+=l*.6,i.mesh.rotation.y+=l*.45,i.mesh.position.set(i.x,i.y,i.z),i.fall>.05&&yt(i,i.y);continue}i.vy-=a.gravityMps2*l,i.y+=i.vy*l,i.x+=i.vx*l,i.z+=i.vz*l,i.mesh.rotation.x+=l*3.2,i.mesh.rotation.z+=l*2.1,i.y-.26<=I&&(i.y=I+.26,yt(i,I))}i.mesh.position.set(i.x,i.y,i.z)}for(let m=Xe.length-1;m>=0;m-=1){const i=Xe[m];i.life-=l;const I=1-i.life/i.max;i.sprite.scale.setScalar(i.sprite.scale.x+(i.grow-i.sprite.scale.x)*Math.min(1,l*6)),i.sprite.material.opacity=Math.max(0,.9*(1-I)),i.life<=0&&(f.remove(i.sprite),Xe.splice(m,1))}for(let m=st.length-1;m>=0;m-=1){const i=st[m];i.life-=l,i.mesh.scale.multiplyScalar(1+l*3.4),i.mesh.material.opacity=Math.max(0,i.life/.7)*.6,i.life<=0&&(f.remove(i.mesh),st.splice(m,1))}}function $t(){for(const r of Xe)f.remove(r.sprite);for(const r of st)f.remove(r.mesh);for(const r of Oe)f.remove(r.mesh),r.mesh.material.dispose();W.forEach(r=>r.dispose()),f.clear()}return{group:f,eyeY:ne+oe,groundY:ne,standX:ee.x,standZ:ee.z,update:B,drop:wt,dispose:$t}}const Po="textures/",Ie=Math.PI/180;function on(a,y,g=1){return new P(Math.cos(a*Ie)*Math.cos(y*Ie),Math.sin(a*Ie),-Math.cos(a*Ie)*Math.sin(y*Ie)).multiplyScalar(g)}const te=2.2,Ga=Date.UTC(2e3,0,1,12),Co={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},ko={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function Oa(){if(typeof window>"u")return!0;const a=navigator,y=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,g=a.hardwareConcurrency??8,f=a.deviceMemory??8;return!!(y||g<=4||f<=4)}function ja(){const y=document.createElement("canvas");y.width=128,y.height=128;const g=y.getContext("2d");if(g){const f=g.createRadialGradient(64,64,0,64,64,64);f.addColorStop(0,"rgba(255,238,205,0.85)"),f.addColorStop(.3,"rgba(255,214,150,0.55)"),f.addColorStop(.45,"rgba(255,190,120,0.22)"),f.addColorStop(.7,"rgba(250,170,95,0.07)"),f.addColorStop(1,"rgba(255,160,80,0)"),g.fillStyle=f,g.fillRect(0,0,128,128)}return new Et(y)}const Va=`
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
}`,$a=`
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
}`;function Xa(a){return Math.max(.12,.16+.11*Math.log2(a/2e3))}const Ha=`
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
}`,Ya=`
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
}`,qa=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Ka=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,Ao=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,To=`
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
}`,Za=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Ja=`
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
}`,Qa=`
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
}`,es=`
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
}`,ts=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,ns=`
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
}`,os=`
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
}`,as=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function ps(a,y){const g=Oa(),f=g?96:128,W=new oa({antialias:!0,powerPreference:"default",alpha:!1});W.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),W.outputColorSpace=vt,W.toneMapping=aa,W.toneMappingExposure=1.1;const s=W.domElement;s.style.display="block",s.style.width="100%",s.style.height="100%",s.style.touchAction="none",a.appendChild(s);const d=document.createElement("div");d.className="space-labels",a.appendChild(d);const L=[];let E=0;function M(){const e=performance.now();if(e-E<400)return;E=e,L.length=0;const t=a.getBoundingClientRect();for(const n of[".explore-top",".sheet",".sky-alert"]){const c=document.querySelector(n);if(!c)continue;const h=c.getBoundingClientRect();h.width<2||h.height<2||L.push({x:h.left-t.left,y:h.top-t.top,w:h.width,h:h.height})}}function C(e,t,n,c=22){for(const h of L)if(e<h.x+h.w&&e+n>h.x&&t<h.y+h.h&&t+c>h.y)return!0;return!1}const S=new sa;S.background=new _("#05070d");const w=new ia(45,1,.01,2e3),j=[],u=e=>(j.push(e),e),G=new ra,ee=new la,ne=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),oe=new Map,me=new Map,Ee=[],Ce=new Set;let Ge=!1,Se=0;const $e=(e,t)=>{const n=me.get(e);if(n){me.delete(e);for(const c of n)c(t)}},we=(e,t=!0)=>{const n=oe.get(e);if(n)return n;Se+=1;const c=G.load(Po+e,()=>{$e(e,c),Se-=1,Se===0&&y.onReady?.()},void 0,()=>{$e(e,c),Se-=1,Se===0&&y.onReady?.()});return c.colorSpace=t?vt:wa,c.anisotropy=g?4:8,oe.set(e,c),u(c)},ct=e=>{oe.has(e)||Ce.has(e)||(Ce.add(e),ee.load(Po+e,t=>{Ce.delete(e);const n=new ba;n.image=t,n.colorSpace=vt,n.anisotropy=g?4:8,n.needsUpdate=!0,u(n),oe.set(e,n),$e(e,n)},void 0,()=>{Ce.delete(e)}))},nt=()=>{if(!Ge){Ge=!0;for(const e of Ee)ct(e)}},Je=(e,t)=>{if(ne.has(e)){t(we(e));return}const n=oe.get(e);if(n){t(n);return}const c=me.get(e)??[];c.push(t),me.set(e,c),Ee.includes(e)||(Ee.push(e),Ge&&ct(e))},ot=new A(u(new q(900,48,24)),u(new F({map:we("milkyway.webp"),side:kt,depthWrite:!1})));ot.rotation.set(63*Ie,0,0),S.add(ot),S.add(new ca(16777215,.14));const at=new ua(16777215,1.6,0,0);at.decay=0,S.add(at);const re=new ie;S.add(re);const _e=new Map,Le=new Map,Rt=new Map,Oe=[],Xe=new Map;let st=null,gt=null;const ut=new Map,wt=new Map,yt=new Map,ke=new Map;let B=null,$t=0,r=null;const l=[],m=[],i=[],I=[],v=[];let N=Date.now(),O=!0,U=null;function ze(e,t,n,c){const h=Co[n]??[.7,.7,.7,.06],k=ko[n],R=new _(t),D=k?.relief??0,o=u(new ge({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new Qt(k?.texel?.[0]??1/1024,k?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:D*.35},gain:{value:(k?.gain??1.9)*.6},base:{value:new P(R.r,R.g,R.b)},glow:{value:new P(h[0],h[1],h[2])},atmo:{value:Math.min(h[3]*2.2,.85)},ringShadow:{value:c?1:0},ringMap:{value:null},ringInner:{value:c?.inner??1},ringOuter:{value:c?.outer??2},ringCenter:{value:new P},ringNormal:{value:new P(0,1,0)}},vertexShader:Va,fragmentShader:$a}));return e&&Je(e,p=>{o.uniforms.dayMap.value=p,o.uniforms.useMap.value=1,D>0&&(o.uniforms.bumpMap.value=p,o.uniforms.useBump.value=1)}),c&&Je("saturn-ring.webp",p=>{o.uniforms.ringMap.value=p}),o}function xe(e,t,n){const c=ko[n],h=c?.tint??Co[n]?.slice(0,3);if(!h||g)return;const k=Math.min(c?.inner??.12,.5)*.55,R=Math.min(c?.outer??.05,.2)*.9,D=new P(h[0],h[1],h[2]),o=Math.sqrt(1-1/(1.045*1.045)),p=(x,T,Y,ue)=>new A(u(new q(t*x,g?24:32,g?16:24)),u(new ge({uniforms:{tint:{value:D},power:{value:Y},strength:{value:ue},edge:{value:o}},vertexShader:Ao,fragmentShader:To,side:T,transparent:!0,blending:Me,depthWrite:!1})));e.add(p(1.045,kt,2.7,k),p(1.16,wo,3.4,R))}function Mt(e,t){const n=u(new ge({uniforms:{poleN:{value:on(80.7,-72.7,1).normalize()},poleS:{value:on(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:Za,fragmentShader:Ja,transparent:!0,blending:Me,depthWrite:!1})),c=new A(u(new q(t*1.022,g?64:96,g?48:64)),n);c.renderOrder=1,e.add(c),I.push(n)}function se(e,t){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([c,h,k,R,D],o)=>{const p=on(c,h,1).normalize(),x=new P(0,1,0).cross(p).normalize(),T=new P().crossVectors(p,x).normalize(),Y=x.multiplyScalar(Math.cos(D)).addScaledVector(T,Math.sin(D)).normalize(),ue=[];for(let pe=0;pe<=16;pe+=1){const Ke=pe/16,We=(Ke-.5)*k,be=Math.sin(Ke*Math.PI)*R;ue.push(new P().copy(p).multiplyScalar(Math.cos(We)).addScaledVector(Y,Math.sin(We)).normalize().multiplyScalar(t*(.985+be)))}const de=u(new ge({uniforms:{uTime:{value:0},seed:{value:o*.37+.11}},vertexShader:Qa,fragmentShader:es,transparent:!0,blending:Me,side:Te,depthWrite:!1})),Ue=new A(u(new ya(new Ma(ue),64,t*.022,8,!1)),de);Ue.raycast=()=>{},e.add(Ue),v.push(de)})}function H(e,t,n=""){const c=document.createElement("button");c.type="button",c.className="space-label"+n,c.textContent=t,c.addEventListener("click",()=>y.onPick?.(e)),d.appendChild(c),Rt.set(e,c)}const he=u(new ge({uniforms:{map:{value:we("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),ce=new P,le=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],ae=new Map;let V=null;const fe={moon:"earth",...Object.fromEntries(Mo.map(e=>[e.id,e.parent]))};function ft(e,t){const n=fe[e];if(V===null||!n)return en(e,t);const c=en(n,t),h=en(e,V),k=en(n,V);return{x:c.x+h.x-k.x,y:c.y+h.y-k.y,z:c.z+h.z-k.z}}function Ne(e){for(const[t,n]of Le){if(t==="sun")continue;const c=ft(t,e);n.position.set(c.x*te,c.y*te,c.z*te)}for(const[t,n]of ut){const c=ft(t,e);n.position.set(c.x*te,c.y*te,c.z*te)}if(r){ce.copy(r.holder.position);const t=ce.length()||1;r.tail.visible=t/te<8,ce.multiplyScalar(1/t),r.tail.quaternion.setFromUnitVectors(new P(0,1,0),ce),r.tail.position.copy(ce).multiplyScalar(.16*te)}}const He=new P(1,0,0),Io=u(new ge({uniforms:{dayMap:{value:we("earth-day.webp")},nightMap:{value:we("earth-night.webp")},normalMap:{value:we("earth-normal.webp",!1)},specMap:{value:we("earth-spec.webp",!1)},texel:{value:new Qt(1/2048,1/1024)},sunDir:{value:He}},vertexShader:Ha,fragmentShader:Ya}));function No(e){const t=new ie,n=new A(u(new q(e,g?96:128,64)),Io);n.name="earth",t.add(n);const c=new A(u(new q(e*1.012,80,48)),u(new xa({map:we("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));t.add(c),st=c;const h=new A(u(new q(e*1.06,64,48)),u(new ge({uniforms:{sunDir:{value:He}},vertexShader:`
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
            }`,side:kt,transparent:!0,blending:Me,depthWrite:!1})));t.add(h);const k=new A(u(new q(e*1.15,g?24:32,g?16:24)),u(new ge({uniforms:{tint:{value:new P(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:Ao,fragmentShader:To,side:wo,transparent:!0,blending:Me,depthWrite:!1})));return t.add(k),_e.set("earth",n),t}function An(e,t,n){for(const c of Lt(e).sites??[]){const h=new A(u(new q(n*.018,12,8)),u(new F({color:"#3182f6"})));h.position.copy(on(c.lat,c.lon,n*1.004)),t.add(h);const k=document.createElement("div");k.className="space-site",k.textContent=c.name,d.appendChild(k),Oe.push({mesh:h,site:c,el:k,parent:e})}}let Wt=null;for(const e of za){if(e.id==="moon")continue;const t=new ie;if(Le.set(e.id,t),re.add(t),e.id==="sun"){const n=.26*te,c=new A(u(new q(n,g?96:128,g?64:80)),he);c.name="sun",Xe.set("sun",n),t.add(c),se(c,n);for(const[k,R,D,o]of[[1.06,2,.95,"#ffbf78"]])t.add(new A(u(new q(n*k,g?32:48,g?24:32)),u(new ge({uniforms:{color:{value:new _(o)},power:{value:R},strength:{value:D}},vertexShader:qa,fragmentShader:Ka,transparent:!0,blending:Me,depthWrite:!1}))));_e.set("sun",c);const h=new sn(u(new rn({map:u(ja()),blending:Me,transparent:!0,depthWrite:!1,depthTest:!0,color:new _("#ffd9a0")})));h.scale.setScalar(n*3.6),t.add(h),gt=h}else{const n=xn(e.id).radius*te;Xe.set(e.id,n);let c;if(e.id==="earth"){const D=No(n);D.rotation.z=-e.tilt*Ie,t.add(D),Wt=D,c=D.children[0]}else{const D=e.id==="saturn"?{inner:n*1.18,outer:n*2.08}:void 0;c=new A(u(new q(n,g?96:128,64)),ze(e.texture,e.color,e.id,D)),c.name=e.id,c.rotation.z=-e.tilt*Ie,t.add(c),_e.set(e.id,c),xe(t,n,e.id),e.id==="jupiter"&&Mt(c,n)}if(e.axes){const[D,o,p]=e.axes;c.scale.set(1,p/D,o/D)}if(e.ring&&e.axes){const D=e.axes[0]/2,o=n*(e.ring.radius-e.ring.width/2)/D,p=n*(e.ring.radius+e.ring.width/2)/D,x=new A(u(new Fe(o,Math.max(p,o*1.03),128,1)),u(new F({color:"#8b8580",side:Te,transparent:!0,opacity:.75,depthWrite:!1})));x.rotation.x=Math.PI/2,t.add(x)}if(e.id==="saturn"){const D=n*1.18,o=n*2.08,p=new Fe(D,o,160,1),x=u(new ge({uniforms:{ringMap:{value:null},innerRatio:{value:D/o},planetRadius:{value:n},planetCenter:{value:new P}},vertexShader:ts,fragmentShader:ns,side:Te,transparent:!0,depthWrite:!1}));Je("saturn-ring.webp",Y=>{x.uniforms.ringMap.value=Y});const T=new A(u(p),x);T.rotation.x=Math.PI/2,c.add(T),m.push({mesh:T,parent:e.id}),i.push({mesh:c,material:c.material})}e.sites&&An(e.id,c,n);const h=xo(e.id,.022),k=u(new Ze);k.setAttribute("position",new yn(h.positions,3)),k.setIndex(h.index),k.scale(te,te,te);const R=new A(k,u(new F({color:xn(e.id).ribbon,transparent:!0,opacity:.5,side:Te,depthWrite:!1})));l.push(R),re.add(R)}H(e.id,e.name,e.id==="sun"?"":" is-planet")}const Tn=[];function En(e,t,n){let c=e==="main"?1234:98765;const h=()=>(c=c*16807%2147483647,(c-1)/2147483646),k=u(new an(1,0)),R=new Float32Array(t*4),D=new Float32Array(t*4);for(let x=0;x<t;x+=1){let T;if(e==="main")do T=2.1+h()*1.2;while((Math.abs(T-2.5)<.03||Math.abs(T-2.82)<.03||Math.abs(T-2.95)<.02)&&h()<.85);else T=h()<.18?39.2+(h()-.5)*1.2:42+(h()-.5)*6.5;R[x*4]=T,R[x*4+1]=h()*Math.PI*2,R[x*4+2]=h()*(e==="main"?.18:.12),R[x*4+3]=h()*Math.PI*2,D[x*4]=(h()-.5)*(e==="main"?.32:.5),D[x*4+1]=h()*Math.PI*2;const Y=h()**3;D[x*4+2]=(e==="main"?.0035:.009)*(.7+Y*2.4),D[x*4+3]=h()}k.setAttribute("orbit",new yo(R,4)),k.setAttribute("shape",new yo(D,4));const o=u(new ge({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new _(n)},uScale:{value:te}},vertexShader:os,fragmentShader:as})),p=new Ro(k,o,t);p.frustumCulled=!1,p.raycast=()=>{},re.add(p),Tn.push({mesh:p,material:o})}En("main",g?1800:4200,"#9c9184"),En("kuiper",g?1500:3600,"#7f8b9c");for(const e of Mo){const t=new ie,n=new A(u(new q(e.radius*te,32,24)),ze(`${e.id}.webp`,e.color,e.id));n.name=e.id,t.add(n),re.add(t),ut.set(e.id,t),wt.set(e.id,n);const c=document.createElement("button");c.type="button",c.className="space-label is-small",c.textContent=e.name,c.addEventListener("click",()=>y.onExtra?.(e.id)),d.appendChild(c),yt.set(e.id,{el:c,parent:e.parent})}{const e=new ie,t=new A(u(new q(.045*te,20,16)),u(new F({color:"#f7fbff"})));t.name="halley",e.add(t);const n=new A(u(new fa(.04*te,.32*te,12)),u(new F({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(n),r={holder:e,tail:n},re.add(e),ut.set("halley",e),wt.set("halley",t);const c=xo("halley",.022),h=u(new Ze);h.setAttribute("position",new yn(c.positions,3)),h.setIndex(c.index),h.scale(te,te,te);const k=new A(h,u(new F({color:xn("halley").ribbon,transparent:!0,opacity:.35,side:Te,depthWrite:!1})));l.push(k),re.add(k);const R=document.createElement("button");R.type="button",R.className="space-label is-small",R.textContent=b("핼리 혜성"),R.addEventListener("click",()=>y.onExtra?.("halley")),d.appendChild(R),yt.set("halley",{el:R,parent:null})}for(const e of Pa){const t=Ca(e),n=t.points.map(Y=>new P(Y.x*te,Y.y*te,Y.z*te)),c=u(new Ze().setFromPoints(n)),h=new da(c,u(new jt({color:e.color,transparent:!0,opacity:.95})));h.visible=!1;const k=new ie,R=new A(u(new Mn(.03,.01,.01,20)),u(new F({color:"#d8dde4"})));R.rotation.x=Math.PI/2;const D=new A(u(new q(.014,12,8)),u(new F({color:"#c9ced6"})));D.position.z=-.02;const o=new A(u(new Mn(.002,.002,.09,6)),u(new F({color:"#aab3c0"})));o.rotation.z=Math.PI/2,o.position.z=-.02;const p=new A(u(new q(.035,16,12)),u(new F({color:e.color,transparent:!0,opacity:.18,blending:Me,depthWrite:!1})));k.add(R,D,o,p),k.scale.setScalar(e.frame==="earth"?.8:1.3),k.position.copy(n[n.length-1]),h.add(k),(e.frame==="earth"?Le.get("earth")??re:re).add(h);const T=document.createElement("div");T.className="space-site is-probe",T.textContent=e.name,d.appendChild(T),ke.set(e.id,{line:h,probe:k,el:T,points:n,times:t.points.map(Y=>Y.t),marks:t.marks,frame:e.frame})}if(Ne(N),Wt){const e=.055*te;Xe.set("moon",e);const t=new A(u(new q(e,f,48)),ze("moon.webp","#b8b8b8","moon"));t.name="moon";const n=new ie;n.add(t),re.add(n),_e.set("moon",t),Le.set("moon",n),An("moon",t,e),H("moon",b("달")," is-small"),Ne(N)}const dt=new ie,pt=new ie,Xt=new ie;dt.add(pt,Xt),dt.visible=!1;let Rn="solar",it=!1,cn=0;const K={moon:new A,moonMat:u(new F({color:"#ffffff"})),shadow:u(new F({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new A,umbra:new A,skyCover:new A,skySun:new ie,skyMoon:new ie,skyMoonMat:u(new F({color:"#ffffff"}))},un=[],Wn=we("sun.webp"),In=we("moon.webp"),Nn=new A(u(new q(.62,32,24)),u(new F({map:Wn})));Nn.position.set(-3.3,0,0);const Dn=new A(u(new q(.4,32,24)),u(new F({map:we("earth-day.webp")})));Dn.position.set(1.85,0,0),K.moonMat.map=In,K.moon=new A(u(new q(.14,24,18)),K.moonMat),K.cone=new A(u(new Mn(.04,.16,.78,18)),K.shadow),K.cone.position.set(1.42,0,0),K.cone.rotation.z=Math.PI/2,K.umbra=new A(u(new _t(.3,28)),u(new F({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),K.umbra.position.set(2.75,0,.02),pt.add(Nn,Dn,K.moon,K.cone,K.umbra);for(const[e,t]of[[b("태양"),new P(-3.3,.85,0)],[b("지구"),new P(1.85,.68,0)]]){const n=document.createElement("div");n.className="space-site",n.textContent=e,d.appendChild(n),un.push({el:n,at:t,group:pt})}const Do=new A(u(new _t(1.35,48)),u(new F({map:Wn}))),_o=new A(u(new Fe(1.4,1.7,48)),u(new F({color:"#f0c36a",transparent:!0,opacity:.45,side:Te,depthWrite:!1})));K.skyCover=new A(u(new _t(1.22,48)),u(new F({color:"#141820"}))),K.skySun.add(Do,_o,K.skyCover),K.skyMoonMat.map=In;const Lo=new A(u(new _t(.92,48)),K.skyMoonMat),_n=new A(u(new _t(1.08,48)),u(new F({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));_n.position.z=.16,K.skyMoon.add(Lo,_n),Xt.add(K.skySun,K.skyMoon);const It=document.createElement("div");It.className="space-site is-stage",d.appendChild(It),un.push({el:It,at:new P(0,-1.2,0),group:pt}),Xt.visible=!1,S.add(dt);const Ye=new ie;Ye.visible=!1,Ye.rotation.z=-Math.PI/2;const Ln=[],Bn=4.6,Bo=e=>Bn*e/696e3,Un=new A(u(new q(Bn,64,40)),u(new F({map:we("sun.webp")})));Un.position.set(-3.2,0,0),Ye.add(Un);const Uo=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let Fn=2.4;const Gn=(e,t)=>{const n=document.createElement("div");n.className="space-site",n.textContent=e,d.appendChild(n),Ln.push({el:n,at:t,group:Ye})};Gn(b("태양"),new P(-3.2,4.9,0));for(const[e,t]of Uo){const n=Bo(t),c=Fn+n;Fn=c+n+.72;const h=Lt(e),k=e==="earth"?"earth-day.webp":h.texture,R=u(new F({color:h.color}));k&&Je(k,o=>{R.map=o,R.color.set("#ffffff"),R.needsUpdate=!0});const D=new A(u(new q(n,32,24)),R);if(D.position.set(c,0,0),h.axes&&D.scale.set(1,h.axes[2]/h.axes[0],h.axes[1]/h.axes[0]),Ye.add(D),e==="saturn"){const o=n*1.18,p=n*2.08,x=u(new Fe(o,p,96,1)),T=x.attributes.position,Y=x.attributes.uv,ue=new P;for(let pe=0;pe<T.count;pe+=1)ue.fromBufferAttribute(T,pe),Y.setXY(pe,(ue.length()-o)/(p-o),.5);const de=u(new F({color:"#b9b3ab",transparent:!0,opacity:.9,side:Te,depthWrite:!1}));Je("saturn-ring.webp",pe=>{de.map=pe,de.color.set("#ffffff"),de.needsUpdate=!0});const Ue=new A(x,de);Ue.rotation.y=Math.PI/2-.36,D.add(Ue)}Gn(h.name,new P(c,(e==="saturn"?n*2.08:n)+.12,0))}S.add(Ye);const Be=new ie;Be.visible=!1;const fn=[],On=[],Fo=new A(u(new q(.55,48,32)),u(new F({color:"#e0703a"})));Be.add(Fo);for(const[e,t]of[[1.35,.16],[2.1,.05]])Be.add(new A(u(new q(.55*e,32,24)),u(new F({color:"#ff6a30",transparent:!0,opacity:t,side:kt,blending:Me,depthWrite:!1}))));const jn=new A(u(new Fe(2.6,5.1,96,1)),u(new F({color:"#3fbf7f",transparent:!0,opacity:.12,side:Te,depthWrite:!1})));jn.rotation.x=Math.PI/2,Be.add(jn),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,t,n,c,h],k)=>{const R=new go(u(new Ze().setFromPoints(Array.from({length:128},(p,x)=>new P(Math.cos(x/128*Math.PI*2)*n*100,0,Math.sin(x/128*Math.PI*2)*n*100)))),u(new jt({color:"#8b95a1",transparent:!0,opacity:.35})));Be.add(R);const D=new A(u(new q(.16*c,24,16)),ze(void 0,h,"earth"));Be.add(D);const o=document.createElement("button");o.type="button",o.className="space-label is-small",o.textContent=e,o.addEventListener("click",()=>y.onExtra?.(`trappist-${e}`)),d.appendChild(o),fn.push({mesh:D,a:n*100,period:t,phase0:k*1.7,el:o})});const Go=new go(u(new Ze().setFromPoints(Array.from({length:256},(e,t)=>new P(Math.cos(t/256*Math.PI*2)*38.7,0,Math.sin(t/256*Math.PI*2)*38.7)))),u(new jt({color:"#c5b8a2",transparent:!0,opacity:.5})));Be.add(Go);for(const[e,t]of[["TRAPPIST-1",new P(0,1.1,0)],[b("생명가능지대(대략)"),new P(3.9,0,0)],[b("비교: 우리 수성의 궤도"),new P(0,0,38.7)]]){const n=document.createElement("div");n.className="space-site",n.textContent=e,d.appendChild(n),On.push({el:n,at:t})}S.add(Be);const rt=Ea(u),Oo=rt.labels.map(({name:e,at:t})=>{const n=document.createElement("div");return n.className="space-site",n.textContent=e,d.appendChild(n),{el:n,at:t}});S.add(rt.group);const Re=Wa(),dn=[];if(Re)for(const[e,t]of Object.entries(Re.groups)){S.add(t);for(const n of Re.markers[e]){const c=document.createElement("button");c.type="button",c.className="space-label",c.textContent=n.name,c.addEventListener("click",()=>{y.onMarker?.(n),J.target.copy(n.position),J.radius=bt[e]*(n.id==="cmb"?1.4:e==="group"?.6:.42)}),d.appendChild(c),dn.push({level:e,marker:n,el:c})}}const Vn=[];if(Re){const t=(k,R)=>new P(Math.cos(R*Ie)*Math.cos(k*Ie),Math.sin(R*Ie),-Math.cos(R*Ie)*Math.sin(k*Ie)).multiplyScalar(140),n=[];for(const k of Object.values(bo))for(const R of k)for(let D=0;D<R.length-1;D+=1){const o=t(R[D][0],R[D][1]),p=t(R[D+1][0],R[D+1][1]);n.push(o.x,o.y,o.z,p.x,p.y,p.z)}const c=u(new Ze);c.setAttribute("position",new yn(n,3));const h=new Eo(c,u(new jt({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));Re.groups.stars.add(h);for(const k of ka){if(!bo[k.id])continue;const R=document.createElement("button");R.type="button",R.className="space-label is-const",R.textContent=k.name.replace(/\(.*\)/,"").split(" · ")[0],R.addEventListener("click",()=>y.onConstellation?.(k.id)),d.appendChild(R),Vn.push({el:R,at:t(k.center[0],k.center[1])})}}const Ht=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let $="system",xt=!1,$n=!1;const bt={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},St=new P,Z={theta:.6,phi:.95,radius:34},J={target:new P,radius:Z.radius};let ve="system",Pe=null,De=null,je=null;function Yt(e){if((e==="system"||e==="sizes")&&nt(),$=e,xt=!1,re.visible=e==="system",dt.visible=e==="eclipse",Ye.visible=e==="sizes",Be.visible=e==="exo",rt.group.visible=e==="blackhole",Re)for(const[t,n]of Object.entries(Re.groups))n.visible=t===e;ve="system",Pe=null,De=null,je=null,J.target.set(0,0,0),J.radius=bt[e],e!=="system"&&(Z.phi=1.1),e==="eclipse"&&(pt.rotation.z=w.aspect<1?-Math.PI/2:0,Z.theta=0,Z.phi=it?Math.PI/2:1.25,J.target.set(0,0,0),it||J.target.set(-.7,0,0).applyEuler(pt.rotation),J.radius=it?6:w.aspect<1?10:7.5),e==="exo"&&(Z.phi=.75),e==="blackhole"&&(Z.phi=1.42),e==="sizes"&&(Z.theta=0,Z.phi=Math.PI/2,J.target.set(.6,-6.8,0),J.radius=19)}function Xn(e){if(e!=="earth"&&nt(),xt=!1,$!=="system"&&($="system",re.visible=!0,dt.visible=!1,Ye.visible=!1,Be.visible=!1,rt.group.visible=!1,Re))for(const n of Object.values(Re.groups))n.visible=!1;if(ve=e,De=null,je=null,e==="system"){Pe=null,J.target.set(0,0,0),J.radius=bt.system;return}Pe=Le.get(e)??null;const t=Xe.get(e)??Xa(Lt(e).km);J.radius=e==="sun"?3.2:e==="jupiter"?3.4*te:e==="saturn"?2.6*te:Math.max(t*(Lt(e).ring?6:4.2),.25)}function jo(e){const t=ut.get(e);t&&($!=="system"&&Yt("system"),ve="system",Pe=t,De=null,je=null,J.radius=e==="halley"?1.6:.6,Qe=performance.now())}function Vo(e){je=(e?Oe.find(n=>n.parent===ve&&n.site.name===e.name):void 0)?.mesh??null,De=je?new P:null,Qe=performance.now()}let Q=null,lt=0,zt=-.12,pn=0,Nt=0,qt=0,Hn=0;function $o(){if(ot.visible=!0,re.visible=$==="system",dt.visible=$==="eclipse",Ye.visible=$==="sizes",Be.visible=$==="exo",rt.group.visible=$==="blackhole",Re)for(const[e,t]of Object.entries(Re.groups))t.visible=e===$}function Yn(e,t){Q&&(S.remove(Q.group),Q.dispose(),Q=null);const n=Ta(e);Q=Fa(n,{low:g,onLand:c=>y.onSurfaceDrop?.({id:e,seconds:c.seconds,bounces:c.bounces,outcome:c.outcome})}),S.add(Q.group),S.fog=new Sa(new _(n.fog),n.fogDensity),lt=(n.companion?n.companionAz:n.sunAz)*Ie,zt=-.12,Nt=0,qt=Math.max(.6,t),Hn=n.cloudTop!==null?260:150,Qe=performance.now()}function qn(e){if(!Q){if(ot.visible=!1,re.visible=!1,dt.visible=!1,Ye.visible=!1,Be.visible=!1,rt.group.visible=!1,Re)for(const t of Object.values(Re.groups))t.visible=!1;d.style.display="none",B=null,V=null,O=!0,w.fov=62,w.near=.08,w.far=6e3,w.updateProjectionMatrix()}Yn(e,1.9)}function Xo(e){if(!Q){qn(e);return}Yn(e,1.1)}function Ho(){Q&&(S.remove(Q.group),Q.dispose(),Q=null,S.fog=null,d.style.display="",$o(),w.fov=45,w.near=.01,w.far=2e3,w.updateProjectionMatrix(),St.copy(J.target),Z.radius=J.radius,Qe=performance.now())}function Kn(){if(!Q)return;const e=4.2+Math.random()*1.4,t=(Math.random()-.5)*1.8,n=Math.sin(lt)*e+Math.cos(lt)*t,c=-Math.cos(lt)*e+Math.sin(lt)*t;Q.drop(n,c)}function Yo(e,t){if(!Q)return;if(Q.update(e,t),Nt<qt){Nt=Math.min(qt,Nt+t);const h=Nt/qt,k=1-Math.pow(1-h,3);pn=Hn*(1-k),zt=-.12-.38*(1-k)}else pn=0;const n=Q.eyeY+pn;w.position.set(Q.standX,n,Q.standZ);const c=Math.cos(zt);w.lookAt(Q.standX+Math.sin(lt)*c,n+Math.sin(zt),Q.standZ-Math.cos(lt)*c),W.render(S,w)}const qe=new Map;let Dt=0,mt=0,Qe=0;const Zn=new pa,Jn=new Qt,Qn=e=>{if(Q){s.setPointerCapture(e.pointerId),qe.set(e.pointerId,{x:e.clientX,y:e.clientY}),mt=0;return}if(nt(),s.setPointerCapture(e.pointerId),xt=!1,qe.set(e.pointerId,{x:e.clientX,y:e.clientY}),mt=0,Qe=performance.now(),qe.size===2){const[t,n]=[...qe.values()];Dt=Math.hypot(t.x-n.x,t.y-n.y)}},eo=e=>{const t=qe.get(e.pointerId);if(!t)return;const n=e.clientX-t.x,c=e.clientY-t.y;if(qe.set(e.pointerId,{x:e.clientX,y:e.clientY}),Q){mt+=Math.abs(n)+Math.abs(c),lt-=n*.004,zt=Math.min(1.15,Math.max(-1.05,zt-c*.0035));return}if(Qe=performance.now(),qe.size===1)mt+=Math.abs(n)+Math.abs(c),Z.theta-=n*.006,Z.phi=Math.min(2.9,Math.max(.2,Z.phi-c*.006)),De=null,je=null;else if(qe.size===2){const[h,k]=[...qe.values()],R=Math.hypot(h.x-k.x,h.y-k.y);Dt>0&&(J.radius=no(J.radius*(Dt/R))),Dt=R,mt+=10}},Kt=e=>{if(qe.delete(e.pointerId),Dt=0,Q){mt<8&&Kn();return}if(mt<6&&y.onPick){const t=s.getBoundingClientRect();Jn.set((e.clientX-t.left)/t.width*2-1,-((e.clientY-t.top)/t.height)*2+1),Zn.setFromCamera(Jn,w);const c=Zn.intersectObjects([..._e.values(),...wt.values()],!1)[0]?.object.name;c&&_e.has(c)?y.onPick(c):c&&wt.has(c)&&y.onExtra?.(c)}},to=e=>{Q||(e.preventDefault(),J.radius=no(J.radius*(e.deltaY>0?1.12:.89)))};function no(e){return $!=="system"?Math.min(bt[$]*2.2,Math.max(bt[$]*.15,e)):Math.min(90,Math.max(ve==="system"&&!Pe?4:.15,e))}s.addEventListener("pointerdown",Qn),s.addEventListener("pointermove",eo),s.addEventListener("pointerup",Kt),s.addEventListener("pointercancel",Kt),s.addEventListener("wheel",to,{passive:!1});let et=null,Zt=null,mn=!matchMedia("(prefers-reduced-motion: reduce)").matches,oo=0,ao=0;mn&&(et=new ma(W),et.addPass(new ha(S,w)),Zt=new va(new Qt(256,256),.75,.78,.92),et.addPass(Zt),et.addPass(new ga));const X={w:1,h:1},so=()=>{X.w=a.clientWidth||1,X.h=a.clientHeight||1,W.setSize(X.w,X.h,!1),et?.setSize(X.w,X.h),Zt?.resolution.set(X.w/2,X.h/2),w.aspect=X.w/X.h,w.updateProjectionMatrix()};so();const io=new ResizeObserver(so);io.observe(a);let ro=!0;const lo=new IntersectionObserver(e=>{ro=e.some(t=>t.isIntersecting)});lo.observe(a);const z=new P,ht=new P,Pt=new P,hn=new P,qo=new P,Ko=new P,Zo=new P,Jo=new P,co=new P,Qo=new P;let vn=0,uo=performance.now(),gn=-1e9,fo=0;const po=e=>{vn=requestAnimationFrame(po);const t=Math.min(.1,(e-uo)/1e3);if(uo=e,document.hidden||!ro)return;if(Q){Yo(e/1e3,t);return}if(Ht||(he.uniforms.time.value=e/1e3),!Ht){for(const o of I)o.uniforms.time.value=e/1e3;for(const o of v)o.uniforms.uTime.value=e/1e3}e-Qe>3e3&&!Ht&&!De&&!$n&&!xt&&$!=="eclipse"&&$!=="sizes"&&(Z.theta+=t*(ve==="system"?.03:.08)),st?.rotateY(t*.01);for(const[o,p]of _e){if(o==="earth"||o==="moon"||je&&o===ve)continue;const x=Lt(o).spinHours;Ht||p.rotateY(t*(o==="sun"?.02:x?.12*(24/x)*.25:.12))}gt&&(gt.visible=w.position.length()>4);for(const o of Tn)o.material.uniforms.uDays.value=(N-Ga)/864e5,o.material.uniforms.uTime.value=e/1e3;for(const o of m){const p=_e.get(o.parent);p&&o.mesh.material.uniforms.planetCenter.value.copy(p.getWorldPosition(z))}for(const o of i)o.mesh.getWorldPosition(z),o.material.uniforms.ringCenter.value.copy(z),o.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(o.mesh.matrixWorld).normalize();if(O&&e-fo>1e3&&(fo=e,N=Date.now(),Ne(N)),B){const o=ke.get(B.id),p=o.points.length,x=o.times[p-1],T=(o.frame==="earth"?6:25)*864e5,ue=o.marks.some(ye=>ye.at!==void 0&&ye.body&&ye.body!=="earth"&&Math.abs(B.sim-ye.at)<T)?"slow":B.sim>=B.fastFrom?"fast":"normal",de=ue==="slow"?Math.min(B.base,2*T/3):B.base*(ue==="fast"?B.fast:1);B.sim=Math.min(x,B.sim+de*Math.min(t,.1)),o.frame==="sun"?V=(V??B.sim)+Math.min(t,.1)*.15*864e5:V=null,B.pace=ue;const Ue=(B.sim-o.times[0])/(x-o.times[0]||1);let pe=0,Ke=p-1;for(;Ke-pe>1;){const ye=pe+Ke>>1;o.times[ye]<=B.sim?pe=ye:Ke=ye}const We=o.times[Ke]-o.times[pe],be=pe+(We>0?(B.sim-o.times[pe])/We:0),Ae=Math.max(0,Math.min(p-2,Math.floor(be))),mo=be-Ae;o.probe.position.lerpVectors(o.points[Ae],o.points[Ae+1],mo),$t=be,o.probe.lookAt(o.line.localToWorld(o.points[Math.min(p-1,Ae+2)].clone())),o.line.geometry.setDrawRange(0,Ae+2);const wn=o.times[Ae]+(o.times[Ae+1]-o.times[Ae])*mo;O=!1,N=wn,Ne(wn);let Jt=0;for(let ye=0;ye<o.marks.length;ye+=1){const ho=o.marks[ye],ea=ho.at??o.times[Math.min(p-1,ho.index)];B.sim>=ea-T&&(Jt=ye)}if((Jt!==B.mark||e-B.lastPing>250||B.sim>=x&&!B.done)&&(B.mark=Jt,B.lastPing=e,B.sim>=x&&(B.done=!0),y.onFlight?.({id:B.id,mark:o.marks[Jt],progress:Ue,time:wn,done:B.done,pace:B.pace})),B.done){const ye=o.frame==="earth";B=null,V=null,O=!0,Pe=ye?Le.get("earth")??null:null,ye||J.target.set(0,0,0),J.radius=ye?4.2:72,Z.phi=ye?.7:.45}}if(Pe&&J.target.copy(Pe.getWorldPosition(z)),B){const o=ke.get(B.id);let p=null,x=1/0;for(const Y of o.marks){if(!Y.body||Y.body==="earth"||Y.body==="far")continue;const ue=Math.abs(Y.index-$t);ue<14&&ue<x&&(p=Y,x=ue)}const T=p?Le.get(p.body):void 0;if(T){const Y=T.getWorldPosition(Zo).add(o.probe.getWorldPosition(Jo)).multiplyScalar(.5);J.target.copy(Y),J.radius=o.frame==="earth"?1.6:4.2}else J.radius=o.frame==="earth"?1.5:2.8}if(St.lerp(J.target,1-Math.pow(.002,t)),Z.radius+=(J.radius-Z.radius)*(1-Math.pow(.004,t)),De&&je){const o=_e.get(ve)?.getWorldPosition(co)??co.set(0,0,0);De.copy(je.getWorldPosition(Qo).sub(o).normalize());const p=Math.atan2(De.x,De.z),x=Math.acos(Math.max(-1,Math.min(1,De.y)));let T=p-Z.theta;T=Math.atan2(Math.sin(T),Math.cos(T)),Z.theta+=T*(1-Math.pow(.01,t)),Z.phi+=(x-Z.phi)*(1-Math.pow(.01,t))}if($==="blackhole"&&rt.update(e/1e3,w),$==="exo"){const o=e/1e3;for(const p of fn){const x=p.phase0+o/p.period*Math.PI*2;p.mesh.position.set(Math.cos(x)*p.a,0,Math.sin(x)*p.a)}}if($==="eclipse"){cn=(cn+t*.18)%1;const o=Math.sin(cn*Math.PI*2),p=Math.abs(o)<.22,x=Math.max(0,1-Math.abs(o)/.9),T=Rn==="lunar";if(pt.visible=!it,Xt.visible=it,K.skySun.visible=!T,K.skyMoon.visible=T,it)T?(K.skyMoon.position.set(o*1.7,0,.08),K.skyMoonMat.color.set("#f2f2f2").lerp(new _("#c47462"),T?x:0)):K.skyCover.position.set(o*1.7,0,.08);else{K.moon.position.set(T?2.75:1.05,o*.55,0),K.cone.visible=!T,K.umbra.visible=T,K.shadow.opacity=p?.42:.08,K.umbra.material.opacity=p?.42:.08,K.moonMat.color.set("#ffffff").lerp(new _("#c47462"),T?x:0);const Y=p?b("개기"):Math.abs(o)<.6?b("부분"):T?b("반영"):"";It.textContent!==Y&&(It.textContent=Y)}}if(w.position.set(St.x+Z.radius*Math.sin(Z.phi)*Math.sin(Z.theta),St.y+Z.radius*Math.cos(Z.phi),St.z+Z.radius*Math.sin(Z.phi)*Math.cos(Z.theta)),w.lookAt(St),Wt&&(Wt.getWorldPosition(z),He.copy(z).multiplyScalar(-1).normalize(),e-gn>500&&!(B&&ke.get(B.id)?.frame==="sun"))){gn=e;const o=Aa(new Date(N)),p=Math.atan2(o.y,o.x),x=Math.atan2(-He.z,He.x),T=Wt.children[0];T.rotation.y=x-p}et&&mn&&$!=="blackhole"&&($!=="system"||ve==="system"||ve==="sun")&&et?(et.render(t),oo+=1,ao+=t,oo===90&&ao/90>.034&&(mn=!1)):W.render(S,w),w.getWorldDirection(ht),M();const h=[];for(const o of le){const p=Rt.get(o),x=Le.get(o);if(!p||!x)continue;x.getWorldPosition(z);const T=Pt.copy(z).sub(w.position).dot(ht)>0,Y=ve==="system"&&$==="system"&&(!Pe||B!==null),ue=ve==="earth"||ve==="moon"||B!==null&&ke.get(B.id)?.frame==="earth";let de=T&&(o==="moon"?$==="system"&&ue:Y||ue&&o==="earth"&&B!==null);z.project(w);const Ue=(z.x+1)/2*X.w;let pe=Ue;const Ke=(1-z.y)/2*X.h+10;if(de){let We=ae.get(o)??0;We||(p.style.display="block",We=p.offsetWidth||40,ae.set(o,We)),pe=Math.min(Math.max(Ue,We/2+4),Math.max(We/2+4,X.w-We/2-4));const be={x:pe-We/2,y:Ke,w:We,h:22};C(be.x,be.y,be.w,be.h)||h.some(Ae=>be.x<Ae.x+Ae.w+4&&be.x+be.w+4>Ae.x&&be.y<Ae.y+Ae.h&&be.y+be.h>Ae.y)?de=!1:h.push(be)}p.style.display=de?"block":"none",de&&(p.style.transform=`translate(${pe}px, ${Ke}px) translate(-50%, 0)`)}const k=$==="system",R=ve!=="system"&&ve!=="jupiter"&&ve!=="saturn",D=Pe!==null&&(B===null?Pe===Le.get("earth"):ke.get(B.id)?.frame==="earth");for(const o of l)o.visible=!R&&!D;for(const[o,p]of yt){const x=ut.get(o),T=p.parent?Le.get(p.parent)===Pe:ve==="system"&&(!Pe||Pe===x),Y=Pe===x||T;x.getWorldPosition(z);const ue=Pt.copy(z).sub(w.position).dot(ht)>0,de=k&&ue&&Y;z.project(w),p.el.style.display=de?"block":"none",de&&(p.el.style.transform=`translate(${(z.x+1)/2*X.w}px, ${(1-z.y)/2*X.h+8}px) translate(-50%, 0)`)}for(const[o,p]of ke){const x=k&&U===o;if(p.line.visible=x,!x){p.el.style.display="none";continue}p.probe.getWorldPosition(z);const T=Pt.copy(z).sub(w.position).dot(ht)>0;z.y+=0,z.project(w),p.el.style.display=T?"block":"none",T&&(p.el.style.transform=`translate(${(z.x+1)/2*X.w}px, ${(1-z.y)/2*X.h}px) translate(10px, -50%)`)}for(const o of Vn){if($!=="stars"){o.el.style.display="none";continue}z.copy(o.at);const p=Pt.copy(z).sub(w.position).dot(ht)>0;z.project(w);const x=p&&Math.abs(z.x)<1&&Math.abs(z.y)<1;o.el.style.display=x?"block":"none",x&&(o.el.style.transform=`translate(${(z.x+1)/2*X.w}px, ${(1-z.y)/2*X.h}px) translate(-50%, -50%)`)}for(const o of dn){if(!(o.level===$)){o.el.style.display="none";continue}z.copy(o.marker.position);const x=Pt.copy(z).sub(w.position).dot(ht)>0;z.project(w),o.el.style.display=x?"block":"none",x&&(o.el.style.transform=`translate(${(z.x+1)/2*X.w}px, ${(1-z.y)/2*X.h+8}px) translate(-50%, 0)`)}for(const o of fn){if($!=="exo"){o.el.style.display="none";continue}o.mesh.getWorldPosition(z);const p=Pt.copy(z).sub(w.position).dot(ht)>0;z.project(w),o.el.style.display=p?"block":"none",p&&(o.el.style.transform=`translate(${(z.x+1)/2*X.w}px, ${(1-z.y)/2*X.h+8}px) translate(-50%, 0)`)}for(const o of Oo){if($!=="blackhole"){o.el.style.display="none";continue}z.copy(o.at),rt.group.localToWorld(z),z.project(w);const p=z.z<1&&Math.abs(z.x)<1.05&&Math.abs(z.y)<1.05;o.el.style.display=p?"block":"none",p&&(o.el.style.transform=`translate(${(z.x+1)/2*X.w}px, ${(1-z.y)/2*X.h}px) translate(-50%, -100%)`)}for(const o of On){if($!=="exo"){o.el.style.display="none";continue}z.copy(o.at).project(w);const p=z.z<1&&Math.abs(z.x)<1.05&&Math.abs(z.y)<1.05;o.el.style.display=p?"block":"none",p&&(o.el.style.transform=`translate(${(z.x+1)/2*X.w}px, ${(1-z.y)/2*X.h}px) translate(-50%, -100%)`)}for(const[o,p]of[[un,$==="eclipse"&&!it],[Ln,$==="sizes"]])for(const x of o){if(!p){x.el.style.display="none";continue}z.copy(x.at).applyMatrix4(x.group.matrixWorld).project(w);let T=z.z<1&&Math.abs(z.x)<1.1&&Math.abs(z.y)<1.1;const Y=(z.x+1)/2*X.w,ue=(1-z.y)/2*X.h,de=x.el.offsetWidth||44;T&&C(Y-de/2,ue-11,de,22)&&(T=!1),x.el.style.display=T?"block":"none";const Ue=x.group.rotation.z!==0;T&&(x.el.style.transform=`translate(${(z.x+1)/2*X.w}px, ${(1-z.y)/2*X.h}px) ${Ue?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const o of Oe){o.mesh.getWorldPosition(z);const p=_e.get(o.parent);p?p.getWorldPosition(hn):hn.set(0,0,0);let T=qo.copy(z).sub(hn).normalize().dot(Ko.copy(w.position).sub(z).normalize())>.15&&$==="system"&&ve===o.parent;z.project(w),T&&C((z.x+1)/2*X.w+8,(1-z.y)/2*X.h-11,90)&&(T=!1),o.el.style.display=T?"block":"none",T&&(o.el.style.transform=`translate(${(z.x+1)/2*X.w}px, ${(1-z.y)/2*X.h}px) translate(8px, -50%)`)}};return vn=requestAnimationFrame(po),Se===0&&y.onReady?.(),{focus:Xn,setLevel:Yt,setPaused:e=>{$n=e},focusMarker:e=>{const t=dn.find(n=>n.level===$&&n.marker.id===e);t&&(J.target.copy(t.marker.position),J.radius=bt[$]*(e==="cmb"?1.4:$==="group"?.6:.42),Qe=performance.now())},showSite:Vo,focusExtra:jo,setEclipse:(e,t)=>{Rn=e,it=t,Yt("eclipse")},setHemisphere:e=>{ve!=="earth"&&Xn("earth");const t=He.clone().multiplyScalar(e==="day"?1:-1);Z.theta=Math.atan2(t.x,t.z),Z.phi=Math.min(2.6,Math.max(.5,Math.acos(t.y))),De=null,je=null,xt=!0},enterSurface:qn,setSurfaceWorld:Xo,exitSurface:Ho,dropProbe:Kn,setTime:e=>{O=e===null,N=e??Date.now(),Ne(N),gn=-1e9},setVoyage:e=>{if(U=e,!e){B&&(B=null,O=!0),V=null;for(const p of ke.values())p.line.geometry.setDrawRange(0,1/0);return}$!=="system"&&Yt("system"),V=null;const t=ke.get(e);t.line.geometry.setDrawRange(0,2),ve="system",De=null,je=null,xt=!1,Pe=t.probe;const n=t.frame==="earth";J.radius=n?1.3:2.8,Z.phi=n?.75:1;const c=Math.max(...t.marks.filter(p=>p.at!==void 0&&p.body!=="earth").map(p=>p.at),t.times[0]+864e5),h=t.times[0],k=t.times[t.times.length-1],R=(c-h)/(n?20:24),D=t.frame==="earth"?k:c+60*864e5,o=k>D?(k-D)/4/R:1;B={id:e,sim:h,base:R,fastFrom:D,fast:o,mark:-1,done:!1,lastPing:0,pace:"normal"},Qe=performance.now()},dispose:()=>{Re?.dispose(),et?.dispose(),Zt?.dispose(),Q&&(S.remove(Q.group),Q.dispose(),Q=null),cancelAnimationFrame(vn),io.disconnect(),lo.disconnect(),s.removeEventListener("pointerdown",Qn),s.removeEventListener("pointermove",eo),s.removeEventListener("pointerup",Kt),s.removeEventListener("pointercancel",Kt),s.removeEventListener("wheel",to),S.traverse(e=>{const t=e.material;Array.isArray(t)&&t.forEach(n=>n.dispose())}),j.forEach(e=>e.dispose()),W.dispose(),s.remove(),d.remove()}}}export{ps as createSpace};
