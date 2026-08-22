import React from "react";
import { Calendar, Eye, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GalleryCardProps {
  item: {
    _id?: string;
    id?: string;
    title?: string;
    caption?: string;
    description?: string;
    imageUrl?: string;
    url?: string;
    category?: string;
    date?: string;
    uploadedByName?: string;
    uploadedBy?: string;
    createdAt?: string;
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function GalleryCard({ item, onView, onEdit, onDelete }: GalleryCardProps) {
  const src = item.imageUrl || item.url;

  return (
    <div className="glass-card entity-card group">
      <div className="image-well relative">
        {src ? (
          <img src={src} alt={item.title || "Club media"} loading="lazy" />
        ) : (
          <div className="w-full h-full grid place-items-center bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-400">
            <ImageIcon className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 p-3 flex flex-wrap gap-1.5">
          {item.category && (
            <Badge variant="outline" className="bg-card/70 backdrop-blur-sm border-white/10">
              {item.category}
            </Badge>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <h3 className="font-display font-semibold text-sm text-white line-clamp-1">
            {item.title || "Untitled media"}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-white/70">
            <Calendar className="w-3 h-3" />
            <span>
              {item.date ||
                (item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "")}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {(item.caption || item.description) && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.caption || item.description}
            </p>
          )}
          {(item.uploadedByName || item.uploadedBy) && (
            <p className="text-[10px] font-mono text-muted-foreground mt-1">
              by {item.uploadedByName || item.uploadedBy}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onView && (
            <button type="button" onClick={onView} className="icon-action text-sky-400 hover:bg-sky-500/15" title="View" aria-label="View">
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button type="button" onClick={onEdit} className="icon-action text-amber-400 hover:bg-amber-500/15" title="Edit" aria-label="Edit">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} className="icon-action is-danger" title="Delete" aria-label="Delete image">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
