import React, { useState } from 'react'
import ConfirmRide from '../components/ConfirmRide'
import logo from '../assets/logo1.png'
import gsap from "gsap";
import { useRef } from 'react';

const Riding = () => {
  const panelRef = useRef();
  const panelDownRef = useRef();
  const [isPanelDown, setIsPanelDown] = useState(false);

  const panelDown = () => {
    setIsPanelDown(true);
    gsap.to(panelRef.current, {
      height: "17%",
      opacity: 1,
      duration: 0.5,
      ease: "easeOut",
    });
  };

  const panelUp = () => {
    setIsPanelDown(false);
    gsap.to(panelRef.current, {
      height: "89%",
      opacity: 1,
      duration: 0.5,
      ease: "easeOut",
    });
  };

  return (
    <div className="h-screen font-lexend relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src="/image-copy.png" alt="Background" className="w-full h-full object-cover" />
      </div>
      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end">
        <div ref={panelRef} className="bg-white pl-5 pr-5 pb-5 pt-1 rounded-t-2xl flex flex-col">
          <button 
            ref={panelDownRef} 
            className="opacity-1 text-center transition-transform duration-300" 
            onClick={isPanelDown ? panelUp : panelDown}
          >
            <i className={`text-2xl ${isPanelDown ? 'ri-arrow-up-wide-fill' : 'ri-arrow-down-wide-fill'}`}></i>
          </button>
          <div className="flex justify-center items-center mb-5">
            <div className='h-[520px] overflow-hidden'>
              <ConfirmRide />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Riding