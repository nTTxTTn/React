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
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
    const navigate = useNavigate();

    const saveAccessToken = (token) => {
        console.log('saveAccessToken 함수 호출됨');
        console.log('저장할 액세스 토큰:', token);

        setAccessToken(token);
        console.log('액세스 토큰이 상태에 저장됨');

        console.log('액세스 토큰을 로컬 스토리지에 저장 시도...');
        try {
            localStorage.setItem('accessToken', token);
            console.log('액세스 토큰이 로컬 스토리지에 성공적으로 저장됨');
        } catch (error) {
            console.error('로컬 스토리지에 액세스 토큰 저장 중 오류 발생:', error);
        }
    };

    const clearAccessToken = () => {
        setAccessToken(null);
        localStorage.removeItem('accessToken');
    };

    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await api.post('/reissue');
            const newAccessToken = response.data.accessToken;
            saveAccessToken(newAccessToken);
            return newAccessToken;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            setUser(null);
            clearAccessToken();
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
                        originalRequest.headers['Access'] = `Bearer ${newAccessToken}`;
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


    const handleLogin = () => {
        console.log('Initiating login process...');
        const googleAuthUrl = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google`;
        console.log('Redirecting to:', googleAuthUrl);
        window.location.href = googleAuthUrl;
    };

    const checkLoginStatus = useCallback(async () => {
        console.log('로그인 상태 확인 시작');
        try {
            setLoading(true);
            console.log('현재 accessToken:', accessToken);
            if (!accessToken) {
                console.log('accessToken이 없음. 사용자를 null로 설정');
                setUser(null);
                setLoading(false);
                return;
            }
            console.log('사용자 데이터 요청 시작');
            const response = await api.get('/api/users/myuserdata');
            console.log('사용자 데이터 응답:', response.data);
            setUser(response.data);

            // 응답 헤더에서 새 액세스 토큰 확인 및 저장
            const newToken = response.headers['Access'] || response.headers['access'] || response.headers['authorization'];
            if (newToken) {
                const tokenParts = newToken.split(' ');
                const tokenValue = tokenParts.length > 1 ? tokenParts[1] : newToken;
                saveAccessToken(tokenValue);
            }

        } catch (error) {
            console.error('사용자 데이터 가져오기 실패:', error);
            if (error.response && error.response.status === 401) {
                console.log('401 오류 발생. 토큰 갱신 시도');
                try {
                    await refreshAccessToken();
                    console.log('토큰 갱신 성공. 사용자 데이터 재요청');
                    const retryResponse = await api.get('/api/users/myuserdata');
                    console.log('재요청 후 사용자 데이터:', retryResponse.data);
                    setUser(retryResponse.data);
                } catch (refreshError) {
                    console.error('토큰 갱신 실패:', refreshError);
                    console.log('사용자를 null로 설정하고 토큰 삭제');
                    setUser(null);
                    clearAccessToken();
                }
            } else {
                console.log('401 이외의 오류. 사용자를 null로 설정하고 토큰 삭제');
                setUser(null);
                clearAccessToken();
            }
        } finally {
            setLoading(false);
            console.log('로그인 상태 확인 완료');
        }
    }, [accessToken, saveAccessToken, refreshAccessToken]);



    const handleLogout = async () => {
        try {
            await api.get('/logout');
            setUser(null);
            clearAccessToken();
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
        <UserContext.Provider value={{ user, setUser, accessToken, setAccessToken: saveAccessToken, refreshAccessToken }}>
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