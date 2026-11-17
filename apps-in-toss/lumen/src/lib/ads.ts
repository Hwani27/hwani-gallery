import { TossAds, loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import { BANNER_AD_GROUP_ID } from "../bannerAds";
import { INTERSTITIAL_AD_GROUP_ID, REWARDED_AD_GROUP_ID } from "../fullscreenAds";
import { trackAd } from "./track";

export function isConfiguredAdId(id: string): boolean {
  return id.trim().length > 0 && !id.startsWith("REPLACE_WITH_");
}

function supported(fn: { isSupported?: () => boolean } | undefined): boolean {
  try {
    return Boolean(fn?.isSupported?.());
  } catch {
    return false;
  }
}

export function bannerSupported(): boolean {
  return isConfiguredAdId(BANNER_AD_GROUP_ID) && supported(TossAds.attachBanner);
}

export function attachMenuBanner(target: HTMLElement, onRendered: () => void, placement = "menu"): () => void {
  if (!bannerSupported()) return () => {};
  let destroyed = false;
  let slot: { destroy: () => void } | null = null;
  try {
    TossAds.initialize({
      callbacks: {
        onInitialized: () => {
          if (destroyed) return;
          try {
            slot = TossAds.attachBanner(BANNER_AD_GROUP_ID, target, {
              theme: "light",
              tone: "grey",
              variant: "card",
              callbacks: {
                onAdRendered: () => {
                  trackAd("banner_rendered", placement);
                  onRendered();
                },
                onAdFailedToRender: () => trackAd("ad_failed", `banner-${placement}`),
                onNoFill: () => trackAd("banner_no_fill", placement),
              },
            });
          } catch {
            /* unsupported bridge */
          }
        },
        onInitializationFailed: () => {},
      },
    });
  } catch {
    return () => {};
  }
  return () => {
    destroyed = true;
    try {
      slot?.destroy();
    } catch {
      /* already gone */
    }
  };
}

function loadAd(adGroupId: string): Promise<boolean> {
  if (!isConfiguredAdId(adGroupId) || !supported(loadFullScreenAd)) return Promise.resolve(false);
  return new Promise((resolve) => {
    let settled = false;
    let cleanup = () => {};
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(ok);
    };
    try {
      cleanup = loadFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === "loaded") finish(true);
        },
        onError: () => finish(false),
      });
    } catch {
      finish(false);
      return;
    }
    window.setTimeout(() => finish(false), 8000);
  });
}

function showAd(adGroupId: string): Promise<"reward" | "closed" | "failed"> {
  if (!supported(showFullScreenAd)) return Promise.resolve("failed");
  return new Promise((resolve) => {
    let settled = false;
    let earned = false;
    let cleanup = () => {};
    const finish = (result: "reward" | "closed" | "failed") => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    try {
      cleanup = showFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === "userEarnedReward") earned = true;
          if (event.type === "dismissed") finish(earned ? "reward" : "closed");
          if (event.type === "failedToShow") finish("failed");
        },
        onError: () => finish("failed"),
      });
    } catch {
      finish("failed");
    }
  });
}

let interstitialReady: Promise<boolean> | null = null;
/** 전면 광고는 한 번 보여 준 뒤 3분 동안 다시 띄우지 않습니다. */
const INTERSTITIAL_GAP_MS = 3 * 60_000;
let lastInterstitialAt = 0;

export function interstitialDue(): boolean {
  return Date.now() - lastInterstitialAt >= INTERSTITIAL_GAP_MS;
}

export function rewardedSupported(): boolean {
  return isConfiguredAdId(REWARDED_AD_GROUP_ID) && supported(loadFullScreenAd) && supported(showFullScreenAd);
}

export function preloadInterstitial(): Promise<boolean> {
  if (!interstitialDue()) return Promise.resolve(false);
  if (!interstitialReady) {
    const pending = loadAd(INTERSTITIAL_AD_GROUP_ID).then((ok) => {
      // 불러오기에 실패하면 다음에 다시 시도할 수 있게 비웁니다.
      if (!ok && interstitialReady === pending) interstitialReady = null;
      return ok;
    });
    interstitialReady = pending;
  }
  return interstitialReady;
}

export async function showPreparedInterstitial(placement: string): Promise<boolean> {
  if (!interstitialDue()) {
    trackAd("interstitial_skipped", placement);
    return false;
  }
  const ready = await (interstitialReady ?? preloadInterstitial());
  interstitialReady = null;
  if (!ready) return false;
  const result = await showAd(INTERSTITIAL_AD_GROUP_ID);
  if (result !== "failed") lastInterstitialAt = Date.now();
  trackAd(result === "failed" ? "ad_failed" : "interstitial_shown", placement);
  return result !== "failed";
}

export async function showRewardedAd(placement: string): Promise<boolean> {
  if (!rewardedSupported()) return false;
  trackAd("rewarded_offer_tap", placement);
  const ready = await loadAd(REWARDED_AD_GROUP_ID);
  if (!ready) {
    trackAd("ad_failed", `rewarded-${placement}`);
    return false;
  }
  const result = await showAd(REWARDED_AD_GROUP_ID);
  trackAd(result === "reward" ? "rewarded_earned" : result === "closed" ? "rewarded_closed" : "ad_failed", placement);
  return result === "reward";
}
