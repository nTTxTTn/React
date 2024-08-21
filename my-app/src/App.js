import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './ThemeContext';
import Sidebar from './Sidebar';
import AppContent from './AppContent';
import LoginButton from './LoginButton';
import './App.css';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <ThemeProvider>
            <Router>
                <GoogleOAuthProvider clientId="3876558866-ovsd73gbk2fua6ui6jcf0orfaps6hb96.apps.googleusercontent.com">
                    <div className="app-container">
                        <header className="app-header">
                            <div className="login-container">
                                <LoginButton user={user} onLogin={handleLogin} onLogout={handleLogout} />
                            </div>
                        </header>
                        <div className="app-body">
                            <Sidebar user={user} />
                            <main className="main-content">
                                <AppContent user={user} />
                            </main>
                        </div>
                    </div>
                </GoogleOAuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;