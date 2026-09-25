import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  Receipt,
  Share2,
  Ticket,
  TriangleAlert,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchApiJson } from "@/lib/api";
import { swalToast } from "@/lib/swal";
import {
  formatEventDate,
  getEventTiming,
  resolveEventCover,
  resolveEventWhen,
} from "@/lib/eventSchedule";

// Re-exported so existing importers of these helpers keep working; the
// implementations live in lib/eventSchedule alongside the schedule maths.
export { formatEventDate, resolveEventCover, resolveEventWhen };

/**
 * Public event details — /events/:id
 *
 * Reached from the "View details" link on the home page. Deliberately a real
 * route rather than a modal so an event can be shared, bookmarked and opened
 * from outside the app, and so there is room for the full description.
 *
 * Public: no auth required to read. The register CTA points into the
 * dashboard, which sends visitors through login if they aren't signed in.
 */

interface EventRecord {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  type?: string;
  category?: string;
  status?: string;
  location?: string;
  capacity?: number | string;
  fee?: number | string;
  price?: number | string;
  time?: string;
  // The schedule and banner have been stored under several names over time.
  date?: string;
  eventDate?: string;
  startDate?: string;
  image?: string;
  imageUrl?: string;
  coverImage?: string;
  [key: string]: unknown;
}

const STATUS_TONE: Record<string, string> = {
  upcoming: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  ongoing: "border-teal-500/40 bg-teal-500/10 text-teal-400",
  completed: "border-slate-500/40 bg-slate-500/10 text-muted-foreground",
  cancelled: "border-rose-500/40 bg-rose-500/10 text-rose-400",
};

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery<EventRecord>({
    queryKey: ["event", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const raw = await fetchApiJson<any>(`/api/events/${id}`);
      return raw?.event || raw?.data || raw;
    },
  });

  const cover = event ? resolveEventCover(event) : "";
  const when = event ? resolveEventWhen(event) : "";
  const timing = getEventTiming(event);
  const status = (event?.status || "upcoming").toLowerCase();
  const feeRaw = event?.fee ?? event?.price;
  const fee = Number(feeRaw);
  const hasFee = Number.isFinite(fee) && fee > 0;
  const body =
    (typeof event?.description === "string" && event.description.trim()) ||
    (typeof event?.content === "string" && event.content.trim()) ||
    "";

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event?.title || "Event", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      swalToast("Link copied");
    } catch {
      /* the user dismissed the share sheet, or the clipboard is blocked */
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-8">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading event…
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="page-shell max-w-2xl">
        <div className="empty-state">
          <TriangleAlert className="mx-auto mb-3 h-8 w-8 text-amber-500" />
          <h1 className="font-display text-lg font-bold text-foreground">
            Event not found
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(error as Error)?.message ||
              "This event may have been removed or the link is out of date."}
          </p>
          <Button onClick={() => navigate("/#events")} className="mt-5 gap-2 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Button>
        </div>
      </div>
    );
  }

  const kind = event.type || event.category;

  return (
    <>
      <Helmet>
        <title>{event.title ? `${event.title} — JSTU Networking Club` : "Event"}</title>
        {body && <meta name="description" content={body.slice(0, 160)} />}
      </Helmet>

      <div className="page-shell max-w-4xl">
        <Link
          to="/#events"
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All events
        </Link>

        <article className="page-surface">
          {/* Hero */}
          {cover ? (
            <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-80">
              <img
                src={cover}
                alt={event.title || "Event cover"}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {kind && (
                    <Badge className="border-emerald-500/40 bg-emerald-500/20 font-mono text-[10px] uppercase tracking-widest text-emerald-200 backdrop-blur-md">
                      {kind}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] uppercase tracking-widest backdrop-blur-md ${
                      STATUS_TONE[status] || STATUS_TONE.upcoming
                    }`}
                  >
                    {status}
                  </Badge>
                </div>
                <h1 className="font-display text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
                  {event.title || "Untitled event"}
                </h1>
              </div>
            </div>
          ) : (
            <header className="border-b border-border px-4 py-6 sm:px-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {kind && (
                  <Badge className="border-primary/30 bg-primary/10 font-mono text-[10px] uppercase tracking-widest text-primary">
                    {kind}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`font-mono text-[10px] uppercase tracking-widest ${
                    STATUS_TONE[status] || STATUS_TONE.upcoming
                  }`}
                >
                  {status}
                </Badge>
              </div>
              <h1 className="font-display text-2xl font-black leading-tight text-foreground sm:text-3xl">
                {event.title || "Untitled event"}
              </h1>
            </header>
          )}

          {/* Facts */}
          <dl className="detail-grid border-b border-border px-4 py-5 sm:px-6">
            <div className="detail-cell">
              <dt>
                <CalendarDays className="h-3 w-3" />
                Date
              </dt>
              <dd>{formatEventDate(when)}</dd>
            </div>

            <div className="detail-cell">
              <dt>
                <Clock className="h-3 w-3" />
                Time
              </dt>
              <dd>{event.time || "To be announced"}</dd>
            </div>

            <div className="detail-cell">
              <dt>
                <MapPin className="h-3 w-3" />
                Location
              </dt>
              <dd>{event.location || "To be announced"}</dd>
            </div>

            <div className="detail-cell">
              <dt>
                <Receipt className="h-3 w-3" />
                Registration fee
              </dt>
              <dd>{hasFee ? `৳${fee}` : "Free entry"}</dd>
            </div>

            {event.capacity ? (
              <div className="detail-cell">
                <dt>
                  <Users className="h-3 w-3" />
                  Capacity
                </dt>
                <dd>{event.capacity} seats</dd>
              </div>
            ) : null}
          </dl>

          {/* Description */}
          <div className="px-4 py-6 sm:px-6">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              About this event
            </h2>
            {body ? (
              <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
                {body.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No description has been added for this event yet.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-border px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[11px] text-muted-foreground">
              Registrations are reviewed by an admin before your seat is
              confirmed.
            </p>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                onClick={share}
                className="h-10 gap-2 rounded-xl text-xs sm:text-sm"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                onClick={() =>
                  navigate(`/dashboard/events/${event._id || event.id || id}/register`)
                }
                disabled={timing.isClosed || status === "completed"}
                className="h-10 min-w-[9rem] gap-2 rounded-xl font-semibold text-xs sm:text-sm"
              >
                <Ticket className="h-4 w-4" />
                {timing.isCancelled
                  ? "Cancelled"
                  : timing.isClosed || status === "completed"
                  ? "Registration closed"
                  : "Register"}
              </Button>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
