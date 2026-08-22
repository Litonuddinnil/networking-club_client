import React from "react";
import { ClipboardCheck } from "lucide-react";
import { AttendanceTabProps } from "./memberTabUtils";

const statusMap = {
  present: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  absent: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  late: "bg-amber-500/10 border-amber-500/30 text-amber-400",
} as const;

const fallback = "bg-blue-500/10 border-blue-500/30 text-blue-400";

export default function MemberMyAttendanceView({
  dataWarning,
  myAttendance = [],
}: AttendanceTabProps) {
  return (
    <>{dataWarning}
      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <ClipboardCheck className="w-5 h-5 text-orange-500" />
          <span>My Attendance Log</span>
        </h1>
        <div className="space-y-3">
          {myAttendance.length > 0 ? (
            myAttendance.map((a, idx) => {
              const status = a.status || "Present";
              const statusColor =
                statusMap[status.toLowerCase() as keyof typeof statusMap] || fallback;
              return (
                <div
                  key={a._id || a.id || idx}
                  className="bg-[#03070E] border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">
                      {a.topic || a.session || "General Session"}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      📅 {a.date || "Date TBD"}
                    </p>
                    {a.note && (
                      <p className="text-[10px] text-slate-500 line-clamp-1">{a.note}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 border rounded text-[10px] font-mono font-bold uppercase tracking-wider ${statusColor}`}>
                    {status}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl">
              No attendance entries yet. Attend the next club session to start building your record.
            </div>
          )}
        </div>
      </div>
    </>
  );
}