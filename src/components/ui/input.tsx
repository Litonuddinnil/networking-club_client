import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/10 bg-background/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur-md transition-all duration-200 outline-none focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[100px] w-full rounded-xl border border-white/10 bg-background/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur-md transition-all duration-200 outline-none focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 disabled:cursor-not-allowed disabled:opacity-50 leading-relaxed",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Input, Textarea };