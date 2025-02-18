import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CaptainProtectedWrapper = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('captaintoken');

  useEffect(() => {
    if (!token) {
      navigate('/captain-login');
    }
  }, [token, navigate]); 

  return <>{children}</>;
};

export default CaptainProtectedWrapper;
