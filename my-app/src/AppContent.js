import React from 'react';
import { Route, Routes } from 'react-router-dom';

import HomePage from './HomePage';
import QuizPage from './QuizPage';
import QuizResult from './QuizResult';
import CreateWordList from './CreateWordList';
import WordListPage from './WordListPage';
import WordListDetail from './WordListDetail';
import FlashcardView from './FlashcardView';
import EditWordList from './EditWordList';

function AppContent({ user }) {
    return (
        <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/words" element={<WordListPage user={user} />} />
            <Route path="/wordlist/:id" element={<WordListDetail user={user} />} />
            <Route path="/flashcard/:id" element={<FlashcardView />} />
            <Route path="/create-wordlist" element={<CreateWordList user={user} />} />
            <Route path="/edit-wordlist/:id" element={<EditWordList />} />
            <Route path="/quiz" element={<QuizPage user={user} />} />
            <Route path="/quiz-result" element={<QuizResult user={user} />} />
        </Routes>
    );
}

export default AppContent;