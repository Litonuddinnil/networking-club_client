import React, { useMemo, useState } from "react";
import {
  FileText,
  Search,
  Calendar,
  User,
  Clock,
  Tag,
  ArrowUpRight,
  X,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";
import { PostsTabProps, PostItem } from "./memberTabUtils";

export default function MemberPostsView({
  dataWarning,
  posts = [],
}: PostsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activePost, setActivePost] = useState<PostItem | null>(null);

  // Dynamically extract unique categories from posts
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["all", ...Array.from(set)];
  }, [posts]);

  // Dynamic Post Metrics
  const stats = useMemo(() => {
    const total = posts.length;
    const categoryCount = categories.length - 1; // minus 'all'
    return {
      total,
      categoriesCount: Math.max(1, categoryCount),
    };
  }, [posts, categories]);

  // Dynamic Search and Filtered List
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (post.category || "general").toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const titleMatch = (post.title || "").toLowerCase().includes(q);
      const contentMatch = (post.content || post.description || "")
        .toLowerCase()
        .includes(q);
      const authorMatch = (post.author || "").toLowerCase().includes(q);

      return matchesCategory && (titleMatch || contentMatch || authorMatch);
    });
  }, [posts, selectedCategory, searchQuery]);

  // Helper: Estimate reading time
  const calculateReadTime = (text?: string) => {
    if (!text) return "1 min read";
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  return (
    <>
      {dataWarning}

      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold tracking-tight text-white">
                Club Community Posts &amp; Articles
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Technical write-ups, community tutorials, and official stories.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              label="Total Articles"
              value={stats.total}
              hint="published stories"
              icon={<BookOpen className="w-4 h-4 text-emerald-400" />}
              color="text-white"
            />
            <StatCard
              label="Active Topics"
              value={stats.categoriesCount}
              hint="unique categories"
              icon={<Tag className="w-4 h-4 text-blue-400" />}
              color="text-blue-400"
            />
            <StatCard
              label="Filtered Matches"
              value={filteredPosts.length}
              hint="matching your filter"
              icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
              color="text-emerald-400"
            />
          </div>
        </header>

        {/* Dynamic Search & Category Pill Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by title, keywords, or author..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#03070E] border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40 font-mono transition-colors"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
              <span className="text-slate-500 text-[11px] pr-1 uppercase tracking-wider">
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl uppercase tracking-wider font-semibold border transition-all ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm"
                      : "bg-[#03070E] border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post: PostItem, idx: number) => {
              const uniqueKey = post._id || post.id || `post-${idx}`;
              const contentText = post.content || post.description || "";
              const readTime = calculateReadTime(contentText);
              const hasImage = Boolean(post.coverImage || post.image);

              return (
                <article
                  key={uniqueKey}
                  onClick={() => setActivePost(post)}
                  className="group relative bg-[#03070E] border border-white/10 hover:border-emerald-500/30 p-5 rounded-2xl space-y-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer"
                >
                  {/* Category & Time Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[11px]">
                      <Tag className="w-3 h-3" />
                      {post.category || "General"}
                    </span>

                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {readTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <time dateTime={post.date}>{post.date || "Recent"}</time>
                      </span>
                    </div>
                  </div>

                  {/* Optional Image Banner & Text layout */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {hasImage && (
                      <div className="w-full sm:w-36 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-white/10">
                        <img
                          src={post.coverImage || post.image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <h2 className="font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                        {contentText || "No preview text available."}
                      </p>
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{post.author || post.authorName || "Club Editorial"}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Read Article
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-12 text-center bg-[#03070E] border border-white/5 rounded-2xl space-y-3">
              <div className="p-3 rounded-full bg-slate-900 border border-white/10 text-slate-500">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-mono text-slate-400">
                {searchQuery || selectedCategory !== "all"
                  ? "No articles matched your search and filter criteria."
                  : "No published posts available in the community feed yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Full Post Reader Modal */}
      {activePost && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePost(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] bg-[#03070E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
                <Tag className="w-3.5 h-3.5" />
                {activePost.category || "General"}
              </span>

              <button
                type="button"
                onClick={() => setActivePost(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close article preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
              {(activePost.coverImage || activePost.image) && (
                <div className="h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                  <img
                    src={activePost.coverImage || activePost.image}
                    alt={activePost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white leading-tight">
                  {activePost.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1 pb-4 border-b border-white/10">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    {activePost.author || activePost.authorName || "Club Editorial"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <time dateTime={activePost.date}>{activePost.date || "Recent"}</time>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {calculateReadTime(activePost.content || activePost.description)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans space-y-4">
                {activePost.content || activePost.description || "No full content recorded for this post."}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-[#03070E] border border-white/10 p-3.5 sm:p-4 rounded-2xl space-y-1">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest">
          {label}
        </span>
        {icon}
      </div>
      <div className={`text-xl sm:text-2xl font-display font-extrabold ${color}`}>
        {value}
      </div>
      <div className="text-[10px] font-mono text-slate-500">{hint}</div>
    </div>
  );
}