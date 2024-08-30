import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './ThemeContext';
import LoginButton from './LoginButton';
import Sidebar from './Sidebar';
import AppContent from './AppContent';
import LoadingSpinner from './LoadingSpinner';
import AuthCallback from './AuthCallback';
import './App.css';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppWithAuth />
                <ToastContainer />
            </Router>
        </ThemeProvider>
    );
}

function AppWithAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            if (error.response && error.response.status === 401) {
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleLogout = async () => {
        try {
            await api.post('/api/users/logout');
            setUser(null);
            navigate('/');
            toast.success('로그아웃되었습니다.');
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('로그아웃에 실패했습니다. 다시 시도해 주세요.');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <LoginButton user={user} onLogin={handleLogin} onLogout={handleLogout} />
            </header>
            <div className="app-body">
                <Sidebar user={user} />
                <main className="main-content">
                    <Routes>
                        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginButton onLogin={handleLogin} />} />
                        <Route path="/" element={<AppContent user={user} api={api} />} />
                        <Route path="/auth-callback" element={<AuthCallback checkLoginStatus={checkLoginStatus} />} />
                        <Route path="/create-wordlist" element={<CreateWordList user={user} />} />
                        {/* Add more routes as needed */}
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default App;