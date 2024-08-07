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
     * 是否开启调试
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
     * 支付状态
     */
    type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';
    type Login = (
    /**
     * 登录成功或者失败回调函数
     */
    cb?: (status: 'success' | 'fail') => void) => void;
    type Share = ({ params, text, }: {
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
    type OpenPayPopup = ({ title, message, options, }: {
        /**
         * 要在弹出标题中显示的文本，0-64 个字符。
         */
        title?: string;
        /**
         * 要在弹出窗口正文中显示的消息，1-256 个字符。
         */
        message: string;
        /**
         * 点击支付后状态
         */
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
export declare interface TG_SDK {
    AppConfigEnv: {
        TG_BOT_NAME: string;
        TG_APP_NAME: string;
    };
    debug: boolean;
    /**
     * TON UI 实例
     */
    login(cb: Parameters<TG_Utils.Login>[0]): ReturnType<TG_Utils.Login>;
    share({ params, text, cb, }: Parameters<TG_Utils.Share>[0]): ReturnType<TG_Utils.Share>;
    getStartAppParams(): ReturnType<TG_Utils.GetStartAppParams>;
    openPayPopup({ title, message, options, }: Parameters<TG_Utils.OpenPayPopup>[0]): ReturnType<TG_Utils.OpenPayPopup>;
}
export declare class TG_SDK implements TG_SDK {
    readonly WebApp: any;
    readonly tonConnectUI: TonConnectUI;
    constructor({ botName, appName, debug, tonConfig }: TG_SDKOptions);
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
