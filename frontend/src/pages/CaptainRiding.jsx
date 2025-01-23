import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import logo from "../assets/logo1.png";
import UserDetails from "../components/UserDetails";

const CaptainRiding = () => {
  const navigate = useNavigate();
  const panelRef = useRef();
  const panelContentRef = useRef();
  const [isPanelDown, setIsPanelDown] = useState(false);

  const togglePanel = () => {
    const tl = gsap.timeline();
    
    if (isPanelDown) {
      tl.to(panelRef.current, {
        height: "76%",
        duration: 0.1,
        ease: "power3.out"
      })
      .to(panelContentRef.current, {
        opacity: 1,
        ease: "power2.out"
      }, "-=0.3");
    } else {
      tl.to(panelContentRef.current, {
        opacity: 1,
        ease: "power2.in"
      })
      .to(panelRef.current, {
        height: "17%",
        duration: 0.1,
        ease: "power3.out"
      }, "-=0.3");
    }
    setIsPanelDown(!isPanelDown);
  };

  return (
    <div className="h-screen font-lexend relative">
      <div className="absolute inset-0 -z-10">
        <img src="/image-copy.png" alt="Background" className="w-full h-full object-cover" />
      </div>

      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end">
        <div 
          ref={panelRef}
          className="bg-white px-5 py-2 rounded-t-2xl transition-all duration-500"
          style={{ height: "80%" }}
        >
          <button 
            onClick={togglePanel}
            className="w-full flex justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className={`text-2xl ${isPanelDown ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`} />
          </button>

          <div ref={panelContentRef} className="h-full">
            <UserDetails />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptainRiding;
