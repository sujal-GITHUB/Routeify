import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearRide } from '../../actions/rideActions';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { useDispatch, useSelector } from 'react-redux';
import { socketContext } from '../../context/socketContext';

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rideState = useSelector(state => state.ride);
  const [rideDetails, setRideDetails] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const { socket } = useContext(socketContext);
  const dispatch = useDispatch();

  useEffect(() => {
    const locationData = location.state;
    const reduxData = {
      pickup: rideState.pickup,
      destination: rideState.destination,
      fare: rideState.fare
    };
    const rideData = locationData || reduxData;

    // Redirect to /home if no ride data, not /captain
    if (!rideData.pickup || !rideData.destination) {
      console.log('No ride data found, redirecting to home page');
      navigate('/home');
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

    return () => {
      gsap.killTweensOf('.success-content');
    };
  }, [location.state, rideState, navigate]);

  if (!rideDetails) {
    return null;
  }

  const handleSuccess = () => {
    dispatch(clearRide());
    navigate('/home');
  };

  const handleStarClick = (star) => {
    if (ratingSubmitted) return;
    setUserRating(star);
    if (socket && rideDetails) {
      socket.emit("user-rating", {
        rideId: rideState._id || rideDetails.rideId,
        rating: star,
        captainId: rideState.captain?._id || rideState.captain?.id,
      });
    }
    setRatingSubmitted(true);
    setTimeout(() => {
      dispatch(clearRide());
      navigate('/home');
    }, 1000);
  };

  const { pickup, destination, fare } = rideDetails;

  return (
    <div className="h-screen font-lexend bg-white flex flex-col items-center justify-center p-5">
      <div className="success-content text-center mb-8">
        <div className="text-green-500 text-6xl mb-4">
          <i className="ri-checkbox-circle-line"></i>
        </div>
        <h1 className="text-2xl font-bold mb-2">Ride Completed!</h1>
        <p className="text-gray-500">Great! You reached your destination.</p>
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
          <p className="text-sm text-gray-500 mb-2">Rate your driver</p>
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map((star) => (
              <button
                key={star}
                className={`text-2xl ${userRating >= star ? "text-yellow-400" : "text-gray-300"} ${ratingSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}
                onClick={() => handleStarClick(star)}
                disabled={ratingSubmitted}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <i className="ri-star-fill"></i>
              </button>
            ))}
          </div>
          {ratingSubmitted && (
            <p className="text-green-600 mt-2 text-sm">Thank you for rating!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;