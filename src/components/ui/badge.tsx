import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider font-mono transition-all backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/15 text-primary shadow-sm shadow-primary/10",
        secondary: "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground",
        outline: "border-white/20 text-foreground bg-transparent",
        glass: "border-white/15 bg-black/40 text-white backdrop-blur-lg shadow-md",
        success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-emerald-500/10",
        warning: "border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-amber-500/10",
        destructive: "border-rose-500/30 bg-rose-500/15 text-rose-400 shadow-rose-500/10",
        cyan: "border-cyan-500/30 bg-cyan-500/15 text-cyan-400 shadow-cyan-500/10",
        purple: "border-purple-500/30 bg-purple-500/15 text-purple-400 shadow-purple-500/10",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5 gap-1",
        default: "text-[11px] px-2.5 py-0.5",
        lg: "text-xs px-3.5 py-1 gap-2 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  pulse?: boolean;
}

function Badge({ className, variant, size, dot = false, pulse = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };