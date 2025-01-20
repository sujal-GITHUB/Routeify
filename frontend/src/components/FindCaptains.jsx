import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import car from "../assets/car.png";
import bike from "../assets/bike.png";
import auto from "../assets/auto.png";

const FindCaptains = ({ setSelectedRide }) => {
  const [countdown, setCountdown] = useState(10);
  const { pickup, destination, vehicletype, price } = useSelector(state => state.ride);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const rideImages = {
    car: car,
    motorcycle: bike,
    auto: auto,
  };

  return (
    <div className="w-full flex flex-col items-center bg-gray-100 p-5 rounded-xl animate-fade-in">
      <h1 className="text-xl font-bold text-black w-full text-center">
        Finding captains nearby... {countdown}s
      </h1>
      <div className="w-full flex flex-col items-center space-y-4">
        {vehicletype && rideImages[vehicletype] && (
          <img
            src={rideImages[vehicletype]}
            alt={`${vehicletype} image`}
            className="h-60 object-contain w-full max-w-md"
          />
        )}
        <div className="pt-4 w-full border-t border-gray-300 text-gray-700 space-y-1 px-0">
          <p className="text-sm"><strong>Pickup :</strong> {pickup}</p>
          <p className="text-sm"><strong>Destination :</strong> {destination}</p>
          <p className="text-sm"><strong>Price :</strong> {price}</p>
        </div>
        <button onClick={setSelectedRide} className="bg-red-500 hover:bg-red-600 text-white w-full py-3 px-4 rounded-md transition">
          Cancel ride
        </button>
      </div>
    </div>
  );
};

export default FindCaptains;
