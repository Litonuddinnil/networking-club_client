import React, { useEffect, useMemo, useState } from "react";
import {
  Shield,
  Search,
} from "lucide-react";
import Swal from "sweetalert2";
import { useAxiosSecure } from "../../hooks/useAxiosSecure";
import { ViewMode } from "@/components/admin/AdminCrudToolbar";
import SectionHeading from "@/components/admin/SectionHeading";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import EntityFormDialog from "@/components/admin/EntityFormDialog";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/components/admin/Field";
import ImageDropzone from "@/components/admin/ImageDropzone";

import DashboardTab from "./tabs/DashboardTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import SettingsTab from "./tabs/SettingsTab";
import ProfileTab from "./tabs/ProfileTab";
import MembersTab from "./tabs/MembersTab";
import PostsTab from "./tabs/PostsTab";
import EventsTab from "./tabs/EventsTab";
import AnnouncementsTab from "./tabs/AnnouncementsTab";
import GalleryTab from "./tabs/GalleryTab";
import PaymentsTab from "./tabs/PaymentsTab";
import AttendanceTab from "./tabs/AttendanceTab";
import EventRegistrationsTab from "./tabs/EventRegistrationsTab";

interface AdminDashboardProps {
  activeTab?: string;
  matchedUser?: any;
  members?: any[];
  posts?: any[];
  events?: any[];
  announcements?: any[];
  gallery?: any[];
  notices?: any[];
  courses?: any[];
  devices?: any[];
  sponsors?: any[];
  payments?: any[];
  attendance?: any[];
  eventRegistrations?: any[];
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
  onRefreshData?: () => void;
  onDeleteMember?: (id: string) => void;
  onDeletePost?: (id: string) => void;
  onDeleteEvent?: (id: string) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onDeleteGallery?: (id: string) => void;
  onDeleteNotice?: (id: string) => void;
  onDeleteCourse?: (id: string) => void;
  onDeletePayment?: (id: string) => void;
  onDeleteAttendance?: (id: string) => void;
  onDeleteRegistration?: (id: string) => void;
  onApprovePayment?: (id: string) => void;
  onRejectPayment?: (id: string) => void;
  onEditAttendance?: (id: string, status: string) => void;
  onCancelRegistration?: (id: string) => void;
}

const swalTheme = {
  background: "#03070E",
  color: "#fff",
  confirmButtonColor: "#10b981",
} as const;

function toastSuccess(title: string) {
  Swal.fire({
    title,
    icon: "success",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    background: "#03070E",
    color: "#fff",
  });
}

function swalError(text: string) {
  Swal.fire({ title: "Error!", text, icon: "error", ...swalTheme });
}

