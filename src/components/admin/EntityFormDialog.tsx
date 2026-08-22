import React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * EntityFormDialog — generic dialog wrapper for create/edit forms.
 * Provides a title, description, scrollable body, and footer with
 * a submit (loading-aware) and cancel button.
 */
export default function EntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  loading,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
  children,
  className,
}: EntityFormDialogProps) {
  const sizeCls = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeCls, "max-h-[90vh] overflow-hidden", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4 max-h-[60vh]">
            {children}
          </div>

          <DialogFooter className="mt-4 gap-2 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" variant="default" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Working...</span>
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}