import React, { useState, useRef, useEffect } from 'react';
import ConfirmRide from '../components/ConfirmRide';
import logo from '../assets/logo1.png';
import gsap from "gsap";

const Riding = () => {
  const panelRef = useRef();
  const [isPanelDown, setIsPanelDown] = useState(false);

  // Initial setup of panel when component mounts
  useEffect(() => {
    if (panelRef.current) {
      gsap.set(panelRef.current, {
        height: 'auto'
      });
    }
  }, []);

  const togglePanel = () => {
    setIsPanelDown(!isPanelDown);
    
    gsap.to(panelRef.current, {
      height: isPanelDown ? 'auto' : '100px', // Adjust this value based on your needs
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => {
        // Optional: Update panel content after animation
        if (!isPanelDown) {
          // Handle expanded state
        }
      }
    });
  };

  return (
    <div className="h-screen font-lexend relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img 
          src="/image-copy.png" 
          alt="Background" 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Logo */}
      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20" />
      </div>

      {/* Bottom Panel */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div 
          ref={panelRef}
          className="bg-white rounded-t-2xl transition-all duration-500 ease-out"
        >
          {/* Toggle Button */}
          <button 
            className="w-full py-1 flex justify-center items-center transition-transform duration-300" 
            onClick={togglePanel}
          >
            <i className={`text-2xl ${isPanelDown ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`} />
          </button>

          {/* Panel Content */}
          <div className="px-5 pb-5">
            <div className="overflow-hidden">
              <ConfirmRide />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Riding;