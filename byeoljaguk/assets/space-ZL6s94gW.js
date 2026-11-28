import{t as Q,a as Mr}from"./index-CcCmkyWP.js";import{G as Ge,a as $,f as Ve,M as Me,g as it,A as $e,D as ft,V as Y,R as Et,P as Aa,h as Co,d as uo,c as No,S as Eo,b as q,i as cn,j as Dn,k as Fa,l as Na,I as Nn,m as Ea,n as ds,O as qo,N as li,e as _n,o as bs,p as hs,q as wr,L as xr,r as br,s as Ui,t as $o,u as Gi,v as Zo,w as ka,x as as,B as ss,y as Sr,z as Li,F as Tr,T as Oi,H as Ar,J as kr,K as vs,U as Pr,W as gs,X as zr,Y as Rr,Z as Cr,_ as Fr,$ as Nr,a0 as Er,a1 as is,a2 as Dr,C as jo,a3 as ui,a4 as _r,a5 as Ir,a6 as Vr,a7 as Wr,a8 as Ur,a9 as Gr,aa as fi,ab as pi,ac as Lr,ad as Or}from"./three-T5XuNCp-.js";import{af as Br,ag as mi,ah as Hr,ai as rs,aj as di,ak as jr,al as Yr,am as Yo,C as Xr,an as qr,ao as ha,ap as $r}from"./App-5cyyGHvX.js";import{g as Do,U as va,V as Zr}from"./audio-iN7HKGRp.js";import{C as hi}from"./sky-ZnTT3NoC.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";const vi=`
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
`,ga=3,cs=9;function Kr(n){const t=new Ge;t.visible=!1,t.rotation.z=.1;const o=new $(n(new Ve(1,48,32)),n(new Me({color:"#000000"})));o.renderOrder=0,t.add(o);const a=n(new it({uniforms:{uTime:{value:0},uCam:{value:new Y}},transparent:!0,depthWrite:!1,side:ft,blending:$e,vertexShader:`
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
        ${vi}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${ga.toFixed(1)}) / ${(cs-ga).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${ga.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),c=new $(n(new Et(ga,cs,256,8)),a);c.rotation.x=-Math.PI/2,c.renderOrder=1,t.add(c);const y=n(new it({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:$e,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${vi}
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
      `})),r=new $(n(new Aa(8,8)),y);r.renderOrder=2,t.add(r);const h=[{name:Q("궁수자리 A*"),at:new Y(0,3.6,0)},{name:Q("사건의 지평선"),at:new Y(0,-2.9,0)},{name:Q("강착 원반"),at:new Y(cs-1.2,0,0)}],C=new Y;return{group:t,labels:h,update(x,d){a.uniforms.uTime.value=x,y.uniforms.uTime.value=x,d.getWorldPosition(C),a.uniforms.uCam.value.copy(C),r.lookAt(C)}}}const Xo=Math.PI/180;function rn(n,t,o){return new Y(Math.cos(t*Xo)*Math.cos(n*Xo),Math.sin(t*Xo),-Math.cos(t*Xo)*Math.sin(n*Xo)).multiplyScalar(o)}function Jr(){const t=document.createElement("canvas");t.width=64,t.height=64;const o=t.getContext("2d");if(o){const a=o.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,"rgba(255,255,255,1)"),a.addColorStop(.25,"rgba(255,255,255,0.75)"),a.addColorStop(1,"rgba(255,255,255,0)"),o.fillStyle=a,o.fillRect(0,0,64,64)}return new uo(t)}function Qr(){const n=[],t=x=>(n.push(x),x),o=t(Jr());function a(x,d,A){const b=new No(t(new Eo({map:o,color:new q(x),transparent:!0,depthWrite:!1,blending:$e})));return b.scale.setScalar(d),b.position.copy(A),b}function c(x,d,A){const b=new Float32Array(x*3),g=new Float32Array(x*3);for(let G=0;G<x;G+=1){const[Z,B]=d(G);b.set([Z.x,Z.y,Z.z],G*3),g.set([B.r,B.g,B.b],G*3)}const F=t(new cn);return F.setAttribute("position",new Dn(b,3)),F.setAttribute("color",new Dn(g,3)),new Fa(F,t(new Na({size:A,map:o,vertexColors:!0,transparent:!0,depthWrite:!1,blending:$e,sizeAttenuation:!0})))}let y=7;const r=()=>(y=y*16807%2147483647,(y-1)/2147483646),h={},C={};{const x=new Ge,d=2.6,A=[["alphacen",Q("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",Q("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",Q("바너드별"),269.45,4.69,5.96,"#ffb27a",Q("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",Q("울프 359"),164.12,7.01,7.86,"#ff9a6a",Q("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",Q("시리우스"),101.29,-16.72,8.6,"#cfe0ff",Q("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",Q("로스 154"),282.46,-23.84,9.69,"#ffa070",Q("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",Q("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",Q("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",Q("백조자리 61"),316.7,38.75,11.4,"#ffc58a",Q("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",Q("프로키온"),114.83,5.22,11.46,"#fff3d6",Q("작은개자리의 밝은 별이에요.")],["epsind",Q("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",Q("남쪽 하늘의 가까운 별이에요.")],["taucet",Q("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",Q("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];x.add(a("#ffe39a",3.2,new Y));const b=[{id:"sun-star",name:Q("태양"),line:Q("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new Y}];for(const[g,F,G,Z,B,U,S]of A){const J=rn(G,Z,B*d);x.add(a(U,2.4,J)),b.push({id:g,name:F,line:Mr("{0} 거리 약 {1}광년.",S,B),position:J})}x.add(c(500,()=>[new Y(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(60+r()*30),new q().setHSL(.1,.3,.5+r()*.4)],.9)),h.stars=x,C.stars=b}{const x=new Ge,d=1/40,A=[["pleiades",Q("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,Q("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",Q("베텔게우스"),88.79,7.41,548,"#ffab6e",3,Q("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",Q("리겔"),78.63,-8.2,860,"#cfe0ff",3,Q("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",Q("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,Q("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",Q("데네브"),310.36,45.28,2600,"#e6eeff",3,Q("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];x.add(a("#ffe39a",1.6,new Y));const b=[{id:"sun-orion",name:Q("태양"),line:Q("우리은하의 오리온 팔 안쪽에 있어요."),position:new Y}];for(const[g,F,G,Z,B,U,S,J]of A){const v=rn(G,Z,B*d);x.add(a(U,S,v)),g==="orionneb"&&x.add(c(260,()=>{const pe=Math.pow(r(),.6)*5;return[new Y(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(pe).add(v),new q(r()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),b.push({id:g,name:F,line:J,position:v})}x.add(c(1400,()=>{const g=(r()-.5)*120,F=(r()-.5)*22*(.4+r()),G=(r()-.5)*4;return[new Y(g,G,F),new q().setHSL(.6+r()*.1,.3,.35+r()*.3)]},.8)),h.orion=x,C.orion=b}{const x=new Ge,d=4;x.add(c(9e3,b=>{const g=b%d,F=Math.pow(r(),.55)*25,G=g/d*Math.PI*2+Math.log(1+F)*1.9+(r()-.5)*(.5+4/(F+2)),Z=(r()-.5)*(F<4?2.2:.7),B=F<4,U=B?new q("#ffd9a0"):new q().setHSL(.58+r()*.06,.45,.45+r()*.35);return[new Y(Math.cos(G)*F,Z,Math.sin(G)*F),U.multiplyScalar(B?.8:.6)]},.55)),x.add(a("#fff0c8",7,new Y));const A=new Y(13,0,0);x.add(a("#ffe39a",1.2,A)),h.galaxy=x,C.galaxy=[{id:"center",name:Q("은하 중심(궁수자리 A*)"),line:Q("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new Y},{id:"sun-gal",name:Q("태양은 여기"),line:Q("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:A}]}{const x=new Ge,d=1/1e5,A=(B,U,S,J,v)=>c(J,pe=>{const xe=Math.pow(r(),.6)*U,ce=pe%2*Math.PI+Math.log(1+xe*3)*2.2+(r()-.5)*.9,le=new Y(Math.cos(ce)*xe,(r()-.5)*U*.05,Math.sin(ce)*xe);le.applyAxisAngle(new Y(1,0,0),S);const K=xe<U*.18;return[le.add(B),new q().setHSL(K?.1:v,.4,.45+r()*.3).multiplyScalar(K?.35:.22)]},.4),b=new Y;x.add(A(b,2.2,0,1800,.6));const g=rn(10.68,41.27,25e5*d);x.add(A(g,4.4,1.2,3200,.1));const F=rn(23.46,30.66,273e4*d);x.add(A(F,1.6,.6,900,.62));const G=rn(80.89,-69.76,16e4*d);x.add(a("#cfd8ff",1.2,G));const Z=rn(13.19,-72.83,2e5*d);x.add(a("#cfd8ff",.8,Z)),h.group=x,C.group=[{id:"mw",name:Q("우리 은하"),line:Q("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:b},{id:"andromeda",name:Q("안드로메다은하"),line:Q("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:g},{id:"triangulum",name:Q("삼각형자리은하"),line:Q("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:F},{id:"lmc",name:Q("대마젤란은하"),line:Q("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:G}]}{const x=new Ge,d=6,A=(B,U,S)=>new Y(B,U,S).multiplyScalar(d),b=A(5.1,.35,1.1),g=A(3.4,.45,.2),F=A(-1.4,-.3,-.5),G=[[A(.2,0,0),900,6.4*d*.5],[g,280,1.5*d*.5],[F,220,1.7*d*.5],[A(-2.2,1.6,2.4),120,1.1*d*.5]],Z=G.reduce((B,U)=>B+U[1],0);x.add(c(Z+180,B=>{let U=B;for(const[J,v,pe]of G){if(U<v)return[new Y(r()-.5,(r()-.5)*.5,r()-.5).multiplyScalar(2*pe*Math.pow(r(),.5)).add(J),new q("#f3eee6").multiplyScalar(.75)];U-=v}const S=r();return[b.clone().lerp(F,S).add(new Y((r()-.5)*.7*d,(r()-.5)*.45*d,(r()-.5)*.7*d)),new q("#e7c48a").multiplyScalar(.8)]},.5)),x.add(new $(t(new Ve(.95*d,20,16)),t(new Me({color:"#d5e2f5",transparent:!0,opacity:.1,blending:$e,depthWrite:!1}))).translateX(g.x).translateY(g.y).translateZ(g.z)),x.add(new $(t(new Ve(1.05*d,20,16)),t(new Me({color:"#e7c48a",transparent:!0,opacity:.09,blending:$e,depthWrite:!1}))).translateX(F.x).translateY(F.y).translateZ(F.z)),x.add(a("#e4b56a",1.2,b)),h.super=x,C.super=[{id:"localgroup",name:Q("우리 은하군"),line:Q("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:b},{id:"virgo-sc",name:Q("처녀자리 은하단"),line:Q("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:g},{id:"attractor-sc",name:Q("거대 인력체"),line:Q("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:F}]}{const x=new Ge,d=1/1e7,A=rn(187.7,12.4,54e6*d),b=rn(243,-60,2e8*d);x.add(c(5e3,F=>{const G=F%5,B=[A,b,rn(30,20,15e7*d),rn(160,-30,18e7*d),rn(300,40,14e7*d)][G],U=G===1?7:4;return[new Y((r()-.5)*2,(r()-.5)*2,(r()-.5)*2).multiplyScalar(U*Math.pow(r(),.4)).add(B),new q().setHSL(.08+r()*.5,.35,.55).multiplyScalar(.8)]},.8)),x.add(a("#ffffff",.8,new Y));const g=new $(t(new Ve(42,48,32)),t(new Me({color:"#ff8a4a",transparent:!0,opacity:.08,side:Co,depthWrite:!1})));x.add(g),h.cosmos=x,C.cosmos=[{id:"here",name:Q("우리 은하"),line:Q("여기서는 점 하나예요."),position:new Y},{id:"virgo",name:Q("처녀자리 은하단"),line:Q("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:A},{id:"attractor",name:Q("거대 인력체"),line:Q("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:b},{id:"cmb",name:Q("가장 오래된 빛"),line:Q("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new Y(0,0,-42)}]}for(const x of Object.values(h))x.visible=!1;return{groups:h,markers:C,dispose:()=>n.forEach(x=>x.dispose())}}const ya=1.7,gi=n=>{const t=Math.min(1,Math.max(0,n));return t*t*(3-2*t)};function yi(n){try{const t=navigator;typeof t.vibrate=="function"&&t.vibrate(n)}catch{}}function ls(n,t,o){const c=document.createElement("canvas");c.width=128,c.height=128;const y=c.getContext("2d"),r=y.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,n),r.addColorStop(.35,t),r.addColorStop(1,o),y.fillStyle=r,y.fillRect(0,0,128,128);const h=new uo(c);return h.colorSpace=_n,h}function ec(n){const t=new Ge,o=(()=>{let E=2654435769;return()=>(E=E*1664525+1013904223>>>0,E/4294967296)})(),a=ls("rgba(255,255,255,1)","rgba(255,168,64,0.85)","rgba(255,90,0,0)"),c=ls("rgba(120,104,96,0.55)","rgba(70,60,56,0.35)","rgba(40,34,32,0)"),y=ls("rgba(255,255,255,1)","rgba(255,214,160,0.7)","rgba(255,140,40,0)"),r=[a,c,y],h=E=>(r.push(E),E),C=new Ge,x=new $(h(new Nn(1,1)),h(new Me({color:new q(2757128),fog:!1})));x.scale.setScalar(15),C.add(x);const d=new $(h(new Nn(1,1)),h(new Me({color:new q(16742946),transparent:!0,opacity:.85,blending:$e,depthWrite:!1,fog:!1})));d.scale.setScalar(21),C.add(d);const A=(E,R,f,z=$e)=>{const fe=h(new Eo({map:E,color:new q(R),transparent:!0,depthWrite:!1,blending:z,fog:!1})),W=new No(fe);return W.scale.setScalar(f),W},b=A(y,16747050,150);C.add(b);const g=A(a,16765562,70);C.add(g),C.visible=!1,t.add(C);const F=[],G=96;for(let E=0;E<G;E+=1){const R=E%3===0,f=A(R?c:a,R?9074022:16747571,1,R?li:$e);f.visible=!1,t.add(f),F.push({sprite:f,mat:f.material,life:0,max:1,from:1,to:1,rise:0,driftX:1,driftZ:1,spin:0,smoke:R})}let Z=0;const B=(E,R,f,z,fe,W,D)=>{let te=null;for(let Ye=0;Ye<F.length;Ye+=1){const ot=F[(Z+Ye)%F.length];if(ot.smoke===R&&(ot.life<=0||!te)&&(te=ot,Z=(Z+Ye+1)%F.length,ot.life<=0))break}te&&(te.sprite.position.copy(E),te.sprite.visible=!0,te.life=z,te.max=z,te.from=f*.45,te.to=f,te.rise=fe,te.driftX=(o()-.5)*W,te.driftZ=(o()-.5)*W,te.spin=(o()-.5)*1.4,te.sprite.material.rotation=o()*Math.PI*2,te.mat.opacity=R?.46:.55,D!==void 0?te.mat.color.setHex(D):te.mat.color.setHex(R?7035474:16742946),te.sprite.scale.setScalar(te.from))},U=new $(h(new Ve(1,32,20)),h(new Me({color:new q(16757575),transparent:!0,opacity:0,blending:$e,depthWrite:!1,side:ft,fog:!1})));U.visible=!1,t.add(U);const S=new $(h(new Ve(1,24,16)),h(new Me({color:new q(16774872),transparent:!0,opacity:0,blending:$e,depthWrite:!1,side:ft,fog:!1})));S.visible=!1,t.add(S);const J=new $(h(new Ve(1,28,18)),h(new Me({color:new q(16731410),transparent:!0,opacity:0,blending:$e,depthWrite:!1,side:ft,fog:!1})));J.visible=!1,t.add(J);const v=[],pe=(E,R,f,z,fe,W,D)=>{const te=h(new Me({color:new q(f),transparent:!0,opacity:z,blending:$e,depthWrite:!1,side:ft,fog:!1})),Ye=h(new Et(E,R,64,1)),ot=new $(Ye,te);fe&&(ot.rotation.x=-Math.PI/2),ot.visible=!1,t.add(ot);const ve={mesh:ot,mat:te,grow:W,life:0,max:D,flat:fe};return v.push(ve),ve};pe(.92,1,16742946,.9,!0,480,1.3),pe(.9,1,16726538,.75,!0,620,1.9),pe(.86,1,16765066,.7,!0,340,.9),pe(.82,1,11569770,.5,!0,420,2.6),pe(.95,1,16769712,.55,!1,700,1.6);const xe=220,ce=h(new cn),le=new Float32Array(xe*3),K=new Float32Array(xe*3);ce.setAttribute("position",new Dn(le,3));const de=h(new Na({color:new q(16756832),size:2.4,transparent:!0,opacity:0,depthWrite:!1,blending:$e,sizeAttenuation:!0,fog:!1})),Se=new Fa(ce,de);Se.frustumCulled=!1,Se.visible=!1,t.add(Se);const Be=150,ke=new Ea(h(new Nn(1,0)),h(new Me({color:new q(16777215),transparent:!0,opacity:1,fog:!1})),Be);ke.instanceMatrix.setUsage(ds),ke.frustumCulled=!1,ke.visible=!1,t.add(ke);const Ze=[];for(let E=0;E<Be;E+=1)Ze.push({p:new Y,v:new Y,s:1,spin:new Y,rot:new Y});const Te=new qo,Pe=new Ge;Pe.visible=!1,t.add(Pe);const nt=h(new Me({color:new q(1773580),transparent:!0,opacity:0,depthWrite:!1,fog:!1}));nt.blending=li;const dt=h(new Me({color:new q(3809818),transparent:!0,opacity:0,depthWrite:!1,fog:!1})),Qe=h(new Me({color:new q(16734738),transparent:!0,opacity:0,blending:$e,depthWrite:!1,side:ft,fog:!1})),Lt=h(new Me({color:new q(16756832),transparent:!0,opacity:0,blending:$e,depthWrite:!1,fog:!1})),rt=(E,R,f,z)=>{E.rotateX(-Math.PI/2);const fe=n.floorAt(R,f)-n.heightAt(R,f),W=E.attributes.position;for(let D=0;D<W.count;D+=1){const te=W.getX(D),Ye=W.getZ(D);W.setY(D,n.heightAt(R+te,f+Ye)+fe+z)}return W.needsUpdate=!0,E.computeVertexNormals(),E};function ht(E,R,f,z){Pe.clear();const fe=rt(h(new Et(.01,z*1.36,72,10)),E,R,.35),W=new $(fe,nt);W.position.set(E,0,R),Pe.add(W);const D=rt(h(new Et(z*.95,z*1.3,72,3)),E,R,.5),te=new $(D,dt);te.position.set(E,0,R),Pe.add(te);const Ye=rt(h(new Et(z*.42,z*1.1,72,6)),E,R,.42),ot=new $(Ye,Qe);ot.position.set(E,0,R),Pe.add(ot);const ve=rt(h(new Et(.01,z*.45,72,5)),E,R,.45),at=new $(ve,Lt);at.position.set(E,0,R),Pe.add(at),Pe.visible=!0}let be=-1,vt=-1,Ot=new Y,he=new Y,St=!1;function Vn(){for(const E of F)E.life=0,E.sprite.visible=!1}function ee(E,R,f=0,z=0){Vn();const fe=n.floorAt(E,R);he.set(E,fe,R);const W=f||0,D=z||0;Ot.set(E+W*900,fe+520,R+D*900),C.visible=!0,C.position.copy(Ot),U.visible=!1,J.visible=!1;for(const te of v)te.life=0,te.mesh.visible=!1;ke.visible=!1,Se.visible=!1,de.opacity=0,St=!1,vt=-1,be=0,yi([30,90,40])}function X(E,R){if(!(be<0)){if(be+=R,!St&&be>=ya){St=!0,vt=be,yi([140,60,240,70,320,80,420,110,520,160,380]);const f=n.onScar?.(he.x,he.z)??26;n.onImpact?.(),ht(he.x,he.z,he.y,f),U.visible=!0,J.visible=!0,ke.visible=!0,Se.visible=!0,de.opacity=.95;for(const z of v)z.life=z.max,z.mesh.visible=!0,z.mesh.scale.setScalar(4),z.mesh.position.set(he.x,he.y+(z.flat?.6:2),he.z),z.flat||z.mesh.rotation.set(0,0,0);for(let z=0;z<Be;z+=1){const fe=Ze[z],W=o()*Math.PI*2,D=6+o()*34;fe.p.set(he.x+Math.cos(W)*D*.2,he.y+2+o()*8,he.z+Math.sin(W)*D*.2);const te=28+o()*62;fe.v.set(Math.cos(W)*te,26+o()*70,Math.sin(W)*te),fe.s=.7+Math.pow(o(),2)*4.6,fe.spin.set((o()-.5)*6,(o()-.5)*6,(o()-.5)*6),fe.rot.set(o()*3,o()*3,o()*3)}ke.material.opacity=1;for(let z=0;z<Be;z+=1){const fe=z%3===0;ke.setColorAt(z,new q(fe?16747066:z%3===1?8010270:4860444))}ke.instanceColor&&(ke.instanceColor.needsUpdate=!0);for(let z=0;z<xe;z+=1){const fe=o()*Math.PI*2,W=Math.sqrt(o())*90;le[z*3]=he.x+Math.cos(fe)*W,le[z*3+1]=he.y+20+o()*260,le[z*3+2]=he.z+Math.sin(fe)*W,K[z*3]=(o()-.5)*24,K[z*3+1]=-(16+o()*34),K[z*3+2]=(o()-.5)*24}ce.attributes.position.needsUpdate=!0}if(!St){const f=Math.min(1,be/ya),z=Math.pow(f,2.15);C.position.lerpVectors(Ot,he,z);const fe=(1-z)*40;C.position.x+=Math.sin(be*9.1)*fe,C.position.z+=Math.cos(be*7.3)*fe,C.rotation.x+=R*2.2,C.rotation.y+=R*1.4,b.scale.setScalar(150+Math.sin(be*20)*26),g.scale.setScalar(70+Math.sin(be*26)*14);for(let W=0;W<2;W+=1){const D=C.position.clone();D.x+=(o()-.5)*26,D.y+=(o()-.5)*26,D.z+=(o()-.5)*26,B(D,!1,90+o()*60,.9+o()*.5,6,18)}B(C.position.clone(),!0,150+o()*90,1.8+o()*.8,12,26)}for(const f of F){if(f.life<=0)continue;if(f.life-=R,f.life<=0){f.sprite.visible=!1;continue}const z=1-f.life/f.max,fe=f.from+(f.to-f.from)*Math.sqrt(z);f.sprite.scale.setScalar(fe),f.sprite.position.y+=f.rise*R*(1-z),f.sprite.position.x+=f.driftX*R,f.sprite.position.z+=f.driftZ*R,f.sprite.material.rotation+=f.spin*R;const W=f.smoke?Math.pow(1-z,1.8)*.46:Math.pow(1-z,1.3)*.55;f.mat.opacity=W}if(St){const f=be-vt,z=(W,D,te)=>W+(D-W)*gi(f/te);U.scale.setScalar(z(2,46,.85)),U.material.opacity=Math.max(0,1-f/1.9)*.95,S.scale.setScalar(z(1,24,.4)),S.material.opacity=Math.max(0,1-f/.5),U.position.set(he.x,he.y+8,he.z),S.position.set(he.x,he.y+10,he.z),J.scale.setScalar(z(3,34,1)),J.material.opacity=Math.max(0,.6-f/1.3*.6),J.position.set(he.x,he.y+4,he.z);for(const W of v){if(W.life<=0)continue;if(W.life-=R,W.life<=0){W.mesh.visible=!1;continue}const D=1-W.life/W.max;W.mesh.scale.setScalar(4+W.grow*Math.pow(D,.6)),W.mat.opacity=Math.max(0,(1-D)*(W.flat?.85:.6))}if(f<1.8&&f%.085<R){const W=new Y(he.x+(o()-.5)*18,he.y+3+o()*6,he.z+(o()-.5)*18);o()<.65&&B(W,!1,76+o()*56,1.4+o()*.7,14+o()*12,20,16761962),B(W,!0,60+o()*46,1.8+o()*.8,12+o()*10,26,11573898)}if(f<1.7&&f%.05<R){const W=o()*Math.PI*2,D=26+f*46+o()*22,te=new Y(he.x+Math.cos(W)*D,he.y+2+o()*12,he.z+Math.sin(W)*D);B(te,!0,50+o()*40,1.6,7,14,11573376),o()<.55&&B(te,!1,70+o()*60,1.3,10,10,16751164)}if(f>.4&&f<2.8&&f%.11<R){const W=o()*Math.PI*2,D=16+o()*46,te=new Y(he.x+Math.cos(W)*D,he.y+34+o()*30,he.z+Math.sin(W)*D);B(te,!0,70+o()*52,2,8,24,10520692)}const fe=ke.material;if(fe.opacity=Math.max(0,1-Math.max(0,f-3.4)/1.2),fe.opacity<=.01)ke.visible=!1;else{for(let W=0;W<Be;W+=1){const D=Ze[W];D.v.y-=9.81*.55*R,D.v.multiplyScalar(1-R*.12),D.p.addScaledVector(D.v,R);const te=n.floorAt(D.p.x,D.p.z)+D.s*.4;D.p.y<te&&(D.p.y=te,D.v.y=Math.abs(D.v.y)*.32,D.v.x*=.7,D.v.z*=.7),D.rot.x+=D.spin.x*R,D.rot.y+=D.spin.y*R,D.rot.z+=D.spin.z*R,Te.position.copy(D.p),Te.rotation.set(D.rot.x,D.rot.y,D.rot.z),Te.scale.setScalar(D.s),Te.updateMatrix(),ke.setMatrixAt(W,Te.matrix)}ke.instanceMatrix.needsUpdate=!0}if(Se.visible)if(de.opacity=Math.max(0,.95-Math.max(0,f-4)/1.6),de.opacity<=.01)Se.visible=!1;else{for(let W=0;W<xe;W+=1){const D=W*3;le[D]+=K[D]*R,le[D+1]+=K[D+1]*R,le[D+2]+=K[D+2]*R,K[D+1]-=5*R;const te=n.floorAt(le[D],le[D+2])+.4;le[D+1]<te&&(le[D]=he.x+(o()-.5)*160,le[D+1]=he.y+120+o()*160,le[D+2]=he.z+(o()-.5)*160,K[D]=(o()-.5)*20,K[D+1]=-(14+o()*26),K[D+2]=(o()-.5)*20)}ce.attributes.position.needsUpdate=!0}nt.opacity=Math.min(.42,f*1.1),dt.opacity=Math.min(.4,f*1.1),Qe.opacity=Math.max(0,.85*Math.exp(-f/5.5)),Lt.opacity=Math.max(0,.9*Math.exp(-f/1.8))}if(St&&(C.visible=!1),be>80){be=-1,vt=-1,C.visible=!1,U.visible=!1,S.visible=!1,J.visible=!1,Pe.visible=!1;for(const f of F)f.life=0,f.sprite.visible=!1;for(const f of v)f.life=0,f.mesh.visible=!1;ke.visible=!1,Se.visible=!1}}}return{group:t,strike:ee,doom:()=>{if(be<0)return 0;if(!St)return Math.min(1,gi(be/(ya*.82))*(.93+.07*Math.sin(be*12)));const E=be-vt;return E<1.8?1:Math.max(0,1-(E-1.8)/20)},flash:()=>{if(!St)return 0;const E=be-vt,R=Math.exp(-E/.16),f=E>.35?.5*Math.exp(-(E-.35)/.3):0;return Math.min(1,R+f)},shake:()=>{if(be<0)return 0;if(!St)return .02+Math.pow(be/ya,3)*.18;const E=be-vt;if(E>3.6)return 0;let R=1.55*Math.exp(-E/1.35);return R+=.55*Math.exp(-Math.pow((E-1.55)/.22,2)),R+=.32*Math.exp(-Math.pow((E-2.35)/.26,2)),R+=.18*Math.exp(-Math.pow((E-3)/.3,2)),R*Math.min(1,E/.06)},sinceImpact:()=>vt>=0?be-vt:-1,stats:()=>{const E=F.filter(f=>f.life>0),R=E[0];return{t:Number(be.toFixed(2)),target:[Number(he.x.toFixed(1)),Number(he.y.toFixed(1)),Number(he.z.toFixed(1))],start:[Number(Ot.x.toFixed(1)),Number(Ot.z.toFixed(1))],alive:E.length,map:R?!!R.mat.map:null,op:R?Number(R.mat.opacity.toFixed(2)):null,sc:R?Number(R.sprite.scale.x.toFixed(1)):null,pos:R?R.sprite.position.toArray().map(f=>Number(f.toFixed(1))):null,vis:R?R.sprite.visible:null,fire:[Number(U.material.opacity.toFixed(2)),Number(U.scale.x.toFixed(0)),U.visible],crater:[Pe.visible,Pe.children.length,Number(nt.opacity.toFixed(2)),Number(Qe.opacity.toFixed(2))]}},update:X,dispose:()=>{t.clear(),r.forEach(E=>E.dispose())}}}const tc=`
uniform float uTile;
uniform float uCurve;
varying vec3 vColor;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vColor = color;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  // 로켓이 높이 오르면 지면이 행성처럼 둥글게 휘어 보입니다.
  // 그리는 모양만 휘고, 밟는 지형 높이(meshHeightAt)는 그대로라 걷기·착륙에는 영향이 없습니다.
  wp.y -= uCurve * dot(wp.xz, wp.xz);
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
`,nc=`
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
// 높이 오를 때의 행성 표면(바다·구름)과 대기 림 빛
uniform float uOrbit;
uniform float uSea;
uniform float uCloudy;
uniform vec3 uSeaColor;
uniform vec3 uCloudColor;
uniform vec3 uRimColor;
uniform float uRim;
uniform float uRimDist;
varying vec3 vColor;
varying vec2 vUv;
varying vec3 vWorld;

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), u.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm2(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

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
  // 높이 올라가면 발밑 가까운 땅은 그대로 두고, 멀리 보이는 지표만 행성 표면처럼
  // 바다·구름 얼룩을 입혀 아래로 둥글게 내려다보이는 행성 본체로 만듭니다.
  // (안개를 먹이기 전의 땅 색으로 그려야 먼 지표가 뿌옇게 죽지 않습니다.)
  float orbit = 0.0;
  if (uOrbit > 0.001) {
    orbit = uOrbit * smoothstep(50.0, 220.0, dist);
    if (orbit > 0.001) {
      vec2 p = vWorld.xz;
      // 화면에 들어오는 지표가 수백 m 라, 그 안에서 몇 덩이가 보이도록 무늬를 촘촘하게 잡습니다.
      float land = smoothstep(0.44, 0.56, fbm2(p * 0.0048 + vec2(4.3, 1.1)));
      vec3 body = mix(col * 0.62, uSeaColor, (1.0 - land) * uSea);
      float cloud = smoothstep(0.40, 0.62, fbm2(p * 0.0062 + vec2(9.1, 3.7)) * 0.6 + fbm2(p * 0.0021 + vec2(1.7, 7.9)) * 0.4);
      body = mix(body, uCloudColor, cloud * uCloudy);
      col = mix(col, body, orbit);
    }
  }
  float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  // 높이 오르면 공기층이 얇아져 원거리 안개가 걷힙니다(아래 행성의 색이 살아나게).
  // 지평선 근처가 뿌옇게 뜨지 않도록, 궤도에서 내려다볼 때는 안개를 조금 더 걷어 냅니다.
  col = mix(col, uFogColor, clamp(fog * (1.0 - uOrbit * 0.94), 0.0, 1.0));
  // 지평선(림)을 따라 대기권이 두껍게 보이는 파란 띠. 가장자리에 가깝게 모아 좁게 빛납니다.
  if (uRim > 0.001) {
    float rim = smoothstep(uRimDist * 0.95, uRimDist * 1.0, dist);
    col = mix(col, uRimColor, clamp(pow(rim, 2.0) * uRim, 0.0, 1.0));
  }
  col += (fract(sin(dot(vWorld.xz, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.006;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,oc=`
uniform float uTile;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vUv = wp.xz / uTile;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,ac=`
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
`,Mi=`
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
`,wi=`
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
`,Ao=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,us=`
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
`,Ma=`
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
`,nn=Math.PI*2,Bi=9,sc=140;function ln(n){return n<0?0:n>1?1:n}function Pa(n,t,o){return n<t?t:n>o?o:n}function In(n,t,o){const a=ln((o-n)/(t-n));return a*a*(3-2*a)}function Xn(n,t,o){let a=Math.imul(n|0,374761393)^Math.imul(t|0,668265263)^Math.imul(o|0,2246822519);return a=Math.imul(a^a>>>13,1274126177),((a^a>>>16)>>>0)/4294967295}function ic(n,t,o,a){const c=Math.floor(n),y=Math.floor(t),r=n-c,h=t-y,C=r*r*(3-2*r),x=h*h*(3-2*h),d=Math.max(1,Math.round(o)),A=J=>(J%d+d)%d,b=A(c),g=A(c+1),F=A(y),G=A(y+1),Z=Xn(b,F,a),B=Xn(g,F,a),U=Xn(b,G,a),S=Xn(g,G,a);return(Z+(B-Z)*C)*(1-x)+(U+(S-U)*C)*x}function un(n,t,o,a,c){let y=0,r=.5,h=0,C=o;for(let x=0;x<a;x+=1)y+=r*ic(n*C,t*C,C,c+x*17),h+=r,r*=.5,C*=2;return y/h}function Hi(n){let t=n>>>0||1;return()=>(t=Math.imul(t,1664525)+1013904223>>>0,t/4294967296)}function _o(n,t){const o=document.createElement("canvas");o.width=n,o.height=t;const a=o.getContext("2d");if(!a)throw new Error("2D canvas is unavailable");return{canvas:o,ctx:a}}const rc={crater:{seed:101,macro:.38,mid:.17,fine:.12,speck:.15,craters:20,stones:90,cracks:0,ripples:0,gloss:.02},rock:{seed:211,macro:.4,mid:.22,fine:.14,speck:.2,craters:5,stones:150,cracks:9,ripples:1,gloss:.05},volcano:{seed:331,macro:.32,mid:.24,fine:.16,speck:.22,craters:4,stones:110,cracks:14,ripples:0,gloss:.08},ice:{seed:401,macro:.26,mid:.2,fine:.2,speck:.16,craters:5,stones:18,cracks:22,ripples:0,gloss:.5},plain:{seed:509,macro:.3,mid:.15,fine:.1,speck:.13,craters:8,stones:70,cracks:3,ripples:.35,gloss:.03},plasma:{seed:601,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0},ring:{seed:701,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0}};function za(n,t,o,a,c,y,r,h,C=!1){const x=Math.ceil(y),d=Math.round(a),A=Math.round(c);for(let b=-x;b<=x;b+=1)for(let g=-x;g<=x;g+=1){const F=(g*g+b*b)/(y*y);if(F>=1)continue;const G=C?Math.sqrt(1-F):1-F,Z=((d+g)%o+o)%o,U=((A+b)%o+o)%o*o+Z;n[U]+=r*G,t[U]+=h*G}}function cc(n,t,o,a,c,y,r){const h=.09+r()*.12,C=.05+r()*.06,x=.72+r()*.5,d=r()*Math.PI,A=Math.cos(d),b=Math.sin(d),g=Math.ceil(y*1.4),F=Math.round(a),G=Math.round(c);for(let Z=-g;Z<=g;Z+=1)for(let B=-g;B<=g;B+=1){const U=(B*A+Z*b)/y,S=(-B*b+Z*A)/(y*x),J=Math.sqrt(U*U+S*S);if(J>1.4)continue;let v=0,pe=0;J<1&&(v-=Math.pow(1-J*J,1.25)*h,pe-=(1-J)*.05);const xe=Math.exp(-Math.pow((J-1.02)/.2,2))*C;v+=xe,pe+=xe*1.1+(J>1&&J<1.35?.02:0);const ce=((F+B)%o+o)%o,K=((G+Z)%o+o)%o*o+ce;t[K]+=v,n[K]+=pe}}function fs(n,t,o,a,c,y,r,h,C,x){const A=Math.max(2,Math.floor(r/1.1));let b=y,g=a,F=c;for(let G=0;G<A;G+=1){b+=(C()-.5)*.3,g+=Math.cos(b)*1.1,F+=Math.sin(b)*1.1;const Z=h*(.6+C()*.8);x?(za(n,t,o,g,F,Z*2.2,.03,.008),za(n,t,o,g,F,Z,-.05,-.03)):za(n,t,o,g,F,Z,-.07,-.03)}}function lc(n,t){const o=rc[n],a=Hi(o.seed),c=t/Bi,y=new Float32Array(t*t),r=new Float32Array(t*t),h=new Float32Array(t*t),C=7;for(let g=0;g<t;g+=1){const F=g/t;for(let G=0;G<t;G+=1){const Z=G/t,B=g*t+G,U=un(Z,F,3,4,o.seed),S=un(Z,F,11,3,o.seed+13),J=un(Z,F,43,2,o.seed+29),v=Xn(G,g,o.seed+71)-.5;let pe=1+(U-.5)*o.macro+(S-.5)*o.mid+(J-.5)*o.fine+v*o.speck,xe=.5+(U-.5)*.06+(S-.5)*.07+(J-.5)*.08+v*.03,ce=o.gloss;if(o.ripples>0){const le=F*C+(U-.5)*.85+(S-.5)*.3,K=Math.sin(le*nn);pe+=K*.055*o.ripples,xe+=K*.018*o.ripples}if(n==="volcano"){const le=1-Math.abs(2*J-1);le>.94?(pe+=(le-.94)*2.2,xe-=.02,ce+=.1):le<.22&&(pe-=(.22-le)*.6)}n==="ice"&&(Math.abs(S-.5)<.012&&(pe-=.24,xe-=.035),pe=.82+(pe-1)*.95+(J-.5)*.12,ce=ln(.35+J*.55)),(n==="crater"||n==="ring")&&U<.34&&(pe-=(.34-U)*1.1),n==="plain"&&(pe+=In(.55,.78,U)*.18),y[B]=pe,r[B]=xe,h[B]=ce}}for(let g=0;g<o.craters;g+=1){const F=(.3+Math.pow(a(),1.7)*1.1)*c;cc(y,r,t,a()*t,a()*t,F,a)}for(let g=0;g<o.stones;g+=1){const G=(a()<.18?.14+a()*.3:.03+a()*.09)*c,Z=g%3===0?.12:-.08;za(y,r,t,a()*t,a()*t,Math.max(.8,G),Z,.02+G*.0012,!0)}for(let g=0;g<o.cracks;g+=1){const F=a()*t,G=a()*t,Z=(.6+a()*3.4)*c;fs(y,r,t,F,G,a()*nn,Z,.8+a()*1.4,a,n==="ice")}if(n==="ice"){const g=()=>.5;for(let F=0;F<11;F+=1){const G=a()*nn,Z=t*(.45+a()*.75),B=a()*t,U=a()*t;fs(y,r,t,B-Math.cos(G)*Z*.5,U-Math.sin(G)*Z*.5,G,Z,1+a()*1.4,g,!0)}for(let F=0;F<10;F+=1){const G=a()*t,Z=a()*t,B=a()*nn;fs(y,r,t,G,Z,B,(.4+a()*1.6)*c,.8+a(),a,!0)}}const{canvas:x,ctx:d}=_o(t,t),A=d.createImageData(t,t),b=A.data;for(let g=0;g<t*t;g+=1)b[g*4]=Math.round(Pa(y[g]*.5,0,1)*255),b[g*4+1]=Math.round(Pa(r[g],0,1)*255),b[g*4+2]=Math.round(Pa(h[g],0,1)*255),b[g*4+3]=255;return d.putImageData(A,0,0),x}function qe(n){const t=parseInt(n.replace("#",""),16);return[t>>16&255,t>>8&255,t&255]}function Zt(n,t,o){return[n[0]+(t[0]-n[0])*o,n[1]+(t[1]-n[1])*o,n[2]+(t[2]-n[2])*o]}function uc(n,t,o){const a=n*t,c=Math.floor(a),y=a-c,r=A=>{const b=(A%2+2)%2===0,g=Xn(A,7,o);return b?.56+.4*g:.04+.3*g},h=r(c),C=r(c-1),x=r(c+1),d=.44;return y<d?C+(h-C)*In(0,1,y/d):y>1-d?h+(x-h)*In(0,1,(y-(1-d))/d):h}const ys={jupiter:{bands:16,seed:3301,streaky:.8,polar:null,spots:[{u:.62,v:.66,ru:.085,rv:.05,color:qe("#a8492f"),swirl:2},{u:.24,v:.34,ru:.05,rv:.026,color:qe("#f6efdd"),swirl:0},{u:.46,v:.4,ru:.035,rv:.02,color:qe("#fbf3e1"),swirl:0},{u:.83,v:.44,ru:.03,rv:.018,color:qe("#f4ecd9"),swirl:0},{u:.36,v:.74,ru:.06,rv:.03,color:qe("#8d4b30"),swirl:0}]},saturn:{bands:20,seed:3307,streaky:.38,polar:qe("#c9d4d8"),spots:[{u:.7,v:.3,ru:.04,rv:.02,color:qe("#f7edd2"),swirl:0},{u:.3,v:.72,ru:.035,rv:.018,color:qe("#e6d3a4"),swirl:0}]},uranus:{bands:7,seed:3313,streaky:.25,polar:qe("#e6fbfd"),spots:[{u:.55,v:.36,ru:.06,rv:.03,color:qe("#dcf4f6"),swirl:0}]},neptune:{bands:9,seed:3319,streaky:.5,polar:qe("#a9c8f2"),spots:[{u:.34,v:.62,ru:.06,rv:.032,color:qe("#1f3a72"),swirl:1},{u:.72,v:.46,ru:.05,rv:.012,color:qe("#e9f3ff"),swirl:0},{u:.62,v:.36,ru:.035,rv:.009,color:qe("#f2f8ff"),swirl:0}]}};function fc(n,t,o,a=2){const c=new Uint8ClampedArray(n.length);for(let y=0;y<a;y+=1){for(let r=0;r<o;r+=1)for(let h=0;h<t;h+=1){const C=(h-1+t)%t*4,x=h*4,d=(h+1)%t*4,A=r*t*4;for(let b=0;b<3;b+=1)c[A+x+b]=(n[A+C+b]+n[A+x+b]*2+n[A+d+b])/4}for(let r=0;r<o;r+=1){const h=(r-1+o)%o*t*4,C=r*t*4,x=(r+1)%o*t*4;for(let d=0;d<t;d+=1){const A=d*4;for(let b=0;b<3;b+=1)n[C+A+b]=(c[h+A+b]+c[C+A+b]*2+c[x+A+b])/4}}}}function ji(n,t,o){const a=ys[n.id]??ys.jupiter,c=qe(n.ground),y=qe(n.ground2),r=qe(n.ground3),{canvas:h,ctx:C}=_o(t,o),x=C.createImageData(t,o),d=x.data,A=a.seed,b=new Float32Array(t*o),g=new Float32Array(t*o);for(let B=0;B<o;B+=1){const U=B/o;for(let S=0;S<t;S+=1){const J=S/t,v=(un(J,U,4,3,A)-.5)*.03+(un(J,U,13,2,A+7)-.5)*.005,pe=ln(U+v);let xe=uc(pe,a.bands,A);const ce=un(J*3,U*9,9,3,A+31)-.5;xe+=ce*.13*a.streaky;let le;if(xe<.5?le=Zt(r,y,ln(xe*2)):le=Zt(y,c,ln((xe-.5)*2)),a.polar){const de=In(.82,1,Math.abs(U-.5)*2);le=Zt(le,a.polar,de*.45)}for(const de of a.spots){const Se=(J-de.u)/de.ru,Be=(U-de.v)/de.rv,ke=Se*Se+Be*Be;if(ke<2.2){const Ze=In(1.05,.25,ke),Te=de.swirl>0?.82+.18*Math.sin(Math.atan2(Be,Se)*3+ke*7):1;le=Zt(le,[de.color[0]*Te,de.color[1]*Te,de.color[2]*Te],Ze*.92)}}const K=(B*t+S)*4;d[K]=le[0],d[K+1]=le[1],d[K+2]=le[2],d[K+3]=255,b[B*t+S]=ln(.5+ce*.85+(xe-.5)*.5),g[B*t+S]=.5+ce*.85}}const F=n.sunAz*Math.PI/180,G=Math.sin(F),Z=-Math.cos(F);for(let B=0;B<o;B+=1){const U=(B+1)%o,S=(B-1+o)%o;for(let J=0;J<t;J+=1){const v=(J+1)%t,pe=(J-1+t)%t,xe=g[B*t+v]-g[B*t+pe],ce=g[U*t+J]-g[S*t+J],le=Pa(1+(xe*G+ce*Z)*1.8,.9,1.1),K=(B*t+J)*4;d[K]=Math.min(255,d[K]*le),d[K+1]=Math.min(255,d[K+1]*le),d[K+2]=Math.min(255,d[K+2]*le),d[K+3]=Math.round(ln(.74+b[B*t+J]*.4)*255)}}return fc(d,t,o,2),C.putImageData(x,0,0),h}function pc(n,t){if(ys[n.id])return ji(n,t,t);const{canvas:o,ctx:a}=_o(t,t),c=a.createImageData(t,t),y=c.data,r=qe(n.ground),h=qe(n.ground2),C=qe(n.ground3);for(let x=0;x<t;x+=1){const d=x/t;for(let A=0;A<t;A+=1){const b=A/t,g=un(b,d,4,4,9021),F=un(b,d,16,3,9027),G=ln(g*.72+F*.4);let Z=Zt(h,r,In(.25,.72,G));Z=Zt(Z,C,In(.66,.95,G)*.8);const B=(x*t+A)*4;y[B]=Z[0],y[B+1]=Z[1],y[B+2]=Z[2],y[B+3]=255}}return a.putImageData(c,0,0),o}function mc(n,t,o){const{canvas:a,ctx:c}=_o(t,o),y=Hi(n==="moon"?51:n==="pluto"?67:83),r=n==="pluto"?"#cbb6a4":n==="charon"?"#9d9a95":"#9a9691";if(c.fillStyle=r,c.fillRect(0,0,t,o),n==="pluto")c.fillStyle="#f3ece1",c.beginPath(),c.ellipse(t*.56,o*.46,t*.13,o*.16,-.2,0,nn),c.fill(),c.beginPath(),c.ellipse(t*.72,o*.4,t*.07,o*.12,.35,0,nn),c.fill(),c.fillStyle="rgba(96,68,54,0.62)",c.beginPath(),c.ellipse(t*.24,o*.6,t*.2,o*.13,.1,0,nn),c.fill(),c.beginPath(),c.ellipse(t*.2,o*.32,t*.14,o*.1,-.2,0,nn),c.fill();else if(n==="moon")for(let h=0;h<9;h+=1)c.fillStyle=`rgba(58,56,54,${.5+y()*.3})`,c.beginPath(),c.ellipse(y()*t,(.18+y()*.6)*o,(.04+y()*.07)*t,(.03+y()*.06)*o,y()*3,0,nn),c.fill();else c.fillStyle="rgba(120,84,70,0.6)",c.beginPath(),c.ellipse(t*.5,o*.06,t*.4,o*.09,0,0,nn),c.fill();for(let h=0;h<220;h+=1){const C=(2+Math.pow(y(),2.4)*26)*(t/1024),x=y()*t,d=y()*o,A=c.createRadialGradient(x,d,0,x,d,C);A.addColorStop(0,"rgba(38,36,34,0.5)"),A.addColorStop(.72,"rgba(70,66,62,0.28)"),A.addColorStop(.9,"rgba(238,233,224,0.32)"),A.addColorStop(1,"rgba(255,255,255,0)"),c.fillStyle=A,c.beginPath(),c.arc(x,d,C,0,nn),c.fill()}for(let h=0;h<2600;h+=1){const C=(.6+Math.pow(y(),3)*4)*(t/1024);c.fillStyle=y()<.5?"rgba(255,255,255,0.16)":"rgba(30,28,26,0.16)",c.beginPath(),c.arc(y()*t,y()*o,C,0,nn),c.fill()}return a}function dc(n,t){const{canvas:o,ctx:a}=_o(n,t),c=a.createImageData(n,t),y=c.data,r=qe("#0f3f74"),h=qe("#2f8fb0"),C=qe("#3f7a45"),x=qe("#9a8a55"),d=qe("#f2f7fc");for(let A=0;A<t;A+=1){const b=A/t;for(let g=0;g<n;g+=1){const F=g/n,G=F*3.1,Z=b*2.4,B=un(G,Z,4,5,4404)+(un(G*3,Z*3,12,3,4411)-.5)*.18,U=B>.55;let S;if(U){const ce=ln((B-.55)*4.2);S=Zt(C,x,ce*.7),ce>.55&&(S=Zt(S,qe("#cfc9bb"),(ce-.55)*1.6))}else S=Zt(r,h,ln((B-.35)*3.2));const J=In(.86,.98,Math.abs(b-.5)*2);J>0&&(S=Zt(S,d,J));const v=un(F*2,b*6,12,4,4423),pe=In(.56,.82,v)*.72;pe>0&&(S=Zt(S,qe("#fbfdff"),pe));const xe=(A*n+g)*4;y[xe]=S[0],y[xe+1]=S[1],y[xe+2]=S[2],y[xe+3]=255}}return a.putImageData(c,0,0),o}function hc(n,t,o,a){if(n==="earth")return dc(o,a);if(n==="moon"||n==="pluto"||n==="charon")return mc(n,o,a);const c=n==="saturn"?{...t,id:"saturn",ground:"#f2e2ba",ground2:"#c6a978",ground3:"#9b7f52"}:{...t,id:"jupiter",ground:"#e9d6b4",ground2:"#b57d50",ground3:"#8b5a38"};return ji(c,o,a)}function vc(n){const{canvas:o,ctx:a}=_o(n,4),c=a.createImageData(n,4),y=c.data,r=1.11,h=2.36,C=qe("#f6efdd"),x=qe("#c9b48d"),d=qe("#6f6455"),A=[[1.11,1.235,.1,.15],[1.235,1.525,.42,.3],[1.525,1.95,.98,.62],[1.951,2.025,.06,.1],[2.025,2.21,.72,.5],[2.211,2.215,.04,.1],[2.215,2.27,.66,.46],[2.27,2.31,.06,.1],[2.315,2.34,.34,.55]];for(let b=0;b<n;b+=1){const g=b/(n-1),F=r+(h-r)*g;let G=0,Z=.5;for(const[v,pe,xe,ce]of A)if(F>=v&&F<=pe){G=xe,Z=ce,G*=.82+.18*Math.sin((F-v)*820+Math.sin((F-v)*140)*2);break}const B=[1.29,1.44,1.63,1.72,1.88,2.06,2.15,2.24,2.29];for(const v of B)Math.abs(F-v)<.0035&&(G*=.12);G*=.9+.14*Xn(Math.floor(F*900),3,9931);const U=Xn(Math.floor(b/2),7,9931);let S=Zt(x,C,Z);S=Zt(S,d,(1-Math.min(1,G))*.35);const J=.82+U*.3;for(let v=0;v<4;v+=1){const pe=(v*n+b)*4;y[pe]=S[0]*J,y[pe+1]=S[1]*J,y[pe+2]=S[2]*J,y[pe+3]=Math.round(ln(G)*255)}}return a.putImageData(c,0,0),o}const En=new Map;function Ia(n,t,o,a,c,y){const r=new uo(t);for(r.colorSpace=o?_n:bs,r.wrapS=a?hs:wr,r.wrapT=r.wrapS,r.anisotropy=c,r.magFilter=xr,r.minFilter=br,r.generateMipmaps=!0,r.needsUpdate=!0,En.set(n,r);En.size>y;){const h=En.keys().next();if(h.done)break;const C=En.get(h.value);En.delete(h.value),C?.dispose()}return r}function gc(n,t,o){const a=`ground:${n}:${t?"l":"h"}`,c=En.get(a);return c||Ia(a,lc(n,t?320:512),!1,!0,o,6)}function yc(n,t,o){const a=`cloud:${n.id}:${t?"l":"h"}`,c=En.get(a);return c||Ia(a,pc(n,t?512:1024),!0,!0,o,4)}function xi(n,t,o,a){const y=`body:${n??t.id}:${o?"l":"h"}`,r=En.get(y);if(r)return r;const h=o?768:1024;return Ia(y,hc(n,t,h,h/2),!0,!1,a,3)}function ps(n,t){const o=`ring:${n?"l":"h"}`,a=En.get(o);return a||Ia(o,vc(n?1024:2048),!0,!1,t,2)}const Fo=Math.PI/180,lo=1500,wa=2800,Mc=3e-4,bi=-4.3;function xa(n,t){const o=Math.sin(n*127.1+t*311.7)*43758.5453;return o-Math.floor(o)}function Ko(n){return n*n*(3-2*n)}function wc(n,t){const o=Math.floor(n),a=Math.floor(t),c=n-o,y=t-a,r=xa(o,a),h=xa(o+1,a),C=xa(o,a+1),x=xa(o+1,a+1),d=Ko(c),A=Ko(y);return(r*(1-d)+h*d)*(1-A)+(C*(1-d)+x*d)*A}function ba(n,t,o=4){let a=0,c=.5,y=1;for(let r=0;r<o;r+=1)a+=c*wc(n*y,t*y),y*=2.03,c*=.5;return a}function ko(n){let t=n>>>0||1;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function xc(n){let t=2166136261;for(let o=0;o<n.length;o+=1)t=Math.imul(t^n.charCodeAt(o),16777619);return t>>>0}function ms(n,t){const o=n*Fo,a=t*Fo;return new Y(Math.sin(o)*Math.cos(a),Math.sin(a),-Math.cos(o)*Math.cos(a)).normalize()}function bc(){const t=document.createElement("canvas");t.width=128,t.height=128;const o=t.getContext("2d"),a=o.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);a.addColorStop(0,"rgba(255,255,255,1)"),a.addColorStop(.25,"rgba(255,236,196,0.72)"),a.addColorStop(.6,"rgba(255,190,110,0.18)"),a.addColorStop(1,"rgba(255,170,80,0)"),o.fillStyle=a,o.fillRect(0,0,128,128);const c=new uo(t);return c.colorSpace=_n,c}const Sc=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Tc=`
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
`,Ac=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,kc=`
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
`,Pc=8,zc=.55,Si=.34;function Rc(n,t={}){const o=!!t.low,a=t.anisotropy??(o?4:8),c=new Ge,y=[],r=u=>(y.push(u),u);let h=null,C=null,x=null;const d=xc(n.id),A=ko(d),b=r(bc()),g=[],F=[];let G=null,Z=null,B=null,U=null;const S=[],J=[];if(n.terrain==="crater"){for(let u=0;u<(o?16:26);u+=1){const p=A()*Math.PI*2,_=20+Math.sqrt(A())*460,w=16+A()*74;S.push({x:Math.cos(p)*_,z:Math.sin(p)*_,r:w,d:w*(.16+A()*.2)})}for(let u=0;u<(o?26:48);u+=1){const p=A()*Math.PI*2,_=4+Math.pow(A(),.7)*150,w=2.5+Math.pow(A(),1.6)*11;S.push({x:Math.cos(p)*_,z:Math.sin(p)*_,r:w,d:w*(.2+A()*.22)})}}if(n.terrain==="volcano")for(let u=0;u<6;u+=1){const p=A()*Math.PI*2,_=60+A()*380;J.push({x:Math.cos(p)*_,z:Math.sin(p)*_,r:40+A()*90,h:12+A()*34})}if(n.terrain==="rock")for(let u=0;u<5;u+=1){const p=A()*Math.PI*2,_=60+A()*400;J.push({x:Math.cos(p)*_,z:Math.sin(p)*_,r:50+A()*110,h:6+A()*16})}function v(u,p,_,w=4){return(ba(u*_,p*_,w)-.48)*2}function pe(u,p){if(n.terrain==="plasma"||n.terrain==="ring")return 0;const _=Math.hypot(u,p);let w=0;if(n.terrain==="crater"){w=v(u+11,p+7,.004,4)*16+v(u+3,p+17,.0012,2)*34+v(u+5,p+23,.026,3)*3;for(const ue of S){const oe=Math.hypot(u-ue.x,p-ue.z)/ue.r;oe<1&&(w-=ue.d*Math.pow(1-oe*oe,1.5)),oe<1.3&&(w+=ue.d*.28*Math.exp(-Math.pow((oe-1.02)/.17,2)))}}else if(n.terrain==="rock"){w=v(u+5,p+2,.0035,4)*40,w+=(1-Math.abs(v(u,p,.011,3)))*12,w+=v(u+21,p+13,.0011,2)*60,w+=v(u+31,p+41,.028,3)*3.4;for(const ue of J){const oe=Math.hypot(u-ue.x,p-ue.z)/ue.r;oe<1&&(w+=ue.h*Math.pow(1-oe,1.7))}}else if(n.terrain==="volcano"){w=v(u+3,p+8,.005,4)*14+v(u+9,p+1,.0012,2)*22;for(const ue of J){const oe=Math.hypot(u-ue.x,p-ue.z)/ue.r;oe<1&&(w+=ue.h*Math.pow(1-oe,1.25)),oe<.24&&(w-=ue.h*.5*(1-oe/.24))}}else n.terrain==="ice"?w=v(u+9,p+4,.003,4)*9+v(u,p,.012,2)*2.2+v(u+2,p+8,.035,3)*1.1:w=v(u+7,p+3,.0035,4)*12+v(u,p,.012,2)*2.6+v(u+4,p+2,.03,3)*3;const M=Math.max(0,_-1500)/500;w-=M*M*5;let ae=0,j=0;for(const ue of g){const oe=Math.hypot(u-ue.x,p-ue.z)/ue.r;oe<1&&(ae=Math.max(ae,ue.d*Math.pow(1-oe*oe,1.55))),oe<1.45&&(j=Math.max(j,ue.d*.3*Math.exp(-Math.pow((oe-1.02)/.16,2))))}return w-=ae,w+=j,w+=(ba(u*.09+1,p*.09+6,2)-.5)*(n.terrain==="rock"?1.2:n.terrain==="ice"?.25:.5),w}let xe=pe(0,0);function ce(u,p){return pe(u,p)-xe}const le=(()=>{if(n.cloudTop!==null||n.terrain==="plasma"||n.terrain==="ring")return{x:0,z:0};const u=[];for(let _=0;_<40;_+=1){const w=_/40*Math.PI*2,M=_%5*34,ae=Math.cos(w)*M,j=Math.sin(w)*M;let ue=0;for(let oe=0;oe<8;oe+=1){const ct=oe/8*Math.PI*2;ue+=ce(ae+Math.cos(ct)*120,j+Math.sin(ct)*120)}u.push({x:ae,z:j,score:ce(ae,j)-ue/8})}u.sort((_,w)=>w.score-_.score);const p=u[Math.floor(u.length*.28)];return{x:p.x,z:p.z}})();xe=pe(le.x,le.z);const K=n.cloudTop!==null?n.cloudTop:ce(le.x,le.z),de=1.7,Se=ms(n.sunAz,n.sunElev),Be=n.sunScale>0?.2667*n.sunScale*Fo:0,ke=Math.max(0,Math.min(1,n.fogDensity*26)),Ze=new q(n.skyTop),Te=new q(n.skyBottom),Pe=new q(n.glow),nt=r(new it({vertexShader:Sc,fragmentShader:Tc,side:Co,depthWrite:!1,uniforms:{uTop:{value:Ze.clone()},uBottom:{value:Te.clone()},uGlow:{value:Pe.clone()},uSun:{value:new q(n.sunColor)},uSunDir:{value:Se.clone()},uSunRadius:{value:Be},uSunHaze:{value:ke},uGlowGain:{value:n.glowGain}}})),dt=new $(r(new Ve(wa,32,20)),nt);dt.frustumCulled=!1,c.add(dt);function Qe(u,p){if(!U)return;const _=Math.max(0,u),w=Math.max(1,p??u),M=Ko(Math.min(1,Math.max(0,(_-25)/95))),ae=Mc*M;U.uCurve.value=ae,U.uOrbit.value=Ko(Math.min(1,Math.max(0,(_-45)/150))),U.uRimDist.value=ae>1e-7?Math.sqrt(w/(4*ae)):2400,U.uRim.value=M*(n.stars?.4:.55)}let Lt=0;function rt(u){Lt=Math.max(0,Math.min(1,u));const p=1-Lt;nt.uniforms.uTop.value.copy(Ze).multiplyScalar(p),nt.uniforms.uBottom.value.copy(Te).multiplyScalar(p),nt.uniforms.uGlow.value.copy(Pe).multiplyScalar(p),nt.uniforms.uGlowGain.value=n.glowGain*p,nt.uniforms.uSun.value.copy(new q(n.sunColor)).multiplyScalar(p),ht&&(ht.opacity=.85*Math.min(1,Lt*1.6))}let ht=null;if(n.stars){const u=o?320:620,p=new Float32Array(u*3),_=ko(d^2654435769);for(let j=0;j<u;j+=1){const ue=_()*Math.PI*2,oe=Math.pow(_(),.65)*.98+.02,ct=Math.sqrt(1-oe*oe);p[j*3]=Math.cos(ue)*ct*(wa-200),p[j*3+1]=oe*(wa-200),p[j*3+2]=Math.sin(ue)*ct*(wa-200)}const w=r(new cn);w.setAttribute("position",new Dn(p,3));const M=r(new Na({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1}));ht=M;const ae=new Fa(w,M);ae.frustumCulled=!1,c.add(ae)}const be=Math.min(1.5,.45+.9*Math.min(1,Math.max(n.sunScale,.02)*1.5)),vt=n.stars?.4:.46,Ot=(u,p)=>{const w=-(ce(u+.9,p)-ce(u-.9,p))/1.8,M=-(ce(u,p+.9)-ce(u,p-.9))/(2*.9),ae=1/Math.sqrt(w*w+1+M*M),j=Math.max(0,(w*Se.x+Se.y+M*Se.z)*ae);return vt+be*j};let he=[],St=null;if(n.terrain==="plasma"){const u=r(new it({vertexShader:Ac,fragmentShader:kc,uniforms:{uTime:{value:0},uA:{value:new q(n.ground)},uB:{value:new q(n.ground2)},uC:{value:new q(n.ground3)}}}));St=u;const p=new $(r(new Aa(2400,2400,1,1)),u);p.rotation.x=-Math.PI/2,p.position.y=0,c.add(p)}else if(n.terrain!=="ring")if(n.cloudTop!==null){const u=yc(n,o,a),p=Math.min(1.12,.55+.5*Math.min(1,Math.max(n.sunScale,.02)*2)),_=(M,ae)=>r(new it({vertexShader:oc,fragmentShader:ac,uniforms:{uMap:{value:u},uOffset:{value:new Zo(0,0)},uTile:{value:M},uDetail:{value:11},uTint:{value:new q().setScalar(ae)},uOpacity:{value:1},uFogColor:{value:new q(n.fog)},uFogDensity:{value:n.fogDensity}}})),w=new $(r(new Aa(5200,5200,1,1)),_(sc,p));w.rotation.x=-Math.PI/2,w.position.y=n.cloudTop,c.add(w),he=[w.material]}else{const u=o?96:150,p=r(new Aa(lo*2,lo*2,u,u));p.rotateX(-Math.PI/2);const _=p.attributes.position,w=new Float32Array(_.count*3),M=new q(n.ground),ae=new q(n.ground2),j=new q(n.ground3),ue=new Dn(w,3),oe=new q,ct=se=>{const Ae=_.getX(se),Le=_.getZ(se),Ke=ce(Ae,Le);_.setY(se,Ke);const et=ba(Ae*.02+3,Le*.02+9,3);oe.copy(M).lerp(ae,Ko(Math.min(1,Math.max(0,(et-.28)/.5)))),Ke<-1.6&&oe.lerp(j,Math.min(1,(-Ke-1.6)/7));const Ee=ba(Ae*.0045+17,Le*.0045+41,3),pt=Math.min(1.9,Ot(Ae,Le))*(.9+(et-.5)*.22)*(.84+Ee*.34);let st=1;for(const We of g){const At=Math.hypot(Ae-We.x,Le-We.z)/We.r;if(At>1.5)continue;const gt=Math.min(1,Math.max(0,1-At/1.35));st*=1-.62*gt*gt}w[se*3]=oe.r*pt*st,w[se*3+1]=oe.g*pt*st*.94,w[se*3+2]=oe.b*pt*st*.9};for(let se=0;se<_.count;se+=1){const Ae=_.getX(se)/lo,Le=_.getZ(se)/lo,Ke=Math.sign(Ae)*Math.pow(Math.abs(Ae),1.8)*lo,et=Math.sign(Le)*Math.pow(Math.abs(Le),1.8)*lo;_.setXYZ(se,Ke,0,et),ct(se)}p.setAttribute("color",ue),p.computeVertexNormals();const ut=gc(n.terrain,o,a),zt=1/(ut.image.width||512),we=r(new it({vertexShader:tc,fragmentShader:nc,vertexColors:!0,side:ft,uniforms:{uMap:{value:ut},uTexel:{value:zt},uTile:{value:Bi},uDetail:{value:5.6},uBump:{value:9},uGloss:{value:n.terrain==="ice"?.9:.25},uSunDir:{value:Se.clone()},uSunColor:{value:new q(n.sunColor)},uFogColor:{value:new q(n.fog)},uFogDensity:{value:n.fogDensity},uAmbient:{value:vt},uSunPower:{value:be},uCurve:{value:0},uOrbit:{value:0},uSea:{value:n.id==="earth"?1:0},uCloudy:{value:n.stars?0:Math.min(.5,.15+n.fogDensity*450)},uSeaColor:{value:new q(n.skyTop).multiplyScalar(.42)},uCloudColor:{value:new q(n.fog).lerp(new q("#ffffff"),.55)},uRimColor:{value:new q(n.skyTop).lerp(new q("#ffffff"),.55)},uRim:{value:0},uRimDist:{value:600}}})),Tn=new $(p,we);c.add(Tn),x=Tn,U=we.uniforms;const pn=1.8,mn=u+1,Wt=new Float32Array(mn);for(let se=0;se<mn;se+=1){const Ae=-1+2*se/u;Wt[se]=Math.sign(Ae)*Math.pow(Math.abs(Ae),pn)*lo}const An=se=>{if(se<=Wt[0])return 0;if(se>=Wt[u])return u-1;let Ae=0,Le=u;for(;Le-Ae>1;){const Ke=Ae+Le>>1;Wt[Ke]<=se?Ae=Ke:Le=Ke}return Ae};C=(se,Ae)=>{const Le=An(se),Ke=An(Ae);if(Le<0||Ke<0||Le>=u||Ke>=u)return ce(se,Ae);const et=(se-Wt[Le])/(Wt[Le+1]-Wt[Le]),Ee=(Ae-Wt[Ke])/(Wt[Ke+1]-Wt[Ke]),pt=Ke*mn+Le,st=_.getY(pt),We=_.getY(pt+1),At=_.getY(pt+mn),gt=_.getY(pt+mn+1);return et+Ee<=1?st+(We-st)*et+(At-st)*Ee:gt+(At-gt)*(1-et)+(We-gt)*(1-Ee)};const Rt=ko(d^2135587861),na=[n.ground2,n.ground3,n.ground].map(se=>new q(se).multiplyScalar(vt+be*.75)),dn=new qo,kn=se=>{dn.position.set(se.x,se.y,se.z),dn.rotation.set(se.rx,se.ry,se.rz),dn.scale.set(se.sx,se.sy,se.sz),dn.updateMatrix(),se.mesh.setMatrixAt(se.index,dn.matrix)},Xt=(se,Ae,Le,Ke,et,Ee,pt)=>{const st=new Ea(se,r(new Me({color:16777215})),Ae);st.instanceMatrix.setUsage(ds);for(let We=0;We<Ae;We+=1){const At=Rt()*Math.PI*2,gt=Le+Math.sqrt(Rt())*(Ke-Le),hn=le.x+Math.cos(At)*gt,vn=le.z+Math.sin(At)*gt,gn=et+Math.pow(Rt(),2.1)*(Ee-et),Pn=ce(hn,vn),Ut=gn*(.45+Rt()*.5),fo={mesh:st,index:We,x:hn,z:vn,y:Pn+gn*pt,base:Pn,relief:0,liftY:gn*pt,sx:gn*(.8+Rt()*.7),sy:Ut,sz:gn*(.8+Rt()*.7),rx:Rt()*3,ry:Rt()*3,rz:Rt()*3,fly:!1,vx:0,vy:0,vz:0,spin:new Y};fo.relief=fo.y+Ut*.72-Pn,F.push(fo),kn(fo),st.setColorAt(We,na[We%3])}st.instanceMatrix.needsUpdate=!0,st.instanceColor&&(st.instanceColor.needsUpdate=!0),c.add(st)};if(Xt(r(new Nn(1,0)),o?90:170,1.2,60,.02,.22,.35),Xt(r(new Nn(1,1)),o?30:54,2,120,.18,1.1,.34),Xt(r(new Nn(1,1)),o?10:18,6,190,.6,2.4,.4),Z=(se,Ae,Le)=>{const Ke=Le*2.4;for(let et=0;et<_.count;et+=1){const Ee=_.getX(et)-se,pt=_.getZ(et)-Ae;Ee*Ee+pt*pt>Ke*Ke||ct(et)}_.needsUpdate=!0,ue.needsUpdate=!0,p.computeVertexNormals()},G=()=>{for(let se=0;se<_.count;se+=1)ct(se);_.needsUpdate=!0,ue.needsUpdate=!0,p.computeVertexNormals()},B=(se,Ae,Le)=>{const Ke=Le*1.2,et=Le*2.3;for(const Ee of F){const pt=Ee.x-se,st=Ee.z-Ae,We=Math.hypot(pt,st);if(!(We>et)){if(Ee.base=ce(Ee.x,Ee.z),Ee.y=Ee.base+Ee.liftY,Ee.relief=Ee.y+Ee.sy*.72-Ee.base,We<Ke&&Ee.sy>.16){const At=We>.001?We:1,gt=12+Math.random()*26;Ee.fly=!0,Ee.vx=pt/At*gt,Ee.vz=st/At*gt,Ee.vy=9+Math.random()*20,Ee.spin.set((Math.random()-.5)*9,(Math.random()-.5)*9,(Math.random()-.5)*9)}kn(Ee),Ee.mesh.instanceMatrix.needsUpdate=!0}}},n.terrain==="ice"){const se=[],Ae=ko(d^1542469173),Le=(et,Ee,pt,st,We,At)=>{let gt=et,hn=Ee,vn=pt;for(let gn=0;gn<st;gn+=1){const Pn=gt+Math.cos(vn)*We,Ut=hn+Math.sin(vn)*We;se.push(gt,ce(gt,hn)+.06,hn,Pn,ce(Pn,Ut)+.06,Ut),gt=Pn,hn=Ut,vn+=(Ae()-.5)*.9,At>0&&gn===st>>1&&Ae()<.7&&Le(gt,hn,vn+(Ae()<.5?.9:-.9),Math.max(3,st>>2),We*.8,At-1)}};for(let et=0;et<(o?6:10);et+=1)Le((Ae()-.5)*300,(Ae()-.5)*300,Ae()*Math.PI*2,14,14,1);const Ke=r(new cn);Ke.setAttribute("position",new Dn(new Float32Array(se),3)),c.add(new Ui(Ke,r(new $o({color:n.ground3,transparent:!0,opacity:.75}))))}}if(n.terrain==="ring"){const u=new Ge;u.position.copy(ms(n.companionAz,0)).multiplyScalar(2600);const p=bi;u.position.y=p;const _=480,w=_*1.11,M=_*2.36,ae=new $(r(new Ve(_,o?64:128,o?44:80)),r(new it({vertexShader:Mi,fragmentShader:wi,uniforms:{uMap:{value:xi("saturn",n,o,a)},uLimb:{value:.4},uRim:{value:new q("#e8dcbc")}}})));u.add(ae);const j=r(new it({vertexShader:Ao,fragmentShader:us,transparent:!0,side:ft,depthWrite:!1,uniforms:{uProfile:{value:ps(o,a)},uInner:{value:w},uOuter:{value:M},uAlpha:{value:o?.78:.88}}})),ue=new $(r(new Et(w,M,o?128:220,1)),j);ue.rotation.x=-Math.PI/2,ue.position.y=p,u.add(ue),c.add(u);const oe=o?220:420,ct=r(new Nn(1,0)),ut=r(new Me({color:"#dfe8f2"})),zt=new Ea(ct,ut,oe);zt.instanceMatrix.setUsage(ds);const we=ko(d^1374496523),Tn=[],pn=new qo;for(let Rt=0;Rt<oe;Rt+=1){const dn=Rt%31===0?.5+we()*1.3:.05+Math.pow(we(),2)*.55,kn=14+Math.pow(we(),.7)*150,Xt=we()*Math.PI*2,se=(we()-.5)*14;Tn.push({r:kn,a:Xt,y:se,spin:.02+we()*.08,size:dn,wob:we()*Math.PI*2}),pn.position.set(Math.cos(Xt)*kn,se,Math.sin(Xt)*kn),pn.rotation.set(we()*3,we()*3,we()*3),pn.scale.setScalar(dn),pn.updateMatrix(),zt.setMatrixAt(Rt,pn.matrix);const Ae=.5+we()*.45;zt.setColorAt(Rt,new q(Ae,Ae*.98,Ae*1.05))}zt.instanceMatrix.needsUpdate=!0,zt.instanceColor&&(zt.instanceColor.needsUpdate=!0),c.add(zt),h={mesh:zt,data:Tn};const mn=r(new it({vertexShader:Ao,fragmentShader:Ma,transparent:!0,side:ft,depthWrite:!1,uniforms:{uInner:{value:.6},uOuter:{value:2600-M-10},uBands:{value:260},uA:{value:new q("#e2eaf4")},uB:{value:new q("#c3cfdd")},uAlpha:{value:.92},uGrain:{value:.26}}})),Wt=2600-M-10,An=new $(r(new Et(.6,Wt,128,1)),mn);An.rotation.x=-Math.PI/2,An.position.y=p,c.add(An)}if(n.ring){const u=n.ring==="uranus",p=u?210:170,_=u?520:560,w=u?82*Fo:27*Fo,M=u?140:54,ae=r(u?new it({vertexShader:Ao,fragmentShader:Ma,transparent:!0,side:ft,depthWrite:!1,uniforms:{uInner:{value:p},uOuter:{value:_},uBands:{value:M},uA:{value:new q("#9fd0d6")},uB:{value:new q("#cdeef2")},uAlpha:{value:.5},uGrain:{value:.4}}}):new it({vertexShader:Ao,fragmentShader:us,transparent:!0,side:ft,depthWrite:!1,uniforms:{uProfile:{value:ps(o,a)},uInner:{value:p},uOuter:{value:_},uAlpha:{value:.82}}})),j=new $(r(new Et(p,_,o?64:128,1)),ae);if(j.rotation.x=-Math.PI/2+w,j.position.y=u?30:90,c.add(j),u){const ue=r(new it({vertexShader:Ao,fragmentShader:Ma,transparent:!0,side:ft,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new q("#dff6f8")},uB:{value:new q("#bfe6ea")},uAlpha:{value:.35},uGrain:{value:.3}}})),oe=new $(r(new Et(130,175,64,1)),ue);oe.rotation.x=-Math.PI/2+w,oe.position.y=30,c.add(oe)}}if(n.companion&&n.terrain!=="ring"){const p=Math.max(6,Math.tan(n.companionSize/2*Fo)*1500),_=new Ge;_.position.copy(ms(n.companionAz,n.companionElev)).multiplyScalar(1500);const w=xi(n.companion,n,o,a),M=new $(r(new Ve(p,o?48:72,o?32:48)),r(new it({vertexShader:Mi,fragmentShader:wi,uniforms:{uMap:{value:w},uLimb:{value:.42},uRim:{value:new q(n.companion==="earth"?"#9fd0ff":"#cfe0f2")}}})));if(M.lookAt(0,0,0),_.add(M),n.companion==="saturn"||n.companion==="jupiter"){const j=n.companion==="saturn",ue=r(new it({vertexShader:Ao,fragmentShader:j?us:Ma,transparent:!0,side:ft,depthWrite:!1,uniforms:j?{uProfile:{value:ps(o,a)},uInner:{value:p*1.12},uOuter:{value:p*2.36},uAlpha:{value:.7}}:{uInner:{value:p*1.3},uOuter:{value:p*1.7},uBands:{value:16},uA:{value:new q("#d9c7a8")},uB:{value:new q("#b09070")},uAlpha:{value:.18},uGrain:{value:.3}}})),oe=new $(r(new Et(p*(j?1.12:1.3),p*(j?2.36:1.7),64,1)),ue);oe.rotation.x=-Math.PI/2+.32,_.add(oe)}const ae=new No(r(new Eo({map:b,color:new q(n.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:$e})));ae.scale.setScalar(p*4),_.add(ae),c.add(_)}const Vn=n.terrain!=="ring",ee=(u,p)=>n.terrain==="ring"?bi:n.cloudTop!==null?n.cloudTop:ce(u,p),X=Br({sunDir:Se,ambient:Math.min(1.05,vt+.24),sunPower:be});c.add(X.group),X.setVisible(!1);const E=ec({floorAt:ee,heightAt:ce,onImpact:t.onImpact,onScar:(u,p)=>Wn(u,p)});c.add(E.group);const R=o?140:n.particles==="haze"?120:300;let f=null,z=null;if(n.particles!=="none"){const u=new Float32Array(R*3);z=new Float32Array(R*3);const p=ko(d^625341585);for(let ae=0;ae<R;ae+=1){const j=p()*Math.PI*2,ue=Math.sqrt(p())*55,oe=n.particles;let ct=p()*22;oe==="spark"&&(ct=p()*14),oe==="haze"&&(ct=2+p()*26),u[ae*3]=Math.cos(j)*ue,u[ae*3+1]=ct,u[ae*3+2]=Math.sin(j)*ue;const ut=oe==="wind"?42+p()*34:oe==="rain"?12+p()*6:oe==="spark"?2+p()*4:1.2+p()*2.6;z[ae*3]=oe==="wind"?ut:(p()-.5)*ut*.5,z[ae*3+1]=oe==="rain"?-ut:oe==="spark"?ut:oe==="snow"?-.6-p()*.9:(p()-.5)*.4,z[ae*3+2]=oe==="wind"?ut*.25:(p()-.5)*ut*.4}f=r(new cn),f.setAttribute("position",new Dn(u,3));const _=n.particles==="haze"?2.6:n.particles==="dust"?.14:n.particles==="rain"?.09:n.particles==="snow"?.11:.16,w=r(new Na({color:new q(n.particleColor),size:_,transparent:!0,opacity:n.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:n.particles==="spark"?$e:void 0})),M=new Fa(f,w);M.frustumCulled=!1,c.add(M)}const fe=r(new Nn(.26,0)),W=r(new Ve(.24,16,12)),D=n.cloudTop===null&&n.terrain!=="plasma",te=[],Ye=[],ot=[];function ve(u,p,_,w){const M=new No(r(new Eo({map:b,color:new q(p),transparent:!0,opacity:.9,depthWrite:!1,blending:$e})));M.position.copy(u),M.scale.setScalar(_),c.add(M),Ye.push({sprite:M,life:w,max:w,grow:_*2.4})}function at(u,p){const _=new $(r(new Et(.28,.5,24,1)),r(new Me({color:new q(p),transparent:!0,opacity:.6,depthWrite:!1,side:ft})));_.rotation.x=-Math.PI/2,_.position.copy(u),c.add(_),ot.push({mesh:_,life:.7})}function Sn(u,p){const _=le.x+u,w=le.z+p,M=n.cloudTop!==null?n.cloudTop:ce(_,w),ae=D?new Me({color:new q("#c9c2b4").multiplyScalar(vt+be*.8),transparent:!0}):new Me({color:new q("#ffb45e"),transparent:!0}),j=new $(D?fe:W,ae);j.position.set(_,M+4.2,w),j.scale.setScalar(.9+Math.random()*.35),c.add(j);const ue=n.gravityMps2<=.01;if(te.push({mesh:j,x:_,z:w,y:ue?M+.6:M+4.2,vy:ue?.12:0,vx:ue?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:ue?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),te.length>6){const oe=te.shift();oe&&(c.remove(oe.mesh),oe.mesh.material.dispose())}}function Dt(u,p){const _=new Y(u.x,p+.2,u.z);if(n.gravityMps2<=.01){u.outcome="float",u.landed=!0,u.resting=5.5,t.onLand?.({seconds:u.fall,bounces:0,outcome:"float"});return}if(n.terrain==="plasma"){u.outcome="vapor",u.landed=!0,u.resting=.25,ve(_,"#fff2c0",1.2,.6),t.onLand?.({seconds:u.fall,bounces:0,outcome:"vapor"});return}if(n.cloudTop!==null){u.outcome="sink",u.landed=!0,u.resting=1.6,ve(_,"#ffffff",1.6,.7),t.onLand?.({seconds:u.fall,bounces:0,outcome:"sink"});return}if(u.bounces+=1,at(_,n.ground2),u.bounces===1&&t.onLand?.({seconds:u.fall,bounces:1,outcome:"bounce"}),u.bounces>=4||Math.abs(u.vy)<1.3){u.landed=!0,u.outcome="bounce",u.resting=1.6,u.vy=0;return}u.vy=Math.abs(u.vy)*.42,u.y=p+.26,u.vx*=.6,u.vz*=.6}const fn=new qo,Va=new q("#31090d"),Wa=new q("#180509"),Qo=new q("#ff3a10");function ea(u,p){E.update(u,p);const _=E.doom();nt.uniforms.uTop.value&&(nt.uniforms.uTop.value.copy(Ze).lerp(Va,_),nt.uniforms.uBottom.value.copy(Te).lerp(Wa,_),nt.uniforms.uGlow.value.copy(Pe).lerp(Qo,_)),ht&&(ht.opacity=.85*(1-_*.85)),St&&(St.uniforms.uTime.value=u);for(let w=0;w<he.length;w+=1){const M=he[w].uniforms.uOffset.value;M.x=(M.x+p*(w===0?.006:.012))%1}if(h){const{mesh:w,data:M}=h;for(let ae=0;ae<M.length;ae+=1){const j=M[ae];j.a+=j.spin*p*.05,fn.position.set(Math.cos(j.a)*j.r,j.y+Math.sin(u*.25+j.wob)*.5,Math.sin(j.a)*j.r),fn.rotation.set(u*.08+j.wob,u*.11+j.a,j.wob),fn.scale.setScalar(j.size),fn.updateMatrix(),w.setMatrixAt(ae,fn.matrix)}w.instanceMatrix.needsUpdate=!0}if(f&&z){const w=f.attributes.position,M=w.array;for(let ae=0;ae<w.count;ae+=1){const j=ae*3;M[j]+=z[j]*p,M[j+1]+=z[j+1]*p,M[j+2]+=z[j+2]*p,n.particles==="rain"||n.particles==="snow"?M[j+1]<0&&(M[j+1]=22):n.particles==="spark"?M[j+1]>20&&(M[j+1]=0):(M[j+1]<0&&(M[j+1]=24),M[j+1]>26&&(M[j+1]=0)),M[j]>60&&(M[j]=-60),M[j]<-60&&(M[j]=60),M[j+2]>60&&(M[j+2]=-60),M[j+2]<-60&&(M[j+2]=60)}w.needsUpdate=!0}for(let w=te.length-1;w>=0;w-=1){const M=te[w],ae=n.cloudTop!==null?n.cloudTop:ce(M.x,M.z);if(M.landed)M.resting>0?(M.resting-=p,M.outcome==="sink"?(M.y-=p*2.4,M.mesh.scale.multiplyScalar(1-p*.8)):M.outcome==="vapor"?M.mesh.scale.multiplyScalar(1-p*3):M.mesh.scale.multiplyScalar(1-p*.25)):(M.fade-=p*1.4,M.mesh.material.opacity=Math.max(0,M.fade),M.mesh.scale.multiplyScalar(1-p*.9),M.fade<=0&&(c.remove(M.mesh),M.mesh.material.dispose(),te.splice(w,1)));else{if(M.fall+=p,n.gravityMps2<=.01){M.x+=M.vx*p,M.z+=M.vz*p,M.y+=M.vy*p,M.mesh.rotation.x+=p*.6,M.mesh.rotation.y+=p*.45,M.mesh.position.set(M.x,M.y,M.z),M.fall>.05&&Dt(M,M.y);continue}M.vy-=n.gravityMps2*p,M.y+=M.vy*p,M.x+=M.vx*p,M.z+=M.vz*p,M.mesh.rotation.x+=p*3.2,M.mesh.rotation.z+=p*2.1,M.y-.26<=ae&&(M.y=ae+.26,Dt(M,ae))}M.mesh.position.set(M.x,M.y,M.z)}for(const w of F){if(!w.fly)continue;const M=Math.max(1.2,n.gravityMps2);w.vy-=M*p,w.x+=w.vx*p,w.y+=w.vy*p,w.z+=w.vz*p,w.vx*=1-p*.25,w.vz*=1-p*.25,w.rx+=w.spin.x*p,w.ry+=w.spin.y*p,w.rz+=w.spin.z*p;const ae=ce(w.x,w.z)+w.sy*.72;w.y<=ae&&(w.y=ae,w.fly=!1,w.vx=0,w.vy=0,w.vz=0,w.base=ce(w.x,w.z),w.liftY=w.y-w.sy*.72-w.base,w.relief=w.y+w.sy*.72-w.base),ta(w),w.mesh.instanceMatrix.needsUpdate=!0}for(let w=Ye.length-1;w>=0;w-=1){const M=Ye[w];M.life-=p;const ae=1-M.life/M.max;M.sprite.scale.setScalar(M.sprite.scale.x+(M.grow-M.sprite.scale.x)*Math.min(1,p*6)),M.sprite.material.opacity=Math.max(0,.9*(1-ae)),M.life<=0&&(c.remove(M.sprite),Ye.splice(w,1))}for(let w=ot.length-1;w>=0;w-=1){const M=ot[w];M.life-=p,M.mesh.scale.multiplyScalar(1+p*3.4),M.mesh.material.opacity=Math.max(0,M.life/.7)*.6,M.life<=0&&(c.remove(M.mesh),ot.splice(w,1))}}function Wn(u,p){if(n.cloudTop!==null||n.terrain==="plasma"||n.terrain==="ring"||!Z)return 0;const _=22+Math.random()*6,w=Math.max(1.4,ce(u,p)+26),M=Math.min(4.8+Math.random()*1.2,w);return g.push({x:u,z:p,r:_,d:M}),g.length>Pc&&(g.shift(),G?.()),Z(u,p,_),B?.(u,p,_),_}const $n=new qo;function ta(u){$n.position.set(u.x,u.y,u.z),$n.rotation.set(u.rx,u.ry,u.rz),$n.scale.set(u.sx,u.sy,u.sz),$n.updateMatrix(),u.mesh.setMatrixAt(u.index,$n.matrix)}function Kt(u,p){let _=u,w=p,M=0;for(const ae of F){if(ae.fly)continue;const j=Math.max(ae.sx,ae.sz);if(j<.04)continue;let ue=_-ae.x,oe=w-ae.z;const ct=Math.hypot(ue,oe);if(!(ct>j+1.2)){if(ae.relief<=zc)ct<j*.95&&(M=Math.max(M,ae.relief));else if(ct<j+Si){ct<1e-4&&(ue=0,oe=1);const ut=Math.max(1e-4,Math.hypot(ue,oe)),zt=j+Si-ct;_+=ue/ut*zt,w+=oe/ut*zt}}}return{x:_,z:w,rise:M}}const Ua=(u,p)=>{const w=-(ce(u+.9,p)-ce(u-.9,p))/1.8,M=-(ce(u,p+.9)-ce(u,p-.9))/(2*.9);return new Y(w,1,M).normalize()},Io=new Gi,Zn=(u,p)=>{const _=C?C(u,p):ce(u,p);let w=null;if(x){Io.set(new Y(u,4e3,p),new Y(0,-1,0));const M=Io.intersectObject(x,!1)[0];M&&(w=M.point.y)}return{mesh:_,ray:w}};function Un(){X.dispose(),E.dispose();for(const u of Ye)c.remove(u.sprite);for(const u of ot)c.remove(u.mesh);for(const u of te)c.remove(u.mesh),u.mesh.material.dispose();y.forEach(u=>u.dispose()),c.clear()}return{group:c,eyeY:K+de,eyeHeight:de,groundY:K,standX:le.x,standZ:le.z,heightAt:ce,floorAt:ee,solidFloor:Vn,walkable:n.cloudTop===null&&n.terrain!=="ring",avatar:X,impact:E,scar:Wn,walk:Kt,normalAt:Ua,scarCount:()=>g.length,atmosphere:rt,orbitView:Qe,meshHeightAt:(u,p)=>C?C(u,p):ce(u,p),probeGround:Zn,update:ea,drop:Sn,dispose:Un}}const Cc="models/rocket/",Fc="textures/rocket/",Ti={engine:"engine-cluster",stage1:"first-stage-core",inter:"interstage",stage2:"second-stage",fairing:"payload-fairing",fins:"grid-fin-set",mount:"launch-mount",deflector:"flame-deflector",gantryBase:"gantry-base",gantryTower:"gantry-tower",strongback:"strongback",mast:"lightning-mast",flood:"floodlight"},Ra=4.4,Nc=7.2,Yn=4.65,Ai=2.95,Ec=5.35,jn=5.3,Sa=.85,Da=17,Ca=12,Po=Yn/Da,Ro=.3,zo=jn+(Da+Ca)*Ro,ki=6;let Pi=null,zi=null;function Dc(n=!1){return zi??=(async()=>{const t=new Oi,o=async(b,g)=>{const F=await t.loadAsync(`${Fc}${b}.webp`);return F.wrapS=hs,F.wrapT=hs,F.colorSpace=g?_n:bs,F.anisotropy=n?1:8,F},[a,c,y,r,h,C,x,d,A]=await Promise.all([o("hull_color",!0),o("hull_normal",!1),o("hull_rough",!1),o("tile_color",!0),o("tile_normal",!1),o("tile_rough",!1),o("steel_color",!0),o("steel_normal",!1),o("steel_rough",!1)]);return{hullColor:a,hullNormal:c,hullRough:y,tileColor:r,tileNormal:h,tileRough:C,steelColor:x,steelNormal:d,steelRough:A}})(),zi}function _c(){return Pi??=(async()=>{const n=new Tr,t=new Map;return await Promise.all(Object.keys(Ti).map(async o=>{const a=await n.loadAsync(`${Cc}${Ti[o]}.glb`);t.set(o,a.scene)})),t})(),Pi}function Ic(n,t){const o=(c,y,r,h,C,x)=>new gs({map:c,normalMap:y,roughnessMap:r,color:h,metalness:C,roughness:x,envMap:t,envMapIntensity:1.15}),a=(c,y,r)=>new gs({color:c,metalness:y,roughness:r,envMap:t,envMapIntensity:.9});return{white:o(n.hullColor,n.hullNormal,n.hullRough,15659766,.88,.62),cryo:o(n.hullColor,n.hullNormal,n.hullRough,12175834,.82,.55),charcoal:o(n.tileColor,n.tileNormal,n.tileRough,10132122,.38,.72),steel:o(n.steelColor,n.steelNormal,n.steelRough,12764876,.8,.5),red:a(11942448,.3,.55),yellow:a(14197788,.35,.5),concrete:a(11051930,.05,.92),glass:a(3030348,.55,.25)}}function Vc(n,t,o){n.traverse(a=>{const c=a;if(!c.isMesh)return;const y=c.geometry,r=y.getAttribute("position");if(!r)return;const h=new Float32Array(r.count*2);for(let C=0;C<r.count;C+=1){const x=r.getX(C),d=r.getY(C),A=r.getZ(C);h[C*2]=(Math.atan2(x,A)/(Math.PI*2)+.5)*t,h[C*2+1]=d*o}y.setAttribute("uv",new Dn(h,2))})}function Wc(n,t){n.traverse(o=>{const a=o;if(!a.isMesh)return;const c=a.geometry,y=c.getAttribute("position");if(!y)return;const r=new Float32Array(y.count*2);for(let h=0;h<y.count;h+=1)r[h*2]=(y.getX(h)+y.getZ(h))*t,r[h*2+1]=y.getY(h)*t;c.setAttribute("uv",new Dn(r,2))})}function Ri(n,t){n.traverse(o=>{const a=o;if(!a.isMesh)return;const c=a.material;Array.isArray(c)?a.material=c.map(y=>t[y.name]??t.steel):a.material=t[c?.name??"steel"]??t.steel})}function Uc(n,t){if(typeof document>"u")return null;const o=document.createElement("canvas");o.width=128,o.height=64;const a=o.getContext("2d");if(!a)return null;const c=a.createLinearGradient(0,0,0,64),y=new q("#8d8a84"),r=new q(t.ground).lerp(y,.5).getStyle(),h=new q(t.ground2??t.ground).lerp(y,.5).getStyle();c.addColorStop(0,t.skyTop),c.addColorStop(.5,t.skyBottom),c.addColorStop(.53,r),c.addColorStop(1,h),a.fillStyle=c,a.fillRect(0,0,128,64);const C=(t.sunAz/360%1+1)%1*128,x=32-t.sunElev/90*26,d=a.createRadialGradient(C,x,0,C,x,t.sunScale>0?18:.1);d.addColorStop(0,t.sunColor),d.addColorStop(1,"rgba(0,0,0,0)"),a.fillStyle=d,a.fillRect(0,0,128,64);const A=new uo(o);A.mapping=Ar,A.colorSpace=_n;const b=new kr(n),g=b.fromEquirectangular(A).texture;return b.dispose(),A.dispose(),g}const Gc=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Lc=`
uniform float uTime;
uniform float uPower;
uniform vec3 uCore;
uniform vec3 uEdge;
varying vec2 vUv;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(41.3, 289.1)) + uTime * 7.0) * 43758.5453);
}
void main() {
  float v = clamp(vUv.y, 0.0, 1.0);
  float around = abs(vUv.x - 0.5) * 2.0;
  // 아래로 갈수록 잡음이 커지며 사라집니다.
  float flick = 0.72 + 0.28 * hash(vec2(floor(v * 24.0), floor(uTime * 31.0)));
  float body = pow(1.0 - v, 1.6) * (1.0 - pow(around, 3.0));
  float core = pow(1.0 - v, 3.4) * (1.0 - pow(around, 1.6));
  vec3 col = mix(uEdge, uCore, clamp(core * 1.8, 0.0, 1.0));
  float alpha = (body * 0.55 + core * 0.9) * flick * uPower;
  gl_FragColor = vec4(col * (0.8 + core), alpha);
}
`;function Oc(){const t=document.createElement("canvas");t.width=96,t.height=96;const o=t.getContext("2d");if(o){const c=o.createRadialGradient(48,48,2,48,48,48);c.addColorStop(0,"rgba(255,255,255,0.95)"),c.addColorStop(.45,"rgba(240,240,240,0.5)"),c.addColorStop(1,"rgba(230,230,230,0)"),o.fillStyle=c,o.fillRect(0,0,96,96)}const a=new uo(t);return a.colorSpace=_n,a}async function Bc(n,t,o=!1){const[a,c]=await Promise.all([_c(),Dc(o)]),y=Uc(n,t),r=Ic(c,y),h=new Ge;h.name="rocket-pad";const C=ee=>{const X=a.get(ee);if(!X)throw new Error(`rocket part ${ee}`);return X.clone(!0)},x=(ee,X,E=0,R=0,f=0)=>{const z=C(X);return z.position.set(R,E,f),ee.add(z),z},d=new Ge;h.add(d),x(d,"mount",0,0,0),x(d,"deflector",-1.9,0,0),x(d,"gantryBase",0,-11.5,1.5),x(d,"gantryTower",7.71,-11.5,1.5),x(d,"gantryTower",14.94,-11.5,1.5),x(d,"strongback",6.19,-7.4,-.4),x(d,"mast",0,-19,-8),x(d,"flood",0,13,7),x(d,"flood",0,-13,9),Ri(d,r),Wc(d,.2);const A=t.cloudTop===null&&t.terrain!=="ring";if(A){const ee=new $(new ka(7.9,8.6,7.2,40,1),r.concrete);ee.position.y=-3.25,ee.name="pad-foundation",d.add(ee);const X=new Ge;X.name="pad-stairs",d.add(X);const E=Da+Ca,R=Sa*2,f=[];for(let ve=0;ve<E;ve+=1){const at=Yn-(E-1-ve)*Po,Sn=zo-ve*Ro,Dt=1.8;f.push({w:Ro+.004,h:Dt,d:R,x:Sn-Ro/2,y:at-Dt/2,z:0})}const z=new $(as(f.map(ve=>{const at=new ss(ve.w,ve.h,ve.d);return at.translate(ve.x,ve.y,ve.z),at}),!1),r.concrete);z.name="pad-stair-steps",X.add(z);const fe=new $(as(f.map(ve=>{const at=new ss(ve.w+.02,.05,ve.d+.02);return at.translate(ve.x,ve.y+ve.h/2+.002,ve.z),at}),!1),r.steel);fe.name="pad-stair-treads",X.add(fe);const W=[],D=zo-jn,te=-Math.atan2(Po,Ro),Ye=ve=>Yn-(ve-jn)/Ro*Po;for(const ve of[-1,1]){const at=ve*(Sa+.07),Sn=Math.ceil(D/1.3);for(let Dt=0;Dt<=Sn;Dt+=1){const fn=jn+Dt/Sn*D;W.push({w:.07,h:1,d:.07,x:fn,y:Ye(fn)+.5,z:at})}for(const Dt of[.55,1])W.push({w:Math.hypot(D,E*Po),h:.06,d:.06,x:(jn+zo)/2,y:Yn/2+Dt-Ca*Po/2,z:at,rz:te})}const ot=new $(as(W.map(ve=>{const at=new ss(ve.w,ve.h,ve.d);return ve.rz&&at.rotateZ(ve.rz),at.translate(ve.x,ve.y,ve.z),at}),!1),r.yellow);ot.name="pad-stair-rails",X.add(ot)}const b=[];d.traverse(ee=>{/^clamp-[a-d]$/.test(ee.name)&&b.push(ee)});const g=new Ge;g.position.y=Ra,h.add(g);const F=new Ge;F.name="booster",g.add(F),x(F,"engine",0),x(F,"stage1",3),x(F,"fins",23.2),x(F,"inter",27);const G=new Ge;G.name="upper",g.add(G),x(G,"stage2",30.6);const Z=x(G,"fairing",42.9),B=[];Z.traverse(ee=>{const X=ee;/^fairing-[ab]$/.test(X.name)&&B.push({node:X,x:X.position.x,z:X.position.z})}),Ri(g,r),Vc(g,7,.3),g.updateMatrixWorld(!0);const U=new Sr().setFromObject(G).min.y-g.position.y,S=(ee,X,E)=>{const R={uTime:{value:0},uPower:{value:0},uCore:{value:new q("#fff6dd")},uEdge:{value:new q("#ff9a3a")}},f=new it({uniforms:R,vertexShader:Gc,fragmentShader:Lc,transparent:!0,blending:$e,depthWrite:!1,side:ft}),z=new $(new vs(ee,X,20,4,!0),f);z.rotation.x=Math.PI,z.position.y=-1;const fe=new $(new vs(ee*.54,E,18,3,!0),f);fe.rotation.x=Math.PI,fe.position.y=-1;const W=new Ge;return W.add(z,fe),W.visible=!1,{node:W,uniforms:R,material:f,outer:z,inner:fe}},J=S(2.5,26,15);F.add(J.node);const v=S(1.9,20,12);v.node.position.y=U+1.6,G.add(v.node);const pe=new Li(16756848,0,110,0);pe.position.set(0,2,0),g.add(pe);const xe=Oc(),ce=[],le=[],K=new Eo({map:xe,transparent:!0,opacity:.5,depthWrite:!1,color:new q("#d8d3cc")}),de=(ee,X,E,R,f,z,fe)=>{let W=le.pop();W||(W=new No(K)),W.visible=!0,W.position.set(ee,X,E),W.scale.setScalar(R),W.material=K,h.add(W),ce.push({sprite:W,life:f,max:f,vx:(Math.random()-.5)*z,vy:fe*(.6+Math.random()*.8),vz:(Math.random()-.5)*z,spin:(Math.random()-.5)*.8,grow:R*(1.8+Math.random()*1.4)})};let Se=0,Be=0,ke=0,Ze=0;const Te=(ee,X)=>{const E=ee-Se,R=X-Be,f=Math.cos(Ze),z=Math.sin(Ze);return{lx:E*f-R*z,lz:E*z+R*f}},Pe=(ee,X)=>{const E=Math.cos(Ze),R=Math.sin(Ze);return{x:Se+ee*E+X*R,z:Be-ee*R+X*E}},nt=(ee,X)=>{if(!A)return null;const{lx:E,lz:R}=Te(ee,X);if(Math.abs(R)<=Sa&&E>=jn-.15&&E<=zo){const z=Da+Ca,fe=(zo-E)/(zo-jn),W=Math.min(z,Math.max(1,Math.ceil(fe*z)));return Yn-(z-W)*Po}const f=Math.hypot(E,R);return f>=Ai&&f<=Ec?Yn:null},dt=(ee,X,E)=>{if(!A)return{x:ee,z:X};let{lx:R,lz:f}=Te(ee,X);const z=Math.hypot(R,f);if(E>Yn-1.5){const D=Ai+.25;if(z<D){const Ye=z>1e-4?D/z:0;R=z>1e-4?R*Ye:D,f=z>1e-4?f*Ye:0}return Pe(R,f)}if(!(Math.abs(f)<=Sa+.4&&R>=jn-.2)&&z<ki+.35){const D=ki+.35,te=z>1e-4?D/z:0;R=z>1e-4?R*te:D,f=z>1e-4?f*te:0}const W={x0:-16.6,x1:-8,z0:-2.1,z1:8.7};if(R>W.x0-.35&&R<W.x1+.35&&f>W.z0-.35&&f<W.z1+.35){const D=R-(W.x0-.35),te=W.x1+.35-R,Ye=f-(W.z0-.35),ot=W.z1+.35-f,ve=Math.min(D,te,Ye,ot);ve===D?R=W.x0-.35:ve===te?R=W.x1+.35:ve===Ye?f=W.z0-.35:f=W.z1+.35}for(const D of[{x:-19,z:-8,r:2.5},{x:13,z:7,r:1.7},{x:-13,z:9,r:1.7}]){const te=Math.hypot(R-D.x,f-D.z);if(te<D.r){const Ye=te>1e-4?D.r/te:0;R=te>1e-4?D.x+(R-D.x)*Ye:D.x+D.r,f=te>1e-4?D.z+(f-D.z)*Ye:D.z}}return Pe(R,f)};let Qe=0,Lt=0,rt=0,ht=0,be=0,vt=0,Ot=0,he=0;const St=()=>{pe.intensity=(Qe*.75+Lt*.62)*120};return{group:h,rocket:g,light:pe,platform:A,floorAt:nt,pushOut:dt,setBase(ee,X,E){Se=ee,Be=X,ke=E,h.position.set(ee,E,X)},baseX:()=>Se,baseZ:()=>Be,setLift(ee){rt=ee,g.position.y=Ra+ee},setThrottle(ee){Qe=Math.max(0,Math.min(1,ee)),J.node.visible=Qe>.01,J.uniforms.uPower.value=Qe,St()},setUpperThrottle(ee){Lt=Math.max(0,Math.min(1,ee)),v.node.visible=Lt>.01,v.uniforms.uPower.value=Lt,St()},setStage1Separation(ee){vt=Math.max(0,Math.min(1,ee));const X=vt;he=38*X*X,F.position.set(2.6*X*X,-he,-2.2*X*X),F.rotation.set(.16*X+.4*X*X,.5*X,.26*X+.62*X*X),pe.position.y=2+(U+2-2)*Math.min(1,X*1.4)},setFairingSeparation(ee){Ot=Math.max(0,Math.min(1,ee));const X=Ot;for(const E of B){const R=E.x>=0?1:-1;E.node.position.x=E.x+R*7.2*X,E.node.position.z=E.z+2.8*X*X,E.node.position.y=-2.4*X*X,E.node.rotation.z=-R*.55*X,E.node.rotation.x=.22*X}},boosterDrop:()=>he,upperBaseY:()=>U,setPadVisible(ee){d.visible=ee},setFacing(ee){Ze=ee,h.rotation.y=ee},setClamps(ee){ht=Math.max(0,Math.min(1,ee));for(const X of b){const E=X.position.x,R=X.position.z,f=Math.atan2(E,R),z=new Y(Math.cos(f),0,-Math.sin(f));X.quaternion.setFromAxisAngle(z,ht*.62)}},update(ee,X,E){const R=1+Math.min(1.6,E/180);for(const f of[J,v])f.uniforms.uTime.value=ee,f.node.scale.set(1,R,1),f.node.rotation.y=ee*2.4;if(Qe>.05&&E<90)for(be+=X*(6+Qe*22);be>1;){be-=1;const f=Math.random()*Math.PI*2,z=2+Math.random()*3.4;de(Se+Math.cos(f)*z,ke+Ra+rt*.06+Math.random()*3,Be+Math.sin(f)*z,2.6+Math.random()*3.2,1.5+Math.random()*1.6,9+Qe*16,3+Qe*8)}for(let f=ce.length-1;f>=0;f-=1){const z=ce[f];z.life-=X;const fe=1-z.life/z.max;z.sprite.position.x+=z.vx*X,z.sprite.position.y+=z.vy*X,z.sprite.position.z+=z.vz*X,z.vy+=X*.6,z.vx*=1-X*.6,z.vz*=1-X*.6,z.sprite.scale.setScalar(Pr.lerp(z.sprite.scale.x,z.grow,Math.min(1,X*1.6))),z.sprite.material.opacity=Math.max(0,.5*(1-fe)*(1-fe)),z.sprite.material.rotation+=z.spin*X,z.life<=0&&(z.sprite.visible=!1,le.push(z.sprite),ce.splice(f,1))}},dispose(){for(const ee of ce)h.remove(ee.sprite),ee.sprite.visible=!1;ce.length=0,xe.dispose(),K.dispose();for(const ee of[J,v])ee.material.dispose(),ee.outer.geometry.dispose(),ee.inner.geometry.dispose();for(const ee of Object.values(r))ee.dispose()}}}let Ci=null;function qn(){if(typeof window>"u")return null;const n=window.AudioContext||window.webkitAudioContext;return n?(Ci??=new n,Ci):null}let Ms=null,_a=null;function Hc(){const n=qn();n&&n.state==="suspended"&&n.resume().catch(()=>{})}function ws(){const n=Ms;Ms=null,n?.stop();const t=_a;_a=null,t?.stop();for(const o of Jo)try{o.stop()}catch{}Jo.length=0;try{window.speechSynthesis?.cancel()}catch{}}function jc(n){if(!Do().soundOn)return;const t=qn();if(!t)return;t.state==="suspended"&&t.resume().catch(()=>{});const o=t.currentTime,a=t.createOscillator(),c=t.createGain();a.type="square",a.frequency.setValueAtTime(n?1320:880,o),c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(n?.09:.055,o+.01),c.gain.exponentialRampToValueAtTime(1e-4,o+(n?.34:.16)),a.connect(c),c.connect(t.destination),a.start(o),a.stop(o+.4)}function Yc(n,t,o){if(!Do().soundOn)return null;const a=qn();if(!a)return null;a.state==="suspended"&&a.resume().catch(()=>{}),ws();const c=a.currentTime,y=c+Math.max(0,n),r=y+Math.max(2,t),h=a.createGain();h.gain.setValueAtTime(1e-4,c),h.gain.exponentialRampToValueAtTime(.85,c+.2);const C=a.createDynamicsCompressor();C.threshold.value=-16,C.knee.value=14,C.ratio.value=3.6,C.attack.value=.006,C.release.value=.35,h.connect(C),C.connect(a.destination);const x=[],d=[],A=(K,de,Se)=>{K.start(de),K.stop(de+Se),x.push(K)},b=Math.floor(a.sampleRate*2.5),g=a.createBuffer(1,b,a.sampleRate),F=g.getChannelData(0);let G=0,Z=0,B=0,U=0,S=0,J=0,v=0;for(let K=0;K<b;K+=1){const de=Math.random()*2-1;G=.99886*G+de*.0555179,Z=.99332*Z+de*.0750759,B=.969*B+de*.153852,U=.8665*U+de*.3104856,S=.55*S+de*.5329522,J=-.7616*J-de*.016898,F[K]=(G+Z+B+U+S+J+v+de*.5362)*.12,v=de*.115926}const pe=(K,de,Se,Be,ke,Ze,Te=1,Pe=.02)=>{const nt=a.createBufferSource();nt.buffer=g,nt.loop=!0;const dt=a.createBiquadFilter();dt.type=Be,dt.Q.value=Te,dt.frequency.setValueAtTime(ke,K),Ze!==ke&&dt.frequency.exponentialRampToValueAtTime(Math.max(20,Ze),K+de);const Qe=a.createGain();Qe.gain.setValueAtTime(1e-4,K),Qe.gain.exponentialRampToValueAtTime(Math.max(2e-4,Se),K+Pe),Qe.gain.setValueAtTime(Math.max(2e-4,Se),Math.max(K+Pe,K+de*.55)),Qe.gain.exponentialRampToValueAtTime(1e-4,K+de),nt.connect(dt),dt.connect(Qe),Qe.connect(h),d.push(dt,Qe),A(nt,K,de+.05)},xe=(K,de,Se,Be,ke,Ze="sine")=>{const Te=a.createOscillator();Te.type=Ze,Te.frequency.setValueAtTime(Se,K),Te.frequency.exponentialRampToValueAtTime(Math.max(8,Be),K+de*.85);const Pe=a.createGain();Pe.gain.setValueAtTime(1e-4,K),Pe.gain.exponentialRampToValueAtTime(Math.max(2e-4,ke),K+.05),Pe.gain.exponentialRampToValueAtTime(1e-4,K+de),Te.connect(Pe),Pe.connect(h),d.push(Pe),A(Te,K,de+.02)},ce=.55+Math.min(.45,o*.12);xe(y,1.5,96,26,ce),pe(y,1.2,.55,"lowpass",2600,260,.8,.01);for(const[K,de]of[[41,.5],[58,.32],[83,.18]]){const Se=a.createOscillator();Se.type="sawtooth",Se.frequency.setValueAtTime(K*1.25,y),Se.frequency.exponentialRampToValueAtTime(K,y+t*.4);const Be=a.createGain();Be.gain.value=.6;const ke=a.createOscillator();ke.frequency.value=6.5+Math.random()*3.5;const Ze=a.createGain();Ze.gain.value=.4,ke.connect(Ze),Ze.connect(Be.gain);const Te=a.createBiquadFilter();Te.type="lowpass",Te.frequency.value=180;const Pe=a.createGain();Pe.gain.setValueAtTime(1e-4,y),Pe.gain.exponentialRampToValueAtTime(de,y+.8),Pe.gain.setValueAtTime(de,r-Math.max(1,t*.35)),Pe.gain.exponentialRampToValueAtTime(1e-4,r),Se.connect(Be),Be.connect(Te),Te.connect(Pe),Pe.connect(h),d.push(Be,Te,Pe),A(Se,y,t+.1),A(ke,y,t+.1)}pe(y,t*.9,.34,"bandpass",1800,900,.9,.05),pe(y+1.2,t*.85,.22,"highpass",2600,5200,.7,.8),pe(y+2.4,t*.6,.2,"bandpass",700,2400,.6,1.2),h.gain.setValueAtTime(.85,Math.max(c+.2,r-1.6)),h.gain.exponentialRampToValueAtTime(1e-4,r+.4);const le={stop:()=>{const K=a.currentTime;try{h.gain.cancelScheduledValues(K),h.gain.setValueAtTime(Math.max(1e-4,h.gain.value),K),h.gain.exponentialRampToValueAtTime(1e-4,K+.25)}catch{}for(const de of x)try{de.stop(K+.3)}catch{}window.setTimeout(()=>{for(const de of d)de.disconnect();h.disconnect(),C.disconnect()},400)}};return Ms=le,le}function Xc(n=0){if(!Do().soundOn)return;const t=qn();if(!t)return;t.state==="suspended"&&t.resume().catch(()=>{});const o=t.currentTime,a=t.createGain();a.gain.setValueAtTime(.9,o),a.connect(t.destination);const c=[],y=t.createOscillator();y.type="sine",y.frequency.setValueAtTime(130+n*6,o),y.frequency.exponentialRampToValueAtTime(38,o+.3);const r=t.createGain();r.gain.setValueAtTime(1e-4,o),r.gain.exponentialRampToValueAtTime(.5,o+.012),r.gain.exponentialRampToValueAtTime(1e-4,o+.34),y.connect(r),r.connect(a),y.start(o),y.stop(o+.4),c.push(y);const h=Math.floor(t.sampleRate*.9),C=t.createBuffer(1,h,t.sampleRate),x=C.getChannelData(0);for(let G=0;G<h;G+=1)x[G]=(Math.random()*2-1)*(1-G/h);const d=t.createBufferSource();d.buffer=C;const A=t.createBiquadFilter();A.type="bandpass",A.Q.value=1.1,A.frequency.setValueAtTime(3200,o+.02),A.frequency.exponentialRampToValueAtTime(700,o+.55);const b=t.createGain();b.gain.setValueAtTime(1e-4,o),b.gain.exponentialRampToValueAtTime(.42,o+.03),b.gain.exponentialRampToValueAtTime(1e-4,o+.7),d.connect(A),A.connect(b),b.connect(a),d.start(o),d.stop(o+.85),c.push(d);const g=t.createOscillator();g.type="square",g.frequency.setValueAtTime(1750,o+.03);const F=t.createGain();F.gain.setValueAtTime(1e-4,o+.03),F.gain.exponentialRampToValueAtTime(.07,o+.045),F.gain.exponentialRampToValueAtTime(1e-4,o+.13),g.connect(F),F.connect(a),g.start(o+.03),g.stop(o+.15),c.push(g),window.setTimeout(()=>{for(const G of c)G.disconnect();a.disconnect()},1200)}function qc(){if(!Do().soundOn)return;const n=qn();if(!n)return;n.state==="suspended"&&n.resume().catch(()=>{});const t=n.currentTime,o=n.createGain();o.gain.setValueAtTime(.8,t),o.connect(n.destination);const a=[];for(const[d,A]of[[0,620],[.07,480]]){const b=n.createOscillator();b.type="triangle",b.frequency.setValueAtTime(A,t+d),b.frequency.exponentialRampToValueAtTime(A*.45,t+d+.22);const g=n.createGain();g.gain.setValueAtTime(1e-4,t+d),g.gain.exponentialRampToValueAtTime(.16,t+d+.01),g.gain.exponentialRampToValueAtTime(1e-4,t+d+.26),b.connect(g),g.connect(o),b.start(t+d),b.stop(t+d+.3),a.push(b)}const c=Math.floor(n.sampleRate*1.4),y=n.createBuffer(1,c,n.sampleRate),r=y.getChannelData(0);for(let d=0;d<c;d+=1)r[d]=Math.random()*2-1;const h=n.createBufferSource();h.buffer=y;const C=n.createBiquadFilter();C.type="highpass",C.frequency.setValueAtTime(1200,t),C.frequency.exponentialRampToValueAtTime(3e3,t+1.2);const x=n.createGain();x.gain.setValueAtTime(1e-4,t+.1),x.gain.exponentialRampToValueAtTime(.12,t+.4),x.gain.exponentialRampToValueAtTime(1e-4,t+1.4),h.connect(C),C.connect(x),x.connect(o),h.start(t),h.stop(t+1.45),a.push(h),window.setTimeout(()=>{for(const d of a)d.disconnect();o.disconnect()},1800)}function $c(n){if(!Do().soundOn)return null;const t=qn();if(!t)return null;t.state==="suspended"&&t.resume().catch(()=>{});const o=t.currentTime,a=t.createGain();a.gain.setValueAtTime(1e-4,o),a.gain.exponentialRampToValueAtTime(.75,o+.16),a.gain.setValueAtTime(.75,o+Math.max(.4,n*.5)),a.gain.exponentialRampToValueAtTime(1e-4,o+n),a.connect(t.destination);const c=[];for(const[b,g]of[[92,.3],[138,.2],[205,.12]]){const F=t.createOscillator();F.type="sawtooth",F.frequency.setValueAtTime(b*1.2,o),F.frequency.exponentialRampToValueAtTime(b,o+n*.5);const G=t.createBiquadFilter();G.type="lowpass",G.frequency.value=420;const Z=t.createGain();Z.gain.setValueAtTime(1e-4,o),Z.gain.exponentialRampToValueAtTime(g,o+.3),Z.gain.exponentialRampToValueAtTime(1e-4,o+n),F.connect(G),G.connect(Z),Z.connect(a),F.start(o),F.stop(o+n+.05),c.push(F)}const y=Math.floor(t.sampleRate*1.5),r=t.createBuffer(1,y,t.sampleRate),h=r.getChannelData(0);for(let b=0;b<y;b+=1)h[b]=Math.random()*2-1;const C=t.createBufferSource();C.buffer=r,C.loop=!0;const x=t.createBiquadFilter();x.type="bandpass",x.Q.value=.7,x.frequency.setValueAtTime(2400,o),x.frequency.exponentialRampToValueAtTime(900,o+n);const d=t.createGain();d.gain.setValueAtTime(1e-4,o),d.gain.exponentialRampToValueAtTime(.26,o+.2),d.gain.exponentialRampToValueAtTime(1e-4,o+n),C.connect(x),x.connect(d),d.connect(a),C.start(o),C.stop(o+n+.05),c.push(C);const A={stop:()=>{const b=t.currentTime;try{a.gain.cancelScheduledValues(b),a.gain.setValueAtTime(Math.max(1e-4,a.gain.value),b),a.gain.exponentialRampToValueAtTime(1e-4,b+.25)}catch{}for(const g of c)try{g.stop(b+.3)}catch{}window.setTimeout(()=>a.disconnect(),400)}};return _a?.stop(),_a=A,A}const Fi={three:"audio/count-three.mp3",two:"audio/count-two.mp3",one:"audio/count-one.mp3",liftoff:"audio/count-liftoff.mp3"};let xs=null,Zc=null;const Jo=[];function Kc(){const n=qn();n&&(Zc??=(async()=>{const t=await Promise.all(Object.keys(Fi).map(async o=>{const a=await fetch(Fi[o]);if(!a.ok)throw new Error(`countdown voice ${o}`);return[o,await n.decodeAudioData(await a.arrayBuffer())]}));xs=new Map(t)})().catch(()=>{xs=null}))}function Jc(n){const t=typeof window>"u"?null:window.speechSynthesis;if(t)try{const o=n==="liftoff"?"Liftoff!":`${n[0].toUpperCase()}${n.slice(1)}`,a=new SpeechSynthesisUtterance(o);a.lang="en-US",a.volume=.9,a.rate=1.02,t.speak(a)}catch{}}function Qc(n){if(!Do().soundOn)return;const t=qn();if(!t)return;t.state==="suspended"&&t.resume().catch(()=>{});const o=xs?.get(n);if(!o){Jc(n);return}const a=t.createBufferSource();a.buffer=o;const c=t.createGain();c.gain.value=.55,a.connect(c),c.connect(t.destination),a.start(t.currentTime+.05),Jo.push(a),a.onended=()=>{const y=Jo.indexOf(a);y>=0&&Jo.splice(y,1),a.disconnect(),c.disconnect()}}const Ni={sun:{air:500,esc:617.7},trappist1:{air:400,esc:529},proxima:{air:400,esc:550},mercury:{air:null,esc:4.25},venus:{air:150,esc:10.36},earth:{air:100,esc:11.19},mars:{air:80,esc:5.03},jupiter:{air:500,esc:59.5},saturn:{air:500,esc:35.5},"saturn-ring":{air:500,esc:35.5},uranus:{air:350,esc:21.3},neptune:{air:400,esc:23.5},titan:{air:200,esc:2.64},pluto:{air:null,esc:1.21},eris:{air:null,esc:1.38},haumea:{air:null,esc:.84},makemake:{air:null,esc:.77},moon:{air:null,esc:2.38},io:{air:null,esc:2.56},europa:{air:null,esc:2.03},ganymede:{air:null,esc:2.74},callisto:{air:null,esc:2.44},enceladus:{air:null,esc:.24},charon:{air:null,esc:.59}},el=(n,t,o)=>Math.min(o,Math.max(t,n));function tl(n){const{stage1Km:t,leaveKm:o}=n,a=o-t;return[[0,0],[18,20],[36,90],[52,600],[70,t*.22*1e3],[96,t*1e3],[150,(t+a*.42)*1e3],[240,(t+a*.72)*1e3],[322,o*1e3],[430,o*1.06*1e3],[700,o*1.6*1e3]]}function Yi(n,t,o){const a=Math.max(0,t),c=n[0];if(a<=c[0])return c[1];for(let h=1;h<n.length;h+=1){const[C,x]=n[h],[d,A]=n[h-1];if(a>C)continue;const b=(a-d)/(C-d);if(!o)return A+(x-A)*b;const g=Math.log(Math.max(1,A)),F=Math.log(Math.max(1,x));return Math.exp(g+(F-g)*b)}const[y,r]=n[n.length-1];return r+(a-y)*(r-n[n.length-2][1])/(y-n[n.length-2][0])}function nl(n,t){return Yi(tl(t),n,!0)}function ol(n,t){const o=t.leaveSpeed,a=[[0,0],[14,18],[28,70],[40,150],[70,o*.16],[96,o*.3],[108,o*.29],[150,o*.42],[240,o*.66],[322,o*.88],[430,o],[700,o*1.15]];return Yi(a,n,!1)}function Ei(n){const t=n&&Ni[n]||Ni.earth,o=t.air??el(Math.round(60+t.esc*40),80,260);return{airTopKm:t.air,escapeKms:t.esc,stage1Km:Math.round(t.air?t.air*.65:o*.45),leaveKm:o,leaveSpeed:Math.round(t.esc*1e3*(t.air?.72:.98))}}const Di="textures/",Yt=Math.PI/180;function Ta(n,t,o=1){return new Y(Math.cos(n*Yt)*Math.cos(t*Yt),Math.sin(n*Yt),-Math.cos(n*Yt)*Math.sin(t*Yt)).multiplyScalar(o)}const tt=2.2,al=Date.UTC(2e3,0,1,12),_i={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},Ii={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function sl(){if(typeof window>"u")return!0;const n=navigator,t=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,o=n.hardwareConcurrency??8,a=n.deviceMemory??8;return!!(t||o<=4||a<=4)}function il(){const t=document.createElement("canvas");t.width=128,t.height=128;const o=t.getContext("2d");if(o){const a=o.createRadialGradient(64,64,0,64,64,64);a.addColorStop(0,"rgba(255,238,205,0.85)"),a.addColorStop(.3,"rgba(255,214,150,0.55)"),a.addColorStop(.45,"rgba(255,190,120,0.22)"),a.addColorStop(.7,"rgba(250,170,95,0.07)"),a.addColorStop(1,"rgba(255,160,80,0)"),o.fillStyle=a,o.fillRect(0,0,128,128)}return new uo(t)}const rl=`
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
}`,cl=`
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
}`;function ll(n){return Math.max(.12,.16+.11*Math.log2(n/2e3))}const ul=`
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
}`,fl=`
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
}`,pl=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,ml=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,Vi=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Wi=`
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
}`,dl=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,hl=`
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
}`,vl=`
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
}`,gl=`
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
}`,yl=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Ml=`
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
}`,wl=`
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
}`,xl=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function Rl(n,t){const o=sl(),a=o?96:128,c=Math.min(1.5,window.devicePixelRatio||1);let y=c,r=0,h=1/60;const C=e=>{y=e,d.setPixelRatio(e),x?.()};let x=null;const d=new zr({antialias:!0,powerPreference:"default",alpha:!1});d.setPixelRatio(c),d.outputColorSpace=_n,d.toneMapping=Rr,d.toneMappingExposure=1.1;const A=Math.min(4,d.capabilities.getMaxAnisotropy()),b=d.domElement;b.style.display="block",b.style.width="100%",b.style.height="100%",b.style.touchAction="none",n.appendChild(b);const g=document.createElement("div");g.className="space-labels",n.appendChild(g);const F=[];let G=0;function Z(){const e=performance.now();if(e-G<400)return;G=e,F.length=0;const s=n.getBoundingClientRect();for(const i of[".explore-top",".sheet",".sky-alert"]){const m=document.querySelector(i);if(!m)continue;const P=m.getBoundingClientRect();P.width<2||P.height<2||F.push({x:P.left-s.left,y:P.top-s.top,w:P.width,h:P.height})}}function B(e,s,i,m=22){for(const P of F)if(e<P.x+P.w&&e+i>P.x&&s<P.y+P.h&&s+m>P.y)return!0;return!1}const U=new Cr;U.background=new q("#05070d");const S=new Fr(45,1,.01,2e3),J=[],v=e=>(J.push(e),e),pe=new Oi,xe=new Nr,ce=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),le=new Map,K=new Map,de=[],Se=new Set;let Be=!1,ke=0;const Ze=(e,s)=>{const i=K.get(e);if(i){K.delete(e);for(const m of i)m(s)}},Te=(e,s=!0)=>{const i=le.get(e);if(i)return i;ke+=1;const m=pe.load(Di+e,()=>{Ze(e,m),ke-=1,ke===0&&t.onReady?.()},void 0,()=>{Ze(e,m),ke-=1,ke===0&&t.onReady?.()});return m.colorSpace=s?_n:bs,m.anisotropy=o?4:8,le.set(e,m),v(m)},Pe=e=>{le.has(e)||Se.has(e)||(Se.add(e),xe.load(Di+e,s=>{Se.delete(e);const i=new Lr;i.image=s,i.colorSpace=_n,i.anisotropy=o?4:8,i.needsUpdate=!0,v(i),le.set(e,i),Ze(e,i)},void 0,()=>{Se.delete(e)}))},nt=()=>{if(!Be){Be=!0;for(const e of de)Pe(e)}},dt=(e,s)=>{if(ce.has(e)){s(Te(e));return}const i=le.get(e);if(i){s(i);return}const m=K.get(e)??[];m.push(s),K.set(e,m),de.includes(e)||(de.push(e),Be&&Pe(e))},Qe=new $(v(new Ve(900,48,24)),v(new Me({map:Te("milkyway.webp"),side:Co,depthWrite:!1})));Qe.rotation.set(63*Yt,0,0),U.add(Qe),U.add(new Er(16777215,.14));const Lt=new Li(16777215,1.6,0,0);Lt.decay=0,U.add(Lt);const rt=new Ge;U.add(rt);const ht=new Map,be=new Map,vt=new Map,Ot=[],he=new Map;let St=null,Vn=null;const ee=new Map,X=new Map,E=new Map,R=new Map;let f=null,z=0,fe=null;const W=[],D=[],te=[],Ye=[],ot=[];let ve=Date.now(),at=!0,Sn=null;function Dt(e,s,i,m){const P=_i[i]??[.7,.7,.7,.06],N=Ii[i],I=new q(s),L=N?.relief??0,O=v(new it({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new Zo(N?.texel?.[0]??1/1024,N?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:L*.35},gain:{value:(N?.gain??1.9)*.6},base:{value:new Y(I.r,I.g,I.b)},glow:{value:new Y(P[0],P[1],P[2])},atmo:{value:Math.min(P[3]*2.2,.85)},ringShadow:{value:m?1:0},ringMap:{value:null},ringInner:{value:m?.inner??1},ringOuter:{value:m?.outer??2},ringCenter:{value:new Y},ringNormal:{value:new Y(0,1,0)}},vertexShader:rl,fragmentShader:cl}));return e&&dt(e,l=>{O.uniforms.dayMap.value=l,O.uniforms.useMap.value=1,L>0&&(O.uniforms.bumpMap.value=l,O.uniforms.useBump.value=1)}),m&&dt("saturn-ring.webp",l=>{O.uniforms.ringMap.value=l}),O}function fn(e,s,i){const m=Ii[i],P=m?.tint??_i[i]?.slice(0,3);if(!P||o)return;const N=Math.min(m?.inner??.12,.5)*.55,I=Math.min(m?.outer??.05,.2)*.9,L=new Y(P[0],P[1],P[2]),O=Math.sqrt(1-1/(1.045*1.045)),l=(k,V,H,ye)=>new $(v(new Ve(s*k,o?24:32,o?16:24)),v(new it({uniforms:{tint:{value:L},power:{value:H},strength:{value:ye},edge:{value:O}},vertexShader:Vi,fragmentShader:Wi,side:V,transparent:!0,blending:$e,depthWrite:!1})));e.add(l(1.045,Co,2.7,N),l(1.16,fi,3.4,I))}function Va(e,s){const i=v(new it({uniforms:{poleN:{value:Ta(80.7,-72.7,1).normalize()},poleS:{value:Ta(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:dl,fragmentShader:hl,transparent:!0,blending:$e,depthWrite:!1})),m=new $(v(new Ve(s*1.022,o?64:96,o?48:64)),i);m.renderOrder=1,e.add(m),Ye.push(i)}function Wa(e,s){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([m,P,N,I,L],O)=>{const l=Ta(m,P,1).normalize(),k=new Y(0,1,0).cross(l).normalize(),V=new Y().crossVectors(l,k).normalize(),H=k.multiplyScalar(Math.cos(L)).addScaledVector(V,Math.sin(L)).normalize(),ye=[];for(let Ce=0;Ce<=16;Ce+=1){const ge=Ce/16,Ie=(ge-.5)*N,Ue=Math.sin(ge*Math.PI)*I;ye.push(new Y().copy(l).multiplyScalar(Math.cos(Ie)).addScaledVector(H,Math.sin(Ie)).normalize().multiplyScalar(s*(.985+Ue)))}const ze=v(new it({uniforms:{uTime:{value:0},seed:{value:O*.37+.11}},vertexShader:vl,fragmentShader:gl,transparent:!0,blending:$e,side:ft,depthWrite:!1})),Re=new $(v(new Ur(new Gr(ye),64,s*.022,8,!1)),ze);Re.raycast=()=>{},e.add(Re),ot.push(ze)})}function Qo(e,s,i=""){const m=document.createElement("button");m.type="button",m.className="space-label"+i,m.textContent=s,m.addEventListener("click",()=>t.onPick?.(e)),g.appendChild(m),vt.set(e,m)}const ea=v(new it({uniforms:{map:{value:Te("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),Wn=new Y,$n=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],ta=new Map;let Kt=null;const Ua={moon:"earth",...Object.fromEntries(mi.map(e=>[e.id,e.parent]))};function Io(e,s){const i=Ua[e];if(Kt===null||!i)return ha(e,s);const m=ha(i,s),P=ha(e,Kt),N=ha(i,Kt);return{x:m.x+P.x-N.x,y:m.y+P.y-N.y,z:m.z+P.z-N.z}}function Zn(e){for(const[s,i]of be){if(s==="sun")continue;const m=Io(s,e);i.position.set(m.x*tt,m.y*tt,m.z*tt)}for(const[s,i]of ee){const m=Io(s,e);i.position.set(m.x*tt,m.y*tt,m.z*tt)}if(fe){Wn.copy(fe.holder.position);const s=Wn.length()||1;fe.tail.visible=s/tt<8,Wn.multiplyScalar(1/s),fe.tail.quaternion.setFromUnitVectors(new Y(0,1,0),Wn),fe.tail.position.copy(Wn).multiplyScalar(.16*tt)}}const Un=new Y(1,0,0),u=v(new it({uniforms:{dayMap:{value:Te("earth-day.webp")},nightMap:{value:Te("earth-night.webp")},normalMap:{value:Te("earth-normal.webp",!1)},specMap:{value:Te("earth-spec.webp",!1)},texel:{value:new Zo(1/2048,1/1024)},sunDir:{value:Un}},vertexShader:ul,fragmentShader:fl}));function p(e){const s=new Ge,i=new $(v(new Ve(e,o?96:128,64)),u);i.name="earth",s.add(i);const m=new $(v(new Ve(e*1.012,80,48)),v(new gs({map:Te("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));s.add(m),St=m;const P=new $(v(new Ve(e*1.06,64,48)),v(new it({uniforms:{sunDir:{value:Un}},vertexShader:`
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
            }`,side:Co,transparent:!0,blending:$e,depthWrite:!1})));s.add(P);const N=new $(v(new Ve(e*1.15,o?24:32,o?16:24)),v(new it({uniforms:{tint:{value:new Y(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:Vi,fragmentShader:Wi,side:fi,transparent:!0,blending:$e,depthWrite:!1})));return s.add(N),ht.set("earth",i),s}function _(e,s,i){for(const m of Yo(e).sites??[]){const P=new $(v(new Ve(i*.018,12,8)),v(new Me({color:"#3182f6"})));P.position.copy(Ta(m.lat,m.lon,i*1.004)),s.add(P);const N=document.createElement("div");N.className="space-site",N.textContent=m.name,g.appendChild(N),Ot.push({mesh:P,site:m,el:N,parent:e})}}let w=null;for(const e of Hr){if(e.id==="moon")continue;const s=new Ge;if(be.set(e.id,s),rt.add(s),e.id==="sun"){const i=.26*tt,m=new $(v(new Ve(i,o?96:128,o?64:80)),ea);m.name="sun",he.set("sun",i),s.add(m),Wa(m,i);for(const[N,I,L,O]of[[1.06,2,.95,"#ffbf78"]])s.add(new $(v(new Ve(i*N,o?32:48,o?24:32)),v(new it({uniforms:{color:{value:new q(O)},power:{value:I},strength:{value:L}},vertexShader:pl,fragmentShader:ml,transparent:!0,blending:$e,depthWrite:!1}))));ht.set("sun",m);const P=new No(v(new Eo({map:v(il()),blending:$e,transparent:!0,depthWrite:!1,depthTest:!0,color:new q("#ffd9a0")})));P.scale.setScalar(i*3.6),s.add(P),Vn=P}else{const i=rs(e.id).radius*tt;he.set(e.id,i);let m;if(e.id==="earth"){const L=p(i);L.rotation.z=-e.tilt*Yt,s.add(L),w=L,m=L.children[0]}else{const L=e.id==="saturn"?{inner:i*1.18,outer:i*2.08}:void 0;m=new $(v(new Ve(i,o?96:128,64)),Dt(e.texture,e.color,e.id,L)),m.name=e.id,m.rotation.z=-e.tilt*Yt,s.add(m),ht.set(e.id,m),fn(s,i,e.id),e.id==="jupiter"&&Va(m,i)}if(e.axes){const[L,O,l]=e.axes;m.scale.set(1,l/L,O/L)}if(e.ring&&e.axes){const L=e.axes[0]/2,O=i*(e.ring.radius-e.ring.width/2)/L,l=i*(e.ring.radius+e.ring.width/2)/L,k=new $(v(new Et(O,Math.max(l,O*1.03),128,1)),v(new Me({color:"#8b8580",side:ft,transparent:!0,opacity:.75,depthWrite:!1})));k.rotation.x=Math.PI/2,s.add(k)}if(e.id==="saturn"){const L=i*1.18,O=i*2.08,l=new Et(L,O,160,1),k=v(new it({uniforms:{ringMap:{value:null},innerRatio:{value:L/O},planetRadius:{value:i},planetCenter:{value:new Y}},vertexShader:yl,fragmentShader:Ml,side:ft,transparent:!0,depthWrite:!1}));dt("saturn-ring.webp",H=>{k.uniforms.ringMap.value=H});const V=new $(v(l),k);V.rotation.x=Math.PI/2,m.add(V),D.push({mesh:V,parent:e.id}),te.push({mesh:m,material:m.material})}e.sites&&_(e.id,m,i);const P=di(e.id,.022),N=v(new cn);N.setAttribute("position",new is(P.positions,3)),N.setIndex(P.index),N.scale(tt,tt,tt);const I=new $(N,v(new Me({color:rs(e.id).ribbon,transparent:!0,opacity:.5,side:ft,depthWrite:!1})));W.push(I),rt.add(I)}Qo(e.id,e.name,e.id==="sun"?"":" is-planet")}const M=[];function ae(e,s,i){let m=e==="main"?1234:98765;const P=()=>(m=m*16807%2147483647,(m-1)/2147483646),N=v(new Nn(1,0)),I=new Float32Array(s*4),L=new Float32Array(s*4);for(let k=0;k<s;k+=1){let V;if(e==="main")do V=2.1+P()*1.2;while((Math.abs(V-2.5)<.03||Math.abs(V-2.82)<.03||Math.abs(V-2.95)<.02)&&P()<.85);else V=P()<.18?39.2+(P()-.5)*1.2:42+(P()-.5)*6.5;I[k*4]=V,I[k*4+1]=P()*Math.PI*2,I[k*4+2]=P()*(e==="main"?.18:.12),I[k*4+3]=P()*Math.PI*2,L[k*4]=(P()-.5)*(e==="main"?.32:.5),L[k*4+1]=P()*Math.PI*2;const H=P()**3;L[k*4+2]=(e==="main"?.0035:.009)*(.7+H*2.4),L[k*4+3]=P()}N.setAttribute("orbit",new pi(I,4)),N.setAttribute("shape",new pi(L,4));const O=v(new it({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new q(i)},uScale:{value:tt}},vertexShader:wl,fragmentShader:xl})),l=new Ea(N,O,s);l.frustumCulled=!1,l.raycast=()=>{},rt.add(l),M.push({mesh:l,material:O})}ae("main",o?1800:4200,"#9c9184"),ae("kuiper",o?1500:3600,"#7f8b9c");for(const e of mi){const s=new Ge,i=new $(v(new Ve(e.radius*tt,32,24)),Dt(`${e.id}.webp`,e.color,e.id));i.name=e.id,s.add(i),rt.add(s),ee.set(e.id,s),X.set(e.id,i);const m=document.createElement("button");m.type="button",m.className="space-label is-small",m.textContent=e.name,m.addEventListener("click",()=>t.onExtra?.(e.id)),g.appendChild(m),E.set(e.id,{el:m,parent:e.parent})}{const e=new Ge,s=new $(v(new Ve(.045*tt,20,16)),v(new Me({color:"#f7fbff"})));s.name="halley",e.add(s);const i=new $(v(new vs(.04*tt,.32*tt,12)),v(new Me({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(i),fe={holder:e,tail:i},rt.add(e),ee.set("halley",e),X.set("halley",s);const m=di("halley",.022),P=v(new cn);P.setAttribute("position",new is(m.positions,3)),P.setIndex(m.index),P.scale(tt,tt,tt);const N=new $(P,v(new Me({color:rs("halley").ribbon,transparent:!0,opacity:.35,side:ft,depthWrite:!1})));W.push(N),rt.add(N);const I=document.createElement("button");I.type="button",I.className="space-label is-small",I.textContent=Q("핼리 혜성"),I.addEventListener("click",()=>t.onExtra?.("halley")),g.appendChild(I),E.set("halley",{el:I,parent:null})}for(const e of jr){const s=Yr(e),i=s.points.map(H=>new Y(H.x*tt,H.y*tt,H.z*tt)),m=v(new cn().setFromPoints(i)),P=new Dr(m,v(new $o({color:e.color,transparent:!0,opacity:.95})));P.visible=!1;const N=new Ge,I=new $(v(new ka(.03,.01,.01,20)),v(new Me({color:"#d8dde4"})));I.rotation.x=Math.PI/2;const L=new $(v(new Ve(.014,12,8)),v(new Me({color:"#c9ced6"})));L.position.z=-.02;const O=new $(v(new ka(.002,.002,.09,6)),v(new Me({color:"#aab3c0"})));O.rotation.z=Math.PI/2,O.position.z=-.02;const l=new $(v(new Ve(.035,16,12)),v(new Me({color:e.color,transparent:!0,opacity:.18,blending:$e,depthWrite:!1})));N.add(I,L,O,l),N.scale.setScalar(e.frame==="earth"?.8:1.3),N.position.copy(i[i.length-1]),P.add(N),(e.frame==="earth"?be.get("earth")??rt:rt).add(P);const V=document.createElement("div");V.className="space-site is-probe",V.textContent=e.name,g.appendChild(V),R.set(e.id,{line:P,probe:N,el:V,points:i,times:s.points.map(H=>H.t),marks:s.marks,frame:e.frame})}if(Zn(ve),w){const e=.055*tt;he.set("moon",e);const s=new $(v(new Ve(e,a,48)),Dt("moon.webp","#b8b8b8","moon"));s.name="moon";const i=new Ge;i.add(s),rt.add(i),ht.set("moon",s),be.set("moon",i),_("moon",s,e),Qo("moon",Q("달")," is-small"),Zn(ve)}const j=new Ge,ue=new Ge,oe=new Ge;j.add(ue,oe),j.visible=!1;let ct="solar",ut=!1,zt=0;const we={moon:new $,moonMat:v(new Me({color:"#ffffff"})),shadow:v(new Me({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new $,umbra:new $,skyCover:new $,skySun:new Ge,skyMoon:new Ge,skyMoonMat:v(new Me({color:"#ffffff"}))},Tn=[],pn=Te("sun.webp"),mn=Te("moon.webp"),Wt=new $(v(new Ve(.62,32,24)),v(new Me({map:pn})));Wt.position.set(-3.3,0,0);const An=new $(v(new Ve(.4,32,24)),v(new Me({map:Te("earth-day.webp")})));An.position.set(1.85,0,0),we.moonMat.map=mn,we.moon=new $(v(new Ve(.14,24,18)),we.moonMat),we.cone=new $(v(new ka(.04,.16,.78,18)),we.shadow),we.cone.position.set(1.42,0,0),we.cone.rotation.z=Math.PI/2,we.umbra=new $(v(new jo(.3,28)),v(new Me({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),we.umbra.position.set(2.75,0,.02),ue.add(Wt,An,we.moon,we.cone,we.umbra);for(const[e,s]of[[Q("태양"),new Y(-3.3,.85,0)],[Q("지구"),new Y(1.85,.68,0)]]){const i=document.createElement("div");i.className="space-site",i.textContent=e,g.appendChild(i),Tn.push({el:i,at:s,group:ue})}const Rt=new $(v(new jo(1.35,48)),v(new Me({map:pn}))),na=new $(v(new Et(1.4,1.7,48)),v(new Me({color:"#f0c36a",transparent:!0,opacity:.45,side:ft,depthWrite:!1})));we.skyCover=new $(v(new jo(1.22,48)),v(new Me({color:"#141820"}))),we.skySun.add(Rt,na,we.skyCover),we.skyMoonMat.map=mn;const dn=new $(v(new jo(.92,48)),we.skyMoonMat),kn=new $(v(new jo(1.08,48)),v(new Me({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));kn.position.z=.16,we.skyMoon.add(dn,kn),oe.add(we.skySun,we.skyMoon);const Xt=document.createElement("div");Xt.className="space-site is-stage",g.appendChild(Xt),Tn.push({el:Xt,at:new Y(0,-1.2,0),group:ue}),oe.visible=!1,U.add(j);const se=new Ge;se.visible=!1,se.rotation.z=-Math.PI/2;const Ae=[],Le=4.6,Ke=e=>Le*e/696e3,et=new $(v(new Ve(Le,64,40)),v(new Me({map:Te("sun.webp")})));et.position.set(-3.2,0,0),se.add(et);const Ee=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let pt=2.4;const st=(e,s)=>{const i=document.createElement("div");i.className="space-site",i.textContent=e,g.appendChild(i),Ae.push({el:i,at:s,group:se})};st(Q("태양"),new Y(-3.2,4.9,0));for(const[e,s]of Ee){const i=Ke(s),m=pt+i;pt=m+i+.72;const P=Yo(e),N=e==="earth"?"earth-day.webp":P.texture,I=v(new Me({color:P.color}));N&&dt(N,O=>{I.map=O,I.color.set("#ffffff"),I.needsUpdate=!0});const L=new $(v(new Ve(i,32,24)),I);if(L.position.set(m,0,0),P.axes&&L.scale.set(1,P.axes[2]/P.axes[0],P.axes[1]/P.axes[0]),se.add(L),e==="saturn"){const O=i*1.18,l=i*2.08,k=v(new Et(O,l,96,1)),V=k.attributes.position,H=k.attributes.uv,ye=new Y;for(let Ce=0;Ce<V.count;Ce+=1)ye.fromBufferAttribute(V,Ce),H.setXY(Ce,(ye.length()-O)/(l-O),.5);const ze=v(new Me({color:"#b9b3ab",transparent:!0,opacity:.9,side:ft,depthWrite:!1}));dt("saturn-ring.webp",Ce=>{ze.map=Ce,ze.color.set("#ffffff"),ze.needsUpdate=!0});const Re=new $(k,ze);Re.rotation.y=Math.PI/2-.36,L.add(Re)}st(P.name,new Y(m,(e==="saturn"?i*2.08:i)+.12,0))}U.add(se);const We=new Ge;We.visible=!1;const At=[],gt=[],hn=new $(v(new Ve(.55,48,32)),v(new Me({color:"#e0703a"})));We.add(hn);for(const[e,s]of[[1.35,.16],[2.1,.05]])We.add(new $(v(new Ve(.55*e,32,24)),v(new Me({color:"#ff6a30",transparent:!0,opacity:s,side:Co,blending:$e,depthWrite:!1}))));const vn=new $(v(new Et(2.6,5.1,96,1)),v(new Me({color:"#3fbf7f",transparent:!0,opacity:.12,side:ft,depthWrite:!1})));vn.rotation.x=Math.PI/2,We.add(vn),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,s,i,m,P],N)=>{const I=new ui(v(new cn().setFromPoints(Array.from({length:128},(l,k)=>new Y(Math.cos(k/128*Math.PI*2)*i*100,0,Math.sin(k/128*Math.PI*2)*i*100)))),v(new $o({color:"#8b95a1",transparent:!0,opacity:.35})));We.add(I);const L=new $(v(new Ve(.16*m,24,16)),Dt(void 0,P,"earth"));We.add(L);const O=document.createElement("button");O.type="button",O.className="space-label is-small",O.textContent=e,O.addEventListener("click",()=>t.onExtra?.(`trappist-${e}`)),g.appendChild(O),At.push({mesh:L,a:i*100,period:s,phase0:N*1.7,el:O})});const Pn=new ui(v(new cn().setFromPoints(Array.from({length:256},(e,s)=>new Y(Math.cos(s/256*Math.PI*2)*38.7,0,Math.sin(s/256*Math.PI*2)*38.7)))),v(new $o({color:"#c5b8a2",transparent:!0,opacity:.5})));We.add(Pn);for(const[e,s]of[["TRAPPIST-1",new Y(0,1.1,0)],[Q("생명가능지대(대략)"),new Y(3.9,0,0)],[Q("비교: 우리 수성의 궤도"),new Y(0,0,38.7)]]){const i=document.createElement("div");i.className="space-site",i.textContent=e,g.appendChild(i),gt.push({el:i,at:s})}U.add(We);const Ut=Kr(v),fo=Ut.labels.map(({name:e,at:s})=>{const i=document.createElement("div");return i.className="space-site",i.textContent=e,g.appendChild(i),{el:i,at:s}});U.add(Ut.group);const Bt=Qr(),Ga=[];if(Bt)for(const[e,s]of Object.entries(Bt.groups)){U.add(s);for(const i of Bt.markers[e]){const m=document.createElement("button");m.type="button",m.className="space-label",m.textContent=i.name,m.addEventListener("click",()=>{t.onMarker?.(i),Xe.target.copy(i.position),Xe.radius=mo[e]*(i.id==="cmb"?1.4:e==="group"?.6:.42)}),g.appendChild(m),Ga.push({level:e,marker:i,el:m})}}const Ss=[];if(Bt){const s=(N,I)=>new Y(Math.cos(I*Yt)*Math.cos(N*Yt),Math.sin(I*Yt),-Math.cos(I*Yt)*Math.sin(N*Yt)).multiplyScalar(140),i=[];for(const N of Object.values(hi))for(const I of N)for(let L=0;L<I.length-1;L+=1){const O=s(I[L][0],I[L][1]),l=s(I[L+1][0],I[L+1][1]);i.push(O.x,O.y,O.z,l.x,l.y,l.z)}const m=v(new cn);m.setAttribute("position",new is(i,3));const P=new Ui(m,v(new $o({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));Bt.groups.stars.add(P);for(const N of Xr){if(!hi[N.id])continue;const I=document.createElement("button");I.type="button",I.className="space-label is-const",I.textContent=N.name.replace(/\(.*\)/,"").split(" · ")[0],I.addEventListener("click",()=>t.onConstellation?.(N.id)),g.appendChild(I),Ss.push({el:I,at:s(N.center[0],N.center[1])})}}const oa=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let De="system",po=!1,Ts=!1;const mo={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},ho=new Y,He={theta:.6,phi:.95,radius:34},Xe={target:new Y,radius:He.radius};let wt="system",_t=null,qt=null,on=null;function aa(e){if((e==="system"||e==="sizes")&&nt(),De=e,po=!1,rt.visible=e==="system",j.visible=e==="eclipse",se.visible=e==="sizes",We.visible=e==="exo",Ut.group.visible=e==="blackhole",Bt)for(const[s,i]of Object.entries(Bt.groups))i.visible=s===e;wt="system",_t=null,qt=null,on=null,Xe.target.set(0,0,0),Xe.radius=mo[e],e!=="system"&&(He.phi=1.1),e==="eclipse"&&(ue.rotation.z=S.aspect<1?-Math.PI/2:0,He.theta=0,He.phi=ut?Math.PI/2:1.25,Xe.target.set(0,0,0),ut||Xe.target.set(-.7,0,0).applyEuler(ue.rotation),Xe.radius=ut?6:S.aspect<1?10:7.5),e==="exo"&&(He.phi=.75),e==="blackhole"&&(He.phi=1.42),e==="sizes"&&(He.theta=0,He.phi=Math.PI/2,Xe.target.set(.6,-6.8,0),Xe.radius=19)}function La(e){if(e!=="earth"&&nt(),po=!1,De!=="system"&&(De="system",rt.visible=!0,j.visible=!1,se.visible=!1,We.visible=!1,Ut.group.visible=!1,Bt))for(const i of Object.values(Bt.groups))i.visible=!1;if(wt=e,qt=null,on=null,e==="system"){_t=null,Xe.target.set(0,0,0),Xe.radius=mo.system;return}_t=be.get(e)??null;const s=he.get(e)??ll(Yo(e).km);Xe.radius=e==="sun"?3.2:e==="jupiter"?3.4*tt:e==="saturn"?2.6*tt:Math.max(s*(Yo(e).ring?6:4.2),.25)}function Xi(e){const s=ee.get(e);s&&(De!=="system"&&aa("system"),wt="system",_t=s,qt=null,on=null,Xe.radius=e==="halley"?1.6:.6,bn=performance.now())}function qi(e){on=(e?Ot.find(i=>i.parent===wt&&i.site.name===e.name):void 0)?.mesh??null,qt=on?new Y:null,bn=performance.now()}let T=null,Oe=0,Ct=-.12;const Oa=62,As=18,ks=85;let Gn=Oa,vo=0,Kn=0,go=0,Ps=0,sa=null,Ln=null,me=null,Fe="idle",Tt=0,an=0,ia=-1,Je=0,Jn=0,yt=0,Mt=0,It=0,ra=!1,Vo=!1,Wo=Ei("earth");const Ba=3.6,ca=2,$i=430;let zn=0,Ha=0,Uo=0,sn=-1,On=-1,Qn=null,eo=0;const zs=96,Zi=322;let yo=0,yn=0,to=0,Go=0,Rs=0,Cs=0;const Mo=3.4,Fs=6.6,la=2.8,Ns=4.6,no=620;let ie=0,re=0,oo=0,kt=0,xt=0,bt=0,ao=0,Jt=!0,Rn=!1,ja=0,Gt=!0,Lo=9.81,so="first",Es="office";const Ki=4.6,Ds=1.8,_s=16;let wo=Ki,Oo=0,Mn=Math.PI,Ft=0,$t=0;const Ji=new Y(0,1,0);let Bo=0,xo=0,bo=Number.NaN,wn=null,io=0,ro=0,Ya=new q("#000000"),ua=0;const Qi=new q("#5a1206");let fa=0,Xa=0,qa=-24,$a=120;const Qt=new Set;function er(){if(Qe.visible=!0,rt.visible=De==="system",j.visible=De==="eclipse",se.visible=De==="sizes",We.visible=De==="exo",Ut.group.visible=De==="blackhole",Bt)for(const[e,s]of Object.entries(Bt.groups))s.visible=e===De}function Is(e,s){T&&(U.remove(T.group),T.dispose(),T=null),Hs();const i=$r(e);sa=e,Ln=i,Wo=Ei(e),T=Rc(i,{low:o,anisotropy:A,onLand:m=>t.onSurfaceDrop?.({id:e,seconds:m.seconds,bounces:m.bounces,outcome:m.outcome}),onImpact:nr}),U.add(T.group),Ya=new q(i.fog),ua=i.fogDensity,U.fog=new Or(Ya.clone(),ua),Oe=(i.companion?i.companionAz:i.sunAz)*Yt,Ct=-.12,Mn=Math.PI-Oe,Ft=0,$t=0,Bo=0,xo=0,va(),Gn=Oa,ie=T.standX,re=T.standZ,oo=0,kt=0,xt=0,bt=0,ao=0,Jt=!0,Rn=!1,ja=0,Gt=T.walkable,Lo=Math.max(0,i.gravityMps2),fa=0,Xa=0,qa=i.terrain==="ring"?-24:-1,$a=i.terrain==="ring"?110:240,Kn=0,go=Math.max(.6,s),Ps=i.cloudTop!==null?260:150,Oo=0,bo=Number.NaN,yn=0,to=0,Go=0,T.avatar.setSkin(Es),T.avatar.setVisible(so==="third"),Bs(),bn=performance.now()}function Vs(e){if(!T){if(Qe.visible=!1,rt.visible=!1,j.visible=!1,se.visible=!1,We.visible=!1,Ut.group.visible=!1,Bt)for(const s of Object.values(Bt.groups))s.visible=!1;g.style.display="none",f=null,Kt=null,at=!0,S.fov=62,S.near=.08,S.far=6e3,S.updateProjectionMatrix()}Is(e,1.9)}function tr(e){if(!T){Vs(e);return}Is(e,1.1)}function Ws(){T&&(va(),Hs(),U.remove(T.group),T.dispose(),T=null,U.fog=null,d.toneMappingExposure=1.1,g.style.display="",er(),S.fov=45,S.near=.01,S.far=2e3,S.updateProjectionMatrix(),ho.copy(Xe.target),He.radius=Xe.radius,bn=performance.now())}function Za(){if(!T)return;const e=4.2+Math.random()*1.4,s=(Math.random()-.5)*1.8,i=ie-T.standX+Math.sin(Oe)*e+Math.cos(Oe)*s,m=re-T.standZ-Math.cos(Oe)*e+Math.sin(Oe)*s;T.drop(i,m)}function nr(){if(t.onSurfaceImpact?.(),!T)return;const e=Math.sin(Oe),s=-Math.cos(Oe),i=Math.hypot(ie-Rs,re-Cs);if(i<46){const m=Math.max(.35,1-i/46);io-=e*(3.4+m*5.2),ro-=s*(3.4+m*5.2),Go=2.8+m*.9,yn=1,to=1,Ho(180)}else io-=e*8.2,ro-=s*8.2;Gt?Jt&&(kt=Math.max(kt,2.8),Jt=!1):kt+=1.8}function or(){if(!T)return;const e=22+Math.random()*8,s=(Math.random()-.5)*5,i=Math.sin(Oe),m=-Math.cos(Oe),P=ie+i*e+Math.cos(Oe)*s,N=re+m*e+Math.sin(Oe)*s;Rs=P,Cs=N,T.impact.strike(P,N,i,m),Zr()}function en(){t.onSurfaceRocket?.({phase:Fe,count:an,altitude:Je,alt:nl(Je,Wo),speed:ol(Je,Wo),event:Qn,air:Wo.airTopKm!==null,kind:Ln?.kind,ring:sa==="saturn-ring",fantasyNote:Ln?Ln.kind==="star"?"star":sa==="saturn-ring"?"ring":Ln.cloudTop!==null?"gas":null:null,star:Ln?.kind==="star",gravityFree:Wo.airTopKm===null})}function Ho(e){try{const s=navigator;typeof s.vibrate=="function"&&s.vibrate(e)}catch{}}const Us=.46;function So(e,s){if(!me||!me.platform)return null;const i=me.floorAt(e,s);return i===null?null:It+i}function Gs(e,s){const i=T?T.meshHeightAt(e,s)+Ft:0,m=So(e,s);return m===null?i:Math.max(i,m)}function ar(e,s,i){if(!me||!me.platform||!T)return;const m=So(e,s),P=Gs(e,s);let N=So(ie,re),I=Gs(ie,re);const L=I-P;if((m!==null||N!==null)&&(L>Us||L<-.6)){let Re=!1;for(const[Ce,ge]of[[ie,s],[e,re]]){const Ie=So(Ce,ge),Ue=Ie===null?T.meshHeightAt(Ce,ge)+Ft:Math.max(T.meshHeightAt(Ce,ge)+Ft,Ie),je=Ue-P;if(je<=Us&&je>=-.6){ie=Ce,re=ge,N=Ie,I=Ue,Re=!0;break}}Re||(ie=e,re=s,N=m,I=P,xt*=.2,bt*=.2)}const O=N===null?T.meshHeightAt(ie,re)+Ft:Math.max(I,N);if($t+=(O-$t)*Math.min(1,i*16),Math.abs(O-$t)<.002&&($t=O),Fe!=="idle")return;const k=(N===null?T.meshHeightAt(ie,re)+Ft:Math.max(I,N))-It,V=me.pushOut(ie,re,k);if(V.x===ie&&V.z===re)return;const H=V.x-ie,ye=V.z-re,ze=Math.hypot(H,ye);if(ie=V.x,re=V.z,ze>1e-4){const Re=H/ze,Ce=ye/ze,ge=xt*Re+bt*Ce;ge<0&&(xt-=ge*Re,bt-=ge*Ce)}}function Ls(){let e=ie+Math.sin(Oe)*20,s=re-Math.cos(Oe)*20,i=1/0;const m=(I,L)=>{if(!T)return 0;if(!T.walkable)return T.floorAt(I,L);let O=T.meshHeightAt(I,L);for(let l=0;l<12;l+=1){const k=l/12*Math.PI*2;O=Math.max(O,T.meshHeightAt(I+Math.cos(k)*3.5,L+Math.sin(k)*3.5)),O=Math.max(O,T.meshHeightAt(I+Math.cos(k)*7,L+Math.sin(k)*7))}return O},P=(I,L)=>{if(!T||!T.walkable)return 0;let O=1/0,l=-1/0;for(let k=0;k<12;k+=1){const V=k/12*Math.PI*2;for(const H of[0,3.5,7]){const ye=T.meshHeightAt(I+Math.cos(V)*H,L+Math.sin(V)*H);O=Math.min(O,ye),l=Math.max(l,ye)}}return l-O},N=(I,L,O)=>{if(!T||!T.walkable)return 0;const l=ie-I,k=re-L,V=Math.hypot(l,k)||1;let H=0;for(const ye of[6.6,9,11.6]){const ze=T.meshHeightAt(I+l/V*ye,L+k/V*ye);H=Math.max(H,O-ze)}return Math.max(0,H)};for(const I of[-.55,-.28,0,.28,.55])for(const L of[20,24,28]){const O=Oe+I,l=ie+Math.sin(O)*L,k=re-Math.cos(O)*L,V=Math.hypot(l,k)>no-40?6:0,H=T?Math.abs((T.walkable?T.meshHeightAt(l,k):T.floorAt(l,k))-T.meshHeightAt(ie,re)):0,ye=N(l,k,m(l,k)),ze=P(l,k)*2.5+H*1.2+V+Math.abs(I)*.6+ye*4;ze<i&&(i=ze,e=l,s=k)}return{x:e,z:s}}function Os(e,s){if(!(!me||!T)){if(yt=e,Mt=s,T.walkable){let i=T.meshHeightAt(e,s);for(let L=0;L<12;L+=1){const O=L/12*Math.PI*2;i=Math.max(i,T.meshHeightAt(e+Math.cos(O)*3.5,s+Math.sin(O)*3.5)),i=Math.max(i,T.meshHeightAt(e+Math.cos(O)*7,s+Math.sin(O)*7))}const m=ie-e,P=re-s,N=Math.hypot(m,P)||1,I=T.meshHeightAt(e+m/N*10.4,s+P/N*10.4);It=Math.min(i,Math.max(I+.4,i-1.4))}else It=T.floorAt(e,s);me.setBase(e,s,It),me.setFacing(Math.atan2(-(re-s),ie-e)),me.setLift(0),me.setThrottle(0),me.setUpperThrottle(0),me.setStage1Separation(0),me.setFairingSeparation(0),me.setClamps(0),me.setPadVisible(!0)}}function Bs(){me||ra||!T||!Ln||(ra=!0,Bc(d,Ln,o).then(e=>{if(ra=!1,!T){e.dispose();return}me=e,T.group.add(e.group);const s=Ls();Os(s.x,s.z),Vo&&(Vo=!1,js())}).catch(()=>{ra=!1,Vo=!1}))}function Hs(){ws(),me&&(me.group.parent?.remove(me.group),me.dispose(),me=null),T&&T.orbitView(0),Fe="idle",an=0,Je=0,Jn=0,Tt=0,Vo=!1,Ha=0,Uo=0,sn=-1,On=-1,Qn=null,eo=0}function js(){if(!(!T||Fe!=="idle")){if(Hc(),Kc(),va(),Rn=!1,!me){Vo=!0,Bs();return}if(Math.hypot(ie-yt,re-Mt)>34){const e=Ls();Os(e.x,e.z),me.setLift(95),Fe="land"}else Fe="run";Tt=0,Je=0,Jn=0,an=0,Ha=0,Uo=0,sn=-1,On=-1,Qn=null,eo=0,me&&(me.setStage1Separation(0),me.setFairingSeparation(0),me.setUpperThrottle(0)),xo=0,en()}}function sr(e){return e==="sun"||e==="mercury"||e==="venus"||e==="earth"||e==="moon"||e==="mars"||e==="jupiter"||e==="saturn"||e==="uranus"||e==="neptune"||e==="pluto"||e==="eris"||e==="haumea"||e==="makemake"?e:e==="io"||e==="europa"||e==="ganymede"||e==="callisto"?"jupiter":e==="titan"||e==="enceladus"||e==="saturn-ring"?"saturn":e==="charon"?"pluto":"system"}function ir(e){if(!(!T||!me||Fe==="idle")){if(Tt+=e,eo>0&&(eo-=e,eo<=0&&(Qn=null,en())),Fe==="land"){const s=Math.min(1,Tt/1.9),i=1-Math.pow(1-s,3);me.setLift(95*(1-i)),s>=1&&(me.setLift(0),Fe="run",Tt=0,en());return}if(Fe==="run"){(Math.hypot(yt-ie,Mt-re)<6.4||Tt>16)&&(Fe="board",Tt=0,en());return}if(Fe==="board"){const s=Math.min(1,e*3.6);ie+=(yt-ie)*s,re+=(Mt-re)*s,Tt>1.25&&(Fe="count",Tt=0,an=3,Yc(ca,10.5+Ba,Math.max(0,Lo)),en());return}if(Fe==="count"){const s=Math.max(0,Math.ceil(3-Tt));s!==an&&(an=s,jc(an===0),Qc(an===3?"three":an===2?"two":an===1?"one":"liftoff"),en());const i=Math.max(0,Math.min(1,(Tt-ca)/.9));me.setThrottle(i),me.setClamps(Math.max(0,Math.min(1,(Tt-ca-.15)/.7))),i>0&&Tt-e<=ca&&(Ho(90),zn=1),Tt>=Ba&&(Fe="lift",Tt=0,Jn=0,en());return}if(Fe==="lift"){const s=Math.max(0,Lo),m=(12.5+Math.min(4.5,s*.02))*(.55+Math.min(.45,Tt*.35))*(1+.42*Ha);if(Jn+=m*e,Je+=Jn*e,me.setLift(Je),sn<0&&Je>=zs&&(sn=0,Qn="sep1",eo=2.6,me.setThrottle(0),zn=1.15,Ho([40,70,120]),Xc(s),en()),sn>=0){sn+=e,me.setStage1Separation(Math.min(1,sn/2.6));const I=Math.max(0,Math.min(1,(sn-.3)/.4));me.setUpperThrottle(I),sn-e<=.3&&sn>=.3&&($c(3.6),zn=Math.max(zn,.75),Ho(80))}else me.setThrottle(1);On<0&&Je>=Zi&&(On=0,Qn="fairing",eo=2.6,zn=Math.max(zn,.85),Ho([25,45,70]),qc(),en()),On>=0&&(On+=e,Uo=Math.min(1,On/2.2),me.setFairingSeparation(Uo)),T.atmosphere(Math.min(.86,Je/300)),T.orbitView(Je,S.position.y-It);const P=Je>zs-58?1:0;yo+=(P-yo)*Math.min(1,e*1.5);const N=Math.round(Je);N!==ia&&(ia=N,en()),Je>26&&me.setPadVisible(!1),Je>$i&&(Fe="escape",Tt=0,en());return}if(Fe==="escape"){const s=Math.min(1,Tt/2.6);Jn+=40*e,Je+=Jn*e,me.setLift(Je),me.setUpperThrottle(1),T.atmosphere(Math.max(.86,.86+s*.14)),T.orbitView(Je,S.position.y-It),yo=Math.min(1,yo+e*2);const i=Math.round(Je);i!==ia&&(ia=i,en());const m=U.fog;if(m&&(m.density=ua*(1-s)),s>=1){const P=sa;ws(),Fe="idle",Ws(),La(sr(P)),t.onSurfaceEscape?.()}}}}function rr(e,s){if(!T||!me)return;const i=It+Ra;if(Fe==="board"||Fe==="count"){const P=Fe==="count"?Math.min(1,Tt/Ba):0,N=Math.atan2(yt-ie,Mt-re)+1.05,I=34-P*8,L=yt+Math.sin(N)*I,O=Mt+Math.cos(N)*I;let l=It+6.4+P*2.2;T.solidFloor&&(l=Math.max(l,T.meshHeightAt(L,O)+2.2)),S.position.set(L,l,O),S.fov=58+P*10,S.updateProjectionMatrix(),S.lookAt(yt,i+16+P*26,Mt)}else if(Fe==="run"){const P=T.walkable?T.meshHeightAt(ie,re):T.floorAt(ie,re),N=Math.atan2(yt-ie,Mt-re)+.85,I=26+Math.min(16,Math.hypot(yt-ie,Mt-re)*.3),L=yt+Math.sin(N)*I,O=Mt+Math.cos(N)*I;let l=It+5.5;T.solidFloor&&(l=Math.max(l,T.meshHeightAt(L,O)+1.6)),S.position.set(L,l,O),S.fov=66,S.updateProjectionMatrix(),S.lookAt(ie,P+1.1,re)}else{const P=Math.min(1,Je/70),N=Math.atan2(yt-ie,Mt-re)+1.05,I=34+P*(24+Math.min(170,Je*.3)),L=yt+Math.sin(N)*I,O=Mt+Math.cos(N)*I;let l=It+6.4+P*(6+Je*.3);T.solidFloor&&(l=Math.max(l,T.meshHeightAt(L,O)+2.2));let k=i+42+Je*.55,V=62+P*12;const H=yo;if(H>.001){const ye=i+Je,ze=me.boosterDrop(),Re=118+Math.min(60,Je*.1),Ce=Re*.48+10,ge=yt+Math.sin(N)*Re,Ie=Mt+Math.cos(N)*Re,Ue=ye+Ce,je=ye+22-ze*.3;S.position.set(L+(ge-L)*H,l+(Ue-l)*H,O+(Ie-O)*H),k=k+(je-k)*H,V=V+(66-V)*H}else S.position.set(L,l,O);S.fov=V,S.updateProjectionMatrix(),S.lookAt(yt,k,Mt)}zn=Math.max(0,zn-s*1.4);const m=zn*.5+(Fe==="lift"||Fe==="escape"?Math.max(0,.22-Je*6e-4):0);m>.002&&(S.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*m*.9,S.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*m*.9,S.rotateZ(Math.sin(e*31.4)*m*.03))}function cr(e){so=e,e==="third"&&Ct<-.32&&(Ct=-.16),bo=Number.NaN,Ct=Math.min(.6,Math.max(-1.05,Ct)),T&&T.avatar.setVisible(e==="third"),bn=performance.now()}function lr(e){Es=e,T&&T.avatar.setSkin(e)}function ur(e){if(!T)return;if(Kn<go){Rn=!1;return}const s=(Qt.has("w")||Qt.has("arrowup")?1:0)-(Qt.has("s")||Qt.has("arrowdown")?1:0),i=(Qt.has("d")||Qt.has("arrowright")?1:0)-(Qt.has("a")||Qt.has("arrowleft")?1:0);let m=fa+s,P=Xa+i;if(yn>.4&&(m=0,P=0,Rn=!1),Fe!=="idle"){const H=(Math.atan2(yt-ie,-(Mt-re))-Oe+Math.PI*3)%(Math.PI*2)-Math.PI;Oe+=H*Math.min(1,e*6),m=Fe==="run"||Fe==="board"?1:0,P=0}const N=Math.hypot(m,P);N>1&&(m/=N,P/=N);const I=Math.sin(Oe),L=-Math.cos(Oe),O=Math.cos(Oe),l=Math.sin(Oe),k=Math.min(1,e*(Gt?9:2.4));if(Gt){const V=Math.min(1,N),H=Math.min(1,Math.max(0,(V-.7)/.3));Bo+=(H-Bo)*Math.min(1,e*6);const ye=Mo+(Fs-Mo)*Bo,ze=(I*m+O*P)*ye,Re=(L*m+l*P)*ye,Ce=Math.min(1,e*(V>.02?8.5:5.2));xt+=(ze-xt)*Ce,bt+=(Re-bt)*Ce;const ge=ie,Ie=re;ie+=(xt+io)*e,re+=(bt+ro)*e,io*=Math.exp(-e*3.1),ro*=Math.exp(-e*3.1);const Ue=T.walk(ie,re);if(Ue.x!==ie||Ue.z!==re){const mt=Ue.x-ie,Pt=Ue.z-re,Ne=Math.hypot(mt,Pt);if(ie=Ue.x,re=Ue.z,Ne>1e-4){const tn=mt/Ne,Nt=Pt/Ne,Hn=xt*tn+bt*Nt;Hn<0&&(xt-=tn*Hn,bt-=Nt*Hn)}}const je=Ue.rise;Ft+=(je-Ft)*Math.min(1,e*(je>Ft?16:9));const lt=Math.hypot(ie,re);if(lt>no){const mt=ie/lt,Pt=re/lt;ie=mt*no,re=Pt*no;const Ne=xt*mt+bt*Pt;Ne>0&&(xt-=Ne*mt,bt-=Ne*Pt)}ar(ge,Ie,e);const Fn=Math.hypot(xt,bt);ja+=e*(Jt?.8+Fn*1.7:.8),Rn&&Jt&&Lo>.01&&(kt=Ns,Jt=!1),Jt||(kt-=Lo*e,oo+=kt*e,oo<=0&&(oo=0,Oo=Math.min(1,Math.abs(kt)/Ns),kt=0,Jt=!0))}else{const V=Math.cos(Ct),H=(Math.sin(Oe)*V*m+O*P)*la,ye=Math.sin(Ct)*m*la,ze=(-Math.cos(Oe)*V*m+l*P)*la;xt+=(H-xt)*k,bt+=(ze-bt)*k,kt+=(ye-kt)*k,Rn&&(kt+=1.8),ie+=(xt+io)*e,re+=(bt+ro)*e,io*=Math.exp(-e*3.1),ro*=Math.exp(-e*3.1),ao+=kt*e;const Re=Math.hypot(ie,re);if(Re>no){const Ce=ie/Re,ge=re/Re;ie=Ce*no,re=ge*no;const Ie=xt*Ce+bt*ge;Ie>0&&(xt-=Ie*Ce,bt-=Ie*ge)}ao<qa&&(ao=qa,kt<0&&(kt=0)),ao>$a&&(ao=$a,kt>0&&(kt=0))}Rn=!1}function fr(e,s,i=!0){if(!T)return;if(T.update(e,s),Kn<go){Kn=Math.min(go,Kn+s);const ge=Kn/go,Ie=1-Math.pow(1-ge,3);vo=Ps*(1-Ie),Ct=-.12-.38*(1-Ie)}else vo!==0&&(vo=0,so==="third"&&(Ct=-.16));if(ur(s),ir(s),!T)return;Oo=Math.max(0,Oo-s*3.4),S.fov!==Gn&&(S.fov=Gn,S.updateProjectionMatrix());const m=so==="third",P=m||Fe==="run";Gt&&!Jt&&(Ft+=(0-Ft)*Math.min(1,s*4));const N=Gt?Ft:0,I=T.meshHeightAt(ie,re)+N,L=Gt?Math.max(I,$t):0,O=Gt&&$t>I+.06,l=Gt?T.eyeY+L+oo:T.eyeY+ao,k=l-T.eyeHeight+vo,V=Math.hypot(xt,bt);V>.25&&(Mn=Math.atan2(xt,bt)),xo=Math.max(0,xo-s);const H=fa>.25||Qt.has("w")||Qt.has("arrowup");if(m&&H&&xo<=0&&V>Mo*.8){const Ie=(Math.PI-Mn-Oe+Math.PI*3)%(Math.PI*2)-Math.PI;Oe+=Ie*Math.min(1,s*.8)}if(Go>0?(Go-=s,Go<=0&&(yn=0)):yn>0&&(yn=0),yn<=0&&to>0&&(to=Math.max(0,to-s*.4)),T.avatar.setDown(yn),T.avatar.setBurn(to),T.avatar.setVisible(P&&(Fe==="idle"||Fe==="run")),P){const ge=O?Ji:T.normalAt(ie,re),Ie=Math.sin(Mn),Ue=Math.cos(Mn),je=Math.cos(Mn),lt=-Math.sin(Mn),Fn=-Math.asin(Math.max(-1,Math.min(1,ge.x*Ie+ge.z*Ue))),mt=-Math.asin(Math.max(-1,Math.min(1,ge.x*je+ge.z*lt)));T.avatar.update(e,s,{x:ie,z:re,feetY:k,facing:Mn,speed:V,maxSpeed:Gt?Mo+(Fs-Mo)*Bo:la,grounded:Gt&&Jt,floating:!Gt,vy:kt,landing:Oo,shadowY:T.solidFloor?L:null,shockT:T.impact.sinceImpact(),slopePitch:Gt?Math.max(-.26,Math.min(.26,Fn)):0,slopeRoll:Gt?Math.max(-.26,Math.min(.26,mt)):0,groundNormal:{x:ge.x,y:ge.y,z:ge.z}})}if(m){const ge=Number.isNaN(bo)?k+1.34:bo;bo=ge+(k+1.34-ge)*Math.min(1,s*3.2);const Ie=bo,Ue=Math.cos(Ct),je=Math.sin(Oe)*Ue,lt=Math.sin(Ct),Fn=-Math.cos(Oe)*Ue;let mt=wo,Pt=ie-je*mt,Ne=Ie-lt*mt,tn=re-Fn*mt;if(T.solidFloor){const Nt=T.meshHeightAt,Hn=(Ht,jt)=>Math.max(Nt(Ht,jt),Nt(Ht+.6,jt),Nt(Ht-.6,jt),Nt(Ht,jt+.6),Nt(Ht,jt-.6));for(let Ht=0;Ht<7;Ht+=1){Pt=ie-je*mt,tn=re-Fn*mt,Ne=Ie-lt*mt;const jt=Hn(Pt,tn)+.85;if(Ne>=jt)break;if(jt-Ne<=2.4){Ne=jt;break}if(mt<=1.8){Ne=jt;break}mt=Math.max(1.8,mt*.8)}}if(me&&me.platform){const Nt=me.floorAt(Pt,tn);Nt!==null&&Ne<It+Nt+.55&&(Ne=It+Nt+.55)}if(me&&Fe==="idle"&&Ne<It+Yn+.15){const Nt=Pt-yt,Hn=tn-Mt,Ht=Math.hypot(Nt,Hn),jt=Nc+1.3;if(Ht<jt){const gr=Ht>.001?Nt/Ht:1,yr=Ht>.001?Hn/Ht:0;Pt=yt+gr*jt,tn=Mt+yr*jt}}S.position.set(Pt,Ne,tn),yn>.25?S.lookAt(ie-Math.sin(Mn)*.85,k+.35,re-Math.cos(Mn)*.85):S.lookAt(ie,Ie,re)}else{const ge=Math.min(1,V/Mo),Ie=Gt?Jt?Math.sin(ja*2)*.035*ge:0:Math.sin(e*.5)*.25,Ue=l+vo+Ie;S.position.set(ie,Ue,re);const je=Math.cos(Ct);S.lookAt(ie+Math.sin(Oe)*je,Ue+Math.sin(Ct),re-Math.cos(Oe)*je)}wn?(S.position.set(wn.pos[0],wn.pos[1],wn.pos[2]),S.lookAt(wn.look[0],wn.look[1],wn.look[2]),S.fov!==wn.fov&&(S.fov=wn.fov,S.updateProjectionMatrix())):Fe!=="idle"&&rr(e,s);const ye=T.impact.shake();if(ye>.002){const ge=ye;S.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*ge*.6,S.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*ge*.6,S.position.z+=(Math.sin(e*41.9+2.1)+Math.sin(e*25.6)*.5)*ge*.45,S.rotateZ((Math.sin(e*35.2)*.6+Math.sin(e*21.7+1.1)*.4)*ge*.05)}const ze=T.impact.flash();d.toneMappingExposure=1.1+ze*5.4;const Re=T.impact.doom(),Ce=U.fog;if(Ce){Ce.color.copy(Ya).lerp(Qi,Re*.82);const ge=Fe==="lift"||Fe==="escape"?Math.max(.06,1-Math.min(.94,Je/520)):1;Ce.density=ua*(1+Re*2.4)*ge}i&&d.render(U,S)}const Vt=new Map,Ka=new Map;let xn=0,Bn=0,pa=!1,bn=0;const Ys=new Gi,Xs=new Zo,qs=e=>{if(Ka.set(e.pointerId,{x:e.clientX,y:e.clientY}),T){if(b.setPointerCapture(e.pointerId),Vt.set(e.pointerId,{x:e.clientX,y:e.clientY}),Vt.size>=2){const[s,i]=[...Vt.values()];xn=Math.hypot(s.x-i.x,s.y-i.y),pa=!0,Bn+=100}else pa=!1,Bn=0;return}if(nt(),b.setPointerCapture(e.pointerId),po=!1,Vt.set(e.pointerId,{x:e.clientX,y:e.clientY}),Bn=0,bn=performance.now(),Vt.size===2){const[s,i]=[...Vt.values()];xn=Math.hypot(s.x-i.x,s.y-i.y)}},$s=e=>{const s=Vt.get(e.pointerId);if(!s)return;const i=e.clientX-s.x,m=e.clientY-s.y;if(Vt.set(e.pointerId,{x:e.clientX,y:e.clientY}),T){if(Vt.size>=2){const[N,I]=[...Vt.values()],L=Math.hypot(N.x-I.x,N.y-I.y);xn>0&&L>0&&(so==="third"?wo=Math.min(_s,Math.max(Ds,wo*(xn/L))):Gn=Math.min(ks,Math.max(As,Gn*(xn/L)))),xn=L,Bn+=Math.abs(i)+Math.abs(m)+10;return}Bn+=Math.abs(i)+Math.abs(m);const P=Gn/Oa;Oe-=i*.004*P,Ct=Math.min(1.15,Math.max(-1.05,Ct-m*.0035*P)),Math.abs(i)+Math.abs(m)>2&&(xo=1.4);return}if(bn=performance.now(),Vt.size===1)Bn+=Math.abs(i)+Math.abs(m),He.theta-=i*.006,He.phi=Math.min(2.9,Math.max(.2,He.phi-m*.006)),qt=null,on=null;else if(Vt.size===2){const[P,N]=[...Vt.values()],I=Math.hypot(P.x-N.x,P.y-N.y);xn>0&&(Xe.radius=Ks(Xe.radius*(xn/I))),xn=I,Bn+=10}},ma=e=>{const s=Ka.get(e.pointerId),i=pa;if(Ka.delete(e.pointerId),Vt.delete(e.pointerId),xn=0,Vt.size===0&&(pa=!1),T){(s?Math.hypot(e.clientX-s.x,e.clientY-s.y):1/0)<12&&!i&&Vt.size===0&&Za();return}if(Bn<6&&t.onPick){const m=b.getBoundingClientRect();Xs.set((e.clientX-m.left)/m.width*2-1,-((e.clientY-m.top)/m.height)*2+1),Ys.setFromCamera(Xs,S);const N=Ys.intersectObjects([...ht.values(),...X.values()],!1)[0]?.object.name;N&&ht.has(N)?t.onPick(N):N&&X.has(N)&&t.onExtra?.(N)}},Zs=e=>{if(T){e.preventDefault(),so==="third"?wo=Math.min(_s,Math.max(Ds,wo*(e.deltaY>0?1.1:.9))):Gn=Math.min(ks,Math.max(As,Gn*(e.deltaY>0?1.1:.9)));return}e.preventDefault(),Xe.radius=Ks(Xe.radius*(e.deltaY>0?1.12:.89))};function Ks(e){return De!=="system"?Math.min(mo[De]*2.2,Math.max(mo[De]*.15,e)):Math.min(90,Math.max(wt==="system"&&!_t?4:.15,e))}const Js=e=>{if(!T)return;const s=e.target;if(s&&(s.tagName==="INPUT"||s.tagName==="TEXTAREA"||s.isContentEditable))return;const i=e.key.toLowerCase();if(e.code==="KeyE"||e.code==="KeyF"||i==="e"||i==="f"){if(e.repeat||Kn<go)return;e.preventDefault(),Za();return}(i===" "||i==="spacebar"||i==="w"||i==="a"||i==="s"||i==="d"||i.startsWith("arrow"))&&(e.preventDefault(),Qt.add(i==="spacebar"?" ":i),(i===" "||i==="spacebar")&&(Rn=!0))},Qs=e=>{const s=e.key.toLowerCase();Qt.delete(s==="spacebar"?" ":s)};window.addEventListener("keydown",Js),window.addEventListener("keyup",Qs),b.addEventListener("pointerdown",qs),b.addEventListener("pointermove",$s),b.addEventListener("pointerup",ma),b.addEventListener("pointercancel",ma),b.addEventListener("wheel",Zs,{passive:!1});let Cn=null,da=null,Ja=!matchMedia("(prefers-reduced-motion: reduce)").matches,ei=0,ti=0;Ja&&(Cn=new _r(d),Cn.addPass(new Ir(U,S)),da=new Vr(new Zo(256,256),.75,.78,.92),Cn.addPass(da),Cn.addPass(new Wr));const _e={w:1,h:1},Qa=()=>{_e.w=n.clientWidth||1,_e.h=n.clientHeight||1,d.setSize(_e.w,_e.h,!1),Cn?.setSize(_e.w,_e.h),da?.resolution.set(_e.w/2,_e.h/2),S.aspect=_e.w/_e.h,S.updateProjectionMatrix()};x=Qa,Qa();const ni=new ResizeObserver(Qa);ni.observe(n);let oi=!0;const ai=new IntersectionObserver(e=>{oi=e.some(s=>s.isIntersecting)});ai.observe(n);const ne=new Y,co=new Y,To=new Y,es=new Y,pr=new Y,mr=new Y,dr=new Y,hr=new Y,si=new Y,vr=new Y;let ts=0,ii=performance.now(),ns=-1e9,ri=0;const ci=e=>{ts=requestAnimationFrame(ci);const s=(e-ii)/1e3,i=Math.min(.1,s);if(ii=e,document.hidden||!oi)return;if(r+=s,h+=(Math.min(.5,s)-h)*.12,r>1.5&&(r=0,h>.045&&y>.8?C(Math.max(.8,y-.2)):h<.021&&y<c&&C(Math.min(c,y+.15))),T){let l=Math.min(1,s);const k=l>.06?Math.min(20,Math.ceil(l/.05)):1,V=l/k;for(let H=0;H<k;H+=1)fr(e/1e3,V,H===k-1);return}if(oa||(ea.uniforms.time.value=e/1e3),!oa){for(const l of Ye)l.uniforms.time.value=e/1e3;for(const l of ot)l.uniforms.uTime.value=e/1e3}e-bn>3e3&&!oa&&!qt&&!Ts&&!po&&De!=="eclipse"&&De!=="sizes"&&(He.theta+=i*(wt==="system"?.03:.08)),St?.rotateY(i*.01);for(const[l,k]of ht){if(l==="earth"||l==="moon"||on&&l===wt)continue;const V=Yo(l).spinHours;oa||k.rotateY(i*(l==="sun"?.02:V?.12*(24/V)*.25:.12))}Vn&&(Vn.visible=S.position.length()>4);for(const l of M)l.material.uniforms.uDays.value=(ve-al)/864e5,l.material.uniforms.uTime.value=e/1e3;for(const l of D){const k=ht.get(l.parent);k&&l.mesh.material.uniforms.planetCenter.value.copy(k.getWorldPosition(ne))}for(const l of te)l.mesh.getWorldPosition(ne),l.material.uniforms.ringCenter.value.copy(ne),l.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(l.mesh.matrixWorld).normalize();if(at&&e-ri>1e3&&(ri=e,ve=Date.now(),Zn(ve)),f){const l=R.get(f.id),k=l.points.length,V=l.times[k-1],H=(l.frame==="earth"?6:25)*864e5,ze=l.marks.some(Ne=>Ne.at!==void 0&&Ne.body&&Ne.body!=="earth"&&Math.abs(f.sim-Ne.at)<H)?"slow":f.sim>=f.fastFrom?"fast":"normal",Re=ze==="slow"?Math.min(f.base,2*H/3):f.base*(ze==="fast"?f.fast:1);f.sim=Math.min(V,f.sim+Re*Math.min(i,.1)),l.frame==="sun"?Kt=(Kt??f.sim)+Math.min(i,.1)*.15*864e5:Kt=null,f.pace=ze;const Ce=(f.sim-l.times[0])/(V-l.times[0]||1);let ge=0,Ie=k-1;for(;Ie-ge>1;){const Ne=ge+Ie>>1;l.times[Ne]<=f.sim?ge=Ne:Ie=Ne}const Ue=l.times[Ie]-l.times[ge],je=ge+(Ue>0?(f.sim-l.times[ge])/Ue:0),lt=Math.max(0,Math.min(k-2,Math.floor(je))),Fn=je-lt;l.probe.position.lerpVectors(l.points[lt],l.points[lt+1],Fn),z=je,l.probe.lookAt(l.line.localToWorld(l.points[Math.min(k-1,lt+2)].clone())),l.line.geometry.setDrawRange(0,lt+2);const mt=l.times[lt]+(l.times[lt+1]-l.times[lt])*Fn;at=!1,ve=mt,Zn(mt);let Pt=0;for(let Ne=0;Ne<l.marks.length;Ne+=1){const tn=l.marks[Ne],Nt=tn.at??l.times[Math.min(k-1,tn.index)];f.sim>=Nt-H&&(Pt=Ne)}if((Pt!==f.mark||e-f.lastPing>250||f.sim>=V&&!f.done)&&(f.mark=Pt,f.lastPing=e,f.sim>=V&&(f.done=!0),t.onFlight?.({id:f.id,mark:l.marks[Pt],progress:Ce,time:mt,done:f.done,pace:f.pace})),f.done){const Ne=l.frame==="earth";f=null,Kt=null,at=!0,_t=Ne?be.get("earth")??null:null,Ne||Xe.target.set(0,0,0),Xe.radius=Ne?4.2:72,He.phi=Ne?.7:.45}}if(_t&&Xe.target.copy(_t.getWorldPosition(ne)),f){const l=R.get(f.id);let k=null,V=1/0;for(const ye of l.marks){if(!ye.body||ye.body==="earth"||ye.body==="far")continue;const ze=Math.abs(ye.index-z);ze<14&&ze<V&&(k=ye,V=ze)}const H=k?be.get(k.body):void 0;if(H){const ye=H.getWorldPosition(dr).add(l.probe.getWorldPosition(hr)).multiplyScalar(.5);Xe.target.copy(ye),Xe.radius=l.frame==="earth"?1.6:4.2}else Xe.radius=l.frame==="earth"?1.5:2.8}if(ho.lerp(Xe.target,1-Math.pow(.002,i)),He.radius+=(Xe.radius-He.radius)*(1-Math.pow(.004,i)),qt&&on){const l=ht.get(wt)?.getWorldPosition(si)??si.set(0,0,0);qt.copy(on.getWorldPosition(vr).sub(l).normalize());const k=Math.atan2(qt.x,qt.z),V=Math.acos(Math.max(-1,Math.min(1,qt.y)));let H=k-He.theta;H=Math.atan2(Math.sin(H),Math.cos(H)),He.theta+=H*(1-Math.pow(.01,i)),He.phi+=(V-He.phi)*(1-Math.pow(.01,i))}if(De==="blackhole"&&Ut.update(e/1e3,S),De==="exo"){const l=e/1e3;for(const k of At){const V=k.phase0+l/k.period*Math.PI*2;k.mesh.position.set(Math.cos(V)*k.a,0,Math.sin(V)*k.a)}}if(De==="eclipse"){zt=(zt+i*.18)%1;const l=Math.sin(zt*Math.PI*2),k=Math.abs(l)<.22,V=Math.max(0,1-Math.abs(l)/.9),H=ct==="lunar";if(ue.visible=!ut,oe.visible=ut,we.skySun.visible=!H,we.skyMoon.visible=H,ut)H?(we.skyMoon.position.set(l*1.7,0,.08),we.skyMoonMat.color.set("#f2f2f2").lerp(new q("#c47462"),H?V:0)):we.skyCover.position.set(l*1.7,0,.08);else{we.moon.position.set(H?2.75:1.05,l*.55,0),we.cone.visible=!H,we.umbra.visible=H,we.shadow.opacity=k?.42:.08,we.umbra.material.opacity=k?.42:.08,we.moonMat.color.set("#ffffff").lerp(new q("#c47462"),H?V:0);const ye=k?Q("개기"):Math.abs(l)<.6?Q("부분"):H?Q("반영"):"";Xt.textContent!==ye&&(Xt.textContent=ye)}}if(S.position.set(ho.x+He.radius*Math.sin(He.phi)*Math.sin(He.theta),ho.y+He.radius*Math.cos(He.phi),ho.z+He.radius*Math.sin(He.phi)*Math.cos(He.theta)),S.lookAt(ho),w&&(w.getWorldPosition(ne),Un.copy(ne).multiplyScalar(-1).normalize(),e-ns>500&&!(f&&R.get(f.id)?.frame==="sun"))){ns=e;const l=qr(new Date(ve)),k=Math.atan2(l.y,l.x),V=Math.atan2(-Un.z,Un.x),H=w.children[0];H.rotation.y=V-k}Cn&&Ja&&De!=="blackhole"&&(De!=="system"||wt==="system"||wt==="sun")&&Cn?(Cn.render(i),ei+=1,ti+=i,ei===90&&ti/90>.034&&(Ja=!1)):d.render(U,S),S.getWorldDirection(co),Z();const N=[];for(const l of $n){const k=vt.get(l),V=be.get(l);if(!k||!V)continue;V.getWorldPosition(ne);const H=To.copy(ne).sub(S.position).dot(co)>0,ye=wt==="system"&&De==="system"&&(!_t||f!==null),ze=wt==="earth"||wt==="moon"||f!==null&&R.get(f.id)?.frame==="earth";let Re=H&&(l==="moon"?De==="system"&&ze:ye||ze&&l==="earth"&&f!==null);ne.project(S);const Ce=(ne.x+1)/2*_e.w;let ge=Ce;const Ie=(1-ne.y)/2*_e.h+10;if(Re){let Ue=ta.get(l)??0;Ue||(k.style.display="block",Ue=k.offsetWidth||40,ta.set(l,Ue)),ge=Math.min(Math.max(Ce,Ue/2+4),Math.max(Ue/2+4,_e.w-Ue/2-4));const je={x:ge-Ue/2,y:Ie,w:Ue,h:22};B(je.x,je.y,je.w,je.h)||N.some(lt=>je.x<lt.x+lt.w+4&&je.x+je.w+4>lt.x&&je.y<lt.y+lt.h&&je.y+je.h>lt.y)?Re=!1:N.push(je)}k.style.display=Re?"block":"none",Re&&(k.style.transform=`translate(${ge}px, ${Ie}px) translate(-50%, 0)`)}const I=De==="system",L=wt!=="system"&&wt!=="jupiter"&&wt!=="saturn",O=_t!==null&&(f===null?_t===be.get("earth"):R.get(f.id)?.frame==="earth");for(const l of W)l.visible=!L&&!O;for(const[l,k]of E){const V=ee.get(l),H=k.parent?be.get(k.parent)===_t:wt==="system"&&(!_t||_t===V),ye=_t===V||H;V.getWorldPosition(ne);const ze=To.copy(ne).sub(S.position).dot(co)>0,Re=I&&ze&&ye;ne.project(S),k.el.style.display=Re?"block":"none",Re&&(k.el.style.transform=`translate(${(ne.x+1)/2*_e.w}px, ${(1-ne.y)/2*_e.h+8}px) translate(-50%, 0)`)}for(const[l,k]of R){const V=I&&Sn===l;if(k.line.visible=V,!V){k.el.style.display="none";continue}k.probe.getWorldPosition(ne);const H=To.copy(ne).sub(S.position).dot(co)>0;ne.y+=0,ne.project(S),k.el.style.display=H?"block":"none",H&&(k.el.style.transform=`translate(${(ne.x+1)/2*_e.w}px, ${(1-ne.y)/2*_e.h}px) translate(10px, -50%)`)}for(const l of Ss){if(De!=="stars"){l.el.style.display="none";continue}ne.copy(l.at);const k=To.copy(ne).sub(S.position).dot(co)>0;ne.project(S);const V=k&&Math.abs(ne.x)<1&&Math.abs(ne.y)<1;l.el.style.display=V?"block":"none",V&&(l.el.style.transform=`translate(${(ne.x+1)/2*_e.w}px, ${(1-ne.y)/2*_e.h}px) translate(-50%, -50%)`)}for(const l of Ga){if(!(l.level===De)){l.el.style.display="none";continue}ne.copy(l.marker.position);const V=To.copy(ne).sub(S.position).dot(co)>0;ne.project(S),l.el.style.display=V?"block":"none",V&&(l.el.style.transform=`translate(${(ne.x+1)/2*_e.w}px, ${(1-ne.y)/2*_e.h+8}px) translate(-50%, 0)`)}for(const l of At){if(De!=="exo"){l.el.style.display="none";continue}l.mesh.getWorldPosition(ne);const k=To.copy(ne).sub(S.position).dot(co)>0;ne.project(S),l.el.style.display=k?"block":"none",k&&(l.el.style.transform=`translate(${(ne.x+1)/2*_e.w}px, ${(1-ne.y)/2*_e.h+8}px) translate(-50%, 0)`)}for(const l of fo){if(De!=="blackhole"){l.el.style.display="none";continue}ne.copy(l.at),Ut.group.localToWorld(ne),ne.project(S);const k=ne.z<1&&Math.abs(ne.x)<1.05&&Math.abs(ne.y)<1.05;l.el.style.display=k?"block":"none",k&&(l.el.style.transform=`translate(${(ne.x+1)/2*_e.w}px, ${(1-ne.y)/2*_e.h}px) translate(-50%, -100%)`)}for(const l of gt){if(De!=="exo"){l.el.style.display="none";continue}ne.copy(l.at).project(S);const k=ne.z<1&&Math.abs(ne.x)<1.05&&Math.abs(ne.y)<1.05;l.el.style.display=k?"block":"none",k&&(l.el.style.transform=`translate(${(ne.x+1)/2*_e.w}px, ${(1-ne.y)/2*_e.h}px) translate(-50%, -100%)`)}for(const[l,k]of[[Tn,De==="eclipse"&&!ut],[Ae,De==="sizes"]])for(const V of l){if(!k){V.el.style.display="none";continue}ne.copy(V.at).applyMatrix4(V.group.matrixWorld).project(S);let H=ne.z<1&&Math.abs(ne.x)<1.1&&Math.abs(ne.y)<1.1;const ye=(ne.x+1)/2*_e.w,ze=(1-ne.y)/2*_e.h,Re=V.el.offsetWidth||44;H&&B(ye-Re/2,ze-11,Re,22)&&(H=!1),V.el.style.display=H?"block":"none";const Ce=V.group.rotation.z!==0;H&&(V.el.style.transform=`translate(${(ne.x+1)/2*_e.w}px, ${(1-ne.y)/2*_e.h}px) ${Ce?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const l of Ot){l.mesh.getWorldPosition(ne);const k=ht.get(l.parent);k?k.getWorldPosition(es):es.set(0,0,0);let H=pr.copy(ne).sub(es).normalize().dot(mr.copy(S.position).sub(ne).normalize())>.15&&De==="system"&&wt===l.parent;ne.project(S),H&&B((ne.x+1)/2*_e.w+8,(1-ne.y)/2*_e.h-11,90)&&(H=!1),l.el.style.display=H?"block":"none",H&&(l.el.style.transform=`translate(${(ne.x+1)/2*_e.w}px, ${(1-ne.y)/2*_e.h}px) translate(8px, -50%)`)}};ts=requestAnimationFrame(ci),ke===0&&t.onReady?.();const os=e=>({mesh:Number(e.mesh.toFixed(2)),ray:e.ray===null?null:Number(e.ray.toFixed(2)),diff:e.ray===null?null:Number((e.mesh-e.ray).toFixed(2))});return typeof window<"u"&&location.search.includes("surfdebug")&&(window.__surfDebug=()=>({surf:T?{shock:T.impact.sinceImpact(),doom:T.impact.doom(),flash:T.impact.flash(),shake:T.impact.shake(),stats:T.impact.stats()}:null,x:Number(ie.toFixed(2)),z:Number(re.toFixed(2)),y:Number(S.position.y.toFixed(2)),yaw:Number(Oe.toFixed(2)),pitch:Number(Ct.toFixed(2)),jump:Number(oo.toFixed(2)),knock:[Number(io.toFixed(2)),Number(ro.toFixed(2))],mode:so,alt:Number(vo.toFixed(2)),ground:T?Number(Math.max(T.meshHeightAt(ie,re)+Ft,$t).toFixed(2)):null,onPad:T?$t>T.meshHeightAt(ie,re)+Ft+.06:!1,camY:Number(S.position.y.toFixed(2)),cam:[Number(S.position.x.toFixed(2)),Number(S.position.z.toFixed(2))],feet:T?Number((T.eyeY+Math.max(T.meshHeightAt(ie,re)+Ft,$t)-T.eyeHeight).toFixed(2)):null,third:Number(wo.toFixed(2)),avatar:T?{vis:T.avatar.group.visible,x:Number(T.avatar.group.children[0]?.position.x.toFixed(1)),y:Number((T.avatar.group.children[0]?.position.y??0).toFixed(1))}:null,down:Number(yn.toFixed(2)),burn:Number(to.toFixed(2)),rocket:{phase:Fe,alt:Number(Je.toFixed(1)),count:an,pad:[Number(yt.toFixed(1)),Number(Mt.toFixed(1))],padY:Number(It.toFixed(2)),sep1:Number(sn.toFixed(2)),fair:Number(On.toFixed(2)),event:Qn,chase:Number(yo.toFixed(2)),drop:me?Number(me.boosterDrop().toFixed(1)):0,fairing:Number(Uo.toFixed(2))},probe:T?{stand:os(T.probeGround(ie,re)),pad:os(T.probeGround(yt,Mt))}:null}),window.__surfPlace=(e,s)=>{ie=e,re=s,xt=0,bt=0,oo=0,Jt=!0,$t=T?Math.max(T.meshHeightAt(e,s)+Ft,So(e,s)??-1e9):0},window.__surfProbePad=(e,s,i=0)=>me?{floor:me.floorAt(e,s),out:me.pushOut(e,s,i)}:null,window.__surfLook=(e,s=-.12)=>{Oe=e,Ct=s},window.__surfPad=()=>me&&T?{platform:me.platform,pad:[Number(yt.toFixed(2)),Number(Mt.toFixed(2)),Number(It.toFixed(2))],floorNow:So(ie,re),padY:Number($t.toFixed(2)),feet:Number((T.eyeY+Math.max(T.meshHeightAt(ie,re)+Ft,$t)-T.eyeHeight).toFixed(2)),ground:Number(T.meshHeightAt(ie,re).toFixed(2)),local:(()=>{const e=ie-yt,s=re-Mt;return[Number(e.toFixed(2)),Number(s.toFixed(2))]})()}:null,window.__surfProbe=(e,s)=>T?os(T.probeGround(e,s)):null,window.__surfFreeCam=(e,s=0,i=0,m=0,P=0,N=0,I=62)=>{wn=e===null?null:{pos:[e,s,i],look:[m,P,N],fov:I}}),{focus:La,setLevel:aa,setPaused:e=>{Ts=e},focusMarker:e=>{const s=Ga.find(i=>i.level===De&&i.marker.id===e);s&&(Xe.target.copy(s.marker.position),Xe.radius=mo[De]*(e==="cmb"?1.4:De==="group"?.6:.42),bn=performance.now())},showSite:qi,focusExtra:Xi,setEclipse:(e,s)=>{ct=e,ut=s,aa("eclipse")},setHemisphere:e=>{wt!=="earth"&&La("earth");const s=Un.clone().multiplyScalar(e==="day"?1:-1);He.theta=Math.atan2(s.x,s.z),He.phi=Math.min(2.6,Math.max(.5,Math.acos(s.y))),qt=null,on=null,po=!0},enterSurface:Vs,setSurfaceWorld:tr,exitSurface:Ws,setSurfaceMove:(e,s)=>{fa=Math.min(1,Math.max(-1,e)),Xa=Math.min(1,Math.max(-1,s))},jumpSurface:()=>{Rn=!0},setSurfaceMode:cr,setSurfaceSkin:lr,impactSurface:or,launchSurfaceRocket:js,dropProbe:Za,setTime:e=>{at=e===null,ve=e??Date.now(),Zn(ve),ns=-1e9},setVoyage:e=>{if(Sn=e,!e){f&&(f=null,at=!0),Kt=null;for(const l of R.values())l.line.geometry.setDrawRange(0,1/0);return}De!=="system"&&aa("system"),Kt=null;const s=R.get(e);s.line.geometry.setDrawRange(0,2),wt="system",qt=null,on=null,po=!1,_t=s.probe;const i=s.frame==="earth";Xe.radius=i?1.3:2.8,He.phi=i?.75:1;const m=Math.max(...s.marks.filter(l=>l.at!==void 0&&l.body!=="earth").map(l=>l.at),s.times[0]+864e5),P=s.times[0],N=s.times[s.times.length-1],I=(m-P)/(i?20:24),L=s.frame==="earth"?N:m+60*864e5,O=N>L?(N-L)/4/I:1;f={id:e,sim:P,base:I,fastFrom:L,fast:O,mark:-1,done:!1,lastPing:0,pace:"normal"},bn=performance.now()},dispose:()=>{va(),Bt?.dispose(),Cn?.dispose(),da?.dispose(),T&&(U.remove(T.group),T.dispose(),T=null),cancelAnimationFrame(ts),ni.disconnect(),ai.disconnect(),window.removeEventListener("keydown",Js),window.removeEventListener("keyup",Qs),b.removeEventListener("pointerdown",qs),b.removeEventListener("pointermove",$s),b.removeEventListener("pointerup",ma),b.removeEventListener("pointercancel",ma),b.removeEventListener("wheel",Zs),U.traverse(e=>{const s=e.material;Array.isArray(s)&&s.forEach(i=>i.dispose())}),J.forEach(e=>e.dispose()),d.dispose(),b.remove(),g.remove()}}}export{Rl as createSpace};
