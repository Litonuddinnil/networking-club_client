 import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layout components
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Page views
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ErrorPage from "../pages/ErrorPage";
import FacebookRedirect from "../pages/FacebookRedirect";
import Contact from "../pages/Contact";
import NetworkLab from "../pages/NetworkLab";

// Admin full-page form routes
import PostFormPage from "../pages/admin/forms/PostFormPage";
import EventFormPage from "../pages/admin/forms/EventFormPage";
import AnnouncementFormPage from "../pages/admin/forms/AnnouncementFormPage";
import GalleryFormPage from "../pages/admin/forms/GalleryFormPage";

export const router = createBrowserRouter([
  // 1. PUBLIC FACING SEGMENT (wrapped in MainLayout)
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "connect/facebook", element: <FacebookRedirect /> },
      { path: "contact", element: <Contact /> },
      { path: "lab", element: <NetworkLab /> },
    ],
  },

  // 2. AUTHENTICATION SEGMENT (AuthLayout - Canonical /login & /register)
  {
    path: "/login",
    element: <AuthLayout />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: "/register",
    element: <AuthLayout />,
    children: [{ index: true, element: <Register /> }],
  },
  {
    path: "/auth/login",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/auth/register",
    element: <Navigate to="/register" replace />,
  },

  // 3. PRIVATE SECURE DASHBOARD SEGMENT
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: ":tab", element: <Dashboard /> },

      // Full-page admin forms (replacing modals) --------------
      // Posts
      { path: "posts/new", element: <PostFormPage /> },
      { path: "posts/:id/edit", element: <PostFormPage /> },

      // Events
      { path: "events/new", element: <EventFormPage /> },
      { path: "events/:id/edit", element: <EventFormPage /> },

      // Announcements
      { path: "announcements/new", element: <AnnouncementFormPage /> },
      { path: "announcements/:id/edit", element: <AnnouncementFormPage /> },

      // Gallery
      { path: "gallery/new", element: <GalleryFormPage /> },
      { path: "gallery/:id/edit", element: <GalleryFormPage /> },
    ],
  },

  // Fallback for any unhandled routes
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;