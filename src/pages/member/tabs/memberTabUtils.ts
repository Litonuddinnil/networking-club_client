 /**
 * memberTabUtils.ts
 * -----------------
 * Shared helpers + strongly-typed models used by every per-tab view in the member dashboard.
 * Lifted out of MemberDashboard.tsx so each tab becomes a self-contained,
 * fully-typed component file under src/pages/member/tabs/.
 */

import React from "react";

/* -------------------------------------------------------------------------- */
/*                                Core Models                                 */
/* -------------------------------------------------------------------------- */

/**
 * Represents a member student profile in the system.
 */
export interface MemberStudent {
  _id?: string;
  id?: string | number;
  memberId?: string | number;
  name?: string;
  displayName?: string;
  fullName?: string;
  email?: string;
  role?: "member" | "admin" | "moderator" | "executive" | "lead" | string;
  designation?: string;
  department?: string;
  dept?: string;
  batch?: string;
  session?: string;
  phone?: string;
  contact?: string;
  attendance?: number;
  attendanceRate?: number;
  xp?: number;
  level?: number;
  joinedDate?: string;
  createdAt?: string;
  photoURL?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  badges?: string[];
  status?: "active" | "inactive" | "pending" | "suspended" | string;
}

// Backwards compatibility alias
export type StudentProfile = MemberStudent;

/**
 * Represents an announcement or official notice.
 */
export interface AnnouncementItem {
  _id?: string;
  id?: string;
  title: string;
  content?: string;
  description?: string;
  category?: "Notice" | "Urgent" | "General" | "Event" | "Academic" | string;
  date?: string;
  createdAt?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  author?: string;
  authorRole?: string;
  link?: string;
}

/**
 * Represents a club event, workshop, or webinar.
 */
export interface EventItem {
  _id?: string;
  id?: string | number;
  title: string;
  description?: string;
  date?: string;
  eventDateTime?: string;
  time?: string;
  location?: string;
  venue?: string;
  type?: "Workshop" | "Webinar" | "Seminar" | "Bootcamp" | "Contest" | "Meetup" | string;
  image?: string;
  coverImage?: string;
  status?: "upcoming" | "live" | "completed" | "past" | "cancelled" | string;
  capacity?: number;
  registeredCount?: number;
  speaker?: string;
  speakerRole?: string;
  tags?: string[];
}

/**
 * Represents a member's event ticket / registration record.
 */
export interface RegistrationItem {
  _id?: string;
  id?: string;
  eventId: string | number;
  eventTitle?: string;
  memberEmail?: string;
  email?: string;
  memberId?: string | number;
  memberName?: string;
  status?: "registered" | "attended" | "waitlist" | "cancelled" | string;
  registeredAt?: string;
  registrationDate?: string;
  ticketId?: string;
  qrCode?: string;
}

/**
 * Represents a single session attendance log entry.
 */
export interface AttendanceItem {
  _id?: string;
  id?: string;
  memberId?: string | number;
  memberEmail?: string;
  email?: string;
  topic?: string;
  session?: string;
  title?: string;
  date?: string;
  time?: string;
  status?: "present" | "absent" | "late" | "excused" | string;
  note?: string;
  verifiedBy?: string;
}

/**
 * Represents a payment transaction, membership fee, or subscription.
 */
export interface PaymentItem {
  _id?: string;
  id?: string;
  memberId?: string | number;
  memberEmail?: string;
  email?: string;
  month?: string;
  purpose?: string;
  title?: string;
  amount: number | string;
  status?: "approved" | "paid" | "pending" | "rejected" | string;
  method?: "bKash" | "Nagad" | "Rocket" | "Bank" | "Cash" | string;
  paymentMethod?: string;
  transactionId?: string;
  trxId?: string;
  date?: string;
  createdAt?: string;
  note?: string;
  receiptUrl?: string;
}

/**
 * Represents a community post, blog article, or technical story.
 */
export interface PostItem {
  _id?: string;
  id?: string;
  title: string;
  content?: string;
  description?: string;
  category?: string;
  date?: string;
  createdAt?: string;
  author?: string;
  authorName?: string;
  authorAvatar?: string;
  coverImage?: string;
  image?: string;
  tags?: string[];
  readTime?: string;
  likes?: number;
  commentsCount?: number;
}

/**
 * Represents a club gallery image.
 */
