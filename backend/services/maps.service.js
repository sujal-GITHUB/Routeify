const axios = require('axios');
const mapbox = require('@mapbox/mapbox-sdk');
const mapboxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxDirections = require('@mapbox/mapbox-sdk/services/directions');
const mapboxIsochrone = require('@mapbox/mapbox-sdk/services/isochrone');
const captainModel = require('../models/captain.model');

// Initialize Mapbox services - will be initialized per request
let mapboxClient = null;
let geocodingService = null;
let directionsService = null;
let isochroneService = null;

// Function to initialize Mapbox services
const initializeMapboxServices = () => {
    if (!mapboxClient) {
        const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error('Mapbox access token is not configured. Please set MAPBOX_ACCESS_TOKEN in your environment variables.');
        }
        
        mapboxClient = mapbox({ accessToken });
        geocodingService = mapboxGeocoding(mapboxClient);
        directionsService = mapboxDirections(mapboxClient);
        isochroneService = mapboxIsochrone(mapboxClient);
    }
    return { mapboxClient, geocodingService, directionsService, isochroneService };
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lon1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lon2 - Second point longitude
 * @returns {number} - Distance in kilometers
 */
module.exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
};

/**
 * Retrieves the coordinates and formatted address for a given address using the Mapbox Geocoding API.
 * 
 * @param {string} address - The address to geocode.
 * @returns {Promise<object>} - An object containing latitude, longitude, and the formatted address.
 * @throws {Error} - Throws an error if the API key is not set, if the API response fails, or if no coordinates are found.
 */
module.exports.getAddressCoordinate = async (address) => {
    try {
        // Initialize Mapbox services
        const { geocodingService } = initializeMapboxServices();
        
        if (!geocodingService) {
            throw new Error('Failed to initialize Mapbox geocoding service');
        }

        const response = await geocodingService.forwardGeocode({
            query: address,
            limit: 1,
            countries: ['IN'], // Focus on India
            types: ['address', 'poi', 'place']
        }).send();

        if (!response.body || !response.body.features || response.body.features.length === 0) {
            throw new Error('No coordinates found for the provided address.');
        }

        const feature = response.body.features[0];
        const [longitude, latitude] = feature.center;

        return {
            latitude: latitude,
            longitude: longitude,
            formatted_address: feature.place_name || address
        };

    } catch (error) {
        throw new Error(error.message || 'An error occurred while fetching coordinates.');
    }
};

/**
 * Retrieves the distance and travel time between two locations using the Mapbox Directions API.
 * 
 * @param {string} origin - The starting location.
 * @param {string} destination - The target location.
 * @returns {Promise<object>} - An object containing distance and duration.
 * @throws {Error} - Throws an error if inputs are invalid or API call fails.
 */
module.exports.getDistanceTimeFromCoords = async (originLat, originLng, destLat, destLng) => {
    try {
        const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error('Mapbox access token is not configured. Please set MAPBOX_ACCESS_TOKEN in your environment variables.');
        }

        // Initialize Mapbox services
        const { directionsService } = initializeMapboxServices();
        
        const response = await directionsService.getDirections({
            profile: 'driving',
            waypoints: [
                {
                    coordinates: [originLng, originLat]
                },
                {
                    coordinates: [destLng, destLat]
                }
            ],
            alternatives: false,
            geometries: 'geojson'
        }).send();

        if (!response.body.routes || response.body.routes.length === 0) {
            throw new Error('No route found between the specified coordinates.');
        }

        const route = response.body.routes[0];
        const distance = route.distance; // in meters
        const duration = route.duration; // in seconds

        return {
            distance: `${(distance / 1000).toFixed(1)} km`,
            duration: `${Math.round(duration / 60)} min`,
            route: route.geometry,
            distance_meters: distance,
            duration_seconds: duration
        };
    } catch (error) {
        throw new Error(error.message || 'An error occurred while calculating distance and time from coordinates.');
    }
};

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Both origin and destination are required.');
    }

    try {
        const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error('Mapbox access token is not configured. Please set MAPBOX_ACCESS_TOKEN in your environment variables.');
        }

        // First, get coordinates for both origin and destination
        const [originCoords, destCoords] = await Promise.all([
            module.exports.getAddressCoordinate(origin),
            module.exports.getAddressCoordinate(destination)
        ]);

        // Initialize Mapbox services
        const { directionsService } = initializeMapboxServices();
        
        const response = await directionsService.getDirections({
            profile: 'driving',
            waypoints: [
                {
                    coordinates: [originCoords.longitude, originCoords.latitude]
                },
                {
                    coordinates: [destCoords.longitude, destCoords.latitude]
                }
            ],
            alternatives: false,
            geometries: 'geojson'
        }).send();

        if (!response.body || !response.body.routes || response.body.routes.length === 0) {
            throw new Error('No valid route found between the provided places.');
        }

        const route = response.body.routes[0];

        // Convert distance from meters to kilometers and format
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMinutes = Math.round(route.duration / 60);

        return {
            distance: `${distanceKm} km`,
            duration: `${durationMinutes} min`
        };

    } catch (error) {
        throw new Error(error.message || 'An error occurred while fetching distance and time.');
    }
};

