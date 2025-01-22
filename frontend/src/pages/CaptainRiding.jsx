import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import logo from "../assets/logo1.png";
import UserDetails from "../components/UserDetails";

const CaptainRiding = () => {
  const navigate = useNavigate();
  const panelRef = useRef();
  const panelContentRef = useRef();
  const panelClose = useRef(null);
  const [isPanelDown, setIsPanelDown] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const panelDown = () => {
    setIsPanelDown(true);
    const tl = gsap.timeline();
    tl.to(panelRef.current, {
      height: "10%",
      duration: 0.1,
      ease: "power3.out"
    })
    .to(panelContentRef.current, {
      duration: 0.3,
      ease: "power2.out"
    }, "-=0.3");
  };

  const panelUp = () => {
    setIsPanelDown(false);
    const tl = gsap.timeline();
    tl.to(panelRef.current, {
      height: "80%",
      duration: 0.1,
      ease: "power3.out"
    })
    .to(panelContentRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    }, "-=0.3");
  };


  return (
    <div className="h-screen font-lexend relative">
      <div className="absolute inset-0 -z-10">
        <img
          src="/image.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end">
        <div 
          ref={panelRef}
          className="bg-white p-5 rounded-t-2xl transition-all duration-500"
          style={{ height: "80%" }}
        >
          <div ref={panelContentRef} className="h-full">
            
            {/* Recent Rides */}
              <UserDetails/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptainRiding;
