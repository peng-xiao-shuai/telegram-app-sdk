declare type Indexes<T = any> = { [s: string | number]: T };
namespace TG_Utils {
  interface ParamsPopupButtonBase  {
    id: 'Ton' | 'Star' | 'Close',
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive',
  }
  interface ParamsPopupButtonWithText extends ParamsPopupButtonBase { text: string, type?: 'default' | 'destructive' }
  type ParamsPopupButton =
  | ParamsPopupButtonWithText
  | (ParamsPopupButtonBase & { type: 'ok' | 'cancel' | 'close'; text?: string });

  type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending'

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
  }) => void;

  type getStartAppParams = () => Record<string, any>;

  type openPayPopup = ({
    title
  }: {
    /**
     * 要在弹出标题中显示的文本，0-64 个字符。
     */
    title:? string;
    /**
     * 要在弹出窗口正文中显示的消息，1-256 个字符。
     */
    message: string;
    /**
     * 点击支付后状态
     */
    options?: {
      start?: (button: TG_Utils.ParamsPopupButton) => void
      result?: (status: TG_Utils.InvoiceStatus) => void
    } 
  }) => void;
}

interface Window {
  Telegram: {
    WebApp: any;
  };
  TG_Utils: {
    /**
     * 分享
     * @example
     * share({ params: {id: 1}})
     * share({ params: {id: 1}, text: '一段描述语句'})
     */
    share: TG_Utils.Share
    /**
     * 获取 start_app 所携带参数, 如果 start_app 参数没有被转为 base64 则不要使用此函数
     * @example
     * getStartAppParams() // {id: 1}
     * @returns {Record<string, any>} 对象
     */
    getStartAppParams: TG_Utils.getStartAppParams

    /**
     * 开启Pay支付弹窗
     * @example
     * OpenPayPopup()
     */
    openPayPopup: TG_Utils.openPayPopup
  };
}
