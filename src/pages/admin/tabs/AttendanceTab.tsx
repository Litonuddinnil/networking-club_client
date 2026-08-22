import React from "react";
import { CalendarCheck, Pencil, Trash2 } from "lucide-react";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";

interface AttendanceTabProps {
  attendance: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onCreate: () => void;
  onEdit: (record: any) => void;
  onDelete: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  Present:
    "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  Absent: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  Late: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  Excused: "bg-blue-500/10 border-blue-500/30 text-blue-400",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.Present;
  return (
    <span
      className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider ${cls}`}
    >
      {status || "Present"}
    </span>
  );
}

export default function AttendanceTab({
  attendance,
  totalCount,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreate,
  onEdit,
  onDelete,
}: AttendanceTabProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Attendance & Presence Log"
        description="Mark meeting presence, lab sessions, and workshop attendance for every member."
        icon={<CalendarCheck className="w-5 h-5" />}
      />
      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel="Mark Attendance"
        onPrimary={onCreate}
        searchPlaceholder="Search by member, topic, or status..."
        totalCount={totalCount}
        totalLabel="attendance entries"
      />

      {attendance.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="w-7 h-7" />}
          title="No attendance records"
          description="Start tracking member presence by adding the first attendance entry."
          cta={{ label: "Mark Attendance", onClick: onCreate }}
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-background/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Topic / Session</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Note</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a, idx) => {
                  const id = a._id || a.id || idx;
                  return (
                    <tr
                      key={id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-bold text-foreground text-xs">
                          {a.memberName || "Unknown"}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {a.memberEmail || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-[11px] font-mono">
                        {a.date ||
                          (a.createdAt
                            ? new Date(a.createdAt).toLocaleDateString()
                            : "—")}
                      </td>
                      <td className="px-4 py-3 align-top text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px]">
                          {a.topic || a.session || "General"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 align-top text-[10px] text-muted-foreground max-w-[220px]">
                        <p className="line-clamp-2">{a.note || "—"}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(a)}
                            className="icon-action text-cyan-400 hover:bg-cyan-500/15"
                            title="Edit record"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
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
