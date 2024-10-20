import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './LoginButton.css';

function LoginButton({ user, onLogin, onLogout }) {
    const navigate = useNavigate();

    const handleLogin = () => {
        onLogin();
    };

    const handleLogout = async () => {
        try {
            await onLogout();
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('로그아웃에 실패했습니다. 다시 시도해 주세요.');
        }
    };

    const handleSendToken = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            try {
                const response = await axios.get('https://vocalist.kro.kr/swagger-ui/index.html#', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                console.log('API Response:', response.data);
                toast.success('토큰이 성공적으로 전송되었습니다.');
            } catch (error) {
                console.error('Token sending failed:', error);
                toast.error('토큰 전송에 실패했습니다.');
            }
        } else {
            toast.error('액세스 토큰이 없습니다. 다시 로그인해 주세요.');
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

    return (
        <div className="login-button">
            <div className="user-info">
                <img src={user.picture} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
                <button onClick={handleLogout} className="logout-btn">로그아웃</button>
                <button onClick={handleSendToken} className="send-token-btn">토큰 전송</button>
            </div>
        </div>
    );
}

export default LoginButton;