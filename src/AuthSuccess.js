import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // You can perform any necessary actions here, like updating app state
    console.log('Authentication successful');
    // Redirect to the main page or dashboard after a short delay
    setTimeout(() => navigate('/'), 3000);
  }, [navigate]);

  return <div>Authentication successful! Redirecting...</div>;
};

export default AuthSuccess;