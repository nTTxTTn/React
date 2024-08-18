import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';  // axios import 추가

function WordListPage({ user }) {
    const [wordLists, setWordLists] = useState([]);
    const [isGridView, setIsGridView] = useState(true);
    const [showSecret, setShowSecret] = useState(0);  // 0: 비공개(secret=0), 1: 공개(secret=1)

    useEffect(() => {
        loadWordLists();
    }, [user, showSecret]);  // showSecret이 변경될 때마다 단어장 목록을 새로 불러옵니다.

    const loadWordLists = async () => {
        try {
            const response = await axios.get('/api/vocalist', {
                params: { secret: showSecret }
            });
            setWordLists(response.data);
        } catch (error) {
            console.error('단어장 목록을 불러오는 데 실패했습니다:', error);
        }
    };

    const deleteWordList = async (id) => {
        if (window.confirm('이 단어장을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/api/vocalist/${id}`);
                loadWordLists();  // 삭제 후 목록을 다시 불러옵니다.
            } catch (error) {
                console.error('단어장 삭제에 실패했습니다:', error);
            }
        }
    };

    const toggleView = () => {
        setIsGridView(!isGridView);
    };

    const toggleSecret = () => {
        setShowSecret(prevState => prevState === 0 ? 1 : 0);
    };

    return (
        <div className="word-list-page fade-in">
            <h2 className="page-title">단어장 목록</h2>
            <div className="view-toggles">
                <button onClick={toggleView} className={`toggle-button ${isGridView ? 'active' : ''}`}>
                    {isGridView ? '그리드 뷰' : '리스트 뷰'}
                </button>
                <button onClick={toggleSecret} className={`toggle-button ${showSecret === 1 ? 'active' : ''}`}>
                    {showSecret === 0 ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            비공개 단어장 보기
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            공개 단어장 보기
                        </>
                    )}
                </button>
            </div>
            {wordLists.length > 0 ? (
                <div className={`word-list-container ${isGridView ? 'word-list-grid' : 'word-list-list'}`}>
                    {wordLists.map((list) => (
                        <div key={list.id} className="word-list-item-container">
                            <Link to={`/wordlist/${list.id}`} className="word-list-item">
                                <h3 className="word-list-item-title">{list.title}</h3>
                                <p className="word-list-item-count">{list.words ? list.words.length : 0} 단어</p>
                                <div className="word-list-item-preview">
                                    {list.words && list.words.slice(0, 3).map((word, index) => (
                                        <span key={index} className="preview-word">{word.word}</span>
                                    ))}
                                </div>
                            </Link>
                            {user && user.email === list.author && (
                                <button
                                    onClick={() => deleteWordList(list.id)}
                                    className="delete-list-button"
                                    title="단어장 삭제"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-lists-message">
                    {showSecret === 0 ? '비공개 단어장이 없습니다.' : '공개된 단어장이 없습니다.'}
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