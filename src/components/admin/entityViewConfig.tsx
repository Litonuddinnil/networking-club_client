import React from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  FileText,
  Globe,
  Hash,
  Image as ImageIcon,
  Image as ImageLucide,
  Link as LinkIcon,
  Mail,
  MapPin,
  Megaphone,
  Tag,
  Type,
  UserCircle,
  Users,
} from "lucide-react";

import {
  EntityField,
  formatDetailDate,
  StatusBadge,
} from "@/components/admin/EntityViewDialog";

/**
 * Field/hero/status configuration for every admin entity, keyed by kind.
 *
 * Extracted out of AdminDashboard so the routed detail page
 * (/dashboard/:entity/:id) and the card lists render exactly the same
 * set of fields. It is a pure function of (kind, record) — no component
 * state is captured — so it is safe to call from anywhere.
 */
export interface EntityViewConfig {
  title: string;
  description?: string;
  accentIcon?: React.ReactNode;
  status?: React.ReactNode;
  hero?: React.ReactNode;
  fields: EntityField[];
  rawJson?: Record<string, unknown>;
}

export const coverSrc = (rec: any) => rec?.coverImage || rec?.imageUrl || rec?.image;
export const idOf = (rec: any) => rec?._id || rec?.id || "—";

export const viewConfigFor = (
  kind: string | undefined,
  record: any
): EntityViewConfig | null => {
  if (!kind || !record) return null;

  if (kind === "event") {
    return {
      title: record.title || record.name || "Untitled event",
      description: `${record.type || record.category || "Event"} · ${
        record.eventDate || record.date || "Date TBA"
      }`,
      accentIcon: <Calendar className="w-5 h-5" />,
      status: <StatusBadge status={record.status} />,
      hero: coverSrc(record) ? (
        <img
          src={coverSrc(record)}
          alt={record.title || "Event cover"}
          className="w-full h-48 sm:h-56 object-cover"
        />
      ) : undefined,
      fields: [
        { label: "Title", value: record.title || "—", icon: <Type className="w-3 h-3" />, fullWidth: true },
        { label: "Type", value: record.type || record.category || "—", icon: <Tag className="w-3 h-3" /> },
        { label: "Status", value: record.status || "upcoming", icon: <Hash className="w-3 h-3" /> },
        {
          label: "Date",
          value: formatDetailDate(record.eventDate || record.date),
          icon: <Calendar className="w-3 h-3" />,
        },
        {
          label: "Time",
          value: record.time || "—",
          icon: <Clock className="w-3 h-3" />,
        },
        {
          label: "Location",
          value: record.location || record.venue || "—",
          icon: <MapPin className="w-3 h-3" />,
          fullWidth: true,
        },
        {
          label: "Description",
          value: record.description || "—",
          icon: <FileText className="w-3 h-3" />,
          fullWidth: true,
        },
        {
          label: "Registered / Capacity",
          value:
            record.capacity != null
              ? `${record.registeredCount ?? 0} / ${record.capacity}`
              : `${record.registeredCount ?? 0}`,
          icon: <Users className="w-3 h-3" />,
        },
        {
          label: "Cover Image",
          value: coverSrc(record) ? "View image" : "—",
          icon: <ImageLucide className="w-3 h-3" />,
          isLink: Boolean(coverSrc(record)),
          href: coverSrc(record) || undefined,
          fullWidth: true,
        },
        {
          label: "ID",
          value: idOf(record),
          icon: <Hash className="w-3 h-3" />,
          copyable: true,
          copyText: String(idOf(record)),
        },
      ],
      rawJson: record as Record<string, unknown>,
    };
  }

  if (kind === "post") {
    return {
      title: record.title || "Untitled post",
      description: record.category || "Article",
      accentIcon: <BookOpen className="w-5 h-5" />,
      status: <StatusBadge status={record.status} />,
      hero: coverSrc(record) ? (
        <img
          src={coverSrc(record)}
          alt={record.title || "Post cover"}
          className="w-full h-48 sm:h-56 object-cover"
        />
      ) : undefined,
      fields: [
        { label: "Title", value: record.title || "—", icon: <Type className="w-3 h-3" />, fullWidth: true },
        { label: "Category", value: record.category || "—", icon: <Tag className="w-3 h-3" /> },
        { label: "Status", value: record.status || "published", icon: <Hash className="w-3 h-3" /> },
        { label: "Author", value: record.author || record.authorName || "—", icon: <UserCircle className="w-3 h-3" /> },
        { label: "Date", value: record.date || "—", icon: <Calendar className="w-3 h-3" /> },
        {
          label: "Content",
          value: record.content || record.excerpt || "—",
          icon: <FileText className="w-3 h-3" />,
          fullWidth: true,
        },
        {
          label: "Cover Image",
          value: coverSrc(record) ? "View image" : "—",
          icon: <ImageLucide className="w-3 h-3" />,
          isLink: Boolean(coverSrc(record)),
          href: coverSrc(record) || undefined,
          fullWidth: true,
        },
        {
          label: "ID",
          value: idOf(record),
          icon: <Hash className="w-3 h-3" />,
          copyable: true,
          copyText: String(idOf(record)),
        },
      ],
      rawJson: record as Record<string, unknown>,
    };
  }

  if (kind === "announcement") {
    return {
      title: record.title || "Announcement",
      description: record.category || "Notice",
      accentIcon: <Megaphone className="w-5 h-5" />,
      status: <StatusBadge status={record.status} />,
      hero: coverSrc(record) ? (
        <img
          src={coverSrc(record)}
          alt={record.title || "Announcement cover"}
          className="w-full h-48 sm:h-56 object-cover"
        />
      ) : undefined,
      fields: [
        { label: "Title", value: record.title || "—", icon: <Type className="w-3 h-3" />, fullWidth: true },
        { label: "Category", value: record.category || "—", icon: <Tag className="w-3 h-3" /> },
        { label: "Status", value: record.status || "published", icon: <Hash className="w-3 h-3" /> },
        { label: "Date", value: record.date || "—", icon: <Calendar className="w-3 h-3" /> },
        {
          label: "Content",
          value: record.content || "—",
          icon: <FileText className="w-3 h-3" />,
          fullWidth: true,
        },
        {
          label: "ID",
          value: idOf(record),
          icon: <Hash className="w-3 h-3" />,
          copyable: true,
          copyText: String(idOf(record)),
        },
      ],
      rawJson: record as Record<string, unknown>,
    };
  }

  if (kind === "gallery") {
    return {
      title: record.title || "Gallery item",
      description: record.category || "Image",
      accentIcon: <ImageIcon className="w-5 h-5" />,
      hero: coverSrc(record) ? (
        <img
          src={coverSrc(record)}
          alt={record.title || "Gallery image"}
          className="w-full h-56 sm:h-72 object-cover"
        />
      ) : undefined,
      fields: [
        { label: "Title", value: record.title || "—", icon: <Type className="w-3 h-3" />, fullWidth: true },
        { label: "Category", value: record.category || "—", icon: <Tag className="w-3 h-3" /> },
        { label: "Date", value: record.date || "—", icon: <Calendar className="w-3 h-3" /> },
        {
          label: "Image URL",
          value: coverSrc(record) || "—",
          icon: <LinkIcon className="w-3 h-3" />,
          copyable: true,
          copyText: coverSrc(record) || "",
          fullWidth: true,
        },
        {
          label: "ID",
          value: idOf(record),
          icon: <Hash className="w-3 h-3" />,
          copyable: true,
          copyText: String(idOf(record)),
        },
      ],
      rawJson: record as Record<string, unknown>,
    };
  }

  if (kind === "member") {
    return {
      title: record.name || record.displayName || record.email || "Member",
      description: record.email || record.memberId || "—",
      accentIcon: <UserCircle className="w-5 h-5" />,
      status: <StatusBadge status={record.status} />,
      fields: [
        { label: "Name", value: record.name || record.displayName || "—", icon: <UserCircle className="w-3 h-3" />, fullWidth: true },
        { label: "Email", value: record.email || "—", icon: <Mail className="w-3 h-3" /> },
        { label: "Member ID", value: record.memberId || "—", icon: <Hash className="w-3 h-3" /> },
        { label: "Role", value: record.role || "member", icon: <Tag className="w-3 h-3" /> },
        { label: "Status", value: record.status || "—", icon: <Hash className="w-3 h-3" /> },
        { label: "Department", value: record.department || "—", icon: <Globe className="w-3 h-3" /> },
        {
          label: "ID",
          value: idOf(record),
          icon: <Hash className="w-3 h-3" />,
          copyable: true,
          copyText: String(idOf(record)),
        },
      ],
      rawJson: record as Record<string, unknown>,
    };
  }

  // Generic fallback so any other kind still opens something usable.
  return {
    title: `${kind}: ${idOf(record)}`,
    description: undefined,
    accentIcon: <Eye className="w-5 h-5" />,
    fields: Object.entries(record || {}).map(([k, v]) => ({
      label: k,
      value: typeof v === "string" || typeof v === "number" ? String(v) : JSON.stringify(v),
    })),
    rawJson: (record as Record<string, unknown>) || {},
  };
};
