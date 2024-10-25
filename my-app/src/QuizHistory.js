import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './QuizHistory.css';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

function QuizHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizHistory = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    navigate('/');
                    return;
                }

                const response = await api.get('/api/quiz/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setHistory(response.data);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch quiz history:', error);
                if (error.response && error.response.status === 401) {
                    alert('로그인이 필요합니다.');
                    navigate('/');
                } else {
                    setError('퀴즈 기록을 불러오는데 실패했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchQuizHistory();
    }, [navigate]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="quiz-history-page">
            <div className="page-header">
                <button onClick={() => navigate('/')} className="back-button">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>돌아가기</span>
                </button>
                <h1>나의 퀴즈 기록</h1>
            </div>

            {loading ? (
                <div className="loading-spinner">로딩 중...</div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>다시 시도</button>
                </div>
            ) : (
                <div className="quiz-history-container">
                    {history.length === 0 ? (
                        <p className="no-history-message">아직 퀴즈 기록이 없습니다.</p>
                    ) : (
                        <table className="quiz-history-table">
                            <thead>
                            <tr>
                                <th>날짜</th>
                                <th>단어장</th>
                                <th>작성자</th>
                                <th>점수</th>
                            </tr>
                            </thead>
                            <tbody>
                            {history.map((record) => (
                                <tr key={record.id}>
                                    <td>{formatDate(record.date)}</td>
                                    <td>{record.vocaListEntity.title}</td>
                                    <td>{record.vocaListEntity.username}</td>
                                    <td>{record.score}점</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default QuizHistory;