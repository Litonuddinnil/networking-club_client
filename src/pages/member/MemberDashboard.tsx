 import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, Calendar, BookOpen, Trophy, 
  FileText, Megaphone, Image, User, Settings, Award, CreditCard, Shield 
} from "lucide-react";
import DigitalIDCard from "../../components/DigitalIDCard";
import DashboardStats from "../../components/DashboardStats";
import Leaderboard from "../../components/Leaderboard";
import AIAssistant from "../../components/AIAssistant";
import CertificatePDF from "../../components/CertificatePDF";
import PaymentView from "../../components/PaymentView";
import { useAiDiagnostics } from "../../hooks/useAiDiagnostics";

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
    email: "member@jstu.edu.bd"
  };

  const currentTab = activeTab || tab || "dashboard";
  const announcementsList = announcements.length > 0 ? announcements : notices;

  // AIAssistant hook call
  const { isAiLoading, handleSendAiMessage } = useAiDiagnostics({
    context: { activeMember: student, noticesCount: announcementsList.length }
  });

  const handleTabNavigate = (targetTab: string) => {
    if (onNavigate) {
      onNavigate(targetTab);
    } else {
      navigate(targetTab === "dashboard" ? "/dashboard" : `/dashboard?tab=${targetTab}`);
    }
  };

  // 1. PAYMENT VIEW
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

  // 2. CERTIFICATE VIEW
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

  // 3. LEADERBOARD VIEW
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

  // 4. POSTS VIEW
  if (currentTab === "posts") {
    return (
      <>{dataWarning}
        <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
          <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <span>Club Community Posts</span>
          </h1>
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post, idx) => (
                <div key={post._id || post.id || idx} className="bg-[#03070E] border border-white/10 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs text-orange-400 font-mono">
                    <span>{post.category || "General"}</span>
                    <span>{post.date || "Recent"}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white">{post.title}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2">{post.content || post.description || "No preview text available."}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl">
                No published posts found.
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // 5. EVENTS VIEW
  if (currentTab === "events") {
    return (
      <>{dataWarning}
        <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
          <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span>Upcoming Club Events & Workshops</span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.length > 0 ? (
              events.map((ev, idx) => (
                <div key={ev._id || ev.id || idx} className="bg-[#03070E] border border-white/10 p-5 rounded-2xl space-y-3">
                  <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-mono rounded font-bold uppercase">
                    {ev.type || "Workshop"}
                  </span>
                  <h3 className="font-bold text-base text-white">{ev.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">📅 {ev.date || "TBD"} | 📍 {ev.location || "Club Lab"}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl">
                No scheduled events at this time.
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // 6. ANNOUNCEMENTS VIEW
  if (currentTab === "announcements" || currentTab === "notices") {
    return (
      <>{dataWarning}
        <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
          <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-orange-500" />
            <span>Official Announcements & Notices</span>
          </h1>
          <div className="space-y-4">
            {announcementsList.length > 0 ? (
              announcementsList.map((ann, idx) => (
                <div key={ann._id || ann.id || idx} className="bg-[#03070E] border border-white/10 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded text-orange-400">
                      {ann.category || "Notice"}
                    </span>
                    <span>{ann.date || "Recent"}</span>
                  </div>
                  <h3 className="font-bold text-base text-white">{ann.title}</h3>
                  <p className="text-xs text-slate-300">{ann.content || ann.description || "Official notice detail."}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl">
                No announcements posted yet.
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // 7. GALLERY VIEW
  if (currentTab === "gallery") {
    return (
      <>{dataWarning}
        <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
          <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
            <Image className="w-5 h-5 text-orange-500" />
            <span>Club Photo & Event Gallery</span>
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.length > 0 ? (
              gallery.map((g, idx) => (
                <div key={g._id || g.id || idx} className="bg-[#03070E] border border-white/10 p-3 rounded-2xl space-y-2">
                  <div className="h-40 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                    {g.imageUrl || g.url ? (
                      <img src={g.imageUrl || g.url} alt={g.title} className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-white truncate">{g.title || "Club Activity"}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl">
                No gallery media available.
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // 8. PROFILE VIEW ("My Profile")
  if (currentTab === "profile" || currentTab === "my-profile") {
    return (
      <>{dataWarning}
        <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8 text-white">
          <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-orange-500" />
            <span>My Portal Profile</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-[#03070E] border border-white/10 rounded-3xl p-6 text-center space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Digital Member Pass</h3>
              <DigitalIDCard
                memberName={student?.name || student?.displayName || "Member"}
                memberId={student?.id || student?.memberId || "JNC"}
                role={student?.role || "member"}
                department={student?.department || "CSE"}
                xp={student?.xp || 0}
                joinedDate={student?.joinedDate || ""}
              />
            </div>

            <div className="md:col-span-7 bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4 font-mono text-xs">
              <h3 className="font-sans font-extrabold text-white text-sm pb-2 border-b border-white/5">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Full Name</span>
                  <span className="text-white font-bold">{student?.name || student?.displayName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Email Address</span>
                  <span className="text-orange-400 font-bold">{student?.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Department</span>
                  <span className="text-white font-bold">{student?.department || "CSE"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Member Attendance</span>
                  <span className="text-emerald-400 font-bold">{student?.attendance || 80}%</span>
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  onClick={() => handleTabNavigate("cert")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-white/10 flex items-center space-x-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-orange-400" />
                  <span>View Certificate</span>
                </button>
                <button
                  onClick={() => handleTabNavigate("payment")}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Dues & Payments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 9. SETTINGS VIEW
  if (currentTab === "settings") {
    return (
      <>{dataWarning}
        <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto space-y-6 text-white">
          <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-orange-500" />
            <span>Member Portal Settings</span>
          </h1>

          <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5">
              <div>
                <div className="font-bold text-white">Email Notifications</div>
                <div className="text-[10px] text-slate-500">Receive club updates and event reminders</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange-500 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5">
              <div>
                <div className="font-bold text-white">Public Profile Visibility</div>
                <div className="text-[10px] text-slate-500">Display stats on Merit Leaderboard</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </>
    );
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
                onClick={() => handleTabNavigate("cert")}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-white/10"
              >
                Get Certificate
              </button>
            )}
            <button
              onClick={() => handleTabNavigate("payment")}
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
            <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 text-center space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">My Digital Wallet Card</h3>
              <DigitalIDCard
                memberName={student?.name || student?.displayName || "Member"}
                memberId={student?.id || student?.memberId || "JNC"}
                role={student?.role || "member"}
                department={student?.department || "CSE"}
                xp={student?.xp || 0}
                joinedDate={student?.joinedDate || ""}
              />
            </div>

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