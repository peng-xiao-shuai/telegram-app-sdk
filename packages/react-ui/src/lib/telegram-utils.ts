import {
  type TG_SDK_NAMESPACE,
  type CreateOrderResponse,
  PayListResponse,
} from '@telegram-sdk/ts-core';
import { fetchRequest } from './sdk-api';
import { PayTypePopup } from '@/components/PayTypesPopup';
import { PayListPopup } from '@/components/PayListPopup';
import { reactRenderer } from './react-renderer';

/**
 * @description popup 回调函数，如果是 h5 则为点击事件函数。
 * @param {PayListResponse['support_token'][number]} payItem
 */
const PopupPayCallback = async (
  payItem: PayListResponse['support_token'][number]
) => {
  const payOptions = window.TG_SDK_CORE.PopupPayOptions;
  window.TG_SDK_CORE.WebApp.HapticFeedback.impactOccurred('light');
  const response = await fetchRequest<CreateOrderResponse>(
    '/saasapi/jssdk/pay/v1/custom_order',
    {
      title: payOptions!.title,
      description: payOptions!.message,
      order_id: payOptions!.order_id,
      amount: payOptions!.amount,
      extra: payOptions!.extra || '',
      token: payItem.token,
    }
  );

  payOptions?.start?.(payItem);
  switch (payItem.token) {
    case 'Ton':
      /**
       * 是否链接，已连接直接支付
       */
      if (window.TG_SDK_CORE.tonConnectUI.connected) {
        window.TG_SDK_CORE.tonTransaction(response!);
      } else {
        await window.TG_SDK_CORE.connect();
        window.TG_SDK_CORE.tonTransaction(response!);
      }
      break;
    case 'Stars':
      if (!window.TG_SDK_CORE.isTG) {
        console.warn('Not in the Telegram environment');

        payOptions?.result?.({
          status: 'paid',
          extra: payOptions.extra,
        });
        return;
      }
      window.TG_SDK_CORE.starsTransaction(response!);
      break;
    case 'Usdt':
    // TODO USDT
  }
};

/**
 * @description 唤起支付弹窗 (兼容浏览器以及TG)。非 TG 使用 Stars 支付会直接返回成功
 * @param {TG_SDK_NAMESPACE.OpenPayPopupPayload} options
 * @param {PayListResponse['support_token']} payTypes 支付类型
 * @example
 * window.TG_SDK.openPayPopup({
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
      amount: '0.01',
    },
    {
      token: 'Stars',
      amount: '1',
    },
  ])
 */
export const openPopupPay = (
  options: TG_SDK_NAMESPACE.OpenPayPopupPayload,
  payTypes: PayListResponse['support_token']
) => {
  window.TG_SDK_CORE.PopupPayOptions = options;

  const StarsIndex = payTypes.findIndex((item) => item.token === 'Stars');
  /**
   * 校验是否支持 start
   */
  if (
    Number(window.TG_SDK_CORE.WebApp.version) <= 7.4 &&
    !window.TG_SDK_CORE.debug &&
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
    callback: PopupPayCallback,
  });
};

/**
 * @description 充值档位支付. 唤起充值档位弹窗
 * @example
 * window.TG_SDK.openPayList()
 */
export const openPayList = async () => {
  const response = await fetchRequest<{
    list: PayListResponse[];
  }>(
    '/saasapi/jssdk/pay/v1/paylist',
    {},
    {
      method: 'GET',
    }
  );

  reactRenderer.render(PayListPopup, {
    list: response.list,
    callback: PopupPayCallback,
  });
};

/**
 * @description 登录成功回调载荷
 */
export interface LoginSuccessPayload {
  status: 'success';
  data: {
    /**
     * @description 过期时间（时间戳）
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
   * @description catch 捕获到的错误信息
   */
  data: any;
}

/**
 * @description 登录成功或者失败回调函数
 */
export interface LoginPayload {
  cb: (payload: LoginSuccessPayload | LoginFailPayload) => void;
}
/**
 * @description 登录
 * @param {TG_SDK_NAMESPACE.LoginPayload} cb 登录回调函数
 * @example
 * window.TG_SDK.login({ cb: ({ status, data }) => {
 *  console.log(status, data)
   }})
 */
export const login = async ({ cb }: LoginPayload) => {
  try {
    const user_data = window.TG_SDK_CORE.debug
      ? window.TG_SDK_CORE.WebApp.initData ||
        'testuser#' + (window.TG_SDK_CORE.params.user_id || 9527)
      : window.TG_SDK_CORE.WebApp.initData;

    const response: LoginSuccessPayload['data'] = await fetchRequest(
      '/saasapi/jssdk/user/v1/login',
      {
        app_id: window.TG_SDK_CORE.APPID,
        invite_code: window.TG_SDK_CORE.StartData,
      },
      {
        headers: {
          Authorization: `tma ${user_data}`,
        },
      }
    );

    localStorage.setItem(window.TG_SDK_CORE.params.tokenKey!, response.token);

    cb({
      status: 'success',
      data: response,
    });
  } catch (error) {
    cb({
      status: 'fail',
      data: error,
    });
    throw window.TG_SDK_CORE.onError('UI login', error);
  }
};

export interface SharePayload {
  /**
   * @description 分享出去后的文字内容 默认为空
   */
  text?: string;
  /**
   * @description 回调函数
   */
  cb?: (status: 'success' | 'fail') => void;
}
/**
 * @description 分享
 * @param {Parameters<TG_SDK_NAMESPACE.SharePayload>[0]} payload
 * @example
 * window.TG_SDK.share()
 * window.TG_SDK.share({ text: '描述内容，这段内容会在输入框内', cb: (status) => {
 *  console.log(status)
 * }})
 */
export const share = async ({ text, cb }: SharePayload) => {
  try {
    const { link }: { link: string } = await fetchRequest(
      '/saasapi/jssdk/user/v1/share'
    );

    window.TG_SDK_CORE.WebApp.openTelegramLink(
      encodeURI(
        `https://t.me/share/url?url=${link}${text ? '&text=' + text : ''}`
      )
    );
    cb?.('success');
  } catch (error) {
    cb?.('fail');
    throw window.TG_SDK_CORE.onError('share', error);
  }
};
