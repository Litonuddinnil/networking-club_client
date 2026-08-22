 import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  Heart,
  Pencil,
  Share2,
  Trash2,
  Check,
  ArrowUpRight,
  Bookmark
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostCardProps {
  post: {
    _id?: string;
    id?: string;
    title?: string;
    content?: string;
    excerpt?: string;
    author?: string;
    authorName?: string;
    authorAvatar?: string;
    category?: string;
    tags?: string[];
    coverImage?: string;
    imageUrl?: string;
    createdAt?: string;
    date?: string;
    status?: "published" | "draft" | "archived" | string;
    viewsCount?: number;
    likesCount?: number;
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CATEGORY_VARIANTS: Record<string, string> = {
  Notice: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Announcement: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Tutorial: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  Story: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  News: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  Urgent: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  archived: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

function calculateReadTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const time = Math.ceil(words / 180);
  return time <= 1 ? "1 min read" : `${time} min read`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Recent";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name?: string) {
  if (!name) return "U";
  return name.slice(0, 2).toUpperCase();
}

export default function PostCard({ post, onView, onEdit, onDelete }: PostCardProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const cover = post.coverImage || post.imageUrl;
  const title = post.title || "Untitled post";
  const fullText = post.content || post.excerpt || "";
  const preview = (post.excerpt || post.content || "").slice(0, 160);
  const author = post.authorName || post.author || "Club Member";
  const status = (post.status || "published").toLowerCase();
  const category = post.category || "General";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/posts/${post._id || post.id || ""}` : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl">
      
      {/* Top Cover Image (Enhanced Height & Gradient) */}
      <div 
        onClick={onView} 
        className="relative h-48 sm:h-52 w-full overflow-hidden bg-muted/30 cursor-pointer"
      >
        {cover ? (
          <img
            src={cover}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-card text-teal-400/60">
            <FileText className="h-16 w-16 stroke-1 opacity-50" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />

        {/* Top Badges: Category & Status */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap gap-1.5 pointer-events-auto">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md ${
                CATEGORY_VARIANTS[category] || "bg-black/50 text-white border-white/15"
              }`}
            >
              {category}
            </span>

            {post.status && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                  STATUS_STYLES[status] || "bg-card/70 text-foreground border-white/10"
                }`}
              >
                {post.status}
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmark}
            className="pointer-events-auto p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/15 backdrop-blur-md transition-colors shadow-sm"
            title="Bookmark post"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-teal-400 text-teal-400" : ""}`} />
          </button>
        </div>

        {/* Bottom Author Row on Image */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs text-white/90">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 ring-1 ring-white/30 shadow-md">
              {post.authorAvatar && <AvatarImage src={post.authorAvatar} alt={author} />}
              <AvatarFallback className="bg-primary/30 text-primary-foreground text-[10px] font-bold">
                {getInitials(author)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-white truncate max-w-[140px]">{author}</span>
          </div>

          {/* Reading Time */}
          <div className="flex items-center gap-1 text-[11px] text-white/80 font-medium bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
            <Clock className="w-3 h-3 text-teal-400" />
            <span>{calculateReadTime(fullText)}</span>
          </div>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div>
          <h3
            onClick={onView}
            className="cursor-pointer font-display text-lg sm:text-xl font-bold leading-snug text-foreground transition-colors hover:text-primary line-clamp-2"
          >
            {title}
          </h3>

          {preview && (
            <p className="mt-2 text-sm text-muted-foreground/90 leading-relaxed line-clamp-2">
              {preview}
            </p>
          )}

          {/* Tags Chips */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta & Actions */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          
          {/* Date Stamp & Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatDate(post.date || post.createdAt)}</span>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-3">
              {typeof post.viewsCount === "number" && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.viewsCount}
                </span>
              )}
              {typeof post.likesCount === "number" && (
                <span className="flex items-center gap-1 text-rose-400">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" />
                  {post.likesCount}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-1">
            {/* Read Article CTA */}
            {onView ? (
              <button
                type="button"
                onClick={onView}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-all hover:gap-1.5"
              >
                Read Article
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ) : <div />}

            {/* Quick Action Icons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleShare}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                title="Share article"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  title="Edit post"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}