/// <reference types="@tonconnect/ui" />

import type { TG_SDK_CORE } from './core';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
    TG_SDK_CORE: TG_SDK_CORE;
    _setTelegramSDKConfig: (config: TG_SDKOptions) => void;
  }
}

export {};
