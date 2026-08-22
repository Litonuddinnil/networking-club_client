import React from "react";
import { Users } from "lucide-react";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";
import MemberCard from "@/components/admin/cards/MemberCard";

interface MembersTabProps {
  members: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onApprove: (id: string) => void;
  onToggleRole: (member: any) => void;
  onDelete: (id: string) => void;
}

export default function MembersTab({
  members,
  totalCount,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onApprove,
  onToggleRole,
  onDelete,
}: MembersTabProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Club Members Database"
        description="Approve new members, manage roles, and maintain the registry."
        icon={<Users className="w-5 h-5" />}
      />
      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel="Refresh"
        searchPlaceholder="Search by name, email, or ID..."
        totalCount={totalCount}
        totalLabel="members in database"
      />
      {members.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No members match your search"
          description="Try a different name, email, or member ID."
        />
      ) : (
        <div className="crud-grid">
          {members.map((m, idx) => (
            <MemberCard
              key={m._id || m.id || m.memberId || m.email || idx}
              member={m}
              onApprove={() => onApprove(m._id || m.id || m.memberId || m.email)}
              onToggleRole={() => onToggleRole(m)}
              onDelete={() => onDelete(m._id || m.id || m.memberId || m.email)}
            />
          ))}
        </div>
      )}
    </div>
  );
}