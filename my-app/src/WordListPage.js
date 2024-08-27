import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPlay, faEdit, faThLarge, faList, faSearch, faSortAlphaDown, faSortAlphaUp, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './WordListPage.css';

function WordListPage({ user }) {
    const [wordLists, setWordLists] = useState([]);
    const [publicLists, setPublicLists] = useState([]);
    const [isGridView, setIsGridView] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showPrivate, setShowPrivate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            loadWordLists();
            loadPublicLists();
        }
    }, [user]);

    const loadWordLists = async () => {
        try {
            const response = await axios.get('/api/vocalist');
            setWordLists(response.data);
        } catch (error) {
            console.error('단어장 목록을 불러오는 중 오류가 발생했습니다:', error);
        }
    };

    const loadPublicLists = async () => {
        try {
            const response = await axios.get('/api/vocalist');
            setPublicLists(response.data.filter(list => list.secret === 1 && list.author !== user.email));
        } catch (error) {
            console.error('공개 단어장 목록을 불러오는 중 오류가 발생했습니다:', error);
        }
    };

    const deleteWordList = async (id) => {
        if (window.confirm('이 단어장을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/api/uservocalist/delete/${id}`);
                loadWordLists();
                loadPublicLists();
            } catch (error) {
                console.error('단어장 삭제 중 오류가 발생했습니다:', error);
            }
        }
    };

    const editWordList = (id) => {
        navigate(`/edit-wordlist/${id}`);
    };

    const togglePrivate = () => {
        setShowPrivate(!showPrivate);
    };

    const toggleWordListSecret = async (id, currentSecret) => {
        const newSecret = currentSecret === 1 ? 0 : 1;
        try {
            await axios.get(`/api/vocalist/${id}/editsecret/${newSecret === 1 ? 'open' : 'close'}`);
            loadWordLists();
            loadPublicLists();
        } catch (error) {
            console.error('단어장 공개/비공개 설정 변경 중 오류가 발생했습니다:', error);
        }
    };

    const filteredLists = showPrivate
        ? wordLists.filter(list => list.secret === 0 && list.author === user.email)
        : [...wordLists.filter(list => list.secret === 1 && list.author === user.email), ...publicLists];

    const sortedAndFilteredLists = filteredLists
        .filter(list => list.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });

    return (
        <div className="word-list-page">
            <div className="page-header">
                <h1 className="page-title">단어장 목록</h1>
                <div className="search-bar">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                        type="text"
                        placeholder="단어장 검색..."
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
                    <button onClick={togglePrivate} className={`toggle-button ${showPrivate ? 'active' : ''}`}>
                        {showPrivate ? '공개 단어장 보기' : '내 비공개 단어장 보기'}
                    </button>
                    <Link to="/create-wordlist" className="create-list-btn">
                        <FontAwesomeIcon icon={faPlus} /> 새 단어장 만들기
                    </Link>
                </div>
            </div>
            <div className={`word-list-container ${isGridView ? 'grid-view' : 'list-view'}`}>
                {sortedAndFilteredLists.map((list) => (
                    <div key={list.id} className="word-list-item">
                        <div className="word-list-content">
                            <h3 className="word-list-title">{list.title}</h3>
                            <p className="word-list-count">{list.words.length} 단어</p>
                            <p className="word-list-author">작성자: {list.author === user.email ? '나' : list.author}</p>
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
                            {list.author === user.email && (
                                <>
                                    <button onClick={() => editWordList(list.id)} className="action-btn edit-btn" title="수정하기">
                                        <FontAwesomeIcon icon={faEdit} />
                                        <span className="tooltip">수정하기</span>
                                    </button>
                                    <button onClick={() => deleteWordList(list.id)} className="action-btn delete-btn" title="삭제하기">
                                        <FontAwesomeIcon icon={faTrash} />
                                        <span className="tooltip">삭제하기</span>
                                    </button>
                                    <button onClick={() => toggleWordListSecret(list.id, list.secret)} className="action-btn secret-btn" title={list.secret === 1 ? "비공개로 전환" : "공개로 전환"}>
                                        <FontAwesomeIcon icon={list.secret === 1 ? faEye : faEyeSlash} />
                                        <span className="tooltip">{list.secret === 1 ? "비공개로 전환" : "공개로 전환"}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {sortedAndFilteredLists.length === 0 && (
                <p className="no-lists-message">
                    {searchTerm ? '검색 결과가 없습니다.' : (showPrivate ? '비공개 단어장이 없습니다.' : '공개된 단어장이 없습니다.')}
                </p>
            )}
        </div>
    );
}

export default WordListPage;