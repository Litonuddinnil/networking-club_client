import React from "react";
import { Eye, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EntityField {
  label: string;
  value: React.ReactNode;
  /** Optional icon component to render left of the label. */
  icon?: React.ReactNode;
  /** Mark this as a wide row that spans both columns. */
  fullWidth?: boolean;
  /** Optional raw text used to fall back to "—" when value is null/undefined. */
  raw?: unknown;
}

interface EntityViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Optional accent icon shown in the header (e.g., category icon). */
  accentIcon?: React.ReactNode;
  /** Optional status pill shown next to the title. */
  status?: React.ReactNode;
  /** Hero block at the top of the dialog (image, avatar, etc). */
  hero?: React.ReactNode;
  /** Ordered list of fields to display in a 2-col grid. */
  fields: EntityField[];
  /** Optional extra content rendered below the field grid (e.g., description, links). */
  children?: React.ReactNode;
  /** Optional footer action area (buttons). */
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * EntityViewDialog — generic, read-only detail viewer.
 * Used by every "View" action in the admin area so that admins can
 * inspect the full record (identification, timestamps, etc.) without
 * scrolling through a long table row.
 */
export default function EntityViewDialog({
  open,
  onOpenChange,
  title,
  description,
  accentIcon,
  status,
  hero,
  fields,
  children,
  footer,
  size = "lg",
}: EntityViewDialogProps) {
  const sizeCls = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  const visibleFields = fields.filter(
    (f) => f.raw !== undefined && f.raw !== null && f.raw !== ""
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeCls,
          "max-h-[90vh] overflow-hidden border-white/10 bg-card/95 backdrop-blur-xl p-0"
        )}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/5 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-teal-500/[0.04]">
          <div className="flex items-start gap-3">
            {accentIcon && (
              <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 grid place-items-center text-emerald-400">
                {accentIcon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogHeader className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-display text-lg leading-tight">
                    {title}
                  </DialogTitle>
                  {status}
                </div>
                {description && (
                  <DialogDescription className="text-xs text-muted-foreground">
                    {description}
                  </DialogDescription>
                )}
              </DialogHeader>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-5">
          {hero && (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-background/40">
              {hero}
            </div>
          )}

          {visibleFields.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleFields.map((f, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg border border-white/5 bg-background/30 px-3.5 py-2.5",
                    f.fullWidth && "sm:col-span-2"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {f.icon}
                    <span>{f.label}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground break-words">
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/5 bg-background/30 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper to format a date value to a readable string.
 * Returns "—" for empty/null values.
 */
export function formatDetailDate(value: unknown): string {
  if (!value) return "";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Helper to render a status badge with consistent coloring.
 */
export function StatusBadge({ status }: { status?: string }) {
  const s = (status || "pending").toLowerCase();
  const variants: Record<string, string> = {
    pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    approved: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    rejected: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    active: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    paid: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    unpaid: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    deleted: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-[10px] font-mono uppercase tracking-wider",
        variants[s] || variants.pending
      )}
    >
      {status || "pending"}
    </Badge>
  );
}
