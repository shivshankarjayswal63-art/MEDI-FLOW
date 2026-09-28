import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { getDashboardPath, getStoredRole, isAuthenticated } from "../utils/auth";
import { defaultLoginPathForAllowedRoles, loginPathForRole } from "../utils/authRoutes";

/**
 * @param {string[]} allowedRoles - e.g. ['patient'] or ['user_admin']
 */
export default function RoleGuard({ children, allowedRoles, loginPath }) {
  const location = useLocation();
  const role = getStoredRole();

  const signInPath = loginPath || defaultLoginPathForAllowedRoles(allowedRoles);

  if (!isAuthenticated()) {
    return <Navigate to={signInPath} replace />;
  }
  if (!role) {
    return <Navigate to={signInPath} replace />;
  }
  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    const redirectPath = getDashboardPath(role);
    if (location.pathname !== redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }
  return children;
}

export function usePortalLoginPath() {
  const role = getStoredRole();
  return loginPathForRole(role) || "/login";
}
