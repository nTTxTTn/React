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
import AuthCallback from './AuthCallback';
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

    const saveAccessToken = (token) => {
        localStorage.setItem('accessToken', token);
    };

    const checkLoginStatus = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');

        console.log('Access Token:', accessToken ? 'Found' : 'Not found');

        if (!accessToken) {
            console.log('No token found. User is not logged in.');
            setUser(null);
            setLoading(false);
            setInitialCheckDone(true);
            return;
        }

        try {
            setLoading(true);
            console.log('Attempting to fetch user data with token');
            const response = await api.get('/api/users/myuserdata', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setUser(response.data);
            console.log('User data fetched successfully:', response.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            console.log('Error details:', error.response ? error.response.data : 'No response data');
            setUser(null);
            localStorage.removeItem('accessToken');
            console.log('Token removed from localStorage due to error');
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
            await api.get('/logout');  // Call the backend logout API
            setUser(null);
            localStorage.removeItem('accessToken');
            navigate('/');
            toast.success('로그아웃되었습니다.');
        } catch (error) {
            console.error('로그아웃 실패:', error);
            toast.error('로그아웃 처리 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    setUser(null);
                    localStorage.removeItem('accessToken');
                    toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

    if (!initialCheckDone) {
        return <LoadingSpinner />;
    }

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
                            <Route path="/create-wordlist" element={<CreateWordList user={user} />} />
                            <Route path="/flashcard/:id" element={<FlashcardView />} />
                            <Route path="/wordlist/:id" element={<WordListDetail user={user} />} />
                            <Route path="/words" element={<WordListPage user={user} />} />
                            <Route path="/edit-wordlist/:id" element={<EditWordList user={user} />} />
                            <Route path="/quiz" element={<QuizPage user={user} />} />
                            <Route path="/quiz-result" element={<QuizResult user={user} />} />
                            <Route path="/auth-callback" element={<AuthCallback checkLoginStatus={checkLoginStatus} saveAccessToken={saveAccessToken} />} />
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