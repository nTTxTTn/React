import React, { useState, useEffect, createContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong. Please try refreshing the page.</h1>;
        }

        return this.props.children;
    }
}

function AppContent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const refreshAccessToken = async () => {
        try {
            const response = await api.post('/reissue');
            console.log('Access token refreshed');
            return response.data;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            throw error;
        }
    };

    const checkLoginStatus = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users/myuserdata');
            setUser(response.data);
            console.log('Current user:', response.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            if (error.response && error.response.status === 401) {
                try {
                    await refreshAccessToken();
                    const retryResponse = await api.get('/api/users/myuserdata');
                    setUser(retryResponse.data);
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError);
                    setUser(null);
                    navigate('/login');
                }
            } else {
                setUser(null);
                if (error.response && error.response.status === 403) {
                    toast.error('접근 권한이 없습니다. 로그인이 필요합니다.');
                    navigate('/login');
                } else if (error.message === 'Network Error') {
                    toast.error('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
                }
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);

    const handleLogin = () => {
        const googleAuthUrl = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google`;
        window.location.href = googleAuthUrl;
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            setUser(null);
            navigate('/');
            toast.success('로그아웃되었습니다.');
        } catch (error) {
            console.error('로그아웃 실패:', error);
            toast.error(`로그아웃에 실패했습니다: ${error.message}`);
        }
    };

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response && error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        await refreshAccessToken();
                        return api(originalRequest);
                    } catch (refreshError) {
                        setUser(null);
                        navigate('/login');
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

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
        <UserContext.Provider value={{ user, setUser }}>
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
        <ErrorBoundary>
            <ThemeProvider>
                <Router>
                    <AppContent />
                </Router>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;