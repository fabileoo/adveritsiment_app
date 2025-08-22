import React, { useState, useEffect } from "react";
import { updateUser, fetchUserData, uploadAvatar, deleteUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ username: "", email: "", avatar_url: "" });
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const response = await fetchUserData();
                setUserData(response.data);
                setNewUsername(response.data.username); // ✅ Обновляем поле ника
    
                const avatar = response.data.avatar_url 
                    ? `${response.data.avatar_url}?timestamp=${Date.now()}`
                    : "/static/default-avatar.png";
    
                setPreview(avatar);
                localStorage.setItem("avatar_url", avatar);
                window.dispatchEvent(new Event("storage"));
            } catch (error) {
                console.error("Error loading user data", error);
            }
        };
        loadUserData();
    }, []);
    

    
    const handleUpdate = async () => {
        if (newPassword && newPassword !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
    
        try {
            const response = await updateUser({ username: newUsername, password: newPassword });
    
            if (response.data.new_username && response.data.new_token) {
                setSuccess("Profile updated successfully!");
                setError("");
    
                // ✅ Обновляем локальные данные
                setUserData((prev) => ({
                    ...prev,
                    username: response.data.new_username
                }));
    
                // ✅ Перезапрашиваем данные, чтобы обновился и аватар
                await fetchUserData();
    
                // ✅ Обновляем localStorage
                localStorage.setItem("username", response.data.new_username);
                localStorage.setItem("token", response.data.new_token);
                window.dispatchEvent(new Event("storage"));
            }
    
        } catch (error) {
            setError("Failed to update profile");
        }
    };
    
    
    
    

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
            return;
        }

        try {
            await deleteUser();
            localStorage.clear();
            navigate("/register");
        } catch (error) {
            setError("Failed to delete account");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        setSelectedFile(file);
    
        // ✅ Создаем URL для предварительного просмотра
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
    };
    
    const handleUpload = async () => {
        if (!selectedFile) return;
    
        try {
            const response = await uploadAvatar(selectedFile);
    
            if (response.avatar_url) {
                const newAvatar = `${response.avatar_url}?t=${Date.now()}`; // ⬅ Анти-кэширование
                await fetchUserData();
                setUserData((prev) => ({ ...prev, avatar_url: newAvatar }));
                setPreview(newAvatar);
    
                // ✅ Переместили сохранение в localStorage после обновления UI
                localStorage.setItem("avatar_url", newAvatar);
                window.dispatchEvent(new Event("storage"));
    
                setSuccess("Avatar updated successfully!");
            } else {
                setError("Error: No avatar URL returned!");
            }
        } catch (error) {
            setError("Failed to upload avatar");
            console.error("Error uploading avatar:", error);
        }
    };
    
    

    return (
        <div className="settings-container">
            <h2>Settings</h2>

            <div className="settings-box">
                <label>Username:</label>
                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />

                <label>New Password:</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

                <label>Confirm Password:</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                <button onClick={handleUpdate}>Update Profile</button>

                <label>Avatar:</label>
                <div className="avatar-container">
                    <img src={preview} alt="Avatar Preview" className="avatar-preview" />
                    <label className="upload-btn">
                        Choose File
                        <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
                    </label>
                    <button className="upload-avatar-button" onClick={handleUpload}>Upload</button>
                </div>

                {success && <p className="success">{success}</p>}
                <button className="delete-button" onClick={handleDelete}>Delete Account</button>

                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
};

export default Settings;
