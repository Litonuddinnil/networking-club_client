 import React from "react";
import { Megaphone, Calendar, Tag, BellOff } from "lucide-react";
import { AnnouncementsTabProps, AnnouncementItem } from "./memberTabUtils";

export default function MemberAnnouncementsView({
  dataWarning,
  items = [],
}: AnnouncementsTabProps) {
  return (
    <>
      {dataWarning}

      <section 
        aria-label="Official Announcements & Notices"
        className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10 space-y-6 text-white"
      >
        {/* Header */}
        <header className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Megaphone className="w-5 h-5" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-display font-extrabold tracking-tight text-white">
            Official Announcements &amp; Notices
          </h1>
        </header>

        {/* Announcements List */}
        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((ann: AnnouncementItem, idx: number) => {
              const uniqueKey = ann._id || ann.id || `announcement-${idx}`;
              
              return (
                <article
                  key={uniqueKey}
                  className="bg-[#03070E] border border-white/10 hover:border-white/20 transition-colors p-5 rounded-2xl space-y-3 shadow-sm"
                >
                  {/* Metadata Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
                      <Tag className="w-3 h-3" />
                      {ann.category || "Notice"}
                    </span>
                    
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <time dateTime={ann.date}>{ann.date || "Recent"}</time>
                    </span>
                  </div>

                  {/* Title & Body */}
                  <div className="space-y-1.5">
                    <h2 className="font-bold text-base text-white tracking-tight">
                      {ann.title}
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {ann.content || ann.description || "Official notice detail."}
                    </p>
                  </div>
                </article>
              );
            })
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-12 text-center bg-[#03070E] border border-white/5 rounded-2xl space-y-3">
              <div className="p-3 rounded-full bg-slate-900 border border-white/10 text-slate-500">
                <BellOff className="w-6 h-6" />
              </div>
              <p className="text-sm font-mono text-slate-400">
                No announcements posted yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}