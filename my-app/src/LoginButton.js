import React, { useEffect } from 'react';
import './LoginButton.css';

function LoginButton({ user, onLogin, onLogout, api }) {
    const handleGoogleLogin = () => {
        window.location.href = "http://ec2-52-79-241-189.ap-northeast-2.compute.amazonaws.com:8080/oauth2/authorization/google";
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            fetchUserData(tokenFromUrl);
        }
    }, []);

    const fetchUserData = async (token) => {
        try {
            const response = await api.get('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            onLogin(response.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    return (
        <div className="login-button">
            {user ? (
                <div className="user-info">
                    <img src={user.picture} alt={user.name} className="user-avatar" />
                    <span className="user-name">{user.name}</span>
                    <button onClick={onLogout} className="logout-btn">로그아웃</button>
                </div>
            ) : (
                <button onClick={handleGoogleLogin} className="google-login-button">
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
                    <span>Google 계정으로 로그인</span>
                </button>
            )}
        </div>
    );
}

export default LoginButton;