 import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
  ShieldAlert
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

export type ConfirmVariant = "danger" | "warning" | "primary" | "success" | "info";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;

  // 🛡️ নতুন প্রোডাকশন ফিচারসমূহ
  entityName?: string; // যে আইটেমটি ডিলিট/চেঞ্জ হচ্ছে (যেমন: মেম্বারের নাম বা পোস্ট টাইটেল)
  details?: string[]; // ঝুঁকির বুলেট পয়েন্ট লিস্ট
  requireConfirmationWord?: string; // ব্যবহারকারীকে যা লিখতে হবে (e.g. "DELETE")
  requireCheckbox?: boolean; // চেকবক্স টিক দিয়ে কনফার্ম করার অপশন
  checkboxLabel?: string;
  customIcon?: React.ReactNode;
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  {
    icon: React.ReactNode;
    iconBox: string;
    glow: string;
    btnVariant: "destructive" | "default" | "secondary";
    btnClass: string;
  }
> = {
  danger: {
    icon: <Trash2 className="w-5 h-5 text-rose-400" />,
    iconBox: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    glow: "from-rose-500/15 via-transparent to-transparent",
    btnVariant: "destructive",
    btnClass: "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    iconBox: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    glow: "from-amber-500/15 via-transparent to-transparent",
    btnVariant: "default",
    btnClass: "bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20",
  },
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    iconBox: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    glow: "from-emerald-500/15 via-transparent to-transparent",
    btnVariant: "default",
    btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20",
  },
  info: {
    icon: <Info className="w-5 h-5 text-sky-400" />,
    iconBox: "bg-sky-500/15 border-sky-500/30 text-sky-400",
    glow: "from-sky-500/15 via-transparent to-transparent",
    btnVariant: "default",
    btnClass: "bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/20",
  },
  primary: {
    icon: <ShieldAlert className="w-5 h-5 text-teal-400" />,
    iconBox: "bg-teal-500/15 border-teal-500/30 text-teal-400",
    glow: "from-teal-500/15 via-transparent to-transparent",
    btnVariant: "default",
    btnClass: "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20",
  },
};

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  entityName,
  details,
  requireConfirmationWord,
  requireCheckbox = false,
  checkboxLabel = "I understand the consequences and wish to proceed.",
  customIcon,
}: ConfirmActionDialogProps) {
  const [typedWord, setTypedWord] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  // ডায়ালগ ওপেন বা ক্লোজ হলে স্টেট রিসেট
  useEffect(() => {
    if (!open) {
      setTypedWord("");
      setIsChecked(false);
    }
  }, [open]);

  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.danger;

  // বাটন ডিসেবল হওয়ার শর্তাবলী
  const isWordMatching = requireConfirmationWord
    ? typedWord.trim().toLowerCase() === requireConfirmationWord.trim().toLowerCase()
    : true;

  const isCheckboxSatisfied = requireCheckbox ? isChecked : true;
  const isButtonDisabled = loading || !isWordMatching || !isCheckboxSatisfied;

  const handleConfirm = async () => {
    if (isButtonDisabled) return;
    await onConfirm();
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(val) => {
        if (!loading) onOpenChange(val);
      }}
    >
      <DialogContent className="relative max-w-md overflow-hidden rounded-2xl border border-white/10 bg-card/95 p-6 backdrop-blur-2xl shadow-2xl">
        
        {/* Top Ambient Glow */}
        <div className={`absolute -top-12 left-0 right-0 h-32 bg-gradient-to-b ${config.glow} pointer-events-none`} />

        {/* Dialog Header */}
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl border grid place-items-center shrink-0 shadow-inner ${config.iconBox}`}>
              {customIcon || config.icon}
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold text-foreground leading-snug">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Entity / Target Detail Box */}
        {entityName && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
            <span className="text-muted-foreground">Target item: </span>
            <span className="font-semibold font-mono text-foreground">{entityName}</span>
          </div>
        )}

        {/* Warning Bullet Points */}
        {details && details.length > 0 && (
          <ul className="mt-3 space-y-1.5 rounded-xl border border-white/5 bg-background/50 p-3 text-xs text-muted-foreground">
            {details.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {/* "Type Word to Confirm" Safety Input */}
        {requireConfirmationWord && (
          <div className="mt-4 space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Please type <span className="font-mono font-bold text-foreground">"{requireConfirmationWord}"</span> to confirm:
            </label>
            <input
              type="text"
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              placeholder={`Type "${requireConfirmationWord}"`}
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-background/60 px-3.5 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        )}

        {/* Acknowledgment Checkbox */}
        {requireCheckbox && (
          <div className="mt-4 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="confirm-acknowledge"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-background text-primary focus:ring-primary/30 cursor-pointer"
            />
            <label htmlFor="confirm-acknowledge" className="text-xs text-muted-foreground cursor-pointer select-none leading-normal">
              {checkboxLabel}
            </label>
          </div>
        )}

        {/* Action Footer Buttons */}
        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-foreground text-xs sm:text-sm h-10"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isButtonDisabled}
            className={`rounded-xl gap-2 text-xs sm:text-sm h-10 transition-all ${config.btnClass}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? "Processing..." : confirmLabel}</span>
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}