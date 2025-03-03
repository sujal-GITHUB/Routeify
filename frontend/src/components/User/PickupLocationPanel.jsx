import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setRideData } from "../../actions/rideActions";

const PickupLocationPanel = ({ input, setInput, setPickup }) => {
  const dispatch = useDispatch();
  const { pickup = "" } = useSelector((state) => state.ride) || {};
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch suggestions from the backend using the input value.
  const fetchLocations = async () => {
    if (!input) {
      setLocations([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: { address: input },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
          },
        }
      );
      // If the API returns an array directly, use it.
      const suggestions = Array.isArray(response.data)
        ? response.data
        : response.data.locations || [];
      setLocations(suggestions);
      setError(null);
    } catch (err) {
      setError("Failed to fetch locations");
      console.error(err);
    }
    setLoading(false);
  };

  // Debounce the fetch call whenever "input" changes.
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchLocations();
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [input]);

  // Handle selecting a pickup location.
  const handleSelectPickup = (location) => {
    if (setPickup) {
      setPickup(location);
    } else {
      dispatch(setRideData({ pickup: location }));
    }
    setInput(location);
    setLocations([]);
  };

  return (
    <div className="p-3">
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <svg className="animate-spin h-7 w-7 text-black" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : (
        locations.map((item, index) => (
          <div
            key={index}
            onClick={() => handleSelectPickup(item)}
            className={`mb-3 bg-white w-full p-3 rounded-xl border-2 border-transparent hover:border-black active:border-black transition-all duration-300 ${
              pickup === item ? "border-black" : ""
            }`}
          >
            <div className="flex items-center gap-2 w-full">
              <i className="ri-map-pin-3-line text-gray-600"></i>
              <h4 className="text-sm font-medium text-gray-700">
                {item}
              </h4>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PickupLocationPanel;
