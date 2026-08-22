 import React, { useState, useMemo } from "react";
import {
  User,
  Award,
  CreditCard,
  Calendar,
  Mail,
  GraduationCap,
  Sparkles,
  Percent,
  Copy,
  Check,
  ShieldCheck,
  ClipboardList,
  Flame,
  Phone,
  Hash,
} from "lucide-react";
import DigitalIDCard from "../../../components/DigitalIDCard";
import { ProfileTabProps, StudentProfile, createTabNavigator } from "./memberTabUtils";

export default function MemberProfileView({
  dataWarning,
  student,
  onNavigate,
}: ProfileTabProps) {
  const go = createTabNavigator(onNavigate);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dynamic Level & XP Progress System (Every 100 XP = 1 Level)
  const currentXp = Number(student?.xp) || 0;
  const currentLevel = Math.max(1, Math.floor(currentXp / 100) + 1);
  const xpInCurrentLevel = currentXp % 100;
  const xpProgressPercent = Math.min(100, Math.max(0, xpInCurrentLevel));

  // Dynamic Attendance Calculation / Fallback
  const attendanceRate = Number(
    student?.attendance ?? student?.attendanceRate ?? 80
  );

  // Quick Copy Helper
  const handleCopy = (text: string, key: string) => {
    if (!text || text === "N/A") return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const memberName =
    student?.name || student?.displayName || student?.fullName || "Club Member";
  const memberId =
    student?.id || student?.memberId || student?._id || "JNC-MEM";
  const memberEmail = student?.email || "N/A";
  const memberDept = student?.department || student?.dept || "CSE";
  const memberRole = student?.role || student?.designation || "Member";
  const memberBatch = student?.batch || student?.session || "N/A";
  const memberPhone = student?.phone || student?.contact || "N/A";
  const memberJoined = student?.joinedDate || student?.createdAt || "Recent";

  return (
    <>
      {dataWarning}

      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8 text-white">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold tracking-tight text-white">
                My Member Portal Profile
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Official digital credentials, XP progress, and membership standing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Active Member
            </span>
          </div>
        </header>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ProfileStatCard
            label="Rank / Level"
            value={`Lvl ${currentLevel}`}
            hint={`${xpInCurrentLevel}/100 XP to next`}
            icon={<Flame className="w-4 h-4 text-emerald-400" />}
            color="text-emerald-400"
          />
          <ProfileStatCard
            label="Total XP"
            value={currentXp}
            hint="activity score"
            icon={<Sparkles className="w-4 h-4 text-amber-400" />}
            color="text-amber-300"
          />
          <ProfileStatCard
            label="Attendance"
            value={`${attendanceRate}%`}
            hint="session rate"
            icon={<Percent className="w-4 h-4 text-emerald-400" />}
            color={
              attendanceRate >= 75
                ? "text-emerald-400"
                : attendanceRate >= 50
                ? "text-amber-400"
                : "text-rose-400"
            }
          />
          <ProfileStatCard
            label="Role"
            value={memberRole}
            hint="member status"
            icon={<ShieldCheck className="w-4 h-4 text-blue-400" />}
            color="text-blue-400"
          />
        </div>

        {/* Main Grid: Pass + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Digital ID Pass */}
          <div className="lg:col-span-5 bg-[#03070E] border border-white/10 rounded-3xl p-6 text-center space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Digital Pass Card
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Official
              </span>
            </div>

            <div className="flex justify-center">
              <DigitalIDCard
                memberName={memberName}
                memberId={String(memberId)}
                role={memberRole}
                department={memberDept}
                xp={currentXp}
                joinedDate={memberJoined}
              />
            </div>

            {/* Dynamic XP Progress Bar */}
            <div className="space-y-1.5 text-left pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>XP Level Progression</span>
                <span className="text-emerald-400 font-bold">
                  {xpInCurrentLevel} / 100 XP
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Account Information */}
          <div className="lg:col-span-7 bg-[#03070E] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="font-display font-extrabold text-white text-base">
                Account Information
              </h2>
              <span className="text-xs font-mono text-slate-500">
                Member Record
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              {/* Full Name */}
              <div className="space-y-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Full Name
                </span>
                <p className="text-white font-bold font-sans text-sm truncate">
                  {memberName}
                </p>
              </div>

              {/* Student / Member ID */}
              <div className="space-y-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" /> Member ID
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(memberId), "id")}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Copy ID"
                  >
                    {copiedKey === "id" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <p className="text-emerald-400 font-bold truncate">
                  {String(memberId)}
                </p>
              </div>

              {/* Email Address */}
              <div className="space-y-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> Email Address
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(memberEmail, "email")}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Copy Email"
                  >
                    {copiedKey === "email" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <p className="text-slate-200 font-medium truncate">
                  {memberEmail}
                </p>
              </div>

              {/* Department */}
              <div className="space-y-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-slate-400" /> Department
                </span>
                <p className="text-white font-bold truncate">{memberDept}</p>
              </div>

              {/* Batch / Session */}
              <div className="space-y-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Batch / Session
                </span>
                <p className="text-slate-300 font-bold truncate">{memberBatch}</p>
              </div>

              {/* Contact Phone (if available) */}
              {memberPhone !== "N/A" && (
                <div className="space-y-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> Contact
                  </span>
                  <p className="text-slate-300 font-bold truncate">{memberPhone}</p>
                </div>
              )}

              {/* Membership Date */}
              <div className="space-y-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Member Since
                </span>
                <p className="text-slate-300 font-bold truncate">{memberJoined}</p>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => go("cert")}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs rounded-2xl border border-white/10 flex items-center gap-2 transition-colors"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>My Certificates</span>
              </button>

              <button
                type="button"
                onClick={() => go("attendance")}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs rounded-2xl border border-white/10 flex items-center gap-2 transition-colors"
              >
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>Attendance Log</span>
              </button>

              <button
                type="button"
                onClick={() => go("payment")}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <CreditCard className="w-4 h-4" />
                <span>Dues &amp; Payments</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileStatCard({
  label,
  value,
  hint,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-[#03070E] border border-white/10 p-3.5 sm:p-4 rounded-2xl space-y-1">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className={`text-xl sm:text-2xl font-display font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] font-mono text-slate-500">{hint}</div>
    </div>
  );
}