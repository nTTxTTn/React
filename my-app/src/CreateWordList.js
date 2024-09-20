import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateWordList.css';
import axios from 'axios';
import { UserContext } from './App';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // 로그인 페이지로 리다이렉트
            window.location.href = `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google?prompt=select_account`;
        }
        return Promise.reject(error);
    }
);

function CreateWordList() {
    const { user, setUser } = useContext(UserContext);
    const [title, setTitle] = useState('');
    const [words, setWords] = useState([]);
    const [currentWord, setCurrentWord] = useState({ text: '', transtext: '', sampleSentence: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [vocalistId, setVocalistId] = useState(null);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('create');
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
            const response = await api.post('/api/vocalist/create', JSON.stringify({ title }));
            console.log('Word list creation response:', response.data);
            if (response.data && response.data.id) {
                setVocalistId(response.data.id);
                setStep('add');
                setError(null);
            } else {
                throw new Error('서버 응답에 단어장 ID가 없습니다.');
            }
        } catch (error) {
            console.error('Error creating word list:', error);
            setError(`단어장 생성에 실패했습니다: ${error.message}`);
            if (error.response && error.response.status === 401) {
                setUser(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const addWord = async () => {
        if (!currentWord.text || !currentWord.transtext) {
            setError('단어와 뜻을 모두 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const newWord = {
                text: currentWord.text,
                transtext: currentWord.transtext,
                sampleSentence: currentWord.sampleSentence || ''
            };
            console.log('Sending request to add word:', newWord);
            const response = await api.post(`/api/vocacontent/create/${vocalistId}`, JSON.stringify(newWord));
            console.log('Word addition response:', response.data);
            if (response.data && response.data.length > 0) {
                setWords(prevWords => [...prevWords, response.data[0]]);
                setCurrentWord({ text: '', transtext: '', sampleSentence: '' });
                setError('단어가 성공적으로 추가되었습니다.');
            } else {
                throw new Error('서버 응답에 추가된 단어 정보가 없습니다.');
            }
        } catch (error) {
            console.error('Error adding word:', error);
            if (error.response && error.response.status === 401) {
                setError('인증이 만료되었습니다. 다시 로그인해주세요.');
                setUser(null);
            } else if (error.response && error.response.headers['content-type'].includes('text/html')) {
                setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            } else {
                setError(`단어 추가에 실패했습니다: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const finishWordList = () => {
        navigate('/words');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentWord(prev => ({ ...prev, [name]: value }));
    };

    if (!user) {
        return (
            <div>
                <p>로그인이 필요합니다.</p>
                <button onClick={redirectToLogin}>Google로 로그인</button>
            </div>
        );
    }

    return (
        <div className="create-wordlist card fade-in">
            <h2 className="create-wordlist-title">새 단어장 만들기</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="create-wordlist-form">
                {step === 'create' && (
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
                        />
                        <button onClick={createWordList} className="button create-wordlist-button" disabled={isLoading}>
                            {isLoading ? '생성 중...' : '단어장 생성'}
                        </button>
                    </div>
                )}
                {step === 'add' && (
                    <>
                        <h3>단어장: {title}</h3>
                        <div className="form-group">
                            <label>새 단어 추가</label>
                            <div className="word-input-container">
                                <input
                                    type="text"
                                    name="text"
                                    value={currentWord.text}
                                    onChange={handleInputChange}
                                    placeholder="단어"
                                    className="create-wordlist-input"
                                />
                                <input
                                    type="text"
                                    name="transtext"
                                    value={currentWord.transtext}
                                    onChange={handleInputChange}
                                    placeholder="의미"
                                    className="create-wordlist-input"
                                />
                                <input
                                    type="text"
                                    name="sampleSentence"
                                    value={currentWord.sampleSentence}
                                    onChange={handleInputChange}
                                    placeholder="예문 (선택사항)"
                                    className="create-wordlist-input"
                                />
                                <button onClick={addWord} className="button add-word-btn" disabled={isLoading}>
                                    {isLoading ? '추가 중...' : '추가'}
                                </button>
                            </div>
                        </div>
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
                        <button onClick={finishWordList} className="button finish-wordlist-button">
                            단어장 완성
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default CreateWordList;