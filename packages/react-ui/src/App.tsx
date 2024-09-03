import { useEffect, useState } from 'react';
import './App.css';
import { login, openPopupPay } from './lib/telegram-utils';

function App() {
  useEffect(() => {
    window._setTelegramSDKConfig({
      debug: true,
      appid: '5EDhUSpJU9aV9NVZRx9UXg',
      tonConfig: {
        manifestUrl: `https://docbphqre6f8b.cloudfront.net/tonconnect-manifest.json`,
      },
    });
  }, []);
  return (
    <>
      <Page></Page>
    </>
  );
}

const Page = () => {
  const [initData, setInitData] = useState('');
  const click = () => {
    openPopupPay(
      {
        title: '首冲礼包',
        message: '首冲礼包 ￥6 获得 xxx 钻石',
        /**
         * Stars 必须为整数
         */
        amount: '1',
        /**
         * 有概率支付失败，随机数可能会重复
         */
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
      ]
    );
  };

  const loginClick = () => {
    setInitData('');

    login({
      cb: ({ status, data }) => {
        if (status === 'success') {
          setInitData(JSON.stringify(data));
        }
      },
    });
  };
  return (
    <div className="tg_sdk_ui_max-w-[80vw] tg_sdk_ui_mx-auto tg_sdk_ui_pt-10">
      <div className="tg_sdk_ui_flex tg_sdk_ui_justify-center tg_sdk_ui_gap-4">
        <div>
          <button
            className="tg_sdk_ui_px-6 tg_sdk_ui_btn tg_sdk_ui_py-2 tg_sdk_ui_border tg_sdk_ui_rounded-[0.5rem] tg_sdk_ui_border-white tg_sdk_ui_w-full tg_sdk_ui_text-white tg_sdk_ui_text-2xl"
            onClick={click}
          >
            Pay
          </button>
        </div>

        <div>
          <button
            className="tg_sdk_ui_px-6 tg_sdk_ui_btn tg_sdk_ui_py-2 tg_sdk_ui_border tg_sdk_ui_rounded-[0.5rem] tg_sdk_ui_border-white tg_sdk_ui_w-full tg_sdk_ui_text-white tg_sdk_ui_text-2xl"
            onClick={loginClick}
          >
            Login
          </button>
        </div>
      </div>

      <div className="tg_sdk_ui_w-[80vw] tg_sdk_ui_mx-auto tg_sdk_ui_break-words tg_sdk_ui_text-white">
        <div className="tg_sdk_ui_font-bold">登录返回：</div>
        {initData}
      </div>
    </div>
  );
};

export default App;
