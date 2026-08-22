 import React from "react";
import { 
  Plus, 
  SearchX, 
  FilterX, 
  RotateCcw, 
  Inbox, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmptyStateVariant = "default" | "search" | "filter" | "error";

interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  variant?: EmptyStateVariant;

  // Primary Action
  ctaLabel?: string;
  onCta?: () => void;
  ctaIcon?: React.ReactNode;
  cta?: ActionItem;

  // Secondary Action
  secondaryAction?: ActionItem;

  // Search & Filter Shortcuts
  searchQuery?: string;
  onClearSearch?: () => void;

  // Layout Controls
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const VARIANT_CONFIG: Record<
  EmptyStateVariant,
  {
    defaultIcon: React.ReactNode;
    iconBox: string;
    glow: string;
  }
> = {
  default: {
    defaultIcon: <Inbox className="w-8 h-8 text-teal-400" />,
    iconBox: "bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-teal-500/10",
    glow: "bg-teal-500/10",
  },
  search: {
    defaultIcon: <SearchX className="w-8 h-8 text-amber-400" />,
    iconBox: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10",
    glow: "bg-amber-500/10",
  },
  filter: {
    defaultIcon: <FilterX className="w-8 h-8 text-sky-400" />,
    iconBox: "bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-sky-500/10",
    glow: "bg-sky-500/10",
  },
  error: {
    defaultIcon: <AlertCircle className="w-8 h-8 text-rose-400" />,
    iconBox: "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10",
    glow: "bg-rose-500/10",
  },
};

export default function EmptyState({
  icon,
  title,
  description,
  variant = "default",
  ctaLabel,
  onCta,
  ctaIcon,
  cta,
  secondaryAction,
  searchQuery,
  onClearSearch,
  compact = false,
  className,
  children,
}: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  const activeIcon = icon || config.defaultIcon;

  // Primary Button Config Resolver
  const primaryActionLabel = cta?.label || ctaLabel;
  const primaryActionHandler = cta?.onClick || onCta;
  const primaryActionIcon = cta?.icon || ctaIcon || (variant === "search" || variant === "filter" ? <RotateCcw className="w-4 h-4" /> : <Plus className="w-4 h-4" />);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center text-center overflow-hidden rounded-3xl border border-dashed border-white/15 bg-card/40 backdrop-blur-xl p-8 sm:p-12 transition-all animate-in fade-in zoom-in-95 duration-300",
        compact ? "p-6 sm:p-8" : "",
        className
      )}
    >
      {/* Subtle Ambient Radial Rings Behind Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className={cn("w-64 h-64 rounded-full blur-3xl", config.glow)} />
      </div>

      {/* Center Icon Box */}
      <div className="relative z-10 mb-4">
        <div className={cn(
          "rounded-2xl border flex items-center justify-center shadow-xl transition-transform duration-300 hover:scale-105",
          compact ? "w-12 h-12" : "w-16 h-16",
          config.iconBox
        )}>
          {activeIcon}
        </div>
      </div>

      {/* Text Info */}
      <div className="relative z-10 max-w-md space-y-1.5">
        <h3 className={cn(
          "font-display font-bold text-foreground leading-tight",
          compact ? "text-base" : "text-lg sm:text-xl"
        )}>
          {title}
        </h3>

        {description && (
          <p className={cn(
            "text-muted-foreground/90 leading-relaxed",
            compact ? "text-xs" : "text-sm"
          )}>
            {description}
          </p>
        )}

        {/* Highlighted Search Query Badge */}
        {searchQuery && (
          <p className="pt-1 text-xs text-muted-foreground">
            No matches found for: <span className="font-mono font-semibold text-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">"{searchQuery}"</span>
          </p>
        )}
      </div>

      {/* Extra Content / Slot */}
      {children && <div className="relative z-10 mt-4">{children}</div>}

      {/* Action Buttons */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-2.5">
        
        {/* Search Clear Action */}
        {onClearSearch && (
          <Button
            type="button"
            variant="outline"
            onClick={onClearSearch}
            className="rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-xs sm:text-sm h-9 sm:h-10 gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Search
          </Button>
        )}

        {/* Secondary Action */}
        {secondaryAction && (
          <Button
            type="button"
            variant="outline"
            onClick={secondaryAction.onClick}
            className="rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-xs sm:text-sm h-9 sm:h-10 gap-2"
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </Button>
        )}

        {/* Primary Action Button */}
        {primaryActionLabel && primaryActionHandler && (
          <Button
            type="button"
            onClick={primaryActionHandler}
            className="rounded-xl font-semibold shadow-lg hover:shadow-primary/20 text-xs sm:text-sm h-9 sm:h-10 gap-2 transition-all"
          >
            {primaryActionIcon}
            <span>{primaryActionLabel}</span>
          </Button>
        )}
      </div>

    </div>
  );
}