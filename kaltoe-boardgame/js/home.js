/* ===== 칼퇴 보드게임 홈 (합본 앱 첫 화면) =====
   Reads the shared wallet (coins, attendance) and each game's saved progress, then lets you pick a game.
   Every game is its own page next to this one (./<id>/index.html). */
(function () {
  // share links (intoss://<app>?g=<game>:<code>) land here — hand them to that game's page
  try { const q = new URLSearchParams(location.search).get('g'); const gid = q && q.split(':')[0];
    if (gid && (window.HOME_GAMES || []).some(g => g.id === gid)) { location.replace('./' + gid + '/index.html' + location.search); return; } } catch (e) {}
  const GAMES = window.HOME_GAMES || [];
  const PREFIX = 'minigames_v1_';
  const T = () => window.Toss || null;
  async function get(key) {
    try { const t = T(); const raw = t && t.storage ? await t.storage.get(PREFIX + key) : localStorage.getItem(PREFIX + key); return raw == null ? null : JSON.parse(raw); } catch (e) { return null; }
  }
  const kst = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  const $ = s => document.querySelector(s);
  function go(id, from, q) {
    const t = T(); if (t) { t.haptic && t.haptic('tickWeak'); t.log && t.log('home_pick', { game: id, from }); }
    document.body.classList.add('leaving');
    setTimeout(() => { location.href = './' + id + '/index.html' + (q || ''); }, 120);
  }
  async function render() {
    const w = (await get('app_wallet')) || { points: 0, games: {} };
    const games = w.games || {};
    const att = (w.growth && w.growth.att) || { n: 0, last: '' };
    const checked = att.last === kst();
    const gr = w.growth || {}, TITLES = ['인턴', '사원', '주임', '대리', '과장', '차장', '부장', '이사', '상무', '전무', '사장'];
    const cv = gr.career || 0, cards = Object.keys(gr.cards || {}).length;
    $('#hId').innerHTML = `<span class="ph">${['🧑‍🎓', '👨‍💼', '👨‍💼', '🧑‍💻', '🤵', '🧔', '👔', '🕴️', '🎩', '🎩', '👑'][cv]}</span><span class="t"><small>보드게임 주식회사 사원증</small><b>${(gr.nick || '신입').replace(/[<>&]/g, '')} · ${(gr.title || TITLES[cv]).replace(/[<>&]/g, '')}</b><em>${cv < 10 ? '승진 도전에서 ' + (cv + 1) + '단계를 깨면 ' + TITLES[cv + 1] + ' 승진' : (gr.title === '명예 회장' ? '모든 게임의 잼사장을 이겼어요' : '다른 게임의 잼사장도 이겨 보세요 (' + ['omok', 'janggi', 'baduk', 'chess'].filter(id => (gr.story && gr.story.boss || {})[id]).length + '/4)')}</em></span><span class="cd">📇 ${cards}/10</span>`;
    const h = new Date(Date.now() + 9 * 3600e3).getUTCHours();
    $('#hKal').hidden = !(h === 18 || h === 17); $('#hKal').innerHTML = h === 18 ? '🏃 <b>칼퇴 타임</b> · 19시까지 모든 코인 2배!' : '⏰ 18시부터 <b>칼퇴 타임</b> · 코인 2배';
    $('#hCoins').textContent = (w.points || 0).toLocaleString();
    $('#hAtt').textContent = checked ? att.n + '일차 출석 완료' : '오늘 출석 전';
    $('#hAttWrap').classList.toggle('todo', !checked);
    const played = GAMES.filter(g => games[g.id] && games[g.id].games > 0);
    const total = played.reduce((a, g) => a + games[g.id].r, 0);
    $('#hTotal').textContent = total ? total.toLocaleString() : '—';
    // 이어서 두기: 저장된 진행 중 대국이 있으면 그 게임을 가장 먼저 보여준다 (resume.js 가 남긴 스냅샷)
    const rs = await get('resume_game');
    const rsOk = rs && rs.v === 1 && rs.at && (Date.now() - rs.at) < 7 * 864e5 && Array.isArray(rs.moves) && rs.moves.length;
    const rsGame = rsOk ? GAMES.find(g => g.id === rs.g) : null;
    // 이어서 하기: the last game you played
    const last = GAMES.find(g => g.id === w.last);
    const cont = $('#hCont');
    if (rsGame) {
      const MODES = { cpu: 'CPU', arcade: '스테이지', pvp: '2인', training: '트레이닝' };
      const LVS = { 1: '쉬움', 2: '보통', 3: '어려움' };
      const mode = rs.mode === 'arcade' ? '스테이지 ' + (rs.stage || 1) : [MODES[rs.mode] || '', LVS[rs.level] || ''].filter(Boolean).join(' ');
      cont.innerHTML = `<span class="ci">${rsGame.ic}</span><span class="ct"><small>이어서 두기</small><b>${rsGame.name}</b><em>${[mode, rs.moves.length + '수 진행'].filter(Boolean).join(' · ')}</em></span><span class="cg">▶</span>`;
      cont.hidden = false; cont.onclick = () => go(rsGame.id, 'resume', '?resume=1');
    } else if (last) {
      const s = games[last.id];
      cont.innerHTML = `<span class="ci">${last.ic}</span><span class="ct"><small>이어서 하기</small><b>${last.name}</b>${s && s.rank ? `<em>${s.rank} · 레이팅 ${s.r}</em>` : ''}</span><span class="cg">▶</span>`;
      cont.hidden = false; cont.onclick = () => go(last.id, 'continue');
    } else {
      cont.innerHTML = `<span class="ci">🎲</span><span class="ct"><small>처음이라면</small><b>오목부터 한 판</b><em>규칙이 가장 쉬워요</em></span><span class="cg">▶</span>`;
      cont.hidden = false; cont.onclick = () => go('omok', 'first');
    }
    $('#hGrid').innerHTML = GAMES.map(g => {
      const s = games[g.id];
      const sub = s && s.games > 0 ? `${s.rank || ''} · ${s.r}` : g.tag;
      return `<button type="button" class="hg" data-g="${g.id}" style="--ac:${g.ac}">${g.isNew ? '<i class="nw">NEW</i>' : ''}<span class="gi">${g.ic}</span><b>${g.name}</b><small>${sub}</small></button>`;
    }).join('');
    document.querySelectorAll('.hg').forEach(b => { b.onclick = () => go(b.dataset.g, 'grid'); });
  }
  $('#hRank').onclick = () => { const t = T(); if (t && t.openLeaderboard) t.openLeaderboard(); else alert('토스 앱에서 종합 순위를 볼 수 있어요'); };
  window.addEventListener('pageshow', render);   // coming back from a game refreshes coins and ranks
  render();
  const t = T(); if (t && t.log) t.log('home_open', {});
})();
