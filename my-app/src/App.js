import React, { useState, useEffect, createContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './ThemeContext';
import LoginButton from './LoginButton';
import Sidebar from './Sidebar';
import LoadingSpinner from './LoadingSpinner';
import AuthCallback from './AuthCallback';
import HomePage from './HomePage';
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

function AppContent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(null);
    const navigate = useNavigate();

    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await api.post('/reissue');
            const newAccessToken = response.data.accessToken;
            setAccessToken(newAccessToken);
            return newAccessToken;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            setUser(null);
            setAccessToken(null);
            navigate('/login');
            throw error;
        }
    }, [navigate]);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                if (accessToken) {
                    config.headers['Authorization'] = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newAccessToken = await refreshAccessToken();
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    } catch (refreshError) {
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [accessToken, refreshAccessToken]);

    const checkLoginStatus = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users/myuserdata');
            setUser(response.data);
            const token = response.headers['authorization']?.split(' ')[1];
            if (token) {
                setAccessToken(token);
            }
            console.log('Current user:', response.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setUser(null);
            setAccessToken(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google?prompt=select_account`;
    };

    const handleLogout = async () => {
        try {
            await api.get('/logout');
            setUser(null);
            setAccessToken(null);
            localStorage.clear();
            sessionStorage.clear();

            const googleLogoutUrl = "https://accounts.google.com/Logout";
            const googleLogoutWindow = window.open(googleLogoutUrl, '_blank', 'width=1,height=1');

            setTimeout(() => {
                if (googleLogoutWindow) {
                    googleLogoutWindow.close();
                }
                navigate('/');
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
        console.log('ProtectedRoute rendered, user:', user);
        if (!user) {
            return <Navigate to="/login" />;
        }
        return children;
    };

    return (
        <UserContext.Provider value={{ user, setUser, accessToken, setAccessToken, refreshAccessToken }}>
            <div className="app-container">
                <header className="app-header">
                    <LoginButton user={user} onLogin={handleLogin} onLogout={handleLogout} />
                </header>
                <div className="app-body">
                    <Sidebar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginButton onLogin={handleLogin} />} />
                            <Route path="/" element={<HomePage user={user} />} />
                            <Route path="/auth-callback" element={<AuthCallback checkLoginStatus={checkLoginStatus} />} />
                            <Route path="/create-wordlist" element={<ProtectedRoute><CreateWordList user={user} /></ProtectedRoute>} />
                            <Route path="/flashcard/:id" element={<ProtectedRoute><FlashcardView /></ProtectedRoute>} />
                            <Route path="/wordlist/:id" element={<WordListDetail user={user} />} />
                            <Route path="/words" element={<WordListPage user={user} />} />
                            <Route path="/edit-wordlist/:id" element={<ProtectedRoute><EditWordList user={user} /></ProtectedRoute>} />
                            <Route path="/quiz" element={<ProtectedRoute><QuizPage user={user} /></ProtectedRoute>} />
                            <Route path="/quiz-result" element={<ProtectedRoute><QuizResult user={user} /></ProtectedRoute>} />
                        </Routes>
                    </main>
                </div>
            </div>
            <ToastContainer />
        </UserContext.Provider>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;