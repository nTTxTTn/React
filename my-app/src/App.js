import React, { useState, useEffect, createContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './ThemeContext';
import LoginButton from './LoginButton';
import Sidebar from './Sidebar';
import LoadingSpinner from './LoadingSpinner';
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
    const location = useLocation();

    const saveAccess = useCallback((token) => {
        setAccess(token);
        localStorage.setItem('access', token);
    }, []);

    const clearAccess = useCallback(() => {
        setAccess(null);
        localStorage.removeItem('access');
    }, []);

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
            setUser(null);
            clearAccess();
        } finally {
            setLoading(false);
        }
    }, [clearAccess]);

    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);

    useEffect(() => {
        const handleLoginSuccess = async () => {
            const params = new URLSearchParams(location.search);
            const loginSuccess = params.get('login_success');

            if (loginSuccess === 'true') {
                try {
                    // 액세스 토큰을 받아오기 위한 요청
                    const tokenResponse = await api.get('/oauth2/authorization/google');
                    const { accessToken } = tokenResponse.data;

                    saveAccess(accessToken);

                    // 사용자 정보 가져오기
                    const userResponse = await api.get('/api/users/myuserdata', {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    setUser(userResponse.data);
                    toast.success('로그인되었습니다.');
                    navigate('/', { replace: true });
                } catch (error) {
                    console.error('Failed to fetch token or user data:', error);
                    toast.error('로그인 처리 중 오류가 발생했습니다.');
                    clearAccess();
                }
            }
        };

        handleLoginSuccess();
    }, [location, saveAccess, clearAccess, navigate]);

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
                if (error.response && error.response.status === 401) {
                    clearAccess();
                    setUser(null);
                    navigate('/login');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [clearAccess, navigate]);

    const handleLogin = () => {
        // 백엔드의 OAuth 시작 엔드포인트로 리다이렉트
        window.location.href = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            setUser(null);
            clearAccess();
            localStorage.clear();
            sessionStorage.clear();
            navigate('/');
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
        <UserContext.Provider value={{ user, setUser, access, setAccess: saveAccess }}>
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