/** Default API host when env is unset (direct calls — requires CORS on backend). */
const DEFAULT_REMOTE_API = "https://medi-flow-api.vercel.app";

/**
 * Base URL for API requests (no trailing slash).
 * - VITE_API_URL when set at build time
 * - Local dev: http://localhost:5000
 * - Production: "" → same-origin `/api/*` (Vercel rewrite in frontend/vercel.json)
 */
function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (isLocalHost(host)) {
      return fromEnv || "http://localhost:5000";
    }
    // Custom domains (e.g. mediflow.zayacodehub.in): use same-origin /api proxy — avoids CORS
    // even when VITE_API_URL still points at medi-flow-api.vercel.app.
    if (!host.endsWith(".vercel.app")) {
      return "";
    }
    if (fromEnv) return fromEnv;
    return "";
  }

  if (fromEnv) return fromEnv;
  return DEFAULT_REMOTE_API;
}

export function apiUrl(path) {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
