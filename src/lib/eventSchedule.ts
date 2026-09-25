/**
 * Event field resolution and schedule maths.
 *
 * Events have accumulated several shapes over the life of this project — the
 * banner lives under `image`, `coverImage` or `imageUrl`, and the schedule
 * under `eventDate`, `date` or `startDate`, sometimes with a separate `time`.
 * Every view resolving that itself is how the home page ended up showing no
 * image and the member cards ended up disagreeing about what counts as "past".
 * Resolve it here, once.
 */

export interface EventLike {
  status?: string;
  time?: string;
  date?: string;
  eventDate?: string;
  startDate?: string;
  image?: string;
  imageUrl?: string;
  coverImage?: string;
}

const firstString = (...values: unknown[]): string =>
  (values.find((v) => typeof v === "string" && v.trim()) as string) || "";

/** Banner URL, whichever key it was stored under. */
export function resolveEventCover(ev: Partial<EventLike>): string {
  return firstString(ev.image, ev.coverImage, ev.imageUrl);
}

/**
 * Raw schedule string. `eventDate` wins because it is the only one that
 * carries the time — preferring `date` silently dropped it, which made a
 * 4pm event look like it started at midnight.
 */
export function resolveEventWhen(ev: Partial<EventLike>): string {
  return firstString(ev.eventDate, ev.date, ev.startDate);
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;
const CLOCK = /^(\d{1,2}):(\d{2})/;

/**
 * Parse an event's start as a LOCAL instant.
 *
 * `new Date("2026-09-25")` is parsed as UTC midnight by spec, so for a reader
 * in UTC+6 a date-only event would look like it began at 06:00 local — and an
 * all-day event would flip to "past" first thing in the morning. Building the
 * Date from its parts keeps everything in the reader's own timezone.
 */
function parseLocal(raw: string, time?: string): { at: Date; hasTime: boolean } | null {
  if (!raw) return null;

  const dt = raw.match(DATE_TIME);
  if (dt) {
    const [, y, mo, d, h, mi] = dt;
    return { at: new Date(+y, +mo - 1, +d, +h, +mi), hasTime: true };
  }

  const dOnly = raw.match(DATE_ONLY);
  if (dOnly) {
    const [, y, mo, d] = dOnly;
    const clock = (time || "").match(CLOCK);
    if (clock) {
      return { at: new Date(+y, +mo - 1, +d, +clock[1], +clock[2]), hasTime: true };
    }
    return { at: new Date(+y, +mo - 1, +d), hasTime: false };
  }

  // Anything else (locale strings like "9/25/2026", full ISO with Z…)
  const fallback = new Date(raw);
  if (Number.isNaN(fallback.getTime())) return null;
  return { at: fallback, hasTime: raw.includes("T") || raw.includes(":") };
}

export interface EventTiming {
  /** When the event starts, in the reader's timezone. */
  startsAt: Date | null;
  /** The moment registration closes. */
  closesAt: Date | null;
  /** Whether a clock time is known, or only a calendar day. */
  hasTime: boolean;
  /** No usable date on the record at all. */
  unscheduled: boolean;
  /** The organiser cancelled it. */
  isCancelled: boolean;
  /** Registration is closed: cancelled, or the deadline has passed. */
  isClosed: boolean;
  /** Starts later today. */
  isToday: boolean;
  /** Whole days until the start; negative once it has begun. */
  daysUntil: number | null;
  /** Short human label: "in 3 days", "today", "ended". */
  relative: string;
}

export function getEventTiming(
  ev: Partial<EventLike> | null | undefined,
  now: Date = new Date()
): EventTiming {
  const base: EventTiming = {
    startsAt: null,
    closesAt: null,
    hasTime: false,
    unscheduled: true,
    isCancelled: false,
    isClosed: false,
    isToday: false,
    daysUntil: null,
    relative: "Date to be announced",
  };

  if (!ev) return base;

  const isCancelled = String(ev.status || "").toLowerCase() === "cancelled";
  const parsed = parseLocal(resolveEventWhen(ev), ev.time);

  if (!parsed) {
    // Undated events stay open — an organiser who has not set a date yet
    // should not have registration silently blocked.
    return { ...base, isCancelled, isClosed: isCancelled, relative: isCancelled ? "Cancelled" : base.relative };
  }

  const { at: startsAt, hasTime } = parsed;

  // With a known start time registration closes then. With only a calendar
  // day, it stays open until the end of that day.
  const closesAt = hasTime
    ? startsAt
    : new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate(), 23, 59, 59, 999);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfEvent = new Date(
    startsAt.getFullYear(),
    startsAt.getMonth(),
    startsAt.getDate()
  );
  const daysUntil = Math.round(
    (startOfEvent.getTime() - startOfToday.getTime()) / 86_400_000
  );

  const isClosed = isCancelled || now.getTime() > closesAt.getTime();
  const isToday = daysUntil === 0;

  let relative: string;
  if (isCancelled) relative = "Cancelled";
  else if (isClosed) relative = daysUntil === 0 ? "Started" : "Ended";
  else if (isToday) relative = "Today";
  else if (daysUntil === 1) relative = "Tomorrow";
  else if (daysUntil > 1 && daysUntil < 30) relative = `In ${daysUntil} days`;
  else relative = "Upcoming";

  return {
    startsAt,
    closesAt,
    hasTime,
    unscheduled: false,
    isCancelled,
    isClosed,
    isToday,
    daysUntil,
    relative,
  };
}

/** Long, readable date — "Friday, 25 September 2026". */
export function formatEventDate(value?: string, fallback = "Date to be announced") {
  if (!value) return fallback;
  const parsed = parseLocal(value);
  if (!parsed) return value;
  return parsed.at.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Compact date — "25 Sep 2026". */
export function formatEventDateShort(value?: string, fallback = "") {
  if (!value) return fallback;
  const parsed = parseLocal(value);
  if (!parsed) return fallback;
  return parsed.at.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Day number and short month, for a calendar-plate style badge. */
export function eventDateParts(ev: Partial<EventLike>): { day: string; month: string } {
  const parsed = parseLocal(resolveEventWhen(ev), ev.time);
  if (!parsed) return { day: "--", month: "TBA" };
  return {
    day: String(parsed.at.getDate()).padStart(2, "0"),
    month: parsed.at.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
  };
}
