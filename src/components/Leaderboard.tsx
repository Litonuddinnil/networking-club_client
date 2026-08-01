import React, { useState } from "react";
import { Trophy, Search, Flame } from "lucide-react";
import { ClubMember } from "../types";

interface LeaderboardProps {
  members: ClubMember[];
}

export default function Leaderboard({ members }: LeaderboardProps) {
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const safeMembers = Array.isArray(members) ? members : [];

  const sortedMembers = [...safeMembers].sort((a, b) => (b.xp || 0) - (a.xp || 0));

  const filteredMembers = sortedMembers.filter((m) => {
    const dept = m?.department || "";
    const name = m?.name || "";
    const role = m?.role || "";

    const matchesDept = deptFilter === "ALL" || dept === deptFilter;
    const matchesSearch = 
      name.toLowerCase().includes((search || "").toLowerCase()) || 
      role.toLowerCase().includes((search || "").toLowerCase());

    return matchesDept && matchesSearch;
  });

  const topThree = sortedMembers.slice(0, 3);

  return (
    <div className="bg-[#03070E] border border-white/10 rounded-3xl p-4 sm:p-6 space-y-5 sm:space-y-6 relative overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-linear-to-tr from-amber-500/5 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5 relative z-10">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center">
            <Trophy className="w-4 h-4 text-amber-500 mr-1.5" />
            JSTU Networking Club Merit Leaderboard
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Track CCNA simulator XP & lab activity points</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 min-w-0">
          <div className="flex max-w-full overflow-x-auto scrollbar-hide bg-[#020408] border border-white/10 p-0.5 rounded-xl text-[9px] font-bold">
            {["ALL", "CSE", "EEE", "Social Work", "Management", "Geology", "Fisheries", "Math"].map((dept) => (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  deptFilter === dept
                    ? "bg-orange-600/10 border border-orange-500/20 text-orange-400"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="relative flex items-center bg-[#020408] border border-white/10 rounded-xl px-2.5 py-1.5 w-full sm:w-40">
            <Search className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="bg-transparent outline-none text-[10px] text-white placeholder-slate-600 w-full font-mono"
            />
          </div>
        </div>
      </div>

      {safeMembers.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-500 font-mono relative z-10">
          No members found in the database yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 relative z-10 text-center items-end pt-4 pb-2">
            {topThree[1] && (
              <div className="bg-slate-900/40 border border-white/5 hover:border-orange-500/10 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-between h-[140px] sm:h-[150px] transition-all relative group">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-800 text-slate-400 border border-slate-500/20 flex items-center justify-center font-mono text-[10px] font-bold">
                  2
                </div>
                <div className="w-11 h-11 rounded-full border border-slate-400/30 overflow-hidden bg-slate-950/80 p-0.5 shrink-0 mt-3">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[1].avatar || topThree[1].name}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="font-bold text-white text-[10px] truncate">{topThree[1].name}</p>
                  <p className="text-[8px] text-slate-500 truncate font-mono mt-0.5">{topThree[1].role}</p>
                </div>
                <span className="text-[9.5px] px-2 py-0.5 bg-slate-800/80 border border-white/5 text-orange-400 font-mono font-extrabold rounded-lg">
                  {topThree[1].xp} XP
                </span>
              </div>
            )}

            {topThree[0] && (
              <div className="bg-linear-to-b from-amber-500/10 to-transparent border border-amber-500/20 hover:border-amber-500/30 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-between h-[165px] sm:h-[180px] transition-all relative shadow-xl shadow-amber-500/5 group">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 border border-amber-400 flex items-center justify-center font-mono text-xs font-bold animate-bounce">
                  👑
                </div>
                <div className="w-14 h-14 rounded-full border-2 border-amber-500 overflow-hidden bg-slate-950 p-0.5 shrink-0 mt-3 relative">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[0].avatar || topThree[0].name}`} alt="avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-tr from-amber-500/10 to-transparent pointer-events-none" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="font-bold text-amber-400 text-xs truncate">{topThree[0].name}</p>
                  <p className="text-[9px] text-slate-400 truncate font-mono mt-0.5">{topThree[0].role}</p>
                </div>
                <span className="text-xs px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-extrabold rounded-lg shadow-lg">
                  {topThree[0].xp} XP
                </span>
              </div>
            )}

            {topThree[2] && (
              <div className="bg-slate-900/40 border border-white/5 hover:border-orange-500/10 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-between h-[130px] sm:h-[135px] transition-all relative group">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-800 text-amber-700 border border-amber-700/20 flex items-center justify-center font-mono text-[10px] font-bold">
                  3
                </div>
                <div className="w-10 h-10 rounded-full border border-amber-700/30 overflow-hidden bg-slate-950/80 p-0.5 shrink-0 mt-3">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[2].avatar || topThree[2].name}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="font-bold text-white text-[10px] truncate">{topThree[2].name}</p>
                  <p className="text-[8px] text-slate-500 truncate font-mono mt-0.5">{topThree[2].role}</p>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-slate-800/80 border border-white/5 text-orange-400 font-mono font-extrabold rounded-lg">
                  {topThree[2].xp} XP
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar relative z-10 pr-1">
            {filteredMembers.map((m, idx) => (
              <div
                key={m.id || idx}
                className="flex items-center justify-between p-3 bg-slate-950/50 border border-white/5 hover:border-white/10 rounded-xl text-xs transition-all"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <span className="font-mono text-slate-500 font-bold w-4 text-center">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-white/5 shrink-0">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${m.avatar || m.name}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <p className="font-bold text-white truncate">{m.name}</p>
                      <span className="text-[8px] px-1.5 py-0.1 bg-white/5 text-slate-400 rounded-md font-mono">{m.department}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">{m.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-mono font-extrabold text-orange-400">{m.xp} XP</p>
                    <p className="text-[8px] text-slate-600 font-mono">Mult: {m.attendance > 90 ? "1.2x" : "1.0x"}</p>
                  </div>

                  {m.attendance >= 90 && (
                    <span className="p-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg" title="Active Attendance streak">
                      <Flame className="w-3.5 h-3.5 animate-pulse" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
