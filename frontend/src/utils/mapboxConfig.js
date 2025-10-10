import mapboxgl from 'mapbox-gl';

/**
 * Get Mapbox access token from environment variables
 * @returns {string} Mapbox access token
 */
export const getMapboxAccessToken = () => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
  if (!token) {
    console.error('VITE_MAPBOX_ACCESS_TOKEN is not set in environment variables');
    throw new Error('Mapbox access token is required');
  }
  return token;
};

/**
 * Get Mapbox style URL based on style name
 * @param {string} style - Style name (streets, satellite, etc.)
 * @returns {string} Mapbox style URL
 */
export const getMapboxStyle = (style = 'streets') => {
  const styleMap = {
    'streets': 'mapbox://styles/mapbox/streets-v11',
    'satellite': 'mapbox://styles/mapbox/satellite-v9',
    'light': 'mapbox://styles/mapbox/light-v10',
    'dark': 'mapbox://styles/mapbox/dark-v10',
    'outdoors': 'mapbox://styles/mapbox/outdoors-v11'
  };
  
  return styleMap[style] || styleMap['streets'];
};

/**
 * Configure Mapbox to disable analytics and prevent blocked request errors
 * @param {string} accessToken - Mapbox access token
 */
export const configureMapboxAnalytics = (accessToken) => {
  // Set access token
  mapboxgl.accessToken = accessToken;
  
  // Disable analytics by overriding the request function
  const originalRequest = mapboxgl.request;
  mapboxgl.request = function(url, options = {}) {
    // Block analytics requests to prevent ERR_BLOCKED_BY_CLIENT errors
    if (url && (url.includes('events.mapbox.com') || url.includes('api.mapbox.com/events'))) {
      return Promise.resolve({ data: null });
    }
    return originalRequest.call(this, url, options);
  };

  // Alternative method: Override the transformRequest function globally
  if (!mapboxgl._originalTransformRequest) {
    mapboxgl._originalTransformRequest = mapboxgl.Map.prototype._transformRequest;
    mapboxgl.Map.prototype._transformRequest = function(url, resourceType) {
      // Block analytics requests
      if (url && (url.includes('events.mapbox.com') || url.includes('api.mapbox.com/events'))) {
        return null;
      }
      return mapboxgl._originalTransformRequest.call(this, url, resourceType);
    };
  }
};

/**
 * Create a transformRequest function that blocks analytics
 * @returns {Function} transformRequest function
 */
export const createAnalyticsBlockingTransformRequest = () => {
  return (url) => {
    // Block analytics requests to prevent console errors
    if (url && (url.includes('events.mapbox.com') || url.includes('api.mapbox.com/events'))) {
      return null;
    }
    return { url };
  };
};

/**
 * Disable Mapbox telemetry and analytics
 */
export const disableMapboxTelemetry = () => {
  // Disable telemetry
  if (typeof window !== 'undefined') {
    // Block analytics at the network level
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (typeof url === 'string' && (url.includes('events.mapbox.com') || url.includes('api.mapbox.com/events'))) {
        // Return a successful response without making the request
        return Promise.resolve(new Response('{"success": true}', { 
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      return originalFetch.call(this, url, options);
    };

    // Also block XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (typeof url === 'string' && (url.includes('events.mapbox.com') || url.includes('api.mapbox.com/events'))) {
        // Don't make the request
        return;
      }
      return originalXHROpen.call(this, method, url, ...args);
    };
  }
};
