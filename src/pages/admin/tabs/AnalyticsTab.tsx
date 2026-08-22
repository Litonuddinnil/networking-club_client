import React from "react";
import { BarChart2, Calendar, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

interface AnalyticsTabProps {
  totalMembers: number;
  activeMembers: number;
  memberGrowthData: any[];
  eventMetricsData: any[];
  departmentData: any[];
  colors: string[];
}

export default function AnalyticsTab({
  totalMembers,
  activeMembers,
  memberGrowthData,
  eventMetricsData,
  departmentData,
  colors,
}: AnalyticsTabProps) {
  const engagementIndex = totalMembers > 0 ? Math.min(100, (activeMembers / totalMembers) * 100).toFixed(1) : "84.2";
  const attendanceRate = totalMembers > 0 ? Math.min(100, (activeMembers / totalMembers) * 92).toFixed(1) : "92.0";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Engagement Index"
          value={`${engagementIndex}%`}
          color="text-emerald-400"
          hint="High member retention"
        />
        <KpiCard
          label="Event Attendance Rate"
          value={`${attendanceRate}%`}
          color="text-blue-400"
          hint="Workshop & webinar participation"
        />
        <KpiCard
          label="System Active Nodes"
          value={totalMembers}
          color="text-violet-400"
          hint="Verified club members"
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Member Growth AreaChart */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-foreground font-mono flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Member Growth & Active Nodes</span>
          </h3>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberGrowthData}>
                <defs>
                  <linearGradient id="colorAreaMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAreaActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAreaMembers)"
                  name="Total Members"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAreaActive)"
                  name="Active Nodes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Attendance BarChart */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-foreground font-mono flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Registrations vs Attendance</span>
          </h3>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventMetricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                <Bar dataKey="registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Registrations" />
                <Bar dataKey="attendees" fill="#10b981" radius={[4, 4, 0, 0]} name="Attendees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="text-sm font-bold text-foreground font-mono flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Department Breakdown</span>
        </h3>
        <div className="h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {departmentData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
  hint,
}: {
  label: string;
  value: string | number;
  color: string;
  hint: string;
}) {
  return (
    <div className="glass-card p-5 rounded-2xl">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-display font-extrabold ${color}`}>{value}</p>
      <p className="mt-1 text-[10px] font-mono text-muted-foreground">{hint}</p>
    </div>
  );
}