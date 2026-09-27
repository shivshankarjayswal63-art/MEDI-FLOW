import React from "react";
import { Navigate } from "react-router-dom";
import { getDashboardPath, getStoredRole, isAuthenticated } from "../../utils/auth";
import { isPatientRole } from "../../utils/authRoutes";
import PatientLayout from "./PatientLayout";
import { PatientPortalContext } from "./PatientPortalContext";

/** When logged in as patient, show page inside portal sidebar; otherwise full public page. */
export default function PatientPortalOrPublic({ children, patientOnly = false }) {
  const role = getStoredRole();
  const authed = isAuthenticated();

  if (authed && role && !isPatientRole(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  const inPatientSession = authed && isPatientRole(role);
  if (!inPatientSession) {
    if (patientOnly && authed) {
      return <Navigate to={getDashboardPath(role)} replace />;
    }
    return children;
  }
  return (
    <PatientPortalContext.Provider value={true}>
      <PatientLayout>{children}</PatientLayout>
    </PatientPortalContext.Provider>
  );
}
