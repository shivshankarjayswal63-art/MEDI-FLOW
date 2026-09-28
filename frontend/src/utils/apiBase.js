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
    // Custom domains: call API host directly (same-origin /api proxy often returns 405 or SPA HTML).
    if (!host.endsWith(".vercel.app")) {
      return fromEnv || DEFAULT_REMOTE_API;
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

/** Vercel request body limit (~4.5MB); base64 JSON needs headroom. */
export function getMaxReportUploadBytes() {
  const base = getApiBase();
  if (!base || /localhost|127\.0\.0\.1/.test(base)) {
    return 10 * 1024 * 1024;
  }
  // For remote (Vercel) deployments keep the smaller JSON-friendly limit.
  return 3 * 1024 * 1024;
}
