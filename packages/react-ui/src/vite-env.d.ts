/// <reference types="vite/client" />
import { TG_SDK, TG_SDKOptions } from '@telegram-sdk/ts-core/dist/src/index';

declare global {
  interface Window {
    TG_SDK: TG_SDK;
    _setTelegramSDKConfig: (config: TG_SDKOptions) => void;
  }
}

export {};
