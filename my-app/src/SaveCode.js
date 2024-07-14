import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        // 검색 로직을 여기에 추가할 수 있습니다.
        console.log(`Searching for: ${searchTerm}`);
    };

    return (
        <div className="App">
            <div className="black-nav">
                <div className="search-bar">
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
                <p>You searched for: {searchTerm}</p>
            </main>
        </div>
    );
}

export default App;