 import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom"; // useParams ইম্পোর্ট করা হয়েছে
import { useAuth } from "../provider/AuthProvider";
import { 
  RefreshCw, CreditCard, Trophy, Bell, Calendar, BookOpen, Cpu, Briefcase 
} from "lucide-react";
import { useAxiosPublic } from "../hooks/useAxiosPublic";
import { useAxiosSecure } from "../hooks/useAxiosSecure";
import { useAiDiagnostics } from "../hooks/useAiDiagnostics";
import { NoticeItem, ClubMember, EventItem } from "../types";

import DigitalIDCard from "../components/DigitalIDCard";
import DashboardStats from "../components/DashboardStats";
import Leaderboard from "../components/Leaderboard";
import AIAssistant from "../components/AIAssistant";
import CertificatePDF from "../components/CertificatePDF";
import AdminPanelView from "../components/AdminPanelView";  
import PaymentView from "../components/PaymentView";
import AdminDashboardOverview from "../AdminDashboard/AdminDashboardOverview";

export default function Dashboard() {
  const { user } = useAuth();
  const { tab: tabParam } = useParams(); 
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();

  const tab = tabParam || searchParams.get("tab") || "dashboard";

  const [members, setMembers] = useState<ClubMember[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [unavailableCollections, setUnavailableCollections] = useState<string[]>([]);

  const fetchAllData = async () => {
    setDbLoading(true);
    const requests = [
      { name: "members", request: axiosPublic.get("/api/members"), setData: setMembers },
      { name: "notices", request: axiosPublic.get("/api/notices"), setData: setNotices },
      { name: "events", request: axiosPublic.get("/api/events"), setData: setEvents },
      { name: "courses", request: axiosPublic.get("/api/courses"), setData: setCourses },
      { name: "devices", request: axiosPublic.get("/api/devices"), setData: setDevices },
      { name: "sponsors", request: axiosPublic.get("/api/sponsors"), setData: setSponsors },
    ];

    // A missing or failing collection must not prevent the rest of the
    // dashboard from rendering. `Promise.all` previously discarded every
    // successful response as soon as one endpoint failed.
    const results = await Promise.allSettled(requests.map(({ request }) => request));
    const failed: string[] = [];

    results.forEach((result, index) => {
      const collection = requests[index];
      if (result.status === "fulfilled") {
        collection.setData(Array.isArray(result.value.data) ? result.value.data : []);
      } else {
        failed.push(collection.name);
        console.error(`Could not load ${collection.name}:`, result.reason);
      }
    });

    setUnavailableCollections(failed);
    setDbLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (tab === "admin" && user?.role !== "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, tab, user?.role]);

  const matchedStudent = members.find((m) => m.email === user?.email) || members[0];
  const activeStudent = {
    id: matchedStudent?.memberId || matchedStudent?.id || "JNC-MOCK",
    name: matchedStudent?.name || user?.displayName || "Guest Student",
    role: matchedStudent?.role || "Member",
    xp: matchedStudent?.xp || 100,
    attendance: matchedStudent?.attendance || 80,
    paidMonths: matchedStudent?.paidMonths || [],
    totalPaid: matchedStudent?.totalPaid || 0,
    department: matchedStudent?.department || "CSE",
    joinedDate: matchedStudent?.joinedDate || "18 Jul 2026",
    email: matchedStudent?.email || user?.email || ""
  };

  const handleAddNotice = async (title: string, category: any) => {
    const newNotice: NoticeItem = {
      id: `NTC-${Math.floor(100 + Math.random() * 900)}`,
      title,
      date: new Date().toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" }),
      category
    };
    try {
      await axiosSecure.post("/api/notices", newNotice);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await axiosSecure.delete(`/api/notices/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (name: string, role: string, department: string) => {
    const newMember: any = {
      memberId: `JNC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      role,
      xp: 120,
      avatar: name.toLowerCase().replace(/\s+/g, ""),
      status: "Active",
      joinedDate: new Date().toISOString(),
      department,
      batch: "2024-25",
      attendance: 100,
      paidMonths: [],
      totalPaid: 0,
      email: `${name.toLowerCase().replace(/\s+/g, "")}@jstu.edu`
    };
    try {
      await axiosSecure.post("/api/members", newMember);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await axiosSecure.delete(`/api/members/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      await axiosSecure.post("/api/events", eventData);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await axiosSecure.delete(`/api/events/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCourse = async (courseData: any) => {
    try {
      await axiosSecure.post("/api/courses", courseData);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await axiosSecure.delete(`/api/courses/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDevice = async (deviceData: any) => {
    try {
      await axiosSecure.post("/api/devices", deviceData);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      await axiosSecure.delete(`/api/devices/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSponsor = async (sponsorData: any) => {
    try {
      await axiosSecure.post("/api/sponsors", sponsorData);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSponsor = async (name: string) => {
    try {
      await axiosSecure.delete(`/api/sponsors/${name}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitPayment = async (month: string, method: string, amount: number, trxId: string, proof: string) => {
    const updatedPaidMonths = [...(activeStudent.paidMonths || []), month];
    const updatedTotalPaid = (activeStudent.totalPaid || 0) + amount;

    try {
      await axiosSecure.patch(`/api/members/${activeStudent.id}`, {
        paidMonths: updatedPaidMonths,
        totalPaid: updatedTotalPaid
      });
      fetchAllData();
      alert(`Payment verified: ৳${amount} for ${month} successfully registered!`);
    } catch (err) {
      console.error(err);
      alert("Payment submission failed.");
    }
  };

  const { isAiLoading, handleSendAiMessage } = useAiDiagnostics({
    context: {
      activeMember: {
        id: activeStudent.id,
        name: activeStudent.name,
        role: activeStudent.role,
        attendance: activeStudent.attendance,
        totalPaid: activeStudent.totalPaid,
      },
      noticesCount: notices.length,
    },
  });

  if (dbLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-white font-mono text-xs">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="animate-pulse">SYNCHRONIZING CLUB RECORDS...</p>
      </div>
    );
  }

  const dataWarning = unavailableCollections.length > 0 && (
    <div className="mx-6 mt-6 lg:mx-10 max-w-7xl rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
      কিছু collection লোড হয়নি: {unavailableCollections.join(", ")}. বাকি dashboard data ব্যবহার করা যাচ্ছে।
      <button onClick={fetchAllData} className="ml-3 font-bold text-amber-400 hover:text-amber-300 underline">
        আবার চেষ্টা করুন
      </button>
    </div>
  );

  // Admin View Handling
  if (user?.role === "admin" && (tab === "admin" || tab === "dashboard")) {
    if (tab === "admin") {
      return (
        <AdminPanelView
          onNavigate={(tabName) => navigate(`/dashboard/${tabName}`)} // নেভিগেশন পাথ পরিবর্তন করা হয়েছে
          onLogout={() => navigate("/")}
          members={members}
          notices={notices}
          events={events}
          courses={courses}
          devices={devices}
          sponsors={sponsors}
          onAddNotice={handleAddNotice}
          onDeleteNotice={handleDeleteNotice}
          onAddMember={handleAddMember}
          onDeleteMember={handleDeleteMember}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          onAddCourse={handleAddCourse}
          onDeleteCourse={handleDeleteCourse}
          onAddDevice={handleAddDevice}
          onDeleteDevice={handleDeleteDevice}
          onAddSponsor={handleAddSponsor}
          onDeleteSponsor={handleDeleteSponsor}
        />
      );
    }

    return (
      <AdminDashboardOverview
        members={members} 
        notices={notices} 
        events={events} 
        onNavigate={(t) => navigate(`/dashboard/${t}`)} // নেভিগেশন পাথ পরিবর্তন করা হয়েছে
      />
    );
  }

  // Member Tab Views Handling
  if (tab === "payment") {
    return (
      <>{dataWarning}<PaymentView
          memberName={activeStudent.name}
          memberId={activeStudent.id}
          onBack={() => navigate("/dashboard")}
          onSubmitPayment={handleSubmitPayment}
        /></>
    );
  }

  if (tab === "cert") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-display font-extrabold text-white">Dynamic Course Credentials</h1>
          <p className="text-xs text-slate-500 mt-1">
            Print, download, or save your validated JSTU academic merits as an authenticated PDF structure.
          </p>
        </div>
        <CertificatePDF
          studentName={activeStudent.name}
          courseName="CCNA & MikroTik Core Engineering Bootcamp"
          completionDate="May 24, 2026"
        />
      </div>
    );
  }

  if (tab === "leaderboard") {
    return (
      <>{dataWarning}<div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center">
          <Trophy className="w-6 h-6 text-amber-500 mr-2.5" />
          Club Merit Leaderboard
        </h1>
        <Leaderboard members={members} />
      </div></>
    );
  }

  if (tab === "notices") {
    return (
      <>{dataWarning}<div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-slate-300">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center">
          <Bell className="w-6 h-6 text-orange-500 mr-2.5" />
          Club Notices & Announcements
        </h1>
        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="bg-[#03070E] border border-white/10 rounded-2xl p-5 space-y-1">
              <p className="text-xs font-bold text-white">{n.title}</p>
              <p className="text-[10px] text-orange-400 font-mono">📅 {n.date}</p>
            </div>
          ))}
          {notices.length === 0 && <p className="text-xs text-slate-500">No notices found.</p>}
        </div>
      </div></>
    );
  }

  if (tab === "events") {
    return (
      <>{dataWarning}<div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-slate-300">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center">
          <Calendar className="w-6 h-6 text-rose-500 mr-2.5" />
          Workshops & Events
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <div key={ev.id} className="bg-[#03070E] border border-white/10 rounded-2xl p-5 space-y-2">
              <h3 className="font-bold text-white text-sm">{ev.title}</h3>
              <p className="text-xs text-slate-400 font-mono">📅 {ev.date} | 📍 {ev.location}</p>
            </div>
          ))}
          {events.length === 0 && <p className="text-xs text-slate-500">No events scheduled.</p>}
        </div>
      </div></>
    );
  }

  if (tab === "courses") {
    return (
      <>{dataWarning}<div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-slate-300">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center">
          <BookOpen className="w-6 h-6 text-blue-500 mr-2.5" />
          CCNA & Networking Courses
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div key={c.id || c._id} className="bg-[#03070E] border border-white/10 rounded-2xl p-5 space-y-2">
              <h3 className="font-bold text-white text-sm">{c.title || c.name}</h3>
              <p className="text-xs text-slate-400">{c.description || "Core networking module."}</p>
            </div>
          ))}
          {courses.length === 0 && <p className="text-xs text-slate-500">No active courses listed.</p>}
        </div>
      </div></>
    );
  }

  if (tab === "devices") {
    return (
      <>{dataWarning}<div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-slate-300">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center">
          <Cpu className="w-6 h-6 text-cyan-500 mr-2.5" />
          Lab Hardware Inventory
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map((d) => (
            <div key={d.id || d._id} className="bg-[#03070E] border border-white/10 rounded-2xl p-4 space-y-1">
              <h3 className="font-bold text-white text-xs">{d.name || d.device}</h3>
              <p className="text-[10px] text-emerald-400 font-mono">Status: {d.status || "Operational"}</p>
            </div>
          ))}
          {devices.length === 0 && <p className="text-xs text-slate-500">No lab devices registered.</p>}
        </div>
      </div></>
    );
  }

  if (tab === "sponsors") {
    return (
      <>{dataWarning}<div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-slate-300">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center">
          <Briefcase className="w-6 h-6 text-purple-500 mr-2.5" />
          Club Sponsors & Partners
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sponsors.map((s, idx) => (
            <div key={s.id || idx} className="bg-[#03070E] border border-white/10 rounded-2xl p-4 space-y-1">
              <h3 className="font-bold text-white text-xs">{s.name}</h3>
              <p className="text-[10px] text-slate-500">Partner Tier: {s.tier || "Gold Partner"}</p>
            </div>
          ))}
          {sponsors.length === 0 && <p className="text-xs text-slate-500">No sponsors listed.</p>}
        </div>
      </div></>
    );
  }

  if (tab === "sys") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto space-y-8 font-mono">
        <div>
          <h1 className="text-xl font-display font-extrabold text-white">Core System Config</h1>
          <p className="text-xs text-slate-500 mt-1">Configuring virtual backend variables and telemetry ports</p>
        </div>
        <div className="bg-[#03070E] border border-white/5 rounded-2xl p-6 space-y-4 text-xs">
          <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
            <span className="text-slate-500">API GATEWAY URL:</span>
            <span className="text-white">/api/diagnose-network</span>
          </div>
          <div className="flex justify-between p-2.5 bg-white/5 rounded-xl">
            <span className="text-slate-500">FIREBASE CONNECTION:</span>
            <span className="text-emerald-400">SECURED NOMINAL</span>
          </div>
        </div>
      </div>
    );
  }

  // Default Dashboard View
  return (
    <>{dataWarning}<div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-wide">
            Welcome Back, {activeStudent.name}! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered Node: <span className="font-mono text-orange-400 font-bold">{activeStudent.id}</span> • Attendance index is {activeStudent.attendance}%
          </p>
        </div>

        <div className="flex space-x-2">
          {activeStudent.attendance >= 75 && (
            <button
              onClick={() => navigate("/dashboard/cert")} // নেভিগেশন পাথ পরিবর্তন করা হয়েছে
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-white/10"
            >
              Get Certificate
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard/payment")} // নেভিগেশন পাথ পরিবর্তন করা হয়েছে
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20"
          >
            Settle Subscription
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <DashboardStats />
          <Leaderboard members={members} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 text-center space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">My Digital Wallet Card</h3>
            <DigitalIDCard
              memberName={activeStudent.name}
              memberId={activeStudent.id}
              role={activeStudent.role}
              department={activeStudent.department}
              xp={activeStudent.xp}
              joinedDate={activeStudent.joinedDate}
            />
          </div>

          <AIAssistant
            isAiLoading={isAiLoading}
            onSendAiMessage={handleSendAiMessage}
          />

          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Dues & Subscriptions</h3>
              <span className="text-[9px] text-orange-500 font-mono font-bold">300৳ / MONTH</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Core Attendance:</span>
                <span className="font-bold text-white">{activeStudent.attendance}%</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Sponsor Fund Paid:</span>
                <span className="font-bold text-emerald-400 font-mono">৳ {activeStudent.totalPaid}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(activeStudent?.paidMonths || []).map((m) => (
                  <span key={m} className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md font-mono font-bold">
                    {m} ✓
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard/payment")} // নেভিগেশন পাথ পরিবর্তন করা হয়েছে
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center space-x-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-orange-400" />
              <span>Submit Payment Screenshot</span>
            </button>
          </div>
        </div>
      </div>
    </div></>
  );
}
