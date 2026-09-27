import React from "react";
import { Outlet } from "react-router-dom";
import RoleGuard from "../RoleGuard";
import PatientLayout from "./PatientLayout";
import { PatientPortalContext } from "./PatientPortalContext";

export default function PatientPortalWrapper() {
  return (
    <RoleGuard allowedRoles={["patient"]}>
      <PatientPortalContext.Provider value={true}>
        <PatientLayout />
      </PatientPortalContext.Provider>
    </RoleGuard>
  );
}
