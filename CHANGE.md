## Telegram SDK 更新记录

### 1.0.0-rc-20240827193850
- `[Fix]:` 修复创建支付订单失败没有报错日志
- `[Fix]:` 修复登录没有存储 `Token` 导致创建支付订单失败
- `[Type]:` 更改 `TG_SDKOptions` 类型中 `tokenKey` 为非必填

### 1.0.0-beta.6

- `openPayPopup` 函数第一项参数更改

```diff
interface OpenPayPopupPayload {
-  title?: string;
+  title: string;
  message: string;
  order_id: string;
  amount: string;
+  extra?: string;
  start?: (button: TG_SDK_NAMESPACE.ParamsPopupButton) => void;
  result?: ({
    status,
    extra,
  }: {
    status: TG_SDK_NAMESPACE.InvoiceStatus;
    extra: string | undefined;
  }) => void;
}

openPayPopup(
  {
    title: 'xxx',
    message: 'xxx'
-   options:{
      order_id: 'xxx',
      amount: 'xxx',
      start: (button) => {},
      result: (button) => {},
-   }
  }: OpenPayPopupPayload
)
```

- 修改开启 `debug` 仍然会进入支付
- 修改支付回调参数
```diff
interface OpenPayPopupPayload {
  title: string;
  message: string;
  order_id: string;
  amount: string;
  extra?: string;
  start?: (button: TG_SDK_NAMESPACE.ParamsPopupButton) => void;
- result?: (status: TG_SDK_NAMESPACE.InvoiceStatus) => void;
+ result?: ({
+   status,
+   extra,
+ }: {
+   status: TG_SDK_NAMESPACE.InvoiceStatus;
+   extra: string | undefined;
+ }) => void;
}
```
