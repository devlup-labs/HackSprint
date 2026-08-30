import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import React from "react";

function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/account/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
