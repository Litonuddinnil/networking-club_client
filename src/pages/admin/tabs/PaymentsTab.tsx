import React, { useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  Check,
  CreditCard,
  Eye,
  Hash,
  Mail,
  Search,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";
import EntityViewDialog, {
  EntityField,
  StatusBadge,
  formatDetailDate,
} from "@/components/admin/EntityViewDialog";
import { cn } from "@/lib/utils";

interface PaymentsTabProps {
  payments: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onCreate?: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  approved: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  paid: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  rejected: "bg-rose-500/10 border-rose-500/30 text-rose-400",
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function StatusPill({ status }: { status?: string }) {
  const s = (status || "pending").toLowerCase();
  const cls = STATUS_STYLES[s] || STATUS_STYLES.pending;
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider",
        cls
      )}
    >
      {status || "pending"}
    </span>
  );
}

function fmtAmount(v: unknown) {
  const n = Number(v || 0);
  return `৳${n.toLocaleString()}`;
}

function shortId(id?: string) {
  if (!id) return "—";
  return id.length > 10 ? `${id.slice(-8).toUpperCase()}` : id.toUpperCase();
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewing, setViewing] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return payments.filter((p) => {
      const matchesSearch =
        !q ||
        p.memberName?.toLowerCase().includes(q) ||
        p.memberEmail?.toLowerCase().includes(q) ||
        p.memberId?.toLowerCase().includes(q) ||
        p.month?.toLowerCase().includes(q) ||
        p.purpose?.toLowerCase().includes(q) ||
        p.transactionId?.toLowerCase().includes(q) ||
        p.collectorName?.toLowerCase().includes(q) ||
        String(p._id || p.id || "")
          .toLowerCase()
          .includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (p.status || "pending").toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  // Aggregate stats for the section
  const stats = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter(
      (p) => (p.status || "pending").toLowerCase() === "pending"
    ).length;
    const approved = payments.filter((p) =>
      ["approved", "paid"].includes((p.status || "").toLowerCase())
    ).length;
    const sum = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
    return { total, pending, approved, sum };
  }, [payments]);

  // Detail dialog fields for the currently-viewed record
  const viewFields: EntityField[] = useMemo(() => {
    if (!viewing) return [];
    const p = viewing;
    return [
      {
        label: "Member name",
        raw: p.memberName,
        value: (
          <span className="font-semibold">
            {p.memberName || "Unknown"}{" "}
            {p.memberId && (
              <span className="text-emerald-400 font-mono text-[11px]">
                ({p.memberId})
              </span>
            )}
          </span>
        ),
        icon: <User className="w-3 h-3" />,
      },
      {
        label: "Email",
        raw: p.memberEmail,
        value: <span className="font-mono text-xs">{p.memberEmail}</span>,
        icon: <Mail className="w-3 h-3" />,
      },
      {
        label: "Department",
        raw: p.department,
        value: <span>{p.department}</span>,
        icon: <Building2 className="w-3 h-3" />,
      },
      {
        label: "Period / Month",
        raw: p.month || p.purpose,
        value: (
          <span className="font-mono text-xs">
            {p.month || p.purpose || "—"}
          </span>
        ),
        icon: <Calendar className="w-3 h-3" />,
      },
      {
        label: "Amount",
        raw: p.amount,
        value: (
          <span className="text-emerald-400 font-mono font-bold text-base">
            {fmtAmount(p.amount)}
          </span>
        ),
        icon: <Wallet className="w-3 h-3" />,
      },
      {
        label: "Method",
        raw: p.method,
        value: (
          <span className="font-mono text-xs">{p.method || "—"}</span>
        ),
        icon: <CreditCard className="w-3 h-3" />,
      },
      {
        label: "Transaction ID",
        raw: p.transactionId,
        value: (
          <span className="font-mono text-xs break-all">
            {p.transactionId || "—"}
          </span>
        ),
        icon: <Hash className="w-3 h-3" />,
        fullWidth: true,
      },
      {
        label: "Record ID",
        raw: p._id || p.id,
        value: (
          <span className="font-mono text-[11px] text-muted-foreground break-all">
            {p._id || p.id || "—"}
          </span>
        ),
        icon: <Hash className="w-3 h-3" />,
      },
      {
        label: "Submitted",
        raw: p.createdAt,
        value: (
          <span className="text-xs">{formatDetailDate(p.createdAt)}</span>
        ),
        icon: <Calendar className="w-3 h-3" />,
      },
      {
        label: "Approved at",
        raw: p.approvedAt,
        value: (
          <span className="text-xs">{formatDetailDate(p.approvedAt)}</span>
        ),
        icon: <Calendar className="w-3 h-3" />,
      },
      {
        label: "Approved by",
        raw: p.approvedBy || p.collectorName,
        value: (
          <span className="text-xs">
            {p.approvedBy || p.collectorName || "—"}
          </span>
        ),
        icon: <User className="w-3 h-3" />,
      },
      {
        label: "Collector (received by)",
        raw: p.collectorName || p.collectedBy,
        value: (
          <span className="text-xs">
            {p.collectorName || p.collectedBy || "—"}
          </span>
        ),
        icon: <User className="w-3 h-3" />,
      },
      {
        label: "Payment date",
        raw: p.paymentDate,
        value: <span className="text-xs">{p.paymentDate || "—"}</span>,
        icon: <Calendar className="w-3 h-3" />,
      },
    ];
  }, [viewing]);

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Subscription & Payments Ledger"
        description="Track membership dues, approve pending payments, and audit transactions."
        icon={<CreditCard className="w-5 h-5" />}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/10 bg-background/40 px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Total records
          </div>
          <div className="mt-1 font-display font-bold text-2xl text-foreground">
            {stats.total}
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
            Pending review
          </div>
          <div className="mt-1 font-display font-bold text-2xl text-amber-400">
            {stats.pending}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
            Approved
          </div>
          <div className="mt-1 font-display font-bold text-2xl text-emerald-400">
            {stats.approved}
          </div>
        </div>
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.04] px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400">
            Total amount
          </div>
          <div className="mt-1 font-display font-bold text-xl text-teal-300">
            {fmtAmount(stats.sum)}
          </div>
        </div>
      </div>

      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel={onCreate ? "Record Payment" : undefined}
        onPrimary={onCreate}
        searchPlaceholder="Search by member, transaction ID, period, collector..."
        totalCount={filtered.length}
        totalLabel={`of ${totalCount} entries`}
      />

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <Search className="w-3 h-3" />
          Status:
        </div>
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider border transition",
                active
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-background/40 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
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
                  <th className="px-4 py-3 text-left">Payer</th>
                  <th className="px-4 py-3 text-left">Period &amp; Amount</th>
                  <th className="px-4 py-3 text-left">Method / TxID</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">When</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const id = p._id || p.id || idx;
                  const isPending =
                    (p.status || "pending").toLowerCase() === "pending";
                  return (
                    <tr
                      key={id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="font-bold text-foreground text-xs">
                          {p.memberName || "Unknown"}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px]">
                          {p.memberEmail || "—"}
                        </div>
                        {p.memberId && (
                          <div className="mt-0.5 text-[10px] font-mono text-emerald-400">
                            {p.memberId}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] mb-1">
                          {p.month || p.purpose || "—"}
                        </span>
                        <div className="text-emerald-400 font-bold font-mono text-sm">
                          {fmtAmount(p.amount)}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-[10px] font-mono text-muted-foreground">
                        <div className="text-foreground">{p.method || "—"}</div>
                        <div
                          className="truncate max-w-[170px]"
                          title={p.transactionId}
                        >
                          {p.transactionId ? (
                            <span className="font-mono">
                              {shortId(p.transactionId)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="px-4 py-3 align-top text-[10px] font-mono text-muted-foreground">
                        <div>
                          {p.paymentDate ||
                            (p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString()
                              : "—")}
                        </div>
                        {p.approvedBy || p.collectorName ? (
                          <div
                            className="text-emerald-400 truncate max-w-[140px]"
                            title={p.approvedBy || p.collectorName}
                          >
                            by {p.approvedBy || p.collectorName}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewing(p)}
                            className="icon-action text-sky-400 hover:bg-sky-500/15"
                            title="View full details"
                            aria-label="View payment details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => onApprove(id)}
                                className="icon-action text-emerald-400 hover:bg-emerald-500/15"
                                title="Approve payment"
                                aria-label="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onReject(id)}
                                className="icon-action text-rose-400 hover:bg-rose-500/15"
                                title="Reject payment"
                                aria-label="Reject"
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
                            aria-label="Delete record"
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

      {/* View modal */}
      <EntityViewDialog
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        title={viewing?.memberName || "Payment record"}
        description={
          viewing
            ? `${viewing.month || viewing.purpose || "Subscription"} · ${fmtAmount(
                viewing.amount
              )}`
            : undefined
        }
        accentIcon={<CreditCard className="w-5 h-5" />}
        status={viewing ? <StatusBadge status={viewing.status} /> : undefined}
        size="lg"
        fields={viewFields}
      >
        {viewing?.notes && (
          <div className="rounded-lg border border-white/5 bg-background/30 px-4 py-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
              Notes
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
              {viewing.notes}
            </p>
          </div>
        )}
      </EntityViewDialog>
    </div>
  );
}
