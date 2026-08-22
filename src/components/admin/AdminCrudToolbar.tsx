import React from "react";
import { LayoutGrid, List, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "list";

interface AdminCrudToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewMode?: boolean;
  primaryLabel?: string;
  primaryIcon?: React.ReactNode;
  onPrimary?: () => void;
  searchPlaceholder?: string;
  totalCount: number;
  totalLabel?: string;
  className?: string;
}

/**
 * AdminCrudToolbar — search + view-mode toggle + primary create CTA.
 * Used as the top-of-section row above every entity card grid.
 */
export default function AdminCrudToolbar({
  search,
  onSearchChange,
  viewMode = "grid",
  onViewModeChange,
  showViewMode = true,
  primaryLabel,
  primaryIcon,
  onPrimary,
  searchPlaceholder = "Search records...",
  totalCount,
  totalLabel = "records",
  className,
}: AdminCrudToolbarProps) {
  return (
    <div className={cn("toolbar-pill flex flex-wrap items-center gap-3", className)}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/70" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-background/40 border border-input focus:border-primary/60 rounded-lg pl-9 pr-9 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none transition"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Count chip */}
      <div className="px-3 py-2 rounded-lg bg-background/40 border border-border text-[11px] font-mono uppercase tracking-wider">
        <span className="text-emerald-400 font-bold">{totalCount}</span>
        <span className="text-muted-foreground ml-1.5">{totalLabel}</span>
      </div>

      {/* View toggle */}
      {(onViewModeChange && showViewMode !== false) && (
        <div className="flex items-center bg-background/40 border border-border rounded-lg p-1 gap-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-1.5 rounded-md transition",
              viewMode === "grid"
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-1.5 rounded-md transition",
              viewMode === "list"
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary CTA */}
      {onPrimary && primaryLabel && (
        <Button onClick={onPrimary} variant="default" size="default" className="gap-2">
          {primaryIcon ?? <Plus className="w-4 h-4" />}
          <span>{primaryLabel}</span>
        </Button>
      )}
    </div>
  );
}