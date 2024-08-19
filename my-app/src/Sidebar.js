import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBook, faQuestionCircle, faBars, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from './ThemeContext';
import './Sidebar.css';

function Sidebar() {
    const location = useLocation();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isActive = (path) => location.pathname === path;

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button className="toggle-btn" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={isCollapsed ? faBars : faChevronLeft} />
            </button>
            <Link to="/" className="sidebar-header">
                <div className="logo-container">
                    <svg className="logo" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                </div>
                {!isCollapsed && <h1 className="app-title">단어퀴즈</h1>}
            </Link>
            <nav className="sidebar-nav">
                <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <FontAwesomeIcon icon={faHome} />
                    {!isCollapsed && <span>홈</span>}
                </Link>
                <Link to="/words" className={`nav-item ${isActive('/words') ? 'active' : ''}`}>
                    <FontAwesomeIcon icon={faBook} />
                    {!isCollapsed && <span>단어장</span>}
                </Link>
                <Link to="/quiz" className={`nav-item ${isActive('/quiz') ? 'active' : ''}`}>
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    {!isCollapsed && <span>퀴즈</span>}
                </Link>
            </nav>
            <div className="sidebar-footer">
                <button onClick={toggleDarkMode} className="theme-toggle">
                    {isDarkMode ? '🌞' : '🌙'}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;