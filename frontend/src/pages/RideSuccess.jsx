import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

const RideSuccess = () => {
  const navigate = useNavigate();
  const { pickup, destination, price } = useSelector(state => state.ride);

  useEffect(() => {
    // Trigger confetti
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
  }, []);

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
            <p className="text-sm text-gray-500">From</p>
            <p className="font-medium">{pickup}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">To</p>
            <p className="font-medium">{destination}</p>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Total Fare</p>
            <p className="text-2xl font-bold text-green-500">{price}</p>
          </div>
        </div>
      </div>

      <div className="success-content w-full max-w-md mb-8">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 mb-2">Rating received</p>
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map((star) => (
              <button key={star} className="text-2xl text-yellow-400">
                <i className="ri-star-fill"></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => navigate('/captain')}
        className="success-content w-full max-w-md bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
};

export default RideSuccess;