import React, { useState } from "react";
import { Search, Layers, Shield, CreditCard, Home, LogIn, X, Facebook, Mail, Network } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: "home" | "login" | "dashboard" | "admin" | "payment" | "lab") => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const commands = [
    { id: "dashboard", label: "Go to Dashboard Console", icon: <Layers className="w-4 h-4 text-orange-400" />, action: () => { onNavigate("dashboard"); onClose(); } },
    { id: "admin", label: "Open Admin Auditor Panel", icon: <Shield className="w-4 h-4 text-blue-400" />, action: () => { onNavigate("admin"); onClose(); } },
    { id: "payment", label: "Settle Club Subscription / Dues", icon: <CreditCard className="w-4 h-4 text-emerald-400" />, action: () => { onNavigate("payment"); onClose(); } },
    { id: "home", label: "Return to Home Workspace", icon: <Home className="w-4 h-4 text-purple-400" />, action: () => { onNavigate("home"); onClose(); } },
    { id: "lab", label: "Open Network Lab (ARP & Topology)", icon: <Network className="w-4 h-4 text-cyan-400" />, action: () => { onNavigate("lab"); onClose(); } },
    { id: "login", label: "Portal Ingress (Login)", icon: <LogIn className="w-4 h-4 text-slate-400" />, action: () => { onNavigate("login"); onClose(); } },
    {
      id: "facebook",
      label: "Visit Networking Club on Facebook",
      icon: <Facebook className="w-4 h-4 text-[#1877F2]" />,
      action: () => {
        navigate("/connect/facebook");
        onClose();
      },
    },
    {
      id: "contact",
      label: "Open Contact Board (split-flap)",
      icon: <Mail className="w-4 h-4 text-cyan-400" />,
      action: () => {
        navigate("/contact");
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes((query || "").toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fade-in">
      <div className="bg-[#03070E] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 to-transparent pointer-events-none" />

        <div className="flex items-center px-4 py-3.5 border-b border-white/5 relative z-10">
          <Search className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search nodes..."
            className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono"
          />
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 space-y-1 max-h-72 overflow-y-auto custom-scrollbar relative z-10">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-mono">
              No command matching "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-xs text-slate-300 hover:text-white transition-all group font-mono text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-900 border border-white/5 rounded-lg group-hover:border-orange-500/30 transition-colors">
                    {cmd.icon}
                  </div>
                  <span>{cmd.label}</span>
                </div>
                <span className="text-[9px] text-slate-600 group-hover:text-orange-400">Execute ↵</span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-slate-500 relative z-10">
          <span>NAVIGATION PROTOCOL ACTIVE</span>
          <span>ESC TO EXIT</span>
        </div>
      </div>
    </div>
  );
}