import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateWordList.css';
import axios from 'axios';
import { UserContext } from './App';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log('Starting Request', JSON.stringify(config, null, 2))
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

function CreateWordList() {
    const { user } = useContext(UserContext);
    const [title, setTitle] = useState('');
    const [words, setWords] = useState([]);
    const [currentText, setCurrentText] = useState('');
    const [currentTranstext, setCurrentTranstext] = useState('');
    const [currentSampleSentence, setCurrentSampleSentence] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [vocalistId, setVocalistId] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('CreateWordList component mounted. User:', user);
        if (!user) {
            redirectToLogin();
        }
    }, [user]);

    const redirectToLogin = () => {
        const loginUrl = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google?prompt=select_account`;
        window.location.href = loginUrl;
    };

    const createWordList = async () => {
        if (!title) {
            setError('단어장 제목을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log('Sending request to create word list:', { title });
            const response = await api.post('/api/vocalist/create', { title });
            console.log('Word list creation response:', response.data);
            if (response.data && response.data.id) {
                setVocalistId(response.data.id);
                setError('단어장이 성공적으로 생성되었습니다. 이제 단어를 추가해주세요.');
            } else {
                throw new Error('서버 응답에 단어장 ID가 없습니다.');
            }
        } catch (error) {
            console.error('Error creating word list:', error);
            setError(`단어장 생성에 실패했습니다: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const addWord = async () => {
        if (!vocalistId) {
            setError('먼저 단어장을 생성해주세요.');
            return;
        }
        if (currentText && currentTranstext) {
            setIsLoading(true);
            setError(null);
            try {
                const newWord = {
                    text: currentText,
                    transtext: currentTranstext,
                    sampleSentence: currentSampleSentence || ''
                };
                await api.post(`/api/vocacontent/create/${vocalistId}`, [newWord]);
                setWords(prevWords => [...prevWords, newWord]);
                setCurrentText('');
                setCurrentTranstext('');
                setCurrentSampleSentence('');
                setError('단어가 성공적으로 추가되었습니다.');
            } catch (error) {
                console.error('Error adding word:', error);
                setError(`단어 추가에 실패했습니다: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        } else {
            setError('단어와 뜻을 모두 입력해주세요.');
        }
    };

    const finishWordList = () => {
        navigate('/words');
    };

    return (
        <div className="create-wordlist card fade-in">
            <h2 className="create-wordlist-title">새 단어장 만들기</h2>
            {error && <div className="error-message">{error}</div>}
            {user ? (
                <div className="create-wordlist-form">
                    <div className="form-group">
                        <label htmlFor="listName">단어장 이름</label>
                        <input
                            type="text"
                            id="listName"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="단어장 이름을 입력하세요"
                            required
                            className="create-wordlist-input"
                            disabled={vocalistId !== null}
                        />
                        <button onClick={createWordList} className="button create-wordlist-button" disabled={vocalistId !== null || isLoading}>
                            {isLoading ? '생성 중...' : '단어장 생성'}
                        </button>
                    </div>
                    {vocalistId && (
                        <div className="form-group">
                            <label>새 단어 추가</label>
                            <div className="word-input-container">
                                <input
                                    type="text"
                                    value={currentText}
                                    onChange={(e) => setCurrentText(e.target.value)}
                                    placeholder="단어"
                                    className="create-wordlist-input"
                                />
                                <input
                                    type="text"
                                    value={currentTranstext}
                                    onChange={(e) => setCurrentTranstext(e.target.value)}
                                    placeholder="의미"
                                    className="create-wordlist-input"
                                />
                                <input
                                    type="text"
                                    value={currentSampleSentence}
                                    onChange={(e) => setCurrentSampleSentence(e.target.value)}
                                    placeholder="예문 (선택사항)"
                                    className="create-wordlist-input"
                                />
                                <button onClick={addWord} className="button add-word-btn" disabled={isLoading}>
                                    {isLoading ? '추가 중...' : '추가'}
                                </button>
                            </div>
                        </div>
                    )}
                    {words.length > 0 && (
                        <div className="word-list-container">
                            <h3>추가된 단어 목록</h3>
                            <ul className="word-list">
                                {words.map((word, index) => (
                                    <li key={index} className="word-item">
                                        <span className="word-text">{word.text}</span>
                                        <span className="word-definition">{word.transtext}</span>
                                        {word.sampleSentence && <span className="word-sample">{word.sampleSentence}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {vocalistId && (
                        <button onClick={finishWordList} className="button finish-wordlist-button">
                            단어장 완성
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    로그인이 필요합니다.
                    <button onClick={redirectToLogin}>Google로 로그인</button>
                </div>
            )}
            {/* 디버깅을 위한 상태 표시 */}
            <div className="debug-info" style={{marginTop: '20px', fontSize: '12px', color: 'gray'}}>
                <p>VocaList ID: {vocalistId || 'Not set'}</p>
                <p>Is Loading: {isLoading.toString()}</p>
                <p>Word Count: {words.length}</p>
            </div>
        </div>
    );
}

export default CreateWordList;