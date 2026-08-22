import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Trophy } from "lucide-react";
import DashboardStats from "../../components/DashboardStats";
import Leaderboard from "../../components/Leaderboard";
import AIAssistant from "../../components/AIAssistant";
import CertificatePDF from "../../components/CertificatePDF";
import PaymentView from "../../components/PaymentView";
import { useAiDiagnostics } from "../../hooks/useAiDiagnostics";

// Extracted tab components (Phase 8 refactor)
import MemberPostsView from "./tabs/MemberPostsView";
import MemberEventsView from "./tabs/MemberEventsView";
import MemberMyPaymentsView from "./tabs/MemberMyPaymentsView";
import MemberMyAttendanceView from "./tabs/MemberMyAttendanceView";
import MemberMyRegistrationsView from "./tabs/MemberMyRegistrationsView";
import MemberAnnouncementsView from "./tabs/MemberAnnouncementsView";
import MemberGalleryView from "./tabs/MemberGalleryView";
import MemberProfileView from "./tabs/MemberProfileView";
import MemberSettingsView from "./tabs/MemberSettingsView";
import { createTabNavigator } from "./tabs/memberTabUtils";

interface MemberDashboardProps {
  tab?: string;
  activeTab?: string;
  user?: any;
  activeStudent?: any;
  matchedUser?: any;
  members?: any[];
  posts?: any[];
  notices?: any[];
  events?: any[];
  announcements?: any[];
  gallery?: any[];
  courses?: any[];
  devices?: any[];
  sponsors?: any[];
  payments?: any[];
  attendance?: any[];
  eventRegistrations?: any[];
  dataWarning?: React.ReactNode;
  onNavigate?: (tab: string) => void;
  onRefreshData?: () => void;
}

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
  courses = [],
  devices = [],
  sponsors = [],
  payments = [],
  attendance = [],
  eventRegistrations = [],
  dataWarning,
  onNavigate,
}: MemberDashboardProps) {
  const navigate = useNavigate();

  // Determine active student data
  const student = activeStudent || matchedUser || user || {
    name: "Member",
    id: "JNC-MOCK",
    role: "member",
    department: "CSE",
    attendance: 80,
    xp: 120,
    joinedDate: "Jan 2025",
    email: "member@jstu.edu.bd",
  };

  const currentTab = activeTab || tab || "dashboard";
  const announcementsList = announcements.length > 0 ? announcements : notices;

  // Filter user-scoped collections (admin sees all, user sees only their own)
  const myStudentId = student?.id || student?.memberId || student?._id;
  const myEmail = (student?.email || user?.email || "").toLowerCase();

  const myPayments = useMemo(() => {
    if (!payments?.length) return [];
    if (!myStudentId && !myEmail) return [];
    return payments.filter((p) => {
      const pId = String(p.memberId || "").trim();
      const pEmail = (p.memberEmail || p.email || "").toLowerCase();
      return (
        (myStudentId && pId && String(myStudentId) === pId) ||
        (myEmail && pEmail && pEmail === myEmail)
      );
    });
  }, [payments, myStudentId, myEmail]);

  const myAttendance = useMemo(() => {
    if (!attendance?.length) return [];
    if (!myStudentId && !myEmail) return [];
    return attendance.filter((a) => {
      const aId = String(a.memberId || "").trim();
      const aEmail = (a.memberEmail || a.email || "").toLowerCase();
      return (
        (myStudentId && aId && String(myStudentId) === aId) ||
        (myEmail && aEmail && aEmail === myEmail)
      );
    });
  }, [attendance, myStudentId, myEmail]);

  const myRegistrations = useMemo(() => {
    if (!eventRegistrations?.length) return [];
    if (!myStudentId && !myEmail) return [];
    return eventRegistrations.filter((r) => {
      const rId = String(r.memberId || "").trim();
      const rEmail = (r.memberEmail || r.email || "").toLowerCase();
      return (
        (myStudentId && rId && String(myStudentId) === rId) ||
        (myEmail && rEmail && rEmail === myEmail)
      );
    });
  }, [eventRegistrations, myStudentId, myEmail]);

  // AIAssistant hook call
  const { isAiLoading, handleSendAiMessage } = useAiDiagnostics({
    context: { activeMember: student, noticesCount: announcementsList.length },
  });

  const handleTabNavigate = (targetTab: string) => {
    if (onNavigate) {
      onNavigate(targetTab);
    } else {
      navigate(targetTab === "dashboard" ? "/dashboard" : `/dashboard?tab=${targetTab}`);
    }
  };
  const go = createTabNavigator(onNavigate, navigate);

  // 1. PAYMENT VIEW (existing dedicated component)
  if (currentTab === "payment") {
    return (
      <>{dataWarning}
        <PaymentView
          memberName={student?.name || student?.displayName || "Member"}
          memberId={student?.id || student?.memberId || "JNC-MOCK"}
          onBack={() => handleTabNavigate("dashboard")}
          onSubmitPayment={() => {}}
        />
      </>
    );
  }

  // 2. CERTIFICATE VIEW (existing dedicated component)
  if (currentTab === "cert") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 text-white">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-orange-500" />
          <span>Dynamic Course Credentials</span>
        </h1>
        <CertificatePDF
          studentName={student?.name || student?.displayName || "Member"}
          courseName="CCNA & MikroTik Core Engineering Bootcamp"
          completionDate="May 24, 2026"
        />
      </div>
    );
  }

  // 3. LEADERBOARD VIEW (existing dedicated component)
  if (currentTab === "leaderboard") {
    return (
      <>{dataWarning}
        <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
          <h1 className="text-xl font-display font-extrabold text-white flex items-center">
            <Trophy className="w-6 h-6 text-amber-500 mr-2.5" /> Club Merit Leaderboard
          </h1>
          <Leaderboard members={members || []} />
        </div>
      </>
    );
  }

  // 4. POSTS VIEW (extracted → MemberPostsView)
  if (currentTab === "posts") {
    return <MemberPostsView dataWarning={dataWarning} posts={posts} />;
  }

  // 5. EVENTS VIEW (extracted → MemberEventsView)
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

  // 6. ANNOUNCEMENTS VIEW (extracted → MemberAnnouncementsView)
  if (currentTab === "announcements" || currentTab === "notices") {
    return (
      <MemberAnnouncementsView
        dataWarning={dataWarning}
        items={announcementsList}
      />
    );
  }

  // 6a. MY PAYMENTS VIEW (extracted → MemberMyPaymentsView)
  if (currentTab === "my-payments" || currentTab === "payments") {
    return (
      <MemberMyPaymentsView dataWarning={dataWarning} myPayments={myPayments} />
    );
  }

  // 6b. MY ATTENDANCE VIEW (extracted → MemberMyAttendanceView)
  if (currentTab === "my-attendance" || currentTab === "attendance") {
    return (
      <MemberMyAttendanceView
        dataWarning={dataWarning}
        myAttendance={myAttendance}
      />
    );
  }

  // 6c. MY REGISTERED EVENTS VIEW (extracted → MemberMyRegistrationsView)
  if (currentTab === "my-events" || currentTab === "registrations") {
    return (
      <MemberMyRegistrationsView
        dataWarning={dataWarning}
        events={events}
        myRegistrations={myRegistrations}
        student={student}
      />
    );
  }

  // 7. GALLERY VIEW (extracted → MemberGalleryView)
  if (currentTab === "gallery") {
    return <MemberGalleryView dataWarning={dataWarning} gallery={gallery} />;
  }

  // 8. PROFILE VIEW (extracted → MemberProfileView)
  if (currentTab === "profile" || currentTab === "my-profile") {
    return (
      <MemberProfileView
        dataWarning={dataWarning}
        student={student}
        onNavigate={onNavigate}
      />
    );
  }

  // 9. SETTINGS VIEW (extracted → MemberSettingsView)
  if (currentTab === "settings") {
    return <MemberSettingsView dataWarning={dataWarning} />;
  }

  // Default Member Dashboard Home View
  return (
    <>{dataWarning}
      <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-fade-in text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-wide">
              Welcome Back, {student?.name || student?.displayName || "Member"}! 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered Node: <span className="font-mono text-orange-400 font-bold">{student?.id || student?.memberId || "JNC"}</span> • Attendance index is {student?.attendance || 80}%
            </p>
          </div>

          <div className="flex space-x-2">
            {(student?.attendance || 80) >= 75 && (
              <button
                onClick={() => go("cert")}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-white/10"
              >
                Get Certificate
              </button>
            )}
            <button
              onClick={() => go("payment")}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20"
            >
              Settle Subscription
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <DashboardStats />
            <Leaderboard members={members || []} />
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* AIAssistant Diagnostic Module */}
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
