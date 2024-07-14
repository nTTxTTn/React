import React, { useState, useEffect, useRef, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        setLoading(true);
        console.log('Loading more...', page); // 디버깅용 로그
        // 실제 API 호출 대신 더미 데이터를 생성합니다.
        setTimeout(() => {
            const newResults = Array.from({ length: 8 }, (_, i) => ({
                id: results.length + i + 1,
                word: `단어 ${results.length + i + 1}`,
                definition: `정의 ${results.length + i + 1}`
            }));
            setResults(prev => [...prev, ...newResults]);
            setLoading(false);
            setPage(prevPage => prevPage + 1);
            if (newResults.length < 8) {
                setHasMore(false);
            }
            console.log('New data loaded', newResults.length); // 디버깅용 로그
        }, 1000);
    }, [loading, hasMore, results.length, page]);

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

    // 초기 로드
    useEffect(() => {
        loadMore();
    }, []); // 의존성 배열을 비워 초기에만 실행되도록 함

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        console.log(`Searching for: ${searchTerm}`);
        // 여기에 검색 로직을 구현하세요
    };

    return (
        <div className="App">
            <div className="black-nav">
                <div className="search-bar">
                    <img src={logo} alt="Logo" className="logo" />
                    <input
                        type="text"
                        placeholder="검색"
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                    />
                    <button onClick={handleSearch}>검색</button>
                </div>
            </div>

            <div className="content-wrapper">
                <h4>단어퀴즈</h4>

                <main>
                    <h1>단어퀴즈배열</h1>
                    <p>검색결과: {searchTerm}</p>
                    <div className="grid-container">
                        {results.map((result) => (
                            <div key={result.id} className="grid-item">
                                <h3>{result.word}</h3>
                                <p>{result.definition}</p>
                            </div>
                        ))}
                    </div>
                    {loading && <p>Loading...</p>}
                    {hasMore ? (
                        <div ref={loader} style={{height: '20px', margin: '20px 0'}} />
                    ) : (
                        <p>No more data to load</p>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;