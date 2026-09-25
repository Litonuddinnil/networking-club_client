import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — redesigned against the networking-club dark/emerald theme.
 *
 * Variants:
 *  - default      : solid emerald primary
 *  - gradient     : emerald → teal → lime brand gradient (signature CTA)
 *  - outline      : thin border, transparent fill
 *  - secondary    : teal block
 *  - ghost        : no background, hover surface only
 *  - destructive  : red block for dangerous actions
 *  - link         : inline text link
 *
 * Sizes:
 *  - default | sm | lg | icon
 *
 * Notes:
 *  - focus-visible uses the project's --ring token so it always matches
 *    the active accent.
 *  - disabled blocks pointer events so it cannot be re-focused.
 *  - asChild renders via Radix Slot, preserving child element styling.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-sm font-medium font-sans tracking-tight",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30",
        gradient:
          "text-[#06130d] font-semibold shadow-md " +
          "bg-[linear-gradient(135deg,#22c55e_0%,#2dd4bf_55%,#a3e635_100%)] " +
          "hover:brightness-110 hover:shadow-[0_8px_28px_-8px_rgba(45,212,191,0.55)] " +
          "active:brightness-95",
        outline:
          "border border-white/15 bg-white/5 text-foreground " +
          "hover:bg-white/10 hover:border-white/25",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm " +
          "hover:bg-secondary/85",
        ghost:
          "text-foreground/80 hover:bg-white/5 hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-destructive/30 " +
          "hover:bg-destructive/90",
        link:
          "text-primary underline-offset-4 hover:underline hover:text-primary/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs rounded-md",
        lg: "h-11 px-6 text-base rounded-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
