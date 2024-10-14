import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

function AuthCallback({ checkLoginStatus, saveAccessToken }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    const handleCallback = useCallback(async () => {
        const urlParams = new URLSearchParams(location.search);
        const accessToken = urlParams.get('accessToken');

        console.log('Received access token:', accessToken ? 'Yes' : 'No');

        if (accessToken) {
            try {
                console.log('Saving access token...');
                saveAccessToken(accessToken);

                console.log('Checking login status...');
                await checkLoginStatus();

                console.log('Login successful');
                toast.success('로그인 성공!');
                navigate('/');
            } catch (error) {
                console.error('Login process failed:', error);
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    toast.error(`로그인 실패: ${error.response.data.message || '알 수 없는 오류'}`);
                } else if (error.request) {
                    console.error('No response received');
                    toast.error('서버 응답 없음. 네트워크를 확인해주세요.');
                } else {
                    console.error('Error details:', error.message);
                    toast.error('로그인 과정에서 오류가 발생했습니다.');
                }
                navigate('/login');
            }
        } else {
            console.error('Access token not found in URL parameters');
            toast.error('인증 토큰을 찾을 수 없습니다. 다시 로그인해 주세요.');
            navigate('/login');
        }
        setIsLoading(false);
    }, [location, navigate, checkLoginStatus, saveAccessToken]);

    useEffect(() => {
        handleCallback();
    }, [handleCallback]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return null;
}

export default AuthCallback;