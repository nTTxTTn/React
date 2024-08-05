import React, { useState, useEffect, useRef, useCallback } from 'react';
import logo from '../logo.svg';
import '../ReactCSS/App.css';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        setLoading(true);
        console.log('Loading more...', page);
        setTimeout(() => {
            const newResults = Array.from({ length: 8 }, (_, i) => ({
                id: results.length + i + 1,
                word: `단어 ${results.length + i + 1}`,
                definition: `정의 ${results.length + i + 1}`
            }));
            setResults(prev => {
                console.log('Updating results:', [...prev, ...newResults]);
                return [...prev, ...newResults];
            });
            setLoading(false);
            setPage(prevPage => prevPage + 1);
            if (newResults.length < 8) {
                setHasMore(false);
            }
            console.log('New data loaded', newResults.length);
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
                    {filteredResults.length > 0 ? (
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
                        searchTerm && <p>검색 결과가 없습니다.</p>
                    )}
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
                </main>
            </div>
        </div>
    );
}

export default App;