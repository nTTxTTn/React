import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { BrowserRouter as Router, Route, Link, Routes, useParams, useNavigate } from 'react-router-dom';
import { fetchWords, fetchWordDetail } from './dummyAPI';  // 더미 API import
import logo from './logo.svg';
import './App.css';

// 단어 상세 페이지 컴포넌트
function WordDetail() {
    const { id } = useParams();
    const [wordDetail, setWordDetail] = useState(null);

    // 단어 상세 정보 가져오기
    useEffect(() => {
        fetchWordDetail(id).then(detail => {
            setWordDetail(detail);
        });
    }, [id]);

    if (!wordDetail) {
        return <div>로딩 중...</div>;
    }

    return (
        <div>
            <h2>단어 상세 정보</h2>
            <h3>{wordDetail.term}</h3>
            <p><strong>정의:</strong> {wordDetail.definition}</p>
            <p><strong>예문:</strong></p>
            <ul>
                {wordDetail.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                ))}
            </ul>
            <p><strong>유의어:</strong></p>
            <ul>
                {wordDetail.synonyms.map((synonym, index) => (
                    <li key={index}>{synonym}</li>
                ))}
            </ul>
        </div>
    );
}

// 메인 앱 컨텐츠 컴포넌트
function AppContent() {
    const navigate = useNavigate();

    // 상태 관리
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [user, setUser] = useState(null);
    const loader = useRef(null);

    // Google 로그인을 위한 클라이언트 ID
    const clientId = "260071461232-28kfnkfhca1r8do97pc3u93nup090k6q.apps.googleusercontent.com";

    // 무한 스크롤 구현을 위한 데이터 로딩 함수
    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        setLoading(true);
        console.log('Loading more...', page);

        fetchWords(page).then(({ words: newWords, hasMore: moreAvailable }) => {
            setResults(prev => [...prev, ...newWords]);
            setLoading(false);
            setPage(prevPage => prevPage + 1);
            setHasMore(moreAvailable);
        }).catch(error => {
            console.error('Error fetching words:', error);
            setLoading(false);
        });
    }, [loading, hasMore, page]);

    // Intersection Observer를 사용한 무한 스크롤 감지
    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
            loadMore();
        }
    }, [loading, hasMore, loadMore]);

    // Intersection Observer 설정
    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 0
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loader.current) observer.observe(loader.current);

        return () => {
            if (loader.current) observer.unobserve(loader.current);
        }
    }, [handleObserver]);

    // 초기 데이터 로딩
    useEffect(() => {
        loadMore();
    }, []);

    // 결과 업데이트 로깅
    useEffect(() => {
        console.log('Updated results:', results);
    }, [results]);

    // 검색어 변경 및 엔터 키 처리 핸들러
    const handleSearchTermChange = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // 검색 결과 필터링 함수
    const filterResults = (searchTerm, results) => {
        return results.filter(item =>
            item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.definition.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // 검색 실행 함수
    const handleSearch = () => {
        console.log(`Searching for: ${searchTerm}`);
        console.log('Current results:', results);
        const filtered = filterResults(searchTerm, results);
        console.log('Filtered results:', filtered);
        setFilteredResults(filtered);
        setIsSearching(true);
    };

    // 로고 클릭 시 초기화 함수
    const handleLogoClick = () => {
        setSearchTerm('');
        setFilteredResults([]);
        setIsSearching(false);
        setPage(1);
        setHasMore(true);
        setResults([]);
        loadMore();
        navigate('/'); // 메인 페이지로 이동
    };

    // Google 로그인 성공 핸들러
    const onLoginSuccess = (credentialResponse) => {
        const userObject = jwtDecode(credentialResponse.credential);
        console.log('Login Success:', userObject);
        setUser(userObject);
    };

    // Google 로그인 실패 핸들러
    const onLoginFailure = () => {
        console.log('Login Failed');
    };

    return (
        <div className="App">
            {/* 네비게이션 바 */}
            <div className="black-nav">
                <div className="search-bar">
                    {/* 로고 및 검색 입력 필드 */}
                    <img
                        src={logo}
                        alt="Logo"
                        className="logo"
                        onClick={handleLogoClick}
                        style={{ cursor: 'pointer' }}
                    />
                    <input
                        type="text"
                        placeholder="검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleSearchTermChange}
                    />
                    <button onClick={handleSearch}>검색</button>
                    {/* 사용자 정보 또는 로그인 버튼 */}
                    {user ? (
                        <div className="user-info">
                            <img src={user.picture} alt={user.name} style={{width: '30px', borderRadius: '50%'}} />
                            <span>{user.name}</span>
                            <button onClick={() => setUser(null)}>Logout</button>
                        </div>
                    ) : (
                        <GoogleLogin
                            onSuccess={onLoginSuccess}
                            onError={onLoginFailure}
                        />
                    )}
                </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="content-wrapper">
                <h4>단어퀴즈</h4>

                <main>
                    <Routes>
                        <Route path="/word/:id" element={<WordDetail />} />
                        <Route path="/" element={
                            <>
                                <h1>단어 목록</h1>
                                {/* 검색 결과 또는 전체 결과 표시 */}
                                {isSearching ? (
                                    filteredResults.length > 0 ? (
                                        <div className="search-result">
                                            <h2>검색 결과: {filteredResults.length}개</h2>
                                            {filteredResults.map((result) => (
                                                <div key={result.id} className="search-result-item">
                                                    <Link to={`/word/${result.id}`}>
                                                        <h3>{result.term}</h3>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>검색 결과가 없습니다.</p>
                                    )
                                ) : (
                                    <>
                                        {/* 그리드 형태로 결과 표시 */}
                                        <div className="grid-container">
                                            {results.map((result) => (
                                                <div key={result.id} className="grid-item">
                                                    <Link to={`/word/${result.id}`}>
                                                        <h3>{result.term}</h3>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                        {/* 로딩 메시지 */}
                                        {loading && (
                                            <p className="loading-message">
                                                로딩중입니다<br />
                                                잠시만 기다려주세요!
                                            </p>
                                        )}
                                        {/* 무한 스크롤을 위한 로더 요소 */}
                                        {hasMore ? (
                                            <div ref={loader} style={{height: '20px', margin: '20px 0'}} />
                                        ) : (
                                            <p>더 이상 데이터가 없습니다</p>
                                        )}
                                    </>
                                )}
                            </>
                        } />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

// 메인 App 컴포넌트
function App() {
    return (
        <Router>
            <GoogleOAuthProvider clientId="260071461232-28kfnkfhca1r8do97pc3u93nup090k6q.apps.googleusercontent.com">
                <AppContent />
            </GoogleOAuthProvider>
        </Router>
    );
}

export default App;