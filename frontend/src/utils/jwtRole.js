/** Read role from JWT payload (sync) — avoids blank redirects when localStorage.role is missing. */
export function getRoleFromToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    return payload.role || null;
  } catch {
    return null;
  }
}
