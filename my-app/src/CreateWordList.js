import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateWordList.css';
import axios from 'axios';

function CreateWordList({ user }) {
    const [listName, setListName] = useState('');
    const [words, setWords] = useState([]);
    const [currentWord, setCurrentWord] = useState('');
    const [currentDefinition, setCurrentDefinition] = useState('');
    const [isPublic, setIsPublic] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (listName && words.length > 0) {
            try {
                const newWordList = {
                    title: listName,
                    words: words.map(w => ({ word: w.word, meaning: w.definition })),
                    secret: isPublic ? 0 : 1
                };
                const response = await axios.post('http://52.78.146.104:8080/api/vocalist', newWordList, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('새 단어장 생성:', response.data);
                navigate('/words');
            } catch (error) {
                console.error('단어장 생성 오류:', error);
                alert('단어장 생성 중 오류가 발생했습니다.');
            }
        } else {
            alert('단어장 이름을 입력하고 최소 한 개의 단어를 추가해주세요.');
        }
    };

    if (!user) return null;

    return (
        <div className="create-wordlist card fade-in">
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
                <div>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="checkbox-input"
                        />
                        <span className="checkbox-text">공개 단어장으로 설정</span>
                    </label>
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
                        <button type="button" onClick={addWord} className="button add-word-btn">
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
                                    <button type="button" onClick={() => removeWord(index)} className="button remove-word-btn">
                                        삭제
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <button type="submit" className="button create-wordlist-button submit-button">
                    단어장 생성
                </button>
            </form>
        </div>
    );
}

export default CreateWordList;