/**
 * Retrieves place suggestions based on a partial address input using the Mapbox Geocoding API.
 * 
 * @param {string} address - The partial address input.
 * @param {number} userLat - User's current latitude (optional).
 * @param {number} userLon - User's current longitude (optional).
 * @returns {Promise<object[]>} - An array of suggested locations with distance information.
 * @throws {Error} - Throws an error if API call fails.
 */
module.exports.getSuggestions = async (address, userLat = null, userLon = null, sessionToken = null) => {
    if (!address) {
        throw new Error('Address is required.');
    }

    try {
        const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error('Mapbox access token is not configured.');
        }

        // Generate session token if not provided
        const crypto = require('crypto');
        const uuid = sessionToken || crypto.randomUUID();
        
        // Build Search Box API URL
        const baseUrl = 'https://api.mapbox.com/search/searchbox/v1/suggest';
        const params = new URLSearchParams({
            q: address,
            access_token: accessToken,
            session_token: uuid,
            language: 'en',
            limit: '10',
            country: 'IN', // Focus on India
            types: 'address,poi,place'
        });

        // Add proximity bias if user location is provided
        if (userLat && userLon) {
            params.set('proximity', `${userLon},${userLat}`);
            // Add origin parameter for accurate distance calculation
            params.set('origin', `${userLon},${userLat}`);
        }

        const url = `${baseUrl}?${params.toString()}`;
        
        // Make request to Search Box API
        const response = await axios.get(url);

        if (!response.data || !response.data.suggestions) {
            return [];
        }

        // Process suggestions and add distance if user location is provided
        const suggestions = response.data.suggestions.map(suggestion => {
            const result = {
                mapbox_id: suggestion.mapbox_id,
                name: suggestion.name,
                formatted: suggestion.full_address || suggestion.place_formatted || suggestion.name,
                feature_type: suggestion.feature_type,
                distance: null
            };

            // Use provided distance from Mapbox API if available
            if (suggestion.distance) {
                result.distance = suggestion.distance / 1000; // Convert meters to km
            }

            return result;
        });

        // Sort by distance and relevance if user location is provided
        if (userLat && userLon) {
            const maxDistance = 100; // 100km max distance
            
            const localSuggestions = suggestions.filter(s => 
                s.distance === null || s.distance <= maxDistance
            );
            
            localSuggestions.sort((a, b) => {
                // Prioritize results with distance calculations
                if (a.distance === null && b.distance === null) return 0;
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                
                // Sort by distance
                return a.distance - b.distance;
            });
            
            // Limit to top 8 most relevant results
            return localSuggestions.slice(0, 8);
        }

        return suggestions.slice(0, 8);
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'An error occurred while fetching suggestions.');
    }
};

