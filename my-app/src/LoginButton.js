import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './LoginButton.css';

function LoginButton({ user, onLogin, onLogout }) {
    const navigate = useNavigate();

    const handleLogin = () => {
        onLogin(); // 직접 onLogin 함수 호출
    };

    const handleLogout = async () => {
        try {
            await onLogout();
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('로그아웃에 실패했습니다. 다시 시도해 주세요.');
        }
    };

    if (user === null) {
        return (
            <button className="google-btn" onClick={handleLogin}>
                <div className="google-icon-wrapper">
                    <img className="google-icon"
                         src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg"
                         alt="Google logo"/>
                </div>
                <p className="btn-text"><b>Sign in with Google</b></p>
            </button>
        );
    }

    // 로그인된 사용자 UI는 그대로 유지
    return (
        <div className="login-button">
            <div className="user-info">
                <img src={user.picture} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
                <button onClick={handleLogout} className="logout-btn">로그아웃</button>
            </div>
        </div>
    );
}

export default LoginButton;