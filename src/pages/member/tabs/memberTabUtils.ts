/**
 * memberTabUtils.ts
 * -----------------
 * Shared helpers + types used by every per-tab view in the member dashboard.
 * Lifted out of MemberDashboard.tsx so each tab becomes a self-contained
 * component file under src/pages/member/tabs/.
 */

import React from "react";

export interface MemberStudent {
  id?: string;
  memberId?: string;
  _id?: string;
  name?: string;
  displayName?: string;
  email?: string;
  role?: "member" | "admin" | string;
  department?: string;
  attendance?: number;
  xp?: number;
  joinedDate?: string;
  photoURL?: string;
}

export interface TabNavHandler {
  (targetTab: string): void;
}

export interface CommonTabProps {
  dataWarning?: React.ReactNode;
  onNavigate?: TabNavHandler;
}

export interface PaymentsTabProps extends CommonTabProps {
  myPayments: any[];
}

export interface AttendanceTabProps extends CommonTabProps {
  myAttendance: any[];
}

export interface EventsTabProps extends CommonTabProps {
  events: any[];
  myRegistrations: any[];
  student: MemberStudent;
}

export interface PostsTabProps extends CommonTabProps {
  posts: any[];
}

export interface GalleryTabProps extends CommonTabProps {
  gallery: any[];
}

export interface AnnouncementsTabProps extends CommonTabProps {
  items: any[];
}

export interface ProfileTabProps extends CommonTabProps {
  student: MemberStudent;
  onTabNavigate?: TabNavHandler;
}

export interface SettingsTabProps extends CommonTabProps {}

export interface MyRegistrationsTabProps extends CommonTabProps {
  myRegistrations: any[];
  events: any[];
  student: MemberStudent;
}

/**
 * Create a `handleTabNavigate(targetTab)` function that prefers the prop
 * callback and falls back to react-router navigation. Each tab uses this
 * to keep the dashboard routing consistent.
 */
export function createTabNavigator(
  onNavigate?: TabNavHandler,
  navigate?: (path: string) => void,
): TabNavHandler {
  return (targetTab: string) => {
    if (onNavigate) {
      onNavigate(targetTab);
      return;
    }
    if (navigate) {
      navigate(targetTab === "dashboard" ? "/dashboard" : `/dashboard?tab=${targetTab}`);
    }
  };
}

/**
 * Colour palette used by MemberEventsView for the per-type gradient fallback.
 * Centralised so other future tab pages can reuse the vocabulary.
 */
export const EVENT_TYPE_THEMES: Record<
  string,
  {
    from: string;
    to: string;
    chip: string;
    chipText: string;
    chipBorder: string;
  }
> = {
  Workshop: {
    from: "from-emerald-500/30",
    to: "to-teal-500/10",
    chip: "bg-emerald-500/15",
    chipText: "text-emerald-300",
    chipBorder: "border-emerald-500/30",
  },
  Webinar: {
    from: "from-blue-500/30",
    to: "to-cyan-500/10",
    chip: "bg-blue-500/15",
    chipText: "text-blue-300",
    chipBorder: "border-blue-500/30",
  },
  Seminar: {
    from: "from-violet-500/30",
    to: "to-fuchsia-500/10",
    chip: "bg-violet-500/15",
    chipText: "text-violet-300",
    chipBorder: "border-violet-500/30",
  },
  Bootcamp: {
    from: "from-amber-500/30",
    to: "to-orange-500/10",
    chip: "bg-amber-500/15",
    chipText: "text-amber-300",
    chipBorder: "border-amber-500/30",
  },
  Contest: {
    from: "from-rose-500/30",
    to: "to-pink-500/10",
    chip: "bg-rose-500/15",
    chipText: "text-rose-300",
    chipBorder: "border-rose-500/30",
  },
};

export const DEFAULT_EVENT_THEME = EVENT_TYPE_THEMES.Workshop;

/**
 * Tiny helpers shared across multiple tab components.
 */
export function formatLongDate(input?: string): string {
  if (!input) return "Date TBD";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(input?: string): string {
  if (!input) return "TBD";
  return input;
}

export function statusChipClass(
  status: string,
  variants: Record<string, string>,
  fallback = "bg-amber-500/10 border-amber-500/30 text-amber-400",
): string {
  const key = (status || "").toLowerCase();
  return variants[key] || fallback;
}