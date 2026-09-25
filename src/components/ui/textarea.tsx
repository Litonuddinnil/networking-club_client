import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Textarea — multi-line input for descriptions, post bodies and
 * feedback. Auto-grows are left to consumers via rowCount/minRows.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[88px] w-full rounded-lg border border-input bg-white/5 px-3 py-2.5",
          "text-sm font-sans text-foreground placeholder:text-muted-foreground/70",
          "transition-colors duration-150 resize-y",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
