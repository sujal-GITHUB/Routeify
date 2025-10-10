import { useEffect, useRef, useState, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { getMapboxAccessToken, getMapboxStyle, configureMapboxAnalytics, disableMapboxTelemetry } from '../../utils/mapboxConfig';
import { getCurrentLocation, reverseGeocode } from '../../utils/mapUtils';

const MapboxMap = forwardRef(({ 
  center = [77.2090, 28.6139], // Default to Delhi, India
  zoom = 13, 
  onLocationSelect,
  markers = [],
  route = null, // Route geometry for drawing route lines
  className = "w-full h-full",
  style = 'streets',
  showControls = false
}, ref) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const isInitializedRef = useRef(false);
  const initializationAttemptedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Store props in refs to avoid dependency issues
  const propsRef = useRef({ center, zoom, onLocationSelect, style, showControls });
  useEffect(() => {
    propsRef.current = { center, zoom, onLocationSelect, style, showControls };
  });

  // Configure Mapbox and disable analytics
  useEffect(() => {
    const accessToken = getMapboxAccessToken();
    
    configureMapboxAnalytics(accessToken);
    disableMapboxTelemetry();
  }, []);

  // Removed initializeMap function - logic moved to useEffect

  // Initialize map only once
  useEffect(() => {
    if (initializationAttemptedRef.current) return;
    
    const timer = setTimeout(async () => {
      try {
        initializationAttemptedRef.current = true;
        
        // Check if already initialized or no container
        if (isInitializedRef.current || !mapRef.current) {
          return;
        }

        // Check if container already has a map
        if (mapRef.current._mapboxgl) {
          return;
        }

        // Create map instance
        const currentProps = propsRef.current;
        const mapInstance = new mapboxgl.Map({
          container: mapRef.current,
          style: getMapboxStyle(currentProps.style),
          center: currentProps.center,
          zoom: currentProps.zoom,
          collectResourceTiming: false // Disable analytics
        });

        mapInstanceRef.current = mapInstance;
        isInitializedRef.current = true;

        // Add navigation controls if requested
        if (currentProps.showControls) {
          mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        // Add geolocate control
        const geolocate = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        });
        mapInstance.addControl(geolocate, 'top-right');

        // Handle geolocate events
        geolocate.on('geolocate', (e) => {
          // Location obtained, can be used for other purposes if needed
        });

        // Add click handler
        mapInstance.on('click', async (e) => {
          const { lng, lat } = e.lngLat;
          
          try {
            const address = await reverseGeocode(lng, lat);
            if (currentProps.onLocationSelect) {
              currentProps.onLocationSelect({
                latitude: lat,
                longitude: lng,
                formatted_address: address
              });
            }
          } catch (error) {
            // Silent error handling
          }
        });

        // Wait for map to load
        mapInstance.on('load', () => {
          setIsLoading(false);
        });

        // Handle map load errors
        mapInstance.on('error', (error) => {
          setIsLoading(false);
        });

      } catch (error) {
        setIsLoading(false);
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        isInitializedRef.current = false;
        initializationAttemptedRef.current = false;
      }
    };
  }, []); // Empty dependency array to run only once

  // Handle center and zoom changes without re-initializing
  useEffect(() => {
    if (mapInstanceRef.current && center && zoom) {
      // Validate center coordinates before setting
      if (Array.isArray(center) && center.length === 2 && 
          typeof center[0] === 'number' && typeof center[1] === 'number' &&
          !isNaN(center[0]) && !isNaN(center[1])) {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(zoom);
      }
    }
  }, [center, zoom]);

  // Update markers when they change
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    markers.forEach((marker, index) => {
      if (marker && typeof marker === 'object' && 
          typeof marker.latitude === 'number' && typeof marker.longitude === 'number' &&
          !isNaN(marker.latitude) && !isNaN(marker.longitude)) {
        
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        `;

        new mapboxgl.Marker(markerElement)
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(mapInstanceRef.current);
      }
    });
  }, [markers]);

  useEffect(() => {
    if (mapInstanceRef.current && markers.length > 0) {
      updateMarkers();
    }
  }, [markers, updateMarkers]);

  // Add route line visualization
  useEffect(() => {
    if (!mapInstanceRef.current || !route || isLoading) {
      return;
    }

    const map = mapInstanceRef.current;

    // Remove existing route layer if it exists
    if (map.getLayer && map.getLayer('route')) {
      map.removeLayer('route');
    }
    if (map.getSource && map.getSource('route')) {
      map.removeSource('route');
    }

    // Add route source
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route
      }
    });

    // Add route layer
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    // Cleanup function
    return () => {
      try {
        if (mapInstanceRef.current && mapInstanceRef.current.getLayer && mapInstanceRef.current.getLayer('route')) {
          mapInstanceRef.current.removeLayer('route');
        }
        if (mapInstanceRef.current && mapInstanceRef.current.getSource && mapInstanceRef.current.getSource('route')) {
          mapInstanceRef.current.removeSource('route');
        }
      } catch (error) {
        // Silent error handling
      }
    };
  }, [route, isLoading]);

  const getCurrentLocationHandler = async () => {
    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      
      if (mapInstanceRef.current && location) {
        // Center map on user location
        mapInstanceRef.current.setCenter([location.longitude, location.latitude]);
        mapInstanceRef.current.setZoom(16);

        // Add user location marker
        const userMarkerElement = createMarkerElement('#10B981', 16);
        new mapboxgl.Marker(userMarkerElement)
          .setLngLat([location.longitude, location.latitude])
          .setPopup(new mapboxgl.Popup().setHTML('Your Location'))
          .addTo(mapInstanceRef.current);
      }
    } catch (error) {
      alert('Unable to get your current location. Please check your browser permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const createMarkerElement = (color, size) => {
    const el = document.createElement('div');
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${color};
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: pointer;
    `;
    return el;
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={ref || mapRef} 
        className={className}
        style={{ 
          height: '100%',
          width: '100%'
        }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg z-10">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}

      {/* Control buttons */}
      {!showControls && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={getCurrentLocationHandler}
            disabled={isLoading}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-lg border border-gray-200 transition-colors disabled:opacity-50"
            title="Get current location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-2 rounded-lg text-sm text-gray-600 z-[1000]">
        Click on the map to select a location
      </div>

      {/* Map component ready */}
    </div>
  );
});

MapboxMap.displayName = "MapboxMap";

MapboxMap.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  onLocationSelect: PropTypes.func,
  markers: PropTypes.array,
  route: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.string,
  showControls: PropTypes.bool,
};

export default MapboxMap;