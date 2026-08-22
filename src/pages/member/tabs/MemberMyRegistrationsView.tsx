import React from "react";
import { Ticket } from "lucide-react";
import { MyRegistrationsTabProps } from "./memberTabUtils";

const statusMap = {
  attended: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  registered: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
} as const;

const fallback = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";

export default function MemberMyRegistrationsView({
  dataWarning,
  events = [],
  myRegistrations = [],
}: MyRegistrationsTabProps) {
  const myActiveRegs = myRegistrations.filter(
    (r) => (r.status || "registered").toLowerCase() !== "cancelled",
  );
  return (
    <>{dataWarning}
      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <Ticket className="w-5 h-5 text-orange-500" />
          <span>My Registered Events</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myActiveRegs.length > 0 ? (
            myActiveRegs.map((r, idx) => {
              const ev = events.find(
                (e) => String(e._id || e.id) === String(r.eventId),
              );
              const status = (r.status || "registered").toLowerCase();
              const statusColor =
                statusMap[status as keyof typeof statusMap] || fallback;
              return (
                <div
                  key={r._id || r.id || idx}
                  className="bg-[#03070E] border border-white/10 p-5 rounded-2xl space-y-3"
                >
                  <span className={`inline-block px-2 py-0.5 border rounded text-[10px] font-mono font-bold uppercase tracking-wider ${statusColor}`}>
                    {status}
                  </span>
                  <h3 className="font-bold text-base text-white">
                    {r.eventTitle || ev?.title || "Event"}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    📅 {ev?.date || ev?.eventDateTime || r.registeredAt || "TBD"}
                  </p>
                  {ev?.location && (
                    <p className="text-[11px] text-slate-500">📍 {ev.location}</p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl">
              You have not registered for any upcoming events. Browse the Events tab to sign up.
            </div>
          )}
        </div>
      </div>
    </>
  );
}