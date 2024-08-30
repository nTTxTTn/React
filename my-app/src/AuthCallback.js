import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthCallback({ checkLoginStatus }) {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            await checkLoginStatus();
            navigate('/');  // 로그인 후 홈페이지로 리다이렉트
        };

        handleCallback();
    }, [checkLoginStatus, navigate]);

    return <div>로그인 처리 중...</div>;
}

export default AuthCallback;