import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import './EditWordList.css';

function EditWordList() {
    const [wordList, setWordList] = useState(null);
    const [newWord, setNewWord] = useState({ word: '', definition: '' });
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
        const currentList = loadedLists.find(list => list.id === parseInt(id));
        if (currentList) {
            setWordList(currentList);
        } else {
            navigate('/words');
        }
    }, [id, navigate]);

    const handleWordChange = (index, field, value) => {
        const updatedWords = [...wordList.words];
        updatedWords[index][field] = value;
        setWordList({ ...wordList, words: updatedWords });
    };

    const handleAddWord = () => {
        if (newWord.word && newWord.definition) {
            setWordList({
                ...wordList,
                words: [...wordList.words, newWord]
            });
            setNewWord({ word: '', definition: '' });
        }
    };

    const handleDeleteWord = (index) => {
        const updatedWords = wordList.words.filter((_, i) => i !== index);
        setWordList({ ...wordList, words: updatedWords });
    };

    const handleSave = () => {
        const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
        const updatedLists = loadedLists.map(list =>
            list.id === parseInt(id) ? wordList : list
        );
        localStorage.setItem('wordLists', JSON.stringify(updatedLists));
        navigate('/words');
    };

    if (!wordList) return <div className="loading">Loading...</div>;

    return (
        <div className="edit-word-list">
            <h1>{wordList.name} 수정</h1>
            <div className="word-list">
                {wordList.words.map((word, index) => (
                    <div key={index} className="word-item">
                        <input
                            type="text"
                            value={word.word}
                            onChange={(e) => handleWordChange(index, 'word', e.target.value)}
                            placeholder="단어"
                        />
                        <input
                            type="text"
                            value={word.definition}
                            onChange={(e) => handleWordChange(index, 'definition', e.target.value)}
                            placeholder="뜻"
                        />
                        <button onClick={() => handleDeleteWord(index)} className="delete-btn">
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="add-word">
                <input
                    type="text"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    placeholder="새 단어"
                />
                <input
                    type="text"
                    value={newWord.definition}
                    onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                    placeholder="뜻"
                />
                <button onClick={handleAddWord} className="add-btn">
                    <FontAwesomeIcon icon={faPlus} /> 추가
                </button>
            </div>
            <div className="actions">
                <button onClick={handleSave} className="save-btn">
                    <FontAwesomeIcon icon={faSave} /> 저장
                </button>
                <button onClick={() => navigate('/words')} className="cancel-btn">
                    <FontAwesomeIcon icon={faTimes} /> 취소
                </button>
            </div>
        </div>
    );
}

export default EditWordList;