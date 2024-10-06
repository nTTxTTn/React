/*import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function AuthCallback({ saveAccess, setUser }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const urlParams = new URLSearchParams(location.search);
                const code = urlParams.get('code');

                if (!code) {
                    throw new Error('Authorization code not found.');
                }

                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/oauth2/authorization/google`,
                    {},
                    {
                        headers: {
                            'access': `Bearer ${code}`
                        }
                    }
                );

                const accessToken = response.headers['access'] || response.headers['Access'];

                if (!accessToken) {
                    throw new Error('Access token not found in response headers.');
                }

                const tokenValue = accessToken.replace('Bearer ', '');
                saveAccess(tokenValue);

                const userDataResponse = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/users/myuserdata`,
                    {
                        headers: {
                            'access': `Bearer ${tokenValue}`
                        }
                    }
                );

                setUser(userDataResponse.data);
                navigate('/', { replace: true });
            } catch (error) {
                console.error('Error during authentication:', error);
                setError(`Authentication error: ${error.message}`);
            }
        };

        handleCallback();
    }, [navigate, saveAccess, setUser, location]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return <LoadingSpinner />;
}

export default AuthCallback;*/