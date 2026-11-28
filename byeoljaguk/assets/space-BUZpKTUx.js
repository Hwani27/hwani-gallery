import{t as U,a as xs}from"./index-ButKroSN.js";import{G as Ce,a as L,c as he,M as te,e as De,A as ke,D as Be,V as I,R as lt,P as Rn,f as kn,b as Ln,g as Wn,h as _n,d as G,i as Et,j as cn,k as ao,l as so,I as Xt,m as ro,n as Va,O as to,S as zn,N as bs,C as rn,o as ja,p as Ss,q as ks,L as Ps,r as zs,s as Xa,t as In,u as Fn,W as Cs,v as As,w as Ts,x as Ds,T as Es,y as Ns,z as Rs,E as Is,F as Co,H as Fs,J as Ws,K as Ao,Q as ka,U as _s,X as Ls,Y as Us,Z as Gs,_ as Bs,$ as Os,a0 as Vs,a1 as js,a2 as Pa,a3 as za,a4 as Xs,a5 as $s}from"./three-Cu77B3NG.js";import{af as Ys,ag as Ca,ah as Hs,ai as To,aj as Aa,ak as Zs,al as Ks,am as En,C as qs,an as Js,ao as Yn,ap as Qs}from"./App-c7GIveZg.js";import{C as Ta}from"./sky-PfbXoSod.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";import"./audio-D2UAU1Qh.js";const Da=`
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
`,Hn=3,Do=9;function er(t){const o=new Ce;o.visible=!1,o.rotation.z=.1;const n=new L(t(new he(1,48,32)),t(new te({color:"#000000"})));n.renderOrder=0,o.add(n);const u=t(new De({uniforms:{uTime:{value:0},uCam:{value:new I}},transparent:!0,depthWrite:!1,side:Be,blending:ke,vertexShader:`
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
        ${Da}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${Hn.toFixed(1)}) / ${(Do-Hn).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${Hn.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),f=new L(t(new lt(Hn,Do,256,8)),u);f.rotation.x=-Math.PI/2,f.renderOrder=1,o.add(f);const k=t(new De({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:ke,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${Da}
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
      `})),r=new L(t(new Rn(8,8)),k);r.renderOrder=2,o.add(r);const h=[{name:U("궁수자리 A*"),at:new I(0,3.6,0)},{name:U("사건의 지평선"),at:new I(0,-2.9,0)},{name:U("강착 원반"),at:new I(Do-1.2,0,0)}],E=new I;return{group:o,labels:h,update(g,b){u.uniforms.uTime.value=g,k.uniforms.uTime.value=g,b.getWorldPosition(E),u.uniforms.uCam.value.copy(E),r.lookAt(E)}}}const Nn=Math.PI/180;function Dt(t,o,n){return new I(Math.cos(o*Nn)*Math.cos(t*Nn),Math.sin(o*Nn),-Math.cos(o*Nn)*Math.sin(t*Nn)).multiplyScalar(n)}function tr(){const o=document.createElement("canvas");o.width=64,o.height=64;const n=o.getContext("2d");if(n){const u=n.createRadialGradient(32,32,0,32,32,32);u.addColorStop(0,"rgba(255,255,255,1)"),u.addColorStop(.25,"rgba(255,255,255,0.75)"),u.addColorStop(1,"rgba(255,255,255,0)"),n.fillStyle=u,n.fillRect(0,0,64,64)}return new Ln(o)}function nr(){const t=[],o=g=>(t.push(g),g),n=o(tr());function u(g,b,z){const w=new Wn(o(new _n({map:n,color:new G(g),transparent:!0,depthWrite:!1,blending:ke})));return w.scale.setScalar(b),w.position.copy(z),w}function f(g,b,z){const w=new Float32Array(g*3),l=new Float32Array(g*3);for(let c=0;c<g;c+=1){const[R,D]=b(c);w.set([R.x,R.y,R.z],c*3),l.set([D.r,D.g,D.b],c*3)}const C=o(new Et);return C.setAttribute("position",new cn(w,3)),C.setAttribute("color",new cn(l,3)),new ao(C,o(new so({size:z,map:n,vertexColors:!0,transparent:!0,depthWrite:!1,blending:ke,sizeAttenuation:!0})))}let k=7;const r=()=>(k=k*16807%2147483647,(k-1)/2147483646),h={},E={};{const g=new Ce,b=2.6,z=[["alphacen",U("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",U("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",U("바너드별"),269.45,4.69,5.96,"#ffb27a",U("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",U("울프 359"),164.12,7.01,7.86,"#ff9a6a",U("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",U("시리우스"),101.29,-16.72,8.6,"#cfe0ff",U("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",U("로스 154"),282.46,-23.84,9.69,"#ffa070",U("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",U("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",U("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",U("백조자리 61"),316.7,38.75,11.4,"#ffc58a",U("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",U("프로키온"),114.83,5.22,11.46,"#fff3d6",U("작은개자리의 밝은 별이에요.")],["epsind",U("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",U("남쪽 하늘의 가까운 별이에요.")],["taucet",U("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",U("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];g.add(u("#ffe39a",3.2,new I));const w=[{id:"sun-star",name:U("태양"),line:U("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new I}];for(const[l,C,c,R,D,j,Z]of z){const V=Dt(c,R,D*b);g.add(u(j,2.4,V)),w.push({id:l,name:C,line:xs("{0} 거리 약 {1}광년.",Z,D),position:V})}g.add(f(500,()=>[new I(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(60+r()*30),new G().setHSL(.1,.3,.5+r()*.4)],.9)),h.stars=g,E.stars=w}{const g=new Ce,b=1/40,z=[["pleiades",U("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,U("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",U("베텔게우스"),88.79,7.41,548,"#ffab6e",3,U("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",U("리겔"),78.63,-8.2,860,"#cfe0ff",3,U("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",U("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,U("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",U("데네브"),310.36,45.28,2600,"#e6eeff",3,U("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];g.add(u("#ffe39a",1.6,new I));const w=[{id:"sun-orion",name:U("태양"),line:U("우리은하의 오리온 팔 안쪽에 있어요."),position:new I}];for(const[l,C,c,R,D,j,Z,V]of z){const re=Dt(c,R,D*b);g.add(u(j,Z,re)),l==="orionneb"&&g.add(f(260,()=>{const ne=Math.pow(r(),.6)*5;return[new I(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(ne).add(re),new G(r()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),w.push({id:l,name:C,line:V,position:re})}g.add(f(1400,()=>{const l=(r()-.5)*120,C=(r()-.5)*22*(.4+r()),c=(r()-.5)*4;return[new I(l,c,C),new G().setHSL(.6+r()*.1,.3,.35+r()*.3)]},.8)),h.orion=g,E.orion=w}{const g=new Ce,b=4;g.add(f(9e3,w=>{const l=w%b,C=Math.pow(r(),.55)*25,c=l/b*Math.PI*2+Math.log(1+C)*1.9+(r()-.5)*(.5+4/(C+2)),R=(r()-.5)*(C<4?2.2:.7),D=C<4,j=D?new G("#ffd9a0"):new G().setHSL(.58+r()*.06,.45,.45+r()*.35);return[new I(Math.cos(c)*C,R,Math.sin(c)*C),j.multiplyScalar(D?.8:.6)]},.55)),g.add(u("#fff0c8",7,new I));const z=new I(13,0,0);g.add(u("#ffe39a",1.2,z)),h.galaxy=g,E.galaxy=[{id:"center",name:U("은하 중심(궁수자리 A*)"),line:U("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new I},{id:"sun-gal",name:U("태양은 여기"),line:U("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:z}]}{const g=new Ce,b=1/1e5,z=(D,j,Z,V,re)=>f(V,ne=>{const le=Math.pow(r(),.6)*j,de=ne%2*Math.PI+Math.log(1+le*3)*2.2+(r()-.5)*.9,oe=new I(Math.cos(de)*le,(r()-.5)*j*.05,Math.sin(de)*le);oe.applyAxisAngle(new I(1,0,0),Z);const J=le<j*.18;return[oe.add(D),new G().setHSL(J?.1:re,.4,.45+r()*.3).multiplyScalar(J?.35:.22)]},.4),w=new I;g.add(z(w,2.2,0,1800,.6));const l=Dt(10.68,41.27,25e5*b);g.add(z(l,4.4,1.2,3200,.1));const C=Dt(23.46,30.66,273e4*b);g.add(z(C,1.6,.6,900,.62));const c=Dt(80.89,-69.76,16e4*b);g.add(u("#cfd8ff",1.2,c));const R=Dt(13.19,-72.83,2e5*b);g.add(u("#cfd8ff",.8,R)),h.group=g,E.group=[{id:"mw",name:U("우리 은하"),line:U("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:w},{id:"andromeda",name:U("안드로메다은하"),line:U("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:l},{id:"triangulum",name:U("삼각형자리은하"),line:U("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:C},{id:"lmc",name:U("대마젤란은하"),line:U("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:c}]}{const g=new Ce,b=6,z=(D,j,Z)=>new I(D,j,Z).multiplyScalar(b),w=z(5.1,.35,1.1),l=z(3.4,.45,.2),C=z(-1.4,-.3,-.5),c=[[z(.2,0,0),900,6.4*b*.5],[l,280,1.5*b*.5],[C,220,1.7*b*.5],[z(-2.2,1.6,2.4),120,1.1*b*.5]],R=c.reduce((D,j)=>D+j[1],0);g.add(f(R+180,D=>{let j=D;for(const[V,re,ne]of c){if(j<re)return[new I(r()-.5,(r()-.5)*.5,r()-.5).multiplyScalar(2*ne*Math.pow(r(),.5)).add(V),new G("#f3eee6").multiplyScalar(.75)];j-=re}const Z=r();return[w.clone().lerp(C,Z).add(new I((r()-.5)*.7*b,(r()-.5)*.45*b,(r()-.5)*.7*b)),new G("#e7c48a").multiplyScalar(.8)]},.5)),g.add(new L(o(new he(.95*b,20,16)),o(new te({color:"#d5e2f5",transparent:!0,opacity:.1,blending:ke,depthWrite:!1}))).translateX(l.x).translateY(l.y).translateZ(l.z)),g.add(new L(o(new he(1.05*b,20,16)),o(new te({color:"#e7c48a",transparent:!0,opacity:.09,blending:ke,depthWrite:!1}))).translateX(C.x).translateY(C.y).translateZ(C.z)),g.add(u("#e4b56a",1.2,w)),h.super=g,E.super=[{id:"localgroup",name:U("우리 은하군"),line:U("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:w},{id:"virgo-sc",name:U("처녀자리 은하단"),line:U("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:l},{id:"attractor-sc",name:U("거대 인력체"),line:U("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:C}]}{const g=new Ce,b=1/1e7,z=Dt(187.7,12.4,54e6*b),w=Dt(243,-60,2e8*b);g.add(f(5e3,C=>{const c=C%5,D=[z,w,Dt(30,20,15e7*b),Dt(160,-30,18e7*b),Dt(300,40,14e7*b)][c],j=c===1?7:4;return[new I((r()-.5)*2,(r()-.5)*2,(r()-.5)*2).multiplyScalar(j*Math.pow(r(),.4)).add(D),new G().setHSL(.08+r()*.5,.35,.55).multiplyScalar(.8)]},.8)),g.add(u("#ffffff",.8,new I));const l=new L(o(new he(42,48,32)),o(new te({color:"#ff8a4a",transparent:!0,opacity:.08,side:kn,depthWrite:!1})));g.add(l),h.cosmos=g,E.cosmos=[{id:"here",name:U("우리 은하"),line:U("여기서는 점 하나예요."),position:new I},{id:"virgo",name:U("처녀자리 은하단"),line:U("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:z},{id:"attractor",name:U("거대 인력체"),line:U("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:w},{id:"cmb",name:U("가장 오래된 빛"),line:U("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new I(0,0,-42)}]}for(const g of Object.values(h))g.visible=!1;return{groups:h,markers:E,dispose:()=>t.forEach(g=>g.dispose())}}const Zn=1.7,Ea=t=>{const o=Math.min(1,Math.max(0,t));return o*o*(3-2*o)};function Na(t){try{const o=navigator;typeof o.vibrate=="function"&&o.vibrate(t)}catch{}}function Eo(t,o,n){const f=document.createElement("canvas");f.width=128,f.height=128;const k=f.getContext("2d"),r=k.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,t),r.addColorStop(.35,o),r.addColorStop(1,n),k.fillStyle=r,k.fillRect(0,0,128,128);const h=new Ln(f);return h.colorSpace=zn,h}function or(t){const o=new Ce,n=(()=>{let Y=2654435769;return()=>(Y=Y*1664525+1013904223>>>0,Y/4294967296)})(),u=Eo("rgba(255,255,255,1)","rgba(255,168,64,0.85)","rgba(255,90,0,0)"),f=Eo("rgba(120,104,96,0.55)","rgba(70,60,56,0.35)","rgba(40,34,32,0)"),k=Eo("rgba(255,255,255,1)","rgba(255,214,160,0.7)","rgba(255,140,40,0)"),r=[u,f,k],h=Y=>(r.push(Y),Y),E=new Ce,g=new L(h(new Xt(1,1)),h(new te({color:new G(2757128),fog:!1})));g.scale.setScalar(15),E.add(g);const b=new L(h(new Xt(1,1)),h(new te({color:new G(16742946),transparent:!0,opacity:.85,blending:ke,depthWrite:!1,fog:!1})));b.scale.setScalar(21),E.add(b);const z=(Y,_,M,ae=ke)=>{const ce=h(new _n({map:Y,color:new G(_),transparent:!0,depthWrite:!1,blending:ae,fog:!1})),X=new Wn(ce);return X.scale.setScalar(M),X},w=z(k,16747050,150);E.add(w);const l=z(u,16765562,70);E.add(l),E.visible=!1,o.add(E);const C=[],c=96;for(let Y=0;Y<c;Y+=1){const _=Y%3===0,M=z(_?f:u,_?9074022:16747571,1,_?bs:ke);M.visible=!1,o.add(M),C.push({sprite:M,mat:M.material,life:0,max:1,from:1,to:1,rise:0,driftX:1,driftZ:1,spin:0,smoke:_})}let R=0;const D=(Y,_,M,ae,ce,X,N)=>{let ee=null;for(let st=0;st<C.length;st+=1){const p=C[(R+st)%C.length];if(p.smoke===_&&(p.life<=0||!ee)&&(ee=p,R=(R+st+1)%C.length,p.life<=0))break}ee&&(ee.sprite.position.copy(Y),ee.sprite.visible=!0,ee.life=ae,ee.max=ae,ee.from=M*.45,ee.to=M,ee.rise=ce,ee.driftX=(n()-.5)*X,ee.driftZ=(n()-.5)*X,ee.spin=(n()-.5)*1.4,ee.sprite.material.rotation=n()*Math.PI*2,ee.mat.opacity=_?.46:.55,N!==void 0?ee.mat.color.setHex(N):ee.mat.color.setHex(_?7035474:16742946),ee.sprite.scale.setScalar(ee.from))},j=new L(h(new he(1,32,20)),h(new te({color:new G(16757575),transparent:!0,opacity:0,blending:ke,depthWrite:!1,side:Be,fog:!1})));j.visible=!1,o.add(j);const Z=new L(h(new he(1,24,16)),h(new te({color:new G(16774872),transparent:!0,opacity:0,blending:ke,depthWrite:!1,side:Be,fog:!1})));Z.visible=!1,o.add(Z);const V=new L(h(new he(1,28,18)),h(new te({color:new G(16731410),transparent:!0,opacity:0,blending:ke,depthWrite:!1,side:Be,fog:!1})));V.visible=!1,o.add(V);const re=[],ne=(Y,_,M,ae,ce,X,N)=>{const ee=h(new te({color:new G(M),transparent:!0,opacity:ae,blending:ke,depthWrite:!1,side:Be,fog:!1})),st=h(new lt(Y,_,64,1)),p=new L(st,ee);ce&&(p.rotation.x=-Math.PI/2),p.visible=!1,o.add(p);const v={mesh:p,mat:ee,grow:X,life:0,max:N,flat:ce};return re.push(v),v};ne(.92,1,16742946,.9,!0,480,1.3),ne(.9,1,16726538,.75,!0,620,1.9),ne(.86,1,16765066,.7,!0,340,.9),ne(.82,1,11569770,.5,!0,420,2.6),ne(.95,1,16769712,.55,!1,700,1.6);const le=220,de=h(new Et),oe=new Float32Array(le*3),J=new Float32Array(le*3);de.setAttribute("position",new cn(oe,3));const Fe=h(new so({color:new G(16756832),size:2.4,transparent:!0,opacity:0,depthWrite:!1,blending:ke,sizeAttenuation:!0,fog:!1})),Oe=new ao(de,Fe);Oe.frustumCulled=!1,Oe.visible=!1,o.add(Oe);const Ue=150,Me=new ro(h(new Xt(1,0)),h(new te({color:new G(16777215),transparent:!0,opacity:1,fog:!1})),Ue);Me.instanceMatrix.setUsage(Va),Me.frustumCulled=!1,Me.visible=!1,o.add(Me);const It=[];for(let Y=0;Y<Ue;Y+=1)It.push({p:new I,v:new I,s:1,spin:new I,rot:new I});const Se=new to,Ae=new Ce;Ae.visible=!1,o.add(Ae);const Je=h(new te({color:new G(1773580),transparent:!0,opacity:0,depthWrite:!1,fog:!1})),Ht=h(new te({color:new G(3809818),transparent:!0,opacity:0,depthWrite:!1,fog:!1})),wt=h(new te({color:new G(16734738),transparent:!0,opacity:0,blending:ke,depthWrite:!1,side:Be,fog:!1})),vt=h(new te({color:new G(16756832),transparent:!0,opacity:0,blending:ke,depthWrite:!1,fog:!1})),kt=(Y,_,M,ae)=>{Y.rotateX(-Math.PI/2);const ce=t.floorAt(_,M)-t.heightAt(_,M),X=Y.attributes.position;for(let N=0;N<X.count;N+=1){const ee=X.getX(N),st=X.getZ(N);X.setY(N,t.heightAt(_+ee,M+st)+ce+ae)}return X.needsUpdate=!0,Y.computeVertexNormals(),Y};function Pt(Y,_,M){Ae.clear();const ae=kt(h(new rn(56,72)),Y,_,.35),ce=new L(ae,Je);ce.position.set(Y,0,_),Ae.add(ce);const X=kt(h(new lt(48,66,72,1)),Y,_,.5),N=new L(X,Ht);N.position.set(Y,0,_),Ae.add(N);const ee=kt(h(new lt(22,56,72,1)),Y,_,.42),st=new L(ee,wt);st.position.set(Y,0,_),Ae.add(st);const p=kt(h(new rn(24,64)),Y,_,.45),v=new L(p,vt);v.position.set(Y,0,_),Ae.add(v),Ae.visible=!0}let fe=-1,Qe=-1,zt=new I,Q=new I,K=!1;function Ft(){for(const Y of C)Y.life=0,Y.sprite.visible=!1}function ut(Y,_,M=0,ae=0){Ft();const ce=t.floorAt(Y,_);Q.set(Y,ce,_);const X=M||0,N=ae||0;zt.set(Y+X*900,ce+520,_+N*900),E.visible=!0,E.position.copy(zt),j.visible=!1,V.visible=!1;for(const ee of re)ee.life=0,ee.mesh.visible=!1;Me.visible=!1,Oe.visible=!1,Fe.opacity=0,K=!1,Qe=-1,fe=0,Na([30,90,40])}function Zt(Y,_){if(!(fe<0)){if(fe+=_,!K&&fe>=Zn){K=!0,Qe=fe,Na([140,60,240,70,320,80,420,110,520,160,380]),t.onImpact?.(),Pt(Q.x,Q.z,Q.y),j.visible=!0,V.visible=!0,Me.visible=!0,Oe.visible=!0,Fe.opacity=.95;for(const M of re)M.life=M.max,M.mesh.visible=!0,M.mesh.scale.setScalar(4),M.mesh.position.set(Q.x,Q.y+(M.flat?.6:2),Q.z),M.flat||M.mesh.rotation.set(0,0,0);for(let M=0;M<Ue;M+=1){const ae=It[M],ce=n()*Math.PI*2,X=6+n()*34;ae.p.set(Q.x+Math.cos(ce)*X*.2,Q.y+2+n()*8,Q.z+Math.sin(ce)*X*.2);const N=28+n()*62;ae.v.set(Math.cos(ce)*N,26+n()*70,Math.sin(ce)*N),ae.s=.7+Math.pow(n(),2)*4.6,ae.spin.set((n()-.5)*6,(n()-.5)*6,(n()-.5)*6),ae.rot.set(n()*3,n()*3,n()*3)}Me.material.opacity=1;for(let M=0;M<Ue;M+=1){const ae=M%3===0;Me.setColorAt(M,new G(ae?16747066:M%3===1?8010270:4860444))}Me.instanceColor&&(Me.instanceColor.needsUpdate=!0);for(let M=0;M<le;M+=1){const ae=n()*Math.PI*2,ce=Math.sqrt(n())*90;oe[M*3]=Q.x+Math.cos(ae)*ce,oe[M*3+1]=Q.y+20+n()*260,oe[M*3+2]=Q.z+Math.sin(ae)*ce,J[M*3]=(n()-.5)*24,J[M*3+1]=-(16+n()*34),J[M*3+2]=(n()-.5)*24}de.attributes.position.needsUpdate=!0}if(!K){const M=Math.min(1,fe/Zn),ae=Math.pow(M,2.15);E.position.lerpVectors(zt,Q,ae);const ce=(1-ae)*40;E.position.x+=Math.sin(fe*9.1)*ce,E.position.z+=Math.cos(fe*7.3)*ce,E.rotation.x+=_*2.2,E.rotation.y+=_*1.4,w.scale.setScalar(150+Math.sin(fe*20)*26),l.scale.setScalar(70+Math.sin(fe*26)*14);for(let X=0;X<2;X+=1){const N=E.position.clone();N.x+=(n()-.5)*26,N.y+=(n()-.5)*26,N.z+=(n()-.5)*26,D(N,!1,90+n()*60,.9+n()*.5,6,18)}D(E.position.clone(),!0,150+n()*90,1.8+n()*.8,12,26)}for(const M of C){if(M.life<=0)continue;if(M.life-=_,M.life<=0){M.sprite.visible=!1;continue}const ae=1-M.life/M.max,ce=M.from+(M.to-M.from)*Math.sqrt(ae);M.sprite.scale.setScalar(ce),M.sprite.position.y+=M.rise*_*(1-ae),M.sprite.position.x+=M.driftX*_,M.sprite.position.z+=M.driftZ*_,M.sprite.material.rotation+=M.spin*_;const X=M.smoke?Math.pow(1-ae,1.8)*.46:Math.pow(1-ae,1.3)*.55;M.mat.opacity=X}if(K){const M=fe-Qe,ae=(X,N,ee)=>X+(N-X)*Ea(M/ee);j.scale.setScalar(ae(2,46,.85)),j.material.opacity=Math.max(0,1-M/1.9)*.95,Z.scale.setScalar(ae(1,24,.4)),Z.material.opacity=Math.max(0,1-M/.5),j.position.set(Q.x,Q.y+8,Q.z),Z.position.set(Q.x,Q.y+10,Q.z),V.scale.setScalar(ae(3,34,1)),V.material.opacity=Math.max(0,.6-M/1.3*.6),V.position.set(Q.x,Q.y+4,Q.z);for(const X of re){if(X.life<=0)continue;if(X.life-=_,X.life<=0){X.mesh.visible=!1;continue}const N=1-X.life/X.max;X.mesh.scale.setScalar(4+X.grow*Math.pow(N,.6)),X.mat.opacity=Math.max(0,(1-N)*(X.flat?.85:.6))}if(M<1.8&&M%.085<_){const X=new I(Q.x+(n()-.5)*18,Q.y+3+n()*6,Q.z+(n()-.5)*18);n()<.65&&D(X,!1,76+n()*56,1.4+n()*.7,14+n()*12,20,16761962),D(X,!0,60+n()*46,1.8+n()*.8,12+n()*10,26,11573898)}if(M<1.7&&M%.05<_){const X=n()*Math.PI*2,N=26+M*46+n()*22,ee=new I(Q.x+Math.cos(X)*N,Q.y+2+n()*12,Q.z+Math.sin(X)*N);D(ee,!0,50+n()*40,1.6,7,14,11573376),n()<.55&&D(ee,!1,70+n()*60,1.3,10,10,16751164)}if(M>.4&&M<2.8&&M%.11<_){const X=n()*Math.PI*2,N=16+n()*46,ee=new I(Q.x+Math.cos(X)*N,Q.y+34+n()*30,Q.z+Math.sin(X)*N);D(ee,!0,70+n()*52,2,8,24,10520692)}const ce=Me.material;if(ce.opacity=Math.max(0,1-Math.max(0,M-3.4)/1.2),ce.opacity<=.01)Me.visible=!1;else{for(let X=0;X<Ue;X+=1){const N=It[X];N.v.y-=9.81*.55*_,N.v.multiplyScalar(1-_*.12),N.p.addScaledVector(N.v,_);const ee=t.floorAt(N.p.x,N.p.z)+N.s*.4;N.p.y<ee&&(N.p.y=ee,N.v.y=Math.abs(N.v.y)*.32,N.v.x*=.7,N.v.z*=.7),N.rot.x+=N.spin.x*_,N.rot.y+=N.spin.y*_,N.rot.z+=N.spin.z*_,Se.position.copy(N.p),Se.rotation.set(N.rot.x,N.rot.y,N.rot.z),Se.scale.setScalar(N.s),Se.updateMatrix(),Me.setMatrixAt(X,Se.matrix)}Me.instanceMatrix.needsUpdate=!0}if(Oe.visible)if(Fe.opacity=Math.max(0,.95-Math.max(0,M-4)/1.6),Fe.opacity<=.01)Oe.visible=!1;else{for(let X=0;X<le;X+=1){const N=X*3;oe[N]+=J[N]*_,oe[N+1]+=J[N+1]*_,oe[N+2]+=J[N+2]*_,J[N+1]-=5*_;const ee=t.floorAt(oe[N],oe[N+2])+.4;oe[N+1]<ee&&(oe[N]=Q.x+(n()-.5)*160,oe[N+1]=Q.y+120+n()*160,oe[N+2]=Q.z+(n()-.5)*160,J[N]=(n()-.5)*20,J[N+1]=-(14+n()*26),J[N+2]=(n()-.5)*20)}de.attributes.position.needsUpdate=!0}Je.opacity=Math.min(.92,M*2.2),Ht.opacity=Math.min(.9,M*2.2),wt.opacity=Math.max(0,.85*Math.exp(-M/5.5)),vt.opacity=Math.max(0,.9*Math.exp(-M/1.8))}if(K&&(E.visible=!1),fe>80){fe=-1,Qe=-1,E.visible=!1,j.visible=!1,Z.visible=!1,V.visible=!1,Ae.visible=!1;for(const M of C)M.life=0,M.sprite.visible=!1;for(const M of re)M.life=0,M.mesh.visible=!1;Me.visible=!1,Oe.visible=!1}}}return{group:o,strike:ut,doom:()=>{if(fe<0)return 0;if(!K)return Math.min(1,Ea(fe/(Zn*.82))*(.93+.07*Math.sin(fe*12)));const Y=fe-Qe;return Y<1.8?1:Math.max(0,1-(Y-1.8)/20)},flash:()=>{if(!K)return 0;const Y=fe-Qe,_=Math.exp(-Y/.16),M=Y>.35?.5*Math.exp(-(Y-.35)/.3):0;return Math.min(1,_+M)},shake:()=>{if(fe<0)return 0;if(!K)return .02+Math.pow(fe/Zn,3)*.18;const Y=fe-Qe;if(Y>3.6)return 0;let _=1.55*Math.exp(-Y/1.35);return _+=.55*Math.exp(-Math.pow((Y-1.55)/.22,2)),_+=.32*Math.exp(-Math.pow((Y-2.35)/.26,2)),_+=.18*Math.exp(-Math.pow((Y-3)/.3,2)),_*Math.min(1,Y/.06)},sinceImpact:()=>Qe>=0?fe-Qe:-1,stats:()=>{const Y=C.filter(M=>M.life>0),_=Y[0];return{t:Number(fe.toFixed(2)),target:[Number(Q.x.toFixed(1)),Number(Q.y.toFixed(1)),Number(Q.z.toFixed(1))],start:[Number(zt.x.toFixed(1)),Number(zt.z.toFixed(1))],alive:Y.length,map:_?!!_.mat.map:null,op:_?Number(_.mat.opacity.toFixed(2)):null,sc:_?Number(_.sprite.scale.x.toFixed(1)):null,pos:_?_.sprite.position.toArray().map(M=>Number(M.toFixed(1))):null,vis:_?_.sprite.visible:null,fire:[Number(j.material.opacity.toFixed(2)),Number(j.scale.x.toFixed(0)),j.visible],crater:[Ae.visible,Ae.children.length,Number(Je.opacity.toFixed(2)),Number(wt.opacity.toFixed(2))]}},update:Zt,dispose:()=>{o.clear(),r.forEach(Y=>Y.dispose())}}}const ar=`
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
`,sr=`
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
`,rr=`
uniform float uTile;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vUv = wp.xz / uTile;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,ir=`
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
`,Ra=`
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
`,Ia=`
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
`,xn=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,No=`
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
`,Kn=`
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
`,St=Math.PI*2,$a=9,Fa=140;function Nt(t){return t<0?0:t>1?1:t}function no(t,o,n){return t<o?o:t>n?n:t}function Yt(t,o,n){const u=Nt((n-t)/(o-t));return u*u*(3-2*u)}function Qt(t,o,n){let u=Math.imul(t|0,374761393)^Math.imul(o|0,668265263)^Math.imul(n|0,2246822519);return u=Math.imul(u^u>>>13,1274126177),((u^u>>>16)>>>0)/4294967295}function cr(t,o,n,u){const f=Math.floor(t),k=Math.floor(o),r=t-f,h=o-k,E=r*r*(3-2*r),g=h*h*(3-2*h),b=Math.max(1,Math.round(n)),z=V=>(V%b+b)%b,w=z(f),l=z(f+1),C=z(k),c=z(k+1),R=Qt(w,C,u),D=Qt(l,C,u),j=Qt(w,c,u),Z=Qt(l,c,u);return(R+(D-R)*E)*(1-g)+(j+(Z-j)*E)*g}function Rt(t,o,n,u,f){let k=0,r=.5,h=0,E=n;for(let g=0;g<u;g+=1)k+=r*cr(t*E,o*E,E,f+g*17),h+=r,r*=.5,E*=2;return k/h}function Ya(t){let o=t>>>0||1;return()=>(o=Math.imul(o,1664525)+1013904223>>>0,o/4294967296)}function Cn(t,o){const n=document.createElement("canvas");n.width=t,n.height=o;const u=n.getContext("2d");if(!u)throw new Error("2D canvas is unavailable");return{canvas:n,ctx:u}}const lr={crater:{seed:101,macro:.38,mid:.17,fine:.12,speck:.15,craters:20,stones:90,cracks:0,ripples:0,gloss:.02},rock:{seed:211,macro:.4,mid:.22,fine:.14,speck:.2,craters:5,stones:150,cracks:9,ripples:1,gloss:.05},volcano:{seed:331,macro:.32,mid:.24,fine:.16,speck:.22,craters:4,stones:110,cracks:14,ripples:0,gloss:.08},ice:{seed:401,macro:.26,mid:.2,fine:.2,speck:.16,craters:5,stones:18,cracks:22,ripples:0,gloss:.5},plain:{seed:509,macro:.3,mid:.15,fine:.1,speck:.13,craters:8,stones:70,cracks:3,ripples:.35,gloss:.03},plasma:{seed:601,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0},ring:{seed:701,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0}};function oo(t,o,n,u,f,k,r,h,E=!1){const g=Math.ceil(k),b=Math.round(u),z=Math.round(f);for(let w=-g;w<=g;w+=1)for(let l=-g;l<=g;l+=1){const C=(l*l+w*w)/(k*k);if(C>=1)continue;const c=E?Math.sqrt(1-C):1-C,R=((b+l)%n+n)%n,j=((z+w)%n+n)%n*n+R;t[j]+=r*c,o[j]+=h*c}}function ur(t,o,n,u,f,k,r){const h=.09+r()*.12,E=.05+r()*.06,g=.72+r()*.5,b=r()*Math.PI,z=Math.cos(b),w=Math.sin(b),l=Math.ceil(k*1.4),C=Math.round(u),c=Math.round(f);for(let R=-l;R<=l;R+=1)for(let D=-l;D<=l;D+=1){const j=(D*z+R*w)/k,Z=(-D*w+R*z)/(k*g),V=Math.sqrt(j*j+Z*Z);if(V>1.4)continue;let re=0,ne=0;V<1&&(re-=Math.pow(1-V*V,1.25)*h,ne-=(1-V)*.05);const le=Math.exp(-Math.pow((V-1.02)/.2,2))*E;re+=le,ne+=le*1.1+(V>1&&V<1.35?.02:0);const de=((C+D)%n+n)%n,J=((c+R)%n+n)%n*n+de;o[J]+=re,t[J]+=ne}}function Ro(t,o,n,u,f,k,r,h,E,g){const z=Math.max(2,Math.floor(r/1.1));let w=k,l=u,C=f;for(let c=0;c<z;c+=1){w+=(E()-.5)*.3,l+=Math.cos(w)*1.1,C+=Math.sin(w)*1.1;const R=h*(.6+E()*.8);g?(oo(t,o,n,l,C,R*2.2,.03,.008),oo(t,o,n,l,C,R,-.05,-.03)):oo(t,o,n,l,C,R,-.07,-.03)}}function fr(t,o){const n=lr[t],u=Ya(n.seed),f=o/$a,k=new Float32Array(o*o),r=new Float32Array(o*o),h=new Float32Array(o*o),E=7;for(let l=0;l<o;l+=1){const C=l/o;for(let c=0;c<o;c+=1){const R=c/o,D=l*o+c,j=Rt(R,C,3,4,n.seed),Z=Rt(R,C,11,3,n.seed+13),V=Rt(R,C,43,2,n.seed+29),re=Qt(c,l,n.seed+71)-.5;let ne=1+(j-.5)*n.macro+(Z-.5)*n.mid+(V-.5)*n.fine+re*n.speck,le=.5+(j-.5)*.06+(Z-.5)*.07+(V-.5)*.08+re*.03,de=n.gloss;if(n.ripples>0){const oe=C*E+(j-.5)*.85+(Z-.5)*.3,J=Math.sin(oe*St);ne+=J*.055*n.ripples,le+=J*.018*n.ripples}if(t==="volcano"){const oe=1-Math.abs(2*V-1);oe>.94?(ne+=(oe-.94)*2.2,le-=.02,de+=.1):oe<.22&&(ne-=(.22-oe)*.6)}t==="ice"&&(Math.abs(Z-.5)<.012&&(ne-=.24,le-=.035),ne=.82+(ne-1)*.95+(V-.5)*.12,de=Nt(.35+V*.55)),(t==="crater"||t==="ring")&&j<.34&&(ne-=(.34-j)*1.1),t==="plain"&&(ne+=Yt(.55,.78,j)*.18),k[D]=ne,r[D]=le,h[D]=de}}for(let l=0;l<n.craters;l+=1){const C=(.3+Math.pow(u(),1.7)*1.1)*f;ur(k,r,o,u()*o,u()*o,C,u)}for(let l=0;l<n.stones;l+=1){const c=(u()<.18?.14+u()*.3:.03+u()*.09)*f,R=l%3===0?.12:-.08;oo(k,r,o,u()*o,u()*o,Math.max(.8,c),R,.02+c*.0012,!0)}for(let l=0;l<n.cracks;l+=1){const C=u()*o,c=u()*o,R=(.6+u()*3.4)*f;Ro(k,r,o,C,c,u()*St,R,.8+u()*1.4,u,t==="ice")}if(t==="ice"){const l=()=>.5;for(let C=0;C<11;C+=1){const c=u()*St,R=o*(.45+u()*.75),D=u()*o,j=u()*o;Ro(k,r,o,D-Math.cos(c)*R*.5,j-Math.sin(c)*R*.5,c,R,1+u()*1.4,l,!0)}for(let C=0;C<10;C+=1){const c=u()*o,R=u()*o,D=u()*St;Ro(k,r,o,c,R,D,(.4+u()*1.6)*f,.8+u(),u,!0)}}const{canvas:g,ctx:b}=Cn(o,o),z=b.createImageData(o,o),w=z.data;for(let l=0;l<o*o;l+=1)w[l*4]=Math.round(no(k[l]*.5,0,1)*255),w[l*4+1]=Math.round(no(r[l],0,1)*255),w[l*4+2]=Math.round(no(h[l],0,1)*255),w[l*4+3]=255;return b.putImageData(z,0,0),g}function be(t){const o=parseInt(t.replace("#",""),16);return[o>>16&255,o>>8&255,o&255]}function yt(t,o,n){return[t[0]+(o[0]-t[0])*n,t[1]+(o[1]-t[1])*n,t[2]+(o[2]-t[2])*n]}function pr(t,o,n){const u=t*o,f=Math.floor(u),k=u-f,r=z=>{const w=(z%2+2)%2===0,l=Qt(z,7,n);return w?.56+.4*l:.04+.3*l},h=r(f),E=r(f-1),g=r(f+1),b=.44;return k<b?E+(h-E)*Yt(0,1,k/b):k>1-b?h+(g-h)*Yt(0,1,(k-(1-b))/b):h}const Wo={jupiter:{bands:16,seed:3301,streaky:.8,polar:null,spots:[{u:.62,v:.66,ru:.085,rv:.05,color:be("#a8492f"),swirl:2},{u:.24,v:.34,ru:.05,rv:.026,color:be("#f6efdd"),swirl:0},{u:.46,v:.4,ru:.035,rv:.02,color:be("#fbf3e1"),swirl:0},{u:.83,v:.44,ru:.03,rv:.018,color:be("#f4ecd9"),swirl:0},{u:.36,v:.74,ru:.06,rv:.03,color:be("#8d4b30"),swirl:0}]},saturn:{bands:20,seed:3307,streaky:.38,polar:be("#c9d4d8"),spots:[{u:.7,v:.3,ru:.04,rv:.02,color:be("#f7edd2"),swirl:0},{u:.3,v:.72,ru:.035,rv:.018,color:be("#e6d3a4"),swirl:0}]},uranus:{bands:7,seed:3313,streaky:.25,polar:be("#e6fbfd"),spots:[{u:.55,v:.36,ru:.06,rv:.03,color:be("#dcf4f6"),swirl:0}]},neptune:{bands:9,seed:3319,streaky:.5,polar:be("#a9c8f2"),spots:[{u:.34,v:.62,ru:.06,rv:.032,color:be("#1f3a72"),swirl:1},{u:.72,v:.46,ru:.05,rv:.012,color:be("#e9f3ff"),swirl:0},{u:.62,v:.36,ru:.035,rv:.009,color:be("#f2f8ff"),swirl:0}]}};function dr(t,o,n,u=2){const f=new Uint8ClampedArray(t.length);for(let k=0;k<u;k+=1){for(let r=0;r<n;r+=1)for(let h=0;h<o;h+=1){const E=(h-1+o)%o*4,g=h*4,b=(h+1)%o*4,z=r*o*4;for(let w=0;w<3;w+=1)f[z+g+w]=(t[z+E+w]+t[z+g+w]*2+t[z+b+w])/4}for(let r=0;r<n;r+=1){const h=(r-1+n)%n*o*4,E=r*o*4,g=(r+1)%n*o*4;for(let b=0;b<o;b+=1){const z=b*4;for(let w=0;w<3;w+=1)t[E+z+w]=(f[h+z+w]+f[E+z+w]*2+f[g+z+w])/4}}}}function Ha(t,o,n){const u=Wo[t.id]??Wo.jupiter,f=be(t.ground),k=be(t.ground2),r=be(t.ground3),{canvas:h,ctx:E}=Cn(o,n),g=E.createImageData(o,n),b=g.data,z=u.seed,w=new Float32Array(o*n),l=new Float32Array(o*n);for(let D=0;D<n;D+=1){const j=D/n;for(let Z=0;Z<o;Z+=1){const V=Z/o,re=(Rt(V,j,4,3,z)-.5)*.03+(Rt(V,j,13,2,z+7)-.5)*.005,ne=Nt(j+re);let le=pr(ne,u.bands,z);const de=Rt(V*3,j*9,9,3,z+31)-.5;le+=de*.13*u.streaky;let oe;if(le<.5?oe=yt(r,k,Nt(le*2)):oe=yt(k,f,Nt((le-.5)*2)),u.polar){const Fe=Yt(.82,1,Math.abs(j-.5)*2);oe=yt(oe,u.polar,Fe*.45)}for(const Fe of u.spots){const Oe=(V-Fe.u)/Fe.ru,Ue=(j-Fe.v)/Fe.rv,Me=Oe*Oe+Ue*Ue;if(Me<2.2){const It=Yt(1.05,.25,Me),Se=Fe.swirl>0?.82+.18*Math.sin(Math.atan2(Ue,Oe)*3+Me*7):1;oe=yt(oe,[Fe.color[0]*Se,Fe.color[1]*Se,Fe.color[2]*Se],It*.92)}}const J=(D*o+Z)*4;b[J]=oe[0],b[J+1]=oe[1],b[J+2]=oe[2],b[J+3]=255,w[D*o+Z]=Nt(.5+de*.85+(le-.5)*.5),l[D*o+Z]=.5+de*.85}}const C=t.sunAz*Math.PI/180,c=Math.sin(C),R=-Math.cos(C);for(let D=0;D<n;D+=1){const j=(D+1)%n,Z=(D-1+n)%n;for(let V=0;V<o;V+=1){const re=(V+1)%o,ne=(V-1+o)%o,le=l[D*o+re]-l[D*o+ne],de=l[j*o+V]-l[Z*o+V],oe=no(1+(le*c+de*R)*1.8,.9,1.1),J=(D*o+V)*4;b[J]=Math.min(255,b[J]*oe),b[J+1]=Math.min(255,b[J+1]*oe),b[J+2]=Math.min(255,b[J+2]*oe),b[J+3]=Math.round(Nt(.74+w[D*o+V]*.4)*255)}}return dr(b,o,n,2),E.putImageData(g,0,0),h}function mr(t,o){if(Wo[t.id])return Ha(t,o,o);const{canvas:n,ctx:u}=Cn(o,o),f=u.createImageData(o,o),k=f.data,r=be(t.ground),h=be(t.ground2),E=be(t.ground3);for(let g=0;g<o;g+=1){const b=g/o;for(let z=0;z<o;z+=1){const w=z/o,l=Rt(w,b,4,4,9021),C=Rt(w,b,16,3,9027),c=Nt(l*.72+C*.4);let R=yt(h,r,Yt(.25,.72,c));R=yt(R,E,Yt(.66,.95,c)*.8);const D=(g*o+z)*4;k[D]=R[0],k[D+1]=R[1],k[D+2]=R[2],k[D+3]=255}}return u.putImageData(f,0,0),n}function vr(t,o,n){const{canvas:u,ctx:f}=Cn(o,n),k=Ya(t==="moon"?51:t==="pluto"?67:83),r=t==="pluto"?"#cbb6a4":t==="charon"?"#9d9a95":"#9a9691";if(f.fillStyle=r,f.fillRect(0,0,o,n),t==="pluto")f.fillStyle="#f3ece1",f.beginPath(),f.ellipse(o*.56,n*.46,o*.13,n*.16,-.2,0,St),f.fill(),f.beginPath(),f.ellipse(o*.72,n*.4,o*.07,n*.12,.35,0,St),f.fill(),f.fillStyle="rgba(96,68,54,0.62)",f.beginPath(),f.ellipse(o*.24,n*.6,o*.2,n*.13,.1,0,St),f.fill(),f.beginPath(),f.ellipse(o*.2,n*.32,o*.14,n*.1,-.2,0,St),f.fill();else if(t==="moon")for(let h=0;h<9;h+=1)f.fillStyle=`rgba(58,56,54,${.5+k()*.3})`,f.beginPath(),f.ellipse(k()*o,(.18+k()*.6)*n,(.04+k()*.07)*o,(.03+k()*.06)*n,k()*3,0,St),f.fill();else f.fillStyle="rgba(120,84,70,0.6)",f.beginPath(),f.ellipse(o*.5,n*.06,o*.4,n*.09,0,0,St),f.fill();for(let h=0;h<220;h+=1){const E=(2+Math.pow(k(),2.4)*26)*(o/1024),g=k()*o,b=k()*n,z=f.createRadialGradient(g,b,0,g,b,E);z.addColorStop(0,"rgba(38,36,34,0.5)"),z.addColorStop(.72,"rgba(70,66,62,0.28)"),z.addColorStop(.9,"rgba(238,233,224,0.32)"),z.addColorStop(1,"rgba(255,255,255,0)"),f.fillStyle=z,f.beginPath(),f.arc(g,b,E,0,St),f.fill()}for(let h=0;h<2600;h+=1){const E=(.6+Math.pow(k(),3)*4)*(o/1024);f.fillStyle=k()<.5?"rgba(255,255,255,0.16)":"rgba(30,28,26,0.16)",f.beginPath(),f.arc(k()*o,k()*n,E,0,St),f.fill()}return u}function hr(t,o){const{canvas:n,ctx:u}=Cn(t,o),f=u.createImageData(t,o),k=f.data,r=be("#0f3f74"),h=be("#2f8fb0"),E=be("#3f7a45"),g=be("#9a8a55"),b=be("#f2f7fc");for(let z=0;z<o;z+=1){const w=z/o;for(let l=0;l<t;l+=1){const C=l/t,c=C*3.1,R=w*2.4,D=Rt(c,R,4,5,4404)+(Rt(c*3,R*3,12,3,4411)-.5)*.18,j=D>.55;let Z;if(j){const de=Nt((D-.55)*4.2);Z=yt(E,g,de*.7),de>.55&&(Z=yt(Z,be("#cfc9bb"),(de-.55)*1.6))}else Z=yt(r,h,Nt((D-.35)*3.2));const V=Yt(.86,.98,Math.abs(w-.5)*2);V>0&&(Z=yt(Z,b,V));const re=Rt(C*2,w*6,12,4,4423),ne=Yt(.56,.82,re)*.72;ne>0&&(Z=yt(Z,be("#fbfdff"),ne));const le=(z*t+l)*4;k[le]=Z[0],k[le+1]=Z[1],k[le+2]=Z[2],k[le+3]=255}}return u.putImageData(f,0,0),n}function gr(t,o,n,u){if(t==="earth")return hr(n,u);if(t==="moon"||t==="pluto"||t==="charon")return vr(t,n,u);const f=t==="saturn"?{...o,id:"saturn",ground:"#f2e2ba",ground2:"#c6a978",ground3:"#9b7f52"}:{...o,id:"jupiter",ground:"#e9d6b4",ground2:"#b57d50",ground3:"#8b5a38"};return Ha(f,n,u)}function yr(t){const{canvas:n,ctx:u}=Cn(t,4),f=u.createImageData(t,4),k=f.data,r=1.11,h=2.36,E=be("#f6efdd"),g=be("#c9b48d"),b=be("#6f6455"),z=[[1.11,1.235,.1,.15],[1.235,1.525,.42,.3],[1.525,1.95,.98,.62],[1.951,2.025,.06,.1],[2.025,2.21,.72,.5],[2.211,2.215,.04,.1],[2.215,2.27,.66,.46],[2.27,2.31,.06,.1],[2.315,2.34,.34,.55]];for(let w=0;w<t;w+=1){const l=w/(t-1),C=r+(h-r)*l;let c=0,R=.5;for(const[re,ne,le,de]of z)if(C>=re&&C<=ne){c=le,R=de,c*=.82+.18*Math.sin((C-re)*820+Math.sin((C-re)*140)*2);break}const D=[1.29,1.44,1.63,1.72,1.88,2.06,2.15,2.24,2.29];for(const re of D)Math.abs(C-re)<.0035&&(c*=.12);c*=.9+.14*Qt(Math.floor(C*900),3,9931);const j=Qt(Math.floor(w/2),7,9931);let Z=yt(g,E,R);Z=yt(Z,b,(1-Math.min(1,c))*.35);const V=.82+j*.3;for(let re=0;re<4;re+=1){const ne=(re*t+w)*4;k[ne]=Z[0]*V,k[ne+1]=Z[1]*V,k[ne+2]=Z[2]*V,k[ne+3]=Math.round(Nt(c)*255)}}return u.putImageData(f,0,0),n}const $t=new Map;function io(t,o,n,u,f,k){const r=new Ln(o);for(r.colorSpace=n?zn:ja,r.wrapS=u?Ss:ks,r.wrapT=r.wrapS,r.anisotropy=f,r.magFilter=Ps,r.minFilter=zs,r.generateMipmaps=!0,r.needsUpdate=!0,$t.set(t,r);$t.size>k;){const h=$t.keys().next();if(h.done)break;const E=$t.get(h.value);$t.delete(h.value),E?.dispose()}return r}function wr(t,o,n){const u=`ground:${t}:${o?"l":"h"}`,f=$t.get(u);return f||io(u,fr(t,o?320:512),!1,!0,n,6)}function Mr(t,o,n){const u=`cloud:${t.id}:${o?"l":"h"}`,f=$t.get(u);return f||io(u,mr(t,o?512:1024),!0,!0,n,4)}function Wa(t,o,n,u){const k=`body:${t??o.id}:${n?"l":"h"}`,r=$t.get(k);if(r)return r;const h=n?768:1024;return io(k,gr(t,o,h,h/2),!0,!1,u,3)}function Io(t,o){const n=`ring:${t?"l":"h"}`,u=$t.get(n);return u||io(n,yr(t?1024:2048),!0,!1,o,2)}const Pn=Math.PI/180,bn=1500,qn=2800,_a=-4.3;function Jn(t,o){const n=Math.sin(t*127.1+o*311.7)*43758.5453;return n-Math.floor(n)}function _o(t){return t*t*(3-2*t)}function xr(t,o){const n=Math.floor(t),u=Math.floor(o),f=t-n,k=o-u,r=Jn(n,u),h=Jn(n+1,u),E=Jn(n,u+1),g=Jn(n+1,u+1),b=_o(f),z=_o(k);return(r*(1-b)+h*b)*(1-z)+(E*(1-b)+g*b)*z}function Qn(t,o,n=4){let u=0,f=.5,k=1;for(let r=0;r<n;r+=1)u+=f*xr(t*k,o*k),k*=2.03,f*=.5;return u}function Sn(t){let o=t>>>0||1;return()=>(o=o*1664525+1013904223>>>0,o/4294967296)}function br(t){let o=2166136261;for(let n=0;n<t.length;n+=1)o=Math.imul(o^t.charCodeAt(n),16777619);return o>>>0}function Fo(t,o){const n=t*Pn,u=o*Pn;return new I(Math.sin(n)*Math.cos(u),Math.sin(u),-Math.cos(n)*Math.cos(u)).normalize()}function Sr(){const o=document.createElement("canvas");o.width=128,o.height=128;const n=o.getContext("2d"),u=n.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);u.addColorStop(0,"rgba(255,255,255,1)"),u.addColorStop(.25,"rgba(255,236,196,0.72)"),u.addColorStop(.6,"rgba(255,190,110,0.18)"),u.addColorStop(1,"rgba(255,170,80,0)"),n.fillStyle=u,n.fillRect(0,0,128,128);const f=new Ln(o);return f.colorSpace=zn,f}const kr=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Pr=`
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
`,zr=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Cr=`
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
`;function Ar(t,o={}){const n=!!o.low,u=o.anisotropy??(n?4:8),f=new Ce,k=[],r=p=>(k.push(p),p);let h=null;const E=br(t.id),g=Sn(E),b=r(Sr()),z=[],w=[];if(t.terrain==="crater"){for(let p=0;p<(n?16:26);p+=1){const v=g()*Math.PI*2,F=20+Math.sqrt(g())*460,P=16+g()*74;z.push({x:Math.cos(v)*F,z:Math.sin(v)*F,r:P,d:P*(.16+g()*.2)})}for(let p=0;p<(n?26:48);p+=1){const v=g()*Math.PI*2,F=4+Math.pow(g(),.7)*150,P=2.5+Math.pow(g(),1.6)*11;z.push({x:Math.cos(v)*F,z:Math.sin(v)*F,r:P,d:P*(.2+g()*.22)})}}if(t.terrain==="volcano")for(let p=0;p<6;p+=1){const v=g()*Math.PI*2,F=60+g()*380;w.push({x:Math.cos(v)*F,z:Math.sin(v)*F,r:40+g()*90,h:12+g()*34})}if(t.terrain==="rock")for(let p=0;p<5;p+=1){const v=g()*Math.PI*2,F=60+g()*400;w.push({x:Math.cos(v)*F,z:Math.sin(v)*F,r:50+g()*110,h:6+g()*16})}function l(p,v,F,P=4){return(Qn(p*F,v*F,P)-.48)*2}function C(p,v){if(t.terrain==="plasma"||t.terrain==="ring")return 0;const F=Math.hypot(p,v);let P=0;if(t.terrain==="crater"){P=l(p+11,v+7,.004,4)*16+l(p+3,v+17,.0012,2)*34+l(p+5,v+23,.026,3)*3;for(const $ of z){const A=Math.hypot(p-$.x,v-$.z)/$.r;A<1&&(P-=$.d*Math.pow(1-A*A,1.5)),A<1.3&&(P+=$.d*.28*Math.exp(-Math.pow((A-1.02)/.17,2)))}}else if(t.terrain==="rock"){P=l(p+5,v+2,.0035,4)*40,P+=(1-Math.abs(l(p,v,.011,3)))*12,P+=l(p+21,v+13,.0011,2)*60,P+=l(p+31,v+41,.028,3)*3.4;for(const $ of w){const A=Math.hypot(p-$.x,v-$.z)/$.r;A<1&&(P+=$.h*Math.pow(1-A,1.7))}}else if(t.terrain==="volcano"){P=l(p+3,v+8,.005,4)*14+l(p+9,v+1,.0012,2)*22;for(const $ of w){const A=Math.hypot(p-$.x,v-$.z)/$.r;A<1&&(P+=$.h*Math.pow(1-A,1.25)),A<.24&&(P-=$.h*.5*(1-A/.24))}}else t.terrain==="ice"?P=l(p+9,v+4,.003,4)*9+l(p,v,.012,2)*2.2+l(p+2,v+8,.035,3)*1.1:P=l(p+7,v+3,.0035,4)*12+l(p,v,.012,2)*2.6+l(p+4,v+2,.03,3)*3;const m=Math.max(0,F-1500)/500;return P-=m*m*5,P+=(Qn(p*.09+1,v*.09+6,2)-.5)*(t.terrain==="rock"?1.2:t.terrain==="ice"?.25:.5),P}const c=C(0,0);function R(p,v){return C(p,v)-c}const D=(()=>{if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring")return{x:0,z:0};const p=[];for(let F=0;F<40;F+=1){const P=F/40*Math.PI*2,m=F%5*34,$=Math.cos(P)*m,A=Math.sin(P)*m;let ue=0;for(let pe=0;pe<8;pe+=1){const et=pe/8*Math.PI*2;ue+=R($+Math.cos(et)*120,A+Math.sin(et)*120)}p.push({x:$,z:A,score:R($,A)-ue/8})}p.sort((F,P)=>P.score-F.score);const v=p[Math.floor(p.length*.28)];return{x:v.x,z:v.z}})(),j=t.cloudTop!==null?t.cloudTop:R(D.x,D.z),Z=1.7,V=Fo(t.sunAz,t.sunElev),re=t.sunScale>0?.2667*t.sunScale*Pn:0,ne=Math.max(0,Math.min(1,t.fogDensity*26)),le=new G(t.skyTop),de=new G(t.skyBottom),oe=new G(t.glow),J=r(new De({vertexShader:kr,fragmentShader:Pr,side:kn,depthWrite:!1,uniforms:{uTop:{value:le.clone()},uBottom:{value:de.clone()},uGlow:{value:oe.clone()},uSun:{value:new G(t.sunColor)},uSunDir:{value:V.clone()},uSunRadius:{value:re},uSunHaze:{value:ne},uGlowGain:{value:t.glowGain}}})),Fe=new L(r(new he(qn,32,20)),J);Fe.frustumCulled=!1,f.add(Fe);let Oe=null;if(t.stars){const p=n?320:620,v=new Float32Array(p*3),F=Sn(E^2654435769);for(let A=0;A<p;A+=1){const ue=F()*Math.PI*2,pe=Math.pow(F(),.65)*.98+.02,et=Math.sqrt(1-pe*pe);v[A*3]=Math.cos(ue)*et*(qn-200),v[A*3+1]=pe*(qn-200),v[A*3+2]=Math.sin(ue)*et*(qn-200)}const P=r(new Et);P.setAttribute("position",new cn(v,3));const m=r(new so({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1}));Oe=m;const $=new ao(P,m);$.frustumCulled=!1,f.add($)}const Ue=Math.min(1.5,.45+.9*Math.min(1,Math.max(t.sunScale,.02)*1.5)),Me=t.stars?.4:.46,It=(p,v)=>{const P=-(R(p+.9,v)-R(p-.9,v))/1.8,m=-(R(p,v+.9)-R(p,v-.9))/(2*.9),$=1/Math.sqrt(P*P+1+m*m),A=Math.max(0,(P*V.x+V.y+m*V.z)*$);return Me+Ue*A};let Se=[],Ae=null;if(t.terrain==="plasma"){const p=r(new De({vertexShader:zr,fragmentShader:Cr,uniforms:{uTime:{value:0},uA:{value:new G(t.ground)},uB:{value:new G(t.ground2)},uC:{value:new G(t.ground3)}}}));Ae=p;const v=new L(r(new Rn(2400,2400,1,1)),p);v.rotation.x=-Math.PI/2,v.position.y=0,f.add(v)}else if(t.terrain!=="ring")if(t.cloudTop!==null){const p=Mr(t,n,u),v=Math.min(1.12,.55+.5*Math.min(1,Math.max(t.sunScale,.02)*2)),F=(A,ue)=>r(new De({vertexShader:rr,fragmentShader:ir,uniforms:{uMap:{value:p},uOffset:{value:new Fn(0,0)},uTile:{value:A},uDetail:{value:11},uTint:{value:new G().setScalar(ue)},uOpacity:{value:1},uFogColor:{value:new G(t.fog)},uFogDensity:{value:t.fogDensity}}})),P=new L(r(new Rn(5200,5200,1,1)),F(Fa,v));P.rotation.x=-Math.PI/2,P.position.y=t.cloudTop,f.add(P),Se=[P.material];const m=F(Fa*.42,v*.86);m.uniforms.uOpacity.value=.55,m.transparent=!0,m.depthWrite=!1;const $=new L(r(new Rn(5200,5200,1,1)),m);$.rotation.x=-Math.PI/2,$.position.y=t.cloudTop-90,f.add($),Se.push(m)}else{const p=n?96:150,v=r(new Rn(bn*2,bn*2,p,p));v.rotateX(-Math.PI/2);const F=v.attributes.position,P=new Float32Array(F.count*3),m=new G(t.ground),$=new G(t.ground2),A=new G(t.ground3),ue=new G;for(let Ie=0;Ie<F.count;Ie+=1){const Ke=F.getX(Ie)/bn,rt=F.getZ(Ie)/bn,Ee=Math.sign(Ke)*Math.pow(Math.abs(Ke),1.8)*bn,We=Math.sign(rt)*Math.pow(Math.abs(rt),1.8)*bn,it=R(Ee,We);F.setXYZ(Ie,Ee,it,We);const ht=Qn(Ee*.02+3,We*.02+9,3);ue.copy(m).lerp($,_o(Math.min(1,Math.max(0,(ht-.28)/.5)))),it<-1.6&&ue.lerp(A,Math.min(1,(-it-1.6)/7));const Te=Qn(Ee*.0045+17,We*.0045+41,3),Ve=Math.min(1.9,It(Ee,We))*(.9+(ht-.5)*.22)*(.84+Te*.34);P[Ie*3]=ue.r*Ve,P[Ie*3+1]=ue.g*Ve,P[Ie*3+2]=ue.b*Ve}v.setAttribute("color",new cn(P,3)),v.computeVertexNormals();const pe=wr(t.terrain,n,u),et=1/(pe.image.width||512),tt=r(new De({vertexShader:ar,fragmentShader:sr,vertexColors:!0,uniforms:{uMap:{value:pe},uTexel:{value:et},uTile:{value:$a},uDetail:{value:5.6},uBump:{value:9},uGloss:{value:t.terrain==="ice"?.9:.25},uSunDir:{value:V.clone()},uSunColor:{value:new G(t.sunColor)},uFogColor:{value:new G(t.fog)},uFogDensity:{value:t.fogDensity},uAmbient:{value:Me},uSunPower:{value:Ue}}})),Ze=new L(v,tt);f.add(Ze);const Re=Sn(E^2135587861),ln=[t.ground2,t.ground3,t.ground].map(Ie=>new G(Ie).multiplyScalar(Me+Ue*.75)),Mt=(Ie,Ke,rt,Ee,We,it,ht)=>{const Te=new ro(Ie,r(new te({color:16777215})),Ke),Ve=new to;for(let se=0;se<Ke;se+=1){const xt=Re()*Math.PI*2,Ct=rt+Math.sqrt(Re())*(Ee-rt),Wt=D.x+Math.cos(xt)*Ct,Ot=D.z+Math.sin(xt)*Ct,At=We+Math.pow(Re(),2.1)*(it-We);Ve.position.set(Wt,R(Wt,Ot)+At*ht,Ot),Ve.scale.set(At*(.8+Re()*.7),At*(.45+Re()*.5),At*(.8+Re()*.7)),Ve.rotation.set(Re()*3,Re()*3,Re()*3),Ve.updateMatrix(),Te.setMatrixAt(se,Ve.matrix),Te.setColorAt(se,ln[se%3])}Te.instanceMatrix.needsUpdate=!0,Te.instanceColor&&(Te.instanceColor.needsUpdate=!0),f.add(Te)};if(Mt(r(new Xt(1,0)),n?90:170,1.2,60,.02,.22,.35),Mt(r(new Xt(1,1)),n?30:54,2,120,.18,1.1,.34),Mt(r(new Xt(1,1)),n?10:18,6,190,.6,2.4,.4),t.terrain==="ice"){const Ie=[],Ke=Sn(E^1542469173),rt=(We,it,ht,Te,Ve,se)=>{let xt=We,Ct=it,Wt=ht;for(let Ot=0;Ot<Te;Ot+=1){const At=xt+Math.cos(Wt)*Ve,An=Ct+Math.sin(Wt)*Ve;Ie.push(xt,R(xt,Ct)+.06,Ct,At,R(At,An)+.06,An),xt=At,Ct=An,Wt+=(Ke()-.5)*.9,se>0&&Ot===Te>>1&&Ke()<.7&&rt(xt,Ct,Wt+(Ke()<.5?.9:-.9),Math.max(3,Te>>2),Ve*.8,se-1)}};for(let We=0;We<(n?6:10);We+=1)rt((Ke()-.5)*300,(Ke()-.5)*300,Ke()*Math.PI*2,14,14,1);const Ee=r(new Et);Ee.setAttribute("position",new cn(new Float32Array(Ie),3)),f.add(new Xa(Ee,r(new In({color:t.ground3,transparent:!0,opacity:.75}))))}}if(t.terrain==="ring"){const p=new Ce;p.position.copy(Fo(t.companionAz,0)).multiplyScalar(2600);const v=_a;p.position.y=v;const F=480,P=F*1.11,m=F*2.36,$=new L(r(new he(F,n?64:128,n?44:80)),r(new De({vertexShader:Ra,fragmentShader:Ia,uniforms:{uMap:{value:Wa("saturn",t,n,u)},uLimb:{value:.4},uRim:{value:new G("#e8dcbc")}}})));p.add($);const A=r(new De({vertexShader:xn,fragmentShader:No,transparent:!0,side:Be,depthWrite:!1,uniforms:{uProfile:{value:Io(n,u)},uInner:{value:P},uOuter:{value:m},uAlpha:{value:n?.78:.88}}})),ue=new L(r(new lt(P,m,n?128:220,1)),A);ue.rotation.x=-Math.PI/2,ue.position.y=v,p.add(ue),f.add(p);const pe=n?220:420,et=r(new Xt(1,0)),tt=r(new te({color:"#dfe8f2"})),Ze=new ro(et,tt,pe);Ze.instanceMatrix.setUsage(Va);const Re=Sn(E^1374496523),ln=[],Mt=new to;for(let Ee=0;Ee<pe;Ee+=1){const it=Ee%31===0?.5+Re()*1.3:.05+Math.pow(Re(),2)*.55,ht=14+Math.pow(Re(),.7)*150,Te=Re()*Math.PI*2,Ve=(Re()-.5)*14;ln.push({r:ht,a:Te,y:Ve,spin:.02+Re()*.08,size:it,wob:Re()*Math.PI*2}),Mt.position.set(Math.cos(Te)*ht,Ve,Math.sin(Te)*ht),Mt.rotation.set(Re()*3,Re()*3,Re()*3),Mt.scale.setScalar(it),Mt.updateMatrix(),Ze.setMatrixAt(Ee,Mt.matrix);const se=.5+Re()*.45;Ze.setColorAt(Ee,new G(se,se*.98,se*1.05))}Ze.instanceMatrix.needsUpdate=!0,Ze.instanceColor&&(Ze.instanceColor.needsUpdate=!0),f.add(Ze),h={mesh:Ze,data:ln};const Ie=r(new De({vertexShader:xn,fragmentShader:Kn,transparent:!0,side:Be,depthWrite:!1,uniforms:{uInner:{value:.6},uOuter:{value:2600-m-10},uBands:{value:260},uA:{value:new G("#e2eaf4")},uB:{value:new G("#c3cfdd")},uAlpha:{value:.92},uGrain:{value:.26}}})),Ke=2600-m-10,rt=new L(r(new lt(.6,Ke,128,1)),Ie);rt.rotation.x=-Math.PI/2,rt.position.y=v,f.add(rt)}if(t.ring){const p=t.ring==="uranus",v=p?210:170,F=p?520:560,P=p?82*Pn:27*Pn,m=p?140:54,$=r(p?new De({vertexShader:xn,fragmentShader:Kn,transparent:!0,side:Be,depthWrite:!1,uniforms:{uInner:{value:v},uOuter:{value:F},uBands:{value:m},uA:{value:new G("#9fd0d6")},uB:{value:new G("#cdeef2")},uAlpha:{value:.5},uGrain:{value:.4}}}):new De({vertexShader:xn,fragmentShader:No,transparent:!0,side:Be,depthWrite:!1,uniforms:{uProfile:{value:Io(n,u)},uInner:{value:v},uOuter:{value:F},uAlpha:{value:.82}}})),A=new L(r(new lt(v,F,n?64:128,1)),$);if(A.rotation.x=-Math.PI/2+P,A.position.y=p?30:90,f.add(A),p){const ue=r(new De({vertexShader:xn,fragmentShader:Kn,transparent:!0,side:Be,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new G("#dff6f8")},uB:{value:new G("#bfe6ea")},uAlpha:{value:.35},uGrain:{value:.3}}})),pe=new L(r(new lt(130,175,64,1)),ue);pe.rotation.x=-Math.PI/2+P,pe.position.y=30,f.add(pe)}}if(t.companion&&t.terrain!=="ring"){const v=Math.max(6,Math.tan(t.companionSize/2*Pn)*1500),F=new Ce;F.position.copy(Fo(t.companionAz,t.companionElev)).multiplyScalar(1500);const P=Wa(t.companion,t,n,u),m=new L(r(new he(v,n?48:72,n?32:48)),r(new De({vertexShader:Ra,fragmentShader:Ia,uniforms:{uMap:{value:P},uLimb:{value:.42},uRim:{value:new G(t.companion==="earth"?"#9fd0ff":"#cfe0f2")}}})));if(m.lookAt(0,0,0),F.add(m),t.companion==="saturn"||t.companion==="jupiter"){const A=t.companion==="saturn",ue=r(new De({vertexShader:xn,fragmentShader:A?No:Kn,transparent:!0,side:Be,depthWrite:!1,uniforms:A?{uProfile:{value:Io(n,u)},uInner:{value:v*1.12},uOuter:{value:v*2.36},uAlpha:{value:.7}}:{uInner:{value:v*1.3},uOuter:{value:v*1.7},uBands:{value:16},uA:{value:new G("#d9c7a8")},uB:{value:new G("#b09070")},uAlpha:{value:.18},uGrain:{value:.3}}})),pe=new L(r(new lt(v*(A?1.12:1.3),v*(A?2.36:1.7),64,1)),ue);pe.rotation.x=-Math.PI/2+.32,F.add(pe)}const $=new Wn(r(new _n({map:b,color:new G(t.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:ke})));$.scale.setScalar(v*4),F.add($),f.add(F)}const Je=t.terrain!=="ring",Ht=(p,v)=>t.terrain==="ring"?_a:t.cloudTop!==null?t.cloudTop:R(p,v),wt=Ys({sunDir:V,ambient:Math.min(1.05,Me+.24),sunPower:Ue});f.add(wt.group),wt.setVisible(!1);const vt=or({floorAt:Ht,heightAt:R,onImpact:o.onImpact});f.add(vt.group);const kt=n?140:t.particles==="haze"?120:300;let Pt=null,fe=null;if(t.particles!=="none"){const p=new Float32Array(kt*3);fe=new Float32Array(kt*3);const v=Sn(E^625341585);for(let $=0;$<kt;$+=1){const A=v()*Math.PI*2,ue=Math.sqrt(v())*55,pe=t.particles;let et=v()*22;pe==="spark"&&(et=v()*14),pe==="haze"&&(et=2+v()*26),p[$*3]=Math.cos(A)*ue,p[$*3+1]=et,p[$*3+2]=Math.sin(A)*ue;const tt=pe==="wind"?42+v()*34:pe==="rain"?12+v()*6:pe==="spark"?2+v()*4:1.2+v()*2.6;fe[$*3]=pe==="wind"?tt:(v()-.5)*tt*.5,fe[$*3+1]=pe==="rain"?-tt:pe==="spark"?tt:pe==="snow"?-.6-v()*.9:(v()-.5)*.4,fe[$*3+2]=pe==="wind"?tt*.25:(v()-.5)*tt*.4}Pt=r(new Et),Pt.setAttribute("position",new cn(p,3));const F=t.particles==="haze"?2.6:t.particles==="dust"?.14:t.particles==="rain"?.09:t.particles==="snow"?.11:.16,P=r(new so({color:new G(t.particleColor),size:F,transparent:!0,opacity:t.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:t.particles==="spark"?ke:void 0})),m=new ao(Pt,P);m.frustumCulled=!1,f.add(m)}const Qe=r(new Xt(.26,0)),zt=r(new he(.24,16,12)),Q=t.cloudTop===null&&t.terrain!=="plasma",K=[],Ft=[],ut=[];function Zt(p,v,F,P){const m=new Wn(r(new _n({map:b,color:new G(v),transparent:!0,opacity:.9,depthWrite:!1,blending:ke})));m.position.copy(p),m.scale.setScalar(F),f.add(m),Ft.push({sprite:m,life:P,max:P,grow:F*2.4})}function Y(p,v){const F=new L(r(new lt(.28,.5,24,1)),r(new te({color:new G(v),transparent:!0,opacity:.6,depthWrite:!1,side:Be})));F.rotation.x=-Math.PI/2,F.position.copy(p),f.add(F),ut.push({mesh:F,life:.7})}function _(p,v){const F=D.x+p,P=D.z+v,m=t.cloudTop!==null?t.cloudTop:R(F,P),$=Q?new te({color:new G("#c9c2b4").multiplyScalar(Me+Ue*.8),transparent:!0}):new te({color:new G("#ffb45e"),transparent:!0}),A=new L(Q?Qe:zt,$);A.position.set(F,m+4.2,P),A.scale.setScalar(.9+Math.random()*.35),f.add(A);const ue=t.gravityMps2<=.01;if(K.push({mesh:A,x:F,z:P,y:ue?m+.6:m+4.2,vy:ue?.12:0,vx:ue?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:ue?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),K.length>6){const pe=K.shift();pe&&(f.remove(pe.mesh),pe.mesh.material.dispose())}}function M(p,v){const F=new I(p.x,v+.2,p.z);if(t.gravityMps2<=.01){p.outcome="float",p.landed=!0,p.resting=5.5,o.onLand?.({seconds:p.fall,bounces:0,outcome:"float"});return}if(t.terrain==="plasma"){p.outcome="vapor",p.landed=!0,p.resting=.25,Zt(F,"#fff2c0",1.2,.6),o.onLand?.({seconds:p.fall,bounces:0,outcome:"vapor"});return}if(t.cloudTop!==null){p.outcome="sink",p.landed=!0,p.resting=1.6,Zt(F,"#ffffff",1.6,.7),o.onLand?.({seconds:p.fall,bounces:0,outcome:"sink"});return}if(p.bounces+=1,Y(F,t.ground2),p.bounces===1&&o.onLand?.({seconds:p.fall,bounces:1,outcome:"bounce"}),p.bounces>=4||Math.abs(p.vy)<1.3){p.landed=!0,p.outcome="bounce",p.resting=1.6,p.vy=0;return}p.vy=Math.abs(p.vy)*.42,p.y=v+.26,p.vx*=.6,p.vz*=.6}const ae=new to,ce=new G("#31090d"),X=new G("#180509"),N=new G("#ff3a10");function ee(p,v){vt.update(p,v);const F=vt.doom();J.uniforms.uTop.value&&(J.uniforms.uTop.value.copy(le).lerp(ce,F),J.uniforms.uBottom.value.copy(de).lerp(X,F),J.uniforms.uGlow.value.copy(oe).lerp(N,F)),Oe&&(Oe.opacity=.85*(1-F*.85)),Ae&&(Ae.uniforms.uTime.value=p);for(let P=0;P<Se.length;P+=1){const m=Se[P].uniforms.uOffset.value;m.x=(m.x+v*(P===0?.006:.012))%1}if(h){const{mesh:P,data:m}=h;for(let $=0;$<m.length;$+=1){const A=m[$];A.a+=A.spin*v*.05,ae.position.set(Math.cos(A.a)*A.r,A.y+Math.sin(p*.25+A.wob)*.5,Math.sin(A.a)*A.r),ae.rotation.set(p*.08+A.wob,p*.11+A.a,A.wob),ae.scale.setScalar(A.size),ae.updateMatrix(),P.setMatrixAt($,ae.matrix)}P.instanceMatrix.needsUpdate=!0}if(Pt&&fe){const P=Pt.attributes.position,m=P.array;for(let $=0;$<P.count;$+=1){const A=$*3;m[A]+=fe[A]*v,m[A+1]+=fe[A+1]*v,m[A+2]+=fe[A+2]*v,t.particles==="rain"||t.particles==="snow"?m[A+1]<0&&(m[A+1]=22):t.particles==="spark"?m[A+1]>20&&(m[A+1]=0):(m[A+1]<0&&(m[A+1]=24),m[A+1]>26&&(m[A+1]=0)),m[A]>60&&(m[A]=-60),m[A]<-60&&(m[A]=60),m[A+2]>60&&(m[A+2]=-60),m[A+2]<-60&&(m[A+2]=60)}P.needsUpdate=!0}for(let P=K.length-1;P>=0;P-=1){const m=K[P],$=t.cloudTop!==null?t.cloudTop:R(m.x,m.z);if(m.landed)m.resting>0?(m.resting-=v,m.outcome==="sink"?(m.y-=v*2.4,m.mesh.scale.multiplyScalar(1-v*.8)):m.outcome==="vapor"?m.mesh.scale.multiplyScalar(1-v*3):m.mesh.scale.multiplyScalar(1-v*.25)):(m.fade-=v*1.4,m.mesh.material.opacity=Math.max(0,m.fade),m.mesh.scale.multiplyScalar(1-v*.9),m.fade<=0&&(f.remove(m.mesh),m.mesh.material.dispose(),K.splice(P,1)));else{if(m.fall+=v,t.gravityMps2<=.01){m.x+=m.vx*v,m.z+=m.vz*v,m.y+=m.vy*v,m.mesh.rotation.x+=v*.6,m.mesh.rotation.y+=v*.45,m.mesh.position.set(m.x,m.y,m.z),m.fall>.05&&M(m,m.y);continue}m.vy-=t.gravityMps2*v,m.y+=m.vy*v,m.x+=m.vx*v,m.z+=m.vz*v,m.mesh.rotation.x+=v*3.2,m.mesh.rotation.z+=v*2.1,m.y-.26<=$&&(m.y=$+.26,M(m,$))}m.mesh.position.set(m.x,m.y,m.z)}for(let P=Ft.length-1;P>=0;P-=1){const m=Ft[P];m.life-=v;const $=1-m.life/m.max;m.sprite.scale.setScalar(m.sprite.scale.x+(m.grow-m.sprite.scale.x)*Math.min(1,v*6)),m.sprite.material.opacity=Math.max(0,.9*(1-$)),m.life<=0&&(f.remove(m.sprite),Ft.splice(P,1))}for(let P=ut.length-1;P>=0;P-=1){const m=ut[P];m.life-=v,m.mesh.scale.multiplyScalar(1+v*3.4),m.mesh.material.opacity=Math.max(0,m.life/.7)*.6,m.life<=0&&(f.remove(m.mesh),ut.splice(P,1))}}function st(){wt.dispose(),vt.dispose();for(const p of Ft)f.remove(p.sprite);for(const p of ut)f.remove(p.mesh);for(const p of K)f.remove(p.mesh),p.mesh.material.dispose();k.forEach(p=>p.dispose()),f.clear()}return{group:f,eyeY:j+Z,eyeHeight:Z,groundY:j,standX:D.x,standZ:D.z,heightAt:R,floorAt:Ht,solidFloor:Je,walkable:t.cloudTop===null&&t.terrain!=="ring",avatar:wt,impact:vt,update:ee,drop:_,dispose:st}}const La="textures/",mt=Math.PI/180;function eo(t,o,n=1){return new I(Math.cos(t*mt)*Math.cos(o*mt),Math.sin(t*mt),-Math.cos(t*mt)*Math.sin(o*mt)).multiplyScalar(n)}const ze=2.2,Tr=Date.UTC(2e3,0,1,12),Ua={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},Ga={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function Dr(){if(typeof window>"u")return!0;const t=navigator,o=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,n=t.hardwareConcurrency??8,u=t.deviceMemory??8;return!!(o||n<=4||u<=4)}function Er(){const o=document.createElement("canvas");o.width=128,o.height=128;const n=o.getContext("2d");if(n){const u=n.createRadialGradient(64,64,0,64,64,64);u.addColorStop(0,"rgba(255,238,205,0.85)"),u.addColorStop(.3,"rgba(255,214,150,0.55)"),u.addColorStop(.45,"rgba(255,190,120,0.22)"),u.addColorStop(.7,"rgba(250,170,95,0.07)"),u.addColorStop(1,"rgba(255,160,80,0)"),n.fillStyle=u,n.fillRect(0,0,128,128)}return new Ln(o)}const Nr=`
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
}`,Rr=`
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
}`;function Ir(t){return Math.max(.12,.16+.11*Math.log2(t/2e3))}const Fr=`
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
}`,Wr=`
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
}`,_r=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Lr=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,Ba=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Oa=`
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
}`,Ur=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Gr=`
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
}`,Br=`
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
}`,Or=`
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
}`,Vr=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,jr=`
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
}`,Xr=`
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
}`,$r=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function ti(t,o){const n=Dr(),u=n?96:128,f=new Cs({antialias:!0,powerPreference:"default",alpha:!1});f.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),f.outputColorSpace=zn,f.toneMapping=As,f.toneMappingExposure=1.1;const k=Math.min(4,f.capabilities.getMaxAnisotropy()),r=f.domElement;r.style.display="block",r.style.width="100%",r.style.height="100%",r.style.touchAction="none",t.appendChild(r);const h=document.createElement("div");h.className="space-labels",t.appendChild(h);const E=[];let g=0;function b(){const e=performance.now();if(e-g<400)return;g=e,E.length=0;const a=t.getBoundingClientRect();for(const s of[".explore-top",".sheet",".sky-alert"]){const d=document.querySelector(s);if(!d)continue;const x=d.getBoundingClientRect();x.width<2||x.height<2||E.push({x:x.left-a.left,y:x.top-a.top,w:x.width,h:x.height})}}function z(e,a,s,d=22){for(const x of E)if(e<x.x+x.w&&e+s>x.x&&a<x.y+x.h&&a+d>x.y)return!0;return!1}const w=new Ts;w.background=new G("#05070d");const l=new Ds(45,1,.01,2e3),C=[],c=e=>(C.push(e),e),R=new Es,D=new Ns,j=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),Z=new Map,V=new Map,re=[],ne=new Set;let le=!1,de=0;const oe=(e,a)=>{const s=V.get(e);if(s){V.delete(e);for(const d of s)d(a)}},J=(e,a=!0)=>{const s=Z.get(e);if(s)return s;de+=1;const d=R.load(La+e,()=>{oe(e,d),de-=1,de===0&&o.onReady?.()},void 0,()=>{oe(e,d),de-=1,de===0&&o.onReady?.()});return d.colorSpace=a?zn:ja,d.anisotropy=n?4:8,Z.set(e,d),c(d)},Fe=e=>{Z.has(e)||ne.has(e)||(ne.add(e),D.load(La+e,a=>{ne.delete(e);const s=new Xs;s.image=a,s.colorSpace=zn,s.anisotropy=n?4:8,s.needsUpdate=!0,c(s),Z.set(e,s),oe(e,s)},void 0,()=>{ne.delete(e)}))},Oe=()=>{if(!le){le=!0;for(const e of re)Fe(e)}},Ue=(e,a)=>{if(j.has(e)){a(J(e));return}const s=Z.get(e);if(s){a(s);return}const d=V.get(e)??[];d.push(a),V.set(e,d),re.includes(e)||(re.push(e),le&&Fe(e))},Me=new L(c(new he(900,48,24)),c(new te({map:J("milkyway.webp"),side:kn,depthWrite:!1})));Me.rotation.set(63*mt,0,0),w.add(Me),w.add(new Rs(16777215,.14));const It=new Is(16777215,1.6,0,0);It.decay=0,w.add(It);const Se=new Ce;w.add(Se);const Ae=new Map,Je=new Map,Ht=new Map,wt=[],vt=new Map;let kt=null,Pt=null;const fe=new Map,Qe=new Map,zt=new Map,Q=new Map;let K=null,Ft=0,ut=null;const Zt=[],Y=[],_=[],M=[],ae=[];let ce=Date.now(),X=!0,N=null;function ee(e,a,s,d){const x=Ua[s]??[.7,.7,.7,.06],T=Ga[s],O=new G(a),H=T?.relief??0,i=c(new De({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new Fn(T?.texel?.[0]??1/1024,T?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:H*.35},gain:{value:(T?.gain??1.9)*.6},base:{value:new I(O.r,O.g,O.b)},glow:{value:new I(x[0],x[1],x[2])},atmo:{value:Math.min(x[3]*2.2,.85)},ringShadow:{value:d?1:0},ringMap:{value:null},ringInner:{value:d?.inner??1},ringOuter:{value:d?.outer??2},ringCenter:{value:new I},ringNormal:{value:new I(0,1,0)}},vertexShader:Nr,fragmentShader:Rr}));return e&&Ue(e,y=>{i.uniforms.dayMap.value=y,i.uniforms.useMap.value=1,H>0&&(i.uniforms.bumpMap.value=y,i.uniforms.useBump.value=1)}),d&&Ue("saturn-ring.webp",y=>{i.uniforms.ringMap.value=y}),i}function st(e,a,s){const d=Ga[s],x=d?.tint??Ua[s]?.slice(0,3);if(!x||n)return;const T=Math.min(d?.inner??.12,.5)*.55,O=Math.min(d?.outer??.05,.2)*.9,H=new I(x[0],x[1],x[2]),i=Math.sqrt(1-1/(1.045*1.045)),y=(S,W,ie,ge)=>new L(c(new he(a*S,n?24:32,n?16:24)),c(new De({uniforms:{tint:{value:H},power:{value:ie},strength:{value:ge},edge:{value:i}},vertexShader:Ba,fragmentShader:Oa,side:W,transparent:!0,blending:ke,depthWrite:!1})));e.add(y(1.045,kn,2.7,T),y(1.16,Pa,3.4,O))}function p(e,a){const s=c(new De({uniforms:{poleN:{value:eo(80.7,-72.7,1).normalize()},poleS:{value:eo(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:Ur,fragmentShader:Gr,transparent:!0,blending:ke,depthWrite:!1})),d=new L(c(new he(a*1.022,n?64:96,n?48:64)),s);d.renderOrder=1,e.add(d),M.push(s)}function v(e,a){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([d,x,T,O,H],i)=>{const y=eo(d,x,1).normalize(),S=new I(0,1,0).cross(y).normalize(),W=new I().crossVectors(y,S).normalize(),ie=S.multiplyScalar(Math.cos(H)).addScaledVector(W,Math.sin(H)).normalize(),ge=[];for(let ye=0;ye<=16;ye+=1){const Le=ye/16,Ge=(Le-.5)*T,qe=Math.sin(Le*Math.PI)*O;ge.push(new I().copy(y).multiplyScalar(Math.cos(Ge)).addScaledVector(ie,Math.sin(Ge)).normalize().multiplyScalar(a*(.985+qe)))}const Pe=c(new De({uniforms:{uTime:{value:0},seed:{value:i*.37+.11}},vertexShader:Br,fragmentShader:Or,transparent:!0,blending:ke,side:Be,depthWrite:!1})),_e=new L(c(new Os(new Vs(ge),64,a*.022,8,!1)),Pe);_e.raycast=()=>{},e.add(_e),ae.push(Pe)})}function F(e,a,s=""){const d=document.createElement("button");d.type="button",d.className="space-label"+s,d.textContent=a,d.addEventListener("click",()=>o.onPick?.(e)),h.appendChild(d),Ht.set(e,d)}const P=c(new De({uniforms:{map:{value:J("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),m=new I,$=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],A=new Map;let ue=null;const pe={moon:"earth",...Object.fromEntries(Ca.map(e=>[e.id,e.parent]))};function et(e,a){const s=pe[e];if(ue===null||!s)return Yn(e,a);const d=Yn(s,a),x=Yn(e,ue),T=Yn(s,ue);return{x:d.x+x.x-T.x,y:d.y+x.y-T.y,z:d.z+x.z-T.z}}function tt(e){for(const[a,s]of Je){if(a==="sun")continue;const d=et(a,e);s.position.set(d.x*ze,d.y*ze,d.z*ze)}for(const[a,s]of fe){const d=et(a,e);s.position.set(d.x*ze,d.y*ze,d.z*ze)}if(ut){m.copy(ut.holder.position);const a=m.length()||1;ut.tail.visible=a/ze<8,m.multiplyScalar(1/a),ut.tail.quaternion.setFromUnitVectors(new I(0,1,0),m),ut.tail.position.copy(m).multiplyScalar(.16*ze)}}const Ze=new I(1,0,0),Re=c(new De({uniforms:{dayMap:{value:J("earth-day.webp")},nightMap:{value:J("earth-night.webp")},normalMap:{value:J("earth-normal.webp",!1)},specMap:{value:J("earth-spec.webp",!1)},texel:{value:new Fn(1/2048,1/1024)},sunDir:{value:Ze}},vertexShader:Fr,fragmentShader:Wr}));function ln(e){const a=new Ce,s=new L(c(new he(e,n?96:128,64)),Re);s.name="earth",a.add(s);const d=new L(c(new he(e*1.012,80,48)),c(new js({map:J("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));a.add(d),kt=d;const x=new L(c(new he(e*1.06,64,48)),c(new De({uniforms:{sunDir:{value:Ze}},vertexShader:`
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
            }`,side:kn,transparent:!0,blending:ke,depthWrite:!1})));a.add(x);const T=new L(c(new he(e*1.15,n?24:32,n?16:24)),c(new De({uniforms:{tint:{value:new I(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:Ba,fragmentShader:Oa,side:Pa,transparent:!0,blending:ke,depthWrite:!1})));return a.add(T),Ae.set("earth",s),a}function Mt(e,a,s){for(const d of En(e).sites??[]){const x=new L(c(new he(s*.018,12,8)),c(new te({color:"#3182f6"})));x.position.copy(eo(d.lat,d.lon,s*1.004)),a.add(x);const T=document.createElement("div");T.className="space-site",T.textContent=d.name,h.appendChild(T),wt.push({mesh:x,site:d,el:T,parent:e})}}let Ie=null;for(const e of Hs){if(e.id==="moon")continue;const a=new Ce;if(Je.set(e.id,a),Se.add(a),e.id==="sun"){const s=.26*ze,d=new L(c(new he(s,n?96:128,n?64:80)),P);d.name="sun",vt.set("sun",s),a.add(d),v(d,s);for(const[T,O,H,i]of[[1.06,2,.95,"#ffbf78"]])a.add(new L(c(new he(s*T,n?32:48,n?24:32)),c(new De({uniforms:{color:{value:new G(i)},power:{value:O},strength:{value:H}},vertexShader:_r,fragmentShader:Lr,transparent:!0,blending:ke,depthWrite:!1}))));Ae.set("sun",d);const x=new Wn(c(new _n({map:c(Er()),blending:ke,transparent:!0,depthWrite:!1,depthTest:!0,color:new G("#ffd9a0")})));x.scale.setScalar(s*3.6),a.add(x),Pt=x}else{const s=To(e.id).radius*ze;vt.set(e.id,s);let d;if(e.id==="earth"){const H=ln(s);H.rotation.z=-e.tilt*mt,a.add(H),Ie=H,d=H.children[0]}else{const H=e.id==="saturn"?{inner:s*1.18,outer:s*2.08}:void 0;d=new L(c(new he(s,n?96:128,64)),ee(e.texture,e.color,e.id,H)),d.name=e.id,d.rotation.z=-e.tilt*mt,a.add(d),Ae.set(e.id,d),st(a,s,e.id),e.id==="jupiter"&&p(d,s)}if(e.axes){const[H,i,y]=e.axes;d.scale.set(1,y/H,i/H)}if(e.ring&&e.axes){const H=e.axes[0]/2,i=s*(e.ring.radius-e.ring.width/2)/H,y=s*(e.ring.radius+e.ring.width/2)/H,S=new L(c(new lt(i,Math.max(y,i*1.03),128,1)),c(new te({color:"#8b8580",side:Be,transparent:!0,opacity:.75,depthWrite:!1})));S.rotation.x=Math.PI/2,a.add(S)}if(e.id==="saturn"){const H=s*1.18,i=s*2.08,y=new lt(H,i,160,1),S=c(new De({uniforms:{ringMap:{value:null},innerRatio:{value:H/i},planetRadius:{value:s},planetCenter:{value:new I}},vertexShader:Vr,fragmentShader:jr,side:Be,transparent:!0,depthWrite:!1}));Ue("saturn-ring.webp",ie=>{S.uniforms.ringMap.value=ie});const W=new L(c(y),S);W.rotation.x=Math.PI/2,d.add(W),Y.push({mesh:W,parent:e.id}),_.push({mesh:d,material:d.material})}e.sites&&Mt(e.id,d,s);const x=Aa(e.id,.022),T=c(new Et);T.setAttribute("position",new Co(x.positions,3)),T.setIndex(x.index),T.scale(ze,ze,ze);const O=new L(T,c(new te({color:To(e.id).ribbon,transparent:!0,opacity:.5,side:Be,depthWrite:!1})));Zt.push(O),Se.add(O)}F(e.id,e.name,e.id==="sun"?"":" is-planet")}const Ke=[];function rt(e,a,s){let d=e==="main"?1234:98765;const x=()=>(d=d*16807%2147483647,(d-1)/2147483646),T=c(new Xt(1,0)),O=new Float32Array(a*4),H=new Float32Array(a*4);for(let S=0;S<a;S+=1){let W;if(e==="main")do W=2.1+x()*1.2;while((Math.abs(W-2.5)<.03||Math.abs(W-2.82)<.03||Math.abs(W-2.95)<.02)&&x()<.85);else W=x()<.18?39.2+(x()-.5)*1.2:42+(x()-.5)*6.5;O[S*4]=W,O[S*4+1]=x()*Math.PI*2,O[S*4+2]=x()*(e==="main"?.18:.12),O[S*4+3]=x()*Math.PI*2,H[S*4]=(x()-.5)*(e==="main"?.32:.5),H[S*4+1]=x()*Math.PI*2;const ie=x()**3;H[S*4+2]=(e==="main"?.0035:.009)*(.7+ie*2.4),H[S*4+3]=x()}T.setAttribute("orbit",new za(O,4)),T.setAttribute("shape",new za(H,4));const i=c(new De({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new G(s)},uScale:{value:ze}},vertexShader:Xr,fragmentShader:$r})),y=new ro(T,i,a);y.frustumCulled=!1,y.raycast=()=>{},Se.add(y),Ke.push({mesh:y,material:i})}rt("main",n?1800:4200,"#9c9184"),rt("kuiper",n?1500:3600,"#7f8b9c");for(const e of Ca){const a=new Ce,s=new L(c(new he(e.radius*ze,32,24)),ee(`${e.id}.webp`,e.color,e.id));s.name=e.id,a.add(s),Se.add(a),fe.set(e.id,a),Qe.set(e.id,s);const d=document.createElement("button");d.type="button",d.className="space-label is-small",d.textContent=e.name,d.addEventListener("click",()=>o.onExtra?.(e.id)),h.appendChild(d),zt.set(e.id,{el:d,parent:e.parent})}{const e=new Ce,a=new L(c(new he(.045*ze,20,16)),c(new te({color:"#f7fbff"})));a.name="halley",e.add(a);const s=new L(c(new Fs(.04*ze,.32*ze,12)),c(new te({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(s),ut={holder:e,tail:s},Se.add(e),fe.set("halley",e),Qe.set("halley",a);const d=Aa("halley",.022),x=c(new Et);x.setAttribute("position",new Co(d.positions,3)),x.setIndex(d.index),x.scale(ze,ze,ze);const T=new L(x,c(new te({color:To("halley").ribbon,transparent:!0,opacity:.35,side:Be,depthWrite:!1})));Zt.push(T),Se.add(T);const O=document.createElement("button");O.type="button",O.className="space-label is-small",O.textContent=U("핼리 혜성"),O.addEventListener("click",()=>o.onExtra?.("halley")),h.appendChild(O),zt.set("halley",{el:O,parent:null})}for(const e of Zs){const a=Ks(e),s=a.points.map(ie=>new I(ie.x*ze,ie.y*ze,ie.z*ze)),d=c(new Et().setFromPoints(s)),x=new Ws(d,c(new In({color:e.color,transparent:!0,opacity:.95})));x.visible=!1;const T=new Ce,O=new L(c(new Ao(.03,.01,.01,20)),c(new te({color:"#d8dde4"})));O.rotation.x=Math.PI/2;const H=new L(c(new he(.014,12,8)),c(new te({color:"#c9ced6"})));H.position.z=-.02;const i=new L(c(new Ao(.002,.002,.09,6)),c(new te({color:"#aab3c0"})));i.rotation.z=Math.PI/2,i.position.z=-.02;const y=new L(c(new he(.035,16,12)),c(new te({color:e.color,transparent:!0,opacity:.18,blending:ke,depthWrite:!1})));T.add(O,H,i,y),T.scale.setScalar(e.frame==="earth"?.8:1.3),T.position.copy(s[s.length-1]),x.add(T),(e.frame==="earth"?Je.get("earth")??Se:Se).add(x);const W=document.createElement("div");W.className="space-site is-probe",W.textContent=e.name,h.appendChild(W),Q.set(e.id,{line:x,probe:T,el:W,points:s,times:a.points.map(ie=>ie.t),marks:a.marks,frame:e.frame})}if(tt(ce),Ie){const e=.055*ze;vt.set("moon",e);const a=new L(c(new he(e,u,48)),ee("moon.webp","#b8b8b8","moon"));a.name="moon";const s=new Ce;s.add(a),Se.add(s),Ae.set("moon",a),Je.set("moon",s),Mt("moon",a,e),F("moon",U("달")," is-small"),tt(ce)}const Ee=new Ce,We=new Ce,it=new Ce;Ee.add(We,it),Ee.visible=!1;let ht="solar",Te=!1,Ve=0;const se={moon:new L,moonMat:c(new te({color:"#ffffff"})),shadow:c(new te({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new L,umbra:new L,skyCover:new L,skySun:new Ce,skyMoon:new Ce,skyMoonMat:c(new te({color:"#ffffff"}))},xt=[],Ct=J("sun.webp"),Wt=J("moon.webp"),Ot=new L(c(new he(.62,32,24)),c(new te({map:Ct})));Ot.position.set(-3.3,0,0);const At=new L(c(new he(.4,32,24)),c(new te({map:J("earth-day.webp")})));At.position.set(1.85,0,0),se.moonMat.map=Wt,se.moon=new L(c(new he(.14,24,18)),se.moonMat),se.cone=new L(c(new Ao(.04,.16,.78,18)),se.shadow),se.cone.position.set(1.42,0,0),se.cone.rotation.z=Math.PI/2,se.umbra=new L(c(new rn(.3,28)),c(new te({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),se.umbra.position.set(2.75,0,.02),We.add(Ot,At,se.moon,se.cone,se.umbra);for(const[e,a]of[[U("태양"),new I(-3.3,.85,0)],[U("지구"),new I(1.85,.68,0)]]){const s=document.createElement("div");s.className="space-site",s.textContent=e,h.appendChild(s),xt.push({el:s,at:a,group:We})}const An=new L(c(new rn(1.35,48)),c(new te({map:Ct}))),Za=new L(c(new lt(1.4,1.7,48)),c(new te({color:"#f0c36a",transparent:!0,opacity:.45,side:Be,depthWrite:!1})));se.skyCover=new L(c(new rn(1.22,48)),c(new te({color:"#141820"}))),se.skySun.add(An,Za,se.skyCover),se.skyMoonMat.map=Wt;const Ka=new L(c(new rn(.92,48)),se.skyMoonMat),Lo=new L(c(new rn(1.08,48)),c(new te({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));Lo.position.z=.16,se.skyMoon.add(Ka,Lo),it.add(se.skySun,se.skyMoon);const Tn=document.createElement("div");Tn.className="space-site is-stage",h.appendChild(Tn),xt.push({el:Tn,at:new I(0,-1.2,0),group:We}),it.visible=!1,w.add(Ee);const _t=new Ce;_t.visible=!1,_t.rotation.z=-Math.PI/2;const Uo=[],Go=4.6,qa=e=>Go*e/696e3,Bo=new L(c(new he(Go,64,40)),c(new te({map:J("sun.webp")})));Bo.position.set(-3.2,0,0),_t.add(Bo);const Ja=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let Oo=2.4;const Vo=(e,a)=>{const s=document.createElement("div");s.className="space-site",s.textContent=e,h.appendChild(s),Uo.push({el:s,at:a,group:_t})};Vo(U("태양"),new I(-3.2,4.9,0));for(const[e,a]of Ja){const s=qa(a),d=Oo+s;Oo=d+s+.72;const x=En(e),T=e==="earth"?"earth-day.webp":x.texture,O=c(new te({color:x.color}));T&&Ue(T,i=>{O.map=i,O.color.set("#ffffff"),O.needsUpdate=!0});const H=new L(c(new he(s,32,24)),O);if(H.position.set(d,0,0),x.axes&&H.scale.set(1,x.axes[2]/x.axes[0],x.axes[1]/x.axes[0]),_t.add(H),e==="saturn"){const i=s*1.18,y=s*2.08,S=c(new lt(i,y,96,1)),W=S.attributes.position,ie=S.attributes.uv,ge=new I;for(let ye=0;ye<W.count;ye+=1)ge.fromBufferAttribute(W,ye),ie.setXY(ye,(ge.length()-i)/(y-i),.5);const Pe=c(new te({color:"#b9b3ab",transparent:!0,opacity:.9,side:Be,depthWrite:!1}));Ue("saturn-ring.webp",ye=>{Pe.map=ye,Pe.color.set("#ffffff"),Pe.needsUpdate=!0});const _e=new L(S,Pe);_e.rotation.y=Math.PI/2-.36,H.add(_e)}Vo(x.name,new I(d,(e==="saturn"?s*2.08:s)+.12,0))}w.add(_t);const bt=new Ce;bt.visible=!1;const co=[],jo=[],Qa=new L(c(new he(.55,48,32)),c(new te({color:"#e0703a"})));bt.add(Qa);for(const[e,a]of[[1.35,.16],[2.1,.05]])bt.add(new L(c(new he(.55*e,32,24)),c(new te({color:"#ff6a30",transparent:!0,opacity:a,side:kn,blending:ke,depthWrite:!1}))));const Xo=new L(c(new lt(2.6,5.1,96,1)),c(new te({color:"#3fbf7f",transparent:!0,opacity:.12,side:Be,depthWrite:!1})));Xo.rotation.x=Math.PI/2,bt.add(Xo),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,a,s,d,x],T)=>{const O=new ka(c(new Et().setFromPoints(Array.from({length:128},(y,S)=>new I(Math.cos(S/128*Math.PI*2)*s*100,0,Math.sin(S/128*Math.PI*2)*s*100)))),c(new In({color:"#8b95a1",transparent:!0,opacity:.35})));bt.add(O);const H=new L(c(new he(.16*d,24,16)),ee(void 0,x,"earth"));bt.add(H);const i=document.createElement("button");i.type="button",i.className="space-label is-small",i.textContent=e,i.addEventListener("click",()=>o.onExtra?.(`trappist-${e}`)),h.appendChild(i),co.push({mesh:H,a:s*100,period:a,phase0:T*1.7,el:i})});const es=new ka(c(new Et().setFromPoints(Array.from({length:256},(e,a)=>new I(Math.cos(a/256*Math.PI*2)*38.7,0,Math.sin(a/256*Math.PI*2)*38.7)))),c(new In({color:"#c5b8a2",transparent:!0,opacity:.5})));bt.add(es);for(const[e,a]of[["TRAPPIST-1",new I(0,1.1,0)],[U("생명가능지대(대략)"),new I(3.9,0,0)],[U("비교: 우리 수성의 궤도"),new I(0,0,38.7)]]){const s=document.createElement("div");s.className="space-site",s.textContent=e,h.appendChild(s),jo.push({el:s,at:a})}w.add(bt);const Kt=er(c),ts=Kt.labels.map(({name:e,at:a})=>{const s=document.createElement("div");return s.className="space-site",s.textContent=e,h.appendChild(s),{el:s,at:a}});w.add(Kt.group);const ft=nr(),lo=[];if(ft)for(const[e,a]of Object.entries(ft.groups)){w.add(a);for(const s of ft.markers[e]){const d=document.createElement("button");d.type="button",d.className="space-label",d.textContent=s.name,d.addEventListener("click",()=>{o.onMarker?.(s),xe.target.copy(s.position),xe.radius=fn[e]*(s.id==="cmb"?1.4:e==="group"?.6:.42)}),h.appendChild(d),lo.push({level:e,marker:s,el:d})}}const $o=[];if(ft){const a=(T,O)=>new I(Math.cos(O*mt)*Math.cos(T*mt),Math.sin(O*mt),-Math.cos(O*mt)*Math.sin(T*mt)).multiplyScalar(140),s=[];for(const T of Object.values(Ta))for(const O of T)for(let H=0;H<O.length-1;H+=1){const i=a(O[H][0],O[H][1]),y=a(O[H+1][0],O[H+1][1]);s.push(i.x,i.y,i.z,y.x,y.y,y.z)}const d=c(new Et);d.setAttribute("position",new Co(s,3));const x=new Xa(d,c(new In({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));ft.groups.stars.add(x);for(const T of qs){if(!Ta[T.id])continue;const O=document.createElement("button");O.type="button",O.className="space-label is-const",O.textContent=T.name.replace(/\(.*\)/,"").split(" · ")[0],O.addEventListener("click",()=>o.onConstellation?.(T.id)),h.appendChild(O),$o.push({el:O,at:a(T.center[0],T.center[1])})}}const Un=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let me="system",un=!1,Yo=!1;const fn={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},pn=new I,we={theta:.6,phi:.95,radius:34},xe={target:new I,radius:we.radius};let je="system",nt=null,gt=null,Tt=null;function Gn(e){if((e==="system"||e==="sizes")&&Oe(),me=e,un=!1,Se.visible=e==="system",Ee.visible=e==="eclipse",_t.visible=e==="sizes",bt.visible=e==="exo",Kt.group.visible=e==="blackhole",ft)for(const[a,s]of Object.entries(ft.groups))s.visible=a===e;je="system",nt=null,gt=null,Tt=null,xe.target.set(0,0,0),xe.radius=fn[e],e!=="system"&&(we.phi=1.1),e==="eclipse"&&(We.rotation.z=l.aspect<1?-Math.PI/2:0,we.theta=0,we.phi=Te?Math.PI/2:1.25,xe.target.set(0,0,0),Te||xe.target.set(-.7,0,0).applyEuler(We.rotation),xe.radius=Te?6:l.aspect<1?10:7.5),e==="exo"&&(we.phi=.75),e==="blackhole"&&(we.phi=1.42),e==="sizes"&&(we.theta=0,we.phi=Math.PI/2,xe.target.set(.6,-6.8,0),xe.radius=19)}function Ho(e){if(e!=="earth"&&Oe(),un=!1,me!=="system"&&(me="system",Se.visible=!0,Ee.visible=!1,_t.visible=!1,bt.visible=!1,Kt.group.visible=!1,ft))for(const s of Object.values(ft.groups))s.visible=!1;if(je=e,gt=null,Tt=null,e==="system"){nt=null,xe.target.set(0,0,0),xe.radius=fn.system;return}nt=Je.get(e)??null;const a=vt.get(e)??Ir(En(e).km);xe.radius=e==="sun"?3.2:e==="jupiter"?3.4*ze:e==="saturn"?2.6*ze:Math.max(a*(En(e).ring?6:4.2),.25)}function ns(e){const a=fe.get(e);a&&(me!=="system"&&Gn("system"),je="system",nt=a,gt=null,Tt=null,xe.radius=e==="halley"?1.6:.6,Bt=performance.now())}function os(e){Tt=(e?wt.find(s=>s.parent===je&&s.site.name===e.name):void 0)?.mesh??null,gt=Tt?new I:null,Bt=performance.now()}let q=null,Ne=0,ot=-.12;const uo=62,Zo=18,Ko=85;let qt=uo,dn=0,en=0,mn=0,qo=0;const Bn=3.4,On=2.8,Jo=4.6,vn=620;let Xe=0,$e=0,hn=0,Ye=0,pt=0,dt=0,tn=0,Lt=!0,nn=!1,fo=0,Vt=!0,po=9.81,on="first",Qo="office";const as=4.6,ea=1.8,ta=16;let an=as,Dn=0,gn=Number.NaN,yn=0,wn=0,mo=new G("#000000"),vo=0;const ss=new G("#5a1206");let ho=0,go=0,yo=-24,wo=120;const Ut=new Set;function rs(){if(Me.visible=!0,Se.visible=me==="system",Ee.visible=me==="eclipse",_t.visible=me==="sizes",bt.visible=me==="exo",Kt.group.visible=me==="blackhole",ft)for(const[e,a]of Object.entries(ft.groups))a.visible=e===me}function na(e,a){q&&(w.remove(q.group),q.dispose(),q=null);const s=Qs(e);q=Ar(s,{low:n,anisotropy:k,onLand:d=>o.onSurfaceDrop?.({id:e,seconds:d.seconds,bounces:d.bounces,outcome:d.outcome}),onImpact:ls}),w.add(q.group),mo=new G(s.fog),vo=s.fogDensity,w.fog=new $s(mo.clone(),vo),Ne=(s.companion?s.companionAz:s.sunAz)*mt,ot=-.12,qt=uo,Xe=q.standX,$e=q.standZ,hn=0,Ye=0,pt=0,dt=0,tn=0,Lt=!0,nn=!1,fo=0,Vt=q.walkable,po=Math.max(0,s.gravityMps2),ho=0,go=0,yo=s.terrain==="ring"?-24:-1,wo=s.terrain==="ring"?110:240,en=0,mn=Math.max(.6,a),qo=s.cloudTop!==null?260:150,Dn=0,gn=Number.NaN,q.avatar.setSkin(Qo),q.avatar.setVisible(on==="third"),Bt=performance.now()}function oa(e){if(!q){if(Me.visible=!1,Se.visible=!1,Ee.visible=!1,_t.visible=!1,bt.visible=!1,Kt.group.visible=!1,ft)for(const a of Object.values(ft.groups))a.visible=!1;h.style.display="none",K=null,ue=null,X=!0,l.fov=62,l.near=.08,l.far=6e3,l.updateProjectionMatrix()}na(e,1.9)}function is(e){if(!q){oa(e);return}na(e,1.1)}function cs(){q&&(w.remove(q.group),q.dispose(),q=null,w.fog=null,f.toneMappingExposure=1.1,h.style.display="",rs(),l.fov=45,l.near=.01,l.far=2e3,l.updateProjectionMatrix(),pn.copy(xe.target),we.radius=xe.radius,Bt=performance.now())}function Mo(){if(!q)return;const e=4.2+Math.random()*1.4,a=(Math.random()-.5)*1.8,s=Xe-q.standX+Math.sin(Ne)*e+Math.cos(Ne)*a,d=$e-q.standZ-Math.cos(Ne)*e+Math.sin(Ne)*a;q.drop(s,d)}function ls(){if(o.onSurfaceImpact?.(),!q)return;const e=Math.sin(Ne),a=-Math.cos(Ne);yn-=e*8.2,wn-=a*8.2,Vt?Lt&&(Ye=Math.max(Ye,2.8),Lt=!1):Ye+=1.8}function us(){if(!q)return;const e=22+Math.random()*8,a=(Math.random()-.5)*5,s=Math.sin(Ne),d=-Math.cos(Ne),x=Xe+s*e+Math.cos(Ne)*a,T=$e+d*e+Math.sin(Ne)*a;q.impact.strike(x,T,s,d)}function fs(e){on=e,e==="third"&&ot<-.32&&(ot=-.16),gn=Number.NaN,ot=Math.min(.6,Math.max(-1.05,ot)),q&&q.avatar.setVisible(e==="third"),Bt=performance.now()}function ps(e){Qo=e,q&&q.avatar.setSkin(e)}function ds(e){if(!q)return;if(en<mn){nn=!1;return}const a=(Ut.has("w")||Ut.has("arrowup")?1:0)-(Ut.has("s")||Ut.has("arrowdown")?1:0),s=(Ut.has("d")||Ut.has("arrowright")?1:0)-(Ut.has("a")||Ut.has("arrowleft")?1:0);let d=ho+a,x=go+s;const T=Math.hypot(d,x);T>1&&(d/=T,x/=T);const O=Math.sin(Ne),H=-Math.cos(Ne),i=Math.cos(Ne),y=Math.sin(Ne),S=Math.min(1,e*(Vt?9:2.4));if(Vt){const W=(O*d+i*x)*Bn,ie=(H*d+y*x)*Bn;pt+=(W-pt)*S,dt+=(ie-dt)*S,Xe+=(pt+yn)*e,$e+=(dt+wn)*e,yn*=Math.exp(-e*3.1),wn*=Math.exp(-e*3.1);const ge=Math.hypot(Xe,$e);if(ge>vn){const _e=Xe/ge,ye=$e/ge;Xe=_e*vn,$e=ye*vn;const Le=pt*_e+dt*ye;Le>0&&(pt-=Le*_e,dt-=Le*ye)}const Pe=Math.hypot(pt,dt);fo+=e*(Lt?.8+Pe*1.7:.8),nn&&Lt&&po>.01&&(Ye=Jo,Lt=!1),Lt||(Ye-=po*e,hn+=Ye*e,hn<=0&&(hn=0,Dn=Math.min(1,Math.abs(Ye)/Jo),Ye=0,Lt=!0))}else{const W=Math.cos(ot),ie=(Math.sin(Ne)*W*d+i*x)*On,ge=Math.sin(ot)*d*On,Pe=(-Math.cos(Ne)*W*d+y*x)*On;pt+=(ie-pt)*S,dt+=(Pe-dt)*S,Ye+=(ge-Ye)*S,nn&&(Ye+=1.8),Xe+=(pt+yn)*e,$e+=(dt+wn)*e,yn*=Math.exp(-e*3.1),wn*=Math.exp(-e*3.1),tn+=Ye*e;const _e=Math.hypot(Xe,$e);if(_e>vn){const ye=Xe/_e,Le=$e/_e;Xe=ye*vn,$e=Le*vn;const Ge=pt*ye+dt*Le;Ge>0&&(pt-=Ge*ye,dt-=Ge*Le)}tn<yo&&(tn=yo,Ye<0&&(Ye=0)),tn>wo&&(tn=wo,Ye>0&&(Ye=0))}nn=!1}function ms(e,a){if(!q)return;if(q.update(e,a),en<mn){en=Math.min(mn,en+a);const S=en/mn,W=1-Math.pow(1-S,3);dn=qo*(1-W),ot=-.12-.38*(1-W)}else dn!==0&&(dn=0,on==="third"&&(ot=-.16));ds(a),Dn=Math.max(0,Dn-a*3.4),l.fov!==qt&&(l.fov=qt,l.updateProjectionMatrix());const s=on==="third",d=Vt?q.eyeY+q.heightAt(Xe,$e)+hn:q.eyeY+tn,x=d-q.eyeHeight+dn,T=Math.hypot(pt,dt);if(q.avatar.setVisible(s),s){const S=T>.25?Math.atan2(pt,dt):Math.PI-Ne;q.avatar.update(e,a,{x:Xe,z:$e,feetY:x,facing:S,speed:T,maxSpeed:Vt?Bn:On,grounded:Vt&&Lt,floating:!Vt,vy:Ye,landing:Dn,shadowY:q.solidFloor?q.floorAt(Xe,$e):null,shockT:q.impact.sinceImpact()})}if(s){const S=Number.isNaN(gn)?x+1.34:gn;gn=S+(x+1.34-S)*Math.min(1,a*3.2);const W=gn,ie=Math.cos(ot),ge=Math.sin(Ne)*ie,Pe=Math.sin(ot),_e=-Math.cos(Ne)*ie,ye=Xe-ge*an;let Le=W-Pe*an;const Ge=$e-_e*an;q.solidFloor&&(Le=Math.max(Le,q.floorAt(ye,Ge)+.45)),l.position.set(ye,Le,Ge),l.lookAt(Xe,W,$e)}else{const S=Math.min(1,T/Bn),W=Vt?Lt?Math.sin(fo*2)*.035*S:0:Math.sin(e*.5)*.25,ie=d+dn+W;l.position.set(Xe,ie,$e);const ge=Math.cos(ot);l.lookAt(Xe+Math.sin(Ne)*ge,ie+Math.sin(ot),$e-Math.cos(Ne)*ge)}const O=q.impact.shake();if(O>.002){const S=O;l.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*S*.6,l.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*S*.6,l.position.z+=(Math.sin(e*41.9+2.1)+Math.sin(e*25.6)*.5)*S*.45,l.rotateZ((Math.sin(e*35.2)*.6+Math.sin(e*21.7+1.1)*.4)*S*.05)}const H=q.impact.flash();f.toneMappingExposure=1.1+H*5.4;const i=q.impact.doom(),y=w.fog;y&&(y.color.copy(mo).lerp(ss,i*.82),y.density=vo*(1+i*2.4)),f.render(w,l)}const at=new Map,xo=new Map;let Gt=0,Jt=0,Vn=!1,Bt=0;const aa=new _s,sa=new Fn,ra=e=>{if(xo.set(e.pointerId,{x:e.clientX,y:e.clientY}),q){if(r.setPointerCapture(e.pointerId),at.set(e.pointerId,{x:e.clientX,y:e.clientY}),at.size>=2){const[a,s]=[...at.values()];Gt=Math.hypot(a.x-s.x,a.y-s.y),Vn=!0,Jt+=100}else Vn=!1,Jt=0;return}if(Oe(),r.setPointerCapture(e.pointerId),un=!1,at.set(e.pointerId,{x:e.clientX,y:e.clientY}),Jt=0,Bt=performance.now(),at.size===2){const[a,s]=[...at.values()];Gt=Math.hypot(a.x-s.x,a.y-s.y)}},ia=e=>{const a=at.get(e.pointerId);if(!a)return;const s=e.clientX-a.x,d=e.clientY-a.y;if(at.set(e.pointerId,{x:e.clientX,y:e.clientY}),q){if(at.size>=2){const[T,O]=[...at.values()],H=Math.hypot(T.x-O.x,T.y-O.y);Gt>0&&H>0&&(on==="third"?an=Math.min(ta,Math.max(ea,an*(Gt/H))):qt=Math.min(Ko,Math.max(Zo,qt*(Gt/H)))),Gt=H,Jt+=Math.abs(s)+Math.abs(d)+10;return}Jt+=Math.abs(s)+Math.abs(d);const x=qt/uo;Ne-=s*.004*x,ot=Math.min(1.15,Math.max(-1.05,ot-d*.0035*x));return}if(Bt=performance.now(),at.size===1)Jt+=Math.abs(s)+Math.abs(d),we.theta-=s*.006,we.phi=Math.min(2.9,Math.max(.2,we.phi-d*.006)),gt=null,Tt=null;else if(at.size===2){const[x,T]=[...at.values()],O=Math.hypot(x.x-T.x,x.y-T.y);Gt>0&&(xe.radius=la(xe.radius*(Gt/O))),Gt=O,Jt+=10}},jn=e=>{const a=xo.get(e.pointerId),s=Vn;if(xo.delete(e.pointerId),at.delete(e.pointerId),Gt=0,at.size===0&&(Vn=!1),q){(a?Math.hypot(e.clientX-a.x,e.clientY-a.y):1/0)<12&&!s&&at.size===0&&Mo();return}if(Jt<6&&o.onPick){const d=r.getBoundingClientRect();sa.set((e.clientX-d.left)/d.width*2-1,-((e.clientY-d.top)/d.height)*2+1),aa.setFromCamera(sa,l);const T=aa.intersectObjects([...Ae.values(),...Qe.values()],!1)[0]?.object.name;T&&Ae.has(T)?o.onPick(T):T&&Qe.has(T)&&o.onExtra?.(T)}},ca=e=>{if(q){e.preventDefault(),on==="third"?an=Math.min(ta,Math.max(ea,an*(e.deltaY>0?1.1:.9))):qt=Math.min(Ko,Math.max(Zo,qt*(e.deltaY>0?1.1:.9)));return}e.preventDefault(),xe.radius=la(xe.radius*(e.deltaY>0?1.12:.89))};function la(e){return me!=="system"?Math.min(fn[me]*2.2,Math.max(fn[me]*.15,e)):Math.min(90,Math.max(je==="system"&&!nt?4:.15,e))}const ua=e=>{if(!q)return;const a=e.target;if(a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"||a.isContentEditable))return;const s=e.key.toLowerCase();if(e.code==="KeyE"||e.code==="KeyF"||s==="e"||s==="f"){if(e.repeat||en<mn)return;e.preventDefault(),Mo();return}(s===" "||s==="spacebar"||s==="w"||s==="a"||s==="s"||s==="d"||s.startsWith("arrow"))&&(e.preventDefault(),Ut.add(s==="spacebar"?" ":s),(s===" "||s==="spacebar")&&(nn=!0))},fa=e=>{const a=e.key.toLowerCase();Ut.delete(a==="spacebar"?" ":a)};window.addEventListener("keydown",ua),window.addEventListener("keyup",fa),r.addEventListener("pointerdown",ra),r.addEventListener("pointermove",ia),r.addEventListener("pointerup",jn),r.addEventListener("pointercancel",jn),r.addEventListener("wheel",ca,{passive:!1});let jt=null,Xn=null,bo=!matchMedia("(prefers-reduced-motion: reduce)").matches,pa=0,da=0;bo&&(jt=new Ls(f),jt.addPass(new Us(w,l)),Xn=new Gs(new Fn(256,256),.75,.78,.92),jt.addPass(Xn),jt.addPass(new Bs));const ve={w:1,h:1},ma=()=>{ve.w=t.clientWidth||1,ve.h=t.clientHeight||1,f.setSize(ve.w,ve.h,!1),jt?.setSize(ve.w,ve.h),Xn?.resolution.set(ve.w/2,ve.h/2),l.aspect=ve.w/ve.h,l.updateProjectionMatrix()};ma();const va=new ResizeObserver(ma);va.observe(t);let ha=!0;const ga=new IntersectionObserver(e=>{ha=e.some(a=>a.isIntersecting)});ga.observe(t);const B=new I,sn=new I,Mn=new I,So=new I,vs=new I,hs=new I,gs=new I,ys=new I,ya=new I,ws=new I;let ko=0,wa=performance.now(),Po=-1e9,Ma=0;const xa=e=>{ko=requestAnimationFrame(xa);const a=Math.min(.1,(e-wa)/1e3);if(wa=e,document.hidden||!ha)return;if(q){ms(e/1e3,a);return}if(Un||(P.uniforms.time.value=e/1e3),!Un){for(const i of M)i.uniforms.time.value=e/1e3;for(const i of ae)i.uniforms.uTime.value=e/1e3}e-Bt>3e3&&!Un&&!gt&&!Yo&&!un&&me!=="eclipse"&&me!=="sizes"&&(we.theta+=a*(je==="system"?.03:.08)),kt?.rotateY(a*.01);for(const[i,y]of Ae){if(i==="earth"||i==="moon"||Tt&&i===je)continue;const S=En(i).spinHours;Un||y.rotateY(a*(i==="sun"?.02:S?.12*(24/S)*.25:.12))}Pt&&(Pt.visible=l.position.length()>4);for(const i of Ke)i.material.uniforms.uDays.value=(ce-Tr)/864e5,i.material.uniforms.uTime.value=e/1e3;for(const i of Y){const y=Ae.get(i.parent);y&&i.mesh.material.uniforms.planetCenter.value.copy(y.getWorldPosition(B))}for(const i of _)i.mesh.getWorldPosition(B),i.material.uniforms.ringCenter.value.copy(B),i.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(i.mesh.matrixWorld).normalize();if(X&&e-Ma>1e3&&(Ma=e,ce=Date.now(),tt(ce)),K){const i=Q.get(K.id),y=i.points.length,S=i.times[y-1],W=(i.frame==="earth"?6:25)*864e5,ge=i.marks.some(He=>He.at!==void 0&&He.body&&He.body!=="earth"&&Math.abs(K.sim-He.at)<W)?"slow":K.sim>=K.fastFrom?"fast":"normal",Pe=ge==="slow"?Math.min(K.base,2*W/3):K.base*(ge==="fast"?K.fast:1);K.sim=Math.min(S,K.sim+Pe*Math.min(a,.1)),i.frame==="sun"?ue=(ue??K.sim)+Math.min(a,.1)*.15*864e5:ue=null,K.pace=ge;const _e=(K.sim-i.times[0])/(S-i.times[0]||1);let ye=0,Le=y-1;for(;Le-ye>1;){const He=ye+Le>>1;i.times[He]<=K.sim?ye=He:Le=He}const Ge=i.times[Le]-i.times[ye],qe=ye+(Ge>0?(K.sim-i.times[ye])/Ge:0),ct=Math.max(0,Math.min(y-2,Math.floor(qe))),ba=qe-ct;i.probe.position.lerpVectors(i.points[ct],i.points[ct+1],ba),Ft=qe,i.probe.lookAt(i.line.localToWorld(i.points[Math.min(y-1,ct+2)].clone())),i.line.geometry.setDrawRange(0,ct+2);const zo=i.times[ct]+(i.times[ct+1]-i.times[ct])*ba;X=!1,ce=zo,tt(zo);let $n=0;for(let He=0;He<i.marks.length;He+=1){const Sa=i.marks[He],Ms=Sa.at??i.times[Math.min(y-1,Sa.index)];K.sim>=Ms-W&&($n=He)}if(($n!==K.mark||e-K.lastPing>250||K.sim>=S&&!K.done)&&(K.mark=$n,K.lastPing=e,K.sim>=S&&(K.done=!0),o.onFlight?.({id:K.id,mark:i.marks[$n],progress:_e,time:zo,done:K.done,pace:K.pace})),K.done){const He=i.frame==="earth";K=null,ue=null,X=!0,nt=He?Je.get("earth")??null:null,He||xe.target.set(0,0,0),xe.radius=He?4.2:72,we.phi=He?.7:.45}}if(nt&&xe.target.copy(nt.getWorldPosition(B)),K){const i=Q.get(K.id);let y=null,S=1/0;for(const ie of i.marks){if(!ie.body||ie.body==="earth"||ie.body==="far")continue;const ge=Math.abs(ie.index-Ft);ge<14&&ge<S&&(y=ie,S=ge)}const W=y?Je.get(y.body):void 0;if(W){const ie=W.getWorldPosition(gs).add(i.probe.getWorldPosition(ys)).multiplyScalar(.5);xe.target.copy(ie),xe.radius=i.frame==="earth"?1.6:4.2}else xe.radius=i.frame==="earth"?1.5:2.8}if(pn.lerp(xe.target,1-Math.pow(.002,a)),we.radius+=(xe.radius-we.radius)*(1-Math.pow(.004,a)),gt&&Tt){const i=Ae.get(je)?.getWorldPosition(ya)??ya.set(0,0,0);gt.copy(Tt.getWorldPosition(ws).sub(i).normalize());const y=Math.atan2(gt.x,gt.z),S=Math.acos(Math.max(-1,Math.min(1,gt.y)));let W=y-we.theta;W=Math.atan2(Math.sin(W),Math.cos(W)),we.theta+=W*(1-Math.pow(.01,a)),we.phi+=(S-we.phi)*(1-Math.pow(.01,a))}if(me==="blackhole"&&Kt.update(e/1e3,l),me==="exo"){const i=e/1e3;for(const y of co){const S=y.phase0+i/y.period*Math.PI*2;y.mesh.position.set(Math.cos(S)*y.a,0,Math.sin(S)*y.a)}}if(me==="eclipse"){Ve=(Ve+a*.18)%1;const i=Math.sin(Ve*Math.PI*2),y=Math.abs(i)<.22,S=Math.max(0,1-Math.abs(i)/.9),W=ht==="lunar";if(We.visible=!Te,it.visible=Te,se.skySun.visible=!W,se.skyMoon.visible=W,Te)W?(se.skyMoon.position.set(i*1.7,0,.08),se.skyMoonMat.color.set("#f2f2f2").lerp(new G("#c47462"),W?S:0)):se.skyCover.position.set(i*1.7,0,.08);else{se.moon.position.set(W?2.75:1.05,i*.55,0),se.cone.visible=!W,se.umbra.visible=W,se.shadow.opacity=y?.42:.08,se.umbra.material.opacity=y?.42:.08,se.moonMat.color.set("#ffffff").lerp(new G("#c47462"),W?S:0);const ie=y?U("개기"):Math.abs(i)<.6?U("부분"):W?U("반영"):"";Tn.textContent!==ie&&(Tn.textContent=ie)}}if(l.position.set(pn.x+we.radius*Math.sin(we.phi)*Math.sin(we.theta),pn.y+we.radius*Math.cos(we.phi),pn.z+we.radius*Math.sin(we.phi)*Math.cos(we.theta)),l.lookAt(pn),Ie&&(Ie.getWorldPosition(B),Ze.copy(B).multiplyScalar(-1).normalize(),e-Po>500&&!(K&&Q.get(K.id)?.frame==="sun"))){Po=e;const i=Js(new Date(ce)),y=Math.atan2(i.y,i.x),S=Math.atan2(-Ze.z,Ze.x),W=Ie.children[0];W.rotation.y=S-y}jt&&bo&&me!=="blackhole"&&(me!=="system"||je==="system"||je==="sun")&&jt?(jt.render(a),pa+=1,da+=a,pa===90&&da/90>.034&&(bo=!1)):f.render(w,l),l.getWorldDirection(sn),b();const x=[];for(const i of $){const y=Ht.get(i),S=Je.get(i);if(!y||!S)continue;S.getWorldPosition(B);const W=Mn.copy(B).sub(l.position).dot(sn)>0,ie=je==="system"&&me==="system"&&(!nt||K!==null),ge=je==="earth"||je==="moon"||K!==null&&Q.get(K.id)?.frame==="earth";let Pe=W&&(i==="moon"?me==="system"&&ge:ie||ge&&i==="earth"&&K!==null);B.project(l);const _e=(B.x+1)/2*ve.w;let ye=_e;const Le=(1-B.y)/2*ve.h+10;if(Pe){let Ge=A.get(i)??0;Ge||(y.style.display="block",Ge=y.offsetWidth||40,A.set(i,Ge)),ye=Math.min(Math.max(_e,Ge/2+4),Math.max(Ge/2+4,ve.w-Ge/2-4));const qe={x:ye-Ge/2,y:Le,w:Ge,h:22};z(qe.x,qe.y,qe.w,qe.h)||x.some(ct=>qe.x<ct.x+ct.w+4&&qe.x+qe.w+4>ct.x&&qe.y<ct.y+ct.h&&qe.y+qe.h>ct.y)?Pe=!1:x.push(qe)}y.style.display=Pe?"block":"none",Pe&&(y.style.transform=`translate(${ye}px, ${Le}px) translate(-50%, 0)`)}const T=me==="system",O=je!=="system"&&je!=="jupiter"&&je!=="saturn",H=nt!==null&&(K===null?nt===Je.get("earth"):Q.get(K.id)?.frame==="earth");for(const i of Zt)i.visible=!O&&!H;for(const[i,y]of zt){const S=fe.get(i),W=y.parent?Je.get(y.parent)===nt:je==="system"&&(!nt||nt===S),ie=nt===S||W;S.getWorldPosition(B);const ge=Mn.copy(B).sub(l.position).dot(sn)>0,Pe=T&&ge&&ie;B.project(l),y.el.style.display=Pe?"block":"none",Pe&&(y.el.style.transform=`translate(${(B.x+1)/2*ve.w}px, ${(1-B.y)/2*ve.h+8}px) translate(-50%, 0)`)}for(const[i,y]of Q){const S=T&&N===i;if(y.line.visible=S,!S){y.el.style.display="none";continue}y.probe.getWorldPosition(B);const W=Mn.copy(B).sub(l.position).dot(sn)>0;B.y+=0,B.project(l),y.el.style.display=W?"block":"none",W&&(y.el.style.transform=`translate(${(B.x+1)/2*ve.w}px, ${(1-B.y)/2*ve.h}px) translate(10px, -50%)`)}for(const i of $o){if(me!=="stars"){i.el.style.display="none";continue}B.copy(i.at);const y=Mn.copy(B).sub(l.position).dot(sn)>0;B.project(l);const S=y&&Math.abs(B.x)<1&&Math.abs(B.y)<1;i.el.style.display=S?"block":"none",S&&(i.el.style.transform=`translate(${(B.x+1)/2*ve.w}px, ${(1-B.y)/2*ve.h}px) translate(-50%, -50%)`)}for(const i of lo){if(!(i.level===me)){i.el.style.display="none";continue}B.copy(i.marker.position);const S=Mn.copy(B).sub(l.position).dot(sn)>0;B.project(l),i.el.style.display=S?"block":"none",S&&(i.el.style.transform=`translate(${(B.x+1)/2*ve.w}px, ${(1-B.y)/2*ve.h+8}px) translate(-50%, 0)`)}for(const i of co){if(me!=="exo"){i.el.style.display="none";continue}i.mesh.getWorldPosition(B);const y=Mn.copy(B).sub(l.position).dot(sn)>0;B.project(l),i.el.style.display=y?"block":"none",y&&(i.el.style.transform=`translate(${(B.x+1)/2*ve.w}px, ${(1-B.y)/2*ve.h+8}px) translate(-50%, 0)`)}for(const i of ts){if(me!=="blackhole"){i.el.style.display="none";continue}B.copy(i.at),Kt.group.localToWorld(B),B.project(l);const y=B.z<1&&Math.abs(B.x)<1.05&&Math.abs(B.y)<1.05;i.el.style.display=y?"block":"none",y&&(i.el.style.transform=`translate(${(B.x+1)/2*ve.w}px, ${(1-B.y)/2*ve.h}px) translate(-50%, -100%)`)}for(const i of jo){if(me!=="exo"){i.el.style.display="none";continue}B.copy(i.at).project(l);const y=B.z<1&&Math.abs(B.x)<1.05&&Math.abs(B.y)<1.05;i.el.style.display=y?"block":"none",y&&(i.el.style.transform=`translate(${(B.x+1)/2*ve.w}px, ${(1-B.y)/2*ve.h}px) translate(-50%, -100%)`)}for(const[i,y]of[[xt,me==="eclipse"&&!Te],[Uo,me==="sizes"]])for(const S of i){if(!y){S.el.style.display="none";continue}B.copy(S.at).applyMatrix4(S.group.matrixWorld).project(l);let W=B.z<1&&Math.abs(B.x)<1.1&&Math.abs(B.y)<1.1;const ie=(B.x+1)/2*ve.w,ge=(1-B.y)/2*ve.h,Pe=S.el.offsetWidth||44;W&&z(ie-Pe/2,ge-11,Pe,22)&&(W=!1),S.el.style.display=W?"block":"none";const _e=S.group.rotation.z!==0;W&&(S.el.style.transform=`translate(${(B.x+1)/2*ve.w}px, ${(1-B.y)/2*ve.h}px) ${_e?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const i of wt){i.mesh.getWorldPosition(B);const y=Ae.get(i.parent);y?y.getWorldPosition(So):So.set(0,0,0);let W=vs.copy(B).sub(So).normalize().dot(hs.copy(l.position).sub(B).normalize())>.15&&me==="system"&&je===i.parent;B.project(l),W&&z((B.x+1)/2*ve.w+8,(1-B.y)/2*ve.h-11,90)&&(W=!1),i.el.style.display=W?"block":"none",W&&(i.el.style.transform=`translate(${(B.x+1)/2*ve.w}px, ${(1-B.y)/2*ve.h}px) translate(8px, -50%)`)}};return ko=requestAnimationFrame(xa),de===0&&o.onReady?.(),typeof window<"u"&&location.search.includes("surfdebug")&&(window.__surfDebug=()=>({surf:q?{shock:q.impact.sinceImpact(),doom:q.impact.doom(),flash:q.impact.flash(),shake:q.impact.shake(),stats:q.impact.stats()}:null,x:Number(Xe.toFixed(2)),z:Number($e.toFixed(2)),y:Number(l.position.y.toFixed(2)),yaw:Number(Ne.toFixed(2)),pitch:Number(ot.toFixed(2)),jump:Number(hn.toFixed(2)),knock:[Number(yn.toFixed(2)),Number(wn.toFixed(2))],mode:on,alt:Number(dn.toFixed(2))})),{focus:Ho,setLevel:Gn,setPaused:e=>{Yo=e},focusMarker:e=>{const a=lo.find(s=>s.level===me&&s.marker.id===e);a&&(xe.target.copy(a.marker.position),xe.radius=fn[me]*(e==="cmb"?1.4:me==="group"?.6:.42),Bt=performance.now())},showSite:os,focusExtra:ns,setEclipse:(e,a)=>{ht=e,Te=a,Gn("eclipse")},setHemisphere:e=>{je!=="earth"&&Ho("earth");const a=Ze.clone().multiplyScalar(e==="day"?1:-1);we.theta=Math.atan2(a.x,a.z),we.phi=Math.min(2.6,Math.max(.5,Math.acos(a.y))),gt=null,Tt=null,un=!0},enterSurface:oa,setSurfaceWorld:is,exitSurface:cs,setSurfaceMove:(e,a)=>{ho=Math.min(1,Math.max(-1,e)),go=Math.min(1,Math.max(-1,a))},jumpSurface:()=>{nn=!0},setSurfaceMode:fs,setSurfaceSkin:ps,impactSurface:us,dropProbe:Mo,setTime:e=>{X=e===null,ce=e??Date.now(),tt(ce),Po=-1e9},setVoyage:e=>{if(N=e,!e){K&&(K=null,X=!0),ue=null;for(const y of Q.values())y.line.geometry.setDrawRange(0,1/0);return}me!=="system"&&Gn("system"),ue=null;const a=Q.get(e);a.line.geometry.setDrawRange(0,2),je="system",gt=null,Tt=null,un=!1,nt=a.probe;const s=a.frame==="earth";xe.radius=s?1.3:2.8,we.phi=s?.75:1;const d=Math.max(...a.marks.filter(y=>y.at!==void 0&&y.body!=="earth").map(y=>y.at),a.times[0]+864e5),x=a.times[0],T=a.times[a.times.length-1],O=(d-x)/(s?20:24),H=a.frame==="earth"?T:d+60*864e5,i=T>H?(T-H)/4/O:1;K={id:e,sim:x,base:O,fastFrom:H,fast:i,mark:-1,done:!1,lastPing:0,pace:"normal"},Bt=performance.now()},dispose:()=>{ft?.dispose(),jt?.dispose(),Xn?.dispose(),q&&(w.remove(q.group),q.dispose(),q=null),cancelAnimationFrame(ko),va.disconnect(),ga.disconnect(),window.removeEventListener("keydown",ua),window.removeEventListener("keyup",fa),r.removeEventListener("pointerdown",ra),r.removeEventListener("pointermove",ia),r.removeEventListener("pointerup",jn),r.removeEventListener("pointercancel",jn),r.removeEventListener("wheel",ca),w.traverse(e=>{const a=e.material;Array.isArray(a)&&a.forEach(s=>s.dispose())}),C.forEach(e=>e.dispose()),f.dispose(),r.remove(),h.remove()}}}export{ti as createSpace};
