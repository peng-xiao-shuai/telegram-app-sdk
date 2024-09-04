import { TG_SDK_NAMESPACE, TG_SDK_CORE } from './core';
export type * from './core';
export * from './core';

/**
 * @ignore
 * @remarks 初始化 TelegramSDK
 */
export const initializeTelegramSDK = (
  config: TG_SDK_NAMESPACE.Options
): Promise<InstanceType<typeof TG_SDK_CORE>> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      const WebApp = (window as any).Telegram.WebApp;
      WebApp.expand();
      WebApp.enableClosingConfirmation();

      if (config) {
        if (config.debug) console.log('实例化 SDK');
        const sdkInstance = new TG_SDK_CORE(config);
        resolve(sdkInstance);
      } else {
        reject(new Error('TGConfig is not set'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load the Telegram Web App script'));
    };
  });
};
