import React from "react";
import { Link } from "react-router-dom";

function Footer2() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-[#1e1f52] text-white px-4 py-3">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-center sm:text-left text-xs sm:text-sm text-white/80">
        <span>© {year} MEDI FLOW</span>
        <span className="flex flex-wrap justify-center sm:justify-end gap-x-3 gap-y-1">
          <Link to="/Privacy-Policy" className="hover:text-[#2fb297] no-underline text-inherit">
            Privacy
          </Link>
          <a
            href="https://zayacodehub.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#2fb297] no-underline text-inherit font-medium"
          >
            ZAYA CODE HUB
          </a>
        </span>
      </div>
    </footer>
  );
}

export default Footer2;
