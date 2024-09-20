import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSync } from '@fortawesome/free-solid-svg-icons';
import './QuizingPage.css';

function QuizingPage({ quizType, quizLength, selectedWords, onQuizEnd }) {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [score, setScore] = useState(0);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [userInput, setUserInput] = useState('');

    useEffect(() => {
        generateQuestion(selectedWords);
    }, []);

    const generateQuestion = (words) => {
        if (currentQuestionNumber > quizLength) {
            onQuizEnd(score, quizLength);
            return;
        }

        const correctAnswer = words[Math.floor(Math.random() * words.length)];
        const otherWords = words.filter(word => word !== correctAnswer);

        if (quizType === 'multipleChoice') {
            const options = [correctAnswer];
            while (options.length < 5) {
                const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
                if (!options.includes(randomWord)) {
                    options.push(randomWord);
                }
            }
            setCurrentQuestion({
                text: correctAnswer.text,
                options: shuffleArray(options.map(option => option.transtext)),
                correctAnswer: correctAnswer.transtext
            });
        } else {
            setCurrentQuestion({
                text: correctAnswer.text,
                correctAnswer: correctAnswer.transtext
            });
        }

        setSelectedAnswer(null);
        setShowResult(false);
        setUserInput('');
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

    const handleInputAnswer = () => {
        setShowResult(true);
        if (userInput.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setCurrentQuestionNumber(prev => prev + 1);
        generateQuestion(selectedWords);
    };

    return (
        <div className="quizing-page">
            <div className="quiz-header">
                <div className="quiz-progress">
                    <div className="progress-bar">
                        <div
                            className="progress"
                            style={{width: `${(currentQuestionNumber / quizLength) * 100}%`}}
                        ></div>
                    </div>
                    <span className="question-number">문제 {currentQuestionNumber} / {quizLength}</span>
                </div>
                <div className="score-display">점수: {score}</div>
            </div>
            <div className="quiz-content">
                <h2 className="quiz-word">{currentQuestion?.text}</h2>
                {quizType === 'multipleChoice' ? (
                    <div className="quiz-options">
                        {currentQuestion?.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className={`quiz-option ${
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
                ) : (
                    <div className="write-answer">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="뜻을 입력하세요"
                            disabled={showResult}
                        />
                        <button onClick={handleInputAnswer} disabled={showResult}>
                            제출
                        </button>
                    </div>
                )}
                {showResult && (
                    <div className="result-feedback">
                        <FontAwesomeIcon
                            icon={quizType === 'multipleChoice'
                                ? (selectedAnswer === currentQuestion.correctAnswer ? faCheck : faTimes)
                                : (userInput.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() ? faCheck : faTimes)
                            }
                            className={quizType === 'multipleChoice'
                                ? (selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect')
                                : (userInput.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() ? 'correct' : 'incorrect')
                            }
                        />
                        <p className="correct-answer">정답: {currentQuestion.correctAnswer}</p>
                    </div>
                )}
            </div>
            <div className="quiz-actions">
                {showResult && currentQuestionNumber < quizLength && (
                    <button onClick={handleNextQuestion} className="next-question-btn">
                        <FontAwesomeIcon icon={faSync} /> 다음 문제
                    </button>
                )}
                {showResult && currentQuestionNumber >= quizLength && (
                    <button onClick={() => onQuizEnd(score, quizLength)} className="end-quiz-btn">퀴즈 종료</button>
                )}
                <button onClick={() => onQuizEnd(score, currentQuestionNumber - 1)} className="quit-quiz-btn">퀴즈 그만두기</button>
            </div>
        </div>
    );
}

export default QuizingPage;