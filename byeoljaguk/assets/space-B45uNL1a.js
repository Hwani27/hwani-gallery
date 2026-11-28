import{t as L,a as Ts}from"./index-BprDdTsx.js";import{G as Re,a as _,c as ye,M as le,e as Ge,A as ke,D as Je,V as F,R as ct,P as qn,f as Un,b as oo,g as to,h as no,d as V,i as Lt,j as bn,k as Po,l as ko,I as Jt,m as Co,n as ta,O as Jn,N as Wa,S as Gn,o as os,p as Ds,q as Es,L as Rs,r as Is,s as as,t as Qn,u as eo,W as Ns,v as Fs,w as Ws,x as _s,T as Us,y as Ls,z as Gs,F as Bs,H as Xo,J as Os,K as Vs,U as Yo,C as Hn,X as _a,Y as js,Z as Xs,_ as Ys,$ as $s,a0 as Hs,a1 as Zs,a2 as Ks,a3 as qs,a4 as Ua,a5 as La,a6 as Js,a7 as Qs}from"./three-CdrtplTJ.js";import{af as er,ag as Ga,ah as tr,ai as $o,aj as Ba,ak as nr,al as or,am as Zn,C as ar,an as sr,ao as ho,ap as rr}from"./App-KeCn1nC-.js";import{U as Ho,V as ir}from"./audio-C0j9PThZ.js";import{C as Oa}from"./sky-DwzokRNb.js";import"./index-dfCY58gR.js";import"./index-D6jpeHfw.js";const Va=`
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
`,vo=3,Zo=9;function cr(t){const o=new Re;o.visible=!1,o.rotation.z=.1;const n=new _(t(new ye(1,48,32)),t(new le({color:"#000000"})));n.renderOrder=0,o.add(n);const f=t(new Ge({uniforms:{uTime:{value:0},uCam:{value:new F}},transparent:!0,depthWrite:!1,side:Je,blending:ke,vertexShader:`
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
        ${Va}
        void main() {
          float r = length(vP);
          float t = clamp((r - ${vo.toFixed(1)}) / ${(Zo-vo).toFixed(1)}, 0.0, 1.0);
          // Keplerian: inner gas orbits faster.
          vec2 p = rot(vP, -uTime * 2.2 / pow(r / ${vo.toFixed(1)}, 1.5));
          float n = noise(p * 1.6) * 0.55 + noise(p * 4.5 + 7.0) * 0.3 + noise(vec2(r * 6.0, 0.0) + p * 0.3) * 0.15;
          // Doppler beaming: approaching side is brighter.
          vec3 viewDir = normalize(uCam - vW);
          float beam = pow(clamp(1.0 + 0.5 * dot(vTan, viewDir), 0.25, 1.5), 2.0);
          float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.7, 1.0, t));
          float bright = (0.35 + 0.8 * n) * beam * (1.3 - t);
          gl_FragColor = vec4(diskColor(t) * bright * edge, 1.0);
        }
      `})),p=new _(t(new ct(vo,Zo,256,8)),f);p.rotation.x=-Math.PI/2,p.renderOrder=1,o.add(p);const S=t(new Ge({uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:ke,vertexShader:`
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vP;
        ${Va}
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
      `})),r=new _(t(new qn(8,8)),S);r.renderOrder=2,o.add(r);const g=[{name:L("궁수자리 A*"),at:new F(0,3.6,0)},{name:L("사건의 지평선"),at:new F(0,-2.9,0)},{name:L("강착 원반"),at:new F(Zo-1.2,0,0)}],A=new F;return{group:o,labels:g,update(y,b){f.uniforms.uTime.value=y,S.uniforms.uTime.value=y,b.getWorldPosition(A),f.uniforms.uCam.value.copy(A),r.lookAt(A)}}}const Kn=Math.PI/180;function Ut(t,o,n){return new F(Math.cos(o*Kn)*Math.cos(t*Kn),Math.sin(o*Kn),-Math.cos(o*Kn)*Math.sin(t*Kn)).multiplyScalar(n)}function lr(){const o=document.createElement("canvas");o.width=64,o.height=64;const n=o.getContext("2d");if(n){const f=n.createRadialGradient(32,32,0,32,32,32);f.addColorStop(0,"rgba(255,255,255,1)"),f.addColorStop(.25,"rgba(255,255,255,0.75)"),f.addColorStop(1,"rgba(255,255,255,0)"),n.fillStyle=f,n.fillRect(0,0,64,64)}return new oo(o)}function ur(){const t=[],o=y=>(t.push(y),y),n=o(lr());function f(y,b,P){const w=new to(o(new no({map:n,color:new V(y),transparent:!0,depthWrite:!1,blending:ke})));return w.scale.setScalar(b),w.position.copy(P),w}function p(y,b,P){const w=new Float32Array(y*3),d=new Float32Array(y*3);for(let c=0;c<y;c+=1){const[Y,I]=b(c);w.set([Y.x,Y.y,Y.z],c*3),d.set([I.r,I.g,I.b],c*3)}const k=o(new Lt);return k.setAttribute("position",new bn(w,3)),k.setAttribute("color",new bn(d,3)),new Po(k,o(new ko({size:P,map:n,vertexColors:!0,transparent:!0,depthWrite:!1,blending:ke,sizeAttenuation:!0})))}let S=7;const r=()=>(S=S*16807%2147483647,(S-1)/2147483646),g={},A={};{const y=new Re,b=2.6,P=[["alphacen",L("센타우루스자리 알파"),219.9,-60.83,4.37,"#fff4e0",L("태양에서 가장 가까운 별 무리예요. 그중 프록시마가 약 4.2광년으로 가장 가까워요.")],["barnard",L("바너드별"),269.45,4.69,5.96,"#ffb27a",L("작고 붉은 별이에요. 밤하늘에서 자리가 가장 빨리 바뀌는 별로 알려져 있어요.")],["wolf359",L("울프 359"),164.12,7.01,7.86,"#ff9a6a",L("아주 작고 어두운 붉은 별이라 맨눈으로는 보이지 않아요.")],["sirius",L("시리우스"),101.29,-16.72,8.6,"#cfe0ff",L("밤하늘에서 가장 밝은 별이에요. 약 8.6광년 떨어져 있어요.")],["ross154",L("로스 154"),282.46,-23.84,9.69,"#ffa070",L("궁수자리 쪽의 작은 붉은 별이에요.")],["epseri",L("에리다누스자리 엡실론"),53.23,-9.46,10.5,"#ffd9a8",L("행성을 거느린 것으로 여겨지는 가까운 별이에요.")],["61cyg",L("백조자리 61"),316.7,38.75,11.4,"#ffc58a",L("처음으로 거리가 재어진 별이에요(1838년).")],["procyon",L("프로키온"),114.83,5.22,11.46,"#fff3d6",L("작은개자리의 밝은 별이에요.")],["epsind",L("인디언자리 엡실론"),330.84,-56.79,11.87,"#ffcf9a",L("남쪽 하늘의 가까운 별이에요.")],["taucet",L("고래자리 타우"),26.02,-15.94,11.9,"#fff0d0",L("태양과 닮은 별이라 오래전부터 관심을 받았어요.")]];y.add(f("#ffe39a",3.2,new F));const w=[{id:"sun-star",name:L("태양"),line:L("우리 별이에요. 여기서 보면 태양도 그냥 밝은 별 하나예요."),position:new F}];for(const[d,k,c,Y,I,W,K]of P){const J=Ut(c,Y,I*b);y.add(f(W,2.4,J)),w.push({id:d,name:k,line:Ts("{0} 거리 약 {1}광년.",K,I),position:J})}y.add(p(500,()=>[new F(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(60+r()*30),new V().setHSL(.1,.3,.5+r()*.4)],.9)),g.stars=y,A.stars=w}{const y=new Re,b=1/40,P=[["pleiades",L("플레이아데스(좀생이별)"),56.75,24.12,444,"#bcd2ff",3,L("약 444광년 떨어진 젊은 별 무리예요.")],["betelgeuse",L("베텔게우스"),88.79,7.41,548,"#ffab6e",3,L("붉은 초거성이에요. 약 550광년쯤 떨어져 있다고 여겨요.")],["rigel",L("리겔"),78.63,-8.2,860,"#cfe0ff",3,L("푸르고 아주 밝은 초거성이에요. 약 860광년.")],["orionneb",L("오리온 대성운"),83.82,-5.39,1344,"#ff9ec4",9,L("별이 태어나는 가스 구름이에요. 약 1,340광년. 맨눈으로도 희미하게 보여요.")],["deneb",L("데네브"),310.36,45.28,2600,"#e6eeff",3,L("백조자리 꼬리의 별로, 아주 멀지만 무척 밝아요(약 2,600광년, 거리는 아직 불확실).")]];y.add(f("#ffe39a",1.6,new F));const w=[{id:"sun-orion",name:L("태양"),line:L("우리은하의 오리온 팔 안쪽에 있어요."),position:new F}];for(const[d,k,c,Y,I,W,K,J]of P){const $=Ut(c,Y,I*b);y.add(f(W,K,$)),d==="orionneb"&&y.add(p(260,()=>{const oe=Math.pow(r(),.6)*5;return[new F(r()-.5,r()-.5,r()-.5).normalize().multiplyScalar(oe).add($),new V(r()<.6?"#ff7fb0":"#8fb7ff").multiplyScalar(.5)]},2.2)),w.push({id:d,name:k,line:J,position:$})}y.add(p(1400,()=>{const d=(r()-.5)*120,k=(r()-.5)*22*(.4+r()),c=(r()-.5)*4;return[new F(d,c,k),new V().setHSL(.6+r()*.1,.3,.35+r()*.3)]},.8)),g.orion=y,A.orion=w}{const y=new Re,b=4;y.add(p(9e3,w=>{const d=w%b,k=Math.pow(r(),.55)*25,c=d/b*Math.PI*2+Math.log(1+k)*1.9+(r()-.5)*(.5+4/(k+2)),Y=(r()-.5)*(k<4?2.2:.7),I=k<4,W=I?new V("#ffd9a0"):new V().setHSL(.58+r()*.06,.45,.45+r()*.35);return[new F(Math.cos(c)*k,Y,Math.sin(c)*k),W.multiplyScalar(I?.8:.6)]},.55)),y.add(f("#fff0c8",7,new F));const P=new F(13,0,0);y.add(f("#ffe39a",1.2,P)),g.galaxy=y,A.galaxy=[{id:"center",name:L("은하 중심(궁수자리 A*)"),line:L("태양에서 약 2만 6천 광년. 태양의 약 400만 배 무거운 블랙홀이 있어요."),position:new F},{id:"sun-gal",name:L("태양은 여기"),line:L("중심에서 약 2만 6천 광년 떨어진 오리온 팔에 있어요. 은하 중심을 한 바퀴 도는 데 약 2억 3천만 년 걸려요."),position:P}]}{const y=new Re,b=1/1e5,P=(I,W,K,J,$)=>p(J,oe=>{const pe=Math.pow(r(),.6)*W,he=oe%2*Math.PI+Math.log(1+pe*3)*2.2+(r()-.5)*.9,re=new F(Math.cos(he)*pe,(r()-.5)*W*.05,Math.sin(he)*pe);re.applyAxisAngle(new F(1,0,0),K);const ie=pe<W*.18;return[re.add(I),new V().setHSL(ie?.1:$,.4,.45+r()*.3).multiplyScalar(ie?.35:.22)]},.4),w=new F;y.add(P(w,2.2,0,1800,.6));const d=Ut(10.68,41.27,25e5*b);y.add(P(d,4.4,1.2,3200,.1));const k=Ut(23.46,30.66,273e4*b);y.add(P(k,1.6,.6,900,.62));const c=Ut(80.89,-69.76,16e4*b);y.add(f("#cfd8ff",1.2,c));const Y=Ut(13.19,-72.83,2e5*b);y.add(f("#cfd8ff",.8,Y)),g.group=y,A.group=[{id:"mw",name:L("우리 은하"),line:L("지름 약 10만 광년. 수천억 개의 별이 있어요. 이 단계에서는 은하를 보기 좋게 실제보다 크게 그렸어요."),position:w},{id:"andromeda",name:L("안드로메다은하"),line:L("약 250만 광년. 맨눈으로 쉽게 볼 수 있는 가장 먼 천체예요. 지금 보는 빛은 250만 년 전에 떠났어요."),position:d},{id:"triangulum",name:L("삼각형자리은하"),line:L("약 270만 광년. 국부은하군에서 세 번째로 큰 은하예요."),position:k},{id:"lmc",name:L("대마젤란은하"),line:L("약 16만 광년. 우리 은하 곁을 도는 작은 은하예요. 남반구에서 보여요."),position:c}]}{const y=new Re,b=6,P=(I,W,K)=>new F(I,W,K).multiplyScalar(b),w=P(5.1,.35,1.1),d=P(3.4,.45,.2),k=P(-1.4,-.3,-.5),c=[[P(.2,0,0),900,6.4*b*.5],[d,280,1.5*b*.5],[k,220,1.7*b*.5],[P(-2.2,1.6,2.4),120,1.1*b*.5]],Y=c.reduce((I,W)=>I+W[1],0);y.add(p(Y+180,I=>{let W=I;for(const[J,$,oe]of c){if(W<$)return[new F(r()-.5,(r()-.5)*.5,r()-.5).multiplyScalar(2*oe*Math.pow(r(),.5)).add(J),new V("#f3eee6").multiplyScalar(.75)];W-=$}const K=r();return[w.clone().lerp(k,K).add(new F((r()-.5)*.7*b,(r()-.5)*.45*b,(r()-.5)*.7*b)),new V("#e7c48a").multiplyScalar(.8)]},.5)),y.add(new _(o(new ye(.95*b,20,16)),o(new le({color:"#d5e2f5",transparent:!0,opacity:.1,blending:ke,depthWrite:!1}))).translateX(d.x).translateY(d.y).translateZ(d.z)),y.add(new _(o(new ye(1.05*b,20,16)),o(new le({color:"#e7c48a",transparent:!0,opacity:.09,blending:ke,depthWrite:!1}))).translateX(k.x).translateY(k.y).translateZ(k.z)),y.add(f("#e4b56a",1.2,w)),g.super=y,A.super=[{id:"localgroup",name:L("우리 은하군"),line:L("우리 은하와 안드로메다가 있는 작은 무리예요. 초은하단 가장자리 쪽에 있어요."),position:w},{id:"virgo-sc",name:L("처녀자리 은하단"),line:L("약 5,400만 광년. 우리 은하군은 이 은하단 쪽으로 조금씩 끌려가요."),position:d},{id:"attractor-sc",name:L("거대 인력체"),line:L("라니아케아 초은하단의 한가운데쯤이에요. 은하 10만 개쯤이 이쪽으로 흘러가요. 끝에서 끝까지 약 5억 광년이에요."),position:k}]}{const y=new Re,b=1/1e7,P=Ut(187.7,12.4,54e6*b),w=Ut(243,-60,2e8*b);y.add(p(5e3,k=>{const c=k%5,I=[P,w,Ut(30,20,15e7*b),Ut(160,-30,18e7*b),Ut(300,40,14e7*b)][c],W=c===1?7:4;return[new F((r()-.5)*2,(r()-.5)*2,(r()-.5)*2).multiplyScalar(W*Math.pow(r(),.4)).add(I),new V().setHSL(.08+r()*.5,.35,.55).multiplyScalar(.8)]},.8)),y.add(f("#ffffff",.8,new F));const d=new _(o(new ye(42,48,32)),o(new le({color:"#ff8a4a",transparent:!0,opacity:.08,side:Un,depthWrite:!1})));y.add(d),g.cosmos=y,A.cosmos=[{id:"here",name:L("우리 은하"),line:L("여기서는 점 하나예요."),position:new F},{id:"virgo",name:L("처녀자리 은하단"),line:L("약 5,400만 광년. 은하 1,000개 넘게 모인 큰 은하단이에요."),position:P},{id:"attractor",name:L("거대 인력체"),line:L("약 2억 광년 쪽. 주변 은하들이 끌려가는 방향이에요. 우리 은하도 그 흐름(라니아케아 초은하단) 안에 있어요."),position:w},{id:"cmb",name:L("가장 오래된 빛"),line:L("우주가 태어나고 약 38만 년 뒤에 나온 빛(우주 배경 복사)이에요. 138억 년을 달려왔어요. 실제 거리는 이 그림의 눈금으로 그릴 수 없어요."),position:new F(0,0,-42)}]}for(const y of Object.values(g))y.visible=!1;return{groups:g,markers:A,dispose:()=>t.forEach(y=>y.dispose())}}const go=1.7,ja=t=>{const o=Math.min(1,Math.max(0,t));return o*o*(3-2*o)};function Xa(t){try{const o=navigator;typeof o.vibrate=="function"&&o.vibrate(t)}catch{}}function Ko(t,o,n){const p=document.createElement("canvas");p.width=128,p.height=128;const S=p.getContext("2d"),r=S.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,t),r.addColorStop(.35,o),r.addColorStop(1,n),S.fillStyle=r,S.fillRect(0,0,128,128);const g=new oo(p);return g.colorSpace=Gn,g}function fr(t){const o=new Re,n=(()=>{let H=2654435769;return()=>(H=H*1664525+1013904223>>>0,H/4294967296)})(),f=Ko("rgba(255,255,255,1)","rgba(255,168,64,0.85)","rgba(255,90,0,0)"),p=Ko("rgba(120,104,96,0.55)","rgba(70,60,56,0.35)","rgba(40,34,32,0)"),S=Ko("rgba(255,255,255,1)","rgba(255,214,160,0.7)","rgba(255,140,40,0)"),r=[f,p,S],g=H=>(r.push(H),H),A=new Re,y=new _(g(new Jt(1,1)),g(new le({color:new V(2757128),fog:!1})));y.scale.setScalar(15),A.add(y);const b=new _(g(new Jt(1,1)),g(new le({color:new V(16742946),transparent:!0,opacity:.85,blending:ke,depthWrite:!1,fog:!1})));b.scale.setScalar(21),A.add(b);const P=(H,R,T,Z=ke)=>{const ue=g(new no({map:H,color:new V(R),transparent:!0,depthWrite:!1,blending:Z,fog:!1})),G=new to(ue);return G.scale.setScalar(T),G},w=P(S,16747050,150);A.add(w);const d=P(f,16765562,70);A.add(d),A.visible=!1,o.add(A);const k=[],c=96;for(let H=0;H<c;H+=1){const R=H%3===0,T=P(R?p:f,R?9074022:16747571,1,R?Wa:ke);T.visible=!1,o.add(T),k.push({sprite:T,mat:T.material,life:0,max:1,from:1,to:1,rise:0,driftX:1,driftZ:1,spin:0,smoke:R})}let Y=0;const I=(H,R,T,Z,ue,G,N)=>{let se=null;for(let st=0;st<k.length;st+=1){const lt=k[(Y+st)%k.length];if(lt.smoke===R&&(lt.life<=0||!se)&&(se=lt,Y=(Y+st+1)%k.length,lt.life<=0))break}se&&(se.sprite.position.copy(H),se.sprite.visible=!0,se.life=Z,se.max=Z,se.from=T*.45,se.to=T,se.rise=ue,se.driftX=(n()-.5)*G,se.driftZ=(n()-.5)*G,se.spin=(n()-.5)*1.4,se.sprite.material.rotation=n()*Math.PI*2,se.mat.opacity=R?.46:.55,N!==void 0?se.mat.color.setHex(N):se.mat.color.setHex(R?7035474:16742946),se.sprite.scale.setScalar(se.from))},W=new _(g(new ye(1,32,20)),g(new le({color:new V(16757575),transparent:!0,opacity:0,blending:ke,depthWrite:!1,side:Je,fog:!1})));W.visible=!1,o.add(W);const K=new _(g(new ye(1,24,16)),g(new le({color:new V(16774872),transparent:!0,opacity:0,blending:ke,depthWrite:!1,side:Je,fog:!1})));K.visible=!1,o.add(K);const J=new _(g(new ye(1,28,18)),g(new le({color:new V(16731410),transparent:!0,opacity:0,blending:ke,depthWrite:!1,side:Je,fog:!1})));J.visible=!1,o.add(J);const $=[],oe=(H,R,T,Z,ue,G,N)=>{const se=g(new le({color:new V(T),transparent:!0,opacity:Z,blending:ke,depthWrite:!1,side:Je,fog:!1})),st=g(new ct(H,R,64,1)),lt=new _(st,se);ue&&(lt.rotation.x=-Math.PI/2),lt.visible=!1,o.add(lt);const tn={mesh:lt,mat:se,grow:G,life:0,max:N,flat:ue};return $.push(tn),tn};oe(.92,1,16742946,.9,!0,480,1.3),oe(.9,1,16726538,.75,!0,620,1.9),oe(.86,1,16765066,.7,!0,340,.9),oe(.82,1,11569770,.5,!0,420,2.6),oe(.95,1,16769712,.55,!1,700,1.6);const pe=220,he=g(new Lt),re=new Float32Array(pe*3),ie=new Float32Array(pe*3);he.setAttribute("position",new bn(re,3));const Ye=g(new ko({color:new V(16756832),size:2.4,transparent:!0,opacity:0,depthWrite:!1,blending:ke,sizeAttenuation:!0,fog:!1})),tt=new Po(he,Ye);tt.frustumCulled=!1,tt.visible=!1,o.add(tt);const at=150,Ce=new Co(g(new Jt(1,0)),g(new le({color:new V(16777215),transparent:!0,opacity:1,fog:!1})),at);Ce.instanceMatrix.setUsage(ta),Ce.frustumCulled=!1,Ce.visible=!1,o.add(Ce);const gt=[];for(let H=0;H<at;H+=1)gt.push({p:new F,v:new F,s:1,spin:new F,rot:new F});const Ae=new Jn,Ie=new Re;Ie.visible=!1,o.add(Ie);const $e=g(new le({color:new V(1773580),transparent:!0,opacity:0,depthWrite:!1,fog:!1}));$e.blending=Wa;const Nt=g(new le({color:new V(3809818),transparent:!0,opacity:0,depthWrite:!1,fog:!1})),Zt=g(new le({color:new V(16734738),transparent:!0,opacity:0,blending:ke,depthWrite:!1,side:Je,fog:!1})),Pt=g(new le({color:new V(16756832),transparent:!0,opacity:0,blending:ke,depthWrite:!1,fog:!1})),Ft=(H,R,T,Z)=>{H.rotateX(-Math.PI/2);const ue=t.floorAt(R,T)-t.heightAt(R,T),G=H.attributes.position;for(let N=0;N<G.count;N+=1){const se=G.getX(N),st=G.getZ(N);G.setY(N,t.heightAt(R+se,T+st)+ue+Z)}return G.needsUpdate=!0,H.computeVertexNormals(),H};function un(H,R,T,Z){Ie.clear();const ue=Ft(g(new ct(.01,Z*1.36,72,10)),H,R,.35),G=new _(ue,$e);G.position.set(H,0,R),Ie.add(G);const N=Ft(g(new ct(Z*.95,Z*1.3,72,3)),H,R,.5),se=new _(N,Nt);se.position.set(H,0,R),Ie.add(se);const st=Ft(g(new ct(Z*.42,Z*1.1,72,6)),H,R,.42),lt=new _(st,Zt);lt.position.set(H,0,R),Ie.add(lt);const tn=Ft(g(new ct(.01,Z*.45,72,5)),H,R,.45),pn=new _(tn,Pt);pn.position.set(H,0,R),Ie.add(pn),Ie.visible=!0}let Me=-1,nt=-1,vt=new F,ae=new F,ee=!1;function Mt(){for(const H of k)H.life=0,H.sprite.visible=!1}function Ot(H,R,T=0,Z=0){Mt();const ue=t.floorAt(H,R);ae.set(H,ue,R);const G=T||0,N=Z||0;vt.set(H+G*900,ue+520,R+N*900),A.visible=!0,A.position.copy(vt),W.visible=!1,J.visible=!1;for(const se of $)se.life=0,se.mesh.visible=!1;Ce.visible=!1,tt.visible=!1,Ye.opacity=0,ee=!1,nt=-1,Me=0,Xa([30,90,40])}function fn(H,R){if(!(Me<0)){if(Me+=R,!ee&&Me>=go){ee=!0,nt=Me,Xa([140,60,240,70,320,80,420,110,520,160,380]);const T=t.onScar?.(ae.x,ae.z)??26;t.onImpact?.(),un(ae.x,ae.z,ae.y,T),W.visible=!0,J.visible=!0,Ce.visible=!0,tt.visible=!0,Ye.opacity=.95;for(const Z of $)Z.life=Z.max,Z.mesh.visible=!0,Z.mesh.scale.setScalar(4),Z.mesh.position.set(ae.x,ae.y+(Z.flat?.6:2),ae.z),Z.flat||Z.mesh.rotation.set(0,0,0);for(let Z=0;Z<at;Z+=1){const ue=gt[Z],G=n()*Math.PI*2,N=6+n()*34;ue.p.set(ae.x+Math.cos(G)*N*.2,ae.y+2+n()*8,ae.z+Math.sin(G)*N*.2);const se=28+n()*62;ue.v.set(Math.cos(G)*se,26+n()*70,Math.sin(G)*se),ue.s=.7+Math.pow(n(),2)*4.6,ue.spin.set((n()-.5)*6,(n()-.5)*6,(n()-.5)*6),ue.rot.set(n()*3,n()*3,n()*3)}Ce.material.opacity=1;for(let Z=0;Z<at;Z+=1){const ue=Z%3===0;Ce.setColorAt(Z,new V(ue?16747066:Z%3===1?8010270:4860444))}Ce.instanceColor&&(Ce.instanceColor.needsUpdate=!0);for(let Z=0;Z<pe;Z+=1){const ue=n()*Math.PI*2,G=Math.sqrt(n())*90;re[Z*3]=ae.x+Math.cos(ue)*G,re[Z*3+1]=ae.y+20+n()*260,re[Z*3+2]=ae.z+Math.sin(ue)*G,ie[Z*3]=(n()-.5)*24,ie[Z*3+1]=-(16+n()*34),ie[Z*3+2]=(n()-.5)*24}he.attributes.position.needsUpdate=!0}if(!ee){const T=Math.min(1,Me/go),Z=Math.pow(T,2.15);A.position.lerpVectors(vt,ae,Z);const ue=(1-Z)*40;A.position.x+=Math.sin(Me*9.1)*ue,A.position.z+=Math.cos(Me*7.3)*ue,A.rotation.x+=R*2.2,A.rotation.y+=R*1.4,w.scale.setScalar(150+Math.sin(Me*20)*26),d.scale.setScalar(70+Math.sin(Me*26)*14);for(let G=0;G<2;G+=1){const N=A.position.clone();N.x+=(n()-.5)*26,N.y+=(n()-.5)*26,N.z+=(n()-.5)*26,I(N,!1,90+n()*60,.9+n()*.5,6,18)}I(A.position.clone(),!0,150+n()*90,1.8+n()*.8,12,26)}for(const T of k){if(T.life<=0)continue;if(T.life-=R,T.life<=0){T.sprite.visible=!1;continue}const Z=1-T.life/T.max,ue=T.from+(T.to-T.from)*Math.sqrt(Z);T.sprite.scale.setScalar(ue),T.sprite.position.y+=T.rise*R*(1-Z),T.sprite.position.x+=T.driftX*R,T.sprite.position.z+=T.driftZ*R,T.sprite.material.rotation+=T.spin*R;const G=T.smoke?Math.pow(1-Z,1.8)*.46:Math.pow(1-Z,1.3)*.55;T.mat.opacity=G}if(ee){const T=Me-nt,Z=(G,N,se)=>G+(N-G)*ja(T/se);W.scale.setScalar(Z(2,46,.85)),W.material.opacity=Math.max(0,1-T/1.9)*.95,K.scale.setScalar(Z(1,24,.4)),K.material.opacity=Math.max(0,1-T/.5),W.position.set(ae.x,ae.y+8,ae.z),K.position.set(ae.x,ae.y+10,ae.z),J.scale.setScalar(Z(3,34,1)),J.material.opacity=Math.max(0,.6-T/1.3*.6),J.position.set(ae.x,ae.y+4,ae.z);for(const G of $){if(G.life<=0)continue;if(G.life-=R,G.life<=0){G.mesh.visible=!1;continue}const N=1-G.life/G.max;G.mesh.scale.setScalar(4+G.grow*Math.pow(N,.6)),G.mat.opacity=Math.max(0,(1-N)*(G.flat?.85:.6))}if(T<1.8&&T%.085<R){const G=new F(ae.x+(n()-.5)*18,ae.y+3+n()*6,ae.z+(n()-.5)*18);n()<.65&&I(G,!1,76+n()*56,1.4+n()*.7,14+n()*12,20,16761962),I(G,!0,60+n()*46,1.8+n()*.8,12+n()*10,26,11573898)}if(T<1.7&&T%.05<R){const G=n()*Math.PI*2,N=26+T*46+n()*22,se=new F(ae.x+Math.cos(G)*N,ae.y+2+n()*12,ae.z+Math.sin(G)*N);I(se,!0,50+n()*40,1.6,7,14,11573376),n()<.55&&I(se,!1,70+n()*60,1.3,10,10,16751164)}if(T>.4&&T<2.8&&T%.11<R){const G=n()*Math.PI*2,N=16+n()*46,se=new F(ae.x+Math.cos(G)*N,ae.y+34+n()*30,ae.z+Math.sin(G)*N);I(se,!0,70+n()*52,2,8,24,10520692)}const ue=Ce.material;if(ue.opacity=Math.max(0,1-Math.max(0,T-3.4)/1.2),ue.opacity<=.01)Ce.visible=!1;else{for(let G=0;G<at;G+=1){const N=gt[G];N.v.y-=9.81*.55*R,N.v.multiplyScalar(1-R*.12),N.p.addScaledVector(N.v,R);const se=t.floorAt(N.p.x,N.p.z)+N.s*.4;N.p.y<se&&(N.p.y=se,N.v.y=Math.abs(N.v.y)*.32,N.v.x*=.7,N.v.z*=.7),N.rot.x+=N.spin.x*R,N.rot.y+=N.spin.y*R,N.rot.z+=N.spin.z*R,Ae.position.copy(N.p),Ae.rotation.set(N.rot.x,N.rot.y,N.rot.z),Ae.scale.setScalar(N.s),Ae.updateMatrix(),Ce.setMatrixAt(G,Ae.matrix)}Ce.instanceMatrix.needsUpdate=!0}if(tt.visible)if(Ye.opacity=Math.max(0,.95-Math.max(0,T-4)/1.6),Ye.opacity<=.01)tt.visible=!1;else{for(let G=0;G<pe;G+=1){const N=G*3;re[N]+=ie[N]*R,re[N+1]+=ie[N+1]*R,re[N+2]+=ie[N+2]*R,ie[N+1]-=5*R;const se=t.floorAt(re[N],re[N+2])+.4;re[N+1]<se&&(re[N]=ae.x+(n()-.5)*160,re[N+1]=ae.y+120+n()*160,re[N+2]=ae.z+(n()-.5)*160,ie[N]=(n()-.5)*20,ie[N+1]=-(14+n()*26),ie[N+2]=(n()-.5)*20)}he.attributes.position.needsUpdate=!0}$e.opacity=Math.min(.42,T*1.1),Nt.opacity=Math.min(.4,T*1.1),Zt.opacity=Math.max(0,.85*Math.exp(-T/5.5)),Pt.opacity=Math.max(0,.9*Math.exp(-T/1.8))}if(ee&&(A.visible=!1),Me>80){Me=-1,nt=-1,A.visible=!1,W.visible=!1,K.visible=!1,J.visible=!1,Ie.visible=!1;for(const T of k)T.life=0,T.sprite.visible=!1;for(const T of $)T.life=0,T.mesh.visible=!1;Ce.visible=!1,tt.visible=!1}}}return{group:o,strike:Ot,doom:()=>{if(Me<0)return 0;if(!ee)return Math.min(1,ja(Me/(go*.82))*(.93+.07*Math.sin(Me*12)));const H=Me-nt;return H<1.8?1:Math.max(0,1-(H-1.8)/20)},flash:()=>{if(!ee)return 0;const H=Me-nt,R=Math.exp(-H/.16),T=H>.35?.5*Math.exp(-(H-.35)/.3):0;return Math.min(1,R+T)},shake:()=>{if(Me<0)return 0;if(!ee)return .02+Math.pow(Me/go,3)*.18;const H=Me-nt;if(H>3.6)return 0;let R=1.55*Math.exp(-H/1.35);return R+=.55*Math.exp(-Math.pow((H-1.55)/.22,2)),R+=.32*Math.exp(-Math.pow((H-2.35)/.26,2)),R+=.18*Math.exp(-Math.pow((H-3)/.3,2)),R*Math.min(1,H/.06)},sinceImpact:()=>nt>=0?Me-nt:-1,stats:()=>{const H=k.filter(T=>T.life>0),R=H[0];return{t:Number(Me.toFixed(2)),target:[Number(ae.x.toFixed(1)),Number(ae.y.toFixed(1)),Number(ae.z.toFixed(1))],start:[Number(vt.x.toFixed(1)),Number(vt.z.toFixed(1))],alive:H.length,map:R?!!R.mat.map:null,op:R?Number(R.mat.opacity.toFixed(2)):null,sc:R?Number(R.sprite.scale.x.toFixed(1)):null,pos:R?R.sprite.position.toArray().map(T=>Number(T.toFixed(1))):null,vis:R?R.sprite.visible:null,fire:[Number(W.material.opacity.toFixed(2)),Number(W.scale.x.toFixed(0)),W.visible],crater:[Ie.visible,Ie.children.length,Number($e.opacity.toFixed(2)),Number(Zt.opacity.toFixed(2))]}},update:fn,dispose:()=>{o.clear(),r.forEach(H=>H.dispose())}}}const pr=`
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
`,mr=`
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
`,dr=`
uniform float uTile;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vUv = wp.xz / uTile;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,hr=`
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
`,Ya=`
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
`,$a=`
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
`,Fn=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,qo=`
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
`,yo=`
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
`,It=Math.PI*2,ss=9,Ha=140;function Gt(t){return t<0?0:t>1?1:t}function So(t,o,n){return t<o?o:t>n?n:t}function en(t,o,n){const f=Gt((n-t)/(o-t));return f*f*(3-2*f)}function ln(t,o,n){let f=Math.imul(t|0,374761393)^Math.imul(o|0,668265263)^Math.imul(n|0,2246822519);return f=Math.imul(f^f>>>13,1274126177),((f^f>>>16)>>>0)/4294967295}function vr(t,o,n,f){const p=Math.floor(t),S=Math.floor(o),r=t-p,g=o-S,A=r*r*(3-2*r),y=g*g*(3-2*g),b=Math.max(1,Math.round(n)),P=J=>(J%b+b)%b,w=P(p),d=P(p+1),k=P(S),c=P(S+1),Y=ln(w,k,f),I=ln(d,k,f),W=ln(w,c,f),K=ln(d,c,f);return(Y+(I-Y)*A)*(1-y)+(W+(K-W)*A)*y}function Bt(t,o,n,f,p){let S=0,r=.5,g=0,A=n;for(let y=0;y<f;y+=1)S+=r*vr(t*A,o*A,A,p+y*17),g+=r,r*=.5,A*=2;return S/g}function rs(t){let o=t>>>0||1;return()=>(o=Math.imul(o,1664525)+1013904223>>>0,o/4294967296)}function Bn(t,o){const n=document.createElement("canvas");n.width=t,n.height=o;const f=n.getContext("2d");if(!f)throw new Error("2D canvas is unavailable");return{canvas:n,ctx:f}}const gr={crater:{seed:101,macro:.38,mid:.17,fine:.12,speck:.15,craters:20,stones:90,cracks:0,ripples:0,gloss:.02},rock:{seed:211,macro:.4,mid:.22,fine:.14,speck:.2,craters:5,stones:150,cracks:9,ripples:1,gloss:.05},volcano:{seed:331,macro:.32,mid:.24,fine:.16,speck:.22,craters:4,stones:110,cracks:14,ripples:0,gloss:.08},ice:{seed:401,macro:.26,mid:.2,fine:.2,speck:.16,craters:5,stones:18,cracks:22,ripples:0,gloss:.5},plain:{seed:509,macro:.3,mid:.15,fine:.1,speck:.13,craters:8,stones:70,cracks:3,ripples:.35,gloss:.03},plasma:{seed:601,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0},ring:{seed:701,macro:.2,mid:.2,fine:.2,speck:.2,craters:0,stones:0,cracks:0,ripples:0,gloss:0}};function zo(t,o,n,f,p,S,r,g,A=!1){const y=Math.ceil(S),b=Math.round(f),P=Math.round(p);for(let w=-y;w<=y;w+=1)for(let d=-y;d<=y;d+=1){const k=(d*d+w*w)/(S*S);if(k>=1)continue;const c=A?Math.sqrt(1-k):1-k,Y=((b+d)%n+n)%n,W=((P+w)%n+n)%n*n+Y;t[W]+=r*c,o[W]+=g*c}}function yr(t,o,n,f,p,S,r){const g=.09+r()*.12,A=.05+r()*.06,y=.72+r()*.5,b=r()*Math.PI,P=Math.cos(b),w=Math.sin(b),d=Math.ceil(S*1.4),k=Math.round(f),c=Math.round(p);for(let Y=-d;Y<=d;Y+=1)for(let I=-d;I<=d;I+=1){const W=(I*P+Y*w)/S,K=(-I*w+Y*P)/(S*y),J=Math.sqrt(W*W+K*K);if(J>1.4)continue;let $=0,oe=0;J<1&&($-=Math.pow(1-J*J,1.25)*g,oe-=(1-J)*.05);const pe=Math.exp(-Math.pow((J-1.02)/.2,2))*A;$+=pe,oe+=pe*1.1+(J>1&&J<1.35?.02:0);const he=((k+I)%n+n)%n,ie=((c+Y)%n+n)%n*n+he;o[ie]+=$,t[ie]+=oe}}function Jo(t,o,n,f,p,S,r,g,A,y){const P=Math.max(2,Math.floor(r/1.1));let w=S,d=f,k=p;for(let c=0;c<P;c+=1){w+=(A()-.5)*.3,d+=Math.cos(w)*1.1,k+=Math.sin(w)*1.1;const Y=g*(.6+A()*.8);y?(zo(t,o,n,d,k,Y*2.2,.03,.008),zo(t,o,n,d,k,Y,-.05,-.03)):zo(t,o,n,d,k,Y,-.07,-.03)}}function wr(t,o){const n=gr[t],f=rs(n.seed),p=o/ss,S=new Float32Array(o*o),r=new Float32Array(o*o),g=new Float32Array(o*o),A=7;for(let d=0;d<o;d+=1){const k=d/o;for(let c=0;c<o;c+=1){const Y=c/o,I=d*o+c,W=Bt(Y,k,3,4,n.seed),K=Bt(Y,k,11,3,n.seed+13),J=Bt(Y,k,43,2,n.seed+29),$=ln(c,d,n.seed+71)-.5;let oe=1+(W-.5)*n.macro+(K-.5)*n.mid+(J-.5)*n.fine+$*n.speck,pe=.5+(W-.5)*.06+(K-.5)*.07+(J-.5)*.08+$*.03,he=n.gloss;if(n.ripples>0){const re=k*A+(W-.5)*.85+(K-.5)*.3,ie=Math.sin(re*It);oe+=ie*.055*n.ripples,pe+=ie*.018*n.ripples}if(t==="volcano"){const re=1-Math.abs(2*J-1);re>.94?(oe+=(re-.94)*2.2,pe-=.02,he+=.1):re<.22&&(oe-=(.22-re)*.6)}t==="ice"&&(Math.abs(K-.5)<.012&&(oe-=.24,pe-=.035),oe=.82+(oe-1)*.95+(J-.5)*.12,he=Gt(.35+J*.55)),(t==="crater"||t==="ring")&&W<.34&&(oe-=(.34-W)*1.1),t==="plain"&&(oe+=en(.55,.78,W)*.18),S[I]=oe,r[I]=pe,g[I]=he}}for(let d=0;d<n.craters;d+=1){const k=(.3+Math.pow(f(),1.7)*1.1)*p;yr(S,r,o,f()*o,f()*o,k,f)}for(let d=0;d<n.stones;d+=1){const c=(f()<.18?.14+f()*.3:.03+f()*.09)*p,Y=d%3===0?.12:-.08;zo(S,r,o,f()*o,f()*o,Math.max(.8,c),Y,.02+c*.0012,!0)}for(let d=0;d<n.cracks;d+=1){const k=f()*o,c=f()*o,Y=(.6+f()*3.4)*p;Jo(S,r,o,k,c,f()*It,Y,.8+f()*1.4,f,t==="ice")}if(t==="ice"){const d=()=>.5;for(let k=0;k<11;k+=1){const c=f()*It,Y=o*(.45+f()*.75),I=f()*o,W=f()*o;Jo(S,r,o,I-Math.cos(c)*Y*.5,W-Math.sin(c)*Y*.5,c,Y,1+f()*1.4,d,!0)}for(let k=0;k<10;k+=1){const c=f()*o,Y=f()*o,I=f()*It;Jo(S,r,o,c,Y,I,(.4+f()*1.6)*p,.8+f(),f,!0)}}const{canvas:y,ctx:b}=Bn(o,o),P=b.createImageData(o,o),w=P.data;for(let d=0;d<o*o;d+=1)w[d*4]=Math.round(So(S[d]*.5,0,1)*255),w[d*4+1]=Math.round(So(r[d],0,1)*255),w[d*4+2]=Math.round(So(g[d],0,1)*255),w[d*4+3]=255;return b.putImageData(P,0,0),y}function ze(t){const o=parseInt(t.replace("#",""),16);return[o>>16&255,o>>8&255,o&255]}function zt(t,o,n){return[t[0]+(o[0]-t[0])*n,t[1]+(o[1]-t[1])*n,t[2]+(o[2]-t[2])*n]}function Mr(t,o,n){const f=t*o,p=Math.floor(f),S=f-p,r=P=>{const w=(P%2+2)%2===0,d=ln(P,7,n);return w?.56+.4*d:.04+.3*d},g=r(p),A=r(p-1),y=r(p+1),b=.44;return S<b?A+(g-A)*en(0,1,S/b):S>1-b?g+(y-g)*en(0,1,(S-(1-b))/b):g}const na={jupiter:{bands:16,seed:3301,streaky:.8,polar:null,spots:[{u:.62,v:.66,ru:.085,rv:.05,color:ze("#a8492f"),swirl:2},{u:.24,v:.34,ru:.05,rv:.026,color:ze("#f6efdd"),swirl:0},{u:.46,v:.4,ru:.035,rv:.02,color:ze("#fbf3e1"),swirl:0},{u:.83,v:.44,ru:.03,rv:.018,color:ze("#f4ecd9"),swirl:0},{u:.36,v:.74,ru:.06,rv:.03,color:ze("#8d4b30"),swirl:0}]},saturn:{bands:20,seed:3307,streaky:.38,polar:ze("#c9d4d8"),spots:[{u:.7,v:.3,ru:.04,rv:.02,color:ze("#f7edd2"),swirl:0},{u:.3,v:.72,ru:.035,rv:.018,color:ze("#e6d3a4"),swirl:0}]},uranus:{bands:7,seed:3313,streaky:.25,polar:ze("#e6fbfd"),spots:[{u:.55,v:.36,ru:.06,rv:.03,color:ze("#dcf4f6"),swirl:0}]},neptune:{bands:9,seed:3319,streaky:.5,polar:ze("#a9c8f2"),spots:[{u:.34,v:.62,ru:.06,rv:.032,color:ze("#1f3a72"),swirl:1},{u:.72,v:.46,ru:.05,rv:.012,color:ze("#e9f3ff"),swirl:0},{u:.62,v:.36,ru:.035,rv:.009,color:ze("#f2f8ff"),swirl:0}]}};function xr(t,o,n,f=2){const p=new Uint8ClampedArray(t.length);for(let S=0;S<f;S+=1){for(let r=0;r<n;r+=1)for(let g=0;g<o;g+=1){const A=(g-1+o)%o*4,y=g*4,b=(g+1)%o*4,P=r*o*4;for(let w=0;w<3;w+=1)p[P+y+w]=(t[P+A+w]+t[P+y+w]*2+t[P+b+w])/4}for(let r=0;r<n;r+=1){const g=(r-1+n)%n*o*4,A=r*o*4,y=(r+1)%n*o*4;for(let b=0;b<o;b+=1){const P=b*4;for(let w=0;w<3;w+=1)t[A+P+w]=(p[g+P+w]+p[A+P+w]*2+p[y+P+w])/4}}}}function is(t,o,n){const f=na[t.id]??na.jupiter,p=ze(t.ground),S=ze(t.ground2),r=ze(t.ground3),{canvas:g,ctx:A}=Bn(o,n),y=A.createImageData(o,n),b=y.data,P=f.seed,w=new Float32Array(o*n),d=new Float32Array(o*n);for(let I=0;I<n;I+=1){const W=I/n;for(let K=0;K<o;K+=1){const J=K/o,$=(Bt(J,W,4,3,P)-.5)*.03+(Bt(J,W,13,2,P+7)-.5)*.005,oe=Gt(W+$);let pe=Mr(oe,f.bands,P);const he=Bt(J*3,W*9,9,3,P+31)-.5;pe+=he*.13*f.streaky;let re;if(pe<.5?re=zt(r,S,Gt(pe*2)):re=zt(S,p,Gt((pe-.5)*2)),f.polar){const Ye=en(.82,1,Math.abs(W-.5)*2);re=zt(re,f.polar,Ye*.45)}for(const Ye of f.spots){const tt=(J-Ye.u)/Ye.ru,at=(W-Ye.v)/Ye.rv,Ce=tt*tt+at*at;if(Ce<2.2){const gt=en(1.05,.25,Ce),Ae=Ye.swirl>0?.82+.18*Math.sin(Math.atan2(at,tt)*3+Ce*7):1;re=zt(re,[Ye.color[0]*Ae,Ye.color[1]*Ae,Ye.color[2]*Ae],gt*.92)}}const ie=(I*o+K)*4;b[ie]=re[0],b[ie+1]=re[1],b[ie+2]=re[2],b[ie+3]=255,w[I*o+K]=Gt(.5+he*.85+(pe-.5)*.5),d[I*o+K]=.5+he*.85}}const k=t.sunAz*Math.PI/180,c=Math.sin(k),Y=-Math.cos(k);for(let I=0;I<n;I+=1){const W=(I+1)%n,K=(I-1+n)%n;for(let J=0;J<o;J+=1){const $=(J+1)%o,oe=(J-1+o)%o,pe=d[I*o+$]-d[I*o+oe],he=d[W*o+J]-d[K*o+J],re=So(1+(pe*c+he*Y)*1.8,.9,1.1),ie=(I*o+J)*4;b[ie]=Math.min(255,b[ie]*re),b[ie+1]=Math.min(255,b[ie+1]*re),b[ie+2]=Math.min(255,b[ie+2]*re),b[ie+3]=Math.round(Gt(.74+w[I*o+J]*.4)*255)}}return xr(b,o,n,2),A.putImageData(y,0,0),g}function br(t,o){if(na[t.id])return is(t,o,o);const{canvas:n,ctx:f}=Bn(o,o),p=f.createImageData(o,o),S=p.data,r=ze(t.ground),g=ze(t.ground2),A=ze(t.ground3);for(let y=0;y<o;y+=1){const b=y/o;for(let P=0;P<o;P+=1){const w=P/o,d=Bt(w,b,4,4,9021),k=Bt(w,b,16,3,9027),c=Gt(d*.72+k*.4);let Y=zt(g,r,en(.25,.72,c));Y=zt(Y,A,en(.66,.95,c)*.8);const I=(y*o+P)*4;S[I]=Y[0],S[I+1]=Y[1],S[I+2]=Y[2],S[I+3]=255}}return f.putImageData(p,0,0),n}function Sr(t,o,n){const{canvas:f,ctx:p}=Bn(o,n),S=rs(t==="moon"?51:t==="pluto"?67:83),r=t==="pluto"?"#cbb6a4":t==="charon"?"#9d9a95":"#9a9691";if(p.fillStyle=r,p.fillRect(0,0,o,n),t==="pluto")p.fillStyle="#f3ece1",p.beginPath(),p.ellipse(o*.56,n*.46,o*.13,n*.16,-.2,0,It),p.fill(),p.beginPath(),p.ellipse(o*.72,n*.4,o*.07,n*.12,.35,0,It),p.fill(),p.fillStyle="rgba(96,68,54,0.62)",p.beginPath(),p.ellipse(o*.24,n*.6,o*.2,n*.13,.1,0,It),p.fill(),p.beginPath(),p.ellipse(o*.2,n*.32,o*.14,n*.1,-.2,0,It),p.fill();else if(t==="moon")for(let g=0;g<9;g+=1)p.fillStyle=`rgba(58,56,54,${.5+S()*.3})`,p.beginPath(),p.ellipse(S()*o,(.18+S()*.6)*n,(.04+S()*.07)*o,(.03+S()*.06)*n,S()*3,0,It),p.fill();else p.fillStyle="rgba(120,84,70,0.6)",p.beginPath(),p.ellipse(o*.5,n*.06,o*.4,n*.09,0,0,It),p.fill();for(let g=0;g<220;g+=1){const A=(2+Math.pow(S(),2.4)*26)*(o/1024),y=S()*o,b=S()*n,P=p.createRadialGradient(y,b,0,y,b,A);P.addColorStop(0,"rgba(38,36,34,0.5)"),P.addColorStop(.72,"rgba(70,66,62,0.28)"),P.addColorStop(.9,"rgba(238,233,224,0.32)"),P.addColorStop(1,"rgba(255,255,255,0)"),p.fillStyle=P,p.beginPath(),p.arc(y,b,A,0,It),p.fill()}for(let g=0;g<2600;g+=1){const A=(.6+Math.pow(S(),3)*4)*(o/1024);p.fillStyle=S()<.5?"rgba(255,255,255,0.16)":"rgba(30,28,26,0.16)",p.beginPath(),p.arc(S()*o,S()*n,A,0,It),p.fill()}return f}function zr(t,o){const{canvas:n,ctx:f}=Bn(t,o),p=f.createImageData(t,o),S=p.data,r=ze("#0f3f74"),g=ze("#2f8fb0"),A=ze("#3f7a45"),y=ze("#9a8a55"),b=ze("#f2f7fc");for(let P=0;P<o;P+=1){const w=P/o;for(let d=0;d<t;d+=1){const k=d/t,c=k*3.1,Y=w*2.4,I=Bt(c,Y,4,5,4404)+(Bt(c*3,Y*3,12,3,4411)-.5)*.18,W=I>.55;let K;if(W){const he=Gt((I-.55)*4.2);K=zt(A,y,he*.7),he>.55&&(K=zt(K,ze("#cfc9bb"),(he-.55)*1.6))}else K=zt(r,g,Gt((I-.35)*3.2));const J=en(.86,.98,Math.abs(w-.5)*2);J>0&&(K=zt(K,b,J));const $=Bt(k*2,w*6,12,4,4423),oe=en(.56,.82,$)*.72;oe>0&&(K=zt(K,ze("#fbfdff"),oe));const pe=(P*t+d)*4;S[pe]=K[0],S[pe+1]=K[1],S[pe+2]=K[2],S[pe+3]=255}}return f.putImageData(p,0,0),n}function Pr(t,o,n,f){if(t==="earth")return zr(n,f);if(t==="moon"||t==="pluto"||t==="charon")return Sr(t,n,f);const p=t==="saturn"?{...o,id:"saturn",ground:"#f2e2ba",ground2:"#c6a978",ground3:"#9b7f52"}:{...o,id:"jupiter",ground:"#e9d6b4",ground2:"#b57d50",ground3:"#8b5a38"};return is(p,n,f)}function kr(t){const{canvas:n,ctx:f}=Bn(t,4),p=f.createImageData(t,4),S=p.data,r=1.11,g=2.36,A=ze("#f6efdd"),y=ze("#c9b48d"),b=ze("#6f6455"),P=[[1.11,1.235,.1,.15],[1.235,1.525,.42,.3],[1.525,1.95,.98,.62],[1.951,2.025,.06,.1],[2.025,2.21,.72,.5],[2.211,2.215,.04,.1],[2.215,2.27,.66,.46],[2.27,2.31,.06,.1],[2.315,2.34,.34,.55]];for(let w=0;w<t;w+=1){const d=w/(t-1),k=r+(g-r)*d;let c=0,Y=.5;for(const[$,oe,pe,he]of P)if(k>=$&&k<=oe){c=pe,Y=he,c*=.82+.18*Math.sin((k-$)*820+Math.sin((k-$)*140)*2);break}const I=[1.29,1.44,1.63,1.72,1.88,2.06,2.15,2.24,2.29];for(const $ of I)Math.abs(k-$)<.0035&&(c*=.12);c*=.9+.14*ln(Math.floor(k*900),3,9931);const W=ln(Math.floor(w/2),7,9931);let K=zt(y,A,Y);K=zt(K,b,(1-Math.min(1,c))*.35);const J=.82+W*.3;for(let $=0;$<4;$+=1){const oe=($*t+w)*4;S[oe]=K[0]*J,S[oe+1]=K[1]*J,S[oe+2]=K[2]*J,S[oe+3]=Math.round(Gt(c)*255)}}return f.putImageData(p,0,0),n}const Qt=new Map;function Ao(t,o,n,f,p,S){const r=new oo(o);for(r.colorSpace=n?Gn:os,r.wrapS=f?Ds:Es,r.wrapT=r.wrapS,r.anisotropy=p,r.magFilter=Rs,r.minFilter=Is,r.generateMipmaps=!0,r.needsUpdate=!0,Qt.set(t,r);Qt.size>S;){const g=Qt.keys().next();if(g.done)break;const A=Qt.get(g.value);Qt.delete(g.value),A?.dispose()}return r}function Cr(t,o,n){const f=`ground:${t}:${o?"l":"h"}`,p=Qt.get(f);return p||Ao(f,wr(t,o?320:512),!1,!0,n,6)}function Ar(t,o,n){const f=`cloud:${t.id}:${o?"l":"h"}`,p=Qt.get(f);return p||Ao(f,br(t,o?512:1024),!0,!0,n,4)}function Za(t,o,n,f){const S=`body:${t??o.id}:${n?"l":"h"}`,r=Qt.get(S);if(r)return r;const g=n?768:1024;return Ao(S,Pr(t,o,g,g/2),!0,!1,f,3)}function Qo(t,o){const n=`ring:${t?"l":"h"}`,f=Qt.get(n);return f||Ao(n,kr(t?1024:2048),!0,!1,o,2)}const Ln=Math.PI/180,Wn=1500,wo=2800,Ka=-4.3;function Mo(t,o){const n=Math.sin(t*127.1+o*311.7)*43758.5453;return n-Math.floor(n)}function oa(t){return t*t*(3-2*t)}function Tr(t,o){const n=Math.floor(t),f=Math.floor(o),p=t-n,S=o-f,r=Mo(n,f),g=Mo(n+1,f),A=Mo(n,f+1),y=Mo(n+1,f+1),b=oa(p),P=oa(S);return(r*(1-b)+g*b)*(1-P)+(A*(1-b)+y*b)*P}function xo(t,o,n=4){let f=0,p=.5,S=1;for(let r=0;r<n;r+=1)f+=p*Tr(t*S,o*S),S*=2.03,p*=.5;return f}function _n(t){let o=t>>>0||1;return()=>(o=o*1664525+1013904223>>>0,o/4294967296)}function Dr(t){let o=2166136261;for(let n=0;n<t.length;n+=1)o=Math.imul(o^t.charCodeAt(n),16777619);return o>>>0}function ea(t,o){const n=t*Ln,f=o*Ln;return new F(Math.sin(n)*Math.cos(f),Math.sin(f),-Math.cos(n)*Math.cos(f)).normalize()}function Er(){const o=document.createElement("canvas");o.width=128,o.height=128;const n=o.getContext("2d"),f=n.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);f.addColorStop(0,"rgba(255,255,255,1)"),f.addColorStop(.25,"rgba(255,236,196,0.72)"),f.addColorStop(.6,"rgba(255,190,110,0.18)"),f.addColorStop(1,"rgba(255,170,80,0)"),n.fillStyle=f,n.fillRect(0,0,128,128);const p=new oo(o);return p.colorSpace=Gn,p}const Rr=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ir=`
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
`,Nr=`
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Fr=`
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
`,Wr=8,_r=.55,qa=.34;function Ur(t,o={}){const n=!!o.low,f=o.anisotropy??(n?4:8),p=new Re,S=[],r=u=>(S.push(u),u);let g=null;const A=Dr(t.id),y=_n(A),b=r(Er()),P=[],w=[];let d=null,k=null,c=null;const Y=[],I=[];if(t.terrain==="crater"){for(let u=0;u<(n?16:26);u+=1){const i=y()*Math.PI*2,z=20+Math.sqrt(y())*460,v=16+y()*74;Y.push({x:Math.cos(i)*z,z:Math.sin(i)*z,r:v,d:v*(.16+y()*.2)})}for(let u=0;u<(n?26:48);u+=1){const i=y()*Math.PI*2,z=4+Math.pow(y(),.7)*150,v=2.5+Math.pow(y(),1.6)*11;Y.push({x:Math.cos(i)*z,z:Math.sin(i)*z,r:v,d:v*(.2+y()*.22)})}}if(t.terrain==="volcano")for(let u=0;u<6;u+=1){const i=y()*Math.PI*2,z=60+y()*380;I.push({x:Math.cos(i)*z,z:Math.sin(i)*z,r:40+y()*90,h:12+y()*34})}if(t.terrain==="rock")for(let u=0;u<5;u+=1){const i=y()*Math.PI*2,z=60+y()*400;I.push({x:Math.cos(i)*z,z:Math.sin(i)*z,r:50+y()*110,h:6+y()*16})}function W(u,i,z,v=4){return(xo(u*z,i*z,v)-.48)*2}function K(u,i){if(t.terrain==="plasma"||t.terrain==="ring")return 0;const z=Math.hypot(u,i);let v=0;if(t.terrain==="crater"){v=W(u+11,i+7,.004,4)*16+W(u+3,i+17,.0012,2)*34+W(u+5,i+23,.026,3)*3;for(const te of Y){const B=Math.hypot(u-te.x,i-te.z)/te.r;B<1&&(v-=te.d*Math.pow(1-B*B,1.5)),B<1.3&&(v+=te.d*.28*Math.exp(-Math.pow((B-1.02)/.17,2)))}}else if(t.terrain==="rock"){v=W(u+5,i+2,.0035,4)*40,v+=(1-Math.abs(W(u,i,.011,3)))*12,v+=W(u+21,i+13,.0011,2)*60,v+=W(u+31,i+41,.028,3)*3.4;for(const te of I){const B=Math.hypot(u-te.x,i-te.z)/te.r;B<1&&(v+=te.h*Math.pow(1-B,1.7))}}else if(t.terrain==="volcano"){v=W(u+3,i+8,.005,4)*14+W(u+9,i+1,.0012,2)*22;for(const te of I){const B=Math.hypot(u-te.x,i-te.z)/te.r;B<1&&(v+=te.h*Math.pow(1-B,1.25)),B<.24&&(v-=te.h*.5*(1-B/.24))}}else t.terrain==="ice"?v=W(u+9,i+4,.003,4)*9+W(u,i,.012,2)*2.2+W(u+2,i+8,.035,3)*1.1:v=W(u+7,i+3,.0035,4)*12+W(u,i,.012,2)*2.6+W(u+4,i+2,.03,3)*3;const m=Math.max(0,z-1500)/500;v-=m*m*5;let X=0,D=0;for(const te of P){const B=Math.hypot(u-te.x,i-te.z)/te.r;B<1&&(X=Math.max(X,te.d*Math.pow(1-B*B,1.55))),B<1.45&&(D=Math.max(D,te.d*.3*Math.exp(-Math.pow((B-1.02)/.16,2))))}return v-=X,v+=D,v+=(xo(u*.09+1,i*.09+6,2)-.5)*(t.terrain==="rock"?1.2:t.terrain==="ice"?.25:.5),v}let J=K(0,0);function $(u,i){return K(u,i)-J}const oe=(()=>{if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring")return{x:0,z:0};const u=[];for(let z=0;z<40;z+=1){const v=z/40*Math.PI*2,m=z%5*34,X=Math.cos(v)*m,D=Math.sin(v)*m;let te=0;for(let B=0;B<8;B+=1){const Pe=B/8*Math.PI*2;te+=$(X+Math.cos(Pe)*120,D+Math.sin(Pe)*120)}u.push({x:X,z:D,score:$(X,D)-te/8})}u.sort((z,v)=>v.score-z.score);const i=u[Math.floor(u.length*.28)];return{x:i.x,z:i.z}})();J=K(oe.x,oe.z);const pe=t.cloudTop!==null?t.cloudTop:$(oe.x,oe.z),he=1.7,re=ea(t.sunAz,t.sunElev),ie=t.sunScale>0?.2667*t.sunScale*Ln:0,Ye=Math.max(0,Math.min(1,t.fogDensity*26)),tt=new V(t.skyTop),at=new V(t.skyBottom),Ce=new V(t.glow),gt=r(new Ge({vertexShader:Rr,fragmentShader:Ir,side:Un,depthWrite:!1,uniforms:{uTop:{value:tt.clone()},uBottom:{value:at.clone()},uGlow:{value:Ce.clone()},uSun:{value:new V(t.sunColor)},uSunDir:{value:re.clone()},uSunRadius:{value:ie},uSunHaze:{value:Ye},uGlowGain:{value:t.glowGain}}})),Ae=new _(r(new ye(wo,32,20)),gt);Ae.frustumCulled=!1,p.add(Ae);let Ie=null;if(t.stars){const u=n?320:620,i=new Float32Array(u*3),z=_n(A^2654435769);for(let D=0;D<u;D+=1){const te=z()*Math.PI*2,B=Math.pow(z(),.65)*.98+.02,Pe=Math.sqrt(1-B*B);i[D*3]=Math.cos(te)*Pe*(wo-200),i[D*3+1]=B*(wo-200),i[D*3+2]=Math.sin(te)*Pe*(wo-200)}const v=r(new Lt);v.setAttribute("position",new bn(i,3));const m=r(new ko({color:"#ffffff",size:1.7,sizeAttenuation:!1,transparent:!0,opacity:.85,depthWrite:!1}));Ie=m;const X=new Po(v,m);X.frustumCulled=!1,p.add(X)}const $e=Math.min(1.5,.45+.9*Math.min(1,Math.max(t.sunScale,.02)*1.5)),Nt=t.stars?.4:.46,Zt=(u,i)=>{const v=-($(u+.9,i)-$(u-.9,i))/1.8,m=-($(u,i+.9)-$(u,i-.9))/(2*.9),X=1/Math.sqrt(v*v+1+m*m),D=Math.max(0,(v*re.x+re.y+m*re.z)*X);return Nt+$e*D};let Pt=[],Ft=null;if(t.terrain==="plasma"){const u=r(new Ge({vertexShader:Nr,fragmentShader:Fr,uniforms:{uTime:{value:0},uA:{value:new V(t.ground)},uB:{value:new V(t.ground2)},uC:{value:new V(t.ground3)}}}));Ft=u;const i=new _(r(new qn(2400,2400,1,1)),u);i.rotation.x=-Math.PI/2,i.position.y=0,p.add(i)}else if(t.terrain!=="ring")if(t.cloudTop!==null){const u=Ar(t,n,f),i=Math.min(1.12,.55+.5*Math.min(1,Math.max(t.sunScale,.02)*2)),z=(D,te)=>r(new Ge({vertexShader:dr,fragmentShader:hr,uniforms:{uMap:{value:u},uOffset:{value:new eo(0,0)},uTile:{value:D},uDetail:{value:11},uTint:{value:new V().setScalar(te)},uOpacity:{value:1},uFogColor:{value:new V(t.fog)},uFogDensity:{value:t.fogDensity}}})),v=new _(r(new qn(5200,5200,1,1)),z(Ha,i));v.rotation.x=-Math.PI/2,v.position.y=t.cloudTop,p.add(v),Pt=[v.material];const m=z(Ha*.42,i*.86);m.uniforms.uOpacity.value=.55,m.transparent=!0,m.depthWrite=!1;const X=new _(r(new qn(5200,5200,1,1)),m);X.rotation.x=-Math.PI/2,X.position.y=t.cloudTop-90,p.add(X),Pt.push(m)}else{const u=n?96:150,i=r(new qn(Wn*2,Wn*2,u,u));i.rotateX(-Math.PI/2);const z=i.attributes.position,v=new Float32Array(z.count*3),m=new V(t.ground),X=new V(t.ground2),D=new V(t.ground3),te=new bn(v,3),B=new V,Pe=fe=>{const Te=z.getX(fe),_e=z.getZ(fe),He=$(Te,_e);z.setY(fe,He);const Ne=xo(Te*.02+3,_e*.02+9,3);B.copy(m).lerp(X,oa(Math.min(1,Math.max(0,(Ne-.28)/.5)))),He<-1.6&&B.lerp(D,Math.min(1,(-He-1.6)/7));const de=xo(Te*.0045+17,_e*.0045+41,3),Ue=Math.min(1.9,Zt(Te,_e))*(.9+(Ne-.5)*.22)*(.84+de*.34);let Xe=1;for(const Ze of P){const xt=Math.hypot(Te-Ze.x,_e-Ze.z)/Ze.r;if(xt>1.5)continue;const it=Math.min(1,Math.max(0,1-xt/1.35));Xe*=1-.62*it*it}v[fe*3]=B.r*Ue*Xe,v[fe*3+1]=B.g*Ue*Xe*.94,v[fe*3+2]=B.b*Ue*Xe*.9};for(let fe=0;fe<z.count;fe+=1){const Te=z.getX(fe)/Wn,_e=z.getZ(fe)/Wn,He=Math.sign(Te)*Math.pow(Math.abs(Te),1.8)*Wn,Ne=Math.sign(_e)*Math.pow(Math.abs(_e),1.8)*Wn;z.setXYZ(fe,He,0,Ne),Pe(fe)}i.setAttribute("color",te),i.computeVertexNormals();const ot=Cr(t.terrain,n,f),ut=1/(ot.image.width||512),je=r(new Ge({vertexShader:pr,fragmentShader:mr,vertexColors:!0,uniforms:{uMap:{value:ot},uTexel:{value:ut},uTile:{value:ss},uDetail:{value:5.6},uBump:{value:9},uGloss:{value:t.terrain==="ice"?.9:.25},uSunDir:{value:re.clone()},uSunColor:{value:new V(t.sunColor)},uFogColor:{value:new V(t.fog)},uFogDensity:{value:t.fogDensity},uAmbient:{value:Nt},uSunPower:{value:$e}}})),on=new _(i,je);p.add(on);const ce=_n(A^2135587861),dn=[t.ground2,t.ground3,t.ground].map(fe=>new V(fe).multiplyScalar(Nt+$e*.75)),Vt=new Jn,Kt=fe=>{Vt.position.set(fe.x,fe.y,fe.z),Vt.rotation.set(fe.rx,fe.ry,fe.rz),Vt.scale.set(fe.sx,fe.sy,fe.sz),Vt.updateMatrix(),fe.mesh.setMatrixAt(fe.index,Vt.matrix)},Ct=(fe,Te,_e,He,Ne,de,Ue)=>{const Xe=new Co(fe,r(new le({color:16777215})),Te);Xe.instanceMatrix.setUsage(ta);for(let Ze=0;Ze<Te;Ze+=1){const xt=ce()*Math.PI*2,it=_e+Math.sqrt(ce())*(He-_e),jt=oe.x+Math.cos(xt)*it,Xt=oe.z+Math.sin(xt)*it,At=Ne+Math.pow(ce(),2.1)*(de-Ne),Qe=$(jt,Xt),Yt=At*(.45+ce()*.5),hn={mesh:Xe,index:Ze,x:jt,z:Xt,y:Qe+At*Ue,base:Qe,relief:0,liftY:At*Ue,sx:At*(.8+ce()*.7),sy:Yt,sz:At*(.8+ce()*.7),rx:ce()*3,ry:ce()*3,rz:ce()*3,fly:!1,vx:0,vy:0,vz:0,spin:new F};hn.relief=hn.y+Yt*.72-Qe,w.push(hn),Kt(hn),Xe.setColorAt(Ze,dn[Ze%3])}Xe.instanceMatrix.needsUpdate=!0,Xe.instanceColor&&(Xe.instanceColor.needsUpdate=!0),p.add(Xe)};if(Ct(r(new Jt(1,0)),n?90:170,1.2,60,.02,.22,.35),Ct(r(new Jt(1,1)),n?30:54,2,120,.18,1.1,.34),Ct(r(new Jt(1,1)),n?10:18,6,190,.6,2.4,.4),k=(fe,Te,_e)=>{const He=_e*2.4;for(let Ne=0;Ne<z.count;Ne+=1){const de=z.getX(Ne)-fe,Ue=z.getZ(Ne)-Te;de*de+Ue*Ue>He*He||Pe(Ne)}z.needsUpdate=!0,te.needsUpdate=!0,i.computeVertexNormals()},d=()=>{for(let fe=0;fe<z.count;fe+=1)Pe(fe);z.needsUpdate=!0,te.needsUpdate=!0,i.computeVertexNormals()},c=(fe,Te,_e)=>{const He=_e*1.2,Ne=_e*2.3;for(const de of w){const Ue=de.x-fe,Xe=de.z-Te,Ze=Math.hypot(Ue,Xe);if(!(Ze>Ne)){if(de.base=$(de.x,de.z),de.y=de.base+de.liftY,de.relief=de.y+de.sy*.72-de.base,Ze<He&&de.sy>.16){const xt=Ze>.001?Ze:1,it=12+Math.random()*26;de.fly=!0,de.vx=Ue/xt*it,de.vz=Xe/xt*it,de.vy=9+Math.random()*20,de.spin.set((Math.random()-.5)*9,(Math.random()-.5)*9,(Math.random()-.5)*9)}Kt(de),de.mesh.instanceMatrix.needsUpdate=!0}}},t.terrain==="ice"){const fe=[],Te=_n(A^1542469173),_e=(Ne,de,Ue,Xe,Ze,xt)=>{let it=Ne,jt=de,Xt=Ue;for(let At=0;At<Xe;At+=1){const Qe=it+Math.cos(Xt)*Ze,Yt=jt+Math.sin(Xt)*Ze;fe.push(it,$(it,jt)+.06,jt,Qe,$(Qe,Yt)+.06,Yt),it=Qe,jt=Yt,Xt+=(Te()-.5)*.9,xt>0&&At===Xe>>1&&Te()<.7&&_e(it,jt,Xt+(Te()<.5?.9:-.9),Math.max(3,Xe>>2),Ze*.8,xt-1)}};for(let Ne=0;Ne<(n?6:10);Ne+=1)_e((Te()-.5)*300,(Te()-.5)*300,Te()*Math.PI*2,14,14,1);const He=r(new Lt);He.setAttribute("position",new bn(new Float32Array(fe),3)),p.add(new as(He,r(new Qn({color:t.ground3,transparent:!0,opacity:.75}))))}}if(t.terrain==="ring"){const u=new Re;u.position.copy(ea(t.companionAz,0)).multiplyScalar(2600);const i=Ka;u.position.y=i;const z=480,v=z*1.11,m=z*2.36,X=new _(r(new ye(z,n?64:128,n?44:80)),r(new Ge({vertexShader:Ya,fragmentShader:$a,uniforms:{uMap:{value:Za("saturn",t,n,f)},uLimb:{value:.4},uRim:{value:new V("#e8dcbc")}}})));u.add(X);const D=r(new Ge({vertexShader:Fn,fragmentShader:qo,transparent:!0,side:Je,depthWrite:!1,uniforms:{uProfile:{value:Qo(n,f)},uInner:{value:v},uOuter:{value:m},uAlpha:{value:n?.78:.88}}})),te=new _(r(new ct(v,m,n?128:220,1)),D);te.rotation.x=-Math.PI/2,te.position.y=i,u.add(te),p.add(u);const B=n?220:420,Pe=r(new Jt(1,0)),ot=r(new le({color:"#dfe8f2"})),ut=new Co(Pe,ot,B);ut.instanceMatrix.setUsage(ta);const je=_n(A^1374496523),on=[],ce=new Jn;for(let Ct=0;Ct<B;Ct+=1){const Te=Ct%31===0?.5+je()*1.3:.05+Math.pow(je(),2)*.55,_e=14+Math.pow(je(),.7)*150,He=je()*Math.PI*2,Ne=(je()-.5)*14;on.push({r:_e,a:He,y:Ne,spin:.02+je()*.08,size:Te,wob:je()*Math.PI*2}),ce.position.set(Math.cos(He)*_e,Ne,Math.sin(He)*_e),ce.rotation.set(je()*3,je()*3,je()*3),ce.scale.setScalar(Te),ce.updateMatrix(),ut.setMatrixAt(Ct,ce.matrix);const de=.5+je()*.45;ut.setColorAt(Ct,new V(de,de*.98,de*1.05))}ut.instanceMatrix.needsUpdate=!0,ut.instanceColor&&(ut.instanceColor.needsUpdate=!0),p.add(ut),g={mesh:ut,data:on};const dn=r(new Ge({vertexShader:Fn,fragmentShader:yo,transparent:!0,side:Je,depthWrite:!1,uniforms:{uInner:{value:.6},uOuter:{value:2600-m-10},uBands:{value:260},uA:{value:new V("#e2eaf4")},uB:{value:new V("#c3cfdd")},uAlpha:{value:.92},uGrain:{value:.26}}})),Vt=2600-m-10,Kt=new _(r(new ct(.6,Vt,128,1)),dn);Kt.rotation.x=-Math.PI/2,Kt.position.y=i,p.add(Kt)}if(t.ring){const u=t.ring==="uranus",i=u?210:170,z=u?520:560,v=u?82*Ln:27*Ln,m=u?140:54,X=r(u?new Ge({vertexShader:Fn,fragmentShader:yo,transparent:!0,side:Je,depthWrite:!1,uniforms:{uInner:{value:i},uOuter:{value:z},uBands:{value:m},uA:{value:new V("#9fd0d6")},uB:{value:new V("#cdeef2")},uAlpha:{value:.5},uGrain:{value:.4}}}):new Ge({vertexShader:Fn,fragmentShader:qo,transparent:!0,side:Je,depthWrite:!1,uniforms:{uProfile:{value:Qo(n,f)},uInner:{value:i},uOuter:{value:z},uAlpha:{value:.82}}})),D=new _(r(new ct(i,z,n?64:128,1)),X);if(D.rotation.x=-Math.PI/2+v,D.position.y=u?30:90,p.add(D),u){const te=r(new Ge({vertexShader:Fn,fragmentShader:yo,transparent:!0,side:Je,depthWrite:!1,uniforms:{uInner:{value:130},uOuter:{value:175},uBands:{value:18},uA:{value:new V("#dff6f8")},uB:{value:new V("#bfe6ea")},uAlpha:{value:.35},uGrain:{value:.3}}})),B=new _(r(new ct(130,175,64,1)),te);B.rotation.x=-Math.PI/2+v,B.position.y=30,p.add(B)}}if(t.companion&&t.terrain!=="ring"){const i=Math.max(6,Math.tan(t.companionSize/2*Ln)*1500),z=new Re;z.position.copy(ea(t.companionAz,t.companionElev)).multiplyScalar(1500);const v=Za(t.companion,t,n,f),m=new _(r(new ye(i,n?48:72,n?32:48)),r(new Ge({vertexShader:Ya,fragmentShader:$a,uniforms:{uMap:{value:v},uLimb:{value:.42},uRim:{value:new V(t.companion==="earth"?"#9fd0ff":"#cfe0f2")}}})));if(m.lookAt(0,0,0),z.add(m),t.companion==="saturn"||t.companion==="jupiter"){const D=t.companion==="saturn",te=r(new Ge({vertexShader:Fn,fragmentShader:D?qo:yo,transparent:!0,side:Je,depthWrite:!1,uniforms:D?{uProfile:{value:Qo(n,f)},uInner:{value:i*1.12},uOuter:{value:i*2.36},uAlpha:{value:.7}}:{uInner:{value:i*1.3},uOuter:{value:i*1.7},uBands:{value:16},uA:{value:new V("#d9c7a8")},uB:{value:new V("#b09070")},uAlpha:{value:.18},uGrain:{value:.3}}})),B=new _(r(new ct(i*(D?1.12:1.3),i*(D?2.36:1.7),64,1)),te);B.rotation.x=-Math.PI/2+.32,z.add(B)}const X=new to(r(new no({map:b,color:new V(t.companion==="earth"?"#9fd0ff":"#cfe4ff"),transparent:!0,opacity:.3,depthWrite:!1,blending:ke})));X.scale.setScalar(i*4),z.add(X),p.add(z)}const un=t.terrain!=="ring",Me=(u,i)=>t.terrain==="ring"?Ka:t.cloudTop!==null?t.cloudTop:$(u,i),nt=er({sunDir:re,ambient:Math.min(1.05,Nt+.24),sunPower:$e});p.add(nt.group),nt.setVisible(!1);const vt=fr({floorAt:Me,heightAt:$,onImpact:o.onImpact,onScar:(u,i)=>nn(u,i)});p.add(vt.group);const ae=n?140:t.particles==="haze"?120:300;let ee=null,Mt=null;if(t.particles!=="none"){const u=new Float32Array(ae*3);Mt=new Float32Array(ae*3);const i=_n(A^625341585);for(let X=0;X<ae;X+=1){const D=i()*Math.PI*2,te=Math.sqrt(i())*55,B=t.particles;let Pe=i()*22;B==="spark"&&(Pe=i()*14),B==="haze"&&(Pe=2+i()*26),u[X*3]=Math.cos(D)*te,u[X*3+1]=Pe,u[X*3+2]=Math.sin(D)*te;const ot=B==="wind"?42+i()*34:B==="rain"?12+i()*6:B==="spark"?2+i()*4:1.2+i()*2.6;Mt[X*3]=B==="wind"?ot:(i()-.5)*ot*.5,Mt[X*3+1]=B==="rain"?-ot:B==="spark"?ot:B==="snow"?-.6-i()*.9:(i()-.5)*.4,Mt[X*3+2]=B==="wind"?ot*.25:(i()-.5)*ot*.4}ee=r(new Lt),ee.setAttribute("position",new bn(u,3));const z=t.particles==="haze"?2.6:t.particles==="dust"?.14:t.particles==="rain"?.09:t.particles==="snow"?.11:.16,v=r(new ko({color:new V(t.particleColor),size:z,transparent:!0,opacity:t.particles==="haze"?.1:.7,depthWrite:!1,sizeAttenuation:!0,blending:t.particles==="spark"?ke:void 0})),m=new Po(ee,v);m.frustumCulled=!1,p.add(m)}const Ot=r(new Jt(.26,0)),fn=r(new ye(.24,16,12)),H=t.cloudTop===null&&t.terrain!=="plasma",R=[],T=[],Z=[];function ue(u,i,z,v){const m=new to(r(new no({map:b,color:new V(i),transparent:!0,opacity:.9,depthWrite:!1,blending:ke})));m.position.copy(u),m.scale.setScalar(z),p.add(m),T.push({sprite:m,life:v,max:v,grow:z*2.4})}function G(u,i){const z=new _(r(new ct(.28,.5,24,1)),r(new le({color:new V(i),transparent:!0,opacity:.6,depthWrite:!1,side:Je})));z.rotation.x=-Math.PI/2,z.position.copy(u),p.add(z),Z.push({mesh:z,life:.7})}function N(u,i){const z=oe.x+u,v=oe.z+i,m=t.cloudTop!==null?t.cloudTop:$(z,v),X=H?new le({color:new V("#c9c2b4").multiplyScalar(Nt+$e*.8),transparent:!0}):new le({color:new V("#ffb45e"),transparent:!0}),D=new _(H?Ot:fn,X);D.position.set(z,m+4.2,v),D.scale.setScalar(.9+Math.random()*.35),p.add(D);const te=t.gravityMps2<=.01;if(R.push({mesh:D,x:z,z:v,y:te?m+.6:m+4.2,vy:te?.12:0,vx:te?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,vz:te?(Math.random()-.5)*.5:(Math.random()-.5)*1.2,fall:0,landed:!1,bounces:0,outcome:null,fade:1,resting:-1}),R.length>6){const B=R.shift();B&&(p.remove(B.mesh),B.mesh.material.dispose())}}function se(u,i){const z=new F(u.x,i+.2,u.z);if(t.gravityMps2<=.01){u.outcome="float",u.landed=!0,u.resting=5.5,o.onLand?.({seconds:u.fall,bounces:0,outcome:"float"});return}if(t.terrain==="plasma"){u.outcome="vapor",u.landed=!0,u.resting=.25,ue(z,"#fff2c0",1.2,.6),o.onLand?.({seconds:u.fall,bounces:0,outcome:"vapor"});return}if(t.cloudTop!==null){u.outcome="sink",u.landed=!0,u.resting=1.6,ue(z,"#ffffff",1.6,.7),o.onLand?.({seconds:u.fall,bounces:0,outcome:"sink"});return}if(u.bounces+=1,G(z,t.ground2),u.bounces===1&&o.onLand?.({seconds:u.fall,bounces:1,outcome:"bounce"}),u.bounces>=4||Math.abs(u.vy)<1.3){u.landed=!0,u.outcome="bounce",u.resting=1.6,u.vy=0;return}u.vy=Math.abs(u.vy)*.42,u.y=i+.26,u.vx*=.6,u.vz*=.6}const st=new Jn,lt=new V("#31090d"),tn=new V("#180509"),pn=new V("#ff3a10");function ao(u,i){vt.update(u,i);const z=vt.doom();gt.uniforms.uTop.value&&(gt.uniforms.uTop.value.copy(tt).lerp(lt,z),gt.uniforms.uBottom.value.copy(at).lerp(tn,z),gt.uniforms.uGlow.value.copy(Ce).lerp(pn,z)),Ie&&(Ie.opacity=.85*(1-z*.85)),Ft&&(Ft.uniforms.uTime.value=u);for(let v=0;v<Pt.length;v+=1){const m=Pt[v].uniforms.uOffset.value;m.x=(m.x+i*(v===0?.006:.012))%1}if(g){const{mesh:v,data:m}=g;for(let X=0;X<m.length;X+=1){const D=m[X];D.a+=D.spin*i*.05,st.position.set(Math.cos(D.a)*D.r,D.y+Math.sin(u*.25+D.wob)*.5,Math.sin(D.a)*D.r),st.rotation.set(u*.08+D.wob,u*.11+D.a,D.wob),st.scale.setScalar(D.size),st.updateMatrix(),v.setMatrixAt(X,st.matrix)}v.instanceMatrix.needsUpdate=!0}if(ee&&Mt){const v=ee.attributes.position,m=v.array;for(let X=0;X<v.count;X+=1){const D=X*3;m[D]+=Mt[D]*i,m[D+1]+=Mt[D+1]*i,m[D+2]+=Mt[D+2]*i,t.particles==="rain"||t.particles==="snow"?m[D+1]<0&&(m[D+1]=22):t.particles==="spark"?m[D+1]>20&&(m[D+1]=0):(m[D+1]<0&&(m[D+1]=24),m[D+1]>26&&(m[D+1]=0)),m[D]>60&&(m[D]=-60),m[D]<-60&&(m[D]=60),m[D+2]>60&&(m[D+2]=-60),m[D+2]<-60&&(m[D+2]=60)}v.needsUpdate=!0}for(let v=R.length-1;v>=0;v-=1){const m=R[v],X=t.cloudTop!==null?t.cloudTop:$(m.x,m.z);if(m.landed)m.resting>0?(m.resting-=i,m.outcome==="sink"?(m.y-=i*2.4,m.mesh.scale.multiplyScalar(1-i*.8)):m.outcome==="vapor"?m.mesh.scale.multiplyScalar(1-i*3):m.mesh.scale.multiplyScalar(1-i*.25)):(m.fade-=i*1.4,m.mesh.material.opacity=Math.max(0,m.fade),m.mesh.scale.multiplyScalar(1-i*.9),m.fade<=0&&(p.remove(m.mesh),m.mesh.material.dispose(),R.splice(v,1)));else{if(m.fall+=i,t.gravityMps2<=.01){m.x+=m.vx*i,m.z+=m.vz*i,m.y+=m.vy*i,m.mesh.rotation.x+=i*.6,m.mesh.rotation.y+=i*.45,m.mesh.position.set(m.x,m.y,m.z),m.fall>.05&&se(m,m.y);continue}m.vy-=t.gravityMps2*i,m.y+=m.vy*i,m.x+=m.vx*i,m.z+=m.vz*i,m.mesh.rotation.x+=i*3.2,m.mesh.rotation.z+=i*2.1,m.y-.26<=X&&(m.y=X+.26,se(m,X))}m.mesh.position.set(m.x,m.y,m.z)}for(const v of w){if(!v.fly)continue;const m=Math.max(1.2,t.gravityMps2);v.vy-=m*i,v.x+=v.vx*i,v.y+=v.vy*i,v.z+=v.vz*i,v.vx*=1-i*.25,v.vz*=1-i*.25,v.rx+=v.spin.x*i,v.ry+=v.spin.y*i,v.rz+=v.spin.z*i;const X=$(v.x,v.z)+v.sy*.72;v.y<=X&&(v.y=X,v.fly=!1,v.vx=0,v.vy=0,v.vz=0,v.base=$(v.x,v.z),v.liftY=v.y-v.sy*.72-v.base,v.relief=v.y+v.sy*.72-v.base),so(v),v.mesh.instanceMatrix.needsUpdate=!0}for(let v=T.length-1;v>=0;v-=1){const m=T[v];m.life-=i;const X=1-m.life/m.max;m.sprite.scale.setScalar(m.sprite.scale.x+(m.grow-m.sprite.scale.x)*Math.min(1,i*6)),m.sprite.material.opacity=Math.max(0,.9*(1-X)),m.life<=0&&(p.remove(m.sprite),T.splice(v,1))}for(let v=Z.length-1;v>=0;v-=1){const m=Z[v];m.life-=i,m.mesh.scale.multiplyScalar(1+i*3.4),m.mesh.material.opacity=Math.max(0,m.life/.7)*.6,m.life<=0&&(p.remove(m.mesh),Z.splice(v,1))}}function nn(u,i){if(t.cloudTop!==null||t.terrain==="plasma"||t.terrain==="ring"||!k)return 0;const z=22+Math.random()*6,v=Math.max(1.4,$(u,i)+26),m=Math.min(4.8+Math.random()*1.2,v);return P.push({x:u,z:i,r:z,d:m}),P.length>Wr&&(P.shift(),d?.()),k(u,i,z),c?.(u,i,z),z}const mn=new Jn;function so(u){mn.position.set(u.x,u.y,u.z),mn.rotation.set(u.rx,u.ry,u.rz),mn.scale.set(u.sx,u.sy,u.sz),mn.updateMatrix(),u.mesh.setMatrixAt(u.index,mn.matrix)}function kt(u,i){let z=u,v=i,m=0;for(const X of w){if(X.fly)continue;const D=Math.max(X.sx,X.sz);if(D<.04)continue;let te=z-X.x,B=v-X.z;const Pe=Math.hypot(te,B);if(!(Pe>D+1.2)){if(X.relief<=_r)Pe<D*.95&&(m=Math.max(m,X.relief));else if(Pe<D+qa){Pe<1e-4&&(te=0,B=1);const ot=Math.max(1e-4,Math.hypot(te,B)),ut=D+qa-Pe;z+=te/ot*ut,v+=B/ot*ut}}}return{x:z,z:v,rise:m}}const To=(u,i)=>{const v=-($(u+.9,i)-$(u-.9,i))/1.8,m=-($(u,i+.9)-$(u,i-.9))/(2*.9);return new F(v,1,m).normalize()};function ro(){nt.dispose(),vt.dispose();for(const u of T)p.remove(u.sprite);for(const u of Z)p.remove(u.mesh);for(const u of R)p.remove(u.mesh),u.mesh.material.dispose();S.forEach(u=>u.dispose()),p.clear()}return{group:p,eyeY:pe+he,eyeHeight:he,groundY:pe,standX:oe.x,standZ:oe.z,heightAt:$,floorAt:Me,solidFloor:un,walkable:t.cloudTop===null&&t.terrain!=="ring",avatar:nt,impact:vt,scar:nn,walk:kt,normalAt:To,scarCount:()=>P.length,update:ao,drop:N,dispose:ro}}const Ja="textures/",wt=Math.PI/180;function bo(t,o,n=1){return new F(Math.cos(t*wt)*Math.cos(o*wt),Math.sin(t*wt),-Math.cos(t*wt)*Math.sin(o*wt)).multiplyScalar(n)}const Ee=2.2,Lr=Date.UTC(2e3,0,1,12),Qa={mercury:[.62,.55,.46,.05],venus:[.78,.55,.32,.2],moon:[.72,.73,.76,.06],mars:[.78,.36,.2,.16],jupiter:[.86,.7,.42,.12],saturn:[.86,.74,.5,.1],uranus:[.55,.78,.82,.12],neptune:[.35,.5,.86,.14],pluto:[.78,.7,.62,.06],haumea:[.82,.8,.76,.05],makemake:[.8,.48,.32,.05],eris:[.86,.86,.84,.05]},es={mercury:{gain:2.6,relief:2.4,texel:[1/1024,1/512],tint:[.62,.55,.46],inner:.12,outer:.05},venus:{gain:2.2,relief:1.3,texel:[1/1024,1/512],tint:[.78,.55,.32],inner:.55,outer:.2},moon:{gain:1.25,relief:2.6,texel:[1/1e3,1/500],tint:[.72,.73,.76],inner:.16,outer:.06},mars:{gain:2.9,relief:1.8,texel:[1/1e3,1/500],tint:[.78,.36,.2],inner:.48,outer:.16},jupiter:{gain:2.35,tint:[.86,.7,.42],inner:.32,outer:.12},saturn:{gain:1.45,tint:[.86,.74,.5],inner:.28,outer:.1},uranus:{gain:2.15,tint:[.55,.78,.82],inner:.34,outer:.12},neptune:{gain:4.4,tint:[.35,.5,.86],inner:.4,outer:.14},pluto:{gain:2.6,tint:[.78,.7,.62],inner:.16,outer:.06},haumea:{gain:2.1,tint:[.82,.8,.76],inner:.12,outer:.05},makemake:{gain:2.1,tint:[.8,.48,.32],inner:.1,outer:.05},eris:{gain:2.2,tint:[.86,.86,.84],inner:.1,outer:.05}};function Gr(){if(typeof window>"u")return!0;const t=navigator,o=window.matchMedia?.("(pointer: coarse)").matches&&window.innerWidth<900,n=t.hardwareConcurrency??8,f=t.deviceMemory??8;return!!(o||n<=4||f<=4)}function Br(){const o=document.createElement("canvas");o.width=128,o.height=128;const n=o.getContext("2d");if(n){const f=n.createRadialGradient(64,64,0,64,64,64);f.addColorStop(0,"rgba(255,238,205,0.85)"),f.addColorStop(.3,"rgba(255,214,150,0.55)"),f.addColorStop(.45,"rgba(255,190,120,0.22)"),f.addColorStop(.7,"rgba(250,170,95,0.07)"),f.addColorStop(1,"rgba(255,160,80,0)"),n.fillStyle=f,n.fillRect(0,0,128,128)}return new oo(o)}const Or=`
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
}`,Vr=`
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
}`;function jr(t){return Math.max(.12,.16+.11*Math.log2(t/2e3))}const Xr=`
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
}`,Yr=`
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
}`,$r=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Hr=`
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 color;
uniform float power;
uniform float strength;
void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), power);
  gl_FragColor = vec4(color, fresnel * strength);
}`,ts=`
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`,ns=`
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
}`,Zr=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,Kr=`
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
}`,qr=`
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
}`,Jr=`
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
}`,Qr=`
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`,ei=`
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
}`,ti=`
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
}`,ni=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function fi(t,o){const n=Gr(),f=n?96:128,p=new Ns({antialias:!0,powerPreference:"default",alpha:!1});p.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1)),p.outputColorSpace=Gn,p.toneMapping=Fs,p.toneMappingExposure=1.1;const S=Math.min(4,p.capabilities.getMaxAnisotropy()),r=p.domElement;r.style.display="block",r.style.width="100%",r.style.height="100%",r.style.touchAction="none",t.appendChild(r);const g=document.createElement("div");g.className="space-labels",t.appendChild(g);const A=[];let y=0;function b(){const e=performance.now();if(e-y<400)return;y=e,A.length=0;const a=t.getBoundingClientRect();for(const s of[".explore-top",".sheet",".sky-alert"]){const h=document.querySelector(s);if(!h)continue;const x=h.getBoundingClientRect();x.width<2||x.height<2||A.push({x:x.left-a.left,y:x.top-a.top,w:x.width,h:x.height})}}function P(e,a,s,h=22){for(const x of A)if(e<x.x+x.w&&e+s>x.x&&a<x.y+x.h&&a+h>x.y)return!0;return!1}const w=new Ws;w.background=new V("#05070d");const d=new _s(45,1,.01,2e3),k=[],c=e=>(k.push(e),e),Y=new Us,I=new Ls,W=new Set(["milkyway.webp","sun.webp","moon.webp","earth-day.webp","earth-night.webp","earth-clouds.webp","earth-normal.webp","earth-spec.webp"]),K=new Map,J=new Map,$=[],oe=new Set;let pe=!1,he=0;const re=(e,a)=>{const s=J.get(e);if(s){J.delete(e);for(const h of s)h(a)}},ie=(e,a=!0)=>{const s=K.get(e);if(s)return s;he+=1;const h=Y.load(Ja+e,()=>{re(e,h),he-=1,he===0&&o.onReady?.()},void 0,()=>{re(e,h),he-=1,he===0&&o.onReady?.()});return h.colorSpace=a?Gn:os,h.anisotropy=n?4:8,K.set(e,h),c(h)},Ye=e=>{K.has(e)||oe.has(e)||(oe.add(e),I.load(Ja+e,a=>{oe.delete(e);const s=new Js;s.image=a,s.colorSpace=Gn,s.anisotropy=n?4:8,s.needsUpdate=!0,c(s),K.set(e,s),re(e,s)},void 0,()=>{oe.delete(e)}))},tt=()=>{if(!pe){pe=!0;for(const e of $)Ye(e)}},at=(e,a)=>{if(W.has(e)){a(ie(e));return}const s=K.get(e);if(s){a(s);return}const h=J.get(e)??[];h.push(a),J.set(e,h),$.includes(e)||($.push(e),pe&&Ye(e))},Ce=new _(c(new ye(900,48,24)),c(new le({map:ie("milkyway.webp"),side:Un,depthWrite:!1})));Ce.rotation.set(63*wt,0,0),w.add(Ce),w.add(new Gs(16777215,.14));const gt=new Bs(16777215,1.6,0,0);gt.decay=0,w.add(gt);const Ae=new Re;w.add(Ae);const Ie=new Map,$e=new Map,Nt=new Map,Zt=[],Pt=new Map;let Ft=null,un=null;const Me=new Map,nt=new Map,vt=new Map,ae=new Map;let ee=null,Mt=0,Ot=null;const fn=[],H=[],R=[],T=[],Z=[];let ue=Date.now(),G=!0,N=null;function se(e,a,s,h){const x=Qa[s]??[.7,.7,.7,.06],C=es[s],O=new V(a),q=C?.relief??0,l=c(new Ge({uniforms:{dayMap:{value:null},bumpMap:{value:null},texel:{value:new eo(C?.texel?.[0]??1/1024,C?.texel?.[1]??1/512)},useMap:{value:0},useBump:{value:0},relief:{value:q*.35},gain:{value:(C?.gain??1.9)*.6},base:{value:new F(O.r,O.g,O.b)},glow:{value:new F(x[0],x[1],x[2])},atmo:{value:Math.min(x[3]*2.2,.85)},ringShadow:{value:h?1:0},ringMap:{value:null},ringInner:{value:h?.inner??1},ringOuter:{value:h?.outer??2},ringCenter:{value:new F},ringNormal:{value:new F(0,1,0)}},vertexShader:Or,fragmentShader:Vr}));return e&&at(e,M=>{l.uniforms.dayMap.value=M,l.uniforms.useMap.value=1,q>0&&(l.uniforms.bumpMap.value=M,l.uniforms.useBump.value=1)}),h&&at("saturn-ring.webp",M=>{l.uniforms.ringMap.value=M}),l}function st(e,a,s){const h=es[s],x=h?.tint??Qa[s]?.slice(0,3);if(!x||n)return;const C=Math.min(h?.inner??.12,.5)*.55,O=Math.min(h?.outer??.05,.2)*.9,q=new F(x[0],x[1],x[2]),l=Math.sqrt(1-1/(1.045*1.045)),M=(E,U,ne,me)=>new _(c(new ye(a*E,n?24:32,n?16:24)),c(new Ge({uniforms:{tint:{value:q},power:{value:ne},strength:{value:me},edge:{value:l}},vertexShader:ts,fragmentShader:ns,side:U,transparent:!0,blending:ke,depthWrite:!1})));e.add(M(1.045,Un,2.7,C),M(1.16,Ua,3.4,O))}function lt(e,a){const s=c(new Ge({uniforms:{poleN:{value:bo(80.7,-72.7,1).normalize()},poleS:{value:bo(-80.7,107.3,1).normalize()},time:{value:0}},vertexShader:Zr,fragmentShader:Kr,transparent:!0,blending:ke,depthWrite:!1})),h=new _(c(new ye(a*1.022,n?64:96,n?48:64)),s);h.renderOrder=1,e.add(h),T.push(s)}function tn(e,a){[[18,40,.34,.17,.2],[-24,150,.26,.13,-.4],[8,255,.42,.21,.6],[-12,320,.22,.11,1.1],[32,200,.3,.15,-.9]].forEach(([h,x,C,O,q],l)=>{const M=bo(h,x,1).normalize(),E=new F(0,1,0).cross(M).normalize(),U=new F().crossVectors(M,E).normalize(),ne=E.multiplyScalar(Math.cos(q)).addScaledVector(U,Math.sin(q)).normalize(),me=[];for(let xe=0;xe<=16;xe+=1){const We=xe/16,De=(We-.5)*C,Ve=Math.sin(We*Math.PI)*O;me.push(new F().copy(M).multiplyScalar(Math.cos(De)).addScaledVector(ne,Math.sin(De)).normalize().multiplyScalar(a*(.985+Ve)))}const we=c(new Ge({uniforms:{uTime:{value:0},seed:{value:l*.37+.11}},vertexShader:qr,fragmentShader:Jr,transparent:!0,blending:ke,side:Je,depthWrite:!1})),Le=new _(c(new Zs(new Ks(me),64,a*.022,8,!1)),we);Le.raycast=()=>{},e.add(Le),Z.push(we)})}function pn(e,a,s=""){const h=document.createElement("button");h.type="button",h.className="space-label"+s,h.textContent=a,h.addEventListener("click",()=>o.onPick?.(e)),g.appendChild(h),Nt.set(e,h)}const ao=c(new Ge({uniforms:{map:{value:ie("sun.webp")},time:{value:0}},vertexShader:`
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
        }`})),nn=new F,mn=["sun","earth","moon","jupiter","saturn","mars","venus","mercury","uranus","neptune","pluto","eris","haumea","makemake"],so=new Map;let kt=null;const To={moon:"earth",...Object.fromEntries(Ga.map(e=>[e.id,e.parent]))};function ro(e,a){const s=To[e];if(kt===null||!s)return ho(e,a);const h=ho(s,a),x=ho(e,kt),C=ho(s,kt);return{x:h.x+x.x-C.x,y:h.y+x.y-C.y,z:h.z+x.z-C.z}}function u(e){for(const[a,s]of $e){if(a==="sun")continue;const h=ro(a,e);s.position.set(h.x*Ee,h.y*Ee,h.z*Ee)}for(const[a,s]of Me){const h=ro(a,e);s.position.set(h.x*Ee,h.y*Ee,h.z*Ee)}if(Ot){nn.copy(Ot.holder.position);const a=nn.length()||1;Ot.tail.visible=a/Ee<8,nn.multiplyScalar(1/a),Ot.tail.quaternion.setFromUnitVectors(new F(0,1,0),nn),Ot.tail.position.copy(nn).multiplyScalar(.16*Ee)}}const i=new F(1,0,0),z=c(new Ge({uniforms:{dayMap:{value:ie("earth-day.webp")},nightMap:{value:ie("earth-night.webp")},normalMap:{value:ie("earth-normal.webp",!1)},specMap:{value:ie("earth-spec.webp",!1)},texel:{value:new eo(1/2048,1/1024)},sunDir:{value:i}},vertexShader:Xr,fragmentShader:Yr}));function v(e){const a=new Re,s=new _(c(new ye(e,n?96:128,64)),z);s.name="earth",a.add(s);const h=new _(c(new ye(e*1.012,80,48)),c(new qs({map:ie("earth-clouds.webp"),transparent:!0,depthWrite:!1,opacity:.55,roughness:1,metalness:0})));a.add(h),Ft=h;const x=new _(c(new ye(e*1.06,64,48)),c(new Ge({uniforms:{sunDir:{value:i}},vertexShader:`
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
            }`,side:Un,transparent:!0,blending:ke,depthWrite:!1})));a.add(x);const C=new _(c(new ye(e*1.15,n?24:32,n?16:24)),c(new Ge({uniforms:{tint:{value:new F(.42,.62,.9)},power:{value:3.4},strength:{value:.22},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:ts,fragmentShader:ns,side:Ua,transparent:!0,blending:ke,depthWrite:!1})));return a.add(C),Ie.set("earth",s),a}function m(e,a,s){for(const h of Zn(e).sites??[]){const x=new _(c(new ye(s*.018,12,8)),c(new le({color:"#3182f6"})));x.position.copy(bo(h.lat,h.lon,s*1.004)),a.add(x);const C=document.createElement("div");C.className="space-site",C.textContent=h.name,g.appendChild(C),Zt.push({mesh:x,site:h,el:C,parent:e})}}let X=null;for(const e of tr){if(e.id==="moon")continue;const a=new Re;if($e.set(e.id,a),Ae.add(a),e.id==="sun"){const s=.26*Ee,h=new _(c(new ye(s,n?96:128,n?64:80)),ao);h.name="sun",Pt.set("sun",s),a.add(h),tn(h,s);for(const[C,O,q,l]of[[1.06,2,.95,"#ffbf78"]])a.add(new _(c(new ye(s*C,n?32:48,n?24:32)),c(new Ge({uniforms:{color:{value:new V(l)},power:{value:O},strength:{value:q}},vertexShader:$r,fragmentShader:Hr,transparent:!0,blending:ke,depthWrite:!1}))));Ie.set("sun",h);const x=new to(c(new no({map:c(Br()),blending:ke,transparent:!0,depthWrite:!1,depthTest:!0,color:new V("#ffd9a0")})));x.scale.setScalar(s*3.6),a.add(x),un=x}else{const s=$o(e.id).radius*Ee;Pt.set(e.id,s);let h;if(e.id==="earth"){const q=v(s);q.rotation.z=-e.tilt*wt,a.add(q),X=q,h=q.children[0]}else{const q=e.id==="saturn"?{inner:s*1.18,outer:s*2.08}:void 0;h=new _(c(new ye(s,n?96:128,64)),se(e.texture,e.color,e.id,q)),h.name=e.id,h.rotation.z=-e.tilt*wt,a.add(h),Ie.set(e.id,h),st(a,s,e.id),e.id==="jupiter"&&lt(h,s)}if(e.axes){const[q,l,M]=e.axes;h.scale.set(1,M/q,l/q)}if(e.ring&&e.axes){const q=e.axes[0]/2,l=s*(e.ring.radius-e.ring.width/2)/q,M=s*(e.ring.radius+e.ring.width/2)/q,E=new _(c(new ct(l,Math.max(M,l*1.03),128,1)),c(new le({color:"#8b8580",side:Je,transparent:!0,opacity:.75,depthWrite:!1})));E.rotation.x=Math.PI/2,a.add(E)}if(e.id==="saturn"){const q=s*1.18,l=s*2.08,M=new ct(q,l,160,1),E=c(new Ge({uniforms:{ringMap:{value:null},innerRatio:{value:q/l},planetRadius:{value:s},planetCenter:{value:new F}},vertexShader:Qr,fragmentShader:ei,side:Je,transparent:!0,depthWrite:!1}));at("saturn-ring.webp",ne=>{E.uniforms.ringMap.value=ne});const U=new _(c(M),E);U.rotation.x=Math.PI/2,h.add(U),H.push({mesh:U,parent:e.id}),R.push({mesh:h,material:h.material})}e.sites&&m(e.id,h,s);const x=Ba(e.id,.022),C=c(new Lt);C.setAttribute("position",new Xo(x.positions,3)),C.setIndex(x.index),C.scale(Ee,Ee,Ee);const O=new _(C,c(new le({color:$o(e.id).ribbon,transparent:!0,opacity:.5,side:Je,depthWrite:!1})));fn.push(O),Ae.add(O)}pn(e.id,e.name,e.id==="sun"?"":" is-planet")}const D=[];function te(e,a,s){let h=e==="main"?1234:98765;const x=()=>(h=h*16807%2147483647,(h-1)/2147483646),C=c(new Jt(1,0)),O=new Float32Array(a*4),q=new Float32Array(a*4);for(let E=0;E<a;E+=1){let U;if(e==="main")do U=2.1+x()*1.2;while((Math.abs(U-2.5)<.03||Math.abs(U-2.82)<.03||Math.abs(U-2.95)<.02)&&x()<.85);else U=x()<.18?39.2+(x()-.5)*1.2:42+(x()-.5)*6.5;O[E*4]=U,O[E*4+1]=x()*Math.PI*2,O[E*4+2]=x()*(e==="main"?.18:.12),O[E*4+3]=x()*Math.PI*2,q[E*4]=(x()-.5)*(e==="main"?.32:.5),q[E*4+1]=x()*Math.PI*2;const ne=x()**3;q[E*4+2]=(e==="main"?.0035:.009)*(.7+ne*2.4),q[E*4+3]=x()}C.setAttribute("orbit",new La(O,4)),C.setAttribute("shape",new La(q,4));const l=c(new Ge({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new V(s)},uScale:{value:Ee}},vertexShader:ti,fragmentShader:ni})),M=new Co(C,l,a);M.frustumCulled=!1,M.raycast=()=>{},Ae.add(M),D.push({mesh:M,material:l})}te("main",n?1800:4200,"#9c9184"),te("kuiper",n?1500:3600,"#7f8b9c");for(const e of Ga){const a=new Re,s=new _(c(new ye(e.radius*Ee,32,24)),se(`${e.id}.webp`,e.color,e.id));s.name=e.id,a.add(s),Ae.add(a),Me.set(e.id,a),nt.set(e.id,s);const h=document.createElement("button");h.type="button",h.className="space-label is-small",h.textContent=e.name,h.addEventListener("click",()=>o.onExtra?.(e.id)),g.appendChild(h),vt.set(e.id,{el:h,parent:e.parent})}{const e=new Re,a=new _(c(new ye(.045*Ee,20,16)),c(new le({color:"#f7fbff"})));a.name="halley",e.add(a);const s=new _(c(new Os(.04*Ee,.32*Ee,12)),c(new le({color:"#d5e8f5",transparent:!0,opacity:.4,depthWrite:!1})));e.add(s),Ot={holder:e,tail:s},Ae.add(e),Me.set("halley",e),nt.set("halley",a);const h=Ba("halley",.022),x=c(new Lt);x.setAttribute("position",new Xo(h.positions,3)),x.setIndex(h.index),x.scale(Ee,Ee,Ee);const C=new _(x,c(new le({color:$o("halley").ribbon,transparent:!0,opacity:.35,side:Je,depthWrite:!1})));fn.push(C),Ae.add(C);const O=document.createElement("button");O.type="button",O.className="space-label is-small",O.textContent=L("핼리 혜성"),O.addEventListener("click",()=>o.onExtra?.("halley")),g.appendChild(O),vt.set("halley",{el:O,parent:null})}for(const e of nr){const a=or(e),s=a.points.map(ne=>new F(ne.x*Ee,ne.y*Ee,ne.z*Ee)),h=c(new Lt().setFromPoints(s)),x=new Vs(h,c(new Qn({color:e.color,transparent:!0,opacity:.95})));x.visible=!1;const C=new Re,O=new _(c(new Yo(.03,.01,.01,20)),c(new le({color:"#d8dde4"})));O.rotation.x=Math.PI/2;const q=new _(c(new ye(.014,12,8)),c(new le({color:"#c9ced6"})));q.position.z=-.02;const l=new _(c(new Yo(.002,.002,.09,6)),c(new le({color:"#aab3c0"})));l.rotation.z=Math.PI/2,l.position.z=-.02;const M=new _(c(new ye(.035,16,12)),c(new le({color:e.color,transparent:!0,opacity:.18,blending:ke,depthWrite:!1})));C.add(O,q,l,M),C.scale.setScalar(e.frame==="earth"?.8:1.3),C.position.copy(s[s.length-1]),x.add(C),(e.frame==="earth"?$e.get("earth")??Ae:Ae).add(x);const U=document.createElement("div");U.className="space-site is-probe",U.textContent=e.name,g.appendChild(U),ae.set(e.id,{line:x,probe:C,el:U,points:s,times:a.points.map(ne=>ne.t),marks:a.marks,frame:e.frame})}if(u(ue),X){const e=.055*Ee;Pt.set("moon",e);const a=new _(c(new ye(e,f,48)),se("moon.webp","#b8b8b8","moon"));a.name="moon";const s=new Re;s.add(a),Ae.add(s),Ie.set("moon",a),$e.set("moon",s),m("moon",a,e),pn("moon",L("달")," is-small"),u(ue)}const B=new Re,Pe=new Re,ot=new Re;B.add(Pe,ot),B.visible=!1;let ut="solar",je=!1,on=0;const ce={moon:new _,moonMat:c(new le({color:"#ffffff"})),shadow:c(new le({color:"#120c18",transparent:!0,opacity:.2,depthWrite:!1})),cone:new _,umbra:new _,skyCover:new _,skySun:new Re,skyMoon:new Re,skyMoonMat:c(new le({color:"#ffffff"}))},dn=[],Vt=ie("sun.webp"),Kt=ie("moon.webp"),Ct=new _(c(new ye(.62,32,24)),c(new le({map:Vt})));Ct.position.set(-3.3,0,0);const fe=new _(c(new ye(.4,32,24)),c(new le({map:ie("earth-day.webp")})));fe.position.set(1.85,0,0),ce.moonMat.map=Kt,ce.moon=new _(c(new ye(.14,24,18)),ce.moonMat),ce.cone=new _(c(new Yo(.04,.16,.78,18)),ce.shadow),ce.cone.position.set(1.42,0,0),ce.cone.rotation.z=Math.PI/2,ce.umbra=new _(c(new Hn(.3,28)),c(new le({color:"#2a121c",transparent:!0,opacity:.2,depthWrite:!1}))),ce.umbra.position.set(2.75,0,.02),Pe.add(Ct,fe,ce.moon,ce.cone,ce.umbra);for(const[e,a]of[[L("태양"),new F(-3.3,.85,0)],[L("지구"),new F(1.85,.68,0)]]){const s=document.createElement("div");s.className="space-site",s.textContent=e,g.appendChild(s),dn.push({el:s,at:a,group:Pe})}const Te=new _(c(new Hn(1.35,48)),c(new le({map:Vt}))),_e=new _(c(new ct(1.4,1.7,48)),c(new le({color:"#f0c36a",transparent:!0,opacity:.45,side:Je,depthWrite:!1})));ce.skyCover=new _(c(new Hn(1.22,48)),c(new le({color:"#141820"}))),ce.skySun.add(Te,_e,ce.skyCover),ce.skyMoonMat.map=Kt;const He=new _(c(new Hn(.92,48)),ce.skyMoonMat),Ne=new _(c(new Hn(1.08,48)),c(new le({color:"#6a2c38",transparent:!0,opacity:.62,depthWrite:!1})));Ne.position.z=.16,ce.skyMoon.add(He,Ne),ot.add(ce.skySun,ce.skyMoon);const de=document.createElement("div");de.className="space-site is-stage",g.appendChild(de),dn.push({el:de,at:new F(0,-1.2,0),group:Pe}),ot.visible=!1,w.add(B);const Ue=new Re;Ue.visible=!1,Ue.rotation.z=-Math.PI/2;const Xe=[],Ze=4.6,xt=e=>Ze*e/696e3,it=new _(c(new ye(Ze,64,40)),c(new le({map:ie("sun.webp")})));it.position.set(-3.2,0,0),Ue.add(it);const jt=[["mercury",2440],["venus",6052],["earth",6371],["moon",1737],["mars",3390],["jupiter",69911],["saturn",58232],["uranus",25362],["neptune",24622],["pluto",1188],["haumea",780],["makemake",715],["eris",1163]];let Xt=2.4;const At=(e,a)=>{const s=document.createElement("div");s.className="space-site",s.textContent=e,g.appendChild(s),Xe.push({el:s,at:a,group:Ue})};At(L("태양"),new F(-3.2,4.9,0));for(const[e,a]of jt){const s=xt(a),h=Xt+s;Xt=h+s+.72;const x=Zn(e),C=e==="earth"?"earth-day.webp":x.texture,O=c(new le({color:x.color}));C&&at(C,l=>{O.map=l,O.color.set("#ffffff"),O.needsUpdate=!0});const q=new _(c(new ye(s,32,24)),O);if(q.position.set(h,0,0),x.axes&&q.scale.set(1,x.axes[2]/x.axes[0],x.axes[1]/x.axes[0]),Ue.add(q),e==="saturn"){const l=s*1.18,M=s*2.08,E=c(new ct(l,M,96,1)),U=E.attributes.position,ne=E.attributes.uv,me=new F;for(let xe=0;xe<U.count;xe+=1)me.fromBufferAttribute(U,xe),ne.setXY(xe,(me.length()-l)/(M-l),.5);const we=c(new le({color:"#b9b3ab",transparent:!0,opacity:.9,side:Je,depthWrite:!1}));at("saturn-ring.webp",xe=>{we.map=xe,we.color.set("#ffffff"),we.needsUpdate=!0});const Le=new _(E,we);Le.rotation.y=Math.PI/2-.36,q.add(Le)}At(x.name,new F(h,(e==="saturn"?s*2.08:s)+.12,0))}w.add(Ue);const Qe=new Re;Qe.visible=!1;const Yt=[],hn=[],cs=new _(c(new ye(.55,48,32)),c(new le({color:"#e0703a"})));Qe.add(cs);for(const[e,a]of[[1.35,.16],[2.1,.05]])Qe.add(new _(c(new ye(.55*e,32,24)),c(new le({color:"#ff6a30",transparent:!0,opacity:a,side:Un,blending:ke,depthWrite:!1}))));const aa=new _(c(new ct(2.6,5.1,96,1)),c(new le({color:"#3fbf7f",transparent:!0,opacity:.12,side:Je,depthWrite:!1})));aa.rotation.x=Math.PI/2,Qe.add(aa),[["b",1.510826,.01154,1.116,"#c9a27c"],["c",2.421937,.0158,1.097,"#b98d6a"],["d",4.049219,.02227,.788,"#d9c7a8"],["e",6.101013,.02925,.92,"#7fa6c9"],["f",9.20754,.03849,1.045,"#a7c4d8"],["g",12.352446,.04683,1.129,"#c9d8e3"],["h",18.772866,.06189,.755,"#e6eef3"]].forEach(([e,a,s,h,x],C)=>{const O=new _a(c(new Lt().setFromPoints(Array.from({length:128},(M,E)=>new F(Math.cos(E/128*Math.PI*2)*s*100,0,Math.sin(E/128*Math.PI*2)*s*100)))),c(new Qn({color:"#8b95a1",transparent:!0,opacity:.35})));Qe.add(O);const q=new _(c(new ye(.16*h,24,16)),se(void 0,x,"earth"));Qe.add(q);const l=document.createElement("button");l.type="button",l.className="space-label is-small",l.textContent=e,l.addEventListener("click",()=>o.onExtra?.(`trappist-${e}`)),g.appendChild(l),Yt.push({mesh:q,a:s*100,period:a,phase0:C*1.7,el:l})});const ls=new _a(c(new Lt().setFromPoints(Array.from({length:256},(e,a)=>new F(Math.cos(a/256*Math.PI*2)*38.7,0,Math.sin(a/256*Math.PI*2)*38.7)))),c(new Qn({color:"#c5b8a2",transparent:!0,opacity:.5})));Qe.add(ls);for(const[e,a]of[["TRAPPIST-1",new F(0,1.1,0)],[L("생명가능지대(대략)"),new F(3.9,0,0)],[L("비교: 우리 수성의 궤도"),new F(0,0,38.7)]]){const s=document.createElement("div");s.className="space-site",s.textContent=e,g.appendChild(s),hn.push({el:s,at:a})}w.add(Qe);const an=cr(c),us=an.labels.map(({name:e,at:a})=>{const s=document.createElement("div");return s.className="space-site",s.textContent=e,g.appendChild(s),{el:s,at:a}});w.add(an.group);const yt=ur(),Do=[];if(yt)for(const[e,a]of Object.entries(yt.groups)){w.add(a);for(const s of yt.markers[e]){const h=document.createElement("button");h.type="button",h.className="space-label",h.textContent=s.name,h.addEventListener("click",()=>{o.onMarker?.(s),Se.target.copy(s.position),Se.radius=zn[e]*(s.id==="cmb"?1.4:e==="group"?.6:.42)}),g.appendChild(h),Do.push({level:e,marker:s,el:h})}}const sa=[];if(yt){const a=(C,O)=>new F(Math.cos(O*wt)*Math.cos(C*wt),Math.sin(O*wt),-Math.cos(O*wt)*Math.sin(C*wt)).multiplyScalar(140),s=[];for(const C of Object.values(Oa))for(const O of C)for(let q=0;q<O.length-1;q+=1){const l=a(O[q][0],O[q][1]),M=a(O[q+1][0],O[q+1][1]);s.push(l.x,l.y,l.z,M.x,M.y,M.z)}const h=c(new Lt);h.setAttribute("position",new Xo(s,3));const x=new as(h,c(new Qn({color:"#5f8fd6",transparent:!0,opacity:.55,depthWrite:!1})));yt.groups.stars.add(x);for(const C of ar){if(!Oa[C.id])continue;const O=document.createElement("button");O.type="button",O.className="space-label is-const",O.textContent=C.name.replace(/\(.*\)/,"").split(" · ")[0],O.addEventListener("click",()=>o.onConstellation?.(C.id)),g.appendChild(O),sa.push({el:O,at:a(C.center[0],C.center[1])})}}const io=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;let ve="system",Sn=!1,ra=!1;const zn={system:40,super:40,eclipse:7.5,sizes:15,exo:16,blackhole:24,stars:46,orion:48,galaxy:44,group:40,cosmos:70},Pn=new F,be={theta:.6,phi:.95,radius:34},Se={target:new F,radius:be.radius};let et="system",ft=null,bt=null,Wt=null;function co(e){if((e==="system"||e==="sizes")&&tt(),ve=e,Sn=!1,Ae.visible=e==="system",B.visible=e==="eclipse",Ue.visible=e==="sizes",Qe.visible=e==="exo",an.group.visible=e==="blackhole",yt)for(const[a,s]of Object.entries(yt.groups))s.visible=a===e;et="system",ft=null,bt=null,Wt=null,Se.target.set(0,0,0),Se.radius=zn[e],e!=="system"&&(be.phi=1.1),e==="eclipse"&&(Pe.rotation.z=d.aspect<1?-Math.PI/2:0,be.theta=0,be.phi=je?Math.PI/2:1.25,Se.target.set(0,0,0),je||Se.target.set(-.7,0,0).applyEuler(Pe.rotation),Se.radius=je?6:d.aspect<1?10:7.5),e==="exo"&&(be.phi=.75),e==="blackhole"&&(be.phi=1.42),e==="sizes"&&(be.theta=0,be.phi=Math.PI/2,Se.target.set(.6,-6.8,0),Se.radius=19)}function ia(e){if(e!=="earth"&&tt(),Sn=!1,ve!=="system"&&(ve="system",Ae.visible=!0,B.visible=!1,Ue.visible=!1,Qe.visible=!1,an.group.visible=!1,yt))for(const s of Object.values(yt.groups))s.visible=!1;if(et=e,bt=null,Wt=null,e==="system"){ft=null,Se.target.set(0,0,0),Se.radius=zn.system;return}ft=$e.get(e)??null;const a=Pt.get(e)??jr(Zn(e).km);Se.radius=e==="sun"?3.2:e==="jupiter"?3.4*Ee:e==="saturn"?2.6*Ee:Math.max(a*(Zn(e).ring?6:4.2),.25)}function fs(e){const a=Me.get(e);a&&(ve!=="system"&&co("system"),et="system",ft=a,bt=null,Wt=null,Se.radius=e==="halley"?1.6:.6,Ht=performance.now())}function ps(e){Wt=(e?Zt.find(s=>s.parent===et&&s.site.name===e.name):void 0)?.mesh??null,bt=Wt?new F:null,Ht=performance.now()}let Q=null,Fe=0,pt=-.12;const Eo=62,ca=18,la=85;let sn=Eo,kn=0,vn=0,Cn=0,ua=0;const An=3.4,fa=6.6,lo=2.8,pa=4.6,Tn=620;let Be=0,Oe=0,Dn=0,rt=0,mt=0,dt=0,gn=0,_t=!0,yn=!1,Ro=0,St=!0,Io=9.81,wn="first",ma="office";const ms=4.6,da=1.8,ha=16;let On=ms,Vn=0,rn=Math.PI,Mn=0,jn=0,Xn=0,En=Number.NaN,Rn=0,In=0,No=new V("#000000"),Fo=0;const ds=new V("#5a1206");let uo=0,Wo=0,_o=-24,Uo=120;const Tt=new Set;function hs(){if(Ce.visible=!0,Ae.visible=ve==="system",B.visible=ve==="eclipse",Ue.visible=ve==="sizes",Qe.visible=ve==="exo",an.group.visible=ve==="blackhole",yt)for(const[e,a]of Object.entries(yt.groups))a.visible=e===ve}function va(e,a){Q&&(w.remove(Q.group),Q.dispose(),Q=null);const s=rr(e);Q=Ur(s,{low:n,anisotropy:S,onLand:h=>o.onSurfaceDrop?.({id:e,seconds:h.seconds,bounces:h.bounces,outcome:h.outcome}),onImpact:ys}),w.add(Q.group),No=new V(s.fog),Fo=s.fogDensity,w.fog=new Qs(No.clone(),Fo),Fe=(s.companion?s.companionAz:s.sunAz)*wt,pt=-.12,rn=Math.PI-Fe,Mn=0,jn=0,Xn=0,Ho(),sn=Eo,Be=Q.standX,Oe=Q.standZ,Dn=0,rt=0,mt=0,dt=0,gn=0,_t=!0,yn=!1,Ro=0,St=Q.walkable,Io=Math.max(0,s.gravityMps2),uo=0,Wo=0,_o=s.terrain==="ring"?-24:-1,Uo=s.terrain==="ring"?110:240,vn=0,Cn=Math.max(.6,a),ua=s.cloudTop!==null?260:150,Vn=0,En=Number.NaN,Q.avatar.setSkin(ma),Q.avatar.setVisible(wn==="third"),Ht=performance.now()}function ga(e){if(!Q){if(Ce.visible=!1,Ae.visible=!1,B.visible=!1,Ue.visible=!1,Qe.visible=!1,an.group.visible=!1,yt)for(const a of Object.values(yt.groups))a.visible=!1;g.style.display="none",ee=null,kt=null,G=!0,d.fov=62,d.near=.08,d.far=6e3,d.updateProjectionMatrix()}va(e,1.9)}function vs(e){if(!Q){ga(e);return}va(e,1.1)}function gs(){Q&&(Ho(),w.remove(Q.group),Q.dispose(),Q=null,w.fog=null,p.toneMappingExposure=1.1,g.style.display="",hs(),d.fov=45,d.near=.01,d.far=2e3,d.updateProjectionMatrix(),Pn.copy(Se.target),be.radius=Se.radius,Ht=performance.now())}function Lo(){if(!Q)return;const e=4.2+Math.random()*1.4,a=(Math.random()-.5)*1.8,s=Be-Q.standX+Math.sin(Fe)*e+Math.cos(Fe)*a,h=Oe-Q.standZ-Math.cos(Fe)*e+Math.sin(Fe)*a;Q.drop(s,h)}function ys(){if(o.onSurfaceImpact?.(),!Q)return;const e=Math.sin(Fe),a=-Math.cos(Fe);Rn-=e*8.2,In-=a*8.2,St?_t&&(rt=Math.max(rt,2.8),_t=!1):rt+=1.8}function ws(){if(!Q)return;const e=22+Math.random()*8,a=(Math.random()-.5)*5,s=Math.sin(Fe),h=-Math.cos(Fe),x=Be+s*e+Math.cos(Fe)*a,C=Oe+h*e+Math.sin(Fe)*a;Q.impact.strike(x,C,s,h),ir()}function Ms(e){wn=e,e==="third"&&pt<-.32&&(pt=-.16),En=Number.NaN,pt=Math.min(.6,Math.max(-1.05,pt)),Q&&Q.avatar.setVisible(e==="third"),Ht=performance.now()}function xs(e){ma=e,Q&&Q.avatar.setSkin(e)}function bs(e){if(!Q)return;if(vn<Cn){yn=!1;return}const a=(Tt.has("w")||Tt.has("arrowup")?1:0)-(Tt.has("s")||Tt.has("arrowdown")?1:0),s=(Tt.has("d")||Tt.has("arrowright")?1:0)-(Tt.has("a")||Tt.has("arrowleft")?1:0);let h=uo+a,x=Wo+s;const C=Math.hypot(h,x);C>1&&(h/=C,x/=C);const O=Math.sin(Fe),q=-Math.cos(Fe),l=Math.cos(Fe),M=Math.sin(Fe),E=Math.min(1,e*(St?9:2.4));if(St){const U=Math.min(1,C),ne=Math.min(1,Math.max(0,(U-.7)/.3));jn+=(ne-jn)*Math.min(1,e*6);const me=An+(fa-An)*jn,we=(O*h+l*x)*me,Le=(q*h+M*x)*me,xe=Math.min(1,e*(U>.02?8.5:5.2));mt+=(we-mt)*xe,dt+=(Le-dt)*xe,Be+=(mt+Rn)*e,Oe+=(dt+In)*e,Rn*=Math.exp(-e*3.1),In*=Math.exp(-e*3.1);const We=Q.walk(Be,Oe);if(We.x!==Be||We.z!==Oe){const Dt=We.x-Be,Et=We.z-Oe,Rt=Math.hypot(Dt,Et);if(Be=We.x,Oe=We.z,Rt>1e-4){const qe=Dt/Rt,Yn=Et/Rt,$n=mt*qe+dt*Yn;$n<0&&(mt-=qe*$n,dt-=Yn*$n)}}const De=We.rise;Mn+=(De-Mn)*Math.min(1,e*(De>Mn?16:9));const Ve=Math.hypot(Be,Oe);if(Ve>Tn){const Dt=Be/Ve,Et=Oe/Ve;Be=Dt*Tn,Oe=Et*Tn;const Rt=mt*Dt+dt*Et;Rt>0&&(mt-=Rt*Dt,dt-=Rt*Et)}const Ke=Math.hypot(mt,dt);Ro+=e*(_t?.8+Ke*1.7:.8),yn&&_t&&Io>.01&&(rt=pa,_t=!1),_t||(rt-=Io*e,Dn+=rt*e,Dn<=0&&(Dn=0,Vn=Math.min(1,Math.abs(rt)/pa),rt=0,_t=!0))}else{const U=Math.cos(pt),ne=(Math.sin(Fe)*U*h+l*x)*lo,me=Math.sin(pt)*h*lo,we=(-Math.cos(Fe)*U*h+M*x)*lo;mt+=(ne-mt)*E,dt+=(we-dt)*E,rt+=(me-rt)*E,yn&&(rt+=1.8),Be+=(mt+Rn)*e,Oe+=(dt+In)*e,Rn*=Math.exp(-e*3.1),In*=Math.exp(-e*3.1),gn+=rt*e;const Le=Math.hypot(Be,Oe);if(Le>Tn){const xe=Be/Le,We=Oe/Le;Be=xe*Tn,Oe=We*Tn;const De=mt*xe+dt*We;De>0&&(mt-=De*xe,dt-=De*We)}gn<_o&&(gn=_o,rt<0&&(rt=0)),gn>Uo&&(gn=Uo,rt>0&&(rt=0))}yn=!1}function Ss(e,a){if(!Q)return;if(Q.update(e,a),vn<Cn){vn=Math.min(Cn,vn+a);const ne=vn/Cn,me=1-Math.pow(1-ne,3);kn=ua*(1-me),pt=-.12-.38*(1-me)}else kn!==0&&(kn=0,wn==="third"&&(pt=-.16));bs(a),Vn=Math.max(0,Vn-a*3.4),d.fov!==sn&&(d.fov=sn,d.updateProjectionMatrix());const s=wn==="third";St&&!_t&&(Mn+=(0-Mn)*Math.min(1,a*4));const h=St?Mn:0,x=St?Q.eyeY+Q.heightAt(Be,Oe)+h+Dn:Q.eyeY+gn,C=x-Q.eyeHeight+kn,O=Math.hypot(mt,dt);O>.25&&(rn=Math.atan2(mt,dt)),Xn=Math.max(0,Xn-a);const q=uo>.25||Tt.has("w")||Tt.has("arrowup");if(s&&q&&Xn<=0&&O>An*.8){const me=(Math.PI-rn-Fe+Math.PI*3)%(Math.PI*2)-Math.PI;Fe+=me*Math.min(1,a*.8)}if(Q.avatar.setVisible(s),s){const ne=Q.normalAt(Be,Oe),me=Math.sin(rn),we=Math.cos(rn),Le=Math.cos(rn),xe=-Math.sin(rn),We=-Math.asin(Math.max(-1,Math.min(1,ne.x*me+ne.z*we))),De=-Math.asin(Math.max(-1,Math.min(1,ne.x*Le+ne.z*xe)));Q.avatar.update(e,a,{x:Be,z:Oe,feetY:C,facing:rn,speed:O,maxSpeed:St?An+(fa-An)*jn:lo,grounded:St&&_t,floating:!St,vy:rt,landing:Vn,shadowY:Q.solidFloor?Q.floorAt(Be,Oe):null,shockT:Q.impact.sinceImpact(),slopePitch:St?Math.max(-.26,Math.min(.26,We)):0,slopeRoll:St?Math.max(-.26,Math.min(.26,De)):0,groundNormal:{x:ne.x,y:ne.y,z:ne.z}})}if(s){const ne=Number.isNaN(En)?C+1.34:En;En=ne+(C+1.34-ne)*Math.min(1,a*3.2);const me=En,we=Math.cos(pt),Le=Math.sin(Fe)*we,xe=Math.sin(pt),We=-Math.cos(Fe)*we,De=On,Ve=Be-Le*De;let Ke=me-xe*De;const Dt=Oe-We*De;if(Q.solidFloor){const Et=Q.floorAt(Ve,Dt)+.45;Ke=Math.max(Ke,Math.min(Et,me+1.8))}d.position.set(Ve,Ke,Dt),d.lookAt(Be,me,Oe)}else{const ne=Math.min(1,O/An),me=St?_t?Math.sin(Ro*2)*.035*ne:0:Math.sin(e*.5)*.25,we=x+kn+me;d.position.set(Be,we,Oe);const Le=Math.cos(pt);d.lookAt(Be+Math.sin(Fe)*Le,we+Math.sin(pt),Oe-Math.cos(Fe)*Le)}const l=Q.impact.shake();if(l>.002){const ne=l;d.position.x+=(Math.sin(e*47.3)+Math.sin(e*29.1)*.7)*ne*.6,d.position.y+=(Math.sin(e*53.7+1.3)+Math.sin(e*33.4)*.6)*ne*.6,d.position.z+=(Math.sin(e*41.9+2.1)+Math.sin(e*25.6)*.5)*ne*.45,d.rotateZ((Math.sin(e*35.2)*.6+Math.sin(e*21.7+1.1)*.4)*ne*.05)}const M=Q.impact.flash();p.toneMappingExposure=1.1+M*5.4;const E=Q.impact.doom(),U=w.fog;U&&(U.color.copy(No).lerp(ds,E*.82),U.density=Fo*(1+E*2.4)),p.render(w,d)}const ht=new Map,Go=new Map;let $t=0,cn=0,fo=!1,Ht=0;const ya=new js,wa=new eo,Ma=e=>{if(Go.set(e.pointerId,{x:e.clientX,y:e.clientY}),Q){if(r.setPointerCapture(e.pointerId),ht.set(e.pointerId,{x:e.clientX,y:e.clientY}),ht.size>=2){const[a,s]=[...ht.values()];$t=Math.hypot(a.x-s.x,a.y-s.y),fo=!0,cn+=100}else fo=!1,cn=0;return}if(tt(),r.setPointerCapture(e.pointerId),Sn=!1,ht.set(e.pointerId,{x:e.clientX,y:e.clientY}),cn=0,Ht=performance.now(),ht.size===2){const[a,s]=[...ht.values()];$t=Math.hypot(a.x-s.x,a.y-s.y)}},xa=e=>{const a=ht.get(e.pointerId);if(!a)return;const s=e.clientX-a.x,h=e.clientY-a.y;if(ht.set(e.pointerId,{x:e.clientX,y:e.clientY}),Q){if(ht.size>=2){const[C,O]=[...ht.values()],q=Math.hypot(C.x-O.x,C.y-O.y);$t>0&&q>0&&(wn==="third"?On=Math.min(ha,Math.max(da,On*($t/q))):sn=Math.min(la,Math.max(ca,sn*($t/q)))),$t=q,cn+=Math.abs(s)+Math.abs(h)+10;return}cn+=Math.abs(s)+Math.abs(h);const x=sn/Eo;Fe-=s*.004*x,pt=Math.min(1.15,Math.max(-1.05,pt-h*.0035*x)),Math.abs(s)+Math.abs(h)>2&&(Xn=1.4);return}if(Ht=performance.now(),ht.size===1)cn+=Math.abs(s)+Math.abs(h),be.theta-=s*.006,be.phi=Math.min(2.9,Math.max(.2,be.phi-h*.006)),bt=null,Wt=null;else if(ht.size===2){const[x,C]=[...ht.values()],O=Math.hypot(x.x-C.x,x.y-C.y);$t>0&&(Se.radius=Sa(Se.radius*($t/O))),$t=O,cn+=10}},po=e=>{const a=Go.get(e.pointerId),s=fo;if(Go.delete(e.pointerId),ht.delete(e.pointerId),$t=0,ht.size===0&&(fo=!1),Q){(a?Math.hypot(e.clientX-a.x,e.clientY-a.y):1/0)<12&&!s&&ht.size===0&&Lo();return}if(cn<6&&o.onPick){const h=r.getBoundingClientRect();wa.set((e.clientX-h.left)/h.width*2-1,-((e.clientY-h.top)/h.height)*2+1),ya.setFromCamera(wa,d);const C=ya.intersectObjects([...Ie.values(),...nt.values()],!1)[0]?.object.name;C&&Ie.has(C)?o.onPick(C):C&&nt.has(C)&&o.onExtra?.(C)}},ba=e=>{if(Q){e.preventDefault(),wn==="third"?On=Math.min(ha,Math.max(da,On*(e.deltaY>0?1.1:.9))):sn=Math.min(la,Math.max(ca,sn*(e.deltaY>0?1.1:.9)));return}e.preventDefault(),Se.radius=Sa(Se.radius*(e.deltaY>0?1.12:.89))};function Sa(e){return ve!=="system"?Math.min(zn[ve]*2.2,Math.max(zn[ve]*.15,e)):Math.min(90,Math.max(et==="system"&&!ft?4:.15,e))}const za=e=>{if(!Q)return;const a=e.target;if(a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"||a.isContentEditable))return;const s=e.key.toLowerCase();if(e.code==="KeyE"||e.code==="KeyF"||s==="e"||s==="f"){if(e.repeat||vn<Cn)return;e.preventDefault(),Lo();return}(s===" "||s==="spacebar"||s==="w"||s==="a"||s==="s"||s==="d"||s.startsWith("arrow"))&&(e.preventDefault(),Tt.add(s==="spacebar"?" ":s),(s===" "||s==="spacebar")&&(yn=!0))},Pa=e=>{const a=e.key.toLowerCase();Tt.delete(a==="spacebar"?" ":a)};window.addEventListener("keydown",za),window.addEventListener("keyup",Pa),r.addEventListener("pointerdown",Ma),r.addEventListener("pointermove",xa),r.addEventListener("pointerup",po),r.addEventListener("pointercancel",po),r.addEventListener("wheel",ba,{passive:!1});let qt=null,mo=null,Bo=!matchMedia("(prefers-reduced-motion: reduce)").matches,ka=0,Ca=0;Bo&&(qt=new Xs(p),qt.addPass(new Ys(w,d)),mo=new $s(new eo(256,256),.75,.78,.92),qt.addPass(mo),qt.addPass(new Hs));const ge={w:1,h:1},Aa=()=>{ge.w=t.clientWidth||1,ge.h=t.clientHeight||1,p.setSize(ge.w,ge.h,!1),qt?.setSize(ge.w,ge.h),mo?.resolution.set(ge.w/2,ge.h/2),d.aspect=ge.w/ge.h,d.updateProjectionMatrix()};Aa();const Ta=new ResizeObserver(Aa);Ta.observe(t);let Da=!0;const Ea=new IntersectionObserver(e=>{Da=e.some(a=>a.isIntersecting)});Ea.observe(t);const j=new F,xn=new F,Nn=new F,Oo=new F,zs=new F,Ps=new F,ks=new F,Cs=new F,Ra=new F,As=new F;let Vo=0,Ia=performance.now(),jo=-1e9,Na=0;const Fa=e=>{Vo=requestAnimationFrame(Fa);const a=Math.min(.1,(e-Ia)/1e3);if(Ia=e,document.hidden||!Da)return;if(Q){Ss(e/1e3,a);return}if(io||(ao.uniforms.time.value=e/1e3),!io){for(const l of T)l.uniforms.time.value=e/1e3;for(const l of Z)l.uniforms.uTime.value=e/1e3}e-Ht>3e3&&!io&&!bt&&!ra&&!Sn&&ve!=="eclipse"&&ve!=="sizes"&&(be.theta+=a*(et==="system"?.03:.08)),Ft?.rotateY(a*.01);for(const[l,M]of Ie){if(l==="earth"||l==="moon"||Wt&&l===et)continue;const E=Zn(l).spinHours;io||M.rotateY(a*(l==="sun"?.02:E?.12*(24/E)*.25:.12))}un&&(un.visible=d.position.length()>4);for(const l of D)l.material.uniforms.uDays.value=(ue-Lr)/864e5,l.material.uniforms.uTime.value=e/1e3;for(const l of H){const M=Ie.get(l.parent);M&&l.mesh.material.uniforms.planetCenter.value.copy(M.getWorldPosition(j))}for(const l of R)l.mesh.getWorldPosition(j),l.material.uniforms.ringCenter.value.copy(j),l.material.uniforms.ringNormal.value.set(0,1,0).transformDirection(l.mesh.matrixWorld).normalize();if(G&&e-Na>1e3&&(Na=e,ue=Date.now(),u(ue)),ee){const l=ae.get(ee.id),M=l.points.length,E=l.times[M-1],U=(l.frame==="earth"?6:25)*864e5,me=l.marks.some(qe=>qe.at!==void 0&&qe.body&&qe.body!=="earth"&&Math.abs(ee.sim-qe.at)<U)?"slow":ee.sim>=ee.fastFrom?"fast":"normal",we=me==="slow"?Math.min(ee.base,2*U/3):ee.base*(me==="fast"?ee.fast:1);ee.sim=Math.min(E,ee.sim+we*Math.min(a,.1)),l.frame==="sun"?kt=(kt??ee.sim)+Math.min(a,.1)*.15*864e5:kt=null,ee.pace=me;const Le=(ee.sim-l.times[0])/(E-l.times[0]||1);let xe=0,We=M-1;for(;We-xe>1;){const qe=xe+We>>1;l.times[qe]<=ee.sim?xe=qe:We=qe}const De=l.times[We]-l.times[xe],Ve=xe+(De>0?(ee.sim-l.times[xe])/De:0),Ke=Math.max(0,Math.min(M-2,Math.floor(Ve))),Dt=Ve-Ke;l.probe.position.lerpVectors(l.points[Ke],l.points[Ke+1],Dt),Mt=Ve,l.probe.lookAt(l.line.localToWorld(l.points[Math.min(M-1,Ke+2)].clone())),l.line.geometry.setDrawRange(0,Ke+2);const Et=l.times[Ke]+(l.times[Ke+1]-l.times[Ke])*Dt;G=!1,ue=Et,u(Et);let Rt=0;for(let qe=0;qe<l.marks.length;qe+=1){const Yn=l.marks[qe],$n=Yn.at??l.times[Math.min(M-1,Yn.index)];ee.sim>=$n-U&&(Rt=qe)}if((Rt!==ee.mark||e-ee.lastPing>250||ee.sim>=E&&!ee.done)&&(ee.mark=Rt,ee.lastPing=e,ee.sim>=E&&(ee.done=!0),o.onFlight?.({id:ee.id,mark:l.marks[Rt],progress:Le,time:Et,done:ee.done,pace:ee.pace})),ee.done){const qe=l.frame==="earth";ee=null,kt=null,G=!0,ft=qe?$e.get("earth")??null:null,qe||Se.target.set(0,0,0),Se.radius=qe?4.2:72,be.phi=qe?.7:.45}}if(ft&&Se.target.copy(ft.getWorldPosition(j)),ee){const l=ae.get(ee.id);let M=null,E=1/0;for(const ne of l.marks){if(!ne.body||ne.body==="earth"||ne.body==="far")continue;const me=Math.abs(ne.index-Mt);me<14&&me<E&&(M=ne,E=me)}const U=M?$e.get(M.body):void 0;if(U){const ne=U.getWorldPosition(ks).add(l.probe.getWorldPosition(Cs)).multiplyScalar(.5);Se.target.copy(ne),Se.radius=l.frame==="earth"?1.6:4.2}else Se.radius=l.frame==="earth"?1.5:2.8}if(Pn.lerp(Se.target,1-Math.pow(.002,a)),be.radius+=(Se.radius-be.radius)*(1-Math.pow(.004,a)),bt&&Wt){const l=Ie.get(et)?.getWorldPosition(Ra)??Ra.set(0,0,0);bt.copy(Wt.getWorldPosition(As).sub(l).normalize());const M=Math.atan2(bt.x,bt.z),E=Math.acos(Math.max(-1,Math.min(1,bt.y)));let U=M-be.theta;U=Math.atan2(Math.sin(U),Math.cos(U)),be.theta+=U*(1-Math.pow(.01,a)),be.phi+=(E-be.phi)*(1-Math.pow(.01,a))}if(ve==="blackhole"&&an.update(e/1e3,d),ve==="exo"){const l=e/1e3;for(const M of Yt){const E=M.phase0+l/M.period*Math.PI*2;M.mesh.position.set(Math.cos(E)*M.a,0,Math.sin(E)*M.a)}}if(ve==="eclipse"){on=(on+a*.18)%1;const l=Math.sin(on*Math.PI*2),M=Math.abs(l)<.22,E=Math.max(0,1-Math.abs(l)/.9),U=ut==="lunar";if(Pe.visible=!je,ot.visible=je,ce.skySun.visible=!U,ce.skyMoon.visible=U,je)U?(ce.skyMoon.position.set(l*1.7,0,.08),ce.skyMoonMat.color.set("#f2f2f2").lerp(new V("#c47462"),U?E:0)):ce.skyCover.position.set(l*1.7,0,.08);else{ce.moon.position.set(U?2.75:1.05,l*.55,0),ce.cone.visible=!U,ce.umbra.visible=U,ce.shadow.opacity=M?.42:.08,ce.umbra.material.opacity=M?.42:.08,ce.moonMat.color.set("#ffffff").lerp(new V("#c47462"),U?E:0);const ne=M?L("개기"):Math.abs(l)<.6?L("부분"):U?L("반영"):"";de.textContent!==ne&&(de.textContent=ne)}}if(d.position.set(Pn.x+be.radius*Math.sin(be.phi)*Math.sin(be.theta),Pn.y+be.radius*Math.cos(be.phi),Pn.z+be.radius*Math.sin(be.phi)*Math.cos(be.theta)),d.lookAt(Pn),X&&(X.getWorldPosition(j),i.copy(j).multiplyScalar(-1).normalize(),e-jo>500&&!(ee&&ae.get(ee.id)?.frame==="sun"))){jo=e;const l=sr(new Date(ue)),M=Math.atan2(l.y,l.x),E=Math.atan2(-i.z,i.x),U=X.children[0];U.rotation.y=E-M}qt&&Bo&&ve!=="blackhole"&&(ve!=="system"||et==="system"||et==="sun")&&qt?(qt.render(a),ka+=1,Ca+=a,ka===90&&Ca/90>.034&&(Bo=!1)):p.render(w,d),d.getWorldDirection(xn),b();const x=[];for(const l of mn){const M=Nt.get(l),E=$e.get(l);if(!M||!E)continue;E.getWorldPosition(j);const U=Nn.copy(j).sub(d.position).dot(xn)>0,ne=et==="system"&&ve==="system"&&(!ft||ee!==null),me=et==="earth"||et==="moon"||ee!==null&&ae.get(ee.id)?.frame==="earth";let we=U&&(l==="moon"?ve==="system"&&me:ne||me&&l==="earth"&&ee!==null);j.project(d);const Le=(j.x+1)/2*ge.w;let xe=Le;const We=(1-j.y)/2*ge.h+10;if(we){let De=so.get(l)??0;De||(M.style.display="block",De=M.offsetWidth||40,so.set(l,De)),xe=Math.min(Math.max(Le,De/2+4),Math.max(De/2+4,ge.w-De/2-4));const Ve={x:xe-De/2,y:We,w:De,h:22};P(Ve.x,Ve.y,Ve.w,Ve.h)||x.some(Ke=>Ve.x<Ke.x+Ke.w+4&&Ve.x+Ve.w+4>Ke.x&&Ve.y<Ke.y+Ke.h&&Ve.y+Ve.h>Ke.y)?we=!1:x.push(Ve)}M.style.display=we?"block":"none",we&&(M.style.transform=`translate(${xe}px, ${We}px) translate(-50%, 0)`)}const C=ve==="system",O=et!=="system"&&et!=="jupiter"&&et!=="saturn",q=ft!==null&&(ee===null?ft===$e.get("earth"):ae.get(ee.id)?.frame==="earth");for(const l of fn)l.visible=!O&&!q;for(const[l,M]of vt){const E=Me.get(l),U=M.parent?$e.get(M.parent)===ft:et==="system"&&(!ft||ft===E),ne=ft===E||U;E.getWorldPosition(j);const me=Nn.copy(j).sub(d.position).dot(xn)>0,we=C&&me&&ne;j.project(d),M.el.style.display=we?"block":"none",we&&(M.el.style.transform=`translate(${(j.x+1)/2*ge.w}px, ${(1-j.y)/2*ge.h+8}px) translate(-50%, 0)`)}for(const[l,M]of ae){const E=C&&N===l;if(M.line.visible=E,!E){M.el.style.display="none";continue}M.probe.getWorldPosition(j);const U=Nn.copy(j).sub(d.position).dot(xn)>0;j.y+=0,j.project(d),M.el.style.display=U?"block":"none",U&&(M.el.style.transform=`translate(${(j.x+1)/2*ge.w}px, ${(1-j.y)/2*ge.h}px) translate(10px, -50%)`)}for(const l of sa){if(ve!=="stars"){l.el.style.display="none";continue}j.copy(l.at);const M=Nn.copy(j).sub(d.position).dot(xn)>0;j.project(d);const E=M&&Math.abs(j.x)<1&&Math.abs(j.y)<1;l.el.style.display=E?"block":"none",E&&(l.el.style.transform=`translate(${(j.x+1)/2*ge.w}px, ${(1-j.y)/2*ge.h}px) translate(-50%, -50%)`)}for(const l of Do){if(!(l.level===ve)){l.el.style.display="none";continue}j.copy(l.marker.position);const E=Nn.copy(j).sub(d.position).dot(xn)>0;j.project(d),l.el.style.display=E?"block":"none",E&&(l.el.style.transform=`translate(${(j.x+1)/2*ge.w}px, ${(1-j.y)/2*ge.h+8}px) translate(-50%, 0)`)}for(const l of Yt){if(ve!=="exo"){l.el.style.display="none";continue}l.mesh.getWorldPosition(j);const M=Nn.copy(j).sub(d.position).dot(xn)>0;j.project(d),l.el.style.display=M?"block":"none",M&&(l.el.style.transform=`translate(${(j.x+1)/2*ge.w}px, ${(1-j.y)/2*ge.h+8}px) translate(-50%, 0)`)}for(const l of us){if(ve!=="blackhole"){l.el.style.display="none";continue}j.copy(l.at),an.group.localToWorld(j),j.project(d);const M=j.z<1&&Math.abs(j.x)<1.05&&Math.abs(j.y)<1.05;l.el.style.display=M?"block":"none",M&&(l.el.style.transform=`translate(${(j.x+1)/2*ge.w}px, ${(1-j.y)/2*ge.h}px) translate(-50%, -100%)`)}for(const l of hn){if(ve!=="exo"){l.el.style.display="none";continue}j.copy(l.at).project(d);const M=j.z<1&&Math.abs(j.x)<1.05&&Math.abs(j.y)<1.05;l.el.style.display=M?"block":"none",M&&(l.el.style.transform=`translate(${(j.x+1)/2*ge.w}px, ${(1-j.y)/2*ge.h}px) translate(-50%, -100%)`)}for(const[l,M]of[[dn,ve==="eclipse"&&!je],[Xe,ve==="sizes"]])for(const E of l){if(!M){E.el.style.display="none";continue}j.copy(E.at).applyMatrix4(E.group.matrixWorld).project(d);let U=j.z<1&&Math.abs(j.x)<1.1&&Math.abs(j.y)<1.1;const ne=(j.x+1)/2*ge.w,me=(1-j.y)/2*ge.h,we=E.el.offsetWidth||44;U&&P(ne-we/2,me-11,we,22)&&(U=!1),E.el.style.display=U?"block":"none";const Le=E.group.rotation.z!==0;U&&(E.el.style.transform=`translate(${(j.x+1)/2*ge.w}px, ${(1-j.y)/2*ge.h}px) ${Le?"translate(6px, -50%)":"translate(-50%, -100%)"}`)}for(const l of Zt){l.mesh.getWorldPosition(j);const M=Ie.get(l.parent);M?M.getWorldPosition(Oo):Oo.set(0,0,0);let U=zs.copy(j).sub(Oo).normalize().dot(Ps.copy(d.position).sub(j).normalize())>.15&&ve==="system"&&et===l.parent;j.project(d),U&&P((j.x+1)/2*ge.w+8,(1-j.y)/2*ge.h-11,90)&&(U=!1),l.el.style.display=U?"block":"none",U&&(l.el.style.transform=`translate(${(j.x+1)/2*ge.w}px, ${(1-j.y)/2*ge.h}px) translate(8px, -50%)`)}};return Vo=requestAnimationFrame(Fa),he===0&&o.onReady?.(),typeof window<"u"&&location.search.includes("surfdebug")&&(window.__surfDebug=()=>({surf:Q?{shock:Q.impact.sinceImpact(),doom:Q.impact.doom(),flash:Q.impact.flash(),shake:Q.impact.shake(),stats:Q.impact.stats()}:null,x:Number(Be.toFixed(2)),z:Number(Oe.toFixed(2)),y:Number(d.position.y.toFixed(2)),yaw:Number(Fe.toFixed(2)),pitch:Number(pt.toFixed(2)),jump:Number(Dn.toFixed(2)),knock:[Number(Rn.toFixed(2)),Number(In.toFixed(2))],mode:wn,alt:Number(kn.toFixed(2))})),{focus:ia,setLevel:co,setPaused:e=>{ra=e},focusMarker:e=>{const a=Do.find(s=>s.level===ve&&s.marker.id===e);a&&(Se.target.copy(a.marker.position),Se.radius=zn[ve]*(e==="cmb"?1.4:ve==="group"?.6:.42),Ht=performance.now())},showSite:ps,focusExtra:fs,setEclipse:(e,a)=>{ut=e,je=a,co("eclipse")},setHemisphere:e=>{et!=="earth"&&ia("earth");const a=i.clone().multiplyScalar(e==="day"?1:-1);be.theta=Math.atan2(a.x,a.z),be.phi=Math.min(2.6,Math.max(.5,Math.acos(a.y))),bt=null,Wt=null,Sn=!0},enterSurface:ga,setSurfaceWorld:vs,exitSurface:gs,setSurfaceMove:(e,a)=>{uo=Math.min(1,Math.max(-1,e)),Wo=Math.min(1,Math.max(-1,a))},jumpSurface:()=>{yn=!0},setSurfaceMode:Ms,setSurfaceSkin:xs,impactSurface:ws,dropProbe:Lo,setTime:e=>{G=e===null,ue=e??Date.now(),u(ue),jo=-1e9},setVoyage:e=>{if(N=e,!e){ee&&(ee=null,G=!0),kt=null;for(const M of ae.values())M.line.geometry.setDrawRange(0,1/0);return}ve!=="system"&&co("system"),kt=null;const a=ae.get(e);a.line.geometry.setDrawRange(0,2),et="system",bt=null,Wt=null,Sn=!1,ft=a.probe;const s=a.frame==="earth";Se.radius=s?1.3:2.8,be.phi=s?.75:1;const h=Math.max(...a.marks.filter(M=>M.at!==void 0&&M.body!=="earth").map(M=>M.at),a.times[0]+864e5),x=a.times[0],C=a.times[a.times.length-1],O=(h-x)/(s?20:24),q=a.frame==="earth"?C:h+60*864e5,l=C>q?(C-q)/4/O:1;ee={id:e,sim:x,base:O,fastFrom:q,fast:l,mark:-1,done:!1,lastPing:0,pace:"normal"},Ht=performance.now()},dispose:()=>{Ho(),yt?.dispose(),qt?.dispose(),mo?.dispose(),Q&&(w.remove(Q.group),Q.dispose(),Q=null),cancelAnimationFrame(Vo),Ta.disconnect(),Ea.disconnect(),window.removeEventListener("keydown",za),window.removeEventListener("keyup",Pa),r.removeEventListener("pointerdown",Ma),r.removeEventListener("pointermove",xa),r.removeEventListener("pointerup",po),r.removeEventListener("pointercancel",po),r.removeEventListener("wheel",ba),w.traverse(e=>{const a=e.material;Array.isArray(a)&&a.forEach(s=>s.dispose())}),k.forEach(e=>e.dispose()),p.dispose(),r.remove(),g.remove()}}}export{fi as createSpace};
