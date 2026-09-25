import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ExternalLink,
  Hourglass,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Receipt,
  RefreshCw,
  Ticket,
  TriangleAlert,
  User,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import { useAxiosSecure } from "@/hooks/useAxiosSecure";
import { extractApiError } from "@/lib/extractApiError";
import { swalError, swalFire, swalToast } from "@/lib/swal";
import { formatEventDate } from "@/pages/EventDetails";

/**
 * Registration review — /dashboard/registrations/:id
 *
 * The admin-side counterpart to the member sign-up form: it shows a single
 * submission exactly as it was filled in (like opening one response of a
 * Google Form), with the payment proof at full size, and the two decisions
 * that matter — approve or reject.
 *
 * Rejecting asks for a reason, which is stored on the record as `reviewNote`
 * so the decision is auditable rather than an unexplained status flip.
 */

const PAYMENT_LABELS: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank: "Bank transfer",
  cash: "Cash (on campus)",
  free: "Free / no payment",
};

const STATUS_TONE: Record<string, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  registered: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-400",
  cancelled: "border-rose-500/40 bg-rose-500/10 text-rose-400",
  attended: "border-blue-500/40 bg-blue-500/10 text-blue-400",
};

function stamp(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

export default function RegistrationReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);

  const backTo = "/dashboard?tab=registrations";

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.get(`/api/event-registrations/${id}`);
      const data = res.data?.data || res.data || null;
      if (!data) setError("This registration no longer exists.");
      else setRecord(data);
    } catch (err: any) {
      setError(extractApiError(err, "Failed to load this registration."));
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, id]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (body: Record<string, unknown>, done: string) => {
    setWorking(true);
    try {
      const res = await axiosSecure.patch(`/api/event-registrations/${id}`, body);
      setRecord(res.data?.data || res.data || record);
      swalToast(done);
      return true;
    } catch (err: any) {
      swalError(extractApiError(err, "Could not update this registration."));
      return false;
    } finally {
      setWorking(false);
      setConfirmApprove(false);
    }
  };

  const handleApprove = async () => {
    await patch({ status: "approved" }, "Registration approved");
  };

  const handleReject = async () => {
    const result = await swalFire({
      icon: "warning",
      title: "Reject this registration?",
      input: "textarea",
      inputLabel: "Reason (shown to the member)",
      inputPlaceholder: "e.g. Transaction ID doesn't match any payment we received.",
      inputAttributes: { "aria-label": "Reason for rejection" },
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Keep pending",
      inputValidator: (value: string) =>
        value && value.trim() ? null : "Please give a short reason.",
    });
    if (!result.isConfirmed) return;
    await patch(
      { status: "rejected", reviewNote: String(result.value || "").trim() },
      "Registration rejected"
    );
  };

  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex-1 min-h-0 admin-mesh grid place-items-center p-8">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading submission…
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex-1 min-h-0 admin-mesh">
        <div className="page-shell max-w-2xl">
          <div className="empty-state">
            <TriangleAlert className="mx-auto mb-3 h-8 w-8 text-amber-500" />
            <h1 className="font-display text-lg font-bold text-foreground">
              Registration unavailable
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || "This submission could not be displayed."}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <Button onClick={() => navigate(backTo)} className="gap-2 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                All registrations
              </Button>
              <Button variant="outline" onClick={load} className="gap-2 rounded-xl">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = (record.status || "pending").toLowerCase();
  const isPending = status === "pending";
  const applicant = record.fullName || record.memberName || "Unknown applicant";
  const amount = Number(record.amount);
  const hasAmount = Number.isFinite(amount) && amount > 0;

  const answers: Array<[string, React.ReactNode, React.ReactNode?]> = [
    ["Full name", applicant, <User className="h-3 w-3" key="i" />],
    ["Email", record.memberEmail || "—", <Mail className="h-3 w-3" key="i" />],
    ["Phone", record.phone || "—", <Phone className="h-3 w-3" key="i" />],
    ["Student ID", record.studentId || "—"],
    ["Department", record.department || "—"],
    ["Session / batch", record.session || "—"],
  ];

  return (
    <div className="flex-1 min-h-0 admin-mesh">
      {/* Sticky decision bar */}
      <div className="page-topbar">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Registrations
        </button>

        <Badge
          variant="outline"
          className={`font-mono text-[10px] uppercase tracking-widest ${
            STATUS_TONE[status] || STATUS_TONE.pending
          }`}
        >
          {status}
        </Badge>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {isPending ? (
            <>
              <Button
                size="sm"
                onClick={() => setConfirmApprove(true)}
                disabled={working}
                className="h-9 gap-1.5 rounded-lg text-xs font-semibold"
              >
                {working ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={working}
                className="h-9 gap-1.5 rounded-lg border-destructive/40 text-xs text-destructive hover:bg-destructive/10"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => patch({ status: "pending" }, "Moved back to pending")}
              disabled={working}
              className="h-9 gap-1.5 rounded-lg text-xs"
            >
              <Hourglass className="h-3.5 w-3.5" />
              Reopen as pending
            </Button>
          )}
        </div>
      </div>

      <div className="page-shell max-w-4xl">
        <article className="page-surface">
          <div className="h-1 w-full bg-linear-to-r from-teal-400 via-primary to-emerald-400" />

          {/* Who + which event */}
          <header className="border-b border-border px-4 py-5 sm:px-6 sm:py-6">
            <span className="eyebrow mb-3">Registration submission</span>
            <h1 className="font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
              {applicant}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              applied for <strong className="text-foreground">{record.eventTitle || "an event"}</strong>
            </p>

            <div className="meta-strip mt-3">
              {record.eventDate && (
                <span>
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatEventDate(record.eventDate, "Date TBA")}
                </span>
              )}
              {record.eventId && (
                <span>
                  <MapPin className="h-3.5 w-3.5" />
                  Event ID {String(record.eventId).slice(-8)}
                </span>
              )}
              {stamp(record.submittedAt || record.registeredAt) && (
                <span>
                  <Ticket className="h-3.5 w-3.5" />
                  Submitted {stamp(record.submittedAt || record.registeredAt)}
                </span>
              )}
              {stamp(record.reviewedAt) && (
                <span>
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Reviewed {stamp(record.reviewedAt)}
                </span>
              )}
            </div>

            {record.reviewNote && (
              <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive">
                <strong>Review note:</strong> {record.reviewNote}
              </p>
            )}
          </header>

          {/* Submitted answers */}
          <section className="border-b border-border px-4 py-5 sm:px-6">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Submitted details
            </h2>
            <dl className="detail-grid">
              {answers.map(([label, value, icon]) => (
                <div className="detail-cell" key={String(label)}>
                  <dt>
                    {icon}
                    <span>{label}</span>
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
              {record.notes && (
                <div className="detail-cell is-full">
                  <dt>Anything else we should know?</dt>
                  <dd className="whitespace-pre-wrap">{record.notes}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Payment — the part that actually needs verifying */}
          <section className="px-4 py-5 sm:px-6">
            <h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Receipt className="h-3.5 w-3.5" />
              Payment to verify
            </h2>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <dl className="detail-grid lg:col-span-2 lg:grid-cols-1">
                <div className="detail-cell">
                  <dt>Method</dt>
                  <dd>
                    {PAYMENT_LABELS[(record.paymentMethod || "").toLowerCase()] ||
                      record.paymentMethod ||
                      "—"}
                  </dd>
                </div>
                <div className="detail-cell">
                  <dt>Amount</dt>
                  <dd>{hasAmount ? `৳${amount}` : "—"}</dd>
                </div>
                <div className="detail-cell">
                  <dt>Transaction ID</dt>
                  <dd className="font-mono text-[0.8rem]">
                    {record.transactionId || "—"}
                  </dd>
                </div>
              </dl>

              <div className="lg:col-span-3">
                {record.paymentProof ? (
                  <figure className="overflow-hidden rounded-xl border border-border">
                    <a
                      href={record.paymentProof}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <img
                        src={record.paymentProof}
                        alt="Payment proof"
                        className="h-auto w-full object-contain"
                      />
                    </a>
                    <figcaption className="flex items-center justify-between border-t border-border bg-muted px-3 py-2 text-[11px] text-muted-foreground">
                      <span>Payment screenshot</span>
                      <a
                        href={record.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Full size
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </figcaption>
                  </figure>
                ) : (
                  <div className="grid h-full min-h-40 place-items-center rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No payment screenshot was attached.
                  </div>
                )}
              </div>
            </div>
          </section>
        </article>
      </div>

      <ConfirmActionDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Approve this registration?"
        description="Confirm the details and the payment are correct. The member's seat will be booked."
        entityName={`${applicant} — ${record.eventTitle || "event"}`}
        confirmLabel="Yes, approve"
        variant="primary"
        loading={working}
        onConfirm={handleApprove}
      />
    </div>
  );
}
