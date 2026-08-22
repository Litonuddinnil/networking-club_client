 import React, { useState } from "react";
import {
  Calendar,
  Eye,
  ImageIcon,
  Pencil,
  Trash2,
  Heart,
  Download,
  Share2,
  Check,
  Maximize2,
  Tag
} from "lucide-react";
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
    tags?: string[];
    date?: string;
    uploadedByName?: string;
    uploadedBy?: string;
    createdAt?: string;
    likesCount?: number;
    isLiked?: boolean;
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: (id?: string) => void;
  onDownload?: () => void;
}

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GalleryCard({
  item,
  onView,
  onEdit,
  onDelete,
  onLike,
  onDownload,
}: GalleryCardProps) {
  const src = item.imageUrl || item.url;
  const title = item.title || "Untitled Media";
  const caption = item.caption || item.description || "";
  const author = item.uploadedByName || item.uploadedBy || "Member";
  const displayDate = item.date || item.createdAt;

  const [liked, setLiked] = useState(item.isLiked || false);
  const [likeCount, setLikeCount] = useState(item.likesCount || 0);
  const [copied, setCopied] = useState(false);

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
    if (onLike) onLike(item._id || item.id);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (src) {
      navigator.clipboard.writeText(src);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload();
      return;
    }
    if (src) {
      const link = document.createElement("a");
      link.href = src;
      link.download = title.replace(/\s+/g, "_") || "gallery-image";
      link.target = "_blank";
      link.rel = "noreferrer";
      link.click();
    }
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl">
      
      {/* Media Container with 4:3 Aspect Ratio */}
      <div 
        onClick={onView}
        className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40 cursor-pointer"
      >
        {src ? (
          <img
            src={src}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-card text-emerald-400/60">
            <ImageIcon className="h-16 w-16 stroke-1 opacity-50" />
          </div>
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 opacity-70 transition-opacity duration-300 group-hover:opacity-90" />

        {/* Center Hover Quick-View Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/20 shadow-xl scale-95 transition-transform duration-300 group-hover:scale-100">
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Expand</span>
          </div>
        </div>

        {/* Top Badges & Quick Like Action */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap gap-1.5 pointer-events-auto">
            {item.category && (
              <Badge
                variant="outline"
                className="border-white/15 bg-black/50 text-[11px] font-medium text-white backdrop-blur-md"
              >
                {item.category}
              </Badge>
            )}
          </div>

          {/* Like Heart Button */}
          <button
            type="button"
            onClick={handleLikeToggle}
            className={`pointer-events-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md transition-all border ${
              liked
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-rose-500/20"
                : "bg-black/50 text-white/80 border-white/15 hover:bg-black/70 hover:text-white"
            }`}
            title={liked ? "Unlike" : "Like"}
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
        </div>

        {/* Bottom Overlay Info (Date & Tag Preview) */}
        <div className="absolute bottom-3 inset-x-3 pointer-events-none flex items-center justify-between text-[11px] text-white/80">
          {displayDate && (
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3 w-3 text-teal-400" />
              <span>{formatDate(displayDate)}</span>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1 truncate max-w-[50%]">
              <Tag className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="truncate">{item.tags.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3">
        <div>
          <h3
            onClick={onView}
            className="cursor-pointer font-display text-base sm:text-lg font-bold leading-snug text-foreground transition-colors hover:text-primary line-clamp-1"
          >
            {title}
          </h3>

          {caption && (
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed">
              {caption}
            </p>
          )}
        </div>

        {/* Uploader Profile & Footer Controls */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          
          {/* Uploader Info */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-[10px] shrink-0">
              {author.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              by <span className="font-medium text-foreground/80">{author}</span>
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 shrink-0">
            {/* View Full */}
            {onView && (
              <button
                type="button"
                onClick={onView}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                title="View image"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title="Download image"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Share / Copy Image URL */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="Copy image link"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            </button>

            {/* Edit */}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                title="Edit item"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}