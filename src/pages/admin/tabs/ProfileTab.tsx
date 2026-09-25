import React from "react";
import { Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileTabProps {
  adminName: string;
  adminEmail: string;
  role?: string;
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfileTab({ adminName, adminEmail, role }: ProfileTabProps) {
  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-2xl space-y-6 animate-fade-in">
      <header className="flex items-center gap-4 pb-4 border-b border-white/5">
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-full bg-linear-to-br from-emerald-500/60 via-teal-400/40 to-lime-400/50 blur-[1px] opacity-80" />
          <Avatar className="relative h-16 w-16 ring-2 ring-background">
            <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-lg font-bold font-mono">
              {initials(adminName)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h2 className="font-display font-extrabold text-xl text-foreground">
            Admin Profile
          </h2>
          <p className="text-xs font-mono text-muted-foreground">Admin · JSTU Networking Club</p>
        </div>
      </header>

      <div className="space-y-4">
        <FieldRow
          icon={<UserIcon className="w-3.5 h-3.5" />}
          label="Full Name"
          value={adminName}
          readOnly
        />
        <FieldRow
          icon={<Mail className="w-3.5 h-3.5" />}
          label="Email Address"
          value={adminEmail}
          readOnly
        />
        <div className="flex items-center justify-between p-4 bg-background/60 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Assigned Role
            </span>
          </div>
          <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono rounded-lg uppercase text-[10px]">
            {role || "Admin"}
          </span>
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  icon,
  label,
  value,
  readOnly,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1 inline-flex items-center gap-2">
        <span className="text-emerald-400">{icon}</span>
        {label}
      </label>
      <input
        type="text"
        defaultValue={value}
        readOnly={readOnly}
        className={`w-full bg-background/60 border border-white/10 p-3 rounded-xl outline-none font-mono ${
          readOnly ? "text-muted-foreground" : "text-foreground focus:border-emerald-500"
        }`}
      />
    </div>
  );
}