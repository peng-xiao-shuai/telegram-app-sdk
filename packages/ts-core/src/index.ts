import { TG_SDKOptions, default as TG_SDK } from './core';
export type * from './core';

let TGConfig: TG_SDKOptions;
const _setTelegramSDKConfig = (config: TG_SDKOptions) => {
  TGConfig = config;
  if (!window.TG_SDK_CORE && TGConfig) {
    window.TG_SDK_CORE = new TG_SDK(TGConfig);
    console.log('实例化 SDK');
  }
};

window._setTelegramSDKConfig = _setTelegramSDKConfig;
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

  if (!window.TG_SDK_CORE && TGConfig) {
    console.log('实例化 SDK');
    window.TG_SDK_CORE = new TG_SDK(TGConfig);
  }
};
script.onerror = () => {
  throw new Error('Failed to load the script');
};
