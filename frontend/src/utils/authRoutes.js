const EMAIL_ROLE_MAP = {
  "useradmin@gmail.com": "user_admin",
  "pharmacyadmin@gmail.com": "pharmacy_admin",
  "appointmentadmin@gmail.com": "appointment_admin",
};

export function inferRoleFromEmail(email) {
  return EMAIL_ROLE_MAP[email?.toLowerCase()] || "patient";
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
