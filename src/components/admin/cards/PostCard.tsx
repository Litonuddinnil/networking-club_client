import React from "react";
import { Calendar, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
  post: {
    _id?: string;
    id?: string;
    title: string;
    content?: string;
    category?: string;
    author?: string;
    date?: string;
  };
  onDelete?: () => void;
}

/**
 * PostCard — title + category chip + content preview + author meta.
 */
export default function PostCard({ post, onDelete }: PostCardProps) {
  const preview = (post.content || "").slice(0, 200);

  return (
    <div className="glass-card entity-card p-5">
      <div className="badge-cluster">
        <Badge variant="secondary">{post.category || "General"}</Badge>
      </div>

      <div className="pt-9 space-y-3">
        <h3 className="font-display font-bold text-lg text-foreground leading-tight line-clamp-2">
          {post.title}
        </h3>
        {preview && (
          <p className="text-sm text-muted-foreground line-clamp-3">{preview}</p>
        )}
        <div className="meta-strip pt-2">
          <span>
            <User className="w-3 h-3 text-emerald-400" />
            {post.author || "Admin"}
          </span>
          <span>
            <Calendar className="w-3 h-3 text-teal-400" />
            {post.date || "Recent"}
          </span>
        </div>
      </div>

      {onDelete && (
        <div className="hover-actions justify-end pt-4 mt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onDelete}
            className="icon-action is-danger"
            aria-label="Delete post"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}