import React from "react";
import { Home, BarChart2, Package, Plus } from "lucide-react";
import DashboardShell from "../DashboardShell";

const menuItems = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/Pharmacy-Dashboard" },
  { name: "Stock Adding", icon: <Plus size={20} />, path: "/Stock-Adding" },
  { name: "Stock Analytics", icon: <BarChart2 size={20} />, path: "/Pharmacy-Stocks" },
  { name: "Orders", icon: <Package size={20} />, path: "/recent-orders" },
];

function PAdminLayout({ children }) {
  return (
    <DashboardShell title="MEDI FLOW — Pharmacy" menuItems={menuItems}>
      {children}
    </DashboardShell>
  );
}

export default PAdminLayout;
