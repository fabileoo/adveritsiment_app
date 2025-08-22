import React, { useState, useEffect } from "react";
import { fetchBetHistory } from "../services/api";
import "./BetHistory.css";

const BetHistory = () => {
    const [bets, setBets] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBets = async () => {
            try {
                const response = await fetchBetHistory();
                if (response && response.bets) {
                    setBets(response.bets);
                } else {
                    setBets([]);  // Защита от undefined значений
                }
            } catch (error) {
                console.error("Error fetching bet history:", error);
                setError("Failed to fetch bet history.");
            } finally {
                setLoading(false);
            }
        };

        loadBets();
    }, []);

    return (
        <div className="history-container">
            <div className="bet-history-container">
                <h2>Bet History</h2>

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : bets.length === 0 ? (
                    <p>No bets found</p>
                ) : (
                    <table className="bet-history-table">
                        <thead>
                            <tr>
                                <th>Race ID</th>
                                <th>Bot</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bets.map((bet, index) => (
                                <tr key={index}>
                                    <td>{bet.race_id}</td>
                                    <td>{bet.bot_id}</td>
                                    <td>{bet.amount}$</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default BetHistory;
