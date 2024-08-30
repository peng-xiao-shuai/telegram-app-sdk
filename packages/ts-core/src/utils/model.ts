import type { TG_SDK_NAMESPACE } from '../core';

// 创建遮罩层
const modalOverlay: HTMLDivElement = document.createElement('div');
modalOverlay.classList.add('tg-pay-popup-model')
Object.assign(modalOverlay.style, {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: -1,
  opacity: '0',
  transition: 'opacity 0.3s ease-in-out',
});

// 创建弹窗
const modal: HTMLDivElement = document.createElement('div');
const modalTitle: HTMLDivElement = document.createElement('div');
Object.assign(modalTitle.style, {
  width: '100%',
  textAlign: 'center',
  color: 'black'
});
Object.assign(modal.style, {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '20px',
  width: '300px',
  maxWidth: '80%',
  textAlign: 'center',
  transform: 'scale(0)',
  transition: 'transform 0.3s ease-in-out',
});

// 创建弹窗内容容器
const modalContent: HTMLDivElement = document.createElement('div');

// 添加按钮样式
const style = document.createElement('style');
style.innerHTML = `
  .tg-pay-popup-model button:hover {
    background-color: #0056b3;
  }
`;
modal.appendChild(modalTitle);
modal.appendChild(modalContent);
modalOverlay.appendChild(modal);
document.body.appendChild(modalOverlay);
document.head.appendChild(style);

export function createButton(this: any, buttons: TG_SDK_NAMESPACE.ParamsPopupButton[]) {
  // 循环生成按钮
  buttons.forEach((button: TG_SDK_NAMESPACE.ParamsPopupButton) => {
    const btn: HTMLButtonElement = document.createElement('button');
    btn.textContent = button.text || button.id;
    Object.assign(btn.style, {
      margin: '5px',
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    });

    btn.onclick = () => {
      this.popupCallback(button.id)
    };
    modalContent.appendChild(btn);
  });
}

// 显示弹窗函数
export function showModal({
  title,
}: {
  title: string
}): void {
  modalTitle.textContent = title
  modalOverlay.style.opacity = '1';
  modalOverlay.style.zIndex = '1000'
  setTimeout(() => {
    modal.style.transform = 'scale(1)';
  }, 300);
}

// 关闭弹窗函数
export function closeModal(): void {
  modal.style.transform = 'scale(0)';
  setTimeout(() => {
    modalOverlay.style.opacity = '0';
    modalOverlay.style.zIndex = '-1'
  }, 300);
}

// 点击遮罩层关闭弹窗
modalOverlay.onclick = (e: MouseEvent) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
};
