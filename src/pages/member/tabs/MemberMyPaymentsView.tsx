import React from "react";
import { CreditCard } from "lucide-react";
import { PaymentsTabProps } from "./memberTabUtils";

const statusMap = {
  approved: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  paid: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  rejected: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
} as const;

const fallback = "bg-amber-500/10 border-amber-500/30 text-amber-400";

export default function MemberMyPaymentsView({
  dataWarning,
  myPayments = [],
}: PaymentsTabProps) {
  return (
    <>{dataWarning}
      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-orange-500" />
          <span>My Payment History</span>
        </h1>
        <div className="space-y-3">
          {myPayments.length > 0 ? (
            myPayments.map((p, idx) => {
              const status = (p.status || "pending").toLowerCase();
              const statusColor =
                statusMap[status as keyof typeof statusMap] || fallback;
              return (
                <div
                  key={p._id || p.id || idx}
                  className="bg-[#03070E] border border-white/10 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Period</p>
                    <p className="text-sm font-bold text-white">{p.month || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Amount</p>
                    <p className="text-sm font-bold text-emerald-400">
                      ৳ {Number(p.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Status</p>
                    <span className={`inline-block px-2 py-0.5 border rounded text-[10px] font-mono font-bold uppercase tracking-wider ${statusColor}`}>
                      {p.status || "pending"}
                    </span>
                  </div>
                  {p.transactionId && (
                    <div className="sm:col-span-3">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Transaction ID</p>
                      <p className="text-[11px] font-mono text-slate-300">{p.transactionId}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl">
              No payment records yet. Use the Payments tab to submit your monthly fees.
            </div>
          )}
        </div>
      </div>
    </>
  );
}