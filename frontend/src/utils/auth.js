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
  const tokenRole = getRoleFromToken(token);

  // Doctor portal JWT always wins — avoids stale staff email from a prior session.
  if (tokenRole === ROLES.DOCTOR) {
    if (localStorage.getItem("role") !== ROLES.DOCTOR) {
      localStorage.setItem("role", ROLES.DOCTOR);
    }
    return ROLES.DOCTOR;
  }

  const email =
    localStorage.getItem("userEmail") || (token ? getEmailFromToken(token) : null);
  if (email) {
    const normalized = email.toLowerCase().trim();
    localStorage.setItem("userEmail", normalized);
    const fromEmail = inferRoleFromEmail(normalized);
    if (fromEmail !== ROLES.PATIENT) {
      if (localStorage.getItem("role") !== fromEmail) {
        localStorage.setItem("role", fromEmail);
      }
      return fromEmail;
    }
  }

  const stored = localStorage.getItem("role");
  if (stored) return stored;
  if (tokenRole) {
    localStorage.setItem("role", tokenRole);
    return tokenRole;
  }
  if (sessionStorage.getItem("doctor")) return ROLES.DOCTOR;
  return null;
}

export function getDashboardPath(role) {
  const r = role || getStoredRole();
  if (!r) return "/login";
  return routeForRole(r);
}

export function logout() {
  clearAuthBeforeLogin();
  window.dispatchEvent(new Event("medi-flow-auth"));
}

/** Clear auth before switching portal (e.g. staff → doctor login). */
export function clearAuthBeforeLogin() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("doctor");
}

export function setAuthSession({ token, role, userId, email, doctorProfile }) {
  clearAuthBeforeLogin();
  if (token) localStorage.setItem("token", token);
  if (role) localStorage.setItem("role", role);
  if (userId) localStorage.setItem("userId", userId);
  if (email) localStorage.setItem("userEmail", String(email).toLowerCase().trim());
  if (role === ROLES.DOCTOR && doctorProfile) {
    sessionStorage.setItem("doctor", JSON.stringify(doctorProfile));
  }
  localStorage.setItem("isLoggedIn", "true");
  window.dispatchEvent(new Event("medi-flow-auth"));
}
