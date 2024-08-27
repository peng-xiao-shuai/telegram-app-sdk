import {
  base64UrlEncode,
  decodeFromBase64Url,
  parseCookies,
} from './utils/string-transform';
import { TonConnectUI, CHAIN, TonConnectUiCreateOptions } from '@tonconnect/ui';
import { beginCell } from '@ton/core';
import { version } from '../package.json';
import { closeModal, createButton, showModal } from './utils/model';

const buttons: TG_SDK_NAMESPACE.ParamsPopupButton[] = [
  {
    id: 'Ton',
    type: 'default',
    text: 'Ton 支付',
  },
  {
    id: 'Stars',
    type: 'default',
    text: 'Star 支付',
  },
  {
    id: 'Close',
    type: 'close',
    text: '',
  },
];

export interface TG_SDKOptions {
  /**
   * id 标识
   */
  appid: string;
  /**
   * token 在 cookie 中的 key 名称
   * @default 'token'
   */
  tokenKey?: string;
  /**
   * user_id 在外部环境打开时由于获取不到 TG 用户信息，故此需要传入，仅在 debug 为 true 生效
   * @default 9527
   */
  user_id?: number;
  /**
   * 机器人名称
   * @deprecated
   */
  botName?: string;
  /**
   * 小程序名称
   * @deprecated
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
export namespace TG_SDK_NAMESPACE {
  export interface ParamsPopupButtonBase {
    readonly id: 'Ton' | 'Stars' | 'Close';
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  }
  export interface ParamsPopupButtonWithText extends ParamsPopupButtonBase {
    text: string;
    type?: 'default' | 'destructive';
  }
  export type ParamsPopupButton =
    | ParamsPopupButtonWithText
    | (ParamsPopupButtonBase & {
        type: 'ok' | 'cancel' | 'close';
        text?: string;
      });

  /**
   * 支付状态 paid - 成功 cancelled - 取消 failed - 失败 pending - 等待中（只有 star 支付时会有完整状态，ton 支付只会有 paid |
cancelled）
   */
  export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

  /**
   * 登录成功回调载荷
   */
  export interface LoginSuccessPayload {
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
  export interface LoginFailPayload {
    status: 'fail';
    /**
     * catch 捕获到的错误信息
     */
    data: any;
  }

  /**
   * 登录成功或者失败回调函数
   */
  export interface LoginPayload {
    cb: (payload: LoginSuccessPayload | LoginFailPayload) => void;
  }

  export interface SharePayload {
    /**
     * 最后会转 json 在转 base64
     * @deprecated
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
  export interface OpenPayPopupPayload {
    /**
     * 要在弹出标题中显示的文本，0-64 个字符。
     */
    title: string;
    /**
     * 要在弹出窗口正文中显示的消息，1-256 个字符。
     */
    message: string;
    /**
     * 订单id
     */
    order_id: string;
    /**
     * 需要支付的 Ton 币数量 或者 Stars 数量 （Stars 时为正整数）
     */
    amount: string;
    /**
     * 扩展信息
     * @default '''
     */
    extra?: string;
    /**
     * 开始支付回调
     */
    start?: (button: TG_SDK_NAMESPACE.ParamsPopupButton) => void;
    /**
     * 支付结果回调
     */
    result?: ({
      status,
      extra,
    }: {
      status: TG_SDK_NAMESPACE.InvoiceStatus;
      extra: string | undefined;
    }) => void;
  }
}

interface CreateOrderResponse {
  /**
   * Ton 支付时为交易备注信息，Stars 时无用
   */
  invoice_code: string;
  /**
   * Ton 支付时为收款地址，Stars 时为发票链接
   */
  recharge_address: string;
}

let { log } = window.console;
const onError = (funName: string, error: unknown) => {
  log(funName + '错误', error);

  if (error instanceof Error) {
    return new Error(error.message);
  } else {
    return new Error(String(error));
  }
};
const APIBase = process.env.API_BASE;

export class TG_SDK {
  AppConfigEnv: {
    TG_BOT_NAME: string;
    TG_APP_NAME: string;
  };
  /**
   * 是否开启调试模式，开启后 日志会显示在控制台
   */
  readonly debug: boolean;
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
   * 构造函数中除开 'appName' | 'appid' | 'botName' | 'debug' | 'tonConfig' 以外的值
   */
  readonly params: Omit<
    TG_SDKOptions,
    'appName' | 'appid' | 'botName' | 'debug' | 'tonConfig'
  >;
  private payOptions: TG_SDK_NAMESPACE.OpenPayPopupPayload | undefined;

  /**
   * 是否 TG 宿主环境中
   */
  readonly isTG: boolean;

