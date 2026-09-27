import React from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Footer() {
  const footerLinks = [
    { to: "/About-Us", label: "About Us" },
    { to: "/Contact-Us", label: "Contact Us" },
    { to: "/Privacy-Policy", label: "Privacy" },
    { to: "/FAQ", label: "FAQ" },
    { to: "/Blog", label: "Blog" },
    { to: "/Help", label: "Help" },
  ];

  return (
    <footer className="w-full max-w-[100vw] overflow-hidden bg-[#2b2c6c] text-white mt-auto relative pt-16 pb-24 sm:pb-20 px-4">
      <img
        className="hidden sm:block w-40 md:w-[280px] h-auto absolute bottom-0 left-0 opacity-90 pointer-events-none"
        src="/Logo2.png"
        alt=""
        aria-hidden
      />

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 relative z-10">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-2xl sm:text-3xl">
          <i className="fa-brands fa-facebook hover:text-[#2FB297] transition-colors" aria-hidden />
          <i className="fa-brands fa-whatsapp hover:text-[#2FB297] transition-colors" aria-hidden />
          <i className="fa-brands fa-twitter hover:text-[#2FB297] transition-colors" aria-hidden />
          <i className="fa-brands fa-instagram hover:text-[#2FB297] transition-colors" aria-hidden />
        </div>

        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm sm:text-base">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-[#2FB297] transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white text-black py-3 px-3 text-center">
        <p className="text-[11px] sm:text-xs leading-snug">
          © MEDI FLOW · Privacy · Cookie Policy · ITPM_Y3S1_WE_91 Group
        </p>
        <p className="text-[11px] sm:text-xs font-bold mt-1">Protected By Copyscape</p>
      </div>
    </footer>
  );
}

export default Footer;
