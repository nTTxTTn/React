import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const loader = useRef(null);

    useEffect(() => {
        loadMore();
    }, []);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: "20px",
            threshold: 1.0
        };

        const observer = new IntersectionObserver(handleObserver, options);
        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, []);

    const handleObserver = (entities) => {
        const target = entities[0];
        if (target.isIntersecting) {
            setPage((prev) => prev + 1);
        }
    };

    const loadMore = () => {
        setLoading(true);
        // 실제 API 호출 대신 더미 데이터를 생성합니다.
        setTimeout(() => {
            const newResults = Array.from({ length: 8 }, (_, i) => ({
                id: results.length + i + 1,
                word: `단어 ${results.length + i + 1}`,
                definition: `정의 ${results.length + i + 1}`
            }));
            setResults(prev => [...prev, ...newResults]);
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        loadMore();
    }, [page]);

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        console.log(`Searching for: ${searchTerm}`);
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
                <div ref={loader} />
            </main>
        </div>
    );
}

export default App;