import React, { useState } from 'react';
import MapboxMap from './MapboxMap';
import AddressAutocomplete from './AddressAutocomplete';

const MapboxExample = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([77.2090, 28.6139]); // Delhi, India
  const [mapZoom, setMapZoom] = useState(13);
  const [mapStyle, setMapStyle] = useState('streets');

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setMapCenter([location.longitude, location.latitude]);
    setMapZoom(15);
  };

  const handlePickupSelect = (location) => {
    setPickupLocation(location);
  };

  const handleDestinationSelect = (location) => {
    setDestinationLocation(location);
  };

  const markers = [];
  
  if (pickupLocation) {
    markers.push({
      latitude: pickupLocation.latitude,
      longitude: pickupLocation.longitude,
      color: '#10B981',
      size: 20,
      popup: `Pickup: ${pickupLocation.address}`
    });
  }

  if (destinationLocation) {
    markers.push({
      latitude: destinationLocation.latitude,
      longitude: destinationLocation.longitude,
      color: '#EF4444',
      size: 20,
      popup: `Destination: ${destinationLocation.address}`
    });
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mapbox Integration Example</h1>
        
        {/* Map Style Selector */}
        <div className="flex gap-2 mb-4">
          <label className="text-sm font-medium text-gray-700">Map Style:</label>
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="streets">Streets</option>
            <option value="outdoors">Outdoors</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="satellite">Satellite</option>
          </select>
        </div>

        {/* Address Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location
            </label>
            <AddressAutocomplete
              placeholder="Enter pickup address..."
              onAddressSelect={handlePickupSelect}
            />
            {pickupLocation && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Selected:</strong> {pickupLocation.address}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Location
            </label>
            <AddressAutocomplete
              placeholder="Enter destination address..."
              onAddressSelect={handleDestinationSelect}
            />
            {destinationLocation && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Selected:</strong> {destinationLocation.address}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapboxMap
          center={mapCenter}
          zoom={mapZoom}
          style={mapStyle}
          onLocationSelect={handleLocationSelect}
          markers={markers}
          showControls={true}
          className="w-full h-full"
        />
      </div>

      {/* Info Panel */}
      <div className="bg-white border-t p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Selected Location</h3>
            {selectedLocation ? (
              <div className="text-gray-600">
                <p><strong>Address:</strong> {selectedLocation.address}</p>
                <p><strong>Coordinates:</strong> {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}</p>
              </div>
            ) : (
              <p className="text-gray-500">Click on the map to select a location</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Pickup Location</h3>
            {pickupLocation ? (
              <div className="text-gray-600">
                <p><strong>Address:</strong> {pickupLocation.address}</p>
                <p><strong>Coordinates:</strong> {pickupLocation.latitude.toFixed(6)}, {pickupLocation.longitude.toFixed(6)}</p>
              </div>
            ) : (
              <p className="text-gray-500">No pickup location selected</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Destination Location</h3>
            {destinationLocation ? (
              <div className="text-gray-600">
                <p><strong>Address:</strong> {destinationLocation.address}</p>
                <p><strong>Coordinates:</strong> {destinationLocation.latitude.toFixed(6)}, {destinationLocation.longitude.toFixed(6)}</p>
              </div>
            ) : (
              <p className="text-gray-500">No destination selected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapboxExample;
