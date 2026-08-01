import React from "react";
import { Activity, Zap, Award, CheckCircle } from "lucide-react";

export default function DashboardStats() {
  const stats = [
    { label: "Simulator Rank", value: "#4", change: "Top 5%", icon: <Zap className="w-4 h-4 text-amber-400" />, color: "from-amber-500/10" },
    { label: "Lab Attendance", value: "92%", change: "+4.2%", icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, color: "from-emerald-500/10" },
    { label: "CCNA Modules", value: "14/18", change: "78% Done", icon: <Activity className="w-4 h-4 text-blue-400" />, color: "from-blue-500/10" },
    { label: "Certifications", value: "2 Earned", change: "Verified", icon: <Award className="w-4 h-4 text-orange-400" />, color: "from-orange-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`bg-[#03070E] border border-white/10 rounded-3xl p-5 space-y-3 relative overflow-hidden shadow-lg backdrop-blur-md group hover:border-orange-500/30 transition-all`}
        >
          <div className={`absolute inset-0 bg-linear-to-tr ${stat.color} to-transparent pointer-events-none opacity-50`} />

          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{stat.label}</span>
            <div className="p-2 bg-slate-900 border border-white/5 rounded-xl group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-xl font-display font-extrabold text-white tracking-wide">{stat.value}</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{stat.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
}