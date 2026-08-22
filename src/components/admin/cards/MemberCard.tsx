import React, { useState } from "react";
import {
  Check,
  Eye,
  Mail,
  Phone,
  ShieldCheck,
  ShieldOff,
  Trash2,
  GraduationCap,
  Calendar,
  Copy,
  Crown,
  Sparkles,
  ArrowUpRight,
  IdCard
} from "lucide-react";
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
    phone?: string;
    studentId?: string;
    batch?: string;
    bio?: string;
    joinedAt?: string;
    createdAt?: string;
  };
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

function formatJoinDate(dateString?: string) {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function MemberCard({
  member,
  onView,
  onApprove,
  onToggleRole,
  onDelete,
}: MemberCardProps) {
  const [copied, setCopied] = useState(false);

  const name = member.name || member.displayName || "Anonymous Member";
  const memberCode = member.memberId || member.studentId || member.id || member._id;
  const status = (member.status || "pending").toLowerCase();
  const role = (member.role || "member").toLowerCase();

  const isPending = status === "pending";
  const isAdmin = role === "admin" || role === "lead" || role === "president";
  const joinDate = formatJoinDate(member.joinedAt || member.createdAt);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (memberCode) {
      navigator.clipboard.writeText(memberCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl">
      
      {/* Top Banner Accent */}
      <div className={cn(
        "h-20 w-full relative overflow-hidden bg-gradient-to-r",
        isAdmin 
          ? "from-amber-500/25 via-primary/20 to-orange-500/25" 
          : "from-teal-500/20 via-emerald-500/15 to-sky-500/20"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-60" />
        
        {/* Floating Role Badge on Top-Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isAdmin ? (
            <span className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-sm">
              <Crown className="w-3 h-3 fill-amber-300 text-amber-300" />
              {member.role || "Admin"}
            </span>
          ) : (
            <Badge variant="outline" className="border-white/15 bg-black/40 text-[11px] backdrop-blur-md font-medium text-foreground">
              {member.role || "Member"}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Body Info */}
      <div className="px-5 pb-5 -mt-10 space-y-4 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Avatar & Status Indicator */}
          <div className="flex items-end justify-between">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-card shadow-xl">
                {member.photoURL && (
                  <AvatarImage src={member.photoURL} alt={name} className="object-cover" />
                )}
                <AvatarFallback className="bg-gradient-to-br from-teal-500/30 to-emerald-600/30 text-teal-300 text-xl font-bold font-display">
                  {initials(name)}
                </AvatarFallback>
              </Avatar>

              {/* Status Dot */}
              <span
                className={cn(
                  "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-card shadow-sm",
                  isPending ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                )}
                title={`Status: ${member.status || "Pending"}`}
              />
            </div>

            {/* Status Pill */}
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase",
                isPending
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              )}
            >
              {member.status || "Pending"}
            </span>
          </div>

          {/* Identity & Name */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h3 
                onClick={onView}
                className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors cursor-pointer truncate"
              >
                {name}
              </h3>
              {isAdmin && <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />}
            </div>

            {/* Member ID / Student ID with Copy */}
            {memberCode && (
              <button
                type="button"
                onClick={handleCopyId}
                className="mt-0.5 inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-teal-400 transition-colors group/id"
                title="Click to copy ID"
              >
                <IdCard className="w-3 h-3 text-teal-400" />
                <span>{memberCode}</span>
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-0 group-hover/id:opacity-100 transition-opacity" />
                )}
              </button>
            )}
          </div>

          {/* Department & Batch Chips */}
          {(member.department || member.batch) && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {member.department && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                  <GraduationCap className="w-3 h-3 text-sky-400" />
                  {member.department}
                </span>
              )}
              {member.batch && (
                <span className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-xs text-muted-foreground font-mono">
                  Batch {member.batch}
                </span>
              )}
            </div>
          )}

          {/* Bio Preview */}
          {member.bio && (
            <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
              "{member.bio}"
            </p>
          )}

          {/* Contact Details Grid */}
          <div className="mt-3.5 space-y-1.5 text-xs text-muted-foreground">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 hover:text-foreground transition-colors truncate"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{member.email}</span>
              </a>
            )}
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="flex items-center gap-2 hover:text-foreground transition-colors truncate"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{member.phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Card Footer: Join Date & Actions */}
        <div className="pt-4 mt-2 border-t border-white/10 space-y-3">
          
          {/* Quick Approve Bar if Pending */}
          {isPending && onApprove && (
            <button
              type="button"
              onClick={onApprove}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Approve Membership
            </button>
          )}

          <div className="flex items-center justify-between">
            {/* Joined Date */}
            {joinDate ? (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="w-3 h-3 text-muted-foreground/70" />
                <span>Joined {joinDate}</span>
              </div>
            ) : (
              <div />
            )}

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-1">
              {onView && (
                <button
                  type="button"
                  onClick={onView}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                  title="View Profile"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}

              {onToggleRole && (
                <button
                  type="button"
                  onClick={onToggleRole}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isAdmin
                      ? "text-amber-400 hover:bg-amber-500/10"
                      : "text-muted-foreground hover:text-amber-400 hover:bg-white/5"
                  )}
                  title={isAdmin ? "Demote from Admin" : "Promote to Admin"}
                >
                  {isAdmin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}