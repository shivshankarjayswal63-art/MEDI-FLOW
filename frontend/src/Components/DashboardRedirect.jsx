import React from "react";
import { Navigate } from "react-router-dom";
import { getDashboardPath, getStoredRole, isAuthenticated } from "../utils/auth";
/** /dashboard → role-specific home */
export default function DashboardRedirect() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const role = getStoredRole();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDashboardPath(role)} replace />;
}
