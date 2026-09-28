import { lazy } from "react";

const CHUNK_RELOAD_KEY = "mf_chunk_reload_once";

function isChunkLoadError(error) {
  const msg = String(error?.message || error || "");
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg)
  );
}

/**
 * React.lazy with retries; after a deploy, stale tabs reload once to fetch new index.html + chunks.
 */
export function lazyWithRetry(importFn, { retries = 2 } = {}) {
  return lazy(async () => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const mod = await importFn();
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);
        return mod;
      } catch (error) {
        lastError = error;
        if (!isChunkLoadError(error) || attempt === retries) break;
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
      }
    }

    if (isChunkLoadError(lastError) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
      return new Promise(() => {});
    }

    throw lastError;
  });
}

export { isChunkLoadError };
