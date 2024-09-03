import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "tg_sdk_ui_inline-flex tg_sdk_ui_items-center tg_sdk_ui_justify-center tg_sdk_ui_whitespace-nowrap tg_sdk_ui_rounded-md tg_sdk_ui_text-sm tg_sdk_ui_font-medium tg_sdk_ui_transition-colors focus-visible:tg_sdk_ui_outline-none focus-visible:tg_sdk_ui_ring-1 focus-visible:tg_sdk_ui_ring-ring disabled:tg_sdk_ui_pointer-events-none disabled:tg_sdk_ui_opacity-50",
  {
    variants: {
      variant: {
        default:
          "tg_sdk_ui_bg-primary tg_sdk_ui_text-primary-foreground tg_sdk_ui_shadow hover:tg_sdk_ui_bg-primary/90",
        destructive:
          "tg_sdk_ui_bg-destructive tg_sdk_ui_text-destructive-foreground tg_sdk_ui_shadow-sm hover:tg_sdk_ui_bg-destructive/90",
        outline:
          "tg_sdk_ui_border tg_sdk_ui_border-input tg_sdk_ui_bg-background tg_sdk_ui_shadow-sm hover:tg_sdk_ui_bg-accent hover:tg_sdk_ui_text-accent-foreground",
        secondary:
          "tg_sdk_ui_bg-secondary tg_sdk_ui_text-secondary-foreground tg_sdk_ui_shadow-sm hover:tg_sdk_ui_bg-secondary/80",
        ghost: "hover:tg_sdk_ui_bg-accent hover:tg_sdk_ui_text-accent-foreground",
        link: "tg_sdk_ui_text-primary tg_sdk_ui_underline-offset-4 hover:tg_sdk_ui_underline",
      },
      size: {
        default: "tg_sdk_ui_h-9 tg_sdk_ui_px-4 tg_sdk_ui_py-2",
        sm: "tg_sdk_ui_h-8 tg_sdk_ui_rounded-md tg_sdk_ui_px-3 tg_sdk_ui_text-xs",
        lg: "tg_sdk_ui_h-10 tg_sdk_ui_rounded-md tg_sdk_ui_px-8",
        icon: "tg_sdk_ui_h-9 tg_sdk_ui_w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
