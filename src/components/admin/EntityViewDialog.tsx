 import React, { useState } from "react";
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Pencil,
  Printer,
  Share2,
  Trash2,
  X
} from "lucide-react";
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
  icon?: React.ReactNode;
  fullWidth?: boolean;
  raw?: unknown;
  copyable?: boolean;
  copyText?: string; // নির্দিষ্ট কোনো টেক্সট কপি করার জন্য
  isCode?: boolean;
  isLink?: boolean;
  href?: string;
  section?: string;
}

interface EntityViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  accentIcon?: React.ReactNode;
  status?: React.ReactNode;
  hero?: React.ReactNode;
  fields: EntityField[];
  rawJson?: Record<string, unknown> | object; // সম্পূর্ণ JSON ডাটা দেখার জন্য
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  
  // কুইক অ্যাকশন বাটনসমূহ
  onEdit?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
};

export default function EntityViewDialog({
  open,
  onOpenChange,
  title,
  description,
  accentIcon,
  status,
  hero,
  fields,
  rawJson,
  children,
  footer,
  size = "lg",
  onEdit,
  onDelete,
  onPrint,
  onShare,
}: EntityViewDialogProps) {
  const [activeTab, setActiveTab] = useState<"details" | "json">("details");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [jsonCopied, setJsonCopied] = useState(false);

  const visibleFields = fields.filter(
    (f) => f.raw !== undefined ? (f.raw !== null && f.raw !== "") : (f.value !== undefined && f.value !== null && f.value !== "")
  );

  const handleCopyField = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyJson = () => {
    if (!rawJson) return;
    navigator.clipboard.writeText(JSON.stringify(rawJson, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl max-h-[90dvh]",
          SIZE_CLASSES[size] || SIZE_CLASSES.lg
        )}
      >
        {/* Top Gradient Stripe */}
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-sky-400 via-teal-400 to-emerald-400" />

        {/* Sticky Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10 bg-card/80 backdrop-blur-md shrink-0">
          <div className="flex items-start justify-between gap-4">
            
            <div className="flex items-start gap-3.5 min-w-0">
              {accentIcon && (
                <div className="w-11 h-11 shrink-0 rounded-xl bg-teal-500/10 border border-teal-500/30 grid place-items-center text-teal-400 shadow-inner">
                  {accentIcon}
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-display text-lg sm:text-xl font-bold text-foreground leading-tight truncate">
                    {title}
                  </DialogTitle>
                  {status}
                </div>
                {description && (
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {rawJson && (
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 mr-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className={cn(
                      "px-2 py-1 text-xs font-medium rounded-md transition-all",
                      activeTab === "details"
                        ? "bg-teal-500/20 text-teal-400"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("json")}
                    className={cn(
                      "px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                      activeTab === "json"
                        ? "bg-teal-500/20 text-teal-400"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Code2 className="w-3 h-3" />
                    <span>JSON</span>
                  </button>
                </div>
              )}

              {onShare && (
                <button
                  type="button"
                  onClick={onShare}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                  title="Share record"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                title="Print record"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          
          {/* JSON Inspector View */}
          {activeTab === "json" && rawJson ? (
            <div className="relative rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-teal-300 overflow-x-auto">
              <button
                type="button"
                onClick={handleCopyJson}
                className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white text-[11px] font-sans transition"
              >
                {jsonCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{jsonCopied ? "Copied" : "Copy JSON"}</span>
              </button>
              <pre className="pr-16">{JSON.stringify(rawJson, null, 2)}</pre>
            </div>
          ) : (
            <>
              {/* Hero Block */}
              {hero && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-background/40 shadow-inner">
                  {hero}
                </div>
              )}

              {/* 2-Column Fields Grid */}
              {visibleFields.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleFields.map((f, i) => {
                    const stringVal = f.copyText || (typeof f.value === "string" ? f.value : String(f.raw || ""));
                    const isCopied = copiedIndex === i;

                    return (
                      <div
                        key={i}
                        className={cn(
                          "group relative rounded-xl border border-white/10 bg-white/2 hover:bg-white/4 p-3.5 transition-colors",
                          f.fullWidth && "sm:col-span-2"
                        )}
                      >
                        {/* Field Label */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                            {f.icon}
                            <span>{f.label}</span>
                          </div>

                          {/* Quick Copy Action */}
                          {(f.copyable || stringVal) && (
                            <button
                              type="button"
                              onClick={() => handleCopyField(stringVal, i)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                              title="Copy value"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Field Value Display */}
                        <div className="mt-1.5 text-xs sm:text-sm font-medium text-foreground wrap-break-word">
                          {f.isLink && f.href ? (
                            <a
                              href={f.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <span>{f.value}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : f.isCode ? (
                            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-teal-300 border border-white/5">
                              {f.value}
                            </code>
                          ) : (
                            f.value
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Extra Children Area */}
              {children}
            </>
          )}

        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-card/80 backdrop-blur-md shrink-0 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Controls: Edit / Delete */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="gap-1.5 rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs h-9"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Record</span>
              </Button>
            )}

            {onDelete && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="gap-1.5 rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs h-9"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            )}
          </div>

          {/* Right Custom Footer or Close Button */}
          <div className="flex items-center gap-2 ml-auto">
            {footer ? (
              footer
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs h-9"
              >
                Close
              </Button>
            )}
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper to format a date value to a readable string.
 */
export function formatDetailDate(value: unknown): string {
  if (!value) return "—";
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
 * Helper to render a status badge with modern styling.
 */
export function StatusBadge({ status }: { status?: string }) {
  const s = (status || "pending").toLowerCase();
  
  const variants: Record<string, string> = {
    active: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    approved: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    verified: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    paid: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    published: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    completed: "bg-teal-500/15 border-teal-500/30 text-teal-400",
    ongoing: "bg-sky-500/15 border-sky-500/30 text-sky-400 animate-pulse",
    pending: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    draft: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    unpaid: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    rejected: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    cancelled: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    banned: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    deleted: "bg-rose-500/15 border-rose-500/30 text-rose-400",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "border px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider backdrop-blur-md",
        variants[s] || variants.pending
      )}
    >
      {status || "pending"}
    </Badge>
  );
}