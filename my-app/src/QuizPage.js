import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faPencilAlt, faUser, faGlobe } from '@fortawesome/free-solid-svg-icons';
import QuizingPage from './QuizingPage';
import './QuizPage.css';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

function QuizPage() {
    const [wordLists, setWordLists] = useState([]);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizType, setQuizType] = useState('multipleChoice');
    const [quizLength, setQuizLength] = useState(5);
    const [showPublicLists, setShowPublicLists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWordLists();
    }, [showPublicLists]);

    const fetchWordLists = async () => {
        try {
            setLoading(true);
            setError(null);
            const endpoint = showPublicLists ? '/api/vocalist/showall' : '/api/uservocalist';
            const response = await api.get(endpoint);
            const lists = response.data;

            const processedLists = await Promise.all(lists.map(async item => {
                const listData = endpoint === '/api/uservocalist' ? item.vocaListEntity : item;
                const wordsResponse = await api.get(`/api/vocacontent/showall/${listData.id}`);
                return {
                    id: listData.id,
                    title: listData.title || '제목 없음',
                    words: wordsResponse.data,
                    selected: false
                };
            }));

            setWordLists(processedLists);
        } catch (error) {
            console.error('Failed to fetch word lists:', error);
            setError('단어장을 불러오는데 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    const toggleListSelection = (id) => {
        setWordLists(prevLists =>
            prevLists.map(list =>
                list.id === id ? { ...list, selected: !list.selected } : list
            )
        );
    };

    const startQuiz = () => {
        const selectedWords = wordLists
            .filter(list => list.selected)
            .flatMap(list => list.words);

        if (selectedWords.length < 4) {
            alert('퀴즈를 시작하려면 최소 4개의 단어가 필요합니다.');
            return;
        }

        setQuizStarted(true);
    };

    const handleQuizEnd = (score, totalQuestions) => {
        setQuizStarted(false);
        navigate('/quiz-result', {
            state: {
                score: score,
                totalQuestions: totalQuestions,
                selectedLists: wordLists.filter(list => list.selected).map(list => list.title)
            }
        });
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="quiz-page">
            {!quizStarted ? (
                <div className="quiz-setup">
                    <h1 className="page-title">단어 퀴즈 설정</h1>
                    <div className="setup-container">
                        <div className="wordlist-selection">
                            <h2><FontAwesomeIcon icon={faList} /> 단어장 선택</h2>
                            <button
                                onClick={() => setShowPublicLists(!showPublicLists)}
                                className="toggle-public-btn"
                            >
                                <FontAwesomeIcon icon={showPublicLists ? faUser : faGlobe} />
                                {showPublicLists ? ' 내 단어장 보기' : ' 공개 단어장 보기'}
                            </button>
                            <div className="wordlist-grid">
                                {wordLists.map(list => (
                                    <div
                                        key={list.id}
                                        className={`wordlist-item ${list.selected ? 'selected' : ''}`}
                                        onClick={() => toggleListSelection(list.id)}
                                    >
                                        <span>{list.title}</span>
                                        <span className="word-count">{list.words.length} 단어</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="quiz-options">
                            <h2><FontAwesomeIcon icon={faPencilAlt} /> 퀴즈 옵션</h2>
                            <div className="quiz-type-selection">
                                <label>
                                    <input
                                        type="radio"
                                        value="multipleChoice"
                                        checked={quizType === 'multipleChoice'}
                                        onChange={() => setQuizType('multipleChoice')}
                                    />
                                    5지선다
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="writeAnswer"
                                        checked={quizType === 'writeAnswer'}
                                        onChange={() => setQuizType('writeAnswer')}
                                    />
                                    주관식
                                </label>
                            </div>
                            <div className="quiz-length-selection">
                                <label htmlFor="quiz-length">문제 수:</label>
                                <select
                                    id="quiz-length"
                                    value={quizLength}
                                    onChange={(e) => setQuizLength(Number(e.target.value))}
                                >
                                    <option value={5}>5개</option>
                                    <option value={10}>10개</option>
                                    <option value={15}>15개</option>
                                    <option value={20}>20개</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={startQuiz} className="start-quiz-btn">퀴즈 시작</button>
                    </div>
                </div>
            ) : (
                <QuizingPage
                    quizType={quizType}
                    quizLength={quizLength}
                    selectedWords={wordLists.filter(list => list.selected).flatMap(list => list.words)}
                    onQuizEnd={handleQuizEnd}
                />
            )}
        </div>
    );
}

export default QuizPage;