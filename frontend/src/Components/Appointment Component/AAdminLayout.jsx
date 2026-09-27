import React from "react";
import { Home, Calendar, XCircle } from "lucide-react";
import DashboardShell from "../DashboardShell";

const menuItems = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/Appointment-Dashboard" },
  { name: "Appointments", icon: <Calendar size={20} />, path: "/Appoinment-Management" },
  { name: "Rejected", icon: <XCircle size={20} />, path: "/Rijected-Appoinment" },
];

function AAdminLayout({ children }) {
  return (
    <DashboardShell title="MEDI FLOW — Appointments" menuItems={menuItems}>
      {children}
    </DashboardShell>
  );
}

export default AAdminLayout;
