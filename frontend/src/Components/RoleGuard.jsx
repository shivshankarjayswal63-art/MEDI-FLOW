import React from "react";
import { Navigate } from "react-router-dom";
import { getDashboardPath, getStoredRole, isAuthenticated } from "../utils/auth";
import { loginPathForRole } from "../utils/authRoutes";

/**
 * @param {string[]} allowedRoles - e.g. ['patient'] or ['user_admin']
 */
export default function RoleGuard({ children, allowedRoles, loginPath }) {
  if (!isAuthenticated()) {
    const fallback = loginPath || "/login";
    return <Navigate to={fallback} replace />;
  }
  const role = getStoredRole();
  if (!role) {
    return <Navigate to={loginPath || "/login"} replace />;
  }
  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }
  return children;
}

export function usePortalLoginPath() {
  const role = getStoredRole();
  return loginPathForRole(role) || "/login";
}
