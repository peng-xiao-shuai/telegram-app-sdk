## @telegram/core 更新记录

## 1.0.1-rc.2

- `[Type]:` `PayListResponse` 类型更新

```diff
interface PayListResponse {
  id: string;
  title: string;
  description: string;
  dollar_amount: string;
-  support_token: { token: TG_SDK_NAMESPACE.PayTypes; amount: string }[];
+  support_token: { token: TG_SDK_NAMESPACE.PayTypes; amount?: string }[];
}
```

- `[Type]:` 添加类型 `OpenPayPopupParams` `OpenPayListPopupParams` 用于区分支付弹窗

## 1.0.1-rc.1

- `[Type]:` `CreateOrderResponse` 函数类型更新

```diff
interface CreateOrderResponse {
  invoice_code: string;
  recharge_address: string;
+  /**
+   * @remarks USDT 支付数额
+   */
+  amout: string;
+  /**
+   * @remarks USDT 合约地址
+   */
+  contract_address: string;
+  /**
+   * @remarks 精度
+   */
+  contract_wei: number;
+  /**
+   * @remarks 是否口开启测试链
+   */
+  is_test: true;
}
```

- `[Feat]:`
- - `TG_SDK_UI` 实例新增只读属性 `tonClient`
- - `TG_SDK_UI` 实例新增函数 `tonChainUsdtTransaction` （`Ton` 链的 `USDT` 支付方式）

### 1.0.1-rc.0

删除大量类型以及函数，以保证 `core` 包的功能纯粹，不涉及业务逻辑

- `[Delete]:`
  - - 删除 `getStartAppParams login openPayPopup popupCallback` 函数
  - - 删除 `TG_SDK.AppConfigEnv` 属性
  - - 删除 `TG_SDK_NAMESPACE` 中 `LoginFailPayload LoginPayload LoginSuccessPayload ParamsPopupButtonBase ParamsPopupButtonWithText SharePayload ParamsPopupButton` 类型
- `[Types]:` `TG_SDKOptions` 由 `TG_SDK_NAMESPACE.Options` 代替
- `[Feat]:`
- - **新增 `CJS`、`ESM`、`IIFE` 版本** ，同时导出 `index.d.ts`
- - 新增类型 `PayTypes` 声明了可用的支付类型
- - 新增类型 `CreateOrderResponse` 创建订单返回的数据
- - `PayListResponse` 支付档位返回的数据
- `[Perf]:` 更改调用 `_setTelegramSDKConfig` 方式，从 `window._setTelegramSDKConfig` 改为 `window.TG_SDK._setTelegramSDKConfig`
- `[DOCS]:` 原来 `TG_SDK` 在文档中变成 `TG_SDK_CORE`

### 1.0.0-rc-20240828173814

- `[Fix]:` `Token` 写入 `Cookie` 失败，导致其他需要 `Token` 的接口调用失败

### 1.0.0-rc-20240827213116

- `[Delete]:` 删除分享函数第一项参数中 `params` 属性

```diff
interface SharePayload {
-  params: object;
  text?: string;
  cb?: () => void;
}
```

- `[Delete]:` 即将在 `1.0.0 正式版` 删除 `getStartAppParams` 函数
- `[Feat]:` 登录接口内部调用时会向接口传递 `invite_code` `参数，invite_code` 为 `startapp` 所携带的值，可通过 `window.Telegram.webApp.initDataUnsafe.start_param `获取

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
