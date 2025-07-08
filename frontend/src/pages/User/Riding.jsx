import React, { useState, useRef, useEffect, useContext } from "react";
import ConfirmRide from "../../components/User/ConfirmRide";
import logo from "../../assets/logo1.png";
import gsap from "gsap";
import LiveTracking from "../LiveTracking";
import axios from 'axios'; // Add this import
import { useSelector, useDispatch } from 'react-redux'; 
import { clearRide, setRideData } from '../../actions/rideActions';
import { useNavigate } from "react-router-dom";
import { socketContext } from "../../context/socketContext";

const Riding = () => {
  const panelRef = useRef();
  const [isPanelDown, setIsPanelDown] = useState(false);
  const [eta, setEta] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { captain, pickup } = useSelector((state) => state.ride);
  const { socket } = useContext(socketContext);
  const [isLoading, setIsLoading] = useState(true);

  const calculateETA = async () => {
    if (!captain?.location?.coordinates) {
      console.log('No captain coordinates available');
      return;
    }

    try {
      const [captainLong, captainLat] = captain.location.coordinates;

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/calculate-ETA`,
        {
          params: {
            captainLat: `${captainLat}`,
            captainLong: `${captainLong}`,
            pickup: pickup,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
          },
        }
      );

      if (response.data && response.data.eta) {
        const minutesToArrival = Math.ceil(response.data.eta);
        setEta(minutesToArrival);
      }
    } catch (error) {
      console.error("Error calculating ETA:", error);
      setEta(5);
    }
  };

  useEffect(() => {
    if (captain?.location?.coordinates) {
      calculateETA()
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
      const etaInterval = setInterval(() => {
        calculateETA();
      }, 15000);

      return () => {
        clearInterval(etaInterval);
      };
    }
  }, [captain?.location?.coordinates]);

  // Reset everything and go home if ride data is missing (on reload)
  useEffect(() => {
    if (!captain || !pickup) {
      dispatch(clearRide());
      dispatch(setRideData({
        user: {},
        captain: {},
        pickup: '',
        destination: '',
        price: '',
        distance: '',
        time: '',
        vehicletype: '',
        _id: '',
        otp: '',
        status: ''
      }));
      navigate('/home');
    }
  }, []); 

  const togglePanel = () => {
    const panel = panelRef.current;

    if (!isPanelDown) {
      const height = panel.offsetHeight;
      gsap.set(panel, { height: height });
      
      gsap.timeline({
        defaults: { duration: 0., ease: "power3.inOut" }
      })
      .to(panel, {
        height: 0,
        opacity: 0,
        display: "none",
        duration: 0.5,
        onComplete: () => {
          setIsPanelDown(true);
        }
      });
    } else {
      gsap.timeline({
        defaults: { duration: 0.5, ease: "power3.inOut" }
      })
      .set(panel, {
        display: "block"
      })
      .to(panel, {
        height: "auto", 
        opacity: 1,
        duration: 0.5,
        onComplete: () => {
          setIsPanelDown(false);
        }
      });
    }
  };

  return (
    <div className="h-screen font-lexend relative overflow-hidden">
      {isLoading ? (
        <div className="h-screen w-screen flex items-center justify-center bg-white">
          <svg className="animate-spin h-12 w-12 text-black" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      ) : (
        <>
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
              className="bg-white rounded-t-2xl"
              style={{
                overflow: "hidden"
              }}
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

              {/* Panel panel */}
              <div 
                className="px-5 pb-5"
                style={{ opacity: 1 }} // Set initial opacity
              >
                {/* ETA Section */}
                <div className="bg-gray-100 p-4 rounded-xl mb-4">
                  <div className="w-full flex justify-between items-center">
                    <h1 className="text-base font-bold text-black">
                      Reaching to you in
                    </h1>
                    <div className="bg-black text-white rounded-full px-4 py-1 text-md">
                      {eta !== null ? `${eta} mins` : 'Calculating...'}
                    </div>
                  </div>
                </div>

                {/* Ride Details */}
                <div ref={panelRef} className="bg-gray-100 p-4 rounded-xl overflow-hidden">
                    <ConfirmRide/>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Riding;

