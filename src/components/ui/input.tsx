import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input — text/email/url/number/file input styled to match the
 * admin form surfaces. Uses --input token for border on dark and
 * light themes, and adds an accessible focus ring.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-white/5 px-3 py-2",
          "text-sm font-sans text-foreground placeholder:text-muted-foreground/70",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-ring",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };