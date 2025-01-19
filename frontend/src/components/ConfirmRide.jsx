import React from 'react';

const ConfirmRide = ({ pickup, destination, price, setSelectedRide }) => {
  return (
    <div className="w-full flex flex-col items-center bg-gray-100 p-5 rounded-xl animate-fade-in">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-black">Reaching to you in</h1>
        <div className="bg-black text-white rounded-full px-4 py-1 text-base">
          2 mins
        </div>
      </div>

      {/* Divider */}
      <div className="h-[2px] w-full bg-gray-300 mb-4"></div>

      {/* Driver Info */}
      <div className="w-full flex items-center space-x-4 mb-4">
        <img
          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
          src="https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg"
          alt="Driver Avatar"
        />
        <div className="text-black">
          <h5 className="text-base font-medium">John Cena</h5>
          <h2 className="text-lg font-bold">PB 10 BP 7401</h2>
          <h3 className="text-base">Yellow Porsche 911 Canvas</h3>
          <h4 className="flex items-center text-base text-yellow-500">
            <i className="ri-star-fill mr-1"></i> 4.4
          </h4>
        </div>
      </div>

      <div className="w-full flex justify-around text-xl text-white mt-6 mb-4">
        <div className="flex flex-col items-center">
          <i className="ri-shield-fill bg-blue-500 p-3 rounded-full w-12 h-12 flex items-center justify-center"></i>
          <p className="text-xs text-gray-600 mt-1">Safety</p>
        </div>
        <div className="flex flex-col items-center">
          <i className="ri-user-shared-fill bg-blue-500 p-3 rounded-full w-12 h-12 flex items-center justify-center"></i>
          <p className="text-xs text-gray-600 mt-1">Share</p>
        </div>
        <div className="flex flex-col items-center">
          <i className="ri-phone-fill bg-blue-500 p-3 rounded-full w-12 h-12 flex items-center justify-center"></i>
          <p className="text-xs text-gray-600 mt-1">Contact</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[2px] w-full bg-gray-300 mb-4"></div>

      {/* Ride Details */}
      <div className="w-full pt-4 text-gray-700 space-y-1">
        <p className="text-sm"><strong>From:</strong> {pickup}</p>
        <p className="text-sm"><strong>To:</strong> {destination}</p>
        <p className="text-sm"><strong>Total Distance:</strong> 2.3 miles</p>
        <p className="text-sm"><strong>Total Time:</strong> 2 minutes</p>
        <p className="text-sm"><strong>Total Price:</strong> <span className="text-green-600">{price}</span></p>
      </div>

      <button 
        onClick={setSelectedRide} // Direct function call like FindCaptains
        className="mt-5 bg-red-500 hover:bg-red-600 text-white w-full py-3 px-4 rounded-md transition"
      >
        Cancel ride
      </button>
    </div>
  );
};

export default ConfirmRide;
