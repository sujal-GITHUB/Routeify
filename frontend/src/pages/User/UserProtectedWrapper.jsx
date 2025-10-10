import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenManager } from '../../utils/tokenManager';

const UserProtectedWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = TokenManager.getToken('usertoken');
      if (!token) {
        console.log('No valid user token found, redirecting to login');
        navigate('/login', { replace: true });
      } else {
        console.log('Valid user token found');
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

export default UserProtectedWrapper;
