import React, { useEffect, useState } from 'react';
import { useUser } from './UserContext';
import '../TestFile/ProgressTracker.css';

const ProgressTracker = () => {
    const { user } = useUser();
    const [progress, setProgress] = useState({});

    useEffect(() => {
        if (user) {
            const userProgress = JSON.parse(localStorage.getItem(`progress_${user.sub}`)) || {};
            setProgress(userProgress);
        }
    }, [user]);

    const updateProgress = (wordListId, completed) => {
        const newProgress = { ...progress, [wordListId]: completed };
        setProgress(newProgress);
        localStorage.setItem(`progress_${user.sub}`, JSON.stringify(newProgress));
    };

    return (
        <div className="progress-tracker">
            <h2 className="progress-title">학습 진도</h2>
            {Object.entries(progress).length > 0 ? (
                Object.entries(progress).map(([wordListId, completed]) => (
                    <div key={wordListId} className="progress-item">
                        <span className="wordlist-name">단어장 {wordListId}</span>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{width: `${completed}%`}}
                            ></div>
                        </div>
                        <span className="progress-percentage">{completed}% 완료</span>
                    </div>
                ))
            ) : (
                <p className="no-progress">아직 학습 진도가 없습니다.</p>
            )}
        </div>
    );
};

export default ProgressTracker;