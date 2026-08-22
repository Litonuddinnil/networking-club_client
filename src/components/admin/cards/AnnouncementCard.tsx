import React from "react";
import { Calendar, Megaphone, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnnouncementCardProps {
  announcement: {
    _id?: string;
    id?: string;
    title: string;
    content?: string;
    description?: string;
    category?: string;
    date?: string;
  };
  onDelete?: () => void;
}

const CATEGORY_VARIANTS: Record<string, "warning" | "destructive" | "secondary" | "accent"> = {
  Notice: "warning",
  Urgent: "destructive",
  General: "secondary",
  Event: "accent",
};

export default function AnnouncementCard({
  announcement,
  onDelete,
}: AnnouncementCardProps) {
  const preview = (announcement.content || announcement.description || "").slice(0, 220);

  return (
    <div className="glass-card entity-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 grid place-items-center text-amber-400 shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <Badge
            variant={
              CATEGORY_VARIANTS[announcement.category || "Notice"] || "warning"
            }
          >
            {announcement.category || "Notice"}
          </Badge>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="icon-action is-danger"
            aria-label="Delete announcement"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <h3 className="mt-4 font-display font-bold text-lg text-foreground leading-snug line-clamp-2">
        {announcement.title}
      </h3>

      {preview && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
          {preview}
        </p>
      )}

      <div className="meta-strip mt-4 pt-3 border-t border-white/5">
        <span>
          <Calendar className="w-3 h-3 text-emerald-400" />
          {announcement.date || "Just now"}
        </span>
      </div>
    </div>
  );
}