 import React, { useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Radio,
  Ticket,
} from "lucide-react";
import {
  EventsTabProps,
  EVENT_TYPE_THEMES,
  DEFAULT_EVENT_THEME,
  formatLongDate,
  createTabNavigator,
} from "./memberTabUtils";

/**
 * MemberEventsView
 * ----------------
 * Member events overview: hero header, statistics summary,
 * and a responsive card grid with registration status badges.
 */
export default function MemberEventsView({
  dataWarning,
  events = [],
  myRegistrations = [],
  student,
  onNavigate,
}: EventsTabProps) {
  const myEmail = (student?.email || "").toLowerCase();
  const myStudentId = student?.id || student?.memberId || student?._id;

  // Memoize registered event ID set for fast lookups
  const registeredEventIds = useMemo(() => {
    return new Set(
      (myRegistrations || [])
        .filter((r) => {
          if (!r) return false;
          if ((r.status || "registered").toLowerCase() === "cancelled") return false;
          const sameEmail = Boolean(myEmail && (r.memberEmail || "").toLowerCase() === myEmail);
          const sameId = Boolean(myStudentId && String(r.memberId || "") === String(myStudentId));
          return sameEmail || sameId;
        })
        .map((r) => String(r.eventId))
    );
  }, [myRegistrations, myEmail, myStudentId]);

  const go = createTabNavigator(onNavigate);

  const now = Date.now();
  const eventsCount = events.length;
  const registeredCount = registeredEventIds.size;

  // Memoize live/past calculation
  const liveCount = useMemo(() => {
    return events.filter((ev) => {
      if (!ev?.date) return false;
      const time = new Date(ev.date).getTime();
      return !isNaN(time) && time <= now;
    }).length;
  }, [events, now]);

  const upcomingCount = Math.max(0, eventsCount - liveCount);
  const currentYear = new Date().getFullYear();

  return (
    <>
      {dataWarning}

      <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8 text-white">
        {/* Header */}
        <header className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-orange-400 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Event Stream · {currentYear}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-tight flex items-center gap-3">
                <span className="inline-grid place-items-center w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shrink-0">
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                </span>
                Upcoming Club Events &amp; Workshops
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Browse scheduled sessions, register for events you want to attend, and manage your registrations in real time.
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<Sparkles className="absolute -top-2 -right-2 w-12 h-12 text-orange-500/10 pointer-events-none" />}
              label="Scheduled"
              value={eventsCount}
              hint="total events"
              accent="text-white"
            />
            <StatCard
              icon={<CheckCircle2 className="absolute -top-2 -right-2 w-12 h-12 text-emerald-500/10 pointer-events-none" />}
              label="Registered"
              value={registeredCount}
              hint="your bookings"
              accent="text-emerald-400"
            />
            <StatCard
              icon={<Radio className="absolute -top-2 -right-2 w-12 h-12 text-rose-500/10 pointer-events-none" />}
              label="Live / Past"
              value={liveCount}
              hint="in progress or ended"
              accent="text-rose-300"
            />
            <StatCard
              icon={<Calendar className="absolute -top-2 -right-2 w-12 h-12 text-blue-500/10 pointer-events-none" />}
              label="Upcoming"
              value={upcomingCount}
              hint="awaiting start"
              accent="text-blue-300"
            />
          </div>
        </header>

        {/* Events Grid / Empty State */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {events.map((ev, idx) => {
              const eventId = String(ev._id || ev.id || idx);
              const theme = (ev.type && EVENT_TYPE_THEMES[ev.type]) || DEFAULT_EVENT_THEME;
              const isRegistered = registeredEventIds.has(eventId);
              const hasImage = Boolean(ev.image);
              
              const eventTimestamp = ev.date ? new Date(ev.date).getTime() : NaN;
              const isPast = !isNaN(eventTimestamp) && eventTimestamp <= now;
              const formattedDate = formatLongDate(ev.date);

              return (
                <article
                  key={eventId}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#03070E] via-[#04091a] to-[#03070E] hover:border-orange-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-0.5"
                >
                  {/* Event Media */}
                  <div className="relative h-48 sm:h-52 overflow-hidden">
                    {hasImage ? (
                      <img
                        src={ev.image}
                        alt={ev.title || "Event banner"}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`w-full h-full grid place-items-center bg-gradient-to-br ${theme.from} ${theme.to}`}>
                        <Calendar className="w-16 h-16 opacity-30 text-white" aria-hidden="true" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#03070E] via-[#03070E]/40 to-transparent" />

                    {/* Type Tag */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${theme.chip} ${theme.chipText} ${theme.chipBorder} backdrop-blur-md`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {ev.type || "Workshop"}
                      </span>
                    </div>

                    {/* Status Tag */}
                    <div className="absolute top-3 right-3">
                      {isRegistered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 backdrop-blur-md">
                          <CheckCircle2 className="w-3 h-3" />
                          Registered
                        </span>
                      ) : isPast ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-300 backdrop-blur-md">
                          <Radio className="w-3 h-3" />
                          Past
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/15 border border-blue-500/30 text-blue-300 backdrop-blur-md">
                          <Clock className="w-3 h-3" />
                          Upcoming
                        </span>
                      )}
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 pt-12">
                      <h3 className="font-display font-extrabold text-lg sm:text-xl text-white leading-snug line-clamp-2 drop-shadow-lg">
                        {ev.title}
                      </h3>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                      <div className="flex items-start gap-2 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest">Date</div>
                          <div className="truncate">{formattedDate}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest">Time</div>
                          <div className="truncate">{ev.time || "TBA"}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-300 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-lime-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest">Venue</div>
                          <div className="truncate">{ev.location || "Club Lab"}</div>
                        </div>
                      </div>
                    </div>

                    {ev.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {ev.description}
                      </p>
                    )}
                  </div>

                  {/* Card Action */}
                  <div className="px-5 pb-5">
                    <button
                      type="button"
                      onClick={() => go("my-events")}
                      className={`w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-mono font-bold uppercase tracking-widest transition-all ${
                        isRegistered
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-orange-500/30 hover:text-orange-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isRegistered ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            View Registration
                          </>
                        ) : (
                          <>
                            <Ticket className="w-3.5 h-3.5" />
                            Open Details
                          </>
                        )}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#03070E]/60 p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h3 className="font-display font-bold text-base text-white">
              No scheduled events at this time
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1 max-w-sm mx-auto">
              Check back soon for new club sessions, workshops, and meetups.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  accent: string;
}

function StatCard({ icon, label, value, hint, accent }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-4">
      {icon}
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`text-2xl font-display font-extrabold mt-1 ${accent}`}>{value}</div>
      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{hint}</div>
    </div>
  );
}