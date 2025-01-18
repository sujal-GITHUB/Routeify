import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo1.png";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import PickupSearchPanel from '../components/PickupLocationPanel';
import DestinationSearchPanel from '../components/DestinationLocationPanel';
import car from "../assets/car.png";
import bike from "../assets/bike.png";
import auto from "../assets/auto.png";
import VehiclePanel from "../components/VehiclePanel";

const Home = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideOptions, setShowRideOptions] = useState(false);
  const panelRef = useRef(null);
  const panelClose = useRef(null);

  // Handle location input completion
  useEffect(() => {
    if (pickup && destination) {
      setPanelOpen(false);
      setShowRideOptions(true);
    }
  }, [pickup, destination]);

  // Panel animation with proper null checks
  useEffect(() => {
    if (!panelRef.current) return;

    const panel = panelRef.current;

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
        duration: 0.2
      }
    });

    if (panelOpen) {
      tl.set(panel, { display: "block", opacity: 0 }) // Set panel visible initially
        .to(panel, {
          height: "75%",
          opacity: 1,
          transformOrigin: "top center"
        });
    } else {
      tl.to(panel, {
        height: "0%",
        opacity: 0,
        onComplete: () => {
          panel.style.display = "none"; // Hide after animation
        }
      });
    }

    return () => {
      tl.kill();
    };
  }, [panelOpen]);

  const handleInputFocus = (inputType) => {
    setPanelOpen(true);
    setActivePanel(inputType);
  };

  const handleLocationSelect = (location, type) => {
    if (type === 'pickup') {
      setPickup(location);
    } else {
      setDestination(location);
    }
  };

  // Reset to initial state
  const resetToInitialState = () => {
    setPanelOpen(false);
    setActivePanel(null);
    setShowRideOptions(false);
    setSelectedRide(null);
    setPickup("");
    setDestination("");
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!pickup || !destination || !selectedRide) {
      alert("Please select both locations and a ride type.");
      return;
    }
    console.log("Booking:", { pickup, destination, selectedRide });
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("usertoken");
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        localStorage.removeItem("usertoken");
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const rides = [
    {
      id: "car",
      name: "Car",
      image: car,
      capacity: 4,
      waitTime: "2 mins",
      description: "Affordable, comfortable ride",
      price: "₹19.20"
    },
    {
      id: "motorcycle",
      name: "Motorcycle",
      image: bike,
      capacity: 2,
      waitTime: "2 mins",
      description: "Quick, efficient ride",
      price: "₹10.25"
    },
    {
      id: "auto",
      name: "Auto",
      image: auto,
      capacity: 4,
      waitTime: "5 mins",
      description: "Economic, traditional ride",
      price: "₹15.20"
    }
  ];

  return (
    <div className="h-screen font-lexend relative">
      <div className="absolute inset-0 -z-10">
        <img src="/image.png" alt="Background" className="w-full h-full object-cover" />
      </div>

      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="bg-white p-5 rounded-t-2xl">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-semibold">Book your ride</h4>
            <div className="flex items-center gap-2">
              <button onClick={logout} className="text-red-500">
                <i className="ri-logout-box-line text-xl" />
              </button>
                <button 
                  ref={panelClose}
                  onClick={resetToInitialState}
                  className=" opacity-1"
                >
                  <i className="ri-arrow-down-s-line text-xl" />
                </button>
            </div>
          </div>

          <form onSubmit={submitHandler} className="space-y-3">
            <div className="relative">
              <div className="relative">
                <div className="absolute h-[45px] w-0.5 top-[55px] left-5 -translate-y-1/2 bg-gray-900 rounded-full">
                  <span className="absolute top-[-10px] left-[-4px] w-2.5 h-2.5 bg-gray-900 rounded-full"></span>
                  <span className="absolute bottom-[-10px] left-[-4px] w-2.5 h-2.5 bg-gray-900 rounded-full"></span>
                </div>
              </div>
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                onFocus={() => handleInputFocus('pickup')}
                type="text"
                placeholder="Enter your pickup location"
                className={`w-full bg-gray-100 pl-10 p-3 rounded-xl text-base transition-all ${
                  activePanel === 'pickup' ? 'ring-2 ring-black' : ''
                }`}
              />

              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => handleInputFocus('destination')}
                type="text"
                placeholder="Enter your destination"
                className={`w-full bg-gray-100 pl-10 p-3 rounded-xl text-base mt-3 transition-all ${
                  activePanel === 'destination' ? 'ring-2 ring-black' : ''
                }`}
              />
            </div>

            {showRideOptions && (
              <VehiclePanel rides={rides} selectedRide={selectedRide} setSelectedRide={setSelectedRide}/>
            )}
          </form>
        </div>

        <div
          ref={panelRef}
          className="bg-gray-100 overflow-hidden transition-all"
          style={{ height: "0%", display: "none" }}
        >
          {activePanel === 'pickup' && (
            <PickupSearchPanel
              pickup={pickup}
              setPickup={(loc) => handleLocationSelect(loc, 'pickup')}
            />
          )}
          {activePanel === 'destination' && (
            <DestinationSearchPanel
              destination={destination}
              setDestination={(loc) => handleLocationSelect(loc, 'destination')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;