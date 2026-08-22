import React from "react";
import { CreditCard, Check, X, Trash2 } from "lucide-react";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";

interface PaymentsTabProps {
  payments: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onCreate: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-500/10 border-amber-500/30 text-amber-400",
  approved:
    "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  rejected:
    "bg-rose-500/10 border-rose-500/30 text-rose-400",
  Paid:
    "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  Unpaid:
    "bg-amber-500/10 border-amber-500/30 text-amber-400",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider ${cls}`}
    >
      {status || "pending"}
    </span>
  );
}

export default function PaymentsTab({
  payments,
  totalCount,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreate,
  onApprove,
  onReject,
  onDelete,
}: PaymentsTabProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Subscription & Payments Ledger"
        description="Track membership dues, approve pending payments, and audit transactions."
        icon={<CreditCard className="w-5 h-5" />}
      />
      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel="Record Payment"
        onPrimary={onCreate}
        searchPlaceholder="Search by member, month, or transaction ID..."
        totalCount={totalCount}
        totalLabel="payment entries"
      />

      {payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-7 h-7" />}
          title="No payments recorded"
          description="Members can submit payments through their dashboard. They will appear here automatically."
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-background/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method / TxID</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => {
                  const id = p._id || p.id || idx;
                  return (
                    <tr
                      key={id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-bold text-foreground text-xs">
                          {p.memberName || "Unknown"}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {p.memberEmail || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px]">
                          {p.month || p.purpose || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="text-emerald-400 font-bold font-mono text-sm">
                          ৳{Number(p.amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-[10px] font-mono text-muted-foreground">
                        <div>{p.method || "—"}</div>
                        <div className="truncate max-w-[160px]">
                          {p.transactionId || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 align-top text-[10px] font-mono text-muted-foreground">
                        {p.paymentDate ||
                          (p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "—")}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {(p.status === "pending" ||
                            p.status === "Pending") && (
                            <>
                              <button
                                type="button"
                                onClick={() => onApprove(id)}
                                className="icon-action text-emerald-400 hover:bg-emerald-500/15"
                                title="Approve payment"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onReject(id)}
                                className="icon-action text-rose-400 hover:bg-rose-500/15"
                                title="Reject payment"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => onDelete(id)}
                            className="icon-action is-danger"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
