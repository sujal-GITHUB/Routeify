import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenManager } from '../../utils/tokenManager';

const CaptainProtectedWrapper = ({ children }) => {
  const navigate = useNavigate();
  const token = TokenManager.getToken('captaintoken');

  useEffect(() => {
    if (!token) {
      navigate('/captain-login');
    }
  }, [token, navigate]); 

  return <>{children}</>;
};

export default CaptainProtectedWrapper;
