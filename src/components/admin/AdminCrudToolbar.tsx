import React, { useEffect, useRef } from "react";
import {
  ArrowDownAZ,
  ArrowUpZA,
  Download,
  Filter,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "list";

export interface FilterOption {
  label: string;
  value: string;
}

export interface SortOption {
  label: string;
  value: string;
}

interface AdminCrudToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // View Mode
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewMode?: boolean;

  // Count
  totalCount: number;
  totalLabel?: string;

  // Primary Action (e.g. Create)
  primaryLabel?: string;
  primaryIcon?: React.ReactNode;
  onPrimary?: () => void;

  // Filter Feature
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];

  // Sort Feature
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: SortOption[];
  sortOrder?: "asc" | "desc";
  onSortOrderToggle?: () => void;

  // Bulk Actions
  selectedCount?: number;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;

  // Extra Utilities
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onExport?: () => void;

  className?: string;
}

export default function AdminCrudToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search records... (Press '/' to focus)",
  viewMode = "grid",
  onViewModeChange,
  showViewMode = true,
  totalCount,
  totalLabel = "records",
  primaryLabel,
  primaryIcon,
  onPrimary,
  filterValue,
  onFilterChange,
  filterOptions,
  sortValue,
  onSortChange,
  sortOptions,
  sortOrder = "desc",
  onSortOrderToggle,
  selectedCount = 0,
  onBulkDelete,
  onClearSelection,
  onRefresh,
  isRefreshing = false,
  onExport,
  className,
}: AdminCrudToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' or 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && 
          document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      
      {/* If items are selected -> Show Bulk Action Bar */}
      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 rounded-xl border border-teal-500/30 bg-linear-to-r from-teal-500/15 via-emerald-500/10 to-card backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-black">
              {selectedCount}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                className="gap-1.5 text-xs h-8 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </Button>
            )}

            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 transition-colors"
              >
                Deselect all
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Main Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card/60 p-3 sm:p-4 backdrop-blur-xl shadow-lg">
        
        {/* Left Side: Search + Filter + Sort */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[280px]">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400/80" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-background/50 border border-white/10 focus:border-teal-400/60 rounded-xl pl-9 pr-14 py-2 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:ring-2 focus:ring-teal-400/20"
            />
            
            {/* Clear Button / Keyboard Indicator */}
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-muted-foreground">
                /
              </kbd>
            )}
          </div>

          {/* Optional Filter Dropdown */}
          {filterOptions && onFilterChange && (
            <div className="relative flex items-center">
              <select
                value={filterValue || ""}
                onChange={(e) => onFilterChange(e.target.value)}
                className="appearance-none bg-background/50 border border-white/10 hover:border-white/20 focus:border-teal-400/50 rounded-xl pl-8 pr-8 py-2 text-xs font-medium text-foreground outline-none transition cursor-pointer"
              >
                <option value="">All Categories</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          )}

          {/* Optional Sort Dropdown + Direction Toggle */}
          {sortOptions && onSortChange && (
            <div className="flex items-center gap-1">
              <div className="relative flex items-center">
                <select
                  value={sortValue || ""}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="appearance-none bg-background/50 border border-white/10 hover:border-white/20 focus:border-teal-400/50 rounded-xl pl-8 pr-8 py-2 text-xs font-medium text-foreground outline-none transition cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Sort: {opt.label}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {onSortOrderToggle && (
                <button
                  type="button"
                  onClick={onSortOrderToggle}
                  className="p-2 rounded-xl bg-background/50 border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground transition"
                  title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
                >
                  {sortOrder === "asc" ? (
                    <ArrowDownAZ className="w-4 h-4 text-teal-400" />
                  ) : (
                    <ArrowUpZA className="w-4 h-4 text-teal-400" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Count + Utilities + View Toggle + CTA */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Total Count Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/50 border border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">{totalCount}</span>
            <span className="text-muted-foreground">{totalLabel}</span>
          </div>

          {/* Quick Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-xl bg-background/50 border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
              title="Refresh records"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-teal-400")} />
            </button>
          )}

          {/* Export Action */}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="p-2 rounded-xl bg-background/50 border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
              title="Export data (CSV/Excel)"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Grid / List View Toggle */}
          {onViewModeChange && showViewMode !== false && (
            <div className="flex items-center bg-background/50 border border-white/10 rounded-xl p-1 gap-0.5">
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-teal-500/20 text-teal-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === "list"
                    ? "bg-teal-500/20 text-teal-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Primary Create / Add Button */}
          {onPrimary && primaryLabel && (
            <Button
              onClick={onPrimary}
              className="gap-1.5 rounded-xl shadow-lg hover:shadow-teal-500/20 transition-all font-semibold"
            >
              {primaryIcon ?? <Plus className="w-4 h-4" />}
              <span>{primaryLabel}</span>
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}