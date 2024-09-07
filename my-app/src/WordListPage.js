import React, { useState, useEffect } from 'react';
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
    const [showPublicLists, setShowPublicLists] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWordLists();
        }
    }, [user, showPublicLists]);

    const fetchWordLists = async () => {
        try {
            setError(null);
            setLoading(true);
            const endpoint = showPublicLists ? '/api/vocalist' : '/api/uservocalist';
            const response = await api.get(endpoint);
            const lists = response.data;

            // Fetch word counts for each list
            const listsWithCounts = await Promise.all(lists.map(async (list) => {
                try {
                    const countResponse = await api.get(`/api/vocacontent/${list.id}`);
                    return { ...list, wordCount: countResponse.data.length };
                } catch (error) {
                    console.error(`Failed to fetch word count for list ${list.id}:`, error);
                    return { ...list, wordCount: 0 };
                }
            }));

            setWordLists(listsWithCounts);
        } catch (error) {
            console.error('Failed to fetch word lists:', error);
            setError('단어장을 불러오는데 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    const deleteWordList = async (id, author) => {
        if (user.email !== author) {
            alert("단어장의 소유자만 삭제할 수 있습니다.");
            return;
        }

        if (window.confirm('이 단어장을 삭제하시겠습니까?')) {
            try {
                await api.delete(`/api/uservocalist/delete/${id}`);
                fetchWordLists(); // Refresh the list after deletion
            } catch (error) {
                console.error('Failed to delete word list:', error);
                alert('단어장 삭제에 실패했습니다.');
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

    if (loading) {
        return <div>로딩 중...</div>;
    }

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
                    <button onClick={() => setShowPublicLists(!showPublicLists)} className="toggle-public-btn">
                        {showPublicLists ? '내 단어장 보기' : '공개 단어장 보기'}
                    </button>
                </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className={`word-list-container ${isGridView ? 'grid-view' : 'list-view'}`}>
                {filteredLists.length === 0 ? (
                    <p>단어장이 없습니다. 새로운 단어장을 만들어보세요!</p>
                ) : (
                    filteredLists.map((list) => (
                        <div key={list.id} className="word-list-item">
                            <h3>{list.title}</h3>
                            <p>{list.wordCount} 단어</p>
                            <p>작성자: {list.author}</p>
                            <div className="word-list-actions">
                                <button className="action-btn play-btn" title="학습하기">
                                    <FontAwesomeIcon icon={faPlay} />
                                </button>
                                {user.email === list.author && (
                                    <>
                                        <button className="action-btn edit-btn" title="수정하기">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            title="삭제하기"
                                            onClick={() => deleteWordList(list.id, list.author)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default WordListPage;