import React from "react";
import { 
  ArrowUpRight, 
  Minus, 
  TrendingDown, 
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StatVariant = 
  | "emerald" 
  | "teal" 
  | "sky" 
  | "amber" 
  | "rose" 
  | "purple" 
  | "indigo" 
  | "default";

interface StatPillProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  
  // 💲 ফরম্যাটিং
  prefix?: string;
  suffix?: string;
  
  // 🎨 থিম ও ডিজাইন
  variant?: StatVariant;
  
  // 📈 ট্রেন্ড ও পারফরম্যান্স
  trend?: {
    value: number | string;
    direction?: "up" | "down" | "neutral";
    label?: string;
    isPositiveGood?: boolean; // false হলে ট্রেন্ড আপ হলে লাল এবং ডাউন হলে সবুজ হবে (e.g. Bounce rate/Errors)
  };
  
  hint?: string;
  progress?: number; // ০ থেকে ১০০ এর প্রগ্রেস বার
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const THEME_CONFIG: Record<
  StatVariant,
  {
    iconBox: string;
    glow: string;
    borderHover: string;
    progressFill: string;
  }
> = {
  emerald: {
    iconBox: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    glow: "from-emerald-500/10 via-transparent to-transparent",
    borderHover: "hover:border-emerald-500/40 hover:shadow-emerald-500/5",
    progressFill: "bg-emerald-400",
  },
  teal: {
    iconBox: "bg-teal-500/10 border-teal-500/30 text-teal-400",
    glow: "from-teal-500/10 via-transparent to-transparent",
    borderHover: "hover:border-teal-500/40 hover:shadow-teal-500/5",
    progressFill: "bg-teal-400",
  },
  sky: {
    iconBox: "bg-sky-500/10 border-sky-500/30 text-sky-400",
    glow: "from-sky-500/10 via-transparent to-transparent",
    borderHover: "hover:border-sky-500/40 hover:shadow-sky-500/5",
    progressFill: "bg-sky-400",
  },
  amber: {
    iconBox: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    glow: "from-amber-500/10 via-transparent to-transparent",
    borderHover: "hover:border-amber-500/40 hover:shadow-amber-500/5",
    progressFill: "bg-amber-400",
  },
  rose: {
    iconBox: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    glow: "from-rose-500/10 via-transparent to-transparent",
    borderHover: "hover:border-rose-500/40 hover:shadow-rose-500/5",
    progressFill: "bg-rose-400",
  },
  purple: {
    iconBox: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    glow: "from-purple-500/10 via-transparent to-transparent",
    borderHover: "hover:border-purple-500/40 hover:shadow-purple-500/5",
    progressFill: "bg-purple-400",
  },
  indigo: {
    iconBox: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
    glow: "from-indigo-500/10 via-transparent to-transparent",
    borderHover: "hover:border-indigo-500/40 hover:shadow-indigo-500/5",
    progressFill: "bg-indigo-400",
  },
  default: {
    iconBox: "bg-white/5 border-white/10 text-foreground",
    glow: "from-white/5 via-transparent to-transparent",
    borderHover: "hover:border-primary/40",
    progressFill: "bg-primary",
  },
};

export default function StatPill({
  label,
  value,
  icon,
  prefix,
  suffix,
  variant = "teal",
  trend,
  hint,
  progress,
  loading = false,
  onClick,
  className,
  children,
}: StatPillProps) {
  const theme = THEME_CONFIG[variant] || THEME_CONFIG.teal;

  // ট্রেন্ড পজিটিভ/নেগেটিভ ক্যালকুলেশন
  const isPositive = trend?.direction === "up" || (!trend?.direction && typeof trend?.value === "number" && trend.value > 0);
  const isNeutral = trend?.direction === "neutral" || trend?.value === 0;
  const isGood = trend?.isPositiveGood !== false ? isPositive : !isPositive;

  // লোডিং স্কেলিটন ভিউ
  if (loading) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl animate-pulse space-y-3", className)}>
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-white/10 rounded-md" />
          <div className="h-9 w-9 bg-white/10 rounded-xl" />
        </div>
        <div className="h-8 w-28 bg-white/10 rounded-lg" />
        <div className="h-4 w-36 bg-white/10 rounded-md pt-1" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl shadow-lg transition-all duration-300",
        theme.borderHover,
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-2xl",
        className
      )}
    >
      {/* Top Ambient Glow */}
      <div className={cn("absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-50", theme.glow)} />

      {/* Top Row: Label & Icon */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            {onClick && (
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            )}
            <div
              className={cn(
                "w-9 h-9 rounded-xl border grid place-items-center transition-transform duration-300 group-hover:scale-110 shadow-inner",
                theme.iconBox
              )}
            >
              {icon}
            </div>
          </div>
        </div>

        {/* Big Value Section with Prefix & Suffix */}
        <div className="mt-3 flex items-baseline gap-1">
          {prefix && (
            <span className="text-xl sm:text-2xl font-bold text-muted-foreground/80 font-mono">
              {prefix}
            </span>
          )}
          <p className="text-2xl sm:text-3xl font-display font-black text-foreground tracking-tight">
            {value}
          </p>
          {suffix && (
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground ml-0.5">
              {suffix}
            </span>
          )}
        </div>
      </div>

      {/* Optional Mini Progress Bar */}
      {typeof progress === "number" && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Progress</span>
            <span className="font-bold text-foreground">{Math.min(Math.max(progress, 0), 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={cn("h-full rounded-full transition-all duration-500", theme.progressFill)}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Extra Slot */}
      {children && <div className="mt-2">{children}</div>}

      {/* Bottom Row: Trend Chip & Hint */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono pt-2 border-t border-white/5">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-tight shadow-sm",
              isNeutral
                ? "bg-slate-500/10 border-slate-500/30 text-slate-400"
                : isGood
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            )}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {typeof trend.value === "number" && trend.value > 0 ? "+" : ""}
            {trend.value}% {trend.label ? trend.label : ""}
          </span>
        ) : (
          <span />
        )}

        {hint && (
          <span className="text-muted-foreground/80 truncate max-w-[130px]" title={hint}>
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}