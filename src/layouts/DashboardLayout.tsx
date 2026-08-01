 import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../provider/AuthProvider";
import { 
  Shield, Layers, Award, LogOut, Settings, Command, Menu, X, 
  Bell, Calendar, BookOpen, Cpu, Briefcase, CreditCard, Trophy 
} from "lucide-react";
import CommandPalette from "../components/CommandPalette";

export default function DashboardLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPalette, setShowPalette] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center font-mono text-xs text-orange-500 space-x-2">
        <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
        <span>VERIFYING PORTAL SESSION KEYS...</span>
      </div>
    );
  }

  const handleNavigateCommand = (view: "home" | "login" | "dashboard" | "admin" | "payment" | "lab") => {
    if (view === "home") navigate("/");
    else if (view === "login") navigate("/login");
    else if (view === "dashboard") navigate("/dashboard");
    else if (view === "admin") navigate("/dashboard?tab=admin");
    else if (view === "payment") navigate("/dashboard?tab=payment");
    else if (view === "lab") navigate("/lab");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // ক্লাবের জন্য প্রয়োজনীয় গুরুত্বপূর্ণ মেনু ও পেজসমূহ
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard Console", path: "/dashboard", icon: <Layers className="w-4.5 h-4.5" /> },
    { id: "leaderboard", label: "Merit Leaderboard", path: "/dashboard?tab=leaderboard", icon: <Trophy className="w-4.5 h-4.5" /> },
    { id: "notices", label: "Club Notices", path: "/dashboard?tab=notices", icon: <Bell className="w-4.5 h-4.5" /> },
    { id: "events", label: "Events & Workshops", path: "/dashboard?tab=events", icon: <Calendar className="w-4.5 h-4.5" /> },
    { id: "courses", label: "CCNA & Courses", path: "/dashboard?tab=courses", icon: <BookOpen className="w-4.5 h-4.5" /> },
    { id: "payment", label: "Subscription & Dues", path: "/dashboard?tab=payment", icon: <CreditCard className="w-4.5 h-4.5" /> },
    { id: "devices", label: "Lab Inventory", path: "/dashboard?tab=devices", icon: <Cpu className="w-4.5 h-4.5" /> },
    { id: "sponsors", label: "Club Sponsors", path: "/dashboard?tab=sponsors", icon: <Briefcase className="w-4.5 h-4.5" /> },
    { id: "cert", label: "My Certificates", path: "/dashboard?tab=cert", icon: <Award className="w-4.5 h-4.5" /> },
    { id: "admin", label: "Admin Auditor", path: "/dashboard?tab=admin", icon: <Shield className="w-4.5 h-4.5" />, adminOnly: true },
    { id: "sys", label: "System Config", path: "/dashboard?tab=sys", icon: <Settings className="w-4.5 h-4.5" /> }
  ];

  const currentTab = new URLSearchParams(location.search).get("tab") || "dashboard";

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 flex overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-[#03070E] flex-col shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm">JSTU Portal</div>
            <div className="text-[8px] text-orange-500 font-mono tracking-widest uppercase">Networking Club</div>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => setShowPalette(true)}
            className="w-full flex items-center justify-between bg-[#020408] border border-white/10 hover:border-orange-500/20 px-3 py-2 rounded-xl text-[10px] text-slate-400 hover:text-white transition-all font-mono"
          >
            <div className="flex items-center space-x-1.5">
              <Command className="w-3.5 h-3.5 text-orange-500" />
              <span>Search Commands</span>
            </div>
            <span className="bg-slate-900 px-1 py-0.5 border border-white/5 rounded text-[8px] text-slate-500">⌘K</span>
          </button>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            if (item.adminOnly && user.role !== "admin") return null;

            const isActive = (currentTab === item.id || (item.id === "dashboard" && !location.search)) && location.pathname === "/dashboard";
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  isActive 
                    ? "bg-orange-600/10 text-orange-400 border-orange-500/25" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Account block */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-slate-950/50 border border-white/5 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-orange-500/20 flex items-center justify-center font-mono font-bold text-orange-500 text-xs shrink-0">
                {(user?.displayName || "NA").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{user.displayName}</div>
                <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider truncate">
                  {user.role === "admin" ? "Super Admin" : "Audited Member"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout Session"
              className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-[#020408]/80 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between shrink-0 lg:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-extrabold text-white text-xs tracking-wider font-mono">JSTU NetClub</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPalette(true)}
              className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-400 hover:text-white"
            >
              <Command className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-400 hover:text-white"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Primary Nested Routing Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#020408]">
          <div data-barba="page" data-barba-namespace="dashboard" className="barba-page">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-between p-6 overflow-y-auto">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="font-display font-extrabold text-white text-sm font-mono">JSTU NetClub</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                if (item.adminOnly && user.role !== "admin") return null;
                const isActive = currentTab === item.id && location.pathname === "/dashboard";
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${
                      isActive
                        ? "bg-orange-600/10 text-orange-400 border-orange-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-white/5 pt-6 mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-orange-500/20 flex items-center justify-center font-mono font-bold text-orange-500 text-xs">
                {(user?.displayName || "NA").slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user.displayName}</p>
                <p className="text-[9px] text-slate-500 font-mono tracking-wider">{(user?.role || "").toUpperCase()}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Command palette search bar */}
      <CommandPalette
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        onNavigate={handleNavigateCommand}
      />
    </div>
  );
}