import { decodeFromBase64Url } from './utils/string-transform';
import { TonConnectUI, CHAIN, TonConnectUiCreateOptions } from '@tonconnect/ui';
import { beginCell } from '@ton/core';
import { version } from '../package.json';

interface TG_SDKOptions {
  /**
   * @description id 标识
   */
  appid: string;
  /**
   * @description token 在 localStorage 中的 key 名称
   * @default '_TG_SDK_Token'
   */
  tokenKey?: string;
  /**
   * @description user_id 在外部环境打开时由于获取不到 TG 用户信息，故此需要传入，仅在 debug 为 true 生效
   * @default 9527
   */
  user_id?: number;
  /**
   * @description 是否开启调试模式，开启后 日志会显示在控制台 以及不会进入支付流程，直接返回成功(Ton 除外，因为 debug 情况下可以使用测试网络支付)
   * @default false
   */
  debug?: boolean;
  /**
   * @description ton 配置
   * @see https://ton-connect.github.io/sdk/types/_tonconnect_ui.TonConnectUiCreateOptions.html
   */
  tonConfig: TonConnectUiCreateOptions;
}
/**
 * TG_SDK 类中所需的类型命名空间
 */
namespace TG_SDK_NAMESPACE {
  export type PayTypes = 'Ton' | 'Stars' | 'Usdt';

  /**
   * @description 支付状态 paid - 成功 cancelled - 取消 failed - 失败 pending - 等待中（只有 star 支付时会有完整状态，ton 支付只会有 paid |
cancelled）
   */
  export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

  /**
   * @description 登录成功回调载荷
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
   * @description 登录失败回调载荷
   */
  export interface LoginFailPayload {
    status: 'fail';
    /**
     * catch 捕获到的错误信息
     */
    data: any;
  }

  /**
   * @description 登录成功或者失败回调函数
   */
  export interface LoginPayload {
    cb: (payload: LoginSuccessPayload | LoginFailPayload) => void;
  }

  export interface SharePayload {
    /**
     * @description 分享出去后的文字内容 默认为空
     */
    text?: string;
    /**
     * @description 回调函数
     */
    cb?: () => void;
  }

  /**
   * 打开支付弹窗
   */
  export interface OpenPayPopupPayload {
    /**
     * @description 要在弹出标题中显示的文本，0-64 个字符。
     */
    title: string;
    /**
     * @description 要在弹出窗口正文中显示的消息，1-256 个字符。
     */
    message: string;
    /**
     * @description 订单id
     */
    order_id: string;
    /**
     * @description 需要支付的 Ton 币数量 或者 Stars 数量 （Stars 时为正整数）
     */
    amount: string;
    /**
     * @description 扩展信息
     * @default '''
     */
    extra?: string;
    /**
     * @description 开始支付回调
     */
    start?: (payItem: PayListResponse['support_token'][number]) => void;
    /**
     * @description 支付结果回调
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
   * @description Ton 支付时为交易备注信息，Stars 时无用
   */
  invoice_code: string;
  /**
   * @description Ton 支付时为收款地址，Stars 时为发票链接
   */
  recharge_address: string;
}

/**
 * @description 支付档位接口返回数据
 */
interface PayListResponse {
  /**
   * @description 挡位id
   */
  id: string;
  /**
   * @description 标题
   */
  title: string;
  /**
   * @description 描述
   */
  description: string;
  /**
   * @description 金额美元
   */
  dollar_amount: string;
  /**
   * @description 支持支付方式
   */
  support_token: { token: TG_SDK_NAMESPACE.PayTypes; amount: string }[];
}

let { log } = window.console;
const APIBase = process.env.API_BASE;

class TG_SDK {
  /**
   * @description 是否开启调试模式，开启后 日志会显示在控制台
   */
  readonly debug: boolean;
  /**
   * @description TG WebApp 对象，等同于 window.Telegram.WebApp
   */
  readonly WebApp: any;
  readonly APPID: string;
  /**
   * @description Ton UI 实例
   */
  readonly tonConnectUI: TonConnectUI;

  readonly version: string;

  /**
   * @description 构造函数中除开 'appName' | 'appid' | 'botName' | 'debug' | 'tonConfig' 以外的值
   */
  readonly params: Omit<
    TG_SDKOptions,
    'appName' | 'appid' | 'botName' | 'debug' | 'tonConfig'
  >;
  private payOptions: TG_SDK_NAMESPACE.OpenPayPopupPayload | undefined;

  /**
   * @description 是否 TG 宿主环境中
   */
  readonly isTG: boolean;

  /**
   * @param {TG_SDKOptions} payload
   */
  constructor({ appid, debug, tonConfig, ...params }: TG_SDKOptions) {
    if (debug !== true) {
      log = (msg: string) => {};
    }
    this.debug = debug || false;
    this.WebApp = window.Telegram.WebApp;
    this.APPID = appid;
    this.tonConnectUI = new TonConnectUI(tonConfig);
    this.version = version;
    this.params = {
      ...params,
      tokenKey: params.tokenKey || '_TG_SDK_Token',
    };
    this.isTG = !!window.Telegram.WebApp.initData;

    this.payOptions = undefined;
  }

