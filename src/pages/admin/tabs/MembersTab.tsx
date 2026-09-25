import React, { useMemo, useState } from "react";
import {
  Check,
  Clock,
  Eye,
  Mail,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Users as UsersIcon,
  Crown,
  IdCard,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminCrudToolbar, { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import EmptyState from "@/components/admin/EmptyState";
import MemberCard from "@/components/admin/cards/MemberCard";
import { cn } from "@/lib/utils";

interface MembersTabProps {
  members: any[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onApprove: (id: string) => void;
  onToggleRole: (member: any) => void;
  onDelete: (id: string) => void;
  onView: (member: any) => void;
}

type RoleFilter = "all" | "admin" | "member";
type StatusFilter = "all" | "active" | "pending";
type SortKey = "name" | "role" | "joined";

function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatJoinDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const isAdminRole = (r?: string) => !!r && ["admin", "lead", "president"].includes(r.toLowerCase());
const isPendingStatus = (s?: string) => !!s && s.toLowerCase() === "pending";
const getMemberId = (m: any) => m._id || m.id || m.memberId || m.email || "";

function exportMembersToCSV(members: any[]) {
  const headers = ["Name", "Email", "Phone", "Role", "Status", "Department", "Batch", "Student ID", "Member ID", "Joined At"];
  const rows = members.map((m) => [
    m.name || m.displayName || "", m.email || "", m.phone || "",
    m.role || "member", m.status || "pending", m.department || "",
    m.batch || "", m.studentId || "", m.memberId || m.id || m._id || "",
    m.joinedAt || m.createdAt || "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `members-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function MembersTab({
  members, totalCount, searchTerm, onSearchChange,
  viewMode, onViewModeChange, onApprove, onToggleRole, onDelete, onView,
}: MembersTabProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats from full member list
  const stats = useMemo(() => ({
    total: members.length,
    admins: members.filter((m) => isAdminRole(m.role)).length,
    active: members.filter((m) => !isPendingStatus(m.status) && m.status).length,
    pending: members.filter((m) => isPendingStatus(m.status)).length,
  }), [members]);

  // Apply role/status filters + sort
  const visibleMembers = useMemo(() => {
    let list = members.slice();
    if (roleFilter !== "all") {
      list = list.filter((m) => roleFilter === "admin" ? isAdminRole(m.role) : !isAdminRole(m.role));
    }
    if (statusFilter !== "all") {
      list = list.filter((m) => statusFilter === "pending" ? isPendingStatus(m.status) : !isPendingStatus(m.status));
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = (a.name || a.displayName || "").localeCompare(b.name || b.displayName || "");
      else if (sortKey === "role") cmp = (isAdminRole(a.role) ? 1 : 0) - (isAdminRole(b.role) ? 1 : 0);
      else cmp = new Date(a.joinedAt || a.createdAt || 0).getTime() - new Date(b.joinedAt || b.createdAt || 0).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [members, roleFilter, statusFilter, sortKey, sortDir]);

  const allVisibleSelected = visibleMembers.length > 0 && visibleMembers.every((m) => selected.has(getMemberId(m)));

  const toggleAllVisible = () => {
    const next = new Set(selected);
    if (allVisibleSelected) visibleMembers.forEach((m) => next.delete(getMemberId(m)));
    else visibleMembers.forEach((m) => next.add(getMemberId(m)));
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());
  const bulkApprove = () => { selected.forEach((id) => onApprove(id)); clearSelection(); };
  const bulkPromote = () => {
    visibleMembers.filter((m) => selected.has(getMemberId(m)) && !isAdminRole(m.role)).forEach((m) => onToggleRole(m));
    clearSelection();
  };
  const bulkDemote = () => {
    visibleMembers.filter((m) => selected.has(getMemberId(m)) && isAdminRole(m.role)).forEach((m) => onToggleRole(m));
    clearSelection();
  };
  const bulkDelete = () => { selected.forEach((id) => onDelete(id)); clearSelection(); };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const emptyMessage = useMemo(() => {
    if (members.length === 0) return { title: "No members yet", description: "Once people register, they'll appear here for approval." };
    if (searchTerm) return { title: "No matches found", description: `No members match "${searchTerm}". Adjust your search or filters.` };
    if (roleFilter !== "all" || statusFilter !== "all") return { title: "No members in this view", description: "Try clearing a filter to see more members." };
    return { title: "No members", description: "The registry is currently empty." };
  }, [members.length, searchTerm, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Club Members Database"
        description="Approve new members, manage roles, and maintain the registry."
        icon={<UsersIcon className="w-5 h-5" />}
      />

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<UsersIcon className="w-4 h-4" />} label="Total Members" value={stats.total} accent="teal" />
        <StatCard icon={<Check className="w-4 h-4" />} label="Active" value={stats.active} accent="emerald" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Pending Approval" value={stats.pending} accent="amber" highlight={stats.pending > 0} />
        <StatCard icon={<Crown className="w-4 h-4" />} label="Admins" value={stats.admins} accent="violet" />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-3">
        <FilterGroup
          label="Role"
          options={[{ label: "All", value: "all" }, { label: "Admins", value: "admin" }, { label: "Members", value: "member" }]}
          value={roleFilter}
          onChange={(v) => setRoleFilter(v as RoleFilter)}
        />
        <div className="hidden sm:block h-5 w-px bg-white/10" />
        <FilterGroup
          label="Status"
          options={[{ label: "All", value: "all" }, { label: "Active", value: "active" }, { label: "Pending", value: "pending" }]}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
        />
      </div>

      {/* Toolbar with sort, export, refresh */}
      <AdminCrudToolbar
        search={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        primaryLabel="Refresh"
        primaryIcon={<RefreshCw className="w-4 h-4" />}
        onPrimary={handleRefresh}
        searchPlaceholder="Search by name, email, or ID... (Press '/')"
        totalCount={totalCount}
        totalLabel="members in database"
        sortValue={sortKey}
        onSortChange={(v) => setSortKey(v as SortKey)}
        sortOrder={sortDir}
        onSortOrderToggle={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
        sortOptions={[
          { label: "Name", value: "name" },
          { label: "Role", value: "role" },
          { label: "Joined Date", value: "joined" },
        ]}
        selectedCount={selected.size}
        onClearSelection={clearSelection}
        onBulkDelete={bulkDelete}
        onExport={() => exportMembersToCSV(visibleMembers)}
        isRefreshing={isRefreshing}
      />

      {/* Bulk-action floating bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-500/30 bg-linear-to-r from-teal-500/15 via-emerald-500/10 to-card backdrop-blur-xl px-4 py-2.5 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-black">{selected.size}</span>
            <span className="font-semibold text-foreground">{selected.size} member{selected.size > 1 ? "s" : ""} selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BulkButton icon={<Check className="w-3.5 h-3.5" />} label="Approve" tone="emerald" onClick={bulkApprove} />
            <BulkButton icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Promote" tone="amber" onClick={bulkPromote} />
            <BulkButton icon={<ShieldOff className="w-3.5 h-3.5" />} label="Demote" tone="sky" onClick={bulkDemote} />
            <BulkButton icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete" tone="rose" onClick={bulkDelete} />
            <button type="button" onClick={clearSelection} className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 transition-colors">Clear</button>
          </div>
        </div>
      )}

      {/* Empty / List / Grid */}
      {visibleMembers.length === 0 ? (
        <EmptyState icon={<UsersIcon className="w-7 h-7" />} title={emptyMessage.title} description={emptyMessage.description} />
      ) : viewMode === "grid" ? (
        <div className="crud-grid">
          {visibleMembers.map((m, idx) => {
            const id = getMemberId(m);
            const isSelected = selected.has(id);
            return (
              <div key={id || idx} className={cn("group relative transition-all duration-200", isSelected && "ring-2 ring-teal-400/60 rounded-2xl")}>
                <label
                  className={cn(
                    "absolute top-3 left-3 z-20 flex h-6 w-6 items-center justify-center rounded-md border cursor-pointer transition-all",
                    isSelected
                      ? "bg-teal-500 border-teal-400 shadow-md"
                      : "bg-black/60 border-white/20 hover:border-teal-400/60 backdrop-blur-md opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                  title={isSelected ? "Deselect" : "Select"}
                >
                  <input type="checkbox" className="sr-only" checked={isSelected} onChange={() => toggleOne(id)} />
                  {isSelected && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                </label>
                <MemberCard
                  member={m}
                  onView={() => onView(m)}
                  onApprove={() => onApprove(id)}
                  onToggleRole={() => onToggleRole(m)}
                  onDelete={() => onDelete(id)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} className="h-4 w-4 accent-teal-500 cursor-pointer" aria-label="Select all visible" />
                </th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3 hidden md:table-cell">Department</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleMembers.map((m, idx) => {
                const id = getMemberId(m);
                const name = m.name || m.displayName || "Anonymous";
                const memberCode = m.memberId || m.studentId || id;
                const role = (m.role || "member").toLowerCase();
                const status = (m.status || "pending").toLowerCase();
                const isAdmin = isAdminRole(role);
                const isPending = isPendingStatus(status);
                const isSelected = selected.has(id);
                return (
                  <tr key={id || idx} className={cn("transition-colors hover:bg-white/[0.03]", isSelected && "bg-teal-500/5")}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(id)} className="h-4 w-4 accent-teal-500 cursor-pointer" aria-label={`Select ${name}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 ring-2 ring-card shrink-0">
                          {m.photoURL && <AvatarImage src={m.photoURL} alt={name} className="object-cover" />}
                          <AvatarFallback className="bg-linear-to-br from-teal-500/30 to-emerald-600/30 text-teal-300 text-xs font-bold font-display">{initials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-foreground truncate">{name}</span>
                            {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </div>
                          {memberCode && (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground truncate">
                              <IdCard className="w-3 h-3 text-teal-400 shrink-0" />
                              <span className="truncate">{memberCode}</span>
                            </div>
                          )}
                          {m.email && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                              <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{m.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-xs">
                        <div className="text-foreground">{m.department || "—"}</div>
                        {m.batch && <div className="font-mono text-[10px] text-muted-foreground">Batch {m.batch}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          <Crown className="w-3 h-3 fill-amber-300 text-amber-300" />
                          {role}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{role}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        isPending ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", isPending ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{formatJoinDate(m.joinedAt || m.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isPending && (
                          <button type="button" onClick={() => onApprove(id)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Approve member">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button type="button" onClick={() => onView(m)} className="p-1.5 rounded-lg text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors" title="View profile">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleRole(m)}
                          className={cn("p-1.5 rounded-lg transition-colors", isAdmin ? "text-amber-400 hover:bg-amber-500/10" : "text-muted-foreground hover:text-amber-400 hover:bg-white/5")}
                          title={isAdmin ? "Demote from Admin" : "Promote to Admin"}
                        >
                          {isAdmin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button type="button" onClick={() => onDelete(id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Remove member">
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
      )}
    </div>
  );
}

function StatCard({ icon, label, value, accent, highlight }: { icon: React.ReactNode; label: string; value: number; accent: "teal" | "emerald" | "amber" | "violet"; highlight?: boolean; }) {
  const accentMap: Record<string, string> = {
    teal: "from-teal-500/20 to-teal-500/5 text-teal-300 border-teal-500/30",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-emerald-500/30",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300 border-amber-500/30",
    violet: "from-violet-500/20 to-violet-500/5 text-violet-300 border-violet-500/30",
  };
  return (
    <div className={cn("relative overflow-hidden rounded-xl border bg-linear-to-br backdrop-blur-xl p-3.5 shadow-md transition-all", accentMap[accent], highlight && "ring-2 ring-amber-400/40 animate-pulse-subtle")}>
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-black/30 p-1.5 backdrop-blur-sm">{icon}</div>
        <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">{label}</div>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="font-display text-2xl font-extrabold text-foreground leading-none">{value}</div>
        {highlight && <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />}
      </div>
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: { label: string; value: string }[]; value: string; onChange: (v: string) => void; }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0">{label}:</span>
      <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-background/40 p-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)} className={cn("px-3 py-1 rounded-lg text-xs font-semibold transition-all", active ? "bg-teal-500/20 text-teal-300 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BulkButton({ icon, label, tone, onClick }: { icon: React.ReactNode; label: string; tone: "emerald" | "amber" | "sky" | "rose"; onClick: () => void; }) {
  const toneMap: Record<string, string> = {
    emerald: "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30",
    sky: "bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30",
    rose: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30",
  };
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all", toneMap[tone])}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
