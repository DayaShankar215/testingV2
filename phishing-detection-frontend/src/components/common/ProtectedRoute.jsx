// components/common/ProtectedRoute.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "./AuthModal";
import { FaLock } from "react-icons/fa";

const ProtectedRoute = ({ children, showAuthModal = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showModal, setShowModal] = React.useState(false);

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <span className="spinner spinner-lg" aria-hidden="true" />
      </div>
    );
  }

  if (!isAuthenticated && showAuthModal) {
    return (
      <>
        <div className="container">
          <div className="gate">
            <div className="empty-icon">
              <FaLock />
            </div>
            <h1 className="page-title" style={{ fontSize: "1.9rem" }}>
              Sign in to continue
            </h1>
            <p className="text-muted" style={{ maxWidth: 520, margin: "10px auto 26px" }}>
              Sign in to save your scan history, download PDF reports, and access
              all premium features across all your devices.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
              Sign In / Register
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      </>
    );
  }

  return children;
};

export default ProtectedRoute;
