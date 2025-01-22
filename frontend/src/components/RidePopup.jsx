import React from 'react';
import { useSelector } from 'react-redux';

const RidePopup = ({ onAccept, onDecline }) => {
  const { pickup, destination, price, distance, time } = useSelector(state => state.ride);

  return (
    <div className='bg-gray-100 h-92 w-full p-5 rounded-xl animate-slide-up mt-5'>
      <h1 className='text-lg font-semibold text-start mb-2'>New Ride Request</h1>
      
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

        <div className='grid grid-cols-3 gap-3 mt-4'>
          <div className='bg-white p-3 rounded-xl text-center'>
            <p className='text-sm text-gray-500'>Distance</p>
            <p className='font-semibold'>{distance}</p>
          </div>
          <div className='bg-white p-3 rounded-xl text-center'>
            <p className='text-sm text-gray-500'>Time</p>
            <p className='font-semibold'>{time}</p>
          </div>
          <div className='bg-white p-3 rounded-xl text-center'>
            <p className='text-sm text-gray-500'>Price</p>
            <p className='font-semibold text-green-600'>{price}</p>
          </div>
        </div>

        <div className='flex gap-3 mt-6'>
          <button 
            onClick={onDecline}
            className='w-1/2 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors'
          >
            Ignore
          </button>
          <button 
            onClick={onAccept}
            className='w-1/2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition-colors'
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default RidePopup;