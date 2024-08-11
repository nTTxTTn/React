import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './ThemeContext';
import AppContent from './AppContent';
import './ReactCSS/MergeCSS.css';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <GoogleOAuthProvider clientId="260071461232-28kfnkfhca1r8do97pc3u93nup090k6q.apps.googleusercontent.com">
                    <AppContent />
                </GoogleOAuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;