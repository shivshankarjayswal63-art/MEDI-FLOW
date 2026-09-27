const USER_PORTAL_ROLES = ["patient", "user_admin", "pharmacy_admin", "appointment_admin"];

const EMAIL_ROLE_MAP = {
  "useradmin@gmail.com": "user_admin",
  "zayacodehub@gmail.com": "user_admin",
  "pharmacyadmin@gmail.com": "pharmacy_admin",
  "appointmentadmin@gmail.com": "appointment_admin",
};

function resolveUserRole(user, email) {
  const fromDb = user?.role || user?.Role;
  if (fromDb && USER_PORTAL_ROLES.includes(fromDb)) return fromDb;
  const mapped = EMAIL_ROLE_MAP[String(email || user?.email || "").toLowerCase()];
  if (mapped) return mapped;
  return "patient";
}

const PORTAL_ACCESS = {
  user: ["user_admin"],
  pharmacy: ["pharmacy_admin"],
  appointment: ["appointment_admin"],
  doctor: ["doctor"],
  patient: ["patient"],
};

function canAccessPortal(role, portal) {
  const allowed = PORTAL_ACCESS[portal];
  if (!allowed) return false;
  return allowed.includes(role);
}

module.exports = {
  USER_PORTAL_ROLES,
  EMAIL_ROLE_MAP,
  resolveUserRole,
  PORTAL_ACCESS,
  canAccessPortal,
};
