 import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Users, FileText, Calendar, Bell, ShieldAlert, TrendingUp, 
  Plus, Search, CheckCircle, XCircle, Trash2, Edit, Eye, 
  MoreHorizontal, Image as ImageIcon, BarChart2, Settings, User, LogOut, Shield, 
  ArrowRight, ArrowLeft, Send, Globe, Sliders, Save, Database, Lock, MapPin, Clock, Upload, Loader2, Compass
} from "lucide-react";
import Swal from "sweetalert2";
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend 
} from "recharts";
import { useAxiosSecure } from "../../hooks/useAxiosSecure";

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
}

// ImgBB Image Upload Helper
const uploadImageToImgBB = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", imageFile);
  
  // ImgBB API Key (from env or fallback key)
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY || "6d25783f05b0b40d35d070669229e611"; 
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (data.success) {
    return data.data.display_url || data.data.url;
  } else {
    throw new Error(data.error?.message || "ImgBB Image Upload Failed");
  }
};

// Recharts Custom Dark Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#020408] border border-emerald-500/30 p-3 rounded-xl shadow-2xl text-xs font-mono text-white">
        <p className="font-bold text-emerald-400 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color || "#10b981" }} className="flex items-center space-x-2">
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard(props: AdminDashboardProps) {
  const axiosSecure = useAxiosSecure();
  
  // Tab state management
  const [localTab, setLocalTab] = useState<string>("dashboard");
  const activeTab = props.activeTab || localTab;

  const [members, setMembers] = useState<any[]>(props.members || []);
  const [posts, setPosts] = useState<any[]>(props.posts || []);
  const [events, setEvents] = useState<any[]>(props.events || []);
  const [announcements, setAnnouncements] = useState<any[]>(props.announcements || props.notices || []);
  const [gallery, setGallery] = useState<any[]>(props.gallery || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ImgBB Image Upload & Map States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [selectedMapLocation, setSelectedLocation] = useState("CSE Lab 1, JSTU Campus");
  const [isMapPreviewOpen, setIsMapPreviewOpen] = useState(false);

  // React Hook Form Integration
  const { register: regPost, handleSubmit: handlePostSubmit, reset: resetPostForm } = useForm();
  const { register: regEvent, handleSubmit: handleEventSubmit, reset: resetEventForm, setValue: setEventValue } = useForm();
  const { register: regAnn, handleSubmit: handleAnnSubmit, reset: resetAnnForm } = useForm();
  const { register: regGal, handleSubmit: handleGalSubmit, reset: resetGalForm } = useForm();

  // Persistent Working System Settings State
  const [appSettings, setAppSettings] = useState({
    language: "en",
    allowRegistration: true,
    emailNotifications: true,
    maintenanceMode: false,
    themeAccent: "emerald",
    autoBackup: true,
  });

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("jstu_portal_config");
    if (savedSettings) {
      try {
        setAppSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse portal settings:", e);
      }
    }
  }, []);

  // Save Settings Handler
  const handleSaveSettings = () => {
    localStorage.setItem("jstu_portal_config", JSON.stringify(appSettings));
    const isBn = appSettings.language === "bn";
    Swal.fire({
      title: isBn ? "কনফিগারেশন সেভ হয়েছে!" : "Settings Saved!",
      text: isBn 
        ? "পোর্টাল কনফিগারেশন সফলভাবে আপডেট করা হয়েছে।" 
        : "System configuration settings updated successfully.",
      icon: "success",
      background: "#03070E",
      color: "#fff",
      confirmButtonColor: "#10b981",
    });
  };

  // Sync props
  useEffect(() => {
    if (props.members) setMembers(props.members);
    if (props.posts) setPosts(props.posts);
    if (props.events) setEvents(props.events);
    if (props.announcements || props.notices) setAnnouncements(props.announcements || props.notices || []);
    if (props.gallery) setGallery(props.gallery);
  }, [props.members, props.posts, props.events, props.announcements, props.notices, props.gallery]);

  // Fetch admin data
  const fetchAdminData = async () => {
    if (props.onRefreshData) {
      props.onRefreshData();
      return;
    }
    setLoading(true);
    try {
      const [memRes, postRes, evRes, annRes, galRes] = await Promise.all([
        axiosSecure.get("/api/members"),
        axiosSecure.get("/api/posts"),
        axiosSecure.get("/api/events"),
        axiosSecure.get("/api/announcements"),
        axiosSecure.get("/api/gallery")
      ]);
      setMembers(memRes.data);
      setPosts(postRes.data);
      setEvents(evRes.data);
      setAnnouncements(annRes.data);
      setGallery(galRes.data);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!props.members && !props.posts) {
      fetchAdminData();
    }
  }, []);

  const totalMembers = members.length;
  const activeMembers = members.filter(
    (m) => m.status === "active" || m.status === "Active" || m.status === "approved"
  ).length;
  const pendingApprovals = members.filter(
    (m) => m.status === "pending" || m.status === "Pending"
  ).length;

  const adminName = props.matchedUser?.name || props.matchedUser?.displayName || "Admin User";
  const adminEmail = props.matchedUser?.email || "admin@portal.com";

  // Recharts Visualization Dataset
  const memberGrowthData = [
    { month: "Jan", members: Math.max(1, Math.floor(totalMembers * 0.2)), active: Math.max(1, Math.floor(totalMembers * 0.15)) },
    { month: "Feb", members: Math.max(2, Math.floor(totalMembers * 0.35)), active: Math.max(2, Math.floor(totalMembers * 0.28)) },
    { month: "Mar", members: Math.max(3, Math.floor(totalMembers * 0.55)), active: Math.max(3, Math.floor(totalMembers * 0.45)) },
    { month: "Apr", members: Math.max(4, Math.floor(totalMembers * 0.75)), active: Math.max(4, Math.floor(totalMembers * 0.65)) },
    { month: "May", members: totalMembers, active: activeMembers },
  ];

  const departmentData = [
    { name: "CSE", value: members.filter((m) => m.department?.toUpperCase() === "CSE").length || 4 },
    { name: "EEE", value: members.filter((m) => m.department?.toUpperCase() === "EEE").length || 2 },
    { name: "Geology", value: members.filter((m) => m.department?.toUpperCase() === "GEOLOGY").length || 1 },
    { name: "Math", value: members.filter((m) => m.department?.toUpperCase() === "MATH").length || 1 },
  ];

  const eventMetricsData = [
    { name: "Cisco Intro", attendees: 45, registrations: 50 },
    { name: "MikroTik Lab", attendees: 32, registrations: 38 },
    { name: "IPv6 Seminar", attendees: 68, registrations: 72 },
    { name: "Security Bootcamp", attendees: 28, registrations: 30 },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

  // Navigate to path/tab directly
  const handleNavigatePath = (pathTab: string) => {
    if (props.onNavigate) {
      props.onNavigate(pathTab);
    } else {
      setLocalTab(pathTab);
    }
  };

  // ImgBB Image Upload Handler
  const handleImgBBUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImageToImgBB(file);
      setUploadedImageUrl(url);
      setEventValue("image", url);
      Swal.fire({
        title: "Image Uploaded!",
        text: "Image uploaded to ImgBB and URL generated successfully.",
        icon: "success",
        background: "#03070E",
        color: "#fff",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (err: any) {
      Swal.fire({
        title: "Upload Failed",
        text: err.message || "Failed to upload image to ImgBB.",
        icon: "error",
        background: "#03070E",
        color: "#fff",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Toggle Member / Admin Role
  const handleToggleRole = async (member: any) => {
    const recordKey = member._id || member.id || member.memberId || member.email;
    const currentRole = (member.role || "member").toLowerCase();
    const newRole = currentRole === "admin" ? "member" : "admin";
    const actionText = newRole === "admin" ? "Promote to Admin" : "Demote to Member";

    const result = await Swal.fire({
      title: `${actionText}?`,
      text: `Are you sure you want to change ${member.name || member.displayName}'s role to ${newRole.toUpperCase()}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newRole === "admin" ? "#10b981" : "#f59e0b",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, ${actionText}`,
      background: "#03070E",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await axiosSecure.patch(`/api/members/${recordKey}`, { role: newRole });
        fetchAdminData();
        Swal.fire({
          title: "Role Updated!",
          text: `${member.name || member.displayName} is now a ${newRole.toUpperCase()}.`,
          icon: "success",
          background: "#03070E",
          color: "#fff",
        });
      } catch (err: any) {
        Swal.fire({
          title: "Error!",
          text: err.message || "Failed to update role.",
          icon: "error",
          background: "#03070E",
          color: "#fff",
        });
      }
    }
  };

  // Approve Member
  const handleUpdateStatus = async (id: string, status: string) => {
    const result = await Swal.fire({
      title: "Approve Member?",
      text: `Are you sure you want to activate status for this member?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Approve",
      background: "#03070E",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await axiosSecure.patch(`/api/members/${id}`, { status });
        fetchAdminData();
        Swal.fire({
          title: "Approved!",
          text: `Member status updated to ${status}.`,
          icon: "success",
          background: "#03070E",
          color: "#fff",
        });
      } catch (err: any) {
        Swal.fire({
          title: "Error!",
          text: err.message || "Failed to update member status.",
          icon: "error",
          background: "#03070E",
          color: "#fff",
        });
      }
    }
  };

  // Delete Handlers
  const handleDeleteMember = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Member?",
      text: "This member record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      background: "#03070E",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        if (props.onDeleteMember) {
          await props.onDeleteMember(id);
        } else {
          await axiosSecure.delete(`/api/members/${id}`);
          fetchAdminData();
        }
        Swal.fire({ title: "Deleted!", text: "Member deleted.", icon: "success", background: "#03070E", color: "#fff" });
      } catch (err: any) {
        Swal.fire({ title: "Error!", text: err.message, icon: "error", background: "#03070E", color: "#fff" });
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Post?",
      text: "Are you sure you want to remove this post?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      background: "#03070E",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        if (props.onDeletePost) {
          await props.onDeletePost(id);
        } else {
          await axiosSecure.delete(`/api/posts/${id}`);
          fetchAdminData();
        }
        Swal.fire({ title: "Deleted!", text: "Post removed.", icon: "success", background: "#03070E", color: "#fff" });
      } catch (err: any) {
        Swal.fire({ title: "Error!", text: err.message, icon: "error", background: "#03070E", color: "#fff" });
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Event?",
      text: "Are you sure you want to remove this event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      background: "#03070E",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        if (props.onDeleteEvent) {
          await props.onDeleteEvent(id);
        } else {
          await axiosSecure.delete(`/api/events/${id}`);
          fetchAdminData();
        }
        Swal.fire({ title: "Deleted!", text: "Event removed.", icon: "success", background: "#03070E", color: "#fff" });
      } catch (err: any) {
        Swal.fire({ title: "Error!", text: err.message, icon: "error", background: "#03070E", color: "#fff" });
      }
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Announcement?",
      text: "Are you sure you want to remove this announcement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      background: "#03070E",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        if (props.onDeleteAnnouncement) {
          await props.onDeleteAnnouncement(id);
        } else if (props.onDeleteNotice) {
          await props.onDeleteNotice(id);
        } else {
          await axiosSecure.delete(`/api/announcements/${id}`);
          fetchAdminData();
        }
        Swal.fire({ title: "Deleted!", text: "Announcement removed.", icon: "success", background: "#03070E", color: "#fff" });
      } catch (err: any) {
        Swal.fire({ title: "Error!", text: err.message, icon: "error", background: "#03070E", color: "#fff" });
      }
    }
  };

  const handleDeleteGallery = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Gallery Image?",
      text: "Are you sure you want to remove this image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      background: "#03070E",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        if (props.onDeleteGallery) {
          await props.onDeleteGallery(id);
        } else {
          await axiosSecure.delete(`/api/gallery/${id}`);
          fetchAdminData();
        }
        Swal.fire({ title: "Deleted!", text: "Image removed.", icon: "success", background: "#03070E", color: "#fff" });
      } catch (err: any) {
        Swal.fire({ title: "Error!", text: err.message, icon: "error", background: "#03070E", color: "#fff" });
      }
    }
  };

  // React Hook Form Submit Handlers
  const onPostSubmit = async (data: any) => {
    try {
      await axiosSecure.post("/api/posts", {
        title: data.title,
        category: data.category || "General",
        content: data.content,
        author: adminName,
        date: new Date().toLocaleDateString()
      });
      resetPostForm();
      fetchAdminData();
      Swal.fire({ title: "Published!", text: "Post created successfully.", icon: "success", background: "#03070E", color: "#fff" });
      handleNavigatePath("posts");
    } catch (err: any) {
      Swal.fire({ title: "Error!", text: err.message || "Failed to create post.", icon: "error", background: "#03070E", color: "#fff" });
    }
  };

  const onEventSubmit = async (data: any) => {
    try {
      // Parse Calendar datetime-local
      const eventDateTime = data.eventDateTime ? new Date(data.eventDateTime) : null;
      const formattedDate = eventDateTime
        ? eventDateTime.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "TBD";
      const formattedTime = eventDateTime
        ? eventDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "10:00 AM";

      await axiosSecure.post("/api/events", {
        title: data.title,
        type: data.type || "Workshop",
        date: formattedDate,
        time: formattedTime,
        location: data.location || selectedMapLocation,
        image: uploadedImageUrl || data.image || "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80",
        description: data.description || ""
      });

      resetEventForm();
      setUploadedImageUrl("");
      fetchAdminData();
      Swal.fire({ title: "Created!", text: "Event scheduled successfully with ImgBB image & calendar time.", icon: "success", background: "#03070E", color: "#fff" });
      handleNavigatePath("events");
    } catch (err: any) {
      Swal.fire({ title: "Error!", text: err.message || "Failed to create event.", icon: "error", background: "#03070E", color: "#fff" });
    }
  };

  const onAnnouncementSubmit = async (data: any) => {
    try {
      await axiosSecure.post("/api/announcements", {
        title: data.title,
        category: data.category || "Notice",
        content: data.content,
        date: new Date().toLocaleDateString()
      });
      resetAnnForm();
      fetchAdminData();
      Swal.fire({ title: "Posted!", text: "Announcement posted successfully.", icon: "success", background: "#03070E", color: "#fff" });
      handleNavigatePath("announcements");
    } catch (err: any) {
      Swal.fire({ title: "Error!", text: err.message || "Failed to post announcement.", icon: "error", background: "#03070E", color: "#fff" });
    }
  };

  const onGallerySubmit = async (data: any) => {
    try {
      await axiosSecure.post("/api/gallery", {
        title: data.title,
        imageUrl: uploadedImageUrl || data.imageUrl,
        category: data.category || "Workshop",
        date: new Date().toLocaleDateString()
      });
      resetGalForm();
      setUploadedImageUrl("");
      fetchAdminData();
      Swal.fire({ title: "Uploaded!", text: "Media item added to gallery.", icon: "success", background: "#03070E", color: "#fff" });
      handleNavigatePath("gallery");
    } catch (err: any) {
      Swal.fire({ title: "Error!", text: err.message || "Failed to upload image.", icon: "error", background: "#03070E", color: "#fff" });
    }
  };

  const isBn = appSettings.language === "bn";

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 font-sans flex-1 flex flex-col min-w-0">
      {/* Dark/Green Top Bar */}
      <header className="h-16 bg-[#03070E] border-b border-emerald-500/20 px-6 sm:px-8 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-display font-extrabold text-white capitalize flex items-center space-x-2">
          <span className="text-emerald-400 font-mono">{isBn ? "এডমিন পোর্টাল" : "Admin Portal"}</span>
          {activeTab !== "overview" && activeTab !== "dashboard" && (
            <span className="text-slate-500 font-mono text-sm"> &gt; {activeTab}</span>
          )}
        </h2>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isBn ? "নেটওয়ার্ক রেকর্ড অনুসন্ধান করুন..." : "Search network records..."}
              className="bg-[#020408] border border-emerald-500/20 text-xs text-white font-mono pl-9 pr-4 py-2 rounded-xl w-60 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>
      </header>

      {/* Dynamic Body Content */}
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8">
        {/* TAB 1: OVERVIEW / DASHBOARD */}
        {(activeTab === "overview" || activeTab === "dashboard") && (
          <div className="space-y-8 animate-fade-in">
            {/* 4 Green Glow Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#03070E] border border-emerald-500/20 p-6 rounded-2xl shadow-xl space-y-2 relative overflow-hidden">
                <div className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">{isBn ? "মোট সদস্য" : "Total Members"}</div>
                <div className="text-3xl font-display font-extrabold text-emerald-400">{totalMembers}</div>
                <div className="text-[10px] text-emerald-500 font-mono flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12% active database growth
                </div>
              </div>

              <div className="bg-[#03070E] border border-emerald-500/20 p-6 rounded-2xl shadow-xl space-y-2 relative overflow-hidden">
                <div className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">{isBn ? "অ্যাক্টিভ পোস্ট" : "Active Posts"}</div>
                <div className="text-3xl font-display font-extrabold text-white">{posts.length}</div>
                <div className="text-[10px] text-slate-500 font-mono">Published community posts</div>
              </div>

              <div className="bg-[#03070E] border border-emerald-500/20 p-6 rounded-2xl shadow-xl space-y-2 relative overflow-hidden">
                <div className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">{isBn ? "আসন্ন ইভেন্ট" : "Upcoming Events"}</div>
                <div className="text-3xl font-display font-extrabold text-white">{events.length}</div>
                <div className="text-[10px] text-slate-500 font-mono">Active workshops & seminars</div>
              </div>

              <div className="bg-[#03070E] border border-amber-500/30 p-6 rounded-2xl shadow-xl space-y-2 bg-amber-500/5 relative overflow-hidden">
                <div className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider">{isBn ? "অনুমোদন অপেক্ষমাণ" : "Pending Approvals"}</div>
                <div className="text-3xl font-display font-extrabold text-amber-400">{pendingApprovals}</div>
                <div className="text-[10px] text-amber-500/80 font-mono">Action required for verification</div>
              </div>
            </div>

            {/* Growth & Recharts preview card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-[#03070E] border border-emerald-500/20 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    <span>Member Growth Trend</span>
                  </h3>
                  <button
                    onClick={() => handleNavigatePath("analytics")}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition-all font-mono"
                  >
                    <span>Full Recharts Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={memberGrowthData}>
                      <defs>
                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="members" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMembers)" name="Total Members" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#03070E] border border-emerald-500/20 p-6 rounded-3xl shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Recent Registration Nodes</span>
                </h3>
                <div className="space-y-3">
                  {members.slice(0, 4).map((m, idx) => (
                    <div
                      key={m.id || m._id || idx}
                      className="flex items-center justify-between p-3 bg-[#020408] rounded-2xl border border-white/5"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-white">{m.name || m.displayName}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{m.department || m.email || "CSE"}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse"></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERS MANAGEMENT TABLE */}
        {activeTab === "members" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl overflow-hidden space-y-4 p-6">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-bold text-white text-base font-mono flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Club Members Database</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400">Total Records: {members.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#020408] text-emerald-400 border-b border-emerald-500/20 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Member ID</th>
                    <th className="p-4">Name & Email</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members
                    .filter(
                      (m) =>
                        !searchTerm ||
                        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((m) => {
                      const recordKey = m._id || m.id || m.memberId || m.email;
                      const isPending = m.status === "pending" || m.status === "Pending";
                      const isAdminRole = (m.role || "").toLowerCase() === "admin";

                      return (
                        <tr key={recordKey} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-emerald-400">{m.memberId || m.id || "N/A"}</td>
                          <td className="p-4">
                            <div className="font-bold text-white font-sans">{m.name || m.displayName}</div>
                            <div className="text-[10px] text-slate-500">{m.email}</div>
                          </td>
                          <td className="p-4 text-slate-300">{m.department || "N/A"}</td>
                          <td className="p-4 uppercase text-[10px] font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-md border ${
                                isAdminRole
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              }`}
                            >
                              {m.role || "Member"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
                                !isPending
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {m.status || "Pending"}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {isPending && (
                              <button
                                onClick={() => handleUpdateStatus(recordKey, "active")}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] transition-all shadow-md shadow-emerald-600/20"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleRole(m)}
                              className={`px-3 py-1 font-bold rounded-xl text-[10px] transition-all border ${
                                isAdminRole
                                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30"
                              }`}
                              title={isAdminRole ? "Demote to Member" : "Promote to Admin"}
                            >
                              {isAdminRole ? "Make Member" : "Make Admin"}
                            </button>
                            <button
                              onClick={() => handleDeleteMember(recordKey)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-[10px] transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: POSTS MANAGEMENT */}
        {activeTab === "posts" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-bold text-white text-base font-mono flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Club Posts Management</span>
              </h3>
              <button
                onClick={() => handleNavigatePath("create-post")}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>Create Post</span>
              </button>
            </div>

            <div className="space-y-3">
              {posts.map((p) => {
                const pId = p._id || p.id;
                return (
                  <div
                    key={pId}
                    className="p-4 bg-[#020408] border border-white/10 rounded-2xl flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm font-sans">{p.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Category: <span className="text-emerald-400">{p.category || "General"}</span> | Author: {p.author || "Admin"} | Date: {p.date || "Recent"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] rounded-lg">
                        Published
                      </span>
                      <button
                        onClick={() => handleDeletePost(pId)}
                        className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DEDICATED FORM PAGE: CREATE POST (React Hook Form) */}
        {activeTab === "create-post" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto animate-fade-in">
            <button
              onClick={() => handleNavigatePath("posts")}
              className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Posts List</span>
            </button>

            <h3 className="font-extrabold text-white text-lg font-mono pb-2 border-b border-white/5">
              Create New Article / Post
            </h3>

            <form onSubmit={handlePostSubmit(onPostSubmit)} className="space-y-5 font-mono text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Post Title *</label>
                <input
                  type="text"
                  {...regPost("title", { required: true })}
                  placeholder="e.g. Getting Started with OSPF Protocol"
                  className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Category</label>
                <input
                  type="text"
                  {...regPost("category")}
                  placeholder="e.g. Tutorial, Routing, Security"
                  className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Post Content *</label>
                <textarea
                  rows={6}
                  {...regPost("content", { required: true })}
                  placeholder="Write the detailed content here..."
                  className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 resize-y font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleNavigatePath("posts")}
                  className="px-5 py-2.5 bg-slate-900 text-slate-400 font-bold rounded-xl hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Article</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: EVENTS MANAGEMENT */}
        {activeTab === "events" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-bold text-white text-base font-mono flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Manage Club Events</span>
              </h3>
              <button
                onClick={() => handleNavigatePath("create-event")}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => {
                const evId = ev._id || ev.id;
                return (
                  <div key={evId} className="p-5 bg-[#020408] border border-white/10 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded">
                        {ev.type || "Workshop"}
                      </span>
                      <button
                        onClick={() => handleDeleteEvent(evId)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="font-bold text-white text-sm">{ev.title}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      📅 {ev.date || "TBD"} {ev.time && `at ${ev.time}`} | 📍 {ev.location || "Campus Lab"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DEDICATED FORM PAGE: CREATE EVENT (React Hook Form + ImgBB Upload + Calendar + Map Picker) */}
        {activeTab === "create-event" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto animate-fade-in">
            <button
              onClick={() => handleNavigatePath("events")}
              className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events List</span>
            </button>

            <h3 className="font-extrabold text-white text-lg font-mono pb-2 border-b border-white/5">
              Schedule New Club Event
            </h3>

            <form onSubmit={handleEventSubmit(onEventSubmit)} className="space-y-5 font-mono text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Event Title *</label>
                <input
                  type="text"
                  {...regEvent("title", { required: true })}
                  placeholder="e.g. MikroTik Router Configuration Hands-on"
                  className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase">Event Type</label>
                  <select
                    {...regEvent("type")}
                    className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono cursor-pointer"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Bootcamp">Bootcamp</option>
                  </select>
                </div>

                {/* Calendar & Time Picker */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Select Date & Time (Calendar Picker) *</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...regEvent("eventDateTime", { required: true })}
                    className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono cursor-pointer"
                  />
                </div>
              </div>

              {/* ImgBB File Upload Selector */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase flex items-center space-x-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Event Cover Image (Upload to ImgBB from PC)</span>
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-3 bg-[#020408] border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-bold rounded-xl cursor-pointer flex items-center justify-center space-x-2 transition-all">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{uploadingImage ? "Uploading to ImgBB..." : "Choose Image File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImgBBUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedImageUrl && (
                    <div className="flex items-center space-x-2 text-emerald-400 text-xs truncate max-w-xs bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <ImageIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{uploadedImageUrl}</span>
                    </div>
                  )}
                </div>
                {/* Auto Generated ImgBB Preview */}
                {uploadedImageUrl && (
                  <div className="mt-2 h-32 w-full max-w-sm rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-950">
                    <img src={uploadedImageUrl} alt="Uploaded Event Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Interactive Location / Map Selector */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Location / Venue (Map Picker)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMapPreviewOpen(!isMapPreviewOpen)}
                    className="text-[10px] text-emerald-400 underline flex items-center space-x-1"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{isMapPreviewOpen ? "Hide Campus Map" : "Open Campus Map"}</span>
                  </button>
                </label>

                <div className="space-y-2">
                  <select
                    value={selectedMapLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      setEventValue("location", e.target.value);
                    }}
                    className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono cursor-pointer"
                  >
                    <option value="CSE Lab 1, JSTU Campus">CSE Lab 1, JSTU Campus</option>
                    <option value="CSE Lab 2, JSTU Campus">CSE Lab 2, JSTU Campus</option>
                    <option value="Central Auditorium, JSTU">Central Auditorium, JSTU</option>
                    <option value="Seminar Hall, Academic Building">Seminar Hall, Academic Building</option>
                    <option value="Online (Google Meet / Zoom)">Online (Google Meet / Zoom)</option>
                  </select>

                  <input
                    type="text"
                    {...regEvent("location")}
                    defaultValue={selectedMapLocation}
                    placeholder="Custom Location / Online Link"
                    className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* OpenStreetMap Interactive JSTU Campus Map Preview */}
                {isMapPreviewOpen && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-emerald-500/30 h-56 bg-slate-950">
                    <iframe
                      title="JSTU Campus Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src="https://www.openstreetmap.org/export/embed.html?bbox=89.1200%2C23.2300%2C89.1300%2C23.2400&amp;layer=mapnik&amp;marker=23.2333%2C89.1234"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleNavigatePath("events")}
                  className="px-5 py-2.5 bg-slate-900 text-slate-400 font-bold rounded-xl hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Create Event</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === "announcements" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-bold text-white text-base font-mono flex items-center space-x-2">
                <Bell className="w-5 h-5 text-emerald-400" />
                <span>Official Announcements</span>
              </h3>
              <button
                onClick={() => handleNavigatePath("create-announcement")}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>New Announcement</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((a) => {
                const aId = a._id || a.id;
                return (
                  <div key={aId} className="p-4 bg-[#020408] border border-white/10 rounded-2xl flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                        {a.category || "Notice"}
                      </span>
                      <h4 className="font-bold text-white text-sm font-sans">{a.title}</h4>
                      <p className="text-xs text-slate-400">{a.content || a.description || "No detail provided."}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(aId)}
                      className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DEDICATED FORM PAGE: CREATE ANNOUNCEMENT (React Hook Form) */}
        {activeTab === "create-announcement" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto animate-fade-in">
            <button
              onClick={() => handleNavigatePath("announcements")}
              className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Announcements List</span>
            </button>

            <h3 className="font-extrabold text-white text-lg font-mono pb-2 border-b border-white/5">
              Post Official Notice / Announcement
            </h3>

            <form onSubmit={handleAnnSubmit(onAnnouncementSubmit)} className="space-y-5 font-mono text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Title *</label>
                <input
                  type="text"
                  {...regAnn("title", { required: true })}
                  placeholder="e.g. Annual Picnic Registration Open"
                  className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Category</label>
                <input
                  type="text"
                  {...regAnn("category")}
                  placeholder="e.g. Notice, Urgent, General"
                  className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Announcement Details *</label>
                <textarea
                  rows={5}
                  {...regAnn("content", { required: true })}
                  placeholder="Enter notice details..."
                  className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 resize-y font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleNavigatePath("announcements")}
                  className="px-5 py-2.5 bg-slate-900 text-slate-400 font-bold rounded-xl hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Post Notice</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: GALLERY */}
        {activeTab === "gallery" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-bold text-white text-base font-mono flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <span>Club Gallery Control</span>
              </h3>
              <button
                onClick={() => handleNavigatePath("create-gallery")}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Media</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.length > 0 ? (
                gallery.map((g, idx) => (
                  <div key={g._id || g.id || idx} className="bg-[#020408] border border-white/10 rounded-2xl overflow-hidden p-3 space-y-2">
                    <div className="h-36 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                      {g.imageUrl || g.url ? (
                        <img src={g.imageUrl || g.url} alt={g.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-600" />
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-bold text-white truncate">{g.title || "Club Media"}</span>
                      <button
                        onClick={() => handleDeleteGallery(g._id || g.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-8 text-center text-xs font-mono text-slate-500 bg-[#020408] rounded-2xl border border-white/5">
                  No gallery images uploaded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* DEDICATED FORM PAGE: UPLOAD GALLERY MEDIA (React Hook Form + ImgBB) */}
        {activeTab === "create-gallery" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto animate-fade-in">
            <button
              onClick={() => handleNavigatePath("gallery")}
              className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Gallery</span>
            </button>

            <h3 className="font-extrabold text-white text-lg font-mono pb-2 border-b border-white/5">
              Upload Gallery Media
            </h3>

            <form onSubmit={handleGalSubmit(onGallerySubmit)} className="space-y-5 font-mono text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Media Title *</label>
                <input
                  type="text"
                  {...regGal("title", { required: true })}
                  placeholder="e.g. CCNA Hands-on Workshop 2026"
                  className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase flex items-center space-x-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload Image File to ImgBB (Auto Generates URL)</span>
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-3 bg-[#020408] border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-bold rounded-xl cursor-pointer flex items-center justify-center space-x-2 transition-all">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{uploadingImage ? "Uploading to ImgBB..." : "Select File From PC"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImgBBUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    {...regGal("imageUrl")}
                    value={uploadedImageUrl}
                    onChange={(e) => setUploadedImageUrl(e.target.value)}
                    placeholder="Auto-generated URL or enter custom https://..."
                    className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                {/* ImgBB Preview */}
                {uploadedImageUrl && (
                  <div className="mt-2 h-36 w-full max-w-sm rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-950">
                    <img src={uploadedImageUrl} alt="ImgBB Media Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Category</label>
                <input
                  type="text"
                  {...regGal("category")}
                  placeholder="e.g. Workshop, Seminar, Lab Session"
                  className="w-full bg-[#020408] border border-emerald-500/30 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleNavigatePath("gallery")}
                  className="px-5 py-2.5 bg-slate-900 text-slate-400 font-bold rounded-xl hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Upload Media</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#03070E] border border-emerald-500/20 p-6 rounded-2xl shadow-xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase font-mono">Engagement Index</div>
                <div className="text-3xl font-display font-extrabold text-emerald-400">84.2%</div>
                <p className="text-[10px] text-emerald-500 font-mono">High member retention</p>
              </div>
              <div className="bg-[#03070E] border border-emerald-500/20 p-6 rounded-2xl shadow-xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase font-mono">Event Attendance Rate</div>
                <div className="text-3xl font-display font-extrabold text-blue-400">92.0%</div>
                <p className="text-[10px] text-blue-400/80 font-mono">Workshop & Webinar participation</p>
              </div>
              <div className="bg-[#03070E] border border-emerald-500/20 p-6 rounded-2xl shadow-xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase font-mono">System Active Nodes</div>
                <div className="text-3xl font-display font-extrabold text-purple-400">{members.length}</div>
                <p className="text-[10px] text-purple-400/80 font-mono">Verified club members</p>
              </div>
            </div>

            {/* Recharts Grid 1: AreaChart & BarChart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Member Growth AreaChart */}
              <div className="lg:col-span-7 bg-[#03070E] border border-emerald-500/20 p-6 rounded-3xl shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <span>Member Growth & Active Nodes (Recharts)</span>
                </h3>
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={memberGrowthData}>
                      <defs>
                        <linearGradient id="colorAreaMembers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorAreaActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Area type="monotone" dataKey="members" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAreaMembers)" name="Total Members" />
                      <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAreaActive)" name="Active Nodes" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Event Attendance BarChart */}
              <div className="lg:col-span-5 bg-[#03070E] border border-emerald-500/20 p-6 rounded-3xl shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Event Registrations vs Attendance</span>
                </h3>
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Bar dataKey="registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Registrations" />
                      <Bar dataKey="attendees" fill="#10b981" radius={[4, 4, 0, 0]} name="Attendees" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recharts Grid 2: Department Breakdown Donut PieChart */}
            <div className="bg-[#03070E] border border-emerald-500/20 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Department Breakdown Analytics</span>
              </h3>
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 sm:p-8 space-y-8 max-w-3xl font-mono text-xs">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <span>{isBn ? "পোর্টাল সিস্টেম কনফিগারেশন" : "System & Portal Configuration"}</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  {isBn ? "গ্লোবাল এক্সেস, নোটিফিকেশন এবং ইন্টারফেস ভাষা সেটিংস" : "Manage global access, language, and system preferences."}
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Save className="w-4 h-4" />
                <span>{isBn ? "সেভ করুন" : "Save Changes"}</span>
              </button>
            </div>

            {/* Language & Regional Settings */}
            <div className="space-y-4">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center space-x-2 uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>{isBn ? "ভাষা নির্বাচন (Language & Locale)" : "Localization & Language"}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setAppSettings({ ...appSettings, language: "en" })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    appSettings.language === "en"
                      ? "bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                      : "bg-[#020408] border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm">English</span>
                    <span className="text-[10px] text-slate-500">(US Standard)</span>
                  </div>
                  {appSettings.language === "en" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>

                <div
                  onClick={() => setAppSettings({ ...appSettings, language: "bn" })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    appSettings.language === "bn"
                      ? "bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                      : "bg-[#020408] border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm font-sans">বাংলা</span>
                    <span className="text-[10px] text-slate-500">(Bangla Native)</span>
                  </div>
                  {appSettings.language === "bn" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
            </div>

            {/* Access Controls */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center space-x-2 uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>{isBn ? "এক্সেস এবং সিকিউরিটি" : "Access & Security Control"}</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#020408] rounded-2xl border border-white/10">
                  <div>
                    <div className="font-bold text-white">{isBn ? "পাবলিক রেজিস্ট্রেশন অনুমোদন" : "Allow Public Registration"}</div>
                    <div className="text-[10px] text-slate-500">{isBn ? "নতুন শিক্ষার্থীদের পোর্টাল রেজিস্ট্রেশনের অনুমতি দিন" : "Enable or disable new user signups"}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.allowRegistration}
                    onChange={(e) => setAppSettings({ ...appSettings, allowRegistration: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#020408] rounded-2xl border border-white/10">
                  <div>
                    <div className="font-bold text-white">{isBn ? "ইমেইল নোটিফিকেশন সার্ভিস" : "System Email Notifications"}</div>
                    <div className="text-[10px] text-slate-500">{isBn ? "নতুন অ্যাক্টিভিটির ইমেইল অ্যালার্ট পাঠাবে" : "Send system updates and alerts"}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.emailNotifications}
                    onChange={(e) => setAppSettings({ ...appSettings, emailNotifications: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#020408] rounded-2xl border border-white/10">
                  <div>
                    <div className="font-bold text-white">{isBn ? "পোর্টাল মেইনটেন্যান্স মোড" : "Maintenance Mode"}</div>
                    <div className="text-[10px] text-slate-500">{isBn ? "জরুরি আপগ্রেডের জন্য সাধারণ ব্যবহারকারীদের লক রাখুন" : "Lock non-admin access during updates"}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.maintenanceMode}
                    onChange={(e) => setAppSettings({ ...appSettings, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* System Backup */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center space-x-2 uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>{isBn ? "ডাটাবেজ এবং ব্যাকআপ" : "Database & Backups"}</span>
              </h4>
              <div className="flex items-center justify-between p-4 bg-[#020408] rounded-2xl border border-white/10">
                <div>
                  <div className="font-bold text-white">{isBn ? "অটোমেটিক দৈনিক ব্যাকআপ" : "Automatic Scheduled Backups"}</div>
                  <div className="text-[10px] text-slate-500">{isBn ? "প্রতিদিন রাত ১২টায় ডাটাবেজের ব্যাকআপ সংরক্ষণ করবে" : "Automatically backup MongoDB every 24 hours"}</div>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.autoBackup}
                  onChange={(e) => setAppSettings({ ...appSettings, autoBackup: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Save className="w-4 h-4" />
                <span>{isBn ? "কনফিগারেশন সেভ করুন" : "Save System Config"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: PROFILE */}
        {activeTab === "profile" && (
          <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl shadow-xl p-6 space-y-6 max-w-2xl">
            <h3 className="font-bold text-white text-base font-mono pb-2 border-b border-white/5">
              Admin Profile Node
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={adminName}
                  className="w-full bg-[#020408] border border-emerald-500/20 p-3 rounded-xl font-bold text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  defaultValue={adminEmail}
                  className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Assigned Role</label>
                <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono rounded-lg uppercase text-[10px]">
                  {props.matchedUser?.role || "Admin"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}