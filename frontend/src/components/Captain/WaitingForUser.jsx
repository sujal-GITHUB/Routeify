import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setRideData } from '../../actions/rideActions';
import car from "../../assets/car.png";
import bike from "../../assets/bike.png";
import auto from "../../assets/auto.png";
import { socketContext } from '../../context/socketContext';
import axios from 'axios';

const WaitingForUser = ({ rideData, setRideStart, setRideAccepted, setNewRide }) => {
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
    socket.on("ride-confirmed", (data) => {
      dispatch(setRideData({
        ...rideData,
        otp: data.otp,
        status: 'confirmed'
      }));

      setRideStart(true);
      setRideAccepted(false);
    });

    socket.on("ride-cancelled", () => {
      console.log("Ride cancelled by user");
      dispatch(setRideData({
        pickup: "",
        destination: "",
        price: "",
        vehicletype: "",
        status: "cancelled"
      }));

      // Reset component state
      setRideAccepted(false);
      setRideStart(false);
      setNewRide(null);
    });

    return () => {
      socket.off("ride-confirmed");
      socket.off("ride-cancelled");
    };
  }, [socket, setRideStart, setRideAccepted, setNewRide, dispatch, rideData]);

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