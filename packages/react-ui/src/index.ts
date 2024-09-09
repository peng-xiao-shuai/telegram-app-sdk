export * from './lib/telegram-utils';
import { TG_SDK_UI } from './lib/telegram-utils';
import {
  initializeTelegramSDK as init,
  TG_SDK_NAMESPACE,
} from '@telegram-sdk/ts-core';
import './index.css';

/**
 * @ignore
 * @remarks 初始化 TG_SDK 函数，用于加载 Telegram-web.js.
 * @param {T} SDKClass SDK类型名称
 * @param {TG_SDK_NAMESPACE.Options} config SDK类型参数
 */
const initializeTelegramSDK = init;

/**
 * @remarks 初始化 SDK 同时加载 Telegram-web.js 并且将实例挂载在 window。此方法受限于接口返回的数据来判断是否开启 debug
 * @param { TG_SDK_NAMESPACE.Options } config SDK 的配置项
 */
const _setTelegramSDKConfig = async (
  config: Omit<TG_SDK_NAMESPACE.Options, 'debug'>
) => {
  const response = await fetch(
    import.meta.env.VITE_APP_API_BASE + '/saasapi/jssdk/serve/v1/config',
    {
      method: 'POST',
      body: JSON.stringify({ app_id: config.appid }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then((res) => res.json());

  (window as any).TG_SDK_UI = await initializeTelegramSDK(TG_SDK_UI, {
    ...config,
    debug: response.test_only,
  });
  return window.TG_SDK_UI;
};

export { initializeTelegramSDK, _setTelegramSDKConfig };
