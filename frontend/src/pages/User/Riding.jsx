import React, { useState, useRef, useEffect } from "react";
import ConfirmRide from "../../components/User/ConfirmRide";
import logo from "../../assets/logo1.png";
import gsap from "gsap";
import LiveTracking from "../LiveTracking";
import axios from 'axios'; // Add this import
import { useSelector } from 'react-redux'; // Add this import
import { RatingStars } from '../../components/User/ConfirmRide';

const Riding = () => {
  const panelRef = useRef();
  const [isPanelDown, setIsPanelDown] = useState(false);
  const [eta, setEta] = useState(null);
  const { captain } = useSelector((state) => state.ride);

  console.log(captain);

  const calculateETA = async () => {
    if (!captain?.location?.coordinates || !captain?.pickup) return;

    try {
      const [captainLong, captainLat] = captain.location.coordinates;

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/calculate-ETA`,
        {
          params: {
            captainLat,
            captainLong,
            destination: captain.pickup // Use captain's pickup location
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
          },
        }
      );

      const minutesToArrival = Math.ceil(response.data.eta);
      setEta(minutesToArrival);
    } catch (error) {
      console.error("Error calculating ETA:", error);
      setEta(5); // Default fallback
    }
  };

  useEffect(() => {
    if (captain?.location?.coordinates) {
      // Initial ETA calculation
      calculateETA();

      // Update ETA every 15 seconds
      const etaInterval = setInterval(calculateETA, 15000);

      return () => clearInterval(etaInterval);
    }
  }, [captain?.location]);

  useEffect(() => {
    if (panelRef.current) {
      gsap.set(panelRef.current, {
        height: "auto",
      });
    }
  }, []);

  const togglePanel = () => {
    setIsPanelDown(!isPanelDown);

    gsap.to(panelRef.current, {
      height: isPanelDown ? "auto" : "100px", // Adjust this value based on your needs
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => {
        // Optional: Update panel content after animation
        if (!isPanelDown) {
          // Handle expanded state
        }
      },
    });
  };

  return (
    <div className="h-screen font-lexend relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <LiveTracking />
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
            <i
              className={`text-2xl ${
                isPanelDown ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
              }`}
            />
          </button>

          {/* Panel Content */}
          <div className="px-5 pb-5">
            {/* ETA Section */}
            <div className="bg-gray-100 p-4 rounded-xl mb-4">
              <div className="w-full flex justify-between items-center">
                <h1 className="text-base font-bold text-black">
                  Reaching to you in
                </h1>
                <div className="bg-black text-white rounded-full px-4 py-1 text-md">
                  {eta ?? "..."} mins
                </div>
              </div>
            </div>

            {/* Ride Details */}
            <div className="bg-gray-100 p-4 rounded-xl">
                <ConfirmRide/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Riding;
