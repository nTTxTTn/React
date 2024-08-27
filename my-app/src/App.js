import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from './ThemeContext';
import Sidebar from './Sidebar';
import AppContent from './AppContent';
import LoginButton from './LoginButton';
import './App.css';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://ec2-52-79-241-189.ap-northeast-2.compute.amazonaws.com:8080',
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
        <ThemeProvider>
            <Router>
                <div className="app-container">
                    <header className="app-header">
                        <LoginButton user={user} onLogin={setUser} onLogout={handleLogout} api={api} />
                    </header>
                    <div className="app-body">
                        <Sidebar user={user} />
                        <main className="main-content">
                            <AppContent user={user} />
                        </main>
                    </div>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;