/** Consultant / care requests that need a patient account. */
export function isConsultationIntent(text) {
  const t = String(text || "").toLowerCase().trim();
  if (!t) return false;
  if (/\b(consultant|consultation|request consult|see a doctor|talk to (a )?doctor|need (a )?doctor|find (me )?a doctor|specialist|second opinion)\b/.test(t)) {
    return true;
  }
  if (/\bconsult\b/.test(t) && !/\bdisclaimer\b/.test(t)) return true;
  return false;
}

export function requiresPatientCareIntent(text) {
  return isBookingMessage(text) || isConsultationIntent(text);
}

/** Client-side booking detection — keeps wizard on even if API is older. */
export function isBookingMessage(text) {
  const t = String(text || "").toLowerCase().trim();
  if (!t) return false;
  if (/\b(book( an?)?\s+appointment|schedule\s+(an?\s+)?appointment|book\s+(for\s+)?me|reschedule)\b/.test(t)) {
    return true;
  }
  if (/\bbook\b/.test(t) && /\bappointment\b/.test(t)) return true;
  if (t === "book" || t === "booking") return true;
  if (/^doctor:/.test(t) || /^date:/.test(t) || /^time:/.test(t)) return true;
  if (/\b(confirm booking|in-person|video call)\b/.test(t)) return true;
  return false;
}
