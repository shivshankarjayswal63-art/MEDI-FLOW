import React from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { getDashboardPath, getStoredRole, isAuthenticated } from "../utils/auth";
import { loginPathForRole } from "../utils/authRoutes";

/**
 * @param {string[]} allowedRoles - e.g. ['patient'] or ['user_admin']
 */
export default function RoleGuard({ children, allowedRoles, loginPath }) {
  const [ready, setReady] = React.useState(false);
  const [role, setRole] = React.useState(null);

  React.useEffect(() => {
    setRole(getStoredRole());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress sx={{ color: "#2b2c6c" }} />
      </Box>
    );
  }

  if (!isAuthenticated()) {
    const fallback = loginPath || "/login";
    return <Navigate to={fallback} replace />;
  }
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
