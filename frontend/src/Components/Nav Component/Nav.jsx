import React, { useState, useEffect } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { Menu, X } from "lucide-react";

import {

  getDashboardPath,

  getStoredRole,

  isAuthenticated,

  logout,

  ROLE_LABELS,

} from "../../utils/auth";



const topLinks = [

  { label: "Find a doctor", path: "/Find-Doctor" },

  { label: "Online results", path: "/online-results" },

  { label: "Book appointment", path: "/Book-Appointment" },

];



const mainLinks = [

  { name: "Home", path: "/" },

  { name: "Contact Us", path: "/Contact-Us" },

  { name: "Our Facilities", path: "/Our-Facilities" },

  { name: "About Us", path: "/About-Us" },

];



function Nav() {

  const [authed, setAuthed] = useState(false);

  const [role, setRole] = useState(null);

  const [showSignInDropdown, setShowSignInDropdown] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();



  const refreshAuth = () => {

    setAuthed(isAuthenticated());

    setRole(getStoredRole());

  };



  useEffect(() => {

    refreshAuth();

    const onAuth = () => refreshAuth();

    window.addEventListener("medi-flow-auth", onAuth);

    window.addEventListener("storage", onAuth);

    return () => {

      window.removeEventListener("medi-flow-auth", onAuth);

      window.removeEventListener("storage", onAuth);

    };

  }, [location.pathname]);



  useEffect(() => {

    setMobileOpen(false);

    setShowSignInDropdown(false);

    setShowUserMenu(false);

  }, [location.pathname]);



  const handleLogout = () => {

    const wasDoctor = role === "doctor";

    logout();

    navigate(wasDoctor ? "/login-doctor" : "/login");

  };

  const toggleSignInMenu = () => {
    setShowSignInDropdown((prev) => !prev);
    setShowUserMenu(false);
  };

  const dashboardPath = authed ? getDashboardPath(role) : "/login";



  const linkClass =

    "text-white text-xs sm:text-sm font-semibold whitespace-nowrap px-2 py-1 rounded hover:text-[#28b6a2] transition-colors";



  return (

    <header className="relative z-50 w-full font-['Hanken_Grotesk'] sticky top-0 bg-white shadow-md max-w-[100vw] overflow-x-visible overflow-y-visible">

      {/* Quick links strip */}

      <div className="bg-[#2b2c6c] text-white w-full relative z-0">

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-stretch">

          <div

            className="flex flex-1 items-center gap-1 overflow-x-auto px-2 py-2 sm:px-4 sm:justify-center sm:gap-4 md:gap-8"

            style={{ WebkitOverflowScrolling: "touch" }}

          >

            {topLinks.map((item) => (

              <Link key={item.path} to={item.path} className={linkClass}>

                {item.label}

              </Link>

            ))}

          </div>

          <Link

            to="/request-consultation"

            className="bg-[#2FB297] text-white text-xs sm:text-sm font-semibold text-center py-2.5 px-4 hover:bg-[#28a88f] transition-colors shrink-0"

          >

            Request consultation

          </Link>

        </div>

      </div>



      {/* Logo + main nav */}

      <nav className="relative z-20 max-w-7xl mx-auto w-full flex items-center justify-between gap-2 px-3 py-2 sm:px-4 md:px-6">

        <Link to="/" className="flex items-center gap-2 min-w-0 shrink">

          <img src="/Logo.png" alt="MEDI FLOW" className="h-10 w-auto sm:h-12 md:h-14 shrink-0" />

          <div className="min-w-0 leading-tight">

            <div className="text-[#2b2c6c] font-bold text-sm sm:text-base md:text-lg truncate">

              MEDI FLOW

            </div>

            <div className="text-[#71717d] text-[9px] sm:text-[10px] md:text-xs hidden min-[360px]:block">

              HEALTH AND WELLNESS CARE

            </div>

          </div>

        </Link>



        <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-semibold text-sm shrink-0">

          {mainLinks.map((link) => (

            <Link

              key={link.path}

              to={link.path}

              className="relative py-2 text-black hover:text-pink-500 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-pink-500 after:transition-all hover:after:w-full"

            >

              {link.name}

            </Link>

          ))}



          {authed ? (

            <div className="relative">

              <button

                type="button"

                className="relative py-2 text-[#2b2c6c] font-bold hover:text-pink-500 flex items-center gap-1"

                onClick={() => setShowUserMenu(!showUserMenu)}

              >

                {ROLE_LABELS[role] || "My"} Dashboard

                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />

                </svg>

              </button>

              {showUserMenu && (

                <div className="absolute right-0 z-50 w-52 mt-2 bg-white border border-gray-200 rounded shadow-lg py-2">

                  <Link to={dashboardPath} className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>

                    Open dashboard

                  </Link>

                  {role === "patient" && (

                    <Link to="/User-Account" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={() => setShowUserMenu(false)}>

                      My profile

                    </Link>

                  )}

                  <button type="button" className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100" onClick={() => { setShowUserMenu(false); handleLogout(); }}>

                    Log out

                  </button>

                </div>

              )}

            </div>

          ) : (

            <div className="relative z-[70]">

              <button

                type="button"

                className="relative z-[70] py-2 text-black hover:text-pink-500 flex items-center"

                onClick={toggleSignInMenu}

              >

                Sign In

                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />

                </svg>

              </button>

              {showSignInDropdown && (

                <div className="absolute right-0 top-full z-[80] w-48 mt-2 bg-white border border-gray-200 rounded shadow-lg py-2">

                  <Link to="/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={() => setShowSignInDropdown(false)}>

                    Patient / Admin Sign In

                  </Link>

                  <Link to="/login-doctor" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={() => setShowSignInDropdown(false)}>

                    Doctor Sign In

                  </Link>

                </div>

              )}

            </div>

          )}

        </div>



        <button

          type="button"

          className="lg:hidden p-2 text-[#2b2c6c] shrink-0"

          aria-label={mobileOpen ? "Close menu" : "Open menu"}

          onClick={() => setMobileOpen(!mobileOpen)}

        >

          {mobileOpen ? <X size={26} /> : <Menu size={26} />}

        </button>

      </nav>



      {mobileOpen && (

        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 shadow-inner max-h-[70vh] overflow-y-auto">

          <div className="flex flex-col gap-1 font-semibold">

            {mainLinks.map((link) => (

              <Link

                key={link.path}

                to={link.path}

                className="py-3 px-2 text-[#2b2c6c] border-b border-gray-100 hover:text-pink-500"

                onClick={() => setMobileOpen(false)}

              >

                {link.name}

              </Link>

            ))}

          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">

            {authed ? (

              <>

                <Link to={dashboardPath} className="block py-2 text-[#2b2c6c] font-bold" onClick={() => setMobileOpen(false)}>

                  {ROLE_LABELS[role] || "My"} Dashboard

                </Link>

                {role === "patient" && (

                  <Link to="/User-Account" className="block py-2 text-[#71717d]" onClick={() => setMobileOpen(false)}>

                    My profile

                  </Link>

                )}

                <button type="button" className="block py-2 text-red-600 font-medium" onClick={handleLogout}>

                  Log out

                </button>

              </>

            ) : (

              <>

                <Link to="/login" className="block py-2 text-[#2b2c6c]" onClick={() => setMobileOpen(false)}>

                  Patient / Admin Sign In

                </Link>

                <Link to="/login-doctor" className="block py-2 text-[#2b2c6c]" onClick={() => setMobileOpen(false)}>

                  Doctor Sign In

                </Link>

              </>

            )}

          </div>

        </div>

      )}

    </header>

  );

}



export default Nav;


