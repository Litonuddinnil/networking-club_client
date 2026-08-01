import React from "react";
import { Bell, Calendar, Tag } from "lucide-react";
import { NoticeItem } from "../types";

interface ClubNoticesProps {
  notices: NoticeItem[];
}

export default function ClubNoticesView({ notices }: ClubNoticesProps) {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-300">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white tracking-wide flex items-center">
          <Bell className="w-6 h-6 text-orange-500 mr-2.5" />
          Club Notices & Broadcasts
        </h1>
        <p className="text-xs text-slate-500 mt-1">Official announcements from JSTU Networking Club administration.</p>
      </div>

      <div className="space-y-4">
        {(!notices || notices.length === 0) ? (
          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-12 text-center text-xs text-slate-500 font-mono">
            No notices active in the database cluster.
          </div>
        ) : (
          notices.map((notice, idx) => (
            <div key={notice.id || idx} className="bg-[#03070E] border border-white/10 rounded-2xl p-5 space-y-3 hover:border-orange-500/30 transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">{notice.category || "General Notice"}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{notice.date}</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white">{notice.title}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}