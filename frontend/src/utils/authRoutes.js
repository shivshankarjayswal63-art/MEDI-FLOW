export const ROLES = {
  PATIENT: "patient",
  USER_ADMIN: "user_admin",
  PHARMACY_ADMIN: "pharmacy_admin",
  APPOINTMENT_ADMIN: "appointment_admin",
  DOCTOR: "doctor",
};

const EMAIL_ROLE_MAP = {
  "useradmin@gmail.com": ROLES.USER_ADMIN,
  "zayacodehub@gmail.com": ROLES.USER_ADMIN,
  "pharmacyadmin@gmail.com": ROLES.PHARMACY_ADMIN,
  "appointmentadmin@gmail.com": ROLES.APPOINTMENT_ADMIN,
};

/** Staff portals use /login; doctors use /login-doctor */
export const LOGIN_PATH_BY_ROLE = {
  [ROLES.PATIENT]: "/login",
  [ROLES.USER_ADMIN]: "/login",
  [ROLES.PHARMACY_ADMIN]: "/login",
  [ROLES.APPOINTMENT_ADMIN]: "/login",
  [ROLES.DOCTOR]: "/login-doctor",
};

export function inferRoleFromEmail(email) {
  return EMAIL_ROLE_MAP[email?.toLowerCase()] || ROLES.PATIENT;
}

export function routeForRole(role) {
  const map = {
    user_admin: "/User-Dashboard",
    pharmacy_admin: "/Pharmacy-Dashboard",
    appointment_admin: "/Appointment-Dashboard",
    doctor: "/Doctor-Dashboard",
    patient: "/patient-dashboard",
  };
  return map[role] || "/patient-dashboard";
}

export function loginPathForRole(role) {
  return LOGIN_PATH_BY_ROLE[role] || "/login";
}

export function isPatientRole(role) {
  return role === ROLES.PATIENT;
}

export function isDoctorRole(role) {
  return role === ROLES.DOCTOR;
}

export function isStaffRole(role) {
  return [ROLES.USER_ADMIN, ROLES.PHARMACY_ADMIN, ROLES.APPOINTMENT_ADMIN].includes(role);
}
