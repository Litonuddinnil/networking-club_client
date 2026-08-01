import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import NetworkBackground from "../components/NetworkBackground";

export default function AuthLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 relative flex flex-col justify-between items-center p-6 font-sans overflow-x-hidden">
      {/* Live Canvas Background */}
      <NetworkBackground />

      {/* Floating Logo header */}
      <header className="w-full max-w-7xl flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white uppercase tracking-wider font-mono">JSTU NetClub</h1>
            <p className="text-[7.5px] font-mono tracking-widest text-slate-500 uppercase leading-none">Interactive Node</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 hover:bg-white/5 border border-transparent hover:border-white/5 px-2.5 py-1 rounded-xl transition-all font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Gate</span>
        </button>
      </header>

      {/* Central form card layout */}
      <div className="w-full max-w-md my-auto relative z-10 py-12">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/5 blur-3xl rounded-full pointer-events-none" />
        <Outlet />
      </div>

      {/* Footer bar */}
      <footer className="w-full max-w-7xl text-center relative z-10 text-[9px] text-slate-600 font-mono">
        <p>JSTU NETWORKING CLUB GATEWAY • SECURED BY CERTIFIED SHA-256 KEYS</p>
      </footer>
    </div>
  );
}
