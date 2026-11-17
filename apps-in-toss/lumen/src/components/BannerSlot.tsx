import { useEffect, useState } from "react";
import { attachMenuBanner, bannerSupported } from "../lib/ads";

export function BannerSlot({ placement = "menu" }: { placement?: string }) {
  const [live, setLive] = useState(false);
  const canTry = bannerSupported();

  useEffect(() => {
    if (!canTry) return;
    const node = document.getElementById("lumen-banner");
    if (!node) return;
    return attachMenuBanner(node, () => setLive(true), placement);
  }, [canTry, placement]);

  if (!canTry) return null;
  return <div id="lumen-banner" className={live ? "banner-slot is-live" : "banner-slot"} />;
}
