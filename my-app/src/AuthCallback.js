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
                // URL의 쿼리 파라미터에서 code 추출
                const queryParams = new URLSearchParams(location.search);
                const code = queryParams.get('code');
                console.log('추출한 코드', code);

                if (!code) {
                    throw new Error('코드를 찾을 수 없습니다.');
                }

                console.log('AuthCallback: 코드 감지');

                // 코드를 헤더에 넣어 백엔드로 전송
                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/login/oauth2/code/google`,
                    {},  // 빈 객체를 body로 전송
                    {
                        headers: {
                            'Authorization': `Bearer ${code}`
                        }
                    }
                );


                // 응답 헤더에서 필요한 정보 추출 및 로컬 스토리지에 저장
                const headerAccessToken = response.headers['Access'];
                console.log('응답 헤더에서 추출한 액세스 토큰:', headerAccessToken); // 추가된 console.log

                if (headerAccessToken) {
                    localStorage.setItem('accessToken', headerAccessToken.replace('Bearer ', ''));
                    console.log('AuthCallback: 액세스 토큰 로컬 스토리지에 저장 완료');
                }

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
