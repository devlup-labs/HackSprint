import { Navigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import React, { useEffect } from "react";

// Organiser-only pages. A signed-in student is turned away with a reason
// rather than being offered the organiser login.
function AdminRoute() {
  const { role, isAuthenticated, loading } = useAuth();
  const isStudent = isAuthenticated && role !== "admin";

  useEffect(() => {
    if (isStudent) {
      // Slight delay so it appears on the page we redirect to.
      // (no cleanup: this component unmounts on the redirect, which must not
      // cancel the message)
      setTimeout(
        () => toast.error("You're signed in as a student. Log out to use an organiser account.", { id: "other-session", duration: 6000 }),
        250
      );
    }
  }, [isStudent]);

  if (loading) return null;

  if (isStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/adminlogin" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
