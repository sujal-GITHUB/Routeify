import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import axios from "axios";
import logo from "../assets/logo1.png";
import RecentRides from "../components/RecentRides";
import RidePopup from "../components/RidePopup";
import ConfirmRidePopup from "../components/ConfirmRidePopup";

const Captain = () => {
  const navigate = useNavigate();
  const panelRef = useRef();
  const panelContentRef = useRef();
  const panelClose = useRef(null);
  const ridePopupRef = useRef();
  const confirmRideRef = useRef();
  const [isPanelDown, setIsPanelDown] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [showConfirmRide, setShowConfirmRide] = useState(false);

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

  const logout = async () => {
    try {
      const token = localStorage.getItem("captaintoken");
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/captains/logout`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        localStorage.removeItem("captaintoken");
        navigate("/captain-login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const handleAccept = () => {
    const tl = gsap.timeline();
    
    // Hide ride popup
    tl.to(ridePopupRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      onComplete: () => {
        setShowConfirmRide(true);
      }
    });
  };

  useEffect(() => {
    // Show confirm ride popup after state update
    if (showConfirmRide && confirmRideRef.current) {
      gsap.fromTo(confirmRideRef.current,
        { 
          opacity: 0,
          scale: 0.95,
          y: 20
        },
        { 
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }
  }, [showConfirmRide]);

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
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isOnline}
                    onChange={() => setIsOnline(!isOnline)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  <span className="ms-3 text-sm font-medium">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={logout} className="text-red-500">
                  <i className="ri-logout-box-line text-xl" />
                </button>
                <button 
                  ref={panelClose}
                  onClick={isPanelDown ? panelUp : panelDown}
                  className="opacity-1 transition-transform hover:scale-110"
                >
                  <i className={`text-2xl ri-arrow-${isPanelDown ? 'up' : 'down'}-s-line`} />
                </button>
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                    src="https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg"
                    alt="Profile"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                      isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Mohan Patel</h2>
                  <div className="flex items-center gap-2">
                    <i className="ri-star-fill text-yellow-400"></i>
                    <span className="text-sm">4.8</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-semibold text-green-600">₹295</h3>
                <p className="text-sm text-gray-500">Today's Earning</p>
              </div>
            </div>

            {/* Stats Grid */}
            

            {/* Recent Rides */}
            {!showConfirmRide ? (
              <div ref={ridePopupRef}>
                <RidePopup onAccept={handleAccept} />
              </div>
            ) : (
              <div ref={confirmRideRef} style={{ opacity: 0 }}>
                <ConfirmRidePopup onAccept={() => navigate('/captain-riding')} />
              </div>
            )}
              
          </div>
        </div>
      </div>
    </div>
  );
};

export default Captain;
