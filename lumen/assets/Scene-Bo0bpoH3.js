import{$ as e,A as t,At as n,B as r,C as i,Ct as a,D as o,Dt as s,E as c,Et as l,F as u,Ft as d,G as f,Gt as p,H as m,Ht as h,I as g,It as _,J as v,K as y,L as b,Lt as x,M as S,Mt as C,N as w,Nt as ee,O as te,Ot as T,P as ne,Pt as E,Q as D,R as re,Rt as O,S as k,St as ie,T as ae,Tt as oe,U as se,Ut as A,V as ce,Vt as j,W as le,Wt as M,X as N,Y as ue,Z as de,_ as fe,_t as pe,a as me,at as he,b as ge,bt as _e,c as ve,ct as ye,d as be,dt as xe,et as Se,f as Ce,ft as we,g as Te,gt as Ee,h as De,ht as Oe,i as ke,it as Ae,j as je,jt as P,k as Me,kt as F,l as Ne,lt as Pe,m as Fe,mt as Ie,n as Le,nt as Re,o as ze,ot as Be,p as Ve,pt as He,q as Ue,r as We,rt as I,s as Ge,st as L,tt as Ke,u as qe,ut as Je,v as R,vt as Ye,w as Xe,wt as Ze,x as Qe,xt as $e,y as z,yt as et,z as tt,zt as nt}from"./routes-DrRsATLt.js";import{a as rt,c as it,o as at,r as ot}from"./index-ZcPNNM4n.js";var B=it(at(),1);function st(e,t){let n;return(...r)=>{window.clearTimeout(n),n=window.setTimeout(()=>e(...r),t)}}function ct({debounce:e,scroll:t,polyfill:n,offsetSize:r}={debounce:0,scroll:!1,offsetSize:!1}){let i=n||(typeof window>`u`?class{}:window.ResizeObserver);if(!i)throw Error(`This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills`);let[a,o]=(0,B.useState)({left:0,top:0,width:0,height:0,bottom:0,right:0,x:0,y:0}),s=(0,B.useRef)({element:null,scrollContainers:null,resizeObserver:null,lastBounds:a,orientationHandler:null}),c=e?typeof e==`number`?e:e.scroll:null,l=e?typeof e==`number`?e:e.resize:null,u=(0,B.useRef)(!1);(0,B.useEffect)(()=>(u.current=!0,()=>void(u.current=!1)));let[d,f,p]=(0,B.useMemo)(()=>{let e=()=>{if(!s.current.element)return;let{left:e,top:t,width:n,height:i,bottom:a,right:c,x:l,y:d}=s.current.element.getBoundingClientRect(),f={left:e,top:t,width:n,height:i,bottom:a,right:c,x:l,y:d};s.current.element instanceof HTMLElement&&r&&(f.height=s.current.element.offsetHeight,f.width=s.current.element.offsetWidth),Object.freeze(f),u.current&&!pt(s.current.lastBounds,f)&&o(s.current.lastBounds=f)};return[e,l?st(e,l):e,c?st(e,c):e]},[o,r,c,l]);function m(){s.current.scrollContainers&&(s.current.scrollContainers.forEach(e=>e.removeEventListener(`scroll`,p,!0)),s.current.scrollContainers=null),s.current.resizeObserver&&(s.current.resizeObserver.disconnect(),s.current.resizeObserver=null),s.current.orientationHandler&&(`orientation`in screen&&`removeEventListener`in screen.orientation?screen.orientation.removeEventListener(`change`,s.current.orientationHandler):`onorientationchange`in window&&window.removeEventListener(`orientationchange`,s.current.orientationHandler))}function h(){s.current.element&&(s.current.resizeObserver=new i(p),s.current.resizeObserver.observe(s.current.element),t&&s.current.scrollContainers&&s.current.scrollContainers.forEach(e=>e.addEventListener(`scroll`,p,{capture:!0,passive:!0})),s.current.orientationHandler=()=>{p()},`orientation`in screen&&`addEventListener`in screen.orientation?screen.orientation.addEventListener(`change`,s.current.orientationHandler):`onorientationchange`in window&&window.addEventListener(`orientationchange`,s.current.orientationHandler))}return ut(p,!!t),lt(f),(0,B.useEffect)(()=>{m(),h()},[t,p,f]),(0,B.useEffect)(()=>m,[]),[e=>{!e||e===s.current.element||(m(),s.current.element=e,s.current.scrollContainers=dt(e),h())},a,d]}function lt(e){(0,B.useEffect)(()=>{let t=e;return window.addEventListener(`resize`,t),()=>void window.removeEventListener(`resize`,t)},[e])}function ut(e,t){(0,B.useEffect)(()=>{if(t){let t=e;return window.addEventListener(`scroll`,t,{capture:!0,passive:!0}),()=>void window.removeEventListener(`scroll`,t,!0)}},[e,t])}function dt(e){let t=[];if(!e||e===document.body)return t;let{overflow:n,overflowX:r,overflowY:i}=window.getComputedStyle(e);return[n,r,i].some(e=>e===`auto`||e===`scroll`)&&t.push(e),[...t,...dt(e.parentElement)]}var ft=[`x`,`y`,`top`,`bottom`,`left`,`right`,`width`,`height`],pt=(e,t)=>ft.every(n=>e[n]===t[n]),V=ot();rt();function mt({ref:t,children:n,fallback:i,resize:a,style:o,gl:s,events:c=r,eventSource:l,eventPrefix:u,shadows:d,linear:f,flat:p,legacy:h,orthographic:g,frameloop:_,dpr:v,performance:b,raycaster:x,camera:S,scene:C,onPointerMissed:w,onCreated:ee,...te}){B.useMemo(()=>m(e),[]);let T=le(),[ne,E]=ct({scroll:!0,debounce:{scroll:50,resize:0},...a}),D=B.useRef(null),O=B.useRef(null);B.useImperativeHandle(t,()=>D.current);let k=ue(w),ie=B.useCallback(e=>k.current==null?void 0:k.current(e),[k]),[ae,oe]=B.useState(!1),[A,j]=B.useState(!1);if(ae)throw ae;if(A)throw A;let M=B.useRef(null),[N,de]=y(),fe=B.useRef(null),pe=()=>l?se(l)?l.current:l:O.current;return B.useInsertionEffect(()=>()=>{let e=M.current;M.current=null,e?.unmount()},[]),Ue(()=>{let e=D.current;E.width>0&&E.height>0&&e&&(M.current||=ce(e),M.current.configure({gl:s,scene:C,events:c,shadows:d,linear:f,flat:p,legacy:h,orthographic:g,frameloop:_,dpr:v,performance:b,raycaster:x,camera:S,size:E,onPointerMissed:ie,onCreated:e=>{fe.current=e,e.events.connect==null||e.events.connect(pe()??O.current),u&&e.setEvents({compute:(e,t)=>{let n=e[u+`X`],r=e[u+`Y`];t.pointer.set(n/t.size.width*2-1,-(r/t.size.height)*2+1),t.raycaster.setFromCamera(t.pointer,t.camera)}}),ee?.(e)}}).catch(j),M.current.ready.status===`fulfilled`?M.current.render((0,V.jsx)(T,{children:(0,V.jsx)(tt,{set:j,children:(0,V.jsx)(B.Suspense,{fallback:(0,V.jsx)(re,{set:oe}),children:n??null})})})):M.current.ready.status===`pending`&&de(M.current.ready))}),B.useEffect(()=>{let e=fe.current?.get(),t=pe();e&&t&&e.events.connected!==t&&(e.events.connect==null||e.events.connect(t))}),B.useEffect(()=>{let e=D.current;return()=>{var t;e.isConnected||(t=M.current)==null||t.unmount()}},[]),(0,V.jsxs)(`div`,{ref:O,style:{position:`relative`,width:`100%`,height:`100%`,overflow:`hidden`,pointerEvents:l?`none`:`auto`,...o},...te,children:[(0,V.jsx)(`div`,{ref:ne,style:{width:`100%`,height:`100%`},children:(0,V.jsx)(`canvas`,{ref:D,style:{display:`block`},children:i})}),N]})}function ht(e){return(0,V.jsx)(de,{children:(0,V.jsx)(mt,{...e})})}var gt=parseInt(`187`.replace(/\D+/g,``)),_t=gt>=125?`uv1`:`uv2`,vt=Object.defineProperty,yt=(e,t,n)=>t in e?vt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,bt=(e,t,n)=>(yt(e,typeof t==`symbol`?t:t+``,n),n),xt=class{constructor(){bt(this,`_listeners`)}addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let n=this._listeners[e];if(n!==void 0){let e=n.indexOf(t);e!==-1&&n.splice(e,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let t=this._listeners[e.type];if(t!==void 0){e.target=this;let n=t.slice(0);for(let t=0,r=n.length;t<r;t++)n[t].call(this,e);e.target=null}}},St=Object.defineProperty,Ct=(e,t,n)=>t in e?St(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,H=(e,t,n)=>(Ct(e,typeof t==`symbol`?t:t+``,n),n),wt=new T,Tt=new oe,Et=Math.cos(Math.PI/180*70),Dt=(e,t)=>(e%t+t)%t,Ot=class extends xt{constructor(e,t){super(),H(this,`object`),H(this,`domElement`),H(this,`enabled`,!0),H(this,`target`,new h),H(this,`minDistance`,0),H(this,`maxDistance`,1/0),H(this,`minZoom`,0),H(this,`maxZoom`,1/0),H(this,`minPolarAngle`,0),H(this,`maxPolarAngle`,Math.PI),H(this,`minAzimuthAngle`,-1/0),H(this,`maxAzimuthAngle`,1/0),H(this,`enableDamping`,!1),H(this,`dampingFactor`,.05),H(this,`enableZoom`,!0),H(this,`zoomSpeed`,1),H(this,`enableRotate`,!0),H(this,`rotateSpeed`,1),H(this,`enablePan`,!0),H(this,`panSpeed`,1),H(this,`screenSpacePanning`,!0),H(this,`keyPanSpeed`,7),H(this,`zoomToCursor`,!1),H(this,`autoRotate`,!1),H(this,`autoRotateSpeed`,2),H(this,`reverseOrbit`,!1),H(this,`reverseHorizontalOrbit`,!1),H(this,`reverseVerticalOrbit`,!1),H(this,`keys`,{LEFT:`ArrowLeft`,UP:`ArrowUp`,RIGHT:`ArrowRight`,BOTTOM:`ArrowDown`}),H(this,`mouseButtons`,{LEFT:Ye.ROTATE,MIDDLE:Ye.DOLLY,RIGHT:Ye.PAN}),H(this,`touches`,{ONE:E.ROTATE,TWO:E.DOLLY_PAN}),H(this,`target0`),H(this,`position0`),H(this,`zoom0`),H(this,`_domElementKeyEvents`,null),H(this,`getPolarAngle`),H(this,`getAzimuthalAngle`),H(this,`setPolarAngle`),H(this,`setAzimuthalAngle`),H(this,`getDistance`),H(this,`getZoomScale`),H(this,`listenToKeyEvents`),H(this,`stopListenToKeyEvents`),H(this,`saveState`),H(this,`reset`),H(this,`update`),H(this,`connect`),H(this,`dispose`),H(this,`dollyIn`),H(this,`dollyOut`),H(this,`getScale`),H(this,`setScale`),this.object=e,this.domElement=t,this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this.getPolarAngle=()=>d.phi,this.getAzimuthalAngle=()=>d.theta,this.setPolarAngle=e=>{let t=Dt(e,2*Math.PI),r=d.phi;r<0&&(r+=2*Math.PI),t<0&&(t+=2*Math.PI);let i=Math.abs(t-r);2*Math.PI-i<i&&(t<r?t+=2*Math.PI:r+=2*Math.PI),f.phi=t-r,n.update()},this.setAzimuthalAngle=e=>{let t=Dt(e,2*Math.PI),r=d.theta;r<0&&(r+=2*Math.PI),t<0&&(t+=2*Math.PI);let i=Math.abs(t-r);2*Math.PI-i<i&&(t<r?t+=2*Math.PI:r+=2*Math.PI),f.theta=t-r,n.update()},this.getDistance=()=>n.object.position.distanceTo(n.target),this.listenToKeyEvents=e=>{e.addEventListener(`keydown`,Ne),this._domElementKeyEvents=e},this.stopListenToKeyEvents=()=>{this._domElementKeyEvents.removeEventListener(`keydown`,Ne),this._domElementKeyEvents=null},this.saveState=()=>{n.target0.copy(n.target),n.position0.copy(n.object.position),n.zoom0=n.object.zoom},this.reset=()=>{n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),n.dispatchEvent(r),n.update(),l=c.NONE},this.update=(()=>{let t=new h,i=new h(0,1,0),o=new s().setFromUnitVectors(e.up,i),g=o.clone().invert(),_=new h,v=new s,y=2*Math.PI;return function(){let s=n.object.position;o.setFromUnitVectors(e.up,i),g.copy(o).invert(),t.copy(s).sub(n.target),t.applyQuaternion(o),d.setFromVector3(t),n.autoRotate&&l===c.NONE&&ie(O()),n.enableDamping?(d.theta+=f.theta*n.dampingFactor,d.phi+=f.phi*n.dampingFactor):(d.theta+=f.theta,d.phi+=f.phi);let b=n.minAzimuthAngle,x=n.maxAzimuthAngle;isFinite(b)&&isFinite(x)&&(b<-Math.PI?b+=y:b>Math.PI&&(b-=y),x<-Math.PI?x+=y:x>Math.PI&&(x-=y),b<=x?d.theta=Math.max(b,Math.min(x,d.theta)):d.theta=d.theta>(b+x)/2?Math.max(b,d.theta):Math.min(x,d.theta)),d.phi=Math.max(n.minPolarAngle,Math.min(n.maxPolarAngle,d.phi)),d.makeSafe(),n.enableDamping===!0?n.target.addScaledVector(m,n.dampingFactor):n.target.add(m),n.zoomToCursor&&ne||n.object.isOrthographicCamera?d.radius=ue(d.radius):d.radius=ue(d.radius*p),t.setFromSpherical(d),t.applyQuaternion(g),s.copy(n.target).add(t),n.object.matrixAutoUpdate||n.object.updateMatrix(),n.object.lookAt(n.target),n.enableDamping===!0?(f.theta*=1-n.dampingFactor,f.phi*=1-n.dampingFactor,m.multiplyScalar(1-n.dampingFactor)):(f.set(0,0,0),m.set(0,0,0));let S=!1;if(n.zoomToCursor&&ne){let r=null;if(n.object instanceof Ze&&n.object.isPerspectiveCamera){let e=t.length();r=ue(e*p);let i=e-r;n.object.position.addScaledVector(te,i),n.object.updateMatrixWorld()}else if(n.object.isOrthographicCamera){let e=new h(T.x,T.y,0);e.unproject(n.object),n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/p)),n.object.updateProjectionMatrix(),S=!0;let i=new h(T.x,T.y,0);i.unproject(n.object),n.object.position.sub(i).add(e),n.object.updateMatrixWorld(),r=t.length()}else console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.`),n.zoomToCursor=!1;r!==null&&(n.screenSpacePanning?n.target.set(0,0,-1).transformDirection(n.object.matrix).multiplyScalar(r).add(n.object.position):(wt.origin.copy(n.object.position),wt.direction.set(0,0,-1).transformDirection(n.object.matrix),Math.abs(n.object.up.dot(wt.direction))<Et?e.lookAt(n.target):(Tt.setFromNormalAndCoplanarPoint(n.object.up,n.target),wt.intersectPlane(Tt,n.target))))}else n.object instanceof a&&n.object.isOrthographicCamera&&(S=p!==1,S&&(n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/p)),n.object.updateProjectionMatrix()));return p=1,ne=!1,S||_.distanceToSquared(n.object.position)>u||8*(1-v.dot(n.object.quaternion))>u?(n.dispatchEvent(r),_.copy(n.object.position),v.copy(n.object.quaternion),S=!1,!0):!1}})(),this.connect=e=>{n.domElement=e,n.domElement.style.touchAction=`none`,n.domElement.addEventListener(`contextmenu`,Ie),n.domElement.addEventListener(`pointerdown`,ke),n.domElement.addEventListener(`pointercancel`,je),n.domElement.addEventListener(`wheel`,F)},this.dispose=()=>{var e,t,r,i,a,o;n.domElement&&(n.domElement.style.touchAction=`auto`),(e=n.domElement)==null||e.removeEventListener(`contextmenu`,Ie),(t=n.domElement)==null||t.removeEventListener(`pointerdown`,ke),(r=n.domElement)==null||r.removeEventListener(`pointercancel`,je),(i=n.domElement)==null||i.removeEventListener(`wheel`,F),(a=n.domElement)==null||a.ownerDocument.removeEventListener(`pointermove`,Ae),(o=n.domElement)==null||o.ownerDocument.removeEventListener(`pointerup`,je),n._domElementKeyEvents!==null&&n._domElementKeyEvents.removeEventListener(`keydown`,Ne)};let n=this,r={type:`change`},i={type:`start`},o={type:`end`},c={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},l=c.NONE,u=1e-6,d=new ee,f=new ee,p=1,m=new h,g=new j,_=new j,v=new j,y=new j,b=new j,x=new j,S=new j,C=new j,w=new j,te=new h,T=new j,ne=!1,D=[],re={};function O(){return 2*Math.PI/60/60*n.autoRotateSpeed}function k(){return .95**n.zoomSpeed}function ie(e){n.reverseOrbit||n.reverseHorizontalOrbit?f.theta+=e:f.theta-=e}function ae(e){n.reverseOrbit||n.reverseVerticalOrbit?f.phi+=e:f.phi-=e}let oe=(()=>{let e=new h;return function(t,n){e.setFromMatrixColumn(n,0),e.multiplyScalar(-t),m.add(e)}})(),se=(()=>{let e=new h;return function(t,r){n.screenSpacePanning===!0?e.setFromMatrixColumn(r,1):(e.setFromMatrixColumn(r,0),e.crossVectors(n.object.up,e)),e.multiplyScalar(t),m.add(e)}})(),A=(()=>{let e=new h;return function(t,r){let i=n.domElement;if(i&&n.object instanceof Ze&&n.object.isPerspectiveCamera){let a=n.object.position;e.copy(a).sub(n.target);let o=e.length();o*=Math.tan(n.object.fov/2*Math.PI/180),oe(2*t*o/i.clientHeight,n.object.matrix),se(2*r*o/i.clientHeight,n.object.matrix)}else i&&n.object instanceof a&&n.object.isOrthographicCamera?(oe(t*(n.object.right-n.object.left)/n.object.zoom/i.clientWidth,n.object.matrix),se(r*(n.object.top-n.object.bottom)/n.object.zoom/i.clientHeight,n.object.matrix)):(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.`),n.enablePan=!1)}})();function ce(e){n.object instanceof Ze&&n.object.isPerspectiveCamera||n.object instanceof a&&n.object.isOrthographicCamera?p=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),n.enableZoom=!1)}function le(e){ce(p/e)}function M(e){ce(p*e)}function N(e){if(!n.zoomToCursor||!n.domElement)return;ne=!0;let t=n.domElement.getBoundingClientRect(),r=e.clientX-t.left,i=e.clientY-t.top,a=t.width,o=t.height;T.x=r/a*2-1,T.y=-(i/o)*2+1,te.set(T.x,T.y,1).unproject(n.object).sub(n.object.position).normalize()}function ue(e){return Math.max(n.minDistance,Math.min(n.maxDistance,e))}function de(e){g.set(e.clientX,e.clientY)}function fe(e){N(e),S.set(e.clientX,e.clientY)}function pe(e){y.set(e.clientX,e.clientY)}function me(e){_.set(e.clientX,e.clientY),v.subVectors(_,g).multiplyScalar(n.rotateSpeed);let t=n.domElement;t&&(ie(2*Math.PI*v.x/t.clientHeight),ae(2*Math.PI*v.y/t.clientHeight)),g.copy(_),n.update()}function he(e){C.set(e.clientX,e.clientY),w.subVectors(C,S),w.y>0?le(k()):w.y<0&&M(k()),S.copy(C),n.update()}function ge(e){b.set(e.clientX,e.clientY),x.subVectors(b,y).multiplyScalar(n.panSpeed),A(x.x,x.y),y.copy(b),n.update()}function _e(e){N(e),e.deltaY<0?M(k()):e.deltaY>0&&le(k()),n.update()}function ve(e){let t=!1;switch(e.code){case n.keys.UP:A(0,n.keyPanSpeed),t=!0;break;case n.keys.BOTTOM:A(0,-n.keyPanSpeed),t=!0;break;case n.keys.LEFT:A(n.keyPanSpeed,0),t=!0;break;case n.keys.RIGHT:A(-n.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),n.update())}function ye(){if(D.length==1)g.set(D[0].pageX,D[0].pageY);else{let e=.5*(D[0].pageX+D[1].pageX),t=.5*(D[0].pageY+D[1].pageY);g.set(e,t)}}function be(){if(D.length==1)y.set(D[0].pageX,D[0].pageY);else{let e=.5*(D[0].pageX+D[1].pageX),t=.5*(D[0].pageY+D[1].pageY);y.set(e,t)}}function xe(){let e=D[0].pageX-D[1].pageX,t=D[0].pageY-D[1].pageY,n=Math.sqrt(e*e+t*t);S.set(0,n)}function Se(){n.enableZoom&&xe(),n.enablePan&&be()}function Ce(){n.enableZoom&&xe(),n.enableRotate&&ye()}function we(e){if(D.length==1)_.set(e.pageX,e.pageY);else{let t=Be(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);_.set(n,r)}v.subVectors(_,g).multiplyScalar(n.rotateSpeed);let t=n.domElement;t&&(ie(2*Math.PI*v.x/t.clientHeight),ae(2*Math.PI*v.y/t.clientHeight)),g.copy(_)}function Te(e){if(D.length==1)b.set(e.pageX,e.pageY);else{let t=Be(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);b.set(n,r)}x.subVectors(b,y).multiplyScalar(n.panSpeed),A(x.x,x.y),y.copy(b)}function Ee(e){let t=Be(e),r=e.pageX-t.x,i=e.pageY-t.y,a=Math.sqrt(r*r+i*i);C.set(0,a),w.set(0,(C.y/S.y)**+n.zoomSpeed),le(w.y),S.copy(C)}function De(e){n.enableZoom&&Ee(e),n.enablePan&&Te(e)}function Oe(e){n.enableZoom&&Ee(e),n.enableRotate&&we(e)}function ke(e){var t,r;n.enabled!==!1&&(D.length===0&&((t=n.domElement)==null||t.ownerDocument.addEventListener(`pointermove`,Ae),(r=n.domElement)==null||r.ownerDocument.addEventListener(`pointerup`,je)),Le(e),e.pointerType===`touch`?Pe(e):P(e))}function Ae(e){n.enabled!==!1&&(e.pointerType===`touch`?Fe(e):Me(e))}function je(e){var t,r,i;Re(e),D.length===0&&((t=n.domElement)==null||t.releasePointerCapture(e.pointerId),(r=n.domElement)==null||r.ownerDocument.removeEventListener(`pointermove`,Ae),(i=n.domElement)==null||i.ownerDocument.removeEventListener(`pointerup`,je)),n.dispatchEvent(o),l=c.NONE}function P(e){let t;switch(e.button){case 0:t=n.mouseButtons.LEFT;break;case 1:t=n.mouseButtons.MIDDLE;break;case 2:t=n.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Ye.DOLLY:if(n.enableZoom===!1)return;fe(e),l=c.DOLLY;break;case Ye.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(n.enablePan===!1)return;pe(e),l=c.PAN}else{if(n.enableRotate===!1)return;de(e),l=c.ROTATE}break;case Ye.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(n.enableRotate===!1)return;de(e),l=c.ROTATE}else{if(n.enablePan===!1)return;pe(e),l=c.PAN}break;default:l=c.NONE}l!==c.NONE&&n.dispatchEvent(i)}function Me(e){if(n.enabled!==!1)switch(l){case c.ROTATE:if(n.enableRotate===!1)return;me(e);break;case c.DOLLY:if(n.enableZoom===!1)return;he(e);break;case c.PAN:if(n.enablePan===!1)return;ge(e)}}function F(e){n.enabled===!1||n.enableZoom===!1||l!==c.NONE&&l!==c.ROTATE||(e.preventDefault(),n.dispatchEvent(i),_e(e),n.dispatchEvent(o))}function Ne(e){n.enabled!==!1&&n.enablePan!==!1&&ve(e)}function Pe(e){switch(ze(e),D.length){case 1:switch(n.touches.ONE){case E.ROTATE:if(n.enableRotate===!1)return;ye(),l=c.TOUCH_ROTATE;break;case E.PAN:if(n.enablePan===!1)return;be(),l=c.TOUCH_PAN;break;default:l=c.NONE}break;case 2:switch(n.touches.TWO){case E.DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;Se(),l=c.TOUCH_DOLLY_PAN;break;case E.DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Ce(),l=c.TOUCH_DOLLY_ROTATE;break;default:l=c.NONE}break;default:l=c.NONE}l!==c.NONE&&n.dispatchEvent(i)}function Fe(e){switch(ze(e),l){case c.TOUCH_ROTATE:if(n.enableRotate===!1)return;we(e),n.update();break;case c.TOUCH_PAN:if(n.enablePan===!1)return;Te(e),n.update();break;case c.TOUCH_DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;De(e),n.update();break;case c.TOUCH_DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Oe(e),n.update();break;default:l=c.NONE}}function Ie(e){n.enabled!==!1&&e.preventDefault()}function Le(e){D.push(e)}function Re(e){delete re[e.pointerId];for(let t=0;t<D.length;t++)if(D[t].pointerId==e.pointerId){D.splice(t,1);return}}function ze(e){let t=re[e.pointerId];t===void 0&&(t=new j,re[e.pointerId]=t),t.set(e.pageX,e.pageY)}function Be(e){let t=e.pointerId===D[0].pointerId?D[1]:D[0];return re[t.pointerId]}this.dollyIn=(e=k())=>{M(e),n.update()},this.dollyOut=(e=k())=>{le(e),n.update()},this.getScale=()=>p,this.setScale=e=>{ce(e),n.update()},this.getZoomScale=()=>k(),t!==void 0&&this.connect(t),this.update()}},kt=new Ke,At=new h,jt=class extends xe{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type=`LineSegmentsGeometry`,this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute(`position`,new L([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute(`uv`,new L([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new we(t,6,1);return this.setAttribute(`instanceStart`,new Ie(n,3,0)),this.setAttribute(`instanceEnd`,new Ie(n,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));let r=new we(n,t*2,1);return this.setAttribute(`instanceColorStart`,new Ie(r,t,0)),this.setAttribute(`instanceColorEnd`,new Ie(r,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new p(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ke);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),kt.setFromBufferAttribute(t),this.boundingBox.union(kt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new C),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let i=0,a=e.count;i<a;i++)At.fromBufferAttribute(e,i),r=Math.max(r,n.distanceToSquared(At)),At.fromBufferAttribute(t,i),r=Math.max(r,n.distanceToSquared(At));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.`,this)}}toJSON(){}applyMatrix(e){return console.warn(`THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().`),this.applyMatrix4(e)}},Mt=class extends jt{constructor(){super(),this.isLineGeometry=!0,this.type=`LineGeometry`}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e,t=3){let n=e.length-t,r=new Float32Array(2*n);if(t===3)for(let i=0;i<n;i+=t)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5];else for(let i=0;i<n;i+=t)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5],r[2*i+6]=e[i+6],r[2*i+7]=e[i+7];return super.setColors(r,t),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}},Nt=class extends P{constructor(e){super({type:`LineMaterial`,uniforms:nt.clone(nt.merge([D.common,D.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new j(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${gt>=154?`colorspace_fragment`:`encodings_fragment`}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA=`1`:delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(e){this.uniforms.diffuse.value=e}},worldUnits:{enumerable:!0,get:function(){return`WORLD_UNITS`in this.defines},set:function(e){e===!0?this.defines.WORLD_UNITS=``:delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(e){this.uniforms.linewidth.value=e}},dashed:{enumerable:!0,get:function(){return`USE_DASH`in this.defines},set(e){!!e!=`USE_DASH`in this.defines&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH=``:delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(e){this.uniforms.dashScale.value=e}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(e){this.uniforms.dashSize.value=e}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(e){this.uniforms.dashOffset.value=e}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(e){this.uniforms.gapSize.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(e){this.uniforms.resolution.value.copy(e)}},alphaToCoverage:{enumerable:!0,get:function(){return`USE_ALPHA_TO_COVERAGE`in this.defines},set:function(e){!!e!=`USE_ALPHA_TO_COVERAGE`in this.defines&&(this.needsUpdate=!0),e===!0?(this.defines.USE_ALPHA_TO_COVERAGE=``,this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}},Pt=new A,Ft=new h,It=new h,U=new A,W=new A,G=new A,Lt=new h,Rt=new $e,K=new Ee,zt=new h,Bt=new Ke,Vt=new C,q=new A,J,Ht;function Ut(e,t,n){return q.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),q.multiplyScalar(1/q.w),q.x=Ht/n.width,q.y=Ht/n.height,q.applyMatrix4(e.projectionMatrixInverse),q.multiplyScalar(1/q.w),Math.abs(Math.max(q.x,q.y))}function Wt(e,t){let n=e.matrixWorld,r=e.geometry,i=r.attributes.instanceStart,a=r.attributes.instanceEnd,o=Math.min(r.instanceCount,i.count);for(let r=0,s=o;r<s;r++){K.start.fromBufferAttribute(i,r),K.end.fromBufferAttribute(a,r),K.applyMatrix4(n);let o=new h,s=new h;J.distanceSqToSegment(K.start,K.end,s,o),s.distanceTo(o)<Ht*.5&&t.push({point:s,pointOnLine:o,distance:J.origin.distanceTo(s),object:e,face:null,faceIndex:r,uv:null,[_t]:null})}}function Gt(e,t,n){let r=t.projectionMatrix,i=e.material.resolution,a=e.matrixWorld,o=e.geometry,s=o.attributes.instanceStart,c=o.attributes.instanceEnd,l=Math.min(o.instanceCount,s.count),u=-t.near;J.at(1,G),G.w=1,G.applyMatrix4(t.matrixWorldInverse),G.applyMatrix4(r),G.multiplyScalar(1/G.w),G.x*=i.x/2,G.y*=i.y/2,G.z=0,Lt.copy(G),Rt.multiplyMatrices(t.matrixWorldInverse,a);for(let t=0,o=l;t<o;t++){if(U.fromBufferAttribute(s,t),W.fromBufferAttribute(c,t),U.w=1,W.w=1,U.applyMatrix4(Rt),W.applyMatrix4(Rt),U.z>u&&W.z>u)continue;if(U.z>u){let e=U.z-W.z,t=(U.z-u)/e;U.lerp(W,t)}else if(W.z>u){let e=W.z-U.z,t=(W.z-u)/e;W.lerp(U,t)}U.applyMatrix4(r),W.applyMatrix4(r),U.multiplyScalar(1/U.w),W.multiplyScalar(1/W.w),U.x*=i.x/2,U.y*=i.y/2,W.x*=i.x/2,W.y*=i.y/2,K.start.copy(U),K.start.z=0,K.end.copy(W),K.end.z=0;let o=K.closestPointToPointParameter(Lt,!0);K.at(o,zt);let l=_e.lerp(U.z,W.z,o),d=l>=-1&&l<=1,f=Lt.distanceTo(zt)<Ht*.5;if(d&&f){K.start.fromBufferAttribute(s,t),K.end.fromBufferAttribute(c,t),K.start.applyMatrix4(a),K.end.applyMatrix4(a);let r=new h,i=new h;J.distanceSqToSegment(K.start,K.end,i,r),n.push({point:i,pointOnLine:r,distance:J.origin.distanceTo(i),object:e,face:null,faceIndex:t,uv:null,[_t]:null})}}}var Kt=class extends ie{constructor(e=new jt,t=new Nt({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type=`LineSegments2`}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)Ft.fromBufferAttribute(t,e),It.fromBufferAttribute(n,e),r[i]=i===0?0:r[i-1],r[i+1]=r[i]+Ft.distanceTo(It);let i=new we(r,2,1);return e.setAttribute(`instanceDistanceStart`,new Ie(i,1,0)),e.setAttribute(`instanceDistanceEnd`,new Ie(i,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;r===null&&!n&&console.error(`LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.`);let i=e.params.Line2===void 0?0:e.params.Line2.threshold||0;J=e.ray;let a=this.matrixWorld,o=this.geometry,s=this.material;Ht=s.linewidth+i,o.boundingSphere===null&&o.computeBoundingSphere(),Vt.copy(o.boundingSphere).applyMatrix4(a);let c;if(c=n?Ht*.5:Ut(r,Math.max(r.near,Vt.distanceToPoint(J.origin)),s.resolution),Vt.radius+=c,J.intersectsSphere(Vt)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),Bt.copy(o.boundingBox).applyMatrix4(a);let l;l=n?Ht*.5:Ut(r,Math.max(r.near,Bt.distanceToPoint(J.origin)),s.resolution),Bt.expandByScalar(l),J.intersectsBox(Bt)!==!1&&(n?Wt(this,t):Gt(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Pt),this.material.uniforms.resolution.value.set(Pt.z,Pt.w))}},qt=class extends Kt{constructor(e=new Mt,t=new Nt({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type=`Line2`}},Jt=B.forwardRef(function({points:e,color:t=16777215,vertexColors:n,linewidth:r,lineWidth:i,segments:a,dashed:o,...s},c){var l;let u=N(e=>e.size),d=B.useMemo(()=>a?new Kt:new qt,[a]),[f]=B.useState(()=>new Nt),p=(n==null||(l=n[0])==null?void 0:l.length)===4?4:3,m=B.useMemo(()=>{let r=a?new jt:new Mt,i=e.map(e=>{let t=Array.isArray(e);return e instanceof h||e instanceof A?[e.x,e.y,e.z]:e instanceof j?[e.x,e.y,0]:t&&e.length===3?[e[0],e[1],e[2]]:t&&e.length===2?[e[0],e[1],0]:e});if(r.setPositions(i.flat()),n){t=16777215;let e=n.map(e=>e instanceof Be?e.toArray():e);r.setColors(e.flat(),p)}return r},[e,a,n,p]);return B.useLayoutEffect(()=>{d.computeLineDistances()},[e,d]),B.useLayoutEffect(()=>{o?f.defines.USE_DASH=``:delete f.defines.USE_DASH,f.needsUpdate=!0},[o,f]),B.useEffect(()=>()=>{m.dispose(),f.dispose()},[m]),B.createElement(`primitive`,b({object:d,ref:c},s),B.createElement(`primitive`,{object:m,attach:`geometry`}),B.createElement(`primitive`,b({object:f,attach:`material`,color:t,vertexColors:!!n,resolution:[u.width,u.height],linewidth:r??i??1,dashed:o,transparent:p===4},s)))}),Yt=e=>e===Object(e)&&!Array.isArray(e)&&typeof e!=`function`;function Y(e,t){let n=N(e=>e.gl),r=v(_,Yt(e)?Object.values(e):e);return(0,B.useLayoutEffect)(()=>{t?.(r)},[t]),(0,B.useEffect)(()=>{if(`initTexture`in n){let e=[];Array.isArray(r)?e=r:r instanceof d?e=[r]:Yt(r)&&(e=Object.values(r)),e.forEach(e=>{e instanceof d&&n.initTexture(e)})}},[n,r]),(0,B.useMemo)(()=>{if(Yt(e)){let t={},n=0;for(let i in e)t[i]=r[n++];return t}return r},[e,r])}Y.preload=e=>v.preload(_,e),Y.clear=e=>v.clear(_,e);var Xt=B.forwardRef(({makeDefault:e,camera:t,regress:n,domElement:r,enableDamping:i=!0,keyEvents:a=!1,onChange:o,onStart:s,onEnd:c,...l},u)=>{let d=N(e=>e.invalidate),p=N(e=>e.camera),m=N(e=>e.gl),h=N(e=>e.events),g=N(e=>e.setEvents),_=N(e=>e.set),v=N(e=>e.get),y=N(e=>e.performance),x=t||p,S=r||h.connected||m.domElement,C=B.useMemo(()=>new Ot(x),[x]);return f(()=>{C.enabled&&C.update()},-1),B.useEffect(()=>(a&&C.connect(a===!0?S:a),C.connect(S),()=>void C.dispose()),[a,S,n,C,d]),B.useEffect(()=>{let e=e=>{d(),n&&y.regress(),o&&o(e)},t=e=>{s&&s(e)},r=e=>{c&&c(e)};return C.addEventListener(`change`,e),C.addEventListener(`start`,t),C.addEventListener(`end`,r),()=>{C.removeEventListener(`start`,t),C.removeEventListener(`end`,r),C.removeEventListener(`change`,e)}},[o,s,c,C,d,g]),B.useEffect(()=>{if(e){let e=v().controls;return _({controls:C}),()=>_({controls:e})}},[e,C]),B.createElement(`primitive`,b({ref:u,object:C,enableDamping:i},l))}),Zt=8;function Qt(){let e=(0,B.useMemo)(()=>new P({transparent:!0,depthWrite:!1,uniforms:{},vertexShader:`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,fragmentShader:`
          varying vec2 vUv;
          void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float r = length(p);
            if (r > 1.0) discard;
            float ang = atan(p.y, p.x);
            float arm = pow(abs(sin(ang * 2.0 - log(max(r, 0.04)) * 5.2)), 10.0);
            float minor = pow(abs(sin(ang * 2.0 + 1.2 - log(max(r, 0.04)) * 5.2)), 18.0);
            float bar = exp(-pow(p.y * 7.5, 2.0)) * exp(-pow(p.x * 1.7, 2.0));
            float heart = exp(-r * 12.0);
            float core = exp(-r * 3.6);
            float disk = exp(-pow(r * 1.35, 2.0));
            float dust = smoothstep(0.12, 0.55, r) * (1.0 - smoothstep(0.72, 0.98, r));
            vec3 color = vec3(0.04, 0.05, 0.1) * disk;
            color += vec3(1.0, 0.9, 0.62) * heart;
            color += vec3(1.0, 0.72, 0.4) * core * 0.42;
            color += vec3(0.95, 0.78, 0.45) * bar * (1.0 - smoothstep(0.0, 0.32, r));
            color += vec3(0.62, 0.72, 0.95) * arm * dust;
            color += vec3(0.85, 0.7, 0.5) * minor * dust * 0.45;
            float alpha = smoothstep(1.0, 0.9, r) * clamp(0.35 + disk * 0.45 + core * 1.2 + arm * 0.9 + bar * 0.8, 0.0, 1.0);
            gl_FragColor = vec4(color, alpha);
          }
        `}),[]),t=(0,B.useMemo)(()=>{let e=3200,t=new Float32Array(e*3);for(let n=0;n<e;n+=1){let e=n%2==0?0:Math.PI,r=.18+Math.random()**.65*.82,i=e+Math.log(r+.08)*5.2+(Math.random()-.5)*.55,a=Math.cos(i)*r,o=Math.sin(i)*r;t[n*3]=a*Zt,t[n*3+1]=(Math.random()-.5)*.18*(1.2-r),t[n*3+2]=o*Zt}let n=new I;return n.setAttribute(`position`,new L(t,3)),n},[]);return(0,B.useEffect)(()=>(S.getState().setBooted(!0),()=>{e.dispose(),t.dispose()}),[e,t]),(0,V.jsxs)(`group`,{rotation:[-1.02,.35,.08],children:[(0,V.jsx)(`mesh`,{material:e,rotation:[-Math.PI/2,0,0],children:(0,V.jsx)(`circleGeometry`,{args:[Zt,96]})}),(0,V.jsx)(`points`,{geometry:t,children:(0,V.jsx)(`pointsMaterial`,{color:`#f7f3ea`,size:.016,sizeAttenuation:!0,transparent:!0,opacity:.9,depthWrite:!1})}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[1.15,24,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#ffbf78`,transparent:!0,opacity:.16,blending:2,depthWrite:!1})]}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[.32,24,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#ffe1a8`,transparent:!0,opacity:.55,blending:2,depthWrite:!1})]}),(0,V.jsxs)(`mesh`,{position:[4.35,.06,1.15],children:[(0,V.jsx)(`sphereGeometry`,{args:[.12,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e4b56a`})]}),(0,V.jsxs)(`mesh`,{position:[4.35,.06,1.15],rotation:[Math.PI/2,0,0],children:[(0,V.jsx)(`ringGeometry`,{args:[.2,.26,32]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e4b56a`,transparent:!0,opacity:.8,side:2})]})]})}var $t=.32,en=new h(1,0,0),tn=new h(0,1,0),nn=new s().setFromAxisAngle(en,$t),rn={body:0,stars:0};function an(e,t,n,r){let i=(90-e)*Math.PI/180,a=(t+180)*Math.PI/180,o=Math.sin(i);return r.set(-n*Math.cos(a)*o,n*Math.cos(i),n*Math.sin(a)*o),r}function on(e,t,n,r){return an(e,t,n,r),rn.body&&r.applyAxisAngle(tn,rn.body),r.applyQuaternion(nn)}function sn(e){return e<768?{cam:new h(1.72,.48,3.55),look:new h(0,0,0)}:{cam:new h(1.9,.66,2.85),look:new h(0,0,0)}}function cn(e){return new P({transparent:!0,depthWrite:!1,uniforms:{warm:{value:e}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      varying vec2 vUv;
      uniform float warm;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float ang = atan(p.y, p.x);
        float arm = pow(abs(sin(ang * 2.0 - log(max(r, 0.04)) * 5.2)), 10.0);
        float heart = exp(-r * 11.0);
        float core = exp(-r * 3.4);
        float disk = exp(-pow(r * 1.35, 2.0));
        vec3 color = vec3(0.05, 0.06, 0.12) * disk;
        color += mix(vec3(0.75, 0.82, 0.98), vec3(1.0, 0.86, 0.55), warm) * heart;
        color += mix(vec3(0.45, 0.55, 0.8), vec3(1.0, 0.7, 0.4), warm) * core * 0.4;
        color += vec3(0.62, 0.72, 0.95) * arm * smoothstep(0.08, 0.3, r);
        float alpha = smoothstep(1.0, 0.88, r) * clamp(0.35 + disk * 0.4 + core + arm * 0.75, 0.0, 1.0);
        gl_FragColor = vec4(color, alpha);
      }
    `})}function ln({radius:e,warm:t}){let n=(0,B.useMemo)(()=>cn(t),[t]);return(0,B.useEffect)(()=>()=>n.dispose(),[n]),(0,V.jsx)(`mesh`,{material:n,rotation:[-Math.PI/2,0,0],children:(0,V.jsx)(`circleGeometry`,{args:[e,64]})})}function un(){(0,B.useEffect)(()=>{S.getState().setBooted(!0)},[]);let e=(0,B.useMemo)(()=>{let e=[[-2.8,.15,1.1],[-1.5,-.1,-.8],[3.3,.2,.4],[1.9,-.15,-1.5],[.2,.1,3.6],[-.6,.05,2.2]],t=new I;return t.setAttribute(`position`,new L(e.flat(),3)),t},[]);return(0,B.useEffect)(()=>()=>e.dispose(),[e]),(0,V.jsxs)(`group`,{children:[(0,V.jsxs)(`group`,{position:[-2.3,0,.3],rotation:[-.5,.4,.2],children:[(0,V.jsx)(ln,{radius:1.55,warm:.72}),(0,V.jsxs)(`mesh`,{position:[.85,.08,.2],children:[(0,V.jsx)(`sphereGeometry`,{args:[.08,12,10]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e4b56a`})]})]}),(0,V.jsx)(`group`,{position:[2.7,.15,-.5],rotation:[-.8,-.3,.4],children:(0,V.jsx)(ln,{radius:1.85,warm:.35})}),(0,V.jsx)(`group`,{position:[.35,-.05,2.9],rotation:[-1.1,.2,0],children:(0,V.jsx)(ln,{radius:.72,warm:.2})}),(0,V.jsx)(`points`,{geometry:e,children:(0,V.jsx)(`pointsMaterial`,{color:`#d5d0ea`,size:.04,sizeAttenuation:!0,transparent:!0,opacity:.85,depthWrite:!1})}),(0,V.jsx)(g,{position:[-2.3,1.7,.3],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`우리 은하`})}),(0,V.jsx)(g,{position:[2.7,2.1,-.5],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`안드로메다`})}),(0,V.jsx)(g,{position:[.35,1.05,2.9],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`삼각형자리`})})]})}function dn(){let e=(0,B.useMemo)(()=>{let e=2200,t=new Float32Array(e*3),n=0;for(let e=0;e<8;e+=1){let r=e/8*Math.PI,i=e*1.7;for(let e=0;e<192;e+=1){let e=1.4+Math.random()**.55*10.2,a=Math.random()*Math.PI*2,o=(Math.random()-.5)*1.1,s=Math.cos(a)*e,c=Math.sin(a)*e*.35+o,l=Math.sin(a)*e,u=c*Math.cos(r)-l*Math.sin(r),d=c*Math.sin(r)+l*Math.cos(r),f=s*Math.cos(i)-d*Math.sin(i),p=s*Math.sin(i)+d*Math.cos(i);t[n++]=f,t[n++]=u*Math.cos(i),t[n++]=p}}for(;n<e*3;){let e=Math.random()**.45*11.4,r=Math.random()*Math.PI*2,i=Math.acos(2*Math.random()-1);t[n++]=e*Math.sin(i)*Math.cos(r),t[n++]=e*Math.cos(i),t[n++]=e*Math.sin(i)*Math.sin(r)}let r=new I;return r.setAttribute(`position`,new L(t,3)),r},[]);return(0,B.useEffect)(()=>(S.getState().setBooted(!0),()=>e.dispose()),[e]),(0,V.jsxs)(`group`,{children:[(0,V.jsx)(`points`,{geometry:e,children:(0,V.jsx)(`pointsMaterial`,{color:`#f4efe4`,size:.022,sizeAttenuation:!0,transparent:!0,opacity:.8,depthWrite:!1})}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[11.6,48,32]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#9eb4d4`,transparent:!0,opacity:.08,side:2,depthWrite:!1})]}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[.12,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e4b56a`})]}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[.42,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e4b56a`,transparent:!0,opacity:.22,blending:2,depthWrite:!1})]})]})}function fn(e,t,n){let r=e*.72,i=t*Math.PI/180,a=n*Math.PI/180;return[r*Math.cos(a)*Math.cos(i),r*Math.sin(a),r*Math.cos(a)*Math.sin(i)]}function pn(){let e=S(e=>e.activeId),t=(0,B.useRef)(null);return(0,B.useEffect)(()=>{S.getState().setBooted(!0)},[]),f((e,n)=>{let r=Math.min(n,.1),i=S.getState();performance.now()<i.idleUntil||i.flying||i.reduceMotion||i.activeId||(rn.stars+=r*.05),t.current&&(t.current.rotation.y=rn.stars)}),(0,V.jsxs)(`group`,{ref:t,children:[(0,V.jsxs)(`mesh`,{onClick:e=>{e.stopPropagation();let t=S.getState().activeId;S.getState().pick(t===`sun`?null:`sun`)},onPointerOver:()=>{document.body.style.cursor=`pointer`},onPointerOut:()=>{document.body.style.cursor=``},children:[(0,V.jsx)(`sphereGeometry`,{args:[.42,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{transparent:!0,opacity:0,depthWrite:!1})]}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[.22,20,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#f0c36a`})]}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[.5,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#f0c36a`,transparent:!0,opacity:.35,blending:2,depthWrite:!1})]}),e===`sun`?(0,V.jsx)(g,{position:[0,.7,0],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`태양`})}):null,je.map(t=>{let[n,r,i]=fn(t.ly,t.ra,t.dec),a=e===t.id;return(0,V.jsxs)(`group`,{position:[n,r,i],children:[(0,V.jsxs)(`mesh`,{onClick:e=>{e.stopPropagation();let n=S.getState().activeId;S.getState().pick(n===t.id?null:t.id)},onPointerOver:()=>{document.body.style.cursor=`pointer`},onPointerOut:()=>{document.body.style.cursor=``},children:[(0,V.jsx)(`sphereGeometry`,{args:[Math.max(.42,t.size*2.6),12,10]}),(0,V.jsx)(`meshBasicMaterial`,{transparent:!0,opacity:0,depthWrite:!1})]}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[t.size,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:t.color})]}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[t.size*2.2,12,10]}),(0,V.jsx)(`meshBasicMaterial`,{color:t.color,transparent:!0,opacity:.28,blending:2,depthWrite:!1})]}),t.label||a?(0,V.jsx)(g,{position:[0,t.size+.35,0],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:t.name})}):null]},t.id)})]})}function mn(e,t,n){let r=new Float32Array(t*3);for(let i=0;i<t;i+=1){let t=n*Math.random()**.45,a=Math.random()*Math.PI*2,o=Math.acos(2*Math.random()-1);r[i*3]=e[0]+t*Math.sin(o)*Math.cos(a),r[i*3+1]=e[1]+t*Math.cos(o)*.62,r[i*3+2]=e[2]+t*Math.sin(o)*Math.sin(a)}return r}function hn(){let e=(0,B.useMemo)(()=>{let e=[mn([.2,0,0],900,6.4),mn([3.4,.45,.2],280,1.5),mn([-1.4,-.3,-.5],220,1.7),mn([-2.2,1.6,2.4],120,1.1)],t=new Float32Array(540),n=[5.1,.35,1.1],r=[-1.4,-.3,-.5];for(let e=0;e<180;e+=1){let i=Math.random();t[e*3]=n[0]+(r[0]-n[0])*i+(Math.random()-.5)*.7,t[e*3+1]=n[1]+(r[1]-n[1])*i+(Math.random()-.5)*.45,t[e*3+2]=n[2]+(r[2]-n[2])*i+(Math.random()-.5)*.7}let i=new Float32Array(e.reduce((e,t)=>e+t.length,0)+t.length),a=0;for(let n of[...e,t])i.set(n,a),a+=n.length;let o=new I;return o.setAttribute(`position`,new L(i,3)),o},[]);return(0,B.useEffect)(()=>(S.getState().setBooted(!0),()=>e.dispose()),[e]),(0,V.jsxs)(`group`,{children:[(0,V.jsx)(`points`,{geometry:e,children:(0,V.jsx)(`pointsMaterial`,{color:`#f3eee6`,size:.022,sizeAttenuation:!0,transparent:!0,opacity:.75,depthWrite:!1})}),(0,V.jsxs)(`mesh`,{position:[3.4,.45,.2],children:[(0,V.jsx)(`sphereGeometry`,{args:[.95,20,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#d5e2f5`,transparent:!0,opacity:.16,blending:2,depthWrite:!1})]}),(0,V.jsxs)(`mesh`,{position:[-1.4,-.3,-.5],children:[(0,V.jsx)(`sphereGeometry`,{args:[1.05,20,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e7c48a`,transparent:!0,opacity:.14,blending:2,depthWrite:!1})]}),(0,V.jsxs)(`mesh`,{position:[5.1,.35,1.1],children:[(0,V.jsx)(`sphereGeometry`,{args:[.12,14,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e4b56a`})]}),(0,V.jsx)(g,{position:[5.1,.85,1.1],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`우리 은하군`})}),(0,V.jsx)(g,{position:[3.4,1.15,.2],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`처녀자리 은하단`})}),(0,V.jsx)(g,{position:[-1.4,.55,-.5],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`거대 인력체`})})]})}function gn(){let e=(0,B.useMemo)(()=>{let e=1600,t=new Float32Array(e*3);for(let n=0;n<e;n+=1){let e=Math.random(),r=(Math.random()+Math.random()-1)*1.15;t[n*3]=-6.5+e*13,t[n*3+1]=(Math.random()-.5)*.28,t[n*3+2]=Math.sin(e*Math.PI)*1.15+r}let n=new I;return n.setAttribute(`position`,new L(t,3)),n},[]),t=(0,B.useMemo)(()=>{let e=new Float32Array(2100);for(let t=0;t<700;t+=1){let n=Math.random();e[t*3]=-6+n*12,e[t*3+1]=(Math.random()-.5)*.2,e[t*3+2]=-3.2+Math.sin(n*Math.PI)*.8+(Math.random()-.5)*.6}let t=new I;return t.setAttribute(`position`,new L(e,3)),t},[]);return(0,B.useEffect)(()=>(S.getState().setBooted(!0),()=>{e.dispose(),t.dispose()}),[e,t]),(0,V.jsxs)(`group`,{children:[(0,V.jsx)(`points`,{geometry:t,children:(0,V.jsx)(`pointsMaterial`,{color:`#8ea0c4`,size:.018,sizeAttenuation:!0,transparent:!0,opacity:.4,depthWrite:!1})}),(0,V.jsx)(`points`,{geometry:e,children:(0,V.jsx)(`pointsMaterial`,{color:`#f4efe4`,size:.02,sizeAttenuation:!0,transparent:!0,opacity:.8,depthWrite:!1})}),(0,V.jsxs)(`mesh`,{position:[2.6,.05,.72],children:[(0,V.jsx)(`sphereGeometry`,{args:[.55,20,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#9ec4e8`,transparent:!0,opacity:.35,blending:2,depthWrite:!1})]}),(0,V.jsx)(g,{position:[2.6,.85,.72],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`오리온 성운`})}),(0,V.jsxs)(`mesh`,{position:[-1.1,.02,.22],onClick:e=>{e.stopPropagation(),S.getState().setView(`stars`)},onPointerOver:()=>{document.body.style.cursor=`pointer`},onPointerOut:()=>{document.body.style.cursor=``},children:[(0,V.jsx)(`sphereGeometry`,{args:[.16,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e4b56a`})]}),(0,V.jsx)(g,{position:[-1.1,.48,.22],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`태양`})})]})}function _n(e){e.colorSpace=F,e.needsUpdate=!0}function vn(){let e=S(e=>e.eclipseKind),t=S(e=>e.eclipseSky),[n,r,i]=Y([`/hwani-gallery/lumen/textures/sun.jpg`,`/hwani-gallery/lumen/textures/earth-day.jpg`,`/hwani-gallery/lumen/textures/moon.jpg`]),a=(0,B.useRef)(null),o=(0,B.useRef)(null),s=(0,B.useRef)(null),c=(0,B.useRef)(null),l=(0,B.useRef)(0);if((0,B.useEffect)(()=>{_n(n),_n(r),_n(i),S.getState().setBooted(!0)},[n,r,i]),f((n,r)=>{let i=Math.min(r,.05),u=S.getState().reduceMotion;u||(l.current=(l.current+i*.18)%1);let d=u?0:Math.sin(l.current*Math.PI*2),f=Math.abs(d)<.22;if(t){c.current?.position.set(d*1.7,0,.08),o.current&&e===`lunar`&&o.current.color.set(f?`#c47462`:`#f2f2f2`);return}let p=e===`lunar`;a.current?.position.set(p?2.75:1.05,d*.55,0),s.current&&(s.current.opacity=f?.42:.08),o.current&&p&&o.current.color.set(f?`#c47462`:`#ffffff`),o.current&&!p&&o.current.color.set(`#ffffff`)}),t&&e===`solar`)return(0,V.jsxs)(`group`,{children:[(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`circleGeometry`,{args:[1.35,48]}),(0,V.jsx)(`meshBasicMaterial`,{map:n})]}),(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`ringGeometry`,{args:[1.4,1.7,48]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#f0c36a`,transparent:!0,opacity:.45,side:2,depthWrite:!1})]}),(0,V.jsxs)(`mesh`,{ref:c,children:[(0,V.jsx)(`circleGeometry`,{args:[1.22,48]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#141820`})]})]});if(t&&e===`lunar`)return(0,V.jsxs)(`group`,{children:[(0,V.jsxs)(`mesh`,{ref:c,children:[(0,V.jsx)(`circleGeometry`,{args:[.92,48]}),(0,V.jsx)(`meshBasicMaterial`,{ref:o,map:i,color:`#ffffff`})]}),(0,V.jsxs)(`mesh`,{position:[0,0,.16],children:[(0,V.jsx)(`circleGeometry`,{args:[1.08,48]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#6a2c38`,transparent:!0,opacity:.62,depthWrite:!1})]})]});let u=e===`lunar`;return(0,V.jsxs)(`group`,{children:[(0,V.jsxs)(`mesh`,{position:[-3.3,0,0],children:[(0,V.jsx)(`sphereGeometry`,{args:[.62,32,24]}),(0,V.jsx)(`meshBasicMaterial`,{map:n})]}),(0,V.jsx)(g,{position:[-3.3,.85,0],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`태양`})}),(0,V.jsxs)(`mesh`,{position:[1.85,0,0],children:[(0,V.jsx)(`sphereGeometry`,{args:[.4,32,24]}),(0,V.jsx)(`meshBasicMaterial`,{map:r})]}),(0,V.jsx)(g,{position:[1.85,.68,0],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`지구`})}),(0,V.jsxs)(`mesh`,{ref:a,position:[u?2.75:1.05,0,0],children:[(0,V.jsx)(`sphereGeometry`,{args:[.14,24,18]}),(0,V.jsx)(`meshBasicMaterial`,{ref:o,map:i,color:`#ffffff`})]}),u?(0,V.jsxs)(`mesh`,{position:[2.75,0,.02],children:[(0,V.jsx)(`circleGeometry`,{args:[.3,28]}),(0,V.jsx)(`meshBasicMaterial`,{ref:s,color:`#2a121c`,transparent:!0,opacity:.2,depthWrite:!1})]}):(0,V.jsxs)(`mesh`,{position:[1.42,0,0],rotation:[0,0,Math.PI/2],children:[(0,V.jsx)(`cylinderGeometry`,{args:[.04,.16,.78,18]}),(0,V.jsx)(`meshBasicMaterial`,{ref:s,color:`#120c18`,transparent:!0,opacity:.2,depthWrite:!1})]})]})}var yn=696e3,bn=4.6,xn=[{id:`mercury`,name:`수성`,km:2440},{id:`venus`,name:`금성`,km:6052},{id:`earth`,name:`지구`,km:6371},{id:`moon`,name:`달`,km:1737},{id:`mars`,name:`화성`,km:3390},{id:`jupiter`,name:`목성`,km:69911},{id:`saturn`,name:`토성`,km:58232,ring:!0},{id:`uranus`,name:`천왕성`,km:25362},{id:`neptune`,name:`해왕성`,km:24622},{id:`pluto`,name:`명왕성`,km:1188},{id:`haumea`,name:`하우메아`,km:780},{id:`makemake`,name:`마케마케`,km:715},{id:`eris`,name:`에리스`,km:1163}];function Sn(e){return bn*e/yn}function Cn({id:e,name:t,km:n,x:r,ring:i}){let a=Y(w(e).map),o=Sn(n);return(0,B.useEffect)(()=>{a.colorSpace=F,a.needsUpdate=!0},[a]),(0,V.jsxs)(`group`,{position:[r,0,0],children:[(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[o,32,24]}),(0,V.jsx)(`meshBasicMaterial`,{map:a})]}),i?(0,V.jsxs)(`mesh`,{rotation:[Math.PI/2.4,0,0],children:[(0,V.jsx)(`ringGeometry`,{args:[o*1.4,o*2.3,40]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#f0e2c0`,transparent:!0,opacity:.8,side:2})]}):null,(0,V.jsx)(g,{position:[0,o+.28,0],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:t})})]})}function wn(){let e=Y(`/hwani-gallery/lumen/textures/sun.jpg`);(0,B.useEffect)(()=>{e.colorSpace=F,e.needsUpdate=!0,S.getState().setBooted(!0)},[e]);let t=2.4,n=xn.map(e=>{let n=Sn(e.km),r=t+n;return t=r+n+.72,{...e,x:r}});return(0,V.jsxs)(`group`,{children:[(0,V.jsxs)(`mesh`,{position:[-3.2,0,0],children:[(0,V.jsx)(`sphereGeometry`,{args:[bn,64,40]}),(0,V.jsx)(`meshBasicMaterial`,{map:e})]}),(0,V.jsx)(g,{position:[-3.2,5,0],center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:`태양`})}),n.map(e=>(0,V.jsx)(Cn,{...e},e.id))]})}function Tn(e){let t=.04,n=[],r=[];for(let r=0;r<e.length;r+=1){let i=e[r],a=e[Math.min(r+1,e.length-1)],o=a.x-i.x,s=a.z-i.z,c=Math.hypot(o,s)||1;o/=c,s/=c;let l=-s*t,u=o*t;n.push(i.x+l,i.y,i.z+u,i.x-l,i.y,i.z-u)}for(let t=0;t<e.length-1;t+=1){let e=t*2;r.push(e,e+1,e+2,e+1,e+3,e+2)}let i=new I;return i.setAttribute(`position`,new L(n,3)),i.setIndex(r),i}function En({voyage:e,points:t,active:n,assists:r}){let i=(0,B.useMemo)(()=>Tn(t),[t]),a=(0,B.useRef)(null),o=(0,B.useRef)(+!n),s=(0,B.useRef)(``);return(0,B.useEffect)(()=>(o.current=+!n,i.setDrawRange(0,n?6:(t.length-1)*6),()=>i.dispose()),[n,i]),f((c,l)=>{let u=Math.min(l,.05),d=S.getState().reduceMotion;n&&!d&&(o.current=Math.min(1,o.current+u/32)),n&&d&&(o.current=1);let f=Math.max(1,Math.floor(o.current*(t.length-1)));i.setDrawRange(0,f*6);let p=o.current*(t.length-1),m=Math.min(t.length-2,Math.floor(p)),h=p-m,g=t[m],_=t[m+1]??g,v=g.x+(_.x-g.x)*h,y=g.y+(_.y-g.y)*h,b=g.z+(_.z-g.z)*h;if(a.current?.position.set(v,y,b),n){z.on=!0,z.x=v,z.y=y,z.z=b,R.on=!0,R.time=g.t+(_.t-g.t)*h;let n=ge(e,o.current,r,t.length);n!==s.current&&(s.current=n,S.getState().setVoyageNote(n))}}),(0,V.jsxs)(`group`,{children:[(0,V.jsx)(`mesh`,{geometry:i,raycast:()=>void 0,children:(0,V.jsx)(`meshBasicMaterial`,{color:e.color,transparent:!0,opacity:n?.95:.38,side:2,depthWrite:!1})}),n?(0,V.jsxs)(`mesh`,{ref:a,raycast:()=>void 0,children:[(0,V.jsx)(`sphereGeometry`,{args:[.09,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:e.color})]}):null,r.map(t=>(0,V.jsxs)(`mesh`,{position:[t.at.x,t.at.y,t.at.z],rotation:[Math.PI/2,0,0],raycast:()=>void 0,children:[(0,V.jsx)(`ringGeometry`,{args:[.28,.34,28]}),(0,V.jsx)(`meshBasicMaterial`,{color:e.color,transparent:!0,opacity:n?.9:.35,side:2})]},t.label))]})}function Dn(){let e=S(e=>e.voyage),t=(0,B.useMemo)(()=>fe.map(e=>({voyage:e,...Qe(e)})),[]);return(0,B.useEffect)(()=>{e||(z.on=!1,R.on=!1)},[e]),(0,V.jsx)(`group`,{children:t.map(t=>(0,V.jsx)(En,{voyage:t.voyage,points:t.points,assists:t.assists,active:e===t.voyage.id},t.voyage.id))})}var On=`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;
uniform float uTime;
uniform float seed;
void main() {
  vUv = uv;
  vec3 p = position;
  float lift = 1.0 + 0.08 * sin(uTime * 0.45 + seed * 6.0) * sin(uv.x * 3.1416);
  p *= mix(1.0, lift, sin(uv.x * 3.1416));
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,kn=`
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
  vec3 color = mix(vec3(0.85, 0.16, 0.04), vec3(1.0, 0.55, 0.22), flow);
  gl_FragColor = vec4(color * a * 1.25, 1.0);
}
`,An=[{lat:18,lon:40,span:.34,height:.17,tilt:.2},{lat:-24,lon:150,span:.26,height:.13,tilt:-.4},{lat:8,lon:255,span:.42,height:.21,tilt:.6},{lat:-12,lon:320,span:.22,height:.11,tilt:1.1},{lat:32,lon:200,span:.3,height:.15,tilt:-.9}];function jn(e,t,n,r,i,a){let o=t*Math.PI/180,s=n*Math.PI/180,c=new h(Math.cos(o)*Math.cos(s),Math.sin(o),Math.cos(o)*Math.sin(s)),l=new h(-Math.sin(s),0,Math.cos(s)),u=new h().crossVectors(c,l),d=l.clone().multiplyScalar(Math.cos(a)).addScaledVector(u,Math.sin(a)).normalize(),f=[];for(let t=0;t<=16;t+=1){let n=t/16,a=(n-.5)*r,o=Math.sin(n*Math.PI)*i,s=c.clone().multiplyScalar(Math.cos(a)).addScaledVector(d,Math.sin(a)).normalize();f.push(s.multiplyScalar(e*(.985+o)))}return new he(f)}function Mn({radius:e=1}){let t=(0,B.useMemo)(()=>An.map((t,n)=>({geometry:new x(jn(e,t.lat,t.lon,t.span,t.height,t.tilt),64,e*.018,8,!1),material:new P({uniforms:{uTime:{value:0},seed:{value:n*.37+.11}},vertexShader:On,fragmentShader:kn,transparent:!0,depthWrite:!1,blending:2,side:2})})),[e]);return(0,B.useEffect)(()=>()=>{for(let e of t)e.geometry.dispose(),e.material.dispose()},[t]),f((e,n)=>{if(!S.getState().reduceMotion)for(let e of t)e.material.uniforms.uTime.value+=Math.min(n,.05)}),(0,V.jsx)(`group`,{children:t.map((e,t)=>(0,V.jsx)(`mesh`,{geometry:e.geometry,material:e.material,raycast:()=>void 0},t))})}var Nn=`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`,Pn=`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  uniform sampler2D dayMap;
  uniform vec2 texel;
  uniform float uTime;
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.17 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }
  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
  }
  // 끓는 쌀알 무늬: 움직이는 점들로 만든 칸(보로노이). 칸 가운데는 밝고 틈은 어둡다.
  float granules(vec2 p, float t) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float f1 = 8.0;
    float f2 = 8.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y));
        vec2 h = hash2(i + g);
        vec2 o = 0.5 + 0.38 * sin(t * (0.35 + h * 0.5) + 6.2831 * h);
        float d = length(g + o - f);
        if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
      }
    }
    return smoothstep(0.0, 0.16, f2 - f1);
  }
  void main() {
    vec3 dayCol = texture2D(dayMap, vUv).rgb;
    vec3 blur = (
      texture2D(dayMap, vUv + vec2(texel.x, 0.0)).rgb +
      texture2D(dayMap, vUv - vec2(texel.x, 0.0)).rgb +
      texture2D(dayMap, vUv + vec2(0.0, texel.y)).rgb +
      texture2D(dayMap, vUv - vec2(0.0, texel.y)).rgb
    ) * 0.25;
    dayCol = clamp(dayCol + (dayCol - blur) * 0.9, 0.0, 1.0);
    float luma = dot(dayCol, vec3(0.299, 0.587, 0.114));
    vec2 flow = vec2(uTime * 0.012, uTime * 0.004);
    float fine = fbm(vec2(vUv.x * 72.0, vUv.y * 36.0) + flow);
    float broad = fbm(vec2(vUv.x * 18.0, vUv.y * 9.0) - flow);
    float boil = granules(vec2(vUv.x * 180.0, vUv.y * 90.0) + broad * 1.4, uTime * 1.1);
    float cells = smoothstep(0.2, 0.8, fine * 0.45 + broad * 0.2 + boil * 0.35);
    vec3 grain = mix(vec3(0.8, 0.4, 0.09), vec3(1.0, 0.9, 0.55), cells);
    float spot = smoothstep(0.16, 0.46, luma);
    vec3 color = mix(dayCol, grain, 0.6 * spot);
    color = mix(color, dayCol * vec3(0.42, 0.2, 0.06), (1.0 - spot) * 0.45);
    float mu = clamp(dot(normalize(vNormal), normalize(cameraPosition - vWorld)), 0.0, 1.0);
    color *= mix(0.38, 1.0, pow(mu, 0.42));
    gl_FragColor = vec4(color, 1.0);
  }
`,Fn=`
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    float fresnel = pow(1.0 - clamp(dot(normalize(cameraPosition - vWorld), normalize(vNormal)), 0.0, 1.0), 2.4);
    gl_FragColor = vec4(vec3(1.0, 0.62, 0.22), fresnel * 0.85);
  }
`;function In({radius:e=1,focusable:t=!1,prominences:n=!1}){let r=Y(`/hwani-gallery/lumen/textures/sun.jpg`),i=(0,B.useMemo)(()=>new P({uniforms:{dayMap:{value:r},texel:{value:new j(1/2048,1/1024)},uTime:{value:0}},vertexShader:Nn,fragmentShader:Pn}),[r]),a=(0,B.useMemo)(()=>new P({transparent:!0,depthWrite:!1,blending:2,vertexShader:Nn,fragmentShader:Fn}),[]);return(0,B.useEffect)(()=>{r.colorSpace=F,r.anisotropy=8;let e=r.image;return i.uniforms.texel.value.set(1/(e?.width||2048),1/(e?.height||1024)),i.uniforms.dayMap.value=r,S.getState().setBooted(!0),()=>{i.dispose(),a.dispose()}},[r,i,a]),f((e,t)=>{S.getState().reduceMotion||(i.uniforms.uTime.value+=Math.min(t,.05))}),(0,V.jsxs)(`group`,{children:[(0,V.jsxs)(`mesh`,{onClick:t?e=>{e.stopPropagation(),S.getState().requestFocus(`sun`)}:void 0,onPointerOver:t?()=>{document.body.style.cursor=`pointer`}:void 0,onPointerOut:t?()=>{document.body.style.cursor=``}:void 0,children:[(0,V.jsx)(`sphereGeometry`,{args:[e,128,80]}),(0,V.jsx)(`primitive`,{object:i,attach:`material`})]}),(0,V.jsxs)(`mesh`,{scale:1.045,raycast:()=>void 0,children:[(0,V.jsx)(`sphereGeometry`,{args:[e,64,40]}),(0,V.jsx)(`primitive`,{object:a,attach:`material`})]}),n?(0,V.jsx)(Mn,{radius:e}):null]})}var Ln=Date.UTC(2e3,0,1,12),Rn=`
attribute vec4 orbit;   // a(AU), 위상, 이심률, 근일점 방향
attribute vec4 shape;   // 기울기, 승교점, 크기, 자전
uniform float uDays;
uniform float uTime;
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
  float shown = shownRadius(r);
  vec3 flat3 = vec3(cos(theta), 0.0, sin(theta));
  float inc = shape.x;
  float node = shape.y;
  vec3 axis = vec3(cos(node), 0.0, sin(node));
  vec3 dir = spin(axis, inc) * flat3;
  vec3 center = dir * shown;
  mat3 roll = spin(vec3(0.3, 1.0, 0.2) + shape.w, uTime * (0.4 + shape.w));
  vec3 local = roll * position * shape.z;
  vec3 n = roll * normal;
  vec3 world = center + local;
  vec3 toSun = normalize(-center);
  vLight = clamp(dot(normalize(n), toSun), 0.0, 1.0);
  vShade = shape.w;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`,zn=`
uniform vec3 uColor;
varying float vLight;
varying float vShade;
void main() {
  vec3 base = uColor * (0.8 + vShade * 0.4);
  gl_FragColor = vec4(base * (0.32 + 0.9 * vLight), 1.0);
}
`;function Bn(e){let t=e;return()=>(t=t*16807%2147483647,(t-1)/2147483646)}function Vn(e,t){return(0,B.useMemo)(()=>{let n=Bn(e===`main`?1234:98765),r=new Float32Array(t*4),i=new Float32Array(t*4);for(let a=0;a<t;a+=1){let t;if(e===`main`)do t=2.1+n()*1.2;while((Math.abs(t-2.5)<.03||Math.abs(t-2.82)<.03||Math.abs(t-2.95)<.02)&&n()<.85);else t=n()<.18?39.2+(n()-.5)*1.2:42+(n()-.5)*6.5;r[a*4]=t,r[a*4+1]=n()*Math.PI*2,r[a*4+2]=n()*(e===`main`?.18:.12),r[a*4+3]=n()*Math.PI*2,i[a*4]=(n()-.5)*(e===`main`?.32:.5),i[a*4+1]=n()*Math.PI*2;let o=n()**3;i[a*4+2]=(e===`main`?.009:.022)*(.7+o*2.4),i[a*4+3]=n()}return{orbit:r,shape:i}},[e,t])}function Hn({kind:e,count:t,color:n}){let r=Vn(e,t),i=(0,B.useMemo)(()=>{let e=new Pe(1,0);e.setAttribute(`orbit`,new Je(r.orbit,4)),e.setAttribute(`shape`,new Je(r.shape,4));let i=new P({uniforms:{uDays:{value:0},uTime:{value:0},uColor:{value:new Be(n)}},vertexShader:Rn,fragmentShader:zn}),a=new He(e,i,t),o=new $e;for(let e=0;e<t;e+=1)a.setMatrixAt(e,o);return a.frustumCulled=!1,a.raycast=()=>void 0,a},[r,t,n]);return(0,B.useEffect)(()=>()=>{i.geometry.dispose(),i.material.dispose()},[i]),f((e,t)=>{let n=S.getState(),r=i.material;r.uniforms.uDays.value=(n.when-Ln)/864e5,n.reduceMotion||(r.uniforms.uTime.value+=Math.min(t,.1))}),(0,V.jsx)(`primitive`,{object:i})}function Un(){let e=(0,B.useMemo)(()=>Ve(),[]);return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(Hn,{kind:`main`,count:e?1800:4200,color:`#c8b89a`}),(0,V.jsx)(Hn,{kind:`kuiper`,count:e?1500:3600,color:`#9eb4c9`})]})}function Wn({name:e,side:t}){return(0,V.jsx)(g,{position:[t,.08,0],zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:e})})}var Gn=Me(),Kn=`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`,qn=`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  uniform sampler2D dayMap;
  uniform vec3 glow;
  uniform float atmo;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 sunDir = normalize(-vWorld);
    float wrap = clamp(dot(n, sunDir) * 0.72 + 0.28, 0.0, 1.0);
    vec3 col = texture2D(dayMap, vUv).rgb;
    col *= mix(0.18, 1.15, wrap);
    float rim = pow(1.0 - clamp(dot(n, normalize(cameraPosition - vWorld)), 0.0, 1.0), 2.1);
    col += glow * rim * atmo;
    gl_FragColor = vec4(col, 1.0);
  }
`;function Jn({map:e,glow:t,atmo:n}){let r=Y(e),i=(0,B.useMemo)(()=>new P({uniforms:{dayMap:{value:r},glow:{value:new Be(t[0],t[1],t[2])},atmo:{value:n}},vertexShader:Kn,fragmentShader:qn}),[r,t,n]);return(0,B.useEffect)(()=>(r.colorSpace=F,r.anisotropy=8,r.needsUpdate=!0,()=>i.dispose()),[r,i]),(0,V.jsx)(`primitive`,{object:i,attach:`material`})}function Yn({radius:e}){let t=Y(`/hwani-gallery/lumen/textures/earth-clouds.png`),n=(0,B.useRef)(null);return(0,B.useEffect)(()=>{t.colorSpace=F,t.needsUpdate=!0},[t]),f((e,t)=>{n.current&&(n.current.rotation.y+=Math.min(t,.05)*.05)}),(0,V.jsx)(`group`,{ref:n,children:(0,V.jsxs)(`mesh`,{raycast:()=>void 0,children:[(0,V.jsx)(`sphereGeometry`,{args:[e*1.04,40,28]}),(0,V.jsx)(`meshBasicMaterial`,{map:t,transparent:!0,opacity:.42,depthWrite:!1})]})})}function Xn({radius:e}){let t=Y(`/hwani-gallery/lumen/textures/saturn-ring.png`);return(0,B.useEffect)(()=>{t.colorSpace=F,t.anisotropy=8,t.needsUpdate=!0},[t]),(0,V.jsxs)(`mesh`,{rotation:[Math.PI/2,0,0],raycast:()=>void 0,children:[(0,V.jsx)(`ringGeometry`,{args:[e*1.35,e*2.2,96]}),(0,V.jsx)(`meshBasicMaterial`,{map:t,transparent:!0,side:2,depthWrite:!1})]})}function Zn({id:e,color:n}){let r=(0,B.useMemo)(()=>{let n=t(e);if(n.length===0)return null;let r=new I;return r.setAttribute(`position`,new L(n,3)),r.setIndex(Gn),r},[e]);return(0,B.useEffect)(()=>()=>r?.dispose(),[r]),r?(0,V.jsx)(`mesh`,{geometry:r,children:(0,V.jsx)(`meshBasicMaterial`,{color:n,transparent:!0,opacity:.82,side:2,depthWrite:!1})}):null}function Qn({id:e,radius:t,name:n}){let r=w(e===`moon`?`moon`:e),i=(0,B.useRef)(null),a=(0,B.useRef)(null),o=S(t=>t.activeId===e);return f(()=>{let t=R.on?R.time:S.getState().when,n=te(e,t);i.current&&(i.current.position.set(n.x,n.y,n.z),a.current&&!S.getState().reduceMotion&&(a.current.rotation.y+=.004))}),(0,V.jsxs)(`group`,{ref:i,children:[(0,V.jsx)(`group`,{rotation:[r.tilt??0,0,0],children:(0,V.jsxs)(`group`,{ref:a,children:[(0,V.jsxs)(`mesh`,{onClick:t=>{t.stopPropagation(),S.getState().requestFocus(e)},onPointerOver:e=>{e.stopPropagation(),document.body.style.cursor=`pointer`},onPointerOut:()=>{document.body.style.cursor=``},children:[(0,V.jsx)(`sphereGeometry`,{args:[t,64,40]}),(0,V.jsx)(Jn,{map:r.map,glow:r.glow,atmo:Math.min(r.glowOuter*2.2,.85)})]}),e===`earth`?(0,V.jsx)(Yn,{radius:t}):null,r.ring?(0,V.jsx)(Xn,{radius:t}):null]})}),o?(0,V.jsxs)(`mesh`,{rotation:[Math.PI/2,0,0],children:[(0,V.jsx)(`torusGeometry`,{args:[t*2.4,t*.08,8,48]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e4b56a`})]}):null,(0,V.jsx)(Wn,{name:n,side:t+(r.ring?t*2.4:.12)})]})}var $n=new h(0,1,0),X=new h;function er({sat:e}){let t=(0,B.useRef)(null),n=(0,B.useRef)(null),r=Y(e.map),i=S(t=>c(t.activeId)===e.parent),a=(0,B.useMemo)(()=>new P({uniforms:{dayMap:{value:r},glow:{value:new Be(e.color)},atmo:{value:.2}},vertexShader:Kn,fragmentShader:qn}),[r,e]);return(0,B.useEffect)(()=>(r.colorSpace=F,r.anisotropy=8,r.needsUpdate=!0,()=>a.dispose()),[r,a]),f(()=>{let r=R.on?R.time:S.getState().when,i=te(e.id,r);t.current?.position.set(i.x,i.y,i.z),n.current&&!S.getState().reduceMotion&&(n.current.rotation.y+=.01)}),(0,V.jsxs)(`group`,{ref:t,children:[(0,V.jsx)(`group`,{ref:n,children:(0,V.jsxs)(`mesh`,{onClick:t=>{t.stopPropagation(),S.getState().requestFocus(e.id)},onPointerOver:()=>{document.body.style.cursor=`pointer`},onPointerOut:()=>{document.body.style.cursor=``},children:[(0,V.jsx)(`sphereGeometry`,{args:[e.radius,48,32]}),(0,V.jsx)(`primitive`,{object:a,attach:`material`})]})}),i?(0,V.jsx)(Wn,{name:e.name,side:e.radius+.08}):null]})}function tr({parent:e}){let t=(0,B.useRef)(null),n=S(t=>c(t.activeId)===e);return f(()=>{let n=R.on?R.time:S.getState().when,r=te(e,n);t.current?.position.set(r.x,r.y,r.z)}),n?(0,V.jsx)(`group`,{ref:t,children:i.filter(t=>t.parent===e).map(t=>(0,V.jsxs)(`mesh`,{rotation:[-.1,0,e===`saturn`?.28:.1],children:[(0,V.jsx)(`torusGeometry`,{args:[t.reach,.004,6,64]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#e4b56a`,transparent:!0,opacity:.55})]},t.id))}):null}function nr(){let e=(0,B.useRef)(null),t=(0,B.useRef)(null);return f(()=>{let n=R.on?R.time:S.getState().when,r=te(`halley`,n);if(!e.current||!t.current)return;e.current.position.set(r.x,r.y,r.z),X.set(r.x,r.y,r.z);let i=X.length()||1;t.current.visible=i<8,X.multiplyScalar(1/i),t.current.quaternion.setFromUnitVectors($n,X),t.current.position.copy(X).multiplyScalar(.16)}),(0,V.jsxs)(`group`,{ref:e,children:[(0,V.jsxs)(`mesh`,{onClick:e=>{e.stopPropagation(),S.getState().requestFocus(`halley`)},onPointerOver:()=>{document.body.style.cursor=`pointer`},onPointerOut:()=>{document.body.style.cursor=``},children:[(0,V.jsx)(`sphereGeometry`,{args:[.045,20,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#f7fbff`})]}),(0,V.jsxs)(`mesh`,{ref:t,children:[(0,V.jsx)(`coneGeometry`,{args:[.04,.32,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#d5e8f5`,transparent:!0,opacity:.4,depthWrite:!1})]}),(0,V.jsx)(Wn,{name:`핼리 혜성`,side:.2})]})}var rr=.32;function ir({au:e,name:t}){let n=e*rr;return(0,V.jsxs)(`group`,{children:[(0,V.jsxs)(`mesh`,{rotation:[Math.PI/2,0,0],children:[(0,V.jsx)(`ringGeometry`,{args:[n-.015,n+.015,96]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#9eb4c9`,transparent:!0,opacity:.4,side:2})]}),(0,V.jsx)(g,{position:[n,.15,0],zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label`,children:t})})]})}function ar(){let e=(0,B.useRef)(null),t=(0,B.useRef)(null),n=(0,B.useMemo)(()=>{let e=[];for(let t=0;t<=180;t+=1){let n=Xe(`halley`,360*t/180);e.push([n.x*rr,n.y*rr,n.z*rr])}return e},[]);return(0,B.useEffect)(()=>{S.getState().setBooted(!0)},[]),f(()=>{let n=R.on?R.time:S.getState().when,r=ae(`halley`,n),i=Math.hypot(r.x,r.y,r.z),a={x:r.x*rr,y:r.y*rr,z:r.z*rr};if(!e.current||!t.current)return;e.current.position.set(a.x,a.y,a.z),X.set(a.x,a.y,a.z);let o=X.length()||1;X.multiplyScalar(1/o);let s=Math.max(.2,3.4-i);t.current.scale.set(1,s/.32,1),t.current.quaternion.setFromUnitVectors($n,X),t.current.position.copy(X).multiplyScalar(s*.55),t.current.visible=i<6}),(0,V.jsxs)(`group`,{children:[(0,V.jsx)(Jt,{points:n,color:`#d5e6f2`}),(0,V.jsx)(ir,{au:1,name:`지구 궤도`}),(0,V.jsx)(ir,{au:30,name:`해왕성 궤도`}),(0,V.jsx)(In,{radius:.16}),(0,V.jsx)(Wn,{name:`태양`,side:.28}),(0,V.jsxs)(`group`,{ref:e,children:[(0,V.jsxs)(`mesh`,{children:[(0,V.jsx)(`sphereGeometry`,{args:[.08,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#f7fbff`})]}),(0,V.jsxs)(`mesh`,{ref:t,children:[(0,V.jsx)(`coneGeometry`,{args:[.05,.32,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#d5e8f5`,transparent:!0,opacity:.45,depthWrite:!1})]}),(0,V.jsx)(Wn,{name:`핼리 혜성`,side:.24})]})]})}function or({rate:e,children:t}){let n=(0,B.useRef)(null);return f((t,r)=>{n.current&&!S.getState().reduceMotion&&(n.current.rotation.y+=Math.min(r,.05)*e)}),(0,V.jsx)(`group`,{ref:n,children:t})}function sr(){let e=S(e=>e.cometAlone);return(0,B.useEffect)(()=>{S.getState().setBooted(!0)},[]),e?(0,V.jsx)(ar,{}):(0,V.jsxs)(`group`,{children:[k.filter(e=>e.around===`sun`).map(e=>(0,V.jsx)(Zn,{id:e.id,color:e.ribbon},e.id)),(0,V.jsx)(Un,{}),(0,V.jsx)(or,{rate:.08,children:(0,V.jsx)(In,{radius:.26,focusable:!0})}),(0,V.jsx)(Wn,{name:`태양`,side:.4}),k.filter(e=>e.id!==`halley`).map(e=>(0,V.jsx)(Qn,{id:e.id,radius:e.radius,name:e.name},e.id)),(0,V.jsx)(nr,{}),i.map(e=>(0,V.jsx)(er,{sat:e},e.id)),(0,V.jsx)(tr,{parent:`jupiter`}),(0,V.jsx)(tr,{parent:`saturn`}),(0,V.jsx)(Dn,{})]})}var cr=6371,lr=140,ur=new h,dr=`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorld;
void main() {
  vLocal = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,fr=`
uniform vec3 poleN;
uniform vec3 poleS;
uniform vec3 sunDir;
uniform float time;
uniform float daylight;
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

float oval(vec3 pole) {
  float mlat = degrees(asin(clamp(dot(vLocal, pole), -1.0, 1.0)));
  vec3 side = normalize(cross(pole, vec3(0.0, 1.0, 0.0)) + vec3(1e-4));
  vec3 side2 = cross(pole, side);
  float mlon = atan(dot(vLocal, side2), dot(vLocal, side));
  float wiggle = noise(vec2(mlon * 3.0, time * 0.35)) * 3.2 - 1.6;
  float band = exp(-pow((mlat - 67.0 - wiggle) / 2.6, 2.0));
  float rays = 0.55 + 0.45 * noise(vec2(mlon * 26.0 + time * 0.8, time * 0.6));
  float pulse = 0.75 + 0.25 * sin(time * 0.9 + mlon * 2.0);
  return band * rays * pulse;
}

void main() {
  float a = oval(poleN) + oval(poleS);
  float night = smoothstep(0.2, -0.25, dot(normalize(vWorldNormal), normalize(sunDir)));
  float shown = mix(night, 0.35, daylight);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float edge = 1.0 - abs(dot(viewDir, normalize(vWorldNormal)));
  float curtain = 0.55 + edge * 1.1;
  vec3 green = vec3(0.22, 1.0, 0.55);
  vec3 pink = vec3(0.85, 0.32, 0.62);
  vec3 color = mix(green, pink, smoothstep(0.55, 1.0, edge) * 0.35);
  gl_FragColor = vec4(color * a * shown * curtain * 0.9, 1.0);
}
`;function pr({lighting:e}){let t=(0,B.useMemo)(()=>{let t=an(80.7,-72.7,1,new h).normalize(),n=an(-80.7,107.3,1,new h).normalize();return new P({uniforms:{poleN:{value:t},poleS:{value:n},sunDir:{value:e.sun.clone()},time:{value:0},daylight:{value:1}},vertexShader:dr,fragmentShader:fr,transparent:!0,depthWrite:!1,blending:2,side:0})},[e]);return(0,B.useEffect)(()=>()=>t.dispose(),[t]),f((n,r)=>{t.uniforms.time.value+=Math.min(r,.1),t.uniforms.sunDir.value.copy(e.sun),t.uniforms.daylight.value=e.blend}),(0,V.jsx)(`mesh`,{scale:1.022,material:t,raycast:()=>void 0,children:(0,V.jsx)(`sphereGeometry`,{args:[1,128,64]})})}function mr(){let e=qe(e=>e.sat),t=(0,B.useRef)(null),n=(0,B.useRef)(0),r=(0,B.useMemo)(()=>{let e=new I;return e.setAttribute(`position`,new L(new Float32Array(420),3)),e.setDrawRange(0,0),e},[]),i=(0,B.useMemo)(()=>new Oe(r,new pe({color:`#e4b56a`,transparent:!0,opacity:.75,depthWrite:!1})),[r]);return(0,B.useEffect)(()=>()=>i.material.dispose(),[i]),(0,B.useEffect)(()=>{Ne()},[]),(0,B.useEffect)(()=>()=>r.dispose(),[r]),f(()=>{if(!e)return;let i=Date.now(),a=be(e,i);if(a&&t.current&&(an(a.lat,a.lon,1+a.altKm/cr,ur),t.current.position.copy(ur),t.current.visible=!0),i-n.current>8e3){n.current=i;let t=r.getAttribute(`position`),a=0;for(let n=0;n<lr;n+=1){let r=i+(n/139*92-46)*6e4,o=be(e,r);o&&(an(o.lat,o.lon,1+o.altKm/cr,ur),t.setXYZ(a,ur.x,ur.y,ur.z),a+=1)}t.needsUpdate=!0,r.setDrawRange(0,a)}}),e?(0,V.jsxs)(`group`,{children:[(0,V.jsx)(`primitive`,{object:i}),(0,V.jsxs)(`group`,{ref:t,visible:!1,children:[(0,V.jsxs)(`mesh`,{raycast:()=>void 0,children:[(0,V.jsx)(`sphereGeometry`,{args:[.018,16,12]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#fff2cf`,toneMapped:!1})]}),(0,V.jsx)(g,{center:!0,zIndexRange:[12,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label iss-label`,children:`우주정거장`})})]})]}):null}function hr({lighting:e}){let t=Ce(e=>e.issOn);return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(pr,{lighting:e}),t?(0,V.jsx)(mr,{}):null]})}var gr=30,_r=`
attribute float size;
attribute vec3 tint;
varying vec3 vTint;
varying float vSize;
uniform float uPixel;
void main() {
  vTint = tint;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = size * uPixel;
  vSize = size;
}
`,vr=`
varying vec3 vTint;
varying float vSize;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = dot(p, p);
  if (r > 1.0) discard;
  float core = exp(-r * 5.5);
  float halo = exp(-r * 1.6) * 0.35;
  gl_FragColor = vec4(vTint * (core + halo), 1.0);
}
`,yr=`
varying vec3 vDir;
void main() {
  float down = clamp(-normalize(vDir).y, 0.0, 1.0);
  vec3 base = mix(vec3(0.05, 0.075, 0.07), vec3(0.015, 0.02, 0.025), smoothstep(0.0, 0.5, down));
  float rim = exp(-down * 40.0);
  gl_FragColor = vec4(base + vec3(0.10, 0.12, 0.16) * rim, 1.0);
}
`,br=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,xr=`
varying vec3 vDir;
void main() {
  float up = normalize(vDir).y;
  float glow = exp(-max(up, 0.0) * 9.0) * step(-0.01, up);
  gl_FragColor = vec4(vec3(0.09, 0.12, 0.2) * glow, 1.0);
}
`;function Sr(e){let t=Math.max(-.4,Math.min(2,e));return t<0?[.72,.82,1]:t<.4?[.9,.94,1]:t<.8?[1,.96,.86]:t<1.3?[1,.85,.66]:[1,.72,.52]}var Cr=[{name:`북`,az:0},{name:`동`,az:90},{name:`남`,az:180},{name:`서`,az:270}];function wr(e){return e<0?e+360:e}function Tr(){let e=Ce(e=>e.skyTime),t=Ce(e=>e.skyFocus),n=De(e),r=(0,B.useMemo)(()=>{let e=[],t=[],r=[];for(let[i,a,o,s]of ve){let{alt:c,az:l}=Fe(i,a,n);if(c<-3)continue;e.push(...Te(c,l,gr)),t.push(Math.max(1.4,Math.min(7.5,(5.4-o)*1.35)));let u=Math.max(.35,Math.min(1.25,1.35-o*.2)),d=Sr(s);r.push(d[0]*u,d[1]*u,d[2]*u)}let i=new I;return i.setAttribute(`position`,new L(e,3)),i.setAttribute(`size`,new L(t,1)),i.setAttribute(`tint`,new L(r,3)),i},[n]),i=(0,B.useMemo)(()=>{let e=[],r=[];for(let i of ze){let a=i.id===t?r:e;for(let e of i.lines)for(let t=0;t<e.length-1;t+=1){let r=Fe(wr(e[t][0]),e[t][1],n),i=Fe(wr(e[t+1][0]),e[t+1][1],n);a.push(...Te(r.alt,r.az,gr*.995),...Te(i.alt,i.az,gr*.995))}}let i=e=>{let t=new I;return t.setAttribute(`position`,new L(e,3)),t};return{plain:i(e),bright:i(r)}},[n,t]),a=(0,B.useMemo)(()=>ze.map(e=>{let t=Fe(wr(e.center[0]),e.center[1],n);return{id:e.id,name:ke[e.id]?.name??e.ko,alt:t.alt,at:Te(t.alt,t.az,gr*.9)}}).filter(e=>e.alt>2),[n]),o=(0,B.useMemo)(()=>Ge.filter(e=>e.mag<1.6||e.ko===`폴라리스`).map(e=>{let t=Fe(e.ra<0?e.ra+360:e.ra,e.dec,n);return{name:me[e.ko]??e.ko,alt:t.alt,at:Te(t.alt,t.az,gr*.97)}}).filter(e=>e.alt>1),[n]),s=(0,B.useMemo)(()=>new P({uniforms:{uPixel:{value:Math.min(2,window.devicePixelRatio||1)}},vertexShader:_r,fragmentShader:vr,blending:2,transparent:!0,depthWrite:!1}),[]),c=(0,B.useMemo)(()=>new P({vertexShader:br,fragmentShader:yr,side:1}),[]),l=(0,B.useMemo)(()=>new P({vertexShader:br,fragmentShader:xr,side:1,blending:2,transparent:!0,depthWrite:!1}),[]);return(0,B.useEffect)(()=>()=>r.dispose(),[r]),(0,B.useEffect)(()=>()=>{i.plain.dispose(),i.bright.dispose()},[i]),(0,B.useEffect)(()=>()=>{s.dispose(),c.dispose(),l.dispose()},[s,c,l]),(0,V.jsxs)(`group`,{children:[(0,V.jsx)(`mesh`,{material:l,raycast:()=>void 0,renderOrder:-2,children:(0,V.jsx)(`sphereGeometry`,{args:[gr*1.02,48,24]})}),(0,V.jsx)(`points`,{geometry:r,material:s,raycast:()=>void 0}),(0,V.jsx)(`lineSegments`,{geometry:i.plain,raycast:()=>void 0,children:(0,V.jsx)(`lineBasicMaterial`,{color:`#8fa6c8`,transparent:!0,opacity:.55,depthWrite:!1})}),(0,V.jsx)(`lineSegments`,{geometry:i.bright,raycast:()=>void 0,children:(0,V.jsx)(`lineBasicMaterial`,{color:`#e4b56a`,transparent:!0,opacity:.95,depthWrite:!1})}),(0,V.jsx)(`mesh`,{material:c,raycast:()=>void 0,renderOrder:2,children:(0,V.jsx)(`sphereGeometry`,{args:[gr*.6,48,16,0,Math.PI*2,Math.PI/2+.004,Math.PI/2]})}),Cr.map(e=>(0,V.jsx)(g,{position:Te(1.5,e.az,gr*.55),center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`sky-cardinal`,children:e.name})},e.name)),a.map(e=>(0,V.jsx)(g,{position:e.at,center:!0,zIndexRange:[8,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:e.id===t?`space-label sky-name is-on`:`space-label sky-name`,children:e.name})},e.id)),o.map(e=>(0,V.jsx)(g,{position:e.at,zIndexRange:[7,0],style:{pointerEvents:`none`},children:(0,V.jsx)(`span`,{className:`space-label sky-star`,children:e.name})},e.name))]})}var Er=(()=>{let e=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),t=new Float32Array([0,0,2,0,0,2]),n=new I;return n.setAttribute(`position`,new Re(e,3)),n.setAttribute(`uv`,new Re(t,2)),n})(),Dr=class e{static get fullscreenGeometry(){return Er}constructor(e=`Pass`,t=new n,r=new a){this.name=e,this.renderer=null,this.scene=t,this.camera=r,this.screen=null,this.rtt=!0,this.needsSwap=!0,this.needsDepthBlit=!1,this.needsDepthTexture=!1,this.enabled=!0}get renderToScreen(){return!this.rtt}set renderToScreen(e){if(this.rtt===e){let t=this.fullscreenMaterial;t!==null&&(t.needsUpdate=!0),this.rtt=!e}}set mainScene(e){}set mainCamera(e){}setRenderer(e){this.renderer=e}isEnabled(){return this.enabled}setEnabled(e){this.enabled=e}get fullscreenMaterial(){return this.screen===null?null:this.screen.material}set fullscreenMaterial(t){let r=this.screen;r===null?(r=new ie(e.fullscreenGeometry,t),r.frustumCulled=!1,this.scene===null&&(this.scene=new n),this.scene.add(r),this.screen=r):r.material=t}getFullscreenMaterial(){return this.fullscreenMaterial}setFullscreenMaterial(e){this.fullscreenMaterial=e}getDepthTexture(){return null}setDepthTexture(e,t=Se){}render(e,t,n,r,i){throw Error(`Render method not implemented!`)}setSize(e,t){}initialize(e,t,n){}dispose(){for(let t of Object.keys(this)){let n=this[t];(n instanceof M||n instanceof et||n instanceof d||n instanceof e)&&this[t].dispose()}this.fullscreenMaterial!==null&&this.fullscreenMaterial.dispose()}},Z={SKIP:9,SET:30,ADD:0,ALPHA:1,AVERAGE:2,COLOR:3,COLOR_BURN:4,COLOR_DODGE:5,DARKEN:6,DIFFERENCE:7,DIVIDE:8,DST:9,EXCLUSION:10,HARD_LIGHT:11,HARD_MIX:12,HUE:13,INVERT:14,INVERT_RGB:15,LIGHTEN:16,LINEAR_BURN:17,LINEAR_DODGE:18,LINEAR_LIGHT:19,LUMINOSITY:20,MULTIPLY:21,NEGATION:22,NORMAL:23,OVERLAY:24,PIN_LIGHT:25,REFLECT:26,SATURATION:27,SCREEN:28,SOFT_LIGHT:29,SRC:30,SUBTRACT:31,VIVID_LIGHT:32};Z.ADD,Z.ALPHA,Z.AVERAGE,Z.COLOR,Z.COLOR_BURN,Z.COLOR_DODGE,Z.DARKEN,Z.DIFFERENCE,Z.DIVIDE,Z.DST,Z.EXCLUSION,Z.HARD_LIGHT,Z.HARD_MIX,Z.HUE,Z.INVERT,Z.INVERT_RGB,Z.LIGHTEN,Z.LINEAR_BURN,Z.LINEAR_DODGE,Z.LINEAR_LIGHT,Z.LUMINOSITY,Z.MULTIPLY,Z.NEGATION,Z.NORMAL,Z.OVERLAY,Z.PIN_LIGHT,Z.REFLECT,Z.SATURATION,Z.SCREEN,Z.SOFT_LIGHT,Z.SRC,Z.SUBTRACT,Z.VIVID_LIGHT,new Float32Array([0,0]),new Float32Array([0,1,1]),new Float32Array([0,1,1,2]),new Float32Array([0,1,2,2,3]),new Float32Array([0,1,2,3,4,4,5]),new Float32Array([0,1,2,3,4,5,7,8,9,10]);var Or=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#define WEIGHT_INNER 0.125
#define WEIGHT_OUTER 0.05556
varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;float clampToBorder(const in vec2 uv){return float(uv.s>=0.0&&uv.s<=1.0&&uv.t>=0.0&&uv.t<=1.0);}void main(){vec4 c=vec4(0.0);vec4 w=WEIGHT_INNER*vec4(clampToBorder(vUv00),clampToBorder(vUv01),clampToBorder(vUv02),clampToBorder(vUv03));c+=w.x*texture2D(inputBuffer,vUv00);c+=w.y*texture2D(inputBuffer,vUv01);c+=w.z*texture2D(inputBuffer,vUv02);c+=w.w*texture2D(inputBuffer,vUv03);w=WEIGHT_OUTER*vec4(clampToBorder(vUv04),clampToBorder(vUv05),clampToBorder(vUv06),clampToBorder(vUv07));c+=w.x*texture2D(inputBuffer,vUv04);c+=w.y*texture2D(inputBuffer,vUv05);c+=w.z*texture2D(inputBuffer,vUv06);c+=w.w*texture2D(inputBuffer,vUv07);w=WEIGHT_OUTER*vec4(clampToBorder(vUv08),clampToBorder(vUv09),clampToBorder(vUv10),clampToBorder(vUv11));c+=w.x*texture2D(inputBuffer,vUv08);c+=w.y*texture2D(inputBuffer,vUv09);c+=w.z*texture2D(inputBuffer,vUv10);c+=w.w*texture2D(inputBuffer,vUv11);c+=WEIGHT_OUTER*texture2D(inputBuffer,vUv);gl_FragColor=c;
#include <colorspace_fragment>
}`,kr=`uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;void main(){vUv=position.xy*0.5+0.5;vUv00=vUv+texelSize*vec2(-1.0,1.0);vUv01=vUv+texelSize*vec2(1.0,1.0);vUv02=vUv+texelSize*vec2(-1.0,-1.0);vUv03=vUv+texelSize*vec2(1.0,-1.0);vUv04=vUv+texelSize*vec2(-2.0,2.0);vUv05=vUv+texelSize*vec2(0.0,2.0);vUv06=vUv+texelSize*vec2(2.0,2.0);vUv07=vUv+texelSize*vec2(-2.0,0.0);vUv08=vUv+texelSize*vec2(2.0,0.0);vUv09=vUv+texelSize*vec2(-2.0,-2.0);vUv10=vUv+texelSize*vec2(0.0,-2.0);vUv11=vUv+texelSize*vec2(2.0,-2.0);gl_Position=vec4(position.xy,1.0,1.0);}`,Ar=class extends P{constructor(){super({name:`DownsamplingMaterial`,uniforms:{inputBuffer:new O(null),texelSize:new O(new j)},blending:0,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:Or,vertexShader:kr})}set inputBuffer(e){this.uniforms.inputBuffer.value=e}setSize(e,t){this.uniforms.texelSize.value.set(1/e,1/t)}},jr=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;uniform mediump sampler2D supportBuffer;
#else
uniform lowp sampler2D inputBuffer;uniform lowp sampler2D supportBuffer;
#endif
uniform float radius;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vec4 c=vec4(0.0);c+=texture2D(inputBuffer,vUv0)*0.0625;c+=texture2D(inputBuffer,vUv1)*0.125;c+=texture2D(inputBuffer,vUv2)*0.0625;c+=texture2D(inputBuffer,vUv3)*0.125;c+=texture2D(inputBuffer,vUv)*0.25;c+=texture2D(inputBuffer,vUv4)*0.125;c+=texture2D(inputBuffer,vUv5)*0.0625;c+=texture2D(inputBuffer,vUv6)*0.125;c+=texture2D(inputBuffer,vUv7)*0.0625;vec4 baseColor=texture2D(supportBuffer,vUv);gl_FragColor=mix(baseColor,c,radius);
#include <colorspace_fragment>
}`,Mr=`uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vUv=position.xy*0.5+0.5;vUv0=vUv+texelSize*vec2(-1.0,1.0);vUv1=vUv+texelSize*vec2(0.0,1.0);vUv2=vUv+texelSize*vec2(1.0,1.0);vUv3=vUv+texelSize*vec2(-1.0,0.0);vUv4=vUv+texelSize*vec2(1.0,0.0);vUv5=vUv+texelSize*vec2(-1.0,-1.0);vUv6=vUv+texelSize*vec2(0.0,-1.0);vUv7=vUv+texelSize*vec2(1.0,-1.0);gl_Position=vec4(position.xy,1.0,1.0);}`,Nr=class extends P{constructor(){super({name:`UpsamplingMaterial`,uniforms:{inputBuffer:new O(null),supportBuffer:new O(null),texelSize:new O(new j),radius:new O(.85)},blending:0,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:jr,vertexShader:Mr})}set inputBuffer(e){this.uniforms.inputBuffer.value=e}set supportBuffer(e){this.uniforms.supportBuffer.value=e}get radius(){return this.uniforms.radius.value}set radius(e){this.uniforms.radius.value=e}setSize(e,t){this.uniforms.texelSize.value.set(1/e,1/t)}},Pr=class extends Dr{constructor(){super(`MipmapBlurPass`),this.needsSwap=!1,this.renderTarget=new M(1,1,{depthBuffer:!1}),this.renderTarget.texture.name=`Upsampling.Mipmap0`,this.downsamplingMipmaps=[],this.upsamplingMipmaps=[],this.downsamplingMaterial=new Ar,this.upsamplingMaterial=new Nr,this.resolution=new j}get texture(){return this.renderTarget.texture}get levels(){return this.downsamplingMipmaps.length}set levels(e){if(this.levels!==e){let t=this.renderTarget;this.dispose(),this.downsamplingMipmaps=[],this.upsamplingMipmaps=[];for(let n=0;n<e;++n){let e=t.clone();e.texture.name=`Downsampling.Mipmap`+n,this.downsamplingMipmaps.push(e)}this.upsamplingMipmaps.push(t);for(let n=1,r=e-1;n<r;++n){let e=t.clone();e.texture.name=`Upsampling.Mipmap`+n,this.upsamplingMipmaps.push(e)}this.setSize(this.resolution.x,this.resolution.y)}}get radius(){return this.upsamplingMaterial.radius}set radius(e){this.upsamplingMaterial.radius=e}render(e,t,n,r,i){let{scene:a,camera:o}=this,{downsamplingMaterial:s,upsamplingMaterial:c}=this,{downsamplingMipmaps:l,upsamplingMipmaps:u}=this,d=t;this.fullscreenMaterial=s;for(let t=0,n=l.length;t<n;++t){let n=l[t];s.setSize(d.width,d.height),s.inputBuffer=d.texture,e.setRenderTarget(n),e.render(a,o),d=n}this.fullscreenMaterial=c;for(let t=u.length-1;t>=0;--t){let n=u[t];c.setSize(d.width,d.height),c.inputBuffer=d.texture,c.supportBuffer=l[t].texture,e.setRenderTarget(n),e.render(a,o),d=n}}setSize(e,t){let n=this.resolution;n.set(e,t);let r=n.width,i=n.height;for(let e=0,t=this.downsamplingMipmaps.length;e<t;++e)r=Math.round(r*.5),i=Math.round(i*.5),this.downsamplingMipmaps[e].setSize(r,i),e<this.upsamplingMipmaps.length&&this.upsamplingMipmaps[e].setSize(r,i)}initialize(e,t,n){if(n!==void 0){let t=this.downsamplingMipmaps.concat(this.upsamplingMipmaps);for(let e of t)e.texture.type=n;if(n!==1009)this.downsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH=`1`,this.upsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH=`1`;else if(e!==null&&e.outputColorSpace===`srgb`)for(let e of t)e.texture.colorSpace=F}}dispose(){super.dispose();for(let e of this.downsamplingMipmaps.concat(this.upsamplingMipmaps))e.dispose()}};Number(`187`.replace(/\D+/g,``));var Fr=255/256;new Float32Array([Fr/256**3,Fr/256**2,Fr/256,Fr]),new Float32Array([Fr,Fr/256,Fr/256**2,1/256**3]),new Float32Array([0,0,0]),new Float32Array([1,0,0]),new Float32Array([1,1,0]),new Float32Array([1,1,1]),new Float32Array([0,0,0]),new Float32Array([1,0,0]),new Float32Array([1,0,1]),new Float32Array([1,1,1]),new Float32Array([0,0,0]),new Float32Array([0,0,1]),new Float32Array([1,0,1]),new Float32Array([1,1,1]),new Float32Array([0,0,0]),new Float32Array([0,1,0]),new Float32Array([1,1,0]),new Float32Array([1,1,1]),new Float32Array([0,0,0]),new Float32Array([0,1,0]),new Float32Array([0,1,1]),new Float32Array([1,1,1]),new Float32Array([0,0,0]),new Float32Array([0,0,1]),new Float32Array([0,1,1]),new Float32Array([1,1,1]),new Float32Array([0,-.25,.25,-.125,.125,-.375,.375]),new Float32Array([0,0]),new Float32Array([.25,-.25]),new Float32Array([-.25,.25]),new Float32Array([.125,-.125]),new Float32Array([-.125,.125]),new Uint8Array([0,0]),new Uint8Array([3,0]),new Uint8Array([0,3]),new Uint8Array([3,3]),new Uint8Array([1,0]),new Uint8Array([4,0]),new Uint8Array([1,3]),new Uint8Array([4,3]),new Uint8Array([0,1]),new Uint8Array([3,1]),new Uint8Array([0,4]),new Uint8Array([3,4]),new Uint8Array([1,1]),new Uint8Array([4,1]),new Uint8Array([1,4]),new Uint8Array([4,4]),new Uint8Array([0,0]),new Uint8Array([1,0]),new Uint8Array([0,2]),new Uint8Array([1,2]),new Uint8Array([2,0]),new Uint8Array([3,0]),new Uint8Array([2,2]),new Uint8Array([3,2]),new Uint8Array([0,1]),new Uint8Array([1,1]),new Uint8Array([0,3]),new Uint8Array([1,3]),new Uint8Array([2,1]),new Uint8Array([3,1]),new Uint8Array([2,3]),new Uint8Array([3,3]),Q(0,0,0,0),new Float32Array([0,0,0,0]),Q(0,0,0,1),new Float32Array([0,0,0,1]),Q(0,0,1,0),new Float32Array([0,0,1,0]),Q(0,0,1,1),new Float32Array([0,0,1,1]),Q(0,1,0,0),new Float32Array([0,1,0,0]),Q(0,1,0,1),new Float32Array([0,1,0,1]),Q(0,1,1,0),new Float32Array([0,1,1,0]),Q(0,1,1,1),new Float32Array([0,1,1,1]),Q(1,0,0,0),new Float32Array([1,0,0,0]),Q(1,0,0,1),new Float32Array([1,0,0,1]),Q(1,0,1,0),new Float32Array([1,0,1,0]),Q(1,0,1,1),new Float32Array([1,0,1,1]),Q(1,1,0,0),new Float32Array([1,1,0,0]),Q(1,1,0,1),new Float32Array([1,1,0,1]),Q(1,1,1,0),new Float32Array([1,1,1,0]),Q(1,1,1,1),new Float32Array([1,1,1,1]);function Ir(e,t,n){return e+(t-e)*n}function Q(e,t,n,r){return Ir(Ir(e,t,.75),Ir(n,r,.75),.875)}var Lr=[`system`,`sizes`,`stars`,`arm`,`galaxy`,`group`,`super`,`cosmos`,`eclipse`,`sky`],Rr=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,zr=`
uniform sampler2D map;
uniform float threshold;
uniform float knee;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(map, vUv).rgb;
  float l = max(c.r, max(c.g, c.b));
  float w = smoothstep(threshold, threshold + knee, l);
  gl_FragColor = vec4(min(c * w, vec3(6.0)), 1.0);
}
`,Br=`
uniform sampler2D map;
uniform float intensity;
varying vec2 vUv;
void main() {
  vec3 b = texture2D(map, vUv).rgb * intensity;
  b = 1.0 - exp(-b);
  gl_FragColor = vec4(b, 1.0);
}
`;function Vr(e,t){return Lr.includes(e)||e===`body`&&t===`sun`}function Hr(){let e=Ce(e=>e.bloomChoice),t=Ce(e=>e.bloomAuto),n=(0,B.useMemo)(()=>Ve(),[]);return e===!1?!1:e===!0||t&&!n}function Ur(){let e=N(e=>e.gl),t=N(e=>e.size),r=N(e=>e.viewport.dpr),i=(0,B.useRef)({frames:0,start:performance.now(),slow:0}),o=(0,B.useMemo)(()=>{let t=new M(1,1,{type:ye,depthBuffer:!0}),r=new M(1,1,{type:ye,depthBuffer:!1}),i=new Pr;i.levels=6,i.radius=.78,i.initialize(e,!1,ye);let o=new ie(new l(2,2));o.frustumCulled=!1;let s=new n;return s.add(o),{sceneTarget:t,brightTarget:r,blur:i,quad:o,quadScene:s,quadCamera:new a(-1,1,1,-1,0,1),bright:new P({uniforms:{map:{value:t.texture},threshold:{value:.92},knee:{value:.45}},vertexShader:Rr,fragmentShader:zr,blending:0,depthTest:!1,depthWrite:!1}),add:new P({uniforms:{map:{value:i.texture},intensity:{value:.75}},vertexShader:Rr,fragmentShader:Br,blending:2,transparent:!0,depthTest:!1,depthWrite:!1})}},[e]);return(0,B.useEffect)(()=>{let e=Math.max(1,Math.round(t.width*r*.5)),n=Math.max(1,Math.round(t.height*r*.5));o.sceneTarget.setSize(e,n),o.brightTarget.setSize(e,n),o.blur.setSize(e,n)},[o,t.width,t.height,r]),(0,B.useEffect)(()=>()=>{o.sceneTarget.dispose(),o.brightTarget.dispose(),o.blur.dispose(),o.quad.geometry.dispose(),o.bright.dispose(),o.add.dispose()},[o]),f(({scene:t,camera:n})=>{let r=S.getState();if(e.setRenderTarget(null),e.render(t,n),!Vr(r.view,r.bodyId))return;let a=r.view===`sky`||r.view===`stars`||r.view===`arm`;o.bright.uniforms.threshold.value=a?.62:.92,o.add.uniforms.intensity.value=r.view===`body`?.55:a?.9:.75;let s=e.autoClear;e.setRenderTarget(o.sceneTarget),e.clear(),e.render(t,n),o.quad.material=o.bright,e.setRenderTarget(o.brightTarget),e.render(o.quadScene,o.quadCamera),o.blur.render(e,o.brightTarget,o.brightTarget),o.quad.material=o.add,e.setRenderTarget(null),e.autoClear=!1,e.render(o.quadScene,o.quadCamera),e.autoClear=s;let c=i.current;c.frames+=1;let l=performance.now();if(l-c.start>2e3){let e=c.frames*1e3/(l-c.start);c.frames=0,c.start=l,c.slow=e<28?c.slow+1:0;let t=Ce.getState();c.slow>=3&&t.bloomChoice===null&&(t.setBloomAuto(!1),t.say(`화면이 느려서 반짝임을 껐어요`))}},1),null}var Wr=new s,Gr=new s,Kr=new h;function qr(e){return e<.5?4*e*e*e:1-(-2*e+2)**3/2}function Jr(e,t,n,r,i){let a=e.clone().sub(t),o=n.clone().sub(r),c=Math.max(a.length(),.001),l=Math.max(o.length(),.001),u=a.divideScalar(c);Kr.copy(o).divideScalar(l);let d=u.angleTo(Kr),f=new s().setFromUnitVectors(u,Kr),p=t.distanceTo(r)/Math.max(c,l),m=Math.abs(Math.log(l/c)),h=Math.min(2.8,Math.max(1.05,.95+d*.45+p*.35+m*.28));return{fromCam:e.clone(),fromLook:t.clone(),toCam:n.clone(),toLook:r.clone(),start:performance.now(),duration:h*1e3,lift:i??Math.min(.55,.06+d*.14+p*.18),fromDir:u,turn:f,fromDist:c,toDist:l}}function Yr(e,t,n,r=performance.now()){let i=Math.min(1,(r-e.start)/e.duration),a=qr(i);n.lerpVectors(e.fromLook,e.toLook,a),Gr.copy(Wr).slerp(e.turn,a);let o=Math.exp(Math.log(e.fromDist)*(1-a)+Math.log(e.toDist)*a)*(1+e.lift*Math.sin(Math.PI*a));return t.copy(e.fromDir).applyQuaternion(Gr).multiplyScalar(o).add(n),i>=1}var Xr=`#e4b56a`,Zr=`#fff1d4`,Qr=`#071018`,$r=new h(0,1,0),ei=new h,ti=new h,ni=new h,ri=new h,ii=new ee,ai=new h(4.6,1.2,-3.2),oi=new h,$={blend:1,sun:new h(4.6,1.2,-3.2).normalize()},si=new h,ci=new h(0,1,0);function li(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`);if(!t)return new Ae(e);let n=t.createRadialGradient(64,64,0,64,64,64);n.addColorStop(0,`rgba(255, 244, 220, 1)`),n.addColorStop(.22,`rgba(228, 181, 106, 0.9)`),n.addColorStop(.5,`rgba(228, 181, 106, 0.28)`),n.addColorStop(1,`rgba(228, 181, 106, 0)`),t.fillStyle=n,t.fillRect(0,0,128,128);let r=new Ae(e);return r.colorSpace=F,r}function ui(e,t,n,r){return(0,B.useMemo)(()=>new P({transparent:!0,depthWrite:!1,side:+!!e,blending:2,uniforms:{power:{value:t},strength:{value:n},tint:{value:new h(r[0],r[1],r[2])},edge:{value:Math.sqrt(1-1/(1.045*1.045))}},vertexShader:`
        varying vec3 vNormal;
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          vNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,fragmentShader:`
        varying vec3 vNormal;
        varying vec3 vWorld;
        uniform float power;
        uniform float strength;
        uniform vec3 tint;
        uniform float edge;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float facing = dot(viewDir, normalize(vNormal));
          // 앞면: 가장자리로 갈수록 밝게. 뒷면(안쪽 껍질): 법선이 반대라서 따로 계산해
          // 행성 가장자리에서 밝고 껍질 끝에서 사라지게 한다.
          float fresnel = gl_FrontFacing
            ? pow(1.0 - clamp(facing, 0.0, 1.0), power)
            : pow(clamp(-facing / edge, 0.0, 1.0), 1.4);
          vec3 color = mix(tint, vec3(0.92, 0.94, 0.97), fresnel);
          gl_FragColor = vec4(color, fresnel * strength);
        }
      `}),[e,t,n,r[0],r[1],r[2]])}function di(){let e=(0,B.useMemo)(()=>{let e=2200,t=new Float32Array(e*3),n=new Float32Array(e*3);for(let r=0;r<e;r+=1){let e=150+Math.random()*55,i=Math.random()*Math.PI*2,a=Math.acos(2*Math.random()-1);t[r*3]=e*Math.sin(a)*Math.cos(i),t[r*3+1]=e*Math.sin(a)*Math.sin(i),t[r*3+2]=e*Math.cos(a);let o=Math.random();n[r*3]=o>.9?1:o>.75?.75:.9,n[r*3+1]=o>.9?.86:o>.75?.84:.93,n[r*3+2]=o>.9?.62:1}let r=new I;return r.setAttribute(`position`,new Re(t,3)),r.setAttribute(`color`,new Re(n,3)),r},[]);return(0,V.jsx)(`points`,{geometry:e,raycast:()=>void 0,children:(0,V.jsx)(`pointsMaterial`,{vertexColors:!0,size:1.55,sizeAttenuation:!1,transparent:!0,opacity:.9,depthWrite:!1})})}function fi(){let e=Y(`/hwani-gallery/lumen/textures/milkyway.jpg`),t=(0,B.useMemo)(()=>new P({side:1,depthWrite:!1,uniforms:{skyMap:{value:e}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        varying vec2 vUv;
        uniform sampler2D skyMap;
        void main() {
          vec3 color = texture2D(skyMap, vec2(vUv.x, 1.0 - vUv.y)).rgb;
          float band = smoothstep(0.08, 0.55, max(color.r, max(color.g, color.b)));
          color *= mix(1.15, 1.85, band);
          gl_FragColor = vec4(color, 1.0);
        }
      `}),[e]);return(0,B.useEffect)(()=>()=>t.dispose(),[t]),(0,B.useLayoutEffect)(()=>{e.colorSpace=F,e.needsUpdate=!0},[e]),(0,V.jsx)(`mesh`,{raycast:()=>void 0,material:t,children:(0,V.jsx)(`sphereGeometry`,{args:[210,64,40]})})}function pi({tint:e=[.45,.64,.82],inner:t=.78,outer:n=.28}){let r=ui(!0,2.7,t,e),i=ui(!1,3.4,n,e);return(0,B.useEffect)(()=>()=>{r.dispose(),i.dispose()},[r,i]),(0,V.jsxs)(`group`,{children:[(0,V.jsx)(`mesh`,{scale:1.045,material:r,raycast:()=>void 0,children:(0,V.jsx)(`sphereGeometry`,{args:[1,64,48]})}),(0,V.jsx)(`mesh`,{scale:1.16,material:i,raycast:()=>void 0,children:(0,V.jsx)(`sphereGeometry`,{args:[1,48,32]})})]})}function mi(){let e=(0,B.useRef)(null),[t,n,r,i,a]=Y([`/hwani-gallery/lumen/textures/earth-day.jpg`,`/hwani-gallery/lumen/textures/earth-spec.jpg`,`/hwani-gallery/lumen/textures/earth-clouds.png`,`/hwani-gallery/lumen/textures/earth-night.jpg`,`/hwani-gallery/lumen/textures/earth-normal.jpg`]),o=(0,B.useMemo)(()=>new P({uniforms:{dayMap:{value:t},specMap:{value:n},nightMap:{value:i},normalMap:{value:a},sunDir:{value:$.sun.clone()},daylight:{value:1}},vertexShader:`
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
        }
      `,fragmentShader:`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorld;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        uniform sampler2D dayMap;
        uniform sampler2D specMap;
        uniform sampler2D nightMap;
        uniform sampler2D normalMap;
        uniform vec3 sunDir;
        uniform float daylight;
        void main() {
          vec3 dayCol = texture2D(dayMap, vUv).rgb;
          vec3 nightCol = texture2D(nightMap, vUv).rgb;
          float ocean = texture2D(specMap, vUv).r;
          vec3 tn = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
          vec3 n = normalize(vTangent * tn.x - vBitangent * tn.y + vNormal * tn.z);
          vec3 sunV = normalize(sunDir);
          float ndl = dot(n, sunV);
          float wrap = clamp(ndl * 0.72 + 0.28, 0.0, 1.0);
          float lit = mix(wrap, 1.0, daylight);
          vec3 color = dayCol * mix(mix(0.22, 2.8, daylight), 7.2, lit);
          vec3 viewDir = normalize(cameraPosition - vWorld);
          vec3 halfDir = normalize(sunV + viewDir);
          vec3 smoothN = normalize(vNormal);
          float sunSide = smoothstep(-0.05, 0.25, dot(smoothN, sunV));
          float sharp = pow(max(dot(smoothN, halfDir), 0.0), 140.0);
          float broad = pow(max(dot(smoothN, halfDir), 0.0), 18.0);
          float glint = (sharp * 1.6 + broad * 0.16) * ocean * mix(sunSide, 1.0, daylight);
          color += glint * vec3(1.0, 0.95, 0.85) * 0.36;
          float rim = pow(1.0 - clamp(dot(smoothN, viewDir), 0.0, 1.0), 4.0);
          color += ocean * rim * vec3(0.05, 0.09, 0.16) * lit;
          float city = smoothstep(0.62, 0.05, wrap) * (1.0 - daylight);
          vec3 lights = pow(nightCol, vec3(1.2)) * vec3(1.15, 0.92, 0.62);
          color += lights * city * 6.5;
          gl_FragColor = vec4(color, 1.0);
        }
      `}),[t,n,i,a]);return(0,B.useEffect)(()=>()=>o.dispose(),[o]),(0,B.useEffect)(()=>{S.getState().setBooted(!0)},[]),(0,B.useLayoutEffect)(()=>{t.colorSpace=F,t.anisotropy=8,n.colorSpace=``,i.colorSpace=F,i.anisotropy=8,a.colorSpace=``,a.anisotropy=8,r.colorSpace=F,t.needsUpdate=!0,i.needsUpdate=!0,a.needsUpdate=!0},[t,n,r,i,a]),f((t,n)=>{let r=e.current,i=Math.min(n,.1);o.uniforms.sunDir.value.copy($.sun),o.uniforms.daylight.value=$.blend,r&&!S.getState().reduceMotion&&(r.rotation.y+=i*.012)}),(0,V.jsxs)(`group`,{children:[(0,V.jsx)(`mesh`,{material:o,children:(0,V.jsx)(`sphereGeometry`,{args:[1,128,64]})}),(0,V.jsxs)(`mesh`,{ref:e,scale:1.012,raycast:()=>void 0,children:[(0,V.jsx)(`sphereGeometry`,{args:[1,80,48]}),(0,V.jsx)(`meshBasicMaterial`,{map:r,transparent:!0,opacity:.38,depthWrite:!1})]}),(0,V.jsx)(pi,{})]})}function hi({url:e,inner:t,outer:n,gain:r}){let i=Y(e),a=(0,B.useMemo)(()=>new P({transparent:!0,depthWrite:!1,side:2,uniforms:{ringMap:{value:i},gain:{value:r},innerRatio:{value:t/n}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        varying vec2 vUv;
        uniform sampler2D ringMap;
        uniform float gain;
        uniform float innerRatio;
        void main() {
          float radial = clamp((length(vUv * 2.0 - 1.0) - innerRatio) / max(1.0 - innerRatio, 0.001), 0.0, 1.0);
          vec4 ring = texture2D(ringMap, vec2(radial, 0.5));
          if (ring.a < 0.04) discard;
          gl_FragColor = vec4(ring.rgb * 2.8, ring.a * 0.92);
        }
      `}),[i,r]);return(0,B.useEffect)(()=>()=>a.dispose(),[a]),(0,B.useLayoutEffect)(()=>{i.colorSpace=F,i.needsUpdate=!0},[i]),f(()=>{a.uniforms.gain.value=r}),(0,V.jsx)(`mesh`,{rotation:[Math.PI/2,0,.15],raycast:()=>void 0,material:a,children:(0,V.jsx)(`ringGeometry`,{args:[t,n,128]})})}function gi({url:e,gain:t,tint:n,glowInner:r,glowOuter:i,ring:a,bumpUrl:o,relief:s=0,emissive:c=!1,night:l=.42,scale:u=[1,1,1]}){let[d,p]=Y([e,o??e]),m=(0,B.useMemo)(()=>new P({uniforms:{dayMap:{value:d},bumpMap:{value:p},sunDir:{value:$.sun.clone()},daylight:{value:1},gain:{value:t},relief:{value:s},emissive:{value:+!!c},night:{value:l},texel:{value:new j(1/2048,1/1024)}},vertexShader:`
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
        }
      `,fragmentShader:`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorld;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        uniform sampler2D dayMap;
        uniform sampler2D bumpMap;
        uniform vec3 sunDir;
        uniform float daylight;
        uniform float gain;
        uniform float relief;
        uniform float emissive;
        uniform float night;
        uniform vec2 texel;
        void main() {
          vec3 dayCol = texture2D(dayMap, vUv).rgb;
          if (emissive > 0.5) {
            vec3 viewDir = normalize(cameraPosition - vWorld);
            float rim = pow(1.0 - clamp(dot(normalize(vNormal), viewDir), 0.0, 1.0), 1.7);
            gl_FragColor = vec4(dayCol * gain + vec3(1.0, 0.74, 0.38) * rim * 0.65, 1.0);
            return;
          }
          vec3 n = normalize(vNormal);
          if (relief > 0.0) {
            float hC = texture2D(bumpMap, vUv).r;
            float hR = texture2D(bumpMap, vUv + vec2(texel.x, 0.0)).r;
            float hU = texture2D(bumpMap, vUv + vec2(0.0, texel.y)).r;
            n = normalize(n + vTangent * (hC - hR) * relief + vBitangent * (hC - hU) * relief);
          }
          float ndl = dot(n, normalize(sunDir));
          float wrap = clamp(ndl * 0.72 + 0.28, 0.0, 1.0);
          float lit = mix(wrap, 1.0, daylight);
          gl_FragColor = vec4(dayCol * mix(gain * night, gain, lit), 1.0);
        }
      `}),[d,p,t,s,l]);return(0,B.useEffect)(()=>()=>m.dispose(),[m]),(0,B.useEffect)(()=>{S.getState().setBooted(!0)},[]),(0,B.useLayoutEffect)(()=>{let e=p.image??d.image;m.uniforms.texel.value.set(1/(e?.width||2048),1/(e?.height||1024)),d.colorSpace=F,d.anisotropy=8,p.colorSpace=``,p.anisotropy=4,d.needsUpdate=!0,p.needsUpdate=!0},[d,p,m]),f(()=>{m.uniforms.sunDir.value.copy($.sun),m.uniforms.daylight.value=$.blend,m.uniforms.gain.value=t,m.uniforms.relief.value=s,m.uniforms.emissive.value=+!!c,m.uniforms.night.value=l}),(0,V.jsxs)(`group`,{children:[(0,V.jsx)(`mesh`,{material:m,scale:u,children:(0,V.jsx)(`sphereGeometry`,{args:[1,128,64]})}),(0,V.jsx)(pi,{tint:n,inner:r,outer:i}),a?(0,V.jsx)(hi,{url:a.map,inner:a.inner,outer:a.outer,gain:t}):null]})}function _i(){let e=S(e=>e.bodyId),t=w(e);return t.id===`earth`?(0,V.jsx)(mi,{}):t.id===`sun`?(0,V.jsx)(In,{radius:1,prominences:!0}):(0,V.jsx)(gi,{url:t.map,gain:t.gain,tint:t.glow,glowInner:t.glowInner,glowOuter:t.glowOuter,ring:t.ring,bumpUrl:t.bump,relief:t.relief??0,emissive:t.emissive??!1,night:t.id===`moon`?.05:.42,scale:t.scale??[1,1,1]},t.id)}function vi(e,t,n,r){let i=on(e,t,1,ni);r.set(0,0,0),n.copy(i).setLength(2.35)}function yi({place:e,index:t,glow:n}){let r=(0,B.useMemo)(()=>an(e.lat,e.lon,1.028,new h),[e]),i=(0,B.useMemo)(()=>{let e=new s;return e.setFromUnitVectors($r,r.clone().normalize()),e},[r]),a=(0,B.useRef)(null),o=S(t=>t.activeId===e.id),c=S(t=>t.hoveredId===e.id);return f(({clock:e})=>{let n=a.current;if(!n)return;let r=S.getState().reduceMotion?1:1+Math.sin(e.elapsedTime*2.15+t*.7)*.1,i=(o?.28:c?.22:.16)*r;n.scale.set(i,i,1)}),(0,V.jsxs)(`group`,{position:r,quaternion:i,children:[(0,V.jsxs)(`mesh`,{position:[0,.034,0],children:[(0,V.jsx)(`cylinderGeometry`,{args:[.0015,.0015,.068,6]}),(0,V.jsx)(`meshBasicMaterial`,{color:Xr,toneMapped:!1,transparent:!0,opacity:.8})]}),(0,V.jsxs)(`mesh`,{position:[0,.072,0],children:[(0,V.jsx)(`sphereGeometry`,{args:[.022,16,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:`#1a1208`,transparent:!0,opacity:.45,depthWrite:!1})]}),(0,V.jsxs)(`mesh`,{position:[0,.072,0],children:[(0,V.jsx)(`sphereGeometry`,{args:[.012,16,16]}),(0,V.jsx)(`meshBasicMaterial`,{color:o?Zr:Xr,toneMapped:!1})]}),(0,V.jsx)(`sprite`,{ref:a,position:[0,.072,0],children:(0,V.jsx)(`spriteMaterial`,{map:n,transparent:!0,depthWrite:!1,blending:2,color:Xr,toneMapped:!1})}),o?(0,V.jsxs)(`mesh`,{rotation:[-Math.PI/2,0,0],position:[0,.004,0],children:[(0,V.jsx)(`ringGeometry`,{args:[.022,.036,48]}),(0,V.jsx)(`meshBasicMaterial`,{color:Xr,toneMapped:!1,transparent:!0,opacity:.92,side:2,depthWrite:!1})]}):null,(0,V.jsxs)(`mesh`,{position:[0,.072,0],onClick:t=>{t.stopPropagation(),S.getState().requestFocus(e.id)},onPointerOver:t=>{t.stopPropagation(),document.body.style.cursor=`pointer`,S.getState().setHovered(e.id)},onPointerOut:()=>{document.body.style.cursor=``,S.getState().hoveredId===e.id&&S.getState().setHovered(null)},children:[(0,V.jsx)(`sphereGeometry`,{args:[.06,14,14]}),(0,V.jsx)(`meshBasicMaterial`,{transparent:!0,opacity:0,depthWrite:!1})]})]})}function bi(e){return e===`system`?S.getState().cometAlone?{cam:new h(5.5,8.5,15),look:new h(0,0,0)}:{cam:new h(.6,15.2,13.4),look:new h(0,0,0)}:e===`sizes`?{cam:new h(3,4.8,34),look:new h(2.2,0,0)}:e===`stars`?{cam:new h(.8,7.2,18),look:new h(0,0,0)}:e===`arm`?{cam:new h(.2,5.4,13.5),look:new h(.2,0,.2)}:e===`galaxy`?{cam:new h(.6,6.4,14.5),look:new h(0,0,0)}:e===`group`?{cam:new h(1.4,8.2,16.5),look:new h(0,.1,.4)}:e===`super`?{cam:new h(1.6,8.4,20),look:new h(.4,0,0)}:e===`eclipse`?S.getState().eclipseSky?{cam:new h(0,0,4.4),look:new h(0,0,0)}:{cam:new h(.1,1.7,7.6),look:new h(0,0,0)}:e===`cosmos`?{cam:new h(.8,7.4,22),look:new h(0,0,0)}:e===`sky`?{cam:new h(0,-.055,-.106),look:new h(0,0,0)}:sn(window.innerWidth)}function xi(){let e=(0,B.useMemo)(()=>li(),[]),t=S(e=>e.bodyId);(0,B.useEffect)(()=>()=>e.dispose(),[e]);let n=t===`earth`?ne:t===`moon`||t===`mars`?u.filter(e=>e.body===t):[];return n.length===0?null:(0,V.jsx)(`group`,{children:n.map((t,n)=>(0,V.jsx)(yi,{place:t,index:n,glow:e},t.id))})}function Si(){let e=N(e=>e.camera),t=N(e=>e.controls),n=(0,B.useRef)(0),r=(0,B.useRef)(0),a=(0,B.useRef)(0),o=(0,B.useRef)(!1),s=(0,B.useRef)(!1),c=(0,B.useRef)(null),l=(0,B.useRef)(S.getState().bodyId),d=(0,B.useRef)(0),p=(0,B.useRef)(0);return f((f,m)=>{if(!t)return;let h=Math.min(m,.1),g=S.getState(),_=n=>{g.reduceMotion?(e.position.copy(ei),t.target.copy(ti),c.current=null,g.setFlying(!1)):(c.current=Jr(e.position,t.target,ei,ti,n),g.setFlying(!0))};if(!o.current){let n=bi(g.view);e.position.copy(n.cam),t.target.copy(n.look),o.current=!0}if(g.cancelToken!==a.current&&(a.current=g.cancelToken,c.current=null),g.focusToken!==n.current){n.current=g.focusToken;let e=g.view===`body`?ne.find(e=>e.id===g.activeId)??u.find(e=>e.id===g.activeId):null;if(g.view===`system`&&g.activeId&&!g.cometAlone){let e=te(g.activeId,g.when),t=i.some(e=>e.id===g.activeId)?.7:g.activeId===`halley`?1.6:2.6;ti.set(e.x,e.y,e.z),ei.set(e.x+.18,e.y+t,e.z+t*.32),_()}else e&&(vi(e.lat,e.lon,ei,ti),_())}if(g.wideToken!==r.current){r.current=g.wideToken;let e=bi(g.view);ei.copy(e.cam),ti.copy(e.look);let t=g.view===`body`&&l.current!==g.bodyId;l.current=g.bodyId,_(t?1.35:void 0)}let v=Ce.getState();if(v.issAimToken!==d.current&&(d.current=v.issAimToken,v.issAim&&g.view===`body`&&g.bodyId===`earth`&&(vi(v.issAim.lat,v.issAim.lon,ei,ti),_())),v.skyAimToken!==p.current){p.current=v.skyAimToken;let e=ze.find(e=>e.id===v.skyFocus);if(e&&g.view===`sky`){let t=Fe(e.center[0]<0?e.center[0]+360:e.center[0],e.center[1],De(v.skyTime)),[n,r,i]=Te(Math.max(-5,t.alt),t.az,.12);ei.set(-n,-r,-i),ti.set(0,0,0),_(0)}}if(g.view===`eclipse`)t.minDistance=2.4,t.maxDistance=16;else if(g.view===`galaxy`||g.view===`group`||g.view===`cosmos`||g.view===`sizes`||g.view===`stars`||g.view===`super`||g.view===`arm`)t.minDistance=4,t.maxDistance=g.view===`sizes`?90:g.view===`cosmos`?80:70;else if(g.view===`system`)t.minDistance=1.1,t.maxDistance=48;else if(g.view===`sky`)t.minDistance=.12,t.maxDistance=.12;else{let e=t.target.length();t.minDistance=Math.max(.55,1.5-e),t.maxDistance=7.2}t.minPolarAngle=g.view===`sky`?Math.PI/2-.2:.16,t.maxPolarAngle=g.view===`sky`?Math.PI-.02:Math.PI-.16,t.rotateSpeed=g.view===`sky`?-.35:.5,c.current&&(t.minDistance=.01,t.maxDistance=1e3);let y=!1;c.current&&(y=!0,Yr(c.current,e.position,t.target)&&(e.position.copy(c.current.toCam),t.target.copy(c.current.toLook),c.current=null,S.getState().setFlying(!1),S.getState().touch(),y=!1));let b=y||performance.now()<S.getState().idleUntil;z.on&&g.view===`system`&&g.voyage&&!c.current&&!b&&(ti.set(z.x,z.y,z.z),t.target.lerp(ti,1-Math.exp(-1.8*h)),ri.set(.4,6.4,5.2),e.position.copy(t.target).add(ri)),b||z.on||S.getState().reduceMotion||c.current||g.view===`body`||g.view===`stars`||g.view===`sky`||(ri.copy(e.position).sub(t.target),ii.setFromVector3(ri),ii.theta+=.085*h,ii.makeSafe(),ri.setFromSpherical(ii),e.position.copy(t.target).add(ri)),s.current!==b&&(s.current=b,S.getState().setPaused(b)),c.current||g.view!==`body`&&g.view!==`stars`&&g.view!==`sky`||t.target.set(0,0,0)}),null}function Ci(){let e=S(e=>e.bodyId),t=(0,B.useRef)(null),n=w(e).tilt??.32;return f((e,n)=>{let r=Math.min(n,.1),i=S.getState();performance.now()<i.idleUntil||i.flying||i.reduceMotion||i.activeId||(rn.body+=r*.08),t.current&&(t.current.rotation.y=rn.body)}),(0,V.jsx)(`group`,{rotation:[n,0,0],children:(0,V.jsxs)(`group`,{ref:t,children:[(0,V.jsx)(B.Suspense,{fallback:null,children:(0,V.jsx)(_i,{})}),e===`earth`?(0,V.jsx)(hr,{lighting:$}):null,(0,V.jsx)(xi,{})]})})}function wi(){let e=N(e=>e.gl);return(0,B.useEffect)(()=>{let t=e.domElement,n=()=>{let e=S.getState();e.cancelFlight(),e.touch()},r=()=>S.getState().touch();return t.addEventListener(`pointerdown`,n),t.addEventListener(`wheel`,r,{passive:!0}),()=>{t.removeEventListener(`pointerdown`,n),t.removeEventListener(`wheel`,r)}},[e]),null}function Ti(){let e=(0,B.useRef)(null),t=(0,B.useRef)(null),n=(0,B.useRef)(null),r=(0,B.useRef)(null),i=(0,B.useRef)(1);return f(({camera:a},s)=>{let c=Math.min(s,.1),l=S.getState(),u=l.view===`body`&&l.bodyId===`moon`,d=i.current;if(u){let e=o(l.when).age/29.530588*Math.PI*2,t=oi.copy(a.position);t.lengthSq()<1e-4&&t.set(0,0,1),t.normalize(),si.crossVectors(ci,t),si.lengthSq()<1e-4&&si.set(1,0,0),si.normalize(),$.sun.copy(t).multiplyScalar(-Math.cos(e)).addScaledVector(si,Math.sin(e)).normalize(),d=0,i.current=0}else{let e=+(l.hemisphere===`day`);l.reduceMotion?i.current=e:i.current+=(e-i.current)*(1-Math.exp(-3.4*c)),d=i.current,oi.copy(ai).lerp(a.position,d),oi.lengthSq()<1e-6&&oi.set(0,1,1),$.sun.copy(oi).normalize()}$.blend=d,e.current&&(e.current.position.copy($.sun).multiplyScalar(6),e.current.intensity=1.05+d*.75),t.current&&(t.current.intensity=.38*(1-d*.55)),n.current&&(n.current.intensity=.26+d*.24),r.current&&(r.current.intensity=.5+d*.4)}),(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`hemisphereLight`,{ref:r,args:[`#f7f1e6`,`#24344c`,.5]}),(0,V.jsx)(`ambientLight`,{ref:n,intensity:.26,color:`#b7c6d8`}),(0,V.jsx)(`directionalLight`,{ref:e,position:[5.2,1.6,2.4],intensity:1.05,color:`#fff6ea`}),(0,V.jsx)(`directionalLight`,{ref:t,position:[-4.2,-1.1,-2.4],intensity:.38,color:`#8ea4c4`})]})}function Ei(){return We(),null}function Di(){let e=S(e=>e.view),t=Ce(e=>e.panel===`light`||e.raceRunning),n=Hr();return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`color`,{attach:`background`,args:[Qr]}),(0,V.jsx)(Ti,{}),e===`body`||e===`system`||e===`sizes`||e===`stars`?(0,V.jsx)(B.Suspense,{fallback:null,children:(0,V.jsx)(fi,{})}):null,e===`galaxy`||e===`group`||e===`super`||e===`cosmos`||e===`arm`||e===`sky`?null:(0,V.jsx)(di,{}),e===`body`?(0,V.jsx)(Ci,{}):null,e===`system`?(0,V.jsx)(B.Suspense,{fallback:null,children:(0,V.jsx)(sr,{})}):null,e===`sizes`?(0,V.jsx)(B.Suspense,{fallback:null,children:(0,V.jsx)(wn,{})}):null,e===`stars`?(0,V.jsx)(pn,{}):null,e===`arm`?(0,V.jsx)(gn,{}):null,e===`galaxy`?(0,V.jsx)(Qt,{}):null,e===`group`?(0,V.jsx)(un,{}):null,e===`super`?(0,V.jsx)(hn,{}):null,e===`cosmos`?(0,V.jsx)(dn,{}):null,e===`eclipse`?(0,V.jsx)(B.Suspense,{fallback:null,children:(0,V.jsx)(vn,{})}):null,e===`sky`?(0,V.jsx)(Tr,{}):null,e===`system`&&t?(0,V.jsx)(Le,{}):null,n?(0,V.jsx)(Ur,{}):null,(0,V.jsx)(Ei,{}),(0,V.jsx)(Si,{}),(0,V.jsx)(wi,{}),(0,V.jsx)(Xt,{makeDefault:!0,enablePan:!1,enableDamping:!0,dampingFactor:.08,rotateSpeed:.5,zoomSpeed:.55})]})}function Oi(){return(0,V.jsx)(ht,{camera:{position:[1.85,.95,3.72],fov:38,near:.08,far:400},dpr:[1,2],gl:{antialias:!0,alpha:!1,powerPreference:`high-performance`},onCreated:({gl:e})=>{e.toneMapping=4,e.toneMappingExposure=1.12,e.setClearColor(Qr)},children:(0,V.jsx)(Di,{})})}export{Oi as default,$ as lighting};