import React, { useState } from 'react';
import MapboxMap from './MapboxMap';
import AddressAutocomplete from './AddressAutocomplete';
import { getDistanceTime, calculateETA } from '../../utils/mapUtils';

const MapExample = () => {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [etaInfo, setEtaInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickupSelect = (location) => {
    setPickupLocation(location);
    if (destinationLocation) {
      calculateDistance();
    }
  };

  const handleDestinationSelect = (location) => {
    setDestinationLocation(location);
    if (pickupLocation) {
      calculateDistance();
    }
  };

  const calculateDistance = async () => {
    if (!pickupLocation || !destinationLocation) return;

    try {
      setIsLoading(true);
      const result = await getDistanceTime(
        pickupLocation.address,
        destinationLocation.address
      );
      setDistanceInfo(result);
    } catch (error) {
      console.error('Error calculating distance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateETAToPickup = async () => {
    if (!pickupLocation) return;

    try {
      setIsLoading(true);
      // Example captain location (you would get this from your captain data)
      const captainLat = 51.5074;
      const captainLon = -0.1278;
      
      const result = await calculateETA(
        captainLat,
        captainLon,
        pickupLocation.address
      );
      setEtaInfo(result);
    } catch (error) {
      console.error('Error calculating ETA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markers = [
    ...(pickupLocation ? [{
      latitude: pickupLocation.latitude,
      longitude: pickupLocation.longitude,
      color: '#10B981',
      popup: `Pickup: ${pickupLocation.address}`
    }] : []),
    ...(destinationLocation ? [{
      latitude: destinationLocation.latitude,
      longitude: destinationLocation.longitude,
      color: '#EF4444',
      popup: `Destination: ${destinationLocation.address}`
    }] : [])
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mapbox Map Integration</h1>
        <p className="text-gray-600">Interactive map with address autocomplete and routing</p>
      </div>

      {/* Address Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Pickup Location</h3>
          <AddressAutocomplete
            placeholder="Enter pickup address..."
            onAddressSelect={handlePickupSelect}
            className="w-full"
          />
          {pickupLocation && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Selected:</strong> {pickupLocation.address}
              </p>
              <p className="text-xs text-green-600">
                Coordinates: {pickupLocation.latitude?.toFixed(6)}, {pickupLocation.longitude?.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Destination</h3>
          <AddressAutocomplete
            placeholder="Enter destination address..."
            onAddressSelect={handleDestinationSelect}
            className="w-full"
          />
          {destinationLocation && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Selected:</strong> {destinationLocation.address}
              </p>
              <p className="text-xs text-red-600">
                Coordinates: {destinationLocation.latitude?.toFixed(6)}, {destinationLocation.longitude?.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Interactive Map</h3>
        <MapboxMap
          center={pickupLocation && pickupLocation.longitude && pickupLocation.latitude ? [pickupLocation.longitude, pickupLocation.latitude] : [77.2090, 28.6139]}
          zoom={pickupLocation || destinationLocation ? 12 : 10}
          onLocationSelect={(location) => {
            if (!pickupLocation) {
              handlePickupSelect(location);
            } else if (!destinationLocation) {
              handleDestinationSelect(location);
            }
          }}
          markers={markers}
          className="w-full h-96 rounded-lg border border-gray-200"
        />
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distance Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Route Information</h3>
          {isLoading ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : distanceInfo ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Distance: {distanceInfo.distance}</p>
                  <p className="text-sm text-blue-600">Duration: {distanceInfo.duration}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
              Select both pickup and destination to see route information
            </div>
          )}
        </div>

        {/* ETA Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">ETA to Pickup</h3>
            <button
              onClick={calculateETAToPickup}
              disabled={!pickupLocation || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Calculate ETA
            </button>
          </div>
          {etaInfo ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">ETA: {etaInfo.eta} minutes</p>
                  <p className="text-sm text-green-600">Distance: {etaInfo.distance}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
              Click "Calculate ETA" to see estimated arrival time
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">How to use:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Type in the address fields to get autocomplete suggestions</li>
          <li>• Click on the map to select locations directly</li>
          <li>• Select both pickup and destination to see route information</li>
          <li>• Use the location button to center the map on your current position</li>
        </ul>
      </div>
    </div>
  );
};

export default MapExample;

