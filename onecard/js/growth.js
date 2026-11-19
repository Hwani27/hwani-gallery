/* ===== Growth — what top-ranked Apps in Toss mini-apps share =====
   1) 출석 체크: 7-day stamp card, participation-based rewards (+ optional Toss-point promotion)
   2) 친구 초대 (공유 리워드): Toss contacts invite when configured, otherwise a share link with an
      invite code — the friend gets a welcome gift on first open
   3) 돌아온 플레이어 선물 after 3+ days away
   4) Console 핵심 지표: one clear core-action event `game_play_complete`, plus session length
   5) Crash guard: errors are logged and never leave a blank screen
   Promotions are participation-only (attendance, first game, invite) — never score-based. ===== */
const Growth = (function () {
  const T = () => window.Toss || null;
  const PROMO = window.PROMO || {};             // { attend: {code, amount}, firstGame: {code, amount}, invite: {code, amount} }
  const VIRAL = window.VIRAL_MODULE || '';
  const ATT = [10, 15, 20, 25, 30, 40, 0];        // day 7 = 상자 2개
  const log = (n, p) => { const t = T(); if (t) t.log(n, Object.assign({ game: Meta.ID }, p || {})); };
  const g = () => { const d = Meta.data; if (!d.growth) d.growth = { att: { n: 0, last: '' }, firstGame: false, promo: {}, inv: { lastShare: '', got: false, sent: 0 }, seen: '', me: Math.random().toString(36).slice(2, 9) }; return d.growth; };

  // ---- Toss-point promotion (once per key) ----
  async function promo(key, onceKey) {
    const p = PROMO[key]; const t = T(); if (!p || !p.code || !t || !t.promo) return false;
    const s = g(); const k = onceKey || key; if (s.promo[k]) return false;
    const r = await t.promo(p.code, p.amount || 1);
    if (r === 'ok') { s.promo[k] = 1; Meta.save(); Meta.toast('토스 포인트 ' + (p.amount || 1) + '원을 받았어요'); log('promo_grant', { key }); return true; }
    return false;
  }

  // ---- 1) 출석 체크 ----
  const today = () => Meta.kstKey(0);
  const checked = () => g().att.last === today();
  function checkIn() {
    const a = g().att; if (checked()) return;
    a.n = (a.n % 7) + 1; a.last = today();
    const day = a.n, pts = ATT[day - 1];
    if (pts) Meta.addPoints(pts);
    if (day === 7 && window.Chest) { const d = Meta.data; d.chest = d.chest || { pending: 0 }; d.chest.pending = (d.chest.pending || 0) + 2; }
    Meta.save(); Meta.renderHub();
    if (typeof SFX !== 'undefined' && SFX.reward) SFX.reward();
    const t = T(); if (t) t.haptic('success');
    const next = day === 7 ? '내일부터 새 출석판이 시작돼요' : '내일 ' + (day + 1) + '일차: ' + (day + 1 === 7 ? '🎁 상자 2개' : '+' + ATT[day] + ' 코인');
    Meta.toast(day + '일차 출석! ' + (pts ? '+' + pts + ' 코인' : '🎁 상자 2개') + ' · ' + next, 3200);
    log('attendance', { day });
    promo('attend', 'attend_' + today());
  }
  Meta.addHubPart({
    act: 'attend', top: true,
    html: () => {
      const a = g().att, done = checked(), n = done ? a.n : a.n % 7;
      const dots = ATT.map((p, i) => `<i class="${i < n ? 'on' : ''}${!done && i === n ? ' now' : ''}">${i === 6 ? '🎁' : i < n ? '✓' : i + 1}</i>`).join('');
      return `<button type="button" class="tg-attend${done ? ' done' : ''}" data-act="attend"><span class="tg-at-t"><b>${done ? '출석 완료' : '출석 체크'}</b><small>${done ? '내일 또 와요' : '눌러서 ' + (n + 1) + '일차 보상 받기'}</small></span><span class="tg-at-d">${dots}</span></button>`;
    },
    click: () => (checked() ? Meta.toast('오늘은 출석했어요. 7일째엔 행운 상자 2개!') : checkIn()),
  });

  // ---- 2) 친구 초대 ----
  async function invite() {
    const s = g().inv; const t = T();
    log('invite_open', { viral: !!VIRAL });
    if (VIRAL && t && t.invite) {
      const n = await t.invite(VIRAL, () => { s.sent++; Meta.addPoints(30); Meta.save(); });
      if (n !== null) { if (n > 0) { Meta.toast('친구 ' + n + '명에게 보냈어요 · +' + n * 30 + ' 코인'); promo('invite'); } log('invite_sent', { n, how: 'viral' }); Meta.renderHub(); return; }
    }
    const code = window.Social ? Social.codeOf('i.' + g().me) : '';
    const msg = '나랑 ' + Meta.NAME + ' 한 판 할래? 토스에서 바로 열려요. 처음 오면 🎁 행운 상자 2개 선물!';
    if (window.Social && code) await Social.send(msg, code); else await Meta.share(msg);
    if (s.lastShare !== today()) { s.lastShare = today(); s.sent++; if (window.Chest) Chest.grant('invite'); Meta.save(); Meta.renderHub(); Meta.toast('초대 고마워요! 행운 상자 1개 (하루 1번)'); }
    log('invite_sent', { how: 'link' });
  }
  if (window.Social && Social.onCode) Social.onCode('i', p => {
    const s = g().inv;
    if (p.from === g().me) { Meta.toast('내 초대 링크예요. 친구에게 보내 주세요'); return; }
    if (s.got) { Meta.toast('초대 선물은 이미 받았어요'); return; }
    s.got = true; const d = Meta.data; d.chest = d.chest || { pending: 0 }; d.chest.pending = (d.chest.pending || 0) + 2;
    Meta.save(); Meta.renderHub(); log('invite_accept', {});
    Meta.modal ? Meta.modal('친구 초대 선물', '🎁 행운 상자 2개를 받았어요!<br>첫 판을 두고 상자를 열어 보세요.') : Meta.toast('🎁 초대 선물: 행운 상자 2개!');
  });
  Meta.addHubPart({
    act: 'invite',
    html: () => `<button type="button" class="tg-friend tg-invite" data-act="invite"><span class="tg-d-ic">💌</span><span class="tg-d-t"><b>친구 초대하고 선물 받기</b><small>친구는 상자 2개 · 나는 ${VIRAL ? '한 명당 +30 코인' : '상자 1개 (매일)'}</small></span><span class="tg-d-st">초대</span></button>`,
    click: invite,
  });

  // ---- 3) welcome back + 4) core metric ----
  let sessionStart = Date.now(), games = 0;
  Meta.onEnd(info => {
    games++;
    log('game_play_complete', { mode: info.mode, result: info.result, level: info.level || 0, plies: info.plies || 0, n: games });
    const s = g(); if (!s.firstGame) { s.firstGame = true; Meta.save(); log('first_game_complete', { mode: info.mode }); promo('firstGame'); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { log('session_end', { sec: Math.round((Date.now() - sessionStart) / 1000), games }); }
    else sessionStart = Date.now();
  });

  // ---- 5) crash guard ----
  let errs = 0;
  const onErr = (msg, src) => { if (errs++ > 5) return; log('js_error', { msg: String(msg).slice(0, 120), src: String(src || '').split('/').pop().slice(0, 40) }); };
  window.addEventListener('error', e => onErr(e.message, e.filename));
  window.addEventListener('unhandledrejection', e => { onErr(e.reason && (e.reason.message || e.reason), 'promise'); e.preventDefault(); });

  const ready = Meta.init().then(() => {
    const s = g(), last = s.seen; s.seen = today(); Meta.save();
    if (last) {
      const away = Math.round((Date.parse(today()) - Date.parse(last)) / 864e5);
      if (away >= 3) { const d = Meta.data; d.chest = d.chest || { pending: 0 }; d.chest.pending = (d.chest.pending || 0) + 1; Meta.save(); setTimeout(() => Meta.toast('다시 와줘서 반가워요! 🎁 행운 상자 1개 선물', 3000), 900); log('welcome_back', { away }); }
    }
    log('app_open', { att: s.att.n });
    Meta.renderHub();
  }).catch(() => {});
  return { ready, checkIn, invite, promo };
})();

window.Growth = Growth;