export default function AdminDashboard(props: AdminDashboardProps) {
  const axiosSecure = useAxiosSecure();
  const [localTab, setLocalTab] = useState<string>("dashboard");
  const activeTab = props.activeTab || localTab;

  const [members, setMembers] = useState<any[]>(props.members || []);
  const [posts, setPosts] = useState<any[]>(props.posts || []);
  const [events, setEvents] = useState<any[]>(props.events || []);
  const [announcements, setAnnouncements] = useState<any[]>(
    props.announcements || props.notices || []
  );
  const [gallery, setGallery] = useState<any[]>(props.gallery || []);
  const [payments, setPayments] = useState<any[]>(props.payments || []);
  const [attendance, setAttendance] = useState<any[]>(props.attendance || []);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>(
    props.eventRegistrations || []
  );
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [annDialogOpen, setAnnDialogOpen] = useState(false);
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);

  const [postForm, setPostForm] = useState({ title: "", category: "General", content: "" });
  const [eventForm, setEventForm] = useState({
    title: "",
    type: "Workshop",
    eventDateTime: "",
    location: "CSE Lab 1, JSTU Campus",
    description: "",
    image: "",
  });
  const [annForm, setAnnForm] = useState({ title: "", category: "Notice", content: "" });
  const [galleryForm, setGalleryForm] = useState({ title: "", category: "Workshop", imageUrl: "" });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: "danger" | "primary";
    onConfirm: () => Promise<void> | void;
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    variant: "danger",
    onConfirm: () => {},
  });

  const [appSettings, setAppSettings] = useState({
    language: "en",
    allowRegistration: true,
    emailNotifications: true,
    maintenanceMode: false,
    themeAccent: "emerald",
    autoBackup: true,
  });

  // settings persistence
  useEffect(() => {
    const saved = localStorage.getItem("jstu_portal_config");
    if (saved) {
      try {
        setAppSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("jstu_portal_config", JSON.stringify(appSettings));
    Swal.fire({
      title: appSettings.language === "bn" ? "কনফিগারেশন সেভ হয়েছে!" : "Settings Saved!",
      text:
        appSettings.language === "bn"
          ? "পোর্টাল কনফিগারেশন সফলভাবে আপডেট করা হয়েছে।"
          : "System configuration updated successfully.",
      icon: "success",
      ...swalTheme,
    });
  };

  useEffect(() => {
    if (props.members) setMembers(props.members);
    if (props.posts) setPosts(props.posts);
    if (props.events) setEvents(props.events);
    if (props.announcements || props.notices)
      setAnnouncements(props.announcements || props.notices || []);
    if (props.gallery) setGallery(props.gallery);
    if (props.payments) setPayments(props.payments);
    if (props.attendance) setAttendance(props.attendance);
    if (props.eventRegistrations) setEventRegistrations(props.eventRegistrations);
  }, [
    props.members,
    props.posts,
    props.events,
    props.announcements,
    props.notices,
    props.gallery,
    props.payments,
    props.attendance,
    props.eventRegistrations,
  ]);

  const fetchAdminData = async () => {
    if (props.onRefreshData) {
      props.onRefreshData();
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        axiosSecure.get("/api/members"),
        axiosSecure.get("/api/posts"),
        axiosSecure.get("/api/events"),
        axiosSecure.get("/api/announcements"),
        axiosSecure.get("/api/gallery"),
        axiosSecure.get("/api/payments"),
        axiosSecure.get("/api/attendance"),
        axiosSecure.get("/api/event-registrations"),
      ]);
      const get = (i: number) =>
        results[i].status === "fulfilled" ? (results[i] as any).value.data : [];
      setMembers(get(0));
      setPosts(get(1));
      setEvents(get(2));
      setAnnouncements(get(3));
      setGallery(get(4));
      setPayments(get(5));
      setAttendance(get(6));
      setEventRegistrations(get(7));
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!props.members && !props.posts) fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateTab = (tab: string) => {
    if (props.onNavigate) props.onNavigate(tab);
    else setLocalTab(tab);
  };

  const ask = (cfg: {
    title: string;
    description: string;
    confirmLabel: string;
    variant?: "danger" | "primary";
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirm({
      open: true,
      title: cfg.title,
      description: cfg.description,
      confirmLabel: cfg.confirmLabel,
      variant: cfg.variant || "danger",
      onConfirm: cfg.onConfirm,
    });
  };

  const handleToggleRole = (member: any) => {
    const recordKey = member._id || member.id || member.memberId || member.email;
    const currentRole = (member.role || "member").toLowerCase();
    const newRole = currentRole === "admin" ? "member" : "admin";
    const actionText = newRole === "admin" ? "Promote to Admin" : "Demote to Member";
    ask({
      title: `${actionText}?`,
      description: `Change ${member.name || member.displayName}'s role to ${newRole.toUpperCase()}.`,
      confirmLabel: `Yes, ${actionText}`,
      variant: "primary",
      onConfirm: async () => {
        try {
          await axiosSecure.patch(`/api/members/${recordKey}`, { role: newRole });
          fetchAdminData();
          setConfirm((c) => ({ ...c, open: false }));
          toastSuccess(`Role updated to ${newRole.toUpperCase()}`);
        } catch (err: any) {
          swalError(err.message || "Failed to update role.");
        }
      },
    });
  };

  const handleUpdateStatus = (id: string, status: string) => {
    ask({
      title: "Approve Member?",
      description: "Activate this member's account now.",
      confirmLabel: "Yes, Approve",
      variant: "primary",
      onConfirm: async () => {
        try {
          await axiosSecure.patch(`/api/members/${id}`, { status });
          fetchAdminData();
          setConfirm((c) => ({ ...c, open: false }));
          toastSuccess(`Member status: ${status}`);
        } catch (err: any) {
          swalError(err.message || "Failed to update member status.");
        }
      },
    });
  };

  const handleDelete = (
    kind: string,
    id: string,
    propHandler?: (id: string) => Promise<void> | void
  ) => {
    const titles: Record<string, string> = {
      member: "Delete Member?",
      post: "Delete Post?",
      event: "Delete Event?",
      announcement: "Delete Announcement?",
      gallery: "Delete Gallery Image?",
      payment: "Delete Payment Record?",
      attendance: "Delete Attendance Record?",
      registration: "Delete Registration?",
    };
    const messages: Record<string, string> = {
      member: "This member record will be permanently deleted.",
      post: "This post will be removed.",
      event: "This event will be removed.",
      announcement: "This announcement will be removed.",
      gallery: "This image will be removed.",
      payment: "This payment record will be permanently deleted.",
      attendance: "This attendance entry will be removed.",
      registration: "This event registration will be cancelled and removed.",
    };
    const endpoints: Record<string, string> = {
      member: "members",
      post: "posts",
      event: "events",
      announcement: "announcements",
      gallery: "gallery",
      payment: "payments",
      attendance: "attendance",
      registration: "event-registrations",
    };
    ask({
      title: titles[kind],
      description: messages[kind],
      confirmLabel: "Yes, Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          if (propHandler) await propHandler(id);
          else {
            await axiosSecure.delete(`/api/${endpoints[kind] || kind + "s"}/${id}`);
            fetchAdminData();
          }
          setConfirm((c) => ({ ...c, open: false }));
          toastSuccess("Deleted");
        } catch (err: any) {
          swalError(err.message || "Delete failed.");
        }
      },
    });
  };

  const adminName = props.matchedUser?.name || props.matchedUser?.displayName || "Admin User";
  const adminEmail = props.matchedUser?.email || "admin@portal.com";

  // charts data
  const memberGrowthData = useMemo(() => {
    const tot = members.length;
    return [
      { month: "Jan", members: Math.max(1, Math.floor(tot * 0.2)) },
      { month: "Feb", members: Math.max(2, Math.floor(tot * 0.35)) },
      { month: "Mar", members: Math.max(3, Math.floor(tot * 0.55)) },
      { month: "Apr", members: Math.max(4, Math.floor(tot * 0.75)) },
      { month: "May", members: tot },
    ];
  }, [members]);

  const departmentData = useMemo(
    () => [
      {
        name: "CSE",
        value: members.filter((m) => m.department?.toUpperCase() === "CSE").length || 4,
      },
      {
        name: "EEE",
        value: members.filter((m) => m.department?.toUpperCase() === "EEE").length || 2,
      },
      {
        name: "Geology",
        value: members.filter((m) => m.department?.toUpperCase() === "GEOLOGY").length || 1,
      },
      {
        name: "Math",
        value: members.filter((m) => m.department?.toUpperCase() === "MATH").length || 1,
      },
    ],
    [members]
  );

  const eventMetricsData = [
    { name: "Cisco Intro", attendees: 45, registrations: 50 },
    { name: "MikroTik Lab", attendees: 32, registrations: 38 },
    { name: "IPv6 Seminar", attendees: 68, registrations: 72 },
    { name: "Security Bootcamp", attendees: 28, registrations: 30 },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

  // filtered lists
  const filteredMembers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.memberId?.toLowerCase().includes(q)
    );
  }, [members, searchTerm]);

  const filteredPosts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [posts, searchTerm]);

  const filteredEvents = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) => e.title?.toLowerCase().includes(q) || e.type?.toLowerCase().includes(q)
    );
  }, [events, searchTerm]);

  const filteredAnnouncements = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return announcements;
    return announcements.filter(
      (a) => a.title?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q)
    );
  }, [announcements, searchTerm]);

  const filteredGallery = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return gallery;
    return gallery.filter(
      (g) => g.title?.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q)
    );
  }, [gallery, searchTerm]);

  const filteredPayments = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        p.memberName?.toLowerCase().includes(q) ||
        p.memberEmail?.toLowerCase().includes(q) ||
        p.month?.toLowerCase().includes(q) ||
        p.transactionId?.toLowerCase().includes(q) ||
        p.status?.toLowerCase().includes(q)
    );
  }, [payments, searchTerm]);

  const filteredAttendance = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return attendance;
    return attendance.filter(
      (a) =>
        a.memberName?.toLowerCase().includes(q) ||
        a.memberEmail?.toLowerCase().includes(q) ||
        a.topic?.toLowerCase().includes(q) ||
        a.date?.toLowerCase().includes(q) ||
        a.status?.toLowerCase().includes(q)
    );
  }, [attendance, searchTerm]);

  const filteredEventRegistrations = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return eventRegistrations;
    return eventRegistrations.filter(
      (r) =>
        r.eventTitle?.toLowerCase().includes(q) ||
        r.memberName?.toLowerCase().includes(q) ||
        r.memberEmail?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );
  }, [eventRegistrations, searchTerm]);

  // counts
  const totalMembers = members.length;
  const activeMembers = members.filter(
    (m) => m.status === "active" || m.status === "Active" || m.status === "approved"
  ).length;
  const pendingApprovals = members.filter(
    (m) => m.status === "pending" || m.status === "Pending"
  ).length;

  const isBn = appSettings.language === "bn";

  // form submitters ---------------------------------------------------
  const submitPost = async () => {
    if (!postForm.title || !postForm.content) {
      swalError("Please fill in title and content.");
      return;
    }
    setFormSubmitting(true);
    try {
      await axiosSecure.post("/api/posts", {
        title: postForm.title,
        category: postForm.category || "General",
        content: postForm.content,
        author: adminName,
        date: new Date().toLocaleDateString(),
      });
      setPostForm({ title: "", category: "General", content: "" });
      setPostDialogOpen(false);
      fetchAdminData();
      toastSuccess("Post published");
    } catch (err: any) {
      swalError(err.message || "Failed to create post.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const submitEvent = async () => {
    if (!eventForm.title || !eventForm.eventDateTime) {
      swalError("Please fill in title and date/time.");
      return;
    }
    setFormSubmitting(true);
    try {
      const dt = new Date(eventForm.eventDateTime);
      const formattedDate = dt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const formattedTime = dt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      await axiosSecure.post("/api/events", {
        title: eventForm.title,
        type: eventForm.type || "Workshop",
        date: formattedDate,
        time: formattedTime,
        location: eventForm.location,
        image:
          eventForm.image ||
          "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80",
        description: eventForm.description || "",
      });
      setEventForm({
        title: "",
        type: "Workshop",
        eventDateTime: "",
        location: "CSE Lab 1, JSTU Campus",
        description: "",
        image: "",
      });
      setEventDialogOpen(false);
      fetchAdminData();
      toastSuccess("Event created");
    } catch (err: any) {
      swalError(err.message || "Failed to create event.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const submitAnnouncement = async () => {
    if (!annForm.title || !annForm.content) {
      swalError("Please fill in title and content.");
      return;
    }
    setFormSubmitting(true);
    try {
      await axiosSecure.post("/api/announcements", {
        title: annForm.title,
        category: annForm.category || "Notice",
        content: annForm.content,
        date: new Date().toLocaleDateString(),
      });
      setAnnForm({ title: "", category: "Notice", content: "" });
      setAnnDialogOpen(false);
      fetchAdminData();
      toastSuccess("Announcement posted");
    } catch (err: any) {
      swalError(err.message || "Failed to post announcement.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const submitGallery = async () => {
    if (!galleryForm.title || !galleryForm.imageUrl) {
      swalError("Please add a title and upload an image.");
      return;
    }
    setFormSubmitting(true);
    try {
      await axiosSecure.post("/api/gallery", {
        title: galleryForm.title,
        imageUrl: galleryForm.imageUrl,
        category: galleryForm.category || "Workshop",
        date: new Date().toLocaleDateString(),
      });
      setGalleryForm({ title: "", category: "Workshop", imageUrl: "" });
      setGalleryDialogOpen(false);
      fetchAdminData();
      toastSuccess("Uploaded to gallery");
    } catch (err: any) {
      swalError(err.message || "Failed to upload media.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex-1 flex flex-col min-w-0">
      <header className="h-16 bg-card/60 backdrop-blur border-b border-border px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0">
        <h2 className="text-lg font-display font-extrabold text-foreground flex items-center gap-2 truncate">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400 font-mono text-base">
            {isBn ? "এডমিন পোর্টাল" : "Admin Portal"}
          </span>
          {activeTab !== "overview" && activeTab !== "dashboard" && (
            <span className="text-muted-foreground font-mono text-sm">
              &gt; {activeTab}
            </span>
          )}
        </h2>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/70" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isBn ? "অনুসন্ধান করুন..." : "Search the network..."}
            className="bg-background/40 border border-input focus:border-primary/60 text-xs text-foreground font-mono pl-9 pr-4 py-2 rounded-xl w-64 outline-none transition placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-8 admin-mesh">
        {(activeTab === "overview" || activeTab === "dashboard") && (
          <DashboardTab
            totalMembers={totalMembers}
            activeMembers={activeMembers}
            pendingApprovals={pendingApprovals}
            postsCount={posts.length}
            eventsCount={events.length}
            galleryCount={gallery.length}
            announcementsCount={announcements.length}
            members={members}
            memberGrowthData={memberGrowthData}
            eventMetricsData={eventMetricsData}
            departmentData={departmentData}
            colors={COLORS}
            adminName={adminName}
            adminEmail={adminEmail}
            onGoMembers={() => navigateTab("members")}
            onGoPosts={() => navigateTab("posts")}
            onGoEvents={() => navigateTab("events")}
            onGoAnnouncements={() => navigateTab("announcements")}
            onGoAnalytics={() => navigateTab("analytics")}
          />
        )}

        {activeTab === "members" && (
          <MembersTab
            members={filteredMembers}
            totalCount={members.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onApprove={(id) => handleUpdateStatus(id, "active")}
            onToggleRole={handleToggleRole}
            onDelete={(id) => handleDelete("member", id, props.onDeleteMember)}
          />
        )}

        {activeTab === "posts" && (
          <PostsTab
            posts={filteredPosts}
            totalCount={posts.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreate={() => setPostDialogOpen(true)}
            onDelete={(id) => handleDelete("post", id, props.onDeletePost)}
          />
        )}

        {activeTab === "events" && (
          <EventsTab
            events={filteredEvents}
            totalCount={events.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreate={() => setEventDialogOpen(true)}
            onDelete={(id) => handleDelete("event", id, props.onDeleteEvent)}
          />
        )}

        {activeTab === "announcements" && (
          <AnnouncementsTab
            announcements={filteredAnnouncements}
            totalCount={announcements.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreate={() => setAnnDialogOpen(true)}
            onDelete={(id) =>
              handleDelete(
                "announcement",
                id,
                props.onDeleteAnnouncement || props.onDeleteNotice
              )
            }
          />
        )}

        {activeTab === "gallery" && (
          <GalleryTab
            items={filteredGallery}
            totalCount={gallery.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreate={() => setGalleryDialogOpen(true)}
            onDelete={(id) => handleDelete("gallery", id, props.onDeleteGallery)}
          />
        )}

        {activeTab === "payments" && (
          <PaymentsTab
            payments={filteredPayments}
            totalCount={payments.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreate={() => undefined}
            onApprove={(id) =>
              props.onApprovePayment
                ? props.onApprovePayment(id)
                : axiosSecure
                    .patch(`/api/payments/${id}`, { status: "approved" })
                    .then(() => fetchAdminData())
                    .then(() => toastSuccess("Payment approved"))
                    .catch((err) => swalError(err.message))
            }
            onReject={(id) =>
              props.onRejectPayment
                ? props.onRejectPayment(id)
                : axiosSecure
                    .patch(`/api/payments/${id}`, { status: "rejected" })
                    .then(() => fetchAdminData())
                    .then(() => toastSuccess("Payment rejected"))
                    .catch((err) => swalError(err.message))
            }
            onDelete={(id) => handleDelete("payment", id, props.onDeletePayment)}
          />
        )}

        {activeTab === "attendance" && (
          <AttendanceTab
            attendance={filteredAttendance}
            totalCount={attendance.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreate={() => undefined}
            onEdit={(rec) => {
              if (props.onEditAttendance) {
                props.onEditAttendance(rec._id || rec.id, rec.status);
              } else {
                const newStatus = rec.status === "Present" ? "Absent" : "Present";
                axiosSecure
                  .patch(`/api/attendance/${rec._id || rec.id}`, { status: newStatus })
                  .then(() => fetchAdminData())
                  .then(() => toastSuccess(`Status: ${newStatus}`))
                  .catch((err) => swalError(err.message));
              }
            }}
            onDelete={(id) => handleDelete("attendance", id, props.onDeleteAttendance)}
          />
        )}

        {activeTab === "registrations" && (
          <EventRegistrationsTab
            eventRegistrations={filteredEventRegistrations}
            totalCount={eventRegistrations.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCancel={(id) => {
              if (props.onCancelRegistration) {
                props.onCancelRegistration(id);
              } else {
                axiosSecure
                  .patch(`/api/event-registrations/${id}`, { status: "cancelled" })
                  .then(() => fetchAdminData())
                  .then(() => toastSuccess("Registration cancelled"))
                  .catch((err) => swalError(err.message));
              }
            }}
            onDelete={(id) =>
              handleDelete("registration", id, props.onDeleteRegistration)
            }
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab
            totalMembers={totalMembers}
            activeMembers={activeMembers}
            memberGrowthData={memberGrowthData}
            eventMetricsData={eventMetricsData}
            departmentData={departmentData}
            colors={COLORS}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            settings={appSettings}
            onChange={setAppSettings}
            onSave={handleSaveSettings}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            adminName={adminName}
            adminEmail={adminEmail}
            role={props.matchedUser?.role}
          />
        )}
      </div>

      <ConfirmActionDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))}
        title={confirm.title}
        description={confirm.description}
        confirmLabel={confirm.confirmLabel}
        variant={confirm.variant}
        onConfirm={confirm.onConfirm}
      />

      {/* Create dialogs */}
      <EntityFormDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
        title="Create new article"
        description="Publish a story, tutorial, or club update."
        size="lg"
        loading={formSubmitting}
        submitLabel="Publish article"
        onSubmit={submitPost}
      >
        <TextField
          label="Post title"
          required
          value={postForm.title}
          onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
          placeholder="e.g. Getting started with OSPF"
        />
        <SelectField
          label="Category"
          value={postForm.category}
          onValueChange={(v) => setPostForm({ ...postForm, category: v })}
          options={[
            { value: "General", label: "General" },
            { value: "Networking", label: "Networking" },
            { value: "Security", label: "Security" },
            { value: "Workshop", label: "Workshop" },
            { value: "Career", label: "Career" },
          ]}
        />
        <TextAreaField
          label="Content"
          required
          value={postForm.content}
          onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
          placeholder="Write your post body (Markdown supported)..."
          rows={6}
        />
      </EntityFormDialog>

      <EntityFormDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        title="Create new event"
        description="Schedule a workshop, seminar, or meetup."
        size="lg"
        loading={formSubmitting}
        submitLabel="Publish event"
        onSubmit={submitEvent}
      >
        <TextField
          label="Event title"
          required
          value={eventForm.title}
          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
          placeholder="e.g. MikroTik RouterOS Lab"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Event type"
            value={eventForm.type}
            onValueChange={(v) => setEventForm({ ...eventForm, type: v })}
            options={[
              { value: "Workshop", label: "Workshop" },
              { value: "Seminar", label: "Seminar" },
              { value: "Hackathon", label: "Hackathon" },
              { value: "Meetup", label: "Meetup" },
              { value: "Competition", label: "Competition" },
            ]}
          />
          <TextField
            label="Date & time"
            required
            type="datetime-local"
            value={eventForm.eventDateTime}
            onChange={(e) =>
              setEventForm({ ...eventForm, eventDateTime: e.target.value })
            }
          />
        </div>
        <TextField
          label="Location"
          value={eventForm.location}
          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
        />
        <TextAreaField
          label="Description"
          value={eventForm.description}
          onChange={(e) =>
            setEventForm({ ...eventForm, description: e.target.value })
          }
          placeholder="What attendees will learn..."
          rows={4}
        />
        <ImageDropzone
          label="Cover image (optional)"
          value={eventForm.image}
          onChange={(url) => setEventForm({ ...eventForm, image: url })}
        />
      </EntityFormDialog>

      <EntityFormDialog
        open={annDialogOpen}
        onOpenChange={setAnnDialogOpen}
        title="Post announcement"
        description="Broadcast an urgent notice to all members."
        size="lg"
        loading={formSubmitting}
        submitLabel="Broadcast"
        onSubmit={submitAnnouncement}
      >
        <TextField
          label="Announcement title"
          required
          value={annForm.title}
          onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
          placeholder="e.g. Lab booking opens tomorrow"
        />
        <SelectField
          label="Category"
          value={annForm.category}
          onValueChange={(v) => setAnnForm({ ...annForm, category: v })}
          options={[
            { value: "Notice", label: "Notice" },
            { value: "Urgent", label: "Urgent" },
            { value: "Event", label: "Event" },
            { value: "Maintenance", label: "Maintenance" },
            { value: "General", label: "General" },
          ]}
        />
        <TextAreaField
          label="Content"
          required
          value={annForm.content}
          onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
          placeholder="Write the announcement..."
          rows={5}
        />
      </EntityFormDialog>

      <EntityFormDialog
        open={galleryDialogOpen}
        onOpenChange={setGalleryDialogOpen}
        title="Add to gallery"
        description="Upload a photo from a workshop or event."
        size="lg"
        loading={formSubmitting}
        submitLabel="Upload media"
        onSubmit={submitGallery}
      >
        <TextField
          label="Title"
          required
          value={galleryForm.title}
          onChange={(e) =>
            setGalleryForm({ ...galleryForm, title: e.target.value })
          }
          placeholder="e.g. IPv6 Seminar group photo"
        />
        <SelectField
          label="Category"
          value={galleryForm.category}
          onValueChange={(v) => setGalleryForm({ ...galleryForm, category: v })}
          options={[
            { value: "Workshop", label: "Workshop" },
            { value: "Seminar", label: "Seminar" },
            { value: "Hackathon", label: "Hackathon" },
            { value: "Meetup", label: "Meetup" },
            { value: "Award", label: "Award" },
          ]}
        />
        <ImageDropzone
          label="Image"
          required
          value={galleryForm.imageUrl}
          onChange={(url) => setGalleryForm({ ...galleryForm, imageUrl: url })}
        />
      </EntityFormDialog>
    </div>
  );
}