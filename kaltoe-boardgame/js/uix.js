/* =====================================================================
   UIX — 보드게임 UI 레이어 v1 (launcher · chess · omok · janggi · baduk · uno)
   Non-invasive: only moves/decorates existing DOM, wraps public methods.
   Game rules / AI workers / three.js are untouched.
   ===================================================================== */
(function(){
'use strict';
if(window.UIX&&window.UIX.__v)return;
var UIX=window.UIX={__v:1};
var BOARD=['chess','omok','janggi','baduk','uno'];
var NAME={chess:'3D 체스',omok:'오목',janggi:'장기',baduk:'바둑',uno:'원카드',blockaction:'마인크래프트 마리오',blockfighter:'마인크래프트 파이터'};
var LVK={1:'쉬움',2:'보통',3:'어려움'};
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function safe(fn){return function(){try{return fn.apply(this,arguments);}catch(e){try{console.warn('[UIX]',e&&e.message||e);}catch(_){}}};}
function lsGet(k,d){try{var v=localStorage.getItem('uix_'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem('uix_'+k,JSON.stringify(v));}catch(e){}}
function G(name){try{switch(name){case 'omok':return typeof Omok!=='undefined'?Omok:null;case 'janggi':return typeof Janggi!=='undefined'?Janggi:null;case 'baduk':return typeof Baduk!=='undefined'?Baduk:null;case 'uno':return typeof Uno!=='undefined'?Uno:null;case 'chess':return typeof ChessApp!=='undefined'?ChessApp:null;}}catch(e){}return null;}
function sfx(){try{return typeof SFX!=='undefined'?SFX:null;}catch(e){return null;}}
function gq(){return window.GQ||null;}
function visible(e){if(!e||!e.isConnected)return false;var cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&e.offsetParent!==null||cs.position==='fixed'&&cs.display!=='none';}
function activeScreen(){var a=$('.screen.active');return a?a.id:null;}
function fmt(ms){var s=Math.max(0,Math.floor(ms/1000));return (s/60|0)+':'+('0'+s%60).slice(-2);}

/* ---------------- icons ---------------- */
var P={
 share:'<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/>',back:'<path d="M15 5l-7 7 7 7"/>',
 home:'<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',
 hint:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
 undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
 restart:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
 mode:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 cube:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
 flat:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16M12 4v16"/>',
 sndOn:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
 sndOff:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
 rules:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.7 2.4c-.8.4-1.2 1-1.2 1.8V14"/><circle class="f" cx="12" cy="17.3" r="1.1"/>',
 pass:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
 score:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
 theme:'<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.1-.9-1.4-.9-2.4 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle class="f" cx="7.5" cy="11" r="1.3"/><circle class="f" cx="10" cy="7" r="1.3"/><circle class="f" cx="15" cy="7" r="1.3"/>',
 renju:'<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
 draw:'<rect x="6" y="3" width="11" height="15" rx="2"/><path d="M9 21h10a2 2 0 0 0 2-2V8"/>',
 more:'<circle class="f" cx="5.5" cy="12" r="1.7"/><circle class="f" cx="12" cy="12" r="1.7"/><circle class="f" cx="18.5" cy="12" r="1.7"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 log:'<path d="M8 6h12M8 12h12M8 18h12"/><circle class="f" cx="4" cy="6" r="1.2"/><circle class="f" cx="4" cy="12" r="1.2"/><circle class="f" cx="4" cy="18" r="1.2"/>',
 eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 trophy:'<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
 sad:'<circle cx="12" cy="12" r="9"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><circle class="f" cx="9" cy="10" r="1.2"/><circle class="f" cx="15" cy="10" r="1.2"/>',
 handshake:'<path d="M3 12l4-4 4 2 3-3 4 1 3 4-6 6-3-2-2 2-3-2z"/>',
 vib:'<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4 9v6M20 9v6"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4"/>',
 play:'<path class="f" d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>',
 zin:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M8 11h6M11 8v6"/>',
 zout:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M8 11h6"/>',
 zreset:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
 next:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 stage:'<path d="M4 20h16M6 20V10M10 20V6M14 20V12M18 20V8"/>',
 hq:'<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/>'
};
function ic(k){return '<i class="uix-ic"><svg viewBox="0 0 24 24" aria-hidden="true">'+(P[k]||P.more)+'</svg></i>';}
UIX.icon=ic;

/* ---------------- settings ---------------- */
var S={vib:lsGet('vib',true),timer:lsGet('timer',true)};
function applySettings(){document.documentElement.classList.toggle('uix-notimer',!S.timer);}

/* ---------------- per-game state ---------------- */
var ST={};BOARD.forEach(function(g){ST[g]={mode:null,lv:null,side:null,since:Date.now(),gameSince:Date.now(),moves:0,status:'',flip:false,started:false};});
var playedThisSession={};
function resetGame(g,mode,lv){var s=ST[g];if(!s)return;if(mode!==undefined&&mode!==null)s.mode=mode;if(lv!==undefined&&lv!==null)s.lv=lv;s.gameSince=Date.now();s.since=Date.now();s.moves=0;s.side=null;s.started=true;closeResult(true);}

/* ================= LAUNCHER ================= */
var THUMB={
 chess:'<svg viewBox="0 0 240 132" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="uxcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#9aa3b2"/></linearGradient></defs><g transform="translate(120 104) scale(1 .42) rotate(45)" opacity=".9">'+(function(){var s='';for(var r=0;r<6;r++)for(var c=0;c<6;c++)s+='<rect x="'+(c*20-60)+'" y="'+(r*20-60)+'" width="20" height="20" fill="'+((r+c)%2?'#3b2c1d':'#c8a878')+'"/>';return s;})()+'</g><g class="fl"><path d="M112 36h16M120 28v16" stroke="#e8c770" stroke-width="4" stroke-linecap="round"/><path d="M106 96c0-18 4-30 14-40 10 10 14 22 14 40z" fill="url(#uxcg)"/><rect x="100" y="94" width="40" height="9" rx="3" fill="url(#uxcg)"/><ellipse cx="120" cy="58" rx="12" ry="6" fill="#fff"/></g><g class="fl2" opacity=".85"><path d="M60 100c0-10 3-17 8-22-4-3-4-10 2-12 6 2 6 9 2 12 5 5 8 12 8 22z" fill="#2a2d33" stroke="#555" /><rect x="56" y="98" width="28" height="7" rx="2" fill="#2a2d33"/></g><g class="fl" opacity=".85"><path d="M168 102c0-12 2-20 6-25l-4-9 9 3 6-4 3 8c4 5 6 14 6 27z" fill="#e9ecf1"/><rect x="164" y="100" width="34" height="7" rx="2" fill="#e9ecf1"/></g></svg>',
 omok:'<svg viewBox="0 0 240 132" preserveAspectRatio="xMidYMid slice"><rect x="40" y="6" width="160" height="120" rx="6" fill="#d9a85a" opacity=".9"/><g stroke="#6b4a1e" stroke-width="1" opacity=".7">'+(function(){var s='';for(var i=0;i<8;i++){s+='<path d="M'+(52+i*20)+' 16v100"/>';s+='<path d="M50 '+(16+i*14.3)+'h140"/>';}return s;})()+'</g>'+(function(){var s='',pts=[[72,30],[92,44],[112,59],[132,73],[152,87]];pts.forEach(function(p,i){s+='<g class="'+(i===4?'drop':'')+'"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="8.5" fill="#141416"/><circle cx="'+(p[0]-3)+'" cy="'+(p[1]-3)+'" r="2.5" fill="#666"/></g>';});[[112,30],[92,73],[152,59],[132,44]].forEach(function(p){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="8.5" fill="#f2efe8" stroke="#aaa" stroke-width=".8"/>';});return s;})()+'<path d="M64 24L160 94" stroke="#ffd34a" stroke-width="3" stroke-linecap="round" opacity=".55" class="pulse"/></svg>',
 janggi:'<svg viewBox="0 0 240 132" preserveAspectRatio="xMidYMid slice"><rect x="20" y="8" width="200" height="116" rx="6" fill="#e3c08a" opacity=".85"/><g stroke="#7a5428" stroke-width="1" opacity=".6">'+(function(){var s='';for(var i=0;i<9;i++)s+='<path d="M'+(30+i*22.5)+' 14v104"/>';for(var j=0;j<6;j++)s+='<path d="M30 '+(14+j*20.8)+'h180"/>';s+='<path d="M97.5 14l45 41.6M142.5 14l-45 41.6"/>';return s;})()+'</g><g class="fl"><polygon points="62,46 82,46 96,60 96,80 82,94 62,94 48,80 48,60" fill="#fff6e4" stroke="#d9473a" stroke-width="4"/><text x="72" y="79" text-anchor="middle" font-size="30" fill="#c8322a" font-family="serif" font-weight="700">楚</text></g><g class="fl2"><polygon points="158,40 178,40 192,54 192,74 178,88 158,88 144,74 144,54" fill="#fff6e4" stroke="#1f8590" stroke-width="4"/><text x="168" y="73" text-anchor="middle" font-size="30" fill="#16707a" font-family="serif" font-weight="700">漢</text></g></svg>',
 baduk:'<svg viewBox="0 0 240 132" preserveAspectRatio="xMidYMid slice"><rect x="56" y="4" width="128" height="124" rx="6" fill="#dcb46a"/><g stroke="#5a3f18" stroke-width="1" opacity=".75">'+(function(){var s='';for(var i=0;i<9;i++){s+='<path d="M'+(66+i*13.5)+' 14v108"/>';s+='<path d="M66 '+(14+i*13.5)+'h108"/>';}return s;})()+'</g>'+(function(){var s='',B=[[2,2],[3,3],[2,4],[4,2],[5,5],[6,3]],W=[[3,2],[4,3],[3,4],[5,4],[6,5]];B.forEach(function(p,i){s+='<circle class="'+(i===5?'pulse':'')+'" cx="'+(66+p[0]*13.5)+'" cy="'+(14+p[1]*13.5)+'" r="6.2" fill="#141416"/>';});W.forEach(function(p){s+='<circle cx="'+(66+p[0]*13.5)+'" cy="'+(14+p[1]*13.5)+'" r="6.2" fill="#f4f1ea" stroke="#999" stroke-width=".6"/>';});return s;})()+'</svg>',
 uno:'<svg viewBox="0 0 240 132" preserveAspectRatio="xMidYMid slice"><g class="fan">'+[['#d23a2f','7'],['#e3b300','+2'],['#1d8a40','⟲'],['#2357c2','★']].map(function(c,i){var rot=[-18,-6,6,18][i];return '<g transform="rotate('+rot+' 120 190)"><g transform="translate(96 30)"><rect width="48" height="72" rx="7" fill="'+c[0]+'" stroke="#fff" stroke-width="3"/><ellipse cx="24" cy="36" rx="17" ry="25" transform="rotate(-24 24 36)" fill="#fff"/><text x="24" y="45" text-anchor="middle" font-size="24" font-weight="900" fill="'+c[0]+'">'+c[1]+'</text></g></g>';}).join('')+'</g></svg>',
 blockaction:'<svg viewBox="0 0 240 132" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges"><defs><linearGradient id="mm584s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb4ff"/><stop offset="1" stop-color="#c5ecff"/></linearGradient></defs><rect x="0" y="0" width="240" height="132" fill="url(#mm584s)"/><g fill="#fff" opacity=".92"><rect x="30" y="22" width="36" height="10" fill="#fff"/><rect x="38" y="16" width="20" height="8" fill="#fff"/></g><g fill="#fff" opacity=".92"><rect x="150" y="16" width="36" height="10" fill="#fff"/><rect x="158" y="10" width="20" height="8" fill="#fff"/></g><g fill="#fff" opacity=".92"><rect x="196" y="32" width="36" height="10" fill="#fff"/><rect x="204" y="26" width="20" height="8" fill="#fff"/></g><g opacity=".55"><rect x="0" y="78" width="30" height="22" fill="#7fc37a"/><rect x="18" y="70" width="22" height="30" fill="#6fb36a"/><rect x="222" y="74" width="18" height="26" fill="#7fc37a"/></g><rect x="0" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="0" y="100" width="16" height="6" fill="#5fc23c"/><rect x="0" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="3" y="111" width="3" height="3" fill="#a06a35"/><rect x="10" y="116" width="3" height="3" fill="#6d4320"/><rect x="5" y="122" width="3" height="3" fill="#a06a35"/><rect x="12" y="126" width="3" height="3" fill="#6d4320"/><rect x="2" y="128" width="3" height="3" fill="#a06a35"/><rect x="15" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="16" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="16" y="100" width="16" height="6" fill="#5fc23c"/><rect x="16" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="19" y="111" width="3" height="3" fill="#a06a35"/><rect x="26" y="116" width="3" height="3" fill="#6d4320"/><rect x="21" y="122" width="3" height="3" fill="#a06a35"/><rect x="28" y="126" width="3" height="3" fill="#6d4320"/><rect x="18" y="128" width="3" height="3" fill="#a06a35"/><rect x="31" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="32" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="32" y="100" width="16" height="6" fill="#5fc23c"/><rect x="32" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="35" y="111" width="3" height="3" fill="#a06a35"/><rect x="42" y="116" width="3" height="3" fill="#6d4320"/><rect x="37" y="122" width="3" height="3" fill="#a06a35"/><rect x="44" y="126" width="3" height="3" fill="#6d4320"/><rect x="34" y="128" width="3" height="3" fill="#a06a35"/><rect x="47" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="48" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="48" y="100" width="16" height="6" fill="#5fc23c"/><rect x="48" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="51" y="111" width="3" height="3" fill="#a06a35"/><rect x="58" y="116" width="3" height="3" fill="#6d4320"/><rect x="53" y="122" width="3" height="3" fill="#a06a35"/><rect x="60" y="126" width="3" height="3" fill="#6d4320"/><rect x="50" y="128" width="3" height="3" fill="#a06a35"/><rect x="63" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="64" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="64" y="100" width="16" height="6" fill="#5fc23c"/><rect x="64" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="67" y="111" width="3" height="3" fill="#a06a35"/><rect x="74" y="116" width="3" height="3" fill="#6d4320"/><rect x="69" y="122" width="3" height="3" fill="#a06a35"/><rect x="76" y="126" width="3" height="3" fill="#6d4320"/><rect x="66" y="128" width="3" height="3" fill="#a06a35"/><rect x="79" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="80" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="80" y="100" width="16" height="6" fill="#5fc23c"/><rect x="80" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="83" y="111" width="3" height="3" fill="#a06a35"/><rect x="90" y="116" width="3" height="3" fill="#6d4320"/><rect x="85" y="122" width="3" height="3" fill="#a06a35"/><rect x="92" y="126" width="3" height="3" fill="#6d4320"/><rect x="82" y="128" width="3" height="3" fill="#a06a35"/><rect x="95" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="96" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="96" y="100" width="16" height="6" fill="#5fc23c"/><rect x="96" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="99" y="111" width="3" height="3" fill="#a06a35"/><rect x="106" y="116" width="3" height="3" fill="#6d4320"/><rect x="101" y="122" width="3" height="3" fill="#a06a35"/><rect x="108" y="126" width="3" height="3" fill="#6d4320"/><rect x="98" y="128" width="3" height="3" fill="#a06a35"/><rect x="111" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="112" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="112" y="100" width="16" height="6" fill="#5fc23c"/><rect x="112" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="115" y="111" width="3" height="3" fill="#a06a35"/><rect x="122" y="116" width="3" height="3" fill="#6d4320"/><rect x="117" y="122" width="3" height="3" fill="#a06a35"/><rect x="124" y="126" width="3" height="3" fill="#6d4320"/><rect x="114" y="128" width="3" height="3" fill="#a06a35"/><rect x="127" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="128" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="128" y="100" width="16" height="6" fill="#5fc23c"/><rect x="128" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="131" y="111" width="3" height="3" fill="#a06a35"/><rect x="138" y="116" width="3" height="3" fill="#6d4320"/><rect x="133" y="122" width="3" height="3" fill="#a06a35"/><rect x="140" y="126" width="3" height="3" fill="#6d4320"/><rect x="130" y="128" width="3" height="3" fill="#a06a35"/><rect x="143" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="144" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="144" y="100" width="16" height="6" fill="#5fc23c"/><rect x="144" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="147" y="111" width="3" height="3" fill="#a06a35"/><rect x="154" y="116" width="3" height="3" fill="#6d4320"/><rect x="149" y="122" width="3" height="3" fill="#a06a35"/><rect x="156" y="126" width="3" height="3" fill="#6d4320"/><rect x="146" y="128" width="3" height="3" fill="#a06a35"/><rect x="159" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="160" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="160" y="100" width="16" height="6" fill="#5fc23c"/><rect x="160" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="163" y="111" width="3" height="3" fill="#a06a35"/><rect x="170" y="116" width="3" height="3" fill="#6d4320"/><rect x="165" y="122" width="3" height="3" fill="#a06a35"/><rect x="172" y="126" width="3" height="3" fill="#6d4320"/><rect x="162" y="128" width="3" height="3" fill="#a06a35"/><rect x="175" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="176" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="176" y="100" width="16" height="6" fill="#5fc23c"/><rect x="176" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="179" y="111" width="3" height="3" fill="#a06a35"/><rect x="186" y="116" width="3" height="3" fill="#6d4320"/><rect x="181" y="122" width="3" height="3" fill="#a06a35"/><rect x="188" y="126" width="3" height="3" fill="#6d4320"/><rect x="178" y="128" width="3" height="3" fill="#a06a35"/><rect x="191" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="192" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="192" y="100" width="16" height="6" fill="#5fc23c"/><rect x="192" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="195" y="111" width="3" height="3" fill="#a06a35"/><rect x="202" y="116" width="3" height="3" fill="#6d4320"/><rect x="197" y="122" width="3" height="3" fill="#a06a35"/><rect x="204" y="126" width="3" height="3" fill="#6d4320"/><rect x="194" y="128" width="3" height="3" fill="#a06a35"/><rect x="207" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="208" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="208" y="100" width="16" height="6" fill="#5fc23c"/><rect x="208" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="211" y="111" width="3" height="3" fill="#a06a35"/><rect x="218" y="116" width="3" height="3" fill="#6d4320"/><rect x="213" y="122" width="3" height="3" fill="#a06a35"/><rect x="220" y="126" width="3" height="3" fill="#6d4320"/><rect x="210" y="128" width="3" height="3" fill="#a06a35"/><rect x="223" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="224" y="100" width="16" height="32" fill="#8a5a2b"/><rect x="224" y="100" width="16" height="6" fill="#5fc23c"/><rect x="224" y="106" width="16" height="2" fill="#4a9e2c"/><rect x="227" y="111" width="3" height="3" fill="#a06a35"/><rect x="234" y="116" width="3" height="3" fill="#6d4320"/><rect x="229" y="122" width="3" height="3" fill="#a06a35"/><rect x="236" y="126" width="3" height="3" fill="#6d4320"/><rect x="226" y="128" width="3" height="3" fill="#a06a35"/><rect x="239" y="100" width="1" height="32" fill="#6d4320" opacity=".5"/><rect x="106" y="46" width="16" height="16" fill="#b5542a"/><rect x="106" y="46" width="16" height="1" fill="#e08a5a"/><rect x="106" y="51" width="16" height="1" fill="#5a240e"/><rect x="106" y="56" width="16" height="1" fill="#5a240e"/><rect x="113" y="46" width="1" height="5" fill="#5a240e"/><rect x="109" y="51" width="1" height="5" fill="#5a240e"/><rect x="117" y="51" width="1" height="5" fill="#5a240e"/><rect x="113" y="56" width="1" height="6" fill="#5a240e"/><rect x="106" y="61" width="16" height="1" fill="#5a240e"/><rect x="122" y="46" width="16" height="16" fill="#b5542a"/><rect x="122" y="46" width="16" height="1" fill="#e08a5a"/><rect x="122" y="51" width="16" height="1" fill="#5a240e"/><rect x="122" y="56" width="16" height="1" fill="#5a240e"/><rect x="129" y="46" width="1" height="5" fill="#5a240e"/><rect x="125" y="51" width="1" height="5" fill="#5a240e"/><rect x="133" y="51" width="1" height="5" fill="#5a240e"/><rect x="129" y="56" width="1" height="6" fill="#5a240e"/><rect x="122" y="61" width="16" height="1" fill="#5a240e"/><rect x="154" y="46" width="16" height="16" fill="#b5542a"/><rect x="154" y="46" width="16" height="1" fill="#e08a5a"/><rect x="154" y="51" width="16" height="1" fill="#5a240e"/><rect x="154" y="56" width="16" height="1" fill="#5a240e"/><rect x="161" y="46" width="1" height="5" fill="#5a240e"/><rect x="157" y="51" width="1" height="5" fill="#5a240e"/><rect x="165" y="51" width="1" height="5" fill="#5a240e"/><rect x="161" y="56" width="1" height="6" fill="#5a240e"/><rect x="154" y="61" width="16" height="1" fill="#5a240e"/><g class="pulse"><rect x="138" y="46" width="16" height="16" fill="#f4b400"/><rect x="138" y="46" width="16" height="2" fill="#ffe27a"/><rect x="138" y="60" width="16" height="2" fill="#a35f00"/><rect x="152" y="46" width="2" height="16" fill="#a35f00"/><rect x="138" y="46" width="2" height="16" fill="#ffd04a"/><rect x="139" y="47" width="2" height="2" fill="#7a4500"/><rect x="151" y="47" width="2" height="2" fill="#7a4500"/><rect x="139" y="59" width="2" height="2" fill="#7a4500"/><rect x="151" y="59" width="2" height="2" fill="#7a4500"/><text x="146" y="59" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="13" fill="#fff" stroke="#7a4500" stroke-width="1.2" paint-order="stroke">?</text></g><g class="drop"><g><ellipse cx="146" cy="34" rx="4.62" ry="6.6" fill="#ffd23a" stroke="#b07800" stroke-width="1.2"/><rect x="145" y="30.15" width="2" height="7.7" fill="#fff3b0"/></g></g><g><ellipse cx="40" cy="82" rx="4.2" ry="6" fill="#ffd23a" stroke="#b07800" stroke-width="1.2"/><rect x="39" y="78.5" width="2" height="7" fill="#fff3b0"/></g><g><ellipse cx="52" cy="76" rx="4.2" ry="6" fill="#ffd23a" stroke="#b07800" stroke-width="1.2"/><rect x="51" y="72.5" width="2" height="7" fill="#fff3b0"/></g><g><ellipse cx="64" cy="72" rx="4.2" ry="6" fill="#ffd23a" stroke="#b07800" stroke-width="1.2"/><rect x="63" y="68.5" width="2" height="7" fill="#fff3b0"/></g><g class="fl" transform="rotate(-6 126 78)"><rect x="106" y="88" width="7" height="2" fill="#ffffff" opacity=".7"/><rect x="102" y="94" width="9" height="2" fill="#ffffff" opacity=".55"/><rect x="108" y="100" width="6" height="2" fill="#ffffff" opacity=".45"/><rect x="118" y="58" width="16" height="16" fill="#c8946a"/><rect x="118" y="58" width="16" height="5" fill="#4a2f1d"/><rect x="118" y="63" width="2" height="3" fill="#4a2f1d"/><rect x="132" y="63" width="2" height="3" fill="#4a2f1d"/><rect x="121" y="66" width="3" height="2" fill="#fff"/><rect x="123" y="66" width="1" height="2" fill="#3b5bdb"/><rect x="128" y="66" width="3" height="2" fill="#fff"/><rect x="128" y="66" width="1" height="2" fill="#3b5bdb"/><rect x="124" y="70" width="4" height="1" fill="#8a5a3a"/><rect x="123" y="69" width="6" height="1" fill="#9c6a48"/><rect x="118" y="74" width="16" height="16" fill="#2fb3b3"/><rect x="118" y="74" width="16" height="2" fill="#4fd0d0"/><rect x="133" y="54" width="6" height="20" fill="#2fb3b3"/><rect x="133" y="48" width="6" height="7" fill="#c8946a"/><rect x="112" y="76" width="6" height="12" fill="#2fb3b3"/><rect x="112" y="87" width="6" height="4" fill="#c8946a"/><rect x="118" y="90" width="8" height="10" fill="#3b4cc0"/><rect x="126" y="90" width="8" height="6" fill="#3b4cc0"/><rect x="128" y="95" width="8" height="6" fill="#3b4cc0"/><rect x="118" y="100" width="8" height="4" fill="#555"/><rect x="130" y="101" width="7" height="3" fill="#555"/></g><rect x="180" y="84" width="16" height="16" fill="#9aa0a8"/><rect x="180" y="84" width="16" height="2" fill="#c5cad1"/><rect x="183" y="89" width="4" height="3" fill="#7b818a"/><rect x="189" y="94" width="4" height="3" fill="#7b818a"/><rect x="195" y="84" width="1" height="16" fill="#6b7079"/><rect x="196" y="84" width="16" height="16" fill="#9aa0a8"/><rect x="196" y="84" width="16" height="2" fill="#c5cad1"/><rect x="199" y="89" width="4" height="3" fill="#7b818a"/><rect x="205" y="94" width="4" height="3" fill="#7b818a"/><rect x="211" y="84" width="1" height="16" fill="#6b7079"/><rect x="196" y="68" width="16" height="16" fill="#9aa0a8"/><rect x="196" y="68" width="16" height="2" fill="#c5cad1"/><rect x="199" y="73" width="4" height="3" fill="#7b818a"/><rect x="205" y="78" width="4" height="3" fill="#7b818a"/><rect x="211" y="68" width="1" height="16" fill="#6b7079"/><rect x="222" y="22" width="3" height="78" fill="#e5e7eb"/><rect x="224" y="22" width="1" height="78" fill="#9ca3af"/><circle cx="223.5" cy="20" r="3.6" fill="#ffd23a" stroke="#b07800"/><g class="fl2"><path d="M221 26 L198 33 L221 40 Z" fill="#22c55e" stroke="#15803d" stroke-width="1"/><rect x="208" y="31" width="4" height="4" fill="#fff"/></g><rect x="214" y="96" width="18" height="4" fill="#6b7079"/></svg>'
};
var TAGS={chess:['3D','AI 3단계','스테이지','퍼즐'],omok:['3D','렌주룰','AI'],janggi:['3D','AI','스테이지'],baduk:['9·13·19줄','집 계산','AI'],uno:['2~4인','CPU 대전'],blockaction:['점프 액션','스토리','보스전']};
function cardGame(c){var oc=c.getAttribute('onclick')||'';var m=oc.match(/openGame\('([a-z]+)'\)/);return c.dataset.game||(m&&m[1]);}
var buildLauncher=safe(function(){
  var L=$('#launcher');if(!L||L.dataset.uix)return;L.dataset.uix='1';
  var h1=$('h1',L);
  if(h1&&h1.parentNode){var br=h1.parentNode;br.classList.add('uix-brand');var k=el('div','uix-kicker','BOARD GAME LOUNGE');br.insertBefore(k,h1);}
  $$('.gcard',L).forEach(function(c){
    var g=cardGame(c);if(!g)return;c.dataset.game=g;
    if(!$('.uix-thumb',c)){var t=el('div','uix-thumb',THUMB[g]||'');c.insertBefore(t,c.firstChild);}
    if(!$('.uix-tags',c)&&TAGS[g]){var tg=el('div','uix-tags',TAGS[g].map(function(x){return '<span>'+x+'</span>';}).join(''));c.appendChild(tg);}
    if(!$('.uix-play',c)){c.appendChild(el('span','uix-play',ic('play')));}
    c.setAttribute('tabindex','0');c.setAttribute('role','button');
    c.addEventListener('pointerdown',function(){c.classList.add('uix-tap');setTimeout(function(){c.classList.remove('uix-tap');},160);});
    c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();c.click();}});
  });
  var bar=$('.lbbar',L);
  if(bar&&!$('.uix-setbtn',bar)){var sb=el('button','uix-setbtn uix-glass',ic('gear')+'<span>설정</span>');sb.type='button';sb.onclick=function(){openSheet(null);};var cs=$('#cloudStatus',bar);bar.insertBefore(sb,cs||null);}
  var cards=$('.game-cards',L);
  if(cards&&!$('.uix-continue',L)){var cv=el('button','uix-continue uix-glass');cv.type='button';cv.style.display='none';cards.parentNode.insertBefore(cv,cards);cv.onclick=function(){var g=cv.dataset.game;if(g&&typeof window.openGame==='function')window.openGame(g);};}
  refreshLauncher();
});
var refreshLauncher=safe(function(){
  var L=$('#launcher');if(!L)return;var last=lsGet('last',null);
  $$('.gcard',L).forEach(function(c){var b=$('.uix-badge',c);var g=c.dataset.game;var txt=null,live=false;
    if(last&&last.g===g){txt=playedThisSession[g]?'진행 중':'최근';live=!!playedThisSession[g];}
    if(!txt){if(b)b.remove();return;}
    if(!b){b=el('span','uix-badge');c.appendChild(b);}b.textContent=txt;b.classList.toggle('live',live);});
  var cv=$('.uix-continue',L);
  if(cv){if(last&&NAME[last.g]){cv.dataset.game=last.g;var when='';try{var d=Math.round((Date.now()-last.t)/60000);when=d<1?'방금 전':d<60?d+'분 전':d<1440?Math.round(d/60)+'시간 전':Math.round(d/1440)+'일 전';}catch(e){}
    cv.innerHTML='<span class="cv">'+ic('play')+'</span><span><b>'+(playedThisSession[last.g]?'이어서 하기':'다시 플레이')+' · '+NAME[last.g]+'</b><small>'+(last.m?last.m+' · ':'')+when+'</small></span><span class="go">시작'+ic('next')+'</span>';
    cv.style.display='';}else cv.style.display='none';}
});
function modeLabel(g){var s=ST[g];if(!s)return '';if(g==='uno'){var ut=(document.getElementById('unoStatus')||{}).textContent||'';var sm=ut.match(/^S(\d+)/);if(sm)return '스테이지 '+sm[1];if(!s.mode)return '';return 'CPU'+(s.lv?' '+LVK[s.lv]:'')+(s.n?' · '+s.n+'인':'');}if(!s.mode)return '';var m=s.mode;return m==='pvp'?'2인 대전':m==='cpu'?'CPU '+(LVK[s.lv]||''):m==='arcade'?'스테이지':m==='training'?'퍼즐':m==='cpu2'?'CPU 대전':m;}

/* ================= TRANSITION ================= */
var curtain=null;
function iris(){if(!curtain){curtain=el('div','uix-layer');curtain.id='uixCurtain';document.body.appendChild(curtain);}curtain.classList.remove('go');void curtain.offsetWidth;curtain.classList.add('go');}

/* ================= BUTTON DECORATION ================= */
function kindOf(b){var oc=(b.getAttribute('onclick')||'')+' #'+(b.id||'');
  if(/ToggleSnd|soundToggle/i.test(oc))return 'sound';
  if(/\.resign\(/.test(oc))return 'resign';
  if(/Renju/.test(oc))return 'renju';
  if(/Tutorial\.open/.test(oc))return 'rules';
  if(/\.hint\(|hintBtn/.test(oc))return 'hint';
  if(/\.pass\(/.test(oc))return 'pass';
  if(/scoreNow/.test(oc))return 'score';
  if(/drawCard|unoDrawBtn/.test(oc))return 'draw';
  if(/callUno|unoCallBtn/.test(oc))return 'uno';
  if(/toggle2D|viewToggle|2dBtn/i.test(oc))return 'view';
  if(/undo/i.test(oc))return 'undo';
  if(/restart/.test(oc))return 'restart';
  if(/openSetup|menuBtn/.test(oc))return 'mode';
  if(/themeBtn/.test(oc))return 'theme';
  return 'x';}
function labelOf(k,raw){raw=(raw||'').trim();
  switch(k){
   case 'sound':return {i:/🔇/.test(raw)?'sndOff':'sndOn',t:/🔇/.test(raw)?'소리 꺼짐':'소리',on:!/🔇/.test(raw)};
   case 'hint':return {i:'hint',t:'힌트'};case 'undo':return {i:'undo',t:'무르기'};case 'restart':return {i:'restart',t:'다시'};
   case 'mode':return {i:'mode',t:'모드'};case 'rules':return {i:'rules',t:'규칙'};case 'pass':return {i:'pass',t:'패스'};
   case 'score':return {i:'score',t:'집 계산'};case 'theme':return {i:'theme',t:'색상'};
   case 'renju':var on=/ON/i.test(raw);return {i:'renju',t:on?'금수 ON':'금수 OFF',on:on};
   case 'view':var to2d=/2D/.test(raw);return {i:to2d?'flat':'cube',t:to2d?'2D 보기':'3D 보기'};
   case 'draw':return {i:'draw',t:/넘기/.test(raw)?'넘기기':'카드 뽑기',pass:/넘기/.test(raw)};
   case 'resign':return {i:'sad',t:'기권'};
   case 'uno':return {i:'more',t:'원카드!'};
  }return {i:'more',t:raw};}
var decorating=false;
function decorate(b){if(!b)return;var k=b.dataset.uixK||kindOf(b);b.dataset.uixK=k;
  var first=b.firstElementChild;if(first&&first.classList&&first.classList.contains('uix-ic')&&b.dataset.uixDone===b.textContent)return;
  var raw=(first&&first.classList&&first.classList.contains('uix-ic'))?(b.dataset.raw||''):b.textContent;b.dataset.raw=raw;
  var L=labelOf(k,raw);decorating=true;
  b.innerHTML=ic(L.i)+'<span class="uix-lb">'+L.t+'</span>';
  b.dataset.uixDone=b.textContent;b.setAttribute('aria-label',L.t);b.title=L.t;
  if(k==='renju'||k==='sound')b.classList.toggle('uix-onstate',!!L.on&&k==='renju');
  if(k==='draw')b.classList.toggle('uix-pass',!!L.pass);
  decorating=false;syncProxies();}
var btnObs=new MutationObserver(function(muts){if(decorating)return;var seen=[];muts.forEach(function(m){var b=m.target.nodeType===1?m.target.closest('button'):m.target.parentNode&&m.target.parentNode.closest&&m.target.parentNode.closest('button');if(b&&b.dataset.uixK&&seen.indexOf(b)<0)seen.push(b);});seen.forEach(function(b){var f=b.firstElementChild;if(!(f&&f.classList.contains('uix-ic'))||b.textContent!==b.dataset.uixDone){b.dataset.raw=b.textContent;var f2=b.firstElementChild;if(f2&&f2.classList.contains('uix-ic'))return;decorate(b);}});});
function watchBtn(b){decorate(b);btnObs.observe(b,{childList:true,characterData:true,subtree:true});}

/* ================= HUD per screen ================= */
var LAYOUT={
 omok:{pri:['hint','undo','restart','view'],sec:['renju','resign','sound','mode']},
 janggi:{pri:['hint','undo','restart','view'],sec:['rules','resign','sound','mode']},
 baduk:{pri:['hint','pass','score','undo'],sec:['restart','view','rules','resign','sound','mode']},
 uno:{pri:['hint','undo','view'],sec:['restart','rules','sound','mode']},
 chess:{pri:['hint','undo','view','log'],sec:['theme','resign','sound','mode']}
};
var HUD={};
function avClass(g,side){return g==='chess'?(side==='a'?'king-w':'king-b'):g==='janggi'?(side==='a'?'jg-b':'jg-r'):(side==='a'?'stone-b':'stone-w');}
function avText(g,side){return g==='chess'?(side==='a'?'♔':'♚'):g==='janggi'?(side==='a'?'楚':'漢'):'';}
function playerEl(g,side){var p=el('div','uix-p uix-glass '+side);p.innerHTML='<div class="uix-av '+avClass(g,side)+'">'+avText(g,side)+'</div><div class="uix-pi"><div class="uix-pn"></div><div class="uix-ps"></div><div class="uix-cap"></div></div><div class="uix-tm">0:00</div>';return p;}
var buildHud=safe(function(g){
  if(HUD[g])return HUD[g];var scr=document.getElementById(g);if(!scr)return null;
  var hud=el('div','uix-hud');hud.dataset.game=g;
  var top=el('div','uix-top','<span class="uix-title">'+NAME[g]+'</span><span class="uix-chip"></span>');hud.appendChild(top);
  var H={g:g,root:hud,chip:$('.uix-chip',top)};
  if(g==='uno'){H.seats=el('div','uix-seats');hud.appendChild(H.seats);}
  else{var m=el('div','uix-match');H.a=playerEl(g,'a');H.b=playerEl(g,'b');m.appendChild(H.a);m.appendChild(el('div','uix-vs','VS'));m.appendChild(H.b);hud.appendChild(m);H.match=m;}
  var st=el('div','uix-status');hud.appendChild(st);H.status=st;
  if(g==='chess'){var tn=$('#app .hud .turn');if(tn)st.appendChild(tn);var msg=$('#msg');if(msg)st.appendChild(msg);}
  else if(g==='uno'){var us=$('#unoStatus');if(us)st.appendChild(us);var ut=$('#unoTop');if(ut)st.appendChild(ut);}
  else{var s0=document.getElementById(g+'Status');if(s0)st.appendChild(s0);}
  // dock
  var dock=el('div','uix-dock uix-glass');H.dock=dock;
  var src=g==='chess'?$$('#app .hud .topbtns button'):$$('#'+g+' .hudtop .toolbar button');
  var byK={};src.forEach(function(b){var k=kindOf(b);b.dataset.uixK=k;if(!byK[k])byK[k]=b;});
  H.byK=byK;var lay=LAYOUT[g];
  lay.pri.forEach(function(k){var b=byK[k];if(k==='log'&&g==='chess'){b=el('button','uix-db');b.type='button';b.dataset.uixK='log';b.innerHTML=ic('log')+'<span class="uix-lb">기보</span>';b.onclick=function(){scr.classList.toggle('uix-log-open');b.classList.toggle('uix-onstate',scr.classList.contains('uix-log-open'));};}
    if(b){dock.appendChild(b);if(k!=='log')watchBtn(b);}});
  dock.appendChild(el('span','uix-sep uix-sec'));
  lay.sec.forEach(function(k){var b=byK[k];if(b){b.classList.add('uix-sec');dock.appendChild(b);watchBtn(b);}});
  var more=el('button','uix-db uix-more-sec');more.type='button';more.dataset.uixK='more';more.innerHTML=ic('more')+'<span class="uix-lb">더보기</span>';more.onclick=function(){openSheet(g);};dock.appendChild(more);
  var gear=el('button','uix-db uix-sec');gear.type='button';gear.dataset.uixK='gear';gear.innerHTML=ic('gear')+'<span class="uix-lb">설정</span>';gear.onclick=function(){if(window.SettingsUI&&SettingsUI.open){SettingsUI.open();return;}openSheet(g);};dock.appendChild(gear);
  hud.appendChild(dock);
  if(g==='uno'){var ua=el('div','uix-unoact');var cb=$('#unoCallBtn'),db=$('#unoDrawBtn');if(db){ua.appendChild(db);watchBtn(db);}if(cb){ua.appendChild(cb);watchBtn(cb);}hud.appendChild(ua);H.unoact=ua;}
  // leftovers (any unknown toolbar buttons) go to sheet via proxies
  H.extra=src.filter(function(b){return b.dataset.uixK==='x';});
  // back button
  var bb=$('.backbtn',scr);if(bb&&!bb.dataset.uix){bb.dataset.uix='1';bb.innerHTML=ic('back')+'<span>메뉴</span>';bb.setAttribute('aria-label','메뉴로');}
  var host=g==='chess'?scr:($('.g2d',scr)||scr);host.appendChild(hud);
  HUD[g]=H;return H;
});

/* ================= SHEET ================= */
var sheet=null,sheetG=null;
function sheetEl(){if(sheet)return sheet;sheet=el('div','uix-sheet uix-layer');sheet.id='uixSheet';sheet.innerHTML='<div class="uix-sheet-box" role="dialog" aria-modal="true"></div>';sheet.addEventListener('click',function(e){if(e.target===sheet)closeSheet();});document.body.appendChild(sheet);return sheet;}
function act(icon,label,fn,extra){var b=el('button','uix-act'+(extra?' '+extra:''),ic(icon)+'<span>'+label+'</span>');b.type='button';b.onclick=function(){closeSheet();setTimeout(fn,30);};return b;}
var proxyList=[];
function syncProxies(){proxyList.forEach(function(p){if(!p.src||!p.src.isConnected)return;var L=labelOf(p.k,p.src.dataset.raw||p.src.textContent);var sp=p.btn.querySelector('span');if(sp)sp.textContent=L.t;var i=p.btn.querySelector('.uix-ic');if(i)i.outerHTML=ic(L.i);p.btn.classList.toggle('uix-onstate',!!L.on&&p.k==='renju');});}
function sndSync(){var on=true;try{on=sfx().isOn();}catch(e){}$$('[id$="SndBtn"],#soundToggle').forEach(function(b){b.textContent=on?'🔊':'🔇';});}
var openSheet=safe(function(g){var s=sheetEl(),box=$('.uix-sheet-box',s);sheetG=g;proxyList=[];box.innerHTML='<div class="uix-grab"></div>';
  box.appendChild(el('h3',null,ic(g?'more':'gear')+'<span>'+(g?NAME[g]+' 메뉴':'설정')+'</span>'));
  if(g&&HUD[g]){var H=HUD[g];box.appendChild(el('h4',null,'게임'));var acts=el('div','uix-acts');
    var ks=LAYOUT[g].sec.concat(['restart','mode']).filter(function(k,i,a){return a.indexOf(k)===i&&k!=='sound';});
    ks.forEach(function(k){var src=H.byK[k];if(!src)return;var L=labelOf(k,src.dataset.raw||src.textContent);var b=act(L.i,L.t,function(){src.click();});if(k==='renju')b.classList.toggle('uix-onstate',!!L.on);acts.appendChild(b);proxyList.push({k:k,src:src,btn:b});});
    (H.extra||[]).forEach(function(src){acts.appendChild(act('more',src.textContent.trim()||'기타',function(){src.click();}));});
    var scr=document.getElementById(g);var zb=g==='chess'?[$('#zoomIn'),$('#zoomOut'),$('#resetView')]:$$('.zoom3d button',scr);
    if(zb[0])acts.appendChild(act('zin','확대',function(){zb[0].click();}));
    if(zb[1])acts.appendChild(act('zout','축소',function(){zb[1].click();}));
    if(zb[2])acts.appendChild(act('zreset','시점 초기화',function(){zb[2].click();}));
    acts.appendChild(act('home','메인 메뉴',function(){if(typeof window.backToLauncher==='function')window.backToLauncher();}));
    box.appendChild(acts);}
  box.appendChild(el('h4',null,'설정'));
  function row(icon,t,sub,get,set,dis){var r=el('div','uix-row','<span class="uix-ic" style="color:var(--ux-gold)">'+ic(icon).replace(/^<i class="uix-ic">|<\/i>$/g,'')+'</span><div class="t"><b>'+t+'</b><small>'+sub+'</small></div>');var sw=el('button','uix-sw'+(get()?' on':''));sw.type='button';sw.setAttribute('role','switch');sw.setAttribute('aria-label',t);sw.setAttribute('aria-checked',get()?'true':'false');if(dis)sw.disabled=true;sw.onclick=function(){set(!get());sw.classList.toggle('on',!!get());sw.setAttribute('aria-checked',get()?'true':'false');};r.appendChild(sw);box.appendChild(r);}
  row('sndOn','효과음','착수·승리 사운드',function(){try{return sfx().isOn();}catch(e){return true;}},function(v){try{var x=sfx();if(x.isOn()!==v)x.toggle();if(v&&x.select)x.select();}catch(e){}sndSync();});
  var canVib=window.Haptics?Haptics.supported():(typeof navigator.vibrate==='function');
  row('vib','진동',canVib?'착수·체크·승리 시 햅틱':'이 기기는 진동을 지원하지 않아요',function(){return canVib&&(window.Haptics?Haptics.on():S.vib);},function(v){S.vib=v;lsSet('vib',v);if(window.Haptics)Haptics.set(v);if(v)buzz(20,true);},!canVib);
  row('timer','턴 타이머','플레이어 패널에 생각 시간 표시',function(){return S.timer;},function(v){S.timer=v;lsSet('timer',v);applySettings();});
  var Q=gq();if(Q&&Q.setMode){var r=el('div','uix-row','<span class="uix-ic" style="color:var(--ux-gold)"><svg viewBox="0 0 24 24">'+P.hq+'</svg></span><div class="t"><b>화질</b><small>3D 렌더링 품질</small></div>');box.appendChild(r);
    var seg=el('div','uix-seg');[['auto','자동'],['ultra','울트라'],['high','높음'],['mid','중간'],['low','낮음']].forEach(function(m){var b=el('button',Q.mode===m[0]?'on':'',m[1]);b.type='button';b.onclick=function(){try{Q.setMode(m[0]);}catch(e){}$$('button',seg).forEach(function(x){x.classList.toggle('on',x===b);});};seg.appendChild(b);});box.appendChild(seg);}
  var c=el('button','uix-close','닫기');c.type='button';c.onclick=closeSheet;box.appendChild(c);  requestAnimationFrame(function(){s.classList.add('show');});
});
function closeSheet(){if(sheet)sheet.classList.remove('show');}

/* ================= CALLOUT ================= */
var callEl=null,lastCall=0;
function callout(t,sub,color){var now=Date.now();if(now-lastCall<700)return;lastCall=now;if(!callEl){callEl=el('div','uix-layer');callEl.id='uixCallout';document.body.appendChild(callEl);}
  callEl.innerHTML=t+(sub?'<small>'+sub+'</small>':'');callEl.style.setProperty('--cc',color||'rgba(255,90,70,.85)');callEl.classList.remove('go');void callEl.offsetWidth;callEl.classList.add('go');}
UIX.callout=callout;

/* ================= VIBRATION ================= */
function buzz(p,force){try{if(!(force||S.vib))return;if(!(window.Haptics?Haptics.supported():typeof navigator.vibrate==='function'))return;if(!force&&!(window.matchMedia&&matchMedia('(pointer:coarse)').matches))return;if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;var g=activeScreen();if(!force&&BOARD.indexOf(g)<0)return;
  if(window.Haptics){if(window.Toss&&Toss.inToss)Haptics.fire('basicWeak');else Haptics.fire('basicWeak',p);}else navigator.vibrate(p);}catch(e){}}

/* ================= RESULT ================= */
var resEl=null,reopen=null,resOpen=false,resInfo=null,resTimer=0;
function resultEl(){if(resEl)return resEl;resEl=el('div','uix-result uix-layer');resEl.id='uixResult';resEl.innerHTML='<div class="uix-res-card" role="dialog" aria-modal="true"></div>';document.body.appendChild(resEl);
  reopen=el('button','uix-layer',ic('trophy')+'<span>결과 보기</span>');reopen.id='uixReopen';reopen.type='button';reopen.onclick=function(){if(resInfo)renderResult(resInfo);};document.body.appendChild(reopen);return resEl;}
function srcText(g){if(g==='chess'){var m=$('#msg');return m&&m.style.display!=='none'?m.textContent:'';}var b=document.getElementById(g+'Win');return b&&b.style.display!=='none'?b.textContent:'';}
function stageEndBtns(g){var se=g==='chess'?$('#stageEnd'):document.getElementById(g+'StageEnd');if(!se)return [];if(getComputedStyle(se).display==='none')return [];return $$('button',se);}
function cleanTxt(t){return (t||'').replace(/[🏆⭐✊😅🎉👑]/g,'').replace(/\s+/g,' ').trim();}
var showResult=safe(function(kind){var g=activeScreen();if(BOARD.indexOf(g)<0)return;var s=ST[g];
  if(window.UIX_SKIP_RESULT&&window.UIX_SKIP_RESULT(g))return;
  var raw=cleanTxt(srcText(g));var mode=s.mode;
  if(!mode){if(/스테이지|^S\d/.test(raw))mode='arcade';}
  var title,sub=raw,icon='trophy';
  if(kind==='draw'){title='무승부';icon='handshake';}
  else if(/클리어/.test(raw)){title='클리어!';}
  else if(/실패/.test(raw)){title='아쉬워요';kind='lose';icon='sad';}
  else if(mode==='pvp'){var m=raw.match(/(흑|백|초|한|은색|검은색|나|P\d)\s*(?:\S*\s)?승/);title=m?m[1]+' 승리!':'게임 종료';if(m&&raw.replace(/[!.\s]/g,'')===title.replace(/[!.\s]/g,''))sub='멋진 대국이었어요';}
  else if(kind==='win'){title='승리!';}
  else{title='패배';icon='sad';}
  if(!sub||sub===title||sub.replace(/!/g,'')===title.replace(/!/g,''))sub=kind==='win'?'멋진 플레이였어요!':kind==='lose'?'다음엔 이길 수 있어요':'팽팽한 승부였어요';
  var elapsed=Date.now()-s.gameSince;var stats=[];
  if(g==='chess'){var n=$$('#movelog .mv').filter(function(x){return x.textContent.trim();}).length;if(n)stats.push('총 '+n+'수');}
  else if(g!=='uno'&&s.moves)stats.push('총 '+(s.moves+1)+'수');
  if(s.started&&elapsed<6*3600e3)stats.push(ic('timer').replace('uix-ic','uix-ic" style="width:14px;height:14px;vertical-align:-2px')+' '+fmt(elapsed));
  var ml=modeLabel(g);
  if(window.UIX_RESULT_STATS){try{stats=stats.concat(window.UIX_RESULT_STATS(g,kind)||[]);}catch(e){}}
  renderResult({g:g,kind:kind,title:title,sub:sub,stats:stats,k:NAME[g]+(ml?' · '+ml:''),icon:icon,se:g==='chess'?'#stageEnd':'#'+g+'StageEnd'});
});
function renderResult(R){var r=resultEl(),c=$('.uix-res-card',r);resInfo=R;
  r.classList.remove('win','lose','draw');r.classList.add(R.kind);
  c.innerHTML='<div class="uix-emb">'+ic(R.icon)+'</div><div class="uix-res-k">'+R.k+'</div><div class="uix-res-t">'+R.title+'</div><div class="uix-res-s"></div><div class="uix-res-st">'+R.stats.map(function(x){return '<span>'+x+'</span>';}).join('')+'</div><div class="uix-res-a"></div>';
  $('.uix-res-s',c).textContent=R.sub;
  var A=$('.uix-res-a',c);
  function btn(cls,icon,t,act,fn){var b=el('button',cls,ic(icon)+'<span>'+t+'</span>');b.type='button';b.dataset.act=act;b.onclick=safe(fn);A.appendChild(b);return b;}
  var se=stageEndBtns(R.g);
  if(se.length){se.forEach(function(sb,i){var t=sb.textContent.trim();btn(i===0?'pri':'',/다음/.test(t)?'next':/선택/.test(t)?'stage':'restart',t.replace(/[▶◀]/g,'').trim(),i===0?'rematch':'stage'+i,function(){closeResult(true);sb.click();});});}
  else btn('pri','restart','다시 하기','rematch',function(){rematch(R.g);});
  btn('','mode','모드 선택','setup',function(){closeResult(true);var Gm=G(R.g);if(R.g==='chess'){var mb=$('#menuBtn');if(mb)mb.click();}else if(Gm&&Gm.openSetup)Gm.openSetup();});
  btn('','eye','보드 보기','view',function(){closeResult(false);});
  if(!window.GAME_ID)btn('','home','메인 메뉴','menu',function(){closeResult(true);if(typeof window.backToLauncher==='function')window.backToLauncher();});
  if(window.UIX_RESULT_BUTTONS){try{window.UIX_RESULT_BUTTONS(R,btn);}catch(e){}}
  if(reopen)reopen.classList.remove('show');
  resOpen=true;document.body.classList.add('uix-res-on');requestAnimationFrame(function(){r.classList.add('show');});
  setTimeout(function(){var p=$('.pri',A);if(p&&resOpen)try{p.focus({preventScroll:true});}catch(e){}},400);
}
function closeResult(full){if(resEl)resEl.classList.remove('show');resOpen=false;document.body.classList.remove('uix-res-on');clearTimeout(resTimer);
  if(reopen){if(full){reopen.classList.remove('show');resInfo=null;}else reopen.classList.add('show');}}
UIX.closeResult=closeResult;
function rematch(g){closeResult(true);var Gm=G(g),s=ST[g];
  if(g==='chess'){var mb=$('#menuBtn');if(!mb)return;var mode=s.mode||'cpu';mb.click();
    setTimeout(function(){var card=$('#modeCards [data-mode="'+mode+'"]');if(mode==='training'||mode==='arcade'){if(card)card.click();return;}if(card)card.click();
      if(mode==='cpu')setTimeout(function(){var d=$('#diffBox [data-diff="'+(s.lv||2)+'"]')||$('#diffBox [data-diff]');if(d)d.click();},60);},60);return;}
  if(Gm&&Gm.restart){Gm.restart();}
}
UIX.rematch=rematch;

/* ================= TICK ================= */
function parseSide(g,t){t=(t||'').replace(/따냄.*/,'');
  if(g==='janggi'){if(/CPU|생각/.test(t))return 'b';if(/당신|초 차례|\(초\)/.test(t))return 'a';if(/한 차례/.test(t))return 'b';return null;}
  if(/CPU|생각/.test(t))return 'b';if(/당신|흑/.test(t))return 'a';if(/백/.test(t))return 'b';return null;}
function sideNames(g,s,t){if(window.UIX_SIDE_NAMES){try{var _r=window.UIX_SIDE_NAMES(g);if(_r)return _r;}catch(e){}}var cpu=s.mode==='cpu'||s.mode==='arcade'||/당신|CPU/.test(t);
  var stage=(t.match(/(?:스테이지 |^S)(\d+)/)||[])[1];
  var cn={omok:['흑','백'],baduk:['흑','백'],janggi:['초','한'],chess:[chessSide('w'),chessSide('b')]}[g];
  if(g==='chess'&&s.mode==='pvp')cpu=false;else if(g==='chess')cpu=s.mode!=='pvp'&&!!s.mode;
  if(cpu){var sub=stage?'스테이지 '+stage:(s.lv?LVK[s.lv]:'');return [['나',cn[0]],['CPU',[cn[1],sub].filter(Boolean).join(' · ')]];}
  return [[cn[0],'플레이어 1'],[cn[1],'플레이어 2']];}
function chessSide(w){var rows=$$('#sidepanel .cap-label');var i=w==='w'?0:1;var t=rows[i]?rows[i].textContent:'';t=t.replace(/(이|가)?\s*잡음.*/,'').trim();return t||(w==='w'?'은색':'검은색');}
var lastPinfo='',pinfoT=0,lastSeat='';
var tick=safe(function(){
  var g=activeScreen();if(BOARD.indexOf(g)<0)return;var H=HUD[g];if(!H)return;var scr=document.getElementById(g),s=ST[g];
  var setup=g==='chess'?$('#setup'):$('.setupmodal',scr);var tutOpen=false;
  var so=!!(setup&&!setup.classList.contains('hidden')&&getComputedStyle(setup).display!=='none');scr.classList.toggle('uix-setup-open',so);
  if(so&&resOpen)closeResult(true);
  if(H.chip)H.chip.textContent=modeLabel(g)||'';H.chip.style.display=H.chip.textContent?'':'none';
  if(g==='uno'){tickUno(H,s);}
  else{
    var t=g==='chess'?'':((document.getElementById(g+'Status')||{}).textContent||'');
    var side=null;
    if(g==='chess'){var d=$('#turnDot');side=d?(d.classList.contains('b')?'b':'a'):null;}
    else{side=parseSide(g,t);if(!side&&s.flip&&s.side)side=s.side==='a'?'b':'a';}
    s.flip=false;
    if(t)s.status=t;
    if(side&&side!==s.side){if(s.side)s.moves++;s.side=side;s.since=Date.now();}
    var nm=sideNames(g,s,s.status||t);
    [['a',H.a,0],['b',H.b,1]].forEach(function(x){var P0=x[1];var on=s.side===x[0]&&!resOpen;P0.classList.toggle('on',on);
      var pn=$('.uix-pn',P0),ps=$('.uix-ps',P0);if(pn.textContent!==nm[x[2]][0])pn.textContent=nm[x[2]][0];if(ps.textContent!==nm[x[2]][1])ps.textContent=nm[x[2]][1];
      P0.classList.toggle('think',on&&nm[x[2]][0]==='CPU');
      var tm=$('.uix-tm',P0);var v=on?fmt(Date.now()-s.since):'';if(tm.textContent!==v&&on)tm.textContent=v;});
    var ca=$('.uix-cap',H.a),cb=$('.uix-cap',H.b),va='',vb='';
    if(g==='baduk'){var m=t.match(/따냄 흑(\d+) 백(\d+)/);if(m){va=+m[1]?'따냄 '+m[1]:'';vb=+m[2]?'따냄 '+m[2]:'';}}
    if(g==='chess'){va=(($('#capByW')||{}).textContent||'')+' '+(($('#scoreW')||{}).textContent||'');vb=(($('#capByB')||{}).textContent||'')+' '+(($('#scoreB')||{}).textContent||'');va=va.trim();vb=vb.trim();
      var pn2=($('#pName')||{}).textContent||'';if(pn2!==lastPinfo){if(lastPinfo)scr.classList.add('uix-pinfo');lastPinfo=pn2;clearTimeout(pinfoT);pinfoT=setTimeout(function(){scr.classList.remove('uix-pinfo');},2600);}}
    if(ca.textContent!==va)ca.textContent=va;if(cb.textContent!==vb)cb.textContent=vb;
  }
  // auto-close result if source disappeared (new game started)
  if(resOpen&&resInfo&&resInfo.g===g&&!srcText(g)&&!stageEndBtns(g).length&&Date.now()-resInfo.at>1500)closeResult(true);
  if(!resOpen&&reopen&&reopen.classList.contains('show')&&!srcText(g))reopen.classList.remove('show');
});
var lastUnoKey='';
function tickUno(H,s){var seats=$('#unoSeats');if(!seats)return;var spans=$$('span',seats).filter(function(x){return !/→|←/.test(x.textContent);});
  var html=seats.innerHTML;if(html===lastSeat)return;lastSeat=html;var out=[],me=0;
  spans.forEach(function(sp,i){var t=sp.textContent.trim();var cur=/▶/.test(t);t=t.replace('▶','').trim();var m=t.match(/^(\S+)\s+(\d+)장/);if(!m)return;var nm=m[1],n=+m[2];if(nm==='나')me=n;
    var ch=window.Characters&&Characters.list&&Characters.list.filter(function(c){return c.name===nm;})[0];
    out.push('<div class="uix-seat uix-glass'+(cur?' on':'')+(nm==='나'?' me':'')+(n===1?' one':'')+'"><span class="sv">'+(nm==='나'?'나':ch?ch.ic:nm.replace('P',''))+'</span><span class="sn">'+(nm==='나'?'나':ch?nm:'CPU '+nm.replace('P',''))+'</span><span class="sc"><i></i>'+n+'</span></div>');
    if(cur){if(s.side!==nm){s.side=nm;s.since=Date.now();s.moves++;}}});
  H.seats.innerHTML=out.join('<span class="uix-dir">›</span>');
  var cb=$('#unoCallBtn');var myTurn=/▶\s*나/.test(seats.textContent);if(cb)cb.classList.toggle('uix-pulse',myTurn&&me===2);
  var top=$('#unoTop');if(top){var bs=$$('b',top);var last=bs[bs.length-1];if(last&&!$('.uix-curcol',top)){var dot=el('span','uix-curcol');dot.style.color=last.style.color;top.appendChild(dot);}else if(last){var d2=$('.uix-curcol',top);d2.style.color=last.style.color;}}
}
function tickUnoTop(){var top=$('#unoTop');if(!top)return;var bs=$$('b',top);var last=bs[bs.length-1];if(!last)return;var d=$('.uix-curcol',top);if(!d){d=el('span','uix-curcol');top.appendChild(d);}d.style.color=last.style.color;}

/* ================= UNO extras ================= */
var unoInit=safe(function(){
  var hand=$('#unoHand');if(!hand||hand.dataset.uix)return;hand.dataset.uix='1';var prevN=0,lastRect=null,lastCls='',lastHTML='',lastT=0;
  function layout(){var cards=$$('.uc',hand);var n=cards.length;if(!n){prevN=0;return;}
    var cs=getComputedStyle(hand);var W=(hand.clientWidth||window.innerWidth)-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0)-30;var cw=cards[0].offsetWidth||64;var gap=6;var need=n*cw+(n-1)*gap;
    var ov=need>W?((W-cw)/(n-1)-cw):gap;ov=Math.min(ov,gap);
    var span=Math.min(40,n*4),mid=(n-1)/2;
    cards.forEach(function(c,i){c.style.marginLeft=i?ov+'px':'0';var off=n>1?(i-mid)/mid:0;c.style.setProperty('--r',(off*span/2).toFixed(2)+'deg');c.style.setProperty('--dy',(Math.abs(off)*Math.abs(off)*Math.min(18,n*1.6)).toFixed(1)+'px');c.style.zIndex=String(i+1);});
    if(n>prevN&&prevN>0){cards.slice(prevN-n<0?prevN:0).forEach(function(c,j){c.classList.add('uix-in');c.style.animationDelay=(j*60)+'ms';});}
    if(n<prevN&&lastRect&&Date.now()-lastT<1500)flyCard();
    prevN=n;tickUnoTop();}
  function flyCard(){var mount=$('#unoMount');if(!mount||!lastRect)return;var mr=mount.getBoundingClientRect();var gh=el('div','uix-ghost '+lastCls,lastHTML);gh.style.left=lastRect.left+'px';gh.style.top=lastRect.top+'px';gh.style.width=lastRect.width+'px';gh.style.height=lastRect.height+'px';document.body.appendChild(gh);
    var dx=mr.left+mr.width/2-lastRect.left-lastRect.width/2,dy=mr.top+mr.height*0.45-lastRect.top-lastRect.height/2;lastRect=null;
    if(gh.animate){var a=gh.animate([{transform:'translate(0,0) rotate(0) scale(1)',opacity:1},{transform:'translate('+dx*0.6+'px,'+(dy*0.6-40)+'px) rotate(-12deg) scale(1.05)',opacity:1,offset:.6},{transform:'translate('+dx+'px,'+dy+'px) rotate(8deg) scale(.7)',opacity:0}],{duration:520,easing:'cubic-bezier(.3,.7,.3,1)'});a.onfinish=function(){gh.remove();};}else setTimeout(function(){gh.remove();},500);}
  hand.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('.uc');if(!c)return;lastRect=c.getBoundingClientRect();lastT=Date.now();lastCls=(c.className.match(/\b(red|yellow|green|blue|wild)\b/)||['','wild'])[1];lastHTML=c.innerHTML;},true);
  new MutationObserver(safe(layout)).observe(hand,{childList:true});
  window.addEventListener('resize',safe(layout));layout();
  var uno=$('#uno');new MutationObserver(safe(function(){var cp=$('#unoColorPicker');if(!cp||cp.dataset.uix)return;cp.dataset.uix='1';var t=el('div','uix-cp-t','색을 고르세요');cp.insertBefore(t,cp.firstChild);var x=el('button','uix-cp-x','취소');x.type='button';x.onclick=function(){cp.style.display='none';};cp.appendChild(x);})).observe(uno,{childList:true});
  var win=$('#unoWin');if(win){var lastW='';new MutationObserver(safe(function(){var t=win.textContent;if(t===lastW||win.style.display==='none'){lastW=win.style.display==='none'?'':t;return;}lastW=t;
    if(/원카드!/.test(t)&&!/벌칙|안 외/.test(t))callout('원카드!',/^.+?: 원카드/.test(t)?t.split(':')[0]:'',  'rgba(255,80,50,.9)');
    else if(/벌칙|안 외/.test(t))callout('벌칙!','+2장','rgba(255,170,40,.9)');
    else if(/\+4/.test(t))callout('+4','','rgba(120,120,255,.9)');
    else if(/\+2/.test(t))callout('+2','','rgba(255,170,40,.9)');
  })).observe(win,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['style']});}
});

/* ================= WRAPPERS ================= */
function wrapObj(o,name,after,before){if(!o||typeof o[name]!=='function'||o[name].__uix)return;var f=o[name];var w=function(){try{before&&before.apply(this,arguments);}catch(e){}var r=f.apply(this,arguments);try{after&&after.apply(this,arguments);}catch(e){}return r;};w.__uix=1;o[name]=w;}
var wrapGames=safe(function(){
  ['omok','janggi','baduk','uno'].forEach(function(g){var Gm=G(g);if(!Gm||Gm.__uixw)return;try{Gm.__uixw=1;}catch(e){}
    if(g==='uno'){wrapObj(Gm,'start',function(){resetGame('uno','cpu');});wrapObj(Gm,'setLevel',function(lv){ST.uno.lv=lv;});wrapObj(Gm,'setPlayers',function(n){ST.uno.n=n;});}
    else wrapObj(Gm,'start',function(mode,lv){resetGame(g,mode,typeof lv==='number'?lv:null);});
    wrapObj(Gm,'restart',function(){resetGame(g);});
    wrapObj(Gm,'startStage',function(){resetGame(g,'arcade');});
    wrapObj(Gm,'openSetup',function(){closeResult(true);});
  });
});
function chessClicks(){document.addEventListener('click',function(e){var t=e.target;if(!t||!t.closest)return;
  var c=t.closest('#modeCards [data-mode]');if(c){var m=c.dataset.mode;ST.chess.mode=m;if(m==='pvp')resetGame('chess','pvp');}
  var d=t.closest('#diffBox [data-diff]');if(d){resetGame('chess','cpu',parseInt(d.dataset.diff,10)||2);}
  var st=t.closest('#stageGrid .stage-cell, #stageEnd button');if(st)resetGame('chess','arcade');
  var tr=t.closest('#trainBox .train-cell');if(tr)resetGame('chess','training');
},true);}
var wrapSfx=safe(function(){var X=sfx();if(!X||X.__uixw)return;X.__uixw=1;
  ['move','place','capture'].forEach(function(k){wrapObj(X,k,function(){var g=activeScreen();if(ST[g])ST[g].flip=true;buzz(k==='capture'?[18,30,18]:12);});});
  wrapObj(X,'check',function(){var g=activeScreen();if(g==='janggi')callout('장군!','','rgba(255,70,50,.9)');else if(g==='chess')callout('체크!','','rgba(255,70,50,.9)');buzz([40,40,40]);});
  ['win','lose','draw'].forEach(function(k){wrapObj(X,k,function(){var g=activeScreen();if(BOARD.indexOf(g)<0)return;buzz(k==='win'?[30,60,30,60,120]:k==='lose'?[160]:[40,40]);clearTimeout(resTimer);resTimer=setTimeout(function(){showResult(k);if(resInfo)resInfo.at=Date.now();},1050);});});
});
var wrapNav=safe(function(){
  var oo=window.openGame;if(typeof oo==='function'&&!oo.__uix){var w=function(g){closeSheet();closeResult(true);if(BOARD.indexOf(g)>=0)iris();var r=oo.apply(this,arguments);
      try{playedThisSession[g]=true;lsSet('last',{g:g,t:Date.now(),m:modeLabel(g)});if(BOARD.indexOf(g)>=0){buildHud(g);if(g==='uno')unoInit();wrapGames();sndSync();}}catch(e){console.warn('[UIX]',e);}return r;};w.__uix=1;window.openGame=w;}
  var ob=window.backToLauncher;if(typeof ob==='function'&&!ob.__uix){var w2=function(){var from=activeScreen();closeSheet();closeResult(true);if(BOARD.indexOf(from)>=0){iris();try{var l=lsGet('last',null);if(l&&l.g===from){l.m=modeLabel(from);l.t=Date.now();lsSet('last',l);}}catch(e){}}var r=ob.apply(this,arguments);refreshLauncher();return r;};w2.__uix=1;window.backToLauncher=w2;}
});

/* ================= KEYBOARD ================= */
function keys(){document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(sheet&&sheet.classList.contains('show')){closeSheet();e.stopPropagation();}else if(resOpen){closeResult(false);}},true);}

/* ================= BOOT ================= */
var boot=safe(function(){applySettings();buildLauncher();wrapNav();wrapSfx();wrapGames();chessClicks();keys();
  var a=activeScreen();if(BOARD.indexOf(a)>=0){buildHud(a);if(a==='uno')unoInit();}
  setInterval(tick,250);
  // keep launcher fresh after other late scripts
  setTimeout(safe(function(){wrapNav();wrapSfx();wrapGames();refreshLauncher();}),500);
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
