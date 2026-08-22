import React from "react";
import { Calendar, Eye, Megaphone, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnnouncementCardProps {
  announcement: {
    _id?: string;
    id?: string;
    title: string;
    content?: string;
    description?: string;
    category?: string;
    priority?: string;
    date?: string;
    createdAt?: string;
    createdByName?: string;
    author?: string;
  };
  onView?: () => void;
  onEdit?: () => void;
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
  onView,
  onEdit,
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
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={CATEGORY_VARIANTS[announcement.category || "Notice"] || "warning"}>
              {announcement.category || "Notice"}
            </Badge>
            {announcement.priority && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                {announcement.priority}
              </Badge>
            )}
          </div>
        </div>
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
          {announcement.date ||
            (announcement.createdAt
              ? new Date(announcement.createdAt).toLocaleDateString()
              : "Just now")}
        </span>
        {announcement.createdByName || announcement.author ? (
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
            by {announcement.createdByName || announcement.author}
          </span>
        ) : null}
      </div>

      <div className="hover-actions justify-end pt-4 mt-4 border-t border-white/5">
        {onView && (
          <button type="button" onClick={onView} className="icon-action text-sky-400 hover:bg-sky-500/15" title="View details" aria-label="View details">
            <Eye className="w-4 h-4" />
          </button>
        )}
        {onEdit && (
          <button type="button" onClick={onEdit} className="icon-action text-amber-400 hover:bg-amber-500/15" title="Edit announcement" aria-label="Edit announcement">
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="icon-action is-danger" title="Delete announcement" aria-label="Delete announcement">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
