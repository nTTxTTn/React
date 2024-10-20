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
            <button
                className="toggle-btn"
                onClick={toggleSidebar}
                aria-label={isCollapsed ? "사이드바 열기" : "사이드바 닫기"}
            >
                <FontAwesomeIcon icon={isCollapsed ? faBars : faChevronLeft}/>
            </button>
            <Link to="/" className="sidebar-header">
                <img
                    src={process.env.PUBLIC_URL + '/image.png'}
                    alt="폴어보카 VOCALIST"
                    className="logo-image"
                />
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
                <button
                    onClick={toggleDarkMode}
                    className="theme-toggle"
                    aria-label={isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
                >
                    {isDarkMode ? '🌞' : '🌙'}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;