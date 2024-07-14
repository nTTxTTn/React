import React from 'react';
import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        // 검색 기능 구현
        console.log(`Searching for: ${searchTerm}`);
    };

    return (
        <div className="App">
            <header className="App-header">
                <div className="logo">Machugi</div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="퀴즈를 검색해보세요!"
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                    />
                    <button onClick={handleSearch}>검색</button>
                </div>
            </header>

            <nav>
                <ul>
                    <li><a href="#">국기 퀴즈</a></li>
                    <li><a href="#">포켓몬 퀴즈</a></li>
                    <li><a href="#">유튜버 퀴즈</a></li>
                    <li><a href="#">과자 퀴즈</a></li>
                    <li><a href="#">인물 퀴즈</a></li>
                    <li><a href="#">축구 퀴즈</a></li>
                    <li><a href="#">애니 퀴즈</a></li>
                    <li><a href="#">로고 퀴즈</a></li>
                </ul>
            </nav>

            <main>
                <section>
                    <h2>인기 퀴즈</h2>
                    <ul>
                        <li><a href="#">국기 맞추기</a></li>
                        <li><a href="#">포켓몬 이름 맞추기</a></li>
                        <li><a href="#">유튜버 얼굴 맞추기</a></li>
                    </ul>
                </section>

                <section>
                    <h2>신규 퀴즈</h2>
                    <ul>
                        <li><a href="#">4세대 걸그룹 멤버 맞추기</a></li>
                        <li><a href="#">노래 가사 맞추기</a></li>
                        <li><a href="#">만화 캐릭터 맞추기</a></li>
                    </ul>
                </section>
            </main>

            <footer>
                <p>&copy; 2023 Machugi. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;