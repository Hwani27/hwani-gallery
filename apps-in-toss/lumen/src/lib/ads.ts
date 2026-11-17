import { TossAds, loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import { BANNER_AD_GROUP_ID } from "../bannerAds";
import { INTERSTITIAL_AD_GROUP_ID, REWARDED_AD_GROUP_ID } from "../fullscreenAds";

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

export function attachMenuBanner(target: HTMLElement, onRendered: () => void): () => void {
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
                onAdRendered: () => onRendered(),
                onAdFailedToRender: () => {},
                onNoFill: () => {},
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

export function preloadInterstitial(): Promise<boolean> {
  interstitialReady ??= loadAd(INTERSTITIAL_AD_GROUP_ID);
  return interstitialReady;
}

export async function showPreparedInterstitial(): Promise<boolean> {
  const ready = await (interstitialReady ?? preloadInterstitial());
  interstitialReady = null;
  if (!ready) return false;
  const result = await showAd(INTERSTITIAL_AD_GROUP_ID);
  return result !== "failed";
}

export async function showRewardedAd(): Promise<boolean> {
  const ready = await loadAd(REWARDED_AD_GROUP_ID);
  if (!ready) return false;
  return (await showAd(REWARDED_AD_GROUP_ID)) === "reward";
}
