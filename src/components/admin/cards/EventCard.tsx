import React from "react";
import { Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: {
    _id?: string;
    id?: string;
    title: string;
    type?: string;
    date?: string;
    time?: string;
    location?: string;
    image?: string;
    description?: string;
  };
  onDelete?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  Workshop: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
  Webinar: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400",
  Seminar: "from-violet-500/20 to-fuchsia-500/10 border-violet-500/30 text-violet-400",
  Bootcamp: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
};

export default function EventCard({ event, onDelete }: EventCardProps) {
  const typeClass = TYPE_COLORS[event.type || ""] || TYPE_COLORS.Workshop;
  const hasImage = Boolean(event.image);

  return (
    <div className="glass-card entity-card">
      {/* Cover */}
      <div className="image-well">
        {hasImage ? (
          <img src={event.image} alt={event.title} loading="lazy" />
        ) : (
          <div
            className={cn(
              "w-full h-full grid place-items-center bg-gradient-to-br",
              typeClass
            )}
          >
            <Calendar className="w-12 h-12 opacity-40" />
          </div>
        )}
        <div className="badge-cluster">
          <Badge
            variant="outline"
            className={cn(
              "bg-card/70 backdrop-blur-sm border",
              typeClass.split(" ").slice(-2).join(" ")
            )}
          >
            {event.type || "Workshop"}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-display font-bold text-base text-foreground leading-snug line-clamp-2">
          {event.title}
        </h3>

        <div className="meta-strip">
          <span>
            <Calendar className="w-3 h-3 text-emerald-400" />
            {event.date || "TBD"}
          </span>
          <span>
            <Clock className="w-3 h-3 text-teal-400" />
            {event.time || "10:00 AM"}
          </span>
        </div>
        <div className="meta-strip">
          <span>
            <MapPin className="w-3 h-3 text-lime-400" />
            <span className="truncate">{event.location || "Campus Lab"}</span>
          </span>
        </div>

        {event.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}
      </div>

      {onDelete && (
        <div className="px-5 pb-4">
          <div className="hover-actions relative static p-0 bg-none border-0 flex justify-end">
            <button
              type="button"
              onClick={onDelete}
              className="icon-action is-danger"
              aria-label="Delete event"
              title="Delete event"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}