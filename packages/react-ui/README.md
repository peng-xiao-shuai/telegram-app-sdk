## @telegram-sdk/ui v1.0.0-rc.1

## 以 Core 包为基础，补充业务逻辑

`Telegram SDK` 是集成 `TelegramWebJs` 的基础合集

### [查看更改日志](https://github.com/peng-xiao-shuai/telegram-sdk-docs/blob/gh-pages/packages/react-ui/CHANGELOG.md)

### 开始

将脚本添加到 HTML 文件：

```js
<script src="xxxx/telegram-sdk-ui.js"></script>
```

您可以在全局变量中找到 `Telegram TG_SDK_UI`，`TG_SDK_UI` 下暴露 `_setTelegramSDKConfig` 用于初始化
例如

```js
<script>
/**
 * Telegram 官方对象
 */
console.log(window.Telegram)
/**
 * 在未调用 _setTelegramSDKConfig 前 TG_SDK_UI 为一个对象，包含 _setTelegramSDKConfig 函数
 * 在调用 _setTelegramSDKConfig 后 TG_SDK_UI 不会立即有数据，这个是一个异步过程
 * 调用完成 _setTelegramSDKConfig 后 TG_SDK_UI 将不会是一个对象，而是一个 Class 实例
 */
console.log(window.TG_SDK_UI)

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

window.TG_SDK_UI._setTelegramSDKConfig(config)

// or
// const TG_SDK = await window.TG_SDK_UI._setTelegramSDKConfig(config)
</script>
```
