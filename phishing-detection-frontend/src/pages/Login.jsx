// pages/Login.jsx
import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaSignInAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-sub">
            Sign in to save your scans and access premium features
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-wrap">
              <FaEnvelope className="input-icon" />
              <input
                id="login-email"
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
            <label htmlFor="login-password">Password</label>
            <div className="input-wrap">
              <FaLock className="input-icon" />
              <input
                id="login-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              <>
                <FaSignInAlt /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-perks">
          <span>
            <FaCheckCircle /> Save your scan history
          </span>
          <span>
            <FaCheckCircle /> Download PDF reports
          </span>
          <span>
            <FaCheckCircle /> Sync across devices
          </span>
        </div>

        <div className="auth-switch">
          Don&apos;t have an account?
          <Link to="/register" state={{ from }}>
            {" "}
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
