import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

function AuthCallback({ checkLoginStatus, saveAccessToken, saveRefreshToken }) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(location.search);
            const name = urlParams.get('name');
            const accessToken = urlParams.get('accessToken');
            const refreshToken = urlParams.get('refreshToken');

            if (accessToken && refreshToken) {
                // Save access token to local storage
                saveAccessToken(accessToken);

                // Save refresh token to HTTP-only cookie
                saveRefreshToken(refreshToken);

                await checkLoginStatus();
                navigate('/');
            } else {
                console.error('Access token or refresh token not found in URL parameters');
                navigate('/login');
            }
        };

        handleCallback();
    }, [location, navigate, checkLoginStatus, saveAccessToken, saveRefreshToken]);

    return <LoadingSpinner />;
}

export default AuthCallback;