import React from 'react';
import { Link } from 'react-router-dom';
import '../ReactCSS/App.css';

function HomePage({ user }) {
    return (
        <div className="home-page">
            <h1>단어퀴즈에 오신 것을 환영합니다!</h1>
            <p>단어를 학습하고 퀴즈를 풀어보세요.</p>
            <div className="home-buttons">
                {user && (
                    <Link to="/create-wordlist" className="button-box">
                        <div className="button-content">
                            <h2>새 단어장 만들기</h2>
                            <p>나만의 단어장을 만들어보세요!</p>
                        </div>
                    </Link>
                )}
                <Link to="/words" className="button-box">
                    <div className="button-content">
                        <h2>단어장 목록 보기</h2>
                        <p>기존 단어장을 확인하세요!</p>
                    </div>
                </Link>
                <Link to="/quiz" className="button-box">
                    <div className="button-content">
                        <h2>단어 퀴즈</h2>
                        <p>단어 퀴즈를 풀어보세요!</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;