  /**
   * @param {TG_SDKOptions} payload
   */
  constructor({
    appid,
    botName,
    appName,
    debug,
    tonConfig,
    ...params
  }: TG_SDKOptions) {
    if (debug !== true) {
      log = (msg: string) => {};
    }
    this.debug = debug || false;
    this.WebApp = window.Telegram.WebApp;
    this.AppConfigEnv = {
      TG_BOT_NAME: botName || 'pxs-test-bot',
      TG_APP_NAME: appName || 'test',
    };
    this.APPID = appid;
    this.tonConnectUI = new TonConnectUI(tonConfig);
    this.version = version;
    this.params = {
      ...params,
      tokenKey: params.tokenKey || 'token',
    };
    this.isTG = !!window.Telegram.WebApp.initData;

    this.payOptions = undefined;

    if (!this.isTG) {
      createButton.call(this, buttons);
    } else {
      document.body.removeChild(
        document.getElementsByClassName('tg-pay-popup-model')[0]
      );
    }
  }

  /**
   * 登录
   * @param {TG_SDK_NAMESPACE.LoginPayload} cb 登录回调函数
   * @example
   * window.TG_SDK.login({ cb: () => {} })
   */
  async login({ cb }: TG_SDK_NAMESPACE.LoginPayload) {
    try {
      const user_data = this.debug
        ? this.WebApp.initData || 'testuser#' + (this.params.user_id || 9527)
        : this.WebApp.initData;

      const response: TG_SDK_NAMESPACE.LoginSuccessPayload['data'] =
        await fetch(APIBase + '/saasapi/jssdk/user/v1/login', {
          method: 'POST',
          body: JSON.stringify({ app_id: this.APPID, invite_code: this.StartData }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `tma ${user_data}`,
          },
        }).then((res) => res.json());

      this.setCookies({
        name: this.params.tokenKey!,
        value: response.token,
        expirationTimestamp: response.expired_at,
      });

      cb({
        status: 'success',
        data: response,
      });
    } catch (error) {
      cb({
        status: 'fail',
        data: error,
      });
      throw onError('login', error);
    }
  }
  /**
   * 分享
   * @param {Parameters<TG_SDK_NAMESPACE.SharePayload>[0]} payload
   * @example
   * window.TG_SDK.share()
   */
  async share({ text, cb }: TG_SDK_NAMESPACE.SharePayload) {
    try {
      const { link }: {link: string} =
      await fetch(APIBase + '/saasapi/jssdk/user/v1/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.Cookies[this.params.tokenKey!]}`,
        },
      }).then((res) => res.json());

