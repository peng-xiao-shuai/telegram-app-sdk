import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type FC, useState } from 'react';
import { Button } from './ui/button';
import type { PayListResponse } from '@telegram-sdk/ts-core';

export const DialogPayContent: FC<{
  title: string;
  desc: string;
  list: PayListResponse['support_token'];
  callback: (payItem: PayListResponse['support_token'][number]) => void;
}> = ({ title, desc, list, callback }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{desc}</DialogDescription>
      </DialogHeader>

      <div>
        {list.map((item) => (
          <Button
            className="tg_sdk_ui_w-full tg_sdk_ui_mb-4 last-of-type:tg_sdk_ui_mb-0"
            key={item.token}
            onClick={() => {
              callback(item);
            }}
          >
            <b>
              {item.amount} {item.token}
            </b>
          </Button>
        ))}
      </div>
    </>
  );
};

export const PayTypePopup: FC<{
  title: string;
  desc: string;
  list: PayListResponse['support_token'];
  callback: (payItem: PayListResponse['support_token'][number]) => void;
  onClose: () => void;
}> = (props) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      props.onClose();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogPayContent {...props}></DialogPayContent>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
