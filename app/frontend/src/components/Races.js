import React, { useEffect, useState } from "react";
import "./Races.css"; // Подключаем стили

const Races = () => {
    const [races, setRaces] = useState([]);

    useEffect(() => {
        // Имитация запроса к API для получения списка гонок
        setTimeout(() => {
            setRaces([
                { id: 1, track: "Neon Circuit", status: "Upcoming" },
                { id: 2, track: "Cyber Speedway", status: "Ongoing" },
                { id: 3, track: "Futuristic Arena", status: "Completed" }
            ]);
        }, 1000);
    }, []);

    return (
        <div className="races-container">
            <div className="races-box">
                <h2 className="races-title">Available Races</h2>
                <ul className="races-list">
                    {races.length === 0 ? (
                        <p className="loading-text">Loading Races...</p>
                    ) : (
                        races.map((race) => (
                            <li key={race.id} className="race-item">
                                <span className="race-track">{race.track}</span>
                                <span className={`race-status ${race.status.toLowerCase()}`}>{race.status}</span>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Races;
