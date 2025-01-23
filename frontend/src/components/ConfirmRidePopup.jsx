import React from 'react';
import { useSelector } from 'react-redux';

const ConfirmRidePopup = ({ onAccept, onDecline }) => {
  const { pickup, destination, price, distance, time } = useSelector(state => state.ride);

  return (
    <div className='bg-gray-100 h-92 w-full p-5 rounded-xl animate-slide-up mt-5'>
      <h1 className='text-lg font-semibold text-start mb-2'>Confirm Ride</h1>
      
      <div className='space-y-4'>
        <div className='bg-white p-4 rounded-xl shadow-sm'>
          <div className='flex items-center gap-2 mt-1'>
          <i className='ri-map-pin-2-fill text-green-500'></i>
            <p className='font-medium'>{pickup}</p>
          </div>
        </div>

        <div className='bg-white p-4 rounded-xl shadow-sm'>
          <div className='flex items-center gap-2 mt-1'>
            <i className='ri-map-pin-2-fill text-red-500'></i>
            <p className='font-medium'>{destination}</p>
          </div>
        </div>

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

        <div className='flex gap-3 mt-6'>
          <button 
            onClick={onAccept}
            className='w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition-colors font-medium'
          >
            Verify & Start Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRidePopup;