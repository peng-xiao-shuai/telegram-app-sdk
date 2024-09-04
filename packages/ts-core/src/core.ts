import { TonConnectUI, TonConnectUiCreateOptions } from '@tonconnect/ui';
import { CHAIN } from '@tonconnect/sdk';
import { beginCell } from '@ton/core';
import { version } from '../package.json';

/**
 * @remarks TG_SDK 类中所需的类型命名空间
 */
namespace TG_SDK_NAMESPACE {
  export interface Options {
    /**
     * @remarks id 标识
     */
    appid: string;
    /**
     * @remarks token 在 localStorage 中的 key 名称
     * @default '_TG_SDK_Token'
     */
    tokenKey?: string;
    /**
     * @remarks user_id 在外部环境打开时由于获取不到 TG 用户信息，故此需要传入，仅在 debug 为 true 生效
     * @default 9527
     */
    user_id?: number;
    /**
     * @remarks 是否开启调试模式，开启后 日志会显示在控制台 以及不会进入支付流程，直接返回成功(Ton 除外，因为 debug 情况下可以使用测试网络支付)
     * @default false
     */
    debug?: boolean;
    /**
     * @remarks ton 配置
     * @see https://ton-connect.github.io/sdk/types/_tonconnect_ui.TonConnectUiCreateOptions.html
     */
    tonConfig: TonConnectUiCreateOptions;
  }
  export type PayTypes = 'Ton' | 'Stars' | 'Usdt';

  /**
   * @remarks 支付状态 paid - 成功 cancelled - 取消 failed - 失败 pending - 等待中（只有 star 支付时会有完整状态，ton 支付只会有 paid |
cancelled）
   */
  export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

  /**
   * @remarks 打开支付弹窗
   */
  export interface OpenPayPopupPayload {
    /**
     * @remarks 要在弹出标题中显示的文本，0-64 个字符。
     */
    title: string;
    /**
     * @remarks 要在弹出窗口正文中显示的消息，1-256 个字符。
     */
    message: string;
    /**
     * @remarks 订单id
     */
    order_id: string;
    /**
     * @remarks 需要支付的 Ton 币数量 或者 Stars 数量 （Stars 时为正整数）
     */
    amount: string;
    /**
     * @remarks 扩展信息
     * @default '''
     */
    extra?: string;
    /**
     * @remarks 开始支付回调
     */
    start?: (payItem: PayListResponse['support_token'][number]) => void;
    /**
     * @remarks 支付结果回调
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
   * @remarks Ton 支付时为交易备注信息，Stars 时无用
   */
  invoice_code: string;
  /**
   * @remarks Ton 支付时为收款地址，Stars 时为发票链接
   */
  recharge_address: string;
}

/**
 * @remarks 支付档位接口返回数据
 */
interface PayListResponse {
  /**
   * @remarks 挡位id
   */
  id: string;
  /**
   * @remarks 标题
   */
  title: string;
  /**
   * @remarks 描述
   */
  description: string;
  /**
   * @remarks 金额美元
   */
  dollar_amount: string;
  /**
   * @remarks 支持支付方式
   */
  support_token: { token: TG_SDK_NAMESPACE.PayTypes; amount: string }[];
}

let { log } = window.console;
const APIBase = process.env.API_BASE;

class TG_SDK {
  /**
   * @remarks 是否开启调试模式，开启后 日志会显示在控制台
   */
  readonly debug: boolean;
  /**
   * @remarks TG WebApp 对象，等同于 window.Telegram.WebApp
   */
  readonly WebApp: any;
  readonly APPID: string;
  /**
   * @remarks Ton UI 实例
   */
  readonly tonConnectUI: TonConnectUI;

  readonly version: string;

  /**
   * @remarks 构造函数中除开 'appName' | 'appid' | 'botName' | 'debug' | 'tonConfig' 以外的值
   */
  readonly params: Omit<
    TG_SDK_NAMESPACE.Options,
    'appName' | 'appid' | 'botName' | 'debug' | 'tonConfig'
  >;
  private payOptions: TG_SDK_NAMESPACE.OpenPayPopupPayload | undefined;

  /**
   * @remarks 是否 TG 宿主环境中
   */
  readonly isTG: boolean;

  /**
   * @param {TG_SDKOptions} payload
   */
  constructor({
    appid,
    debug,
    tonConfig,
    ...params
  }: TG_SDK_NAMESPACE.Options) {
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
   * @remarks 连接钱包
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
   * @remarks 断开连接
   */
  disconnect() {
    this.tonConnectUI.disconnect();
  }

  /**
   * @remarks stars 支付
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
   * @remarks ton 支付
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
  /**
   * @remarks 获取 TG 进入时 Start 携带的参数信息
   */
  get StartData(): string {
    return this.WebApp.initDataUnsafe.start_param || '';
  }

  /**
   * @remarks GET 获取唤起弹窗的 options 参数
   */
  get PopupPayOptions(): TG_SDK_NAMESPACE.OpenPayPopupPayload | undefined {
    return this.payOptions;
  }

  /**
   * @remarks SET 非 TG 情况下需要调用，不然支付成功后没有回调
   */
  set PopupPayOptions(value) {
    this.payOptions = value;
  }

  /**
   * @remarks 获取 Token
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

export { TG_SDK as TG_SDK_CORE };
export type { TG_SDK_NAMESPACE, CreateOrderResponse, PayListResponse };
