import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
            <div className="quiz-setup fade-in">
                <h2>단어 퀴즈 설정</h2>
                <div className="setup-container">
                    <div className="wordlist-selection">
                        <h3>단어장 선택</h3>
                        <div className="wordlist-grid">
                            {selectedLists.map(list => (
                                <div
                                    key={list.id}
                                    className={`wordlist-item ${list.selected ? 'selected' : ''}`}
                                    onClick={() => toggleListSelection(list.id)}
                                >
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={list.selected}
                                            onChange={() => toggleListSelection(list.id)}
                                        />
                                        {list.name}
                                    </label>
                                    <div className="word-count">{list.words.length} 단어</div>
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
                                <option value={20}>20개</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={startQuiz} className="button start-quiz-btn">퀴즈 시작</button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-page fade-in">
            <h2>단어 퀴즈</h2>
            {currentQuestion && (
                <div className="quiz-section">
                    <div className="quiz-progress-container">
                        <div className="quiz-progress">
                            <p className="question-number">문제 {currentQuestionNumber} / {totalQuestions}</p>
                            <p className="score-display">점수: {score} / {currentQuestionNumber - 1}</p>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress"
                                style={{width: `${(currentQuestionNumber / totalQuestions) * 100}%`}}
                            ></div>
                        </div>
                    </div>
                    <h3 className="quiz-word">{currentQuestion.word}</h3>
                    <div className="options">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className={`option-btn ${
                                    showResult
                                        ? option === currentQuestion.correctAnswer
                                            ? 'correct'
                                            : option === selectedAnswer
                                                ? 'incorrect'
                                                : ''
                                        : option === selectedAnswer
                                            ? 'selected'
                                            : ''
                                }`}
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
                                <button onClick={handleNextQuestion} className="button next-question-btn">다음 문제</button>
                            ) : (
                                <button onClick={endQuiz} className="button end-quiz-btn">퀴즈 종료</button>
                            )}
                        </div>
                    )}
                    <button onClick={endQuiz} className="button quit-quiz-btn">퀴즈 그만두기</button>
                </div>
            )}
        </div>
    );
}

export default QuizPage;