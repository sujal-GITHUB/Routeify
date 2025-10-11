import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'
import logo from '../assets/logo2.png';
import bgportrait from '../assets/bg-portrait.png';
import bglandscape from '../assets/bg_landscape.png';
import globe from '../assets/globe.png';

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
    <div className="h-screen font-lexend flex flex-col relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 flex items-start lg:items-center justify-center min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 pt-28 md:pt-10 lg:py-12">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Globe Image - First on mobile, second on desktop */}
          <div className="flex justify-center relative mt-0 lg:items-center lg:justify-center lg:mt-0 order-1 lg:order-2">
            <div className="relative flex justify-center w-full max-w-[350px] sm:max-w-[400px] md:max-w-[450px] lg:ml-20 lg:max-w-[550px]">
              {/* Globe Image */}
              <div className="relative w-full h-full flex justify-center lg:items-center lg:justify-center">
                <img 
                  src={globe} 
                  alt="Globe" 
                  className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Content - Second on mobile, first on desktop */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-3">
                Tap. Ride. Arrive<br />
                Anytime, Anywhere.
              </h2>
            </div>
            
            <p className="hidden lg:block text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Say goodbye to waiting and hello to instant rides. Routeify connects you with nearby drivers in seconds, offering fast, safe, and affordable travel at your fingertips.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Logo Section */}
        <div className="p-5">
          <img src={logo} alt="Routeify Logo" className="w-20" />
        </div>

        

        {/* Welcome Section */}
        <div className='flex justify-center px-4'>
          <div className="bg-white/90 backdrop-blur-sm p-6 w-full md:w-[70%] xl:w-[50%] flex flex-col items-center gap-4 rounded-t-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-800">Welcome to Routeify</h2>

            <Link to='/login' className="bg-black hover:bg-gray-800 flex text-center justify-center text-white w-full p-3 rounded-md transition-all duration-300 font-medium">
              Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;
