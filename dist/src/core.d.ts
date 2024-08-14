import { TonConnectUI, TonConnectUiCreateOptions } from '@tonconnect/ui';
export interface TG_SDKOptions {
    /**
     * id 标识
     */
    appid: string;
    /**
     * 机器人名称
     */
    botName?: string;
    /**
     * 小程序名称
     */
    appName?: string;
    /**
     * 是否开启调试模式，开启后 日志会显示在控制台 以及不会进入支付流程，直接返回成功(Ton 除外，因为 debug 情况下可以使用测试网络支付)
     * @default false
     */
    debug?: boolean;
    /**
     * ton 配置
     * @see https://ton-connect.github.io/sdk/types/_tonconnect_ui.TonConnectUiCreateOptions.html
     */
    tonConfig: TonConnectUiCreateOptions;
}
/**
 * TG_SDK 类中所需的类型命名空间
 */
export declare namespace TG_SDK_NAMESPACE {
    interface ParamsPopupButtonBase {
        readonly id: 'Ton' | 'Star' | 'Close';
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
     * 登录成功回调载荷
     */
    interface LoginSuccessPayload {
        status: 'success';
        data: {
            /**
             * 过期时间（时间戳）
             */
            expired_at: number;
            token: string;
            user_id: string;
        };
    }
    /**
     * 登录失败回调载荷
     */
    interface LoginFailPayload {
        status: 'fail';
        /**
         * catch 捕获到的错误信息
         */
        data: any;
    }
    /**
     * 登录成功或者失败回调函数
     */
    interface LoginPayload {
        cb?: (payload: LoginSuccessPayload | LoginFailPayload) => void;
    }
    interface SharePayload {
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
    }
    /**
     * 打开支付弹窗
     */
    interface OpenPayPopupPayload {
        /**
         * 要在弹出标题中显示的文本，0-64 个字符。
         */
        title?: string;
        /**
         * 要在弹出窗口正文中显示的消息，1-256 个字符。
         */
        message: string;
        options: {
            /**
             * 订单id
             */
            order_id: string;
            /**
             * 需要支付的 Ton 币数量
             */
            amount: string;
            /**
             * 开始支付回调
             */
            start?: (button: TG_SDK_NAMESPACE.ParamsPopupButton) => void;
            /**
             * 支付结果回调
             */
            result?: (status: TG_SDK_NAMESPACE.InvoiceStatus) => void;
        };
    }
}
export declare class TG_SDK {
    AppConfigEnv: {
        TG_BOT_NAME: string;
        TG_APP_NAME: string;
    };
    /**
     * 是否开启调试模式，开启后 日志会显示在控制台 以及不会进入支付流程，直接返回成功(Ton 除外，因为 debug 情况下可以使用测试网络支付)
     */
    debug: boolean;
    /**
     * TG WebApp 对象，等同于 window.Telegram.WebApp
     */
    readonly WebApp: any;
    readonly APPID: string;
    /**
     * Ton UI 实例
     */
    readonly tonConnectUI: TonConnectUI;
    readonly version: string;
    /**
     * @param {TG_SDKOptions} payload
     */
    constructor({ appid, botName, appName, debug, tonConfig }: TG_SDKOptions);
    /**
     * 登录
     * @param {TG_SDK_NAMESPACE.LoginPayload} cb 登录回调函数
     * @example
     * window.TG_SDK.login()
     * window.TG_SDK.login((payload) => {})
     */
    login({ cb }: TG_SDK_NAMESPACE.LoginPayload): Promise<void>;
    /**
     * 分享
     * @param {Parameters<TG_SDK_NAMESPACE.SharePayload>[0]} payload
     * @example
     * window.TG_SDK.share({params: {id: 1}})
     */
    share({ params, text, cb }: TG_SDK_NAMESPACE.SharePayload): void;
    /**
     * 获取通过分享链接进来的参数数据
     * @example
     * window.TG_SDK.getStartAppParams()
     */
    getStartAppParams(): Record<string, any>;
    /**
     * 打开 TG 支付弹窗
     * @param {TG_SDK_NAMESPACE.OpenPayPopupPayload} payload
     * @example
     * window.TG_SDK.openPayPopup({message: ''})
     */
    openPayPopup({ title, message, options, }: TG_SDK_NAMESPACE.OpenPayPopupPayload): void;
    /**
     * ton 支付
     * @param {TG_SDK_NAMESPACE.OpenPayPopupPayload['options']} options
     * @param {TG_SDK_NAMESPACE.ParamsPopupButton} button
     */
    private tonTransaction;
    /**
     * 发起 Ton 交易
     */
    private sendTransaction;
    private toNanoton;
}
