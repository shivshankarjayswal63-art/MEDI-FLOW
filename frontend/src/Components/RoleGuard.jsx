import React from "react";
import { Navigate } from "react-router-dom";
import { getDashboardPath, getStoredRole, isAuthenticated } from "../utils/auth";

/**
 * @param {string[]} allowedRoles - e.g. ['patient'] or ['user_admin']
 */
export default function RoleGuard({ children, allowedRoles, loginPath = "/login" }) {
  if (!isAuthenticated()) {
    return <Navigate to={loginPath} replace />;
  }
  const role = getStoredRole() || "patient";
  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }
  return children;
}
