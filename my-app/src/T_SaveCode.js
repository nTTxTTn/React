import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [results, setResults] = React.useState([
        { id: 1, word: '세계수도', definition: '세계의 수도',},
        { id: 2, word: '영화', definition: '세계의 영화' },
        { id: 3, word: '동물', definition: '세계의 동물' },
        { id: 4, word: '인물', definition: '세계의 인물' },
        { id: 5, word: '세계수도2', definition: '세계의 수도2',},
        { id: 6, word: '영화2', definition: '세계의 영화2' },
        { id: 7, word: '동물2', definition: '세계의 동물2' },
        { id: 8, word: '인물2', definition: '세계의 인물2' },
    ]);

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
            </main>
        </div>
    );
}

export default App;