import { routeForRole, inferRoleFromEmail } from "./authRoutes";

export const ROLE_LABELS = {
  patient: "Patient",
  user_admin: "User Admin",
  pharmacy_admin: "Pharmacy",
  appointment_admin: "Appointments",
  doctor: "Doctor",
};

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}

export function getStoredRole() {
  const stored = localStorage.getItem("role");
  if (stored) return stored;
  if (sessionStorage.getItem("doctor")) return "doctor";
  return null;
}

export function getDashboardPath(role) {
  return routeForRole(role || getStoredRole() || "patient");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("doctor");
  window.dispatchEvent(new Event("medi-flow-auth"));
}

export function setAuthSession({ token, role, userId }) {
  if (token) localStorage.setItem("token", token);
  if (role) localStorage.setItem("role", role);
  if (userId) localStorage.setItem("userId", userId);
  localStorage.setItem("isLoggedIn", "true");
  window.dispatchEvent(new Event("medi-flow-auth"));
}
