import{t as q,a as Tr}from"./index-DKQ9srnu.js";import{G as Le,a as X,f as Ce,M as he,g as qe,A as Oe,D as nt,V as U,R as yt,P as So,h as lo,d as Zn,c as fo,S as po,b as Y,i as Kt,j as xn,k as ta,l as na,I as Mn,m as oa,n as Ea,O as ko,N as zs,e as bn,o as Ua,p as Na,q as Ar,L as Cr,r as Rr,s as Js,t as Po,u as Qs,v as zo,w as Ko,x as Fa,y as er,z as Er,T as tr,F as Nr,H as Fr,J as Ir,K as Ia,W as Dr,U as _r,X as Wr,Y as Lr,Z as Ur,_ as Gr,$ as Sa,a0 as Vr,C as wo,a1 as Ts,a2 as Br,a3 as Or,a4 as jr,a5 as Xr,a6 as Yr,a7 as Hr,a8 as As,a9 as Cs,aa as $r,ab as Zr}from"./three-H8UiDSEP.js";import{af as qr,ag as Rs,ah as Kr,ai as ka,aj as Es,ak as Jr,al as Qr,am as xo,C as ei,an as ti,ao as Bo,ap as ni}from"./App-BsW1uycq.js";import{g as nr,U as Oo,V as oi}from"./audio-48BCgUfR.js";import{C as Ns}from"./sky-C2DE1ex2.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";const Fs=`
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
`,jo=3,Pa=9;function ai(t){const n=new Le;n.visible=!1,n.rotation.z=.1;const o=new X(t(new Ce(1,48,32)),t(new he({color:"#000000"})));o.renderOrder=0,n.add(o);const r=t(new qe({uniforms:{uTime:{value:0},uCam:{value:new U}},transparent:!0,depthWrite:!1,side:nt,blending:Oe,vertexShader:`
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
        ${Fs}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${jo.toFixed(1)}) / ${(Pa-jo).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${jo.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),c=new X(t(new yt(jo,Pa,256,8)),r);c.rotation.x=-Math.PI/2,c.renderOrder=1,n.add(c);const y=t(new qe({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:Oe,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${Fs}
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
      `})),i=new X(t(new So(8,8)),y);i.renderOrder=2,n.add(i);const v=[{name:q("궁수자리 A*"),at:new U(0,3.6,0)},{name:q("사건의 지평선"),at:new U(0,-2.9,0)},{name:q("강착 원반"),at:new U(Pa-1.2,0,0)}],S=new U;return{group:n,labels:v,update(w,P){r.uniforms.uTime.value=w,y.uniforms.uTime.value=w,P.getWorldPosition(S),r.uniforms.uCam.value.copy(S),i.lookAt(S)}}}const bo=Math.PI/180;function qt(t,n,o){return new U(Math.cos(n*bo)*Math.cos(t*bo),Math.sin(n*bo),-Math.cos(n*bo)*Math.sin(t*bo)).multiplyScalar(o)}function si(){const n=document.createElement("canvas");n.width=64,n.height=64;const o=n.getContext("2d");if(o){const r=o.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,"rgba(255,255,255,1)"),r.addColorStop(.25,"rgba(255,255,255,0.75)"),r.addColorStop(1,"rgba(255,255,255,0)"),o.fillStyle=r,o.fillRect(0,0,64,64)}return new Zn(n)}function ri(){const t=[],n=w=>(t.push(w),w),o=n(si());function r(w,P,k){const x=new fo(n(new po({map:o,color:new Y(w),transparent:!0,depthWrite:!1,blending:Oe})));return x.scale.setScalar(P),x.position.copy(k),x}function c(w,P,k){const x=new Float32Array(w*3),l=new Float32Array(w*3);for(let m=0;m<w;m+=1){const[H,F]=P(m);x.set([H.x,H.y,H.z],m*3),l.set([F.r,F.g,F.b],m*3)}const C=n(new Kt);return C.setAttribute("position",new xn(x,3)),C.setAttribute("color",new xn(l,3)),new ta(C,n(new na({size:k,map:o,vertexColors:!0,transparent:!0,depthWrite:!1,blending:Oe,sizeAttenuation:!0})))}let y=7;const i=()=>(y=y*16807%2147483647,(y-1)/2147483646),v={},S={};{const w=new Le,P=2.6,k=[["alphacen",q("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",q("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",q("바너드별"),269.45,4.69,5.96,"#ffb27a",q("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",q("울프 359"),164.12,7.01,7.86,"#ff9a6a",q("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",q("시리우스"),101.29,-16.72,8.6,"#cfe0ff",q("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",q("로스 154"),282.46,-23.84,9.69,"#ffa070",q("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",q("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",q("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",q("백조자리 61"),316.7,38.75,11.4,"#ffc58a",q("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",q("프로키온"),114.83,5.22,11.46,"#fff3d6",q("작은개자리의 밝은 별이에요.")],["epsind",q("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",q("남쪽 하늘의 가까운 별이에요.")],["taucet",q("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",q("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];w.add(r("#ffe39a",3.2,new U));const x=[{id:"sun-star",name:q("태양"),line:q("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new U}];for(const[l,C,m,H,F,$,K]of k){const I=qt(m,H,F*P);w.add(r($,2.4,I)),x.push({id:l,name:C,line:Tr("{0} 거리 약 {1}광년.",K,F),position:I})}w.add(c(500,()=>[new U(i()-.5,i()-.5,i()-.5).normalize().multiplyScalar(60+i()*30),new Y().setHSL(.1,.3,.5+i()*.4)],.9)),v.stars=w,S.stars=x}{const w=new Le,P=1/40,k=[["pleiades",q("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,q("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",q("베텔게우스"),88.79,7.41,548,"#ffab6e",3,q("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",q("리겔"),78.63,-8.2,860,"#cfe0ff",3,q("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",q("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,q("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",q("데네브"),310.36,45.28,2600,"#e6eeff",3,q("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];w.add(r("#ffe39a",1.6,new U));const x=[{id:"sun-orion",name:q("태양"),line:q("우리은하의 오리온 팔 안쪽에 있어요."),position:new U}];for(const[l,C,m,H,F,$,K,I]of k){const fe=qt(m,H,F*P);w.add(r($,K,fe)),l==="orionneb"&&w.add(c(260,()=>{const re=Math.pow(i(),.6)*5;return[new U(i()-.5,i()-.5,i()-.5).normalize().multiplyScalar(re).add(fe),new Y(i()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),x.push({id:l,name:C,line:I,position:fe})}w.add(c(1400,()=>{const l=(i()-.5)*120,C=(i()-.5)*22*(.4+i()),m=(i()-.5)*4;return[new U(l,m,C),new Y().setHSL(.6+i()*.1,.3,.35+i()*.3)]},.8)),v.orion=w,S.orion=x}{const w=new Le,P=4;w.add(c(9e3,x=>{const l=x%P,C=Math.pow(i(),.55)*25,m=l/P*Math.PI*2+Math.log(1+C)*1.9+(i()-.5)*(.5+4/(C+2)),H=(i()-.5)*(C<4?2.2:.7),F=C<4,$=F?new Y("#ffd9a0"):new Y().setHSL(.58+i()*.06,.45,.45+i()*.35);return[new U(Math.cos(m)*C,H,Math.sin(m)*C),$.multiplyScalar(F?.8:.6)]},.55)),w.add(r("#fff0c8",7,new U));const k=new U(13,0,0);w.add(r("#ffe39a",1.2,k)),v.galaxy=w,S.galaxy=[{id:"center",name:q("은하 중심(궁수자리 A*)"),line:q("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new U},{id:"sun-gal",name:q("태양은 여기"),line:q("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:k}]}{const w=new Le,P=1/1e5,k=(F,$,K,I,fe)=>c(I,re=>{const J=Math.pow(i(),.6)*$,me=re%2*Math.PI+Math.log(1+J*3)*2.2+(i()-.5)*.9,le=new U(Math.cos(me)*J,(i()-.5)*$*.05,Math.sin(me)*J);le.applyAxisAngle(new U(1,0,0),K);const L=J<$*.18;return[le.add(F),new Y().setHSL(L?.1:fe,.4,.45+i()*.3).multiplyScalar(L?.35:.22)]},.4),x=new U;w.add(k(x,2.2,0,1800,.6));const l=qt(10.68,41.27,25e5*P);w.add(k(l,4.4,1.2,3200,.1));const C=qt(23.46,30.66,273e4*P);w.add(k(C,1.6,.6,900,.62));const m=qt(80.89,-69.76,16e4*P);w.add(r("#cfd8ff",1.2,m));const H=qt(13.19,-72.83,2e5*P);w.add(r("#cfd8ff",.8,H)),v.group=w,S.group=[{id:"mw",name:q("우리 은하"),line:q("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:x},{id:"andromeda",name:q("안드로메다은하"),line:q("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:l},{id:"triangulum",name:q("삼각형자리은하"),line:q("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:C},{id:"lmc",name:q("대마젤란은하"),line:q("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:m}]}{const w=new Le,P=6,k=(F,$,K)=>new U(F,$,K).multiplyScalar(P),x=k(5.1,.35,1.1),l=k(3.4,.45,.2),C=k(-1.4,-.3,-.5),m=[[k(.2,0,0),900,6.4*P*.5],[l,280,1.5*P*.5],[C,220,1.7*P*.5],[k(-2.2,1.6,2.4),120,1.1*P*.5]],H=m.reduce((F,$)=>F+$[1],0);w.add(c(H+180,F=>{let $=F;for(const[I,fe,re]of m){if($<fe)return[new U(i()-.5,(i()-.5)*.5,i()-.5).multiplyScalar(2*re*Math.pow(i(),.5)).add(I),new Y("#f3eee6").multiplyScalar(.75)];$-=fe}const K=i();return[x.clone().lerp(C,K).add(new U((i()-.5)*.7*P,(i()-.5)*.45*P,(i()-.5)*.7*P)),new Y("#e7c48a").multiplyScalar(.8)]},.5)),w.add(new X(n(new Ce(.95*P,20,16)),n(new he({color:"#d5e2f5",transparent:!0,opacity:.1,blending:Oe,depthWrite:!1}))).translateX(l.x).translateY(l.y).translateZ(l.z)),w.add(new X(n(new Ce(1.05*P,20,16)),n(new he({color:"#e7c48a",transparent:!0,opacity:.09,blending:Oe,depthWrite:!1}))).translateX(C.x).translateY(C.y).translateZ(C.z)),w.add(r("#e4b56a",1.2,x)),v.super=w,S.super=[{id:"localgroup",name:q("우리 은하군"),line:q("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:x},{id:"virgo-sc",name:q("처녀자리 은하단"),line:q("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:l},{id:"attractor-sc",name:q("거대 인력체"),line:q("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:C}]}{const w=new Le,P=1/1e7,k=qt(187.7,12.4,54e6*P),x=qt(243,-60,2e8*P);w.add(c(5e3,C=>{const m=C%5,F=[k,x,qt(30,20,15e7*P),qt(160,-30,18e7*P),qt(300,40,14e7*P)][m],$=m===1?7:4;return[new U((i()-.5)*2,(i()-.5)*2,(i()-.5)*2).multiplyScalar($*Math.pow(i(),.4)).add(F),new Y().setHSL(.08+i()*.5,.35,.55).multiplyScalar(.8)]},.8)),w.add(r("#ffffff",.8,new U));const l=new X(n(new Ce(42,48,32)),n(new he({color:"#ff8a4a",transparent:!0,opacity:.08,side:lo,depthWrite:!1})));w.add(l),v.cosmos=w,S.cosmos=[{id:"here",name:q("우리 은하"),line:q("여기서는 점 하나예요."),position:new U},{id:"virgo",name:q("처녀자리 은하단"),line:q("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:k},{id:"attractor",name:q("거대 인력체"),line:q("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:x},{id:"cmb",name:q("가장 오래된 빛"),line:q("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new U(0,0,-42)}]}for(const w of Object.values(v))w.visible=!1;return{groups:v,markers:S,dispose:()=>t.forEach(w=>w.dispose())}}const Xo=1.7,Is=t=>{const n=Math.min(1,Math.max(0,t));return n*n*(3-2*n)};function Ds(t){try{const n=navigator;typeof n.vibrate=="function"&&n.vibrate(t)}catch{}}function za(t,n,o){const c=document.createElement("canvas");c.width=128,c.height=128;const y=c.getContext("2d"),i=y.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);i.addColorStop(0,t),i.addColorStop(.35,n),i.addColorStop(1,o),y.fillStyle=i,y.fillRect(0,0,128,128);const v=new Zn(c);return v.colorSpace=bn,v}function ii(t){const n=new Le,o=(()=>{let Q=2654435769;return()=>(Q=Q*1664525+1013904223>>>0,Q/4294967296)})(),r=za("rgba(255,255,255,1)","rgba(255,168,64,0.85)","rgba(255,90,0,0)"),c=za("rgba(120,104,96,0.55)","rgba(70,60,56,0.35)","rgba(40,34,32,0)"),y=za("rgba(255,255,255,1)","rgba(255,214,160,0.7)","rgba(255,140,40,0)"),i=[r,c,y],v=Q=>(i.push(Q),Q),S=new Le,w=new X(v(new Mn(1,1)),v(new he({color:new Y(2757128),fog:!1})));w.scale.setScalar(15),S.add(w);const P=new X(v(new Mn(1,1)),v(new he({color:new Y(16742946),transparent:!0,opacity:.85,blending:Oe,depthWrite:!1,fog:!1})));P.scale.setScalar(21),S.add(P);const k=(Q,G,V,oe=Oe)=>{const ye=v(new po({map:Q,color:new Y(G),transparent:!0,depthWrite:!1,blending:oe,fog:!1})),j=new fo(ye);return j.scale.setScalar(V),j},x=k(y,16747050,150);S.add(x);const l=k(r,16765562,70);S.add(l),S.visible=!1,n.add(S);const C=[],m=96;for(let Q=0;Q<m;Q+=1){const G=Q%3===0,V=k(G?c:r,G?9074022:16747571,1,G?zs:Oe);V.visible=!1,n.add(V),C.push({sprite:V,mat:V.material,life:0,max:1,from:1,to:1,rise:0,driftX:1,driftZ:1,spin:0,smoke:G})}let H=0;const F=(Q,G,V,oe,ye,j,W)=>{let ce=null;for(let Et=0;Et<C.length;Et+=1){const Mt=C[(H+Et)%C.length];if(Mt.smoke===G&&(Mt.life<=0||!ce)&&(ce=Mt,H=(H+Et+1)%C.length,Mt.life<=0))break}ce&&(ce.sprite.position.copy(Q),ce.sprite.visible=!0,ce.life=oe,ce.max=oe,ce.from=V*.45,ce.to=V,ce.rise=ye,ce.driftX=(o()-.5)*j,ce.driftZ=(o()-.5)*j,ce.spin=(o()-.5)*1.4,ce.sprite.material.rotation=o()*Math.PI*2,ce.mat.opacity=G?.46:.55,W!==void 0?ce.mat.color.setHex(W):ce.mat.color.setHex(G?7035474:16742946),ce.sprite.scale.setScalar(ce.from))},$=new X(v(new Ce(1,32,20)),v(new he({color:new Y(16757575),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,side:nt,fog:!1})));$.visible=!1,n.add($);const K=new X(v(new Ce(1,24,16)),v(new he({color:new Y(16774872),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,side:nt,fog:!1})));K.visible=!1,n.add(K);const I=new X(v(new Ce(1,28,18)),v(new he({color:new Y(16731410),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,side:nt,fog:!1})));I.visible=!1,n.add(I);const fe=[],re=(Q,G,V,oe,ye,j,W)=>{const ce=v(new he({color:new Y(V),transparent:!0,opacity:oe,blending:Oe,depthWrite:!1,side:nt,fog:!1})),Et=v(new yt(Q,G,64,1)),Mt=new X(Et,ce);ye&&(Mt.rotation.x=-Math.PI/2),Mt.visible=!1,n.add(Mt);const kn={mesh:Mt,mat:ce,grow:j,life:0,max:W,flat:ye};return fe.push(kn),kn};re(.92,1,16742946,.9,!0,480,1.3),re(.9,1,16726538,.75,!0,620,1.9),re(.86,1,16765066,.7,!0,340,.9),re(.82,1,11569770,.5,!0,420,2.6),re(.95,1,16769712,.55,!1,700,1.6);const J=220,me=v(new Kt),le=new Float32Array(J*3),L=new Float32Array(J*3);me.setAttribute("position",new xn(le,3));const ne=v(new na({color:new Y(16756832),size:2.4,transparent:!0,opacity:0,depthWrite:!1,blending:Oe,sizeAttenuation:!0,fog:!1})),Re=new ta(me,ne);Re.frustumCulled=!1,Re.visible=!1,n.add(Re);const Ue=150,we=new oa(v(new Mn(1,0)),v(new he({color:new Y(16777215),transparent:!0,opacity:1,fog:!1})),Ue);we.instanceMatrix.setUsage(Ea),we.frustumCulled=!1,we.visible=!1,n.add(we);const ot=[];for(let Q=0;Q<Ue;Q+=1)ot.push({p:new U,v:new U,s:1,spin:new U,rot:new U});const O=new ko,Z=new Le;Z.visible=!1,n.add(Z);const ze=v(new he({color:new Y(1773580),transparent:!0,opacity:0,depthWrite:!1,fog:!1}));ze.blending=zs;const Ye=v(new he({color:new Y(3809818),transparent:!0,opacity:0,depthWrite:!1,fog:!1})),Ne=v(new he({color:new Y(16734738),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,side:nt,fog:!1})),de=v(new he({color:new Y(16756832),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,fog:!1})),mt=(Q,G,V,oe)=>{Q.rotateX(-Math.PI/2);const ye=t.floorAt(G,V)-t.heightAt(G,V),j=Q.attributes.position;for(let W=0;W<j.count;W+=1){const ce=j.getX(W),Et=j.getZ(W);j.setY(W,t.heightAt(G+ce,V+Et)+ye+oe)}return j.needsUpdate=!0,Q.computeVertexNormals(),Q};function it(Q,G,V,oe){Z.clear();const ye=mt(v(new yt(.01,oe*1.36,72,10)),Q,G,.35),j=new X(ye,ze);j.position.set(Q,0,G),Z.add(j);const W=mt(v(new yt(oe*.95,oe*1.3,72,3)),Q,G,.5),ce=new X(W,Ye);ce.position.set(Q,0,G),Z.add(ce);const Et=mt(v(new yt(oe*.42,oe*1.1,72,6)),Q,G,.42),Mt=new X(Et,Ne);Mt.position.set(Q,0,G),Z.add(Mt);const kn=mt(v(new yt(.01,oe*.45,72,5)),Q,G,.45),Pn=new X(kn,de);Pn.position.set(Q,0,G),Z.add(Pn),Z.visible=!0}let De=-1,ut=-1,Lt=new U,ue=new U,ie=!1;function sn(){for(const Q of C)Q.life=0,Q.sprite.visible=!1}function Ft(Q,G,V=0,oe=0){sn();const ye=t.floorAt(Q,G);ue.set(Q,ye,G);const j=V||0,W=oe||0;Lt.set(Q+j*900,ye+520,G+W*900),S.visible=!0,S.position.copy(Lt),$.visible=!1,I.visible=!1;for(const ce of fe)ce.life=0,ce.mesh.visible=!1;we.visible=!1,Re.visible=!1,ne.opacity=0,ie=!1,ut=-1,De=0,Ds([30,90,40])}function rn(Q,G){if(!(De<0)){if(De+=G,!ie&&De>=Xo){ie=!0,ut=De,Ds([140,60,240,70,320,80,420,110,520,160,380]);const V=t.onScar?.(ue.x,ue.z)??26;t.onImpact?.(),it(ue.x,ue.z,ue.y,V),$.visible=!0,I.visible=!0,we.visible=!0,Re.visible=!0,ne.opacity=.95;for(const oe of fe)oe.life=oe.max,oe.mesh.visible=!0,oe.mesh.scale.setScalar(4),oe.mesh.position.set(ue.x,ue.y+(oe.flat?.6:2),ue.z),oe.flat||oe.mesh.rotation.set(0,0,0);for(let oe=0;oe<Ue;oe+=1){const ye=ot[oe],j=o()*Math.PI*2,W=6+o()*34;ye.p.set(ue.x+Math.cos(j)*W*.2,ue.y+2+o()*8,ue.z+Math.sin(j)*W*.2);const ce=28+o()*62;ye.v.set(Math.cos(j)*ce,26+o()*70,Math.sin(j)*ce),ye.s=.7+Math.pow(o(),2)*4.6,ye.spin.set((o()-.5)*6,(o()-.5)*6,(o()-.5)*6),ye.rot.set(o()*3,o()*3,o()*3)}we.material.opacity=1;for(let oe=0;oe<Ue;oe+=1){const ye=oe%3===0;we.setColorAt(oe,new Y(ye?16747066:oe%3===1?8010270:4860444))}we.instanceColor&&(we.instanceColor.needsUpdate=!0);for(let oe=0;oe<J;oe+=1){const ye=o()*Math.PI*2,j=Math.sqrt(o())*90;le[oe*3]=ue.x+Math.cos(ye)*j,le[oe*3+1]=ue.y+20+o()*260,le[oe*3+2]=ue.z+Math.sin(ye)*j,L[oe*3]=(o()-.5)*24,L[oe*3+1]=-(16+o()*34),L[oe*3+2]=(o()-.5)*24}me.attributes.position.needsUpdate=!0}if(!ie){const V=Math.min(1,De/Xo),oe=Math.pow(V,2.15);S.position.lerpVectors(Lt,ue,oe);const ye=(1-oe)*40;S.position.x+=Math.sin(De*9.1)*ye,S.position.z+=Math.cos(De*7.3)*ye,S.rotation.x+=G*2.2,S.rotation.y+=G*1.4,x.scale.setScalar(150+Math.sin(De*20)*26),l.scale.setScalar(70+Math.sin(De*26)*14);for(let j=0;j<2;j+=1){const W=S.position.clone();W.x+=(o()-.5)*26,W.y+=(o()-.5)*26,W.z+=(o()-.5)*26,F(W,!1,90+o()*60,.9+o()*.5,6,18)}F(S.position.clone(),!0,150+o()*90,1.8+o()*.8,12,26)}for(const V of C){if(V.life<=0)continue;if(V.life-=G,V.life<=0){V.sprite.visible=!1;continue}const oe=1-V.life/V.max,ye=V.from+(V.to-V.from)*Math.sqrt(oe);V.sprite.scale.setScalar(ye),V.sprite.position.y+=V.rise*G*(1-oe),V.sprite.position.x+=V.driftX*G,V.sprite.position.z+=V.driftZ*G,V.sprite.material.rotation+=V.spin*G;const j=V.smoke?Math.pow(1-oe,1.8)*.46:Math.pow(1-oe,1.3)*.55;V.mat.opacity=j}if(ie){const V=De-ut,oe=(j,W,ce)=>j+(W-j)*Is(V/ce);$.scale.setScalar(oe(2,46,.85)),$.material.opacity=Math.max(0,1-V/1.9)*.95,K.scale.setScalar(oe(1,24,.4)),K.material.opacity=Math.max(0,1-V/.5),$.position.set(ue.x,ue.y+8,ue.z),K.position.set(ue.x,ue.y+10,ue.z),I.scale.setScalar(oe(3,34,1)),I.material.opacity=Math.max(0,.6-V/1.3*.6),I.position.set(ue.x,ue.y+4,ue.z);for(const j of fe){if(j.life<=0)continue;if(j.life-=G,j.life<=0){j.mesh.visible=!1;continue}const W=1-j.life/j.max;j.mesh.scale.setScalar(4+j.grow*Math.pow(W,.6)),j.mat.opacity=Math.max(0,(1-W)*(j.flat?.85:.6))}if(V<1.8&&V%.085<G){const j=new U(ue.x+(o()-.5)*18,ue.y+3+o()*6,ue.z+(o()-.5)*18);o()<.65&&F(j,!1,76+o()*56,1.4+o()*.7,14+o()*12,20,16761962),F(j,!0,60+o()*46,1.8+o()*.8,12+o()*10,26,11573898)}if(V<1.7&&V%.05<G){const j=o()*Math.PI*2,W=26+V*46+o()*22,ce=new U(ue.x+Math.cos(j)*W,ue.y+2+o()*12,ue.z+Math.sin(j)*W);F(ce,!0,50+o()*40,1.6,7,14,11573376),o()<.55&&F(ce,!1,70+o()*60,1.3,10,10,16751164)}if(V>.4&&V<2.8&&V%.11<G){const j=o()*Math.PI*2,W=16+o()*46,ce=new U(ue.x+Math.cos(j)*W,ue.y+34+o()*30,ue.z+Math.sin(j)*W);F(ce,!0,70+o()*52,2,8,24,10520692)}const ye=we.material;if(ye.opacity=Math.max(0,1-Math.max(0,V-3.4)/1.2),ye.opacity<=.01)we.visible=!1;else{for(let j=0;j<Ue;j+=1){const W=ot[j];W.v.y-=9.81*.55*G,W.v.multiplyScalar(1-G*.12),W.p.addScaledVector(W.v,G);const ce=t.floorAt(W.p.x,W.p.z)+W.s*.4;W.p.y<ce&&(W.p.y=ce,W.v.y=Math.abs(W.v.y)*.32,W.v.x*=.7,W.v.z*=.7),W.rot.x+=W.spin.x*G,W.rot.y+=W.spin.y*G,W.rot.z+=W.spin.z*G,O.position.copy(W.p),O.rotation.set(W.rot.x,W.rot.y,W.rot.z),O.scale.setScalar(W.s),O.updateMatrix(),we.setMatrixAt(j,O.matrix)}we.instanceMatrix.needsUpdate=!0}if(Re.visible)if(ne.opacity=Math.max(0,.95-Math.max(0,V-4)/1.6),ne.opacity<=.01)Re.visible=!1;else{for(let j=0;j<J;j+=1){const W=j*3;le[W]+=L[W]*G,le[W+1]+=L[W+1]*G,le[W+2]+=L[W+2]*G,L[W+1]-=5*G;const ce=t.floorAt(le[W],le[W+2])+.4;le[W+1]<ce&&(le[W]=ue.x+(o()-.5)*160,le[W+1]=ue.y+120+o()*160,le[W+2]=ue.z+(o()-.5)*160,L[W]=(o()-.5)*20,L[W+1]=-(14+o()*26),L[W+2]=(o()-.5)*20)}me.attributes.position.needsUpdate=!0}ze.opacity=Math.min(.42,V*1.1),Ye.opacity=Math.min(.4,V*1.1),Ne.opacity=Math.max(0,.85*Math.exp(-V/5.5)),de.opacity=Math.max(0,.9*Math.exp(-V/1.8))}if(ie&&(S.visible=!1),De>80){De=-1,ut=-1,S.visible=!1,$.visible=!1,K.visible=!1,I.visible=!1,Z.visible=!1;for(const V of C)V.life=0,V.sprite.visible=!1;for(const V of fe)V.life=0,V.mesh.visible=!1;we.visible=!1,Re.visible=!1}}}return{group:n,strike:Ft,doom:()=>{if(De<0)return 0;if(!ie)return Math.min(1,Is(De/(Xo*.82))*(.93+.07*Math.sin(De*12)));const Q=De-ut;return Q<1.8?1:Math.max(0,1-(Q-1.8)/20)},flash:()=>{if(!ie)return 0;const Q=De-ut,G=Math.exp(-Q/.16),V=Q>.35?.5*Math.exp(-(Q-.35)/.3):0;return Math.min(1,G+V)},shake:()=>{if(De<0)return 0;if(!ie)return .02+Math.pow(De/Xo,3)*.18;const Q=De-ut;if(Q>3.6)return 0;let G=1.55*Math.exp(-Q/1.35);return G+=.55*Math.exp(-Math.pow((Q-1.55)/.22,2)),G+=.32*Math.exp(-Math.pow((Q-2.35)/.26,2)),G+=.18*Math.exp(-Math.pow((Q-3)/.3,2)),G*Math.min(1,Q/.06)},sinceImpact:()=>ut>=0?De-ut:-1,stats:()=>{const Q=C.filter(V=>V.life>0),G=Q[0];return{t:Number(De.toFixed(2)),target:[Number(ue.x.toFixed(1)),Number(ue.y.toFixed(1)),Number(ue.z.toFixed(1))],start:[Number(Lt.x.toFixed(1)),Number(Lt.z.toFixed(1))],alive:Q.length,map:G?!!G.mat.map:null,op:G?Number(G.mat.opacity.toFixed(2)):null,sc:G?Number(G.sprite.scale.x.toFixed(1)):null,pos:G?G.sprite.position.toArray().map(V=>Number(V.toFixed(1))):null,vis:G?G.sprite.visible:null,fire:[Number($.material.opacity.toFixed(2)),Number($.scale.x.toFixed(0)),$.visible],crater:[Z.visible,Z.children.length,Number(ze.opacity.toFixed(2)),Number(Ne.opacity.toFixed(2))]}},update:rn,dispose:()=>{n.clear(),i.forEach(Q=>Q.dispose())}}}const ci=`
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
`,li=`
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
`,ui=`
uniform float uTile;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vUv = wp.xz / uTile;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,fi=`
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
`,_s=`
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
`,Ws=`
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
`,io=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ta=`
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
`,Yo=`
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
`,Xt=Math.PI*2,or=9,Ls=140;function Jt(t){return t<0?0:t>1?1:t}function Jo(t,n,o){return t<n?n:t>o?o:t}function Sn(t,n,o){const r=Jt((o-t)/(n-t));return r*r*(3-2*r)}function In(t,n,o){let r=Math.imul(t|0,374761393)^Math.imul(n|0,668265263)^Math.imul(o|0,2246822519);return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967295}function pi(t,n,o,r){const c=Math.floor(t),y=Math.floor(n),i=t-c,v=n-y,S=i*i*(3-2*i),w=v*v*(3-2*v),P=Math.max(1,Math.round(o)),k=I=>(I%P+P)%P,x=k(c),l=k(c+1),C=k(y),m=k(y+1),H=In(x,C,r),F=In(l,C,r),$=In(x,m,r),K=In(l,m,r);return(H+(F-H)*S)*(1-w)+($+(K-$)*S)*w}function Qt(t,n,o,r,c){let y=0,i=.5,v=0,S=o;for(let w=0;w<r;w+=1)y+=i*pi(t*S,n*S,S,c+w*17),v+=i,i*=.5,S*=2;return y/v}function ar(t){let n=t>>>0||1;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function mo(t,n){const o=document.createElement("canvas");o.width=t,o.height=n;const r=o.getContext("2d");if(!r)throw new Error("2D canvas is unavailable");return{canvas:o,ctx:r}}const mi={crater:{seed:101,macro:.38,mid:.17,fine:.12,speck:.15,craters:20,stones:90,cracks:0,ripples:0,gloss:.02},rock:{seed:211,macro:.4,mid:.22,fine:.14,speck:.2,craters:5,stones:150,cracks:9,ripples:1,gloss:.05},volcano:{seed:331,macro:.32,mid:.24,fine:.16,speck:.22,craters:4,stones:110,cracks:14,ripples:0,gloss:.08},ice:{seed:401,macro:.26,mid:.2,fine:.2,speck:.16,craters:5,stones:18,cracks:22,ripples:0,gloss:.5},plain:{seed:509,macro:.3,mid:.15,fine:.1,speck:.13,craters:8,stones:70,cracks:3,ripples:.35,gloss:.03},plasma:{seed:601,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0},ring:{seed:701,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0}};function Qo(t,n,o,r,c,y,i,v,S=!1){const w=Math.ceil(y),P=Math.round(r),k=Math.round(c);for(let x=-w;x<=w;x+=1)for(let l=-w;l<=w;l+=1){const C=(l*l+x*x)/(y*y);if(C>=1)continue;const m=S?Math.sqrt(1-C):1-C,H=((P+l)%o+o)%o,$=((k+x)%o+o)%o*o+H;t[$]+=i*m,n[$]+=v*m}}function di(t,n,o,r,c,y,i){const v=.09+i()*.12,S=.05+i()*.06,w=.72+i()*.5,P=i()*Math.PI,k=Math.cos(P),x=Math.sin(P),l=Math.ceil(y*1.4),C=Math.round(r),m=Math.round(c);for(let H=-l;H<=l;H+=1)for(let F=-l;F<=l;F+=1){const $=(F*k+H*x)/y,K=(-F*x+H*k)/(y*w),I=Math.sqrt($*$+K*K);if(I>1.4)continue;let fe=0,re=0;I<1&&(fe-=Math.pow(1-I*I,1.25)*v,re-=(1-I)*.05);const J=Math.exp(-Math.pow((I-1.02)/.2,2))*S;fe+=J,re+=J*1.1+(I>1&&I<1.35?.02:0);const me=((C+F)%o+o)%o,L=((m+H)%o+o)%o*o+me;n[L]+=fe,t[L]+=re}}function Aa(t,n,o,r,c,y,i,v,S,w){const k=Math.max(2,Math.floor(i/1.1));let x=y,l=r,C=c;for(let m=0;m<k;m+=1){x+=(S()-.5)*.3,l+=Math.cos(x)*1.1,C+=Math.sin(x)*1.1;const H=v*(.6+S()*.8);w?(Qo(t,n,o,l,C,H*2.2,.03,.008),Qo(t,n,o,l,C,H,-.05,-.03)):Qo(t,n,o,l,C,H,-.07,-.03)}}function hi(t,n){const o=mi[t],r=ar(o.seed),c=n/or,y=new Float32Array(n*n),i=new Float32Array(n*n),v=new Float32Array(n*n),S=7;for(let l=0;l<n;l+=1){const C=l/n;for(let m=0;m<n;m+=1){const H=m/n,F=l*n+m,$=Qt(H,C,3,4,o.seed),K=Qt(H,C,11,3,o.seed+13),I=Qt(H,C,43,2,o.seed+29),fe=In(m,l,o.seed+71)-.5;let re=1+($-.5)*o.macro+(K-.5)*o.mid+(I-.5)*o.fine+fe*o.speck,J=.5+($-.5)*.06+(K-.5)*.07+(I-.5)*.08+fe*.03,me=o.gloss;if(o.ripples>0){const le=C*S+($-.5)*.85+(K-.5)*.3,L=Math.sin(le*Xt);re+=L*.055*o.ripples,J+=L*.018*o.ripples}if(t==="volcano"){const le=1-Math.abs(2*I-1);le>.94?(re+=(le-.94)*2.2,J-=.02,me+=.1):le<.22&&(re-=(.22-le)*.6)}t==="ice"&&(Math.abs(K-.5)<.012&&(re-=.24,J-=.035),re=.82+(re-1)*.95+(I-.5)*.12,me=Jt(.35+I*.55)),(t==="crater"||t==="ring")&&$<.34&&(re-=(.34-$)*1.1),t==="plain"&&(re+=Sn(.55,.78,$)*.18),y[F]=re,i[F]=J,v[F]=me}}for(let l=0;l<o.craters;l+=1){const C=(.3+Math.pow(r(),1.7)*1.1)*c;di(y,i,n,r()*n,r()*n,C,r)}for(let l=0;l<o.stones;l+=1){const m=(r()<.18?.14+r()*.3:.03+r()*.09)*c,H=l%3===0?.12:-.08;Qo(y,i,n,r()*n,r()*n,Math.max(.8,m),H,.02+m*.0012,!0)}for(let l=0;l<o.cracks;l+=1){const C=r()*n,m=r()*n,H=(.6+r()*3.4)*c;Aa(y,i,n,C,m,r()*Xt,H,.8+r()*1.4,r,t==="ice")}if(t==="ice"){const l=()=>.5;for(let C=0;C<11;C+=1){const m=r()*Xt,H=n*(.45+r()*.75),F=r()*n,$=r()*n;Aa(y,i,n,F-Math.cos(m)*H*.5,$-Math.sin(m)*H*.5,m,H,1+r()*1.4,l,!0)}for(let C=0;C<10;C+=1){const m=r()*n,H=r()*n,F=r()*Xt;Aa(y,i,n,m,H,F,(.4+r()*1.6)*c,.8+r(),r,!0)}}const{canvas:w,ctx:P}=mo(n,n),k=P.createImageData(n,n),x=k.data;for(let l=0;l<n*n;l+=1)x[l*4]=Math.round(Jo(y[l]*.5,0,1)*255),x[l*4+1]=Math.round(Jo(i[l],0,1)*255),x[l*4+2]=Math.round(Jo(v[l],0,1)*255),x[l*4+3]=255;return P.putImageData(k,0,0),w}function Ve(t){const n=parseInt(t.replace("#",""),16);return[n>>16&255,n>>8&255,n&255]}function Bt(t,n,o){return[t[0]+(n[0]-t[0])*o,t[1]+(n[1]-t[1])*o,t[2]+(n[2]-t[2])*o]}function vi(t,n,o){const r=t*n,c=Math.floor(r),y=r-c,i=k=>{const x=(k%2+2)%2===0,l=In(k,7,o);return x?.56+.4*l:.04+.3*l},v=i(c),S=i(c-1),w=i(c+1),P=.44;return y<P?S+(v-S)*Sn(0,1,y/P):y>1-P?v+(w-v)*Sn(0,1,(y-(1-P))/P):v}const Da={jupiter:{bands:16,seed:3301,streaky:.8,polar:null,spots:[{u:.62,v:.66,ru:.085,rv:.05,color:Ve("#a8492f"),swirl:2},{u:.24,v:.34,ru:.05,rv:.026,color:Ve("#f6efdd"),swirl:0},{u:.46,v:.4,ru:.035,rv:.02,color:Ve("#fbf3e1"),swirl:0},{u:.83,v:.44,ru:.03,rv:.018,color:Ve("#f4ecd9"),swirl:0},{u:.36,v:.74,ru:.06,rv:.03,color:Ve("#8d4b30"),swirl:0}]},saturn:{bands:20,seed:3307,streaky:.38,polar:Ve("#c9d4d8"),spots:[{u:.7,v:.3,ru:.04,rv:.02,color:Ve("#f7edd2"),swirl:0},{u:.3,v:.72,ru:.035,rv:.018,color:Ve("#e6d3a4"),swirl:0}]},uranus:{bands:7,seed:3313,streaky:.25,polar:Ve("#e6fbfd"),spots:[{u:.55,v:.36,ru:.06,rv:.03,color:Ve("#dcf4f6"),swirl:0}]},neptune:{bands:9,seed:3319,streaky:.5,polar:Ve("#a9c8f2"),spots:[{u:.34,v:.62,ru:.06,rv:.032,color:Ve("#1f3a72"),swirl:1},{u:.72,v:.46,ru:.05,rv:.012,color:Ve("#e9f3ff"),swirl:0},{u:.62,v:.36,ru:.035,rv:.009,color:Ve("#f2f8ff"),swirl:0}]}};function gi(t,n,o,r=2){const c=new Uint8ClampedArray(t.length);for(let y=0;y<r;y+=1){for(let i=0;i<o;i+=1)for(let v=0;v<n;v+=1){const S=(v-1+n)%n*4,w=v*4,P=(v+1)%n*4,k=i*n*4;for(let x=0;x<3;x+=1)c[k+w+x]=(t[k+S+x]+t[k+w+x]*2+t[k+P+x])/4}for(let i=0;i<o;i+=1){const v=(i-1+o)%o*n*4,S=i*n*4,w=(i+1)%o*n*4;for(let P=0;P<n;P+=1){const k=P*4;for(let x=0;x<3;x+=1)t[S+k+x]=(c[v+k+x]+c[S+k+x]*2+c[w+k+x])/4}}}}function sr(t,n,o){const r=Da[t.id]??Da.jupiter,c=Ve(t.ground),y=Ve(t.ground2),i=Ve(t.ground3),{canvas:v,ctx:S}=mo(n,o),w=S.createImageData(n,o),P=w.data,k=r.seed,x=new Float32Array(n*o),l=new Float32Array(n*o);for(let F=0;F<o;F+=1){const $=F/o;for(let K=0;K<n;K+=1){const I=K/n,fe=(Qt(I,$,4,3,k)-.5)*.03+(Qt(I,$,13,2,k+7)-.5)*.005,re=Jt($+fe);let J=vi(re,r.bands,k);const me=Qt(I*3,$*9,9,3,k+31)-.5;J+=me*.13*r.streaky;let le;if(J<.5?le=Bt(i,y,Jt(J*2)):le=Bt(y,c,Jt((J-.5)*2)),r.polar){const ne=Sn(.82,1,Math.abs($-.5)*2);le=Bt(le,r.polar,ne*.45)}for(const ne of r.spots){const Re=(I-ne.u)/ne.ru,Ue=($-ne.v)/ne.rv,we=Re*Re+Ue*Ue;if(we<2.2){const ot=Sn(1.05,.25,we),O=ne.swirl>0?.82+.18*Math.sin(Math.atan2(Ue,Re)*3+we*7):1;le=Bt(le,[ne.color[0]*O,ne.color[1]*O,ne.color[2]*O],ot*.92)}}const L=(F*n+K)*4;P[L]=le[0],P[L+1]=le[1],P[L+2]=le[2],P[L+3]=255,x[F*n+K]=Jt(.5+me*.85+(J-.5)*.5),l[F*n+K]=.5+me*.85}}const C=t.sunAz*Math.PI/180,m=Math.sin(C),H=-Math.cos(C);for(let F=0;F<o;F+=1){const $=(F+1)%o,K=(F-1+o)%o;for(let I=0;I<n;I+=1){const fe=(I+1)%n,re=(I-1+n)%n,J=l[F*n+fe]-l[F*n+re],me=l[$*n+I]-l[K*n+I],le=Jo(1+(J*m+me*H)*1.8,.9,1.1),L=(F*n+I)*4;P[L]=Math.min(255,P[L]*le),P[L+1]=Math.min(255,P[L+1]*le),P[L+2]=Math.min(255,P[L+2]*le),P[L+3]=Math.round(Jt(.74+x[F*n+I]*.4)*255)}}return gi(P,n,o,2),S.putImageData(w,0,0),v}function yi(t,n){if(Da[t.id])return sr(t,n,n);const{canvas:o,ctx:r}=mo(n,n),c=r.createImageData(n,n),y=c.data,i=Ve(t.ground),v=Ve(t.ground2),S=Ve(t.ground3);for(let w=0;w<n;w+=1){const P=w/n;for(let k=0;k<n;k+=1){const x=k/n,l=Qt(x,P,4,4,9021),C=Qt(x,P,16,3,9027),m=Jt(l*.72+C*.4);let H=Bt(v,i,Sn(.25,.72,m));H=Bt(H,S,Sn(.66,.95,m)*.8);const F=(w*n+k)*4;y[F]=H[0],y[F+1]=H[1],y[F+2]=H[2],y[F+3]=255}}return r.putImageData(c,0,0),o}function Mi(t,n,o){const{canvas:r,ctx:c}=mo(n,o),y=ar(t==="moon"?51:t==="pluto"?67:83),i=t==="pluto"?"#cbb6a4":t==="charon"?"#9d9a95":"#9a9691";if(c.fillStyle=i,c.fillRect(0,0,n,o),t==="pluto")c.fillStyle="#f3ece1",c.beginPath(),c.ellipse(n*.56,o*.46,n*.13,o*.16,-.2,0,Xt),c.fill(),c.beginPath(),c.ellipse(n*.72,o*.4,n*.07,o*.12,.35,0,Xt),c.fill(),c.fillStyle="rgba(96,68,54,0.62)",c.beginPath(),c.ellipse(n*.24,o*.6,n*.2,o*.13,.1,0,Xt),c.fill(),c.beginPath(),c.ellipse(n*.2,o*.32,n*.14,o*.1,-.2,0,Xt),c.fill();else if(t==="moon")for(let v=0;v<9;v+=1)c.fillStyle=`rgba(58,56,54,${.5+y()*.3})`,c.beginPath(),c.ellipse(y()*n,(.18+y()*.6)*o,(.04+y()*.07)*n,(.03+y()*.06)*o,y()*3,0,Xt),c.fill();else c.fillStyle="rgba(120,84,70,0.6)",c.beginPath(),c.ellipse(n*.5,o*.06,n*.4,o*.09,0,0,Xt),c.fill();for(let v=0;v<220;v+=1){const S=(2+Math.pow(y(),2.4)*26)*(n/1024),w=y()*n,P=y()*o,k=c.createRadialGradient(w,P,0,w,P,S);k.addColorStop(0,"rgba(38,36,34,0.5)"),k.addColorStop(.72,"rgba(70,66,62,0.28)"),k.addColorStop(.9,"rgba(238,233,224,0.32)"),k.addColorStop(1,"rgba(255,255,255,0)"),c.fillStyle=k,c.beginPath(),c.arc(w,P,S,0,Xt),c.fill()}for(let v=0;v<2600;v+=1){const S=(.6+Math.pow(y(),3)*4)*(n/1024);c.fillStyle=y()<.5?"rgba(255,255,255,0.16)":"rgba(30,28,26,0.16)",c.beginPath(),c.arc(y()*n,y()*o,S,0,Xt),c.fill()}return r}function wi(t,n){const{canvas:o,ctx:r}=mo(t,n),c=r.createImageData(t,n),y=c.data,i=Ve("#0f3f74"),v=Ve("#2f8fb0"),S=Ve("#3f7a45"),w=Ve("#9a8a55"),P=Ve("#f2f7fc");for(let k=0;k<n;k+=1){const x=k/n;for(let l=0;l<t;l+=1){const C=l/t,m=C*3.1,H=x*2.4,F=Qt(m,H,4,5,4404)+(Qt(m*3,H*3,12,3,4411)-.5)*.18,$=F>.55;let K;if($){const me=Jt((F-.55)*4.2);K=Bt(S,w,me*.7),me>.55&&(K=Bt(K,Ve("#cfc9bb"),(me-.55)*1.6))}else K=Bt(i,v,Jt((F-.35)*3.2));const I=Sn(.86,.98,Math.abs(x-.5)*2);I>0&&(K=Bt(K,P,I));const fe=Qt(C*2,x*6,12,4,4423),re=Sn(.56,.82,fe)*.72;re>0&&(K=Bt(K,Ve("#fbfdff"),re));const J=(k*t+l)*4;y[J]=K[0],y[J+1]=K[1],y[J+2]=K[2],y[J+3]=255}}return r.putImageData(c,0,0),o}function xi(t,n,o,r){if(t==="earth")return wi(o,r);if(t==="moon"||t==="pluto"||t==="charon")return Mi(t,o,r);const c=t==="saturn"?{...n,id:"saturn",ground:"#f2e2ba",ground2:"#c6a978",ground3:"#9b7f52"}:{...n,id:"jupiter",ground:"#e9d6b4",ground2:"#b57d50",ground3:"#8b5a38"};return sr(c,o,r)}function bi(t){const{canvas:o,ctx:r}=mo(t,4),c=r.createImageData(t,4),y=c.data,i=1.11,v=2.36,S=Ve("#f6efdd"),w=Ve("#c9b48d"),P=Ve("#6f6455"),k=[[1.11,1.235,.1,.15],[1.235,1.525,.42,.3],[1.525,1.95,.98,.62],[1.951,2.025,.06,.1],[2.025,2.21,.72,.5],[2.211,2.215,.04,.1],[2.215,2.27,.66,.46],[2.27,2.31,.06,.1],[2.315,2.34,.34,.55]];for(let x=0;x<t;x+=1){const l=x/(t-1),C=i+(v-i)*l;let m=0,H=.5;for(const[fe,re,J,me]of k)if(C>=fe&&C<=re){m=J,H=me,m*=.82+.18*Math.sin((C-fe)*820+Math.sin((C-fe)*140)*2);break}const F=[1.29,1.44,1.63,1.72,1.88,2.06,2.15,2.24,2.29];for(const fe of F)Math.abs(C-fe)<.0035&&(m*=.12);m*=.9+.14*In(Math.floor(C*900),3,9931);const $=In(Math.floor(x/2),7,9931);let K=Bt(w,S,H);K=Bt(K,P,(1-Math.min(1,m))*.35);const I=.82+$*.3;for(let fe=0;fe<4;fe+=1){const re=(fe*t+x)*4;y[re]=K[0]*I,y[re+1]=K[1]*I,y[re+2]=K[2]*I,y[re+3]=Math.round(Jt(m)*255)}}return r.putImageData(c,0,0),o}const wn=new Map;function aa(t,n,o,r,c,y){const i=new Zn(n);for(i.colorSpace=o?bn:Ua,i.wrapS=r?Na:Ar,i.wrapT=i.wrapS,i.anisotropy=c,i.magFilter=Cr,i.minFilter=Rr,i.generateMipmaps=!0,i.needsUpdate=!0,wn.set(t,i);wn.size>y;){const v=wn.keys().next();if(v.done)break;const S=wn.get(v.value);wn.delete(v.value),S?.dispose()}return i}function Si(t,n,o){const r=`ground:${t}:${n?"l":"h"}`,c=wn.get(r);return c||aa(r,hi(t,n?320:512),!1,!0,o,6)}function ki(t,n,o){const r=`cloud:${t.id}:${n?"l":"h"}`,c=wn.get(r);return c||aa(r,yi(t,n?512:1024),!0,!0,o,4)}function Us(t,n,o,r){const y=`body:${t??n.id}:${o?"l":"h"}`,i=wn.get(y);if(i)return i;const v=o?768:1024;return aa(y,xi(t,n,v,v/2),!0,!1,r,3)}function Ca(t,n){const o=`ring:${t?"l":"h"}`,r=wn.get(o);return r||aa(o,bi(t?1024:2048),!0,!1,n,2)}const uo=Math.PI/180,$n=1500,Ho=2800,Gs=-4.3;function $o(t,n){const o=Math.sin(t*127.1+n*311.7)*43758.5453;return o-Math.floor(o)}function _a(t){return t*t*(3-2*t)}function Pi(t,n){const o=Math.floor(t),r=Math.floor(n),c=t-o,y=n-r,i=$o(o,r),v=$o(o+1,r),S=$o(o,r+1),w=$o(o+1,r+1),P=_a(c),k=_a(y);return(i*(1-P)+v*P)*(1-k)+(S*(1-P)+w*P)*k}function Zo(t,n,o=4){let r=0,c=.5,y=1;for(let i=0;i<o;i+=1)r+=c*Pi(t*y,n*y),y*=2.03,c*=.5;return r}function co(t){let n=t>>>0||1;return()=>(n=n*1664525+1013904223>>>0,n/4294967296)}function zi(t){let n=2166136261;for(let o=0;o<t.length;o+=1)n=Math.imul(n^t.charCodeAt(o),16777619);return n>>>0}function Ra(t,n){const o=t*uo,r=n*uo;return new U(Math.sin(o)*Math.cos(r),Math.sin(r),-Math.cos(o)*Math.cos(r)).normalize()}function Ti(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d"),r=o.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,"rgba(255,255,255,1)"),r.addColorStop(.25,"rgba(255,236,196,0.72)"),r.addColorStop(.6,"rgba(255,190,110,0.18)"),r.addColorStop(1,"rgba(255,170,80,0)"),o.fillStyle=r,o.fillRect(0,0,128,128);const c=new Zn(n);return c.colorSpace=bn,c}const Ai=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ci=`
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
`,Ri=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ei=`
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
`,Ni=8,Fi=.55,Vs=.34;function Ii(t,n={}){const o=!!n.low,r=n.anisotropy??(o?4:8),c=new Le,y=[],i=f=>(y.push(f),f);let v=null,S=null,w=null;const P=zi(t.id),k=co(P),x=i(Ti()),l=[],C=[];let m=null,H=null,F=null;const $=[],K=[];if(t.terrain==="crater"){for(let f=0;f<(o?16:26);f+=1){const p=k()*Math.PI*2,T=20+Math.sqrt(k())*460,g=16+k()*74;$.push({x:Math.cos(p)*T,z:Math.sin(p)*T,r:g,d:g*(.16+k()*.2)})}for(let f=0;f<(o?26:48);f+=1){const p=k()*Math.PI*2,T=4+Math.pow(k(),.7)*150,g=2.5+Math.pow(k(),1.6)*11;$.push({x:Math.cos(p)*T,z:Math.sin(p)*T,r:g,d:g*(.2+k()*.22)})}}if(t.terrain==="volcano")for(let f=0;f<6;f+=1){const p=k()*Math.PI*2,T=60+k()*380;K.push({x:Math.cos(p)*T,z:Math.sin(p)*T,r:40+k()*90,h:12+k()*34})}if(t.terrain==="rock")for(let f=0;f<5;f+=1){const p=k()*Math.PI*2,T=60+k()*400;K.push({x:Math.cos(p)*T,z:Math.sin(p)*T,r:50+k()*110,h:6+k()*16})}function I(f,p,T,g=4){return(Zo(f*T,p*T,g)-.48)*2}function fe(f,p){if(t.terrain==="plasma"||t.terrain==="ring")return 0;const T=Math.hypot(f,p);let g=0;if(t.terrain==="crater"){g=I(f+11,p+7,.004,4)*16+I(f+3,p+17,.0012,2)*34+I(f+5,p+23,.026,3)*3;for(const ae of $){const R=Math.hypot(f-ae.x,p-ae.z)/ae.r;R<1&&(g-=ae.d*Math.pow(1-R*R,1.5)),R<1.3&&(g+=ae.d*.28*Math.exp(-Math.pow((R-1.02)/.17,2)))}}else if(t.terrain==="rock"){g=I(f+5,p+2,.0035,4)*40,g+=(1-Math.abs(I(f,p,.011,3)))*12,g+=I(f+21,p+13,.0011,2)*60,g+=I(f+31,p+41,.028,3)*3.4;for(const ae of K){const R=Math.hypot(f-ae.x,p-ae.z)/ae.r;R<1&&(g+=ae.h*Math.pow(1-R,1.7))}}else if(t.terrain==="volcano"){g=I(f+3,p+8,.005,4)*14+I(f+9,p+1,.0012,2)*22;for(const ae of K){const R=Math.hypot(f-ae.x,p-ae.z)/ae.r;R<1&&(g+=ae.h*Math.pow(1-R,1.25)),R<.24&&(g-=ae.h*.5*(1-R/.24))}}else t.terrain==="ice"?g=I(f+9,p+4,.003,4)*9+I(f,p,.012,2)*2.2+I(f+2,p+8,.035,3)*1.1:g=I(f+7,p+3,.0035,4)*12+I(f,p,.012,2)*2.6+I(f+4,p+2,.03,3)*3;const h=Math.max(0,T-1500)/500;g-=h*h*5;let te=0,E=0;for(const ae of l){const R=Math.hypot(f-ae.x,p-ae.z)/ae.r;R<1&&(te=Math.max(te,ae.d*Math.pow(1-R*R,1.55))),R<1.45&&(E=Math.max(E,ae.d*.3*Math.exp(-Math.pow((R-1.02)/.16,2))))}return g-=te,g+=E,g+=(Zo(f*.09+1,p*.09+6,2)-.5)*(t.terrain==="rock"?1.2:t.terrain==="ice"?.25:.5),g}let re=fe(0,0);function J(f,p){return fe(f,p)-re}const me=(()=>{if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring")return{x:0,z:0};const f=[];for(let T=0;T<40;T+=1){const g=T/40*Math.PI*2,h=T%5*34,te=Math.cos(g)*h,E=Math.sin(g)*h;let ae=0;for(let R=0;R<8;R+=1){const Ke=R/8*Math.PI*2;ae+=J(te+Math.cos(Ke)*120,E+Math.sin(Ke)*120)}f.push({x:te,z:E,score:J(te,E)-ae/8})}f.sort((T,g)=>g.score-T.score);const p=f[Math.floor(f.length*.28)];return{x:p.x,z:p.z}})();re=fe(me.x,me.z);const le=t.cloudTop!==null?t.cloudTop:J(me.x,me.z),L=1.7,ne=Ra(t.sunAz,t.sunElev),Re=t.sunScale>0?.2667*t.sunScale*uo:0,Ue=Math.max(0,Math.min(1,t.fogDensity*26)),we=new Y(t.skyTop),ot=new Y(t.skyBottom),O=new Y(t.glow),Z=i(new qe({vertexShader:Ai,fragmentShader:Ci,side:lo,depthWrite:!1,uniforms:{uTop:{value:we.clone()},uBottom:{value:ot.clone()},uGlow:{value:O.clone()},uSun:{value:new Y(t.sunColor)},uSunDir:{value:ne.clone()},uSunRadius:{value:Re},uSunHaze:{value:Ue},uGlowGain:{value:t.glowGain}}})),ze=new X(i(new Ce(Ho,32,20)),Z);ze.frustumCulled=!1,c.add(ze);let Ye=0;function Ne(f){Ye=Math.max(0,Math.min(1,f));const p=1-Ye;Z.uniforms.uTop.value.copy(we).multiplyScalar(p),Z.uniforms.uBottom.value.copy(ot).multiplyScalar(p),Z.uniforms.uGlow.value.copy(O).multiplyScalar(p),Z.uniforms.uGlowGain.value=t.glowGain*p,Z.uniforms.uSun.value.copy(new Y(t.sunColor)).multiplyScalar(p),de&&(de.opacity=.85*Math.min(1,Ye*1.6))}let de=null;if(t.stars){const f=o?320:620,p=new Float32Array(f*3),T=co(P^2654435769);for(let E=0;E<f;E+=1){const ae=T()*Math.PI*2,R=Math.pow(T(),.65)*.98+.02,Ke=Math.sqrt(1-R*R);p[E*3]=Math.cos(ae)*Ke*(Ho-200),p[E*3+1]=R*(Ho-200),p[E*3+2]=Math.sin(ae)*Ke*(Ho-200)}const g=i(new Kt);g.setAttribute("position",new xn(p,3));const h=i(new na({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1}));de=h;const te=new ta(g,h);te.frustumCulled=!1,c.add(te)}const mt=Math.min(1.5,.45+.9*Math.min(1,Math.max(t.sunScale,.02)*1.5)),it=t.stars?.4:.46,De=(f,p)=>{const g=-(J(f+.9,p)-J(f-.9,p))/1.8,h=-(J(f,p+.9)-J(f,p-.9))/(2*.9),te=1/Math.sqrt(g*g+1+h*h),E=Math.max(0,(g*ne.x+ne.y+h*ne.z)*te);return it+mt*E};let ut=[],Lt=null;if(t.terrain==="plasma"){const f=i(new qe({vertexShader:Ri,fragmentShader:Ei,uniforms:{uTime:{value:0},uA:{value:new Y(t.ground)},uB:{value:new Y(t.ground2)},uC:{value:new Y(t.ground3)}}}));Lt=f;const p=new X(i(new So(2400,2400,1,1)),f);p.rotation.x=-Math.PI/2,p.position.y=0,c.add(p)}else if(t.terrain!=="ring")if(t.cloudTop!==null){const f=ki(t,o,r),p=Math.min(1.12,.55+.5*Math.min(1,Math.max(t.sunScale,.02)*2)),T=(E,ae)=>i(new qe({vertexShader:ui,fragmentShader:fi,uniforms:{uMap:{value:f},uOffset:{value:new zo(0,0)},uTile:{value:E},uDetail:{value:11},uTint:{value:new Y().setScalar(ae)},uOpacity:{value:1},uFogColor:{value:new Y(t.fog)},uFogDensity:{value:t.fogDensity}}})),g=new X(i(new So(5200,5200,1,1)),T(Ls,p));g.rotation.x=-Math.PI/2,g.position.y=t.cloudTop,c.add(g),ut=[g.material];const h=T(Ls*.42,p*.86);h.uniforms.uOpacity.value=.55,h.transparent=!0,h.depthWrite=!1;const te=new X(i(new So(5200,5200,1,1)),h);te.rotation.x=-Math.PI/2,te.position.y=t.cloudTop-90,c.add(te),ut.push(h)}else{const f=o?96:150,p=i(new So($n*2,$n*2,f,f));p.rotateX(-Math.PI/2);const T=p.attributes.position,g=new Float32Array(T.count*3),h=new Y(t.ground),te=new Y(t.ground2),E=new Y(t.ground3),ae=new xn(g,3),R=new Y,Ke=se=>{const xe=T.getX(se),Fe=T.getZ(se),Be=J(xe,Fe);T.setY(se,Be);const Se=Zo(xe*.02+3,Fe*.02+9,3);R.copy(h).lerp(te,_a(Math.min(1,Math.max(0,(Se-.28)/.5)))),Be<-1.6&&R.lerp(E,Math.min(1,(-Be-1.6)/7));const ke=Zo(xe*.0045+17,Fe*.0045+41,3),at=Math.min(1.9,De(xe,Fe))*(.9+(Se-.5)*.22)*(.84+ke*.34);let Je=1;for(const Qe of l){const Nt=Math.hypot(xe-Qe.x,Fe-Qe.z)/Qe.r;if(Nt>1.5)continue;const ct=Math.min(1,Math.max(0,1-Nt/1.35));Je*=1-.62*ct*ct}g[se*3]=R.r*at*Je,g[se*3+1]=R.g*at*Je*.94,g[se*3+2]=R.b*at*Je*.9};for(let se=0;se<T.count;se+=1){const xe=T.getX(se)/$n,Fe=T.getZ(se)/$n,Be=Math.sign(xe)*Math.pow(Math.abs(xe),1.8)*$n,Se=Math.sign(Fe)*Math.pow(Math.abs(Fe),1.8)*$n;T.setXYZ(se,Be,0,Se),Ke(se)}p.setAttribute("color",ae),p.computeVertexNormals();const vt=Si(t.terrain,o,r),wt=1/(vt.image.width||512),xt=i(new qe({vertexShader:ci,fragmentShader:li,vertexColors:!0,side:nt,uniforms:{uMap:{value:vt},uTexel:{value:wt},uTile:{value:or},uDetail:{value:5.6},uBump:{value:9},uGloss:{value:t.terrain==="ice"?.9:.25},uSunDir:{value:ne.clone()},uSunColor:{value:new Y(t.sunColor)},uFogColor:{value:new Y(t.fog)},uFogDensity:{value:t.fogDensity},uAmbient:{value:it},uSunPower:{value:mt}}})),Cn=new X(p,xt);c.add(Cn),w=Cn;const cn=1.8,ln=f+1,It=new Float32Array(ln);for(let se=0;se<ln;se+=1){const xe=-1+2*se/f;It[se]=Math.sign(xe)*Math.pow(Math.abs(xe),cn)*$n}const un=se=>{if(se<=It[0])return 0;if(se>=It[f])return f-1;let xe=0,Fe=f;for(;Fe-xe>1;){const Be=xe+Fe>>1;It[Be]<=se?xe=Be:Fe=Be}return xe};S=(se,xe)=>{const Fe=un(se),Be=un(xe);if(Fe<0||Be<0||Fe>=f||Be>=f)return J(se,xe);const Se=(se-It[Fe])/(It[Fe+1]-It[Fe]),ke=(xe-It[Be])/(It[Be+1]-It[Be]),at=Be*ln+Fe,Je=T.getY(at),Qe=T.getY(at+1),Nt=T.getY(at+ln),ct=T.getY(at+ln+1);return Se+ke<=1?Je+(Qe-Je)*Se+(Nt-Je)*ke:ct+(Nt-ct)*(1-Se)+(Qe-ct)*(1-ke)};const st=co(P^2135587861),Ut=[t.ground2,t.ground3,t.ground].map(se=>new Y(se).multiplyScalar(it+mt*.75)),Yt=new ko,fn=se=>{Yt.position.set(se.x,se.y,se.z),Yt.rotation.set(se.rx,se.ry,se.rz),Yt.scale.set(se.sx,se.sy,se.sz),Yt.updateMatrix(),se.mesh.setMatrixAt(se.index,Yt.matrix)},pn=(se,xe,Fe,Be,Se,ke,at)=>{const Je=new oa(se,i(new he({color:16777215})),xe);Je.instanceMatrix.setUsage(Ea);for(let Qe=0;Qe<xe;Qe+=1){const Nt=st()*Math.PI*2,ct=Fe+Math.sqrt(st())*(Be-Fe),gt=me.x+Math.cos(Nt)*ct,mn=me.z+Math.sin(Nt)*ct,et=Se+Math.pow(st(),2.1)*(ke-Se),Ht=J(gt,mn),dn=et*(.45+st()*.5),hn={mesh:Je,index:Qe,x:gt,z:mn,y:Ht+et*at,base:Ht,relief:0,liftY:et*at,sx:et*(.8+st()*.7),sy:dn,sz:et*(.8+st()*.7),rx:st()*3,ry:st()*3,rz:st()*3,fly:!1,vx:0,vy:0,vz:0,spin:new U};hn.relief=hn.y+dn*.72-Ht,C.push(hn),fn(hn),Je.setColorAt(Qe,Ut[Qe%3])}Je.instanceMatrix.needsUpdate=!0,Je.instanceColor&&(Je.instanceColor.needsUpdate=!0),c.add(Je)};if(pn(i(new Mn(1,0)),o?90:170,1.2,60,.02,.22,.35),pn(i(new Mn(1,1)),o?30:54,2,120,.18,1.1,.34),pn(i(new Mn(1,1)),o?10:18,6,190,.6,2.4,.4),H=(se,xe,Fe)=>{const Be=Fe*2.4;for(let Se=0;Se<T.count;Se+=1){const ke=T.getX(Se)-se,at=T.getZ(Se)-xe;ke*ke+at*at>Be*Be||Ke(Se)}T.needsUpdate=!0,ae.needsUpdate=!0,p.computeVertexNormals()},m=()=>{for(let se=0;se<T.count;se+=1)Ke(se);T.needsUpdate=!0,ae.needsUpdate=!0,p.computeVertexNormals()},F=(se,xe,Fe)=>{const Be=Fe*1.2,Se=Fe*2.3;for(const ke of C){const at=ke.x-se,Je=ke.z-xe,Qe=Math.hypot(at,Je);if(!(Qe>Se)){if(ke.base=J(ke.x,ke.z),ke.y=ke.base+ke.liftY,ke.relief=ke.y+ke.sy*.72-ke.base,Qe<Be&&ke.sy>.16){const Nt=Qe>.001?Qe:1,ct=12+Math.random()*26;ke.fly=!0,ke.vx=at/Nt*ct,ke.vz=Je/Nt*ct,ke.vy=9+Math.random()*20,ke.spin.set((Math.random()-.5)*9,(Math.random()-.5)*9,(Math.random()-.5)*9)}fn(ke),ke.mesh.instanceMatrix.needsUpdate=!0}}},t.terrain==="ice"){const se=[],xe=co(P^1542469173),Fe=(Se,ke,at,Je,Qe,Nt)=>{let ct=Se,gt=ke,mn=at;for(let et=0;et<Je;et+=1){const Ht=ct+Math.cos(mn)*Qe,dn=gt+Math.sin(mn)*Qe;se.push(ct,J(ct,gt)+.06,gt,Ht,J(Ht,dn)+.06,dn),ct=Ht,gt=dn,mn+=(xe()-.5)*.9,Nt>0&&et===Je>>1&&xe()<.7&&Fe(ct,gt,mn+(xe()<.5?.9:-.9),Math.max(3,Je>>2),Qe*.8,Nt-1)}};for(let Se=0;Se<(o?6:10);Se+=1)Fe((xe()-.5)*300,(xe()-.5)*300,xe()*Math.PI*2,14,14,1);const Be=i(new Kt);Be.setAttribute("position",new xn(new Float32Array(se),3)),c.add(new Js(Be,i(new Po({color:t.ground3,transparent:!0,opacity:.75}))))}}if(t.terrain==="ring"){const f=new Le;f.position.copy(Ra(t.companionAz,0)).multiplyScalar(2600);const p=Gs;f.position.y=p;const T=480,g=T*1.11,h=T*2.36,te=new X(i(new Ce(T,o?64:128,o?44:80)),i(new qe({vertexShader:_s,fragmentShader:Ws,uniforms:{uMap:{value:Us("saturn",t,o,r)},uLimb:{value:.4},uRim:{value:new Y("#e8dcbc")}}})));f.add(te);const E=i(new qe({vertexShader:io,fragmentShader:Ta,transparent:!0,side:nt,depthWrite:!1,uniforms:{uProfile:{value:Ca(o,r)},uInner:{value:g},uOuter:{value:h},uAlpha:{value:o?.78:.88}}})),ae=new X(i(new yt(g,h,o?128:220,1)),E);ae.rotation.x=-Math.PI/2,ae.position.y=p,f.add(ae),c.add(f);const R=o?220:420,Ke=i(new Mn(1,0)),vt=i(new he({color:"#dfe8f2"})),wt=new oa(Ke,vt,R);wt.instanceMatrix.setUsage(Ea);const xt=co(P^1374496523),Cn=[],cn=new ko;for(let st=0;st<R;st+=1){const Yt=st%31===0?.5+xt()*1.3:.05+Math.pow(xt(),2)*.55,fn=14+Math.pow(xt(),.7)*150,pn=xt()*Math.PI*2,se=(xt()-.5)*14;Cn.push({r:fn,a:pn,y:se,spin:.02+xt()*.08,size:Yt,wob:xt()*Math.PI*2}),cn.position.set(Math.cos(pn)*fn,se,Math.sin(pn)*fn),cn.rotation.set(xt()*3,xt()*3,xt()*3),cn.scale.setScalar(Yt),cn.updateMatrix(),wt.setMatrixAt(st,cn.matrix);const xe=.5+xt()*.45;wt.setColorAt(st,new Y(xe,xe*.98,xe*1.05))}wt.instanceMatrix.needsUpdate=!0,wt.instanceColor&&(wt.instanceColor.needsUpdate=!0),c.add(wt),v={mesh:wt,data:Cn};const ln=i(new qe({vertexShader:io,fragmentShader:Yo,transparent:!0,side:nt,depthWrite:!1,uniforms:{uInner:{value:.6},uOuter:{value:2600-h-10},uBands:{value:260},uA:{value:new Y("#e2eaf4")},uB:{value:new Y("#c3cfdd")},uAlpha:{value:.92},uGrain:{value:.26}}})),It=2600-h-10,un=new X(i(new yt(.6,It,128,1)),ln);un.rotation.x=-Math.PI/2,un.position.y=p,c.add(un)}if(t.ring){const f=t.ring==="uranus",p=f?210:170,T=f?520:560,g=f?82*uo:27*uo,h=f?140:54,te=i(f?new qe({vertexShader:io,fragmentShader:Yo,transparent:!0,side:nt,depthWrite:!1,uniforms:{uInner:{value:p},uOuter:{value:T},uBands:{value:h},uA:{value:new Y("#9fd0d6")},uB:{value:new Y("#cdeef2")},uAlpha:{value:.5},uGrain:{value:.4}}}):new qe({vertexShader:io,fragmentShader:Ta,transparent:!0,side:nt,depthWrite:!1,uniforms:{uProfile:{value:Ca(o,r)},uInner:{value:p},uOuter:{value:T},uAlpha:{value:.82}}})),E=new X(i(new yt(p,T,o?64:128,1)),te);if(E.rotation.x=-Math.PI/2+g,E.position.y=f?30:90,c.add(E),f){const ae=i(new qe({vertexShader:io,fragmentShader:Yo,transparent:!0,side:nt,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new Y("#dff6f8")},uB:{value:new Y("#bfe6ea")},uAlpha:{value:.35},uGrain:{value:.3}}})),R=new X(i(new yt(130,175,64,1)),ae);R.rotation.x=-Math.PI/2+g,R.position.y=30,c.add(R)}}if(t.companion&&t.terrain!=="ring"){const p=Math.max(6,Math.tan(t.companionSize/2*uo)*1500),T=new Le;T.position.copy(Ra(t.companionAz,t.companionElev)).multiplyScalar(1500);const g=Us(t.companion,t,o,r),h=new X(i(new Ce(p,o?48:72,o?32:48)),i(new qe({vertexShader:_s,fragmentShader:Ws,uniforms:{uMap:{value:g},uLimb:{value:.42},uRim:{value:new Y(t.companion==="earth"?"#9fd0ff":"#cfe0f2")}}})));if(h.lookAt(0,0,0),T.add(h),t.companion==="saturn"||t.companion==="jupiter"){const E=t.companion==="saturn",ae=i(new qe({vertexShader:io,fragmentShader:E?Ta:Yo,transparent:!0,side:nt,depthWrite:!1,uniforms:E?{uProfile:{value:Ca(o,r)},uInner:{value:p*1.12},uOuter:{value:p*2.36},uAlpha:{value:.7}}:{uInner:{value:p*1.3},uOuter:{value:p*1.7},uBands:{value:16},uA:{value:new Y("#d9c7a8")},uB:{value:new Y("#b09070")},uAlpha:{value:.18},uGrain:{value:.3}}})),R=new X(i(new yt(p*(E?1.12:1.3),p*(E?2.36:1.7),64,1)),ae);R.rotation.x=-Math.PI/2+.32,T.add(R)}const te=new fo(i(new po({map:x,color:new Y(t.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:Oe})));te.scale.setScalar(p*4),T.add(te),c.add(T)}const ue=t.terrain!=="ring",ie=(f,p)=>t.terrain==="ring"?Gs:t.cloudTop!==null?t.cloudTop:J(f,p),sn=qr({sunDir:ne,ambient:Math.min(1.05,it+.24),sunPower:mt});c.add(sn.group),sn.setVisible(!1);const Ft=ii({floorAt:ie,heightAt:J,onImpact:n.onImpact,onScar:(f,p)=>Ao(f,p)});c.add(Ft.group);const rn=o?140:t.particles==="haze"?120:300;let Q=null,G=null;if(t.particles!=="none"){const f=new Float32Array(rn*3);G=new Float32Array(rn*3);const p=co(P^625341585);for(let te=0;te<rn;te+=1){const E=p()*Math.PI*2,ae=Math.sqrt(p())*55,R=t.particles;let Ke=p()*22;R==="spark"&&(Ke=p()*14),R==="haze"&&(Ke=2+p()*26),f[te*3]=Math.cos(E)*ae,f[te*3+1]=Ke,f[te*3+2]=Math.sin(E)*ae;const vt=R==="wind"?42+p()*34:R==="rain"?12+p()*6:R==="spark"?2+p()*4:1.2+p()*2.6;G[te*3]=R==="wind"?vt:(p()-.5)*vt*.5,G[te*3+1]=R==="rain"?-vt:R==="spark"?vt:R==="snow"?-.6-p()*.9:(p()-.5)*.4,G[te*3+2]=R==="wind"?vt*.25:(p()-.5)*vt*.4}Q=i(new Kt),Q.setAttribute("position",new xn(f,3));const T=t.particles==="haze"?2.6:t.particles==="dust"?.14:t.particles==="rain"?.09:t.particles==="snow"?.11:.16,g=i(new na({color:new Y(t.particleColor),size:T,transparent:!0,opacity:t.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:t.particles==="spark"?Oe:void 0})),h=new ta(Q,g);h.frustumCulled=!1,c.add(h)}const V=i(new Mn(.26,0)),oe=i(new Ce(.24,16,12)),ye=t.cloudTop===null&&t.terrain!=="plasma",j=[],W=[],ce=[];function Et(f,p,T,g){const h=new fo(i(new po({map:x,color:new Y(p),transparent:!0,opacity:.9,depthWrite:!1,blending:Oe})));h.position.copy(f),h.scale.setScalar(T),c.add(h),W.push({sprite:h,life:g,max:g,grow:T*2.4})}function Mt(f,p){const T=new X(i(new yt(.28,.5,24,1)),i(new he({color:new Y(p),transparent:!0,opacity:.6,depthWrite:!1,side:nt})));T.rotation.x=-Math.PI/2,T.position.copy(f),c.add(T),ce.push({mesh:T,life:.7})}function kn(f,p){const T=me.x+f,g=me.z+p,h=t.cloudTop!==null?t.cloudTop:J(T,g),te=ye?new he({color:new Y("#c9c2b4").multiplyScalar(it+mt*.8),transparent:!0}):new he({color:new Y("#ffb45e"),transparent:!0}),E=new X(ye?V:oe,te);E.position.set(T,h+4.2,g),E.scale.setScalar(.9+Math.random()*.35),c.add(E);const ae=t.gravityMps2<=.01;if(j.push({mesh:E,x:T,z:g,y:ae?h+.6:h+4.2,vy:ae?.12:0,vx:ae?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:ae?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),j.length>6){const R=j.shift();R&&(c.remove(R.mesh),R.mesh.material.dispose())}}function Pn(f,p){const T=new U(f.x,p+.2,f.z);if(t.gravityMps2<=.01){f.outcome="float",f.landed=!0,f.resting=5.5,n.onLand?.({seconds:f.fall,bounces:0,outcome:"float"});return}if(t.terrain==="plasma"){f.outcome="vapor",f.landed=!0,f.resting=.25,Et(T,"#fff2c0",1.2,.6),n.onLand?.({seconds:f.fall,bounces:0,outcome:"vapor"});return}if(t.cloudTop!==null){f.outcome="sink",f.landed=!0,f.resting=1.6,Et(T,"#ffffff",1.6,.7),n.onLand?.({seconds:f.fall,bounces:0,outcome:"sink"});return}if(f.bounces+=1,Mt(T,t.ground2),f.bounces===1&&n.onLand?.({seconds:f.fall,bounces:1,outcome:"bounce"}),f.bounces>=4||Math.abs(f.vy)<1.3){f.landed=!0,f.outcome="bounce",f.resting=1.6,f.vy=0;return}f.vy=Math.abs(f.vy)*.42,f.y=p+.26,f.vx*=.6,f.vz*=.6}const zn=new ko,Dn=new Y("#31090d"),sa=new Y("#180509"),To=new Y("#ff3a10");function Ot(f,p){Ft.update(f,p);const T=Ft.doom();Z.uniforms.uTop.value&&(Z.uniforms.uTop.value.copy(we).lerp(Dn,T),Z.uniforms.uBottom.value.copy(ot).lerp(sa,T),Z.uniforms.uGlow.value.copy(O).lerp(To,T)),de&&(de.opacity=.85*(1-T*.85)),Lt&&(Lt.uniforms.uTime.value=f);for(let g=0;g<ut.length;g+=1){const h=ut[g].uniforms.uOffset.value;h.x=(h.x+p*(g===0?.006:.012))%1}if(v){const{mesh:g,data:h}=v;for(let te=0;te<h.length;te+=1){const E=h[te];E.a+=E.spin*p*.05,zn.position.set(Math.cos(E.a)*E.r,E.y+Math.sin(f*.25+E.wob)*.5,Math.sin(E.a)*E.r),zn.rotation.set(f*.08+E.wob,f*.11+E.a,E.wob),zn.scale.setScalar(E.size),zn.updateMatrix(),g.setMatrixAt(te,zn.matrix)}g.instanceMatrix.needsUpdate=!0}if(Q&&G){const g=Q.attributes.position,h=g.array;for(let te=0;te<g.count;te+=1){const E=te*3;h[E]+=G[E]*p,h[E+1]+=G[E+1]*p,h[E+2]+=G[E+2]*p,t.particles==="rain"||t.particles==="snow"?h[E+1]<0&&(h[E+1]=22):t.particles==="spark"?h[E+1]>20&&(h[E+1]=0):(h[E+1]<0&&(h[E+1]=24),h[E+1]>26&&(h[E+1]=0)),h[E]>60&&(h[E]=-60),h[E]<-60&&(h[E]=60),h[E+2]>60&&(h[E+2]=-60),h[E+2]<-60&&(h[E+2]=60)}g.needsUpdate=!0}for(let g=j.length-1;g>=0;g-=1){const h=j[g],te=t.cloudTop!==null?t.cloudTop:J(h.x,h.z);if(h.landed)h.resting>0?(h.resting-=p,h.outcome==="sink"?(h.y-=p*2.4,h.mesh.scale.multiplyScalar(1-p*.8)):h.outcome==="vapor"?h.mesh.scale.multiplyScalar(1-p*3):h.mesh.scale.multiplyScalar(1-p*.25)):(h.fade-=p*1.4,h.mesh.material.opacity=Math.max(0,h.fade),h.mesh.scale.multiplyScalar(1-p*.9),h.fade<=0&&(c.remove(h.mesh),h.mesh.material.dispose(),j.splice(g,1)));else{if(h.fall+=p,t.gravityMps2<=.01){h.x+=h.vx*p,h.z+=h.vz*p,h.y+=h.vy*p,h.mesh.rotation.x+=p*.6,h.mesh.rotation.y+=p*.45,h.mesh.position.set(h.x,h.y,h.z),h.fall>.05&&Pn(h,h.y);continue}h.vy-=t.gravityMps2*p,h.y+=h.vy*p,h.x+=h.vx*p,h.z+=h.vz*p,h.mesh.rotation.x+=p*3.2,h.mesh.rotation.z+=p*2.1,h.y-.26<=te&&(h.y=te+.26,Pn(h,te))}h.mesh.position.set(h.x,h.y,h.z)}for(const g of C){if(!g.fly)continue;const h=Math.max(1.2,t.gravityMps2);g.vy-=h*p,g.x+=g.vx*p,g.y+=g.vy*p,g.z+=g.vz*p,g.vx*=1-p*.25,g.vz*=1-p*.25,g.rx+=g.spin.x*p,g.ry+=g.spin.y*p,g.rz+=g.spin.z*p;const te=J(g.x,g.z)+g.sy*.72;g.y<=te&&(g.y=te,g.fly=!1,g.vx=0,g.vy=0,g.vz=0,g.base=J(g.x,g.z),g.liftY=g.y-g.sy*.72-g.base,g.relief=g.y+g.sy*.72-g.base),_n(g),g.mesh.instanceMatrix.needsUpdate=!0}for(let g=W.length-1;g>=0;g-=1){const h=W[g];h.life-=p;const te=1-h.life/h.max;h.sprite.scale.setScalar(h.sprite.scale.x+(h.grow-h.sprite.scale.x)*Math.min(1,p*6)),h.sprite.material.opacity=Math.max(0,.9*(1-te)),h.life<=0&&(c.remove(h.sprite),W.splice(g,1))}for(let g=ce.length-1;g>=0;g-=1){const h=ce[g];h.life-=p,h.mesh.scale.multiplyScalar(1+p*3.4),h.mesh.material.opacity=Math.max(0,h.life/.7)*.6,h.life<=0&&(c.remove(h.mesh),ce.splice(g,1))}}function Ao(f,p){if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring"||!H)return 0;const T=22+Math.random()*6,g=Math.max(1.4,J(f,p)+26),h=Math.min(4.8+Math.random()*1.2,g);return l.push({x:f,z:p,r:T,d:h}),l.length>Ni&&(l.shift(),m?.()),H(f,p,T),F?.(f,p,T),T}const Tn=new ko;function _n(f){Tn.position.set(f.x,f.y,f.z),Tn.rotation.set(f.rx,f.ry,f.rz),Tn.scale.set(f.sx,f.sy,f.sz),Tn.updateMatrix(),f.mesh.setMatrixAt(f.index,Tn.matrix)}function An(f,p){let T=f,g=p,h=0;for(const te of C){if(te.fly)continue;const E=Math.max(te.sx,te.sz);if(E<.04)continue;let ae=T-te.x,R=g-te.z;const Ke=Math.hypot(ae,R);if(!(Ke>E+1.2)){if(te.relief<=Fi)Ke<E*.95&&(h=Math.max(h,te.relief));else if(Ke<E+Vs){Ke<1e-4&&(ae=0,R=1);const vt=Math.max(1e-4,Math.hypot(ae,R)),wt=E+Vs-Ke;T+=ae/vt*wt,g+=R/vt*wt}}}return{x:T,z:g,rise:h}}const ra=(f,p)=>{const g=-(J(f+.9,p)-J(f-.9,p))/1.8,h=-(J(f,p+.9)-J(f,p-.9))/(2*.9);return new U(g,1,h).normalize()},Co=new Qs,Ro=(f,p)=>{const T=S?S(f,p):J(f,p);let g=null;if(w){Co.set(new U(f,4e3,p),new U(0,-1,0));const h=Co.intersectObject(w,!1)[0];h&&(g=h.point.y)}return{mesh:T,ray:g}};function Wn(){sn.dispose(),Ft.dispose();for(const f of W)c.remove(f.sprite);for(const f of ce)c.remove(f.mesh);for(const f of j)c.remove(f.mesh),f.mesh.material.dispose();y.forEach(f=>f.dispose()),c.clear()}return{group:c,eyeY:le+L,eyeHeight:L,groundY:le,standX:me.x,standZ:me.z,heightAt:J,floorAt:ie,solidFloor:ue,walkable:t.cloudTop===null&&t.terrain!=="ring",avatar:sn,impact:Ft,scar:Ao,walk:An,normalAt:ra,scarCount:()=>l.length,atmosphere:Ne,meshHeightAt:(f,p)=>S?S(f,p):J(f,p),probeGround:Ro,update:Ot,drop:kn,dispose:Wn}}const Di="models/rocket/",_i="textures/rocket/",Bs={engine:"engine-cluster",stage1:"first-stage-core",inter:"interstage",stage2:"second-stage",fairing:"payload-fairing",fins:"grid-fin-set",mount:"launch-mount",deflector:"flame-deflector",gantryBase:"gantry-base",gantryTower:"gantry-tower",strongback:"strongback",mast:"lightning-mast",flood:"floodlight"},ea=4.4;let Os=null,js=null;function Wi(){return js??=(async()=>{const t=new tr,n=async(k,x)=>{const l=await t.loadAsync(`${_i}${k}.webp`);return l.wrapS=Na,l.wrapT=Na,l.colorSpace=x?bn:Ua,l.anisotropy=8,l},[o,r,c,y,i,v,S,w,P]=await Promise.all([n("hull_color",!0),n("hull_normal",!1),n("hull_rough",!1),n("tile_color",!0),n("tile_normal",!1),n("tile_rough",!1),n("steel_color",!0),n("steel_normal",!1),n("steel_rough",!1)]);return{hullColor:o,hullNormal:r,hullRough:c,tileColor:y,tileNormal:i,tileRough:v,steelColor:S,steelNormal:w,steelRough:P}})(),js}function Li(){return Os??=(async()=>{const t=new Er,n=new Map;return await Promise.all(Object.keys(Bs).map(async o=>{const r=await t.loadAsync(`${Di}${Bs[o]}.glb`);n.set(o,r.scene)})),n})(),Os}function Ui(t,n){const o=(c,y,i,v,S,w)=>new Ia({map:c,normalMap:y,roughnessMap:i,color:v,metalness:S,roughness:w,envMap:n,envMapIntensity:1.15}),r=(c,y,i)=>new Ia({color:c,metalness:y,roughness:i,envMap:n,envMapIntensity:.9});return{white:o(t.hullColor,t.hullNormal,t.hullRough,15659766,.88,.62),cryo:o(t.hullColor,t.hullNormal,t.hullRough,12175834,.82,.55),charcoal:o(t.tileColor,t.tileNormal,t.tileRough,10132122,.38,.72),steel:o(t.steelColor,t.steelNormal,t.steelRough,12764876,.8,.5),red:r(11942448,.3,.55),yellow:r(14197788,.35,.5),concrete:r(11051930,.05,.92),glass:r(3030348,.55,.25)}}function Gi(t,n,o){t.traverse(r=>{const c=r;if(!c.isMesh)return;const y=c.geometry,i=y.getAttribute("position");if(!i)return;const v=new Float32Array(i.count*2);for(let S=0;S<i.count;S+=1){const w=i.getX(S),P=i.getY(S),k=i.getZ(S);v[S*2]=(Math.atan2(w,k)/(Math.PI*2)+.5)*n,v[S*2+1]=P*o}y.setAttribute("uv",new xn(v,2))})}function Vi(t,n){t.traverse(o=>{const r=o;if(!r.isMesh)return;const c=r.geometry,y=c.getAttribute("position");if(!y)return;const i=new Float32Array(y.count*2);for(let v=0;v<y.count;v+=1)i[v*2]=(y.getX(v)+y.getZ(v))*n,i[v*2+1]=y.getY(v)*n;c.setAttribute("uv",new xn(i,2))})}function Xs(t,n){t.traverse(o=>{const r=o;if(!r.isMesh)return;const c=r.material;Array.isArray(c)?r.material=c.map(y=>n[y.name]??n.steel):r.material=n[c?.name??"steel"]??n.steel})}function Bi(t,n){if(typeof document>"u")return null;const o=document.createElement("canvas");o.width=128,o.height=64;const r=o.getContext("2d");if(!r)return null;const c=r.createLinearGradient(0,0,0,64),y=new Y("#8d8a84"),i=new Y(n.ground).lerp(y,.5).getStyle(),v=new Y(n.ground2??n.ground).lerp(y,.5).getStyle();c.addColorStop(0,n.skyTop),c.addColorStop(.5,n.skyBottom),c.addColorStop(.53,i),c.addColorStop(1,v),r.fillStyle=c,r.fillRect(0,0,128,64);const S=(n.sunAz/360%1+1)%1*128,w=32-n.sunElev/90*26,P=r.createRadialGradient(S,w,0,S,w,n.sunScale>0?18:.1);P.addColorStop(0,n.sunColor),P.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=P,r.fillRect(0,0,128,64);const k=new Zn(o);k.mapping=Nr,k.colorSpace=bn;const x=new Fr(t),l=x.fromEquirectangular(k).texture;return x.dispose(),k.dispose(),l}const Oi=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,ji=`
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
`;function Xi(){const n=document.createElement("canvas");n.width=96,n.height=96;const o=n.getContext("2d");if(o){const c=o.createRadialGradient(48,48,2,48,48,48);c.addColorStop(0,"rgba(255,255,255,0.95)"),c.addColorStop(.45,"rgba(240,240,240,0.5)"),c.addColorStop(1,"rgba(230,230,230,0)"),o.fillStyle=c,o.fillRect(0,0,96,96)}const r=new Zn(n);return r.colorSpace=bn,r}async function Yi(t,n){const[o,r]=await Promise.all([Li(),Wi()]),c=Bi(t,n),y=Ui(r,c),i=new Le;i.name="rocket-pad";const v=O=>{const Z=o.get(O);if(!Z)throw new Error(`rocket part ${O}`);return Z.clone(!0)},S=(O,Z,ze=0,Ye=0,Ne=0)=>{const de=v(Z);return de.position.set(Ye,ze,Ne),O.add(de),de},w=new Le;if(i.add(w),S(w,"mount",0,0,0),S(w,"deflector",-1.9,0,0),S(w,"gantryBase",0,-11.5,1.5),S(w,"gantryTower",7.71,-11.5,1.5),S(w,"gantryTower",14.94,-11.5,1.5),S(w,"strongback",6.19,-7.4,-.4),S(w,"mast",0,-19,-8),S(w,"flood",0,13,7),S(w,"flood",0,-13,9),Xs(w,y),Vi(w,.2),n.cloudTop===null&&n.terrain!=="ring"){const O=new X(new Ko(7.9,8.6,7.2,40,1),y.concrete);O.position.y=-3.25,O.name="pad-foundation",w.add(O)}const k=[];w.traverse(O=>{/^clamp-[a-d]$/.test(O.name)&&k.push(O)});const x=new Le;x.position.y=ea,i.add(x),S(x,"engine",0),S(x,"stage1",3),S(x,"fins",23.2),S(x,"inter",27),S(x,"stage2",30.6),S(x,"fairing",42.9),Xs(x,y),Gi(x,7,.3);const l=new Le,C={uTime:{value:0},uPower:{value:0},uCore:{value:new Y("#fff6dd")},uEdge:{value:new Y("#ff9a3a")}},m=new qe({uniforms:C,vertexShader:Oi,fragmentShader:ji,transparent:!0,blending:Oe,depthWrite:!1,side:nt}),H=new X(new Fa(2.5,26,20,4,!0),m);H.rotation.x=Math.PI,H.position.y=-1;const F=new X(new Fa(1.35,15,18,3,!0),m);F.rotation.x=Math.PI,F.position.y=-1,l.add(H,F),l.visible=!1,x.add(l);const $=new er(16756848,0,110,0);$.position.set(0,2,0),x.add($);const K=Xi(),I=[],fe=[],re=new po({map:K,transparent:!0,opacity:.5,depthWrite:!1,color:new Y("#d8d3cc")}),J=(O,Z,ze,Ye,Ne,de,mt)=>{let it=fe.pop();it||(it=new fo(re)),it.visible=!0,it.position.set(O,Z,ze),it.scale.setScalar(Ye),it.material=re,i.add(it),I.push({sprite:it,life:Ne,max:Ne,vx:(Math.random()-.5)*de,vy:mt*(.6+Math.random()*.8),vz:(Math.random()-.5)*de,spin:(Math.random()-.5)*.8,grow:Ye*(1.8+Math.random()*1.4)})};let me=0,le=0,L=0,ne=0,Re=0,Ue=0,we=0;return{group:i,rocket:x,light:$,setBase(O,Z,ze){me=O,le=Z,L=ze,i.position.set(O,ze,Z)},baseX:()=>me,baseZ:()=>le,setLift(O){Re=O,x.position.y=ea+O},setThrottle(O){ne=Math.max(0,Math.min(1,O)),l.visible=ne>.01,C.uPower.value=ne,$.intensity=ne*90},setPadVisible(O){w.visible=O},setFacing(O){i.rotation.y=O},setClamps(O){Ue=Math.max(0,Math.min(1,O));for(const Z of k){const ze=Z.position.x,Ye=Z.position.z,Ne=Math.atan2(ze,Ye),de=new U(Math.cos(Ne),0,-Math.sin(Ne));Z.quaternion.setFromAxisAngle(de,Ue*.62)}},update(O,Z,ze){C.uTime.value=O;const Ye=1+Math.min(1.6,ze/180);if(l.scale.set(1,Ye,1),l.rotation.y=O*2.4,ne>.05&&ze<90)for(we+=Z*(6+ne*22);we>1;){we-=1;const Ne=Math.random()*Math.PI*2,de=2+Math.random()*3.4;J(me+Math.cos(Ne)*de,L+ea+Re*.06+Math.random()*3,le+Math.sin(Ne)*de,2.6+Math.random()*3.2,1.5+Math.random()*1.6,9+ne*16,3+ne*8)}for(let Ne=I.length-1;Ne>=0;Ne-=1){const de=I[Ne];de.life-=Z;const mt=1-de.life/de.max;de.sprite.position.x+=de.vx*Z,de.sprite.position.y+=de.vy*Z,de.sprite.position.z+=de.vz*Z,de.vy+=Z*.6,de.vx*=1-Z*.6,de.vz*=1-Z*.6,de.sprite.scale.setScalar(Ir.lerp(de.sprite.scale.x,de.grow,Math.min(1,Z*1.6))),de.sprite.material.opacity=Math.max(0,.5*(1-mt)*(1-mt)),de.sprite.material.rotation+=de.spin*Z,de.life<=0&&(de.sprite.visible=!1,fe.push(de.sprite),I.splice(Ne,1))}},dispose(){for(const O of I)i.remove(O.sprite),O.sprite.visible=!1;I.length=0,K.dispose(),re.dispose(),m.dispose(),H.geometry.dispose(),F.geometry.dispose();for(const O of Object.values(y))O.dispose()}}}let Ys=null;function Ga(){if(typeof window>"u")return null;const t=window.AudioContext||window.webkitAudioContext;return t?(Ys??=new t,Ys):null}let Wa=null;function Hi(){const t=Ga();t&&t.state==="suspended"&&t.resume().catch(()=>{})}function La(){const t=Wa;Wa=null,t?.stop()}function $i(t){if(!nr().soundOn)return;const n=Ga();if(!n)return;n.state==="suspended"&&n.resume().catch(()=>{});const o=n.currentTime,r=n.createOscillator(),c=n.createGain();r.type="square",r.frequency.setValueAtTime(t?1320:880,o),c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(t?.09:.055,o+.01),c.gain.exponentialRampToValueAtTime(1e-4,o+(t?.34:.16)),r.connect(c),c.connect(n.destination),r.start(o),r.stop(o+.4)}function Zi(t,n,o){if(!nr().soundOn)return null;const r=Ga();if(!r)return null;r.state==="suspended"&&r.resume().catch(()=>{}),La();const c=r.currentTime,y=c+Math.max(0,t),i=y+Math.max(2,n),v=r.createGain();v.gain.setValueAtTime(1e-4,c),v.gain.exponentialRampToValueAtTime(.85,c+.2);const S=r.createDynamicsCompressor();S.threshold.value=-16,S.knee.value=14,S.ratio.value=3.6,S.attack.value=.006,S.release.value=.35,v.connect(S),S.connect(r.destination);const w=[],P=[],k=(L,ne,Re)=>{L.start(ne),L.stop(ne+Re),w.push(L)},x=Math.floor(r.sampleRate*2.5),l=r.createBuffer(1,x,r.sampleRate),C=l.getChannelData(0);let m=0,H=0,F=0,$=0,K=0,I=0,fe=0;for(let L=0;L<x;L+=1){const ne=Math.random()*2-1;m=.99886*m+ne*.0555179,H=.99332*H+ne*.0750759,F=.969*F+ne*.153852,$=.8665*$+ne*.3104856,K=.55*K+ne*.5329522,I=-.7616*I-ne*.016898,C[L]=(m+H+F+$+K+I+fe+ne*.5362)*.12,fe=ne*.115926}const re=(L,ne,Re,Ue,we,ot,O=1,Z=.02)=>{const ze=r.createBufferSource();ze.buffer=l,ze.loop=!0;const Ye=r.createBiquadFilter();Ye.type=Ue,Ye.Q.value=O,Ye.frequency.setValueAtTime(we,L),ot!==we&&Ye.frequency.exponentialRampToValueAtTime(Math.max(20,ot),L+ne);const Ne=r.createGain();Ne.gain.setValueAtTime(1e-4,L),Ne.gain.exponentialRampToValueAtTime(Math.max(2e-4,Re),L+Z),Ne.gain.setValueAtTime(Math.max(2e-4,Re),Math.max(L+Z,L+ne*.55)),Ne.gain.exponentialRampToValueAtTime(1e-4,L+ne),ze.connect(Ye),Ye.connect(Ne),Ne.connect(v),P.push(Ye,Ne),k(ze,L,ne+.05)},J=(L,ne,Re,Ue,we,ot="sine")=>{const O=r.createOscillator();O.type=ot,O.frequency.setValueAtTime(Re,L),O.frequency.exponentialRampToValueAtTime(Math.max(8,Ue),L+ne*.85);const Z=r.createGain();Z.gain.setValueAtTime(1e-4,L),Z.gain.exponentialRampToValueAtTime(Math.max(2e-4,we),L+.05),Z.gain.exponentialRampToValueAtTime(1e-4,L+ne),O.connect(Z),Z.connect(v),P.push(Z),k(O,L,ne+.02)},me=.55+Math.min(.45,o*.12);J(y,1.5,96,26,me),re(y,1.2,.55,"lowpass",2600,260,.8,.01);for(const[L,ne]of[[41,.5],[58,.32],[83,.18]]){const Re=r.createOscillator();Re.type="sawtooth",Re.frequency.setValueAtTime(L*1.25,y),Re.frequency.exponentialRampToValueAtTime(L,y+n*.4);const Ue=r.createGain();Ue.gain.value=.6;const we=r.createOscillator();we.frequency.value=6.5+Math.random()*3.5;const ot=r.createGain();ot.gain.value=.4,we.connect(ot),ot.connect(Ue.gain);const O=r.createBiquadFilter();O.type="lowpass",O.frequency.value=180;const Z=r.createGain();Z.gain.setValueAtTime(1e-4,y),Z.gain.exponentialRampToValueAtTime(ne,y+.8),Z.gain.setValueAtTime(ne,i-Math.max(1,n*.35)),Z.gain.exponentialRampToValueAtTime(1e-4,i),Re.connect(Ue),Ue.connect(O),O.connect(Z),Z.connect(v),P.push(Ue,O,Z),k(Re,y,n+.1),k(we,y,n+.1)}re(y,n*.9,.34,"bandpass",1800,900,.9,.05),re(y+1.2,n*.85,.22,"highpass",2600,5200,.7,.8),re(y+2.4,n*.6,.2,"bandpass",700,2400,.6,1.2),v.gain.setValueAtTime(.85,Math.max(c+.2,i-1.6)),v.gain.exponentialRampToValueAtTime(1e-4,i+.4);const le={stop:()=>{const L=r.currentTime;try{v.gain.cancelScheduledValues(L),v.gain.setValueAtTime(Math.max(1e-4,v.gain.value),L),v.gain.exponentialRampToValueAtTime(1e-4,L+.25)}catch{}for(const ne of w)try{ne.stop(L+.3)}catch{}window.setTimeout(()=>{for(const ne of P)ne.disconnect();v.disconnect(),S.disconnect()},400)}};return Wa=le,le}const Hs="textures/",Wt=Math.PI/180;function qo(t,n,o=1){return new U(Math.cos(t*Wt)*Math.cos(n*Wt),Math.sin(t*Wt),-Math.cos(t*Wt)*Math.sin(n*Wt)).multiplyScalar(o)}const Xe=2.2,qi=Date.UTC(2e3,0,1,12),$s={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},Zs={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function Ki(){if(typeof window>"u")return!0;const t=navigator,n=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,o=t.hardwareConcurrency??8,r=t.deviceMemory??8;return!!(n||o<=4||r<=4)}function Ji(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d");if(o){const r=o.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,"rgba(255,238,205,0.85)"),r.addColorStop(.3,"rgba(255,214,150,0.55)"),r.addColorStop(.45,"rgba(255,190,120,0.22)"),r.addColorStop(.7,"rgba(250,170,95,0.07)"),r.addColorStop(1,"rgba(255,160,80,0)"),o.fillStyle=r,o.fillRect(0,0,128,128)}return new Zn(n)}const Qi=`
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
}`,ec=`
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
}`;function tc(t){return Math.max(.12,.16+.11*Math.log2(t/2e3))}const nc=`
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
}`,oc=`
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
}`,ac=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,sc=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,qs=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Ks=`
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
}`,rc=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,ic=`
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
}`,cc=`
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
}`,lc=`
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
}`,uc=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,fc=`
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
}`,pc=`
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
}`,mc=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function xc(t,n){const o=Ki(),r=o?96:128,c=new Dr({antialias:!0,powerPreference:"default",alpha:!1});c.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),c.outputColorSpace=bn,c.toneMapping=_r,c.toneMappingExposure=1.1;const y=Math.min(4,c.capabilities.getMaxAnisotropy()),i=c.domElement;i.style.display="block",i.style.width="100%",i.style.height="100%",i.style.touchAction="none",t.appendChild(i);const v=document.createElement("div");v.className="space-labels",t.appendChild(v);const S=[];let w=0;function P(){const e=performance.now();if(e-w<400)return;w=e,S.length=0;const a=t.getBoundingClientRect();for(const s of[".explore-top",".sheet",".sky-alert"]){const d=document.querySelector(s);if(!d)continue;const M=d.getBoundingClientRect();M.width<2||M.height<2||S.push({x:M.left-a.left,y:M.top-a.top,w:M.width,h:M.height})}}function k(e,a,s,d=22){for(const M of S)if(e<M.x+M.w&&e+s>M.x&&a<M.y+M.h&&a+d>M.y)return!0;return!1}const x=new Wr;x.background=new Y("#05070d");const l=new Lr(45,1,.01,2e3),C=[],m=e=>(C.push(e),e),H=new tr,F=new Ur,$=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),K=new Map,I=new Map,fe=[],re=new Set;let J=!1,me=0;const le=(e,a)=>{const s=I.get(e);if(s){I.delete(e);for(const d of s)d(a)}},L=(e,a=!0)=>{const s=K.get(e);if(s)return s;me+=1;const d=H.load(Hs+e,()=>{le(e,d),me-=1,me===0&&n.onReady?.()},void 0,()=>{le(e,d),me-=1,me===0&&n.onReady?.()});return d.colorSpace=a?bn:Ua,d.anisotropy=o?4:8,K.set(e,d),m(d)},ne=e=>{K.has(e)||re.has(e)||(re.add(e),F.load(Hs+e,a=>{re.delete(e);const s=new $r;s.image=a,s.colorSpace=bn,s.anisotropy=o?4:8,s.needsUpdate=!0,m(s),K.set(e,s),le(e,s)},void 0,()=>{re.delete(e)}))},Re=()=>{if(!J){J=!0;for(const e of fe)ne(e)}},Ue=(e,a)=>{if($.has(e)){a(L(e));return}const s=K.get(e);if(s){a(s);return}const d=I.get(e)??[];d.push(a),I.set(e,d),fe.includes(e)||(fe.push(e),J&&ne(e))},we=new X(m(new Ce(900,48,24)),m(new he({map:L("milkyway.webp"),side:lo,depthWrite:!1})));we.rotation.set(63*Wt,0,0),x.add(we),x.add(new Gr(16777215,.14));const ot=new er(16777215,1.6,0,0);ot.decay=0,x.add(ot);const O=new Le;x.add(O);const Z=new Map,ze=new Map,Ye=new Map,Ne=[],de=new Map;let mt=null,it=null;const De=new Map,ut=new Map,Lt=new Map,ue=new Map;let ie=null,sn=0,Ft=null;const rn=[],Q=[],G=[],V=[],oe=[];let ye=Date.now(),j=!0,W=null;function ce(e,a,s,d){const M=$s[s]??[.7,.7,.7,.06],A=Zs[s],N=new Y(a),D=A?.relief??0,u=m(new qe({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new zo(A?.texel?.[0]??1/1024,A?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:D*.35},gain:{value:(A?.gain??1.9)*.6},base:{value:new U(N.r,N.g,N.b)},glow:{value:new U(M[0],M[1],M[2])},atmo:{value:Math.min(M[3]*2.2,.85)},ringShadow:{value:d?1:0},ringMap:{value:null},ringInner:{value:d?.inner??1},ringOuter:{value:d?.outer??2},ringCenter:{value:new U},ringNormal:{value:new U(0,1,0)}},vertexShader:Qi,fragmentShader:ec}));return e&&Ue(e,b=>{u.uniforms.dayMap.value=b,u.uniforms.useMap.value=1,D>0&&(u.uniforms.bumpMap.value=b,u.uniforms.useBump.value=1)}),d&&Ue("saturn-ring.webp",b=>{u.uniforms.ringMap.value=b}),u}function Et(e,a,s){const d=Zs[s],M=d?.tint??$s[s]?.slice(0,3);if(!M||o)return;const A=Math.min(d?.inner??.12,.5)*.55,N=Math.min(d?.outer??.05,.2)*.9,D=new U(M[0],M[1],M[2]),u=Math.sqrt(1-1/(1.045*1.045)),b=(_,B,Me,pe)=>new X(m(new Ce(a*_,o?24:32,o?16:24)),m(new qe({uniforms:{tint:{value:D},power:{value:Me},strength:{value:pe},edge:{value:u}},vertexShader:qs,fragmentShader:Ks,side:B,transparent:!0,blending:Oe,depthWrite:!1})));e.add(b(1.045,lo,2.7,A),b(1.16,As,3.4,N))}function Mt(e,a){const s=m(new qe({uniforms:{poleN:{value:qo(80.7,-72.7,1).normalize()},poleS:{value:qo(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:rc,fragmentShader:ic,transparent:!0,blending:Oe,depthWrite:!1})),d=new X(m(new Ce(a*1.022,o?64:96,o?48:64)),s);d.renderOrder=1,e.add(d),V.push(s)}function kn(e,a){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([d,M,A,N,D],u)=>{const b=qo(d,M,1).normalize(),_=new U(0,1,0).cross(b).normalize(),B=new U().crossVectors(b,_).normalize(),Me=_.multiplyScalar(Math.cos(D)).addScaledVector(B,Math.sin(D)).normalize(),pe=[];for(let Pe=0;Pe<=16;Pe+=1){const je=Pe/16,Ze=(je-.5)*A,Ie=Math.sin(je*Math.PI)*N;pe.push(new U().copy(b).multiplyScalar(Math.cos(Ze)).addScaledVector(Me,Math.sin(Ze)).normalize().multiplyScalar(a*(.985+Ie)))}const be=m(new qe({uniforms:{uTime:{value:0},seed:{value:u*.37+.11}},vertexShader:cc,fragmentShader:lc,transparent:!0,blending:Oe,side:nt,depthWrite:!1})),$e=new X(m(new Yr(new Hr(pe),64,a*.022,8,!1)),be);$e.raycast=()=>{},e.add($e),oe.push(be)})}function Pn(e,a,s=""){const d=document.createElement("button");d.type="button",d.className="space-label"+s,d.textContent=a,d.addEventListener("click",()=>n.onPick?.(e)),v.appendChild(d),Ye.set(e,d)}const zn=m(new qe({uniforms:{map:{value:L("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),Dn=new U,sa=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],To=new Map;let Ot=null;const Ao={moon:"earth",...Object.fromEntries(Rs.map(e=>[e.id,e.parent]))};function Tn(e,a){const s=Ao[e];if(Ot===null||!s)return Bo(e,a);const d=Bo(s,a),M=Bo(e,Ot),A=Bo(s,Ot);return{x:d.x+M.x-A.x,y:d.y+M.y-A.y,z:d.z+M.z-A.z}}function _n(e){for(const[a,s]of ze){if(a==="sun")continue;const d=Tn(a,e);s.position.set(d.x*Xe,d.y*Xe,d.z*Xe)}for(const[a,s]of De){const d=Tn(a,e);s.position.set(d.x*Xe,d.y*Xe,d.z*Xe)}if(Ft){Dn.copy(Ft.holder.position);const a=Dn.length()||1;Ft.tail.visible=a/Xe<8,Dn.multiplyScalar(1/a),Ft.tail.quaternion.setFromUnitVectors(new U(0,1,0),Dn),Ft.tail.position.copy(Dn).multiplyScalar(.16*Xe)}}const An=new U(1,0,0),ra=m(new qe({uniforms:{dayMap:{value:L("earth-day.webp")},nightMap:{value:L("earth-night.webp")},normalMap:{value:L("earth-normal.webp",!1)},specMap:{value:L("earth-spec.webp",!1)},texel:{value:new zo(1/2048,1/1024)},sunDir:{value:An}},vertexShader:nc,fragmentShader:oc}));function Co(e){const a=new Le,s=new X(m(new Ce(e,o?96:128,64)),ra);s.name="earth",a.add(s);const d=new X(m(new Ce(e*1.012,80,48)),m(new Ia({map:L("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));a.add(d),mt=d;const M=new X(m(new Ce(e*1.06,64,48)),m(new qe({uniforms:{sunDir:{value:An}},vertexShader:`
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
            }`,side:lo,transparent:!0,blending:Oe,depthWrite:!1})));a.add(M);const A=new X(m(new Ce(e*1.15,o?24:32,o?16:24)),m(new qe({uniforms:{tint:{value:new U(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:qs,fragmentShader:Ks,side:As,transparent:!0,blending:Oe,depthWrite:!1})));return a.add(A),Z.set("earth",s),a}function Ro(e,a,s){for(const d of xo(e).sites??[]){const M=new X(m(new Ce(s*.018,12,8)),m(new he({color:"#3182f6"})));M.position.copy(qo(d.lat,d.lon,s*1.004)),a.add(M);const A=document.createElement("div");A.className="space-site",A.textContent=d.name,v.appendChild(A),Ne.push({mesh:M,site:d,el:A,parent:e})}}let Wn=null;for(const e of Kr){if(e.id==="moon")continue;const a=new Le;if(ze.set(e.id,a),O.add(a),e.id==="sun"){const s=.26*Xe,d=new X(m(new Ce(s,o?96:128,o?64:80)),zn);d.name="sun",de.set("sun",s),a.add(d),kn(d,s);for(const[A,N,D,u]of[[1.06,2,.95,"#ffbf78"]])a.add(new X(m(new Ce(s*A,o?32:48,o?24:32)),m(new qe({uniforms:{color:{value:new Y(u)},power:{value:N},strength:{value:D}},vertexShader:ac,fragmentShader:sc,transparent:!0,blending:Oe,depthWrite:!1}))));Z.set("sun",d);const M=new fo(m(new po({map:m(Ji()),blending:Oe,transparent:!0,depthWrite:!1,depthTest:!0,color:new Y("#ffd9a0")})));M.scale.setScalar(s*3.6),a.add(M),it=M}else{const s=ka(e.id).radius*Xe;de.set(e.id,s);let d;if(e.id==="earth"){const D=Co(s);D.rotation.z=-e.tilt*Wt,a.add(D),Wn=D,d=D.children[0]}else{const D=e.id==="saturn"?{inner:s*1.18,outer:s*2.08}:void 0;d=new X(m(new Ce(s,o?96:128,64)),ce(e.texture,e.color,e.id,D)),d.name=e.id,d.rotation.z=-e.tilt*Wt,a.add(d),Z.set(e.id,d),Et(a,s,e.id),e.id==="jupiter"&&Mt(d,s)}if(e.axes){const[D,u,b]=e.axes;d.scale.set(1,b/D,u/D)}if(e.ring&&e.axes){const D=e.axes[0]/2,u=s*(e.ring.radius-e.ring.width/2)/D,b=s*(e.ring.radius+e.ring.width/2)/D,_=new X(m(new yt(u,Math.max(b,u*1.03),128,1)),m(new he({color:"#8b8580",side:nt,transparent:!0,opacity:.75,depthWrite:!1})));_.rotation.x=Math.PI/2,a.add(_)}if(e.id==="saturn"){const D=s*1.18,u=s*2.08,b=new yt(D,u,160,1),_=m(new qe({uniforms:{ringMap:{value:null},innerRatio:{value:D/u},planetRadius:{value:s},planetCenter:{value:new U}},vertexShader:uc,fragmentShader:fc,side:nt,transparent:!0,depthWrite:!1}));Ue("saturn-ring.webp",Me=>{_.uniforms.ringMap.value=Me});const B=new X(m(b),_);B.rotation.x=Math.PI/2,d.add(B),Q.push({mesh:B,parent:e.id}),G.push({mesh:d,material:d.material})}e.sites&&Ro(e.id,d,s);const M=Es(e.id,.022),A=m(new Kt);A.setAttribute("position",new Sa(M.positions,3)),A.setIndex(M.index),A.scale(Xe,Xe,Xe);const N=new X(A,m(new he({color:ka(e.id).ribbon,transparent:!0,opacity:.5,side:nt,depthWrite:!1})));rn.push(N),O.add(N)}Pn(e.id,e.name,e.id==="sun"?"":" is-planet")}const f=[];function p(e,a,s){let d=e==="main"?1234:98765;const M=()=>(d=d*16807%2147483647,(d-1)/2147483646),A=m(new Mn(1,0)),N=new Float32Array(a*4),D=new Float32Array(a*4);for(let _=0;_<a;_+=1){let B;if(e==="main")do B=2.1+M()*1.2;while((Math.abs(B-2.5)<.03||Math.abs(B-2.82)<.03||Math.abs(B-2.95)<.02)&&M()<.85);else B=M()<.18?39.2+(M()-.5)*1.2:42+(M()-.5)*6.5;N[_*4]=B,N[_*4+1]=M()*Math.PI*2,N[_*4+2]=M()*(e==="main"?.18:.12),N[_*4+3]=M()*Math.PI*2,D[_*4]=(M()-.5)*(e==="main"?.32:.5),D[_*4+1]=M()*Math.PI*2;const Me=M()**3;D[_*4+2]=(e==="main"?.0035:.009)*(.7+Me*2.4),D[_*4+3]=M()}A.setAttribute("orbit",new Cs(N,4)),A.setAttribute("shape",new Cs(D,4));const u=m(new qe({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new Y(s)},uScale:{value:Xe}},vertexShader:pc,fragmentShader:mc})),b=new oa(A,u,a);b.frustumCulled=!1,b.raycast=()=>{},O.add(b),f.push({mesh:b,material:u})}p("main",o?1800:4200,"#9c9184"),p("kuiper",o?1500:3600,"#7f8b9c");for(const e of Rs){const a=new Le,s=new X(m(new Ce(e.radius*Xe,32,24)),ce(`${e.id}.webp`,e.color,e.id));s.name=e.id,a.add(s),O.add(a),De.set(e.id,a),ut.set(e.id,s);const d=document.createElement("button");d.type="button",d.className="space-label is-small",d.textContent=e.name,d.addEventListener("click",()=>n.onExtra?.(e.id)),v.appendChild(d),Lt.set(e.id,{el:d,parent:e.parent})}{const e=new Le,a=new X(m(new Ce(.045*Xe,20,16)),m(new he({color:"#f7fbff"})));a.name="halley",e.add(a);const s=new X(m(new Fa(.04*Xe,.32*Xe,12)),m(new he({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(s),Ft={holder:e,tail:s},O.add(e),De.set("halley",e),ut.set("halley",a);const d=Es("halley",.022),M=m(new Kt);M.setAttribute("position",new Sa(d.positions,3)),M.setIndex(d.index),M.scale(Xe,Xe,Xe);const A=new X(M,m(new he({color:ka("halley").ribbon,transparent:!0,opacity:.35,side:nt,depthWrite:!1})));rn.push(A),O.add(A);const N=document.createElement("button");N.type="button",N.className="space-label is-small",N.textContent=q("핼리 혜성"),N.addEventListener("click",()=>n.onExtra?.("halley")),v.appendChild(N),Lt.set("halley",{el:N,parent:null})}for(const e of Jr){const a=Qr(e),s=a.points.map(Me=>new U(Me.x*Xe,Me.y*Xe,Me.z*Xe)),d=m(new Kt().setFromPoints(s)),M=new Vr(d,m(new Po({color:e.color,transparent:!0,opacity:.95})));M.visible=!1;const A=new Le,N=new X(m(new Ko(.03,.01,.01,20)),m(new he({color:"#d8dde4"})));N.rotation.x=Math.PI/2;const D=new X(m(new Ce(.014,12,8)),m(new he({color:"#c9ced6"})));D.position.z=-.02;const u=new X(m(new Ko(.002,.002,.09,6)),m(new he({color:"#aab3c0"})));u.rotation.z=Math.PI/2,u.position.z=-.02;const b=new X(m(new Ce(.035,16,12)),m(new he({color:e.color,transparent:!0,opacity:.18,blending:Oe,depthWrite:!1})));A.add(N,D,u,b),A.scale.setScalar(e.frame==="earth"?.8:1.3),A.position.copy(s[s.length-1]),M.add(A),(e.frame==="earth"?ze.get("earth")??O:O).add(M);const B=document.createElement("div");B.className="space-site is-probe",B.textContent=e.name,v.appendChild(B),ue.set(e.id,{line:M,probe:A,el:B,points:s,times:a.points.map(Me=>Me.t),marks:a.marks,frame:e.frame})}if(_n(ye),Wn){const e=.055*Xe;de.set("moon",e);const a=new X(m(new Ce(e,r,48)),ce("moon.webp","#b8b8b8","moon"));a.name="moon";const s=new Le;s.add(a),O.add(s),Z.set("moon",a),ze.set("moon",s),Ro("moon",a,e),Pn("moon",q("달")," is-small"),_n(ye)}const T=new Le,g=new Le,h=new Le;T.add(g,h),T.visible=!1;let te="solar",E=!1,ae=0;const R={moon:new X,moonMat:m(new he({color:"#ffffff"})),shadow:m(new he({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new X,umbra:new X,skyCover:new X,skySun:new Le,skyMoon:new Le,skyMoonMat:m(new he({color:"#ffffff"}))},Ke=[],vt=L("sun.webp"),wt=L("moon.webp"),xt=new X(m(new Ce(.62,32,24)),m(new he({map:vt})));xt.position.set(-3.3,0,0);const Cn=new X(m(new Ce(.4,32,24)),m(new he({map:L("earth-day.webp")})));Cn.position.set(1.85,0,0),R.moonMat.map=wt,R.moon=new X(m(new Ce(.14,24,18)),R.moonMat),R.cone=new X(m(new Ko(.04,.16,.78,18)),R.shadow),R.cone.position.set(1.42,0,0),R.cone.rotation.z=Math.PI/2,R.umbra=new X(m(new wo(.3,28)),m(new he({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),R.umbra.position.set(2.75,0,.02),g.add(xt,Cn,R.moon,R.cone,R.umbra);for(const[e,a]of[[q("태양"),new U(-3.3,.85,0)],[q("지구"),new U(1.85,.68,0)]]){const s=document.createElement("div");s.className="space-site",s.textContent=e,v.appendChild(s),Ke.push({el:s,at:a,group:g})}const cn=new X(m(new wo(1.35,48)),m(new he({map:vt}))),ln=new X(m(new yt(1.4,1.7,48)),m(new he({color:"#f0c36a",transparent:!0,opacity:.45,side:nt,depthWrite:!1})));R.skyCover=new X(m(new wo(1.22,48)),m(new he({color:"#141820"}))),R.skySun.add(cn,ln,R.skyCover),R.skyMoonMat.map=wt;const It=new X(m(new wo(.92,48)),R.skyMoonMat),un=new X(m(new wo(1.08,48)),m(new he({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));un.position.z=.16,R.skyMoon.add(It,un),h.add(R.skySun,R.skyMoon);const st=document.createElement("div");st.className="space-site is-stage",v.appendChild(st),Ke.push({el:st,at:new U(0,-1.2,0),group:g}),h.visible=!1,x.add(T);const Ut=new Le;Ut.visible=!1,Ut.rotation.z=-Math.PI/2;const Yt=[],fn=4.6,pn=e=>fn*e/696e3,se=new X(m(new Ce(fn,64,40)),m(new he({map:L("sun.webp")})));se.position.set(-3.2,0,0),Ut.add(se);const xe=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let Fe=2.4;const Be=(e,a)=>{const s=document.createElement("div");s.className="space-site",s.textContent=e,v.appendChild(s),Yt.push({el:s,at:a,group:Ut})};Be(q("태양"),new U(-3.2,4.9,0));for(const[e,a]of xe){const s=pn(a),d=Fe+s;Fe=d+s+.72;const M=xo(e),A=e==="earth"?"earth-day.webp":M.texture,N=m(new he({color:M.color}));A&&Ue(A,u=>{N.map=u,N.color.set("#ffffff"),N.needsUpdate=!0});const D=new X(m(new Ce(s,32,24)),N);if(D.position.set(d,0,0),M.axes&&D.scale.set(1,M.axes[2]/M.axes[0],M.axes[1]/M.axes[0]),Ut.add(D),e==="saturn"){const u=s*1.18,b=s*2.08,_=m(new yt(u,b,96,1)),B=_.attributes.position,Me=_.attributes.uv,pe=new U;for(let Pe=0;Pe<B.count;Pe+=1)pe.fromBufferAttribute(B,Pe),Me.setXY(Pe,(pe.length()-u)/(b-u),.5);const be=m(new he({color:"#b9b3ab",transparent:!0,opacity:.9,side:nt,depthWrite:!1}));Ue("saturn-ring.webp",Pe=>{be.map=Pe,be.color.set("#ffffff"),be.needsUpdate=!0});const $e=new X(_,be);$e.rotation.y=Math.PI/2-.36,D.add($e)}Be(M.name,new U(d,(e==="saturn"?s*2.08:s)+.12,0))}x.add(Ut);const Se=new Le;Se.visible=!1;const ke=[],at=[],Je=new X(m(new Ce(.55,48,32)),m(new he({color:"#e0703a"})));Se.add(Je);for(const[e,a]of[[1.35,.16],[2.1,.05]])Se.add(new X(m(new Ce(.55*e,32,24)),m(new he({color:"#ff6a30",transparent:!0,opacity:a,side:lo,blending:Oe,depthWrite:!1}))));const Qe=new X(m(new yt(2.6,5.1,96,1)),m(new he({color:"#3fbf7f",transparent:!0,opacity:.12,side:nt,depthWrite:!1})));Qe.rotation.x=Math.PI/2,Se.add(Qe),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,a,s,d,M],A)=>{const N=new Ts(m(new Kt().setFromPoints(Array.from({length:128},(b,_)=>new U(Math.cos(_/128*Math.PI*2)*s*100,0,Math.sin(_/128*Math.PI*2)*s*100)))),m(new Po({color:"#8b95a1",transparent:!0,opacity:.35})));Se.add(N);const D=new X(m(new Ce(.16*d,24,16)),ce(void 0,M,"earth"));Se.add(D);const u=document.createElement("button");u.type="button",u.className="space-label is-small",u.textContent=e,u.addEventListener("click",()=>n.onExtra?.(`trappist-${e}`)),v.appendChild(u),ke.push({mesh:D,a:s*100,period:a,phase0:A*1.7,el:u})});const ct=new Ts(m(new Kt().setFromPoints(Array.from({length:256},(e,a)=>new U(Math.cos(a/256*Math.PI*2)*38.7,0,Math.sin(a/256*Math.PI*2)*38.7)))),m(new Po({color:"#c5b8a2",transparent:!0,opacity:.5})));Se.add(ct);for(const[e,a]of[["TRAPPIST-1",new U(0,1.1,0)],[q("생명가능지대(대략)"),new U(3.9,0,0)],[q("비교: 우리 수성의 궤도"),new U(0,0,38.7)]]){const s=document.createElement("div");s.className="space-site",s.textContent=e,v.appendChild(s),at.push({el:s,at:a})}x.add(Se);const gt=ai(m),mn=gt.labels.map(({name:e,at:a})=>{const s=document.createElement("div");return s.className="space-site",s.textContent=e,v.appendChild(s),{el:s,at:a}});x.add(gt.group);const et=ri(),Ht=[];if(et)for(const[e,a]of Object.entries(et.groups)){x.add(a);for(const s of et.markers[e]){const d=document.createElement("button");d.type="button",d.className="space-label",d.textContent=s.name,d.addEventListener("click",()=>{n.onMarker?.(s),Ge.target.copy(s.position),Ge.radius=Kn[e]*(s.id==="cmb"?1.4:e==="group"?.6:.42)}),v.appendChild(d),Ht.push({level:e,marker:s,el:d})}}const dn=[];if(et){const a=(A,N)=>new U(Math.cos(N*Wt)*Math.cos(A*Wt),Math.sin(N*Wt),-Math.cos(N*Wt)*Math.sin(A*Wt)).multiplyScalar(140),s=[];for(const A of Object.values(Ns))for(const N of A)for(let D=0;D<N.length-1;D+=1){const u=a(N[D][0],N[D][1]),b=a(N[D+1][0],N[D+1][1]);s.push(u.x,u.y,u.z,b.x,b.y,b.z)}const d=m(new Kt);d.setAttribute("position",new Sa(s,3));const M=new Js(d,m(new Po({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));et.groups.stars.add(M);for(const A of ei){if(!Ns[A.id])continue;const N=document.createElement("button");N.type="button",N.className="space-label is-const",N.textContent=A.name.replace(/\(.*\)/,"").split(" · ")[0],N.addEventListener("click",()=>n.onConstellation?.(A.id)),v.appendChild(N),dn.push({el:N,at:a(A.center[0],A.center[1])})}}const hn=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let Te="system",qn=!1,Va=!1;const Kn={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},Jn=new U,_e={theta:.6,phi:.95,radius:34},Ge={target:new U,radius:_e.radius};let lt="system",bt=null,Gt=null,$t=null;function Eo(e){if((e==="system"||e==="sizes")&&Re(),Te=e,qn=!1,O.visible=e==="system",T.visible=e==="eclipse",Ut.visible=e==="sizes",Se.visible=e==="exo",gt.group.visible=e==="blackhole",et)for(const[a,s]of Object.entries(et.groups))s.visible=a===e;lt="system",bt=null,Gt=null,$t=null,Ge.target.set(0,0,0),Ge.radius=Kn[e],e!=="system"&&(_e.phi=1.1),e==="eclipse"&&(g.rotation.z=l.aspect<1?-Math.PI/2:0,_e.theta=0,_e.phi=E?Math.PI/2:1.25,Ge.target.set(0,0,0),E||Ge.target.set(-.7,0,0).applyEuler(g.rotation),Ge.radius=E?6:l.aspect<1?10:7.5),e==="exo"&&(_e.phi=.75),e==="blackhole"&&(_e.phi=1.42),e==="sizes"&&(_e.theta=0,_e.phi=Math.PI/2,Ge.target.set(.6,-6.8,0),Ge.radius=19)}function ia(e){if(e!=="earth"&&Re(),qn=!1,Te!=="system"&&(Te="system",O.visible=!0,T.visible=!1,Ut.visible=!1,Se.visible=!1,gt.group.visible=!1,et))for(const s of Object.values(et.groups))s.visible=!1;if(lt=e,Gt=null,$t=null,e==="system"){bt=null,Ge.target.set(0,0,0),Ge.radius=Kn.system;return}bt=ze.get(e)??null;const a=de.get(e)??tc(xo(e).km);Ge.radius=e==="sun"?3.2:e==="jupiter"?3.4*Xe:e==="saturn"?2.6*Xe:Math.max(a*(xo(e).ring?6:4.2),.25)}function rr(e){const a=De.get(e);a&&(Te!=="system"&&Eo("system"),lt="system",bt=a,Gt=null,$t=null,Ge.radius=e==="halley"?1.6:.6,an=performance.now())}function ir(e){$t=(e?Ne.find(s=>s.parent===lt&&s.site.name===e.name):void 0)?.mesh??null,Gt=$t?new U:null,an=performance.now()}let z=null,We=0,St=-.12;const ca=62,Ba=18,Oa=85;let Rn=ca,Qn=0,Ln=0,eo=0,ja=0,Xa=null,la=null,He=null,Ee="idle",ft=0,En=0,No=-1,pt=0,Un=0,kt=0,Pt=0,Nn=0,Fo=!1,ho=!1;const ua=3.6,Io=2,cr=430;let Do=0,en=0,Gn=0,vo=0,Ya=0,Ha=0;const to=3.4,$a=6.6,_o=2.8,Za=4.6,Vn=620;let ve=0,ge=0,no=0,dt=0,zt=0,Tt=0,Bn=0,Zt=!0,vn=!1,fa=0,Vt=!0,go=9.81,On="first",qa="office";const lr=4.6,Ka=1.8,Ja=16;let oo=lr,yo=0,tn=Math.PI,jn=0,Mo=0,ao=0,so=Number.NaN,nn=null,Xn=0,Yn=0,pa=new Y("#000000"),Wo=0;const ur=new Y("#5a1206");let Lo=0,ma=0,da=-24,ha=120;const jt=new Set;function fr(){if(we.visible=!0,O.visible=Te==="system",T.visible=Te==="eclipse",Ut.visible=Te==="sizes",Se.visible=Te==="exo",gt.group.visible=Te==="blackhole",et)for(const[e,a]of Object.entries(et.groups))a.visible=e===Te}function Qa(e,a){z&&(x.remove(z.group),z.dispose(),z=null),rs();const s=ni(e);Xa=e,la=s,z=Ii(s,{low:o,anisotropy:y,onLand:d=>n.onSurfaceDrop?.({id:e,seconds:d.seconds,bounces:d.bounces,outcome:d.outcome}),onImpact:mr}),x.add(z.group),pa=new Y(s.fog),Wo=s.fogDensity,x.fog=new Zr(pa.clone(),Wo),We=(s.companion?s.companionAz:s.sunAz)*Wt,St=-.12,tn=Math.PI-We,jn=0,Mo=0,ao=0,Oo(),Rn=ca,ve=z.standX,ge=z.standZ,no=0,dt=0,zt=0,Tt=0,Bn=0,Zt=!0,vn=!1,fa=0,Vt=z.walkable,go=Math.max(0,s.gravityMps2),Lo=0,ma=0,da=s.terrain==="ring"?-24:-1,ha=s.terrain==="ring"?110:240,Ln=0,eo=Math.max(.6,a),ja=s.cloudTop!==null?260:150,yo=0,so=Number.NaN,en=0,Gn=0,vo=0,z.avatar.setSkin(qa),z.avatar.setVisible(On==="third"),ss(),an=performance.now()}function es(e){if(!z){if(we.visible=!1,O.visible=!1,T.visible=!1,Ut.visible=!1,Se.visible=!1,gt.group.visible=!1,et)for(const a of Object.values(et.groups))a.visible=!1;v.style.display="none",ie=null,Ot=null,j=!0,l.fov=62,l.near=.08,l.far=6e3,l.updateProjectionMatrix()}Qa(e,1.9)}function pr(e){if(!z){es(e);return}Qa(e,1.1)}function ts(){z&&(Oo(),rs(),x.remove(z.group),z.dispose(),z=null,x.fog=null,c.toneMappingExposure=1.1,v.style.display="",fr(),l.fov=45,l.near=.01,l.far=2e3,l.updateProjectionMatrix(),Jn.copy(Ge.target),_e.radius=Ge.radius,an=performance.now())}function va(){if(!z)return;const e=4.2+Math.random()*1.4,a=(Math.random()-.5)*1.8,s=ve-z.standX+Math.sin(We)*e+Math.cos(We)*a,d=ge-z.standZ-Math.cos(We)*e+Math.sin(We)*a;z.drop(s,d)}function mr(){if(n.onSurfaceImpact?.(),!z)return;const e=Math.sin(We),a=-Math.cos(We),s=Math.hypot(ve-Ya,ge-Ha);if(s<46){const d=Math.max(.35,1-s/46);Xn-=e*(3.4+d*5.2),Yn-=a*(3.4+d*5.2),vo=2.8+d*.9,en=1,Gn=1,ns(180)}else Xn-=e*8.2,Yn-=a*8.2;Vt?Zt&&(dt=Math.max(dt,2.8),Zt=!1):dt+=1.8}function dr(){if(!z)return;const e=22+Math.random()*8,a=(Math.random()-.5)*5,s=Math.sin(We),d=-Math.cos(We),M=ve+s*e+Math.cos(We)*a,A=ge+d*e+Math.sin(We)*a;Ya=M,Ha=A,z.impact.strike(M,A,s,d),oi()}function gn(){n.onSurfaceRocket?.({phase:Ee,count:En,altitude:pt})}function ns(e){try{const a=navigator;typeof a.vibrate=="function"&&a.vibrate(e)}catch{}}function os(){let e=ve+Math.sin(We)*20,a=ge-Math.cos(We)*20,s=1/0;const d=(M,A)=>{if(!z)return 0;let N=1/0,D=-1/0;for(let u=0;u<12;u+=1){const b=u/12*Math.PI*2;for(const _ of[0,3.5,7]){const B=z.walkable?z.meshHeightAt(M+Math.cos(b)*_,A+Math.sin(b)*_):z.floorAt(M,A);N=Math.min(N,B),D=Math.max(D,B)}}return D-N};for(const M of[-.55,-.28,0,.28,.55])for(const A of[20,24,28]){const N=We+M,D=ve+Math.sin(N)*A,u=ge-Math.cos(N)*A,b=Math.hypot(D,u)>Vn-40?6:0,_=z?Math.abs((z.walkable?z.meshHeightAt(D,u):z.floorAt(D,u))-z.meshHeightAt(ve,ge)):0,B=d(D,u)*2.5+_*1.2+b+Math.abs(M)*.6;B<s&&(s=B,e=D,a=u)}return{x:e,z:a}}function as(e,a){if(!(!He||!z)){if(kt=e,Pt=a,z.walkable){let s=z.meshHeightAt(e,a);for(let d=0;d<12;d+=1){const M=d/12*Math.PI*2;s=Math.max(s,z.meshHeightAt(e+Math.cos(M)*3.5,a+Math.sin(M)*3.5)),s=Math.max(s,z.meshHeightAt(e+Math.cos(M)*7,a+Math.sin(M)*7))}Nn=s}else Nn=z.floorAt(e,a);He.setBase(e,a,Nn),He.setFacing(Math.atan2(-(ge-a),ve-e)),He.setLift(0),He.setThrottle(0),He.setClamps(0),He.setPadVisible(!0)}}function ss(){He||Fo||!z||!la||(Fo=!0,Yi(c,la).then(e=>{if(Fo=!1,!z){e.dispose();return}He=e,z.group.add(e.group);const a=os();as(a.x,a.z),ho&&(ho=!1,is())}).catch(()=>{Fo=!1,ho=!1}))}function rs(){La(),He&&(He.group.parent?.remove(He.group),He.dispose(),He=null),Ee="idle",En=0,pt=0,Un=0,ft=0,ho=!1}function is(){if(!(!z||Ee!=="idle")){if(Hi(),Oo(),vn=!1,!He){ho=!0,ss();return}if(Math.hypot(ve-kt,ge-Pt)>34){const e=os();as(e.x,e.z),He.setLift(95),Ee="land"}else Ee="run";ft=0,pt=0,Un=0,En=0,ao=0,gn()}}function hr(e){return e==="sun"||e==="mercury"||e==="venus"||e==="earth"||e==="moon"||e==="mars"||e==="jupiter"||e==="saturn"||e==="uranus"||e==="neptune"||e==="pluto"||e==="eris"||e==="haumea"||e==="makemake"?e:e==="io"||e==="europa"||e==="ganymede"||e==="callisto"?"jupiter":e==="titan"||e==="enceladus"||e==="saturn-ring"?"saturn":e==="charon"?"pluto":"system"}function vr(e){if(!(!z||!He||Ee==="idle")){if(ft+=e,Ee==="land"){const a=Math.min(1,ft/1.9),s=1-Math.pow(1-a,3);He.setLift(95*(1-s)),a>=1&&(He.setLift(0),Ee="run",ft=0,gn());return}if(Ee==="run"){(Math.hypot(kt-ve,Pt-ge)<6.4||ft>16)&&(Ee="board",ft=0,gn());return}if(Ee==="board"){const a=Math.min(1,e*3.6);ve+=(kt-ve)*a,ge+=(Pt-ge)*a,ft>1.25&&(Ee="count",ft=0,En=3,Zi(Io,10.5+ua,Math.max(0,go)),gn());return}if(Ee==="count"){const a=Math.max(0,Math.ceil(3-ft));a!==En&&(En=a,$i(En===0),gn());const s=Math.max(0,Math.min(1,(ft-Io)/.9));He.setThrottle(s),He.setClamps(Math.max(0,Math.min(1,(ft-Io-.15)/.7))),s>0&&ft-e<=Io&&(ns(90),Do=1),ft>=ua&&(Ee="lift",ft=0,Un=0,gn());return}if(Ee==="lift"){const s=12.5/(1+Math.max(0,go)*.075)*(.55+Math.min(.45,ft*.35));Un+=s*e,pt+=Un*e,He.setLift(pt),He.setThrottle(1),z.atmosphere(Math.min(.72,pt/640));const d=Math.round(pt);d!==No&&(No=d,gn()),pt>26&&He.setPadVisible(!1),pt>cr&&(Ee="escape",ft=0,gn());return}if(Ee==="escape"){const a=Math.min(1,ft/2.6);Un+=40*e,pt+=Un*e,He.setLift(pt),z.atmosphere(Math.max(.72,.72+a*.28));const s=Math.round(pt);s!==No&&(No=s,gn());const d=x.fog;if(d&&(d.density=Wo*(1-a)),a>=1){const M=Xa;La(),Ee="idle",ts(),ia(hr(M)),n.onSurfaceEscape?.()}}}}function gr(e,a){if(!z||!He)return;const s=Nn+ea;if(Ee==="board"||Ee==="count"){const M=Ee==="count"?Math.min(1,ft/ua):0,A=Math.atan2(kt-ve,Pt-ge)+1.05,N=34-M*8,D=kt+Math.sin(A)*N,u=Pt+Math.cos(A)*N;let b=Nn+6.4+M*2.2;z.solidFloor&&(b=Math.max(b,z.meshHeightAt(D,u)+2.2)),l.position.set(D,b,u),l.fov=58+M*10,l.updateProjectionMatrix(),l.lookAt(kt,s+16+M*26,Pt)}else if(Ee==="run"){const M=z.walkable?z.meshHeightAt(ve,ge):z.floorAt(ve,ge),A=Math.atan2(kt-ve,Pt-ge)+.85,N=26+Math.min(16,Math.hypot(kt-ve,Pt-ge)*.3),D=kt+Math.sin(A)*N,u=Pt+Math.cos(A)*N;let b=Nn+5.5;z.solidFloor&&(b=Math.max(b,z.meshHeightAt(D,u)+1.6)),l.position.set(D,b,u),l.fov=66,l.updateProjectionMatrix(),l.lookAt(ve,M+1.1,ge)}else{const M=Math.min(1,pt/70),A=Math.atan2(kt-ve,Pt-ge)+1.05,N=34+M*(24+Math.min(170,pt*.3)),D=kt+Math.sin(A)*N,u=Pt+Math.cos(A)*N;let b=Nn+6.4+M*(6+pt*.3);z.solidFloor&&(b=Math.max(b,z.meshHeightAt(D,u)+2.2)),l.position.set(D,b,u),l.fov=62+M*12,l.updateProjectionMatrix(),l.lookAt(kt,s+42+pt*.55,Pt)}Do=Math.max(0,Do-a*1.4);const d=Do*.5+(Ee==="lift"||Ee==="escape"?Math.max(0,.22-pt*6e-4):0);d>.002&&(l.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*d*.9,l.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*d*.9,l.rotateZ(Math.sin(e*31.4)*d*.03))}function yr(e){On=e,e==="third"&&St<-.32&&(St=-.16),so=Number.NaN,St=Math.min(.6,Math.max(-1.05,St)),z&&z.avatar.setVisible(e==="third"),an=performance.now()}function Mr(e){qa=e,z&&z.avatar.setSkin(e)}function wr(e){if(!z)return;if(Ln<eo){vn=!1;return}const a=(jt.has("w")||jt.has("arrowup")?1:0)-(jt.has("s")||jt.has("arrowdown")?1:0),s=(jt.has("d")||jt.has("arrowright")?1:0)-(jt.has("a")||jt.has("arrowleft")?1:0);let d=Lo+a,M=ma+s;if(en>.4&&(d=0,M=0,vn=!1),Ee!=="idle"){const Me=(Math.atan2(kt-ve,-(Pt-ge))-We+Math.PI*3)%(Math.PI*2)-Math.PI;We+=Me*Math.min(1,e*6),d=Ee==="run"||Ee==="board"?1:0,M=0}const A=Math.hypot(d,M);A>1&&(d/=A,M/=A);const N=Math.sin(We),D=-Math.cos(We),u=Math.cos(We),b=Math.sin(We),_=Math.min(1,e*(Vt?9:2.4));if(Vt){const B=Math.min(1,A),Me=Math.min(1,Math.max(0,(B-.7)/.3));Mo+=(Me-Mo)*Math.min(1,e*6);const pe=to+($a-to)*Mo,be=(N*d+u*M)*pe,$e=(D*d+b*M)*pe,Pe=Math.min(1,e*(B>.02?8.5:5.2));zt+=(be-zt)*Pe,Tt+=($e-Tt)*Pe,ve+=(zt+Xn)*e,ge+=(Tt+Yn)*e,Xn*=Math.exp(-e*3.1),Yn*=Math.exp(-e*3.1);const je=z.walk(ve,ge);if(je.x!==ve||je.z!==ge){const Ct=je.x-ve,Dt=je.z-ge,ht=Math.hypot(Ct,Dt);if(ve=je.x,ge=je.z,ht>1e-4){const tt=Ct/ht,_t=Dt/ht,Rt=zt*tt+Tt*_t;Rt<0&&(zt-=tt*Rt,Tt-=_t*Rt)}}const Ze=je.rise;jn+=(Ze-jn)*Math.min(1,e*(Ze>jn?16:9));const Ie=Math.hypot(ve,ge);if(Ie>Vn){const Ct=ve/Ie,Dt=ge/Ie;ve=Ct*Vn,ge=Dt*Vn;const ht=zt*Ct+Tt*Dt;ht>0&&(zt-=ht*Ct,Tt-=ht*Dt)}const rt=Math.hypot(zt,Tt);fa+=e*(Zt?.8+rt*1.7:.8),vn&&Zt&&go>.01&&(dt=Za,Zt=!1),Zt||(dt-=go*e,no+=dt*e,no<=0&&(no=0,yo=Math.min(1,Math.abs(dt)/Za),dt=0,Zt=!0))}else{const B=Math.cos(St),Me=(Math.sin(We)*B*d+u*M)*_o,pe=Math.sin(St)*d*_o,be=(-Math.cos(We)*B*d+b*M)*_o;zt+=(Me-zt)*_,Tt+=(be-Tt)*_,dt+=(pe-dt)*_,vn&&(dt+=1.8),ve+=(zt+Xn)*e,ge+=(Tt+Yn)*e,Xn*=Math.exp(-e*3.1),Yn*=Math.exp(-e*3.1),Bn+=dt*e;const $e=Math.hypot(ve,ge);if($e>Vn){const Pe=ve/$e,je=ge/$e;ve=Pe*Vn,ge=je*Vn;const Ze=zt*Pe+Tt*je;Ze>0&&(zt-=Ze*Pe,Tt-=Ze*je)}Bn<da&&(Bn=da,dt<0&&(dt=0)),Bn>ha&&(Bn=ha,dt>0&&(dt=0))}vn=!1}function xr(e,a){if(!z)return;if(z.update(e,a),Ln<eo){Ln=Math.min(eo,Ln+a);const pe=Ln/eo,be=1-Math.pow(1-pe,3);Qn=ja*(1-be),St=-.12-.38*(1-be)}else Qn!==0&&(Qn=0,On==="third"&&(St=-.16));if(wr(a),vr(a),!z)return;yo=Math.max(0,yo-a*3.4),l.fov!==Rn&&(l.fov=Rn,l.updateProjectionMatrix());const s=On==="third",d=s||Ee==="run";Vt&&!Zt&&(jn+=(0-jn)*Math.min(1,a*4));const M=Vt?jn:0,A=Vt?z.eyeY+z.meshHeightAt(ve,ge)+M+no:z.eyeY+Bn,N=A-z.eyeHeight+Qn,D=Math.hypot(zt,Tt);D>.25&&(tn=Math.atan2(zt,Tt)),ao=Math.max(0,ao-a);const u=Lo>.25||jt.has("w")||jt.has("arrowup");if(s&&u&&ao<=0&&D>to*.8){const be=(Math.PI-tn-We+Math.PI*3)%(Math.PI*2)-Math.PI;We+=be*Math.min(1,a*.8)}if(vo>0?(vo-=a,vo<=0&&(en=0)):en>0&&(en=0),en<=0&&Gn>0&&(Gn=Math.max(0,Gn-a*.4)),z.avatar.setDown(en),z.avatar.setBurn(Gn),z.avatar.setVisible(d&&(Ee==="idle"||Ee==="run")),d){const pe=z.normalAt(ve,ge),be=Math.sin(tn),$e=Math.cos(tn),Pe=Math.cos(tn),je=-Math.sin(tn),Ze=-Math.asin(Math.max(-1,Math.min(1,pe.x*be+pe.z*$e))),Ie=-Math.asin(Math.max(-1,Math.min(1,pe.x*Pe+pe.z*je)));z.avatar.update(e,a,{x:ve,z:ge,feetY:N,facing:tn,speed:D,maxSpeed:Vt?to+($a-to)*Mo:_o,grounded:Vt&&Zt,floating:!Vt,vy:dt,landing:yo,shadowY:z.solidFloor?z.meshHeightAt(ve,ge):null,shockT:z.impact.sinceImpact(),slopePitch:Vt?Math.max(-.26,Math.min(.26,Ze)):0,slopeRoll:Vt?Math.max(-.26,Math.min(.26,Ie)):0,groundNormal:{x:pe.x,y:pe.y,z:pe.z}})}if(s){const pe=Number.isNaN(so)?N+1.34:so;so=pe+(N+1.34-pe)*Math.min(1,a*3.2);const be=so,$e=Math.cos(St),Pe=Math.sin(We)*$e,je=Math.sin(St),Ze=-Math.cos(We)*$e;let Ie=oo,rt=ve-Pe*Ie,Ct=be-je*Ie,Dt=ge-Ze*Ie;if(z.solidFloor){const ht=z.meshHeightAt,tt=(_t,Rt)=>Math.max(ht(_t,Rt),ht(_t+.6,Rt),ht(_t-.6,Rt),ht(_t,Rt+.6),ht(_t,Rt-.6));for(let _t=0;_t<7;_t+=1){rt=ve-Pe*Ie,Dt=ge-Ze*Ie,Ct=be-je*Ie;const Rt=tt(rt,Dt)+.85;if(Ct>=Rt)break;if(Rt-Ct<=2.4){Ct=Rt;break}if(Ie<=1.8){Ct=Rt;break}Ie=Math.max(1.8,Ie*.8)}}l.position.set(rt,Ct,Dt),en>.25?l.lookAt(ve-Math.sin(tn)*.85,N+.35,ge-Math.cos(tn)*.85):l.lookAt(ve,be,ge)}else{const pe=Math.min(1,D/to),be=Vt?Zt?Math.sin(fa*2)*.035*pe:0:Math.sin(e*.5)*.25,$e=A+Qn+be;l.position.set(ve,$e,ge);const Pe=Math.cos(St);l.lookAt(ve+Math.sin(We)*Pe,$e+Math.sin(St),ge-Math.cos(We)*Pe)}nn?(l.position.set(nn.pos[0],nn.pos[1],nn.pos[2]),l.lookAt(nn.look[0],nn.look[1],nn.look[2]),l.fov!==nn.fov&&(l.fov=nn.fov,l.updateProjectionMatrix())):Ee!=="idle"&&gr(e,a);const b=z.impact.shake();if(b>.002){const pe=b;l.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*pe*.6,l.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*pe*.6,l.position.z+=(Math.sin(e*41.9+2.1)+Math.sin(e*25.6)*.5)*pe*.45,l.rotateZ((Math.sin(e*35.2)*.6+Math.sin(e*21.7+1.1)*.4)*pe*.05)}const _=z.impact.flash();c.toneMappingExposure=1.1+_*5.4;const B=z.impact.doom(),Me=x.fog;if(Me){Me.color.copy(pa).lerp(ur,B*.82);const pe=Ee==="lift"||Ee==="escape"?Math.max(.06,1-Math.min(.94,pt/520)):1;Me.density=Wo*(1+B*2.4)*pe}c.render(x,l)}const At=new Map,ga=new Map;let on=0,Fn=0,Uo=!1,an=0;const cs=new Qs,ls=new zo,us=e=>{if(ga.set(e.pointerId,{x:e.clientX,y:e.clientY}),z){if(i.setPointerCapture(e.pointerId),At.set(e.pointerId,{x:e.clientX,y:e.clientY}),At.size>=2){const[a,s]=[...At.values()];on=Math.hypot(a.x-s.x,a.y-s.y),Uo=!0,Fn+=100}else Uo=!1,Fn=0;return}if(Re(),i.setPointerCapture(e.pointerId),qn=!1,At.set(e.pointerId,{x:e.clientX,y:e.clientY}),Fn=0,an=performance.now(),At.size===2){const[a,s]=[...At.values()];on=Math.hypot(a.x-s.x,a.y-s.y)}},fs=e=>{const a=At.get(e.pointerId);if(!a)return;const s=e.clientX-a.x,d=e.clientY-a.y;if(At.set(e.pointerId,{x:e.clientX,y:e.clientY}),z){if(At.size>=2){const[A,N]=[...At.values()],D=Math.hypot(A.x-N.x,A.y-N.y);on>0&&D>0&&(On==="third"?oo=Math.min(Ja,Math.max(Ka,oo*(on/D))):Rn=Math.min(Oa,Math.max(Ba,Rn*(on/D)))),on=D,Fn+=Math.abs(s)+Math.abs(d)+10;return}Fn+=Math.abs(s)+Math.abs(d);const M=Rn/ca;We-=s*.004*M,St=Math.min(1.15,Math.max(-1.05,St-d*.0035*M)),Math.abs(s)+Math.abs(d)>2&&(ao=1.4);return}if(an=performance.now(),At.size===1)Fn+=Math.abs(s)+Math.abs(d),_e.theta-=s*.006,_e.phi=Math.min(2.9,Math.max(.2,_e.phi-d*.006)),Gt=null,$t=null;else if(At.size===2){const[M,A]=[...At.values()],N=Math.hypot(M.x-A.x,M.y-A.y);on>0&&(Ge.radius=ms(Ge.radius*(on/N))),on=N,Fn+=10}},Go=e=>{const a=ga.get(e.pointerId),s=Uo;if(ga.delete(e.pointerId),At.delete(e.pointerId),on=0,At.size===0&&(Uo=!1),z){(a?Math.hypot(e.clientX-a.x,e.clientY-a.y):1/0)<12&&!s&&At.size===0&&va();return}if(Fn<6&&n.onPick){const d=i.getBoundingClientRect();ls.set((e.clientX-d.left)/d.width*2-1,-((e.clientY-d.top)/d.height)*2+1),cs.setFromCamera(ls,l);const A=cs.intersectObjects([...Z.values(),...ut.values()],!1)[0]?.object.name;A&&Z.has(A)?n.onPick(A):A&&ut.has(A)&&n.onExtra?.(A)}},ps=e=>{if(z){e.preventDefault(),On==="third"?oo=Math.min(Ja,Math.max(Ka,oo*(e.deltaY>0?1.1:.9))):Rn=Math.min(Oa,Math.max(Ba,Rn*(e.deltaY>0?1.1:.9)));return}e.preventDefault(),Ge.radius=ms(Ge.radius*(e.deltaY>0?1.12:.89))};function ms(e){return Te!=="system"?Math.min(Kn[Te]*2.2,Math.max(Kn[Te]*.15,e)):Math.min(90,Math.max(lt==="system"&&!bt?4:.15,e))}const ds=e=>{if(!z)return;const a=e.target;if(a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"||a.isContentEditable))return;const s=e.key.toLowerCase();if(e.code==="KeyE"||e.code==="KeyF"||s==="e"||s==="f"){if(e.repeat||Ln<eo)return;e.preventDefault(),va();return}(s===" "||s==="spacebar"||s==="w"||s==="a"||s==="s"||s==="d"||s.startsWith("arrow"))&&(e.preventDefault(),jt.add(s==="spacebar"?" ":s),(s===" "||s==="spacebar")&&(vn=!0))},hs=e=>{const a=e.key.toLowerCase();jt.delete(a==="spacebar"?" ":a)};window.addEventListener("keydown",ds),window.addEventListener("keyup",hs),i.addEventListener("pointerdown",us),i.addEventListener("pointermove",fs),i.addEventListener("pointerup",Go),i.addEventListener("pointercancel",Go),i.addEventListener("wheel",ps,{passive:!1});let yn=null,Vo=null,ya=!matchMedia("(prefers-reduced-motion: reduce)").matches,vs=0,gs=0;ya&&(yn=new Br(c),yn.addPass(new Or(x,l)),Vo=new jr(new zo(256,256),.75,.78,.92),yn.addPass(Vo),yn.addPass(new Xr));const Ae={w:1,h:1},ys=()=>{Ae.w=t.clientWidth||1,Ae.h=t.clientHeight||1,c.setSize(Ae.w,Ae.h,!1),yn?.setSize(Ae.w,Ae.h),Vo?.resolution.set(Ae.w/2,Ae.h/2),l.aspect=Ae.w/Ae.h,l.updateProjectionMatrix()};ys();const Ms=new ResizeObserver(ys);Ms.observe(t);let ws=!0;const xs=new IntersectionObserver(e=>{ws=e.some(a=>a.isIntersecting)});xs.observe(t);const ee=new U,Hn=new U,ro=new U,Ma=new U,br=new U,Sr=new U,kr=new U,Pr=new U,bs=new U,zr=new U;let wa=0,Ss=performance.now(),xa=-1e9,ks=0;const Ps=e=>{wa=requestAnimationFrame(Ps);const a=Math.min(.1,(e-Ss)/1e3);if(Ss=e,document.hidden||!ws)return;if(z){xr(e/1e3,a);return}if(hn||(zn.uniforms.time.value=e/1e3),!hn){for(const u of V)u.uniforms.time.value=e/1e3;for(const u of oe)u.uniforms.uTime.value=e/1e3}e-an>3e3&&!hn&&!Gt&&!Va&&!qn&&Te!=="eclipse"&&Te!=="sizes"&&(_e.theta+=a*(lt==="system"?.03:.08)),mt?.rotateY(a*.01);for(const[u,b]of Z){if(u==="earth"||u==="moon"||$t&&u===lt)continue;const _=xo(u).spinHours;hn||b.rotateY(a*(u==="sun"?.02:_?.12*(24/_)*.25:.12))}it&&(it.visible=l.position.length()>4);for(const u of f)u.material.uniforms.uDays.value=(ye-qi)/864e5,u.material.uniforms.uTime.value=e/1e3;for(const u of Q){const b=Z.get(u.parent);b&&u.mesh.material.uniforms.planetCenter.value.copy(b.getWorldPosition(ee))}for(const u of G)u.mesh.getWorldPosition(ee),u.material.uniforms.ringCenter.value.copy(ee),u.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(u.mesh.matrixWorld).normalize();if(j&&e-ks>1e3&&(ks=e,ye=Date.now(),_n(ye)),ie){const u=ue.get(ie.id),b=u.points.length,_=u.times[b-1],B=(u.frame==="earth"?6:25)*864e5,pe=u.marks.some(tt=>tt.at!==void 0&&tt.body&&tt.body!=="earth"&&Math.abs(ie.sim-tt.at)<B)?"slow":ie.sim>=ie.fastFrom?"fast":"normal",be=pe==="slow"?Math.min(ie.base,2*B/3):ie.base*(pe==="fast"?ie.fast:1);ie.sim=Math.min(_,ie.sim+be*Math.min(a,.1)),u.frame==="sun"?Ot=(Ot??ie.sim)+Math.min(a,.1)*.15*864e5:Ot=null,ie.pace=pe;const $e=(ie.sim-u.times[0])/(_-u.times[0]||1);let Pe=0,je=b-1;for(;je-Pe>1;){const tt=Pe+je>>1;u.times[tt]<=ie.sim?Pe=tt:je=tt}const Ze=u.times[je]-u.times[Pe],Ie=Pe+(Ze>0?(ie.sim-u.times[Pe])/Ze:0),rt=Math.max(0,Math.min(b-2,Math.floor(Ie))),Ct=Ie-rt;u.probe.position.lerpVectors(u.points[rt],u.points[rt+1],Ct),sn=Ie,u.probe.lookAt(u.line.localToWorld(u.points[Math.min(b-1,rt+2)].clone())),u.line.geometry.setDrawRange(0,rt+2);const Dt=u.times[rt]+(u.times[rt+1]-u.times[rt])*Ct;j=!1,ye=Dt,_n(Dt);let ht=0;for(let tt=0;tt<u.marks.length;tt+=1){const _t=u.marks[tt],Rt=_t.at??u.times[Math.min(b-1,_t.index)];ie.sim>=Rt-B&&(ht=tt)}if((ht!==ie.mark||e-ie.lastPing>250||ie.sim>=_&&!ie.done)&&(ie.mark=ht,ie.lastPing=e,ie.sim>=_&&(ie.done=!0),n.onFlight?.({id:ie.id,mark:u.marks[ht],progress:$e,time:Dt,done:ie.done,pace:ie.pace})),ie.done){const tt=u.frame==="earth";ie=null,Ot=null,j=!0,bt=tt?ze.get("earth")??null:null,tt||Ge.target.set(0,0,0),Ge.radius=tt?4.2:72,_e.phi=tt?.7:.45}}if(bt&&Ge.target.copy(bt.getWorldPosition(ee)),ie){const u=ue.get(ie.id);let b=null,_=1/0;for(const Me of u.marks){if(!Me.body||Me.body==="earth"||Me.body==="far")continue;const pe=Math.abs(Me.index-sn);pe<14&&pe<_&&(b=Me,_=pe)}const B=b?ze.get(b.body):void 0;if(B){const Me=B.getWorldPosition(kr).add(u.probe.getWorldPosition(Pr)).multiplyScalar(.5);Ge.target.copy(Me),Ge.radius=u.frame==="earth"?1.6:4.2}else Ge.radius=u.frame==="earth"?1.5:2.8}if(Jn.lerp(Ge.target,1-Math.pow(.002,a)),_e.radius+=(Ge.radius-_e.radius)*(1-Math.pow(.004,a)),Gt&&$t){const u=Z.get(lt)?.getWorldPosition(bs)??bs.set(0,0,0);Gt.copy($t.getWorldPosition(zr).sub(u).normalize());const b=Math.atan2(Gt.x,Gt.z),_=Math.acos(Math.max(-1,Math.min(1,Gt.y)));let B=b-_e.theta;B=Math.atan2(Math.sin(B),Math.cos(B)),_e.theta+=B*(1-Math.pow(.01,a)),_e.phi+=(_-_e.phi)*(1-Math.pow(.01,a))}if(Te==="blackhole"&&gt.update(e/1e3,l),Te==="exo"){const u=e/1e3;for(const b of ke){const _=b.phase0+u/b.period*Math.PI*2;b.mesh.position.set(Math.cos(_)*b.a,0,Math.sin(_)*b.a)}}if(Te==="eclipse"){ae=(ae+a*.18)%1;const u=Math.sin(ae*Math.PI*2),b=Math.abs(u)<.22,_=Math.max(0,1-Math.abs(u)/.9),B=te==="lunar";if(g.visible=!E,h.visible=E,R.skySun.visible=!B,R.skyMoon.visible=B,E)B?(R.skyMoon.position.set(u*1.7,0,.08),R.skyMoonMat.color.set("#f2f2f2").lerp(new Y("#c47462"),B?_:0)):R.skyCover.position.set(u*1.7,0,.08);else{R.moon.position.set(B?2.75:1.05,u*.55,0),R.cone.visible=!B,R.umbra.visible=B,R.shadow.opacity=b?.42:.08,R.umbra.material.opacity=b?.42:.08,R.moonMat.color.set("#ffffff").lerp(new Y("#c47462"),B?_:0);const Me=b?q("개기"):Math.abs(u)<.6?q("부분"):B?q("반영"):"";st.textContent!==Me&&(st.textContent=Me)}}if(l.position.set(Jn.x+_e.radius*Math.sin(_e.phi)*Math.sin(_e.theta),Jn.y+_e.radius*Math.cos(_e.phi),Jn.z+_e.radius*Math.sin(_e.phi)*Math.cos(_e.theta)),l.lookAt(Jn),Wn&&(Wn.getWorldPosition(ee),An.copy(ee).multiplyScalar(-1).normalize(),e-xa>500&&!(ie&&ue.get(ie.id)?.frame==="sun"))){xa=e;const u=ti(new Date(ye)),b=Math.atan2(u.y,u.x),_=Math.atan2(-An.z,An.x),B=Wn.children[0];B.rotation.y=_-b}yn&&ya&&Te!=="blackhole"&&(Te!=="system"||lt==="system"||lt==="sun")&&yn?(yn.render(a),vs+=1,gs+=a,vs===90&&gs/90>.034&&(ya=!1)):c.render(x,l),l.getWorldDirection(Hn),P();const M=[];for(const u of sa){const b=Ye.get(u),_=ze.get(u);if(!b||!_)continue;_.getWorldPosition(ee);const B=ro.copy(ee).sub(l.position).dot(Hn)>0,Me=lt==="system"&&Te==="system"&&(!bt||ie!==null),pe=lt==="earth"||lt==="moon"||ie!==null&&ue.get(ie.id)?.frame==="earth";let be=B&&(u==="moon"?Te==="system"&&pe:Me||pe&&u==="earth"&&ie!==null);ee.project(l);const $e=(ee.x+1)/2*Ae.w;let Pe=$e;const je=(1-ee.y)/2*Ae.h+10;if(be){let Ze=To.get(u)??0;Ze||(b.style.display="block",Ze=b.offsetWidth||40,To.set(u,Ze)),Pe=Math.min(Math.max($e,Ze/2+4),Math.max(Ze/2+4,Ae.w-Ze/2-4));const Ie={x:Pe-Ze/2,y:je,w:Ze,h:22};k(Ie.x,Ie.y,Ie.w,Ie.h)||M.some(rt=>Ie.x<rt.x+rt.w+4&&Ie.x+Ie.w+4>rt.x&&Ie.y<rt.y+rt.h&&Ie.y+Ie.h>rt.y)?be=!1:M.push(Ie)}b.style.display=be?"block":"none",be&&(b.style.transform=`translate(${Pe}px, ${je}px) translate(-50%, 0)`)}const A=Te==="system",N=lt!=="system"&&lt!=="jupiter"&&lt!=="saturn",D=bt!==null&&(ie===null?bt===ze.get("earth"):ue.get(ie.id)?.frame==="earth");for(const u of rn)u.visible=!N&&!D;for(const[u,b]of Lt){const _=De.get(u),B=b.parent?ze.get(b.parent)===bt:lt==="system"&&(!bt||bt===_),Me=bt===_||B;_.getWorldPosition(ee);const pe=ro.copy(ee).sub(l.position).dot(Hn)>0,be=A&&pe&&Me;ee.project(l),b.el.style.display=be?"block":"none",be&&(b.el.style.transform=`translate(${(ee.x+1)/2*Ae.w}px, ${(1-ee.y)/2*Ae.h+8}px) translate(-50%, 0)`)}for(const[u,b]of ue){const _=A&&W===u;if(b.line.visible=_,!_){b.el.style.display="none";continue}b.probe.getWorldPosition(ee);const B=ro.copy(ee).sub(l.position).dot(Hn)>0;ee.y+=0,ee.project(l),b.el.style.display=B?"block":"none",B&&(b.el.style.transform=`translate(${(ee.x+1)/2*Ae.w}px, ${(1-ee.y)/2*Ae.h}px) translate(10px, -50%)`)}for(const u of dn){if(Te!=="stars"){u.el.style.display="none";continue}ee.copy(u.at);const b=ro.copy(ee).sub(l.position).dot(Hn)>0;ee.project(l);const _=b&&Math.abs(ee.x)<1&&Math.abs(ee.y)<1;u.el.style.display=_?"block":"none",_&&(u.el.style.transform=`translate(${(ee.x+1)/2*Ae.w}px, ${(1-ee.y)/2*Ae.h}px) translate(-50%, -50%)`)}for(const u of Ht){if(!(u.level===Te)){u.el.style.display="none";continue}ee.copy(u.marker.position);const _=ro.copy(ee).sub(l.position).dot(Hn)>0;ee.project(l),u.el.style.display=_?"block":"none",_&&(u.el.style.transform=`translate(${(ee.x+1)/2*Ae.w}px, ${(1-ee.y)/2*Ae.h+8}px) translate(-50%, 0)`)}for(const u of ke){if(Te!=="exo"){u.el.style.display="none";continue}u.mesh.getWorldPosition(ee);const b=ro.copy(ee).sub(l.position).dot(Hn)>0;ee.project(l),u.el.style.display=b?"block":"none",b&&(u.el.style.transform=`translate(${(ee.x+1)/2*Ae.w}px, ${(1-ee.y)/2*Ae.h+8}px) translate(-50%, 0)`)}for(const u of mn){if(Te!=="blackhole"){u.el.style.display="none";continue}ee.copy(u.at),gt.group.localToWorld(ee),ee.project(l);const b=ee.z<1&&Math.abs(ee.x)<1.05&&Math.abs(ee.y)<1.05;u.el.style.display=b?"block":"none",b&&(u.el.style.transform=`translate(${(ee.x+1)/2*Ae.w}px, ${(1-ee.y)/2*Ae.h}px) translate(-50%, -100%)`)}for(const u of at){if(Te!=="exo"){u.el.style.display="none";continue}ee.copy(u.at).project(l);const b=ee.z<1&&Math.abs(ee.x)<1.05&&Math.abs(ee.y)<1.05;u.el.style.display=b?"block":"none",b&&(u.el.style.transform=`translate(${(ee.x+1)/2*Ae.w}px, ${(1-ee.y)/2*Ae.h}px) translate(-50%, -100%)`)}for(const[u,b]of[[Ke,Te==="eclipse"&&!E],[Yt,Te==="sizes"]])for(const _ of u){if(!b){_.el.style.display="none";continue}ee.copy(_.at).applyMatrix4(_.group.matrixWorld).project(l);let B=ee.z<1&&Math.abs(ee.x)<1.1&&Math.abs(ee.y)<1.1;const Me=(ee.x+1)/2*Ae.w,pe=(1-ee.y)/2*Ae.h,be=_.el.offsetWidth||44;B&&k(Me-be/2,pe-11,be,22)&&(B=!1),_.el.style.display=B?"block":"none";const $e=_.group.rotation.z!==0;B&&(_.el.style.transform=`translate(${(ee.x+1)/2*Ae.w}px, ${(1-ee.y)/2*Ae.h}px) ${$e?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const u of Ne){u.mesh.getWorldPosition(ee);const b=Z.get(u.parent);b?b.getWorldPosition(Ma):Ma.set(0,0,0);let B=br.copy(ee).sub(Ma).normalize().dot(Sr.copy(l.position).sub(ee).normalize())>.15&&Te==="system"&&lt===u.parent;ee.project(l),B&&k((ee.x+1)/2*Ae.w+8,(1-ee.y)/2*Ae.h-11,90)&&(B=!1),u.el.style.display=B?"block":"none",B&&(u.el.style.transform=`translate(${(ee.x+1)/2*Ae.w}px, ${(1-ee.y)/2*Ae.h}px) translate(8px, -50%)`)}};wa=requestAnimationFrame(Ps),me===0&&n.onReady?.();const ba=e=>({mesh:Number(e.mesh.toFixed(2)),ray:e.ray===null?null:Number(e.ray.toFixed(2)),diff:e.ray===null?null:Number((e.mesh-e.ray).toFixed(2))});return typeof window<"u"&&location.search.includes("surfdebug")&&(window.__surfDebug=()=>({surf:z?{shock:z.impact.sinceImpact(),doom:z.impact.doom(),flash:z.impact.flash(),shake:z.impact.shake(),stats:z.impact.stats()}:null,x:Number(ve.toFixed(2)),z:Number(ge.toFixed(2)),y:Number(l.position.y.toFixed(2)),yaw:Number(We.toFixed(2)),pitch:Number(St.toFixed(2)),jump:Number(no.toFixed(2)),knock:[Number(Xn.toFixed(2)),Number(Yn.toFixed(2))],mode:On,alt:Number(Qn.toFixed(2)),ground:z?Number(z.meshHeightAt(ve,ge).toFixed(2)):null,camY:Number(l.position.y.toFixed(2)),cam:[Number(l.position.x.toFixed(2)),Number(l.position.z.toFixed(2))],feet:z?Number((z.eyeY+z.meshHeightAt(ve,ge)-z.eyeHeight).toFixed(2)):null,third:Number(oo.toFixed(2)),avatar:z?{vis:z.avatar.group.visible,x:Number(z.avatar.group.children[0]?.position.x.toFixed(1)),y:Number((z.avatar.group.children[0]?.position.y??0).toFixed(1))}:null,down:Number(en.toFixed(2)),burn:Number(Gn.toFixed(2)),rocket:{phase:Ee,alt:Number(pt.toFixed(1)),count:En,pad:[Number(kt.toFixed(1)),Number(Pt.toFixed(1))],padY:Number(Nn.toFixed(2))},probe:z?{stand:ba(z.probeGround(ve,ge)),pad:ba(z.probeGround(kt,Pt))}:null}),window.__surfProbe=(e,a)=>z?ba(z.probeGround(e,a)):null,window.__surfFreeCam=(e,a=0,s=0,d=0,M=0,A=0,N=62)=>{nn=e===null?null:{pos:[e,a,s],look:[d,M,A],fov:N}}),{focus:ia,setLevel:Eo,setPaused:e=>{Va=e},focusMarker:e=>{const a=Ht.find(s=>s.level===Te&&s.marker.id===e);a&&(Ge.target.copy(a.marker.position),Ge.radius=Kn[Te]*(e==="cmb"?1.4:Te==="group"?.6:.42),an=performance.now())},showSite:ir,focusExtra:rr,setEclipse:(e,a)=>{te=e,E=a,Eo("eclipse")},setHemisphere:e=>{lt!=="earth"&&ia("earth");const a=An.clone().multiplyScalar(e==="day"?1:-1);_e.theta=Math.atan2(a.x,a.z),_e.phi=Math.min(2.6,Math.max(.5,Math.acos(a.y))),Gt=null,$t=null,qn=!0},enterSurface:es,setSurfaceWorld:pr,exitSurface:ts,setSurfaceMove:(e,a)=>{Lo=Math.min(1,Math.max(-1,e)),ma=Math.min(1,Math.max(-1,a))},jumpSurface:()=>{vn=!0},setSurfaceMode:yr,setSurfaceSkin:Mr,impactSurface:dr,launchSurfaceRocket:is,dropProbe:va,setTime:e=>{j=e===null,ye=e??Date.now(),_n(ye),xa=-1e9},setVoyage:e=>{if(W=e,!e){ie&&(ie=null,j=!0),Ot=null;for(const b of ue.values())b.line.geometry.setDrawRange(0,1/0);return}Te!=="system"&&Eo("system"),Ot=null;const a=ue.get(e);a.line.geometry.setDrawRange(0,2),lt="system",Gt=null,$t=null,qn=!1,bt=a.probe;const s=a.frame==="earth";Ge.radius=s?1.3:2.8,_e.phi=s?.75:1;const d=Math.max(...a.marks.filter(b=>b.at!==void 0&&b.body!=="earth").map(b=>b.at),a.times[0]+864e5),M=a.times[0],A=a.times[a.times.length-1],N=(d-M)/(s?20:24),D=a.frame==="earth"?A:d+60*864e5,u=A>D?(A-D)/4/N:1;ie={id:e,sim:M,base:N,fastFrom:D,fast:u,mark:-1,done:!1,lastPing:0,pace:"normal"},an=performance.now()},dispose:()=>{Oo(),et?.dispose(),yn?.dispose(),Vo?.dispose(),z&&(x.remove(z.group),z.dispose(),z=null),cancelAnimationFrame(wa),Ms.disconnect(),xs.disconnect(),window.removeEventListener("keydown",ds),window.removeEventListener("keyup",hs),i.removeEventListener("pointerdown",us),i.removeEventListener("pointermove",fs),i.removeEventListener("pointerup",Go),i.removeEventListener("pointercancel",Go),i.removeEventListener("wheel",ps),x.traverse(e=>{const a=e.material;Array.isArray(a)&&a.forEach(s=>s.dispose())}),C.forEach(e=>e.dispose()),c.dispose(),i.remove(),v.remove()}}}export{xc as createSpace};
