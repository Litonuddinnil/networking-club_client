import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Hourglass,
  Receipt,
  Ticket,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";

interface EventRegistrationsTabProps {
  eventRegistrations: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  /** Approve a submission after checking the details + payment. */
  onApprove?: (id: string) => void;
  /** Turn a submission down. */
  onReject?: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  approved: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  registered: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  rejected: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  cancelled: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  attended: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  waitlist: "bg-amber-500/10 border-amber-500/30 text-amber-400",
};

function StatusBadge({ status }: { status: string }) {
  const key = (status || "pending").toLowerCase();
  const cls = STATUS_STYLES[key] || STATUS_STYLES.pending;
  return (
    <span
      className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider ${cls}`}
    >
      {key}
    </span>
  );
}

const PAYMENT_LABELS: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank: "Bank transfer",
  cash: "Cash",
  free: "Free",
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function EventRegistrationsTab({
  eventRegistrations,
  totalCount,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCancel,
  onDelete,
  onApprove,
  onReject,
}: EventRegistrationsTabProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const pendingCount = useMemo(
    () =>
      eventRegistrations.filter(
        (r) => (r.status || "pending").toLowerCase() === "pending"
      ).length,
    [eventRegistrations]
  );

  const rows = useMemo(() => {
    if (filter === "all") return eventRegistrations;
    return eventRegistrations.filter((r) => {
      const s = (r.status || "pending").toLowerCase();
      if (filter === "approved") return s === "approved" || s === "registered";
      return s === filter;
    });
  }, [eventRegistrations, filter]);

  const FILTERS: { key: StatusFilter; label: string; count?: number }[] = [
    { key: "all", label: "All", count: eventRegistrations.length },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Event Registrations"
        description="Review member sign-ups, check the payment proof, then approve or reject each submission."
        icon={<Ticket className="w-5 h-5" />}
      />

      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel={undefined}
        onPrimary={undefined}
        searchPlaceholder="Search by event, member, or status..."
        totalCount={totalCount}
        totalLabel="registrations"
      />

      {/* Pending banner — the queue that actually needs an admin. */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          <Hourglass className="h-4 w-4 shrink-0" />
          <span>
            <strong>{pendingCount}</strong>{" "}
            {pendingCount === 1 ? "submission is" : "submissions are"} waiting
            for approval.
          </span>
          {filter !== "pending" && (
            <button
              type="button"
              onClick={() => setFilter("pending")}
              className="ml-auto shrink-0 rounded-lg border border-amber-500/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition hover:bg-amber-500/20"
            >
              Review now
            </button>
          )}
        </div>
      )}

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
              filter === f.key
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            {typeof f.count === "number" && ` (${f.count})`}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-7 h-7" />}
          title={
            filter === "all"
              ? "No event registrations yet"
              : `No ${filter} registrations`
          }
          description={
            filter === "all"
              ? "When members register for events, their submissions appear here for approval."
              : "Try a different status filter."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-background/40">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Event</th>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const id = r._id || r.id || idx;
                  const status = (r.status || "pending").toLowerCase();
                  const isPending = status === "pending";
                  const isCancelled =
                    status === "cancelled" || status === "rejected";
                  const isOpen = expanded === String(id);

                  return (
                    <React.Fragment key={id}>
                      <tr className="border-b border-border/60 transition last:border-0 hover:bg-muted/50">
                        <td className="px-4 py-3 align-top">
                          <div className="text-xs font-bold text-foreground">
                            {r.eventTitle || "Untitled Event"}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            ID: {r.eventId || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <Link
                            to={`/dashboard/registrations/${id}`}
                            className="text-xs font-bold text-foreground underline-offset-4 hover:text-primary hover:underline"
                          >
                            {r.fullName || r.memberName || "Unknown"}
                          </Link>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {r.memberEmail || "—"}
                          </div>
                          {(r.studentId || r.department) && (
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {[r.studentId, r.department]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 align-top">
                          {r.paymentMethod || r.transactionId ? (
                            <>
                              <div className="text-xs font-semibold text-foreground">
                                {PAYMENT_LABELS[
                                  (r.paymentMethod || "").toLowerCase()
                                ] ||
                                  r.paymentMethod ||
                                  "—"}
                                {r.amount ? ` · ৳${r.amount}` : ""}
                              </div>
                              {r.transactionId && (
                                <div className="font-mono text-[10px] text-muted-foreground">
                                  TRX: {r.transactionId}
                                </div>
                              )}
                              {r.paymentProof && (
                                <a
                                  href={r.paymentProof}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
                                >
                                  <Receipt className="h-3 w-3" />
                                  View proof
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </>
                          ) : (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 align-top font-mono text-[11px]">
                          {r.submittedAt || r.registeredAt || r.createdAt
                            ? new Date(
                                r.submittedAt || r.registeredAt || r.createdAt
                              ).toLocaleString()
                            : "—"}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <StatusBadge status={status} />
                          {r.reviewedAt && (
                            <div className="mt-1 font-mono text-[9px] text-muted-foreground">
                              {new Date(r.reviewedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/dashboard/registrations/${id}`}
                              className="icon-action"
                              title="Open the full submission"
                            >
                              <FileText className="h-4 w-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                setExpanded(isOpen ? null : String(id))
                              }
                              className="icon-action"
                              title="Quick preview"
                              aria-expanded={isOpen}
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {isPending && onApprove && (
                              <button
                                type="button"
                                onClick={() => onApprove(id)}
                                className="icon-action text-emerald-400 hover:bg-emerald-500/15"
                                title="Approve registration"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}

                            {isPending && onReject && (
                              <button
                                type="button"
                                onClick={() => onReject(id)}
                                className="icon-action text-rose-400 hover:bg-rose-500/15"
                                title="Reject registration"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}

                            {!isPending && !isCancelled && (
                              <button
                                type="button"
                                onClick={() => onCancel(id)}
                                className="icon-action text-amber-400 hover:bg-amber-500/15"
                                title="Cancel registration"
                              >
                                <Ticket className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onDelete(id)}
                              className="icon-action is-danger"
                              title="Delete record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded submission — everything the member sent,
                          so payment can be checked without leaving the tab. */}
                      {isOpen && (
                        <tr className="border-b border-border/60 bg-muted/40">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <dl className="detail-grid sm:col-span-2">
                                {[
                                  ["Full name", r.fullName || r.memberName],
                                  ["Email", r.memberEmail],
                                  ["Phone", r.phone],
                                  ["Student ID", r.studentId],
                                  ["Department", r.department],
                                  ["Session", r.session],
                                  [
                                    "Payment method",
                                    PAYMENT_LABELS[
                                      (r.paymentMethod || "").toLowerCase()
                                    ] || r.paymentMethod,
                                  ],
                                  ["Transaction ID", r.transactionId],
                                  ["Amount", r.amount ? `৳${r.amount}` : null],
                                ]
                                  .filter(([, v]) => Boolean(v))
                                  .map(([label, value]) => (
                                    <div className="detail-cell" key={String(label)}>
                                      <dt>{label}</dt>
                                      <dd>{value}</dd>
                                    </div>
                                  ))}

                                {r.notes && (
                                  <div className="detail-cell is-full">
                                    <dt>Notes</dt>
                                    <dd>{r.notes}</dd>
                                  </div>
                                )}
                              </dl>

                              <div>
                                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                  Payment proof
                                </p>
                                {r.paymentProof ? (
                                  <a
                                    href={r.paymentProof}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block overflow-hidden rounded-xl border border-border"
                                  >
                                    <img
                                      src={r.paymentProof}
                                      alt="Payment proof"
                                      className="h-auto w-full object-cover"
                                    />
                                  </a>
                                ) : (
                                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-[11px] text-muted-foreground">
                                    No screenshot attached
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
