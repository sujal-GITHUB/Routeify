const axios = require('axios');

/**
 * Retrieves the coordinates and formatted address for a given address using the GoMaps API.
 * 
 * @param {string} address - The address to geocode.
 **@param {string} origin - The starting location.
 * @param {string} destination - The target location.
 * @returns {Promise<object>} - An object containing latitude, longitude, and the formatted address.
 * @throws {Error} - Throws an error if the API key is not set, if the API response fails, or if no coordinates are found.
 */
module.exports.getAddressCoordinate = async (address) => {
    try {
        // Fetch API key from environment variables
        const apiKey = process.env.GOMAPS_API_KEY;
        if (!apiKey) {
            throw new Error('GoMaps API key is not configured. Please set GOMAPS_API_KEY in your environment variables.');
        }

        // Construct the API URL with the encoded address
        const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        
        // Make the GET request to the API
        const response = await axios.get(url);
        
        // Validate the response
        if (!response.data || response.data.status !== 'OK') {
            throw new Error(response.data?.error_message || 'Failed to geocode address. Please check the address or API key.');
        }

        // Extract location data
        const location = response.data.results[0]?.geometry?.location;
        if (!location) {
            throw new Error('No coordinates found for the provided address.');
        }

        // Return the result
        return {
            latitude: location.lat,
            longitude: location.lng,
            formatted_address: response.data.results[0].formatted_address
        };
        
    } catch (error) {
        // Handle and rethrow errors
        if (error.response) {
            throw new Error(`GoMaps API error: ${error.response.data.error_message || 'Unknown error occurred.'}`);
        }
        throw new Error(error.message || 'An error occurred while fetching coordinates.');
    }
};

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Both origin and destination are required.');
    }

    try {
        // Fetch API key from environment variables
        const apiKey = process.env.GOMAPS_API_KEY;
        if (!apiKey) {
            throw new Error('GoMaps API key is not configured. Please set GOMAPS_API_KEY in your environment variables.');
        }

        // Construct the API URL with the encoded place names
        const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
        
        // Make the GET request to the API
        const response = await axios.get(url);

        // Validate the API response
        if (!response.data || response.data.status !== 'OK') {
            throw new Error(response.data?.error_message || 'Failed to get distance and time. Please check the place names or API key.');
        }

        // Extract distance and duration data
        const element = response.data.rows?.[0]?.elements?.[0];
        if (!element || element.status !== 'OK') {
            throw new Error('No valid route found between the provided places.');
        }

        // Return the result
        return {
            distance: element.distance.text, // Human-readable distance (e.g., "10 km")
            duration: element.duration.text  // Human-readable duration (e.g., "15 mins")
        };

    } catch (error) {
        // Handle and rethrow errors
        if (error.response) {
            throw new Error(`GoMaps API error: ${error.response.data.error_message || 'Unknown error occurred.'}`);
        }
        throw new Error(error.message || 'An error occurred while fetching distance and time.');
    }
};

module.exports.getSuggestions = async (address) => {
    if (!address) {
        throw new Error('Address is required.');
    }

    const apiKey = process.env.GOMAPS_API_KEY;
    if (!apiKey) {
        throw new Error('GoMaps API key is not configured. Please set GOMAPS_API_KEY in your environment variables.');
    }

    const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&key=${apiKey}`;
    try {
        const response = await axios.get(url);
        if (!response.data || response.data.status !== 'OK') {
            throw new Error(response.data?.error_message || 'Failed to get suggestions. Please check the address or API key.');
        }

        return response.data.predictions.map(prediction => prediction.description);
    } catch (error) {
        if (error.response) {
            throw new Error(`GoMaps API error: ${error.response.data.error_message || 'Unknown error occurred.'}`);
        }
        throw new Error(error.message || 'An error occurred while fetching suggestions.');
    }
}

