import { Navigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import React, { useEffect } from "react";

// Student-only pages. An organiser who lands here is sent back to their own
// dashboard — they have to log out to act as a student.
function ProtectedRoute() {
  const { loading, isAuthenticated, role } = useAuth();
  const isAdmin = isAuthenticated && role === "admin";

  useEffect(() => {
    if (isAdmin) {
      toast.error("You're signed in as an organiser. Log out to use a student account.", { id: "other-session", duration: 6000 });
    }
  }, [isAdmin]);

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/account/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
