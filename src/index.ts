import TG_SDK from './core';

// 创建 script
const script = document.createElement('script');
script.src = 'https://telegram.org/js/telegram-web-app.js';
script.async = true;
document.head.appendChild(script);
script.onload = () => {
  if (window?.Telegram?.WebApp) {
    const WebApp = window.Telegram.WebApp;
    /**
     * 开启全屏
     */
    WebApp.expand();
    /**
     * 开启关闭确认弹窗
     */
    WebApp.enableClosingConfirmation();

    window.setSDKConfig = (config: TG_SDKOptions) => {
      window.TG_SDK = new TG_SDK({
        ...config,
        botName: 'pxs-test-bot',
        appName: 'test',
      });
    };
  } else {
    throw new Error(
      '无法读取 Telegram 对象，请先引入 https://telegram.org/js/telegram-web-app.js'
    );
  }
};
script.onerror = () => {
  throw new Error('Failed to load the script');
};
