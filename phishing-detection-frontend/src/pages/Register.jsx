// pages/Register.jsx
import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      await register({ firstName, lastName, email, password });
      navigate(from, { replace: true });
    } catch {
      // Error toast is shown by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <div className="brand-mark lg">
            <FaShieldAlt />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">
            Start securing your online experience today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="reg-first">First Name</label>
              <div className="input-wrap">
                <FaUser className="input-icon" />
                <input
                  id="reg-first"
                  className="input"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  autoComplete="given-name"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="reg-last">Last Name</label>
              <div className="input-wrap">
                <FaUser className="input-icon" />
                <input
                  id="reg-last"
                  className="input"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email Address</label>
            <div className="input-wrap">
              <FaEnvelope className="input-icon" />
              <input
                id="reg-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <div className="input-wrap">
              <FaLock className="input-icon" />
              <input
                id="reg-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <span className="field-hint">Minimum 8 characters</span>
          </div>

          <div className="field">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <div className="input-wrap">
              <FaLock className="input-icon" />
              <input
                id="reg-confirm"
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <span>
              I agree to the <a href="#terms">Terms of Service</a> and{" "}
              <a href="#privacy">Privacy Policy</a>
            </span>
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              <>
                <FaUserPlus /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?
          <Link to="/login" state={{ from }}>
            {" "}
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
