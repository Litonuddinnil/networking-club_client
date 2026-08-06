import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../provider/AuthProvider";
import { RefreshCw } from "lucide-react";
import { useAxiosPublic } from "../hooks/useAxiosPublic";

import AdminDashboard from "./admin/AdminDashboard";
import MemberDashboard from "./member/MemberDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPublic = useAxiosPublic();

  // Read current active tab from query parameter (e.g. /dashboard?tab=posts)
  const currentTab = new URLSearchParams(location.search).get("tab") || "dashboard";

  const [members, setMembers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  const fetchAllData = async () => {
    setDbLoading(true);
    try {
      const [mRes, pRes, eRes, aRes, gRes, nRes, cRes, dRes, sRes] =
        await Promise.allSettled([
          axiosPublic.get("/api/members"),
          axiosPublic.get("/api/posts"),
          axiosPublic.get("/api/events"),
          axiosPublic.get("/api/announcements"),
          axiosPublic.get("/api/gallery"),
          axiosPublic.get("/api/notices"),
          axiosPublic.get("/api/courses"),
          axiosPublic.get("/api/devices"),
          axiosPublic.get("/api/sponsors"),
        ]);

      if (mRes.status === "fulfilled") setMembers(mRes.value.data);
      if (pRes.status === "fulfilled") setPosts(pRes.value.data);
      if (eRes.status === "fulfilled") setEvents(eRes.value.data);
      if (aRes.status === "fulfilled") setAnnouncements(aRes.value.data);
      if (gRes.status === "fulfilled") setGallery(gRes.value.data);
      if (nRes.status === "fulfilled") {
        setNotices(nRes.value.data);
        // Fallback announcements to notices if announcements endpoint is empty
        if (aRes.status === "rejected" || !aRes.value?.data?.length) {
          setAnnouncements(nRes.value.data);
        }
      }
      if (cRes.status === "fulfilled") setCourses(cRes.value.data);
      if (dRes.status === "fulfilled") setDevices(dRes.value.data);
      if (sRes.status === "fulfilled") setSponsors(sRes.value.data);
    } catch (err) {
      console.error("Dashboard sync error:", err);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Match logged-in user with database
  const matchedStudent = members.find(
    (m) => m.email?.toLowerCase() === user?.email?.toLowerCase()
  );

  const dbRole = matchedStudent?.role ? matchedStudent.role.toLowerCase() : "";
  const authRole = user?.role ? user.role.toLowerCase() : "";
  const userRole = dbRole === "admin" || authRole === "admin" ? "admin" : "member";

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center space-y-4 text-white font-mono text-xs">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="animate-pulse tracking-widest">CONNECTING TO MONGODB DATABASE...</p>
      </div>
    );
  }

  // Handle Tab Navigation helper
  const handleTabNavigate = (tab: string) => {
    if (tab === "dashboard") {
      navigate("/dashboard");
    } else {
      navigate(`/dashboard?tab=${tab}`);
    }
  };

  // Route to Admin Dashboard
  if (userRole === "admin") {
    return (
      <AdminDashboard
        activeTab={currentTab}
        matchedUser={matchedStudent}
        members={members}
        posts={posts}
        events={events}
        announcements={announcements}
        gallery={gallery}
        notices={notices}
        courses={courses}
        devices={devices}
        sponsors={sponsors}
        onNavigate={handleTabNavigate}
        onLogout={() => navigate("/")}
        onRefreshData={fetchAllData}
        onDeleteMember={async (id) => {
          await axiosPublic.delete(`/api/members/${id}`);
          fetchAllData();
        }}
        onDeletePost={async (id) => {
          await axiosPublic.delete(`/api/posts/${id}`);
          fetchAllData();
        }}
        onDeleteEvent={async (id) => {
          await axiosPublic.delete(`/api/events/${id}`);
          fetchAllData();
        }}
        onDeleteAnnouncement={async (id) => {
          await axiosPublic.delete(`/api/announcements/${id}`);
          fetchAllData();
        }}
        onDeleteGallery={async (id) => {
          await axiosPublic.delete(`/api/gallery/${id}`);
          fetchAllData();
        }}
        onDeleteNotice={async (id) => {
          await axiosPublic.delete(`/api/notices/${id}`);
          fetchAllData();
        }}
        onDeleteCourse={async (id) => {
          await axiosPublic.delete(`/api/courses/${id}`);
          fetchAllData();
        }}
      />
    );
  }

  // Route to Member Dashboard
  return (
    <MemberDashboard
      activeTab={currentTab}
      user={user}
      matchedUser={matchedStudent}
      posts={posts}
      events={events}
      announcements={announcements}
      gallery={gallery}
      notices={notices}
      courses={courses}
      devices={devices}
      sponsors={sponsors}
      onNavigate={handleTabNavigate}
      onRefreshData={fetchAllData}
    />
  );
}