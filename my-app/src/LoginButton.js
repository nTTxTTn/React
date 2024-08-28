import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './LoginButton.css';

function LoginButton({ user, onLogout, api }) {
    const handleGoogleLogin = (credentialResponse) => {
        // 백엔드로 Google 인증 정보 전송
        api.post('/oauth2/authorization/google', { credential: credentialResponse.credential })
            .then(response => {
                // 백엔드에서 제공하는 리디렉션 URL로 이동
                window.location.href = response.data.redirectUrl;
            })
            .catch(error => {
                console.error('Login failed:', error);
            });
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
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
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