export /** B-V 색지수를 별 색으로 바꿉니다(대략의 분광형 색). */
function starColor(bv: number): string {
  if (bv < -0.1) return "#9bb0ff";
  if (bv < 0.15) return "#bccbff";
  if (bv < 0.45) return "#e4e9ff";
  if (bv < 0.7) return "#fff6e8";
  if (bv < 1.0) return "#ffe2b8";
  if (bv < 1.35) return "#ffc98a";
  return "#ffad6b";
}
