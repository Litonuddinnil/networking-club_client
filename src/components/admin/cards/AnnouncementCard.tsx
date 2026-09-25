import React from "react";
import {
  AlertTriangle,
  Eye,
  Info,
  Megaphone,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnnouncementCardProps {
  announcement: any;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatDate(input?: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stripHtml(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

type Priority = "low" | "normal" | "high" | "critical";

function normalizePriority(input?: string): Priority {
  const v = (input || "normal").toLowerCase();
  if (v === "critical" || v === "urgent") return "critical";
  if (v === "high") return "high";
  if (v === "low") return "low";
  return "normal";
}

const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string;
    badgeVariant: React.ComponentProps<typeof Badge>["variant"];
    glow: string;
    borderAccent: string;
    icon: React.ReactNode;
    eyebrow: string;
  }
> = {
  low: {
    label: "Low",
    badgeVariant: "muted",
    glow: "from-white/0 via-white/[0.04] to-white/0",
    borderAccent: "border-white/10",
    icon: <Info className="w-3.5 h-3.5" />,
    eyebrow: "Update",
  },
  normal: {
    label: "Normal",
    badgeVariant: "info",
    glow: "from-sky-500/10 via-sky-500/[0.02] to-sky-500/0",
    borderAccent: "border-sky-500/30",
    icon: <Megaphone className="w-3.5 h-3.5" />,
    eyebrow: "Announcement",
  },
  high: {
    label: "High",
    badgeVariant: "warning",
    glow: "from-amber-500/12 via-amber-500/[0.03] to-amber-500/0",
    borderAccent: "border-amber-500/35",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    eyebrow: "Important",
  },
  critical: {
    label: "Critical",
    badgeVariant: "destructive",
    glow: "from-rose-500/15 via-rose-500/[0.04] to-rose-500/0",
    borderAccent: "border-rose-500/45",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    eyebrow: "Critical Alert",
  },
};

export default function AnnouncementCard({
  announcement,
  onView,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const priority = normalizePriority(announcement.priority);
  const cfg = PRIORITY_CONFIG[priority];
  const isPinned = !!announcement.pinned;
  const content =
    typeof announcement.content === "string"
      ? stripHtml(announcement.content)
      : "";

  return (
    <article
      className={cn(
        "glass-card entity-card relative overflow-hidden group",
        priority === "critical" && "ring-1 ring-rose-500/20"
      )}
    >
      {/* Ambient glow strip — left accent */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b",
          priority === "critical" && "from-rose-400 via-rose-500 to-rose-400",
          priority === "high" && "from-amber-300 via-amber-500 to-amber-300",
          priority === "normal" && "from-sky-300 via-sky-500 to-sky-300",
          priority === "low" && "from-zinc-500 via-zinc-400 to-zinc-500"
        )}
      />

      {/* Glow overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70",
          cfg.glow
        )}
      />

      <div className="relative z-10 flex flex-col flex-1 gap-3 p-4 sm:p-5">
        {/* Header */}
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
            <span className={cn("shrink-0", priority === "critical" && "text-rose-400",
              priority === "high" && "text-amber-400",
              priority === "normal" && "text-sky-400",
              priority === "low" && "text-zinc-400"
            )}>
              {cfg.icon}
            </span>
            <span>{cfg.eyebrow}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {isPinned && (
              <Badge variant="accent" size="sm" className="gap-1">
                <Pin className="w-2.5 h-2.5" />
                Pinned
              </Badge>
            )}
            <Badge variant={cfg.badgeVariant} size="sm">
              {cfg.label}
            </Badge>
          </div>
        </header>

        {/* Title */}
        <h3
          className={cn(
            "font-display text-base sm:text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-emerald-300 transition-colors"
          )}
        >
          {announcement.title || "Untitled Announcement"}
        </h3>

        {/* Body preview */}
        {content && (
          <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-3">
            {content}
          </p>
        )}

        {/* Footer meta */}
        <div className="mt-auto pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
          <span className="truncate max-w-[60%]">
            {announcement.createdBy?.name || announcement.author || "Admin"}
          </span>
          <time className="shrink-0">{formatDate(announcement.createdAt || announcement.publishedAt)}</time>
        </div>

        {/* Hover actions */}
        <div className="md:!translate-y-full md:group-hover:!translate-y-0 md:pointer-events-none md:group-hover:pointer-events-auto hover-actions !translate-y-0 !p-2 !backdrop-blur-0">
          <div className="flex w-full items-center justify-end gap-1.5 pt-2 border-t border-white/5 md:border-0 md:pt-0">
            {onView && (
              <button
                type="button"
                onClick={onView}
                className="icon-action text-sky-300"
                title="View announcement"
                aria-label="View announcement"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="icon-action text-amber-300"
                title="Edit announcement"
                aria-label="Edit announcement"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {isPinned ? (
              <button
                type="button"
                disabled
                className="icon-action text-zinc-500 cursor-not-allowed"
                title="Pinned"
              >
                <PinOff className="w-4 h-4" />
              </button>
            ) : null}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="icon-action is-danger"
                title="Delete announcement"
                aria-label="Delete announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
