import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPlay, faEdit, faThLarge, faList, faSearch, faSortAlphaDown, faSortAlphaUp, faGlobe, faUser } from '@fortawesome/free-solid-svg-icons';
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
    const [showPublicLists, setShowPublicLists] = useState(!user);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchWordLists = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const endpoint = user && !showPublicLists ? '/api/uservocalist' : '/api/vocalist/showall';
            console.log(`Fetching word lists from: ${endpoint}`);

            let config = {};
            if (user && !showPublicLists) {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers = { 'Authorization': `Bearer ${token}` };
                    console.log('Access Token:', token);  // 콘솔에 액세스 토큰 출력
                }
            }

            const response = await api.get(endpoint, config);
            const lists = response.data;

            if (!Array.isArray(lists)) {
                throw new Error('Received data is not an array');
            }

            const processedLists = await Promise.all(lists.map(async item => {
                const listData = endpoint === '/api/uservocalist' ? item.vocaListEntity : item;
                const wordCountResponse = await api.get(`/api/vocacontent/showall/${listData.id}`, config);
                const wordCount = wordCountResponse.data.length;

                return {
                    id: listData.id,
                    title: listData.title || '제목 없음',
                    wordCount: wordCount,
                    author: listData.email,
                    isPublic: listData.secret === 1,
                    userName: (endpoint === '/api/uservocalist' ? item.userEntity.name : null) || listData.email.split('@')[0]
                };
            }));

            console.log(`Fetched ${processedLists.length} word lists`);
            setWordLists(processedLists);
        } catch (error) {
            console.error('Failed to fetch word lists:', error);
            if (error.response && error.response.status === 401) {
                alert('로그인이 필요합니다.');
                navigate('/');  // 메인 페이지로 이동
            } else {
                setError('단어장을 불러오는데 실패했습니다. 다시 시도해 주세요.');
            }
        } finally {
            setLoading(false);
        }
    }, [user, showPublicLists, navigate]);

    useEffect(() => {
        fetchWordLists();
    }, [fetchWordLists]);

    const deleteWordList = async (id) => {
        if (window.confirm('이 단어장을 삭제하시겠습니까?')) {
            try {
                const token = localStorage.getItem('accessToken');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                await api.delete(`/api/vocalist/delete/${id}`, config);
                fetchWordLists();
            } catch (error) {
                console.error('Failed to delete word list:', error);
                if (error.response && error.response.status === 401) {
                    alert('로그인이 필요합니다.');
                    navigate('/');
                } else {
                    alert('단어장 삭제에 실패했습니다.');
                }
            }
        }
    };

    const editWordList = (id) => {
        console.log('Edit button clicked for list ID:', id);
        navigate(`/edit-wordlist/${id}`);
    };

    const togglePublic = async (id, isPublic) => {
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const endpoint = isPublic ? `/api/vocalist/${id}/editsecret/close` : `/api/vocalist/${id}/editsecret/open`;
            await api.get(endpoint, config);
            fetchWordLists();
        } catch (error) {
            console.error('Failed to toggle public status:', error);
            if (error.response && error.response.status === 401) {
                alert('로그인이 필요합니다.');
                navigate('/');
            } else {
                alert('단어장 공개 상태 변경에 실패했습니다.');
            }
        }
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
                <h1 className="page-title">{showPublicLists ? '공개 단어장 목록' : '내 단어장 목록'}</h1>
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
                    {user && (
                        <button onClick={() => setShowPublicLists(!showPublicLists)} className="toggle-public-btn" title={showPublicLists ? "내 단어장 보기" : "공개 단어장 보기"}>
                            <FontAwesomeIcon icon={showPublicLists ? faUser : faGlobe} />
                            {showPublicLists ? ' 내 단어장' : ' 공개 단어장'}
                        </button>
                    )}
                    {user && !showPublicLists && (
                        <Link to="/create-wordlist" className="create-list-btn">
                            <FontAwesomeIcon icon={faPlus} /> 새 단어장 만들기
                        </Link>
                    )}
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
                            {searchTerm ? '검색 결과가 없습니다.' : (showPublicLists ? '공개된 단어장이 없습니다.' : '아직 생성된 단어장이 없습니다. 새 단어장을 만들어보세요!')}
                        </p>
                    ) : (
                        filteredLists.map((list) => (
                            <div key={list.id} className="word-list-item">
                                <div className="word-list-content">
                                    <h3 className="word-list-title">{list.title}</h3>
                                    <p className="word-list-count">{list.wordCount} 단어</p>
                                    <p className="word-list-author">작성자: {list.userName}</p>
                                    {!list.isPublic && <p className="word-list-private">비공개</p>}
                                </div>
                                <div className="word-list-actions">
                                    <Link to={`/flashcard/${list.id}`} className="action-btn flashcard-link" title="학습하기">
                                        <FontAwesomeIcon icon={faPlay} />
                                        <span className="tooltip">학습하기</span>
                                    </Link>
                                    {user && user.email === list.author && !showPublicLists && (
                                        <>
                                            <button
                                                onClick={() => editWordList(list.id)}
                                                className="action-btn edit-btn"
                                                title="수정하기"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                                <span className="tooltip">수정하기</span>
                                            </button>
                                            <button onClick={() => deleteWordList(list.id)} className="action-btn delete-btn" title="삭제하기">
                                                <FontAwesomeIcon icon={faTrash} />
                                                <span className="tooltip">삭제하기</span>
                                            </button>
                                            <button onClick={() => togglePublic(list.id, list.isPublic)} className="action-btn toggle-public-btn" title={list.isPublic ? "비공개로 전환" : "공개로 전환"}>
                                                <FontAwesomeIcon icon={list.isPublic ? faUser : faGlobe} />
                                                <span className="tooltip">{list.isPublic ? "비공개로 전환" : "공개로 전환"}</span>
                                            </button>
                                        </>
                                    )}
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