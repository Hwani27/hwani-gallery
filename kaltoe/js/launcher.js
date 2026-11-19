/* ===== Launcher control ===== */
function setGameActive(g){
  try{Omok.setActive&&Omok.setActive(g==='omok');}catch(e){}
  try{Janggi.setActive&&Janggi.setActive(g==='janggi');}catch(e){}
  try{Baduk.setActive&&Baduk.setActive(g==='baduk');}catch(e){}
  try{Uno.setActive&&Uno.setActive(g==='uno');}catch(e){}
  try{ChessApp.setActive&&ChessApp.setActive(g==='chess');}catch(e){}
  try{BlockAction.setActive&&BlockAction.setActive(g==='blockaction');}catch(e){}
}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}
function backToLauncher(){showScreen('launcher');setGameActive(null);}
let chessBooted=false;
function openGame(g){
  document.querySelectorAll('[id$="SndBtn"],#soundToggle').forEach(b=>{b.textContent=SFX.isOn()?'🔊':'🔇';});
  showScreen(g);
  if(g==='omok')Omok.ensure();
  if(g==='janggi')Janggi.ensure();
  if(g==='baduk')Baduk.ensure();
  if(g==='uno')Uno.ensure();
  if(g==='chess'&&!chessBooted){chessBooted=true;ChessApp.boot();}
  if(g==='blockaction') BlockAction.ensure();
  if(g==='blockfps' && window.BlockFPS) window.BlockFPS.ensure();
  setGameActive(g);
}
