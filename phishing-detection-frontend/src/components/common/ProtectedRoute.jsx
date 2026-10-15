// components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <span className="spinner spinner-lg" aria-hidden="true" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  return children;
};

export default ProtectedRoute;
