import React from "react";
import { Navigate } from "react-router-dom";
import { getDashboardPath, isAuthenticated } from "../utils/auth";

/** /dashboard → role-specific home */
export default function DashboardRedirect() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDashboardPath()} replace />;
}
