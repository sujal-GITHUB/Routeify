import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'
import logo from '../assets/logo1.png';
import bgportrait from '../assets/bg-portrait.png';
import bglandscape from '../assets/bg-landscape.jpg';

const Start = () => {
  const [background, setBackground] = useState(bgportrait);

  // Function to detect screen orientation
  const handleResize = () => {
    if (window.innerHeight > window.innerWidth) {
      setBackground(bgportrait); 
    } else {
      setBackground(bglandscape); 
    }
  };

  useEffect(() => {
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize); // Listen for resize events
    return () => window.removeEventListener('resize', handleResize); // Cleanup
  }, []);

  return (
    <div
      className="h-screen bg-cover bg-center font-lexend flex flex-col justify-between"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Logo Section */}
      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20" />
      </div>

      {/* Welcome Section */}
      <div className='flex justify-center'>
      <div className="bg-white p-5 w-full md:w-[70%] xl:w-[50%] flex flex-col items-center gap-4 rounded-t-lg">
        <h2 className="text-2xl font-bold text-center">Welcome to routeify</h2>
        <Link to='/login' className="bg-black flex text-center justify-center text-white w-full p-2 rounded-md transition">
          Continue
        </Link>
      </div>
      </div>
    </div>
  );
};

export default Start;
