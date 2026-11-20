/* 칼퇴 보드게임 웹/PWA 서비스 워커 (빌드 2026-11-20T05:27:05.555Z) */
const CACHE = "kaltoe-web-mwojekib";
const FILES = ["./home.css","./index.html","./main.css","./manifest.webmanifest","./meta.css","./nosel.css","./uix.css","./baduk/index.html","./chess/index.html","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./janggi/index.html","./js/ai-host.js","./js/app-shell.js","./js/board3d.js","./js/characters.js","./js/chest.js","./js/core.js","./js/daily-puzzle.js","./js/fun.js","./js/game-baduk.js","./js/game-chess.js","./js/game-janggi.js","./js/game-omok.js","./js/go-tactics.js","./js/growth.js","./js/home.js","./js/launcher.js","./js/meta.js","./js/monetize.js","./js/progress.js","./js/puzzles-baduk.js","./js/puzzles-chess.js","./js/puzzles-janggi.js","./js/puzzles-omok.js","./js/quality.js","./js/resume.js","./js/review.js","./js/rush.js","./js/settings-ui.js","./js/sfx-pack.js","./js/social.js","./js/story.js","./js/three-loader.js","./js/three.min.js","./js/toss-bridge.js","./js/touch-guard.js","./js/uix.js","./omok/index.html","./sfx/achieve.mp3","./sfx/check.mp3","./sfx/draw.mp3","./sfx/hint.mp3","./sfx/levelup.mp3","./sfx/lose.mp3","./sfx/pop.mp3","./sfx/reward.mp3","./sfx/select.mp3","./sfx/solve.mp3","./sfx/tap.mp3","./sfx/tok1.mp3","./sfx/tok2.mp3","./sfx/tok3.mp3","./sfx/tok_cap.mp3","./sfx/win.mp3"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;              // 외부 요청은 건드리지 않는다
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && res.status === 200) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  })));
});
