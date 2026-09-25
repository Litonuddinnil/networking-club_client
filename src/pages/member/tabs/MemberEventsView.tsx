import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Ban,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Hourglass,
  MapPin,
  Radio,
  Sparkles,
  Ticket,
  XCircle,
} from "lucide-react";
import {
  EventsTabProps,
  RegistrationItem,
  EVENT_TYPE_THEMES,
  DEFAULT_EVENT_THEME,
  createTabNavigator,
} from "./memberTabUtils";
import {
  eventDateParts,
  formatEventDateShort,
  getEventTiming,
  resolveEventCover,
  resolveEventWhen,
} from "@/lib/eventSchedule";

/**
 * MemberEventsView
 * ----------------
 * Member events overview: header, an at-a-glance stat row, and a card grid.
 *
 * Whether registration is open is decided entirely by `getEventTiming`, the
 * same helper the public page and the API use, so the button state, the badge
 * and the server all agree on what "past" means.
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

  // Map eventId -> my registration for that event. The card needs the whole
  // record, not just a boolean, so it can show "awaiting approval" separately
  // from "approved" — a submission is not a confirmed seat.
  const myRegistrationByEvent = useMemo(() => {
    const map = new Map<string, RegistrationItem>();
    for (const r of myRegistrations || []) {
      if (!r) continue;
      if ((r.status || "").toLowerCase() === "cancelled") continue;
      const sameEmail = Boolean(myEmail && (r.memberEmail || "").toLowerCase() === myEmail);
      const sameId = Boolean(myStudentId && String(r.memberId || "") === String(myStudentId));
      if (sameEmail || sameId) map.set(String(r.eventId), r);
    }
    return map;
  }, [myRegistrations, myEmail, myStudentId]);

  const go = createTabNavigator(onNavigate);
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  /**
   * Sort soonest-first and push closed events to the bottom, then derive the
   * counts from the same timings the cards use — the old version counted
   * "live/past" off `ev.date` alone, which ignored `eventDate` and so
   * disagreed with what each card displayed.
   */
  const decorated = useMemo(() => {
    const now = new Date();
    return events
      .map((ev, idx) => {
        const eventId = String(ev._id || ev.id || idx);
        return {
          ev,
          eventId,
          timing: getEventTiming(ev as any, now),
          registration: myRegistrationByEvent.get(eventId),
        };
      })
      .sort((a, b) => {
        if (a.timing.isClosed !== b.timing.isClosed) return a.timing.isClosed ? 1 : -1;
        const at = a.timing.startsAt?.getTime() ?? Infinity;
        const bt = b.timing.startsAt?.getTime() ?? Infinity;
        // Open events: soonest first. Closed events: most recent first.
        return a.timing.isClosed ? bt - at : at - bt;
      });
  }, [events, myRegistrationByEvent]);

  const stats = useMemo(() => {
    let open = 0;
    let closed = 0;
    let today = 0;
    for (const d of decorated) {
      if (d.timing.isClosed) closed += 1;
      else {
        open += 1;
        if (d.timing.isToday) today += 1;
      }
    }
    return {
      total: decorated.length,
      open,
      closed,
      today,
      booked: myRegistrationByEvent.size,
    };
  }, [decorated, myRegistrationByEvent]);

  return (
    <>
      {dataWarning}

      <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Event Stream · {currentYear}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-foreground tracking-tight leading-tight flex items-center gap-3">
              <span className="inline-grid place-items-center w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </span>
              Club Events &amp; Workshops
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Registration closes when an event starts. Book a seat, then track
              approval under My Registrations.
            </p>
          </div>

          {/* Stat row — counts that answer a question, not just totals. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<Ticket className="w-4 h-4" />}
              tone="emerald"
              label="Open now"
              value={stats.open}
              hint={stats.today > 0 ? `${stats.today} starting today` : "accepting sign-ups"}
            />
            <StatCard
              icon={<CalendarCheck className="w-4 h-4" />}
              tone="teal"
              label="My bookings"
              value={stats.booked}
              hint="submitted or approved"
            />
            <StatCard
              icon={<Sparkles className="w-4 h-4" />}
              tone="blue"
              label="Scheduled"
              value={stats.total}
              hint="events in total"
            />
            <StatCard
              icon={<Radio className="w-4 h-4" />}
              tone="slate"
              label="Closed"
              value={stats.closed}
              hint="started or ended"
            />
          </div>
        </header>

        {/* Events grid */}
        {decorated.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {decorated.map(({ ev, eventId, timing, registration }) => (
              <EventCard
                key={eventId}
                ev={ev}
                timing={timing}
                registration={registration}
                onRegister={() => navigate(`/dashboard/events/${eventId}/register`)}
                onOpenBooking={() => go("my-events")}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-display font-bold text-base text-foreground">
              No scheduled events at this time
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-1 max-w-sm mx-auto">
              Check back soon for new club sessions, workshops, and meetups.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Card                                     */
/* -------------------------------------------------------------------------- */

interface EventCardProps {
  ev: any;
  timing: ReturnType<typeof getEventTiming>;
  registration?: RegistrationItem;
  onRegister: () => void;
  onOpenBooking: () => void;
}

function EventCard({
  ev,
  timing,
  registration,
  onRegister,
  onOpenBooking,
}: EventCardProps) {
  const theme = (ev.type && EVENT_TYPE_THEMES[ev.type]) || DEFAULT_EVENT_THEME;
  const banner = resolveEventCover(ev);
  const when = resolveEventWhen(ev);
  const { day, month } = eventDateParts(ev);

  const regStatus = (registration?.status || "").toLowerCase();
  const isRegistered = Boolean(registration);
  const isPending = regStatus === "pending";
  const isApproved = regStatus === "approved" || regStatus === "registered";
  const isRejected = regStatus === "rejected";

  // Registration is open unless the deadline passed or it was cancelled.
  // Someone who already applied always keeps a route back to their booking.
  const canRegister = !timing.isClosed && !isRegistered;
  const actionDisabled = !isRegistered && timing.isClosed;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-card/70 backdrop-blur-xl transition-all duration-300 ${
        timing.isClosed
          ? "border-border opacity-[0.72] hover:opacity-100"
          : "border-border hover:border-emerald-500/45 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10"
      }`}
    >
      {/* Accent rail — colour-codes the event type down the left edge. */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 bottom-0 z-10 w-1 bg-linear-to-b ${theme.from} ${theme.to}`}
      />

      {/* Media */}
      <div className="relative h-44 overflow-hidden">
        {banner ? (
          <img
            src={banner}
            alt=""
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 ${
              timing.isClosed ? "grayscale-[0.55]" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className={`w-full h-full grid place-items-center bg-linear-to-br ${theme.from} ${theme.to}`}>
            <Calendar className="w-14 h-14 opacity-25" aria-hidden="true" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-card via-card/45 to-transparent" />

        {/* Calendar plate — the date is what people scan for first. */}
        <div className="absolute top-3 left-3 rounded-2xl border border-white/15 bg-black/60 px-3 py-1.5 text-center leading-none backdrop-blur-md">
          <div className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">
            {month}
          </div>
          <div className="font-display text-xl font-extrabold text-white">{day}</div>
        </div>

        {/* Countdown / state pill */}
        <div className="absolute top-3 right-3">
          <StatePill
            timing={timing}
            isPending={isPending}
            isApproved={isApproved}
            isRejected={isRejected}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 pt-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border mb-1.5 ${theme.chip} ${theme.chipText} ${theme.chipBorder} backdrop-blur-md`}
          >
            {ev.type || "Workshop"}
          </span>
          <h3 className="font-display font-extrabold text-lg text-foreground leading-snug line-clamp-2">
            {ev.title}
          </h3>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 px-4 py-4 space-y-3">
        <dl className="space-y-1.5 text-[11px] font-mono">
          <Row icon={<Clock className="w-3.5 h-3.5 text-teal-400" />} label="Starts">
            {formatEventDateShort(when, "Date TBA")}
            {ev.time ? ` · ${ev.time}` : ""}
          </Row>
          <Row icon={<MapPin className="w-3.5 h-3.5 text-lime-400" />} label="Venue">
            {ev.location || "Club Lab"}
          </Row>
        </dl>

        {ev.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {ev.description}
          </p>
        )}

        {isRejected && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[10px] text-rose-300">
            Your application was rejected. You can apply again.
          </p>
        )}
      </div>

      {/* Action */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={isRegistered ? onOpenBooking : onRegister}
          disabled={actionDisabled}
          title={
            actionDisabled
              ? timing.isCancelled
                ? "This event was cancelled"
                : "Registration closed when the event started"
              : undefined
          }
          className={`w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-mono font-bold uppercase tracking-widest transition-all ${
            actionDisabled
              ? "cursor-not-allowed border border-border bg-muted text-muted-foreground"
              : canRegister
              ? "bg-emerald-500 text-black border border-emerald-400 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          <span className="flex items-center gap-2">
            <ActionIcon
              timing={timing}
              isRegistered={isRegistered}
              isPending={isPending}
            />
            <ActionLabel
              timing={timing}
              isRegistered={isRegistered}
              isPending={isPending}
            />
          </span>
          {!actionDisabled && (
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </button>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-[9px] uppercase tracking-widest text-muted-foreground/70">
          {label}
        </dt>
        <dd className="truncate text-foreground/90">{children}</dd>
      </div>
    </div>
  );
}

function StatePill({
  timing,
  isPending,
  isApproved,
  isRejected,
}: {
  timing: ReturnType<typeof getEventTiming>;
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
}) {
  const base =
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md";

  if (isPending)
    return (
      <span className={`${base} bg-amber-500/20 border-amber-500/40 text-amber-300`}>
        <Hourglass className="w-3 h-3" />
        Pending
      </span>
    );
  if (isApproved)
    return (
      <span className={`${base} bg-emerald-500/20 border-emerald-500/40 text-emerald-300`}>
        <CheckCircle2 className="w-3 h-3" />
        Approved
      </span>
    );
  if (isRejected)
    return (
      <span className={`${base} bg-rose-500/20 border-rose-500/40 text-rose-300`}>
        <XCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  if (timing.isCancelled)
    return (
      <span className={`${base} bg-rose-500/15 border-rose-500/30 text-rose-300`}>
        <Ban className="w-3 h-3" />
        Cancelled
      </span>
    );
  if (timing.isClosed)
    return (
      <span className={`${base} bg-slate-500/20 border-slate-400/30 text-slate-300`}>
        <Radio className="w-3 h-3" />
        {timing.relative}
      </span>
    );
  return (
    <span className={`${base} bg-blue-500/20 border-blue-500/40 text-blue-200`}>
      <Clock className="w-3 h-3" />
      {timing.relative}
    </span>
  );
}

function ActionIcon({
  timing,
  isRegistered,
  isPending,
}: {
  timing: ReturnType<typeof getEventTiming>;
  isRegistered: boolean;
  isPending: boolean;
}) {
  const cls = "w-3.5 h-3.5";
  if (isPending) return <Hourglass className={cls} />;
  if (isRegistered) return <CheckCircle2 className={cls} />;
  if (timing.isCancelled) return <Ban className={cls} />;
  if (timing.isClosed) return <Radio className={cls} />;
  return <Ticket className={cls} />;
}

function ActionLabel({
  timing,
  isRegistered,
  isPending,
}: {
  timing: ReturnType<typeof getEventTiming>;
  isRegistered: boolean;
  isPending: boolean;
}) {
  if (isPending) return <>Awaiting approval</>;
  if (isRegistered) return <>View registration</>;
  if (timing.isCancelled) return <>Event cancelled</>;
  if (timing.isClosed) return <>Registration closed</>;
  if (timing.isToday) return <>Register — today</>;
  return <>Register now</>;
}

/* -------------------------------------------------------------------------- */

const TONES: Record<string, { ring: string; text: string; glow: string }> = {
  emerald: {
    ring: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "from-emerald-500/10",
  },
  teal: { ring: "border-teal-500/30", text: "text-teal-300", glow: "from-teal-500/10" },
  blue: { ring: "border-blue-500/30", text: "text-blue-300", glow: "from-blue-500/10" },
  slate: {
    ring: "border-border",
    text: "text-muted-foreground",
    glow: "from-white/[0.03]",
  },
};

function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  tone: string;
}) {
  const t = TONES[tone] || TONES.slate;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${t.ring} bg-linear-to-br ${t.glow} to-transparent p-4`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className={t.text}>{icon}</span>
      </div>
      <div className={`mt-1.5 font-display text-2xl font-extrabold ${t.text}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">{hint}</div>
    </div>
  );
}
