const USER_PORTAL_ROLES = ["patient", "user_admin", "pharmacy_admin", "appointment_admin"];

const EMAIL_ROLE_MAP = {
  "useradmin@gmail.com": "user_admin",
  "zayacodehub@gmail.com": "user_admin",
  "pharmacyadmin@gmail.com": "pharmacy_admin",
  "appointmentadmin@gmail.com": "appointment_admin",
};

function getEmailRoleMap() {
  const map = { ...EMAIL_ROLE_MAP };
  const custom = process.env.PLATFORM_ADMIN_EMAIL?.toLowerCase()?.trim();
  if (custom) map[custom] = "user_admin";
  return map;
}

function resolveUserRole(user, email) {
  const normalized = String(email || user?.email || "").toLowerCase().trim();
  // Staff portal emails always win over a stale DB role (e.g. patient after bad seed).
  const mapped = getEmailRoleMap()[normalized];
  if (mapped) return mapped;

  const fromDb = user?.role || user?.Role;
  if (fromDb && USER_PORTAL_ROLES.includes(fromDb)) return fromDb;
  return "patient";
}

/** Effective role from JWT payload (used on every authenticated API request). */
function resolveTokenRole(decoded) {
  if (!decoded || typeof decoded !== "object") return null;
  if (decoded.role === "doctor") return "doctor";

  const normalized = String(decoded.email || "").toLowerCase().trim();
  const mapped = getEmailRoleMap()[normalized];
  if (mapped) return mapped;

  const r = decoded.role;
  if (r && USER_PORTAL_ROLES.includes(r)) return r;
  return r || "patient";
}

function attachUserFromJwt(decoded) {
  if (!decoded) return null;
  const role = resolveTokenRole(decoded);
  return { ...decoded, role };
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
  getEmailRoleMap,
  resolveUserRole,
  resolveTokenRole,
  attachUserFromJwt,
  PORTAL_ACCESS,
  canAccessPortal,
};
