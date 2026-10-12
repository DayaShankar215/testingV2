import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaArrowUp, FaHeart } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link to="/" className="brand">
                <span className="brand-mark">
                  <FaShieldAlt />
                </span>
                <span className="brand-name">SecureShield</span>
              </Link>
              <p className="text-muted" style={{ marginTop: 14, maxWidth: 300 }}>
                Check before you click or reply. AI-powered detection for
                phishing links and scam messages.
              </p>
            </div>

            <div>
              <h4 className="footer-heading">Product</h4>
              <Link to="/url-scan" className="footer-link">
                URL Scanner
              </Link>
              <Link to="/message-scan" className="footer-link">
                Message Scanner
              </Link>
              <Link to="/history" className="footer-link">
                Scan History
              </Link>
            </div>

            <div>
              <h4 className="footer-heading">Account</h4>
              <Link to="/profile" className="footer-link">
                Profile
              </Link>
              <Link to="/" className="footer-link">
                Dashboard
              </Link>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="flex items-center gap-1">
              Crafted with <FaHeart className="heart" /> by{" "}
              <strong>Team SecureShield</strong>
            </p>
            <p>© {currentYear} SecureShield. All rights reserved.</p>
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
