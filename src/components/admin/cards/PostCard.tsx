import React from "react";
import { Eye, FileText, Pencil, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
  post: {
    _id?: string;
    id?: string;
    title?: string;
    content?: string;
    excerpt?: string;
    author?: string;
    authorName?: string;
    category?: string;
    coverImage?: string;
    imageUrl?: string;
    createdAt?: string;
    date?: string;
    status?: string;
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CATEGORY_VARIANTS: Record<string, "warning" | "destructive" | "secondary" | "accent" | "default"> = {
  Notice: "warning",
  Announcement: "warning",
  Tutorial: "accent",
  Story: "secondary",
  News: "default",
  Urgent: "destructive",
};

export default function PostCard({ post, onView, onEdit, onDelete }: PostCardProps) {
  const cover = post.coverImage || post.imageUrl;
  const preview = (post.excerpt || post.content || "").slice(0, 220);

  return (
    <div className="glass-card entity-card p-0 overflow-hidden group">
      <div className="relative h-32 overflow-hidden">
        {cover ? (
          <img src={cover} alt={post.title || "Post cover"} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent grid place-items-center text-emerald-400/60">
            <FileText className="w-10 h-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {post.category && (
            <Badge variant={CATEGORY_VARIANTS[post.category] || "secondary"} className="bg-card/80 backdrop-blur-sm">
              {post.category}
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[10px] font-mono text-white/80">
          <User className="w-3 h-3" />
          <span className="truncate">{post.authorName || post.author || "Anonymous"}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-foreground leading-snug line-clamp-2">
          {post.title || "Untitled post"}
        </h3>
        {preview && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{preview}</p>
        )}
        <div className="meta-strip mt-4 pt-3 border-t border-white/5">
          <span>
            <FileText className="w-3 h-3 text-emerald-400" />
            {post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now")}
          </span>
          {post.status && (
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{post.status}</span>
          )}
        </div>

        <div className="hover-actions justify-end pt-4 mt-4 border-t border-white/5">
          {onView && (
            <button type="button" onClick={onView} className="icon-action text-sky-400 hover:bg-sky-500/15" title="View details" aria-label="View details">
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button type="button" onClick={onEdit} className="icon-action text-amber-400 hover:bg-amber-500/15" title="Edit post" aria-label="Edit post">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} className="icon-action is-danger" title="Delete post" aria-label="Delete post">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
