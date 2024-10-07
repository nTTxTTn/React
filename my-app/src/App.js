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
    const [access, setAccess] = useState(() => localStorage.getItem('access'));
    const navigate = useNavigate();

    const saveAccess = useCallback((token) => {
        setAccess(token);
        localStorage.setItem('access', token);
    }, []);

    const clearAccess = useCallback(() => {
        setAccess(null);
        localStorage.removeItem('access');
    }, []);

    const saveRefreshToken = useCallback((token) => {
        // Save refresh token in an HTTP-only cookie
        document.cookie = `refreshToken=${token}; path=/; HttpOnly; Secure; SameSite=Strict`;
    }, []);

    const refreshAccess = useCallback(async () => {
        try {
            // Get refresh token from cookie
            const refreshToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('refreshToken='))
                ?.split('=')[1];

            if (!refreshToken) {
                throw new Error('Refresh token not found');
            }

            const response = await api.post('/reissue', { refreshToken });
            const newAccess = response.data.accessToken;
            saveAccess(newAccess);
            return newAccess;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            setUser(null);
            clearAccess();
            // Clear refresh token cookie
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            navigate('/login');
            throw error;
        }
    }, [navigate, saveAccess, clearAccess]);

    const checkLoginStatus = useCallback(async () => {
        try {
            setLoading(true);
            const storedAccess = localStorage.getItem('access');
            if (!storedAccess) {
                setUser(null);
                setLoading(false);
                return;
            }
            setAccess(storedAccess);
            const response = await api.get('/api/users/myuserdata', {
                headers: { 'Authorization': `Bearer ${storedAccess}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            if (error.response && error.response.status === 401) {
                try {
                    await refreshAccess();
                    const retryResponse = await api.get('/api/users/myuserdata');
                    setUser(retryResponse.data);
                } catch (refreshError) {
                    setUser(null);
                    clearAccess();
                }
            } else {
                setUser(null);
                clearAccess();
            }
        } finally {
            setLoading(false);
        }
    }, [saveAccess, refreshAccess, clearAccess]);

    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                const storedAccess = localStorage.getItem('access');
                if (storedAccess) {
                    config.headers['Authorization'] = `Bearer ${storedAccess}`;
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
                        const newAccess = await refreshAccess();
                        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
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
    }, [refreshAccess]);

    const handleLogin = () => {
        // 백엔드의 OAuth 시작 엔드포인트로 리다이렉트
        window.location.href = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleLogout = async () => {
        try {
            await api.get('/logout');
            setUser(null);
            clearAccess();
            localStorage.clear();
            sessionStorage.clear();
            // Clear refresh token cookie
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

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
            console.error('로그아웃 실패:', error);
            toast.error(`로그아웃에 실패했습니다: ${error.message}`);
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
        <UserContext.Provider value={{ user, setUser, access, setAccess: saveAccess, refreshAccess }}>
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
                            <Route path="/create-wordlist" element={<ProtectedRoute><CreateWordList user={user} /></ProtectedRoute>} />
                            <Route path="/flashcard/:id" element={<ProtectedRoute><FlashcardView /></ProtectedRoute>} />
                            <Route path="/wordlist/:id" element={<WordListDetail user={user} />} />
                            <Route path="/words" element={<WordListPage user={user} />} />
                            <Route path="/edit-wordlist/:id" element={<ProtectedRoute><EditWordList user={user} /></ProtectedRoute>} />
                            <Route path="/quiz" element={<ProtectedRoute><QuizPage user={user} /></ProtectedRoute>} />
                            <Route path="/quiz-result" element={<ProtectedRoute><QuizResult user={user} /></ProtectedRoute>} />
                            <Route path="/auth-callback" element={
                                <AuthCallback
                                    checkLoginStatus={checkLoginStatus}
                                    saveAccessToken={saveAccess}
                                    saveRefreshToken={saveRefreshToken}
                                />
                            } />
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