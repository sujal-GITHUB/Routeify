import { useEffect, useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import { socketContext } from '../context/socketContext'
import { FaLocationArrow } from 'react-icons/fa'
import { getDistanceTime, getRoute } from '../utils/mapUtils'
import MapboxMap from '../components/Map/MapboxMap'

function LiveTracking() {
  const { socket } = useContext(socketContext);
  const { pickup, destination, captain } = useSelector(state => state.ride);

  const [captainLocation, setCaptainLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [markers, setMarkers] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [route, setRoute] = useState(null);
  const [routeData, setRouteData] = useState({
    lastPickup: null,
    lastDestination: null,
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting user location:', error);
          setUserLocation({ latitude: 20.5937, longitude: 78.9629 });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Captain location update listener
  useEffect(() => {
    if (!socket) return;

    socket.on('captain-location-update', (data) => {
      if (data.location) {
        setCaptainLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude
        });
      }
    });

    return () => socket.off('captain-location-update');
  }, [socket]);

  // Update markers based on locations
  useEffect(() => {
    const newMarkers = [];
    
    if (pickup) {
      const lat = pickup.latitude || pickup.lat;
      const lng = pickup.longitude || pickup.lng;
      if (lat && lng) {
        newMarkers.push({
          latitude: lat,
          longitude: lng,
          color: '#10B981',
          popup: 'Pickup Location'
        });
      }
    }
    
    if (destination) {
      const lat = destination.latitude || destination.lat;
      const lng = destination.longitude || destination.lng;
      if (lat && lng) {
        newMarkers.push({
          latitude: lat,
          longitude: lng,
          color: '#EF4444',
          popup: 'Destination'
        });
      }
    }
    
    if (captainLocation && captainLocation.latitude && captainLocation.longitude) {
      newMarkers.push({
        latitude: captainLocation.latitude,
        longitude: captainLocation.longitude,
        color: '#3B82F6',
        popup: 'Captain'
      });
    }
    
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      newMarkers.push({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        color: '#8B5CF6',
        popup: 'Your Location'
      });
    }
    
    setMarkers(newMarkers);
  }, [pickup, destination, captainLocation, userLocation]);

  // Calculate distance and time when pickup and destination are available
  useEffect(() => {
    const calculateRouteInfo = async () => {
      if (!pickup || !destination) {
        setDistance('');
        setDuration('');
        return;
      }

      try {
        setIsCalculating(true);
        const result = await getDistanceTime(pickup, destination);
        
        if (result && result.distance && result.duration) {
          setDistance(result.distance);
          setDuration(result.duration);
          
          // Fetch route geometry for visualization
          try {
            // Check if we have coordinate data
            const pickupHasCoords = pickup && typeof pickup === 'object' && pickup.latitude && pickup.longitude;
            const destinationHasCoords = destination && typeof destination === 'object' && destination.latitude && destination.longitude;
            
            if (pickupHasCoords && destinationHasCoords) {
              const routeResult = await getRoute(pickup.latitude, pickup.longitude, destination.latitude, destination.longitude);
              if (routeResult && routeResult.geometry) {
                setRoute(routeResult.geometry);
              }
            }
          } catch (routeError) {
            console.error('❌ Error fetching route geometry in LiveTracking:', routeError);
          }
        }
      } catch (error) {
        console.error('Error calculating distance and time:', error);
        setDistance('');
        setDuration('');
      } finally {
        setIsCalculating(false);
      }
    };

    calculateRouteInfo();
  }, [pickup, destination]);

  // Calculate center point for map
  const getMapCenter = () => {
    // Validate captain location
    if (captainLocation && captainLocation.longitude && captainLocation.latitude) {
      return [captainLocation.longitude, captainLocation.latitude];
    }
    
    // Validate pickup location
    if (pickup) {
      const lng = pickup.longitude || pickup.lng;
      const lat = pickup.latitude || pickup.lat;
      if (lng && lat) {
        return [lng, lat];
      }
    }
    
    // Validate user location
    if (userLocation && userLocation.longitude && userLocation.latitude) {
      return [userLocation.longitude, userLocation.latitude];
    }
    
    // Default to India
    return [78.9629, 20.5937];
  };

  return (
    <div className="relative w-screen h-screen">
      <MapboxMap
        center={getMapCenter()}
        zoom={15}
        markers={markers}
        route={route}
        className="w-full h-full"
        onLocationSelect={(location) => {
        }}
      />

      <div className="absolute top-4 right-4 bg-white p-4 py-2 rounded-lg shadow-md max-w-sm z-10">
        <div className="flex items-center gap-2 mb-2">
          <FaLocationArrow className="text-blue-500" />
          <span className="text-gray-700 text-sm font-medium">Live Tracking</span>
        </div>
        <div className="space-y-1">
          {isCalculating ? (
            <p className="text-gray-500 text-xs">Calculating...</p>
          ) : (
            <>
              {distance && (
                <div className="flex items-center gap-2">
                  <i className="ri-road-map-line text-blue-500"></i>
                  <p className="text-gray-700 text-xs font-medium">Distance: {distance}</p>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-2">
                  <i className="ri-time-line text-green-500"></i>
                  <p className="text-gray-700 text-xs font-medium">ETA: {duration}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Captain info panel */}
      {captain && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-md max-w-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {captain.fullname?.firstname?.[0] || 'C'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {captain.fullname?.firstname} {captain.fullname?.lastname}
              </p>
              <p className="text-sm text-gray-600">
                {captain.vehicle?.vehicleType} • {captain.vehicle?.color}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveTracking;