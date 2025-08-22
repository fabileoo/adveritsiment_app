import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css'; // Using the same styles as Login

const EmailVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || ''; // Getting email from Register.js
    const [isDisabled, setIsDisabled] = useState(true);
    const [timer, setTimer] = useState(120);
    const [emailSent, setEmailSent] = useState(true);

    useEffect(() => {
        if (localStorage.getItem("emailCooldown")) {
            const remainingTime = Math.max(0, parseInt(localStorage.getItem("emailCooldown")) - Date.now());
            if (remainingTime > 0) {
                setTimer(Math.floor(remainingTime / 1000));
                setIsDisabled(true);
            } else {
                setIsDisabled(false);
            }
        }
    }, []);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setIsDisabled(false);
                        localStorage.removeItem("emailCooldown");
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleResendEmail = async () => {
        setIsDisabled(true);
        setTimer(120);
        localStorage.setItem("emailCooldown", Date.now() + 120000);
        setEmailSent(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/users/send-confirmation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Failed to send confirmation email");
            }
        } catch (error) {
            console.error("Error sending confirmation email:", error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Email Verification</h2>
                <p>✅ Registration successful! Please verify your email: <b>{email}</b></p>

                <button 
                    disabled={isDisabled} 
                    onClick={handleResendEmail}
                    className={isDisabled ? "disabled-button" : "active-button"}
                >
                    {isDisabled ? `Resend in ${timer}s` : "Resend Confirmation Email"}
                </button>

                <p>After verification, you can log in to your account.</p>
                <button onClick={() => navigate('/login')}>Go to Login</button>
            </div>
        </div>
    );
};

export default EmailVerification;
