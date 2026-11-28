import{t as q,a as kr}from"./index-D11BH4jm.js";import{G as Le,a as O,f as Re,M as he,g as Qe,A as Oe,D as ot,V as U,R as gt,P as Mo,h as ao,d as On,c as ro,S as io,b as X,i as en,j as gn,k as qo,l as Ko,I as hn,m as Jo,n as Ta,O as wo,N as Ss,e as yn,o as Ia,p as Aa,q as zr,L as Pr,r as Tr,s as Zs,t as xo,u as bo,v as Ca,w as qs,x as Ar,T as Ks,y as Cr,z as Rr,F as Er,H as Ra,W as Nr,J as Dr,K as Fr,U as Ir,X as _r,Y as Wr,Z as ya,_ as Lr,$ as Ma,C as vo,a0 as ks,a1 as Ur,a2 as Gr,a3 as Vr,a4 as Br,a5 as Or,a6 as Xr,a7 as jr,a8 as zs,a9 as Ps,aa as Yr,ab as Hr}from"./three-DV1D08k1.js";import{af as $r,ag as Ts,ah as Zr,ai as wa,aj as As,ak as qr,al as Kr,am as go,C as Jr,an as Qr,ao as Lo,ap as ei}from"./App-DWMeryXy.js";import{g as Js,U as Uo,V as ti}from"./audio-D5eRyi05.js";import{C as Cs}from"./sky-DZZNzeru.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";const Rs=`
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
`,Go=3,xa=9;function ni(t){const n=new Le;n.visible=!1,n.rotation.z=.1;const o=new O(t(new Re(1,48,32)),t(new he({color:"#000000"})));o.renderOrder=0,n.add(o);const s=t(new Qe({uniforms:{uTime:{value:0},uCam:{value:new U}},transparent:!0,depthWrite:!1,side:ot,blending:Oe,vertexShader:`
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
      `})),c=new O(t(new gt(Go,xa,256,8)),s);c.rotation.x=-Math.PI/2,c.renderOrder=1,n.add(c);const y=t(new Qe({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:Oe,vertexShader:`
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
      `})),r=new O(t(new Mo(8,8)),y);r.renderOrder=2,n.add(r);const h=[{name:q("궁수자리 A*"),at:new U(0,3.6,0)},{name:q("사건의 지평선"),at:new U(0,-2.9,0)},{name:q("강착 원반"),at:new U(xa-1.2,0,0)}],x=new U;return{group:n,labels:h,update(M,w){s.uniforms.uTime.value=M,y.uniforms.uTime.value=M,w.getWorldPosition(x),s.uniforms.uCam.value.copy(x),r.lookAt(x)}}}const yo=Math.PI/180;function Qt(t,n,o){return new U(Math.cos(n*yo)*Math.cos(t*yo),Math.sin(n*yo),-Math.cos(n*yo)*Math.sin(t*yo)).multiplyScalar(o)}function oi(){const n=document.createElement("canvas");n.width=64,n.height=64;const o=n.getContext("2d");if(o){const s=o.createRadialGradient(32,32,0,32,32,32);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.25,"rgba(255,255,255,0.75)"),s.addColorStop(1,"rgba(255,255,255,0)"),o.fillStyle=s,o.fillRect(0,0,64,64)}return new On(n)}function ai(){const t=[],n=M=>(t.push(M),M),o=n(oi());function s(M,w,z){const S=new ro(n(new io({map:o,color:new X(M),transparent:!0,depthWrite:!1,blending:Oe})));return S.scale.setScalar(w),S.position.copy(z),S}function c(M,w,z){const S=new Float32Array(M*3),l=new Float32Array(M*3);for(let u=0;u<M;u+=1){const[H,R]=w(u);S.set([H.x,H.y,H.z],u*3),l.set([R.r,R.g,R.b],u*3)}const C=n(new en);return C.setAttribute("position",new gn(S,3)),C.setAttribute("color",new gn(l,3)),new qo(C,n(new Ko({size:z,map:o,vertexColors:!0,transparent:!0,depthWrite:!1,blending:Oe,sizeAttenuation:!0})))}let y=7;const r=()=>(y=y*16807%2147483647,(y-1)/2147483646),h={},x={};{const M=new Le,w=2.6,z=[["alphacen",q("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",q("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",q("바너드별"),269.45,4.69,5.96,"#ffb27a",q("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",q("울프 359"),164.12,7.01,7.86,"#ff9a6a",q("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",q("시리우스"),101.29,-16.72,8.6,"#cfe0ff",q("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",q("로스 154"),282.46,-23.84,9.69,"#ffa070",q("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",q("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",q("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",q("백조자리 61"),316.7,38.75,11.4,"#ffc58a",q("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",q("프로키온"),114.83,5.22,11.46,"#fff3d6",q("작은개자리의 밝은 별이에요.")],["epsind",q("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",q("남쪽 하늘의 가까운 별이에요.")],["taucet",q("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",q("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];M.add(s("#ffe39a",3.2,new U));const S=[{id:"sun-star",name:q("태양"),line:q("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new U}];for(const[l,C,u,H,R,B,I]of z){const $=Qt(u,H,R*w);M.add(s(B,2.4,$)),S.push({id:l,name:C,line:kr("{0} 거리 약 {1}광년.",I,R),position:$})}M.add(c(500,()=>[new U(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(60+r()*30),new X().setHSL(.1,.3,.5+r()*.4)],.9)),h.stars=M,x.stars=S}{const M=new Le,w=1/40,z=[["pleiades",q("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,q("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",q("베텔게우스"),88.79,7.41,548,"#ffab6e",3,q("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",q("리겔"),78.63,-8.2,860,"#cfe0ff",3,q("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",q("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,q("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",q("데네브"),310.36,45.28,2600,"#e6eeff",3,q("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];M.add(s("#ffe39a",1.6,new U));const S=[{id:"sun-orion",name:q("태양"),line:q("우리은하의 오리온 팔 안쪽에 있어요."),position:new U}];for(const[l,C,u,H,R,B,I,$]of z){const fe=Qt(u,H,R*w);M.add(s(B,I,fe)),l==="orionneb"&&M.add(c(260,()=>{const G=Math.pow(r(),.6)*5;return[new U(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(G).add(fe),new X(r()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),S.push({id:l,name:C,line:$,position:fe})}M.add(c(1400,()=>{const l=(r()-.5)*120,C=(r()-.5)*22*(.4+r()),u=(r()-.5)*4;return[new U(l,u,C),new X().setHSL(.6+r()*.1,.3,.35+r()*.3)]},.8)),h.orion=M,x.orion=S}{const M=new Le,w=4;M.add(c(9e3,S=>{const l=S%w,C=Math.pow(r(),.55)*25,u=l/w*Math.PI*2+Math.log(1+C)*1.9+(r()-.5)*(.5+4/(C+2)),H=(r()-.5)*(C<4?2.2:.7),R=C<4,B=R?new X("#ffd9a0"):new X().setHSL(.58+r()*.06,.45,.45+r()*.35);return[new U(Math.cos(u)*C,H,Math.sin(u)*C),B.multiplyScalar(R?.8:.6)]},.55)),M.add(s("#fff0c8",7,new U));const z=new U(13,0,0);M.add(s("#ffe39a",1.2,z)),h.galaxy=M,x.galaxy=[{id:"center",name:q("은하 중심(궁수자리 A*)"),line:q("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new U},{id:"sun-gal",name:q("태양은 여기"),line:q("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:z}]}{const M=new Le,w=1/1e5,z=(R,B,I,$,fe)=>c($,G=>{const re=Math.pow(r(),.6)*B,we=G%2*Math.PI+Math.log(1+re*3)*2.2+(r()-.5)*.9,ie=new U(Math.cos(we)*re,(r()-.5)*B*.05,Math.sin(we)*re);ie.applyAxisAngle(new U(1,0,0),I);const N=re<B*.18;return[ie.add(R),new X().setHSL(N?.1:fe,.4,.45+r()*.3).multiplyScalar(N?.35:.22)]},.4),S=new U;M.add(z(S,2.2,0,1800,.6));const l=Qt(10.68,41.27,25e5*w);M.add(z(l,4.4,1.2,3200,.1));const C=Qt(23.46,30.66,273e4*w);M.add(z(C,1.6,.6,900,.62));const u=Qt(80.89,-69.76,16e4*w);M.add(s("#cfd8ff",1.2,u));const H=Qt(13.19,-72.83,2e5*w);M.add(s("#cfd8ff",.8,H)),h.group=M,x.group=[{id:"mw",name:q("우리 은하"),line:q("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:S},{id:"andromeda",name:q("안드로메다은하"),line:q("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:l},{id:"triangulum",name:q("삼각형자리은하"),line:q("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:C},{id:"lmc",name:q("대마젤란은하"),line:q("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:u}]}{const M=new Le,w=6,z=(R,B,I)=>new U(R,B,I).multiplyScalar(w),S=z(5.1,.35,1.1),l=z(3.4,.45,.2),C=z(-1.4,-.3,-.5),u=[[z(.2,0,0),900,6.4*w*.5],[l,280,1.5*w*.5],[C,220,1.7*w*.5],[z(-2.2,1.6,2.4),120,1.1*w*.5]],H=u.reduce((R,B)=>R+B[1],0);M.add(c(H+180,R=>{let B=R;for(const[$,fe,G]of u){if(B<fe)return[new U(r()-.5,(r()-.5)*.5,r()-.5).multiplyScalar(2*G*Math.pow(r(),.5)).add($),new X("#f3eee6").multiplyScalar(.75)];B-=fe}const I=r();return[S.clone().lerp(C,I).add(new U((r()-.5)*.7*w,(r()-.5)*.45*w,(r()-.5)*.7*w)),new X("#e7c48a").multiplyScalar(.8)]},.5)),M.add(new O(n(new Re(.95*w,20,16)),n(new he({color:"#d5e2f5",transparent:!0,opacity:.1,blending:Oe,depthWrite:!1}))).translateX(l.x).translateY(l.y).translateZ(l.z)),M.add(new O(n(new Re(1.05*w,20,16)),n(new he({color:"#e7c48a",transparent:!0,opacity:.09,blending:Oe,depthWrite:!1}))).translateX(C.x).translateY(C.y).translateZ(C.z)),M.add(s("#e4b56a",1.2,S)),h.super=M,x.super=[{id:"localgroup",name:q("우리 은하군"),line:q("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:S},{id:"virgo-sc",name:q("처녀자리 은하단"),line:q("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:l},{id:"attractor-sc",name:q("거대 인력체"),line:q("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:C}]}{const M=new Le,w=1/1e7,z=Qt(187.7,12.4,54e6*w),S=Qt(243,-60,2e8*w);M.add(c(5e3,C=>{const u=C%5,R=[z,S,Qt(30,20,15e7*w),Qt(160,-30,18e7*w),Qt(300,40,14e7*w)][u],B=u===1?7:4;return[new U((r()-.5)*2,(r()-.5)*2,(r()-.5)*2).multiplyScalar(B*Math.pow(r(),.4)).add(R),new X().setHSL(.08+r()*.5,.35,.55).multiplyScalar(.8)]},.8)),M.add(s("#ffffff",.8,new U));const l=new O(n(new Re(42,48,32)),n(new he({color:"#ff8a4a",transparent:!0,opacity:.08,side:ao,depthWrite:!1})));M.add(l),h.cosmos=M,x.cosmos=[{id:"here",name:q("우리 은하"),line:q("여기서는 점 하나예요."),position:new U},{id:"virgo",name:q("처녀자리 은하단"),line:q("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:z},{id:"attractor",name:q("거대 인력체"),line:q("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:S},{id:"cmb",name:q("가장 오래된 빛"),line:q("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new U(0,0,-42)}]}for(const M of Object.values(h))M.visible=!1;return{groups:h,markers:x,dispose:()=>t.forEach(M=>M.dispose())}}const Vo=1.7,Es=t=>{const n=Math.min(1,Math.max(0,t));return n*n*(3-2*n)};function Ns(t){try{const n=navigator;typeof n.vibrate=="function"&&n.vibrate(t)}catch{}}function ba(t,n,o){const c=document.createElement("canvas");c.width=128,c.height=128;const y=c.getContext("2d"),r=y.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,t),r.addColorStop(.35,n),r.addColorStop(1,o),y.fillStyle=r,y.fillRect(0,0,128,128);const h=new On(c);return h.colorSpace=yn,h}function si(t){const n=new Le,o=(()=>{let K=2654435769;return()=>(K=K*1664525+1013904223>>>0,K/4294967296)})(),s=ba("rgba(255,255,255,1)","rgba(255,168,64,0.85)","rgba(255,90,0,0)"),c=ba("rgba(120,104,96,0.55)","rgba(70,60,56,0.35)","rgba(40,34,32,0)"),y=ba("rgba(255,255,255,1)","rgba(255,214,160,0.7)","rgba(255,140,40,0)"),r=[s,c,y],h=K=>(r.push(K),K),x=new Le,M=new O(h(new hn(1,1)),h(new he({color:new X(2757128),fog:!1})));M.scale.setScalar(15),x.add(M);const w=new O(h(new hn(1,1)),h(new he({color:new X(16742946),transparent:!0,opacity:.85,blending:Oe,depthWrite:!1,fog:!1})));w.scale.setScalar(21),x.add(w);const z=(K,Z,V,ne=Oe)=>{const pe=h(new io({map:K,color:new X(Z),transparent:!0,depthWrite:!1,blending:ne,fog:!1})),j=new ro(pe);return j.scale.setScalar(V),j},S=z(y,16747050,150);x.add(S);const l=z(s,16765562,70);x.add(l),x.visible=!1,n.add(x);const C=[],u=96;for(let K=0;K<u;K+=1){const Z=K%3===0,V=z(Z?c:s,Z?9074022:16747571,1,Z?Ss:Oe);V.visible=!1,n.add(V),C.push({sprite:V,mat:V.material,life:0,max:1,from:1,to:1,rise:0,driftX:1,driftZ:1,spin:0,smoke:Z})}let H=0;const R=(K,Z,V,ne,pe,j,F)=>{let le=null;for(let Tt=0;Tt<C.length;Tt+=1){const Mt=C[(H+Tt)%C.length];if(Mt.smoke===Z&&(Mt.life<=0||!le)&&(le=Mt,H=(H+Tt+1)%C.length,Mt.life<=0))break}le&&(le.sprite.position.copy(K),le.sprite.visible=!0,le.life=ne,le.max=ne,le.from=V*.45,le.to=V,le.rise=pe,le.driftX=(o()-.5)*j,le.driftZ=(o()-.5)*j,le.spin=(o()-.5)*1.4,le.sprite.material.rotation=o()*Math.PI*2,le.mat.opacity=Z?.46:.55,F!==void 0?le.mat.color.setHex(F):le.mat.color.setHex(Z?7035474:16742946),le.sprite.scale.setScalar(le.from))},B=new O(h(new Re(1,32,20)),h(new he({color:new X(16757575),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,side:ot,fog:!1})));B.visible=!1,n.add(B);const I=new O(h(new Re(1,24,16)),h(new he({color:new X(16774872),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,side:ot,fog:!1})));I.visible=!1,n.add(I);const $=new O(h(new Re(1,28,18)),h(new he({color:new X(16731410),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,side:ot,fog:!1})));$.visible=!1,n.add($);const fe=[],G=(K,Z,V,ne,pe,j,F)=>{const le=h(new he({color:new X(V),transparent:!0,opacity:ne,blending:Oe,depthWrite:!1,side:ot,fog:!1})),Tt=h(new gt(K,Z,64,1)),Mt=new O(Tt,le);pe&&(Mt.rotation.x=-Math.PI/2),Mt.visible=!1,n.add(Mt);const ln={mesh:Mt,mat:le,grow:j,life:0,max:F,flat:pe};return fe.push(ln),ln};G(.92,1,16742946,.9,!0,480,1.3),G(.9,1,16726538,.75,!0,620,1.9),G(.86,1,16765066,.7,!0,340,.9),G(.82,1,11569770,.5,!0,420,2.6),G(.95,1,16769712,.55,!1,700,1.6);const re=220,we=h(new en),ie=new Float32Array(re*3),N=new Float32Array(re*3);we.setAttribute("position",new gn(ie,3));const ae=h(new Ko({color:new X(16756832),size:2.4,transparent:!0,opacity:0,depthWrite:!1,blending:Oe,sizeAttenuation:!0,fog:!1})),Ee=new qo(we,ae);Ee.frustumCulled=!1,Ee.visible=!1,n.add(Ee);const Ie=150,xe=new Jo(h(new hn(1,0)),h(new he({color:new X(16777215),transparent:!0,opacity:1,fog:!1})),Ie);xe.instanceMatrix.setUsage(Ta),xe.frustumCulled=!1,xe.visible=!1,n.add(xe);const at=[];for(let K=0;K<Ie;K+=1)at.push({p:new U,v:new U,s:1,spin:new U,rot:new U});const D=new wo,ee=new Le;ee.visible=!1,n.add(ee);const ze=h(new he({color:new X(1773580),transparent:!0,opacity:0,depthWrite:!1,fog:!1}));ze.blending=Ss;const tt=h(new he({color:new X(3809818),transparent:!0,opacity:0,depthWrite:!1,fog:!1})),ke=h(new he({color:new X(16734738),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,side:ot,fog:!1})),de=h(new he({color:new X(16756832),transparent:!0,opacity:0,blending:Oe,depthWrite:!1,fog:!1})),ft=(K,Z,V,ne)=>{K.rotateX(-Math.PI/2);const pe=t.floorAt(Z,V)-t.heightAt(Z,V),j=K.attributes.position;for(let F=0;F<j.count;F+=1){const le=j.getX(F),Tt=j.getZ(F);j.setY(F,t.heightAt(Z+le,V+Tt)+pe+ne)}return j.needsUpdate=!0,K.computeVertexNormals(),K};function yt(K,Z,V,ne){ee.clear();const pe=ft(h(new gt(.01,ne*1.36,72,10)),K,Z,.35),j=new O(pe,ze);j.position.set(K,0,Z),ee.add(j);const F=ft(h(new gt(ne*.95,ne*1.3,72,3)),K,Z,.5),le=new O(F,tt);le.position.set(K,0,Z),ee.add(le);const Tt=ft(h(new gt(ne*.42,ne*1.1,72,6)),K,Z,.42),Mt=new O(Tt,ke);Mt.position.set(K,0,Z),ee.add(Mt);const ln=ft(h(new gt(.01,ne*.45,72,5)),K,Z,.45),Zt=new O(ln,de);Zt.position.set(K,0,Z),ee.add(Zt),ee.visible=!0}let Ne=-1,pt=-1,Ht=new U,ce=new U,se=!1;function on(){for(const K of C)K.life=0,K.sprite.visible=!1}function Ot(K,Z,V=0,ne=0){on();const pe=t.floorAt(K,Z);ce.set(K,pe,Z);const j=V||0,F=ne||0;Ht.set(K+j*900,pe+520,Z+F*900),x.visible=!0,x.position.copy(Ht),B.visible=!1,$.visible=!1;for(const le of fe)le.life=0,le.mesh.visible=!1;xe.visible=!1,Ee.visible=!1,ae.opacity=0,se=!1,pt=-1,Ne=0,Ns([30,90,40])}function $t(K,Z){if(!(Ne<0)){if(Ne+=Z,!se&&Ne>=Vo){se=!0,pt=Ne,Ns([140,60,240,70,320,80,420,110,520,160,380]);const V=t.onScar?.(ce.x,ce.z)??26;t.onImpact?.(),yt(ce.x,ce.z,ce.y,V),B.visible=!0,$.visible=!0,xe.visible=!0,Ee.visible=!0,ae.opacity=.95;for(const ne of fe)ne.life=ne.max,ne.mesh.visible=!0,ne.mesh.scale.setScalar(4),ne.mesh.position.set(ce.x,ce.y+(ne.flat?.6:2),ce.z),ne.flat||ne.mesh.rotation.set(0,0,0);for(let ne=0;ne<Ie;ne+=1){const pe=at[ne],j=o()*Math.PI*2,F=6+o()*34;pe.p.set(ce.x+Math.cos(j)*F*.2,ce.y+2+o()*8,ce.z+Math.sin(j)*F*.2);const le=28+o()*62;pe.v.set(Math.cos(j)*le,26+o()*70,Math.sin(j)*le),pe.s=.7+Math.pow(o(),2)*4.6,pe.spin.set((o()-.5)*6,(o()-.5)*6,(o()-.5)*6),pe.rot.set(o()*3,o()*3,o()*3)}xe.material.opacity=1;for(let ne=0;ne<Ie;ne+=1){const pe=ne%3===0;xe.setColorAt(ne,new X(pe?16747066:ne%3===1?8010270:4860444))}xe.instanceColor&&(xe.instanceColor.needsUpdate=!0);for(let ne=0;ne<re;ne+=1){const pe=o()*Math.PI*2,j=Math.sqrt(o())*90;ie[ne*3]=ce.x+Math.cos(pe)*j,ie[ne*3+1]=ce.y+20+o()*260,ie[ne*3+2]=ce.z+Math.sin(pe)*j,N[ne*3]=(o()-.5)*24,N[ne*3+1]=-(16+o()*34),N[ne*3+2]=(o()-.5)*24}we.attributes.position.needsUpdate=!0}if(!se){const V=Math.min(1,Ne/Vo),ne=Math.pow(V,2.15);x.position.lerpVectors(Ht,ce,ne);const pe=(1-ne)*40;x.position.x+=Math.sin(Ne*9.1)*pe,x.position.z+=Math.cos(Ne*7.3)*pe,x.rotation.x+=Z*2.2,x.rotation.y+=Z*1.4,S.scale.setScalar(150+Math.sin(Ne*20)*26),l.scale.setScalar(70+Math.sin(Ne*26)*14);for(let j=0;j<2;j+=1){const F=x.position.clone();F.x+=(o()-.5)*26,F.y+=(o()-.5)*26,F.z+=(o()-.5)*26,R(F,!1,90+o()*60,.9+o()*.5,6,18)}R(x.position.clone(),!0,150+o()*90,1.8+o()*.8,12,26)}for(const V of C){if(V.life<=0)continue;if(V.life-=Z,V.life<=0){V.sprite.visible=!1;continue}const ne=1-V.life/V.max,pe=V.from+(V.to-V.from)*Math.sqrt(ne);V.sprite.scale.setScalar(pe),V.sprite.position.y+=V.rise*Z*(1-ne),V.sprite.position.x+=V.driftX*Z,V.sprite.position.z+=V.driftZ*Z,V.sprite.material.rotation+=V.spin*Z;const j=V.smoke?Math.pow(1-ne,1.8)*.46:Math.pow(1-ne,1.3)*.55;V.mat.opacity=j}if(se){const V=Ne-pt,ne=(j,F,le)=>j+(F-j)*Es(V/le);B.scale.setScalar(ne(2,46,.85)),B.material.opacity=Math.max(0,1-V/1.9)*.95,I.scale.setScalar(ne(1,24,.4)),I.material.opacity=Math.max(0,1-V/.5),B.position.set(ce.x,ce.y+8,ce.z),I.position.set(ce.x,ce.y+10,ce.z),$.scale.setScalar(ne(3,34,1)),$.material.opacity=Math.max(0,.6-V/1.3*.6),$.position.set(ce.x,ce.y+4,ce.z);for(const j of fe){if(j.life<=0)continue;if(j.life-=Z,j.life<=0){j.mesh.visible=!1;continue}const F=1-j.life/j.max;j.mesh.scale.setScalar(4+j.grow*Math.pow(F,.6)),j.mat.opacity=Math.max(0,(1-F)*(j.flat?.85:.6))}if(V<1.8&&V%.085<Z){const j=new U(ce.x+(o()-.5)*18,ce.y+3+o()*6,ce.z+(o()-.5)*18);o()<.65&&R(j,!1,76+o()*56,1.4+o()*.7,14+o()*12,20,16761962),R(j,!0,60+o()*46,1.8+o()*.8,12+o()*10,26,11573898)}if(V<1.7&&V%.05<Z){const j=o()*Math.PI*2,F=26+V*46+o()*22,le=new U(ce.x+Math.cos(j)*F,ce.y+2+o()*12,ce.z+Math.sin(j)*F);R(le,!0,50+o()*40,1.6,7,14,11573376),o()<.55&&R(le,!1,70+o()*60,1.3,10,10,16751164)}if(V>.4&&V<2.8&&V%.11<Z){const j=o()*Math.PI*2,F=16+o()*46,le=new U(ce.x+Math.cos(j)*F,ce.y+34+o()*30,ce.z+Math.sin(j)*F);R(le,!0,70+o()*52,2,8,24,10520692)}const pe=xe.material;if(pe.opacity=Math.max(0,1-Math.max(0,V-3.4)/1.2),pe.opacity<=.01)xe.visible=!1;else{for(let j=0;j<Ie;j+=1){const F=at[j];F.v.y-=9.81*.55*Z,F.v.multiplyScalar(1-Z*.12),F.p.addScaledVector(F.v,Z);const le=t.floorAt(F.p.x,F.p.z)+F.s*.4;F.p.y<le&&(F.p.y=le,F.v.y=Math.abs(F.v.y)*.32,F.v.x*=.7,F.v.z*=.7),F.rot.x+=F.spin.x*Z,F.rot.y+=F.spin.y*Z,F.rot.z+=F.spin.z*Z,D.position.copy(F.p),D.rotation.set(F.rot.x,F.rot.y,F.rot.z),D.scale.setScalar(F.s),D.updateMatrix(),xe.setMatrixAt(j,D.matrix)}xe.instanceMatrix.needsUpdate=!0}if(Ee.visible)if(ae.opacity=Math.max(0,.95-Math.max(0,V-4)/1.6),ae.opacity<=.01)Ee.visible=!1;else{for(let j=0;j<re;j+=1){const F=j*3;ie[F]+=N[F]*Z,ie[F+1]+=N[F+1]*Z,ie[F+2]+=N[F+2]*Z,N[F+1]-=5*Z;const le=t.floorAt(ie[F],ie[F+2])+.4;ie[F+1]<le&&(ie[F]=ce.x+(o()-.5)*160,ie[F+1]=ce.y+120+o()*160,ie[F+2]=ce.z+(o()-.5)*160,N[F]=(o()-.5)*20,N[F+1]=-(14+o()*26),N[F+2]=(o()-.5)*20)}we.attributes.position.needsUpdate=!0}ze.opacity=Math.min(.42,V*1.1),tt.opacity=Math.min(.4,V*1.1),ke.opacity=Math.max(0,.85*Math.exp(-V/5.5)),de.opacity=Math.max(0,.9*Math.exp(-V/1.8))}if(se&&(x.visible=!1),Ne>80){Ne=-1,pt=-1,x.visible=!1,B.visible=!1,I.visible=!1,$.visible=!1,ee.visible=!1;for(const V of C)V.life=0,V.sprite.visible=!1;for(const V of fe)V.life=0,V.mesh.visible=!1;xe.visible=!1,Ee.visible=!1}}}return{group:n,strike:Ot,doom:()=>{if(Ne<0)return 0;if(!se)return Math.min(1,Es(Ne/(Vo*.82))*(.93+.07*Math.sin(Ne*12)));const K=Ne-pt;return K<1.8?1:Math.max(0,1-(K-1.8)/20)},flash:()=>{if(!se)return 0;const K=Ne-pt,Z=Math.exp(-K/.16),V=K>.35?.5*Math.exp(-(K-.35)/.3):0;return Math.min(1,Z+V)},shake:()=>{if(Ne<0)return 0;if(!se)return .02+Math.pow(Ne/Vo,3)*.18;const K=Ne-pt;if(K>3.6)return 0;let Z=1.55*Math.exp(-K/1.35);return Z+=.55*Math.exp(-Math.pow((K-1.55)/.22,2)),Z+=.32*Math.exp(-Math.pow((K-2.35)/.26,2)),Z+=.18*Math.exp(-Math.pow((K-3)/.3,2)),Z*Math.min(1,K/.06)},sinceImpact:()=>pt>=0?Ne-pt:-1,stats:()=>{const K=C.filter(V=>V.life>0),Z=K[0];return{t:Number(Ne.toFixed(2)),target:[Number(ce.x.toFixed(1)),Number(ce.y.toFixed(1)),Number(ce.z.toFixed(1))],start:[Number(Ht.x.toFixed(1)),Number(Ht.z.toFixed(1))],alive:K.length,map:Z?!!Z.mat.map:null,op:Z?Number(Z.mat.opacity.toFixed(2)):null,sc:Z?Number(Z.sprite.scale.x.toFixed(1)):null,pos:Z?Z.sprite.position.toArray().map(V=>Number(V.toFixed(1))):null,vis:Z?Z.sprite.visible:null,fire:[Number(B.material.opacity.toFixed(2)),Number(B.scale.x.toFixed(0)),B.visible],crater:[ee.visible,ee.children.length,Number(ze.opacity.toFixed(2)),Number(ke.opacity.toFixed(2))]}},update:$t,dispose:()=>{n.clear(),r.forEach(K=>K.dispose())}}}const ri=`
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
`,Fs=`
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
`,no=`
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
`,Yt=Math.PI*2,Qs=9,Is=140;function tn(t){return t<0?0:t>1?1:t}function Ho(t,n,o){return t<n?n:t>o?o:t}function Mn(t,n,o){const s=tn((o-t)/(n-t));return s*s*(3-2*s)}function Tn(t,n,o){let s=Math.imul(t|0,374761393)^Math.imul(n|0,668265263)^Math.imul(o|0,2246822519);return s=Math.imul(s^s>>>13,1274126177),((s^s>>>16)>>>0)/4294967295}function ui(t,n,o,s){const c=Math.floor(t),y=Math.floor(n),r=t-c,h=n-y,x=r*r*(3-2*r),M=h*h*(3-2*h),w=Math.max(1,Math.round(o)),z=$=>($%w+w)%w,S=z(c),l=z(c+1),C=z(y),u=z(y+1),H=Tn(S,C,s),R=Tn(l,C,s),B=Tn(S,u,s),I=Tn(l,u,s);return(H+(R-H)*x)*(1-M)+(B+(I-B)*x)*M}function nn(t,n,o,s,c){let y=0,r=.5,h=0,x=o;for(let M=0;M<s;M+=1)y+=r*ui(t*x,n*x,x,c+M*17),h+=r,r*=.5,x*=2;return y/h}function er(t){let n=t>>>0||1;return()=>(n=Math.imul(n,1664525)+1013904223>>>0,n/4294967296)}function co(t,n){const o=document.createElement("canvas");o.width=t,o.height=n;const s=o.getContext("2d");if(!s)throw new Error("2D canvas is unavailable");return{canvas:o,ctx:s}}const fi={crater:{seed:101,macro:.38,mid:.17,fine:.12,speck:.15,craters:20,stones:90,cracks:0,ripples:0,gloss:.02},rock:{seed:211,macro:.4,mid:.22,fine:.14,speck:.2,craters:5,stones:150,cracks:9,ripples:1,gloss:.05},volcano:{seed:331,macro:.32,mid:.24,fine:.16,speck:.22,craters:4,stones:110,cracks:14,ripples:0,gloss:.08},ice:{seed:401,macro:.26,mid:.2,fine:.2,speck:.16,craters:5,stones:18,cracks:22,ripples:0,gloss:.5},plain:{seed:509,macro:.3,mid:.15,fine:.1,speck:.13,craters:8,stones:70,cracks:3,ripples:.35,gloss:.03},plasma:{seed:601,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0},ring:{seed:701,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0}};function $o(t,n,o,s,c,y,r,h,x=!1){const M=Math.ceil(y),w=Math.round(s),z=Math.round(c);for(let S=-M;S<=M;S+=1)for(let l=-M;l<=M;l+=1){const C=(l*l+S*S)/(y*y);if(C>=1)continue;const u=x?Math.sqrt(1-C):1-C,H=((w+l)%o+o)%o,B=((z+S)%o+o)%o*o+H;t[B]+=r*u,n[B]+=h*u}}function pi(t,n,o,s,c,y,r){const h=.09+r()*.12,x=.05+r()*.06,M=.72+r()*.5,w=r()*Math.PI,z=Math.cos(w),S=Math.sin(w),l=Math.ceil(y*1.4),C=Math.round(s),u=Math.round(c);for(let H=-l;H<=l;H+=1)for(let R=-l;R<=l;R+=1){const B=(R*z+H*S)/y,I=(-R*S+H*z)/(y*M),$=Math.sqrt(B*B+I*I);if($>1.4)continue;let fe=0,G=0;$<1&&(fe-=Math.pow(1-$*$,1.25)*h,G-=(1-$)*.05);const re=Math.exp(-Math.pow(($-1.02)/.2,2))*x;fe+=re,G+=re*1.1+($>1&&$<1.35?.02:0);const we=((C+R)%o+o)%o,N=((u+H)%o+o)%o*o+we;n[N]+=fe,t[N]+=G}}function ka(t,n,o,s,c,y,r,h,x,M){const z=Math.max(2,Math.floor(r/1.1));let S=y,l=s,C=c;for(let u=0;u<z;u+=1){S+=(x()-.5)*.3,l+=Math.cos(S)*1.1,C+=Math.sin(S)*1.1;const H=h*(.6+x()*.8);M?($o(t,n,o,l,C,H*2.2,.03,.008),$o(t,n,o,l,C,H,-.05,-.03)):$o(t,n,o,l,C,H,-.07,-.03)}}function mi(t,n){const o=fi[t],s=er(o.seed),c=n/Qs,y=new Float32Array(n*n),r=new Float32Array(n*n),h=new Float32Array(n*n),x=7;for(let l=0;l<n;l+=1){const C=l/n;for(let u=0;u<n;u+=1){const H=u/n,R=l*n+u,B=nn(H,C,3,4,o.seed),I=nn(H,C,11,3,o.seed+13),$=nn(H,C,43,2,o.seed+29),fe=Tn(u,l,o.seed+71)-.5;let G=1+(B-.5)*o.macro+(I-.5)*o.mid+($-.5)*o.fine+fe*o.speck,re=.5+(B-.5)*.06+(I-.5)*.07+($-.5)*.08+fe*.03,we=o.gloss;if(o.ripples>0){const ie=C*x+(B-.5)*.85+(I-.5)*.3,N=Math.sin(ie*Yt);G+=N*.055*o.ripples,re+=N*.018*o.ripples}if(t==="volcano"){const ie=1-Math.abs(2*$-1);ie>.94?(G+=(ie-.94)*2.2,re-=.02,we+=.1):ie<.22&&(G-=(.22-ie)*.6)}t==="ice"&&(Math.abs(I-.5)<.012&&(G-=.24,re-=.035),G=.82+(G-1)*.95+($-.5)*.12,we=tn(.35+$*.55)),(t==="crater"||t==="ring")&&B<.34&&(G-=(.34-B)*1.1),t==="plain"&&(G+=Mn(.55,.78,B)*.18),y[R]=G,r[R]=re,h[R]=we}}for(let l=0;l<o.craters;l+=1){const C=(.3+Math.pow(s(),1.7)*1.1)*c;pi(y,r,n,s()*n,s()*n,C,s)}for(let l=0;l<o.stones;l+=1){const u=(s()<.18?.14+s()*.3:.03+s()*.09)*c,H=l%3===0?.12:-.08;$o(y,r,n,s()*n,s()*n,Math.max(.8,u),H,.02+u*.0012,!0)}for(let l=0;l<o.cracks;l+=1){const C=s()*n,u=s()*n,H=(.6+s()*3.4)*c;ka(y,r,n,C,u,s()*Yt,H,.8+s()*1.4,s,t==="ice")}if(t==="ice"){const l=()=>.5;for(let C=0;C<11;C+=1){const u=s()*Yt,H=n*(.45+s()*.75),R=s()*n,B=s()*n;ka(y,r,n,R-Math.cos(u)*H*.5,B-Math.sin(u)*H*.5,u,H,1+s()*1.4,l,!0)}for(let C=0;C<10;C+=1){const u=s()*n,H=s()*n,R=s()*Yt;ka(y,r,n,u,H,R,(.4+s()*1.6)*c,.8+s(),s,!0)}}const{canvas:M,ctx:w}=co(n,n),z=w.createImageData(n,n),S=z.data;for(let l=0;l<n*n;l+=1)S[l*4]=Math.round(Ho(y[l]*.5,0,1)*255),S[l*4+1]=Math.round(Ho(r[l],0,1)*255),S[l*4+2]=Math.round(Ho(h[l],0,1)*255),S[l*4+3]=255;return w.putImageData(z,0,0),M}function Be(t){const n=parseInt(t.replace("#",""),16);return[n>>16&255,n>>8&255,n&255]}function Bt(t,n,o){return[t[0]+(n[0]-t[0])*o,t[1]+(n[1]-t[1])*o,t[2]+(n[2]-t[2])*o]}function di(t,n,o){const s=t*n,c=Math.floor(s),y=s-c,r=z=>{const S=(z%2+2)%2===0,l=Tn(z,7,o);return S?.56+.4*l:.04+.3*l},h=r(c),x=r(c-1),M=r(c+1),w=.44;return y<w?x+(h-x)*Mn(0,1,y/w):y>1-w?h+(M-h)*Mn(0,1,(y-(1-w))/w):h}const Ea={jupiter:{bands:16,seed:3301,streaky:.8,polar:null,spots:[{u:.62,v:.66,ru:.085,rv:.05,color:Be("#a8492f"),swirl:2},{u:.24,v:.34,ru:.05,rv:.026,color:Be("#f6efdd"),swirl:0},{u:.46,v:.4,ru:.035,rv:.02,color:Be("#fbf3e1"),swirl:0},{u:.83,v:.44,ru:.03,rv:.018,color:Be("#f4ecd9"),swirl:0},{u:.36,v:.74,ru:.06,rv:.03,color:Be("#8d4b30"),swirl:0}]},saturn:{bands:20,seed:3307,streaky:.38,polar:Be("#c9d4d8"),spots:[{u:.7,v:.3,ru:.04,rv:.02,color:Be("#f7edd2"),swirl:0},{u:.3,v:.72,ru:.035,rv:.018,color:Be("#e6d3a4"),swirl:0}]},uranus:{bands:7,seed:3313,streaky:.25,polar:Be("#e6fbfd"),spots:[{u:.55,v:.36,ru:.06,rv:.03,color:Be("#dcf4f6"),swirl:0}]},neptune:{bands:9,seed:3319,streaky:.5,polar:Be("#a9c8f2"),spots:[{u:.34,v:.62,ru:.06,rv:.032,color:Be("#1f3a72"),swirl:1},{u:.72,v:.46,ru:.05,rv:.012,color:Be("#e9f3ff"),swirl:0},{u:.62,v:.36,ru:.035,rv:.009,color:Be("#f2f8ff"),swirl:0}]}};function hi(t,n,o,s=2){const c=new Uint8ClampedArray(t.length);for(let y=0;y<s;y+=1){for(let r=0;r<o;r+=1)for(let h=0;h<n;h+=1){const x=(h-1+n)%n*4,M=h*4,w=(h+1)%n*4,z=r*n*4;for(let S=0;S<3;S+=1)c[z+M+S]=(t[z+x+S]+t[z+M+S]*2+t[z+w+S])/4}for(let r=0;r<o;r+=1){const h=(r-1+o)%o*n*4,x=r*n*4,M=(r+1)%o*n*4;for(let w=0;w<n;w+=1){const z=w*4;for(let S=0;S<3;S+=1)t[x+z+S]=(c[h+z+S]+c[x+z+S]*2+c[M+z+S])/4}}}}function tr(t,n,o){const s=Ea[t.id]??Ea.jupiter,c=Be(t.ground),y=Be(t.ground2),r=Be(t.ground3),{canvas:h,ctx:x}=co(n,o),M=x.createImageData(n,o),w=M.data,z=s.seed,S=new Float32Array(n*o),l=new Float32Array(n*o);for(let R=0;R<o;R+=1){const B=R/o;for(let I=0;I<n;I+=1){const $=I/n,fe=(nn($,B,4,3,z)-.5)*.03+(nn($,B,13,2,z+7)-.5)*.005,G=tn(B+fe);let re=di(G,s.bands,z);const we=nn($*3,B*9,9,3,z+31)-.5;re+=we*.13*s.streaky;let ie;if(re<.5?ie=Bt(r,y,tn(re*2)):ie=Bt(y,c,tn((re-.5)*2)),s.polar){const ae=Mn(.82,1,Math.abs(B-.5)*2);ie=Bt(ie,s.polar,ae*.45)}for(const ae of s.spots){const Ee=($-ae.u)/ae.ru,Ie=(B-ae.v)/ae.rv,xe=Ee*Ee+Ie*Ie;if(xe<2.2){const at=Mn(1.05,.25,xe),D=ae.swirl>0?.82+.18*Math.sin(Math.atan2(Ie,Ee)*3+xe*7):1;ie=Bt(ie,[ae.color[0]*D,ae.color[1]*D,ae.color[2]*D],at*.92)}}const N=(R*n+I)*4;w[N]=ie[0],w[N+1]=ie[1],w[N+2]=ie[2],w[N+3]=255,S[R*n+I]=tn(.5+we*.85+(re-.5)*.5),l[R*n+I]=.5+we*.85}}const C=t.sunAz*Math.PI/180,u=Math.sin(C),H=-Math.cos(C);for(let R=0;R<o;R+=1){const B=(R+1)%o,I=(R-1+o)%o;for(let $=0;$<n;$+=1){const fe=($+1)%n,G=($-1+n)%n,re=l[R*n+fe]-l[R*n+G],we=l[B*n+$]-l[I*n+$],ie=Ho(1+(re*u+we*H)*1.8,.9,1.1),N=(R*n+$)*4;w[N]=Math.min(255,w[N]*ie),w[N+1]=Math.min(255,w[N+1]*ie),w[N+2]=Math.min(255,w[N+2]*ie),w[N+3]=Math.round(tn(.74+S[R*n+$]*.4)*255)}}return hi(w,n,o,2),x.putImageData(M,0,0),h}function vi(t,n){if(Ea[t.id])return tr(t,n,n);const{canvas:o,ctx:s}=co(n,n),c=s.createImageData(n,n),y=c.data,r=Be(t.ground),h=Be(t.ground2),x=Be(t.ground3);for(let M=0;M<n;M+=1){const w=M/n;for(let z=0;z<n;z+=1){const S=z/n,l=nn(S,w,4,4,9021),C=nn(S,w,16,3,9027),u=tn(l*.72+C*.4);let H=Bt(h,r,Mn(.25,.72,u));H=Bt(H,x,Mn(.66,.95,u)*.8);const R=(M*n+z)*4;y[R]=H[0],y[R+1]=H[1],y[R+2]=H[2],y[R+3]=255}}return s.putImageData(c,0,0),o}function gi(t,n,o){const{canvas:s,ctx:c}=co(n,o),y=er(t==="moon"?51:t==="pluto"?67:83),r=t==="pluto"?"#cbb6a4":t==="charon"?"#9d9a95":"#9a9691";if(c.fillStyle=r,c.fillRect(0,0,n,o),t==="pluto")c.fillStyle="#f3ece1",c.beginPath(),c.ellipse(n*.56,o*.46,n*.13,o*.16,-.2,0,Yt),c.fill(),c.beginPath(),c.ellipse(n*.72,o*.4,n*.07,o*.12,.35,0,Yt),c.fill(),c.fillStyle="rgba(96,68,54,0.62)",c.beginPath(),c.ellipse(n*.24,o*.6,n*.2,o*.13,.1,0,Yt),c.fill(),c.beginPath(),c.ellipse(n*.2,o*.32,n*.14,o*.1,-.2,0,Yt),c.fill();else if(t==="moon")for(let h=0;h<9;h+=1)c.fillStyle=`rgba(58,56,54,${.5+y()*.3})`,c.beginPath(),c.ellipse(y()*n,(.18+y()*.6)*o,(.04+y()*.07)*n,(.03+y()*.06)*o,y()*3,0,Yt),c.fill();else c.fillStyle="rgba(120,84,70,0.6)",c.beginPath(),c.ellipse(n*.5,o*.06,n*.4,o*.09,0,0,Yt),c.fill();for(let h=0;h<220;h+=1){const x=(2+Math.pow(y(),2.4)*26)*(n/1024),M=y()*n,w=y()*o,z=c.createRadialGradient(M,w,0,M,w,x);z.addColorStop(0,"rgba(38,36,34,0.5)"),z.addColorStop(.72,"rgba(70,66,62,0.28)"),z.addColorStop(.9,"rgba(238,233,224,0.32)"),z.addColorStop(1,"rgba(255,255,255,0)"),c.fillStyle=z,c.beginPath(),c.arc(M,w,x,0,Yt),c.fill()}for(let h=0;h<2600;h+=1){const x=(.6+Math.pow(y(),3)*4)*(n/1024);c.fillStyle=y()<.5?"rgba(255,255,255,0.16)":"rgba(30,28,26,0.16)",c.beginPath(),c.arc(y()*n,y()*o,x,0,Yt),c.fill()}return s}function yi(t,n){const{canvas:o,ctx:s}=co(t,n),c=s.createImageData(t,n),y=c.data,r=Be("#0f3f74"),h=Be("#2f8fb0"),x=Be("#3f7a45"),M=Be("#9a8a55"),w=Be("#f2f7fc");for(let z=0;z<n;z+=1){const S=z/n;for(let l=0;l<t;l+=1){const C=l/t,u=C*3.1,H=S*2.4,R=nn(u,H,4,5,4404)+(nn(u*3,H*3,12,3,4411)-.5)*.18,B=R>.55;let I;if(B){const we=tn((R-.55)*4.2);I=Bt(x,M,we*.7),we>.55&&(I=Bt(I,Be("#cfc9bb"),(we-.55)*1.6))}else I=Bt(r,h,tn((R-.35)*3.2));const $=Mn(.86,.98,Math.abs(S-.5)*2);$>0&&(I=Bt(I,w,$));const fe=nn(C*2,S*6,12,4,4423),G=Mn(.56,.82,fe)*.72;G>0&&(I=Bt(I,Be("#fbfdff"),G));const re=(z*t+l)*4;y[re]=I[0],y[re+1]=I[1],y[re+2]=I[2],y[re+3]=255}}return s.putImageData(c,0,0),o}function Mi(t,n,o,s){if(t==="earth")return yi(o,s);if(t==="moon"||t==="pluto"||t==="charon")return gi(t,o,s);const c=t==="saturn"?{...n,id:"saturn",ground:"#f2e2ba",ground2:"#c6a978",ground3:"#9b7f52"}:{...n,id:"jupiter",ground:"#e9d6b4",ground2:"#b57d50",ground3:"#8b5a38"};return tr(c,o,s)}function wi(t){const{canvas:o,ctx:s}=co(t,4),c=s.createImageData(t,4),y=c.data,r=1.11,h=2.36,x=Be("#f6efdd"),M=Be("#c9b48d"),w=Be("#6f6455"),z=[[1.11,1.235,.1,.15],[1.235,1.525,.42,.3],[1.525,1.95,.98,.62],[1.951,2.025,.06,.1],[2.025,2.21,.72,.5],[2.211,2.215,.04,.1],[2.215,2.27,.66,.46],[2.27,2.31,.06,.1],[2.315,2.34,.34,.55]];for(let S=0;S<t;S+=1){const l=S/(t-1),C=r+(h-r)*l;let u=0,H=.5;for(const[fe,G,re,we]of z)if(C>=fe&&C<=G){u=re,H=we,u*=.82+.18*Math.sin((C-fe)*820+Math.sin((C-fe)*140)*2);break}const R=[1.29,1.44,1.63,1.72,1.88,2.06,2.15,2.24,2.29];for(const fe of R)Math.abs(C-fe)<.0035&&(u*=.12);u*=.9+.14*Tn(Math.floor(C*900),3,9931);const B=Tn(Math.floor(S/2),7,9931);let I=Bt(M,x,H);I=Bt(I,w,(1-Math.min(1,u))*.35);const $=.82+B*.3;for(let fe=0;fe<4;fe+=1){const G=(fe*t+S)*4;y[G]=I[0]*$,y[G+1]=I[1]*$,y[G+2]=I[2]*$,y[G+3]=Math.round(tn(u)*255)}}return s.putImageData(c,0,0),o}const vn=new Map;function Qo(t,n,o,s,c,y){const r=new On(n);for(r.colorSpace=o?yn:Ia,r.wrapS=s?Aa:zr,r.wrapT=r.wrapS,r.anisotropy=c,r.magFilter=Pr,r.minFilter=Tr,r.generateMipmaps=!0,r.needsUpdate=!0,vn.set(t,r);vn.size>y;){const h=vn.keys().next();if(h.done)break;const x=vn.get(h.value);vn.delete(h.value),x?.dispose()}return r}function xi(t,n,o){const s=`ground:${t}:${n?"l":"h"}`,c=vn.get(s);return c||Qo(s,mi(t,n?320:512),!1,!0,o,6)}function bi(t,n,o){const s=`cloud:${t.id}:${n?"l":"h"}`,c=vn.get(s);return c||Qo(s,vi(t,n?512:1024),!0,!0,o,4)}function _s(t,n,o,s){const y=`body:${t??n.id}:${o?"l":"h"}`,r=vn.get(y);if(r)return r;const h=o?768:1024;return Qo(y,Mi(t,n,h,h/2),!0,!1,s,3)}function za(t,n){const o=`ring:${t?"l":"h"}`,s=vn.get(o);return s||Qo(o,wi(t?1024:2048),!0,!1,n,2)}const so=Math.PI/180,dn=1500,Oo=2800,Ws=-4.3;function Xo(t,n){const o=Math.sin(t*127.1+n*311.7)*43758.5453;return o-Math.floor(o)}function Na(t){return t*t*(3-2*t)}function Si(t,n){const o=Math.floor(t),s=Math.floor(n),c=t-o,y=n-s,r=Xo(o,s),h=Xo(o+1,s),x=Xo(o,s+1),M=Xo(o+1,s+1),w=Na(c),z=Na(y);return(r*(1-w)+h*w)*(1-z)+(x*(1-w)+M*w)*z}function jo(t,n,o=4){let s=0,c=.5,y=1;for(let r=0;r<o;r+=1)s+=c*Si(t*y,n*y),y*=2.03,c*=.5;return s}function oo(t){let n=t>>>0||1;return()=>(n=n*1664525+1013904223>>>0,n/4294967296)}function ki(t){let n=2166136261;for(let o=0;o<t.length;o+=1)n=Math.imul(n^t.charCodeAt(o),16777619);return n>>>0}function Pa(t,n){const o=t*so,s=n*so;return new U(Math.sin(o)*Math.cos(s),Math.sin(s),-Math.cos(o)*Math.cos(s)).normalize()}function zi(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d"),s=o.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.25,"rgba(255,236,196,0.72)"),s.addColorStop(.6,"rgba(255,190,110,0.18)"),s.addColorStop(1,"rgba(255,170,80,0)"),o.fillStyle=s,o.fillRect(0,0,128,128);const c=new On(n);return c.colorSpace=yn,c}const Pi=`
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
`,Ri=8,Ei=.55,Ls=.34;function Ni(t,n={}){const o=!!n.low,s=n.anisotropy??(o?4:8),c=new Le,y=[],r=m=>(y.push(m),m);let h=null,x=null;const M=ki(t.id),w=oo(M),z=r(zi()),S=[],l=[];let C=null,u=null,H=null;const R=[],B=[];if(t.terrain==="crater"){for(let m=0;m<(o?16:26);m+=1){const p=w()*Math.PI*2,P=20+Math.sqrt(w())*460,g=16+w()*74;R.push({x:Math.cos(p)*P,z:Math.sin(p)*P,r:g,d:g*(.16+w()*.2)})}for(let m=0;m<(o?26:48);m+=1){const p=w()*Math.PI*2,P=4+Math.pow(w(),.7)*150,g=2.5+Math.pow(w(),1.6)*11;R.push({x:Math.cos(p)*P,z:Math.sin(p)*P,r:g,d:g*(.2+w()*.22)})}}if(t.terrain==="volcano")for(let m=0;m<6;m+=1){const p=w()*Math.PI*2,P=60+w()*380;B.push({x:Math.cos(p)*P,z:Math.sin(p)*P,r:40+w()*90,h:12+w()*34})}if(t.terrain==="rock")for(let m=0;m<5;m+=1){const p=w()*Math.PI*2,P=60+w()*400;B.push({x:Math.cos(p)*P,z:Math.sin(p)*P,r:50+w()*110,h:6+w()*16})}function I(m,p,P,g=4){return(jo(m*P,p*P,g)-.48)*2}function $(m,p){if(t.terrain==="plasma"||t.terrain==="ring")return 0;const P=Math.hypot(m,p);let g=0;if(t.terrain==="crater"){g=I(m+11,p+7,.004,4)*16+I(m+3,p+17,.0012,2)*34+I(m+5,p+23,.026,3)*3;for(const oe of R){const te=Math.hypot(m-oe.x,p-oe.z)/oe.r;te<1&&(g-=oe.d*Math.pow(1-te*te,1.5)),te<1.3&&(g+=oe.d*.28*Math.exp(-Math.pow((te-1.02)/.17,2)))}}else if(t.terrain==="rock"){g=I(m+5,p+2,.0035,4)*40,g+=(1-Math.abs(I(m,p,.011,3)))*12,g+=I(m+21,p+13,.0011,2)*60,g+=I(m+31,p+41,.028,3)*3.4;for(const oe of B){const te=Math.hypot(m-oe.x,p-oe.z)/oe.r;te<1&&(g+=oe.h*Math.pow(1-te,1.7))}}else if(t.terrain==="volcano"){g=I(m+3,p+8,.005,4)*14+I(m+9,p+1,.0012,2)*22;for(const oe of B){const te=Math.hypot(m-oe.x,p-oe.z)/oe.r;te<1&&(g+=oe.h*Math.pow(1-te,1.25)),te<.24&&(g-=oe.h*.5*(1-te/.24))}}else t.terrain==="ice"?g=I(m+9,p+4,.003,4)*9+I(m,p,.012,2)*2.2+I(m+2,p+8,.035,3)*1.1:g=I(m+7,p+3,.0035,4)*12+I(m,p,.012,2)*2.6+I(m+4,p+2,.03,3)*3;const v=Math.max(0,P-1500)/500;g-=v*v*5;let J=0,E=0;for(const oe of S){const te=Math.hypot(m-oe.x,p-oe.z)/oe.r;te<1&&(J=Math.max(J,oe.d*Math.pow(1-te*te,1.55))),te<1.45&&(E=Math.max(E,oe.d*.3*Math.exp(-Math.pow((te-1.02)/.16,2))))}return g-=J,g+=E,g+=(jo(m*.09+1,p*.09+6,2)-.5)*(t.terrain==="rock"?1.2:t.terrain==="ice"?.25:.5),g}let fe=$(0,0);function G(m,p){return $(m,p)-fe}const re=(()=>{if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring")return{x:0,z:0};const m=[];for(let P=0;P<40;P+=1){const g=P/40*Math.PI*2,v=P%5*34,J=Math.cos(g)*v,E=Math.sin(g)*v;let oe=0;for(let te=0;te<8;te+=1){const Ue=te/8*Math.PI*2;oe+=G(J+Math.cos(Ue)*120,E+Math.sin(Ue)*120)}m.push({x:J,z:E,score:G(J,E)-oe/8})}m.sort((P,g)=>g.score-P.score);const p=m[Math.floor(m.length*.28)];return{x:p.x,z:p.z}})();fe=$(re.x,re.z);const we=t.cloudTop!==null?t.cloudTop:G(re.x,re.z),ie=1.7,N=Pa(t.sunAz,t.sunElev),ae=t.sunScale>0?.2667*t.sunScale*so:0,Ee=Math.max(0,Math.min(1,t.fogDensity*26)),Ie=new X(t.skyTop),xe=new X(t.skyBottom),at=new X(t.glow),D=r(new Qe({vertexShader:Pi,fragmentShader:Ti,side:ao,depthWrite:!1,uniforms:{uTop:{value:Ie.clone()},uBottom:{value:xe.clone()},uGlow:{value:at.clone()},uSun:{value:new X(t.sunColor)},uSunDir:{value:N.clone()},uSunRadius:{value:ae},uSunHaze:{value:Ee},uGlowGain:{value:t.glowGain}}})),ee=new O(r(new Re(Oo,32,20)),D);ee.frustumCulled=!1,c.add(ee);let ze=0;function tt(m){ze=Math.max(0,Math.min(1,m));const p=1-ze;D.uniforms.uTop.value.copy(Ie).multiplyScalar(p),D.uniforms.uBottom.value.copy(xe).multiplyScalar(p),D.uniforms.uGlow.value.copy(at).multiplyScalar(p),D.uniforms.uGlowGain.value=t.glowGain*p,D.uniforms.uSun.value.copy(new X(t.sunColor)).multiplyScalar(p),ke&&(ke.opacity=.85*Math.min(1,ze*1.6))}let ke=null;if(t.stars){const m=o?320:620,p=new Float32Array(m*3),P=oo(M^2654435769);for(let E=0;E<m;E+=1){const oe=P()*Math.PI*2,te=Math.pow(P(),.65)*.98+.02,Ue=Math.sqrt(1-te*te);p[E*3]=Math.cos(oe)*Ue*(Oo-200),p[E*3+1]=te*(Oo-200),p[E*3+2]=Math.sin(oe)*Ue*(Oo-200)}const g=r(new en);g.setAttribute("position",new gn(p,3));const v=r(new Ko({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1}));ke=v;const J=new qo(g,v);J.frustumCulled=!1,c.add(J)}const de=Math.min(1.5,.45+.9*Math.min(1,Math.max(t.sunScale,.02)*1.5)),ft=t.stars?.4:.46,yt=(m,p)=>{const g=-(G(m+.9,p)-G(m-.9,p))/1.8,v=-(G(m,p+.9)-G(m,p-.9))/(2*.9),J=1/Math.sqrt(g*g+1+v*v),E=Math.max(0,(g*N.x+N.y+v*N.z)*J);return ft+de*E};let Ne=[],pt=null;if(t.terrain==="plasma"){const m=r(new Qe({vertexShader:Ai,fragmentShader:Ci,uniforms:{uTime:{value:0},uA:{value:new X(t.ground)},uB:{value:new X(t.ground2)},uC:{value:new X(t.ground3)}}}));pt=m;const p=new O(r(new Mo(2400,2400,1,1)),m);p.rotation.x=-Math.PI/2,p.position.y=0,c.add(p)}else if(t.terrain!=="ring")if(t.cloudTop!==null){const m=bi(t,o,s),p=Math.min(1.12,.55+.5*Math.min(1,Math.max(t.sunScale,.02)*2)),P=(E,oe)=>r(new Qe({vertexShader:ci,fragmentShader:li,uniforms:{uMap:{value:m},uOffset:{value:new bo(0,0)},uTile:{value:E},uDetail:{value:11},uTint:{value:new X().setScalar(oe)},uOpacity:{value:1},uFogColor:{value:new X(t.fog)},uFogDensity:{value:t.fogDensity}}})),g=new O(r(new Mo(5200,5200,1,1)),P(Is,p));g.rotation.x=-Math.PI/2,g.position.y=t.cloudTop,c.add(g),Ne=[g.material];const v=P(Is*.42,p*.86);v.uniforms.uOpacity.value=.55,v.transparent=!0,v.depthWrite=!1;const J=new O(r(new Mo(5200,5200,1,1)),v);J.rotation.x=-Math.PI/2,J.position.y=t.cloudTop-90,c.add(J),Ne.push(v)}else{const m=o?96:150,p=r(new Mo(dn*2,dn*2,m,m));p.rotateX(-Math.PI/2);const P=p.attributes.position,g=new Float32Array(P.count*3),v=new X(t.ground),J=new X(t.ground2),E=new X(t.ground3),oe=new gn(g,3),te=new X,Ue=ue=>{const be=P.getX(ue),Ge=P.getZ(ue),je=G(be,Ge);P.setY(ue,je);const et=jo(be*.02+3,Ge*.02+9,3);te.copy(v).lerp(J,Na(Math.min(1,Math.max(0,(et-.28)/.5)))),je<-1.6&&te.lerp(E,Math.min(1,(-je-1.6)/7));const Te=jo(be*.0045+17,Ge*.0045+41,3),it=Math.min(1.9,yt(be,Ge))*(.9+(et-.5)*.22)*(.84+Te*.34);let $e=1;for(const Ze of S){const Xe=Math.hypot(be-Ze.x,Ge-Ze.z)/Ze.r;if(Xe>1.5)continue;const st=Math.min(1,Math.max(0,1-Xe/1.35));$e*=1-.62*st*st}g[ue*3]=te.r*it*$e,g[ue*3+1]=te.g*it*$e*.94,g[ue*3+2]=te.b*it*$e*.9};for(let ue=0;ue<P.count;ue+=1){const be=P.getX(ue)/dn,Ge=P.getZ(ue)/dn,je=Math.sign(be)*Math.pow(Math.abs(be),1.8)*dn,et=Math.sign(Ge)*Math.pow(Math.abs(Ge),1.8)*dn;P.setXYZ(ue,je,0,et),Ue(ue)}p.setAttribute("color",oe),p.computeVertexNormals();const mt=xi(t.terrain,o,s),ve=1/(mt.image.width||512),vt=r(new Qe({vertexShader:ri,fragmentShader:ii,vertexColors:!0,side:ot,uniforms:{uMap:{value:mt},uTexel:{value:ve},uTile:{value:Qs},uDetail:{value:5.6},uBump:{value:9},uGloss:{value:t.terrain==="ice"?.9:.25},uSunDir:{value:N.clone()},uSunColor:{value:new X(t.sunColor)},uFogColor:{value:new X(t.fog)},uFogDensity:{value:t.fogDensity},uAmbient:{value:ft},uSunPower:{value:de}}})),En=new O(p,vt);c.add(En);const qt=dn*2/m,xn=m+1;x=(ue,be)=>{const Ge=(ue+dn)/qt,je=(be+dn)/qt;if(Ge<0||je<0||Ge>=m||je>=m)return G(ue,be);const et=Math.floor(Ge),Te=Math.floor(je),it=Ge-et,$e=je-Te,Ze=Te*xn+et,Xe=P.getY(Ze),st=P.getY(Ze+1),Ct=P.getY(Ze+xn),Lt=P.getY(Ze+xn+1);return it+$e<=1?Xe+(st-Xe)*it+(Ct-Xe)*$e:Lt+(Ct-Lt)*(1-it)+(st-Lt)*(1-$e)};const At=oo(M^2135587861),Nn=[t.ground2,t.ground3,t.ground].map(ue=>new X(ue).multiplyScalar(ft+de*.75)),Wt=new wo,lo=ue=>{Wt.position.set(ue.x,ue.y,ue.z),Wt.rotation.set(ue.rx,ue.ry,ue.rz),Wt.scale.set(ue.sx,ue.sy,ue.sz),Wt.updateMatrix(),ue.mesh.setMatrixAt(ue.index,Wt.matrix)},un=(ue,be,Ge,je,et,Te,it)=>{const $e=new Jo(ue,r(new he({color:16777215})),be);$e.instanceMatrix.setUsage(Ta);for(let Ze=0;Ze<be;Ze+=1){const Xe=At()*Math.PI*2,st=Ge+Math.sqrt(At())*(je-Ge),Ct=re.x+Math.cos(Xe)*st,Lt=re.z+Math.sin(Xe)*st,Xt=et+Math.pow(At(),2.1)*(Te-et),bn=G(Ct,Lt),Sn=Xt*(.45+At()*.5),Ut={mesh:$e,index:Ze,x:Ct,z:Lt,y:bn+Xt*it,base:bn,relief:0,liftY:Xt*it,sx:Xt*(.8+At()*.7),sy:Sn,sz:Xt*(.8+At()*.7),rx:At()*3,ry:At()*3,rz:At()*3,fly:!1,vx:0,vy:0,vz:0,spin:new U};Ut.relief=Ut.y+Sn*.72-bn,l.push(Ut),lo(Ut),$e.setColorAt(Ze,Nn[Ze%3])}$e.instanceMatrix.needsUpdate=!0,$e.instanceColor&&($e.instanceColor.needsUpdate=!0),c.add($e)};if(un(r(new hn(1,0)),o?90:170,1.2,60,.02,.22,.35),un(r(new hn(1,1)),o?30:54,2,120,.18,1.1,.34),un(r(new hn(1,1)),o?10:18,6,190,.6,2.4,.4),u=(ue,be,Ge)=>{const je=Ge*2.4;for(let et=0;et<P.count;et+=1){const Te=P.getX(et)-ue,it=P.getZ(et)-be;Te*Te+it*it>je*je||Ue(et)}P.needsUpdate=!0,oe.needsUpdate=!0,p.computeVertexNormals()},C=()=>{for(let ue=0;ue<P.count;ue+=1)Ue(ue);P.needsUpdate=!0,oe.needsUpdate=!0,p.computeVertexNormals()},H=(ue,be,Ge)=>{const je=Ge*1.2,et=Ge*2.3;for(const Te of l){const it=Te.x-ue,$e=Te.z-be,Ze=Math.hypot(it,$e);if(!(Ze>et)){if(Te.base=G(Te.x,Te.z),Te.y=Te.base+Te.liftY,Te.relief=Te.y+Te.sy*.72-Te.base,Ze<je&&Te.sy>.16){const Xe=Ze>.001?Ze:1,st=12+Math.random()*26;Te.fly=!0,Te.vx=it/Xe*st,Te.vz=$e/Xe*st,Te.vy=9+Math.random()*20,Te.spin.set((Math.random()-.5)*9,(Math.random()-.5)*9,(Math.random()-.5)*9)}lo(Te),Te.mesh.instanceMatrix.needsUpdate=!0}}},t.terrain==="ice"){const ue=[],be=oo(M^1542469173),Ge=(et,Te,it,$e,Ze,Xe)=>{let st=et,Ct=Te,Lt=it;for(let Xt=0;Xt<$e;Xt+=1){const bn=st+Math.cos(Lt)*Ze,Sn=Ct+Math.sin(Lt)*Ze;ue.push(st,G(st,Ct)+.06,Ct,bn,G(bn,Sn)+.06,Sn),st=bn,Ct=Sn,Lt+=(be()-.5)*.9,Xe>0&&Xt===$e>>1&&be()<.7&&Ge(st,Ct,Lt+(be()<.5?.9:-.9),Math.max(3,$e>>2),Ze*.8,Xe-1)}};for(let et=0;et<(o?6:10);et+=1)Ge((be()-.5)*300,(be()-.5)*300,be()*Math.PI*2,14,14,1);const je=r(new en);je.setAttribute("position",new gn(new Float32Array(ue),3)),c.add(new Zs(je,r(new xo({color:t.ground3,transparent:!0,opacity:.75}))))}}if(t.terrain==="ring"){const m=new Le;m.position.copy(Pa(t.companionAz,0)).multiplyScalar(2600);const p=Ws;m.position.y=p;const P=480,g=P*1.11,v=P*2.36,J=new O(r(new Re(P,o?64:128,o?44:80)),r(new Qe({vertexShader:Ds,fragmentShader:Fs,uniforms:{uMap:{value:_s("saturn",t,o,s)},uLimb:{value:.4},uRim:{value:new X("#e8dcbc")}}})));m.add(J);const E=r(new Qe({vertexShader:no,fragmentShader:Sa,transparent:!0,side:ot,depthWrite:!1,uniforms:{uProfile:{value:za(o,s)},uInner:{value:g},uOuter:{value:v},uAlpha:{value:o?.78:.88}}})),oe=new O(r(new gt(g,v,o?128:220,1)),E);oe.rotation.x=-Math.PI/2,oe.position.y=p,m.add(oe),c.add(m);const te=o?220:420,Ue=r(new hn(1,0)),mt=r(new he({color:"#dfe8f2"})),ve=new Jo(Ue,mt,te);ve.instanceMatrix.setUsage(Ta);const vt=oo(M^1374496523),En=[],qt=new wo;for(let Wt=0;Wt<te;Wt+=1){const un=Wt%31===0?.5+vt()*1.3:.05+Math.pow(vt(),2)*.55,ue=14+Math.pow(vt(),.7)*150,be=vt()*Math.PI*2,Ge=(vt()-.5)*14;En.push({r:ue,a:be,y:Ge,spin:.02+vt()*.08,size:un,wob:vt()*Math.PI*2}),qt.position.set(Math.cos(be)*ue,Ge,Math.sin(be)*ue),qt.rotation.set(vt()*3,vt()*3,vt()*3),qt.scale.setScalar(un),qt.updateMatrix(),ve.setMatrixAt(Wt,qt.matrix);const je=.5+vt()*.45;ve.setColorAt(Wt,new X(je,je*.98,je*1.05))}ve.instanceMatrix.needsUpdate=!0,ve.instanceColor&&(ve.instanceColor.needsUpdate=!0),c.add(ve),h={mesh:ve,data:En};const xn=r(new Qe({vertexShader:no,fragmentShader:Bo,transparent:!0,side:ot,depthWrite:!1,uniforms:{uInner:{value:.6},uOuter:{value:2600-v-10},uBands:{value:260},uA:{value:new X("#e2eaf4")},uB:{value:new X("#c3cfdd")},uAlpha:{value:.92},uGrain:{value:.26}}})),At=2600-v-10,Nn=new O(r(new gt(.6,At,128,1)),xn);Nn.rotation.x=-Math.PI/2,Nn.position.y=p,c.add(Nn)}if(t.ring){const m=t.ring==="uranus",p=m?210:170,P=m?520:560,g=m?82*so:27*so,v=m?140:54,J=r(m?new Qe({vertexShader:no,fragmentShader:Bo,transparent:!0,side:ot,depthWrite:!1,uniforms:{uInner:{value:p},uOuter:{value:P},uBands:{value:v},uA:{value:new X("#9fd0d6")},uB:{value:new X("#cdeef2")},uAlpha:{value:.5},uGrain:{value:.4}}}):new Qe({vertexShader:no,fragmentShader:Sa,transparent:!0,side:ot,depthWrite:!1,uniforms:{uProfile:{value:za(o,s)},uInner:{value:p},uOuter:{value:P},uAlpha:{value:.82}}})),E=new O(r(new gt(p,P,o?64:128,1)),J);if(E.rotation.x=-Math.PI/2+g,E.position.y=m?30:90,c.add(E),m){const oe=r(new Qe({vertexShader:no,fragmentShader:Bo,transparent:!0,side:ot,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new X("#dff6f8")},uB:{value:new X("#bfe6ea")},uAlpha:{value:.35},uGrain:{value:.3}}})),te=new O(r(new gt(130,175,64,1)),oe);te.rotation.x=-Math.PI/2+g,te.position.y=30,c.add(te)}}if(t.companion&&t.terrain!=="ring"){const p=Math.max(6,Math.tan(t.companionSize/2*so)*1500),P=new Le;P.position.copy(Pa(t.companionAz,t.companionElev)).multiplyScalar(1500);const g=_s(t.companion,t,o,s),v=new O(r(new Re(p,o?48:72,o?32:48)),r(new Qe({vertexShader:Ds,fragmentShader:Fs,uniforms:{uMap:{value:g},uLimb:{value:.42},uRim:{value:new X(t.companion==="earth"?"#9fd0ff":"#cfe0f2")}}})));if(v.lookAt(0,0,0),P.add(v),t.companion==="saturn"||t.companion==="jupiter"){const E=t.companion==="saturn",oe=r(new Qe({vertexShader:no,fragmentShader:E?Sa:Bo,transparent:!0,side:ot,depthWrite:!1,uniforms:E?{uProfile:{value:za(o,s)},uInner:{value:p*1.12},uOuter:{value:p*2.36},uAlpha:{value:.7}}:{uInner:{value:p*1.3},uOuter:{value:p*1.7},uBands:{value:16},uA:{value:new X("#d9c7a8")},uB:{value:new X("#b09070")},uAlpha:{value:.18},uGrain:{value:.3}}})),te=new O(r(new gt(p*(E?1.12:1.3),p*(E?2.36:1.7),64,1)),oe);te.rotation.x=-Math.PI/2+.32,P.add(te)}const J=new ro(r(new io({map:z,color:new X(t.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:Oe})));J.scale.setScalar(p*4),P.add(J),c.add(P)}const Ht=t.terrain!=="ring",ce=(m,p)=>t.terrain==="ring"?Ws:t.cloudTop!==null?t.cloudTop:G(m,p),se=$r({sunDir:N,ambient:Math.min(1.05,ft+.24),sunPower:de});c.add(se.group),se.setVisible(!1);const on=si({floorAt:ce,heightAt:G,onImpact:n.onImpact,onScar:(m,p)=>_t(m,p)});c.add(on.group);const Ot=o?140:t.particles==="haze"?120:300;let $t=null,K=null;if(t.particles!=="none"){const m=new Float32Array(Ot*3);K=new Float32Array(Ot*3);const p=oo(M^625341585);for(let J=0;J<Ot;J+=1){const E=p()*Math.PI*2,oe=Math.sqrt(p())*55,te=t.particles;let Ue=p()*22;te==="spark"&&(Ue=p()*14),te==="haze"&&(Ue=2+p()*26),m[J*3]=Math.cos(E)*oe,m[J*3+1]=Ue,m[J*3+2]=Math.sin(E)*oe;const mt=te==="wind"?42+p()*34:te==="rain"?12+p()*6:te==="spark"?2+p()*4:1.2+p()*2.6;K[J*3]=te==="wind"?mt:(p()-.5)*mt*.5,K[J*3+1]=te==="rain"?-mt:te==="spark"?mt:te==="snow"?-.6-p()*.9:(p()-.5)*.4,K[J*3+2]=te==="wind"?mt*.25:(p()-.5)*mt*.4}$t=r(new en),$t.setAttribute("position",new gn(m,3));const P=t.particles==="haze"?2.6:t.particles==="dust"?.14:t.particles==="rain"?.09:t.particles==="snow"?.11:.16,g=r(new Ko({color:new X(t.particleColor),size:P,transparent:!0,opacity:t.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:t.particles==="spark"?Oe:void 0})),v=new qo($t,g);v.frustumCulled=!1,c.add(v)}const Z=r(new hn(.26,0)),V=r(new Re(.24,16,12)),ne=t.cloudTop===null&&t.terrain!=="plasma",pe=[],j=[],F=[];function le(m,p,P,g){const v=new ro(r(new io({map:z,color:new X(p),transparent:!0,opacity:.9,depthWrite:!1,blending:Oe})));v.position.copy(m),v.scale.setScalar(P),c.add(v),j.push({sprite:v,life:g,max:g,grow:P*2.4})}function Tt(m,p){const P=new O(r(new gt(.28,.5,24,1)),r(new he({color:new X(p),transparent:!0,opacity:.6,depthWrite:!1,side:ot})));P.rotation.x=-Math.PI/2,P.position.copy(m),c.add(P),F.push({mesh:P,life:.7})}function Mt(m,p){const P=re.x+m,g=re.z+p,v=t.cloudTop!==null?t.cloudTop:G(P,g),J=ne?new he({color:new X("#c9c2b4").multiplyScalar(ft+de*.8),transparent:!0}):new he({color:new X("#ffb45e"),transparent:!0}),E=new O(ne?Z:V,J);E.position.set(P,v+4.2,g),E.scale.setScalar(.9+Math.random()*.35),c.add(E);const oe=t.gravityMps2<=.01;if(pe.push({mesh:E,x:P,z:g,y:oe?v+.6:v+4.2,vy:oe?.12:0,vx:oe?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:oe?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),pe.length>6){const te=pe.shift();te&&(c.remove(te.mesh),te.mesh.material.dispose())}}function ln(m,p){const P=new U(m.x,p+.2,m.z);if(t.gravityMps2<=.01){m.outcome="float",m.landed=!0,m.resting=5.5,n.onLand?.({seconds:m.fall,bounces:0,outcome:"float"});return}if(t.terrain==="plasma"){m.outcome="vapor",m.landed=!0,m.resting=.25,le(P,"#fff2c0",1.2,.6),n.onLand?.({seconds:m.fall,bounces:0,outcome:"vapor"});return}if(t.cloudTop!==null){m.outcome="sink",m.landed=!0,m.resting=1.6,le(P,"#ffffff",1.6,.7),n.onLand?.({seconds:m.fall,bounces:0,outcome:"sink"});return}if(m.bounces+=1,Tt(P,t.ground2),m.bounces===1&&n.onLand?.({seconds:m.fall,bounces:1,outcome:"bounce"}),m.bounces>=4||Math.abs(m.vy)<1.3){m.landed=!0,m.outcome="bounce",m.resting=1.6,m.vy=0;return}m.vy=Math.abs(m.vy)*.42,m.y=p+.26,m.vx*=.6,m.vz*=.6}const Zt=new wo,So=new X("#31090d"),An=new X("#180509"),ea=new X("#ff3a10");function ko(m,p){on.update(m,p);const P=on.doom();D.uniforms.uTop.value&&(D.uniforms.uTop.value.copy(Ie).lerp(So,P),D.uniforms.uBottom.value.copy(xe).lerp(An,P),D.uniforms.uGlow.value.copy(at).lerp(ea,P)),ke&&(ke.opacity=.85*(1-P*.85)),pt&&(pt.uniforms.uTime.value=m);for(let g=0;g<Ne.length;g+=1){const v=Ne[g].uniforms.uOffset.value;v.x=(v.x+p*(g===0?.006:.012))%1}if(h){const{mesh:g,data:v}=h;for(let J=0;J<v.length;J+=1){const E=v[J];E.a+=E.spin*p*.05,Zt.position.set(Math.cos(E.a)*E.r,E.y+Math.sin(m*.25+E.wob)*.5,Math.sin(E.a)*E.r),Zt.rotation.set(m*.08+E.wob,m*.11+E.a,E.wob),Zt.scale.setScalar(E.size),Zt.updateMatrix(),g.setMatrixAt(J,Zt.matrix)}g.instanceMatrix.needsUpdate=!0}if($t&&K){const g=$t.attributes.position,v=g.array;for(let J=0;J<g.count;J+=1){const E=J*3;v[E]+=K[E]*p,v[E+1]+=K[E+1]*p,v[E+2]+=K[E+2]*p,t.particles==="rain"||t.particles==="snow"?v[E+1]<0&&(v[E+1]=22):t.particles==="spark"?v[E+1]>20&&(v[E+1]=0):(v[E+1]<0&&(v[E+1]=24),v[E+1]>26&&(v[E+1]=0)),v[E]>60&&(v[E]=-60),v[E]<-60&&(v[E]=60),v[E+2]>60&&(v[E+2]=-60),v[E+2]<-60&&(v[E+2]=60)}g.needsUpdate=!0}for(let g=pe.length-1;g>=0;g-=1){const v=pe[g],J=t.cloudTop!==null?t.cloudTop:G(v.x,v.z);if(v.landed)v.resting>0?(v.resting-=p,v.outcome==="sink"?(v.y-=p*2.4,v.mesh.scale.multiplyScalar(1-p*.8)):v.outcome==="vapor"?v.mesh.scale.multiplyScalar(1-p*3):v.mesh.scale.multiplyScalar(1-p*.25)):(v.fade-=p*1.4,v.mesh.material.opacity=Math.max(0,v.fade),v.mesh.scale.multiplyScalar(1-p*.9),v.fade<=0&&(c.remove(v.mesh),v.mesh.material.dispose(),pe.splice(g,1)));else{if(v.fall+=p,t.gravityMps2<=.01){v.x+=v.vx*p,v.z+=v.vz*p,v.y+=v.vy*p,v.mesh.rotation.x+=p*.6,v.mesh.rotation.y+=p*.45,v.mesh.position.set(v.x,v.y,v.z),v.fall>.05&&ln(v,v.y);continue}v.vy-=t.gravityMps2*p,v.y+=v.vy*p,v.x+=v.vx*p,v.z+=v.vz*p,v.mesh.rotation.x+=p*3.2,v.mesh.rotation.z+=p*2.1,v.y-.26<=J&&(v.y=J+.26,ln(v,J))}v.mesh.position.set(v.x,v.y,v.z)}for(const g of l){if(!g.fly)continue;const v=Math.max(1.2,t.gravityMps2);g.vy-=v*p,g.x+=g.vx*p,g.y+=g.vy*p,g.z+=g.vz*p,g.vx*=1-p*.25,g.vz*=1-p*.25,g.rx+=g.spin.x*p,g.ry+=g.spin.y*p,g.rz+=g.spin.z*p;const J=G(g.x,g.z)+g.sy*.72;g.y<=J&&(g.y=J,g.fly=!1,g.vx=0,g.vy=0,g.vz=0,g.base=G(g.x,g.z),g.liftY=g.y-g.sy*.72-g.base,g.relief=g.y+g.sy*.72-g.base),zo(g),g.mesh.instanceMatrix.needsUpdate=!0}for(let g=j.length-1;g>=0;g-=1){const v=j[g];v.life-=p;const J=1-v.life/v.max;v.sprite.scale.setScalar(v.sprite.scale.x+(v.grow-v.sprite.scale.x)*Math.min(1,p*6)),v.sprite.material.opacity=Math.max(0,.9*(1-J)),v.life<=0&&(c.remove(v.sprite),j.splice(g,1))}for(let g=F.length-1;g>=0;g-=1){const v=F[g];v.life-=p,v.mesh.scale.multiplyScalar(1+p*3.4),v.mesh.material.opacity=Math.max(0,v.life/.7)*.6,v.life<=0&&(c.remove(v.mesh),F.splice(g,1))}}function _t(m,p){if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring"||!u)return 0;const P=22+Math.random()*6,g=Math.max(1.4,G(m,p)+26),v=Math.min(4.8+Math.random()*1.2,g);return S.push({x:m,z:p,r:P,d:v}),S.length>Ri&&(S.shift(),C?.()),u(m,p,P),H?.(m,p,P),P}const Cn=new wo;function zo(m){Cn.position.set(m.x,m.y,m.z),Cn.rotation.set(m.rx,m.ry,m.rz),Cn.scale.set(m.sx,m.sy,m.sz),Cn.updateMatrix(),m.mesh.setMatrixAt(m.index,Cn.matrix)}function Rn(m,p){let P=m,g=p,v=0;for(const J of l){if(J.fly)continue;const E=Math.max(J.sx,J.sz);if(E<.04)continue;let oe=P-J.x,te=g-J.z;const Ue=Math.hypot(oe,te);if(!(Ue>E+1.2)){if(J.relief<=Ei)Ue<E*.95&&(v=Math.max(v,J.relief));else if(Ue<E+Ls){Ue<1e-4&&(oe=0,te=1);const mt=Math.max(1e-4,Math.hypot(oe,te)),ve=E+Ls-Ue;P+=oe/mt*ve,g+=te/mt*ve}}}return{x:P,z:g,rise:v}}const wn=(m,p)=>{const g=-(G(m+.9,p)-G(m-.9,p))/1.8,v=-(G(m,p+.9)-G(m,p-.9))/(2*.9);return new U(g,1,v).normalize()};function ta(){se.dispose(),on.dispose();for(const m of j)c.remove(m.sprite);for(const m of F)c.remove(m.mesh);for(const m of pe)c.remove(m.mesh),m.mesh.material.dispose();y.forEach(m=>m.dispose()),c.clear()}return{group:c,eyeY:we+ie,eyeHeight:ie,groundY:we,standX:re.x,standZ:re.z,heightAt:G,floorAt:ce,solidFloor:Ht,walkable:t.cloudTop===null&&t.terrain!=="ring",avatar:se,impact:on,scar:_t,walk:Rn,normalAt:wn,scarCount:()=>S.length,atmosphere:tt,meshHeightAt:(m,p)=>x?x(m,p):G(m,p),update:ko,drop:Mt,dispose:ta}}const Di="models/rocket/",Fi="textures/rocket/",Us={engine:"engine-cluster",stage1:"first-stage-core",inter:"interstage",stage2:"second-stage",fairing:"payload-fairing",fins:"grid-fin-set",mount:"launch-mount",deflector:"flame-deflector",gantryBase:"gantry-base",gantryTower:"gantry-tower",strongback:"strongback",mast:"lightning-mast",flood:"floodlight"},Zo=4.4;let Gs=null,Vs=null;function Ii(){return Vs??=(async()=>{const t=new Ks,n=async(z,S)=>{const l=await t.loadAsync(`${Fi}${z}.webp`);return l.wrapS=Aa,l.wrapT=Aa,l.colorSpace=S?yn:Ia,l.anisotropy=8,l},[o,s,c,y,r,h,x,M,w]=await Promise.all([n("hull_color",!0),n("hull_normal",!1),n("hull_rough",!1),n("tile_color",!0),n("tile_normal",!1),n("tile_rough",!1),n("steel_color",!0),n("steel_normal",!1),n("steel_rough",!1)]);return{hullColor:o,hullNormal:s,hullRough:c,tileColor:y,tileNormal:r,tileRough:h,steelColor:x,steelNormal:M,steelRough:w}})(),Vs}function _i(){return Gs??=(async()=>{const t=new Ar,n=new Map;return await Promise.all(Object.keys(Us).map(async o=>{const s=await t.loadAsync(`${Di}${Us[o]}.glb`);n.set(o,s.scene)})),n})(),Gs}function Wi(t,n){const o=(c,y,r,h,x,M)=>new Ra({map:c,normalMap:y,roughnessMap:r,color:h,metalness:x,roughness:M,envMap:n,envMapIntensity:1.15}),s=(c,y,r)=>new Ra({color:c,metalness:y,roughness:r,envMap:n,envMapIntensity:.9});return{white:o(t.hullColor,t.hullNormal,t.hullRough,15659766,.88,.62),cryo:o(t.hullColor,t.hullNormal,t.hullRough,12175834,.82,.55),charcoal:o(t.tileColor,t.tileNormal,t.tileRough,10132122,.38,.72),steel:o(t.steelColor,t.steelNormal,t.steelRough,12764876,.8,.5),red:s(11942448,.3,.55),yellow:s(14197788,.35,.5),concrete:s(11051930,.05,.92),glass:s(3030348,.55,.25)}}function Li(t,n,o){t.traverse(s=>{const c=s;if(!c.isMesh)return;const y=c.geometry,r=y.getAttribute("position");if(!r)return;const h=new Float32Array(r.count*2);for(let x=0;x<r.count;x+=1){const M=r.getX(x),w=r.getY(x),z=r.getZ(x);h[x*2]=(Math.atan2(M,z)/(Math.PI*2)+.5)*n,h[x*2+1]=w*o}y.setAttribute("uv",new gn(h,2))})}function Ui(t,n){t.traverse(o=>{const s=o;if(!s.isMesh)return;const c=s.geometry,y=c.getAttribute("position");if(!y)return;const r=new Float32Array(y.count*2);for(let h=0;h<y.count;h+=1)r[h*2]=(y.getX(h)+y.getZ(h))*n,r[h*2+1]=y.getY(h)*n;c.setAttribute("uv",new gn(r,2))})}function Bs(t,n){t.traverse(o=>{const s=o;if(!s.isMesh)return;const c=s.material;Array.isArray(c)?s.material=c.map(y=>n[y.name]??n.steel):s.material=n[c?.name??"steel"]??n.steel})}function Gi(t,n){if(typeof document>"u")return null;const o=document.createElement("canvas");o.width=128,o.height=64;const s=o.getContext("2d");if(!s)return null;const c=s.createLinearGradient(0,0,0,64),y=new X("#8d8a84"),r=new X(n.ground).lerp(y,.5).getStyle(),h=new X(n.ground2??n.ground).lerp(y,.5).getStyle();c.addColorStop(0,n.skyTop),c.addColorStop(.5,n.skyBottom),c.addColorStop(.53,r),c.addColorStop(1,h),s.fillStyle=c,s.fillRect(0,0,128,64);const x=(n.sunAz/360%1+1)%1*128,M=32-n.sunElev/90*26,w=s.createRadialGradient(x,M,0,x,M,n.sunScale>0?18:.1);w.addColorStop(0,n.sunColor),w.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=w,s.fillRect(0,0,128,64);const z=new On(o);z.mapping=Cr,z.colorSpace=yn;const S=new Rr(t),l=S.fromEquirectangular(z).texture;return S.dispose(),z.dispose(),l}const Vi=`
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
`;function Oi(){const n=document.createElement("canvas");n.width=96,n.height=96;const o=n.getContext("2d");if(o){const c=o.createRadialGradient(48,48,2,48,48,48);c.addColorStop(0,"rgba(255,255,255,0.95)"),c.addColorStop(.45,"rgba(240,240,240,0.5)"),c.addColorStop(1,"rgba(230,230,230,0)"),o.fillStyle=c,o.fillRect(0,0,96,96)}const s=new On(n);return s.colorSpace=yn,s}async function Xi(t,n){const[o,s]=await Promise.all([_i(),Ii()]),c=Gi(t,n),y=Wi(s,c),r=new Le;r.name="rocket-pad";const h=D=>{const ee=o.get(D);if(!ee)throw new Error(`rocket part ${D}`);return ee.clone(!0)},x=(D,ee,ze=0,tt=0,ke=0)=>{const de=h(ee);return de.position.set(tt,ze,ke),D.add(de),de},M=new Le;r.add(M),x(M,"mount",0,0,0),x(M,"deflector",-1.9,0,0),x(M,"gantryBase",0,-11.5,1.5),x(M,"gantryTower",7.71,-11.5,1.5),x(M,"gantryTower",14.94,-11.5,1.5),x(M,"strongback",6.19,-7.4,-.4),x(M,"mast",0,-19,-8),x(M,"flood",0,13,7),x(M,"flood",0,-13,9),Bs(M,y),Ui(M,.2);const w=[];M.traverse(D=>{/^clamp-[a-d]$/.test(D.name)&&w.push(D)});const z=new Le;z.position.y=Zo,r.add(z),x(z,"engine",0),x(z,"stage1",3),x(z,"fins",23.2),x(z,"inter",27),x(z,"stage2",30.6),x(z,"fairing",42.9).traverse(D=>{(D.name==="fairing-a"||D.name==="fairing-b")&&(D.position.x=0,D.name==="fairing-b"&&(D.scale.x=-1))}),Bs(z,y),Li(z,7,.3);const l=new Le,C={uTime:{value:0},uPower:{value:0},uCore:{value:new X("#fff6dd")},uEdge:{value:new X("#ff9a3a")}},u=new Qe({uniforms:C,vertexShader:Vi,fragmentShader:Bi,transparent:!0,blending:Oe,depthWrite:!1,side:ot}),H=new O(new Ca(2.5,26,20,4,!0),u);H.rotation.x=Math.PI,H.position.y=-1;const R=new O(new Ca(1.35,15,18,3,!0),u);R.rotation.x=Math.PI,R.position.y=-1,l.add(H,R),l.visible=!1,z.add(l);const B=new qs(16756848,0,110,0);B.position.set(0,2,0),z.add(B);const I=Oi(),$=[],fe=[],G=new io({map:I,transparent:!0,opacity:.5,depthWrite:!1,color:new X("#d8d3cc")}),re=(D,ee,ze,tt,ke,de,ft)=>{let yt=fe.pop();yt||(yt=new ro(G)),yt.visible=!0,yt.position.set(D,ee,ze),yt.scale.setScalar(tt),yt.material=G,r.add(yt),$.push({sprite:yt,life:ke,max:ke,vx:(Math.random()-.5)*de,vy:ft*(.6+Math.random()*.8),vz:(Math.random()-.5)*de,spin:(Math.random()-.5)*.8,grow:tt*(1.8+Math.random()*1.4)})};let we=0,ie=0,N=0,ae=0,Ee=0,Ie=0,xe=0;return{group:r,rocket:z,light:B,setBase(D,ee,ze){we=D,ie=ee,N=ze,r.position.set(D,ze,ee)},baseX:()=>we,baseZ:()=>ie,setLift(D){Ee=D,z.position.y=Zo+D},setThrottle(D){ae=Math.max(0,Math.min(1,D)),l.visible=ae>.01,C.uPower.value=ae,B.intensity=ae*90},setPadVisible(D){M.visible=D},setFacing(D){r.rotation.y=D},setClamps(D){Ie=Math.max(0,Math.min(1,D));for(const ee of w){const ze=ee.position.x,tt=ee.position.z,ke=Math.atan2(ze,tt),de=new U(Math.cos(ke),0,-Math.sin(ke));ee.quaternion.setFromAxisAngle(de,Ie*.62)}},update(D,ee,ze){C.uTime.value=D;const tt=1+Math.min(1.6,ze/180);if(l.scale.set(1,tt,1),l.rotation.y=D*2.4,ae>.05&&ze<90)for(xe+=ee*(6+ae*22);xe>1;){xe-=1;const ke=Math.random()*Math.PI*2,de=2+Math.random()*3.4;re(we+Math.cos(ke)*de,N+Zo+Ee*.06+Math.random()*3,ie+Math.sin(ke)*de,2.6+Math.random()*3.2,1.5+Math.random()*1.6,9+ae*16,3+ae*8)}for(let ke=$.length-1;ke>=0;ke-=1){const de=$[ke];de.life-=ee;const ft=1-de.life/de.max;de.sprite.position.x+=de.vx*ee,de.sprite.position.y+=de.vy*ee,de.sprite.position.z+=de.vz*ee,de.vy+=ee*.6,de.vx*=1-ee*.6,de.vz*=1-ee*.6,de.sprite.scale.setScalar(Er.lerp(de.sprite.scale.x,de.grow,Math.min(1,ee*1.6))),de.sprite.material.opacity=Math.max(0,.5*(1-ft)*(1-ft)),de.sprite.material.rotation+=de.spin*ee,de.life<=0&&(de.sprite.visible=!1,fe.push(de.sprite),$.splice(ke,1))}},dispose(){for(const D of $)r.remove(D.sprite),D.sprite.visible=!1;$.length=0,I.dispose(),G.dispose(),u.dispose(),H.geometry.dispose(),R.geometry.dispose();for(const D of Object.values(y))D.dispose()}}}let Os=null;function _a(){if(typeof window>"u")return null;const t=window.AudioContext||window.webkitAudioContext;return t?(Os??=new t,Os):null}let Da=null;function ji(){const t=_a();t&&t.state==="suspended"&&t.resume().catch(()=>{})}function Fa(){const t=Da;Da=null,t?.stop()}function Yi(t){if(!Js().soundOn)return;const n=_a();if(!n)return;n.state==="suspended"&&n.resume().catch(()=>{});const o=n.currentTime,s=n.createOscillator(),c=n.createGain();s.type="square",s.frequency.setValueAtTime(t?1320:880,o),c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(t?.09:.055,o+.01),c.gain.exponentialRampToValueAtTime(1e-4,o+(t?.34:.16)),s.connect(c),c.connect(n.destination),s.start(o),s.stop(o+.4)}function Hi(t,n,o){if(!Js().soundOn)return null;const s=_a();if(!s)return null;s.state==="suspended"&&s.resume().catch(()=>{}),Fa();const c=s.currentTime,y=c+Math.max(0,t),r=y+Math.max(2,n),h=s.createGain();h.gain.setValueAtTime(1e-4,c),h.gain.exponentialRampToValueAtTime(.85,c+.2);const x=s.createDynamicsCompressor();x.threshold.value=-16,x.knee.value=14,x.ratio.value=3.6,x.attack.value=.006,x.release.value=.35,h.connect(x),x.connect(s.destination);const M=[],w=[],z=(N,ae,Ee)=>{N.start(ae),N.stop(ae+Ee),M.push(N)},S=Math.floor(s.sampleRate*2.5),l=s.createBuffer(1,S,s.sampleRate),C=l.getChannelData(0);let u=0,H=0,R=0,B=0,I=0,$=0,fe=0;for(let N=0;N<S;N+=1){const ae=Math.random()*2-1;u=.99886*u+ae*.0555179,H=.99332*H+ae*.0750759,R=.969*R+ae*.153852,B=.8665*B+ae*.3104856,I=.55*I+ae*.5329522,$=-.7616*$-ae*.016898,C[N]=(u+H+R+B+I+$+fe+ae*.5362)*.12,fe=ae*.115926}const G=(N,ae,Ee,Ie,xe,at,D=1,ee=.02)=>{const ze=s.createBufferSource();ze.buffer=l,ze.loop=!0;const tt=s.createBiquadFilter();tt.type=Ie,tt.Q.value=D,tt.frequency.setValueAtTime(xe,N),at!==xe&&tt.frequency.exponentialRampToValueAtTime(Math.max(20,at),N+ae);const ke=s.createGain();ke.gain.setValueAtTime(1e-4,N),ke.gain.exponentialRampToValueAtTime(Math.max(2e-4,Ee),N+ee),ke.gain.setValueAtTime(Math.max(2e-4,Ee),Math.max(N+ee,N+ae*.55)),ke.gain.exponentialRampToValueAtTime(1e-4,N+ae),ze.connect(tt),tt.connect(ke),ke.connect(h),w.push(tt,ke),z(ze,N,ae+.05)},re=(N,ae,Ee,Ie,xe,at="sine")=>{const D=s.createOscillator();D.type=at,D.frequency.setValueAtTime(Ee,N),D.frequency.exponentialRampToValueAtTime(Math.max(8,Ie),N+ae*.85);const ee=s.createGain();ee.gain.setValueAtTime(1e-4,N),ee.gain.exponentialRampToValueAtTime(Math.max(2e-4,xe),N+.05),ee.gain.exponentialRampToValueAtTime(1e-4,N+ae),D.connect(ee),ee.connect(h),w.push(ee),z(D,N,ae+.02)},we=.55+Math.min(.45,o*.12);re(y,1.5,96,26,we),G(y,1.2,.55,"lowpass",2600,260,.8,.01);for(const[N,ae]of[[41,.5],[58,.32],[83,.18]]){const Ee=s.createOscillator();Ee.type="sawtooth",Ee.frequency.setValueAtTime(N*1.25,y),Ee.frequency.exponentialRampToValueAtTime(N,y+n*.4);const Ie=s.createGain();Ie.gain.value=.6;const xe=s.createOscillator();xe.frequency.value=6.5+Math.random()*3.5;const at=s.createGain();at.gain.value=.4,xe.connect(at),at.connect(Ie.gain);const D=s.createBiquadFilter();D.type="lowpass",D.frequency.value=180;const ee=s.createGain();ee.gain.setValueAtTime(1e-4,y),ee.gain.exponentialRampToValueAtTime(ae,y+.8),ee.gain.setValueAtTime(ae,r-Math.max(1,n*.35)),ee.gain.exponentialRampToValueAtTime(1e-4,r),Ee.connect(Ie),Ie.connect(D),D.connect(ee),ee.connect(h),w.push(Ie,D,ee),z(Ee,y,n+.1),z(xe,y,n+.1)}G(y,n*.9,.34,"bandpass",1800,900,.9,.05),G(y+1.2,n*.85,.22,"highpass",2600,5200,.7,.8),G(y+2.4,n*.6,.2,"bandpass",700,2400,.6,1.2),h.gain.setValueAtTime(.85,Math.max(c+.2,r-1.6)),h.gain.exponentialRampToValueAtTime(1e-4,r+.4);const ie={stop:()=>{const N=s.currentTime;try{h.gain.cancelScheduledValues(N),h.gain.setValueAtTime(Math.max(1e-4,h.gain.value),N),h.gain.exponentialRampToValueAtTime(1e-4,N+.25)}catch{}for(const ae of M)try{ae.stop(N+.3)}catch{}window.setTimeout(()=>{for(const ae of w)ae.disconnect();h.disconnect(),x.disconnect()},400)}};return Da=ie,ie}const Xs="textures/",It=Math.PI/180;function Yo(t,n,o=1){return new U(Math.cos(t*It)*Math.cos(n*It),Math.sin(t*It),-Math.cos(t*It)*Math.sin(n*It)).multiplyScalar(o)}const He=2.2,$i=Date.UTC(2e3,0,1,12),js={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},Ys={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function Zi(){if(typeof window>"u")return!0;const t=navigator,n=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,o=t.hardwareConcurrency??8,s=t.deviceMemory??8;return!!(n||o<=4||s<=4)}function qi(){const n=document.createElement("canvas");n.width=128,n.height=128;const o=n.getContext("2d");if(o){const s=o.createRadialGradient(64,64,0,64,64,64);s.addColorStop(0,"rgba(255,238,205,0.85)"),s.addColorStop(.3,"rgba(255,214,150,0.55)"),s.addColorStop(.45,"rgba(255,190,120,0.22)"),s.addColorStop(.7,"rgba(250,170,95,0.07)"),s.addColorStop(1,"rgba(255,160,80,0)"),o.fillStyle=s,o.fillRect(0,0,128,128)}return new On(n)}const Ki=`
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
}`,Hs=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,$s=`
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
}`;function Mc(t,n){const o=Zi(),s=o?96:128,c=new Nr({antialias:!0,powerPreference:"default",alpha:!1});c.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),c.outputColorSpace=yn,c.toneMapping=Dr,c.toneMappingExposure=1.1;const y=Math.min(4,c.capabilities.getMaxAnisotropy()),r=c.domElement;r.style.display="block",r.style.width="100%",r.style.height="100%",r.style.touchAction="none",t.appendChild(r);const h=document.createElement("div");h.className="space-labels",t.appendChild(h);const x=[];let M=0;function w(){const e=performance.now();if(e-M<400)return;M=e,x.length=0;const a=t.getBoundingClientRect();for(const i of[".explore-top",".sheet",".sky-alert"]){const d=document.querySelector(i);if(!d)continue;const b=d.getBoundingClientRect();b.width<2||b.height<2||x.push({x:b.left-a.left,y:b.top-a.top,w:b.width,h:b.height})}}function z(e,a,i,d=22){for(const b of x)if(e<b.x+b.w&&e+i>b.x&&a<b.y+b.h&&a+d>b.y)return!0;return!1}const S=new Fr;S.background=new X("#05070d");const l=new Ir(45,1,.01,2e3),C=[],u=e=>(C.push(e),e),H=new Ks,R=new _r,B=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),I=new Map,$=new Map,fe=[],G=new Set;let re=!1,we=0;const ie=(e,a)=>{const i=$.get(e);if(i){$.delete(e);for(const d of i)d(a)}},N=(e,a=!0)=>{const i=I.get(e);if(i)return i;we+=1;const d=H.load(Xs+e,()=>{ie(e,d),we-=1,we===0&&n.onReady?.()},void 0,()=>{ie(e,d),we-=1,we===0&&n.onReady?.()});return d.colorSpace=a?yn:Ia,d.anisotropy=o?4:8,I.set(e,d),u(d)},ae=e=>{I.has(e)||G.has(e)||(G.add(e),R.load(Xs+e,a=>{G.delete(e);const i=new Yr;i.image=a,i.colorSpace=yn,i.anisotropy=o?4:8,i.needsUpdate=!0,u(i),I.set(e,i),ie(e,i)},void 0,()=>{G.delete(e)}))},Ee=()=>{if(!re){re=!0;for(const e of fe)ae(e)}},Ie=(e,a)=>{if(B.has(e)){a(N(e));return}const i=I.get(e);if(i){a(i);return}const d=$.get(e)??[];d.push(a),$.set(e,d),fe.includes(e)||(fe.push(e),re&&ae(e))},xe=new O(u(new Re(900,48,24)),u(new he({map:N("milkyway.webp"),side:ao,depthWrite:!1})));xe.rotation.set(63*It,0,0),S.add(xe),S.add(new Wr(16777215,.14));const at=new qs(16777215,1.6,0,0);at.decay=0,S.add(at);const D=new Le;S.add(D);const ee=new Map,ze=new Map,tt=new Map,ke=[],de=new Map;let ft=null,yt=null;const Ne=new Map,pt=new Map,Ht=new Map,ce=new Map;let se=null,on=0,Ot=null;const $t=[],K=[],Z=[],V=[],ne=[];let pe=Date.now(),j=!0,F=null;function le(e,a,i,d){const b=js[i]??[.7,.7,.7,.06],A=Ys[i],_=new X(a),L=A?.relief??0,f=u(new Qe({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new bo(A?.texel?.[0]??1/1024,A?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:L*.35},gain:{value:(A?.gain??1.9)*.6},base:{value:new U(_.r,_.g,_.b)},glow:{value:new U(b[0],b[1],b[2])},atmo:{value:Math.min(b[3]*2.2,.85)},ringShadow:{value:d?1:0},ringMap:{value:null},ringInner:{value:d?.inner??1},ringOuter:{value:d?.outer??2},ringCenter:{value:new U},ringNormal:{value:new U(0,1,0)}},vertexShader:Ki,fragmentShader:Ji}));return e&&Ie(e,k=>{f.uniforms.dayMap.value=k,f.uniforms.useMap.value=1,L>0&&(f.uniforms.bumpMap.value=k,f.uniforms.useBump.value=1)}),d&&Ie("saturn-ring.webp",k=>{f.uniforms.ringMap.value=k}),f}function Tt(e,a,i){const d=Ys[i],b=d?.tint??js[i]?.slice(0,3);if(!b||o)return;const A=Math.min(d?.inner??.12,.5)*.55,_=Math.min(d?.outer??.05,.2)*.9,L=new U(b[0],b[1],b[2]),f=Math.sqrt(1-1/(1.045*1.045)),k=(W,Y,Me,me)=>new O(u(new Re(a*W,o?24:32,o?16:24)),u(new Qe({uniforms:{tint:{value:L},power:{value:Me},strength:{value:me},edge:{value:f}},vertexShader:Hs,fragmentShader:$s,side:Y,transparent:!0,blending:Oe,depthWrite:!1})));e.add(k(1.045,ao,2.7,A),k(1.16,zs,3.4,_))}function Mt(e,a){const i=u(new Qe({uniforms:{poleN:{value:Yo(80.7,-72.7,1).normalize()},poleS:{value:Yo(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:ac,fragmentShader:sc,transparent:!0,blending:Oe,depthWrite:!1})),d=new O(u(new Re(a*1.022,o?64:96,o?48:64)),i);d.renderOrder=1,e.add(d),V.push(i)}function ln(e,a){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([d,b,A,_,L],f)=>{const k=Yo(d,b,1).normalize(),W=new U(0,1,0).cross(k).normalize(),Y=new U().crossVectors(k,W).normalize(),Me=W.multiplyScalar(Math.cos(L)).addScaledVector(Y,Math.sin(L)).normalize(),me=[];for(let Pe=0;Pe<=16;Pe+=1){const Ye=Pe/16,Je=(Ye-.5)*A,Fe=Math.sin(Ye*Math.PI)*_;me.push(new U().copy(k).multiplyScalar(Math.cos(Je)).addScaledVector(Me,Math.sin(Je)).normalize().multiplyScalar(a*(.985+Fe)))}const Se=u(new Qe({uniforms:{uTime:{value:0},seed:{value:f*.37+.11}},vertexShader:rc,fragmentShader:ic,transparent:!0,blending:Oe,side:ot,depthWrite:!1})),Ke=new O(u(new Xr(new jr(me),64,a*.022,8,!1)),Se);Ke.raycast=()=>{},e.add(Ke),ne.push(Se)})}function Zt(e,a,i=""){const d=document.createElement("button");d.type="button",d.className="space-label"+i,d.textContent=a,d.addEventListener("click",()=>n.onPick?.(e)),h.appendChild(d),tt.set(e,d)}const So=u(new Qe({uniforms:{map:{value:N("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),An=new U,ea=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],ko=new Map;let _t=null;const Cn={moon:"earth",...Object.fromEntries(Ts.map(e=>[e.id,e.parent]))};function zo(e,a){const i=Cn[e];if(_t===null||!i)return Lo(e,a);const d=Lo(i,a),b=Lo(e,_t),A=Lo(i,_t);return{x:d.x+b.x-A.x,y:d.y+b.y-A.y,z:d.z+b.z-A.z}}function Rn(e){for(const[a,i]of ze){if(a==="sun")continue;const d=zo(a,e);i.position.set(d.x*He,d.y*He,d.z*He)}for(const[a,i]of Ne){const d=zo(a,e);i.position.set(d.x*He,d.y*He,d.z*He)}if(Ot){An.copy(Ot.holder.position);const a=An.length()||1;Ot.tail.visible=a/He<8,An.multiplyScalar(1/a),Ot.tail.quaternion.setFromUnitVectors(new U(0,1,0),An),Ot.tail.position.copy(An).multiplyScalar(.16*He)}}const wn=new U(1,0,0),ta=u(new Qe({uniforms:{dayMap:{value:N("earth-day.webp")},nightMap:{value:N("earth-night.webp")},normalMap:{value:N("earth-normal.webp",!1)},specMap:{value:N("earth-spec.webp",!1)},texel:{value:new bo(1/2048,1/1024)},sunDir:{value:wn}},vertexShader:ec,fragmentShader:tc}));function m(e){const a=new Le,i=new O(u(new Re(e,o?96:128,64)),ta);i.name="earth",a.add(i);const d=new O(u(new Re(e*1.012,80,48)),u(new Ra({map:N("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));a.add(d),ft=d;const b=new O(u(new Re(e*1.06,64,48)),u(new Qe({uniforms:{sunDir:{value:wn}},vertexShader:`
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
            }`,side:ao,transparent:!0,blending:Oe,depthWrite:!1})));a.add(b);const A=new O(u(new Re(e*1.15,o?24:32,o?16:24)),u(new Qe({uniforms:{tint:{value:new U(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:Hs,fragmentShader:$s,side:zs,transparent:!0,blending:Oe,depthWrite:!1})));return a.add(A),ee.set("earth",i),a}function p(e,a,i){for(const d of go(e).sites??[]){const b=new O(u(new Re(i*.018,12,8)),u(new he({color:"#3182f6"})));b.position.copy(Yo(d.lat,d.lon,i*1.004)),a.add(b);const A=document.createElement("div");A.className="space-site",A.textContent=d.name,h.appendChild(A),ke.push({mesh:b,site:d,el:A,parent:e})}}let P=null;for(const e of Zr){if(e.id==="moon")continue;const a=new Le;if(ze.set(e.id,a),D.add(a),e.id==="sun"){const i=.26*He,d=new O(u(new Re(i,o?96:128,o?64:80)),So);d.name="sun",de.set("sun",i),a.add(d),ln(d,i);for(const[A,_,L,f]of[[1.06,2,.95,"#ffbf78"]])a.add(new O(u(new Re(i*A,o?32:48,o?24:32)),u(new Qe({uniforms:{color:{value:new X(f)},power:{value:_},strength:{value:L}},vertexShader:nc,fragmentShader:oc,transparent:!0,blending:Oe,depthWrite:!1}))));ee.set("sun",d);const b=new ro(u(new io({map:u(qi()),blending:Oe,transparent:!0,depthWrite:!1,depthTest:!0,color:new X("#ffd9a0")})));b.scale.setScalar(i*3.6),a.add(b),yt=b}else{const i=wa(e.id).radius*He;de.set(e.id,i);let d;if(e.id==="earth"){const L=m(i);L.rotation.z=-e.tilt*It,a.add(L),P=L,d=L.children[0]}else{const L=e.id==="saturn"?{inner:i*1.18,outer:i*2.08}:void 0;d=new O(u(new Re(i,o?96:128,64)),le(e.texture,e.color,e.id,L)),d.name=e.id,d.rotation.z=-e.tilt*It,a.add(d),ee.set(e.id,d),Tt(a,i,e.id),e.id==="jupiter"&&Mt(d,i)}if(e.axes){const[L,f,k]=e.axes;d.scale.set(1,k/L,f/L)}if(e.ring&&e.axes){const L=e.axes[0]/2,f=i*(e.ring.radius-e.ring.width/2)/L,k=i*(e.ring.radius+e.ring.width/2)/L,W=new O(u(new gt(f,Math.max(k,f*1.03),128,1)),u(new he({color:"#8b8580",side:ot,transparent:!0,opacity:.75,depthWrite:!1})));W.rotation.x=Math.PI/2,a.add(W)}if(e.id==="saturn"){const L=i*1.18,f=i*2.08,k=new gt(L,f,160,1),W=u(new Qe({uniforms:{ringMap:{value:null},innerRatio:{value:L/f},planetRadius:{value:i},planetCenter:{value:new U}},vertexShader:cc,fragmentShader:lc,side:ot,transparent:!0,depthWrite:!1}));Ie("saturn-ring.webp",Me=>{W.uniforms.ringMap.value=Me});const Y=new O(u(k),W);Y.rotation.x=Math.PI/2,d.add(Y),K.push({mesh:Y,parent:e.id}),Z.push({mesh:d,material:d.material})}e.sites&&p(e.id,d,i);const b=As(e.id,.022),A=u(new en);A.setAttribute("position",new ya(b.positions,3)),A.setIndex(b.index),A.scale(He,He,He);const _=new O(A,u(new he({color:wa(e.id).ribbon,transparent:!0,opacity:.5,side:ot,depthWrite:!1})));$t.push(_),D.add(_)}Zt(e.id,e.name,e.id==="sun"?"":" is-planet")}const g=[];function v(e,a,i){let d=e==="main"?1234:98765;const b=()=>(d=d*16807%2147483647,(d-1)/2147483646),A=u(new hn(1,0)),_=new Float32Array(a*4),L=new Float32Array(a*4);for(let W=0;W<a;W+=1){let Y;if(e==="main")do Y=2.1+b()*1.2;while((Math.abs(Y-2.5)<.03||Math.abs(Y-2.82)<.03||Math.abs(Y-2.95)<.02)&&b()<.85);else Y=b()<.18?39.2+(b()-.5)*1.2:42+(b()-.5)*6.5;_[W*4]=Y,_[W*4+1]=b()*Math.PI*2,_[W*4+2]=b()*(e==="main"?.18:.12),_[W*4+3]=b()*Math.PI*2,L[W*4]=(b()-.5)*(e==="main"?.32:.5),L[W*4+1]=b()*Math.PI*2;const Me=b()**3;L[W*4+2]=(e==="main"?.0035:.009)*(.7+Me*2.4),L[W*4+3]=b()}A.setAttribute("orbit",new Ps(_,4)),A.setAttribute("shape",new Ps(L,4));const f=u(new Qe({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new X(i)},uScale:{value:He}},vertexShader:uc,fragmentShader:fc})),k=new Jo(A,f,a);k.frustumCulled=!1,k.raycast=()=>{},D.add(k),g.push({mesh:k,material:f})}v("main",o?1800:4200,"#9c9184"),v("kuiper",o?1500:3600,"#7f8b9c");for(const e of Ts){const a=new Le,i=new O(u(new Re(e.radius*He,32,24)),le(`${e.id}.webp`,e.color,e.id));i.name=e.id,a.add(i),D.add(a),Ne.set(e.id,a),pt.set(e.id,i);const d=document.createElement("button");d.type="button",d.className="space-label is-small",d.textContent=e.name,d.addEventListener("click",()=>n.onExtra?.(e.id)),h.appendChild(d),Ht.set(e.id,{el:d,parent:e.parent})}{const e=new Le,a=new O(u(new Re(.045*He,20,16)),u(new he({color:"#f7fbff"})));a.name="halley",e.add(a);const i=new O(u(new Ca(.04*He,.32*He,12)),u(new he({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(i),Ot={holder:e,tail:i},D.add(e),Ne.set("halley",e),pt.set("halley",a);const d=As("halley",.022),b=u(new en);b.setAttribute("position",new ya(d.positions,3)),b.setIndex(d.index),b.scale(He,He,He);const A=new O(b,u(new he({color:wa("halley").ribbon,transparent:!0,opacity:.35,side:ot,depthWrite:!1})));$t.push(A),D.add(A);const _=document.createElement("button");_.type="button",_.className="space-label is-small",_.textContent=q("핼리 혜성"),_.addEventListener("click",()=>n.onExtra?.("halley")),h.appendChild(_),Ht.set("halley",{el:_,parent:null})}for(const e of qr){const a=Kr(e),i=a.points.map(Me=>new U(Me.x*He,Me.y*He,Me.z*He)),d=u(new en().setFromPoints(i)),b=new Lr(d,u(new xo({color:e.color,transparent:!0,opacity:.95})));b.visible=!1;const A=new Le,_=new O(u(new Ma(.03,.01,.01,20)),u(new he({color:"#d8dde4"})));_.rotation.x=Math.PI/2;const L=new O(u(new Re(.014,12,8)),u(new he({color:"#c9ced6"})));L.position.z=-.02;const f=new O(u(new Ma(.002,.002,.09,6)),u(new he({color:"#aab3c0"})));f.rotation.z=Math.PI/2,f.position.z=-.02;const k=new O(u(new Re(.035,16,12)),u(new he({color:e.color,transparent:!0,opacity:.18,blending:Oe,depthWrite:!1})));A.add(_,L,f,k),A.scale.setScalar(e.frame==="earth"?.8:1.3),A.position.copy(i[i.length-1]),b.add(A),(e.frame==="earth"?ze.get("earth")??D:D).add(b);const Y=document.createElement("div");Y.className="space-site is-probe",Y.textContent=e.name,h.appendChild(Y),ce.set(e.id,{line:b,probe:A,el:Y,points:i,times:a.points.map(Me=>Me.t),marks:a.marks,frame:e.frame})}if(Rn(pe),P){const e=.055*He;de.set("moon",e);const a=new O(u(new Re(e,s,48)),le("moon.webp","#b8b8b8","moon"));a.name="moon";const i=new Le;i.add(a),D.add(i),ee.set("moon",a),ze.set("moon",i),p("moon",a,e),Zt("moon",q("달")," is-small"),Rn(pe)}const J=new Le,E=new Le,oe=new Le;J.add(E,oe),J.visible=!1;let te="solar",Ue=!1,mt=0;const ve={moon:new O,moonMat:u(new he({color:"#ffffff"})),shadow:u(new he({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new O,umbra:new O,skyCover:new O,skySun:new Le,skyMoon:new Le,skyMoonMat:u(new he({color:"#ffffff"}))},vt=[],En=N("sun.webp"),qt=N("moon.webp"),xn=new O(u(new Re(.62,32,24)),u(new he({map:En})));xn.position.set(-3.3,0,0);const At=new O(u(new Re(.4,32,24)),u(new he({map:N("earth-day.webp")})));At.position.set(1.85,0,0),ve.moonMat.map=qt,ve.moon=new O(u(new Re(.14,24,18)),ve.moonMat),ve.cone=new O(u(new Ma(.04,.16,.78,18)),ve.shadow),ve.cone.position.set(1.42,0,0),ve.cone.rotation.z=Math.PI/2,ve.umbra=new O(u(new vo(.3,28)),u(new he({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),ve.umbra.position.set(2.75,0,.02),E.add(xn,At,ve.moon,ve.cone,ve.umbra);for(const[e,a]of[[q("태양"),new U(-3.3,.85,0)],[q("지구"),new U(1.85,.68,0)]]){const i=document.createElement("div");i.className="space-site",i.textContent=e,h.appendChild(i),vt.push({el:i,at:a,group:E})}const Nn=new O(u(new vo(1.35,48)),u(new he({map:En}))),Wt=new O(u(new gt(1.4,1.7,48)),u(new he({color:"#f0c36a",transparent:!0,opacity:.45,side:ot,depthWrite:!1})));ve.skyCover=new O(u(new vo(1.22,48)),u(new he({color:"#141820"}))),ve.skySun.add(Nn,Wt,ve.skyCover),ve.skyMoonMat.map=qt;const lo=new O(u(new vo(.92,48)),ve.skyMoonMat),un=new O(u(new vo(1.08,48)),u(new he({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));un.position.z=.16,ve.skyMoon.add(lo,un),oe.add(ve.skySun,ve.skyMoon);const ue=document.createElement("div");ue.className="space-site is-stage",h.appendChild(ue),vt.push({el:ue,at:new U(0,-1.2,0),group:E}),oe.visible=!1,S.add(J);const be=new Le;be.visible=!1,be.rotation.z=-Math.PI/2;const Ge=[],je=4.6,et=e=>je*e/696e3,Te=new O(u(new Re(je,64,40)),u(new he({map:N("sun.webp")})));Te.position.set(-3.2,0,0),be.add(Te);const it=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let $e=2.4;const Ze=(e,a)=>{const i=document.createElement("div");i.className="space-site",i.textContent=e,h.appendChild(i),Ge.push({el:i,at:a,group:be})};Ze(q("태양"),new U(-3.2,4.9,0));for(const[e,a]of it){const i=et(a),d=$e+i;$e=d+i+.72;const b=go(e),A=e==="earth"?"earth-day.webp":b.texture,_=u(new he({color:b.color}));A&&Ie(A,f=>{_.map=f,_.color.set("#ffffff"),_.needsUpdate=!0});const L=new O(u(new Re(i,32,24)),_);if(L.position.set(d,0,0),b.axes&&L.scale.set(1,b.axes[2]/b.axes[0],b.axes[1]/b.axes[0]),be.add(L),e==="saturn"){const f=i*1.18,k=i*2.08,W=u(new gt(f,k,96,1)),Y=W.attributes.position,Me=W.attributes.uv,me=new U;for(let Pe=0;Pe<Y.count;Pe+=1)me.fromBufferAttribute(Y,Pe),Me.setXY(Pe,(me.length()-f)/(k-f),.5);const Se=u(new he({color:"#b9b3ab",transparent:!0,opacity:.9,side:ot,depthWrite:!1}));Ie("saturn-ring.webp",Pe=>{Se.map=Pe,Se.color.set("#ffffff"),Se.needsUpdate=!0});const Ke=new O(W,Se);Ke.rotation.y=Math.PI/2-.36,L.add(Ke)}Ze(b.name,new U(d,(e==="saturn"?i*2.08:i)+.12,0))}S.add(be);const Xe=new Le;Xe.visible=!1;const st=[],Ct=[],Lt=new O(u(new Re(.55,48,32)),u(new he({color:"#e0703a"})));Xe.add(Lt);for(const[e,a]of[[1.35,.16],[2.1,.05]])Xe.add(new O(u(new Re(.55*e,32,24)),u(new he({color:"#ff6a30",transparent:!0,opacity:a,side:ao,blending:Oe,depthWrite:!1}))));const Xt=new O(u(new gt(2.6,5.1,96,1)),u(new he({color:"#3fbf7f",transparent:!0,opacity:.12,side:ot,depthWrite:!1})));Xt.rotation.x=Math.PI/2,Xe.add(Xt),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,a,i,d,b],A)=>{const _=new ks(u(new en().setFromPoints(Array.from({length:128},(k,W)=>new U(Math.cos(W/128*Math.PI*2)*i*100,0,Math.sin(W/128*Math.PI*2)*i*100)))),u(new xo({color:"#8b95a1",transparent:!0,opacity:.35})));Xe.add(_);const L=new O(u(new Re(.16*d,24,16)),le(void 0,b,"earth"));Xe.add(L);const f=document.createElement("button");f.type="button",f.className="space-label is-small",f.textContent=e,f.addEventListener("click",()=>n.onExtra?.(`trappist-${e}`)),h.appendChild(f),st.push({mesh:L,a:i*100,period:a,phase0:A*1.7,el:f})});const Sn=new ks(u(new en().setFromPoints(Array.from({length:256},(e,a)=>new U(Math.cos(a/256*Math.PI*2)*38.7,0,Math.sin(a/256*Math.PI*2)*38.7)))),u(new xo({color:"#c5b8a2",transparent:!0,opacity:.5})));Xe.add(Sn);for(const[e,a]of[["TRAPPIST-1",new U(0,1.1,0)],[q("생명가능지대(대략)"),new U(3.9,0,0)],[q("비교: 우리 수성의 궤도"),new U(0,0,38.7)]]){const i=document.createElement("div");i.className="space-site",i.textContent=e,h.appendChild(i),Ct.push({el:i,at:a})}S.add(Xe);const Ut=ni(u),nr=Ut.labels.map(({name:e,at:a})=>{const i=document.createElement("div");return i.className="space-site",i.textContent=e,h.appendChild(i),{el:i,at:a}});S.add(Ut.group);const Rt=ai(),na=[];if(Rt)for(const[e,a]of Object.entries(Rt.groups)){S.add(a);for(const i of Rt.markers[e]){const d=document.createElement("button");d.type="button",d.className="space-label",d.textContent=i.name,d.addEventListener("click",()=>{n.onMarker?.(i),Ve.target.copy(i.position),Ve.radius=jn[e]*(i.id==="cmb"?1.4:e==="group"?.6:.42)}),h.appendChild(d),na.push({level:e,marker:i,el:d})}}const Wa=[];if(Rt){const a=(A,_)=>new U(Math.cos(_*It)*Math.cos(A*It),Math.sin(_*It),-Math.cos(_*It)*Math.sin(A*It)).multiplyScalar(140),i=[];for(const A of Object.values(Cs))for(const _ of A)for(let L=0;L<_.length-1;L+=1){const f=a(_[L][0],_[L][1]),k=a(_[L+1][0],_[L+1][1]);i.push(f.x,f.y,f.z,k.x,k.y,k.z)}const d=u(new en);d.setAttribute("position",new ya(i,3));const b=new Zs(d,u(new xo({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));Rt.groups.stars.add(b);for(const A of Jr){if(!Cs[A.id])continue;const _=document.createElement("button");_.type="button",_.className="space-label is-const",_.textContent=A.name.replace(/\(.*\)/,"").split(" · ")[0],_.addEventListener("click",()=>n.onConstellation?.(A.id)),h.appendChild(_),Wa.push({el:_,at:a(A.center[0],A.center[1])})}}const Po=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let Ae="system",Xn=!1,La=!1;const jn={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},Yn=new U,_e={theta:.6,phi:.95,radius:34},Ve={target:new U,radius:_e.radius};let ct="system",wt=null,Gt=null,Kt=null;function To(e){if((e==="system"||e==="sizes")&&Ee(),Ae=e,Xn=!1,D.visible=e==="system",J.visible=e==="eclipse",be.visible=e==="sizes",Xe.visible=e==="exo",Ut.group.visible=e==="blackhole",Rt)for(const[a,i]of Object.entries(Rt.groups))i.visible=a===e;ct="system",wt=null,Gt=null,Kt=null,Ve.target.set(0,0,0),Ve.radius=jn[e],e!=="system"&&(_e.phi=1.1),e==="eclipse"&&(E.rotation.z=l.aspect<1?-Math.PI/2:0,_e.theta=0,_e.phi=Ue?Math.PI/2:1.25,Ve.target.set(0,0,0),Ue||Ve.target.set(-.7,0,0).applyEuler(E.rotation),Ve.radius=Ue?6:l.aspect<1?10:7.5),e==="exo"&&(_e.phi=.75),e==="blackhole"&&(_e.phi=1.42),e==="sizes"&&(_e.theta=0,_e.phi=Math.PI/2,Ve.target.set(.6,-6.8,0),Ve.radius=19)}function oa(e){if(e!=="earth"&&Ee(),Xn=!1,Ae!=="system"&&(Ae="system",D.visible=!0,J.visible=!1,be.visible=!1,Xe.visible=!1,Ut.group.visible=!1,Rt))for(const i of Object.values(Rt.groups))i.visible=!1;if(ct=e,Gt=null,Kt=null,e==="system"){wt=null,Ve.target.set(0,0,0),Ve.radius=jn.system;return}wt=ze.get(e)??null;const a=de.get(e)??Qi(go(e).km);Ve.radius=e==="sun"?3.2:e==="jupiter"?3.4*He:e==="saturn"?2.6*He:Math.max(a*(go(e).ring?6:4.2),.25)}function or(e){const a=Ne.get(e);a&&(Ae!=="system"&&To("system"),ct="system",wt=a,Gt=null,Kt=null,Ve.radius=e==="halley"?1.6:.6,cn=performance.now())}function ar(e){Kt=(e?ke.find(i=>i.parent===ct&&i.site.name===e.name):void 0)?.mesh??null,Gt=Kt?new U:null,cn=performance.now()}let T=null,We=0,xt=-.12;const aa=62,Ua=18,Ga=85;let kn=aa,Hn=0,Dn=0,$n=0,Va=0,Ba=null,sa=null,qe=null,De="idle",lt=0,zn=0,Ao=-1,ut=0,Fn=0,Et=0,Nt=0,Zn=0,Co=!1,uo=!1;const ra=3.6,Ro=2,sr=430;let Eo=0,an=0,In=0,fo=0,Oa=0,Xa=0;const qn=3.4,ja=6.6,No=2.8,Ya=4.6,_n=620;let ge=0,ye=0,Kn=0,dt=0,bt=0,St=0,Wn=0,Jt=!0,fn=!1,ia=0,Vt=!0,po=9.81,Ln="first",Ha="office";const rr=4.6,$a=1.8,Za=16;let Jn=rr,mo=0,sn=Math.PI,Un=0,ho=0,Qn=0,eo=Number.NaN,Gn=0,Vn=0,ca=new X("#000000"),Do=0;const ir=new X("#5a1206");let Fo=0,la=0,ua=-24,fa=120;const jt=new Set;function cr(){if(xe.visible=!0,D.visible=Ae==="system",J.visible=Ae==="eclipse",be.visible=Ae==="sizes",Xe.visible=Ae==="exo",Ut.group.visible=Ae==="blackhole",Rt)for(const[e,a]of Object.entries(Rt.groups))a.visible=e===Ae}function qa(e,a){T&&(S.remove(T.group),T.dispose(),T=null),os();const i=ei(e);Ba=e,sa=i,T=Ni(i,{low:o,anisotropy:y,onLand:d=>n.onSurfaceDrop?.({id:e,seconds:d.seconds,bounces:d.bounces,outcome:d.outcome}),onImpact:ur}),S.add(T.group),ca=new X(i.fog),Do=i.fogDensity,S.fog=new Hr(ca.clone(),Do),We=(i.companion?i.companionAz:i.sunAz)*It,xt=-.12,sn=Math.PI-We,Un=0,ho=0,Qn=0,Uo(),kn=aa,ge=T.standX,ye=T.standZ,Kn=0,dt=0,bt=0,St=0,Wn=0,Jt=!0,fn=!1,ia=0,Vt=T.walkable,po=Math.max(0,i.gravityMps2),Fo=0,la=0,ua=i.terrain==="ring"?-24:-1,fa=i.terrain==="ring"?110:240,Dn=0,$n=Math.max(.6,a),Va=i.cloudTop!==null?260:150,mo=0,eo=Number.NaN,an=0,In=0,fo=0,T.avatar.setSkin(Ha),T.avatar.setVisible(Ln==="third"),ns(),cn=performance.now()}function Ka(e){if(!T){if(xe.visible=!1,D.visible=!1,J.visible=!1,be.visible=!1,Xe.visible=!1,Ut.group.visible=!1,Rt)for(const a of Object.values(Rt.groups))a.visible=!1;h.style.display="none",se=null,_t=null,j=!0,l.fov=62,l.near=.08,l.far=6e3,l.updateProjectionMatrix()}qa(e,1.9)}function lr(e){if(!T){Ka(e);return}qa(e,1.1)}function Ja(){T&&(Uo(),os(),S.remove(T.group),T.dispose(),T=null,S.fog=null,c.toneMappingExposure=1.1,h.style.display="",cr(),l.fov=45,l.near=.01,l.far=2e3,l.updateProjectionMatrix(),Yn.copy(Ve.target),_e.radius=Ve.radius,cn=performance.now())}function pa(){if(!T)return;const e=4.2+Math.random()*1.4,a=(Math.random()-.5)*1.8,i=ge-T.standX+Math.sin(We)*e+Math.cos(We)*a,d=ye-T.standZ-Math.cos(We)*e+Math.sin(We)*a;T.drop(i,d)}function ur(){if(n.onSurfaceImpact?.(),!T)return;const e=Math.sin(We),a=-Math.cos(We),i=Math.hypot(ge-Oa,ye-Xa);if(i<46){const d=Math.max(.35,1-i/46);Gn-=e*(3.4+d*5.2),Vn-=a*(3.4+d*5.2),fo=2.8+d*.9,an=1,In=1,Qa(180)}else Gn-=e*8.2,Vn-=a*8.2;Vt?Jt&&(dt=Math.max(dt,2.8),Jt=!1):dt+=1.8}function fr(){if(!T)return;const e=22+Math.random()*8,a=(Math.random()-.5)*5,i=Math.sin(We),d=-Math.cos(We),b=ge+i*e+Math.cos(We)*a,A=ye+d*e+Math.sin(We)*a;Oa=b,Xa=A,T.impact.strike(b,A,i,d),ti()}function pn(){n.onSurfaceRocket?.({phase:De,count:zn,altitude:ut})}function Qa(e){try{const a=navigator;typeof a.vibrate=="function"&&a.vibrate(e)}catch{}}function es(){let e=ge+Math.sin(We)*20,a=ye-Math.cos(We)*20,i=1/0;for(const d of[-.55,-.28,0,.28,.55])for(const b of[18,20,22]){const A=We+d,_=ge+Math.sin(A)*b,L=ye-Math.cos(A)*b,f=T?.normalAt(_,L),k=f?Math.abs(f.x)+Math.abs(f.z):0,W=Math.hypot(_,L)>_n-40?6:0,Y=k*7+W+Math.abs(d)*.7;Y<i&&(i=Y,e=_,a=L)}return{x:e,z:a}}function ts(e,a){!qe||!T||(Et=e,Nt=a,Zn=T.walkable?T.meshHeightAt(e,a):T.floorAt(e,a),qe.setBase(e,a,Zn),qe.setFacing(Math.atan2(-(ye-a),ge-e)),qe.setLift(0),qe.setThrottle(0),qe.setClamps(0),qe.setPadVisible(!0))}function ns(){qe||Co||!T||!sa||(Co=!0,Xi(c,sa).then(e=>{if(Co=!1,!T){e.dispose();return}qe=e,T.group.add(e.group);const a=es();ts(a.x,a.z),uo&&(uo=!1,as())}).catch(()=>{Co=!1,uo=!1}))}function os(){Fa(),qe&&(qe.group.parent?.remove(qe.group),qe.dispose(),qe=null),De="idle",zn=0,ut=0,Fn=0,lt=0,uo=!1}function as(){if(!(!T||De!=="idle")){if(ji(),Uo(),fn=!1,!qe){uo=!0,ns();return}if(Math.hypot(ge-Et,ye-Nt)>34){const e=es();ts(e.x,e.z),qe.setLift(95),De="land"}else De="run";lt=0,ut=0,Fn=0,zn=0,Qn=0,pn()}}function pr(e){return e==="sun"||e==="mercury"||e==="venus"||e==="earth"||e==="moon"||e==="mars"||e==="jupiter"||e==="saturn"||e==="uranus"||e==="neptune"||e==="pluto"||e==="eris"||e==="haumea"||e==="makemake"?e:e==="io"||e==="europa"||e==="ganymede"||e==="callisto"?"jupiter":e==="titan"||e==="enceladus"||e==="saturn-ring"?"saturn":e==="charon"?"pluto":"system"}function mr(e){if(!(!T||!qe||De==="idle")){if(lt+=e,De==="land"){const a=Math.min(1,lt/1.9),i=1-Math.pow(1-a,3);qe.setLift(95*(1-i)),a>=1&&(qe.setLift(0),De="run",lt=0,pn());return}if(De==="run"){(Math.hypot(Et-ge,Nt-ye)<6.4||lt>16)&&(De="board",lt=0,pn());return}if(De==="board"){const a=Math.min(1,e*3.6);ge+=(Et-ge)*a,ye+=(Nt-ye)*a,lt>1.25&&(De="count",lt=0,zn=3,Hi(Ro,10.5+ra,Math.max(0,po)),pn());return}if(De==="count"){const a=Math.max(0,Math.ceil(3-lt));a!==zn&&(zn=a,Yi(zn===0),pn());const i=Math.max(0,Math.min(1,(lt-Ro)/.9));qe.setThrottle(i),qe.setClamps(Math.max(0,Math.min(1,(lt-Ro-.15)/.7))),i>0&&lt-e<=Ro&&(Qa(90),Eo=1),lt>=ra&&(De="lift",lt=0,Fn=0,pn());return}if(De==="lift"){const i=12.5/(1+Math.max(0,po)*.075)*(.55+Math.min(.45,lt*.35));Fn+=i*e,ut+=Fn*e,qe.setLift(ut),qe.setThrottle(1),T.atmosphere(Math.min(.72,ut/640));const d=Math.round(ut);d!==Ao&&(Ao=d,pn()),ut>26&&qe.setPadVisible(!1),ut>sr&&(De="escape",lt=0,pn());return}if(De==="escape"){const a=Math.min(1,lt/2.6);Fn+=40*e,ut+=Fn*e,qe.setLift(ut),T.atmosphere(Math.max(.72,.72+a*.28));const i=Math.round(ut);i!==Ao&&(Ao=i,pn());const d=S.fog;if(d&&(d.density=Do*(1-a)),a>=1){const b=Ba;Fa(),De="idle",Ja(),oa(pr(b)),n.onSurfaceEscape?.()}}}}function dr(e,a){if(!T||!qe)return;const i=Zn+Zo;if(De==="board"||De==="count"){const b=De==="count"?Math.min(1,lt/ra):0,A=Math.atan2(Et-ge,Nt-ye)+1.05,_=34-b*8,L=Et+Math.sin(A)*_,f=Nt+Math.cos(A)*_;let k=Zn+6.4+b*2.2;T.solidFloor&&(k=Math.max(k,T.meshHeightAt(L,f)+2.2)),l.position.set(L,k,f),l.fov=58+b*10,l.updateProjectionMatrix(),l.lookAt(Et,i+16+b*26,Nt)}else if(De==="run"){const b=T.walkable?T.meshHeightAt(ge,ye):T.floorAt(ge,ye),A=Math.atan2(Et-ge,Nt-ye)+.85,_=26+Math.min(16,Math.hypot(Et-ge,Nt-ye)*.3),L=Et+Math.sin(A)*_,f=Nt+Math.cos(A)*_;let k=Zn+5.5;T.solidFloor&&(k=Math.max(k,T.meshHeightAt(L,f)+1.6)),l.position.set(L,k,f),l.fov=66,l.updateProjectionMatrix(),l.lookAt(ge,b+1.1,ye)}else{const b=54+Math.min(190,ut*.34),A=Et+b*.42,_=Nt+b*.9;let L=Zn+6+ut*.34;T.solidFloor&&(L=Math.max(L,T.meshHeightAt(A,_)+2.2)),l.position.set(A,L,_),l.fov=70+Math.min(10,ut*.01),l.updateProjectionMatrix(),l.lookAt(Et,i+ut*.62+4,Nt)}Eo=Math.max(0,Eo-a*1.4);const d=Eo*.5+(De==="lift"||De==="escape"?Math.max(0,.22-ut*6e-4):0);d>.002&&(l.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*d*.9,l.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*d*.9,l.rotateZ(Math.sin(e*31.4)*d*.03))}function hr(e){Ln=e,e==="third"&&xt<-.32&&(xt=-.16),eo=Number.NaN,xt=Math.min(.6,Math.max(-1.05,xt)),T&&T.avatar.setVisible(e==="third"),cn=performance.now()}function vr(e){Ha=e,T&&T.avatar.setSkin(e)}function gr(e){if(!T)return;if(Dn<$n){fn=!1;return}const a=(jt.has("w")||jt.has("arrowup")?1:0)-(jt.has("s")||jt.has("arrowdown")?1:0),i=(jt.has("d")||jt.has("arrowright")?1:0)-(jt.has("a")||jt.has("arrowleft")?1:0);let d=Fo+a,b=la+i;if(an>.4&&(d=0,b=0,fn=!1),De!=="idle"){const Me=(Math.atan2(Et-ge,-(Nt-ye))-We+Math.PI*3)%(Math.PI*2)-Math.PI;We+=Me*Math.min(1,e*6),d=De==="run"||De==="board"?1:0,b=0}const A=Math.hypot(d,b);A>1&&(d/=A,b/=A);const _=Math.sin(We),L=-Math.cos(We),f=Math.cos(We),k=Math.sin(We),W=Math.min(1,e*(Vt?9:2.4));if(Vt){const Y=Math.min(1,A),Me=Math.min(1,Math.max(0,(Y-.7)/.3));ho+=(Me-ho)*Math.min(1,e*6);const me=qn+(ja-qn)*ho,Se=(_*d+f*b)*me,Ke=(L*d+k*b)*me,Pe=Math.min(1,e*(Y>.02?8.5:5.2));bt+=(Se-bt)*Pe,St+=(Ke-St)*Pe,ge+=(bt+Gn)*e,ye+=(St+Vn)*e,Gn*=Math.exp(-e*3.1),Vn*=Math.exp(-e*3.1);const Ye=T.walk(ge,ye);if(Ye.x!==ge||Ye.z!==ye){const zt=Ye.x-ge,Dt=Ye.z-ye,ht=Math.hypot(zt,Dt);if(ge=Ye.x,ye=Ye.z,ht>1e-4){const nt=zt/ht,Ft=Dt/ht,Pt=bt*nt+St*Ft;Pt<0&&(bt-=nt*Pt,St-=Ft*Pt)}}const Je=Ye.rise;Un+=(Je-Un)*Math.min(1,e*(Je>Un?16:9));const Fe=Math.hypot(ge,ye);if(Fe>_n){const zt=ge/Fe,Dt=ye/Fe;ge=zt*_n,ye=Dt*_n;const ht=bt*zt+St*Dt;ht>0&&(bt-=ht*zt,St-=ht*Dt)}const rt=Math.hypot(bt,St);ia+=e*(Jt?.8+rt*1.7:.8),fn&&Jt&&po>.01&&(dt=Ya,Jt=!1),Jt||(dt-=po*e,Kn+=dt*e,Kn<=0&&(Kn=0,mo=Math.min(1,Math.abs(dt)/Ya),dt=0,Jt=!0))}else{const Y=Math.cos(xt),Me=(Math.sin(We)*Y*d+f*b)*No,me=Math.sin(xt)*d*No,Se=(-Math.cos(We)*Y*d+k*b)*No;bt+=(Me-bt)*W,St+=(Se-St)*W,dt+=(me-dt)*W,fn&&(dt+=1.8),ge+=(bt+Gn)*e,ye+=(St+Vn)*e,Gn*=Math.exp(-e*3.1),Vn*=Math.exp(-e*3.1),Wn+=dt*e;const Ke=Math.hypot(ge,ye);if(Ke>_n){const Pe=ge/Ke,Ye=ye/Ke;ge=Pe*_n,ye=Ye*_n;const Je=bt*Pe+St*Ye;Je>0&&(bt-=Je*Pe,St-=Je*Ye)}Wn<ua&&(Wn=ua,dt<0&&(dt=0)),Wn>fa&&(Wn=fa,dt>0&&(dt=0))}fn=!1}function yr(e,a){if(!T)return;if(T.update(e,a),Dn<$n){Dn=Math.min($n,Dn+a);const me=Dn/$n,Se=1-Math.pow(1-me,3);Hn=Va*(1-Se),xt=-.12-.38*(1-Se)}else Hn!==0&&(Hn=0,Ln==="third"&&(xt=-.16));if(gr(a),mr(a),!T)return;mo=Math.max(0,mo-a*3.4),l.fov!==kn&&(l.fov=kn,l.updateProjectionMatrix());const i=Ln==="third",d=i||De==="run";Vt&&!Jt&&(Un+=(0-Un)*Math.min(1,a*4));const b=Vt?Un:0,A=Vt?T.eyeY+T.meshHeightAt(ge,ye)+b+Kn:T.eyeY+Wn,_=A-T.eyeHeight+Hn,L=Math.hypot(bt,St);L>.25&&(sn=Math.atan2(bt,St)),Qn=Math.max(0,Qn-a);const f=Fo>.25||jt.has("w")||jt.has("arrowup");if(i&&f&&Qn<=0&&L>qn*.8){const Se=(Math.PI-sn-We+Math.PI*3)%(Math.PI*2)-Math.PI;We+=Se*Math.min(1,a*.8)}if(fo>0?(fo-=a,fo<=0&&(an=0)):an>0&&(an=0),an<=0&&In>0&&(In=Math.max(0,In-a*.4)),T.avatar.setDown(an),T.avatar.setBurn(In),T.avatar.setVisible(d&&(De==="idle"||De==="run")),d){const me=T.normalAt(ge,ye),Se=Math.sin(sn),Ke=Math.cos(sn),Pe=Math.cos(sn),Ye=-Math.sin(sn),Je=-Math.asin(Math.max(-1,Math.min(1,me.x*Se+me.z*Ke))),Fe=-Math.asin(Math.max(-1,Math.min(1,me.x*Pe+me.z*Ye)));T.avatar.update(e,a,{x:ge,z:ye,feetY:_,facing:sn,speed:L,maxSpeed:Vt?qn+(ja-qn)*ho:No,grounded:Vt&&Jt,floating:!Vt,vy:dt,landing:mo,shadowY:T.solidFloor?T.meshHeightAt(ge,ye):null,shockT:T.impact.sinceImpact(),slopePitch:Vt?Math.max(-.26,Math.min(.26,Je)):0,slopeRoll:Vt?Math.max(-.26,Math.min(.26,Fe)):0,groundNormal:{x:me.x,y:me.y,z:me.z}})}if(i){const me=Number.isNaN(eo)?_+1.34:eo;eo=me+(_+1.34-me)*Math.min(1,a*3.2);const Se=eo,Ke=Math.cos(xt),Pe=Math.sin(We)*Ke,Ye=Math.sin(xt),Je=-Math.cos(We)*Ke;let Fe=Jn,rt=ge-Pe*Fe,zt=Se-Ye*Fe,Dt=ye-Je*Fe;if(T.solidFloor){const ht=T.meshHeightAt,nt=(Ft,Pt)=>Math.max(ht(Ft,Pt),ht(Ft+.6,Pt),ht(Ft-.6,Pt),ht(Ft,Pt+.6),ht(Ft,Pt-.6));for(let Ft=0;Ft<7;Ft+=1){rt=ge-Pe*Fe,Dt=ye-Je*Fe,zt=Se-Ye*Fe;const Pt=nt(rt,Dt)+.85;if(zt>=Pt)break;if(Pt-zt<=2.4){zt=Pt;break}if(Fe<=1.8){zt=Pt;break}Fe=Math.max(1.8,Fe*.8)}}l.position.set(rt,zt,Dt),an>.25?l.lookAt(ge-Math.sin(sn)*.85,_+.35,ye-Math.cos(sn)*.85):l.lookAt(ge,Se,ye)}else{const me=Math.min(1,L/qn),Se=Vt?Jt?Math.sin(ia*2)*.035*me:0:Math.sin(e*.5)*.25,Ke=A+Hn+Se;l.position.set(ge,Ke,ye);const Pe=Math.cos(xt);l.lookAt(ge+Math.sin(We)*Pe,Ke+Math.sin(xt),ye-Math.cos(We)*Pe)}De!=="idle"&&dr(e,a);const k=T.impact.shake();if(k>.002){const me=k;l.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*me*.6,l.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*me*.6,l.position.z+=(Math.sin(e*41.9+2.1)+Math.sin(e*25.6)*.5)*me*.45,l.rotateZ((Math.sin(e*35.2)*.6+Math.sin(e*21.7+1.1)*.4)*me*.05)}const W=T.impact.flash();c.toneMappingExposure=1.1+W*5.4;const Y=T.impact.doom(),Me=S.fog;if(Me){Me.color.copy(ca).lerp(ir,Y*.82);const me=De==="lift"||De==="escape"?Math.max(.06,1-Math.min(.94,ut/520)):1;Me.density=Do*(1+Y*2.4)*me}c.render(S,l)}const kt=new Map,ma=new Map;let rn=0,Pn=0,Io=!1,cn=0;const ss=new Ur,rs=new bo,is=e=>{if(ma.set(e.pointerId,{x:e.clientX,y:e.clientY}),T){if(r.setPointerCapture(e.pointerId),kt.set(e.pointerId,{x:e.clientX,y:e.clientY}),kt.size>=2){const[a,i]=[...kt.values()];rn=Math.hypot(a.x-i.x,a.y-i.y),Io=!0,Pn+=100}else Io=!1,Pn=0;return}if(Ee(),r.setPointerCapture(e.pointerId),Xn=!1,kt.set(e.pointerId,{x:e.clientX,y:e.clientY}),Pn=0,cn=performance.now(),kt.size===2){const[a,i]=[...kt.values()];rn=Math.hypot(a.x-i.x,a.y-i.y)}},cs=e=>{const a=kt.get(e.pointerId);if(!a)return;const i=e.clientX-a.x,d=e.clientY-a.y;if(kt.set(e.pointerId,{x:e.clientX,y:e.clientY}),T){if(kt.size>=2){const[A,_]=[...kt.values()],L=Math.hypot(A.x-_.x,A.y-_.y);rn>0&&L>0&&(Ln==="third"?Jn=Math.min(Za,Math.max($a,Jn*(rn/L))):kn=Math.min(Ga,Math.max(Ua,kn*(rn/L)))),rn=L,Pn+=Math.abs(i)+Math.abs(d)+10;return}Pn+=Math.abs(i)+Math.abs(d);const b=kn/aa;We-=i*.004*b,xt=Math.min(1.15,Math.max(-1.05,xt-d*.0035*b)),Math.abs(i)+Math.abs(d)>2&&(Qn=1.4);return}if(cn=performance.now(),kt.size===1)Pn+=Math.abs(i)+Math.abs(d),_e.theta-=i*.006,_e.phi=Math.min(2.9,Math.max(.2,_e.phi-d*.006)),Gt=null,Kt=null;else if(kt.size===2){const[b,A]=[...kt.values()],_=Math.hypot(b.x-A.x,b.y-A.y);rn>0&&(Ve.radius=us(Ve.radius*(rn/_))),rn=_,Pn+=10}},_o=e=>{const a=ma.get(e.pointerId),i=Io;if(ma.delete(e.pointerId),kt.delete(e.pointerId),rn=0,kt.size===0&&(Io=!1),T){(a?Math.hypot(e.clientX-a.x,e.clientY-a.y):1/0)<12&&!i&&kt.size===0&&pa();return}if(Pn<6&&n.onPick){const d=r.getBoundingClientRect();rs.set((e.clientX-d.left)/d.width*2-1,-((e.clientY-d.top)/d.height)*2+1),ss.setFromCamera(rs,l);const A=ss.intersectObjects([...ee.values(),...pt.values()],!1)[0]?.object.name;A&&ee.has(A)?n.onPick(A):A&&pt.has(A)&&n.onExtra?.(A)}},ls=e=>{if(T){e.preventDefault(),Ln==="third"?Jn=Math.min(Za,Math.max($a,Jn*(e.deltaY>0?1.1:.9))):kn=Math.min(Ga,Math.max(Ua,kn*(e.deltaY>0?1.1:.9)));return}e.preventDefault(),Ve.radius=us(Ve.radius*(e.deltaY>0?1.12:.89))};function us(e){return Ae!=="system"?Math.min(jn[Ae]*2.2,Math.max(jn[Ae]*.15,e)):Math.min(90,Math.max(ct==="system"&&!wt?4:.15,e))}const fs=e=>{if(!T)return;const a=e.target;if(a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"||a.isContentEditable))return;const i=e.key.toLowerCase();if(e.code==="KeyE"||e.code==="KeyF"||i==="e"||i==="f"){if(e.repeat||Dn<$n)return;e.preventDefault(),pa();return}(i===" "||i==="spacebar"||i==="w"||i==="a"||i==="s"||i==="d"||i.startsWith("arrow"))&&(e.preventDefault(),jt.add(i==="spacebar"?" ":i),(i===" "||i==="spacebar")&&(fn=!0))},ps=e=>{const a=e.key.toLowerCase();jt.delete(a==="spacebar"?" ":a)};window.addEventListener("keydown",fs),window.addEventListener("keyup",ps),r.addEventListener("pointerdown",is),r.addEventListener("pointermove",cs),r.addEventListener("pointerup",_o),r.addEventListener("pointercancel",_o),r.addEventListener("wheel",ls,{passive:!1});let mn=null,Wo=null,da=!matchMedia("(prefers-reduced-motion: reduce)").matches,ms=0,ds=0;da&&(mn=new Gr(c),mn.addPass(new Vr(S,l)),Wo=new Br(new bo(256,256),.75,.78,.92),mn.addPass(Wo),mn.addPass(new Or));const Ce={w:1,h:1},hs=()=>{Ce.w=t.clientWidth||1,Ce.h=t.clientHeight||1,c.setSize(Ce.w,Ce.h,!1),mn?.setSize(Ce.w,Ce.h),Wo?.resolution.set(Ce.w/2,Ce.h/2),l.aspect=Ce.w/Ce.h,l.updateProjectionMatrix()};hs();const vs=new ResizeObserver(hs);vs.observe(t);let gs=!0;const ys=new IntersectionObserver(e=>{gs=e.some(a=>a.isIntersecting)});ys.observe(t);const Q=new U,Bn=new U,to=new U,ha=new U,Mr=new U,wr=new U,xr=new U,br=new U,Ms=new U,Sr=new U;let va=0,ws=performance.now(),ga=-1e9,xs=0;const bs=e=>{va=requestAnimationFrame(bs);const a=Math.min(.1,(e-ws)/1e3);if(ws=e,document.hidden||!gs)return;if(T){yr(e/1e3,a);return}if(Po||(So.uniforms.time.value=e/1e3),!Po){for(const f of V)f.uniforms.time.value=e/1e3;for(const f of ne)f.uniforms.uTime.value=e/1e3}e-cn>3e3&&!Po&&!Gt&&!La&&!Xn&&Ae!=="eclipse"&&Ae!=="sizes"&&(_e.theta+=a*(ct==="system"?.03:.08)),ft?.rotateY(a*.01);for(const[f,k]of ee){if(f==="earth"||f==="moon"||Kt&&f===ct)continue;const W=go(f).spinHours;Po||k.rotateY(a*(f==="sun"?.02:W?.12*(24/W)*.25:.12))}yt&&(yt.visible=l.position.length()>4);for(const f of g)f.material.uniforms.uDays.value=(pe-$i)/864e5,f.material.uniforms.uTime.value=e/1e3;for(const f of K){const k=ee.get(f.parent);k&&f.mesh.material.uniforms.planetCenter.value.copy(k.getWorldPosition(Q))}for(const f of Z)f.mesh.getWorldPosition(Q),f.material.uniforms.ringCenter.value.copy(Q),f.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(f.mesh.matrixWorld).normalize();if(j&&e-xs>1e3&&(xs=e,pe=Date.now(),Rn(pe)),se){const f=ce.get(se.id),k=f.points.length,W=f.times[k-1],Y=(f.frame==="earth"?6:25)*864e5,me=f.marks.some(nt=>nt.at!==void 0&&nt.body&&nt.body!=="earth"&&Math.abs(se.sim-nt.at)<Y)?"slow":se.sim>=se.fastFrom?"fast":"normal",Se=me==="slow"?Math.min(se.base,2*Y/3):se.base*(me==="fast"?se.fast:1);se.sim=Math.min(W,se.sim+Se*Math.min(a,.1)),f.frame==="sun"?_t=(_t??se.sim)+Math.min(a,.1)*.15*864e5:_t=null,se.pace=me;const Ke=(se.sim-f.times[0])/(W-f.times[0]||1);let Pe=0,Ye=k-1;for(;Ye-Pe>1;){const nt=Pe+Ye>>1;f.times[nt]<=se.sim?Pe=nt:Ye=nt}const Je=f.times[Ye]-f.times[Pe],Fe=Pe+(Je>0?(se.sim-f.times[Pe])/Je:0),rt=Math.max(0,Math.min(k-2,Math.floor(Fe))),zt=Fe-rt;f.probe.position.lerpVectors(f.points[rt],f.points[rt+1],zt),on=Fe,f.probe.lookAt(f.line.localToWorld(f.points[Math.min(k-1,rt+2)].clone())),f.line.geometry.setDrawRange(0,rt+2);const Dt=f.times[rt]+(f.times[rt+1]-f.times[rt])*zt;j=!1,pe=Dt,Rn(Dt);let ht=0;for(let nt=0;nt<f.marks.length;nt+=1){const Ft=f.marks[nt],Pt=Ft.at??f.times[Math.min(k-1,Ft.index)];se.sim>=Pt-Y&&(ht=nt)}if((ht!==se.mark||e-se.lastPing>250||se.sim>=W&&!se.done)&&(se.mark=ht,se.lastPing=e,se.sim>=W&&(se.done=!0),n.onFlight?.({id:se.id,mark:f.marks[ht],progress:Ke,time:Dt,done:se.done,pace:se.pace})),se.done){const nt=f.frame==="earth";se=null,_t=null,j=!0,wt=nt?ze.get("earth")??null:null,nt||Ve.target.set(0,0,0),Ve.radius=nt?4.2:72,_e.phi=nt?.7:.45}}if(wt&&Ve.target.copy(wt.getWorldPosition(Q)),se){const f=ce.get(se.id);let k=null,W=1/0;for(const Me of f.marks){if(!Me.body||Me.body==="earth"||Me.body==="far")continue;const me=Math.abs(Me.index-on);me<14&&me<W&&(k=Me,W=me)}const Y=k?ze.get(k.body):void 0;if(Y){const Me=Y.getWorldPosition(xr).add(f.probe.getWorldPosition(br)).multiplyScalar(.5);Ve.target.copy(Me),Ve.radius=f.frame==="earth"?1.6:4.2}else Ve.radius=f.frame==="earth"?1.5:2.8}if(Yn.lerp(Ve.target,1-Math.pow(.002,a)),_e.radius+=(Ve.radius-_e.radius)*(1-Math.pow(.004,a)),Gt&&Kt){const f=ee.get(ct)?.getWorldPosition(Ms)??Ms.set(0,0,0);Gt.copy(Kt.getWorldPosition(Sr).sub(f).normalize());const k=Math.atan2(Gt.x,Gt.z),W=Math.acos(Math.max(-1,Math.min(1,Gt.y)));let Y=k-_e.theta;Y=Math.atan2(Math.sin(Y),Math.cos(Y)),_e.theta+=Y*(1-Math.pow(.01,a)),_e.phi+=(W-_e.phi)*(1-Math.pow(.01,a))}if(Ae==="blackhole"&&Ut.update(e/1e3,l),Ae==="exo"){const f=e/1e3;for(const k of st){const W=k.phase0+f/k.period*Math.PI*2;k.mesh.position.set(Math.cos(W)*k.a,0,Math.sin(W)*k.a)}}if(Ae==="eclipse"){mt=(mt+a*.18)%1;const f=Math.sin(mt*Math.PI*2),k=Math.abs(f)<.22,W=Math.max(0,1-Math.abs(f)/.9),Y=te==="lunar";if(E.visible=!Ue,oe.visible=Ue,ve.skySun.visible=!Y,ve.skyMoon.visible=Y,Ue)Y?(ve.skyMoon.position.set(f*1.7,0,.08),ve.skyMoonMat.color.set("#f2f2f2").lerp(new X("#c47462"),Y?W:0)):ve.skyCover.position.set(f*1.7,0,.08);else{ve.moon.position.set(Y?2.75:1.05,f*.55,0),ve.cone.visible=!Y,ve.umbra.visible=Y,ve.shadow.opacity=k?.42:.08,ve.umbra.material.opacity=k?.42:.08,ve.moonMat.color.set("#ffffff").lerp(new X("#c47462"),Y?W:0);const Me=k?q("개기"):Math.abs(f)<.6?q("부분"):Y?q("반영"):"";ue.textContent!==Me&&(ue.textContent=Me)}}if(l.position.set(Yn.x+_e.radius*Math.sin(_e.phi)*Math.sin(_e.theta),Yn.y+_e.radius*Math.cos(_e.phi),Yn.z+_e.radius*Math.sin(_e.phi)*Math.cos(_e.theta)),l.lookAt(Yn),P&&(P.getWorldPosition(Q),wn.copy(Q).multiplyScalar(-1).normalize(),e-ga>500&&!(se&&ce.get(se.id)?.frame==="sun"))){ga=e;const f=Qr(new Date(pe)),k=Math.atan2(f.y,f.x),W=Math.atan2(-wn.z,wn.x),Y=P.children[0];Y.rotation.y=W-k}mn&&da&&Ae!=="blackhole"&&(Ae!=="system"||ct==="system"||ct==="sun")&&mn?(mn.render(a),ms+=1,ds+=a,ms===90&&ds/90>.034&&(da=!1)):c.render(S,l),l.getWorldDirection(Bn),w();const b=[];for(const f of ea){const k=tt.get(f),W=ze.get(f);if(!k||!W)continue;W.getWorldPosition(Q);const Y=to.copy(Q).sub(l.position).dot(Bn)>0,Me=ct==="system"&&Ae==="system"&&(!wt||se!==null),me=ct==="earth"||ct==="moon"||se!==null&&ce.get(se.id)?.frame==="earth";let Se=Y&&(f==="moon"?Ae==="system"&&me:Me||me&&f==="earth"&&se!==null);Q.project(l);const Ke=(Q.x+1)/2*Ce.w;let Pe=Ke;const Ye=(1-Q.y)/2*Ce.h+10;if(Se){let Je=ko.get(f)??0;Je||(k.style.display="block",Je=k.offsetWidth||40,ko.set(f,Je)),Pe=Math.min(Math.max(Ke,Je/2+4),Math.max(Je/2+4,Ce.w-Je/2-4));const Fe={x:Pe-Je/2,y:Ye,w:Je,h:22};z(Fe.x,Fe.y,Fe.w,Fe.h)||b.some(rt=>Fe.x<rt.x+rt.w+4&&Fe.x+Fe.w+4>rt.x&&Fe.y<rt.y+rt.h&&Fe.y+Fe.h>rt.y)?Se=!1:b.push(Fe)}k.style.display=Se?"block":"none",Se&&(k.style.transform=`translate(${Pe}px, ${Ye}px) translate(-50%, 0)`)}const A=Ae==="system",_=ct!=="system"&&ct!=="jupiter"&&ct!=="saturn",L=wt!==null&&(se===null?wt===ze.get("earth"):ce.get(se.id)?.frame==="earth");for(const f of $t)f.visible=!_&&!L;for(const[f,k]of Ht){const W=Ne.get(f),Y=k.parent?ze.get(k.parent)===wt:ct==="system"&&(!wt||wt===W),Me=wt===W||Y;W.getWorldPosition(Q);const me=to.copy(Q).sub(l.position).dot(Bn)>0,Se=A&&me&&Me;Q.project(l),k.el.style.display=Se?"block":"none",Se&&(k.el.style.transform=`translate(${(Q.x+1)/2*Ce.w}px, ${(1-Q.y)/2*Ce.h+8}px) translate(-50%, 0)`)}for(const[f,k]of ce){const W=A&&F===f;if(k.line.visible=W,!W){k.el.style.display="none";continue}k.probe.getWorldPosition(Q);const Y=to.copy(Q).sub(l.position).dot(Bn)>0;Q.y+=0,Q.project(l),k.el.style.display=Y?"block":"none",Y&&(k.el.style.transform=`translate(${(Q.x+1)/2*Ce.w}px, ${(1-Q.y)/2*Ce.h}px) translate(10px, -50%)`)}for(const f of Wa){if(Ae!=="stars"){f.el.style.display="none";continue}Q.copy(f.at);const k=to.copy(Q).sub(l.position).dot(Bn)>0;Q.project(l);const W=k&&Math.abs(Q.x)<1&&Math.abs(Q.y)<1;f.el.style.display=W?"block":"none",W&&(f.el.style.transform=`translate(${(Q.x+1)/2*Ce.w}px, ${(1-Q.y)/2*Ce.h}px) translate(-50%, -50%)`)}for(const f of na){if(!(f.level===Ae)){f.el.style.display="none";continue}Q.copy(f.marker.position);const W=to.copy(Q).sub(l.position).dot(Bn)>0;Q.project(l),f.el.style.display=W?"block":"none",W&&(f.el.style.transform=`translate(${(Q.x+1)/2*Ce.w}px, ${(1-Q.y)/2*Ce.h+8}px) translate(-50%, 0)`)}for(const f of st){if(Ae!=="exo"){f.el.style.display="none";continue}f.mesh.getWorldPosition(Q);const k=to.copy(Q).sub(l.position).dot(Bn)>0;Q.project(l),f.el.style.display=k?"block":"none",k&&(f.el.style.transform=`translate(${(Q.x+1)/2*Ce.w}px, ${(1-Q.y)/2*Ce.h+8}px) translate(-50%, 0)`)}for(const f of nr){if(Ae!=="blackhole"){f.el.style.display="none";continue}Q.copy(f.at),Ut.group.localToWorld(Q),Q.project(l);const k=Q.z<1&&Math.abs(Q.x)<1.05&&Math.abs(Q.y)<1.05;f.el.style.display=k?"block":"none",k&&(f.el.style.transform=`translate(${(Q.x+1)/2*Ce.w}px, ${(1-Q.y)/2*Ce.h}px) translate(-50%, -100%)`)}for(const f of Ct){if(Ae!=="exo"){f.el.style.display="none";continue}Q.copy(f.at).project(l);const k=Q.z<1&&Math.abs(Q.x)<1.05&&Math.abs(Q.y)<1.05;f.el.style.display=k?"block":"none",k&&(f.el.style.transform=`translate(${(Q.x+1)/2*Ce.w}px, ${(1-Q.y)/2*Ce.h}px) translate(-50%, -100%)`)}for(const[f,k]of[[vt,Ae==="eclipse"&&!Ue],[Ge,Ae==="sizes"]])for(const W of f){if(!k){W.el.style.display="none";continue}Q.copy(W.at).applyMatrix4(W.group.matrixWorld).project(l);let Y=Q.z<1&&Math.abs(Q.x)<1.1&&Math.abs(Q.y)<1.1;const Me=(Q.x+1)/2*Ce.w,me=(1-Q.y)/2*Ce.h,Se=W.el.offsetWidth||44;Y&&z(Me-Se/2,me-11,Se,22)&&(Y=!1),W.el.style.display=Y?"block":"none";const Ke=W.group.rotation.z!==0;Y&&(W.el.style.transform=`translate(${(Q.x+1)/2*Ce.w}px, ${(1-Q.y)/2*Ce.h}px) ${Ke?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const f of ke){f.mesh.getWorldPosition(Q);const k=ee.get(f.parent);k?k.getWorldPosition(ha):ha.set(0,0,0);let Y=Mr.copy(Q).sub(ha).normalize().dot(wr.copy(l.position).sub(Q).normalize())>.15&&Ae==="system"&&ct===f.parent;Q.project(l),Y&&z((Q.x+1)/2*Ce.w+8,(1-Q.y)/2*Ce.h-11,90)&&(Y=!1),f.el.style.display=Y?"block":"none",Y&&(f.el.style.transform=`translate(${(Q.x+1)/2*Ce.w}px, ${(1-Q.y)/2*Ce.h}px) translate(8px, -50%)`)}};return va=requestAnimationFrame(bs),we===0&&n.onReady?.(),typeof window<"u"&&location.search.includes("surfdebug")&&(window.__surfDebug=()=>({surf:T?{shock:T.impact.sinceImpact(),doom:T.impact.doom(),flash:T.impact.flash(),shake:T.impact.shake(),stats:T.impact.stats()}:null,x:Number(ge.toFixed(2)),z:Number(ye.toFixed(2)),y:Number(l.position.y.toFixed(2)),yaw:Number(We.toFixed(2)),pitch:Number(xt.toFixed(2)),jump:Number(Kn.toFixed(2)),knock:[Number(Gn.toFixed(2)),Number(Vn.toFixed(2))],mode:Ln,alt:Number(Hn.toFixed(2)),ground:T?Number(T.meshHeightAt(ge,ye).toFixed(2)):null,camY:Number(l.position.y.toFixed(2)),cam:[Number(l.position.x.toFixed(2)),Number(l.position.z.toFixed(2))],feet:T?Number((T.eyeY+T.meshHeightAt(ge,ye)-T.eyeHeight).toFixed(2)):null,third:Number(Jn.toFixed(2)),avatar:T?{vis:T.avatar.group.visible,x:Number(T.avatar.group.children[0]?.position.x.toFixed(1)),y:Number((T.avatar.group.children[0]?.position.y??0).toFixed(1))}:null,down:Number(an.toFixed(2)),burn:Number(In.toFixed(2)),rocket:{phase:De,alt:Number(ut.toFixed(1)),count:zn,pad:[Number(Et.toFixed(1)),Number(Nt.toFixed(1))]}})),{focus:oa,setLevel:To,setPaused:e=>{La=e},focusMarker:e=>{const a=na.find(i=>i.level===Ae&&i.marker.id===e);a&&(Ve.target.copy(a.marker.position),Ve.radius=jn[Ae]*(e==="cmb"?1.4:Ae==="group"?.6:.42),cn=performance.now())},showSite:ar,focusExtra:or,setEclipse:(e,a)=>{te=e,Ue=a,To("eclipse")},setHemisphere:e=>{ct!=="earth"&&oa("earth");const a=wn.clone().multiplyScalar(e==="day"?1:-1);_e.theta=Math.atan2(a.x,a.z),_e.phi=Math.min(2.6,Math.max(.5,Math.acos(a.y))),Gt=null,Kt=null,Xn=!0},enterSurface:Ka,setSurfaceWorld:lr,exitSurface:Ja,setSurfaceMove:(e,a)=>{Fo=Math.min(1,Math.max(-1,e)),la=Math.min(1,Math.max(-1,a))},jumpSurface:()=>{fn=!0},setSurfaceMode:hr,setSurfaceSkin:vr,impactSurface:fr,launchSurfaceRocket:as,dropProbe:pa,setTime:e=>{j=e===null,pe=e??Date.now(),Rn(pe),ga=-1e9},setVoyage:e=>{if(F=e,!e){se&&(se=null,j=!0),_t=null;for(const k of ce.values())k.line.geometry.setDrawRange(0,1/0);return}Ae!=="system"&&To("system"),_t=null;const a=ce.get(e);a.line.geometry.setDrawRange(0,2),ct="system",Gt=null,Kt=null,Xn=!1,wt=a.probe;const i=a.frame==="earth";Ve.radius=i?1.3:2.8,_e.phi=i?.75:1;const d=Math.max(...a.marks.filter(k=>k.at!==void 0&&k.body!=="earth").map(k=>k.at),a.times[0]+864e5),b=a.times[0],A=a.times[a.times.length-1],_=(d-b)/(i?20:24),L=a.frame==="earth"?A:d+60*864e5,f=A>L?(A-L)/4/_:1;se={id:e,sim:b,base:_,fastFrom:L,fast:f,mark:-1,done:!1,lastPing:0,pace:"normal"},cn=performance.now()},dispose:()=>{Uo(),Rt?.dispose(),mn?.dispose(),Wo?.dispose(),T&&(S.remove(T.group),T.dispose(),T=null),cancelAnimationFrame(va),vs.disconnect(),ys.disconnect(),window.removeEventListener("keydown",fs),window.removeEventListener("keyup",ps),r.removeEventListener("pointerdown",is),r.removeEventListener("pointermove",cs),r.removeEventListener("pointerup",_o),r.removeEventListener("pointercancel",_o),r.removeEventListener("wheel",ls),S.traverse(e=>{const a=e.material;Array.isArray(a)&&a.forEach(i=>i.dispose())}),C.forEach(e=>e.dispose()),c.dispose(),r.remove(),h.remove()}}}export{Mc as createSpace};
