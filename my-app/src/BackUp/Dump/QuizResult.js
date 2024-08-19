import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../TestFile/QuizResult.css';

function QuizResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { score, totalQuestions, selectedLists } = location.state || {};

    const handleRetakeQuiz = () => {
        navigate('/quiz');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    if (!score && score !== 0) {
        return <div className="quiz-result error">결과를 불러올 수 없습니다.</div>;
    }

    const percentage = ((score / totalQuestions) * 100).toFixed(2);

    return (
        <div className="quiz-result">
            <h2>퀴즈 결과</h2>
            <div className="result-summary">
                <div className="score-circle">
                    <div className="score-text">
                        <span className="score-number">{score}</span>
                        <span className="score-total">/ {totalQuestions}</span>
                    </div>
                    <div className="score-percentage">{percentage}%</div>
                </div>
                <p className="score-message">
                    {percentage >= 80 ? "훌륭합니다!" :
                        percentage >= 60 ? "좋은 성적이에요!" :
                            "다음에는 더 잘할 수 있을 거예요!"}
                </p>
            </div>
            <div className="selected-lists">
                <h3>선택한 단어장:</h3>
                <ul>
                    {selectedLists.map((list, index) => (
                        <li key={index}>{list}</li>
                    ))}
                </ul>
            </div>
            <div className="result-actions">
                <button onClick={handleRetakeQuiz} className="retake-quiz-btn">
                    <i className="fas fa-redo"></i> 다른 퀴즈 풀기
                </button>
                <button onClick={handleGoHome} className="go-home-btn">
                    <i className="fas fa-home"></i> 홈으로 가기
                </button>
            </div>
        </div>
    );
}

export default QuizResult;