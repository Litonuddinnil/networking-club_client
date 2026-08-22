import React from "react";
import { Check, Mail, ShieldCheck, ShieldOff, Trash2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: {
    _id?: string;
    id?: string;
    memberId?: string;
    name?: string;
    displayName?: string;
    email?: string;
    department?: string;
    role?: string;
    status?: string;
    photoURL?: string;
  };
  onApprove?: () => void;
  onToggleRole?: () => void;
  onDelete?: () => void;
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "muted"> = {
  active: "success",
  approved: "success",
  Active: "success",
  Approved: "success",
  pending: "warning",
  Pending: "warning",
};

const ROLE_VARIANTS: Record<string, "default" | "accent" | "secondary"> = {
  admin: "default",
  Admin: "default",
  member: "secondary",
  Member: "secondary",
};

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * MemberCard — premium entity card for a club member.
 * Avatar gradient ring + status + role badges + hover-action overlay.
 */
export default function MemberCard({
  member,
  onApprove,
  onToggleRole,
  onDelete,
}: MemberCardProps) {
  const status = (member.status || "pending").toLowerCase();
  const role = (member.role || "member").toLowerCase();
  const isPending = status === "pending";
  const isAdminRole = role === "admin";

  return (
    <div className="glass-card entity-card p-5">
      {/* Top: avatar + identity */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-emerald-500/60 via-teal-400/40 to-lime-400/50 blur-[1px] opacity-80" />
          <Avatar className="relative h-14 w-14 ring-2 ring-background">
            {member.photoURL ? (
              <AvatarImage src={member.photoURL} alt={member.name} />
            ) : null}
            <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-sm font-bold font-mono">
              {initials(member.name || member.displayName)}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
              isPending ? "bg-amber-400" : "bg-emerald-400"
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-foreground truncate">
            {member.name || member.displayName || "Unknown"}
          </h3>
          <p className="text-[11px] font-mono text-emerald-400 truncate">
            {member.memberId || member.id || member._id || "—"}
          </p>
        </div>
      </div>

      {/* Meta strip */}
      <div className="mt-4 space-y-2">
        {member.email && (
          <div className="meta-strip">
            <span>
              <Mail className="w-3 h-3 text-emerald-400" />
              <span className="truncate">{member.email}</span>
            </span>
          </div>
        )}
        {member.department && (
          <div className="meta-strip">
            <span>
              <User className="w-3 h-3 text-teal-400" />
              <span>{member.department}</span>
            </span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge
          variant={ROLE_VARIANTS[member.role || "member"] || "secondary"}
        >
          {member.role || "Member"}
        </Badge>
        <Badge variant={STATUS_VARIANTS[member.status || ""] || "muted"}>
          {member.status || "Pending"}
        </Badge>
      </div>

      {/* Hover action overlay */}
      <div className="hover-actions justify-end pt-4 mt-4 border-t border-white/5">
        {isPending && onApprove && (
          <button
            type="button"
            onClick={onApprove}
            className="icon-action"
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
            className={cn("icon-action", isAdminRole && "text-amber-400")}
            title={isAdminRole ? "Demote to member" : "Promote to admin"}
            aria-label="Toggle role"
          >
            {isAdminRole ? (
              <ShieldOff className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="icon-action is-danger"
            title="Delete member"
            aria-label="Delete member"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}