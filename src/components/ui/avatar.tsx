import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarStatus = "online" | "offline" | "busy" | "away" | "verified";
export type AvatarRing = "none" | "default" | "gradient" | "emerald" | "teal" | "amber" | "rose" | "purple";

const SIZE_CLASSES: Record<AvatarSize, { root: string; fallback: string; status: string; statusIcon: string }> = {
  xs:  { root: "h-6 w-6",   fallback: "text-[10px]", status: "h-2 w-2 border",       statusIcon: "w-1.5 h-1.5" },
  sm:  { root: "h-8 w-8",   fallback: "text-xs",     status: "h-2.5 w-2.5 border",   statusIcon: "w-2 h-2" },
  md:  { root: "h-10 w-10", fallback: "text-sm",     status: "h-3 w-3 border-2",     statusIcon: "w-2 h-2" },
  lg:  { root: "h-12 w-12", fallback: "text-base",   status: "h-3.5 w-3.5 border-2", statusIcon: "w-2.5 h-2.5" },
  xl:  { root: "h-14 w-14", fallback: "text-lg",     status: "h-4 w-4 border-2",     statusIcon: "w-2.5 h-2.5" },
  "2xl":{ root: "h-16 w-16", fallback: "text-xl",   status: "h-4.5 w-4.5 border-2", statusIcon: "w-3 h-3" },
  "3xl":{ root: "h-20 w-20", fallback: "text-2xl",  status: "h-5 w-5 border-2",     statusIcon: "w-3 h-3" },
  "4xl":{ root: "h-24 w-24", fallback: "text-3xl",  status: "h-6 w-6 border-2",     statusIcon: "w-3.5 h-3.5" },
};

const SHAPE_CLASSES: Record<AvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
  square: "rounded-lg",
};

const RING_CLASSES: Record<AvatarRing, string> = {
  none: "",
  default: "ring-2 ring-border",
  gradient: "p-0.5 bg-gradient-to-tr from-teal-400 via-primary to-emerald-400 shadow-md",
  emerald: "ring-2 ring-emerald-400/60 shadow-emerald-500/10",
  teal: "ring-2 ring-teal-400/60 shadow-teal-500/10",
  amber: "ring-2 ring-amber-400/60 shadow-amber-500/10",
  rose: "ring-2 ring-rose-400/60 shadow-rose-500/10",
  purple: "ring-2 ring-purple-400/60 shadow-purple-500/10",
};

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  ring?: AvatarRing;
  glow?: boolean;
}

/**
 * Avatar — Radix-based avatar with size variants, shape options, status dots, and glow halos.
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ 
  className, 
  size = "md", 
  shape = "circle", 
  status, 
  ring = "none", 
  glow = false, 
  children, 
  ...props 
}, ref) => {
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const shapeClass = SHAPE_CLASSES[shape] || SHAPE_CLASSES.circle;
  const ringClass = RING_CLASSES[ring] || "";

  return (
    <div className={cn("relative inline-flex shrink-0 select-none", sizeConfig.root)}>
      {/* Ambient Glow */}
      {glow && (
        <div
          className={cn(
            "absolute -inset-1 blur-md opacity-60 pointer-events-none transition-opacity duration-300 group-hover:opacity-100",
            shapeClass,
            ring === "amber" ? "bg-amber-400/40" : ring === "rose" ? "bg-rose-400/40" : "bg-teal-400/40"
          )}
        />
      )}

      {/* Main Avatar Container */}
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex h-full w-full shrink-0 overflow-hidden border border-white/10 bg-card/60 backdrop-blur-md shadow-inner transition-transform duration-200",
          sizeConfig.root,
          shapeClass,
          ringClass,
          className
        )}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>

      {/* Online / Offline / Verified Status Dot */}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 z-10 flex items-center justify-center rounded-full border-card shadow-sm transition-transform",
            sizeConfig.status,
            status === "online" && "bg-emerald-400",
            status === "busy" && "bg-rose-500",
            status === "away" && "bg-amber-400",
            status === "offline" && "bg-slate-400",
            status === "verified" && "bg-sky-500 text-white"
          )}
          title={`Status: ${status}`}
        >
          {status === "verified" && (
            <Check className={cn("stroke-[3]", sizeConfig.statusIcon)} />
          )}
          {status === "online" && (
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          )}
        </span>
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover transition-opacity duration-300", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500/20 via-emerald-500/10 to-primary/20 text-teal-300 font-display font-bold tracking-wider",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

/* =========================================================================
   AvatarGroup — Overlapping Avatar Stack (e.g. +5 Others)
   ========================================================================= */
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  totalCount?: number;
  size?: AvatarSize;
  children: React.ReactNode;
}

export function AvatarGroup({
  max = 4,
  totalCount,
  size = "md",
  className,
  children,
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleAvatars = childrenArray.slice(0, max);
  const excess = totalCount ? totalCount - max : childrenArray.length - max;
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div className={cn("flex items-center -space-x-3 hover:space-x-1 transition-all duration-300", className)} {...props}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="relative transition-transform duration-200 hover:scale-110 hover:z-20">
          {child}
        </div>
      ))}

      {excess > 0 && (
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full border-2 border-background bg-card text-muted-foreground font-mono font-bold shadow-md",
            sizeConfig.root,
            sizeConfig.fallback
          )}
        >
          +{excess}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };