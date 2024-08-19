import React from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './LoginButton.css';

function LoginButton({ user, onLogin, onLogout }) {
    const handleLoginSuccess = (credentialResponse) => {
        const decodedUser = jwtDecode(credentialResponse.credential);
        onLogin(decodedUser);
    };

    const handleLogout = () => {
        googleLogout();
        onLogout();
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
                <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => console.log('로그인 실패')}
                    useOneTap
                    theme="filled_blue"
                    shape="pill"
                    text="signin_with"
                />
            )}
        </div>
    );
}

export default LoginButton;