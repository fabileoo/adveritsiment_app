// src/components/ResetPasswordRequest.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      // Replace the URL with your actual backend endpoint
      const response = await axios.post("http://127.0.0.1:8000/users/request-password-reset", { email });
      setMessage("Password reset email has been sent to your email address.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error. Please check the entered email.");
      setMessage("");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2>Password Reset</h2>
        <form onSubmit={handleRequest}>
          <label htmlFor="email">Enter your email:</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Email</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button className="redirect-button" onClick={() => navigate("/login")}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
