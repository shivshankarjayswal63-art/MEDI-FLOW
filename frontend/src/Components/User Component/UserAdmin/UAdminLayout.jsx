import React from "react";
import { Home, Users, UserPlus, Stethoscope } from "lucide-react";
import DashboardShell from "../../DashboardShell";

const menuItems = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/User-Dashboard" },
  { name: "Reg. Patients", icon: <Users size={20} />, path: "/User-Management" },
  { name: "Add Patients", icon: <UserPlus size={20} />, path: "/Add-New-Patient" },
  { name: "Doctor verification", icon: <Stethoscope size={20} />, path: "/Doctor-Approvals" },
];

function UAdminLayout({ children }) {
  return (
    <DashboardShell title="MEDI FLOW — User Admin" menuItems={menuItems}>
      {children}
    </DashboardShell>
  );
}

export default UAdminLayout;
