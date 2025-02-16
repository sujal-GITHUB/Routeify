import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setRideData } from '../actions/rideActions';
import car from "../assets/car.png";
import bike from "../assets/bike.png";
import auto from "../assets/auto.png";
import { socketContext } from '../context/socketContext';

const FindCaptains = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {socket} = useContext(socketContext);
  const [rideStatus, setRideStatus] = useState('searching');
  const { pickup, destination, vehicletype, price, _id } = useSelector(state => state.ride);
  const { user } = useSelector(state => state.user);

  const rideImages = {
    car: car,
    motorcycle: bike,
    auto: auto,
  };

  useEffect(() => {
    if (!socket || !user?._id) return;
    socket.emit('join', { 
      userId: user._id, 
      userType: 'user' 
    });

    // Send ride request to captains
    socket.emit('request-ride', {
      rideId: _id,
      userId: user._id,
      pickup,
      destination,
      vehicleType: vehicletype,
      price
    });

    // Handle ride acceptance
    socket.on('ride-accepted', ({ captain }) => {
      setRideStatus('accepted');
      dispatch(setRideData({ captain }));
      navigate('/riding');
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setRideStatus('error');
    });

    return () => {
      socket.off('ride-accepted');
      socket.off('error');
    };
  }, [socket, user, _id, pickup, destination, vehicletype, price, dispatch, navigate]);

  const handleCancelRide = () => {
    if (socket) {
      socket.emit('cancel-ride', { rideId: _id });
    }
    dispatch(setRideData({
      pickup: '',
      destination: '',
      price: '',
      vehicletype: '',
    }));
    navigate('/home');
  };

  return (
    <div className="w-full flex flex-col items-center bg-gray-100 p-5 rounded-xl animate-fade-in">
      <h1 className="text-xl font-bold text-black w-full text-center">
        {rideStatus === 'searching' ? 'Finding captains nearby...' : 
         rideStatus === 'accepted' ? 'Captain found! Redirecting...' :
         'Error finding captain'}
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
          <p className="text-sm"><strong>Pickup:</strong> {pickup}</p>
          <p className="text-sm"><strong>Destination:</strong> {destination}</p>
          <p className="text-sm"><strong>Price:</strong> ₹{price}</p>
        </div>

        <button 
          onClick={handleCancelRide}
          className="bg-red-500 hover:bg-red-600 text-white w-full py-3 px-4 rounded-md transition"
        >
          Cancel Ride Request
        </button>
      </div>
    </div>
  );
};

export default FindCaptains;