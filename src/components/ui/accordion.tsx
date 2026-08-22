 import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Accordion — Radix-based FAQ & Collapsible component.
 * Enhanced with cyber-glassmorphism, active border glow, icons, badges, and indicator variants.
 */
const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "group mb-3 overflow-hidden rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl shadow-md transition-all duration-300",
      "data-[state=open]:border-primary/40 data-[state=open]:bg-card/85 data-[state=open]:shadow-xl data-[state=open]:shadow-primary/5",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  indicatorType?: "chevron" | "plus" | "arrow";
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, icon, subtitle, badge, indicatorType = "chevron", ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between p-5 text-left font-display text-base font-semibold text-foreground transition-all",
        "hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "data-[state=open]:text-primary",
        className
      )}
      {...props}
    >
      {/* Left: Icon + Title + Subtitle */}
      <div className="flex items-center gap-3.5 min-w-0 pr-4">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-primary shadow-inner transition-transform duration-300 group-hover:scale-105 group-data-[state=open]:border-primary/30 group-data-[state=open]:bg-primary/10">
            {icon}
          </div>
        )}

        <div className="space-y-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="leading-snug">{children}</span>
            {badge && <span>{badge}</span>}
          </div>

          {subtitle && (
            <p className="text-xs font-normal text-muted-foreground/80 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Dynamic Animated Indicator */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-data-[state=open]:border-primary/40 group-data-[state=open]:bg-primary/10 group-data-[state=open]:text-primary">
        {indicatorType === "plus" ? (
          <Plus className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-45" />
        ) : indicatorType === "arrow" ? (
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-90" />
        ) : (
          <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
        )}
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm text-muted-foreground/90 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("px-5 pb-5 pt-2 border-t border-white/5 leading-relaxed", className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };