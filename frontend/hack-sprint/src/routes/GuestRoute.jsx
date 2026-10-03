import { Navigate, Outlet } from "react-router-dom";
import React from "react";
import { useAuth } from "../hooks/useAuth";

function GuestRoute() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  return !isAuthenticated ? <Outlet /> : <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
}

export default GuestRoute;