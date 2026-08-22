import React, { useMemo, useState } from "react";
import {
  CreditCard,
  Filter,
  Hash,
  Calendar,
  Wallet,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownRight,
} from "lucide-react";
import { PaymentItem, PaymentsTabProps } from "./memberTabUtils";

type FilterStatus = "all" | "approved" | "pending" | "rejected" | "paid";

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  approved: {
    badge:
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    label: "Approved",
  },
  paid: {
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    label: "Paid",
  },
  pending: {
    badge: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    label: "Pending",
  },
  rejected: {
    badge: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    label: "Rejected",
  },
};

const DEFAULT_STATUS_STYLE = {
  badge: "bg-slate-500/10 border-slate-500/30 text-slate-300",
  label: "Unknown",
};

function normalizeStatus(raw?: string): FilterStatus {
  const s = (raw || "").toLowerCase().trim();
  if (s === "approved" || s === "paid") return "approved";
  if (s === "pending") return "pending";
  if (s === "rejected") return "rejected";
  return "all";
}

function formatAmount(amount: number | string | undefined): string {
  if (amount === undefined || amount === null || amount === "") return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return String(amount);
  return `৳${n.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

function formatDate(raw?: string): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MemberMyPaymentsView({
  dataWarning,
  myPayments,
}: PaymentsTabProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  const items = useMemo<PaymentItem[]>(() => myPayments ?? [], [myPayments]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (filter !== "all" && normalizeStatus(p.status) !== filter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [
          p.month,
          p.purpose,
          p.title,
          p.method,
          p.paymentMethod,
          p.transactionId,
          p.trxId,
          p.note,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, filter, search]);

  const totals = useMemo(() => {
    const approved = items
      .filter((p) => normalizeStatus(p.status) === "approved")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pending = items
      .filter((p) => normalizeStatus(p.status) === "pending")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return { approved, pending, count: items.length };
  }, [items]);

  const filterOptions: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "approved", label: "Approved" },
    { key: "pending", label: "Pending" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      {dataWarning ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {dataWarning}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
            <Receipt className="h-3.5 w-3.5" /> Total records
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {totals.count}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved total
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-200">
            {formatAmount(totals.approved)}
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-300">
            <Clock className="h-3.5 w-3.5" /> Pending total
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-200">
            {formatAmount(totals.pending)}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                filter === opt.key
                  ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200"
                  : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search month, trx id, note…"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none sm:w-72"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Month / Title</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Trx ID</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    <Wallet className="mx-auto mb-2 h-6 w-6 opacity-60" />
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => {
                  const statusKey = normalizeStatus(p.status);
                  const style = STATUS_STYLES[statusKey] ?? DEFAULT_STATUS_STYLE;
                  const monthOrTitle = p.month || p.title || p.purpose || "—";
                  return (
                    <tr
                      key={p._id || p.id || `${monthOrTitle}-${idx}`}
                      className="text-slate-200 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5 text-cyan-300" />
                          <span className="font-medium">{monthOrTitle}</span>
                        </div>
                        {p.purpose && p.title ? (
                          <div className="ml-5 text-xs text-slate-400">
                            {p.title}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-white">
                          <ArrowDownRight className="h-3.5 w-3.5 text-emerald-300" />
                          {formatAmount(p.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {p.method || p.paymentMethod || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Hash className="h-3 w-3 text-slate-500" />
                          {p.transactionId || p.trxId || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          {formatDate(p.date)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {items.some((p) => p.status?.toLowerCase() === "rejected") ? (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2 text-xs text-rose-200">
          <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          Some payments were rejected. Contact an admin if you believe this is a
          mistake.
        </div>
      ) : null}
    </div>
  );
}
