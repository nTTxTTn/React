import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import logo from './logo.svg';
import './App.css';
import QuizPage from './QuizPage'; // 퀴즈 페이지 컴포넌트를 임포트합니다.

const dummyData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    word: `단어 ${i + 1}`,
    definition: `정의 ${i + 1}`
}));

function Home({ searchTerm, handleSearchTermChange, handleSearch, results, filteredResults, isSearching, loadMore, loading, hasMore, loader }) {
    return (
        <>
            <h1>단어퀴즈배열</h1>
            {isSearching ? (
                filteredResults.length > 0 ? (
                    <div className="search-result">
                        <h2>검색 결과: {filteredResults.length}개</h2>
                        {filteredResults.map((result) => (
                            <div key={result.id} className="search-result-item">
                                <h3>{result.word}</h3>
                                <p>{result.definition}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>검색 결과가 없습니다.</p>
                )
            ) : (
                <>
                    <div className="grid-container">
                        {results.map((result) => (
                            <Link to={`/quiz/${result.id}`} key={result.id} className="grid-item">
                                <h3>{result.word}</h3>
                                <p>{result.definition}</p>
                            </Link>
                        ))}
                    </div>
                    {loading && (
                        <p className="loading-message">
                            로딩중입니다<br />
                            잠시만 기다려주세요!
                        </p>
                    )}
                    {hasMore && (
                        <div ref={loader} style={{ height: '20px', margin: '20px 0' }} />
                    )}
                </>
            )}
        </>
    );
}

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [user, setUser] = useState(null);
    const loader = useRef(null);

    const clientId = "975748536663-l3s514093q9ebfojgfblkcul6p9p5gr0.apps.googleusercontent.com"; // 본인 구글 클라이언트 ID

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        setLoading(true);
        setTimeout(() => {
            const newResults = dummyData.map(item => ({
                ...item,
                id: item.id + results.length
            })).slice(0, 8);
            setResults(prev => [...prev, ...newResults]);
            setLoading(false);
            setPage(prevPage => prevPage + 1);
            setHasMore(newResults.length === 8);
        }, 1000);
    }, [loading, hasMore, results.length]);

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
            loadMore();
        }
    }, [loading, hasMore, loadMore]);

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
        };
    }, [handleObserver]);

    useEffect(() => {
        loadMore();
    }, []);

    const handleSearchTermChange = (event) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
    };

    const filterResults = (searchTerm, results) => {
        return results.filter(item =>
            item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.definition.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const handleSearch = () => {
        const filtered = filterResults(searchTerm, results);
        setFilteredResults(filtered);
        setIsSearching(true);
    };

    const handleLogoClick = () => {
        setSearchTerm('');
        setFilteredResults([]);
        setIsSearching(false);
    };

    const onLoginSuccess = (credentialResponse) => {
        const userObject = jwtDecode(credentialResponse.credential);
        setUser(userObject);
    };

    const onLoginFailure = () => {
        console.error('Login Failed');
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <Router>
                <div className="App">
                    <div className="black-nav">
                        <div className="search-bar">
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
                                onChange={handleSearchTermChange}
                            />
                            <button onClick={handleSearch}>검색</button>
                            {user ? (
                                <div className="user-info">
                                    <img src={user.picture} alt={user.name} style={{ width: '30px', borderRadius: '50%' }} />
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

                    <div className="content-wrapper">
                        <h4>단어퀴즈</h4>
                        <main>
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <Home
                                            searchTerm={searchTerm}
                                            handleSearchTermChange={handleSearchTermChange}
                                            handleSearch={handleSearch}
                                            results={results}
                                            filteredResults={filteredResults}
                                            isSearching={isSearching}
                                            loadMore={loadMore}
                                            loading={loading}
                                            hasMore={hasMore}
                                            loader={loader}
                                        />
                                    }
                                />
                                <Route path="/quiz/:id" element={<QuizPage />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;
