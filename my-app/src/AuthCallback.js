import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

function AuthCallback({ checkLoginStatus, saveAccessToken }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            console.log('AuthCallback: 콜백 처리 시작');
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const errorMessage = params.get('error');

            if (errorMessage) {
                console.error('AuthCallback: 에러 파라미터 감지', errorMessage);
                setError(`인증 오류: ${errorMessage}`);
                return;
            }

            if (token) {
                console.log('AuthCallback: 토큰 감지', token);
                try {
                    // 토큰에서 "Bearer " 접두사 제거 (만약 있다면)
                    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
                    console.log('AuthCallback: 정제된 토큰', cleanToken);

                    // 토큰 저장
                    saveAccessToken(cleanToken);
                    console.log('AuthCallback: 액세스 토큰 저장 완료');

                    // 로컬 스토리지에 토큰 저장
                    localStorage.setItem('accessToken', cleanToken);
                    console.log('AuthCallback: 액세스 토큰 로컬 스토리지에 저장 완료');

                    // 로그인 상태 확인
                    console.log('AuthCallback: 로그인 상태 확인 시작');
                    await checkLoginStatus();
                    console.log('AuthCallback: 로그인 상태 확인 완료');

                    // 홈페이지로 리다이렉트
                    console.log('AuthCallback: 홈페이지로 리다이렉트');
                    navigate('/', { replace: true });
                } catch (error) {
                    console.error('AuthCallback: 인증 처리 중 오류 발생', error);
                    setError(`인증 처리 중 오류가 발생했습니다: ${error.message}`);
                }
            } else {
                console.error('AuthCallback: 토큰을 찾을 수 없음');
                setError('인증 토큰을 찾을 수 없습니다. 로그인을 다시 시도해주세요.');
            }
        };

        handleCallback();
    }, [checkLoginStatus, navigate, location.search, saveAccessToken]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return <LoadingSpinner />;
}

export default AuthCallback;