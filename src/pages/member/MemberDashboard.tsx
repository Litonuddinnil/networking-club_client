 import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Trophy,
  CreditCard,
  Calendar,
  ClipboardList,
  Sparkles,
  Megaphone,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  Flame,
  User,
  Ticket,
} from "lucide-react";

import DashboardStats from "../../components/DashboardStats";
import Leaderboard from "../../components/Leaderboard";
import AIAssistant from "../../components/AIAssistant";
import CertificatePDF from "../../components/CertificatePDF";
import PaymentView from "../../components/PaymentView";
import { useAiDiagnostics } from "../../hooks/useAiDiagnostics";

// Extracted and fully-typed tab components
import MemberPostsView from "./tabs/MemberPostsView";
import MemberEventsView from "./tabs/MemberEventsView";
import MemberMyPaymentsView from "./tabs/MemberMyPaymentsView";
import MemberMyAttendanceView from "./tabs/MemberMyAttendanceView";
import MemberMyRegistrationsView from "./tabs/MemberMyRegistrationsView";
import MemberAnnouncementsView from "./tabs/MemberAnnouncementsView";
import MemberGalleryView from "./tabs/MemberGalleryView";
import MemberProfileView from "./tabs/MemberProfileView";
import MemberSettingsView from "./tabs/MemberSettingsView";

import {
  MemberStudent,
  MemberDashboardProps,
  createTabNavigator,
  calculateMemberLevel,
} from "./tabs/memberTabUtils";

