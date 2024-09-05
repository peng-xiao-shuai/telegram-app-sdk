import { TG_SDK_NAMESPACE } from './core';
export type * from './core';
export * from './core';

/**
 * @ignore
 * @remarks 初始化 TG_SDK 函数，用于加载 Telegram-web.js
 * @param {T} SDKClass SDK类型名称
 * @param {TG_SDK_NAMESPACE.Options} config SDK类型参数
 */
export const initializeTelegramSDK = <
  T extends new (config: TG_SDK_NAMESPACE.Options) => InstanceType<T>
>(
  SDKClass: T,
  config: TG_SDK_NAMESPACE.Options
): Promise<InstanceType<T>> => {
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
        const sdkInstance = new SDKClass(config);
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

/**
 * @remarks 初始化 TG_SDK 函数，用于加载 Telegram-web.js
 * @param {TG_SDK_NAMESPACE.Options} config SDK类型参数
 */
export const _setTelegramSDKConfig = async (
  config: TG_SDK_NAMESPACE.Options
) => {
  (window as any).TG_SDK = await (window as any).TG_SDK.initializeTelegramSDK(
    (window as any).TG_SDK.TG_SDK_CORE,
    config
  );
  return (window as any).TG_SDK;
};
