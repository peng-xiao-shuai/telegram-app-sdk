import { TonConnectUI, TonConnectUiCreateOptions } from '@tonconnect/ui';
import { CHAIN } from '@tonconnect/sdk';
import { beginCell, Address, toNano } from '@ton/core';
import { version } from '../package.json';
import { TonClient } from 'ton';

/**
 * @remarks TG_SDK 类中所需的类型命名空间
 */
namespace TG_SDK_NAMESPACE {
  /**
   * @remarks 原来 TG_SDKOptions 类型
   */
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
  /**
   * @remarks 可用的支付方式
   */
  export type PayTypes = 'Ton' | 'Stars' | 'Usdt';

  /**
   * @remarks 支付状态 paid - 成功 cancelled - 取消 failed - 失败 pending - 等待中（只有 star 支付时会有完整状态，ton 支付只会有 paid |
cancelled）
   */
  export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

  interface OpenPayBaseParams {
    /**
     * @remarks 当前支付弹窗类型
     * @default 'PAY'
     */
    type?: 'PAY' | 'PAY_LIST';
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
  export interface OpenPayPopupParams extends OpenPayBaseParams {
    type: 'PAY';
    title: string;
    message: string;
    order_id: string;
    amount: string;
  }
  export interface OpenPayListPopupParams extends OpenPayBaseParams {
    type: 'PAY_LIST';
    item_id: string;
  }
  /**
   * @remarks 打开支付弹窗载荷
   */
  export type OpenPayPopupPayload = OpenPayPopupParams | OpenPayListPopupParams;
}

/**
 * @remarks 创建订单返回的数据
 */
interface CreateOrderResponse {
  /**
   * @remarks Ton 支付时为交易备注信息，Stars 时无用
   */
  invoice_code: string;
  /**
   * @remarks Ton 支付时为收款地址，Stars 时为发票链接
   */
  recharge_address: string;

  /**
   * @remarks USDT 支付数额
   */
  amout: string;
  /**
   * @remarks USDT 合约地址
   */
  contract_address: string;
  /**
   * @remarks 精度
   */
  contract_wei: number;
  /**
   * @remarks 是否口开启测试链
   */
  is_test: true;
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
  support_token: { token: TG_SDK_NAMESPACE.PayTypes; amount?: string }[];
}

let { log } = window.console;

/**
 * @remarks 原来 TG_SDK
 */
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

  /**
   * @remarks TonClient 实例
   */
  readonly tonClient: TonClient;

  version: string;

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
    this.WebApp = window.Telegram?.WebApp;
    this.APPID = appid;
    this.tonConnectUI = new TonConnectUI(tonConfig);
    this.version = version;
    this.params = {
      ...params,
      tokenKey: params.tokenKey || '_TG_SDK_Token',
    };
    this.isTG = !!window.Telegram?.WebApp.initData;

    this.payOptions = undefined;

