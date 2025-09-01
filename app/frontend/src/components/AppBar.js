import React from "react";
import { useNavigate } from "react-router-dom";
import "./AppBar.css";

function AppBar({isAuthenticated,username,balance,onProfileClick}){
    const navigate = useNavigate();

    return(
        <div className="app-bar">
            <button className="app-title" onClick={()=>navigate("/dashboard")}>
               Adveritsiment
            </button>
            <div className="app-bar-right">
                {isAuthenticated ?(
                // if yes
                <div className="profile-area" onClick={onProfileClick}>
                    <span className="profile-name">{username}</span>
                    <span className="profile-balance">${balance}</span>
                </div>
                ):(
                    // if guest
                <>
                    <button className="auth-btn" onClick={() => navigate("/login")}>
                        Login
                    </button>
                    <button className="auth-btn" onClick={() => navigate("/register")}>
                        Register
                    </button>
                </>
                )}
            </div>
        </div>
    );
}

export default AppBar;