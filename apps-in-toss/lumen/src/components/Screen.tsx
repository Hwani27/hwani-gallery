import type { ReactNode } from "react";
import { BannerSlot } from "./BannerSlot";

/**
 * 화면 틀. 헤더와 뒤로가기는 만들지 않고 토스 내비게이션 바만 씁니다.
 * 배너는 메뉴·목록 화면 아래에만 붙입니다.
 */
export function Screen({ children, banner }: { children: ReactNode; banner?: string | false }) {
  return (
    <div className="screen">
      <div className="screen-body">{children}</div>
      {banner ? <BannerSlot placement={banner} /> : null}
    </div>
  );
}
