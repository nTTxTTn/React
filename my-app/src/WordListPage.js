import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPlay, faEdit, faThLarge, faList, faSearch, faSortAlphaDown, faSortAlphaUp, faGlobe, faUser, faCopy, faDownload } from '@fortawesome/free-solid-svg-icons';
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

    const fetchWordCount = async (listId, token = null) => {
        try {
            const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
            console.log(`단어 수 조회 요청 - 리스트 ID: ${listId}`);
            const response = await api.get(`/api/vocacontent/showall/${listId}`, config);
            console.log(`단어 수 조회 응답 - 리스트 ID: ${listId}`, response.data);
            return response.data.length;
        } catch (error) {
            console.error(`단어 수 조회 실패 (리스트 ID: ${listId}):`, error);
            return 0;
        }
    };

    const copyWordList = async (id) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('로그인이 필요합니다.');
                navigate('/');
                return;
            }

            console.log('단어장 복사 시도 - 원본 ID:', id);
            const config = {
                headers: { 'Authorization': `Bearer ${token}` },
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            };

            const response = await api.get(`/api/uservocalist/${id}`, config);
            console.log('단어장 복사 응답:', response);

            if (response.status === 401) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                localStorage.removeItem('accessToken');
                navigate('/');
                return;
            }

            if (response.status === 200 || response.status === 201) {
                alert('단어장이 복사되었습니다.');
                setShowPublicLists(false);
                await fetchWordLists();
            } else {
                throw new Error('단어장 복사에 실패했습니다.');
            }
        } catch (error) {
            console.error('단어장 복사 실패:', error);

            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                localStorage.removeItem('accessToken');
                navigate('/');
                return;
            }

            alert('단어장 복사에 실패했습니다. 다시 시도해 주세요.');
        }
    };

    const fetchWordLists = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const endpoint = user && !showPublicLists ? '/api/uservocalist' : '/api/vocalist/showall';
            console.log(`단어장 목록 조회 시작 - 엔드포인트: ${endpoint}`);

            let token = null;
            let config = {};
            if (user && !showPublicLists) {
                token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers = { 'Authorization': `Bearer ${token}` };
                }
            }

            const response = await api.get(endpoint, config);
            console.log('API 응답 데이터:', response.data);

            if (!Array.isArray(response.data)) {
                throw new Error('서버 응답이 배열 형식이 아닙니다');
            }

            const lists = response.data;
            const processedLists = await Promise.all(lists.map(async item => {
                try {
                    if (endpoint === '/api/uservocalist') {
                        const listData = item.vocaListEntity;
                        console.log('단어장 엔티티:', listData);
                        console.log('매핑될 ID:', listData.id);

                        // 단어 수 조회
                        const actualWordCount = await fetchWordCount(item.id, token);

                        // 단어 수가 0인 경우 null 반환
                        if (actualWordCount === 0) {
                            console.log(`단어 수가 0인 단어장 필터링 - ID: ${item.id}`);
                            return null;
                        }

                        return {
                            id: item.id,
                            title: listData.title || '제목 없음',
                            wordCount: actualWordCount,
                            author: listData.email,
                            isPublic: listData.secret === 1,
                            userName: item.userEntity.name,
                            userEmail: item.userEntity.email
                        };
                    } else {
                        const actualWordCount = await fetchWordCount(item.id, token);

                        // 단어 수가 0인 경우 null 반환
                        if (actualWordCount === 0) {
                            console.log(`단어 수가 0인 단어장 필터링 - ID: ${item.id}`);
                            return null;
                        }

                        return {
                            id: item.id,
                            title: item.title || '제목 없음',
                            wordCount: actualWordCount,
                            author: item.email,
                            isPublic: item.secret === 1,
                            userName: item.username,
                            userEmail: item.email
                        };
                    }
                } catch (error) {
                    console.error(`단어장 처리 중 오류 발생 - ID: ${item.id}:`, error);
                    return null; // 오류 발생 시 해당 단어장 제외
                }
            }));

            // null 값 필터링
            const filteredLists = processedLists.filter(list => list !== null);

            console.log('처리된 단어장 목록:', filteredLists);
            console.log(`${filteredLists.length}개의 유효한 단어장을 불러왔습니다`);
            setWordLists(filteredLists);
        } catch (error) {
            console.error('단어장 목록 조회 실패:', error);
            if (error.response && error.response.status === 401) {
                alert('로그인이 필요합니다.');
                navigate('/');
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

    const editWordList = (id) => {
        console.log('단어장 수정 버튼 클릭:', id);
        navigate(`/edit-wordlist/${id}`);
    };

    const deleteWordList = async (id) => {
        if (window.confirm('이 단어장을 삭제하시겠습니까?')) {
            try {
                console.log('단어장 삭제 시도 - ID:', id);
                const token = localStorage.getItem('accessToken');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                await api.delete(`/api/vocalist/delete/${id}`, config);
                console.log('단어장 삭제 성공 - ID:', id);
                fetchWordLists();
            } catch (error) {
                console.error('단어장 삭제 실패:', error);
                if (error.response && error.response.status === 401) {
                    alert('로그인이 필요합니다.');
                    navigate('/');
                } else {
                    alert('단어장 삭제에 실패했습니다.');
                }
            }
        }
    };

    const togglePublic = async (id, isPublic) => {
        try {
            console.log('공개 상태 변경 시도 - ID:', id, '현재 상태:', isPublic);
            const token = localStorage.getItem('accessToken');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const endpoint = isPublic ? `/api/vocalist/${id}/editsecret/close` : `/api/vocalist/${id}/editsecret/open`;
            await api.get(endpoint, config);
            console.log('공개 상태 변경 성공');
            fetchWordLists();
        } catch (error) {
            console.error('단어장 공개 상태 변경 실패:', error);
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


    const downloadCSV = async (id, title) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('로그인이 필요합니다.');
                navigate('/');
                return;
            }

            console.log('CSV 다운로드 시도 - ID:', id);
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/csv'
                }
            };

            const response = await api.get(`/api/vocalist/csvdown/${id}`, config);

            // UTF-8 BOM 추가
            const BOM = '\uFEFF';
            const csvContent = BOM + response.data;

            // CSV 데이터를 Blob으로 변환 (UTF-8 인코딩 명시)
            const blob = new Blob([csvContent], {
                type: 'text/csv;charset=utf-8;'
            });

            // 다운로드 링크 생성
            const link = document.createElement('a');
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.setAttribute('download', `${title}_단어장.csv`);

            // 링크 클릭 시뮬레이션
            document.body.appendChild(link);
            link.click();

            // 클린업
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('CSV 다운로드 성공');
        } catch (error) {
            console.error('CSV 다운로드 실패:', error);
            if (error.response && error.response.status === 401) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/');
            } else {
                alert('CSV 다운로드에 실패했습니다. 다시 시도해 주세요.');
            }
        }
    };

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
                                    <p className="word-list-count">{list.wordCount}개의 단어</p>
                                    <p className="word-list-author">작성자: {list.userName}</p>
                                    {!list.isPublic && <p className="word-list-private">비공개</p>}
                                </div>
                                <div className="word-list-actions">
                                    <Link to={`/flashcard/${list.id}`} className="action-btn flashcard-link" title="학습하기">
                                        <FontAwesomeIcon icon={faPlay} />
                                        <span className="tooltip">학습하기</span>
                                    </Link>

                                    {user && (
                                        <button
                                            onClick={() => downloadCSV(list.id, list.title)}
                                            className="action-btn download-btn"
                                            title="CSV 다운로드"
                                        >
                                            <FontAwesomeIcon icon={faDownload} />
                                            <span className="tooltip">CSV 다운로드</span>
                                        </button>
                                    )}

                                    {user && showPublicLists && (
                                        <button
                                            onClick={() => {
                                                console.log('복사 버튼 클릭 - 단어장 ID:', list.id);
                                                copyWordList(list.id);
                                            }}
                                            className="action-btn copy-btn"
                                            title="내 단어장으로 복사"
                                        >
                                            <FontAwesomeIcon icon={faCopy} />
                                            <span className="tooltip">내 단어장으로 복사</span>
                                        </button>
                                    )}

                                    {user && !showPublicLists && user.email === list.userEmail && (
                                        <>
                                            <button
                                                onClick={() => editWordList(list.id)}
                                                className="action-btn edit-btn"
                                                title="수정하기"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                                <span className="tooltip">수정하기</span>
                                            </button>
                                            <button
                                                onClick={() => deleteWordList(list.id)}
                                                className="action-btn delete-btn"
                                                title="삭제하기"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                                <span className="tooltip">삭제하기</span>
                                            </button>
                                            <button
                                                onClick={() => togglePublic(list.id, list.isPublic)}
                                                className="action-btn toggle-public-btn"
                                                title={list.isPublic ? "비공개로 전환" : "공개로 전환"}
                                            >
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