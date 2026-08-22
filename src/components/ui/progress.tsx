import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorColor?: string;
  showValue?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, indicatorColor, showValue = false, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {showValue && (
      <div className="flex justify-between text-xs font-mono font-medium text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(value || 0)}%</span>
      </div>
    )}
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
          indicatorColor || "bg-gradient-to-r from-teal-400 via-primary to-emerald-400"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  </div>
));
Progress.displayName = "Progress";

export { Progress };