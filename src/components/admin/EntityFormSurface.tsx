import React, { useEffect } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Save, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Full-page shell for the entity create/edit forms.
 *
 * Deliberately exposes the SAME props as EntityFormDialog so the four
 * form components in EntityFormModals can render into either surface
 * with no change to their bodies — pick the shell, pass the children.
 *
 * `open` / `preventOutsideClose` are accepted and ignored: a page has
 * no open state and nothing to dismiss. Cancel calls `onOpenChange(false)`,
 * which the routed page turns into a navigation back to the list.
 */

export type FormDialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export type FormDialogMode = "create" | "edit" | "default";

interface SecondaryAction {
  label: string;
  onClick: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
}

interface EntityFormSurfaceProps {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  mode?: FormDialogMode;
  badge?: string;
  size?: FormDialogSize;
  loading?: boolean;
  loadingText?: string;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  cancelLabel?: string;
  secondaryAction?: SecondaryAction;
  footerExtra?: React.ReactNode;
  hasUnsavedChanges?: boolean;
  preventOutsideClose?: boolean;
  onSubmit: () => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}

const SIZE_CLASSES: Record<FormDialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  full: "max-w-none",
};

export default function EntityFormSurface({
  onOpenChange,
  title,
  description,
  icon,
  mode = "default",
  badge,
  size = "md",
  loading = false,
  loadingText = "Saving changes...",
  submitLabel,
  submitIcon,
  cancelLabel = "Cancel",
  secondaryAction,
  footerExtra,
  hasUnsavedChanges = false,
  onSubmit,
  children,
  className,
}: EntityFormSurfaceProps) {
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const defaultSubmitLabel =
    submitLabel || (isCreate ? "Create" : isEdit ? "Save Changes" : "Save");
  const defaultSubmitIcon =
    submitIcon ||
    (isCreate ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />);

  // Cmd/Ctrl + Enter submits, matching the dialog behaviour it replaced.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !loading) {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, onSubmit]);

  // Warn on a browser-level navigation away from a dirty form.
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

  const requestClose = () => {
    if (loading) return;
    if (hasUnsavedChanges) {
      const discard = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!discard) return;
    }
    onOpenChange(false);
  };

  return (
    <div className="flex-1 min-h-0 admin-mesh">
      <div className={cn("page-shell", SIZE_CLASSES[size], className)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="page-surface flex flex-col"
        >
          {/* Accent stripe */}
          <div className="h-1 w-full bg-linear-to-r from-teal-400 via-primary to-emerald-400" />

          {/* Header */}
          <div className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 border-b border-border">
            <button
              type="button"
              onClick={requestClose}
              disabled={loading}
              className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <div className="flex items-start gap-3 sm:gap-3.5">
              {(icon || isCreate || isEdit) && (
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl border grid place-items-center shrink-0 shadow-inner",
                    isCreate
                      ? "bg-teal-500/10 border-teal-500/30 text-teal-500"
                      : isEdit
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      : "bg-primary/10 border-primary/30 text-primary"
                  )}
                >
                  {icon ||
                    (isCreate ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <Pencil className="w-5 h-5" />
                    ))}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                    {title}
                  </h1>
                  {badge && (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary text-[10px]"
                    >
                      {badge}
                    </Badge>
                  )}
                </div>
                {description && (
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-5 sm:px-6 space-y-4">{children}</div>

          {/* Footer — sticks to the bottom of the viewport on small screens
              so the primary action is always reachable without scrolling. */}
          <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border bg-card/85 px-4 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {footerExtra || (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground/70">
                  <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
                    ⌘
                  </kbd>
                  +
                  <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
                    Enter
                  </kbd>
                  to save
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={requestClose}
                disabled={loading}
                className="rounded-xl h-10 text-xs sm:text-sm"
              >
                {cancelLabel}
              </Button>

              {secondaryAction && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={secondaryAction.onClick}
                  disabled={loading || secondaryAction.loading}
                  className="rounded-xl h-10 gap-1.5 text-xs sm:text-sm"
                >
                  {secondaryAction.loading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {secondaryAction.icon}
                  <span>{secondaryAction.label}</span>
                </Button>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl h-10 min-w-[7.5rem] gap-2 font-semibold shadow-lg transition-all hover:shadow-primary/20 text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingText}</span>
                  </>
                ) : (
                  <>
                    {defaultSubmitIcon}
                    <span>{defaultSubmitLabel}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
