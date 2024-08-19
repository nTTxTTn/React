import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPlay, faEdit, faThLarge, faList, faSearch, faSortAlphaDown, faSortAlphaUp } from '@fortawesome/free-solid-svg-icons';
import './WordListPage.css';

function WordListPage({ user }) {
    const [wordLists, setWordLists] = useState([]);
    const [isGridView, setIsGridView] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const navigate = useNavigate();

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

    const editWordList = (id) => {
        navigate(`/edit-wordlist/${id}`);
    };

    const filteredLists = wordLists
        .filter(list => list.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });

    return (
        <div className="word-list-page">
            <div className="page-header">
                <h1 className="page-title">내 단어장 목록</h1>
                <div className="search-bar">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                        type="text"
                        placeholder="     단어장 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="page-actions">
                    <button onClick={() => setIsGridView(!isGridView)} className="view-toggle-btn" title={isGridView ? "리스트 뷰로 전환" : "그리드 뷰로 전환"}>
                        <FontAwesomeIcon icon={isGridView ? faList : faThLarge} />
                    </button>
                    <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="sort-btn" title="정렬 순서 변경">
                        <FontAwesomeIcon icon={sortOrder === 'asc' ? faSortAlphaDown : faSortAlphaUp} />
                    </button>
                    <Link to="/create-wordlist" className="create-list-btn">
                        <FontAwesomeIcon icon={faPlus} /> 새 단어장 만들기
                    </Link>
                </div>
            </div>
            <div className={`word-list-container ${isGridView ? 'grid-view' : 'list-view'}`}>
                {filteredLists.map((list) => (
                    <div key={list.id} className="word-list-item">
                        <div className="word-list-content">
                            <h3 className="word-list-title">{list.name}</h3>
                            <p className="word-list-count">{list.words.length} 단어</p>
                            {isGridView && (
                                <div className="word-list-preview">
                                    {list.words.slice(0, 3).map((word, index) => (
                                        <span key={index} className="preview-word">{word.word}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="word-list-actions">
                            <Link to={`/flashcard/${list.id}`} className="action-btn flashcard-link" title="학습하기">
                                <FontAwesomeIcon icon={faPlay} />
                                <span className="tooltip">학습하기</span>
                            </Link>
                            <button onClick={() => editWordList(list.id)} className="action-btn edit-btn" title="수정하기">
                                <FontAwesomeIcon icon={faEdit} />
                                <span className="tooltip">수정하기</span>
                            </button>
                            <button onClick={() => deleteWordList(list.id)} className="action-btn delete-btn" title="삭제하기">
                                <FontAwesomeIcon icon={faTrash} />
                                <span className="tooltip">삭제하기</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {filteredLists.length === 0 && (
                <p className="no-lists-message">
                    {searchTerm ? '검색 결과가 없습니다.' : (user ? '아직 생성된 단어장이 없습니다. 새 단어장을 만들어보세요!' : '로그인하여 단어장을 만들어보세요!')}
                </p>
            )}
        </div>
    );
}

export default WordListPage;