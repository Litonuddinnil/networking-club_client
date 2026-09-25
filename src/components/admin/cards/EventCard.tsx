import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  Eye,
  MapPin,
  Pencil,
  Trash2,
  Users as UsersIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: any;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatLong(input?: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dayOfMonth(input?: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "—";
  return d.getDate().toString().padStart(2, "0");
}

function monthShort(input?: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short" });
}

const STATUS_VARIANT: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  upcoming: "info",
  ongoing: "success",
  past: "muted",
  cancelled: "destructive",
  live: "accent",
};

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  past: "Completed",
  cancelled: "Cancelled",
  live: "Live",
};

const TYPE_VARIANT: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  workshop: "info",
  seminar: "default",
  contest: "accent",
  "e-sports": "accent",
  hackathon: "info",
  meetup: "secondary",
  networking: "default",
};

export default function EventCard({
  event,
  onView,
  onEdit,
  onDelete,
}: EventCardProps) {
  const status = (event.status || "upcoming").toLowerCase();
  const type = (event.type || "").toLowerCase();

  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!event.coverImage && !imgFailed;

  // Events have been stored with the schedule under startDate, eventDate or
  // date depending on when and how they were created. Resolve once so the
  // date plate and the meta strip never disagree — or come out blank.
  const eventWhen =
    (event as any).startDate ||
    (event as any).eventDate ||
    (event as any).date ||
    "";

  return (
    <article className="glass-card entity-card flex flex-col overflow-hidden group">
      {/* Media header */}
      <div
        className={cn(
          "image-well",
          !hasImage && "image-well-shimmer aspect-[16/10]"
        )}
      >
        {hasImage ? (
          <img
            src={event.coverImage}
            alt={event.title || "Event cover"}
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
              <CalendarIcon className="w-6 h-6 text-emerald-400" />
              <div className="text-left">
                <p className="font-display text-lg font-extrabold leading-none text-foreground">
                  {event.title?.slice(0, 24) || "Event"}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  No cover uploaded
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badge cluster */}
        <div className="badge-cluster">
          <Badge variant={STATUS_VARIANT[status] || "info"} size="sm" className="shadow-md">
            {STATUS_LABEL[status] || status}
          </Badge>
          {type && TYPE_VARIANT[type] && (
            <Badge variant={TYPE_VARIANT[type]} size="sm" className="shadow-md">
              {event.type}
            </Badge>
          )}
        </div>

        {/* Date plate */}
        <div className="absolute top-3 right-3 rounded-xl border border-white/15 bg-black/65 px-2.5 py-1.5 text-center leading-none backdrop-blur-md shadow-md">
          <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">
            {monthShort(eventWhen)}
          </p>
          <p className="font-display text-lg font-extrabold text-foreground">
            {dayOfMonth(eventWhen)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 gap-2.5 p-4 sm:p-5">
        {/* Title */}
        <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-emerald-300 transition-colors">
          {event.title || "Untitled Event"}
        </h3>

        {(event.location || event.description) && (
          <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-2">
            {event.description || event.location}
          </p>
        )}

        {/* Meta strip */}
        <div className="meta-strip border-t border-white/5 pt-3 mt-1">
          <span title="Date">
            <CalendarDays className="w-3 h-3 text-emerald-400" />
            {formatLong(eventWhen)}
          </span>
          {event.time && (
            <span title="Time">
              <Clock className="w-3 h-3 text-teal-400" />
              {event.time}
            </span>
          )}
          {event.location && (
            <span title="Location" className="truncate max-w-[160px]">
              <MapPin className="w-3 h-3 text-lime-400" />
              {event.location}
            </span>
          )}
          {typeof event.registrations === "number" && (
            <span title="Registrations">
              <UsersIcon className="w-3 h-3 text-amber-400" />
              {event.registrations} registered
            </span>
          )}
        </div>

        {/* Hover actions */}
        <div className="md:!translate-y-full md:group-hover:!translate-y-0 md:pointer-events-none md:group-hover:pointer-events-auto md:!p-2 md:!bg-transparent md:!backdrop-blur-0 hover-actions !translate-y-0">
          <div className="flex w-full items-center justify-end gap-1.5 pt-2 border-t border-white/5 md:border-0 md:pt-0">
            {onView && (
              <button
                type="button"
                onClick={onView}
                className="icon-action text-sky-300"
                title="View event"
                aria-label="View event"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="icon-action text-amber-300"
                title="Edit event"
                aria-label="Edit event"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="icon-action is-danger"
                title="Delete event"
                aria-label="Delete event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
