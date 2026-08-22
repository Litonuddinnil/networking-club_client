import React from "react";
import { ArrowRight, BarChart2, Calendar, FileText, Bell, ImageIcon, Users, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatPill from "@/components/admin/StatPill";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#020408] border border-emerald-500/30 p-3 rounded-xl shadow-2xl text-xs font-mono text-white">
        <p className="font-bold text-emerald-400 mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color || "#10b981" }} className="flex items-center space-x-2">
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface DashboardTabProps {
  totalMembers: number;
  activeMembers: number;
  pendingApprovals: number;
  postsCount: number;
  eventsCount: number;
  galleryCount: number;
  announcementsCount: number;
  members: any[];
  memberGrowthData: any[];
  eventMetricsData: any[];
  departmentData: any[];
  colors: string[];
  adminName: string;
  adminEmail: string;
  onGoMembers?: () => void;
  onGoPosts?: () => void;
  onGoEvents?: () => void;
  onGoAnnouncements?: () => void;
  onGoAnalytics?: () => void;
}

export default function DashboardTab({
  totalMembers,
  activeMembers,
  pendingApprovals,
  postsCount,
  eventsCount,
  galleryCount,
  announcementsCount,
  members,
  memberGrowthData,
  eventMetricsData,
  departmentData,
  colors,
  adminName,
  adminEmail,
  onGoMembers,
  onGoPosts,
  onGoEvents,
  onGoAnnouncements,
  onGoAnalytics,
}: DashboardTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-400">
            Admin Control Center
          </p>
          <h2 className="mt-2 text-2xl font-display font-extrabold text-foreground">
            Welcome back, {adminName.split(" ")[0]} <span className="text-emerald-400">.</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage members, posts, events, and the gallery from one place.
          </p>
        </div>
        {onGoAnalytics && (
          <button
            type="button"
            onClick={onGoAnalytics}
            className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono inline-flex items-center gap-2 self-start sm:self-auto transition"
          >
            <BarChart2 className="w-4 h-4" />
            Open full analytics
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill
          label="Total Members"
          value={totalMembers}
          icon={<Users className="w-4 h-4" />}
          trend={{ value: 12, direction: "up", label: "this month" }}
          hint={`${activeMembers} active`}
        />
        <StatPill
          label="Published Posts"
          value={postsCount}
          icon={<FileText className="w-4 h-4" />}
          hint="Articles in the feed"
        />
        <StatPill
          label="Upcoming Events"
          value={eventsCount}
          icon={<Calendar className="w-4 h-4" />}
          hint="Workshops & seminars"
        />
        <StatPill
          label="Pending Approvals"
          value={pendingApprovals}
          icon={<Bell className="w-4 h-4" />}
          iconColor="text-amber-400"
          hint="Action required"
        />
      </div>

      {/* Charts + recent row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Member Growth */}
        <div className="lg:col-span-8 glass-card p-6 rounded-3xl">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Member Growth Trend</span>
            </h3>
            {onGoAnalytics && (
              <button
                type="button"
                onClick={onGoAnalytics}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl font-mono inline-flex items-center gap-1.5 transition"
              >
                Full Recharts analytics
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberGrowthData}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMembers)"
                  name="Total Members"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent registrations */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-foreground font-mono flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Recent Nodes</span>
          </h3>
          <div className="mt-4 space-y-3">
            {members.slice(0, 4).map((m, idx) => (
              <div
                key={m._id || m.id || m.memberId || idx}
                className="flex items-center justify-between p-3 bg-background/60 rounded-2xl border border-white/5"
              >
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-foreground truncate">
                    {m.name || m.displayName || "Unknown"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {m.department || m.email || "CSE"}
                  </p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-xs text-muted-foreground font-mono">No members yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <QuickLink
          label="Manage members"
          value={totalMembers}
          icon={<Users className="w-4 h-4" />}
          onClick={onGoMembers}
        />
        <QuickLink
          label="Manage posts"
          value={postsCount}
          icon={<FileText className="w-4 h-4" />}
          onClick={onGoPosts}
        />
        <QuickLink
          label="Manage events"
          value={eventsCount}
          icon={<Calendar className="w-4 h-4" />}
          onClick={onGoEvents}
        />
        <QuickLink
          label="Announcements"
          value={announcementsCount}
          icon={<Bell className="w-4 h-4" />}
          onClick={onGoAnnouncements}
        />
      </div>
    </div>
  );
}

function QuickLink({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card entity-card p-4 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 grid place-items-center text-emerald-400">
          {icon}
        </div>
        <span className="text-2xl font-display font-extrabold text-foreground">{value}</span>
      </div>
      <p className="mt-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </button>
  );
}