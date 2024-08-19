import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import './CreateWordList.css';

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
            navigate('/words');
        } else {
            alert('단어장 이름을 입력하고 최소 한 개의 단어를 추가해주세요.');
        }
    };

    return (
        <div className="create-wordlist">
            <h1 className="page-title">새 단어장 만들기</h1>
            <form onSubmit={handleSubmit} className="wordlist-form">
                <div className="form-group">
                    <label htmlFor="listName">단어장 이름</label>
                    <input
                        type="text"
                        id="listName"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="단어장 이름을 입력하세요"
                        required
                        className="listname-input"
                    />
                </div>
                <div className="form-group">
                    <label>새 단어 추가</label>
                    <div className="word-input-group">
                        <input
                            type="text"
                            value={currentWord}
                            onChange={(e) => setCurrentWord(e.target.value)}
                            placeholder="단어"
                        />
                        <input
                            type="text"
                            value={currentDefinition}
                            onChange={(e) => setCurrentDefinition(e.target.value)}
                            placeholder="뜻"
                        />
                        <button type="button" onClick={addWord} className="add-word-btn">
                            <FontAwesomeIcon icon={faPlus} /> 추가
                        </button>
                    </div>
                </div>
                {words.length > 0 && (
                    <div className="word-list">
                        <h2>추가된 단어 목록</h2>
                        <div className="word-list-header">
                            <span>단어</span>
                            <span>뜻</span>
                            <span>삭제</span>
                        </div>
                        <ul>
                            {words.map((word, index) => (
                                <li key={index} className="word-item">
                                    <span className="word-text">{word.word}</span>
                                    <span className="word-definition">{word.definition}</span>
                                    <button type="button" onClick={() => removeWord(index)} className="remove-word-btn">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <button type="submit" className="create-wordlist-btn">
                    <FontAwesomeIcon icon={faSave} /> 단어장 생성
                </button>
            </form>
        </div>
    );
}

export default CreateWordList;