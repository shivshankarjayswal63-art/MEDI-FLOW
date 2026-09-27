/** Default API host when env is unset (direct calls — requires CORS on backend). */
const DEFAULT_REMOTE_API = "https://medi-flow-api.vercel.app";

/**
 * Base URL for API requests (no trailing slash).
 * - VITE_API_URL when set at build time
 * - Local dev: http://localhost:5000
 * - Production: "" → same-origin `/api/*` (Vercel rewrite in frontend/vercel.json)
 */
export function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000";
    }
    return "";
  }

  return DEFAULT_REMOTE_API;
}

export function apiUrl(path) {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
