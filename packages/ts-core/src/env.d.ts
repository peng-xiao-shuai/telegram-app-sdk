/// <reference types="@tonconnect/ui" />

interface Window {
  Telegram: {
    WebApp: any;
  };
  TG_SDK: TG_SDK;
  _setTelegramSDKConfig: (config: TG_SDKOptions) => void;
}
