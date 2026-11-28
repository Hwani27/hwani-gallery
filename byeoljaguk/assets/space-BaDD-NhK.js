import{t as q,a as kr}from"./index-D1wJt4Zl.js";import{G as Le,a as O,f as Ae,M as he,g as Qe,A as Xe,D as at,V as W,R as vt,P as Mo,h as no,d as On,c as ao,S as so,b as X,i as en,j as gn,k as Zo,l as Ko,I as hn,m as Jo,n as Ta,O as wo,N as Ss,e as yn,o as Fa,p as Aa,q as zr,L as Pr,r as Tr,s as qs,t as xo,u as bo,v as Ca,w as Zs,x as Ar,T as Ks,y as Cr,z as Rr,F as Er,H as Ra,W as Nr,J as Dr,K as Ir,U as Fr,X as _r,Y as Wr,Z as ya,_ as Lr,$ as Ma,C as vo,a0 as ks,a1 as Ur,a2 as Gr,a3 as Vr,a4 as Br,a5 as Or,a6 as Xr,a7 as jr,a8 as zs,a9 as Ps,aa as Yr,ab as $r}from"./three-DV1D08k1.js";import{af as Hr,ag as Ts,ah as qr,ai as wa,aj as As,ak as Zr,al as Kr,am as go,C as Jr,an as Qr,ao as Lo,ap as ei}from"./App-DzmRxNAu.js";import{g as Js,U as Uo,V as ti}from"./audio-CAVuzncb.js";import{C as Cs}from"./sky-C_aA-h1V.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";const Rs=`
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
`,Go=3,xa=9;function ni(t){const n=new Le;n.visible=!1,n.rotation.z=.1;const o=new O(t(new Ae(1,48,32)),t(new he({color:"#000000"})));o.renderOrder=0,n.add(o);const s=t(new Qe({uniforms:{uTime:{value:0},uCam:{value:new W}},transparent:!0,depthWrite:!1,side:at,blending:Xe,vertexShader:`
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
        ${Rs}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${Go.toFixed(1)}) / ${(xa-Go).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${Go.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),c=new O(t(new vt(Go,xa,256,8)),s);c.rotation.x=-Math.PI/2,c.renderOrder=1,n.add(c);const y=t(new Qe({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:Xe,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${Rs}
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
      `})),r=new O(t(new Mo(8,8)),y);r.renderOrder=2,n.add(r);const h=[{name:q("궁수자리 A*"),at:new W(0,3.6,0)},{name:q("사건의 지평선"),at:new W(0,-2.9,0)},{name:q("강착 원반"),at:new W(xa-1.2,0,0)}],b=new W;return{group:n,labels:h,update(M,w){s.uniforms.uTime.value=M,y.uniforms.uTime.value=M,w.getWorldPosition(b),s.uniforms.uCam.value.copy(b),r.lookAt(b)}}}const yo=Math.PI/180;function Qt(t,n,o){return new W(Math.cos(n*yo)*Math.cos(t*yo),Math.sin(n*yo),-Math.cos(n*yo)*Math.sin(t*yo)).multiplyScalar(o)}function oi(){const n=document.createElement("canvas");n.width=64,n.height=64;const o=n.getContext("2d");if(o){const s=o.createRadialGradient(32,32,0,32,32,32);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.25,"rgba(255,255,255,0.75)"),s.addColorStop(1,"rgba(255,255,255,0)"),o.fillStyle=s,o.fillRect(0,0,64,64)}return new On(n)}function ai(){const t=[],n=M=>(t.push(M),M),o=n(oi());function s(M,w,k){const S=new ao(n(new so({map:o,color:new X(M),transparent:!0,depthWrite:!1,blending:Xe})));return S.scale.setScalar(w),S.position.copy(k),S}function c(M,w,k){const S=new Float32Array(M*3),l=new Float32Array(M*3);for(let u=0;u<M;u+=1){const[Y,C]=w(u);S.set([Y.x,Y.y,Y.z],u*3),l.set([C.r,C.g,C.b],u*3)}const A=n(new en);return A.setAttribute("position",new gn(S,3)),A.setAttribute("color",new gn(l,3)),new Zo(A,n(new Ko({size:k,map:o,vertexColors:!0,transparent:!0,depthWrite:!1,blending:Xe,sizeAttenuation:!0})))}let y=7;const r=()=>(y=y*16807%2147483647,(y-1)/2147483646),h={},b={};{const M=new Le,w=2.6,k=[["alphacen",q("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",q("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",q("바너드별"),269.45,4.69,5.96,"#ffb27a",q("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",q("울프 359"),164.12,7.01,7.86,"#ff9a6a",q("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",q("시리우스"),101.29,-16.72,8.6,"#cfe0ff",q("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",q("로스 154"),282.46,-23.84,9.69,"#ffa070",q("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",q("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",q("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",q("백조자리 61"),316.7,38.75,11.4,"#ffc58a",q("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",q("프로키온"),114.83,5.22,11.46,"#fff3d6",q("작은개자리의 밝은 별이에요.")],["epsind",q("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",q("남쪽 하늘의 가까운 별이에요.")],["taucet",q("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",q("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];M.add(s("#ffe39a",3.2,new W));const S=[{id:"sun-star",name:q("태양"),line:q("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new W}];for(const[l,A,u,Y,C,V,_]of k){const $=Qt(u,Y,C*w);M.add(s(V,2.4,$)),S.push({id:l,name:A,line:kr("{0} 거리 약 {1}광년.",_,C),position:$})}M.add(c(500,()=>[new W(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(60+r()*30),new X().setHSL(.1,.3,.5+r()*.4)],.9)),h.stars=M,b.stars=S}{const M=new Le,w=1/40,k=[["pleiades",q("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,q("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",q("베텔게우스"),88.79,7.41,548,"#ffab6e",3,q("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",q("리겔"),78.63,-8.2,860,"#cfe0ff",3,q("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",q("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,q("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",q("데네브"),310.36,45.28,2600,"#e6eeff",3,q("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];M.add(s("#ffe39a",1.6,new W));const S=[{id:"sun-orion",name:q("태양"),line:q("우리은하의 오리온 팔 안쪽에 있어요."),position:new W}];for(const[l,A,u,Y,C,V,_,$]of k){const pe=Qt(u,Y,C*w);M.add(s(V,_,pe)),l==="orionneb"&&M.add(c(260,()=>{const L=Math.pow(r(),.6)*5;return[new W(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(L).add(pe),new X(r()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),S.push({id:l,name:A,line:$,position:pe})}M.add(c(1400,()=>{const l=(r()-.5)*120,A=(r()-.5)*22*(.4+r()),u=(r()-.5)*4;return[new W(l,u,A),new X().setHSL(.6+r()*.1,.3,.35+r()*.3)]},.8)),h.orion=M,b.orion=S}{const M=new Le,w=4;M.add(c(9e3,S=>{const l=S%w,A=Math.pow(r(),.55)*25,u=l/w*Math.PI*2+Math.log(1+A)*1.9+(r()-.5)*(.5+4/(A+2)),Y=(r()-.5)*(A<4?2.2:.7),C=A<4,V=C?new X("#ffd9a0"):new X().setHSL(.58+r()*.06,.45,.45+r()*.35);return[new W(Math.cos(u)*A,Y,Math.sin(u)*A),V.multiplyScalar(C?.8:.6)]},.55)),M.add(s("#fff0c8",7,new W));const k=new W(13,0,0);M.add(s("#ffe39a",1.2,k)),h.galaxy=M,b.galaxy=[{id:"center",name:q("은하 중심(궁수자리 A*)"),line:q("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new W},{id:"sun-gal",name:q("태양은 여기"),line:q("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:k}]}{const M=new Le,w=1/1e5,k=(C,V,_,$,pe)=>c($,L=>{const ie=Math.pow(r(),.6)*V,Me=L%2*Math.PI+Math.log(1+ie*3)*2.2+(r()-.5)*.9,ce=new W(Math.cos(Me)*ie,(r()-.5)*V*.05,Math.sin(Me)*ie);ce.applyAxisAngle(new W(1,0,0),_);const N=ie<V*.18;return[ce.add(C),new X().setHSL(N?.1:pe,.4,.45+r()*.3).multiplyScalar(N?.35:.22)]},.4),S=new W;M.add(k(S,2.2,0,1800,.6));const l=Qt(10.68,41.27,25e5*w);M.add(k(l,4.4,1.2,3200,.1));const A=Qt(23.46,30.66,273e4*w);M.add(k(A,1.6,.6,900,.62));const u=Qt(80.89,-69.76,16e4*w);M.add(s("#cfd8ff",1.2,u));const Y=Qt(13.19,-72.83,2e5*w);M.add(s("#cfd8ff",.8,Y)),h.group=M,b.group=[{id:"mw",name:q("우리 은하"),line:q("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:S},{id:"andromeda",name:q("안드로메다은하"),line:q("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:l},{id:"triangulum",name:q("삼각형자리은하"),line:q("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:A},{id:"lmc",name:q("대마젤란은하"),line:q("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:u}]}{const M=new Le,w=6,k=(C,V,_)=>new W(C,V,_).multiplyScalar(w),S=k(5.1,.35,1.1),l=k(3.4,.45,.2),A=k(-1.4,-.3,-.5),u=[[k(.2,0,0),900,6.4*w*.5],[l,280,1.5*w*.5],[A,220,1.7*w*.5],[k(-2.2,1.6,2.4),120,1.1*w*.5]],Y=u.reduce((C,V)=>C+V[1],0);M.add(c(Y+180,C=>{let V=C;for(const[$,pe,L]of u){if(V<pe)return[new W(r()-.5,(r()-.5)*.5,r()-.5).multiplyScalar(2*L*Math.pow(r(),.5)).add($),new X("#f3eee6").multiplyScalar(.75)];V-=pe}const _=r();return[S.clone().lerp(A,_).add(new W((r()-.5)*.7*w,(r()-.5)*.45*w,(r()-.5)*.7*w)),new X("#e7c48a").multiplyScalar(.8)]},.5)),M.add(new O(n(new Ae(.95*w,20,16)),n(new he({color:"#d5e2f5",transparent:!0,opacity:.1,blending:Xe,depthWrite:!1}))).translateX(l.x).translateY(l.y).translateZ(l.z)),M.add(new O(n(new Ae(1.05*w,20,16)),n(new he({color:"#e7c48a",transparent:!0,opacity:.09,blending:Xe,depthWrite:!1}))).translateX(A.x).translateY(A.y).translateZ(A.z)),M.add(s("#e4b56a",1.2,S)),h.super=M,b.super=[{id:"localgroup",name:q("우리 은하군"),line:q("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:S},{id:"virgo-sc",name:q("처녀자리 은하단"),line:q("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:l},{id:"attractor-sc",name:q("거대 인력체"),line:q("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:A}]}{const M=new Le,w=1/1e7,k=Qt(187.7,12.4,54e6*w),S=Qt(243,-60,2e8*w);M.add(c(5e3,A=>{const u=A%5,C=[k,S,Qt(30,20,15e7*w),Qt(160,-30,18e7*w),Qt(300,40,14e7*w)][u],V=u===1?7:4;return[new W((r()-.5)*2,(r()-.5)*2,(r()-.5)*2).multiplyScalar(V*Math.pow(r(),.4)).add(C),new X().setHSL(.08+r()*.5,.35,.55).multiplyScalar(.8)]},.8)),M.add(s("#ffffff",.8,new W));const l=new O(n(new Ae(42,48,32)),n(new he({color:"#ff8a4a",transparent:!0,opacity:.08,side:no,depthWrite:!1})));M.add(l),h.cosmos=M,b.cosmos=[{id:"here",name:q("우리 은하"),line:q("여기서는 점 하나예요."),position:new W},{id:"virgo",name:q("처녀자리 은하단"),line:q("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:k},{id:"attractor",name:q("거대 인력체"),line:q("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:S},{id:"cmb",name:q("가장 오래된 빛"),line:q("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new W(0,0,-42)}]}for(const M of Object.values(h))M.visible=!1;return{groups:h,markers:b,dispose:()=>t.forEach(M=>M.dispose())}}const Vo=1.7,Es=t=>{const n=Math.min(1,Math.max(0,t));return n*n*(3-2*n)};function Ns(t){try{const n=navigator;typeof n.vibrate=="function"&&n.vibrate(t)}catch{}}function ba(t,n,o){const c=document.createElement("canvas");c.width=128,c.height=128;const y=c.getContext("2d"),r=y.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,t),r.addColorStop(.35,n),r.addColorStop(1,o),y.fillStyle=r,y.fillRect(0,0,128,128);const h=new On(c);return h.colorSpace=yn,h}function si(t){const n=new Le,o=(()=>{let Z=2654435769;return()=>(Z=Z*1664525+1013904223>>>0,Z/4294967296)})(),s=ba("rgba(255,255,255,1)","rgba(255,168,64,0.85)","rgba(255,90,0,0)"),c=ba("rgba(120,104,96,0.55)","rgba(70,60,56,0.35)","rgba(40,34,32,0)"),y=ba("rgba(255,255,255,1)","rgba(255,214,160,0.7)","rgba(255,140,40,0)"),r=[s,c,y],h=Z=>(r.push(Z),Z),b=new Le,M=new O(h(new hn(1,1)),h(new he({color:new X(2757128),fog:!1})));M.scale.setScalar(15),b.add(M);const w=new O(h(new hn(1,1)),h(new he({color:new X(16742946),transparent:!0,opacity:.85,blending:Xe,depthWrite:!1,fog:!1})));w.scale.setScalar(21),b.add(w);const k=(Z,H,G,ne=Xe)=>{const me=h(new so({map:Z,color:new X(H),transparent:!0,depthWrite:!1,blending:ne,fog:!1})),j=new ao(me);return j.scale.setScalar(G),j},S=k(y,16747050,150);b.add(S);const l=k(s,16765562,70);b.add(l),b.visible=!1,n.add(b);const A=[],u=96;for(let Z=0;Z<u;Z+=1){const H=Z%3===0,G=k(H?c:s,H?9074022:16747571,1,H?Ss:Xe);G.visible=!1,n.add(G),A.push({sprite:G,mat:G.material,life:0,max:1,from:1,to:1,rise:0,driftX:1,driftZ:1,spin:0,smoke:H})}let Y=0;const C=(Z,H,G,ne,me,j,I)=>{let ue=null;for(let Pt=0;Pt<A.length;Pt+=1){const yt=A[(Y+Pt)%A.length];if(yt.smoke===H&&(yt.life<=0||!ue)&&(ue=yt,Y=(Y+Pt+1)%A.length,yt.life<=0))break}ue&&(ue.sprite.position.copy(Z),ue.sprite.visible=!0,ue.life=ne,ue.max=ne,ue.from=G*.45,ue.to=G,ue.rise=me,ue.driftX=(o()-.5)*j,ue.driftZ=(o()-.5)*j,ue.spin=(o()-.5)*1.4,ue.sprite.material.rotation=o()*Math.PI*2,ue.mat.opacity=H?.46:.55,I!==void 0?ue.mat.color.setHex(I):ue.mat.color.setHex(H?7035474:16742946),ue.sprite.scale.setScalar(ue.from))},V=new O(h(new Ae(1,32,20)),h(new he({color:new X(16757575),transparent:!0,opacity:0,blending:Xe,depthWrite:!1,side:at,fog:!1})));V.visible=!1,n.add(V);const _=new O(h(new Ae(1,24,16)),h(new he({color:new X(16774872),transparent:!0,opacity:0,blending:Xe,depthWrite:!1,side:at,fog:!1})));_.visible=!1,n.add(_);const $=new O(h(new Ae(1,28,18)),h(new he({color:new X(16731410),transparent:!0,opacity:0,blending:Xe,depthWrite:!1,side:at,fog:!1})));$.visible=!1,n.add($);const pe=[],L=(Z,H,G,ne,me,j,I)=>{const ue=h(new he({color:new X(G),transparent:!0,opacity:ne,blending:Xe,depthWrite:!1,side:at,fog:!1})),Pt=h(new vt(Z,H,64,1)),yt=new O(Pt,ue);me&&(yt.rotation.x=-Math.PI/2),yt.visible=!1,n.add(yt);const ln={mesh:yt,mat:ue,grow:j,life:0,max:I,flat:me};return pe.push(ln),ln};L(.92,1,16742946,.9,!0,480,1.3),L(.9,1,16726538,.75,!0,620,1.9),L(.86,1,16765066,.7,!0,340,.9),L(.82,1,11569770,.5,!0,420,2.6),L(.95,1,16769712,.55,!1,700,1.6);const ie=220,Me=h(new en),ce=new Float32Array(ie*3),N=new Float32Array(ie*3);Me.setAttribute("position",new gn(ce,3));const se=h(new Ko({color:new X(16756832),size:2.4,transparent:!0,opacity:0,depthWrite:!1,blending:Xe,sizeAttenuation:!0,fog:!1})),Ce=new Zo(Me,se);Ce.frustumCulled=!1,Ce.visible=!1,n.add(Ce);const _e=150,we=new Jo(h(new hn(1,0)),h(new he({color:new X(16777215),transparent:!0,opacity:1,fog:!1})),_e);we.instanceMatrix.setUsage(Ta),we.frustumCulled=!1,we.visible=!1,n.add(we);const st=[];for(let Z=0;Z<_e;Z+=1)st.push({p:new W,v:new W,s:1,spin:new W,rot:new W});const D=new wo,ee=new Le;ee.visible=!1,n.add(ee);const ke=h(new he({color:new X(1773580),transparent:!0,opacity:0,depthWrite:!1,fog:!1}));ke.blending=Ss;const nt=h(new he({color:new X(3809818),transparent:!0,opacity:0,depthWrite:!1,fog:!1})),Se=h(new he({color:new X(16734738),transparent:!0,opacity:0,blending:Xe,depthWrite:!1,side:at,fog:!1})),de=h(new he({color:new X(16756832),transparent:!0,opacity:0,blending:Xe,depthWrite:!1,fog:!1})),ft=(Z,H,G,ne)=>{Z.rotateX(-Math.PI/2);const me=t.floorAt(H,G)-t.heightAt(H,G),j=Z.attributes.position;for(let I=0;I<j.count;I+=1){const ue=j.getX(I),Pt=j.getZ(I);j.setY(I,t.heightAt(H+ue,G+Pt)+me+ne)}return j.needsUpdate=!0,Z.computeVertexNormals(),Z};function gt(Z,H,G,ne){ee.clear();const me=ft(h(new vt(.01,ne*1.36,72,10)),Z,H,.35),j=new O(me,ke);j.position.set(Z,0,H),ee.add(j);const I=ft(h(new vt(ne*.95,ne*1.3,72,3)),Z,H,.5),ue=new O(I,nt);ue.position.set(Z,0,H),ee.add(ue);const Pt=ft(h(new vt(ne*.42,ne*1.1,72,6)),Z,H,.42),yt=new O(Pt,Se);yt.position.set(Z,0,H),ee.add(yt);const ln=ft(h(new vt(.01,ne*.45,72,5)),Z,H,.45),Yt=new O(ln,de);Yt.position.set(Z,0,H),ee.add(Yt),ee.visible=!0}let Re=-1,pt=-1,Xt=new W,le=new W,re=!1;function on(){for(const Z of A)Z.life=0,Z.sprite.visible=!1}function Gt(Z,H,G=0,ne=0){on();const me=t.floorAt(Z,H);le.set(Z,me,H);const j=G||0,I=ne||0;Xt.set(Z+j*900,me+520,H+I*900),b.visible=!0,b.position.copy(Xt),V.visible=!1,$.visible=!1;for(const ue of pe)ue.life=0,ue.mesh.visible=!1;we.visible=!1,Ce.visible=!1,se.opacity=0,re=!1,pt=-1,Re=0,Ns([30,90,40])}function jt(Z,H){if(!(Re<0)){if(Re+=H,!re&&Re>=Vo){re=!0,pt=Re,Ns([140,60,240,70,320,80,420,110,520,160,380]);const G=t.onScar?.(le.x,le.z)??26;t.onImpact?.(),gt(le.x,le.z,le.y,G),V.visible=!0,$.visible=!0,we.visible=!0,Ce.visible=!0,se.opacity=.95;for(const ne of pe)ne.life=ne.max,ne.mesh.visible=!0,ne.mesh.scale.setScalar(4),ne.mesh.position.set(le.x,le.y+(ne.flat?.6:2),le.z),ne.flat||ne.mesh.rotation.set(0,0,0);for(let ne=0;ne<_e;ne+=1){const me=st[ne],j=o()*Math.PI*2,I=6+o()*34;me.p.set(le.x+Math.cos(j)*I*.2,le.y+2+o()*8,le.z+Math.sin(j)*I*.2);const ue=28+o()*62;me.v.set(Math.cos(j)*ue,26+o()*70,Math.sin(j)*ue),me.s=.7+Math.pow(o(),2)*4.6,me.spin.set((o()-.5)*6,(o()-.5)*6,(o()-.5)*6),me.rot.set(o()*3,o()*3,o()*3)}we.material.opacity=1;for(let ne=0;ne<_e;ne+=1){const me=ne%3===0;we.setColorAt(ne,new X(me?16747066:ne%3===1?8010270:4860444))}we.instanceColor&&(we.instanceColor.needsUpdate=!0);for(let ne=0;ne<ie;ne+=1){const me=o()*Math.PI*2,j=Math.sqrt(o())*90;ce[ne*3]=le.x+Math.cos(me)*j,ce[ne*3+1]=le.y+20+o()*260,ce[ne*3+2]=le.z+Math.sin(me)*j,N[ne*3]=(o()-.5)*24,N[ne*3+1]=-(16+o()*34),N[ne*3+2]=(o()-.5)*24}Me.attributes.position.needsUpdate=!0}if(!re){const G=Math.min(1,Re/Vo),ne=Math.pow(G,2.15);b.position.lerpVectors(Xt,le,ne);const me=(1-ne)*40;b.position.x+=Math.sin(Re*9.1)*me,b.position.z+=Math.cos(Re*7.3)*me,b.rotation.x+=H*2.2,b.rotation.y+=H*1.4,S.scale.setScalar(150+Math.sin(Re*20)*26),l.scale.setScalar(70+Math.sin(Re*26)*14);for(let j=0;j<2;j+=1){const I=b.position.clone();I.x+=(o()-.5)*26,I.y+=(o()-.5)*26,I.z+=(o()-.5)*26,C(I,!1,90+o()*60,.9+o()*.5,6,18)}C(b.position.clone(),!0,150+o()*90,1.8+o()*.8,12,26)}for(const G of A){if(G.life<=0)continue;if(G.life-=H,G.life<=0){G.sprite.visible=!1;continue}const ne=1-G.life/G.max,me=G.from+(G.to-G.from)*Math.sqrt(ne);G.sprite.scale.setScalar(me),G.sprite.position.y+=G.rise*H*(1-ne),G.sprite.position.x+=G.driftX*H,G.sprite.position.z+=G.driftZ*H,G.sprite.material.rotation+=G.spin*H;const j=G.smoke?Math.pow(1-ne,1.8)*.46:Math.pow(1-ne,1.3)*.55;G.mat.opacity=j}if(re){const G=Re-pt,ne=(j,I,ue)=>j+(I-j)*Es(G/ue);V.scale.setScalar(ne(2,46,.85)),V.material.opacity=Math.max(0,1-G/1.9)*.95,_.scale.setScalar(ne(1,24,.4)),_.material.opacity=Math.max(0,1-G/.5),V.position.set(le.x,le.y+8,le.z),_.position.set(le.x,le.y+10,le.z),$.scale.setScalar(ne(3,34,1)),$.material.opacity=Math.max(0,.6-G/1.3*.6),$.position.set(le.x,le.y+4,le.z);for(const j of pe){if(j.life<=0)continue;if(j.life-=H,j.life<=0){j.mesh.visible=!1;continue}const I=1-j.life/j.max;j.mesh.scale.setScalar(4+j.grow*Math.pow(I,.6)),j.mat.opacity=Math.max(0,(1-I)*(j.flat?.85:.6))}if(G<1.8&&G%.085<H){const j=new W(le.x+(o()-.5)*18,le.y+3+o()*6,le.z+(o()-.5)*18);o()<.65&&C(j,!1,76+o()*56,1.4+o()*.7,14+o()*12,20,16761962),C(j,!0,60+o()*46,1.8+o()*.8,12+o()*10,26,11573898)}if(G<1.7&&G%.05<H){const j=o()*Math.PI*2,I=26+G*46+o()*22,ue=new W(le.x+Math.cos(j)*I,le.y+2+o()*12,le.z+Math.sin(j)*I);C(ue,!0,50+o()*40,1.6,7,14,11573376),o()<.55&&C(ue,!1,70+o()*60,1.3,10,10,16751164)}if(G>.4&&G<2.8&&G%.11<H){const j=o()*Math.PI*2,I=16+o()*46,ue=new W(le.x+Math.cos(j)*I,le.y+34+o()*30,le.z+Math.sin(j)*I);C(ue,!0,70+o()*52,2,8,24,10520692)}const me=we.material;if(me.opacity=Math.max(0,1-Math.max(0,G-3.4)/1.2),me.opacity<=.01)we.visible=!1;else{for(let j=0;j<_e;j+=1){const I=st[j];I.v.y-=9.81*.55*H,I.v.multiplyScalar(1-H*.12),I.p.addScaledVector(I.v,H);const ue=t.floorAt(I.p.x,I.p.z)+I.s*.4;I.p.y<ue&&(I.p.y=ue,I.v.y=Math.abs(I.v.y)*.32,I.v.x*=.7,I.v.z*=.7),I.rot.x+=I.spin.x*H,I.rot.y+=I.spin.y*H,I.rot.z+=I.spin.z*H,D.position.copy(I.p),D.rotation.set(I.rot.x,I.rot.y,I.rot.z),D.scale.setScalar(I.s),D.updateMatrix(),we.setMatrixAt(j,D.matrix)}we.instanceMatrix.needsUpdate=!0}if(Ce.visible)if(se.opacity=Math.max(0,.95-Math.max(0,G-4)/1.6),se.opacity<=.01)Ce.visible=!1;else{for(let j=0;j<ie;j+=1){const I=j*3;ce[I]+=N[I]*H,ce[I+1]+=N[I+1]*H,ce[I+2]+=N[I+2]*H,N[I+1]-=5*H;const ue=t.floorAt(ce[I],ce[I+2])+.4;ce[I+1]<ue&&(ce[I]=le.x+(o()-.5)*160,ce[I+1]=le.y+120+o()*160,ce[I+2]=le.z+(o()-.5)*160,N[I]=(o()-.5)*20,N[I+1]=-(14+o()*26),N[I+2]=(o()-.5)*20)}Me.attributes.position.needsUpdate=!0}ke.opacity=Math.min(.42,G*1.1),nt.opacity=Math.min(.4,G*1.1),Se.opacity=Math.max(0,.85*Math.exp(-G/5.5)),de.opacity=Math.max(0,.9*Math.exp(-G/1.8))}if(re&&(b.visible=!1),Re>80){Re=-1,pt=-1,b.visible=!1,V.visible=!1,_.visible=!1,$.visible=!1,ee.visible=!1;for(const G of A)G.life=0,G.sprite.visible=!1;for(const G of pe)G.life=0,G.mesh.visible=!1;we.visible=!1,Ce.visible=!1}}}return{group:n,strike:Gt,doom:()=>{if(Re<0)return 0;if(!re)return Math.min(1,Es(Re/(Vo*.82))*(.93+.07*Math.sin(Re*12)));const Z=Re-pt;return Z<1.8?1:Math.max(0,1-(Z-1.8)/20)},flash:()=>{if(!re)return 0;const Z=Re-pt,H=Math.exp(-Z/.16),G=Z>.35?.5*Math.exp(-(Z-.35)/.3):0;return Math.min(1,H+G)},shake:()=>{if(Re<0)return 0;if(!re)return .02+Math.pow(Re/Vo,3)*.18;const Z=Re-pt;if(Z>3.6)return 0;let H=1.55*Math.exp(-Z/1.35);return H+=.55*Math.exp(-Math.pow((Z-1.55)/.22,2)),H+=.32*Math.exp(-Math.pow((Z-2.35)/.26,2)),H+=.18*Math.exp(-Math.pow((Z-3)/.3,2)),H*Math.min(1,Z/.06)},sinceImpact:()=>pt>=0?Re-pt:-1,stats:()=>{const Z=A.filter(G=>G.life>0),H=Z[0];return{t:Number(Re.toFixed(2)),target:[Number(le.x.toFixed(1)),Number(le.y.toFixed(1)),Number(le.z.toFixed(1))],start:[Number(Xt.x.toFixed(1)),Number(Xt.z.toFixed(1))],alive:Z.length,map:H?!!H.mat.map:null,op:H?Number(H.mat.opacity.toFixed(2)):null,sc:H?Number(H.sprite.scale.x.toFixed(1)):null,pos:H?H.sprite.position.toArray().map(G=>Number(G.toFixed(1))):null,vis:H?H.sprite.visible:null,fire:[Number(V.material.opacity.toFixed(2)),Number(V.scale.x.toFixed(0)),V.visible],crater:[ee.visible,ee.children.length,Number(ke.opacity.toFixed(2)),Number(Se.opacity.toFixed(2))]}},update:jt,dispose:()=>{n.clear(),r.forEach(Z=>Z.dispose())}}}const ri=`
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
`,ii=`
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
`,ci=`
uniform float uTile;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vUv = wp.xz / uTile;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,li=`
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
`,Ds=`
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
`,Is=`
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
`,eo=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Sa=`
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
`,Bo=`
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
`,Ot=Math.PI*2,Qs=9,Fs=140;function tn(t){return t<0?0:t>1?1:t}function $o(t,n,o){return t<n?n:t>o?o:t}function Mn(t,n,o){const s=tn((o-t)/(n-t));return s*s*(3-2*s)}function Tn(t,n,o){let s=Math.imul(t|0,374761393)^Math.imul(n|0,668265263)^Math.imul(o|0,2246822519);return s=Math.imul(s^s>>>13,1274126177),((s^s>>>16)>>>0)/4294967295}function ui(t,n,o,s){const c=Math.floor(t),y=Math.floor(n),r=t-c,h=n-y,b=r*r*(3-2*r),M=h*h*(3-2*h),w=Math.max(1,Math.round(o)),k=$=>($%w+w)%w,S=k(c),l=k(c+1),A=k(y),u=k(y+1),Y=Tn(S,A,s),C=Tn(l,A,s),V=Tn(S,u,s),_=Tn(l,u,s);return(Y+(C-Y)*b)*(1-M)+(V+(_-V)*b)*M}function nn(t,n,o,s,c){let y=0,r=.5,h=0,b=o;for(let M=0;M<s;M+=1)y+=r*ui(t*b,n*b,b,c+M*17),h+=r,r*=.5,b*=2;return y/h}function er(t){let n=t>>>0||1;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function ro(t,n){const o=document.createElement("canvas");o.width=t,o.height=n;const s=o.getContext("2d");if(!s)throw new Error("2D canvas is unavailable");return{canvas:o,ctx:s}}const fi={crater:{seed:101,macro:.38,mid:.17,fine:.12,speck:.15,craters:20,stones:90,cracks:0,ripples:0,gloss:.02},rock:{seed:211,macro:.4,mid:.22,fine:.14,speck:.2,craters:5,stones:150,cracks:9,ripples:1,gloss:.05},volcano:{seed:331,macro:.32,mid:.24,fine:.16,speck:.22,craters:4,stones:110,cracks:14,ripples:0,gloss:.08},ice:{seed:401,macro:.26,mid:.2,fine:.2,speck:.16,craters:5,stones:18,cracks:22,ripples:0,gloss:.5},plain:{seed:509,macro:.3,mid:.15,fine:.1,speck:.13,craters:8,stones:70,cracks:3,ripples:.35,gloss:.03},plasma:{seed:601,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0},ring:{seed:701,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0}};function Ho(t,n,o,s,c,y,r,h,b=!1){const M=Math.ceil(y),w=Math.round(s),k=Math.round(c);for(let S=-M;S<=M;S+=1)for(let l=-M;l<=M;l+=1){const A=(l*l+S*S)/(y*y);if(A>=1)continue;const u=b?Math.sqrt(1-A):1-A,Y=((w+l)%o+o)%o,V=((k+S)%o+o)%o*o+Y;t[V]+=r*u,n[V]+=h*u}}function pi(t,n,o,s,c,y,r){const h=.09+r()*.12,b=.05+r()*.06,M=.72+r()*.5,w=r()*Math.PI,k=Math.cos(w),S=Math.sin(w),l=Math.ceil(y*1.4),A=Math.round(s),u=Math.round(c);for(let Y=-l;Y<=l;Y+=1)for(let C=-l;C<=l;C+=1){const V=(C*k+Y*S)/y,_=(-C*S+Y*k)/(y*M),$=Math.sqrt(V*V+_*_);if($>1.4)continue;let pe=0,L=0;$<1&&(pe-=Math.pow(1-$*$,1.25)*h,L-=(1-$)*.05);const ie=Math.exp(-Math.pow(($-1.02)/.2,2))*b;pe+=ie,L+=ie*1.1+($>1&&$<1.35?.02:0);const Me=((A+C)%o+o)%o,N=((u+Y)%o+o)%o*o+Me;n[N]+=pe,t[N]+=L}}function ka(t,n,o,s,c,y,r,h,b,M){const k=Math.max(2,Math.floor(r/1.1));let S=y,l=s,A=c;for(let u=0;u<k;u+=1){S+=(b()-.5)*.3,l+=Math.cos(S)*1.1,A+=Math.sin(S)*1.1;const Y=h*(.6+b()*.8);M?(Ho(t,n,o,l,A,Y*2.2,.03,.008),Ho(t,n,o,l,A,Y,-.05,-.03)):Ho(t,n,o,l,A,Y,-.07,-.03)}}function mi(t,n){const o=fi[t],s=er(o.seed),c=n/Qs,y=new Float32Array(n*n),r=new Float32Array(n*n),h=new Float32Array(n*n),b=7;for(let l=0;l<n;l+=1){const A=l/n;for(let u=0;u<n;u+=1){const Y=u/n,C=l*n+u,V=nn(Y,A,3,4,o.seed),_=nn(Y,A,11,3,o.seed+13),$=nn(Y,A,43,2,o.seed+29),pe=Tn(u,l,o.seed+71)-.5;let L=1+(V-.5)*o.macro+(_-.5)*o.mid+($-.5)*o.fine+pe*o.speck,ie=.5+(V-.5)*.06+(_-.5)*.07+($-.5)*.08+pe*.03,Me=o.gloss;if(o.ripples>0){const ce=A*b+(V-.5)*.85+(_-.5)*.3,N=Math.sin(ce*Ot);L+=N*.055*o.ripples,ie+=N*.018*o.ripples}if(t==="volcano"){const ce=1-Math.abs(2*$-1);ce>.94?(L+=(ce-.94)*2.2,ie-=.02,Me+=.1):ce<.22&&(L-=(.22-ce)*.6)}t==="ice"&&(Math.abs(_-.5)<.012&&(L-=.24,ie-=.035),L=.82+(L-1)*.95+($-.5)*.12,Me=tn(.35+$*.55)),(t==="crater"||t==="ring")&&V<.34&&(L-=(.34-V)*1.1),t==="plain"&&(L+=Mn(.55,.78,V)*.18),y[C]=L,r[C]=ie,h[C]=Me}}for(let l=0;l<o.craters;l+=1){const A=(.3+Math.pow(s(),1.7)*1.1)*c;pi(y,r,n,s()*n,s()*n,A,s)}for(let l=0;l<o.stones;l+=1){const u=(s()<.18?.14+s()*.3:.03+s()*.09)*c,Y=l%3===0?.12:-.08;Ho(y,r,n,s()*n,s()*n,Math.max(.8,u),Y,.02+u*.0012,!0)}for(let l=0;l<o.cracks;l+=1){const A=s()*n,u=s()*n,Y=(.6+s()*3.4)*c;ka(y,r,n,A,u,s()*Ot,Y,.8+s()*1.4,s,t==="ice")}if(t==="ice"){const l=()=>.5;for(let A=0;A<11;A+=1){const u=s()*Ot,Y=n*(.45+s()*.75),C=s()*n,V=s()*n;ka(y,r,n,C-Math.cos(u)*Y*.5,V-Math.sin(u)*Y*.5,u,Y,1+s()*1.4,l,!0)}for(let A=0;A<10;A+=1){const u=s()*n,Y=s()*n,C=s()*Ot;ka(y,r,n,u,Y,C,(.4+s()*1.6)*c,.8+s(),s,!0)}}const{canvas:M,ctx:w}=ro(n,n),k=w.createImageData(n,n),S=k.data;for(let l=0;l<n*n;l+=1)S[l*4]=Math.round($o(y[l]*.5,0,1)*255),S[l*4+1]=Math.round($o(r[l],0,1)*255),S[l*4+2]=Math.round($o(h[l],0,1)*255),S[l*4+3]=255;return w.putImageData(k,0,0),M}function Oe(t){const n=parseInt(t.replace("#",""),16);return[n>>16&255,n>>8&255,n&255]}function Ut(t,n,o){return[t[0]+(n[0]-t[0])*o,t[1]+(n[1]-t[1])*o,t[2]+(n[2]-t[2])*o]}function di(t,n,o){const s=t*n,c=Math.floor(s),y=s-c,r=k=>{const S=(k%2+2)%2===0,l=Tn(k,7,o);return S?.56+.4*l:.04+.3*l},h=r(c),b=r(c-1),M=r(c+1),w=.44;return y<w?b+(h-b)*Mn(0,1,y/w):y>1-w?h+(M-h)*Mn(0,1,(y-(1-w))/w):h}const Ea={jupiter:{bands:16,seed:3301,streaky:.8,polar:null,spots:[{u:.62,v:.66,ru:.085,rv:.05,color:Oe("#a8492f"),swirl:2},{u:.24,v:.34,ru:.05,rv:.026,color:Oe("#f6efdd"),swirl:0},{u:.46,v:.4,ru:.035,rv:.02,color:Oe("#fbf3e1"),swirl:0},{u:.83,v:.44,ru:.03,rv:.018,color:Oe("#f4ecd9"),swirl:0},{u:.36,v:.74,ru:.06,rv:.03,color:Oe("#8d4b30"),swirl:0}]},saturn:{bands:20,seed:3307,streaky:.38,polar:Oe("#c9d4d8"),spots:[{u:.7,v:.3,ru:.04,rv:.02,color:Oe("#f7edd2"),swirl:0},{u:.3,v:.72,ru:.035,rv:.018,color:Oe("#e6d3a4"),swirl:0}]},uranus:{bands:7,seed:3313,streaky:.25,polar:Oe("#e6fbfd"),spots:[{u:.55,v:.36,ru:.06,rv:.03,color:Oe("#dcf4f6"),swirl:0}]},neptune:{bands:9,seed:3319,streaky:.5,polar:Oe("#a9c8f2"),spots:[{u:.34,v:.62,ru:.06,rv:.032,color:Oe("#1f3a72"),swirl:1},{u:.72,v:.46,ru:.05,rv:.012,color:Oe("#e9f3ff"),swirl:0},{u:.62,v:.36,ru:.035,rv:.009,color:Oe("#f2f8ff"),swirl:0}]}};function hi(t,n,o,s=2){const c=new Uint8ClampedArray(t.length);for(let y=0;y<s;y+=1){for(let r=0;r<o;r+=1)for(let h=0;h<n;h+=1){const b=(h-1+n)%n*4,M=h*4,w=(h+1)%n*4,k=r*n*4;for(let S=0;S<3;S+=1)c[k+M+S]=(t[k+b+S]+t[k+M+S]*2+t[k+w+S])/4}for(let r=0;r<o;r+=1){const h=(r-1+o)%o*n*4,b=r*n*4,M=(r+1)%o*n*4;for(let w=0;w<n;w+=1){const k=w*4;for(let S=0;S<3;S+=1)t[b+k+S]=(c[h+k+S]+c[b+k+S]*2+c[M+k+S])/4}}}}function tr(t,n,o){const s=Ea[t.id]??Ea.jupiter,c=Oe(t.ground),y=Oe(t.ground2),r=Oe(t.ground3),{canvas:h,ctx:b}=ro(n,o),M=b.createImageData(n,o),w=M.data,k=s.seed,S=new Float32Array(n*o),l=new Float32Array(n*o);for(let C=0;C<o;C+=1){const V=C/o;for(let _=0;_<n;_+=1){const $=_/n,pe=(nn($,V,4,3,k)-.5)*.03+(nn($,V,13,2,k+7)-.5)*.005,L=tn(V+pe);let ie=di(L,s.bands,k);const Me=nn($*3,V*9,9,3,k+31)-.5;ie+=Me*.13*s.streaky;let ce;if(ie<.5?ce=Ut(r,y,tn(ie*2)):ce=Ut(y,c,tn((ie-.5)*2)),s.polar){const se=Mn(.82,1,Math.abs(V-.5)*2);ce=Ut(ce,s.polar,se*.45)}for(const se of s.spots){const Ce=($-se.u)/se.ru,_e=(V-se.v)/se.rv,we=Ce*Ce+_e*_e;if(we<2.2){const st=Mn(1.05,.25,we),D=se.swirl>0?.82+.18*Math.sin(Math.atan2(_e,Ce)*3+we*7):1;ce=Ut(ce,[se.color[0]*D,se.color[1]*D,se.color[2]*D],st*.92)}}const N=(C*n+_)*4;w[N]=ce[0],w[N+1]=ce[1],w[N+2]=ce[2],w[N+3]=255,S[C*n+_]=tn(.5+Me*.85+(ie-.5)*.5),l[C*n+_]=.5+Me*.85}}const A=t.sunAz*Math.PI/180,u=Math.sin(A),Y=-Math.cos(A);for(let C=0;C<o;C+=1){const V=(C+1)%o,_=(C-1+o)%o;for(let $=0;$<n;$+=1){const pe=($+1)%n,L=($-1+n)%n,ie=l[C*n+pe]-l[C*n+L],Me=l[V*n+$]-l[_*n+$],ce=$o(1+(ie*u+Me*Y)*1.8,.9,1.1),N=(C*n+$)*4;w[N]=Math.min(255,w[N]*ce),w[N+1]=Math.min(255,w[N+1]*ce),w[N+2]=Math.min(255,w[N+2]*ce),w[N+3]=Math.round(tn(.74+S[C*n+$]*.4)*255)}}return hi(w,n,o,2),b.putImageData(M,0,0),h}function vi(t,n){if(Ea[t.id])return tr(t,n,n);const{canvas:o,ctx:s}=ro(n,n),c=s.createImageData(n,n),y=c.data,r=Oe(t.ground),h=Oe(t.ground2),b=Oe(t.ground3);for(let M=0;M<n;M+=1){const w=M/n;for(let k=0;k<n;k+=1){const S=k/n,l=nn(S,w,4,4,9021),A=nn(S,w,16,3,9027),u=tn(l*.72+A*.4);let Y=Ut(h,r,Mn(.25,.72,u));Y=Ut(Y,b,Mn(.66,.95,u)*.8);const C=(M*n+k)*4;y[C]=Y[0],y[C+1]=Y[1],y[C+2]=Y[2],y[C+3]=255}}return s.putImageData(c,0,0),o}function gi(t,n,o){const{canvas:s,ctx:c}=ro(n,o),y=er(t==="moon"?51:t==="pluto"?67:83),r=t==="pluto"?"#cbb6a4":t==="charon"?"#9d9a95":"#9a9691";if(c.fillStyle=r,c.fillRect(0,0,n,o),t==="pluto")c.fillStyle="#f3ece1",c.beginPath(),c.ellipse(n*.56,o*.46,n*.13,o*.16,-.2,0,Ot),c.fill(),c.beginPath(),c.ellipse(n*.72,o*.4,n*.07,o*.12,.35,0,Ot),c.fill(),c.fillStyle="rgba(96,68,54,0.62)",c.beginPath(),c.ellipse(n*.24,o*.6,n*.2,o*.13,.1,0,Ot),c.fill(),c.beginPath(),c.ellipse(n*.2,o*.32,n*.14,o*.1,-.2,0,Ot),c.fill();else if(t==="moon")for(let h=0;h<9;h+=1)c.fillStyle=`rgba(58,56,54,${.5+y()*.3})`,c.beginPath(),c.ellipse(y()*n,(.18+y()*.6)*o,(.04+y()*.07)*n,(.03+y()*.06)*o,y()*3,0,Ot),c.fill();else c.fillStyle="rgba(120,84,70,0.6)",c.beginPath(),c.ellipse(n*.5,o*.06,n*.4,o*.09,0,0,Ot),c.fill();for(let h=0;h<220;h+=1){const b=(2+Math.pow(y(),2.4)*26)*(n/1024),M=y()*n,w=y()*o,k=c.createRadialGradient(M,w,0,M,w,b);k.addColorStop(0,"rgba(38,36,34,0.5)"),k.addColorStop(.72,"rgba(70,66,62,0.28)"),k.addColorStop(.9,"rgba(238,233,224,0.32)"),k.addColorStop(1,"rgba(255,255,255,0)"),c.fillStyle=k,c.beginPath(),c.arc(M,w,b,0,Ot),c.fill()}for(let h=0;h<2600;h+=1){const b=(.6+Math.pow(y(),3)*4)*(n/1024);c.fillStyle=y()<.5?"rgba(255,255,255,0.16)":"rgba(30,28,26,0.16)",c.beginPath(),c.arc(y()*n,y()*o,b,0,Ot),c.fill()}return s}function yi(t,n){const{canvas:o,ctx:s}=ro(t,n),c=s.createImageData(t,n),y=c.data,r=Oe("#0f3f74"),h=Oe("#2f8fb0"),b=Oe("#3f7a45"),M=Oe("#9a8a55"),w=Oe("#f2f7fc");for(let k=0;k<n;k+=1){const S=k/n;for(let l=0;l<t;l+=1){const A=l/t,u=A*3.1,Y=S*2.4,C=nn(u,Y,4,5,4404)+(nn(u*3,Y*3,12,3,4411)-.5)*.18,V=C>.55;let _;if(V){const Me=tn((C-.55)*4.2);_=Ut(b,M,Me*.7),Me>.55&&(_=Ut(_,Oe("#cfc9bb"),(Me-.55)*1.6))}else _=Ut(r,h,tn((C-.35)*3.2));const $=Mn(.86,.98,Math.abs(S-.5)*2);$>0&&(_=Ut(_,w,$));const pe=nn(A*2,S*6,12,4,4423),L=Mn(.56,.82,pe)*.72;L>0&&(_=Ut(_,Oe("#fbfdff"),L));const ie=(k*t+l)*4;y[ie]=_[0],y[ie+1]=_[1],y[ie+2]=_[2],y[ie+3]=255}}return s.putImageData(c,0,0),o}function Mi(t,n,o,s){if(t==="earth")return yi(o,s);if(t==="moon"||t==="pluto"||t==="charon")return gi(t,o,s);const c=t==="saturn"?{...n,id:"saturn",ground:"#f2e2ba",ground2:"#c6a978",ground3:"#9b7f52"}:{...n,id:"jupiter",ground:"#e9d6b4",ground2:"#b57d50",ground3:"#8b5a38"};return tr(c,o,s)}function wi(t){const{canvas:o,ctx:s}=ro(t,4),c=s.createImageData(t,4),y=c.data,r=1.11,h=2.36,b=Oe("#f6efdd"),M=Oe("#c9b48d"),w=Oe("#6f6455"),k=[[1.11,1.235,.1,.15],[1.235,1.525,.42,.3],[1.525,1.95,.98,.62],[1.951,2.025,.06,.1],[2.025,2.21,.72,.5],[2.211,2.215,.04,.1],[2.215,2.27,.66,.46],[2.27,2.31,.06,.1],[2.315,2.34,.34,.55]];for(let S=0;S<t;S+=1){const l=S/(t-1),A=r+(h-r)*l;let u=0,Y=.5;for(const[pe,L,ie,Me]of k)if(A>=pe&&A<=L){u=ie,Y=Me,u*=.82+.18*Math.sin((A-pe)*820+Math.sin((A-pe)*140)*2);break}const C=[1.29,1.44,1.63,1.72,1.88,2.06,2.15,2.24,2.29];for(const pe of C)Math.abs(A-pe)<.0035&&(u*=.12);u*=.9+.14*Tn(Math.floor(A*900),3,9931);const V=Tn(Math.floor(S/2),7,9931);let _=Ut(M,b,Y);_=Ut(_,w,(1-Math.min(1,u))*.35);const $=.82+V*.3;for(let pe=0;pe<4;pe+=1){const L=(pe*t+S)*4;y[L]=_[0]*$,y[L+1]=_[1]*$,y[L+2]=_[2]*$,y[L+3]=Math.round(tn(u)*255)}}return s.putImageData(c,0,0),o}const vn=new Map;function Qo(t,n,o,s,c,y){const r=new On(n);for(r.colorSpace=o?yn:Fa,r.wrapS=s?Aa:zr,r.wrapT=r.wrapS,r.anisotropy=c,r.magFilter=Pr,r.minFilter=Tr,r.generateMipmaps=!0,r.needsUpdate=!0,vn.set(t,r);vn.size>y;){const h=vn.keys().next();if(h.done)break;const b=vn.get(h.value);vn.delete(h.value),b?.dispose()}return r}function xi(t,n,o){const s=`ground:${t}:${n?"l":"h"}`,c=vn.get(s);return c||Qo(s,mi(t,n?320:512),!1,!0,o,6)}function bi(t,n,o){const s=`cloud:${t.id}:${n?"l":"h"}`,c=vn.get(s);return c||Qo(s,vi(t,n?512:1024),!0,!0,o,4)}function _s(t,n,o,s){const y=`body:${t??n.id}:${o?"l":"h"}`,r=vn.get(y);if(r)return r;const h=o?768:1024;return Qo(y,Mi(t,n,h,h/2),!0,!1,s,3)}function za(t,n){const o=`ring:${t?"l":"h"}`,s=vn.get(o);return s||Qo(o,wi(t?1024:2048),!0,!1,n,2)}const oo=Math.PI/180,dn=1500,Oo=2800,Ws=-4.3;function Xo(t,n){const o=Math.sin(t*127.1+n*311.7)*43758.5453;return o-Math.floor(o)}function Na(t){return t*t*(3-2*t)}function Si(t,n){const o=Math.floor(t),s=Math.floor(n),c=t-o,y=n-s,r=Xo(o,s),h=Xo(o+1,s),b=Xo(o,s+1),M=Xo(o+1,s+1),w=Na(c),k=Na(y);return(r*(1-w)+h*w)*(1-k)+(b*(1-w)+M*w)*k}function jo(t,n,o=4){let s=0,c=.5,y=1;for(let r=0;r<o;r+=1)s+=c*Si(t*y,n*y),y*=2.03,c*=.5;return s}function to(t){let n=t>>>0||1;return()=>(n=n*1664525+1013904223>>>0,n/4294967296)}function ki(t){let n=2166136261;for(let o=0;o<t.length;o+=1)n=Math.imul(n^t.charCodeAt(o),16777619);return n>>>0}function Pa(t,n){const o=t*oo,s=n*oo;return new W(Math.sin(o)*Math.cos(s),Math.sin(s),-Math.cos(o)*Math.cos(s)).normalize()}function zi(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d"),s=o.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.25,"rgba(255,236,196,0.72)"),s.addColorStop(.6,"rgba(255,190,110,0.18)"),s.addColorStop(1,"rgba(255,170,80,0)"),o.fillStyle=s,o.fillRect(0,0,128,128);const c=new On(n);return c.colorSpace=yn,c}const Pi=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ti=`
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
`,Ai=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ci=`
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
`,Ri=8,Ei=.55,Ls=.34;function Ni(t,n={}){const o=!!n.low,s=n.anisotropy??(o?4:8),c=new Le,y=[],r=m=>(y.push(m),m);let h=null,b=null;const M=ki(t.id),w=to(M),k=r(zi()),S=[],l=[];let A=null,u=null,Y=null;const C=[],V=[];if(t.terrain==="crater"){for(let m=0;m<(o?16:26);m+=1){const f=w()*Math.PI*2,P=20+Math.sqrt(w())*460,g=16+w()*74;C.push({x:Math.cos(f)*P,z:Math.sin(f)*P,r:g,d:g*(.16+w()*.2)})}for(let m=0;m<(o?26:48);m+=1){const f=w()*Math.PI*2,P=4+Math.pow(w(),.7)*150,g=2.5+Math.pow(w(),1.6)*11;C.push({x:Math.cos(f)*P,z:Math.sin(f)*P,r:g,d:g*(.2+w()*.22)})}}if(t.terrain==="volcano")for(let m=0;m<6;m+=1){const f=w()*Math.PI*2,P=60+w()*380;V.push({x:Math.cos(f)*P,z:Math.sin(f)*P,r:40+w()*90,h:12+w()*34})}if(t.terrain==="rock")for(let m=0;m<5;m+=1){const f=w()*Math.PI*2,P=60+w()*400;V.push({x:Math.cos(f)*P,z:Math.sin(f)*P,r:50+w()*110,h:6+w()*16})}function _(m,f,P,g=4){return(jo(m*P,f*P,g)-.48)*2}function $(m,f){if(t.terrain==="plasma"||t.terrain==="ring")return 0;const P=Math.hypot(m,f);let g=0;if(t.terrain==="crater"){g=_(m+11,f+7,.004,4)*16+_(m+3,f+17,.0012,2)*34+_(m+5,f+23,.026,3)*3;for(const ae of C){const te=Math.hypot(m-ae.x,f-ae.z)/ae.r;te<1&&(g-=ae.d*Math.pow(1-te*te,1.5)),te<1.3&&(g+=ae.d*.28*Math.exp(-Math.pow((te-1.02)/.17,2)))}}else if(t.terrain==="rock"){g=_(m+5,f+2,.0035,4)*40,g+=(1-Math.abs(_(m,f,.011,3)))*12,g+=_(m+21,f+13,.0011,2)*60,g+=_(m+31,f+41,.028,3)*3.4;for(const ae of V){const te=Math.hypot(m-ae.x,f-ae.z)/ae.r;te<1&&(g+=ae.h*Math.pow(1-te,1.7))}}else if(t.terrain==="volcano"){g=_(m+3,f+8,.005,4)*14+_(m+9,f+1,.0012,2)*22;for(const ae of V){const te=Math.hypot(m-ae.x,f-ae.z)/ae.r;te<1&&(g+=ae.h*Math.pow(1-te,1.25)),te<.24&&(g-=ae.h*.5*(1-te/.24))}}else t.terrain==="ice"?g=_(m+9,f+4,.003,4)*9+_(m,f,.012,2)*2.2+_(m+2,f+8,.035,3)*1.1:g=_(m+7,f+3,.0035,4)*12+_(m,f,.012,2)*2.6+_(m+4,f+2,.03,3)*3;const v=Math.max(0,P-1500)/500;g-=v*v*5;let K=0,R=0;for(const ae of S){const te=Math.hypot(m-ae.x,f-ae.z)/ae.r;te<1&&(K=Math.max(K,ae.d*Math.pow(1-te*te,1.55))),te<1.45&&(R=Math.max(R,ae.d*.3*Math.exp(-Math.pow((te-1.02)/.16,2))))}return g-=K,g+=R,g+=(jo(m*.09+1,f*.09+6,2)-.5)*(t.terrain==="rock"?1.2:t.terrain==="ice"?.25:.5),g}let pe=$(0,0);function L(m,f){return $(m,f)-pe}const ie=(()=>{if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring")return{x:0,z:0};const m=[];for(let P=0;P<40;P+=1){const g=P/40*Math.PI*2,v=P%5*34,K=Math.cos(g)*v,R=Math.sin(g)*v;let ae=0;for(let te=0;te<8;te+=1){const Ue=te/8*Math.PI*2;ae+=L(K+Math.cos(Ue)*120,R+Math.sin(Ue)*120)}m.push({x:K,z:R,score:L(K,R)-ae/8})}m.sort((P,g)=>g.score-P.score);const f=m[Math.floor(m.length*.28)];return{x:f.x,z:f.z}})();pe=$(ie.x,ie.z);const Me=t.cloudTop!==null?t.cloudTop:L(ie.x,ie.z),ce=1.7,N=Pa(t.sunAz,t.sunElev),se=t.sunScale>0?.2667*t.sunScale*oo:0,Ce=Math.max(0,Math.min(1,t.fogDensity*26)),_e=new X(t.skyTop),we=new X(t.skyBottom),st=new X(t.glow),D=r(new Qe({vertexShader:Pi,fragmentShader:Ti,side:no,depthWrite:!1,uniforms:{uTop:{value:_e.clone()},uBottom:{value:we.clone()},uGlow:{value:st.clone()},uSun:{value:new X(t.sunColor)},uSunDir:{value:N.clone()},uSunRadius:{value:se},uSunHaze:{value:Ce},uGlowGain:{value:t.glowGain}}})),ee=new O(r(new Ae(Oo,32,20)),D);ee.frustumCulled=!1,c.add(ee);let ke=0;function nt(m){ke=Math.max(0,Math.min(1,m));const f=1-ke;D.uniforms.uTop.value.copy(_e).multiplyScalar(f),D.uniforms.uBottom.value.copy(we).multiplyScalar(f),D.uniforms.uGlow.value.copy(st).multiplyScalar(f),D.uniforms.uGlowGain.value=t.glowGain*f,D.uniforms.uSun.value.copy(new X(t.sunColor)).multiplyScalar(f),Se&&(Se.opacity=.85*Math.min(1,ke*1.6))}let Se=null;if(t.stars){const m=o?320:620,f=new Float32Array(m*3),P=to(M^2654435769);for(let R=0;R<m;R+=1){const ae=P()*Math.PI*2,te=Math.pow(P(),.65)*.98+.02,Ue=Math.sqrt(1-te*te);f[R*3]=Math.cos(ae)*Ue*(Oo-200),f[R*3+1]=te*(Oo-200),f[R*3+2]=Math.sin(ae)*Ue*(Oo-200)}const g=r(new en);g.setAttribute("position",new gn(f,3));const v=r(new Ko({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1}));Se=v;const K=new Zo(g,v);K.frustumCulled=!1,c.add(K)}const de=Math.min(1.5,.45+.9*Math.min(1,Math.max(t.sunScale,.02)*1.5)),ft=t.stars?.4:.46,gt=(m,f)=>{const g=-(L(m+.9,f)-L(m-.9,f))/1.8,v=-(L(m,f+.9)-L(m,f-.9))/(2*.9),K=1/Math.sqrt(g*g+1+v*v),R=Math.max(0,(g*N.x+N.y+v*N.z)*K);return ft+de*R};let Re=[],pt=null;if(t.terrain==="plasma"){const m=r(new Qe({vertexShader:Ai,fragmentShader:Ci,uniforms:{uTime:{value:0},uA:{value:new X(t.ground)},uB:{value:new X(t.ground2)},uC:{value:new X(t.ground3)}}}));pt=m;const f=new O(r(new Mo(2400,2400,1,1)),m);f.rotation.x=-Math.PI/2,f.position.y=0,c.add(f)}else if(t.terrain!=="ring")if(t.cloudTop!==null){const m=bi(t,o,s),f=Math.min(1.12,.55+.5*Math.min(1,Math.max(t.sunScale,.02)*2)),P=(R,ae)=>r(new Qe({vertexShader:ci,fragmentShader:li,uniforms:{uMap:{value:m},uOffset:{value:new bo(0,0)},uTile:{value:R},uDetail:{value:11},uTint:{value:new X().setScalar(ae)},uOpacity:{value:1},uFogColor:{value:new X(t.fog)},uFogDensity:{value:t.fogDensity}}})),g=new O(r(new Mo(5200,5200,1,1)),P(Fs,f));g.rotation.x=-Math.PI/2,g.position.y=t.cloudTop,c.add(g),Re=[g.material];const v=P(Fs*.42,f*.86);v.uniforms.uOpacity.value=.55,v.transparent=!0,v.depthWrite=!1;const K=new O(r(new Mo(5200,5200,1,1)),v);K.rotation.x=-Math.PI/2,K.position.y=t.cloudTop-90,c.add(K),Re.push(v)}else{const m=o?96:150,f=r(new Mo(dn*2,dn*2,m,m));f.rotateX(-Math.PI/2);const P=f.attributes.position,g=new Float32Array(P.count*3),v=new X(t.ground),K=new X(t.ground2),R=new X(t.ground3),ae=new gn(g,3),te=new X,Ue=fe=>{const xe=P.getX(fe),Ge=P.getZ(fe),Ye=L(xe,Ge);P.setY(fe,Ye);const et=jo(xe*.02+3,Ge*.02+9,3);te.copy(v).lerp(K,Na(Math.min(1,Math.max(0,(et-.28)/.5)))),Ye<-1.6&&te.lerp(R,Math.min(1,(-Ye-1.6)/7));const ze=jo(xe*.0045+17,Ge*.0045+41,3),it=Math.min(1.9,gt(xe,Ge))*(.9+(et-.5)*.22)*(.84+ze*.34);let qe=1;for(const Ze of S){const je=Math.hypot(xe-Ze.x,Ge-Ze.z)/Ze.r;if(je>1.5)continue;const rt=Math.min(1,Math.max(0,1-je/1.35));qe*=1-.62*rt*rt}g[fe*3]=te.r*it*qe,g[fe*3+1]=te.g*it*qe*.94,g[fe*3+2]=te.b*it*qe*.9};for(let fe=0;fe<P.count;fe+=1){const xe=P.getX(fe)/dn,Ge=P.getZ(fe)/dn,Ye=Math.sign(xe)*Math.pow(Math.abs(xe),1.8)*dn,et=Math.sign(Ge)*Math.pow(Math.abs(Ge),1.8)*dn;P.setXYZ(fe,Ye,0,et),Ue(fe)}f.setAttribute("color",ae),f.computeVertexNormals();const mt=xi(t.terrain,o,s),ve=1/(mt.image.width||512),ht=r(new Qe({vertexShader:ri,fragmentShader:ii,vertexColors:!0,side:at,uniforms:{uMap:{value:mt},uTexel:{value:ve},uTile:{value:Qs},uDetail:{value:5.6},uBump:{value:9},uGloss:{value:t.terrain==="ice"?.9:.25},uSunDir:{value:N.clone()},uSunColor:{value:new X(t.sunColor)},uFogColor:{value:new X(t.fog)},uFogDensity:{value:t.fogDensity},uAmbient:{value:ft},uSunPower:{value:de}}})),En=new O(f,ht);c.add(En);const $t=dn*2/m,xn=m+1;b=(fe,xe)=>{const Ge=(fe+dn)/$t,Ye=(xe+dn)/$t;if(Ge<0||Ye<0||Ge>=m||Ye>=m)return L(fe,xe);const et=Math.floor(Ge),ze=Math.floor(Ye),it=Ge-et,qe=Ye-ze,Ze=ze*xn+et,je=P.getY(Ze),rt=P.getY(Ze+1),At=P.getY(Ze+xn),It=P.getY(Ze+xn+1);return it+qe<=1?je+(rt-je)*it+(At-je)*qe:It+(At-It)*(1-it)+(rt-It)*(1-qe)};const Tt=to(M^2135587861),Nn=[t.ground2,t.ground3,t.ground].map(fe=>new X(fe).multiplyScalar(ft+de*.75)),Dt=new wo,io=fe=>{Dt.position.set(fe.x,fe.y,fe.z),Dt.rotation.set(fe.rx,fe.ry,fe.rz),Dt.scale.set(fe.sx,fe.sy,fe.sz),Dt.updateMatrix(),fe.mesh.setMatrixAt(fe.index,Dt.matrix)},un=(fe,xe,Ge,Ye,et,ze,it)=>{const qe=new Jo(fe,r(new he({color:16777215})),xe);qe.instanceMatrix.setUsage(Ta);for(let Ze=0;Ze<xe;Ze+=1){const je=Tt()*Math.PI*2,rt=Ge+Math.sqrt(Tt())*(Ye-Ge),At=ie.x+Math.cos(je)*rt,It=ie.z+Math.sin(je)*rt,Vt=et+Math.pow(Tt(),2.1)*(ze-et),bn=L(At,It),Sn=Vt*(.45+Tt()*.5),Ft={mesh:qe,index:Ze,x:At,z:It,y:bn+Vt*it,base:bn,relief:0,liftY:Vt*it,sx:Vt*(.8+Tt()*.7),sy:Sn,sz:Vt*(.8+Tt()*.7),rx:Tt()*3,ry:Tt()*3,rz:Tt()*3,fly:!1,vx:0,vy:0,vz:0,spin:new W};Ft.relief=Ft.y+Sn*.72-bn,l.push(Ft),io(Ft),qe.setColorAt(Ze,Nn[Ze%3])}qe.instanceMatrix.needsUpdate=!0,qe.instanceColor&&(qe.instanceColor.needsUpdate=!0),c.add(qe)};if(un(r(new hn(1,0)),o?90:170,1.2,60,.02,.22,.35),un(r(new hn(1,1)),o?30:54,2,120,.18,1.1,.34),un(r(new hn(1,1)),o?10:18,6,190,.6,2.4,.4),u=(fe,xe,Ge)=>{const Ye=Ge*2.4;for(let et=0;et<P.count;et+=1){const ze=P.getX(et)-fe,it=P.getZ(et)-xe;ze*ze+it*it>Ye*Ye||Ue(et)}P.needsUpdate=!0,ae.needsUpdate=!0,f.computeVertexNormals()},A=()=>{for(let fe=0;fe<P.count;fe+=1)Ue(fe);P.needsUpdate=!0,ae.needsUpdate=!0,f.computeVertexNormals()},Y=(fe,xe,Ge)=>{const Ye=Ge*1.2,et=Ge*2.3;for(const ze of l){const it=ze.x-fe,qe=ze.z-xe,Ze=Math.hypot(it,qe);if(!(Ze>et)){if(ze.base=L(ze.x,ze.z),ze.y=ze.base+ze.liftY,ze.relief=ze.y+ze.sy*.72-ze.base,Ze<Ye&&ze.sy>.16){const je=Ze>.001?Ze:1,rt=12+Math.random()*26;ze.fly=!0,ze.vx=it/je*rt,ze.vz=qe/je*rt,ze.vy=9+Math.random()*20,ze.spin.set((Math.random()-.5)*9,(Math.random()-.5)*9,(Math.random()-.5)*9)}io(ze),ze.mesh.instanceMatrix.needsUpdate=!0}}},t.terrain==="ice"){const fe=[],xe=to(M^1542469173),Ge=(et,ze,it,qe,Ze,je)=>{let rt=et,At=ze,It=it;for(let Vt=0;Vt<qe;Vt+=1){const bn=rt+Math.cos(It)*Ze,Sn=At+Math.sin(It)*Ze;fe.push(rt,L(rt,At)+.06,At,bn,L(bn,Sn)+.06,Sn),rt=bn,At=Sn,It+=(xe()-.5)*.9,je>0&&Vt===qe>>1&&xe()<.7&&Ge(rt,At,It+(xe()<.5?.9:-.9),Math.max(3,qe>>2),Ze*.8,je-1)}};for(let et=0;et<(o?6:10);et+=1)Ge((xe()-.5)*300,(xe()-.5)*300,xe()*Math.PI*2,14,14,1);const Ye=r(new en);Ye.setAttribute("position",new gn(new Float32Array(fe),3)),c.add(new qs(Ye,r(new xo({color:t.ground3,transparent:!0,opacity:.75}))))}}if(t.terrain==="ring"){const m=new Le;m.position.copy(Pa(t.companionAz,0)).multiplyScalar(2600);const f=Ws;m.position.y=f;const P=480,g=P*1.11,v=P*2.36,K=new O(r(new Ae(P,o?64:128,o?44:80)),r(new Qe({vertexShader:Ds,fragmentShader:Is,uniforms:{uMap:{value:_s("saturn",t,o,s)},uLimb:{value:.4},uRim:{value:new X("#e8dcbc")}}})));m.add(K);const R=r(new Qe({vertexShader:eo,fragmentShader:Sa,transparent:!0,side:at,depthWrite:!1,uniforms:{uProfile:{value:za(o,s)},uInner:{value:g},uOuter:{value:v},uAlpha:{value:o?.78:.88}}})),ae=new O(r(new vt(g,v,o?128:220,1)),R);ae.rotation.x=-Math.PI/2,ae.position.y=f,m.add(ae),c.add(m);const te=o?220:420,Ue=r(new hn(1,0)),mt=r(new he({color:"#dfe8f2"})),ve=new Jo(Ue,mt,te);ve.instanceMatrix.setUsage(Ta);const ht=to(M^1374496523),En=[],$t=new wo;for(let Dt=0;Dt<te;Dt+=1){const un=Dt%31===0?.5+ht()*1.3:.05+Math.pow(ht(),2)*.55,fe=14+Math.pow(ht(),.7)*150,xe=ht()*Math.PI*2,Ge=(ht()-.5)*14;En.push({r:fe,a:xe,y:Ge,spin:.02+ht()*.08,size:un,wob:ht()*Math.PI*2}),$t.position.set(Math.cos(xe)*fe,Ge,Math.sin(xe)*fe),$t.rotation.set(ht()*3,ht()*3,ht()*3),$t.scale.setScalar(un),$t.updateMatrix(),ve.setMatrixAt(Dt,$t.matrix);const Ye=.5+ht()*.45;ve.setColorAt(Dt,new X(Ye,Ye*.98,Ye*1.05))}ve.instanceMatrix.needsUpdate=!0,ve.instanceColor&&(ve.instanceColor.needsUpdate=!0),c.add(ve),h={mesh:ve,data:En};const xn=r(new Qe({vertexShader:eo,fragmentShader:Bo,transparent:!0,side:at,depthWrite:!1,uniforms:{uInner:{value:.6},uOuter:{value:2600-v-10},uBands:{value:260},uA:{value:new X("#e2eaf4")},uB:{value:new X("#c3cfdd")},uAlpha:{value:.92},uGrain:{value:.26}}})),Tt=2600-v-10,Nn=new O(r(new vt(.6,Tt,128,1)),xn);Nn.rotation.x=-Math.PI/2,Nn.position.y=f,c.add(Nn)}if(t.ring){const m=t.ring==="uranus",f=m?210:170,P=m?520:560,g=m?82*oo:27*oo,v=m?140:54,K=r(m?new Qe({vertexShader:eo,fragmentShader:Bo,transparent:!0,side:at,depthWrite:!1,uniforms:{uInner:{value:f},uOuter:{value:P},uBands:{value:v},uA:{value:new X("#9fd0d6")},uB:{value:new X("#cdeef2")},uAlpha:{value:.5},uGrain:{value:.4}}}):new Qe({vertexShader:eo,fragmentShader:Sa,transparent:!0,side:at,depthWrite:!1,uniforms:{uProfile:{value:za(o,s)},uInner:{value:f},uOuter:{value:P},uAlpha:{value:.82}}})),R=new O(r(new vt(f,P,o?64:128,1)),K);if(R.rotation.x=-Math.PI/2+g,R.position.y=m?30:90,c.add(R),m){const ae=r(new Qe({vertexShader:eo,fragmentShader:Bo,transparent:!0,side:at,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new X("#dff6f8")},uB:{value:new X("#bfe6ea")},uAlpha:{value:.35},uGrain:{value:.3}}})),te=new O(r(new vt(130,175,64,1)),ae);te.rotation.x=-Math.PI/2+g,te.position.y=30,c.add(te)}}if(t.companion&&t.terrain!=="ring"){const f=Math.max(6,Math.tan(t.companionSize/2*oo)*1500),P=new Le;P.position.copy(Pa(t.companionAz,t.companionElev)).multiplyScalar(1500);const g=_s(t.companion,t,o,s),v=new O(r(new Ae(f,o?48:72,o?32:48)),r(new Qe({vertexShader:Ds,fragmentShader:Is,uniforms:{uMap:{value:g},uLimb:{value:.42},uRim:{value:new X(t.companion==="earth"?"#9fd0ff":"#cfe0f2")}}})));if(v.lookAt(0,0,0),P.add(v),t.companion==="saturn"||t.companion==="jupiter"){const R=t.companion==="saturn",ae=r(new Qe({vertexShader:eo,fragmentShader:R?Sa:Bo,transparent:!0,side:at,depthWrite:!1,uniforms:R?{uProfile:{value:za(o,s)},uInner:{value:f*1.12},uOuter:{value:f*2.36},uAlpha:{value:.7}}:{uInner:{value:f*1.3},uOuter:{value:f*1.7},uBands:{value:16},uA:{value:new X("#d9c7a8")},uB:{value:new X("#b09070")},uAlpha:{value:.18},uGrain:{value:.3}}})),te=new O(r(new vt(f*(R?1.12:1.3),f*(R?2.36:1.7),64,1)),ae);te.rotation.x=-Math.PI/2+.32,P.add(te)}const K=new ao(r(new so({map:k,color:new X(t.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:Xe})));K.scale.setScalar(f*4),P.add(K),c.add(P)}const Xt=t.terrain!=="ring",le=(m,f)=>t.terrain==="ring"?Ws:t.cloudTop!==null?t.cloudTop:L(m,f),re=Hr({sunDir:N,ambient:Math.min(1.05,ft+.24),sunPower:de});c.add(re.group),re.setVisible(!1);const on=si({floorAt:le,heightAt:L,onImpact:n.onImpact,onScar:(m,f)=>Nt(m,f)});c.add(on.group);const Gt=o?140:t.particles==="haze"?120:300;let jt=null,Z=null;if(t.particles!=="none"){const m=new Float32Array(Gt*3);Z=new Float32Array(Gt*3);const f=to(M^625341585);for(let K=0;K<Gt;K+=1){const R=f()*Math.PI*2,ae=Math.sqrt(f())*55,te=t.particles;let Ue=f()*22;te==="spark"&&(Ue=f()*14),te==="haze"&&(Ue=2+f()*26),m[K*3]=Math.cos(R)*ae,m[K*3+1]=Ue,m[K*3+2]=Math.sin(R)*ae;const mt=te==="wind"?42+f()*34:te==="rain"?12+f()*6:te==="spark"?2+f()*4:1.2+f()*2.6;Z[K*3]=te==="wind"?mt:(f()-.5)*mt*.5,Z[K*3+1]=te==="rain"?-mt:te==="spark"?mt:te==="snow"?-.6-f()*.9:(f()-.5)*.4,Z[K*3+2]=te==="wind"?mt*.25:(f()-.5)*mt*.4}jt=r(new en),jt.setAttribute("position",new gn(m,3));const P=t.particles==="haze"?2.6:t.particles==="dust"?.14:t.particles==="rain"?.09:t.particles==="snow"?.11:.16,g=r(new Ko({color:new X(t.particleColor),size:P,transparent:!0,opacity:t.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:t.particles==="spark"?Xe:void 0})),v=new Zo(jt,g);v.frustumCulled=!1,c.add(v)}const H=r(new hn(.26,0)),G=r(new Ae(.24,16,12)),ne=t.cloudTop===null&&t.terrain!=="plasma",me=[],j=[],I=[];function ue(m,f,P,g){const v=new ao(r(new so({map:k,color:new X(f),transparent:!0,opacity:.9,depthWrite:!1,blending:Xe})));v.position.copy(m),v.scale.setScalar(P),c.add(v),j.push({sprite:v,life:g,max:g,grow:P*2.4})}function Pt(m,f){const P=new O(r(new vt(.28,.5,24,1)),r(new he({color:new X(f),transparent:!0,opacity:.6,depthWrite:!1,side:at})));P.rotation.x=-Math.PI/2,P.position.copy(m),c.add(P),I.push({mesh:P,life:.7})}function yt(m,f){const P=ie.x+m,g=ie.z+f,v=t.cloudTop!==null?t.cloudTop:L(P,g),K=ne?new he({color:new X("#c9c2b4").multiplyScalar(ft+de*.8),transparent:!0}):new he({color:new X("#ffb45e"),transparent:!0}),R=new O(ne?H:G,K);R.position.set(P,v+4.2,g),R.scale.setScalar(.9+Math.random()*.35),c.add(R);const ae=t.gravityMps2<=.01;if(me.push({mesh:R,x:P,z:g,y:ae?v+.6:v+4.2,vy:ae?.12:0,vx:ae?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:ae?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),me.length>6){const te=me.shift();te&&(c.remove(te.mesh),te.mesh.material.dispose())}}function ln(m,f){const P=new W(m.x,f+.2,m.z);if(t.gravityMps2<=.01){m.outcome="float",m.landed=!0,m.resting=5.5,n.onLand?.({seconds:m.fall,bounces:0,outcome:"float"});return}if(t.terrain==="plasma"){m.outcome="vapor",m.landed=!0,m.resting=.25,ue(P,"#fff2c0",1.2,.6),n.onLand?.({seconds:m.fall,bounces:0,outcome:"vapor"});return}if(t.cloudTop!==null){m.outcome="sink",m.landed=!0,m.resting=1.6,ue(P,"#ffffff",1.6,.7),n.onLand?.({seconds:m.fall,bounces:0,outcome:"sink"});return}if(m.bounces+=1,Pt(P,t.ground2),m.bounces===1&&n.onLand?.({seconds:m.fall,bounces:1,outcome:"bounce"}),m.bounces>=4||Math.abs(m.vy)<1.3){m.landed=!0,m.outcome="bounce",m.resting=1.6,m.vy=0;return}m.vy=Math.abs(m.vy)*.42,m.y=f+.26,m.vx*=.6,m.vz*=.6}const Yt=new wo,So=new X("#31090d"),An=new X("#180509"),ea=new X("#ff3a10");function ko(m,f){on.update(m,f);const P=on.doom();D.uniforms.uTop.value&&(D.uniforms.uTop.value.copy(_e).lerp(So,P),D.uniforms.uBottom.value.copy(we).lerp(An,P),D.uniforms.uGlow.value.copy(st).lerp(ea,P)),Se&&(Se.opacity=.85*(1-P*.85)),pt&&(pt.uniforms.uTime.value=m);for(let g=0;g<Re.length;g+=1){const v=Re[g].uniforms.uOffset.value;v.x=(v.x+f*(g===0?.006:.012))%1}if(h){const{mesh:g,data:v}=h;for(let K=0;K<v.length;K+=1){const R=v[K];R.a+=R.spin*f*.05,Yt.position.set(Math.cos(R.a)*R.r,R.y+Math.sin(m*.25+R.wob)*.5,Math.sin(R.a)*R.r),Yt.rotation.set(m*.08+R.wob,m*.11+R.a,R.wob),Yt.scale.setScalar(R.size),Yt.updateMatrix(),g.setMatrixAt(K,Yt.matrix)}g.instanceMatrix.needsUpdate=!0}if(jt&&Z){const g=jt.attributes.position,v=g.array;for(let K=0;K<g.count;K+=1){const R=K*3;v[R]+=Z[R]*f,v[R+1]+=Z[R+1]*f,v[R+2]+=Z[R+2]*f,t.particles==="rain"||t.particles==="snow"?v[R+1]<0&&(v[R+1]=22):t.particles==="spark"?v[R+1]>20&&(v[R+1]=0):(v[R+1]<0&&(v[R+1]=24),v[R+1]>26&&(v[R+1]=0)),v[R]>60&&(v[R]=-60),v[R]<-60&&(v[R]=60),v[R+2]>60&&(v[R+2]=-60),v[R+2]<-60&&(v[R+2]=60)}g.needsUpdate=!0}for(let g=me.length-1;g>=0;g-=1){const v=me[g],K=t.cloudTop!==null?t.cloudTop:L(v.x,v.z);if(v.landed)v.resting>0?(v.resting-=f,v.outcome==="sink"?(v.y-=f*2.4,v.mesh.scale.multiplyScalar(1-f*.8)):v.outcome==="vapor"?v.mesh.scale.multiplyScalar(1-f*3):v.mesh.scale.multiplyScalar(1-f*.25)):(v.fade-=f*1.4,v.mesh.material.opacity=Math.max(0,v.fade),v.mesh.scale.multiplyScalar(1-f*.9),v.fade<=0&&(c.remove(v.mesh),v.mesh.material.dispose(),me.splice(g,1)));else{if(v.fall+=f,t.gravityMps2<=.01){v.x+=v.vx*f,v.z+=v.vz*f,v.y+=v.vy*f,v.mesh.rotation.x+=f*.6,v.mesh.rotation.y+=f*.45,v.mesh.position.set(v.x,v.y,v.z),v.fall>.05&&ln(v,v.y);continue}v.vy-=t.gravityMps2*f,v.y+=v.vy*f,v.x+=v.vx*f,v.z+=v.vz*f,v.mesh.rotation.x+=f*3.2,v.mesh.rotation.z+=f*2.1,v.y-.26<=K&&(v.y=K+.26,ln(v,K))}v.mesh.position.set(v.x,v.y,v.z)}for(const g of l){if(!g.fly)continue;const v=Math.max(1.2,t.gravityMps2);g.vy-=v*f,g.x+=g.vx*f,g.y+=g.vy*f,g.z+=g.vz*f,g.vx*=1-f*.25,g.vz*=1-f*.25,g.rx+=g.spin.x*f,g.ry+=g.spin.y*f,g.rz+=g.spin.z*f;const K=L(g.x,g.z)+g.sy*.72;g.y<=K&&(g.y=K,g.fly=!1,g.vx=0,g.vy=0,g.vz=0,g.base=L(g.x,g.z),g.liftY=g.y-g.sy*.72-g.base,g.relief=g.y+g.sy*.72-g.base),zo(g),g.mesh.instanceMatrix.needsUpdate=!0}for(let g=j.length-1;g>=0;g-=1){const v=j[g];v.life-=f;const K=1-v.life/v.max;v.sprite.scale.setScalar(v.sprite.scale.x+(v.grow-v.sprite.scale.x)*Math.min(1,f*6)),v.sprite.material.opacity=Math.max(0,.9*(1-K)),v.life<=0&&(c.remove(v.sprite),j.splice(g,1))}for(let g=I.length-1;g>=0;g-=1){const v=I[g];v.life-=f,v.mesh.scale.multiplyScalar(1+f*3.4),v.mesh.material.opacity=Math.max(0,v.life/.7)*.6,v.life<=0&&(c.remove(v.mesh),I.splice(g,1))}}function Nt(m,f){if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring"||!u)return 0;const P=22+Math.random()*6,g=Math.max(1.4,L(m,f)+26),v=Math.min(4.8+Math.random()*1.2,g);return S.push({x:m,z:f,r:P,d:v}),S.length>Ri&&(S.shift(),A?.()),u(m,f,P),Y?.(m,f,P),P}const Cn=new wo;function zo(m){Cn.position.set(m.x,m.y,m.z),Cn.rotation.set(m.rx,m.ry,m.rz),Cn.scale.set(m.sx,m.sy,m.sz),Cn.updateMatrix(),m.mesh.setMatrixAt(m.index,Cn.matrix)}function Rn(m,f){let P=m,g=f,v=0;for(const K of l){if(K.fly)continue;const R=Math.max(K.sx,K.sz);if(R<.04)continue;let ae=P-K.x,te=g-K.z;const Ue=Math.hypot(ae,te);if(!(Ue>R+1.2)){if(K.relief<=Ei)Ue<R*.95&&(v=Math.max(v,K.relief));else if(Ue<R+Ls){Ue<1e-4&&(ae=0,te=1);const mt=Math.max(1e-4,Math.hypot(ae,te)),ve=R+Ls-Ue;P+=ae/mt*ve,g+=te/mt*ve}}}return{x:P,z:g,rise:v}}const wn=(m,f)=>{const g=-(L(m+.9,f)-L(m-.9,f))/1.8,v=-(L(m,f+.9)-L(m,f-.9))/(2*.9);return new W(g,1,v).normalize()};function ta(){re.dispose(),on.dispose();for(const m of j)c.remove(m.sprite);for(const m of I)c.remove(m.mesh);for(const m of me)c.remove(m.mesh),m.mesh.material.dispose();y.forEach(m=>m.dispose()),c.clear()}return{group:c,eyeY:Me+ce,eyeHeight:ce,groundY:Me,standX:ie.x,standZ:ie.z,heightAt:L,floorAt:le,solidFloor:Xt,walkable:t.cloudTop===null&&t.terrain!=="ring",avatar:re,impact:on,scar:Nt,walk:Rn,normalAt:wn,scarCount:()=>S.length,atmosphere:nt,meshHeightAt:(m,f)=>b?b(m,f):L(m,f),update:ko,drop:yt,dispose:ta}}const Di="models/rocket/",Ii="textures/rocket/",Us={engine:"engine-cluster",stage1:"first-stage-core",inter:"interstage",stage2:"second-stage",fairing:"payload-fairing",fins:"grid-fin-set",mount:"launch-mount",deflector:"flame-deflector",gantryBase:"gantry-base",gantryTower:"gantry-tower",strongback:"strongback",mast:"lightning-mast",flood:"floodlight"},qo=4.4;let Gs=null,Vs=null;function Fi(){return Vs??=(async()=>{const t=new Ks,n=async(k,S)=>{const l=await t.loadAsync(`${Ii}${k}.webp`);return l.wrapS=Aa,l.wrapT=Aa,l.colorSpace=S?yn:Fa,l.anisotropy=8,l},[o,s,c,y,r,h,b,M,w]=await Promise.all([n("hull_color",!0),n("hull_normal",!1),n("hull_rough",!1),n("tile_color",!0),n("tile_normal",!1),n("tile_rough",!1),n("steel_color",!0),n("steel_normal",!1),n("steel_rough",!1)]);return{hullColor:o,hullNormal:s,hullRough:c,tileColor:y,tileNormal:r,tileRough:h,steelColor:b,steelNormal:M,steelRough:w}})(),Vs}function _i(){return Gs??=(async()=>{const t=new Ar,n=new Map;return await Promise.all(Object.keys(Us).map(async o=>{const s=await t.loadAsync(`${Di}${Us[o]}.glb`);n.set(o,s.scene)})),n})(),Gs}function Wi(t,n){const o=(c,y,r,h,b,M)=>new Ra({map:c,normalMap:y,roughnessMap:r,color:h,metalness:b,roughness:M,envMap:n,envMapIntensity:1.15}),s=(c,y,r)=>new Ra({color:c,metalness:y,roughness:r,envMap:n,envMapIntensity:.9});return{white:o(t.hullColor,t.hullNormal,t.hullRough,15659766,.88,.62),cryo:o(t.hullColor,t.hullNormal,t.hullRough,12175834,.82,.55),charcoal:o(t.tileColor,t.tileNormal,t.tileRough,10132122,.38,.72),steel:o(t.steelColor,t.steelNormal,t.steelRough,12764876,.8,.5),red:s(11942448,.3,.55),yellow:s(14197788,.35,.5),concrete:s(11051930,.05,.92),glass:s(3030348,.55,.25)}}function Li(t,n,o){t.traverse(s=>{const c=s;if(!c.isMesh)return;const y=c.geometry,r=y.getAttribute("position");if(!r)return;const h=new Float32Array(r.count*2);for(let b=0;b<r.count;b+=1){const M=r.getX(b),w=r.getY(b),k=r.getZ(b);h[b*2]=(Math.atan2(M,k)/(Math.PI*2)+.5)*n,h[b*2+1]=w*o}y.setAttribute("uv",new gn(h,2))})}function Ui(t,n){t.traverse(o=>{const s=o;if(!s.isMesh)return;const c=s.geometry,y=c.getAttribute("position");if(!y)return;const r=new Float32Array(y.count*2);for(let h=0;h<y.count;h+=1)r[h*2]=(y.getX(h)+y.getZ(h))*n,r[h*2+1]=y.getY(h)*n;c.setAttribute("uv",new gn(r,2))})}function Bs(t,n){t.traverse(o=>{const s=o;if(!s.isMesh)return;const c=s.material;Array.isArray(c)?s.material=c.map(y=>n[y.name]??n.steel):s.material=n[c?.name??"steel"]??n.steel})}function Gi(t,n){if(typeof document>"u")return null;const o=document.createElement("canvas");o.width=128,o.height=64;const s=o.getContext("2d");if(!s)return null;const c=s.createLinearGradient(0,0,0,64),y=new X("#8d8a84"),r=new X(n.ground).lerp(y,.5).getStyle(),h=new X(n.ground2??n.ground).lerp(y,.5).getStyle();c.addColorStop(0,n.skyTop),c.addColorStop(.5,n.skyBottom),c.addColorStop(.53,r),c.addColorStop(1,h),s.fillStyle=c,s.fillRect(0,0,128,64);const b=(n.sunAz/360%1+1)%1*128,M=32-n.sunElev/90*26,w=s.createRadialGradient(b,M,0,b,M,n.sunScale>0?18:.1);w.addColorStop(0,n.sunColor),w.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=w,s.fillRect(0,0,128,64);const k=new On(o);k.mapping=Cr,k.colorSpace=yn;const S=new Rr(t),l=S.fromEquirectangular(k).texture;return S.dispose(),k.dispose(),l}const Vi=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Bi=`
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
`;function Oi(){const n=document.createElement("canvas");n.width=96,n.height=96;const o=n.getContext("2d");if(o){const c=o.createRadialGradient(48,48,2,48,48,48);c.addColorStop(0,"rgba(255,255,255,0.95)"),c.addColorStop(.45,"rgba(240,240,240,0.5)"),c.addColorStop(1,"rgba(230,230,230,0)"),o.fillStyle=c,o.fillRect(0,0,96,96)}const s=new On(n);return s.colorSpace=yn,s}async function Xi(t,n){const[o,s]=await Promise.all([_i(),Fi()]),c=Gi(t,n),y=Wi(s,c),r=new Le;r.name="rocket-pad";const h=D=>{const ee=o.get(D);if(!ee)throw new Error(`rocket part ${D}`);return ee.clone(!0)},b=(D,ee,ke=0,nt=0,Se=0)=>{const de=h(ee);return de.position.set(nt,ke,Se),D.add(de),de},M=new Le;r.add(M),b(M,"mount",0,0,0),b(M,"deflector",-1.9,0,0),b(M,"gantryBase",0,-11.5,1.5),b(M,"gantryTower",7.71,-11.5,1.5),b(M,"gantryTower",14.94,-11.5,1.5),b(M,"strongback",6.19,-7.4,-.4),b(M,"mast",0,-19,-8),b(M,"flood",0,13,7),b(M,"flood",0,-13,9),Bs(M,y),Ui(M,.2);const w=[];M.traverse(D=>{/^clamp-[a-d]$/.test(D.name)&&w.push(D)});const k=new Le;k.position.y=qo,r.add(k),b(k,"engine",0),b(k,"stage1",3),b(k,"fins",23.2),b(k,"inter",27),b(k,"stage2",30.6),b(k,"fairing",42.9).traverse(D=>{(D.name==="fairing-a"||D.name==="fairing-b")&&(D.position.x=0,D.name==="fairing-b"&&(D.scale.x=-1))}),Bs(k,y),Li(k,7,.3);const l=new Le,A={uTime:{value:0},uPower:{value:0},uCore:{value:new X("#fff6dd")},uEdge:{value:new X("#ff9a3a")}},u=new Qe({uniforms:A,vertexShader:Vi,fragmentShader:Bi,transparent:!0,blending:Xe,depthWrite:!1,side:at}),Y=new O(new Ca(2.5,26,20,4,!0),u);Y.rotation.x=Math.PI,Y.position.y=-1;const C=new O(new Ca(1.35,15,18,3,!0),u);C.rotation.x=Math.PI,C.position.y=-1,l.add(Y,C),l.visible=!1,k.add(l);const V=new Zs(16756848,0,110,0);V.position.set(0,2,0),k.add(V);const _=Oi(),$=[],pe=[],L=new so({map:_,transparent:!0,opacity:.5,depthWrite:!1,color:new X("#d8d3cc")}),ie=(D,ee,ke,nt,Se,de,ft)=>{let gt=pe.pop();gt||(gt=new ao(L)),gt.visible=!0,gt.position.set(D,ee,ke),gt.scale.setScalar(nt),gt.material=L,r.add(gt),$.push({sprite:gt,life:Se,max:Se,vx:(Math.random()-.5)*de,vy:ft*(.6+Math.random()*.8),vz:(Math.random()-.5)*de,spin:(Math.random()-.5)*.8,grow:nt*(1.8+Math.random()*1.4)})};let Me=0,ce=0,N=0,se=0,Ce=0,_e=0,we=0;return{group:r,rocket:k,light:V,setBase(D,ee,ke){Me=D,ce=ee,N=ke,r.position.set(D,ke,ee)},baseX:()=>Me,baseZ:()=>ce,setLift(D){Ce=D,k.position.y=qo+D},setThrottle(D){se=Math.max(0,Math.min(1,D)),l.visible=se>.01,A.uPower.value=se,V.intensity=se*90},setPadVisible(D){M.visible=D},setFacing(D){r.rotation.y=D},setClamps(D){_e=Math.max(0,Math.min(1,D));for(const ee of w){const ke=ee.position.x,nt=ee.position.z,Se=Math.atan2(ke,nt),de=new W(Math.cos(Se),0,-Math.sin(Se));ee.quaternion.setFromAxisAngle(de,_e*.62)}},update(D,ee,ke){A.uTime.value=D;const nt=1+Math.min(1.6,ke/180);if(l.scale.set(1,nt,1),l.rotation.y=D*2.4,se>.05&&ke<90)for(we+=ee*(6+se*22);we>1;){we-=1;const Se=Math.random()*Math.PI*2,de=2+Math.random()*3.4;ie(Me+Math.cos(Se)*de,N+qo+Ce*.06+Math.random()*3,ce+Math.sin(Se)*de,2.6+Math.random()*3.2,1.5+Math.random()*1.6,9+se*16,3+se*8)}for(let Se=$.length-1;Se>=0;Se-=1){const de=$[Se];de.life-=ee;const ft=1-de.life/de.max;de.sprite.position.x+=de.vx*ee,de.sprite.position.y+=de.vy*ee,de.sprite.position.z+=de.vz*ee,de.vy+=ee*.6,de.vx*=1-ee*.6,de.vz*=1-ee*.6,de.sprite.scale.setScalar(Er.lerp(de.sprite.scale.x,de.grow,Math.min(1,ee*1.6))),de.sprite.material.opacity=Math.max(0,.5*(1-ft)*(1-ft)),de.sprite.material.rotation+=de.spin*ee,de.life<=0&&(de.sprite.visible=!1,pe.push(de.sprite),$.splice(Se,1))}},dispose(){for(const D of $)r.remove(D.sprite),D.sprite.visible=!1;$.length=0,_.dispose(),L.dispose(),u.dispose(),Y.geometry.dispose(),C.geometry.dispose();for(const D of Object.values(y))D.dispose()}}}let Os=null;function _a(){if(typeof window>"u")return null;const t=window.AudioContext||window.webkitAudioContext;return t?(Os??=new t,Os):null}let Da=null;function ji(){const t=_a();t&&t.state==="suspended"&&t.resume().catch(()=>{})}function Ia(){const t=Da;Da=null,t?.stop()}function Yi(t){if(!Js().soundOn)return;const n=_a();if(!n)return;n.state==="suspended"&&n.resume().catch(()=>{});const o=n.currentTime,s=n.createOscillator(),c=n.createGain();s.type="square",s.frequency.setValueAtTime(t?1320:880,o),c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(t?.09:.055,o+.01),c.gain.exponentialRampToValueAtTime(1e-4,o+(t?.34:.16)),s.connect(c),c.connect(n.destination),s.start(o),s.stop(o+.4)}function $i(t,n,o){if(!Js().soundOn)return null;const s=_a();if(!s)return null;s.state==="suspended"&&s.resume().catch(()=>{}),Ia();const c=s.currentTime,y=c+Math.max(0,t),r=y+Math.max(2,n),h=s.createGain();h.gain.setValueAtTime(1e-4,c),h.gain.exponentialRampToValueAtTime(.85,c+.2);const b=s.createDynamicsCompressor();b.threshold.value=-16,b.knee.value=14,b.ratio.value=3.6,b.attack.value=.006,b.release.value=.35,h.connect(b),b.connect(s.destination);const M=[],w=[],k=(N,se,Ce)=>{N.start(se),N.stop(se+Ce),M.push(N)},S=Math.floor(s.sampleRate*2.5),l=s.createBuffer(1,S,s.sampleRate),A=l.getChannelData(0);let u=0,Y=0,C=0,V=0,_=0,$=0,pe=0;for(let N=0;N<S;N+=1){const se=Math.random()*2-1;u=.99886*u+se*.0555179,Y=.99332*Y+se*.0750759,C=.969*C+se*.153852,V=.8665*V+se*.3104856,_=.55*_+se*.5329522,$=-.7616*$-se*.016898,A[N]=(u+Y+C+V+_+$+pe+se*.5362)*.12,pe=se*.115926}const L=(N,se,Ce,_e,we,st,D=1,ee=.02)=>{const ke=s.createBufferSource();ke.buffer=l,ke.loop=!0;const nt=s.createBiquadFilter();nt.type=_e,nt.Q.value=D,nt.frequency.setValueAtTime(we,N),st!==we&&nt.frequency.exponentialRampToValueAtTime(Math.max(20,st),N+se);const Se=s.createGain();Se.gain.setValueAtTime(1e-4,N),Se.gain.exponentialRampToValueAtTime(Math.max(2e-4,Ce),N+ee),Se.gain.setValueAtTime(Math.max(2e-4,Ce),Math.max(N+ee,N+se*.55)),Se.gain.exponentialRampToValueAtTime(1e-4,N+se),ke.connect(nt),nt.connect(Se),Se.connect(h),w.push(nt,Se),k(ke,N,se+.05)},ie=(N,se,Ce,_e,we,st="sine")=>{const D=s.createOscillator();D.type=st,D.frequency.setValueAtTime(Ce,N),D.frequency.exponentialRampToValueAtTime(Math.max(8,_e),N+se*.85);const ee=s.createGain();ee.gain.setValueAtTime(1e-4,N),ee.gain.exponentialRampToValueAtTime(Math.max(2e-4,we),N+.05),ee.gain.exponentialRampToValueAtTime(1e-4,N+se),D.connect(ee),ee.connect(h),w.push(ee),k(D,N,se+.02)},Me=.55+Math.min(.45,o*.12);ie(y,1.5,96,26,Me),L(y,1.2,.55,"lowpass",2600,260,.8,.01);for(const[N,se]of[[41,.5],[58,.32],[83,.18]]){const Ce=s.createOscillator();Ce.type="sawtooth",Ce.frequency.setValueAtTime(N*1.25,y),Ce.frequency.exponentialRampToValueAtTime(N,y+n*.4);const _e=s.createGain();_e.gain.value=.6;const we=s.createOscillator();we.frequency.value=6.5+Math.random()*3.5;const st=s.createGain();st.gain.value=.4,we.connect(st),st.connect(_e.gain);const D=s.createBiquadFilter();D.type="lowpass",D.frequency.value=180;const ee=s.createGain();ee.gain.setValueAtTime(1e-4,y),ee.gain.exponentialRampToValueAtTime(se,y+.8),ee.gain.setValueAtTime(se,r-Math.max(1,n*.35)),ee.gain.exponentialRampToValueAtTime(1e-4,r),Ce.connect(_e),_e.connect(D),D.connect(ee),ee.connect(h),w.push(_e,D,ee),k(Ce,y,n+.1),k(we,y,n+.1)}L(y,n*.9,.34,"bandpass",1800,900,.9,.05),L(y+1.2,n*.85,.22,"highpass",2600,5200,.7,.8),L(y+2.4,n*.6,.2,"bandpass",700,2400,.6,1.2),h.gain.setValueAtTime(.85,Math.max(c+.2,r-1.6)),h.gain.exponentialRampToValueAtTime(1e-4,r+.4);const ce={stop:()=>{const N=s.currentTime;try{h.gain.cancelScheduledValues(N),h.gain.setValueAtTime(Math.max(1e-4,h.gain.value),N),h.gain.exponentialRampToValueAtTime(1e-4,N+.25)}catch{}for(const se of M)try{se.stop(N+.3)}catch{}window.setTimeout(()=>{for(const se of w)se.disconnect();h.disconnect(),b.disconnect()},400)}};return Da=ce,ce}const Xs="textures/",Et=Math.PI/180;function Yo(t,n,o=1){return new W(Math.cos(t*Et)*Math.cos(n*Et),Math.sin(t*Et),-Math.cos(t*Et)*Math.sin(n*Et)).multiplyScalar(o)}const He=2.2,Hi=Date.UTC(2e3,0,1,12),js={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},Ys={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function qi(){if(typeof window>"u")return!0;const t=navigator,n=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,o=t.hardwareConcurrency??8,s=t.deviceMemory??8;return!!(n||o<=4||s<=4)}function Zi(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d");if(o){const s=o.createRadialGradient(64,64,0,64,64,64);s.addColorStop(0,"rgba(255,238,205,0.85)"),s.addColorStop(.3,"rgba(255,214,150,0.55)"),s.addColorStop(.45,"rgba(255,190,120,0.22)"),s.addColorStop(.7,"rgba(250,170,95,0.07)"),s.addColorStop(1,"rgba(255,160,80,0)"),o.fillStyle=s,o.fillRect(0,0,128,128)}return new On(n)}const Ki=`
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
}`,Ji=`
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
}`;function Qi(t){return Math.max(.12,.16+.11*Math.log2(t/2e3))}const ec=`
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
}`,tc=`
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
}`,nc=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,oc=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,$s=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Hs=`
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
}`,ac=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,sc=`
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
}`,rc=`
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
}`,ic=`
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
}`,cc=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,lc=`
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
}`,uc=`
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
}`,fc=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function Mc(t,n){const o=qi(),s=o?96:128,c=new Nr({antialias:!0,powerPreference:"default",alpha:!1});c.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),c.outputColorSpace=yn,c.toneMapping=Dr,c.toneMappingExposure=1.1;const y=Math.min(4,c.capabilities.getMaxAnisotropy()),r=c.domElement;r.style.display="block",r.style.width="100%",r.style.height="100%",r.style.touchAction="none",t.appendChild(r);const h=document.createElement("div");h.className="space-labels",t.appendChild(h);const b=[];let M=0;function w(){const e=performance.now();if(e-M<400)return;M=e,b.length=0;const a=t.getBoundingClientRect();for(const i of[".explore-top",".sheet",".sky-alert"]){const d=document.querySelector(i);if(!d)continue;const x=d.getBoundingClientRect();x.width<2||x.height<2||b.push({x:x.left-a.left,y:x.top-a.top,w:x.width,h:x.height})}}function k(e,a,i,d=22){for(const x of b)if(e<x.x+x.w&&e+i>x.x&&a<x.y+x.h&&a+d>x.y)return!0;return!1}const S=new Ir;S.background=new X("#05070d");const l=new Fr(45,1,.01,2e3),A=[],u=e=>(A.push(e),e),Y=new Ks,C=new _r,V=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),_=new Map,$=new Map,pe=[],L=new Set;let ie=!1,Me=0;const ce=(e,a)=>{const i=$.get(e);if(i){$.delete(e);for(const d of i)d(a)}},N=(e,a=!0)=>{const i=_.get(e);if(i)return i;Me+=1;const d=Y.load(Xs+e,()=>{ce(e,d),Me-=1,Me===0&&n.onReady?.()},void 0,()=>{ce(e,d),Me-=1,Me===0&&n.onReady?.()});return d.colorSpace=a?yn:Fa,d.anisotropy=o?4:8,_.set(e,d),u(d)},se=e=>{_.has(e)||L.has(e)||(L.add(e),C.load(Xs+e,a=>{L.delete(e);const i=new Yr;i.image=a,i.colorSpace=yn,i.anisotropy=o?4:8,i.needsUpdate=!0,u(i),_.set(e,i),ce(e,i)},void 0,()=>{L.delete(e)}))},Ce=()=>{if(!ie){ie=!0;for(const e of pe)se(e)}},_e=(e,a)=>{if(V.has(e)){a(N(e));return}const i=_.get(e);if(i){a(i);return}const d=$.get(e)??[];d.push(a),$.set(e,d),pe.includes(e)||(pe.push(e),ie&&se(e))},we=new O(u(new Ae(900,48,24)),u(new he({map:N("milkyway.webp"),side:no,depthWrite:!1})));we.rotation.set(63*Et,0,0),S.add(we),S.add(new Wr(16777215,.14));const st=new Zs(16777215,1.6,0,0);st.decay=0,S.add(st);const D=new Le;S.add(D);const ee=new Map,ke=new Map,nt=new Map,Se=[],de=new Map;let ft=null,gt=null;const Re=new Map,pt=new Map,Xt=new Map,le=new Map;let re=null,on=0,Gt=null;const jt=[],Z=[],H=[],G=[],ne=[];let me=Date.now(),j=!0,I=null;function ue(e,a,i,d){const x=js[i]??[.7,.7,.7,.06],T=Ys[i],U=new X(a),J=T?.relief??0,p=u(new Qe({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new bo(T?.texel?.[0]??1/1024,T?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:J*.35},gain:{value:(T?.gain??1.9)*.6},base:{value:new W(U.r,U.g,U.b)},glow:{value:new W(x[0],x[1],x[2])},atmo:{value:Math.min(x[3]*2.2,.85)},ringShadow:{value:d?1:0},ringMap:{value:null},ringInner:{value:d?.inner??1},ringOuter:{value:d?.outer??2},ringCenter:{value:new W},ringNormal:{value:new W(0,1,0)}},vertexShader:Ki,fragmentShader:Ji}));return e&&_e(e,z=>{p.uniforms.dayMap.value=z,p.uniforms.useMap.value=1,J>0&&(p.uniforms.bumpMap.value=z,p.uniforms.useBump.value=1)}),d&&_e("saturn-ring.webp",z=>{p.uniforms.ringMap.value=z}),p}function Pt(e,a,i){const d=Ys[i],x=d?.tint??js[i]?.slice(0,3);if(!x||o)return;const T=Math.min(d?.inner??.12,.5)*.55,U=Math.min(d?.outer??.05,.2)*.9,J=new W(x[0],x[1],x[2]),p=Math.sqrt(1-1/(1.045*1.045)),z=(F,B,oe,be)=>new O(u(new Ae(a*F,o?24:32,o?16:24)),u(new Qe({uniforms:{tint:{value:J},power:{value:oe},strength:{value:be},edge:{value:p}},vertexShader:$s,fragmentShader:Hs,side:B,transparent:!0,blending:Xe,depthWrite:!1})));e.add(z(1.045,no,2.7,T),z(1.16,zs,3.4,U))}function yt(e,a){const i=u(new Qe({uniforms:{poleN:{value:Yo(80.7,-72.7,1).normalize()},poleS:{value:Yo(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:ac,fragmentShader:sc,transparent:!0,blending:Xe,depthWrite:!1})),d=new O(u(new Ae(a*1.022,o?64:96,o?48:64)),i);d.renderOrder=1,e.add(d),G.push(i)}function ln(e,a){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([d,x,T,U,J],p)=>{const z=Yo(d,x,1).normalize(),F=new W(0,1,0).cross(z).normalize(),B=new W().crossVectors(z,F).normalize(),oe=F.multiplyScalar(Math.cos(J)).addScaledVector(B,Math.sin(J)).normalize(),be=[];for(let Ie=0;Ie<=16;Ie+=1){const $e=Ie/16,Fe=($e-.5)*T,tt=Math.sin($e*Math.PI)*U;be.push(new W().copy(z).multiplyScalar(Math.cos(Fe)).addScaledVector(oe,Math.sin(Fe)).normalize().multiplyScalar(a*(.985+tt)))}const De=u(new Qe({uniforms:{uTime:{value:0},seed:{value:p*.37+.11}},vertexShader:rc,fragmentShader:ic,transparent:!0,blending:Xe,side:at,depthWrite:!1})),Je=new O(u(new Xr(new jr(be),64,a*.022,8,!1)),De);Je.raycast=()=>{},e.add(Je),ne.push(De)})}function Yt(e,a,i=""){const d=document.createElement("button");d.type="button",d.className="space-label"+i,d.textContent=a,d.addEventListener("click",()=>n.onPick?.(e)),h.appendChild(d),nt.set(e,d)}const So=u(new Qe({uniforms:{map:{value:N("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),An=new W,ea=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],ko=new Map;let Nt=null;const Cn={moon:"earth",...Object.fromEntries(Ts.map(e=>[e.id,e.parent]))};function zo(e,a){const i=Cn[e];if(Nt===null||!i)return Lo(e,a);const d=Lo(i,a),x=Lo(e,Nt),T=Lo(i,Nt);return{x:d.x+x.x-T.x,y:d.y+x.y-T.y,z:d.z+x.z-T.z}}function Rn(e){for(const[a,i]of ke){if(a==="sun")continue;const d=zo(a,e);i.position.set(d.x*He,d.y*He,d.z*He)}for(const[a,i]of Re){const d=zo(a,e);i.position.set(d.x*He,d.y*He,d.z*He)}if(Gt){An.copy(Gt.holder.position);const a=An.length()||1;Gt.tail.visible=a/He<8,An.multiplyScalar(1/a),Gt.tail.quaternion.setFromUnitVectors(new W(0,1,0),An),Gt.tail.position.copy(An).multiplyScalar(.16*He)}}const wn=new W(1,0,0),ta=u(new Qe({uniforms:{dayMap:{value:N("earth-day.webp")},nightMap:{value:N("earth-night.webp")},normalMap:{value:N("earth-normal.webp",!1)},specMap:{value:N("earth-spec.webp",!1)},texel:{value:new bo(1/2048,1/1024)},sunDir:{value:wn}},vertexShader:ec,fragmentShader:tc}));function m(e){const a=new Le,i=new O(u(new Ae(e,o?96:128,64)),ta);i.name="earth",a.add(i);const d=new O(u(new Ae(e*1.012,80,48)),u(new Ra({map:N("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));a.add(d),ft=d;const x=new O(u(new Ae(e*1.06,64,48)),u(new Qe({uniforms:{sunDir:{value:wn}},vertexShader:`
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
            }`,side:no,transparent:!0,blending:Xe,depthWrite:!1})));a.add(x);const T=new O(u(new Ae(e*1.15,o?24:32,o?16:24)),u(new Qe({uniforms:{tint:{value:new W(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:$s,fragmentShader:Hs,side:zs,transparent:!0,blending:Xe,depthWrite:!1})));return a.add(T),ee.set("earth",i),a}function f(e,a,i){for(const d of go(e).sites??[]){const x=new O(u(new Ae(i*.018,12,8)),u(new he({color:"#3182f6"})));x.position.copy(Yo(d.lat,d.lon,i*1.004)),a.add(x);const T=document.createElement("div");T.className="space-site",T.textContent=d.name,h.appendChild(T),Se.push({mesh:x,site:d,el:T,parent:e})}}let P=null;for(const e of qr){if(e.id==="moon")continue;const a=new Le;if(ke.set(e.id,a),D.add(a),e.id==="sun"){const i=.26*He,d=new O(u(new Ae(i,o?96:128,o?64:80)),So);d.name="sun",de.set("sun",i),a.add(d),ln(d,i);for(const[T,U,J,p]of[[1.06,2,.95,"#ffbf78"]])a.add(new O(u(new Ae(i*T,o?32:48,o?24:32)),u(new Qe({uniforms:{color:{value:new X(p)},power:{value:U},strength:{value:J}},vertexShader:nc,fragmentShader:oc,transparent:!0,blending:Xe,depthWrite:!1}))));ee.set("sun",d);const x=new ao(u(new so({map:u(Zi()),blending:Xe,transparent:!0,depthWrite:!1,depthTest:!0,color:new X("#ffd9a0")})));x.scale.setScalar(i*3.6),a.add(x),gt=x}else{const i=wa(e.id).radius*He;de.set(e.id,i);let d;if(e.id==="earth"){const J=m(i);J.rotation.z=-e.tilt*Et,a.add(J),P=J,d=J.children[0]}else{const J=e.id==="saturn"?{inner:i*1.18,outer:i*2.08}:void 0;d=new O(u(new Ae(i,o?96:128,64)),ue(e.texture,e.color,e.id,J)),d.name=e.id,d.rotation.z=-e.tilt*Et,a.add(d),ee.set(e.id,d),Pt(a,i,e.id),e.id==="jupiter"&&yt(d,i)}if(e.axes){const[J,p,z]=e.axes;d.scale.set(1,z/J,p/J)}if(e.ring&&e.axes){const J=e.axes[0]/2,p=i*(e.ring.radius-e.ring.width/2)/J,z=i*(e.ring.radius+e.ring.width/2)/J,F=new O(u(new vt(p,Math.max(z,p*1.03),128,1)),u(new he({color:"#8b8580",side:at,transparent:!0,opacity:.75,depthWrite:!1})));F.rotation.x=Math.PI/2,a.add(F)}if(e.id==="saturn"){const J=i*1.18,p=i*2.08,z=new vt(J,p,160,1),F=u(new Qe({uniforms:{ringMap:{value:null},innerRatio:{value:J/p},planetRadius:{value:i},planetCenter:{value:new W}},vertexShader:cc,fragmentShader:lc,side:at,transparent:!0,depthWrite:!1}));_e("saturn-ring.webp",oe=>{F.uniforms.ringMap.value=oe});const B=new O(u(z),F);B.rotation.x=Math.PI/2,d.add(B),Z.push({mesh:B,parent:e.id}),H.push({mesh:d,material:d.material})}e.sites&&f(e.id,d,i);const x=As(e.id,.022),T=u(new en);T.setAttribute("position",new ya(x.positions,3)),T.setIndex(x.index),T.scale(He,He,He);const U=new O(T,u(new he({color:wa(e.id).ribbon,transparent:!0,opacity:.5,side:at,depthWrite:!1})));jt.push(U),D.add(U)}Yt(e.id,e.name,e.id==="sun"?"":" is-planet")}const g=[];function v(e,a,i){let d=e==="main"?1234:98765;const x=()=>(d=d*16807%2147483647,(d-1)/2147483646),T=u(new hn(1,0)),U=new Float32Array(a*4),J=new Float32Array(a*4);for(let F=0;F<a;F+=1){let B;if(e==="main")do B=2.1+x()*1.2;while((Math.abs(B-2.5)<.03||Math.abs(B-2.82)<.03||Math.abs(B-2.95)<.02)&&x()<.85);else B=x()<.18?39.2+(x()-.5)*1.2:42+(x()-.5)*6.5;U[F*4]=B,U[F*4+1]=x()*Math.PI*2,U[F*4+2]=x()*(e==="main"?.18:.12),U[F*4+3]=x()*Math.PI*2,J[F*4]=(x()-.5)*(e==="main"?.32:.5),J[F*4+1]=x()*Math.PI*2;const oe=x()**3;J[F*4+2]=(e==="main"?.0035:.009)*(.7+oe*2.4),J[F*4+3]=x()}T.setAttribute("orbit",new Ps(U,4)),T.setAttribute("shape",new Ps(J,4));const p=u(new Qe({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new X(i)},uScale:{value:He}},vertexShader:uc,fragmentShader:fc})),z=new Jo(T,p,a);z.frustumCulled=!1,z.raycast=()=>{},D.add(z),g.push({mesh:z,material:p})}v("main",o?1800:4200,"#9c9184"),v("kuiper",o?1500:3600,"#7f8b9c");for(const e of Ts){const a=new Le,i=new O(u(new Ae(e.radius*He,32,24)),ue(`${e.id}.webp`,e.color,e.id));i.name=e.id,a.add(i),D.add(a),Re.set(e.id,a),pt.set(e.id,i);const d=document.createElement("button");d.type="button",d.className="space-label is-small",d.textContent=e.name,d.addEventListener("click",()=>n.onExtra?.(e.id)),h.appendChild(d),Xt.set(e.id,{el:d,parent:e.parent})}{const e=new Le,a=new O(u(new Ae(.045*He,20,16)),u(new he({color:"#f7fbff"})));a.name="halley",e.add(a);const i=new O(u(new Ca(.04*He,.32*He,12)),u(new he({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(i),Gt={holder:e,tail:i},D.add(e),Re.set("halley",e),pt.set("halley",a);const d=As("halley",.022),x=u(new en);x.setAttribute("position",new ya(d.positions,3)),x.setIndex(d.index),x.scale(He,He,He);const T=new O(x,u(new he({color:wa("halley").ribbon,transparent:!0,opacity:.35,side:at,depthWrite:!1})));jt.push(T),D.add(T);const U=document.createElement("button");U.type="button",U.className="space-label is-small",U.textContent=q("핼리 혜성"),U.addEventListener("click",()=>n.onExtra?.("halley")),h.appendChild(U),Xt.set("halley",{el:U,parent:null})}for(const e of Zr){const a=Kr(e),i=a.points.map(oe=>new W(oe.x*He,oe.y*He,oe.z*He)),d=u(new en().setFromPoints(i)),x=new Lr(d,u(new xo({color:e.color,transparent:!0,opacity:.95})));x.visible=!1;const T=new Le,U=new O(u(new Ma(.03,.01,.01,20)),u(new he({color:"#d8dde4"})));U.rotation.x=Math.PI/2;const J=new O(u(new Ae(.014,12,8)),u(new he({color:"#c9ced6"})));J.position.z=-.02;const p=new O(u(new Ma(.002,.002,.09,6)),u(new he({color:"#aab3c0"})));p.rotation.z=Math.PI/2,p.position.z=-.02;const z=new O(u(new Ae(.035,16,12)),u(new he({color:e.color,transparent:!0,opacity:.18,blending:Xe,depthWrite:!1})));T.add(U,J,p,z),T.scale.setScalar(e.frame==="earth"?.8:1.3),T.position.copy(i[i.length-1]),x.add(T),(e.frame==="earth"?ke.get("earth")??D:D).add(x);const B=document.createElement("div");B.className="space-site is-probe",B.textContent=e.name,h.appendChild(B),le.set(e.id,{line:x,probe:T,el:B,points:i,times:a.points.map(oe=>oe.t),marks:a.marks,frame:e.frame})}if(Rn(me),P){const e=.055*He;de.set("moon",e);const a=new O(u(new Ae(e,s,48)),ue("moon.webp","#b8b8b8","moon"));a.name="moon";const i=new Le;i.add(a),D.add(i),ee.set("moon",a),ke.set("moon",i),f("moon",a,e),Yt("moon",q("달")," is-small"),Rn(me)}const K=new Le,R=new Le,ae=new Le;K.add(R,ae),K.visible=!1;let te="solar",Ue=!1,mt=0;const ve={moon:new O,moonMat:u(new he({color:"#ffffff"})),shadow:u(new he({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new O,umbra:new O,skyCover:new O,skySun:new Le,skyMoon:new Le,skyMoonMat:u(new he({color:"#ffffff"}))},ht=[],En=N("sun.webp"),$t=N("moon.webp"),xn=new O(u(new Ae(.62,32,24)),u(new he({map:En})));xn.position.set(-3.3,0,0);const Tt=new O(u(new Ae(.4,32,24)),u(new he({map:N("earth-day.webp")})));Tt.position.set(1.85,0,0),ve.moonMat.map=$t,ve.moon=new O(u(new Ae(.14,24,18)),ve.moonMat),ve.cone=new O(u(new Ma(.04,.16,.78,18)),ve.shadow),ve.cone.position.set(1.42,0,0),ve.cone.rotation.z=Math.PI/2,ve.umbra=new O(u(new vo(.3,28)),u(new he({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),ve.umbra.position.set(2.75,0,.02),R.add(xn,Tt,ve.moon,ve.cone,ve.umbra);for(const[e,a]of[[q("태양"),new W(-3.3,.85,0)],[q("지구"),new W(1.85,.68,0)]]){const i=document.createElement("div");i.className="space-site",i.textContent=e,h.appendChild(i),ht.push({el:i,at:a,group:R})}const Nn=new O(u(new vo(1.35,48)),u(new he({map:En}))),Dt=new O(u(new vt(1.4,1.7,48)),u(new he({color:"#f0c36a",transparent:!0,opacity:.45,side:at,depthWrite:!1})));ve.skyCover=new O(u(new vo(1.22,48)),u(new he({color:"#141820"}))),ve.skySun.add(Nn,Dt,ve.skyCover),ve.skyMoonMat.map=$t;const io=new O(u(new vo(.92,48)),ve.skyMoonMat),un=new O(u(new vo(1.08,48)),u(new he({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));un.position.z=.16,ve.skyMoon.add(io,un),ae.add(ve.skySun,ve.skyMoon);const fe=document.createElement("div");fe.className="space-site is-stage",h.appendChild(fe),ht.push({el:fe,at:new W(0,-1.2,0),group:R}),ae.visible=!1,S.add(K);const xe=new Le;xe.visible=!1,xe.rotation.z=-Math.PI/2;const Ge=[],Ye=4.6,et=e=>Ye*e/696e3,ze=new O(u(new Ae(Ye,64,40)),u(new he({map:N("sun.webp")})));ze.position.set(-3.2,0,0),xe.add(ze);const it=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let qe=2.4;const Ze=(e,a)=>{const i=document.createElement("div");i.className="space-site",i.textContent=e,h.appendChild(i),Ge.push({el:i,at:a,group:xe})};Ze(q("태양"),new W(-3.2,4.9,0));for(const[e,a]of it){const i=et(a),d=qe+i;qe=d+i+.72;const x=go(e),T=e==="earth"?"earth-day.webp":x.texture,U=u(new he({color:x.color}));T&&_e(T,p=>{U.map=p,U.color.set("#ffffff"),U.needsUpdate=!0});const J=new O(u(new Ae(i,32,24)),U);if(J.position.set(d,0,0),x.axes&&J.scale.set(1,x.axes[2]/x.axes[0],x.axes[1]/x.axes[0]),xe.add(J),e==="saturn"){const p=i*1.18,z=i*2.08,F=u(new vt(p,z,96,1)),B=F.attributes.position,oe=F.attributes.uv,be=new W;for(let Ie=0;Ie<B.count;Ie+=1)be.fromBufferAttribute(B,Ie),oe.setXY(Ie,(be.length()-p)/(z-p),.5);const De=u(new he({color:"#b9b3ab",transparent:!0,opacity:.9,side:at,depthWrite:!1}));_e("saturn-ring.webp",Ie=>{De.map=Ie,De.color.set("#ffffff"),De.needsUpdate=!0});const Je=new O(F,De);Je.rotation.y=Math.PI/2-.36,J.add(Je)}Ze(x.name,new W(d,(e==="saturn"?i*2.08:i)+.12,0))}S.add(xe);const je=new Le;je.visible=!1;const rt=[],At=[],It=new O(u(new Ae(.55,48,32)),u(new he({color:"#e0703a"})));je.add(It);for(const[e,a]of[[1.35,.16],[2.1,.05]])je.add(new O(u(new Ae(.55*e,32,24)),u(new he({color:"#ff6a30",transparent:!0,opacity:a,side:no,blending:Xe,depthWrite:!1}))));const Vt=new O(u(new vt(2.6,5.1,96,1)),u(new he({color:"#3fbf7f",transparent:!0,opacity:.12,side:at,depthWrite:!1})));Vt.rotation.x=Math.PI/2,je.add(Vt),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,a,i,d,x],T)=>{const U=new ks(u(new en().setFromPoints(Array.from({length:128},(z,F)=>new W(Math.cos(F/128*Math.PI*2)*i*100,0,Math.sin(F/128*Math.PI*2)*i*100)))),u(new xo({color:"#8b95a1",transparent:!0,opacity:.35})));je.add(U);const J=new O(u(new Ae(.16*d,24,16)),ue(void 0,x,"earth"));je.add(J);const p=document.createElement("button");p.type="button",p.className="space-label is-small",p.textContent=e,p.addEventListener("click",()=>n.onExtra?.(`trappist-${e}`)),h.appendChild(p),rt.push({mesh:J,a:i*100,period:a,phase0:T*1.7,el:p})});const Sn=new ks(u(new en().setFromPoints(Array.from({length:256},(e,a)=>new W(Math.cos(a/256*Math.PI*2)*38.7,0,Math.sin(a/256*Math.PI*2)*38.7)))),u(new xo({color:"#c5b8a2",transparent:!0,opacity:.5})));je.add(Sn);for(const[e,a]of[["TRAPPIST-1",new W(0,1.1,0)],[q("생명가능지대(대략)"),new W(3.9,0,0)],[q("비교: 우리 수성의 궤도"),new W(0,0,38.7)]]){const i=document.createElement("div");i.className="space-site",i.textContent=e,h.appendChild(i),At.push({el:i,at:a})}S.add(je);const Ft=ni(u),nr=Ft.labels.map(({name:e,at:a})=>{const i=document.createElement("div");return i.className="space-site",i.textContent=e,h.appendChild(i),{el:i,at:a}});S.add(Ft.group);const Ct=ai(),na=[];if(Ct)for(const[e,a]of Object.entries(Ct.groups)){S.add(a);for(const i of Ct.markers[e]){const d=document.createElement("button");d.type="button",d.className="space-label",d.textContent=i.name,d.addEventListener("click",()=>{n.onMarker?.(i),Ve.target.copy(i.position),Ve.radius=jn[e]*(i.id==="cmb"?1.4:e==="group"?.6:.42)}),h.appendChild(d),na.push({level:e,marker:i,el:d})}}const Wa=[];if(Ct){const a=(T,U)=>new W(Math.cos(U*Et)*Math.cos(T*Et),Math.sin(U*Et),-Math.cos(U*Et)*Math.sin(T*Et)).multiplyScalar(140),i=[];for(const T of Object.values(Cs))for(const U of T)for(let J=0;J<U.length-1;J+=1){const p=a(U[J][0],U[J][1]),z=a(U[J+1][0],U[J+1][1]);i.push(p.x,p.y,p.z,z.x,z.y,z.z)}const d=u(new en);d.setAttribute("position",new ya(i,3));const x=new qs(d,u(new xo({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));Ct.groups.stars.add(x);for(const T of Jr){if(!Cs[T.id])continue;const U=document.createElement("button");U.type="button",U.className="space-label is-const",U.textContent=T.name.replace(/\(.*\)/,"").split(" · ")[0],U.addEventListener("click",()=>n.onConstellation?.(T.id)),h.appendChild(U),Wa.push({el:U,at:a(T.center[0],T.center[1])})}}const Po=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let Pe="system",Xn=!1,La=!1;const jn={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},Yn=new W,We={theta:.6,phi:.95,radius:34},Ve={target:new W,radius:We.radius};let ct="system",Mt=null,_t=null,Ht=null;function To(e){if((e==="system"||e==="sizes")&&Ce(),Pe=e,Xn=!1,D.visible=e==="system",K.visible=e==="eclipse",xe.visible=e==="sizes",je.visible=e==="exo",Ft.group.visible=e==="blackhole",Ct)for(const[a,i]of Object.entries(Ct.groups))i.visible=a===e;ct="system",Mt=null,_t=null,Ht=null,Ve.target.set(0,0,0),Ve.radius=jn[e],e!=="system"&&(We.phi=1.1),e==="eclipse"&&(R.rotation.z=l.aspect<1?-Math.PI/2:0,We.theta=0,We.phi=Ue?Math.PI/2:1.25,Ve.target.set(0,0,0),Ue||Ve.target.set(-.7,0,0).applyEuler(R.rotation),Ve.radius=Ue?6:l.aspect<1?10:7.5),e==="exo"&&(We.phi=.75),e==="blackhole"&&(We.phi=1.42),e==="sizes"&&(We.theta=0,We.phi=Math.PI/2,Ve.target.set(.6,-6.8,0),Ve.radius=19)}function oa(e){if(e!=="earth"&&Ce(),Xn=!1,Pe!=="system"&&(Pe="system",D.visible=!0,K.visible=!1,xe.visible=!1,je.visible=!1,Ft.group.visible=!1,Ct))for(const i of Object.values(Ct.groups))i.visible=!1;if(ct=e,_t=null,Ht=null,e==="system"){Mt=null,Ve.target.set(0,0,0),Ve.radius=jn.system;return}Mt=ke.get(e)??null;const a=de.get(e)??Qi(go(e).km);Ve.radius=e==="sun"?3.2:e==="jupiter"?3.4*He:e==="saturn"?2.6*He:Math.max(a*(go(e).ring?6:4.2),.25)}function or(e){const a=Re.get(e);a&&(Pe!=="system"&&To("system"),ct="system",Mt=a,_t=null,Ht=null,Ve.radius=e==="halley"?1.6:.6,cn=performance.now())}function ar(e){Ht=(e?Se.find(i=>i.parent===ct&&i.site.name===e.name):void 0)?.mesh??null,_t=Ht?new W:null,cn=performance.now()}let E=null,Ee=0,wt=-.12;const aa=62,Ua=18,Ga=85;let kn=aa,$n=0,Dn=0,Hn=0,Va=0,Ba=null,sa=null,Ke=null,Ne="idle",lt=0,zn=0,Ao=-1,ut=0,In=0,qt=0,Zt=0,co=0,Co=!1,lo=!1;const ra=3.6,Ro=2,sr=430;let Eo=0,an=0,Fn=0,uo=0,Oa=0,Xa=0;const qn=3.4,ja=6.6,No=2.8,Ya=4.6,_n=620;let ge=0,ye=0,Zn=0,dt=0,xt=0,bt=0,Wn=0,Kt=!0,fn=!1,ia=0,Wt=!0,fo=9.81,Ln="first",$a="office";const rr=4.6,Ha=1.8,qa=16;let Kn=rr,po=0,sn=Math.PI,Un=0,mo=0,Jn=0,Jt=Number.NaN,Gn=0,Vn=0,ca=new X("#000000"),Do=0;const ir=new X("#5a1206");let Io=0,la=0,ua=-24,fa=120;const Bt=new Set;function cr(){if(we.visible=!0,D.visible=Pe==="system",K.visible=Pe==="eclipse",xe.visible=Pe==="sizes",je.visible=Pe==="exo",Ft.group.visible=Pe==="blackhole",Ct)for(const[e,a]of Object.entries(Ct.groups))a.visible=e===Pe}function Za(e,a){E&&(S.remove(E.group),E.dispose(),E=null),os();const i=ei(e);Ba=e,sa=i,E=Ni(i,{low:o,anisotropy:y,onLand:d=>n.onSurfaceDrop?.({id:e,seconds:d.seconds,bounces:d.bounces,outcome:d.outcome}),onImpact:ur}),S.add(E.group),ca=new X(i.fog),Do=i.fogDensity,S.fog=new $r(ca.clone(),Do),Ee=(i.companion?i.companionAz:i.sunAz)*Et,wt=-.12,sn=Math.PI-Ee,Un=0,mo=0,Jn=0,Uo(),kn=aa,ge=E.standX,ye=E.standZ,Zn=0,dt=0,xt=0,bt=0,Wn=0,Kt=!0,fn=!1,ia=0,Wt=E.walkable,fo=Math.max(0,i.gravityMps2),Io=0,la=0,ua=i.terrain==="ring"?-24:-1,fa=i.terrain==="ring"?110:240,Dn=0,Hn=Math.max(.6,a),Va=i.cloudTop!==null?260:150,po=0,Jt=Number.NaN,an=0,Fn=0,uo=0,E.avatar.setSkin($a),E.avatar.setVisible(Ln==="third"),ns(),cn=performance.now()}function Ka(e){if(!E){if(we.visible=!1,D.visible=!1,K.visible=!1,xe.visible=!1,je.visible=!1,Ft.group.visible=!1,Ct)for(const a of Object.values(Ct.groups))a.visible=!1;h.style.display="none",re=null,Nt=null,j=!0,l.fov=62,l.near=.08,l.far=6e3,l.updateProjectionMatrix()}Za(e,1.9)}function lr(e){if(!E){Ka(e);return}Za(e,1.1)}function Ja(){E&&(Uo(),os(),S.remove(E.group),E.dispose(),E=null,S.fog=null,c.toneMappingExposure=1.1,h.style.display="",cr(),l.fov=45,l.near=.01,l.far=2e3,l.updateProjectionMatrix(),Yn.copy(Ve.target),We.radius=Ve.radius,cn=performance.now())}function pa(){if(!E)return;const e=4.2+Math.random()*1.4,a=(Math.random()-.5)*1.8,i=ge-E.standX+Math.sin(Ee)*e+Math.cos(Ee)*a,d=ye-E.standZ-Math.cos(Ee)*e+Math.sin(Ee)*a;E.drop(i,d)}function ur(){if(n.onSurfaceImpact?.(),!E)return;const e=Math.sin(Ee),a=-Math.cos(Ee),i=Math.hypot(ge-Oa,ye-Xa);if(i<46){const d=Math.max(.35,1-i/46);Gn-=e*(3.4+d*5.2),Vn-=a*(3.4+d*5.2),uo=2.8+d*.9,an=1,Fn=1,Qa(180)}else Gn-=e*8.2,Vn-=a*8.2;Wt?Kt&&(dt=Math.max(dt,2.8),Kt=!1):dt+=1.8}function fr(){if(!E)return;const e=22+Math.random()*8,a=(Math.random()-.5)*5,i=Math.sin(Ee),d=-Math.cos(Ee),x=ge+i*e+Math.cos(Ee)*a,T=ye+d*e+Math.sin(Ee)*a;Oa=x,Xa=T,E.impact.strike(x,T,i,d),ti()}function pn(){n.onSurfaceRocket?.({phase:Ne,count:zn,altitude:ut})}function Qa(e){try{const a=navigator;typeof a.vibrate=="function"&&a.vibrate(e)}catch{}}function es(){let e=ge+Math.sin(Ee)*20,a=ye-Math.cos(Ee)*20,i=1/0;for(const d of[-.55,-.28,0,.28,.55])for(const x of[18,20,22]){const T=Ee+d,U=ge+Math.sin(T)*x,J=ye-Math.cos(T)*x,p=E?.normalAt(U,J),z=p?Math.abs(p.x)+Math.abs(p.z):0,F=Math.hypot(U,J)>_n-40?6:0,B=z*7+F+Math.abs(d)*.7;B<i&&(i=B,e=U,a=J)}return{x:e,z:a}}function ts(e,a){!Ke||!E||(qt=e,Zt=a,co=E.walkable?E.meshHeightAt(e,a):E.floorAt(e,a),Ke.setBase(e,a,co),Ke.setFacing(Math.atan2(-(ye-a),ge-e)),Ke.setLift(0),Ke.setThrottle(0),Ke.setClamps(0),Ke.setPadVisible(!0))}function ns(){Ke||Co||!E||!sa||(Co=!0,Xi(c,sa).then(e=>{if(Co=!1,!E){e.dispose();return}Ke=e,E.group.add(e.group);const a=es();ts(a.x,a.z),lo&&(lo=!1,as())}).catch(()=>{Co=!1,lo=!1}))}function os(){Ia(),Ke&&(Ke.group.parent?.remove(Ke.group),Ke.dispose(),Ke=null),Ne="idle",zn=0,ut=0,In=0,lt=0,lo=!1}function as(){if(!(!E||Ne!=="idle")){if(ji(),Uo(),fn=!1,!Ke){lo=!0,ns();return}if(Math.hypot(ge-qt,ye-Zt)>34){const e=es();ts(e.x,e.z),Ke.setLift(95),Ne="land"}else Ne="run";lt=0,ut=0,In=0,zn=0,Jn=0,pn()}}function pr(e){return e==="sun"||e==="mercury"||e==="venus"||e==="earth"||e==="moon"||e==="mars"||e==="jupiter"||e==="saturn"||e==="uranus"||e==="neptune"||e==="pluto"||e==="eris"||e==="haumea"||e==="makemake"?e:e==="io"||e==="europa"||e==="ganymede"||e==="callisto"?"jupiter":e==="titan"||e==="enceladus"||e==="saturn-ring"?"saturn":e==="charon"?"pluto":"system"}function mr(e){if(!(!E||!Ke||Ne==="idle")){if(lt+=e,Ne==="land"){const a=Math.min(1,lt/1.9),i=1-Math.pow(1-a,3);Ke.setLift(95*(1-i)),a>=1&&(Ke.setLift(0),Ne="run",lt=0,pn());return}if(Ne==="run"){(Math.hypot(qt-ge,Zt-ye)<6.4||lt>16)&&(Ne="board",lt=0,pn());return}if(Ne==="board"){const a=Math.min(1,e*3.6);ge+=(qt-ge)*a,ye+=(Zt-ye)*a,lt>1.25&&(Ne="count",lt=0,zn=3,$i(Ro,10.5+ra,Math.max(0,fo)),pn());return}if(Ne==="count"){const a=Math.max(0,Math.ceil(3-lt));a!==zn&&(zn=a,Yi(zn===0),pn());const i=Math.max(0,Math.min(1,(lt-Ro)/.9));Ke.setThrottle(i),Ke.setClamps(Math.max(0,Math.min(1,(lt-Ro-.15)/.7))),i>0&&lt-e<=Ro&&(Qa(90),Eo=1),lt>=ra&&(Ne="lift",lt=0,In=0,pn());return}if(Ne==="lift"){const i=12.5/(1+Math.max(0,fo)*.075)*(.55+Math.min(.45,lt*.35));In+=i*e,ut+=In*e,Ke.setLift(ut),Ke.setThrottle(1),E.atmosphere(Math.min(.72,ut/640));const d=Math.round(ut);d!==Ao&&(Ao=d,pn()),ut>26&&Ke.setPadVisible(!1),ut>sr&&(Ne="escape",lt=0,pn());return}if(Ne==="escape"){const a=Math.min(1,lt/2.6);In+=40*e,ut+=In*e,Ke.setLift(ut),E.atmosphere(Math.max(.72,.72+a*.28));const i=Math.round(ut);i!==Ao&&(Ao=i,pn());const d=S.fog;if(d&&(d.density=Do*(1-a)),a>=1){const x=Ba;Ia(),Ne="idle",Ja(),oa(pr(x)),n.onSurfaceEscape?.()}}}}function dr(e,a){if(!E||!Ke)return;const i=co+qo;if(Ne==="board"||Ne==="count"){const x=Ne==="count"?Math.min(1,lt/ra):0,T=Math.atan2(qt-ge,Zt-ye)+1.05,U=30-x*7,J=qt+Math.sin(T)*U,p=Zt+Math.cos(T)*U;l.position.set(J,co+3.4+x*1.8,p),l.fov=58+x*10,l.updateProjectionMatrix(),l.lookAt(qt,i+14+x*26,Zt)}else if(Ne==="run"){const x=E.walkable?E.meshHeightAt(ge,ye):E.floorAt(ge,ye),T=Number.isNaN(Jt)?x+2.7:Jt;Jt=T+(x+2.7-T)*Math.min(1,a*3.2);const U=Math.cos(.17);l.position.set(ge-Math.sin(Ee)*U*6.8,Jt,ye+Math.cos(Ee)*U*6.8),l.fov=64,l.updateProjectionMatrix(),l.lookAt(ge,Jt-.4,ye)}else{const x=co+6+ut*.34,T=54+Math.min(190,ut*.34);l.position.set(qt+T*.42,x,Zt+T*.9),l.fov=70+Math.min(10,ut*.01),l.updateProjectionMatrix(),l.lookAt(qt,i+ut*.62+4,Zt)}Eo=Math.max(0,Eo-a*1.4);const d=Eo*.5+(Ne==="lift"||Ne==="escape"?Math.max(0,.22-ut*6e-4):0);d>.002&&(l.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*d*.9,l.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*d*.9,l.rotateZ(Math.sin(e*31.4)*d*.03))}function hr(e){Ln=e,e==="third"&&wt<-.32&&(wt=-.16),Jt=Number.NaN,wt=Math.min(.6,Math.max(-1.05,wt)),E&&E.avatar.setVisible(e==="third"),cn=performance.now()}function vr(e){$a=e,E&&E.avatar.setSkin(e)}function gr(e){if(!E)return;if(Dn<Hn){fn=!1;return}const a=(Bt.has("w")||Bt.has("arrowup")?1:0)-(Bt.has("s")||Bt.has("arrowdown")?1:0),i=(Bt.has("d")||Bt.has("arrowright")?1:0)-(Bt.has("a")||Bt.has("arrowleft")?1:0);let d=Io+a,x=la+i;if(an>.4&&(d=0,x=0,fn=!1),Ne!=="idle"){const oe=(Math.atan2(qt-ge,-(Zt-ye))-Ee+Math.PI*3)%(Math.PI*2)-Math.PI;Ee+=oe*Math.min(1,e*6),d=Ne==="run"||Ne==="board"?1:0,x=0}const T=Math.hypot(d,x);T>1&&(d/=T,x/=T);const U=Math.sin(Ee),J=-Math.cos(Ee),p=Math.cos(Ee),z=Math.sin(Ee),F=Math.min(1,e*(Wt?9:2.4));if(Wt){const B=Math.min(1,T),oe=Math.min(1,Math.max(0,(B-.7)/.3));mo+=(oe-mo)*Math.min(1,e*6);const be=qn+(ja-qn)*mo,De=(U*d+p*x)*be,Je=(J*d+z*x)*be,Ie=Math.min(1,e*(B>.02?8.5:5.2));xt+=(De-xt)*Ie,bt+=(Je-bt)*Ie,ge+=(xt+Gn)*e,ye+=(bt+Vn)*e,Gn*=Math.exp(-e*3.1),Vn*=Math.exp(-e*3.1);const $e=E.walk(ge,ye);if($e.x!==ge||$e.z!==ye){const Lt=$e.x-ge,kt=$e.z-ye,Rt=Math.hypot(Lt,kt);if(ge=$e.x,ye=$e.z,Rt>1e-4){const Be=Lt/Rt,zt=kt/Rt,ho=xt*Be+bt*zt;ho<0&&(xt-=Be*ho,bt-=zt*ho)}}const Fe=$e.rise;Un+=(Fe-Un)*Math.min(1,e*(Fe>Un?16:9));const tt=Math.hypot(ge,ye);if(tt>_n){const Lt=ge/tt,kt=ye/tt;ge=Lt*_n,ye=kt*_n;const Rt=xt*Lt+bt*kt;Rt>0&&(xt-=Rt*Lt,bt-=Rt*kt)}const ot=Math.hypot(xt,bt);ia+=e*(Kt?.8+ot*1.7:.8),fn&&Kt&&fo>.01&&(dt=Ya,Kt=!1),Kt||(dt-=fo*e,Zn+=dt*e,Zn<=0&&(Zn=0,po=Math.min(1,Math.abs(dt)/Ya),dt=0,Kt=!0))}else{const B=Math.cos(wt),oe=(Math.sin(Ee)*B*d+p*x)*No,be=Math.sin(wt)*d*No,De=(-Math.cos(Ee)*B*d+z*x)*No;xt+=(oe-xt)*F,bt+=(De-bt)*F,dt+=(be-dt)*F,fn&&(dt+=1.8),ge+=(xt+Gn)*e,ye+=(bt+Vn)*e,Gn*=Math.exp(-e*3.1),Vn*=Math.exp(-e*3.1),Wn+=dt*e;const Je=Math.hypot(ge,ye);if(Je>_n){const Ie=ge/Je,$e=ye/Je;ge=Ie*_n,ye=$e*_n;const Fe=xt*Ie+bt*$e;Fe>0&&(xt-=Fe*Ie,bt-=Fe*$e)}Wn<ua&&(Wn=ua,dt<0&&(dt=0)),Wn>fa&&(Wn=fa,dt>0&&(dt=0))}fn=!1}function yr(e,a){if(!E)return;if(E.update(e,a),Dn<Hn){Dn=Math.min(Hn,Dn+a);const oe=Dn/Hn,be=1-Math.pow(1-oe,3);$n=Va*(1-be),wt=-.12-.38*(1-be)}else $n!==0&&($n=0,Ln==="third"&&(wt=-.16));if(gr(a),mr(a),!E)return;po=Math.max(0,po-a*3.4),l.fov!==kn&&(l.fov=kn,l.updateProjectionMatrix());const i=Ln==="third";Wt&&!Kt&&(Un+=(0-Un)*Math.min(1,a*4));const d=Wt?Un:0,x=Wt?E.eyeY+E.meshHeightAt(ge,ye)+d+Zn:E.eyeY+Wn,T=x-E.eyeHeight+$n,U=Math.hypot(xt,bt);U>.25&&(sn=Math.atan2(xt,bt)),Jn=Math.max(0,Jn-a);const J=Io>.25||Bt.has("w")||Bt.has("arrowup");if(i&&J&&Jn<=0&&U>qn*.8){const be=(Math.PI-sn-Ee+Math.PI*3)%(Math.PI*2)-Math.PI;Ee+=be*Math.min(1,a*.8)}if(uo>0?(uo-=a,uo<=0&&(an=0)):an>0&&(an=0),an<=0&&Fn>0&&(Fn=Math.max(0,Fn-a*.4)),E.avatar.setDown(an),E.avatar.setBurn(Fn),E.avatar.setVisible(i&&(Ne==="idle"||Ne==="run")),i){const oe=E.normalAt(ge,ye),be=Math.sin(sn),De=Math.cos(sn),Je=Math.cos(sn),Ie=-Math.sin(sn),$e=-Math.asin(Math.max(-1,Math.min(1,oe.x*be+oe.z*De))),Fe=-Math.asin(Math.max(-1,Math.min(1,oe.x*Je+oe.z*Ie)));E.avatar.update(e,a,{x:ge,z:ye,feetY:T,facing:sn,speed:U,maxSpeed:Wt?qn+(ja-qn)*mo:No,grounded:Wt&&Kt,floating:!Wt,vy:dt,landing:po,shadowY:E.solidFloor?E.meshHeightAt(ge,ye):null,shockT:E.impact.sinceImpact(),slopePitch:Wt?Math.max(-.26,Math.min(.26,$e)):0,slopeRoll:Wt?Math.max(-.26,Math.min(.26,Fe)):0,groundNormal:{x:oe.x,y:oe.y,z:oe.z}})}if(i){const oe=Number.isNaN(Jt)?T+1.34:Jt;Jt=oe+(T+1.34-oe)*Math.min(1,a*3.2);const be=Jt,De=Math.cos(wt),Je=Math.sin(Ee)*De,Ie=Math.sin(wt),$e=-Math.cos(Ee)*De;let Fe=Kn,tt=ge-Je*Fe,ot=be-Ie*Fe,Lt=ye-$e*Fe;if(E.solidFloor){const kt=E.meshHeightAt,Rt=(Be,zt)=>Math.max(kt(Be,zt),kt(Be+.6,zt),kt(Be-.6,zt),kt(Be,zt+.6),kt(Be,zt-.6));for(let Be=0;Be<7;Be+=1){tt=ge-Je*Fe,Lt=ye-$e*Fe,ot=be-Ie*Fe;const zt=Rt(tt,Lt)+.85;if(ot>=zt)break;if(zt-ot<=2.4){ot=zt;break}if(Fe<=1.8){ot=zt;break}Fe=Math.max(1.8,Fe*.8)}}l.position.set(tt,ot,Lt),an>.25?l.lookAt(ge-Math.sin(sn)*.85,T+.35,ye-Math.cos(sn)*.85):l.lookAt(ge,be,ye)}else{const oe=Math.min(1,U/qn),be=Wt?Kt?Math.sin(ia*2)*.035*oe:0:Math.sin(e*.5)*.25,De=x+$n+be;l.position.set(ge,De,ye);const Je=Math.cos(wt);l.lookAt(ge+Math.sin(Ee)*Je,De+Math.sin(wt),ye-Math.cos(Ee)*Je)}Ne!=="idle"&&dr(e,a);const p=E.impact.shake();if(p>.002){const oe=p;l.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*oe*.6,l.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*oe*.6,l.position.z+=(Math.sin(e*41.9+2.1)+Math.sin(e*25.6)*.5)*oe*.45,l.rotateZ((Math.sin(e*35.2)*.6+Math.sin(e*21.7+1.1)*.4)*oe*.05)}const z=E.impact.flash();c.toneMappingExposure=1.1+z*5.4;const F=E.impact.doom(),B=S.fog;if(B){B.color.copy(ca).lerp(ir,F*.82);const oe=Ne==="lift"||Ne==="escape"?Math.max(.06,1-Math.min(.94,ut/520)):1;B.density=Do*(1+F*2.4)*oe}c.render(S,l)}const St=new Map,ma=new Map;let rn=0,Pn=0,Fo=!1,cn=0;const ss=new Ur,rs=new bo,is=e=>{if(ma.set(e.pointerId,{x:e.clientX,y:e.clientY}),E){if(r.setPointerCapture(e.pointerId),St.set(e.pointerId,{x:e.clientX,y:e.clientY}),St.size>=2){const[a,i]=[...St.values()];rn=Math.hypot(a.x-i.x,a.y-i.y),Fo=!0,Pn+=100}else Fo=!1,Pn=0;return}if(Ce(),r.setPointerCapture(e.pointerId),Xn=!1,St.set(e.pointerId,{x:e.clientX,y:e.clientY}),Pn=0,cn=performance.now(),St.size===2){const[a,i]=[...St.values()];rn=Math.hypot(a.x-i.x,a.y-i.y)}},cs=e=>{const a=St.get(e.pointerId);if(!a)return;const i=e.clientX-a.x,d=e.clientY-a.y;if(St.set(e.pointerId,{x:e.clientX,y:e.clientY}),E){if(St.size>=2){const[T,U]=[...St.values()],J=Math.hypot(T.x-U.x,T.y-U.y);rn>0&&J>0&&(Ln==="third"?Kn=Math.min(qa,Math.max(Ha,Kn*(rn/J))):kn=Math.min(Ga,Math.max(Ua,kn*(rn/J)))),rn=J,Pn+=Math.abs(i)+Math.abs(d)+10;return}Pn+=Math.abs(i)+Math.abs(d);const x=kn/aa;Ee-=i*.004*x,wt=Math.min(1.15,Math.max(-1.05,wt-d*.0035*x)),Math.abs(i)+Math.abs(d)>2&&(Jn=1.4);return}if(cn=performance.now(),St.size===1)Pn+=Math.abs(i)+Math.abs(d),We.theta-=i*.006,We.phi=Math.min(2.9,Math.max(.2,We.phi-d*.006)),_t=null,Ht=null;else if(St.size===2){const[x,T]=[...St.values()],U=Math.hypot(x.x-T.x,x.y-T.y);rn>0&&(Ve.radius=us(Ve.radius*(rn/U))),rn=U,Pn+=10}},_o=e=>{const a=ma.get(e.pointerId),i=Fo;if(ma.delete(e.pointerId),St.delete(e.pointerId),rn=0,St.size===0&&(Fo=!1),E){(a?Math.hypot(e.clientX-a.x,e.clientY-a.y):1/0)<12&&!i&&St.size===0&&pa();return}if(Pn<6&&n.onPick){const d=r.getBoundingClientRect();rs.set((e.clientX-d.left)/d.width*2-1,-((e.clientY-d.top)/d.height)*2+1),ss.setFromCamera(rs,l);const T=ss.intersectObjects([...ee.values(),...pt.values()],!1)[0]?.object.name;T&&ee.has(T)?n.onPick(T):T&&pt.has(T)&&n.onExtra?.(T)}},ls=e=>{if(E){e.preventDefault(),Ln==="third"?Kn=Math.min(qa,Math.max(Ha,Kn*(e.deltaY>0?1.1:.9))):kn=Math.min(Ga,Math.max(Ua,kn*(e.deltaY>0?1.1:.9)));return}e.preventDefault(),Ve.radius=us(Ve.radius*(e.deltaY>0?1.12:.89))};function us(e){return Pe!=="system"?Math.min(jn[Pe]*2.2,Math.max(jn[Pe]*.15,e)):Math.min(90,Math.max(ct==="system"&&!Mt?4:.15,e))}const fs=e=>{if(!E)return;const a=e.target;if(a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"||a.isContentEditable))return;const i=e.key.toLowerCase();if(e.code==="KeyE"||e.code==="KeyF"||i==="e"||i==="f"){if(e.repeat||Dn<Hn)return;e.preventDefault(),pa();return}(i===" "||i==="spacebar"||i==="w"||i==="a"||i==="s"||i==="d"||i.startsWith("arrow"))&&(e.preventDefault(),Bt.add(i==="spacebar"?" ":i),(i===" "||i==="spacebar")&&(fn=!0))},ps=e=>{const a=e.key.toLowerCase();Bt.delete(a==="spacebar"?" ":a)};window.addEventListener("keydown",fs),window.addEventListener("keyup",ps),r.addEventListener("pointerdown",is),r.addEventListener("pointermove",cs),r.addEventListener("pointerup",_o),r.addEventListener("pointercancel",_o),r.addEventListener("wheel",ls,{passive:!1});let mn=null,Wo=null,da=!matchMedia("(prefers-reduced-motion: reduce)").matches,ms=0,ds=0;da&&(mn=new Gr(c),mn.addPass(new Vr(S,l)),Wo=new Br(new bo(256,256),.75,.78,.92),mn.addPass(Wo),mn.addPass(new Or));const Te={w:1,h:1},hs=()=>{Te.w=t.clientWidth||1,Te.h=t.clientHeight||1,c.setSize(Te.w,Te.h,!1),mn?.setSize(Te.w,Te.h),Wo?.resolution.set(Te.w/2,Te.h/2),l.aspect=Te.w/Te.h,l.updateProjectionMatrix()};hs();const vs=new ResizeObserver(hs);vs.observe(t);let gs=!0;const ys=new IntersectionObserver(e=>{gs=e.some(a=>a.isIntersecting)});ys.observe(t);const Q=new W,Bn=new W,Qn=new W,ha=new W,Mr=new W,wr=new W,xr=new W,br=new W,Ms=new W,Sr=new W;let va=0,ws=performance.now(),ga=-1e9,xs=0;const bs=e=>{va=requestAnimationFrame(bs);const a=Math.min(.1,(e-ws)/1e3);if(ws=e,document.hidden||!gs)return;if(E){yr(e/1e3,a);return}if(Po||(So.uniforms.time.value=e/1e3),!Po){for(const p of G)p.uniforms.time.value=e/1e3;for(const p of ne)p.uniforms.uTime.value=e/1e3}e-cn>3e3&&!Po&&!_t&&!La&&!Xn&&Pe!=="eclipse"&&Pe!=="sizes"&&(We.theta+=a*(ct==="system"?.03:.08)),ft?.rotateY(a*.01);for(const[p,z]of ee){if(p==="earth"||p==="moon"||Ht&&p===ct)continue;const F=go(p).spinHours;Po||z.rotateY(a*(p==="sun"?.02:F?.12*(24/F)*.25:.12))}gt&&(gt.visible=l.position.length()>4);for(const p of g)p.material.uniforms.uDays.value=(me-Hi)/864e5,p.material.uniforms.uTime.value=e/1e3;for(const p of Z){const z=ee.get(p.parent);z&&p.mesh.material.uniforms.planetCenter.value.copy(z.getWorldPosition(Q))}for(const p of H)p.mesh.getWorldPosition(Q),p.material.uniforms.ringCenter.value.copy(Q),p.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(p.mesh.matrixWorld).normalize();if(j&&e-xs>1e3&&(xs=e,me=Date.now(),Rn(me)),re){const p=le.get(re.id),z=p.points.length,F=p.times[z-1],B=(p.frame==="earth"?6:25)*864e5,be=p.marks.some(Be=>Be.at!==void 0&&Be.body&&Be.body!=="earth"&&Math.abs(re.sim-Be.at)<B)?"slow":re.sim>=re.fastFrom?"fast":"normal",De=be==="slow"?Math.min(re.base,2*B/3):re.base*(be==="fast"?re.fast:1);re.sim=Math.min(F,re.sim+De*Math.min(a,.1)),p.frame==="sun"?Nt=(Nt??re.sim)+Math.min(a,.1)*.15*864e5:Nt=null,re.pace=be;const Je=(re.sim-p.times[0])/(F-p.times[0]||1);let Ie=0,$e=z-1;for(;$e-Ie>1;){const Be=Ie+$e>>1;p.times[Be]<=re.sim?Ie=Be:$e=Be}const Fe=p.times[$e]-p.times[Ie],tt=Ie+(Fe>0?(re.sim-p.times[Ie])/Fe:0),ot=Math.max(0,Math.min(z-2,Math.floor(tt))),Lt=tt-ot;p.probe.position.lerpVectors(p.points[ot],p.points[ot+1],Lt),on=tt,p.probe.lookAt(p.line.localToWorld(p.points[Math.min(z-1,ot+2)].clone())),p.line.geometry.setDrawRange(0,ot+2);const kt=p.times[ot]+(p.times[ot+1]-p.times[ot])*Lt;j=!1,me=kt,Rn(kt);let Rt=0;for(let Be=0;Be<p.marks.length;Be+=1){const zt=p.marks[Be],ho=zt.at??p.times[Math.min(z-1,zt.index)];re.sim>=ho-B&&(Rt=Be)}if((Rt!==re.mark||e-re.lastPing>250||re.sim>=F&&!re.done)&&(re.mark=Rt,re.lastPing=e,re.sim>=F&&(re.done=!0),n.onFlight?.({id:re.id,mark:p.marks[Rt],progress:Je,time:kt,done:re.done,pace:re.pace})),re.done){const Be=p.frame==="earth";re=null,Nt=null,j=!0,Mt=Be?ke.get("earth")??null:null,Be||Ve.target.set(0,0,0),Ve.radius=Be?4.2:72,We.phi=Be?.7:.45}}if(Mt&&Ve.target.copy(Mt.getWorldPosition(Q)),re){const p=le.get(re.id);let z=null,F=1/0;for(const oe of p.marks){if(!oe.body||oe.body==="earth"||oe.body==="far")continue;const be=Math.abs(oe.index-on);be<14&&be<F&&(z=oe,F=be)}const B=z?ke.get(z.body):void 0;if(B){const oe=B.getWorldPosition(xr).add(p.probe.getWorldPosition(br)).multiplyScalar(.5);Ve.target.copy(oe),Ve.radius=p.frame==="earth"?1.6:4.2}else Ve.radius=p.frame==="earth"?1.5:2.8}if(Yn.lerp(Ve.target,1-Math.pow(.002,a)),We.radius+=(Ve.radius-We.radius)*(1-Math.pow(.004,a)),_t&&Ht){const p=ee.get(ct)?.getWorldPosition(Ms)??Ms.set(0,0,0);_t.copy(Ht.getWorldPosition(Sr).sub(p).normalize());const z=Math.atan2(_t.x,_t.z),F=Math.acos(Math.max(-1,Math.min(1,_t.y)));let B=z-We.theta;B=Math.atan2(Math.sin(B),Math.cos(B)),We.theta+=B*(1-Math.pow(.01,a)),We.phi+=(F-We.phi)*(1-Math.pow(.01,a))}if(Pe==="blackhole"&&Ft.update(e/1e3,l),Pe==="exo"){const p=e/1e3;for(const z of rt){const F=z.phase0+p/z.period*Math.PI*2;z.mesh.position.set(Math.cos(F)*z.a,0,Math.sin(F)*z.a)}}if(Pe==="eclipse"){mt=(mt+a*.18)%1;const p=Math.sin(mt*Math.PI*2),z=Math.abs(p)<.22,F=Math.max(0,1-Math.abs(p)/.9),B=te==="lunar";if(R.visible=!Ue,ae.visible=Ue,ve.skySun.visible=!B,ve.skyMoon.visible=B,Ue)B?(ve.skyMoon.position.set(p*1.7,0,.08),ve.skyMoonMat.color.set("#f2f2f2").lerp(new X("#c47462"),B?F:0)):ve.skyCover.position.set(p*1.7,0,.08);else{ve.moon.position.set(B?2.75:1.05,p*.55,0),ve.cone.visible=!B,ve.umbra.visible=B,ve.shadow.opacity=z?.42:.08,ve.umbra.material.opacity=z?.42:.08,ve.moonMat.color.set("#ffffff").lerp(new X("#c47462"),B?F:0);const oe=z?q("개기"):Math.abs(p)<.6?q("부분"):B?q("반영"):"";fe.textContent!==oe&&(fe.textContent=oe)}}if(l.position.set(Yn.x+We.radius*Math.sin(We.phi)*Math.sin(We.theta),Yn.y+We.radius*Math.cos(We.phi),Yn.z+We.radius*Math.sin(We.phi)*Math.cos(We.theta)),l.lookAt(Yn),P&&(P.getWorldPosition(Q),wn.copy(Q).multiplyScalar(-1).normalize(),e-ga>500&&!(re&&le.get(re.id)?.frame==="sun"))){ga=e;const p=Qr(new Date(me)),z=Math.atan2(p.y,p.x),F=Math.atan2(-wn.z,wn.x),B=P.children[0];B.rotation.y=F-z}mn&&da&&Pe!=="blackhole"&&(Pe!=="system"||ct==="system"||ct==="sun")&&mn?(mn.render(a),ms+=1,ds+=a,ms===90&&ds/90>.034&&(da=!1)):c.render(S,l),l.getWorldDirection(Bn),w();const x=[];for(const p of ea){const z=nt.get(p),F=ke.get(p);if(!z||!F)continue;F.getWorldPosition(Q);const B=Qn.copy(Q).sub(l.position).dot(Bn)>0,oe=ct==="system"&&Pe==="system"&&(!Mt||re!==null),be=ct==="earth"||ct==="moon"||re!==null&&le.get(re.id)?.frame==="earth";let De=B&&(p==="moon"?Pe==="system"&&be:oe||be&&p==="earth"&&re!==null);Q.project(l);const Je=(Q.x+1)/2*Te.w;let Ie=Je;const $e=(1-Q.y)/2*Te.h+10;if(De){let Fe=ko.get(p)??0;Fe||(z.style.display="block",Fe=z.offsetWidth||40,ko.set(p,Fe)),Ie=Math.min(Math.max(Je,Fe/2+4),Math.max(Fe/2+4,Te.w-Fe/2-4));const tt={x:Ie-Fe/2,y:$e,w:Fe,h:22};k(tt.x,tt.y,tt.w,tt.h)||x.some(ot=>tt.x<ot.x+ot.w+4&&tt.x+tt.w+4>ot.x&&tt.y<ot.y+ot.h&&tt.y+tt.h>ot.y)?De=!1:x.push(tt)}z.style.display=De?"block":"none",De&&(z.style.transform=`translate(${Ie}px, ${$e}px) translate(-50%, 0)`)}const T=Pe==="system",U=ct!=="system"&&ct!=="jupiter"&&ct!=="saturn",J=Mt!==null&&(re===null?Mt===ke.get("earth"):le.get(re.id)?.frame==="earth");for(const p of jt)p.visible=!U&&!J;for(const[p,z]of Xt){const F=Re.get(p),B=z.parent?ke.get(z.parent)===Mt:ct==="system"&&(!Mt||Mt===F),oe=Mt===F||B;F.getWorldPosition(Q);const be=Qn.copy(Q).sub(l.position).dot(Bn)>0,De=T&&be&&oe;Q.project(l),z.el.style.display=De?"block":"none",De&&(z.el.style.transform=`translate(${(Q.x+1)/2*Te.w}px, ${(1-Q.y)/2*Te.h+8}px) translate(-50%, 0)`)}for(const[p,z]of le){const F=T&&I===p;if(z.line.visible=F,!F){z.el.style.display="none";continue}z.probe.getWorldPosition(Q);const B=Qn.copy(Q).sub(l.position).dot(Bn)>0;Q.y+=0,Q.project(l),z.el.style.display=B?"block":"none",B&&(z.el.style.transform=`translate(${(Q.x+1)/2*Te.w}px, ${(1-Q.y)/2*Te.h}px) translate(10px, -50%)`)}for(const p of Wa){if(Pe!=="stars"){p.el.style.display="none";continue}Q.copy(p.at);const z=Qn.copy(Q).sub(l.position).dot(Bn)>0;Q.project(l);const F=z&&Math.abs(Q.x)<1&&Math.abs(Q.y)<1;p.el.style.display=F?"block":"none",F&&(p.el.style.transform=`translate(${(Q.x+1)/2*Te.w}px, ${(1-Q.y)/2*Te.h}px) translate(-50%, -50%)`)}for(const p of na){if(!(p.level===Pe)){p.el.style.display="none";continue}Q.copy(p.marker.position);const F=Qn.copy(Q).sub(l.position).dot(Bn)>0;Q.project(l),p.el.style.display=F?"block":"none",F&&(p.el.style.transform=`translate(${(Q.x+1)/2*Te.w}px, ${(1-Q.y)/2*Te.h+8}px) translate(-50%, 0)`)}for(const p of rt){if(Pe!=="exo"){p.el.style.display="none";continue}p.mesh.getWorldPosition(Q);const z=Qn.copy(Q).sub(l.position).dot(Bn)>0;Q.project(l),p.el.style.display=z?"block":"none",z&&(p.el.style.transform=`translate(${(Q.x+1)/2*Te.w}px, ${(1-Q.y)/2*Te.h+8}px) translate(-50%, 0)`)}for(const p of nr){if(Pe!=="blackhole"){p.el.style.display="none";continue}Q.copy(p.at),Ft.group.localToWorld(Q),Q.project(l);const z=Q.z<1&&Math.abs(Q.x)<1.05&&Math.abs(Q.y)<1.05;p.el.style.display=z?"block":"none",z&&(p.el.style.transform=`translate(${(Q.x+1)/2*Te.w}px, ${(1-Q.y)/2*Te.h}px) translate(-50%, -100%)`)}for(const p of At){if(Pe!=="exo"){p.el.style.display="none";continue}Q.copy(p.at).project(l);const z=Q.z<1&&Math.abs(Q.x)<1.05&&Math.abs(Q.y)<1.05;p.el.style.display=z?"block":"none",z&&(p.el.style.transform=`translate(${(Q.x+1)/2*Te.w}px, ${(1-Q.y)/2*Te.h}px) translate(-50%, -100%)`)}for(const[p,z]of[[ht,Pe==="eclipse"&&!Ue],[Ge,Pe==="sizes"]])for(const F of p){if(!z){F.el.style.display="none";continue}Q.copy(F.at).applyMatrix4(F.group.matrixWorld).project(l);let B=Q.z<1&&Math.abs(Q.x)<1.1&&Math.abs(Q.y)<1.1;const oe=(Q.x+1)/2*Te.w,be=(1-Q.y)/2*Te.h,De=F.el.offsetWidth||44;B&&k(oe-De/2,be-11,De,22)&&(B=!1),F.el.style.display=B?"block":"none";const Je=F.group.rotation.z!==0;B&&(F.el.style.transform=`translate(${(Q.x+1)/2*Te.w}px, ${(1-Q.y)/2*Te.h}px) ${Je?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const p of Se){p.mesh.getWorldPosition(Q);const z=ee.get(p.parent);z?z.getWorldPosition(ha):ha.set(0,0,0);let B=Mr.copy(Q).sub(ha).normalize().dot(wr.copy(l.position).sub(Q).normalize())>.15&&Pe==="system"&&ct===p.parent;Q.project(l),B&&k((Q.x+1)/2*Te.w+8,(1-Q.y)/2*Te.h-11,90)&&(B=!1),p.el.style.display=B?"block":"none",B&&(p.el.style.transform=`translate(${(Q.x+1)/2*Te.w}px, ${(1-Q.y)/2*Te.h}px) translate(8px, -50%)`)}};return va=requestAnimationFrame(bs),Me===0&&n.onReady?.(),typeof window<"u"&&location.search.includes("surfdebug")&&(window.__surfDebug=()=>({surf:E?{shock:E.impact.sinceImpact(),doom:E.impact.doom(),flash:E.impact.flash(),shake:E.impact.shake(),stats:E.impact.stats()}:null,x:Number(ge.toFixed(2)),z:Number(ye.toFixed(2)),y:Number(l.position.y.toFixed(2)),yaw:Number(Ee.toFixed(2)),pitch:Number(wt.toFixed(2)),jump:Number(Zn.toFixed(2)),knock:[Number(Gn.toFixed(2)),Number(Vn.toFixed(2))],mode:Ln,alt:Number($n.toFixed(2)),ground:E?Number(E.meshHeightAt(ge,ye).toFixed(2)):null,camY:Number(l.position.y.toFixed(2)),cam:[Number(l.position.x.toFixed(2)),Number(l.position.z.toFixed(2))],feet:E?Number((E.eyeY+E.meshHeightAt(ge,ye)-E.eyeHeight).toFixed(2)):null,third:Number(Kn.toFixed(2)),down:Number(an.toFixed(2)),burn:Number(Fn.toFixed(2)),rocket:{phase:Ne,alt:Number(ut.toFixed(1)),count:zn,pad:[Number(qt.toFixed(1)),Number(Zt.toFixed(1))]}})),{focus:oa,setLevel:To,setPaused:e=>{La=e},focusMarker:e=>{const a=na.find(i=>i.level===Pe&&i.marker.id===e);a&&(Ve.target.copy(a.marker.position),Ve.radius=jn[Pe]*(e==="cmb"?1.4:Pe==="group"?.6:.42),cn=performance.now())},showSite:ar,focusExtra:or,setEclipse:(e,a)=>{te=e,Ue=a,To("eclipse")},setHemisphere:e=>{ct!=="earth"&&oa("earth");const a=wn.clone().multiplyScalar(e==="day"?1:-1);We.theta=Math.atan2(a.x,a.z),We.phi=Math.min(2.6,Math.max(.5,Math.acos(a.y))),_t=null,Ht=null,Xn=!0},enterSurface:Ka,setSurfaceWorld:lr,exitSurface:Ja,setSurfaceMove:(e,a)=>{Io=Math.min(1,Math.max(-1,e)),la=Math.min(1,Math.max(-1,a))},jumpSurface:()=>{fn=!0},setSurfaceMode:hr,setSurfaceSkin:vr,impactSurface:fr,launchSurfaceRocket:as,dropProbe:pa,setTime:e=>{j=e===null,me=e??Date.now(),Rn(me),ga=-1e9},setVoyage:e=>{if(I=e,!e){re&&(re=null,j=!0),Nt=null;for(const z of le.values())z.line.geometry.setDrawRange(0,1/0);return}Pe!=="system"&&To("system"),Nt=null;const a=le.get(e);a.line.geometry.setDrawRange(0,2),ct="system",_t=null,Ht=null,Xn=!1,Mt=a.probe;const i=a.frame==="earth";Ve.radius=i?1.3:2.8,We.phi=i?.75:1;const d=Math.max(...a.marks.filter(z=>z.at!==void 0&&z.body!=="earth").map(z=>z.at),a.times[0]+864e5),x=a.times[0],T=a.times[a.times.length-1],U=(d-x)/(i?20:24),J=a.frame==="earth"?T:d+60*864e5,p=T>J?(T-J)/4/U:1;re={id:e,sim:x,base:U,fastFrom:J,fast:p,mark:-1,done:!1,lastPing:0,pace:"normal"},cn=performance.now()},dispose:()=>{Uo(),Ct?.dispose(),mn?.dispose(),Wo?.dispose(),E&&(S.remove(E.group),E.dispose(),E=null),cancelAnimationFrame(va),vs.disconnect(),ys.disconnect(),window.removeEventListener("keydown",fs),window.removeEventListener("keyup",ps),r.removeEventListener("pointerdown",is),r.removeEventListener("pointermove",cs),r.removeEventListener("pointerup",_o),r.removeEventListener("pointercancel",_o),r.removeEventListener("wheel",ls),S.traverse(e=>{const a=e.material;Array.isArray(a)&&a.forEach(i=>i.dispose())}),A.forEach(e=>e.dispose()),c.dispose(),r.remove(),h.remove()}}}export{Mc as createSpace};
