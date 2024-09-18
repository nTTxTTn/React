import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './ThemeContext';
import LoginButton from './LoginButton';
import Sidebar from './Sidebar';
import AppContent from './AppContent';
import LoadingSpinner from './LoadingSpinner';
import AuthCallback from './AuthCallback';
import CreateWordList from './CreateWordList';
import FlashcardView from "./FlashcardView";
import WordListDetail from "./WordListDetail";
import WordListPage from "./WordListPage";
import EditWordList from "./EditWordList";
import QuizPage from "./QuizPage";
import QuizResult from "./QuizResult";
import './App.css';

export const UserContext = createContext(null);

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users/myuserdata');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google?prompt=select_account`;
    };

    const handleLogout = async () => {
        try {
            await api.get(`/api/users/logout?_=${new Date().getTime()}`);
            setUser(null);
            localStorage.clear();
            sessionStorage.clear();

            const googleLogoutUrl = "https://accounts.google.com/Logout";
            const googleLogoutWindow = window.open(googleLogoutUrl, '_blank', 'width=1,height=1');

            setTimeout(() => {
                if (googleLogoutWindow) {
                    googleLogoutWindow.close();
                }
                window.location.href = window.location.origin;
            }, 2000);

            toast.success('로그아웃되었습니다.');
        } catch (error) {
            console.error('로그아웃 실패:', error.response ? error.response.data : error.message);
            toast.error(`로그아웃에 실패했습니다: ${error.response ? error.response.data : error.message}`);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const ProtectedRoute = ({ children }) => {
        if (!user) {
            return <Navigate to="/login" />;
        }
        return children;
    };

    return (
        <ThemeProvider>
            <UserContext.Provider value={{ user, setUser }}>
                <Router>
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
                                    <Route path="/create-wordlist" element={<ProtectedRoute><CreateWordList /></ProtectedRoute>} />
                                    <Route path="/flashcard/:id" element={<ProtectedRoute><FlashcardView /></ProtectedRoute>} />
                                    <Route path="/wordlist/:id" element={<WordListDetail user={user} />} />
                                    <Route path="/words" element={<WordListPage user={user} />} />
                                    <Route path="/edit-wordlist/:id" element={<ProtectedRoute><EditWordList /></ProtectedRoute>} />
                                    <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                                    <Route path="/quiz-result" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
                                </Routes>
                            </main>
                        </div>
                    </div>
                    <ToastContainer />
                </Router>
            </UserContext.Provider>
        </ThemeProvider>
    );
}

export default App;