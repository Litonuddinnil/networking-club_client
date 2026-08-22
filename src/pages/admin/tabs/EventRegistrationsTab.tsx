import React from "react";
import { Ticket, UserCheck, Trash2 } from "lucide-react";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";

interface EventRegistrationsTabProps {
  eventRegistrations: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  registered:
    "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  cancelled:
    "bg-rose-500/10 border-rose-500/30 text-rose-400",
  attended:
    "bg-blue-500/10 border-blue-500/30 text-blue-400",
  waitlist:
    "bg-amber-500/10 border-amber-500/30 text-amber-400",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.registered;
  return (
    <span
      className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider ${cls}`}
    >
      {status || "registered"}
    </span>
  );
}

export default function EventRegistrationsTab({
  eventRegistrations,
  totalCount,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCancel,
  onDelete,
}: EventRegistrationsTabProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Event Registrations"
        description="Track which members have signed up for upcoming events, workshops, and contests."
        icon={<Ticket className="w-5 h-5" />}
      />
      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel={undefined}
        onPrimary={undefined}
        searchPlaceholder="Search by event, member, or status..."
        totalCount={totalCount}
        totalLabel="registrations"
      />

      {eventRegistrations.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-7 h-7" />}
          title="No event registrations yet"
          description="When members register for events from the public site, they will appear here."
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-background/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Event</th>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Registered Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventRegistrations.map((r, idx) => {
                  const id = r._id || r.id || idx;
                  const isCancelled = (r.status || "registered") === "cancelled";
                  return (
                    <tr
                      key={id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-bold text-foreground text-xs">
                          {r.eventTitle || "Untitled Event"}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          ID: {r.eventId || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-bold text-foreground text-xs">
                          {r.memberName || "Unknown"}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {r.memberEmail || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-[11px] font-mono">
                        {r.registeredAt
                          ? new Date(r.registeredAt).toLocaleString()
                          : r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={r.status || "registered"} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => onCancel(id)}
                              className="icon-action text-amber-400 hover:bg-amber-500/15"
                              title="Cancel registration"
                            >
                              <Ticket className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDelete(id)}
                            className="icon-action is-danger"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
