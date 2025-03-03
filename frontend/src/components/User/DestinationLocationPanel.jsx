import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setRideData } from "../../actions/rideActions";

const DestinationLocationPanel = ({ destination, setDestination }) => {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch destination suggestions using the destination value.
  const fetchLocations = async () => {
    if (!destination) {
      setLocations([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          // Now using ?address=...
          params: { address: destination },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
          },
        }
      );
      // Check if the API returns an array directly;
      // otherwise try to access a "locations" key from the returned data.
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

  // Debounce fetching suggestions whenever the destination input changes.
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchLocations();
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [destination]);

  // Handle selecting a destination suggestion.
  const handleSelectDestination = (location) => {
    dispatch(setRideData({ destination: location }));
    setDestination(location);
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
            onClick={() => handleSelectDestination(item)}
            className={`mb-3 bg-white w-full p-3 rounded-xl border-2 border-transparent hover:border-black active:border-black transition-all duration-300 ${
              destination === item ? "border-black" : ""
            }`}
          >
            <div className="flex items-center gap-2 w-full">
              <i className="ri-map-pin-3-line text-gray-600"></i>
              <h4 className="text-sm font-medium text-gray-700">{item}</h4>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DestinationLocationPanel;
