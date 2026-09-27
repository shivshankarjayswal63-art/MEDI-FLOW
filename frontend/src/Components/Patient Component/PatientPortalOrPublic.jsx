import React from "react";
import { getStoredRole, isAuthenticated } from "../../utils/auth";
import PatientLayout from "./PatientLayout";
import { PatientPortalContext } from "./PatientPortalContext";

/** When logged in as patient, show page inside portal sidebar; otherwise full public page. */
export default function PatientPortalOrPublic({ children }) {
  const inPatientSession = isAuthenticated() && getStoredRole() === "patient";
  if (!inPatientSession) {
    return children;
  }
  return (
    <PatientPortalContext.Provider value={true}>
      <PatientLayout>{children}</PatientLayout>
    </PatientPortalContext.Provider>
  );
}
