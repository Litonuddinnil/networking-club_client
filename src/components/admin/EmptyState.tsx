import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  /** Convenience API — pass `{ label, onClick }` instead of `ctaLabel`+`onCta`. */
  cta?: { label: string; onClick: () => void };
}

/**
 * EmptyState — used when a CRUD section has no records yet.
 */
export default function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
  cta,
}: EmptyStateProps) {
  return (
    <div className="empty-state flex flex-col items-center justify-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 grid place-items-center text-emerald-400">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-display font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
        )}
      </div>
      {ctaLabel && onCta && (
        <Button onClick={onCta} variant="default" className="mt-2 gap-2">
          <Plus className="w-4 h-4" />
          {ctaLabel}
        </Button>
      )}
      {!ctaLabel && cta && (
        <Button onClick={cta.onClick} variant="default" className="mt-2 gap-2">
          <Plus className="w-4 h-4" />
          {cta.label}
        </Button>
      )}
    </div>
  );
}