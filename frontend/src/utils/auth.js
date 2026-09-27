import { routeForRole, inferRoleFromEmail, ROLES } from "./authRoutes";
import { getRoleFromToken, getEmailFromToken } from "./jwtRole";

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
  const token = localStorage.getItem("token");
  const email =
    localStorage.getItem("userEmail") || (token ? getEmailFromToken(token) : null);
  if (email) {
    localStorage.setItem("userEmail", email.toLowerCase().trim());
    const fromEmail = inferRoleFromEmail(email);
    if (fromEmail !== ROLES.PATIENT) {
      if (localStorage.getItem("role") !== fromEmail) {
        localStorage.setItem("role", fromEmail);
      }
      return fromEmail;
    }
  }

  const stored = localStorage.getItem("role");
  if (stored) return stored;
  const fromToken = getRoleFromToken(token);
  if (fromToken) {
    localStorage.setItem("role", fromToken);
    return fromToken;
  }
  if (sessionStorage.getItem("doctor")) return "doctor";
  return null;
}

export function getDashboardPath(role) {
  const r = role || getStoredRole();
  if (!r) return "/login";
  return routeForRole(r);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("doctor");
  window.dispatchEvent(new Event("medi-flow-auth"));
}

export function setAuthSession({ token, role, userId, email }) {
  if (token) localStorage.setItem("token", token);
  if (role) localStorage.setItem("role", role);
  if (userId) localStorage.setItem("userId", userId);
  if (email) localStorage.setItem("userEmail", String(email).toLowerCase().trim());
  localStorage.setItem("isLoggedIn", "true");
  window.dispatchEvent(new Event("medi-flow-auth"));
}
