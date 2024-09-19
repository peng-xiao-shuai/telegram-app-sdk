import {
  type TG_SDK_NAMESPACE,
  type CreateOrderResponse,
  PayListResponse,
  TG_SDK_CORE,
} from '@telegram-sdk/ts-core';
import { PayTypePopup } from '@/components/PayTypesPopup';
import { PayListPopup } from '@/components/PayListPopup';
import { reactRenderer } from './react-renderer';
import { version } from '../../package.json';

/**
 * @remarks 登录成功回调载荷
 */
interface LoginSuccessPayload {
  status: 'success';
  data: {
    /**
     * @remarks 过期时间（时间戳）
     */
    expired_at: number;
    token: string;
    user_id: string;
  };
}
/**
 * @remarks 登录失败回调载荷
 */
interface LoginFailPayload {
  status: 'fail';
  /**
   * @remarks catch 捕获到的错误信息
   */
  data: any;
}

/**
 * @remarks 登录成功或者失败回调函数
 */
interface LoginPayload {
  cb: (payload: LoginSuccessPayload | LoginFailPayload) => void;
}
interface SharePayload {
  /**
   * @remarks 分享出去后的文字内容 默认为空
   */
  text?: string;
  /**
   * @remarks 回调函数
   */
  cb?: (status: 'success' | 'fail') => void;
}
class TG_SDK_UI extends TG_SDK_CORE {
  constructor(options: TG_SDK_NAMESPACE.Options) {
    super(options);
    this.version = version;
  }

