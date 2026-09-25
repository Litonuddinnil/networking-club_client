 import React, { useState } from "react";
import { 
  AlertCircle, 
  Check, 
  Eye, 
  EyeOff, 
  ImageIcon, 
  Trash2, 
  UploadCloud, 
  X 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FieldBaseProps {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  labelExtra?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/* =========================================================================
   1. TextField (with Password Toggle, Clear Button, & Character Count)
   ========================================================================= */
export interface TextFieldProps extends FieldBaseProps, React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showCount?: boolean;
}

export function TextField({
  label,
  required,
  hint,
  error,
  className,
  labelExtra,
  leftIcon,
  rightIcon,
  type = "text",
  value,
  maxLength,
  showCount,
  onClear,
  ...props
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-xs font-semibold text-foreground/90">
            {label}
            {required && <span className="text-rose-400 font-bold">*</span>}
          </Label>
          {labelExtra && <div className="text-xs text-muted-foreground">{labelExtra}</div>}
        </div>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
            {leftIcon}
          </div>
        )}

        <Input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          maxLength={maxLength}
          className={cn(
            "bg-background/50 border-white/10 focus:border-teal-400/60 rounded-xl text-xs sm:text-sm font-medium transition-all",
            leftIcon && "pl-9",
            (rightIcon || isPassword || (onClear && value)) && "pr-9",
            error && "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
          )}
          {...props}
        />

        {/* Password Eye Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* Quick Clear Button */}
        {!isPassword && onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-0.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {!isPassword && !onClear && rightIcon && (
          <div className="absolute right-3 flex items-center pointer-events-none text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Footer: Error, Hint & Character Counter */}
      <div className="flex items-center justify-between text-[11px]">
        {error ? (
          <p className="flex items-center gap-1 text-rose-400 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p className="text-muted-foreground/80">{hint}</p>
        ) : <div />}

        {showCount && maxLength && (
          <span className="font-mono text-muted-foreground/60 text-[10px]">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   2. TextAreaField (with Character Count & Expandability)
   ========================================================================= */
export interface TextAreaFieldProps extends FieldBaseProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCount?: boolean;
}

export function TextAreaField({
  label,
  required,
  hint,
  error,
  className,
  labelExtra,
  value,
  maxLength,
  showCount = true,
  rows = 4,
  ...props
}: TextAreaFieldProps) {
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-xs font-semibold text-foreground/90">
            {label}
            {required && <span className="text-rose-400 font-bold">*</span>}
          </Label>
          {labelExtra && <div className="text-xs text-muted-foreground">{labelExtra}</div>}
        </div>
      )}

      <Textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          "bg-background/50 border-white/10 focus:border-teal-400/60 rounded-xl text-xs sm:text-sm font-medium transition-all leading-relaxed",
          error && "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
        )}
        {...props}
      />

      <div className="flex items-center justify-between text-[11px]">
        {error ? (
          <p className="flex items-center gap-1 text-rose-400 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p className="text-muted-foreground/80">{hint}</p>
        ) : <div />}

        {showCount && maxLength && (
          <span className="font-mono text-muted-foreground/60 text-[10px]">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   3. SelectField (with Option Icons & Error State)
   ========================================================================= */
interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectFieldProps extends FieldBaseProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  required,
  hint,
  error,
  className,
  labelExtra,
  leftIcon,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-xs font-semibold text-foreground/90">
            {label}
            {required && <span className="text-rose-400 font-bold">*</span>}
          </Label>
          {labelExtra && <div className="text-xs text-muted-foreground">{labelExtra}</div>}
        </div>
      )}

      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "bg-background/50 border-white/10 focus:border-teal-400/60 rounded-xl text-xs sm:text-sm font-medium transition-all h-10",
            error && "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {leftIcon && <span className="text-muted-foreground">{leftIcon}</span>}
            <SelectValue placeholder={placeholder || "Choose option..."} />
          </div>
        </SelectTrigger>

        <SelectContent className="rounded-xl border border-white/15 bg-card/95 backdrop-blur-xl shadow-xl">
          {options.map((opt) => (
            <SelectItem 
              key={opt.value} 
              value={opt.value} 
              disabled={opt.disabled}
              className="text-xs sm:text-sm rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {opt.icon && <span>{opt.icon}</span>}
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error ? (
        <p className="flex items-center gap-1 text-rose-400 font-medium text-[11px]">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-muted-foreground/80 text-[11px]">{hint}</p>
      ) : null}
    </div>
  );
}

/* =========================================================================
   4. ImageUploadField (Live Preview Thumbnail + URL / Upload Support)
   ========================================================================= */
export interface ImageUploadFieldProps extends FieldBaseProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  onFileSelect?: (file: File) => void;
}

export function ImageUploadField({
  label = "Cover / Image URL",
  required,
  hint = "Paste image URL or enter link",
  error,
  className,
  value,
  onChange,
  placeholder = "https://example.com/image.jpg",
}: ImageUploadFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-1 text-xs font-semibold text-foreground/90">
        {label}
        {required && <span className="text-rose-400 font-bold">*</span>}
      </Label>

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Preview Box */}
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-muted/40 grid place-items-center">
          {value ? (
            <>
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-500 text-white transition-colors"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground/50">
              <ImageIcon className="w-6 h-6" />
              <span className="text-[9px] mt-1 font-mono">No Preview</span>
            </div>
          )}
        </div>

        {/* URL Input */}
        <div className="flex-1 w-full space-y-1.5">
          <Input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "bg-background/50 border-white/10 focus:border-teal-400/60 rounded-xl text-xs font-mono transition-all",
              error && "border-rose-500/60"
            )}
          />
          {error ? (
            <p className="flex items-center gap-1 text-rose-400 font-medium text-[11px]">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{error}</span>
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   5. TagsInputField (Chip Tag Generator)
   ========================================================================= */
export interface TagsInputFieldProps extends FieldBaseProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagsInputField({
  label = "Tags",
  required,
  hint = "Type a tag and press Enter or comma",
  error,
  className,
  tags = [],
  onChange,
  placeholder = "Add tags (e.g. workshop, design)...",
}: TagsInputFieldProps) {
  const [inputVal, setInputVal] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
      e.preventDefault();
      const newTag = inputVal.trim().replace(/^#/, "");
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputVal("");
    } else if (e.key === "Backspace" && !inputVal && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1 text-xs font-semibold text-foreground/90">
        {label}
        {required && <span className="text-rose-400 font-bold">*</span>}
      </Label>

      <div className={cn(
        "flex flex-wrap items-center gap-1.5 min-h-10 rounded-xl border border-white/10 bg-background/50 p-2 transition-all focus-within:border-teal-400/60",
        error && "border-rose-500/60"
      )}>
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-xs text-teal-300 font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="p-0.5 rounded hover:bg-teal-500/20 text-teal-400"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none min-w-30"
        />
      </div>

      {error ? (
        <p className="flex items-center gap-1 text-rose-400 font-medium text-[11px]">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-muted-foreground/80 text-[11px]">{hint}</p>
      ) : null}
    </div>
  );
}

/* =========================================================================
   6. SwitchField (Modern Boolean Toggle)
   ========================================================================= */
export interface SwitchFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function SwitchField({
  label,
  description,
  checked,
  onChange,
  className,
  disabled,
}: SwitchFieldProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "flex items-center justify-between rounded-xl border border-white/10 bg-white/2 hover:bg-white/4 p-3.5 transition-colors cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="space-y-0.5 pr-4">
        <p className="text-xs sm:text-sm font-semibold text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      {/* Pill Toggle */}
      <div
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors duration-300 shrink-0",
          checked ? "bg-teal-500" : "bg-white/15"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 shadow-md",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
    </div>
  );
}