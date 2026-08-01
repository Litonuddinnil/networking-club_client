import React from "react";
import { 
  Users, UserCheck, ShieldCheck, Wallet, Calendar, GraduationCap, 
  TrendingUp, Plus, Clock 
} from "lucide-react";

interface AdminOverviewProps {
  members: any[];
  notices: any[];
  events: any[];
  onNavigate: (tab: string) => void;
}

export default function AdminDashboardOverview({ members, notices, events, onNavigate }: AdminOverviewProps) {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === "approved" || m.status === "Active").length;
  const pendingMembers = members.filter(m => m.status === "pending").length;
  const totalCollection = members.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in text-slate-300">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-wide">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here's what's happening with your club today.
          </p>
        </div>

        <button
          onClick={() => onNavigate("admin")}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-orange-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Node</span>
        </button>
      </div>

      {/* Top 6 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="bg-[#03070E] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Members</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-display font-extrabold text-white">{totalMembers.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-400 flex items-center mt-1 font-mono">
              <TrendingUp className="w-3 h-3 mr-1" /> +12.5% vs last month
            </p>
          </div>
        </div>

        <div className="bg-[#03070E] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Active Members</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-display font-extrabold text-white">{activeMembers.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-400 flex items-center mt-1 font-mono">
              <TrendingUp className="w-3 h-3 mr-1" /> +15.3% vs last month
            </p>
          </div>
        </div>

        <div className="bg-[#03070E] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Pending Review</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-display font-extrabold text-white">{pendingMembers}</h3>
            <p className="text-[10px] text-purple-400 flex items-center mt-1 font-mono">
              <Clock className="w-3 h-3 mr-1" /> Awaiting approval
            </p>
          </div>
        </div>

        <div className="bg-[#03070E] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Monthly Collection</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-display font-extrabold text-white">৳ {totalCollection.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-400 flex items-center mt-1 font-mono">
              <TrendingUp className="w-3 h-3 mr-1" /> +18.6% vs last month
            </p>
          </div>
        </div>

        <div className="bg-[#03070E] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Upcoming Events</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-display font-extrabold text-white">{events.length}</h3>
            <p className="text-[10px] text-emerald-400 flex items-center mt-1 font-mono">
              <TrendingUp className="w-3 h-3 mr-1" /> +33.3% vs last month
            </p>
          </div>
        </div>

        <div className="bg-[#03070E] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Ongoing Trainings</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-display font-extrabold text-white">5</h3>
            <p className="text-[10px] text-emerald-400 flex items-center mt-1 font-mono">
              <TrendingUp className="w-3 h-3 mr-1" /> +25.0% vs last month
            </p>
          </div>
        </div>

      </div>

      {/* Middle Section: Revenue Chart & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Revenue Overview</h3>
                <p className="text-[10px] text-slate-500">Track monthly subscription inflows & funds</p>
              </div>
              <span className="text-[10px] font-mono px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-slate-300">
                This Month ▾
              </span>
            </div>

            <div className="h-48 w-full relative flex items-end pt-6">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[9px] font-mono text-slate-500">
                <div className="border-b border-white/10 w-full pb-1">100K</div>
                <div className="border-b border-white/10 w-full pb-1">80K</div>
                <div className="border-b border-white/10 w-full pb-1">60K</div>
                <div className="border-b border-white/10 w-full pb-1">40K</div>
                <div className="border-b border-white/10 w-full pb-1">20K</div>
                <div className="border-b border-white/10 w-full">0</div>
              </div>

              <div className="w-full h-32 relative flex items-end">
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 100">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 80 Q 100 60 200 50 T 400 30 T 500 20 L 500 100 L 0 100 Z" fill="url(#grad)" />
                  <path d="M 0 80 Q 100 60 200 50 T 400 30 T 500 20" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/5 text-center font-mono">
              <div className="bg-white/5 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-500 block">Total Revenue</span>
                <span className="text-xs font-bold text-white">৳ {totalCollection}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-500 block">Total Collected</span>
                <span className="text-xs font-bold text-emerald-400">৳ {totalCollection}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-500 block">Pending Amount</span>
                <span className="text-xs font-bold text-orange-400">৳ 0</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl">
                <span className="text-[9px] text-slate-500 block">Collection Rate</span>
                <span className="text-xs font-bold text-cyan-400">100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">Notice Board</h3>
              <button onClick={() => onNavigate("notices")} className="text-[10px] text-orange-500 hover:text-orange-400 font-bold">
                View All
              </button>
            </div>

            <div className="space-y-3.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
              {notices.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No active notices found.</p>
              ) : (
                notices.map((notice, idx) => (
                  <div key={notice.id || idx} className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl space-y-1">
                    <div className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500 mt-1 shrink-0"></span>
                      <p className="text-xs font-bold text-white line-clamp-2">{notice.title}</p>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono pl-4">{notice.date || "Today"}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}