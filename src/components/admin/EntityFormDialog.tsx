 import React, { useEffect } from "react";
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Sparkles, 
  Save, 
  X 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FormDialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export type FormDialogMode = "create" | "edit" | "default";

interface SecondaryAction {
  label: string;
  onClick: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
}

interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  
  // Design & Modifiers
  icon?: React.ReactNode;
  mode?: FormDialogMode;
  badge?: string;
  size?: FormDialogSize;
  
  // Submit & Loading
  loading?: boolean;
  loadingText?: string;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  cancelLabel?: string;
  
  // Extra Actions & Security
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
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  full: "max-w-[95vw] h-[92vh]",
};

export default function EntityFormDialog({
  open,
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
  preventOutsideClose = true,
  onSubmit,
  children,
  className,
}: EntityFormDialogProps) {
  
  // ডিফল্ট আইকন ও টেক্সট ঠিক করা
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const defaultSubmitLabel = submitLabel || (isCreate ? "Create" : isEdit ? "Save Changes" : "Save");
  const defaultSubmitIcon = submitIcon || (isCreate ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />);

  // কীবোর্ড শর্টকাট: Cmd/Ctrl + Enter দিলে ফর্ম সাবমিট হবে
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !loading) {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onSubmit]);

  const handleOpenChange = (newOpen: boolean) => {
    if (loading) return;
    if (!newOpen && hasUnsavedChanges) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to close?");
      if (!confirmDiscard) return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => {
          if (preventOutsideClose || loading) {
            e.preventDefault();
          }
        }}
        className={cn(
          "relative flex flex-col p-0 overflow-hidden rounded-2xl border border-white/15 bg-card/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]",
          SIZE_CLASSES[size],
          className
        )}
      >
        {/* Top Accent Gradient Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-primary to-emerald-400" />

        {/* Sticky Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10 bg-card/80 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* Header Icon Box */}
              {(icon || isCreate || isEdit) && (
                <div className={cn(
                  "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-inner",
                  isCreate 
                    ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                    : isEdit
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-primary/10 border-primary/30 text-primary"
                )}>
                  {icon || (isCreate ? <Sparkles className="w-5 h-5" /> : <Pencil className="w-5 h-5" />)}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="font-display text-lg sm:text-xl font-bold text-foreground">
                    {title}
                  </DialogTitle>
                  {badge && (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px]">
                      {badge}
                    </Badge>
                  )}
                </div>
                {description && (
                  <DialogDescription className="mt-0.5 text-xs sm:text-sm text-muted-foreground line-clamp-1">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {children}
          </div>

          {/* Sticky Footer */}
          <DialogFooter className="px-6 py-4 border-t border-white/10 bg-card/80 backdrop-blur-md shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            
            {/* Left Slot: Extra Content or Shortcut Hint */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {footerExtra ? (
                footerExtra
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground/70">
                  <kbd className="rounded border border-white/15 bg-white/5 px-1 font-mono text-[10px]">⌘</kbd> + 
                  <kbd className="rounded border border-white/15 bg-white/5 px-1 font-mono text-[10px]">Enter</kbd> to save
                </span>
              )}
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center justify-end gap-2.5">
              {/* Cancel Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                className="rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-xs sm:text-sm h-10"
              >
                {cancelLabel}
              </Button>

              {/* Optional Secondary Action (e.g. Save Draft) */}
              {secondaryAction && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={secondaryAction.onClick}
                  disabled={loading || secondaryAction.loading}
                  className="rounded-xl text-xs sm:text-sm h-10 gap-1.5"
                >
                  {secondaryAction.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {secondaryAction.icon}
                  <span>{secondaryAction.label}</span>
                </Button>
              )}

              {/* Primary Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl font-semibold shadow-lg hover:shadow-primary/20 text-xs sm:text-sm h-10 gap-2 transition-all min-w-[100px]"
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

          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}