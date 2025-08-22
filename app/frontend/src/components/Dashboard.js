import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Подключаем стили

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <div className="dashboard-box">
                <h2 className="dashboard-title">Welcome to the Future</h2>
                <p className="dashboard-subtitle">Select an action:</p>
                <div className="dashboard-buttons">
                    <button className="neon-button" onClick={() => navigate("/races")}>Enter the Races</button>
                    <button className="neon-button" onClick={() => navigate("/top-up")}>Top Up Balance</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
