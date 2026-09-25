import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Receipt,
  Ticket,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ImageDropzone from "@/components/admin/ImageDropzone";
import { TextField, TextAreaField, SelectField } from "@/components/admin/Field";
import { useAuth } from "@/provider/AuthProvider";
import { useAxiosSecure } from "@/hooks/useAxiosSecure";
import { useAxiosPublic } from "@/hooks/useAxiosPublic";
import { extractApiError } from "@/lib/extractApiError";
import { swalError, swalSuccess } from "@/lib/swal";

/**
 * Public-facing event registration form — /dashboard/events/:id/register
 *
 * Works like a Google Form: the member fills in their details and payment
 * proof, submits once, and the submission lands in the database with
 * `status: "pending"`. An admin then reviews everything (including the
 * payment screenshot) on the registrations tab and approves or rejects it.
 * Nothing is confirmed until that review happens.
 */

const PAYMENT_METHODS = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "bank", label: "Bank transfer" },
  { value: "cash", label: "Cash (on campus)" },
  { value: "free", label: "Free / no payment required" },
];

const DEPARTMENTS = [
  "CSE",
  "EEE",
  "Geology",
  "BBA",
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Other",
];

const EMPTY = {
  fullName: "",
  memberEmail: "",
  phone: "",
  studentId: "",
  department: "CSE",
  session: "",
  paymentMethod: "bkash",
  transactionId: "",
  amount: "",
  paymentProof: "",
  notes: "",
};

