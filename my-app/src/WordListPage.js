import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPlay, faEdit, faThLarge, faList, faSearch, faSortAlphaDown, faSortAlphaUp } from '@fortawesome/free-solid-svg-icons';
import './WordListPage.css';

function WordListPage({ user, api }) {
    const [wordLists, setWordLists] = useState([]);
    const [isGridView, setIsGridView] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showPublicLists, setShowPublicLists] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWordLists();
        }
    }, [user, showPublicLists]);

    const fetchWordLists = async () => {
        try {
            const endpoint = showPublicLists ? '/api/vocalist' : '/api/uservocalist';
            const response = await api.get(endpoint);
            setWordLists(response.data);
        } catch (error) {
            console.error('Failed to fetch word lists:', error);
        }
    };

    const togglePublicLists = () => {
        setShowPublicLists(!showPublicLists);
    };

    const deleteWordList = async (id, author) => {
        if (user.email !== author) {
            alert("단어장의 소유자만 삭제할 수 있습니다.");
            return;
        }

        if (window.confirm('이 단어장을 삭제하시겠습니까?')) {
            try {
                await api.delete(`/api/uservocalist/delete/${id}`);
                fetchWordLists(); // 목록 새로고침
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
                    <button onClick={togglePublicLists} className="toggle-public-btn">
                        {showPublicLists ? '내 단어장 보기' : '공개 단어장 보기'}
                    </button>
                </div>
            </div>
            <div className={`word-list-container ${isGridView ? 'grid-view' : 'list-view'}`}>
                {filteredLists.map((list) => (
                    <div key={list.id} className="word-list-item">
                        <h3>{list.title}</h3>
                        <p>{list.words.length} 단어</p>
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
                ))}
            </div>
        </div>
    );
}

export default WordListPage;