import { TG_SDKOptions, TG_SDK } from './core';
export type { TG_SDKOptions, TG_SDK_NAMESPACE, TG_SDK } from './core';

let TGConfig: TG_SDKOptions;
window._setTelegramSDKConfig = (config: TG_SDKOptions) => {
  TGConfig = config;
};
// 创建 script
const script = document.createElement('script');
script.src = 'https://telegram.org/js/telegram-web-app.js';
script.async = true;
document.head.appendChild(script);
script.onload = () => {
  const WebApp = window.Telegram.WebApp;
  /**
   * 开启全屏
   */
  WebApp.expand();
  /**
   * 开启关闭确认弹窗
   */
  WebApp.enableClosingConfirmation();

  if (!window.TG_SDK) {
    window.TG_SDK = new TG_SDK({
      ...TGConfig,
    });
  }
};
script.onerror = () => {
  throw new Error('Failed to load the script');
};
