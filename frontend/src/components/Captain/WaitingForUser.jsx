import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setRideData } from '../../actions/rideActions';
import car from "../../assets/car.png";
import bike from "../../assets/bike.png";
import auto from "../../assets/auto.png";
import { socketContext } from '../../context/socketContext';
import axios from 'axios';

const WaitingForUser = ({ rideData, setRideStart, setRideAccepted }) => {
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
      vehicletype: '',
    }));
    rideCreatedRef.current = false;
    setShowFindCaptains(false);
  };

  useEffect(() => {
    socket.on("ride-confirmed", () => {
      setRideStart(true);
      setRideAccepted(false);
    });

    socket.on("ride-cancelled", () => {
      setRideAccepted(false);
      setRideStart(false);
    });

    return () => {
      socket.off("ride-confirmed");
      socket.off("ride-cancelled");
    };
  }, [socket, setRideStart, setRideAccepted]);

  return (
    <div className="w-full flex flex-col items-center bg-gray-100 p-5 rounded-xl animate-fade-in mt-6">
      <h1 className="text-xl font-bold text-black w-full text-center mb-4">
        Waiting for user confirmation...
      </h1>

      <div className="w-full space-y-4">
        <div className="bg-white p-4 rounded-xl space-y-2">
          <div>
            <p className="text-sm text-gray-500">Pickup Location</p>
            <p className="font-medium">{rideData?.pickup}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Destination</p>
            <p className="font-medium">{rideData?.destination}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Fare</p>
            <p className="font-semibold text-green-600">₹{rideData?.fare}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="animate-spin text-3xl text-green-500">
            <i className="ri-loader-4-line"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForUser;