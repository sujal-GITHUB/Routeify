const mapsService = require('../services/maps.service');
const {validationResult} = require('express-validator');

const getCoordinates = async (req, res) => {
    try {
        const { address } = req.query;
        const coordinates = await mapsService.getAddressCoordinate(address);
        res.status(200).json(coordinates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDistanceTime = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {origin, destination} = req.query;
        const distanceTime = await mapsService.getDistanceTime(origin, destination);
        res.status(200).json(distanceTime);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDistanceTimeFromCoords = async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng } = req.query;
        
        // Validate coordinates
        if (!originLat || !originLng || !destLat || !destLng) {
            return res.status(400).json({ message: 'All coordinates are required' });
        }

        const result = await mapsService.getDistanceTimeFromCoords(
            parseFloat(originLat), 
            parseFloat(originLng), 
            parseFloat(destLat), 
            parseFloat(destLng)
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSuggestions = async (req, res) => {
    try {
        const { address, userLat, userLon, session_token } = req.query;
        
        // Parse user location if provided
        const latitude = userLat ? parseFloat(userLat) : null;
        const longitude = userLon ? parseFloat(userLon) : null;
        
        const suggestions = await mapsService.getSuggestions(address, latitude, longitude, session_token);
        res.status(200).json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getFeatureDetails = async (req, res) => {
    try {
        const { mapbox_id, session_token } = req.query;
        
        if (!mapbox_id || !session_token) {
            return res.status(400).json({ 
                message: 'Mapbox ID and session token are required' 
            });
        }
        
        const featureDetails = await mapsService.getFeatureDetails(mapbox_id, session_token);
        res.status(200).json(featureDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const calculateETA = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { captainLat, captainLong, pickup } = req.query;
        
        if (!captainLat || !captainLong || !pickup) {
            return res.status(400).json({ 
                success: false, 
                message: 'Captain coordinates and pickup location are required' 
            });
        }
        
        const result = await mapsService.calculateETA(captainLat, captainLong, pickup);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to calculate ETA' 
        });
    }
};

const reverseGeocode = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({ 
                success: false, 
                message: 'Latitude and longitude are required' 
            });
        }
        
        const result = await mapsService.reverseGeocode(parseFloat(lat), parseFloat(lon));
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to reverse geocode' 
        });
    }
};

const getRoute = async (req, res) => {
    try {
        const { lat1, lon1, lat2, lon2, profile = 'driving' } = req.query;
        
        if (!lat1 || !lon1 || !lat2 || !lon2) {
            return res.status(400).json({ 
                success: false, 
                message: 'All coordinates are required' 
            });
        }
        
        const result = await mapsService.getRoute(
            parseFloat(lat1), 
            parseFloat(lon1), 
            parseFloat(lat2), 
            parseFloat(lon2), 
            profile
        );
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to get route' 
        });
    }
};

const getIsoline = async (req, res) => {
    try {
        const { lat, lon, type = 'time', mode = 'drive', range = 900 } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({ 
                success: false, 
                message: 'Latitude and longitude are required' 
            });
        }
        
        const result = await mapsService.getIsoline(
            parseFloat(lat), 
            parseFloat(lon), 
            type, 
            mode, 
            parseInt(range)
        );
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to calculate isoline' 
        });
    }
};

module.exports = {
    getCoordinates,
    getDistanceTime,
    getDistanceTimeFromCoords,
    getSuggestions,
    getFeatureDetails,
    calculateETA,
    reverseGeocode,
    getRoute,
    getIsoline
};
