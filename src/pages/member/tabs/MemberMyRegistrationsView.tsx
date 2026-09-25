 import React, { useMemo, useState } from "react";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Filter,
  BookmarkCheck,
  AlertCircle,
} from "lucide-react";
import {
  MyRegistrationsTabProps,
  RegistrationItem,
  EventItem,
  EVENT_TYPE_THEMES,
  DEFAULT_EVENT_THEME,
  formatLongDate,
  createTabNavigator,
} from "./memberTabUtils";

const STATUS_STYLES: Record<string, { badge: string; icon: React.ReactNode; label: string }> = {
  attended: {
    badge: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />,
    label: "Attended",
  },
  registered: {
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    icon: <Ticket className="w-3.5 h-3.5 text-emerald-400" />,
    label: "Confirmed",
  },
  waitlist: {
    badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
    label: "Waitlisted",
  },
  cancelled: {
    badge: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
    label: "Cancelled",
  },
};

const DEFAULT_STATUS_STYLE = {
  badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  icon: <Ticket className="w-3.5 h-3.5 text-emerald-400" />,
  label: "Registered",
};

type RegFilter = "all" | "upcoming" | "attended";

export default function MemberMyRegistrationsView({
  dataWarning,
  events = [],
  myRegistrations = [],
  onNavigate,
}: MyRegistrationsTabProps) {
  const [activeFilter, setActiveFilter] = useState<RegFilter>("all");
  const go = createTabNavigator(onNavigate);
  const now = Date.now();

  // Fast O(1) Event Lookup Map
  const eventsMap = useMemo(() => {
    const map = new Map<string, EventItem>();
    events.forEach((e) => {
      const id = String(e._id || e.id || "");
      if (id) map.set(id, e);
    });
    return map;
  }, [events]);

  // Active registrations
  const activeRegistrations = useMemo(() => {
    return (myRegistrations || []).filter(
      (r) => (r.status || "registered").toLowerCase() !== "cancelled"
    );
  }, [myRegistrations]);

  // Dynamic Registration Statistics
  const stats = useMemo(() => {
    let attended = 0;
    let upcoming = 0;

    activeRegistrations.forEach((r) => {
      const status = (r.status || "registered").toLowerCase();
      const ev = eventsMap.get(String(r.eventId));
      const eventTime = ev?.date ? new Date(ev.date).getTime() : NaN;
      const isFuture = !isNaN(eventTime) && eventTime > now;

      if (status === "attended") {
        attended += 1;
      } else if (isFuture || status === "registered") {
        upcoming += 1;
      }
    });

    return {
      total: activeRegistrations.length,
      upcoming,
      attended,
    };
  }, [activeRegistrations, eventsMap, now]);

  // Filtered List
  const filteredList = useMemo(() => {
    if (activeFilter === "all") return activeRegistrations;

    return activeRegistrations.filter((r) => {
      const status = (r.status || "registered").toLowerCase();
      const ev = eventsMap.get(String(r.eventId));
      const eventTime = ev?.date ? new Date(ev.date).getTime() : NaN;
      const isPast = !isNaN(eventTime) && eventTime <= now;

      if (activeFilter === "attended") {
        return status === "attended" || (isPast && status === "registered");
      }
      if (activeFilter === "upcoming") {
        return status === "registered" && (!isPast || isNaN(eventTime));
      }
      return true;
    });
  }, [activeRegistrations, activeFilter, eventsMap, now]);

  return (
    <>
      {dataWarning}

      <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8 text-white">
        {/* Header & Stats */}
        <header className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Passes &amp; Bookings
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-tight flex items-center gap-3">
                <span className="inline-grid place-items-center w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Ticket className="w-5 h-5" aria-hidden="true" />
                </span>
                My Registered Events
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Access your session tickets, venue locations, and verify your event attendance record.
              </p>
            </div>
          </div>

          {/* Dynamic KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="Active Passes"
              value={stats.total}
              hint="total event bookings"
              icon={<BookmarkCheck className="w-4 h-4 text-emerald-400" />}
              color="text-white"
            />
            <StatCard
              label="Upcoming Sessions"
              value={stats.upcoming}
              hint="scheduled & ready"
              icon={<Calendar className="w-4 h-4 text-emerald-400" />}
              color="text-emerald-400"
            />
            <StatCard
              label="Attended Events"
              value={stats.attended}
              hint="completed activities"
              icon={<CheckCircle2 className="w-4 h-4 text-blue-400" />}
              color="text-blue-400"
            />
          </div>
        </header>

        {/* Filter Controls */}
        {activeRegistrations.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            <span className="flex items-center gap-1 text-slate-500 pr-2">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {(["all", "upcoming", "attended"] as RegFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-xl uppercase tracking-wider font-semibold border transition-all ${
                  activeFilter === f
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm"
                    : "bg-[#03070E] border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Registrations Grid */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map((r: RegistrationItem, idx: number) => {
              const uniqueKey = r._id || r.id || `reg-${idx}`;
              const ev = eventsMap.get(String(r.eventId));
              const theme = (ev?.type && EVENT_TYPE_THEMES?.[ev.type]) || DEFAULT_EVENT_THEME;
              const status = (r.status || "registered").toLowerCase();
              const style = STATUS_STYLES[status] || DEFAULT_STATUS_STYLE;

              const title = r.eventTitle || ev?.title || "Club Event";
              const formattedDate = ev?.date
                ? (typeof formatLongDate === "function" ? formatLongDate(ev.date) : ev.date)
                : r.registeredAt || "Schedule TBA";

              return (
                <article
                  key={uniqueKey}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#03070E] via-[#04091a] to-[#03070E] hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-0.5"
                >
                  {/* Card Header Media or Theme Strip */}
                  <div className="relative h-36 overflow-hidden bg-slate-950">
                    {ev?.image ? (
                      <img
                        src={ev.image}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`w-full h-full grid place-items-center bg-linear-to-br ${theme.from || "from-slate-900"} ${theme.to || "to-slate-950"}`}>
                        <Ticket className="w-12 h-12 opacity-30 text-white" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-[#03070E] via-[#03070E]/50 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${style.badge} backdrop-blur-md`}
                      >
                        {style.icon}
                        {r.status || style.label}
                      </span>
                    </div>

                    {/* Event Category Chip */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 border border-white/10 text-emerald-400 backdrop-blur-md">
                        <Sparkles className="w-3 h-3" />
                        {ev?.type || "Event"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 p-5 space-y-3.5">
                    <h2 className="font-display font-extrabold text-base sm:text-lg text-white leading-snug line-clamp-2">
                      {title}
                    </h2>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{formattedDate}</span>
                      </div>

                      {ev?.time && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="truncate">{ev.time}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                        <span className="truncate">{ev?.location || "Club Lab / Main Auditorium"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer / Navigation Action */}
                  <div className="px-5 pb-5">
                    <button
                      type="button"
                      onClick={() => go("events")}
                      className="w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-mono font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-emerald-500/30 hover:text-emerald-300 transition-all"
                    >
                      <span>View Event Briefing</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#03070E]/60 p-12 text-center space-y-3">
            <Ticket className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="font-display font-bold text-base text-white">
              {activeFilter === "all"
                ? "You haven't registered for any events yet"
                : `No registrations found under "${activeFilter}"`}
            </h3>
            <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
              Explore available workshops and briefings in the Events tab to reserve your pass.
            </p>
            {activeFilter === "all" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => go("events")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                >
                  Explore Events
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-[#03070E] border border-white/10 p-4 rounded-2xl space-y-1">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-display font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] font-mono text-slate-500">{hint}</div>
    </div>
  );
}