export default function MemberDashboard({
  tab,
  activeTab,
  user,
  activeStudent,
  matchedUser,
  members = [],
  posts = [],
  notices = [],
  events = [],
  announcements = [],
  gallery = [],
  payments = [],
  attendance = [],
  eventRegistrations = [],
  dataWarning,
  onNavigate,
}: MemberDashboardProps) {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // 1. Resolve Active Member Profile safely with fallbacks
  const student: MemberStudent = useMemo(() => {
    return (
      activeStudent ||
      matchedUser ||
      user || {
        name: "Valued Member",
        displayName: "Valued Member",
        id: "JNC-MOCK",
        memberId: "JNC-MOCK",
        role: "member",
        department: "CSE",
        attendance: 80,
        attendanceRate: 80,
        xp: 120,
        joinedDate: "2025",
        email: "member@jstu.edu.bd",
      }
    );
  }, [activeStudent, matchedUser, user]);

  const currentTab = (activeTab || tab || "dashboard").toLowerCase().trim();
  const announcementsList = announcements.length > 0 ? announcements : notices;

  // 2. Safe User-Scoped Identity Extraction
  const myStudentId = String(
    student?.id ?? student?.memberId ?? student?._id ?? ""
  ).trim();
  const myEmail = String(student?.email || user?.email || "").toLowerCase().trim();

  // 3. User-Scoped Payments Filter (Fixed property matching)
  const myPayments = useMemo(() => {
    if (!payments?.length || (!myStudentId && !myEmail)) return [];
    return payments.filter((p) => {
      if (!p) return false;
      const pId = String(p.memberId ?? p.id ?? p._id ?? "").trim();
      const pEmail = String(p.memberEmail || p.email || "").toLowerCase().trim();
      
      const matchId = Boolean(myStudentId && pId && myStudentId === pId);
      const matchEmail = Boolean(myEmail && pEmail && myEmail === pEmail);
      return matchId || matchEmail;
    });
  }, [payments, myStudentId, myEmail]);

  // 4. User-Scoped Attendance Filter
  const myAttendance = useMemo(() => {
    if (!attendance?.length || (!myStudentId && !myEmail)) return [];
    return attendance.filter((a) => {
      if (!a) return false;
      const aId = String(a.memberId ?? a.id ?? a._id ?? "").trim();
      const aEmail = String(a.memberEmail || a.email || "").toLowerCase().trim();

      const matchId = Boolean(myStudentId && aId && myStudentId === aId);
      const matchEmail = Boolean(myEmail && aEmail && myEmail === aEmail);
      return matchId || matchEmail;
    });
  }, [attendance, myStudentId, myEmail]);

  // 5. User-Scoped Event Registrations Filter
  const myRegistrations = useMemo(() => {
    if (!eventRegistrations?.length || (!myStudentId && !myEmail)) return [];
    return eventRegistrations.filter((r) => {
      if (!r) return false;
      const rId = String(r.memberId ?? r.id ?? "").trim();
      const rEmail = String(r.memberEmail || r.email || "").toLowerCase().trim();

      const matchId = Boolean(myStudentId && rId && myStudentId === rId);
      const matchEmail = Boolean(myEmail && rEmail && myEmail === rEmail);
      return matchId || matchEmail;
    });
  }, [eventRegistrations, myStudentId, myEmail]);

  // 6. AI Diagnostics Hook Integration
  const { isAiLoading, handleSendAiMessage } = useAiDiagnostics({
    context: { activeMember: student, noticesCount: announcementsList.length },
  });

  // 7. Tab Navigation System
  const go = createTabNavigator(onNavigate, navigate);

  const handleCopyId = () => {
    if (!myStudentId) return;
    navigator.clipboard.writeText(myStudentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const attendanceRate = Number(student?.attendance ?? student?.attendanceRate ?? 80);
  const currentXp = Number(student?.xp || 120);
  const { level: memberLevel } = calculateMemberLevel(currentXp);

  const completionDateString = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* -------------------------------------------------------------------------- */
  /*                             ROUTED TAB VIEWS                               */
  /* -------------------------------------------------------------------------- */

  if (currentTab === "payment") {
    return (
      <>
        {dataWarning}
        <PaymentView
          memberName={student?.name || student?.displayName || "Member"}
          memberId={String(student?.id || student?.memberId || "JNC-MOCK")}
          onBack={() => go("dashboard")}
          onSubmitPayment={() => {}}
        />
      </>
    );
  }

  if (currentTab === "cert" || currentTab === "certificates") {
    return (
      <>
        {dataWarning}
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-white">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <span>Dynamic Course Credentials</span>
            </h1>
            <button
              type="button"
              onClick={() => go("dashboard")}
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CertificatePDF
            studentName={student?.name || student?.displayName || "Member"}
            courseName="CCNA & MikroTik Core Engineering Bootcamp"
            completionDate={completionDateString}
          />
        </div>
      </>
    );
  }

  if (currentTab === "leaderboard") {
    return (
      <>
        {dataWarning}
        <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
          <header className="flex items-center justify-between pb-2 border-b border-white/5">
            <h1 className="text-xl font-display font-extrabold text-white flex items-center">
              <Trophy className="w-6 h-6 text-amber-500 mr-2.5" /> Club Merit Leaderboard
            </h1>
            <button
              type="button"
              onClick={() => go("dashboard")}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              ← Back
            </button>
          </header>
          <Leaderboard members={members || []} />
        </div>
      </>
    );
  }

  if (currentTab === "posts") {
    return <MemberPostsView dataWarning={dataWarning} posts={posts} />;
  }

  if (currentTab === "events") {
    return (
      <MemberEventsView
        dataWarning={dataWarning}
        events={events}
        myRegistrations={myRegistrations}
        student={student}
        onNavigate={onNavigate}
      />
    );
  }

  if (currentTab === "announcements" || currentTab === "notices") {
    return (
      <MemberAnnouncementsView
        dataWarning={dataWarning}
        items={announcementsList}
      />
    );
  }

  if (currentTab === "my-payments" || currentTab === "payments") {
    return (
      <MemberMyPaymentsView dataWarning={dataWarning} myPayments={myPayments} />
    );
  }

  if (currentTab === "my-attendance" || currentTab === "attendance") {
    return (
      <MemberMyAttendanceView
        dataWarning={dataWarning}
        myAttendance={myAttendance}
      />
    );
  }

  if (currentTab === "my-events" || currentTab === "registrations") {
    return (
      <MemberMyRegistrationsView
        dataWarning={dataWarning}
        events={events}
        myRegistrations={myRegistrations}
        student={student}
        onNavigate={onNavigate}
      />
    );
  }

  if (currentTab === "gallery") {
    return <MemberGalleryView dataWarning={dataWarning} gallery={gallery} />;
  }

  if (currentTab === "profile" || currentTab === "my-profile") {
    return (
      <MemberProfileView
        dataWarning={dataWarning}
        student={student}
        onNavigate={onNavigate}
      />
    );
  }

  if (currentTab === "settings") {
    return <MemberSettingsView dataWarning={dataWarning} student={student} />;
  }

  /* -------------------------------------------------------------------------- */
  /*                  DEFAULT MEMBER DASHBOARD HOME (VIP VIEW)                  */
  /* -------------------------------------------------------------------------- */

  const latestNotice = announcementsList[0];

  return (
    <>
      {dataWarning}

      <div className="p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl mx-auto text-white animate-fade-in">
        {/* VIP Hero Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#03070E] via-[#081026] to-[#03070E] p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Badges strip */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  Level {memberLevel} Explorer
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {student?.department || "CSE"} Node
                </span>

                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
                  title="Click to copy member ID"
                >
                  <span>ID: {myStudentId || "JNC-MEMBER"}</span>
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Welcome Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
                  Welcome back, {student?.name || student?.displayName || "Member"}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
                  Your club activity standing is verified. You have earned{" "}
                  <span className="text-amber-300 font-bold font-mono">{currentXp} XP</span> with an attendance index of{" "}
                  <span className="text-emerald-400 font-bold font-mono">{attendanceRate}%</span>.
                </p>
              </div>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              {attendanceRate >= 75 && (
                <button
                  type="button"
                  onClick={() => go("cert")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs font-mono uppercase tracking-wider rounded-2xl border border-white/10 shadow-md transition-all hover:-translate-y-0.5"
                >
                  <Award className="w-4 h-4 text-emerald-400" />
                  Certificate
                </button>
              )}

              <button
                type="button"
                onClick={() => go("payment")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
              >
                <CreditCard className="w-4 h-4" />
                Pay Dues
              </button>
            </div>
          </div>

          {/* Live Notice / Announcement Alert Strip */}
          {latestNotice && (
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Megaphone className="w-3.5 h-3.5" />
                </span>
                <span className="text-slate-400 font-mono text-[11px] shrink-0 uppercase tracking-wide">
                  Latest Notice:
                </span>
                <span className="text-white font-semibold truncate">
                  {latestNotice.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => go("announcements")}
                className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1 shrink-0 font-bold"
              >
                Read Notice <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </section>

        {/* Member Quick-Action Nav Hub */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <QuickActionCard
            title="Events & Sessions"
            subtitle="Browse upcoming club labs"
            icon={<Calendar className="w-5 h-5 text-emerald-400" />}
            onClick={() => go("events")}
          />
          <QuickActionCard
            title="My Event Passes"
            subtitle={`${myRegistrations.length} registered passes`}
            icon={<Ticket className="w-5 h-5 text-emerald-400" />}
            onClick={() => go("my-events")}
          />
          <QuickActionCard
            title="Attendance Log"
            subtitle={`${attendanceRate}% lifetime rate`}
            icon={<ClipboardList className="w-5 h-5 text-blue-400" />}
            onClick={() => go("attendance")}
          />
          <QuickActionCard
            title="Digital Pass"
            subtitle="View digital credentials"
            icon={<User className="w-5 h-5 text-amber-400" />}
            onClick={() => go("profile")}
          />
        </section>

        {/* Core Layout: Main Stats + Leaderboard & AIAssistant */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <DashboardStats />
            <Leaderboard members={members || []} />
          </div>

          <div className="lg:col-span-4 space-y-8">
            <AIAssistant
              isAiLoading={isAiLoading}
              onSendAiMessage={handleSendAiMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function QuickActionCard({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group p-4 bg-[#03070E] border border-white/10 hover:border-emerald-500/40 rounded-2xl text-left space-y-2 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div>
        <div className="text-xs sm:text-sm font-bold font-sans text-white group-hover:text-emerald-300 transition-colors">
          {title}
        </div>
        <div className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
          {subtitle}
        </div>
      </div>
    </button>
  );
}