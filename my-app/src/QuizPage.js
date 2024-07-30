import React from 'react';
import { useParams } from 'react-router-dom';

const dummyData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    word: `단어 ${i + 1}`,
    definition: `정의 ${i + 1}`
}));

function QuizPage() {
    const { id } = useParams(); // URL에서 ID를 가져옵니다.
    const quizData = dummyData.find(item => item.id === parseInt(id));

    if (!quizData) {
        return <p>퀴즈 데이터를 찾을 수 없습니다.</p>;
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
