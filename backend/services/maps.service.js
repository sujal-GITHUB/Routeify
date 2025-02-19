const axios = require('axios');
const captainModel = require('../models/captain.model');

/**
 * Retrieves the coordinates and formatted address for a given address using the GoMaps API.
 * 
 * @param {string} address - The address to geocode.
 * @returns {Promise<object>} - An object containing latitude, longitude, and the formatted address.
 * @throws {Error} - Throws an error if the API key is not set, if the API response fails, or if no coordinates are found.
 */
module.exports.getAddressCoordinate = async (address) => {
    try {
        const apiKey = process.env.GOMAPS_API_KEY;
        if (!apiKey) {
            throw new Error('GoMaps API key is not configured. Please set GOMAPS_API_KEY in your environment variables.');
        }

        const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await axios.get(url);

        if (!response.data || response.data.status !== 'OK') {
            throw new Error(response.data?.error_message || 'Failed to geocode address. Please check the address or API key.');
        }

        const location = response.data.results[0]?.geometry?.location;
        if (!location) {
            throw new Error('No coordinates found for the provided address.');
        }

        return {
            latitude: location.lat,
            longitude: location.lng,
            formatted_address: response.data.results[0].formatted_address
        };

    } catch (error) {
        throw new Error(error.response?.data?.error_message || error.message || 'An error occurred while fetching coordinates.');
    }
};

/**
 * Retrieves the distance and travel time between two locations using the GoMaps API.
 * 
 * @param {string} origin - The starting location.
 * @param {string} destination - The target location.
 * @returns {Promise<object>} - An object containing distance and duration.
 * @throws {Error} - Throws an error if inputs are invalid or API call fails.
 */
module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Both origin and destination are required.');
    }

    try {
        const apiKey = process.env.GOMAPS_API_KEY;
        if (!apiKey) {
            throw new Error('GoMaps API key is not configured. Please set GOMAPS_API_KEY in your environment variables.');
        }

        const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
        const response = await axios.get(url);

        if (!response.data || response.data.status !== 'OK') {
            throw new Error(response.data?.error_message || 'Failed to get distance and time. Please check the place names or API key.');
        }

        const element = response.data.rows?.[0]?.elements?.[0];
        if (!element || element.status !== 'OK') {
            throw new Error('No valid route found between the provided places.');
        }

        return {
            distance: element.distance.text,
            duration: element.duration.text
        };

    } catch (error) {
        throw new Error(error.response?.data?.error_message || error.message || 'An error occurred while fetching distance and time.');
    }
};

/**
 * Retrieves place suggestions based on a partial address input using the GoMaps API.
 * 
 * @param {string} address - The partial address input.
 * @returns {Promise<string[]>} - An array of suggested place descriptions.
 * @throws {Error} - Throws an error if API call fails.
 */
module.exports.getSuggestions = async (address) => {
    if (!address) {
        throw new Error('Address is required.');
    }

    try {
        const apiKey = process.env.GOMAPS_API_KEY;
        if (!apiKey) {
            throw new Error('GoMaps API key is not configured. Please set GOMAPS_API_KEY in your environment variables.');
        }

        const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await axios.get(url);

        if (!response.data || response.data.status !== 'OK') {
            throw new Error(response.data?.error_message || 'Failed to get suggestions. Please check the address or API key.');
        }

        return response.data.predictions.map(prediction => prediction.description);
    } catch (error) {
        throw new Error(error.response?.data?.error_message || error.message || 'An error occurred while fetching suggestions.');
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
            }
        });

        return captains;
    } catch (error) {
        throw new Error(error.message || 'An error occurred while fetching captains.');
    }
};



module.exports.calculateETA = async (captainLat, captainLong, pickup) => {
    if (!captainLat || !captainLong || !pickup) {
        throw new Error('Captain coordinates and pickup location are required.');
    }

    try {
        const apiKey = process.env.GOMAPS_API_KEY;
        if (!apiKey) {
            throw new Error('GoMaps API key is not configured. Please set GOMAPS_API_KEY in your environment variables.');
        }

        // Format captain's coordinates in "lat,lng" format for the API
        const origin = `${captainLat},${captainLong}`;
        
        // Destination is the pickup location (could be an address string)
        const destination = pickup;

        const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
        const response = await axios.get(url);

        if (!response.data || response.data.status !== 'OK') {
            throw new Error(response.data?.error_message || 'Failed to calculate ETA. Please check coordinates or API key.');
        }

        const element = response.data.rows?.[0]?.elements?.[0];
        if (!element || element.status !== 'OK') {
            throw new Error('No valid route found to the pickup location.');
        }

        const durationSeconds = element.duration.value;
        const etaMinutes = Math.ceil(durationSeconds / 60);

        return {
            eta: etaMinutes,
            distance: element.distance.text,
            durationText: element.duration.text
        };

    } catch (error) {
        throw new Error(error.response?.data?.error_message || error.message || 'An error occurred while calculating ETA.');
    }
};