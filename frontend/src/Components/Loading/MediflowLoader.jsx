import React from "react";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import "./MediflowLoader.css";

const ECG_PATH =
  "M0 24 L24 24 L32 8 L40 40 L48 24 L72 24 L80 14 L88 34 L96 24 L120 24 L128 18 L136 30 L144 24 L168 24 L176 10 L184 38 L192 24 L216 24 L240 24 L248 20 L256 28 L264 24 L320 24";

/**
 * @param {"fullscreen" | "inline" | "overlay"} variant
 * @param {string} [message]
 * @param {boolean} [exiting] fade-out class for splash handoff
 */
export default function MediflowLoader({
  variant = "fullscreen",
  message = "Preparing your smart health experience",
  exiting = false,
}) {
  const rootClass = [
    "mf-loader-root",
    `mf-loader-root--${variant}`,
    exiting ? "mf-loader-exit" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const showOrbs = variant !== "inline";

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-label={message}>
      {showOrbs && (
        <>
          <div className="mf-loader-orb mf-loader-orb--1" aria-hidden />
          <div className="mf-loader-orb mf-loader-orb--2" aria-hidden />
          <div className="mf-loader-orb mf-loader-orb--3" aria-hidden />
        </>
      )}

      <div className="mf-loader-core">
        <div className="mf-loader-rings" aria-hidden>
          <div className="mf-loader-ring mf-loader-ring--outer" />
          <div className="mf-loader-ring mf-loader-ring--mid" />
          <div className="mf-loader-ring mf-loader-ring--inner" />
          <HealthAndSafetyIcon className="mf-loader-shield" sx={{ fontSize: 36 }} />
        </div>

        <svg className="mf-loader-ecg" viewBox="0 0 320 48" aria-hidden>
          <path className="mf-loader-ecg-line" d={ECG_PATH} />
        </svg>

        <div className="mf-loader-brand">
          <h1 className="mf-loader-title">MEDI FLOW</h1>
          <p className="mf-loader-message">{message}</p>
        </div>

        <div className="mf-loader-bar" aria-hidden>
          <div className="mf-loader-bar-fill" />
        </div>

        <div className="mf-loader-dots" aria-hidden>
          <span className="mf-loader-dot" />
          <span className="mf-loader-dot" />
          <span className="mf-loader-dot" />
        </div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return <MediflowLoader variant="inline" message="Loading page…" />;
}
