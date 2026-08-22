import React from "react";
import { Settings } from "lucide-react";
import { SettingsTabProps } from "./memberTabUtils";

export default function MemberSettingsView({
  dataWarning,
}: SettingsTabProps) {
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
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 accent-orange-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5">
            <div>
              <div className="font-bold text-white">Public Profile Visibility</div>
              <div className="text-[10px] text-slate-500">Display stats on Merit Leaderboard</div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 accent-orange-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </>
  );
}