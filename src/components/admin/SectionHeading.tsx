 import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type HeadingSize = "sm" | "md" | "lg";

interface SectionHeadingProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  
  // 🏷️ নতুন ক্যাটাগরি ও ব্যাজ ফিচারসমূহ
  eyebrow?: string; // টাইটেলের উপরের ছোট ক্যাটাগরি টেক্সট
  badge?: React.ReactNode | string;
  count?: number;
  countLabel?: string;
  
  // ⚡ অ্যাকশন ও কন্ট্রোল
  actions?: React.ReactNode; // হেডারের ডানপাশের বাটনসমূহ
  
  // 🎨 ডিজাইন ও সাইজ ভ্যারিয়েন্ট
  size?: HeadingSize;
  gradientTitle?: boolean;
  divider?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const SIZE_CONFIG: Record<
  HeadingSize,
  {
    title: string;
    desc: string;
    iconBox: string;
    iconSize: string;
  }
> = {
  sm: {
    title: "text-base sm:text-lg font-bold",
    desc: "text-xs text-muted-foreground",
    iconBox: "w-8 h-8 rounded-lg",
    iconSize: "text-sm",
  },
  md: {
    title: "text-lg sm:text-xl font-bold",
    desc: "text-xs sm:text-sm text-muted-foreground/90",
    iconBox: "w-10 h-10 rounded-xl",
    iconSize: "text-base",
  },
  lg: {
    title: "text-xl sm:text-2xl font-bold",
    desc: "text-sm text-muted-foreground/90",
    iconBox: "w-12 h-12 rounded-2xl",
    iconSize: "text-lg",
  },
};

export default function SectionHeading({
  title,
  description,
  icon,
  eyebrow,
  badge,
  count,
  countLabel,
  actions,
  size = "md",
  gradientTitle = false,
  divider = false,
  className,
  children,
}: SectionHeadingProps) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Left Side: Icon + Eyebrow + Title + Description */}
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Icon Box */}
          {icon && (
            <div
              className={cn(
                "shrink-0 bg-teal-500/10 border border-teal-500/30 text-teal-400 grid place-items-center shadow-inner transition-transform duration-300 hover:scale-105",
                config.iconBox
              )}
            >
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            {/* Optional Eyebrow / Overline */}
            {eyebrow && (
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-400/90">
                {eyebrow}
              </p>
            )}

            {/* Title Row with Badges and Count */}
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={cn(
                  "font-display leading-tight tracking-tight text-foreground",
                  config.title,
                  gradientTitle && "bg-linear-to-r from-teal-400 via-emerald-300 to-sky-400 bg-clip-text text-transparent"
                )}
              >
                {title}
              </h2>

              {/* Count Chip */}
              {typeof count === "number" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-teal-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  {count} {countLabel ? countLabel : ""}
                </span>
              )}

              {/* Custom Badge */}
              {badge && (
                typeof badge === "string" ? (
                  <Badge variant="outline" className="border-white/15 bg-white/5 text-[11px] font-medium">
                    {badge}
                  </Badge>
                ) : (
                  badge
                )
              )}
            </div>

            {/* Description */}
            {description && (
              <p className={cn("leading-relaxed max-w-3xl", config.desc)}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Action Toolbar */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 self-start sm:self-center">
            {actions}
          </div>
        )}

      </div>

      {/* Extra Slot Content */}
      {children && <div>{children}</div>}

      {/* Optional Divider Line */}
      {divider && (
        <div className="h-px w-full bg-linear-to-r from-white/10 via-white/5 to-transparent pt-1" />
      )}
    </div>
  );
}