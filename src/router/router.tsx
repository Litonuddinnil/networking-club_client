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
import EventDetails from "../pages/EventDetails";

// Admin view + create/edit flows are real routes, not modals, so a record
// can be linked, bookmarked and reopened with the browser back button.
import EntityDetailPage from "../pages/admin/EntityDetailPage";
import EntityFormPage from "../pages/admin/EntityFormPage";
import EventRegisterPage from "../pages/member/EventRegisterPage";
import RegistrationReviewPage from "../pages/admin/RegistrationReviewPage";

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
      // Public event page — shareable, no login needed to read.
      { path: "events/:id", element: <EventDetails /> },
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

      // Member-facing event sign-up form. Declared before the generic
      // entity routes so the static "events" segment ranks highest.
      { path: "events/:id/register", element: <EventRegisterPage /> },

      // Admin review of one submitted registration form.
      { path: "registrations/:id", element: <RegistrationReviewPage /> },

      // Entity routes are declared before the catch-all `:tab` so the
      // static "new" segment and the two-segment record paths win the
      // ranking. `:tab` still serves /dashboard/posts, /dashboard/events…
      { path: ":entity/new", element: <EntityFormPage /> },
      { path: ":entity/:id/edit", element: <EntityFormPage /> },
      { path: ":entity/:id", element: <EntityDetailPage /> },

      { path: ":tab", element: <Dashboard /> },
    ],
  },

  // Fallback for any unhandled routes
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;