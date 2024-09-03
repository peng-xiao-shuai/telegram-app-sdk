/// <reference types="vite/client" />
import type {
  TG_SDKOptions,
  TG_SDK_CORE,
} from '@telegram-sdk/ts-core/dist/src/index';

declare global {
  interface Window {
    TG_SDK_CORE: TG_SDK_CORE;
    _setTelegramSDKConfig: (config: TG_SDKOptions) => void;
  }
}

export {};
