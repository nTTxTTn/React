import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadWordLists, shuffleArray } from '../utils/wordListUtils';
import '../ReactCSS/QuizPage.css';

function QuizPage() {
    const [selectedLists, setSelectedLists] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [quizLength, setQuizLength] = useState(5);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const wordLists = loadWordLists();
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

        setAvailableWords(selectedWords);
        setQuizStarted(true);
        setScore(0);
        setTotalQuestions(quizLength);
        setCurrentQuestionNumber(1);
        generateQuestion(selectedWords);
    };

    const generateQuestion = (words) => {
        if (currentQuestionNumber > quizLength) {
            endQuiz();
            return;
        }

        const correctAnswer = words[Math.floor(Math.random() * words.length)];
        const otherWords = words.filter(word => word !== correctAnswer);
        const options = [correctAnswer];

        while (options.length < 4) {
            const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
            if (!options.includes(randomWord)) {
                options.push(randomWord);
            }
        }

        setCurrentQuestion({
            word: correctAnswer.word,
            options: shuffleArray(options.map(option => option.definition)),
            correctAnswer: correctAnswer.definition
        });

        setSelectedAnswer(null);
        setShowResult(false);
    };

    const handleAnswer = (selectedAnswer) => {
        setSelectedAnswer(selectedAnswer);
        setShowResult(true);
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setCurrentQuestionNumber(prev => prev + 1);
        generateQuestion(availableWords);
    };

    const endQuiz = () => {
        setQuizStarted(false);
        navigate('/quiz-result', {
            state: {
                score: score,
                totalQuestions: totalQuestions,
                selectedLists: selectedLists.filter(list => list.selected).map(list => list.name)
            }
        });
    };

    if (!quizStarted) {
        return (
            <div className="quiz-setup">
                <h2>단어 퀴즈 설정</h2>
                <div className="setup-container">
                    <div className="wordlist-selection">
                        <h3>단어장 선택</h3>
                        <div className="wordlist-grid">
                            {selectedLists.map(list => (
                                <div key={list.id} className={`wordlist-item ${list.selected ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id={`list-${list.id}`}
                                        checked={list.selected}
                                        onChange={() => toggleListSelection(list.id)}
                                    />
                                    <label htmlFor={`list-${list.id}`}>{list.name}</label>
                                    <span className="word-count">{list.words.length} 단어</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="quiz-options">
                        <h3>퀴즈 옵션</h3>
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
                            </select>
                        </div>
                    </div>
                </div>
                <button onClick={startQuiz} className="start-quiz-btn">퀴즈 시작</button>
            </div>
        );
    }

    return (
        <div className="quiz-page">
            <h2>단어 퀴즈</h2>
            {currentQuestion && (
                <div className="quiz-section">
                    <div className="quiz-progress">
                        <p className="question-number">문제 {currentQuestionNumber} / {totalQuestions}</p>
                        <div className="progress-bar">
                            <div
                                className="progress"
                                style={{width: `${(currentQuestionNumber / totalQuestions) * 100}%`}}
                            ></div>
                        </div>
                    </div>
                    <p className="question-prompt">다음 단어의 뜻을 고르세요:</p>
                    <h3 className="quiz-word">{currentQuestion.word}</h3>
                    <div className="options">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className={`option-btn ${showResult ?
                                    (option === currentQuestion.correctAnswer ? 'correct' :
                                        option === selectedAnswer ? 'incorrect' : '') :
                                    (option === selectedAnswer ? 'selected' : '')}`}
                                disabled={showResult}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {showResult && (
                        <div className="result-section">
                            <p className={selectedAnswer === currentQuestion.correctAnswer ? 'correct-answer' : 'incorrect-answer'}>
                                {selectedAnswer === currentQuestion.correctAnswer ? '정답입니다!' : '틀렸습니다.'}
                            </p>
                            {currentQuestionNumber < totalQuestions ? (
                                <button onClick={handleNextQuestion} className="next-question-btn">다음 문제</button>
                            ) : (
                                <button onClick={endQuiz} className="end-quiz-btn">퀴즈 종료</button>
                            )}
                        </div>
                    )}
                    <p className="score">현재 점수: {score} / {currentQuestionNumber - 1}</p>
                    <button onClick={endQuiz} className="quit-quiz-btn">퀴즈 그만두기</button>
                </div>
            )}
        </div>
    );
}

export default QuizPage;