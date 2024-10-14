import React, { useState, useEffect, createContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
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
    const [initialCheckDone, setInitialCheckDone] = useState(false);
    const navigate = useNavigate();

    const refreshAccessToken = async () => {
        try {
            const refreshToken = Cookies.get('refresh');
            console.log('Attempting to refresh access token with refresh token:', refreshToken ? 'Found' : 'Not found');

            const response = await api.post('/reissue', { refreshToken });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

            console.log('New access token received:', newAccessToken ? 'Success' : 'Failed');
            console.log('New refresh token received:', newRefreshToken ? 'Success' : 'Failed');

            Cookies.set('Authorization', newAccessToken);
            if (newRefreshToken) {
                Cookies.set('refresh', newRefreshToken);
            }

            console.log('Access token refreshed and saved in cookies');
            return newAccessToken;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            console.log('Error details:', error.response ? error.response.data : 'No response data');
            throw error;
        }
    };

    const checkLoginStatus = useCallback(async () => {
        const accessToken = Cookies.get('Authorization');
        const refreshToken = Cookies.get('refresh');

        console.log('Access Token:', accessToken ? 'Found' : 'Not found');
        console.log('Refresh Token:', refreshToken ? 'Found' : 'Not found');

        if (!accessToken && !refreshToken) {
            console.log('No tokens found. User is not logged in.');
            setUser(null);
            setLoading(false);
            setInitialCheckDone(true);
            return;
        }

        try {
            setLoading(true);
            let token = accessToken;

            if (!accessToken && refreshToken) {
                console.log('No access token, but refresh token found. Attempting to refresh...');
                token = await refreshAccessToken();
                console.log('New access token obtained:', token ? 'Success' : 'Failed');
            }

            if (token) {
                console.log('Attempting to fetch user data with token');
                const response = await api.get('/api/users/myuserdata', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
                console.log('User data fetched successfully:', response.data);
            } else {
                console.log('No valid token available after refresh attempt');
                throw new Error('No valid token available');
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            console.log('Error details:', error.response ? error.response.data : 'No response data');
            setUser(null);
            Cookies.remove('Authorization');
            Cookies.remove('refresh');
            console.log('Tokens removed from cookies due to error');
            if (error.response && error.response.status === 403) {
                toast.error('접근 권한이 없습니다. 로그인이 필요합니다.');
            } else if (error.message === 'Network Error') {
                toast.error('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
            setInitialCheckDone(true);
            console.log('Login status check completed');
        }
    }, []);

    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);

    const handleLogin = () => {
        const googleAuthUrl = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google`;
        window.location.href = googleAuthUrl;
    };

    const handleLogout = async () => {
        try {
            await api.get('/logout');
            setUser(null);
            Cookies.remove('Authorization');
            Cookies.remove('refresh');
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
                        const newAccessToken = await refreshAccessToken();
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    } catch (refreshError) {
                        setUser(null);
                        Cookies.remove('Authorization');
                        Cookies.remove('refresh');
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, []);

    if (!initialCheckDone) {
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
                            <Route path="/login" element={<Navigate to="/" />} />
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