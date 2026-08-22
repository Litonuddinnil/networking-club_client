 import React from "react";
import { 
  Calendar, 
  Clock, 
  Eye, 
  MapPin, 
  Pencil, 
  Trash2, 
  Users, 
  ArrowUpRight 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: {
    _id?: string;
    id?: string;
    title?: string;
    name?: string;
    description?: string;
    type?: string;
    category?: string;
    date?: string;
    eventDate?: string;
    time?: string;
    venue?: string;
    location?: string;
    imageUrl?: string;
    coverImage?: string;
    status?: string;
    registeredCount?: number;
    capacity?: number;
    createdByName?: string;
    createdBy?: string;
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "accent" | "warning" | "destructive"> = {
  Workshop: "accent",
  Seminar: "secondary",
  Contest: "warning",
  Networking: "default",
  Hackathon: "destructive",
  Meetup: "accent",
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ongoing: "bg-sky-500/10 text-sky-400 border-sky-500/20 animate-pulse",
  completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

function parseDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.toLocaleDateString("en-US", { day: "2-digit" }),
    full: d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
  };
}

export default function EventCard({ event, onView, onEdit, onDelete }: EventCardProps) {
  const cover = event.coverImage || event.imageUrl;
  const type = event.type || event.category || "Event";
  const name = event.title || event.name || "Untitled event";
  const preview = (event.description || "").slice(0, 150);
  
  const dateObj = parseDate(event.eventDate || event.date);
  const statusKey = String(event.status || "upcoming").toLowerCase();
  
  const registered = event.registeredCount ?? 0;
  const capacity = event.capacity;
  const percentage = capacity ? Math.min(Math.round((registered / capacity) * 100), 100) : null;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30">
      
      {/* Top Media / Hero Section (Bigger & Richer) */}
      <div className="relative h-56 w-full overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500/20 via-emerald-500/10 to-card text-teal-400/70">
            <Calendar className="h-16 w-16 stroke-1 opacity-60" />
          </div>
        )}

        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

        {/* Floating Date Badge (Top Left - Modern Event Style) */}
        {dateObj && (
          <div className="absolute top-3.5 left-3.5 flex flex-col items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-1.5 text-white shadow-md">
            <span className="text-[10px] font-bold tracking-wider text-teal-400">{dateObj.month}</span>
            <span className="text-lg font-black leading-none">{dateObj.day}</span>
          </div>
        )}

        {/* Tags & Status (Top Right) */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
          <Badge
            variant={TYPE_VARIANTS[type] || "secondary"}
            className="border border-white/15 bg-black/50 text-xs backdrop-blur-md font-medium"
          >
            {type}
          </Badge>
          {event.status && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                STATUS_COLORS[statusKey] || "bg-card/70 text-foreground"
              }`}
            >
              {event.status}
            </span>
          )}
        </div>

        {/* Time & Location on Image Bottom */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/90">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-teal-400" />
            <span>{event.time || "Time TBA"}</span>
          </div>
          {(event.venue || event.location) && (
            <div className="flex max-w-[55%] items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{event.venue || event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col justify-between p-5 md:p-6 space-y-4">
        <div>
          <h3 
            onClick={onView}
            className="cursor-pointer font-display text-xl font-bold leading-tight text-foreground transition-colors duration-200 hover:text-primary line-clamp-2"
          >
            {name}
          </h3>

          {preview && (
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground/90 line-clamp-2">
              {preview}
            </p>
          )}
        </div>

        {/* Registered / Capacity Progress Section */}
        {capacity ? (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground/80">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                {registered} Registered
              </span>
              <span>{capacity - registered > 0 ? `${capacity - registered} seats left` : "Full"}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ) : typeof event.registeredCount === "number" ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>{registered} registered</span>
          </div>
        ) : null}

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {/* Primary View Action */}
          {onView ? (
            <button
              type="button"
              onClick={onView}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all hover:gap-2 hover:opacity-80"
            >
              View Details
              <ArrowUpRight className="h-4 w-4" />
            </button>
          ) : <div />}

          {/* Quick Edit/Delete Actions */}
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-amber-500/15 hover:text-amber-400"
                title="Edit event"
                aria-label="Edit event"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-rose-500/15 hover:text-rose-400"
                title="Delete event"
                aria-label="Delete event"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}