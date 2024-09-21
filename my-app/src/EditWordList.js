import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faPlus, faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from './App';
import './EditWordList.css';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
});

function EditWordList() {
    const { user } = useContext(UserContext);
    const [wordList, setWordList] = useState({ title: '', words: [] });
    const [newWord, setNewWord] = useState({ text: '', transtext: '', sampleSentence: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchWordList();
        }
    }, [id, user, navigate]);

    const fetchWordList = async () => {
        try {
            setLoading(true);
            const [listResponse, wordsResponse] = await Promise.all([
                api.get(`/api/vocalist/show/${id}`),
                api.get(`/api/vocacontent/showall/${id}`)
            ]);

            setWordList({
                ...listResponse.data,
                words: wordsResponse.data || []
            });
        } catch (error) {
            console.error('Failed to fetch word list:', error);
            setError('단어장을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (e) => {
        setWordList(prev => ({ ...prev, title: e.target.value }));
    };

    const handleWordChange = (wordId, field, value) => {
        setWordList(prevState => ({
            ...prevState,
            words: prevState.words.map(word =>
                word.id === wordId ? { ...word, [field]: value } : word
            )
        }));
    };

    const handleAddWord = async () => {
        if (newWord.text && newWord.transtext) {
            try {
                const response = await api.post(`/api/vocacontent/create/${id}`, newWord);
                setWordList(prevState => ({
                    ...prevState,
                    words: [...prevState.words, response.data]
                }));
                setNewWord({ text: '', transtext: '', sampleSentence: '' });
            } catch (error) {
                console.error('Failed to add new word:', error);
                alert('새 단어 추가에 실패했습니다.');
            }
        }
    };

    const handleDeleteWord = async (wordId) => {
        try {
            await api.delete(`/api/vocacontent/delete/${id}/${wordId}`);
            setWordList(prevState => ({
                ...prevState,
                words: prevState.words.filter(word => word.id !== wordId)
            }));
        } catch (error) {
            console.error('Failed to delete word:', error);
            alert('단어 삭제에 실패했습니다.');
        }
    };

    const handleSaveTitle = async () => {
        try {
            await api.patch(`/api/vocalist/modify/${id}`, { title: wordList.title });
            alert('단어장 제목이 수정되었습니다.');
        } catch (error) {
            console.error('Failed to save title:', error);
            alert('단어장 제목 저장에 실패했습니다.');
        }
    };

    const handleSaveWord = async (wordId) => {
        const wordToUpdate = wordList.words.find(word => word.id === wordId);
        try {
            await api.patch(`/api/vocacontent/modify/${id}/${wordId}`, {
                text: wordToUpdate.text,
                transtext: wordToUpdate.transtext,
                sampleSentence: wordToUpdate.sampleSentence
            });
            alert('단어가 수정되었습니다.');
        } catch (error) {
            console.error('Failed to save word:', error);
            alert('단어 저장에 실패했습니다.');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="edit-word-list">
            <div className="title-edit">
                <input
                    type="text"
                    value={wordList.title}
                    onChange={handleTitleChange}
                    placeholder="단어장 제목"
                />
                <button onClick={handleSaveTitle} className="save-btn">
                    <FontAwesomeIcon icon={faSave} /> 제목 저장
                </button>
            </div>
            <div className="word-list">
                {wordList.words.map((word) => (
                    <div key={word.id} className="word-item">
                        <input
                            type="text"
                            value={word.text}
                            onChange={(e) => handleWordChange(word.id, 'text', e.target.value)}
                            placeholder="단어"
                        />
                        <input
                            type="text"
                            value={word.transtext}
                            onChange={(e) => handleWordChange(word.id, 'transtext', e.target.value)}
                            placeholder="뜻"
                        />
                        <input
                            type="text"
                            value={word.sampleSentence}
                            onChange={(e) => handleWordChange(word.id, 'sampleSentence', e.target.value)}
                            placeholder="예문"
                        />
                        <button onClick={() => handleSaveWord(word.id)} className="save-btn">
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button onClick={() => handleDeleteWord(word.id)} className="delete-btn">
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="add-word">
                <input
                    type="text"
                    value={newWord.text}
                    onChange={(e) => setNewWord({ ...newWord, text: e.target.value })}
                    placeholder="새 단어"
                />
                <input
                    type="text"
                    value={newWord.transtext}
                    onChange={(e) => setNewWord({ ...newWord, transtext: e.target.value })}
                    placeholder="뜻"
                />
                <input
                    type="text"
                    value={newWord.sampleSentence}
                    onChange={(e) => setNewWord({ ...newWord, sampleSentence: e.target.value })}
                    placeholder="예문"
                />
                <button onClick={handleAddWord} className="add-btn">
                    <FontAwesomeIcon icon={faPlus} /> 추가
                </button>
            </div>
            <div className="actions">
                <button onClick={() => navigate('/words')} className="cancel-btn">
                    <FontAwesomeIcon icon={faTimes} /> 취소
                </button>
            </div>
        </div>
    );
}

export default EditWordList;