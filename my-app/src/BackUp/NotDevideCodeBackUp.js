import React, { useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { BrowserRouter as Router, Route, Link, Routes, useParams, useNavigate, useLocation } from 'react-router-dom';
import logo from './logo.svg';
import './ReactCSS/App.css';
import './ReactCSS/WordListDetail.css';
import './ReactCSS/QuizPage.css';
import './ReactCSS/QuizResult.css';
import './ReactCSS/CreateWordList.css';

function HomePage({ user }) {
    return (
        <div className="home-page">
            <h1>단어퀴즈에 오신 것을 환영합니다!</h1>
            <p>단어를 학습하고 퀴즈를 풀어보세요.</p>
            <div className="home-buttons">
                {user && (
                    <Link to="/create-wordlist" className="button-box">
                        <div className="button-content">
                            <h2>새 단어장 만들기</h2>
                            <p>나만의 단어장을 만들어보세요!</p>
                        </div>
                    </Link>
                )}
                <Link to="/words" className="button-box">
                    <div className="button-content">
                        <h2>단어장 목록 보기</h2>
                        <p>기존 단어장을 확인하세요!</p>
                    </div>
                </Link>
                <Link to="/quiz" className="button-box">
                    <div className="button-content">
                        <h2>단어 퀴즈</h2>
                        <p>단어 퀴즈를 풀어보세요!</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

function QuizPage() {
    const [selectedLists, setSelectedLists] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [quizLength, setQuizLength] = useState(5);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const wordLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
        setSelectedLists(wordLists.map(list => ({ ...list, selected: false })));
    }, []);

    const toggleListSelection = (id) => {
        setSelectedLists(prevLists =>
            prevLists.map(list =>
                list.id === id ? { ...list, selected: !list.selected } : list
            )
        );
    };

    const startQuiz = () => {
        const selectedWords = selectedLists
            .filter(list => list.selected)
            .flatMap(list => list.words);

        if (selectedWords.length < 4) {
            alert('퀴즈를 시작하려면 최소 4개의 단어가 필요합니다.');
            return;
        }

        setAvailableWords(selectedWords);
        setQuizStarted(true);
        setScore(0);
        setTotalQuestions(quizLength);
        setCurrentQuestionNumber(1);
        generateQuestion(selectedWords);
    };

    const generateQuestion = (words) => {
        if (currentQuestionNumber > quizLength) {
            endQuiz();
            return;
        }

        const correctAnswer = words[Math.floor(Math.random() * words.length)];
        const otherWords = words.filter(word => word !== correctAnswer);
        const options = [correctAnswer];

        while (options.length < 4) {
            const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
            if (!options.includes(randomWord)) {
                options.push(randomWord);
            }
        }

        setCurrentQuestion({
            word: correctAnswer.word,
            options: shuffleArray(options.map(option => option.definition)),
            correctAnswer: correctAnswer.definition
        });

        setSelectedAnswer(null);
        setShowResult(false);
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const handleAnswer = (selectedAnswer) => {
        setSelectedAnswer(selectedAnswer);
        setShowResult(true);
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setCurrentQuestionNumber(prev => prev + 1);
        generateQuestion(availableWords);
    };

    const endQuiz = () => {
        setQuizStarted(false);
        navigate('/quiz-result', {
            state: {
                score: score,
                totalQuestions: totalQuestions,
                selectedLists: selectedLists.filter(list => list.selected).map(list => list.name)
            }
        });
    };

    if (!quizStarted) {
        return (
            <div className="quiz-setup">
                <h2>단어 퀴즈 설정</h2>
                <div className="setup-container">
                    <div className="wordlist-selection">
                        <h3>단어장 선택</h3>
                        <div className="wordlist-grid">
                            {selectedLists.map(list => (
                                <div key={list.id} className={`wordlist-item ${list.selected ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id={`list-${list.id}`}
                                        checked={list.selected}
                                        onChange={() => toggleListSelection(list.id)}
                                    />
                                    <label htmlFor={`list-${list.id}`}>{list.name}</label>
                                    <span className="word-count">{list.words.length} 단어</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="quiz-options">
                        <h3>퀴즈 옵션</h3>
                        <div className="quiz-length-selection">
                            <label htmlFor="quiz-length">문제 수:</label>
                            <select
                                id="quiz-length"
                                value={quizLength}
                                onChange={(e) => setQuizLength(Number(e.target.value))}
                            >
                                <option value={5}>5개</option>
                                <option value={10}>10개</option>
                                <option value={15}>15개</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button onClick={startQuiz} className="start-quiz-btn">퀴즈 시작</button>
            </div>
        );
    }

    return (
        <div className="quiz-page">
            <h2>단어 퀴즈</h2>
            {currentQuestion && (
                <div className="quiz-section">
                    <div className="quiz-progress">
                        <p className="question-number">문제 {currentQuestionNumber} / {totalQuestions}</p>
                        <div className="progress-bar">
                            <div
                                className="progress"
                                style={{width: `${(currentQuestionNumber / totalQuestions) * 100}%`}}
                            ></div>
                        </div>
                    </div>
                    <p className="question-prompt">다음 단어의 뜻을 고르세요:</p>
                    <h3 className="quiz-word">{currentQuestion.word}</h3>
                    <div className="options">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className={`option-btn ${showResult ?
                                    (option === currentQuestion.correctAnswer ? 'correct' :
                                        option === selectedAnswer ? 'incorrect' : '') :
                                    (option === selectedAnswer ? 'selected' : '')}`}
                                disabled={showResult}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {showResult && (
                        <div className="result-section">
                            <p className={selectedAnswer === currentQuestion.correctAnswer ? 'correct-answer' : 'incorrect-answer'}>
                                {selectedAnswer === currentQuestion.correctAnswer ? '정답입니다!' : '틀렸습니다.'}
                            </p>
                            {currentQuestionNumber < totalQuestions ? (
                                <button onClick={handleNextQuestion} className="next-question-btn">다음 문제</button>
                            ) : (
                                <button onClick={endQuiz} className="end-quiz-btn">퀴즈 종료</button>
                            )}
                        </div>
                    )}
                    <p className="score">현재 점수: {score} / {currentQuestionNumber - 1}</p>
                    <button onClick={endQuiz} className="quit-quiz-btn">퀴즈 그만두기</button>
                </div>
            )}
        </div>
    );
}

function QuizResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { score, totalQuestions, selectedLists } = location.state || {};

    const handleRetakeQuiz = () => {
        navigate('/quiz');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    if (!score && score !== 0) {
        return <div className="quiz-result error">결과를 불러올 수 없습니다.</div>;
    }

    const percentage = ((score / totalQuestions) * 100).toFixed(2);

    return (
        <div className="quiz-result">
            <h2>퀴즈 결과</h2>
            <div className="result-summary">
                <div className="score-circle">
                    <div className="score-text">
                        <span className="score-number">{score}</span>
                        <span className="score-total">/ {totalQuestions}</span>
                    </div>
                    <div className="score-percentage">{percentage}%</div>
                </div>
                <p className="score-message">
                    {percentage >= 80 ? "훌륭합니다!" :
                        percentage >= 60 ? "좋은 성적이에요!" :
                            "다음에는 더 잘할 수 있을 거예요!"}
                </p>
            </div>
            <div className="selected-lists">
                <h3>선택한 단어장:</h3>
                <ul>
                    {selectedLists.map((list, index) => (
                        <li key={index}>{list}</li>
                    ))}
                </ul>
            </div>
            <div className="result-actions">
                <button onClick={handleRetakeQuiz} className="retake-quiz-btn">
                    <i className="fas fa-redo"></i> 다른 퀴즈 풀기
                </button>
                <button onClick={handleGoHome} className="go-home-btn">
                    <i className="fas fa-home"></i> 홈으로 가기
                </button>
            </div>
        </div>
    );
}


function CreateWordList({ user }) {
    const [listName, setListName] = useState('');
    const [words, setWords] = useState([]);
    const [currentWord, setCurrentWord] = useState('');
    const [currentDefinition, setCurrentDefinition] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    const addWord = () => {
        if (currentWord && currentDefinition) {
            setWords([...words, { word: currentWord, definition: currentDefinition }]);
            setCurrentWord('');
            setCurrentDefinition('');
        }
    };

    const removeWord = (index) => {
        setWords(words.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (listName && words.length > 0) {
            const newWordList = { id: Date.now(), name: listName, words: words, userId: user.sub };
            const existingLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
            const updatedLists = [...existingLists, newWordList];
            localStorage.setItem('wordLists', JSON.stringify(updatedLists));
            console.log('새 단어장 생성:', newWordList);
            navigate('/words');
        } else {
            alert('단어장 이름을 입력하고 최소 한 개의 단어를 추가해주세요.');
        }
    };

    if (!user) return null;

    return (
        <div className="create-wordlist">
            <h2 className="create-wordlist-title">새 단어장 만들기</h2>
            <form onSubmit={handleSubmit} className="create-wordlist-form">
                <div className="form-group">
                    <label htmlFor="listName">단어장 이름</label>
                    <input
                        type="text"
                        id="listName"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="단어장 이름을 입력하세요"
                        required
                        className="create-wordlist-input"
                    />
                </div>
                <div className="form-group">
                    <label>새 단어 추가</label>
                    <div className="word-input-container">
                        <input
                            type="text"
                            value={currentWord}
                            onChange={(e) => setCurrentWord(e.target.value)}
                            placeholder="단어"
                            className="create-wordlist-input"
                        />
                        <input
                            type="text"
                            value={currentDefinition}
                            onChange={(e) => setCurrentDefinition(e.target.value)}
                            placeholder="의미"
                            className="create-wordlist-input"
                        />
                        <button type="button" onClick={addWord} className="add-word-btn">
                            추가
                        </button>
                    </div>
                </div>
                {words.length > 0 && (
                    <div className="word-list-container">
                        <h3>추가된 단어 목록</h3>
                        <ul className="word-list">
                            {words.map((word, index) => (
                                <li key={index} className="word-item">
                                    <span className="word-text">{word.word}</span>
                                    <span className="word-definition">{word.definition}</span>
                                    <button type="button" onClick={() => removeWord(index)} className="remove-word-btn">
                                        삭제
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <button type="submit" className="create-wordlist-button submit-button">
                    단어장 생성
                </button>
            </form>
        </div>
    );
}

function WordListPage({ user }) {
    const [wordLists, setWordLists] = useState([]);

    useEffect(() => {
        loadWordLists();
    }, [user]);

    const loadWordLists = () => {
        const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
        const userLists = user ? loadedLists.filter(list => list.userId === user.sub) : loadedLists;
        setWordLists(userLists);
    };

    const deleteWordList = (id) => {
        if (window.confirm('이 단어장을 삭제하시겠습니까?')) {
            const updatedLists = wordLists.filter(list => list.id !== id);
            localStorage.setItem('wordLists', JSON.stringify(updatedLists));
            setWordLists(updatedLists);
        }
    };

    return (
        <div className="word-list-page">
            <h2 className="page-title">내 단어장 목록</h2>
            {wordLists.length > 0 ? (
                <div className="word-list-grid">
                    {wordLists.map((list) => (
                        <div key={list.id} className="word-list-item-container">
                            <Link to={`/wordlist/${list.id}`} className="word-list-item">
                                <h3 className="word-list-item-title">{list.name}</h3>
                                <p className="word-list-item-count">{list.words.length} 단어</p>
                                <div className="word-list-item-preview">
                                    {list.words.slice(0, 3).map((word, index) => (
                                        <p key={index} className="preview-word">{word.word}</p>
                                    ))}
                                </div>
                            </Link>
                            <button
                                onClick={() => deleteWordList(list.id)}
                                className="delete-list-button"
                                title="단어장 삭제"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-lists-message">
                    {user
                        ? '아직 생성된 단어장이 없습니다. 새 단어장을 만들어보세요!'
                        : '로그인하여 단어장을 만들어보세요!'}
                </p>
            )}
            {user && (
                <div className="word-list-actions">
                    <Link to="/create-wordlist" className="action-button create-list-button">
                        <span className="button-icon">+</span>
                        새 단어장 만들기
                    </Link>
                </div>
            )}
        </div>
    );
}

function WordListDetail() {
    const { id } = useParams();
    const [wordList, setWordList] = useState(null);
    const [newWord, setNewWord] = useState({ word: '', definition: '' });
    const [editingIndex, setEditingIndex] = useState(-1);
    const navigate = useNavigate();

    useEffect(() => {
        loadWordList();
    }, [id]);

    const loadWordList = () => {
        const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
        const currentList = loadedLists.find(list => list.id === parseInt(id));
        setWordList(currentList);
    };

    const saveWordList = (updatedList) => {
        const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
        const updatedLists = loadedLists.map(list =>
            list.id === parseInt(id) ? updatedList : list
        );
        localStorage.setItem('wordLists', JSON.stringify(updatedLists));
        setWordList(updatedList);
    };

    const handleAddWord = (e) => {
        e.preventDefault();
        if (newWord.word && newWord.definition) {
            const updatedList = {
                ...wordList,
                words: [...wordList.words, newWord]
            };
            saveWordList(updatedList);
            setNewWord({ word: '', definition: '' });
        }
    };

    const handleEditWord = (index) => {
        setEditingIndex(index);
        setNewWord(wordList.words[index]);
    };

    const handleUpdateWord = (e) => {
        e.preventDefault();
        if (newWord.word && newWord.definition) {
            const updatedWords = [...wordList.words];
            updatedWords[editingIndex] = newWord;
            const updatedList = { ...wordList, words: updatedWords };
            saveWordList(updatedList);
            setEditingIndex(-1);
            setNewWord({ word: '', definition: '' });
        }
    };

    const handleDeleteWord = (index) => {
        if (window.confirm('정말로 이 단어를 삭제하시겠습니까?')) {
            const updatedWords = wordList.words.filter((_, i) => i !== index);
            const updatedList = { ...wordList, words: updatedWords };
            saveWordList(updatedList);
        }
    };

    if (!wordList) {
        return <div className="loading">로딩 중...</div>;
    }

    return (
        <div className="word-list-detail">
            <div className="title-container">
                <h2 className="word-list-detail-title">{wordList.name}</h2>
            </div>
            <button onClick={() => navigate('/words')} className="back-button">
                ← 목록으로 돌아가기
            </button>

            <form onSubmit={editingIndex === -1 ? handleAddWord : handleUpdateWord} className="word-form">
                <input
                    type="text"
                    value={newWord.word}
                    onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                    placeholder="단어"
                    required
                    className="word-input"
                />
                <input
                    type="text"
                    value={newWord.definition}
                    onChange={(e) => setNewWord({...newWord, definition: e.target.value})}
                    placeholder="의미"
                    required
                    className="word-input"
                />
                <button type="submit" className="word-button primary">
                    {editingIndex === -1 ? '단어 추가' : '단어 수정'}
                </button>
                {editingIndex !== -1 && (
                    <button type="button" onClick={() => {
                        setEditingIndex(-1);
                        setNewWord({ word: '', definition: '' });
                    }} className="word-button secondary">
                        취소
                    </button>
                )}
            </form>

            {wordList.words.length > 0 ? (
                <ul className="word-detail-list">
                    {wordList.words.map((word, index) => (
                        <li key={index} className="word-detail-item">
                            <div className="word-detail-content">
                                <div className="word-detail-word">{word.word}</div>
                                <div className="word-detail-definition">{word.definition}</div>
                            </div>
                            <div className="word-detail-actions">
                                <button onClick={() => handleEditWord(index)} className="word-button edit">수정</button>
                                <button onClick={() => handleDeleteWord(index)} className="word-button delete">삭제</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-words-message">이 단어장에는 아직 단어가 없습니다.</p>
            )}
        </div>
    );
}

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('');

    const clientId = "260071461232-28kfnkfhca1r8do97pc3u93nup090k6q.apps.googleusercontent.com";

    const handleLogoClick = () => {
        navigate('/');
        setCurrentPage('');
    };

    const onLoginSuccess = (credentialResponse) => {
        const userObject = jwtDecode(credentialResponse.credential);
        console.log('로그인 성공:', userObject);
        setUser(userObject);
    };

    const onLoginFailure = () => {
        console.log('로그인 실패');
    };

    useEffect(() => {
        const path = location.pathname;
        if (path === '/words') {
            setCurrentPage('단어장 목록');
        } else if (path === '/quiz') {
            setCurrentPage('단어 퀴즈');
        } else {
            setCurrentPage('');
        }
    }, [location]);

    return (
        <div className="App">
            <div className="nav-bar">
                <div className="nav-left">
                    <img
                        src={logo}
                        alt="Logo"
                        className="logo"
                        onClick={handleLogoClick}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
                <div className="nav-center">
                    <h1 className="app-title">{currentPage || '단어퀴즈'}</h1>
                </div>
                <div className="nav-right">
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
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage user={user} />} />
                        <Route path="/words" element={<WordListPage user={user} />} />
                        <Route path="/wordlist/:id" element={<WordListDetail />} />
                        <Route path="/create-wordlist" element={<CreateWordList user={user} />} />
                        <Route path="/quiz" element={<QuizPage />} />
                        <Route path="/quiz-result" element={<QuizResult />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

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