import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — small status/label pill.
 * Used by AnnouncementCard, GalleryCard and similar surfaces.
 *
 * Variants follow the brand palette so badges blend with cards
 * without looking like third-party defaults.
 */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5",
    "text-[10px] font-mono font-semibold uppercase tracking-wider",
    "transition-colors duration-150",
    "[&_svg]:size-3 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-primary",
        secondary:
          "border-transparent bg-secondary/15 text-secondary",
        accent:
          "border-transparent bg-accent/15 text-accent",
        destructive:
          "border-transparent bg-destructive/15 text-destructive",
        outline:
          "border-white/15 bg-white/5 text-foreground/80",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-300",
        warning:
          "border-transparent bg-amber-500/15 text-amber-300",
        info:
          "border-transparent bg-sky-500/15 text-sky-300",
        muted:
          "border-transparent bg-white/5 text-muted-foreground",
      },
      size: {
        sm: "text-[9px] px-2 py-0",
        default: "",
        lg: "text-xs px-3 py-1 tracking-widest",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
