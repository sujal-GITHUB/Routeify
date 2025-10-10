import React, { useState, useEffect } from 'react';
import MapboxMap from './MapboxMap';

const MapboxTest = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Mapbox GL is loaded
    const checkMapbox = () => {
      try {
        if (window.mapboxgl) {
          setIsLoaded(true);
        } else {
          setError('Mapbox GL JS not found');
        }
      } catch (err) {
        setError(`Error loading Mapbox: ${err.message}`);
      }
    };

    // Wait a bit for the module to load
    setTimeout(checkMapbox, 1000);
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Mapbox Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-yellow-800 font-semibold">Loading Mapbox...</h3>
        <p className="text-yellow-600">Please wait while Mapbox GL JS loads</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-green-800 font-semibold">✅ Mapbox GL JS Loaded Successfully!</h3>
        <p className="text-green-600">The Mapbox integration is working properly.</p>
      </div>
      
      <div className="h-96 border border-gray-200 rounded-lg">
        <MapboxMap
          center={[77.2090, 28.6139]} // Delhi, India
          zoom={10}
          style="streets"
          markers={[
            {
              latitude: 28.6139,
              longitude: 77.2090,
              color: '#3B82F6',
              popup: 'Test Marker - Delhi, India'
            }
          ]}
          onLocationSelect={(location) => {
          }}
          className="w-full h-full"
        />
      </div>
      
      <div className="text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Click on the map to select a location</li>
          <li>Use the zoom controls to navigate</li>
          <li>Check the browser console for location data</li>
        </ul>
      </div>
    </div>
  );
};

export default MapboxTest;
