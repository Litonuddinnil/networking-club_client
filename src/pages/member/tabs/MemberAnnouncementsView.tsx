import React from "react";
import { Megaphone } from "lucide-react";
import { AnnouncementsTabProps } from "./memberTabUtils";

export default function MemberAnnouncementsView({
  dataWarning,
  items = [],
}: AnnouncementsTabProps) {
  return (
    <>{dataWarning}
      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <Megaphone className="w-5 h-5 text-orange-500" />
          <span>Official Announcements &amp; Notices</span>
        </h1>
        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((ann: any, idx: number) => (
              <div
                key={ann._id || ann.id || idx}
                className="bg-[#03070E] border border-white/10 p-5 rounded-2xl space-y-2"
              >
                <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded text-orange-400">
                    {ann.category || "Notice"}
                  </span>
                  <span>{ann.date || "Recent"}</span>
                </div>
                <h3 className="font-bold text-base text-white">{ann.title}</h3>
                <p className="text-xs text-slate-300">
                  {ann.content || ann.description || "Official notice detail."}
                </p>
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