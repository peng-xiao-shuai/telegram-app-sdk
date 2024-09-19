import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ComponentProps, type FC, memo, useCallback, useState } from 'react';
import { Button } from './ui/button';
import type { PayListResponse, TG_SDK_NAMESPACE } from '@telegram-sdk/ts-core';
import { DialogPayContent } from './PayTypesPopup';

const PayListItem: FC<{
  item: PayListResponse;
  onItemClick: (item: PayListResponse) => void;
}> = memo(({ item, onItemClick }) => (
  <Button
    className="tg_sdk_ui_w-full tg_sdk_ui_h-auto tg_sdk_ui_mb-4 last-of-type:tg_sdk_ui_mb-0"
    onClick={() => onItemClick(item)}
  >
    <div className="">
      <b>{item.title}</b>
      <div>{item.description}</div>
    </div>
  </Button>
));

export const PayListPopup: FC<{
  list: PayListResponse[];
  callback: (payItem: PayListResponse['support_token'][number]) => void;
  onClose: () => void;
}> = ({ callback, onClose, list }) => {
  const [open, setOpen] = useState(true);
  const [payContentData, setPayContentData] = useState<ComponentProps<
    typeof DialogPayContent
  > | null>(null);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleItemClick = useCallback(
    (item: PayListResponse) => {
      window.TG_SDK_UI.PopupPayOptions = {
        ...(window.TG_SDK_UI
          .PopupPayOptions! as TG_SDK_NAMESPACE.OpenPayListPopupParams),
        item_id: item.id,
      };
      setPayContentData({
        title: item.title,
        desc: item.description,
        list: item.support_token,
        callback: callback,
      });
    },
    [callback]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <div
          className={payContentData ? 'tg_sdk_ui_hidden' : 'tg_sdk_ui_block'}
        >
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          {list.map((item) => (
            <PayListItem
              key={item.id}
              item={item}
              onItemClick={handleItemClick}
            />
          ))}
        </div>

        {payContentData && (
          <DialogPayContent {...payContentData}></DialogPayContent>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (payContentData) {
                setPayContentData(null);
              } else {
                handleClose();
              }
            }}
          >
            {payContentData ? 'Back' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
