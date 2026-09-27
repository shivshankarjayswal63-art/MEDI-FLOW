import React from "react";
import { Navigate } from "react-router-dom";
import { getDashboardPath, getStoredRole, isAuthenticated } from "../../utils/auth";
import { isPatientRole } from "../../utils/authRoutes";
import { isPatientSession } from "../../utils/auth";
import PatientLayout from "./PatientLayout";
import { PatientPortalContext } from "./PatientPortalContext";
import PatientLoginGate from "./PatientLoginGate";
import Nav from "../Nav Component/Nav";

/** When logged in as patient, show page inside portal sidebar; otherwise full public page. */
export default function PatientPortalOrPublic({
  children,
  patientOnly = false,
  requirePatientAuth = false,
  gateTitle,
  gateMessage,
}) {
  const role = getStoredRole();
  const authed = isAuthenticated();

  if (authed && role && !isPatientRole(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  const inPatientSession = isPatientSession();

  if (requirePatientAuth && !inPatientSession) {
    const gate = (
      <PatientLoginGate
        title={gateTitle}
        message={gateMessage}
      />
    );
    return (
      <div className="min-h-screen bg-[#f4f6fb]">
        <Nav />
        <div className="container mx-auto px-4 py-8">{gate}</div>
      </div>
    );
  }

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
