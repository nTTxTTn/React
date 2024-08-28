import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './ThemeContext';
import Sidebar from './Sidebar';
import LoginButton from './LoginButton';
import AppContent from './AppContent';
import './App.css';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

function App() {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <ThemeProvider>
                <Router>
                    <AppWithAuth />
                </Router>
            </ThemeProvider>
        </GoogleOAuthProvider>
    );
}

function AppWithAuth() {
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        checkLoginStatus();
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            fetchUserData(tokenFromUrl);
            // 토큰을 사용한 후 URL에서 제거
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const checkLoginStatus = async () => {
        try {
            const response = await api.get('/api/users');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchUserData = async (token) => {
        try {
            const response = await api.get('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
        <div className="app-container">
            <header className="app-header">
                <LoginButton user={user} onLogin={setUser} onLogout={handleLogout} api={api} />
            </header>
            <div className="app-body">
                <Sidebar user={user} />
                <main className="main-content">
                    <AppContent user={user} api={api} />
                </main>
            </div>
        </div>
    );
}

export default App;