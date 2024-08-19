import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faArrowLeft, faRedo, faVolumeUp, faArrowRight, faQuestionCircle, faStop } from '@fortawesome/free-solid-svg-icons';
import './FlashcardView.css';

function FlashcardView() {
    const [wordList, setWordList] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
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

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleNext = () => {
        if (currentIndex < wordList.words.length - 1) {
            setCurrentIndex(prevIndex => prevIndex + 1);
            setIsFlipped(false);
        } else {
            alert('학습을 완료했습니다!');
            navigate('/words');
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prevIndex => prevIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const speakWord = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const handleQuit = () => {
        if (window.confirm('정말로 학습을 중단하시겠습니까?')) {
            navigate('/words');
        }
    };

    if (!wordList) return <div className="loading">Loading...</div>;

    return (
        <div className="flashcard-view">
            <h1 className="flashcard-title">{wordList.name}</h1>
            <div className="flashcard-container">
                <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
                    <div className="flashcard-front">
                        <p>{wordList.words[currentIndex].word}</p>
                        <div className="flashcard-tooltip">
                            <FontAwesomeIcon icon={faQuestionCircle} />
                            <span className="tooltip-text">클릭하면 뜻이 보입니다</span>
                        </div>
                    </div>
                    <div className="flashcard-back">
                        <p>{wordList.words[currentIndex].definition}</p>
                    </div>
                </div>
            </div>
            <div className="flashcard-controls">
                <button onClick={handlePrevious} disabled={currentIndex === 0} className="control-btn previous-btn">
                    <FontAwesomeIcon icon={faArrowLeft} /> 이전
                </button>
                <button onClick={handleRestart} className="control-btn restart-btn">
                    <FontAwesomeIcon icon={faRedo} /> 처음부터
                </button>
                <button onClick={() => speakWord(wordList.words[currentIndex].word)} className="control-btn speak-btn">
                    <FontAwesomeIcon icon={faVolumeUp} /> 발음 듣기
                </button>
                <button onClick={handleNext} className="control-btn next-btn">
                    <FontAwesomeIcon icon={faArrowRight} /> 다음
                </button>
                <button onClick={handleQuit} className="control-btn quit-btn">
                    <FontAwesomeIcon icon={faStop} /> 학습 중단
                </button>
            </div>
            <p className="progress-text">{currentIndex + 1} / {wordList.words.length}</p>
        </div>
    );
}

export default FlashcardView;