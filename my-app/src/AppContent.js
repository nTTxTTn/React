import React, { useState, useEffect } from 'react';
import { Route, Link, Routes, useParams, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from './ThemeContext';
import logo from './logo.svg';

// 다른 컴포넌트들을 import합니다.
import HomePage from './HomePage';
import QuizPage from './QuizPage';
import QuizResult from './QuizResult';
import CreateWordList from './CreateWordList';
import WordListPage from './WordListPage';
import WordListDetail from './WordListDetail';

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('');
    const { isDarkMode, toggleDarkMode } = useTheme();

    const handleLogoClick = () => {
        navigate('/');
        setCurrentPage('');
    };

    const onLoginSuccess = (credentialResponse) => {
        const userObject = jwtDecode(credentialResponse.credential);
        console.log('로그인 성공:', userObject);
        setUser(userObject);
    };

    const onLoginFailure = () => {
        console.log('로그인 실패');
    };

    useEffect(() => {
        const path = location.pathname;
        if (path === '/words') {
            setCurrentPage('단어장 목록');
        } else if (path === '/quiz') {
            setCurrentPage('단어 퀴즈');
        } else {
            setCurrentPage('');
        }
    }, [location]);

    return (
        <div className="App">
            <div className="nav-bar">
                <div className="nav-left">
                    <img
                        src={logo}
                        alt="Logo"
                        className="logo"
                        onClick={handleLogoClick}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
                <div className="nav-center">
                    <h1 className="app-title">{currentPage || '단어퀴즈'}</h1>
                </div>
                <div className="nav-right">
                    <button onClick={toggleDarkMode} className="theme-toggle">
                        {isDarkMode ? '🌞' : '🌙'}
                    </button>
                    {user ? (
                        <div className="user-info">
                            <img src={user.picture} alt={user.name} className="user-avatar" />
                            <span className="user-name">{user.name}</span>
                            <button onClick={() => setUser(null)} className="button">로그아웃</button>
                        </div>
                    ) : (
                        <GoogleLogin
                            onSuccess={onLoginSuccess}
                            onError={onLoginFailure}
                        />
                    )}
                </div>
            </div>
            <div className="content-wrapper">
                <main className="fade-in">
                    <Routes>
                        <Route path="/" element={<HomePage user={user} />} />
                        <Route path="/words" element={<WordListPage user={user} />} />
                        <Route path="/wordlist/:id" element={<WordListDetail />} />
                        <Route path="/create-wordlist" element={<CreateWordList user={user} />} />
                        <Route path="/quiz" element={<QuizPage />} />
                        <Route path="/quiz-result" element={<QuizResult />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default AppContent;