import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

function AuthCallback({ checkLoginStatus, saveAccessToken }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(location.search);
            const accessToken = urlParams.get('accessToken');

            if (accessToken) {
                try {
                    saveAccessToken(accessToken);
                    await checkLoginStatus();
                    toast.success('로그인 성공!');
                    navigate('/');
                } catch (error) {
                    console.error('Login process failed:', error);
                    toast.error('로그인 과정에서 오류가 발생했습니다.');
                    navigate('/login');
                }
            } else {
                console.error('Access token not found in URL parameters');
                toast.error('인증 토큰을 찾을 수 없습니다. 다시 로그인해 주세요.');
                navigate('/login');
            }
            setIsLoading(false);
        };

        handleCallback();
    }, [location, navigate, checkLoginStatus, saveAccessToken]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return null;
}

export default AuthCallback;