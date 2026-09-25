import { cn } from "@/lib/utils";

/**
 * Skeleton — loading placeholder. Uses a subtle shimmer that fits
 * the dark theme; consumers can override with className.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/5",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)]",
        "before:animate-[shimmer_1.6s_infinite]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
