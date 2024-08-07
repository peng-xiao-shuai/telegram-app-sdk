import { TonConnectUI, TonConnectUiCreateOptions } from '@tonconnect/ui';
export interface TG_SDKOptions {
    /**
     * 机器人名称
     */
    botName: string;
    /**
     * 小程序名称
     */
    appName: string;
    /**
     * 是否开启调试模式，开启后 日志会显示在控制台 以及不会进入支付流程，直接返回成功
     * @default false
     */
    debug?: boolean;
    /**
     * ton 配置
     * @see https://ton-connect.github.io/sdk/types/_tonconnect_ui.TonConnectUiCreateOptions.html
     */
    tonConfig: TonConnectUiCreateOptions;
}
export declare namespace TG_Utils {
    interface ParamsPopupButtonBase {
        id: 'Ton' | 'Star' | 'Close';
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
    }
    interface ParamsPopupButtonWithText extends ParamsPopupButtonBase {
        text: string;
        type?: 'default' | 'destructive';
    }
    type ParamsPopupButton = ParamsPopupButtonWithText | (ParamsPopupButtonBase & {
        type: 'ok' | 'cancel' | 'close';
        text?: string;
    });
    /**
     * 支付状态 paid - 成功 cancelled - 取消 failed - 失败 pending - 等待中（只有 star 支付时会有完整状态，ton 支付只会有 paid |
  cancelled）
     */
    type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';
    /**
     * 登录
     */
    type Login = (
    /**
     * 登录成功或者失败回调函数
     */
    cb?: (status: 'success' | 'fail') => void) => void;
    /**
     * 分享
     */
    type Share = (payload: {
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
    /**
     * 获取分享链接进来的参数
     */
    type GetStartAppParams = () => Record<string, any>;
    /**
     * 打开支付弹窗
     */
    type OpenPayPopup = (payload: {
        /**
         * 要在弹出标题中显示的文本，0-64 个字符。
         */
        title?: string;
        /**
         * 要在弹出窗口正文中显示的消息，1-256 个字符。
         */
        message: string;
        options?: {
            /**
             * 开始支付回调
             */
            start?: (button: TG_Utils.ParamsPopupButton) => void;
            /**
             * 支付结果回调
             */
            result?: (status: TG_Utils.InvoiceStatus) => void;
        };
    }) => void;
}
export declare class TG_SDK {
    AppConfigEnv: {
        TG_BOT_NAME: string;
        TG_APP_NAME: string;
    };
    /**
     * 是否开启调试模式，开启后 日志会显示在控制台 以及不会进入支付流程，直接返回成功
     */
    debug: boolean;
    /**
     * TG WebApp 对象，等同于 window.Telegram.WebApp
     */
    readonly WebApp: any;
    /**
     * Ton UI 实例
     */
    readonly tonConnectUI: TonConnectUI;
    /**
     * @param {TG_SDKOptions} payload
     */
    constructor({ botName, appName, debug, tonConfig }: TG_SDKOptions);
    /**
     * 登录
     * @param {Parameters<TG_Utils.Login>[0]} cb 登录回调函数
     * @example
     * window.TG_SDK.login()
     * window.TG_SDK.login((state) => {})
     */
    login(cb: Parameters<TG_Utils.Login>[0]): void;
    /**
     * 分享
     * @param {Parameters<TG_Utils.Share>[0]} payload
     * @example
     * window.TG_SDK.share({params: {id: 1}})
     */
    share({ params, text, cb, }: Parameters<TG_Utils.Share>[0]): ReturnType<TG_Utils.Share>;
    /**
     * 获取通过分享链接进来的参数数据
     * @example
     * window.TG_SDK.getStartAppParams()
     */
    getStartAppParams(): ReturnType<TG_Utils.GetStartAppParams>;
    /**
     * 打开 TG 支付弹窗
     * @param {Parameters<TG_Utils.OpenPayPopup>[0]} payload
     * @example
     * window.TG_SDK.openPayPopup({message: ''})
     */
    openPayPopup({ title, message, options, }: Parameters<TG_Utils.OpenPayPopup>[0]): ReturnType<TG_Utils.OpenPayPopup>;
    /**
     * ton 支付
     * @param {Parameters<TG_Utils.OpenPayPopup>[0]['options']} options
     * @param {TG_Utils.ParamsPopupButton} button
     */
    private tonTransaction;
    /**
     * 发起 Ton 交易
     */
    private sendTransaction;
}
