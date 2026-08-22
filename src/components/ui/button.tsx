import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5",
        gradient:
          "bg-gradient-to-r from-teal-500 via-primary to-emerald-500 text-black font-bold shadow-lg shadow-teal-500/20 hover:opacity-95 hover:shadow-teal-500/35 hover:-translate-y-0.5",
        glow:
          "border border-primary/50 bg-primary/15 text-primary shadow-lg shadow-primary/20 hover:bg-primary/25 hover:border-primary",
        destructive:
          "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 hover:shadow-rose-600/30",
        outline:
          "border border-white/15 bg-background/40 backdrop-blur-md text-foreground hover:bg-white/10 hover:border-white/25",
        secondary:
          "bg-secondary/80 text-secondary-foreground border border-white/10 backdrop-blur-md hover:bg-secondary hover:text-foreground",
        ghost:
          "text-foreground hover:bg-white/5 hover:text-primary",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-2xl font-bold",
        icon: "h-10 w-10 p-0 rounded-xl",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };