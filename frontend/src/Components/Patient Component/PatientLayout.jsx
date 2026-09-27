import React from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarPlus,
  Activity,
  FileText,
  Brain,
  LineChart,
  History,
  UserCircle,
} from "lucide-react";
import DashboardShell from "../DashboardShell";

const menuItems = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/patient-dashboard" },
  { name: "Find doctor", icon: <Stethoscope size={20} />, path: "/Find-Doctor" },
  { name: "Book appointment", icon: <CalendarPlus size={20} />, path: "/Book-Appointment" },
  { name: "Request consultation", icon: <FileText size={20} />, path: "/request-consultation" },
  { name: "Lab results", icon: <FileText size={20} />, path: "/online-results" },
  { name: "Symptom AI", icon: <Brain size={20} />, path: "/symptom-analysis" },
  { name: "Analysis history", icon: <History size={20} />, path: "/analysis-history" },
  { name: "Vitals", icon: <Activity size={20} />, path: "/enter-vitals" },
  { name: "Health trends", icon: <LineChart size={20} />, path: "/health-trends" },
  { name: "My profile", icon: <UserCircle size={20} />, path: "/User-Account" },
];

export default function PatientLayout({ children }) {
  return (
    <DashboardShell title="MEDI FLOW — Patient Portal" menuItems={menuItems} searchEnabled={false}>
      {children ?? <Outlet />}
    </DashboardShell>
  );
}
