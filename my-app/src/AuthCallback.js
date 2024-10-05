console.log('AuthCallback.js 파일이 로드됨');
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';


function AuthCallback({ saveAccess, setUser }) {
    console.log('AuthCallback 컴포넌트 함수 실행됨');
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            console.log('AuthCallback: 콜백 처리 시작');

            try {
                const queryParams = new URLSearchParams(location.search);
                const code = queryParams.get('code');
                console.log('추출한 코드:', code);

                if (!code) {
                    throw new Error('코드를 찾을 수 없습니다.');
                }

                console.log('AuthCallback: 코드 감지, 백엔드로 요청 시작');

                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/login/oauth2/code/google`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${code}`
                        }
                    }
                );

                console.log('백엔드 응답 받음:', response);

                const headerAccessToken = response.headers['access'] || response.headers['Access'];
                console.log('응답 헤더에서 추출한 액세스 토큰:', headerAccessToken);

                if (headerAccessToken) {
                    const tokenValue = headerAccessToken.replace('Bearer ', '');
                    console.log('Bearer 접두사 제거한 토큰:', tokenValue);

                    console.log('saveAccess 함수 호출 전');
                    saveAccess(tokenValue);
                    console.log('saveAccess 함수 호출 후');

                    // 로컬 스토리지 저장 확인
                    console.log('로컬 스토리지 저장 직후 확인:', localStorage.getItem('access'));

                    console.log('사용자 데이터 요청 시작');
                    const userDataResponse = await axios.get(
                        `${process.env.REACT_APP_API_BASE_URL}/api/users/myuserdata`,
                        {
                            headers: {
                                'Authorization': `Bearer ${tokenValue}`
                            }
                        }
                    );
                    console.log('사용자 데이터 응답:', userDataResponse.data);
                    setUser(userDataResponse.data);
                } else {
                    console.error('액세스 토큰을 응답 헤더에서 찾을 수 없습니다.');
                }

                console.log('AuthCallback: 홈페이지로 리다이렉트');
                navigate('/', { replace: true });
            } catch (error) {
                console.error('AuthCallback: 인증 처리 중 오류 발생', error);
                setError(`인증 처리 중 오류가 발생했습니다: ${error.message}`);
            }
        };

        handleCallback();
    }, [navigate, saveAccess, setUser, location]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return <LoadingSpinner />;
}

export default AuthCallback;