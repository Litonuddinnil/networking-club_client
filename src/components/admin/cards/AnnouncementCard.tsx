 import React, { useState } from "react";
import {
  Calendar,
  Eye,
  Megaphone,
  Pencil,
  Trash2,
  Pin,
  Share2,
  Paperclip,
  Clock,
  Check,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnnouncementCardProps {
  announcement: {
    _id?: string;
    id?: string;
    title: string;
    content?: string;
    description?: string;
    category?: string;
    priority?: "urgent" | "high" | "normal" | "low" | string;
    date?: string;
    createdAt?: string;
    createdByName?: string;
    author?: string;
    isPinned?: boolean;
    attachmentsCount?: number;
    targetAudience?: string; // e.g. "All Members", "Students", "Public"
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPinToggle?: (id?: string) => void;
}

// ক্যাটাগরি অনুযায়ী আইকন এবং কালার
const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  Urgent: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
  },
  Notice: {
    icon: <Megaphone className="w-4 h-4" />,
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  Event: {
    icon: <Sparkles className="w-4 h-4" />,
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/30",
  },
  General: {
    icon: <Layers className="w-4 h-4" />,
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/30",
  },
};

// টাইম ফরম্যাটিং (Relative time)
function formatTimeAgo(dateString?: string) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// পড়ার আনুমানিক সময় হিসাব
function calculateReadTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / 180);
  return readTime <= 1 ? "1 min read" : `${readTime} mins read`;
}

export default function AnnouncementCard({
  announcement,
  onView,
  onEdit,
  onDelete,
  onPinToggle,
}: AnnouncementCardProps) {
  const [copied, setCopied] = useState(false);
  const textContent = announcement.content || announcement.description || "";
  const preview = textContent.slice(0, 190);
  
  const categoryKey = announcement.category || "Notice";
  const categoryStyle = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.Notice;
  const priority = (announcement.priority || "").toLowerCase();
  const authorName = announcement.createdByName || announcement.author || "Admin";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/announcements/${announcement._id || announcement.id || ""}` : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-300 backdrop-blur-xl ${
        announcement.isPinned
          ? "border-amber-500/40 bg-gradient-to-b from-amber-500/[0.07] via-card/70 to-card shadow-lg shadow-amber-500/5"
          : "border-white/10 bg-card/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-0.5"
      }`}
    >
      {/* Pinned Accent Glow Badge */}
      {announcement.isPinned && (
        <div className="absolute top-0 right-8 -translate-y-1/2 flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-500/40 backdrop-blur-md">
          <Pin className="w-3 h-3 fill-amber-300" />
          <span>Pinned</span>
        </div>
      )}

      <div>
        {/* Top Header: Category Icon, Priority, & Audience */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl ${categoryStyle.bg} border ${categoryStyle.border} ${categoryStyle.text} grid place-items-center shrink-0 shadow-inner`}>
              {categoryStyle.icon}
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className={`${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} font-medium`}>
                {categoryKey}
              </Badge>

              {priority === "urgent" && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Urgent
                </span>
              )}

              {announcement.targetAudience && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground border border-white/5">
                  🎯 {announcement.targetAudience}
                </span>
              )}
            </div>
          </div>

          {/* Quick Pin Toggle Button */}
          {onPinToggle && (
            <button
              type="button"
              onClick={() => onPinToggle(announcement._id || announcement.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                announcement.isPinned
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-muted-foreground/50 hover:text-foreground hover:bg-white/5"
              }`}
              title={announcement.isPinned ? "Unpin notice" : "Pin notice"}
            >
              <Pin className={`w-4 h-4 ${announcement.isPinned ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={onView}
          className="mt-4 font-display font-bold text-lg sm:text-xl text-foreground leading-snug hover:text-primary transition-colors cursor-pointer line-clamp-2"
        >
          {announcement.title}
        </h3>

        {/* Content Preview */}
        {preview && (
          <p className="mt-2.5 text-sm text-muted-foreground/90 leading-relaxed line-clamp-3">
            {preview}
          </p>
        )}
      </div>

      {/* Footer Info & Action Section */}
      <div className="mt-5 space-y-3 pt-4 border-t border-white/10">
        
        {/* Meta details: Author, Date, Reading time, Attachments */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-muted-foreground">
          {/* Author info with avatar */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-[10px]">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-foreground/80">{authorName}</span>
          </div>

          {/* Time & Read Stats */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {formatTimeAgo(announcement.createdAt || announcement.date)}
            </span>

            {textContent && (
              <span className="hidden sm:flex items-center gap-1 text-muted-foreground/70">
                <Clock className="w-3.5 h-3.5" />
                {calculateReadTime(textContent)}
              </span>
            )}

            {announcement.attachmentsCount && announcement.attachmentsCount > 0 ? (
              <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                <Paperclip className="w-3 h-3" />
                {announcement.attachmentsCount}
              </span>
            ) : null}
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-2">
          {/* Read Details CTA */}
          {onView ? (
            <button
              type="button"
              onClick={onView}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-all hover:gap-1.5"
            >
              Read Full Notice
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : <div />}

          {/* Control Buttons */}
          <div className="flex items-center gap-1">
            {/* Share / Copy Link */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="Share / Copy Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-2 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                title="Edit announcement"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}