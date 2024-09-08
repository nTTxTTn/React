import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPlay, faEdit, faThLarge, faList, faSearch, faSortAlphaDown, faSortAlphaUp } from '@fortawesome/free-solid-svg-icons';
import './WordListPage.css';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

function WordListPage({ user }) {
    const [wordLists, setWordLists] = useState([]);
    const [isGridView, setIsGridView] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchWordLists();
        }
    }, [user]);

    const fetchWordLists = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.get('/api/vocalist');
            const lists = response.data;

            const processedLists = lists.map(list => ({
                id: list.id,
                title: list.title,
                wordCount: list.count,
                author: list.email,
                isSecret: list.secret === 1
            }));

            setWordLists(processedLists);
        } catch (error) {
            console.error('Failed to fetch word lists:', error);
            if (error.response) {
                if (error.response.status === 500) {
                    setError('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
                } else {
                    setError(`단어장을 불러오는데 실패했습니다. 오류 코드: ${error.response.status}`);
                }
            } else if (error.request) {
                setError('서버에서 응답이 없습니다. 인터넷 연결을 확인해 주세요.');
            } else {
                setError('요청 설정 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteWordList = async (id) => {
        if (window.confirm('이 단어장을 삭제하시겠습니까?')) {
            try {
                await api.delete(`/api/uservocalist/delete/${id}`);
                fetchWordLists(); // 삭제 후 목록 새로고침
            } catch (error) {
                console.error('Failed to delete word list:', error);
                alert('단어장 삭제에 실패했습니다.');
            }
        }
    };

    const editWordList = (id) => {
        navigate(`/edit-wordlist/${id}`);
    };

    const filteredLists = wordLists
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
                <h1 className="page-title">내 단어장 목록</h1>
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
                    <Link to="/create-wordlist" className="create-list-btn">
                        <FontAwesomeIcon icon={faPlus} /> 새 단어장 만들기
                    </Link>
                </div>
            </div>
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchWordLists}>다시 시도</button>
                </div>
            )}
            {loading ? (
                <div className="loading-spinner">로딩 중...</div>
            ) : (
                <div className={`word-list-container ${isGridView ? 'grid-view' : 'list-view'}`}>
                    {filteredLists.length === 0 ? (
                        <p className="no-lists-message">
                            {searchTerm ? '검색 결과가 없습니다.' : '아직 생성된 단어장이 없습니다. 새 단어장을 만들어보세요!'}
                        </p>
                    ) : (
                        filteredLists.map((list) => (
                            <div key={list.id} className="word-list-item">
                                <div className="word-list-content">
                                    <h3 className="word-list-title">{list.title}</h3>
                                    <p className="word-list-count">{list.wordCount} 단어</p>
                                    <p className="word-list-author">작성자: {list.author}</p>
                                    {list.isSecret && <p className="word-list-secret">비공개</p>}
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
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default WordListPage;