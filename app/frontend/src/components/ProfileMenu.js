import React, { useEffect, useState } from "react";
import { fetchUserData } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./ProfileMenu.css";

const ProfileMenu = ({ isOpen, onClose }) => {
    const [userData, setUserData] = useState({ username: "", balance: 0, avatar_url: localStorage.getItem("avatar_url") || "/static/default-avatar.png" });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchUserData();
                setUserData(response.data);
    
                localStorage.setItem("username", response.data.username);
                localStorage.setItem("avatar_url", response.data.avatar_url);
                window.dispatchEvent(new Event("storage"));
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
    
        fetchData();
    
        const handleStorageChange = () => {
            setUserData((prev) => ({
                ...prev,
                username: localStorage.getItem("username") || "User",
                avatar_url: localStorage.getItem("avatar_url") || "/static/default-avatar.png",
            }));
        };
    
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [localStorage.getItem("username")]); // 🔥 Теперь ник обновляется мгновенно
    
    
    
    
    
    return (
        <div className={`profile-menu-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
            <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
            <img
    src={userData.avatar_url}
    alt="Avatar"
    className="profile-avatar"
    onError={(e) => {
        console.error("Ошибка загрузки аватара:", e.target.src);
        e.target.src = "http://127.0.0.1:8000/static/default-avatar.png"; // ✅ Если не загружается, ставим дефолтный
    }}
/>


                <h3>{userData.username || "Loading..."}</h3>
                <p>Balance: {userData.balance !== undefined ? `${userData.balance}$` : "Loading..."}</p>

                <button className="profile-button settings" onClick={() => {
                    navigate("/settings");
                    onClose();
                }}>Settings</button>

                <button className="profile-button logout" onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                }}>Logout</button>
            </div>
        </div>
    );
};

export default ProfileMenu;
