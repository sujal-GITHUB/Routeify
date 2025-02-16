import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import axios from "axios";
import logo from "../assets/logo1.png";
import RecentRides from "../components/RecentRides";
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

  const [newRide, setNewRide] = useState(null);
  const [isPanelDown, setIsPanelDown] = useState(false);
  const [showConfirmRide, setShowConfirmRide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const locationIntervalRef = useRef(null);
  const captainData = useSelector((state) => state.captain);
  const { firstname, lastname, earning, rating, status, id } = captainData;

  // Fetch captain data on mount
  useEffect(() => {
    dispatch(fetchCaptainData());
    setLoading(false);
  }, [dispatch]);

  // Connect captain to socket
  useEffect(() => {
    if (!loading && id?.trim().length === 24) {
      socket.emit("join", { userType: "captain", userId: id.trim() });
    }
  }, [id, socket, loading]);

  // Update captain's location every 10 seconds
  useEffect(() => {
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (id?.trim().length === 24) {
              socket.emit("update-location-captain", {
                userId: id.trim(),
                location: { latitude, longitude },
              });
            }
          },
          (error) => console.error("Error getting location:", error.message),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    };

    locationIntervalRef.current = setInterval(updateLocation, 10000);
    return () => clearInterval(locationIntervalRef.current);
  }, [id, socket]);

  // Handle new ride request
  useEffect(() => {
    socket.on("new-ride", (data) => {
      console.log("🚖 New ride received:", data);
      setNewRide(data);
      setShowConfirmRide(true);
    });

    return () => socket.off("new-ride");
  }, [socket]);

  // Handle confirm ride animation
  useEffect(() => {
    if (showConfirmRide) {
      gsap.fromTo(
        confirmRideRef.current,
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    } else if (confirmRideRef.current) {
      gsap.to(confirmRideRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => setShowConfirmRide(false), // Delay unmounting
      });
    }
  }, [showConfirmRide]);

  // Set captain's status
  useEffect(() => {
    if (status) setIsActive(status === "active");
  }, [status]);

  if (loading) return <div>Loading captain data...</div>;

  // Toggle panel height
  const togglePanel = () => {
    setIsPanelDown((prev) => !prev);
    gsap.to(panelRef.current, {
      height: isPanelDown ? "80%" : "10%",
      duration: 0.3,
      ease: "power3.out",
    });
  };

  // Logout function
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

  // Accept ride function
  const handleAccept = () => {
    gsap.to(confirmRideRef.current, {
      opacity: 0,
      scale: 0.8,
      y: 50,
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        setShowConfirmRide(false);
        setNewRide(null);
      },
    });
  };

  // Toggle active status
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
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img src="/image.png" alt="Background" className="w-full h-full object-cover" />
      </div>

      {/* Logo */}
      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20" />
      </div>

      {/* Panel */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div ref={panelRef} className="bg-white p-5 rounded-t-2xl transition-all duration-500" style={{ height: "80%" }}>
          {/* Toggle & Logout */}
          <div className="flex justify-between items-center mb-5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isActive} onChange={toggleActiveStatus} />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 flex items-center">
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-1"}`} />
              </div>
              <span className="ms-3 text-sm font-medium">{isActive ? "Active" : "Inactive"}</span>
            </label>
            <div className="flex items-center gap-2">
              <button onClick={logout} className="text-red-500"><i className="ri-logout-box-line text-xl" /></button>
              <button onClick={togglePanel} className="text-2xl ri-arrow-down-s-line" />
            </div>
          </div>

          {/* Profile & Earnings */}
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg capitalize">{firstname} {lastname}</h2>
            <h3 className="text-2xl font-semibold text-green-600">₹{earning}</h3>
          </div>

          {/* Rides */}
          {!newRide ? <RecentRides /> : <ConfirmRidePopup ref={confirmRideRef} rideData={newRide} onAccept={handleAccept} />}
        </div>
      </div>
    </div>
  );
};

export default Captain;
