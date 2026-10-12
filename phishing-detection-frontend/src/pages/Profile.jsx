// pages/Profile.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../services/api";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const response = await updateProfile({ firstName, lastName, email });
      if (response.user) {
        setUser(response.user);
        toast.success("Profile updated successfully!");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 820 }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 40 }}>
          <h1
            className="page-title gradient-text"
            style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)" }}
          >
            Profile Settings
          </h1>
          <p className="text-secondary" style={{ fontSize: "1.05rem" }}>
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="card card-pad" style={{ marginBottom: 32 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 28 }}>
            <div className="avatar lg">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                {user?.firstName} {user?.lastName || ""}
              </h2>
              <p className="text-secondary" style={{ margin: "2px 0 6px" }}>
                {user?.email || ""}
              </p>
              <span className="badge badge-success">{user?.role || "User"}</span>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileUpdate}>
            <div className="form-grid">
              <div className="form-grid-2">
                <div className="field">
                  <label className="label">First Name</label>
                  <div className="input-wrap">
                    <FaUser className="input-icon" />
                    <input
                      className="input"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Last Name</label>
                  <div className="input-wrap">
                    <FaUser className="input-icon" />
                    <input
                      className="input"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label">Email Address</label>
                <div className="input-wrap">
                  <FaEnvelope className="input-icon" />
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn btn-block btn-lg ${
                  saved ? "btn-success" : "btn-primary"
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinning" />
                    <span>Saving...</span>
                  </>
                ) : saved ? (
                  <>
                    <FaCheckCircle />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Card */}
        <div className="card card-pad">
          <h3 className="section-title" style={{ marginBottom: 20 }}>
            Change Password
          </h3>

          <form onSubmit={handlePasswordChange}>
            <div className="form-grid">
              <div className="field">
                <label className="label">Current Password</label>
                <div className="input-wrap">
                  <FaLock className="input-icon" />
                  <input
                    className="input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">New Password</label>
                <div className="input-wrap">
                  <FaLock className="input-icon" />
                  <input
                    className="input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Confirm New Password</label>
                <div className="input-wrap">
                  <FaLock className="input-icon" />
                  <input
                    className="input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="btn btn-danger btn-block btn-lg"
              >
                {passwordLoading ? (
                  <>
                    <FaSpinner className="spinning" />
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <FaLock />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
