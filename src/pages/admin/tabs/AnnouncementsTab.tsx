import React from "react";
import { Megaphone } from "lucide-react";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";
import AnnouncementCard from "@/components/admin/cards/AnnouncementCard";

interface AnnouncementsTabProps {
  announcements: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function AnnouncementsTab({
  announcements,
  totalCount,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreate,
  onDelete,
}: AnnouncementsTabProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Announcement Board"
        description="Push urgent updates and broadcast notices to the entire club."
        icon={<Megaphone className="w-5 h-5" />}
      />
      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel="New Announcement"
        onPrimary={onCreate}
        searchPlaceholder="Search announcements..."
        totalCount={totalCount}
        totalLabel="active announcements"
      />
      {announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-7 h-7" />}
          title="No announcements yet"
          description="Broadcast urgent notices or system updates."
          cta={{ label: "Create Announcement", onClick: onCreate }}
        />
      ) : (
        <div className="crud-grid">
          {announcements.map((a, idx) => (
            <AnnouncementCard
              key={a._id || a.id || idx}
              announcement={a}
              onDelete={() => onDelete(a._id || a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}