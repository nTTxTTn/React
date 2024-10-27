import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faArrowLeft, faRedo, faVolumeUp, faArrowRight, faQuestionCircle, faStop } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './FlashcardView.css';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL
});

// 요청 인터셉터
api.interceptors.request.use(request => {
    console.log('Starting Request', request)
    return request
})

// 응답 인터셉터
api.interceptors.response.use(response => {
    console.log('Response:', response)
    return response
}, error => {
    console.log('Response Error:', error)
    return Promise.reject(error)
})

function FlashcardView() {
    const [wordList, setWordList] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchWordList();

        const synth = window.speechSynthesis;
        synth.cancel(); // 페이지 로드 시 이전 음성 재생 중지

        return () => {
            synth.cancel();
            setIsSpeaking(false);
        };
    }, [id]);

    // voices 로딩을 위한 useEffect
    useEffect(() => {
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };

        loadVoices();

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const fetchWordList = async () => {
        try {
            console.log('Fetching word list for id:', id);
            const response = await api.get(`/api/vocalist/show/${id}`);
            console.log('Vocalist response:', response.data);
            const wordListData = response.data;

            console.log('Fetching words for id:', id);
            const wordsResponse = await api.get(`/api/vocacontent/showall/${id}`);
            console.log('Vocacontent response:', wordsResponse.data);
            const wordsData = wordsResponse.data;

            setWordList({
                title: wordListData.title,
                words: wordsData.map(word => ({
                    id: word.id,
                    text: word.text,
                    transtext: word.transtext,
                    sampleSentence: word.sampleSentence
                }))
            });
        } catch (error) {
            console.error('Failed to fetch word list:', error);
            setError(`단어 목록을 불러오는 데 실패했습니다. 오류: ${error.message}`);
        }
    };

    const handleSpeechEnd = useCallback(() => {
        setIsSpeaking(false);
    }, []);

    const speakWord = useCallback((text) => {
        const synth = window.speechSynthesis;

        if (!synth) {
            alert('죄송합니다. 현재 브라우저에서 음성 합성을 지원하지 않습니다.');
            return;
        }

        if (isSpeaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        try {
            synth.cancel();

            const voices = synth.getVoices();
            const englishVoice = voices.find(voice =>
                voice.lang.startsWith('en-') && !voice.localService
            ) || voices[0];

            const utterance = new SpeechSynthesisUtterance(text);

            utterance.voice = englishVoice;
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onstart = () => {
                console.log('음성 재생 시작:', text);
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                console.log('음성 재생 완료');
                handleSpeechEnd();
            };

            utterance.onerror = (event) => {
                console.error('음성 재생 오류:', event);
                handleSpeechEnd();

                if (event.error === 'interrupted') {
                    console.log('음성 재생이 중단되었습니다. 다시 시도합니다.');
                    setTimeout(() => {
                        synth.speak(utterance);
                    }, 100);
                } else {
                    alert('음성 재생 중 오류가 발생했습니다. 다시 시도해주세요.');
                }
            };

            synth.speak(utterance);

        } catch (error) {
            console.error('음성 재생 시스템 오류:', error);
            handleSpeechEnd();
            alert('음성 재생 시스템에 문제가 발생했습니다. 다시 시도해주세요.');
        }
    }, [isSpeaking, handleSpeechEnd]);

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

    const handleQuit = () => {
        if (window.confirm('정말로 학습을 중단하시겠습니까?')) {
            navigate('/words');
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!wordList) return <div className="loading">단어 목록을 불러오는 중입니다...</div>;

    return (
        <div className="flashcard-view">
            <h1 className="flashcard-title">{wordList.title}</h1>
            <div className="flashcard-container">
                <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
                    <div className="flashcard-front">
                        <p>{wordList.words[currentIndex].text}</p>
                        <div className="flashcard-tooltip">
                            <FontAwesomeIcon icon={faQuestionCircle} />
                            <span className="tooltip-text">클릭하면 뜻이 보입니다</span>
                        </div>
                    </div>
                    <div className="flashcard-back">
                        <div className="meaning-section">
                            <h3>뜻</h3>
                            <p>{wordList.words[currentIndex].transtext}</p>
                        </div>
                        <div className="example-section">
                            <h3>예문</h3>
                            <p>{wordList.words[currentIndex].sampleSentence}</p>
                        </div>
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
                <button
                    onClick={() => speakWord(wordList.words[currentIndex].text)}
                    className={`control-btn speak-btn ${isSpeaking ? 'speaking' : ''}`}
                    disabled={!window.speechSynthesis}
                >
                    <FontAwesomeIcon icon={faVolumeUp} />
                    {isSpeaking ? '중지' : '발음 듣기'}
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