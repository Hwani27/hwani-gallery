import{t as Z,a as qi}from"./index-Xt4mU5iH.js";import{G as We,a as j,f as Ie,M as ye,g as Qe,A as Ye,D as rt,V as W,R as Rt,P as Eo,h as mo,d as Qn,c as vo,S as go,b as G,i as sn,j as kn,k as da,l as ha,I as Sn,m as va,n as Ya,O as No,N as Us,e as An,o as es,p as Ha,q as $i,L as Zi,r as Ki,s as hi,t as Do,u as vi,v as Io,w as ua,x as Ji,y as gi,z as Qi,T as yi,F as er,H as tr,J as qa,K as nr,U as $a,W as or,X as ar,Y as sr,Z as ir,_ as rr,$ as cr,a0 as Wa,a1 as lr,C as zo,a2 as Gs,a3 as ur,a4 as fr,a5 as pr,a6 as mr,a7 as dr,a8 as hr,a9 as Ls,aa as Os,ab as vr,ac as gr}from"./three-9quM9_Dt.js";import{af as yr,ag as Bs,ah as Mr,ai as Ua,aj as js,ak as wr,al as xr,am as Ro,C as br,an as Sr,ao as ta,ap as Tr}from"./App-CSd7wNR9.js";import{g as yo,U as na,V as kr}from"./audio-BCfHVgCw.js";import{C as Xs}from"./sky-CHZnSAQ1.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";const Ys=`
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
`,oa=3,Ga=9;function Ar(n){const t=new We;t.visible=!1,t.rotation.z=.1;const o=new j(n(new Ie(1,48,32)),n(new ye({color:"#000000"})));o.renderOrder=0,t.add(o);const a=n(new Qe({uniforms:{uTime:{value:0},uCam:{value:new W}},transparent:!0,depthWrite:!1,side:rt,blending:Ye,vertexShader:`
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
        ${Ys}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${oa.toFixed(1)}) / ${(Ga-oa).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${oa.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),l=new j(n(new Rt(oa,Ga,256,8)),a);l.rotation.x=-Math.PI/2,l.renderOrder=1,t.add(l);const y=n(new Qe({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:Ye,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${Ys}
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
      `})),i=new j(n(new Eo(8,8)),y);i.renderOrder=2,t.add(i);const h=[{name:Z("궁수자리 A*"),at:new W(0,3.6,0)},{name:Z("사건의 지평선"),at:new W(0,-2.9,0)},{name:Z("강착 원반"),at:new W(Ga-1.2,0,0)}],b=new W;return{group:t,labels:h,update(M,x){a.uniforms.uTime.value=M,y.uniforms.uTime.value=M,x.getWorldPosition(b),a.uniforms.uCam.value.copy(b),i.lookAt(b)}}}const Fo=Math.PI/180;function an(n,t,o){return new W(Math.cos(t*Fo)*Math.cos(n*Fo),Math.sin(t*Fo),-Math.cos(t*Fo)*Math.sin(n*Fo)).multiplyScalar(o)}function Pr(){const t=document.createElement("canvas");t.width=64,t.height=64;const o=t.getContext("2d");if(o){const a=o.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,"rgba(255,255,255,1)"),a.addColorStop(.25,"rgba(255,255,255,0.75)"),a.addColorStop(1,"rgba(255,255,255,0)"),o.fillStyle=a,o.fillRect(0,0,64,64)}return new Qn(t)}function Cr(){const n=[],t=M=>(n.push(M),M),o=t(Pr());function a(M,x,T){const g=new vo(t(new go({map:o,color:new G(M),transparent:!0,depthWrite:!1,blending:Ye})));return g.scale.setScalar(x),g.position.copy(T),g}function l(M,x,T){const g=new Float32Array(M*3),c=new Float32Array(M*3);for(let p=0;p<M;p+=1){const[B,D]=x(p);g.set([B.x,B.y,B.z],p*3),c.set([D.r,D.g,D.b],p*3)}const P=t(new sn);return P.setAttribute("position",new kn(g,3)),P.setAttribute("color",new kn(c,3)),new da(P,t(new ha({size:T,map:o,vertexColors:!0,transparent:!0,depthWrite:!1,blending:Ye,sizeAttenuation:!0})))}let y=7;const i=()=>(y=y*16807%2147483647,(y-1)/2147483646),h={},b={};{const M=new We,x=2.6,T=[["alphacen",Z("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",Z("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",Z("바너드별"),269.45,4.69,5.96,"#ffb27a",Z("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",Z("울프 359"),164.12,7.01,7.86,"#ff9a6a",Z("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",Z("시리우스"),101.29,-16.72,8.6,"#cfe0ff",Z("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",Z("로스 154"),282.46,-23.84,9.69,"#ffa070",Z("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",Z("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",Z("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",Z("백조자리 61"),316.7,38.75,11.4,"#ffc58a",Z("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",Z("프로키온"),114.83,5.22,11.46,"#fff3d6",Z("작은개자리의 밝은 별이에요.")],["epsind",Z("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",Z("남쪽 하늘의 가까운 별이에요.")],["taucet",Z("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",Z("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];M.add(a("#ffe39a",3.2,new W));const g=[{id:"sun-star",name:Z("태양"),line:Z("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new W}];for(const[c,P,p,B,D,X,$]of T){const H=an(p,B,D*x);M.add(a(X,2.4,H)),g.push({id:c,name:P,line:qi("{0} 거리 약 {1}광년.",$,D),position:H})}M.add(l(500,()=>[new W(i()-.5,i()-.5,i()-.5).normalize().multiplyScalar(60+i()*30),new G().setHSL(.1,.3,.5+i()*.4)],.9)),h.stars=M,b.stars=g}{const M=new We,x=1/40,T=[["pleiades",Z("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,Z("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",Z("베텔게우스"),88.79,7.41,548,"#ffab6e",3,Z("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",Z("리겔"),78.63,-8.2,860,"#cfe0ff",3,Z("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",Z("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,Z("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",Z("데네브"),310.36,45.28,2600,"#e6eeff",3,Z("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];M.add(a("#ffe39a",1.6,new W));const g=[{id:"sun-orion",name:Z("태양"),line:Z("우리은하의 오리온 팔 안쪽에 있어요."),position:new W}];for(const[c,P,p,B,D,X,$,H]of T){const oe=an(p,B,D*x);M.add(a(X,$,oe)),c==="orionneb"&&M.add(l(260,()=>{const ue=Math.pow(i(),.6)*5;return[new W(i()-.5,i()-.5,i()-.5).normalize().multiplyScalar(ue).add(oe),new G(i()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),g.push({id:c,name:P,line:H,position:oe})}M.add(l(1400,()=>{const c=(i()-.5)*120,P=(i()-.5)*22*(.4+i()),p=(i()-.5)*4;return[new W(c,p,P),new G().setHSL(.6+i()*.1,.3,.35+i()*.3)]},.8)),h.orion=M,b.orion=g}{const M=new We,x=4;M.add(l(9e3,g=>{const c=g%x,P=Math.pow(i(),.55)*25,p=c/x*Math.PI*2+Math.log(1+P)*1.9+(i()-.5)*(.5+4/(P+2)),B=(i()-.5)*(P<4?2.2:.7),D=P<4,X=D?new G("#ffd9a0"):new G().setHSL(.58+i()*.06,.45,.45+i()*.35);return[new W(Math.cos(p)*P,B,Math.sin(p)*P),X.multiplyScalar(D?.8:.6)]},.55)),M.add(a("#fff0c8",7,new W));const T=new W(13,0,0);M.add(a("#ffe39a",1.2,T)),h.galaxy=M,b.galaxy=[{id:"center",name:Z("은하 중심(궁수자리 A*)"),line:Z("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new W},{id:"sun-gal",name:Z("태양은 여기"),line:Z("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:T}]}{const M=new We,x=1/1e5,T=(D,X,$,H,oe)=>l(H,ue=>{const me=Math.pow(i(),.6)*X,se=ue%2*Math.PI+Math.log(1+me*3)*2.2+(i()-.5)*.9,ie=new W(Math.cos(se)*me,(i()-.5)*X*.05,Math.sin(se)*me);ie.applyAxisAngle(new W(1,0,0),$);const U=me<X*.18;return[ie.add(D),new G().setHSL(U?.1:oe,.4,.45+i()*.3).multiplyScalar(U?.35:.22)]},.4),g=new W;M.add(T(g,2.2,0,1800,.6));const c=an(10.68,41.27,25e5*x);M.add(T(c,4.4,1.2,3200,.1));const P=an(23.46,30.66,273e4*x);M.add(T(P,1.6,.6,900,.62));const p=an(80.89,-69.76,16e4*x);M.add(a("#cfd8ff",1.2,p));const B=an(13.19,-72.83,2e5*x);M.add(a("#cfd8ff",.8,B)),h.group=M,b.group=[{id:"mw",name:Z("우리 은하"),line:Z("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:g},{id:"andromeda",name:Z("안드로메다은하"),line:Z("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:c},{id:"triangulum",name:Z("삼각형자리은하"),line:Z("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:P},{id:"lmc",name:Z("대마젤란은하"),line:Z("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:p}]}{const M=new We,x=6,T=(D,X,$)=>new W(D,X,$).multiplyScalar(x),g=T(5.1,.35,1.1),c=T(3.4,.45,.2),P=T(-1.4,-.3,-.5),p=[[T(.2,0,0),900,6.4*x*.5],[c,280,1.5*x*.5],[P,220,1.7*x*.5],[T(-2.2,1.6,2.4),120,1.1*x*.5]],B=p.reduce((D,X)=>D+X[1],0);M.add(l(B+180,D=>{let X=D;for(const[H,oe,ue]of p){if(X<oe)return[new W(i()-.5,(i()-.5)*.5,i()-.5).multiplyScalar(2*ue*Math.pow(i(),.5)).add(H),new G("#f3eee6").multiplyScalar(.75)];X-=oe}const $=i();return[g.clone().lerp(P,$).add(new W((i()-.5)*.7*x,(i()-.5)*.45*x,(i()-.5)*.7*x)),new G("#e7c48a").multiplyScalar(.8)]},.5)),M.add(new j(t(new Ie(.95*x,20,16)),t(new ye({color:"#d5e2f5",transparent:!0,opacity:.1,blending:Ye,depthWrite:!1}))).translateX(c.x).translateY(c.y).translateZ(c.z)),M.add(new j(t(new Ie(1.05*x,20,16)),t(new ye({color:"#e7c48a",transparent:!0,opacity:.09,blending:Ye,depthWrite:!1}))).translateX(P.x).translateY(P.y).translateZ(P.z)),M.add(a("#e4b56a",1.2,g)),h.super=M,b.super=[{id:"localgroup",name:Z("우리 은하군"),line:Z("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:g},{id:"virgo-sc",name:Z("처녀자리 은하단"),line:Z("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:c},{id:"attractor-sc",name:Z("거대 인력체"),line:Z("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:P}]}{const M=new We,x=1/1e7,T=an(187.7,12.4,54e6*x),g=an(243,-60,2e8*x);M.add(l(5e3,P=>{const p=P%5,D=[T,g,an(30,20,15e7*x),an(160,-30,18e7*x),an(300,40,14e7*x)][p],X=p===1?7:4;return[new W((i()-.5)*2,(i()-.5)*2,(i()-.5)*2).multiplyScalar(X*Math.pow(i(),.4)).add(D),new G().setHSL(.08+i()*.5,.35,.55).multiplyScalar(.8)]},.8)),M.add(a("#ffffff",.8,new W));const c=new j(t(new Ie(42,48,32)),t(new ye({color:"#ff8a4a",transparent:!0,opacity:.08,side:mo,depthWrite:!1})));M.add(c),h.cosmos=M,b.cosmos=[{id:"here",name:Z("우리 은하"),line:Z("여기서는 점 하나예요."),position:new W},{id:"virgo",name:Z("처녀자리 은하단"),line:Z("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:T},{id:"attractor",name:Z("거대 인력체"),line:Z("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:g},{id:"cmb",name:Z("가장 오래된 빛"),line:Z("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new W(0,0,-42)}]}for(const M of Object.values(h))M.visible=!1;return{groups:h,markers:b,dispose:()=>n.forEach(M=>M.dispose())}}const aa=1.7,Hs=n=>{const t=Math.min(1,Math.max(0,n));return t*t*(3-2*t)};function qs(n){try{const t=navigator;typeof t.vibrate=="function"&&t.vibrate(n)}catch{}}function La(n,t,o){const l=document.createElement("canvas");l.width=128,l.height=128;const y=l.getContext("2d"),i=y.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);i.addColorStop(0,n),i.addColorStop(.35,t),i.addColorStop(1,o),y.fillStyle=i,y.fillRect(0,0,128,128);const h=new Qn(l);return h.colorSpace=An,h}function zr(n){const t=new We,o=(()=>{let ee=2654435769;return()=>(ee=ee*1664525+1013904223>>>0,ee/4294967296)})(),a=La("rgba(255,255,255,1)","rgba(255,168,64,0.85)","rgba(255,90,0,0)"),l=La("rgba(120,104,96,0.55)","rgba(70,60,56,0.35)","rgba(40,34,32,0)"),y=La("rgba(255,255,255,1)","rgba(255,214,160,0.7)","rgba(255,140,40,0)"),i=[a,l,y],h=ee=>(i.push(ee),ee),b=new We,M=new j(h(new Sn(1,1)),h(new ye({color:new G(2757128),fog:!1})));M.scale.setScalar(15),b.add(M);const x=new j(h(new Sn(1,1)),h(new ye({color:new G(16742946),transparent:!0,opacity:.85,blending:Ye,depthWrite:!1,fog:!1})));x.scale.setScalar(21),b.add(x);const T=(ee,Y,V,te=Ye)=>{const be=h(new go({map:ee,color:new G(Y),transparent:!0,depthWrite:!1,blending:te,fog:!1})),K=new vo(be);return K.scale.setScalar(V),K},g=T(y,16747050,150);b.add(g);const c=T(a,16765562,70);b.add(c),b.visible=!1,t.add(b);const P=[],p=96;for(let ee=0;ee<p;ee+=1){const Y=ee%3===0,V=T(Y?l:a,Y?9074022:16747571,1,Y?Us:Ye);V.visible=!1,t.add(V),P.push({sprite:V,mat:V.material,life:0,max:1,from:1,to:1,rise:0,driftX:1,driftZ:1,spin:0,smoke:Y})}let B=0;const D=(ee,Y,V,te,be,K,O)=>{let le=null;for(let xt=0;xt<P.length;xt+=1){const dt=P[(B+xt)%P.length];if(dt.smoke===Y&&(dt.life<=0||!le)&&(le=dt,B=(B+xt+1)%P.length,dt.life<=0))break}le&&(le.sprite.position.copy(ee),le.sprite.visible=!0,le.life=te,le.max=te,le.from=V*.45,le.to=V,le.rise=be,le.driftX=(o()-.5)*K,le.driftZ=(o()-.5)*K,le.spin=(o()-.5)*1.4,le.sprite.material.rotation=o()*Math.PI*2,le.mat.opacity=Y?.46:.55,O!==void 0?le.mat.color.setHex(O):le.mat.color.setHex(Y?7035474:16742946),le.sprite.scale.setScalar(le.from))},X=new j(h(new Ie(1,32,20)),h(new ye({color:new G(16757575),transparent:!0,opacity:0,blending:Ye,depthWrite:!1,side:rt,fog:!1})));X.visible=!1,t.add(X);const $=new j(h(new Ie(1,24,16)),h(new ye({color:new G(16774872),transparent:!0,opacity:0,blending:Ye,depthWrite:!1,side:rt,fog:!1})));$.visible=!1,t.add($);const H=new j(h(new Ie(1,28,18)),h(new ye({color:new G(16731410),transparent:!0,opacity:0,blending:Ye,depthWrite:!1,side:rt,fog:!1})));H.visible=!1,t.add(H);const oe=[],ue=(ee,Y,V,te,be,K,O)=>{const le=h(new ye({color:new G(V),transparent:!0,opacity:te,blending:Ye,depthWrite:!1,side:rt,fog:!1})),xt=h(new Rt(ee,Y,64,1)),dt=new j(xt,le);be&&(dt.rotation.x=-Math.PI/2),dt.visible=!1,t.add(dt);const vn={mesh:dt,mat:le,grow:K,life:0,max:O,flat:be};return oe.push(vn),vn};ue(.92,1,16742946,.9,!0,480,1.3),ue(.9,1,16726538,.75,!0,620,1.9),ue(.86,1,16765066,.7,!0,340,.9),ue(.82,1,11569770,.5,!0,420,2.6),ue(.95,1,16769712,.55,!1,700,1.6);const me=220,se=h(new sn),ie=new Float32Array(me*3),U=new Float32Array(me*3);se.setAttribute("position",new kn(ie,3));const fe=h(new ha({color:new G(16756832),size:2.4,transparent:!0,opacity:0,depthWrite:!1,blending:Ye,sizeAttenuation:!0,fog:!1})),Pe=new da(se,fe);Pe.frustumCulled=!1,Pe.visible=!1,t.add(Pe);const Ge=150,xe=new va(h(new Sn(1,0)),h(new ye({color:new G(16777215),transparent:!0,opacity:1,fog:!1})),Ge);xe.instanceMatrix.setUsage(Ya),xe.frustumCulled=!1,xe.visible=!1,t.add(xe);const Ke=[];for(let ee=0;ee<Ge;ee+=1)Ke.push({p:new W,v:new W,s:1,spin:new W,rot:new W});const Me=new No,ge=new We;ge.visible=!1,t.add(ge);const Fe=h(new ye({color:new G(1773580),transparent:!0,opacity:0,depthWrite:!1,fog:!1}));Fe.blending=Us;const Mt=h(new ye({color:new G(3809818),transparent:!0,opacity:0,depthWrite:!1,fog:!1})),mt=h(new ye({color:new G(16734738),transparent:!0,opacity:0,blending:Ye,depthWrite:!1,side:rt,fog:!1})),Vt=h(new ye({color:new G(16756832),transparent:!0,opacity:0,blending:Ye,depthWrite:!1,fog:!1})),Ot=(ee,Y,V,te)=>{ee.rotateX(-Math.PI/2);const be=n.floorAt(Y,V)-n.heightAt(Y,V),K=ee.attributes.position;for(let O=0;O<K.count;O+=1){const le=K.getX(O),xt=K.getZ(O);K.setY(O,n.heightAt(Y+le,V+xt)+be+te)}return K.needsUpdate=!0,ee.computeVertexNormals(),ee};function Bt(ee,Y,V,te){ge.clear();const be=Ot(h(new Rt(.01,te*1.36,72,10)),ee,Y,.35),K=new j(be,Fe);K.position.set(ee,0,Y),ge.add(K);const O=Ot(h(new Rt(te*.95,te*1.3,72,3)),ee,Y,.5),le=new j(O,Mt);le.position.set(ee,0,Y),ge.add(le);const xt=Ot(h(new Rt(te*.42,te*1.1,72,6)),ee,Y,.42),dt=new j(xt,mt);dt.position.set(ee,0,Y),ge.add(dt);const vn=Ot(h(new Rt(.01,te*.45,72,5)),ee,Y,.45),Vn=new j(vn,Vt);Vn.position.set(ee,0,Y),ge.add(Vn),ge.visible=!0}let I=-1,q=-1,_e=new W,J=new W,L=!1;function we(){for(const ee of P)ee.life=0,ee.sprite.visible=!1}function lt(ee,Y,V=0,te=0){we();const be=n.floorAt(ee,Y);J.set(ee,be,Y);const K=V||0,O=te||0;_e.set(ee+K*900,be+520,Y+O*900),b.visible=!0,b.position.copy(_e),X.visible=!1,H.visible=!1;for(const le of oe)le.life=0,le.mesh.visible=!1;xe.visible=!1,Pe.visible=!1,fe.opacity=0,L=!1,q=-1,I=0,qs([30,90,40])}function ot(ee,Y){if(!(I<0)){if(I+=Y,!L&&I>=aa){L=!0,q=I,qs([140,60,240,70,320,80,420,110,520,160,380]);const V=n.onScar?.(J.x,J.z)??26;n.onImpact?.(),Bt(J.x,J.z,J.y,V),X.visible=!0,H.visible=!0,xe.visible=!0,Pe.visible=!0,fe.opacity=.95;for(const te of oe)te.life=te.max,te.mesh.visible=!0,te.mesh.scale.setScalar(4),te.mesh.position.set(J.x,J.y+(te.flat?.6:2),J.z),te.flat||te.mesh.rotation.set(0,0,0);for(let te=0;te<Ge;te+=1){const be=Ke[te],K=o()*Math.PI*2,O=6+o()*34;be.p.set(J.x+Math.cos(K)*O*.2,J.y+2+o()*8,J.z+Math.sin(K)*O*.2);const le=28+o()*62;be.v.set(Math.cos(K)*le,26+o()*70,Math.sin(K)*le),be.s=.7+Math.pow(o(),2)*4.6,be.spin.set((o()-.5)*6,(o()-.5)*6,(o()-.5)*6),be.rot.set(o()*3,o()*3,o()*3)}xe.material.opacity=1;for(let te=0;te<Ge;te+=1){const be=te%3===0;xe.setColorAt(te,new G(be?16747066:te%3===1?8010270:4860444))}xe.instanceColor&&(xe.instanceColor.needsUpdate=!0);for(let te=0;te<me;te+=1){const be=o()*Math.PI*2,K=Math.sqrt(o())*90;ie[te*3]=J.x+Math.cos(be)*K,ie[te*3+1]=J.y+20+o()*260,ie[te*3+2]=J.z+Math.sin(be)*K,U[te*3]=(o()-.5)*24,U[te*3+1]=-(16+o()*34),U[te*3+2]=(o()-.5)*24}se.attributes.position.needsUpdate=!0}if(!L){const V=Math.min(1,I/aa),te=Math.pow(V,2.15);b.position.lerpVectors(_e,J,te);const be=(1-te)*40;b.position.x+=Math.sin(I*9.1)*be,b.position.z+=Math.cos(I*7.3)*be,b.rotation.x+=Y*2.2,b.rotation.y+=Y*1.4,g.scale.setScalar(150+Math.sin(I*20)*26),c.scale.setScalar(70+Math.sin(I*26)*14);for(let K=0;K<2;K+=1){const O=b.position.clone();O.x+=(o()-.5)*26,O.y+=(o()-.5)*26,O.z+=(o()-.5)*26,D(O,!1,90+o()*60,.9+o()*.5,6,18)}D(b.position.clone(),!0,150+o()*90,1.8+o()*.8,12,26)}for(const V of P){if(V.life<=0)continue;if(V.life-=Y,V.life<=0){V.sprite.visible=!1;continue}const te=1-V.life/V.max,be=V.from+(V.to-V.from)*Math.sqrt(te);V.sprite.scale.setScalar(be),V.sprite.position.y+=V.rise*Y*(1-te),V.sprite.position.x+=V.driftX*Y,V.sprite.position.z+=V.driftZ*Y,V.sprite.material.rotation+=V.spin*Y;const K=V.smoke?Math.pow(1-te,1.8)*.46:Math.pow(1-te,1.3)*.55;V.mat.opacity=K}if(L){const V=I-q,te=(K,O,le)=>K+(O-K)*Hs(V/le);X.scale.setScalar(te(2,46,.85)),X.material.opacity=Math.max(0,1-V/1.9)*.95,$.scale.setScalar(te(1,24,.4)),$.material.opacity=Math.max(0,1-V/.5),X.position.set(J.x,J.y+8,J.z),$.position.set(J.x,J.y+10,J.z),H.scale.setScalar(te(3,34,1)),H.material.opacity=Math.max(0,.6-V/1.3*.6),H.position.set(J.x,J.y+4,J.z);for(const K of oe){if(K.life<=0)continue;if(K.life-=Y,K.life<=0){K.mesh.visible=!1;continue}const O=1-K.life/K.max;K.mesh.scale.setScalar(4+K.grow*Math.pow(O,.6)),K.mat.opacity=Math.max(0,(1-O)*(K.flat?.85:.6))}if(V<1.8&&V%.085<Y){const K=new W(J.x+(o()-.5)*18,J.y+3+o()*6,J.z+(o()-.5)*18);o()<.65&&D(K,!1,76+o()*56,1.4+o()*.7,14+o()*12,20,16761962),D(K,!0,60+o()*46,1.8+o()*.8,12+o()*10,26,11573898)}if(V<1.7&&V%.05<Y){const K=o()*Math.PI*2,O=26+V*46+o()*22,le=new W(J.x+Math.cos(K)*O,J.y+2+o()*12,J.z+Math.sin(K)*O);D(le,!0,50+o()*40,1.6,7,14,11573376),o()<.55&&D(le,!1,70+o()*60,1.3,10,10,16751164)}if(V>.4&&V<2.8&&V%.11<Y){const K=o()*Math.PI*2,O=16+o()*46,le=new W(J.x+Math.cos(K)*O,J.y+34+o()*30,J.z+Math.sin(K)*O);D(le,!0,70+o()*52,2,8,24,10520692)}const be=xe.material;if(be.opacity=Math.max(0,1-Math.max(0,V-3.4)/1.2),be.opacity<=.01)xe.visible=!1;else{for(let K=0;K<Ge;K+=1){const O=Ke[K];O.v.y-=9.81*.55*Y,O.v.multiplyScalar(1-Y*.12),O.p.addScaledVector(O.v,Y);const le=n.floorAt(O.p.x,O.p.z)+O.s*.4;O.p.y<le&&(O.p.y=le,O.v.y=Math.abs(O.v.y)*.32,O.v.x*=.7,O.v.z*=.7),O.rot.x+=O.spin.x*Y,O.rot.y+=O.spin.y*Y,O.rot.z+=O.spin.z*Y,Me.position.copy(O.p),Me.rotation.set(O.rot.x,O.rot.y,O.rot.z),Me.scale.setScalar(O.s),Me.updateMatrix(),xe.setMatrixAt(K,Me.matrix)}xe.instanceMatrix.needsUpdate=!0}if(Pe.visible)if(fe.opacity=Math.max(0,.95-Math.max(0,V-4)/1.6),fe.opacity<=.01)Pe.visible=!1;else{for(let K=0;K<me;K+=1){const O=K*3;ie[O]+=U[O]*Y,ie[O+1]+=U[O+1]*Y,ie[O+2]+=U[O+2]*Y,U[O+1]-=5*Y;const le=n.floorAt(ie[O],ie[O+2])+.4;ie[O+1]<le&&(ie[O]=J.x+(o()-.5)*160,ie[O+1]=J.y+120+o()*160,ie[O+2]=J.z+(o()-.5)*160,U[O]=(o()-.5)*20,U[O+1]=-(14+o()*26),U[O+2]=(o()-.5)*20)}se.attributes.position.needsUpdate=!0}Fe.opacity=Math.min(.42,V*1.1),Mt.opacity=Math.min(.4,V*1.1),mt.opacity=Math.max(0,.85*Math.exp(-V/5.5)),Vt.opacity=Math.max(0,.9*Math.exp(-V/1.8))}if(L&&(b.visible=!1),I>80){I=-1,q=-1,b.visible=!1,X.visible=!1,$.visible=!1,H.visible=!1,ge.visible=!1;for(const V of P)V.life=0,V.sprite.visible=!1;for(const V of oe)V.life=0,V.mesh.visible=!1;xe.visible=!1,Pe.visible=!1}}}return{group:t,strike:lt,doom:()=>{if(I<0)return 0;if(!L)return Math.min(1,Hs(I/(aa*.82))*(.93+.07*Math.sin(I*12)));const ee=I-q;return ee<1.8?1:Math.max(0,1-(ee-1.8)/20)},flash:()=>{if(!L)return 0;const ee=I-q,Y=Math.exp(-ee/.16),V=ee>.35?.5*Math.exp(-(ee-.35)/.3):0;return Math.min(1,Y+V)},shake:()=>{if(I<0)return 0;if(!L)return .02+Math.pow(I/aa,3)*.18;const ee=I-q;if(ee>3.6)return 0;let Y=1.55*Math.exp(-ee/1.35);return Y+=.55*Math.exp(-Math.pow((ee-1.55)/.22,2)),Y+=.32*Math.exp(-Math.pow((ee-2.35)/.26,2)),Y+=.18*Math.exp(-Math.pow((ee-3)/.3,2)),Y*Math.min(1,ee/.06)},sinceImpact:()=>q>=0?I-q:-1,stats:()=>{const ee=P.filter(V=>V.life>0),Y=ee[0];return{t:Number(I.toFixed(2)),target:[Number(J.x.toFixed(1)),Number(J.y.toFixed(1)),Number(J.z.toFixed(1))],start:[Number(_e.x.toFixed(1)),Number(_e.z.toFixed(1))],alive:ee.length,map:Y?!!Y.mat.map:null,op:Y?Number(Y.mat.opacity.toFixed(2)):null,sc:Y?Number(Y.sprite.scale.x.toFixed(1)):null,pos:Y?Y.sprite.position.toArray().map(V=>Number(V.toFixed(1))):null,vis:Y?Y.sprite.visible:null,fire:[Number(X.material.opacity.toFixed(2)),Number(X.scale.x.toFixed(0)),X.visible],crater:[ge.visible,ge.children.length,Number(Fe.opacity.toFixed(2)),Number(mt.opacity.toFixed(2))]}},update:ot,dispose:()=>{t.clear(),i.forEach(ee=>ee.dispose())}}}const Rr=`
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
`,Fr=`
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
  col = mix(col, uFogColor, clamp(fog * (1.0 - uOrbit * 0.88), 0.0, 1.0));
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
`,Er=`
uniform float uTile;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vUv = wp.xz / uTile;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Nr=`
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
`,$s=`
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
`,Zs=`
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
`,fo=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Oa=`
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
`,sa=`
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
`,Zt=Math.PI*2,Mi=9,Ks=140;function rn(n){return n<0?0:n>1?1:n}function fa(n,t,o){return n<t?t:n>o?o:n}function Pn(n,t,o){const a=rn((o-n)/(t-n));return a*a*(3-2*a)}function In(n,t,o){let a=Math.imul(n|0,374761393)^Math.imul(t|0,668265263)^Math.imul(o|0,2246822519);return a=Math.imul(a^a>>>13,1274126177),((a^a>>>16)>>>0)/4294967295}function Dr(n,t,o,a){const l=Math.floor(n),y=Math.floor(t),i=n-l,h=t-y,b=i*i*(3-2*i),M=h*h*(3-2*h),x=Math.max(1,Math.round(o)),T=H=>(H%x+x)%x,g=T(l),c=T(l+1),P=T(y),p=T(y+1),B=In(g,P,a),D=In(c,P,a),X=In(g,p,a),$=In(c,p,a);return(B+(D-B)*b)*(1-M)+(X+($-X)*b)*M}function cn(n,t,o,a,l){let y=0,i=.5,h=0,b=o;for(let M=0;M<a;M+=1)y+=i*Dr(n*b,t*b,b,l+M*17),h+=i,i*=.5,b*=2;return y/h}function wi(n){let t=n>>>0||1;return()=>(t=Math.imul(t,1664525)+1013904223>>>0,t/4294967296)}function Mo(n,t){const o=document.createElement("canvas");o.width=n,o.height=t;const a=o.getContext("2d");if(!a)throw new Error("2D canvas is unavailable");return{canvas:o,ctx:a}}const Ir={crater:{seed:101,macro:.38,mid:.17,fine:.12,speck:.15,craters:20,stones:90,cracks:0,ripples:0,gloss:.02},rock:{seed:211,macro:.4,mid:.22,fine:.14,speck:.2,craters:5,stones:150,cracks:9,ripples:1,gloss:.05},volcano:{seed:331,macro:.32,mid:.24,fine:.16,speck:.22,craters:4,stones:110,cracks:14,ripples:0,gloss:.08},ice:{seed:401,macro:.26,mid:.2,fine:.2,speck:.16,craters:5,stones:18,cracks:22,ripples:0,gloss:.5},plain:{seed:509,macro:.3,mid:.15,fine:.1,speck:.13,craters:8,stones:70,cracks:3,ripples:.35,gloss:.03},plasma:{seed:601,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0},ring:{seed:701,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0}};function pa(n,t,o,a,l,y,i,h,b=!1){const M=Math.ceil(y),x=Math.round(a),T=Math.round(l);for(let g=-M;g<=M;g+=1)for(let c=-M;c<=M;c+=1){const P=(c*c+g*g)/(y*y);if(P>=1)continue;const p=b?Math.sqrt(1-P):1-P,B=((x+c)%o+o)%o,X=((T+g)%o+o)%o*o+B;n[X]+=i*p,t[X]+=h*p}}function _r(n,t,o,a,l,y,i){const h=.09+i()*.12,b=.05+i()*.06,M=.72+i()*.5,x=i()*Math.PI,T=Math.cos(x),g=Math.sin(x),c=Math.ceil(y*1.4),P=Math.round(a),p=Math.round(l);for(let B=-c;B<=c;B+=1)for(let D=-c;D<=c;D+=1){const X=(D*T+B*g)/y,$=(-D*g+B*T)/(y*M),H=Math.sqrt(X*X+$*$);if(H>1.4)continue;let oe=0,ue=0;H<1&&(oe-=Math.pow(1-H*H,1.25)*h,ue-=(1-H)*.05);const me=Math.exp(-Math.pow((H-1.02)/.2,2))*b;oe+=me,ue+=me*1.1+(H>1&&H<1.35?.02:0);const se=((P+D)%o+o)%o,U=((p+B)%o+o)%o*o+se;t[U]+=oe,n[U]+=ue}}function Ba(n,t,o,a,l,y,i,h,b,M){const T=Math.max(2,Math.floor(i/1.1));let g=y,c=a,P=l;for(let p=0;p<T;p+=1){g+=(b()-.5)*.3,c+=Math.cos(g)*1.1,P+=Math.sin(g)*1.1;const B=h*(.6+b()*.8);M?(pa(n,t,o,c,P,B*2.2,.03,.008),pa(n,t,o,c,P,B,-.05,-.03)):pa(n,t,o,c,P,B,-.07,-.03)}}function Vr(n,t){const o=Ir[n],a=wi(o.seed),l=t/Mi,y=new Float32Array(t*t),i=new Float32Array(t*t),h=new Float32Array(t*t),b=7;for(let c=0;c<t;c+=1){const P=c/t;for(let p=0;p<t;p+=1){const B=p/t,D=c*t+p,X=cn(B,P,3,4,o.seed),$=cn(B,P,11,3,o.seed+13),H=cn(B,P,43,2,o.seed+29),oe=In(p,c,o.seed+71)-.5;let ue=1+(X-.5)*o.macro+($-.5)*o.mid+(H-.5)*o.fine+oe*o.speck,me=.5+(X-.5)*.06+($-.5)*.07+(H-.5)*.08+oe*.03,se=o.gloss;if(o.ripples>0){const ie=P*b+(X-.5)*.85+($-.5)*.3,U=Math.sin(ie*Zt);ue+=U*.055*o.ripples,me+=U*.018*o.ripples}if(n==="volcano"){const ie=1-Math.abs(2*H-1);ie>.94?(ue+=(ie-.94)*2.2,me-=.02,se+=.1):ie<.22&&(ue-=(.22-ie)*.6)}n==="ice"&&(Math.abs($-.5)<.012&&(ue-=.24,me-=.035),ue=.82+(ue-1)*.95+(H-.5)*.12,se=rn(.35+H*.55)),(n==="crater"||n==="ring")&&X<.34&&(ue-=(.34-X)*1.1),n==="plain"&&(ue+=Pn(.55,.78,X)*.18),y[D]=ue,i[D]=me,h[D]=se}}for(let c=0;c<o.craters;c+=1){const P=(.3+Math.pow(a(),1.7)*1.1)*l;_r(y,i,t,a()*t,a()*t,P,a)}for(let c=0;c<o.stones;c+=1){const p=(a()<.18?.14+a()*.3:.03+a()*.09)*l,B=c%3===0?.12:-.08;pa(y,i,t,a()*t,a()*t,Math.max(.8,p),B,.02+p*.0012,!0)}for(let c=0;c<o.cracks;c+=1){const P=a()*t,p=a()*t,B=(.6+a()*3.4)*l;Ba(y,i,t,P,p,a()*Zt,B,.8+a()*1.4,a,n==="ice")}if(n==="ice"){const c=()=>.5;for(let P=0;P<11;P+=1){const p=a()*Zt,B=t*(.45+a()*.75),D=a()*t,X=a()*t;Ba(y,i,t,D-Math.cos(p)*B*.5,X-Math.sin(p)*B*.5,p,B,1+a()*1.4,c,!0)}for(let P=0;P<10;P+=1){const p=a()*t,B=a()*t,D=a()*Zt;Ba(y,i,t,p,B,D,(.4+a()*1.6)*l,.8+a(),a,!0)}}const{canvas:M,ctx:x}=Mo(t,t),T=x.createImageData(t,t),g=T.data;for(let c=0;c<t*t;c+=1)g[c*4]=Math.round(fa(y[c]*.5,0,1)*255),g[c*4+1]=Math.round(fa(i[c],0,1)*255),g[c*4+2]=Math.round(fa(h[c],0,1)*255),g[c*4+3]=255;return x.putImageData(T,0,0),M}function je(n){const t=parseInt(n.replace("#",""),16);return[t>>16&255,t>>8&255,t&255]}function Lt(n,t,o){return[n[0]+(t[0]-n[0])*o,n[1]+(t[1]-n[1])*o,n[2]+(t[2]-n[2])*o]}function Wr(n,t,o){const a=n*t,l=Math.floor(a),y=a-l,i=T=>{const g=(T%2+2)%2===0,c=In(T,7,o);return g?.56+.4*c:.04+.3*c},h=i(l),b=i(l-1),M=i(l+1),x=.44;return y<x?b+(h-b)*Pn(0,1,y/x):y>1-x?h+(M-h)*Pn(0,1,(y-(1-x))/x):h}const Za={jupiter:{bands:16,seed:3301,streaky:.8,polar:null,spots:[{u:.62,v:.66,ru:.085,rv:.05,color:je("#a8492f"),swirl:2},{u:.24,v:.34,ru:.05,rv:.026,color:je("#f6efdd"),swirl:0},{u:.46,v:.4,ru:.035,rv:.02,color:je("#fbf3e1"),swirl:0},{u:.83,v:.44,ru:.03,rv:.018,color:je("#f4ecd9"),swirl:0},{u:.36,v:.74,ru:.06,rv:.03,color:je("#8d4b30"),swirl:0}]},saturn:{bands:20,seed:3307,streaky:.38,polar:je("#c9d4d8"),spots:[{u:.7,v:.3,ru:.04,rv:.02,color:je("#f7edd2"),swirl:0},{u:.3,v:.72,ru:.035,rv:.018,color:je("#e6d3a4"),swirl:0}]},uranus:{bands:7,seed:3313,streaky:.25,polar:je("#e6fbfd"),spots:[{u:.55,v:.36,ru:.06,rv:.03,color:je("#dcf4f6"),swirl:0}]},neptune:{bands:9,seed:3319,streaky:.5,polar:je("#a9c8f2"),spots:[{u:.34,v:.62,ru:.06,rv:.032,color:je("#1f3a72"),swirl:1},{u:.72,v:.46,ru:.05,rv:.012,color:je("#e9f3ff"),swirl:0},{u:.62,v:.36,ru:.035,rv:.009,color:je("#f2f8ff"),swirl:0}]}};function Ur(n,t,o,a=2){const l=new Uint8ClampedArray(n.length);for(let y=0;y<a;y+=1){for(let i=0;i<o;i+=1)for(let h=0;h<t;h+=1){const b=(h-1+t)%t*4,M=h*4,x=(h+1)%t*4,T=i*t*4;for(let g=0;g<3;g+=1)l[T+M+g]=(n[T+b+g]+n[T+M+g]*2+n[T+x+g])/4}for(let i=0;i<o;i+=1){const h=(i-1+o)%o*t*4,b=i*t*4,M=(i+1)%o*t*4;for(let x=0;x<t;x+=1){const T=x*4;for(let g=0;g<3;g+=1)n[b+T+g]=(l[h+T+g]+l[b+T+g]*2+l[M+T+g])/4}}}}function xi(n,t,o){const a=Za[n.id]??Za.jupiter,l=je(n.ground),y=je(n.ground2),i=je(n.ground3),{canvas:h,ctx:b}=Mo(t,o),M=b.createImageData(t,o),x=M.data,T=a.seed,g=new Float32Array(t*o),c=new Float32Array(t*o);for(let D=0;D<o;D+=1){const X=D/o;for(let $=0;$<t;$+=1){const H=$/t,oe=(cn(H,X,4,3,T)-.5)*.03+(cn(H,X,13,2,T+7)-.5)*.005,ue=rn(X+oe);let me=Wr(ue,a.bands,T);const se=cn(H*3,X*9,9,3,T+31)-.5;me+=se*.13*a.streaky;let ie;if(me<.5?ie=Lt(i,y,rn(me*2)):ie=Lt(y,l,rn((me-.5)*2)),a.polar){const fe=Pn(.82,1,Math.abs(X-.5)*2);ie=Lt(ie,a.polar,fe*.45)}for(const fe of a.spots){const Pe=(H-fe.u)/fe.ru,Ge=(X-fe.v)/fe.rv,xe=Pe*Pe+Ge*Ge;if(xe<2.2){const Ke=Pn(1.05,.25,xe),Me=fe.swirl>0?.82+.18*Math.sin(Math.atan2(Ge,Pe)*3+xe*7):1;ie=Lt(ie,[fe.color[0]*Me,fe.color[1]*Me,fe.color[2]*Me],Ke*.92)}}const U=(D*t+$)*4;x[U]=ie[0],x[U+1]=ie[1],x[U+2]=ie[2],x[U+3]=255,g[D*t+$]=rn(.5+se*.85+(me-.5)*.5),c[D*t+$]=.5+se*.85}}const P=n.sunAz*Math.PI/180,p=Math.sin(P),B=-Math.cos(P);for(let D=0;D<o;D+=1){const X=(D+1)%o,$=(D-1+o)%o;for(let H=0;H<t;H+=1){const oe=(H+1)%t,ue=(H-1+t)%t,me=c[D*t+oe]-c[D*t+ue],se=c[X*t+H]-c[$*t+H],ie=fa(1+(me*p+se*B)*1.8,.9,1.1),U=(D*t+H)*4;x[U]=Math.min(255,x[U]*ie),x[U+1]=Math.min(255,x[U+1]*ie),x[U+2]=Math.min(255,x[U+2]*ie),x[U+3]=Math.round(rn(.74+g[D*t+H]*.4)*255)}}return Ur(x,t,o,2),b.putImageData(M,0,0),h}function Gr(n,t){if(Za[n.id])return xi(n,t,t);const{canvas:o,ctx:a}=Mo(t,t),l=a.createImageData(t,t),y=l.data,i=je(n.ground),h=je(n.ground2),b=je(n.ground3);for(let M=0;M<t;M+=1){const x=M/t;for(let T=0;T<t;T+=1){const g=T/t,c=cn(g,x,4,4,9021),P=cn(g,x,16,3,9027),p=rn(c*.72+P*.4);let B=Lt(h,i,Pn(.25,.72,p));B=Lt(B,b,Pn(.66,.95,p)*.8);const D=(M*t+T)*4;y[D]=B[0],y[D+1]=B[1],y[D+2]=B[2],y[D+3]=255}}return a.putImageData(l,0,0),o}function Lr(n,t,o){const{canvas:a,ctx:l}=Mo(t,o),y=wi(n==="moon"?51:n==="pluto"?67:83),i=n==="pluto"?"#cbb6a4":n==="charon"?"#9d9a95":"#9a9691";if(l.fillStyle=i,l.fillRect(0,0,t,o),n==="pluto")l.fillStyle="#f3ece1",l.beginPath(),l.ellipse(t*.56,o*.46,t*.13,o*.16,-.2,0,Zt),l.fill(),l.beginPath(),l.ellipse(t*.72,o*.4,t*.07,o*.12,.35,0,Zt),l.fill(),l.fillStyle="rgba(96,68,54,0.62)",l.beginPath(),l.ellipse(t*.24,o*.6,t*.2,o*.13,.1,0,Zt),l.fill(),l.beginPath(),l.ellipse(t*.2,o*.32,t*.14,o*.1,-.2,0,Zt),l.fill();else if(n==="moon")for(let h=0;h<9;h+=1)l.fillStyle=`rgba(58,56,54,${.5+y()*.3})`,l.beginPath(),l.ellipse(y()*t,(.18+y()*.6)*o,(.04+y()*.07)*t,(.03+y()*.06)*o,y()*3,0,Zt),l.fill();else l.fillStyle="rgba(120,84,70,0.6)",l.beginPath(),l.ellipse(t*.5,o*.06,t*.4,o*.09,0,0,Zt),l.fill();for(let h=0;h<220;h+=1){const b=(2+Math.pow(y(),2.4)*26)*(t/1024),M=y()*t,x=y()*o,T=l.createRadialGradient(M,x,0,M,x,b);T.addColorStop(0,"rgba(38,36,34,0.5)"),T.addColorStop(.72,"rgba(70,66,62,0.28)"),T.addColorStop(.9,"rgba(238,233,224,0.32)"),T.addColorStop(1,"rgba(255,255,255,0)"),l.fillStyle=T,l.beginPath(),l.arc(M,x,b,0,Zt),l.fill()}for(let h=0;h<2600;h+=1){const b=(.6+Math.pow(y(),3)*4)*(t/1024);l.fillStyle=y()<.5?"rgba(255,255,255,0.16)":"rgba(30,28,26,0.16)",l.beginPath(),l.arc(y()*t,y()*o,b,0,Zt),l.fill()}return a}function Or(n,t){const{canvas:o,ctx:a}=Mo(n,t),l=a.createImageData(n,t),y=l.data,i=je("#0f3f74"),h=je("#2f8fb0"),b=je("#3f7a45"),M=je("#9a8a55"),x=je("#f2f7fc");for(let T=0;T<t;T+=1){const g=T/t;for(let c=0;c<n;c+=1){const P=c/n,p=P*3.1,B=g*2.4,D=cn(p,B,4,5,4404)+(cn(p*3,B*3,12,3,4411)-.5)*.18,X=D>.55;let $;if(X){const se=rn((D-.55)*4.2);$=Lt(b,M,se*.7),se>.55&&($=Lt($,je("#cfc9bb"),(se-.55)*1.6))}else $=Lt(i,h,rn((D-.35)*3.2));const H=Pn(.86,.98,Math.abs(g-.5)*2);H>0&&($=Lt($,x,H));const oe=cn(P*2,g*6,12,4,4423),ue=Pn(.56,.82,oe)*.72;ue>0&&($=Lt($,je("#fbfdff"),ue));const me=(T*n+c)*4;y[me]=$[0],y[me+1]=$[1],y[me+2]=$[2],y[me+3]=255}}return a.putImageData(l,0,0),o}function Br(n,t,o,a){if(n==="earth")return Or(o,a);if(n==="moon"||n==="pluto"||n==="charon")return Lr(n,o,a);const l=n==="saturn"?{...t,id:"saturn",ground:"#f2e2ba",ground2:"#c6a978",ground3:"#9b7f52"}:{...t,id:"jupiter",ground:"#e9d6b4",ground2:"#b57d50",ground3:"#8b5a38"};return xi(l,o,a)}function jr(n){const{canvas:o,ctx:a}=Mo(n,4),l=a.createImageData(n,4),y=l.data,i=1.11,h=2.36,b=je("#f6efdd"),M=je("#c9b48d"),x=je("#6f6455"),T=[[1.11,1.235,.1,.15],[1.235,1.525,.42,.3],[1.525,1.95,.98,.62],[1.951,2.025,.06,.1],[2.025,2.21,.72,.5],[2.211,2.215,.04,.1],[2.215,2.27,.66,.46],[2.27,2.31,.06,.1],[2.315,2.34,.34,.55]];for(let g=0;g<n;g+=1){const c=g/(n-1),P=i+(h-i)*c;let p=0,B=.5;for(const[oe,ue,me,se]of T)if(P>=oe&&P<=ue){p=me,B=se,p*=.82+.18*Math.sin((P-oe)*820+Math.sin((P-oe)*140)*2);break}const D=[1.29,1.44,1.63,1.72,1.88,2.06,2.15,2.24,2.29];for(const oe of D)Math.abs(P-oe)<.0035&&(p*=.12);p*=.9+.14*In(Math.floor(P*900),3,9931);const X=In(Math.floor(g/2),7,9931);let $=Lt(M,b,B);$=Lt($,x,(1-Math.min(1,p))*.35);const H=.82+X*.3;for(let oe=0;oe<4;oe+=1){const ue=(oe*n+g)*4;y[ue]=$[0]*H,y[ue+1]=$[1]*H,y[ue+2]=$[2]*H,y[ue+3]=Math.round(rn(p)*255)}}return a.putImageData(l,0,0),o}const Tn=new Map;function ya(n,t,o,a,l,y){const i=new Qn(t);for(i.colorSpace=o?An:es,i.wrapS=a?Ha:$i,i.wrapT=i.wrapS,i.anisotropy=l,i.magFilter=Zi,i.minFilter=Ki,i.generateMipmaps=!0,i.needsUpdate=!0,Tn.set(n,i);Tn.size>y;){const h=Tn.keys().next();if(h.done)break;const b=Tn.get(h.value);Tn.delete(h.value),b?.dispose()}return i}function Xr(n,t,o){const a=`ground:${n}:${t?"l":"h"}`,l=Tn.get(a);return l||ya(a,Vr(n,t?320:512),!1,!0,o,6)}function Yr(n,t,o){const a=`cloud:${n.id}:${t?"l":"h"}`,l=Tn.get(a);return l||ya(a,Gr(n,t?512:1024),!0,!0,o,4)}function Js(n,t,o,a){const y=`body:${n??t.id}:${o?"l":"h"}`,i=Tn.get(y);if(i)return i;const h=o?768:1024;return ya(y,Br(n,t,h,h/2),!0,!1,a,3)}function ja(n,t){const o=`ring:${n?"l":"h"}`,a=Tn.get(o);return a||ya(o,jr(n?1024:2048),!0,!1,t,2)}const ho=Math.PI/180,Jn=1500,ia=2800,Hr=3e-4,Qs=-4.3;function ra(n,t){const o=Math.sin(n*127.1+t*311.7)*43758.5453;return o-Math.floor(o)}function _o(n){return n*n*(3-2*n)}function qr(n,t){const o=Math.floor(n),a=Math.floor(t),l=n-o,y=t-a,i=ra(o,a),h=ra(o+1,a),b=ra(o,a+1),M=ra(o+1,a+1),x=_o(l),T=_o(y);return(i*(1-x)+h*x)*(1-T)+(b*(1-x)+M*x)*T}function ca(n,t,o=4){let a=0,l=.5,y=1;for(let i=0;i<o;i+=1)a+=l*qr(n*y,t*y),y*=2.03,l*=.5;return a}function po(n){let t=n>>>0||1;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function $r(n){let t=2166136261;for(let o=0;o<n.length;o+=1)t=Math.imul(t^n.charCodeAt(o),16777619);return t>>>0}function Xa(n,t){const o=n*ho,a=t*ho;return new W(Math.sin(o)*Math.cos(a),Math.sin(a),-Math.cos(o)*Math.cos(a)).normalize()}function Zr(){const t=document.createElement("canvas");t.width=128,t.height=128;const o=t.getContext("2d"),a=o.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);a.addColorStop(0,"rgba(255,255,255,1)"),a.addColorStop(.25,"rgba(255,236,196,0.72)"),a.addColorStop(.6,"rgba(255,190,110,0.18)"),a.addColorStop(1,"rgba(255,170,80,0)"),o.fillStyle=a,o.fillRect(0,0,128,128);const l=new Qn(t);return l.colorSpace=An,l}const Kr=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Jr=`
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
`,Qr=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,ec=`
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
`,tc=8,nc=.55,ei=.34;function oc(n,t={}){const o=!!t.low,a=t.anisotropy??(o?4:8),l=new We,y=[],i=u=>(y.push(u),u);let h=null,b=null,M=null;const x=$r(n.id),T=po(x),g=i(Zr()),c=[],P=[];let p=null,B=null,D=null,X=null;const $=[],H=[];if(n.terrain==="crater"){for(let u=0;u<(o?16:26);u+=1){const m=T()*Math.PI*2,R=20+Math.sqrt(T())*460,w=16+T()*74;$.push({x:Math.cos(m)*R,z:Math.sin(m)*R,r:w,d:w*(.16+T()*.2)})}for(let u=0;u<(o?26:48);u+=1){const m=T()*Math.PI*2,R=4+Math.pow(T(),.7)*150,w=2.5+Math.pow(T(),1.6)*11;$.push({x:Math.cos(m)*R,z:Math.sin(m)*R,r:w,d:w*(.2+T()*.22)})}}if(n.terrain==="volcano")for(let u=0;u<6;u+=1){const m=T()*Math.PI*2,R=60+T()*380;H.push({x:Math.cos(m)*R,z:Math.sin(m)*R,r:40+T()*90,h:12+T()*34})}if(n.terrain==="rock")for(let u=0;u<5;u+=1){const m=T()*Math.PI*2,R=60+T()*400;H.push({x:Math.cos(m)*R,z:Math.sin(m)*R,r:50+T()*110,h:6+T()*16})}function oe(u,m,R,w=4){return(ca(u*R,m*R,w)-.48)*2}function ue(u,m){if(n.terrain==="plasma"||n.terrain==="ring")return 0;const R=Math.hypot(u,m);let w=0;if(n.terrain==="crater"){w=oe(u+11,m+7,.004,4)*16+oe(u+3,m+17,.0012,2)*34+oe(u+5,m+23,.026,3)*3;for(const re of $){const ae=Math.hypot(u-re.x,m-re.z)/re.r;ae<1&&(w-=re.d*Math.pow(1-ae*ae,1.5)),ae<1.3&&(w+=re.d*.28*Math.exp(-Math.pow((ae-1.02)/.17,2)))}}else if(n.terrain==="rock"){w=oe(u+5,m+2,.0035,4)*40,w+=(1-Math.abs(oe(u,m,.011,3)))*12,w+=oe(u+21,m+13,.0011,2)*60,w+=oe(u+31,m+41,.028,3)*3.4;for(const re of H){const ae=Math.hypot(u-re.x,m-re.z)/re.r;ae<1&&(w+=re.h*Math.pow(1-ae,1.7))}}else if(n.terrain==="volcano"){w=oe(u+3,m+8,.005,4)*14+oe(u+9,m+1,.0012,2)*22;for(const re of H){const ae=Math.hypot(u-re.x,m-re.z)/re.r;ae<1&&(w+=re.h*Math.pow(1-ae,1.25)),ae<.24&&(w-=re.h*.5*(1-ae/.24))}}else n.terrain==="ice"?w=oe(u+9,m+4,.003,4)*9+oe(u,m,.012,2)*2.2+oe(u+2,m+8,.035,3)*1.1:w=oe(u+7,m+3,.0035,4)*12+oe(u,m,.012,2)*2.6+oe(u+4,m+2,.03,3)*3;const v=Math.max(0,R-1500)/500;w-=v*v*5;let Q=0,C=0;for(const re of c){const ae=Math.hypot(u-re.x,m-re.z)/re.r;ae<1&&(Q=Math.max(Q,re.d*Math.pow(1-ae*ae,1.55))),ae<1.45&&(C=Math.max(C,re.d*.3*Math.exp(-Math.pow((ae-1.02)/.16,2))))}return w-=Q,w+=C,w+=(ca(u*.09+1,m*.09+6,2)-.5)*(n.terrain==="rock"?1.2:n.terrain==="ice"?.25:.5),w}let me=ue(0,0);function se(u,m){return ue(u,m)-me}const ie=(()=>{if(n.cloudTop!==null||n.terrain==="plasma"||n.terrain==="ring")return{x:0,z:0};const u=[];for(let R=0;R<40;R+=1){const w=R/40*Math.PI*2,v=R%5*34,Q=Math.cos(w)*v,C=Math.sin(w)*v;let re=0;for(let ae=0;ae<8;ae+=1){const tt=ae/8*Math.PI*2;re+=se(Q+Math.cos(tt)*120,C+Math.sin(tt)*120)}u.push({x:Q,z:C,score:se(Q,C)-re/8})}u.sort((R,w)=>w.score-R.score);const m=u[Math.floor(u.length*.28)];return{x:m.x,z:m.z}})();me=ue(ie.x,ie.z);const U=n.cloudTop!==null?n.cloudTop:se(ie.x,ie.z),fe=1.7,Pe=Xa(n.sunAz,n.sunElev),Ge=n.sunScale>0?.2667*n.sunScale*ho:0,xe=Math.max(0,Math.min(1,n.fogDensity*26)),Ke=new G(n.skyTop),Me=new G(n.skyBottom),ge=new G(n.glow),Fe=i(new Qe({vertexShader:Kr,fragmentShader:Jr,side:mo,depthWrite:!1,uniforms:{uTop:{value:Ke.clone()},uBottom:{value:Me.clone()},uGlow:{value:ge.clone()},uSun:{value:new G(n.sunColor)},uSunDir:{value:Pe.clone()},uSunRadius:{value:Ge},uSunHaze:{value:xe},uGlowGain:{value:n.glowGain}}})),Mt=new j(i(new Ie(ia,32,20)),Fe);Mt.frustumCulled=!1,l.add(Mt);function mt(u,m){if(!X)return;const R=Math.max(0,u),w=Math.max(1,m??u),v=_o(Math.min(1,Math.max(0,(R-25)/95))),Q=Hr*v;X.uCurve.value=Q,X.uOrbit.value=_o(Math.min(1,Math.max(0,(R-45)/150))),X.uRimDist.value=Q>1e-7?Math.sqrt(w/(4*Q)):2400,X.uRim.value=v*(n.stars?.4:.55)}let Vt=0;function Ot(u){Vt=Math.max(0,Math.min(1,u));const m=1-Vt;Fe.uniforms.uTop.value.copy(Ke).multiplyScalar(m),Fe.uniforms.uBottom.value.copy(Me).multiplyScalar(m),Fe.uniforms.uGlow.value.copy(ge).multiplyScalar(m),Fe.uniforms.uGlowGain.value=n.glowGain*m,Fe.uniforms.uSun.value.copy(new G(n.sunColor)).multiplyScalar(m),Bt&&(Bt.opacity=.85*Math.min(1,Vt*1.6))}let Bt=null;if(n.stars){const u=o?320:620,m=new Float32Array(u*3),R=po(x^2654435769);for(let C=0;C<u;C+=1){const re=R()*Math.PI*2,ae=Math.pow(R(),.65)*.98+.02,tt=Math.sqrt(1-ae*ae);m[C*3]=Math.cos(re)*tt*(ia-200),m[C*3+1]=ae*(ia-200),m[C*3+2]=Math.sin(re)*tt*(ia-200)}const w=i(new sn);w.setAttribute("position",new kn(m,3));const v=i(new ha({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1}));Bt=v;const Q=new da(w,v);Q.frustumCulled=!1,l.add(Q)}const I=Math.min(1.5,.45+.9*Math.min(1,Math.max(n.sunScale,.02)*1.5)),q=n.stars?.4:.46,_e=(u,m)=>{const w=-(se(u+.9,m)-se(u-.9,m))/1.8,v=-(se(u,m+.9)-se(u,m-.9))/(2*.9),Q=1/Math.sqrt(w*w+1+v*v),C=Math.max(0,(w*Pe.x+Pe.y+v*Pe.z)*Q);return q+I*C};let J=[],L=null;if(n.terrain==="plasma"){const u=i(new Qe({vertexShader:Qr,fragmentShader:ec,uniforms:{uTime:{value:0},uA:{value:new G(n.ground)},uB:{value:new G(n.ground2)},uC:{value:new G(n.ground3)}}}));L=u;const m=new j(i(new Eo(2400,2400,1,1)),u);m.rotation.x=-Math.PI/2,m.position.y=0,l.add(m)}else if(n.terrain!=="ring")if(n.cloudTop!==null){const u=Yr(n,o,a),m=Math.min(1.12,.55+.5*Math.min(1,Math.max(n.sunScale,.02)*2)),R=(C,re)=>i(new Qe({vertexShader:Er,fragmentShader:Nr,uniforms:{uMap:{value:u},uOffset:{value:new Io(0,0)},uTile:{value:C},uDetail:{value:11},uTint:{value:new G().setScalar(re)},uOpacity:{value:1},uFogColor:{value:new G(n.fog)},uFogDensity:{value:n.fogDensity}}})),w=new j(i(new Eo(5200,5200,1,1)),R(Ks,m));w.rotation.x=-Math.PI/2,w.position.y=n.cloudTop,l.add(w),J=[w.material];const v=R(Ks*.42,m*.86);v.uniforms.uOpacity.value=.55,v.transparent=!0,v.depthWrite=!1;const Q=new j(i(new Eo(5200,5200,1,1)),v);Q.rotation.x=-Math.PI/2,Q.position.y=n.cloudTop-90,l.add(Q),J.push(v)}else{const u=o?96:150,m=i(new Eo(Jn*2,Jn*2,u,u));m.rotateX(-Math.PI/2);const R=m.attributes.position,w=new Float32Array(R.count*3),v=new G(n.ground),Q=new G(n.ground2),C=new G(n.ground3),re=new kn(w,3),ae=new G,tt=ce=>{const Ae=R.getX(ce),Se=R.getZ(ce),Le=se(Ae,Se);R.setY(ce,Le);const $e=ca(Ae*.02+3,Se*.02+9,3);ae.copy(v).lerp(Q,_o(Math.min(1,Math.max(0,($e-.28)/.5)))),Le<-1.6&&ae.lerp(C,Math.min(1,(-Le-1.6)/7));const Ee=ca(Ae*.0045+17,Se*.0045+41,3),ct=Math.min(1.9,_e(Ae,Se))*(.9+($e-.5)*.22)*(.84+Ee*.34);let nt=1;for(const at of c){const st=Math.hypot(Ae-at.x,Se-at.z)/at.r;if(st>1.5)continue;const ht=Math.min(1,Math.max(0,1-st/1.35));nt*=1-.62*ht*ht}w[ce*3]=ae.r*ct*nt,w[ce*3+1]=ae.g*ct*nt*.94,w[ce*3+2]=ae.b*ct*nt*.9};for(let ce=0;ce<R.count;ce+=1){const Ae=R.getX(ce)/Jn,Se=R.getZ(ce)/Jn,Le=Math.sign(Ae)*Math.pow(Math.abs(Ae),1.8)*Jn,$e=Math.sign(Se)*Math.pow(Math.abs(Se),1.8)*Jn;R.setXYZ(ce,Le,0,$e),tt(ce)}m.setAttribute("color",re),m.computeVertexNormals();const Pt=Xr(n.terrain,o,a),Ft=1/(Pt.image.width||512),Et=i(new Qe({vertexShader:Rr,fragmentShader:Fr,vertexColors:!0,side:rt,uniforms:{uMap:{value:Pt},uTexel:{value:Ft},uTile:{value:Mi},uDetail:{value:5.6},uBump:{value:9},uGloss:{value:n.terrain==="ice"?.9:.25},uSunDir:{value:Pe.clone()},uSunColor:{value:new G(n.sunColor)},uFogColor:{value:new G(n.fog)},uFogDensity:{value:n.fogDensity},uAmbient:{value:q},uSunPower:{value:I},uCurve:{value:0},uOrbit:{value:0},uSea:{value:n.id==="earth"?1:0},uCloudy:{value:n.stars?0:Math.min(.5,.15+n.fogDensity*450)},uSeaColor:{value:new G(n.skyTop).multiplyScalar(.42)},uCloudColor:{value:new G(n.fog).lerp(new G("#ffffff"),.55)},uRimColor:{value:new G(n.skyTop).lerp(new G("#ffffff"),.55)},uRim:{value:0},uRimDist:{value:600}}})),Un=new j(m,Et);l.add(Un),M=Un,X=Et.uniforms;const gn=1.8,ln=u+1,bt=new Float32Array(ln);for(let ce=0;ce<ln;ce+=1){const Ae=-1+2*ce/u;bt[ce]=Math.sign(Ae)*Math.pow(Math.abs(Ae),gn)*Jn}const Ct=ce=>{if(ce<=bt[0])return 0;if(ce>=bt[u])return u-1;let Ae=0,Se=u;for(;Se-Ae>1;){const Le=Ae+Se>>1;bt[Le]<=ce?Ae=Le:Se=Le}return Ae};b=(ce,Ae)=>{const Se=Ct(ce),Le=Ct(Ae);if(Se<0||Le<0||Se>=u||Le>=u)return se(ce,Ae);const $e=(ce-bt[Se])/(bt[Se+1]-bt[Se]),Ee=(Ae-bt[Le])/(bt[Le+1]-bt[Le]),ct=Le*ln+Se,nt=R.getY(ct),at=R.getY(ct+1),st=R.getY(ct+ln),ht=R.getY(ct+ln+1);return $e+Ee<=1?nt+(at-nt)*$e+(st-nt)*Ee:ht+(st-ht)*(1-$e)+(at-ht)*(1-Ee)};const St=po(x^2135587861),wo=[n.ground2,n.ground3,n.ground].map(ce=>new G(ce).multiplyScalar(q+I*.75)),un=new No,yn=ce=>{un.position.set(ce.x,ce.y,ce.z),un.rotation.set(ce.rx,ce.ry,ce.rz),un.scale.set(ce.sx,ce.sy,ce.sz),un.updateMatrix(),ce.mesh.setMatrixAt(ce.index,un.matrix)},Mn=(ce,Ae,Se,Le,$e,Ee,ct)=>{const nt=new va(ce,i(new ye({color:16777215})),Ae);nt.instanceMatrix.setUsage(Ya);for(let at=0;at<Ae;at+=1){const st=St()*Math.PI*2,ht=Se+Math.sqrt(St())*(Le-Se),it=ie.x+Math.cos(st)*ht,Kt=ie.z+Math.sin(st)*ht,Yt=$e+Math.pow(St(),2.1)*(Ee-$e),Ht=se(it,Kt),ke=Yt*(.45+St()*.5),Jt={mesh:nt,index:at,x:it,z:Kt,y:Ht+Yt*ct,base:Ht,relief:0,liftY:Yt*ct,sx:Yt*(.8+St()*.7),sy:ke,sz:Yt*(.8+St()*.7),rx:St()*3,ry:St()*3,rz:St()*3,fly:!1,vx:0,vy:0,vz:0,spin:new W};Jt.relief=Jt.y+ke*.72-Ht,P.push(Jt),yn(Jt),nt.setColorAt(at,wo[at%3])}nt.instanceMatrix.needsUpdate=!0,nt.instanceColor&&(nt.instanceColor.needsUpdate=!0),l.add(nt)};if(Mn(i(new Sn(1,0)),o?90:170,1.2,60,.02,.22,.35),Mn(i(new Sn(1,1)),o?30:54,2,120,.18,1.1,.34),Mn(i(new Sn(1,1)),o?10:18,6,190,.6,2.4,.4),B=(ce,Ae,Se)=>{const Le=Se*2.4;for(let $e=0;$e<R.count;$e+=1){const Ee=R.getX($e)-ce,ct=R.getZ($e)-Ae;Ee*Ee+ct*ct>Le*Le||tt($e)}R.needsUpdate=!0,re.needsUpdate=!0,m.computeVertexNormals()},p=()=>{for(let ce=0;ce<R.count;ce+=1)tt(ce);R.needsUpdate=!0,re.needsUpdate=!0,m.computeVertexNormals()},D=(ce,Ae,Se)=>{const Le=Se*1.2,$e=Se*2.3;for(const Ee of P){const ct=Ee.x-ce,nt=Ee.z-Ae,at=Math.hypot(ct,nt);if(!(at>$e)){if(Ee.base=se(Ee.x,Ee.z),Ee.y=Ee.base+Ee.liftY,Ee.relief=Ee.y+Ee.sy*.72-Ee.base,at<Le&&Ee.sy>.16){const st=at>.001?at:1,ht=12+Math.random()*26;Ee.fly=!0,Ee.vx=ct/st*ht,Ee.vz=nt/st*ht,Ee.vy=9+Math.random()*20,Ee.spin.set((Math.random()-.5)*9,(Math.random()-.5)*9,(Math.random()-.5)*9)}yn(Ee),Ee.mesh.instanceMatrix.needsUpdate=!0}}},n.terrain==="ice"){const ce=[],Ae=po(x^1542469173),Se=($e,Ee,ct,nt,at,st)=>{let ht=$e,it=Ee,Kt=ct;for(let Yt=0;Yt<nt;Yt+=1){const Ht=ht+Math.cos(Kt)*at,ke=it+Math.sin(Kt)*at;ce.push(ht,se(ht,it)+.06,it,Ht,se(Ht,ke)+.06,ke),ht=Ht,it=ke,Kt+=(Ae()-.5)*.9,st>0&&Yt===nt>>1&&Ae()<.7&&Se(ht,it,Kt+(Ae()<.5?.9:-.9),Math.max(3,nt>>2),at*.8,st-1)}};for(let $e=0;$e<(o?6:10);$e+=1)Se((Ae()-.5)*300,(Ae()-.5)*300,Ae()*Math.PI*2,14,14,1);const Le=i(new sn);Le.setAttribute("position",new kn(new Float32Array(ce),3)),l.add(new hi(Le,i(new Do({color:n.ground3,transparent:!0,opacity:.75}))))}}if(n.terrain==="ring"){const u=new We;u.position.copy(Xa(n.companionAz,0)).multiplyScalar(2600);const m=Qs;u.position.y=m;const R=480,w=R*1.11,v=R*2.36,Q=new j(i(new Ie(R,o?64:128,o?44:80)),i(new Qe({vertexShader:$s,fragmentShader:Zs,uniforms:{uMap:{value:Js("saturn",n,o,a)},uLimb:{value:.4},uRim:{value:new G("#e8dcbc")}}})));u.add(Q);const C=i(new Qe({vertexShader:fo,fragmentShader:Oa,transparent:!0,side:rt,depthWrite:!1,uniforms:{uProfile:{value:ja(o,a)},uInner:{value:w},uOuter:{value:v},uAlpha:{value:o?.78:.88}}})),re=new j(i(new Rt(w,v,o?128:220,1)),C);re.rotation.x=-Math.PI/2,re.position.y=m,u.add(re),l.add(u);const ae=o?220:420,tt=i(new Sn(1,0)),Pt=i(new ye({color:"#dfe8f2"})),Ft=new va(tt,Pt,ae);Ft.instanceMatrix.setUsage(Ya);const Et=po(x^1374496523),Un=[],gn=new No;for(let St=0;St<ae;St+=1){const un=St%31===0?.5+Et()*1.3:.05+Math.pow(Et(),2)*.55,yn=14+Math.pow(Et(),.7)*150,Mn=Et()*Math.PI*2,ce=(Et()-.5)*14;Un.push({r:yn,a:Mn,y:ce,spin:.02+Et()*.08,size:un,wob:Et()*Math.PI*2}),gn.position.set(Math.cos(Mn)*yn,ce,Math.sin(Mn)*yn),gn.rotation.set(Et()*3,Et()*3,Et()*3),gn.scale.setScalar(un),gn.updateMatrix(),Ft.setMatrixAt(St,gn.matrix);const Ae=.5+Et()*.45;Ft.setColorAt(St,new G(Ae,Ae*.98,Ae*1.05))}Ft.instanceMatrix.needsUpdate=!0,Ft.instanceColor&&(Ft.instanceColor.needsUpdate=!0),l.add(Ft),h={mesh:Ft,data:Un};const ln=i(new Qe({vertexShader:fo,fragmentShader:sa,transparent:!0,side:rt,depthWrite:!1,uniforms:{uInner:{value:.6},uOuter:{value:2600-v-10},uBands:{value:260},uA:{value:new G("#e2eaf4")},uB:{value:new G("#c3cfdd")},uAlpha:{value:.92},uGrain:{value:.26}}})),bt=2600-v-10,Ct=new j(i(new Rt(.6,bt,128,1)),ln);Ct.rotation.x=-Math.PI/2,Ct.position.y=m,l.add(Ct)}if(n.ring){const u=n.ring==="uranus",m=u?210:170,R=u?520:560,w=u?82*ho:27*ho,v=u?140:54,Q=i(u?new Qe({vertexShader:fo,fragmentShader:sa,transparent:!0,side:rt,depthWrite:!1,uniforms:{uInner:{value:m},uOuter:{value:R},uBands:{value:v},uA:{value:new G("#9fd0d6")},uB:{value:new G("#cdeef2")},uAlpha:{value:.5},uGrain:{value:.4}}}):new Qe({vertexShader:fo,fragmentShader:Oa,transparent:!0,side:rt,depthWrite:!1,uniforms:{uProfile:{value:ja(o,a)},uInner:{value:m},uOuter:{value:R},uAlpha:{value:.82}}})),C=new j(i(new Rt(m,R,o?64:128,1)),Q);if(C.rotation.x=-Math.PI/2+w,C.position.y=u?30:90,l.add(C),u){const re=i(new Qe({vertexShader:fo,fragmentShader:sa,transparent:!0,side:rt,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new G("#dff6f8")},uB:{value:new G("#bfe6ea")},uAlpha:{value:.35},uGrain:{value:.3}}})),ae=new j(i(new Rt(130,175,64,1)),re);ae.rotation.x=-Math.PI/2+w,ae.position.y=30,l.add(ae)}}if(n.companion&&n.terrain!=="ring"){const m=Math.max(6,Math.tan(n.companionSize/2*ho)*1500),R=new We;R.position.copy(Xa(n.companionAz,n.companionElev)).multiplyScalar(1500);const w=Js(n.companion,n,o,a),v=new j(i(new Ie(m,o?48:72,o?32:48)),i(new Qe({vertexShader:$s,fragmentShader:Zs,uniforms:{uMap:{value:w},uLimb:{value:.42},uRim:{value:new G(n.companion==="earth"?"#9fd0ff":"#cfe0f2")}}})));if(v.lookAt(0,0,0),R.add(v),n.companion==="saturn"||n.companion==="jupiter"){const C=n.companion==="saturn",re=i(new Qe({vertexShader:fo,fragmentShader:C?Oa:sa,transparent:!0,side:rt,depthWrite:!1,uniforms:C?{uProfile:{value:ja(o,a)},uInner:{value:m*1.12},uOuter:{value:m*2.36},uAlpha:{value:.7}}:{uInner:{value:m*1.3},uOuter:{value:m*1.7},uBands:{value:16},uA:{value:new G("#d9c7a8")},uB:{value:new G("#b09070")},uAlpha:{value:.18},uGrain:{value:.3}}})),ae=new j(i(new Rt(m*(C?1.12:1.3),m*(C?2.36:1.7),64,1)),re);ae.rotation.x=-Math.PI/2+.32,R.add(ae)}const Q=new vo(i(new go({map:g,color:new G(n.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:Ye})));Q.scale.setScalar(m*4),R.add(Q),l.add(R)}const we=n.terrain!=="ring",lt=(u,m)=>n.terrain==="ring"?Qs:n.cloudTop!==null?n.cloudTop:se(u,m),ot=yr({sunDir:Pe,ambient:Math.min(1.05,q+.24),sunPower:I});l.add(ot.group),ot.setVisible(!1);const ee=zr({floorAt:lt,heightAt:se,onImpact:t.onImpact,onScar:(u,m)=>zn(u,m)});l.add(ee.group);const Y=o?140:n.particles==="haze"?120:300;let V=null,te=null;if(n.particles!=="none"){const u=new Float32Array(Y*3);te=new Float32Array(Y*3);const m=po(x^625341585);for(let Q=0;Q<Y;Q+=1){const C=m()*Math.PI*2,re=Math.sqrt(m())*55,ae=n.particles;let tt=m()*22;ae==="spark"&&(tt=m()*14),ae==="haze"&&(tt=2+m()*26),u[Q*3]=Math.cos(C)*re,u[Q*3+1]=tt,u[Q*3+2]=Math.sin(C)*re;const Pt=ae==="wind"?42+m()*34:ae==="rain"?12+m()*6:ae==="spark"?2+m()*4:1.2+m()*2.6;te[Q*3]=ae==="wind"?Pt:(m()-.5)*Pt*.5,te[Q*3+1]=ae==="rain"?-Pt:ae==="spark"?Pt:ae==="snow"?-.6-m()*.9:(m()-.5)*.4,te[Q*3+2]=ae==="wind"?Pt*.25:(m()-.5)*Pt*.4}V=i(new sn),V.setAttribute("position",new kn(u,3));const R=n.particles==="haze"?2.6:n.particles==="dust"?.14:n.particles==="rain"?.09:n.particles==="snow"?.11:.16,w=i(new ha({color:new G(n.particleColor),size:R,transparent:!0,opacity:n.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:n.particles==="spark"?Ye:void 0})),v=new da(V,w);v.frustumCulled=!1,l.add(v)}const be=i(new Sn(.26,0)),K=i(new Ie(.24,16,12)),O=n.cloudTop===null&&n.terrain!=="plasma",le=[],xt=[],dt=[];function vn(u,m,R,w){const v=new vo(i(new go({map:g,color:new G(m),transparent:!0,opacity:.9,depthWrite:!1,blending:Ye})));v.position.copy(u),v.scale.setScalar(R),l.add(v),xt.push({sprite:v,life:w,max:w,grow:R*2.4})}function Vn(u,m){const R=new j(i(new Rt(.28,.5,24,1)),i(new ye({color:new G(m),transparent:!0,opacity:.6,depthWrite:!1,side:rt})));R.rotation.x=-Math.PI/2,R.position.copy(u),l.add(R),dt.push({mesh:R,life:.7})}function Wo(u,m){const R=ie.x+u,w=ie.z+m,v=n.cloudTop!==null?n.cloudTop:se(R,w),Q=O?new ye({color:new G("#c9c2b4").multiplyScalar(q+I*.8),transparent:!0}):new ye({color:new G("#ffb45e"),transparent:!0}),C=new j(O?be:K,Q);C.position.set(R,v+4.2,w),C.scale.setScalar(.9+Math.random()*.35),l.add(C);const re=n.gravityMps2<=.01;if(le.push({mesh:C,x:R,z:w,y:re?v+.6:v+4.2,vy:re?.12:0,vx:re?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:re?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),le.length>6){const ae=le.shift();ae&&(l.remove(ae.mesh),ae.mesh.material.dispose())}}function Cn(u,m){const R=new W(u.x,m+.2,u.z);if(n.gravityMps2<=.01){u.outcome="float",u.landed=!0,u.resting=5.5,t.onLand?.({seconds:u.fall,bounces:0,outcome:"float"});return}if(n.terrain==="plasma"){u.outcome="vapor",u.landed=!0,u.resting=.25,vn(R,"#fff2c0",1.2,.6),t.onLand?.({seconds:u.fall,bounces:0,outcome:"vapor"});return}if(n.cloudTop!==null){u.outcome="sink",u.landed=!0,u.resting=1.6,vn(R,"#ffffff",1.6,.7),t.onLand?.({seconds:u.fall,bounces:0,outcome:"sink"});return}if(u.bounces+=1,Vn(R,n.ground2),u.bounces===1&&t.onLand?.({seconds:u.fall,bounces:1,outcome:"bounce"}),u.bounces>=4||Math.abs(u.vy)<1.3){u.landed=!0,u.outcome="bounce",u.resting=1.6,u.vy=0;return}u.vy=Math.abs(u.vy)*.42,u.y=m+.26,u.vx*=.6,u.vz*=.6}const Wn=new No,Uo=new G("#31090d"),jt=new G("#180509"),Ma=new G("#ff3a10");function Go(u,m){ee.update(u,m);const R=ee.doom();Fe.uniforms.uTop.value&&(Fe.uniforms.uTop.value.copy(Ke).lerp(Uo,R),Fe.uniforms.uBottom.value.copy(Me).lerp(jt,R),Fe.uniforms.uGlow.value.copy(ge).lerp(Ma,R)),Bt&&(Bt.opacity=.85*(1-R*.85)),L&&(L.uniforms.uTime.value=u);for(let w=0;w<J.length;w+=1){const v=J[w].uniforms.uOffset.value;v.x=(v.x+m*(w===0?.006:.012))%1}if(h){const{mesh:w,data:v}=h;for(let Q=0;Q<v.length;Q+=1){const C=v[Q];C.a+=C.spin*m*.05,Wn.position.set(Math.cos(C.a)*C.r,C.y+Math.sin(u*.25+C.wob)*.5,Math.sin(C.a)*C.r),Wn.rotation.set(u*.08+C.wob,u*.11+C.a,C.wob),Wn.scale.setScalar(C.size),Wn.updateMatrix(),w.setMatrixAt(Q,Wn.matrix)}w.instanceMatrix.needsUpdate=!0}if(V&&te){const w=V.attributes.position,v=w.array;for(let Q=0;Q<w.count;Q+=1){const C=Q*3;v[C]+=te[C]*m,v[C+1]+=te[C+1]*m,v[C+2]+=te[C+2]*m,n.particles==="rain"||n.particles==="snow"?v[C+1]<0&&(v[C+1]=22):n.particles==="spark"?v[C+1]>20&&(v[C+1]=0):(v[C+1]<0&&(v[C+1]=24),v[C+1]>26&&(v[C+1]=0)),v[C]>60&&(v[C]=-60),v[C]<-60&&(v[C]=60),v[C+2]>60&&(v[C+2]=-60),v[C+2]<-60&&(v[C+2]=60)}w.needsUpdate=!0}for(let w=le.length-1;w>=0;w-=1){const v=le[w],Q=n.cloudTop!==null?n.cloudTop:se(v.x,v.z);if(v.landed)v.resting>0?(v.resting-=m,v.outcome==="sink"?(v.y-=m*2.4,v.mesh.scale.multiplyScalar(1-m*.8)):v.outcome==="vapor"?v.mesh.scale.multiplyScalar(1-m*3):v.mesh.scale.multiplyScalar(1-m*.25)):(v.fade-=m*1.4,v.mesh.material.opacity=Math.max(0,v.fade),v.mesh.scale.multiplyScalar(1-m*.9),v.fade<=0&&(l.remove(v.mesh),v.mesh.material.dispose(),le.splice(w,1)));else{if(v.fall+=m,n.gravityMps2<=.01){v.x+=v.vx*m,v.z+=v.vz*m,v.y+=v.vy*m,v.mesh.rotation.x+=m*.6,v.mesh.rotation.y+=m*.45,v.mesh.position.set(v.x,v.y,v.z),v.fall>.05&&Cn(v,v.y);continue}v.vy-=n.gravityMps2*m,v.y+=v.vy*m,v.x+=v.vx*m,v.z+=v.vz*m,v.mesh.rotation.x+=m*3.2,v.mesh.rotation.z+=m*2.1,v.y-.26<=Q&&(v.y=Q+.26,Cn(v,Q))}v.mesh.position.set(v.x,v.y,v.z)}for(const w of P){if(!w.fly)continue;const v=Math.max(1.2,n.gravityMps2);w.vy-=v*m,w.x+=w.vx*m,w.y+=w.vy*m,w.z+=w.vz*m,w.vx*=1-m*.25,w.vz*=1-m*.25,w.rx+=w.spin.x*m,w.ry+=w.spin.y*m,w.rz+=w.spin.z*m;const Q=se(w.x,w.z)+w.sy*.72;w.y<=Q&&(w.y=Q,w.fly=!1,w.vx=0,w.vy=0,w.vz=0,w.base=se(w.x,w.z),w.liftY=w.y-w.sy*.72-w.base,w.relief=w.y+w.sy*.72-w.base),wa(w),w.mesh.instanceMatrix.needsUpdate=!0}for(let w=xt.length-1;w>=0;w-=1){const v=xt[w];v.life-=m;const Q=1-v.life/v.max;v.sprite.scale.setScalar(v.sprite.scale.x+(v.grow-v.sprite.scale.x)*Math.min(1,m*6)),v.sprite.material.opacity=Math.max(0,.9*(1-Q)),v.life<=0&&(l.remove(v.sprite),xt.splice(w,1))}for(let w=dt.length-1;w>=0;w-=1){const v=dt[w];v.life-=m,v.mesh.scale.multiplyScalar(1+m*3.4),v.mesh.material.opacity=Math.max(0,v.life/.7)*.6,v.life<=0&&(l.remove(v.mesh),dt.splice(w,1))}}function zn(u,m){if(n.cloudTop!==null||n.terrain==="plasma"||n.terrain==="ring"||!B)return 0;const R=22+Math.random()*6,w=Math.max(1.4,se(u,m)+26),v=Math.min(4.8+Math.random()*1.2,w);return c.push({x:u,z:m,r:R,d:v}),c.length>tc&&(c.shift(),p?.()),B(u,m,R),D?.(u,m,R),R}const Xt=new No;function wa(u){Xt.position.set(u.x,u.y,u.z),Xt.rotation.set(u.rx,u.ry,u.rz),Xt.scale.set(u.sx,u.sy,u.sz),Xt.updateMatrix(),u.mesh.setMatrixAt(u.index,Xt.matrix)}function xa(u,m){let R=u,w=m,v=0;for(const Q of P){if(Q.fly)continue;const C=Math.max(Q.sx,Q.sz);if(C<.04)continue;let re=R-Q.x,ae=w-Q.z;const tt=Math.hypot(re,ae);if(!(tt>C+1.2)){if(Q.relief<=nc)tt<C*.95&&(v=Math.max(v,Q.relief));else if(tt<C+ei){tt<1e-4&&(re=0,ae=1);const Pt=Math.max(1e-4,Math.hypot(re,ae)),Ft=C+ei-tt;R+=re/Pt*Ft,w+=ae/Pt*Ft}}}return{x:R,z:w,rise:v}}const Lo=(u,m)=>{const w=-(se(u+.9,m)-se(u-.9,m))/1.8,v=-(se(u,m+.9)-se(u,m-.9))/(2*.9);return new W(w,1,v).normalize()},Rn=new vi,Oo=(u,m)=>{const R=b?b(u,m):se(u,m);let w=null;if(M){Rn.set(new W(u,4e3,m),new W(0,-1,0));const v=Rn.intersectObject(M,!1)[0];v&&(w=v.point.y)}return{mesh:R,ray:w}};function Bo(){ot.dispose(),ee.dispose();for(const u of xt)l.remove(u.sprite);for(const u of dt)l.remove(u.mesh);for(const u of le)l.remove(u.mesh),u.mesh.material.dispose();y.forEach(u=>u.dispose()),l.clear()}return{group:l,eyeY:U+fe,eyeHeight:fe,groundY:U,standX:ie.x,standZ:ie.z,heightAt:se,floorAt:lt,solidFloor:we,walkable:n.cloudTop===null&&n.terrain!=="ring",avatar:ot,impact:ee,scar:zn,walk:xa,normalAt:Lo,scarCount:()=>c.length,atmosphere:Ot,orbitView:mt,meshHeightAt:(u,m)=>b?b(u,m):se(u,m),probeGround:Oo,update:Go,drop:Wo,dispose:Bo}}const ac="models/rocket/",sc="textures/rocket/",ti={engine:"engine-cluster",stage1:"first-stage-core",inter:"interstage",stage2:"second-stage",fairing:"payload-fairing",fins:"grid-fin-set",mount:"launch-mount",deflector:"flame-deflector",gantryBase:"gantry-base",gantryTower:"gantry-tower",strongback:"strongback",mast:"lightning-mast",flood:"floodlight"},ma=4.4,ni=7.2;let oi=null,ai=null;function ic(){return ai??=(async()=>{const n=new yi,t=async(T,g)=>{const c=await n.loadAsync(`${sc}${T}.webp`);return c.wrapS=Ha,c.wrapT=Ha,c.colorSpace=g?An:es,c.anisotropy=8,c},[o,a,l,y,i,h,b,M,x]=await Promise.all([t("hull_color",!0),t("hull_normal",!1),t("hull_rough",!1),t("tile_color",!0),t("tile_normal",!1),t("tile_rough",!1),t("steel_color",!0),t("steel_normal",!1),t("steel_rough",!1)]);return{hullColor:o,hullNormal:a,hullRough:l,tileColor:y,tileNormal:i,tileRough:h,steelColor:b,steelNormal:M,steelRough:x}})(),ai}function rc(){return oi??=(async()=>{const n=new Qi,t=new Map;return await Promise.all(Object.keys(ti).map(async o=>{const a=await n.loadAsync(`${ac}${ti[o]}.glb`);t.set(o,a.scene)})),t})(),oi}function cc(n,t){const o=(l,y,i,h,b,M)=>new $a({map:l,normalMap:y,roughnessMap:i,color:h,metalness:b,roughness:M,envMap:t,envMapIntensity:1.15}),a=(l,y,i)=>new $a({color:l,metalness:y,roughness:i,envMap:t,envMapIntensity:.9});return{white:o(n.hullColor,n.hullNormal,n.hullRough,15659766,.88,.62),cryo:o(n.hullColor,n.hullNormal,n.hullRough,12175834,.82,.55),charcoal:o(n.tileColor,n.tileNormal,n.tileRough,10132122,.38,.72),steel:o(n.steelColor,n.steelNormal,n.steelRough,12764876,.8,.5),red:a(11942448,.3,.55),yellow:a(14197788,.35,.5),concrete:a(11051930,.05,.92),glass:a(3030348,.55,.25)}}function lc(n,t,o){n.traverse(a=>{const l=a;if(!l.isMesh)return;const y=l.geometry,i=y.getAttribute("position");if(!i)return;const h=new Float32Array(i.count*2);for(let b=0;b<i.count;b+=1){const M=i.getX(b),x=i.getY(b),T=i.getZ(b);h[b*2]=(Math.atan2(M,T)/(Math.PI*2)+.5)*t,h[b*2+1]=x*o}y.setAttribute("uv",new kn(h,2))})}function uc(n,t){n.traverse(o=>{const a=o;if(!a.isMesh)return;const l=a.geometry,y=l.getAttribute("position");if(!y)return;const i=new Float32Array(y.count*2);for(let h=0;h<y.count;h+=1)i[h*2]=(y.getX(h)+y.getZ(h))*t,i[h*2+1]=y.getY(h)*t;l.setAttribute("uv",new kn(i,2))})}function si(n,t){n.traverse(o=>{const a=o;if(!a.isMesh)return;const l=a.material;Array.isArray(l)?a.material=l.map(y=>t[y.name]??t.steel):a.material=t[l?.name??"steel"]??t.steel})}function fc(n,t){if(typeof document>"u")return null;const o=document.createElement("canvas");o.width=128,o.height=64;const a=o.getContext("2d");if(!a)return null;const l=a.createLinearGradient(0,0,0,64),y=new G("#8d8a84"),i=new G(t.ground).lerp(y,.5).getStyle(),h=new G(t.ground2??t.ground).lerp(y,.5).getStyle();l.addColorStop(0,t.skyTop),l.addColorStop(.5,t.skyBottom),l.addColorStop(.53,i),l.addColorStop(1,h),a.fillStyle=l,a.fillRect(0,0,128,64);const b=(t.sunAz/360%1+1)%1*128,M=32-t.sunElev/90*26,x=a.createRadialGradient(b,M,0,b,M,t.sunScale>0?18:.1);x.addColorStop(0,t.sunColor),x.addColorStop(1,"rgba(0,0,0,0)"),a.fillStyle=x,a.fillRect(0,0,128,64);const T=new Qn(o);T.mapping=er,T.colorSpace=An;const g=new tr(n),c=g.fromEquirectangular(T).texture;return g.dispose(),T.dispose(),c}const pc=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,mc=`
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
`;function dc(){const t=document.createElement("canvas");t.width=96,t.height=96;const o=t.getContext("2d");if(o){const l=o.createRadialGradient(48,48,2,48,48,48);l.addColorStop(0,"rgba(255,255,255,0.95)"),l.addColorStop(.45,"rgba(240,240,240,0.5)"),l.addColorStop(1,"rgba(230,230,230,0)"),o.fillStyle=l,o.fillRect(0,0,96,96)}const a=new Qn(t);return a.colorSpace=An,a}async function hc(n,t){const[o,a]=await Promise.all([rc(),ic()]),l=fc(n,t),y=cc(a,l),i=new We;i.name="rocket-pad";const h=I=>{const q=o.get(I);if(!q)throw new Error(`rocket part ${I}`);return q.clone(!0)},b=(I,q,_e=0,J=0,L=0)=>{const we=h(q);return we.position.set(J,_e,L),I.add(we),we},M=new We;if(i.add(M),b(M,"mount",0,0,0),b(M,"deflector",-1.9,0,0),b(M,"gantryBase",0,-11.5,1.5),b(M,"gantryTower",7.71,-11.5,1.5),b(M,"gantryTower",14.94,-11.5,1.5),b(M,"strongback",6.19,-7.4,-.4),b(M,"mast",0,-19,-8),b(M,"flood",0,13,7),b(M,"flood",0,-13,9),si(M,y),uc(M,.2),t.cloudTop===null&&t.terrain!=="ring"){const I=new j(new ua(7.9,8.6,7.2,40,1),y.concrete);I.position.y=-3.25,I.name="pad-foundation",M.add(I)}const T=[];M.traverse(I=>{/^clamp-[a-d]$/.test(I.name)&&T.push(I)});const g=new We;g.position.y=ma,i.add(g);const c=new We;c.name="booster",g.add(c),b(c,"engine",0),b(c,"stage1",3),b(c,"fins",23.2),b(c,"inter",27);const P=new We;P.name="upper",g.add(P),b(P,"stage2",30.6);const p=b(P,"fairing",42.9),B=[];p.traverse(I=>{const q=I;/^fairing-[ab]$/.test(q.name)&&B.push({node:q,x:q.position.x,z:q.position.z})}),si(g,y),lc(g,7,.3),g.updateMatrixWorld(!0);const D=new Ji().setFromObject(P).min.y-g.position.y,X=(I,q,_e)=>{const J={uTime:{value:0},uPower:{value:0},uCore:{value:new G("#fff6dd")},uEdge:{value:new G("#ff9a3a")}},L=new Qe({uniforms:J,vertexShader:pc,fragmentShader:mc,transparent:!0,blending:Ye,depthWrite:!1,side:rt}),we=new j(new qa(I,q,20,4,!0),L);we.rotation.x=Math.PI,we.position.y=-1;const lt=new j(new qa(I*.54,_e,18,3,!0),L);lt.rotation.x=Math.PI,lt.position.y=-1;const ot=new We;return ot.add(we,lt),ot.visible=!1,{node:ot,uniforms:J,material:L,outer:we,inner:lt}},$=X(2.5,26,15);c.add($.node);const H=X(1.9,20,12);H.node.position.y=D+1.6,P.add(H.node);const oe=new gi(16756848,0,110,0);oe.position.set(0,2,0),g.add(oe);const ue=dc(),me=[],se=[],ie=new go({map:ue,transparent:!0,opacity:.5,depthWrite:!1,color:new G("#d8d3cc")}),U=(I,q,_e,J,L,we,lt)=>{let ot=se.pop();ot||(ot=new vo(ie)),ot.visible=!0,ot.position.set(I,q,_e),ot.scale.setScalar(J),ot.material=ie,i.add(ot),me.push({sprite:ot,life:L,max:L,vx:(Math.random()-.5)*we,vy:lt*(.6+Math.random()*.8),vz:(Math.random()-.5)*we,spin:(Math.random()-.5)*.8,grow:J*(1.8+Math.random()*1.4)})};let fe=0,Pe=0,Ge=0,xe=0,Ke=0,Me=0,ge=0,Fe=0,Mt=0,mt=0,Vt=0;const Ot=()=>{oe.intensity=(xe*.75+Ke*.62)*120};return{group:i,rocket:g,light:oe,setBase(I,q,_e){fe=I,Pe=q,Ge=_e,i.position.set(I,_e,q)},baseX:()=>fe,baseZ:()=>Pe,setLift(I){Me=I,g.position.y=ma+I},setThrottle(I){xe=Math.max(0,Math.min(1,I)),$.node.visible=xe>.01,$.uniforms.uPower.value=xe,Ot()},setUpperThrottle(I){Ke=Math.max(0,Math.min(1,I)),H.node.visible=Ke>.01,H.uniforms.uPower.value=Ke,Ot()},setStage1Separation(I){Mt=Math.max(0,Math.min(1,I));const q=Mt;Vt=38*q*q,c.position.set(2.6*q*q,-Vt,-2.2*q*q),c.rotation.set(.16*q+.4*q*q,.5*q,.26*q+.62*q*q),oe.position.y=2+(D+2-2)*Math.min(1,q*1.4)},setFairingSeparation(I){mt=Math.max(0,Math.min(1,I));const q=mt;for(const _e of B){const J=_e.x>=0?1:-1;_e.node.position.x=_e.x+J*7.2*q,_e.node.position.z=_e.z+2.8*q*q,_e.node.position.y=-2.4*q*q,_e.node.rotation.z=-J*.55*q,_e.node.rotation.x=.22*q}},boosterDrop:()=>Vt,upperBaseY:()=>D,setPadVisible(I){M.visible=I},setFacing(I){i.rotation.y=I},setClamps(I){ge=Math.max(0,Math.min(1,I));for(const q of T){const _e=q.position.x,J=q.position.z,L=Math.atan2(_e,J),we=new W(Math.cos(L),0,-Math.sin(L));q.quaternion.setFromAxisAngle(we,ge*.62)}},update(I,q,_e){const J=1+Math.min(1.6,_e/180);for(const L of[$,H])L.uniforms.uTime.value=I,L.node.scale.set(1,J,1),L.node.rotation.y=I*2.4;if(xe>.05&&_e<90)for(Fe+=q*(6+xe*22);Fe>1;){Fe-=1;const L=Math.random()*Math.PI*2,we=2+Math.random()*3.4;U(fe+Math.cos(L)*we,Ge+ma+Me*.06+Math.random()*3,Pe+Math.sin(L)*we,2.6+Math.random()*3.2,1.5+Math.random()*1.6,9+xe*16,3+xe*8)}for(let L=me.length-1;L>=0;L-=1){const we=me[L];we.life-=q;const lt=1-we.life/we.max;we.sprite.position.x+=we.vx*q,we.sprite.position.y+=we.vy*q,we.sprite.position.z+=we.vz*q,we.vy+=q*.6,we.vx*=1-q*.6,we.vz*=1-q*.6,we.sprite.scale.setScalar(nr.lerp(we.sprite.scale.x,we.grow,Math.min(1,q*1.6))),we.sprite.material.opacity=Math.max(0,.5*(1-lt)*(1-lt)),we.sprite.material.rotation+=we.spin*q,we.life<=0&&(we.sprite.visible=!1,se.push(we.sprite),me.splice(L,1))}},dispose(){for(const I of me)i.remove(I.sprite),I.sprite.visible=!1;me.length=0,ue.dispose(),ie.dispose();for(const I of[$,H])I.material.dispose(),I.outer.geometry.dispose(),I.inner.geometry.dispose();for(const I of Object.values(y))I.dispose()}}}let ii=null;function _n(){if(typeof window>"u")return null;const n=window.AudioContext||window.webkitAudioContext;return n?(ii??=new n,ii):null}let Ka=null,ga=null;function vc(){const n=_n();n&&n.state==="suspended"&&n.resume().catch(()=>{})}function Ja(){const n=Ka;Ka=null,n?.stop();const t=ga;ga=null,t?.stop();for(const o of Vo)try{o.stop()}catch{}Vo.length=0;try{window.speechSynthesis?.cancel()}catch{}}function gc(n){if(!yo().soundOn)return;const t=_n();if(!t)return;t.state==="suspended"&&t.resume().catch(()=>{});const o=t.currentTime,a=t.createOscillator(),l=t.createGain();a.type="square",a.frequency.setValueAtTime(n?1320:880,o),l.gain.setValueAtTime(1e-4,o),l.gain.exponentialRampToValueAtTime(n?.09:.055,o+.01),l.gain.exponentialRampToValueAtTime(1e-4,o+(n?.34:.16)),a.connect(l),l.connect(t.destination),a.start(o),a.stop(o+.4)}function yc(n,t,o){if(!yo().soundOn)return null;const a=_n();if(!a)return null;a.state==="suspended"&&a.resume().catch(()=>{}),Ja();const l=a.currentTime,y=l+Math.max(0,n),i=y+Math.max(2,t),h=a.createGain();h.gain.setValueAtTime(1e-4,l),h.gain.exponentialRampToValueAtTime(.85,l+.2);const b=a.createDynamicsCompressor();b.threshold.value=-16,b.knee.value=14,b.ratio.value=3.6,b.attack.value=.006,b.release.value=.35,h.connect(b),b.connect(a.destination);const M=[],x=[],T=(U,fe,Pe)=>{U.start(fe),U.stop(fe+Pe),M.push(U)},g=Math.floor(a.sampleRate*2.5),c=a.createBuffer(1,g,a.sampleRate),P=c.getChannelData(0);let p=0,B=0,D=0,X=0,$=0,H=0,oe=0;for(let U=0;U<g;U+=1){const fe=Math.random()*2-1;p=.99886*p+fe*.0555179,B=.99332*B+fe*.0750759,D=.969*D+fe*.153852,X=.8665*X+fe*.3104856,$=.55*$+fe*.5329522,H=-.7616*H-fe*.016898,P[U]=(p+B+D+X+$+H+oe+fe*.5362)*.12,oe=fe*.115926}const ue=(U,fe,Pe,Ge,xe,Ke,Me=1,ge=.02)=>{const Fe=a.createBufferSource();Fe.buffer=c,Fe.loop=!0;const Mt=a.createBiquadFilter();Mt.type=Ge,Mt.Q.value=Me,Mt.frequency.setValueAtTime(xe,U),Ke!==xe&&Mt.frequency.exponentialRampToValueAtTime(Math.max(20,Ke),U+fe);const mt=a.createGain();mt.gain.setValueAtTime(1e-4,U),mt.gain.exponentialRampToValueAtTime(Math.max(2e-4,Pe),U+ge),mt.gain.setValueAtTime(Math.max(2e-4,Pe),Math.max(U+ge,U+fe*.55)),mt.gain.exponentialRampToValueAtTime(1e-4,U+fe),Fe.connect(Mt),Mt.connect(mt),mt.connect(h),x.push(Mt,mt),T(Fe,U,fe+.05)},me=(U,fe,Pe,Ge,xe,Ke="sine")=>{const Me=a.createOscillator();Me.type=Ke,Me.frequency.setValueAtTime(Pe,U),Me.frequency.exponentialRampToValueAtTime(Math.max(8,Ge),U+fe*.85);const ge=a.createGain();ge.gain.setValueAtTime(1e-4,U),ge.gain.exponentialRampToValueAtTime(Math.max(2e-4,xe),U+.05),ge.gain.exponentialRampToValueAtTime(1e-4,U+fe),Me.connect(ge),ge.connect(h),x.push(ge),T(Me,U,fe+.02)},se=.55+Math.min(.45,o*.12);me(y,1.5,96,26,se),ue(y,1.2,.55,"lowpass",2600,260,.8,.01);for(const[U,fe]of[[41,.5],[58,.32],[83,.18]]){const Pe=a.createOscillator();Pe.type="sawtooth",Pe.frequency.setValueAtTime(U*1.25,y),Pe.frequency.exponentialRampToValueAtTime(U,y+t*.4);const Ge=a.createGain();Ge.gain.value=.6;const xe=a.createOscillator();xe.frequency.value=6.5+Math.random()*3.5;const Ke=a.createGain();Ke.gain.value=.4,xe.connect(Ke),Ke.connect(Ge.gain);const Me=a.createBiquadFilter();Me.type="lowpass",Me.frequency.value=180;const ge=a.createGain();ge.gain.setValueAtTime(1e-4,y),ge.gain.exponentialRampToValueAtTime(fe,y+.8),ge.gain.setValueAtTime(fe,i-Math.max(1,t*.35)),ge.gain.exponentialRampToValueAtTime(1e-4,i),Pe.connect(Ge),Ge.connect(Me),Me.connect(ge),ge.connect(h),x.push(Ge,Me,ge),T(Pe,y,t+.1),T(xe,y,t+.1)}ue(y,t*.9,.34,"bandpass",1800,900,.9,.05),ue(y+1.2,t*.85,.22,"highpass",2600,5200,.7,.8),ue(y+2.4,t*.6,.2,"bandpass",700,2400,.6,1.2),h.gain.setValueAtTime(.85,Math.max(l+.2,i-1.6)),h.gain.exponentialRampToValueAtTime(1e-4,i+.4);const ie={stop:()=>{const U=a.currentTime;try{h.gain.cancelScheduledValues(U),h.gain.setValueAtTime(Math.max(1e-4,h.gain.value),U),h.gain.exponentialRampToValueAtTime(1e-4,U+.25)}catch{}for(const fe of M)try{fe.stop(U+.3)}catch{}window.setTimeout(()=>{for(const fe of x)fe.disconnect();h.disconnect(),b.disconnect()},400)}};return Ka=ie,ie}function Mc(n=0){if(!yo().soundOn)return;const t=_n();if(!t)return;t.state==="suspended"&&t.resume().catch(()=>{});const o=t.currentTime,a=t.createGain();a.gain.setValueAtTime(.9,o),a.connect(t.destination);const l=[],y=t.createOscillator();y.type="sine",y.frequency.setValueAtTime(130+n*6,o),y.frequency.exponentialRampToValueAtTime(38,o+.3);const i=t.createGain();i.gain.setValueAtTime(1e-4,o),i.gain.exponentialRampToValueAtTime(.5,o+.012),i.gain.exponentialRampToValueAtTime(1e-4,o+.34),y.connect(i),i.connect(a),y.start(o),y.stop(o+.4),l.push(y);const h=Math.floor(t.sampleRate*.9),b=t.createBuffer(1,h,t.sampleRate),M=b.getChannelData(0);for(let p=0;p<h;p+=1)M[p]=(Math.random()*2-1)*(1-p/h);const x=t.createBufferSource();x.buffer=b;const T=t.createBiquadFilter();T.type="bandpass",T.Q.value=1.1,T.frequency.setValueAtTime(3200,o+.02),T.frequency.exponentialRampToValueAtTime(700,o+.55);const g=t.createGain();g.gain.setValueAtTime(1e-4,o),g.gain.exponentialRampToValueAtTime(.42,o+.03),g.gain.exponentialRampToValueAtTime(1e-4,o+.7),x.connect(T),T.connect(g),g.connect(a),x.start(o),x.stop(o+.85),l.push(x);const c=t.createOscillator();c.type="square",c.frequency.setValueAtTime(1750,o+.03);const P=t.createGain();P.gain.setValueAtTime(1e-4,o+.03),P.gain.exponentialRampToValueAtTime(.07,o+.045),P.gain.exponentialRampToValueAtTime(1e-4,o+.13),c.connect(P),P.connect(a),c.start(o+.03),c.stop(o+.15),l.push(c),window.setTimeout(()=>{for(const p of l)p.disconnect();a.disconnect()},1200)}function wc(){if(!yo().soundOn)return;const n=_n();if(!n)return;n.state==="suspended"&&n.resume().catch(()=>{});const t=n.currentTime,o=n.createGain();o.gain.setValueAtTime(.8,t),o.connect(n.destination);const a=[];for(const[x,T]of[[0,620],[.07,480]]){const g=n.createOscillator();g.type="triangle",g.frequency.setValueAtTime(T,t+x),g.frequency.exponentialRampToValueAtTime(T*.45,t+x+.22);const c=n.createGain();c.gain.setValueAtTime(1e-4,t+x),c.gain.exponentialRampToValueAtTime(.16,t+x+.01),c.gain.exponentialRampToValueAtTime(1e-4,t+x+.26),g.connect(c),c.connect(o),g.start(t+x),g.stop(t+x+.3),a.push(g)}const l=Math.floor(n.sampleRate*1.4),y=n.createBuffer(1,l,n.sampleRate),i=y.getChannelData(0);for(let x=0;x<l;x+=1)i[x]=Math.random()*2-1;const h=n.createBufferSource();h.buffer=y;const b=n.createBiquadFilter();b.type="highpass",b.frequency.setValueAtTime(1200,t),b.frequency.exponentialRampToValueAtTime(3e3,t+1.2);const M=n.createGain();M.gain.setValueAtTime(1e-4,t+.1),M.gain.exponentialRampToValueAtTime(.12,t+.4),M.gain.exponentialRampToValueAtTime(1e-4,t+1.4),h.connect(b),b.connect(M),M.connect(o),h.start(t),h.stop(t+1.45),a.push(h),window.setTimeout(()=>{for(const x of a)x.disconnect();o.disconnect()},1800)}function xc(n){if(!yo().soundOn)return null;const t=_n();if(!t)return null;t.state==="suspended"&&t.resume().catch(()=>{});const o=t.currentTime,a=t.createGain();a.gain.setValueAtTime(1e-4,o),a.gain.exponentialRampToValueAtTime(.75,o+.16),a.gain.setValueAtTime(.75,o+Math.max(.4,n*.5)),a.gain.exponentialRampToValueAtTime(1e-4,o+n),a.connect(t.destination);const l=[];for(const[g,c]of[[92,.3],[138,.2],[205,.12]]){const P=t.createOscillator();P.type="sawtooth",P.frequency.setValueAtTime(g*1.2,o),P.frequency.exponentialRampToValueAtTime(g,o+n*.5);const p=t.createBiquadFilter();p.type="lowpass",p.frequency.value=420;const B=t.createGain();B.gain.setValueAtTime(1e-4,o),B.gain.exponentialRampToValueAtTime(c,o+.3),B.gain.exponentialRampToValueAtTime(1e-4,o+n),P.connect(p),p.connect(B),B.connect(a),P.start(o),P.stop(o+n+.05),l.push(P)}const y=Math.floor(t.sampleRate*1.5),i=t.createBuffer(1,y,t.sampleRate),h=i.getChannelData(0);for(let g=0;g<y;g+=1)h[g]=Math.random()*2-1;const b=t.createBufferSource();b.buffer=i,b.loop=!0;const M=t.createBiquadFilter();M.type="bandpass",M.Q.value=.7,M.frequency.setValueAtTime(2400,o),M.frequency.exponentialRampToValueAtTime(900,o+n);const x=t.createGain();x.gain.setValueAtTime(1e-4,o),x.gain.exponentialRampToValueAtTime(.26,o+.2),x.gain.exponentialRampToValueAtTime(1e-4,o+n),b.connect(M),M.connect(x),x.connect(a),b.start(o),b.stop(o+n+.05),l.push(b);const T={stop:()=>{const g=t.currentTime;try{a.gain.cancelScheduledValues(g),a.gain.setValueAtTime(Math.max(1e-4,a.gain.value),g),a.gain.exponentialRampToValueAtTime(1e-4,g+.25)}catch{}for(const c of l)try{c.stop(g+.3)}catch{}window.setTimeout(()=>a.disconnect(),400)}};return ga?.stop(),ga=T,T}const ri={three:"audio/count-three.mp3",two:"audio/count-two.mp3",one:"audio/count-one.mp3",liftoff:"audio/count-liftoff.mp3"};let Qa=null,bc=null;const Vo=[];function Sc(){const n=_n();n&&(bc??=(async()=>{const t=await Promise.all(Object.keys(ri).map(async o=>{const a=await fetch(ri[o]);if(!a.ok)throw new Error(`countdown voice ${o}`);return[o,await n.decodeAudioData(await a.arrayBuffer())]}));Qa=new Map(t)})().catch(()=>{Qa=null}))}function Tc(n){const t=typeof window>"u"?null:window.speechSynthesis;if(t)try{const o=n==="liftoff"?"Liftoff!":`${n[0].toUpperCase()}${n.slice(1)}`,a=new SpeechSynthesisUtterance(o);a.lang="en-US",a.volume=.9,a.rate=1.02,t.speak(a)}catch{}}function kc(n){if(!yo().soundOn)return;const t=_n();if(!t)return;t.state==="suspended"&&t.resume().catch(()=>{});const o=Qa?.get(n);if(!o){Tc(n);return}const a=t.createBufferSource();a.buffer=o;const l=t.createGain();l.gain.value=.55,a.connect(l),l.connect(t.destination),a.start(t.currentTime+.05),Vo.push(a),a.onended=()=>{const y=Vo.indexOf(a);y>=0&&Vo.splice(y,1),a.disconnect(),l.disconnect()}}const ci={sun:{air:500,esc:617.7},trappist1:{air:400,esc:529},proxima:{air:400,esc:550},mercury:{air:null,esc:4.25},venus:{air:150,esc:10.36},earth:{air:100,esc:11.19},mars:{air:80,esc:5.03},jupiter:{air:500,esc:59.5},saturn:{air:500,esc:35.5},"saturn-ring":{air:500,esc:35.5},uranus:{air:350,esc:21.3},neptune:{air:400,esc:23.5},titan:{air:200,esc:2.64},pluto:{air:null,esc:1.21},eris:{air:null,esc:1.38},haumea:{air:null,esc:.84},makemake:{air:null,esc:.77},moon:{air:null,esc:2.38},io:{air:null,esc:2.56},europa:{air:null,esc:2.03},ganymede:{air:null,esc:2.74},callisto:{air:null,esc:2.44},enceladus:{air:null,esc:.24},charon:{air:null,esc:.59}},Ac=(n,t,o)=>Math.min(o,Math.max(t,n));function Pc(n){const{stage1Km:t,leaveKm:o}=n,a=o-t;return[[0,0],[18,20],[36,90],[52,600],[70,t*.22*1e3],[96,t*1e3],[150,(t+a*.42)*1e3],[240,(t+a*.72)*1e3],[322,o*1e3],[430,o*1.06*1e3],[700,o*1.6*1e3]]}function bi(n,t,o){const a=Math.max(0,t),l=n[0];if(a<=l[0])return l[1];for(let h=1;h<n.length;h+=1){const[b,M]=n[h],[x,T]=n[h-1];if(a>b)continue;const g=(a-x)/(b-x);if(!o)return T+(M-T)*g;const c=Math.log(Math.max(1,T)),P=Math.log(Math.max(1,M));return Math.exp(c+(P-c)*g)}const[y,i]=n[n.length-1];return i+(a-y)*(i-n[n.length-2][1])/(y-n[n.length-2][0])}function Cc(n,t){return bi(Pc(t),n,!0)}function zc(n,t){const o=t.leaveSpeed,a=[[0,0],[14,18],[28,70],[40,150],[70,o*.16],[96,o*.3],[108,o*.29],[150,o*.42],[240,o*.66],[322,o*.88],[430,o],[700,o*1.15]];return bi(a,n,!1)}function li(n){const t=n&&ci[n]||ci.earth,o=t.air??Ac(Math.round(60+t.esc*40),80,260);return{airTopKm:t.air,escapeKms:t.esc,stage1Km:Math.round(t.air?t.air*.65:o*.45),leaveKm:o,leaveSpeed:Math.round(t.esc*1e3*(t.air?.72:.98))}}const ui="textures/",Wt=Math.PI/180;function la(n,t,o=1){return new W(Math.cos(n*Wt)*Math.cos(t*Wt),Math.sin(n*Wt),-Math.cos(n*Wt)*Math.sin(t*Wt)).multiplyScalar(o)}const Ze=2.2,Rc=Date.UTC(2e3,0,1,12),fi={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},pi={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function Fc(){if(typeof window>"u")return!0;const n=navigator,t=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,o=n.hardwareConcurrency??8,a=n.deviceMemory??8;return!!(t||o<=4||a<=4)}function Ec(){const t=document.createElement("canvas");t.width=128,t.height=128;const o=t.getContext("2d");if(o){const a=o.createRadialGradient(64,64,0,64,64,64);a.addColorStop(0,"rgba(255,238,205,0.85)"),a.addColorStop(.3,"rgba(255,214,150,0.55)"),a.addColorStop(.45,"rgba(255,190,120,0.22)"),a.addColorStop(.7,"rgba(250,170,95,0.07)"),a.addColorStop(1,"rgba(255,160,80,0)"),o.fillStyle=a,o.fillRect(0,0,128,128)}return new Qn(t)}const Nc=`
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
}`,Dc=`
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
}`;function Ic(n){return Math.max(.12,.16+.11*Math.log2(n/2e3))}const _c=`
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
}`,Vc=`
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
}`,Wc=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Uc=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,mi=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,di=`
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
}`,Gc=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Lc=`
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
}`,Oc=`
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
}`,Bc=`
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
}`,jc=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Xc=`
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
}`,Yc=`
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
}`,Hc=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function tl(n,t){const o=Fc(),a=o?96:128,l=new or({antialias:!0,powerPreference:"default",alpha:!1});l.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),l.outputColorSpace=An,l.toneMapping=ar,l.toneMappingExposure=1.1;const y=Math.min(4,l.capabilities.getMaxAnisotropy()),i=l.domElement;i.style.display="block",i.style.width="100%",i.style.height="100%",i.style.touchAction="none",n.appendChild(i);const h=document.createElement("div");h.className="space-labels",n.appendChild(h);const b=[];let M=0;function x(){const e=performance.now();if(e-M<400)return;M=e,b.length=0;const s=n.getBoundingClientRect();for(const r of[".explore-top",".sheet",".sky-alert"]){const d=document.querySelector(r);if(!d)continue;const S=d.getBoundingClientRect();S.width<2||S.height<2||b.push({x:S.left-s.left,y:S.top-s.top,w:S.width,h:S.height})}}function T(e,s,r,d=22){for(const S of b)if(e<S.x+S.w&&e+r>S.x&&s<S.y+S.h&&s+d>S.y)return!0;return!1}const g=new sr;g.background=new G("#05070d");const c=new ir(45,1,.01,2e3),P=[],p=e=>(P.push(e),e),B=new yi,D=new rr,X=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),$=new Map,H=new Map,oe=[],ue=new Set;let me=!1,se=0;const ie=(e,s)=>{const r=H.get(e);if(r){H.delete(e);for(const d of r)d(s)}},U=(e,s=!0)=>{const r=$.get(e);if(r)return r;se+=1;const d=B.load(ui+e,()=>{ie(e,d),se-=1,se===0&&t.onReady?.()},void 0,()=>{ie(e,d),se-=1,se===0&&t.onReady?.()});return d.colorSpace=s?An:es,d.anisotropy=o?4:8,$.set(e,d),p(d)},fe=e=>{$.has(e)||ue.has(e)||(ue.add(e),D.load(ui+e,s=>{ue.delete(e);const r=new vr;r.image=s,r.colorSpace=An,r.anisotropy=o?4:8,r.needsUpdate=!0,p(r),$.set(e,r),ie(e,r)},void 0,()=>{ue.delete(e)}))},Pe=()=>{if(!me){me=!0;for(const e of oe)fe(e)}},Ge=(e,s)=>{if(X.has(e)){s(U(e));return}const r=$.get(e);if(r){s(r);return}const d=H.get(e)??[];d.push(s),H.set(e,d),oe.includes(e)||(oe.push(e),me&&fe(e))},xe=new j(p(new Ie(900,48,24)),p(new ye({map:U("milkyway.webp"),side:mo,depthWrite:!1})));xe.rotation.set(63*Wt,0,0),g.add(xe),g.add(new cr(16777215,.14));const Ke=new gi(16777215,1.6,0,0);Ke.decay=0,g.add(Ke);const Me=new We;g.add(Me);const ge=new Map,Fe=new Map,Mt=new Map,mt=[],Vt=new Map;let Ot=null,Bt=null;const I=new Map,q=new Map,_e=new Map,J=new Map;let L=null,we=0,lt=null;const ot=[],ee=[],Y=[],V=[],te=[];let be=Date.now(),K=!0,O=null;function le(e,s,r,d){const S=fi[r]??[.7,.7,.7,.06],z=pi[r],F=new G(s),N=z?.relief??0,f=p(new Qe({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new Io(z?.texel?.[0]??1/1024,z?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:N*.35},gain:{value:(z?.gain??1.9)*.6},base:{value:new W(F.r,F.g,F.b)},glow:{value:new W(S[0],S[1],S[2])},atmo:{value:Math.min(S[3]*2.2,.85)},ringShadow:{value:d?1:0},ringMap:{value:null},ringInner:{value:d?.inner??1},ringOuter:{value:d?.outer??2},ringCenter:{value:new W},ringNormal:{value:new W(0,1,0)}},vertexShader:Nc,fragmentShader:Dc}));return e&&Ge(e,k=>{f.uniforms.dayMap.value=k,f.uniforms.useMap.value=1,N>0&&(f.uniforms.bumpMap.value=k,f.uniforms.useBump.value=1)}),d&&Ge("saturn-ring.webp",k=>{f.uniforms.ringMap.value=k}),f}function xt(e,s,r){const d=pi[r],S=d?.tint??fi[r]?.slice(0,3);if(!S||o)return;const z=Math.min(d?.inner??.12,.5)*.55,F=Math.min(d?.outer??.05,.2)*.9,N=new W(S[0],S[1],S[2]),f=Math.sqrt(1-1/(1.045*1.045)),k=(E,_,de,pe)=>new j(p(new Ie(s*E,o?24:32,o?16:24)),p(new Qe({uniforms:{tint:{value:N},power:{value:de},strength:{value:pe},edge:{value:f}},vertexShader:mi,fragmentShader:di,side:_,transparent:!0,blending:Ye,depthWrite:!1})));e.add(k(1.045,mo,2.7,z),k(1.16,Ls,3.4,F))}function dt(e,s){const r=p(new Qe({uniforms:{poleN:{value:la(80.7,-72.7,1).normalize()},poleS:{value:la(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:Gc,fragmentShader:Lc,transparent:!0,blending:Ye,depthWrite:!1})),d=new j(p(new Ie(s*1.022,o?64:96,o?48:64)),r);d.renderOrder=1,e.add(d),V.push(r)}function vn(e,s){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([d,S,z,F,N],f)=>{const k=la(d,S,1).normalize(),E=new W(0,1,0).cross(k).normalize(),_=new W().crossVectors(k,E).normalize(),de=E.multiplyScalar(Math.cos(N)).addScaledVector(_,Math.sin(N)).normalize(),pe=[];for(let ze=0;ze<=16;ze+=1){const Xe=ze/16,qe=(Xe-.5)*z,De=Math.sin(Xe*Math.PI)*F;pe.push(new W().copy(k).multiplyScalar(Math.cos(qe)).addScaledVector(de,Math.sin(qe)).normalize().multiplyScalar(s*(.985+De)))}const Ce=p(new Qe({uniforms:{uTime:{value:0},seed:{value:f*.37+.11}},vertexShader:Oc,fragmentShader:Bc,transparent:!0,blending:Ye,side:rt,depthWrite:!1})),Be=new j(p(new dr(new hr(pe),64,s*.022,8,!1)),Ce);Be.raycast=()=>{},e.add(Be),te.push(Ce)})}function Vn(e,s,r=""){const d=document.createElement("button");d.type="button",d.className="space-label"+r,d.textContent=s,d.addEventListener("click",()=>t.onPick?.(e)),h.appendChild(d),Mt.set(e,d)}const Wo=p(new Qe({uniforms:{map:{value:U("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),Cn=new W,Wn=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],Uo=new Map;let jt=null;const Ma={moon:"earth",...Object.fromEntries(Bs.map(e=>[e.id,e.parent]))};function Go(e,s){const r=Ma[e];if(jt===null||!r)return ta(e,s);const d=ta(r,s),S=ta(e,jt),z=ta(r,jt);return{x:d.x+S.x-z.x,y:d.y+S.y-z.y,z:d.z+S.z-z.z}}function zn(e){for(const[s,r]of Fe){if(s==="sun")continue;const d=Go(s,e);r.position.set(d.x*Ze,d.y*Ze,d.z*Ze)}for(const[s,r]of I){const d=Go(s,e);r.position.set(d.x*Ze,d.y*Ze,d.z*Ze)}if(lt){Cn.copy(lt.holder.position);const s=Cn.length()||1;lt.tail.visible=s/Ze<8,Cn.multiplyScalar(1/s),lt.tail.quaternion.setFromUnitVectors(new W(0,1,0),Cn),lt.tail.position.copy(Cn).multiplyScalar(.16*Ze)}}const Xt=new W(1,0,0),wa=p(new Qe({uniforms:{dayMap:{value:U("earth-day.webp")},nightMap:{value:U("earth-night.webp")},normalMap:{value:U("earth-normal.webp",!1)},specMap:{value:U("earth-spec.webp",!1)},texel:{value:new Io(1/2048,1/1024)},sunDir:{value:Xt}},vertexShader:_c,fragmentShader:Vc}));function xa(e){const s=new We,r=new j(p(new Ie(e,o?96:128,64)),wa);r.name="earth",s.add(r);const d=new j(p(new Ie(e*1.012,80,48)),p(new $a({map:U("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));s.add(d),Ot=d;const S=new j(p(new Ie(e*1.06,64,48)),p(new Qe({uniforms:{sunDir:{value:Xt}},vertexShader:`
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
            }`,side:mo,transparent:!0,blending:Ye,depthWrite:!1})));s.add(S);const z=new j(p(new Ie(e*1.15,o?24:32,o?16:24)),p(new Qe({uniforms:{tint:{value:new W(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:mi,fragmentShader:di,side:Ls,transparent:!0,blending:Ye,depthWrite:!1})));return s.add(z),ge.set("earth",r),s}function Lo(e,s,r){for(const d of Ro(e).sites??[]){const S=new j(p(new Ie(r*.018,12,8)),p(new ye({color:"#3182f6"})));S.position.copy(la(d.lat,d.lon,r*1.004)),s.add(S);const z=document.createElement("div");z.className="space-site",z.textContent=d.name,h.appendChild(z),mt.push({mesh:S,site:d,el:z,parent:e})}}let Rn=null;for(const e of Mr){if(e.id==="moon")continue;const s=new We;if(Fe.set(e.id,s),Me.add(s),e.id==="sun"){const r=.26*Ze,d=new j(p(new Ie(r,o?96:128,o?64:80)),Wo);d.name="sun",Vt.set("sun",r),s.add(d),vn(d,r);for(const[z,F,N,f]of[[1.06,2,.95,"#ffbf78"]])s.add(new j(p(new Ie(r*z,o?32:48,o?24:32)),p(new Qe({uniforms:{color:{value:new G(f)},power:{value:F},strength:{value:N}},vertexShader:Wc,fragmentShader:Uc,transparent:!0,blending:Ye,depthWrite:!1}))));ge.set("sun",d);const S=new vo(p(new go({map:p(Ec()),blending:Ye,transparent:!0,depthWrite:!1,depthTest:!0,color:new G("#ffd9a0")})));S.scale.setScalar(r*3.6),s.add(S),Bt=S}else{const r=Ua(e.id).radius*Ze;Vt.set(e.id,r);let d;if(e.id==="earth"){const N=xa(r);N.rotation.z=-e.tilt*Wt,s.add(N),Rn=N,d=N.children[0]}else{const N=e.id==="saturn"?{inner:r*1.18,outer:r*2.08}:void 0;d=new j(p(new Ie(r,o?96:128,64)),le(e.texture,e.color,e.id,N)),d.name=e.id,d.rotation.z=-e.tilt*Wt,s.add(d),ge.set(e.id,d),xt(s,r,e.id),e.id==="jupiter"&&dt(d,r)}if(e.axes){const[N,f,k]=e.axes;d.scale.set(1,k/N,f/N)}if(e.ring&&e.axes){const N=e.axes[0]/2,f=r*(e.ring.radius-e.ring.width/2)/N,k=r*(e.ring.radius+e.ring.width/2)/N,E=new j(p(new Rt(f,Math.max(k,f*1.03),128,1)),p(new ye({color:"#8b8580",side:rt,transparent:!0,opacity:.75,depthWrite:!1})));E.rotation.x=Math.PI/2,s.add(E)}if(e.id==="saturn"){const N=r*1.18,f=r*2.08,k=new Rt(N,f,160,1),E=p(new Qe({uniforms:{ringMap:{value:null},innerRatio:{value:N/f},planetRadius:{value:r},planetCenter:{value:new W}},vertexShader:jc,fragmentShader:Xc,side:rt,transparent:!0,depthWrite:!1}));Ge("saturn-ring.webp",de=>{E.uniforms.ringMap.value=de});const _=new j(p(k),E);_.rotation.x=Math.PI/2,d.add(_),ee.push({mesh:_,parent:e.id}),Y.push({mesh:d,material:d.material})}e.sites&&Lo(e.id,d,r);const S=js(e.id,.022),z=p(new sn);z.setAttribute("position",new Wa(S.positions,3)),z.setIndex(S.index),z.scale(Ze,Ze,Ze);const F=new j(z,p(new ye({color:Ua(e.id).ribbon,transparent:!0,opacity:.5,side:rt,depthWrite:!1})));ot.push(F),Me.add(F)}Vn(e.id,e.name,e.id==="sun"?"":" is-planet")}const Oo=[];function Bo(e,s,r){let d=e==="main"?1234:98765;const S=()=>(d=d*16807%2147483647,(d-1)/2147483646),z=p(new Sn(1,0)),F=new Float32Array(s*4),N=new Float32Array(s*4);for(let E=0;E<s;E+=1){let _;if(e==="main")do _=2.1+S()*1.2;while((Math.abs(_-2.5)<.03||Math.abs(_-2.82)<.03||Math.abs(_-2.95)<.02)&&S()<.85);else _=S()<.18?39.2+(S()-.5)*1.2:42+(S()-.5)*6.5;F[E*4]=_,F[E*4+1]=S()*Math.PI*2,F[E*4+2]=S()*(e==="main"?.18:.12),F[E*4+3]=S()*Math.PI*2,N[E*4]=(S()-.5)*(e==="main"?.32:.5),N[E*4+1]=S()*Math.PI*2;const de=S()**3;N[E*4+2]=(e==="main"?.0035:.009)*(.7+de*2.4),N[E*4+3]=S()}z.setAttribute("orbit",new Os(F,4)),z.setAttribute("shape",new Os(N,4));const f=p(new Qe({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new G(r)},uScale:{value:Ze}},vertexShader:Yc,fragmentShader:Hc})),k=new va(z,f,s);k.frustumCulled=!1,k.raycast=()=>{},Me.add(k),Oo.push({mesh:k,material:f})}Bo("main",o?1800:4200,"#9c9184"),Bo("kuiper",o?1500:3600,"#7f8b9c");for(const e of Bs){const s=new We,r=new j(p(new Ie(e.radius*Ze,32,24)),le(`${e.id}.webp`,e.color,e.id));r.name=e.id,s.add(r),Me.add(s),I.set(e.id,s),q.set(e.id,r);const d=document.createElement("button");d.type="button",d.className="space-label is-small",d.textContent=e.name,d.addEventListener("click",()=>t.onExtra?.(e.id)),h.appendChild(d),_e.set(e.id,{el:d,parent:e.parent})}{const e=new We,s=new j(p(new Ie(.045*Ze,20,16)),p(new ye({color:"#f7fbff"})));s.name="halley",e.add(s);const r=new j(p(new qa(.04*Ze,.32*Ze,12)),p(new ye({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(r),lt={holder:e,tail:r},Me.add(e),I.set("halley",e),q.set("halley",s);const d=js("halley",.022),S=p(new sn);S.setAttribute("position",new Wa(d.positions,3)),S.setIndex(d.index),S.scale(Ze,Ze,Ze);const z=new j(S,p(new ye({color:Ua("halley").ribbon,transparent:!0,opacity:.35,side:rt,depthWrite:!1})));ot.push(z),Me.add(z);const F=document.createElement("button");F.type="button",F.className="space-label is-small",F.textContent=Z("핼리 혜성"),F.addEventListener("click",()=>t.onExtra?.("halley")),h.appendChild(F),_e.set("halley",{el:F,parent:null})}for(const e of wr){const s=xr(e),r=s.points.map(de=>new W(de.x*Ze,de.y*Ze,de.z*Ze)),d=p(new sn().setFromPoints(r)),S=new lr(d,p(new Do({color:e.color,transparent:!0,opacity:.95})));S.visible=!1;const z=new We,F=new j(p(new ua(.03,.01,.01,20)),p(new ye({color:"#d8dde4"})));F.rotation.x=Math.PI/2;const N=new j(p(new Ie(.014,12,8)),p(new ye({color:"#c9ced6"})));N.position.z=-.02;const f=new j(p(new ua(.002,.002,.09,6)),p(new ye({color:"#aab3c0"})));f.rotation.z=Math.PI/2,f.position.z=-.02;const k=new j(p(new Ie(.035,16,12)),p(new ye({color:e.color,transparent:!0,opacity:.18,blending:Ye,depthWrite:!1})));z.add(F,N,f,k),z.scale.setScalar(e.frame==="earth"?.8:1.3),z.position.copy(r[r.length-1]),S.add(z),(e.frame==="earth"?Fe.get("earth")??Me:Me).add(S);const _=document.createElement("div");_.className="space-site is-probe",_.textContent=e.name,h.appendChild(_),J.set(e.id,{line:S,probe:z,el:_,points:r,times:s.points.map(de=>de.t),marks:s.marks,frame:e.frame})}if(zn(be),Rn){const e=.055*Ze;Vt.set("moon",e);const s=new j(p(new Ie(e,a,48)),le("moon.webp","#b8b8b8","moon"));s.name="moon";const r=new We;r.add(s),Me.add(r),ge.set("moon",s),Fe.set("moon",r),Lo("moon",s,e),Vn("moon",Z("달")," is-small"),zn(be)}const u=new We,m=new We,R=new We;u.add(m,R),u.visible=!1;let w="solar",v=!1,Q=0;const C={moon:new j,moonMat:p(new ye({color:"#ffffff"})),shadow:p(new ye({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new j,umbra:new j,skyCover:new j,skySun:new We,skyMoon:new We,skyMoonMat:p(new ye({color:"#ffffff"}))},re=[],ae=U("sun.webp"),tt=U("moon.webp"),Pt=new j(p(new Ie(.62,32,24)),p(new ye({map:ae})));Pt.position.set(-3.3,0,0);const Ft=new j(p(new Ie(.4,32,24)),p(new ye({map:U("earth-day.webp")})));Ft.position.set(1.85,0,0),C.moonMat.map=tt,C.moon=new j(p(new Ie(.14,24,18)),C.moonMat),C.cone=new j(p(new ua(.04,.16,.78,18)),C.shadow),C.cone.position.set(1.42,0,0),C.cone.rotation.z=Math.PI/2,C.umbra=new j(p(new zo(.3,28)),p(new ye({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),C.umbra.position.set(2.75,0,.02),m.add(Pt,Ft,C.moon,C.cone,C.umbra);for(const[e,s]of[[Z("태양"),new W(-3.3,.85,0)],[Z("지구"),new W(1.85,.68,0)]]){const r=document.createElement("div");r.className="space-site",r.textContent=e,h.appendChild(r),re.push({el:r,at:s,group:m})}const Et=new j(p(new zo(1.35,48)),p(new ye({map:ae}))),Un=new j(p(new Rt(1.4,1.7,48)),p(new ye({color:"#f0c36a",transparent:!0,opacity:.45,side:rt,depthWrite:!1})));C.skyCover=new j(p(new zo(1.22,48)),p(new ye({color:"#141820"}))),C.skySun.add(Et,Un,C.skyCover),C.skyMoonMat.map=tt;const gn=new j(p(new zo(.92,48)),C.skyMoonMat),ln=new j(p(new zo(1.08,48)),p(new ye({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));ln.position.z=.16,C.skyMoon.add(gn,ln),R.add(C.skySun,C.skyMoon);const bt=document.createElement("div");bt.className="space-site is-stage",h.appendChild(bt),re.push({el:bt,at:new W(0,-1.2,0),group:m}),R.visible=!1,g.add(u);const Ct=new We;Ct.visible=!1,Ct.rotation.z=-Math.PI/2;const St=[],wo=4.6,un=e=>wo*e/696e3,yn=new j(p(new Ie(wo,64,40)),p(new ye({map:U("sun.webp")})));yn.position.set(-3.2,0,0),Ct.add(yn);const Mn=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let ce=2.4;const Ae=(e,s)=>{const r=document.createElement("div");r.className="space-site",r.textContent=e,h.appendChild(r),St.push({el:r,at:s,group:Ct})};Ae(Z("태양"),new W(-3.2,4.9,0));for(const[e,s]of Mn){const r=un(s),d=ce+r;ce=d+r+.72;const S=Ro(e),z=e==="earth"?"earth-day.webp":S.texture,F=p(new ye({color:S.color}));z&&Ge(z,f=>{F.map=f,F.color.set("#ffffff"),F.needsUpdate=!0});const N=new j(p(new Ie(r,32,24)),F);if(N.position.set(d,0,0),S.axes&&N.scale.set(1,S.axes[2]/S.axes[0],S.axes[1]/S.axes[0]),Ct.add(N),e==="saturn"){const f=r*1.18,k=r*2.08,E=p(new Rt(f,k,96,1)),_=E.attributes.position,de=E.attributes.uv,pe=new W;for(let ze=0;ze<_.count;ze+=1)pe.fromBufferAttribute(_,ze),de.setXY(ze,(pe.length()-f)/(k-f),.5);const Ce=p(new ye({color:"#b9b3ab",transparent:!0,opacity:.9,side:rt,depthWrite:!1}));Ge("saturn-ring.webp",ze=>{Ce.map=ze,Ce.color.set("#ffffff"),Ce.needsUpdate=!0});const Be=new j(E,Ce);Be.rotation.y=Math.PI/2-.36,N.add(Be)}Ae(S.name,new W(d,(e==="saturn"?r*2.08:r)+.12,0))}g.add(Ct);const Se=new We;Se.visible=!1;const Le=[],$e=[],Ee=new j(p(new Ie(.55,48,32)),p(new ye({color:"#e0703a"})));Se.add(Ee);for(const[e,s]of[[1.35,.16],[2.1,.05]])Se.add(new j(p(new Ie(.55*e,32,24)),p(new ye({color:"#ff6a30",transparent:!0,opacity:s,side:mo,blending:Ye,depthWrite:!1}))));const ct=new j(p(new Rt(2.6,5.1,96,1)),p(new ye({color:"#3fbf7f",transparent:!0,opacity:.12,side:rt,depthWrite:!1})));ct.rotation.x=Math.PI/2,Se.add(ct),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,s,r,d,S],z)=>{const F=new Gs(p(new sn().setFromPoints(Array.from({length:128},(k,E)=>new W(Math.cos(E/128*Math.PI*2)*r*100,0,Math.sin(E/128*Math.PI*2)*r*100)))),p(new Do({color:"#8b95a1",transparent:!0,opacity:.35})));Se.add(F);const N=new j(p(new Ie(.16*d,24,16)),le(void 0,S,"earth"));Se.add(N);const f=document.createElement("button");f.type="button",f.className="space-label is-small",f.textContent=e,f.addEventListener("click",()=>t.onExtra?.(`trappist-${e}`)),h.appendChild(f),Le.push({mesh:N,a:r*100,period:s,phase0:z*1.7,el:f})});const at=new Gs(p(new sn().setFromPoints(Array.from({length:256},(e,s)=>new W(Math.cos(s/256*Math.PI*2)*38.7,0,Math.sin(s/256*Math.PI*2)*38.7)))),p(new Do({color:"#c5b8a2",transparent:!0,opacity:.5})));Se.add(at);for(const[e,s]of[["TRAPPIST-1",new W(0,1.1,0)],[Z("생명가능지대(대략)"),new W(3.9,0,0)],[Z("비교: 우리 수성의 궤도"),new W(0,0,38.7)]]){const r=document.createElement("div");r.className="space-site",r.textContent=e,h.appendChild(r),$e.push({el:r,at:s})}g.add(Se);const st=Ar(p),ht=st.labels.map(({name:e,at:s})=>{const r=document.createElement("div");return r.className="space-site",r.textContent=e,h.appendChild(r),{el:r,at:s}});g.add(st.group);const it=Cr(),Kt=[];if(it)for(const[e,s]of Object.entries(it.groups)){g.add(s);for(const r of it.markers[e]){const d=document.createElement("button");d.type="button",d.className="space-label",d.textContent=r.name,d.addEventListener("click",()=>{t.onMarker?.(r),Oe.target.copy(r.position),Oe.radius=eo[e]*(r.id==="cmb"?1.4:e==="group"?.6:.42)}),h.appendChild(d),Kt.push({level:e,marker:r,el:d})}}const Yt=[];if(it){const s=(z,F)=>new W(Math.cos(F*Wt)*Math.cos(z*Wt),Math.sin(F*Wt),-Math.cos(F*Wt)*Math.sin(z*Wt)).multiplyScalar(140),r=[];for(const z of Object.values(Xs))for(const F of z)for(let N=0;N<F.length-1;N+=1){const f=s(F[N][0],F[N][1]),k=s(F[N+1][0],F[N+1][1]);r.push(f.x,f.y,f.z,k.x,k.y,k.z)}const d=p(new sn);d.setAttribute("position",new Wa(r,3));const S=new hi(d,p(new Do({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));it.groups.stars.add(S);for(const z of br){if(!Xs[z.id])continue;const F=document.createElement("button");F.type="button",F.className="space-label is-const",F.textContent=z.name.replace(/\(.*\)/,"").split(" · ")[0],F.addEventListener("click",()=>t.onConstellation?.(z.id)),h.appendChild(F),Yt.push({el:F,at:s(z.center[0],z.center[1])})}}const Ht=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let ke="system",Jt=!1,ts=!1;const eo={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},to=new W,Ue={theta:.6,phi:.95,radius:34},Oe={target:new W,radius:Ue.radius};let vt="system",Nt=null,Ut=null,Qt=null;function jo(e){if((e==="system"||e==="sizes")&&Pe(),ke=e,Jt=!1,Me.visible=e==="system",u.visible=e==="eclipse",Ct.visible=e==="sizes",Se.visible=e==="exo",st.group.visible=e==="blackhole",it)for(const[s,r]of Object.entries(it.groups))r.visible=s===e;vt="system",Nt=null,Ut=null,Qt=null,Oe.target.set(0,0,0),Oe.radius=eo[e],e!=="system"&&(Ue.phi=1.1),e==="eclipse"&&(m.rotation.z=c.aspect<1?-Math.PI/2:0,Ue.theta=0,Ue.phi=v?Math.PI/2:1.25,Oe.target.set(0,0,0),v||Oe.target.set(-.7,0,0).applyEuler(m.rotation),Oe.radius=v?6:c.aspect<1?10:7.5),e==="exo"&&(Ue.phi=.75),e==="blackhole"&&(Ue.phi=1.42),e==="sizes"&&(Ue.theta=0,Ue.phi=Math.PI/2,Oe.target.set(.6,-6.8,0),Oe.radius=19)}function ba(e){if(e!=="earth"&&Pe(),Jt=!1,ke!=="system"&&(ke="system",Me.visible=!0,u.visible=!1,Ct.visible=!1,Se.visible=!1,st.group.visible=!1,it))for(const r of Object.values(it.groups))r.visible=!1;if(vt=e,Ut=null,Qt=null,e==="system"){Nt=null,Oe.target.set(0,0,0),Oe.radius=eo.system;return}Nt=Fe.get(e)??null;const s=Vt.get(e)??Ic(Ro(e).km);Oe.radius=e==="sun"?3.2:e==="jupiter"?3.4*Ze:e==="saturn"?2.6*Ze:Math.max(s*(Ro(e).ring?6:4.2),.25)}function Si(e){const s=I.get(e);s&&(ke!=="system"&&jo("system"),vt="system",Nt=s,Ut=null,Qt=null,Oe.radius=e==="halley"?1.6:.6,hn=performance.now())}function Ti(e){Qt=(e?mt.find(r=>r.parent===vt&&r.site.name===e.name):void 0)?.mesh??null,Ut=Qt?new W:null,hn=performance.now()}let A=null,Ve=0,Dt=-.12;const Sa=62,ns=18,os=85;let Fn=Sa,no=0,Gn=0,oo=0,as=0,Xo=null,En=null,Te=null,Re="idle",wt=0,en=0,Yo=-1,He=0,Ln=0,ut=0,ft=0,tn=0,Ho=!1,xo=!1,bo=li("earth");const Ta=3.6,qo=2,ki=430;let wn=0,ka=0,So=0,nn=-1,Nn=-1,On=null,Bn=0;const ss=96,Ai=322;let ao=0,fn=0,jn=0,To=0,is=0,rs=0;const so=3.4,cs=6.6,$o=2.8,ls=4.6,Xn=620;let he=0,ve=0,io=0,Tt=0,kt=0,At=0,Yn=0,on=!0,xn=!1,Aa=0,Gt=!0,ko=9.81,Hn="first",us="office";const Pi=4.6,fs=1.8,ps=16;let ro=Pi,Ao=0,pn=Math.PI,qn=0,Po=0,co=0,lo=Number.NaN,mn=null,$n=0,Zn=0,Pa=new G("#000000"),Zo=0;const Ci=new G("#5a1206");let Ko=0,Ca=0,za=-24,Ra=120;const qt=new Set;function zi(){if(xe.visible=!0,Me.visible=ke==="system",u.visible=ke==="eclipse",Ct.visible=ke==="sizes",Se.visible=ke==="exo",st.group.visible=ke==="blackhole",it)for(const[e,s]of Object.entries(it.groups))s.visible=e===ke}function ms(e,s){A&&(g.remove(A.group),A.dispose(),A=null),Ms();const r=Tr(e);Xo=e,En=r,bo=li(e),A=oc(r,{low:o,anisotropy:y,onLand:d=>t.onSurfaceDrop?.({id:e,seconds:d.seconds,bounces:d.bounces,outcome:d.outcome}),onImpact:Fi}),g.add(A.group),Pa=new G(r.fog),Zo=r.fogDensity,g.fog=new gr(Pa.clone(),Zo),Ve=(r.companion?r.companionAz:r.sunAz)*Wt,Dt=-.12,pn=Math.PI-Ve,qn=0,Po=0,co=0,na(),Fn=Sa,he=A.standX,ve=A.standZ,io=0,Tt=0,kt=0,At=0,Yn=0,on=!0,xn=!1,Aa=0,Gt=A.walkable,ko=Math.max(0,r.gravityMps2),Ko=0,Ca=0,za=r.terrain==="ring"?-24:-1,Ra=r.terrain==="ring"?110:240,Gn=0,oo=Math.max(.6,s),as=r.cloudTop!==null?260:150,Ao=0,lo=Number.NaN,fn=0,jn=0,To=0,A.avatar.setSkin(us),A.avatar.setVisible(Hn==="third"),ys(),hn=performance.now()}function ds(e){if(!A){if(xe.visible=!1,Me.visible=!1,u.visible=!1,Ct.visible=!1,Se.visible=!1,st.group.visible=!1,it)for(const s of Object.values(it.groups))s.visible=!1;h.style.display="none",L=null,jt=null,K=!0,c.fov=62,c.near=.08,c.far=6e3,c.updateProjectionMatrix()}ms(e,1.9)}function Ri(e){if(!A){ds(e);return}ms(e,1.1)}function hs(){A&&(na(),Ms(),g.remove(A.group),A.dispose(),A=null,g.fog=null,l.toneMappingExposure=1.1,h.style.display="",zi(),c.fov=45,c.near=.01,c.far=2e3,c.updateProjectionMatrix(),to.copy(Oe.target),Ue.radius=Oe.radius,hn=performance.now())}function Fa(){if(!A)return;const e=4.2+Math.random()*1.4,s=(Math.random()-.5)*1.8,r=he-A.standX+Math.sin(Ve)*e+Math.cos(Ve)*s,d=ve-A.standZ-Math.cos(Ve)*e+Math.sin(Ve)*s;A.drop(r,d)}function Fi(){if(t.onSurfaceImpact?.(),!A)return;const e=Math.sin(Ve),s=-Math.cos(Ve),r=Math.hypot(he-is,ve-rs);if(r<46){const d=Math.max(.35,1-r/46);$n-=e*(3.4+d*5.2),Zn-=s*(3.4+d*5.2),To=2.8+d*.9,fn=1,jn=1,Co(180)}else $n-=e*8.2,Zn-=s*8.2;Gt?on&&(Tt=Math.max(Tt,2.8),on=!1):Tt+=1.8}function Ei(){if(!A)return;const e=22+Math.random()*8,s=(Math.random()-.5)*5,r=Math.sin(Ve),d=-Math.cos(Ve),S=he+r*e+Math.cos(Ve)*s,z=ve+d*e+Math.sin(Ve)*s;is=S,rs=z,A.impact.strike(S,z,r,d),kr()}function $t(){t.onSurfaceRocket?.({phase:Re,count:en,altitude:He,alt:Cc(He,bo),speed:zc(He,bo),event:On,air:bo.airTopKm!==null,kind:En?.kind,ring:Xo==="saturn-ring",fantasyNote:En?En.kind==="star"?"star":Xo==="saturn-ring"?"ring":En.cloudTop!==null?"gas":null:null,star:En?.kind==="star",gravityFree:bo.airTopKm===null})}function Co(e){try{const s=navigator;typeof s.vibrate=="function"&&s.vibrate(e)}catch{}}function Ni(){if(!Te||Re!=="idle")return;const e=he-ut,s=ve-ft,r=Math.hypot(e,s),d=ni+1.7;if(r>=d)return;const S=r>.001?e/r:-Math.sin(Ve),z=r>.001?s/r:Math.cos(Ve);he=ut+S*d,ve=ft+z*d;const F=kt*S+At*z;F<0&&(kt-=F*S,At-=F*z)}function vs(){let e=he+Math.sin(Ve)*20,s=ve-Math.cos(Ve)*20,r=1/0;const d=(S,z)=>{if(!A)return 0;let F=1/0,N=-1/0;for(let f=0;f<12;f+=1){const k=f/12*Math.PI*2;for(const E of[0,3.5,7]){const _=A.walkable?A.meshHeightAt(S+Math.cos(k)*E,z+Math.sin(k)*E):A.floorAt(S,z);F=Math.min(F,_),N=Math.max(N,_)}}return N-F};for(const S of[-.55,-.28,0,.28,.55])for(const z of[20,24,28]){const F=Ve+S,N=he+Math.sin(F)*z,f=ve-Math.cos(F)*z,k=Math.hypot(N,f)>Xn-40?6:0,E=A?Math.abs((A.walkable?A.meshHeightAt(N,f):A.floorAt(N,f))-A.meshHeightAt(he,ve)):0,_=d(N,f)*2.5+E*1.2+k+Math.abs(S)*.6;_<r&&(r=_,e=N,s=f)}return{x:e,z:s}}function gs(e,s){if(!(!Te||!A)){if(ut=e,ft=s,A.walkable){let r=A.meshHeightAt(e,s);for(let d=0;d<12;d+=1){const S=d/12*Math.PI*2;r=Math.max(r,A.meshHeightAt(e+Math.cos(S)*3.5,s+Math.sin(S)*3.5)),r=Math.max(r,A.meshHeightAt(e+Math.cos(S)*7,s+Math.sin(S)*7))}tn=r}else tn=A.floorAt(e,s);Te.setBase(e,s,tn),Te.setFacing(Math.atan2(-(ve-s),he-e)),Te.setLift(0),Te.setThrottle(0),Te.setUpperThrottle(0),Te.setStage1Separation(0),Te.setFairingSeparation(0),Te.setClamps(0),Te.setPadVisible(!0)}}function ys(){Te||Ho||!A||!En||(Ho=!0,hc(l,En).then(e=>{if(Ho=!1,!A){e.dispose();return}Te=e,A.group.add(e.group);const s=vs();gs(s.x,s.z),xo&&(xo=!1,ws())}).catch(()=>{Ho=!1,xo=!1}))}function Ms(){Ja(),Te&&(Te.group.parent?.remove(Te.group),Te.dispose(),Te=null),A&&A.orbitView(0),Re="idle",en=0,He=0,Ln=0,wt=0,xo=!1,ka=0,So=0,nn=-1,Nn=-1,On=null,Bn=0}function ws(){if(!(!A||Re!=="idle")){if(vc(),Sc(),na(),xn=!1,!Te){xo=!0,ys();return}if(Math.hypot(he-ut,ve-ft)>34){const e=vs();gs(e.x,e.z),Te.setLift(95),Re="land"}else Re="run";wt=0,He=0,Ln=0,en=0,ka=0,So=0,nn=-1,Nn=-1,On=null,Bn=0,Te&&(Te.setStage1Separation(0),Te.setFairingSeparation(0),Te.setUpperThrottle(0)),co=0,$t()}}function Di(e){return e==="sun"||e==="mercury"||e==="venus"||e==="earth"||e==="moon"||e==="mars"||e==="jupiter"||e==="saturn"||e==="uranus"||e==="neptune"||e==="pluto"||e==="eris"||e==="haumea"||e==="makemake"?e:e==="io"||e==="europa"||e==="ganymede"||e==="callisto"?"jupiter":e==="titan"||e==="enceladus"||e==="saturn-ring"?"saturn":e==="charon"?"pluto":"system"}function Ii(e){if(!(!A||!Te||Re==="idle")){if(wt+=e,Bn>0&&(Bn-=e,Bn<=0&&(On=null,$t())),Re==="land"){const s=Math.min(1,wt/1.9),r=1-Math.pow(1-s,3);Te.setLift(95*(1-r)),s>=1&&(Te.setLift(0),Re="run",wt=0,$t());return}if(Re==="run"){(Math.hypot(ut-he,ft-ve)<6.4||wt>16)&&(Re="board",wt=0,$t());return}if(Re==="board"){const s=Math.min(1,e*3.6);he+=(ut-he)*s,ve+=(ft-ve)*s,wt>1.25&&(Re="count",wt=0,en=3,yc(qo,10.5+Ta,Math.max(0,ko)),$t());return}if(Re==="count"){const s=Math.max(0,Math.ceil(3-wt));s!==en&&(en=s,gc(en===0),kc(en===3?"three":en===2?"two":en===1?"one":"liftoff"),$t());const r=Math.max(0,Math.min(1,(wt-qo)/.9));Te.setThrottle(r),Te.setClamps(Math.max(0,Math.min(1,(wt-qo-.15)/.7))),r>0&&wt-e<=qo&&(Co(90),wn=1),wt>=Ta&&(Re="lift",wt=0,Ln=0,$t());return}if(Re==="lift"){const s=Math.max(0,ko),d=(12.5+Math.min(4.5,s*.02))*(.55+Math.min(.45,wt*.35))*(1+.42*ka);if(Ln+=d*e,He+=Ln*e,Te.setLift(He),nn<0&&He>=ss&&(nn=0,On="sep1",Bn=2.6,Te.setThrottle(0),wn=1.15,Co([40,70,120]),Mc(s),$t()),nn>=0){nn+=e,Te.setStage1Separation(Math.min(1,nn/2.6));const F=Math.max(0,Math.min(1,(nn-.3)/.4));Te.setUpperThrottle(F),nn-e<=.3&&nn>=.3&&(xc(3.6),wn=Math.max(wn,.75),Co(80))}else Te.setThrottle(1);Nn<0&&He>=Ai&&(Nn=0,On="fairing",Bn=2.6,wn=Math.max(wn,.85),Co([25,45,70]),wc(),$t()),Nn>=0&&(Nn+=e,So=Math.min(1,Nn/2.2),Te.setFairingSeparation(So)),A.atmosphere(Math.min(.86,He/300)),A.orbitView(He,c.position.y-tn);const S=He>ss-58?1:0;ao+=(S-ao)*Math.min(1,e*1.5);const z=Math.round(He);z!==Yo&&(Yo=z,$t()),He>26&&Te.setPadVisible(!1),He>ki&&(Re="escape",wt=0,$t());return}if(Re==="escape"){const s=Math.min(1,wt/2.6);Ln+=40*e,He+=Ln*e,Te.setLift(He),Te.setUpperThrottle(1),A.atmosphere(Math.max(.86,.86+s*.14)),A.orbitView(He,c.position.y-tn),ao=Math.min(1,ao+e*2);const r=Math.round(He);r!==Yo&&(Yo=r,$t());const d=g.fog;if(d&&(d.density=Zo*(1-s)),s>=1){const S=Xo;Ja(),Re="idle",hs(),ba(Di(S)),t.onSurfaceEscape?.()}}}}function _i(e,s){if(!A||!Te)return;const r=tn+ma;if(Re==="board"||Re==="count"){const S=Re==="count"?Math.min(1,wt/Ta):0,z=Math.atan2(ut-he,ft-ve)+1.05,F=34-S*8,N=ut+Math.sin(z)*F,f=ft+Math.cos(z)*F;let k=tn+6.4+S*2.2;A.solidFloor&&(k=Math.max(k,A.meshHeightAt(N,f)+2.2)),c.position.set(N,k,f),c.fov=58+S*10,c.updateProjectionMatrix(),c.lookAt(ut,r+16+S*26,ft)}else if(Re==="run"){const S=A.walkable?A.meshHeightAt(he,ve):A.floorAt(he,ve),z=Math.atan2(ut-he,ft-ve)+.85,F=26+Math.min(16,Math.hypot(ut-he,ft-ve)*.3),N=ut+Math.sin(z)*F,f=ft+Math.cos(z)*F;let k=tn+5.5;A.solidFloor&&(k=Math.max(k,A.meshHeightAt(N,f)+1.6)),c.position.set(N,k,f),c.fov=66,c.updateProjectionMatrix(),c.lookAt(he,S+1.1,ve)}else{const S=Math.min(1,He/70),z=Math.atan2(ut-he,ft-ve)+1.05,F=34+S*(24+Math.min(170,He*.3)),N=ut+Math.sin(z)*F,f=ft+Math.cos(z)*F;let k=tn+6.4+S*(6+He*.3);A.solidFloor&&(k=Math.max(k,A.meshHeightAt(N,f)+2.2));let E=r+42+He*.55,_=62+S*12;const de=ao;if(de>.001){const pe=r+He,Ce=Te.boosterDrop(),Be=118+Math.min(60,He*.1),ze=Be*.48+10,Xe=ut+Math.sin(z)*Be,qe=ft+Math.cos(z)*Be,De=pe+ze,et=pe+22-Ce*.3;c.position.set(N+(Xe-N)*de,k+(De-k)*de,f+(qe-f)*de),E=E+(et-E)*de,_=_+(66-_)*de}else c.position.set(N,k,f);c.fov=_,c.updateProjectionMatrix(),c.lookAt(ut,E,ft)}wn=Math.max(0,wn-s*1.4);const d=wn*.5+(Re==="lift"||Re==="escape"?Math.max(0,.22-He*6e-4):0);d>.002&&(c.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*d*.9,c.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*d*.9,c.rotateZ(Math.sin(e*31.4)*d*.03))}function Vi(e){Hn=e,e==="third"&&Dt<-.32&&(Dt=-.16),lo=Number.NaN,Dt=Math.min(.6,Math.max(-1.05,Dt)),A&&A.avatar.setVisible(e==="third"),hn=performance.now()}function Wi(e){us=e,A&&A.avatar.setSkin(e)}function Ui(e){if(!A)return;if(Gn<oo){xn=!1;return}const s=(qt.has("w")||qt.has("arrowup")?1:0)-(qt.has("s")||qt.has("arrowdown")?1:0),r=(qt.has("d")||qt.has("arrowright")?1:0)-(qt.has("a")||qt.has("arrowleft")?1:0);let d=Ko+s,S=Ca+r;if(fn>.4&&(d=0,S=0,xn=!1),Re!=="idle"){const de=(Math.atan2(ut-he,-(ft-ve))-Ve+Math.PI*3)%(Math.PI*2)-Math.PI;Ve+=de*Math.min(1,e*6),d=Re==="run"||Re==="board"?1:0,S=0}const z=Math.hypot(d,S);z>1&&(d/=z,S/=z);const F=Math.sin(Ve),N=-Math.cos(Ve),f=Math.cos(Ve),k=Math.sin(Ve),E=Math.min(1,e*(Gt?9:2.4));if(Gt){const _=Math.min(1,z),de=Math.min(1,Math.max(0,(_-.7)/.3));Po+=(de-Po)*Math.min(1,e*6);const pe=so+(cs-so)*Po,Ce=(F*d+f*S)*pe,Be=(N*d+k*S)*pe,ze=Math.min(1,e*(_>.02?8.5:5.2));kt+=(Ce-kt)*ze,At+=(Be-At)*ze,he+=(kt+$n)*e,ve+=(At+Zn)*e,$n*=Math.exp(-e*3.1),Zn*=Math.exp(-e*3.1);const Xe=A.walk(he,ve);if(Xe.x!==he||Xe.z!==ve){const zt=Xe.x-he,_t=Xe.z-ve,pt=Math.hypot(zt,_t);if(he=Xe.x,ve=Xe.z,pt>1e-4){const Je=zt/pt,gt=_t/pt,yt=kt*Je+At*gt;yt<0&&(kt-=Je*yt,At-=gt*yt)}}const qe=Xe.rise;qn+=(qe-qn)*Math.min(1,e*(qe>qn?16:9));const De=Math.hypot(he,ve);if(De>Xn){const zt=he/De,_t=ve/De;he=zt*Xn,ve=_t*Xn;const pt=kt*zt+At*_t;pt>0&&(kt-=pt*zt,At-=pt*_t)}Ni();const et=Math.hypot(kt,At);Aa+=e*(on?.8+et*1.7:.8),xn&&on&&ko>.01&&(Tt=ls,on=!1),on||(Tt-=ko*e,io+=Tt*e,io<=0&&(io=0,Ao=Math.min(1,Math.abs(Tt)/ls),Tt=0,on=!0))}else{const _=Math.cos(Dt),de=(Math.sin(Ve)*_*d+f*S)*$o,pe=Math.sin(Dt)*d*$o,Ce=(-Math.cos(Ve)*_*d+k*S)*$o;kt+=(de-kt)*E,At+=(Ce-At)*E,Tt+=(pe-Tt)*E,xn&&(Tt+=1.8),he+=(kt+$n)*e,ve+=(At+Zn)*e,$n*=Math.exp(-e*3.1),Zn*=Math.exp(-e*3.1),Yn+=Tt*e;const Be=Math.hypot(he,ve);if(Be>Xn){const ze=he/Be,Xe=ve/Be;he=ze*Xn,ve=Xe*Xn;const qe=kt*ze+At*Xe;qe>0&&(kt-=qe*ze,At-=qe*Xe)}Yn<za&&(Yn=za,Tt<0&&(Tt=0)),Yn>Ra&&(Yn=Ra,Tt>0&&(Tt=0))}xn=!1}function Gi(e,s){if(!A)return;if(A.update(e,s),Gn<oo){Gn=Math.min(oo,Gn+s);const pe=Gn/oo,Ce=1-Math.pow(1-pe,3);no=as*(1-Ce),Dt=-.12-.38*(1-Ce)}else no!==0&&(no=0,Hn==="third"&&(Dt=-.16));if(Ui(s),Ii(s),!A)return;Ao=Math.max(0,Ao-s*3.4),c.fov!==Fn&&(c.fov=Fn,c.updateProjectionMatrix());const r=Hn==="third",d=r||Re==="run";Gt&&!on&&(qn+=(0-qn)*Math.min(1,s*4));const S=Gt?qn:0,z=Gt?A.eyeY+A.meshHeightAt(he,ve)+S+io:A.eyeY+Yn,F=z-A.eyeHeight+no,N=Math.hypot(kt,At);N>.25&&(pn=Math.atan2(kt,At)),co=Math.max(0,co-s);const f=Ko>.25||qt.has("w")||qt.has("arrowup");if(r&&f&&co<=0&&N>so*.8){const Ce=(Math.PI-pn-Ve+Math.PI*3)%(Math.PI*2)-Math.PI;Ve+=Ce*Math.min(1,s*.8)}if(To>0?(To-=s,To<=0&&(fn=0)):fn>0&&(fn=0),fn<=0&&jn>0&&(jn=Math.max(0,jn-s*.4)),A.avatar.setDown(fn),A.avatar.setBurn(jn),A.avatar.setVisible(d&&(Re==="idle"||Re==="run")),d){const pe=A.normalAt(he,ve),Ce=Math.sin(pn),Be=Math.cos(pn),ze=Math.cos(pn),Xe=-Math.sin(pn),qe=-Math.asin(Math.max(-1,Math.min(1,pe.x*Ce+pe.z*Be))),De=-Math.asin(Math.max(-1,Math.min(1,pe.x*ze+pe.z*Xe)));A.avatar.update(e,s,{x:he,z:ve,feetY:F,facing:pn,speed:N,maxSpeed:Gt?so+(cs-so)*Po:$o,grounded:Gt&&on,floating:!Gt,vy:Tt,landing:Ao,shadowY:A.solidFloor?A.meshHeightAt(he,ve):null,shockT:A.impact.sinceImpact(),slopePitch:Gt?Math.max(-.26,Math.min(.26,qe)):0,slopeRoll:Gt?Math.max(-.26,Math.min(.26,De)):0,groundNormal:{x:pe.x,y:pe.y,z:pe.z}})}if(r){const pe=Number.isNaN(lo)?F+1.34:lo;lo=pe+(F+1.34-pe)*Math.min(1,s*3.2);const Ce=lo,Be=Math.cos(Dt),ze=Math.sin(Ve)*Be,Xe=Math.sin(Dt),qe=-Math.cos(Ve)*Be;let De=ro,et=he-ze*De,zt=Ce-Xe*De,_t=ve-qe*De;if(A.solidFloor){const pt=A.meshHeightAt,Je=(gt,yt)=>Math.max(pt(gt,yt),pt(gt+.6,yt),pt(gt-.6,yt),pt(gt,yt+.6),pt(gt,yt-.6));for(let gt=0;gt<7;gt+=1){et=he-ze*De,_t=ve-qe*De,zt=Ce-Xe*De;const yt=Je(et,_t)+.85;if(zt>=yt)break;if(yt-zt<=2.4){zt=yt;break}if(De<=1.8){zt=yt;break}De=Math.max(1.8,De*.8)}}if(Te&&Re==="idle"&&zt<tn+34){const pt=et-ut,Je=_t-ft,gt=Math.hypot(pt,Je),yt=ni+1.3;if(gt<yt){const Yi=gt>.001?pt/gt:1,Hi=gt>.001?Je/gt:0;et=ut+Yi*yt,_t=ft+Hi*yt}}c.position.set(et,zt,_t),fn>.25?c.lookAt(he-Math.sin(pn)*.85,F+.35,ve-Math.cos(pn)*.85):c.lookAt(he,Ce,ve)}else{const pe=Math.min(1,N/so),Ce=Gt?on?Math.sin(Aa*2)*.035*pe:0:Math.sin(e*.5)*.25,Be=z+no+Ce;c.position.set(he,Be,ve);const ze=Math.cos(Dt);c.lookAt(he+Math.sin(Ve)*ze,Be+Math.sin(Dt),ve-Math.cos(Ve)*ze)}mn?(c.position.set(mn.pos[0],mn.pos[1],mn.pos[2]),c.lookAt(mn.look[0],mn.look[1],mn.look[2]),c.fov!==mn.fov&&(c.fov=mn.fov,c.updateProjectionMatrix())):Re!=="idle"&&_i(e,s);const k=A.impact.shake();if(k>.002){const pe=k;c.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*pe*.6,c.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*pe*.6,c.position.z+=(Math.sin(e*41.9+2.1)+Math.sin(e*25.6)*.5)*pe*.45,c.rotateZ((Math.sin(e*35.2)*.6+Math.sin(e*21.7+1.1)*.4)*pe*.05)}const E=A.impact.flash();l.toneMappingExposure=1.1+E*5.4;const _=A.impact.doom(),de=g.fog;if(de){de.color.copy(Pa).lerp(Ci,_*.82);const pe=Re==="lift"||Re==="escape"?Math.max(.06,1-Math.min(.94,He/520)):1;de.density=Zo*(1+_*2.4)*pe}l.render(g,c)}const It=new Map,Ea=new Map;let dn=0,Dn=0,Jo=!1,hn=0;const xs=new vi,bs=new Io,Ss=e=>{if(Ea.set(e.pointerId,{x:e.clientX,y:e.clientY}),A){if(i.setPointerCapture(e.pointerId),It.set(e.pointerId,{x:e.clientX,y:e.clientY}),It.size>=2){const[s,r]=[...It.values()];dn=Math.hypot(s.x-r.x,s.y-r.y),Jo=!0,Dn+=100}else Jo=!1,Dn=0;return}if(Pe(),i.setPointerCapture(e.pointerId),Jt=!1,It.set(e.pointerId,{x:e.clientX,y:e.clientY}),Dn=0,hn=performance.now(),It.size===2){const[s,r]=[...It.values()];dn=Math.hypot(s.x-r.x,s.y-r.y)}},Ts=e=>{const s=It.get(e.pointerId);if(!s)return;const r=e.clientX-s.x,d=e.clientY-s.y;if(It.set(e.pointerId,{x:e.clientX,y:e.clientY}),A){if(It.size>=2){const[z,F]=[...It.values()],N=Math.hypot(z.x-F.x,z.y-F.y);dn>0&&N>0&&(Hn==="third"?ro=Math.min(ps,Math.max(fs,ro*(dn/N))):Fn=Math.min(os,Math.max(ns,Fn*(dn/N)))),dn=N,Dn+=Math.abs(r)+Math.abs(d)+10;return}Dn+=Math.abs(r)+Math.abs(d);const S=Fn/Sa;Ve-=r*.004*S,Dt=Math.min(1.15,Math.max(-1.05,Dt-d*.0035*S)),Math.abs(r)+Math.abs(d)>2&&(co=1.4);return}if(hn=performance.now(),It.size===1)Dn+=Math.abs(r)+Math.abs(d),Ue.theta-=r*.006,Ue.phi=Math.min(2.9,Math.max(.2,Ue.phi-d*.006)),Ut=null,Qt=null;else if(It.size===2){const[S,z]=[...It.values()],F=Math.hypot(S.x-z.x,S.y-z.y);dn>0&&(Oe.radius=As(Oe.radius*(dn/F))),dn=F,Dn+=10}},Qo=e=>{const s=Ea.get(e.pointerId),r=Jo;if(Ea.delete(e.pointerId),It.delete(e.pointerId),dn=0,It.size===0&&(Jo=!1),A){(s?Math.hypot(e.clientX-s.x,e.clientY-s.y):1/0)<12&&!r&&It.size===0&&Fa();return}if(Dn<6&&t.onPick){const d=i.getBoundingClientRect();bs.set((e.clientX-d.left)/d.width*2-1,-((e.clientY-d.top)/d.height)*2+1),xs.setFromCamera(bs,c);const z=xs.intersectObjects([...ge.values(),...q.values()],!1)[0]?.object.name;z&&ge.has(z)?t.onPick(z):z&&q.has(z)&&t.onExtra?.(z)}},ks=e=>{if(A){e.preventDefault(),Hn==="third"?ro=Math.min(ps,Math.max(fs,ro*(e.deltaY>0?1.1:.9))):Fn=Math.min(os,Math.max(ns,Fn*(e.deltaY>0?1.1:.9)));return}e.preventDefault(),Oe.radius=As(Oe.radius*(e.deltaY>0?1.12:.89))};function As(e){return ke!=="system"?Math.min(eo[ke]*2.2,Math.max(eo[ke]*.15,e)):Math.min(90,Math.max(vt==="system"&&!Nt?4:.15,e))}const Ps=e=>{if(!A)return;const s=e.target;if(s&&(s.tagName==="INPUT"||s.tagName==="TEXTAREA"||s.isContentEditable))return;const r=e.key.toLowerCase();if(e.code==="KeyE"||e.code==="KeyF"||r==="e"||r==="f"){if(e.repeat||Gn<oo)return;e.preventDefault(),Fa();return}(r===" "||r==="spacebar"||r==="w"||r==="a"||r==="s"||r==="d"||r.startsWith("arrow"))&&(e.preventDefault(),qt.add(r==="spacebar"?" ":r),(r===" "||r==="spacebar")&&(xn=!0))},Cs=e=>{const s=e.key.toLowerCase();qt.delete(s==="spacebar"?" ":s)};window.addEventListener("keydown",Ps),window.addEventListener("keyup",Cs),i.addEventListener("pointerdown",Ss),i.addEventListener("pointermove",Ts),i.addEventListener("pointerup",Qo),i.addEventListener("pointercancel",Qo),i.addEventListener("wheel",ks,{passive:!1});let bn=null,ea=null,Na=!matchMedia("(prefers-reduced-motion: reduce)").matches,zs=0,Rs=0;Na&&(bn=new ur(l),bn.addPass(new fr(g,c)),ea=new pr(new Io(256,256),.75,.78,.92),bn.addPass(ea),bn.addPass(new mr));const Ne={w:1,h:1},Fs=()=>{Ne.w=n.clientWidth||1,Ne.h=n.clientHeight||1,l.setSize(Ne.w,Ne.h,!1),bn?.setSize(Ne.w,Ne.h),ea?.resolution.set(Ne.w/2,Ne.h/2),c.aspect=Ne.w/Ne.h,c.updateProjectionMatrix()};Fs();const Es=new ResizeObserver(Fs);Es.observe(n);let Ns=!0;const Ds=new IntersectionObserver(e=>{Ns=e.some(s=>s.isIntersecting)});Ds.observe(n);const ne=new W,Kn=new W,uo=new W,Da=new W,Li=new W,Oi=new W,Bi=new W,ji=new W,Is=new W,Xi=new W;let Ia=0,_s=performance.now(),_a=-1e9,Vs=0;const Ws=e=>{Ia=requestAnimationFrame(Ws);const s=Math.min(.1,(e-_s)/1e3);if(_s=e,document.hidden||!Ns)return;if(A){Gi(e/1e3,s);return}if(Ht||(Wo.uniforms.time.value=e/1e3),!Ht){for(const f of V)f.uniforms.time.value=e/1e3;for(const f of te)f.uniforms.uTime.value=e/1e3}e-hn>3e3&&!Ht&&!Ut&&!ts&&!Jt&&ke!=="eclipse"&&ke!=="sizes"&&(Ue.theta+=s*(vt==="system"?.03:.08)),Ot?.rotateY(s*.01);for(const[f,k]of ge){if(f==="earth"||f==="moon"||Qt&&f===vt)continue;const E=Ro(f).spinHours;Ht||k.rotateY(s*(f==="sun"?.02:E?.12*(24/E)*.25:.12))}Bt&&(Bt.visible=c.position.length()>4);for(const f of Oo)f.material.uniforms.uDays.value=(be-Rc)/864e5,f.material.uniforms.uTime.value=e/1e3;for(const f of ee){const k=ge.get(f.parent);k&&f.mesh.material.uniforms.planetCenter.value.copy(k.getWorldPosition(ne))}for(const f of Y)f.mesh.getWorldPosition(ne),f.material.uniforms.ringCenter.value.copy(ne),f.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(f.mesh.matrixWorld).normalize();if(K&&e-Vs>1e3&&(Vs=e,be=Date.now(),zn(be)),L){const f=J.get(L.id),k=f.points.length,E=f.times[k-1],_=(f.frame==="earth"?6:25)*864e5,pe=f.marks.some(Je=>Je.at!==void 0&&Je.body&&Je.body!=="earth"&&Math.abs(L.sim-Je.at)<_)?"slow":L.sim>=L.fastFrom?"fast":"normal",Ce=pe==="slow"?Math.min(L.base,2*_/3):L.base*(pe==="fast"?L.fast:1);L.sim=Math.min(E,L.sim+Ce*Math.min(s,.1)),f.frame==="sun"?jt=(jt??L.sim)+Math.min(s,.1)*.15*864e5:jt=null,L.pace=pe;const Be=(L.sim-f.times[0])/(E-f.times[0]||1);let ze=0,Xe=k-1;for(;Xe-ze>1;){const Je=ze+Xe>>1;f.times[Je]<=L.sim?ze=Je:Xe=Je}const qe=f.times[Xe]-f.times[ze],De=ze+(qe>0?(L.sim-f.times[ze])/qe:0),et=Math.max(0,Math.min(k-2,Math.floor(De))),zt=De-et;f.probe.position.lerpVectors(f.points[et],f.points[et+1],zt),we=De,f.probe.lookAt(f.line.localToWorld(f.points[Math.min(k-1,et+2)].clone())),f.line.geometry.setDrawRange(0,et+2);const _t=f.times[et]+(f.times[et+1]-f.times[et])*zt;K=!1,be=_t,zn(_t);let pt=0;for(let Je=0;Je<f.marks.length;Je+=1){const gt=f.marks[Je],yt=gt.at??f.times[Math.min(k-1,gt.index)];L.sim>=yt-_&&(pt=Je)}if((pt!==L.mark||e-L.lastPing>250||L.sim>=E&&!L.done)&&(L.mark=pt,L.lastPing=e,L.sim>=E&&(L.done=!0),t.onFlight?.({id:L.id,mark:f.marks[pt],progress:Be,time:_t,done:L.done,pace:L.pace})),L.done){const Je=f.frame==="earth";L=null,jt=null,K=!0,Nt=Je?Fe.get("earth")??null:null,Je||Oe.target.set(0,0,0),Oe.radius=Je?4.2:72,Ue.phi=Je?.7:.45}}if(Nt&&Oe.target.copy(Nt.getWorldPosition(ne)),L){const f=J.get(L.id);let k=null,E=1/0;for(const de of f.marks){if(!de.body||de.body==="earth"||de.body==="far")continue;const pe=Math.abs(de.index-we);pe<14&&pe<E&&(k=de,E=pe)}const _=k?Fe.get(k.body):void 0;if(_){const de=_.getWorldPosition(Bi).add(f.probe.getWorldPosition(ji)).multiplyScalar(.5);Oe.target.copy(de),Oe.radius=f.frame==="earth"?1.6:4.2}else Oe.radius=f.frame==="earth"?1.5:2.8}if(to.lerp(Oe.target,1-Math.pow(.002,s)),Ue.radius+=(Oe.radius-Ue.radius)*(1-Math.pow(.004,s)),Ut&&Qt){const f=ge.get(vt)?.getWorldPosition(Is)??Is.set(0,0,0);Ut.copy(Qt.getWorldPosition(Xi).sub(f).normalize());const k=Math.atan2(Ut.x,Ut.z),E=Math.acos(Math.max(-1,Math.min(1,Ut.y)));let _=k-Ue.theta;_=Math.atan2(Math.sin(_),Math.cos(_)),Ue.theta+=_*(1-Math.pow(.01,s)),Ue.phi+=(E-Ue.phi)*(1-Math.pow(.01,s))}if(ke==="blackhole"&&st.update(e/1e3,c),ke==="exo"){const f=e/1e3;for(const k of Le){const E=k.phase0+f/k.period*Math.PI*2;k.mesh.position.set(Math.cos(E)*k.a,0,Math.sin(E)*k.a)}}if(ke==="eclipse"){Q=(Q+s*.18)%1;const f=Math.sin(Q*Math.PI*2),k=Math.abs(f)<.22,E=Math.max(0,1-Math.abs(f)/.9),_=w==="lunar";if(m.visible=!v,R.visible=v,C.skySun.visible=!_,C.skyMoon.visible=_,v)_?(C.skyMoon.position.set(f*1.7,0,.08),C.skyMoonMat.color.set("#f2f2f2").lerp(new G("#c47462"),_?E:0)):C.skyCover.position.set(f*1.7,0,.08);else{C.moon.position.set(_?2.75:1.05,f*.55,0),C.cone.visible=!_,C.umbra.visible=_,C.shadow.opacity=k?.42:.08,C.umbra.material.opacity=k?.42:.08,C.moonMat.color.set("#ffffff").lerp(new G("#c47462"),_?E:0);const de=k?Z("개기"):Math.abs(f)<.6?Z("부분"):_?Z("반영"):"";bt.textContent!==de&&(bt.textContent=de)}}if(c.position.set(to.x+Ue.radius*Math.sin(Ue.phi)*Math.sin(Ue.theta),to.y+Ue.radius*Math.cos(Ue.phi),to.z+Ue.radius*Math.sin(Ue.phi)*Math.cos(Ue.theta)),c.lookAt(to),Rn&&(Rn.getWorldPosition(ne),Xt.copy(ne).multiplyScalar(-1).normalize(),e-_a>500&&!(L&&J.get(L.id)?.frame==="sun"))){_a=e;const f=Sr(new Date(be)),k=Math.atan2(f.y,f.x),E=Math.atan2(-Xt.z,Xt.x),_=Rn.children[0];_.rotation.y=E-k}bn&&Na&&ke!=="blackhole"&&(ke!=="system"||vt==="system"||vt==="sun")&&bn?(bn.render(s),zs+=1,Rs+=s,zs===90&&Rs/90>.034&&(Na=!1)):l.render(g,c),c.getWorldDirection(Kn),x();const S=[];for(const f of Wn){const k=Mt.get(f),E=Fe.get(f);if(!k||!E)continue;E.getWorldPosition(ne);const _=uo.copy(ne).sub(c.position).dot(Kn)>0,de=vt==="system"&&ke==="system"&&(!Nt||L!==null),pe=vt==="earth"||vt==="moon"||L!==null&&J.get(L.id)?.frame==="earth";let Ce=_&&(f==="moon"?ke==="system"&&pe:de||pe&&f==="earth"&&L!==null);ne.project(c);const Be=(ne.x+1)/2*Ne.w;let ze=Be;const Xe=(1-ne.y)/2*Ne.h+10;if(Ce){let qe=Uo.get(f)??0;qe||(k.style.display="block",qe=k.offsetWidth||40,Uo.set(f,qe)),ze=Math.min(Math.max(Be,qe/2+4),Math.max(qe/2+4,Ne.w-qe/2-4));const De={x:ze-qe/2,y:Xe,w:qe,h:22};T(De.x,De.y,De.w,De.h)||S.some(et=>De.x<et.x+et.w+4&&De.x+De.w+4>et.x&&De.y<et.y+et.h&&De.y+De.h>et.y)?Ce=!1:S.push(De)}k.style.display=Ce?"block":"none",Ce&&(k.style.transform=`translate(${ze}px, ${Xe}px) translate(-50%, 0)`)}const z=ke==="system",F=vt!=="system"&&vt!=="jupiter"&&vt!=="saturn",N=Nt!==null&&(L===null?Nt===Fe.get("earth"):J.get(L.id)?.frame==="earth");for(const f of ot)f.visible=!F&&!N;for(const[f,k]of _e){const E=I.get(f),_=k.parent?Fe.get(k.parent)===Nt:vt==="system"&&(!Nt||Nt===E),de=Nt===E||_;E.getWorldPosition(ne);const pe=uo.copy(ne).sub(c.position).dot(Kn)>0,Ce=z&&pe&&de;ne.project(c),k.el.style.display=Ce?"block":"none",Ce&&(k.el.style.transform=`translate(${(ne.x+1)/2*Ne.w}px, ${(1-ne.y)/2*Ne.h+8}px) translate(-50%, 0)`)}for(const[f,k]of J){const E=z&&O===f;if(k.line.visible=E,!E){k.el.style.display="none";continue}k.probe.getWorldPosition(ne);const _=uo.copy(ne).sub(c.position).dot(Kn)>0;ne.y+=0,ne.project(c),k.el.style.display=_?"block":"none",_&&(k.el.style.transform=`translate(${(ne.x+1)/2*Ne.w}px, ${(1-ne.y)/2*Ne.h}px) translate(10px, -50%)`)}for(const f of Yt){if(ke!=="stars"){f.el.style.display="none";continue}ne.copy(f.at);const k=uo.copy(ne).sub(c.position).dot(Kn)>0;ne.project(c);const E=k&&Math.abs(ne.x)<1&&Math.abs(ne.y)<1;f.el.style.display=E?"block":"none",E&&(f.el.style.transform=`translate(${(ne.x+1)/2*Ne.w}px, ${(1-ne.y)/2*Ne.h}px) translate(-50%, -50%)`)}for(const f of Kt){if(!(f.level===ke)){f.el.style.display="none";continue}ne.copy(f.marker.position);const E=uo.copy(ne).sub(c.position).dot(Kn)>0;ne.project(c),f.el.style.display=E?"block":"none",E&&(f.el.style.transform=`translate(${(ne.x+1)/2*Ne.w}px, ${(1-ne.y)/2*Ne.h+8}px) translate(-50%, 0)`)}for(const f of Le){if(ke!=="exo"){f.el.style.display="none";continue}f.mesh.getWorldPosition(ne);const k=uo.copy(ne).sub(c.position).dot(Kn)>0;ne.project(c),f.el.style.display=k?"block":"none",k&&(f.el.style.transform=`translate(${(ne.x+1)/2*Ne.w}px, ${(1-ne.y)/2*Ne.h+8}px) translate(-50%, 0)`)}for(const f of ht){if(ke!=="blackhole"){f.el.style.display="none";continue}ne.copy(f.at),st.group.localToWorld(ne),ne.project(c);const k=ne.z<1&&Math.abs(ne.x)<1.05&&Math.abs(ne.y)<1.05;f.el.style.display=k?"block":"none",k&&(f.el.style.transform=`translate(${(ne.x+1)/2*Ne.w}px, ${(1-ne.y)/2*Ne.h}px) translate(-50%, -100%)`)}for(const f of $e){if(ke!=="exo"){f.el.style.display="none";continue}ne.copy(f.at).project(c);const k=ne.z<1&&Math.abs(ne.x)<1.05&&Math.abs(ne.y)<1.05;f.el.style.display=k?"block":"none",k&&(f.el.style.transform=`translate(${(ne.x+1)/2*Ne.w}px, ${(1-ne.y)/2*Ne.h}px) translate(-50%, -100%)`)}for(const[f,k]of[[re,ke==="eclipse"&&!v],[St,ke==="sizes"]])for(const E of f){if(!k){E.el.style.display="none";continue}ne.copy(E.at).applyMatrix4(E.group.matrixWorld).project(c);let _=ne.z<1&&Math.abs(ne.x)<1.1&&Math.abs(ne.y)<1.1;const de=(ne.x+1)/2*Ne.w,pe=(1-ne.y)/2*Ne.h,Ce=E.el.offsetWidth||44;_&&T(de-Ce/2,pe-11,Ce,22)&&(_=!1),E.el.style.display=_?"block":"none";const Be=E.group.rotation.z!==0;_&&(E.el.style.transform=`translate(${(ne.x+1)/2*Ne.w}px, ${(1-ne.y)/2*Ne.h}px) ${Be?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const f of mt){f.mesh.getWorldPosition(ne);const k=ge.get(f.parent);k?k.getWorldPosition(Da):Da.set(0,0,0);let _=Li.copy(ne).sub(Da).normalize().dot(Oi.copy(c.position).sub(ne).normalize())>.15&&ke==="system"&&vt===f.parent;ne.project(c),_&&T((ne.x+1)/2*Ne.w+8,(1-ne.y)/2*Ne.h-11,90)&&(_=!1),f.el.style.display=_?"block":"none",_&&(f.el.style.transform=`translate(${(ne.x+1)/2*Ne.w}px, ${(1-ne.y)/2*Ne.h}px) translate(8px, -50%)`)}};Ia=requestAnimationFrame(Ws),se===0&&t.onReady?.();const Va=e=>({mesh:Number(e.mesh.toFixed(2)),ray:e.ray===null?null:Number(e.ray.toFixed(2)),diff:e.ray===null?null:Number((e.mesh-e.ray).toFixed(2))});return typeof window<"u"&&location.search.includes("surfdebug")&&(window.__surfDebug=()=>({surf:A?{shock:A.impact.sinceImpact(),doom:A.impact.doom(),flash:A.impact.flash(),shake:A.impact.shake(),stats:A.impact.stats()}:null,x:Number(he.toFixed(2)),z:Number(ve.toFixed(2)),y:Number(c.position.y.toFixed(2)),yaw:Number(Ve.toFixed(2)),pitch:Number(Dt.toFixed(2)),jump:Number(io.toFixed(2)),knock:[Number($n.toFixed(2)),Number(Zn.toFixed(2))],mode:Hn,alt:Number(no.toFixed(2)),ground:A?Number(A.meshHeightAt(he,ve).toFixed(2)):null,camY:Number(c.position.y.toFixed(2)),cam:[Number(c.position.x.toFixed(2)),Number(c.position.z.toFixed(2))],feet:A?Number((A.eyeY+A.meshHeightAt(he,ve)-A.eyeHeight).toFixed(2)):null,third:Number(ro.toFixed(2)),avatar:A?{vis:A.avatar.group.visible,x:Number(A.avatar.group.children[0]?.position.x.toFixed(1)),y:Number((A.avatar.group.children[0]?.position.y??0).toFixed(1))}:null,down:Number(fn.toFixed(2)),burn:Number(jn.toFixed(2)),rocket:{phase:Re,alt:Number(He.toFixed(1)),count:en,pad:[Number(ut.toFixed(1)),Number(ft.toFixed(1))],padY:Number(tn.toFixed(2)),sep1:Number(nn.toFixed(2)),fair:Number(Nn.toFixed(2)),event:On,chase:Number(ao.toFixed(2)),drop:Te?Number(Te.boosterDrop().toFixed(1)):0,fairing:Number(So.toFixed(2))},probe:A?{stand:Va(A.probeGround(he,ve)),pad:Va(A.probeGround(ut,ft))}:null}),window.__surfProbe=(e,s)=>A?Va(A.probeGround(e,s)):null,window.__surfFreeCam=(e,s=0,r=0,d=0,S=0,z=0,F=62)=>{mn=e===null?null:{pos:[e,s,r],look:[d,S,z],fov:F}}),{focus:ba,setLevel:jo,setPaused:e=>{ts=e},focusMarker:e=>{const s=Kt.find(r=>r.level===ke&&r.marker.id===e);s&&(Oe.target.copy(s.marker.position),Oe.radius=eo[ke]*(e==="cmb"?1.4:ke==="group"?.6:.42),hn=performance.now())},showSite:Ti,focusExtra:Si,setEclipse:(e,s)=>{w=e,v=s,jo("eclipse")},setHemisphere:e=>{vt!=="earth"&&ba("earth");const s=Xt.clone().multiplyScalar(e==="day"?1:-1);Ue.theta=Math.atan2(s.x,s.z),Ue.phi=Math.min(2.6,Math.max(.5,Math.acos(s.y))),Ut=null,Qt=null,Jt=!0},enterSurface:ds,setSurfaceWorld:Ri,exitSurface:hs,setSurfaceMove:(e,s)=>{Ko=Math.min(1,Math.max(-1,e)),Ca=Math.min(1,Math.max(-1,s))},jumpSurface:()=>{xn=!0},setSurfaceMode:Vi,setSurfaceSkin:Wi,impactSurface:Ei,launchSurfaceRocket:ws,dropProbe:Fa,setTime:e=>{K=e===null,be=e??Date.now(),zn(be),_a=-1e9},setVoyage:e=>{if(O=e,!e){L&&(L=null,K=!0),jt=null;for(const k of J.values())k.line.geometry.setDrawRange(0,1/0);return}ke!=="system"&&jo("system"),jt=null;const s=J.get(e);s.line.geometry.setDrawRange(0,2),vt="system",Ut=null,Qt=null,Jt=!1,Nt=s.probe;const r=s.frame==="earth";Oe.radius=r?1.3:2.8,Ue.phi=r?.75:1;const d=Math.max(...s.marks.filter(k=>k.at!==void 0&&k.body!=="earth").map(k=>k.at),s.times[0]+864e5),S=s.times[0],z=s.times[s.times.length-1],F=(d-S)/(r?20:24),N=s.frame==="earth"?z:d+60*864e5,f=z>N?(z-N)/4/F:1;L={id:e,sim:S,base:F,fastFrom:N,fast:f,mark:-1,done:!1,lastPing:0,pace:"normal"},hn=performance.now()},dispose:()=>{na(),it?.dispose(),bn?.dispose(),ea?.dispose(),A&&(g.remove(A.group),A.dispose(),A=null),cancelAnimationFrame(Ia),Es.disconnect(),Ds.disconnect(),window.removeEventListener("keydown",Ps),window.removeEventListener("keyup",Cs),i.removeEventListener("pointerdown",Ss),i.removeEventListener("pointermove",Ts),i.removeEventListener("pointerup",Qo),i.removeEventListener("pointercancel",Qo),i.removeEventListener("wheel",ks),g.traverse(e=>{const s=e.material;Array.isArray(s)&&s.forEach(r=>r.dispose())}),P.forEach(e=>e.dispose()),l.dispose(),i.remove(),h.remove()}}}export{tl as createSpace};
