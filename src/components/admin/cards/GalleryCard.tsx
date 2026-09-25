import React, { useState } from "react";
import {
  CalendarDays,
  Download,
  Eye,
  ImageIcon,
  Pencil,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GalleryCardProps {
  item: any;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatDate(input?: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TAG_VARIANT: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  workshop: "info",
  seminar: "default",
  contest: "accent",
  meetup: "secondary",
  lab: "warning",
  event: "success",
};

export default function GalleryCard({ item, onView, onEdit, onDelete }: GalleryCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!item.imageUrl && !imgFailed;
  const tags: string[] = Array.isArray(item.tags)
    ? item.tags
    : item.category
    ? [item.category]
    : [];

  return (
    <article className="glass-card entity-card flex flex-col overflow-hidden group">
      {/* Square-ish media well (4:3) */}
      <div
        className={cn(
          "image-well",
          "aspect-[4/3]",
          !hasImage && "image-well-shimmer"
        )}
      >
        {hasImage ? (
          <img
            src={item.imageUrl}
            alt={item.title || "Gallery image"}
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <ImageIcon className="w-8 h-8 text-emerald-400/70" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                No image
              </span>
            </div>
          </div>
        )}

        {/* Badge cluster (top-left) */}
        <div className="badge-cluster">
          {tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant={TAG_VARIANT[tag?.toLowerCase()] || "secondary"}
              size="sm"
              className="shadow-md"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Hover overlay (always visible at the bottom on hover) */}
        <div className="hover-actions">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="truncate font-display text-sm font-bold text-white drop-shadow">
              {item.title || "Untitled"}
            </div>
            <div className="flex items-center gap-1.5">
              {onView && (
                <button
                  type="button"
                  onClick={onView}
                  className="icon-action text-sky-200"
                  title="View"
                  aria-label="View image"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {item.imageUrl && (
                <a
                  href={item.imageUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="icon-action text-teal-200"
                  title="Open in new tab"
                  aria-label="Open image in new tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="icon-action text-amber-200"
                  title="Edit"
                  aria-label="Edit image"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="icon-action is-danger"
                  title="Delete"
                  aria-label="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="font-display text-sm sm:text-base font-bold leading-snug text-foreground line-clamp-1 group-hover:text-emerald-300 transition-colors">
          {item.title || "Untitled Capture"}
        </h3>

        <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1 truncate">
            <CalendarDays className="w-3 h-3 text-emerald-400 shrink-0" />
            {formatDate(item.capturedAt || item.createdAt)}
          </span>
          {tags.length > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <TagIcon className="w-3 h-3 text-teal-400" />
              {tags.length} {tags.length === 1 ? "tag" : "tags"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
