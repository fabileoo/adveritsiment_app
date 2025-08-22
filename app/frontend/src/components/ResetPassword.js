// src/components/ResetPassword.js
import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Extract token from query string (?token=...)
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const response = await axios.post("http://127.0.0.1:8000/users/reset-password", {
        token,
        new_password: newPassword,
      });
      setMessage("Password has been reset successfully. Redirecting to login...");
      setError("");
      // Optional: Redirect to login after a few seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Error resetting password. Please try again.");
      setMessage("");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2>Set New Password</h2>
        <form onSubmit={handleReset}>
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        {/* Кнопка для перехода на регистрацию */}
        <button 
          className="redirect-button" 
          onClick={() => navigate("/register")}
        >
          Go to Registration
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