    // 创建 TonClient 实例
    this.tonClient = new TonClient({
      endpoint: `https://${
        this.debug ? 'testnet' : 'mainnet'
      }.toncenter.com/api/v2/jsonRPC`,
    });
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
    return this.tonConnectUI.disconnect();
  }

  /**
   * @remarks stars 支付
   * @param {CreateOrderResponse} response
   * @example
   * window.TG_SDK.tonTransaction({
   *  recharge_address: "https://t.me/$ZR439oScwErACQAAH40H8p-Q3Qo"
   * })
   */
  starsTransaction(
    response: CreateOrderResponse
  ): Promise<
    Parameters<NonNullable<TG_SDK_NAMESPACE.OpenPayPopupPayload['result']>>[0]
  > {
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
   * @example
   * window.TG_SDK.starsTransaction({
   *  invoice_code: 'Hello Word!',
   *  recharge_address: '0QB4bOw8W7eNXp6fhMZNiivCiNxvZDF2sRRz6MtDyiMUUc-n'
   * })
   */
  tonTransaction(
    response: CreateOrderResponse
  ): Promise<
    Parameters<NonNullable<TG_SDK_NAMESPACE.OpenPayPopupPayload['result']>>[0]
  > {
    return new Promise(async (resolve, reject) => {
      try {
        const { boc } = await this.tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 600,
          network: !this.debug ? CHAIN.MAINNET : CHAIN.TESTNET,
          messages: [
            {
              address: response?.recharge_address,
              amount: this.toNanoWei(response.amout),
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

  /**
   * @remarks ton 支付
   * @param {CreateOrderResponse} response
   * @example
     window.TG_SDK.tonChainUsdtTransaction({
      invoice_code: 'Hello Word!',
      recharge_address: '0QB4bOw8W7eNXp6fhMZNiivCiNxvZDF2sRRz6MtDyiMUUc-n',
      amout: "1",
      contract_address: "kQCTbNrH_ddAL48e87HIu7-6kQnGWHpJdcwwfX5c0LROQrHi",
      contract_wei: 6,
      invoice_code: "CE8t2BfsJHHqgB41cdSWqM",
      is_test: true,
      recharge_address: "0QA4lgvi12S5VWWBk6ThaERiYbkwFIK0bp2fZGy9s5aEXeIU"
     })
   */
  tonChainUsdtTransaction(
    response: CreateOrderResponse
  ): Promise<
    Parameters<NonNullable<TG_SDK_NAMESPACE.OpenPayPopupPayload['result']>>[0]
  > {
    return new Promise(async (resolve) => {
      try {
        // jetton master
        const masterAddress = Address.parse(response.contract_address);
        // 调用合约方法
        const { stack } = await this.tonClient.runMethod(
          masterAddress,
          'get_wallet_address',
          [
            {
              type: 'slice',
              // @ts-ignore
              cell: beginCell().storeAddress(this.TonOwner).endCell(),
            },
          ]
        );
        // 读取结果
        const jettonWalletAddress = stack.readAddress().toString();

        const { boc } = await this.tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              /**
               * @remarks 这里是以当前链接的钱包 并且是某个合约（jetton master）下创建的钱包（jetton wallet)
               * 例如以 测试网 kQCTbNrH_ddAL48e87HIu7-6kQnGWHpJdcwwfX5c0LROQrHi 合约为例
               * 你的钱包中需要存在 kQCTbNrH_ddAL48e87HIu7-6kQnGWHpJdcwwfX5c0LROQrHi 货币
               * 以我的钱包为例在 https://testnet.tonviewer.com/0QBByz6dwwnmzdaPAEbqrw4KKZ8cvj-HYp2QH16Z3G95gNrU/jetton/kQCTbNrH_ddAL48e87HIu7-6kQnGWHpJdcwwfX5c0LROQrHi 中可以看到我的 jetton wallet
               * 可以看到我的钱包 jetton wallet 为 kQBXncTf7Y5rZEf-kbEMFmr4Wkdu_njys-H04ooYPLMl4mtQ
               *
               * 或者在主网上使用合约的方法
               * https://tonviewer.com/EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs?section=method
               * 调用 get_wallet_address 传入钱包地址可以获得相应的 jetton wallet
               */
              address: jettonWalletAddress,
              amount: this.toNanoWei(0.1),
              payload: beginCell()
                .storeUint(0xf8a7ea5, 32)
                .storeUint(0, 64)
                // * 10 ** 6
                .storeCoins(
                  Number(this.toNanoWei(response.amout, response.contract_wei))
                )
                /**
                 * @remarks 这里是将货币发送到某个钱包中
                 */
                .storeAddress(Address.parse(response.recharge_address))
                /**
                 * @remarks 如果在交易的过程中有超出的费用会退回到的钱包地址
                 */
                .storeAddress(this.TonOwner) // Platform receiving address
                .storeUint(0, 1) // custom_payload:(Maybe ^Cell)
                .storeCoins(toNano(0.05)) // forward_ton_amount:(VarUInteger 16)
                .storeUint(1, 1)
                .storeRef(
                  beginCell()
                    .storeUint(0, 32)
                    // 设置消息
                    .storeStringTail(response?.invoice_code)
                    .endCell()
                )
                .endCell()
                .toBoc()
                .toString('base64'),
            },
          ],
        });

        log('支付状态 paid');
        this.payOptions?.result?.({
          status: 'paid',
          extra: this.payOptions?.extra,
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

  private toNanoWei(amountInToncoin: string | number, WEI: number = 9) {
    return (Number(amountInToncoin) * 10 ** WEI).toString();
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

  private get TonOwner(): Address {
    return Address.parse(this.tonConnectUI.account!.address);
  }

  /**
   * @remarks 错误抛出，并且在 this.debug 为 false 时没有控制台打印
   */
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
