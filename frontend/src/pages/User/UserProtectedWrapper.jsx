import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenManager } from '../../utils/tokenManager';

const UserProtectedWrapper = ({ children }) => {
  const navigate = useNavigate();
  const token = TokenManager.getToken('usertoken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]); 

  return <>{children}</>;
};

export default UserProtectedWrapper;