function formatEventDate(value?: string) {
  if (!value) return "Date to be announced";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventRegisterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();

  const [event, setEvent] = useState<any | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Load the event being registered for.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoadingEvent(true);
      try {
        const res = await axiosPublic.get(`/api/events/${id}`);
        if (cancelled) return;
        const data = res.data?.event || res.data?.data || res.data || null;
        if (!data) setLoadError("This event could not be found.");
        else setEvent(data);
      } catch (err: any) {
        if (!cancelled) setLoadError(extractApiError(err, "Failed to load this event."));
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [axiosPublic, id]);

  // Prefill whatever we already know about the signed-in member.
  useEffect(() => {
    if (!user?.email) return;
    setForm((f) => ({
      ...f,
      fullName: f.fullName || user.displayName || "",
      memberEmail: f.memberEmail || user.email || "",
    }));
  }, [user]);

  // Pull the member record so student ID / department / phone prefill too.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.email) return;
      try {
        const res = await axiosPublic.get("/api/members");
        if (cancelled) return;
        const me = (res.data || []).find(
          (m: any) => m.email?.toLowerCase() === user.email?.toLowerCase()
        );
        if (!me) return;
        setForm((f) => ({
          ...f,
          fullName: f.fullName || me.name || me.displayName || "",
          phone: f.phone || me.phone || me.contact || "",
          studentId: f.studentId || String(me.studentId || me.memberId || ""),
          department: me.department || f.department,
          session: f.session || me.session || me.batch || "",
        }));
      } catch {
        /* prefill is a convenience — the member can still type it in */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [axiosPublic, user]);

  const fee = useMemo(() => {
    const raw = event?.fee ?? event?.price ?? event?.amount;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [event]);

  const needsPayment = fee > 0 && form.paymentMethod !== "free";

  const set = (key: keyof typeof EMPTY, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldError(null);
  };

  const validate = (): string | null => {
    if (!form.fullName.trim()) return "Please enter your full name.";
    if (!form.memberEmail.trim()) return "Please enter your email address.";
    if (!/^\S+@\S+\.\S+$/.test(form.memberEmail.trim()))
      return "That email address doesn't look right.";
    if (!form.phone.trim()) return "Please enter a phone number we can reach you on.";
    if (!form.studentId.trim()) return "Please enter your student ID.";
    if (needsPayment && !form.transactionId.trim())
      return "Please enter the transaction ID for your payment.";
    if (needsPayment && !form.paymentProof)
      return "Please attach a screenshot of your payment.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setFieldError(problem);
      swalError(problem, "Check your details");
      return;
    }

    setSubmitting(true);
    try {
      await axiosSecure.post("/api/event-registrations", {
        eventId: id,
        eventTitle: event?.title || "",
        eventDate: event?.eventDate || event?.date || "",
        memberEmail: form.memberEmail.trim().toLowerCase(),
        memberName: form.fullName.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        studentId: form.studentId.trim(),
        department: form.department,
        session: form.session.trim(),
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId.trim(),
        amount: form.amount ? Number(form.amount) : fee,
        paymentProof: form.paymentProof,
        notes: form.notes.trim(),
        // Explicit, so it is obvious from the payload that nothing is
        // confirmed until an admin reviews it.
        status: "pending",
      });
      setSubmitted(true);
      await swalSuccess(
        "Registration submitted",
        "An admin will review your details and payment, then confirm your seat. You can track the status under My Registrations."
      );
    } catch (err: any) {
      swalError(extractApiError(err, "Could not submit your registration."));
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */

  if (loadingEvent) {
    return (
      <div className="flex-1 min-h-0 admin-mesh grid place-items-center p-8">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Loading event…
        </div>
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="flex-1 min-h-0 admin-mesh">
        <div className="page-shell max-w-2xl">
          <div className="empty-state">
            <TriangleAlert className="mx-auto mb-3 h-8 w-8 text-amber-500" />
            <h1 className="font-display text-lg font-bold text-foreground">
              Event unavailable
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loadError || "This event could not be displayed."}
            </p>
            <Button
              onClick={() => navigate("/dashboard?tab=events")}
              className="mt-5 rounded-xl gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex-1 min-h-0 admin-mesh">
        <div className="page-shell max-w-2xl">
          <div className="page-surface p-8 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              Submitted — awaiting approval
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Your registration for <strong>{event.title}</strong> has been
              received. An admin will check your details and payment, then
              approve it. You'll see the status update under My Registrations.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <Button
                onClick={() => navigate("/dashboard?tab=my-events")}
                className="rounded-xl gap-2"
              >
                <Ticket className="h-4 w-4" />
                My registrations
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard?tab=events")}
                className="rounded-xl gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to events
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 admin-mesh">
      <div className="page-shell max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard?tab=events")}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Events
        </button>

        <form onSubmit={handleSubmit} className="page-surface flex flex-col">
          <div className="h-1 w-full bg-linear-to-r from-teal-400 via-primary to-emerald-400" />

          {/* Event summary */}
          <header className="border-b border-border px-4 py-5 sm:px-6 sm:py-6">
            <span className="eyebrow mb-3">Event registration</span>
            <h1 className="font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
              {event.title}
            </h1>

            <div className="meta-strip mt-3">
              <span>
                <CalendarDays className="h-3.5 w-3.5" />
                {formatEventDate(event.eventDate || event.date || event.startDate)}
              </span>
              {event.time && (
                <span>
                  <Clock className="h-3.5 w-3.5" />
                  {event.time}
                </span>
              )}
              {event.location && (
                <span>
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              )}
              <span>
                <Receipt className="h-3.5 w-3.5" />
                {fee > 0 ? `৳${fee} registration fee` : "Free entry"}
              </span>
            </div>

            {event.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            )}
          </header>

          {/* Your details */}
          <section className="space-y-4 border-b border-border px-4 py-5 sm:px-6">
            <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <UserRound className="h-3.5 w-3.5" />
              Your details
            </h2>

            <TextField
              label="Full name"
              required
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. Rahim Uddin"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                label="Email"
                required
                type="email"
                value={form.memberEmail}
                onChange={(e) => set("memberEmail", e.target.value)}
                placeholder="you@example.com"
              />
              <TextField
                label="Phone"
                required
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                label="Student ID"
                required
                value={form.studentId}
                onChange={(e) => set("studentId", e.target.value)}
                placeholder="e.g. 190101"
              />
              <SelectField
                label="Department"
                value={form.department}
                onValueChange={(v) => set("department", v)}
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              />
            </div>

            <TextField
              label="Session / batch"
              value={form.session}
              onChange={(e) => set("session", e.target.value)}
              placeholder="e.g. 2019-20"
            />
          </section>

          {/* Payment */}
          <section className="space-y-4 border-b border-border px-4 py-5 sm:px-6">
            <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Receipt className="h-3.5 w-3.5" />
              Payment
            </h2>

            {fee > 0 ? (
              <p className="rounded-xl border border-border bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                Send <strong className="text-foreground">৳{fee}</strong> to the
                club account, then enter the transaction ID and attach a
                screenshot. An admin verifies the payment before approving
                your seat.
              </p>
            ) : (
              <p className="rounded-xl border border-border bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                This event is free. Payment details are optional — leave them
                blank unless an organiser asked for them.
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                label="Payment method"
                value={form.paymentMethod}
                onValueChange={(v) => set("paymentMethod", v)}
                options={PAYMENT_METHODS}
              />
              <TextField
                label="Amount paid"
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder={fee > 0 ? String(fee) : "0"}
              />
            </div>

            <TextField
              label="Transaction ID"
              required={needsPayment}
              value={form.transactionId}
              onChange={(e) => set("transactionId", e.target.value)}
              placeholder="e.g. 9F2K1LX8QP"
              hint="The reference number from your bKash / Nagad / bank receipt."
            />

            <ImageDropzone
              label="Payment screenshot"
              required={needsPayment}
              value={form.paymentProof}
              onChange={(url) => set("paymentProof", url)}
              onError={(msg) => {
                setFieldError(msg);
                swalError(msg, "Upload failed");
              }}
              aspectRatio="4/3"
              helperText="Upload the receipt or screenshot. Stored on ImgBB. Max 5MB."
            />
          </section>

          {/* Notes */}
          <section className="space-y-4 px-4 py-5 sm:px-6">
            <TextAreaField
              label="Anything else we should know?"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={4}
              placeholder="Dietary needs, accessibility requirements, team members…"
            />
          </section>

          {/* Footer */}
          <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-card/85 px-4 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
              Your seat is confirmed only after an admin approves it.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard?tab=events")}
                disabled={submitting}
                className="rounded-xl h-10 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl h-10 min-w-[10rem] gap-2 font-semibold text-xs sm:text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Ticket className="h-4 w-4" />
                    Submit registration
                  </>
                )}
              </Button>
            </div>
          </div>

          {fieldError && (
            <p className="px-4 pb-4 text-xs text-destructive sm:px-6" role="alert">
              {fieldError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
