import { openGameCenterLeaderboard, submitGameCenterLeaderBoardScore } from "@apps-in-toss/web-framework";
import { LEADERBOARD_ENABLED } from "../gameCenter";

function supported(fn: { isSupported?: () => boolean }): boolean {
  try {
    return Boolean(fn.isSupported?.());
  } catch {
    return false;
  }
}

export function leaderboardReady(): boolean {
  return LEADERBOARD_ENABLED && supported(submitGameCenterLeaderBoardScore) && supported(openGameCenterLeaderboard);
}

/** 모은 도장 수를 점수로 올립니다. */
export function submitStampScore(stamps: number) {
  if (!leaderboardReady()) return;
  try {
    void submitGameCenterLeaderBoardScore({ score: String(stamps) })?.catch(() => {});
  } catch {
    /* ignore */
  }
}

export function openLeaderboard() {
  if (!leaderboardReady()) return;
  try {
    void openGameCenterLeaderboard()?.catch(() => {});
  } catch {
    /* ignore */
  }
}
