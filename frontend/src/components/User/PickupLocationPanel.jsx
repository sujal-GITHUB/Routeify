import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setRideData } from "../../actions/rideActions";
import { TokenManager } from "../../utils/tokenManager";
import { getFeatureDetails } from "../../utils/mapUtils";

const PickupLocationPanel = ({ input, setInput, setPickup }) => {
  const dispatch = useDispatch();
  const { pickup = "" } = useSelector((state) => state.ride) || {};
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Fallback to a default location (Delhi) if geolocation fails
          setUserLocation({
            latitude: 28.6139,
            longitude: 77.2090
          });
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 60000 // 1 minute cache for better responsiveness
        }
      );
    } else {
      // Fallback for browsers without geolocation
      setUserLocation({
        latitude: 28.6139,
        longitude: 77.2090
      });
    }

    // Generate session token for Mapbox Search Box API
    if (!sessionToken) {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      setSessionToken(uuid);
    }
  }, [sessionToken]);

  // Fetch suggestions from the backend using the input value.
  const fetchLocations = async () => {
    if (!input) {
      setLocations([]);
      return;
    }
    setLoading(true);
    try {
      const token = TokenManager.getToken('usertoken');
      const params = { address: input };
      
      // Add user location if available
      if (userLocation) {
        params.userLat = userLocation.latitude;
        params.userLon = userLocation.longitude;
      }

      // Add session token if available
      if (sessionToken) {
        params.session_token = sessionToken;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Handle the new response format with distance information
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
  const handleSelectPickup = async (location) => {
    try {
      let locationData = { formatted_address: location.formatted || location };

      // If the suggestion has a mapbox_id, get detailed coordinates
      if (location.mapbox_id && sessionToken) {
        try {
          const featureDetails = await getFeatureDetails(location.mapbox_id, sessionToken);
          
          if (featureDetails.latitude && featureDetails.longitude) {
            locationData = {
              formatted_address: featureDetails.formatted,
              latitude: featureDetails.latitude,
              longitude: featureDetails.longitude,
              feature_type: featureDetails.feature_type,
              accuracy: featureDetails.accuracy
            };
          } else {
          }
        } catch (error) {
          console.error('❌ Error getting pickup coordinates:', error);
        }
      } else if (location.latitude && location.longitude) {
        // Use direct coordinates if available
        locationData = {
          formatted_address: location.formatted,
          latitude: location.latitude,
          longitude: location.longitude
        };
      } else {
      }
      const address = locationData.formatted_address;
      
      if (setPickup) {
        // Store the full location object including coordinates
        setPickup(locationData);
      } else {
        // Store the full location object including coordinates
        dispatch(setRideData({ pickup: locationData }));
      }
      setInput(address); // Use the address string, not the object
      setLocations([]);
    } catch (error) {
      console.error('❌ Error selecting pickup location:', error);
    }
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
        locations.map((item, index) => {
          const displayText = typeof item === 'string' ? item : item.formatted;
          const distance = typeof item === 'object' && item.distance ? item.distance : null;
          
          return (
            <div
              key={index}
              onClick={() => handleSelectPickup(item)}
              className={`mb-3 bg-white w-full p-3 rounded-xl border-2 border-transparent hover:border-black active:border-black transition-all duration-300 ${
                pickup === displayText ? "border-black" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-1">
                  <i className="ri-map-pin-3-line text-gray-600"></i>
                  <h4 className="text-sm font-medium text-gray-700">
                    {displayText}
                  </h4>
                </div>
                {distance && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    distance <= 5 ? 'text-green-600 bg-green-100' : 
                    distance <= 10 ? 'text-blue-600 bg-blue-100' : 
                    'text-gray-500 bg-gray-100'
                  }`}>
                    {distance <= 1 ? 'Very Close' : 
                     distance <= 5 ? 'Nearby' : 
                     distance <= 10 ? 'Close' : 
                     `${distance.toFixed(1)} km`}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PickupLocationPanel;