/**
 * Retrieves detailed information about a feature using the Mapbox Search Box API.
 * 
 * @param {string} mapboxId - The mapbox_id from a suggestion.
 * @param {string} sessionToken - Session token for grouping requests.
 * @returns {Promise<object>} - Detailed feature information including coordinates.
 * @throws {Error} - Throws an error if API call fails.
 */
module.exports.getFeatureDetails = async (mapboxId, sessionToken) => {
    if (!mapboxId || !sessionToken) {
        throw new Error('Mapbox ID and session token are required.');
    }

    try {
        const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error('Mapbox access token is not configured.');
        }

        // Build Search Box API URL
        const baseUrl = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}`;
        const params = new URLSearchParams({
            access_token: accessToken,
            session_token: sessionToken,
            language: 'en'
        });

        const url = `${baseUrl}?${params.toString()}`;
        
        // Make request to Search Box API
        const response = await axios.get(url);

        if (!response.data || !response.data.features || response.data.features.length === 0) {
            throw new Error('No feature details found.');
        }

            const feature = response.data.features[0];
            const properties = feature.properties;
            
            // Coordinates are in properties.coordinates (not geometry.coordinates)
            const latitude = properties.coordinates.latitude;
            const longitude = properties.coordinates.longitude;

            // Validate coordinates
            if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
                isNaN(latitude) || isNaN(longitude)) {
                throw new Error('Invalid coordinates received from Mapbox API');
            }

            return {
                name: properties.name,
                formatted: properties.full_address || properties.place_formatted || properties.name,
                latitude: latitude,
                longitude: longitude,
                feature_type: properties.feature_type,
                address: properties.address,
                context: properties.context,
                accuracy: properties.coordinates?.accuracy || null,
                bbox: properties.bbox
            };
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'An error occurred while retrieving feature details.');
    }
};

/**
 * Finds captains within a specified radius using MongoDB's geospatial query.
 * 
 * @param {number} latitude - The latitude of the search center.
 * @param {number} longitude - The longitude of the search center.
 * @param {number} radius - The search radius in **kilometers**.
 * @returns {Promise<Array>} - An array of captains within the given radius.
 */
module.exports.getCaptainsInTheRadius = async (latitude, longitude, radius) => {
    try {
        if (!latitude || !longitude || !radius) {
            throw new Error('Latitude, longitude, and radius are required.');
        }

        const radiusInMeters = radius * 1000; // Convert km to meters

        const captains = await captainModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude] 
                    },
                    $maxDistance: radiusInMeters
                }
            },
            status: 'active'  // Only find active captains
        });

        return captains;
    } catch (error) {
        throw new Error(error.message || 'An error occurred while fetching captains.');
    }
};

/**
 * Calculates ETA from captain's location to pickup point using Mapbox Directions API.
 * 
 * @param {number} captainLat - Captain's latitude.
 * @param {number} captainLong - Captain's longitude.
 * @param {string} pickup - Pickup location address.
 * @returns {Promise<object>} - An object containing ETA, distance, and duration.
 * @throws {Error} - Throws an error if inputs are invalid or API call fails.
 */
module.exports.calculateETA = async (captainLat, captainLong, pickup) => {
    if (!captainLat || !captainLong || !pickup) {
        throw new Error('Captain coordinates and pickup location are required.');
    }

    try {
        const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('❌ MAPBOX_ACCESS_TOKEN not found in environment variables');
            throw new Error('Mapbox access token is not configured. Please set MAPBOX_ACCESS_TOKEN in your environment variables.');
        }

        // Get coordinates for pickup location
        const pickupCoords = await module.exports.getAddressCoordinate(pickup);
        
        // Initialize Mapbox services
        const { directionsService } = initializeMapboxServices();
        
        if (!directionsService) {
            throw new Error('Failed to initialize Mapbox directions service');
        }
        
        const response = await directionsService.getDirections({
            profile: 'driving',
            waypoints: [
                {
                    coordinates: [parseFloat(captainLong), parseFloat(captainLat)]
                },
                {
                    coordinates: [parseFloat(pickupCoords.longitude), parseFloat(pickupCoords.latitude)]
                }
            ],
            alternatives: false
        }).send();

        if (!response.body || !response.body.routes || response.body.routes.length === 0) {
            throw new Error('No valid route found to the pickup location.');
        }

        const route = response.body.routes[0];

        const durationSeconds = route.duration;
        const etaMinutes = Math.ceil(durationSeconds / 60);
        const distanceKm = (route.distance / 1000).toFixed(1);

        return {
            eta: etaMinutes,
            distance: `${distanceKm} km`,
            durationText: `${etaMinutes} min`
        };

    } catch (error) {
        throw new Error(error.message || 'An error occurred while calculating ETA.');
    }
};

/**
 * Reverse geocoding - converts coordinates to address using Mapbox Geocoding API.
 * 
 * @param {number} latitude - The latitude coordinate.
 * @param {number} longitude - The longitude coordinate.
 * @returns {Promise<object>} - An object containing the formatted address.
 * @throws {Error} - Throws an error if inputs are invalid or API call fails.
 */
module.exports.reverseGeocode = async (latitude, longitude) => {
    if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required.');
    }

    try {
        // Initialize Mapbox services
        const { geocodingService } = initializeMapboxServices();

        const response = await geocodingService.reverseGeocode({
            query: [longitude, latitude],
            limit: 1,
            types: ['address', 'poi', 'place']
        }).send();

        if (!response.body || !response.body.features || response.body.features.length === 0) {
            throw new Error('No address found for the provided coordinates.');
        }

        const feature = response.body.features[0];
        const context = feature.context || [];

        // Extract address components from context
        const addressComponents = {};
        context.forEach(item => {
            if (item.id.startsWith('place')) addressComponents.city = item.text;
            if (item.id.startsWith('district')) addressComponents.district = item.text;
            if (item.id.startsWith('region')) addressComponents.state = item.text;
            if (item.id.startsWith('country')) addressComponents.country = item.text;
            if (item.id.startsWith('postcode')) addressComponents.postal_code = item.text;
        });

        return {
            formatted_address: feature.place_name || 'Unknown location',
            address_components: {
                street: feature.text || '',
                city: addressComponents.city || '',
                state: addressComponents.state || '',
                country: addressComponents.country || '',
                postal_code: addressComponents.postal_code || ''
            }
        };

    } catch (error) {
        throw new Error(error.message || 'An error occurred while reverse geocoding.');
    }
};

/**
 * Gets route geometry between two points using Mapbox Directions API.
 * 
 * @param {number} lat1 - Starting latitude.
 * @param {number} lon1 - Starting longitude.
 * @param {number} lat2 - Destination latitude.
 * @param {number} lon2 - Destination longitude.
 * @param {string} profile - Travel mode: 'driving', 'walking', 'cycling'.
 * @returns {Promise<object>} - An object containing the route geometry and properties.
 * @throws {Error} - Throws an error if inputs are invalid or API call fails.
 */
module.exports.getRoute = async (lat1, lon1, lat2, lon2, profile = 'driving') => {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
        throw new Error('All coordinates are required.');
    }

    try {
        const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error('Mapbox access token is not configured. Please set MAPBOX_ACCESS_TOKEN in your environment variables.');
        }

        // Initialize Mapbox services
        const { directionsService } = initializeMapboxServices();
        
        const response = await directionsService.getDirections({
            profile: profile,
            waypoints: [
                {
                    coordinates: [lon1, lat1]
                },
                {
                    coordinates: [lon2, lat2]
                }
            ],
            alternatives: false,
            geometries: 'geojson'
        }).send();

        if (!response.body || !response.body.routes || response.body.routes.length === 0) {
            throw new Error('No valid route found between the provided coordinates.');
        }

        const route = response.body.routes[0];

        return {
            geometry: route.geometry,
            distance: route.distance,
            duration: route.duration,
            profile: profile
        };

    } catch (error) {
        throw new Error(error.message || 'An error occurred while getting route.');
    }
};