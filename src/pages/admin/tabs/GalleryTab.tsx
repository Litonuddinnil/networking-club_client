import React from "react";
import { ImageIcon } from "lucide-react";
import AdminCrudToolbar from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";
import GalleryCard from "@/components/admin/cards/GalleryCard";

interface GalleryTabProps {
  items: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function GalleryTab({
  items,
  totalCount,
  searchTerm,
  onSearchChange,
  onCreate,
  onDelete,
}: GalleryTabProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Gallery Archive"
        description="Curate the visual history of club events, workshops, and milestones."
        icon={<ImageIcon className="w-5 h-5" />}
      />
      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        primaryLabel="Upload Image"
        onPrimary={onCreate}
        searchPlaceholder="Search gallery by title..."
        totalCount={totalCount}
        totalLabel="curated media items"
        showViewMode={false}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-7 h-7" />}
          title="Gallery is empty"
          description="Upload your first image to start building the visual archive."
          cta={{ label: "Upload Image", onClick: onCreate }}
        />
      ) : (
        <div className="crud-grid">
          {items.map((g, idx) => (
            <GalleryCard
              key={g._id || g.id || idx}
              item={g}
              onDelete={() => onDelete(g._id || g.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}