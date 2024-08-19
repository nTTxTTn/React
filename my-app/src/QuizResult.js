import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faRedo, faHome } from '@fortawesome/free-solid-svg-icons';
import './QuizResult.css';

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

    const percentage = ((score / totalQuestions) * 100).toFixed(0);

    return (
        <div className="quiz-result">
            <h2>퀴즈 결과</h2>
            <div className="result-summary">
                <div className="score-circle">
                    <div className="score-text">{score}</div>
                    <div className="score-total">/ {totalQuestions}</div>
                </div>
                <div className="score-percentage">{percentage}%</div>
            </div>
            <div className="score-message">
                <FontAwesomeIcon icon={faTrophy} className="trophy-icon" />
                <p>
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
                    <FontAwesomeIcon icon={faRedo} /> 다른 퀴즈 풀기
                </button>
                <button onClick={handleGoHome} className="go-home-btn">
                    <FontAwesomeIcon icon={faHome} /> 홈으로 가기
                </button>
            </div>
        </div>
    );
}

export default QuizResult;