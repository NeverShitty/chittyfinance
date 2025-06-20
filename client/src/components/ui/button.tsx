import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] hover:shadow-medium active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-soft hover:from-emerald-500 hover:to-emerald-400 hover:shadow-glow",
        destructive: "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-soft hover:from-red-500 hover:to-red-400",
        outline: "border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm text-slate-300 hover:bg-slate-800/60 hover:text-white hover:border-emerald-500/40",
        secondary: "bg-slate-800/60 backdrop-blur-sm text-slate-300 shadow-soft hover:bg-slate-700/60 hover:text-white",
        ghost: "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200",
        link: "text-emerald-400 underline-offset-4 hover:underline hover:text-emerald-300",
        luxury: "bg-gradient-to-r from-gold-600 to-gold-500 text-white shadow-gold-glow hover:from-gold-500 hover:to-gold-400 hover:shadow-gold-glow",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
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
