import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatPillProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconColor?: string;
  trend?: {
    value: number;
    direction?: "up" | "down";
    label?: string;
  };
  hint?: string;
  className?: string;
}

/**
 * StatPill — premium stats card with icon, animated counter, and trend chip.
 * Uses the .stat-capsule utility for the gradient halo.
 */
export default function StatPill({
  label,
  value,
  icon,
  iconColor = "text-emerald-400",
  trend,
  hint,
  className,
}: StatPillProps) {
  return (
    <div className={cn("stat-capsule group", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 grid place-items-center group-hover:scale-110 transition",
            iconColor
          )}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-3xl font-display font-extrabold text-foreground animate-count-pulse">
        {value}
      </p>

      <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border",
              trend.direction === "down"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            )}
          >
            {trend.direction === "down" ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            {trend.value > 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        ) : (
          <span />
        )}
        {hint && (
          <span className="text-muted-foreground truncate max-w-[140px]">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}