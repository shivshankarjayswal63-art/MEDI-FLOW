import React from "react";
import { Home, Users, UserPlus } from "lucide-react";
import DashboardShell from "../../../components/DashboardShell";

const menuItems = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/User-Dashboard" },
  { name: "Reg. Patients", icon: <Users size={20} />, path: "/User-Management" },
  { name: "Add Patients", icon: <UserPlus size={20} />, path: "/Add-New-Patient" },
];

function UAdminLayout({ children }) {
  return (
    <DashboardShell title="MEDI FLOW — User Admin" menuItems={menuItems}>
      {children}
    </DashboardShell>
  );
}

export default UAdminLayout;
