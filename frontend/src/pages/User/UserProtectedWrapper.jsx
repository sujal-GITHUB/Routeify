import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProtectedWrapper = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('usertoken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]); 

  return <>{children}</>;
};

export default UserProtectedWrapper;
