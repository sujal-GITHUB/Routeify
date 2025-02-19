import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setRideData } from '../../actions/rideActions';
import car from "../../assets/car.png";
import bike from "../../assets/bike.png";
import auto from "../../assets/auto.png";
import { socketContext } from '../../context/socketContext';
import axios from 'axios';

const FindCaptains = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket } = useContext(socketContext);
  const rideCreatedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const ride = useSelector(state => state.ride);
  const user = useSelector(state => state.user);

  const rideImages = {
    car: car,
    motorcycle: bike,
    auto: auto,
  };

  useEffect(() => {
    if (ride.pickup && ride.destination && ride.vehicletype && !rideCreatedRef.current) {
      const createRideAndEmit = async () => {
        try {
          const token = localStorage.getItem("usertoken");
          if (!token) {
            console.error("No user token found");
            return;
          }

          rideCreatedRef.current = true;

          const payload = {
            user: user.id,
            pickup: ride.pickup,
            destination: ride.destination,
            vehicleType: ride.vehicletype,
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

          if (response.data?._id) {
            const rideData = { ...response.data, rideId: response.data._id };
            dispatch(setRideData(rideData));

            // Emit socket events after successful ride creation
            socket.emit('join', { 
              userId: user.id, 
              userType: 'user' 
            });

            socket.emit('request-ride', {
              rideId: rideData._id,
              userId: user.id,
              pickup: ride.pickup,
              destination: ride.destination,
              vehicleType: ride.vehicletype,
              price: ride.price
            });
          } else {
            console.error('Ride creation failed. Ride ID is missing.');
            dispatch(setRideData({ status: 'error' }));
          }
        } catch (error) {
          console.error("Error creating ride:", error.response?.data || error.message);
          dispatch(setRideData({ status: 'error' }));
          rideCreatedRef.current = false;
        }
      };

      createRideAndEmit();
    }
  }, [ride.pickup, ride.destination, ride.vehicletype, dispatch, user.id, socket]);

  useEffect(() => {
    if (!socket || isNavigating) return;

    const handleRideAccepted = (data) => {
      if (!isNavigating) {
        setIsNavigating(true);
    
        // Update the ride data with the received captain and other ride details
        const updatedRideData = {
          ...ride,
          status: 'accepted',
          captain: data.captain, 
          rideId: data.rideId,
          otp: data.otp,  
        };

        dispatch(setRideData(updatedRideData));
        navigate('/riding');
      }
    };

    const handleSocketError = (error) => {
      console.error('Socket error:', error);
      dispatch(setRideData({ status: 'error' }));
    };

    socket.on('ride-accepted', handleRideAccepted);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('ride-accepted', handleRideAccepted);
      socket.off('error', handleSocketError);
    };
  }, [socket, navigate, isNavigating, dispatch, ride]);

  useEffect(() => {
    if (ride.status === 'accepted' && !isNavigating) {
      setIsNavigating(true);
      navigate('/riding');
    }
  }, [ride.status, navigate, isNavigating]);

  const handleCancelRide = () => {
    if (socket && ride._id) {
      socket.emit('cancel-ride', { rideId: ride._id });
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
        Finding captains nearby...
      </h1>

      <div className="w-full flex flex-col items-center space-y-4">
        {ride.vehicletype && rideImages[ride.vehicletype] && (
          <img
            src={rideImages[ride.vehicletype]}
            alt={`${ride.vehicletype} image`}
            className="h-60 object-contain w-full max-w-md"
          />
        )}

        <div className="pt-4 w-full border-t border-gray-300 text-gray-700 space-y-1 px-0">
          <p className="text-sm"><strong>Pickup:</strong> {ride.pickup}</p>
          <p className="text-sm"><strong>Destination:</strong> {ride.destination}</p>
          <p className="text-sm"><strong>Price:</strong> ₹{ride.price}</p>
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