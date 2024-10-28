import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faPlay, faHistory, faTimes } from '@fortawesome/free-solid-svg-icons';
import './HomePage.css';

function HomePage({ user }) {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);

    const handleCreateWordList = () => {
        if (user) {
            navigate('/create-wordlist');
        } else {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000); // 3초 후 알림 자동 닫기
        }
    };

    const handleQuizHistory = () => {
        if (user) {
            navigate('/quiz-history');
        } else {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000); // 3초 후 알림 자동 닫기
        }
    };

    const handleStartQuiz = () => {
        if (user) {
            navigate('/quiz');
        } else {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        }
    };

    return (
        <div className="home-page">
            {showAlert && (
                <div className="alert-message">
                    <p>단어장을 보려면 로그인이 필요합니다.</p>
                    <button onClick={() => setShowAlert(false)} className="close-button">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            )}
            <h1 className="page-title">풀어보카에 오신 것을 환영합니다!</h1>
            <p className="page-description">나만의 단어장을 만들고 퀴즈를 풀어보세요.</p>
            <div className="home-buttons">
                <button onClick={handleCreateWordList} className="home-button">
                    <FontAwesomeIcon icon={faPlus} />
                    <span>새 단어장 만들기</span>
                </button>
                <Link to="/words" className="home-button">
                    <FontAwesomeIcon icon={faList} />
                    <span>단어장 목록 보기</span>
                </Link>
                <button onClick={handleStartQuiz} className="home-button">
                    <FontAwesomeIcon icon={faPlay}/>
                    <span>단어 퀴즈 시작</span>
                </button>
                <button onClick={handleQuizHistory} className="home-button">
                    <FontAwesomeIcon icon={faHistory}/>
                    <span>나의 히스토리</span>
                </button>
            </div>
        </div>
    );
}

export default HomePage;