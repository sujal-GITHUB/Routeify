import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRideData } from '../actions/rideActions';
import axios from 'axios';

const VehiclePanel = ({ rides, setSelectedRide }) => {
  const dispatch = useDispatch();
  const { pickup = "", destination = "", vehicletype, price = "" } = useSelector((state) => state.ride) || {};
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRideSelect = (ride) => {
    setSelectedRide(ride.id);
    dispatch(setRideData({
      vehicletype: ride.id,
      price: fare ? fare[ride.id] : ride.price // Use fetched fare if available
    }));
  };

  useEffect(() => {
    const fetchFare = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/fare`, {
          params: { pickup, destination },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('usertoken')}`
          }
        });

        setFare(response.data);
      } catch (err) {
        setError(err.response ? err.response.data : { message: 'An error occurred' });
      } finally {
        setLoading(false);
      }
    };

    if (pickup && destination) {
      fetchFare();
    }
  }, [pickup, destination]);

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
            <span className="font-semibold">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              ) : (
                `₹${fare ? fare[ride.id] || ride.price : ride.price}`
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehiclePanel;
