import React, { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Loader2,
  Pencil,
  Printer,
  RefreshCw,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import { viewConfigFor } from "@/components/admin/entityViewConfig";
import type { EntityField } from "@/components/admin/EntityViewDialog";
import { useAxiosSecure } from "@/hooks/useAxiosSecure";
import { extractApiError } from "@/lib/extractApiError";
import { swalError, swalToast } from "@/lib/swal";
import {
  ENTITY_ROUTES,
  editPath,
  kindFromRouteSegment,
  listPath,
} from "@/lib/entityRoutes";
import { cn } from "@/lib/utils";

/**
 * Routed detail view — /dashboard/:entity/:id
 *
 * Replaces the old EntityViewDialog modal. Because it is a real route the
 * record can be linked, bookmarked and reopened with the back button, and
 * there is room to show every field rather than a cramped scroll area.
 *
 * Field/hero/status configuration is shared with the card lists via
 * `viewConfigFor`, so both views always agree on what a record contains.
 */
export default function EntityDetailPage() {
  const { entity, id } = useParams<{ entity: string; id: string }>();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const kind = kindFromRouteSegment(entity);

  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const endpoint = kind ? ENTITY_ROUTES[kind].endpoint : null;

  const load = useCallback(async () => {
    if (!endpoint || !id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.get(`/api/${endpoint}/${id}`);
      // The API is inconsistent about how it wraps a single record.
      const data =
        res.data?.data ??
        res.data?.post ??
        res.data?.event ??
        res.data?.announcement ??
        res.data?.item ??
        res.data?.member ??
        res.data ??
        null;
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setError("This record no longer exists.");
        setRecord(null);
      } else {
        setRecord(Array.isArray(data) ? data[0] : data);
      }
    } catch (err: any) {
      setError(extractApiError(err, "Failed to load this record."));
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, endpoint, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!kind || !id) return <Navigate to="/dashboard" replace />;

  const cfg = record ? viewConfigFor(kind, record) : null;
  const backTo = listPath(kind);
  const label = ENTITY_ROUTES[kind].label;
  const canEdit = ENTITY_ROUTES[kind].editable;

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard blocked — nothing useful to surface here */
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosSecure.delete(`/api/${endpoint}/${id}`);
      setConfirmOpen(false);
      swalToast(`${label} deleted`);
      navigate(backTo, { replace: true });
    } catch (err: any) {
      swalError(extractApiError(err, "Delete failed."));
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex-1 min-h-0 admin-mesh grid place-items-center p-8">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Loading {label.toLowerCase()}…
        </div>
      </div>
    );
  }

  if (error || !cfg) {
    return (
      <div className="flex-1 min-h-0 admin-mesh">
        <div className="page-shell max-w-2xl">
          <div className="empty-state">
            <TriangleAlert className="mx-auto mb-3 h-8 w-8 text-amber-500" />
            <h1 className="font-display text-lg font-bold text-foreground">
              {label} unavailable
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || "This record could not be displayed."}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <Button onClick={() => navigate(backTo)} className="rounded-xl gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to list
              </Button>
              <Button
                variant="outline"
                onClick={load}
                className="rounded-xl gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sections = groupFields(cfg.fields);

  return (
    <div className="flex-1 min-h-0 admin-mesh">
      {/* Sticky action bar — stays reachable while reading a long record. */}
      <div className="page-topbar">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {ENTITY_ROUTES[kind].tab}
        </button>

        <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground/60">
          /
        </span>
        <span className="hidden sm:inline truncate font-mono text-[11px] text-muted-foreground">
          {id}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy("url", window.location.href)}
            className="rounded-lg gap-1.5 h-9 text-xs"
          >
            {copied === "url" ? (
              <Check className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {copied === "url" ? "Copied" : "Copy link"}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="rounded-lg gap-1.5 h-9 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Print</span>
          </Button>

          {canEdit && (
            <Button
              size="sm"
              onClick={() => navigate(editPath(kind, id))}
              className="rounded-lg gap-1.5 h-9 text-xs font-semibold"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg gap-1.5 h-9 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      <div className="page-shell">
        <article className="page-surface">
          {cfg.hero && <div className="w-full overflow-hidden">{cfg.hero}</div>}

          {/* Title block */}
          <header className="border-b border-border px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0">
                {cfg.accentIcon && (
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-inner">
                    {cfg.accentIcon}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
                    {cfg.title}
                  </h1>
                  {cfg.description && (
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      {cfg.description}
                    </p>
                  )}
                </div>
              </div>
              {cfg.status && <div className="shrink-0">{cfg.status}</div>}
            </div>

            <Badge
              variant="outline"
              className="mt-4 border-border bg-muted font-mono text-[10px] text-muted-foreground"
            >
              {label} · {id}
            </Badge>
          </header>

          {/* Fields */}
          <div className="space-y-7 px-4 py-6 sm:px-6">
            {sections.map((section) => (
              <section key={section.name}>
                {section.name !== "__default" && (
                  <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {section.name}
                  </h2>
                )}
                <dl className="detail-grid">
                  {section.fields.map((field, i) => (
                    <DetailCell
                      key={`${section.name}-${i}`}
                      field={field}
                      copied={copied === `${section.name}-${i}`}
                      onCopy={(text) => copy(`${section.name}-${i}`, text)}
                    />
                  ))}
                </dl>
              </section>
            ))}

            {/* Raw payload — collapsed, for debugging a record. */}
            {cfg.rawJson && (
              <section>
                <button
                  type="button"
                  onClick={() => setShowRaw((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  {showRaw ? "Hide" : "Show"} raw JSON
                </button>
                {showRaw && (
                  <pre className="mt-3 max-h-96 overflow-auto rounded-xl border border-border bg-muted p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {JSON.stringify(cfg.rawJson, null, 2)}
                  </pre>
                )}
              </section>
            )}
          </div>
        </article>
      </div>

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${label.toLowerCase()}?`}
        description="This record will be permanently removed. This cannot be undone."
        entityName={cfg.title}
        confirmLabel="Yes, delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function DetailCell({
  field,
  copied,
  onCopy,
}: {
  field: EntityField;
  copied: boolean;
  onCopy: (text: string) => void;
}) {
  const copyText =
    field.copyText ??
    (typeof field.value === "string" || typeof field.value === "number"
      ? String(field.value)
      : null);

  return (
    <div className={cn("detail-cell", field.fullWidth && "is-full")}>
      <dt>
        {field.icon}
        <span>{field.label}</span>
        {field.copyable && copyText && (
          <button
            type="button"
            onClick={() => onCopy(copyText)}
            className="ml-auto text-muted-foreground transition hover:text-foreground"
            aria-label={`Copy ${field.label}`}
          >
            {copied ? (
              <Check className="h-3 w-3 text-primary" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}
      </dt>
      <dd className={cn(field.isCode && "font-mono text-[0.8rem]")}>
        {field.isLink && field.href ? (
          <a
            href={field.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
          >
            <span className="truncate">{field.value}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          field.value
        )}
      </dd>
    </div>
  );
}

/** Group fields by their optional `section`, preserving source order. */
function groupFields(fields: EntityField[]) {
  const order: string[] = [];
  const bucket = new Map<string, EntityField[]>();

  for (const f of fields) {
    const name = f.section || "__default";
    if (!bucket.has(name)) {
      bucket.set(name, []);
      order.push(name);
    }
    bucket.get(name)!.push(f);
  }

  return order.map((name) => ({ name, fields: bucket.get(name)! }));
}
