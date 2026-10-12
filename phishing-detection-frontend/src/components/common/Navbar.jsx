// components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaHome,
  FaGlobe,
  FaEnvelope,
  FaHistory,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaUserPlus,
  FaSignInAlt,
} from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "./AuthModal";

const navItems = [
  { path: "/", label: "Dashboard", icon: FaHome },
  { path: "/url-scan", label: "URL Scanner", icon: FaGlobe },
  { path: "/message-scan", label: "Message Scanner", icon: FaEnvelope },
  { path: "/history", label: "History", icon: FaHistory },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setShowUserMenu(false);
      }
    };
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const isActive = (path) => location.pathname === path;

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setDrawerOpen(false);
    navigate("/");
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    window.location.reload();
  };

  const initial = (user?.firstName || "U").charAt(0).toUpperCase();

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link to="/" className="brand" aria-label="SecureShield home">
            <span className="brand-mark">
              <FaShieldAlt />
            </span>
            <span>
              <span className="brand-name">SecureShield</span>
              <span className="brand-sub">
                {isAuthenticated
                  ? `Welcome, ${user?.firstName || "User"}`
                  : "AI Security Platform"}
              </span>
            </span>
          </Link>

          <div className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link${isActive(item.path) ? " active" : ""}`}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="nav-actions">
            <span className="hide-mobile">
              <ThemeToggle />
            </span>

            {isAuthenticated ? (
              <div style={{ position: "relative" }} ref={userMenuRef}>
                <button
                  className="user-trigger"
                  onClick={() => setShowUserMenu((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                >
                  <span className="avatar">{initial}</span>
                  <span className="hide-mobile">{user?.firstName || "User"}</span>
                </button>

                {showUserMenu && (
                  <div className="dropdown" role="menu">
                    <div className="dropdown-user">
                      <strong>
                        {user?.firstName} {user?.lastName || ""}
                      </strong>
                      <span>{user?.email || ""}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser size={15} /> Profile
                    </Link>
                    <button
                      className="dropdown-item danger"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className="btn btn-secondary btn-sm hide-mobile"
                  onClick={() => handleAuthClick("login")}
                >
                  <FaSignInAlt size={13} /> Login
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAuthClick("register")}
                >
                  <FaUserPlus size={13} /> Register
                </button>
              </>
            )}

            <button
              className="nav-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="mobile-drawer" aria-label="Mobile navigation">
            <div className="drawer-head">
              <Link to="/" className="brand" onClick={() => setDrawerOpen(false)}>
                <span className="brand-mark">
                  <FaShieldAlt />
                </span>
                <span className="brand-name">SecureShield</span>
              </Link>
              <button
                className="modal-close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link${
                    isActive(item.path) ? " active" : ""
                  }`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="drawer-foot">
              {isAuthenticated ? (
                <>
                  <div className="dropdown-user" style={{ border: 0 }}>
                    <div className="flex items-center gap-2">
                      <span className="avatar">{initial}</span>
                      <span>
                        <strong>
                          {user?.firstName} {user?.lastName || ""}
                        </strong>
                        <span>{user?.email || ""}</span>
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="btn btn-secondary btn-block"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <FaUser size={14} /> Profile
                  </Link>
                  <button className="btn btn-danger btn-block" onClick={handleLogout}>
                    <FaSignOutAlt size={14} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-secondary btn-block"
                    onClick={() => handleAuthClick("login")}
                  >
                    <FaSignInAlt size={14} /> Login
                  </button>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => handleAuthClick("register")}
                  >
                    <FaUserPlus size={14} /> Create Account
                  </button>
                </>
              )}
              <div className="flex justify-center mt-1">
                <ThemeToggle />
              </div>
            </div>
          </aside>
        </>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;
