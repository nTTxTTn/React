/*import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AuthSuccess({ setUser, saveAccess }) {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthSuccess = async () => {
            try {
                // 응답 헤더에서 액세스 토큰 추출
                const accessToken = getAccessTokenFromHeader();

                if (accessToken) {
                    // Bearer 접두사 제거
                    const token = accessToken.startsWith('Bearer ') ? accessToken.slice(7) : accessToken;

                    // 토큰 저장
                    saveAccess(token);

                    // 사용자 정보 요청
                    const userResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/myuserdata`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    setUser(userResponse.data);
                    navigate('/');
                } else {
                    console.error('Access token not found in response header');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error during authentication:', error);
                navigate('/login');
            }
        };

        handleAuthSuccess();
    }, [navigate, setUser, saveAccess]);

    // 응답 헤더에서 액세스 토큰을 추출하는 함수
    const getAccessTokenFromHeader = () => {
        return new URLSearchParams(window.location.search).get('Access');
    };

    return <div>Authentication successful. Redirecting...</div>;
}

export default AuthSuccess;*/