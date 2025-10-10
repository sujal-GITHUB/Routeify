import { useEffect, useContext, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { socketContext } from '../context/socketContext'
import { FaLocationArrow } from 'react-icons/fa'
import { setRideData } from '../actions/rideActions'
import { getDistanceTime, getDistanceTimeFromCoords, getRoute } from '../utils/mapUtils'
import MapboxMap from '../components/Map/MapboxMap'

function Map() {
  const { socket } = useContext(socketContext)
  const rideState = useSelector(state => state.ride)
  const { pickup, destination, captain } = rideState
  const dispatch = useDispatch()

  const [captainLocation, setCaptainLocation] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [markers, setMarkers] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [route, setRoute] = useState(null)

  // Get user's current location if pickup/destination not available
  useEffect(() => {
    if (!pickup || !destination) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
          },
          (error) => {
            console.error('Error getting user location:', error);
            // Fallback to default location (India)
            setUserLocation({ latitude: 20.5937, longitude: 78.9629 });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [pickup, destination]);

  // Captain location update listener
  useEffect(() => {
    if (!socket) return

    socket.on('captain-location-update', async (data) => {
      if (!pickup || !destination) {
        setDistance('')
        setDuration('')
        return
      }

      try {
        setIsCalculating(true)
        
        // Check if we have coordinates for both locations
        const pickupHasCoords = pickup && typeof pickup === 'object' && pickup.latitude && pickup.longitude;
        const destinationHasCoords = destination && typeof destination === 'object' && destination.latitude && destination.longitude;
        
        if (pickupHasCoords && destinationHasCoords) {
          // Use coordinates directly instead of re-geocoding
          const result = await getDistanceTimeFromCoords(
            pickup.latitude, pickup.longitude,
            destination.latitude, destination.longitude
          );
          
          if (result && result.distance && result.duration) {
            setDistance(result.distance);
            setDuration(result.duration);
            // Fetch route geometry for visualization
            try {
              const routeResult = await getRoute(pickup.latitude, pickup.longitude, destination.latitude, destination.longitude);
              if (routeResult && routeResult.geometry) {
                setRoute(routeResult.geometry);
              }
            } catch (routeError) {
              console.error('❌ Error fetching route geometry:', routeError);
            }
          }
        } else {
          // Fallback to address-based calculation
          const pickupAddress = typeof pickup === 'string' ? pickup : pickup?.formatted_address;
          const destinationAddress = typeof destination === 'string' ? destination : destination?.formatted_address;
          const result = await getDistanceTime(pickupAddress, destinationAddress);
          
          if (result && result.distance && result.duration) {
            setDistance(result.distance);
            setDuration(result.duration);
          }
        }
      } catch (error) {
        console.error('❌ Error calculating distance and time:', error)
        setDistance('')
        setDuration('')
      } finally {
        setIsCalculating(false)
      }
    });
  }, [pickup, destination])

  // Calculate center point for map
  const getMapCenter = () => {
    // Validate captain location
    if (captainLocation && captainLocation.longitude && captainLocation.latitude) {
      return [captainLocation.longitude, captainLocation.latitude]
    }
    
    // Validate pickup location
    if (pickup) {
      const lng = pickup.longitude || pickup.lng
      const lat = pickup.latitude || pickup.lat
      if (lng && lat) {
        return [lng, lat]
      }
    }
    
    // Validate user location
    if (userLocation && userLocation.longitude && userLocation.latitude) {
      return [userLocation.longitude, userLocation.latitude]
    }
    
    // Default to India
    return [78.9629, 20.5937]
  }

  return (
    <div className="relative w-screen h-screen">
      <MapboxMap
        center={getMapCenter()}
        zoom={15}
        markers={markers}
        route={route}
        className="w-full h-full"
        onLocationSelect={(location) => {
          console.log('Location selected:', location)
        }}
      />

      <div className="absolute top-4 right-4 bg-white p-4 py-2 rounded-lg shadow-md max-w-sm z-10">
        {!pickup && !destination ? (
          <p className="text-gray-700 mb-2 text-center">
            <i className="ri-user-location-line"></i>
          </p>
        ) : (
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
        )}
      </div>
    </div>
  )
}

export default Map"// Deployment fix - $(date)" 
