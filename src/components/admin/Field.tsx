import React from "react";
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

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
}

export function TextField({
  label,
  required,
  hint,
  className,
  ...props
}: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </Label>
      <Input {...props} />
      {hint && (
        <p className="text-[10px] font-mono text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function TextAreaField({
  label,
  required,
  hint,
  className,
  ...props
}: FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </Label>
      <Textarea {...props} />
      {hint && (
        <p className="text-[10px] font-mono text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

interface SelectFieldProps extends FieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  required,
  hint,
  className,
  value,
  onValueChange,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Choose..."} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && (
        <p className="text-[10px] font-mono text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}