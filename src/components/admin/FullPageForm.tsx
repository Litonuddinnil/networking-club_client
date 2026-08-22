import React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FullPageFormProps {
  /** Small uppercase eyebrow shown above the title (e.g. "Posts · New") */
  eyebrow?: React.ReactNode;
  /** Main page title */
  title: string;
  /** Description line below the title */
  description?: string;
  /** Optional right-aligned badge/count in the header */
  headerBadge?: React.ReactNode;
  /** Optional icon rendered inside the title row */
  icon?: React.ReactNode;
  /** Body content (the actual form fields) */
  children: React.ReactNode;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Whether the form is currently submitting */
  loading?: boolean;
  /** Disable submit (e.g. validation failure) */
  disableSubmit?: boolean;
  /** Submit handler */
  onSubmit: (e?: React.FormEvent) => Promise<void> | void;
  /** Override back navigation — defaults to navigate(-1) */
  onCancel?: () => void;
  /** Optional className for the outer container */
  className?: string;
  /** Optional extra footer content (e.g. secondary action) */
  footerExtra?: React.ReactNode;
  /** Whether to wrap children in a form element (default true) */
  asForm?: boolean;
}

/**
 * Shared shell for admin full-page forms.
 * Used by PostFormPage, EventFormPage, AnnouncementFormPage, GalleryFormPage.
 *
 * Layout:
 *   ┌──────────────────────────────────────────┐
 *   │ ← Back   EYEBROW                         │
 *   │          Title                           │
 *   │          Description                [⌃]  │
 *   ├──────────────────────────────────────────┤
 *   │                                          │
 *   │   {children — form fields}               │
 *   │                                          │
 *   │   ...more space...                       │
 *   │                                          │
 *   ├──────────────────────────────────────────┤
 *   │ [Cancel]              [Submit] [Extra]   │
 *   └──────────────────────────────────────────┘
 */
export default function FullPageForm({
  eyebrow,
  title,
  description,
  headerBadge,
  icon,
  children,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  disableSubmit = false,
  onSubmit,
  onCancel,
  className,
  footerExtra,
  asForm = true,
}: FullPageFormProps) {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault();
    if (loading || disableSubmit) return;
    await onSubmit(e);
  };

  const Body = (
    <div className="space-y-6">{children}</div>
  );

  return (
    <div
      className={cn(
        "relative flex min-h-[calc(100vh-4rem)] flex-col",
        "bg-linear-to-b from-transparent via-transparent to-black/10",
        className
      )}
    >
      {/* Sticky top header */}
      <header
        className={cn(
          "sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8",
          "border-b border-white/10 bg-[#03070E]/85 backdrop-blur-xl",
          "shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]"
        )}
      >
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:py-5">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Back button */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className={cn(
                "shrink-0 grid place-items-center w-9 h-9 rounded-xl",
                "border border-white/10 bg-white/5 hover:bg-white/10",
                "text-slate-300 hover:text-white transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Icon (optional) */}
            {icon && (
              <div
                className={cn(
                  "shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl",
                  "bg-teal-500/10 border border-teal-500/30 text-teal-400",
                  "grid place-items-center shadow-inner"
                )}
              >
                {icon}
              </div>
            )}

            {/* Title block */}
            <div className="min-w-0 flex-1 space-y-1">
              {eyebrow && (
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-400/90 truncate">
                  {eyebrow}
                </p>
              )}
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight truncate">
                {title}
              </h1>
              {description && (
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
                  {description}
                </p>
              )}
            </div>
          </div>

          {headerBadge && (
            <div className="shrink-0 self-start sm:self-center">{headerBadge}</div>
          )}
        </div>
      </header>

      {/* Scrollable form body */}
      <main
        className={cn(
          "flex-1 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8",
          "py-6 sm:py-8",
          "overflow-y-auto"
        )}
      >
        <div className="mx-auto w-full max-w-3xl">
          {asForm ? (
            <form onSubmit={handleSubmit} noValidate>
              {Body}
            </form>
          ) : (
            Body
          )}
        </div>
      </main>

      {/* Sticky bottom footer */}
      <footer
        className={cn(
          "sticky bottom-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8",
          "border-t border-white/10 bg-[#03070E]/95 backdrop-blur-xl",
          "shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.6)]"
        )}
      >
        <div className="flex flex-col-reverse gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-4">
          {/* Cancel / back */}
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-xs sm:text-sm h-10 gap-2 w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>

          {/* Right cluster: footerExtra + Submit */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
            {footerExtra}
            <Button
              type="submit"
              onClick={asForm ? undefined : () => onSubmit()}
              disabled={loading || disableSubmit}
              className={cn(
                "rounded-xl font-semibold shadow-lg gap-2",
                "bg-linear-to-r from-emerald-500 via-emerald-500 to-teal-500",
                "hover:from-emerald-400 hover:via-emerald-400 hover:to-teal-400",
                "hover:shadow-emerald-500/30 text-black",
                "text-xs sm:text-sm h-10 w-full sm:w-auto",
                "transition-all"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
