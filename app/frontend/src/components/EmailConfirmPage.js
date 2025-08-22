import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./EmailConfirmPage.css"; // ✅ Подключаем стили

const EmailConfirmPage = () => {
    const [status, setStatus] = useState("pending"); // "pending", "success", "error"
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const success = searchParams.get("success");

        if (success === "true") {
            setStatus("success");
        } else {
            setStatus("error");
        }
    }, []);

    return (
        <div className="confirm-container">
            <div className="confirm-box">
                {status === "pending" && <h2 className="loading-text">Verifying...</h2>}
                {status === "success" && (
                    <>
                        <h2 className="success-text">✅ Email Verified Successfully!</h2>
                        <p>Welcome to the future of betting! Your account is now active.</p>
                        <button className="neon-button" onClick={() => navigate("/login")}>
                            Go to Login
                        </button>
                    </>
                )}
                {status === "error" && (
                    <>
                        <h2 className="error-text">❌ Verification Failed</h2>
                        <p>Invalid or expired token. Please check your email and try again.</p>
                        <button className="neon-button" onClick={() => navigate("/")}>
                            Back to Home
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailConfirmPage;
