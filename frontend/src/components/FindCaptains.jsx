import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setRideData } from '../actions/rideActions';
import car from "../assets/car.png";
import bike from "../assets/bike.png";
import auto from "../assets/auto.png";
import { socketContext } from '../context/socketContext';
import axios from 'axios';

const FindCaptains = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket } = useContext(socketContext);
  const rideCreatedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { pickup, destination, vehicletype, price, _id, status } = useSelector(state => state.ride);
  const { firstname,lastname,email,id, socketId } = useSelector(state => state.user);

  const rideImages = {
    car: car,
    motorcycle: bike,
    auto: auto,
  };

  useEffect(() => {
    if (pickup && destination && vehicletype && !rideCreatedRef.current) {
      const createRide = async () => {
        try {
          const token = localStorage.getItem("usertoken");
          if (!token) {
            console.error("No user token found");
            return;
          }
  
          rideCreatedRef.current = true;
          
          const payload = {
            pickup,
            destination,
            vehicleType: vehicletype
          };
  
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/rides/create`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              }
            }
          );
          dispatch(setRideData(response.data));
        } catch (error) {
          console.error("Error creating ride:", error.response?.data || error.message);
          dispatch(setRideData({ status: 'error' }));
          rideCreatedRef.current = false;
        }
      };

      createRide();
    }
  }, [pickup, destination, vehicletype, dispatch]);

  useEffect(() => {
    if (!socket || !socketId || isNavigating) return;

    const handleRideAccepted = (data) => {
      if (!isNavigating) {
        setIsNavigating(true);
        dispatch(setRideData({ 
          ...data,
          status: 'accepted'
        }));
        navigate('/riding');
      }
    };

    const handleSocketError = (error) => {
      console.error('Socket error:', error);
      dispatch(setRideData({ status: 'error' }));
    };

    socket.emit('join', { 
      userId: id, 
      userType: 'user' 
    });

    socket.emit('request-ride', {
      rideId: _id,
      userId: id,
      pickup,
      destination,
      vehicleType: vehicletype,
      price
    });

    socket.on('ride-accepted', handleRideAccepted);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('ride-accepted', handleRideAccepted);
      socket.off('error', handleSocketError);
    };
  }, [socket, id, pickup, destination, vehicletype, price, dispatch, navigate, isNavigating]);

  // Fallback navigation based on Redux state
  useEffect(() => {
    if (status === 'accepted' && !isNavigating) {
      setIsNavigating(true);
      navigate('/riding');
    }
  }, [status, navigate, isNavigating]);

  const handleCancelRide = () => {
    if (socket) {
      socket.emit('cancel-ride', { rideId: _id });
    }
    dispatch(setRideData({
      pickup: '',
      destination: '',
      price: '',
      vehicletype: '',
      status: 'cancelled'
    }));
    rideCreatedRef.current = false;
    navigate('/home');
  };

  return (
    <div className="w-full flex flex-col items-center bg-gray-100 p-5 rounded-xl animate-fade-in">
      <h1 className="text-xl font-bold text-black w-full text-center">
        {status === 'pending' ? 'Finding captains nearby...' : 
         status === 'accepted' ? 'Captain found! Redirecting...' :
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