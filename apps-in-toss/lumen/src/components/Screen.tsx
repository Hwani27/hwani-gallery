import type { ReactNode } from "react";
import { BannerSlot } from "./BannerSlot";

export function Screen({
  children,
  banner = false,
  onMenu,
}: {
  children: ReactNode;
  banner?: boolean;
  onMenu?: () => void;
}) {
  return (
    <div className="screen">
      <div className="screen-body">{children}</div>
      {onMenu ? (
        <div className="screen-foot">
          <button type="button" className="btn" onClick={onMenu}>
            메뉴
          </button>
        </div>
      ) : null}
      {banner ? <BannerSlot /> : null}
    </div>
  );
}
