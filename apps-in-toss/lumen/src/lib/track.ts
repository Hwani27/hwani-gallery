import { Analytics } from "@apps-in-toss/web-framework";

/**
 * 광고와 화면 기록.
 * 1) 토스 Analytics 로 보냅니다(샌드박스에서는 콘솔에만 찍히고, 미지원 버전은 조용히 무시).
 * 2) 같은 숫자를 이 기기에도 세어 둡니다. 개발 중에는 콘솔에서 window.__lumenAdLog 로 봅니다.
 * 개인 정보는 남기지 않고, 광고 자리 이름과 결과만 셉니다.
 */
const KEY = "lumen.adlog.v1";

type Counts = Record<string, number>;

function readCounts(): Counts {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === "object" ? (parsed as Counts) : {};
  } catch {
    return {};
  }
}

export type AdEvent =
  | "banner_rendered"
  | "banner_no_fill"
  | "interstitial_shown"
  | "interstitial_skipped"
  | "rewarded_offer_tap"
  | "rewarded_earned"
  | "rewarded_closed"
  | "ad_failed";

export function trackAd(event: AdEvent, placement: string) {
  const counts = readCounts();
  const name = `${event}:${placement}`;
  counts[name] = (counts[name] ?? 0) + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify(counts));
  } catch {
    /* private mode */
  }
  try {
    void Analytics.log({ log_name: "lumen_ad", log_type: "event", params: { event, placement } })?.catch(() => {});
  } catch {
    /* browser preview has no Toss bridge */
  }
}

export function trackScreen(screen: string) {
  try {
    void Analytics.screen({ log_name: `lumen_${screen}` })?.catch(() => {});
  } catch {
    /* browser preview */
  }
}

export function adLog(): Counts {
  return readCounts();
}

if (typeof window !== "undefined" && import.meta.env?.DEV) {
  (window as unknown as { __lumenAdLog?: () => Counts }).__lumenAdLog = adLog;
}
