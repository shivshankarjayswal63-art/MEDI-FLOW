import React from "react";
import { Navigate } from "react-router-dom";
import { getDashboardPath, getStoredRole, isAuthenticated } from "../utils/auth";
import { loginPathForRole } from "../utils/authRoutes";

/** /dashboard → role-specific home */
export default function DashboardRedirect() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const role = getStoredRole();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  const home = getDashboardPath(role);
  if (!home || home === "/login") {
    return <Navigate to={loginPathForRole(role)} replace />;
  }
  return <Navigate to={home} replace />;
}
