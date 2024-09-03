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
 * @description 登录
 * @param {TG_SDK_NAMESPACE.LoginPayload} cb 登录回调函数
 * @example
 * window.TG_SDK.login({ cb: () => {} })
 */
export const login = async ({ cb }: TG_SDK_NAMESPACE.LoginPayload) => {
  try {
    const user_data = window.TG_SDK_CORE.debug
      ? window.TG_SDK_CORE.WebApp.initData ||
        'testuser#' + (window.TG_SDK_CORE.params.user_id || 9527)
      : window.TG_SDK_CORE.WebApp.initData;

    const response: TG_SDK_NAMESPACE.LoginSuccessPayload['data'] =
      await fetchRequest(
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

/**
 * @description 充值档位支付
 */
export const openPayList = async () => {
  const getPayList = await fetchRequest<PayListResponse[]>(
    '/saasapi/jssdk/pay/v1/paylist',
    {},
    {
      method: 'GET',
    }
  );

  reactRenderer.render(PayListPopup, {
    list: getPayList,
    callback: PopupPayCallback,
  });
};
