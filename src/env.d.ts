/// <reference types="@tonconnect/ui" />

declare type Indexes<T = any> = { [s: string | number]: T };
declare namespace TG_Utils {
  interface ParamsPopupButtonBase {
    id: 'Ton' | 'Star' | 'Close';
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  }
  interface ParamsPopupButtonWithText extends ParamsPopupButtonBase {
    text: string;
    type?: 'default' | 'destructive';
  }
  type ParamsPopupButton =
    | ParamsPopupButtonWithText
    | (ParamsPopupButtonBase & {
        type: 'ok' | 'cancel' | 'close';
        text?: string;
      });

  type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

  type Share = ({
    params,
    text,
  }: {
    /**
     * 最后会转 json 在转 base64
     */
    params: object;
    /**
     * 分享出去后的文字内容 默认为空
     */
    text?: string;
    /**
     * 回调函数
     */
    cb?: () => void;
  }) => void;

  type GetStartAppParams = () => Record<string, any>;

  type OpenPayPopup = ({
    title,
    message,
    options,
  }: {
    /**
     * 要在弹出标题中显示的文本，0-64 个字符。
     */
    title: ?string;
    /**
     * 要在弹出窗口正文中显示的消息，1-256 个字符。
     */
    message: string;
    /**
     * 点击支付后状态
     */
    options?: {
      start?: (button: TG_Utils.ParamsPopupButton) => void;
      result?: (status: TG_Utils.InvoiceStatus) => void;
    };
  }) => void;
}

declare interface TG_SDKOptions {
  botName: string;
  appName: string;
  /**
   * @default false
   */
  debug?: boolean;
  tonConfig: TonConnectUiCreateOptions;
}

interface Window {
  Telegram: {
    WebApp: any;
  };
  TG_SDK: TG_SDK;
  setSDKConfig: (config: TG_SDKOptions) => void;
}
