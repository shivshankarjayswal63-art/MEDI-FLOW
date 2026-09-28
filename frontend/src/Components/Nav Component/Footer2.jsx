import React from "react";
import { Link } from "react-router-dom";

function Footer2() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-[#1e1f52] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left text-xs sm:text-sm text-white/80">
          <span>© {year} MEDI FLOW</span>

          <span className="flex flex-wrap justify-center sm:justify-end gap-x-3 gap-y-1">
            <Link
              to="/Privacy-Policy"
              className="hover:text-[#2fb297] no-underline text-inherit"
            >
              Privacy
            </Link>
            <Link
              to="/Terms-Conditions"
              className="hover:text-[#2fb297] no-underline text-inherit"
            >
              Terms
            </Link>
            <Link
              to="/FAQ"
              className="hover:text-[#2fb297] no-underline text-inherit"
            >
              FAQ
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
      </div>
    </footer>
  );
}

export default Footer2;
