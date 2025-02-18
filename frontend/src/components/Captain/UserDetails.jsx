import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

const UserDetails = ({ onDecline }) => {
  const navigate = useNavigate();
  const { pickup, destination, price, distance, time } = useSelector(
    (state) => state.ride
  );

  const onAccept = () =>{
    navigate('/ride-success');
  }

  return (
    <div 
      className="bg-white rounded-t-2xl transition-all duration-300"
      style={{ height: "85%" }}
    >
      <div className='bg-yellow-400 p-4 rounded-xl text-center mb-4'> 
         4 kms away
      </div>

      <div className="space-y-4">
        {/* User Profile */}
        <div className="bg-gray-100 p-4 rounded-xl">
          <div className="flex items-center gap-4">
            <img
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
            src="https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg"
              
            />
            <div>
              <h2 className="font-semibold text-lg">John Doe</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <i className="ri-timer-line"></i>
                <span>Reach in 4 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ride Details */}
        <div className="bg-gray-100 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <i className="ri-map-pin-2-fill text-green-500"></i>
            <div>
              <p className="text-sm text-gray-500">Pickup</p>
              <p className="font-medium">{pickup}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-map-pin-2-fill text-red-500"></i>
            <div>
              <p className="text-sm text-gray-500">Destination</p>
              <p className="font-medium">{destination}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <p className="text-sm text-gray-500">Distance</p>
            <p className="font-semibold">{distance}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-semibold">{time}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-xl text-center">
            <p className="text-sm text-gray-500">Fare</p>
            <p className="font-semibold text-green-600">{price}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button 
            onClick={onDecline}
            className="w-1/2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition-all active:scale-95"
          >
            Accept Payment
          </button>
          <button 
            onClick={onAccept}
            className="w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl transition-all active:scale-95"
          >
            Complete Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
