import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Регистрация пользователя
export const registerUser = async (user) => {
    return await api.post("/users/register", {
        user_name: user.user_name,
        email: user.email,
        password: user.password,
    });
};

export const fetchBetHistory = async () => {
    try {
        const response = await api.get("/bets/history");
        return response.data || { bets: [] }; // ✅ Защита от undefined
    } catch (error) {
        console.error("Error fetching bet history:", error);
        throw error;
    }
};


// Логин пользователя
export const loginUser = async (credentials) => {
    try {
        const response = await api.post("/users/login", credentials);
        
        if (response.status !== 200) {
            console.error("🔴 Ошибка сервера:", response);
            throw new Error("Login failed");
        }

        console.log("✅ Сервер ответил:", response.data);

        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("balance", response.data.balance);

        return response.data;
    } catch (error) {
        console.error("🔴 Ошибка запроса:", error);
        throw error;
    }
};

export const fetchUserData = async () => {
    try {
        const response = await api.get("/users/me");

        if (response.data.avatar_url) {
            const avatarPath = `http://127.0.0.1:8000${response.data.avatar_url}?t=${Date.now()}`;
            localStorage.setItem("avatar_url", avatarPath);
            response.data.avatar_url = avatarPath;
        } else {
            response.data.avatar_url = "http://127.0.0.1:8000/static/default-avatar.png";
        }

        // ✅ Если ник пустой, берем его из localStorage
        if (!response.data.username) {
            response.data.username = localStorage.getItem("username") || "User";
        }

        return response;
    } catch (error) {
        console.error("❌ Ошибка загрузки данных:", error);
        return { data: { username: localStorage.getItem("username"), avatar_url: localStorage.getItem("avatar_url") } };
    }
};







// Обновление пользователя (никнейм, пароль)
export const updateUser = async (data) => {
    const response = await api.patch("/users/update", data);

    if (response.data.new_username && response.data.new_token) {
        localStorage.setItem("username", response.data.new_username);
        localStorage.setItem("token", response.data.new_token);  // ✅ Обновляем токен
        window.dispatchEvent(new Event("storage"));
    }

    return response;
};




// Удаление пользователя
export const deleteUser = async () => {
    const token = localStorage.getItem("token"); // Получаем токен из localStorage
    return await api.delete("/users/delete", {
        headers: {
            Authorization: `Bearer ${token}`,  // Передаем токен в заголовке
        },
    });
};

// Загрузка аватарки
export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/users/upload-avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    return response.data;
};


export default api;
