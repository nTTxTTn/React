import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function WordListPage({ user }) {
    const [wordLists, setWordLists] = useState([]);
    const [isGridView, setIsGridView] = useState(true);
    const [showFavorites, setShowFavorites] = useState(false);  // 새로운 상태

    useEffect(() => {
        loadWordLists();
    }, [user]);

    const loadWordLists = () => {
        const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
        const userLists = user ? loadedLists.filter(list => list.userId === user.sub) : loadedLists;
        setWordLists(userLists);
    };

    const deleteWordList = (id) => {
        if (window.confirm('이 단어장을 삭제하시겠습니까?')) {
            const updatedLists = wordLists.filter(list => list.id !== id);
            localStorage.setItem('wordLists', JSON.stringify(updatedLists));
            setWordLists(updatedLists);
        }
    };

    const toggleView = () => {
        setIsGridView(!isGridView);
    };

    const toggleFavorites = () => {
        setShowFavorites(!showFavorites);
    };

    return (
        <div className="word-list-page fade-in">
            <h2 className="page-title">내 단어장 목록</h2>
            <div className="view-toggles">
                <button onClick={toggleView} className={`toggle-button ${isGridView ? 'active' : ''}`}>
                    {isGridView ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            그리드 뷰
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                            리스트 뷰
                        </>
                    )}
                </button>
                <button onClick={toggleFavorites} className={`toggle-button ${showFavorites ? 'active' : ''}`}>
                    {showFavorites ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            기능없는 버튼 상태 = 0
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            기능없는 버튼 상태 = 1
                        </>
                    )}
                </button>
            </div>
            {wordLists.length > 0 ? (
                <div className={`word-list-container ${isGridView ? 'word-list-grid' : 'word-list-list'}`}>
                    {wordLists.map((list) => (
                        <div key={list.id} className="word-list-item-container">
                            <Link to={`/wordlist/${list.id}`} className="word-list-item">
                                <h3 className="word-list-item-title">{list.name}</h3>
                                <p className="word-list-item-count">{list.words.length} 단어</p>
                                <div className="word-list-item-preview">
                                    {list.words.slice(0, 3).map((word, index) => (
                                        <span key={index} className="preview-word">{word.word}</span>
                                    ))}
                                </div>
                            </Link>
                            <button
                                onClick={() => deleteWordList(list.id)}
                                className="delete-list-button"
                                title="단어장 삭제"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-lists-message">
                    {user
                        ? '아직 생성된 단어장이 없습니다. 새 단어장을 만들어보세요!'
                        : '로그인하여 단어장을 만들어보세요!'}
                </p>
            )}
            {user && (
                <div className="word-list-actions">
                    <Link to="/create-wordlist" className="button create-list-button">
                        새 단어장 만들기
                    </Link>
                </div>
            )}
        </div>
    );
}

export default WordListPage;