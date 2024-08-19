import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faPlay } from '@fortawesome/free-solid-svg-icons';
import './HomePage.css';

function HomePage({ user }) {
    const navigate = useNavigate();

    const handleCreateWordList = () => {
        if (user) {
            navigate('/create-wordlist');
        } else {
            alert('단어장을 만들려면 로그인이 필요합니다.');
        }
    };

    return (
        <div className="home-page">
            <h1 className="page-title">단어퀴즈에 오신 것을 환영합니다!</h1>
            <p className="page-description">단어를 학습하고 퀴즈를 풀어보세요.</p>
            <div className="home-buttons">
                <button onClick={handleCreateWordList} className="home-button">
                    <FontAwesomeIcon icon={faPlus} />
                    <span>새 단어장 만들기</span>
                </button>
                <Link to="/words" className="home-button">
                    <FontAwesomeIcon icon={faList} />
                    <span>단어장 목록 보기</span>
                </Link>
                <Link to="/quiz" className="home-button">
                    <FontAwesomeIcon icon={faPlay} />
                    <span>단어 퀴즈 시작</span>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;