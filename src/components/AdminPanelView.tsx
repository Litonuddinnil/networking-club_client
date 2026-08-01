import React, { useState } from "react";
import { 
  Users, Bell, Calendar, BookOpen, Cpu, Briefcase, Plus, Trash2, ArrowLeft, ShieldAlert 
} from "lucide-react";
import { ClubMember, NoticeItem, EventItem } from "../types";

interface AdminPanelProps {
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  members: ClubMember[];
  notices: NoticeItem[];
  events: EventItem[];
  courses: any[];
  devices: any[];
  sponsors: any[];
  onAddNotice: (title: string, category: string) => void;
  onDeleteNotice: (id: string) => void;
  onAddMember: (name: string, role: string, department: string) => void;
  onDeleteMember: (id: string) => void;
  onAddEvent: (eventData: any) => void;
  onDeleteEvent: (id: string) => void;
  onAddCourse: (courseData: any) => void;
  onDeleteCourse: (id: string) => void;
  onAddDevice: (deviceData: any) => void;
  onDeleteDevice: (id: string) => void;
  onAddSponsor: (sponsorData: any) => void;
  onDeleteSponsor: (name: string) => void;
}

export default function AdminPanelView({
  onNavigate,
  members,
  notices,
  events,
  courses,
  devices,
  sponsors,
  onAddNotice,
  onDeleteNotice,
  onAddMember,
  onDeleteMember,
  onAddEvent,
  onDeleteEvent,
  onAddCourse,
  onDeleteCourse,
  onAddDevice,
  onDeleteDevice,
  onAddSponsor,
  onDeleteSponsor,
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"members" | "notices" | "events" | "courses" | "devices" | "sponsors">("members");

  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Member");
  const [newMemberDept, setNewMemberDept] = useState("CSE");

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle) return;
    onAddNotice(newNoticeTitle, "General");
    setNewNoticeTitle("");
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;
    onAddMember(newMemberName, newMemberRole, newMemberDept);
    setNewMemberName("");
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    onAddEvent({ title: newEventTitle, date: newEventDate || "TBA", location: "JSTU Campus" });
    setNewEventTitle("");
    setNewEventDate("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in text-slate-300 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigate("dashboard")}
            className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-display font-extrabold text-white tracking-wide">
              System Administration Auditor Panel
            </h1>
            <p className="text-xs text-slate-500">Manage members, notices, activities and lab inventory</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-[#03070E] p-1 border border-white/10 rounded-2xl">
          {[
            { id: "members", label: "Members", icon: <Users className="w-3.5 h-3.5" /> },
            { id: "notices", label: "Notices", icon: <Bell className="w-3.5 h-3.5" /> },
            { id: "events", label: "Events", icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: "courses", label: "Courses", icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: "devices", label: "Lab Inventory", icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: "sponsors", label: "Sponsors", icon: <Briefcase className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === tab.id
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === "members" && (
        <div className="space-y-6">
          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Enroll New Member Node</h3>
            <form onSubmit={handleMemberSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
              <input
                type="text"
                placeholder="Role (e.g. Lead Auditor)"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
              <select
                value={newMemberDept}
                onChange={(e) => setNewMemberDept(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              >
                <option value="CSE" className="bg-[#03070E]">CSE</option>
                <option value="EEE" className="bg-[#03070E]">EEE</option>
                <option value="Geology" className="bg-[#03070E]">Geology</option>
              </select>
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl py-2 flex items-center justify-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </form>
          </div>

          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Registered Members Database ({members.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Dept</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map((m: any) => (
                    <tr key={m._id || m.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-bold text-white">{m.name}</td>
                      <td className="py-3 text-orange-400">{m.memberId || m.id}</td>
                      <td className="py-3">{m.department}</td>
                      <td className="py-3">{m.role}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${m.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {m.status || "Active"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => onDeleteMember(m.id || m.memberId)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "notices" && (
        <div className="space-y-6">
          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Broadcast New Notice</h3>
            <form onSubmit={handleNoticeSubmit} className="flex gap-3">
              <input
                type="text"
                placeholder="Notice title and description..."
                value={newNoticeTitle}
                onChange={(e) => setNewNoticeTitle(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono flex-1"
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl px-5 py-2 flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Publish Notice</span>
              </button>
            </form>
          </div>

          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Active Notices ({notices.length})</h3>
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-white/5 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-white">{n.title}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{n.date}</p>
                  </div>
                  <button onClick={() => onDeleteNotice(n.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "events" && (
        <div className="space-y-6">
          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Schedule New Event</h3>
            <form onSubmit={handleEventSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Event Title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
              <input
                type="text"
                placeholder="Date (e.g. May 28, 2026)"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl py-2 flex items-center justify-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </button>
            </form>
          </div>

          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Scheduled Events ({events.length})</h3>
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-white/5 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-white">{ev.title}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{ev.date} • {ev.location}</p>
                  </div>
                  <button onClick={() => onDeleteEvent(ev.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {["courses", "devices", "sponsors"].includes(activeSubTab) && (
        <div className="bg-[#03070E] border border-white/10 rounded-3xl p-12 text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-orange-500 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Module Node Ready</h3>
          <p className="text-xs text-slate-500">Manage {activeSubTab} records from the club administration panel.</p>
        </div>
      )}
    </div>
  );
}
