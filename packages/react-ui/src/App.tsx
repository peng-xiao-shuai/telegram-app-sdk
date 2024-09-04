import { useEffect, useState } from 'react';
import './App.css';
import { login, openPayList, openPopupPay, share } from './lib/telegram-utils';
import { Button } from './components/ui/button';

function App() {
  return <Page></Page>;
}

const Page = () => {
  const [initData, setInitData] = useState('');
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    setIsLogin(!!window.TG_SDK_CORE?.Token);
  }, []);
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
          setIsLogin(true);
          setInitData(JSON.stringify(data));
        } else {
          setIsLogin(false);
        }
      },
    });
  };
  return (
    <div className="tg_sdk_ui_max-w-[80vw] tg_sdk_ui_mx-auto tg_sdk_ui_pt-10">
      <div className="tg_sdk_ui_flex tg_sdk_ui_justify-center tg_sdk_ui_gap-4">
        <div>
          <Button onClick={openPayList} disabled={!isLogin}>
            Pay Lists
          </Button>
        </div>

        <div>
          <Button onClick={click} disabled={!isLogin}>
            Pay
          </Button>
        </div>

        <div>
          <Button
            onClick={() => {
              share({
                text: '输入框内容',
                cb: () => {
                  console.log('成功');
                },
              });
            }}
            disabled={!isLogin}
          >
            Share
          </Button>
        </div>

        <div>
          <Button onClick={loginClick}>Login</Button>
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
