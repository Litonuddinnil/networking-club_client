import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, Award, Calendar, CheckCircle, Clock, Download, 
  HelpCircle, Home, Layers, MessageSquare, Network, Play, Plus, 
  RefreshCw, Search, Shield, Sparkles, Terminal, User, Users, X, 
  Wifi, ShieldAlert, BookOpen, AlertTriangle, Send
} from "lucide-react";
import { ClubMember, EventItem, NoticeItem, TrainingCourse, PaymentRecord } from "../types";
import { initialNotices, initialEvents, initialCourses } from "../data";
import MemberCard from "./MemberCard";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
 

interface DashboardViewProps {
  member: ClubMember;
  onNavigate: (tab: "home" | "login" | "dashboard" | "admin" | "payment") => void;
  onLogout: () => void;
  onTriggerPayment: (month: string) => void;
  isAiLoading: boolean;
  onSendAiMessage: (prompt: string, callback: (reply: string) => void) => void;
  events: EventItem[];
  notices: NoticeItem[];
  courses: TrainingCourse[];
}

export default function DashboardView({ 
  member, onNavigate, onLogout, onTriggerPayment, isAiLoading, onSendAiMessage,
  events, notices, courses 
}: DashboardViewProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<string>("dashboard");
  const [payments, setPayments] = useState<PaymentRecord[]>([
    { id: "PAY-006", month: "June 2026", amount: 300, status: "Paid", paymentDate: "Jun 10, 2026", transactionId: "TRX884920412" },
    { id: "PAY-005", month: "May 2026", amount: 300, status: "Paid", paymentDate: "May 10, 2026", transactionId: "TRX884920411" },
    { id: "PAY-004", month: "April 2026", amount: 300, status: "Paid", paymentDate: "Apr 10, 2026", transactionId: "TRX884920410" },
    { id: "PAY-003", month: "March 2026", amount: 300, status: "Paid", paymentDate: "Mar 10, 2026", transactionId: "TRX884920409" },
    { id: "PAY-002", month: "February 2026", amount: 300, status: "Paid", paymentDate: "Feb 10, 2026", transactionId: "TRX884920408" },
    { id: "PAY-001", month: "January 2026", amount: 300, status: "Paid", paymentDate: "Jan 15, 2026", transactionId: "TRX884920407" }
  ]);

  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "assistant"; text: string; timestamp: string }[]>([
    { sender: "assistant", text: "Hello! JSTU Club AI Assistant online. I am hooked up to your lab terminal. How can I help you troubleshoot packet issues, design subnets, or verify your membership?", timestamp: "07:12 AM" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Profile modal editing
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(member.name);
  const [profileDept, setProfileDept] = useState(member.department);
  const [profileBatch, setProfileBatch] = useState(member.batch);

  // Certificates modal
  const [certModalOpen, setCertModalOpen] = useState(false);

  // Attendance modal
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  // Activate GSAP scroll-reveal animations on data-reveal elements
  useGsapReveal();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, aiChatOpen]);

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

    onSendAiMessage(userText, (reply) => {
      setChatMessages(prev => [...prev, { sender: "assistant", text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    });
  };

  const downloadCard = () => {
    alert(`Generating download artifact for ${member.name}'s JSTU official card ID... saved to local files!`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    member.name = profileName;
    member.department = profileDept;
    member.batch = profileBatch;
    setProfileModalOpen(false);
    alert("Profile saved locally! Changes reflected instantly in identity components.");
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 flex overflow-hidden font-sans" data-reveal="up">
      
      {/* 1. Left Vertical Nav Rail */}
      <aside className="w-64 border-r border-white/5 bg-[#03070E] flex flex-col shrink-0">
        
        {/* Brand header */}
        <div className="p-6 border-b border-white/5 flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate("home")}>
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
            <Network className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm">JSTU NetClub</div>
            <div className="text-[9px] text-slate-500 font-mono tracking-widest">PORTAL CORE</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {[
            { id: "dashboard", label: "Dashboard", icon: <Layers className="w-4.5 h-4.5" /> },
            { id: "profile", label: "My Profile", icon: <User className="w-4.5 h-4.5" />, action: () => setProfileModalOpen(true) },
            { id: "payments", label: "Payment & Fees", icon: <Award className="w-4.5 h-4.5" />, badge: "Paid" },
            { id: "attendance", label: "My Attendance", icon: <CheckCircle className="w-4.5 h-4.5" />, action: () => setAttendanceModalOpen(true) },
            { id: "events", label: "Club Events", icon: <Calendar className="w-4.5 h-4.5" /> },
            { id: "trainings", label: "Trainings Progress", icon: <BookOpen className="w-4.5 h-4.5" /> },
            { id: "certificates", label: "Certificates", icon: <Award className="w-4.5 h-4.5" />, action: () => setCertModalOpen(true) },
            { id: "notices", label: "Notice Board", icon: <HelpCircle className="w-4.5 h-4.5" /> },
            { id: "ai", label: "AI Diagnostics", icon: <Sparkles className="w-4.5 h-4.5 text-orange-400" />, action: () => setAiChatOpen(true) }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) item.action();
                else setActiveSubTab(item.id);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === item.id 
                  ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-md font-bold uppercase font-mono border border-emerald-500/20">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Left Side: AD banner card */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-gradient-to-tr from-slate-900 to-[#0e172a] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 text-orange-500/5">
              <Network className="w-20 h-20" />
            </div>
            <h4 className="text-xs font-bold text-white">Upgrade Your Skills</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Unlock access to CCNA advanced hardware configuration sandboxes and multi-vendor labs.
            </p>
            <button 
              onClick={() => setAiChatOpen(true)}
              className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] rounded-lg transition-all"
            >
              Explore Now →
            </button>
          </div>
        </div>

        {/* Logout container footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-orange-500/30 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${member.avatar}`} alt="avatar" className="w-full h-full object-cover bg-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{member.name}</div>
              <div className="text-[9px] text-slate-500 truncate">{member.id}</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1.5 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>

      </aside>

      {/* 2. Main Portal Panel Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header bar */}
        <header className="h-16 border-b border-white/5 bg-[#020408]/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-white tracking-wide font-mono uppercase">
              Core Node: Active JSTU-Portal-v3
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setAiChatOpen(true)}
              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors relative"
            >
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
            </button>
            <div className="h-4 w-[1px] bg-white/5" />
            <button 
              onClick={() => onNavigate("home")} 
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1.5"
            >
              <Home className="w-4 h-4" />
              <span>Public Landing</span>
            </button>
          </div>
        </header>

        {/* Content body with scroll */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8 bg-[#020408]">
          
          {/* Welcome heading row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-display font-extrabold text-white">
                  Welcome back, {member.name}!
                </h1>
                <span className="text-xl">👋</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Your portal node is healthy. You have completed 75% of your active courses.
              </p>
            </div>

            <div className="flex items-center space-x-3 font-mono text-xs text-slate-400 bg-white/5 px-4 py-2 border border-white/5 rounded-2xl">
              <span className="text-slate-500">MEMBER ID:</span>
              <span className="text-orange-400 font-bold">{member.id}</span>
            </div>
          </div>

          {/* Core Stat grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Active Membership", val: "Active", desc: "Status checked", color: "text-emerald-400 bg-emerald-500/10" },
              { label: "Attendance Status", val: `${member.attendance}%`, desc: "In physical labs", color: "text-blue-400 bg-blue-500/10" },
              { label: "Total Paid", val: `৳ ${member.totalPaid}`, desc: "Tracked collections", color: "text-orange-400 bg-orange-500/10" },
              { label: "Skill Rewards", val: `${member.xp} XP`, desc: "Gamified learning", color: "text-purple-400 bg-purple-500/10" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#03070E] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-2xl font-display font-extrabold text-white">{stat.val}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${stat.color}`}>
                    {stat.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bento layout: Payment Overview (col-span-8) & ID Card component (col-span-4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Box: Payments Overview table & pay next action (col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-[#03070E] border border-white/5 rounded-3xl p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div>
                    <h2 className="text-lg font-display font-bold text-white">Payment Overview</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Verified logs of JSTU Networking Club membership fees.</p>
                  </div>
                  <button 
                    onClick={() => onNavigate("payment")}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/15 transition-all flex items-center space-x-1"
                  >
                    <span>Pay Next Month</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-white/5 pb-2">
                        <th className="font-semibold pb-3">Month</th>
                        <th className="font-semibold pb-3">Amount</th>
                        <th className="font-semibold pb-3">Status</th>
                        <th className="font-semibold pb-3">Payment Date</th>
                        <th className="font-semibold pb-3">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5/20 transition-all">
                          <td className="py-3.5 font-semibold text-white">{p.month}</td>
                          <td className="py-3.5 font-mono text-orange-400">৳ {p.amount}</td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-bold text-[10px] uppercase tracking-wider font-mono">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-400 font-mono">{p.paymentDate || "--"}</td>
                          <td className="py-3.5 text-slate-500 font-mono">{p.transactionId || "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Progress Panel details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CCNA progress */}
                <div className="bg-[#03070E] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">Active Training Course progress</h3>
                    <span className="text-[10px] font-mono text-orange-400">CCNA Core</span>
                  </div>

                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">{course.name} ({course.provider})</span>
                          <span className="font-mono text-orange-400 font-bold">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${course.progress}%` }} 
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>Trainer: {course.instructor || "Staff"}</span>
                          <span className="hover:text-white cursor-pointer transition-colors">Resume Lab →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notices Panel */}
                <div className="bg-[#03070E] border border-white/5 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">Lab Notices</h3>
                    <span className="text-[10px] text-slate-500">Recent posts</span>
                  </div>

                  <div className="space-y-3.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                    {notices.map((n) => (
                      <div key={n.id} className="flex items-start space-x-3 text-xs border-b border-white/5 last:border-none pb-2.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500 mt-1 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-200 hover:text-white transition-colors">{n.title}</p>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{n.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Box: Physical member ID card visualization (col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-base font-display font-bold text-white flex items-center">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full mr-2"></span>
                Official Member ID Card
              </h2>
              <MemberCard member={member} onDownload={downloadCard} />

              {/* Quick Actions grid */}
              <div className="bg-[#03070E] border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  {[
                    { label: "Update Profile", icon: "👤", action: () => setProfileModalOpen(true) },
                    { label: "Certificates", icon: "🏆", action: () => setCertModalOpen(true) },
                    { label: "My Attendance", icon: "📅", action: () => setAttendanceModalOpen(true) },
                    { label: "Diagnostics", icon: "🤖", action: () => setAiChatOpen(true) }
                  ].map((act, idx) => (
                    <button 
                      key={idx}
                      onClick={act.action}
                      className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-3.5 transition-all text-xs font-bold text-white flex flex-col items-center justify-center space-y-2"
                    >
                      <span className="text-lg">{act.icon}</span>
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Floating AI Diagnostics Assistant component */}
      {aiChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-[#060b14]/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="bg-gradient-to-tr from-orange-600 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-display uppercase tracking-wide">AI Lab Diagnostic Assistant</h3>
                <p className="text-[9px] text-white/70 font-mono">Powered by Google Gemini SDK</p>
              </div>
            </div>
            <button 
              onClick={() => setAiChatOpen(false)}
              className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages history */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-[#020408]/60">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                  msg.sender === "user" 
                    ? "bg-orange-600 text-white rounded-br-none" 
                    : "bg-slate-900 border border-white/5 text-slate-300 rounded-bl-none"
                }`}>
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-1">{msg.timestamp}</span>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center space-x-2 bg-slate-900 border border-white/5 p-3 rounded-2xl w-40">
                <RefreshCw className="w-4.5 h-4.5 text-orange-400 animate-spin" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">Analyzing ports...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick presets diagnostics */}
          <div className="bg-slate-900/60 p-2.5 border-t border-white/5 flex gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
            {[
              "Scan Lab Nodes",
              "Subnet 10.0.1.0/24",
              "Check CCNA Syllabus"
            ].map((preset, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setChatInput(preset);
                  setTimeout(() => handleSendChat(), 50);
                }}
                className="bg-white/5 border border-white/5 hover:border-white/10 text-[9px] text-slate-300 font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-white/5 flex gap-2 shrink-0">
            <input 
              type="text" 
              placeholder="Ask for diagnostics recommendations..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl outline-none focus:border-orange-500/50"
            />
            <button 
              type="submit"
              className="bg-orange-600 hover:bg-orange-500 text-white p-2.5 rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* --- 3. MODALS (Edit Profile, Certificates, Attendance) --- */}
      
      {/* Edit Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveProfile} className="bg-[#060B14] border border-white/10 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-display font-extrabold text-white text-base">Update official JSTU Profile</h3>
              <button type="button" onClick={() => setProfileModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-500 font-semibold">Engineer Name</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-orange-500/50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 font-semibold">Department Code</label>
                <input 
                  type="text" 
                  value={profileDept} 
                  onChange={(e) => setProfileDept(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-orange-500/50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 font-semibold">Academic Batch</label>
                <input 
                  type="text" 
                  value={profileBatch} 
                  onChange={(e) => setProfileBatch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 outline-none focus:border-orange-500/50"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/25 transition-all"
            >
              Save Credentials
            </button>
          </form>
        </div>
      )}

      {/* Certificates Modal */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#060B14] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-display font-extrabold text-white text-base">My Skill Certificates</h3>
              <button type="button" onClick={() => setCertModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { name: "CCNA Routing Fundamentals", issuer: "Cisco Networking Academy @ JSTU", date: "April 15, 2026", code: "CERT-Cisco-883920" },
                { name: "RouterOS QuickSetup Essentials", issuer: "MikroTik Academy Center", date: "May 02, 2026", code: "CERT-Mikro-204122" }
              ].map((cert, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start space-x-3.5">
                  <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <h4 className="font-bold text-white text-sm">{cert.name}</h4>
                    <p className="text-slate-500 mt-1">{cert.issuer}</p>
                    <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
                      <span>Date: {cert.date}</span>
                      <span>ID: {cert.code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setCertModalOpen(false)}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Attendance Logs Modal */}
      {attendanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#060B14] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-display font-extrabold text-white text-base">Physical Lab Attendance logs</h3>
              <button type="button" onClick={() => setAttendanceModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-sm">Overall Attendance score: {member.attendance}%</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Complies with official academic lab rules.</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-2 text-xs max-h-[220px] overflow-y-auto custom-scrollbar">
                {[
                  { date: "June 12, 2026", topic: "BGP Advanced Route Maps", status: "Present" },
                  { date: "June 05, 2026", topic: "VLAN Partitioning and QoS Tagging", status: "Present" },
                  { date: "May 29, 2026", topic: "Vulnerability Scanning with Fortinet", status: "Present" },
                  { date: "May 22, 2026", topic: "Subnetting Classless CIDR Masks", status: "Absent" }
                ].map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div>
                      <span className="font-bold text-white block">{log.topic}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{log.date}</span>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      log.status === "Present" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setAttendanceModalOpen(false)}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
