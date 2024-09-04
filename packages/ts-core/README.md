## @telegram-sdk/core

## 此包为 Core 包只涉及核心逻辑，不涉及业务

`Telegram SDK` 是集成 `TelegramWebJs` 的基础合集

### [查看更改日志](https://github.com/peng-xiao-shuai/telegram-sdk-docs/blob/gh-pages/CHANGE.md)

### 开始

将脚本添加到 HTML 文件：

```js
<script src="https://telegram.memexyz.buzz/telegram-sdk.js"></script>
```

您可以在全局变量中找到 `Telegram _setTelegramSDKConfig TG_SDK`，例如

```js
<script>
/**
 * Telegram 官方对象
 */
console.log(window.Telegram)
/**
 * 在未调用 _setTelegramSDKConfig 前 TG_SDK 为 undefined
 * 在调用 _setTelegramSDKConfig 后 TG_SDK 不会里面有数据，这个是一个异步过程
 */
console.log(window.TG_SDK)

const config = {
  // 开启调试模式
  debug: true, // 选填
    // appid
  appid: '',
  /**
   * ton 钱包配置
   * @see https://ton-connect.github.io/sdk/types/_tonconnect_ui.TonConnectUiCreateOptions.html
   */
  tonConfig: {
    manifestUrl: `https://docbphqre6f8b.cloudfront.net/tonconnect-manifest.json`, // 必填
  },
}

window._setTelegramSDKConfig(config)

// or
// const TG_SDK = await window._setTelegramSDKConfig(config)
</script>
```
