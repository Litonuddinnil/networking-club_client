import React from "react";
import { Calendar } from "lucide-react";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";
import EventCard from "@/components/admin/cards/EventCard";

interface EventsTabProps {
  events: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function EventsTab({
  events,
  totalCount,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreate,
  onDelete,
}: EventsTabProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Events & Activities"
        description="Schedule workshops, contests, and networking sessions."
        icon={<Calendar className="w-5 h-5" />}
      />
      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel="New Event"
        onPrimary={onCreate}
        searchPlaceholder="Search events by name or venue..."
        totalCount={totalCount}
        totalLabel="scheduled events"
      />
      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-7 h-7" />}
          title="No events scheduled"
          description="Plan your next workshop, contest, or community meetup."
          cta={{ label: "Create Event", onClick: onCreate }}
        />
      ) : (
        <div className="crud-grid">
          {events.map((e, idx) => (
            <EventCard
              key={e._id || e.id || idx}
              event={e}
              onDelete={() => onDelete(e._id || e.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}