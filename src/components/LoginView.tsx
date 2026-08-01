import React, { useState } from "react";
import {
  ArrowLeft,
  Lock,
  Network,
  Shield,
  User,
  Eye,
  EyeOff,
  Terminal,
  Cpu,
  Wifi,
  Activity,
  Zap,
} from "lucide-react";

interface LoginViewProps {
  onBack: () => void;
  onLoginSuccess: (role: "member" | "admin") => void;
}

export default function LoginView({ onBack, onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState("JNC-2026-0125");
  const [password, setPassword] = useState("123456");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const cu = username.trim();
      const cp = password.trim();
      if (cu === "admin" && cp === "admin123") onLoginSuccess("admin");
      else if (cu === "JNC-2026-0125" && cp === "123456") onLoginSuccess("member");
      else {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setLoading(false);
      }
    }, 700);
  };

  const lines = [
    { icon: Activity, text: "Network health: OPTIMAL" },
    { icon: Wifi, text: "SSIDs online: 14" },
    { icon: Cpu, text: "Cluster load: 42%" },
    { icon: Zap, text: "IoT packets: 12.4k/s" },
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 flex items-center justify-center p-4 md:p-8 relative font-sans overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[140px] animate-blob" />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] animate-blob"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[140px] animate-blob"
          style={{ animationDelay: "8s" }}
        />
      </div>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ff6b00" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
        <div className="hidden lg:flex relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-[#0a0a18] via-[#060614] to-[#0a0a18] p-10 flex-col justify-between noise-overlay">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-orange-500/20 animate-shimmer" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full border border-cyan-500/10 animate-shimmer" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-600/40">
                <Network className="w-6 h-6 text-white" />
                <span className="absolute inset-0 rounded-2xl border border-orange-400 animate-ring" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  JSTU <span className="text-orange-500">NetClub</span>
                </h2>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Interactive Portal · v4.2
                </p>
              </div>
            </div>

            <h3 className="text-3xl xl:text-4xl font-extrabold mt-12 leading-tight">
              <span className="block text-white">Welcome to the</span>
              <span className="block text-gradient-animated">Network.</span>
            </h3>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-sm">
              Authenticate to access your dashboard, lab gear, and the club's
              mission control panel.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
              ▸ Live status
            </div>
            {lines.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <l.icon size={14} className="text-orange-400" />
                </div>
                <span className="text-xs font-mono text-slate-300">{l.text}</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div
          className={`relative gradient-border rounded-3xl p-8 md:p-10 bg-[#060b14]/80 backdrop-blur-xl shadow-2xl shadow-orange-500/10 ${
            shake ? "animate-shake" : ""
          }`}
        >
          <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}.animate-shake{animation:shake 0.5s}`}</style>

          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                <Network className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">
                JSTU <span className="text-orange-500">NetClub</span>
              </h2>
            </div>
            <button
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          <div className="hidden lg:flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <Terminal size={16} className="text-orange-500" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Secure authentication
              </span>
            </div>
            <button
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Sign <span className="text-gradient-animated">In</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Use your member ID or admin credentials to access the portal.
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl p-4 mb-6">
            <div className="font-bold text-orange-400 flex items-center text-xs gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5" />
              Test credentials
            </div>
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-300">
              <div>
                <p className="font-semibold text-white">Member</p>
                <p className="mt-0.5">ID: JNC-2026-0125</p>
                <p>Pass: 123456</p>
              </div>
              <div>
                <p className="font-semibold text-white">Admin</p>
                <p className="mt-0.5">User: admin</p>
                <p>Pass: admin123</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                Member ID / Username
              </label>
              <div className="relative flex items-center group">
                <User className="absolute left-3 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="JNC-XXXX-XXXX"
                  className="w-full bg-slate-900/80 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 text-xs font-mono transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                Password
              </label>
              <div className="relative flex items-center group">
                <Lock className="absolute left-3 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-900/80 border border-white/10 text-white pl-10 pr-10 py-3 rounded-xl outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 text-xs font-mono transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 text-slate-500 hover:text-orange-400 transition"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 text-slate-500 font-semibold select-none cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 text-orange-500 focus:ring-0 bg-transparent w-3.5 h-3.5"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-orange-500 hover:text-orange-400 font-semibold text-xs">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition-all overflow-hidden mt-2"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Authenticate Portal Node
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>

          <div className="mt-6 text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Secured · SHA-256 · TLS 1.3
          </div>
        </div>
      </div>
    </div>
  );
}
