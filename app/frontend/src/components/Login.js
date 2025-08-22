import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, fetchUserData } from '../services/api';
import './Login.css';

const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ user_name: username, password });

            if (!response || !response.access_token) {
                setError("Invalid response from server");
                return;
            }

            // ✅ Устанавливаем, что пользователь аутентифицирован
            setIsAuthenticated(true);

            // ✅ Обновляем локальное хранилище
            localStorage.setItem("token", response.access_token);
            localStorage.setItem("username", response.username);
            localStorage.setItem("balance", response.balance);

            // ✅ Вызываем событие обновления
            window.dispatchEvent(new Event("storage"));

            // ✅ Перенаправляем пользователя
            navigate('/dashboard');
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
                <p className="forgot-password">
  <Link to="/reset-password-request">Forgot password?</Link>
</p>
            </div>
        </div>
    );
};

export default Login;