  /**
   * @description 连接钱包
   */
  connect() {
    return new Promise((resolve, reject) => {
      const unsubscribe = this.tonConnectUI.onStatusChange(async (w) => {
        log('wallet ==>', w);
        if (!this.debug && w?.account.chain === CHAIN.TESTNET) {
          reject('You cannot log in using the test network!');
        }

        unsubscribe();
        resolve('');
      });

      this.tonConnectUI.openModal();
    });
  }

  /**
   * @description 断开连接
   */
  disconnect() {
    this.tonConnectUI.disconnect();
  }

  /**
   * @description 分享
   * @param {Parameters<TG_SDK_NAMESPACE.SharePayload>[0]} payload
   * @example
   * window.TG_SDK.share()
   */
  async share({ text, cb }: TG_SDK_NAMESPACE.SharePayload) {
    try {
      const { link }: { link: string } = await fetch(
        APIBase + '/saasapi/jssdk/user/v1/share',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.Token}`,
          },
        }
      ).then((res) => res.json());

      this.WebApp.openTelegramLink(
        encodeURI(`https://t.me/share/url?url=${link}${text ? '&text=' : ''}`)
      );
      log('分享成功');
      cb?.();
    } catch (error) {
      log('分享失败');
      throw this.onError('share', error);
    }
  }
  /**
   * @description 获取通过分享链接进来的参数数据
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
   * @description 打开 TG 支付弹窗
   * @param {TG_SDK_NAMESPACE.OpenPayPopupPayload} options
   * @param {Function} cb 回调函数，将携带一个 button_id 参数
   * @example
   * window.TG_SDK.openPayPopup({message: ''})
   */
  // openPayPopup(
  //   options: TG_SDK_NAMESPACE.OpenPayPopupPayload,
  //   buttons: TG_SDK_NAMESPACE.ParamsPopupButton[],
  //   cb: Function
  // ): void {
  //   this.payOptions = options;

  //   this.WebApp.showPopup(
  //     {
  //       title: options.title,
  //       message: options.message,
  //       buttons,
  //     },
  //     cb
  //   );
  // }

  /**
   * @description stars 支付
   * @param {CreateOrderResponse} response
   */
  starsTransaction(response: CreateOrderResponse) {
    return new Promise((resolve) => {
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

            resolve({
              status,
              extra: this.payOptions?.extra,
            });
          }
        );
      } catch (error) {
        log('支付状态 failed');
        this.payOptions?.result?.({
          status: 'failed',
          extra: this.payOptions.extra,
        });
        resolve({
          status: 'failed',
          extra: this.payOptions?.extra,
        });
        this.WebApp.HapticFeedback.notificationOccurred('error');
        throw this.onError('openInvoice', error);
      }
    });
  }

  /**
   * @description ton 支付
   * @param {CreateOrderResponse} response
   */
  tonTransaction(response: CreateOrderResponse) {
    return new Promise(async (resolve, reject) => {
      try {
        const { boc } = await this.tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 600,
          network: !this.debug ? CHAIN.MAINNET : CHAIN.TESTNET,
          messages: [
            {
              address: response?.recharge_address,
              amount: this.toNanoTon(this.payOptions!.amount),
              payload: beginCell()
                .storeUint(0, 32)
                // 设置消息
                .storeStringTail(response?.invoice_code)
                .endCell()
                .toBoc()
                .toString('base64'),
            },
          ],
        });

        log('支付状态 paid');
        this.payOptions?.result?.({
          status: 'paid',
          extra: this.payOptions.extra,
        });
        this.WebApp.HapticFeedback.notificationOccurred('success');
        resolve({
          status: 'paid',
          extra: this.payOptions?.extra,
        });
      } catch (error) {
        log('支付状态 failed');
        this.payOptions?.result?.({
          status: 'failed',
          extra: this.payOptions.extra,
        });
        resolve({
          status: 'failed',
          extra: this.payOptions?.extra,
        });
        this.WebApp.HapticFeedback.notificationOccurred('error');
        throw this.onError('tonTransaction', error);
      }
    });
  }

  private toNanoTon(amountInToncoin: string | number) {
    const NANOTON_PER_TONCOIN = 1_000_000_000;
    return (Number(amountInToncoin) * NANOTON_PER_TONCOIN).toString();
  }

  get StartData(): string {
    return this.WebApp.initDataUnsafe.start_param || '';
  }

  /**
   * @description GET 获取唤起弹窗的 options 参数
   */
  get PopupPayOptions(): TG_SDK_NAMESPACE.OpenPayPopupPayload | undefined {
    return this.payOptions;
  }

  /**
   * @description SET 非 TG 情况下需要调用，不然支付成功后没有回调
   */
  set PopupPayOptions(value) {
    this.payOptions = value;
  }

  /**
   * @description 获取 Token
   */
  get Token(): string {
    return localStorage.getItem(this.params.tokenKey!) || '';
  }

  onError(funName: string, error: unknown) {
    log(funName + '错误', error);

    if (error instanceof Error) {
      return new Error(error.message);
    } else {
      return new Error(String(error));
    }
  }
}

type TG_SDK_CORE = InstanceType<typeof TG_SDK>;

export default TG_SDK;
export type {
  TG_SDK_CORE,
  TG_SDKOptions,
  TG_SDK_NAMESPACE,
  CreateOrderResponse,
  PayListResponse,
};
