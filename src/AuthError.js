import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthError = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.error('Authentication failed');
    // Redirect to the login page after a short delay
    setTimeout(() => navigate('/login'), 3000);
  }, [navigate]);

  return <div>Authentication failed. Redirecting to login...</div>;
};

export default AuthError;