import React from "react";
import { User, Award, CreditCard } from "lucide-react";
import DigitalIDCard from "../../../components/DigitalIDCard";
import { ProfileTabProps, createTabNavigator } from "./memberTabUtils";

export default function MemberProfileView({
  dataWarning,
  student,
  onNavigate,
}: ProfileTabProps) {
  const go = createTabNavigator(onNavigate);
  return (
    <>{dataWarning}
      <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8 text-white">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <User className="w-5 h-5 text-orange-500" />
          <span>My Portal Profile</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-[#03070E] border border-white/10 rounded-3xl p-6 text-center space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Digital Member Pass
            </h3>
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
            <h3 className="font-sans font-extrabold text-white text-sm pb-2 border-b border-white/5">
              Account Information
            </h3>
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
                onClick={() => go("cert")}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-white/10 flex items-center space-x-1.5"
              >
                <Award className="w-3.5 h-3.5 text-orange-400" />
                <span>View Certificate</span>
              </button>
              <button
                onClick={() => go("payment")}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Dues &amp; Payments</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}