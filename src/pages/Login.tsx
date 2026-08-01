import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../provider/AuthProvider";
import { ShieldAlert, LogIn, Lock, Mail } from "lucide-react";

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setLocalError(err.message || "Access Denied: Ingress credentials do not match active registries.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#03070E]/90 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 to-transparent pointer-events-none" />

      <div className="space-y-1.5 text-center">
        <h2 className="text-xl font-display font-extrabold text-white tracking-wide">Enter Cyber Portal</h2>
        <p className="text-xs text-slate-500">Access JSTU laboratory dashboards & certificates</p>
      </div>

      {(error || localError) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start space-x-2.5 text-red-400 text-[11px] font-mono leading-normal">
          <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
          <span>{localError || error}</span>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Student Email</label>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
            <Mail className="w-4.5 h-4.5 text-slate-500 mr-2.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ariful@jstu.edu"
              className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Portal Password</label>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
            <Lock className="w-4.5 h-4.5 text-slate-500 mr-2.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-orange-600/20"
        >
          <LogIn className="w-4 h-4" />
          <span>{isLoading ? "Authenticating node..." : "Establish handshakes"}</span>
        </button>
      </form>

      <div className="text-center text-xs">
        <span className="text-slate-500">Need a portal node? </span>
        <Link to="/register" className="text-orange-500 hover:text-orange-400 font-bold">Register Registry</Link>
      </div>
    </div>
  );
}