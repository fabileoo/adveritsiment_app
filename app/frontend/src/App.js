import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProfileMenu from './components/ProfileMenu';
import Settings from './components/Settings';
import EmailVerification from './components/EmailVerification'; 
import EmailConfirmPage from './components/EmailConfirmPage'; 
import ResetPassword from './components/ResetPassword';
import ResetPasswordRequest from './components/ResetPasswordRequest';
import './App.css';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" />;
};

function App() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || "Profile");
  const [balance, setBalance] = useState(localStorage.getItem("balance") || "0");
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const updateUserState = () => {
      setUsername(localStorage.getItem("username") || "Profile");
      setBalance(localStorage.getItem("balance") || "0");
    };
    window.addEventListener("storage", updateUserState);
    updateUserState();
    return () => window.removeEventListener("storage", updateUserState);
  }, []);

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && !profileOpen && (
          <div className="top-bar">
            <span className="profile-name" onClick={() => setProfileOpen(true)}>
              {username}
            </span>
            <span className="profile-balance" onClick={() => setProfileOpen(true)}>
              ${balance}
            </span>
          </div>
        )}
        <ProfileMenu isOpen={profileOpen} onClose={() => setProfileOpen(false)} setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/email-confirm" element={<EmailConfirmPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
