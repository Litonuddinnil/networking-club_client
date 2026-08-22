import React from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GalleryCardProps {
  item: {
    _id?: string;
    id?: string;
    title?: string;
    imageUrl?: string;
    url?: string;
    category?: string;
    date?: string;
  };
  onDelete?: () => void;
}

export default function GalleryCard({ item, onDelete }: GalleryCardProps) {
  const src = item.imageUrl || item.url;

  return (
    <div className="glass-card entity-card">
      <div className="image-well relative">
        {src ? (
          <img src={src} alt={item.title || "Club media"} loading="lazy" />
        ) : (
          <div className="w-full h-full grid place-items-center bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-400">
            <ImageIcon className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="badge-cluster">
          {item.category && (
            <Badge variant="outline" className="bg-card/70 backdrop-blur-sm">
              {item.category}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-sm text-foreground line-clamp-2">
            {item.title || "Untitled media"}
          </h3>
          {item.date && (
            <p className="text-[10px] font-mono text-muted-foreground mt-1">
              {item.date}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="icon-action is-danger shrink-0"
            aria-label="Delete image"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}