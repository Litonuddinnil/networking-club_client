import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * SectionHeading — styled title + description row used inside admin tabs.
 */
export default function SectionHeading({
  title,
  description,
  icon,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("section-heading", className)}>
      <h2>
        {icon && (
          <span className="text-emerald-400 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            {icon}
          </span>
        )}
        <span>{title}</span>
      </h2>
      {description && <p>{description}</p>}
    </div>
  );
}