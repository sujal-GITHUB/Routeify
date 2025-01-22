import React from "react";
import { useSelector } from "react-redux";

const UserDetails = ({ onAccept, onDecline }) => {
  const { pickup, destination, price, distance, time } = useSelector(
    (state) => state.ride
  );

  return (
    <div className="bg-gray-100 h-92 w-full p-5 rounded-xl animate-slide-up mt-5">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
              src="https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg"
              alt="Profile"
            />
          </div>
          <div>
            <h2 className="font-semibold">Sunanda Sharma</h2>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mt-1">
            <i className="ri-map-pin-2-fill text-green-500"></i>
            <p className="font-medium">{pickup}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mt-1">
            <i className="ri-map-pin-2-fill text-red-500"></i>
            <p className="font-medium">{destination}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white p-3 rounded-xl text-center">
            <p className="text-sm text-gray-500">Distance</p>
            <p className="font-semibold">{distance}</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center">
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-semibold">{time}</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center">
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-semibold text-green-600">{price}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onDecline}
            className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
          >
            Ignore
          </button>
          <button
            onClick={onAccept}
            className="w-1/2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
