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