      this.WebApp.openTelegramLink(
        encodeURI(
          `https://t.me/share/url?url=${link}${text ? '&text=' : ''}`
        )
      );
      log('分享成功');
      cb?.();
    } catch (error) {
      log('分享失败');
      throw onError('share', error)
    }
  }
  /**
   * 获取通过分享链接进来的参数数据
   * @deprecated 将在 1.0.0 正式版本删除
   * @example
   * window.TG_SDK.getStartAppParams()
   */
  getStartAppParams(): Record<string, any> {
    const params = JSON.parse(
      this.WebApp.initDataUnsafe.start_param
        ? decodeFromBase64Url(this.WebApp.initDataUnsafe.start_param)
        : '{}'
    );
    return params;
  }
  /**
   * 打开 TG 支付弹窗
   * @param {TG_SDK_NAMESPACE.OpenPayPopupPayload} options
   * @example
   * window.TG_SDK.openPayPopup({message: ''})
   */
  openPayPopup(options: TG_SDK_NAMESPACE.OpenPayPopupPayload): void {
    this.payOptions = options;

    /**
     * 校验是否支持 start
     */
    if (Number(this.WebApp.version) <= 7.4 && !this.debug) {
      log('Please upgrade your Telegram');
      buttons.splice(1, 1);
    }

    if (this.isTG) {
      this.WebApp.showPopup(
        {
          title: this.payOptions.title,
          message: this.payOptions.message,
          buttons,
        },
        this.popupCallback.bind(this)
      );
    } else {
      showModal({
        title: this.payOptions.title || '',
      });
    }
  }

  /**
   * popup 回调函数，如果是 h5 则为点击事件函数
   */
  async popupCallback(button_id: TG_SDK_NAMESPACE.ParamsPopupButton['id']) {
    let response: CreateOrderResponse;
    if (button_id !== 'Close') {
        try {
        console.log(this.payOptions);

        /**
         * 创建支付订单
         */
        response = await (
          await fetch(APIBase + '/saasapi/jssdk/pay/v1/order', {
            method: 'POST',
            body: JSON.stringify({
              title: this.payOptions!.title,
              description: this.payOptions!.message,
              order_id: this.payOptions!.order_id,
              amount: this.payOptions!.amount,
              extra: this.payOptions!.extra || '',
              token: button_id,
            }),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.Cookies[this.params.tokenKey!]}`,
            },
          })
        ).json();

      } catch (error) {
        throw onError("popupCallback ['创建支付订单']", error);
      }
      }


    if (button_id === buttons[0].id) {
      this.WebApp.HapticFeedback.impactOccurred('light');

      /**
       * 是否链接，已连接直接支付
       */
      if (this.tonConnectUI.connected) {
        this.tonTransaction(buttons[0], response!);
      } else {
        const unsubscribe = this.tonConnectUI.onStatusChange(async (w) => {
          log('w ==>', w);
          if (!this.debug && w?.account.chain === CHAIN.TESTNET) {
            console.error('You cannot log in using the test network!');
            return;
          }

          unsubscribe();
          this.tonTransaction(buttons[0], response);
        });

        const status = await this.tonConnectUI.openModal();
        log(status);
      }
    } else if (button_id === buttons[1].id) {
      this.WebApp.HapticFeedback.impactOccurred('light');
      log('开始支付 ' + buttons[1]);
      this.payOptions?.start?.(buttons[1]);

      try {
        this.WebApp.openInvoice(
          response!.recharge_address,
          (status: TG_SDK_NAMESPACE.InvoiceStatus) => {
            if (status == 'paid') {
              this.WebApp.HapticFeedback.notificationOccurred('success');
            } else if (status == 'failed') {
              this.WebApp.HapticFeedback.notificationOccurred('error');
            } else if (status === 'cancelled') {
              this.WebApp.HapticFeedback.notificationOccurred('warning');
            }
            log('支付状态 ' + status);
            this.payOptions?.result?.({
              status,
              extra: this.payOptions.extra,
            });
          }
        );
      } catch (error) {
        throw onError('openInvoice', error);
      }
    } else {
      if (!this.isTG) {
        closeModal();
      }
    }
  }

  /**
   * ton 支付
   * @param {TG_SDK_NAMESPACE.OpenPayPopupPayload['options']} options
   * @param {TG_SDK_NAMESPACE.ParamsPopupButton} button
   */
  private async tonTransaction(
    button: TG_SDK_NAMESPACE.ParamsPopupButton,
    response: CreateOrderResponse
  ) {
    /**
     * 开始支付
     */
    log('开始支付', button);
    this.payOptions?.start?.(button);

    try {
      const boc = await this.sendTransaction({
        amount: this.payOptions!.amount,
        payload: response.invoice_code,
        recharge: response.recharge_address,
      });

      log('支付状态 paid');
      this.payOptions?.result?.({
        status: 'paid',
        extra: this.payOptions.extra,
      });
      this.WebApp.HapticFeedback.notificationOccurred('success');
    } catch (err) {
      log('支付状态 failed');
      this.payOptions?.result?.({
        status: 'failed',
        extra: this.payOptions.extra,
      });
      this.WebApp.HapticFeedback.notificationOccurred('error');
      throw onError('tonTransaction', err);
    }
  }

  /**
   * 发起 Ton 交易
   */
  private async sendTransaction({
    amount,
    payload,
    recharge,
  }: {
    amount: string;
    payload: string;
    recharge: string;
  }) {
    try {
      const { boc } = await this.tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: recharge,
            amount: this.toNanoTon(amount),
            payload: beginCell()
              .storeUint(0, 32)
              // 设置消息
              .storeStringTail(payload)
              .endCell()
              .toBoc()
              .toString('base64'),
          },
        ],
      });

      return boc;
    } catch (error) {
      throw onError('sendTransaction', error);
    }
  }

  private toNanoTon(amountInToncoin: string | number) {
    const NANOTON_PER_TONCOIN = 1_000_000_000;
    return (Number(amountInToncoin) * NANOTON_PER_TONCOIN).toString();
  }

  private get StartData() {
    return this.WebApp.initDataUnsafe.start_param || ''
  }

  private get Cookies() {
    const cookies = parseCookies(document.cookie);
    return cookies;
  }

  private setCookies({
    name,
    value,
    expirationTimestamp,
  }: {
    name: string;
    value: string;
    expirationTimestamp?: number;
  }) {
    // 创建新的 cookie 字符串
    let cookieString: string =
      encodeURIComponent(name) + '=' + encodeURIComponent(value);

    // 如果指定了过期时间戳，添加过期时间
    if (expirationTimestamp) {
      const expirationDate = new Date(expirationTimestamp);
      cookieString += '; expires=' + expirationDate.toUTCString();
    }

    // 添加路径（假设为根路径）
    cookieString += '; path=/';

    // 设置 cookie
    document.cookie = cookieString;
  }
}
