import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "tg_sdk_ui_fixed tg_sdk_ui_inset-0 tg_sdk_ui_z-50 tg_sdk_ui_bg-black/80 tg_sdk_ui_ data-[state=open]:tg_sdk_ui_animate-in data-[state=closed]:tg_sdk_ui_animate-out data-[state=closed]:tg_sdk_ui_fade-out-0 data-[state=open]:tg_sdk_ui_fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "tg_sdk_ui_fixed tg_sdk_ui_left-[50%] tg_sdk_ui_top-[50%] tg_sdk_ui_z-50 tg_sdk_ui_grid tg_sdk_ui_w-full tg_sdk_ui_max-w-lg tg_sdk_ui_translate-x-[-50%] tg_sdk_ui_translate-y-[-50%] tg_sdk_ui_gap-4 tg_sdk_ui_border tg_sdk_ui_bg-background tg_sdk_ui_p-6 tg_sdk_ui_shadow-lg tg_sdk_ui_duration-200 data-[state=open]:tg_sdk_ui_animate-in data-[state=closed]:tg_sdk_ui_animate-out data-[state=closed]:tg_sdk_ui_fade-out-0 data-[state=open]:tg_sdk_ui_fade-in-0 data-[state=closed]:tg_sdk_ui_zoom-out-95 data-[state=open]:tg_sdk_ui_zoom-in-95 data-[state=closed]:tg_sdk_ui_slide-out-to-left-1/2 data-[state=closed]:tg_sdk_ui_slide-out-to-top-[48%] data-[state=open]:tg_sdk_ui_slide-in-from-left-1/2 data-[state=open]:tg_sdk_ui_slide-in-from-top-[48%] sm:tg_sdk_ui_rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="tg_sdk_ui_absolute tg_sdk_ui_right-4 tg_sdk_ui_top-4 tg_sdk_ui_rounded-sm tg_sdk_ui_opacity-70 tg_sdk_ui_ring-offset-background tg_sdk_ui_transition-opacity hover:tg_sdk_ui_opacity-100 focus:tg_sdk_ui_outline-none focus:tg_sdk_ui_ring-2 focus:tg_sdk_ui_ring-ring focus:tg_sdk_ui_ring-offset-2 disabled:tg_sdk_ui_pointer-events-none data-[state=open]:tg_sdk_ui_bg-accent data-[state=open]:tg_sdk_ui_text-muted-foreground">
        <Cross2Icon className="tg_sdk_ui_h-4 tg_sdk_ui_w-4" />
        <span className="tg_sdk_ui_sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "tg_sdk_ui_flex tg_sdk_ui_flex-col tg_sdk_ui_space-y-1.5 tg_sdk_ui_text-center sm:tg_sdk_ui_text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "tg_sdk_ui_flex tg_sdk_ui_flex-col-reverse sm:tg_sdk_ui_flex-row sm:tg_sdk_ui_justify-end sm:tg_sdk_ui_space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "tg_sdk_ui_text-lg tg_sdk_ui_font-semibold tg_sdk_ui_leading-none tg_sdk_ui_tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("tg_sdk_ui_text-sm tg_sdk_ui_text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