  private async fetchRequest<T>(
    url: string,
    data?: object,
    init: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await (
        await fetch(import.meta.env.VITE_APP_API_BASE + url, {
          method: 'POST',
          body: init.method === 'GET' ? undefined : JSON.stringify(data || {}),
          ...init,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.Token || ''}`,
            ...(init.headers || {}),
          },
        })
      ).json();

      return response;
    } catch (error) {
      throw this.onError('UI API', error);
    }
  }

  /**
   * @remarks popup 回调函数，如果是 h5 则为点击事件函数。
   * @param {PayListResponse['support_token'][number]} payItem
   */
  private PopupPayCallback = async (
    payItem: PayListResponse['support_token'][number]
  ) => {
    try {
      if (!['PAY', 'PAY_LIST'].includes(this.PopupPayOptions!.type)) {
        throw new Error(
          "PopupPayOptions.type error type can only be 'PAY' or 'PAY_LIST'. The current type is " +
            this.PopupPayOptions!.type
        );
      }

      this.WebApp.HapticFeedback.impactOccurred('light');
      let response: CreateOrderResponse;
      if (this.PopupPayOptions?.type === 'PAY') {
        response = await this.fetchRequest(
          '/saasapi/jssdk/pay/v1/custom_order',
          {
            title: this.PopupPayOptions!.title,
            description: this.PopupPayOptions!.message,
            order_id: this.PopupPayOptions!.order_id,
            amount: this.PopupPayOptions!.amount,
            extra: this.PopupPayOptions!.extra || '',
            token: payItem.token,
          }
        );
      } else if (this.PopupPayOptions?.type === 'PAY_LIST') {
        response = await this.fetchRequest('/saasapi/jssdk/pay/v1/item_order', {
          item_id: this.PopupPayOptions!.item_id,
          extra: this.PopupPayOptions!.extra || '',
          token: payItem.token,
        });
      }

      this.PopupPayOptions?.start?.(payItem);
      switch (payItem.token) {
        case 'Ton':
        case 'Usdt':
          /**
           * 是否链接，已连接直接支付
           */
          if (this.tonConnectUI.connected) {
            if (payItem.token == 'Ton') this.tonTransaction(response!);
            else this.tonChainUsdtTransaction(response!);
          } else {
            await this.connect();
            if (payItem.token == 'Ton') this.tonTransaction(response!);
            else this.tonChainUsdtTransaction(response!);
          }
          break;
        case 'Stars':
          if (!this.isTG) {
            console.warn('Not in the Telegram environment');

            this.PopupPayOptions?.result?.({
              status: 'paid',
              extra: this.PopupPayOptions.extra,
            });
            return;
          }
          this.starsTransaction(response!);
          break;
      }
    } catch (error) {
      throw this.onError('UI PopupPayCallback', error);
    }
  };

  /**
 * @remarks 唤起支付弹窗 (兼容浏览器以及TG)。非 TG 使用 Stars 支付会直接返回成功
 * @param {TG_SDK_NAMESPACE.OpenPayPopupPayload} options
 * @param {PayListResponse['support_token']} payTypes 支付类型
 * @example
 * window.TG_SDK_UI.openPayPopup({
    message: '首冲礼包 ￥6 获得 xxx 钻石',
    amount: '1',
    order_id: String(Math.round(Math.random() * 10000)),
    start: () => {
      console.log('开始支付');
    },
    result: (status) => {
      console.log('支付状态 status', status);
    },
  },
  [
    {
      token: 'Ton',
    },
    {
      token: 'Stars',
    },
  ])
 */
  openPopupPay(
    options: Omit<TG_SDK_NAMESPACE.OpenPayPopupParams, 'type'>,
    payTypes: PayListResponse['support_token']
  ) {
    try {
      this.PopupPayOptions = {
        type: 'PAY',
        ...options,
      };

      const StarsIndex = payTypes.findIndex((item) => item.token === 'Stars');
      /**
       * 校验是否支持 start
       */
      if (
        Number(this.WebApp.version) <= 7.4 &&
        !this.debug &&
        StarsIndex >= 0
      ) {
        payTypes.splice(StarsIndex, 1);
        console.warn(
          'Please upgrade your Telegram, Stars payment option has been removed'
        );
      }

      reactRenderer.render(PayTypePopup, {
        title: options.title,
        desc: options.message,
        list: payTypes,
        callback: this.PopupPayCallback,
      });
    } catch (error) {
      throw this.onError('UI openPopupPay', error);
    }
  }

  /**
   * @remarks 充值档位支付. 唤起充值档位弹窗
   * @example
     window.TG_SDK_UI.openPayList({
       start: () => {
         console.log('开始支付');
       },
       result: (status) => {
         console.log('支付状态 status', status);
       }
     })
   */
  async openPayList(
    options: Omit<
      TG_SDK_NAMESPACE.OpenPayListPopupParams,
      'type' | 'item_id' | 'title' | 'message'
    >
  ) {
    try {
      const response = await this.fetchRequest<{
        list: PayListResponse[];
      }>(
        '/saasapi/jssdk/pay/v1/paylist',
        {},
        {
          method: 'GET',
        }
      );

      this.PopupPayOptions = {
        type: 'PAY_LIST',
        item_id: '',
        ...options,
      };
      reactRenderer.render(PayListPopup, {
        list: response.list,
        callback: this.PopupPayCallback,
      });
    } catch (error) {
      throw this.onError('UI openPayList', error);
    }
  }

  /**
   * @remarks 登录
   * @param {TG_SDK_NAMESPACE.LoginPayload} cb 登录回调函数
   * @example
   * window.TG_SDK_UI.login({
   *  cb: ({ status, data }) => {
   *    console.log(status, data)
   *  }
   * })
   */
  login({ cb }: LoginPayload): Promise<Parameters<LoginPayload['cb']>[0]> {
    return new Promise((resolve) => {
      (async () => {
        try {
          const user_data = this.debug
            ? this.WebApp.initData ||
              'testuser#' + (this.params.user_id || 9527)
            : this.WebApp.initData;

          const response: LoginSuccessPayload['data'] = await this.fetchRequest(
            '/saasapi/jssdk/user/v1/login',
            {
              app_id: this.APPID,
              invite_code: this.StartData,
            },
            {
              headers: {
                Authorization: `tma ${user_data}`,
              },
            }
          );

          localStorage.setItem(this.params.tokenKey!, response.token);

          cb({
            status: 'success',
            data: response,
          });
          resolve({
            status: 'success',
            data: response,
          });
        } catch (error) {
          cb({
            status: 'fail',
            data: error,
          });
          resolve({
            status: 'fail',
            data: error,
          });
          throw this.onError('UI login', error);
        }
      })();
    });
  }

  /**
   * @remarks 分享
   * @param {Parameters<TG_SDK_NAMESPACE.SharePayload>[0]} payload
   * @example
   * window.TG_SDK_UI.share()
   * window.TG_SDK_UI.share({ text: '描述内容，这段内容会在输入框内', cb: (status) => {
   *  console.log(status)
   * }})
   */
  share({
    text,
    cb,
  }: SharePayload): Promise<Parameters<NonNullable<SharePayload['cb']>>[0]> {
    return new Promise((resolve) => {
      (async () => {
        try {
          const { link }: { link: string } = await this.fetchRequest(
            '/saasapi/jssdk/user/v1/share'
          );

          this.WebApp.openTelegramLink(
            encodeURI(
              `https://t.me/share/url?url=${link}${text ? '&text=' + text : ''}`
            )
          );
          cb?.('success');
          resolve('success');
        } catch (error) {
          cb?.('fail');
          resolve('fail');
          throw this.onError('share', error);
        }
      })();
    });
  }
}

export { TG_SDK_UI };

export type {
  LoginSuccessPayload,
  LoginFailPayload,
  LoginPayload,
  SharePayload,
};
