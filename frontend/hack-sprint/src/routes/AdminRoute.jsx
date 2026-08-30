import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import React from "react";

function AdminRoute() {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || role !== "admin") {
    return <Navigate to="/adminlogin" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;