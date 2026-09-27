function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Read role from JWT payload (sync) — avoids blank redirects when localStorage.role is missing. */
export function getRoleFromToken(token) {
  return parseJwtPayload(token)?.role || null;
}

export function getEmailFromToken(token) {
  return parseJwtPayload(token)?.email || null;
}
