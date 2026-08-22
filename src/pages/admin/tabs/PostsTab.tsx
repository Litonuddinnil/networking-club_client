import React from "react";
import { FileText } from "lucide-react";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";
import PostCard from "@/components/admin/cards/PostCard";

interface PostsTabProps {
  posts: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onEdit: (post: any) => void;
  onView: (post: any) => void;
}

export default function PostsTab({
  posts,
  totalCount,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreate,
  onDelete,
  onEdit,
  onView,
}: PostsTabProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Community Posts"
        description="Publish news, articles, and updates to keep the community informed."
        icon={<FileText className="w-5 h-5" />}
      />
      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel="New Post"
        onPrimary={onCreate}
        searchPlaceholder="Search posts by title or content..."
        totalCount={totalCount}
        totalLabel="published posts"
      />
      {posts.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="No posts yet"
          description="Be the first to share something with the community."
          cta={{ label: "Create Post", onClick: onCreate }}
        />
      ) : (
        <div className="crud-grid">
          {posts.map((p, idx) => (
            <PostCard
              key={p._id || p.id || idx}
              post={p}
              onView={() => onView(p)}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p._id || p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}