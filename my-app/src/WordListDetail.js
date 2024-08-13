import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
        <div className="word-list-detail fade-in">
            <h2 className="word-list-detail-title">{wordList.name}</h2>
            <button onClick={() => navigate('/words')} className="button back-button">
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
                                <button onClick={() => handleEditWord(index)} className="word-button secondary">수정</button>
                                <button onClick={() => handleDeleteWord(index)} className="word-button secondary">삭제</button>
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