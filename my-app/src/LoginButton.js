import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginButton.css';

const UserTitle = ({ totalScore = 0 }) => {
    const getTitleAndColor = (score) => {
        if (score >= 1000) {
            return { title: '풀어보카의퀴즈왕', className: 'title-badge expert' };
        } else if (score >= 500) {
            return { title: '퀴즈중급자', className: 'title-badge advanced' };
        } else if (score >= 200) {
            return { title: '퀴즈좀풀어본사람', className: 'title-badge intermediate' };
        } else if (score >= 100) {
            return { title: '퀴즈초보자', className: 'title-badge beginner' };
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

    const handleLogin = () => {
        onLogin();
    };

    const handleLogout = async () => {
        try {
            await onLogout();
        } catch (error) {
            console.error('Logout failed:', error);
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
                    <UserTitle totalScore={user.totalScore} />
                </div>
                <button onClick={handleLogout} className="logout-btn">로그아웃</button>
            </div>
        </div>
    );
}

export default LoginButton;