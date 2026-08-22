import React from "react";
import { FileText, Image as ImageIcon } from "lucide-react";
import { PostsTabProps } from "./memberTabUtils";

/**
 * MemberPostsView
 * ---------------
 * Renders the "Club Community Posts" tab for members. Each post is shown
 * as a glassy card with category / date metadata + a preview excerpt.
 */
export default function MemberPostsView({
  dataWarning,
  posts = [],
}: PostsTabProps) {
  return (
    <>{dataWarning}
      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-orange-500" />
          <span>Club Community Posts</span>
        </h1>
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post, idx) => (
              <div
                key={post._id || post.id || idx}
                className="bg-[#03070E] border border-white/10 p-5 rounded-2xl space-y-2"
              >
                <div className="flex justify-between items-center text-xs text-orange-400 font-mono">
                  <span>{post.category || "General"}</span>
                  <span>{post.date || "Recent"}</span>
                </div>
                <h3 className="font-bold text-lg text-white">{post.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-2">
                  {post.content || post.description || "No preview text available."}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl">
              No published posts found.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// keep tree-shaker happy with the lucide import
void ImageIcon;