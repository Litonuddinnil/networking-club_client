import React from "react";
import { Award, CheckCircle, Download, Wifi } from "lucide-react";
import { ClubMember } from "../types";

interface MemberCardProps {
  member: ClubMember;
  onDownload: () => void;
}

export default function MemberCard({ member, onDownload }: MemberCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#0c1322] to-[#040811] border border-white/10 rounded-3xl p-6 relative overflow-hidden max-w-sm w-full mx-auto shadow-2xl shadow-orange-500/5">
      {/* Decorative Wifi Grid */}
      <div className="absolute top-4 right-4 text-orange-500/15">
        <Wifi className="w-16 h-16 stroke-1 animate-pulse" />
      </div>

      {/* Card Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/35">
          <Wifi className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-white text-xs tracking-tight uppercase">
            JSTU Networking Club
          </h3>
          <p className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
            Connect. Learn. Build. Innovate.
          </p>
        </div>
      </div>

      {/* Main content body */}
      <div className="flex items-start space-x-4 mb-6">
        {/* User photo */}
        <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-orange-500/30 overflow-hidden shrink-0">
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${member.avatar}`}
            alt={member.name}
            className="w-full h-full object-cover bg-[#0a0f1d]"
          />
        </div>

        {/* Credentials */}
        <div className="flex-1 space-y-1 text-xs">
          <div className="font-bold text-white text-sm">{member.name}</div>
          <div className="text-[10px] text-orange-400 font-mono font-medium">{member.role}</div>
          <div className="text-[10px] text-slate-400">
            ID: <span className="font-mono text-white">{member.id}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Department: <span className="text-white font-semibold">{member.department}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Batch: <span className="text-white font-semibold">{member.batch}</span>
          </div>
        </div>
      </div>

      {/* Card Footer Status & QR Code */}
      <div className="flex justify-between items-end border-t border-white/5 pt-4">
        <div>
          <span className="text-[9px] text-slate-500 block uppercase font-mono">Membership Status</span>
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20 mt-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span>Active Member</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">Since: {member.joinedDate}</p>
        </div>

        {/* QR Code Graphic placeholder */}
        <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
          <svg className="w-full h-full text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3z" />
            <path d="M9 3h2v2H9zM13 3h2v2h-2zM9 7h2v2H9zM13 7h2v2h-2zM3 9h2v2H3zM7 9h2v2H7zM11 11h2v2h-2zM3 13h2v2H3zM7 13h2v2H7zM15 11h2v2h-2zM19 11h2v2h-2zM15 15h2v2h-2zM17 19h2v2h-2zM11 17h2v2h-2z" />
          </svg>
        </div>
      </div>

      {/* Download/Print Action button */}
      <button
        onClick={onDownload}
        className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
      >
        <Download className="w-3.5 h-3.5 text-orange-500" />
        <span>Download ID Card</span>
      </button>
    </div>
  );
}
