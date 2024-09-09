/// <reference types="vite/client" />
import type {
  TG_SDKOptions,
  TG_SDK_CORE,
} from '@telegram-sdk/ts-core/dist/src/index';
import { TG_SDK_UI } from './lib/telegram-utils';

declare global {
  interface Window {
    TG_SDK_CORE: TG_SDK_CORE;
    Telegram: {
      WebApp: any;
    };
    TG_SDK_UI: InstanceType<typeof TG_SDK_UI>;
    _setTelegramSDKConfig: (config: TG_SDKOptions) => void;
  }
}

export {};
