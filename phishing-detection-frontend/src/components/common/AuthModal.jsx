// components/common/AuthModal.jsx
import React, { useState } from "react";
import { FaTimes, FaEnvelope, FaLock, FaUser, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const AuthModal = ({ isOpen, onClose, initialMode = "login", onSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setConfirmPassword("");
    setAcceptTerms(false);
    setMode(initialMode);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "register") {
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
      if (!firstName.trim()) {
        toast.error("Please enter your first name");
        return;
      }
    }

    setLoading(true);
    try {
      let response;
      if (mode === "login") {
        response = await login({ email, password });
      } else {
        response = await register({ firstName, lastName, email, password });
      }

      if (onSuccess) {
        onSuccess(response);
      }
      handleClose();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setConfirmPassword("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-panel auth-panel"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Sign in" : "Create account"}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="auth-head">
          <div className="brand-mark lg">
            <FaShieldAlt />
          </div>
          <h2 className="auth-title">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-sub">
            {mode === "login"
              ? "Sign in to save your scans and access premium features"
              : "Start securing your online experience today"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-grid-2">
              <div className="field">
                <label htmlFor="auth-first">First Name</label>
                <div className="input-wrap">
                  <FaUser className="input-icon" />
                  <input
                    id="auth-first"
                    className="input"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="auth-last">Last Name</label>
                <div className="input-wrap">
                  <FaUser className="input-icon" />
                  <input
                    id="auth-last"
                    className="input"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-wrap">
              <FaEnvelope className="input-icon" />
              <input
                id="auth-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <div className="input-wrap">
              <FaLock className="input-icon" />
              <input
                id="auth-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "login" ? "Enter your password" : "Create a password"
                }
                required
                minLength={6}
              />
            </div>
            {mode === "register" && (
              <span className="field-hint">Minimum 8 characters</span>
            )}
          </div>

          {mode === "register" && (
            <div className="field">
              <label htmlFor="auth-confirm">Confirm Password</label>
              <div className="input-wrap">
                <FaLock className="input-icon" />
                <input
                  id="auth-confirm"
                  className="input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          )}

          {mode === "register" && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>
                I agree to the <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>
              </span>
            </label>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading && <span className="spinner spinner-sm" aria-hidden="true" />}
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          <button type="button" onClick={switchMode}>
            {mode === "login" ? "Sign up now" : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
