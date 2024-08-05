import { base64UrlEncode, decodeFromBase64Url } from './utils/string-transform';

const AppConfigEnv = {
  TG_BOT_NAME: 'pxs-test-bot',
  TG_APP_NAME: 'test',
} as const;

(function () {
  if (window?.Telegram?.WebApp) {
    const WebApp = window.Telegram.WebApp;
    /**
     * 开启全屏
     */
    WebApp.expand();
    /**
     * 开启关闭确认弹窗
     */
    WebApp.enableClosingConfirmation();

    window.TG_Utils = {
      /**
       * 分享
       */
      share: ({ params, text }) => {
        const str = JSON.stringify(params);
        WebApp.openTelegramLink(
          encodeURI(
            `https://t.me/share/url?url=t.me/${AppConfigEnv.TG_BOT_NAME}/${
              AppConfigEnv.TG_APP_NAME
            }?startapp=${base64UrlEncode(str)}&text=${text || ''}`
          )
        );
      },

      /**
       * 获取Url中 start_app 数据
       */
      getStartAppParams: () => {
        const params: Record<string, any> = JSON.parse(
          WebApp.initDataUnsafe.start_param
            ? decodeFromBase64Url(WebApp.initDataUnsafe.start_param)
            : '{}'
        );
        return params;
      },

      openPayPopup: ({ title, message, options }) => {
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
        const handle = async (
          button_id: (typeof buttons)[number]['id'] | ''
        ) => {
          if (button_id === buttons[0].id) {
            WebApp.HapticFeedback.impactOccurred('light');
            options?.start?.(buttons[1]);
            // TODO
          } else if (button_id === buttons[1].id) {
            WebApp.HapticFeedback.impactOccurred('light');

            if (Number(WebApp.version) <= 7.4) {
              console.error('Please upgrade yours Telegram');
              return;
            }
            options?.start?.(buttons[1]);
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

              WebApp.openInvoice(
                'https://t.me/$-gi_agJAiEmPBwAAVrZ2d9SzLg4',
                (status: TG_Utils.InvoiceStatus) => {
                  if (status == 'paid') {
                    WebApp.HapticFeedback.notificationOccurred('success');
                  } else if (status == 'failed') {
                    WebApp.HapticFeedback.notificationOccurred('error');
                  } else if (status === 'cancelled') {
                    WebApp.HapticFeedback.notificationOccurred('warning');
                  }
                  options?.result?.(status);
                }
              );
            } catch (error: any) {
              console.error(error);
            }
          }
        };

        WebApp.showPopup(
          {
            title,
            message,
            buttons,
          },
          handle
        );
      },
    };
  } else {
    console.error(
      '无法读取 Telegram 对象，请先引入 https://telegram.org/js/telegram-web-app.js'
    );
  }
})();
