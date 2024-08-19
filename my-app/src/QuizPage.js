import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import QuizingPage from './QuizingPage';
import './QuizPage.css';

function QuizPage() {
    const [selectedLists, setSelectedLists] = useState([]);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizType, setQuizType] = useState('multipleChoice');
    const [quizLength, setQuizLength] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        const wordLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
        setSelectedLists(wordLists.map(list => ({ ...list, selected: false })));
    }, []);

    const toggleListSelection = (id) => {
        setSelectedLists(prevLists =>
            prevLists.map(list =>
                list.id === id ? { ...list, selected: !list.selected } : list
            )
        );
    };

    const startQuiz = () => {
        const selectedWords = selectedLists
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
                selectedLists: selectedLists.filter(list => list.selected).map(list => list.name)
            }
        });
    };

    return (
        <div className="quiz-page">
            {!quizStarted ? (
                <div className="quiz-setup">
                    <h1 className="page-title">단어 퀴즈 설정</h1>
                    <div className="setup-container">
                        <div className="wordlist-selection">
                            <h2><FontAwesomeIcon icon={faList} /> 단어장 선택</h2>
                            <div className="wordlist-grid">
                                {selectedLists.map(list => (
                                    <div
                                        key={list.id}
                                        className={`wordlist-item ${list.selected ? 'selected' : ''}`}
                                        onClick={() => toggleListSelection(list.id)}
                                    >
                                        <span>{list.name}</span>
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
                    selectedWords={selectedLists.filter(list => list.selected).flatMap(list => list.words)}
                    onQuizEnd={handleQuizEnd}
                />
            )}
        </div>
    );
}

export default QuizPage;