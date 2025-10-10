// Map utility functions for Mapbox integration
import { TokenManager } from './tokenManager';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

/**
 * Get coordinates for an address
 * @param {string} address - Address to geocode
 * @returns {Promise<object>} - Coordinates and formatted address
 */
export const getCoordinates = async (address) => {
  try {
    const token = TokenManager.getToken('usertoken') || TokenManager.getToken('captaintoken');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/maps/get-coordinates?address=${encodeURIComponent(address)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get coordinates');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting coordinates:', error);
    throw error;
  }
};

/**
 * Get distance and time between two locations
 * @param {string} origin - Origin address
 * @param {string} destination - Destination address
 * @returns {Promise<object>} - Distance and duration
 */
export const getDistanceTime = async (origin, destination) => {
  try {
    const token = TokenManager.getToken('usertoken') || TokenManager.getToken('captaintoken');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/maps/get-distance-time?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get distance and time');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting distance and time:', error);
    throw error;
  }
};

export const getDistanceTimeFromCoords = async (originLat, originLng, destLat, destLng) => {
  try {
    const token = TokenManager.getToken('usertoken') || TokenManager.getToken('captaintoken');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/maps/get-distance-time-from-coords?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get distance and time from coordinates');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting distance and time from coordinates:', error);
    throw error;
  }
};

/**
 * Generate a session token for Search Box API
 * @returns {string} - UUID session token
 */
const generateSessionToken = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Get address suggestions for autocomplete using Search Box API
 * @param {string} query - Partial address query
 * @param {number} userLat - User latitude (optional)
 * @param {number} userLon - User longitude (optional)
 * @param {string} sessionToken - Session token (optional, will generate if not provided)
 * @returns {Promise<Array>} - Array of address suggestions
 */
export const getAddressSuggestions = async (query, userLat = null, userLon = null, sessionToken = null) => {
  try {
    const token = TokenManager.getToken('usertoken') || TokenManager.getToken('captaintoken');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const uuid = sessionToken || generateSessionToken();
    
    let url = `${BASE_URL}/maps/get-suggestions?address=${encodeURIComponent(query)}&session_token=${uuid}`;
    
    if (userLat && userLon) {
      url += `&userLat=${userLat}&userLon=${userLon}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get suggestions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting suggestions:', error);
    throw error;
  }
};

/**
 * Get detailed feature information from Search Box API
 * @param {string} mapboxId - Mapbox ID from suggestion
 * @param {string} sessionToken - Session token
 * @returns {Promise<Object>} - Detailed feature information
 */
export const getFeatureDetails = async (mapboxId, sessionToken) => {
  try {
    const token = TokenManager.getToken('usertoken') || TokenManager.getToken('captaintoken');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/maps/get-feature-details?mapbox_id=${encodeURIComponent(mapboxId)}&session_token=${encodeURIComponent(sessionToken)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get feature details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting feature details:', error);
    throw error;
  }
};

/**
 * Calculate ETA from captain location to pickup
 * @param {number} captainLat - Captain latitude
 * @param {number} captainLong - Captain longitude
 * @param {string} pickup - Pickup address
 * @returns {Promise<object>} - ETA information
 */
export const calculateETA = async (captainLat, captainLong, pickup) => {
  try {
    const token = TokenManager.getToken('usertoken') || TokenManager.getToken('captaintoken');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/maps/calculate-ETA?captainLat=${captainLat}&captainLong=${captainLong}&pickup=${encodeURIComponent(pickup)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to calculate ETA');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calculating ETA:', error);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} - Address information
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const token = TokenManager.getToken('usertoken') || TokenManager.getToken('captaintoken');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/maps/reverse-geocode?lat=${lat}&lon=${lon}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to reverse geocode');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
};

/**
 * Get route between two points
 * @param {number} lat1 - Starting latitude
 * @param {number} lon1 - Starting longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lon2 - Destination longitude
 * @param {string} profile - Travel mode
 * @returns {Promise<object>} - Route information
 */
export const getRoute = async (lat1, lon1, lat2, lon2, profile = 'driving') => {
  try {
    const token = TokenManager.getToken('usertoken') || TokenManager.getToken('captaintoken');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/maps/get-route?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&profile=${profile}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get route');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting route:', error);
    throw error;
  }
};

/**
 * Get user's current location
 * @returns {Promise<object>} - Current location coordinates
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lon1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lon2 - Second point longitude
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} - Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * Format duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
};

/**
 * Create a marker element for Mapbox
 * @param {string} color - Marker color
 * @param {number} size - Marker size
 * @returns {HTMLElement} - Marker element
 */
export const createMarkerElement = (color = '#3B82F6', size = 20) => {
  const el = document.createElement('div');
  el.className = 'mapbox-marker';
  el.style.cssText = `
    background-color: ${color};
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
  `;
  return el;
};

/**
 * Create a popup for Mapbox markers
 * @param {string} content - Popup content
 * @returns {object} - Popup options
 */
export const createPopup = (content) => {
  return {
    closeButton: true,
    closeOnClick: false,
    className: 'mapbox-popup'
  };
};

/**
 * Get Mapbox access token
 * @returns {string} - Mapbox access token
 */
export const getMapboxAccessToken = () => {
  return MAPBOX_ACCESS_TOKEN;
};

/**
 * Get Mapbox style URL
 * @param {string} style - Map style (streets, outdoors, light, dark, satellite)
 * @returns {string} - Mapbox style URL
 */
export const getMapboxStyle = (style = 'streets') => {
  const styles = {
    streets: 'mapbox://styles/mapbox/streets-v12',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
  };
  return styles[style] || styles.streets;
};