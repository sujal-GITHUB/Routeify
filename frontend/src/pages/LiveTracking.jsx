import { useEffect, useContext, useRef, useState, useCallback } from 'react'
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
  const mapRef = useRef(null)
  const { socket } = useContext(socketContext)
  const rideState = useSelector(state => state.ride)
  const { pickup, destination, captain } = rideState

  const [map, setMap] = useState(null)
  const [captainLocation, setCaptainLocation] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  // Get user's current location if pickup/destination not available
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
            // Fallback to default location (India)
            setUserLocation({ lat: 20.5937, lng: 78.9629 });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [pickup, destination]);

  const onLoad = useCallback(map => {
    mapRef.current = map
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    mapRef.current = null
    setMap(null)
  }, [])

  // Captain location update listener
  useEffect(() => {
    if (!socket) return

    socket.on('captain-location-update', (data) => {
      console.log('Captain location updated:', data)
      if (data.location) {
        setCaptainLocation({
          lat: data.location.latitude,
          lng: data.location.longitude
        })
      }
    })

    return () => socket.off('captain-location-update')
  }, [socket])

  // Route calculation
  useEffect(() => {
    if (!isLoaded || (!pickup && !userLocation) || !destination) return

    const calculateRoute = async () => {
      const directionsService = new window.google.maps.DirectionsService()
      
      try {
        const result = await directionsService.route({
          origin: pickup || userLocation,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        })
        
        setDirectionsResponse(result)
        setDistance(result.routes[0].legs[0].distance.text)
        setDuration(result.routes[0].legs[0].duration.text)
      } catch (error) {
        console.error('Direction Service error:', error)
      }
    }

    calculateRoute()
  }, [isLoaded, pickup, destination, userLocation])

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div>Loading maps...</div>

  const centerLocation = captainLocation || userLocation || { lat: 20.5937, lng: 78.9629 }

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
                scaledSize: new window.google.maps.Size(40, 40)
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
        {duration && <p className="text-gray-700 text-xs">ETA: {duration}</p>}
      </div>
    </div>
  )
}

export default LiveTracking