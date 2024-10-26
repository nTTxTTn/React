import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './LoginButton.css';

// axios 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

const UserTitle = ({ totalScore }) => {
    const getTitleAndColor = (score) => {
        if (score >= 1000) {
            return { title: '단어왕', className: 'title-badge expert' };
        } else if (score >= 500) {
            return { title: '단어중수', className: 'title-badge advanced' };
        } else if (score >= 200) {
            return { title: '성실러', className: 'title-badge intermediate' };
        } else if (score >= 100) {
            return { title: '초보자', className: 'title-badge beginner' };
        } else {
            return { title: '퀴즈새내기', className: 'title-badge newcomer' };
        }
    };

    const { title, className } = getTitleAndColor(totalScore);

    return (
        <span className={className}>
            {title}
        </span>
    );
};

function LoginButton({ user, onLogin, onLogout }) {
    const navigate = useNavigate();
    const [userScore, setUserScore] = useState(0);

    useEffect(() => {
        if (user) {
            const fetchUserScore = async () => {
                try {
                    const response = await api.get('/api/users/myuserdata');
                    setUserScore(response.data.totalScore || 0);
                } catch (error) {
                    console.error('Failed to fetch user score:', error);
                    toast.error('사용자 정보를 불러오는데 실패했습니다.');
                }
            };
            fetchUserScore();
        }
    }, [user]);

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
                <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <UserTitle totalScore={userScore} />
                </div>
                <button onClick={handleLogout} className="logout-btn">로그아웃</button>
            </div>
        </div>
    );
}

export default LoginButton;