import React, { useEffect, useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { socketContext } from '../../context/socketContext';

const RideSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rideDetails, setRideDetails] = useState(null);
  const rideState = useSelector(state => state.ride);
  const [userRating, setUserRating] = useState(null);
  const { socket } = useContext(socketContext);

  useEffect(() => {
    const locationData = location.state;
    const reduxData = {
      pickup: rideState.pickup,
      destination: rideState.destination,
      fare: rideState.fare
    };
    const rideData = locationData || reduxData;

    if (!rideData.pickup || !rideData.destination) {
      console.log('No ride data found, redirecting to captain page');
      navigate('/captain');
      return;
    }

    setRideDetails(rideData);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Animate content
    gsap.fromTo('.success-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
    );
  }, [location.state, rideState, navigate]);

  // Listen for user rating in a separate effect to ensure real-time updates
  useEffect(() => {
    if (!socket) return;
    const handleUserRating = (data) => {
      if (data && typeof data.rating === "number") {
        setUserRating(data.rating);
      }
    };
    socket.on("user-rating", handleUserRating);
    return () => {
      socket.off("user-rating", handleUserRating);
    };
  }, [socket]);

  if (!rideDetails) {
    return null;
  }

  const handleSuccess = () => {
    navigate('/captain');
  };

  const { pickup, destination, fare } = rideDetails;

  return (
    <div className="h-screen font-lexend bg-white flex flex-col items-center justify-center p-5">
      <div className="success-content text-center mb-8">
        <div className="text-green-500 text-6xl mb-4">
          <i className="ri-checkbox-circle-line"></i>
        </div>
        <h1 className="text-2xl font-bold mb-2">Ride Completed!</h1>
        <p className="text-gray-500">Great job! You earned some credits.</p>
      </div>

      <div className="success-content w-full max-w-md bg-gray-50 rounded-xl p-5 mb-6">
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-500">From : </span>
            <span className="font-medium text-sm">{pickup}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">To : </span>
            <span className="font-medium text-sm">{destination}</span>
          </div>
          <div className="border-t pt-4">
            <span className="text-sm text-gray-500">Total Fare : </span>
            <span className="font-semibold text-sm text-green-500">₹{fare}</span>
          </div>
        </div>
      </div>

      <div className="success-content w-full max-w-md mb-8">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 mb-2">Rating Received</p>
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map((star) => (
              <span
                key={star}
                className={`text-2xl ${userRating && userRating >= star ? "text-yellow-400" : "text-gray-300"}`}
              >
                <i className="ri-star-fill"></i>
              </span>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => handleSuccess()}
        className="success-content w-full max-w-md bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
};

export default RideSuccess;