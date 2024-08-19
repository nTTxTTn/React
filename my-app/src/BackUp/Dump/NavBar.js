import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import logo from '../../logo.svg';
import '../TestFile/App.css';

function NavBar({ user, setUser }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState('');

    useEffect(() => {
        const path = location.pathname;
        if (path === '/words') {
            setCurrentPage('단어장 목록');
        } else if (path === '/quiz') {
            setCurrentPage('단어 퀴즈');
        } else {
            setCurrentPage('');
        }
    }, [location]);

    const handleLogoClick = () => {
        navigate('/');
        setCurrentPage('');
    };

    const onLoginSuccess = (credentialResponse) => {
        const userObject = jwtDecode(credentialResponse.credential);
        console.log('로그인 성공:', userObject);
        setUser(userObject);
    };

    const onLoginFailure = () => {
        console.log('로그인 실패');
    };

    return (
        <div className="nav-bar">
            <div className="nav-left">
                <img
                    src={logo}
                    alt="Logo"
                    className="logo"
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                />
            </div>
            <div className="nav-center">
                <h1 className="app-title">{currentPage || '단어퀴즈'}</h1>
            </div>
            <div className="nav-right">
                {user ? (
                    <div className="user-info">
                        <img src={user.picture} alt={user.name} style={{width: '30px', borderRadius: '50%'}} />
                        <span>{user.name}</span>
                        <button onClick={() => setUser(null)}>Logout</button>
                    </div>
                ) : (
                    <GoogleLogin
                        onSuccess={onLoginSuccess}
                        onError={onLoginFailure}
                    />
                )}
            </div>
        </div>
    );
}

export default NavBar;