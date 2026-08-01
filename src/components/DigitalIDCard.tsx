import React, { useState } from "react";
import { Shield, Sparkles, Cpu } from "lucide-react";

interface DigitalIDCardProps {
  memberName: string;
  memberId: string;
  role: string;
  department: string;
  xp: number;
  joinedDate: string;
}

export default function DigitalIDCard({
  memberName,
  memberId,
  role,
  department,
  xp,
  joinedDate,
}: DigitalIDCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="perspective-1000 flex justify-center py-2">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 0.1s ease-out",
        }}
        className="w-full max-w-sm bg-linear-to-b from-slate-900 via-[#03070E] to-black border border-white/15 rounded-3xl p-6 text-left space-y-6 relative overflow-hidden shadow-2xl shadow-orange-600/10 cursor-pointer select-none group"
      >
        <div className="absolute inset-0 bg-linear-to-tr from-orange-500/10 via-transparent to-blue-500/10 pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-xs tracking-wider">JSTU NetClub</h4>
              <p className="text-[7px] text-slate-500 font-mono tracking-widest uppercase">Certified Node</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[9px] font-extrabold rounded-full">
            {xp} XP
          </span>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl border-2 border-orange-500/40 overflow-hidden bg-slate-950 p-1 shrink-0 shadow-lg">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${memberName}`}
                alt="avatar"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-extrabold text-white text-sm truncate">{memberName}</h3>
              <p className="text-[10px] text-orange-400 font-mono font-bold truncate">{role}</p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">{department} Department</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-[9px]">
            <div className="bg-white/5 p-2 rounded-xl">
              <span className="text-slate-500 block">NODE ID</span>
              <span className="font-bold text-white tracking-wider">{memberId}</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl">
              <span className="text-slate-500 block">ENROLLED</span>
              <span className="font-bold text-slate-300">{joinedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 relative z-10 border-t border-white/5">
          <div className="flex items-center space-x-1.5 text-[8px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>SECURE SHARD ACTIVE</span>
          </div>
          <Cpu className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}