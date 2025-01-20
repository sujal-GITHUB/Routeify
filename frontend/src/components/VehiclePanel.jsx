import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setRideData } from '../actions/rideActions';

const VehiclePanel = ({ rides, setSelectedRide }) => {
  const dispatch = useDispatch();
  const { vehicletype, price } = useSelector(state => state.ride);

  const handleRideSelect = (ride) => {
    setSelectedRide(ride.id);
    dispatch(setRideData({ 
      vehicletype: ride.id,
      price: ride.price 
    }));
  };

  return (
    <div className="mt-6 mx-1 mb-1">
      <h2 className="font-semibold mb-5">Choose a ride</h2>
      <div className="space-y-3">
        {rides.map((ride) => (
          <button
            key={ride.id}
            type="button"
            onClick={() => handleRideSelect(ride)}
            className={`w-full bg-gray-100 p-4 rounded-xl flex items-center justify-between transition-all ${
              vehicletype === ride.id ? "ring-2 ring-black" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <img src={ride.image} alt={ride.name} className="h-16 w-auto" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{ride.name}</span>
                  <span className="text-xs text-gray-600">
                    <i className="ri-user-fill" /> {ride.capacity}
                  </span>
                </div>
                <p className="text-sm text-start">{ride.waitTime} away</p>
                <p className="text-xs text-gray-600 text-start">{ride.description}</p>
              </div>
            </div>
            <span className="font-semibold">{ride.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehiclePanel;
