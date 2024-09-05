export * from './lib/telegram-utils';
import { TG_SDK_UI } from './lib/telegram-utils';
import {
  initializeTelegramSDK as init,
  TG_SDK_NAMESPACE,
} from '@telegram-sdk/ts-core';

const initializeTelegramSDK = init;

/**
 * @remarks 初始化 SDK 同时加载 Telegram-web.js 并且将实例挂载在 window
 * @param { TG_SDK_NAMESPACE.Options } config SDK 的配置项
 */
const _setTelegramSDKConfig = async (config: TG_SDK_NAMESPACE.Options) => {
  (window as any).TG_SDK_UI = await initializeTelegramSDK(TG_SDK_UI, config);
  return window.TG_SDK_UI;
};

export { initializeTelegramSDK, _setTelegramSDKConfig };
