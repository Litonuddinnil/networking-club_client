import React, { useState } from "react";
import {
  CalendarDays,
  Eye,
  Pencil,
  Tag as TagIcon,
  Trash2,
  User as UserIcon,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: any;
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

function readTime(content?: string) {
  const words = (content || "").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const STATUS_VARIANT: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  published: "success",
  draft: "warning",
  archived: "muted",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

export default function PostCard({ post, onView, onEdit, onDelete }: PostCardProps) {
  const status = (post.status || "draft").toLowerCase();
  const statusVariant = STATUS_VARIANT[status] || "info";
  const statusLabel = STATUS_LABEL[status] || status;
  const categories: string[] = Array.isArray(post.tags)
    ? post.tags
    : post.category
    ? [post.category]
    : [];

  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!post.coverImage && !imgFailed;

  return (
    <article className="glass-card entity-card flex flex-col overflow-hidden group">
      {/* Media header */}
      <div className={cn("image-well", !hasImage && "image-well-shimmer")}>
        {hasImage ? (
          <img
            src={post.coverImage}
            alt={post.title || "Post cover"}
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <FileText className="w-7 h-7 text-emerald-400/70" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                {statusLabel}
              </span>
            </div>
          </div>
        )}

        {/* Badge cluster (top-left) */}
        <div className="badge-cluster">
          <Badge variant={statusVariant} size="sm" className="shadow-md">
            {statusLabel}
          </Badge>
          {post.featured && (
            <Badge variant="accent" size="sm" className="shadow-md">
              Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 gap-2.5 p-4 sm:p-5">
        {/* Title */}
        <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-emerald-300 transition-colors">
          {post.title || "Untitled Post"}
        </h3>

        {/* Excerpt */}
        {post.excerpt || post.content ? (
          <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-3">
            {post.excerpt ||
              (typeof post.content === "string"
                ? post.content.replace(/<[^>]+>/g, "").slice(0, 160)
                : "")}
          </p>
        ) : null}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {categories.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                <TagIcon className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Meta strip */}
        <div className="meta-strip border-t border-white/5 pt-3 mt-1">
          <span title="Author">
            <UserIcon className="w-3 h-3 text-emerald-400" />
            {(post.authorName || post.author || "Anonymous")
              .toString()
              .slice(0, 22)}
          </span>
          <span title="Published">
            <CalendarDays className="w-3 h-3 text-teal-400" />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <span title="Reading time">
            <FileText className="w-3 h-3 text-lime-400" />
            {readTime(post.content)} min read
          </span>
        </div>

        {/* Hover actions */}
        <div className="hover-actions !translate-y-0 md:!translate-y-full md:group-hover:!translate-y-0 md:pointer-events-none md:group-hover:pointer-events-auto md:!p-2 md:!bg-transparent md:!backdrop-blur-0">
          <div className="flex w-full items-center justify-end gap-1.5 pt-2 border-t border-white/5 md:border-0 md:pt-0">
            {onView && (
              <button
                type="button"
                onClick={onView}
                className="icon-action text-sky-300"
                title="View post"
                aria-label="View post"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="icon-action text-amber-300"
                title="Edit post"
                aria-label="Edit post"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="icon-action is-danger"
                title="Delete post"
                aria-label="Delete post"
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
