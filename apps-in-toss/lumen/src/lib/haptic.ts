import { generateHapticFeedback } from "@apps-in-toss/web-framework";

type Kind = "tap" | "tickWeak" | "success" | "error";

/** 토스 앱에서만 진동합니다. 브라우저 미리보기나 미지원 버전에서는 조용히 넘어갑니다. */
export function haptic(type: Kind) {
  try {
    void generateHapticFeedback({ type })?.catch(() => {});
  } catch {
    /* no bridge */
  }
}
