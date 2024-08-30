import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './LoginButton.css';

function LoginButton({ user, onLogin, onLogout }) {
    const navigate = useNavigate();

    const handleLogin = () => {
        try {
            onLogin();
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('로그인에 실패했습니다. 다시 시도해 주세요.');
        }
    };

    const handleLogout = async () => {
        try {
            await onLogout();
            toast.success('로그아웃되었습니다.');
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('로그아웃에 실패했습니다. 다시 시도해 주세요.');
        }
    };

    return (
        <div className="login-button">
            {user ? (
                <div className="user-info">
                    <img src={user.picture} alt={user.name} className="user-avatar" />
                    <span className="user-name">{user.name}</span>
                    <button onClick={handleLogout} className="logout-btn">로그아웃</button>
                </div>
            ) : (
                <button onClick={handleLogin} className="login-btn">Google 로그인</button>
            )}
        </div>
    );
}

export default LoginButton;