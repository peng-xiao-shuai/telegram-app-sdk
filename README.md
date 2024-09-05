## Telegram SDK

`Telegram SDK` 是集成 `TelegramWebJs` 的基础合集

[@telegram/core](modules/_telegram_sdk_ts_core.html) 为基础 sdk 核心逻辑，主要处理支付，管理钱包功能

[@telegram/ui](modules/_telegram_sdk_ui.html) 为业务基础包继承自 core，包含支付弹窗，商品档位，登录，分享等功能

### 从 `TG_SDK` 迁移到 `TG_SDK_UI`

1. `window.\_setTelegramSDKConfig` 改为 `window.TG_SDK_UI.\_setTelegramSDKConfig`
2. `window.TG_SDK` 改为 `window.TG_SDK_UI`
3. 打开弹窗函数 `openPayPopup` 改为 `window.openPayPopup`
4. 删除 `getStartAppParams、popupCallback` 函数
