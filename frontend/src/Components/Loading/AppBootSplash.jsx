import React, { useEffect, useState } from "react";
import MediflowLoader from "./MediflowLoader";

const SESSION_KEY = "mf_boot_splash_done";
const MIN_VISIBLE_MS = 1400;

/**
 * Full-screen welcome splash once per browser session; app mounts underneath to prefetch routes.
 */
export default function AppBootSplash({ children }) {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem(SESSION_KEY);
    } catch {
      return true;
    }
  });
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!showSplash) return undefined;

    const started = Date.now();

    const complete = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - started));
      window.setTimeout(() => {
        setExiting(true);
        window.setTimeout(() => {
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
          setShowSplash(false);
        }, 450);
      }, wait);
    };

    if (document.readyState === "complete") {
      complete();
    } else {
      window.addEventListener("load", complete, { once: true });
    }

    return () => window.removeEventListener("load", complete);
  }, [showSplash]);

  return (
    <>
      {children}
      {showSplash && (
        <MediflowLoader
          variant="fullscreen"
          message="Smart healthcare, powered by AI"
          exiting={exiting}
        />
      )}
    </>
  );
}
