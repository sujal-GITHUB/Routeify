import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Captain = () => {
  const navigate = useNavigate();

  const logout = () => {
    const token = localStorage.getItem('captaintoken');

    axios
      .get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem('captaintoken');
          navigate('/captain-login');
        }
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  return (
    <div>Captain
      <button className='p-10' onClick={logout}>Logout</button>
    </div>
  )
}

export default Captain