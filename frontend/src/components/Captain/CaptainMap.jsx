import { useEffect, useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import { socketContext } from '../../context/socketContext'
import MapboxMap from '../Map/MapboxMap'
import { getRoute } from '../../utils/mapUtils'

const CaptainMap = ({ rideData = null }) => {
  const { socket } = useContext(socketContext)
  const captainData = useSelector(state => state.captain)
  const { id: captainId } = captainData

  const [captainLocation, setCaptainLocation] = useState(null)
  const [markers, setMarkers] = useState([])
  const [center, setCenter] = useState([75.57962854, 31.35785918]) // Default to Jalandhar
  const [route, setRoute] = useState(null)

  // Get captain's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCaptainLocation({ latitude, longitude });
          setCenter([longitude, latitude]);
        },
        (error) => {
          console.error('Error getting captain location:', error);
          // Keep default location
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Update captain location every 10 seconds
  useEffect(() => {
    const updateLocation = () => {
      if (navigator.geolocation && captainId) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCaptainLocation({ latitude, longitude });
            setCenter([longitude, latitude]);
            
            // Emit location to server
            socket?.emit("update-location-captain", {
              userId: captainId.trim(),
              location: { latitude, longitude },
            });
          },
          (error) => console.error("Error updating captain location:", error.message),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    };

    // Update immediately
    updateLocation();
    
    // Then update every 10 seconds
    const interval = setInterval(updateLocation, 10000);
    return () => clearInterval(interval);
  }, [captainId, socket]);

  // Update markers based on ride data
  useEffect(() => {
    const newMarkers = [];

    // Add captain location marker
    if (captainLocation) {
      newMarkers.push({
        id: 'captain',
        latitude: captainLocation.latitude,
        longitude: captainLocation.longitude,
        type: 'captain',
        title: 'Your Location'
      });
    }

    // Add ride markers if ride data is available
    if (rideData) {
      // Pickup location
      if (rideData.pickup) {
        const pickup = typeof rideData.pickup === 'string' ? 
          { formatted_address: rideData.pickup } : rideData.pickup;
        
        if (pickup.latitude && pickup.longitude) {
          newMarkers.push({
            id: 'pickup',
            latitude: pickup.latitude,
            longitude: pickup.longitude,
            type: 'pickup',
            title: 'Pickup Location',
            description: pickup.formatted_address || rideData.pickup
          });
        }
      }

      // Destination location
      if (rideData.destination) {
        const destination = typeof rideData.destination === 'string' ? 
          { formatted_address: rideData.destination } : rideData.destination;
        
        if (destination.latitude && destination.longitude) {
          newMarkers.push({
            id: 'destination',
            latitude: destination.latitude,
            longitude: destination.longitude,
            type: 'destination',
            title: 'Destination',
            description: destination.formatted_address || rideData.destination
          });
        }
      }
    }

    setMarkers(newMarkers);

    // Update map center to show all markers
    if (newMarkers.length > 0) {
      const validMarkers = newMarkers.filter(m => m.latitude && m.longitude);
      if (validMarkers.length > 0) {
        // Use first marker as center, or calculate center of all markers
        const firstMarker = validMarkers[0];
        setCenter([firstMarker.longitude, firstMarker.latitude]);
      }
    }
  }, [captainLocation, rideData]);

  // Fetch route when ride data is available
  useEffect(() => {
    const fetchRoute = async () => {
      if (!rideData) {
        setRoute(null);
        return;
      }

      try {
        const pickup = typeof rideData.pickup === 'string' ? 
          { formatted_address: rideData.pickup } : rideData.pickup;
        const destination = typeof rideData.destination === 'string' ? 
          { formatted_address: rideData.destination } : rideData.destination;

        if (pickup?.latitude && pickup?.longitude && 
            destination?.latitude && destination?.longitude) {
          const routeResult = await getRoute(
            pickup.latitude, 
            pickup.longitude, 
            destination.latitude, 
            destination.longitude
          );

          if (routeResult && routeResult.geometry) {
            setRoute(routeResult.geometry);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching route in CaptainMap:', error);
        setRoute(null);
      }
    };

    fetchRoute();
  }, [rideData]);

  return (
    <div className="absolute inset-0 -z-10">
      <MapboxMap
        center={center}
        markers={markers}
        route={route}
        showControls={false}
        className="w-full h-full"
      />
      
      {/* Map overlay for captain status */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${captainLocation ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium">
            {captainLocation ? 'Location Active' : 'Getting Location...'}
          </span>
        </div>
        {rideData && (
          <div className="mt-2 text-xs text-gray-600">
            <div>Pickup: {typeof rideData.pickup === 'string' ? rideData.pickup : rideData.pickup?.formatted_address}</div>
            <div>Destination: {typeof rideData.destination === 'string' ? rideData.destination : rideData.destination?.formatted_address}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptainMap;