export interface GalleryItem {
  _id?: string;
  id?: string;
  title?: string;
  imageUrl?: string;
  url?: string;
  caption?: string;
  category?: string;
  date?: string;
  album?: string;
  likes?: number;
}

/**
 * Member portal configuration and toggle state.
 */
export interface MemberSettingsState {
  emailNotifications: boolean;
  eventReminders: boolean;
  paymentAlerts: boolean;
  leaderboardVisibility: boolean;
  showContactInfo: boolean;
  autoCheckInPass: boolean;
}

/* -------------------------------------------------------------------------- */
/*                            Tab Prop Interfaces                             */
/* -------------------------------------------------------------------------- */

export interface TabNavHandler {
  (targetTab: string): void;
}

export interface CommonTabProps {
  dataWarning?: React.ReactNode;
  onNavigate?: TabNavHandler;
}

export interface AnnouncementsTabProps extends CommonTabProps {
  items?: AnnouncementItem[];
}

export interface EventsTabProps extends CommonTabProps {
  events?: EventItem[];
  myRegistrations?: RegistrationItem[];
  student?: MemberStudent;
}

export interface MyRegistrationsTabProps extends CommonTabProps {
  myRegistrations?: RegistrationItem[];
  events?: EventItem[];
  student?: MemberStudent;
}

export interface AttendanceTabProps extends CommonTabProps {
  myAttendance?: AttendanceItem[];
}

export interface PaymentsTabProps extends CommonTabProps {
  myPayments?: PaymentItem[];
}

export interface PostsTabProps extends CommonTabProps {
  posts?: PostItem[];
}

export interface GalleryTabProps extends CommonTabProps {
  gallery?: GalleryItem[];
}

export interface ProfileTabProps extends CommonTabProps {
  student?: MemberStudent;
  onTabNavigate?: TabNavHandler;
}

export interface SettingsTabProps extends CommonTabProps {
  student?: MemberStudent;
  onSaveSettings?: (settings: MemberSettingsState) => void;
}

/**
 * Overall MemberDashboard Root Props interface.
 */
export interface MemberDashboardProps {
  tab?: string;
  activeTab?: string;
  user?: MemberStudent;
  activeStudent?: MemberStudent;
  matchedUser?: MemberStudent;
  members?: MemberStudent[];
  posts?: PostItem[];
  notices?: AnnouncementItem[];
  events?: EventItem[];
  announcements?: AnnouncementItem[];
  gallery?: GalleryItem[];
  courses?: any[];
  devices?: any[];
  sponsors?: any[];
  payments?: PaymentItem[];
  attendance?: AttendanceItem[];
  eventRegistrations?: RegistrationItem[];
  dataWarning?: React.ReactNode;
  onNavigate?: (tab: string) => void;
  onRefreshData?: () => void;
}

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

/**
 * Create a `handleTabNavigate(targetTab)` function that prefers the prop
 * callback and falls back to react-router navigation.
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
 * Colour palette used by MemberEventsView for per-type theme styling.
 */
export interface EventTheme {
  from: string;
  to: string;
  chip: string;
  chipText: string;
  chipBorder: string;
}

export const EVENT_TYPE_THEMES: Record<string, EventTheme> = {
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

export const DEFAULT_EVENT_THEME: EventTheme = EVENT_TYPE_THEMES.Workshop;

/**
 * Date formatting helpers
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
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats currency into Bangladeshi Taka (৳) string.
 */
export function formatBDT(amount: number | string = 0): string {
  const num = Number(amount) || 0;
  return `৳ ${num.toLocaleString("en-US")}`;
}

/**
 * Dynamic XP Level & Progression Calculator
 * Every 100 XP grants 1 Level.
 */
export function calculateMemberLevel(xp: number = 0) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const level = Math.max(1, Math.floor(safeXp / 100) + 1);
  const currentLevelXp = safeXp % 100;
  const progressPercent = Math.min(100, Math.max(0, currentLevelXp));
  const nextLevelXp = 100 - currentLevelXp;

  return {
    level,
    currentLevelXp,
    progressPercent,
    nextLevelXp,
    totalXp: safeXp,
  };
}

/**
 * Resolves a dynamic CSS class based on status mapping.
 */
export function statusChipClass(
  status: string,
  variants: Record<string, string>,
  fallback = "bg-amber-500/10 border-amber-500/30 text-amber-400",
): string {
  const key = (status || "").toLowerCase().trim();
  return variants[key] || fallback;
}