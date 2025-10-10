import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenManager } from '../../utils/tokenManager';

const CaptainProtectedWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = TokenManager.getToken('captaintoken');
      if (!token) {
        console.log('No valid captain token found, redirecting to captain login');
        navigate('/captain-login', { replace: true });
      } else {
        console.log('Valid captain token found');
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]); 

  // Show loading or nothing while checking authentication
  if (isChecking) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};

export default CaptainProtectedWrapper;
