import { base64UrlEncode, decodeFromBase64Url } from './utils/string-transform';
import { TonConnectUI, CHAIN, TonConnectUiCreateOptions } from '@tonconnect/ui';
import { beginCell } from '@ton/core';

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
export namespace TG_Utils {
  export interface ParamsPopupButtonBase {
    id: 'Ton' | 'Star' | 'Close';
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
   * 登录
   */
  export type Login = (
    /**
     * 登录成功或者失败回调函数
     */
    cb?: (status: 'success' | 'fail') => void
  ) => void;
  /**
   * 分享
   */
  export type Share = (payload: {
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
  export type GetStartAppParams = () => Record<string, any>;

  /**
   * 打开支付弹窗
   */
  export type OpenPayPopup = (payload: {
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

let { log } = window.console;
const onError = (error: unknown) => {
  if (error instanceof Error) {
    return new Error(error.message);
  } else {
    return new Error(String(error));
  }
};

export class TG_SDK {
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
  constructor({ botName, appName, debug, tonConfig }: TG_SDKOptions) {
    if (debug !== true) {
      log = (msg: string) => {};
    }
    this.debug = debug || false;
    this.WebApp = window.Telegram.WebApp;
    this.AppConfigEnv = {
      TG_BOT_NAME: botName,
      TG_APP_NAME: appName,
    };
    this.tonConnectUI = new TonConnectUI(tonConfig);
  }

  /**
   * 登录
   * @param {Parameters<TG_Utils.Login>[0]} cb 登录回调函数
   * @example
   * window.TG_SDK.login()
   * window.TG_SDK.login((state) => {})
   */
  login(cb: Parameters<TG_Utils.Login>[0]) {
    if (this.debug) {
      log('登录成功');
      cb?.('success');
    }
    cb?.('success');
    // TODO
  }
  /**
   * 分享
   * @param {Parameters<TG_Utils.Share>[0]} payload
   * @example
   * window.TG_SDK.share({params: {id: 1}})
   */
  share({
    params,
    text,
    cb,
  }: Parameters<TG_Utils.Share>[0]): ReturnType<TG_Utils.Share> {
    const str = JSON.stringify(params);
    this.WebApp.openTelegramLink(
      encodeURI(
        `https://t.me/share/url?url=t.me/${this.AppConfigEnv.TG_BOT_NAME}/${
          this.AppConfigEnv.TG_APP_NAME
        }?startapp=${base64UrlEncode(str)}&text=${text || ''}`
      )
    );
    log('分享成功');
    cb?.();
  }
  /**
   * 获取通过分享链接进来的参数数据
   * @example
   * window.TG_SDK.getStartAppParams()
   */
  getStartAppParams(): ReturnType<TG_Utils.GetStartAppParams> {
    const params = JSON.parse(
      this.WebApp.initDataUnsafe.start_param
        ? decodeFromBase64Url(this.WebApp.initDataUnsafe.start_param)
        : '{}'
    );
    return params;
  }
  /**
   * 打开 TG 支付弹窗
   * @param {Parameters<TG_Utils.OpenPayPopup>[0]} payload
   * @example
   * window.TG_SDK.openPayPopup({message: ''})
   */
  openPayPopup({
    title,
    message,
    options,
  }: Parameters<TG_Utils.OpenPayPopup>[0]): ReturnType<TG_Utils.OpenPayPopup> {
    const buttons: TG_Utils.ParamsPopupButton[] = [
      {
        id: 'Ton',
        type: 'default',
        text: 'Ton 支付',
      },
      {
        id: 'Star',
        type: 'default',
        text: 'Star 支付',
      },
      {
        id: 'Close',
        type: 'close',
        text: '',
      },
    ];

    /**
     * 校验是否支持 start
     */
    if (Number(this.WebApp.version) <= 7.4) {
      log('Please upgrade your Telegram');
      buttons.splice(1, 1);
    }

    const handle = async (button_id: TG_Utils.ParamsPopupButton['id']) => {
      if (button_id === buttons[0].id) {
        this.WebApp.HapticFeedback.impactOccurred('light');

        /**
         * 是否链接，已连接直接支付
         */
        if (this.tonConnectUI.connected) {
          this.tonTransaction(options, buttons[0]);
        } else {
          const unsubscribe = this.tonConnectUI.onStatusChange(async (w) => {
            log('w ==>', w);
            // 先注释签名
            // if (!w) {
            //   // TonProofDemoApi.reset();
            //   return;
            // }

            // if (w.account.chain === CHAIN.TESTNET) {
            //   console.error('You cannot log in using the test network!');
            //   return;
            // }

            // if (
            //   w.connectItems?.tonProof &&
            //   'proof' in w.connectItems.tonProof
            // ) {
            //   try {
            //     // emitter.emit('setGlobalLoading', true);
            //     // setIsCheck(false);
            //     const { result, ok } = await TonProofDemoApi.checkProof(
            //       w.connectItems.tonProof.proof,
            //       w.account
            //     );

            //     if (ok) {
            //       // setIsCheck(true);
            //       // setDataLocal(result);
            //       // emitter.emit('bindTonSuccess', {
            //       //   ...w,
            //       // });
            //     } else {
            //       // toast();
            //       console.error('signature Check failure');

            //       this.tonConnectUI.disconnect();
            //     }
            //     // emitter.emit('setGlobalLoading', false);
            //   } catch (msg: any) {
            //     log(msg, '错误捕获');

            //     // toast(msg);
            //     // emitter.emit('setGlobalLoading', false);
            //     this.tonConnectUI.disconnect();
            //   }
            // }

            unsubscribe();
            this.tonTransaction(options, buttons[0]);
          });

          this.tonConnectUI.openModal();
        }
      } else if (button_id === buttons[1].id) {
        this.WebApp.HapticFeedback.impactOccurred('light');
        log('开始支付 ' + buttons[1]);
        options?.start?.(buttons[1]);

        if (this.debug) {
          log('支付状态 ' + 'paid');
          options?.result?.('paid');
          return;
        }

        try {
          // const { result } = await fetch(
          //   'https://www.tgaipet.com/restApi/recharge/createOrderFromStar',
          //   {
          //     method: 'post',
          //     // TODO
          //     body: JSON.stringify({
          //       packageId: '1',
          //     }),
          //   }
          // );

          this.WebApp.openInvoice(
            'https://t.me/$-gi_agJAiEmPBwAAVrZ2d9SzLg4',
            (status: TG_Utils.InvoiceStatus) => {
              if (status == 'paid') {
                this.WebApp.HapticFeedback.notificationOccurred('success');
              } else if (status == 'failed') {
                this.WebApp.HapticFeedback.notificationOccurred('error');
              } else if (status === 'cancelled') {
                this.WebApp.HapticFeedback.notificationOccurred('warning');
              }
              log('支付状态 ' + status);
              options?.result?.(status);
            }
          );
        } catch (error) {
          throw onError(error);
        }
      }
    };

    this.WebApp.showPopup(
      {
        title,
        message,
        buttons,
      },
      handle
    );
  }

  /**
   * ton 支付
   * @param {Parameters<TG_Utils.OpenPayPopup>[0]['options']} options
   * @param {TG_Utils.ParamsPopupButton} button
   */
  private async tonTransaction(
    options: Parameters<TG_Utils.OpenPayPopup>[0]['options'],
    button: TG_Utils.ParamsPopupButton
  ) {
    /**
     * 开始支付
     */
    log('开始支付', button);
    options?.start?.(button);

    if (this.debug) {
      log('支付状态 paid');
      options?.result?.('paid');
      this.WebApp.HapticFeedback.notificationOccurred('success');
      return;
    }

    try {
      const boc = await this.sendTransaction();

      log('支付状态 paid');
      options?.result?.('paid');
      this.WebApp.HapticFeedback.notificationOccurred('success');
    } catch (err) {
      log('支付状态 failed');
      options?.result?.('failed');
      this.WebApp.HapticFeedback.notificationOccurred('error');
    }
  }

  /**
   * 发起 Ton 交易
   */
  private async sendTransaction() {
    try {
      const { boc } = await this.tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: 'UQB4bOw8W7eNXp6fhMZNiivCiNxvZDF2sRRz6MtDyiMUUXQt',
            amount: '100000',
            payload: beginCell()
              .storeUint(0, 32)
              // 设置消息
              .storeStringTail(Date.now().toString())
              .endCell()
              .toBoc()
              .toString('base64'),
          },
        ],
      });

      return boc;
    } catch (error) {
      throw onError(error);
    }
  }
}
