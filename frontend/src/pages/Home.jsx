import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();

  const logout = () => {
    const token = localStorage.getItem('usertoken');

    axios
      .get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          // Remove token only if the response is successful
          localStorage.removeItem('usertoken');
          navigate('/login');
        }
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        // Optionally, show an error message here
      });
  };

  return (
    <div>
      <h1>Home</h1>
      <button className='p-10' onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
