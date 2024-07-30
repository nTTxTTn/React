import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import logo from './logo.svg';
import './App.css';

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

    // Google 클라이언트 ID를 여기에 입력하세요
    const clientId = "260071461232-28kfnkfhca1r8do97pc3u93nup090k6q.apps.googleusercontent.com"; //본인 구글 클라이언트 ID

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        setLoading(true);
        console.log('Loading more...', page);
        setTimeout(() => {
            const lastId = results.length > 0 ? results[results.length - 1].id : 0;
            const newResults = Array.from({ length: 8 }, (_, i) => ({
                id: lastId + i + 1,
                word: `단어 ${lastId + i + 1}`,
                definition: `정의 ${lastId + i + 1}`
            }));
            setResults(prev => {
                const updatedResults = [...prev, ...newResults];
                console.log('Updating results:', updatedResults);
                return updatedResults;
            });
            setLoading(false);
            setPage(prevPage => prevPage + 1);
            setHasMore(newResults.length === 8);
            console.log('New data loaded', newResults.length);
        }, 1000);
    }, [loading, hasMore, results, page]);

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
        }
    }, [handleObserver]);

    useEffect(() => {
        loadMore();
    }, []);

    useEffect(() => {
        console.log('Updated results:', results);
    }, [results]);

    const handleSearchTermChange = (event) => {
        const newSearchTerm = event.target.value;
        console.log('New search term:', newSearchTerm);
        setSearchTerm(newSearchTerm);
    };

    const filterResults = (searchTerm, results) => {
        return results.filter(item =>
            item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.definition.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const handleSearch = () => {
        console.log(`Searching for: ${searchTerm}`);
        console.log('Current results:', results);
        const filtered = filterResults(searchTerm, results);
        console.log('Filtered results:', filtered);
        setFilteredResults(filtered);
        setIsSearching(true);
    };

    const handleLogoClick = () => {
        setSearchTerm('');
        setFilteredResults([]);
        setIsSearching(false);
        setPage(1);
        setHasMore(true);
        setResults([]);
        loadMore();
    };

    const onLoginSuccess = (credentialResponse) => {
        const userObject = jwtDecode(credentialResponse.credential);
        console.log('Login Success:', userObject);
        setUser(userObject);
    };

    const onLoginFailure = () => {
        console.log('Login Failed');
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
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

                <div className="content-wrapper">
                    <h4>단어퀴즈</h4>

                    <main>
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
                                        <div key={result.id} className="grid-item">
                                            <h3>{result.word}</h3>
                                            <p>{result.definition}</p>
                                        </div>
                                    ))}
                                </div>
                                {loading && (
                                    <p className="loading-message">
                                        로딩중입니다<br />
                                        잠시만 기다려주세요!
                                    </p>
                                )}
                                {hasMore ? (
                                    <div ref={loader} style={{height: '20px', margin: '20px 0'}} />
                                ) : (
                                    <p>더 이상 데이터가 없습니다</p>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}

export default App;