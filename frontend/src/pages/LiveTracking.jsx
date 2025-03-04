import { useEffect, useContext, useRef, useState, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { socketContext } from '../context/socketContext'
import { FaLocationArrow } from 'react-icons/fa'
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'

const libraries = ['places']
const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

function LiveTracking() {
  // 1. First declare all refs
  const mapRef = useRef(null);

  // 2. Then context and selectors
  const { socket } = useContext(socketContext);
  const { pickup, destination, captain } = useSelector(state => state.ride);

  // 3. Then all state declarations
  const [map, setMap] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [routeData, setRouteData] = useState({
    lastPickup: null,
    lastDestination: null,
  });

  // 4. Google Maps loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // 5. Memoized values
  const centerLocation = useMemo(() => {
    if (captainLocation) return captainLocation;
    if (pickup) return pickup;
    if (userLocation) return userLocation;
    return { lat: 20.5937, lng: 78.9629 }; // Default to India
  }, [captainLocation, pickup, userLocation]);

  // 6. Callbacks
  const onLoad = useCallback(map => {
    mapRef.current = map;
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
  }, []);

  // 7. Effects
  useEffect(() => {
    if (!pickup || !destination) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error('Error getting user location:', error);
            setUserLocation({ lat: 20.5937, lng: 78.9629 });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [pickup, destination]);

  useEffect(() => {
    if (!socket || !captain?.location?.coordinates) return;

    const [longitude, latitude] = captain.location.coordinates;
    setCaptainLocation({
      lat: latitude,
      lng: longitude
    });

    const handleLocationUpdate = (data) => {
      if (data.location) {
        setCaptainLocation({
          lat: data.location.latitude,
          lng: data.location.longitude
        });
      }
    };

    socket.on('captain-location-update', handleLocationUpdate);
    return () => socket.off('captain-location-update', handleLocationUpdate);
  }, [socket, captain]);

  useEffect(() => {
    if (!isLoaded || !pickup || !destination) return;
    if (routeData.lastPickup === pickup && 
        routeData.lastDestination === destination && 
        directionsResponse) return;

    const calculateRoute = async () => {
      try {
        const directionsService = new window.google.maps.DirectionsService();
        const result = await directionsService.route({
          origin: pickup,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });
        
        setDirectionsResponse(result);
        setDistance(result.routes[0].legs[0].distance.text);
        setDuration(result.routes[0].legs[0].duration.text);
        setRouteData({ lastPickup: pickup, lastDestination: destination });

        if (map && captainLocation) {
          const bounds = new window.google.maps.LatLngBounds();
          result.routes[0].legs[0].steps.forEach(step => {
            bounds.extend(step.start_location);
            bounds.extend(step.end_location);
          });
          bounds.extend(new window.google.maps.LatLng(
            captainLocation.lat,
            captainLocation.lng
          ));
          map.fitBounds(bounds);
        }
      } catch (error) {
        console.error('Direction Service error:', error);
      }
    };

    calculateRoute();
  }, [isLoaded, pickup, destination, map, captainLocation]);

  // Add a useEffect to preserve map center on panel toggle
  useEffect(() => {
    if (map && directionsResponse) {
      const bounds = new window.google.maps.LatLngBounds()
      directionsResponse.routes[0].legs[0].steps.forEach(step => {
        bounds.extend(step.start_location)
        bounds.extend(step.end_location)
      })
      map.fitBounds(bounds)
    }
  }, [directionsResponse]); // Remove map dependency

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div>Loading maps...</div>

  return (
    <div className="relative flex flex-col h-screen w-screen">
      <div className="absolute inset-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={centerLocation}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {captainLocation && (
            <Marker
              position={captainLocation}
              icon={{
                url: '/car-icon.png',
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20) // Center the icon
              }}
            />
          )}

          {pickup && (
            <Marker
              position={typeof pickup === 'string' ? 
                // Convert pickup string to coordinates if needed
                { lat: parseFloat(pickup.split(',')[0]), lng: parseFloat(pickup.split(',')[1]) } 
                : pickup
              }
              icon={{
                url: '/pickup-location.png',
                scaledSize: new window.google.maps.Size(32, 32)
              }}
            />
          )}

          {destination && (
            <Marker
              position={typeof destination === 'string' ? 
                { lat: parseFloat(destination.split(',')[0]), lng: parseFloat(destination.split(',')[1]) }
                : destination
              }
              icon={{
                url: '/destination-location.png',
                scaledSize: new window.google.maps.Size(32, 32)
              }}
            />
          )}
          {userLocation && !pickup && (
            <Marker
              position={userLocation}
              icon={{
                url: '/user-location.png',
                scaledSize: new window.google.maps.Size(32, 32)
              }}
            />
          )}
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </div>

      <div className="absolute top-4 right-4 bg-white p-4 py-2 rounded-full shadow-md max-w-sm z-10">
        {!pickup && !destination && (
          <p className="text-gray-700 mb-2"><i className="ri-user-location-line"></i></p>
        )}
        {distance && <p className="text-gray-700 text-xs">Distance: {distance}</p>}
        {duration && <p className="text-gray-700 text-xs">Time: {duration}</p>}
      </div>
    </div>
  )
}

export default LiveTracking
