import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import axios from "axios";
import logo from "../assets/logo1.png";
import RecentRides from "../components/RecentRides";
import RidePopup from "../components/RidePopup";
import ConfirmRidePopup from "../components/ConfirmRidePopup";
import { useSelector, useDispatch } from "react-redux";
import { fetchCaptainData } from "../actions/captainActions";
import { socketContext } from "../context/socketContext";

const Captain = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const panelRef = useRef();
  const confirmRideRef = useRef();
  const { socket } = useContext(socketContext);

  const [isPanelDown, setIsPanelDown] = useState(false);
  const [showConfirmRide, setShowConfirmRide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const locationIntervalRef = useRef(null);
  const captainData = useSelector((state) => state.captain);
  const { firstname, lastname, earning, rating, status, id } = captainData;

  useEffect(() => {
    dispatch(fetchCaptainData());
    setLoading(false);
  }, [dispatch]);

  useEffect(() => {
 // Persistent reference to interval
  
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log({ location: { latitude, longitude } });
  
            if (id?.trim().length === 24) {
              socket.emit("update-location-captain", {
                userId: id.trim(),
                location: { latitude, longitude },
              });
            }
          },
          (error) => {
            console.error("Error getting location:", error.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };
    // Clear any existing interval before setting a new one
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
  
    // Set new interval and store reference
    locationIntervalRef.current = setInterval(updateLocation, 10000);
  
    // Cleanup function to clear interval on unmount or re-run
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [id, socket]);

  useEffect(() => {
    if (status) setIsActive(status === "active");
  }, [status]);

  if (loading) return <div>Loading captain data...</div>;

  const togglePanel = () => {
    setIsPanelDown((prev) => !prev);
    gsap.to(panelRef.current, {
      height: isPanelDown ? "80%" : "10%",
      duration: 0.3,
      ease: "power3.out",
    });
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("captaintoken");
      await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("captaintoken");
      navigate("/captain-login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const handleAccept = () => {
    gsap.to(confirmRideRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
    });
    setShowConfirmRide(true);
  };

  const toggleActiveStatus = async () => {
    try {
      const token = localStorage.getItem("captaintoken");
      const newStatus = isActive ? "inactive" : "active";
      setIsActive(!isActive);
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/update`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      setIsActive(isActive);
    }
  };

  return (
    <div className="h-screen font-lexend relative">
      <div className="absolute inset-0 -z-10">
        <img src="/image.png" alt="Background" className="w-full h-full object-cover" />
      </div>

      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end">
        <div ref={panelRef} className="bg-white p-5 rounded-t-2xl transition-all duration-500" style={{ height: "80%" }}>
          <div className="flex justify-between items-center mb-5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isActive} onChange={toggleActiveStatus} />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 flex items-center">
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </div>
              <span className="ms-3 text-sm font-medium">{isActive ? "Active" : "Inactive"}</span>
            </label>
            <div className="flex items-center gap-2">
              <button onClick={logout} className="text-red-500"><i className="ri-logout-box-line text-xl" /></button>
              <button onClick={togglePanel} className="text-2xl ri-arrow-down-s-line" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img className="h-16 w-16 rounded-full border-2 border-gray-200" src="https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg" alt="Profile" />
              <div>
                <h2 className="font-semibold text-lg capitalize">{firstname} {lastname}</h2>
                <div className="flex items-center gap-2"><i className="ri-star-fill text-yellow-400"></i><span className="text-sm">{rating}</span></div>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-semibold text-green-600">₹{earning}</h3>
              <p className="text-sm text-gray-500">Today&apos;s Earning</p>
            </div>
          </div>

          <RecentRides />
          {!showConfirmRide ? <RidePopup onAccept={handleAccept} /> : <ConfirmRidePopup onAccept={() => navigate("/captain-riding")} />}
        </div>
      </div>
    </div>
  );
};

export default Captain;
