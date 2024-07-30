import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function QuizPage() {
    const { id } = useParams(); // URL에서 ID를 가져옵니다.
    const [quizData, setQuizData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:3001/words/${id}`)
            .then(response => response.json())
            .then(data => setQuizData(data))
            .catch(error => console.error('Error fetching quiz data:', error));
    }, [id]);

    if (!quizData) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>퀴즈 페이지</h1>
            <p>단어장 ID: {id}</p>
            <h2>{quizData.word}</h2>
            <p>{quizData.definition}</p>
            {/* 퀴즈 내용을 여기서 표시하세요 */}
        </div>
    );
}

export default QuizPage;
