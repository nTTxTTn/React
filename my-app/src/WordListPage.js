import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function WordListPage({ user }) {
    const [wordLists, setWordLists] = useState([]);

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

    return (
        <div className="word-list-page fade-in">
            <h2 className="page-title">내 단어장 목록</h2>
            {wordLists.length > 0 ? (
                <div className="word-list-grid">
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