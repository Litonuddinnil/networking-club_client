import React from "react";
import {
  Check,
  Eye,
  IdCard,
  Mail,
  ShieldCheck,
  ShieldOff,
  Trash2,
  User as UserIcon,
  Building2,
  CalendarDays,
  Crown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: any;
  onView?: () => void;
  onApprove?: () => void;
  onToggleRole?: () => void;
  onDelete?: () => void;
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(input?: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const isAdminRole = (r?: string) =>
  !!r && ["admin", "lead", "president"].includes(r.toLowerCase());

const isPendingStatus = (s?: string) => !!s && s.toLowerCase() === "pending";

export default function MemberCard({
  member,
  onView,
  onApprove,
  onToggleRole,
  onDelete,
}: MemberCardProps) {
  const name = member.name || member.displayName || "Anonymous";
  const status = (member.status || "pending").toLowerCase();
  const role = (member.role || "member").toLowerCase();
  const isAdmin = isAdminRole(role);
  const isPending = isPendingStatus(status);

  return (
    <article className="glass-card entity-card relative flex flex-col overflow-hidden group">
      {/* Top ambient accent */}
      <div
        className={cn(
          "pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-50",
          isAdmin
            ? "bg-amber-500/15"
            : isPending
            ? "bg-amber-500/10"
            : "bg-emerald-500/12"
        )}
      />

      {/* Header: avatar + identity */}
      <div className="relative z-10 flex flex-col items-center text-center gap-3 p-5 pb-3">
        <div className="relative">
          {isAdmin && (
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-300/70 via-amber-500/50 to-amber-300/60 blur-[2px] opacity-80" />
          )}
          <Avatar
            className={cn(
              "relative h-16 w-16 ring-2 ring-card",
              isAdmin && "ring-amber-400/40"
            )}
          >
            {member.photoURL && (
              <AvatarImage
                src={member.photoURL}
                alt={name}
                className="object-cover"
              />
            )}
            <AvatarFallback
              className={cn(
                "font-display font-bold text-sm",
                isAdmin
                  ? "bg-linear-to-br from-amber-500/30 to-amber-600/20 text-amber-200"
                  : isPending
                  ? "bg-linear-to-br from-amber-500/20 to-amber-600/15 text-amber-300"
                  : "bg-linear-to-br from-teal-500/30 to-emerald-600/30 text-teal-200"
              )}
            >
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="w-full space-y-1">
          <div className="flex items-center justify-center gap-1.5 min-w-0">
            <h3 className="font-display text-base sm:text-lg font-bold leading-tight text-foreground line-clamp-1 group-hover:text-emerald-300 transition-colors">
              {name}
            </h3>
            {isAdmin && (
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
          </div>

          {(member.memberId || member.studentId) && (
            <div className="flex items-center justify-center gap-1 font-mono text-[10px] text-muted-foreground">
              <IdCard className="w-3 h-3 text-teal-400" />
              <span className="truncate">
                {member.memberId || member.studentId}
              </span>
            </div>
          )}

          {/* Status + role badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5">
            <Badge variant={isPending ? "warning" : "success"} size="sm">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isPending ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                )}
              />
              {status}
            </Badge>
            <Badge variant={isAdmin ? "accent" : "muted"} size="sm">
              {isAdmin && <Crown className="w-2.5 h-2.5" />}
              {role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <div className="relative z-10 mx-5 my-1 meta-strip border-t border-white/5 pt-3 flex-col items-start">
        {member.department && (
          <span className="truncate max-w-full">
            <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
            {member.department}
            {member.batch ? (
              <span className="text-muted-foreground/70">
                {" "}· Batch {member.batch}
              </span>
            ) : null}
          </span>
        )}
        {member.email && (
          <span className="truncate max-w-full">
            <Mail className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="truncate">{member.email}</span>
          </span>
        )}
        <span>
          <CalendarDays className="w-3 h-3 text-amber-400" />
          Joined {formatDate(member.joinedAt || member.createdAt)}
        </span>
      </div>

      {/* Quick action row */}
      <div className="relative z-10 flex items-center justify-between gap-2 p-3 border-t border-white/5">
        <div className="flex items-center gap-1">
          {isPending && onApprove && (
            <button
              type="button"
              onClick={onApprove}
              className="icon-action text-emerald-300"
              title="Approve member"
              aria-label="Approve member"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {onToggleRole && (
            <button
              type="button"
              onClick={onToggleRole}
              className={cn(
                "icon-action",
                isAdmin ? "text-amber-300" : "text-muted-foreground"
              )}
              title={isAdmin ? "Demote from Admin" : "Promote to Admin"}
              aria-label={isAdmin ? "Demote from Admin" : "Promote to Admin"}
            >
              {isAdmin ? (
                <ShieldOff className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </button>
          )}
          {onView && (
            <button
              type="button"
              onClick={onView}
              className="icon-action text-sky-300"
              title="View profile"
              aria-label="View profile"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="icon-action is-danger"
            title="Remove member"
            aria-label="Remove member"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </article>
  );
}
