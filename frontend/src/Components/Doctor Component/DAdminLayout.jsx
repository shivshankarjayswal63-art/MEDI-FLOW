import React from "react";
import { Home, Calendar, Stethoscope, Plane } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";

const menuItems = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/Doctor-Dashboard" },
  { name: "Appointments", icon: <Calendar size={20} />, path: "/Doctor-Dashboard/View-Appointment" },
  { name: "Leave", icon: <Plane size={20} />, path: "/Doctor-Dashboard/Leave" },
  { name: "Diagnosis", icon: <Stethoscope size={20} />, path: "/Doctor-Dashboard/Diagnosis" },
];

function DAdminLayout({ children }) {
  return (
    <DashboardShell title="MEDI FLOW — Doctor" menuItems={menuItems}>
      {children}
    </DashboardShell>
  );
}

export default DAdminLayout;
