import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserData } from "../services/api";

// Создаём контекст
const UserContext = createContext(null);

// Создаём провайдер для хранения данных о пользователе
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        username: localStorage.getItem("username") || "",
        balance: localStorage.getItem("balance") || 0,
    });

    // Функция обновления данных
    const updateUser = async () => {
        try {
            const response = await fetchUserData();
            setUser(response.data);
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("balance", response.data.balance);
        } catch (error) {
            console.error("🔴 Ошибка при обновлении данных пользователя:", error);
        }
    };

    // Загружаем данные при монтировании
    useEffect(() => {
        updateUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Хук для использования контекста
export const useUser = () => useContext(UserContext);
