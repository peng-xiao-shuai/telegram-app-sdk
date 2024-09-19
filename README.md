## Telegram SDK

`Telegram SDK` 是集成 `TelegramWebJs` 的基础合集

[@telegram/core](modules/_telegram_sdk_ts_core.html) 为基础 sdk 核心逻辑，主要处理支付，管理钱包功能

[@telegram/ui](modules/_telegram_sdk_ui.html) 为业务基础包继承自 core，包含支付弹窗，商品档位，登录，分享等功能

### 启动

```bash
## 安装
pnpm i
## 打包
pnpm build
## 打包 ui
pnpm ui:build
## 开发环境运行 ui 进入 package/react-ui 目录运行
pnpm dev

## 示例代码在 example/html 这里使用服务启动 example/html/index.html 或者 直接将 html 拖到浏览器

```

### 本地运行示例

```bash
### 根目录执行
pnpm build
```

进入 `example/html/index.html` 文件，更改

```diff
- <link rel="stylesheet" href="../../packages/react-ui/dist/style.css" /> // line 7
+ <link rel="stylesheet" href="https://telegram.memexyz.buzz/style.css" />

- <script src="../../packages//react-ui/dist/telegram-sdk-ui.js"></script> // line 44
+ <script src="https://telegram.memexyz.buzz/telegram-sdk-ui.js"></script>
```

### 从 `TG_SDK` 迁移到 `TG_SDK_UI`

1. `window.\_setTelegramSDKConfig` 改为 `window.TG_SDK_UI.\_setTelegramSDKConfig`
2. `window.TG_SDK` 改为 `window.TG_SDK_UI`
3. 删除 `getStartAppParams、popupCallback` 函数
