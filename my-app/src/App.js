import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './ThemeContext';
import Sidebar from './Sidebar';
import LoginButton from './LoginButton';
import WordListPage from './WordListPage';
import HomePage from './HomePage';
import './App.css';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const response = await api.get('/api/users');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await api.get('/api/users/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <ThemeProvider>
                <Router>
                    <div className="app-container">
                        <header className="app-header">
                            <LoginButton user={user} onLogin={setUser} onLogout={handleLogout} api={api} />
                        </header>
                        <div className="app-body">
                            <Sidebar user={user} />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<HomePage user={user} />} />
                                    <Route path="/words" element={<WordListPage user={user} api={api} />} />
                                    {/* 다른 라우트들 추가 */}
                                </Routes>
                            </main>
                        </div>
                    </div>
                </Router>
            </ThemeProvider>
        </GoogleOAuthProvider>
    );
}

export default App;