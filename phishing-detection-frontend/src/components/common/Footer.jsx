import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaArrowUp,
  FaHeart,
  FaBolt,
  FaLock,
  FaRobot,
  FaLink,
  FaComment,
  FaHistory,
  FaChartPie,
  FaSignInAlt,
  FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { OPEN_AUTH_EVENT } from "./CommandPalette";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const openAuth = () =>
    window.dispatchEvent(
      new CustomEvent(OPEN_AUTH_EVENT, { detail: { mode: "login" } })
    );

  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <Link to="/" className="brand footer-brand">
                <span className="brand-mark">
                  <FaShieldAlt />
                </span>
                <span className="brand-name">SecureShield</span>
              </Link>
              <p className="footer-about">
                Check before you click or reply. AI-powered detection for
                phishing links and scam messages, protecting you in real time.
              </p>
              <div className="footer-chips">
                <span className="footer-chip">
                  <FaBolt /> Real-time
                </span>
                <span className="footer-chip">
                  <FaRobot /> AI-powered
                </span>
                <span className="footer-chip">
                  <FaLock /> Privacy-first
                </span>
              </div>
            </div>

            <nav className="footer-col" aria-label="Product">
              <h4 className="footer-heading">Product</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/url-scan" className="footer-link">
                    <FaLink /> URL Scanner
                  </Link>
                </li>
                <li>
                  <Link to="/message-scan" className="footer-link">
                    <FaComment /> Message Scanner
                  </Link>
                </li>
                <li>
                  <Link to="/history" className="footer-link">
                    <FaHistory /> Scan History
                  </Link>
                </li>
                <li>
                  <Link to="/" className="footer-link">
                    <FaChartPie /> Dashboard
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="footer-col" aria-label="Account">
              <h4 className="footer-heading">Account</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/profile" className="footer-link">
                    <FaUserCircle /> Profile
                  </Link>
                </li>
                <li>
                  {isAuthenticated ? (
                    <Link to="/history" className="footer-link">
                      <FaHistory /> My Scans
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="footer-link footer-link-btn"
                      onClick={openAuth}
                    >
                      <FaSignInAlt /> Sign In / Register
                    </button>
                  )}
                </li>
              </ul>
            </nav>

            <div className="footer-col">
              <h4 className="footer-heading">System Status</h4>
              <div className="footer-status">
                <span className="status-dot" aria-hidden="true" />
                <span>All systems operational</span>
              </div>
              <p className="footer-status-note">
                Scanning engine online. Reports, history and feedback are
                available.
              </p>
              <div className="footer-actions">
                <Link
                  to="/url-scan"
                  className="footer-action"
                  title="Scan a URL"
                  aria-label="Scan a URL"
                >
                  <FaLink />
                </Link>
                <Link
                  to="/message-scan"
                  className="footer-action"
                  title="Scan a message"
                  aria-label="Scan a message"
                >
                  <FaComment />
                </Link>
                <Link
                  to="/history"
                  className="footer-action"
                  title="Scan history"
                  aria-label="Scan history"
                >
                  <FaHistory />
                </Link>
                <Link
                  to="/"
                  className="footer-action"
                  title="Dashboard"
                  aria-label="Dashboard"
                >
                  <FaChartPie />
                </Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {currentYear} SecureShield. All rights reserved.</p>
            <p className="footer-made">
              Crafted with <FaHeart className="heart" /> by{" "}
              <strong>Team SecureShield</strong>
            </p>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-top"
          aria-label="Scroll to top"
        >
          <FaArrowUp />
        </button>
      )}
    </>
  );
};

export default Footer;
