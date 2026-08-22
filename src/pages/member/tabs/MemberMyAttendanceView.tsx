 import React, { useMemo, useState } from "react";
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  FileText,
  Filter,
} from "lucide-react";
import { AttendanceTabProps, AttendanceItem } from "./memberTabUtils";

const STATUS_STYLES: Record<string, { badge: string; icon: React.ReactNode }> = {
  present: {
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  },
  absent: {
    badge: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
  },
  late: {
    badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  },
  excused: {
    badge: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    icon: <FileText className="w-3.5 h-3.5 text-blue-400" />,
  },
};

const DEFAULT_STATUS_STYLE = {
  badge: "bg-slate-500/10 border-slate-500/30 text-slate-400",
  icon: <Clock className="w-3.5 h-3.5 text-slate-400" />,
};

type FilterType = "all" | "present" | "late" | "absent";

export default function MemberMyAttendanceView({
  dataWarning,
  myAttendance = [],
}: AttendanceTabProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Dynamic Statistics Calculation
  const stats = useMemo(() => {
    const total = myAttendance.length;
    let present = 0;
    let late = 0;
    let absent = 0;

    myAttendance.forEach((item) => {
      const s = (item.status || "present").toLowerCase();
      if (s === "present") present += 1;
      else if (s === "late") late += 1;
      else if (s === "absent") absent += 1;
    });

    // Attendance Rate = (Present + Late) / Total
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, late, absent, rate };
  }, [myAttendance]);

  // Dynamic Filtered List
  const filteredAttendance = useMemo(() => {
    if (activeFilter === "all") return myAttendance;
    return myAttendance.filter((item) => {
      const s = (item.status || "present").toLowerCase();
      return s === activeFilter;
    });
  }, [myAttendance, activeFilter]);

  return (
    <>
      {dataWarning}

      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <ClipboardCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold tracking-tight text-white">
                My Attendance Log
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Track your session attendance history and participation metrics.
              </p>
            </div>
          </div>

          {/* Dynamic Stat KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Total Sessions"
              value={stats.total}
              icon={<ClipboardCheck className="w-4 h-4 text-blue-400" />}
              color="text-white"
            />
            <StatCard
              label="Present"
              value={stats.present}
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              color="text-emerald-400"
            />
            <StatCard
              label="Late / Partial"
              value={stats.late}
              icon={<Clock className="w-4 h-4 text-amber-400" />}
              color="text-amber-400"
            />
            <StatCard
              label="Attendance Rate"
              value={`${stats.rate}%`}
              icon={<Percent className="w-4 h-4 text-orange-400" />}
              color={
                stats.rate >= 75
                  ? "text-emerald-400"
                  : stats.rate >= 50
                  ? "text-amber-400"
                  : "text-rose-400"
              }
            />
          </div>
        </header>

        {/* Dynamic Filter Tabs */}
        {myAttendance.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            <span className="flex items-center gap-1 text-slate-500 pr-2">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {(["all", "present", "late", "absent"] as FilterType[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-xl uppercase tracking-wider font-semibold border transition-all ${
                  activeFilter === f
                    ? "bg-orange-500/20 border-orange-500/40 text-orange-300 shadow-sm"
                    : "bg-[#03070E] border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic List */}
        <div className="space-y-3">
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((a: AttendanceItem, idx: number) => {
              const uniqueKey = a._id || a.id || `att-${idx}`;
              const normalizedStatus = (a.status || "present").toLowerCase();
              const style = STATUS_STYLES[normalizedStatus] || DEFAULT_STATUS_STYLE;

              return (
                <article
                  key={uniqueKey}
                  className="bg-[#03070E] border border-white/10 hover:border-white/20 transition-colors p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {a.topic || a.session || a.title || "General Club Session"}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <time dateTime={a.date}>{a.date || "Date TBD"}</time>
                      </span>

                      {a.time && (
                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{a.time}</span>
                        </span>
                      )}
                    </div>

                    {a.note && (
                      <p className="text-xs text-slate-400 pt-1 border-t border-white/5">
                        <span className="text-slate-500 font-mono">Note: </span>
                        {a.note}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${style.badge}`}
                    >
                      {style.icon}
                      {a.status || "Present"}
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl space-y-1">
              <p>
                {activeFilter === "all"
                  ? "No attendance entries recorded yet. Attend sessions to build your history."
                  : `No attendance records found with status "${activeFilter}".`}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
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
    </div>
  );
}