import { defineConfig } from "@apps-in-toss/web-framework/config";

/**
 * 앱인토스 WebView SDK 3 설정 파일입니다.
 * SDK 2의 granite.config.ts 가 이 파일로 바뀌었습니다. `ait build` 는 이 파일을 읽습니다.
 *
 * 앱 이름 슬러그: appName
 * 콘솔에 등록한 앱 이름과 같아야 하고, 딥링크는 intoss://lumen 입니다.
 * 슬러그를 바꿀 때는 아래 appName 만 수정하세요.
 *
 * SDK 3 은 webViewProps.type 을 더 이상 받지 않습니다.
 * 게임(몰입형) 미니앱으로 내려면 앱인토스 콘솔에서 미니앱 종류를 게임으로 등록하세요.
 * 화면 안의 헤더·뒤로가기 버튼은 만들지 않고, 토스 내비게이션만 씁니다.
 */
export default defineConfig({
  appName: "lumen",
  permissions: [],
  webBundleDir: "dist",
  navigationBar: {
    withBackButton: false,
    withHomeButton: false,
    withTitle: false,
    transparentBackground: true,
    theme: "light",
  },
  webView: {
    bounces: false,
    pullToRefreshEnabled: false,
    overScrollMode: "never",
  },
});
