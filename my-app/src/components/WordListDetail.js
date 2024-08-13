import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadWordList, saveWordList } from '../utils/wordListUtils';
import '../ReactCSS/WordListDetail.css';

function WordListDetail() {
    const { id } = useParams();
    const [wordList, setWordList] = useState(null);
    const [newWord, setNewWord] = useState({ word: '', definition: '' });
    const [editingIndex, setEditingIndex] = useState(-1);
    const navigate = useNavigate();

    useEffect(() => {
        loadWordList(parseInt(id)).then(setWordList);
    }, [id]);

    const handleAddWord = (e) => {
        e.preventDefault();
        if (newWord.word && newWord.definition) {
            const updatedList = {
                ...wordList,
                words: [...wordList.words, newWord]
            };
            saveWordList(updatedList).then(setWordList);
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
            saveWordList(updatedList).then(setWordList);
            setEditingIndex(-1);
            setNewWord({ word: '', definition: '' });
        }
    };

    const handleDeleteWord = (index) => {
        if (window.confirm('정말로 이 단어를 삭제하시겠습니까?')) {
            const updatedWords = wordList.words.filter((_, i) => i !== index);
            const updatedList = { ...wordList, words: updatedWords };
            saveWordList(updatedList).then(setWordList);
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

export default WordListDetail;