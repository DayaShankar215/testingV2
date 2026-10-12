import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaHome, FaArrowLeft } from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="notfound">
        <div className="empty-icon" style={{ width: 84, height: 84 }}>
          <FaShieldAlt />
        </div>
        <div className="notfound-code">404</div>
        <h1 className="page-title" style={{ fontSize: "1.6rem", marginTop: 8 }}>
          Page not found
        </h1>
        <p className="text-muted" style={{ maxWidth: 460, margin: "8px auto 26px" }}>
          The page you are looking for doesn’t exist or may have been moved.
          Let’s get you back to safety.
        </p>
        <div className="flex justify-center flex-wrap gap-2">
          <Link to="/" className="btn btn-primary">
            <FaHome /> Back to Dashboard
          </Link>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
