import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function AuthCallback({ checkLoginStatus, saveAccess }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            console.log('AuthCallback: 콜백 처리 시작');

            try {
                // 4. URL에서 access_token 추출
                const params = new URLSearchParams(location.hash.slice(1));
                const accessToken = params.get('access_token');

                if (!accessToken) {
                    throw new Error('URL에서 access_token을 찾을 수 없습니다.');
                }

                console.log('AuthCallback: access_token 감지');

                // 5. 추출한 access_token을 백엔드로 전송
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/token`, { token: accessToken });

                if (!response.data || !response.data.jwt) {
                    throw new Error('백엔드에서 유효한 JWT를 받지 못했습니다.');
                }

                const jwt = response.data.jwt;
                console.log('AuthCallback: 백엔드에서 JWT 수신');

                // JWT 저장
                saveAccess(jwt);
                console.log('AuthCallback: JWT 저장 완료');

                // 로컬 스토리지에 JWT 저장
                localStorage.setItem('Access', jwt);
                console.log('AuthCallback: JWT 로컬 스토리지에 저장 완료');

                // 로그인 상태 확인
                await checkLoginStatus();
                console.log('AuthCallback: 로그인 상태 확인 완료');

                // 홈페이지로 리다이렉트
                console.log('AuthCallback: 홈페이지로 리다이렉트');
                navigate('/', { replace: true });
            } catch (error) {
                console.error('AuthCallback: 인증 처리 중 오류 발생', error);
                setError(`인증 처리 중 오류가 발생했습니다: ${error.message}`);
            }
        };

        handleCallback();
    }, [checkLoginStatus, navigate, saveAccess, location]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return <LoadingSpinner />;
}

export default AuthCallback;