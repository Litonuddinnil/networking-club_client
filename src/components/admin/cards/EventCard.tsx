import React from "react";
import { Calendar, Clock, Eye, MapPin, Pencil, Trash2, Users } from "lucide-react";
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
  "Networking": "default",
  Hackathon: "destructive",
  Meetup: "accent",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "accent" | "warning" | "destructive"> = {
  upcoming: "accent",
  ongoing: "default",
  completed: "secondary",
  cancelled: "destructive",
};

function fmt(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function EventCard({ event, onView, onEdit, onDelete }: EventCardProps) {
  const cover = event.coverImage || event.imageUrl;
  const type = event.type || event.category || "Event";
  const name = event.title || event.name || "Untitled event";
  const preview = (event.description || "").slice(0, 180);

  return (
    <div className="glass-card entity-card p-0 overflow-hidden group">
      <div className="relative h-36 overflow-hidden">
        {cover ? (
          <img src={cover} alt={name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-transparent grid place-items-center text-teal-400/60">
            <Calendar className="w-10 h-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center gap-1.5">
          <Badge variant={TYPE_VARIANTS[type] || "secondary"} className="bg-card/80 backdrop-blur-sm">
            {type}
          </Badge>
          {event.status && (
            <Badge variant={STATUS_VARIANTS[String(event.status).toLowerCase()] || "secondary"} className="bg-card/80 backdrop-blur-sm uppercase">
              {event.status}
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-white/90 font-mono text-[10px] flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          <span>{fmt(event.eventDate || event.date) || "TBD"}</span>
          {event.time && (
            <>
              <span className="opacity-60">·</span>
              <Clock className="w-3 h-3" />
              <span>{event.time}</span>
            </>
          )}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <h3 className="font-display font-bold text-lg text-foreground leading-snug line-clamp-2">
          {name}
        </h3>

        {(event.venue || event.location) && (
          <div className="meta-strip">
            <span>
              <MapPin className="w-3 h-3 text-teal-400" />
              <span className="truncate">{event.venue || event.location}</span>
            </span>
          </div>
        )}

        {typeof event.registeredCount === "number" && (
          <div className="meta-strip">
            <span>
              <Users className="w-3 h-3 text-emerald-400" />
              <span>
                {event.registeredCount} registered{event.capacity ? ` / ${event.capacity}` : ""}
              </span>
            </span>
          </div>
        )}

        {preview && (
          <p className="text-sm text-muted-foreground line-clamp-3">{preview}</p>
        )}

        <div className="hover-actions justify-end pt-3 mt-3 border-t border-white/5">
          {onView && (
            <button type="button" onClick={onView} className="icon-action text-sky-400 hover:bg-sky-500/15" title="View details" aria-label="View details">
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button type="button" onClick={onEdit} className="icon-action text-amber-400 hover:bg-amber-500/15" title="Edit event" aria-label="Edit event">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} className="icon-action is-danger" title="Delete event" aria-label="Delete event">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
