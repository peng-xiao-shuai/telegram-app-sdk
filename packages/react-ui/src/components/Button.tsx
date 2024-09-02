import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button
      className="tg_sdk_ui_text-green-900"
      onClick={() => {
        console.log('内部触发，onClick');
        onClick?.();
      }}
    >
      {label}
    </button>
  );
};

export default Button;
