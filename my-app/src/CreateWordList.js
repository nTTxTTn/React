import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateWordList.css';
import axios from 'axios';

function CreateWordList({ user }) {
    const [title, setTitle] = useState('');
    const [words, setWords] = useState([]);
    const [currentText, setCurrentText] = useState('');
    const [currentTranstext, setCurrentTranstext] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('CreateWordList component mounted. User:', user);
        setIsLoading(false);
    }, [user]);

    const addWord = () => {
        if (currentText && currentTranstext) {
            setWords([...words, { text: currentText, transtext: currentTranstext }]);
            setCurrentText('');
            setCurrentTranstext('');
        }
    };

    const removeWord = (index) => {
        setWords(words.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            console.log('Attempt to submit without user, redirecting to home page');
            navigate('/');
            return;
        }
        if (title && words.length > 0) {
            try {
                // 단어장 생성
                const newWordList = {
                    title: title,
                    secret: isPublic ? 0 : 1,
                    author: user.email
                };
                console.log('Sending request to create word list:', newWordList);
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/vocalist`, newWordList, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                console.log('New word list created:', response.data);

                // 단어 추가
                const wordListId = response.data.id;
                console.log('Adding words to word list ID:', wordListId);
                for (let word of words) {
                    console.log('Adding word:', word);
                    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/vocacontent/${wordListId}`, {
                        text: word.text,
                        transtext: word.transtext
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token}`
                        }
                    });
                }

                console.log('All words added successfully');
                navigate('/words');
            } catch (error) {
                console.error('Error creating word list:', error);
                alert('단어장 생성 중 오류가 발생했습니다.');
            }
        } else {
            console.log('Form validation failed');
            alert('단어장 이름을 입력하고 최소 한 개의 단어를 추가해주세요.');
        }
    };

    console.log('Rendering CreateWordList. User:', user, 'IsLoading:', isLoading);

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="create-wordlist card fade-in">
            <h2 className="create-wordlist-title">새 단어장 만들기</h2>
            {user ? (
                <form onSubmit={handleSubmit} className="create-wordlist-form">
                    <div className="form-group">
                        <label htmlFor="title">단어장 이름</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                                        <span className="word-text">{word.text}</span>
                                        <span className="word-definition">{word.transtext}</span>
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
            ) : (
                <div>로그인이 필요합니다. <button onClick={() => navigate('/')}>홈으로 이동</button></div>
            )}
        </div>
    );
}

export default CreateWordList;