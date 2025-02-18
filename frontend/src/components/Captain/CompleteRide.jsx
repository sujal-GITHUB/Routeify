import React, { useState, forwardRef, useEffect, useContext } from 'react';
import { socketContext } from '../../context/socketContext';
import { useSelector } from 'react-redux';

const CompleteRide = forwardRef(({ onAccept, rides, rideData }, ref) => {
  const [showFullP, setShowFullP] = useState(false);
  const [showFullD, setShowFullD] = useState(false);
  const captainData = useSelector((state) => state.captain);
  const { firstname, lastname, earning, rating, status, id } = captainData;

  const {socket} = useContext(socketContext);

  return (
    <div ref={ref} className='bg-gray-100 h-92 w-full p-5 rounded-xl animate-slide-up mt-5'>
      <h1 className='text-lg font-semibold text-start mb-2'>Complete Ride</h1>

      <div className='space-y-4'>
        {/* Pickup Location */}
        <div 
          className='bg-white p-4 py-2 rounded-xl shadow-sm cursor-pointer'
          onClick={() => setShowFullP(prev => !prev)}
        >
          <div className='flex items-center gap-2 mt-1'>
            <i className='ri-map-pin-2-fill text-green-500'></i>
            <div className='relative w-full'>
              <p 
                className={`font-medium transition-all duration-300 ease-in-out ${
                  showFullP ? 'max-h-[500px]' : 'max-h-7 overflow-hidden'
                }`}
              >
                {rideData?.pickup || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Destination Location */}
        <div 
          className='bg-white p-4 py-2 rounded-xl shadow-sm cursor-pointer'
          onClick={() => setShowFullD(prev => !prev)}
        >
          <div className='flex items-center gap-2 mt-1'>
            <i className='ri-map-pin-2-fill text-red-500'></i>
            <div className='relative w-full'>
              <p 
                className={`font-medium transition-all duration-300 ease-in-out ${
                  showFullD ? 'max-h-[500px]' : 'max-h-7 overflow-hidden'
                }`}
              >
                {rideData?.destination || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Ride Fare */}
        <div className='bg-white p-4 py-2 rounded-xl shadow-sm flex items-center justify-between'>
          <p className='text-gray-600 font-medium'>Ride Fare</p>
          <p className='text-lg font-semibold text-green-600'>₹{rideData?.fare || 0}</p>
        </div>

        {/* OTP Input */}
        <div className='bg-white p-2 rounded-xl shadow-sm'>
          <div className='flex items-center justify-between gap-4'>
            <label htmlFor="otp" className='text-sm font-medium text-gray-600 whitespace-nowrap'>
              Enter OTP 
            </label>
            <input 
              type="text"
              id="otp"
              maxLength={4}
              placeholder="••••"
              className='w-9/12 px-6 py-2 text-xl tracking-[0.5em] font-bold text-center 
                bg-gray-50 border-2 border-gray-200 rounded-xl 
                focus:ring-2 focus:ring-green-500 focus:border-green-500 
                placeholder:text-gray-300 
                outline-none transition-all'
            />
          </div>
        </div>

        {/* Confirm Ride Button */}
        <div className='flex gap-3 mt-6'>
          <button 
            
            className='w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition-colors font-medium'
          >
            Complete Ride
          </button>
        </div>
      </div>
    </div>
  );
});

CompleteRide.displayName = "CompleteRide";

export default CompleteRide;
